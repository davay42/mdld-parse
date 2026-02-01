[ex] <http://example.org/>     
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
[sh] <http://www.w3.org/ns/shacl#> 
[xsd] <http://www.w3.org/2001/XMLSchema#> 
[rdfs] <http://www.w3.org/2000/01/rdf-schema#> 

# ===================
# 📊 Data Model
# ===================

## Person {=ex:Person .Class label}

A person with various identification methods.

### Email Contact {=ex:EmailContact .Class label}

Contact method using email address.

### Phone Contact {=ex:PhoneContact .Class label}

Contact method using phone number.

### Postal Contact {=ex:PostalContact .Class label}

Contact method using postal address.

## Record {=ex:Record .Class label}

A base class for records that have contact information.

# ===================
# 🎯 SHACL Shapes
# ===================

### Contact Shape {=ex:ContactShape .sh:NodeShape label}

This shape demonstrates **sh:or** constraint using verbose ordered list syntax and targets all entities with [contact] {+ex:contact ?sh:targetSubjectsOf}.

### Contact Methods {=ex:ContactShape-contact .sh:PropertyShape ?sh:property}

This property defines rules for the [contact] {+ex:contact ?sh:path} property.

Contact must be either Email, Phone, or Postal using verbose RDF list syntax.

First we need a list node: [l1] {=ex:l1 .rdf:List ?sh:or}
Then we can add first item: [Email Shape] {+ex:EmailShape ?rdf:first}
Then we add a rest node: [l2] {=ex:l2 ?rdf:rest}
And we add another item: [Phone Shape] {+ex:PhoneShape ?rdf:first}
Then we add another rest node: [l3] {=ex:l3 ?rdf:rest}
And we add final item: [Postal Shape] {+ex:PostalShape ?rdf:first}
And finally we add a nil node: [nil] {+rdf:nil ?rdf:rest}

> Contact must be Email OR Phone OR Postal (using verbose list syntax). {sh:message}

### Email Shape {=ex:EmailShape .sh:NodeShape label}

This shape validates email contact.

### Email Class {=ex:EmailShape-class .sh:PropertyShape ?sh:property}

Contact must be an EmailContact instance.

Contact must be [EmailContact] {+ex:EmailContact ?sh:class}.

### Phone Shape {=ex:PhoneShape .sh:NodeShape label}

This shape validates phone contact.

### Phone Class {=ex:PhoneShape-class .sh:PropertyShape ?sh:property}

Contact must be a PhoneContact instance.

Contact must be [PhoneContact] {+ex:PhoneContact ?sh:class}.

### Postal Shape {=ex:PostalShape .sh:NodeShape label}

This shape validates postal contact.

### Postal Class {=ex:PostalShape-class .sh:PropertyShape ?sh:property}

Contact must be a PostalContact instance.

Contact must be [PostalContact] {+ex:PostalContact ?sh:class}.

# ===================
# 📊 Test Data
# ===================

### ✅ Valid Records

## Valid Email Record {=ex:ValidEmailRecord .ex:Record label}

This record should PASS - has Email contact.

### Contact {=ex:EmailContact1 .ex:EmailContact label ?ex:contact}

## Valid Phone Record {=ex:ValidPhoneRecord .ex:Record label}

This record should PASS - has Phone contact.

### Contact {=ex:PhoneContact1 .ex:PhoneContact label ?ex:contact}

## Valid Postal Record {=ex:ValidPostalRecord .ex:Record label}

This record should PASS - has Postal contact.

### Contact {=ex:PostalContact1 .ex:PostalContact label ?ex:contact}

### ❌ Invalid Records

## Invalid Contact Record {=ex:InvalidContactRecord .ex:Record label}

This record should FAIL - has Person contact (not Email/Phone/Postal).

### Contact {=ex:Person1 .ex:Person label ?ex:contact}

## No Contact Record {=ex:NoContactRecord .ex:Record label}

This record should FAIL - has no contact property.

# ===================
# 📋 Expected Results
# ===================

## ✅ Should Pass:
- ex:ValidEmailRecord (contact = ex:EmailContact1)
- ex:ValidPhoneRecord (contact = ex:PhoneContact1)
- ex:ValidPostalRecord (contact = ex:PostalContact1)

## ❌ Should Fail:
- ex:InvalidContactRecord (contact = ex:Person1 - not in [EmailContact, PhoneContact, PostalContact])

## ⚪ Not Checked by sh:or:
- ex:NoContactRecord (no contact - sh:or doesn't check property presence)

## 🎯 Key Points:
1. Verbose RDF list: l1 → EmailShape → l2 → PhoneShape → l3 → PostalShape → rdf:nil
2. sh:or constraint points to l1 (first list node)
3. sh:targetSubjectsOf targets all entities with contact property
4. sh:path = ex:contact (property to validate)
5. grapoi .list() should traverse the RDF list of shapes correctly
6. **SHACL Design**: sh:or only validates values if property exists (doesn't check presence)
7. **Property Presence**: Use sh:minCount/sh:maxCount to check if property is required
