[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Unique Languages Constraint {=sh:uniqueLang .class:UniqueLanguageConstraint label}

> Ensures that language tags of string literals are unique within a property. Essential for multilingual content management, preventing duplicate language entries, and maintaining clean internationalization data. {comment}

<http://www.w3.org/ns/shacl#uniqueLang> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates unique language constraint using multilingual document titles.

### Multilingual Document Demo

The **Unique Language Example Shape** {=ex:UniqueLangExampleShape .sh:NodeShape ?cat:hasShape label} targets [ValidNode] {+ex:ValidNode ?sh:targetNode} and [InvalidNode] {+ex:InvalidNode ?sh:targetNode} to validate [title] {+ex:title ?sh:path} has [true] {sh:uniqueLang}: **Title language tags must be unique** {sh:message}.

{=ex:UniqueLangExampleShape}

**Title Property** {=ex:TitleProperty .sh:PropertyShape ?sh:property} ensures [title] {+ex:title ?sh:path} values have [true] {sh:uniqueLang}: **Each language tag must appear only once** {sh:message}.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Document {=ex:ValidNode}

Document with unique language tags.

Title: [Hello World] {ex:title @en}
Title: [Bonjour Monde] {ex:title @fr}

#### Invalid Document {=ex:InvalidNode}

Document with duplicate language tag (violates unique language constraint).

Title: [Hello World] {ex:title @en}
Title: [Hola Mundo] {ex:title @en}  # Duplicate "en" language tag

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Document** - passes (unique "en" and "fr" language tags ✓)
2. **Invalid Document** - fails once (duplicate "en" language tag ✗)

### 🔍 Test Validation

```bash
# This should show 1 violation - InvalidNode has duplicate "en" language tag
ig-cli validate ./constraints/uniqueLang.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Multilingual content** - ensure each language appears only once per property
- **Internationalization** - prevent duplicate translations in same property
- **Content management** - maintain clean language-specific metadata
- **Document localization** - enforce proper language tag distribution

**Key behavior:**
- **Language tag uniqueness** - each language tag appears at most once per property
- **String literal focus** - applies only to language-tagged string literals
- **Violation per duplicate** - each repeated language tag generates a violation
- **Case-sensitive comparison** - language tags are compared case-sensitively

**Language tag syntax:**
- **Standard format** - uses RFC 4646 language tags (en, fr, de, etc.)
- **Automatic detection** - works with `@en`, `@en-US`, `@fr-FR` formats
- **Integration ready** - combines with other string constraints seamlessly
