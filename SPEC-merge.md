# MDLD `merge()` — Implementation Spec (v3)

## Summary

Introduce `merge()` as the universal composition primitive for MDLD documents.

**Primary use case:** a single MDLD document containing its own edit history
as `-` polarity tokens. `merge(doc, { materialize: true })` resolves all
polarity markers back onto the source text via `applyDiff()`, preserving
prose, narrative, and vacant slots — producing a clean compacted document
with identical semantic state.

**Secondary use case:** chaining multiple MDLD documents into a reproducible
edit chain. Each document's resolved `quads` and `remove` arrays (already
live-buffer-resolved by `parse()`) are folded into a shared session buffer.

`merge()` subsumes `parse()` and `applyDiff()` as thin wrappers.
No existing logic changes. ~80 lines of new glue code.

---

## 1. Signature

```typescript
merge(
  docs: MergeInput | MergeInput[],
  options?: MergeOptions
): MergeResult

type MergeInput = string | ParseResult

interface MergeOptions {
  context?:        PrefixMap    // seed context — applied before any document is parsed
  dataFactory?:    DataFactory  // RDF/JS DataFactory
  materialize?:    boolean      // if true, produce .text via applyDiff on last string input
  inheritContext?: boolean      // if true, prefix declarations bleed across documents
                                // DEFAULT: false — each document is self-contained
}

interface MergeResult {
  quads:    Quad[]       // final asserted graph state
  remove:   Quad[]       // net retractions targeting state outside this merge call
  origin:   MergeOrigin  // provenance chain across all input documents
  context:  PrefixMap    // union of all contexts encountered, left-to-right
  text?:    string       // compacted MDLD — only present if materialize: true
}
```

---

## 2. Ordering invariant (normative)

**The caller owns document ordering. `merge()` never infers, reorders, or sorts.**

Documents are processed strictly in the array order supplied.
The calling layer (Semantic OS chain manager, version control, user code)
is responsible for establishing canonical order before calling `merge()`.

`merge()` must never accept directory paths, globs, or any input requiring
it to impose an ordering. Only explicit arrays of strings or ParseResults.

---

## 3. Processing model

### 3.1 What `parse()` already resolves

`parse()` with diff polarity implemented returns:
- `quads` — the live-buffer state after full single-pass parse. All
  intra-document cancels (assert then retract same quad) are already
  resolved and silent. This is the net asserted state of that document.
- `remove` — quads that arrived as `-` tokens but were absent from the
  live buffer at that moment. These target state outside the document.

**`merge()` never sees raw token-level retractions.** It only sees the
already-resolved `quads` and `remove` arrays from each `parse()` call.
The live-buffer guarantee is entirely inside `parse()`.

### 3.2 Session buffer

A single `sessionBuffer: Set<Quad>` and `sessionRemoveSet: Set<Quad>`
span the merge session across all input documents.

For each document in array order:

```javascript
// step 1 — resolve input
const doc = typeof input === 'string'
  ? parse(input, { context: sessionContext })
  : input  // ParseResult passthrough — no re-parse

// step 2 — fold quads into session state
for (const quad of doc.quads) {
  sessionBuffer.add(quad)
}

// step 3 — fold remove into session state
for (const quad of doc.remove) {
  if (sessionBuffer.has(quad)) {
    sessionBuffer.delete(quad)      // inter-document cancel — silent
  } else {
    sessionRemoveSet.add(quad)      // external retract — surfaces in result.remove
  }
}
```

**Two cancel levels, both silent:**
- Intra-document: handled inside `parse()` before `merge()` sees anything
- Inter-document: `sessionBuffer.has()` check in step 3

### 3.3 Context isolation (default)

By default, each document is parsed with only `options.context` as its
prefix map. Prefix declarations in doc₁ do not bleed into doc₂.
Every document must be self-contained and independently readable —
a document whose IRIs resolve differently depending on chain position
is not a reliable semantic artifact.

`options.context` is the right mechanism for sharing a base vocabulary.

When `options.inheritContext: true`, prefix declarations accumulate
left-to-right (later declarations win on collision). Explicit opt-in
for tightly coupled document families. Use with care.

`result.context` always reflects the union of all contexts encountered —
it is the accumulated output, not the per-document input.

### 3.4 Tracking the anchor text

For materialization, `merge()` tracks the **last document supplied as a
raw string**. This is the prose anchor that `applyDiff()` operates on.
Its parsed origin provides the character-range map for all edits.

If no string input exists in the session (all inputs are ParseResult),
`materialize: true` emits a warning and `result.text` is absent.

---

## 4. Result fields

### `quads`
`sessionBuffer` contents after all documents processed.
Final asserted graph state. All cancels (intra and inter-document) already resolved.

### `remove`
`sessionRemoveSet` contents after all documents processed.
Exclusively retractions targeting state **outside** this merge call.
Applying to an external store:
```javascript
store.removeQuads(result.remove)
store.addQuads(result.quads)
```

### Hard invariant
```
result.quads ∩ result.remove = ∅   // always — violation is a bug
```

### `context`
Accumulated PrefixMap after all documents. Suitable as `options.context`
for a subsequent `merge()` call without enabling bleed.

### `text`
See §6. Present only when `materialize: true` and a string input exists.

---

## 5. Origin — `MergeOrigin`

```typescript
interface MergeOrigin {
  documents: DocumentOrigin[]       // one per input, in merge order
  quadIndex: Map<Quad, QuadOrigin>  // covers quads and remove entries
}

interface DocumentOrigin {
  index:    number                  // position in input array (0-based)
  input:    'string' | 'ParseResult'
  origin:   Origin                  // per-document origin from parse()
  context:  PrefixMap               // context used to parse this document
}

interface QuadOrigin {
  documentIndex: number             // which document emitted this quad
  blockId:       string
  entryIndex:    number
  range:         Range
  carrierType:   CarrierType
  isVacant:      boolean
  polarity:      '+' | '-'
}
```

`quadIndex` covers all quads in both `result.quads` and `result.remove`.
Every quad is traceable to its exact source location in its source document.
All existing `locate()` calls work unchanged.

---

## 6. Materialization via `applyDiff()`

### Primary use case — single document compaction

A single MDLD document accumulates `-` polarity tokens as the author edits.
`merge(doc, { materialize: true })` compacts it:

```javascript
// author's living document
const doc = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`

const { quads, text } = merge(doc, { materialize: true })
// text: clean MDLD, polarity markers resolved, prose preserved
// quads: identical to merge(doc).quads
```

The document is both the parse source and the `applyDiff()` anchor.
All intra-document cancels were already resolved by `parse()` live-buffer.
`applyDiff()` only needs to materialise vacant slots left by external retracts.

### Multi-document use case — chain compaction

```javascript
const { text } = merge([docA, docB, docC], { materialize: true })
// text anchored to docC (last string input)
// applyDiff() applies net diff relative to docC's state onto docC's text
```

### Why `applyDiff()` and not `generate()`

`generate()` is editorially lossy — it discards prose structure, section
order, narrative context, and vacant slots. Output is semantically correct
but unrecognizable to a human editor.

`applyDiff()` operates on source text with character-range precision.
It preserves everything the author wrote and only touches changed carriers.
The materialized output is the same document with polarity resolved —
still readable, still editable, still the author's document.

### Materialization process

```javascript
const anchorText   = lastStringInput           // last raw string in session
const anchorOrigin = its parse().origin        // character-range map
const anchorQuads  = its parse().quads         // what anchorText currently asserts

// net diff from anchorText's state to final merged state
const netDiff = {
  add:    sessionBuffer  // quads to assert (some may already be in anchorQuads)
  delete: sessionRemoveSet // quads to retract from anchorText's state
}

result.text = applyDiff({
  text:    anchorText,
  diff:    netDiff,
  origin:  anchorOrigin,
  options: { context: result.context }
}).text
```

`applyDiff()` handles the rest via its existing three-phase pipeline:
plan (literal updates, vacant slot occupations, deletes, adds) →
materialize edits (character ranges) → apply + reparse.

No changes to `applyDiff()` internals required. The only relaxation needed
is accepting a pre-assembled `{add, delete}` object directly — which it
already supports via its existing `diff` parameter.

### Compaction guarantee (normative)

```
merge(result.text).quads ≡ result.quads
```

Same quad set always. Compaction is semantics-preserving by construction —
it uses the same `applyDiff()` + `parse()` pipeline that produced `result.quads`.

### Properties of materialized output

- **Prose-preserving** — only changed carriers touched, all prose survives
- **Vacant-slot-aware** — removed values leave proper slots for future edits
- **No polarity tokens** — all `-p` resolved, output is pure assertions
- **Valid standalone document** — `merge(result.text)` produces identical `quads`
- **Self-contained** — no chain dependency, independently readable

---

## 7. Degenerate cases — API unification

| Call | Equivalent to |
|---|---|
| `merge(text)` | `parse(text)` |
| `merge(text, { materialize: true })` | `parse(text)` + `applyDiff()` self-compaction |
| `merge([textA, textB])` | parse both, fold session buffers, no text output |
| `merge([textA, textB], { materialize: true })` | fold + `applyDiff()` onto `textB` |
| `merge(parsedResult)` | identity passthrough, no re-parse |
| `merge([a, b, c, d])` | full replay chain |

`parse()` → `merge(text)`  
`applyDiff({ text, diff, origin, options })` → `merge([text, diffText], { materialize: true })`

Both kept as thin wrappers for backwards compatibility.

---

## 8. Test cases

### 8.1 Single document — parse() equivalence
```javascript
merge(`
[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Alice] {my:name}
`)
```
Expected: identical `quads` to `parse()`. `remove: []`.

### 8.2 Single document compaction — primary use case
```javascript
const doc = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`

const result = merge(doc, { materialize: true })
```

Session trace (inside `parse()`, live-buffer):
```
.my:Employee             → sessionBuffer: {type:Employee}
my:jobTitle "SE"         → sessionBuffer: {type:Employee, jobTitle:SE}
-my:jobTitle "SE"        → has() ✓ → delete()    INTRA-DOC CANCEL
my:jobTitle "SSE"        → sessionBuffer: {type:Employee, jobTitle:SSE}
```

Expected:
- `quads` contains `emp456 jobTitle "Senior Software Engineer"`
- `quads` contains `emp456 type Employee`
- `remove` is **empty** — cancel was intra-document, resolved inside `parse()`
- `result.text` contains `[Senior Software Engineer] {my:jobTitle}` — polarity token gone
- `merge(result.text).quads` ≡ `result.quads`

### 8.3 Two documents — inter-document cancel
```javascript
merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456 .my:Employee}
   [Software Engineer] {my:jobTitle}`,

  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}
   [Software Engineer] {-my:jobTitle}
   [Senior Software Engineer] {my:jobTitle}`
])
```

Session trace:
```
doc₁ parse() → quads: {type:Employee, jobTitle:"SE"}   remove: []
doc₂ parse() → quads: {jobTitle:"SSE"}                 remove: {jobTitle:"SE"}

fold doc₁: sessionBuffer = {type:Employee, jobTitle:"SE"}
fold doc₂ quads: sessionBuffer = {type:Employee, jobTitle:"SE", jobTitle:"SSE"}
fold doc₂ remove: sessionBuffer.has(jobTitle:"SE") ✓ → delete()   INTER-DOC CANCEL
```

Expected:
- `quads` contains `emp456 jobTitle "Senior Software Engineer"`
- `quads` contains `emp456 type Employee`
- `remove` is **empty** — inter-document cancel, resolved in session fold
- `origin.documents.length === 2`

### 8.4 External retract — `remove` is populated
```javascript
merge(`[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`)
```

Session trace (inside `parse()`, live-buffer):
```
-my:jobTitle "SE"   → has()? NO → removeSet.add()   EXTERNAL RETRACT
my:jobTitle "SSE"   → sessionBuffer.add()
```

Expected:
- `quads` contains `emp456 jobTitle "Senior Software Engineer"`
- `remove` contains `emp456 jobTitle "Software Engineer"`
- This is the diff authoring case — "SE" lived in a prior store or document

### 8.5 Type migration — single annotation, single document
```javascript
merge(`[my] <tag:hr@example.com,2026:>
# Project Alpha {=my:proj .my:ActiveProject}
# Project Alpha {=my:proj -.my:ActiveProject .my:ArchivedProject}`)
```

Session trace:
```
.my:ActiveProject    → sessionBuffer.add()
-.my:ActiveProject   → has() ✓ → delete()    INTRA-DOC CANCEL
.my:ArchivedProject  → sessionBuffer.add()
```

Expected:
- `quads` contains `proj type ArchivedProject`
- `quads` does NOT contain `proj type ActiveProject`
- `remove` is **empty**

### 8.6 Context isolation (default)
```javascript
merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}`,
  `# Employee {=my:emp456}
   [Alice] {my:name}`   // no [my] prefix declaration
])
```
Expected: parse warning on doc₂, `my:name` triple absent, prefix did NOT bleed.

### 8.7 Context inheritance opt-in
Same as 8.6 with `{ inheritContext: true }`.
Expected: `my:name "Alice"` present in `quads`.

### 8.8 Multi-document materialization — anchor is last string
```javascript
const result = merge([docA, docB, docC], { materialize: true })
```
Expected:
- `result.text` is `docC`'s prose with net diff from all three docs applied
- `merge(result.text).quads` ≡ `result.quads`
- `docA` and `docB`'s prose is NOT in `result.text` — anchor is `docC`

### 8.9 ParseResult passthrough — no re-parse
```javascript
const parsed = merge(text)
const result = merge([parsed, diffText])
```
Expected: `parsed` not re-parsed. `result.origin.documents[0].input === 'ParseResult'`.

### 8.10 Materialize with no string input — warning
```javascript
merge([merge(textA), merge(textB)], { materialize: true })
```
Expected: warning emitted, `result.text` absent, `quads`/`remove` correct.

### 8.11 Compaction guarantee — all materialization tests
For every test where `materialize: true`:
```
merge(result.text).quads ≡ result.quads
```
Assert as post-condition.

### 8.12 Hard invariant — all tests
```
result.quads ∩ result.remove = ∅
```
Assert as post-condition on every test. Violation is a bug.

---

## 9. Implementation — minimal change surface

```
parse()              already done — returns quads + remove
                     no further changes needed

merge()              new function ~80 lines
                     - iterate inputs, parse strings, passthrough ParseResults
                     - fold doc.quads → sessionBuffer
                     - fold doc.remove → sessionBuffer.delete or sessionRemoveSet
                     - track last string input + its origin for materialization
                     - if materialize: call applyDiff() with netDiff
                     - return { quads, remove, origin, context, text? }

applyDiff()          no internal changes
                     already accepts pre-assembled {add, delete} via diff param

MergeOrigin          new type — wraps existing Origin per document
QuadOrigin           add documentIndex + polarity fields to existing type

parse() export       thin wrapper: merge(text, options)
applyDiff() export   thin wrapper: merge([text, diffText], { materialize: true })
```

Total new logic: ~80 lines in `merge()`, ~5 lines of wrapper adjustments.
Zero changes to parser internals, token routing, or `applyDiff()` pipeline.
