# MD-LD evolution

## v1.2.6 canonical labels & single-file condensation

### Fixed
- **`generate()` preserves label literals** — `rdfs:label` selection now keeps the exact literal term (value + language + datatype) and emits `label @lang` / `label ^^datatype` in headings, inline object annotations, and reverse annotations; same-value labels with different language/datatype tags no longer collapse on round-trip
- **Literal carriers are content-aware** — empty literals use `[]`; multiline or carrier-hostile values use fences matched to the longest content run; bracket/code/emphasis styling is only used when the value cannot merge with delimiters
- **`Literal` serialization escapes backslashes** — values containing `\`/`"` sequences now round-trip through `DataFactory.literal()`/`fromTerm()` instead of collapsing escape pairs

### Changed
- **Validator readability** — `extractConstraints` is now an ordered spec table; count/length/range checks are table-driven; property/node-level component sets are hoisted without changing emission order or public API
- **Parser/highlight condensation** — removed dead `shared.js` exports, fake regex-match list tokens, repeated tokenizer whitespace/attribute splitting, a duplicate scanner case, and highlight delimiter/marker branches; graph localStorage stores share one factory; URI scheme checks are unified
- **Canonical round-trip stress coverage** — stochastic test sweeps unicode, markdown markers, tabs/newlines, languages, and datatypes across 1,260 literals with a noise/signal estimate

### Build
- **ES2022 library target** — drops private/static-field helpers from `dist/mdld-parse.js`; the single-file export remains the contract (~223.3 kB unminified)
- **Verification** — 192 parser tests plus shapes/ontology self-tests pass

## Unreleased — `<quad-graph>` interaction & persistence

### Added
- **Hover neighborhood highlighting** — hovering a node now dims the rest of the graph and highlights its direct connections (edges + neighbor nodes) at ~50% strength, mirroring select at 100%. Neighbor labels appear subject to normal collision rules. Select stays dominant when both apply
- **Smooth highlight fades** — dimming and highlighting ease in/out over ~200 ms via two frame-loop scalars (`_fade`/`_fdim`) instead of snapping, eliminating flicker when sweeping across clusters. The last highlight set is retained while fading out
- **`persist` property (opt-in)** — `graph.persist = true` persists layout across reloads via `localStorage`:
  - **Positions**: shared ring buffer `qg:positions` (~12k entries, oldest-first eviction) keyed by a 64-bit cyrb53-style hash of each IRI — no plaintext IRIs at rest; shared by all `<quad-graph>` instances so nodes keep positions across documents and edits
  - **Viewport**: per-document entry in `qg:views` (64-entry ring) keyed by an order-independent hash of the quad set; anchored to the node nearest screen-center with its pixel offset, falling back to the absolute transform — resize-robust
  - Saves on `settled`, throttled during view changes, `pagehide`, and `disconnectedCallback`; all storage access guarded
- **Store-seeded layouts reheat gently** — positions restored from the store start the simulation at `alpha = 0.25` instead of a full reheat, keeping refreshed layouts visually stable

### Changed
- **Predicate (edge) labels** enlarged 9px → 11px with adjusted collision metrics, matching node label size
- **`<mdld-editor>` custom element** (~55 LOC inside `src/highlight.js`, zero-dependency) — a transparent `<textarea>` layered over a `highlight()`-painted `<pre>`: native caret, selection, IME, and undo with no contenteditable caret math. Attributes `value`/`placeholder`/`readonly`/`height`, `value` property, `input` events, `focus()`; Tab inserts two spaces; themeable via `--mdld-text`/`--mdld-caret`/`--mdld-placeholder` CSS vars. DOM-guarded like `<quad-graph>` — auto-registers in browser, `MdldEditor` export is `undefined` elsewhere
- **Playground migrated from `codejar` to `<mdld-editor>`** — `index.html` editor is now the custom element behind a thin `jar`-compatible adapter (`updateCode`/`toString`/`onUpdate`); the `codejar` dependency is unused

## v1.2.4 unified single file — the complete epistemic engine

### Changed
- **`<quad-graph>` merged into `mdld-parse.js`** — the Canvas2D force-directed renderer ships inside the single bundle; importing the library in a browser registers the custom element automatically (no sub-path, no second import). `QuadGraph` is exported but `undefined` outside the DOM — feature-detect with `if (QuadGraph)`; the rest of the engine stays fully environment-agnostic
- **`crawl.js` demoted to client concern** — moved to `demo/crawl.js` (playground-only); acquisition is transport, not knowledge — the core never touches the network. Documented in `docs/crawl.md`
- **Single export surface** — `package.json` exposes only `"." → dist/mdld-parse.js`; no `./crawl`, `./graph`, or `./shapes` sub-paths remain

### Added
- **`docs/crawl.md`** — crawler API + design patterns (BFS bounds, ETag revalidation, soft-fail cache, AbortSignal, injectable fetch)
- **`docs/performance.md`** — measured report: parse ~105K q/s, `evaluate()` ~500K q/s, 200 ms real-time envelope ≈ 100K quads

## v1.2.3 unified evaluation — `evaluate()` + ontology validation packs

### Added
- **`evaluate(options)`** — the core SHACL operation: one traversal per (shape, focus node) produces `{ conforms, violations, records }` — violations and conformance-gated POJOs are mutually exclusive views of the same evaluation, so they can never disagree. Options: `quads`/`shapes`+`data`, `shape` (restrict to one IRI), `allowJS` (default `false`), `context`, `byNode` (default `true`), `maxDepth`
- **`validate()` / `extract()` are now thin views over `evaluate()`** — same evaluation, different projection; ~60 lines of duplicated traversal removed
- **`allowJS` in `extract()`** — `sh:js` constraints now gate projection identically to validation (previously always skipped, so js-guarded fields were silently kept); pass `allowJS: true` for trusted shapes
- **Ontology validation packs** — `ontologies/*.shapes.md` companions for core vocabularies (`rdf`, `rdfs`, `xsd`): shapes for each vocabulary's constructs plus self-verifying `pack:Demo` nodes carrying source, `pack:expectedViolations`, and `pack:extractedPOJO` contracts in the graph itself — catalog conventions (`pack:` mirrors `cat:`)
- **`ontologies/selftest.mjs`** — auto-discovers every `*.shapes.md` pack and verifies pack+ontology conformance, declared violation counts, and graph-pinned POJO contracts; wired into `npm run test-shapes`
- **`docs/performance.md`** — measured report: parse ~105K q/s, `evaluate()` ~500K q/s, 200 ms real-time envelope ≈ 100K quads

### Performance
- **Tri-indexed `Store`** — added `byObject` index; `match()` picks the smallest candidate set across subject/predicate/object lookups; `has()`/`delete()` now indexed instead of linear scans
- **Per-Store graph cache** (`WeakMap`) — `subClassOf` adjacency, `rdf:type` index, superclass/subclass closures, and `instancesOf` results built once and memoized; `sh:class` checks no longer recompute hierarchies per value
- **Transitive path memoization** — `zeroOrMore`/`oneOrMore` results cached per (start, predicate, direction), deduplicated at enqueue
- **`expandIRI` context signature memoized** — context key string built once per context object instead of per term
- **Net**: `evaluate()` sustains ~500K quads/sec (25K products / ~125K quads in ~230 ms, Apple Silicon) — ~3.5× faster than the pre-index baseline, linear to 250K quads

### Fixed
- **Duplicate results in transitive paths** — `zeroOrMore`/`oneOrMore` could emit the same node multiple times; now deduplicated at enqueue

## v1.2.2 unified library — shapes merged into the root bundle

### Changed
- **Single-file library** — `shapes.js` merged into `mdld-parse.js` (175 kB / ~42 kB gz): `parse`, `generate`, `validate`, `extract`, `extractGraph`, `render`, `deconstruct`, `highlight` all importable from `'mdld-parse'`; the `./shapes` export path removed (tree-shaking covers parse-only consumers)
- **Renamed extraction API** — `extractPOJO()` → `extract()`, `extractSubGraph()` → `extractGraph()`; no backwards compatibility kept
- **Context-aware IRI shortening** — `extract()`/`validate()` accept `context` (or `{ quads, context }` input) so POJO keys, IRI fields, `byNode` keys, and `sh:message` placeholders render as CURIEs; full IRIs preserved when no context is given

### Fixed
- **`instancesOf` subclass direction** — `rdfs:subClassOf` closure now collects subclasses correctly, so `sh:targetClass prov:Person` catches `edu:Teacher`/`edu:Student` instances (spec-required behavior; previously walked superclasses)
- **`sh:closed` + `extractGraph` path structures** — predicate IRIs inside `alternativePath`/`inversePath`/transitives are whitelisted (landed in 1.2.1 line, confirmed)

### Added
- **`cat:expectedViolationMessage`** — catalog demos declare expected violation message literals; `selftest.js` substring-matches each against rendered `sh:message`, closing the count→message→POJO contract loop (33/33 demos)
- **`cat:demo/subclass`** — permanent regression test for subclass-aware targeting and `rdfs:Class` meta-modeling
- **`examples/demo/education.md`** — life-domain showcase: semester notebook with courses/teachers/students, dated lecture notes, first-class quotes with `edu:quoted` attribution chains, six cooperating shapes, per-class POJO extraction
- **Playground panels** — SHACL validation + per-shape POJO extraction tabs with copy buttons in `index.html`

## v1.2.1 SHACL projection — shapes as extraction schemas

### Added
- **`extractPOJO()`** (`mdld-parse/shapes`) — projects quads through a SHACL shape into typed plain JavaScript objects, the `rdf-lens` idea with zero dependencies: `sh:name` (or path local name) becomes the key, literals cast by datatype (`xsd:integer`/`decimal` → `Number`, `xsd:boolean` → `boolean`, `xsd:date`/`dateTime` → `Date`), `sh:node` and `sh:qualifiedValueShape` recurse into nested POJOs, RDF lists become arrays, IRIs project to their IRI string
  - Accepts `{ quads }`, `{ shapes, data }`, or a raw `Quad[]`; single-target shapes return one object, multiple return an array
  - `byNode: true` returns `{ focusValue: pojo }` for deterministic per-entity maps; `arrays` and `maxDepth` options included
- **`extractSubGraph()`** — returns the quad sub-graph permitted by a shape: only predicates declared by `sh:property` paths (plus `rdf:type`), recursing into nested entities via `sh:node`, `sh:qualifiedValueShape`, and `sh:targetClass`, with RDF list chains emitted whole — for sanitizing graphs before agents or caching
- **Extractable property collection** — PropertyShape members of `sh:and`/`sh:or`/`sh:xone` compositions count as properties (`sh:not` members excluded); a shape's own `sh:path` works when the shape is property-shape-like; `sh:deactivated` property shapes are skipped; duplicate projections deduped
- **`cat:extractedPOJO` blocks** — every one of the 32 catalog demos now declares its canonical extraction inline as `~~~~~~json {cat:extractedPOJO}` (`{ shapeShortIRI → focusShortIRI → pojo }`, IRIs shortened by the demo's own `[ex]` prefix)
- **`shapes/gen-extracted.js`** — regenerates all `cat:extractedPOJO` blocks idempotently; `selftest.js` parses each block back and deep-compares it against live `extractPOJO` output, so extraction drift fails the suite
- **Every catalog demo is now extractable** — all property shapes carry `sh:name`; audited all 35 targeted shapes across 32 demos: 0 empty extractions
- **Conformance-gated extraction** — `extractPOJO` is now two-tier: node-level constraints (`sh:closed`, `sh:not`, node-level `sh:and`/`or`/`xone`, …) exclude whole records, while each property is emitted only when its values pass the property shape — so every key is a validated fact and every record satisfies the node shape; offending fields are omitted, empty records dropped (`sh:js` guards don't run during projection)
- **`pathPredicates()`** — collects every predicate IRI reachable inside complex property paths (`sh:alternativePath` lists, `sh:inversePath`, transitives, sequence lists); `sh:closed` whitelists and `extractSubGraph` filtering now honor them
- **Projection performance** — per-shape metadata compiles once into a cached projection plan shared by `extractPOJO`/`extractSubGraph`; constraint-free shapes skip conformance gates entirely (~1.3–1.4× `validate()` cost, ~15K entities/sec, linear to ~25K entities / ~300K quads)
- **`shapes/kitchen-sink.mjs`** — end-to-end stress document (HR domain: closed shapes, `sh:in` lists, `lessThanOrEquals`, `alternativePath`, `sh:node`, `qualifiedValueShape`, RDF lists, deactivated rules) assembled as quads → `generate()` → re-parse → validate → extract; caught and fixed the path-structure whitelist bug
- **Selftest epistemology** — five explicit catalog loops (coverage, sync, demos, extraction fixtures, self) plus two machinery guards (procedural projection, document round-trip); `cat:extractedPOJO` is now a first-class numbered loop
- **`docs/shapes.md`** — user-facing documentation for validation and extraction

### Fixed
- **Catalog latent bugs found by the extraction audit**: `deactivated` demo linked a vacuous undeclared `CategoryProperty` (now links the real `DeactivatedProperty`) and wrote `sh:deactivated` as the literal `"deactivated"` instead of `true` — the rule was never actually off, only unreachable; `product` demo linked typo'd `DescriptioSKURulenRule`, orphaning `SKURule` so its `sh:pattern` never ran; `advanced` demo's `StatusRule` had no `sh:path`; `not` demo's NodeShape had no properties at all
- **`sh:name` normalization** — sentence-like names ("order date before shipping date", "preferred label", "work email") replaced with clean keys matching their paths (`orderDate`, `prefLabel`, `email`)
- **`sh:closed` + complex paths** — predicates inside `sh:alternativePath`/`sh:inversePath`/transitive/sequence structures were treated as undeclared, producing false `ClosedConstraintComponent` violations and wrongly filtered subgraph quads

## v1.2.0 Self-validating SHACL ecosystem

### Added
- **`mdld-parse/shapes` — zero-dependency SHACL Core validator** (`shapes/validator.js`, ~1,100 LOC, sync, no RDF libraries): consumes mdld-parse quads directly via `{ quads }` (auto shape/data classification), `{ shapes, data }`, or a reusable `Validator` class
  - Full SHACL Core surface: all constraint components, all target types (`targetClass`/`targetNode`/`target`/`targetSubjectsOf`/`targetObjectsOf`), all property path types, logical constraints over RDF lists, qualified counts, closed shapes, `sh:message` templates (`{$value}`/`{$path}`/`{$focusNode}`), `sh:severity`, `sh:deactivated`
  - **IRI path structures** — complex paths (`sh:inversePath`, `sh:alternativePath`, `sh:zeroOrMorePath`, `sh:oneOrMorePath`, `sh:zeroOrOnePath`, sequence lists) resolve on any term type, so MD-LD needs no blank nodes
  - **SHACL-JS** — `sh:js` → `sh:JSConstraint` → `sh:script`, compiled once per constraint with validator helpers in scope; **opt-in via `allowJS: true`**, disabled by default so untrusted shapes cannot execute code
  - `SUPPORTED_VOCABULARY` + `isSupportedTerm` exports for catalog↔validator sync checks
- **`shapes/selftest.js` — the ecosystem validates itself**: parses `catalog.md` (32 `cat:Demo` worlds with `cat:demo` source + `cat:expectedViolations`), verifies ontology coverage of all 101 `sh:` properties in `ontology.md`, checks catalog↔validator sync, and runs the catalog's own SHACL shapes against itself — one command, nonzero exit on any drift
- **`shapes/catalog.md` — the catalog is the test suite**: every constraint demo is an executable `cat:Demo` written as a small-business story in its own document voice; `cat:self` shapes enforce demo integrity declaratively
- **`shapes/ontology.md`** — MD-LD rendering of the W3C SHACL vocabulary, used as the completeness ground truth (101 `sh:` properties, all accounted for: 28 demo / 24 included / 49 notCovered)
- **`shapes/README.md`** — merged spec + catalog documentation; the single metadocument for the loop

### Fixed
- **Nested fences inside `~~~~~~` carriers** (`src/parse.js`) — fence-looking lines that don't close an open code block were silently dropped, losing their `{...}` annotations; they are now preserved as literal content per CommonMark

### Documented limitations
- SHACL-SPARQL, SHACL-AF, and external JS libraries (`jsLibrary`/`jsFunctionName`) remain out of scope by design; `qualifiedValueShapesDisjoint` and deep RDFS entailment are the honest remainder

## v1.1.2 CommonMark rendering compliance

### Added
- **CommonMark HTML blocks in `render()`**: raw HTML (`<table>`, `<div>`, `<section>`, …) passes through unescaped — block tags run to a blank line, `script`/`pre`/`style`/`textarea` run to their close tag, lone inline tags can't interrupt paragraphs. `deconstruct()` passes raw blocks through verbatim, so they round-trip losslessly
- **Inline HTML passthrough**: `<b>`, `<a href>`, custom elements render raw inside paragraphs/headings/list items; code spans and fenced blocks stay escaped
- **Full CommonMark link destinations**: `[text](#fragment)`, `[text](/path)`, `[text](mailto:…)`, titles (`"…"`, `'…'`, `(…)`, incl. parenthesized titles), balanced/nested parens in destinations, and `![alt](src)` images — previously non-`http(s)` destinations were silently swallowed
- **External link policy**: any `href` with a URI scheme or protocol-relative `//` gets `target="_blank" rel="noopener noreferrer"`; fragment and relative links stay on-page
- **Entity references**: `&amp;`, `&copy;`, `&#169;`, `&#xA9;` and ~150 named entities decode; invalid entities stay literal
- **Backslash escapes**: `\*`, `\[`, `\<`, `\\` suppress markup in both carrier scanning and text rendering
- **Hard line breaks**: 2+ trailing spaces or `\` before a newline render `<br />`; `deconstruct()` maps back to the two-space form
- **Indented code blocks**: 4+ spaces or tab at block start → `<pre><code>`; can't interrupt paragraphs; deconstructs as fenced code
- **Ordered lists**: `1)` delimiter supported; non-1 starts emit `<ol start="N">` (preserved through deconstruct)
- **List correctness**: bullet-marker (`-`/`+`/`*`) and ordered-delimiter (`.`/`)`) changes now split lists per CommonMark
- **Heading closing sequences**: `# Title #` strips trailing hashes (requires preceding space)
- **Blockquote lazy continuation**: unmarked paragraph lines continue a quote in `render()`
- **Multiline blockquote semantics in `parse()`**: consecutive `>` lines accumulate — a trailing `{...}` annotation binds to the whole quoted text (`> a\n> b {ann}` → `a\nb`), while annotated lines still close their own segment so per-line bindings are unchanged

### Fixed
- **Emphasis delimiter runs**: CommonMark left-/right-flanking rules — `snake_case_name`, `2 * 3 * 4`, `a * b * c` no longer italicize; `_` gets the stricter intraword rule; nested `*a **b** c*` / `**a *b* c**` pair correctly via depth-tracked closer matching
- **Escaped punctuation** no longer triggers carriers (`\*`, `\[`, `\<`) or inline HTML
- **Per-line blockquote annotations** on non-first `>` lines were silently dropped by `render()` — now preserved
- **`deconstruct()`** re-escapes significant punctuation so literal `<`, `*`, `[`, `` ` `` can't resurrect as markup on re-render

### Documented limitations
- Setext headings, reference-style/shortcut links, and GFM extensions (pipe tables, strikethrough, task lists) are deliberately unsupported — see README and `docs/render.md` for rationale

### Technical Details
- New tokenizers: `detectHtmlBlock()`, `detectIndentedCode()`; `detectBracketLink()` rewritten with real destination/title parsing; `detectEmphasis()` rewritten with flanking + delimiter-depth matching
- `parse()` gains a `quoteBlock` accumulator (same pattern as `codeBlock`) — bounded per-line consumption, no arbitrary lookahead
- 188 tests passing

## v1.1.0 Crawl an links clarity

### Added
- **`crawl()` — universal linked-document crawler** (`mdld-parse/fetch`): recursively fetches a graph of linked text documents starting from one URL and returns raw text + normalized outgoing links. Fully decoupled from the parser — zero dependencies, zero internal imports — so the core stays pure and I/O-free, and the crawler works for any linked text format
  - Extracts Markdown links (`[text](url)`, reference definitions, autolinks) **and** HTML `<a href>` from every document — inline HTML is valid CommonMark, so both scanners always run
  - Character-scanned extraction (no regex in hot paths): fence-aware, code-span-aware, comment-aware, skips `<script>`/`<style>` contents
  - Pluggable cache adapters via a 3-method interface (`get`/`set`/`delete`); in-memory LRU (`memoryCache()`) built in; conditional `ETag`/`Last-Modified` requests with zero-cost `304`s and stale-if-error fallback on 5xx / network failure
  - Bounded by default: `maxDepth`, `maxPages` (100), http(s)-only protocol allow-list, optional `sameOrigin`, binary content-types rejected
  - Cancellable: `AbortSignal` resolves with partial results and `aborted: true`; errors are collected in `result.errors` — the crawl never rejects
  - `onPage(page)` callback for incremental parsing while the crawl is still in flight
  - Deterministic output: pages return in BFS discovery order, never completion order
- **`extractLinks(text, base)`**: pure string-scanning link extractor, exported for offline/editor use without any network access
- **`memoryCache(maxEntries)`**: O(1) in-process LRU, the default cache adapter
- **Standalone module**: `crawl.js` loads directly in a browser console (`import('/crawl.js')`) or can be vendored verbatim — no build step, no bundler
- **Visualizer web-component (`<quad-graph>`)**: zero-dependency RDF quad graph renderer with improved dark theme and text readability
  - Dark background (`#1a1a1a`) with light text (`#eee`) for high contrast
  - Optimized text outline rendering: reduced line width for node labels (1.5px) and predicate labels (1px) to prevent text overflow
  - Improved readability for both node labels and edge/predicate labels
  - Custom Web Component API: attributes for height, charge, link-dist, labels; methods for focus, select, fit, pin, reheat
  - Interactive: wheel/pinch zoom, drag background to pan, drag nodes to move, double-click to pin/unpin
  - Canvas2D rendering with viewport culling, density-adaptive alpha, and collision-free label placement

### Technical Details
- `mdld-parse/crawl` is a separate entry point; `parse()` / `deconstruct()` stay at the call site, so the crawler is content-agnostic by contract — consumers interpret what they fetch
- Single cache authority: fetch runs with `cache: 'no-store'`, so the module-level cache never drifts against the browser HTTP cache
- Event-driven concurrency pump keeps `concurrency` requests in flight at all times (no batch head-of-line blocking); the visited check-and-add runs in one synchronous section, so concurrent workers can never double-enqueue a URL
- Redirect-aware: `res.url` is reported as `page.finalUrl`, so document identity (and `#fragment` resolution) follows redirects
- Cache failures degrade gracefully: a broken adapter (e.g. Safari private mode) silently means "no cache", never a failed crawl


## v1.0.8 (2026-09-21)

### Added
- **HTML Codec for MD-LD**: `render()` and `deconstruct()` functions enable lossless roundtrip between MD-LD and HTML
  - `render(mdld)` converts MD-LD to semantic HTML with `data-annotation` attributes preserving source syntax
  - `deconstruct(html)` reconstructs MD-LD from rendered HTML via pure string scanning (no DOMParser dependency)
  - Platform-agnostic: works in Node.js, Deno, browsers, edge workers
  - HTML is now a first-class transport format for knowledge graphs
- **Roundtrip Invariant**: `parse(deconstruct(render(mdld)))` produces identical quads to `parse(mdld)`
- **Lossy Rendering**: `render(parse(mdld).md)` produces clean HTML without semantic annotations for privacy-preserving publishing
- **Prefix Folding Preservation**: `deconstruct()` maintains folded IRI syntax (e.g., `my:journal:`) for lossless prefix roundtrip

### Changed
- HTML rendering now uses `data-annotation` instead of JSON-encoded semantic arrays
- CSS classes simplified: `.mdld-heading`, `.mdld-link`, `.mdld-quote`, etc.
- Removed RDFa/JSON-LD generation in favor of annotation preservation approach

### Technical Details
- Render/deconstruct pair enables SSR and CSR equivalence: same MD-LD produces identical graphs regardless of where rendering occurs
- Zero-dependency HTML codec: no DOMParser, no xmldom, no cheerio required
- Client-side graph extraction: `parse(deconstruct(document.body.innerHTML))` reconstructs quads without server roundtrip

## v1.0.5 (2026-08-27)

Ignore `<template></template>`, `<script></script>`, `<style></style>` and `<!---->` block content during parsing.

## v1.0.0 (2026-05-22)

### Production Release

### Breaking Changes
- **Reverse connection rendering now requires explicit `renderReverse` parameter** — When `renderReverse` is not set to `true` in `generate()`, reverse connections (`!p` annotations) are not rendered. This ensures deterministic, order-independent behavior and prevents quad duplication issues from order-sensitive fallbacks. `generateNode()` retains `renderReverse: true` by default for opinionated node exploration.
- **`compactInline` default changed to `false` in `generate()`** — Canonical serialization now produces full headings for all subjects by default. Use `compactInline: true` for inline type/label compaction. `generateNode()` retains `compactInline: true` by default for opinionated node exploration.

### Performance Improvements
- **Pre-computed filtered groups** — Replaced lazy caching with upfront computation of filtered quad groups for O(1) access during rendering
- **Simplified quad tracking** — Consolidated `renderedReverseQuads`, `renderedInlineQuads`, and `renderedInlineSubjects` into a single `renderedQuads` Set
- **Removed redundant state** — Eliminated `skippedSubjects` Set and derived skip conditions from `renderedQuads`

### Code Quality (DRY)
- **Centralized RDF term constants** — All W3C RDF IRIs now defined in `src/constants.js`:
  - `RDFS_LABEL`, `RDFS_COMMENT`
  - `RDF_TYPE`, `RDF_LANG_STRING`, `RDF_STATEMENT`, `RDF_SUBJECT`, `RDF_PREDICATE`, `RDF_OBJECT`
  - `XSD_STRING`, `XSD_BOOLEAN`, `XSD_INTEGER`, `XSD_DOUBLE`
- **Removed duplicate constant definitions** from `shared.js` and `utils.js`
- **Eliminated magic strings** throughout codebase for better maintainability

### Bug Fixes
- **Fixed quad duplication in heading types/labels** — Types and labels rendered in heading annotations are now marked as rendered to prevent inline duplication
- **Fixed order-sensitive primarySubject fallback** — Removed fallback to first subject from quads, ensuring deterministic output regardless of quad ordering

### Documentation
- **Updated README.md** — Documented `primarySubject` behavior for reverse connections
- **Updated docs/API.md** — Added clear documentation for generate function parameters
- **Documented compactInline default** — Clarified that inline compaction is enabled by default

### Test Coverage
- **132 tests passing** — Full backward compatibility maintained
- **All quad stability tests passing** — Round-trip safety verified

### Migration Guide
If you were relying on reverse connection rendering by default in `generate()`:

```javascript
// Before (v0.10.0)
const { text } = generate({ quads, context, primarySubject: 'http://example.org/subject' });
// Reverse connections rendered with primarySubject

// After (v1.0.0)
const { text } = generate({ quads, context, primarySubject: 'http://example.org/subject', renderReverse: true });
// Reverse connections require explicit renderReverse parameter
// Use generateNode() for opinionated exploration with renderReverse: true by default
```

If you were relying on inline type/label compaction by default in `generate()`:

```javascript
// Before (v0.10.0)
const { text } = generate({ quads, context });
// Inline compaction enabled by default

// After (v1.0.0)
const { text } = generate({ quads, context, compactInline: true });
// Inline compaction must be explicitly enabled for canonical serialization
// Use generateNode() for opinionated exploration with compactInline: true by default
```

## v0.10.0 (2026-05-05)

### Added
- **Character-based tokenization system** — Complete regex replacement for improved performance and maintainability
  - **Block-level tokenizers**: `detectFence()`, `detectPrefix()`, `detectHeading()`, `detectList()`, `detectBlockquote()`, `detectStandaloneSubject()`
  - **Inline carrier scanner**: `scanInlineCarriers()` replaces `extractInlineCarriers()` 
  - **Memory-optimized design**: Lazy evaluation and minimal object allocations
  - **Better error handling**: More precise edge case detection and graceful failure

### Performance Improvements
- **20-28% faster parsing**: 23ms vs 25ms (1x), 186ms vs 231ms (10x)
- **Efficient memory usage**: ~640 bytes per quad retained after GC
- **O(1) additional memory**: Only stores essential metadata during parsing
- **Streaming-friendly**: Maintains single-pass linear time complexity

### Changed
- **Replaced all major regex patterns** with character-based detection functions
- **Unified tokenizer architecture**: All tokenization logic centralized in `src/tokenizers.js`
- **Cleaner code structure**: Easier to debug, test, and extend
- **Preserved constants**: Original regex patterns kept in `constants.js` for reference

### Fixed
- **Empty literal handling**: `[] {label}` now correctly emits quad with empty string
- **Angle bracket URL validation**: Invalid URLs like `<not-a-url>` properly ignored
- **Bracket link type detection**: Correctly distinguishes between `[text]` (span) and `[text](url)` (link)

### Technical Details
- **127/127 tests passing** — Full backward compatibility maintained
- **Character-based detection** uses direct string manipulation instead of regex
- **Soft subject handling** for angle bracket URLs (`<URL> {type}`)
- **Memory profiling** confirms efficient resource usage

## v.0.9.1 (2026-05-03)

### Added
- **`md` field in parse() result** — Clean Markdown extraction with all MD-LD annotations stripped
  - Valid annotations (`{=...}`, `{+...}`, `{...}`) completely removed
  - Content from value carriers preserved (`[text]`, `**bold**`, `` `code` ``)
  - Invalid syntax preserved as visible markers for debugging
  - Round-trip safe: re-parsing clean MD produces zero quads
  - Enables content extraction, syntax validation, and preview generation
- **Self-validating syntax detection** — Remaining `{...}` patterns in clean MD indicate misplaced annotations

## v.0.9.0 (2026-05-01)

### BREAKING CHANGES (with backward compatibility)
- **Unified named parameter API** for all core functions
  - `parse({ text, context, dataFactory, graph })` — new primary signature
  - `generate({ quads, context, primarySubject })` — unified object pattern
  - `generateNode({ quads, focusIRI, context })` — safe node-centric generation
  - Legacy positional signatures still work (deprecated, removed in v1.0.0)

### Added
- **Seamless composition** via object spreading:
  ```js
  generate({ ...parse({ text, context }) })
  parse({ ...generate({ quads, context }) })
  generateNode({ ...parse({ text }), focusIRI })
  ```
- `generateNode()` safety-first design: returns empty on missing IRI (prevents accidental LLM costs)

### Changed
- `parse()` now accepts named parameters `{ text, context, dataFactory, graph }`
- `generate()` and `generateNode()` use unified object parameter pattern
- All functions return shapes that compose via `{ ...spread }`

## v.0.8.0 (2026-04-30)

### Added
- **Visual carrier styles** for improved readability:
  - Numbers (integer/decimal/double/float): code spans `` `42` `` for monospace display
  - Dates/DateTime: square brackets `[2024-01-01]` for consistency
  - Booleans: bold **true**/**false** for visual emphasis
  - Other literals: square brackets `[text]` (simple, readable)
  - Multiline content: `~~~` fenced blocks with proper datatype annotations
- **Label-in-heading enhancement**: When an entity has `rdfs:label`, the heading uses it as display text
  - Example: `# ACME Inc. {=my:orgs/acme .prov:Organization label}`
  - The "label" annotation indicates the heading carries the rdfs:label
  - Label quads are excluded from body literals to avoid duplication
- **rdfs:label for object links**: Object references use labels when available
  - Example: `*ACME Inc.* {+my:orgs/acme ?worksAt}` instead of repeating the IRI
- **Multiline literal escaping**: Fixed quote escaping in DataFactory for round-trip safety

### Changed
- `generate()` function now produces visually distinct output based on datatype
- Improved round-trip safety for complex content with special characters
- `generate()` auto-fallback: Uses first subject from quads if `primarySubject` not provided

### Added
- `generateNode(quads, focusIRI, context)` — Safe node-centric MDLD generation
  - Shows all quads where an IRI appears in any position (subject, object, predicate, type, datatype)
  - **Safety-first design**: Returns empty if `focusIRI` not found—never falls back to rendering all data
  - Prevents accidental LLM costs from misspelled IRIs in production environments
  - Optimized: DRY helper, no object spreads, memory-efficient
- Safety fix: `generate()` now gracefully handles IRIs not present as subjects (skips instead of crashing)

## v.0.7.0 (2026-03-23)

### BREAKING CHANGES
- **BREAKING:** Removed `applyDiff` function and entire applyDiff infrastructure
- **BREAKING:** Simplified `locate()` function signature from `locate(quad, origin, text, context)` to `locate(quad, origin)`
- **BREAKING:** Updated `generate()` function to only return text instead of `{ text, origin }`
- **BREAKING:** Removed `parseWithMerge` function (use `merge()` directly)

### Changed
- **Improved:** Origin system now uses lean `quadIndex` instead of complex `quadMap` structure
- **Improved:** Removed ~500 lines of deprecated code while maintaining full functionality
- **Improved:** Cleaner, more maintainable codebase with DRY principles
- **Fixed:** Resolved circular dependency in merge system

### Added
- Comprehensive test suite for lean origin system (7 new tests)
- Better error handling and validation in origin tracking

### Removed
- `applyDiff.js` file and all related infrastructure
- 12 deprecated utility functions from `utils.js`
- Complex slot management system and vacant slot tracking
- Mutable origin infrastructure for automated text mutation

## v.0.6.2 (2024-03-23)

### Added
- Full MD-LD specification implementation
- Complete test suite with 98+ tests
- Browser and Node.js compatibility
- Comprehensive documentation and examples

## v.0.5.2 (2026-02-17)

+ feat: IRI>URL in [link](url) {=iri}

## v.0.4.1 (2026-01-27)

+ feat: prefix folding
+ feat: `<URL> {?prop}` syntax

## v.0.4.0 (2026-01-26)

+ feat: many small improvements

## v.0.3.5 (2026-01-24)

Removed `schema` vocabulary - now it's `rdfs` and pure meta position to custom or imported ontologies.

## v.0.3.2 (2026-01-20)

+ Changed prefix pattern to `[ex] <http://example.org/>`

## v.0.3.1 (2026-01-19)

## v.0.3.0 (2026-01-16)

+ feat: consisten single-character syntax for v.0.3

## v.0.2.10 (2026-01-16)

+ feat: lists are using ?property syntax to consistency
+ fix: cleaner recipe
+ feat: better cookbook

## v.0.2.9 (2026-01-15)

+ feat: all inline spans are valid carriers
+ feat: authorship just in case
+ feat: started docs

## v.0.2.8 (2026-01-15)

+ 0.2.8
+ feat: soft fragment IRI syntax
+ feat: closed algebra

## v.0.2.7 (2026-01-14)

+ 0.2.7

## v.0.2.6 (2026-01-14)

+ 0.2.6
+ feat: =?iri soft IRI for objects

## v.0.2.5 (2026-01-14)

+ 0.2.5
+ feat: clean round-trip with vacant slots in origin
+ clean

## v.0.2.4 (2026-01-14)

+ 0.2.4
+ feat: chaining
+ feat: smaller
+ feat: origin is better
+ feat: diff
+ feat: simplified
+ feat: 41 tests - OK
+ feat: 0.2.3

## v.0.2.3 (2026-01-13)

+ fix: no build
+ fix: proper context handling

## v.0.2.2 (2026-01-13)

+ v. 0.2.1
+ feat: self-description
+ feat: self-validating Spec
+ feat: no paragraph carrier - better
+ feat: refactored for clean code
+ fix: annotation leak fix

## v.0.2.1 (2026-01-13)

+ feat: no literals and better lists
+ feat: round-trip tests
+ feat: new tests
+ feat: polished codeblocks
+ feat: dogfood out
+ feat: value carriers
+ feat: Spec solidifies
+ feat: v.02 cleanup
+ feat: 52 tests pass
+ feat: 33 tests passing

## v.0.2.0 (2026-01-12)

+ feat: v02 started
+ feat: v.0.2 Spec settled
+ ver: v.0.2 started
+ feat: v.0.2 spec is prepared
+ fix: no fragments
+ feat: v.0.2 is cooking

## v.0.1.1 (2025-12-31)

+ v.0.1.1

## v.0.1.0 (2025-12-31)

+ feat: transiton to 0.2
+ feat: default context and infered baseIRI
+ feat: no frontmatter parsing - default context assumed
+ feat: any subject IRI
+ fix: no spec yet
+ feat: NPM link
+ fix: real git source
+ feat: cleaner examples
+ fix: escape
+ fix: no new line
+ feat: Nice Readme and package.json
+ feat: codeblocks
+ feat: rdfs:label for headings
+ feat: lists fixed

## v.0.0.1 (2025-12-30)

+ feat: initial setup
