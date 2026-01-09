# MD-LD v0.2 Specification

**Markdown-Linked Data**

> A minimal, explicit semantic annotation layer for CommonMark Markdown, using `{...}` blocks to author RDF in a streaming-friendly and unobtrusive way.

---

## 1. What is MD-LD?

**MD-LD is plain CommonMark Markdown with optional semantic annotations.**

* Markdown writes **content**
* `{...}` blocks attach **explicit meaning**
* Removing `{...}` yields valid, readable Markdown
* No meaning is inferred unless you write it explicitly

MD-LD is designed for:

* Researchers
* Technical writers
* Knowledge engineers
* Anyone who wants structured data **without learning RDF syntax**

---

## 2. Core design principles

1. **No implicit semantics**

   * No auto labels
   * No inferred actions
   * No URL harvesting
   * No structure-based guessing

2. **Explicit intent**

   * Every RDF triple originates from `{...}`
   * `{...}` always means “emit semantics”

3. **Streaming-friendly**

   * Single-pass parsing
   * No backtracking
   * Emit triples as `{...}` is encountered

4. **CommonMark compatibility**

   * MD-LD does not reinterpret Markdown syntax
   * Rendering is unchanged

5. **Small, closed syntax**

   * Few rules
   * One meaning per construct

---

## 3. The mental model (non-specialist friendly)

Think of MD-LD as answering three questions:

1. **What is this thing?** → subject (`{=IRI}`)
2. **What kind of thing is it?** → type (`.Class`)
3. **What facts relate to it?** → properties (`{property}`)

Everything else is composition.

---

## 4. Semantic blocks `{...}`

### General rules

* `{...}` attaches to the **nearest preceding Markdown element**
* `{...}` is processed **when encountered**
* `{...}` may appear:

  * after headings
  * after inline spans or links
  * after block elements
  * before lists (list-scoped)

---

## 5. Prefixes and vocabulary

### Syntax

```md
[@vocab]{: http://schema.org/}
[ex]{: http://example.org/}
[wd]{: https://www.wikidata.org/entity/}
```

### Rules

* Prefixes apply **forward only**
* No implicit prefixes
* Bare property names require `@vocab`
* Prefix declarations emit no RDF

---

## 6. Subjects

### 6.1 Declaring a subject

**Purpose:** Assign an identity to something.

#### Syntax

```md
{=IRI}
```

#### Rules

* Sets the *current subject*
* Emits no properties automatically
* Does not create labels or types

#### Example

```md
# Apollo 11 {=wd:Q43653}
```

```turtle
wd:Q43653 a rdf:Resource .
```

---

### 6.2 Subject context

* Subject context exists **only after `{=...}`**
* Context persists forward
* Context changes only on a new `{=...}`
* `{property}` without a current subject is invalid

---

## 7. Types

### Syntax

```md
{.ClassName}
```

### Rules

* Assigns `rdf:type`
* May be combined with subject or property
* Resolves via `@vocab` or prefix

### Example

```md
# Apollo 11 {=wd:Q43653 .SpaceMission}
```

```turtle
wd:Q43653 a schema:SpaceMission .
```

---

## 8. Properties

### 8.1 Literal properties

#### Syntax

```md
{property}
```

#### Rule

* Value = visible text of annotated element

#### Example

```md
Launch year: 1969 {startDate}
```

```turtle
<current-subject> schema:startDate "1969" .
```

---

### 8.2 Object properties

#### Rule

An object relationship **requires an explicit subject reference**.

#### Example

```md
[Neil Armstrong](=wd:Q1615) {astronaut}
```

```turtle
<current-subject> schema:astronaut wd:Q1615 .
```

---

### 8.3 Reverse properties

#### Syntax

```md
{^property}
```

#### Example

```md
[Apollo Program](=wd:Q495307) {^hasPart}
```

```turtle
wd:Q495307 schema:hasPart <current-subject> .
```

---

## 9. Lists with list-level semantics (kept)

### Purpose

Apply the **same relationship and type** to all list items cleanly.

### Syntax

```md
Property label: {property .Class}
- Item A {=IRI}
- Item B {=IRI}
```

### Rules

* `{...}` before the list defines:

  * predicate
  * optional type
* Each list item:

  * must declare its own subject
  * is processed independently
* Streaming-safe (property known before items)

---

### Example: Recipe ingredients

```md
## Recipe 1 {=ex:recipe1}

Ingredients: {hasPart .Ingredient}
- Flour {=ex:flour}
- Water {=ex:water}
```

```turtle
ex:recipe1 schema:hasPart ex:flour , ex:water .

ex:flour a schema:Ingredient .
ex:water a schema:Ingredient .
```

---

## 10. Block-level properties

### Rule

A `{property}` at the end of a block assigns the **entire block text** as the value.

### Example

```md
Apollo 11 was the first crewed lunar landing mission. {description}
```

```turtle
<current-subject> schema:description "Apollo 11 was the first crewed lunar landing mission." .
```

---

## 11. Datatypes

MD-LD supports explicit RDF datatypes and language tags.
Datatypes and language tags are never inferred.
If not explicitly provided, literals are plain strings.

`{property ^^datatype}`

## 12. Language 

`{property @lang}`

```md
Berlin {name @en}
Берлин {name @ru}
```

```turtle
<current-subject> schema:name "Berlin"@en , "Берлин"@ru .
```



## 13. Code blocks

### Rule

* Code blocks may declare a subject
* Code content is not interpreted
* Semantics apply only via `{...}`

### Example

````md
```sparql {=ex:query1 .SoftwareSourceCode}
SELECT * WHERE { ?s ?p ?o }
````

````

```turtle
ex:query1 a schema:SoftwareSourceCode ;
  schema:text "SELECT * WHERE { ?s ?p ?o }" .
````

---

## 14. Composing complex graphs (by combination)

### Example: Research project

```md
# Project Alpha {=ex:project-alpha .ResearchProject}

Lead: [Dr. Smith](=ex:smith) {principalInvestigator .Person}

Publications: {hasPart .ScholarlyArticle}
- Paper A {=ex:paper-a}
- Paper B {=ex:paper-b}

## Paper A {=ex:paper-a}
Title: Quantum Effects {name}

## Paper B {=ex:paper-b}
Title: Relativity Review {name}
```

```turtle
ex:project-alpha a schema:ResearchProject ;
  schema:principalInvestigator ex:smith ;
  schema:hasPart ex:paper-a , ex:paper-b .

ex:smith a schema:Person .

ex:paper-a a schema:ScholarlyArticle ;
  schema:name "Quantum Effects" .

ex:paper-b a schema:ScholarlyArticle ;
  schema:name "Relativity Review" .
```

No new rules were introduced—only composition.

---

## 15. Explicit exclusions (v0.2)

The following are **intentionally not part of MD-LD v0.2**:

* ❌ Automatic `rdfs:label`
* ❌ Task list semantics
* ❌ Bare URL extraction
* ❌ `key=value` attributes

* ❌ Structural inference

These may appear in **future profiles**, not core.

---

## 16. Streaming and implementation guarantees

An MD-LD processor:

* Must operate line-by-line
* Must emit RDF when `{...}` is encountered
* Must not inspect future content
* Must not infer missing semantics

---

## 17. Summary

MD-LD v0.2 provides:

* A **clean semantic layer** over Markdown
* **Explicit intent only**
* **No heuristics**
* **No surprises**
* **Composable knowledge graphs**
* **Production-grade streaming behavior**

> If you can read Markdown, you can author linked data.

