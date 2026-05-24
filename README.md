# MD-LD

**Markdown-Linked Data** — Human-friendly knowledge graph authoring.

Write semantic data in natural Markdown, parse to RDF quads, build deterministic state machines.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Demo](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse)

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
[ex] <http://example.org/>

# Document {=ex:doc .Article label}

[Alice] {=ex:alice ?ex:author .prov:Person ex:firstName label}
[Smith] {ex:lastName}
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

### Real-World Applications

#### Personal Knowledge Management
```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting}

Attendees:
- **Alice** {+alice:alice ?alice:attendee label}
- **Bob** {+alice:bob ?alice:attendee label}

Action items:
- **Review proposal** {+alice:task-1 ?alice:actionItem label}
```

#### Developer Documentation
```markdown
# API Endpoint {=api:/users/:id .api:Endpoint}

[GET] {api:method}
[/users/:id] {api:path}
```

#### Academic Research
```markdown
# Paper {=alice:paper-semantic-markdown .alice:ScholarlyArticle}

[Semantic Web] {label}
[Alice Johnson] {=alice:alice-johnson ?alice:author}
[2024-01] {alice:datePublished ^^xsd:gYear}
```

#### Content Management
```markdown
# Understanding MD-LD {=blog:post-mdld .blog:Post}

[MD-LD] {blog:emphasized label} allows you to embed RDF directly in Markdown.
```

## 📚 Documentation Hub

- **📖 [Documentation](./docs/index.md)** — Complete documentation with guides and references
- **🎯 [Examples](./examples/index.md)** — Real-world MD-LD examples and use cases
- **📋 [Specification](./spec/index.md)** — Formal specification and test suite
- **🔄 [Diff Generation](./docs/diff.md)** — Automatic diff document generation for CRDT workflows

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
- **🎯 Elevated statements** — Automatic rdf:Statement pattern detection
- **🏷️ Primary metadata quartet** — Subject, type, label, comment for document identity
- **🔄 Round-trip safety** — Deterministic parse ↔ generate cycles

## 📦 Installation

### Node.js

```bash
pnpm install mdld-parse
```

```javascript
import { parse, generate, merge } from 'mdld-parse';

const mdld = `[ex] <http://example.org/>

# Document {=ex:doc .Article label}

[Alice] {=ex:alice ?ex:author .prov:Person ex:firstName label}
[Smith] {ex:lastName}`;

const result = parse({ text: mdld });
console.log(result.quads); // RDF/JS quads
console.log(result.primary); // { subject, type, label, comment }
console.log(result.statements); // Elevated statements
```

### Browser (ES Modules)

```html
<script type="module">
  import { parse } from 'https://cdn.jsdelivr.net/npm/mdld-parse/+esm';
  const result = parse('[ex] <http://example.org/>\n\n# Hello {=ex:hello label}');
</script>
```

**Bundle size:** 84KB unminified, 19KB gzipped

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
## Apollo 11 {=ex:apollo11}
```

### Type Declaration
Emit `rdf:type` triple:
```markdown
## Apollo 11 {=ex:apollo11 .SpaceMission .Event}
```

### Literal Properties
Inline value carriers emit literal properties:
```markdown
# Mission {=ex:apollo11}
[Neil Armstrong] {ex:commander}
[1969] {ex:year ^^xsd:gYear}
[Historic mission] {ex:description @en}
```

### Object Properties
Links create relationships (use `?` prefix):
```markdown
# Mission {=ex:apollo11}
[NASA] {=ex:nasa ?ex:organizer}
```

### Resource Declaration
Declare resources inline with `{+iri}`:
```markdown
# Mission {=ex:apollo11}
[Neil Armstrong] {+ex:armstrong ?ex:commander .Person}
```

### Diff Authoring (Polarity)
Use `+` and `-` for retractions:
```markdown
# Update value
[Person] {=ex:person}
[Alice] {-ex:name}
[Bob] {ex:name}

# Remove triple
[Person] {=ex:person}
[Alice] {-ex:friend}
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
- `origin` — Lean origin tracking for UI navigation
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

### `generate({ quads, context, primarySubject, compactInline, renderReverse, remove })`

Generate deterministic MDLD from RDF quads.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings
- `primarySubject` (string, optional) — IRI to place first in output
- `compactInline` (boolean, optional) — Inline type/label compaction (default: `false`)
- `renderReverse` (boolean, optional) — Reverse connections as `!p` (default: `false`)
- `remove` (array, optional) — RDF/JS Quads to retract (for diff generation)

**Returns:** `{ text, context, compactStats }`

- `text` — Generated MDLD text
- `context` — Full context with prefixes
- `compactStats` — Compaction metrics

**Features:** Visual styling, label-in-heading, round-trip safe, diff generation.

### `generateNode({ quads, focusIRI, context, compactInline, renderReverse })`

Generate node-centric MDLD for a specific IRI.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to search
- `focusIRI` (string, required) — IRI to center view on
- `context` (object, optional) — Prefix mappings
- `compactInline` (boolean, optional) — Inline compaction (default: `true`)
- `renderReverse` (boolean, optional) — Reverse connections (default: `true`)

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
- **Zero dependencies** — Pure JavaScript, 84KB unminified (19KB gzipped)
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Character-based tokenization** — 20-28% faster than regex-based approaches
- **Standards-compliant** — RDF/JS data model, W3C CURIE 1.0 syntax
- **Deterministic** — Same input always produces same output
- **Explicit semantics** — No guessing, inference, or heuristics

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

## 📚 Additional Resources

- **[Documentation](./docs/index.md)** — Complete guides and references
- **[Specification](./spec/index.md)** — Formal specification
- **[Examples](./examples/index.md)** — Real-world examples
- **[Grammar](./grammar/mdld.ebnf)** — EBNF grammar specification
- **[VS Code Extension](https://marketplace.visualstudio.com/)** — Syntax highlighting (coming soon)
