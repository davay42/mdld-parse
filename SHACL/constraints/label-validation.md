[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Constraint Label Validation Shape {=cat:shapes/label-validation .sh:NodeShape label}

Validates that all SHACL constraints have proper labels for discoverability.

## Label Validation {=cat:shapes/label-validation/check .sh:PropertyShape ?sh:property}

Each constraint must have a label: [label] {+rdfs:label ?sh:path}

Target all constraint values: [includes] {+cat:includes ?sh:targetObjectsOf}

Must have at least [1] {sh:minCount ^^xsd:integer} label.

> Each SHACL constraint must have an rdfs:label for proper catalog organization {sh:message}
