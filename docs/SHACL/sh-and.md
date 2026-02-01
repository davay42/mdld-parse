[ex] <http://example.org/>     
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
[sh] <http://www.w3.org/ns/shacl#> 
[xsd] <http://www.w3.org/2001/XMLSchema#> 
[rdfs] <http://www.w3.org/2000/01/rdf-schema#> 

# ===================
# 📊 Data Model
# ===================

## Person {=ex:Person .Class label}

A person with various attributes.

### Employee {=ex:Employee .Class label}

An employee with specific requirements.

### Manager {=ex:Manager .Class label}

A manager with additional responsibilities.

## Record {=ex:Record .Class label}

A base class for records that have person information.

# ===================
# 🎯 SHACL Shapes
# ===================

### Advanced Person Shape {=ex:AdvancedPersonShape .sh:NodeShape label}

This shape demonstrates **sh:and** constraint using verbose ordered list syntax and targets all entities with [person] {+ex:person ?sh:targetSubjectsOf}.

### Person Requirements {=ex:AdvancedPersonShape-person .sh:PropertyShape ?sh:property}

This property defines rules for the [person] {+ex:person ?sh:path} property.

Person must satisfy ALL conditions: be Employee AND have email AND be over 21 using verbose RDF list syntax.

First we need a list node: [l1] {=ex:l1 .rdf:List ?sh:and}
Then we add first shape: [Employee Shape] {+ex:EmployeeShape ?rdf:first}
Then we add a rest node: [+l2] {=ex:l2 ?rdf:rest}
And we add another shape: [Email Shape] {+ex:EmailShape ?rdf:first}
Then we add another rest node: [+l3] {=ex:l3 ?rdf:rest}
And we add final shape: [Age Shape] {+ex:AgeShape ?rdf:first}
And finally we add a nil node: [nil] {+rdf:nil ?rdf:rest}

> Person must be Employee AND have email AND be over 21 (using verbose list syntax). {sh:message}

### Employee Shape {=ex:EmployeeShape .sh:NodeShape label}

This shape validates employee requirement.

### Employee Class {=ex:EmployeeShape-class .sh:PropertyShape ?sh:property}

Person must be an Employee instance.

Person must be [Employee] {+ex:Employee ?sh:class}.

### Email Shape {=ex:EmailShape .sh:NodeShape label}

This shape validates email requirement.

### Email Property {=ex:EmailShape-email .sh:PropertyShape ?sh:property}

Person must have an email property.

Person must have [email] {+ex:email ?sh:path} with minimum count [1] {sh:minCount ^^xsd:integer}.

### Age Shape {=ex:AgeShape .sh:NodeShape label}

This shape validates age requirement.

### Age Property {=ex:AgeShape-age .sh:PropertyShape ?sh:property}

Person must be over 21 years old.

Person must have [age] {+ex:age ?sh:path} with minimum inclusive [21] {sh:minInclusive ^^xsd:integer}.

# ===================
# 📊 Test Data
# ===================

### ✅ Valid Records

## Valid Advanced Person {=ex:ValidAdvancedPerson .ex:Record label}

This record should PASS - satisfies ALL conditions (Employee + email + age > 21).

### Person {=ex:Employee1 .ex:Employee label ?ex:person}

[john@example.com] {ex:email}

[25] {ex:age ^^xsd:integer} years old

### ❌ Invalid Records

## Invalid Employee Only {=ex:InvalidEmployeeOnly .ex:Record label}

This record should FAIL - is Employee but missing email and age.

### Person {=ex:Employee2 .ex:Employee label ?ex:person}

## Invalid Email Only {=ex:InvalidEmailOnly .ex:Record label}

This record should FAIL - has email but not Employee and no age.

### Person {=ex:Person1 .ex:Person label ?ex:person}

### Email {jane@example.com ?ex:email}

## Invalid Age Only {=ex:InvalidAgeOnly .ex:Record label}

This record should FAIL - has age but not Employee and no email.

### Person {=ex:Person2 .ex:Person label ?ex:person}

### Age {30 ?ex:age ^^xsd:integer}

## Invalid Underage {=ex:InvalidUnderage .ex:Record label}

This record should FAIL - is Employee and has email but age < 21.

### Person {=ex:Employee3 .ex:Employee label ?ex:person}

### Email {young@example.com ?ex:email}

### Age {18 ?ex:age ^^xsd:integer}

## No Person Record {=ex:NoPersonRecord .ex:Record label}

This record should FAIL - has no person property.

# ===================
# 📋 Expected Results
# ===================

## ✅ Should Pass:
- ex:ValidAdvancedPerson (person = ex:Employee1 with email + age 25)

## ❌ Should Fail:
- ex:InvalidEmployeeOnly (person = ex:Employee2 - missing email + age)
- ex:InvalidEmailOnly (person = ex:Person1 - not Employee + missing age)
- ex:InvalidAgeOnly (person = ex:Person2 - not Employee + missing email)
- ex:InvalidUnderage (person = ex:Employee3 - Employee + email but age < 21)

## ⚪ Not Checked by sh:and:
- ex:NoPersonRecord (no person - sh:and doesn't check property presence)

## 🎯 Key Points:
1. Verbose RDF list: l1 → EmployeeShape → l2 → EmailShape → l3 → AgeShape → rdf:nil
2. sh:and constraint points to l1 (first list node)
3. sh:targetSubjectsOf targets all entities with person property
4. sh:path = ex:person (property to validate)
5. grapoi .list() should traverse the RDF list of shapes correctly
6. **SHACL Design**: sh:and only validates values if property exists (doesn't check presence)
7. **Property Presence**: Use sh:minCount/sh:maxCount to check if property is required
8. **AND Logic**: ALL shapes in the list must be satisfied for validation to pass
