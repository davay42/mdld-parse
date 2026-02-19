[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Disjoint Constraint {=sh:disjoint .class:DisjointConstraint label}

> Ensures that values of a property are disjoint with values of another property. Essential for preventing value overlap between related properties like labels, categories, or mutually exclusive attributes. {comment}

<http://www.w3.org/ns/shacl#disjoint> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates the disjoint constraint using country labels.

### Country Label Demo

The **Disjoint Example Shape** {=ex:DisjointExampleShape .sh:NodeShape ?cat:hasShape label} targets [USA] {+ex:USA ?sh:targetNode} and [Germany] {+ex:Germany ?sh:targetNode} to validate that [preferred labels] {+ex:prefLabel ?sh:path} are [disjoint] {+ex:altLabel ?sh:disjoint}: **Preferred labels must be different from alternative labels** {sh:message}.

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Case - USA {=ex:USA}

Country with distinct preferred and alternative labels.

Preferred Label: [USA] {ex:prefLabel}
Alternative Label: [United States] {ex:altLabel}

#### Invalid Case - Germany {=ex:Germany}

Country with same value in both labels (violates disjoint constraint).

Preferred Label: [Germany] {ex:prefLabel}
Alternative Label: [Germany] {ex:altLabel}

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **USA** - passes (prefLabel "USA" ≠ altLabel "United States" ✓)
2. **Germany** - fails once (prefLabel "Germany" = altLabel "Germany" ✗)

### 🔍 Test Validation

```bash
# This should show 1 violation - Germany has same value in both properties
ig-cli validate ./constraints/disjoint.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Label management** - ensure prefLabel and altLabel don't overlap
- **Category exclusivity** - prevent items from being in multiple exclusive categories
- **Status separation** - ensure status properties don't share values
- **Data quality** - prevent duplicate values across related properties

**Key behavior:**
- **Value-level validation** - checks individual values, not entire sets
- **Property-to-property comparison** - compares values between two properties on same node
- **Violation per overlapping value** - each shared value generates a separate violation
