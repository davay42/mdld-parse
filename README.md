# MD-LD Parse

**Markdown-Linked Data (MD-LD)** — a human-friendly RDF authoring format that extends Markdown with semantic annotations.

[NPM](https://www.npmjs.com/package/mdld-parse)

## What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using familiar syntax:

```markdown
# My Note {id="urn:mdld:my-note-20251231" .NoteDigitalDocument}

Written by [Alice Johnson](=ex:alice){author .Person}

## Alice's biography {=ex:alice}

[Alice](ex:alice){name} works at [Tech Corp](=ex:tech-corp){worksFor .Organization}
```

This generates valid RDF triples while remaining readable as plain Markdown.

```n-quads
<urn:mdld:my-note-20251231> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/NoteDigitalDocument> .
<urn:mdld:my-note-20251231> <http://www.w3.org/2000/01/rdf-schema#label> "My Note" .
<urn:mdld:my-note-20251231> <http://schema.org/author> "Alice Johnson" .
<http://example.org/alice> <http://www.w3.org/2000/01/rdf-schema#label> "Alice's biography" .
<http://example.org/alice> <http://schema.org/name> "Alice" .
<http://example.org/alice> <http://schema.org/worksFor> "Tech Corp" .
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
- **Inline attribute parser** — Pandoc-style `{=iri #id .class key="value"}` attribute extraction
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
[Attribute Parser] — Parse {#id property="value"} from tokens
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
import { parseMDLD } from "mdld-parse";

const markdown = `# Hello {#hello typeof="Article"}`;
const quads = parseMDLD(markdown, {
	baseIRI: "http://example.org/doc",
});
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
	import { parseMDLD } from "mdld-parse";
	// use parseMDLD...
</script>
```

## API

### `parseMDLD(markdown, options)`

Parse MD-LD markdown and return RDF quads.

**Parameters:**

- `markdown` (string) — MD-LD formatted text
- `options` (object, optional):
  - `baseIRI` (string) — Base IRI for relative references
  - `context` (object) — Additional context to merge with default context
  - `dataFactory` (object) — Custom RDF/JS DataFactory (default: built-in)

**Returns:** Array of RDF/JS Quads

```javascript
const quads = parseMDLD(
	`
# Article Title {=ex:article .Article}

Written by [Alice](ex:alice){ex:author}
`,
	{
		baseIRI: "http://example.org/doc",
		context: {
      '@vocab': 'http://schema.org/',
    },
	}
);

// quads[0] = {
//   subject: { termType: 'NamedNode', value: 'http://example.org/doc#article' },
//   predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//   object: { termType: 'NamedNode', value: 'http://schema.org/Article' },
//   graph: { termType: 'DefaultGraph' }
// }
```

### Batch Processing

For multiple documents, process them sequentially:

```javascript
const documents = [markdown1, markdown2, markdown3];
const allQuads = documents.flatMap((md) =>
	parseMDLD(md, { baseIRI: "http://example.org/" })
);
```

## Implementation Details

### Subject Resolution

MD-LD follows a clear subject inheritance model:

1. **Root subject** — Declared in the first heading of the document or inferred it's text content
2. **Heading subjects** — `## Title {=ex:title .Type}`
3. **Inline subjects** — `[text](=ex:text){.Type}`
4. **Blank nodes** — Generated for incomplete triples

```markdown
# Document {#doc .Article}

## Section 1 {#sec1 .Section} 

[Text]{property="name"} ← property of #sec1

Back to [doc](#doc){property="hasPart"}
```

### Property Mapping

| Markdown                | RDF Predicate                                                                   |
| ----------------------- | ------------------------------------------------------------------------------- |
| Top-level H1 (no `#id`) | `rdfs:label` on root subject                                                    |
| Heading with `{#id}`    | `rdfs:label` on subject                                                         |
| First paragraph         | `dct:description` on root                                                       |
| `{property="name"}`     | Resolved via context - > `schema:name`                                          |
| `{rel="author"}`        | Resolved via context - > `schema:author`                                        |
| Code block              | `schema:SoftwareSourceCode` with `schema:programmingLanguage` and `schema:text` |

### List Handling

```markdown {item}
- Item 1
- Item 2
```

Creates **multiple triples** with same predicate (not RDF lists):

```turtle
<#doc> schema:item "Item 1" .
<#doc> schema:item "Item 2" .
```

For RDF lists (`rdf:List`), use `@inlist` in generated HTML.

### Code Block Semantics

Fenced code blocks are automatically mapped to `schema:SoftwareSourceCode`:

```markdown
\`\`\`sparql {#query-1}
SELECT \* WHERE { ?s ?p ?o }
\`\`\`
```

Creates:

- A `schema:SoftwareSourceCode` resource (or custom type via `typeof`)
- `schema:programmingLanguage` from the info string (`sparql`)
- `schema:text` with the raw source code
- `schema:hasPart` link from the surrounding section

This enables semantic queries like "find all SPARQL queries in my notes."

### Blank Node Strategy

Blank nodes are created for:

1. Task list items without explicit `=id` or `#id`
2. Code blocks without explicit `=id` or `#id`
3. Inline `.Class` without `id` 

## Testing

```bash
npm test
```

Tests cover:

- ✅ YAML-LD frontmatter parsing
- ✅ Subject inheritance via headings
- ✅ Property literals and datatypes (`property`, `datatype`)
- ✅ Object relationships (`rel` on links)
- ✅ Blank node generation (tasks, code blocks)
- ✅ List mappings (repeated properties)
- ✅ Code block semantics (`SoftwareSourceCode`)
- ✅ Semantic links in lists (`hasPart` TOC)
- ✅ Cross-references via fragment IDs
- ✅ Minimal Markdown → RDF (headings, paragraphs)

## Syntax Overview

### Core Features


**Subject Declaration** — Headings create typed subjects:

```markdown
## Alice Johnson {#alice typeof="Person"}
```

**Literal Properties** — Inline spans create properties:

```markdown
[Alice Johnson]{name}
[30]{age ^^xsd:integer}
```

**Object Properties** — Links create relationships:

```markdown
[Tech Corp](#company){worksFor}
```

**Lists** — Repeated properties:

```markdown {tag}
- Item 1
- Item 2
```

**Code Blocks** — Automatic `SoftwareSourceCode` mapping:

```sparql
SELECT * WHERE { ?s ?p ?o }
```

**Tasks** — Markdown checklists become `schema:Action`:
```markdown
- [x] Completed task
- [ ] Pending task

### Optimization Tips

1. **Reuse DataFactory** — Pass custom factory instance to avoid allocations
2. **Minimize frontmatter** — Keep `@context` simple for faster parsing
3. **Batch processing** — Process multiple documents sequentially
4. **Fragment IDs** — Use `#id` on headings for efficient cross-references

## Future Work

- [ ] Streaming API for large documents
- [ ] Image syntax → `schema:ImageObject`
- [ ] Bare URL links → `dct:references`
- [ ] Language tags (`lang` attribute)
- [ ] Source maps for debugging

## Standards Compliance

This parser implements:

- [MD-LD v0.1 Specification](./mdld_spec_dogfood.md)
- [RDF/JS Data Model](https://rdf.js.org/data-model-spec/)
- [RDFa Core 1.1](https://www.w3.org/TR/rdfa-core/) (subset)
- [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/) (frontmatter)
