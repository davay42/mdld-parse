# MD-LD Examples

A collection of comprehensive, grounded example documents demonstrating MD-LD capabilities across real-world domains. All examples are complete, working MD-LD documents that parse and round-trip safely.

---

## 🚀 Getting Started

Start with these minimal examples to understand core patterns:

### [Minimal](./demo/minimal.md)
The absolute minimum: basic properties with typed values (`xsd:date`, `xsd:integer`, `xsd:decimal`, `xsd:boolean`), subject declarations, and simple links. Perfect for first-time learners.

### [One-Page Guide](./one-page.md)
Quick reference card with essential patterns and cheat sheet for frequent constructs.

### [Few-Shot Examples](./few-shot.md)
Grammar reference and few-shot learning examples showing syntax in context.

---

## 📚 Domain Examples: Rich & Comprehensive

These examples demonstrate MD-LD applied to realistic domains:

### 👤 Personal & Temporal

#### [Journal](./demo/journal.md)
Personal journaling with temporal hierarchy (year → month → week → day), activities, and temporal relationships. Demonstrates hierarchical subject chaining, temporal properties (`prov:startedAtTime`, `prov:endedAtTime`), and activity tracking. Shows how to model time-based navigation and weekly summaries.

#### [Tasks](./demo/tasks.md)
Task management system combining RDFS class definitions, property constraints, and status tracking. Shows ontology definition patterns with `rdfs:Class`, property ranges, and task lifecycle management.

---

### 🧪 Research & Data Science

#### [Medical AI Research](./demo/research.md)
Scientific paper demonstrating dataset assembly, model training, and complete research provenance. Shows:
- Multi-author attribution with roles and contributions
- Dataset versioning (primary → augmented → derived)
- Research activities with temporal boundaries
- Qualified associations tracking who did what
- Essential for academic workflows and reproducible research

#### [Cookbook](./Cookbook.md)
Recipe documentation with ingredients, equipment, measurements, and nutritional information. Real-world example of structured data where each list item has explicit annotations. Demonstrates ingredient sourcing, quantities, units, and derivation relationships.

---

### 🏢 Project & Business

#### [Website Redesign Project](./demo/project.md)
Complex project management with team structure, phases, dependencies, and complete activity provenance. Shows:
- Team roles and responsibilities
- Multi-phase workflow (planning → design → development)
- Activity sequencing with `prov:wasInformedBy`
- Entity usage and generation tracking
- Budget and timeline management
- Perfect for project tracking and workflow documentation

#### [Task Management System](./demo/tasks.md)
Comprehensive task system combining RDF/RDFS for ontology definition with practical task modeling. Shows class hierarchies, property constraints, and domain integration.

---

### 🌌 Complex Systems & Missions

#### [Cassini-Huygens Mission](./demo/space-mission.md)
NASA/ESA space mission with detailed timeline, spacecraft modules as agents, and complete mission phases. Demonstrates:
- Multi-agent systems (orbiter + probe acting on behalf of organizations)
- Long-running activities spanning years
- Precise temporal markers (`xsd:dateTime`)
- Entity generation tracking through mission phases
- Derived datasets from activities
- Excellent for scientific missions, operational systems, and complex timelines

---

## 🔧 Ontology Examples: Semantic Foundations

Learn how to model and validate data properly:

### [RDF Fundamentals](./demo/rdf.md)
Basic RDF concepts: class definitions, property ranges, and type hierarchies using RDFS vocabulary. Shows:
- `rdfs:Class` declarations
- Property range constraints
- Class hierarchies with `rdfs:subClassOf`
- Foundation patterns for any semantic model

### [PROV-O Patterns](./demo/prov.md)
Complete provenance vocabulary showing:
- **Entities**: things that exist with fixed aspects
- **Activities**: processes that unfold over time
- **Agents**: responsible parties
- **Relationships**: generation, usage, derivation, attribution, association
- Essential for tracking lineage and accountability

### [SHACL Validation](./demo/shacl.md)
Self-documenting validation shapes with:
- `sh:NodeShape` targets for class validation
- `sh:PropertyShape` constraints per property
- Minimum/maximum cardinality rules (`sh:minCount`, `sh:maxCount`)
- Datatype validation
- String pattern matching
- Human-readable error messages

### [XSD Datatypes](./demo/xsd.md)
Comprehensive datatype reference:
- String types (plain, language-tagged)
- Numeric types (integer, decimal, float, double)
- Temporal types (date, time, dateTime)
- Boolean and URI types
- Shows proper syntax for each type with examples

---

## 🎓 Advanced Patterns

### [Status & SHACL Validation](./Status-SHACL.md)
Self-validating documentation: embed SHACL constraints directly in human-readable documents.

### [LLM Time Workflow](./llm-time-workflow.md)
Complete LLM-assisted workflow with provenance tracking, temporal boundaries, and activity sequences.

### [Research Workflow](./workflow.md)
Full research workflow demonstration with activities, PROV-O integration, and SHACL validation throughout.

### [Dogfood](./dogfood.md)
Comprehensive example showing complex relationships, nested structures, and various MD-LD features in real use.

---

## 🎯 Key Features Demonstrated Across Examples

- ✅ **Subject Declaration** (`{=IRI}`) — Persistent context for document focus
- ✅ **Subject Introduction** (`{+IRI}`) — Introducing new entities inline
- ✅ **Typed Values** (`^^xsd:type`) — Type-safe literals (date, integer, decimal, boolean, etc.)
- ✅ **Language Tags** (`@en`, `@es`, `@fr`) — Multilingual content
- ✅ **Class Annotations** (`.Class`) — RDF typing
- ✅ **Property Chains** (`?predicate`) — Linking subjects and objects
- ✅ **Fragment Subjects** (`{=#fragment}`) — Document structure with internal links
- ✅ **Reverse Relations** (`!predicate`) — Inverse connections
- ✅ **PROV-O Integration** — Complete activity, entity, and agent provenance
- ✅ **SHACL Shapes** — Validation constraints and schema documentation
- ✅ **Hierarchical Subjects** — Temporal and organizational nesting
- ✅ **Round-trip Safety** — Parse → generate → parse cycles preserve semantics

---

## 📋 Use Case Quick Links

- [Personal Knowledge Management](../docs/Use-Cases.md#personal-knowledge-management) — See Journal, Tasks examples
- [Academic Research](../docs/Use-Cases.md#academic-research) — See Research, Cassini examples
- [Project Management](../docs/Use-Cases.md#workflow-automation) — See Project, Tasks examples
- [Content Management](../docs/Use-Cases.md#content-management) — See Cookbook, Research examples
- [Data Integration](../docs/Use-Cases.md#data-integration) — See Research, Cassini examples

---

*All examples are self-contained, commented where helpful, and designed to demonstrate real-world patterns.*