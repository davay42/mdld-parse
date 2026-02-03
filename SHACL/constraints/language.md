[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/language/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Language In {=sh:languageIn .class:StringConstraint label}

> Constrains string literals to have language tags from a specified list using RDF lists. Essential for multilingual content validation and internationalization support. {comment}

<http://www.w3.org/ns/shacl#languageIn> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates language constraint using multilingual document scenarios.

### Multilingual Document Demo

The **Multilingual Document Shape** {=ex:MultilingualDocumentShape .sh:NodeShape ?cat:hasShape label} targets all [documents] {+ex:Document ?sh:targetClass} to validate language tags.

**Title Language Rule** {=ex:#titleLanguage .sh:PropertyShape ?sh:property}

> Title must be in English or French: **Title language must be in allowed list** {sh:message}

This property defines rules for the [title] {+ex:title ?sh:path} property.

Title language tags must be in the allowed list using verbose RDF list syntax.

We start from the [head] {=ex:l1 ?sh:languageIn .rdf:List} of the list, followed by first literal value [en] {rdf:first}, then goes the next list [node] {=ex:l2 ?rdf:rest} with another language as literal in an inline value carrier [fr] {rdf:first} followed by a closing [nil] {+rdf:nil ?rdf:rest} and as subject reset. {=}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### English Document {=ex:EnglishDocument .ex:Document}

A valid document with English title.

Title: [Hello World] {ex:title @en}

#### French Document {=ex:FrenchDocument .ex:Document}

A valid document with French title.

Title: [Bonjour le monde] {ex:title @fr}

#### German Document {=ex:GermanDocument .ex:Document}

An invalid document with German title (not in allowed list).

Title: [Hallo Welt] {ex:title @de}

#### No Language Document {=ex:NoLanguageDocument .ex:Document}

A document without language tag (not validated by sh:languageIn).

Title: [Untitled] {ex:title}

---

{=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **English Document** - passes (title: @en ✓)
2. **French Document** - passes (title: @fr ✓)
3. **German Document** - fails once (title: @de ✗)
4. **No Language Document** - fails once (no language tag)

Note: `sh:languageIn` only validates language tags if they exist. Use `sh:minCount` to check for required properties.

### 🔍 Test Validation

```bash
# This should show 2 violation - German title not in allowed list
ig-cli validate ./constraints/language.md
```

---

**Use cases:**
- **Multilingual content** - restrict documents to specific languages
- **Regional compliance** - ensure content meets language requirements
- **Content localization** - validate language-specific versions
- **International standards** - enforce language tag standards
- **Translation workflows** - control which languages are allowed

**Key advantages:**
- ✅ **Language validation** - ensures content uses approved languages
- ✅ **Internationalization support** - essential for global applications
- ✅ **Compliance enforcement** - meets regional language requirements
- ✅ **Content quality** - maintains language consistency
- ✅ **Workflow control** - manages translation processes

---