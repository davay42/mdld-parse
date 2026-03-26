# Elevated Statements

MD-LD provides **elevated statements** through automatic `rdf:Statement` pattern detection, enabling authors to create a "golden graph" of intentionally elevated statements while maintaining complete provenance in the underlying data.

## 🎯 Concept Overview

Elevated statements allow you to:
- **Separate signal from noise** - Dashboard apps can use only the elevated statements
- **Maintain provenance** - Complete context remains available in the full graph
- **Single-pass parsing** - No performance overhead, detected during normal parsing
- **Flexible patterns** - Support both IRI references and direct literals

## 📋 Pattern Requirements

For a statement to be elevated, it must have:
1. **rdf:type rdf:Statement** - The subject must be typed as an RDF Statement
2. **rdf:subject** - The subject of the elevated SPO triple
3. **rdf:predicate** - The predicate of the elevated SPO triple  
4. **rdf:object** - The object of the elevated SPO triple

When all four parts are present, the parser automatically creates an elevated SPO quad in the `statements` array.

## 🔧 Syntax Patterns

### Basic Pattern with IRIs

```markdown
[ex] <http://example.org/>

## Elevated statement {=ex:stmt1 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *knows* {+ex:knows ?rdf:predicate} **Bob** {+ex:bob ?rdf:object}

**Alice** {=ex:alice} knows **Bob** {?ex:knows +ex:bob} - direct statement
```

### Pattern with Direct Literals

For datatypes and language tags, use direct literals:

```markdown
[ex] <http://example.org/>

## Statement with datatype {=ex:stmt1 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *has age* {+ex:hasAge ?rdf:predicate} **25** {rdf:object ^^xsd:integer}

## Statement with language {=ex:stmt2 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *has name* {+ex:hasName ?rdf:predicate} **Alice** {rdf:object @en}
```

### Real-World Example

```markdown
[my] <tag:alice@example.com,2026:>
[foaf] <http://xmlns.com/foaf/0.1/>

My name is **Alice** {=my:Alice .foaf:Person foaf:name}.

{=}

Today I have learned that my colleague name is [Clair] {=my:Claire .foaf:Person foaf:name}

## I know Claire's name {=my:claire-name .rdf:Statement} 

[My colleague] {+my:Claire ?rdf:subject} [name] {+foaf:name ?rdf:predicate} is [Clair] {rdf:object}.

{=}

## We've talked! {=my:claire-first-talk .rdf:Statement}

Today [I] {+my:Alice ?rdf:subject} came to office a bit earlier and [talked for some time] {+foaf:knows ?rdf:predicate} with [Claire] {+my:Claire ?rdf:object}.

Now **I** {=my:Alice} know **Claire** {+my:Claire ?foaf:knows}.
```

## 🚀 Usage in Applications

### API Access

```javascript
import { parse } from 'mdld-parse';

const result = parse(markdown);
console.log(result.quads);     // All quads including provenance
console.log(result.statements); // Only elevated SPO quads
```

### Dashboard Applications

Dashboard applications can:

- **Ignore provenance-rich data** by using only `result.statements`
- **Access the "golden graph"** of intentionally elevated statements
- **Maintain complete provenance** in `result.quads` when needed
- **Filter by context** using the origin tracking system

### Example: Simple Graph Display

```javascript
import { parse } from 'mdld-parse';

function displayElevatedGraph(markdown) {
    const result = parse(markdown);
    
    // Display only elevated statements
    result.statements.forEach(quad => {
        console.log(`${quad.subject.value} → ${quad.predicate.value} → ${quad.object.value}`);
    });
    
    return result.statements.length; // Number of elevated statements
}
```

## 📊 Data Flow

```
MD-LD Document
    ↓ (single-pass parsing)
All Quads + Elevated Statements
    ↓
┌─────────────────┬─────────────────┐
│   result.quads  │result.statements│
│  (provenance)   │  (golden graph) │
└─────────────────┴─────────────────┘
```

## 🎨 Best Practices

### 1. Use Descriptive Statement IDs

```markdown
## Alice knows Bob {=ex:alice-knows-bob .rdf:Statement}
```

### 2. Preserve Datatypes and Languages

```markdown
## Person's birth date {=ex:birth-date .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *born on* {+ex:bornOn ?rdf:predicate} **1990-01-01** {rdf:object ^^xsd:date}
```

### 3. Mix Elevated and Regular Statements

```markdown
## Elevated: Important fact {=ex:important .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *knows* {+ex:knows ?rdf:predicate} **Bob** {+ex:bob ?rdf:object}

**Alice** {=ex:alice} also knows **Charlie** {?ex:knows +ex:charlie} - regular statement
```

### 4. Use Subject Resets for Organization

```markdown
{=}

## New section {=ex:section-stmt .rdf:Statement}
**Fact** {+ex:fact ?rdf:subject} *has value* {+ex:hasValue ?rdf:predicate} **42** {rdf:object ^^xsd:integer}
```

## 🔍 Technical Details

### Single-Pass Detection

Elevated statements are detected during the normal parsing process:

1. **Quad emission** - As each quad is created, the pattern detector runs
2. **Candidate tracking** - Incomplete patterns are tracked in memory
3. **Pattern completion** - When all parts are present, elevated SPO is created
4. **Cleanup** - Completed patterns are removed from tracking

### Memory Efficiency

- **O(1) additional memory** - Only tracks incomplete patterns
- **Automatic cleanup** - Completed patterns are removed immediately
- **No backtracking** - True single-pass processing

### Compatibility

- **RDF/JS compliant** - Elevated statements are standard RDF quads
- **Toolchain compatible** - Works with n3.js, rdflib, and other RDF libraries
- **Streaming friendly** - No additional passes required

## 📝 Comparison with Alternatives

| Approach | Provenance | Performance | Flexibility | Complexity |
|----------|------------|-------------|-------------|------------|
| **Elevated Statements** | ✅ Complete | ✅ Single-pass | ✅ High | 🟡 Medium |
| **Named Graphs** | ✅ Complete | ⚡ Multiple passes | 🟡 Medium | 🔴 High |
| **Manual Filtering** | ✅ Complete | ✅ Single-pass | 🔴 Low | 🟢 Low |
| **Separate Documents** | ❌ Lost | ✅ Single-pass | 🔴 Low | 🟢 Low |

## 🎯 Use Cases

### Knowledge Management
- Elevate important facts while preserving context
- Create "golden graph" for search and discovery
- Maintain full provenance for audit trails

### API Design
- Provide simplified endpoints with elevated statements only
- Offer detailed endpoints with full provenance
- Enable progressive disclosure of information

### Content Management
- Separate published content from editorial metadata
- Create curated views while preserving edits
- Support content approval workflows

### Data Integration
- Elevate validated mappings while preserving transformation rules
- Create clean integration graphs with full audit trails
- Support data lineage and governance

## 🧪 Testing

The elevated statements feature is covered by comprehensive tests:

```bash
npm test  # All 105 tests pass, including elevated statements
```

Test coverage includes:
- Basic pattern detection
- Multiple elevated statements
- Incomplete patterns (ignored)
- Mixed content scenarios
- Datatype and language preservation
