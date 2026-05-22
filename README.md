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
- **🏷️ Primary metadata** - Structured primary object with subject, type, and label for document identity

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

const markdown = `[ex] <tag:alice@example.org,2026:>

# Demo document {=ex:example/doc .prov:Entity label}

> A demo document for MD-LD {comment}
[Alice] {+ex:alice ?ex:author .prov:Person label}
`;

const result = parse({ text: markdown });

console.log(result.quads);
// RDF/JS quads ready for n3.js, rdflib, etc.
```

### Browser (ES Modules)

```html
<script type="module">
  import { parse } from 'https://cdn.jsdelivr.net/npm/mdld-parse/+esm';
  
  const result = parse('[ex] <tag:alice@example.org,2026:>\n\n# Hello {=ex:hello label}');
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
| `p`   | S → L   | `[Alice] {label}`            | literal property |
| `?p`  | S → O   | `[NASA] {=ex:nasa ?org}`     | object property  |
| `!p`  | O → S   | `[Parent] {=ex:p !hasPart}`  | reverse object   |

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

**Returns:** `{ quads, remove, statements, origin, context, primarySubject, primary, md }`

- `quads` — Array of RDF/JS Quads (final resolved graph state)
- `remove` — Array of RDF/JS Quads (external retractions targeting prior state)
- `statements` — Array of elevated RDF/JS Quads extracted from rdf:Statement patterns
- `origin` — Lean origin tracking object with quadIndex for UI navigation
- `context` — Final context used (includes prefixes)
- `primarySubject` — String IRI or null (canonical append identity)
- `primary` — Object containing primary metadata (semantic surface descriptor)
- `md` — Clean Markdown with all MD-LD annotations stripped (round-trip safe)

**Dual-Layer Architecture:**

| Layer | Field | Purpose | Use Cases |
|-------|-------|---------|-----------|
| **Canonical Identity** | `primarySubject` | Append routing, storage, synchronization | `append()`, file placement, authority validation |
| **Semantic Surface** | `primary` | UI, indexing, navigation, agent orientation | Dashboards, search, previews, timelines |

**Primary Object Structure:**
```javascript
primary: {
    subject: string | null,     // First non-fragment subject declaration
    type: string | null,       // First rdf:type declaration
    label: string | null       // First rdfs:label literal
}
```

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**
- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings (merged with DEFAULT_CONTEXT)

**Returns:** `{ quads, remove, origin, context, primarySubjects, primary }`

- `quads` — Array of RDF/JS Quads (final resolved graph state)
- `remove` — Array of RDF/JS Quads (external retractions targeting prior state)
- `origin` — Merge origin with document tracking
- `context` — Final context used (includes prefixes)
- `primarySubjects` — Array of string IRIs (canonical append identities, ordered by merge)
- `primary` — Array of primary objects (semantic surface descriptors, ordered by merge)

**Dual-Layer Architecture:**

| Layer | Field | Purpose | Use Cases |
|-------|-------|---------|-----------|
| **Canonical Identity** | `primarySubjects` | Append routing, storage, synchronization | Multi-document append, file organization |
| **Semantic Surface** | `primary` | UI, indexing, navigation, agent orientation | Vault indexing, document discovery, search |

**Primary Object Array Structure:**
```javascript
primary: [
    {
        subject: string | null,     // First non-fragment subject declaration
        type: string | null,       // First rdf:type declaration
        label: string | null       // First rdfs:label literal
    },
    // ... one object per document
]
```


### `generate({ quads, context, primarySubject, compactInline })`

Generate deterministic MDLD from RDF quads with visual styling.

**Parameters (named object):**
- `quads` (array, required) — Array of RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings (default: `{}`)
- `primarySubject` (string, optional) — String IRI to place first in output (ensures round-trip safety). If not provided, falls back to the first subject from quads.
- `compactInline` (boolean, optional) — Enable inline type/label compaction for referenced subjects (default: `true`)

**Returns:** `{ text, context, compactStats }`

- `text` (string) — Generated MDLD text
- `context` (object) — Full context with all prefixes used
- `compactStats` (object) — Compaction metrics:
  - `compactedSubjects` (number) — Subjects compacted with inline types/labels
  - `skippedHeadings` (number) — Headings skipped due to compaction
  - `inlineAnnotations` (number) — Inline type/label annotations rendered

**Features:**
- Visual carrier styles based on datatype (code spans for numbers, bold booleans, etc.)
- Label-in-heading: Uses `rdfs:label` in subject headings when available
- Multiple labels: First label in heading, additional labels rendered as literals
- Inline compaction: Types and labels of referenced subjects rendered inline (when `compactInline = true`)
- Reverse connections: Primary subject's incoming connections rendered as `!p` annotations
- Round-trip safe: All data preserved through parse → generate → parse
- Composable: `generate(parse(text))` extracts semantics; `parse(generate({quads}))` normalizes quads

### `generateNode({ quads, focusIRI, context, compactInline })`

Generate node-centric MDLD showing all quads where a specific IRI appears in any position.

**Parameters (named object):**
- `quads` (array, required) — Array of RDF/JS Quads to search
- `focusIRI` (string, required) — The IRI to center the view on
- `context` (object, optional) — Prefix mappings (default: `{}`)
- `compactInline` (boolean, optional) — Enable inline type/label compaction (default: `true`)

**Returns:** `{ text, context, compactStats }`

- `text` (string) — Generated MDLD text
- `context` (object) — Full context with all prefixes used
- `compactStats` (object) — Compaction metrics (or `null` if focusIRI not found)

**Behavior (Safety-First):**
- If `focusIRI` is null/undefined: Returns empty text
- If `focusIRI` not in graph: Returns empty text (never falls back to all data)
- If `quads` is empty: Returns empty text

**Safety rationale:** Prevents accidental rendering of entire databases on misspelled IRIs—critical for production use with LLM cost per token. Explicit emptiness signals "not found" to the caller.

**Use case:** Perfect for exploring a specific node and all its relationships—where it appears as subject, object, predicate, type, or datatype. Creates an exhaustive view of everything related to the focus IRI. Ideal for node-centric knowledge graph explorers.

### `updateValue()` — Update Quad Carrier Text in Source Text

Update the carrier text of a literal quad in MDLD text. Only the carrier content is replaced — datatype (`^^xsd:integer`) and language (`@en`) annotations inside the `{…}` block are preserved as-is, since they are part of the annotation, not the carrier.

```javascript
import { parse, updateValue } from 'mdld-parse';

const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

[Alice Smith] {ex:author}`;

const result = parse({ text: mdld });
const authorQuad = result.quads.find(q =>
    q.subject.value === 'http://example.org/article' &&
    q.predicate.value === 'http://example.org/author'
);

const updatedText = updateValue({
    text: mdld,
    quad: authorQuad,
    value: 'Bob Johnson',
    origin: result.origin  // optional (auto-parses if not provided)
});

console.log(updatedText);
// [ex] <http://example.org/>
//
// # Article {=ex:article .ex:Article}
//
// [Bob Johnson] {ex:author}
```

**Annotation annotations are preserved:**
```javascript
// Original: > 25 {ex:age ^^xsd:integer}
updateValue({ text, quad, value: '30' });
// Result:   > 30 {ex:age ^^xsd:integer}  ← datatype preserved

// Original: > Hello {ex:greeting @en}
updateValue({ text, quad, value: 'Good morning' });
// Result:   > Good morning {ex:greeting @en}  ← language tag preserved
```

**Parameters:**
- `text` (string) — The original MDLD text
- `quad` (object) — The quad to update (subject, predicate, object)
- `value` (string) — The new carrier text to set
- `origin` (object, optional) — ParseResult.origin (auto-parses if not provided)

**Returns:** Updated MDLD text, or original text if update fails (fail-safe)

**How it works:**
- Uses `locate()` to find the quad's position in the source text
- Uses `valueRange` to replace only the carrier text (excluding carrier markers like `[`, `]`)
- Annotation block `{…}` with predicate, datatype, language is untouched
- Auto-parses if result not provided (convenient but less efficient)

**Fail-safe behavior:**
- Returns original text if quad cannot be located
- Returns original text if valueRange is not available
- Never corrupts the source text

**Use case:** Perfect for editor applications that need to update literal values while preserving carrier syntax, datatype annotations, and language tags.

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
- `parse()` returns `{ quads, context, primarySubject, md, ... }`
- `generate()` accepts `{ quads, context, primarySubject }`
- `generateNode()` accepts `{ quads, context, focusIRI }` (with focusIRI override)
- Perfect shape alignment enables elegant `{ ...spread }` composition

### The `md` Field — Clean Markdown Extraction

Every `parse()` result includes a `md` field containing the original Markdown with all MD-LD annotations stripped:

```javascript
const result = parse({
  text: `# Document {=ex:doc .Article}\n[Content] {ex:content}`,
  context: { ex: 'http://example.org/' }
});

console.log(result.md);
// # Document\nContent

// Round-trip safety: re-parsing clean MD produces zero quads
const reparsed = parse({ text: result.md });
console.log(reparsed.quads.length); // 0
```

**Behavior:**
- Valid MD-LD annotations (`{=...}`, `{+...}`, `{...}`) are completely removed
- Content from value carriers (`[text]`, `**bold**`, `` `code` ``) is preserved
- Invalid syntax (annotations not at end-of-line) is preserved as visible markers
- Headings, lists, blockquotes, code blocks maintain their structure
- Prefix declarations at start of line are stripped
- Standalone subject declarations (`{=ex:subject}`) are stripped

**Use cases:**
- **Content extraction** — Get readable Markdown without semantic markup
- **Syntax validation** — Remaining `{...}` patterns indicate invalid MD-LD syntax
- **Round-trip testing** — `parse(md).md` should parse to zero quads
- **Preview generation** — Show clean document before publishing

### `locate(quad, origin)`

Locate the origin entry for a quad using the lean origin system.

**Parameters:**
- `quad` (object) — The quad to locate (subject, predicate, object)
- `origin` (object) — Origin object containing quadIndex

**Returns:** `{ blockId, range, valueRange, carrierType, subject, predicate, context, value, polarity }` or `null`

- `range`: Full character range including carrier markers (e.g., `[`, `]`, `{`, `}`)
- `valueRange`: Character range excluding carrier markers (null if not available)

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
pnpm test
```

Tests validate:
- Subject declaration and context
- All predicate forms (p, ?p, !p)
- Datatypes and language tags
- Explicit list item annotations
- Code blocks and blockquotes
- Round-trip serialization
