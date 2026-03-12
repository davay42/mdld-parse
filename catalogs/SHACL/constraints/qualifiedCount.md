[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/qualified/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Qualified Count Constraints {=sh:qualifiedMinCount .class:QualifiedConstraint label}

> Applies count constraints only to values that meet additional shape criteria. Essential for conditional validation where only certain values should be counted. {comment}

<http://www.w3.org/ns/shacl#qualifiedMinCount> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#qualifiedMaxCount> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates qualified constraints using work email validation scenario.

### Work Email Validation Demo

The **Employee Validation Shape** {=ex:EmployeeValidationShape .sh:NodeShape ?cat:hasShape label} targets all [employees] {+ex:Employee ?sh:targetClass} to validate work email requirements: **Employee must have exactly one work email** {sh:message}

**Work Email Rule** {=ex:#workEmailRule .sh:PropertyShape ?sh:property} validates the [email] {+ex:email ?sh:path} property with qualified constraints.

Must have at least [1] {sh:qualifiedMinCount ^^xsd:integer} and at most [1] {sh:qualifiedMaxCount ^^xsd:integer} work email that matches the [Work Email Shape] {+ex:WorkEmailShape ?sh:qualifiedValueShape}.

**Work Email Shape** {=ex:WorkEmailShape .sh:NodeShape} defines what counts as a work email: must be a [literal] {+sh:Literal ?sh:nodeKind} with [string] {+xsd:string ?sh:datatype} type and pattern [company.org] {sh:pattern}.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Employee {=ex:ValidEmployee .ex:Employee}

A valid employee with exactly one work email.

Name: [John Doe] {ex:name}
Email: [john@company.org] {ex:email}

#### Invalid Employee - Multiple Work Emails {=ex:MultipleWorkEmployee .ex:Employee}

An employee with multiple work emails (violates qualifiedMaxCount).

Name: [Jane Smith] {ex:name}
Email: [jane@company.org] {ex:email}
Email: [jane.smith@company.org] {ex:email}

#### Invalid Employee - No Work Email {=ex:NoWorkEmployee .ex:Employee}

An employee with no work email (violates qualifiedMinCount).

Name: [Bob Wilson] {ex:name}
Email: [bob@gmail.com] {ex:email}

#### Valid Employee - Mixed Emails {=ex:MixedEmailEmployee .ex:Employee}

A valid employee with one work email and one personal email.

Name: [Alice Brown] {ex:name}
Email: [alice@company.org] {ex:email}
Email: [alice.personal@gmail.com] {ex:email}

---

[This demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Employee** - passes (1 work email ✓, meets qualifiedMinCount 1 and qualifiedMaxCount 1)
2. **Invalid Employee - Multiple Work Emails** - fails once (2 work emails ✗, exceeds qualifiedMaxCount 1)
3. **Invalid Employee - No Work Email** - fails once (0 work emails ✗, below qualifiedMinCount 1)
4. **Valid Employee - Mixed Emails** - passes (1 work email ✓, personal email ignored by qualified constraint)

Note: Qualified constraints only count values that conform to the qualified shape.

### 🔍 Test Validation

```bash
# This should show 2 violations - multiple work emails and no work email
ig-cli validate ./constraints/qualified.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Work email validation** - require exactly one work email, allow personal emails
- **Primary contact validation** - ensure one primary phone number among multiple contacts
- **Business address validation** - require one business address, allow home addresses
- **Role-based validation** - count only values with specific characteristics
- **Conditional counting** - apply constraints only to values meeting criteria

**Key advantages:**
- ✅ **Selective validation** - only count/validate values that meet criteria
- ✅ **Conditional logic** - apply constraints based on value characteristics
- ✅ **Flexible counting** - mix required and optional values elegantly
- ✅ **Business rules** - model real-world validation scenarios
- ✅ **Data quality** - ensure specific types of values meet requirements

---

## 🔧 Technical Notes

### **Qualified Constraint Components:**
- `sh:qualifiedMinCount` - minimum count of values that conform to qualified shape
- `sh:qualifiedMaxCount` - maximum count of values that conform to qualified shape
- `sh:qualifiedValueShape` - shape that values must conform to be counted
- `sh:qualifiedValueShapesDisjoint` - ensure qualified value shapes are mutually exclusive

### **SHACL Behavior:**
- Qualified constraints only consider values that conform to the qualified shape
- Non-conforming values are ignored for counting purposes
- Regular constraints apply to all values (conforming and non-conforming)
- Can be combined with regular constraints for comprehensive validation

### **Best Practices:**
- Use clear qualified shapes that define specific value characteristics
- Test qualified shapes independently before using in qualified constraints
- Document what counts as "qualified" values clearly
- Consider performance implications for complex qualified shapes
- Use descriptive names for qualified constraints and shapes
