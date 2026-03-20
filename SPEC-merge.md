# MDLD `merge()` — Implementation Spec (v4)

## Summary

`merge()` is the universal composition primitive for MDLD documents.
It subsumes `parse()` entirely and is the single entry point for all
graph state resolution in the system.

**Core authoring model:** a single MDLD document grows by appending diff
blocks. Each block is valid MDLD with `-` polarity tokens targeting prior
state. `merge(doc)` reads the file top to bottom in one pass, the live
buffer resolves all polarity, and the result is the current graph state.
The file is the history. No separate patch format. No external tooling needed.

```
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}

---

# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}
```

`merge(doc).quads` gives the final state. The full edit narrative is
preserved in the file for humans and auditors. Fully deterministic.
Append-only. Lossless.

**Multi-document model:** the same buffer logic extends naturally to chains
of separate documents — version history, agent operation logs, directory
traversal — wherever the caller supplies documents in canonical order.

---

## 1. Signature

```typescript
merge(
  docs: MergeInput | MergeInput[],
  options?: MergeOptions
): MergeResult

type MergeInput = string | ParseResult

interface MergeOptions {
  context?:        PrefixMap    // seed prefixes applied before any document is parsed
  dataFactory?:    DataFactory  // RDF/JS DataFactory
  inheritContext?: boolean      // prefix declarations bleed across documents
                                // DEFAULT: false — each document self-contained
}

interface MergeResult {
  quads:   Quad[]       // final asserted graph state
  remove:  Quad[]       // net retractions targeting state outside this merge call
  origin:  MergeOrigin  // full provenance chain across all input documents
  context: PrefixMap    // union of all contexts encountered, in order
}
```

---

## 2. Ordering invariant (normative)

**The caller owns document ordering. `merge()` never infers, reorders, or sorts.**

Documents are processed strictly in supplied array order.
Wrong order produces wrong results — by design, not a bug.
The calling layer is responsible for canonical ordering.

`merge()` never accepts directory paths or globs.
Only explicit arrays of strings or ParseResults are valid.

---

## 3. Processing model

### 3.1 What `parse()` already resolves

`parse()` with diff polarity returns:
- `quads` — live-buffer state after full single-pass parse. All
  intra-document cancels already resolved silently.
- `remove` — quads that arrived as `-` tokens but were absent from the
  live buffer at that moment. Target state outside the document.

`merge()` never sees raw token-level retractions — only the already-resolved
`quads` and `remove` arrays from each `parse()` call.

For a single document with appended diff blocks, intra-document cancel
handles everything. `remove` is empty. `merge(doc)` === `parse(doc)`.

### 3.2 Session buffer

```javascript
const sessionBuffer    = new Set()  // current graph state
const sessionRemoveSet = new Set()  // net external retractions

for (const input of inputs) {
  // resolve input
  const doc = typeof input === 'string'
    ? parse(input, { context: docContext(input, options) })
    : input  // ParseResult — no re-parse

  // fold assertions
  for (const quad of doc.quads) {
    sessionBuffer.add(quad)
  }

  // fold retractions
  for (const quad of doc.remove) {
    if (sessionBuffer.has(quad)) {
      sessionBuffer.delete(quad)   // inter-document cancel — silent
    } else {
      sessionRemoveSet.add(quad)   // external retract
    }
  }
}
```

**Two cancel levels, both silent and complete before result is returned:**
- Intra-document: resolved inside `parse()` via live buffer
- Inter-document: resolved in session fold via `sessionBuffer.has()`

### 3.3 Quad identity

Five-field exact match — reuse existing `DataFactory.equals()`:
```
(subject.value, predicate.value, object.value, object.datatype?.value, object.language)
```

### 3.4 Context isolation (default)

Each document is parsed with only `options.context` as its prefix map.
Prefix declarations in one document do not affect any other document.
Every document must be independently readable and self-contained.

`options.context` is the correct mechanism for sharing a base vocabulary
across all documents in a chain without bleed.

When `options.inheritContext: true`, prefix declarations accumulate
left-to-right. Explicit opt-in only — for tightly coupled document
families. Use with care.

`result.context` always reflects the union of all contexts encountered —
accumulated output, not per-document input.

---

## 4. Result fields

### `quads`
`sessionBuffer` contents after all documents processed.
Final resolved graph state. All cancels already applied.

### `remove`
`sessionRemoveSet` contents after all documents processed.
Exclusively retractions targeting state **outside** this merge call.
To apply against an external store:
```javascript
store.removeQuads(result.remove)
store.addQuads(result.quads)
```

### Hard invariant
```
result.quads ∩ result.remove = ∅   // always — violation is a bug
```

### `context`
Union of all prefix maps encountered in order.
Suitable as `options.context` for a subsequent `merge()` call.

---

## 5. Origin — `MergeOrigin`

```typescript
interface MergeOrigin {
  documents: DocumentOrigin[]       // one per input, in order
  quadIndex: Map<Quad, QuadOrigin>  // covers both quads and remove
}

interface DocumentOrigin {
  index:   number                   // position in input array (0-based)
  input:   'string' | 'ParseResult'
  origin:  Origin                   // per-document origin from parse()
  context: PrefixMap                // context used to parse this document
}

interface QuadOrigin {
  documentIndex: number
  blockId:       string
  entryIndex:    number
  range:         Range
  carrierType:   CarrierType
  isVacant:      boolean
  polarity:      '+' | '-'
}
```

Every quad in `result.quads` and `result.remove` is traceable to its exact
source location in its source document. All existing `locate()` calls
work unchanged against `MergeOrigin.quadIndex`.

---

## 6. Degenerate cases — API unification

| Call | Behaviour |
|---|---|
| `merge(text)` | identical to `parse(text)` |
| `merge(singleDocWithDiffs)` | all polarity resolved intra-document, `remove: []` |
| `merge([docA, docB])` | two-document chain, inter-doc cancels resolved |
| `merge([a, b, c, d])` | full replay chain |
| `merge(parsedResult)` | identity passthrough, no re-parse |

`parse(text, options)` becomes a thin wrapper: `merge(text, options)`.
Keep as a named export for backwards compatibility.

---

## 7. Test cases

### 7.1 Single document — equivalence to `parse()`

```javascript
merge(`
[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Alice] {my:name}
`)
```
Expected: identical `quads` to `parse()`. `remove: []`.

### 7.2 Single document with appended diff — primary use case

```javascript
merge(`[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}

---

# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`)
```

Live buffer trace (inside `parse()`):
```
.my:Employee           → add {emp456 type Employee}
my:jobTitle "SE"       → add {emp456 jobTitle "SE"}
-my:jobTitle "SE"      → has() ✓ → delete()            INTRA-DOC CANCEL
my:jobTitle "SSE"      → add {emp456 jobTitle "SSE"}
```

Expected:
- `quads`: `{emp456 type Employee, emp456 jobTitle "SSE"}`
- `remove`: `[]` — everything resolved intra-document
- `origin.documents.length === 1`

### 7.3 Single document — external retract

```javascript
merge(`[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`)
```

Live buffer trace:
```
-my:jobTitle "SE"    → has()? NO → removeSet.add()     EXTERNAL RETRACT
my:jobTitle "SSE"    → add
```

Expected:
- `quads` contains `emp456 jobTitle "SSE"`
- `remove` contains `emp456 jobTitle "SE"`
- Diff authoring case — "SE" lives in a prior store or preceding document

### 7.4 Two documents — inter-document cancel

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

Session fold trace:
```
doc₁ parse() → quads: {type:Employee, jobTitle:"SE"}   remove: []
doc₂ parse() → quads: {jobTitle:"SSE"}                 remove: {jobTitle:"SE"}

fold doc₁ quads: sessionBuffer = {type:Employee, jobTitle:"SE"}
fold doc₂ quads: sessionBuffer = {type:Employee, jobTitle:"SE", jobTitle:"SSE"}
fold doc₂ remove: has(jobTitle:"SE") ✓ → delete()      INTER-DOC CANCEL
```

Expected:
- `quads`: `{type:Employee, jobTitle:"SSE"}`
- `remove`: `[]` — inter-document cancel, not external retract
- `origin.documents.length === 2`

### 7.5 Type migration — single annotation

```javascript
merge(`[my] <tag:hr@example.com,2026:>
# Project {=my:proj .my:ActiveProject}
# Project {=my:proj -.my:ActiveProject .my:ArchivedProject}`)
```

Live buffer trace:
```
.my:ActiveProject    → add
-.my:ActiveProject   → has() ✓ → delete()              INTRA-DOC CANCEL
.my:ArchivedProject  → add
```

Expected:
- `quads` contains `proj type ArchivedProject`
- `quads` does NOT contain `proj type ActiveProject`
- `remove`: `[]`

### 7.6 Four-document replay chain

```javascript
merge([genesis, promotion, reorg, salaryUpdate])
```

Expected: final state reflects all four transitions in order.
Each intermediate state reproducible by `merge([genesis, ..., docN])`.
Deterministic — same array always produces same output.

### 7.7 ParseResult passthrough — no re-parse

```javascript
const parsed = merge(textA)
const result  = merge([parsed, textB])
```

Expected:
- `parsed` not re-parsed
- `result.origin.documents[0].input === 'ParseResult'`

### 7.8 Context isolation (default)

```javascript
merge([
  `[my] <tag:hr@example.com,2026:>
   # Employee {=my:emp456}`,
  `# Employee {=my:emp456}
   [Alice] {my:name}`    // no [my] declaration
])
```

Expected: parse warning on doc₂, `my:name` absent, prefix did NOT bleed.

### 7.9 Context inheritance opt-in

Same as 7.8 with `{ inheritContext: true }`.
Expected: `my:name "Alice"` present in `quads`.

### 7.10 Hard invariant — every test

```
result.quads ∩ result.remove = ∅
```

Assert as post-condition on every test. Violation is a parser bug.

---

## 8. Implementation — change surface

```
parse()          already complete — returns quads + remove
                 no further changes needed

merge()          new function, ~60 lines
                 - normalise input to array
                 - iterate: parse strings, passthrough ParseResults
                 - fold doc.quads  → sessionBuffer.add()
                 - fold doc.remove → sessionBuffer.delete() or sessionRemoveSet.add()
                 - accumulate context (isolated or inherited per option)
                 - build MergeOrigin from per-doc origins
                 - return { quads, remove, origin, context }

parse() export   thin wrapper: merge(text, options)
                 keep as named export for backwards compatibility

MergeOrigin      new type — wraps existing Origin per document, ~10 lines
QuadOrigin       add documentIndex + polarity to existing type, ~2 lines

applyDiff()      no changes — out of scope for this spec
generate()       no changes — out of scope for this spec
locate()         no changes — works against MergeOrigin.quadIndex unchanged
```

**Total new logic: ~60–70 lines.**
Zero changes to parser internals, token routing, `applyDiff()`, or `generate()`.
`merge()` is pure glue over the already-complete `parse()` implementation.
