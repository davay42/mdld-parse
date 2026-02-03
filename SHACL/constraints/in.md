[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/in/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Value Enumeration {=sh:in .class:PresenceConstraint label}

> Constrains property values to be within a specified list of allowed values using RDF lists. Essential for controlled vocabularies, status codes, and enumeration validation. {comment}

<http://www.w3.org/ns/shacl#in> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates value enumeration using a status validation scenario.

### Status Validation Demo

The **Status Validation Shape** {=ex:StatusValidationShape .sh:NodeShape ?cat:hasShape label} targets all [employees] {+ex:Employee ?sh:targetClass} to validate status values.

**Allowed Status Rule** {=ex:#allowedStatus .sh:PropertyShape ?sh:property}

> Status must be either Active or Inactive: **Status must be in allowed list** {sh:message}

This property defines rules for the [status] {+ex:status ?sh:path} property.

Status values must be in the allowed list using verbose RDF list syntax.

First we need a [List] {=ex:l1 ?sh:in .rdf:List} node with the first item assigned to it [Active] {+ex:Active ?rdf:first}, then followed by another [list] {=ex:l2 ?rdf:rest} node with the second item [Inactive] {+ex:Inactive ?rdf:first} followed by a nil node (end of list) [nil] {+rdf:nil ?rdf:rest} And reset current subject to avoid accidental assignments: {=}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Employee {=ex:ValidEmployee .ex:Employee}

A valid employee with allowed status.

Status: [Active] {+ex:Active ?ex:status}

#### Invalid Status Employee {=ex:InvalidStatusEmployee .ex:Employee}

An employee with invalid status.

Status: [Pending] {+ex:Pending ?ex:status}

#### Missing Status Employee {=ex:MissingStatusEmployee .ex:Employee}

An employee with no status (not validated by sh:in).

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Employee** - passes (status: Active ✓)
2. **Invalid Status Employee** - fails once (status: Pending ✗)
3. **Missing Status Employee** - not validated (no status property - sh:in doesn't check presence)

Note: `sh:in` only validates values if the property exists. Use `sh:minCount` to check for required properties.

### 🔍 Test Validation

```bash
# This should show 1 violation - invalid status value
ig-cli validate ./constraints/in.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Controlled vocabularies** - status codes, priority levels
- **Enumeration validation** - department categories, document types
- **Value constraints** - allowed colors, sizes, formats
- **Business rules** - valid payment methods, shipping options
- **Data quality** - valid country codes, currency codes

**Key advantages:**
- ✅ **Explicit validation** - clearly defines allowed values
- ✅ **Ordered semantics** - maintains list structure in RDF
- ✅ **Flexible targeting** - works with any SHACL targeting mechanism
- ✅ **Business clarity** - makes allowed values visible in documentation
- ✅ **Type safety** - ensures only predefined values are used

---

## 🔧 Technical Notes

### **RDF List Structure:**
- Each list node has `rdf:type rdf:List`
- `rdf:first` contains the current item
- `rdf:rest` points to the next list node
- Final list node has `rdf:rest rdf:nil`

### **SHACL Behavior:**
- `sh:in` only validates existing property values
- Does not check for property presence (use `sh:minCount` for that)
- Works with any datatype (IRIs, literals, numbers)
- List order is preserved but not significant for validation

### **Performance Considerations:**
- RDF lists are traversed during validation
- Large lists may impact performance
- Consider `sh:hasValue` for single-value constraints
- Use `sh:pattern` for pattern-based validation when appropriate
