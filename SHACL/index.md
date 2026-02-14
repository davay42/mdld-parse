[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Catalog {=cat:index .Container label}

> A comprehensive guide to SHACL validation in MDLD (Markdown Linked Data) - self-validating documentation for semantic authors. {?comment}

This catalog [includes] {+cat:includes .rdf:Property label} all constraints and targeting mechanisms available in SHACL.

## Targeting Mechanism {+class:Targeting .Class label}

**Catalog** {=cat:index} includes 4 Targeting mechanisms.

These are targeting predicates that determine which nodes get validated (not constraints themselves): {?cat:includes .class:TargetingPredicate}

- [Target Class](./targeting/targetClass.md) {=sh:targetClass}
- [Target Node](./targeting/targetNode.md) {=sh:targetNode}
- [Target Subjects](./targeting/targetSubjectsOf.md) {=sh:targetSubjectsOf}
- [Target Objects](./targeting/targetObjectsOf.md) {=sh:targetObjectsOf}

## Constraint {+class:Constraint .Class label}

This catalog includes these constraints: {?cat:includes .class:Constraint}

- [Class](./constraints/class.md) {=sh:class .class:ValueTypeConstraint}
- [Data Type](./constraints/datatype.md) {=sh:datatype .class:ValueTypeConstraint}
- [Node Kind](./constraints/nodekind.md) {=sh:nodeKind class:ValueTypeConstraint}

- [Min Count](./constraints/count.md) {=sh:minCount .class:CardinalityConstraint}
- [Max Count](./constraints/count.md) {=sh:maxCount .class:CardinalityConstraint}

- [Min Inclusive](./constraints/range.md) {=sh:minInclusive .class:ValueRangeConstraint}
- [Max Inclusive](./constraints/range.md) {=sh:maxInclusive .class:ValueRangeConstraint}
- [Min Exclusive](./constraints/range.md) {=sh:minExclusive .class:ValueRangeConstraint}
- [Max Exclusive](./constraints/range.md) {=sh:maxExclusive .class:ValueRangeConstraint}

- [Equals](./constraints/comparison.md) {=sh:equals .class:PropertyPairConstraint}
- [Disjoint](./constraints/disjoint.md) {=sh:disjoint .class:PropertyPairConstraint}  
- [Less Than](./constraints/comparison.md) {=sh:lessThan .class:PropertyPairConstraint}
- [Less Than or Equals](./constraints/comparison.md) {=sh:lessThanOrEquals .class:PropertyPairConstraint}

- [NOT](./constraints/not.md) {=sh:not .class:LogicalConstraint}
- [AND](./constraints/and.md) {=sh:and .class:LogicalConstraint}
- [OR](./constraints/or.md) {=sh:or .class:LogicalConstraint}
- [XONE](./constraints/xone.md) {=sh:xone .class:LogicalConstraint}

- [Minimum Length](./constraints/length.md) {=sh:minLength .class:StringConstraint}
- [Maximum Length](./constraints/length.md) {=sh:maxLength .class:StringConstraint}
- [Pattern](./constraints/pattern.md) {=sh:pattern .class:StringConstraint}
- [Pattern Flags](./constraints/pattern.md) {=sh:flags .class:StringConstraint}
- [Language In](./constraints/language.md) {=sh:languageIn .class:StringConstraint}
- [Unique Languages](./constraints/uniqueLang.md) {=sh:uniqueLang .class:StringConstraint}


- [Has Value](./constraints/hasvalue.md) {=sh:hasValue}
- [Entity type](./constraints/node.md) {=sh:node .class:ShapeConstraint}
- [Value enumeration](./constraints/in.md) {=sh:in}
- [Qualified Min Count](./constraints/qualifiedCount.md) {=sh:qualifiedMinCount}
- [Qualified Max Count](./constraints/qualifiedCount.md) {=sh:qualifiedMaxCount}

- [Closed world](./constraints/closed.md) {=sh:closed .class:MetadataPredicate}
- [Deactivation flag](./constraints/deactivated.md) {=sh:deactivated .class:MetadataPredicate}
- [Severity levels](./constraints/severity.md) {=sh:severity .class:MetadataPredicate}
- [Violation message](./constraints/message.md) {=sh:message .class:MetadataPredicate}

- JavaScript Function {=sh:js .class:JSConstraint .cat:notCovered}
- JS Function Name {=sh:jsFunctionName .class:JSConstraint .cat:notCovered}
- JS Library {=sh:jsLibrary .class:JSConstraint .cat:notCovered}
- JS Library URL {=sh:jsLibraryURL .class:JSConstraint .cat:notCovered}

- SPARQL ASK Query {=sh:ask .class:SPARQLConstraint .cat:notCovered}
- SPARQL SELECT Query {=sh:select .class:SPARQLConstraint .cat:notCovered}
- SPARQL CONSTRUCT Query {=sh:construct .class:SPARQLConstraint .cat:notCovered}
- SPARQL UPDATE Query {=sh:update .class:SPARQLConstraint .cat:notCovered}

- Ignored Properties {=sh:ignoredProperties .class:MetadataPredicate .cat:notCovered}

- Qualified Value Shape {=sh:qualifiedValueShape .class:ShapeConstraint .cat:notCovered}
- Qualified Value Shapes Disjoint {=sh:qualifiedValueShapesDisjoint .class:ShapeConstraint .cat:notCovered}
- Qualified Value Shapes Disjoint {=sh:qualifiedValueShapesDisjoint .class:ShapeConstraint .cat:notCovered}

- Inverse Path {=sh:inversePath .class:PropertyPath .cat:notCovered}
- Alternative Path {=sh:alternativePath .class:PropertyPath .cat:notCovered}
- Zero or More Path {=sh:zeroOrMorePath .class:PropertyPath .cat:notCovered}
- One or More Path {=sh:oneOrMorePath .class:PropertyPath .cat:notCovered}
- Zero or One Path {=sh:zeroOrOnePath .class:PropertyPath .cat:notCovered}

---

## Ontology {=cat:Ontology .Container label ?member}

### 📋 Constraint {=class:Constraint ?member label}

> A SHACL constraint is a rule that defines a validation condition for a specific shape and target node. {comment}

We can broadly divide them into these type groups: {!subClassOf label}

- Metadata Predicate {=class:MetadataPredicate}
- Targeting Predicate {=class:TargetingPredicate}
- Value Type Constraint {=class:ValueTypeConstraint}
- Cardinality Constraint {=class:CardinalityConstraint}
- String-based Constraint {=class:StringConstraint}
- Property Pair Constraint {=class:PropertyPairConstraint}
- Logical Constraint {=class:LogicalConstraint}
- Shape-based Constraint {=class:ShapeConstraint}
- Property Path {=class:PropertyPath}
- JavaScript Constraint {=class:JSConstraint}
- SPARQL Constraint {=class:SPARQLConstraint}


Some constraints are environment dependent, are not tested to be working and are [Not covered] {=cat:notCovered .Class label} by this calalog.
---

## 🚀 Getting Started

Each constraint includes:
- ✅ **Valid examples** that pass validation
- ❌ **Invalid examples** with expected violations
- 📝 **MDLD syntax** patterns for authoring
- 🔍 **ig-cli validation** commands
