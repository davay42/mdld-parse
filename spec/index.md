# Specification Hub

## 📋 [Formal Specification](./Spec.md)
Complete MD-LD specification with grammar and formal definitions

## 📄 [Compact Spec](./Spec-compact.md)
Concise specification reference for quick lookup

## 📚 [CHANGELOG](../CHANGELOG.md)
Version history and breaking changes

## 🏗️ [Architecture](../docs/Architecture.md)
Design principles, processing pipeline, and performance characteristics

## 🧪 [Test Suite](../tests/)
Comprehensive test coverage (105 tests) with examples and validation

## Specification Overview

MD-LD is a **markdown-linked data** format that combines:

- **📝 Markdown syntax** - Familiar authoring experience
- **🔗 RDF semantics** - Standard linked data model
- **⚡ Polarity system** - Built-in diff authoring capabilities
- **📍 Origin tracking** - Complete provenance for every quad
- **🏷️ Context management** - Subject declarations and prefix folding

### Key Concepts

- **Subject declarations** - `{=IRI}` sets current subject
- **Predicate forms** - `p`, `?p`, `!p` for different relationship types
- **Value carriers** - `[text]`, `**bold**`, `code blocks`, etc.
- **Polarity** - `+` (default) and `-` prefixes for diff authoring
- **Origin tracking** - Lean mapping from quads to source locations

### Grammar Highlights

```
Document ::= Prefix* Subject* Annotation*
Subject   ::= '=IRI' | '=#fragment' | '='
Annotation ::= Carrier Predicate*
Predicate  ::= 'p' | '?p' | '!p' | '.Class'
Carrier   ::= InlineCarrier | BlockCarrier
```

See [Formal Specification](./Spec.md) for complete grammar and semantics.
