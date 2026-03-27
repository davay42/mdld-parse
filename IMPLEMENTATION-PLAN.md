# MD-LD Render Implementation Plan

**Implementation Strategy for Streaming-Compatible HTML+RDFa Renderer**

---

## 1. Architecture Overview

### Core Design Principles
- **Single-pass streaming** - O(n) complexity, no look-ahead
- **Parser integration** - Reuse existing parse() output
- **Semantic fidelity** - Preserve all RDF semantics in HTML+RDFa
- **CommonMark compliance** - Handle all list edge cases
- **Agent empowerment** - Interactive features through data attributes

### File Structure
```
src/
├── shared.js         # Shared utilities and patterns
├── render.js          # Main render function
├── render/
│   ├── blocks.js      # Block-level rendering
│   ├── lists.js       # Advanced list processing  
│   ├── carriers.js    # Inline carrier extraction
│   ├── rdfa.js        # RDFa attribute generation
│   └── utils.js       # Render-specific utilities
└── test/
    └── render.test.js  # Comprehensive tests
```

---

## Code Reuse Strategy

### Shared Module Benefits
By extracting common patterns to `src/shared.js`, we ensure:

1. **DRY Code** - Single source of truth for CommonMark patterns
2. **Perfect Sync** - Parser and renderer use identical logic
3. **Performance** - Pre-compiled regex patterns shared
4. **Maintainability** - Changes update both parser and renderer

### Key Shared Components

#### 1. CommonMark Patterns
```javascript
// From shared.js - used by both parser and renderer
export const URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
export const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
export const UNORDERED_LIST_REGEX = /^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
export const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};
```

#### 2. Range Calculation
```javascript
// Shared between parser token creation and renderer content extraction
export function calcRangeInfo(line, attrs, lineStart, prefixLength, valueLength) {
    const wsLength = prefixLength < line.length && line[prefixLength] === ' ' ? 1 :
        line.slice(prefixLength).match(/^\s+/)?.[0]?.length || 0;
    const valueStartInLine = prefixLength + wsLength;
    return {
        valueRange: [lineStart + valueStartInLine, lineStart + valueStartInLine + valueLength],
        attrsRange: calcAttrsRange(line, attrs, lineStart)
    };
}
```

#### 3. List Processing
```javascript
// Shared indentation and marker detection
export function getIndentLevel(block, sourceText) {
    // Used by both parser and renderer for list processing
    const text = sourceText.substring(block.range.start, block.range.end);
    const indentMatch = text.match(/^(\s*)/);
    const indentSpaces = indentMatch ? indentMatch[1].length : 0;
    return Math.floor(indentSpaces / 2);
}

export function getListMarker(block, sourceText) {
    // Used by both parser and renderer for advanced list features
    const text = sourceText.substring(block.range.start, block.range.end);
    const markerMatch = text.match(/^(\s*)([-*+]|\d+\[\.|\])\s+/);
    
    return {
        type: markerMatch[2].startsWith('-') ? 'dash' : /* ... */,
        marker: markerMatch[2],
        indent: markerMatch[1].length
    };
}
```

#### 4. Subject Resolution
```javascript
// Shared subject chaining logic
export function resolveSubjectType(subjectDecl) {
    if (!subjectDecl) return 'none';
    if (subjectDecl.startsWith('=#')) return 'fragment';
    if (subjectDecl.startsWith('+')) return 'soft-object';
    if (subjectDecl === 'RESET') return 'reset';
    return 'full-iri';
}

export function resolveFragment(fragment, currentSubject) {
    // Shared fragment resolution for both parser and renderer
    if (!currentSubject) {
        throw new Error('Fragment requires current subject');
    }
    const fragmentName = fragment.substring(2);
    const baseIRI = currentSubject.value;
    const hashIndex = baseIRI.indexOf('#');
    const base = hashIndex > -1 ? baseIRI.slice(0, hashIndex) : baseIRI;
    return base + '#' + fragmentName;
}
```

---

## 2. Implementation Phases (REVISED WITH SHARED MODULES)

### Phase 1: Core Infrastructure with Subject Chaining (Priority: Critical)

#### 1.1 Main Render Function
**File:** `src/render.js`
**Dependencies:** `parse.js`, `utils.js`
**Goal:** Basic render pipeline with proper subject chaining

```javascript
export function render(mdld, options = {}) {
    // Phase 1: Parse MD-LD (reuse parser)
    const parsed = parse(mdld, { context: options.context || {} });
    
    // Phase 2: Build render state with subject tracking
    const state = buildRenderState(parsed, options, mdld);
    
    // Phase 3: Render blocks to HTML with subject chaining
    const html = renderBlocksWithSubjectChaining(parsed.origin.blocks, state);
    
    // Phase 4: Wrap with RDFa context
    const wrapped = wrapWithRDFaContext(html, state.ctx);
    
    return {
        html: wrapped,
        context: state.ctx,
        metadata: buildMetadata(parsed, state),
        origin: parsed.origin,
        statements: parsed.statements
    };
}
```

#### 1.2 Subject-Aware State Management
**File:** `src/render/utils.js`
**Goal:** Proper subject persistence and resolution

---

## CRITICAL: Subject Chaining Compliance Issue

### Problem Identified
After careful review of MD-LD Spec, our current implementation plan has a **critical gap** in subject chaining behavior:

**MD-LD Spec Rule (Section 3, "S - The Current Subject"):**
> "Set by `{=IRI}` or `{=#fragment}` - **Stays current until you change it or reset with `{=}`"

**Current Implementation Gap:**
Our plan uses `state.currentSubject` but doesn't properly handle:
1. **Subject persistence** across multiple blocks
2. **Fragment resolution** relative to current subject base  
3. **Soft object vs explicit subject** priority rules
4. **Subject reset** behavior with `{=}`

### Required Fix: Subject State Management

#### 1.1 Subject Resolution Algorithm
```javascript
function resolveSubjectForBlock(block, state) {
    // MD-LD Spec: Subject persists until explicitly changed
    
    // Priority 1: Explicit subject in this block
    if (block.subject && block.subject !== 'RESET') {
        return resolveSubject(block.subject, state);
    }
    
    // Priority 2: Current subject (persists from previous blocks)
    if (state.currentSubject) {
        return state.currentSubject;
    }
    
    // Priority 3: No subject available (no RDF generated)
    return null;
}
```

#### 1.2 Subject State Updates
```javascript
function updateSubjectState(block, state) {
    if (block.subject) {
        if (block.subject === 'RESET') {
            // Explicit reset: clear current subject
            state.currentSubject = null;
        } else {
            // Explicit subject: becomes new current subject
            state.currentSubject = resolveSubject(block.subject, state);
        }
    }
    // If no subject in block, currentSubject persists unchanged
}
```

#### 1.3 Fragment Resolution Rules
```javascript
function resolveSubject(subjectDecl, state) {
    if (!subjectDecl) return null;
    
    if (subjectDecl.startsWith('=#')) {
        // Fragment: requires current subject base
        if (!state.currentSubject) {
            throw new Error('Fragment requires current subject');
        }
        const fragment = subjectDecl.substring(2);
        const baseIRI = state.currentSubject.value;
        const hashIndex = baseIRI.indexOf('#');
        const base = hashIndex > -1 ? baseIRI.slice(0, hashIndex) : baseIRI;
        return state.df.namedNode(base + '#' + fragment);
    }
    
    if (subjectDecl.startsWith('+')) {
        // Soft object: temporary, doesn't change current subject
        return resolveSubject(subjectDecl.substring(1), state);
    }
    
    // Full IRI
    return state.df.namedNode(expandIRI(subjectDecl, state.ctx));
}
```

### Updated RDFa Generation Rules

#### 2.1 Correct Subject Resolution for RDFa
```javascript
export function buildRDFaAttrsFromBlock(block, state) {
    const attrs = [];
    
    // Use proper subject resolution
    const subject = resolveSubjectForBlock(block, state);
    if (!subject) return ''; // No RDFa without subject
    
    const expandedSubject = subject.value;
    const shortenedSubject = shortenIRI(expandedSubject, state.ctx);
    attrs.push(`about="${escapeHtml(shortenedSubject)}"`);
    
    // Types apply to the resolved subject
    if (block.types?.length > 0) {
        const types = block.types.map(t => 
            shortenIRI(expandIRI(typeof t === 'string' ? t : t.iri, state.ctx), state.ctx)
        ).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }
    
    // Predicates use resolved subject
    if (block.predicates?.length > 0) {
        const { literalProps, objectProps, reverseProps } = categorizePredicates(block.predicates);
        
        // Literal predicates: subject → literal
        if (literalProps.length > 0) {
            attrs.push(`property="${escapeHtml(literalProps.join(' '))}"`);
        }
        
        // Object predicates: subject → object  
        if (objectProps.length > 0) {
            attrs.push(`rel="${escapeHtml(objectProps.join(' '))}"`);
        }
        
        // Reverse predicates: object → subject
        if (reverseProps.length > 0) {
            attrs.push(`rev="${escapeHtml(reverseProps.join(' '))}"`);
        }
    }
    
    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}
```

#### 2.2 Link Carrier Subject Priority (CRITICAL)
```javascript
export function resolveLinkCarrierSubject(carrier, block, state) {
    // MD-LD Spec Section 4: URL vs IRI Priority Rules
    
    const explicitSubject = block.subject ? resolveSubject(block.subject, state) : null;
    const currentSubject = state.currentSubject;
    const urlSubject = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;
    
    // Case 1: Explicit subject present
    if (explicitSubject) {
        return {
            subject: explicitSubject,           // RDFa about attribute
            urlSubject: urlSubject,           // URL becomes object resource
            literalSubject: currentSubject       // For literal predicates
        };
    }
    
    // Case 2: No explicit subject, URL present
    if (urlSubject) {
        return {
            subject: urlSubject,              // URL becomes subject
            urlSubject: null,               // No separate URL subject
            literalSubject: currentSubject      // Current subject for literals
        };
    }
    
    // Case 3: No explicit subject, no URL
    return {
        subject: currentSubject,           // Current subject persists
        urlSubject: null,
        literalSubject: currentSubject
    };
}
```

---

## 2. Implementation Phases (REVISED)

### Phase 1: Core Infrastructure with Subject Chaining (Priority: Critical)

#### 1.1 Main Render Function
**File:** `src/render.js`
**Dependencies:** `parse.js`, `shared.js`, `utils.js`
**Goal:** Basic render pipeline with proper subject chaining

```javascript
import { parse } from './parse.js';
import { 
    escapeHtml, 
    getIndentLevel, 
    getListMarker,
    calcRangeInfo,
    resolveFragment,
    resolveSubjectType
} from './shared.js';
import { buildRenderState } from './render/utils.js';
import { renderBlocksWithSubjectChaining } from './render/blocks.js';
import { wrapWithRDFaContext } from './render/rdfa.js';

export function render(mdld, options = {}) {
    // Phase 1: Parse MD-LD (reuse parser)
    const parsed = parse(mdld, { context: options.context || {} });
    
    // Phase 2: Build render state with subject tracking
    const state = buildRenderState(parsed, options, mdld);
    
    // Phase 3: Render blocks to HTML with subject chaining
    const html = renderBlocksWithSubjectChaining(parsed.origin.blocks, state);
    
    // Phase 4: Wrap with RDFa context
    const wrapped = wrapWithRDFaContext(html, state.ctx);
    
    return {
        html: wrapped,
        context: state.ctx,
        metadata: buildMetadata(parsed, state),
        origin: parsed.origin,
        statements: parsed.statements
    };
}
```

#### 1.2 Subject-Aware State Management
**File:** `src/render/utils.js`
**Dependencies:** `shared.js`
**Goal:** Proper subject persistence and resolution

```javascript
import { 
    resolveSubjectType,
    resolveFragment,
    quadIndexKey
} from '../shared.js';
import { expandIRI, shortenIRI } from '../utils.js';

export function buildRenderState(parsed, options, mdld) {
    return {
        ctx: parsed.context,
        df: options.dataFactory || DataFactory,
        baseIRI: options.baseIRI || '',
        sourceText: mdld,
        output: [],
        currentSubject: null,          // CRITICAL: Persists until changed
        documentSubject: null,
        blockStack: [],
        carrierStack: [],
        subjectHistory: []              // Track subject changes for debugging
    };
}

export function resolveSubjectForBlock(block, state) {
    // MD-LD Spec: Subject persists until explicitly changed
    
    // Priority 1: Explicit subject in this block
    if (block.subject && block.subject !== 'RESET') {
        return resolveSubject(block.subject, state);
    }
    
    // Priority 2: Current subject (persists from previous blocks)
    if (state.currentSubject) {
        return state.currentSubject;
    }
    
    // Priority 3: No subject available (no RDF generated)
    return null;
}

export function resolveSubject(subjectDecl, state) {
    const type = resolveSubjectType(subjectDecl);
    
    switch (type) {
        case 'fragment':
            return resolveFragment(subjectDecl, state.currentSubject);
            
        case 'soft-object':
            // Temporary, doesn't change current subject
            return state.df.namedNode(expandIRI(subjectDecl.substring(1), state.ctx));
            
        case 'reset':
            return null;
            
        case 'full-iri':
            return state.df.namedNode(expandIRI(subjectDecl, state.ctx));
            
        default:
            return null;
    }
}

export function updateSubjectState(block, state) {
    if (block.subject) {
        const resolved = resolveSubject(block.subject, state);
        state.currentSubject = resolved;
        
        // Track for debugging
        state.subjectHistory.push({
            blockRange: block.range,
            subject: resolved,
            type: resolveSubjectType(block.subject)
        });
    }
    // If no subject in block, currentSubject persists unchanged
}
```

#### 1.3 Subject-Chaining Block Renderer
**File:** `src/render/blocks.js`
**Dependencies:** `shared.js`, `utils.js`
**Goal:** Render blocks with proper subject persistence

```javascript
import { 
    escapeHtml,
    calcRangeInfo,
    extractContentFromRange
} from '../shared.js';
import { updateSubjectState, resolveSubjectForBlock } from './utils.js';
import { buildRDFaAttrsFromBlock } from './rdfa.js';

export function renderBlocksWithSubjectChaining(blocks, state) {
    let html = '';
    
    // Sort blocks by source position
    const sortedBlocks = Array.from(blocks.values()).sort((a, b) => 
        (a.range?.start || 0) - (b.range?.start || 0)
    );
    
    for (const block of sortedBlocks) {
        // Update subject state BEFORE rendering
        updateSubjectState(block, state);
        
        // Render with resolved subject
        const rendered = renderBlockWithSubject(block, state);
        html += rendered;
    }
    
    return html;
}

export function renderBlockWithSubject(block, state) {
    const attrs = buildRDFaAttrsFromBlock(block, state);
    
    switch (block.carrierType) {
        case 'heading': return renderHeading(block, state, attrs);
        case 'para': return renderParagraph(block, state, attrs);
        case 'list': return renderList(block, state, attrs);  // Lists handle their own subject chaining
        case 'blockquote': return renderBlockquote(block, state, attrs);
        case 'code': return renderCode(block, state, attrs);
        case 'standalone': return renderStandalone(block, state, attrs);
        default: return renderDefault(block, state, attrs);
    }
}

export function renderHeading(block, state, attrs) {
    const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
    const level = block.depth || 1;
    return `<h${level}${attrs}>${escapeHtml(content)}</h${level}>`;
}

export function renderParagraph(block, state, attrs) {
    const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
    return `<p${attrs}>${escapeHtml(content)}</p>`;
}

export function renderBlockquote(block, state, attrs) {
    const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
    return `<blockquote${attrs}>${escapeHtml(content)}</blockquote>`;
}

export function renderCode(block, state, attrs) {
    const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
    const lang = block.lang || '';
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${langClass}${attrs}>${escapeHtml(content)}</code></pre>`;
}

export function renderStandalone(block, state, attrs) {
    return `<div${attrs}></div>`;
}

export function renderDefault(block, state, attrs) {
    const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
    return `<div${attrs}>${escapeHtml(content)}</div>`;
}
```

### Phase 2: RDFa with Subject Chaining (Priority: Critical)

#### 2.4 Correct RDFa Attribute Generation
**File:** `src/render/rdfa.js`
**Dependencies:** `shared.js`, `utils.js`
**Goal:** RDFa attributes that respect subject chaining

```javascript
import { 
    expandAndShortenIRI,
    quadIndexKey,
    escapeHtml
} from '../shared.js';
import { expandIRI, shortenIRI } from '../utils.js';

export function buildRDFaAttrsFromBlock(block, state) {
    const attrs = [];
    
    // CRITICAL: Use proper subject resolution
    const subject = resolveSubjectForBlock(block, state);
    if (!subject) return '';
    
    // Subject (about)
    const expandedSubject = subject.value;
    const shortenedSubject = shortenIRI(expandedSubject, state.ctx);
    attrs.push(`about="${escapeHtml(shortenedSubject)}"`);
    
    // Types (typeof) - apply to resolved subject
    if (block.types?.length > 0) {
        const types = block.types.map(t => 
            expandAndShortenIRI(typeof t === 'string' ? t : t.iri, state.ctx)
        ).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }
    
    // Predicates with subject chaining
    if (block.predicates?.length > 0) {
        const predicateAttrs = buildPredicateAttributes(block.predicates, subject, state);
        attrs.push(...predicateAttrs);
    }
    
    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

function buildPredicateAttributes(predicates, subject, state) {
    const literalProps = [];
    const objectProps = [];
    const reverseProps = [];
    
    predicates.forEach(pred => {
        const expandedPred = expandIRI(pred.iri, state.ctx);
        const shortenedPred = shortenIRI(expandedPred, state.ctx);
        
        switch (pred.form) {
            case '':
                // Subject → Literal
                literalProps.push(shortenedPred);
                break;
            case '?':
                // Subject → Object
                objectProps.push(shortenedPred);
                break;
            case '!':
                // Object → Subject
                reverseProps.push(shortenedPred);
                break;
        }
    });
    
    const attrs = [];
    if (literalProps.length > 0) attrs.push(`property="${escapeHtml(literalProps.join(' '))}"`);
    if (objectProps.length > 0) attrs.push(`rel="${escapeHtml(objectProps.join(' '))}"`);
    if (reverseProps.length > 0) attrs.push(`rev="${escapeHtml(reverseProps.join(' '))}"`);
    
    return attrs;
}

export function wrapWithRDFaContext(html, ctx) {
    const prefixDecl = generatePrefixDeclarations(ctx);
    const vocabDecl = generateVocabDeclaration(ctx);
    
    return `<div${prefixDecl}${vocabDecl}>${html}</div>`;
}

export function generatePrefixDeclarations(ctx) {
    const prefixes = [];
    for (const [prefix, iri] of Object.entries(ctx)) {
        if (prefix !== '@vocab') {
            prefixes.push(`${prefix}: ${iri}`);
        }
    }
    return prefixes.length > 0 ? ` prefix="${prefixes.join(' ')}"` : '';
}

export function generateVocabDeclaration(ctx) {
    return ctx['@vocab'] ? ` vocab="${ctx['@vocab']}"` : '';
}
```

### Phase 4: Advanced List Processing (Priority: Medium)

#### 2.6 List Subject Chaining with Shared Patterns
**File:** `src/render/lists.js`
**Dependencies:** `shared.js`, `utils.js`
**Goal:** Lists maintain subject chaining correctly

```javascript
import { 
    escapeHtml,
    getIndentLevel,
    getListMarker,
    extractContentFromRange
} from '../shared.js';
import { updateSubjectState, resolveSubjectForBlock } from './utils.js';
import { buildRDFaAttrsFromBlock } from './rdfa.js';

export function renderAdvancedListsWithRDFa(listBlocks, state) {
    // Step 1: Group by marker type using shared function
    const markerGroups = groupByMarkerType(listBlocks, state.sourceText);
    
    let html = '';
    
    for (const group of markerGroups) {
        // Step 2: Detect tight vs loose
        const isTight = detectListTightness(group.blocks, state.sourceText);
        
        // Step 3: Detect and handle continuations
        const hasContinuations = detectLazyContinuation(group.blocks, state.sourceText).length > 0;
        
        // Step 4: Render with appropriate strategy
        if (hasContinuations) {
            html += renderListWithContinuations(group.blocks, state);
        } else {
            html += processListItemsStreaming(group.blocks, state, isTight);
        }
    }
    
    return html;
}

export function groupByMarkerType(listBlocks, sourceText) {
    const groups = [];
    let currentGroup = null;
    let lastMarker = null;
    
    for (const block of listBlocks) {
        const marker = getListMarker(block, sourceText);
        
        if (!marker || shouldStartNewList(marker, lastMarker)) {
            if (currentGroup) groups.push(currentGroup);
            currentGroup = { 
                blocks: [block], 
                markerType: marker?.type || 'unknown',
                marker: marker?.marker
            };
        } else {
            currentGroup.blocks.push(block);
        }
        
        lastMarker = marker;
    }
    
    if (currentGroup) groups.push(currentGroup);
    return groups;
}

function shouldStartNewList(currentMarker, previousMarker) {
    if (!previousMarker || !currentMarker) return false;
    
    // Different marker types = new list
    if (currentMarker.type !== previousMarker.type) return true;
    
    // Ordered markers with different delimiters = new list
    if (currentMarker.type === 'ordered' && previousMarker.type === 'ordered' && 
        currentMarker.marker !== previousMarker.marker) return true;
    
    return false;
}

export function processListItemsStreaming(listBlocks, state, isTight) {
    let html = '';
    let currentLevel = 0;
    let openTags = []; // Track open <ul> and <li> tags
    
    for (const block of listBlocks) {
        // Update subject state for list item
        updateSubjectState(block, state);
        
        const indent = getIndentLevel(block, state.sourceText);
        const targetLevel = Math.floor(indent / 2);
        
        // Handle nesting (same as before)
        while (currentLevel > targetLevel) {
            const tag = openTags.pop();
            html += `</${tag}>`;
            currentLevel--;
        }
        
        while (currentLevel < targetLevel) {
            html += '<ul>';
            openTags.push('ul');
            currentLevel++;
        }
        
        if (openTags[openTags.length - 1] === 'li') {
            html += '</li>';
            openTags.pop();
        }
        
        // Render list item with proper subject
        const attrs = buildRDFaAttrsFromBlock(block, state);
        const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
        const itemHtml = isTight ? 
            escapeHtml(content) : 
            `<p>${escapeHtml(content)}</p>`;
        
        html += `<li${attrs}>${itemHtml}`;
        openTags.push('li');
    }
    
    // Close all remaining tags
    while (openTags.length > 0) {
        const tag = openTags.pop();
        html += `</${tag}>`;
    }
    
    return html;
}

export function renderListWithContinuations(listBlocks, state) {
    // Lists follow same subject chaining rules as other blocks
    let html = '';
    let currentLevel = 0;
    let openTags = [];
    
    for (const block of listBlocks) {
        // Update subject state for list item
        updateSubjectState(block, state);
        
        const indent = getIndentLevel(block, state.sourceText);
        const targetLevel = Math.floor(indent / 2);
        
        // Handle nesting (same as before)
        while (currentLevel > targetLevel) {
            const tag = openTags.pop();
            html += `</${tag}>`;
            currentLevel--;
        }
        
        while (currentLevel < targetLevel) {
            html += '<ul>';
            openTags.push('ul');
            currentLevel++;
        }
        
        if (openTags[openTags.length - 1] === 'li') {
            html += '</li>';
            openTags.pop();
        }
        
        // Render list item with proper subject
        const attrs = buildRDFaAttrsFromBlock(block, state);
        const content = extractContentFromRange(state.sourceText, block.range, block.attrsRange);
        html += `<li${attrs}>${escapeHtml(content)}`;
        openTags.push('li');
    }
    
    // Close remaining tags
    while (openTags.length > 0) {
        const tag = openTags.pop();
        html += `</${tag}>`;
    }
    
    return html;
}
```

---

## 3. Testing Strategy (REVISED)

### 3.1 Subject Chaining Tests (CRITICAL)

```javascript
describe('MD-LD Render Subject Chaining', () => {
    test('subject persists across blocks', () => {
        const mdld = `
# Document {=ex:doc}
[Title] {name}
[Description] {description}
        `;
        const result = render(mdld);
        
        // All predicates should use ex:doc as subject
        expect(result.html).toMatch(/about="ex:doc".*?name/);
        expect(result.html).toMatch(/about="ex:doc".*?description/);
    });
    
    test('subject changes with explicit declaration', () => {
        const mdld = `
# First {=ex:first}
[Name] {name}
# Second {=ex:second}  
[Name] {name}
        `;
        const result = render(mdld);
        
        // First name uses ex:first, second uses ex:second
        expect(result.html).toMatch(/about="ex:first".*?name/);
        expect(result.html).toMatch(/about="ex:second".*?name/);
    });
    
    test('fragment resolution with current subject', () => {
        const mdld = `
# Document {=ex:doc}
## Section {=#section1}
[Content] {text}
        `;
        const result = render(mdld);
        
        // Fragment should resolve to ex:doc#section1
        expect(result.html).toMatch(/about="ex:doc#section1"/);
    });
    
    test('link carrier subject priority', () => {
        const mdld = `
# Doc {=ex:doc}
[Link Text](https://example.com) {label}
        `;
        const result = render(mdld);
        
        // With explicit subject, URL should be object, not subject
        expect(result.html).toMatch(/about="ex:doc".*?label/);
        expect(result.html).toMatch(/href="https:\/\/example\.com"/);
    });
    
    test('link carrier without explicit subject', () => {
        const mdld = `
[Link Text](https://example.com) {label}
        `;
        const result = render(mdld);
        
        // URL becomes subject when no explicit subject
        expect(result.html).toMatch(/about="https:\/\/example\.com".*?label/);
    });
    
    test('subject reset with {=}', () => {
        const mdld = `
# First {=ex:first}
[Name] {name}
{=}
[Name] {name}  // Should have no subject
        `;
        const result = render(mdld);
        
        // Second name should have no about attribute
        expect(result.html).not.toMatch(/about="[^"]*".*?name/);
    });
});
```

### 3.2 Round-Trip Semantic Tests

```javascript
test('round-trip semantic preservation', () => {
    const mdld = `
[ex] <http://example.org/>
# Document {=ex:doc .ex:Document label}
[Description] {ex:description}
[Related] {+ex:related ?ex:references}
    `;
    
    const parsed = parse(mdld);
    const rendered = render(mdld);
    
    // Verify all quads represented in RDFa
    expect(parsed.quads).toHaveLength(4); // type, label, description, references
    
    // Check RDFa attributes
    expect(rendered.html).toContain('about="ex:doc"');
    expect(rendered.html).toContain('typeof="ex:Document"');
    expect(rendered.html).toContain('property="rdfs:label"');
    expect(rendered.html).toContain('property="ex:description"');
    expect(rendered.html).toContain('rel="ex:references"');
});
```

---

## 4. Success Criteria (UPDATED)

### 4.1 Critical Requirements
- ✅ **Subject chaining** - Follows MD-LD Spec persistence rules exactly
- ✅ **Fragment resolution** - Proper relative to current subject base
- ✅ **Link priority** - URL vs explicit subject rules implemented
- ✅ **Subject reset** - `{=}` properly clears current subject

### 4.2 Quality Requirements  
- ✅ **Semantic fidelity** - All RDF triples represented correctly in HTML+RDFa
- ✅ **Spec compliance** - No violations of subject chaining rules
- ✅ **Streaming compatibility** - Maintains O(n) with proper state management

---

## 5. Implementation Priority

### IMMEDIATE (Phase 1): Fix Subject Chaining
1. ✅ **Implement subject resolution algorithm** per MD-LD Spec
2. ✅ **Update RDFa generation** to use proper subject resolution
3. ✅ **Fix link carrier priority** handling
4. ✅ **Add comprehensive subject chaining tests**

### THEN: Continue with original phases
5. ✅ **Carrier processing** with corrected subject handling
6. ✅ **Advanced list processing** with subject chaining
7. ✅ **Interactive features** and performance optimization

This revised plan ensures our renderer will be **100% compliant with MD-LD Spec subject chaining rules**, which is critical for semantic correctness.
