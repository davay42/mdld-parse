[ex] <http://example.org/>

# Status {=ex:Status .Class label}

A controlled vocabulary.

---

# Task Shape {=ex:TaskShape .sh:NodeShape label}

Targets all [Task] {+ex:Task ?sh:targetClass} instances to have at least one [status] {+#status ?sh:property sh:name}.

## Status Property {=#status .sh:PropertyShape}

Has at least [1] {sh:minCount ^^xsd:integer} [status] {+ex:status ?sh:path} value.

---

# Test Data

## Task with status {=ex:task-valid .ex:Task label}

[active] {+ex:Active ?ex:status}

This record should pass validation.

---

## Task without a status {=ex:task-invalid .ex:Task label}

This record should fail validation - missing required status.
