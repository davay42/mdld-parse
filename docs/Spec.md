# MD-LD v0.3 — Core Specification (Minimal)

**Markdown-Linked Data**

A deterministic, streaming-friendly semantic annotation layer for CommonMark Markdown that emits RDF quads **only** from explicit `{...}` annotations.

---

## 1. Scope and guarantees

1. MD-LD is **CommonMark-preserving**. Removing `{...}` yields valid Markdown.
2. **No implicit semantics** exist.
3. **Every emitted quad originates from `{...}`**.
4. Parsing MUST be implementable as a **single-pass streaming algorithm**.
5. **No blank nodes** are generated.
6. **No guessing, inference, or structural heuristics** are permitted.
7. Every quad MUST be traceable back to a concrete source span.

---

## 2. Graph model (normative)

MD-LD emits a directed labeled multigraph:

```
G = (V, E)
E ⊆ V × P × V
```

Where:

* `V = IRIs ∪ Literals`
* `P = IRIs`
* Literals are terminal (never subjects)

---

## 3. In-scope nodes at parse time

At any `{...}` annotation, the parser may have:

* **S** — current subject (IRI, optional)
* **O** — object resource (IRI, optional, from link/image or `{=IRI}`)
* **L** — literal value (string + optional datatype or language)

---

## 4. Value carriers (normative)

A `{...}` block MAY attach to exactly one **value carrier**.

Valid value carriers:

### Inline

* `[text] {...}` - inline spans
* `*text* {...}`, `_text_ {...}` - emphasis
* `**text** {...}`, `__text__ {...}` - strong
* `` `text` {...}`` - code

### Block-level

* `# Heading {...}` - headings
* `- item {...}` - list items
* `> quote {...}` - blockquotes
* ````lang {...}\n...\n```` - code blocks

### Links / embeds

* `http://example.com {...}` - bare links
* `[label](URL) {...}` - links
* `![alt](URL) {...}` - images

Everything else is **not** a value carrier.

---

## 5. Semantic block `{...}`

### 5.1 Attachment rule

A `{...}` block MUST attach to the **nearest preceding value carrier**
OR appear on its own line to apply to the **current subject** and/or the immediately following list.

If attachment is ambiguous → **no quads emitted**.

---

## 6. Subjects

#### 6.1.1 Subject Declaration Form

```
{=IRI}
{=#fragment}
```

Sets the current subject **S** to the expanded IRI or creates a fragment relative to the current subject base. Emits no quads
* Overrides previous subject
* Subject context persists forward

#### 6.1.2 IRI Form

```
{=IRI}
```

Expands to a full IRI using context prefixes and vocabulary.

Example:

```md
# Apollo 11 {=wd:Q43653}
```

→ no output

#### 6.1.2 Fragment Form

```
{=#fragment}
```

Creates a fragment IRI relative to the current subject:

* If current subject exists: `currentSubjectBase + '#' + fragment`
* If no current subject: **no subject is set** (invalid)
* Replaces any existing fragment in current subject
* Base IRI is determined by splitting current subject on first `#`
* Multiple fragment declarations replace the previous fragment.

Example:

```md
# Document {=ex:document}
## Section 1 {=#section1}
[Section content] {name}

## Section 2 {=#section2}
[More content] {name}
```

```turtle
ex:document#section1 schema:name "Section content" .
ex:document#section2 schema:name "More content" .
```

#### 6.1.3 Object IRI Form

```
{+iri}
```

{+IRI} declares an object IRI for use by subsequent object predicates (?p, !p) without changing the current subject context. This enables temporary object declarations for complex relationships while maintaining the current subject for continued annotation.

#### 6.1.4 Soft Fragment Form

```
{+#fragment}
```

{+#fragment} declares a soft fragment IRI relative to the current subject base, combining the locality of soft IRIs with the convenience of fragment resolution.

**Use cases:**
- **Object property declarations**: `[Related Item] {+ex:related ?schema:isRelatedTo}` creates `currentSubject → isRelatedTo → ex:related`
- **Reverse relationships**: `[Parent] {+ex:parent !schema:hasPart}` creates `ex:parent → hasPart → currentSubject`
- **Soft fragment declarations**: `[Section] {+#section1 name ?hasPart}` creates `currentSubject → hasPart → currentSubject#section1`
- **Multi-predicate annotations**: `[Text] {+ex:entity name ?schema:describes .Thing}` creates `ex:entity name "Text"`, `currentSubject → describes → ex:entity`, and `ex:entity rdf:type Thing`

The soft object IRI (regular or fragment) is local to the current annotation block and does not persist across subsequent annotations, ensuring proper scope isolation.


---

## 7. Types

```
.Class
```

Emits:

```
S rdf:type schema:Class
```

Example:

```md
# Apollo 11 {=wd:Q43653 .SpaceMission}
```

```turtle
wd:Q43653 a schema:SpaceMission .
```

---

## 8. Predicate routing (core rule)

Predicate syntax determines **graph direction and node selection**.

### 8.1 Predicate forms

| Form  | Emits quad |
| ----- | ---------- |
| `p`   | `S —p→ L`  |
| `?p`  | `S —p→ O`  |
| `^p`  | `L —p→ S`  |
| `!p`  | `O —p→ S`  |

All four forms are **normative and required**.

---

### 8.2 Predicate emission rules

A predicate emits a quad if:

* all referenced nodes exist
* subject and object roles are valid

Otherwise → emit nothing.

---

## 9. Literals

### 9.1 Extraction

Literal `L` is extracted **only** from the attached value carrier.

Plain text outside a value carrier MUST NOT be used.

---

### 9.2 Datatypes and language

```
^^datatypeIRI
@lang
```

Rules:

* Apply only to `L`
* Mutually exclusive
* Never inferred

Example:

```md
[1969] {startDate ^^xsd:gYear}
```

```turtle
S schema:startDate "1969"^^xsd:gYear .
```

---

## 10. Object resources

`O` is available only when explicitly present:

* link URL
* image URL
* `{=IRI}`

Example:

```md
## References {=ex:references}

[W3C RDF](https://www.w3.org/RDF) {?dct:references name}
```

```turtle
ex:references dct:references <https://www.w3.org/RDF> .
<https://www.w3.org/RDF> schema:name "W3C RDF" .
```

---

## 11. Lists (normative)

### 11.1 Scope rule

A `{...}` block immediately preceding a list applies to **all list items** until list end.

Ordered and unordered lists are semantically identical.

---

### 11.2 Requirements

* Each list item MUST declare its own subject to emit quads
* No implicit item subjects
* No blank nodes

---

### Example

```md
Ingredients: {?hasPart .Ingredient}

- Flour {=ex:flour name}
- Water {=ex:water name}
```

```turtle
S schema:hasPart ex:flour, ex:water .
ex:flour a ex:Ingredient ; schema:name "Flour" .
ex:water a ex:Ingredient ; schema:name "Water" .
```

---

## 12. Reverse relations

Reverse predicates invert direction **only**, never semantics.

Example:

```md
Used in: {!hasPart}
- Bread {=ex:bread}
```

```turtle
ex:bread schema:hasPart S .
```

---

## 13. Code blocks

If `{...}` appears on the opening fence, the code block is a value carrier.

Example: (note that `` is only two - to show mdld in md )

```md

``js {=ex:code .SoftwareSourceCode code}
console.log("hi")
``

Run this *JavaScript* {language} code in you browser console  to say 'hi'. 

```

```turtle 
ex:code a schema:SoftwareSourceCode ;
  schema:text "console.log(\"hi\")" ;
  schema:language "JavaScript" .
```

---

## 14. Context: initial, prefix, vocabulary

MD-LD processors MUST provide this initial context by default:

```json
{
    "@vocab": "http://schema.org/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#", 
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "schema": "http://schema.org/"
}
```

It is used to expand CURIEs and vocabulary terms.

`[prefix] {: IRI}`

Declares a prefix for CURIE expansion within the current document scope.

`[@vocab] {: IRI}`

Sets the default vocabulary for un-prefixed terms and predicate names.


### Scope

- Context declarations apply forward from declaration point
- Later declarations override earlier ones for subsequent parsing
- Initial context cannot be unset, only overridden
- Context is resolved during single-pass streaming parsing
- No backtracking or look-ahead required


## 15. Forbidden constructs (normative)

* Implicit labels
* Structural inference
* Auto-subjects
* Blank nodes
* key=value syntax
* Predicate guessing
* Backtracking parses
* CURIE in Markdown links

---

## 15. Conformance

An MD-LD processor is conformant if:

1. All emitted quads follow §8 routing rules
2. All quads originate from `{...}` blocks
3. Parsing is single-pass and deterministic
4. Round-trip MD → RDF → MD preserves quads and origins

---
