---
layout: home
hero:
  name: "MD-LD"
  text: "Markdown-Linked Data"
  tagline: A deterministic, streaming-friendly RDF authoring format that extends Markdown with explicit {...} annotations
  image:
    src: /logo.svg
    alt: MD-LD
  actions:
    - theme: brand
      text: Documentation
      link: /docs/
    - theme: alt
      text: Playground
      link: https://mdld.js.org/playground
    - theme: alt
      text: GitHub
      link: https://github.com/davay42/mdld-parse

features:
  - icon:
      src: /icons/markdown.svg
    title: Markdown-Based
    details: Author RDF graphs directly in Markdown using explicit {...} annotations. Leverage familiar Markdown syntax with semantic extensions.

  - icon:
      src: /icons/rdf.svg
    title: Standards Compliant
    details: Generates valid RDF triples following W3C standards. Compatible with existing RDF toolchains and SPARQL endpoints.

  - icon:
      src: /icons/streaming.svg
    title: Streaming-Friendly
    details: Deterministic, single-pass parsing perfect for large documents and real-time processing scenarios.

  - icon:
      src: /icons/prefix.svg
    title: Prefix Folding
    details: Lightweight IRI authoring with CURIE syntax and hierarchical namespace structures without external dependencies.
---

## What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using explicit `{...}` annotations:

```markdown
# Apollo 11 {=ex:apollo11 .SpaceMission}

Launch: [1969-07-16] {startDate ^^xsd:date}
Crew: [Neil Armstrong] {+ex:armstrong ?crewMember name}
Description: [First crewed Moon landing] {description}

[Section] {+#overview ?hasPart}
Overview: [Mission summary] {description}
```

Generates valid RDF triples:

```turtle
ex:apollo11 a schema:SpaceMission ;
  schema:startDate "1969-07-16"^^xsd:date ;
  schema:crewMember ex:armstrong ;
  schema:description "First crewed Moon landing" .

ex:armstrong schema:name "Neil Armstrong" .
```

## Core Features

- **📝 Markdown-First**: Write semantic data in natural Markdown syntax
- **🔗 Explicit Annotations**: Clear `{...}` syntax for RDF triples
- **🚀 Streaming Parser**: Deterministic single-pass processing
- **🏷️ Prefix Folding**: Lightweight IRI authoring with CURIEs
- **📦 Zero Dependencies**: Pure JavaScript implementation
- **🌐 Browser & Node**: Works everywhere JavaScript runs
- **⚡ Performance**: Optimized for large documents and real-time use

## Quick Start

```bash
npm install mdld-parse
```

```javascript
import { parse } from 'mdld-parse'

const markdown = `# Apollo 11 {=ex:apollo11}
Launch: [1969-07-16] {startDate ^^xsd:date}`

const result = parse(markdown)
console.log(result.triples) // RDF triples array
```

## Use Cases

- **Personal Knowledge Graphs**: Author semantic notes and connections
- **Documentation**: Add structured data to technical docs
- **Content Management**: Enrich CMS content with RDF metadata
- **Data Integration**: Bridge between human-readable and machine-readable content
- **Educational Materials**: Create interactive learning resources

## Resources

- [📖 Documentation](/docs/) - Complete API reference and guides
- [🎮 Playground](https://mdld.js.org/playground) - Try MD-LD in your browser
- [🔧 GitHub Repository](https://github.com/davay42/mdld-parse) - Source code and issues
- [📦 NPM Package](https://www.npmjs.com/package/mdld-parse) - Install and usage
