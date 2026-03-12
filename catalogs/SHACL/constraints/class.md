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

### Employee Test Shape {=ex:EmployeeTestShape .sh:NodeShape ?cat:hasShape label}

All [employees] {+member ?sh:targetObjectsOf} must have both **Human Manager** {+ex:#managerClass ?sh:property} and **Department** {+ex:#departmentClass ?sh:property} assigned.

**Employee manager must be a Person instance** {=ex:#managerClass .sh:PropertyShape message} requires the [manager] {+ex:manager ?sh:path} property to be an instance of [Person] {+ex:Person ?sh:class}.

**Employee department must be a Department instance** {=ex:#departmentClass .sh:PropertyShape sh:message}  requires the [department] {+ex:department ?sh:path} property to be an instance of [Department] {+ex:Department ?sh:class}

---

### 📋 Test Data {=ex:data .Container}

#### Valid Employee {=ex:ValidEmployee ?member}

Manager: [john-manager] {+ex:john ?ex:manager .ex:Person}
Department: [engineering] {+ex:engineering ?ex:department .ex:Department}

#### Invalid Employee {=ex:InvalidEmployee ?member}

Manager: [robot-ai] {+ex:ai ?ex:manager ex:Role}
Department: [marketing] {+ex:marketing ?ex:department}

---

[Demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Employee** - passes (manager is a Person, department is a Department)
2. **Invalid Employee** - fails (manager is not a Person, department is not a Department)

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
