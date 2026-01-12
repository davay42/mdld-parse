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

  A conforming MD-LD parser MUST be implementable as a single-pass streaming parser with bounded memory, proportional only to the current subject context and open blocks.    

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

## 3. The mental model

Think of MD-LD as answering three questions:

1. **What is this thing?** → subject (`{=IRI}`)
2. **What kind of thing is it?** → type (`.Class`)
3. **What facts relate to it?** → properties (`{property}`)

Everything else is composition. 

---

## 4. Value carriers

A `{}` block MAY extract a literal value from exactly one of:

1. Markdown inline spans (text content can be catched by `property` predicate):

   * span `[text]`
   * emphasis `*text*`, '_text_'
   * strong `**text**`, '__text__'
   * inline code `` `text` ``

2. Block-level containers:
   
   * heading
   * list item
   * blockquote
   * fenced code block

3. Links and embeds (URL is treated as object IRI, link text and image alt can be catched by `{property}` predicate):

   * Bare URL link `https://example.com`
   * Link `[Example](https://example.com)`
   * Image `![alt text](https://example.com/image.jpg)`

Everything else is **not a value carrier**.

## 5. Semantic blocks `{...}`

### General rules

#### Attachment rule

A {...} annotation MUST attach to the nearest preceding value carrier.
The textual content of that carrier is the literal value unless an explicit IRI is provided. Emphasis (*text*), strong emphasis (**text**), and inline code (`text`) MAY serve as content carriers for {...}.

A {...} block MUST appear immediately after:

- a Markdown inline span (e.g. [ ], emphasis, inline code), or
- on its own line, optionally followed by a list.

{...} MUST NOT appear inside Markdown syntax constructs (such as link destinations, emphasis markers, or code fences).

If a {...} block cannot be deterministically attached using these rules, it is still may yeild RDF triples if containing enough semantic data - subject, predicates and objects - explicit semantic-only blocks.

---

## 6. Subjects

A subject exists only if explicitly declared with {=IRI}. Subject declaration sets *current subject* and is used to construct triples based on further annotations until explicit change to another subject or reset with special `{=}` marker. It clears current subject and no quads are emitted until another subject declaration.

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

A literal value MUST be provided by an explicit Markdown inline span ([...], emphasis, bold, or inline code) immediately preceding the {...} block. When multiple predicates appear in a {...} block and a single value carrier exists, the same literal value is applied to all predicates.

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
- it always targets the nearest previous subject that is still in scope, not the nearest syntactic block.
- If no current subject is present no quads are emitted

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

## 9. Lists and Repeated Properties (Normative)

A `{}` block immediately preceding a list applies to **all list items** until the list ends. Ordered and unordered lists are semantically equivalent in MD-LD.

The block MAY contain:

* one predicate (used for all items)
* optional rdf:type declarations

### Syntax

```md
<text> {<predicate> [.Class]*}

- <item text> {=IRI [predicate]*}
- <item text> {=IRI [predicate]*}
```

---

### Semantics

For each list item:

1. The list-scope predicate is applied to the **current subject**
2. The item’s `{=IRI}` defines the **object**
3. Any `.Class` applies to the item subject
4. Item-level predicates apply only to the item

---

### Example 1 — Simple parts list

```md
## Recipe {=ex:recipe1 name}

Ingredients: {schema:hasPart .ex:Ingredient}

- Flour {=ex:Flour name}
- Water {=ex:Water name}
```

```turtle
ex:recipe1 schema:name "Recipe" ;
           schema:hasPart ex:Flour, ex:Water .

ex:Flour a ex:Ingredient ;
         schema:name "Flour" .

ex:Water a ex:Ingredient ;
         schema:name "Water" .
```

---

### Example 2 — List with additional item facts

```md
Ingredients: {schema:hasPart .ex:Ingredient}

- Flour {=ex:Flour schema:name schema:calories "364"^^xsd:integer}
- Water {=ex:Water schema:name}
```

```turtle
<current-subject> schema:hasPart ex:Flour, ex:Water .

ex:Flour a ex:Ingredient ;
         schema:name "Flour" ;
         schema:calories "364"^^xsd:integer .

ex:Water a ex:Ingredient ;
         schema:name "Water" .
```

---

### Example 3 — Reverse relations in lists

```md
Used in recipes: {^schema:hasPart}

- Bread {=ex:Bread}
- Cake {=ex:Cake}
```

```turtle
ex:Bread schema:hasPart <current-subject> .
ex:Cake  schema:hasPart <current-subject> .
```

---

## 6.2 Safety and Round-Trip Guarantees (Normative)

* Each list item MUST contain its own `{}` if it produces triples
* Each item subject MUST be an explicit IRI
* No blank nodes are generated
* Each triple maps to:

  * list-scope `{}` block
  * item `{}` block
* Editing one item does not affect others

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

Fenced code blocks may act as value carriers when `{}` is placed immediately after the opening fence. It's content can be catched by property predicate as a literal value.

### Example

````md
```sparql {=ex:query1 .SoftwareSourceCode text programmingLanguage "SPARQL"}
SELECT * WHERE { ?s ?p ?o }
````

````

```turtle
ex:query1 a schema:SoftwareSourceCode ;
            schema:text "SELECT * WHERE { ?s ?p ?o }" ;
            schema:programmingLanguage "SPARQL" .
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

