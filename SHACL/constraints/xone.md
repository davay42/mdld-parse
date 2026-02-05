[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/logical/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# XONE Constraint {=sh:xone .class:LogicalConstraint label}

> Requires exactly one constraint in the list to be satisfied. Essential for mutually exclusive validation scenarios where only one condition may pass. {comment}

<http://www.w3.org/ns/shacl#xone> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates logical XONE constraint using exclusive identification validation scenario.

### Exclusive Identification Demo

The **Person Identification Shape** {=ex:PersonIdentificationShape .sh:NodeShape ?cat:hasShape label} targets all [people] {+ex:Person ?sh:targetClass} to validate exclusive identification methods: **Exactly one identification method required** {sh:message}

Person must satisfy exactly one constraint using verbose RDF list syntax for sh:xone.

**Constraints List** {=ex:l1 ?sh:xone .rdf:List}: [Email Constraint] {+ex:emailOnly ?rdf:first}, then [followed] {=ex:l2 ?rdf:rest} by the second constraint [Phone Constraint] {+ex:phoneOnly ?rdf:first} and a [that's it] {+rdf:nil ?rdf:rest}. Reset current subject to avoid accidental further assignments with {=}.

**Email Only Constraint** {=ex:emailOnly .sh:PropertyShape} ensures the [email] {+ex:email ?sh:path} property has at least [1] {sh:minCount ^^xsd:integer} value.

**Phone Only Constraint** {=ex:phoneOnly .sh:PropertyShape} ensures the [phone] {+ex:phone ?sh:path} property has at least [1] {sh:minCount ^^xsd:integer} value.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Person - Email Only {=ex:ValidEmailPerson .ex:Person}

A valid person with email only.

Name: [Alice] {ex:name}
Email: [alice@example.com] {ex:email}

#### Valid Person - Phone Only {=ex:ValidPhonePerson .ex:Person}

A valid person with phone only.

Name: [Bob] {ex:name}
Phone: [555-1234] {ex:phone}

#### Invalid Person - Both {=ex:InvalidBothPerson .ex:Person}

An invalid person with both email and phone.

Name: [Charlie] {ex:name}
Email: [charlie@example.com] {ex:email}
Phone: [555-5678] {ex:phone}

#### Invalid Person - None {=ex:InvalidNonePerson .ex:Person}

An invalid person with no identification methods.

Name: [Dana] {ex:name}

---

[This demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Person - Email Only** - passes (email only ✓, phone only ✗ - exactly one passes)
2. **Valid Person - Phone Only** - passes (email only ✗, phone only ✓ - exactly one passes)  
3. **Invalid Person - Both** - fails once (email only ✓, phone only ✓ - more than one passes)
4. **Invalid Person - None** - fails once (email only ✗, phone only ✗ - none pass)

Note: Each failing node produces one violation for sh:xone, regardless of how many constraints fail.

### 🔍 Test Validation

```bash
# This should show 2 violations - persons with 0 or 2+ identification methods
ig-cli validate ./constraints/xone.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Mutually exclusive categories** - student OR faculty OR staff (not multiple)
- **Single identification method** - email OR phone OR username (exactly one)
- **Exclusive status codes** - active OR pending OR closed (only one state)
- **Unique document types** - invoice OR receipt OR quote (single classification)
- **Exclusive roles** - buyer OR seller OR observer (only one role allowed)

**Key advantages:**
- ✅ **Mutual exclusion** - enforces exactly one condition
- ✅ **Business rules** - models exclusive choice scenarios
- ✅ **Data integrity** - prevents conflicting classifications
- ✅ **Clear validation** - unambiguous failure conditions
- ✅ **State management** - ensures single valid state

---

## 🔧 Technical Notes

### **Logical Behavior:**
- `sh:xone` succeeds if exactly one constraint passes
- Zero constraints passing = failure
- More than one constraint passing = failure
- Order doesn't matter for validation result

### **SHACL Behavior:**
- Creates separate validation contexts for each constraint
- Violations only reported if zero or multiple constraints pass
- Performance depends on constraint complexity
- Works with any constraint type (property, node, logical)

### **Best Practices:**
- Make constraints truly mutually exclusive
- Use descriptive constraint names for debugging
- Test each constraint independently first
- Document exclusive business rules clearly
- Consider adding helper constraints for clarity
