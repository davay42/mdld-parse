# Primary Metadata Example

This example demonstrates the Primary Metadata feature in MD-LD, which provides immediate access to the main entity, type, and label described by a document.

## Primary Metadata Trio

MD-LD tracks three primary metadata fields during parsing to provide immediate document identity:

| Field | Source | Purpose |
|-------|--------|---------|
| **primarySubject** | First non-fragment `{=subject}` | Document identity |
| **primaryType** | First `.Class` declaration | Document category |
| **primaryLabel** | First `{label}` literal | Human-readable name |

## What is a Primary Subject?

The Primary Subject is the first non-fragment subject declaration (`{=IRI}`) in a document. It provides a deterministic way to identify the central focus of a document.

## What is a Primary Type?

The Primary Type is the first `rdf:type` declaration associated with the Primary Subject. It provides a way to identify the type of the main entity described by a document.

## What is a Primary Label?

The Primary Label is the first `rdfs:label` literal associated with the Primary Subject. It provides a human-readable name for the main entity described by a document.

## Example Document

```markdown
[ex] <http://example.org/>

# Article {=ex:article .schema:Article label}
[Understanding Primary Subjects] {schema:headline}

## Author {=ex:author .schema:Person}
[Alice Smith] {schema:name}
[alice@example.com] {schema:email}

## Abstract
This article explains the Primary Subject concept in MD-LD, which allows applications to quickly identify the main entity described by a document.
```

## Parsing with Primary Metadata

```javascript
import { parse } from 'mdld-parse';

const md = `[ex] <tag:alice@example.org,2026:articles/>
[schema] <http://schema.org/>

# Understanding Primary Subjects {=ex:understanding-primary-subject .schema:Article label}
`;

const result = parse({ text: md });

console.log('Primary Subject:', result.primarySubject);
console.log('Primary Type:', result.primaryType);
console.log('Primary Label:', result.primaryLabel);
// Output:
// Primary Subject: tag:alice@example.org,2026:articles/understanding-primary-subject
// Primary Type: http://schema.org/Article
// Primary Label: Understanding Primary Subjects
```

## Key Behaviors

### 1. First Non-Fragment Subject Wins

```markdown
{=#summary}  // Fragment - NOT primary
[Summary] {label}

# Document {=ex:doc}  // First non-fragment - PRIMARY
[Alice] {author}
```

Primary subject: `ex:doc`

### 2. Reset Does Not Clear Primary Subject

```markdown
# First {=ex:first}
[Value] {label}

# Reset {=}  // Does not clear primary subject

# Second {=ex:second}
[Value] {label}
```

Primary subject: `ex:first` (fixed once detected)

### 3. No Subject Means No Primary

```markdown
[Just text] {label}
```

Primary subject: `null`

## Merge with Primary Subjects

When merging multiple documents, the `merge()` function returns an array of all primary subjects in merge order:

```javascript
import { merge } from 'mdld-parse';

const doc1 = `[ex] <http://example.org/>
# Document 1 {=ex:doc1}
[Content] {label}`;

const doc2 = `[ex] <http://example.org/>
# Document 2 {=ex:doc2}
[Content] {label}`;

const result = merge([doc1, doc2], { context: { ex: 'http://example.org/' } });

console.log(result.primarySubjects.map(s => s.value));
// Output: ['http://example.org/doc1', 'http://example.org/doc2']
```

## Use Cases

- **Document Identity** - Primary subject + type + label provide complete document fingerprint
- **Stream Addressing** - Perfect for Nostr tags and distributed systems
- **Merge Tracking** - Track which entities are being merged across documents
- **UI Navigation** - Provide default focus and display information for document viewers
- **Query Optimization** - Use primary metadata as default query context and filters
- **Content Classification** - Automatic categorization based on primary type
- **Search Indexing** - Use primary label for human-readable search results

## RDF Philosophy Alignment

The Primary Subject feature aligns with core W3C/RDF principles:

### Document Identity
RDF 1.1 Named Graphs recognize the importance of document-centric RDF. Primary Subject makes document identity explicit without forcing graph-centric assumptions, supporting the document-centric approach (FOAF profiles, RSS feeds) that's part of the Linked Data ecosystem.

### Provenance Tracking (PROV-O)
The W3C PROV-O standard emphasizes tracking data origin. Primary Subject provides a deterministic way to identify what a document is "about," which is foundational for provenance chains and attribution.

### Dereferenceability
Linked Data principles emphasize that IRIs should be dereferenceable. Having a clear primary subject makes it immediately clear what IRI to dereference when encountering a document, supporting the "follow your nose" navigation pattern.

### Minimal Commitment
RDF's philosophy is about making minimal assertions. Primary Subject is lightweight metadata - it doesn't add triples to the graph, just provides a pointer to the main subject. This aligns with MDLD's "no implicit semantics" principle.

### Explicit over Implicit
The W3C encourages explicit semantics over inference. Primary Subject makes document focus explicit rather than requiring heuristic analysis of the graph to determine "what this document is about."

## Grounded Documents: Long-Term Benefits

Primary Subject enables a new class of semantic applications that treat documents as meaningful units in knowledge workflows:

### Document-Centric Knowledge Graphs
- Citation networks with clear document identity
- Document versioning and evolution tracking
- Cross-document referencing and linking
- Entity-focused provenance chains

### Semantic Search and Discovery
- Index documents by their main entity
- Support queries like "find all documents about X" without complex graph pattern matching
- Entity-based relevance scoring

### Incremental Graph Construction
- Determine which documents describe the same entity (deduplication)
- Smart merge order and priority decisions
- Conflict resolution strategies based on entity overlap
- Graph topology construction guidance

### Collaborative Semantic Editing
- Track which entities are being modified across authors
- Coordinate concurrent edits at entity level
- Detect merge conflicts at entity granularity
- Provide contextual editing assistance

### Semantic Version Control
- Entity-level version tracking within document systems
- Queries like "show me how entity X has changed across versions"
- Entity-focused diff and merge operations
- Granular change attribution

### Knowledge Graph Federation
- Identify overlapping entities across different sources
- Determine authoritative sources for specific entities
- Build confidence scores based on document provenance
- Source-aware query planning

### AI/LLM Integration
- Primary subject provides clear context for document understanding
- Entity-focused prompt engineering
- Document retrieval by entity relevance
- Improved fact-checking and attribution

The Primary Subject feature bridges document-centric and graph-centric approaches, enabling semantic applications that treat documents as first-class citizens in knowledge workflows while respecting RDF's core principles of explicit semantics and minimal commitment.

## Complete Example

```javascript
import { parse, merge } from 'mdld-parse';

// Single document
const doc1 = `[blog] <https://example.com/blog/>
# My First Post {=blog:post1 .schema:BlogPosting label}
[Hello World] {schema:headline}`;

const result1 = parse({ text: doc1, context: { blog: 'https://example.com/blog/', schema: 'http://schema.org/' } });
console.log('Primary Subject:', result1.primarySubject);
console.log('Primary Type:', result1.primaryType);
console.log('Primary Label:', result1.primaryLabel);
// Output:
// Primary Subject: https://example.com/blog/post1
// Primary Type: http://schema.org/BlogPosting
// Primary Label: My First Post

// Multiple documents
const doc2 = `[blog] <https://example.com/blog/>
# My Second Post {=blog:post2 .schema:BlogPosting label}
[Hello Again] {schema:headline}`;

const merged = merge([doc1, doc2], { context: { blog: 'https://example.com/blog/', schema: 'http://schema.org/' } });

console.log('Primary subjects:', merged.primarySubjects);
// Output: ['https://example.com/blog/post1', 'https://example.com/blog/post2']
```

## Document Identity Trio

The primary metadata trio provides sufficient document/append stream identity for most scenarios:

```javascript
// Nostr integration example
const nostrTags = [
    ['s', result.primarySubject],  // subject addressing
    ['t', result.primaryType],     // type filtering  
    ['d', result.primaryLabel]      // display identifier
];

// Document fingerprint
const fingerprint = {
    subject: result.primarySubject,    // What the document is about
    type: result.primaryType,          // What kind of document
    label: result.primaryLabel         // Human-readable name
};
```

## Specification

For complete details on Primary Subject semantics, see the [MD-LD Specification](../spec/Spec.md#17-primary-subject).
