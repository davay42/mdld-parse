[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Catalog {=cat: .Container label}

> A comprehensive guide to SHACL validation in MDLD (Markdown Linked Data) - self-validating documentation for semantic authors. {?comment}

This catalog [includes] {+cat:includes .rdf:Property label} all constraints available in SHACL.

---

## 📋 Constraint {=class:Constraint ?cat:includes label}

> A SHACL constraint is a rule that defines a validation condition for a specific shape and target node. {comment}

We can broadly divide them into these type groups: {!subClassOf .class:Constraint label}

- Type and Kind Constraint {=class:TypeConstraint}

    Two Constraints of this type: {!rdf:type label}
    - Data Type {=sh:datatype}
    - Node Kind {=sh:nodeKind}  
    - Language In {=sh:languageIn}
    - Unique Languages {=sh:uniqueLang}

- Value presence Constraint {=class:PresenceConstraint}

    Checks if the value is present and how many times {!rdf:type label}
    - Min Count {=sh:minCount}
    - Max Count {=sh:maxCount}
    - Has Value {=sh:hasValue}

- Number Literal Constraint {=class:NumberConstraint}

    Minimum and maximum values with inclusion control {!rdf:type  label}
    - Minimum Inclusive {=sh:minInclusive}
    - Maximum Inclusive {=sh:maxInclusive}
    - Minimum Exclusive {=sh:minExclusive}
    - Maximum Exclusive {=sh:maxExclusive}

- String Literal Constraint {=class:StringConstraint}

    Core Literal Constraints {!rdf:type label}
    - Minimum Length {=sh:minLength}
    - Maximum Length {=sh:maxLength}
    - Pattern Validation {=sh:pattern}
    - Pattern Flags {=sh:flags}

- IRI Constraints {=class:IRIConstraint}

    Core named node validations {!rdf:type label}
    - Entity type {=sh:class}
    - Node Shape {=sh:node}
    - Target Class {=sh:targetClass}
    - Target Node {=sh:targetNode}

- Property Based Targeting {=class:PropertyConstraint}

    Apply to subjects that have a particular property {!rdf:type label}
    - Target Subjects {=sh:targetSubjectsOf}
    - Target Objects {=sh:targetObjectsOf}

- Property Pair Constraint {=class:PropertyPairConstraint}

    Compare values between different properties {!rdf:type label}
    - Equals {=sh:equals}
    - Disjoint {=sh:disjoint}  
    - Less Than {=sh:lessThan}
    - Less Than or Equals {=sh:lessThanOrEquals}

- Logical Combinations {=class:LogicalConstraint}

    Boolean logics built on top of ordered lists: {!rdf:type label}
    - Negation {=sh:not}
    - Value enumeration {=sh:in}
    - All must pass {=sh:and}
    - At least one must pass {=sh:or}
    - Exactly one must pass {=sh:xone}

- Assumptions Control {=class:AssumptionConstraint}

    Providing additional data for rules: {!rdf:type label}
    - Closed world {=sh:closed}
    - Ignored Properties {=sh:ignoredProperties}
    - Deactivation flag {=sh:deactivated}
    - Severity levels {=sh:severity}
    - Violation message {=sh:message}

- Qualified Constraint {=class:QualifiedConstraint}

    Advanced counting with shape conformance {!rdf:type label}
    - Qualified Min Count {=sh:qualifiedMinCount}
    - Qualified Max Count {=sh:qualifiedMaxCount}
    - Qualified Value Shape {=sh:qualifiedValueShape}
    - Qualified Value Shapes Disjoint {=sh:qualifiedValueShapesDisjoint}

- Path Constraint {=class:PathConstraint}  

    Property path expressions and navigation {!rdf:type label}
    - Inverse Path {=sh:inversePath}
    - Alternative Path {=sh:alternativePath}
    - Zero or More Path {=sh:zeroOrMorePath}
    - One or More Path {=sh:oneOrMorePath}
    - Zero or One Path {=sh:zeroOrOnePath}

- Advanced Expression Constraint {=class:ExpressionConstraint}

    SPARQL expression evaluation for complex validation {!rdf:type label}
    - Expression {=sh:expression}

- JavaScript Constraint {=class:JSConstraint}

    JavaScript-based custom validation logic {!rdf:type label}
    - JavaScript Function {=sh:js}
    - JS Function Name {=sh:jsFunctionName}
    - JS Library {=sh:jsLibrary}
    - JS Library URL {=sh:jsLibraryURL}

- SPARQL Constraint {=class:SPARQLConstraint}

    Direct SPARQL query-based validation {!rdf:type label}
    - SPARQL ASK Query {=sh:ask}
    - SPARQL SELECT Query {=sh:select}
    - SPARQL CONSTRUCT Query {=sh:construct}
    - SPARQL UPDATE Query {=sh:update}

---

## 🚀 Getting Started

Each constraint includes:
- ✅ **Valid examples** that pass validation
- ❌ **Invalid examples** with expected violations
- 📝 **MDLD syntax** patterns for authoring
- 🔍 **ig-cli validation** commands
