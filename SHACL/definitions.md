[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[meta] <cat:shapes/metadata/>

# SHACL Catalog Definitions {=cat:definitions .Container label}

> Single source of truth for SHACL catalog semantic structure and validation rules {?comment}

---

## Catalog Completeness Validation

### Catalog Completeness Shape {=cat:shapes/catalog .sh:NodeShape label}

Ensures the catalog maintains its structural integrity.

##### Constraint Count Validation {=cat:shapes/catalog/count .sh:PropertyShape ?sh:property}

[Catalog] {+cat:index ?sh:targetNode} must [include] {+cat:includes ?sh:path} exactly [52] {sh:minCount sh:maxCount ^^xsd:integer} constraints.

> Catalog must include exactly 52 constraints for complete SHACL coverage {sh:message}

### Constraint Metadata Validation

#### Constraint Metadata Shape {=meta:Constraint .sh:NodeShape label}

Validates that all SHACL constraints have proper metadata: labels, full IRIs, and comments.

##### Label Validation {=meta:label .sh:PropertyShape ?sh:property}

Each constraint [included] {+cat:includes ?sh:targetObjectsOf} in this catalog must have [1] {sh:minCount sh:maxCount ^^xsd:integer} short human readable [label] {+label ?sh:path}.

> Each SHACL constraint must have an label for proper catalog organization {sh:message}

##### Full IRI Validation {=meta:fulliri .sh:PropertyShape ?sh:property}

Each constraint that our catalog [includes] {+cat:includes ?sh:targetObjectsOf} must have [1] {sh:minCount sh:maxCount ^^xsd:integer} full IRI documentation [fullIRI] {+cat:fullIRI ?sh:path}.

> Each SHACL constraint must document its full IRI for completeness {sh:message}

##### Comment Validation {=meta:comment .sh:PropertyShape ?sh:property}

Each constraint must [include] {+cat:includes ?sh:targetObjectsOf} exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [comment] {+comment ?sh:path}.

> Each SHACL constraint must have an comment for discoverability {sh:message}

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