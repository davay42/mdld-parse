# Polarity & Retraction System

MD-LD includes a **sophisticated polarity system** that enables diff authoring and document evolution through explicit `+` and `-` prefixes on predicates and types.

## Core Concepts

### Polarity Types

- **Positive (`+`)**: Default polarity, adds triples to the graph
- **Negative (`-`)**: Removes triples, either intra-document or external retractions

### Polarity Forms

| Form | Positive | Negative | Use Case |
|------|-----------|-----------|-----------|
| `p` | `{p}` | `{-p}` | Literal properties |
| `?p` | `{?p}` | `{-?p}` | Object properties |
| `!p` | `{!p}` | `{-!p}` | Reverse properties |
| `.Class` | `{.Class}` | `-.Class}` | Type declarations (subject only) |

### Resolution Behavior

- **Intra-document cancel**: When negative matches existing positive → both removed
- **External retract**: When negative has no matching positive → becomes external retract
- **Merge resolution**: External retractions cancel positives from prior documents

## Polarity Syntax Patterns

### 1. Literal Property Polarity (-p)

```markdown
[ex] <http://example.org/>

# Document {=ex:doc}

[Alice] {label}          // Add name
[Alice] {-label}         // Remove name (intra-document cancel)
[Bob] {label}            // Add Bob's name
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.object.value} ${q.predicate.value}`));
// ['Bob http://www.w3.org/2000/01/rdf-schema#label']
console.log(result.remove.length); // 0 (cancelled in-stream)
```

### 2. Object Property Polarity (-?p)

```markdown
[ex] <http://example.org/>

# Document {=ex:doc}

[Alice] {+ex:alice ?author}     // Alice is author
[Bob] {+ex:bob ?author}         // Bob is author  
[Bob] {-?author}                // Remove Bob as author
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value.split('/').pop()}`));
// ['doc author bob']
console.log(result.remove.length); // 0 (cancelled in-stream)
```

### 3. Reverse Property Polarity (-!p)

**Important**: Reverse properties need proper subject context and object declarations:

```markdown
[ex] <http://example.org/>

# Document

Parent: [Alice] {=ex:alice .prov:Person label}
Child: [Bob] {+ex:bob !ex:hasParent}

Child is not [Bob] {+ex:bob -!ex:hasParent}, it's [Bryan] {+ex:bryan !ex:hasParent}.
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value.split('/').pop()}`));
// ['alice rdf:type prov#Person', 'alice label Alice', 'bryan hasParent alice']
console.log(result.remove.length); // 0 (cancelled in-stream)
```

**Why this works:**
- `Parent: [Alice] {=ex:alice .prov:Person label}` - Creates Alice as Person with label
- `Child: [Bob] {+ex:bob !ex:hasParent}` - Creates Bob with reverse relationship to Alice
- `[Bob] {+ex:bob -!ex:hasParent}` - Retracts Bob's hasParent relationship
- `[Bryan] {+ex:bryan !ex:hasParent}` - Creates Bryan with reverse relationship to Alice

### 4. Type Polarity (-.Class)

Type retractions work both in subject declarations and as standalone annotations:

```markdown
[ex] <http://example.org/>

# Document
Parent: [Alice] {=ex:alice .prov:Person label}
is [employed] {.ex:Employee}
Child: [Bob] {+ex:bob !ex:hasParent}

Is no more an [Employee] {-.ex:Employee}, but a [unemployed] {.ex:Unemployed}.

The child is not [Bob] {+ex:bob -!ex:hasParent}, it's [Bryan] {+ex:bryan !ex:hasParent}.
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.subject.value.split('/').pop()} rdf:type ${q.object.value.split('/').pop()}`));
// ['alice rdf:type prov#Person', 'alice rdf:type Unemployed']
console.log(result.remove.length); // 0 (cancelled in-stream)
```

**Expected Turtle:**
```turtle
@prefix ex: <http://example.org/>.

ex:alice a prov:Person, ex:Unemployed;
    rdfs:label "Alice".
ex:bryan ex:hasParent ex:alice.
```

### 5. Mixed Polarity (Same Annotation)

Combine add and remove operations in single annotation:

```markdown
[ex] <http://example.org/>

# Document {=ex:doc -.ex:Draft .ex:Published -ex:version}
[2.0] {ex:version}
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['doc rdf:type http://example.org/Published', 'doc http://example.org/version 2.0']
console.log(result.remove.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['doc rdf:type http://example.org/Draft', 'doc http://example.org/version Document']
```

### 6. External Retract (No Matching Positive)

When removing non-existent triples, they become external retractions:

```markdown
[ex] <http://example.org/>

# Document {=ex:doc}

[Alice] {-author}         // External retract (no matching positive)
[Bob] {author}           // Add Bob as author
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.object.value} ${q.predicate.value}`));
// ['Bob http://www.w3.org/2000/01/rdf-schema#author']
console.log(result.remove.map(q => `${q.object.value} ${q.predicate.value}`));
// ['Alice http://www.w3.org/2000/01/rdf-schema#author']
```

## Real-World Workflows

### 1. Document Versioning

Track changes across document versions:

```markdown
[ex] <http://example.org/>

# Article v1 {=ex:article .ex:Article}
[Alice] {author}
[Draft] {status}

# Article v2 {=ex:article}
[Alice] {-author}        // Retract original author
[Bob] {author}          // Add new author
[Draft] {-status}       // Retract draft status
[Published] {status}    // Add published status
```

**Merge Result:**
```javascript
const merged = merge([v1, v2]);
console.log(merged.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['article rdf:type Article', 'article author Bob', 'article status Published']
```

### 2. Collaborative Editing

Multiple authors working simultaneously:

```markdown
[ex] <http://example.org/>

# Alice's changes
# Document {=ex:doc}
> Content A {section}
[Shared] {author}

# Bob's changes  
# Document {=ex:doc}
> Content A {-section}   // Retract Alice's content
> Content B {section}    // Add Bob's content
[Shared] {-author}       // Retract Alice's authorship
[Bob] {author}           // Add himself as author
```

**Merge Result:**
```javascript
const merged = merge([aliceDoc, bobDoc]);
console.log(merged.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['doc section Content B', 'doc author Bob']
```

### 3. Type Migration

Migrate data structures with controlled transitions:

```markdown
[ex] <http://example.org/>

# Old Schema
# Person {=ex:person .ex:Person}
[Alice] {name}

# New Schema  
# Person {=ex:person -.ex:Person .ex:Human}
[Alice] {-name}           // Retract old property
[Alice] {fullName}        // Add new property
```

**Merge Result:**
```javascript
const migrated = merge([oldSchema, newSchema]);
console.log(migrated.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['person rdf:type Human', 'person fullName Alice']
```

### 4. Environment Configuration

Manage environment-specific settings:

```markdown
[ex] <http://example.org/>

# Config {=ex:config}

# Development
[Debug Mode] {setting}
[localhost] {server}

# Production  
[Debug Mode] {-setting}   // Retract debug setting
[localhost] {-server}     // Retract dev server
[prod.example.com] {server}   // Add prod server
```

**Merge Result:**
```javascript
const configMerged = merge([devConfig, prodConfig]);
console.log(configMerged.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['config server prod.example.com']
```

### 5. Template Instantiation

Use templates with placeholder content:

```markdown
[ex] <http://example.org/>

# Template {=ex:template}
[Placeholder] {title}     // Template placeholder
[Draft] {status}

# Instance {=ex:instance}
[Placeholder] {-title}   // Retract placeholder
[Real Title] {title}     // Add real title
[Draft] {-status}        // Retract draft status
[Published] {status}     // Add published status
```

**Merge Result:**
```javascript
const instance = merge([template, instance]);
console.log(instance.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['instance title Real Title', 'instance status Published']
```

### 6. Data Cleanup

Clean up inconsistent data:

```markdown
[ex] <http://example.org/>

# Messy Data {=ex:data}
[Alice] {name}
[alice] {name}           // Duplicate with different case
[25] {age ^^xsd:integer}
[25] {age ^^xsd:string}   // Wrong datatype

# Cleaned Data {=ex:data}
[alice] {-name}           // Remove lowercase version
[25] {-age ^^xsd:string} // Remove wrong datatype
```

**Merge Result:**
```javascript
const cleaned = merge([messyData, cleanedData]);
console.log(cleaned.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value}`));
// ['data name Alice', 'data age 25^^xsd:integer']
```

## Advanced Patterns

### 1. Chained Retractions

Build retraction chains for complex changes:

```markdown
[ex] <http://example.org/>

# Article {=ex:article}

[Version 1] {title}
[Version 2] {title}
[Version 1] {-title}    // Remove V1
[Version 3] {title}
[Version 2] {-title}    // Remove V2
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.object.value} ${q.predicate.value}`));
// ['Version 3 http://www.w3.org/2000/01/rdf-schema#title']
```

### 2. Family Tree Management

Use reverse properties for family relationships:

```markdown
[ex] <http://example.org/>

# Family Tree

Parent: [John] {=ex:john .ex:Person}
Child: [Alice] {+ex:alice !ex:hasParent}
Child: [Bob] {+ex:bob !ex:hasParent}

# Update relationships
[Alice] {+ex:alice -!ex:hasParent}      // Remove Alice's parent link
[Bob] {+ex:bob -!ex:hasParent}       // Remove Bob's parent link
[Grandparent] {+ex:grandparent !ex:hasParent}  // Add grandparent
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value.split('/').pop()}`));
// ['john rdf:type Person', 'grandparent hasParent john']
```

### 3. Organizational Structure

Model company hierarchies with reverse properties:

```markdown
[org] <http://company.com/>

# Company Structure {=org:company}

CEO: [Jane] {+org:jane .org:Person}
Department: [Engineering] {+org:engineering !org:hasDepartment}
Team: [Platform] {+org:platform !org:hasTeam}

# Reorganization {=org:company}
[Engineering] {+org:engineering -!org:hasDepartment}  // Remove department link
[Platform] {+org:platform -!org:hasTeam}         // Remove team link
[Research] {+org:research !org:hasDepartment}  // New department
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.map(q => `${q.subject.value.split('/').pop()} ${q.predicate.value} ${q.object.value.split('/').pop()}`));
// ['jane rdf:type Person', 'research hasDepartment jane']
```

## Remove Quads System

The parser maintains two separate collections:

- **`quads`** - Final resolved graph state (what actually exists)
- **`remove`** - External retractions targeting prior document state

### Intra-Document Cancel

When positive and negative triples match exactly within the same document:

```markdown
[ex] <http://example.org/>

# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}
[Software Engineer] {-my:jobTitle}    // Cancels above
[Senior Software Engineer] {my:jobTitle}
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.length);    // 2 (type + final jobTitle)
console.log(result.remove.length);    // 0 (empty - no external retractions)
```

### External Retract

When negative triples don't find matching positives in the current document:

```markdown
[ex] <http://example.org/>

# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}    // No matching positive in current doc
[Senior Software Engineer] {my:jobTitle}
```

**Result:**
```javascript
const result = parse(markdown);
console.log(result.quads.length);    // 2 (type + Senior Software Engineer)
console.log(result.remove.length);    // 1 (Software Engineer retract)
```

### Merge Resolution

External retractions are resolved during document merging:

```javascript
import { merge } from 'mdld-parse';

const doc1 = `
[my] <tag:ex,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}`;

const doc2 = `
[my] <tag:ex,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}    // External retract
[Senior Software Engineer] {my:jobTitle}`;

const merged = merge([doc1, doc2]);
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

## Use Cases for Polarity

### 1. Document Versioning
```javascript
// v1: Original document
const v1 = parse(`[ex] <tag:ex,2026:>

# Article {=ex:article}
[Alice] {author}`);

// v2: Update with retraction
const v2 = parse(`
[ex] <tag:ex,2026:>
# Article {=ex:article}
[Alice] {-author}      // External retract
[Bob] {author}`);

// Merge to get final state
const final = merge([v1, v2]);
// Result: Bob is author, Alice removed
```

### 2. Collaborative Editing
```javascript
// Alice's changes
const alice = parse(`# Doc {=ex:doc}
> Content A {section}`);

// Bob's changes (retract Alice's content)
const bob = parse(`# Doc {=ex:doc}
> Content A {-section}   // External retract
> Content B {section}`);

// Resolve conflicts
const resolved = merge([alice, bob]);
// Result: Only Content B remains
```

### 3. Data Migration
```javascript
// Old schema
const old = parse(`
[ex] <tag:ex,2026:>
# Person {=ex:person}
[Employee] {ex:status}`);

// Migration script
const migration = parse(`
[ex] <tag:ex,2026:>
# Person {=ex:person}
[Employee] {-ex:status}     // Retract old status
[Staff] {ex:status}        // Add new status`);

const migrated = merge([old, migration]);
// Result: Status changed from Employee to Staff
```

## Performance Characteristics

- **O(1) lookup:** Quad keys enable fast cancel/retract detection
- **Streaming:** Remove detection during single-pass parsing
- **Memory efficient:** Remove quads stored separately from final state
- **Deterministic:** Same input always produces same quads/remove separation

## API Reference

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

## Best Practices

1. **Use external retractions for versioning** - Retract old versions in new documents
2. **Combine retractions in single annotation** - Batch related changes together
3. **Test merge behavior** - Verify that retractions work as expected
4. **Document intent** - Explain why retractions are needed
5. **Use type migration** - Change data structures safely with type retractions
6. **Ensure proper context** - Reverse properties need subject and object declarations

## Limitations

- **Exact SPO matching** - Only exact subject-predicate-object triples cancel
- **No partial retractions** - Can't retract based on patterns or conditions
- **Forward-reference constraint** - Retractions must reference previously declared items
- **Context requirements** - Reverse properties need proper subject context and object declarations
