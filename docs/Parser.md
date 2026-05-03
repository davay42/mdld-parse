# MD-LD Parser Architecture

## Overview

The MD-LD parser implements a **single-pass, streaming-friendly** architecture that transforms Markdown with semantic annotations into RDF/JS quads while maintaining complete provenance and supporting elevated statements extraction.

## Core Parser Structures

### 1. Parser State Object

```javascript
const state = {
    ctx: {},                    // Prefix context for IRI expansion
    df: DataFactory,            // RDF/JS DataFactory instance
    quads: [],                  // Final resolved graph state
    quadBuffer: new Map(),      // Current parsing buffer
    removeSet: new Set(),      // External retractions
    origin: { quadIndex: new Map() }, // Lean origin tracking
    currentSubject: null,       // Current subject context
    tokens: null,              // Tokenized input
    currentTokenIndex: -1,     // Current processing position
    statements: [],            // Elevated statements array
    statementCandidates: new Map() // Incomplete rdf:Statement patterns
};
```

#### State Components

| Component | Purpose | Lifecycle |
|-----------|---------|-----------|
| **ctx** | Prefix mappings for IRI expansion | Persistent, updated during prefix processing |
| **quads** | Final graph output | Accumulated throughout parsing |
| **quadBuffer** | Intra-document cancel tracking | Modified during quad emission |
| **removeSet** | External retractions | Accumulated for removal operations |
| **origin** | Provenance tracking | Updated with each quad |
| **currentSubject** | Subject context management | Reset and updated during parsing |
| **statements** | Elevated statements | Accumulated during pattern detection |
| **statementCandidates** | Pattern completion tracking | Modified during rdf:Statement detection |

### 2. Token Processing Pipeline

#### Token Types

```javascript
const TOKEN_TYPES = {
    heading: 'heading',        // ## Heading {=ex:subject .type}
    para: 'para',             // Paragraph with annotations
    list: 'list',             // - List item {+ex:predicate}
    blockquote: 'blockquote',  // > Quote {ex:property}
    code: 'code',             // ```code {=ex:codeblock}
    prefix: 'prefix',         // [prefix] <uri>
    fence: 'fence'            // Code block delimiters
};
```

#### Token Structure

```javascript
const token = {
    type: 'para',             // Token type
    range: [start, end],      // Character positions in source
    text: 'content',          // Raw text content
    attrs: '{+ex:predicate}', // Annotation block
    attrsRange: [start, end], // Annotation positions
    valueRange: [start, end], // Value positions
    _carriers: [...]          // Lazy-loaded inline carriers
};
```

#### Token Processors

```javascript
const TOKEN_PROCESSORS = {
    heading: (token, state) => processTokenAnnotations(token, state, 'heading'),
    para: (token, state) => {
        processStandaloneSubject(token, state);
        processTokenAnnotations(token, state, 'para');
    },
    blockquote: (token, state) => processTokenAnnotations(token, state, 'blockquote'),
    code: (token, state) => processTokenAnnotations(token, state, 'code'),
    list: (token, state) => processTokenAnnotations(token, state, 'list')
};
```

### 3. Semantic Block Processing

#### Semantic Block Structure

```javascript
const semanticBlock = {
    subjects: ['ex:subject'],     // Zero or more subjects
    predicates: ['ex:predicate'], // Zero or more predicates
    types: ['ex:Type'],          // Zero or more types
    object: 'literal',           // Optional object value
    remove: false,               // Polarity flag
    meta: { ... }                // Additional metadata
};
```

#### Parsing Pipeline

1. **Annotation Extraction** - Identify annotation blocks in tokens
2. **Semantic Parsing** - Parse annotation blocks into semantic structures
3. **Subject Resolution** - Resolve subjects using current context
4. **Quad Generation** - Create RDF/JS quads from semantic structures
5. **Origin Tracking** - Record provenance for each quad

### 4. Retraction System

Retractions are first-class citizens in MD-LD, enabling sophisticated diff authoring and document evolution through explicit polarity handling.

#### Retraction Types

```javascript
const RETRACTION_TYPES = {
    INTRA_DOCUMENT: 'intra-document',  // Cancel within same document
    EXTERNAL_RETRACT: 'external',     // Remove from prior state
    TYPE_MIGRATION: 'migration'       // Change type assertions
};
```

#### Retraction State Management

```javascript
const retractionState = {
    quadBuffer: new Map(),      // Current document state
    removeSet: new Set(),       // External retractions
    quads: [],                  // Final resolved state
};
```

#### Retraction Processing Pipeline

```javascript
function processRetraction(quad, quadBuffer, removeSet, quads) {
    const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
    
    if (quadBuffer.has(quadKey)) {
        // Intra-document cancel: remove from current state
        quadBuffer.delete(quadKey);
        removeFromQuadsArray(quads, quad);
    } else {
        // External retract: target prior document state
        removeSet.add(quad);
    }
}
```

#### Polarity Forms

| Form | Positive | Negative | Use Case |
|------|-----------|-----------|-----------|
| `p` | `{p}` | `{-p}` | Literal properties |
| `?p` | `{?p}` | `{-?p}` | Object properties |
| `!p` | `{!p}` | `{-!p}` | Reverse properties |
| `.Class` | `{.Class}` | `-.Class}` | Type declarations |

#### Retraction Examples

```javascript
// Intra-document cancel
"Alice has name 'Alice'"     // {+ex:name "Alice"}
"Alice {-ex:name 'Alice'}"   // Cancels above, removed from final state

// External retract  
"Bob {-ex:name 'Robert'}"    // Targets Bob's name from prior documents

// Type migration
"Alice .foaf:Person"         // Initial type
"Alice {-foaf:Person}"       // Remove old type
"Alice .foaf:Agent"          // Add new type
```

#### Hard Invariant Enforcement

```javascript
function enforceHardInvariant(quads, removeSet) {
    // Ensure: quads ∩ remove = ∅ (no overlap)
    const quadKeys = new Set();
    for (const quad of quads) {
        quadKeys.add(quadIndexKey(quad.subject, quad.predicate, quad.object));
    }
    
    // Filter removeSet to ensure no overlap
    return Array.from(removeSet).filter(quad => {
        const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
        return !quadKeys.has(key);
    });
}
```

### 5. Carrier Extraction System

#### Carrier Types

```javascript
const CARRIER_TYPES = {
    link: 'link',           // [text] {+ex:predicate}
    emphasis: 'emphasis',   // **text** {ex:property}
    code: 'code',          // ``code`` {ex:property}
    bracket: 'bracket'      // <url> {ex:reference}
};
```

#### Carrier Structure

```javascript
const carrier = {
    type: 'link',           // Carrier type
    text: 'display text',   // Display content
    attrs: '{+ex:predicate}', // Annotation block
    attrsRange: [start, end], // Annotation positions
    valueRange: [start, end], // Value positions
    range: [start, end],   // Full span in source
    pos: endPosition,       // Next processing position
    url: 'resolved-iri'     // Resolved IRI (for links)
};
```

#### Extraction Patterns

```javascript
const CARRIER_EXTRACTORS = {
    '<': extractLinkCarrier,      // Angle bracket links
    '[': extractBracketCarrier,   // Square bracket carriers
    emphasis: extractEmphasis,    // **emphasis** patterns
    code: extractCodeSpan         // ``code`` patterns
};
```

### 5. Quad Emission System

#### Emit Quad Function

```javascript
function emitQuad(quads, quadBuffer, removeSet, quadIndex, block, 
                 subject, predicate, object, dataFactory, meta, 
                 statements, statementCandidates) {
    
    // 1. Create RDF/JS quad
    const quad = dataFactory.quad(subject, predicate, object);
    const remove = meta?.remove || false;
    
    // 2. Handle polarity (add/remove)
    if (remove) {
        // Retraction processing
        const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
        
        if (quadBuffer.has(quadKey)) {
            // Intra-document cancel: remove from current state
            quadBuffer.delete(quadKey);
            removeFromQuadsArray(quads, quad);
            quadIndex.delete(quadKey);
        } else {
            // External retract: target prior document state
            removeSet.add(quad);
        }
    } else {
        // Add to buffer and quads array
        const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
        quadBuffer.set(quadKey, quad);
        quads.push(quad);

        // Detect elevated statements
        detectStatementPatternSinglePass(quad, dataFactory, meta, statements, statementCandidates);

        // Create origin entry
        const originEntry = createOriginEntry(block, subject, predicate, meta);
        quadIndex.set(quadKey, originEntry);
    }
}
```

#### Retraction-Aware Quad Processing

```javascript
function removeFromQuadsArray(quads, targetQuad) {
    const index = quads.findIndex(q =>
        q.subject.value === targetQuad.subject.value &&
        q.predicate.value === targetQuad.predicate.value &&
        q.object.value === targetQuad.object.value
    );
    
    if (index !== -1) {
        quads.splice(index, 1);
    }
}
```

#### Origin Entry Creation with Polarity

```javascript
function createOriginEntry(block, subject, predicate, meta) {
    return {
        blockId: block.id,
        range: block.range,
        carrierType: block.carrierType,
        subject: subject.value,
        predicate: predicate.value,
        context: block.context,
        polarity: meta?.remove ? '-' : '+',  // Polarity tracking
        value: block.text || ''
    };
}
```

#### Quad Index Key Generation

```javascript
function quadIndexKey(subject, predicate, object) {
    return `${subject.value}|${predicate.value}|${object.value}`;
}
```

### 6. Elevated Statements Detection

#### Pattern Detection System

```javascript
function detectStatementPatternSinglePass(quad, dataFactory, meta, 
                                         statements, statementCandidates) {
    // Only process rdf:Statement related predicates (optimized)
    if (!isRDFStatementPredicate(quad.predicate.value)) return;
    
    // Start new pattern: rdf:type rdf:Statement
    if (isStatementType(quad)) {
        statementCandidates.set(quad.subject.value, { spo: {} });
        return;
    }
    
    // Complete pattern parts: rdf:subject, rdf:predicate, rdf:object
    const candidate = statementCandidates.get(quad.subject.value);
    if (candidate) {
        updatePattern(candidate, quad);
        
        // Create elevated SPO when pattern complete
        if (isPatternComplete(candidate)) {
            const elevatedQuad = createElevatedQuad(candidate, dataFactory);
            statements.push(elevatedQuad);
            statementCandidates.delete(quad.subject.value);
        }
    }
}
```

#### Pattern Completion Tracking

```javascript
const patternCandidate = {
    spo: {
        subject: NamedNode,     // rdf:subject value
        predicate: NamedNode,   // rdf:predicate value  
        object: NamedNode|Literal // rdf:object value
    },
    objectQuad: Quad           // Original quad for literal extraction
};
```

### 7. Origin Tracking System

#### Origin Entry Structure

```javascript
const originEntry = {
    blockId: 'block-identifier',    // Unique block identifier
    range: [start, end],            // Source location
    carrierType: 'para',            // Token type
    subject: 'ex:subject',          // Subject IRI
    predicate: 'ex:predicate',      // Predicate IRI
    context: { ...block.context },  // Prefix context
    polarity: '+',                   // Add/remove indicator
    value: 'source text'            // Original content
};
```

#### Quad Index Mapping

```javascript
const quadIndex = new Map(); // quadIndexKey -> originEntry
```

## Processing Pipeline

### Phase 1: Tokenization

```javascript
function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        // Identify token types using regex patterns
        // Extract annotations and ranges
        // Create token objects with metadata
        tokens.push(token);
    }
    
    return tokens;
}
```

### Phase 2: Prefix Processing

```javascript
// Single loop optimization for better performance
for (const token of tokens) {
    if (token.type === 'prefix') {
        // Resolve CURIEs and update context
        state.ctx[token.prefix] = resolveIRI(token.iri, state.ctx);
    }
}
```

### Phase 3: Semantic Processing

```javascript
for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    state.currentTokenIndex = i;
    
    // Process token using appropriate processor
    TOKEN_PROCESSORS[token.type]?.(token, state);
}
```

### Phase 4: Final Resolution

```javascript
// Process retractions and ensure hard invariant
const filteredRemove = processRetractions(state.quads, state.removeSet);

return {
    quads: state.quads,           // Final resolved graph state
    remove: filteredRemove,      // External retractions only
    statements: state.statements,  // Elevated statements
    origin: state.origin,         // Complete provenance
    context: state.ctx           // Final prefix context
};
```

#### Retraction Processing

```javascript
function processRetractions(quads, removeSet) {
    // Create quad key index for fast lookup
    const quadKeys = new Set();
    for (const quad of quads) {
        quadKeys.add(quadIndexKey(quad.subject, quad.predicate, quad.object));
    }
    
    // Filter removeSet to enforce hard invariant: quads ∩ remove = ∅
    const filteredRemove = [];
    for (const quad of removeSet) {
        const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
        if (!quadKeys.has(key)) {
            filteredRemove.push(quad);
        }
    }
    
    return filteredRemove;
}
```

## Performance Optimizations

### Applied Optimizations

1. **Token Processing**: Single loop instead of filter+forEach
2. **Regex Pre-compilation**: Pre-compiled carrier patterns
3. **String Operations**: Optimized fragment resolution
4. **Array Operations**: Direct iteration instead of Array.from()+filter()
5. **Object Creation**: Reduced spread operator usage
6. **Early Filtering**: Only process rdf:Statement related predicates
7. **Module Constants**: RDF constants defined once at module level

### Performance Characteristics

- **Single-pass parsing**: No backtracking or multiple iterations
- **O(1) additional memory**: Constant overhead for elevated statements
- **Linear scalability**: Performance scales linearly with input size
- **Streaming compatible**: Can process large files incrementally

## Memory Management

### Memory Usage Patterns

```javascript
// Temporary objects (cleaned up automatically)
const statementCandidates = new Map(); // Cleared on pattern completion
const quadBuffer = new Map();          // Cleared on intra-document cancel

// Persistent objects (grow with input)
state.quads.push(quad);                // Final output
state.origin.quadIndex.set(key, entry); // Provenance tracking
```

### Cleanup Strategies

1. **Automatic Cleanup**: Statement candidates deleted on completion
2. **Buffer Management**: Quad buffer cleared on intra-document cancel
3. **Set Operations**: RemoveSet converted to array at end
4. **Lazy Loading**: Inline carriers loaded on-demand

## Error Handling

### Error Recovery Strategies

```javascript
// Graceful degradation for malformed input
if (!isValidAnnotation(attrs)) {
    // Log warning and continue processing
    return;
}

// Safe navigation for optional properties
const subject = resolveSubject(sem.subject, state) || skipProcessing();

// Validation with meaningful errors
if (!state.currentSubject && needsSubject(sem)) {
    throw new ParseError('Subject required but not set', token.range);
}
```

## Extensibility Points

### Custom Token Processors

```javascript
// Add new token type
TOKEN_PROCESSORS.custom = (token, state) => {
    // Custom processing logic
    processTokenAnnotations(token, state, 'custom');
};
```

### Custom Carrier Extractors

```javascript
// Add new carrier pattern
CARRIER_EXTRACTORS['@'] = (text, pos, baseOffset) => {
    // Custom carrier extraction
    return createCarrier('mention', text, attrs, ranges);
};
```

### Custom Semantic Parsers

```javascript
// Extend semantic block parsing
function parseCustomSemantic(attrs) {
    // Custom annotation parsing
    return { customProperty: value };
}
```

## Integration Points

### External Libraries

- **RDF/JS DataFactory**: Quad creation and term management
- **Context Expansion**: IRI resolution and prefix handling
- **Validation**: Optional SHACL or schema validation

### Output Formats

```javascript
// Standard RDF/JS output with first-class retractions
return {
    quads: RDFQuad[],          // Primary graph (final resolved state)
    remove: RDFQuad[],         // External retractions (targets prior state)
    statements: RDFQuad[],     // Elevated statements from rdf:Statement patterns
    origin: OriginObject,      // Complete provenance tracking
    context: ContextObject     // Final prefix context
};
```

#### Retraction Output Characteristics

```javascript
// External retractions only (intra-document cancels resolved internally)
const remove = [
    // Quads that target prior document state
    // Never overlap with quads array (hard invariant enforced)
];

// Usage for document evolution
const priorResult = parse(previousDocument);
const currentResult = parse(currentDocument);

// Apply retractions to prior state
const evolvedGraph = applyRetractions(priorResult.quads, currentResult.remove);
```

### Streaming Interface

```javascript
// Future streaming capability
function parseStream(stream, options) {
    return new TransformStream({
        transform(chunk, controller) {
            // Process chunk incrementally
            const result = parse(chunk.toString(), options);
            controller.enqueue(result);
        }
    });
}
```

This architecture provides a solid foundation for MD-LD parsing with excellent performance characteristics, maintainability, and extensibility for future enhancements.
