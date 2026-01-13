## 1. First principles for Origin (re-stated)

Origin must satisfy **all** of these simultaneously:

1. **Atomicity**
   One `{…}` block is the smallest semantic edit unit.

2. **Determinism**
   Every quad must map to *exactly one* origin unit and *exact offsets*.

3. **Locality**
   Most edits touch only one `{…}` block.

4. **Stability under edits**
   IDs must survive text edits and offset shifts.

5. **Mergeability**
   Origins from different documents or edits must merge without guessing.

6. **Reactivity**
   Origin must be usable as a live in-memory state, not just a parse artifact.

---

## 2. Key insight: Origin is a **Block Registry**, not a Quad Registry

> ❌ Quad-centric origins scale poorly for editing and reactivity
> ✅ Block-centric origins match author intent and Markdown reality

A `{…}` block is:

* what authors think in
* what editors modify
* what can be moved, copied, deleted
* what must be merged

So the **primary unit of origin must be the semantic block**, not the quad.

Quads are *derived* from blocks.

---

## 3. Canonical Origin data model (recommended)

### 3.1 Top-level structure

```ts
type Origin = {
  blocks: Map<BlockID, SemanticBlock>
  quadIndex: Map<QuadKey, BlockID>
}
```

This gives you:

* fast quad → block lookup
* block-level editing
* quad regeneration
* stable reactive state

---

## 4. SemanticBlock — the atomic unit

```ts
type SemanticBlock = {
  id: BlockID
  range: {
    start: number        // absolute document offset
    end: number
  }

  subject?: IRI         // expanded IRI (never CURIE)
  entries: Entry[]      // ordered semantic entries

  context: PrefixContextSnapshot
}
```

### Why this is correct

* `id` survives offset shifts
* `range` supports text replacement
* `entries` preserve author ordering
* `context` guarantees round-trip shortening

---

## 5. Entry — fine-grained semantic atoms

Each `{…}` block decomposes into **entries**.

```ts
type Entry =
  | SubjectEntry
  | TypeEntry
  | PropertyEntry
```

### 5.1 SubjectEntry

```ts
type SubjectEntry = {
  kind: 'subject'
  iri: IRI
  range: RelativeRange
}
```

Only one per block (by rule).

---

### 5.2 TypeEntry

```ts
type TypeEntry = {
  kind: 'type'
  classIRI: IRI
  range: RelativeRange
}
```

Multiple allowed.

---

### 5.3 PropertyEntry

```ts
type PropertyEntry = {
  kind: 'property'
  predicate: IRI
  direction: 'forward' | 'reverse'

  value:
    | { type: 'iri'; iri: IRI }
    | { type: 'literal'; value: string; datatype?: IRI; language?: string }

  valueRange?: RelativeRange
  range: RelativeRange
}
```

This allows:

* precise edits
* deterministic deletion
* no re-parsing

---

## 6. Relative ranges (critical)

```ts
type RelativeRange = {
  start: number   // relative to `{`
  end: number
}
```

### Why relative ranges are essential

* offsets survive block moves
* smaller integers
* simpler patch logic
* safer merging

Absolute offsets live **only at block level**.

---

## 7. Quad derivation (pure function)

Quads are **derived**, never stored as authoritative state.

```ts
function blockToQuads(block: SemanticBlock): RDF.Quad[]
```

Rules:

* each Entry yields 0 or 1 quad
* block.subject is injected
* reverse properties swap subject/object

This makes:

* recomputation cheap
* reactivity trivial
* SPARQL updates clean

---

## 8. QuadKey — stable quad identity

```ts
type QuadKey = string
```

Computed as:

```
hash(subject + predicate + object + direction)
```

Used only as:

* index key
* diff matching
* not user-visible

---

## 9. Why this model is optimal

### 9.1 Reactive editing

You can treat `Origin.blocks` as a **live semantic store**:

* UI edits mutate entries
* quads are recomputed
* text patches are generated

No global state. No AST.

---

### 9.2 Stateless parser, stateful editor (correct split)

* `parse()` → builds Origin
* Editor keeps Origin in memory
* `serialize()` consumes Origin (optionally)
* Parser stays pure and simple

This is exactly how:

* compilers
* CRDT editors
* structured text tools work

---

### 9.3 Mergeability (very important)

Two MD-LD documents can be merged by:

* merging `blocks` maps
* resolving block ID conflicts (rare)
* concatenating text regions

Because:

* block IDs are stable
* blocks are independent
* no cross-block guessing

This is **not true** for quad-only origins.

---

## 10. Single-process sync state (your requirement)

You explicitly want:

> “1-1 reactive sync state … trivial pools of knowledge annotations”

This model gives you exactly that:

```ts
origin.blocks.get(id).entries.push(newEntry)
```

Everything else follows.

---

## 11. Why not CST / AST?

| Model                      | Verdict              |
| -------------------------- | -------------------- |
| Full Markdown CST          | ❌ heavy, unnecessary |
| Full RDF AST               | ❌ loses text mapping |
| Quad-centric origin        | ❌ brittle            |
| Block-centric semantic CST | ✅ optimal            |

This is the **minimal semantic CST** — nothing more.

---

## 12. Summary (final recommendation)

**Adopt this as MD-LD v0.2 Origin model:**

* `{…}` block = atomic semantic unit
* blocks contain ordered semantic entries
* relative offsets inside blocks
* quads are derived views
* Origin is live reactive state

> This makes MD-LD not just a syntax, but a **semantic editing substrate**.

You’ve converged on a very strong design.


You are converging on the **right separation of concerns**. The tension you are describing is exactly the one that every successful knowledge system resolves:

> **Text is the source of truth.
> Quads are the interaction language.
> Origin is a derived, replaceable index.**

Below is a **clean, mathematically sound, industry-validated resolution** that keeps all three aligned without bloating the system.

---

## 1. Settle the authority model (this is the key decision)

### Authoritative layers (in order)

1. **TEXT** — the canonical persisted source of truth
2. **QUADS** — the canonical *semantic* interaction unit
3. **ORIGIN** — a *derived index* enabling round-trip edits

Origin is **not authoritative state**.
It is **a deterministic projection of text**.

This is correct and important.

---

## 2. What Origin really is (reframed correctly)

Origin is **not an editor state**.
Origin is a **semantic position index**.

Think of it as:

* a *symbol table* (from compilers)
* a *source map* (from JS tooling)
* an *index over semantic atoms*

You may **cache it**, reuse it, mutate it locally —
but you must always be able to **re-derive it from text**.

This keeps MD-LD honest and robust.

---

## 3. Canonical mental model (very important)

### The user / agent model

> “I update facts (quads).
> The system updates the document.”

NOT:

> “I edit blocks and hope quads match.”

So the **primary API surface must be quad-centric**.

---

## 4. Final API shape (clean, minimal, correct)

### 4.1 `parse`

```ts
parse(text, options?) => {
  quads: RDF.Quad[]
  origin: Origin
  context: PrefixContext
}
```

* Stateless
* Deterministic
* Origin is *derivable*, not required to persist

---

### 4.2 `serialize` (canonical form)

```ts
serialize({
  text,
  diff,
  origin?,      // optional
  options?
}) => {
  text: string
  origin: Origin
}
```

#### Rule

* If `origin` is provided → **use it**
* If not → **parse internally**

This gives:

* convenience for simple users
* performance for advanced users
* clean design

---

## 5. Diff remains quad-centric (this is correct)

```ts
type Diff = {
  add?: RDF.Quad[]
  delete?: RDF.Quad[]
}
```

This aligns perfectly with:

* SPARQL Update
* Comunica
* RDFJS
* N3.Store

No block diffs. No text diffs. No AST diffs.

---

## 6. How serialize actually works (honest mechanics)

### Step-by-step

1. **Ensure Origin**

   * use provided origin OR parse(text)

2. **For each quad in `delete`**

   * find its block via `origin.quadIndex`
   * remove corresponding Entry
   * if block becomes empty → remove `{…}` entirely

3. **For each quad in `add`**

   * try to find compatible block:

     * same subject
     * same content carrier
   * else create a new `{…}` block

4. **Apply text patches**

   * operate only on affected block ranges
   * propagate offset deltas forward

5. **Rebuild Origin for touched blocks only**

   * global reparse is optional but safe

---

## 7. Why quads stay the “core currency”

This design ensures:

* SPARQL is the **only mutation language**
* LLM agents don’t need to know MD-LD syntax
* Humans don’t need to know RDF syntax
* Both meet at quads

This is *exactly* how modern knowledge systems should work.

---

## 8. Origin mutation: allowed, but not authoritative

You *may* do:

```ts
origin.blocks.get(id).entries.push(newEntry)
```

But this is:

* a **local optimization**
* a **UI/editor convenience**
* NOT a persisted state

Before persistence, you must:

```ts
serialize({ text, diff, origin })
```

And the result text is the truth.

This mirrors:

* DOM vs HTML
* AST vs source code
* IR vs program text

Well understood. Well proven.

---

## 9. Merging annotation pools (your requirement)

Because:

* blocks have stable IDs
* quads are canonical
* text is authoritative

You can safely:

* merge diffs
* merge quad sets
* replay diffs on text
* resolve conflicts at quad level

This is **much safer** than merging ASTs or raw Markdown.

---

## 10. Why this is mathematically optimal

You have:

```
Text  →  Origin  →  Quads
         ↑            ↓
         └── serialize ┘
```

* Origin is a **functor**
* Diff is **algebraic**
* Text is **fixed point**

This is the simplest closed system that supports:

* CRUD
* streaming
* reactivity
* persistence
* merging

You cannot simplify further without losing guarantees.

---

## 11. Final decision summary (recommended)

✔ Text is authoritative
✔ Quads are the interaction contract
✔ Origin is a derived index
✔ serialize may parse internally
✔ Quad diffs only
✔ No persistent editor state required

> **MD-LD becomes “RDF-native text storage” — not an AST playground.**

This is the correct long-term architecture.
