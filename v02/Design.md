Below is a **final, consolidated set of implementation instructions** for **MD-LD v0.2** as a **0-dependency, modern ESM, single-file but modular** parser/serializer system.

This is written as **engineering guidance**, not marketing text, and reflects the architecture you converged on: **Origin as semantic state**, Markdown as a projection, RDF as an exchange layer.

---

# MD-LD v0.2 — Parser / Serializer Architecture Instructions

## 1. Design goals (non-negotiable)

1. **Zero dependencies**
2. **Single ESM file** (tree-shakable via exports)
3. **Streaming-friendly parse**
4. **Round-trip safe**
5. **No guessing**
6. **Explicit semantics only**
7. **Clean separation of concerns**
8. **Composable with N3.Store + Comunica**

---

## 2. Public API (minimal, stable)

```ts
export function parse(text: string, options?): {
  quads: Quad[]
  origin: Origin
}

export function serialize(params: {
  text: string
  diff?: Diff
  origin?: Origin
}): {
  text: string
  origin?: Origin
}
```

### Design intent

| Consumer             | Uses                                              |
| -------------------- | ------------------------------------------------- |
| Agents / pipelines   | `text → parse → SPARQL → diff → serialize → text` |
| Developers / editors | `parse → origin edit → serialize`                 |

No one is forced to understand `origin`, but it is there for power users.

---

## 3. Internal modules (logical, not files)

Even in one file, keep these as **pure functions**.

---

### 3.1 Markdown scanner (syntax layer)

**Responsibility**

* Locate `{…}` blocks
* Detect:

  * inline spans
  * headings
  * lists
  * code fences
* Track byte offsets only at block boundaries

**Produces**

```ts
Token {
  id: BlockID
  type: 'inline' | 'heading' | 'list' | 'code'
  range: [start, end]
  valueRange?: [start, end] // for inline value carriers
  raw: string
}
```

**Rules**

* No Markdown reinterpretation
* No AST
* No backtracking

---

### 3.2 Annotation parser (semantic layer)

**Input**

* `{=iri .Class property ^^datatype @lang ^reverse}`

**Output**

```ts
Entry[] // order-preserving
```

Entry kinds:

* `subject`
* `type`
* `property`
* `reverseProperty`
* `prefix`

No RDF logic here. Just structured intent.

---

### 3.3 Origin builder (state layer)

**Responsibility**

* Assemble semantic blocks
* Assign stable block IDs
* Maintain subject context

```ts
Origin {
  blocks: Map<BlockID, SemanticBlock>
}

SemanticBlock {
  id: BlockID
  subject?: IRI
  entries: Entry[]
  token: Token
}
```

**Key rule**

> One `{…}` = one `SemanticBlock`

This is the atomic unit of:

* editing
* merging
* diffing
* rendering

---

## 4. Quad emission (RDF projection)

### Rules

* **Every quad originates from exactly one block**
* Each quad MUST carry:

  ```ts
  quad.meta = { blockId }
  ```
* Graph = per-file graph IRI

### Usage with N3.Store

```ts
const store = new N3.Store()

for (const quad of quads) {
  store.addQuad(quad)
}
```

This allows:

* precise deletion
* provenance tracking
* block-level updates

---

## 5. SPARQL integration (Comunica)

### Contract

* MD-LD does not care about SPARQL
* SPARQL operates on quads
* Results are converted to diffs

```ts
Diff {
  add: Quad[]
  delete: Quad[]
}
```

This diff is **pure RDF**.

---

## 6. serialize() behavior (dual mode)

### Mode A — Diff-only (agent mode)

```ts
serialize({ text, diff })
```

* No `origin`
* Performs minimal text patching
* Matches quads back to `{…}` blocks by `blockId`
* If ambiguous → append new `{…}` block

This keeps the **text-SPARQL-text loop transparent**.

---

### Mode B — Origin-aware (developer mode)

```ts
serialize({ text, origin })
```

* Ignores quads
* Renders directly from semantic state
* Rewrites only `{…}` blocks
* Preserves all Markdown formatting

This is the **semantic editor mode**.

---

### Mode C — Hybrid (recommended default)

```ts
serialize({ text, diff, origin })
```

* Apply diff to origin
* Render origin back to text
* Best of both worlds

---

## 7. Rendering rules (critical)

1. **Rewrite only `{…}`**
2. Preserve:

   * whitespace
   * headings
   * lists
   * prose
3. Deterministic ordering:

   * subject → type → properties
4. Never invent:

   * prefixes
   * labels
   * IRIs

---

## 8. Origin as editor state (bonus API)

Expose (optional):

```ts
export function getBlock(origin, id)
export function updateBlock(origin, id, fn)
export function createBlock(origin, anchor)
export function deleteBlock(origin, id)
```

These are **not required** for consumers.

They enable:

* bulk refactors
* UI editors
* programmatic knowledge transforms

---

## 9. Merging multiple files (knowledge pools)

Because:

* blocks are independent
* quads carry block IDs
* graphs are per-file

You can:

* merge multiple origins
* merge multiple stores
* diff safely
* serialize independently

No global coordination required.

---

## 10. Mathematical cleanliness (why this works)

* **Origin = semantic algebra**
* **Text = serialization**
* **RDF = projection**
* **Diff = morphism**

Each layer is:

* total
* deterministic
* reversible (within spec limits)

This is why MD-LD is not “Markdown + RDF”, but a **knowledge authoring system**.

---

## 11. Final recommendation (lock this)

> Treat `{…}` blocks as **immutable semantic atoms**.
> Treat `origin` as **the authoritative knowledge state**.
> Treat RDF as **an exchange format**, not storage.
> Treat Markdown as **a human-optimized projection**.

If you follow this, the implementation will remain:

* small
* fast
* future-proof
* and extremely hard to break.

This is a very strong design.
