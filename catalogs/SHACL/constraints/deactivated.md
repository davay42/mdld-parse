[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Deactivated Constraint {=sh:deactivated .class:DeactivatedConstraint label}

> Temporarily disables specific constraints during validation. Essential for phased validation, conditional rule enforcement, and managing constraint lifecycle in evolving schemas. {comment}

<http://www.w3.org/ns/shacl#deactivated> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates deactivated constraint using user account validation.

### User Account Validation Demo

The **Deactivated Example Shape** {=ex:DeactivatedExampleShape .sh:NodeShape ?cat:hasShape label} targets [Valid Node] {+ex:ValidNode ?sh:targetNode}  [Invalid Node] {+ex:InvalidNode  ?sh:targetNode} to validate user account properties.

**Active Status Rule** {=ex:ActiveProperty .sh:PropertyShape ?sh:property} ensures [status] {+ex:status ?sh:path} must be [active] {sh:hasValue}: **User status must be active** {sh:message}.

{=ex:DeactivatedExampleShape}

**Deactivated Category Rule** {=ex:DeactivatedProperty .sh:PropertyShape ?sh:property} ensures [category] {+ex:category ?sh:path} must be [premium] {sh:hasValue} but is [deactivated] {sh:deactivated}: **Category rule temporarily disabled** {sh:message}.

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Account {=ex:ValidNode}

Account with active status (satisfies active rule).

Status: [active] {ex:status}
Category: [basic] {ex:category}  # Would violate category rule but it's deactivated

#### Invalid Account {=ex:InvalidNode}

Account with inactive status (violates active rule).

Status: [inactive] {ex:status}  # Violates active rule
Category: [basic] {ex:category}  # Would violate category rule but it's deactivated

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Account** - passes (status is "active" ✓, category rule deactivated ✓)
2. **Invalid Account** - fails once (status is "inactive" ✗, category rule deactivated ✓)

### 🔍 Test Validation

```bash
# This should show 1 violation - only from active status rule
ig-cli validate ./constraints/deactivated.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Phased validation** - enable/disable constraints during schema migration
- **Conditional enforcement** - temporarily suspend business rules during maintenance
- **A/B testing** - compare validation with different constraint sets
- **Gradual rollout** - enable constraints incrementally across systems

**Key behavior:**
- **Constraint-level control** - applies to individual constraints, not entire shapes
- **Validation exclusion** - deactivated constraints are completely ignored
- **No side effects** - deactivated constraints don't affect other validations
- **Runtime flexibility** - can be toggled without schema changes

**Deactivation strategies:**
- **Maintenance mode** - disable non-critical constraints during system updates
- **Legacy data** - temporarily relax rules for historical data migration
- **Feature flags** - enable/disable validation based on application features
