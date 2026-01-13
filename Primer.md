# MD-LD Primer {=https://mdld.js.org/primer .Specification name}

[mlp] {: https://mdld.js.org/primer# }

> MD-LD is **Markdown-Linked Data** — author RDF using explicit `{}` annotations in plain Markdown.
{description}

## Getting Started {=mlp:start .Concept headline}

### Basic Pattern

Document: [My First MD-LD] {=mlp:doc .Document}
Title: [Hello World] {title}
Created: [2024-01-01] {dateCreated ^^xsd:date}

### Links as Objects

Reference: [W3C RDF](https://www.w3.org/RDF/) {?citation}

Same as: https://mdld.js.org/spec {?sameAs}

### Inline Carriers

Multiple properties: [Value] {name identifier description}

## Data Modeling {=mlp:modeling .Concept headline}

### Lists with Context

Technologies: {?about .Technology}

- Markdown {=mlp:md name}
- RDF {=mlp:rdf name}
- Linked Data {=mlp:ld name}

### Nested Lists

Project: [My Project] {=mlp:project .Project}

Tasks: {hasTask .Task}

- Design Phase {=mlp:task1 name}
  Subtasks: {hasSubtask}
  - UI Mockups {=mlp:subtask1 name}
  - User Research {=mlp:subtask2 name}
- Implementation {=mlp:task2 name}
- Testing {=mlp:task3 name}

### Reverse Properties

> This document is part of the MD-LD ecosystem. {^?partOfSystem}

### Blockquotes as Content

> MD-LD bridges human-readable Markdown and machine-readable RDF data. {abstract}

## Advanced Features {=mlp:advanced .Concept headline}

### Code Blocks as Literals

```javascript {=mlp:example .SoftwareSourceCode text}
function createQuad(subject, predicate, object) {
  return { subject, predicate, object };
}
```

### Multiple Types

Article: [Semantic Article] {=mlp:article .Article .CreativeWork .TechDocument title}

### Datatypes & Languages

Measurements:

* Count: [42] {count ^^xsd:integer}
* Price: [19.99] {price ^^xsd:decimal}
* Flag: [true] {published ^^xsd:boolean}
* Date: [2024-01-15T10:30:00Z] {modified ^^xsd:dateTime}

> MD-LD supports internationalization. {description @fr}

### Resource Declarations

Author: [Alice Smith] {=mlp:alice .Person name email}

## Real-World Use Case {=mlp:usecase .CreativeWork headline}

> Complete MD-LD document demonstrating practical usage patterns for
> technical documentation that is both human-readable and machine-processable.
> {description}

### Project Documentation

API Endpoint: [User API] {=mlp:user-api .APIEndpoint name}

Method: [GET] {method}
Path: [/users/:id] {path}

Example:

```bash {=mlp:example-usage .CodeExample text}
curl https://api.example.com/users/123
```

### Academic Paper

Paper: [Semantic Web Research] {=mlp:paper .ScholarlyArticle title}

Authors: {author .Person}

- [Alice Johnson] {=mlp:alice name}
- [Bob Smith] {=mlp:bob name}

Published: [2024-01] {datePublished ^^xsd:gYear}

> This paper explores semantic markup in Markdown. {abstract @en}

Resources:

* [Specification](https://mdld.js.org/spec) {?isBasedOn}
* [GitHub](https://github.com/mdld-js/mdld-parse) {?codeRepository}
