# MD-LD Processing Model (Normative)

**Defines how MD-LD documents are tokenized, processed, and transformed into RDF quads**

---

## 1. Overview

MD-LD processing is a **single-pass, streaming algorithm** that transforms CommonMark Markdown with explicit `{...}` annotations into RDF quads while maintaining origin tracking for round-trip serialization.

The processing model guarantees:
- **Deterministic output** - Same input always produces same quads
- **Streaming capability** - No backtracking or look-ahead required
- **Origin preservation** - Every quad can be traced to its source
- **Error recovery** - Invalid annotations are skipped, not fatal

---

## 2. Tokenization Phase

### 2.1 Line-by-Line Scanning with Processors

The document is processed sequentially using a processor pipeline:

```javascript
const processors = [
    { test: line => line.startsWith('```'), process: handleCodeBlock },
    { test: () => codeBlock, process: accumulateCodeContent },
    { test: line => PREFIX_REGEX.test(line), process: handlePrefix },
    { test: line => HEADING_REGEX.test(line), process: handleHeading },
    { test: line => UNORDERED_LIST_REGEX.test(line), process: handleUnorderedList },
    { test: line => ORDERED_LIST_REGEX.test(line), process: handleOrderedList },
    { test: line => BLOCKQUOTE_REGEX.test(line), process: handleBlockquote },
    { test: line => line.trim(), process: handleParagraph }
];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = pos;
    pos += line.length + 1;
    
    // Try each processor until one handles the line
    for (const processor of processors) {
        if (processor.test(line) && processor.process(line, lineStart, pos)) {
            break;
        }
    }
}
```

### 2.2 Token Types

Each line is classified into one of these token types:

| Token Type | Pattern | Semantic Role |
|------------|---------|---------------|
| `prefix` | `[name] <IRI>` | Context declaration |
| `heading` | `#{1,6} text {attrs?}` | Block carrier + potential subject |
| `unordered-list` | `[-*+] text {attrs?}` | Block carrier |
| `ordered-list` | `\d+. text {attrs?}` | Block carrier + RDF List generation |
| `blockquote` | `> text {attrs?}` | Block carrier |
| `code` | ```lang {attrs?}` | Block carrier |
| `para` | any other text | Potential inline carriers + list context |

### 2.3 Code Block Handling

Code blocks are handled specially due to their multi-line nature:

1. **Opening fence detected** - Extract language and attributes
2. **Content accumulation** - Store all lines until closing fence
3. **Closing fence detected** - Emit single `code` token with full content

### 2.4 Inline Carrier Extraction

Each token is scanned for inline carriers using sticky regex patterns:

```javascript
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};

const CARRIER_EXTRACTORS = {
    '<': extractAngleBracketURL,    // <URL>
    '[': extractBracketedLink       // [text](URL) or [text]
};
```

---

## 3. Context Declaration Processing

### 3.1 Processing Order

Context declarations are processed **before** any other tokens:

```javascript
state.tokens.filter(t => t.type === 'prefix').forEach(t => {
    let resolvedIri = t.iri;
    if (t.iri.includes(':')) {
        const colonIndex = t.iri.indexOf(':');
        const potentialPrefix = t.iri.substring(0, colonIndex);
        const reference = t.iri.substring(colonIndex + 1);
        if (state.ctx[potentialPrefix] && potentialPrefix !== '@vocab') {
            resolvedIri = state.ctx[potentialPrefix] + reference;
        }
    }
    state.ctx[t.prefix] = resolvedIri;
});
```

### 3.2 Context Resolution

Each context declaration modifies the processing context:

```javascript
{
    "@vocab": "http://www.w3.org/2000/01/rdf-schema#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "sh": "http://www.w3.org/ns/shacl#",
    "prov": "http://www.w3.org/ns/prov#"
}
```

Context applies **forward** from declaration point and cannot be removed, only overridden.

---

## 4. Subject Resolution

### 4.1 Current Subject Management

The processor maintains a `currentSubject` state:

```javascript
state.currentSubject = null; // Initially no subject
state.documentSubject = null; // Document-level subject
```

### 4.2 Subject Declaration Rules

#### Full IRI Subject
```md
{=ex:entity}
```
- Sets `currentSubject` to expanded IRI
- Emits no quads
- Stays current until changed

#### Fragment Subject  
```md
{=#fragment}
```
- Requires existing `currentSubject`
- Creates `currentSubjectBase#fragment`
- Replaces any existing fragment

#### Subject Reset
```md
{=} 
```
- Sets `currentSubject` to `null`
- Used for explicit context clearing

### 4.3 Subject Resolution Algorithm

```javascript
function resolveSubject(sem, state) {
    if (!sem.subject) return null;
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return null;
    }
    if (sem.subject.startsWith('=#')) {
        const fragment = sem.subject.substring(2);
        if (state.currentSubject) {
            const baseIRI = state.currentSubject.value.split('#')[0];
            return state.df.namedNode(`${baseIRI}#${fragment}`);
        }
        return null;
    } else {
        return state.df.namedNode(expandIRI(sem.subject, state.ctx));
    }
}
```

---

## 5. Annotation Processing

### 5.1 Semantic Block Parsing

Annotations are parsed into semantic blocks:

```javascript
function parseSemCached(attrs) {
    if (!attrs) return EMPTY_SEM;
    let sem = semCache[attrs];
    if (!sem) {
        sem = Object.freeze(parseSemanticBlock(attrs));
        semCache[attrs] = sem;
    }
    return sem;
}
```

### 5.2 Annotation Processing Flow

```javascript
function processAnnotation(carrier, sem, state, options = {}) {
    const { preserveGlobalSubject = false, implicitSubject = null } = options;

    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }

    const previousSubject = state.currentSubject;
    const newSubject = resolveSubject(sem, state);
    const localObject = resolveObject(sem, state);

    const effectiveSubject = implicitSubject || (newSubject && !preserveGlobalSubject ? newSubject : previousSubject);
    if (newSubject && !preserveGlobalSubject && !implicitSubject) {
        state.currentSubject = newSubject;
    }
    const S = preserveGlobalSubject ? (newSubject || previousSubject) : (implicitSubject || state.currentSubject);
    if (!S) return;

    // Create block for origin tracking
    const block = createBlock(
        S.value, sem.types, sem.predicates, sem.entries,
        carrier.range, carrier.attrsRange || null, carrier.valueRange || null,
        carrier.type || null, state.ctx
    );
    state.origin.blocks.set(block.id, block);

    // Process types and predicates
    processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier);
    processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier);
}
```

---

## 6. List Semantics

### 6.1 List Stack Management

Nested lists are managed with a stack to track semantic scope:

```javascript
const manageListStack = (token, state) => {
    // Pop stack frames for lists that have ended
    while (state.listStack.length && token.indent < state.listStack[state.listStack.length - 1].indent) {
        state.listStack.pop();
    }

    if (state.pendingListContext) {
        state.listStack.push({
            indent: token.indent,
            anchorSubject: state.pendingListContext.subject,
            contextSubject: state.pendingListContext.subject,
            contextSem: state.pendingListContext.sem,
            contextText: state.pendingListContext.contextText,
            contextToken: state.pendingListContext.contextToken
        });
        state.pendingListContext = null;
    }
};
```

### 6.2 List Context Detection

List contexts are detected from preceding paragraphs:

```javascript
function processListContextFromParagraph(token, state) {
    const contextMatch = LIST_CONTEXT_REGEX.exec(token.text);
    if (!contextMatch) return;

    const contextSem = parseSemCached(`{${contextMatch[2]}}`);
    let contextSubject = state.currentSubject || state.documentSubject;

    // Search backwards for subject if needed
    if (!contextSubject && state.tokens) {
        for (let i = state.currentTokenIndex - 1; i >= 0; i--) {
            const prevToken = state.tokens[i];
            if (prevToken.type === 'heading' && prevToken.attrs) {
                const prevSem = parseSemCached(prevToken.attrs);
                if (prevSem.subject) {
                    const resolvedSubject = resolveSubject(prevSem, state);
                    if (resolvedSubject) {
                        contextSubject = resolvedSubject.value;
                        break;
                    }
                }
            }
        }
    }

    state.pendingListContext = {
        sem: contextSem,
        subject: contextSubject,
        contextText: contextMatch[1].replace(':', '').trim(),
        contextToken: token
    };
}
```

### 6.3 Ordered List Processing

Ordered lists generate W3C RDF Collections (`rdf:List`):

```javascript
function processOrderedListItem(token, state) {
    if (!state.isProcessingOrderedList) {
        state.listCounter = (state.listCounter || 0) + 1;
        state.rdfListIndex = 0;
        state.firstListNode = null;
        state.previousListNode = null;
        state.contextConnected = false;
        state.isProcessingOrderedList = true;
    }

    generateRdfListTriples(token, state);

    // Apply list anchor annotations
    const listFrame = state.listStack[state.listStack.length - 1];
    if (listFrame?.contextSem) {
        const carriers = getCarriers(token);
        const itemInfo = findItemSubject(token, carriers, state);
        if (itemInfo?.subject) {
            applyListAnchorAnnotations(itemInfo.subject, listFrame.contextSem, state, token.text, listFrame.contextToken);
        }
    }

    // Connect context to list head
    if (listFrame?.contextSem && listFrame?.contextSubject && !state.contextConnected) {
        listFrame.contextSem.predicates.forEach(pred => {
            if (pred.form === '?') {
                const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
                const firstListNode = state.firstListNode;
                if (firstListNode) {
                    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-context',
                        listFrame.contextSubject, P, state.df.namedNode(firstListNode), state.df);
                    state.contextConnected = true;
                }
            }
        });
    }
}
```

### 6.4 RDF List Generation

Each ordered list item generates proper `rdf:List` triples:

```javascript
function generateRdfListTriples(token, state) {
    const listIndex = (state.rdfListIndex || 0) + 1;
    state.rdfListIndex = listIndex;
    const listNodeName = `list-${state.listCounter}-${listIndex}`;

    const listFrame = state.listStack[state.listStack.length - 1];
    const contextSubject = listFrame?.contextSubject || state.currentSubject || state.documentSubject;
    const baseIRI = contextSubject ? contextSubject.value : (state.ctx[''] || '');

    const listNodeIri = baseIRI.includes('#')
        ? `${baseIRI.split('#')[0]}#${listNodeName}`
        : `${baseIRI}#${listNodeName}`;

    if (!state.firstListNode) state.firstListNode = listNodeIri;

    // Emit rdf:type triple
    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-type',
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#List'),
        DataFactory,
        { type: 'ordered-list', range: token.valueRange || token.range, listNodeName }
    );

    // Emit rdf:first triple
    const itemInfo = findItemSubject(token, getCarriers(token), state);
    let firstObject = itemInfo?.subject || DataFactory.literal(token.text);
    
    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-first',
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
        firstObject,
        DataFactory,
        { type: 'ordered-list', range: originRange, listNodeName }
    );

    // Update previous rdf:rest
    if (state.previousListNode) {
        // Remove old rdf:rest -> rdf:nil and add new rdf:rest -> current node
        const prevRestQuadIndex = state.quads.findIndex(q =>
            q.subject.value === state.previousListNode &&
            q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'
        );
        if (prevRestQuadIndex !== -1) {
            state.quads.splice(prevRestQuadIndex, 1);
            emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-rest-update',
                DataFactory.namedNode(state.previousListNode),
                DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
                DataFactory.namedNode(listNodeIri),
                DataFactory,
                { type: 'ordered-list', range: token.valueRange || token.range, listNodeName: state.previousListNode }
            );
        }
    }

    // Emit rdf:rest -> rdf:nil
    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-rest',
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
        DataFactory,
        { type: 'ordered-list', range: token.valueRange || token.range, listNodeName }
    );

    state.previousListNode = listNodeIri;
}
```

---

## 7. Predicate Routing

### 7.1 The Three Predicate Forms

Each predicate is routed based on its prefix:

| Form | Subject | Object | Use Case |
|------|---------|--------|----------|
| `p` | Current subject | Literal value | Literal properties |
| `?p` | Current subject | Object IRI | Object properties |
| `!p` | Object IRI | Current subject | Reverse relationships |

### 7.2 Predicate Resolution Algorithm

```javascript
const determinePredicateRole = (pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L) => {
    if (pred.form === '' && carrier?.type === 'link' && carrier?.url && carrier.text === carrier.url) {
        return null; // Skip plain URLs without predicates
    }
    switch (pred.form) {
        case '':
            return carrier?.type === 'link' && carrier?.url && carrier.text !== carrier.url && !newSubject
                ? { subject: newSubjectOrCarrierO, object: L }
                : { subject: localObject || S, object: L };
        case '?':
            return { subject: newSubject ? previousSubject : S, object: localObject || newSubjectOrCarrierO };
        case '!':
            return { subject: localObject || newSubjectOrCarrierO, object: newSubject ? previousSubject : S };
        default:
            return null;
    }
};

function processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier) {
    sem.predicates.forEach(pred => {
        const role = determinePredicateRole(pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L);
        if (role) {
            const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
            emitQuad(state.quads, state.origin.quadIndex, block.id,
                role.subject, P, role.object, state.df,
                { kind: 'pred', token: `${pred.form}${pred.iri}`, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
            );
        }
    });
}
```

---

## 8. Error Handling

### 8.1 Error Classification

| Error Type | Severity | Recovery |
|------------|---------|----------|
| Unknown prefix | Recoverable | Skip token, continue |
| Malformed IRI | Recoverable | Skip annotation |
| Unbalanced braces | Fatal | Stop processing |
| Invalid carrier | Recoverable | Skip annotation |

### 8.2 Recovery Strategy

The processor follows a **graceful degradation** approach:

1. **Skip invalid annotations** - Continue processing other tokens
2. **Maintain context** - Don't reset subject on recoverable errors
3. **Log warnings** - Provide diagnostic information
4. **Never crash** - Invalid MD-LD should never break parsing

---

## 9. Origin Tracking

### 9.1 Block Creation

Each annotation creates a **block** with stable identity:

```javascript
const block = createBlock(
    S.value, sem.types, sem.predicates, sem.entries,
    carrier.range, carrier.attrsRange || null, carrier.valueRange || null,
    carrier.type || null, state.ctx
);

const signature = [
    subject,
    carrierType || 'unknown',
    expanded.types.join(','),
    expanded.predicates.map(p => `${p.form}${p.iri}`).join(',')
].join('|');

const blockId = hash(signature);
```

### 9.2 Quad Indexing

Every quad is indexed for round-trip mapping:

```javascript
emitQuad(quads, quadIndex, blockId, subject, predicate, object, dataFactory, meta = null) {
    const quad = dataFactory.quad(subject, predicate, object);
    quads.push(quad);
    
    const slotInfo = createSlotInfo(blockId, meta?.entryIndex, {
        ...meta, subject, predicate, object
    });
    
    quadIndex.set(quadIndexKey(quad.subject, quad.predicate, quad.object), slotInfo);
}
```

---

## 10. Processing Guarantees

### 10.1 Deterministic Properties

- **Order-independent** - Token order in `{...}` doesn't affect output
- **Context-stable** - Same context produces same IRI expansions
- **Round-trip safe** - Quads can be serialized back to original positions

### 10.2 Complexity Bounds

- **Time**: O(n) where n = document length
- **Space**: O(m) where m = number of quads produced
- **Memory**: Constant additional memory per token

### 10.3 Streaming Compatibility

The processing model is designed for streaming:
- **No backtracking** - Each line processed once
- **Local state** - Only current context needed
- **Incremental output** - Quads emitted as soon as possible

---

## 11. Implementation Requirements

Conformant MD-LD processors MUST:

1. **Process documents in a single pass**
2. **Maintain deterministic subject resolution**
3. **Apply list context only to same indentation level**
4. **Handle all three predicate forms correctly**
5. **Provide origin tracking for round-trip serialization**
6. **Generate proper W3C RDF Collections for ordered lists**
7. **Recover gracefully from malformed annotations**
8. **Expand IRIs using the current context**

Processors MAY:
- Cache parsed semantic blocks for performance
- Provide additional error diagnostics
- Support custom data factories
- Implement streaming interfaces

---

This processing model ensures that any conformant MD-LD processor will produce identical RDF quads from the same input document, enabling reliable interoperability and round-trip serialization.
