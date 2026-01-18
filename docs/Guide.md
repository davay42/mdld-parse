# MD-LD One Page Guide

**Semantic Markdown, no guessing, no magic**

MD-LD lets you **add meaning without breaking Markdown**.
Add `{...}` → you get an RDF graph.
Delete `{...}` → plain Markdown remains.

Everything semantic is **explicit**, **local**, and **traceable**.

---

## 0. Mental model (read once)

MD-LD always writes **triples**:

```
Subject ──predicate──▶ Object / Literal
```

That’s it.

At any annotation `{...}`, there may be:

| Symbol | Meaning                                              |
| ------ | ---------------------------------------------------- |
| **S**  | current subject (IRI)                                |
| **O**  | object IRI (from link, image, or `{+iri}`)          |
| **L**  | literal text (from the attached Markdown span/block) |

No subject → no triple
No guessing → no triple
No `{...}` → no semantics

---

## 1. Start with a document that *already is* a graph

Always declare a subject first.

```md
# Walnut Bread {=urn:my:walnut-bread .Recipe name}
```

This emits:

```turtle
urn:my:walnut-bread
  a schema:Recipe ;
  schema:name "Walnut Bread" .
```

**Why this matters**

* Your note is already an addressable node
* Everything that follows attaches to it
* This is how “casual notes” become “knowledge”

---

## 2. Value carriers (what can hold meaning)

Only these Markdown forms can emit values:

**Inline**

* `[text] {...}`
* `*text* {...}`, `**text** {...}`
* `` `code` {...}``

**Block**

* Headings
* List items
* Blockquotes
* Code blocks (fence with `{...}`)

If `{...}` cannot clearly attach → **nothing is emitted**.

---

## 3. The three predicate forms (the whole algebra)

Every triple is written using **one of three predicate shapes**:

| Form  | Emits   |
| ----- | ------- |
| `p`   | `S → L` |
| `?p`  | `S → O` |
| `!p` | `O → S` |

Nothing else exists.

### Example — all three at once

```md
[Bread] {name}
[Walnut] {+urn:my:walnut ?hasIngredient}
[Recipe](https://en.wikipedia.org/wiki/Recipe) {!hasPart}
```

Never use shortened CURIE in regular Markdown links. They must be valid URLs for the browser to navigate to.

---

## 4. Literals are always local

Text comes **only** from the attached carrier.

```md
[2024] {published ^^xsd:gYear}
[Delicious bread] {description @en}
```

No datatype or language is ever inferred.

---

## 5. Object IRIs (links or `{+iri}`)

Objects exist only if explicitly present.

```md
[Walnuts](urn:my:walnut) {?ingredient}
```

or

```md
[Walnuts] {+urn:my:walnut ?ingredient}
```

Same graph. Different ergonomics.

---

## 6. Lists = repeated structure, never implicit nodes

Lists **do not create subjects**.
Each item must declare one.

```md
Ingredients: {?hasIngredient .Ingredient}

- Walnuts {=urn:my:walnut name}
- Flour {=urn:my:flour name}
- Water {=urn:my:water name}
```

Result: clean, explicit graph. No blank nodes.

---

## 7. Fragments = structured documents

Fragments turn sections into addressable nodes.

```md
## Instructions {=#steps .HowTo}

### Mixing {=#step-1 .HowToStep rdfs:label}

> Mix ingredients {text}

### Baking {=#step-2 .HowToStep rdfs:label}

> Bake for 45 minutes {text}
```

Emits:

```turtle
urn:my:walnut-bread#steps a schema:HowTo .
urn:my:walnut-bread#step-1 a schema:HowToStep ; rdfs:label "Mixing" ; schema:text "Mix ingredients" .
urn:my:walnut-bread#step-2 a schema:HowToStep ; rdfs:label "Baking" ; schema:text "Bake for 45 minutes" .
```

Fragments always attach to the **current subject base**.

---

## 8. Blockquotes = descriptions, abstracts, notes

```md
> A dense, rustic bread with toasted walnuts. {description}
```

Readable prose → structured data.

---

## 9. Code blocks are first-class values

````md
```txt {=urn:my:walnut-bread#formula .Recipe text}
500g flour
300ml water
````

````

Code content becomes a literal.  
Language fences stay intact.

---

## 10. Reverse relations (write from either side)

```md
Used in: {!hasIngredient}

- Salad {=urn:my:salad}
````

Same graph. Different narrative flow.

---

## 11. What MD-LD never does

* ❌ No implicit meaning
* ❌ No blank nodes
* ❌ No inferred subjects
* ❌ No structural guessing
* ❌ No multi-pass parsing

Every triple is **authored**, not derived.

---

## 12. Why this scales (humans + agents)

Because MD-LD is:

* **Streaming-parseable**
* **Round-trip safe**
* **Text-preserving**
* **SPARQL-addressable**

Agents can:

* align facts via SPARQL
* add/remove triples
* serialize changes back into Markdown
  without breaking prose, layout, or intent.

Your document becomes a **shared semantic surface**, not a data export.

---

## One sentence summary

> **MD-LD is RDF you can read, write, diff, query, and share—without ever leaving Markdown.**
