[ex] <http://example.org/>     
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
[sh] <http://www.w3.org/ns/shacl#> 
[xsd] <http://www.w3.org/2001/XMLSchema#> 
[rdfs] <http://www.w3.org/2000/01/rdf-schema#> 

# ===================
# 📊 Data Model
# ===================

## Status {=ex:Status .Class label}

A controlled vocabulary for record statuses.

### Active Status {=ex:Active .ex:Status label}

Represents an active/enabled status.

### Inactive Status {=ex:Inactive .ex:Status label}

Represents an inactive/disabled status.

### Pending Status {=ex:Pending .ex:Status label}

Represents a pending/processing status (not in allowed list).

## Record {=ex:Record .Class label}

A base class for records that have status.

# ===================
# 🎯 SHACL Shapes
# ===================

### Status Values Shape {=ex:StatusValuesShape .sh:NodeShape label}

This shape demonstrates **sh:in** constraint using verbose ordered list syntax and targets all entities with [status] {+ex:status ?sh:targetSubjectsOf}.

### Allowed Status Values {=ex:StatusValuesShape-allowedStatus .sh:PropertyShape ?sh:property}

This property defines rules for the [status] {+ex:status ?sh:path} property.

Status values must be in the allowed list using verbose RDF list syntax.

First we need a list node: [head] {=ex:l1 .rdf:List ?sh:in}
Then we can add first item: [Active] {+ex:Active ?rdf:first}
Then we add a rest node (another list): [list2] {=ex:l2 ?rdf:rest}
And we add another item: [Inactive] {+ex:Inactive ?rdf:first}
And finally we add a nil node (end of list): [nil] {+rdf:nil ?rdf:rest}

> Status must be either Active or Inactive (using verbose list syntax). {sh:message}

# ===================
# 📊 Test Data
# ===================

### ✅ Valid Records

## Valid Record 1 {=ex:ValidRecord1 .ex:Record label}

This record should PASS - has Active status.

### Status {+ex:Active ?ex:status}

## Valid Record 2 {=ex:ValidRecord2 .ex:Record label}

This record should PASS - has Inactive status.

### Status {+ex:Inactive ?ex:status}

### ❌ Invalid Records

## Invalid Record 1 {=ex:InvalidRecord1 .ex:Record label}

This record should FAIL - has Pending status (not in list).

### Status {+ex:Pending ?ex:status}

## Invalid Record 2 {=ex:InvalidRecord2 .ex:Record label}

This record should FAIL - has Unknown status (not in list).

### Status {+ex:Unknown ?ex:status}

## Invalid Record 3 {=ex:InvalidRecord3 .ex:Record label}

This record should FAIL - has no status (missing required property).

# ===================
# 📋 Expected Results
# ===================

## ✅ Should Pass:
- ex:ValidRecord1 (status = ex:Active)
- ex:ValidRecord2 (status = ex:Inactive)

## ❌ Should Fail:
- ex:InvalidRecord1 (status = ex:Pending - not in [Active, Inactive])
- ex:InvalidRecord2 (status = ex:Unknown - not in [Active, Inactive])  

## ⚪ Not Checked by sh:in:
- ex:InvalidRecord3 (no status - sh:in doesn't check property presence, use sh:minCount for that)

## 🎯 Key Points:
1. Verbose RDF list: l1 → Active → l2 → Inactive → rdf:nil
2. sh:in constraint points to l1 (first list node)
3. sh:targetSubjectsOf targets all entities with status property
4. sh:path = ex:status (property to validate)
5. grapoi .list() should traverse the RDF list correctly
6. **SHACL Design**: sh:in only validates values if property exists (doesn't check presence)
7. **Property Presence**: Use sh:minCount/sh:maxCount to check if property is required
