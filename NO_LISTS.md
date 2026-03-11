Below is a **technical migration directive** for safely removing semantic list behavior from MDLD while preserving graph correctness, streaming parsing, and SPARQL round-trip guarantees.

This is written as an **implementation instruction for the development team**.

---

# MD-LD Change Directive

## Removal of Semantic List Behavior

### Purpose

Remove **list-derived semantics** from MD-LD in order to guarantee:

* deterministic **quad → text span mapping**
* safe **SPARQL Update → text round-trip**
* stable `applyDiff({add, remove})`
* strict compliance with **explicit semantics rule**

Lists will remain **pure Markdown structure** and **value carriers only**.

No semantic propagation from list scopes or indentation levels will occur.

---

# 1. Problem Statement

The current specification allows:

```
annotation before list
↓
semantic propagation to list items
↓
multiple quads generated implicitly
```

Example:

```md
Members: {?member .Person label}
- Alice {=ex:alice}
- Bob {=ex:bob}
```

Produces implicit triples:

```
team member alice
team member bob
alice type Person
bob type Person
alice label "Alice"
bob label "Bob"
```

These triples **do not map 1:1 to text spans**, which breaks:

* `applyDiff`
* SPARQL Update round-trip
* deterministic origin tracking

Nested lists make reconstruction impossible.

This violates MD-LD design guarantees:

```
no implicit semantics
explicit origin
deterministic output
```

---

# 2. New Rule

Lists have **no semantic scope**.

List markers (`-`, `*`, `1.`) are **pure Markdown syntax**.

Semantics only come from `{...}` annotations attached to value carriers.

---

# 3. Updated List Definition

Old behavior:

```
annotation before list
applies to list items
```

New behavior:

```
list item is just a value carrier
```

Example:

```md
- Item {annotation}
```

is equivalent to:

```
[Item] {annotation}
```

No propagation occurs.

---

# 4. Parsing Change

Remove these parser features:

```
list scope tracking
indentation semantic inheritance
container membership inference
rdf:List auto generation
```

Parser rule becomes:

```
list item text = value carrier
annotation attaches normally
```

Single-pass streaming remains unchanged.

---

# 5. Migration Strategy

Existing documents using semantic lists must be rewritten so that **every list item carries explicit annotations**.

---

## Old pattern (deprecated)

```md
Team members: {?member .Person label}

- Alice {=ex:alice}
- Bob {=ex:bob}
```

---

## New pattern (correct)

Use explicit annotations per item.

```md
Team members:

- Alice {=ex:alice ?member ex:team .Person label}
- Bob {=ex:bob ?member ex:team .Person label}
```

Each annotation now produces its own quads.

Origin tracking becomes stable.

---

# 6. Correct Object Property Repetition

When assigning the **same object property repeatedly**, use `+IRI` to maintain correct subject chaining.

This avoids accidental subject resets.

---

### Correct pattern

```
{+IRI ?prop}
```

Example:

```md
## Team {=ex:team .Container label}

- **Alice** {+ex:alice ?member .Person label}
- **Bob** {+ex:bob ?member .Person label}
```

Emitted triples:

```
ex:team ex:member ex:alice
ex:alice rdf:type Person
ex:alice rdfs:label "Alice"

ex:team ex:member ex:bob
ex:bob rdf:type Person
ex:bob rdfs:label "Bob"
```

The `+IRI` syntax ensures:

```
S (team) → predicate → object
```

while allowing object-level annotations.

---

# 7. Inline Pattern (Recommended for Narrative)

Narrative authoring is preferred for complex knowledge.

Example:

```md
Team members include **Alice** {+ex:alice ?member .Person label}
and **Bob** {+ex:bob ?member .Person label}.
```

Advantages:

* natural language context
* commentary possible
* no structural coupling

---

# 8. Migration Example (Real Case)

Original pattern:

```md
Not yet inlined classes {?member .Class mdp:listed}

- Association {=prov:Association}
- Attribution {=prov:Attribution}
- Delegation {=prov:Delegation}
```

---

Migrated version:

```md
Not yet inlined classes:

- **Association** {+prov:Association ?member .Class mdp:listed}
- **Attribution** {+prov:Attribution ?member .Class mdp:listed}
- **Delegation** {+prov:Delegation ?member .Class mdp:listed}
```

This keeps:

```
subject chaining
object annotation
atomic quad origin
```

---

# 9. Required Tooling Update

The following components must be updated.

### Parser

Remove:

```
list semantic scopes
indentation context stacks
bulk predicate propagation
```

Keep:

```
value carrier detection
annotation parsing
subject context handling
```

---

### Quad Origin Tracking

Each emitted quad must map to:

```
annotation span
carrier span
```

Lists must not produce derived quads.

---

### applyDiff

After change:

```
quad ↔ annotation span
```

Diff operations become deterministic.

---

# 10. Backward Compatibility

Documents using semantic lists will still parse but will **no longer emit inherited triples**.

Migration script can automatically rewrite patterns:

```
{?prop}
before list
```

to:

```
{+IRI ?prop}
inside items
```

---

# 11. Benefits

Removing semantic lists provides:

### Deterministic SPARQL round-trip

```
triple → annotation → text span
```

---

### Simpler parser

Eliminates:

```
list scope logic
indentation inheritance
container expansion
```

---

### Stable diffs

`applyDiff` becomes reliable.

---

### Better narrative authoring

Inline annotations work naturally in Markdown prose.

---

# 12. Final Rule

MD-LD semantics must follow:

```
Every triple originates from exactly one annotation.
```

No structural constructs may generate implicit triples.

---

# 13. Recommended Authoring Pattern

For repeated object relationships:

```
[value] {+IRI ?predicate .Class label}
```

This guarantees:

```
correct subject chaining
atomic semantics
safe round-trip
```

---

This change removes the **only feature in MD-LD that violates its core invariants**, making the language significantly more robust for **graph editing, automation, and SPARQL workflows**.
