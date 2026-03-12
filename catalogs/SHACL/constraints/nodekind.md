[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <cat:example/nodekind/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Node Kind {=sh:nodeKind .class:Constraint label}

> Expects a node to be of a specific kind (blank node, IRI, or literal) {comment}

<http://www.w3.org/ns/shacl#nodeKind> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

## Document Test Shape {=ex:DocumentTestShape .sh:NodeShape ?cat:hasShape label}

Validates all [Document] {+ex:Document ?sh:targetClass} entities to demonstrate node kind constraints: **Content Literal Rule** {+ex:#contentLiteral ?sh:property} and **Reference IRI Rule** {+ex:#referenceIRI ?sh:property}.

## Rules

**Document content must be a literal** {=ex:#contentLiteral .sh:PropertyShape sh:message} -  all [content] {+ex:content ?sh:path} must be a [Literal] {+sh:Literal ?sh:nodeKind}.

**Document reference must be an IRI** {=ex:#referenceIRI .sh:PropertyShape sh:message} - each [reference] {+ex:reference ?sh:path} must be an [IRI] {+sh:IRI ?sh:nodeKind}.

---

### 📋 Test Data {=ex:data .Container}

#### Valid Document {=ex:ValidDocument .ex:Documen ?member}

Content: [This is the document content] {ex:content}
Reference: <https://example.org/reference> {?ex:reference}

#### Invalid Document {=ex:InvalidDocument .ex:Document ?member}

Content: <https://example.org/invalid-content> {?ex:content}
Reference: [Invalid Reference String] {ex:reference}

---

[Demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Document** - passes (title is IRI, content is literal, reference is IRI)
2. **Invalid Document** - fails 2 times (title is string instead of IRI and content is IRI, but should be a literal)

Note: SHACL may report only one violation per focus node. The Invalid Document has multiple node kind violations but only the first is reported.

### 🔍 Test Validation

```bash
# This should show 1 violation for node kind constraint violation
ig-cli validate ./constraints/nodekind.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for node kind constraints:**

1. Use `sh:targetClass` for class-based targeting (diversity from container targeting)
2. Focus on IRI and Literal node kinds (MDLD doesn't produce blank nodes)
3. Use correct property syntax: IRIs without brackets, literals with brackets
4. Test both valid and invalid node kind combinations

This approach ensures proper node type validation while demonstrating different SHACL targeting techniques.

---

## 🏗️ **Node Kind Reference**

### IRI {=sh:IRI .sh:NodeKind label}

> Internationalized Resource Identifier - a global identifier for resources {?comment}

### Literal {=sh:Literal .sh:NodeKind label}

> Literal value such as strings, numbers, dates {?comment}

### BlankNodeOrIRI {=sh:BlankNodeOrIRI .sh:NodeKind label}

> Either a blank node or an IRI (but not a literal) {?comment}

**Note:** MDLD doesn't produce blank nodes, so focus on IRI and Literal constraints for practical demonstrations.
