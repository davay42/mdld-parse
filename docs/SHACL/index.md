[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Catalog {=cat:index .Container label}

> A comprehensive guide to SHACL validation in MDLD (Markdown Linked Data) - self-validating documentation for semantic authors. {?comment}

This catalog [includes] {+cat:includes .rdf:Property label} all constraints and targeting mechanisms available in SHACL.

## Targeting Mechanism {+class:Targeting .Class label}
- *Catalog** {=cat:index} includes 4 Targeting mechanisms.

These are targeting predicates that determine which nodes get validated (not constraints themselves): 

- [Target Class](./targeting/targetClass.md) {+sh:targetClass ?cat:includes .class:TargetingPredicate}
- [Target Node](./targeting/targetNode.md) {+sh:targetNode ?cat:includes .class:TargetingPredicate}
- [Target Subjects](./targeting/targetSubjectsOf.md) {+sh:targetSubjectsOf ?cat:includes .class:TargetingPredicate}
- [Target Objects](./targeting/targetObjectsOf.md) {+sh:targetObjectsOf ?cat:includes .class:TargetingPredicate}

## Constraint {+class:Constraint .Class label}

This catalog includes these constraints: 

- [Class](./constraints/class.md) {+sh:class ?cat:includes .class:ValueTypeConstraint}
- [Data Type](./constraints/datatype.md) {+sh:datatype ?cat:includes .class:ValueTypeConstraint}
- [Node Kind](./constraints/nodekind.md) {+sh:nodeKind ?cat:includes .class:ValueTypeConstraint}
- [Min Count](./constraints/count.md) {+sh:minCount ?cat:includes .class:CardinalityConstraint}
- [Max Count](./constraints/count.md) {+sh:maxCount ?cat:includes .class:CardinalityConstraint}
- [Min Inclusive](./constraints/range.md) {+sh:minInclusive ?cat:includes .class:ValueRangeConstraint}
- [Max Inclusive](./constraints/range.md) {+sh:maxInclusive ?cat:includes .class:ValueRangeConstraint}
- [Min Exclusive](./constraints/range.md) {+sh:minExclusive ?cat:includes .class:ValueRangeConstraint}
- [Max Exclusive](./constraints/range.md) {+sh:maxExclusive ?cat:includes .class:ValueRangeConstraint}
- [Equals](./constraints/comparison.md) {+sh:equals ?cat:includes .class:PropertyPairConstraint}
- [Disjoint](./constraints/disjoint.md) {+sh:disjoint ?cat:includes .class:PropertyPairConstraint}
- [Less Than](./constraints/comparison.md) {+sh:lessThan ?cat:includes .class:PropertyPairConstraint}
- [Less Than or Equals](./constraints/comparison.md) {+sh:lessThanOrEquals ?cat:includes .class:PropertyPairConstraint}
- [NOT](./logical/not.md) {+sh:not ?cat:includes .class:LogicalConstraint}
- [AND](./logical/and.md) {+sh:and ?cat:includes .class:LogicalConstraint}
- [Minimum Length](./constraints/length.md) {+sh:minLength ?cat:includes .class:StringConstraint}
- [Maximum Length](./constraints/length.md) {+sh:maxLength ?cat:includes .class:StringConstraint}
- [Pattern](./constraints/pattern.md) {+sh:pattern ?cat:includes .class:StringConstraint}
- [Pattern Flags](./constraints/pattern.md) {+sh:flags ?cat:includes .class:StringConstraint}
- [Language In](./constraints/language.md) {+sh:languageIn ?cat:includes .class:StringConstraint}
- [Unique Languages](./constraints/uniqueLang.md) {+sh:uniqueLang ?cat:includes .class:StringConstraint}
- [Has Value](./constraints/hasvalue.md) {+sh:hasValue ?cat:includes}
- [Entity type](./constraints/node.md) {+sh:node ?cat:includes .class:ShapeConstraint}
- [Value enumeration](./constraints/in.md) {+sh:in ?cat:includes}
- [Qualified Min Count](./constraints/qualifiedCount.md) {+sh:qualifiedMinCount ?cat:includes}
- [Qualified Max Count](./constraints/qualifiedCount.md) {+sh:qualifiedMaxCount ?cat:includes}
- [Closed world](./constraints/closed.md) {+sh:closed ?cat:includes .class:MetadataPredicate}
- [Deactivation flag](./constraints/deactivated.md) {+sh:deactivated ?cat:includes .class:MetadataPredicate}
- [Severity levels](./constraints/severity.md) {+sh:severity ?cat:includes .class:MetadataPredicate}
- [Violation message](./constraints/message.md) {+sh:message ?cat:includes .class:MetadataPredicate}
- [JavaScript Function](./constraints/js.md) {+sh:js ?cat:includes .class:JSConstraint}


Some part is still completely uncovered and don't work even on ttl or pure quads - something might be broken in the validator, need deeper investigation:

- [JS Function Name](./constraints/js.md) {+sh:jsFunctionName ?cat:includes .class:JSConstraint .cat:notCovered}
- [JS Library](./constraints/js.md) {+sh:jsLibrary ?cat:includes .class:JSConstraint .cat:notCovered}
- [JS Library URL](./constraints/js.md) {+sh:jsLibraryURL ?cat:includes .class:JSConstraint .cat:notCovered}
- [SPARQL ASK Query](./constraints/sparql.md) {+sh:ask ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- [SPARQL SELECT Query](./constraints/sparql.md) {+sh:select ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- [SPARQL CONSTRUCT Query](./constraints/sparql.md) {+sh:construct ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- [SPARQL UPDATE Query](./constraints/sparql.md) {+sh:update ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- [Ignored Properties](./constraints/ignored.md) {+sh:ignoredProperties ?cat:includes .class:MetadataPredicate .cat:notCovered}
- [OR](./logical/or.md) {+sh:or ?cat:includes .class:LogicalConstraint .cat:notCovered}
- [XONE](./logical/xone.md) {+sh:xone ?cat:includes .class:LogicalConstraint .cat:notCovered}
- [Qualified Value Shape](./constraints/qualified.md) {+sh:qualifiedValueShape ?cat:includes .class:ShapeConstraint .cat:notCovered}
- [Qualified Value Shapes Disjoint](./constraints/qualified.md) {+sh:qualifiedValueShapesDisjoint ?cat:includes .class:ShapeConstraint .cat:notCovered}
- [Qualified Value Shapes Disjoint](./constraints/qualified.md) {+sh:qualifiedValueShapesDisjoint ?cat:includes .class:ShapeConstraint .cat:notCovered}
- [Inverse Path](./constraints/path.md) {+sh:inversePath ?cat:includes .class:PropertyPath .cat:notCovered}
- [Alternative Path](./constraints/path.md) {+sh:alternativePath ?cat:includes .class:PropertyPath .cat:notCovered}
- [Zero or More Path](./constraints/path.md) {+sh:zeroOrMorePath ?cat:includes .class:PropertyPath .cat:notCovered}
- [One or More Path](./constraints/path.md) {+sh:oneOrMorePath ?cat:includes .class:PropertyPath .cat:notCovered}
- [Zero or One Path](./constraints/path.md) {+sh:zeroOrOnePath ?cat:includes .class:PropertyPath .cat:notCovered}

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

## Some constraints are environment dependent, are not tested to be working and are [Not covered] {=cat:notCovered .Class label} by this calalog.

## 🚀 Getting Started

Each constraint includes:
- ✅ **Valid examples** that pass validation
- ❌ **Invalid examples** with expected violations
- 📝 **MDLD syntax** patterns for authoring
- 🔍 **ig-cli validation** commands
