[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <cat:example/count/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Min Count {=sh:minCount .class:Constraint label}

> Specifies the minimum number of values a property must have {comment}

<http://www.w3.org/ns/shacl#minCount> {?cat:fullIRI}

# Max Count {=sh:maxCount .class:Constraint label}

> Specifies the maximum number of values a property can have {comment}

<http://www.w3.org/ns/shacl#maxCount> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

The **Person Test Shape** {=ex:PersonTestShape .sh:NodeShape ?cat:hasShape label} validates all [member] {+member ?sh:targetObjectsOf} entities of the test data container to demonstrate count constraints.

**Required Email Rule** {=ex:#emailExact .sh:PropertyShape ?sh:property} requires the [email] {+ex:email ?sh:path} property to have at least [1] {sh:minCount ^^xsd:integer} and at most [1] {sh:maxCount ^^xsd:integer} value: **Person must have exactly one email address** {sh:message}

**Optional Phone Rule** {=ex:#phoneOptional .sh:PropertyShape ?sh:property} allows the [phone] {+ex:phone ?sh:path} property to have at most [2] {sh:maxCount ^^xsd:integer} values: **Person can have at most two phone numbers** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Person {=ex:ValidPerson ?member}

Email: [work@example.com] {ex:email}
Phone: [555-1234] {ex:phone}
Phone: [555-5678] {ex:phone}

#### Invalid Person - Too Few {=ex:InvalidPersonFew ?member}

Phone: [555-1234] {ex:phone}

#### Invalid Person - Too Many {=ex:InvalidPersonMany ?member}

Email: [work@example.com] {ex:email}
Email: [personal@example.com] {ex:email}
Phone: [555-1234] {ex:phone}
Phone: [555-5678] {ex:phone}
Phone: [555-9999] {ex:phone}

---

[Demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Person** - passes (1 email, 2 phones - all within limits)
2. **Invalid Person - Too Few** - fails (0 emails - below minCount of 1)
3. **Invalid Person - Too Many** - fails (2 emails - exceeds maxCount of 1)

### 🔍 Test Validation

```bash
# This should show 2 violations for count constraint violations
ig-cli validate ./constraints/count.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for count constraints:**

1. Use exact values with both minCount and maxCount for required properties
2. Use maxCount alone for optional multi-valued properties
3. Combine multiple count constraints in a single NodeShape
4. Provide clear validation messages that specify the exact requirement

This approach ensures precise cardinality control while maintaining readability.
