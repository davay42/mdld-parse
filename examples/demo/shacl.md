[sh] <http://www.w3.org/ns/shacl#>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[my] <tag:alice@example.com,2026:>

# SHACL Validation Demo {=my:shacl-demo .prov:Entity label}

Demonstrates SHACL validation shapes with self-documenting examples.

## Person Validation Shape

### Person Shape {=my:PersonShape .sh:NodeShape label}

Validates all [Person] {+my:Person ?sh:targetClass} nodes with proper constraints.

**Name Rule** {+my:PersonShape-name .sh:PropertyShape ?sh:property}
Path: [name] {+rdfs:label ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer sh:maxCount ^^xsd:integer}
Datatype: [string] {+xsd:string ?sh:datatype}

> Every person must have exactly one name. {sh:message}

**Email Rule** {+my:PersonShape-email .sh:PropertyShape ?sh:property}
Path: [email] {+my:email ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
Datatype: [string] {+xsd:string ?sh:datatype}
Pattern: [.*@.*] {sh:pattern}

> Email must be a valid email address. {sh:message}

**Age Rule** {+my:PersonShape-age .sh:PropertyShape ?sh:property}
Path: [age] {+my:age ?sh:path}
Datatype: [integer] {+xsd:integer ?sh:datatype}
Minimum: [0] {sh:minInclusive ^^xsd:integer}
Maximum: [150] {sh:maxInclusive ^^xsd:integer}

> Age must be between 0 and 150 years. {sh:message}

## Test Data

### Valid Person {=my:valid-person .my:Person label}

Name: [Alice Smith] {rdfs:label}
Email: [alice@example.com] {my:email}
Age: [30] {my:age ^^xsd:integer}

### Invalid Person {=my:invalid-person .my:Person label}

Name: [Bob] {rdfs:label}
Age: [-5] {my:age ^^xsd:integer}

## Product Validation Shape

### Product Shape {=my:ProductShape .sh:NodeShape label}

Validates [Product] {+my:Product ?sh:targetClass} nodes with business rules.

**SKU Rule** {+my:ProductShape-sku .sh:PropertyShape ?sh:property}
Path: [sku] {+my:sku ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer sh:maxCount ^^xsd:integer}
Datatype: [string] {+xsd:string ?sh:datatype}
Min length: [3] {sh:minLength ^^xsd:integer}
Max length: [50] {sh:maxLength ^^xsd:integer}

> Product SKU must be 3-50 characters. {sh:message}

**Price Rule** {+my:ProductShape-price .sh:PropertyShape ?sh:property}
Path: [price] {+my:price ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
Datatype: [decimal] {+xsd:decimal ?sh:datatype}
Minimum: [0.01] {sh:minInclusive ^^xsd:decimal}

> Product price must be positive. {sh:message}

**Category Rule** {+my:ProductShape-category .sh:PropertyShape ?sh:property}
Path: [category] {+my:category ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
In: [Electronics, Books, Clothing] {+my:categories ?sh:in}

> Category must be one of: Electronics, Books, Clothing. {sh:message}

## Test Data

### Valid Product {=my:valid-product .my:Product label}

SKU: [ELEC-001] {my:sku}
Name: [Wireless Mouse] {rdfs:label}
Price: [29.99] {my:price ^^xsd:decimal}
Category: [Electronics] {my:category}

### Invalid Product {=my:invalid-product .my:Product label}

SKU: [AB] {my:sku}
Price: [-10.00] {my:price ^^xsd:decimal}
Category: [Toys] {my:category}

## Complex Validation Shape

### Order Validation Shape {=my:OrderShape .sh:NodeShape label}

Validates [Order] {+my:Order ?sh:targetClass} with conditional logic.

**Customer Rule** {=my:OrderShape-customer .sh:PropertyShape ?sh:property}
Path: [customer] {+my:customer ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}
Node: [Person] {+my:Person ?sh:node}

> Order must have a valid customer. {sh:message}

**Items Rule** {=my:OrderShape-items .sh:PropertyShape ?sh:property}
Path: [items] {+my:items ?sh:path}
Min count: [1] {sh:minCount ^^xsd:integer}
Node kind: [BlankNodeOrIRI] {+sh:BlankNodeOrIRI ?sh:nodeKind}

> Order must have at least one item. {sh:message}

**Total Validation** {=my:OrderShape-total .sh:PropertyShape ?sh:property}
Path: [total] {+my:total ?sh:path}
Datatype: [decimal] {+xsd:decimal ?sh:datatype}
Min inclusive: [0.01] {sh:minInclusive ^^xsd:decimal}

> Order total must be positive. {sh:message}

## Logical Constraints

### Exclusive Properties Shape {=my:ExclusiveShape .sh:NodeShape label}

Shows OR (sh:or) and XOR (sh:xone) constraints.

**Either/Or Rule** {=my:ExclusiveShape-either .sh:PropertyShape ?sh:property}
Path: [identifier] {+my:identifier ?sh:path}
Or: [email, phone] {+my:email ?sh:or +my:phone ?sh:property}

> Must have either email OR phone. {sh:message}

**Exactly One/XOne Rule** {=my:ExclusiveShape-exactly .sh:PropertyShape ?sh:property}
Path: [primaryContact] {+my:primaryContact ?sh:path}
Xone: [email, phone] {+my:email ?sh:xone +my:phone ?sh:property}

> Must have exactly one primary contact method. {sh:message}

## Test Data

### Valid Contact {=my:valid-contact .my:Person label}

Email: [contact@example.com] {my:email}
Phone: [555-1234] {my:phone}
Primary contact: [email] {my:primaryContact}

### Invalid Contact {=my:invalid-contact .my:Person label}

Phone: [555-5678] {my:phone}
Primary contact: [email] {my:primaryContact}

This demonstrates:
- NodeShape targeting with sh:targetClass
- PropertyShape constraints (datatype, min/max, patterns)
- Logical constraints (sh:or, sh:xone, sh:in)
- Self-validating examples with clear violations
- Complex validation scenarios
