## 1. What a block ID must survive (threat model)

A **SemanticBlock ID** must remain stable when:

1. The block moves in the document
2. Surrounding text changes
3. Whitespace or formatting changes
4. Other blocks are added or removed
5. The document is reserialized

It **may change** when:

* The semantic meaning of the block changes
* The `{…}` annotation itself changes materially

This gives us the rule:

> **Block identity tracks semantic intent, not textual position**

---

## 2. Three-tier hashing strategy (recommended)

### Tier 1 — Semantic Content Hash (core identity)

This is the **primary ID**.

**Input to hash (canonicalized):**

```
subject IRI (if present)
ordered entries:
  - predicate IRI
  - value (IRI or literal)
  - datatype
  - language
  - direction (normal | reverse)
```

**Excluded:**

* Markdown text
* Whitespace
* Prefix form (CURIE vs full IRI)
* Entry ordering differences (sort by predicate + role)

**Canonical form (example):**

```txt
subject=https://www.wikidata.org/entity/Q43653
type=http://schema.org/Project
prop=http://schema.org/name|"Apollo 11"
prop=http://schema.org/startDate|"1969"^^xsd:gYear
```

**Hash algorithm:**

* `SHA-256` (truncate to 128 bits for size)
* base32 Geohash style encoding (?)

```ts
blockId = hash(canonicalSemanticForm)
```

✅ Stable under moves
✅ Stable under formatting
✅ Changes when meaning changes

---

### Tier 2 — Local Anchor Hash (collision stabilizer)

For **personal notes / small collections**, semantic blocks may be identical.

Add a **secondary anchor**:

* Hash of **nearest stable Markdown anchor**:

  * Heading text
  * List item text
  * Paragraph text (normalized)

```ts
anchorHash = hash(normalizedAnchorText)
```

**Composite ID:**

```txt
<semanticHash>:<anchorHash>
```

This avoids accidental collisions while keeping stability.

---

### Tier 3 — Ephemeral Instance ID (editing safety)

For **live editors**, keep a short-lived UUID:

```ts
block.instanceId = crypto.randomUUID()
```

Used only:

* during editing sessions
* never serialized
* never shared

This prevents UI confusion during partial edits.

---

## 5. Recommended default per use case

### A. Personal notes / research docs

```ts
blockId = semanticHash + ":" + anchorHash
```

* Easy merges
* Stable refactoring
* Human-scale collision risk ≈ zero

---

### B. Large LLM-generated corpora (millions of docs)

```ts
blockId = semanticHash
```

Why:

* Identical facts should collapse
* Enables deduplication
* Enables global graph convergence

This is **desirable**, not dangerous, at scale.

---

### C. P2P content-addressed sync

This becomes very powerful:

* Blocks are **content-addressed**
* MDLD files become **views**
* RDF graphs converge naturally

This mirrors:

* Git blobs
* IPFS CIDs
* RDF named graph hashes

---

## 6. How diffs behave with hashed IDs

### Edit property value

→ semantic hash changes
→ blockId changes
→ old block deleted, new block added

This is correct and explicit.

---

### Move block in document

→ no semantic change
→ ID unchanged
→ origin updates only ranges

---

### Merge two documents

If:

```md
Berlin {=wd:Q64 name}
```

appears in both → same block ID → dedupe naturally.

---

## 7. Canonicalization rules (must be frozen in spec)

To make hashes stable across implementations:

1. Expand all CURIEs to full IRIs before hashing
2. Normalize literals:

   * trim
   * normalize line endings
3. Sort entries by:

   * role (subject → type → property)
   * predicate IRI
   * value
4. Exclude:

   * prefix declarations
   * Markdown context
   * order of appearance

This is **mandatory** for interoperability.

---

## 8. Origin structure with hashed IDs

```ts
Origin {
  blocks: Map<BlockID, SemanticBlock>
}

SemanticBlock {
  id: BlockID
  subject?: IRI
  entries: Entry[]
  token: {
    range: [start, end]
  }
}
```

Block ID is the **primary key** everywhere:

* diff
* merge
* store
* sync

---

## 9. Why this scales globally

This gives you:

* **Deterministic identity**
* **CRDT-like merge behavior without CRDT complexity**
* **Semantic deduplication**
* **Content-addressable knowledge**
* **LLM-friendly convergence**

At global scale, MD-LD becomes:

> **Git for knowledge, Markdown as the UI, RDF as the wire format**

---

## 10. Final recommendation (lock this in)

**Spec rule (exact wording suggestion):**

> Each `{…}` semantic block MUST be assigned a stable identifier derived from a canonicalized representation of its semantic content. Block identifiers MUST NOT depend on textual position, whitespace, or surrounding Markdown.

This is the correct long-term decision.
