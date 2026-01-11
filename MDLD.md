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
   * No blank nodes or fragment identifiers are generated
   * Parsing is deterministic and round-tripable

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

#### Attachment rule

A {...} annotation MUST attach to the nearest preceding content carrier.
The textual content of that carrier is the literal value unless an explicit IRI is provided. Emphasis (*text*), strong emphasis (**text**), and inline code (`text`) MAY serve as content carriers for {...}.

A {...} block MUST appear immediately after:

- a Markdown inline span (e.g. [ ], emphasis, inline code), or
- on its own line, optionally followed by a list.

{...} MUST NOT appear inside Markdown syntax constructs (such as link destinations, emphasis markers, or code fences).

If a {...} block cannot be deterministically attached using these rules, it is invalid.

---

## 5. Prefixes and vocabulary

MDLD assumes initial context similar to RDFa. We use Schema.org as default vocabulary.

```js
{
  '@vocab': 'http://schema.org/'
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'
  'xsd': 'http://www.w3.org/2001/XMLSchema#'
  'dct': 'http://purl.org/dc/terms/'
  'foaf': 'http://xmlns.com/foaf/0.1/'
}
```

It is extensible via prefix declarations. Such declarations are not emitted as RDF. They are parsed and applied only forward to following statements.

### Syntax

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[wd] {: https://www.wikidata.org/entity/}
```

### Rules

* Prefixes apply **forward only**
* Prefix declarations emit no RDF
* Prefix blocks do not create subjects or types

---

## 6. Subjects

A subject exists only if explicitly declared with {=IRI}.

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
No RDF output.
```

---

### 6.2 Subject context

* Subject context exists **only after `{=...}`**
* Context persists forward
* Context changes only on a new `{=...}`
* `{property}` without a current subject is invalid

Subject context persists until overridden or document end.

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

A literal value MUST be provided by an explicit Markdown inline span ([...], emphasis, bold, or inline code) immediately preceding the {...} block, OR explicitly inside the {...} block as a quoted literal. If both are present, the quoted literal MUST be used and the span ignored. When multiple predicates appear in a {...} block and a single value carrier exists, the same literal value is applied to all predicates.

Plain text outside a span MUST NOT be used as a literal value source. Property without a value carrier is invalid and doesn't emit any RDF.

#### Example

```md
### Apollo 11 {=wd:Q43653 .Project}

Launch year: [1969] {startDate ^^xsd:gYear}
Start date: **1969-07-20** {startDate ^^xsd:date}
Finish date: `1979-07-20` {endDate ^^xsd:date}
Place: [The Moon] {location "Moon" @en}

```

```turtle
wd:Q43653 a schema:Project ;
          schema:startDate "1969"^^xsd:gYear ;
          schema:startDate "1969-07-20"^^xsd:date ;
          schema:endDate "1979-07-20"^^xsd:date;
          schema:location "Moon"@en .
```


---

### 8.2 Object properties

#### Rule

An object relationship requires:

- a current subject, and
- an explicit object IRI (e.g. via a link or {=IRI})

#### Example

```md
## Apollo 11 {=wd:Q43653}

[Neil Armstrong](https://www.wikidata.org/entity/Q1615) {astronaut}
```

```turtle
wd:Q43653 schema:astronaut wd:Q1615 .
```

---

### 8.3 Reverse properties

`{^property}` emits a triple where:

- the current subject becomes the object
- the nearest previously established subject in scope becomes the subject

No predicate rewriting occurs.

#### Syntax

```md
{^property}
```

#### Example

```md
Rocket {=ex:rocket .schema:Rocket} is part of [Apollo Program] {=wd:Q495307 ^schema:hasPart schema:name}
```

```turtle
ex:rocket a schema:Rocket .

wd:Q495307 schema:hasPart ex:rocket ;
           schema:name "Apollo Program" .
```

---

## 9. Lists with list-level semantics

### Purpose

Apply the **same relationship and type** to all list items cleanly, supporting both literal values and object references.

### Syntax

#### Literal List (default)

```md
Property label: {property}
- Literal value 1
- Literal value 2
```

#### Object List

```md
Property label: {property .Class}
- Label 1 {=iri1}
- Label 2 {=iri2}
```

### Rules

* The `{...}` block before the list defines:
  * Required: The predicate (property IRI)
  * Optional: A class (prefixed with `.`) that will be applied to each list item

* For literal lists:
  * Each list item is treated as a literal value
  * No explicit subject declaration is needed for list items
  * Literal values are trimmed of whitespace

* If a class is defined, we parse an object list:
  * Each list item must declare a subject using `{=iri}`
  * The optional class from the list header is applied to each item
  * The list item text before `{=iri}` is ignored for RDF generation

* Both list types are streaming-safe (property is known before processing items)

---

### Example 1: Literal list

```md
## Recipe 1 {=ex:recipe1}

Ingredients: {hasPart}
- Flour 
- Water 
- Salt (to taste)
```

```turtle
ex:recipe1 schema:hasPart "Flour" , "Water" , "Salt (to taste)" .
```

---

### Example 2: Object list with types

```md
## Recipe 1 {=ex:recipe1}

Ingredients: {hasPart .Ingredient}
- Organic flour {=ex:flour}
- Spring water {=ex:water}
```

```turtle
ex:recipe1 schema:hasPart ex:flour , ex:water .

ex:flour a schema:Ingredient .
ex:water a schema:Ingredient .
```

---


## 10. Datatypes

MD-LD supports explicit RDF datatypes and language tags.
Datatypes and language tags are never inferred.
If not explicitly provided, literals are plain strings.

`{property ^^datatype}`

## 11. Language 

`{property @lang}`

```md
## Berlin {=wd:Q43653}

Berlin {name @en}
Берлин {name @ru}
```

```turtle
wd:Q43653 schema:name "Berlin"@en , "Берлин"@ru .
```

You can't use `@lang` with `^^datatype` on the same statement.

## 12. Code blocks

### Rule

Fenced code blocks may act as value carriers when `{}` is placed immediately after the opening fence.

### Example

````md
```sparql {=ex:query1 .SoftwareSourceCode text}
SELECT * WHERE { ?s ?p ?o }
````

````

```turtle
ex:query1 a schema:SoftwareSourceCode ; 
            schema:text "SELECT * WHERE { ?s ?p ?o }" .
````

---

## 13. Composing complex graphs (by combination)

### Example: Research project

```md
# Project Alpha {=ex:project-alpha .ResearchProject}

Lead: [Dr. Smith] {=ex:smith principalInvestigator .Person}

Publications: {hasPart .ScholarlyArticle}
- Paper A {=ex:paper-a}
- Paper B {=ex:paper-b}

## Paper A {=ex:paper-a}
Title: **Quantum Effects** {name}
[This paper is about quantum effects.] {description}

## Paper B {=ex:paper-b}
Title: **Relativity Review** {name}
```

```turtle
ex:project-alpha a schema:ResearchProject ;
  schema:principalInvestigator ex:smith ;
  schema:hasPart ex:paper-a , ex:paper-b .

ex:smith a schema:Person .

ex:paper-a a schema:ScholarlyArticle ;
  schema:name "Quantum Effects" ;
  schema:description "This paper is about quantum effects." .

ex:paper-b a schema:ScholarlyArticle ;
  schema:name "Relativity Review" .
```

---

## 14. Summary

MD-LD v0.2 provides:

* A **clean semantic layer** over Markdown
* **Explicit intent only**
* **No heuristics**
* **No surprises**
* **Composable knowledge graphs**
* **Production-grade streaming behavior**

> If you can read Markdown, you can author linked data.

