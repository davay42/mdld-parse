# MD-LD

**Markdown-Linked Data** — Write RDF knowledge graphs as plain Markdown. Parse to quads, generate back, merge documents. Zero dependencies, round-trip safe.

MD-LD is the only RDF format that is both writable by humans and parseable by machines in the same document. Unlike Turtle (write-only), JSON-LD (machine-only), and RDFa (embedded-in-HTML-only), MD-LD annotations flow with natural Markdown prose — making knowledge graphs readable without a renderer.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Homepage](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse)


## 📚 Documentation Hub

- **📋 [Specification](./spec/index.md)** — Formal specification and test suite
- **📖 [Documentation](./docs/index.md)** — Complete documentation with guides and references
- **🎯 [Examples](./examples/index.md)** — Real-world MD-LD examples and use cases
- **📚 [Grammar](./grammar/index.md)** — EBNF+TextMate grammar specifications
- **🧩 [Ontologies](./ontologies/index.md)** — W3C and related standard ontologies used in RDF

## 🎯 What is MD-LD?

MD-LD is not just another RDF syntax. It's a **universal semantic writing interface** that removes the intermediary between human text and machine-readable graphs.

Traditional systems require:
```
Human → UI → App Logic → Hidden Database → APIs → Exports
```

MD-LD enables:
```
Human text → Graph immediately
```

**Core value:** Author and maintain knowledge graphs as plain text with deterministic round-trip safety. No platforms, databases, or proprietary SaaS mediation required.

```markdown
[ex] <tag:ame@example.com,2026:>

# Alice {=ex:alice .prov:Person label}

[Alice Smith] {ex:fullName}
[alice@example.com] {ex:email}
```

**Generates RDF quads** that work with n3.js, rdflib, and any RDF/JS-compatible library.


## 🚀 Quick Start

```bash
pnpm install mdld-parse
```

```javascript
import { parse, generate, merge } from 'mdld-parse';

// Parse MDLD to RDF quads
const result = parse({ text: mdldString });
console.log(result.quads); // RDF/JS quads
console.log(result.primary); // Primary metadata (subject, type, label, comment)
console.log(result.statements); // Elevated statements
console.log(result.origin); // Provenance tracking

// Generate MDLD from quads
const { text } = generate({ quads: result.quads });

// Merge multiple documents (CRDT-style)
const merged = merge([doc1, doc2, doc3]);
```

## 💡 Why MD-LD?

### The Problem with Current Systems

Most software today uses graphs internally but hides them behind UIs:
- **Notion, Slack, Google Docs** — Human interfaces over hidden graphs
- **CRMs, task apps, note apps** — Proprietary data silos
- **Social networks** — Platform-controlled knowledge prisons

Users cannot access the graph directly. Semantics are hidden. Data is locked in products.

### The MD-LD Solution

MD-LD removes the intermediary. Writing becomes publishing. Publishing becomes graph construction.

**Key benefits:**

- **Graph sovereignty** — You own text, graph, provenance, execution, history
- **No central platform required** — Works offline, in browsers, on servers
- **Universal semantic substrate** — Agents can read, reason, write, execute, validate
- **Continuous semantic narrative** — Unifies chat, tasks, notes, emails, calendar, files
- **Native time dimension** — Every action, statement, correction becomes part of the graph
- **Decentralized authority** — RFC 4151 tag: URIs enable self-sovereign identity without central registries
- **Text-native agent memory**  - LLM Agent memory substrate in plain text — parse context, write knowledge, merge with other agents, all as Markdown files. No database required.

### Real-World Applications

#### Personal Knowledge Management
```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting label}

Attendees:
**Alice** {+alice:alice ?alice:attendee label}
**Bob** {+alice:bob ?alice:attendee label}

Action items:
**Review proposal** {+alice:task-1 ?alice:actionItem label}
```

#### Developer Documentation
```markdown
[api] <tag:brian@example.org,2026:app/api/>
# Get User by ID {=api:/users/:id .api:Endpoint label}

Method: [GET] {+api:methods/GET ?api:method}
Path: [/users/:id] {api:path}
Status: [OK] {api:status}
```

#### Academic Research
```markdown
[alice] <tag:alice@example.org,2026:>
# Semantic Web {=alice:research/paper-semantic-markdown .alice:ScholarlyArticle label}
Is part of [semantic research] {+alice:research/semantic !member}

Authored by [Alice Johnson] {+alice:alice-johnson ?alice:author} on [2026-08-12] {alice:datePublished ^^xsd:date}.
```

#### Content Management
```markdown
[blog] <tag:justin@example.org,2026:>
# Understanding MD-LD {=blog:post-mdld .blog:Post label}

[MD-LD] {blog:emphasized} allows you to embed RDF directly in Markdown.
```

## ✨ Core Features

- **🔗 Prefix folding** — Build hierarchical namespaces with CURIE-based IRI authoring
- **📍 Subject declarations** — `{=IRI}` and `{=#fragment}` for context setting
- **🎯 Object IRIs** — `{+IRI}` and `{+#fragment}` for temporary object declarations
- **🔄 Three predicate forms** — `p` (S→L), `?p` (S→O), `!p` (O→S)
- **🏷️ Type declarations** — `.Class` for rdf:type triples
- **📅 Datatypes & language** — `^^xsd:date` and `@en` support
- **🧩 Fragments** — Document structuring with `{=#fragment}`
- **⚡ Polarity system** — Sophisticated diff authoring with `+` and `-` prefixes
- **📍 Origin tracking** — Complete provenance with lean quad-to-source mapping
- **🔗 Span chains** — Walkable textual topology between semantic blocks for context recovery and resonance
- **🎯 Elevated statements** — Automatic rdf:Statement pattern detection
- **🏷️ Primary metadata quartet** — Subject, type, label, comment for document identity
- **🔄 Round-trip safety** — Deterministic parse ↔ generate cycles

**Bundle size:** 86KB unminified, 20KB gzipped

## 📦 Installation

### Node.js

```bash
pnpm install mdld-parse
node -e "
import { parse } from 'mdld-parse';
console.log(parse({ text: '# Test {=tag:test@example.org,2026:index .prov:Entity label}' }));
"
```

### Browser ESM (importmap)

```html
<script type="importmap">
{
  "imports": {
    "mdld-parse": "https://cdn.jsdelivr.net/npm/mdld-parse/+esm",
  }
}
</script>
<script type="module">
  import { parse } from 'mdld-parse';
  const result = parse('[ex] <tag:my@example.com,2026:test/>\n\n# Hello {=ex:init .prov:Activity label}');
</script>
```

### Example use in browser console

You can copy and paste this code into your browser console to see the list of tasks as an easy to render JSON object. 

```javascript
const mdld = await import('https://cdn.jsdelivr.net/npm/mdld-parse/+esm')

const text = `[my] <tag:alice@example.org:>

# Tasks {=my:tasks .prov:Collection label}

## Task 1 {=my:tasks/1 .prov:Activity label}
One of my [urgent] {my:tasks/status} [tasks] {+my:tasks !prov:hadMember}
> Explore deeper the concept of a triple in RDF {comment}

## Task 2 {=my:tasks/2 .prov:Activity label}
One of my [tasks] {+my:tasks !prov:hadMember}
> Start building knowledge graphs {comment}
`;

const result = parse({ text });

function extractByType (quads, type) {
  return Object.values(
    quads.reduce((acc, q) => {
      const s = q.subject.value;
      const key = q.predicate.value.split(/[#/]/).pop();

      (acc[s] ??= { iri: s })[key] = q.object.value;

      return acc;
    }, {})
  )
  .filter(x => x.type === type)
  .map(({ type, ...x }) => x);
}

const tasks = extractByType(result.quads,"http://www.w3.org/ns/prov#Activity")

console.log(tasks);
/*
[
  {
    "iri": "tag:alice@example.org:tasks/1",
    "label": "Task 1",
    "status": "urgent",
    "comment": "Explore deeper the concept of a triple in RDF"
  },
  {
    "iri": "tag:alice@example.org:tasks/2",
    "label": "Task 2",
    "comment": "Start building knowledge graphs"
  }
]
*/
```

## 🧠 Semantic Model

MD-LD encodes a directed labeled multigraph where three nodes may be in scope:

- **S** — current subject (IRI)
- **O** — object resource (IRI from link/image)
- **L** — literal value (string + optional datatype/language)

### Predicate Routing

Each predicate form determines the graph edge:

| Form  | Edge    | Example                      | Meaning          |
|-------|---------|------------------------------|------------------|
| `p`   | S → L   | `[Alice] {label}`            | literal property |
| `?p`  | S → O   | `[NASA] {=ex:nasa ?org}`     | object property  |
| `!p`  | O → S   | `[Parent] {=ex:p !hasPart}`  | reverse object   |

## 🎨 Syntax Quick Reference

### Subject Declaration

Set current subject (emits no quads):

```markdown
[ex] <tag:nasa@example.org,2026:>
## Apollo 11 {=ex:apollo11}
```

### Type Declaration

Emit `rdf:type` triple:

```markdown
[ex] <tag:nasa@example.org,2026:>
## Apollo 11 {=ex:apollo11 .ex:SpaceMission .prov:Entity}
```

### Literal Properties

Inline value carriers emit literal properties:

```markdown
[ex] <tag:nasa@example.org,2026:>
# Mission {=ex:apollo11}
[Neil Armstrong] {ex:commander}
[1969] {ex:year ^^xsd:gYear}
[Historic mission] {ex:description @en}
```

### Object Properties

Links create relationships (use `?` prefix):

```markdown
[ex] <tag:nasa@example.org,2026:>
# Mission {=ex:apollo11}
[NASA] {=ex:nasa ?ex:organizer}
```

### Resource Declaration

Declare resources inline with `{+iri}`:

```markdown
[ex] <tag:nasa@example.org,2026:>
# Mission {=ex:apollo11}
[Neil Armstrong] {+ex:armstrong ?ex:commander .Person}
```

### Diff Authoring (Polarity)

Use `+` and `-` for retractions:

```markdown
[ex] <tag:carol@example.org,2026:>

New student [Alice] {=ex:new-student .prov:Person ex:name} is our [class] {+ex:my-class !member}. I think she might know [Bob] {+ex:bob ?ex:knows}.

**Correction:** [Her] {=ex:new-student} name is not [Alice] {-ex:name}, it's [Ellie] {ex:name}.

**Correction:** I asked her directly - no, she doesn't know [him] {+ex:bob -?ex:knows}.

**IRI replacement:** Let's create a proper [Class] {=ex:my-class} record for [Ellie] {+ex:Ellie .prov:Person ex:name label ?member} instead of temporary [Ellie] {+ex:new-student -.prov:Person -ex:name -?member} record created earlier.
```

After `generate(parse({text}))` would look like this:
```markdown
[ex] <tag:carol@example.org,2026:>

# Ellie {=ex:Ellie .prov:Person label}
[Ellie] {ex:name}

# my-class {=ex:my-class}
[ex:Ellie] {+ex:Ellie ?member}
```


## 🔧 API Reference

### `parse({ text, context, dataFactory, graph })`

Parse MDLD to RDF quads with lean origin tracking.

**Parameters:**
- `text` (string, required) — MDLD formatted text
- `context` (object, optional) — Prefix mappings
- `dataFactory` (object, optional) — Custom RDF/JS DataFactory
- `graph` (string, optional) — Named graph IRI

**Returns:** `{ quads, remove, statements, origin, context, primarySubject, primary, md }`

- `quads` — RDF/JS Quads (final resolved graph state)
- `remove` — RDF/JS Quads (external retractions for diff workflows)
- `statements` — Elevated SPO quads from rdf:Statement patterns
- `origin` — Lean origin tracking: `quadIndex`, `blocks`, `spans`, `documentStructure`
- `context` — Final context with prefixes
- `primarySubject` — String IRI or null (canonical append identity)
- `primary` — Primary metadata quartet: `{ subject, type, label, comment }`
- `md` — Clean Markdown with annotations stripped

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**
- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings

**Returns:** `{ quads, remove, statements, origin, context, primarySubjects, primary }`

- `quads` — RDF/JS Quads (final resolved graph state)
- `remove` — RDF/JS Quads (external retractions)
- `statements` — Elevated statements from all documents
- `origin` — Merge origin with document tracking
- `context` — Final context with prefixes
- `primarySubjects` — Array of string IRIs (canonical identities)
- `primary` — Array of primary metadata objects

**Use case:** CRDT-style state management with append-only documents.

### `generate({ quads, context, primarySubject, compactInline, renderReverse, remove, lang })`

Generate deterministic MDLD from RDF quads.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings
- `primarySubject` (string, optional) — IRI to place first in output
- `compactInline` (boolean, optional) — Inline type/label compaction (default: `false`)
- `renderReverse` (boolean, optional) — Reverse connections as `!p` (default: `false`)
- `remove` (array, optional) — RDF/JS Quads to retract (for diff generation)
- `lang` (string, optional) — Preferred language for labels (e.g., `'en'`, `'es'`, `'fr'`). Priority: specified lang → untagged → English → any language

**Returns:** `{ text, context, compactStats }`

- `text` — Generated MDLD text
- `context` — Full context with prefixes
- `compactStats` — Compaction metrics

**Features:** Visual styling, label-in-heading, round-trip safe, diff generation, language preference.

**Example with language preference:**
```javascript
const { text } = generate({
  quads: result.quads,
  lang: 'es'  // Prefer Spanish labels
});
```

### `generateNode({ quads, focusIRI, context, compactInline, renderReverse, lang })`

Generate node-centric MDLD for a specific IRI.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to search
- `focusIRI` (string, required) — IRI to center view on
- `context` (object, optional) — Prefix mappings
- `compactInline` (boolean, optional) — Inline compaction (default: `true`)
- `renderReverse` (boolean, optional) — Reverse connections (default: `true`)
- `lang` (string, optional) — Preferred language for labels (e.g., `'en'`, `'es'`, `'fr'`). Priority: specified lang → untagged → English → any language

**Returns:** `{ text, context, compactStats }`

**Safety:** Returns empty text if focusIRI not found (prevents accidental full database rendering).

### `updateValue({ text, quad, value, origin })`

Update carrier text of a literal quad in MDLD text.

**Parameters:**
- `text` (string) — Original MDLD text
- `quad` (object) — Quad to update
- `value` (string) — New carrier text
- `origin` (object, optional) — ParseResult.origin

**Returns:** Updated MDLD text (fail-safe)

**Use case:** Editor applications updating literal values.

### `locate(quad, origin)`

Locate quad origin entry for UI navigation.

**Returns:** `{ blockId, range, valueRange, carrierType, ... }` or `null`

### Utility Functions

```javascript
import {
  DEFAULT_CONTEXT,    // Default prefix mappings
  DataFactory,        // RDF/JS DataFactory
  hash,              // String hashing
  expandIRI,         // IRI expansion
  shortenIRI,        // IRI shortening
  parseSemanticBlock // Semantic block parsing
} from 'mdld-parse';
```

## 🏗️ Architecture

### Design Principles
- **Zero dependencies** — Pure JavaScript, 85KB unminified (20KB gzipped)
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Character-based tokenization** — 20-28% faster than regex-based approaches
- **Standards-compliant** — RDF/JS data model, W3C CURIE 1.0 syntax
- **Deterministic** — Same input always produces same output
- **Explicit semantics** — No guessing, inference, or heuristics
- **Dual-layer origin** — Every parse emits both a semantic quad graph and a walkable textual topology graph simultaneously

### Origin: Blocks and Spans

The parser output includes a complete document chain at no extra cost:

```
[Block] --(Span)-- [Block] --(Span)-- [Block]
```

- **Blocks** (`origin.blocks`) — semantic anchors: tokens that produced RDF quads, with `prevSpanId`/`nextSpanId` links
- **Spans** (`origin.spans`) — textual observations: raw byte ranges between blocks, with bidirectional block and span links

Spans store no text — content is always recovered via `sourceText.slice(span.range[0], span.range[1])`. This unlocks context-aware UI, autocomplete neighborhood retrieval, and cross-document topology without any parser-level interpretation.

### Performance Characteristics
- **Real-time (60fps):** Up to 4,527 quads per frame
- **Batch processing:** Up to 225,059 quads per second
- **Memory efficient:** ~640 bytes per quad retained after GC
- **Streaming-friendly:** Full document never in memory

### RDF/JS Compatibility
Quads work with:
- [`n3.js`](https://github.com/rdfjs/N3.js) — Turtle/N-Triples serialization
- [`rdflib.js`](https://github.com/linkeddata/rdflib.js) — RDF stores
- [`sparqljs`](https://github.com/RubenVerborgh/SPARQL.js) — SPARQL queries
- [`rdf-ext`](https://github.com/rdf-ext/rdf-ext) — RDF utilities

### Standards Compliance
- **RDF 1.1** — Core RDF concepts
- **RDFS** — Schema vocabulary
- **PROV-O** — Provenance ontology
- **SHACL** — Constraint validation
- **W3C CURIE 1.0** — Compact URI syntax

## 🧪 Testing

```bash
pnpm test
```

Comprehensive test suite covering:
- Syntax parsing and tokenization
- Context management and prefix folding
- Polarity system and retractions
- Elevated statements detection
- Primary metadata extraction
- Round-trip parse/generate cycles
- Origin tracking and provenance

## Governance

MD-LD is a craft project. Its coherence comes from a single evolving understanding of how semantic text should work — not from consensus, but from sustained attention to the same problem over time.

This means:

- Decisions are made by the steward, informed by discussion and use
- The project prioritizes conceptual integrity over inclusiveness
- Contributions that align with the model are welcomed and incorporated
- Contributions that expand scope without deepening coherence are respectfully declined
- The spec will not grow features to attract users — it will grow depth to serve understanding

## Licensing

MD-LD is currently published as copyrighted source material.

The project is under active development and no open-source license has been selected yet.

Individuals, researchers, educators, and non-commercial users are welcome to experiment with the technology.

Organizations interested in production or commercial use should contact the author.

The long-term governance and licensing model remains under evaluation.

The primary goal at this stage is preserving the simplicity, interoperability, and long-term integrity of the system while the ecosystem forms around it.
