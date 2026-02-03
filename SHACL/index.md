[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Catalog {=cat:index .Container label}

> A comprehensive guide to SHACL validation in MDLD (Markdown Linked Data) - self-validating documentation for semantic authors. {?comment}

This catalog [includes] {+cat:includes .rdf:Property label} all constraints available in SHACL.

This catalog includes these constraints: {?cat:includes}

- [Data Type](./constraints/datatype.md) {=sh:datatype}
- [Node Kind](./constraints/nodekind.md) {=sh:nodeKind}
- [Min Count](./constraints/count.md) {=sh:minCount}
- [Max Count](./constraints/count.md) {=sh:maxCount}
- [Class](./constraints/class.md) {=sh:class}

- Pattern {=sh:pattern}
- Pattern Flags  {=sh:flags}
- Language In {=sh:languageIn}
- Unique Languages {=sh:uniqueLang}
- Has Value {=sh:hasValue}
- Minimum Inclusive {=sh:minInclusive}
- Maximum Inclusive {=sh:maxInclusive}
- Minimum Exclusive {=sh:minExclusive}
- Maximum Exclusive {=sh:maxExclusive}
- Minimum Length {=sh:minLength}
- Maximum Length {=sh:maxLength}
- Entity type {=sh:node}
- Target Class {=sh:targetClass}
- Target Node {=sh:targetNode}
- Target Subjects {=sh:targetSubjectsOf}
- Target Objects {=sh:targetObjectsOf}
- Equals {=sh:equals}
- Disjoint {=sh:disjoint}  
- Less Than {=sh:lessThan}
- Less Than or Equals {=sh:lessThanOrEquals}
- Negation {=sh:not}
- Value enumeration {=sh:in}
- All must pass {=sh:and}
- At least one must pass {=sh:or}
- Exactly one must pass {=sh:xone}
- Closed world {=sh:closed}
- Ignored Properties {=sh:ignoredProperties}
- Deactivation flag {=sh:deactivated}
- Severity levels {=sh:severity}
- Violation message {=sh:message}
- Qualified Min Count {=sh:qualifiedMinCount}
- Qualified Max Count {=sh:qualifiedMaxCount}
- Qualified Value Shape {=sh:qualifiedValueShape}
- Qualified Value Shapes Disjoint {=sh:qualifiedValueShapesDisjoint}
- Inverse Path {=sh:inversePath}
- Alternative Path {=sh:alternativePath}
- Zero or More Path {=sh:zeroOrMorePath}
- One or More Path {=sh:oneOrMorePath}
- Zero or One Path {=sh:zeroOrOnePath}
- JavaScript Function {=sh:js}
- JS Function Name {=sh:jsFunctionName}
- JS Library {=sh:jsLibrary}
- JS Library URL {=sh:jsLibraryURL}
- SPARQL ASK Query {=sh:ask}
- SPARQL SELECT Query {=sh:select}
- SPARQL CONSTRUCT Query {=sh:construct}
- SPARQL UPDATE Query {=sh:update}

---

## Ontology {=cat:Ontology .Container label}

### 📋 Constraint {=class:Constraint ?member label}

> A SHACL constraint is a rule that defines a validation condition for a specific shape and target node. {comment}

We can broadly divide them into these type groups: {!subClassOf label}

- Type and Kind Constraint {=class:TypeConstraint}
- Value presence Constraint {=class:PresenceConstraint}
- Number Literal Constraint {=class:NumberConstraint}
- String Literal Constraint {=class:StringConstraint}
- IRI Constraints {=class:IRIConstraint}
- Property Based Targeting {=class:PropertyConstraint}
- Property Pair Constraint {=class:PropertyPairConstraint}
- Logical Combinations {=class:LogicalConstraint}
- Assumptions Control {=class:AssumptionConstraint}
- Qualified Constraint {=class:QualifiedConstraint}
- Path Constraint {=class:PathConstraint}  
- Advanced Expression Constraint {=class:ExpressionConstraint}
- JavaScript Constraint {=class:JSConstraint}
- SPARQL Constraint {=class:SPARQLConstraint}

---

## 🚀 Getting Started

Each constraint includes:
- ✅ **Valid examples** that pass validation
- ❌ **Invalid examples** with expected violations
- 📝 **MDLD syntax** patterns for authoring
- 🔍 **ig-cli validation** commands

---

## 🛡️ Self-Validation Rules

> **Single source of truth:** See [definitions.md](./definitions.md) for all validation rules and property definitions

The catalog validates against comprehensive rules defined in `definitions.md` to ensure:
- ✅ **Catalog completeness** (52 constraints)
- ✅ **Constraint metadata** (labels, full IRIs, comments)
- ✅ **Structural integrity** (proper relationships)

Use `ig-cli validate SHACL/index.md --shapes SHACL/definitions.md` to run full validation.
