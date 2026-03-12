[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Pattern Constraint {=sh:pattern .class:PatternConstraint label}

> Validates string values against regular expression patterns. Essential for email validation, phone number formatting, identifier patterns, and any text-based data format requirements. {comment}

<http://www.w3.org/ns/shacl#pattern> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#flags> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates pattern validation using email addresses.

### Email Validation Demo

The **Pattern Example Shape** {=ex:PatternExampleShape .sh:NodeShape ?cat:hasShape label} targets [ValidNode and InvalidNode] {+ex:ValidNode ex:InvalidNode ?sh:targetNode} to validate [email addresses] {+ex:email ?sh:path} match [^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$] {sh:pattern} with [i] {sh:flags}: **Email must follow standard format** {sh:message}.

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Email {=ex:ValidNode}

Email address that matches standard pattern.

Email: [user@example.com] {ex:email ^^xsd:string}

#### Invalid Email {=ex:InvalidNode}

Email address that doesn't match standard pattern.

Email: [invalid-email] {ex:email ^^xsd:string}

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Email** - passes (matches email pattern ✓)
2. **Invalid Email** - fails once (doesn't match email pattern ✗)

### 🔍 Test Validation

```bash
# This should show 1 violation - InvalidNode has malformed email
ig-cli validate ./constraints/pattern.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Email validation** - ensure proper email format with domain validation
- **Phone number validation** - enforce specific phone number patterns
- **Identifier validation** - product codes, employee IDs, serial numbers
- **URL validation** - ensure proper URL structure
- **Username validation** - enforce username format rules

**Pattern syntax:**
- **Regular expressions** - full regex pattern support
- **Case flags** - `i` for case-insensitive, `g` for global, `m` for multiline
- **Unicode support** - handles international character sets
- **Escape sequences** - use `\\` for literal backslashes in patterns

**Key behavior:**
- **String-only validation** - applies to string literal values
- **Pattern matching** - entire value must match the regex pattern
- **Violation per non-match** - each value that fails pattern generates violation
