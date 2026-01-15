# From a Heading to a Global IRI

*A single person’s research, made semantic over time*

---

## 1. Start with plain Markdown (no semantics yet)

Alice begins like anyone else: a quick note.

```md
# Highest Buildings

- Burj Khalifa — ~830 m
- Shanghai Tower — ~630 m
```

This is **just text**.
No RDF. Nothing queryable. No subject exists.

---

## 2. Acknowledge the list as a thing

She realizes this list itself is meaningful.
She gives the heading an explicit subject.

```md
# Highest Buildings {=urn:alice:hb .Collection name}
```

Now, and only now, RDF exists:

```turtle
urn:alice:hb a schema:Collection ;
  schema:name "Highest Buildings" .
```

Key idea:

> **A subject without predicates emits nothing.
> A predicate without a subject emits nothing.
> No guessing, ever.**

Her knowledge base agents can now *see* this collection.

---

## 3. Make items addressable (still personal)

She wants to add facts per building.
Each building must have its **own subject**.

She keeps everything personal and local for now.

```md
## Burj Khalifa {=urn:alice:burj-khalifa name}

[828] {height ^^xsd:integer}

## Shanghai Tower {=urn:alice:shanghai-tower name}

[632] {height ^^xsd:integer}
```

Now the data is:

* explicit
* stable
* SPARQL-queryable

Still **entirely hers**.

---

## 4. Reduce repetition with fragment IRIs

She notices all buildings belong to the same topic.
Fragments let her keep a clean hierarchy.

```md
# Highest Buildings {=urn:alice:hb .Collection name}

## Burj Khalifa {=#burj-khalifa name}

[828] {height ^^xsd:integer}

## Shanghai Tower {=#shanghai-tower name}

[632] {height ^^xsd:integer}
```

This expands to:

```
urn:alice:hb#burj-khalifa
urn:alice:hb#shanghai-tower
```

Fragments are:

* deterministic
* relative
* replaceable later

---

## 5. Add a prefix for future alignment

She prepares for growth.

```md
[alice] {: urn:alice:}
```

Now she can write:

```md
# Highest Buildings {=alice:hb .Collection name}
```

This changes **nothing semantically**, but makes refactoring safe.

---

## 6. Validate facts, keep ownership

After checking Wikipedia, she cleans heights and adds types.

```md
**Burj Khalifa** {=#burj-khalifa .Skyscraper name} is the highest building at [828] {height ^^xsd:integer} meters is located in [Dubai] {location}

**Shanghai Tower** {=#shanghai-tower .Skyscraper name} - [632] {height ^^xsd:integer} is located in [Shanghai] {location}
```

---

## 7. Switch to a globally unique base (no publishing required)

She decides these IRIs should be globally valid.
She changes **one line**.

```md
[alice] {: https://alice.com/}
```

Nothing else changes.

Now all subjects are globally unique IRIs, even if the document stays private.

This is **IRI alignment**, not migration.

---

## 8. Align with global datasets (optional, explicit)

She wants to validate Burj Khalifa against Wikidata.

She chooses to **align**, not replace.

```md
### Burj Khalifa  {=wd:Q134164 .Skyscraper name ^?sameAs}
```

This emits:

```turtle
wd:Q134164 a schema:Skyscraper ;
  schema:name "Burj Khalifa" ;
  owl:sameAs https://alice.com/hb#burj-khalifa .
```

Now agents can:

* query Wikidata
* enrich her data
* never overwrite her intent

---

## 9. The philosophy, in plain terms

* Markdown stays Markdown
* Semantics are **opt-in**
* Every triple is **authored**
* Subjects are **chosen, not inferred**
* Alignment is **explicit, reversible, local**

MD-LD does not turn notes into data.
It lets people **decide when text becomes knowledge**.