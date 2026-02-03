[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Node Kind {=sh:nodeKind .class:Constraint label}

> Expects a node to be of a specific kind (blank node, IRI, or literal) {comment}

<http://www.w3.org/ns/shacl#nodeKind> {?cat:fullIRI}

---

## 🎯 **What it does**

Validates whether a node is a:
- **Blank node** (`sh:BlankNode`)
- **IRI** (`sh:IRI`) 
- **Literal** (`sh:Literal`)
- **Blank node or IRI** (`sh:BlankNodeOrIRI`)

---

## ✅ **Valid Example**

```md
### Person Shape {=ex:PersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Name must be IRI {=ex:PersonShape-nameKind .sh:PropertyShape ?sh:property}
Path: [name] {+ex:name ?sh:path}
Must be an [IRI] {+sh:IRI ?sh:nodeKind}.
```

---

## ❌ **Invalid Example**

```md
### Invalid Person Shape {=ex:InvalidPersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Name must be IRI {=ex:InvalidPersonShape-nameKind .sh:PropertyShape ?sh:property}
Path: [name] {+ex:name ?sh:path}
Must be an [IRI] {+sh:IRI ?sh:nodeKind}.

# This will fail if name is a literal value like "John Doe"
```

---

## 🔍 **Validation**

```bash
ig-cli validate person-data.ttl --shapes person-shape.md
```

---

## 📝 **MDLD Syntax Pattern**

```md
Must be a [node kind] {+sh:BlankNode|sh:IRI|sh:Literal|sh:BlankNodeOrIRI ?sh:nodeKind}.
```
