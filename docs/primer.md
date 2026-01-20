# MD-LD Primer

**Turn your Markdown notes into a knowledge graph—one `{...}` at a time**

Reading time: 10 minutes | You'll learn: How to add meaning to your notes without breaking Markdown

---

## What you'll do

You'll add `{...}` annotations to your existing Markdown notes. That's it.

```markdown
# Apollo 11 Mission {=ex:apollo11 .SpaceMission}

Launch date: [1969-07-16] {startDate ^^xsd:date}
Commander: [Neil Armstrong] {commander}
```

Delete the `{...}` → you still have valid Markdown.
Keep the `{...}` → you now have queryable, shareable data.

---

## The three-second mental model

Every annotation creates **connections**:

```
Subject ────predicate───▶ Object or Value
```

MD-LD gives you four ways to write these connections. That's the whole system.

---

## Part 1: Your first semantic note

### Step 1: Make your heading a "thing"

Start with any heading:

```markdown
# My Reading List
```

Give it an identity:

```markdown
# My Reading List {=urn:me:reading-list}
```

**What happened:**
- `{=urn:me:reading-list}` declares this heading represents a specific thing
- Nothing is published, nothing breaks
- The heading is now addressable

---

### Step 2: Add properties with `p`

Attach facts to your thing:

```markdown
# My Reading List {=urn:me:reading-list}

Status: [Active] {status}
Created: [2024-01-15] {dateCreated ^^xsd:date}
```

**Pattern:**
```
[value] {propertyName}
```

**Result:**
```turtle
urn:me:reading-list 
  schema:status "Active" ;
  schema:dateCreated "2024-01-15"^^xsd:date .
```

---

### Step 3: Add types with `.ClassName`

Tell what kind of thing this is:

```markdown
# My Reading List {=urn:me:reading-list .Collection}
```

**Result:**
```turtle
urn:me:reading-list a schema:Collection .
```

Combine with properties:

```markdown
# My Reading List {=urn:me:reading-list .Collection name}
```

Now the heading text becomes the name!

---

## Part 2: Connecting things

### Step 4: Link to other things with `?p`

Books belong to your list:

```markdown
# My Reading List {=urn:me:reading-list .Collection}

Books: {?hasPart}

- Dune {=urn:book:dune .Book name}
- Foundation {=urn:book:foundation .Book name}
```

**What happened:**
```
urn:me:reading-list ─hasPart─▶ urn:book:dune
urn:me:reading-list ─hasPart─▶ urn:book:foundation
```

**The pattern:**

| Form | Creates | Direction |
|------|---------|-----------|
| `p` | `Subject → Value` | properties |
| `?p` | `Subject → Object` | relationships |

---

### Step 5: Reverse relationships with `!p`

Sometimes you want to write from the other direction:

```markdown
# Dune {=urn:book:dune .Book}

Part of: {!hasPart}

- My Reading List {=urn:me:reading-list}
- Science Fiction Classics {=urn:list:scifi}
```

**Result:**
```
urn:me:reading-list ─hasPart─▶ urn:book:dune
urn:list:scifi ─hasPart─▶ urn:book:dune
```

Same graph, different narrative flow!

---

## Part 3: All four predicate forms

Here's the complete system:

| Form | Direction | Node Type | Use When |
|------|-----------|-----------|----------|
| `p` | Subject → Value | `S ─▶ L` | Adding text properties |
| `?p` | Subject → Object | `S ─▶ O` | Linking to other things |
| `!p` | Object → Subject | `O ─▶ S` | Reversing a relationship |

**Example using all four:**

```markdown
# My Book {=urn:book:mine .Book}

Title: [Semantic Notes] {name}
Related: [PKM](urn:topic:pkm) {?about}
Category: [Reference] {^category}
Publisher: [Acme Press](urn:org:acme) {!publisher}
```

**Creates:**
```turtle
urn:book:mine 
  a schema:Book ;
  schema:name "Semantic Notes" ;
  schema:about urn:topic:pkm .

urn:org:acme schema:publisher urn:book:mine .
```

---

## Part 4: Shortcuts and structure

### Fragments for document sections

Instead of inventing new URNs for every section:

```markdown
# Book {=urn:book:mine}

## Chapter 1 {=#ch1 .Chapter}

[Introduction] {description}

## Chapter 2 {=#ch2 .Chapter}

[Deep dive] {description}
```

**Creates:**
```
urn:book:mine#ch1 a schema:Chapter ; schema:description "Introduction" .
urn:book:mine#ch2 a schema:Chapter ; schema:description "Deep dive" .
```

Fragments (`{=#name}`) attach to the current subject's base IRI.

---

### Soft objects with `{+iri}`

Declare a temporary object without changing your subject:

```markdown
# Recipe {=urn:recipe:pie}

Ingredient: [Sugar] {+urn:food:sugar ?ingredient name}
```

**Creates:**
```turtle
urn:recipe:pie schema:ingredient urn:food:sugar .
urn:food:sugar schema:name "Sugar" .
```

The `{+urn:food:sugar}` exists only for that annotation.

---

### Prefixes for cleaner notes

Stop typing long URNs:

```markdown
[me] <urn:me:>
[book] <urn:book:>

# Reading List {=me:list .Collection}

- Dune {=book:dune .Book name}
```

---

## Part 5: Rich content

### Blockquotes for descriptions

```markdown
# Article {=urn:article:md-ld}

> MD-LD bridges Markdown and RDF without breaking either. {abstract}
```

---

### Code blocks as values

````markdown
# Script {=urn:code:hello .SoftwareSourceCode}

```python {text}
print("Hello, semantic world!")
```

Language: [Python] {programmingLanguage}
````

---

### Data types and languages

```markdown
# Event {=urn:event:launch}

Date: [1969-07-16] {startDate ^^xsd:date}
Count: [3] {attendeeCount ^^xsd:integer}
Description: [First moon landing] {description @en}
```

**Type symbols:**
- `^^xsd:date`, `^^xsd:integer`, `^^xsd:decimal`
- `@en`, `@fr`, `@de`

---

## Quick reference card

### Subject & Type
```markdown
{=urn:id}          # Set current subject
{=#fragment}       # Create fragment IRI
.ClassName         # Add type
{+urn:id}          # Temporary object
```

### Predicates
```markdown
{prop}             # Subject → Value
{?prop}            # Subject → Object  
{!prop}            # Object → Subject
```

### Values
```markdown
^^xsd:date         # Add datatype
@en                # Add language
```

### Context
```markdown
[prefix] <URI>   # Define prefix
[@vocab] <URI>   # Set vocabulary
```

---

## What MD-LD never does

✗ Guess meaning from structure  
✗ Create subjects automatically  
✗ Infer predicates from context  
✗ Generate blank nodes  
✗ Require all-or-nothing annotation  

**Every triple you see is a triple you wrote.**

---

## Your path forward

1. **Start small:** Add `{=id}` to one heading
2. **Add properties:** Use `{prop}` for simple facts
3. **Connect things:** Try `{?prop}` to link notes
4. **Explore:** Use fragments, reverse relations, code blocks
5. **Query:** Your notes are now a graph

---

## Examples to study

**Personal knowledge:**
```markdown
# Meeting Notes {=urn:note:2024-01-15 .Meeting}

Attendees: {?attendee}
- Alice {=urn:person:alice name}
- Bob {=urn:person:bob name}
```

**Recipe:**
```markdown
# Apple Pie {=urn:recipe:pie .Recipe name}

Ingredients: {?ingredient}
- Apples {=urn:food:apples name}
- Sugar {=urn:food:sugar name}

Cooking time: [45] {cookTime ^^xsd:integer} minutes
```

**Documentation:**
```markdown
# API {=api:/users .APIEndpoint}

Method: [GET] {method}
Path: [/users] {path}
```

---

## One sentence summary

**MD-LD lets you add meaning to Markdown using `{...}` annotations—everything is explicit, nothing is guessed, and your notes become a queryable knowledge graph.**
