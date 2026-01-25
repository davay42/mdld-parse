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

### 2.1 Line-by-Line Scanning

The document is processed sequentially by lines:

```javascript
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = pos;
    pos += line.length + 1;
    // Process line...
}
```

### 2.2 Token Types

Each line is classified into one of these token types:

| Token Type | Pattern | Semantic Role |
|------------|---------|---------------|
| `prefix` | `[name] <IRI>` | Context declaration |
| `heading` | `#{1,6} text {attrs?}` | Block carrier |
| `list` | `[-*+] text {attrs?}` or `\d+. text {attrs?}` | Block carrier |
| `blockquote` | `> text {attrs?}` | Block carrier |
| `code` | ```lang {attrs?}` | Block carrier |
| `para` | any other text | Potential inline carriers |

### 2.3 Code Block Handling

Code blocks are handled specially due to their multi-line nature:

1. **Opening fence detected** - Extract language and attributes
2. **Content accumulation** - Store all lines until closing fence
3. **Closing fence detected** - Emit single `code` token with full content

---

## 3. Context Declaration Processing

### 3.1 Processing Order

Context declarations are processed **before** any other tokens:

```javascript
// Process prefix declarations first
state.tokens.filter(t => t.type === 'prefix').forEach(t => state.ctx[t.prefix] = t.iri);
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

## 5. Annotation Attachment

### 5.1 Carrier Detection

Each token is scanned for **inline carriers** using sticky regex patterns:

```javascript
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};
```

### 5.2 Attachment Rules

An `{...}` block attaches to the **nearest valid value carrier**:

1. **Inline carriers** have priority over block carriers
2. **Immediate attachment** - `{...}` must follow carrier directly
3. **Ambiguous cases** emit no quads (error recovery)

### 5.3 Carrier Types

| Carrier | Text Source | Object Source |
|---------|-------------|---------------|
| `emphasis` | Emphasized text | None |
| `link` | Link text | URL from `href` |
| `image` | Alt text | URL from `src` |
| `code` | Code content | None |
| `heading` | Heading text | None |
| `list` | Item text | None |
| `blockquote` | Quote text | None |
| `code-fence` | Full content | None |

---

## 6. List Semantics

### 6.1 List Stack Management

Nested lists are managed with a stack to track semantic scope:

```javascript
function manageListStack(token, state) {
    // Pop stack frames for lists that have ended
    while (state.listStack.length && 
           token.indent < state.listStack[state.listStack.length - 1].indent) {
        state.listStack.pop();
    }
    
    // Push new frame for nested lists
    if (state.pendingListContext) {
        state.listStack.push({
            indent: token.indent,
            anchorSubject: state.pendingListContext.subject,
            contextSubject: state.pendingListContext.subject,
            contextSem: state.pendingListContext.sem
        });
        state.pendingListContext = null;
    }
}
```

### 6.2 List Context Application

A list anchor applies to **all items at the same indentation level**:

```md
Ingredients: {?hasIngredient .Ingredient name}
- Flour {=ex:flour}
- Water {=ex:water}
```

Processing steps:
1. Detect list anchor in preceding paragraph
2. Store context in `pendingListContext`
3. Apply to each list item at same level
4. **Nested lists do not inherit** parent context

### 6.3 List Item Processing

Each list item can declare its own subject:

```javascript
function processListItem(token, state) {
    const carriers = getCarriers(token);
    
    // Find subject from list token or inline carriers
    const itemInfo = findItemSubject(token, carriers, state);
    if (!itemInfo) return;
    
    // Apply list context if available
    if (listFrame?.contextSem) {
        processContextSem({
            sem: listFrame.contextSem,
            itemSubject,
            contextSubject: listFrame.contextSubject,
            state
        });
    }
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
function processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state) {
    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
        
        const roles = {
            '': { subject: localObject || S, object: L },
            '?': { subject: newSubject ? previousSubject : S, object: localObject || newSubjectOrCarrierO },
            '!': { subject: localObject || newSubjectOrCarrierO, object: newSubject ? previousSubject : S }
        };
        
        const role = roles[pred.form];
        if (role && role.subject && role.object) {
            emitQuad(state.quads, state.origin.quadIndex, block.id,
                     role.subject, P, role.object, state.df, meta);
        }
    });
}
```

### 7.3 Object Resolution

Objects come from:
- **Link URLs**: `[text](url)` → `url`
- **Image URLs**: `![alt](url)` → `url`  
- **Explicit IRIs**: `{+iri}` → expanded IRI
- **Soft fragments**: `{+#fragment}` → `currentSubjectBase#fragment`

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
6. **Recover gracefully from malformed annotations**
7. **Expand IRIs using the current context**

Processors MAY:
- Cache parsed semantic blocks for performance
- Provide additional error diagnostics
- Support custom data factories
- Implement streaming interfaces

---

This processing model ensures that any conformant MD-LD processor will produce identical RDF quads from the same input document, enabling reliable interoperability and round-trip serialization.
