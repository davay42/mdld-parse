# Quad[] as a Universal Semantic Runtime

There's a shift hiding inside MD-LD that's easy to miss if you only look at the surface.

On the surface, MD-LD looks like a format — a way to write RDF triples inside Markdown using curly-brace annotations. That's true, but it undersells the idea. The deeper observation is that MD-LD documents are **source code for knowledge**, and when you parse them, you get something far more useful than serialized text: you get a plain JavaScript array of quads. That array is the runtime. Everything else — querying, traversing, merging, refactoring, generating — is just functions operating on that array.

This reframes MD-LD from "a Markdown-based RDF serialization" into something much bigger: **a universal semantic runtime where documents compile into `Quad[]` and `Quad[]` compiles back into documents.**

The cycle looks like this:

```
Markdown
    ↓ parse()
Quad[]
    ↓ pure functions
Quad[]
    ↓ generate()
Markdown
```

The document is not the runtime. `Quad[]` is.

This article is a hands-on guide to that runtime. Every example has been tested. Every function is real. By the end, you'll see that once knowledge lives as a plain array, you don't need a database, a query engine, a server, or a framework — you just need JavaScript.

---

## Your First Knowledge Graph

Let's start with something real. Here's a short MD-LD document describing a person named Alice:

```md
[my] <tag:alice@example.org,2026:>

# Alice {=my:alice .prov:Person label}

[Alice Smith] {my:fullName}
[alice@example.com] {my:email}
```

This is valid Markdown — you can read it as a note. But it's also a knowledge graph waiting to be compiled. When you parse it:

```js
import { parse, generate } from 'mdld-parse'

const { quads, context, primary, origin } = parse({ text })
```

You get an array of quads. Each quad has four fields — subject, predicate, object, and graph:

```js
{
  subject,   // who or what we're talking about
  predicate, // the property or relationship
  object,    // the value or target
  graph      // the named graph (provenance)
}
```

The `quads` array from our Alice document looks like this:

```
my:alice  rdf:type     prov:Person     (NamedNode)
my:alice  rdfs:label   "Alice"         (Literal)
my:alice  my:fullName  "Alice Smith"   (Literal)
my:alice  my:email     "alice@example.com"  (Literal)
```

Four quads. A complete knowledge graph for one person, sitting in a plain JavaScript array. No triple store. No server. No setup.

The `primary` field gives you the document's identity at a glance:

```js
{
  subject: 'tag:alice@example.org,2026:alice',
  type: 'http://www.w3.org/ns/prov#Person',
  label: 'Alice'
}
```

And notice that `origin` in the destructured result — we'll come back to it. For now, know that every quad you just saw carries a precise mapping back to the characters in the source Markdown that created it. The bridge between text and graph is built during the same parse pass, at no extra cost. When you need it, it's there.

This is already useful. But the real power emerges when you realize what you can do with that array.

---

## The Simplicity Breakthrough

Most semantic systems introduce a deep stack between you and your data:

```
Document
  → Parser
    → Triple Store
      → Query Engine
        → Result
```

Each layer adds complexity. You need a database running somewhere. You need SPARQL or a custom query language. You need an ORM to map results back to objects. You need a framework to orchestrate it all.

MD-LD stops much earlier:

```
Document
  → Quad[]
```

Once knowledge exists as a simple array, **ordinary JavaScript becomes the query language**. The `Array` prototype — `filter`, `map`, `reduce`, `flatMap`, `find`, `some`, `every` — is your query engine. The `Map` object is your index. Function composition is your pipeline.

This isn't a toy simplification. It's a genuine paradigm shift. Consider what you no longer need:

- **No database** — your data lives in memory, in a file, in a string
- **No server** — computation runs locally, in a browser tab or a CLI
- **No SPARQL endpoint** — you write JavaScript, not a query language you had to learn separately
- **No ORM** — quads are already plain objects, not rows in a relational table
- **No framework** — composition of pure functions replaces dependency injection and lifecycle management

The bar to entry drops from "set up a triple store and learn SPARQL" to "open a JavaScript console." And the bar to mastery? It's just getting better at the JavaScript you already know.

---

## Querying Without a Query Language

Let's build a small toolkit of query functions. Each one is a pure function that takes `Quad[]` and returns something useful. No globals. No side effects. No imports beyond what JavaScript gives you for free.

### Find all triples for a subject

The most basic query: "tell me everything about this thing."

```js
const subject = (quads, iri) =>
  quads.filter(q => q.subject.value === iri)
```

Usage:

```js
subject(quads, 'tag:alice@example.org,2026:alice')
// → [quad, quad, quad, quad]
```

That's it. No `SELECT * WHERE { <iri> ?p ?o }`. Just a filter.

### Find all values for a predicate

"What are all the labels in this graph?"

```js
const values = (quads, predicate) =>
  quads
    .filter(q => q.predicate.value === predicate)
    .map(q => q.object.value)
```

Usage:

```js
values(quads, 'http://www.w3.org/2000/01/rdf-schema#label')
// → ['Alice']
```

### Find all outgoing links

"Who or what does this entity point to?" — filter for `NamedNode` objects (as opposed to `Literal` values):

```js
const outgoing = (quads, iri) =>
  quads.filter(
    q =>
      q.subject.value === iri &&
      q.object.termType === 'NamedNode'
  )
```

This distinguishes relationships (Alice *knows* Bob) from attributes (Alice's *name* is "Alice Smith"). In a social graph, `outgoing` gives you the people, places, and things your entity connects to — not the string values hanging off it.

### When quads get verbose: the golden graph

Here's the thing about real knowledge graphs — they contain two kinds of facts. Some are structural: Alice *is a* Person, her *name* is "Alice Smith". Others are claims: Alice *knows* Bob, and you want to record that you observed this with 95% confidence. The structural facts are the scaffolding. The claims are the signal. In raw RDF, both kinds live in the same flat `quads` array, and the claims are wrapped in `rdf:Statement` reification — which means a single observation like "Alice knows Bob (confidence: 0.95)" produces six or seven quads instead of one.

MD-LD handles this for you automatically. When you write an `rdf:Statement` pattern — a subject typed as `rdf:Statement` with `rdf:subject`, `rdf:predicate`, and `rdf:object` properties — the parser extracts the inner triple into a separate `statements` array:

```md
## Observation: Alice knows Bob {=my:claim1 .rdf:Statement label}

[Alice] {+my:alice ?rdf:subject} [knows] {+my:knows ?rdf:predicate} [Bob] {+my:bob ?rdf:object}.

Confidence: [0.95] {my:confidence ^^xsd:decimal}
```

```js
const { quads, statements } = parse({ text })
```

The `quads` array holds the full picture — the statement wrapper, the confidence, the provenance. The `statements` array holds just the elevated SPO triple: `my:alice → my:knows → my:bob`. The signal, separated from the noise, at parse time, without a second query.

This is immediately practical. A dashboard renders `statements` — the key relationships, clean and simple. An audit tool inspects `quads` — the full provenance trail. A search engine indexes `statements` for fast lookup and falls back to `quads` for detail pages. You choose the level of detail you need, and both views came from the same document in the same function call.

> **For the full pattern syntax and detection rules,** see [Elevated Statements](./statements.md).

---

## Walking the Graph

Knowledge graphs get interesting when you traverse them. Starting from one node, follow the edges and see where they lead.

### One hop: immediate neighbors

```js
const neighbors = (quads, iri) =>
  quads
    .filter(q => q.subject.value === iri)
    .map(q => q.object.value)
```

Given Alice, this returns the IRIs of everything she connects to — Bob, Central Park, Project Alpha.

### Two hops: friends of friends

```js
const walk2 = (quads, iri) => {
  const first = neighbors(quads, iri)
  return first.flatMap(node => neighbors(quads, node))
}
```

Starting from Alice, one hop reaches Bob and Project Alpha. Two hops reaches what *they* connect to — maybe Charlie, maybe the project's status and priority. You're navigating a graph without a graph database, without a traversal library, without anything but `filter` and `flatMap`.

### Beyond two hops

The pattern extends naturally. Three hops is `walk2` composed with `neighbors`. A recursive walk is a `while` loop with a `Set` to track visited nodes. A shortest-path search is BFS with a queue. These are standard algorithms you can implement in a few lines — and because your data is a plain array, you can see and debug every step.

No query language required. Just functions.

---

## Building Indexes for Speed

Filtering an array on every query works fine for small graphs. But when your graph grows to thousands of entities, you'll want indexes. The good news: you build them yourself, in one line each, exactly the way you want them.

### Index by subject

```js
const indexBySubject = quads =>
  quads.reduce((m, q) => {
    const k = q.subject.value
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(q)
    return m
  }, new Map())
```

Now lookups are O(1):

```js
const bySubject = indexBySubject(quads)
bySubject.get('tag:alice@example.org,2026:alice')
// → [quad, quad, quad, quad]
```

### Index by predicate

Same pattern, different key:

```js
const indexByPredicate = quads =>
  quads.reduce((m, q) => {
    const k = q.predicate.value
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(q)
    return m
  }, new Map())
```

Now you can ask "what are all the `rdf:type` triples?" or "which quads use `my:knows`?" without scanning the whole array.

### You choose your optimization

This is the key insight: you're not stuck with whatever index strategy your database decided to implement. Working with a social graph? Index by `my:knows` predicates. Building a search engine? Index by object literals for full-text lookup. Need a compound index? Nest a `Map` inside a `Map`. The index is just JavaScript data structures, built on demand, discarded when you're done.

---

## Documents From Graphs, Graphs From Documents

This is where the paradigm really clicks.

Most systems treat documents and data as separate worlds. You write a document, and it stays a document. You query a database, and it stays a database. The two don't round-trip.

MD-LD closes the loop. You can extract a subgraph from a larger graph and generate a standalone document from it. That document is valid MD-LD — it can be parsed back into quads, re-merged, and the cycle continues.

### Extracting one entity

Suppose your graph contains hundreds of entities, but you only want Alice:

```js
const entity = (quads, iri) =>
  quads.filter(q => q.subject.value === iri)
```

Generate a standalone document:

```js
const { text } = generate({ quads: entity(quads, 'tag:alice@example.org,2026:alice'), context })
```

Output:

```md
[my] <tag:alice@example.org,2026:>

# Alice {=my:alice .prov:Person label}
[Alice Smith] {my:fullName}
[alice@example.com] {my:email}
```

A document becomes another document. The round-trip is real: you parsed Markdown into quads, filtered those quads, and generated new Markdown from the result. Knowledge was never trapped inside a format — it flowed through the `Quad[]` representation and came back out as text a human can read.

This pattern is deeply compositional. You can:

- **Extract** a subgraph and **generate** a focused document
- **Parse** that document back into quads and **merge** it with others
- **Transform** the quads and **generate** a different document
- **Diff** two quad arrays and **generate** a change document

The cycle never breaks. `Quad[]` is the universal intermediate representation — like an AST for knowledge.

### Connecting quads back to the text

When you generate a document from a subgraph, you're creating new text from pure structure. But often you need to go the other direction: given a quad, find the exact characters in the source Markdown that produced it. This is where the `origin` system — mentioned when we first parsed Alice — becomes essential.

Every quad carries an origin entry that maps it back to its birthplace in the source:

```js
import { locate } from 'mdld-parse'

const loc = locate(quad, result.origin)
// {
//   blockId: '4ac750c1',
//   range: { start: 33, end: 53 },
//   carrierType: 'heading',
//   value: 'Alice',
//   polarity: '+'
// }
```

This is how you build click-to-jump editors: when a user clicks a node in a graph view, you call `locate`, get the character range, and scroll the editor to that exact position. No search. No guessing. The bridge from graph back to text was built during the same parse pass that produced the quads.

Origin goes deeper than point lookups. It structures the entire document as a walkable topology of **blocks** (semantic anchors that produced quads) connected by **spans** (the raw text between them):

```
[Block] --(Span)-- [Block] --(Span)-- [Block]
```

You can walk this chain in both directions to recover context around any annotation — the surrounding prose that gives it meaning. This is how you build autocomplete that understands neighborhood, validation tools that report errors with precise source locations, and AI agents that can trace a claim back to the sentence that asserted it.

> **For the full origin API, span chain traversal, and context extraction patterns,** see [Origin System](./origin.md).

---

## Merging Worlds

Real knowledge doesn't live in one file. You have a people file, a projects file, a journal file — each a valid MD-LD document with its own subjects and relationships. When you need the full picture, you merge them:

```js
const docs = [
  parse(peopleMd).quads,
  parse(projectsMd).quads,
  parse(journalMd).quads
]

const merged = docs.flat()
```

One line. The entire collection now behaves as a single graph. You can query across documents, traverse relationships that span files, and build indexes over the combined dataset.

### Focused views from merged data

When you want a document centered on one entity within the merged graph, use `generateNode`:

```js
const { text } = generateNode({
  quads: merged,
  focusIRI: 'tag:alice@example.org,2026:alice'
})
```

This produces a document that includes Alice and all her direct connections — a portable, self-contained snapshot that someone else can open and read without needing the full merged graph.

### CRDT-style versioning

MD-LD's merge function goes beyond concatenation. It resolves **polarity** — the `+` and `-` prefixes that let you author changes append-only, like a ledger:

```js
const v1 = `[my] <tag:hr@example.org,2026:>
# Project Alpha {=my:alpha .my:Project label}
[planning] {my:status}
[Alice] {+my:alice ?my:lead}`

const v2 = `[my] <tag:hr@example.org,2026:>
# Project Alpha {=my:alpha}
[planning] {-my:status}
[active] {my:status}
[Bob] {+my:bob ?my:lead}`

const final = merge([v1, v2])
// quads: status=active, lead=Alice, lead=Bob
// remove: [] — all retractions resolved
```

The history lives in the text. The graph holds only the current truth. This is how you implement versioned knowledge without a database — just append-only Markdown files and a merge function.

---

## Semantic Views: One Source, Many Lenses

One of the most powerful patterns in the `Quad[]` runtime is creating **derived documents** — purpose-specific views extracted from a master graph.

Imagine you maintain a knowledge base containing people, projects, organizations, and events — all in one large MD-LD document. Different audiences need different slices:

- The **team dashboard** needs only active projects
- The **org chart** needs only people and their reporting lines
- The **calendar** needs only upcoming events

Each of these is a filter + generate:

```js
const { quads, context } = parse({ text: masterGraph })

// Projects only
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const projectIRIs = quads
  .filter(q =>
    q.predicate.value === RDF_TYPE &&
    q.object.value === 'tag:team@example.org,2026:Project'
  )
  .map(q => q.subject.value)

const projectQuads = quads.filter(q => projectIRIs.includes(q.subject.value))

const { text: projectsDoc } = generate({ quads: projectQuads, context })
```

Output: a clean `Projects.md` document containing only the project entities and their properties. No duplication. No export pipeline. No ETL job. Just graph transformation.

The same pattern works for any dimension of your data:

- Filter by type → entity-specific documents
- Filter by predicate → relationship reports
- Filter by object value → all entities connected to a specific target
- Filter by date range → temporal slices of a journal

One source. Many views. Each view is a document that can itself be parsed, merged, and transformed. The composition is infinite.

---

## Refactoring Knowledge

Code gets refactored. Databases get migrated. Knowledge graphs should be no different — and with `Quad[]`, they're not.

Rename a property across an entire knowledge base:

```js
const renamed = quads.map(q =>
  q.predicate.value === 'tag:demo@example.org,2026:owner'
    ? { ...q, predicate: { ...q.predicate, value: 'tag:demo@example.org,2026:maintainer' } }
    : q
)
```

Generate the refactored document:

```js
const { text } = generate({ quads: renamed, context })
```

Before:

```md
# Widget {=ex:widget .ex:Product label}
[Alice] {ex:owner}
[v1.0] {ex:version}
```

After:

```md
# Widget {=ex:widget .ex:Product label}
[Alice] {ex:maintainer}
[v1.0] {ex:version}
```

The refactoring is exact and complete. Every quad with the old predicate has been updated. No migration script. No downtime. No data loss. Just an array map and a generate call.

This works for any structural change:

- **Rename** a predicate → `map` over quads, swap the predicate IRI
- **Split** a type into subtypes → `map` to reclassify entities
- **Merge** two properties → `flatMap` to collapse duplicate quads
- **Deprecate** a relationship → `filter` to remove it, `generate` to produce a clean document

Knowledge bases can be refactored with the same confidence as code — because they *are* code, in the `Quad[]` runtime.

---

## Analytics on Your Knowledge

Once your knowledge lives as `Quad[]`, analytics become ordinary JavaScript. No SQL. No aggregation pipeline. No analytics SDK. Just arrays and maps.

### Count unique entities

```js
const entities = new Set(quads.map(q => q.subject.value))
console.log(entities.size)
```

### Find the most connected nodes

```js
const degree = new Map()
for (const q of quads) {
  degree.set(
    q.subject.value,
    (degree.get(q.subject.value) || 0) + 1
  )
}

const ranked = [...degree.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
```

### Count relationship frequencies

```js
const predicates = new Map()
for (const q of quads) {
  const p = q.predicate.value
  predicates.set(p, (predicates.get(p) || 0) + 1)
}
```

### Connect these to your workflow

These aren't just toy examples. They answer real questions:

- **"How many people are in my graph?"** — count entities of type `prov:Person`
- **"Which project has the most connections?"** — degree centrality on project IRIs
- **"Am I over-using custom predicates?"** — predicate frequency distribution
- **"Who are the key connectors?"** — nodes with the most `?my:knows` edges

Knowledge graph analytics become ordinary JavaScript. The data was already in memory. The functions were already in the language. You just hadn't thought of your knowledge as an array before.

---

## Local-First Semantics

Traditional semantic systems assume infrastructure:

```
Document
  → Server
    → Triple Store
      → Query Engine
        → API Endpoint
          → Client
```

Every layer is a dependency. Every dependency is a failure mode. The server goes down and you can't query. The triple store corrupts and you lose data. The API changes and your client breaks.

MD-LD assumes none of this:

```
Document
  → Quad[]
```

Everything after that is local computation. A browser can do it. A CLI can do it. A web worker can do it. An AI agent can do it. A notebook cell can do it. A build script can do it. No infrastructure is required.

This is **local-first semantics** — your knowledge is always available, always queryable, always transformable, without asking permission from a server. The document is the source of truth. The array is the runtime. The functions are your tools.

---

## The Closed Loop

The most important property of MD-LD is that the cycle is closed:

```
MD-LD
  ↓
Quad[]  +  statements[]  +  origin{}
  ↓
filter · map · reduce
index · analyze
merge · diff
traverse · rank
cluster · extract
elevate · locate
transform
  ↓
Quad[]
  ↓
MD-LD
```

Knowledge is never trapped inside a database. Documents become graphs. Graphs become programs. Programs produce new documents. Those documents can be parsed back into graphs, and the cycle continues.

The runtime is simply:

```js
Quad[]
```

But `Quad[]` is never alone. `statements[]` gives you the golden graph — signal separated from noise, without a second query. `origin{}` gives you the bridge back to the source text — every quad traceable to its birthplace, every block connected to its neighborhood. Together, they form a complete semantic surface: the data, the highlights, and the map back to where it all came from.

Everything else is composition. You compose `filter` with `map` to build queries. You compose `indexBySubject` with `neighbors` to build traversals. You compose `entity` with `generate` to build views. You compose `merge` with polarity resolution to build versioned knowledge bases. You compose `locate` with `extractFragment` to build editors that understand where knowledge lives in the text.

This composition is ordinary JavaScript. It runs anywhere JavaScript runs. It needs nothing that JavaScript doesn't give you for free. And it produces documents that humans can read, machines can parse, and agents can reason over.

The document is not the runtime. The runtime is `Quad[]`. And `Quad[]` is just an array.
