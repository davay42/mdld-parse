[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Violation Message {=sh:message .class:MessageConstraint label}

> Provides human-readable error messages for constraint violations. Essential for user-friendly validation feedback, debugging, and actionable error reporting. {comment}

<http://www.w3.org/ns/shacl#message> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates semantic message design using complex business validation scenarios.

### Business Rule Validation Demo

The **Business Rule Validation Shape** {=ex:BusinessRuleValidationShape .sh:NodeShape ?cat:hasShape label} targets all [contracts] {+ex:Contract ?sh:targetClass} to validate complex business requirements.

**Contract Value Rule** {=ex:ContractValueRule .sh:PropertyShape ?sh:property} ensures [contract value] {+ex:contractValue ?sh:path} is [0] {sh:minInclusive ^^xsd:decimal}: **Contract value must be positive for financial compliance** {sh:message}.

**It** {=ex:BusinessRuleValidationShape} also includes **Approval Date Rule** {=ex:ApprovalDateRule .sh:PropertyShape ?sh:property} that ensures [approval date] {+ex:approvalDate ?sh:path} is [before start date] {+ex:startDate ?sh:lessThan} with message **Contract must be approved before start date** {sh:message}.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Contract {=ex:ValidContract .ex:Contract}

Contract that meets all business requirements.

Value: [50000.00] {ex:contractValue ^^xsd:decimal}
Approval Date: [2024-01-15] {ex:approvalDate ^^xsd:date}
Start Date: [2024-02-01] {ex:startDate ^^xsd:date}

#### Invalid Contract {=ex:InvalidContract .ex:Contract}

Contract with multiple business rule violations.

Value: [-1000.00] {ex:contractValue ^^xsd:decimal}  # Negative value
Approval Date: [2024-03-01] {ex:approvalDate ^^xsd:date}  # After start date
Start Date: [2024-02-01] {ex:startDate ^^xsd:date}

---

[This demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Contract** - passes (positive value, approved before start, acceptable risk ✓)
2. **Invalid Contract** - fails two times:
   - **Value violation**: Contract value must be positive for financial compliance ✗
   - **Date violation**: Contract must be approved before start date ✗

### 🔍 Test Validation

```bash
# This should show 2 violations with semantic business messages
ig-cli validate ./constraints/message.md
```

---

## 📝 Message Design Principles

**Semantic clarity:**
- **Business context** - Explain what business rule is violated
- **Impact description** - Describe why this matters
- **Actionable guidance** - Suggest how to fix the issue
- **Domain terminology** - Use appropriate business language

**Message structure patterns:**

### 1. Comparison Constraints
```md
**[Property] must be [relationship] [reference property]**: **[Business consequence]**
```
*Example*: "Contract must be approved before start date"
*Why*: Explains temporal business rule clearly

### 2. Value Range Constraints  
```md
**[Property] must be [condition] for [business requirement]**: **[Compliance reason]**
```
*Example*: "Contract value must be positive for financial compliance"
*Why*: Connects technical rule to business purpose

### 3. Enumeration Constraints
```md
**[Property] must be within acceptable [domain] parameters**: **[Business justification]**
```
*Example*: "Risk level must be within acceptable business parameters"
*Why*: Explains domain validation in business terms

## 🎯 Advanced Message Techniques

**Context-aware messaging:**
- **Multi-constraint scenarios** - Different messages for related violations
- **Severity-appropriate language** - Critical vs. informational tone
- **User role consideration** - Technical vs. business audience
- **Internationalization ready** - Clear, translatable messages

**Complex scenario handling:**
- **Cascading violations** - When one failure causes others
- **Interdependent rules** - Messages that reference related constraints
- **Business process flow** - Messages that follow workflow logic
- **Compliance reporting** - Regulatory and audit-focused language

**Message quality checklist:**
- ✅ **Specific** - Identifies exact constraint violated
- ✅ **Semantic** - Carries business meaning, not just technical
- ✅ **Actionable** - Provides clear resolution path
- ✅ **Consistent** - Uses uniform terminology across constraints
- ✅ **Concise** - Delivers maximum information efficiently
