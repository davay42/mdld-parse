# Polarity & Retraction System

The MDLD polarity system enables **sophisticated diff authoring** and **document evolution** through explicit assertion and retraction semantics. This system provides deterministic conflict resolution and enables powerful collaborative editing scenarios.

## Overview

MDLD uses **polarity prefixes** to control the semantic intent of annotations:

- **No prefix** - Positive polarity (default behavior)
- **`-` (negative)** - Retract existing triples


This system enables **intra-document cancel** (within the same document) and **external retract** (targeting prior document state).

## Polarity Syntax

### Basic Polarity

```markdown
# Positive assertions (default)
[Alice] {author}         
[2024] {date ^^xsd:date} 

# Negative retractions
[Alice] {-author}
[2024] {-date ^^xsd:date}
```

### Subject & Object Declarations

Subject and object declarations have **no polarity** - they are always positive:

```markdown
# ✅ Correct - subjects have no polarity
{=ex:alice}               # Subject declaration
{+ex:bob}                 # Object declaration

# ❌ Incorrect - polarity not allowed
{-=ex:alice}              # Invalid
{-+ex:bob}                # Invalid
```

### Type Declarations

Type declarations can have polarity **only in subject declarations**:

```markdown
# ✅ Correct - types in subject declaration
# Person {=ex:person .ex:Person}              # Positive type
# Person {=ex:person -.ex:Person}             // Negative type (external retract)

# ❌ Incorrect - standalone type annotations
{.ex:Person}              # Not parsed as type
{-.ex:Person}             # Not parsed as type
```

**Note:** Type retractions in subject declarations become external retractions since they don't match in-document positives.

## Intra-Document Cancel

### Exact Statement Cancel

Only exact SPO (Subject-Predicate-Object) triples cancel within the same document:

```markdown
# Article {=ex:article}

[Alice] {author}          # + assertion
[Alice] {-author}         // Cancels the above (exact SPO match)
[Charlie] {author}        # + assertion (different object)
```

**Result:** Only Charlie is listed as author.

```turtle
ex:article ex:author ex:charlie .
```

**Note:** `[Bob] {-author}` does NOT cancel `[Alice] {author}` because they have different objects.

### Multiple Different Objects

Multiple objects with the same predicate are all retained (no cross-canceling):

```markdown
# Article {=ex:article}

[Alice] {author}
[Bob] {author}
[Charlie] {author}      # All three authors are retained
```

**Result:** All three authors are listed.

```turtle
ex:article ex:author ex:alice, ex:bob, ex:charlie .
```

**Note:** Only exact SPO matches cancel. Different objects with the same predicate do not cancel each other.

## Remove Quads System

The parser maintains two separate collections for different purposes:

- **`quads`** - Final resolved graph state (what actually exists)
- **`remove`** - External retractions targeting prior document state

### Intra-Document Cancel

When positive and negative triples match exactly within the same document, they cancel immediately:

```markdown
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}
[Software Engineer] {-my:jobTitle}    // Cancels above
[Senior Software Engineer] {my:jobTitle}
```

**Result:**
```javascript
const result = parse(markdown, { context: { my: 'tag:hr@example.com,2026:' } });

console.log(result.quads.length);    // 2 (type + final jobTitle)
console.log(result.remove.length);    // 0 (empty - no external retractions)
```

**Explanation:** The negative `[Software Engineer] {-my:jobTitle}` finds and cancels the matching positive `[Software Engineer] {my:jobTitle}` within the same document, so no external retract is needed.

### External Retract

When negative triples don't find matching positives in the current document, they become external retractions:

```markdown
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}    // No matching positive in current doc
[Senior Software Engineer] {my:jobTitle}
```

**Result:**
```javascript
const result = parse(markdown, { context: { my: 'tag:hr@example.com,2026:' } });

console.log(result.quads.length);    // 1 (only Senior Software Engineer)
console.log(result.remove.length);    // 1 (Software Engineer retract)
console.log(result.remove[0]);         // Quad for Software Engineer
```

**Explanation:** The negative `[Software Engineer] {-my:jobTitle}` has no matching positive in the current document, so it becomes an external retract targeting prior document state.

### Type Migration

Type retractions work the same way and become external retractions:

```markdown
# Project Alpha {=my:proj -.my:ActiveProject .my:ArchivedProject}
```

**Result:**
```javascript
const result = parse(markdown, { context: { my: 'tag:hr@example.com,2026:' } });

console.log(result.quads);    // [type: ArchivedProject]
console.log(result.remove);    // [type: ActiveProject] (external retract)
```

### Merge Resolution

External retractions are resolved during document merging:

```javascript
import { merge } from 'mdld-parse';

const doc1 = `# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}`;

const doc2 = `# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}    // External retract
[Senior Software Engineer] {my:jobTitle}`;

const merged = merge([doc1, doc2], { context: { my: 'tag:hr@example.com,2026:' } });

console.log(merged.quads);    // Software Engineer removed, Senior Software Engineer remains
console.log(merged.remove);  // [] - Empty after resolution
```

### Hard Invariant

The system maintains the hard invariant: **quads ∩ remove = ∅**

```javascript
const result = parse(markdown);

// This is always true:
const overlap = result.quads.some(quad => 
    result.remove.some(remove => 
        quad.subject.equals(remove.subject) &&
        quad.predicate.equals(remove.predicate) &&
        quad.object.equals(remove.object)
    )
);

console.log(overlap); // false - never any overlap
```

### Use Cases for Remove Quads

#### 1. Document Versioning
```javascript
// v1: Original document
const v1 = parse(`# Article {=ex:article}
[Alice] {author}`);

// v2: Update with retraction
const v2 = parse(`# Article {=ex:article}
[Alice] {-author}      // External retract
[Bob] {author}`);

// Merge to get final state
const final = merge([v1, v2]);
// Result: Bob is author, Alice removed
```

#### 2. Collaborative Editing
```javascript
// Alice's changes
const alice = parse(`# Doc {=ex:doc}
[Content A] {section}`);

// Bob's changes (retract Alice's content)
const bob = parse(`# Doc {=ex:doc}
[Content A] {-section}   // External retract
[Content B] {section}`);

// Resolve conflicts
const resolved = merge([alice, bob]);
// Result: Only Content B remains
```

#### 3. Data Migration
```javascript
// Old schema
const old = parse(`# Person {=ex:person}
[Employee] {status}`);

// Migration script
const migration = parse(`# Person {=ex:person}
[Employee] {-status}     // Retract old status
[Staff] {status}        // Add new status`);

const migrated = merge([old, migration]);
// Result: Status changed from Employee to Staff
```

### Performance Characteristics

- **O(1) lookup:** Quad keys enable fast cancel/retract detection
- **Streaming:** Remove detection during single-pass parsing
- **Memory efficient:** Remove quads stored separately from final state
- **Deterministic:** Same input always produces same quads/remove separation

### API Reference

```javascript
const result = parse(markdown, options);

// Final resolved graph state
console.log(result.quads);    // Array of RDF/JS Quads

// External retractions for merge resolution
console.log(result.remove);   // Array of RDF/JS Quads

// Origin tracking includes polarity info
const location = locate(quad, result.origin);
console.log(location.polarity); // '+' for quads, '-' for removes
```

## External Retract

### Targeting Prior State

Negative triples that don't match in-document positives become **external retractions**:

```markdown
# Article v2 {=ex:article}

[Alice] {-author}         # External retract - Alice not in current state
[Bob] {author}            # New assertion
```

**Result:** Bob is author, Alice is marked for retraction.

```javascript
const result = parse(markdown, { context: { ex: 'http://example.org/' } });

console.log(result.quads);
// [ex:article rdf:type ex:Article, ex:article ex:author ex:bob]

console.log(result.remove);
// [ex:article ex:author ex:alice]  // External retract
```

### Merge Resolution

External retractions are resolved during document merging:

```javascript
import { merge } from 'mdld-parse';

const doc1 = `# Article {=ex:article}
[Alice] {author}`;

const doc2 = `# Article {=ex:article}
[Alice] {-author}
[Bob] {author}`;

const merged = merge([doc1, doc2]);

console.log(merged.quads);
// [ex:article rdf:type ex:Article, ex:article ex:author ex:bob]

console.log(merged.remove);
// [] - Empty because Alice was retracted by doc2
```

## Use Cases

### 1. Document Versioning

Track changes across document versions:

```markdown
# Article v1 {=ex:article}
[Alice] {author}
[2024-01-01] {datePublished ^^xsd:date}

# Article v2 {=ex:article}
[Alice] {-author}          # Retract original author
[Bob] {author}             # New author
[2024-01-01] {-datePublished ^^xsd:date}  # Retract old date
[2024-02-01] {datePublished ^^xsd:date}  # New date
```

**Merge Result:** Bob is author, date is 2024-02-01.

### 2. Collaborative Editing

Multiple authors can work simultaneously:

```markdown
# Shared Doc {=ex:doc}

# Alice's changes
[Alice] {author}
[Draft] {status}

# Bob's changes  
[Bob] {-author}           # Retract Alice's authorship
[Bob] {author}            # Add himself as author
[Published] {-status}    # Retract draft status
[Published] {status}     # Add published status
```

**Merge Result:** Bob is author, status is Published.

### 3. Template Instantiation

Use templates with placeholder content:

```markdown
# Template {=ex:template}
[Placeholder] {title}
[Draft] {status}

# Instance {=ex:instance}
[Placeholder] {-title}    # Retract placeholder
[Real Title] {title}      # Add real title
[Draft] {-status}         # Retract draft status
[Final] {status}          # Add final status
```

**Merge Result:** Real Title with Final status.

### 4. Conditional Content

Environment-specific content:

```markdown
# Config {=ex:config}

# Development
[Debug Mode] {setting}
[localhost] {server}

# Production  
[Debug Mode] {-setting}   # Retract debug setting
[prod.example.com] {-server}  # Retract dev server
[prod.example.com] {server}   # Add prod server
```

**Merge Result:** Production configuration only.

### 5. Data Migration

Migrate data structures:

```markdown
# Old Schema {=ex:old}
[Person] {type}
[Alice] {name}

# New Schema {=ex:new}
[Person] {-type}          # Retract old type
[Human] {type}            # Add new type
[Alice] {-name}           # Retract old property
[Alice] {fullName}        # Add new property
```

**Merge Result:** Migrated data with new schema.

## Advanced Patterns

### 1. Chained Retractions

Build retraction chains for complex changes:

```markdown
# Article {=ex:article}

[Version 1] {title}
[Version 1] {-title}      # Retract v1
[Version 2] {title}       # Add v2
[Version 2] {-title}      # Retract v2
[Version 3] {title}       # Add v3
```

**Result:** Version 3 is title.

### 2. Selective Retraction

Retract specific values while preserving others:

```markdown
# Person {=ex:person}

[Alice] {name}
[25] {age ^^xsd:integer}
[Engineer] {occupation}

[25] {-age ^^xsd:integer}  # Retract only age
[26] {age ^^xsd:integer}  # Update age
```

**Result:** Alice, age 26, Engineer.

### 3. Polarity in Lists

Use polarity in list items:

```markdown
# Task List {=ex:tasks}

- [Task 1] {status}       # + assertion
- [Task 2] {-status}      # - retraction
- [Task 3] {status}       # + assertion
```

**Result:** Task 1 and Task 3 have status.

### 4. Block-Level Polarity

Apply polarity to block carriers:

```markdown
# Article {=ex:article}

> Alice Smith {author}    # + assertion
> Bob Jones {-author}     # - retraction
> Carol Davis {author}    # + assertion
```

**Result:** Carol is author.

## Implementation Details

### Conflict Resolution Rules

1. **Intra-document priority:** Negative cancels positive within same document
2. **External retract:** Negative without matching positive becomes retract
3. **Merge resolution:** Retracts remove matching quads from prior documents
4. **Final state:** Only non-retracted quads remain

### Performance Considerations

- **O(1) lookup:** Quad keys enable fast polarity matching
- **Streaming:** Polarity resolved during single-pass parsing
- **Memory efficient:** Retractions don't store full quad data
- **Deterministic:** Same input always produces same output

### Error Handling

```javascript
// Invalid polarity usage
try {
  const result = parse(`{-=ex:invalid}  # Invalid polarity on subject`);
} catch (error) {
  console.log('Polarity error:', error.message);
}

// Warning logged for invalid retractions
const result = parse(`# Doc {=ex:doc}
[NonExistent] {-property}`);  // Warning logged
```

## Best Practices

### 1. Use Explicit Polarity

```markdown
# ✅ Clear intent
[Alice] {+author}
[Bob] {-author}

# ✅ Also clear (default positive)
[Alice] {author}
[Bob] {-author}
```

### 2. Group Related Changes

```markdown
# ✅ Logical grouping
# Update author section
[Alice] {-author}
[Bob] {author}
[2024] {dateUpdated ^^xsd:date}
```

### 3. Document Intent

```markdown
# Migration: Remove old email format
[old@email.com] {-email}
[new@email.com] {email}
```

### 4. Test External Retractions

```javascript
// Verify external retractions
const result = parse(markdown);
if (result.remove.length > 0) {
  console.log('External retractions:', result.remove.length);
}
```

### 5. Use Merge for Resolution

```javascript
// Always use merge for multi-document scenarios
const final = merge([doc1, doc2, doc3]);
// Don't manually handle retractions
```

## API Reference

### Parse Results

```javascript
const result = parse(markdown);

console.log(result.quads);    // Final resolved quads
console.log(result.remove);   // External retractions
console.log(result.origin);   // Origin with polarity info
```

### Locate with Polarity

```javascript
const location = locate(quad, origin);
console.log(location.polarity);  // '+' or '-'
```

### Merge with Retractions

```javascript
const merged = merge([doc1, doc2]);
// Retractions in doc2 cancel matching quads in doc1
```

## Examples

### Complete Document Evolution

```markdown
# Article v1 {=ex:article}
[Alice] {author}
[Draft] {status}
[2024-01-01] {created ^^xsd:date}

# Article v2 {=ex:article}
[Alice] {-author}          # Retract original
[Bob] {author}             # New author
[Draft] {-status}          # Retract draft
[Published] {status}       # Published status
[2024-01-15] {updated ^^xsd:date}  # Update date
```

**Final State:**
```turtle
ex:article rdf:type ex:Article ;
    ex:author ex:bob ;
    ex:status ex:Published ;
    ex:created "2024-01-01"^^xsd:date ;
    ex:updated "2024-01-15"^^xsd:date .
```

### Collaborative Scenario

```markdown
# Shared Doc {=ex:doc}

# Alice's contribution
[Intro] {section}
[Alice] {author}

# Bob's contribution
[Intro] {-section}       # Retract Alice's intro
[Overview] {section}     # Bob's intro
[Alice] {-author}         # Retract Alice
[Bob] {author}            # Add Bob
[Alice] {+editor}         # Add Alice as editor
```

**Merge Result:** Bob is author, Alice is editor, Overview is section.

The polarity system provides **powerful, deterministic document evolution** capabilities that enable sophisticated collaborative editing and version control scenarios while maintaining the simplicity and readability of Markdown.
