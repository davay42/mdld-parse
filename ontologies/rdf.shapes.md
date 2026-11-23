[pack] <https://mdld.js.org/ns/pack/>

# RDF Vocabulary Shapes

Validation pack for the RDF 1.1 Concepts vocabulary — shapes that any graph using `rdf:*` reification or collections should satisfy. Merge with your data document and `validate()` enforces structural RDF well-formedness.

======

# RDF Statement Shape {=pack:StatementShape .sh:NodeShape label}

Every [statement] {+rdf:Statement ?sh:targetClass} — a reified claim — carries exactly one **subject** {+#stmtSubject ?sh:property sh:name}, exactly one **predicate** {+#stmtPredicate ?sh:property sh:name}, and exactly one **object** {+#stmtObject ?sh:property sh:name}. A statement missing any leg isn't a statement — it's a rumor.

`Statement subject — {$focusNode} missing {$path}` {=#stmtSubject .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [subject] {+rdf:subject ?sh:path}.

`Statement predicate — {$focusNode} missing {$path}` {=#stmtPredicate .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [predicate] {+rdf:predicate ?sh:path}.

`Statement object — {$focusNode} missing {$path}` {=#stmtObject .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [object] {+rdf:object ?sh:path}.

# RDF List Shape {=pack:ListShape .sh:NodeShape label}

Every [list cell] {+rdf:first ?sh:targetSubjectsOf} — a node that *is* the subject of `rdf:first` — holds exactly one **item** {+#listFirst ?sh:property sh:name} and exactly one **rest** {+#listRest ?sh:property sh:name} pointing onward. `rdf:nil` terminates the chain and is never a subject of `rdf:first`, so it is correctly never targeted.

`List item — {$focusNode}` {=#listFirst .sh:PropertyShape sh:name} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [first] {+rdf:first ?sh:path}.

`List rest — {$focusNode} missing {$path}` {=#listRest .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [rest] {+rdf:rest ?sh:path}.

======

## Examples

Each `pack:Demo` node carries its own contract in the graph: the source lives in the annotated fence, expectations are quads — `pack:expectedViolations` for validation and `pack:extractedPOJO` for extraction. `selftest.mjs` verifies all three.

## Conforming claim and list {=pack:example .pack:Demo label}

[0] {pack:expectedViolations ^^xsd:integer}
`{"StatementShape":{"ex:claim-1":{"subject":"ex:paper","predicate":"ex:accuracy","object":"ex:metrics"}},"ListShape":{"ex:cell-1":{"item":"ex:dune","rest":["ex:hyperion"]},"ex:cell-2":{"item":"ex:hyperion","rest":"rdf:nil"}}}` {pack:extractedPOJO}

~~~~~~md {pack:demo}
[ex] <tag:example,2026:rdf-pack/>

# Paper Reports Result {=ex:claim-1 .rdf:Statement label}

**The paper** {+ex:paper ?rdf:subject} *reports* {+ex:accuracy ?rdf:predicate} **91.8% test accuracy** {+ex:metrics ?rdf:object}.

# Reading List {=ex:reading-list .prov:Collection label}

A two-cell chain — each cell holds one item and points at the next:

## Cell one {=ex:cell-1 .rdf:List label}

Holds [Dune] {+ex:dune ?rdf:first}, rest is [cell two] {+ex:cell-2 ?rdf:rest}.

## Cell two {=ex:cell-2 .rdf:List label}

Holds [Hyperion] {+ex:hyperion ?rdf:first}, rest is [nil] {+rdf:nil ?rdf:rest}.
~~~~~~

## Claim missing its object {=pack:violation .pack:Demo label}

[1] {pack:expectedViolations ^^xsd:integer}
`{"StatementShape":{"ex:claim-2":{"subject":"ex:paper","predicate":"ex:accuracy"}},"ListShape":{}}` {pack:extractedPOJO}

~~~~~~md {pack:demo}
[ex] <tag:example,2026:rdf-pack/>

# Broken Claim {=ex:claim-2 .rdf:Statement label}

**The paper** {+ex:paper ?rdf:subject} *reports* {+ex:accuracy ?rdf:predicate} — no object declared.
~~~~~~
