[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Severity Levels {=sh:severity .class:SeverityConstraint label}

> Defines the severity level of validation violations (Info, Warning, Violation). Essential for prioritizing validation results and managing different types of constraint failures. {comment}

<http://www.w3.org/ns/shacl#severity> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#message> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates severity levels and custom messages using user account validation.

### User Account Validation Demo

The **User Validation Shape** {=ex:UserValidationShape .sh:NodeShape ?cat:hasShape label} targets all [users] {+ex:User ?sh:targetClass} to validate account requirements with different severity levels.

It includes the **Critical Email Rule** {=ex:CriticalRule .sh:PropertyShape ?sh:property} that requires [email] {+ex:email ?sh:path} to be [string] {+xsd:string ?sh:datatype} and [required] {+1 ?sh:minCount} with [Violation severity] {+sh:Violation ?sh:severity}: **Email address is required and must be valid** {sh:message}.

**It** {=ex:UserValidationShape} also includes the **Warning Age Rule** {=ex:WarningRule .sh:PropertyShape ?sh:property} that requires [age] {+ex:age ?sh:path} to be [integer] {+xsd:integer ?sh:datatype} and [maximum 120] {+120 ?sh:maxInclusive} with [Warning severity] {+sh:Warning ?sh:severity}: **Age should be between 18 and 120** {sh:message}.

**it** {=ex:UserValidationShape} also includes the **Info Name Rule** {=ex:InfoNameRule .sh:PropertyShape ?sh:property} that requires [name] {+ex:name ?sh:path} to be [string] {+xsd:string ?sh:datatype} and [required] {+1 ?sh:minCount} with [Info severity] {+sh:Info ?sh:severity}: **Name should be provided for better user experience** {sh:message}.

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid User {=ex:ValidUser .ex:User}

User with complete valid information.

Email: [user@example.com] {ex:email}
Age: [25] {ex:age ^^xsd:integer}
Name: [John Doe] {ex:name}

#### Invalid User {=ex:InvalidUser .ex:User}

User with multiple issues at different severity levels.

Email: [invalid-email] {ex:email}  # Critical violation
Age: [150] {ex:age ^^xsd:integer}  # Warning violation
Name: [] {ex:name}  # Info violation (empty string)

---

[This demo] {=ex:demo} must produce exactly **3** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid User** - passes (has valid email, reasonable age, and name ✓)
2. **Invalid User** - fails three times:
   - **Critical**: Email is invalid format ✗
   - **Warning**: Age is unusually high ✗  
   - **Info**: Name is missing ✗

### 🔍 Test Validation

```bash
# This should show 3 violations with different severity levels
ig-cli validate ./constraints/severity.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for severity and message constraints:**

1. **Named PropertyShapes** - Use explicit nodes for better organization
2. **Severity levels** - Apply `sh:Violation`, `sh:Warning`, or `sh:Info`
3. **Custom messages** - Provide clear, actionable error descriptions
4. **Class targeting** - Use `sh:targetClass` for domain validation

**Severity levels:**
- **sh:Violation** - Critical errors that must be fixed
- **sh:Warning** - Non-critical issues that should be addressed
- **sh:Info** - Informational messages for improvement

**Message best practices:**
- **Clear and concise** - Explain what's wrong and how to fix
- **User-friendly** - Avoid technical jargon where possible
- **Actionable** - Provide guidance for resolution
- **Context-specific** - Tailor to the constraint being violated

**Use cases:**
- **Critical validation** - Required fields, format validation
- **Business rules** - Policy compliance, data quality
- **User experience** - Optional but recommended fields
- **System monitoring** - Performance thresholds, usage patterns
