[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[schema] <http://schema.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Closed World Constraint {=sh:closed .class:ClosedWorldConstraint label}

> Enables closed world validation where only explicitly declared properties are allowed. Essential for strict data modeling, schema enforcement, and preventing property proliferation in RDF graphs. {comment}

<http://www.w3.org/ns/shacl#closed> {?cat:fullIRI}

***

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates closed world validation using person data.

### Person Data Demo

**Only declared properties allowed** {=ex:ClosedExampleShape .sh:NodeShape ?cat:hasShape label} targets [ValidPerson] {+ex:ValidPerson ?sh:targetNode} and [InvalidPerson] {+ex:InvalidPerson ?sh:targetNode} with **no additional properties** {sh:closed} constraint except [Name] {+ex:NameProperty ?sh:property} and [Age] {+ex:AgeProperty ?sh:property}.

**Person must have a name** {=ex:NameProperty .sh:PropertyShape  sh:message} ensures [name] {+schema:name ?sh:path} is [string] {+xsd:string ?sh:datatype} and [1] {sh:minCount}.

**Person must have exactly one age** {=ex:AgeProperty .sh:PropertyShape sh:message} ensures [age] {+ex:age ?sh:path} is [integer] {+xsd:integer ?sh:datatype} and exactly [1] {sh:minCount sh:maxCount}.

### 📋 Test Data {=ex:data .Container}

#### Valid Person {=ex:ValidPerson}

Person with only declared properties.

Name: [John Doe] {schema:name ^^xsd:string}
Age: [30] {ex:age ^^xsd:integer}

#### Invalid Person {=ex:InvalidPerson}

Person with undeclared property (violates closed world constraint).

Name: [Jane Smith] {schema:name ^^xsd:string}
Age: [25] {ex:age ^^xsd:integer}
Email: [<jane@example.com>] {ex:email}  # Undeclared property

***

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Person** - passes (only declared properties: name, age ✓)
2. **Invalid Person** - fails once (has undeclared property: email ✗)

### 🔍 Test Validation

```bash
# This should show 1 violation - InvalidPerson has undeclared email property
ig-cli validate ./constraints/closed.md
```

***

## 📝 MDLD Syntax Patterns

**Use cases:**

* **Schema enforcement** - ensure data follows strict property definitions

* **Data quality** - prevent accidental property introduction

* **API validation** - enforce contract-based property sets

* **Migration safety** - prevent property drift during data migration

**Key behavior:**

* **Property whitelist** - only explicitly declared properties are valid

* **Violation per undeclared property** - each unknown property generates a violation

* **Shape-level constraint** - applies to all properties of the target node

* **Strict validation** - more restrictive than open world RDF semantics
