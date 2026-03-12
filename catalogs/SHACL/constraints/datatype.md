[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <cat:example/datatype/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Data Type {=sh:datatype .class:Constraint label}

<http://www.w3.org/ns/shacl#datatype> {?cat:fullIRI}

> Expects a literal value to have certain datatype {comment}

---

## 🛡️ Self-Validation Demo {=ex:demo ?cat:hasDemo}

The **Product Test Shape** {=ex:ProductTestShape .sh:NodeShape ?cat:hasShape label} validates both [Valid Product] {+ex:ValidProduct ?sh:targetNode} and [Invalid Product] {+ex:InvalidProduct ?sh:targetNode} entities to demonstrate datatype constraints.

**Decimal Price Rule** {=ex:#priceDecimal .sh:PropertyShape ?sh:property} requires the [price] {+ex:price ?sh:path} property to be a [decimal] {+xsd:decimal ?sh:datatype} value for accurate calculations: *Product price must be a decimal number* {sh:message}

**Integer Quantity Rule** {=ex:#quantityInteger .sh:PropertyShape ?sh:property} requires the [quantity] {+ex:quantity ?sh:path} property to be an [integer] {+xsd:integer ?sh:datatype} value: *Product quantity must be an integer* {sh:message}

---

## Demo {=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Product {=ex:ValidProduct ?member}

Price: [29.99] {ex:price ^^xsd:decimal}
Quantity: [5] {ex:quantity ^^xsd:integer}

#### Invalid Product {=ex:InvalidProduct ?member}

Price: [29.99] {ex:price ^^xsd:string}
Quantity: [five] {ex:quantity ^^xsd:string}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Product** - passes (decimal price, integer quantity)
2. **Invalid Product** - fails (price is string instead of decimal)

### 🔍 **Test Validation**

```bash
# This should show 1 violation for incorrect datatype
ig-cli validate ./constraints/datatype.md
```

---

## 📝 **MDLD Syntax Patterns**

**Recommended pattern for datatype constraints:**

1. Define the PropertyShape with a clear name
2. Describe the requirement in natural language  
3. Add the validation message
4. Specify path and datatype in separate lines

This approach prevents annotation overload while maintaining readability.




