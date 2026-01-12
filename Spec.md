# MD-LD v0.2 Specification {=mdld:spec rdf:type Specification}

[@vocab] {: http://schema.mdld.org/}
[mdld] {: http://schema.mdld.org/}
[rdf] {: http://www.w3.org/1999/02/22-rdf-syntax-ns#}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Overview {=mdld:overview rdf:type Section}

[MD-LD] {mdld:name} **Markdown-Linked Data** — a minimal semantic annotation layer for CommonMark Markdown using [Pandoc-style] {mdld:style} attribute blocks.

### Core Principles {=mdld:principles rdf:type Section}

- **No implicit semantics** — every RDF triple originates from `{...}` blocks
- **Explicit intent** — `{...}` always means "emit semantics"  
- **Streaming-friendly** — single-pass parsing with bounded memory
- **CommonMark compatibility** — no reinterpretation of Markdown syntax

## Value Carriers {=mdld:value-carriers rdf:type Concept}

A `{}` block MAY extract a literal value from exactly one of:

### Inline Spans {=mdld:inline-spans rdf:type Concept}
- Span `[text]`
- Emphasis `*text*`, `_text_`
- Strong emphasis `**text**`, `__text__`
- Inline code `` `text` ``

### Block-level Containers {=mdld:block-containers rdf:type Concept}
- Heading
- List item
- Blockquote
- Fenced code block

### Links and Embeds {=mdld:links rdf:type Concept}
- Bare URL `https://example.com`
- Link `[Example](https://example.com)`
- Image `![alt text](https://example.com/image.jpg)`

**Everything else is not a value carrier.**

## Semantic Blocks {=mdld:semantic-blocks rdf:type Concept}

A `{...}` annotation MUST attach to the nearest preceding value carrier. The textual content of that carrier is the literal value unless an explicit IRI is provided.

### Attachment Rule {=mdld:attachment-rule rdf:type Rule}

A `{...}` block MUST appear immediately after:
- A Markdown inline span, or
- On its own line, optionally followed by a list

**Plain text outside a span MUST NOT be used as a literal value source.**

## Subjects {=mdld:subjects rdf:type Concept}

A subject exists only if explicitly declared with `{=IRI}`.

### Subject Declaration {=mdld:subject-declaration rdf:type Rule}

```markdown
# Title {=ex:identifier .Type}
```

**Rules:**
- Sets current subject
- Emits no properties automatically
- Context persists until overridden

## Types {=mdld:types rdf:type Concept}

Assigns `rdf:type` to current subject.

```markdown
# Apollo 11 {=wd:Q43653 .SpaceMission}
```

## Properties {=mdld:properties rdf:type Concept}

### Literal Properties {=mdld:literal-properties rdf:type Concept}

```markdown
## Apollo 11 {=wd:Q43653 .SpaceMission}

Launch year: [1969] {startDate ^^xsd:gYear}
Start date: **1969-07-20** {startDate ^^xsd:date}
Place: [The Moon] {location "en"}
```

### Object Properties {=mdld:object-properties rdf:type Concept}

```markdown
## Apollo 11 {=wd:Q43653}

[Neil Armstrong](https://www.wikidata.org/entity/Q1615) {astronaut}
```

### Reverse Properties {=mdld:reverse-properties rdf:type Concept}

```markdown
Rocket {=ex:rocket .schema:Rocket} is part of [Apollo Program] {=wd:Q495307 ^schema:hasPart schema:name}
```

## Lists {=mdld:lists rdf:type Concept}

A `{}` block immediately preceding a list applies to **all list items**.

```markdown
## Recipe {=ex:recipe1 name}

Ingredients: {schema:hasPart .ex:Ingredient}

- Flour {=ex:Flour name}
- Water {=ex:Water name}
```

### Reverse Relations in Lists {=mdld:list-reverse rdf:type Concept}

```markdown
Used in recipes: {^schema:hasPart}

- Bread {=ex:Bread}
- Cake {=ex:Cake}
```

## Datatypes and Language {=mdld:datatypes rdf:type Concept}

### Datatypes {=mdld:datatype-syntax rdf:type Rule}

```markdown
[1969] {startDate ^^xsd:gYear}
```

### Language Tags {=mdld:language-syntax rdf:type Rule}

```markdown
[Berlin] {name "en"}
[Берлин] {name "ru"}
```

## Code Blocks {=mdld:code-blocks rdf:type Concept}

Fenced code blocks may act as value carriers when `{}` is placed immediately after opening fence.

```markdown
```sparql {=ex:query1 .SoftwareSourceCode text programmingLanguage "SPARQL"}
SELECT * WHERE { ?s ?p ?o }
```
```

## Complete Example {=mdld:complete-example rdf:type Example}

```markdown
# Apollo 11 Mission {=wd:Q43653 .SpaceMission}

Launch year: [1969] {startDate ^^xsd:gYear}
Crew: {hasPart .Person}
- Neil Armstrong {=wd:Q1615 name "Neil Alden Armstrong"}
- Buzz Aldrin {=wd:Q2252 name "Buzz Aldrin"}

> Mission director: [Gene Kranz] {director}
> Deputy director: [Chris Kraft] {deputyDirector}

```sparql {=ex:mission-query .SoftwareSourceCode}
SELECT ?crew ?role WHERE {
  wd:Q43653 schema:hasPart ?crew .
  ?crew schema:name ?name .
}
```

## Self-Validation {=mdld:self-validation rdf:type Section}

This specification validates itself using MD-LD format:

```sparql {=mdld:expected-quads rdf:type SoftwareSourceCode}
# Expected quads from parsing this specification
SELECT ?subject ?predicate ?object WHERE {
  # Specification structure
  mdld:spec rdf:type mdld:Specification .
  mdld:overview rdf:type mdld:Section .
  mdld:principles rdf:type mdld:Section .
  mdld:value-carriers rdf:type mdld:Concept .
  mdld:inline-spans rdf:type mdld:Concept .
  mdld:block-containers rdf:type mdld:Concept .
  mdld:links rdf:type mdld:Concept .
  mdld:semantic-blocks rdf:type mdld:Concept .
  mdld:attachment-rule rdf:type mdld:Rule .
  mdld:subjects rdf:type mdld:Concept .
  mdld:subject-declaration rdf:type mdld:Rule .
  mdld:types rdf:type mdld:Concept .
  mdld:properties rdf:type mdld:Concept .
  mdld:literal-properties rdf:type mdld:Concept .
  mdld:object-properties rdf:type mdld:Concept .
  mdld:reverse-properties rdf:type mdld:Concept .
  mdld:lists rdf:type mdld:Concept .
  mdld:list-reverse rdf:type mdld:Concept .
  mdld:datatypes rdf:type mdld:Concept .
  mdld:datatype-syntax rdf:type mdld:Rule .
  mdld:language-syntax rdf:type mdld:Rule .
  mdld:code-blocks rdf:type mdld:Concept .
  mdld:complete-example rdf:type mdld:Example .
  mdld:self-validation rdf:type mdld:Section .
  mdld:expected-quads rdf:type mdld:SoftwareSourceCode .
}
```

## Summary {=mdld:summary rdf:type Section}

MD-LD v0.2 provides a **clean semantic layer** over Markdown with **explicit intent only**, **no heuristics**, and **production-grade streaming behavior**.

> If you can read Markdown, you can author linked data.
