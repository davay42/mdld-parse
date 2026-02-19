[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <cat:example/class/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Class {=sh:class .class:Constraint label}

> Expects each value to be an instance of a specific class (RDF type) {comment}

<http://www.w3.org/ns/shacl#class> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

The **Employee Test Shape** {=ex:EmployeeTestShape .sh:NodeShape ?cat:hasShape label} validates all [member] {+member ?sh:targetObjectsOf} entities of the test data container to demonstrate class constraints.

**Manager Class Rule** {=ex:#managerClass .sh:PropertyShape ?sh:property} requires the [manager] {+ex:manager ?sh:path} property to be an instance of [Person] {+ex:Person ?sh:class}: **Employee manager must be a Person instance** {sh:message}

**Department Class Rule** {=ex:#departmentClass .sh:PropertyShape ?sh:property} requires the [department] {+ex:department ?sh:path} property to be an instance of [Department] {+ex:Department ?sh:class}: **Employee department must be a Department instance** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Employee {=ex:ValidEmployee ?member}

Manager: [john-manager] {=ex:john ?ex:manager .ex:Person}
Department: [engineering] {=ex:engineering ?ex:department .ex:Department}

#### Invalid Employee {=ex:InvalidEmployee ?member}

Manager: [robot-ai] {=ex:ai ?ex:manager ex:Role}
Department: [engineering] {=ex:engineering ?ex:department}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Employee** - passes (manager is Person, department is Department)
2. **Invalid Employee** - fails (manager is not Person instance)

### 🔍 Test Validation

```bash
# This should show 1 violation for class constraint violation
ig-cli validate ./constraints/class.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for class constraints:**

1. Use `sh:class` to validate RDF type relationships
2. Combine with container targeting for scalable test data
3. Provide clear validation messages specifying the expected class
4. Test both valid and invalid class instances

This approach ensures proper type checking while maintaining clear validation semantics.

---

## 🏗️ **Supporting Infrastructure**

### Person Class {=ex:Person .rdfs:Class label}

> Represents a person in the organization {?rdfs:comment}

### Department Class {=ex:Department .rdfs:Class label}

> Represents an organizational department {?rdfs:comment}

### Robot Class {=ex:Robot .rdfs:Class label}

> Represents an AI robot system {?rdfs:comment}

---

### Test Instances

#### john-manager {=ex:john-manager}

A [Person] {+ex:Person ?rdf:type} instance representing John the manager.

#### robot-ai {=ex:robot-ai}

A [Robot] {+ex:Robot ?rdf:type} instance representing an AI system.

#### engineering {=ex:engineering}

A [Department] {+ex:Department ?rdf:type} instance representing the engineering department.
