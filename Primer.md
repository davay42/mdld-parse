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

Reference: [W3C RDF](https://www.w3.org/RDF/) {?citation ?name}

Same as: https://mdld.js.org/spec {?sameAs}

### Images

Logo: ![MD-LD](https://mdld.js.org/logo.png)
{?logo ?name}

## Data Modeling {=mlp:modeling .Concept headline}

### Lists with Context

Technologies: {?about}

- [Markdown] {=mlp:md .Technology rdfs:label}
- [RDF] {=mlp:rdf .Technology rdfs:label}
- [Linked Data] {=mlp:ld .Technology rdfs:label}

### Reverse Properties

> This document is part of the MD-LD ecosystem. {^?mdld:partOfSystem}

### Blockquotes as Content

> MD-LD bridges human-readable Markdown and machine-readable RDF data. {abstract}

## Advanced Features {=mlp:advanced .Concept headline}

### Code as Literals

```javascript {=mlp:example .SoftwareSourceCode text}
function createQuad(subject, predicate, object) {
  return { subject, predicate, object };
}
```
[JS] {programmingLanguage}

{=} - reset subject marker


### Multiple Properties from One Value

**New subject** {=mlp:complex}

[Complex Value] {name identifier description}

### Datatypes & Languages

Measurements:

* Count: [42] {count ^^xsd:integer}
* Price: [19.99] {price ^^xsd:decimal}
* Flag: [true] {published ^^xsd:boolean}

> MD-LD supports internationalization.
> {description @fr}

## Real-World Use Case {=mlp:usecase .CreativeWork headline}

> Complete MD-LD document demonstrating practical usage patterns for
> technical documentation that is both human-readable and machine-processable.
> {description}

Code example:

# MD-LD enables semantic documentation

def parse_mdld(content):
return "RDF triples"

Resources:

* [Specification](https://mdld.js.org/spec) {?isBasedOn}
* [GitHub](https://github.com/mdld-js/mdld-parse) {?codeRepository}

