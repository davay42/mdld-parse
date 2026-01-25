# MD-LD Data Model (Normative)

**Defines the abstract data structures and relationships that MD-LD documents represent**

---

## 1. Overview

MD-LD defines a **layered data model** that bridges Markdown documents with RDF graphs while maintaining structural correspondence for round-trip transformation.

The model consists of:
- **Document Layer** - Markdown structure with semantic annotations
- **Block Layer** - Semantic blocks with carriers and metadata
- **Graph Layer** - RDF quads with origin tracking
- **Slot Layer** - Precise positioning for serialization

---

## 2. Document Model

### 2.1 MD-LD Document

An MD-LD document is a hierarchical structure:

```
Document
├── Context Declarations
├── Blocks
│   ├── Heading Blocks
│   ├── List Blocks
│   ├── Blockquote Blocks
│   ├── Code Blocks
│   └── Paragraph Blocks
└── Inline Carriers (within blocks)
```

### 2.2 Document Properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Original Markdown content |
| `context` | Context | Active prefix/vocabulary mappings |
| `blocks` | Map<BlockId, Block> | All semantic blocks |
| `quadIndex` | Map<QuadKey, SlotInfo> | Quad-to-origin mapping |

---

## 3. Context Model

### 3.1 Context Object

```javascript
{
    "@vocab": "http://www.w3.org/2000/01/rdf-schema#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "sh": "http://www.w3.org/ns/shacl#",
    "prov": "http://www.w3.org/ns/prov#",
    // User-defined prefixes
    "ex": "http://example.org/",
    "wd": "https://www.wikidata.org/entity/"
}
```

### 3.2 Context Resolution

IRI expansion follows JSON-LD rules:
1. **Vocabulary expansion** - unprefixed terms use `@vocab`
2. **Prefix expansion** - `prefix:local` → `prefix + local`
3. **Absolute IRIs** - passed through unchanged

---

## 4. Block Model

### 4.1 Block Structure

A block represents a semantic annotation with its carrier:

```javascript
{
    id: "hash-signature",
    range: { start: 100, end: 150 },
    attrsRange: { start: 120, end: 145 },
    valueRange: { start: 100, end: 115 },
    carrierType: "link",
    subject: "http://example.org/entity",
    types: ["http://schema.org/Person"],
    predicates: [
        { iri: "http://schema.org/name", form: "" },
        { iri: "http://schema.org/url", form: "?" }
    ],
    entries: [],
    context: { ... }
}
```

### 4.2 Block Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | String | ✓ | Stable hash signature |
| `range` | Range | ✓ | Full annotation span |
| `attrsRange` | Range | ✓ | `{...}` block span |
| `valueRange` | Range | ✓ | Carrier text span |
| `carrierType` | String | ✓ | Type of value carrier |
| `subject` | IRI | ✓ | Current subject IRI |
| `types` | Array<IRI> | ✓ | RDF types |
| `predicates` | Array<Predicate> | ✓ | Predicate declarations |
| `entries` | Array<Entry> | ✓ | Individual entries |
| `context` | Context | ✓ | Active context |

### 4.3 Predicate Object

```javascript
{
    iri: "http://schema.org/name",
    form: "",        // "", "?", or "!"
    entryIndex: 0    // Position in block
}
```

### 4.4 Entry Object

```javascript
{
    type: "pred",    // "pred" or "type"
    token: "name",   // Original token text
    expandedPredicate: "http://schema.org/name",
    form: "",        // Predicate form
    entryIndex: 0    // Position in block
}
```

---

## 5. Carrier Model

### 5.1 Carrier Types

| Type | Markdown Pattern | Text Source | Object Source |
|------|-----------------|-------------|---------------|
| `emphasis` | `*text*` or `_text_` | Emphasized text | None |
| `strong` | `**text**` or `__text__` | Strong text | None |
| `code` | `` `text` `` | Code text | None |
| `link` | `[text](url)` | Link text | URL |
| `image` | `![alt](url)` | Alt text | URL |
| `heading` | `# text` | Heading text | None |
| `list` | `- text` | Item text | None |
| `blockquote` | `> text` | Quote text | None |
| `code-fence` | ```lang | Full content | None |

### 5.2 Carrier Properties

```javascript
{
    type: "link",
    text: "NASA",
    url: "https://nasa.gov",
    range: { start: 100, end: 125 },
    attrsRange: { start: 126, end: 140 },
    valueRange: { start: 100, end: 104 }
}
```

---

## 6. Graph Model

### 6.1 Quad Structure

MD-LD produces standard RDF/JS quads:

```javascript
{
    subject: { termType: "NamedNode", value: "http://example.org/entity" },
    predicate: { termType: "NamedNode", value: "http://schema.org/name" },
    object: { termType: "Literal", value: "Example", language: "en" },
    graph: { termType: "DefaultGraph" }
}
```

### 6.2 Quad Generation Rules

#### Type Triples
```javascript
// From {.Person .Astronaut}
{
    subject: currentSubject,
    predicate: { termType: "NamedNode", value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
    object: { termType: "NamedNode", value: "http://schema.org/Person" }
}
```

#### Literal Predicates (form: "")
```javascript
// From {name}
{
    subject: currentSubject,
    predicate: { termType: "NamedNode", value: "http://schema.org/name" },
    object: { termType: "Literal", value: carrierText }
}
```

#### Object Predicates (form: "?")
```javascript
// From {?website}
{
    subject: currentSubject,
    predicate: { termType: "NamedNode", value: "http://schema.org/website" },
    object: { termType: "NamedNode", value: carrierUrl }
}
```

#### Reverse Predicates (form: "!")
```javascript
// From {!hasPart}
{
    subject: { termType: "NamedNode", value: carrierUrl },
    predicate: { termType: "NamedNode", value: "http://schema.org/hasPart" },
    object: currentSubject
}
```

---

## 7. Slot Model

### 7.1 Slot Information

Each quad is associated with precise positioning information:

```javascript
{
    blockId: "hash-signature",
    entryIndex: 0,
    kind: "pred",        // "pred" or "type"
    token: "name",       // Original token
    form: "",            // Predicate form
    expandedPredicate: "http://schema.org/name",
    subject: { termType: "NamedNode", value: "..." },
    predicate: { termType: "NamedNode", value: "..." },
    object: { termType: "Literal", value: "..." }
}
```

### 7.2 Slot Indexing

Quads are indexed by their content for fast lookup:

```javascript
const quadKey = `${subject.value}|${predicate.value}|${object.value}`;
quadIndex.set(quadKey, slotInfo);
```

---

## 8. List Model

### 8.1 List Stack

Nested lists are managed with a stack:

```javascript
[
    {
        indent: 0,
        anchorSubject: "http://example.org/recipe",
        contextSubject: "http://example.org/recipe",
        contextSem: {
            predicates: [{ iri: "http://schema.org/hasIngredient", form: "?" }],
            types: [{ iri: "http://schema.org/Ingredient" }]
        }
    },
    {
        indent: 2,
        anchorSubject: "http://example.org/flour",
        contextSubject: "http://example.org/flour",
        contextSem: null
    }
]
```

### 8.2 List Context Application

List context applies to items at the same indentation level:

1. **Header detection** - Parse preceding paragraph for semantic context
2. **Scope establishment** - Create list stack frame
3. **Item processing** - Apply context to each item
4. **Nesting reset** - New indentation level creates fresh context

---

## 9. Fragment Model

### 9.1 Fragment Resolution

Fragments are resolved relative to the current subject base:

```javascript
// Current subject: http://example.org/document
// Fragment: {=#section}
// Result: http://example.org/document#section
```

### 9.2 Fragment Rules

- **Requires subject** - Fragment needs existing current subject
- **Replaces existing** - New fragment replaces any previous fragment
- **Relative resolution** - Uses base IRI before any existing fragment

---

## 10. Object Model

### 10.1 Object Types

MD-LD supports two object types:

#### Soft Objects (temporary)
```javascript
// From {+ex:related ?schema:isRelatedTo}
{
    type: "soft",
    iri: "http://example.org/related",
    scope: "block"  // Only exists within current annotation
}
```

#### Soft Fragments (temporary)
```javascript
// From {+#section ?hasPart}
{
    type: "soft-fragment",
    fragment: "section",
    base: "http://example.org/current-subject",
    scope: "block"
}
```

### 10.2 Object Resolution

Objects are resolved at annotation processing time:
1. **Expand IRI** using current context
2. **Resolve fragments** relative to current subject base
3. **Create named nodes** for RDF graph

---

## 11. Literal Model

### 11.1 Literal Types

```javascript
// Plain literal
{ termType: "Literal", value: "text" }

// Typed literal
{ termType: "Literal", value: "1969", datatype: { termType: "NamedNode", value: "http://www.w3.org/2001/XMLSchema#gYear" } }

// Language-tagged literal
{ termType: "Literal", value: "text", language: "en" }
```

### 11.2 Literal Creation

Literals are created from carrier text:
- **Source** - Always from value carrier text
- **Default type** - `xsd:string` if not specified
- **Mutual exclusion** - Either datatype OR language, never both

---

## 12. Origin Model

### 12.1 Origin Object

```javascript
{
    blocks: Map<BlockId, Block>,
    quadIndex: Map<QuadKey, SlotInfo>
}
```

### 12.2 Round-Trip Mapping

The origin model enables bidirectional transformation:

1. **MD-LD → RDF**: Parse document, create quads, store origin
2. **RDF → MD-LD**: Use origin to position quads back into document
3. **Diff application**: Add/remove quads while preserving structure

---

## 13. Validation Model

### 13.1 Well-Formedness Criteria

A document is well-formed if:
- All `{...}` blocks have balanced braces
- All prefixes are declared before use
- All IRIs are syntactically valid
- All carriers are valid Markdown elements

### 13.2 Semantic Validation

Semantic validation checks:
- Subject exists before predicate use
- Object resources are available for `?` predicates
- Fragment subjects have base subjects
- List context is properly scoped

---

## 14. Serialization Model

### 14.1 Serialization Units

The smallest serialization unit is a **slot**:

```javascript
{
    position: { start: 100, end: 120 },
    content: "{name}",
    type: "predicate",
    quad: { subject, predicate, object }
}
```

### 14.2 Serialization Rules

1. **Preserve order** - Maintain original token order
2. **Compact form** - Use shortest possible IRI representation
3. **Whitespace preservation** - Maintain original spacing
4. **Vacant slot reuse** - Reuse positions when possible

---

## 15. Implementation Requirements

Conformant MD-LD implementations MUST:

1. **Maintain block identity** through stable hash signatures
2. **Track quad origins** for round-trip serialization
3. **Support list nesting** with proper scope management
4. **Handle all predicate forms** correctly
5. **Provide context resolution** following JSON-LD rules
6. **Support fragment resolution** relative to current subject
7. **Maintain carrier metadata** for accurate serialization

Implementations SHOULD:
- Cache parsed semantic blocks for performance
- Provide validation diagnostics
- Support streaming interfaces
- Optimize memory usage for large documents

---

This data model provides the foundation for reliable MD-LD processing, ensuring that documents can be parsed, transformed, and serialized while maintaining complete correspondence between the Markdown structure and the resulting RDF graph.
