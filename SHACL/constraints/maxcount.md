[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Max Count {=sh:maxCount .class:Constraint label}

> Specifies the maximum number of values a property can have {comment}

<http://www.w3.org/ns/shacl#maxCount> {?cat:fullIRI}

---

## 🎯 **What it does**

Ensures a property has **at most** the specified number of values:
- **0:** Property must not exist
- **1:** Single-valued property
- **N:** Limited multi-valued property

---

## ✅ **Valid Example**

```md
### Person Shape {=ex:PersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Single email {=ex:PersonShape-emailMax .sh:PropertyShape ?sh:property}
Path: [email] {+ex:email ?sh:path}
Must have at most [1] {sh:maxCount ^^xsd:integer} value.
```

---

## ❌ **Invalid Example**

```md
### Invalid Person Shape {=ex:InvalidPersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Single email {=ex:InvalidPersonShape-emailMax .sh:PropertyShape ?sh:property}
Path: [email] {+ex:email ?sh:path}
Must have at most [1] {sh:maxCount ^^xsd:integer} value.

# This will fail if person has multiple email addresses
```

---

## 🔍 **Validation**

```bash
ig-cli validate person-data.ttl --shapes person-shape.md
```

---

## 📝 **MDLD Syntax Pattern**

```md
Must have at most [N] {sh:maxCount ^^xsd:integer} value(s).
```

---

## 🤝 **Often Used With**

- **`sh:minCount`** - to create exact ranges (e.g., exactly 1 phone)
- **`sh:datatype`** - to specify value type
- **`sh:nodeKind`** - to specify node type

---

## 🎯 **Common Patterns**

```md
# Exactly one value
Must have at least [1] {sh:minCount ^^xsd:integer} and at most [1] {sh:maxCount ^^xsd:integer} value.

# Optional single value  
Must have at most [1] {sh:maxCount ^^xsd:integer} value.
```
