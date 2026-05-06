# MD-LD Authoring Guide

MD-LD is Markdown with semantic annotations. You write normal prose — notes, plans, journals, documentation — and sprinkle in `{...}` curly-brace hints that tell a parser how to build a knowledge graph from your text. Everything outside `{...}` is free-form and ignored by the graph. You don't have to annotate everything — only what you want in the graph.

Think of it like highlighters. You pick a color scheme first (prefix declarations), then highlight the parts of your text that carry meaning.

---

## 1. Your First Note

Start with plain Markdown. This is always valid MD-LD — it just produces no graph data:

```md
# Alice's Journal

Hi! My name is Alice Smith. This is my personal journal.
```

Now add your first annotation. Two things happen: you declare a prefix, and you tag the heading as a named node with a type and a label:

```md
[my] <tag:alice.smith@example.org,2026:>

# Alice's Journal

## Alice {=my:alice .prov:Person label}

Hi! My name is Alice Smith. This is my personal journal.
```

That one annotation `{=my:alice .prov:Person label}` did three things:
- `=my:alice` — declared this heading as a named node (the *subject*)
- `.prov:Person` — typed it as a Person
- `label` — used the heading text "Alice" as its display label (`rdfs:label`)

The generated triples:

```ttl
@prefix my: <tag:alice.smith@example.org,2026:>.
@prefix prov: <http://www.w3.org/ns/prov#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.

my:alice a prov:Person;
    rdfs:label "Alice".
```

---

## 2. Your Personal IRI — the `tag:` Pattern

Every node in a knowledge graph needs a unique identifier — an IRI. If you have a website, use its URL. If you don't, use the RFC 4151 `tag:` scheme. It's yours to own with just an email address or domain:

```
tag:alice.smith@example.org,2026:
     │                      │   └─ your subspace starts here
     │                      └──── year you controlled this email
     └─────────────────────────── your authority (email or domain)
```

Declare it once at the top of your document as a prefix:

```md
[my] <tag:alice.smith@example.org,2026:>
```

Then use it with the short form anywhere:

| Short form | Expands to |
|---|---|
| `my:alice` | `tag:alice.smith@example.org,2026:alice` |
| `my:journal/2026-05-06` | `tag:alice.smith@example.org,2026:journal/2026-05-06` |
| `my:place/central-park` | `tag:alice.smith@example.org,2026:place/central-park` |

You can also add a sub-prefix for a specific domain of your notes:

```md
[my] <tag:alice.smith@example.org,2026:>
[j]  <my:journal/>
```

Now `j:2026-05-06` expands to `tag:alice.smith@example.org,2026:journal/2026-05-06`. Prefix folding — short prefixes built on top of other prefixes — keeps long IRIs readable.

**Built-in prefixes** (no declaration needed):

```
rdf    http://www.w3.org/1999/02/22-rdf-syntax-ns#
rdfs   http://www.w3.org/2000/01/rdf-schema#
xsd    http://www.w3.org/2001/XMLSchema#
sh     http://www.w3.org/ns/shacl#
prov   http://www.w3.org/ns/prov#
```

---

## 3. Saying Things About Things — Literals

Once you've set a subject with `{=...}`, every annotated value below it belongs to that subject until you change it. The basic pattern is:

```
[value] {predicate}
```

The `[value]` is the *carrier* — it can be a bracketed span, bold text, a code span, a heading, a list item, or a blockquote. The `{predicate}` names the property.

```md
[my] <tag:alice.smith@example.org,2026:>

## Alice {=my:alice .prov:Person label}

Age: [34] {my:age ^^xsd:integer}
City: [Berlin] {my:city @de}
Bio: **Loves hiking and graph databases.** {my:bio @en}
```

Generates:

```ttl
my:alice a prov:Person;
    rdfs:label "Alice";
    my:age "34"^^xsd:integer;
    my:city "Berlin"@de;
    my:bio "Loves hiking and graph databases."@en.
```

**Carriers at a glance:**

| Syntax | Example | When to use |
|---|---|---|
| `[text]` | `[34]` | Inline spans, values mid-sentence |
| `**text**` | `**Alice**` | Bold emphasis on a value |
| `` `text` `` | `` `v1.2.0` `` | Code/version values |
| `# text` | `# Journal` | Heading as value |
| `- text` | `- Design` | List item as value |
| `> text` | `> Must be unique` | Block quote as message/note |
| ` ```text``` ` | code block | Multi-line code or raw data |

**Datatype shortcuts:**

```md
[2026-05-06] {my:date ^^xsd:date}
[14:30:00Z]  {my:time ^^xsd:time}
[42]         {my:count ^^xsd:integer}
[3.14]       {my:ratio ^^xsd:decimal}
[true]       {my:active ^^xsd:boolean}
```

---

## 4. Connecting Things — Object Properties

To link two nodes together, use `{+IRI ?predicate}` on the carrier that names the target:

```
[label for target] {+target:iri ?predicate}
```

The `+` introduces the *object node*. The `?` marks a forward object property (subject → object).

```md
[my] <tag:alice.smith@example.org,2026:>

## Alice {=my:alice .prov:Person label}

Alice knows [Bob] {+my:bob ?my:knows}.
She lives near [Central Park] {+my:central-park ?my:livesNear}.

## Bob {=my:bob .prov:Person label}

## Central Park {=my:central-park .prov:Location label}
```

Generates:

```ttl
my:alice a prov:Person;
    rdfs:label "Alice";
    my:knows my:bob;
    my:livesNear my:central-park.
my:bob a prov:Person;
    rdfs:label "Bob".
my:central-park a prov:Location;
    rdfs:label "Central Park".
```

Each node is defined exactly once, in its own heading. The `{+my:bob ?my:knows}` annotation only asserts the link — type and label belong on Bob's own section. This keeps the graph clean with no duplicate triples.

### Reverse Links — `!predicate`

Sometimes it's more natural to write the relationship from the other direction. Use `!` for a reverse property — the triple goes *from* the object *to* the current subject:

```md
## Cookbook {=my:cookbook .my:Collection label}

Recipes in this collection:

- Apple Pie {+my:apple-pie !my:partOf}
- Peach Pie {+my:peach-pie !my:partOf}

## Apple Pie {=my:apple-pie .my:Recipe label}

## Peach Pie {=my:peach-pie .my:Recipe label}
```

This writes `my:apple-pie my:partOf my:cookbook` — the arrow points from the list item back to the collection. Each recipe is then defined in its own section with type and label there.

---

## 5. Fragment IRIs — Structuring Within a Document

Fragments (`#section`) let you create multiple related nodes inside one document without long IRIs:

```md
[my] <tag:alice.smith@example.org,2026:>

# Project Alpha {=my:ProjectAlpha .my:Project label}

- Design {+#task-design ?my:hasTask .my:Task label}
- Build  {+#task-build  ?my:hasTask .my:Task label}
- Ship   {+#task-ship   ?my:hasTask .my:Task label}

## Design Task {=#task-design}

Status: [done] {my:status}

## Build Task {=#task-build}

Status: [in-progress] {my:status}
```

`{=#task-design}` sets the subject to `my:ProjectAlpha#task-design` (it appends the fragment to the current base IRI). `{+#task-design}` references that same IRI as an object.

When you need to return to the parent node mid-document, just reset the subject:

```md
{=my:ProjectAlpha}

[3] {my:taskCount ^^xsd:integer}
```

Use `{=}` (bare) to clear the subject entirely — subsequent annotations will have no subject until the next `{=...}`.

---

## 6. The Three Predicate Forms

Every annotation uses one of three forms:

| Form | Meaning | Edge | Example |
|---|---|---|---|
| `p` | Literal property | S → literal | `[Alice] {my:name}` |
| `?p` | Object property | S → O | `[Bob] {+my:bob ?my:knows}` |
| `!p` | Reverse property | O → S | `[Tag] {+my:tag !my:taggedIn}` |

You can combine multiple predicates in one annotation:

```md
## Alice {=my:alice .prov:Person label}
```

This sets subject, types it, and assigns a label — all at once. Order within `{...}` is flexible.

---

## 7. A Journal Entry — Putting It Together

Here's a complete personal journal note using everything above:

```md
[my] <tag:alice.smith@example.org,2026:>
[j]  <my:journal/>

# 2026-05-06 {=j:2026-05-06 .j:Entry j:date ^^xsd:date}

## A good walk {label}

Mood: [happy] {j:mood}
Energy: [8] {j:energy ^^xsd:integer}

Met [Bob] {+my:bob ?j:met} at [Central Park] {+my:central-park ?j:location}.
The weather was [sunny] {j:weather}.
```

Generated triples:

```ttl
j:2026-05-06 a j:Entry;
    j:date "2026-05-06"^^xsd:date;
    rdfs:label "A good walk";
    j:mood "happy";
    j:energy "8"^^xsd:integer;
    j:met my:bob;
    j:location my:central-park;
    j:weather "sunny".
```

`my:bob` and `my:central-park` are referenced by IRI. Their type and label belong in their own definitions — in a people file, a places file, or wherever you keep them. A journal entry only records what happened, not who Bob is.

---

## 8. Core Ontologies — Vocabulary You Can Reuse

You don't have to invent every predicate. These standard vocabularies cover most needs and are understood by graph tools everywhere.

### rdf — Statements and Types

`rdf` provides the two most fundamental building blocks:

**`rdf:type`** (written as `.Class` in MD-LD) — declares what a node is:

```md
## Alice {=my:alice .prov:Person}    ← shorthand for rdf:type prov:Person
```

**`rdf:Statement`** with `rdf:subject`, `rdf:predicate`, `rdf:object` — lets you annotate a *relationship itself* (record its confidence, source, or time). See §9.

### rdfs — Classes, Containers, Labels

`rdfs` gives you the vocabulary for describing structure and display.

**`rdfs:label`** (written as `label`) — the display name of any node:

```md
## Alice {=my:alice label}
```

**`rdfs:comment`** (written as `comment`) — a human-readable description:

```md
[A personal knowledge graph.] {comment @en}
```

**`rdfs:Class`** (written as `.Class`) — declares that a node is a class, i.e. a category things can belong to:

```md
## Person {=my:Person .Class label}
## Place  {=my:Place  .Class label}
```

**`rdfs:Container` / `rdfs:member`** — an open-ended collection. Use `rdfs:member` (written as `member`) to add items; any node typed `.Container` acts as the bag:

```md
## My Places {=my:places .Container label}

- Central Park {+my:place/central-park ?member}
- Tompkins Square {+my:place/tompkins ?member}
```

The reverse form is equally natural — declare the container on the item side:

```md
## Central Park {=my:place/central-park .prov:Location label}
[my:places] {!member +my:places}
```

### prov — Who Did What When

PROV-O models agents, activities, and entities with their relationships.

```md
[my] <tag:alice.smith@example.org,2026:>

## Writing session {=my:session-1 .prov:Activity label}

Started at [2026-05-06T10:00:00Z] {prov:startedAtTime ^^xsd:dateTime}.
Led by [Alice] {+my:alice ?prov:wasAssociatedWith}.
Produced [Draft v1] {+my:draft-1 ?prov:generated}.
```

Alice and Draft v1 are defined in their own sections (or files), typed there. The activity only asserts the relationships.

Key prov terms: `prov:Agent`, `prov:Activity`, `prov:Entity`, `prov:wasAssociatedWith`, `prov:wasGeneratedBy`, `prov:used`, `prov:wasDerivedFrom`, `prov:startedAtTime`, `prov:endedAtTime`.

### xsd — Typed Values

Use `^^xsd:type` to give literals proper machine-readable types:

```md
[2026-05-06]          {my:date ^^xsd:date}
[2026-05-06T10:00:00Z] {my:time ^^xsd:dateTime}
[42]                  {my:count ^^xsd:integer}
[3.14]                {my:ratio ^^xsd:decimal}
[true]                {my:flag ^^xsd:boolean}
```

### sh — Validation Shapes (SHACL)

SHACL lets you declare rules about what a valid node looks like:

```md
[my] <tag:alice.smith@example.org,2026:>

## Person Shape {=my:PersonShape .sh:NodeShape label}

Target: [Person] {+my:Person ?sh:targetClass}

### Name Rule {=my:PersonShape-name .sh:PropertyShape ?sh:property}

Path: [label] {+label ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

> Every person must have a name. {sh:message}
```

---

## 9. Tracking Statements — rdf:Statement

When you need to annotate a *relationship* itself (e.g. record confidence, source, or time of a claim), use `rdf:Statement`:

```md
[my] <tag:alice.smith@example.org,2026:>

## Observation 1 {=my:obs1 .rdf:Statement .prov:Entity label}

I observed that [Alice] {+my:alice ?rdf:subject} [knows] {+my:knows ?rdf:predicate} [Bob] {+my:bob ?rdf:object}.

Confidence: [0.95] {my:confidence ^^xsd:decimal}

Source: [field notes] {+my:field-notes ?prov:wasDerivedFrom label}
```

MD-LD automatically extracts the elevated SPO triple (`my:alice my:knows my:bob`) from this pattern alongside the reified statement node.

---

## 10. Subject Decoupling — The TTL Way

Subject context persists until the next `{=...}`. The elegant way to handle multiple related nodes is to declare all of a node's *outgoing links* together — just like Turtle does — then move to each child in its own section:

```md
[my] <tag:alice.smith@example.org,2026:>

# Person Shape {=my:PersonShape .sh:NodeShape label}

Validates [Person] {+my:Person ?sh:targetClass} with rules:
[name] {+my:PersonShape-name ?sh:property sh:name} and
[email] {+my:PersonShape-email ?sh:property sh:name}.

## Name rule {=my:PersonShape-name .sh:PropertyShape}

Path: [label] {+label ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

> Every person must have a name. {sh:message}

## Email rule {=my:PersonShape-email .sh:PropertyShape}

Path: [my:email] {+my:email ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

> Every person must have an email. {sh:message}
```

The parent shape lists all its `?sh:property` links in one paragraph. Each child `sh:PropertyShape` then gets its own heading section. No resets needed — the `sh:name` value carrier on the `{+...}` block even gives each rule a human-readable name at the point of reference.

The `{=my:Shape}` reset is available when you genuinely need to add properties to a parent *after* defining children inline, but the cleaner default is: **finish a node before moving on**.

### ❌ Antipattern — typing objects inline

Avoid adding `.Class` and `label` directly onto `{+IRI}` references unless that is the *only* place the node ever appears:

```md
← antipattern: Bob gets typed and labelled here, and again wherever else he appears
Met [Bob] {+my:bob .prov:Person ?j:met label}.
```

This scatters type and label triples across every document that mentions Bob. If graphs are merged, you get duplicate assertions. Instead, define Bob once:

```md
← correct: the journal just records the link
Met [Bob] {+my:bob ?j:met}.

← Bob's definition lives in one place (people.md or similar)
## Bob {=my:bob .prov:Person label}
```

The one exception: when you are authoring a *vocabulary* or *ontology*, where introducing a term and its type in the same annotation is exactly right — as seen in the PROV-O example above.

---

## 11. Quick Reference

```
PREFIXES
[prefix] <IRI>              declare a namespace
[p2] <p1:sub:>              fold prefix p2 under p1

SUBJECTS
{=my:node}                  set subject to full IRI
{=#fragment}                set subject to current-base#fragment
{=}                         clear subject

OBJECTS
{+my:node ?predicate}       forward link: subject → object
{+my:node !predicate}       reverse link: object → subject
{+#fragment ?predicate}     same with fragment IRI

TYPES
{.my:Class}                 subject rdf:type my:Class

LITERALS  (value comes from the carrier)
[text] {predicate}          literal property
[text] {predicate @en}      with language tag
[text] {predicate ^^xsd:integer}  with datatype

CARRIERS
[text]   **text**   `text`  inline spans
# text   - text   > text   block-level (heading / list / blockquote)
```fenced```                code block

PREDICATE FORMS
p       S → literal         [Alice] {my:name}
?p      S → object          [Bob] {+my:bob ?my:knows}
!p      object → S          [Tag] {+my:tag !my:taggedIn}

COMBINING (all valid in one block)
{=my:node .my:Class label}
{+my:target .my:Type ?my:rel label @en}
```

---

## 12. Invariants — What Must Always Hold

These rules are non-negotiable. Violating them produces invalid or empty graph output:

- Every triple must come from an annotation `{...}`
- Every literal must come from a value *carrier* — never write `{predicate "value"}`
- `{=...}` always declares the subject; it never emits a triple by itself
- No blank nodes — every node must be a named IRI
- Do not invent prefixes; declare everything you use
- `label` without a prefix means `rdfs:label` — use it freely
- List item annotations apply only to *that* item, not the header or siblings

**Invalid:**
```md
{my:age "34"^^xsd:integer}    ← literal inside braces, no carrier
```

**Valid:**
```md
[34] {my:age ^^xsd:integer}   ← carrier [34] holds the value
```

---

## 13. Worked Patterns

### Personal journal entry
```md
[my] <tag:you@example.com,2026:>
[j]  <my:journal/>

# 2026-05-06 {=j:2026-05-06 .j:Entry j:date ^^xsd:date label}

[Productive] {j:mood}. Met [Sam] {+my:sam ?j:met} at [the library] {+my:place/library ?j:location}.
```

### Project with tasks
```md
[my] <tag:you@example.com,2026:>

# Project Alpha {=my:alpha .my:Project label}

Tasks: [design] {+#design ?my:task sh:name}, [build] {+#build ?my:task sh:name}.

## Design {=#design .my:Task label}
[done] {my:status}

## Build {=#build .my:Task label}
[in-progress] {my:status}
```

### Provenance activity
```md
[my] <tag:you@example.com,2026:>

## Analysis run {=my:run-1 .prov:Activity label}

Started: [2026-05-06T09:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
Ended:   [2026-05-06T09:45:00Z] {prov:endedAtTime ^^xsd:dateTime}
By:      [You] {+my:you ?prov:wasAssociatedWith}
Used:    [dataset v2] {+my:dataset-v2 ?prov:used}
Made:    [report] {+my:report ?prov:generated}
```

### SHACL validation shape
```md
[my] <tag:you@example.com,2026:>

## User Shape {=my:UserShape .sh:NodeShape label}

Validates [User] {+my:User ?sh:targetClass} with:
[email rule] {+my:UserShape-email ?sh:property sh:name} and
[name rule] {+my:UserShape-name ?sh:property sh:name}.

### Email rule {=my:UserShape-email .sh:PropertyShape}

Path: [my:email] {+my:email ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

> User must have an email address. {sh:message}

### Name rule {=my:UserShape-name .sh:PropertyShape}

Path: [label] {+label ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

> User must have a name. {sh:message}
```

### Reified statement with confidence
```md
[my] <tag:you@example.com,2026:>

## Claim {=my:claim-1 .rdf:Statement label}

[Alice] {+my:alice ?rdf:subject} [knows] {+my:knows ?rdf:predicate} [Bob] {+my:bob ?rdf:object}.
Confidence: [0.9] {my:confidence ^^xsd:decimal}
Recorded: [2026-05-06] {prov:generatedAtTime ^^xsd:date}
```

### People and places — define once, reference everywhere
```md
[my] <tag:you@example.com,2026:>

# People

## Alice {=my:alice .prov:Person label}
[alice@example.com] {my:email}

## Bob {=my:bob .prov:Person label}

# Places

## Central Park {=my:place/central-park .prov:Location label}
[New York] {my:city}
```
