[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Constraint Metadata Validation Shape {=cat:shapes/constraint-metadata .sh:NodeShape label}

Validates that all SHACL constraints have proper metadata: labels, full IRIs, and comments.

## Label Validation {=cat:shapes/constraint-metadata/label .sh:PropertyShape ?sh:property}

Each constraint must have a label: [label] {+rdfs:label ?sh:path}

Target all constraint values: [includes] {+cat:includes ?sh:targetObjectsOf}

Must have at least [1] {sh:minCount ^^xsd:integer} label.

## Full IRI Validation {=cat:shapes/constraint-metadata/fulliri .sh:PropertyShape ?sh:property}

Each constraint must have full IRI documentation: [fullIRI] {+cat:fullIRI ?sh:path}

Target all constraint values: [includes] {+cat:includes ?sh:targetObjectsOf}

Must have at least [1] {sh:minCount ^^xsd:integer} full IRI.

## Comment Validation {=cat:shapes/constraint-metadata/comment .sh:PropertyShape ?sh:property}

Each constraint must have a comment: [comment] {+rdfs:comment ?sh:path}

Target all constraint values: [includes] {+cat:includes ?sh:targetObjectsOf}

Must have at least [1] {sh:minCount ^^xsd:integer} comment.

> Constraint metadata validation ensures completeness and discoverability {sh:message}
