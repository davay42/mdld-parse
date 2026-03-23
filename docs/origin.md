# Origin System - Lean Quad Tracking

The MDLD parser includes a sophisticated **origin tracking system** that provides complete provenance for every RDF quad generated from markdown. This system enables powerful use cases like UI navigation, debugging, and audit trails.

## Overview

The origin system is a **lean, read-only source map** that connects each RDF quad back to its exact location in the original markdown text. Unlike complex mutable systems, the lean origin focuses on three core use cases:

1. **UI Navigation** - Click-to-jump functionality in editors
2. **Provenance Audit** - Complete relationship tracking for knowledge graphs  
3. **Parser Error Reporting** - Precise error location reporting

## Architecture

### Lean Origin Structure

```javascript
{
  quadIndex: Map<string, OriginEntry>
}
```

Each `OriginEntry` contains:

```javascript
{
  blockId: string,        // Unique identifier for the containing block
  range: { start: number, end: number },  // Character range in source text
  carrierType: string,    // 'heading', 'blockquote', 'span'
  subject: string,        // Subject IRI of the quad
  predicate: string,       // Predicate IRI of the quad
  context: object,        // Context object inherited from parsing
  value: string,          // Raw carrier text content
  polarity: '+' | '-'     // Assertion (+) or retraction (-)
}
```

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

const result = parse(mdldText, { context: { ex: 'http://example.org/' } });
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
const origin = parse(largeMarkdown).origin;

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
    const result = parse(text, { context: this.context });
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
