[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/comparison/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Comparison Constraints {=sh:lessThan .class:ComparisonConstraint label}

> Validates property values against reference nodes using comparison operators. Essential for ordering, version control, date validation, and business rule enforcement where values must be smaller than or equal to specific reference points. {comment}

<http://www.w3.org/ns/shacl#lessThan> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#lessThanOrEquals> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#equals> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates comparison constraints using event scheduling and pricing validation.

### Event Validation Demo

The **Event Planning Shape** {=ex:EventPlanningShape .sh:NodeShape ?cat:hasShape label} targets all [events] {+ex:Event ?sh:targetClass} to validate business rules: **Event must follow business planning rules** {sh:message}

**Order Date Rule** {=ex:#orderDateRule .sh:PropertyShape ?sh:property} ensures [order date] {+ex:orderDate ?sh:path} is scheduled before [shipping date] {+ex:shippingDate ?sh:lessThan}: **Order must be placed before shipping** {sh:message}.

{=ex:EventPlanningShape}

**Version Rule** {=ex:#versionRule .sh:PropertyShape ?sh:property} ensures [current version] {+ex:currentVersion ?sh:path} does not exceed [latest version] {+ex:latestVersion ?sh:lessThanOrEquals}: **Current version must be ≤ latest version** {sh:message}.

{=ex:EventPlanningShape}

**Pricing Rule** {=ex:#pricingRule .sh:PropertyShape ?sh:property} ensures [ticket price] {+ex:ticketPrice ?sh:path} matches [standard price] {+ex:standardPrice ?sh:equals}: **Ticket price must equal standard price** {sh:message}.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Event {=ex:ValidEvent .ex:Event}

A properly scheduled event with correct versioning and standard pricing.

Order Date: [2024-06-15] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}
Current Version: [2.1] {ex:currentVersion ^^xsd:string}
Latest Version: [3.0] {ex:latestVersion ^^xsd:string}
Ticket Price: [99.99] {ex:ticketPrice ^^xsd:decimal}
Standard Price: [99.99] {ex:standardPrice ^^xsd:decimal}

#### Invalid Event - Late Order {=ex:LateOrderEvent .ex:Event}

An event with order date after shipping date (violates temporal business rule).

Order Date: [2024-06-25] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}
Current Version: [2.1] {ex:currentVersion ^^xsd:string}
Latest Version: [3.0] {ex:latestVersion ^^xsd:string}
Ticket Price: [99.99] {ex:ticketPrice ^^xsd:decimal}
Standard Price: [99.99] {ex:standardPrice ^^xsd:decimal}

#### Invalid Event - Version Mismatch {=ex:VersionMismatchEvent .ex:Event}

An event using version [3.1] {ex:currentVersion ^^xsd:string} newer than latest available (violates version control).

Order Date: [2024-06-15] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}
Latest Version: [3.0] {ex:latestVersion ^^xsd:string}
Ticket Price: [99.99] {ex:ticketPrice ^^xsd:decimal}
Standard Price: [99.99] {ex:standardPrice ^^xsd:decimal}

#### Invalid Event - Price Mismatch {=ex:PriceMismatchEvent .ex:Event}

An event with non-standard pricing (violates pricing policy).

Order Date: [2024-06-15] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}
Current Version: [2.1] {ex:currentVersion ^^xsd:string}
Latest Version: [3.0] {ex:latestVersion ^^xsd:string}
Ticket Price: [149.99] {ex:ticketPrice ^^xsd:decimal}
Standard Price: [99.99] {ex:standardPrice ^^xsd:decimal}

---

[This demo] {=ex:demo} must produce exactly **4** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Event** - passes (order < shipping ✓, version ≤ latest ✓, price = standard ✓)
2. **Invalid Event - Late Order** - fails once (order > shipping ✗, version ≤ latest ✓, price = standard ✓)
3. **Invalid Event - Version Mismatch** - fails once (order ≤ shipping ✓, version > latest ✗, price = standard ✓)
4. **Invalid Event - Price Mismatch** - fails once (order ≤ shipping ✓, version ≤ latest ✓, price ≠ standard ✗)

Note: Each constraint validates independently; multiple violations can occur on same event.

### 🔍 Test Validation

```bash
# This should show 4 violations - late order, version mismatch, and price mismatch
ig-cli validate ./constraints/comparison.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Temporal validation** - order dates before shipping dates, start times before end times
- **Version control** - ensure current version doesn't exceed latest version
- **Pricing validation** - ticket prices must match standard pricing tiers
- **Business rules** - enforce directional business constraints (A must happen before B)
- **Quality gates** - ensure metrics stay within approved ranges

**Key advantages:**
- ✅ **Directional validation** - clear semantic direction (focus node vs reference node)
- ✅ **Reference-based** - compare against specific reference values/nodes
- ✅ **Business logic** - encode complex business rules in declarative constraints
- ✅ **Asymmetric by design** - prevents ambiguous validation logic
- ✅ **Node comparison** - works with IRI references, not just literals

---

## 🔧 Technical Notes

### **Constraint Behavior:**
- `sh:lessThan` - focus node values must be smaller than reference node values
- `sh:lessThanOrEquals` - focus node values must be ≤ reference node values  
- `sh:equals` - focus node values must equal reference node values
- All use `sh:nodeKind sh:IRI` to reference other nodes

### **SHACL Processing:**
- Reference nodes are not validated themselves - they serve as comparison targets
- Asymmetric design prevents circular validation logic
- Multiple comparison constraints can apply to same property
- Validation fails if ANY comparison constraint fails

### **Best Practices:**
- Use clear reference node names that indicate their purpose (latestVersion, shippingDate)
- Document the business rule clearly in constraint messages
- Test reference nodes independently to ensure they exist
- Consider using `sh:in` for enumerated valid values instead of complex comparisons
- Group related comparison constraints on same property for business logic clarity
