# MD-LD Architecture

## Design Principles

MD-LD follows strict engineering principles to ensure reliability and performance:

- **Zero dependencies** — Pure JavaScript, ~15KB minified
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Standards-compliant** — RDF/JS data model
- **Origin tracking** — Full round-trip support with source maps
- **Explicit semantics** — No guessing, inference, or heuristics

## Processing Pipeline

Document processing follows this pipeline:

1. **Line-by-line scanning** - Sequential token creation
2. **Context resolution** - Prefix and vocabulary expansion  
3. **Subject tracking** - Current subject management
4. **Annotation processing** - Semantic block evaluation
5. **Quad emission** - RDF triple generation

### Tokenization Phase

The parser processes documents in a single pass with these token types:

- **Prefix declarations** - `[prefix] <uri>`
- **Subject declarations** - `{=iri}`, `{=#fragment}`, `{=}`
- **Annotations** - `{...}` blocks with predicates
- **Value carriers** - Markdown elements carrying semantic values
- **Control tokens** - End of annotation blocks

### Semantic Block Processing

Annotations are parsed using cached semantic blocks:

- Extract subjects, predicates, types, and modifiers
- Handle all three predicate forms (`p`, `?p`, `!p`)
- Process polarity tokens (`+`, `-`)
- Validate datatype and language annotations

## RDF/JS Compatibility

Quads are compatible with major RDF libraries:

- **n3.js** - Turtle/N-Triples serialization
- **rdflib.js** - RDF store and reasoning
- **sparqljs** - SPARQL queries and updates
- **rdf-ext** - Extended RDF utilities

### Quad Structure

Generated quads follow RDF/JS specification:

```javascript
{
  subject: NamedNode|BlankNode,
  predicate: NamedNode,
  object: NamedNode|Literal|BlankNode,
  graph: DefaultGraph|NamedNode
}
```

## Origin Tracking System

Lean origin tracking provides complete provenance:

### Origin Entry Structure

```javascript
{
  blockId: '4ac750c12',           // Unique block identifier
  range: { start: 33, end: 53 },   // Character positions
  carrierType: 'blockquote',           // Markdown element type
  subject: 'http://example.org/alice',   // Subject IRI
  predicate: 'http://www.w3.org/2000/01/rdf-schema#name', // Predicate IRI
  context: { ex: 'http://example.org/' },  // Active context
  value: 'Alice Smith',                // Raw content
  polarity: '+'                        // '+' for quads, '-' for removes
}
```

### Quad Index

Efficient lookup structure for locating quads:

- **O(1) lookup** - Constant time quad-to-origin mapping
- **Memory efficient** - Only stores essential metadata
- **UI navigation** - Enables hover, click-to-source features

## Performance Characteristics

- **O(n) parsing** - Single pass, linear time complexity
- **Memory efficient** - Streaming-friendly, minimal state
- **Deterministic** - Same input always produces same output
- **Zero dependencies** - Pure JavaScript implementation

### Memory Usage

Typical memory consumption for different document sizes:

| Document Size | Memory Usage | Parsing Time |
|---------------|---------------|--------------|
| 1KB          | ~50KB         | ~1ms        |
| 10KB         | ~500KB        | ~5ms        |
| 100KB        | ~5MB          | ~50ms       |
| 1MB          | ~50MB         | ~500ms      |

## Error Handling

### Error Types

- **Syntax errors** - Invalid annotations or malformed tokens
- **Context errors** - Undefined prefixes or circular references
- **Type errors** - Invalid datatype combinations
- **IO errors** - File reading or network issues

### Error Recovery

Parser attempts graceful recovery:

- **Skip invalid tokens** - Continue processing valid content
- **Provide context** - Include line numbers and token details
- **Partial results** - Return successfully parsed quads

## Browser Compatibility

### Module Support

- **ES Modules** - Modern browsers with `import` support
- **CDN availability** - Direct loading from npm CDNs
- **No build step** - Works directly in browser

### Polyfills

For older browsers, consider these polyfills:

- **String.prototype.startsWith** - For prefix detection
- **Map/Set** - For efficient data structures
- **Promise** - For async operations

## Node.js Compatibility

### Module Systems

- **ES Modules** - `import { parse } from 'mdld-parse'`
- **CommonJS** - `const { parse } = require('mdld-parse')`
- **TypeScript** - Included type definitions

### Version Requirements

- **Node.js 16+** - For ES module support
- **Node.js 14+** - For CommonJS support
- **npm 7+** - For dependency management

## Security Considerations

### Input Validation

- **Sanitization** - Clean user input before processing
- **Length limits** - Prevent memory exhaustion
- **Context isolation** - Separate contexts for different documents

### Output Safety

- **XSS prevention** - Escape HTML in render output
- **IRI validation** - Prevent malicious URI schemes
- **Size limits** - Cap output to reasonable bounds

## Testing Infrastructure

### Test Organization

```
tests/
├── parse.tests.js      # Core parsing tests
├── merge.tests.js     # Merge functionality tests
├── generate.tests.js  # Generation tests
├── locate.tests.js    # Origin tracking tests
└── index.js          # Test runner
```

### Coverage Areas

- **Syntax parsing** - All annotation forms
- **Context management** - Prefix and subject handling
- **Polarity system** - Add/remove operations
- **Origin tracking** - Quad-to-source mapping
- **Error handling** - Invalid input scenarios
- **Performance** - Large document handling

## Development Workflow

### Building from Source

```bash
# Clone repository
git clone https://github.com/davay42/mdld-parse.git

# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build
```

### Contributing Guidelines

1. **Add tests** - Cover new functionality with test cases
2. **Update docs** - Keep documentation in sync
3. **Check performance** - Ensure O(n) complexity maintained
4. **Follow style** - Maintain code consistency
