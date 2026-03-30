# MDLD Match Feature - Experience Report and Implementation Plan

**Status:** Research Complete, Implementation Retracted  
**Date:** March 31, 2026  
**Scope:** Single-pass pattern matching embedded in MDLD annotations using `*` wildcard

---

## Executive Summary

The MDLD Match feature underwent a complete research, design, and implementation cycle, followed by comprehensive testing that revealed critical architectural issues. This document captures the valuable experience gained and provides a grounded plan for future re-implementation from scratch.

### Key Achievements
- **Complete Specification**: Fully detailed spec with syntax examples and use cases
- **Working Prototype**: Functional implementation with advanced features like namespace wildcards
- **Comprehensive Testing**: 6 test patterns covering real-world scenarios
- **Integration Framework**: Pattern dispatch system integrated with parse.js

### Critical Issues Discovered
- **Multi-carrier Pattern Complexity**: Token-level pattern grouping creates unmanageable edge cases
- **Parser Coupling**: Tight integration with parse.js creates maintenance burden
- **State Management Complexity**: Pending pattern system adds significant cognitive overhead
- **Test Failures**: Core patterns broken due to architectural complexity

---

## 1. Original Vision and Requirements

### 1.1 Core Concept
A `*` token in any position of an MDLD annotation switches that annotation from **assertion mode** to **match mode**. In match mode, no quads are emitted. Instead, a pattern descriptor is registered with the parser and fires a callback for every matching triple emitted **from that point forward**.

### 1.2 Syntax Examples
```md
# Universal pattern - all type declarations
{=* .*}

# Specific subject with wildcard predicates  
[Alice] {=ex:alice} has [everything] {?* +*}

# Namespace wildcard patterns
[All my subjects] {=my:*} know [everyone] {+* ?foaf:knows}

# Reverse lookup
Who knows [Bob] {+ex:bob ?ex:knows}?
```

### 1.3 Use Cases Identified
1. **Document Inventory**: Extract all type assertions for analysis
2. **Entity Profile**: Extract complete description of specific entities
3. **Relationship Mapping**: Find all connections between entities
4. **Namespace Filtering**: Extract patterns within specific vocabularies
5. **Semantic Subsetting**: Create focused document extracts

---

## 2. Implementation Experience

### 2.1 Architecture Attempted

#### Pattern Registration System
```javascript
// Pattern object structure
{
    id: "unique_hash",
    pattern: "original_annotation_text",
    subject: "ground_iri_or_*",
    predicate: "ground_iri_or_*", 
    object: "ground_iri_or_*",
    results: [],
    carriers: [] // Multi-carrier support
}
```

#### Parser Integration Points
1. **Pattern Detection**: `parseSemanticBlock` detects `*` tokens
2. **Pattern Registration**: `processPatternAnnotation` creates pattern objects
3. **Pattern Dispatch**: `emitQuad` tests against all registered patterns
4. **Result Collection**: Matches stored with full origin context

#### Advanced Features Implemented
- **Namespace Wildcards**: `ex:*` patterns for namespace filtering
- **Multi-carrier Patterns**: Complex constraint combination
- **Context Preservation**: Full origin tracking with match results
- **Generate Integration**: Render matches back to valid MDLD

### 2.2 Critical Architecture Problems

#### Problem 1: Multi-carrier Pattern Complexity
The attempt to support patterns like:
```md
[Alice] {=ex:alice} has [name] {ex:name} and [email] {ex:email}
```

Created a complex "pending pattern" system that:
- Required token-level state tracking
- Created ambiguous pattern boundaries
- Led to unpredictable constraint merging
- Made debugging extremely difficult

#### Problem 2: Parser Coupling
Direct integration with `parse.js` created:
- Tight coupling between parsing and pattern matching
- Difficulty in testing pattern logic independently
- Complex state management across parser phases
- Risk of breaking core parsing functionality

#### Problem 3: State Management Overhead
The implementation required:
- `state.patterns` array for active patterns
- `state.pendingPatterns` Map for multi-carrier resolution
- `state.currentTokenIndex` for token tracking
- Complex finalization logic

#### Problem 4: Edge Case Explosion
Multi-carrier patterns created numerous edge cases:
- Overlapping pattern tokens
- Mixed assertion/pattern carriers
- Namespace resolution timing
- Context inheritance complexity

---

## 3. Test Results and Failures

### 3.1 Test Suite Developed
6 comprehensive tests covering:
1. **Universal Pattern** (`{*}`) - All type declarations
2. **Type-Only Pattern** (`{=* .*}`) - Type assertions only
3. **Specific Subject Type** - Alice's type declarations
4. **Specific Subject Wildcard** - All Alice's relationships
5. **Namespace Pattern** - My namespace subjects with foaf:knows
6. **Reverse Lookup** - All subjects that know Bob

### 3.2 Current Test Status
**ALL TESTS FAILING** due to architectural issues:

#### Example Failure: "All subjects that know Bob"
**Expected:**
```md
[my] <tag:match@mdld.js.org,2026:>
[foaf] <http://xmlns.com/foaf/0.1/>

# alice {=my:alice}
[my:bob] {+my:bob ?foaf:knows}

# carol {=my:carol}  
[my:bob] {+my:bob ?foaf:knows}
```

**Actual:**
```md
[foaf] <http://xmlns.com/foaf/0.1/>
[my] <tag:match@mdld.js.org,2026:>

# bob {=my:bob}
[my:bob] {+my:bob ?foaf:knows}
[my:bob] {+my:bob ?foaf:knows}
[my:bob] {+my:bob ?foaf:knows}
```

**Root Cause:** Pattern matching logic broken by multi-carrier complexity

### 3.3 Specific Technical Issues
1. **Pattern Detection Failure**: Wildcard detection not working consistently
2. **Constraint Merging**: Multiple carriers creating incorrect pattern constraints
3. **Subject Resolution**: Current subject inheritance not working properly
4. **Namespace Resolution**: Prefix handling inconsistent in patterns

---

## 4. Valuable Experience Gained

### 4.1 What Worked Well
1. **Core Concept**: The `*` wildcard syntax is intuitive and powerful
2. **Pattern Shape**: Triple-based pattern matching is fundamentally sound
3. **Origin Integration**: Match results with context preserve semantic meaning
4. **Generate Integration**: Rendering matches back to MDLD is highly valuable
5. **Namespace Wildcards**: Advanced filtering capabilities are useful

### 4.2 What Didn't Work
1. **Multi-carrier Patterns**: Too complex for the value provided
2. **Parser Integration**: Tight coupling creates maintenance burden
3. **Complex State Management**: Pending patterns add unnecessary complexity
4. **Token-level Tracking**: Granular state tracking creates edge cases

### 4.3 Key Insights
1. **Simplicity Matters**: Single-pattern-per-annotation is sufficient
2. **Separation of Concerns**: Pattern matching should be separate from parsing
3. **Incremental Approach**: Start simple, add complexity later
4. **Test-Driven Development**: Comprehensive testing essential for complex features

---

## 5. Grounded Re-implementation Plan

### 5.1 Core Principles for Restart

#### Principle 1: Simple Architecture
- **One pattern per annotation only**
- **No multi-carrier patterns**
- **Separate pattern matching module**
- **Minimal parser changes**

#### Principle 2: Incremental Development
- **Phase 1**: Basic wildcard patterns only
- **Phase 2**: Namespace wildcards (if needed)
- **Phase 3**: Advanced features (based on usage)

#### Principle 3: Clear Separation
- **Parser**: Detects patterns, creates pattern objects
- **Matcher**: Tests quads against patterns
- **Results**: Collects and formats matches

### 5.2 Proposed Architecture

#### Phase 1: Core Pattern Matching
```javascript
// Simple pattern structure
{
    id: "hash",
    text: "original_annotation",
    subject: "ground|*|null",
    predicate: "ground|*|null", 
    object: "ground|*|null",
    results: []
}
```

#### Parser Integration (Minimal)
```javascript
// In parse.js - minimal changes
if (containsWildcard(sem)) {
    const pattern = createSimplePattern(sem, carrier, state);
    state.patterns.push(pattern);
    return; // Don't emit quads
}

// In emitQuad - simple dispatch
for (const pattern of state.patterns) {
    if (matchesPattern(quad, pattern)) {
        pattern.results.push({ quad, origin });
    }
}
```

#### Separate Pattern Module
```javascript
// src/patterns.js - pure pattern logic
export function containsWildcard(sem) { /* simple detection */ }
export function createSimplePattern(sem, carrier, state) { /* simple creation */ }
export function matchesPattern(quad, pattern) { /* O(1) matching */ }
```

### 5.3 Implementation Timeline

#### Week 1: Core Infrastructure
- [ ] Remove all existing match code from parse.js
- [ ] Create simple patterns.js module
- [ ] Implement basic wildcard detection
- [ ] Add simple pattern registration

#### Week 2: Pattern Matching Engine
- [ ] Implement O(1) pattern matching
- [ ] Add result collection with origin
- [ ] Create basic test suite
- [ ] Verify core functionality

#### Week 3: Integration and Testing
- [ ] Integrate with existing generate.js
- [ ] Add comprehensive test coverage
- [ ] Update documentation
- [ ] Performance testing

#### Week 4: Advanced Features (Optional)
- [ ] Namespace wildcards (if needed)
- [ ] Enhanced error handling
- [ ] Performance optimizations
- [ ] Additional use cases

### 5.4 Success Criteria

#### Functional Criteria
- [ ] All 6 core test patterns pass
- [ ] No regression in existing parse functionality
- [ ] Clean separation between parsing and matching
- [ ] Deterministic match results

#### Quality Criteria  
- [ ] <5% increase in parse time overhead
- [ ] <100 lines of code added to parse.js
- [ ] Comprehensive test coverage
- [ ] Clear documentation and examples

#### Maintainability Criteria
- [ ] Simple, readable code structure
- [ ] Minimal state management
- [ ] Clear module boundaries
- [ ] Easy to extend and modify

---

## 6. Lessons Learned for Future Development

### 6.1 Architectural Lessons
1. **Start Simple**: Begin with minimal viable implementation
2. **Avoid Over-Engineering**: Complex features often unnecessary
3. **Separate Concerns**: Keep parsing and matching independent
4. **Test Early**: Comprehensive testing prevents architectural debt

### 6.2 Process Lessons
1. **Prototype First**: Build simple prototype before full implementation
2. **Iterative Development**: Add complexity incrementally
3. **Regular Retrospective**: Evaluate architecture decisions frequently
4. **Documentation Matters**: Clear specs prevent scope creep

### 6.3 Technical Lessons
1. **State Management**: Minimize mutable state in parsers
2. **Edge Case Handling**: Complex systems create exponential edge cases
3. **Performance Matters**: O(1) operations essential for streaming
4. **Backward Compatibility**: Don't break existing functionality

---

## 7. Recommendation

**RETRACT ALL CURRENT MATCH IMPLEMENTATION**

The current implementation has fundamental architectural issues that cannot be easily fixed. The complexity of multi-carrier patterns, tight parser coupling, and state management overhead creates an unmaintainable codebase.

**RESTART WITH SIMPLE ARCHITECTURE**

Begin with a clean, simple implementation that:
- Supports one pattern per annotation only
- Maintains clean separation between parsing and matching
- Uses minimal state management
- Implements core wildcard functionality first

**FOCUS ON CORE VALUE**

The 80/20 rule applies here:
- 80% of value comes from simple wildcard patterns
- 20% of value comes from complex multi-carrier patterns
- Implement the 80% first, evaluate the 20% later

---

## 8. Next Steps

1. **Immediate Action**: Remove all match-related code from parse.js
2. **Code Cleanup**: Delete src/match.js and related test files
3. **Documentation**: Archive current docs as "research experience"
4. **Fresh Start**: Begin Phase 1 implementation with simple architecture
5. **Incremental Development**: Build and test one feature at a time

---

## 9. Conclusion

The MDLD Match feature research cycle provided valuable insights into pattern matching in semantic documents. While the initial implementation became overly complex, the core concept remains sound and valuable.

By restarting with a simpler, more focused architecture, we can achieve the original vision while maintaining code quality and maintainability. The experience gained will inform better architectural decisions and prevent similar issues in future development.

The key takeaway: **simplicity beats complexity** when implementing features in a streaming parser. Start simple, add complexity only when proven necessary, and maintain clear separation of concerns throughout the development process.
