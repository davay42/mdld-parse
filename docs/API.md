# MD-LD API Reference

Complete API documentation for MD-LD parser with tested examples.

## Core Functions

### `parse(markdown, options)`

Parse MD-LD markdown and return RDF quads with lean origin tracking.

**Parameters:**
- `markdown` (string) — MD-LD formatted text
- `options` (object, optional):
  - `context` (object) — Prefix mappings (default: `{ '@vocab': 'http://www.w3.org/2000/01/rdf-schema#', rdf, rdfs, xsd, sh, prov }`)
  - `dataFactory` (object) — Custom RDF/JS DataFactory

**Returns:** `{ quads, remove, origin, context }`

- `quads` — Array of RDF/JS Quads (final resolved graph state)
- `remove` — Array of RDF/JS Quads (external retractions targeting prior state)
- `origin` — Lean origin tracking object with quadIndex for UI navigation
- `context` — Final context used (includes prefixes)

#### Basic Example

```javascript
import { parse } from 'mdld-parse';

const result = parse(`
[ex] <http://example.org/>

# Document {=ex:doc .ex:Article}
[Alice] {?ex:author =ex:alice .prov:Person ex:firstName label}
[Smith] {ex:lastName}`);

console.log(result.quads);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/doc' },
//     predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//     object: { termType: 'NamedNode', value: 'http://example.org/Article' }
//   },
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/doc' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
//     object: { termType: 'NamedNode', value: 'http://example.org/alice' }
//   },
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/alice' },
//     predicate: { termType: 'NamedNode', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
//     object: { termType: 'Literal', value: 'Alice' }
//   },
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/alice' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/firstName' },
//     object: { termType: 'Literal', value: 'Alice' }
//   },
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/alice' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/lastName' },
//     object: { termType: 'Literal', value: 'Smith' }
//   }
// ]
```

#### Polarity Example

```javascript
const result = parse(
  `# Article {=ex:article .ex:Article}
  
  [Alice] {=ex:alice ?author}
  [Bob] {-ex:author}`,  // Remove previous author
  { context: { ex: 'http://example.org/' } }
);

console.log(result.quads);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//     object: { termType: 'NamedNode', value: 'http://example.org/Article' }
//   },
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
//     object: { termType: 'NamedNode', value: 'http://example.org/alice' }
//   }
// ]

console.log(result.remove);
// [] - Empty because Alice author was cancelled in-stream
```

#### External Retraction Example

```javascript
const result2 = parse(
  `# Article {=ex:article}
  [Alice] {-ex:author}`,  // External retract (Alice not in current state)
  { context: { ex: 'http://example.org/' } }
);

console.log(result2.remove);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
//     object: { termType: 'NamedNode', value: 'http://example.org/alice' }
//   }
// ]
```

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**
- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings (merged with DEFAULT_CONTEXT)

**Returns:** `{ quads, remove, origin, context }`

- `quads` — Merged array of RDF/JS Quads
- `remove` — Array of retractions from merge process
- `origin` — Merge origin with document chain:
  - `documents` — Array of document metadata
  - `quadIndex` — Combined quad index from all documents
- `context` — Final merged context

#### Basic Merge Example

```javascript
import { merge } from 'mdld-parse';

const merged = merge([
  `# Article {=ex:article}
  [Bob] {author}`,
  `# Article {=ex:article}
  [Bob] {-author}
  [Charlie] {author}`
], { context: { ex: 'http://example.org/' } });

console.log(merged.quads.length); // 2 (type + Charlie author)
console.log(merged.remove.length); // 1 (Bob author removal)
```

#### Version Control Example

```javascript
const v1 = `# Article {=ex:article .ex:Article}
[Alice] {author}
[Draft] {status}`;

const v2 = `# Article {=ex:article}
[Alice] {-author}        // Retract original
[Bob] {author}           // Add new author
[Draft] {-status}        // Retract draft status
[Published] {status}     // Add published status`;

const merged = merge([v1, v2]);
console.log(merged.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['article rdf:type Article', 'article author Bob', 'article status Published']
```

### `generate(quads, context)`

Generate deterministic MDLD from RDF quads.

**Parameters:**
- `quads` (array) — Array of RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings (default: `{}`)

**Returns:** `{ text, context }`

- `text` — Generated MDLD markdown
- `context` — Final context used (includes defaults)

#### Generate Example

```javascript
import { generate } from 'mdld-parse';

const quads = [
  {
    subject: { termType: 'NamedNode', value: 'http://example.org/article' },
    predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
    object: { termType: 'NamedNode', value: 'http://example.org/Article' }
  },
  {
    subject: { termType: 'NamedNode', value: 'http://example.org/article' },
    predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
    object: { termType: 'NamedNode', value: 'http://example.org/alice' }
  }
];

const result = generate(quads, { 
  ex: 'http://example.org/',
});

console.log(result.text);
// # Article {=ex:article .ex:Article}
//
// > alice {+ex:alice ?ex:author}
```

### `locate(quad, origin)`

Locate the origin entry for a quad using the lean origin system.

**Parameters:**
- `quad` (object) — The quad to locate (subject, predicate, object)
- `origin` (object) — Origin object containing quadIndex

**Returns:** `{ blockId, range, carrierType, subject, predicate, context, value, polarity }` or `null`

- `blockId` — ID of the containing block
- `range` — Character range of the carrier in the source text
- `carrierType` — Type of carrier (heading, blockquote, span)
- `subject` — Subject IRI of the quad
- `predicate` — Predicate IRI of the quad
- `context` — Context object inherited from parsing
- `value` — Raw carrier text content
- `polarity` — '+' for assertions, '-' for retractions

#### Locate Example

```javascript
import { parse, locate } from 'mdld-parse';

const result = parse(mdldText, { context: { ex: 'http://example.org/' } });
const quad = result.quads[0]; // Find a quad to locate

const location = locate(quad, result.origin);

console.log(location.range); // { start: 38, end: 44 }
console.log(location.value); // "Alice"
console.log(location.carrierType); // "blockquote"
```

### `render(quads, options)`

Render RDF quads as HTML+RDFa for web display.

**Parameters:**
- `quads` (array) — Array of RDF/JS Quads to render
- `options` (object, optional):
  - `context` (object) — Prefix mappings for CURIE shortening
  - `baseIRI` (string) — Base IRI for resolving relative references

**Returns:** `{ html, context }`

- `html` — HTML string with RDFa annotations
- `context` — Context used for rendering

#### Render Example

```javascript
import { parse, render } from 'mdld-parse';

const result = parse(mdldText);
const rendered = render(result.quads, { ex: 'http://example.org/' });

console.log(rendered.html);
// <div typeof="ex:Article">
//   <span property="ex:author">Alice</span>
// </div>
```

## Utility Functions

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

### DEFAULT_CONTEXT

```javascript
{
  '@vocab': 'http://www.w3.org/2000/01/rdf-schema#',
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'sh': 'http://www.w3.org/ns/shacl#',
  'prov': 'http://www.w3.org/ns/prov#'
}
```

### DataFactory

RDF/JS DataFactory instance for creating RDF terms:

```javascript
DataFactory.namedNode('http://example.org/subject')
DataFactory.literal('value')
DataFactory.quad(subject, predicate, object, graph)
```

### Hash Function

Generate consistent hashes for identifiers:

```javascript
hash('content') // Returns: '5f4dcc3b5aa765d61d8327deb882cf99'
```

### IRI Expansion/Shortening

Context-aware IRI manipulation:

```javascript
const context = { ex: 'http://example.org/' };

expandIRI('ex:term', context)     // 'http://example.org/term'
shortenIRI('http://example.org/term', context) // 'ex:term'
```

### Semantic Block Parser

Parse individual annotation blocks:

```javascript
parseSemanticBlock('{author}', context) // Returns parsed annotation object
```

## Error Handling

### Common Errors

- **Invalid syntax** - Malformed annotations or prefixes
- **Missing context** - Undefined prefixes in IRI expansion
- **Type errors** - Invalid datatype or language combinations

### Error Messages

The parser provides clear error messages with line numbers:

```javascript
try {
  const result = parse(invalidMarkdown);
} catch (error) {
  console.error(error.message); // "Invalid annotation at line 5: ..."
}
```

## Performance Characteristics

- **O(n) parsing** - Single pass, linear time complexity
- **Memory efficient** - Streaming-friendly, minimal state
- **Deterministic** - Same input always produces same output
- **Zero dependencies** - Pure JavaScript implementation

## RDF/JS Compatibility

Generated quads are standard RDF/JS Quad objects compatible with:

- **n3.js** - Turtle/N-Triples serialization
- **rdflib.js** - RDF store and reasoning
- **sparqljs** - SPARQL queries and updates
- **rdf-ext** - Extended RDF utilities

## Browser Support

MD-LD works in modern browsers with ES module support:

```html
<script type="module">
  import { parse } from 'https://cdn.jsdelivr.net/npm/mdld-parse/+esm';
  
  const result = parse('# Hello {=ex:hello label}');
</script>
```

## Node.js Support

Full Node.js support with CommonJS and ES modules:

```javascript
// ES Modules
import { parse } from 'mdld-parse';

// CommonJS
const { parse } = require('mdld-parse');
```
