[pack] <https://mdld.js.org/ns/pack/>

# RDFS Vocabulary Shapes

Validation pack for the RDF Schema vocabulary — the rule that makes a vocabulary *readable*: every declared class, property, and datatype must carry an `rdfs:label`. Merge with your ontology document and `validate()` enforces named-concept discipline.

======

# RDFS Class Shape {=pack:ClassShape .sh:NodeShape label}

Every [class] {+rdfs:Class ?sh:targetClass} has a **label** {+#classLabel ?sh:property sh:name} and may carry a **comment** {+#classComment ?sh:property sh:name} — a class without a name is a category error waiting to happen.

`Class label is required — {$focusNode} missing {$path}` {=#classLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Class comment — {$focusNode}` {=#classComment .sh:PropertyShape sh:name} reads our [comment] {+rdfs:comment ?sh:path}.

# RDFS Property Shape {=pack:PropertyShape .sh:NodeShape label}

Every [property] {+rdf:Property ?sh:targetClass} has a **label** {+#propLabel ?sh:property sh:name} and may carry a **comment** {+#propComment ?sh:property sh:name} — an unnamed predicate is a verb without a subject.

`Property label is required — {$focusNode} missing {$path}` {=#propLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Property comment — {$focusNode}` {=#propComment .sh:PropertyShape sh:name} reads our [comment] {+rdfs:comment ?sh:path}.

# RDFS Datatype Shape {=pack:DatatypeShape .sh:NodeShape label}

Every [datatype] {+rdfs:Datatype ?sh:targetClass} has a **label** {+#dtLabel ?sh:property sh:name} — a datatype without a name can't be documented for users.

`Datatype label is required — {$focusNode} missing {$path}` {=#dtLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

======

## Examples

Each `pack:Demo` node carries its own contract in the graph: the source lives in the annotated fence, expectations are quads — `pack:expectedViolations` for validation and `pack:extractedPOJO` for extraction. `selftest.mjs` verifies all three.

## Named class hierarchy {=pack:rdfsExample .pack:Demo label}

[0] {pack:expectedViolations ^^xsd:integer}
`{"ClassShape":{"ex:Animal":{"label":"Animal","comment":"a living thing"},"ex:Dog":{"label":"Dog","comment":"a domestic canine"}},"PropertyShape":{"ex:name":{"label":"name","comment":"the name of something"}},"DatatypeShape":{}}` {pack:extractedPOJO}

~~~~~~md {pack:demo}
[ex] <tag:example,2026:rdfs-pack/>

# Animal {=ex:Animal .rdfs:Class label}
`a living thing` {comment}

# Dog {=ex:Dog .rdfs:Class label}
`a domestic canine` {comment} — a kind of [animal] {+ex:Animal ?rdfs:subClassOf}.

# name {=ex:name .rdf:Property label}
`the name of something` {comment}.
~~~~~~

## Unnamed class {=pack:rdfsViolation .pack:Demo label}

[1] {pack:expectedViolations ^^xsd:integer}
`{"ClassShape":{},"PropertyShape":{},"DatatypeShape":{}}` {pack:extractedPOJO}

~~~~~~md {pack:demo}
[ex] <tag:example,2026:rdfs-pack/>

# Mystery {=ex:Mystery .rdfs:Class}

Declared but never named — no label, no comment.
~~~~~~
