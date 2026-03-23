# MD-LD Examples

A collection of example documents demonstrating MD-LD capabilities and patterns.

## Examples by Category

### � Quick Start Examples
- **[minimal.md](demo/minimal.md)** - Minimal document with subject and author

### � Cooking & Recipes
- **[Cookbook.md](./Cookbook.md)** - Complete recipe with ingredients, equipment, and nutritional information using explicit list annotations
- **[dogfood.md](./dogfood.md)** - Comprehensive example showing complex relationships, nested structures, and various MD-LD features

### 🔧 Validation & SHACL
- **[Status-SHACL.md](./Status-SHACL.md)** - SHACL validation patterns with self-validating constraint definitions

### 🤖 LLM & AI Workflows  
- **[few-shot.md](./few-shot.md)** - Few-shot learning examples and MD-LD grammar reference
- **[llm-time-workflow.md](./llm-time-workflow.md)** - Complete LLM workflow with provenance tracking using PROV-O
- **[workflow.md](./workflow.md)** - Research workflow demonstration with PROV-O activities and SHACL validation

## Key Features Demonstrated

- ✅ **Explicit Annotations** - All semantic data comes from `{...}` blocks
- ✅ **Subject Chaining** - Using `{=IRI}` and `{+IRI}` for context
- ✅ **Prefix Folding** - Hierarchical namespace building
- ✅ **PROV-O Integration** - Complete provenance tracking
- ✅ **SHACL Validation** - Self-validating constraint definitions
- ✅ **Fragment Subjects** - Document structuring with `{=#fragment}`
- ✅ **Reverse Relations** - Using `!p` for inverse relationships
- ✅ **Datatypes & Languages** - `^^xsd:types` and `@lang` tags
- ✅ **Round-trip Safety** - Documents that serialize back to valid MD-LD

## Use Cases Reference

- [Personal Knowledge Management](../docs/Use-Cases.md#personal-knowledge-management)
- [Developer Documentation](../docs/Use-Cases.md#developer-documentation)
- [Academic Research](../docs/Use-Cases.md#academic-research)
- [Content Management](../docs/Use-Cases.md#content-management)
- [Data Integration](../docs/Use-Cases.md#data-integration)
- [Business Processes](../docs/Use-Cases.md#workflow-automation)

---

*Each example is a complete, working MD-LD document that can be parsed and round-tripped safely.*