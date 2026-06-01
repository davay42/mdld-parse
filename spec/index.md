# Specifications

## 📋 [Formal Specification](./Spec.md)

Complete canonical MD-LD specification with grammar and formal definitions

## 📄 [Compact Spec](./Spec-compact.md)

Concise specification reference for quick lookup

## 📄 [Ultra Compact Spec](./Spec-ultra.md)

Most short meaningful MD-LD definition

## Overview

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
