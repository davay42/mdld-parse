[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Catalog {=cat:index .Container label}

> A comprehensive guide to SHACL validation in MDLD (Markdown Linked Data) - self-validating documentation for semantic authors. {?comment}

This catalog [includes] {+cat:includes .rdf:Property label} all constraints and targeting mechanisms available in SHACL.

## Targeting Mechanism {+cat:Targeting .Class label}

These are targeting predicates that determine which nodes get validated (not constraints themselves): {?cat:includes .cat:Targeting}

- [Target Class](./targeting/targetClass.md) {=sh:targetClass}
- [Target Node](./targeting/targetNode.md) {=sh:targetNode}
- [Target Subjects](./targeting/targetSubjectsOf.md) {=sh:targetSubjectsOf}
- [Target Objects](./targeting/targetObjectsOf.md) {=sh:targetObjectsOf}

## Constraint {+cat:Constraint .Class label}

This catalog includes these constraints: {?cat:includes .cat:Constraint}

- [Has Value](./constraints/hasvalue.md) {=sh:hasValue}
- [Data Type](./constraints/datatype.md) {=sh:datatype}
- [Node Kind](./constraints/nodekind.md) {=sh:nodeKind}
- [Min Count](./constraints/count.md) {=sh:minCount}
- [Max Count](./constraints/count.md) {=sh:maxCount}
- [Class](./constraints/class.md) {=sh:class}
- [Entity type](./constraints/node.md) {=sh:node}
- [Minimum Length](./constraints/length.md) {=sh:minLength}
- [Maximum Length](./constraints/length.md) {=sh:maxLength}
- [Comparison Constraints](./constraints/comparison.md) {=sh:lessThan}
- [Value Range](./constraints/range.md) {=sh:minInclusive}
- [Value Range](./constraints/range.md) {=sh:maxInclusive}
- [Value Range](./constraints/range.md) {=sh:minExclusive}
- [Value Range](./constraints/range.md) {=sh:maxExclusive}

- [Language In](./constraints/language.md) {=sh:languageIn}
- [Value enumeration](./constraints/in.md) {=sh:in}
- [AND Constraint](./constraints/and.md) {=sh:and}
- [OR Constraint](./constraints/or.md) {=sh:or}
- [XONE Constraint](./constraints/xone.md) {=sh:xone}
- [NOT Constraint](./constraints/not.md) {=sh:not}
- [Qualified Min Count](./constraints/qualifiedCount.md) {=sh:qualifiedMinCount}
- [Qualified Max Count](./constraints/qualifiedCount.md) {=sh:qualifiedMaxCount}
- [Equals](./constraints/comparison.md) {=sh:equals}
- [Less Than](./constraints/comparison.md) {=sh:lessThan}
- [Less Than or Equals](./constraints/comparison.md) {=sh:lessThanOrEquals}

- Unique Languages {=sh:uniqueLang}
- Pattern {=sh:pattern}
- Pattern Flags {=sh:flags}
- Disjoint {=sh:disjoint}  

- Ignored Properties {=sh:ignoredProperties}

- JavaScript Function {=sh:js}
- JS Function Name {=sh:jsFunctionName}
- JS Library {=sh:jsLibrary}
- JS Library URL {=sh:jsLibraryURL}
- SPARQL ASK Query {=sh:ask}
- SPARQL SELECT Query {=sh:select}
- SPARQL CONSTRUCT Query {=sh:construct}
- SPARQL UPDATE Query {=sh:update}

- Closed world {=sh:closed}
- Deactivation flag {=sh:deactivated}
- Severity levels {=sh:severity}
- Violation message {=sh:message}

- Qualified Value Shape - ENGINE FAILS {=sh:qualifiedValueShape}
- Qualified Value Shapes Disjoint - ENGINE FAILS {=sh:qualifiedValueShapesDisjoint}
- Inverse Path - ENGINE FAILS {=sh:inversePath}
- Alternative Path - ENGINE FAILS {=sh:alternativePath}
- Zero or More Path - ENGINE FAILS {=sh:zeroOrMorePath}
- One or More Path - ENGINE FAILS {=sh:oneOrMorePath}
- Zero or One Path - ENGINE FAILS {=sh:zeroOrOnePath}

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

### Catalog Completeness Shape {=cat:shapes/catalog .sh:NodeShape label}

Ensures the catalog maintains its structural integrity by targeting the [catalog index] {+cat:index ?sh:targetNode}. 

**Constraint Count Rule** {=cat:shapes/catalog/count .sh:PropertyShape ?sh:property} ensures the [includes] {+cat:includes ?sh:path} property has exactly [52] {sh:minCount sh:maxCount ^^xsd:integer} constraints for complete SHACL coverage: **Catalog must include exactly 52 constraints** {sh:message}