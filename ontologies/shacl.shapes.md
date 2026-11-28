[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[sh] <http://www.w3.org/ns/shacl#>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# SHACL Vocabulary Shapes

Validation pack for graphs that *use* SHACL — shape documents themselves.
Merge with any shape-bearing document and `validate()` enforces
well-formedness of constraint parameters: IRIs where IRIs belong,
literals where literals belong, paths that are paths.

The shapes target `sh:PropertyShape` and `sh:NodeShape` instances, so
vocabularies that merely *define* SHACL terms (like `shacl.md` itself)
are never flagged — only actual shape usage is.

======

## pack/ConstraintParamShape {=cat:pack/ConstraintParamShape .sh:NodeShape}
[Constraint parameters typed] {sh:name}
[cat:pack/bniri/in] {+cat:pack/bniri/in ?sh:property}
[cat:pack/bniri/languageIn] {+cat:pack/bniri/languageIn ?sh:property}
[cat:pack/bniri/path] {+cat:pack/bniri/path ?sh:property}
[cat:pack/iri/class] {+cat:pack/iri/class ?sh:property}
[cat:pack/iri/datatype] {+cat:pack/iri/datatype ?sh:property}
[cat:pack/iri/disjoint] {+cat:pack/iri/disjoint ?sh:property}
[cat:pack/iri/equals] {+cat:pack/iri/equals ?sh:property}
[cat:pack/iri/js] {+cat:pack/iri/js ?sh:property}
[cat:pack/iri/lessThan] {+cat:pack/iri/lessThan ?sh:property}
[cat:pack/iri/lessThanOrEquals] {+cat:pack/iri/lessThanOrEquals ?sh:property}
[cat:pack/iri/node] {+cat:pack/iri/node ?sh:property}
[cat:pack/iri/nodeKind] {+cat:pack/iri/nodeKind ?sh:property}
[cat:pack/iri/severity] {+cat:pack/iri/severity ?sh:property}
[cat:pack/iri/targetClass] {+cat:pack/iri/targetClass ?sh:property}
[cat:pack/iri/targetNode] {+cat:pack/iri/targetNode ?sh:property}
[cat:pack/iri/targetObjectsOf] {+cat:pack/iri/targetObjectsOf ?sh:property}
[cat:pack/iri/targetSubjectsOf] {+cat:pack/iri/targetSubjectsOf ?sh:property}
[cat:pack/lit/closed] {+cat:pack/lit/closed ?sh:property}
[cat:pack/lit/deactivated] {+cat:pack/lit/deactivated ?sh:property}
[cat:pack/lit/flags] {+cat:pack/lit/flags ?sh:property}
[cat:pack/lit/maxCount] {+cat:pack/lit/maxCount ?sh:property}
[cat:pack/lit/maxExclusive] {+cat:pack/lit/maxExclusive ?sh:property}
[cat:pack/lit/maxInclusive] {+cat:pack/lit/maxInclusive ?sh:property}
[cat:pack/lit/maxLength] {+cat:pack/lit/maxLength ?sh:property}
[cat:pack/lit/message] {+cat:pack/lit/message ?sh:property}
[cat:pack/lit/minCount] {+cat:pack/lit/minCount ?sh:property}
[cat:pack/lit/minExclusive] {+cat:pack/lit/minExclusive ?sh:property}
[cat:pack/lit/minInclusive] {+cat:pack/lit/minInclusive ?sh:property}
[cat:pack/lit/minLength] {+cat:pack/lit/minLength ?sh:property}
[cat:pack/lit/name] {+cat:pack/lit/name ?sh:property}
[cat:pack/lit/optional] {+cat:pack/lit/optional ?sh:property}
[cat:pack/lit/pattern] {+cat:pack/lit/pattern ?sh:property}
[cat:pack/lit/uniqueLang] {+cat:pack/lit/uniqueLang ?sh:property}
[sh:PropertyShape] {+sh:PropertyShape ?sh:targetClass}

## pack/NodeShapeDiscipline {=cat:pack/NodeShapeDiscipline .sh:NodeShape}
[Node shape targets and flags typed] {sh:name}
[cat:pack/node/closed] {+cat:pack/node/closed ?sh:property}
[cat:pack/node/deactivated] {+cat:pack/node/deactivated ?sh:property}
[cat:pack/node/message] {+cat:pack/node/message ?sh:property}
[cat:pack/node/name] {+cat:pack/node/name ?sh:property}
[cat:pack/node/targetClass] {+cat:pack/node/targetClass ?sh:property}
[cat:pack/node/targetNode] {+cat:pack/node/targetNode ?sh:property}
[cat:pack/node/targetObjectsOf] {+cat:pack/node/targetObjectsOf ?sh:property}
[cat:pack/node/targetSubjectsOf] {+cat:pack/node/targetSubjectsOf ?sh:property}
[sh:NodeShape] {+sh:NodeShape ?sh:targetClass}

### IRI-valued parameters

Every constraint that references another resource — classes, datatypes, shapes, paths-as-IRIs, cross-property links — must point at an IRI.

## pack/iri/class {=cat:pack/iri/class .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[class] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:class] {+sh:class ?sh:path}

## pack/iri/datatype {=cat:pack/iri/datatype .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[datatype] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:datatype] {+sh:datatype ?sh:path}

## pack/iri/disjoint {=cat:pack/iri/disjoint .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[disjoint] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:disjoint] {+sh:disjoint ?sh:path}

## pack/iri/equals {=cat:pack/iri/equals .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[equals] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:equals] {+sh:equals ?sh:path}

## pack/iri/js {=cat:pack/iri/js .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[js] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:js] {+sh:js ?sh:path}

## pack/iri/lessThan {=cat:pack/iri/lessThan .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[lessThan] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:lessThan] {+sh:lessThan ?sh:path}

## pack/iri/lessThanOrEquals {=cat:pack/iri/lessThanOrEquals .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[lessThanOrEquals] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:lessThanOrEquals] {+sh:lessThanOrEquals ?sh:path}

## pack/iri/node {=cat:pack/iri/node .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[node] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:node] {+sh:node ?sh:path}

## pack/iri/nodeKind {=cat:pack/iri/nodeKind .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[nodeKind] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:nodeKind] {+sh:nodeKind ?sh:path}

## pack/iri/severity {=cat:pack/iri/severity .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[severity] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:severity] {+sh:severity ?sh:path}

## pack/iri/targetClass {=cat:pack/iri/targetClass .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetClass] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetClass] {+sh:targetClass ?sh:path}

## pack/iri/targetNode {=cat:pack/iri/targetNode .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetNode] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetNode] {+sh:targetNode ?sh:path}

## pack/iri/targetObjectsOf {=cat:pack/iri/targetObjectsOf .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetObjectsOf] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetObjectsOf] {+sh:targetObjectsOf ?sh:path}

## pack/iri/targetSubjectsOf {=cat:pack/iri/targetSubjectsOf .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetSubjectsOf] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetSubjectsOf] {+sh:targetSubjectsOf ?sh:path}

### Path and list parameters

`sh:path` and RDF-list parameters (`sh:in`, `sh:languageIn`) accept an IRI *or* a blank node — complex paths and lists are blank-node structures.

## pack/bniri/in {=cat:pack/bniri/in .sh:PropertyShape}
[IRI or blank node required — {$focusNode} on {$path}] {sh:message}
[in] {sh:name}
[sh:BlankNodeOrIRI] {+sh:BlankNodeOrIRI ?sh:nodeKind}
[sh:in] {+sh:in ?sh:path}

## pack/bniri/languageIn {=cat:pack/bniri/languageIn .sh:PropertyShape}
[IRI or blank node required — {$focusNode} on {$path}] {sh:message}
[languageIn] {sh:name}
[sh:BlankNodeOrIRI] {+sh:BlankNodeOrIRI ?sh:nodeKind}
[sh:languageIn] {+sh:languageIn ?sh:path}

## pack/bniri/path {=cat:pack/bniri/path .sh:PropertyShape}
[IRI or blank node required — {$focusNode} on {$path}] {sh:message}
[path] {sh:name}
[sh:BlankNodeOrIRI] {+sh:BlankNodeOrIRI ?sh:nodeKind}
[sh:path] {+sh:path ?sh:path}

### Literal-valued parameters

Counts, ranges, lengths, patterns, flags, and text (`sh:message`, `sh:name`) must be literals — never IRIs or blank nodes.

## pack/lit/closed {=cat:pack/lit/closed .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[closed] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:closed] {+sh:closed ?sh:path}

## pack/lit/deactivated {=cat:pack/lit/deactivated .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[deactivated] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:deactivated] {+sh:deactivated ?sh:path}

## pack/lit/flags {=cat:pack/lit/flags .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[flags] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:flags] {+sh:flags ?sh:path}

## pack/lit/maxCount {=cat:pack/lit/maxCount .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[maxCount] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:maxCount] {+sh:maxCount ?sh:path}

## pack/lit/maxExclusive {=cat:pack/lit/maxExclusive .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[maxExclusive] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:maxExclusive] {+sh:maxExclusive ?sh:path}

## pack/lit/maxInclusive {=cat:pack/lit/maxInclusive .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[maxInclusive] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:maxInclusive] {+sh:maxInclusive ?sh:path}

## pack/lit/maxLength {=cat:pack/lit/maxLength .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[maxLength] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:maxLength] {+sh:maxLength ?sh:path}

## pack/lit/message {=cat:pack/lit/message .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[message] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:message] {+sh:message ?sh:path}

## pack/lit/minCount {=cat:pack/lit/minCount .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[minCount] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:minCount] {+sh:minCount ?sh:path}

## pack/lit/minExclusive {=cat:pack/lit/minExclusive .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[minExclusive] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:minExclusive] {+sh:minExclusive ?sh:path}

## pack/lit/minInclusive {=cat:pack/lit/minInclusive .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[minInclusive] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:minInclusive] {+sh:minInclusive ?sh:path}

## pack/lit/minLength {=cat:pack/lit/minLength .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[minLength] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:minLength] {+sh:minLength ?sh:path}

## pack/lit/name {=cat:pack/lit/name .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[name] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:name] {+sh:name ?sh:path}

## pack/lit/optional {=cat:pack/lit/optional .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[optional] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:optional] {+sh:optional ?sh:path}

## pack/lit/pattern {=cat:pack/lit/pattern .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[pattern] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:pattern] {+sh:pattern ?sh:path}

## pack/lit/uniqueLang {=cat:pack/lit/uniqueLang .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[uniqueLang] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:uniqueLang] {+sh:uniqueLang ?sh:path}

### Node-shape discipline

`sh:NodeShape` instances get the same treatment: targets must be IRIs, flags and text must be literals.

## pack/node/closed {=cat:pack/node/closed .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[closed] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:closed] {+sh:closed ?sh:path}

## pack/node/deactivated {=cat:pack/node/deactivated .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[deactivated] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:deactivated] {+sh:deactivated ?sh:path}

## pack/node/message {=cat:pack/node/message .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[message] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:message] {+sh:message ?sh:path}

## pack/node/name {=cat:pack/node/name .sh:PropertyShape}
[Literal required — {$focusNode} on {$path}] {sh:message}
[name] {sh:name}
[sh:Literal] {+sh:Literal ?sh:nodeKind}
[sh:name] {+sh:name ?sh:path}

## pack/node/targetClass {=cat:pack/node/targetClass .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetClass] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetClass] {+sh:targetClass ?sh:path}

## pack/node/targetNode {=cat:pack/node/targetNode .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetNode] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetNode] {+sh:targetNode ?sh:path}

## pack/node/targetObjectsOf {=cat:pack/node/targetObjectsOf .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetObjectsOf] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetObjectsOf] {+sh:targetObjectsOf ?sh:path}

## pack/node/targetSubjectsOf {=cat:pack/node/targetSubjectsOf .sh:PropertyShape}
[IRI required — {$focusNode} on {$path}] {sh:message}
[targetSubjectsOf] {sh:name}
[sh:IRI] {+sh:IRI ?sh:nodeKind}
[sh:targetSubjectsOf] {+sh:targetSubjectsOf ?sh:path}
======

## Examples

Each `cat:Demo` carries its own contract in the graph: the source lives in
the annotated fence, expectations are quads — `cat:expectedViolations`
for validation. `node ontologies/selftest.mjs` verifies all three
(partition is explicit: pack shapes vs demo data).

## Well-formed shape document {=cat:demo/wellformed .cat:Demo label}

[0] {cat:expectedViolations ^^xsd:integer}

~~~~~~md {cat:demo}
[ex] <tag:ex,2026:shapes/>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

## Email Rule {=ex:EmailRule .sh:PropertyShape sh:name}
[Email address] {+ex:email ?sh:path}
[email node] {+ex:EmailNode ?sh:node}
[at least] {sh:minCount ^^xsd:integer}
[email required] {sh:message ^^xsd:string}

## Name Rule {=ex:NameRule .sh:PropertyShape sh:name}
[Display name] {+ex:name ?sh:path}
[non-empty] {sh:minLength ^^xsd:integer}

## Email Shape {=ex:EmailShape .sh:NodeShape sh:name}
[Email] {+ex:Email ?sh:targetClass}
[email rule] {+ex:EmailRule ?sh:property}
[is closed] {sh:closed ^^xsd:boolean}
~~~~~~

## Shape with mistyped parameters {=cat:demo/mistyped .cat:Demo label}

[5] {cat:expectedViolations ^^xsd:integer}

~~~~~~md {cat:demo}
[ex] <tag:ex,2026:shapes/>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

## Bad Rule {=ex:BadRule .sh:PropertyShape sh:name}
[email] {+ex:email ?sh:path}
`not an IRI` {sh:datatype}
[bad count] {+ex:badCount ?sh:minCount}
`not a path` {sh:path}
`not a node` {sh:node}
`not an IRI` {sh:severity}
~~~~~~

## Node shape with mistyped targets {=cat:demo/badtarget .cat:Demo label}

[3] {cat:expectedViolations ^^xsd:integer}

~~~~~~md {cat:demo}
[ex] <tag:ex,2026:shapes/>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

## Bad Shape {=ex:BadShape .sh:NodeShape sh:name}
`Email` {sh:targetClass}
`42` {sh:targetNode ^^xsd:integer}
[flag as IRI] {+ex:closedFlag ?sh:closed}
~~~~~~
