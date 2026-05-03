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

## Prefix Folding {=mdld:prefix-folding .Container label}

MD-LD supports hierarchical namespace building through prefix folding:

Base namespace declaration:
- `[my] <tag:mdld@example.com,2026:>` {+mdld:base-namespace ?member}

Derived namespaces using CURIE syntax:
- `[ex] <my:example:>` {+mdld:derived-namespace ?member}

This resolves to: `tag:mdld@example.com,2026:example:`

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- Circular references are treated as literal strings
- Later declarations override earlier ones

**Examples:**
- `ex:doc` → `tag:mdld@example.com,2026:example:doc`
- `my:journal:2026-01-27` → `tag:mdld@example.com,2026:journal:2026-01-27`

### Prefix Folding Examples
Demonstrated namespaces: 
- Document: [Example doc] {+ex:doc .Class label ?member}
- Feature: [Example feature] {+ex:feature .Class label ?member}
- Parser: [Example parser] {+ex:parser .Class label ?member}

## Angle-Bracket URLs {=mdld:angle-urls .Container label}

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

## Core Classes {=mdld:classes .Container label}

All classes used in this document:

- Document {+mdld:Document ?member .Class label}
- Concept {+mdld:Concept ?member .Class label}
- Resource {+mdld:Resource ?member .Class label}
- Principle {+mdld:Principle ?member .Class label}
- Feature {+mdld:Feature ?member .Class label}
- Layer {+mdld:Layer ?member .Class label}
- Component {+mdld:Component ?member .Class label}
- Software {+mdld:Software ?member .Class label}

## Parser Architecture {=mdld:parser-arch .Container label}

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
Document processing follows this pipeline: 
1. **Line-by-line scanning** {+#line-by-line .Class label ?member}
2. **Context resolution** {+#context-resolution .Class label ?member}
3. **Subject tracking** {+#subject-tracking .Class label ?member}
4. **Annotation processing** {+#annotation-processing .Class label ?member}
5. **Quad emission** {+#quad-emission .Class label ?member}

### Semantic Block Processing
Annotations are parsed using cached semantic blocks: {mdld:includes .Class label}
- Parse `{...}` blocks into structured semantic objects
- Cache frequently used patterns for performance
- Extract subjects, predicates, types, and modifiers
- Handle all three predicate forms (`p`, `?p`, `!p`)

## Context Declarations {=mdld:context .Container label}

MD-LD supports prefix and vocabulary declarations following JSON-LD patterns:

Prefix declarations:
- `[mdld] <https://mdld.js.org/>` {+mdld:prefix .Class label ?member}
- `[xsd] <http://www.w3.org/2001/XMLSchema#>` {+mdld:xsd .Class label ?member}
- `[@vocab] <http://www.w3.org/2000/01/rdf-schema#>` {+mdld:vocab .Class label ?member}

## Core Principles {=mdld:principles .Container label}

MD-LD follows strict rules: 

**Markdown-preserving** {+#markdown-preserving ?member label} - Remove `{...}` → valid Markdown
**Explicit only** {+#explicit-only ?member label} - No implicit semantics or guessing
**Single-pass** {+#single-pass ?member label} - Streaming-friendly processing
**Deterministic** {+#deterministic ?member label} - Same input → same output
**Traceable** {+#traceable ?member label} - Every fact traces to its source

## Subject Management {=mdld:subjects .Container label}

### Full IRI Subjects
[Document with full IRI] {+mdld:doc-full ?member .Class label} demonstrates persistent subjects

### Fragment Subjects  
[Section with fragment] {+#fragment-example ?member .Class label} creates relative identifiers

### Subject Reset
[{=}] {+mdld:reset ?member label} shows subject clearing

### Temporary Objects
[Related concept] {+mdld:temporary ?member label} demonstrates block-scoped objects

### Soft Fragments
[Soft fragment example] {+#soft-fragment ?member label} demonstrates temporary fragments

**Use cases:**
- `[Related Item] {+ex:related ?schema:isRelatedTo}` - Links to a local fragment
- `[Parent] {+ex:parent !schema:hasPart}` - Reverse relationship  
- `[Section] {+#section1 name ?hasPart}` - Object property with fragment

The soft IRI only exists within the current annotation block.

## Value Carriers {=mdld:carriers .Container label}

### Inline Elements
**Inline elements:** [*italic*] {+mdld:italic ?member} [**bold**] {+mdld:bold ?member} [`code`] {+mdld:code ?member}

### Block Elements
**Block elements:** # [Headings] {+mdld:heading ?member} > [Quotes] {+mdld:quote ?member}

### Links and Media
**Links:** [MD-LD Website](https://mdld.js.org) {?member}
**Images:** ![Logo](https://mdld.js.org/logo.png) {?member}

## Predicate Forms {=mdld:predicates .Class label}

Three predicate directions create different relationships:

- **Subject→Literal**: [MD-LD] {label} creates `mdld:doc label "MD-LD"`
- **Subject→Object**: [RDF](https://www.w3.org/RDF) {mdld:seeAlso} creates `mdld:doc rdfs:seeAlso <https://www.w3.org/RDF>`
- **Object→Subject**: [Example] {mdld:isDefinedBy} creates `mdld:example mdld:isDefinedBy mdld:doc`

## Type Declarations {=mdld:types .Container label}

### Single Types
[Single type example] {+mdld:single ?member .Class label}

### Multiple Types
[Multiple types example] {+mdld:multiple ?member .Class .mdld:Class1 label}

## Literal Modifiers {=mdld:literals .Container label}

### Typed Literals
[2024] {mdld:year ^^xsd:gYear}
[3.14159] {mdld:pi ^^xsd:decimal}
[true] {mdld:bool ^^xsd:boolean}

### Language-Tagged Literals
[Hello] {mdld:english @en}
[Bonjour] {mdld:french @fr}
[Hola] {mdld:spanish @es}

## Lists and Nesting {=mdld:lists .Container label}

Lists are pure Markdown structure with **no semantic scope**. Each list item requires explicit annotations.

### List Item Requirements

**Critical Rule**: All list items must have explicit subject (`{=iri}` or `{+iri}`) to emit semantics.

### Simple Lists
Research team members:

- **Principal investigator** {+#pi ?member .mdld:Role label}
- **Research assistant** {+#assistant ?member .mdld:Role label}
- **Lab technician** {+#tech ?member .mdld:Role label}


## Code Blocks {=mdld:code-blocks .Container label}

### Annotated Code Blocks
```javascript {=mdld:example-code .Class text}
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
```txt {=mdld:ebnf-grammar .Class text}
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
