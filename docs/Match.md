
# MDLD Match Syntax — `*` Wildcard Specification

**Status:** Pre-implementation design spec
**Scope:** Single-pass pattern matching embedded in MDLD annotations

---

## 1. Core Principle

A `*` token in any position of an MDLD annotation switches that annotation from **assertion mode** to **match mode**. In match mode, no quads are emitted. Instead, a pattern descriptor is registered with the parser's pattern dispatcher and fires a callback for every matching triple emitted **from that point forward** in the document.

This is a forward-only, lexically-scoped filter. A pattern sees only what follows it.

---

## 2. Wildcard Tokens

| Position | Token | Matches |
|---|---|---|
| Subject | `=*` | Any subject IRI |
| Class | `.*` | Any class IRI |
| Predicate (IRI obj) | `?*` | Any predicate with an IRI object |
| Reverse object | `[!*]` | Any subject with this IRI as object |
| Predicate (literal obj) | `*` (bare) | Any predicate with this literal object |
| Object (IRI) | `+*` | Any IRI object |
| Object (literal) | `[*]` | Any literal value |

A `*` in **any** position makes the entire annotation a match pattern. Mixed annotations — part assertion, part match — are **forbidden**. If `*` appears anywhere, every position must be either ground or `*`. No quads are emitted from that annotation.

## Richer constraints on ground positions (free)

Right now a ground position is an exact IRI match. But the comparison in `matchesPattern` is just a string equality check. You can replace that equality with a richer predicate at zero cost — it is still O(1) per quad, still stateless, still inside the same five-line function.

**Prefix matching.** Instead of `ex:alice` (exact subject), allow `ex:*` meaning "any subject in the ex: namespace". Syntactically this is already `*` in a position that normally holds a full IRI — the parser just needs to detect the wildcard before expansion rather than after. You get namespace-scoped scans for free.

```md
{=ex:* .*}        # all type assertions for ex: subjects only
{=my:task*} get all [statuses] {?ex:status +*}   # all status triples for subjects starting with my:task
```

This is particularly useful for fragment-based IRI patterns where you generate `ex:ProjectAlpha#task1`, `ex:ProjectAlpha#task2` etc. — a single pattern catches the whole family.

**Datatype constraint on literal objects.** The object wildcard `[*]` currently matches any literal. Allow `[*] {ex:* ^^xsd:date}` to match only date literals, `[*] {ex:number ^^xsd:integer}` for integers. The check is `quad.object.termType === 'Literal' && quad.object.datatype.value === targetDatatype`. Still O(1), still stateless.

```md
[*] {=* * ^^xsd:date}        # all date literals anywhere
[*] {=ex:alice * ^^xsd:integer}  # all integer values for alice
```

**Language filter on literals.** `[*] {ex:name @en}` matches only English-tagged literals. Same O(1) check.

The key insight here: these are all just richer ground constraints. They do not change the pattern shape, the state model, or the dispatch mechanism. The `matchesPattern` function gains a few more branches but remains a pure predicate with no side effects.

---

## 3. Ground selection (zero state)

All ground terms, at least one `*`. Tests each triple independently. No bindings produced — result is a stream of matched triples.

```md
[ex] <http://example.org/>

# Exact predicate scan — all type assertions in the rest of this document
[all types] {=* .*}

# Named subject, wildcard predicate and object — describe :alice
[alice profile] {=ex:alice ?* *}

# Named predicate and object, wildcard subject — reverse lookup
Who has this email [alice@example.org] {=* ex:email}?

# Named subject and object, wildcard predicate — what connects them
What connects [Alice] {=ex:alice} to [Bob] {+ex:bob ?*}
```

Result type: `Triple[]` — matched triples passed to callback as-is.


## 4. Composability

### 4.1 Multiple patterns simultaneously

Any number of patterns can be registered in parallel. Each emitted triple is tested against all registered patterns. Cost is O(patterns) per triple, constant relative to document size.

```md
[ex] <http://example.org/>
[schema] <http://schema.org/>

# Three patterns active simultaneously from this point forward
[all types]   {=* .*}
[*]  {=* schema:name}
[alice] {=ex:alice} [edges] {?* +*}
```

## Negation of patterns (free, carefully understood)

`-` polarity already exists in the spec for retractions. You can extend it to patterns: a pattern prefixed with `-` means "collect quads that do NOT match this shape."

```md
List all [non-types] {=* -.*}          # all triples that are NOT type assertions
List all non-literals [*] {=ex:alice -*}          # all non-literal triples about alice
```

This is still O(1) per quad — the predicate just inverts. It is useful for filtering noise rather than selecting signal. It does not give you "entities without a property" (that is still negation-as-failure, requiring full scan completion). It gives you "triples that don't match this shape", which is a different and safe thing.

## 7. Viable Notes Before Implementation

**Assertion/match detection is a single token check.** The parser only needs to scan for `*` in the annotation body before deciding which mode to invoke. This is O(annotation length), negligible. No grammar ambiguity — `*` is currently forbidden in annotation bodies, so this is a clean extension.

**Pattern registration happens at annotation parse time, not triple emit time.** This means the parser's annotation handler gains one new branch: if any position contains `*`, construct a pattern descriptor and register it with the dispatcher rather than emitting quads. The triple emit path is unchanged.

**The dispatcher is additive.** It sits between the existing triple emit point and the quadstore insert. Every emitted triple passes through it. If no patterns are registered, the dispatcher is a no-op. Existing behaviour is entirely preserved.

**Patterns are garbage-collected at parse end.** Accumulators, registered patterns, and result buffers are all scoped to the parse call. No global state, no cross-document leakage.

===================

# We can render matched result triples back as mdld and have human readable and agent ready texts and semantic state.

This closes a loop that makes MDLD qualitatively different from any other semantic format.

## What this actually means

A match result is already a set of triples with prose context attached. Rendering those triples back to MDLD gives you a **new valid MDLD document** that is simultaneously:

- Human readable prose describing exactly what was extracted
- Fully annotated with the same `{...}` syntax — machine-parseable back to the same triples
- Smaller and focused — only the matched subset, not the full document
- Self-describing — the match patterns that produced it can be included as a header

The round-trip is lossless for the matched subset. Parse → match → render → re-parse produces identical triples to the original for everything that was selected.

## The render function

Each substitution already carries everything needed:

```js
// Input substitution from match('[persons]', ...)
{
  s: 'ex:alice',
  p: 'ex:name',
  o: '"Alice Cooper"',
  context: {
    surroundingText: 'Alice Cooper leads the infrastructure team',
    position: { line: 42 }
  }
}

// Rendered back to MDLD
// Alice Cooper leads the infrastructure team
// **Alice Cooper** {=ex:alice ex:name}
```

The surrounding prose becomes the paragraph. The triple becomes the annotation on the nearest natural value carrier in that prose. The result reads as a normal document section — because it was one.

## What you can build with this

**Semantic summary documents.** Run a match over a large MDLD knowledge base, render the results — you get a focused document that covers exactly the entities and relationships you queried for, in readable prose, with full semantic annotation intact. Hand it to a human or an agent — both can use it without any further processing.

**Agent working memory as MDLD.** An agent's current context — what it knows, what it has concluded, what it is tracking — rendered as an MDLD document. Structured enough to query, readable enough to inspect, small enough to fit in a context window. When the agent writes new conclusions back, they go in as assertions. The document is both the agent's memory and its communication channel.

**Diff and patch as documents.** The remove polarity (`-p`, `-.Class`) already exists in the spec. A match that extracts changed triples between two document versions renders as an MDLD patch document — human readable, semantically precise, applicable by re-parsing.

**Materialized views.** A standing match pattern over a live MDLD document stream renders its results continuously as a separate MDLD document. The view updates as the source updates, stays valid MDLD throughout, costs only one pass per incoming chunk.

**Explanation traces.** An agent that used pattern matching to answer a question can render the matched triples — with their prose context — as the justification. Not "I found this in triple (ex:alice, ex:knows, ex:bob)" but the actual sentence that contained that fact, re-presented as a readable annotated excerpt. Grounded, verifiable, human-inspectable.

## The deeper point

Most semantic web formats treat human readability and machine readability as a trade-off. You either write for humans (Markdown, prose) and add metadata as an afterthought, or you write for machines (RDF/XML, Turtle) and generate human views separately.

MDLD match-and-render collapses this. The canonical form is always the annotated prose. Extraction produces more annotated prose. There is no separate "data layer" that diverges from the "readable layer" — they are the same artifact at every stage of the pipeline.

For agents specifically this matters because it means an agent never needs to switch representation formats as it works. It reads MDLD, reasons in MDLD, writes MDLD, hands off MDLD. The semantic state and the human-readable state are always in sync, always in the same document, parseable by the next agent or readable by a human at any point in the workflow without any translation step.



============================

The parser already has everything needed: `emitQuad` is the single choke point where all triples are born, `quadIndex` maps every quad key to its origin block with prose context, `state.ctx` holds the resolved prefixes. A match pattern is just a predicate function registered before the token loop that gets called inside `emitQuad` — one new branch, nothing else changes.

The key insight for the spec: patterns don't need variables or substitution maps. They just need to say "when a quad matches this shape, hand me that quad plus its origin entry". The quad already exists. The origin entry already has `value` (prose text), `carrierType`, `range`. Rendering matched quads back to MDLD is then a pure serialisation problem over data that is already fully formed - we have `generate()` for this.


## Implementation summary

The only files that change are `parse.js` and `utils.js` (`parseSemanticBlock`).

In `parseSemanticBlock`: when tokenising a subject, predicate, or object IRI, check if the raw token is `*`. If so, set a `.wildcard = true` flag on that position and return without attempting IRI expansion.

In `processAnnotationWithBlockTracking`: before resolving subjects and calling `emitQuad`, check if the parsed sem contains any wildcard flags. If yes, build a `Pattern` object from the ground terms and wildcards and push it to `state.patterns`. Return immediately without emitting.

In `emitQuad`: after `quads.push(quad)` and the `quadIndex` entry is created, iterate `state.patterns` and call `matchesPattern`. On match, push `{ quad, origin: quadIndex.get(quadKey) }` to `pattern.results`.

In `parse()`: initialise `state.patterns = []` and add `matches` to the return value.

The `renderMatches` function is a new file. It takes `matches` and `context`, reconstructs the prefix block from context, groups results by subject, and for each group emits the subject as a heading with its type annotations, then emits each predicate-object pair as a carrier with annotation. The prose text comes from `origin.value`. The result is always valid MDLD.
