# MD-LD Documentation

Complete documentation for the MD-LD parser and ecosystem.

## Core Documentation

- **[Origin System](./origin.md)** - Complete guide to the lean origin tracking system
- **[Polarity & Retraction](./polarity.md)** - Sophisticated diff authoring and document evolution
- **[One Page Guide](./Guide.md)** - Quick start guide with mental model
- **[Syntax Reference](./Syntax.md)** - Complete syntax reference
- **[Subject System](./Subject.md)** - Subject declaration and context management

## API Documentation

- **[README](../README.md)** - Main API reference and examples
- **[CHANGELOG](../CHANGELOG.md)** - Version history and breaking changes

## Examples

- **[Examples](../examples/)** - Real-world MD-LD examples and use cases

## Specification

- **[Specification](../spec/)** - Formal MD-LD specification

## Quick Links

### Origin System Highlights

- **🎯 UI Navigation** - Click-to-jump functionality in editors
- **🔍 Better Debugging** - Full quad information available in origin tracking  
- **📊 Enhanced Provenance** - Complete relationship tracking for knowledge graphs

### Key Features

- **Prefix folding** - Build hierarchical namespaces
- **Subject declarations** - Context management with `{=IRI}`
- **Object IRIs** - Temporary object declarations with `{+IRI}`
- **Four predicate forms** - `p` (S→L), `?p` (S→O), `!p` (O→S)
- **Type declarations** - `.Class` for rdf:type triples
- **Datatypes & language** - `^^xsd:date` and `@en` support
- **Fragments** - Document structuring with `{=#fragment}`
- **Polarity system** - Sophisticated diff authoring with `+` and `-` prefixes
- **Origin tracking** - Complete provenance with lean quad-to-source mapping
