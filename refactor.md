# MDLD Origin System - Deterministic Refactoring

## 🧩 Executive Summary

The MDLD origin system provides a powerful foundation for **sophisticated, deterministic refactoring** that goes far beyond simple text editing. By treating the origin as an AST-like structure, we can enable complex programmatic transformations while maintaining perfect round-trip capability.

## 🏗️ Core Architecture

### Origin as Abstract Syntax Tree

```
origin = {
    blocks: Map<blockId, {
        id: string,
        range: { start: number, end: number },
        subject: NamedNode,
        entries: Array<{
            kind: 'subject'|'type'|'property'|'object',
            raw: string,
            expandedPredicate?: string,
            expandedObject?: string,
            entryIndex: number,
            form: string
        }>,
        carrierType: 'heading'|'list'|'span',
        valueRange?: { start: number, end: number },
        attrsRange?: { start: number, end: number }
    }>,
    quadIndex: Map<quadKey, {
        blockId: string,
        entryIndex: number,
        kind: string,
        subject: NamedNode,
        predicate: NamedNode,
        object: NamedNode|Literal,
        isVacant: boolean,
        lastValue: any,
        vacantSince: number
    }>
}
```

## 🎯 Deterministic Refactoring Operations

### 1. Structural Operations

#### `moveBlock(from, to)`
Repositions a subject block to a new location in the document flow.

**Use Cases:**
- Reorder subjects alphabetically
- Move related subjects together
- Create logical document organization

#### `mergeBlocks(blockIds, into)`
Combines multiple blocks into a single cohesive block.

**Use Cases:**
- Merge related subjects under common parent
- Consolidate scattered properties
- Create summary blocks

#### `splitBlock(blockId, at)`
Divides a complex block into smaller, focused blocks.

**Use Cases:**
- Break down long subject blocks
- Separate concerns within subjects
- Improve readability and maintainability

#### `nestSubject(parent, child)`
Creates hierarchical subject relationships.

**Use Cases:**
- Part-of relationships (ex: chapter → ex:section)
- Organizational hierarchies
- Nested content structures

### 2. Content Transformations

#### `renameSubject(from, to, scope)`
Changes subject IRIs across all references in the document.

**Use Cases:**
- Bulk IRI changes (domain migrations)
- Schema refactoring
- Identifier normalization

#### `extractSubject(from, to)`
Pulls embedded subjects out to top-level.

**Use Cases:**
- Flatten nested structures
- Extract inline subjects to full blocks
- Refactor complex documents

#### `changePredicate(from, to, scope)`
Batch updates predicate IRIs across the document.

**Use Cases:**
- Schema migrations
- Property renames
- Namespace standardization

### 3. Advanced Operations

#### `reorderList(blockId, order)`
Reorders list items according to specified sequence.

**Use Cases:**
- Sort lists alphabetically
- Create logical ordering
- Implement custom sort criteria

#### `flattenHierarchy(blockId)`
Converts nested subject structures to flat organization.

**Use Cases:**
- Simplify complex hierarchies
- Improve processing performance
- Enable different analysis patterns

## 🔧 Implementation Strategy

### Phase 1: Operation Planning
```javascript
function planRefactoring(origin, operations) {
    // Validate operations
    validateOperations(operations, origin);
    
    // Calculate dependencies
    const dependencies = calculateDependencies(operations);
    
    // Optimize operation order
    const optimized = optimizeOperationOrder(operations, dependencies);
    
    return optimized;
}
```

### Phase 2: Range Management
```javascript
function updateRangesAfterMove(origin, movedBlockId, newPosition) {
    const offset = newPosition - movedBlock.range.start;
    
    // Update all subsequent blocks
    for (const [blockId, block] of origin.blocks) {
        if (block.range.start > movedBlock.range.start) {
            const newRange = {
                start: block.range.start + offset,
                end: block.range.end + offset
            };
            origin.blocks.set(blockId, { ...block, range: newRange });
        }
    }
}
```

### Phase 3: Text Reconstruction
```javascript
function rebuildTextFromOrigin(origin, context) {
    // Sort blocks by position
    const sortedBlocks = Array.from(origin.blocks.entries())
        .sort(([, blockA], [, blockB]) => blockA.range.start - blockB.range.start);
    
    // Reconstruct text
    return sortedBlocks.map(block => extractBlockText(block, context)).join('');
}
```

## 🎪 Benefits

### For Developers
- **Deterministic**: Same operations → identical results
- **Atomic**: Each operation is well-defined and reversible
- **Composable**: Operations can be chained for complex transformations
- **Traceable**: Complete operation history and provenance
- **Efficient**: No text parsing required for structural changes

### For LLM Applications
- **Operation Generation**: AI can plan complex refactoring sequences
- **Validation**: Automatic consistency checking
- **Batch Processing**: Efficient bulk transformations
- **Rollback Support**: Safe experimentation with undo capability

### For Users
- **Structured Editing**: Complex changes through simple operations
- **Visual Feedback**: Clear operation previews and results
- **History Tracking**: Complete change audit trail
- **Error Recovery**: Safe rollback from failed operations

## 🚀 Implementation Roadmap

### Phase 1: Core Operations (Week 1-2)
- [ ] `moveBlock` implementation
- [ ] `mergeBlocks` implementation  
- [ ] `splitBlock` implementation
- [ ] Range management utilities
- [ ] Basic validation framework

### Phase 2: Content Transformations (Week 3-4)
- [ ] `renameSubject` implementation
- [ ] `extractSubject` implementation
- [ ] `changePredicate` implementation
- [ ] Dependency resolution system

### Phase 3: Advanced Features (Week 5-6)
- [ ] `reorderList` implementation
- [ ] `flattenHierarchy` implementation
- [ ] Operation batching
- [ ] Rollback and undo system

### Phase 4: LLM Integration (Week 7-8)
- [ ] Operation planning AI
- [ ] Natural language operation descriptions
- [ ] Visual diff generation
- [ ] Smart operation suggestions

## 🔬 Testing Strategy

### Unit Tests
```javascript
describe('Refactoring Operations', () => {
    test('moveBlock reorders subjects correctly', () => {
        const origin = createTestOrigin();
        const operations = [{ type: 'moveBlock', from: 'person-bob', to: 0 }];
        const result = refactorMDLD(origin, operations);
        
        expect(result.blocks.get('person-bob').range.start).toBe(0);
    });
    
    test('mergeBlocks combines related content', () => {
        // Test merge operation
    });
});
```

### Integration Tests
```javascript
describe('Refactoring Integration', () => {
    test('Round-trip preservation', () => {
        const original = parse(testMDLD);
        const refactored = refactorMDLD(original.origin, operations);
        const reparsed = parse(refactored.text);
        
        expect(reparsed.quads).toEqual(original.quads);
    });
});
```

## 🎯 Success Metrics

### Performance Targets
- **Operation planning**: < 10ms for 100 operations
- **Range updates**: < 50ms for full document
- **Text reconstruction**: < 100ms for 10KB document
- **Memory usage**: < 2x baseline for complex operations

### Quality Targets
- **100% round-trip preservation**
- **Zero data loss**
- **Deterministic output**
- **Complete origin consistency**

---

*This document serves as the foundation for implementing sophisticated, deterministic MDLD refactoring capabilities that leverage the origin system's full potential.*
