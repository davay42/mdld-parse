[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/logical/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# OR Constraint {=sh:or .class:LogicalConstraint label}

> Requires at least one constraint in the list to be satisfied. Essential for flexible validation where multiple alternative conditions are acceptable. {comment}

<http://www.w3.org/ns/shacl#or> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates logical OR constraint using contact information validation scenario.

### Contact Validation Demo

The **Contact Validation Shape** {=ex:ContactValidationShape .sh:NodeShape ?cat:hasShape label} targets all [contacts] {+ex:Contact ?sh:targetClass} to validate alternative contact methods: **At least one contact method required** {sh:message}

Contact must satisfy at least one constraint using verbose RDF list syntax for sh:or.

**Constraints List** {=ex:l1 ?sh:or .rdf:List}: [Email Constraint] {+ex:emailRequired ?rdf:first}, then [followed] {=ex:l2 ?rdf:rest} by the second constraint [Phone Constraint] {+ex:phoneRequired ?rdf:first} and a [nil] {+rdf:nil ?rdf:rest} node (end of list). Reset current subject to avoid accidental further assignments with {=}.

**Email Required Constraint** {=ex:emailRequired .sh:PropertyShape} ensures the [email] {+ex:email ?sh:path} property has at least [1] {sh:minCount ^^xsd:integer} value.

**Phone Required Constraint** {=ex:phoneRequired .sh:PropertyShape} ensures the [phone] {+ex:phone ?sh:path} property has at least [1] {sh:minCount ^^xsd:integer} value.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Contact - Email {=ex:ValidEmailContact .ex:Contact}

A valid contact with email only.

Name: [Alice] {ex:name}
Email: [alice@example.com] {ex:email}

#### Valid Contact - Phone {=ex:ValidPhoneContact .ex:Contact}

A valid contact with phone only.

Name: [Bob] {ex:name}
Phone: [555-1234] {ex:phone}

#### Valid Contact - Both {=ex:ValidBothContact .ex:Contact}

A valid contact with both email and phone.

Name: [Charlie] {ex:name}
Email: [charlie@example.com] {ex:email}
Phone: [555-5678] {ex:phone}

#### Invalid Contact - None {=ex:InvalidContact .ex:Contact}

An invalid contact with no contact methods.

Name: [Dana] {ex:name}

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Contact - Email** - passes (has email ✓, no phone ✗ - but OR requires only one)
2. **Valid Contact - Phone** - passes (no email ✗, has phone ✓ - but OR requires only one)  
3. **Valid Contact - Both** - passes (has email ✓, has phone ✓)
4. **Invalid Contact - None** - fails once (no email ✗, no phone ✗ - none satisfy OR)

Note: Each failing node produces one violation for sh:or, even if multiple constraints fail.

### 🔍 Test Validation

```bash
# This should show 1 violation - contact with no methods
ig-cli validate ./constraints/or.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Alternative contact methods** - email OR phone OR social media
- **Flexible identification** - username OR email OR employee ID
- **Multiple address types** - work OR home OR postal address
- **Document formats** - PDF OR DOC OR HTML accepted
- **Payment methods** - credit card OR PayPal OR bank transfer

**Key advantages:**
- ✅ **Flexible validation** - accepts multiple valid alternatives
- ✅ **User-friendly** - doesn't force unnecessary data
- ✅ **Business logic** - models real-world choice scenarios
- ✅ **Migration support** - allows old and new formats during transition
- ✅ **Optional enrichment** - primary OR secondary information acceptable

---

## 🔧 Technical Notes

### **Logical Behavior:**
- `sh:or` succeeds if at least one constraint passes
- Constraints are evaluated independently
- Order doesn't matter for validation result
- Multiple passing constraints don't create additional violations

### **SHACL Behavior:**
- Creates separate validation contexts for each constraint
- Violations only reported if all constraints fail
- Performance depends on constraint complexity and order
- Works with any constraint type (property, node, logical)

### **Best Practices:**
- Put most common/likely constraints first for performance
- Use descriptive constraint names for debugging
- Test each alternative constraint independently
- Document business rules for alternative acceptance clearly
