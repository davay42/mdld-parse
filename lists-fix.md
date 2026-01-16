Yes — **you are correct**, and this is an important ergonomic *and* conceptual alignment issue.

From both an RDF-model and author-mental-model perspective, **list-heading predicates that connect list items should be object predicates**, not literal predicates. Using `{property}` there is inconsistent with MD-LD’s own algebra.

Let’s break this down precisely and then look at clean improvements.

---

## 1. Why `{property}` at list headings is semantically wrong

### Current pattern (as used today)

```md
Ingredients: {hasPart .Ingredient}

- Flour {=ex:flour name}
- Water {=ex:water name}
```

This *works* because:

* The list heading block applies to list items
* Each list item has a subject
* The parser treats `hasPart` as “connect S to item subject”

But algebraically, this violates your own predicate model.

---

### According to MD-LD algebra

| Form | Meaning   |
| ---- | --------- |
| `p`  | `S ─p→ L` |
| `?p` | `S ─p→ O` |

In a list:

* The **list item subject** is an **IRI**
* The list heading connects **S → item IRI**

Therefore:

> The correct predicate form is `?p`, not `p`.

Using `{hasPart}` *looks* like a literal predicate, but behaves like an object predicate.

That is an inconsistency.

---

## 2. Why this matters (even if output is correct)

### 2.1 Mental model mismatch

Authors learn:

* `{name}` → literal
* `{?knows}` → IRI link

But lists silently break that rule.

That increases cognitive load and makes lists feel “special” in a bad way.

---

### 2.2 Round-trip clarity

When you serialize RDF back to MD-LD:

* A triple `S hasPart ex:flour`
* Cannot round-trip to `{hasPart}` without *special casing lists*

That’s exactly the kind of hidden heuristic MD-LD otherwise avoids.

---

### 2.3 Spec consistency

Right now lists are the **only place** where:

* `p` sometimes means `S → IRI`
* depending on context

That weakens the otherwise clean algebra.

---

## 3. The correct fix: require `{?property}` for list headings

### Normative change (recommended)

> **List-scoping predicates that connect the current subject to list item subjects MUST use object predicate form (`?p` or `^?p`).**

So the canonical form becomes:

```md
Ingredients: {?hasPart .Ingredient}

- Flour {=ex:flour name}
- Water {=ex:water name}
```

This aligns perfectly with:

* Predicate algebra
* Author expectations
* Round-trip stability
* Tooling simplicity


## 5. Reverse lists also benefit

Your reverse list example becomes clearer:

```md
Used in: {^?hasPart}

- Bread {=ex:bread}
```

This now reads exactly as:

> “Bread hasPart this”

Which is semantically perfect.

---

## 6. Optional ergonomic sugar (still consistent)

Once `{?property}` is the rule, you can add **visual sugar** later:

```md
Ingredients ->hasPart:
```

Desugars to:

```md
Ingredients: {?hasPart}
```

But that’s optional and future-facing.

---

## 7. Spec wording you can drop in (ready to paste)

> **List Predicate Rule (normative)**
> A `{...}` block that applies to a list and connects the current subject to list item subjects MUST use object predicate forms (`?p` or `^?p`). Literal predicate forms (`p`, `^p`) in list scope emit no quads.

Optionally:

> Processors MAY warn when literal predicate forms are used in list scope.

---

## 8. Bottom line

* You are right.
* `{property}` at list headings is algebraically inconsistent.
* `{?property}` is the correct, explicit, and future-proof form.
* Fixing this improves:

  * Author intuition
  * Spec cleanliness
  * Serializer determinism
  * Tooling simplicity

This is exactly the kind of small, principled correction that strengthens MD-LD rather than complicating it.
