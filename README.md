# MD-LD

**Markdown-Linked Data (MD-LD)** — a deterministic, streaming-friendly RDF authoring format that extends Markdown with explicit `{...}` annotations.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Demo](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse) 

## 🚀 Quick Start

```bash
pnpm install mdld-parse
```

```javascript
import { parse } from 'mdld-parse';

const result = parse(`
[ex] <http://example.org/>

# Document {=ex:doc .ex:Article label}

[Alice] {?ex:author =ex:alice .prov:Person ex:firstName label}
[Smith] {ex:lastName}`);

console.log(result.quads);
// RDF/JS quads ready for n3.js, rdflib, etc.
// @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
// @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
// @prefix prov: <http://www.w3.org/ns/prov#>.
// @prefix ex: <http://example.org/>.

// ex:doc a ex:Article;
//     rdfs:label "Document";
//     ex:author ex:alice.
// ex:alice a prov:Person;
//     rdfs:label "Alice";
//     ex:firstName "Alice";
//     ex:lastName "Smith".
```

## 📚 Documentation Hub

- **📖 [Documentation](./docs/index.md)** - Complete documentation with guides and references
- **🎯 [Examples](./examples/index.md)** - Real-world MD-LD examples and use cases  
- **📋 [Specification](./spec/index.md)** - Formal specification and test suite

## ✨ Core Features

- **🔗 Prefix folding** - Build hierarchical namespaces with lightweight IRI authoring
- **📍 Subject declarations** - `{=IRI}` and `{=#fragment}` for context setting
- **🎯 Object IRIs** - `{+IRI}` and `{+#fragment}` for temporary object declarations  
- **🔄 Three predicate forms** - `p` (S→L), `?p` (S→O), `!p` (O→S)
- **🏷️ Type declarations** - `.Class` for rdf:type triples
- **📅 Datatypes & language** - `^^xsd:date` and `@en` support
- **🧩 Fragments** - Document structuring with `{=#fragment}`
- **⚡ Polarity system** - Sophisticated diff authoring with `+` and `-` prefixes
- **📍 Origin tracking** - Complete provenance with lean quad-to-source mapping
- **🎯 Elevated statements** - Automatic rdf:Statement pattern detection for "golden" graph extraction

## 🌟 What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using explicit `{...}` annotations:

```markdown
[my] <tag:alice@example.com,2026:>
# 2024-07-18 {=my:journal-2024-07-18 .my:Event my:date ^^xsd:date}
## A good day {label}
Mood: [Happy] {my:mood}
Energy level: [8] {my:energyLevel ^^xsd:integer}
Met [Sam] {+my:sam .my:Person ?my:attendee} on my regular walk at [Central Park] {+my:central-park ?my:location .my:Place label @en} and talked about [Sunny] {my:weather} weather. 
```

Generates valid RDF triples with complete provenance tracking.

## 📦 Installation

### Node.js

```bash
pnpm install mdld-parse
```

```javascript
import { parse } from 'mdld-parse';

const markdown = `# Document {=ex:doc .Article}
[Alice] {author}`;

const result = parse({
  text: markdown,
  context: { ex: 'http://example.org/' }
});

console.log(result.quads);
// RDF/JS quads ready for n3.js, rdflib, etc.
```

### Browser (ES Modules)

```html
<script type="module">
  import { parse } from 'https://cdn.jsdelivr.net/npm/mdld-parse/+esm';
  
  const result = parse('# Hello {=ex:hello label}');
</script>
```

## 🧠 Semantic Model

MD-LD encodes a directed labeled multigraph where three nodes may be in scope:

- **S** — current subject (IRI)
- **O** — object resource (IRI from link/image)
- **L** — literal value (string + optional datatype/language)

### Predicate Routing (§8.1)

Each predicate form determines the graph edge:

| Form  | Edge    | Example                      | Meaning          |
|-------|---------|------------------------------|------------------|
| `p`   | S → L   | `[Alice] {name}`             | literal property |
| `?p`  | S → O   | `[NASA] {=ex:nasa ?org}`     | object property  |
| `!p` | O → S    | `[Parent] {=ex:p !hasPart}`  | reverse object   |

## 📍 Elevated Statements

MD-LD automatically detects `rdf:Statement` patterns during parsing and extracts elevated SPO quads for convenient consumption by applications.

### Pattern Detection

When the parser encounters a complete `rdf:Statement` pattern with `rdf:subject`, `rdf:predicate`, and `rdf:object`, it automatically adds the corresponding SPO quad to the `statements` array:

```markdown
[ex] <http://example.org/>

## Elevated statement {=ex:stmt1 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *knows* {+ex:knows ?rdf:predicate} **Bob** {+ex:bob ?rdf:object}

Direct statement:**Alice** {=ex:alice} knows **Bob** {?ex:knows +ex:bob} 
```

## 🎨 Syntax Quick Reference

### Subject Declaration
Set current subject (emits no quads):
```markdown
## Apollo 11 {=ex:apollo11}
```

### Fragment Syntax
Create fragment IRIs relative to current subject:
```markdown
# Document {=ex:document}
{=#summary}
[Content] {label}
```
Fragments replace any existing fragment and require a current subject.

### Type Declaration
Emit `rdf:type` triple:
```markdown
## Apollo 11 {=ex:apollo11 .ex:SpaceMission .ex:Event}
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
Declare resources inline with `{=iri}`:
```markdown
# Mission {=ex:apollo11}
[Neil Armstrong] {=ex:armstrong ?ex:commander .prov:Person}
```

## 🔧 API Reference

### `parse({ text, context, dataFactory, graph })`

Parse MD-LD markdown and return RDF quads with lean origin tracking.

**Parameters (named object):**
- `text` (string, required) — MD-LD formatted text
- `context` (object, optional) — Prefix mappings (default: `{ '@vocab': 'http://www.w3.org/2000/01/rdf-schema#', rdf, rdfs, xsd, sh, prov }`)
- `dataFactory` (object, optional) — Custom RDF/JS DataFactory
- `graph` (string, optional) — Named graph IRI

**Returns:** `{ quads, remove, statements, origin, context, primarySubject }`

> **Legacy:** `parse(text, options)` still works for backward compatibility

- `quads` — Array of RDF/JS Quads (final resolved graph state)
- `remove` — Array of RDF/JS Quads (external retractions targeting prior state)
- `statements` — Array of elevated RDF/JS Quads extracted from rdf:Statement patterns
- `origin` — Lean origin tracking object with quadIndex for UI navigation
- `context` — Final context used (includes prefixes)
- `primarySubject` — String IRI or null (first non-fragment subject declaration)

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**
- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings (merged with DEFAULT_CONTEXT)

**Returns:** `{ quads, remove, origin, context, primarySubjects }`

- `quads` — Array of RDF/JS Quads (final resolved graph state)
- `remove` — Array of RDF/JS Quads (external retractions targeting prior state)
- `origin` — Merge origin tracking with document index and polarity
- `context` — Final merged context
- `primarySubjects` — Array of string IRIs (primary subjects from each document, in merge order)

### `generate({ quads, context, primarySubject })`

Generate deterministic MDLD from RDF quads with visual styling.

**Parameters (named object):**
- `quads` (array, required) — Array of RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings (default: `{}`)
- `primarySubject` (string, optional) — String IRI to place first in output (ensures round-trip safety). If not provided, falls back to the first subject from quads.

**Returns:** `{ text, context }`

**Features:**
- Visual carrier styles based on datatype (code spans for numbers, bold booleans, etc.)
- Label-in-heading: Uses `rdfs:label` in subject headings when available
- Multiple labels: First label in heading, additional labels rendered as literals
- Round-trip safe: All data preserved through parse → generate → parse
- Composable: `generate(parse(text))` extracts semantics; `parse(generate({quads}))` normalizes quads

### `generateNode({ quads, focusIRI, context })`

Generate node-centric MDLD showing all quads where a specific IRI appears in any position.

**Parameters (named object):**
- `quads` (array, required) — Array of RDF/JS Quads to search
- `focusIRI` (string, required) — The IRI to center the view on
- `context` (object, optional) — Prefix mappings (default: `{}`)

**Returns:** `{ text, context }`

**Behavior (Safety-First):**
- If `focusIRI` is null/undefined: Returns empty text
- If `focusIRI` not in graph: Returns empty text (never falls back to all data)
- If `quads` is empty: Returns empty text

**Safety rationale:** Prevents accidental rendering of entire databases on misspelled IRIs—critical for production use with LLM cost per token. Explicit emptiness signals "not found" to the caller.

**Use case:** Perfect for exploring a specific node and all its relationships—where it appears as subject, object, predicate, type, or datatype. Creates an exhaustive view of everything related to the focus IRI. Ideal for node-centric knowledge graph explorers.

### Composition Patterns

With the unified named parameter API, `parse()` and `generate()` compose seamlessly through object spreading:

```javascript
import { parse, generate, generateNode } from 'mdld-parse';

// Pattern 1: parse → generate (semantic extraction)
const canonical = generate({ ...parse({ text, context }) });
// text → quads → canonical MDLD (deterministic, visual styling applied)

// Pattern 2: generate → parse (normalize external RDF)
const normalized = parse({ ...generate({ quads: externalQuads, context }) });
// external quads → MDLD → validated quads (DataFactory-safe, no blank nodes)

// Pattern 3: parse → generateNode (node-centric exploration)
const nodeView = generateNode({ ...parse({ text }), focusIRI: 'http://example.org/alice' });
// full graph → isolated node view (safe: returns empty if IRI not found)
```

**Why this works:**
- `parse()` returns `{ quads, context, primarySubject, ... }`
- `generate()` accepts `{ quads, context, primarySubject }`
- `generateNode()` accepts `{ quads, context, focusIRI }` (with focusIRI override)
- Perfect shape alignment enables elegant `{ ...spread }` composition

### `locate(quad, origin)`

Locate the origin entry for a quad using the lean origin system.

**Parameters:**
- `quad` (object) — The quad to locate (subject, predicate, object)
- `origin` (object) — Origin object containing quadIndex

**Returns:** `{ blockId, range, carrierType, subject, predicate, context, value, polarity }` or `null`

### `render(quads, options)`

Render RDF quads as HTML+RDFa for web display.

**Parameters:**
- `quads` (array) — Array of RDF/JS Quads to render
- `options` (object, optional):
  - `context` (object) — Prefix mappings for CURIE shortening
  - `baseIRI` (string) — Base IRI for resolving relative references

**Returns:** `{ html, context }`

### Utility Functions

```javascript
import {
  DEFAULT_CONTEXT,    // Default prefix mappings
  DataFactory,        // RDF/JS DataFactory instance
  hash,              // String hashing function
  expandIRI,         // IRI expansion with context
  shortenIRI,        // IRI shortening with context
  parseSemanticBlock // Parse semantic block syntax
} from 'mdld-parse';
```

## 🏗️ Architecture

### Design Principles
- **Zero dependencies** — Pure JavaScript, ~15KB minified
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Standards-compliant** — RDF/JS data model
- **Origin tracking** — Full round-trip support with source maps
- **Explicit semantics** — No guessing, inference, or heuristics

### RDF/JS Compatibility
Quads are compatible with:
- [`n3.js`](https://github.com/rdfjs/N3.js) — Turtle/N-Triples serialization
- [`rdflib.js`](https://github.com/linkeddata/rdflib.js) — RDF store and reasoning
- [`sparqljs`](https://github.com/RubenVerborgh/SPARQL.js) — SPARQL queries
- [`rdf-ext`](https://github.com/rdf-ext/rdf-ext) — Extended RDF utilities

## 🧪 Testing

The parser includes comprehensive tests covering all spec requirements:

```bash
npm test
```

Tests validate:
- Subject declaration and context
- All predicate forms (p, ?p, !p)
- Datatypes and language tags
- Explicit list item annotations
- Code blocks and blockquotes
- Round-trip serialization
