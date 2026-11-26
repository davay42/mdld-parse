# Documentation Hub

## 📚 Getting Started

### [MD-LD Authoring Guide](./Guide.md)
Single comprehensive document to learn MD-LD syntax and authoring techniques. Start here for the mental model and core patterns.

### [One Page Guide](./one-page.md)
Quick reference card with essential patterns, quick start examples, and a cheat sheet for frequent use cases.

---

## 🎯 Core Concepts

These documents explain the fundamental features that make MD-LD unique.

### [Semantic Infrastructure as Readable Text](./Semantic-Text.md)
The philosophical foundation: how MD-LD transforms semantic systems into directly writable, inspectable, mergeable plain text. Explains the shift from "yet another RDF syntax" to "semantic-native infrastructure."

### [Elevated Statements](./statements.md)
Automatic `rdf:Statement` pattern detection that extracts the "golden graph" of meta-level facts. Enables reification and statement-level metadata without verbose syntax.

### [Primary Metadata System](./primary-subject.md)
The dual-layer architecture for document identity: `primarySubject` (canonical storage identity) and `primary` (semantic surface). Provides immediate access to type, label, and comment for the document without parsing the quads.

### [Origin System](./origin.md)
Lean, efficient provenance tracking with line-to-quad mapping. Enables UI navigation, source attribution, and round-trip document regeneration without bloating the source text.

### [Polarity & Retraction](./polarity.md)
Sophisticated diff authoring using `+` and `-` prefixes for document evolution. Model state transitions, diffs, and collaborative edits as first-class semantic citizens.

---

## 🛠️ API Reference & Code Generation

### [API Reference](./API.md)
Complete API documentation with tested examples. Core functions: `parse()`, `generate()`, and RDF/JS compatibility patterns.

### [Generate: Quads to MDLD](./generate.md)
Convert RDF quads back to deterministic, human-readable MDLD text. Control inline compaction, reverse connections and primary subject positioning. Essential for round-trip safety and document regeneration.

### [Render: MDLD to HTML and back](./render.md)
This document describes the render() and deconstruct() pair — the bridge between the Quad[] runtime and the human eye. It explains how MD-LD turns HTML into a first-class transport format for knowledge graphs, enabling server/client equivalence, offline-first graph extraction, and privacy-preserving publishing, all without the overhead of the Semantic Web stack.

### [Diff Documents](./diff.md)
Automatic diff document generation via the `remove` parameter. Enables CRDT-style workflows, state management, and collaborative editing with human-readable diffs using polarity retractions syntax.

### [SHACL: Validation and Extraction](./shapes.md)
The shape is the contract. One SHACL shape drives `validate()` (what's wrong), `extract()` (what's true, conformance-gated), and `extractGraph()` (what's permitted) — zero dependencies, ~15K entities/sec, self-verified by the catalog.

---

## 📖 Reference Documentation

### [Syntax Reference](./Syntax.md)
Complete syntax reference with inline examples. Covers carriers, predicates, datatype annotations, reverse properties, and all MD-LD constructs.

### [Architecture & Design](./Architecture.md)
Design principles, processing pipeline, and implementation philosophy. Covers why certain decisions were made and how the system achieves determinism and performance.

### [Parser Architecture](./Parser.md)
Deep dive into parser internals: token structures, state machines, and processing stages. For contributors and those implementing MD-LD in other languages.

---

## 🚀 Performance & Philosophy

### [Crawling the Graph](./crawl.md)
Link-following as a client concern — BFS bounds, ETag revalidation, soft-fail cache, AbortSignal. Lives in `demo/crawl.js`, documented for reuse.

### [Performance Benchmarks](./Performance.md)
Measured wall-clock report: parse ~105K q/s, `evaluate()` ~500K q/s end-to-end (violations + records in one pass, tri-indexed + memoized store), 200 ms real-time envelope ≈ 100K quads.

### [Closure: How Loops Turn Claims Into Facts](./loops.md)
Every claim in the system is the output of an executed invariant — nine closure loops from canonical fixed-point through the `<quad-graph>` gestalt feedback loop to the `recordTable()` workbench, plus where closure honestly stops.

### [Token Efficiency](./Token-Efficiency.md)
Grounded token consumption comparison between MD-LD, JSON-LD and TTL - two tokenizers, 7 example cases + scaling tests - all discover  higher density of triples per token and per character and demostrate high density of meaning achievable with MD-LD.

The breathing cycles of knowledge from text to quads and back to composable text records - human-scale semantic documents that can be transformed back into other documents using scalable JS functions. Everything is readable at all times.

### [Human-Scale Software & Semantic Infrastructure](./Human-Scale.md)

### [The Alignment](./kernel-alignment.md)
A field guide to personal semantic infrastructure — why standards are discoveries, not inventions.

### [Document-Driven Forms](./contenteditabe.md)
The `contenteditable` pattern — the document is the form; `render()`/`deconstruct()` make prose editable without losing semantics.
Philosophy manifesto: why semantic systems drift toward complexity, and how MD-LD enables human-readable, deterministic, locally-inspectable computation. Addresses preservation, long-term comprehensibility, and operational sustainability.

### [Application Development with MD-LD](./app-dev.md)
MD-LD introduces a paradigm shift: The Document is the Database, the API, and the Schema. 
This guide distills the core patterns and practices for building scalable, agent-ready, and highly maintainable web applications using Markdown-Linked Data.

### [Quad[] as a Universal Semantic Runtime](./quad-runtime.md)
The paradigm shift from databases and query languages to pure Text->Quads[]->Text loop with JS as the graph traversal and transformation language and its Array interface as a graph database substrate.

---

## 📋 Real-World Applications

### [Use Cases](./Use-Cases.md)

Practical examples and applications across different domains:

- **Personal Knowledge Management** — Journal entries, project tracking, learning logs
- **Developer Documentation** — API specifications, schema documentation, architecture diagrams
- **Academic Research** — Papers with embedded citations, provenance tracking, experimental workflows
- **Content Management** — Blogs, product catalogs, documentation sites
- **Data Integration** — Database schemas, ETL workflows, data lineage
- **Business Processes** — Invoice processing, approval workflows, audit trails

---

## 🔑 Key Features At a Glance

- **🎯 Elevated statements** — Automatic `rdf:Statement` pattern detection for golden graph extraction
- **📍 Origin tracking** — Lean quad-to-source mapping for provenance and UI navigation
- **⚡ Polarity system** — Diff authoring with `+` and `-` prefixes for state transitions
- **🏷️ Primary metadata** — Immediate document identity without full parsing
- **📝 Rich syntax** — Multiple carrier types and predicate forms
- **🏷️ Subject management** — Persistent scope and prefix folding
- **🔗 RDF/JS compatible** — Works with n3.js, rdflib, and standard RDF ecosystems
- **⚡ High performance** — Sub-100ms parsing for real-world ontologies
