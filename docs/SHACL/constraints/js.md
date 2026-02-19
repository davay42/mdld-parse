[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <cat:example/js/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# JavaScript Function {=sh:js .class:Constraint label}

<http://www.w3.org/ns/shacl#js> {?cat:fullIRI}

> Allows custom JavaScript validation functions for complex constraint logic {comment}

---

## 🛡️ Self-Validation Demo {=ex:demo ?cat:hasDemo}

The **Date Validation Shape** {=ex:DateValidationShape .sh:NodeShape ?cat:hasShape label} targets all [Event] {+ex:Event ?sh:targetClass} instances to validate date requirements.

**Event Date Rule** {=ex:DatePropertyShape .sh:PropertyShape ?sh:property} requires the [eventDate] {+ex:eventDate ?sh:path} property to pass [Date JS Constraint] {+ex:DateJSConstraint ?sh:JSConstraint} validation: *Event date must be a valid date string* {sh:message}

**Date JS Constraint** {=ex:DateJSConstraint .sh:JSConstraint} uses JavaScript function to validate date strings: {sh:js """
// Check if value is a valid date string
const date = new Date(value);
return !isNaN(date.getTime());
"""}. 

```js {=ex:DateJSConstraint .sh:JSConstraint ?sh:JSConstraint sh:js}
// Check if value is a valid date string
const date = new Date(value);
return !isNaN(date.getTime());
```

---

## Demo {=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Event {=ex:ValidEvent .ex:Event ?member}

Event Date: [2024-12-25] {ex:eventDate ^^xsd:date}

#### Invalid Event 1 {=ex:InvalidEvent1 .ex:Event ?member}

Event Date: [not-a-date] {ex:eventDate}

#### Invalid Event 2 {=ex:InvalidEvent2 .ex:Event ?member}

Event Date: [2024-13-45] {ex:eventDate ^^xsd:date}

#### Invalid Event 3 {=ex:InvalidEvent3 .ex:Event ?member}

Event Date: [] {ex:eventDate}

---

[Demo] {=ex:demo} must produce exactly **3** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Event** - passes (valid date string)
2. **Invalid Event 1** - fails ("not-a-date" is not a valid date)
3. **Invalid Event 2** - fails ("2024-13-45" has invalid month/day)
4. **Invalid Event 3** - fails (empty string is not a valid date)

### 🔍 **Test Validation**

```bash
# This should show 3 violations for invalid dates
ig-cli validate ./constraints/js.md
```

---

## 📝 **MDLD Syntax Patterns**

**Recommended pattern for JavaScript constraints:**

1. Define the PropertyShape with a clear name
2. Describe the validation requirement in natural language  
3. Add the validation message
4. Specify the path
5. Reference the JSConstraint using sh:JSConstraint

**JavaScript Function Definition:**

```javascript
// The JavaScript function receives the value to validate
// Return true for valid values, false for invalid values
const date = new Date(value);
return !isNaN(date.getTime());
```

This approach enables complex validation logic that cannot be expressed with standard SHACL constraints, while maintaining clear error messages and testable validation results.
