[ex] <http://example.org/>     
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
[sh] <http://www.w3.org/ns/shacl#> 
[xsd] <http://www.w3.org/2001/XMLSchema#> 
[rdfs] <http://www.w3.org/2000/01/rdf-schema#> 

# ===================
# 📊 Data Model
# ===================

## Person {=ex:Person .Class label}

A person with various roles.

### Employee {=ex:Employee .Class label}

An employee with salary and benefits.

### Student {=ex:Student .Class label}

A student with enrollment and courses.

### Volunteer {=ex:Volunteer .Class label}

A volunteer with hours and projects.

### Contractor {=ex:Contractor .Class label}

A contractor with rates and contracts.

## Record {=ex:Record .Class label}

A base class for records that have role information.

# ===================
# 🎯 SHACL Shapes
# ===================

### Exclusive Role Shape {=ex:ExclusiveRoleShape .sh:NodeShape label}

This shape demonstrates **sh:xone** constraint using verbose ordered list syntax and targets all entities with [role] {+ex:role ?sh:targetSubjectsOf}.

### Role Requirements {=ex:ExclusiveRoleShape-role .sh:PropertyShape ?sh:property}

This property defines rules for the [role] {+ex:role ?sh:path} property.

Person must satisfy EXACTLY ONE role: Employee OR Student OR Volunteer (but not multiple) using verbose RDF list syntax.

First we need a list node: [l1] {=ex:l1 .rdf:List ?sh:xone}
Then we add first shape: [Employee Shape] {+ex:EmployeeShape ?rdf:first}
Then we add a rest node: [+l2] {=ex:l2 ?rdf:rest}
And we add another shape: [Student Shape] {+ex:StudentShape ?rdf:first}
Then we add another rest node: [+l3] {=ex:l3 ?rdf:rest}
And we add final shape: [Volunteer Shape] {+ex:VolunteerShape ?rdf:first}
And finally we add a nil node: [nil] {+rdf:nil ?rdf:rest}

> Person must be exactly one of Employee, Student, or Volunteer (using verbose list syntax). {sh:message}

### Employee Shape {=ex:EmployeeShape .sh:NodeShape label}

This shape validates employee role.

### Employee Class {=ex:EmployeeShape-class .sh:PropertyShape ?sh:property}

Person must be an Employee instance.

Person must be [Employee] {+ex:Employee ?sh:class}.

### Student Shape {=ex:StudentShape .sh:NodeShape label}

This shape validates student role.

### Student Class {=ex:StudentShape-class .sh:PropertyShape ?sh:property}

Person must be a Student instance.

Person must be [Student] {+ex:Student ?sh:class}.

### Volunteer Shape {=ex:VolunteerShape .sh:NodeShape label}

This shape validates volunteer role.

### Volunteer Class {=ex:VolunteerShape-class .sh:PropertyShape ?sh:property}

Person must be a Volunteer instance.

Person must be [Volunteer] {+ex:Volunteer ?sh:class}.

# ===================
# 📊 Test Data
# ===================

### ✅ Valid Records

## Valid Employee {=ex:ValidEmployee .ex:Record label}

This record should PASS - is exactly Employee (not Student or Volunteer).

### Role {=ex:Employee1 .ex:Employee label ?ex:role}

## Valid Student {=ex:ValidStudent .ex:Record label}

This record should PASS - is exactly Student (not Employee or Volunteer).

### Role {=ex:Student1 .ex:Student label ?ex:role}

## Valid Volunteer {=ex:ValidVolunteer .ex:Record label}

This record should PASS - is exactly Volunteer (not Employee or Student).

### Role {=ex:Volunteer1 .ex:Volunteer label ?ex:role}

### ❌ Invalid Records

## Invalid Contractor {=ex:InvalidContractor .ex:Record label}

This record should FAIL - is Contractor (not Employee/Student/Volunteer).

### Role {=ex:Contractor1 .ex:Contractor label ?ex:role}

## Invalid EmployeeStudent {=ex:InvalidEmployeeStudent .ex:Record label}

This record should FAIL - is both Employee AND Student (violates exclusivity).

### Role {=ex:EmployeeStudent1 .ex:Employee .ex:Student label ?ex:role}

## Invalid StudentVolunteer {=ex:InvalidStudentVolunteer .ex:Record label}

This record should FAIL - is both Student AND Volunteer (violates exclusivity).

### Role {=ex:StudentVolunteer1 .ex:Student .ex:Volunteer label ?ex:role}

## Invalid AllRoles {=ex:InvalidAllRoles .ex:Record label}

This record should FAIL - is Employee, Student, AND Volunteer (violates exclusivity).

### Role {=ex:AllRoles1 .ex:Employee .ex:Student .ex:Volunteer label ?ex:role}

## No Role Record {=ex:NoRoleRecord .ex:Record label}

This record should FAIL - has no role property.

# ===================
# 📋 Expected Results
# ===================

## ✅ Should Pass:
- ex:ValidEmployee (role = ex:Employee1 - exactly Employee)
- ex:ValidStudent (role = ex:Student1 - exactly Student)
- ex:ValidVolunteer (role = ex:Volunteer1 - exactly Volunteer)

## ❌ Should Fail:
- ex:InvalidContractor (role = ex:Contractor1 - not in allowed roles)
- ex:InvalidEmployeeStudent (role = ex:EmployeeStudent1 - Employee AND Student)
- ex:InvalidStudentVolunteer (role = ex:StudentVolunteer1 - Student AND Volunteer)
- ex:InvalidAllRoles (role = ex:AllRoles1 - Employee AND Student AND Volunteer)

## ⚪ Not Checked by sh:xone:
- ex:NoRoleRecord (no role - sh:xone doesn't check property presence)

## 🎯 Key Points:
1. Verbose RDF list: l1 → EmployeeShape → l2 → StudentShape → l3 → VolunteerShape → rdf:nil
2. sh:xone constraint points to l1 (first list node)
3. sh:targetSubjectsOf targets all entities with role property
4. sh:path = ex:role (property to validate)
5. grapoi .list() should traverse the RDF list of shapes correctly
6. **SHACL Design**: sh:xone only validates values if property exists (doesn't check presence)
7. **Property Presence**: Use sh:minCount/sh:maxCount to check if property is required
8. **XONE Logic**: EXACTLY ONE shape in the list must be satisfied for validation to pass
9. **Exclusivity**: Multiple matching shapes cause validation failure
10. **No Match**: No matching shapes also cause validation failure
