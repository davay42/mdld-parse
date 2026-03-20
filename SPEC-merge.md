# MDLD `merge()` — Implementation Spec (v2)

## Summary

Introduce `merge()` as the universal composition primitive for MDLD documents.  
It subsumes `parse()` and `applyDiff()` entirely.  
A sequence of MDLD documents is processed left-to-right in a single ordered pass,
each document's `quads` and `remove` applied to a shared quad buffer.  
The result is the final asserted graph state, net retractions, full provenance chain,
and optionally a materialized clean MDLD document produced by applying accumulated
diffs back onto the last text input via the existing `applyDiff()` machinery.

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
  materialize?:    boolean      // if true, produce .text via applyDiff on last text input
  inheritContext?: boolean      // if true, prefix declarations bleed across documents
                                // DEFAULT: false — each document is self-contained
}

interface MergeResult {
  quads:    Quad[]       // final asserted graph state
  remove:   Quad[]       // net retractions targeting external prior state
  origin:   MergeOrigin  // provenance chain across all input documents
  context:  PrefixMap    // union of all contexts encountered, left-to-right
  text?:    string       // materialized clean MDLD — only if materialize: true
}
```

---

## 2. Ordering invariant (normative)

**The caller owns document ordering. `merge()` never infers, reorders, or sorts its inputs.**

Documents are processed strictly in the array order supplied. This is the core
MDLD single-pass guarantee extended to sequences. Supplying documents in the
wrong order produces wrong results — this is by design, not a bug. The calling
layer (filesystem walker, version control, Semantic OS chain manager) is
responsible for establishing canonical order before calling `merge()`.

Corollary: `merge()` must never accept a directory path, glob, or any input
that would require it to impose an ordering. Only explicit arrays of strings
or ParseResults are valid inputs.

---

## 3. Processing model

### 3.1 Shared buffer

A single `quadBuffer: Set<Quad>` and `removeSet: Set<Quad>` span the entire
merge session across all input documents.

For each document in array order:

1. If input is a `string` → parse it (single-pass, per existing parser)
2. If input is a `ParseResult` → use as-is, no re-parse
3. For each quad in `doc.quads` → `quadBuffer.add(quad)`
4. For each quad in `doc.remove`:
   - If `quadBuffer.has(quad)` → `quadBuffer.delete(quad)` — intra-session cancel, silent, appears in neither output array
   - Else → `removeSet.add(quad)` — inter-session retraction, surfaces in `result.remove`

### 3.2 Quad identity

Same five-field exact match used throughout the parser:
`(subject.value, predicate.value, object.value, object.datatype?.value, object.language)`

No new equality logic. Reuse existing `DataFactory.equals()`.

### 3.3 Context isolation (default)

By default (`options.inheritContext` not set or `false`), **each document is
parsed with only `options.context` as its prefix map**. Prefix declarations
in doc₁ do not bleed into doc₂. Every document must be self-contained and
independently readable.

This is the correct default because:
- Documents may be stored, signed, and replayed in isolation
- A document whose IRIs resolve differently depending on what preceded it
  in a chain is not a reliable semantic artifact
- `options.context` already provides the right mechanism for sharing a
  base vocabulary across all documents in a chain

When `options.inheritContext: true`, prefix declarations accumulate
left-to-right across documents (later declarations win on collision).
This is an explicit opt-in for tightly coupled document families where
shared prefixes are a known authoring convenience. Use with care.

`result.context` always reflects the union of all contexts encountered,
regardless of isolation mode — it is the accumulated output, not the
per-document input.

### 3.4 Tracking the last text input

For materialization (§6), `merge()` must track the last document that was
supplied as a raw `string`. This is the anchor text that `applyDiff()` will
operate on. If no string input was supplied (all inputs are `ParseResult`),
materialization is not available and `materialize: true` is silently ignored
with a warning.

---

## 4. Result fields

### `quads`
Contents of `quadBuffer` after all documents processed.  
Final asserted graph state. A quad added by doc₁ and removed by doc₃ is
absent from both `quads` and `remove` (silent intra-session cancel).

### `remove`
Contents of `removeSet` after all documents processed.  
Exclusively inter-session retractions — quads targeting state outside this
merge call. Applying this result to an external store is exactly:
```javascript
store.removeQuads(result.remove)
store.addQuads(result.quads)
```

### Invariant
```
result.quads ∩ result.remove = ∅  // always enforced, hard error if violated
```

### `origin`
See §5.

### `context`
The accumulated `PrefixMap` after processing all documents.  
Suitable as `options.context` for a subsequent `merge()` call to seed
prefix continuity without enabling cross-document bleed.

### `text`
Only present when `options.materialize === true` and at least one string
input was supplied. See §6 for full semantics.

---

## 5. Origin — `MergeOrigin`

```typescript
interface MergeOrigin {
  documents: DocumentOrigin[]          // one entry per input, in merge order
  quadIndex: Map<Quad, QuadOrigin>     // indexes both quads and remove entries
}

interface DocumentOrigin {
  index:    number              // position in input array (0-based)
  input:    'string' | 'ParseResult'
  origin:   Origin              // per-document origin from parse()
  context:  PrefixMap           // context used to parse THIS document (isolated or inherited)
}

interface QuadOrigin {
  documentIndex: number         // which document emitted this quad
  blockId:       string
  entryIndex:    number
  range:         Range
  carrierType:   CarrierType
  isVacant:      boolean
  polarity:      '+' | '-'      // '+' for all quads in result.quads, '-' for result.remove
}
```

`quadIndex` covers all quads in both `result.quads` and `result.remove`.  
Full traceability: every quad can be traced to its exact source location
in its source document, regardless of polarity.

The `polarity` field on `QuadOrigin` is the only addition relative to the
existing `Origin` type. All existing `locate()` calls work unchanged.

---

## 6. Materialization via `applyDiff()`

When `options.materialize === true`, `merge()` produces `result.text` by
applying accumulated diffs **onto the last string input** using the existing
`applyDiff()` three-phase machinery (plan → materialize edits → apply + reparse).

### Why `applyDiff()` and not `generate()`

`generate()` produces valid MDLD from a quad set but is **editorially lossy** —
it discards prose structure, section order, narrative context, and vacant slots.
The output is semantically equivalent but unrecognizable to a human editor.

`applyDiff()` operates on the **source text** with character-range precision.
It preserves everything the author wrote and only touches the specific carriers
that changed. The materialized output is the same document with diffs resolved —
still readable, still editable, still the author's document.

### Materialization process

```javascript
lastText = last string input in the merge session
accumulatedDiff = {
  add:    result.quads,   // final asserted state
  delete: result.remove   // net inter-session retractions
}

result.text = applyDiff({
  text:    lastText,
  diff:    accumulatedDiff,
  origin:  origin of lastText,
  options: { context: result.context }
}).text
```

The accumulated diff expresses the net change from `lastText`'s state to the
final merged state. `applyDiff()` resolves this against the actual source
positions tracked in `lastText`'s origin — using vacant slots, literal updates,
and range-based edits exactly as it does today.

### Properties of materialized output

- **Prose-preserving** — only changed carriers are touched, all prose survives
- **Vacant-slot-aware** — removed values leave proper vacant slots for future edits
- **No polarity markers** — all `-`/`+` are resolved, output is pure assertions
- **Valid genesis document** — `merge(result.text)` produces identical `quads`
- **Independently readable** — self-contained, no chain dependency

### Compaction pattern

The natural use of materialization is periodic compaction of a document's
own edit history. An MDLD file accumulates `-`/`+` pairs over time as the
author makes changes. Compaction collapses them:

```javascript
const { text } = merge(editedDoc, { materialize: true })
// write text back to disk — clean, no polarity markers, same semantic state
```

**Compaction guarantee (normative):**
```
merge(compact).quads ≡ merge(original).quads
```
Same quad set, always. Compaction is semantics-preserving by construction
because it uses the same `applyDiff()` + `parse()` pipeline.

### Limitation

If all inputs are `ParseResult` (no string input in the session), the source
text is unavailable and `applyDiff()` cannot operate. In this case:
- `materialize: true` is ignored
- A warning is emitted: `"materialize requires at least one string input"`
- `result.text` is absent

A future `materialize: 'generate'` mode may fall back to `generate()` for
purely quad-derived snapshots where prose fidelity is not required.

---

## 7. Degenerate cases — API unification

| Call | Equivalent to |
|---|---|
| `merge(text)` | `parse(text)` |
| `merge(text, { materialize: true })` | `parse(text)` then `applyDiff()` self-application |
| `merge([baseText, diffText])` | `applyDiff({ text: baseText, diff: parse(diffText) })` |
| `merge(parsedResult)` | identity passthrough, no re-parse |
| `merge([a, b, c, d])` | full replay chain |
| `merge([a, b, c], { materialize: true })` | replay chain + compact onto `c`'s text |

`parse()` and `applyDiff()` become thin wrappers over `merge()` for
backwards compatibility, or are deprecated in favour of direct `merge()` usage.

---

## 8. Test cases

### 8.1 Single document — parse() equivalence
```javascript
const result = merge(`
[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Alice]{my:name}
`)
```
Expected: identical `quads` to `parse()` on same input. `remove: []`.

### 8.2 Two documents — state transition
```javascript
merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456 .my:Employee}
   [Software Engineer]{my:jobTitle}`,

  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}
   -[Software Engineer]{my:jobTitle}
   [Senior Software Engineer]{my:jobTitle}`
])
```
Expected:
- `quads` contains `my:jobTitle "Senior Software Engineer"`
- `quads` does NOT contain `"Software Engineer"`
- `remove` contains `my:jobTitle "Software Engineer"` (inter-session retraction)
- `origin.documents.length === 2`

### 8.3 Intra-session silent cancel
```javascript
merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}
   [Engineer]{my:jobTitle}`,

  `[my] <tag:hr@example.com,2026:>
   {=my:emp456}
   -[Engineer]{my:jobTitle}`
])
```
Expected: `"Engineer"` absent from both `quads` and `remove`. Silent cancel.

### 8.4 Context isolation (default)
```javascript
merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}`,

  // does NOT redeclare [my] prefix
  `# Employee {=my:emp456}
   [Alice]{my:name}`
])
```
Expected: second document fails to resolve `my:` — parse warning emitted,
`my:name` triple absent or flagged. Prefix from doc₁ did NOT bleed.

### 8.5 Context inheritance opt-in
Same input as 8.4 but with `{ inheritContext: true }`.  
Expected: `my:` resolves in doc₂, `my:name "Alice"` present in `quads`.

### 8.6 Materialization — prose preserved
```javascript
const result = merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}
   [Software Engineer]{my:jobTitle}`,

  `[my] <tag:hr@example.com,2026:>
   {=my:emp456}
   -[Software Engineer]{my:jobTitle}
   [Senior Software Engineer]{my:jobTitle}`
], { materialize: true })
```
Expected:
- `result.text` contains `[Senior Software Engineer]{my:jobTitle}`
- `result.text` does NOT contain `-[Software Engineer]`
- `merge(result.text).quads` ≡ `result.quads` (compaction guarantee)

### 8.7 Compaction — self-application
```javascript
const editedDoc = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
-[Engineer]{my:jobTitle}
[Senior Engineer]{my:jobTitle}`

const { text } = merge(editedDoc, { materialize: true })
```
Expected:
- `text` contains `[Senior Engineer]{my:jobTitle}`
- `text` does NOT contain `-[Engineer]`
- `merge(text).quads` ≡ `merge(editedDoc).quads`

### 8.8 ParseResult passthrough — no re-parse
```javascript
const parsed = merge(text)
const result = merge([parsed, diffText])
```
Expected: `parsed` not re-parsed. `result.origin.documents[0].input === 'ParseResult'`.

### 8.9 Invariant — enforced on all fixtures
`result.quads ∩ result.remove = ∅` — assert as post-condition on every test.

### 8.10 Materialize with no string input — warning
```javascript
const a = merge(textA)
const b = merge(textB)
merge([a, b], { materialize: true })
```
Expected: warning emitted, `result.text` absent, `quads` and `remove` correct.

---

## 9. Minimal change surface

| Layer | Change |
|---|---|
| `parse()` | Add `remove: Quad[]` to return (per diff-polarity spec) |
| `merge()` | New function — ~80 lines, loop + shared buffer + applyDiff call |
| `applyDiff()` | Accept pre-computed `{add, delete}` from merge session directly (one-line signature relaxation) |
| `MergeOrigin` | New type wrapping existing `Origin` per document |
| `QuadOrigin` | Add `polarity: '+' \| '-'` and `documentIndex: number` fields |
| `parse()`, `applyDiff()` exports | Thin wrappers for backwards compatibility |
| All other internals | No change |

The `applyDiff()` three-phase pipeline (plan → materialize → apply+reparse)
requires no logic changes — only that `merge()` can call it with a
pre-assembled `{add, delete}` quad diff rather than always computing it
internally. This is a one-line signature relaxation, not a rewrite.
