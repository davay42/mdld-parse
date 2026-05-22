# MDLD Generate Documentation

Complete guide to the `generate()` and `generateNode()` functions for converting RDF quads to deterministic MDLD text.

## Overview

The `generate()` function converts RDF/JS Quads into canonical MDLD text with visual styling, semantic annotations, and compaction features. It ensures quad stability (one-to-one mapping between quads and text) and round-trip safety through parse → generate → parse cycles.

## Core Functions

### `generate({ quads, context, primarySubject, compactInline })`

Generate deterministic MDLD from RDF quads with visual styling and compaction.

**Parameters:**
- `quads` (array, required) — Array of RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings (default: `{}`)
- `primarySubject` (string, optional) — IRI to place first in output (ensures round-trip safety)
- `compactInline` (boolean, optional) — Enable inline type/label compaction (default: `true`)

**Returns:** `{ text, context, compactStats }`

- `text` (string) — Generated MDLD markdown
- `context` (object) — Full context with all prefixes used
- `compactStats` (object) — Compaction metrics:
  - `compactedSubjects` (number) — Subjects compacted with inline types/labels
  - `skippedHeadings` (number) — Headings skipped due to compaction
  - `inlineAnnotations` (number) — Inline type/label annotations rendered

### `generateNode({ quads, focusIRI, context, compactInline })`

Generate node-centric MDLD showing all quads where a specific IRI appears in any position (subject, object, predicate, type, or datatype).

**Parameters:**
- `quads` (array, required) — Array of RDF/JS Quads to search
- `focusIRI` (string, required) — The IRI to center the view on
- `context` (object, optional) — Prefix mappings (default: `{}`)
- `compactInline` (boolean, optional) — Enable inline type/label compaction (default: `true`)

**Returns:** `{ text, context, compactStats }`

- `text` (string) — Generated MDLD text (empty if focusIRI not found)
- `context` (object) — Full context with all prefixes used
- `compactStats` (object) — Compaction metrics (or `null` if focusIRI not found)

**Safety-First Behavior:**
- If `focusIRI` is null/undefined: Returns empty text
- If `focusIRI` not in graph: Returns empty text (never falls back to all data)
- If `quads` is empty: Returns empty text

This prevents accidental rendering of entire databases on misspelled IRIs—critical for production use with LLM cost per token.

## Core Features

### 1. Visual Carrier Styling

Generate applies visual styling based on datatype for improved readability:

| Datatype | Style | Example |
|---------|-------|---------|
| Numbers (`xsd:integer`, `xsd:decimal`) | Code spans | \`42\` {ex:age ^^xsd:integer} |
| Booleans (`xsd:boolean`) | Bold | **true** {ex:active ^^xsd:boolean} |
| Dates (`xsd:date`, `xsd:dateTime`) | Code spans | \`2026-05-22\` {ex:created ^^xsd:date} |
| Strings (default) | Square brackets | [Hello] {ex:greeting} |
| Language-tagged strings | Square brackets | [Hola] {ex:greeting @es} |

### 2. Label-in-Heading

Uses `rdfs:label` in subject headings when available:

```markdown
# Grandma's Apple Pie {=food:apple-pie .schema:Recipe label}
```

- First label used in heading display
- Additional labels rendered as literals
- `label` keyword added to heading annotation when label present

### 3. Inline Compaction

When `compactInline = true` (default), types and labels of referenced subjects are rendered inline:

**Before compaction:**
```markdown
# Grandma's Apple Pie {=food:apple-pie .schema:Recipe label}
[Recipes book] {+food:book ?food:includes}

# Recipes book {=food:book .schema:Book label}
```

**After compaction:**
```markdown
# Grandma's Apple Pie {=food:apple-pie .schema:Recipe label}
[Recipes book] {+food:book ?food:includes .schema:Book label}
```

**Compaction Rules:**
- Only applies to subjects with ONLY types and labels (no other properties)
- Types and labels rendered inline in object/reverse annotations
- Separate heading skipped when all quads rendered inline
- Quad stability maintained: each quad rendered exactly once

**Disable compaction:**
```javascript
const { text } = generate({ quads, context, compactInline: false });
```

### 4. Reverse Connections

Primary subject's incoming connections rendered as `!p` annotations:

```markdown
# Simple Note {=my:note .prov:Entity label}
[Example Project] {+my:example-project !my:relatedTo .prov:Project label}
```

- Syntax: `[SubjectLabel] {+subjectIRI !predicateIRI .Type label}`
- Only rendered for primary subject
- Inline compaction applies to reverse connections too
- Separate heading skipped if all quads rendered inline

### 5. Quad Stability

Generate enforces strict one-to-one quad-to-text mapping:

**Principles:**
- Each quad rendered exactly once
- No duplicate quads in output
- Round-trip safety: parse → generate → parse preserves exact quad count
- Types/labels rendered inline excluded from heading to prevent duplication

**Tracking Mechanisms:**
- `renderedReverseQuads` Set: Tracks quads rendered as reverse annotations
- `renderedInlineQuads` Set: Tracks types/labels rendered inline
- `skippedSubjects` Set: Tracks subjects whose all quads rendered inline

**Example:**
```javascript
const result1 = parse({ text: mdld });
const generated = generate({ ...result1 });
const result2 = parse({ text: generated.text });

console.log(result1.quads.length === result2.quads.length); // true
```

## Configuration Options

### compactInline

**Default:** `true`

Controls inline type/label compaction for referenced subjects.

**When enabled (true):**
- Types and labels rendered inline in object/reverse annotations
- Separate headings skipped for simple entities
- More compact output
- Better for simple referenced entities

**When disabled (false):**
- All subjects get separate headings
- No inline type/label annotations
- More verbose output
- Better for complex entities with many properties

**Example:**
```javascript
// Compact output (default)
const { text, compactStats } = generate({ quads, context });
// compactStats: { compactedSubjects: 1, skippedHeadings: 1, inlineAnnotations: 1 }

// Verbose output
const { text, compactStats } = generate({ quads, context, compactInline: false });
// compactStats: { compactedSubjects: 0, skippedHeadings: 0, inlineAnnotations: 0 }
```

### primarySubject

**Default:** First subject from quads

Controls which subject appears first in output and receives reverse connection rendering.

**When provided:**
- Specified subject placed first in output
- Reverse connections rendered as `!p` annotations
- Ensures round-trip safety for primary subject

**When not provided:**
- Falls back to first subject from quads
- No reverse connection rendering
- May affect round-trip safety in some cases

**Example:**
```javascript
const { text } = generate({ 
  quads, 
  context, 
  primarySubject: 'http://example.org/article' 
});
```

## Compaction Statistics

The `compactStats` object provides metrics for monitoring compaction behavior:

```javascript
{
  compactedSubjects: 5,      // Number of subjects compacted
  skippedHeadings: 5,        // Number of headings skipped
  inlineAnnotations: 8       // Number of inline annotations rendered
}
```

**Use Cases:**
- Monitoring compaction impact
- Debugging unexpected behavior
- Performance analysis
- User-facing metrics in UI

## Deterministic Output

Generate ensures deterministic output through:

1. **Subject ordering:** Sorted alphabetically (primary subject first if specified)
2. **Predicate ordering:** Sorted alphabetically within each subject
3. **Type ordering:** Sorted alphabetically in headings
4. **Prefix ordering:** Sorted alphabetically in declarations

**Example:**
```javascript
const result1 = generate({ quads, context });
const result2 = generate({ quads, context });

console.log(result1.text === result2.text); // true
```

## Performance Characteristics

- **Time complexity:** O(n log n) due to sorting
- **Space complexity:** O(n) for quad grouping and tracking
- **Compaction overhead:** ~2-5ms per 1000 quads
- **Memory overhead:** O(n) for tracking Sets (renderedInlineQuads, renderedReverseQuads)

**Optimizations:**
- LRU cache for IRI shortening (1000 entry limit)
- Single-pass quad grouping
- Efficient Set operations for quad tracking

## Use Cases

### 1. Canonical MDLD Generation

Convert external RDF quads to canonical MDLD format:

```javascript
import { generate } from 'mdld-parse';

const externalQuads = await fetchExternalRDF();
const { text, context } = generate({ quads: externalQuads });

console.log(text); // Canonical MDLD with visual styling
```

### 2. Round-Trip Normalization

Normalize MDLD through parse → generate cycle:

```javascript
import { parse, generate } from 'mdld-parse';

const result = parse({ text: messyMDLD });
const { text } = generate({ ...result });

console.log(text); // Clean, canonical MDLD
```

### 3. Node-Centric Exploration

Explore a specific node and all its relationships:

```javascript
import { generateNode } from 'mdld-parse';

const { text } = generateNode({ 
  quads: allQuads, 
  focusIRI: 'http://example.org/alice' 
});

console.log(text); // All quads where alice appears
```

### 4. Compact vs Verbose Output

Choose between compact and verbose output based on use case:

```javascript
// Compact for display/UI
const { text } = generate({ quads, context, compactInline: true });

// Verbose for editing/debugging
const { text } = generate({ quads, context, compactInline: false });
```

### 5. Reverse Connection Visualization

Show incoming connections to primary subject:

```javascript
const { text } = generate({ 
  quads, 
  context, 
  primarySubject: 'http://example.org/article' 
});

// Output includes !p annotations for incoming connections
```

## Best Practices

### 1. Always Provide Context

```javascript
// Good
const { text } = generate({ quads, context: { ex: 'http://example.org/' } });

// Avoid (relies on default context)
const { text } = generate({ quads });
```

### 2. Specify Primary Subject for Round-Trip Safety

```javascript
// Good
const { text } = generate({ 
  quads, 
  context, 
  primarySubject: result.primarySubject 
});

// Avoid (may affect round-trip safety)
const { text } = generate({ quads, context });
```

### 3. Use compactInline Based on Use Case

```javascript
// Display/UI: Use compaction
const { text } = generate({ quads, context, compactInline: true });

// Editing/Debugging: Disable compaction
const { text } = generate({ quads, context, compactInline: false });
```

### 4. Monitor Compaction Statistics

```javascript
const { text, compactStats } = generate({ quads, context });

if (compactStats.compactedSubjects > 10) {
  console.warn('High compaction rate - consider disabling for editing');
}
```

### 5. Validate Quad Stability

```javascript
const result1 = parse({ text: mdld });
const generated = generate({ ...result1 });
const result2 = parse({ text: generated.text });

if (result1.quads.length !== result2.quads.length) {
  console.error('Quad stability violation!');
}
```

## Composition Patterns

Generate composes seamlessly with other MDLD functions:

### Pattern 1: Parse → Generate (Semantic Extraction)

```javascript
const canonical = generate({ ...parse({ text, context }) });
// text → quads → canonical MDLD (deterministic, visual styling applied)
```

### Pattern 2: Generate → Parse (Normalization)

```javascript
const normalized = parse({ ...generate({ quads, context }) });
// quads → MDLD → normalized quads (canonical form)
```

### Pattern 3: Merge → Generate (Multi-Document)

```javascript
const merged = merge([doc1, doc2]);
const { text } = generate({ ...merged });
// Multiple documents → merged quads → canonical MDLD
```

### Pattern 4: Locate → Generate (Partial)

```javascript
const location = locate(quad, origin);
const partial = generate({ quads: [quad], context });
// Locate specific quad → generate partial MDLD
```

## Error Handling

Generate is designed to be fail-safe:

- **Invalid quads:** Returns empty text with warning
- **Missing context:** Uses default context
- **Invalid primarySubject:** Falls back to first subject
- **Empty quads:** Returns empty text

```javascript
const { text } = generate({ quads: [] });
console.log(text); // "" (empty string)
```

## Summary

The `generate()` function provides:
- **Deterministic output:** Same input always produces same output
- **Quad stability:** One-to-one quad-to-text mapping
- **Visual styling:** Datatype-aware carrier formatting
- **Inline compaction:** Compact output for simple entities
- **Reverse connections:** Primary subject incoming links
- **Round-trip safety:** Parse → generate → parse preserves data
- **Configuration flexibility:** Options for different use cases
- **Performance:** Efficient O(n log n) time complexity

Use `generate()` for canonical MDLD generation and `generateNode()` for node-centric exploration.
