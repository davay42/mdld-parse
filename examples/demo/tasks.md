[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[prov] <http://www.w3.org/ns/prov#>
[sh] <http://www.w3.org/ns/shacl#>
[my] <tag:alice@example.com,2026:>

# Task Management System {=my:taskSystem .rdfs:Resource label}

Comprehensive task management combining multiple W3C ontologies for real-world workflow automation.

## Ontology Foundation

### User Class {=my:User .rdfs:Class label}

A user is a person who can be assigned tasks and projects.

Subclass of: [Person] {+rdfs:Person ?rdfs:subClassOf}

Properties:
- **Name**: [string] {+xsd:string ?rdfs:range}
- **Email**: [string] {+xsd:string ?rdfs:range}
- **Active**: [boolean] {+xsd:boolean ?rdfs:range}
- **Created**: [dateTime] {+xsd:dateTime ?rdfs:range}

### Task Class {=my:Task .rdfs:Class label}

A task represents work to be completed with status and priority.

Subclass of: [Entity] {+rdfs:Resource ?rdfs:subClassOf}

Properties:
- **Title**: [string] {+xsd:string ?rdfs:range}
- **Description**: [string] {+xsd:string ?rdfs:range}
- **Status**: [string] {+xsd:string ?rdfs:range}
- **Priority**: [integer] {+xsd:integer ?rdfs:range}
- **Due Date**: [dateTime] {+xsd:dateTime ?rdfs:range}
- **Assigned To**: [User] {+my:User ?rdfs:range}

### Project Class {=my:Project .rdfs:Class label}

A project contains multiple related tasks with timelines and goals.

Subclass of: [Entity] {+rdfs:Resource ?rdfs:subClassOf}

Properties:
- **Name**: [string] {+xsd:string ?rdfs:range}
- **Start Date**: [date] {+xsd:date ?rdfs:range}
- **End Date**: [date] {+xsd:date ?rdfs:range}
- **Status**: [string] {+xsd:string ?rdfs:range}
- **Budget**: [decimal] {+xsd:decimal ?rdfs:range}

## Instance Data with Provenance

### Project Alpha {=my:project-alpha .my:Project label}

Name: [Website Redesign] {rdfs:label}
Start date: [2026-06-01] {my:startDate ^^xsd:date}
End date: [2026-08-31] {my:endDate ^^xsd:date}
Budget: [50000.00] {my:budget ^^xsd:decimal}
Status: [active] {my:status}

**Project Creation Activity** {=my:project-creation .prov:Activity label}
- Started: [2026-05-15T09:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
- Associated with: [Project Manager] {+my:project-manager .prov:Person ?prov:wasAssociatedWith}
- Used: [Requirements Document] {+my:requirements ?prov:used}
- Generated: [Project Alpha] {+my:project-alpha ?prov:generated}

### Task Instances

#### Design Task {=my:task-design .my:Task label}

Title: [Design Homepage Layout] {rdfs:label}
Description: [Create responsive design for main website pages] {my:description}
Status: [in-progress] {my:status}
Priority: [1] {my:priority ^^xsd:integer}
Due date: [2026-06-15T17:00:00Z] {my:dueDate ^^xsd:dateTime}
Assigned to: [Alice Johnson] {+my:alice .my:User ?my:assignedTo}

**Task Assignment Activity** {=my:task-assignment .prov:Activity label}
- Started: [2026-06-01T10:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
- Associated with: [Alice Johnson] {+my:alice ?prov:wasAssociatedWith}
- Used: [Design Task] {+my:task-design ?prov:used}
- Generated: [Task Assignment Record] {+my:assignment-record ?prov:generated}

#### Development Task {=my:task-dev .my:Task label}

Title: [Implement Homepage Backend] {rdfs:label}
Description: [Build API endpoints and database schema for homepage] {my:description}
Status: [todo] {my:status}
Priority: [2] {my:priority ^^xsd:integer}
Due date: [2026-06-30T17:00:00Z] {my:dueDate ^^xsd:dateTime}
Assigned to: [Bob Smith] {+my:bob .my:User ?my:assignedTo}

#### Testing Task {=my:task-test .my:Task label}

Title: [Test Homepage Functionality] {rdfs:label}
Description: [Comprehensive testing of all homepage features] {my:description}
Status: [todo] {my:status}
Priority: [3] {my:priority ^^xsd:integer}
Due date: [2026-07-15T17:00:00Z] {my:dueDate ^^xsd:dateTime}
Assigned to: [Carol Davis] {+my:carol .my:User ?my:assignedTo}

## SHACL Validation Shapes

### User Validation Shape {=my:UserShape .sh:NodeShape label}

Validates all [User] {+my:User ?sh:targetClass} instances.

**Name Constraint** {=my:UserShape-name .sh:PropertyShape ?sh:property}
Path: [name] {+rdfs:label ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer sh:maxCount ^^xsd:integer}
Datatype: [string] {+xsd:string ?sh:datatype}

> User must have exactly one name. {sh:message}

**Email Constraint** {=my:UserShape-email .sh:PropertyShape ?sh:property}
Path: [email] {+my:email ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
Pattern: [.*@.*] {sh:pattern}

> User must have valid email address. {sh:message}

### Task Validation Shape {=my:TaskShape .sh:NodeShape label}

Validates all [Task] {+my:Task ?sh:targetClass} instances.

**Status Constraint** {=my:TaskShape-status .sh:PropertyShape ?sh:property}
Path: [status] {+my:status ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
In: [todo, in-progress, done, blocked] {+my:status-values ?sh:in}

> Task status must be one of: todo, in-progress, done, blocked. {sh:message}

**Priority Constraint** {=my:TaskShape-priority .sh:PropertyShape ?sh:property}
Path: [priority] {+my:priority ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
Datatype: [integer] {+xsd:integer ?sh:datatype}
Minimum: [1] {sh:minInclusive ^^xsd:integer}
Maximum: [5] {sh:maxInclusive ^^xsd:integer}

> Task priority must be between 1 and 5. {sh:message}

## Test Data for Validation

### Valid User {=my:valid-user .my:User label}

Name: [Alice Johnson] {rdfs:label}
Email: [alice@example.com] {my:email}
Active: [true] {my:active ^^xsd:boolean}

### Invalid User {=my:invalid-user .my:User label}

Name: [Bob] {rdfs:label}
Email: [invalid-email] {my:email}

### Valid Task {=my:valid-task .my:Task label}

Title: [Complete Documentation] {rdfs:label}
Status: [done] {my:status}
Priority: [2] {my:priority ^^xsd:integer}
Due date: [2026-06-30T17:00:00Z] {my:dueDate ^^xsd:dateTime}

### Invalid Task {=my:invalid-task .my:Task label}

Title: [Invalid Task] {rdfs:label}
Status: [cancelled] {my:status}
Priority: [6] {my:priority ^^xsd:integer}

This comprehensive example demonstrates:
- **RDF/RDFS**: Class definitions, property domains/ranges, subclass relationships
- **XSD**: Typed literals for dates, numbers, strings, booleans
- **PROV-O**: Complete provenance chains for project and task creation
- **SHACL**: Validation shapes with constraints and test data
- **Integration**: All ontologies working together in real task management scenario
