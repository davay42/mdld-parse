# Origin System - Lean Quad Tracking and Span Chains

The MDLD parser includes a sophisticated **origin tracking system** that provides complete provenance for every RDF quad generated from markdown, together with a **span chain** that preserves the weak textual topology between semantic blocks.

## Overview

The origin system is a **lean, read-only source map** with two complementary layers:

1. **Blocks** — strong semantic anchors: every token that carries RDF quads
2. **Spans** — weak textual topology: the raw text between adjacent blocks

Together they form a walkable document chain:

```
[Block] --(Span)-- [Block] --(Span)-- [Block]
```

This layering serves four core use cases:

1. **UI Navigation** - Click-to-jump functionality in editors
2. **Provenance Audit** - Complete relationship tracking for knowledge graphs
3. **Textual Context** - Recover surrounding prose for any semantic annotation
4. **Resonance Systems** - Foundation for autocomplete, clustering, and cross-document linking

## Architecture

### Full Origin Structure

```javascript
origin: {
  quadIndex: Map<string, OriginEntry>,  // quad key → provenance
  blocks:    Map<string, BlockEntry>,   // block id → semantic anchor
  spans:     Map<string, SpanEntry>,    // span id  → textual topology
  documentStructure: BlockEntry[]       // ordered block list
}
```

### QuadIndex Entry

Each `OriginEntry` connects a quad back to its source location:

```javascript
{
  blockId: string,        // Containing block identifier
  range: { start: number, end: number },      // Character range including carrier markers
  valueRange: { start: number, end: number } | null,  // Character range excluding markers
  carrierType: string,    // 'heading', 'blockquote', 'list', 'para', 'code'
  subject: string,        // Subject IRI of the quad
  predicate: string,      // Predicate IRI of the quad
  context: object,        // Prefix context inherited from parsing
  value: string,          // Raw carrier text content
  polarity: '+' | '-'     // Assertion (+) or retraction (-)
}
```

### Block Entry

A `BlockEntry` is a **strong semantic anchor** — every token that produced at least one RDF quad:

```javascript
{
  id: string,             // djb2 hash of type:rangeStart:rangeEnd
  type: string,           // 'heading' | 'para' | 'list' | 'blockquote' | 'code'
  range: [start, end],    // Byte range in source text
  text: string,           // Clean text (annotations stripped)
  subject: string | null, // Resolved subject IRI
  types: string[],        // rdf:type IRIs declared on this block
  predicates: Array,      // Predicates asserted on this block
  carriers: Array,        // Inline carrier details
  listLevel: number,      // Indentation depth (list items)
  parentBlockId: string | null,  // Enclosing block (for nesting)
  quadKeys: string[],     // Keys of quads emitted from this block
  prevSpanId: string | null,     // Span leading into this block
  nextSpanId: string | null      // Span leaving this block
}
```

### Span Entry

A `SpanEntry` is a **weak topological observation** — the raw text between two adjacent blocks:

```javascript
{
  id: string,             // djb2 hash of 'span:rangeStart:rangeEnd'
  range: [start, end],    // Byte range in source text
  prevBlockId: string | null,  // Block immediately before this span
  nextBlockId: string | null,  // Block immediately after this span
  prevSpanId: string | null,   // Previous span in chain
  nextSpanId: string | null,   // Next span in chain
  byteLength: number           // end - start
}
```

**Key property:** spans store no text. Text is always recovered on demand:

```javascript
const spanText = sourceText.slice(span.range[0], span.range[1]);
```

This is deliberate — it keeps memory usage O(blocks + spans) without duplication.

### Architectural Principle

> **Blocks are semantics. Spans are observations.**

The parser emits observations only — byte ranges, block IDs, adjacency. It never interprets, ranks, tokenizes, or embeds span content. All higher-level uses (autocomplete, clustering, resonance) emerge from this substrate without modifying the parser.

### Key Benefits

#### 🎯 Complete Audit Trails
Track full subject-predicate-object relationships with precise source locations:

```javascript
const location = locate(quad, origin);
console.log(location);
// {
//   blockId: '4ac750c12',
//   range: { start: 33, end: 53 },
//   carrierType: 'blockquote',
//   subject: 'http://example.org/alice',
//   predicate: 'http://www.w3.org/2000/01/rdf-schema#name',
//   context: { ex: 'http://example.org/' },
//   value: 'Alice Smith',
//   polarity: '+'
// }
```

#### 🔍 Better Debugging
Full quad information available for debugging and validation:

```javascript
// Find all quads from a specific block
const blockQuads = Array.from(origin.quadIndex.entries())
  .filter(([key, entry]) => entry.blockId === '4ac750c12')
  .map(([key, entry]) => ({ key, entry }));

// Debug specific predicate usage
const nameQuads = Array.from(origin.quadIndex.entries())
  .filter(([key, entry]) => entry.predicate.includes('name'));
```

#### 📊 Enhanced Provenance
Complete relationship tracking for knowledge graphs:

```javascript
// Build provenance chain
function buildProvenanceChain(quads, origin) {
  return quads.map(quad => {
    const location = locate(quad, origin);
    return {
      quad,
      source: {
        text: location.value,
        range: location.range,
        blockId: location.blockId
      },
      relationship: {
        subject: location.subject,
        predicate: location.predicate,
        polarity: location.polarity
      }
    };
  });
}
```

## Span Chain

### Walking the Document

The span chain is a doubly-linked list connecting every block through the spans between them. Both directions are O(1) per step.

**Forward walk from a block:**

```javascript
function walkForward(origin, startBlockId) {
  const results = [];
  let block = origin.blocks.get(startBlockId);
  while (block) {
    results.push(block);
    if (!block.nextSpanId) break;
    const span = origin.spans.get(block.nextSpanId);
    if (!span) break;
    block = origin.blocks.get(span.nextBlockId);
  }
  return results;
}
```

**Backward walk from a block:**

```javascript
function walkBackward(origin, startBlockId) {
  const results = [];
  let block = origin.blocks.get(startBlockId);
  while (block) {
    results.push(block);
    if (!block.prevSpanId) break;
    const span = origin.spans.get(block.prevSpanId);
    if (!span) break;
    block = origin.blocks.get(span.prevBlockId);
  }
  return results;
}
```

**Recover the text of a span:**

```javascript
function spanText(span, sourceText) {
  return sourceText.slice(span.range[0], span.range[1]);
}
```

**Extract a readable fragment around a block (n spans of context):**

```javascript
function extractFragment(origin, sourceText, blockId, contextSpans = 1) {
  const block = origin.blocks.get(blockId);
  let start = block.range[0];
  let end = block.range[1];

  let span = block.prevSpanId ? origin.spans.get(block.prevSpanId) : null;
  for (let i = 0; i < contextSpans && span; i++) {
    start = span.range[0];
    span = span.prevSpanId ? origin.spans.get(span.prevSpanId) : null;
  }

  span = block.nextSpanId ? origin.spans.get(block.nextSpanId) : null;
  for (let i = 0; i < contextSpans && span; i++) {
    end = span.range[1];
    span = span.nextSpanId ? origin.spans.get(span.nextSpanId) : null;
  }

  return sourceText.slice(start, end);
}
```

### Use Cases

#### 1. Autocomplete with Textual Neighborhood

An autocomplete engine can recover the surrounding prose for any quad without storing it at parse time:

```javascript
function getNeighborhoodText(quad, origin, sourceText) {
  const entry = locate(quad, origin);
  if (!entry) return null;
  return extractFragment(origin, sourceText, entry.blockId, 2);
}
```

#### 2. Cross-Document Topology

Span IDs are stable positional hashes. The same span boundaries appearing in two document versions identify a structural match without semantic interpretation.

#### 3. Future: Spans as RDF Subjects

Spans are first-class observations and can become RDF subjects in higher layers using the `nih:` URI scheme (content-addressed, computed post-parse). The parser never computes these — they are authored or derived above:

```markdown
## Span {=nih:sha-256;xxxx .prov:Entity label}

~~~~~~ {prov:value}
the text between those two blocks
~~~~~~
```

#### 4. Gram Indexes (Higher Layer)

The span chain provides the substrate for byte-ngram, skip-gram, and token-gram indexes. These are built above the parser — never inside it:

```javascript
// Example: build a simple bigram index from all spans
function buildBigramIndex(origin, sourceText) {
  const index = new Map();
  for (const span of origin.spans.values()) {
    const text = spanText(span, sourceText);
    for (let i = 0; i < text.length - 1; i++) {
      const gram = text.slice(i, i + 2);
      if (!index.has(gram)) index.set(gram, new Set());
      index.get(gram).add(span.id);
    }
  }
  return index;
}
```

### Design Invariants

| Property | Guarantee |
|---|---|
| Non-overlapping | `span.range[1] <= nextSpan.range[0]` always |
| Bidirectional consistency | `block.nextSpanId` → span whose `prevBlockId` is that block |
| No text stored | spans store only ranges; text recovered via `slice()` |
| O(1) per step | walking is pointer-following, no iteration |
| Single-pass construction | built during block creation, no post-processing |

## API Reference

### `locate(quad, origin)`

Locate the origin entry for a quad using the lean origin system.

**Parameters:**
- `quad` (object) — The quad to locate (subject, predicate, object)
- `origin` (object) — Origin object containing quadIndex

**Returns:** Origin entry or `null`

**Example:**
```javascript
import { parse, locate } from 'mdld-parse';

const result = parse({ text: mdldText, context: { ex: 'http://example.org/' } });
const quad = result.quads[0];

const location = locate(quad, result.origin);

if (location) {
  console.log(`Found "${location.value}" at ${location.range.start}-${location.range.end}`);
  console.log(`Subject: ${location.subject}`);
  console.log(`Predicate: ${location.predicate}`);
  console.log(`Carrier: ${location.carrierType}`);
}
```

## Use Cases

### 1. UI Navigation

Create click-to-jump functionality in MDLD editors:

```javascript
// Handle quad click in UI
function onQuadClick(quad, origin, editor) {
  const location = locate(quad, origin);
  if (location) {
    // Jump to source location
    editor.setSelection(location.range.start, location.range.end);
    editor.focus();
    
    // Highlight the block
    editor.highlightBlock(location.blockId);
  }
}

// Hover preview
function onQuadHover(quad, origin) {
  const location = locate(quad, origin);
  if (location) {
    showTooltip({
      text: location.value,
      range: location.range,
      predicate: location.predicate
    });
  }
}
```

### 2. Provenance Audit

Build complete audit trails for knowledge graphs:

```javascript
function buildAuditReport(quads, origin) {
  const report = {
    totalQuads: quads.length,
    blocks: new Map(),
    predicates: new Map(),
    polarities: { '+': 0, '-': 0 }
  };

  quads.forEach(quad => {
    const location = locate(quad, origin);
    if (!location) return;

    // Track block usage
    if (!report.blocks.has(location.blockId)) {
      report.blocks.set(location.blockId, {
        carrierType: location.carrierType,
        quads: []
      });
    }
    report.blocks.get(location.blockId).quads.push(quad);

    // Track predicate usage
    const predCount = report.predicates.get(location.predicate) || 0;
    report.predicates.set(location.predicate, predCount + 1);

    // Track polarity
    report.polarities[location.polarity]++;
  });

  return report;
}
```

### 3. Error Reporting

Provide precise error location information:

```javascript
function validateQuad(quad, origin, rules) {
  const location = locate(quad, origin);
  const errors = [];

  rules.forEach(rule => {
    if (!rule.validate(quad)) {
      errors.push({
        message: rule.message,
        quad,
        location: {
          text: location.value,
          range: location.range,
          blockId: location.blockId,
          line: getLineNumber(location.range.start, sourceText)
        }
      });
    }
  });

  return errors;
}
```

### 4. Multi-Document Merging

Track provenance across merged documents:

```javascript
import { merge } from 'mdld-parse';

const merged = merge([doc1, doc2, doc3]);

// Build document provenance
function buildDocumentProvenance(merged) {
  const provenance = new Map();

  merged.origin.documents.forEach((doc, index) => {
    doc.quads.forEach(quad => {
      const location = locate(quad, merged.origin);
      if (location) {
        provenance.set(quadKey(quad), {
          documentIndex: index,
          originalLocation: location,
          mergedLocation: location
        });
      }
    });
  });

  return provenance;
}
```

## Performance Considerations

The lean origin system is optimized for performance:

- **Memory Efficient**: Uses Map data structure for O(1) lookups
- **Streaming Friendly**: Built during single-pass parsing
- **Immutable**: Origin entries never change after creation
- **Minimal Overhead**: Only stores essential information

```javascript
// Performance characteristics
const origin = parse({text: largeMarkdown}).origin;

// O(1) lookup by quad
const location = locate(quad, origin);

// O(n) iteration over all entries
for (const [key, entry] of origin.quadIndex) {
  // Process entry
}

// Memory usage scales linearly with quad count
// ~200 bytes per quad entry
```

## Migration from Legacy Origin

If you were using the pre-v0.7.0 origin system, here's how to migrate:

### Old System (pre-v0.7.0)
```javascript
// Complex mutable origin with slot management
{
  blocks: Map<string, Block>,
  quadMap: Map<string, QuadSlot>,
  entries: Array<OriginEntry>
}

// Complex locate with auto-parsing
locate(quad, origin, text, context)
```

### New Lean System (v0.7.0+)
```javascript
// Simple immutable origin
{
  quadIndex: Map<string, OriginEntry>
}

// Simple locate
locate(quad, origin)
```

### Migration Steps

1. **Update locate calls**:
   ```javascript
   // Old
   const location = locate(quad, origin, text, context);
   
   // New
   const location = locate(quad, origin);
   ```

2. **Update origin access**:
   ```javascript
   // Old
   const block = origin.blocks.get(blockId);
   const slot = origin.quadMap.get(quadKey);
   
   // New
   const entry = origin.quadIndex.get(quadKey);
   ```

3. **Remove applyDiff usage**:
   ```javascript
   // Old - no longer available
   const updated = applyDiff({ text, diff, origin });
   
   // New - use merge for document updates
   const updated = merge([original, diffText]);
   ```

## Best Practices

### 1. Cache Location Lookups
```javascript
// Cache frequently accessed locations
const locationCache = new Map();

function getCachedLocation(quad, origin) {
  const key = quadKey(quad);
  if (!locationCache.has(key)) {
    locationCache.set(key, locate(quad, origin));
  }
  return locationCache.get(key);
}
```

### 2. Batch Processing
```javascript
// Process multiple quads efficiently
function processQuads(quads, origin, processor) {
  return quads.map(quad => {
    const location = locate(quad, origin);
    return processor(quad, location);
  });
}
```

### 3. Error Handling
```javascript
// Always handle null returns
function safeLocate(quad, origin) {
  const location = locate(quad, origin);
  if (!location) {
    console.warn('Quad not found in origin:', quad);
    return null;
  }
  return location;
}
```

### 4. Memory Management
```javascript
// Clear caches when no longer needed
function cleanup() {
  locationCache.clear();
  // Allow garbage collection
}
```

## Examples

### Complete UI Integration
```javascript
class MDLDEditor {
  constructor() {
    this.origin = null;
    this.quads = [];
  }

  async parse(text) {
    const result = parse({ text, context: this.context });
    this.origin = result.origin;
    this.quads = result.quads;
    this.render();
  }

  onQuadClick(quad) {
    const location = locate(quad, this.origin);
    if (location) {
      this.editor.setSelection(location.range.start, location.range.end);
      this.showQuadInfo(quad, location);
    }
  }

  showQuadInfo(quad, location) {
    const info = `
      <div class="quad-info">
        <h4>Quad Information</h4>
        <p><strong>Subject:</strong> ${location.subject}</p>
        <p><strong>Predicate:</strong> ${location.predicate}</p>
        <p><strong>Value:</strong> ${location.value}</p>
        <p><strong>Type:</strong> ${location.carrierType}</p>
        <p><strong>Range:</strong> ${location.range.start}-${location.range.end}</p>
        <p><strong>Polarity:</strong> ${location.polarity}</p>
      </div>
    `;
    this.sidebar.innerHTML = info;
  }
}
```

### Audit Trail Generator
```javascript
function generateAuditTrail(quads, origin) {
  const trail = {
    timestamp: new Date().toISOString(),
    totalQuads: quads.length,
    entries: []
  };

  quads.forEach((quad, index) => {
    const location = locate(quad, origin);
    if (location) {
      trail.entries.push({
        index,
        subject: location.subject,
        predicate: location.predicate,
        object: quad.object.value,
        sourceText: location.value,
        sourceRange: location.range,
        blockId: location.blockId,
        carrierType: location.carrierType,
        polarity: location.polarity
      });
    }
  });

  return trail;
}
```

The lean origin system provides a powerful, efficient foundation for building sophisticated MDLD applications with complete provenance tracking.
