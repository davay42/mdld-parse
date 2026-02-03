[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Min Count {=sh:minCount .class:Constraint label}

> Specifies the minimum number of values a property must have {comment}

<http://www.w3.org/ns/shacl#minCount> {?cat:fullIRI}

---

## 🎯 **What it does**

Ensures a property has **at least** the specified number of values:
- **0 or more:** Optional property
- **1 or more:** Required property  
- **2 or more:** Multi-valued requirement

---

## ✅ **Valid Example**

```md
### Person Shape {=ex:PersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Name is required {=ex:PersonShape-nameMin .sh:PropertyShape ?sh:property}
Path: [name] {+ex:name ?sh:path}
Must have at least [1] {sh:minCount ^^xsd:integer} value.
```

---

## ❌ **Invalid Example**

```md
### Invalid Person Shape {=ex:InvalidPersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Name is required {=ex:InvalidPersonShape-nameMin .sh:PropertyShape ?sh:property}
Path: [name] {+ex:name ?sh:path}
Must have at least [1] {sh:minCount ^^xsd:integer} value.

# This will fail if person has no name property
```

---

## 🔍 **Validation**

```bash
ig-cli validate person-data.ttl --shapes person-shape.md
```

---

## 📝 **MDLD Syntax Pattern**

```md
Must have at least [N] {sh:minCount ^^xsd:integer} value(s).
```

---

## 🤝 **Often Used With**

- **`sh:maxCount`** - to create exact ranges (e.g., 1-5 emails)
- **`sh:datatype`** - to specify value type
- **`sh:nodeKind`** - to specify node type
