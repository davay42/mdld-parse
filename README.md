# MD-LD

**Markdown-Linked Data (MD-LD)** — Human-readable RDF authoring for knowledge graph applications.

Write semantic data in natural Markdown. Parse to RDF quads. Build deterministic state machines.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Demo](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse)

## 🎯 What is MD-LD?

MD-LD makes RDF quads easy to write and read by humans. It extends Markdown with explicit `{...}` annotations to create a **human-readable CRDT-style semantic state machine**.

**Core value:** Author and maintain knowledge graphs as plain text with deterministic round-trip safety.

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

// Generate MDLD from quads
const { text } = generate({ quads: result.quads });

// Merge multiple documents (CRDT-style)
const merged = merge([doc1, doc2, doc3]);
```

## 💡 Use Cases

### 1. **App State Management**
Store application state as append-only document arrays with diff resolution:

```javascript
const session = {
  documents: [
    initialState,    // Document 1: initial state
    userAction1,     // Document 2: user added data
    userAction2,     // Document 3: user modified data
    userAction3      // Document 4: user deleted data (with retractions)
  ]
};

const currentState = merge(session.documents);
```

**Benefits:** Time travel, undo/redo, offline-first sync, audit trails.

### 2. **State Exchange Between Apps**
Reliably exchange semantic state between microservices or client-server:

```javascript
// App A sends state to App B
const stateTransfer = {
  documents: appA.documents.slice(-10),  // Last 10 operations
  context: appA.context
};

// App B receives and merges
const mergedState = merge([...appB.documents, ...stateTransfer.documents]);
```

**Benefits:** Deterministic resolution, conflict handling, human-readable format.

### 3. **LLM Knowledge Graph Operations**
LLMs can author MDLD, filter quads, and generate readable summaries:

```javascript
// LLM authors MDLD
const llmAuthored = `
# Analysis {=ex:analysis .Analysis}
[High priority] {ex:priority}
[Complete] {ex:status}
`;

// Parse to quads
const { quads } = parse({ text: llmAuthored });

// LLM filters quads (semantic reasoning)
const highPriority = quads.filter(q => 
  q.predicate.value === 'http://example.org/priority' &&
  q.object.value === 'High priority'
);

// Generate readable MDLD from filtered quads
const { text } = generate({ quads: highPriority });
```

**Benefits:** LLMs get both structured data (quads) and human-readable text (MDLD).

### 4. **Multi-User Collaboration**
Collaborative editing with automatic conflict resolution:

```javascript
// User A's session
const userA = [initialState, userA_addsTask, userA_updatesTask];

// User B's session
const userB = [initialState, userB_addsTask, userB_updatesTask];

// Merge both sessions
const merged = merge([...userA, ...userB]);
```

**Benefits:** Last-write-wins resolution, preserved history, manual review possible.

## 📚 Documentation Hub

- **📖 [Documentation](./docs/index.md)** — Complete documentation with guides and references
- **🎯 [Examples](./examples/index.md)** — Real-world MD-LD examples and use cases
- **📋 [Specification](./spec/index.md)** — Formal specification and test suite

## ✨ Core Features

- **🔗 Prefix folding** — Build hierarchical namespaces with lightweight IRI authoring
- **📍 Subject declarations** — `{=IRI}` and `{=#fragment}` for context setting
- **🎯 Object IRIs** — `{+IRI}` and `{+#fragment}` for temporary object declarations
- **🔄 Three predicate forms** — `p` (S→L), `?p` (S→O), `!p` (O→S)
- **🏷️ Type declarations** — `.Class` for rdf:type triples
- **📅 Datatypes & language** — `^^xsd:date` and `@en` support
- **🧩 Fragments** — Document structuring with `{=#fragment}`
- **⚡ Polarity system** — Sophisticated diff authoring with `+` and `-` prefixes
- **📍 Origin tracking** — Complete provenance with lean quad-to-source mapping
- **🎯 Elevated statements** — Automatic rdf:Statement pattern detection
- **🏷️ Primary metadata** — Structured primary object for document identity

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
```

### Browser (ES Modules)

```html
<script type="module">
  import { parse } from 'https://cdn.jsdelivr.net/npm/mdld-parse/+esm';
  const result = parse('[ex] <http://example.org/>\n\n# Hello {=ex:hello label}');
</script>
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
- `remove` — RDF/JS Quads (external retractions)
- `statements` — Elevated SPO quads from rdf:Statement patterns
- `origin` — Lean origin tracking for UI navigation
- `context` — Final context with prefixes
- `primarySubject` — String IRI or null (canonical append identity)
- `primary` — Primary metadata (subject, type, label)
- `md` — Clean Markdown with annotations stripped

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**
- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings

**Returns:** `{ quads, remove, origin, context, primarySubjects, primary }`

- `quads` — RDF/JS Quads (final resolved graph state)
- `remove` — RDF/JS Quads (external retractions)
- `origin` — Merge origin with document tracking
- `context` — Final context with prefixes
- `primarySubjects` — Array of string IRIs (canonical identities)
- `primary` — Array of primary metadata objects

**Use case:** CRDT-style state management with append-only documents.

### `generate({ quads, context, primarySubject, compactInline, renderReverse })`

Generate deterministic MDLD from RDF quads.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings
- `primarySubject` (string, optional) — IRI to place first in output
- `compactInline` (boolean, optional) — Inline type/label compaction (default: `false`)
- `renderReverse` (boolean, optional) — Reverse connections as `!p` (default: `false`)

**Returns:** `{ text, context, compactStats }`

- `text` — Generated MDLD text
- `context` — Full context with prefixes
- `compactStats` — Compaction metrics

**Features:** Visual styling, label-in-heading, round-trip safe.

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
- **Zero dependencies** — Pure JavaScript, ~15KB minified
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Standards-compliant** — RDF/JS data model
- **Deterministic** — Same input always produces same output
- **Explicit semantics** — No guessing, inference, or heuristics

### RDF/JS Compatibility
Quads work with:
- [`n3.js`](https://github.com/rdfjs/N3.js) — Turtle/N-Triples serialization
- [`rdflib.js`](https://github.com/linkeddata/rdflib.js) — RDF stores
- [`sparqljs`](https://github.com/RubenVerborgh/SPARQL.js) — SPARQL queries
- [`rdf-ext`](https://github.com/rdf-ext/rdf-ext) — RDF utilities

## 🧪 Testing

```bash
pnpm test
```

132 tests covering all spec requirements.
