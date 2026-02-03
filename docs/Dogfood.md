[mdld] <https://mdld.js.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>
[my] <tag:mdld@example.com,2026:>
[ex] <my:example:>

# MD-LD: Complete Syntax Specification {=mdld:dogfood .Class label}

> MD-LD is a **semantic annotation layer** for CommonMark Markdown that creates RDF knowledge graphs from explicit `{...}` annotations. {mdld:dogfood comment}

## Default Context {=mdld:default-context .Class label}

MD-LD provides these built-in prefixes and vocabulary:

Default vocabulary and prefixes: {mdld:includes .Class label}
- `@vocab`: `http://www.w3.org/2000/01/rdf-schema#` {=mdld:vocab}
- `rdf`: `http://www.w3.org/1999/02/22-rdf-syntax-ns#` {=mdld:rdf-prefix}
- `rdfs`: `http://www.w3.org/2000/01/rdf-schema#` {=mdld:rdfs-prefix}
- `xsd`: `http://www.w3.org/2001/XMLSchema#` {=mdld:xsd-prefix}
- `sh`: `http://www.w3.org/ns/shacl#` {=mdld:sh-prefix}
- `prov`: `http://www.w3.org/ns/prov#` {=mdld:prov-prefix}

## Prefix Folding {=mdld:prefix-folding .Class label}

MD-LD supports hierarchical namespace building through prefix folding:

Base namespace declaration:
- `[my] <tag:mdld@example.com,2026:>` {=mdld:base-namespace}

Derived namespaces using CURIE syntax:
- `[ex] <my:example:>` {=mdld:derived-namespace}

This resolves to: `tag:mdld@example.com,2026:example:`

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- Circular references are treated as literal strings
- Later declarations override earlier ones

**Examples:**
- `ex:doc` → `tag:mdld@example.com,2026:example:doc`
- `my:journal:2026-01-27` → `tag:mdld@example.com,2026:journal:2026-01-27`

### Prefix Folding Examples
Demonstrated namespaces: {?mdld:includes .Class label}
- Document: [Example doc] {=ex:doc .Class label}
- Feature: [Example feature] {=ex:feature .Class label}
- Parser: [Example parser] {=ex:parser .Class label}

## Angle-Bracket URLs {=mdld:angle-urls .Class label}

MD-LD supports angle-bracket URLs as value carriers with soft subject behavior:

### URL Value Carriers
External resources as soft subjects:
- <https://www.w3.org/TR/rdf11-concepts/> {.Specification label}
- <https://github.com/mdld-js/mdld-parse> {?mdld:implementation .Repository label}
- <https://arxiv.org/abs/2301.07041> {!mdld:cites .Paper label}

### URL Behavior Rules
Angle-bracket URLs follow these rules:
- Type declarations use URL as subject: `<URL> {.Type}`
- Object predicates use current subject: `<URL> {?predicate}`
- Reverse predicates use URL as subject: `<URL> {!predicate}`
- Literal predicates are ignored: `<URL> {literal}` (no output)

## Core Classes {=mdld:classes .Class label}

All classes used in this document: {seeAlso Class label}

- Document {=mdld:Document}
- Concept {=mdld:Concept}
- Resource {=mdld:Resource}
- Principle {=mdld:Principle}
- Feature {=mdld:Feature}
- Layer {=mdld:Layer}
- Component {=mdld:Component}
- Software {=mdld:Software}

## Parser Architecture {=mdld:parser-arch .Class label}

### Tokenization Phase
The parser processes documents in a single pass with these token types: {mdld:includes .Class label}

Token types created during scanning:
- `prefix` - Context declarations `[name] <IRI>`
- `heading` - Markdown headings `# text {attrs}`
- `list` - List items `- text {attrs}` or `1. text {attrs}`
- `blockquote` - Blockquotes `> text {attrs}`
- `code` - Code blocks with annotations
- `para` - Paragraphs with potential inline carriers

### Processing Pipeline
Document processing follows this pipeline: {mdld:includes .Class label}
1. **Line-by-line scanning** {=#line-by-line} - Sequential token creation
2. **Context resolution** {=#context-resolution} - Prefix and vocabulary expansion
3. **Subject tracking** {=#subject-tracking} - Current subject management
4. **Annotation processing** {=#annotation-processing} - Semantic block evaluation
5. **Quad emission** {=#quad-emission} - RDF triple generation

### Semantic Block Processing
Annotations are parsed using cached semantic blocks: {mdld:includes .Class label}
- Parse `{...}` blocks into structured semantic objects
- Cache frequently used patterns for performance
- Extract subjects, predicates, types, and modifiers
- Handle all three predicate forms (`p`, `?p`, `!p`)

## Context Declarations {=mdld:context .Class label}

MD-LD supports prefix and vocabulary declarations following JSON-LD patterns:

Prefix declarations: {?mdld:seeAlso .Class label}
- `[mdld] <https://mdld.js.org/>` {=mdld:prefix}
- `[xsd] <http://www.w3.org/2001/XMLSchema#>` {=mdld:xsd}
- `[@vocab] <http://www.w3.org/2000/01/rdf-schema#>` {=mdld:vocab}

## Core Principles {=mdld:principles .Class label}

MD-LD follows strict rules: 

**Markdown-preserving** {=#markdown-preserving ?mdld:includes label} - Remove `{...}` → valid Markdown
**Explicit only** {=#explicit-only ?mdld:includes label} - No implicit semantics or guessing
**Single-pass** {=#single-pass ?mdld:includes label} - Streaming-friendly processing
**Deterministic** {=#deterministic ?mdld:includes label} - Same input → same output
**Traceable** {=#traceable ?mdld:includes label} - Every fact traces to its source

## Subject Management {=mdld:subjects .Class label}

### Full IRI Subjects
[Document with full IRI] {=mdld:doc-full .Class label} demonstrates persistent subjects

### Fragment Subjects  
[Section with fragment] {=#fragment-example .Class label} creates relative identifiers

### Subject Reset
[{=}] {=mdld:reset label} shows subject clearing

### Temporary Objects
[Related concept] {+mdld:temporary mdld:seeAlso label} demonstrates block-scoped objects

### Soft Fragments
[Soft fragment example] {+#soft-fragment ?seeAlso label} demonstrates temporary fragments

**Use cases:**
- `[Related Item] {+ex:related ?schema:isRelatedTo}` - Links to a local fragment
- `[Parent] {+ex:parent !schema:hasPart}` - Reverse relationship  
- `[Section] {+#section1 name ?hasPart}` - Object property with fragment

The soft IRI only exists within the current annotation block.

## Value Carriers {=mdld:carriers .Class label}

### Inline Elements
**Inline elements:** [*italic*] {+mdld:italic mdld:seeAlso} [**bold**] {+mdld:bold mdld:seeAlso} [`code`] {+mdld:code mdld:seeAlso}

### Block Elements
**Block elements:** # [Headings] {+mdld:heading mdld:seeAlso} > [Quotes] {+mdld:quote mdld:seeAlso}

### Links and Media
**Links:** [MD-LD Website](https://mdld.js.org) {+mdld:link mdld:seeAlso}
**Images:** ![Logo](https://mdld.js.org/logo.png) {+mdld:image mdld:seeAlso}

## Predicate Forms {=mdld:predicates .Class label}

Three predicate directions create different relationships:

- **Subject→Literal**: [MD-LD] {label} creates `mdld:doc label "MD-LD"`
- **Subject→Object**: [RDF](https://www.w3.org/RDF) {mdld:seeAlso} creates `mdld:doc rdfs:seeAlso <https://www.w3.org/RDF>`
- **Object→Subject**: [Example] {mdld:isDefinedBy} creates `mdld:example mdld:isDefinedBy mdld:doc`

## Type Declarations {=mdld:types .Class label}

### Single Types
[Single type example] {=mdld:single Class label}

### Multiple Types
[Multiple types example] {=mdld:multiple Class Class1 label}

## Literal Modifiers {=mdld:literals .Class label}

### Typed Literals
[2024] {+mdld:year mdld:seeAlso ^^xsd:gYear}
[3.14159] {+mdld:pi mdld:seeAlso ^^xsd:decimal}
[true] {+mdld:bool mdld:seeAlso ^^xsd:boolean}

### Language-Tagged Literals
[Hello] {+mdld:english mdld:seeAlso @en}
[Bonjour] {+mdld:french mdld:seeAlso @fr}
[Hola] {+mdld:spanish mdld:seeAlso @es}

## Lists and Nesting {=mdld:lists .Class label}

### List Item Policy: Single-Value Block Carriers

**Critical Rule**: All list items must have explicit subject (`{=iri}` or `{+iri}`) to participate in list context. Items without subjects are excluded from semantic relationships.

### Simple Lists
Research team members: {?mdld:includes .mdld:Role label}
- Principal investigator {=#pi}
- Research assistant {=#assistant} 
- Lab technician {=#techl}

### Nested Lists {=#nested .Class label}

Analysis project: {?mdld:includes .mdld:Task label}
- Sample preparation {=#prep}
  Preparation steps: {?mdld:includes .mdld:Task label}
  - Weigh materials {=#weigh}
  - Mix reagents {=#mix}
- Data collection {=#collection}
  Collection steps: {?mdld:includes .mdld:Task label}
  - Run instrument {=#instrument}
  - Record measurements {=#record}

## Code Blocks {=mdld:code-blocks .Class label}

### Annotated Code Blocks
```javascript {=mdld:example-code Class text}
console.log("MD-LD creates RDF from Markdown");
```

### Parser Implementation Examples
```javascript {=mdld:parser-code .Class text}
// Token scanning implementation
function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    // Process each line for tokens...
}
```

### EBNF Grammar Examples
```ebnf {=mdld:ebnf-grammar .Class text}
attrsBlock = "{" , whitespace* , attrsTokens? , whitespace* , "}" ;
attrsTokens = attrsToken , { whitespace+ , attrsToken } ;
```

This *JavaScript* {=mdld:js label} code shows annotation syntax.

## Blockquotes {=mdld:blockquote .Class label}

> Blockquotes serve as carriers for normative statements and comments. {mdld:blockquote comment}

> **Important**: All semantics must be explicit - no implicit inference. {mdld:normative comment}

> **Parser Note**: The implementation uses token-based scanning, not AST building. {mdld:parser-note comment}

## Advanced Features {=mdld:advanced .Class label}

### Soft Fragments
[Soft fragment example] {+#soft-fragment mdld:seeAlso label} demonstrates temporary fragments

### Complex Annotations
[Complex example] {=mdld:complex .Class label comment mdld:seeAlso} shows multiple predicates

### Reverse Relationships
[Target entity] {!mdld:hasPart label} demonstrates reverse predicate form

## Processing Model {=mdld:processing .Class label}

### Streaming Processing
MD-LD processes documents in a single pass: {?mdld:includes .Class label}
- Line-by-line tokenization {=#line-by-line}
- Subject tracking {=#subject-tracking}
- Quad emission {=#quad-emission}

### Origin Tracking
Every quad maintains origin information for round-trip serialization: 
- Block identification
- Position tracking
- Slot indexing

### Semantic Block Caching
The parser uses caching for performance: {mdld:includes .Class label}
- Parse semantic blocks once and cache results
- Avoid repeated parsing of identical annotations
- Maintain deterministic output while improving speed

## Error Handling {=mdld:errors .Class label}

### Graceful Degradation
MD-LD recovers from malformed annotations:
- Unknown prefixes → skip annotation
- Malformed IRIs → skip annotation  
- Unbalanced braces → fatal error
- Invalid carriers → skip annotation

## Connected Knowledge Graph {=mdld:graph .Class label}

This document demonstrates how MD-LD creates a **self-describing knowledge graph** where:
- The document explains MD-LD using MD-LD
- Every concept is explicitly typed and related
- The resulting RDF graph mirrors the document structure
- All features connect into a coherent semantic model

> The document itself becomes both specification and proof of concept. { comment}
