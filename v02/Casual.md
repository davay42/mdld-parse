## 1. Personal journal with structured memories

**Use case:**
A person writes a diary. Later they want to query *where* they were happy, *with whom*, and *when*.

### MDLD

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## 2024-07-18 — A good day {=ex:day-2024-07-18 .Event}

Mood: [Happy] {ex:mood}
Place: [Central Park] {=ex:central-park location}
With: [Sam] {=ex:sam .Person attendee}

Notes:
I walked for hours and felt calm.
```

### Meaning

```turtle
ex:day-2024-07-18 a schema:Event ;
  ex:mood "Happy" ;
  schema:location ex:central-park ;
  schema:attendee ex:sam .

ex:sam a schema:Person .
```

**Why this works**

* The diary reads normally
* Semantics are *opt-in*
* Later: *“Show all days where mood = Happy AND location = Central Park”*

---

## 2. Family recipe passed down generations

**Use case:**
A grandmother writes a recipe. A grandchild later wants nutrition data, translations, and ingredient graphs.

### MDLD

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Apple Pie {=ex:apple-pie .Recipe}

Ingredients: {recipeIngredient .Food}
- Apples {=ex:apples name}
- Sugar {=ex:sugar name}
- Butter {=ex:butter name}

Baking time: [45] {cookTime ^^xsd:integer}
```

### Meaning

```turtle
ex:apple-pie a schema:Recipe ;
  schema:recipeIngredient ex:apples , ex:sugar , ex:butter ;
  schema:cookTime "45"^^xsd:integer .
```

**Why this matters**

* Ingredients become reusable nodes
* Nutrition, sourcing, cost can be attached later
* No RDF knowledge needed by author

---

## 3. Book club notes with opinions (subjective but structured)

**Use case:**
A casual reading group wants to keep opinions, ratings, and shared references.

### MDLD

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Book Club — June {=ex:bookclub-june .Event}

Book: [Dune] {=ex:dune .Book name}
Rating: [5] {ex:rating}
Comment: **Mind-blowing world building** {reviewBody}
```

### Meaning

```turtle
ex:bookclub-june a schema:Event ;
  schema:about ex:dune ;
  ex:rating "5" ;
  schema:reviewBody "Mind-blowing world building" .

ex:dune a schema:Book ;
  schema:name "Dune" .
```

**Why this is powerful**

* Subjective content is still queryable
* Ratings are facts, not just prose
* Still reads like normal notes

---

## 4. Household expenses written as free prose

**Use case:**
Someone tracks spending without using spreadsheets.

### MDLD

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Saturday errands {=ex:errands-1 .Event}

Bought [Groceries] {=ex:groceries .Product}
Cost: [42.30] {price ^^xsd:decimal}
Store: [Local Market] {seller}
```

### Meaning

```turtle
ex:errands-1 a schema:Event ;
  schema:object ex:groceries ;
  schema:price "42.30"^^xsd:decimal ;
  schema:seller "Local Market" .

ex:groceries a schema:Product .
```

Later query:

> “Show all expenses over $40 last month”

---

## 5. Travel notes with links that actually mean something

**Use case:**
A traveler writes blog-style notes, but links become real references.

### MDLD

```md
[@vocab] {: http://schema.org/}

## Berlin trip {=ex:berlin-trip .Trip}

Visited [Berlin](https://en.wikipedia.org/wiki/Berlin)
{location rdfs:label "Berlin"@en}
```

### Meaning

```turtle
ex:berlin-trip a schema:Trip .

ex:berlin-trip schema:location <https://en.wikipedia.org/wiki/Berlin> .
<https://en.wikipedia.org/wiki/Berlin> rdfs:label "Berlin"@en .
```

**Important**

* URL and label are explicit
* No guessing which property gets which value

---

## 6. A developer explaining an idea (code as knowledge)

**Use case:**
A developer documents a trick and wants it discoverable later.

### MDLD

````md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Parsing idea {=ex:idea-1 .CreativeWork}

```js {=ex:code-snippet-1 schema:text schema:programmingLanguage "JavaScript"}
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-')
}
```
````

### Meaning

```turtle
ex:idea-1 a schema:CreativeWork .

ex:code-snippet-1 a schema:SoftwareSourceCode ;
  schema:text "function slugify(text) { ... }" ;
  schema:programmingLanguage "JavaScript" .
```

---

## 7. A to-do list that grows into a project graph

**Use case:**
Someone starts with a checklist. Later it becomes structured project data.

### MDLD

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Weekend goals {=ex:weekend-goals .Project}

Tasks: {hasPart .Action}
- Clean kitchen {=ex:task-clean}
- Fix bike {=ex:task-bike}
```

### Meaning

```turtle
ex:weekend-goals a schema:Project ;
  schema:hasPart ex:task-clean , ex:task-bike .

ex:task-clean a schema:Action .
ex:task-bike a schema:Action .
```
