# MDLD Architecture

## Design Principles

MDLD follows strict engineering principles for reliability and performance:

- **Zero dependencies** — Pure JavaScript, ~15KB minified
- **Streaming-first** — Single-pass parsing, O(n) complexity  
- **Character-based tokenization** — 20-28% faster than regex-based approaches
- **Memory-efficient** — ~640 bytes per quad retained after GC
- **Standards-compliant** — RDF/JS data model
- **Origin tracking** — Full round-trip support with source maps
- **Explicit semantics** — No guessing, inference, or heuristics

## Processing Pipeline

Document processing follows this pipeline:

1. **Line-by-line scanning** — Sequential token creation
2. **Context resolution** — Prefix and vocabulary expansion  
3. **Subject tracking** — Current subject management
4. **Annotation processing** — Semantic block evaluation
5. **Quad emission** — RDF triple generation

## Core Parser Structures

### Token Processing Pipeline

The parser uses character-based tokenizers for optimal performance:

```javascript
const PROCESSORS = [
    { type: 'fence', test: line => detectFence(line.trim()), process: handleFence },
    { type: 'content', test: () => codeBlock, process: line => codeBlock.content.push(line) },
    { type: 'prefix', test: line => detectPrefix(line), process: handlePrefix },
    { type: 'standalone', test: line => detectStandaloneSubject(line), process: handleStandaloneSubject },
    { type: 'heading', test: line => detectHeading(line), process: handleHeading },
    { type: 'list', test: line => detectList(line), process: handleList },
    { type: 'blockquote', test: line => detectBlockquote(line), process: handleBlockquote },
    { type: 'para', test: line => line.trim(), process: handlePara }
];
```

### Character-Based Tokenization

Character-based tokenizers replace regex patterns for performance:

- **detectFence()** — Code block fence detection
- **detectPrefix()** — Namespace prefix declarations  
- **detectHeading()** — Markdown heading detection
- **detectList()** — List item detection
- **detectBlockquote()** — Blockquote detection
- **detectStandaloneSubject()** — Subject annotation detection

### Semantic Block Processing

The parser processes semantic annotations in context:

```javascript
// Subject declaration
[entity] {=ex:Entity .rdfs:Class label}

// Object introduction  
[related] {+ex:related ?rdfs:subClassOf}

// Property assertion
has [property] {+ex:property ?ex:hasProperty}
```

### Data Structures

**Parser State:**
```javascript
{
    prefixes: Map<string, string>,      // prefix → IRI mappings
    currentSubject: NamedNode|null,    // active subject
    codeBlock: CodeBlock|null,         // fenced content
    quads: Quad[],                     // emitted triples
    origins: Origin[]                  // source tracking
}
```

**Quad Generation:**
```javascript
{
    subject: NamedNode,
    predicate: NamedNode, 
    object: Literal|NamedNode,
    graph: NamedNode
}
```

## Performance Architecture

### Memory Management

- **Streaming parsing** — Full document never in memory
- **Lazy evaluation** — Context computed on demand
- **Efficient indexing** — O(1) subject/object/predicate lookup
- **Garbage collection** — Minimal retained state

### Character-Based Optimization

Character-based tokenizers provide:
- **20-28% faster** parsing than regex-based approaches
- **Predictable performance** — O(n) complexity
- **Memory efficiency** — No regex engine overhead
- **Maintainability** — Clear character logic

### Scaling Architecture

**Real-time Applications (60fps):**
- Maximum: 4,527 quads per frame
- Use case: Interactive knowledge graphs
- Pattern: Incremental updates only

**Batch Processing (1-second):**
- Maximum: 225,059 quads per second  
- Use case: Background reindexing, imports
- Pattern: Worker thread, chunked processing

**Enterprise Scale:**
- Small (<4K quads): Real-time updates
- Medium (4-225K quads): Batch reindexing
- Large (>225K quads): Streaming architecture

## Extensibility

### Plugin Architecture

The parser supports extensions through:

- **Custom tokenizers** — Add new block types
- **Semantic processors** — Custom annotation handling
- **Output formats** — Alternative serialization
- **Validation hooks** — Custom constraint checking

### Integration Points

- **Parse hooks** — Pre/post processing
- **Context injection** — Dynamic prefix resolution
- **Error handling** — Custom error strategies
- **Performance monitoring** — Built-in profiling

## Standards Compliance

### RDF/JS Data Model

MDLD implements the RDF/JS data model specification:
- **NamedNode** — IRIs and CURIEs
- **Literal** — Typed and language-tagged values
- **Quad** — RDF triples with graph context
- **Dataset** — Quad collections with indexing

### W3C Standards

- **RDF 1.1** — Core RDF concepts
- **RDFS** — Schema vocabulary
- **PROV-O** — Provenance ontology
- **SHACL** — Constraint validation
- **CURIE 1.0** — Compact URI syntax

## Implementation Notes

### Single-Pass Design

The parser processes documents in a single forward pass:
- No backtracking or look-ahead beyond current line
- Streaming-friendly for large documents
- Predictable memory usage
- Linear time complexity

### Error Handling

- **Graceful degradation** — Continue parsing on errors
- **Context preservation** — Maintain parser state
- **Detailed reporting** — Line/column information
- **Recovery strategies** — Skip invalid content

### Testing Strategy

- **Unit tests** — Individual tokenizer validation
- **Integration tests** — End-to-end parsing
- **Performance tests** — Benchmarking at scale
- **Real-world tests** — Actual ontology validation

---

For detailed parser internals, see **[Parser Documentation](./Parser.md)**.  
For performance metrics and testing methods, see **[Performance Documentation](./Performance.md)**.
