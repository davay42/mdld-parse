[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Class {=sh:class .class:Constraint label}

> Expects each value to be an instance of a specific class (RDF type) {comment}

<http://www.w3.org/ns/shacl#class> {?cat:fullIRI}

---

## 🎯 **What it does**

Ensures property values are **instances of** a specified RDF class:
- **Type checking:** Validates `rdf:type` relationships
- **Object validation:** Ensures values are proper instances
- **Schema enforcement:** Links to ontology classes

---

## ✅ **Valid Example**

```md
### Person Shape {=ex:PersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Manager must be Person {=ex:PersonShape-managerClass .sh:PropertyShape ?sh:property}
Path: [manager] {+ex:manager ?sh:path}
Must be instance of [Person] {+ex:Person ?sh:class}.
```

---

## ❌ **Invalid Example**

```md
### Invalid Person Shape {=ex:InvalidPersonShape .sh:NodeShape label}
Target all [Person] {+ex:Person ?sh:targetClass} entities.

#### Manager must be Person {=ex:InvalidPersonShape-managerClass .sh:PropertyShape ?sh:property}
Path: [manager] {+ex:manager ?sh:path}
Must be instance of [Person] {+ex:Person ?sh:class}.

# This will fail if manager is not typed as ex:Person
```

---

## 🔍 **Validation**

```bash
ig-cli validate person-data.ttl --shapes person-shape.md
```

---

## 📝 **MDLD Syntax Pattern**

```md
Must be instance of [ClassName] {+ex:ClassName ?sh:class}.
```

---

## 🤝 **Often Used With**

- **`sh:nodeKind`** - to ensure values are IRIs first
- **`sh:minCount`** - to require at least one instance
- **`sh:maxCount`** - to limit number of instances

---

## 🎯 **Common Patterns**

```md
# Required single instance
Must be instance of [Address] {+ex:Address ?sh:class} with at least [1] {sh:minCount ^^xsd:integer} value.

# Optional multiple instances
Must be instance of [Skill] {+ex:Skill ?sh:class} with at most [10] {sh:maxCount ^^xsd:integer} values.

# Combined with node kind
Must be an [IRI] {+sh:IRI ?sh:nodeKind} and instance of [Organization] {+ex:Organization ?sh:class}.
```
