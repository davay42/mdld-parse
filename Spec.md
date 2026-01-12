# MD-LD v0.2 Specification {=mdld:spec .Specification}

[mdld] {: https://mdld.js.org/}

> MD-LD is **Markdown-Linked Data** — a minimal semantic annotation layer for CommonMark Markdown that uses Pandoc-style attribute blocks to author RDF in a streaming-friendly and unobtrusive way. {mdld:description}

## Overview {=mdld:overview .Section}

[MD-LD] {mdld:name} **Markdown-Linked Data** — a minimal semantic annotation layer for CommonMark Markdown that uses [Pandoc-style] {mdld:style} attribute blocks. {mdld:description}

## Core Principles {=mdld:principles .Section}

- **No implicit semantics** — every RDF triple originates from `{...}` blocks {mdld:principle1}
- **Explicit intent** — `{...}` always means "emit semantics" {mdld:principle2}
- **Streaming-friendly** — single-pass parsing with bounded memory {mdld:principle3}
- **CommonMark compatibility** — no reinterpretation of Markdown syntax {mdld:principle4}

## Value Carriers {=mdld:value-carriers .Concept}

A `{}` block MAY extract a literal value from exactly one of:

### Inline Spans {=mdld:inline-spans .Concept}
- Span `[text]` {mdld:span-example}
- Emphasis `*text*` {mdld:emphasis-example}
- Strong emphasis `**text**` {mdld:strong-example}
- Inline code `` `text` `` {mdld:code-example}

### Block-level Containers {=mdld:block-containers .Concept}
- Heading {mdld:heading-example}
- List item {mdld:list-example}
- Blockquote {mdld:blockquote-example}
- Fenced code block {mdld:fenced-example}

### Links and Embeds {=mdld:links .Concept}
- Bare URL [https://example.com] {mdld:url-example}
- Link [Example](https://example.com) {mdld:link-example}
- Image ![alt text](https://example.com/image.jpg) {mdld:image-example}

**Everything else is not a value carrier.** {mdld:non-carriers}

## Semantic Blocks {=mdld:semantic-blocks .Concept}

A `{...}` annotation MUST attach to the nearest preceding value carrier. The textual content of that carrier is the literal value unless an explicit IRI is provided.

### Attachment Rule {=mdld:attachment-rule .Rule}

A `{...}` block MUST appear immediately after:
- A Markdown inline span, or
- On its own line, optionally followed by a list

**Plain text outside a span MUST NOT be used as a literal value source.** {mdld:literal-rule}

## Subjects {=mdld:subjects .Concept}

A subject exists only if explicitly declared with `{=IRI}`.

### Subject Declaration {=mdld:subject-declaration .Rule}

**Rules:**
- Sets current subject {mdld:rule1}
- Emits no properties automatically {mdld:rule2}
- Context persists until overridden {mdld:rule3}

## Types {=mdld:types .Concept}

Assigns `rdf:type` to current subject.

## Properties {=mdld:properties .Concept}

### Literal Properties {=mdld:literal-properties .Concept}

Launch year: [1969] {startDate ^^xsd:gYear}
Start date: **1969-07-20** {startDate ^^xsd:date}
Place: [The Moon] {location "en"}

### Object Properties {=mdld:object-properties .Concept}

[Neil Armstrong](https://www.wikidata.org/entity/Q1615) {astronaut}

### Reverse Properties {=mdld:reverse-properties .Concept}

Rocket {=mdld:rocket .schema:Rocket} is part of [Apollo Program] {=mdld:apollo ^schema:hasPart schema:name}

## Lists {=mdld:lists .Concept}

A `{}` block immediately preceding a list applies to **all list items**.

Ingredients: {schema:hasPart .ex:Ingredient}

- Flour {=mdld:flour name}
- Water {=mdld:water name}

### Reverse Relations in Lists {=mdld:list-reverse .Concept}

Used in recipes: {^schema:hasPart}

- Bread {=mdld:bread}
- Cake {=mdld:cake}

## Datatypes and Language {=mdld:datatypes .Concept}

### Datatypes {=mdld:datatype-syntax .Rule}

[1969] {startDate ^^xsd:gYear}

### Language Tags {=mdld:language-syntax .Rule}

[Berlin] {name "en"}
[Берлин] {name "ru"}

## Code Blocks {=mdld:code-blocks .Concept}

Fenced code blocks may act as value carriers when `{}` is placed immediately after opening fence.

Example SPARQL query: {mdld:query-example .SoftwareSourceCode}

```sparql {=mdld:query1 .SoftwareSourceCode text programmingLanguage "SPARQL"}
SELECT * WHERE { ?s ?p ?o }
```

## W3C Standards {=mdld:w3c-standards .Section}

MD-LD is built upon established W3C standards:

Core RDF Standards: {schema:isBasedOn .Standard}
- [RDF 1.1 Concepts] {=mdld:rdf11 .Standard}
- [RDF 1.1 Turtle] {=mdld:turtle .Standard}
- [SPARQL 1.1 Query] {=mdld:sparql .Standard}

Schema.org Vocabulary: {schema:usesVocabulary .Vocabulary}
- [Schema.org Core] {=mdld:schema-core .Vocabulary}
- [Schema.org Structured Data] {=mdld:schema-structured .Vocabulary}

## Complete Example {=mdld:complete-example .Example}

# Apollo 11 Mission {=mdld:apollo11 .SpaceMission}

Launch year: [1969] {startDate ^^xsd:gYear}
Mission duration: [8 days] {duration}
Crew: {hasPart .Person}
- Neil Armstrong {=mdld:armstrong name "Neil Alden Armstrong" commander}
- Buzz Aldrin {=mdld:aldrin name "Buzz Aldrin" lunarModulePilot}
- Michael Collins {=mdld:collins name "Michael Collins" commandModulePilot}

> Mission director: [Gene Kranz] {director}
> Deputy director: [Chris Kraft] {deputyDirector}
> Flight controller: [Steve Bales] {flightController}

## Self-Validation {=mdld:self-validation .Section}

This specification validates itself using MD-LD format:

Expected quads from parsing this specification: {mdld:expected-quads .SoftwareSourceCode}

- Specification structure: {mdld:structure-validation .Validation}
  - Main spec document {mdld:spec}
  - Overview section {mdld:overview}
  - Core principles {mdld:principles}
  - Value carriers concept {mdld:value-carriers}
  - Semantic blocks {mdld:semantic-blocks}
  - Subjects {mdld:subjects}
  - Types {mdld:types}
  - Properties {mdld:properties}
  - Lists {mdld:lists}
  - Datatypes {mdld:datatypes}
  - Code blocks {mdld:code-blocks}
  - W3C standards {mdld:w3c-standards}
  - Complete example {mdld:complete-example}
  - Self-validation {mdld:self-validation}

- Content validation: {mdld:content-validation .Validation}
  - Literal values from spans: [58] {mdld:literal-count}
  - No plain text literals: [Yes] {mdld:no-plain-literals}
  - Proper value carrier usage: [Yes] {mdld:proper-carriers}
  - Concepts defined: [9] {mdld:concept-count}
  - Rules defined: [4] {mdld:rule-count}

## Summary {=mdld:summary .Section}

MD-LD v0.2 provides a **clean semantic layer** over Markdown with **explicit intent only**, **no heuristics**, and **production-grade streaming behavior**.

> If you can read Markdown, you can author linked data. {mdld:tagline}
