[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[meta] <cat:shapes/metadata/>

# SHACL Catalog Definitions {=cat:definitions .Container label}

> Single source of truth for SHACL catalog semantic structure and validation rules {?comment}

---

### Constraint Metadata Validation

#### Constraint Metadata Shape {=meta:Constraint .sh:NodeShape label}

Validates that all SHACL constraints have proper metadata: labels, full IRIs, and comments.

**Label Validation** {=meta:label .sh:PropertyShape ?sh:property} ensures each constraint [included] {+cat:includes ?sh:targetObjectsOf} in this catalog has exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} short human readable [label] {+label ?sh:path} for proper catalog organization: **Each SHACL constraint must have an label** {sh:message}

**Full IRI Validation** {=meta:fulliri .sh:PropertyShape ?sh:property} ensures each constraint that our catalog [includes] {+cat:includes ?sh:targetObjectsOf} has exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} full IRI documentation [fullIRI] {+cat:fullIRI ?sh:path} for completeness: **Each SHACL constraint must document its full IRI** {sh:message}

**Comment Validation** {=meta:comment .sh:PropertyShape ?sh:property} ensures each constraint [included] {+cat:includes ?sh:targetObjectsOf} has exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [comment] {+comment ?sh:path} for discoverability: **Each SHACL constraint must have an comment** {sh:message}

### 📋 **Constraint Categories**

### Constraint Class {=class:Constraint .rdfs:Class label}

> A SHACL constraint is a rule that defines a validation condition for a specific shape and target node. {?rdfs:comment}

---

## Core Properties

### Catalog Structure Properties

#### includes {=cat:includes .rdf:Property label}
Relates catalog to its constraints: [includes] {+cat:includes ?sh:path}

> Links catalog index to individual constraint definitions {?comment}

#### fullIRI {=cat:fullIRI .rdf:Property label}
Full IRI documentation: [fullIRI] {+cat:fullIRI ?sh:path}

> Provides complete IRI reference for constraint properties {?comment}

---