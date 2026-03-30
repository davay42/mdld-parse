# MDLD Match — `*` Wildcard Specification

**Status:** Pre-implementation
**Scope:** Single-pass triple pattern matching embedded in MDLD annotations

---

## 1. One Rule

A `*` in any term position of an annotation switches that annotation from
**assertion mode** to **match mode**.

In match mode:
- No quads are emitted
- A pattern is registered with the parser
- Every quad emitted **after this point** is tested against the pattern
- Matching quads are collected with their full origin context

Everything else — prefix resolution, subject chaining, carrier parsing,
block tracking — works identically to assertion mode.

---

## 2. The `*` Token

`*` is valid in three positions:

| Position | Example | Meaning |
|---|---|---|
| Subject | `{=*}` | Match any subject |
| Class | `{.*}` | Match any class |
| Predicate | `{?*}` `{*}` `{!*}` | Match any predicate (form preserved) |
| Object | `{+*}` or literal `[*]` | Match any IRI or literal object |

A `*` in any one position makes the entire annotation a pattern.
Mixing assertion terms and wildcards in the same annotation is valid —
ground terms constrain, `*` terms match anything.

**`*` is not a valid IRI.** The parser detects it before IRI expansion.
An annotation containing `*` never reaches `emitQuad`.

---

## 3. Pattern Shape

A pattern is a triple of constraints, one per RDF position:

```
PatternConstraint = ground IRI | ground literal | * (wildcard)
Pattern = { s: PatternConstraint, p: PatternConstraint, o: PatternConstraint }
```

Match predicate for quad `(qs, qp, qo)` against pattern `(ps, pp, po)`:

```
match(q, pattern) =
  (ps = * ∨ ps = qs.value) ∧
  (pp = * ∨ pp = qp.value) ∧
  (po = * ∨ po = qo.value)
```

O(1) per quad. No state. No joins.

---

## 4. Syntax Mapping

Patterns are written as normal MDLD annotations. Every annotation
that would produce quads has a direct match equivalent.

### Subject wildcard

```md
[anything] {=*}          # match any subject
```
Sets `pattern.s = *`. Does not update `state.currentSubject`.
Subsequent annotations in the same block still see the previous subject.

### Named subject (ground)

```md
[Alice] {=ex:alice} knows [who] {?ex:knows +*}?
```
Sets `pattern.s = ex:alice` (fully expanded IRI). Ground constraint.

### Predicate wildcard

```md
{=ex:alice ?* +ex:bob}   # any predicate connecting alice to bob
{=* *}                   # any literal predicate on any subject
```

### Object wildcard

```md
{=* ?rdf:type +*}        # all type assertions — any subject, any class
{=ex:alice [*] ex:name}  # all literal values of ex:name for alice
{=* ?* +*}               # all object-property triples in the document
```

### Chained patterns

Patterns follow subject chaining exactly like assertions. After `{=ex:alice}`,
subsequent patterns inherit `ex:alice` as their ground subject unless
`{=*}` explicitly wildcards it.

```md
## Alice {=ex:alice .ex:Person ex:name}

What does she know? {=* ?ex:knows +*}
What are her names? {=* [*] ex:name}
```

Both patterns above inherit `ex:alice` as subject — the `{=*}` wildcards
the subject position for matching but does not clear the current subject state.

Wait — this is the important nuance. `{=*}` in a pattern means:
"match any subject" not "use current subject". To match only the current
subject, omit the subject position or use `{?ex:knows +*}` which
inherits the current subject as a ground constraint.

### Pattern without explicit subject

```md
## Alice {=ex:alice .ex:Person ex:name}

[knows] {?* +*}          # match: (ex:alice, *, *) — current subject, any pred, any IRI obj
[name] {[*] *}           # match: (ex:alice, *, *) — current subject, any pred, any literal obj
```

When no subject wildcard is present, the pattern inherits the current
subject as a ground constraint. This is the natural composition:
set a subject with a normal annotation, then attach match patterns to it.

---

## 5. Pattern Registration and Scope

Patterns are registered at the point they are parsed in the token stream.
They apply **forward only** — to every quad emitted after registration.

```md
[ex] <http://example.org/>

Some text here generates quads — NOT matched by patterns below.

{=* ?rdf:type +*}    ← pattern registered here

More text here — quads ARE matched.
```

A pattern registered at the top of a document covers the whole document.
A pattern registered mid-document covers only what follows.
This is lexical scoping, not query scoping. It is deterministic and obvious.

---

## 6. Match Result

Each matched quad produces one **MatchResult**:

```js
{
  quad: {
    subject:   NamedNode,   // the actual matched subject
    predicate: NamedNode,   // the actual matched predicate
    object:    NamedNode | Literal   // the actual matched object
  },
  origin: {
    blockId:     string,    // ID of the block that produced this quad
    value:       string,    // prose text of the carrier ("Alice Cooper")
    carrierType: string,    // 'heading' | 'list' | 'para' | 'span' | 'link' | ...
    range:       [number, number],  // character offsets in source document
    polarity:    '+' | '-'  // assertion or retraction
  },
  patternId:  string        // which pattern matched (the annotation text)
}
```

The `origin` is already computed by the parser for every quad via `quadIndex`.
Matching adds zero new data — it just selects which quads to surface and
attaches their already-existing origin entries.

---

## 7. Multiple Patterns

Any number of patterns can be active simultaneously. Each emitted quad
is tested against all registered patterns in sequence. Cost is O(P) per
quad where P is the number of registered patterns — constant relative
to document size.

```md
{=* ?rdf:type +*}           ← pattern A: all type assertions
[*] {=* ex:name}            ← pattern B: all names
{=ex:alice} all [info] {?* +*} ← pattern C: all IRI edges from alice
```

All three fire for every subsequent quad. A quad matching multiple
patterns appears in each pattern's results independently.

---

## 8. Chained Pattern Groups

The most common real use: set a subject with a normal annotation,
attach patterns for what you want from it.

```md
## Alice {=ex:alice .ex:Person ex:name}

{?ex:knows +*}         # who alice knows
[*] {ex:email}         # alice's email values
{.*}         # alice's types
```

These three patterns share `ex:alice` as their ground subject (inherited
from current subject state). They form a logical group — a focused
extraction from one entity.

A pair of patterns can chain results: the first collects subjects, the
second filters by them. This is the Tier 3 semi-join expressed through
the callback API rather than through syntax — the spec does not need
to formalise it further. Keep it in userland.

---

## 9. What Cannot Be Expressed

These require post-parse SPARQL over the completed quadstore:

- **Negation** — absence of a triple is unknowable mid-stream
- **Joins across subjects** — `?x knows ?y . ?y type :Person` needs two passes
- **OPTIONAL** — null bindings require stream completion
- **Aggregation as output** — counts are available post-parse only
- **Property paths** — transitivity requires materialised graph traversal
- **ORDER BY / DISTINCT** — require full result materialisation

The pattern system answers: "give me these specific triples as they appear."
SPARQL answers: "compute this over the complete graph."
Both are available. Use each for what it is good at.

---

## 10. Parser Integration Points

Two changes to `parse.js`. Nothing else.

**Point 1 — Pattern registration** in the annotation handler,
before any quad is emitted. When `parseSemanticBlock` returns a sem
that contains `*` in any position, construct a `Pattern` object and
push it onto `state.patterns`. Do not call `emitQuad`.

**Point 2 — Pattern dispatch** inside `emitQuad`, after the quad is
confirmed non-remove and pushed to `state.quads`. Test the quad
against each entry in `state.patterns`. On match, push a `MatchResult`
onto the pattern's result array.

```js
// Inside emitQuad, after quads.push(quad):
for (const pattern of state.patterns) {
  if (matchesPattern(quad, pattern)) {
    pattern.results.push({
      quad,
      origin: quadIndex.get(quadKey),
      patternId: pattern.id
    })
  }
}
```

`matchesPattern` is the three-position predicate from Section 3.
It is five lines of code.

The parse return value gains one field:

```js
return {
  quads, remove, statements, origin, context,
  matches: state.patterns.map(p => ({ pattern: p.source, results: p.results }))
}
```

---

## 11. Detecting Match Mode

`parseSemanticBlock` needs to detect `*` and return it as a sentinel
rather than trying to expand it as an IRI. One check at the token level:

```js
// In parseSemanticBlock (utils.js), when reading subject:
if (subjectToken === '*') return { isWildcard: true }

// When reading predicate IRI:
if (predicateIRI === '*') pred.wildcard = true

// When reading object:
if (objectToken === '*') obj.wildcard = true
```

The annotation parser then checks: if any position has `isWildcard` or
`.wildcard = true`, the entire sem is a pattern sem. `processAnnotationWithBlockTracking`
checks for this flag first and routes to pattern registration instead of
quad emission.