[owl] <http://www.w3.org/2002/07/owl#>

## W3C Shapes Constraint Language (SHACL) Vocabulary {=sh: .owl:Ontology label @en}

[This vocabulary defines terms used in SHACL, the W3C Shapes Constraint Language.] {comment @en}
[http://www.w3.org/ns/shacl-shacl#] {+http://www.w3.org/ns/shacl-shacl# ?sh:suggestedShapesGraph}

## Abstract result {=sh:AbstractResult .Class label @en}

[The base class of validation results, typically not instantiated directly.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## And constraint component {=sh:AndConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to test whether a value node conforms to all members of a provided list of shapes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:AndConstraintComponent-and] {+sh:AndConstraintComponent-and ?sh:parameter}

## AndConstraintComponent-and {=sh:AndConstraintComponent-and .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[and] {+sh:and ?sh:path}

## Blank node {=sh:BlankNode .sh:NodeKind label @en}

[The node kind of all blank nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## Blank node or IRI {=sh:BlankNodeOrIRI .sh:NodeKind label @en}

[The node kind of all blank nodes or IRIs.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## Blank node or literal {=sh:BlankNodeOrLiteral .sh:NodeKind label @en}

[The node kind of all blank nodes or literals.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## Class constraint component {=sh:ClassConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that each value node is an instance of a given type.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:ClassConstraintComponent-class] {+sh:ClassConstraintComponent-class ?sh:parameter}

## ClassConstraintComponent-class {=sh:ClassConstraintComponent-class .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[IRI] {+sh:IRI ?sh:nodeKind}
[class] {+sh:class ?sh:path}

## Closed constraint component {=sh:ClosedConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to indicate that focus nodes must only have values for those properties that have been explicitly enumerated via sh:property/sh:path.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:ClosedConstraintComponent-closed] {+sh:ClosedConstraintComponent-closed ?sh:parameter}
[sh:ClosedConstraintComponent-ignoredProperties] {+sh:ClosedConstraintComponent-ignoredProperties ?sh:parameter}

## ClosedConstraintComponent-closed {=sh:ClosedConstraintComponent-closed .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?sh:datatype}
[closed] {+sh:closed ?sh:path}

## ClosedConstraintComponent-ignoredProperties {=sh:ClosedConstraintComponent-ignoredProperties .sh:Parameter}

**true** {sh:optional ^^xsd:boolean}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[ignored properties] {+sh:ignoredProperties ?sh:path}

## Constraint component {=sh:ConstraintComponent .Class label @en}

[The class of constraint components.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Parameterizable] {+sh:Parameterizable ?subClassOf}

## Datatype constraint component {=sh:DatatypeConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the datatype of all value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:DatatypeConstraintComponent-datatype] {+sh:DatatypeConstraintComponent-datatype ?sh:parameter}

## DatatypeConstraintComponent-datatype {=sh:DatatypeConstraintComponent-datatype .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[IRI] {+sh:IRI ?sh:nodeKind}
[datatype] {+sh:datatype ?sh:path}

## Disjoint constraint component {=sh:DisjointConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that the set of value nodes is disjoint with the the set of nodes that have the focus node as subject and the value of a given property as predicate.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:DisjointConstraintComponent-disjoint] {+sh:DisjointConstraintComponent-disjoint ?sh:parameter}

## DisjointConstraintComponent-disjoint {=sh:DisjointConstraintComponent-disjoint .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[IRI] {+sh:IRI ?sh:nodeKind}
[disjoint] {+sh:disjoint ?sh:path}

## Equals constraint component {=sh:EqualsConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that the set of value nodes is equal to the set of nodes that have the focus node as subject and the value of a given property as predicate.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:EqualsConstraintComponent-equals] {+sh:EqualsConstraintComponent-equals ?sh:parameter}

## EqualsConstraintComponent-equals {=sh:EqualsConstraintComponent-equals .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[IRI] {+sh:IRI ?sh:nodeKind}
[equals] {+sh:equals ?sh:path}

## Expression constraint component {=sh:ExpressionConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that a given node expression produces true for all value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:ExpressionConstraintComponent-expression] {+sh:ExpressionConstraintComponent-expression ?sh:parameter}

## ExpressionConstraintComponent-expression {=sh:ExpressionConstraintComponent-expression .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[expression] {+sh:expression ?sh:path}

## Function {=sh:Function .Class label @en}

[The class of SHACL functions.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Parameterizable] {+sh:Parameterizable ?subClassOf}

## Has-value constraint component {=sh:HasValueConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that one of the value nodes is a given RDF node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:HasValueConstraintComponent-hasValue] {+sh:HasValueConstraintComponent-hasValue ?sh:parameter}

## HasValueConstraintComponent-hasValue {=sh:HasValueConstraintComponent-hasValue .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[has value] {+sh:hasValue ?sh:path}

## IRI {=sh:IRI .sh:NodeKind label @en}

[The node kind of all IRIs.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## IRI or literal {=sh:IRIOrLiteral .sh:NodeKind label @en}

[The node kind of all IRIs or literals.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## In constraint component {=sh:InConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to exclusively enumerate the permitted value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:InConstraintComponent-in] {+sh:InConstraintComponent-in ?sh:parameter}

## InConstraintComponent-in {=sh:InConstraintComponent-in .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[in] {+sh:in ?sh:path}

## Info {=sh:Info .sh:Severity label @en}

[The severity for an informational validation result.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## JavaScript-based constraint {=sh:JSConstraint .Class label @en}

[The class of constraints backed by a JavaScript function.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript executable] {+sh:JSExecutable ?subClassOf}

## JSConstraint-js {=sh:JSConstraint-js .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript constraint] {+sh:js ?sh:path}

## JavaScript constraint component {=sh:JSConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component with the parameter sh:js linking to a sh:JSConstraint containing a sh:script.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:JSConstraint-js] {+sh:JSConstraint-js ?sh:parameter}

## JavaScript executable {=sh:JSExecutable .Class label @en}

[Abstract base class of resources that declare an executable JavaScript.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## JavaScript function {=sh:JSFunction .Class label @en}

[The class of SHACL functions that execute a JavaScript function when called.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Function] {+sh:Function ?subClassOf}
[JavaScript executable] {+sh:JSExecutable ?subClassOf}

## JavaScript library {=sh:JSLibrary .Class label @en}

[Represents a JavaScript library, typically identified by one or more URLs of files to include.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## JavaScript rule {=sh:JSRule .Class label @en}

[The class of SHACL rules expressed using JavaScript.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript executable] {+sh:JSExecutable ?subClassOf}
[Rule] {+sh:Rule ?subClassOf}

## JavaScript target {=sh:JSTarget .Class label @en}

[The class of targets that are based on JavaScript functions.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript executable] {+sh:JSExecutable ?subClassOf}
[Target] {+sh:Target ?subClassOf}

## JavaScript target type {=sh:JSTargetType .Class label @en}

[The (meta) class for parameterizable targets that are based on JavaScript functions.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript executable] {+sh:JSExecutable ?subClassOf}
[Target type] {+sh:TargetType ?subClassOf}

## JavaScript validator {=sh:JSValidator .Class label @en}

[A SHACL validator based on JavaScript. This can be used to declare SHACL constraint components that perform JavaScript-based validation when used.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript executable] {+sh:JSExecutable ?subClassOf}
[Validator] {+sh:Validator ?subClassOf}

## Language-in constraint component {=sh:LanguageInConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to enumerate language tags that all value nodes must have.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:LanguageInConstraintComponent-languageIn] {+sh:LanguageInConstraintComponent-languageIn ?sh:parameter}

## LanguageInConstraintComponent-languageIn {=sh:LanguageInConstraintComponent-languageIn .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[language in] {+sh:languageIn ?sh:path}

## Less-than constraint component {=sh:LessThanConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that each value node is smaller than all the nodes that have the focus node as subject and the value of a given property as predicate.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:LessThanConstraintComponent-lessThan] {+sh:LessThanConstraintComponent-lessThan ?sh:parameter}

## LessThanConstraintComponent-lessThan {=sh:LessThanConstraintComponent-lessThan .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[IRI] {+sh:IRI ?sh:nodeKind}
[less than] {+sh:lessThan ?sh:path}

## less-than-or-equals constraint component {=sh:LessThanOrEqualsConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that every value node is smaller than all the nodes that have the focus node as subject and the value of a given property as predicate.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:LessThanOrEqualsConstraintComponent-lessThanOrEquals] {+sh:LessThanOrEqualsConstraintComponent-lessThanOrEquals ?sh:parameter}

## LessThanOrEqualsConstraintComponent-lessThanOrEquals {=sh:LessThanOrEqualsConstraintComponent-lessThanOrEquals .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[IRI] {+sh:IRI ?sh:nodeKind}
[less than or equals] {+sh:lessThanOrEquals ?sh:path}

## Literal {=sh:Literal .sh:NodeKind label @en}

[The node kind of all literals.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## Max-count constraint component {=sh:MaxCountConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the maximum number of value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MaxCountConstraintComponent-maxCount] {+sh:MaxCountConstraintComponent-maxCount ?sh:parameter}

## MaxCountConstraintComponent-maxCount {=sh:MaxCountConstraintComponent-maxCount .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?sh:datatype}
[max count] {+sh:maxCount ?sh:path}

## Max-exclusive constraint component {=sh:MaxExclusiveConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the range of value nodes with a maximum exclusive value.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MaxExclusiveConstraintComponent-maxExclusive] {+sh:MaxExclusiveConstraintComponent-maxExclusive ?sh:parameter}

## MaxExclusiveConstraintComponent-maxExclusive {=sh:MaxExclusiveConstraintComponent-maxExclusive .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Literal] {+sh:Literal ?sh:nodeKind}
[max exclusive] {+sh:maxExclusive ?sh:path}

## Max-inclusive constraint component {=sh:MaxInclusiveConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the range of value nodes with a maximum inclusive value.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MaxInclusiveConstraintComponent-maxInclusive] {+sh:MaxInclusiveConstraintComponent-maxInclusive ?sh:parameter}

## MaxInclusiveConstraintComponent-maxInclusive {=sh:MaxInclusiveConstraintComponent-maxInclusive .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Literal] {+sh:Literal ?sh:nodeKind}
[max inclusive] {+sh:maxInclusive ?sh:path}

## Max-length constraint component {=sh:MaxLengthConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the maximum string length of value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MaxLengthConstraintComponent-maxLength] {+sh:MaxLengthConstraintComponent-maxLength ?sh:parameter}

## MaxLengthConstraintComponent-maxLength {=sh:MaxLengthConstraintComponent-maxLength .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?sh:datatype}
[max length] {+sh:maxLength ?sh:path}

## Min-count constraint component {=sh:MinCountConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the minimum number of value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MinCountConstraintComponent-minCount] {+sh:MinCountConstraintComponent-minCount ?sh:parameter}

## MinCountConstraintComponent-minCount {=sh:MinCountConstraintComponent-minCount .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?sh:datatype}
[min count] {+sh:minCount ?sh:path}

## Min-exclusive constraint component {=sh:MinExclusiveConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the range of value nodes with a minimum exclusive value.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MinExclusiveConstraintComponent-minExclusive] {+sh:MinExclusiveConstraintComponent-minExclusive ?sh:parameter}

## MinExclusiveConstraintComponent-minExclusive {=sh:MinExclusiveConstraintComponent-minExclusive .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Literal] {+sh:Literal ?sh:nodeKind}
[min exclusive] {+sh:minExclusive ?sh:path}

## Min-inclusive constraint component {=sh:MinInclusiveConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the range of value nodes with a minimum inclusive value.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MinInclusiveConstraintComponent-minInclusive] {+sh:MinInclusiveConstraintComponent-minInclusive ?sh:parameter}

## MinInclusiveConstraintComponent-minInclusive {=sh:MinInclusiveConstraintComponent-minInclusive .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Literal] {+sh:Literal ?sh:nodeKind}
[min inclusive] {+sh:minInclusive ?sh:path}

## Min-length constraint component {=sh:MinLengthConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the minimum string length of value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:MinLengthConstraintComponent-minLength] {+sh:MinLengthConstraintComponent-minLength ?sh:parameter}

## MinLengthConstraintComponent-minLength {=sh:MinLengthConstraintComponent-minLength .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?sh:datatype}
[min length] {+sh:minLength ?sh:path}

## Node constraint component {=sh:NodeConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that all value nodes conform to the given node shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:NodeConstraintComponent-node] {+sh:NodeConstraintComponent-node ?sh:parameter}

## NodeConstraintComponent-node {=sh:NodeConstraintComponent-node .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[node] {+sh:node ?sh:path}

## Node kind {=sh:NodeKind .Class label @en}

[The class of all node kinds, including sh:BlankNode, sh:IRI, sh:Literal or the combinations of these: sh:BlankNodeOrIRI, sh:BlankNodeOrLiteral, sh:IRIOrLiteral.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Node-kind constraint component {=sh:NodeKindConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the RDF node kind of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:NodeKindConstraintComponent-nodeKind] {+sh:NodeKindConstraintComponent-nodeKind ?sh:parameter}

## NodeKindConstraintComponent-nodeKind {=sh:NodeKindConstraintComponent-nodeKind .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[node kind] {+sh:nodeKind ?sh:path}

## Node shape {=sh:NodeShape .Class label @en}

[A node shape is a shape that specifies constraint that need to be met with respect to focus nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?subClassOf}

## Not constraint component {=sh:NotConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that value nodes do not conform to a given shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:NotConstraintComponent-not] {+sh:NotConstraintComponent-not ?sh:parameter}

## NotConstraintComponent-not {=sh:NotConstraintComponent-not .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[not] {+sh:not ?sh:path}

## Or constraint component {=sh:OrConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the value nodes so that they conform to at least one out of several provided shapes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:OrConstraintComponent-or] {+sh:OrConstraintComponent-or ?sh:parameter}

## OrConstraintComponent-or {=sh:OrConstraintComponent-or .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[or] {+sh:or ?sh:path}

## Parameter {=sh:Parameter .Class label @en}

[The class of parameter declarations, consisting of a path predicate and (possibly) information about allowed value type, cardinality and other characteristics.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Property shape] {+sh:PropertyShape ?subClassOf}

## Parameterizable {=sh:Parameterizable .Class label @en}

[Superclass of components that can take parameters, especially functions and constraint components.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Pattern constraint component {=sh:PatternConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that every value node matches a given regular expression.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:PatternConstraintComponent-flags] {+sh:PatternConstraintComponent-flags ?sh:parameter}
[sh:PatternConstraintComponent-pattern] {+sh:PatternConstraintComponent-pattern ?sh:parameter}

## PatternConstraintComponent-flags {=sh:PatternConstraintComponent-flags .sh:Parameter}

**true** {sh:optional ^^xsd:boolean}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?sh:datatype}
[flags] {+sh:flags ?sh:path}

## PatternConstraintComponent-pattern {=sh:PatternConstraintComponent-pattern .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?sh:datatype}
[pattern] {+sh:pattern ?sh:path}

## Prefix declaration {=sh:PrefixDeclaration .Class label @en}

[The class of prefix declarations, consisting of pairs of a prefix with a namespace.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Property constraint component {=sh:PropertyConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that all value nodes conform to the given property shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:PropertyConstraintComponent-property] {+sh:PropertyConstraintComponent-property ?sh:parameter}

## PropertyConstraintComponent-property {=sh:PropertyConstraintComponent-property .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[property] {+sh:property ?sh:path}

## Property group {=sh:PropertyGroup .Class label @en}

[Instances of this class represent groups of property shapes that belong together.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Property shape {=sh:PropertyShape .Class label @en}

[A property shape is a shape that specifies constraints on the values of a focus node for a given property or path.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?subClassOf}

## Qualified-max-count constraint component {=sh:QualifiedMaxCountConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that a specified maximum number of value nodes conforms to a given shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:QualifiedMaxCountConstraintComponent-qualifiedMaxCount] {+sh:QualifiedMaxCountConstraintComponent-qualifiedMaxCount ?sh:parameter}
[sh:QualifiedMaxCountConstraintComponent-qualifiedValueShape] {+sh:QualifiedMaxCountConstraintComponent-qualifiedValueShape ?sh:parameter}
[sh:QualifiedMaxCountConstraintComponent-qualifiedValueShapesDisjoint] {+sh:QualifiedMaxCountConstraintComponent-qualifiedValueShapesDisjoint ?sh:parameter}

## QualifiedMaxCountConstraintComponent-qualifiedMaxCount {=sh:QualifiedMaxCountConstraintComponent-qualifiedMaxCount .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?sh:datatype}
[qualified max count] {+sh:qualifiedMaxCount ?sh:path}

## QualifiedMaxCountConstraintComponent-qualifiedValueShape {=sh:QualifiedMaxCountConstraintComponent-qualifiedValueShape .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[qualified value shape] {+sh:qualifiedValueShape ?sh:path}

## QualifiedMaxCountConstraintComponent-qualifiedValueShapesDisjoint {=sh:QualifiedMaxCountConstraintComponent-qualifiedValueShapesDisjoint .sh:Parameter}

**true** {sh:optional ^^xsd:boolean}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?sh:datatype}
[qualified value shapes disjoint] {+sh:qualifiedValueShapesDisjoint ?sh:path}

## Qualified-min-count constraint component {=sh:QualifiedMinCountConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to verify that a specified minimum number of value nodes conforms to a given shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:QualifiedMinCountConstraintComponent-qualifiedMinCount] {+sh:QualifiedMinCountConstraintComponent-qualifiedMinCount ?sh:parameter}
[sh:QualifiedMinCountConstraintComponent-qualifiedValueShape] {+sh:QualifiedMinCountConstraintComponent-qualifiedValueShape ?sh:parameter}
[sh:QualifiedMinCountConstraintComponent-qualifiedValueShapesDisjoint] {+sh:QualifiedMinCountConstraintComponent-qualifiedValueShapesDisjoint ?sh:parameter}

## QualifiedMinCountConstraintComponent-qualifiedMinCount {=sh:QualifiedMinCountConstraintComponent-qualifiedMinCount .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?sh:datatype}
[qualified min count] {+sh:qualifiedMinCount ?sh:path}

## QualifiedMinCountConstraintComponent-qualifiedValueShape {=sh:QualifiedMinCountConstraintComponent-qualifiedValueShape .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[qualified value shape] {+sh:qualifiedValueShape ?sh:path}

## QualifiedMinCountConstraintComponent-qualifiedValueShapesDisjoint {=sh:QualifiedMinCountConstraintComponent-qualifiedValueShapesDisjoint .sh:Parameter}

**true** {sh:optional ^^xsd:boolean}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?sh:datatype}
[qualified value shapes disjoint] {+sh:qualifiedValueShapesDisjoint ?sh:path}

## Result annotation {=sh:ResultAnnotation .Class label @en}

[A class of result annotations, which define the rules to derive the values of a given annotation property as extra values for a validation result.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Rule {=sh:Rule .Class label @en}

[The class of SHACL rules. Never instantiated directly.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## SPARQL ASK executable {=sh:SPARQLAskExecutable .Class label @en}

[The class of SPARQL executables that are based on an ASK query.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL executable] {+sh:SPARQLExecutable ?subClassOf}

## SPARQL ASK validator {=sh:SPARQLAskValidator .Class label @en}

[The class of validators based on SPARQL ASK queries. The queries are evaluated for each value node and are supposed to return true if the given node conforms.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL ASK executable] {+sh:SPARQLAskExecutable ?subClassOf}
[Validator] {+sh:Validator ?subClassOf}

## SPARQL constraint {=sh:SPARQLConstraint .Class label @en}

[The class of constraints based on SPARQL SELECT queries.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL SELECT executable] {+sh:SPARQLSelectExecutable ?subClassOf}

## SPARQL constraint component {=sh:SPARQLConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to define constraints based on SPARQL queries.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:SPARQLConstraintComponent-sparql] {+sh:SPARQLConstraintComponent-sparql ?sh:parameter}

## SPARQLConstraintComponent-sparql {=sh:SPARQLConstraintComponent-sparql .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[constraint (in SPARQL)] {+sh:sparql ?sh:path}

## SPARQL CONSTRUCT executable {=sh:SPARQLConstructExecutable .Class label @en}

[The class of SPARQL executables that are based on a CONSTRUCT query.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL executable] {+sh:SPARQLExecutable ?subClassOf}

## SPARQL executable {=sh:SPARQLExecutable .Class label @en}

[The class of resources that encapsulate a SPARQL query.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## SPARQL function {=sh:SPARQLFunction .Class label @en}

[A function backed by a SPARQL query - either ASK or SELECT.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Function] {+sh:Function ?subClassOf}
[SPARQL ASK executable] {+sh:SPARQLAskExecutable ?subClassOf}
[SPARQL SELECT executable] {+sh:SPARQLSelectExecutable ?subClassOf}

## SPARQL CONSTRUCT rule {=sh:SPARQLRule .Class label @en}

[The class of SHACL rules based on SPARQL CONSTRUCT queries.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Rule] {+sh:Rule ?subClassOf}
[SPARQL CONSTRUCT executable] {+sh:SPARQLConstructExecutable ?subClassOf}

## SPARQL SELECT executable {=sh:SPARQLSelectExecutable .Class label @en}

[The class of SPARQL executables based on a SELECT query.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL executable] {+sh:SPARQLExecutable ?subClassOf}

## SPARQL SELECT validator {=sh:SPARQLSelectValidator .Class label @en}

[The class of validators based on SPARQL SELECT queries. The queries are evaluated for each focus node and are supposed to produce bindings for all focus nodes that do not conform.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL SELECT executable] {+sh:SPARQLSelectExecutable ?subClassOf}
[Validator] {+sh:Validator ?subClassOf}

## SPARQL target {=sh:SPARQLTarget .Class label @en}

[The class of targets that are based on SPARQL queries.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL ASK executable] {+sh:SPARQLAskExecutable ?subClassOf}
[SPARQL SELECT executable] {+sh:SPARQLSelectExecutable ?subClassOf}
[Target] {+sh:Target ?subClassOf}

## SPARQL target type {=sh:SPARQLTargetType .Class label @en}

[The (meta) class for parameterizable targets that are based on SPARQL queries.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL ASK executable] {+sh:SPARQLAskExecutable ?subClassOf}
[SPARQL SELECT executable] {+sh:SPARQLSelectExecutable ?subClassOf}
[Target type] {+sh:TargetType ?subClassOf}

## SPARQL UPDATE executable {=sh:SPARQLUpdateExecutable .Class label @en}

[The class of SPARQL executables based on a SPARQL UPDATE.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL executable] {+sh:SPARQLExecutable ?subClassOf}

## Severity {=sh:Severity .Class label @en}

[The class of validation result severity levels, including violation and warning levels.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Shape {=sh:Shape .Class label @en}

[A shape is a collection of constraints that may be targeted for certain nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Target {=sh:Target .Class label @en}

[The base class of targets such as those based on SPARQL queries.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Target type {=sh:TargetType .Class label @en}

[The (meta) class for parameterizable targets.	Instances of this are instantiated as values of the sh:target property.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Class] {+Class ?subClassOf}
[Parameterizable] {+sh:Parameterizable ?subClassOf}

## A rule based on triple (subject, predicate, object) pattern. {=sh:TripleRule .Class label @en}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Rule] {+sh:Rule ?subClassOf}

## Unique-languages constraint component {=sh:UniqueLangConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to specify that no pair of value nodes may use the same language tag.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:UniqueLangConstraintComponent-uniqueLang] {+sh:UniqueLangConstraintComponent-uniqueLang ?sh:parameter}

## UniqueLangConstraintComponent-uniqueLang {=sh:UniqueLangConstraintComponent-uniqueLang .sh:Parameter}

`1` {sh:maxCount ^^xsd:integer}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?sh:datatype}
[unique languages] {+sh:uniqueLang ?sh:path}

## Validation report {=sh:ValidationReport .Class label @en}

[The class of SHACL validation reports.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Validation result {=sh:ValidationResult .Class label @en}

[The class of validation results.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Abstract result] {+sh:AbstractResult ?subClassOf}

## Validator {=sh:Validator .Class label @en}

[The class of validators, which provide instructions on how to process a constraint definition. This class serves as base class for the SPARQL-based validators and other possible implementations.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

## Violation {=sh:Violation .sh:Severity label @en}

[The severity for a violation validation result.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## Warning {=sh:Warning .sh:Severity label @en}

[The severity for a warning validation result.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## Exactly one constraint component {=sh:XoneConstraintComponent .sh:ConstraintComponent label @en}

[A constraint component that can be used to restrict the value nodes so that they conform to exactly one out of several provided shapes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[sh:XoneConstraintComponent-xone] {+sh:XoneConstraintComponent-xone ?sh:parameter}

## XoneConstraintComponent-xone {=sh:XoneConstraintComponent-xone .sh:Parameter}

[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[exactly one] {+sh:xone ?sh:path}

## alternative path {=sh:alternativePath .rdf:Property label @en}

[The (single) value of this property must be a list of path elements, representing the elements of alternative paths.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## and {=sh:and .rdf:Property label @en}

[RDF list of shapes to validate the value nodes against.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## annotation property {=sh:annotationProperty .rdf:Property label @en}

[The annotation property that shall be set.] {comment @en}
[Result annotation] {+sh:ResultAnnotation ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## annotation value {=sh:annotationValue .rdf:Property label @en}

[The (default) values of the annotation property.] {comment @en}
[Result annotation] {+sh:ResultAnnotation ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## annotation variable name {=sh:annotationVarName .rdf:Property label @en}

[The name of the SPARQL variable from the SELECT clause that shall be used for the values.] {comment @en}
[Result annotation] {+sh:ResultAnnotation ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## ask {=sh:ask .rdf:Property label @en}

[The SPARQL ASK query to execute.] {comment @en}
[SPARQL ASK executable] {+sh:SPARQLAskExecutable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## class {=sh:class .rdf:Property label @en}

[The type that all value nodes must have.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Class] {+Class ?range}

## closed {=sh:closed .rdf:Property label @en}

[If set to true then the shape is closed.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## condition {=sh:condition .rdf:Property label @en}

[The shapes that the focus nodes need to conform to before a rule is executed on them.] {comment @en}
[Rule] {+sh:Rule ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?range}

## conforms {=sh:conforms .rdf:Property label @en}

[True if the validation did not produce any validation results, and false otherwise.] {comment @en}
[Validation report] {+sh:ValidationReport ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## construct {=sh:construct .rdf:Property label @en}

[The SPARQL CONSTRUCT query to execute.] {comment @en}
[SPARQL CONSTRUCT executable] {+sh:SPARQLConstructExecutable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## datatype {=sh:datatype .rdf:Property label @en}

[Specifies an RDF datatype that all value nodes must have.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Datatype] {+Datatype ?range}

## deactivated {=sh:deactivated .rdf:Property label @en}

[If set to true then all nodes conform to this.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## declare {=sh:declare .rdf:Property label @en}

[Links a resource with its namespace prefix declarations.] {comment @en}
[owl:Ontology] {+owl:Ontology ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Prefix declaration] {+sh:PrefixDeclaration ?range}

## default value {=sh:defaultValue .rdf:Property label @en}

[A default value for a property, for example for user interface tools to pre-populate input fields.] {comment @en}
[Property shape] {+sh:PropertyShape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## description {=sh:description .rdf:Property label @en}

[Human-readable descriptions for the property in the context of the surrounding shape.] {comment @en}
[Property shape] {+sh:PropertyShape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## detail {=sh:detail .rdf:Property label @en}

[Links a result with other results that provide more details, for example to describe violations against nested shapes.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Abstract result] {+sh:AbstractResult ?range}

## disjoint {=sh:disjoint .rdf:Property label @en}

[Specifies a property where the set of values must be disjoint with the value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## entailment {=sh:entailment .rdf:Property label @en}

[An entailment regime that indicates what kind of inferencing is required by a shapes graph.] {comment @en}
[owl:Ontology] {+owl:Ontology ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}

## equals {=sh:equals .rdf:Property label @en}

[Specifies a property that must have the same values as the value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## expression {=sh:expression .rdf:Property label @en}

[The node expression that must return true for the value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## filter shape {=sh:filterShape .rdf:Property label @en}

[The shape that all input nodes of the expression need to conform to.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?range}

## flags {=sh:flags .rdf:Property label @en}

[An optional flag to be used with regular expression pattern matching.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## focus node {=sh:focusNode .rdf:Property label @en}

[The focus node that was validated when the result was produced.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## group {=sh:group .rdf:Property label @en}

[Can be used to link to a property group to indicate that a property shape belongs to a group of related property shapes.] {comment @en}
[Property shape] {+sh:PropertyShape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Property group] {+sh:PropertyGroup ?range}

## has value {=sh:hasValue .rdf:Property label @en}

[Specifies a value that must be among the value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## ignored properties {=sh:ignoredProperties .rdf:Property label @en}

[An optional RDF list of properties that are also permitted in addition to those explicitly enumerated via sh:property/sh:path.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## in {=sh:in .rdf:Property label @en}

[Specifies a list of allowed values so that each value node must be among the members of the given list.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## intersection {=sh:intersection .rdf:Property label @en}

[A list of node expressions that shall be intersected.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## inverse path {=sh:inversePath .rdf:Property label @en}

[The (single) value of this property represents an inverse path (object to subject).] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}

## JavaScript constraint {=sh:js .rdf:Property label @en}

[Constraints expressed in JavaScript.] {comment}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript-based constraint] {+sh:JSConstraint ?range}

## JavaScript function name {=sh:jsFunctionName .rdf:Property label @en}

[The name of the JavaScript function to execute.] {comment @en}
[JavaScript executable] {+sh:JSExecutable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## JavaScript library {=sh:jsLibrary .rdf:Property label @en}

[Declares which JavaScript libraries are needed to execute this.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[JavaScript library] {+sh:JSLibrary ?range}

## JavaScript library URL {=sh:jsLibraryURL .rdf:Property label @en}

[Declares the URLs of a JavaScript library. This should be the absolute URL of a JavaScript file. Implementations may redirect those to local files.] {comment @en}
[JavaScript library] {+sh:JSLibrary ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

## label template {=sh:labelTemplate .rdf:Property label @en}

[Outlines how human-readable labels of instances of the associated Parameterizable shall be produced. The values can contain {?paramName} as placeholders for the actual values of the given parameter.] {comment @en}
[Parameterizable] {+sh:Parameterizable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## language in {=sh:languageIn .rdf:Property label @en}

[Specifies a list of language tags that all value nodes must have.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## less than {=sh:lessThan .rdf:Property label @en}

[Specifies a property that must have smaller values than the value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## less than or equals {=sh:lessThanOrEquals .rdf:Property label @en}

[Specifies a property that must have smaller or equal values than the value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## max count {=sh:maxCount .rdf:Property label @en}

[Specifies the maximum number of values in the set of value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

## max exclusive {=sh:maxExclusive .rdf:Property label @en}

[Specifies the maximum exclusive value of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## max inclusive {=sh:maxInclusive .rdf:Property label @en}

[Specifies the maximum inclusive value of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## max length {=sh:maxLength .rdf:Property label @en}

[Specifies the maximum string length of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

## message {=sh:message .rdf:Property label @en}

[A human-readable message (possibly with placeholders for variables) explaining the cause of the result.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## min count {=sh:minCount .rdf:Property label @en}

[Specifies the minimum number of values in the set of value nodes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

## min exclusive {=sh:minExclusive .rdf:Property label @en}

[Specifies the minimum exclusive value of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## min inclusive {=sh:minInclusive .rdf:Property label @en}

[Specifies the minimum inclusive value of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## min length {=sh:minLength .rdf:Property label @en}

[Specifies the minimum string length of each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

## name {=sh:name .rdf:Property label @en}

[Human-readable labels for the property in the context of the surrounding shape.] {comment @en}
[Property shape] {+sh:PropertyShape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## namespace {=sh:namespace .rdf:Property label @en}

[The namespace associated with a prefix in a prefix declaration.] {comment @en}
[Prefix declaration] {+sh:PrefixDeclaration ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

## node {=sh:node .rdf:Property label @en}

[Specifies the node shape that all value nodes must conform to.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Node shape] {+sh:NodeShape ?range}

## node kind {=sh:nodeKind .rdf:Property label @en}

[Specifies the node kind (e.g. IRI or literal) each value node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Node kind] {+sh:NodeKind ?range}

## shape validator {=sh:nodeValidator .rdf:Property label @en}

[The validator(s) used to evaluate a constraint in the context of a node shape.] {comment @en}
[Constraint component] {+sh:ConstraintComponent ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Validator] {+sh:Validator ?range}

## nodes {=sh:nodes .rdf:Property label @en}

[The node expression producing the input nodes of a filter shape expression.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## not {=sh:not .rdf:Property label @en}

[Specifies a shape that the value nodes must not conform to.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?range}

## object {=sh:object .rdf:Property label @en}

[An expression producing the nodes that shall be inferred as objects.] {comment @en}
[A rule based on triple (subject, predicate, object) pattern.] {+sh:TripleRule ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## one or more path {=sh:oneOrMorePath .rdf:Property label @en}

[The (single) value of this property represents a path that is matched one or more times.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}

## optional {=sh:optional .rdf:Property label @en}

[Indicates whether a parameter is optional.] {comment @en}
[Parameter] {+sh:Parameter ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## or {=sh:or .rdf:Property label @en}

[Specifies a list of shapes so that the value nodes must conform to at least one of the shapes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## order {=sh:order .rdf:Property label @en}

[Specifies the relative order of this compared to its siblings. For example use 0 for the first, 1 for the second.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## parameter {=sh:parameter .rdf:Property label @en}

[The parameters of a function or constraint component.] {comment @en}
[Parameterizable] {+sh:Parameterizable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Parameter] {+sh:Parameter ?range}

## path {=sh:path .rdf:Property label @en}

[Specifies the property path of a property shape.] {comment @en}
[Property shape] {+sh:PropertyShape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}

## pattern {=sh:pattern .rdf:Property label @en}

[Specifies a regular expression pattern that the string representations of the value nodes must match.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## predicate {=sh:predicate .rdf:Property label @en}

[An expression producing the properties that shall be inferred as predicates.] {comment @en}
[A rule based on triple (subject, predicate, object) pattern.] {+sh:TripleRule ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## prefix {=sh:prefix .rdf:Property label @en}

[The prefix of a prefix declaration.] {comment @en}
[Prefix declaration] {+sh:PrefixDeclaration ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## prefixes {=sh:prefixes .rdf:Property label @en}

[The prefixes that shall be applied before parsing the associated SPARQL query.] {comment @en}
[SPARQL executable] {+sh:SPARQLExecutable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[owl:Ontology] {+owl:Ontology ?range}

## property {=sh:property .rdf:Property label @en}

[Links a shape to its property shapes.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Property shape] {+sh:PropertyShape ?range}

## property validator {=sh:propertyValidator .rdf:Property label @en}

[The validator(s) used to evaluate a constraint in the context of a property shape.] {comment @en}
[Constraint component] {+sh:ConstraintComponent ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Validator] {+sh:Validator ?range}

## qualified max count {=sh:qualifiedMaxCount .rdf:Property label @en}

[The maximum number of value nodes that can conform to the shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

## qualified min count {=sh:qualifiedMinCount .rdf:Property label @en}

[The minimum number of value nodes that must conform to the shape.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

## qualified value shape {=sh:qualifiedValueShape .rdf:Property label @en}

[The shape that a specified number of values must conform to.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?range}

## qualified value shapes disjoint {=sh:qualifiedValueShapesDisjoint .rdf:Property label @en}

[Can be used to mark the qualified value shape to be disjoint with its sibling shapes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## result {=sh:result .rdf:Property label @en}

[The validation results contained in a validation report.] {comment @en}
[Validation report] {+sh:ValidationReport ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Validation result] {+sh:ValidationResult ?range}

## result annotation {=sh:resultAnnotation .rdf:Property label @en}

[Links a SPARQL validator with zero or more sh:ResultAnnotation instances, defining how to derive additional result properties based on the variables of the SELECT query.] {comment @en}
[SPARQL SELECT validator] {+sh:SPARQLSelectValidator ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Result annotation] {+sh:ResultAnnotation ?range}

## result message {=sh:resultMessage .rdf:Property label @en}

[Human-readable messages explaining the cause of the result.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## result path {=sh:resultPath .rdf:Property label @en}

[The path of a validation result, based on the path of the validated property shape.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}

## result severity {=sh:resultSeverity .rdf:Property label @en}

[The severity of the result, e.g. warning.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Severity] {+sh:Severity ?range}

## return type {=sh:returnType .rdf:Property label @en}

[The expected type of values returned by the associated function.] {comment @en}
[Function] {+sh:Function ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Class] {+Class ?range}

## rule {=sh:rule .rdf:Property label @en}

[The rules linked to a shape.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Rule] {+sh:Rule ?range}

## select {=sh:select .rdf:Property label @en}

[The SPARQL SELECT query to execute.] {comment @en}
[SPARQL SELECT executable] {+sh:SPARQLSelectExecutable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## severity {=sh:severity .rdf:Property label @en}

[Defines the severity that validation results produced by a shape must have. Defaults to sh:Violation.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Severity] {+sh:Severity ?range}

## shapes graph {=sh:shapesGraph .rdf:Property label @en}

[Shapes graphs that should be used when validating this data graph.] {comment @en}
[owl:Ontology] {+owl:Ontology ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[owl:Ontology] {+owl:Ontology ?range}

## shapes graph well-formed {=sh:shapesGraphWellFormed .rdf:Property label @en}

[If true then the validation engine was certain that the shapes graph has passed all SHACL syntax requirements during the validation process.] {comment @en}
[Validation report] {+sh:ValidationReport ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## source constraint {=sh:sourceConstraint .rdf:Property label @en}

[The constraint that was validated when the result was produced.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## source constraint component {=sh:sourceConstraintComponent .rdf:Property label @en}

[The constraint component that is the source of the result.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Constraint component] {+sh:ConstraintComponent ?range}

## source shape {=sh:sourceShape .rdf:Property label @en}

[The shape that is was validated when the result was produced.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Shape] {+sh:Shape ?range}

## constraint (in SPARQL) {=sh:sparql .rdf:Property label @en}

[Links a shape with SPARQL constraints.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[SPARQL constraint] {+sh:SPARQLConstraint ?range}

## subject {=sh:subject .rdf:Property label @en}

[An expression producing the resources that shall be inferred as subjects.] {comment @en}
[A rule based on triple (subject, predicate, object) pattern.] {+sh:TripleRule ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## suggested shapes graph {=sh:suggestedShapesGraph .rdf:Property label @en}

[Suggested shapes graphs for this ontology. The values of this property may be used in the absence of specific sh:shapesGraph statements.] {comment @en}
[owl:Ontology] {+owl:Ontology ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[owl:Ontology] {+owl:Ontology ?range}

## target {=sh:target .rdf:Property label @en}

[Links a shape to a target specified by an extension language, for example instances of sh:SPARQLTarget.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Target] {+sh:Target ?range}

## target class {=sh:targetClass .rdf:Property label @en}

[Links a shape to a class, indicating that all instances of the class must conform to the shape.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Class] {+Class ?range}

## target node {=sh:targetNode .rdf:Property label @en}

[Links a shape to individual nodes, indicating that these nodes must conform to the shape.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## target objects of {=sh:targetObjectsOf .rdf:Property label @en}

[Links a shape to a property, indicating that all all objects of triples that have the given property as their predicate must conform to the shape.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## target subjects of {=sh:targetSubjectsOf .rdf:Property label @en}

[Links a shape to a property, indicating that all subjects of triples that have the given property as their predicate must conform to the shape.] {comment @en}
[Shape] {+sh:Shape ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

## this {=sh:this .Resource label @en}

[A node expression that represents the current focus node.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## union {=sh:union .rdf:Property label @en}

[A list of node expressions that shall be used together.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## unique languages {=sh:uniqueLang .rdf:Property label @en}

[Specifies whether all node values must have a unique (or no) language tag.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

## update {=sh:update .rdf:Property label @en}

[The SPARQL UPDATE to execute.] {comment @en}
[SPARQL UPDATE executable] {+sh:SPARQLUpdateExecutable ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

## validator {=sh:validator .rdf:Property label @en}

[The validator(s) used to evaluate constraints of either node or property shapes.] {comment @en}
[Constraint component] {+sh:ConstraintComponent ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Validator] {+sh:Validator ?range}

## value {=sh:value .rdf:Property label @en}

[An RDF node that has caused the result.] {comment @en}
[Abstract result] {+sh:AbstractResult ?domain}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}

## exactly one {=sh:xone .rdf:Property label @en}

[Specifies a list of shapes so that the value nodes must conform to exactly one of the shapes.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

## zero or more path {=sh:zeroOrMorePath .rdf:Property label @en}

[The (single) value of this property represents a path that is matched zero or more times.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}

## zero or one path {=sh:zeroOrOnePath .rdf:Property label @en}

[The (single) value of this property represents a path that is matched zero or one times.] {comment @en}
[W3C Shapes Constraint Language (SHACL) Vocabulary] {+sh: ?isDefinedBy}
[Resource] {+Resource ?range}