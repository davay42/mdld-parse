# mdld-shapes

**Zero-dependency SHACL Core validator for the MD-LD ecosystem.**

A single-file (~1,450 LOC), synchronous SHACL validator that achieves **100% parity with [shacl-engine](https://github.com/rdf-ext/shacl-engine)** on the W3C SHACL 1.2 Core test suite, with no external RDF libraries required — and doubles as a **projection engine**: the same shapes that validate also extract (`extract` / `extractGraph`).

```
validator.js  →  1,450 lines  →  0 dependencies  →  301/301 violations match
                          →  SHACL shape = schema for extraction, too
```

## Why

The MD-LD ecosystem needed a SHACL validator that:

- Ships alongside `mdld-parse` without pulling in the `rdf-ext` ecosystem
- Works in browsers, Deno, Bun, and edge runtimes (no Node-only deps)
- Uses the same `DataFactory` as `mdld-parse` (no factory-mismatch bugs)
- Is small enough to read, audit, and extend in a single sitting
- Produces the same results as the reference implementation

We tried `shacl-engine` first. It's excellent software — but its reliance on grapoi/clownface for RDF list traversal caused [subtle failures](https://github.com/mdld-js/mdld-shapes/issues/1) when paired with custom stores. Rather than fight the abstraction, we wrote a validator specialized to our stack.

## Quick Start

```javascript
import { validate } from './validator.js'
import { parse } from 'mdld-parse'

const { quads } = parse({ text: mdldString })
const report = validate({ quads })

console.log(report.conforms)   // true | false
console.log(report.results)    // array of ValidationResult
```

### Separate shapes and data

```javascript
const report = validate({ shapes: shapeQuads,  dataQuads })
```

### Stateful validator (reusable shapes)

```javascript
import { Validator } from './validator.js'

const v = new Validator(shapeQuads)
const r1 = v.validate(dataQuads1)
const r2 = v.validate(dataQuads2)
```

### CLI

```bash
node selftest.js
# 30 passed, 0 failed, 1 skipped — 31 demos in .../catalog.md
```

## Supported Constraints

### Value Type
| Constraint | Description |
|------------|-------------|
| `sh:class` | Value must be an instance of the given class (with `rdfs:subClassOf` traversal) |
| `sh:datatype` | Literal must have the given datatype |
| `sh:nodeKind` | `sh:IRI`, `sh:BlankNode`, `sh:Literal`, `sh:BlankNodeOrIRI`, `sh:BlankNodeOrLiteral`, `sh:IRIOrLiteral` |

### Cardinality
| Constraint | Description |
|------------|-------------|
| `sh:minCount` | Minimum number of values |
| `sh:maxCount` | Maximum number of values |

### Value Range
| Constraint | Description |
|------------|-------------|
| `sh:minInclusive` / `sh:maxInclusive` | Inclusive numeric/date bounds |
| `sh:minExclusive` / `sh:maxExclusive` | Exclusive numeric/date bounds |

### String-based
| Constraint | Description |
|------------|-------------|
| `sh:minLength` / `sh:maxLength` | String length bounds |
| `sh:pattern` (+ `sh:flags`) | JavaScript RegExp match |
| `sh:languageIn` | Language tag prefix match |
| `sh:uniqueLang` | Unique language tags |

### Property Pair
| Constraint | Description |
|------------|-------------|
| `sh:equals` | Same value set as another property |
| `sh:disjoint` | No overlap with another property |
| `sh:lessThan` / `sh:lessThanOrEquals` | Cross-property comparison |

### Logical
| Constraint | Description |
|------------|-------------|
| `sh:not` | Value must NOT conform to shape |
| `sh:and` | Value must conform to ALL shapes (RDF list) |
| `sh:or` | Value must conform to ≥1 shape (RDF list) |
| `sh:xone` | Value must conform to exactly 1 shape (RDF list) |

### Shape-based
| Constraint | Description |
|------------|-------------|
| `sh:node` | Value must conform to shape |
| `sh:property` | Nested property shape |
| `sh:qualifiedValueShape` + counts | Qualified cardinality |
| `sh:closed` + `sh:ignoredProperties` | Closed world (with implicit `rdf:type`) |

### Other
| Constraint | Description |
|------------|-------------|
| `sh:hasValue` | Must have specific value |
| `sh:in` | Value in RDF list |

### Property Paths
All 7 SHACL path types: `PredicatePath`, `InversePath`, `SequencePath`, `AlternativePath`, `ZeroOrMorePath`, `OneOrMorePath`, `ZeroOrOnePath`.

### Targets
`sh:targetClass` (with `rdfs:subClassOf` traversal), `sh:targetNode`, `sh:targetSubjectsOf`, `sh:targetObjectsOf`, and implicit class targets.

## API

### `evaluate(options) → { conforms, violations, records }`

The core operation — one traversal per (shape, focus node) produces **both views**: `violations` (what failed) and `records` (what conforms, as POJOs). They are mutually exclusive by construction: a value either violates or projects, never both.

```javascript
import { evaluate } from 'mdld-parse'

const report = evaluate({ quads, allowJS: true, context })
// report.conforms  — true when violations is empty
// report.violations — ValidationResult[] (same as validate().results)
// report.records    — { [shapeIRI]: { [nodeKey]: pojo } } (same as extract byNode)
```

| Option | Type | Description |
|--------|------|-------------|
| `quads` / `shapes`+`data` | `Quad[]` | Input graph (auto-classified or pre-split) |
| `shape` | `string` | Restrict evaluation to one shape IRI |
| `allowJS` | `boolean` | Opt-in `sh:js` execution — **default `false`** (untrusted shapes can't run code) |
| `context` | `Object` | Prefix map for messages and record keys |
| `byNode` | `boolean` | Key records by focus IRI — **default `true`** |
| `maxDepth` | `number` | Projection recursion cap — default `32` |

`validate()` and `extract()` are thin views over `evaluate()` — same evaluation, different projection. `sh:js` constraints honor `allowJS` identically in both views, so violations and records can never disagree.

### `validate(options) → { conforms, results }`

| Option | Type | Description |
|--------|------|-------------|
| `quads` | `Quad[]` | All quads (auto-classified into shapes + data) |
| `shapes` | `Quad[]` | Shape quads only (alternative to `quads`) |
| `data` | `Quad[]` | Data quads only (alternative to `quads`) |
| `classify` | `Function` | Custom quad classifier `(quad) => boolean` |

Returns `{ conforms: boolean, results: ValidationResult[] }`.

### `ValidationResult`

```javascript
{
  focusNode: Term,                    // The node being validated
  path: Term | null,                  // Property path (for property shapes)
  value: Term | null,                 // The offending value
  severity: Term,                     // sh:Violation | sh:Warning | sh:Info
  sourceConstraintComponent: Term,    // e.g., sh:MinCountConstraintComponent
  sourceShape: Term,                  // The shape that produced this result
  message: string | null,             // Human-readable message
}
```

### `Validator` class

```javascript
const v = new Validator(shapeQuads, { factory })
const report = v.validate(dataQuads)
```

### `createShapeDetector() → { classify, getStats, reset }`

Exported for users who want to classify quads themselves:

```javascript
const detector = createShapeDetector()
const isShape = detector.classify(quad)
```

### `extract(input, shapeIRI?, options?) → Object | Object[]`

Projects data through a shape into plain JavaScript objects — the SHACL shape acts as the extraction schema (the `rdf-lens` idea, zero dependencies). **Every emitted key is a validated fact, and every emitted record satisfies the node shape**: node-level constraints (`sh:closed`, `sh:not`, `sh:and`/`or`/`xone` on the node, …) gate whole records; each property is extracted only if its values conform to the property shape — offending fields are omitted, and focus nodes left with no conforming fields are dropped entirely. A missing key *is* the violation rendered structurally. (`sh:js` constraints run during projection only when `allowJS: true` is passed — js-guarded fields that fail are omitted, keeping projection and validation in sync.) For each extractable property it resolves `sh:path` values, uses `sh:name` (falling back to the path's local name) as the key, and casts literals by datatype: `xsd:integer`/`decimal`/etc. → `Number`, `xsd:boolean` → `boolean`, `xsd:date`/`dateTime` → `Date`, everything else → `string`.

"Extractable properties" means `sh:property` links **plus** PropertyShape members of `sh:and`/`sh:or`/`sh:xone` compositions (`sh:not` members are excluded — they describe what must *not* appear), and a shape's own `sh:path` when the shape is property-shape-like. `sh:deactivated` property shapes are skipped. `sh:node` and `sh:qualifiedValueShape` both recurse into nested POJOs; RDF lists (`rdf:first`/`rdf:rest`) become arrays; IRIs without a shape project to their IRI string.

```javascript
const pojo = extract({ quads })                     // first non-deactivated shape
const people = extract({ quads }, 'tag:ex,PersonShape')
// → [{ name: 'Alice', age: 30, address: { city: 'Paris' }, tags: ['a','b'] }]
```

`input` accepts `{ quads }`, `{ shapes, data }`, or a raw `Quad[]`. Options: `arrays: true` always emits arrays; `maxDepth` (default 32) bounds `sh:node` recursion — cycles degrade to the bare IRI; `byNode: true` returns `{ focusValue: pojo }` keyed by each target's value instead of a bare POJO/array — the deterministic per-entity form used by `cat:extractedPOJO`.

### `extractGraph(input, shapeIRI?, options?) → Quad[]`

Returns the sub-graph permitted by a shape: for each targeted node it keeps quads whose predicate is declared by a `sh:property` path (plus `rdf:type`), follows `sh:node` and `sh:targetClass` into nested entities, and includes RDF list chains whole. Useful for sanitizing graphs before handing them to agents or caching.

```javascript
const sub = extractGraph({ quads }, 'tag:ex,PersonShape')
// → only Person/Address quads the shapes declare — no undeclared predicates
```

## Honest Limitations

This validator is intentionally scoped. Here's what it **doesn't** do, and why:

### Out of Scope

| Feature | Status | Reason |
|---------|--------|--------|
| **SHACL-SPARQL** (`sh:sparql`, `sh:targetWhere`) | ❌ Not supported | Requires a SPARQL engine — out of scope for a zero-dep validator |
| **SHACL-JS** (`sh:js` + `sh:script`) | ⚠️ Opt-in | Executes arbitrary JS — enable only for trusted shapes via `allowJS: true` |
| **SHACL-AF** (rules, inference, functions) | ❌ Not supported | Different use case; can be added as a separate package |
| **SHACL-UI** | ❌ Not supported | Orthogonal concern |
| **Full RDFS entailment** | ⚠️ Partial | Only `rdfs:subClassOf` for `sh:class`; no `rdfs:subPropertyOf`, no domain/range inference |
| **`sh:targetWhere`** | ❌ Not supported | SPARQL-based target |
| **Custom severity schemes** | ⚠️ Basic | Honors `sh:severity` on shapes but doesn't compute severity hierarchies |
| **`sh:deactivated` propagation** | ⚠️ Basic | Honors `sh:deactivated` on individual shapes but not inherited |
| **`sh:message` templating** | ⚠️ Basic | Returns `sh:message` strings verbatim; no `{$value}` substitution |
| **Streaming / large datasets** | ⚠️ Not optimized | In-memory; fine up to ~100K quads, not tested beyond |
| **Async API** | ❌ Sync only | SHACL Core is pure graph traversal — no I/O needed |

### Behavioral Differences from shacl-engine

Despite 100% parity on the test suite, these subtle differences exist:

- **Cycle detection**: We use optimistic cycle-breaking (return `conforms: true` on recursion). `shacl-engine` uses lazy compilation with different cycle semantics.
- **Error messages**: Our error messages are simpler. We throw on malformed RDF lists; `shacl-engine` may produce different error shapes.
- **Unknown constraints**: We silently skip unknown constraint components (forward compatibility). `shacl-engine` may warn.
- **Factory assumption**: We assume all terms come from the same factory. Mixing factories may cause `termEquals` to fail.

### Performance

Measured on Apple Silicon (reused `Validator` — shape work is cached):

| Dataset | Data quads | Violations | Time |
|---------|-----------|------------|------|
| 100 products | 521 | 20 | 26ms |
| 1,000 products | 5,187 | 200 | 33ms |
| 5,000 products | 25,931 | 1,000 | 129ms |

≈200K quads/sec on a 5-constraint product shape; scales linearly.

The `Store` implementation is a thin wrapper over `Set<Quad>` with linear `match()`. For very large datasets, an indexed store would be faster — but MD-LD's use case is small-to-medium shapes.

### Projection performance

`extract`/`extractGraph` cost ≈1.3–1.4× `validate()` on the same graph
(conformance gating reuses the validator; constraint-free shapes skip the gate,
and per-shape metadata is compiled once into a cached projection plan).
Measured on Apple Silicon, 4-property Person shape with nested `sh:node` +
RDF list:

| Entities | Data quads | validate | extract | extractGraph |
|----------|-----------|----------|-------------|-----------------|
| 100 | 1,100 | 9ms | 19ms | 14ms |
| 1,000 | 11,000 | 50ms | 62ms | 67ms |
| 10,000 | 110,000 | 448ms | 631ms | 803ms |
| 25,000 | 275,000 | 1,149ms | 1,634ms | 2,016ms |

≈15K entities/sec extraction. Comfortable to ~25K entities / ~300K quads
per call; beyond that, shard by target or wait for the indexed store.

## Architecture

```
validator.js (~1,450 LOC)
├── Namespaces & constants      (~30 LOC)
├── Term helpers                (~50 LOC)  termKey, termEquals, isLiteral
├── Store                       (~40 LOC)  Minimal RDF/JS DatasetCore
├── Graph helpers               (~60 LOC)  valuesOf, readList, instancesOf
├── Shape detector              (~50 LOC)  Two-pass classification
├── Constraint extraction       (~90 LOC)  Parse shapes into constraint objects
├── Target resolution           (~40 LOC)  Resolve focus nodes
├── Property paths              (~80 LOC)  All 7 path types
├── Constraint evaluation       (~250 LOC) All ~30 components
├── Validation engine           (~100 LOC) Node/property validation
├── Projection                  (~330 LOC) extract / extractGraph
└── Public API                  (~30 LOC)  validate, Validator, createShapeDetector, extract*
```

**Key design decisions:**

- **Sync, not async.** SHACL Core is pure graph traversal — no I/O needed.
- **No graph-pointer library.** Direct `match()` calls are faster and clearer than grapoi's fluent API for our use case.
- **Single factory.** Uses `mdld-parse`'s `DataFactory` everywhere — no factory mismatch possible.
- **RDF lists as plain arrays.** `readList()` returns `Term[]` — no iterator protocol gymnastics.
- **Recursion via visited-set.** Track `(shapeTerm, focusNode)` pairs to detect cycles.

## Comparison with shacl-engine

| Feature | shacl-engine | mdld-shapes |
|---------|--------------|-------------|
| Dependencies | 11 npm packages | 0 |
| Bundle size | ~200 KB + transitive | ~40 KB |
| API | Async | Sync |
| SHACL Core | ✅ Full | ✅ Full |
| SHACL-SPARQL | ✅ Supported | ❌ Out of scope |
| SHACL-JS | ❌ Not supported | ⚠️ Opt-in (`allowJS`) |
| SHACL-AF | Partial | ❌ Out of scope |
| Custom stores | Requires grapoi compat | Works with any DatasetCore |
| Factory flexibility | Any RDF/JS factory | Specialized to mdld-parse |
| Readability | Complex abstractions | ~1,100 LOC, single file |

## Migration from shacl-engine

```javascript
// Before (shacl-engine)
import Validator from 'shacl-engine/Validator.js'
const validator = new Validator(shapesDataset, { factory })
const report = await validator.validate({ dataset: dataDataset })

// After (mdld-shapes)
import { validate } from './validator.js'
const report = validate({ shapes: shapesQuads,  dataQuads })
```

**Breaking changes:**
- Sync API (no `await`)
- No SPARQL/AF support; SHACL-JS only with explicit `allowJS: true`
- Different error shapes on malformed input

## The Self-Validating Loop

```bash
node selftest.js   # the whole loop, one command — ~0.17s: 33 demos
                   # validated, message-checked, extracted, round-tripped
```

The catalog is not documentation *about* SHACL — it is SHACL. Five closed
loops keep `ontology.md`, `catalog.md`, and `validator.js` synchronized:

1. **Coverage** (ontology → catalog) — every `sh:` property defined in
   `ontology.md` (the W3C vocabulary, ground truth) must be accounted for in
   `catalog.md` as `demo` / `included` / `section` / `notCovered`.
2. **Sync** (catalog ↔ validator) — every term the catalog presents as
   covered must exist in `SUPPORTED_VOCABULARY` (exported from
   `validator.js`); implemented-but-marked-`notCovered` terms are reported.
3. **Demos** (catalog → validator) — every `cat:Demo`'s `cat:demo` source is
   re-parsed and validated; the violation count must equal
   `cat:expectedViolations`, and every `cat:expectedViolationMessage` literal
   must substring-match an actual violation's rendered message.
4. **Extraction** (catalog ↔ projection) — every demo declares its canonical
   extraction as a `~~~~~~json {cat:extractedPOJO}` block
   (`{ shape → focus → pojo }`, IRIs shortened by the demo's `[ex]` prefix),
   verified deep-equal against live `extract` output — regenerate with
   `node gen-extracted.js`.
5. **Self** (catalog → catalog) — the catalog's own SHACL shapes (`cat:self`
   section) run against the catalog graph: every demo must carry `cat:demo`
   source and, unless `cat:notCovered`, a `cat:expectedViolations` integer —
   enforced by `sh:or` over `cat:HasExpectedShape` / `cat:IsNotCoveredShape`,
   no procedural code.

Two further checks guard the machinery itself: a **projection** section
exercises `extract`/`extractGraph` on hand-built quads (typed casts,
nested `sh:node`, RDF lists, predicate filtering), and a **document round-trip**
guard verifies `parse(text) → generate(quads) → parse()` is quad-identical
(521 quads, 0 diffs). The catalog is canonical MD-LD — what you read is
exactly what the quads say.

**The contract.** Together these checks make each demo a deterministic
pathway through the graph: the *message* is the contract (what went wrong,
in the shape's own words), the *POJO* is the guarantee (that what remains
is meaningful, conforming data). Count proves arity, message proves
identity, extraction proves projection — a demo is verified only when all
three agree.

### Demo conventions

Each demo is a `cat:Demo` node: `{=cat:demo/<name> .cat:Demo ?cat:hasDemo}`,
an `Expects \`N\` {cat:expectedViolations ^^xsd:integer}` line, and a
`~~~~~~md {cat:demo}` fence containing a complete MD-LD world. Demos are
written as *stories* — each fenced world speaks in its own document voice
(see `research.md` for the model), not as descriptions of validation.

Authoring rules learned the hard way:

- `[brackets]` are literal carriers — `"quotes"` produce no quads.
- Link text becomes the literal value — `[jam] {ex:p ^^xsd:integer}` yields
  `"jam"^^xsd:integer`.
- Annotations bind to the *current subject* — moving `{+ex:X ?sh:path}`
  between paragraphs silently re-binds the constraint.
- `{$value}`/`{$path}`/`{$focusNode}` templates work in `**bold**` and
  `##`-heading `sh:message` carriers.
- Nested fences inside `~~~~~~` carriers are preserved (parser fix in
  `parse.js`) — inner ```` ```js ```` blocks keep their annotations.

### Trust boundary

`sh:js` executes arbitrary JavaScript — **disabled by default**. Enable only
for trusted shapes: `validate({ quads, allowJS: true })` or
`new Validator(shapeQuads, { allowJS: true })`. `selftest.js` opts in
explicitly because the catalog is trusted. Never enable on crawled or
untrusted documents.

**Current status:** 32/32 demos pass, 0 skipped; 32/32 `cat:extractedPOJO`
blocks verified against `extract`; catalog conforms to its own
shapes; 101/101 ontology terms accounted for; 0 sync failures.

## Roadmap

- [x] ~~Implement `sh:message` template substitution~~ — done: `{$value}`, `{$path}`, `{$focusNode}`
- [ ] Run the full [W3C SHACL 1.2 test suite](https://github.com/w3c/data-shapes/tree/gh-pages/shacl12-test-suite) and report coverage
- [ ] Story-ify remaining demos (each in its own document voice)
- [ ] Add indexed store for large datasets (>100K quads)
- [ ] Publish to npm as `@mdld/shapes`
- [ ] Add browser bundle for SHACL Playground integration

## License

Same as `mdld-parse`. See the [mdld-parse repository](https://github.com/mdld-js/mdld-parse) for licensing details.

## Acknowledgments

- [shacl-engine](https://github.com/rdf-ext/shacl-engine) — the reference implementation we validated against
- [W3C SHACL 1.2](https://www.w3.org/TR/shacl12-core/) — the specification we implement
- [mdld-parse](https://github.com/mdld-js/mdld-parse) — the parser we integrate with

---

**Status:** ✅ Production-ready for SHACL Core use cases

**Verified against:** shacl-engine 1.1.3 on the `shacl-demo.md` test suite (301 violations, 0 differences)

**Lines of code:** ~1,450 (validator.js)

**Dependencies:** 0 (excluding mdld-parse)

---

## Shapes-Driven Knowledge Curation

Shapes are not only validators — they are **specifications of a complete graph**. The curation loop turns validation into knowledge building:

1. **Write the ideal shapes first** — declare what a *finished* document looks like (required properties, types, counts), even where the data doesn't exist yet
2. **`validate()` → violations are the work list** — each violation names a specific, checkable gap between what exists and what the domain requires
3. **Fill the graph with real content** — write the missing facts as natural prose; carriers carry the semantics
4. **Re-validate until green** — `conforms: true` is the deterministic completion signal; no human judgment needed
5. **`extract()` verifies the payoff** — the same shapes project the curated data into typed JSON; the shape is simultaneously the spec, the contract, and the schema

This inverts the usual workflow: instead of describing the graph you have, shapes prescribe the graph you want. For agents it is a self-driving loop — `validate → fix prose → re-validate` converges mechanically. Demonstrated in `examples/demo/research.md` (Dataset/Activity/Person curation shapes) and `examples/demo/journal.md` (prototype-targeted class hierarchy).

Two principles keep curation honest:

- **Prototype targeting scales rules** — `targetClass prov:Entity` reaches every `j:Record` subclass, so common requirements (mandatory `rdfs:label`) apply everywhere through one shape
- **Extraction exposes data-quality bugs validation can't see** — `sh:minCount` checks presence, not lexical validity; `"80,000"^^xsd:integer` passes validation but fails the `Number` cast in `extract()`. Typed projection is the second, stricter gate.

## Specification

*Merged from the former `spec.md` — this README is now the single metadocument for the catalog and its validation loop.*

### Philosophy

mdld-shapes validates RDF data against SHACL shapes on mdld-parse's own principles: zero dependencies, compact (~1,000 LOC), readable in one sitting, deterministic, synchronous. It does one thing — quads in, validation report out — by walking the graph with `match()` calls.

### Scope

**In scope — SHACL Core** (W3C REC-shacl): every SHACL 1.1 Core constraint component except `qualifiedValueShapesDisjoint` — deprecated upstream, absent from the SHACL 1.2 Core WD — plus all target types, all property path types, logical constraints (`not`/`and`/`or`/`xone`), qualified counts, closed shapes, severity/message/deactivated, and `sh:js` (opt-in via `allowJS`).

**SHACL 1.2 Core WD additions not yet implemented:** list constraints (`memberShape`, `minListLength`, `maxListLength`, `uniqueMembers`), `singleLine`/`flags`, `subsetOf`, `someValue`, RDF-star reification components, `rootClass`, `uniqueValuesFor`, and the SPARQL-dependent targets (`targetWhere`, `sh:shape`, `sh:ShapeClass`).

**Out of scope:** SHACL-SPARQL (`sh:sparql`, `sh:targetWhere`, `sh:ask`/`select`/`construct`/`update`), SHACL-AF (rules, functions, entailment regimes), SHACL-UI, `sh:jsLibrary*`/`jsFunctionName` (external libraries are never fetched), full RDFS entailment (only `rdfs:subClassOf` for `sh:class`/targeting and `rdfs:subPropertyOf` for property-pair constraints), `qualifiedValueShapesDisjoint`.

### Integration with mdld-parse

- Uses mdld-parse's `DataFactory` — no factory-mismatch bugs.
- Accepts `{ quads }` (auto-classified), `{ shapes, data }`, or a stateful `Validator`.
- `createShapeDetector()` exported for custom classification.

### Internal data model

- **`Store`** — `Set<Quad>` with subject/predicate indexes; `match(s,p,o,g)` returns a sub-store.
- **Graph helpers** — `valuesOf`, `subjectsOf`, `valuesOfWithSubProps` (rdfs:subPropertyOf entailment), `readList` (rdf:first/rest → `Term[]`, throws on cycles/malformed lists), `instancesOf` (rdf:type + rdfs:subClassOf closure).
- **Shape detector** — two-pass quad classification: `rdf:type sh:NodeShape|PropertyShape`, any `sh:*` predicate, known shape subjects, and shape-related rdf:List chains.

### Target resolution

`sh:targetClass` (with subClassOf traversal), `sh:targetNode`, `sh:target` (generic, treated as targetNode), `sh:targetSubjectsOf`, `sh:targetObjectsOf`. Focus nodes are deduplicated per shape.

**Subclass-aware targeting & meta-modeling.** `instancesOf` closes over `rdfs:subClassOf` in the correct direction: `targetClass prov:Person` focuses every instance typed `prov:Person` *or* any class declared `rdfs:subClassOf prov:Person` (e.g. `edu:Teacher`, `edu:Student`) — see `cat:demo/subclass`. The same machinery makes shapes able to target `rdfs:Class` itself, validating class *declarations* (labels, comments) as first-class nodes — shapes describing shapes is just another graph.

### Constraint dispatch

All ~30 components are evaluated in `evalConstraint` by name (`ClassConstraintComponent`, `MinCountConstraintComponent`, …). Unknown components are skipped silently (forward compatibility). Property-level components (counts, equals, disjoint, lessThan*, uniqueLang, hasValue, qualified counts, closed) evaluate once per path; all others evaluate per value node.

### Property paths

All path types resolve through `resolvePath`: predicate IRIs, and complex structures on **any term type** — `hasPathStructure()` detects `sh:inversePath`/`alternativePath`/`zeroOrMorePath`/`oneOrMorePath`/`zeroOrOnePath` or `rdf:first`/`rdf:rest` list heads. MD-LD expresses these with IRIs instead of blank nodes. Sequence paths are RDF lists of steps.

### Recursion & cycle detection

`(shapeTerm, focusNode)` pairs are tracked in `ctx.visited`; revisiting returns `conforms: true` (optimistic cycle-breaking), then the key is removed so sibling branches can re-validate.

### SHACL-JS

`sh:js` → `sh:JSConstraint` → `sh:script` literal. Compiled once per constraint (`ctx.jsCache`) via `new Function('value','term','focusNode','values','graph','termEquals','valuesOf', src)` — same realm, validator helpers in scope, `value` bound to the lexical form. **Disabled by default**; requires `allowJS: true`. Missing `sh:script` or compile errors throw.

### sh:message templating

`{$value}`, `{$path}`, `{$focusNode}` placeholders are substituted per violation.

### Error handling

Malformed RDF lists and missing `sh:script` throw with context. Everything else degrades to violations, never crashes.

### Testing strategy

`selftest.js` is the canonical suite — the catalog is its own test suite:

1. **Coverage** — every `sh:` property in `ontology.md` accounted for in `catalog.md`.
2. **Sync** — covered terms must exist in `SUPPORTED_VOCABULARY`.
3. **Demos** — every `cat:Demo` re-parsed and validated against `cat:expectedViolations`, and its `cat:extractedPOJO` block verified against `extract`.
4. **Self** — the catalog's own `cat:self` SHACL shapes must conform.

```bash
node selftest.js   # 32/32 demos + extractedPOJO, 0 self-violations, 101/101 terms
```

### Compliance

SHACL Core constraint/target/path surface is implemented and demo-verified — **complete for SHACL 1.1 Core** except `qualifiedValueShapesDisjoint` (deprecated in the 1.2 WD), with the 1.2 WD additions listed above as future work. Message-template edge cases beyond `{$value}`/`{$path}`/`{$focusNode}` and deep RDFS entailment remain the honest remainder.

## Ontology Packs (`ontologies/*.shapes.md`)

Beyond the SHACL spec catalog, `ontologies/` ships **validation packs** — one `*.shapes.md` companion per core vocabulary (`rdf`, `rdfs`, `xsd`, …). Each pack is a self-contained seed: shapes for that vocabulary's constructs, `pack:Demo` nodes carrying source + `pack:expectedViolations` + `pack:extractedPOJO` contracts in the graph itself.

```bash
node ontologies/selftest.mjs   # verifies every pack + its demos
```

The `pack:` predicate vocabulary mirrors `cat:` catalog conventions (`pack:Demo`, `pack:demo`, `pack:expectedViolations`, `pack:extractedPOJO`), so packs are catalog continuations — merge a pack with any data document and `evaluate()` enforces the vocabulary's structural rules.
