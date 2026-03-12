[ex] <http://example.org/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[sh] <http://www.w3.org/ns/shacl#>

# Status {=ex:Status .Class label}

A controlled vocabulary.

---

# Status Shape {=ex:StatusShape .sh:NodeShape label}

Target: [Status] {+ex:Status ?sh:targetClass}

## Status Property {=ex:StatusShape-status .sh:PropertyShape ?sh:property}

Path: [status] {+ex:status ?sh:path}

Required: [1] {sh:minCount ^^xsd:integer}

---

# Test Data

## Valid Record {=ex:Record-Valid .ex:Status}

This record should pass validation.

### Status {+ex:Active ?ex:status}

---

## Invalid Record {=ex:Record-Invalid .ex:Status}

This record should fail validation - missing required status.
