# Knowledge Round Trip

Knowledge lives in documents. A researcher writes notes in the margin of a paper. A project lead drafts meeting minutes in a shared file. A student keeps a journal of observations. A team maintains a contacts list. These are human acts — writing things down, organizing thoughts, recording what happened — and the documents they produce are the primary artifacts of knowledge. Not databases, not platforms, not APIs. Documents.

MD-LD begins from a single observation: a document can be simultaneously human-readable and machine-parseable without either quality compromising the other. The annotations that make the text structured flow naturally with the prose — they do not replace it, they do not wrap it in markup that obscures it, and they do not require a rendering step to become legible. You write a heading and it becomes a named node. You bold a name and it becomes a property value. You write "knows [Bob]" and it becomes a relationship edge. The document remains a document. The graph emerges from it.

This emergence is deterministic and reversible. The same document, parsed according to the same specification, always produces the same graph. The same graph, generated back, always produces a readable document. Knowledge makes a round trip from text through computation and back to text, and at every stage it remains explicit, inspectable, and under your control. The document may literally be written with a pen on paper following the MD-LD specification — the quads can be extracted manually at any future time. No runtime is required for the knowledge to exist. The runtime is required for computation.

The computational representation at the center of this cycle is `Quad[]` — a plain JavaScript array of RDF quads, where each quad is an object with subject, predicate, object, and graph. This is the universal semantic runtime: not a database engine, not a query processor, not a validation framework, but a data structure that JavaScript already understands natively. Every operation in this article — querying, traversing, validating, filtering, merging, generating — is a pure function of that array. The document is the source of truth. The array is the engine. The round trip is the guarantee that nothing is lost in translation.

---

## The Document Is the Source of Truth

Consider a contacts document — a single MD-LD file that declares organizations, lists people with their relationships, defines validation shapes, and even includes executable scripts. This is not a toy example. It is a real, self-contained knowledge system that fits in one file and can be read without any tool beyond a text editor — or indeed, without any tool at all, if you know the specification.

```md
[my] <tag:me@example.org,2026:>

# My Contacts {=my:contacts .Container label}

## Person Shape {=my:PersonShape .sh:NodeShape label}

Targets all [Persons] {+prov:Person ?sh:targetClass} to validate core contact requirements: person must have a [name] {+#name ?sh:property sh:name} and a [birthdate] {+#birthdate ?sh:property sh:name}. Might have a [phone] {+#phone ?sh:property sh:name} number or an [email] {+#email ?sh:property sh:name}. People might have [knows] {+my:knows ?sh:property sh:name} relation with each other. A Person may have [worksAt] {+#worksAt ?sh:property sh:name} relationships with organizations.

**Person must have exactly one name** {=#name .sh:PropertyShape sh:message} requires the [name] {+my:name ?sh:path} property to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value of type [string] {+xsd:string ?sh:datatype}.

**Person must have at least 1 email** {=#email .sh:PropertyShape sh:message} requires the [email] {+my:email ?sh:path} property to have at least [1] {sh:minCount ^^xsd:integer} value of type [string] {+xsd:string ?sh:datatype} with [@] {sh:pattern} pattern.

**Person may know other persons** {=#knows .sh:PropertyShape sh:message} allows the [knows] {+my:knows ?sh:path} property to have [0] {sh:minCount ^^xsd:integer} or more values, each of which must be a [Person] {+prov:Person ?sh:class}.

# Organizations

## ACME Inc. {=my:orgs/acme .prov:Organization label}

## Apple Inc. {=my:orgs/apple .prov:Organization label}

# People

## Me Myself {=my:person/me .prov:Person my:name}

Born on [1984-04-20T00:00:00.000Z] {my:birthdate ^^xsd:dateTime}

Phone: [+14155551234] {my:phone}
Email: [me@example.com] {my:email}

Works at [ACME Inc.] {+my:orgs/acme ?my:worksAt}

Knows [Alice] {+my:person/alice ?my:knows} and [Bob] {+my:person/bob ?my:knows}.

## Alice {=my:person/alice .prov:Person my:name}

Born on [1994-09-21T00:00:00.000Z] {my:birthdate ^^xsd:dateTime}

Phone: [+442071234567] {my:phone}
Email: [alice@example.com] {my:email}

Works at [ACME Inc.] {+my:orgs/acme ?my:worksAt}

Knows [Bob] {+my:person/bob ?my:knows} and [Charlie] {+my:person/charlie ?my:knows}.

## Bob {=my:person/bob .prov:Person my:name}

Born on [1978-02-21T00:00:00.000Z] {my:birthdate ^^xsd:dateTime}

Phone: [+12125559876] {my:phone}
Email: [bob@example.com] {my:email}

Works at [ACME Inc.] {+my:orgs/acme ?my:worksAt}

Knows [Charlie] {+my:person/charlie ?my:knows}.

## Charlie {=my:person/charlie .prov:Person my:name}

Born on [2000-01-01T00:00:00.000Z] {my:birthdate ^^xsd:dateTime}

Works at [Apple Inc.] {+my:orgs/apple ?my:worksAt}
```

Read this document without parsing it. It reads. "Alice knows Bob and Charlie." "Bob works at ACME Inc." "Person must have exactly one name." The prose is not interrupted by the annotations — the annotations are the prose. Now parse it, and the same text produces a complete RDF graph: organizations typed and labeled, people with contact details and social relationships, SHACL validation shapes with cardinality and datatype constraints. The document did not become something else in the process. It revealed what was already there.

This is the first crystallization point: the document and the graph are two faces of the same knowledge. You do not write the document *for* the graph, or the graph *from* the document. You write the document, and the graph is what you get. The annotations are explicit, so the parsing is deterministic. The same text, parsed by anyone at any time, produces the same quads. This is what makes the round trip safe: nothing is inferred, nothing is guessed, nothing is lost.

---

## From Text to Array

Parsing is one function call. The document goes in, and out comes everything the runtime needs.

```js
import { parse, generate } from 'mdld-parse'

const { quads, statements, origin, context, primary } = parse({ text: contacts })
```

The `quads` array is the computational representation — a plain JavaScript array where each element is an RDF quad with `subject`, `predicate`, `object`, and `graph` properties. The `primary` field tells you this document is about `my:contacts`, a `Container`. The `context` object holds the prefix map so you can generate back. The `statements` array holds elevated claims — we will return to this when we encounter the need to separate signal from scaffolding. The `origin` object maps every quad back to its birthplace in the source text — we will return to this when we need to trace a fact back to where it was written.

For now, the essential observation is that the entire document — its schema, its data, its relationships — compiled into a plain JavaScript array. That array is the runtime. Not a database. Not a triple store. Not a query engine. An array.

---

## Naming Things: IRIs, Prefixes, and Authority

Every node in a knowledge graph needs an identifier — an IRI (Internationalized Resource Identifier) that distinguishes Alice from every other Alice in the world. IRIs are the addresses of the semantic web, and MD-LD gives you three strategies for creating them, each suited to a different relationship between the author and the knowledge.

The first strategy is self-sovereign identity through the `tag:` scheme defined in RFC 4151. A tag IRI requires nothing beyond an email address or domain you control, and it carries your authority directly in the identifier itself:

```
tag:alice@example.com,2026:
     │                       │   └─ your subspace starts here
     │                       └──── year you controlled this email
     └─────────────────────────── your authority (email or domain)
```

Declare it once at the top of your document as a prefix, and every short name that follows expands to a globally unique IRI under your authority. `alice:person` becomes `tag:alice@example.com,2026:person`. `alice:journal/2026-05-06` becomes `tag:alice@example.com,2026:journal/2026-05-06`. No central registry, no certificate authority, no platform permission. The `tag:` scheme is yours by right of controlling the email address embedded in it, and anyone who sees the IRI can verify that authority.

The second strategy is content-addressed identity through the `nih:` scheme defined in RFC 6920. Where `tag:` identifies who created something, `nih:` identifies what something is — by its cryptographic hash. A `nih:sha-256;...` IRI is computed from the content itself, and two documents that produce the same hash are the same document, regardless of who wrote them or where they are stored. This is how you build local-first content-addressed graphs: each span of text, each code block, each embedded resource can receive an IRI that is intrinsic to its content. If the content changes, the IRI changes. If the content is the same across two machines, the IRI is the same. The `nih:` scheme gives you deduplication, integrity checking, and peer-to-peer synchronization without any coordination server.

The third strategy is the open web — `https://` IRIs that point to real locations on the internet. These are useful when your knowledge is about things that already have web addresses: Wikipedia articles, Wikidata entities, Schema.org types, API endpoints. A contact who works at `https://acme.com/` carries that organization's web identity directly in the graph.

All three strategies interoperate in the same document. Your personal nodes use `tag:` under your authority. Shared resources use `https://`. Content-addressed references use `nih:`. The graph does not care which strategy produced the IRI — it only cares that the IRI is unique and resolvable within the context of the documents that use it.

### Prefix Folding: Hierarchy Without Boilerplate

IRIs are long, and writing them out by hand would defeat the purpose of a human-readable format. MD-LD solves this with prefix declarations at the top of each document, and with prefix folding — the ability to build new prefixes on top of previously declared ones:

```md
[my] <tag:alice@example.com,2026:>
[j]  <my:journal/>
[p]  <my:projects/>
```

Now `j:2026-05-06` expands to `tag:alice@example.com,2026:journal/2026-05-06`, and `p:alpha` expands to `tag:alice@example.com,2026:projects/alpha`. The hierarchy emerges from the prefix chain, and the short forms keep the prose readable. Prefixes must be declared before they are referenced — no forward declarations, no circular references — and later declarations override earlier ones. This keeps parsing single-pass and deterministic.

Prefix folding scales to deep hierarchies. An organization with its own domain can build layers of sub-namespaces:

```md
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
[dev] <emp:developer/>
```

`dev:john` resolves through the chain to `https://org.example.com/person/employee/developer/john`. Each layer is a single declaration, and the full IRI is assembled at parse time. The document remains concise; the graph receives fully qualified identifiers.

Five prefixes are built in and require no declaration: `rdf`, `rdfs`, `xsd`, `sh`, and `prov`. When you write `.prov:Person`, the parser already knows that `prov:` means `http://www.w3.org/ns/prov#`. When you write `^^xsd:dateTime`, it knows that `xsd:` means `http://www.w3.org/2001/XMLSchema#`. The default vocabulary is RDFS — so bare `label` means `rdfs:label`, bare `comment` means `rdfs:comment`, and bare `.Class` means `rdf:type rdfs:Class`.

---

## The Array Is the Engine

With the document parsed into `Quad[]`, every question about your contacts becomes a JavaScript expression. There is no query language to learn, no endpoint to configure, no result format to parse. The graph is already in memory, and the `Array` prototype is already your query engine.

Find everyone who is a Person:

```js
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const PROV_PERSON = 'http://www.w3.org/ns/prov#Person'

const personIRIs = new Set(
  quads
    .filter(q => q.predicate.value === RDF_TYPE && q.object.value === PROV_PERSON)
    .map(q => q.subject.value)
)

// Set { 'tag:me@example.org,2026:person/me', '...alice', '...bob', '...charlie' }
```

Find who works at ACME:

```js
const WORKS_AT = 'tag:me@example.org,2026:worksAt'
const ACME = 'tag:me@example.org,2026:orgs/acme'

const acmePeople = quads
  .filter(q => q.predicate.value === WORKS_AT && q.object.value === ACME)
  .map(q => q.subject.value)

// [ 'tag:me@example.org,2026:person/me', '...alice', '...bob' ]
```

Find Alice's direct social connections:

```js
const KNOWS = 'tag:me@example.org,2026:knows'
const aliceIRI = 'tag:me@example.org,2026:person/alice'

const aliceKnows = quads
  .filter(q => q.subject.value === aliceIRI && q.predicate.value === KNOWS)
  .map(q => q.object.value)

// [ 'tag:me@example.org,2026:person/bob', '...charlie' ]
```

These are not abstractions over a graph engine. They operate directly on the array. The graph is already in the format JavaScript understands natively — objects in an array — and the query functions are the same `filter`, `map`, and `reduce` you use on any other data. When you need to scale, you build indexes from the same array using `Map` objects, and lookups become O(1). The index is not a special database feature; it is a derived data structure you create on demand and discard when you are done.

This is the second crystallization point: the query engine is not a separate system. It is the same language, the same runtime, the same data structure you already use for everything else. The graph does not live behind an API. It lives in a variable. You can log it, inspect it, serialize it, transform it, and compose it with any other JavaScript library or pattern. The boundary between "data" and "code" dissolves when the data is already in the shape your code expects.

---

## Walking the Graph

Direct lookups answer concrete questions, but the real power of a knowledge graph emerges when you traverse it — following edges from node to node and discovering indirect connections that are not visible in any single document section. One hop from "me" reaches Alice and Bob. Two hops — following Alice's and Bob's connections — reaches Bob, Charlie, and Charlie again. You have discovered the social neighborhood without writing a join, without configuring a traversal engine, and without leaving JavaScript.

```js
const neighbors = (quads, iri, predicate) =>
  quads
    .filter(q => q.subject.value === iri && q.predicate.value === predicate)
    .map(q => q.object.value)

const walk = (quads, iri, predicate, depth = 1) => {
  if (depth === 0) return [iri]
  const direct = neighbors(quads, iri, predicate)
  return direct.flatMap(n => walk(quads, n, predicate, depth - 1))
}

const me = 'tag:me@example.org,2026:person/me'

walk(quads, me, KNOWS, 1) // → [alice, bob]
walk(quads, me, KNOWS, 2) // → [bob, charlie, charlie]
```

The recursive `walk` function composes `neighbors` with itself, and each level of depth is another `flatMap`. A shortest-path search replaces `flatMap` with a BFS queue. A reachability check uses a `Set` to track visited nodes and avoids cycles. These are standard graph algorithms, and because the graph is a plain array, you can see every step, log every intermediate result, and debug every traversal without leaving your console. The social graph from this document has a clear structure: me connects to Alice and Bob, Alice connects to Bob and Charlie, Bob connects to Charlie, and Charlie has no outgoing connections. This is a directed graph in the `knows` dimension, and a bipartite graph in the `worksAt` dimension — three people at ACME, one at Apple. Both dimensions coexist in the same `Quad[]`, and you choose which predicate to traverse.

---

## Validation: Rules Live in the Same Document

The contacts document opens with a SHACL `NodeShape` that defines what a valid Person looks like: exactly one name, at least one email, exactly one birthdate, optional phone and knows and worksAt relationships. This shape is not separate from the data — it lives in the same document, parses into the same `Quad[]`, and can be queried with the same functions. The schema is a first-class citizen in the graph.

This means validation is a pure function of `Quad[]`. You read the shape's `sh:property` links to discover the rules, then check each person against those rules. No validation framework is required. The shape tells you what predicates to check, what datatypes to expect, and what cardinalities to enforce. You implement the logic, and the logic is trivial because the data is already in the shape you need.

```js
const MY_EMAIL = 'tag:me@example.org,2026:email'

const hasEmail = new Set(
  quads.filter(q => q.predicate.value === MY_EMAIL).map(q => q.subject.value)
)

const missingEmail = [...personIRIs].filter(iri => !hasEmail.has(iri))

console.log('Missing email:', missingEmail) // ['...charlie']
```

Charlie has no email — the validation catches it. In a larger document, you would iterate over the shape's `sh:property` entries and check each rule generically, but the principle is the same: the shape is data, the data is data, and validation is a function that compares one against the other. You can generate a validation report as a new set of quads and produce a new document. You can write the report back as an append-only entry. The round trip applies to validation just as it applies to everything else: shape goes in, validation result comes out, and the result is a document that can be read, parsed, and acted upon.

---

## One Document, Many Lenses

A single document can serve many audiences. The team dashboard needs active projects. The org chart needs reporting lines. The address book needs people and their contact details. Each of these is a view — a filtered subgraph extracted from the master graph and generated into a standalone document.

```js
const MY_NAME = 'tag:me@example.org,2026:name'
const MY_PHONE = 'tag:me@example.org,2026:phone'
const MY_BIRTHDATE = 'tag:me@example.org,2026:birthdate'

const contactPredicates = new Set([RDF_TYPE, MY_NAME, MY_EMAIL, MY_PHONE, MY_BIRTHDATE])

const contactQuads = quads.filter(q =>
  personIRIs.has(q.subject.value) && contactPredicates.has(q.predicate.value)
)

const { text: addressBook } = generate({ quads: contactQuads, context })
```

The `addressBook` variable now holds a clean MD-LD document containing only people and their contact details — no shapes, no organizations, no social relationships. It is a focused view that can be shared with someone who does not need the full document, and it is itself a valid MD-LD document that can be parsed back into quads and merged with other data. For a deeper view centered on one person, `generateNode` produces a document that includes the person and all direct connections — both outgoing and incoming — so you get Alice with her knows relationships and the reverse link showing who knows Alice:

```js
const { text: aliceView } = generateNode({
  quads,
  focusIRI: 'tag:me@example.org,2026:person/alice',
  context,
  compactInline: true,
  renderReverse: true
})
```

Views are not copies that drift out of sync. They are projections of the source graph, and they can be regenerated at any time from the source document. If the document changes — if Charlie gets an email address — you re-parse, re-filter, and re-generate. The view is always derivable from the source, and the source remains the single truth. This is the third crystallization point: every view is a function of the source document, and since the function is deterministic, the view is always consistent with the source. No sync protocol, no cache invalidation, no stale data. You derive what you need, when you need it.

---

## Growing Knowledge: Merge and Append

Knowledge grows incrementally. Dave joins the company, and his details arrive in a separate document. Later, someone adds his phone and email in another update. Neither document contains the full picture, but together they form a complete record.

Dave's initial entry:

```md
[my] <tag:me@example.org,2026:>

## Dave {=my:person/dave .prov:Person my:name}

Born on [1990-05-15T00:00:00.000Z] {my:birthdate ^^xsd:dateTime}

Works at [Apple Inc.] {+my:orgs/apple ?my:worksAt}
```

Dave's phone and email update:

```md
[my] <tag:me@example.org,2026:>

## Dave {=my:person/dave}

Phone: [+33123456789] {my:phone}
Email: [dave@example.com] {my:email}
```

Merging these documents into the existing graph is a single function call. Because all three documents share the same `[my]` prefix, the merge function concatenates them safely and produces deterministic results:

```js
import { merge } from 'mdld-parse'

const merged = merge([contacts, daveEntry, daveUpdate])
```

The `merged.quads` array now contains Dave with all his properties: name, birthdate, worksAt, phone, and email. The document boundary is organizational, not semantic. Multiple files sharing the same namespace merge into one graph because the IRIs they declare resolve to the same identifiers. You can split a large knowledge base across files for readability, or concatenate them into a single file for portability, and the result is the same.

This is the fourth crystallization point: the document is a unit of authorship, not a unit of semantics. People write in separate files because that is how humans organize their work — one file for contacts, another for projects, another for journal entries. But the graph does not care about file boundaries. It cares about IRIs. Two documents that declare the same prefix and reference the same identifiers are automatically part of the same graph. Merge is not an import operation or a synchronization protocol. It is concatenation with conflict resolution.

---

## Document Trees and Named Graphs

A knowledge base is rarely a single file. It is a tree — directories of documents, subdirectories of chapters, leaves of individual entries. The contacts file lives at `text/contacts.md`. Dave's profile lives at `text/people/dave.md`. The project spec lives at `text/projects/alpha.md`. Each file is an independent, self-contained MD-LD document that can be read, parsed, and understood on its own. But together they form a graph, and the merge operation needs to remember where each quad came from.

The `graph` parameter in `parse` stamps every quad produced from a document with a named graph IRI, identifying the source. When you parse each file with its path, the provenance chain becomes complete:

```js
const docs = [
  { path: 'text/contacts.md', text: contactsText },
  { path: 'text/people/dave.md', text: daveText },
  { path: 'text/projects/alpha.md', text: projectText }
]

const parsed = docs.map(d => parse({ text: d.text, graph: d.path }))

const kb = merge(parsed)
```

The merged `kb.origin.documents[]` array preserves each document's full origin — its blocks, spans, and quadIndex — alongside the document index that `locate()` returns. When you locate a quad in the merged graph, the result carries a `documentIndex` that points directly into this array, giving you the block and span topology of the specific source file that produced the quad. The chain is unbroken: from any quad in the merged graph, you can reach the exact characters in the exact file that authored it, walk the span chain to recover the surrounding prose, and understand the quad in its original context.

This is how directory trees and other data structures map to MD-LD texts. The file system is a natural hierarchy — directories contain documents, documents contain sections, sections contain annotations. The `graph` parameter preserves this structure in the semantic layer without forcing any coupling between files. Each document remains independent. The tree emerges when you compose them, and the provenance chain ensures that no fact in the merged graph is ever orphaned from the text that gave it life.

The same principle applies beyond file trees. A chat log is a sequence of timestamped documents. A version history is a branch of diffs. A research notebook is a collection of dated observations. Whatever organizational structure humans use to arrange their documents, the `graph` parameter and the merge origin give the computational layer a complete map back to where every piece of knowledge was written.

---

## Diffs as Documents

Every annotation in MD-LD carries polarity — a `+` prefix for assertions and a `-` prefix for retractions. This turns every edit into a document. You never delete text from a file; you write a new entry that retracts a previous assertion and asserts a new one.

Consider a project whose status changes from planning to active. The original document says:

```md
[my] <tag:you@example.com,2026:>

# Project Alpha {=my:alpha .my:Project label}

Status: [planning] {my:status}
```

A later update retracts the old status and asserts the new one:

```md
[my] <tag:you@example.com,2026:>

## Update {=my:alpha}

[planning] {-my:status}
[active] {my:status}
```

Merging these two documents produces a graph where `my:alpha` has status "active" only. The history of the change lives in the text — you can read both documents and see exactly what was retracted and what was asserted. The graph holds only the current truth. This is the same conflict resolution strategy used in CRDTs, and it works because every assertion and retraction is explicit in the text. The invariant always holds: a triple is never simultaneously present and retracted.

The same pattern scales to collaborative editing, audit trails, incremental backups, and even LLM-assisted knowledge management. An LLM proposes changes as a diff document. A human reviews the diff. If approved, the diff merges into the current state. The human stays in the loop, and every change is a readable document that can be archived, reversed, or replayed.

---

## From Journal to Graph: The Same Pattern, Different Scale

The contacts document demonstrates structural knowledge — people, organizations, validation rules. But the same round trip works for intimate, narrative knowledge. A researcher's journal entry, a student's observation, a meeting summary — all of these can carry the same explicit annotations without losing their natural voice.

A meeting note:

```md
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting label}

Attendees: **Alice** {+alice:alice ?alice:attendee label} and **Bob** {+alice:bob ?alice:attendee label}

Action items: **Review proposal** {+alice:task-1 ?alice:actionItem label}
```

A research paper's metadata:

```md
[alice] <tag:alice@example.com,2026:>

# Paper {=alice:paper-semantic-markdown .alice:ScholarlyArticle label}

[Semantic Web] {label}
[Alice Johnson] {+alice:alice-johnson ?alice:author}
[2024-01] {alice:datePublished ^^xsd:gYear}

> This paper explores semantic markup in Markdown. {comment @en}
```

A product specification:

```md
[products] <https://products.example.com/>

# Smart Watch {=products:watch-200 .products:Product label}

Display: [1.2" OLED] {products:screenSize label}
Battery: [48 hours] {products:batteryLife label}
Price: [$299] {products:price label ^^xsd:decimal}

Compatible with [iOS] {+products:ios ?products:compatibleWith label} and [Android] {+products:android ?products:compatibleWith label}
```

Each of these documents is a human artifact first. The annotations are part of the prose — "Attendees: **Alice**" reads naturally while simultaneously declaring a graph edge. Parse any of them, and you get a `Quad[]` that can be queried, traversed, validated, filtered, merged, and generated back. The round trip is the same regardless of whether the document describes people, papers, or products. The document is the interface. The array is the runtime. The transformation functions are the tools.

---

## When Facts Need Provenance

Some facts are structural — Alice is a Person, her name is "Alice", she works at ACME. These are direct assertions that need no justification beyond the document that states them. Other facts are claims — I met Alice at a conference, and I am 90% confident about this. Claims need provenance: who said it, when, with what confidence, derived from what source. In raw RDF, claims are wrapped in `rdf:Statement` reification, which means a single observation produces six or seven quads instead of one. The scaffolding overwhelms the signal, and querying the graph requires filtering through layers of reification to find the actual relationship you care about.

MD-LD handles this automatically during the same single pass that produces the main quads. When you type a subject as `rdf:Statement` and give it `rdf:subject`, `rdf:predicate`, and `rdf:object` properties, the parser extracts the inner triple into a separate `statements` array. You get two graphs for the price of one parse.

```md
## Claim: I met Alice at a conference {=my:claim-met-alice .rdf:Statement label}

[I] {+my:person/me ?rdf:subject} [met] {+my:met ?rdf:predicate} [Alice] {+my:person/alice ?rdf:object}.
Confidence: [0.9] {my:confidence ^^xsd:decimal}
```

```js
const { quads, statements } = parse({ text: claim })
```

The `quads` array holds the full provenance: the statement node, its subject-predicate-object decomposition, and the confidence value. The `statements` array holds the elevated triple: `my:person/me → my:met → my:person/alice`. A dashboard renders `statements` for a clean view of key relationships. An audit tool inspects `quads` for the full provenance trail. Both views came from the same document in the same function call, and you choose the level of detail you need.

This separation scales across an entire knowledge base. As claims accumulate — observations, inferences, corrections — the `statements` array becomes the golden graph: the set of relationships your system considers important enough to elevate. The `quads` array remains the complete record. Neither is derived from the other in a separate processing step; both are produced simultaneously during parsing. This is where the round trip deepens: not only does knowledge travel from text to graph and back, but the graph itself splits into layers of fidelity — the full record and the highlighted signal — without any extra work from the author.

> **For the full elevated statement syntax and detection rules,** see [Elevated Statements](./statements.md).

---

## The Bridge Back to Text

Every transformation in this article — querying, traversing, filtering, merging — operates on `Quad[]`. But knowledge is authored and read by humans, and humans work with text. The round trip would be incomplete if the connection between a quad and its source text were lost after parsing. A person reading the contacts document sees "Knows [Alice]" and understands the relationship. A program processing the same document sees a quad with subject `my:person/me`, predicate `my:knows`, object `my:person/alice`. The bridge between these two representations — the precise mapping from quad to the characters that produced it — is what the `origin` system preserves.

```js
import { locate } from 'mdld-parse'

const knowsAlice = quads.find(q =>
  q.subject.value === 'tag:me@example.org,2026:person/me' &&
  q.predicate.value === KNOWS &&
  q.object.value === 'tag:me@example.org,2026:person/alice'
)

const loc = locate(knowsAlice, origin)
// {
//   blockId: 'a7c3e12f',
//   range: { start: 612, end: 656 },
//   carrierType: 'span',
//   value: 'Alice',
//   polarity: '+'
// }
```

The `locate` function returns the block that produced the quad, the character range in the source text, the type of Markdown element that carried the annotation, and whether it was an assertion or a retraction. This is how you build click-to-jump editors: when a user clicks a graph node, you locate the quad, get the range, and scroll the editor to that exact position. No search, no guessing. The bridge is already built.

When you are working with a merged knowledge base — documents parsed with their file paths and composed into one graph — the provenance chain extends across document boundaries. The `locate()` result includes a `documentIndex` that maps into `origin.documents[]`, where each entry holds the full origin of a single source file: its blocks, its spans, its quad index. You can follow the chain from any quad in the merged graph to its source document, then into that document's block, then along the span chain to recover the surrounding context:

```js
// From a merged knowledge base, trace Dave's email back to its source
const daveEmail = kb.quads.find(q =>
  q.subject.value.includes('person/dave') && q.predicate.value.includes('email')
)

const loc = locate(daveEmail, kb.origin)

// loc.documentIndex → which file produced this quad
// loc.blockId       → which block in that file
// loc.range         → exact character positions

// Recover the source document's span chain for context
const srcDoc = kb.origin.documents[loc.documentIndex]
const srcBlock = srcDoc.origin.blocks.get(loc.blockId)

if (srcBlock.prevSpanId) {
  const span = srcDoc.origin.spans.get(srcBlock.prevSpanId)
  const prevBlock = srcDoc.origin.blocks.get(span.prevBlockId)
  // Now you have the text before and after the quad's birthplace
}
```

This is how you build tools that understand where knowledge comes from. An editor highlights the exact line. A validation tool reports errors with source locations. An AI agent traces a claim back through the document tree to the sentence that asserted it, reads the surrounding paragraph, and decides whether the claim is still valid. The provenance chain is not metadata added after the fact — it is produced during the same single pass that produces the quads themselves, and it survives the merge operation intact.

Origin goes deeper than point lookups. It structures each document as a walkable topology of blocks (semantic anchors that produced quads) connected by spans (the raw text between them), forming a doubly-linked chain: `[Block] --(Span)-- [Block] --(Span)-- [Block]`. You can walk this chain in both directions to recover context — the surrounding prose that gives any annotation its meaning. When an AI agent needs to understand not just what a fact says but what surrounds it in the author's original text, the span chain provides the neighborhood without any additional indexing. The parser never interprets span content; it just gives you byte ranges. Interpretation is your job, in your application layer, on top of the `Quad[]` runtime.

> **For the full origin API, span chain traversal, and context extraction patterns,** see [Origin System](./origin.md).

---

## A Shared Vocabulary: What Graphs Say to Each Other

A graph built under `tag:alice@example.com,2026:` and a graph built under `tag:bob@example.org,2026:` use different IRIs for their subjects, but they can still talk to each other if they share predicates. The predicate is the contract: it defines what a relationship means, and any graph that uses the same predicate IRI is making the same kind of claim. This is where ontologies — shared vocabularies of classes and properties — become the connective tissue between independent knowledge graphs.

MD-LD ships with five foundational W3C ontologies built into its default context. RDF provides the grammar: every statement is a subject-predicate-object triple, and `rdf:type` is how you declare what kind of thing a node is. RDFS provides the schema: `rdfs:label` for display names, `rdfs:comment` for descriptions, `rdfs:subClassOf` for type hierarchies, `rdfs:member` for collection membership. XSD provides literal types: `xsd:integer`, `xsd:dateTime`, `xsd:boolean`, and all the other datatypes that make a value parseable rather than merely readable. SHACL provides validation: `sh:NodeShape` and `sh:PropertyShape` define what valid data looks like, and every shape parses into the same `Quad[]` as the data it validates. PROV-O provides provenance: `prov:Entity`, `prov:Activity`, `prov:Agent` and the relationships between them trace who did what when, and how outputs were derived from inputs.

These five ontologies are not optional accessories — they are the language that MD-LD speaks by default. When you write `.prov:Person`, you are asserting that a node belongs to a class defined by a W3C standard, and any other graph that uses `prov:Person` is talking about the same concept. When you write `^^xsd:dateTime`, you are asserting that a value can be parsed by any system that understands the XML Schema datetime format. The interoperability is not negotiated at runtime; it is embedded in the IRIs themselves.

Beyond the built-in five, a growing ecosystem of public ontologies covers the domains that knowledge graphs commonly need. FOAF models people, organizations, and social relationships. DCTERMS provides metadata terms for describing any resource — title, creator, date, license. SKOS represents concept schemes, thesauri, and controlled vocabularies. Schema.org covers the structured data vocabulary that search engines understand. SOSA models sensor observations and IoT data. QUDT provides quantities, units, and dimensional analysis. Each of these ontologies can be declared as a prefix in your document, and their classes and properties become available as first-class citizens in your graph:

```md
[foaf] <http://xmlns.com/foaf/0.1/>
[dct] <http://purl.org/dc/terms/>
[skos] <http://www.w3.org/2004/02/skos/core#>
```

The choice of ontology is a choice of audience. If you use Schema.org predicates, your graph speaks directly to search engines. If you use FOAF predicates, your graph interoperates with the decades-old semantic social web. If you use PROV-O predicates, your graph carries the provenance that reproducibility and audit require. You can mix vocabularies freely — a person can be both `foaf:Person` and `prov:Agent` — and the graph simply accumulates the type assertions. The interoperability is in the predicates, and the predicates are IRIs that anyone can resolve.

This is the fifth crystallization point: a knowledge graph is a social artifact. The IRIs you choose for your predicates determine who can understand your graph without translation. The built-in ontologies guarantee that every MD-LD document speaks a baseline of RDF, RDFS, XSD, SHACL, and PROV-O that any RDF tool can process. Additional ontologies extend this baseline into specific domains. And when no existing ontology fits, you author your own predicates under your `tag:` namespace — they are still IRIs, they are still unambiguous, and they can be published and adopted by others at any time.

---

## The Round Trip Closes

The contacts document demonstrates the complete cycle. The document is authored as Markdown with semantic annotations — readable without any tool, parseable according to a clear specification. It is parsed into `Quad[]` — a plain JavaScript array that serves as the universal computational representation. From that array, you query your world (who works at ACME?), traverse relationships (who is two hops from me?), validate data (who is missing an email?), generate views (address book, org chart), merge updates (Dave arrives, Dave gets a phone), separate signal from noise (elevated statements for the dashboard, full quads for audit), and trace any fact back to the text that asserted it (origin).

```
Documents (tree)
  ↓  parse({text, graph: path})
Quad[]  +  statements[]  +  origin{}
  ↓  merge
Quad[]  with provenance to source documents
  ↓
filter · map · reduce
traverse · validate
index · merge
elevate · locate
generate
  ↓
Quad[]
  ↓
Document
```

Knowledge is never trapped inside a database. Documents become graphs. Graphs become programs. Programs produce new documents. Those documents can be parsed back into graphs, and the cycle continues. The `graph` parameter preserves the document tree in every quad. The `tag:` and `nih:` IRI schemes give every node an identity that is either self-sovereign or content-addressed. The built-in W3C ontologies give every predicate a meaning that any RDF tool can interpret. The `statements[]` array gives you the golden graph — signal separated from scaffolding. The `origin{}` object gives you the bridge back to source text — every quad traceable through the merge to its birthplace in a specific file, down to the exact characters and the span chain around them. Together they form a complete semantic surface: the data, the highlights, the document provenance, and the map back to where it all came from.

The useful observation is not that this approach eliminates infrastructure. Databases remain useful for scale, and SPARQL remains useful for complex federated queries. The useful observation is that the semantic representation survives independently of any particular infrastructure. A document written today can be parsed a decade from now by anyone who knows the specification. The graph can be reconstructed. Indexes can be rebuilt. Views can be regenerated. Validation can be re-run. The operational machinery is optional. The semantics remain visible. And the runtime is simply `Quad[]` — a plain JavaScript array, composed with pure functions, producing documents that humans can read, machines can parse, and agents can reason over.

This is the knowledge round trip. The document is where it starts, and the document is where it returns. Everything in between is computation — and computation, in this model, is just functions over arrays.
