# MD-LD Parse

**Markdown-Linked Data (MD-LD)** — a human-friendly RDF authoring format that extends Markdown with semantic annotations.

[NPM](https://www.npmjs.com/package/mdld-parse)

[Website](https://mdld.js.org)

## What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using familiar syntax:

```markdown
# My Note {=urn:mdld:my-note-20251231 .NoteDigitalDocument}

[ex]{: http://example.org/}

Written by [Alice Johnson](=ex:alice){author .Person}

## Alice's biography {=ex:alice}

[Alice](ex:alice){name} works at [Tech Corp](=ex:tech-corp){worksFor .Organization}
```

This generates valid RDF triples while remaining readable as plain Markdown.

```n-quads
<urn:mdld:my-note-20251231> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/NoteDigitalDocument> .
<urn:mdld:my-note-20251231> <http://schema.org/author> <http://example.org/alice> .
<http://example.org/alice> <http://schema.org/name> "Alice" .
<http://example.org/alice> <http://schema.org/worksFor> <http://example.org/tech-corp> .
```

## Architecture

### Design Principles

1. **Streaming First** — Process documents incrementally without loading entire AST into memory
2. **Zero Dependencies** — Pure JavaScript, runs in Node.js and browsers
3. **Standards Compliant** — Outputs RDF quads compatible with RDFa semantics
4. **Markdown Native** — Plain Markdown yields minimal but valid RDF
5. **Progressive Enhancement** — Add semantics incrementally via attributes
6. **BaseIRI Inference** — Automatically infers baseIRI from document structure
7. **Default Vocabulary** — Provides default vocabulary for common properties, extensible via options

### Stack Choices

#### Parser: Custom Zero-Dependency Tokenizer

We implement a **minimal, purpose-built parser** for maximum control and zero dependencies:

- **Custom Markdown tokenizer** — Line-by-line parsing of headings, lists, paragraphs, code blocks
- **Inline attribute parser** — Pandoc-style `{=iri .class key="value"}` attribute extraction
- **RDF quad generator** — Direct mapping from tokens to RDF/JS quads

**Why custom?**

- **Zero dependencies** — Runs anywhere JavaScript runs
- **Lightweight** — ~15KB minified, no AST overhead
- **Focused** — Optimized specifically for MD-LD semantics
- **Transparent** — Easy to understand and extend
- **Fast** — Single-pass parsing with minimal allocations

#### RDF Output: RDF/JS Data Model

We implement the [RDF/JS specification](https://rdf.js.org/data-model-spec/):

```javascript
{
  termType: 'NamedNode' | 'BlankNode' | 'Literal',
  value: string,
  language?: string,
  datatype?: NamedNode
}
```

This ensures compatibility with:

- `n3.js` — Turtle/N-Triples serialization
- `rdflib.js` — RDF store and reasoning
- `sparqljs` — SPARQL query parsing
- `rdf-ext` — Extended RDF utilities

### Processing Pipeline

```
Markdown Text
    ↓
[Custom Tokenizer] — Extract headings, lists, paragraphs, code blocks
    ↓
[Attribute Parser] — Parse {=iri .class key="value"} from tokens
    ↓
[Inline Parser] — Extract [text](url){attrs} spans
    ↓
[RDF Quad Generator] — Map tokens to RDF/JS quads
    ↓
RDF Quads (RDF/JS format)
    ↓
[Optional] n3.js Writer → Turtle/N-Triples
```

### Architecture Benefits

The zero-dependency design provides:

1. **Single-pass parsing** — Process document once, emit quads immediately
2. **Minimal memory** — No AST construction, only token stream
3. **Predictable performance** — Linear time complexity, bounded memory
4. **Easy integration** — Works in Node.js, browsers, and edge runtimes

## Installation

### Node.js

```bash
npm install mdld-parse
```

```javascript
import { parse } from "mdld-parse";

const markdown = `# Hello {=urn:mdld:hello .Article}`;
const result = parse(markdown);
const quads = result.quads;
```

### Browser (via CDN)

```html
<script type="importmap">
	{
		"imports": {
			"mdld-parse": "https://cdn.jsdelivr.net/npm/mdld-parse/+esm"
		}
	}
</script>

<script type="module">
	import { parse } from "mdld-parse";
	// use parse...
</script>
```

## API

### `parse(markdown, options)`

Parse MD-LD markdown and return parsing result.

**Parameters:**

- `markdown` (string) — MD-LD formatted text
- `options` (object, optional):
  - `baseIRI` (string) — Base IRI for relative references
  - `context` (object) — Additional context to merge with default context
  - `dataFactory` (object) — Custom RDF/JS DataFactory (default: built-in)

**Returns:** Object containing:
- `quads` — Array of RDF/JS Quads
- `origin` — Object with `blocks` and `quadIndex` for serialization
- `context` — Final context used for parsing

### `serialize({ text, diff, origin, options })`

Serialize RDF changes back to markdown with proper positioning.

**Parameters:**

- `text` (string) — Original markdown text
- `diff` (object) — Changes to apply:
  - `add` — Array of quads to add
  - `delete` — Array of quads to remove
- `origin` (object) — Origin object from parse result
- `options` (object, optional) — Additional options

**Returns:** Object containing:
- `text` — Updated markdown text
- `origin` — Updated origin object

```javascript
const result = parse(
	`
# Article Title {=ex:article .Article}

Written by [Alice](ex:alice) {ex:author}
`,
	{
		baseIRI: "http://example.org/doc",
		context: {
      '@vocab': 'http://schema.org/',
    },
	}
);

// result.quads[0] = {
//   subject: { termType: 'NamedNode', value: 'http://example.org/doc#article' },
//   predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//   object: { termType: 'NamedNode', value: 'http://schema.org/Article' },
//   graph: { termType: 'DefaultGraph' }
// }
```

## Implementation Details

### Subject Resolution

MD-LD follows a clear subject inheritance model:

1. **Root subject** — Declared in the first heading of the document or inferred it's text content
2. **Heading subjects** — `## Title {=ex:title .Type}`
3. **Inline subjects** — `[text](=ex:text) {.Type}`
4. **Blank nodes** — Generated for incomplete triples

```markdown
# Document {=urn:mdld:doc .Article}

## Section 1 {=urn:mdld:sec1 .Section} 

[Text] {name} ← property of sec1

Back to [doc](=urn:mdld:doc) {hasPart}
```

### List Handling

```markdown {item}
- Item 1
- Item 2
```

Creates **multiple triples** with same predicate (not RDF lists):

```turtle
<subject> schema:item "Item 1" .
<subject> schema:item "Item 2" .
```

### Code Block Semantics

```markdown
\`\`\`sparql {=ex:query-1 .SoftwareSourceCode}
SELECT \* WHERE { ?s ?p ?o }
\`\`\`
```

Creates:

- A `schema:SoftwareSourceCode` resource (or custom type via `typeof`)
- `schema:programmingLanguage` from the info string (`sparql`)
- `schema:text` with the raw source code
- `schema:hasPart` link from the surrounding section

This enables semantic queries like "find all SPARQL queries in my notes."

## Syntax Overview

### Core Features

**Subject Declaration** — Headings create typed subjects:

```markdown
## Alice Johnson {=ex:alice .Person}
```

**Literal Properties** — Inline spans create properties:

```markdown
[Alice Johnson] {name}
[30] {age ^^xsd:integer}
```

**Object Properties** — Links create relationships:

```markdown
[Tech Corp](=ex:company) {worksFor}
```

**Lists** — Repeated properties:

```markdown {tag}
- Item 1
- Item 2
```
