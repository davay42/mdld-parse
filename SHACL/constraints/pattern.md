[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Pattern {=sh:pattern .class:Constraint label}

> Validates string values against a regular expression pattern {comment}

<http://www.w3.org/ns/shacl#pattern> {?cat:fullIRI}

---

## 🎯 **What it does**

Ensures string values match a specified **regular expression**:
- **Email formats:** `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Phone numbers:** `^\+?[\d\s-()]+$`
- **URLs:** `^https?://[^\s]+$`
- **Custom formats:** Any regex pattern

---

## ✅ **Valid Example**

```md
### Person Shape {=ex:PersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Email format {=ex:PersonShape-emailPattern .sh:PropertyShape ?sh:property}
Path: [email] {+ex:email ?sh:path}
Must match email pattern: ["^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"] {sh:pattern}.
```

---

## ❌ **Invalid Example**

```md
### Invalid Person Shape {=ex:InvalidPersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Email format {=ex:InvalidPersonShape-emailPattern .sh:PropertyShape ?sh:property}
Path: [email] {+ex:email ?sh:path}
Must match email pattern: ["^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"] {sh:pattern}.

# This will fail for "invalid-email" or "not-an-email"
```

---

## 🔍 **Validation**

```bash
ig-cli validate person-data.ttl --shapes person-shape.md
```

---

## 📝 **MDLD Syntax Pattern**

```md
Must match pattern: ["regex-pattern"] {sh:pattern}.
```

---

## 🤝 **Often Used With**

- **`sh:flags`** - for regex flags (case-insensitive, multiline)
- **`sh:datatype`** - to ensure string values first
- **`sh:minLength`/`sh:maxLength`** - for length constraints

---

## 🎯 **Common Patterns**

```md
# Case-insensitive email
Must match email pattern: ["^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$"] {sh:pattern} with [i] {sh:flags}.

# Phone number with optional + and spaces
Must match phone pattern: ["^\+?[\d\s-()]+$"] {sh:pattern}.
```
