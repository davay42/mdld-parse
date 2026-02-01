# Self-Explaining & Self-Validating MDLD Dataset

This file demonstrates MDLD (Markdown Linked Data) - a superset of Markdown that adds semantic meaning while staying human-readable.

---

## 📚 Prefix Definitions

These are like namespace imports - they make the rest of the file readable:

# Our example namespace
[ex] <http://example.org/>     

# RDF vocabulary
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 

# SHACL validation language
[sh] <http://www.w3.org/ns/shacl#> 

# XML Schema datatypes
[xsd] <http://www.w3.org/2001/XMLSchema#> 

# RDF Schema vocabulary
[rdfs] <http://www.w3.org/2000/01/rdf-schema#> 

---

## 🏷️ Data Model Definition

First, we define our core data concepts:

# Status {=ex:Status .Class label}

A controlled vocabulary for record statuses.

### Active Status {=ex:Active .ex:Status label}

Represents an active/enabled status.

### Inactive Status {=ex:Inactive .ex:Status label}

Represents an inactive/disabled status.

### Pending Status {=ex:Pending .ex:Status label}

Represents a pending/processing status (not in allowed list).

---

# Record {=ex:Record .Class label}

A base class for records that have status and date.

**What this does:**
- Creates a `Status` class for status values
- Creates two status instances: `ex:Active` and `ex:Inactive` 
- Creates a `Record` class for things that have status
- Makes everything human-readable and properly typed

---

## 🛡️ Validation Rules

Now we define SHACL shapes that validate our data:

### Status Shape {=ex:StatusShape .sh:NodeShape label}

This shape applies to all [Record] {+ex:Record ?sh:targetClass} records.

Includes these property rule {?sh:property .sh:PropertyShape sh:name}

- Status Count {=ex:StatusShape-status }
- Date Validation {=ex:StatusShape-date }
- Label Property {=ex:StatusShape-label }
- Version Property {=ex:StatusShape-version }


### Status Count {=ex:StatusShape-status }

> Ensures proper status assignment for record lifecycle management. {sh:description}

This property defines rules for the [status] {+ex:status ?sh:path} property. 

It is **Required** - there must be at least [1] {sh:minCount ^^xsd:integer} status, but no more than [1] {sh:maxCount ^^xsd:integer} = exactly one.

> Each record must have exactly one status value that is a valid Status instance (Active or Inactive). {sh:message}

### Date Validation {=ex:StatusShape-date}

> Validates that date values are properly typed literals in ISO format for temporal consistency. {sh:description}

This property defines rules for the [date] {+ex:date ?sh:path} property.

It must be a [Literal] {+sh:Literal ?sh:nodeKind} - not an IRI or blank node.

Date values must be of type [date] {+xsd:date ?sh:datatype} - ISO date format required.

> Date must be a literal value in valid ISO date format (e.g., 2024-01-15). {sh:message}

**Violation** {+sh:Violation ?sh:severity}

### Label Property {=ex:StatusShape-label }

This property defines rules for the [label] {+rdfs:label ?sh:path} property.

Record labels must contain [Record] {sh:pattern } - must include 'Record' text.

> Record label must contain the word 'Record' to be valid. {sh:message}

**Warning** {+sh:Warning ?sh:severity}

### Version {=ex:StatusShape-version }

> Ensures version consistency across all records for compatibility. {sh:description}

This property defines rules for the [version] {+ex:version ?sh:path} property.

All records must have version [1.0] {sh:hasValue} - exactly this value required.

[true] {sh:deactivated}

> Version must be exactly '1.0' for all records. {sh:message}

---

### Critical Records Shape {=ex:CriticalRecordsShape .sh:NodeShape label}

This shape targets **specific individual nodes** using [targetNode] {+ex:Record-Critical ?sh:targetNode} - **node-based targeting**.

### Priority Validation {=ex:CriticalRecordsShape-priority .sh:PropertyShape ?sh:property}

Critical records must have priority between [1] {sh:minInclusive ^^xsd:integer} and [5] {sh:maxInclusive ^^xsd:integer}.

> Critical records must have priority between 1-5 for proper resource allocation. {sh:message}

---

### Status Users Shape {=ex:StatusUsersShape .sh:NodeShape label}

This shape targets **all subjects** that have [status] {+ex:status ?sh:targetSubjectsOf} - **subject-based targeting**.

### User Type Validation {=ex:StatusUsersShape-userType .sh:PropertyShape ?sh:property}

All entities with status must have a [userType] {+ex:userType ?sh:path} property with value [automated] {sh:hasValue "automated"}.

> All status-using entities must be automated systems. {sh:message}

---

### Date Values Shape {=ex:DateValuesShape .sh:NodeShape label}

This shape targets **all objects** of [date] {+ex:date ?sh:targetObjectsOf} predicates - **object-based targeting**.

### Date Range Validation {=ex:DateValuesShape-range .sh:PropertyShape ?sh:property}

All date values must be within [2024-01-01] {sh:minInclusive ^^xsd:date} and [2024-12-31] {sh:maxInclusive ^^xsd:date}.

> All dates must be within the 2024 calendar year. {sh:message}

---

### Status Values Shape {=ex:StatusValuesShape .sh:NodeShape label}

This shape demonstrates **sh:in** constraint using verbose ordered list syntax and targets all entities with [status] {+ex:status ?sh:targetSubjectsOf}.

### Allowed Status Values {=ex:StatusValuesShape-allowedStatus .sh:PropertyShape ?sh:property}

This property defines rules for the [status] {+ex:status ?sh:path} property.

Status values must be in the allowed list using verbose RDF list syntax.

First we need a list node: [head] {=ex:l1 .rdf:List ?sh:in}
Then we can add first item: [Active] {+ex:Active ?rdf:first}
Then we add a rest node (another list): [list2] {=ex:l2 ?rdf:rest}
And we can add another item: [Inactive] {+ex:Inactive ?rdf:first}
And finally we add a nil node (end of list): [nil] {+rdf:nil ?rdf:rest}

> Status must be either Active or Inactive (using verbose list syntax). {sh:message}





============================
# 📊 Test Data
============================


Now let's see the validation in action:

### ✅ Valid Record

## Valid Record {=ex:Record-Valid .ex:Record label}

This record follows all rules - has exactly one status and proper date.

### Status {+ex:Active ?ex:status}

Date: [2024-06-15] {ex:date ^^xsd:date}

Version: [1.0] {ex:version}  # Correct version - should pass

User Type: [automated] {ex:userType}  # Required by status users shape

**Why it passes:** Has exactly 1 status value, valid 2024 date, correct version, and user type

---

### 🎯 Critical Record (Targeted by Node)

## Critical Record {=ex:Record-Critical .ex:Record label}

This record is specifically targeted by the CriticalRecordsShape using sh:targetNode.

### Status {+ex:Active ?ex:status}

Date: [2024-07-01] {ex:date ^^xsd:date}

Priority: [3] {ex:priority ^^xsd:integer}  # Within 1-5 range - should pass

User Type: [automated] {ex:userType}

**Why it passes:** Priority 3 is within the required 1-5 range for critical records

---

### ❌ Invalid Records

#### Missing Required Property
## Invalid Record {=ex:Record-Invalid .ex:Record label}

This record fails - missing required status property.

Date: [2024-08-15] {ex:date ^^xsd:date}

User Type: [automated] {ex:userType}

**Why it fails:** Has 0 status values (violates minCount=1)

---

#### Too Many Values  
## Too Many Statuses Record {=ex:Record-TooMany .ex:Record label}

This record fails - has too many status values.

### Status {+ex:Active ?ex:status}
### Status {+ex:Inactive ?ex:status}

Date: [2024-09-20] {ex:date ^^xsd:date}   

User Type: [automated] {ex:userType}

**Why it fails:** Has 2 status values (violates maxCount=1)

---

#### Wrong Date Type
## Wrong Date Record {=ex:Record-WrongDate .ex:Record label}

This record fails - date is wrong type (should be literal, not IRI).

### Status {+ex:Active ?ex:status}

Date: [Invalid-Date] {ex:date}  # Missing ^^xsd:date - wrong nodeKind

User Type: [automated] {ex:userType}

**Why it fails:** Date value is not properly typed as literal

---

#### Critical Record with Wrong Priority
## Critical Wrong Priority {=ex:Record-CriticalWrong .ex:Record label}

This critical record fails - priority is too high (targeted by sh:targetNode).

### Status {+ex:Active ?ex:status}

Date: [2024-10-01] {ex:date ^^xsd:date}

Priority: [8] {ex:priority ^^xsd:integer}  # Outside 1-5 range - should fail

User Type: [automated] {ex:userType}

**Why it fails:** Critical record has priority 8, but must be 1-5 (sh:targetNode)

---

#### Status User Missing User Type
## Status User No Type {=ex:Record-NoUserType .ex:Record label}

This record fails - has status but missing user type (targeted by sh:targetSubjectsOf).

### Status {+ex:Active ?ex:status}

Date: [2024-11-01] {ex:date ^^xsd:date}

**Why it fails:** Has status property but missing required userType

---

#### Date Outside Range (Targeted by sh:targetObjectsOf)
## Date Outside Range {=ex:Record-OldDate .ex:Record label}

This record fails - date is outside 2024 range (targeted by sh:targetObjectsOf).

### Status {+ex:Active ?ex:status}

Date: [2023-12-31] {ex:date ^^xsd:date}  # Outside 2024 range - should fail

User Type: [automated] {ex:userType}

**Why it fails:** Date is outside 2024 calendar year (sh:targetObjectsOf)

---

#### Invalid Status Value (sh:in violation)
## Invalid Status Value {=ex:Record-BadStatus .ex:Record label}

This record fails - status is not in allowed list (sh:in violation).

### Status {+ex:Pending ?ex:status}  # Not in [Active, Inactive] list

Date: [2024-12-15] {ex:date ^^xsd:date}

User Type: [automated] {ex:userType}

**Why it fails:** Status "Pending" is not in the allowed [Active, Inactive] list (sh:in)

---

## 🎯 How It Works

1. **Data + Rules in One File:** Both the data and validation rules live together
2. **Human-Readable:** Uses familiar Markdown syntax with semantic annotations  
3. **Machine-Validatable:** SHACL engine can automatically check all constraints
4. **Self-Documenting:** Each section explains what it does

---

## 🚀 Try It Yourself

Run validation to see the rules in action:
```bash
ig-cli validate self-explaining.md
```

Expected output: 2 violations (missing status + too many statuses)
