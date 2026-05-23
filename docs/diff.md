# Diff Document Generation

MD-LD supports automatic diff document generation through the `remove` parameter in the `generate()` function. This enables CRDT-style workflows, state management, and collaborative editing with human-readable diff documents.

## Overview

The `generate()` function now accepts an optional `remove` parameter containing RDF/JS quads to retract. This allows you to generate MDLD documents that represent state transitions:

```javascript
generate({ 
  quads,      // Quads to add
  remove,     // Quads to retract
  context,
  primarySubject,
  compactInline,
  renderReverse
})
```

## How It Works

### Retraction Syntax

The `generate()` function automatically formats retractions using MDLD's polarity system:

- **Literal properties:** `[value] {-predicate}`
- **Object properties:** `[obj] {+obj -?predicate}`
- **Type declarations:** `> {-.Type}`

### Example

```javascript
import { generate, DataFactory } from 'mdld-parse';

const { namedNode, literal } = DataFactory;

const quads = [
  DataFactory.quad(
    namedNode('http://example.org/doc'),
    namedNode('http://example.org/author'),
    literal('Alice')
  )
];

const remove = [
  DataFactory.quad(
    namedNode('http://example.org/doc'),
    namedNode('http://example.org/author'),
    literal('Smith')
  )
];

const { text } = generate({
  quads,
  remove,
  context: { ex: 'http://example.org/' }
});
```

**Generated MDLD:**
```markdown
[ex] <http://example.org/>

# doc {=ex:doc}
[Alice] {ex:author}
[Smith] {-ex:author}
```

## Use Cases

### 1. State Diffing

Compare two states and generate a diff document:

```javascript
import { parse, generate } from 'mdld-parse';

const currentState = parse({ text: doc1 });
const newState = parse({ text: doc2 });

// Calculate diff
const added = newState.quads.filter(q => 
  !currentState.quads.some(c => 
    c.subject.value === q.subject.value &&
    c.predicate.value === q.predicate.value &&
    c.object.value === q.object.value
  ))
);

const removed = currentState.quads.filter(q => 
  !newState.quads.some(c => 
    c.subject.value === q.subject.value &&
    c.predicate.value === q.predicate.value &&
    c.object.value === q.object.value
  ))
);

// Generate diff document
const diff = generate({ quads: added, remove: removed });
```

### 2. Append-Only State Management

Store operations as append-only documents for replay:

```javascript
const operations = [
  initialState,      // Document 1: initial state
  userAction1,       // Document 2: user added data
  userAction2,       // Document 3: user modified data
  userAction3        // Document 4: user deleted data (with retractions)
];

// Replay to get current state
const currentState = merge(operations);
```

### 3. Time Travel & Undo/Redo

Navigate through operation history:

```javascript
// State at step 5
const stateAtStep5 = merge(operations.slice(0, 5));

// State at step 10
const stateAtStep10 = merge(operations.slice(0, 10));

// Undo last operation
const beforeLast = merge(operations.slice(0, -1));

// Redo last operation
const afterLast = merge(operations);
```

### 4. Collaborative Editing

Merge edits from multiple users:

```javascript
// User A's diff
const userADiff = generate({ 
  quads: userAAdds, 
  remove: userARemoves 
});

// User B's diff
const userBDiff = generate({ 
  quads: userBAdds, 
  remove: userBRemoves 
});

// Merge with conflict resolution
const merged = merge([baseState, userADiff, userBDiff]);
```

### 5. LLM State Operations

LLMs can propose and author state changes:

```javascript
// LLM proposes changes
const llmProposed = generate({ 
  quads: llmAdditions, 
  remove: llmRetractions 
});

// Human reviews and accepts
const finalState = merge([currentState, llmProposed]);
```

### 6. Audit Trails

Maintain complete history with provenance:

```javascript
const history = operations.map((op, i) => ({
  timestamp: timestamps[i],
  author: authors[i],
  diff: op,
  hash: hash(op)
}));
```

## Retraction Formats

### Literal Properties

```javascript
// Input
DataFactory.quad(
  namedNode('http://example.org/doc'),
  namedNode('http://example.org/age'),
  literal('25', namedNode('http://www.w3.org/2001/XMLSchema#integer'))
)

// Output
`25` {-ex:age ^^xsd:integer}
```

### Object Properties

```javascript
// Input
DataFactory.quad(
  namedNode('http://example.org/doc'),
  namedNode('http://example.org/author'),
  namedNode('http://example.org/bob')
)

// Output
[bob] {+ex:bob -?ex:author}
```

### Type Declarations

```javascript
// Input
DataFactory.quad(
  namedNode('http://example.org/doc'),
  namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
  namedNode('http://example.org/Draft')
)

// Output
> {-.Draft}
```

### Language Tags

```javascript
// Input
DataFactory.quad(
  namedNode('http://example.org/doc'),
  namedNode('http://example.org/title'),
  literal('Hola', 'es')
)

// Output
[Hola] {-ex:title @es}
```

### Multiline Values

```javascript
// Input
DataFactory.quad(
  namedNode('http://example.org/doc'),
  namedNode('http://example.org/description'),
  literal('Line 1\nLine 2\nLine 3')
)

// Output
~~~ {-ex:description}
Line 1
Line 2
Line 3
~~~
```

## External Retractions

If a subject in `remove` doesn't appear in `quads`, the function creates a separate heading for it:

```javascript
const { text } = generate({
  quads: [
    DataFactory.quad(
      namedNode('http://example.org/doc'),
      namedNode('http://example.org/author'),
      literal('Alice')
    )
  ],
  remove: [
    DataFactory.quad(
      namedNode('http://example.org/other'),
      namedNode('http://example.org/name'),
      literal('Bob')
    )
  ],
  context: { ex: 'http://example.org/' }
});
```

**Output:**
```markdown
[ex] <http://example.org/>

# doc {=ex:doc}
[Alice] {ex:author}

# other {=ex:other}
[Bob] {-ex:name}
```

## Round-Trip Safety

Generated diff documents parse correctly and preserve the `remove` array:

```javascript
const { text } = generate({ quads, remove, context });
const parsed = parse({ text, context });

// parsed.quads contains the additions
// parsed.remove contains the retractions
```

## Benefits

1. **Human-readable:** Diffs are plain text, easy to review and understand
2. **Deterministic:** Same input always produces same output
3. **Round-trip safe:** Parse → generate → parse preserves intent
4. **Version control friendly:** Diffs can be tracked with Git
5. **CRDT-style:** Enables append-only state management
6. **Collaborative:** Supports multi-user editing with conflict resolution

## Integration with Merge

The `remove` parameter works seamlessly with the `merge()` function for CRDT-style workflows:

```javascript
// Create a diff document
const diff = generate({ quads: added, remove: removed });

// Merge with existing state
const newState = merge([currentState, diff]);
```

## Advanced Patterns

### State Snapshot + Diff

```javascript
// Take a snapshot
const snapshot = generate({ quads: currentState.quads });

// Generate incremental diff
const diff = generate({ quads: added, remove: removed });

// Replay: snapshot + all diffs
const replayed = merge([snapshot, ...diffs]);
```

### Conflict Detection

```javascript
// Detect conflicts by checking if same quad is added and removed
const conflicts = added.filter(addQuad =>
  removed.some(removeQuad =>
    addQuad.subject.value === removeQuad.subject.value &&
    addQuad.predicate.value === removeQuad.predicate.value &&
    addQuad.object.value === removeQuad.object.value
  )
);
```

### Incremental Backups

```javascript
// Store only diffs (space-efficient)
const backups = [];
let lastState = initialState;

for (const operation of operations) {
  const diff = generate({ 
    quads: operation.added, 
    remove: operation.removed 
  });
  backups.push(diff);
  lastState = merge([lastState, diff]);
}
```

## Performance Considerations

- **Memory:** Retractions are grouped by subject for efficient processing
- **Parsing:** Single-pass parsing maintains O(n) complexity
- **Merge:** Linear time complexity for document merging
- **Storage:** Diff documents are typically smaller than full snapshots

## Best Practices

1. **Use meaningful subjects:** External retractions create headings, so use descriptive IRIs
2. **Preserve context:** Always pass the same context to `generate()` and `parse()`
3. **Validate diffs:** Parse generated diffs to verify correctness
4. **Track provenance:** Include metadata (author, timestamp) with each diff
5. **Handle conflicts:** Implement conflict resolution for concurrent edits
