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
She mints a personal IRI space with a `tag` namespace (RFC 4151) gives the heading an explicit subject.

```md
[alice] <tag:alice@example.com,2026:>

# Highest Buildings {=alice:hb .Container label}
```

Now, and only now, RDF exists:

```turtle
tag:alice@example.com,2026:hb a rdfs:Container ;
  rdfs:label "Highest Buildings" .
```

Key idea:

> A subject without predicates emits nothing.
> A predicate without a subject emits nothing.
> No guessing, ever.

Her knowledge base agents can now *see* this collection.

---

## 3. Make items addressable (still personal)

She wants to add facts per building.
Each building must have its **own subject**.

She keeps everything personal and local for now.

```md
[alice] <tag:alice@example.com,2026:>

## Burj Khalifa {=alice:burj-khalifa label}

[828] {alice:height ^^xsd:integer}

## Shanghai Tower {=alice:shanghai-tower label}

[632] {alice:height ^^xsd:integer}
```

Now the data is:

* explicit
* stable
* SPARQL-queryable

---

## 4. Reduce repetition with fragment IRIs

She notices all buildings belong to the same topic.
Fragments let her keep a clean hierarchy.

```md
[alice] <tag:alice@example.com,2026:>

# Highest Buildings {=alice:hb .Container label}

## Burj Khalifa {=#burj-khalifa label}

[828] {alice:height ^^xsd:integer}

## Shanghai Tower {=#shanghai-tower label}

[632] {alice:height ^^xsd:integer}
```

This expands to:

```
tag:alice@example.com,2026:hb#burj-khalifa
tag:alice@example.com,2026:hb#shanghai-tower
```

Fragments are:

* deterministic
* relative
* replaceable later

---

## 5. Validate facts, keep ownership

After checking Wikipedia, she cleans heights and adds types.

```md
**Burj Khalifa** {=#burj-khalifa .alice:Skyscraper label} is the highest building at [828] {alice:height ^^xsd:integer} meters is located in [Dubai] {alice:location}

**Shanghai Tower** {=#shanghai-tower .alice:Skyscraper label} - [632] {alice:height ^^xsd:integer} is located in [Shanghai] {alice:location}
```

---

## 6. Switch to a globally unique base (no publishing required)

She decides these IRIs should be globally valid.
She changes **one line**.

```md
[alice] <tag:alice@example.com,2026:>
```
Becomes:
```md
[alice] <https://alice-blog.example.com/hb/>
```

Nothing else changes.

Now all subjects are globally unique IRIs, even if the document stays private.

This is **IRI alignment**, not migration.

---

## 7. Align with global datasets (optional, explicit)

She wants to validate Burj Khalifa against Wikidata.

She chooses to **align**, not replace.

```md
### Burj Khalifa  {=wd:Q134164 .alice:Skyscraper label !seeAlso}
```

This emits:

```turtle
wd:Q134164 a alice:Skyscraper ;
  rdfs:label "Burj Khalifa" ;
  rdfs:seeAlso tag:alice@example.com,2026:hb#burj-khalifa .
```

Now agents can:

* query Wikidata
* enrich her data
* never overwrite her intent

---

## 8. The philosophy, in plain terms

* Markdown stays Markdown
* Semantics are **opt-in**
* Every triple is **authored**
* Subjects are **chosen, not inferred**
* Alignment is **explicit, reversible, local**

MD-LD does not turn notes into data.
It lets people **decide when text becomes knowledge**.