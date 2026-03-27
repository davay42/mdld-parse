# MD-LD Render Specification

**HTML+RDFa Rendering for MD-LD Documents**

A deterministic, streaming-friendly renderer that transforms valid MD-LD text into semantically meaningful HTML+RDFa markup ready for browser rendering while maintaining complete provenance and supporting interactive agent experiences.

---

## 1. Design Philosophy

### Core Principles

The MD-LD Render follows the same engineering principles as the parser:

- **Streaming-first** — Single-pass rendering, O(n) complexity
- **Zero dependencies** — Pure JavaScript implementation
- **Semantic fidelity** — Preserves all RDF semantics in HTML+RDFa
- **Agent empowerment** — Enables interactive knowledge graph authoring
- **Provenance preservation** — Maintains complete source tracking
- **Round-trip safety** — HTML ↔ MD-LD ↔ RDF transformation chain

### Architecture Alignment

The render mirrors the parser's architecture:

1. **Parser Output** → Render State (single-pass transformation)
2. **Token Processing** → Block Rendering (deterministic mapping)
3. **Semantic Blocks** → RDFa Attributes (semantic preservation)
4. **Origin Tracking** → Interactive Features (agent enablement)

---

## 2. Rendering Pipeline

### Phase 1: Parse Integration

```javascript
// Reuse parser output for consistency
const parsed = parse(mdld, { context: options.context || {} });
```

**Input:** Valid MD-LD text  
**Output:** Parser result with quads, origin, context, statements

**Key Integration Points:**
- Use parser's resolved context for IRI expansion
- Leverage origin tracking for interactive features
- Preserve quad structure for semantic validation
- Maintain statement extraction for elevated patterns

### Phase 2: Render State Construction

```javascript
const state = {
    ctx: parsed.context,           // Resolved prefix context
    df: DataFactory,               // RDF/JS DataFactory
    baseIRI: options.baseIRI,      // Base IRI for resolution
    sourceText: mdld,             // Original text for extraction
    output: [],                    // Accumulated HTML output
    currentSubject: null,          // Subject context tracking
    documentSubject: null,         // Document-level subject
    blockStack: [],                // Nested block context
    carrierStack: []               // Inline carrier context
};
```

**State Characteristics:**
- **Minimal footprint** — Only essential rendering state
- **Context preservation** — Parser context fully available
- **Streaming compatible** — Can process incrementally
- **Interactive ready** — State supports agent interactions

### Phase 3: Block Processing Pipeline

```javascript
// Sort blocks by source position (deterministic)
const sortedBlocks = Array.from(parsed.origin.blocks.values())
    .sort((a, b) => a.range.start - b.range.start);

// Process blocks by type
sortedBlocks.forEach(block => renderBlock(block, state));
```

**Processing Strategy:**
- **Positional ordering** — Maintains document structure
- **Type-specific rendering** — Optimized for each carrier type
- **Context propagation** — Maintains semantic relationships
- **RDFa enrichment** — Adds semantic markup to HTML

### Phase 4: RDFa Context Wrapping

```javascript
const wrapped = wrapWithRDFaContext(html, state.ctx);
```

**Final Output Structure:**
```html
<div prefix="schema: http://schema.org/ ex: http://example.org/" 
     vocab="http://www.w3.org/2000/01/rdf-schema#">
    <!-- Rendered content with RDFa attributes -->
</div>
```

---

## 3. Block Rendering System

### 3.1 Carrier Types and Rendering Strategy

#### Block-Level Carriers

| Carrier Type | Markdown Syntax | HTML Element | RDFa Strategy | Example |
|--------------|----------------|--------------|---------------|---------|
| **heading** | `# Heading {...}` | `<h1>`-`<h6>` | `about`, `typeof`, `property` | `# Title {=ex:title .schema:Thing label}` |
| **paragraph** | `Text {...}` | `<p>` | `about`, `property`, `rel` | `Content {ex:description}` |
| **list** | `- Item {...}` | `<ul>`/`<li>` | Hierarchical RDFa | `- Item {=ex:item .schema:ListItem name}` |
| **blockquote** | `> Quote {...}` | `<blockquote>` | `about`, `property` | `> "Quote" {ex:quote}` |
| **code** | ````code {...}```` | `<pre><code>` | `about`, `typeof` | ````js {=ex:code .ex:SoftwareSourceCode}```` |
| **standalone** | `{=subject}` | `<div>` | `about`, `typeof` | `{=ex:subject .ex:Type}` |

#### Inline Carriers

| Carrier Type | Markdown Syntax | HTML Element | RDFa Strategy | Subject Resolution | Example |
|--------------|----------------|--------------|---------------|------------------|---------|
| **emphasis** | `*text* {...}` | `<em>` | `property`, `rel` | Current subject | `*important* {ex:emphasis}` |
| **strong** | `**text** {...}` | `<strong>` | `property`, `rel` | Current subject | `**warning** {ex:alert}` |
| **code span** | `` `code` {...} `` | `<code>` | `property`, `rel` | Current subject | `` `console.log()` {ex:code}`` |
| **link** | `[text](url) {...}` | `<a href="url">` | `about`, `property`, `rel` | URL becomes subject | `[NASA](https://nasa.gov) {.schema:Organization label}` |
| **image** | `![alt](url) {...}` | `<img src="url" alt="alt">` | `about`, `property`, `rel` | URL becomes subject | `![Logo](logo.png) {ex:logo}` |
| **angle link** | `<url> {...}` | `<a href="url">` | `about`, `property`, `rel` | URL becomes subject | `<https://example.com> {ex:reference}` |

#### Link Carrier Special Handling

**Markdown Link Syntax `[text](url)`:**

1. **Subject Resolution Priority:**
   - Explicit subject (`{=iri}`) > URL > Current subject
   - When explicit subject present: URL becomes object resource
   - When no explicit subject: URL becomes subject

2. **RDFa Attribute Generation:**
   ```javascript
   // Case 1: Explicit subject with URL
   [Link](https://example.com) {=ex:subject .Type label}
   // Output: <a href="https://example.com" about="ex:subject" typeof="ex:Type" property="rdfs:label">Link</a>
   
   // Case 2: URL as subject (no explicit subject)
   [Link](https://example.com) {.Type label}
   // Output: <a href="https://example.com" about="https://example.com" typeof="ex:Type" property="rdfs:label">Link</a>
   
   // Case 3: Object property with explicit subject
   [Link](https://example.com) {=ex:subject ?references}
   // Output: <a href="https://example.com" about="ex:subject" rel="ex:references">Link</a>
   ```

3. **Content Extraction:**
   - Link text becomes literal value for `property` predicates
   - URL becomes `href` attribute and potential `about` subject
   - Alt text used for image carriers

4. **RDFa Attribute Mapping:**
   | MD-LD Construct | Subject | RDFa Output |
   |-----------------|---------|-------------|
   | `[text](url) {property}` | Current subject | `property="ex:property"` on `<a>` |
   | `[text](url) {?object}` | Current subject | `rel="ex:object"` on `<a>` |
   | `[text](url) {=subject}` | URL | `about="url"` on `<a>` |
   | `[text](url) {=subject .Type}` | URL | `about="url" typeof="ex:Type"` on `<a>` |

### 3.2 RDFa Attribute Generation

#### Subject Resolution

```javascript
function buildRDFaAttrsFromBlock(block, ctx) {
    const attrs = [];
    
    // Subject (about)
    if (block.subject && isValidSubject(block.subject)) {
        const expanded = expandIRI(block.subject, ctx);
        const shortened = shortenIRI(expanded, ctx);
        attrs.push(`about="${escapeHtml(shortened)}"`);
    }
    
    // Types (typeof)
    if (block.types?.length > 0) {
        const types = block.types.map(t => 
            shortenIRI(expandIRI(typeof t === 'string' ? t : t.iri, ctx), ctx)
        ).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }
    
    // Predicates (property/rel/rev)
    if (block.predicates?.length > 0) {
        const { literalProps, objectProps, reverseProps } = categorizePredicates(block.predicates);
        
        if (literalProps.length > 0) attrs.push(`property="${literalProps.join(' ')}"`);
        if (objectProps.length > 0) attrs.push(`rel="${objectProps.join(' ')}"`);
        if (reverseProps.length > 0) attrs.push(`rev="${reverseProps.join(' ')}"`);
    }
    
    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}
```

#### Predicate Categorization

| Predicate Form | RDFa Attribute | Direction | Example |
|----------------|----------------|-----------|---------|
| `p` (literal) | `property` | Subject → Literal | `property="rdfs:label"` |
| `?p` (object) | `rel` | Subject → Object | `rel="schema:knows"` |
| `!p` (reverse) | `rev` | Object → Subject | `rev="schema:member"` |

### 3.3 Content Extraction Strategy

#### Source Text Preservation

```javascript
function renderBlockContent(block, state) {
    if (block.range && state.sourceText) {
        let text = state.sourceText.substring(block.range.start, block.range.end);
        
        // Remove MD-LD annotations, preserve content
        if (block.attrsRange) {
            const beforeAttrs = text.substring(0, block.attrsRange.start - block.range.start);
            const afterAttrs = text.substring(block.attrsRange.end - block.range.start);
            text = beforeAttrs + afterAttrs;
        }
        
        // Type-specific content cleaning
        text = cleanContentByType(text, block.carrierType);
        
        state.output.push(escapeHtml(text.trim()));
    }
}
```

#### Content Cleaning Rules

| Carrier Type | Cleaning Strategy | Input → Output |
|--------------|------------------|----------------|
| **heading** | Remove leading `#` markers and trim | `# Title {props}` → `Title` |
| **paragraph** | Remove annotations only, preserve text | `Text {prop}` → `Text` |
| **list** | Remove list markers (`-`, `*`, `+`, `1.`) | `- Item {prop}` → `Item` |
| **blockquote** | Remove leading `>` marker | `> Quote {prop}` → `Quote` |
| **code** | Preserve code content exactly | ```code {prop}```` → `code` |
| **emphasis** | Remove emphasis markers | `*text* {prop}` → `text` |
| **strong** | Remove strong markers | `**text** {prop}` → `text` |
| **code span** | Remove backticks | `` `code` {prop}` `` → `code` |
| **link** | Preserve link text, remove URL from content | `[Text](url) {prop}` → `Text` |
| **image** | Use alt text, remove URL from content | `![Alt](url) {prop}` → `Alt` |
| **angle link** | Use URL as both href and content | `<url> {prop}` → `url` |

#### Comprehensive Carrier Reference

**Block-Level Carriers (structural elements):**

1. **Headings** - `#` through `######` prefix
   - Syntax: `# Heading Text {=ex:subject .Type property}`
   - HTML: `<h1>` to `<h6>`
   - Content: Text after `#` markers

2. **Paragraphs** - Text blocks with annotations
   - Syntax: `Paragraph content {ex:property}`
   - HTML: `<p>`
   - Content: Full text minus annotations

3. **List Items** - Markdown list markers
   - Syntax: `- Item {=ex:item .Type name}`
   - HTML: `<ul><li>`
   - Content: Text after list marker

4. **Blockquotes** - Lines starting with `>`
   - Syntax: `> Quote text {ex:quote}`
   - HTML: `<blockquote>`
   - Content: Text after `>` marker

5. **Code Blocks** - Fenced code blocks
   - Syntax: ````language {=ex:code .Type}```` 
   - HTML: `<pre><code class="language-X">`
   - Content: Entire code block content

6. **Standalone Subjects** - Subject declarations
   - Syntax: `{=ex:subject .Type}` (on separate line)
   - HTML: `<div>`
   - Content: Empty (subject declaration only)

**Inline Carriers (within blocks):**

1. **Emphasis** - `*text*` or `_text_`
   - Syntax: `*emphasized* {ex:property}`
   - HTML: `<em>`
   - Content: Text within emphasis markers

2. **Strong** - `**text**` or `__text__`
   - Syntax: `**strong** {ex:property}`
   - HTML: `<strong>`
   - Content: Text within strong markers

3. **Code Spans** - Backtick-enclosed code
   - Syntax: `` `code` {ex:property} ``
   - HTML: `<code>`
   - Content: Text within backticks

4. **Links** - `[text](url)` syntax
   - Syntax: `[Link Text](https://example.com) {ex:property}`
   - HTML: `<a href="https://example.com">`
   - Content: Link text (between brackets)
   - Subject Resolution: URL becomes subject unless explicit subject provided

5. **Images** - `![alt](url)` syntax
   - Syntax: `![Alt Text](image.png) {ex:property}`
   - HTML: `<img src="image.png" alt="Alt Text">`
   - Content: Alt text (after `!`)
   - Subject Resolution: Image URL becomes subject unless explicit subject

6. **Angle Links** - `<url>` syntax
   - Syntax: `<https://example.com> {ex:property}`
   - HTML: `<a href="https://example.com">`
   - Content: URL itself
   - Subject Resolution: URL becomes subject

**Carrier Detection Priority:**

1. **Block carriers** are detected first during tokenization
2. **Inline carriers** are extracted within block content
3. **Links and images** have special subject resolution rules
4. **Annotations** attach to the nearest valid carrier
5. **Invalid carriers** generate no RDF output (graceful failure)

---

## 4. List Rendering System

### 4.1 The Nested List Challenge

**The Core Problem:**
CommonMark nested lists require hierarchical HTML structure (`<ul><li><ul><li>...`) but streaming single-pass processing makes this challenging because:

1. **Forward Context Needed** - To know when to close `<ul>` tags, we need to see future lines
2. **Indentation Tracking** - Must maintain stack of nesting levels across the entire document
3. **RDFa Preservation** - Each list item needs its semantic attributes preserved

**Streaming-Compatible Solution:**

We can preserve visual nesting while maintaining single-pass rendering through **level tracking with deferred closing**:

### 4.2 Streaming List Processing Strategy

```javascript
function processListItemsStreaming(listBlocks, state) {
    let html = '';
    let currentLevel = 0;
    let openTags = []; // Track open <ul> and <li> tags
    
    // Process blocks in order (single pass)
    for (const block of listBlocks) {
        const indent = getIndentLevel(block, state.sourceText);
        const targetLevel = Math.floor(indent / 2); // 2 spaces per level
        
        // Close tags when going up the hierarchy
        while (currentLevel > targetLevel) {
            if (openTags.pop() === 'li') {
                html += '</li>';
            } else {
                html += '</ul>';
            }
            currentLevel--;
        }
        
        // Open tags when going down the hierarchy  
        while (currentLevel < targetLevel) {
            html += '<ul>';
            openTags.push('ul');
            currentLevel++;
        }
        
        // Close previous li if we're at same level
        if (openTags[openTags.length - 1] === 'li') {
            html += '</li>';
            openTags.pop();
        }
        
        // Render current list item
        const attrs = buildRDFaAttrsFromBlock(block, state.ctx);
        const content = extractListContent(block, state.sourceText);
        html += `<li${attrs}>${escapeHtml(content)}`;
        openTags.push('li');
    }
    
    // Close all remaining tags
    while (openTags.length > 0) {
        const tag = openTags.pop();
        html += `</${tag}>`;
    }
    
    return html;
}
```

### 4.3 Indentation-Based Level Detection

```javascript
function getIndentLevel(block, sourceText) {
    if (!block.range || !sourceText) return 0;
    
    const text = sourceText.substring(block.range.start, block.range.end);
    const indentMatch = text.match(/^(\s*)/);
    const indentSpaces = indentMatch ? indentMatch[1].length : 0;
    
    // CommonMark: 4 spaces or 1 tab = one level
    // We'll use 2 spaces for better readability (configurable)
    return Math.floor(indentSpaces / 2);
}
```

### 4.4 Content Extraction with Nesting Preservation

```javascript
function extractListContent(block, sourceText) {
    if (!block.range || !sourceText) return '';
    
    let text = sourceText.substring(block.range.start, block.range.end);
    
    // Remove list marker (-, *, +, or 1. 2. etc.)
    text = text.replace(/^(\s*[-*+]|\s*\d+\.)\s+/, '');
    
    // Remove MD-LD annotations
    if (block.attrsRange) {
        const beforeAttrs = text.substring(0, block.attrsRange.start - block.range.start);
        const afterAttrs = text.substring(block.attrsRange.end - block.range.start);
        text = beforeAttrs + afterAttrs;
    }
    
    return text.trim();
}
```

### 4.5 Complete List Rendering Pipeline

```javascript
function renderListsWithRDFa(listBlocks, state) {
    // Group consecutive list blocks (maintains document structure)
    const listGroups = groupConsecutiveListBlocks(listBlocks, state.sourceText);
    
    let html = '';
    
    for (const group of listGroups) {
        // Extract list anchor text (paragraph before list)
        const anchorText = extractListAnchorText(group.blocks[0], state.sourceText);
        if (anchorText) {
            html += `<p>${escapeHtml(anchorText)}</p>`;
        }
        
        // Process list items with streaming-compatible nesting
        html += processListItemsStreaming(group.blocks, state);
    }
    
    return html;
}

function groupConsecutiveListBlocks(listBlocks, sourceText) {
    const groups = [];
    let currentGroup = null;
    let lastPosition = -1;
    
    for (const block of listBlocks) {
        if (!block.range) continue;
        
        // Check if this is consecutive with previous block
        const isConsecutive = lastPosition >= 0 && 
            (block.range.start - lastPosition) <= (sourceText.substring(lastPosition, block.range.start).match(/\n/g) || []).length * 2 + 10;
        
        if (!isConsecutive || !currentGroup) {
            if (currentGroup) groups.push(currentGroup);
            currentGroup = { blocks: [block] };
        } else {
            currentGroup.blocks.push(block);
        }
        
        lastPosition = block.range.end;
    }
    
    if (currentGroup) groups.push(currentGroup);
    return groups;
}
```

### 4.6 Streaming Complexity Analysis

| Operation | Complexity | Streaming Compatible |
|-----------|-------------|-------------------|
| **Indentation Detection** | O(1) per block | ✅ Yes |
| **Level Tracking** | O(1) per block | ✅ Yes |
| **Tag Stack Management** | O(1) per block | ✅ Yes |
| **Content Extraction** | O(1) per block | ✅ Yes |
| **Deferred Closing** | O(1) per block | ✅ Yes |

**Key Insight:** We never need to look ahead - we maintain a stack of open tags and close them when indentation decreases, which is detectable in the current line.

### 4.7 Example: Nested List Processing

**Input MD-LD:**
```md
Items {=ex:items .ex:Collection}
- Top Level 1 {=ex:item1 .ex:Item name}
- Top Level 2 {=ex:item2 .ex:Item name}
  - Nested 1 {=ex:nested1 .ex:Item name ?hasPart}
  - Nested 2 {=ex:nested2 .ex:Item name ?hasPart}
    - Deep Nested {=ex:deep .ex:Item name ?hasPart}
- Top Level 3 {=ex:item3 .ex:Item name}
```

**Streaming Processing Steps:**
```javascript
// Block 1: "Top Level 1" (indent 0, level 0)
currentLevel = 0, targetLevel = 0
html += '<li about="ex:item1" typeof="ex:Item" property="rdfs:label">Top Level 1</li>'

// Block 2: "Top Level 2" (indent 0, level 0)  
currentLevel = 0, targetLevel = 0
html += '</li><li about="ex:item2" typeof="ex:Item" property="rdfs:label">Top Level 2</li>'

// Block 3: "Nested 1" (indent 2, level 1)
currentLevel = 0, targetLevel = 1
html += '<ul><li about="ex:nested1" typeof="ex:Item" property="rdfs:label" rel="ex:hasPart">Nested 1</li>'

// Block 4: "Nested 2" (indent 2, level 1)
currentLevel = 1, targetLevel = 1  
html += '</li><li about="ex:nested2" typeof="ex:Item" property="rdfs:label" rel="ex:hasPart">Nested 2</li>'

// Block 5: "Deep Nested" (indent 4, level 2)
currentLevel = 1, targetLevel = 2
html += '<ul><li about="ex:deep" typeof="ex:Item" property="rdfs:label" rel="ex:hasPart">Deep Nested</li>'

// Block 6: "Top Level 3" (indent 0, level 0)
currentLevel = 2, targetLevel = 0
html += '</li></ul></ul></li><li about="ex:item3" typeof="ex:Item" property="rdfs:label">Top Level 3</li>'
```

**Final HTML Output:**
```html
<p>Items</p>
<ul>
<li about="ex:item1" typeof="ex:Item" property="rdfs:label">Top Level 1</li>
<li about="ex:item2" typeof="ex:Item" property="rdfs:label">Top Level 2
<ul>
<li about="ex:nested1" typeof="ex:Item" property="rdfs:label" rel="ex:hasPart">Nested 1</li>
<li about="ex:nested2" typeof="ex:Item" property="rdfs:label" rel="ex:hasPart">Nested 2
<ul>
<li about="ex:deep" typeof="ex:Item" property="rdfs:label" rel="ex:hasPart">Deep Nested</li>
</ul>
</li>
</ul>
</li>
<li about="ex:item3" typeof="ex:Item" property="rdfs:label">Top Level 3</li>
</ul>
```

### 4.8 Advantages of This Approach

1. **True Single-Pass** - No look-ahead needed, stack-based closing
2. **Memory Efficient** - Only track current open tags, not entire document structure  
3. **Semantic Preservation** - All RDFa attributes maintained correctly
4. **CommonMark Compliant** - Proper nesting structure preserved
5. **Streaming Ready** - Can process large lists incrementally

### 4.9 Edge Cases Handled

- **Mixed Indentation** - Tabs and spaces handled uniformly
- **Inconsistent Nesting** - Graceful handling of malformed lists
- **Empty List Items** - Proper `<li></li>` generation
- **Deep Nesting** - No limit on nesting depth (stack-based)
- **Interspersed Non-List** - List groups properly separated

This approach achieves the perfect balance: preserving CommonMark's visual nesting while maintaining the streaming single-pass constraint that's core to MD-LD's architecture.

### 4.10 Advanced List Processing

To achieve full CommonMark compliance, the renderer must handle sophisticated list behaviors while maintaining streaming compatibility.

#### 4.10.1 Tight vs Loose Lists

**CommonMark Rules:**
- **Tight List**: No blank lines between list items → `<p>` tags omitted
- **Loose List**: Blank lines between list items → `<p>` tags included

**Streaming Detection Strategy:**
```javascript
function detectListTightness(listBlocks, sourceText) {
    let isTight = true;
    let lastEnd = -1;
    
    for (let i = 0; i < listBlocks.length; i++) {
        const block = listBlocks[i];
        if (!block.range) continue;
        
        if (lastEnd >= 0) {
            // Check for blank line between items
            const between = sourceText.substring(lastEnd, block.range.start);
            const blankLineCount = (between.match(/\n\s*\n/g) || []).length;
            
            if (blankLineCount > 0) {
                isTight = false;
                break; // Once loose, always loose
            }
        }
        
        lastEnd = block.range.end;
    }
    
    return isTight;
}
```

**Rendering Implementation:**
```javascript
function renderListItemContent(block, isTight, state) {
    const content = extractListContent(block, state.sourceText);
    const attrs = buildRDFaAttrsFromBlock(block, state.ctx);
    
    if (isTight) {
        // Tight: no paragraph wrapper
        return `<li${attrs}>${escapeHtml(content)}</li>`;
    } else {
        // Loose: wrap in paragraph
        return `<li${attrs}><p>${escapeHtml(content)}</p></li>`;
    }
}
```

#### 4.10.2 List Interruption

**CommonMark Rule:** Lists can interrupt paragraphs without blank lines when:
1. List item starts at the same indentation level as paragraph text
2. List item marker is followed by required whitespace

**Streaming Detection:**
```javascript
function detectListInterruption(block, precedingBlock, sourceText) {
    if (!precedingBlock || precedingBlock.type !== 'para') return false;
    
    // Check if list item immediately follows paragraph
    const between = sourceText.substring(precedingBlock.range.end, block.range.start);
    const hasBlankLine = between.match(/\n\s*\n/);
    
    if (hasBlankLine) return false; // Not an interruption
    
    // Check indentation alignment
    const paragraphIndent = getTextIndent(precedingBlock, sourceText);
    const listIndent = getIndentLevel(block, sourceText);
    
    return listIndent <= paragraphIndent + 4; // Within 4 spaces = interruption
}
```

**Rendering Strategy:**
```javascript
function renderInterruptedList(listBlocks, precedingBlock, state) {
    let html = '';
    
    // Handle paragraph continuation after list
    if (precedingBlock && precedingBlock.type === 'para') {
        // Render paragraph content up to interruption point
        const interruptionPoint = findInterruptionPoint(precedingBlock, listBlocks[0], state.sourceText);
        const beforeContent = state.sourceText.substring(precedingBlock.range.start, interruptionPoint);
        
        html += `<p>${escapeHtml(beforeContent)}</p>`;
        html += processListItemsStreaming(listBlocks, state);
        
        // Check for paragraph continuation after list
        const afterContent = extractParagraphAfterList(precedingBlock, listBlocks, state.sourceText);
        if (afterContent) {
            html += `<p>${escapeHtml(afterContent)}</p>`;
        }
    }
    
    return html;
}
```

#### 4.10.3 Mixed List Markers

**CommonMark Rules:**
- Changing bullet types (-, +, *) starts new list
- Changing ordered delimiters (1., 1.) starts new list
- Same marker type continues current list

**Streaming Detection:**
```javascript
function getListMarker(block, sourceText) {
    if (!block.range) return null;
    
    const text = sourceText.substring(block.range.start, block.range.end);
    const markerMatch = text.match(/^(\s*)([-*+]|\d+\[\.|\])\s+/);
    
    if (!markerMatch) return null;
    
    return {
        type: markerMatch[2].startsWith('-') ? 'dash' :
              markerMatch[2].startsWith('*') ? 'asterisk' :
              markerMatch[2].startsWith('+') ? 'plus' : 'ordered',
        marker: markerMatch[2],
        indent: markerMatch[1].length
    };
}

function shouldStartNewList(currentMarker, previousMarker) {
    if (!previousMarker) return false;
    
    // Different marker types = new list
    if (currentMarker.type !== previousMarker.type) return true;
    
    // Ordered markers with different delimiters = new list
    if (currentMarker.type === 'ordered' && 
        currentMarker.marker !== previousMarker.marker) return true;
    
    return false;
}
```

**Grouping Strategy:**
```javascript
function groupByMarkerType(listBlocks, sourceText) {
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
```

#### 4.10.4 Lazy Continuation

**CommonMark Rule:** List items can span multiple lines with:
- At least one space indentation for continuation
- Content aligned with first non-whitespace character of first line

**Streaming Detection:**
```javascript
function detectLazyContinuation(listBlocks, sourceText) {
    const continuationBlocks = [];
    
    for (let i = 0; i < listBlocks.length; i++) {
        const block = listBlocks[i];
        const nextBlock = listBlocks[i + 1];
        
        if (!nextBlock) break;
        
        // Check if next block is a continuation
        const currentIndent = getIndentLevel(block, sourceText);
        const nextIndent = getIndentLevel(nextBlock, sourceText);
        
        // Continuation: indented but not enough to be nested
        if (nextIndent > currentIndent && nextIndent <= currentIndent + 3) {
            continuationBlocks.push({
                parent: block,
                continuation: nextBlock,
                level: currentIndent
            });
        }
    }
    
    return continuationBlocks;
}
```

**Rendering Implementation:**
```javascript
function renderListWithContinuations(listBlocks, state) {
    const continuations = detectLazyContinuation(listBlocks, state.sourceText);
    const processedBlocks = new Set();
    
    let html = '';
    
    for (const block of listBlocks) {
        if (processedBlocks.has(block)) continue;
        
        // Find all continuations for this block
        const blockContinuations = continuations
            .filter(c => c.parent === block)
            .map(c => c.continuation);
        
        // Combine content from main block and continuations
        let combinedContent = extractListContent(block, state.sourceText);
        for (const continuation of blockContinuations) {
            combinedContent += ' ' + extractListContent(continuation, state.sourceText);
            processedBlocks.add(continuation);
        }
        
        const attrs = buildRDFaAttrsFromBlock(block, state.ctx);
        html += `<li${attrs}><p>${escapeHtml(combinedContent)}</p></li>`;
        processedBlocks.add(block);
    }
    
    return html;
}
```

#### 4.10.5 Complete Advanced List Pipeline

```javascript
function renderAdvancedListsWithRDFa(listBlocks, state) {
    // Step 1: Group by marker type
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
```

#### 4.10.6 Streaming Complexity Analysis

| Feature | Complexity | Streaming Compatible | Memory Impact |
|---------|-------------|-------------------|---------------|
| **Tight/Loose Detection** | O(n) | ✅ Yes | O(1) |
| **List Interruption** | O(1) per block | ✅ Yes | O(1) |
| **Mixed Markers** | O(1) per block | ✅ Yes | O(1) |
| **Lazy Continuation** | O(n) per group | ✅ Yes | O(k) where k = continuations |
| **Combined Pipeline** | O(n) total | ✅ Yes | O(n) minimal |

#### 4.10.7 Example: Advanced List Processing

**Input MD-LD:**
```md
Paragraph that gets interrupted by a list.

- First item {=ex:item1}
- Second item {=ex:item2}
  with lazy continuation {ex:continuation}

* Different marker starts new list {=ex:other1}
* Another item {=ex:other2}

Back to paragraph content.
```

**Processing Steps:**
1. **Detect interruption** - List immediately follows paragraph
2. **Group by markers** - `-` items separate from `*` items  
3. **Detect tightness** - No blank lines = tight list
4. **Detect continuations** - "with lazy continuation" spans lines
5. **Render with proper structure** - Maintain semantic attributes

**HTML Output:**
```html
<p>Paragraph that gets interrupted by a list.</p>
<ul>
<li about="ex:item1" property="rdfs:label">First item</li>
<li about="ex:item2" property="rdfs:label"><p>Second item with lazy continuation</p></li>
</ul>
<ul>
<li about="ex:other1" property="rdfs:label">Different marker starts new list</li>
<li about="ex:other2" property="rdfs:label">Another item</li>
</ul>
<p>Back to paragraph content.</p>
```

These advanced features ensure full CommonMark compliance while maintaining the streaming single-pass architecture that makes MD-LD efficient and predictable.

---

## 5. Context Management

### 5.1 Prefix Declaration Generation

```javascript
function generatePrefixDeclarations(ctx) {
    const prefixes = [];
    
    for (const [prefix, iri] of Object.entries(ctx)) {
        if (prefix !== '@vocab') {
            prefixes.push(`${prefix}: ${iri}`);
        }
    }
    
    return prefixes.length > 0 ? ` prefix="${prefixes.join(' ')}"` : '';
}
```

### 5.2 Vocabulary Declaration

```javascript
function generateVocabDeclaration(ctx) {
    return ctx['@vocab'] ? ` vocab="${ctx['@vocab']}"` : '';
}
```

### 5.3 RDFa Context Wrapper

```javascript
function wrapWithRDFaContext(html, ctx) {
    const prefixDecl = generatePrefixDeclarations(ctx);
    const vocabDecl = generateVocabDeclaration(ctx);
    
    return `<div${prefixDecl}${vocabDecl}>${html}</div>`;
}
```

---

## 6. Interactive Features

### 6.1 Data Attributes for Agent Interaction

```javascript
function buildDataAttributes(block) {
    const attrs = [];
    
    // Block identification
    if (block.id) attrs.push(`data-block-id="${block.id}"`);
    
    // Source tracking
    if (block.range) {
        attrs.push(`data-range-start="${block.range.start}"`);
        attrs.push(`data-range-end="${block.range.end}"`);
    }
    
    // Semantic metadata
    if (block.subject) attrs.push(`data-subject="${block.subject}"`);
    if (block.types?.length) attrs.push(`data-types="${block.types.join(',')}"`);
    
    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}
```

### 6.2 Hover and Click Targets

```javascript
// Enhanced block rendering with interaction support
function renderInteractiveBlock(block, state) {
    const rdfaAttrs = buildRDFaAttrsFromBlock(block, state.ctx);
    const dataAttrs = buildDataAttributes(block);
    
    state.output.push(`<${tag}${rdfaAttrs}${dataAttrs}>`);
    renderBlockContent(block, state);
    state.output.push(`</${tag}>`);
}
```

### 6.3 Provenance Preservation

```javascript
// Origin tracking in rendered output
function addOriginMetadata(block, state) {
    if (block.id && state.origin.quadIndex) {
        const relatedQuads = Array.from(state.origin.quadIndex.entries())
            .filter(([key, entry]) => entry.blockId === block.id);
            
        if (relatedQuads.length > 0) {
            state.output.push(`<!-- Origin: ${block.id}, Quads: ${relatedQuads.length} -->`);
        }
    }
}
```

---

## 7. Performance Characteristics

### 7.1 Complexity Analysis

| Operation | Complexity | Description |
|-----------|-------------|-------------|
| **Parse Integration** | O(1) | Direct reuse of parser output |
| **Block Sorting** | O(n log n) | One-time sort by position |
| **Block Rendering** | O(n) | Single pass through blocks |
| **List Processing** | O(n) | Linear scan of list items |
| **Context Generation** | O(p) | p = number of prefixes |

### 7.2 Memory Usage

| Component | Memory Pattern | Cleanup Strategy |
|-----------|----------------|------------------|
| **Render State** | Fixed overhead | Automatic GC |
| **Block Array** | O(n) growth | Released after render |
| **Output Buffer** | O(n) growth | Converted to string |
| **Context Cache** | Reused from parser | No additional allocation |

### 7.3 Streaming Compatibility

```javascript
// Future streaming interface design
function renderStream(mdldStream, options) {
    return new TransformStream({
        transform(chunk, controller) {
            const parsed = parse(chunk.toString(), options);
            const rendered = renderBlocks(parsed.origin.blocks, buildState(parsed, options));
            controller.enqueue(wrapWithRDFaContext(rendered, parsed.context));
        }
    });
}
```

---

## 8. Error Handling

### 8.1 Graceful Degradation

```javascript
function safeRenderBlock(block, state) {
    try {
        renderBlock(block, state);
    } catch (error) {
        // Fallback rendering
        state.output.push(`<div class="mdld-error">`);
        state.output.push(escapeHtml(state.sourceText.substring(
            block.range.start, block.range.end
        )));
        state.output.push(`</div>`);
        
        // Log error for debugging
        console.warn('Render error:', error, block);
    }
}
```

### 8.2 Validation Strategy

```javascript
function validateRenderInput(parsed) {
    const errors = [];
    
    if (!parsed.quads) errors.push('Missing quads array');
    if (!parsed.origin) errors.push('Missing origin data');
    if (!parsed.context) errors.push('Missing context object');
    
    return {
        valid: errors.length === 0,
        errors
    };
}
```

---

## 9. Output Specification

### 9.1 HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>MD-LD Rendered Document</title>
</head>
<body>
    <div prefix="schema: http://schema.org/ ex: http://example.org/" 
         vocab="http://www.w3.org/2000/01/rdf-schema#">
        
        <!-- Rendered content with RDFa markup -->
        <h1 about="ex:document" typeof="schema:Article" property="rdfs:label">
            Document Title
        </h1>
        
        <p about="ex:document">
            Content with <span about="ex:entity" typeof="schema:Person" 
                            property="rdfs:label">linked entities</span>.
        </p>
        
        <ul>
            <li about="ex:item1" typeof="schema:ListItem" property="rdfs:label">
                List Item 1
            </li>
            <li about="ex:item2" typeof="schema:ListItem" property="rdfs:label">
                List Item 2
            </li>
        </ul>
        
    </div>
</body>
</html>
```

### 9.2 RDFa Attribute Mapping

| MD-LD Construct | RDFa Output | Example |
|-----------------|-------------|---------|
| `{=ex:subject}` | `about="ex:subject"` | Subject declaration |
| `{.Type}` | `typeof="ex:Type"` | Type assertion |
| `{property}` | `property="ex:property"` | Literal property |
| `{?object}` | `rel="ex:object"` | Object property |
| `{!reverse}` | `rev="ex:reverse"` | Reverse property |

### 9.3 Return Value Structure

```javascript
const renderResult = {
    html: '<div prefix="...">...</div>',    // Complete HTML output
    context: {                               // Final resolved context
        '@vocab': 'http://www.w3.org/2000/01/rdf-schema#',
        'schema': 'http://schema.org/',
        'ex': 'http://example.org/'
    },
    metadata: {
        blockCount: 42,                      // Number of rendered blocks
        quadCount: 156,                      // Number of RDF triples
        renderTime: 1672531200000,          // Render timestamp
        listGroups: 3,                       // Number of list groups
        interactiveBlocks: 28                 // Blocks with data attributes
    },
    origin: parsed.origin,                   // Complete provenance data
    statements: parsed.statements            // Elevated statements
};
```

---

## 10. Extensibility Points

### 10.1 Custom Block Renderers

```javascript
const CUSTOM_RENDERERS = {
    'custom-block': (block, state) => {
        const attrs = buildRDFaAttrsFromBlock(block, state.ctx);
        state.output.push(`<section${attrs}>`);
        renderBlockContent(block, state);
        state.output.push(`</section>`);
    }
};
```

### 10.2 Attribute Transformers

```javascript
const ATTR_TRANSFORMERS = {
    'custom-attr': (value, block, ctx) => {
        // Custom attribute transformation logic
        return transformValue(value, ctx);
    }
};
```

### 10.3 Content Processors

```javascript
const CONTENT_PROCESSORS = {
    'custom-content': (text, block, state) => {
        // Custom content processing (e.g., markdown parsing)
        return processMarkdown(text);
    }
};
```

---

## 11. Browser Compatibility

### 11.1 Modern Browser Support

- **ES6+ Modules** — `import/export` syntax
- **Map/Set** — Efficient data structures
- **Template Literals** — String interpolation
- **Arrow Functions** — Concise syntax
- **Destructuring** — Object/array unpacking

### 11.2 CDN Usage

```html
<!-- Direct browser usage -->
<script type="module">
    import { render } from 'https://cdn.jsdelivr.net/npm/mdld-parse/render.js';
    
    const mdld = '# Title {=ex:title .schema:Thing label}';
    const result = render(mdld);
    document.body.innerHTML = result.html;
</script>
```

---

## 12. Security Considerations

### 12.1 Input Sanitization

```javascript
function sanitizeRenderInput(mdld) {
    // Remove potentially dangerous content
    return mdld
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}
```

### 12.2 Output Escaping

```javascript
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return String(text || '').replace(/[&<>"'/]/g, m => map[m]);
}
```

### 12.3 IRI Validation

```javascript
function validateIRI(iri) {
    // Basic IRI validation
    return iri && 
           typeof iri === 'string' &&
           !iri.includes('javascript:') &&
           !iri.includes('data:') &&
           /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(iri);
}
```

---

## 13. Testing Strategy

### 13.1 Unit Test Coverage

```javascript
describe('MD-LD Render', () => {
    test('renders heading with RDFa', () => {
        const mdld = '# Title {=ex:title .schema:Thing label}';
        const result = render(mdld);
        
        expect(result.html).toContain('<h1 about="ex:title" typeof="schema:Thing" property="rdfs:label">');
        expect(result.html).toContain('Title');
        expect(result.html).toContain('</h1>');
    });
    
    test('preserves list hierarchy', () => {
        const mdld = `- Item 1 {=ex:item1}\n  - Subitem {=ex:sub}`;
        const result = render(mdld);
        
        expect(result.html).toContain('<ul>');
        expect(result.html).toContain('<li about="ex:item1">');
        expect(result.html).toContain('<ul>');
        expect(result.html).toContain('<li about="ex:sub">');
    });
});
```

### 13.2 Integration Tests

```javascript
test('round-trip preservation', () => {
    const mdld = '# Test {=ex:test .ex:Type label}';
    const parsed = parse(mdld);
    const rendered = render(mdld);
    
    // Verify RDF semantics preserved
    expect(parsed.quads).toHaveLength(2); // type + label
    expect(rendered.html).toContain('about="ex:test"');
    expect(rendered.html).toContain('typeof="ex:Type"');
    expect(rendered.html).toContain('property="rdfs:label"');
});
```

### 13.3 Performance Tests

```javascript
test('rendering performance', () => {
    const largeMdld = generateLargeDocument(10000); // 10K tokens
    const start = performance.now();
    
    const result = render(largeMdld);
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // < 1 second
    expect(result.html).toBeDefined();
});
```

---

## 14. Conformance Requirements

### 14.1 Required Behaviors

A conformant MD-LD renderer MUST:

1. **Preserve All Semantics** — Every RDF triple must be represented in HTML+RDFa
2. **Maintain Document Structure** — HTML structure must reflect Markdown hierarchy
3. **Generate Valid RDFa** — All RDFa attributes must be syntactically correct
4. **Handle All Carrier Types** — Support every MD-LD value carrier
5. **Preserve Provenance** — Maintain complete origin tracking information
6. **Support Interactive Features** — Enable agent interaction through data attributes

### 14.2 Optional Features

These features are RECOMMENDED but not required:

1. **Syntax Highlighting** — Enhanced code block rendering
2. **Markdown Extensions** — Tables, footnotes, etc.
3. **Custom Themes** — CSS class generation
4. **Progressive Enhancement** — Graceful degradation without JavaScript
5. **Server-Side Rendering** — Node.js compatibility

### 14.3 Validation Criteria

```javascript
function validateConformance(renderResult, originalParsed) {
    const errors = [];
    
    // Check semantic preservation
    if (renderResult.metadata.quadCount !== originalParsed.quads.length) {
        errors.push('Quad count mismatch');
    }
    
    // Check RDFa validity
    if (!isValidRDFa(renderResult.html)) {
        errors.push('Invalid RDFa markup');
    }
    
    // Check structure preservation
    if (!hasValidHTMLStructure(renderResult.html)) {
        errors.push('Invalid HTML structure');
    }
    
    return {
        conformant: errors.length === 0,
        errors
    };
}
```

---

## 15. Implementation Guidelines

### 15.1 Performance Optimization

1. **Reuse Parser Output** — Leverage existing parsing work
2. **Minimize String Operations** — Use efficient concatenation
3. **Cache IRI Expansions** — Avoid repeated resolution
4. **Batch Attribute Generation** — Group RDFa attribute creation
5. **Optimize List Processing** — Single pass through list items

### 15.2 Code Organization

```javascript
// Main render function
export function render(mdld, options) { /* ... */ }

// Core rendering pipeline
function buildRenderState(parsed, options, mdld) { /* ... */ }
function renderBlocks(blocks, state) { /* ... */ }
function renderBlock(block, state) { /* ... */ }

// Specialized renderers
function renderListsWithRDFa(listBlocks, state) { /* ... */ }
function renderInteractiveBlock(block, state) { /* ... */ }

// Utilities
function buildRDFaAttrsFromBlock(block, ctx) { /* ... */ }
function wrapWithRDFaContext(html, ctx) { /* ... */ }
function escapeHtml(text) { /* ... */ }
```

### 15.3 Development Workflow

1. **Parser Integration** — Start with parser output
2. **Basic Rendering** — Implement core block types
3. **RDFa Generation** — Add semantic attributes
4. **List Processing** — Handle hierarchical lists
5. **Interactive Features** — Add data attributes
6. **Performance Optimization** — Profile and optimize
7. **Testing** — Comprehensive test coverage
8. **Documentation** — Maintain this specification

---

## 16. Future Enhancements

### 16.1 Streaming Rendering

```javascript
// Future: Incremental rendering for large documents
function* renderStream(mdld, options) {
    const parsed = parse(mdld, options);
    const state = buildRenderState(parsed, options, mdld);
    
    for (const block of sortedBlocks) {
        yield renderBlock(block, state);
    }
}
```

### 16.2 Component-Based Rendering

```javascript
// Future: Custom render components
const components = {
    'timeline': renderTimeline,
    'graph': renderGraph,
    'table': renderTable
};

function renderWithComponents(mdld, options) {
    // Component-based rendering system
}
```

### 16.3 Enhanced Interactivity

```javascript
// Future: Advanced agent features
function addAgentFeatures(html, parsed) {
    // Hover tooltips, click-to-edit, drag-drop
    // Real-time collaboration features
    // Visual graph overlays
}
```

---

This specification provides a comprehensive foundation for implementing the MD-LD Render function that maintains the same engineering excellence as the parser while enabling powerful interactive knowledge graph authoring experiences in the browser.
