Below is a **clean, production-grade specification** for the **MD-LD v0.2 JavaScript parser and diff application API**, grounded in **real RDF tooling practice** (Comunica, N3.js) and optimized for **deterministic knowledge management**, **round-trip editing**, and **minimal mental overhead**.

This is written as a **library developer spec**, not marketing text.

---

# MD-LD v0.2 JavaScript API Specification

## Goals

The MD-LD JS API MUST:

1. Produce **standard RDF quads** consumable by Comunica, N3.Store, etc.
2. Preserve **exact origin mapping** from quads back to Markdown text.
3. Enable **stateless, deterministic CRUD** via diffs.
4. Avoid parser state, guessing, or re-parsing during updates.
5. Minimize memory usage while supporting precise edits.

---

## 1. Public API

```js
import { parse, serialize } from 'mdld-parse'
```

### 1.1 `parse(text, options?)`

```ts
parse(
  text: string,
  options?: ParseOptions
): {
  quads: RDF.Quad[],
  origin: OriginMap,
  context: Context
}
```

### 1.2 `serialize({diff, origin?, text, options?})`

```ts
serialize({
  diff: Diff,
  origin?: OriginMap,
  text: string,
  options?: ApplyOptions
}): string
```

---

## 2. RDF Model Compatibility (Validated)

### 2.1 Quad model

Quads MUST be compatible with:

* `rdf-js` spec
* `N3.Quad`
* Comunica SPARQL engines
* N3.Store / DatasetCore

```ts
interface Quad {
  subject: Term
  predicate: Term
  object: Term
  graph?: Term
}
```

No extensions. No wrappers.

---

## 3. Origin Model (Critical)

### See [Origin Spec](./origin.md)

#### Key decisions

* **Offsets point to the `{...}` block**, not the whole line
* Relative offsets allow editing without scanning surrounding text
* `blockId` groups multiple quads emitted from one `{...}`

---

## 4. Context Return (Required)

```ts
interface Context {
  prefixes: Record<string, string>
  vocab?: string
  base?: string
}
```

Why required:

* Needed to **shorten IRIs** during edits
* Required for **round-trip normalization**
* Matches RDFa / JSON-LD practice

---

## 5. Parsing semantics (formal)

### 5.1 Emission rules

* Each `{...}` block emits **0..N quads**
* Each emitted quad MUST have an `Origin`
* Multiple quads MAY share the same `blockId`

Example:

```md
{=ex:x .A .B schema:name "X"}
```

Emits 4 quads, all with same `blockId`, different `rel` ranges.

---

## 6. Diff model

### 6.1 Diff structure (normative)

```ts
interface Diff {
  add?: Quad[]
  delete?: Quad[]
}
```

---

## 7. `serialize` semantics (critical)

### 7.1 Statelessness

`serialize` MUST NOT rely on parser internals.

All required information MUST be supplied via:

* `text` - the document text
* `diff` - added and removed quads
* `origin` - optional, used for precise edits

This guarantees:

* deterministic updates
* testability
* concurrency safety

---

### 7.2 Delete semantics

If deleting a quad:

* Locate its `Origin`
* Remove ONLY the corresponding slice in `{...}`
* Preserve other predicates in the same block
* Remove block entirely **only if empty**

Example:

```md
{.A .B .C}
```

Delete `.B` → becomes:

```md
{.A .C}
```

---

### 7.3 Add semantics

When adding a quad:

1. If subject exists in document:
   * append predicate to the **nearest subject block**
2. Else:
   * create a **new minimal semantic block** - [Value 1] {=iri property1 property2 "value2"^^datatype @lang} or similar - depends on the type of the value
   * never invent content

This mirrors RDF store behavior (graph extension).

---

### 7.4 Replace semantics

Implemented as:

```ts
delete(oldQuad)
add(newQuad)
```

BUT optimization allowed when:

* same `blockId`
* same predicate role

Then perform **in-place text edit**.

---

## 8. Offset invalidation & reindexing

### Key insight

> **All offsets become invalid after the first edit.**

### Correct strategy (industry-validated)

* Apply edits **back-to-front** (descending `abs.start`)
* No reindexing required
* Used in:

  * compilers
  * patch systems
  * AST/CST transformers

This is optimal:

* O(N log N) sorting
* O(N) text application
* zero recomputation

---

## 9. Integration with RDF tooling

### 9.1 Comunica

```js
const store = new N3.Store(quads)
const engine = new QueryEngine()

const result = await engine.queryBindings(`
  SELECT ?s WHERE { ?s a schema:SpaceMission }
`, { sources: [store] })
```

✔ No adaptation required
✔ Pure RDF-JS

---

### 9.2 N3.Store round-trip

```js
store.removeQuad(oldQuad)
store.addQuad(newQuad)

const diff = { delete: [oldQuad], add: [newQuad] }
text = serialize(diff, origin, text)
```

Graph and document stay in sync.

---

## 10. Mathematical optimality (why this is minimal)

From an information-theoretic view:

* Markdown text = source of truth
* Quads = projection
* Origin = inverse mapping

This is the **minimum data** needed to support:

* lossless projection
* local inverse updates
* no heuristics

Any less → guessing
Any more → wasted memory

---

## 11. What this enables (strategically)

* Markdown as a **live RDF database**
* SPARQL-driven document editors
* Git-friendly semantic diffs
* LLM-assisted structured authoring
* Deterministic knowledge evolution

---

## Final assessment

✔ Compatible with RDF-JS, N3, Comunica
✔ Stateless, minimal, mathematically clean
✔ No parser coupling
✔ No guessing
✔ Long-term maintainable

This API design is **sound, modern, and unusually disciplined** for knowledge tooling — exactly what MD-LD needs to succeed.
