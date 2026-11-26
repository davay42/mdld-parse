# Closure: How Loops Turn Claims Into Facts

Every README is a list of promises. *Round-trip safe. Standards compliant.
Lossless. Deterministic.* These words are cheap — nothing in the repository
would notice if they became false. A promise requires trust. A **closure loop**
is the opposite: a composition of operations that returns to its starting
space carrying an invariant that must hold on arrival. If the claim is false,
the loop fails loudly, on every commit.

MD-LD's claims are not decoration — they are the *output* of mechanisms that
ship in the tarball. This document enumerates every invariant closure in the
system, what each composes into, and where closure honestly stops.

## Closure requires decidable equality

Before any loop can close: **are these two graphs the same?**

MD-LD answers it with a sort and a serializer. Every node is a named IRI, and
`generate()` normalizes quads into a total order — subject, predicate, object,
term type, datatype, language — so canonical text is a function of the quad
*set*, not the input array:

```js
generate(g1).text === generate(g2).text
```

The no-blank-nodes rule is what makes this cheap. Banning anonymous identity
collapses graph equality to string equality — no canonicalization algorithm,
no isomorphism search. **Named identity → decidable equality → runnable
closure.** Every other loop depends on this one.

## Two species of loop

- **Conservation loops** assert nothing is lost — `g(f(a)) ≡ a`. Round-trip,
  HTML codec, canonical fixed point. Statements about *fidelity*.
- **Admission loops** assert nothing false passes — projections, not
  identities. `evaluate()` splits a graph into violations and records;
  `extract()` emits only conforming fields. Statements about *integrity*.

Nothing lost, nothing false — the fidelity/integrity pair any knowledge
system needs and almost none assert mechanically.

## Loop I — The fixed point

MD-LD text is a *rendering* of truth, not a container of it:

```
quads ──generate()──▶ canonical MD-LD ──rewrite prose──▶ parse() ──generate()──▶ same text?
```

The precise invariant is canonical **idempotence**:

```
generate(parse(canonical)) ≡ canonical
```

```js
import { parse, generate } from 'mdld-parse'
const text = `# Alice {=ex:alice .prov:Person label}
[Alice] {ex:name} knows [Bob] {+ex:bob ?ex:knows}`
const once = generate(parse({ text }).quads).text   // canonical form
const twice = generate(parse({ text: once }).quads).text
once === twice   // → true — fixed point reached, prose is now free to vary
```

Prose can vary freely — a human rewrites every sentence, an agent translates
the document — and the transformation is graph-preserving iff the canonical
projection is unchanged. "Did I break the data by editing the story?" becomes
computation, not care. An agent that never touches bracket syntax works in
quads — the thing it is most reliable at — and `generate()` compiles them into
flawless text. Syntactic hallucination has no surface to occur on.

## Loop II — The codec

`render()` and `deconstruct()` establish HTML as a carrier, not a sink:

```
MD-LD → render() → HTML → deconstruct() → MD-LD → parse() → quads
```

```js
import { parse, render, deconstruct } from 'mdld-parse'
const html = render(text)                        // MD-LD → semantic HTML
const md2 = deconstruct(html)                    // annotations survive as data-*
const quads = parse({ text: md2 }).quads         // same graph, back through text
```

Annotations survive as `data-annotation` attributes; `deconstruct()`
recognizes only `mdld-*` elements and passes everything else through verbatim.
Server-side and client-side rendering are *equivalent*, not merely similar —
the choice is deployment (SEO vs offline-first), not architecture. The lossy
mode (`render(parse(mdld).md)` strips annotations) is opt-in and explicit:
losslessness is the default; loss is a decision, not an accident.

## Loop III — The gate

`evaluate()` performs one traversal and returns two views:

```js
const { violations, records } = evaluate({ quads })
// mutually exclusive by construction
```

Separate validate/extract paths could disagree — different traversal orders,
different caches, different edge cases. Single traversal makes disagreement
structurally impossible: they are not two computations. `validate()` and
`extract()` are thin projections over one result — **every key in the output
is a validated fact**. Two-tier gating: node-level constraints drop whole
records; property-level constraints drop individual fields. A product with a
negative price appears *without* the price key — the absence is the signal.
```js
import { evaluate } from 'mdld-parse'
const { conforms, violations, records } = evaluate({ quads, context })
// records.Product['ex:p1'].price — absent when the price violates;
// the key's presence IS the proof it passed every constraint
```

Downstream consumers cannot receive invalid data; there is no `if (valid)`
branch to forget. The type of the output is the guarantee.

## Loop IV — The triangle

Every spec implementation drifts along three axes: what the spec says, what
the code does, what the docs claim. MD-LD locks all three with set-equality:

- **Coverage** — every `sh:` term in `ontology.md` (W3C ground truth) is
  accounted for in the catalog
- **Sync** — every covered term exists in `SUPPORTED_VOCABULARY`

Spec ↔ documentation ↔ implementation, checked bidirectionally, 101/101
terms. "Full SHACL Core surface" is an accounting, not a boast — and the
accounting forces *declared* exclusions (`qualifiedValueShapesDisjoint`,
SHACL-SPARQL, SHACL-AF). Complete coverage accounting and silent gaps cannot
coexist; the loop makes omission visible, which makes honesty the path of
least resistance.

```bash
node shapes/selftest.js   # coverage: every sh: term accounted for or declared-excluded
```

## Loop V — The seeds

`catalog.md` holds 33 executable worlds — each simultaneously documentation,
test fixture, and expected output. `selftest.js` closes five loops in one
command; `ontologies/*.shapes.md` packs do the same for core vocabularies,
each a self-verifying seed carrying source, expected violations, and expected
POJOs in the graph itself.

The circularity danger is handled explicitly: `gen-extracted.js` regenerates
`cat:extractedPOJO` blocks *using the engine under test* — alone that would be
a tautology. The design anchors on `cat:expectedViolations`, a
**hand-authored integer** — a human decided this world produces exactly four
violations. The machine-regenerated POJOs are a *drift* guard layered on a
*meaning* anchor. **Humans fix meaning, machines guard stability.**

```js
// every cat:Demo node IS the fixture: source fence + expectedViolations +
// extractedPOJO literal — selftest.mjs verifies all three against live output
```

For agents this is the bootstrap: 33 small business stories with shapes, data,
expected violations, and expected extractions — worked examples guaranteed
current because the guarantee is executed, not promised.

## Loop VI — Origin

Every parse emits origin tracking: `quadIndex`, blocks, spans. Spans store no
text — content is recovered by slicing source — so the topology is free.
`locate(quad, origin)` returns a byte range and `valueRange`; `updateValue()`
writes back into the correct carrier.

A SHACL violation has `focusNode`, `path`, `value`, `component`. With origin
it is a **position in prose** — a caret in an editor, a red underline on a
carrier, a click that scrolls to the sentence. The machine's objection becomes
something a human who doesn't think in graphs can act on.

```js
import { parse, locate, updateValue } from 'mdld-parse'
const { quads, origin } = parse({ text })
const q = quads.find(q => q.subject.value.endsWith('alice'))
const pos = locate(q, origin)          // → { start, end, valueStart, valueEnd }
updateValue({ text, quad: q, value: 'Alicia' })  // writes back into the carrier
```

## Loop VII — Merge

Append-only documents with polarity (`+`/`-`) and a hard invariant:
`quads ∩ remove = ∅`. Assertion and retraction sets are disjoint by
construction. Merge replays deterministically; the four-document replay chain
is tested.

Multi-writer collaboration without coordination: no locks, no server, no
operational transform. A researcher agent asserts, a critic retracts, a human
reviews the diff — merge is a function of the documents, not arrival order.
Git becomes the transaction log because the semantics are replayable.

```js
import { merge } from 'mdld-parse'
// doc A asserts, doc B retracts — quads ∩ remove = ∅ by construction;
// merge([A, B]) is a pure function of the documents, order-independent
const merged = merge([docA, docB])
```

## Loop VIII — The Gestalt loop (vision)

SHACL is a local logic engine — exceptional at per-node rules, blind to global
topology. It cannot say "you have an island of 50 orphaned nodes" or "these
predicates are never used." The human eye can — in milliseconds, in parallel,
for free.

`<quad-graph>` (Canvas2D, ~820 LOC, inside the single-file bundle) closes the
loop between the graph and human spatial intuition:

```
quads → <quad-graph> → human retina → spatial intuition → natural language → agent → quads
```

The division of labor is deliberate: **the human is the vision encoder, the
agent is the execution engine.** The agent never sees pixels — it operates on
the JS quad arrays. The human spots the anomaly ("top right, an isolated
cluster of tasks not linked to any project") and translates the visual pattern
into a semantic instruction; the agent executes the fix deterministically.
This bypasses multimodal AI entirely — no vision models, no spatial
hallucination surface, no screenshots.

Orphan detection, dead predicates, asymmetric density — topology SHACL cannot
express becomes perceivable. `evaluate()` proves the trees; the graph shows
the forest. Importing `mdld-parse` in a browser registers `<quad-graph>`
automatically; in Node it exports `undefined` — the loop is present but
dormant where there's no retina to serve.

```html
<script type="module">
  import { parse } from 'mdld-parse'   // registers <quad-graph> automatically
  const g = document.querySelector('quad-graph')
  g.quads = parse({ text }).quads      // topology appears; the eye audits it
</script>
```

## Loop IX — The workbench

`evaluate()` already splits the graph into violations and records;
`recordTable()` closes the human side of Loop III by rendering each record as
a semantic HTML table — escaped text, `<time>` dates, nested POJOs and arrays,
no CSS required.

```
quads → evaluate() → records → recordTable() → readable tables in place
                 └→ violations → curation tasks → shapes+js → text vortices → knowledge
```

The point is not a prettier JSON dump. A folder of `.md`/`.mdld` files plus
`mdld-parse.js` becomes a workbench: open a document, see admitted facts as
tables, and read violations as the driving force of a Shapes Driven Knowledge
Curation cycle. Each violation is a task — focus node, path, value, component,
message — and shapes + `sh:js` turn those tasks into text vortices that pull
prose toward meaningful knowledge. Drive violations to zero, then improve the
shapes themselves — clearer `sh:name` keys, tighter paths, better `sh:message`
text — so validation keeps authoring the schema instead of merely checking it.

```js
import { parse, evaluate, recordTable } from 'mdld-parse'
const { quads, context } = parse({ text })
for (const [shape, nodes] of Object.entries(evaluate({ quads, context }).records))
  for (const [node, pojo] of Object.entries(nodes))
    out += `<h3>${shape} › ${node}</h3>${recordTable(pojo)}`
```

The whole loop still fits in the single file: parser, canonical generator,
SHACL evaluator/projection, record renderer, live editor, and graph cortex —
about 60 kB gzip — enough to carry text → quads → tables → violations → shapes
→ text vortices → knowledge without leaving the document.

## The composition

```
agent builds quads in JS
  → generate()            syntax guaranteed        (Loop I)
  → rewrite prose         narrative freedom
  → parse() → generate()  graph preservation       (Loop I)
  → evaluate()            meaning admitted         (Loop III)
  → extract()             only validated facts     (Loop III)
  → recordTable()         admitted facts readable  (Loop IX)
  → <quad-graph>          topology perceived       (Loop VIII)
  → JS iteration          business logic
```

Each stage inherits its own invariant; each failure is **local and named** —
this focus node, this path, this value, this constraint component, with a byte
range attached (Loop VI). The agent's search space collapses from "rewrite
everything" to "change this."

Two properties complete the picture:

- **Views are projections, not copies.** `generateNode()`/`extract()`/filtered
  `generate()` derive any lens — address book, org chart, audit view — from the
  source graph on demand. No sync protocol, no stale cache: the view is always
  a function of the source.
- **Document trees keep provenance.** Parsing with `graph: path` stamps every
  quad with its source document; `merge()` preserves per-document origin, so
  `locate()` on any merged quad reaches the exact characters in the exact file
  that authored it. File systems, chat logs, and version histories all map to
  the same mechanism — the tree is a naming convention, not a coupling.

Under shaped evaluation, a plausible-but-empty graph (invented predicates,
`isRelatedTo`/`hasConnection`/`linksTo` meaning the same thing) produces
thousands of violations and an empty `records` set. The system is *blind* to
it — perception is gated by conformance.

## Where closure honestly stops

- **Coherence, not correspondence** — a perfectly closed system can be
  perfectly wrong about the world. No loop detects error between graph and
  reality. PROV is in the core five for this reason: loops establish the
  graph is well-formed and faithfully carried; provenance establishes who
  claimed it, when, from what. RDF for structure, RDFS for classification,
  XSD for values, SHACL for admission, PROV for attribution — each minimally
  necessary.
- **Document scope** — named graphs are not serialized; round-trip is proven
  per-document, not dataset-wide isomorphism
- **No blank nodes** — excluded by fiat, not handled
- **No SHACL-SPARQL / SHACL-AF** — declared out of scope
- **Vision is human** — `<quad-graph>` renders topology but does not *judge*
  it; the gestalt oracle is the person looking at the canvas

Boundaries are stated rather than discovered — the difference between a
boundary and a hole.

## Why a closed loop is so important

Assurance is normally purchased — vendor QA, audits, certifications, SLAs.
Closed loops shipped inside the artifact make assurance **computable instead
of purchasable**:

```bash
npm run test-shapes
```

One command returns what used to require an institution: 33 worlds verified,
every extraction verified, zero self-violations, 101/101 terms accounted for.
The evidence is *readable* — small business stories in Markdown, not an
opaque conformance report. Anyone can run the proof; no one can own it.

## Coda

The architecture lasts because the artifact carries its own verification.
Software rots when claims outlive their checking. A system whose claims are
the outputs of executed loops cannot rot that way — either the loops still
close, or you know immediately that they don't.

Quads are truth. Canonical text is its rendering. Shapes are the contract.
The catalog is the proof. The graph is the mirror. Every one of those is a
sentence you can check rather than a sentence you have to believe.
