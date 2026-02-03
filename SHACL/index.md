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
    - Pattern {=sh:pattern}

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

- Logical Combinations {=class:LogicalConstraint}

    Boolean logics built on top of ordered lists: {!rdf:type label}
    - Value enumeration {=sh:in}
    - All must pass {=sh:and}
    - At least one must pass {=sh:or}
    - Exactly one must pass {=sh:xone}

- Assumptions Control {=class:AssumptionConstraint}

    Providing additional data for rules: {!rdf:type label}
    - Closed world {=sh:closed}
    - Deactivation flag {=sh:deactivated}
    - Severity levels {=sh:severity}
    - Violation message {=sh:message}

---

## 🚀 Getting Started

Each constraint includes:
- ✅ **Valid examples** that pass validation
- ❌ **Invalid examples** with expected violations
- 📝 **MDLD syntax** patterns for authoring
- 🔍 **ig-cli validation** commands
