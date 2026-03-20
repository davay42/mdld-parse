# MDLD Diff Polarity — Implementation Spec (v3)

## Summary

Add per-predicate remove polarity to annotation tokens in `mdld-parse`.  
A `-` prefix on any predicate token inside `{...}` routes that token's emitted
quad as a retraction against the **live quad buffer** — the current graph state
at that exact point in the stream.  
This is CommonMark-safe, works identically on all carrier types, is round-trippable,
and requires ~17 lines of new logic across two functions.

---

## 1. Core invariant — live state guarantee

**`quadBuffer` is the current graph state at every point during parsing.**

Every `emitQuad` call is an immediate state mutation. By the time the parser
reaches the last character, `quadBuffer` already contains the final resolved
state. No post-parse reconciliation step exists or is needed.

```
after token at position N:
  quadBuffer = exact graph state that would result from
               parsing tokens 0..N in isolation
```

Consequences:
- A `-` token retracts against whatever is in `quadBuffer` right now
- If the quad is present → evict immediately → cancel, appears nowhere
- If the quad is absent → record in `removeSet` → external retract, surfaces in `result.remove`
- `result.quads` is `quadBuffer` as-is after the final token — no further transformation

---

## 2. Token grammar extension

### New token forms

| Token | Existing form | Quad emitted | Routing |
|---|---|---|---|
| `-p` | `p` | `S → L` | live retract |
| `-?p` | `?p` | `S → O` | live retract |
| `-!p` | `!p` | `O → S` | live retract |
| `-.C` | `.C` | `S rdf:type C` | live retract |

### Explicitly excluded

`-=IRI` — subject declarations emit no quads. Strip `-`, warn, process `=IRI` normally.

`-+IRI` — excluded. `+IRI` scopes multiple subsequent predicate tokens; bulk-routing
all of them to remove is implicit, non-deterministic in scope, and contradicts
MDLD's one-token-one-quad principle. Use explicit `-?p`, `-!p` per predicate.

`-^^datatype`, `-@lang` — value modifiers, not predicate tokens. Strip `-`, warn, ignore.

### Polarity is per-token, not per-annotation

Multiple tokens in one annotation may have independent polarities:

```mdld
# Project Alpha {=my:proj -.my:ActiveProject .my:ArchivedProject}
```

Streaming state:
```
-.my:ActiveProject  → emitQuad(S rdf:type Active, remove=true)
                      quadBuffer.has()? → routes to removeSet or cancels
.my:ArchivedProject → emitQuad(S rdf:type Archived, remove=false)
                      quadBuffer.add()
```

One annotation, two quads, independent routing. Fully deterministic token-by-token.

---

## 3. Token parsing — minimal change

```javascript
function parseToken(raw) {
  const remove = raw.startsWith('-') && raw.length > 1
  const s = remove ? raw.slice(1) : raw

  if (s.startsWith('='))  return { kind: 'subject',    remove: false } // warn if remove
  if (s.startsWith('+'))  return { kind: 'object',     remove: false } // warn if remove
  if (s.startsWith('.'))  return { kind: 'type',       remove }
  if (s.startsWith('?'))  return { kind: 'predObjFwd', remove }
  if (s.startsWith('!'))  return { kind: 'predObjRev', remove }
  if (s.startsWith('^^')) return { kind: 'datatype',   remove: false } // warn if remove
  if (s.startsWith('@'))  return { kind: 'language',   remove: false } // warn if remove
  return                         { kind: 'predLit',    remove }
}
```

One boolean added to the token. No new token kinds. No new parsing paths.

---

## 4. Quad emitter — live routing

```javascript
function emitQuad(quad, remove = false) {
  if (remove) {
    if (quadBuffer.has(quad)) {
      quadBuffer.delete(quad)  // in current state → cancel, appears nowhere
    } else {
      removeSet.add(quad)      // not in current state → external retract
    }
  } else {
    quadBuffer.add(quad)       // existing behaviour
  }
}
```

`has()` / `delete()` / `add()` are all O(1). No deferred resolution.
No end-of-document pass. The `remove` flag comes directly from the token.

### Parser state invariant

The `remove` flag affects **only quad routing**. It never affects:
- Current subject `S`
- Object node `O` introduced by `+IRI` in the same annotation
- Subject context for subsequent annotations
- Carrier value `L`

---

## 5. `parse()` return

```typescript
// before
{ quads: Quad[], origin: Origin, context: PrefixMap }

// after
{ quads: Quad[], remove: Quad[], origin: Origin, context: PrefixMap }
```

`quads` — `quadBuffer` contents after full parse. Final resolved graph state.

`remove` — `removeSet` contents. Quads that arrived as retractions but were
not present in `quadBuffer` at that moment — targeting prior external state.

### Hard invariant
```
quads ∩ remove = ∅   // enforced — violation is a parser bug
```

---

## 6. Origin tracking

One field added to the existing origin entry:

```typescript
interface OriginEntry {
  // ... all existing fields unchanged ...
  polarity: '+' | '-'   // NEW — default '+' for all existing entries
}
```

`quadIndex` covers entries from both `quads` and `remove`.
`locate()`, `applyDiff()`, `merge()` unchanged.

---

## 7. Architecture summary

```
parseToken()     strip leading '-', set token.remove boolean
                 warn and clear remove for =, +, ^^, @
                 ~8 lines changed

emitQuad()       remove=false → quadBuffer.add()          (existing)
                 remove=true  → quadBuffer.delete() or removeSet.add()
                 ~6 lines changed

parse() return   add removeSet as result.remove
                 ~2 lines changed

OriginEntry      add polarity field, default '+'
                 ~1 line changed

TOTAL: ~17 lines of new logic. No existing logic changed.
```

---

## 8. Test cases

Each test shows the streaming state trace to make the live-buffer reasoning explicit.

### 8.1 Intra-document cancel — `remove` is empty

```mdld
[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}
```

Streaming trace:
```
.my:Employee              → quadBuffer.add(emp456 type Employee)
my:jobTitle "SE"          → quadBuffer.add(emp456 jobTitle "SE")
-my:jobTitle "SE"         → quadBuffer.has() ✓ → quadBuffer.delete()   CANCEL
my:jobTitle "SSE"         → quadBuffer.add(emp456 jobTitle "SSE")
```

Expected:
- `quads` contains `my:emp456 my:jobTitle "Senior Software Engineer"`
- `quads` contains `my:emp456 rdf:type my:Employee`
- `remove` is **empty** — the "Software Engineer" quad was cancelled in-stream
- `"Software Engineer"` absent from both arrays

### 8.2 External retract — `remove` is populated

```mdld
[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}
```

Streaming trace:
```
-my:jobTitle "SE"    → quadBuffer.has()? NO → removeSet.add(emp456 jobTitle "SE")
my:jobTitle "SSE"    → quadBuffer.add(emp456 jobTitle "SSE")
```

Expected:
- `quads` contains `my:emp456 my:jobTitle "Senior Software Engineer"`
- `remove` contains `my:emp456 my:jobTitle "Software Engineer"`
- This is the **diff authoring** case — "SE" lived in a prior document or store

### 8.3 Type migration — single annotation

```mdld
[my] <tag:hr@example.com,2026:>
# Project Alpha {=my:proj -.my:ActiveProject .my:ArchivedProject}
```

Streaming trace:
```
-.my:ActiveProject   → quadBuffer.has()? NO → removeSet.add(proj type Active)
.my:ArchivedProject  → quadBuffer.add(proj type Archived)
```

Expected:
- `quads` contains `my:proj rdf:type my:ArchivedProject`
- `remove` contains `my:proj rdf:type my:ActiveProject`

### 8.4 Type migration — with prior assertion in same document

```mdld
[my] <tag:hr@example.com,2026:>
# Project Alpha {=my:proj .my:ActiveProject}
# Project Alpha {=my:proj -.my:ActiveProject .my:ArchivedProject}
```

Streaming trace:
```
.my:ActiveProject    → quadBuffer.add(proj type Active)
-.my:ActiveProject   → quadBuffer.has() ✓ → quadBuffer.delete()        CANCEL
.my:ArchivedProject  → quadBuffer.add(proj type Archived)
```

Expected:
- `quads` contains `my:proj rdf:type my:ArchivedProject`
- `quads` does NOT contain `my:proj rdf:type my:ActiveProject`
- `remove` is **empty** — cancelled in-stream

### 8.5 Object triple remove

```mdld
[my] <tag:hr@example.com,2026:>
# Team {=my:team789}
[old member] {-?my:hasMember +my:emp123}
```

Streaming trace:
```
-?my:hasMember +my:emp123  → emitQuad(team hasMember emp123, remove=true)
                              quadBuffer.has()? NO → removeSet.add()
```

Expected:
- `remove` contains `my:team789 my:hasMember my:emp123`
- Literal `"old member"` absent — object triple, L is ignored as per normal routing

### 8.6 Reverse triple remove

```mdld
[my] <tag:hr@example.com,2026:>
# Chapter {=my:ch1}
[Book] {-!my:hasPart +my:book}
```

Expected:
- `remove` contains `my:book my:hasPart my:ch1`

### 8.7 Block carriers — all types

```mdld
[my] <tag:hr@example.com,2026:>
{=my:doc}
# Old Title {-label}
# New Title {label}
> old quote {-prov:value}
> new quote {prov:value}
```

Streaming trace:
```
-label "Old Title"     → removeSet.add(doc label "Old Title")
label "New Title"      → quadBuffer.add(doc label "New Title")
-prov:value "old..."   → removeSet.add(doc value "old quote")
prov:value "new..."    → quadBuffer.add(doc value "new quote")
```

Expected:
- `remove` contains `my:doc rdfs:label "Old Title"` and `my:doc prov:value "old quote"`
- `quads` contains `my:doc rdfs:label "New Title"` and `my:doc prov:value "new quote"`

### 8.8 Mixed polarity — same annotation

```mdld
[my] <tag:hr@example.com,2026:>
# Doc {=my:doc -.my:Draft .my:Published -my:version}
[2.0] {my:version}
```

Streaming trace:
```
-.my:Draft       → removeSet.add(doc type Draft)         no prior assertion
.my:Published    → quadBuffer.add(doc type Published)
-my:version "Doc" → removeSet.add(doc version "Doc")     no prior assertion
my:version "2.0" → quadBuffer.add(doc version "2.0")
```

Expected:
- `remove` contains `my:doc rdf:type my:Draft` and `my:doc my:version "Doc"`
- `quads` contains `my:doc rdf:type my:Published` and `my:doc my:version "2.0"`

### 8.9 Subject context unaffected by remove token

```mdld
[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Engineer] {-my:jobTitle}
[Alice] {my:name}
```

Expected:
- `remove` contains `my:emp456 my:jobTitle "Engineer"`
- `quads` contains `my:emp456 my:name "Alice"` — subject persisted through `-` token normally

### 8.10 Invalid `-=` — warning, not error

```mdld
[my] <tag:hr@example.com,2026:>
# Doc {-=my:doc .my:Article}
```

Expected:
- Parse warning emitted: `"-= is not valid, subject declarations have no polarity"`
- `=my:doc` processed normally, subject set
- `quads` contains `my:doc rdf:type my:Article`
- No crash, no data loss

### 8.11 Existing documents — fully unchanged

All existing fixture documents produce `remove: []`.
No existing test output changes.

### 8.12 Hard invariant — every test

`quads ∩ remove = ∅` asserted as a post-condition on every test in the suite.
A violation is a parser bug, not a user error.
