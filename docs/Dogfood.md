[mdld] <https://mdld.js.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

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

### Simple Lists
Features demonstrated: {?mdld:includes Class label}
- Annotations {=#annotations}
- Predicates {=#predicates} 
- Lists {=#lists}

### Nested Lists
Nested structures show hierarchical relationships:

Implementation layers: {?mdld:includes .Class label}
- Parser {=#parser-layer}
  Components: {?mdld:includes .Class label}
  - Lexer {=#lexer }
  - Token Scanner {=#token-scanner}
  - Semantic Processor {=#semantic-processor}
- Serializer {=#serializer-layer}

### List Item Subjects
List items can declare their own subjects:
- [First item] {=mdld:item1 .Class label}
- [Second item] {=mdld:item2 .Class label}

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
