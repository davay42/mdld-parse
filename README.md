# MD-LD

**Markdown-Linked Data** — Write RDF knowledge graphs as plain Markdown. Parse to quads, generate back, merge documents. Zero dependencies, round-trip safe.

MD-LD is the only RDF format that is both writable by humans and parseable by machines in the same document. Unlike Turtle (write-only), JSON-LD (machine-only), and RDFa (embedded-in-HTML-only), MD-LD annotations flow with natural Markdown prose — making knowledge graphs readable without a renderer.

**[mdld.js.org](https://mdld.js.org/)**

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse/)

## 🎯 What is MD-LD?

MD-LD is not just another RDF syntax. It's a **universal semantic writing interface** that removes the intermediary between human text and machine-readable graphs.

Traditional systems require:
```
Human → UI → App Logic → Hidden Database → APIs → Exports
```

MD-LD enables:
```
Human text → Graph immediately
```

**Core value:** Author and maintain knowledge graphs as plain text with deterministic round-trip safety. No platforms, databases, or proprietary SaaS mediation required.

```markdown
[ex] <tag:ame@example.com,2026:>

# Alice {=ex:alice .prov:Person label}

[Alice Smith] {ex:fullName}
[alice@example.com] {ex:email}
```

**Generates RDF quads** that work with n3.js, rdflib, and any RDF/JS-compatible library.


## 🚀 Quick Start

Install the package in Node environment:

```bash
pnpm install mdld-parse
```

Or use `importmap` in the browser:

```html
  <script type="importmap">
    {
      "imports": {
        "mdld-parse": "https://mdld.js.org/index.js"
      }
    }
  </script>
```


```javascript
import { parse, generate, merge, render, deconstruct } from 'mdld-parse';

// Parse MDLD to RDF quads
const result = parse({ text: mdldString });
console.log(result.quads); // RDF/JS quads
console.log(result.primary); // Primary metadata (subject, type, label, comment)
console.log(result.statements); // Elevated statements
console.log(result.origin); // Provenance tracking

// Generate MDLD from quads
const { text } = generate({ quads: result.quads });

// Render to semantic HTML with preserved annotations
const html = render(mdldString);

// Reconstruct MDLD from HTML (lossless roundtrip)
const reconstructed = deconstruct(html);
const quads = parse(reconstructed).quads; // Same quads as original!

// Lossy rendering for privacy-preserving publishing
const cleanHtml = render(parse(mdldString).md);

// Merge multiple documents (CRDT-style)
const merged = merge([doc1, doc2, doc3]);
```

## 💡 Why MD-LD?

### The Problem with Current Systems

Most software today uses graphs internally but hides them behind UIs:
- **Notion, Slack, Google Docs** — Human interfaces over hidden graphs
- **CRMs, task apps, note apps** — Proprietary data silos
- **Social networks** — Platform-controlled knowledge prisons

Users cannot access the graph directly. Semantics are hidden. Data is locked in products.

### The MD-LD Solution

MD-LD removes the intermediary. Writing becomes publishing. Publishing becomes graph construction.

**Key benefits:**

- **Graph sovereignty** — You own text, graph, provenance, execution, history
- **No central platform required** — Works offline, in browsers, on servers
- **Universal semantic substrate** — Agents can read, reason, write, execute, validate
- **Continuous semantic narrative** — Unifies chat, tasks, notes, emails, calendar, files
- **Native time dimension** — Every action, statement, correction becomes part of the graph
- **Decentralized authority** — RFC 4151 tag: URIs enable self-sovereign identity without central registries
- **Text-native agent memory**  - LLM Agent memory substrate in plain text — parse context, write knowledge, merge with other agents, all as Markdown files. No database required.


### Real-World Applications

#### Personal Knowledge Management
```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting label}

Attendees:
**Alice** {+alice:alice ?alice:attendee label}
**Bob** {+alice:bob ?alice:attendee label}

Action items:
**Review proposal** {+alice:task-1 ?alice:actionItem label}
```

#### Developer Documentation
```markdown
[api] <tag:brian@example.org,2026:app/api/>
# Get User by ID {=api:/users/:id .api:Endpoint label}

Method: [GET] {+api:methods/GET ?api:method}
Path: [/users/:id] {api:path}
Status: [OK] {api:status}
```

#### Academic Research
```markdown
[alice] <tag:alice@example.org,2026:>
# Semantic Web {=alice:research/paper-semantic-markdown .alice:ScholarlyArticle label}
Is part of [semantic research] {+alice:research/semantic !member}

Authored by [Alice Johnson] {+alice:alice-johnson ?alice:author} on [2026-08-12] {alice:datePublished ^^xsd:date}.
```

#### Content Management
```markdown
[blog] <tag:justin@example.org,2026:>
# Understanding MD-LD {=blog:post-mdld .blog:Post label}

[MD-LD] {blog:emphasized} allows you to embed RDF directly in Markdown.
```

#### Local-First Personal Knowledge Base
```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting with Bob {=alice:meeting-2026-01-21 .Meeting label}
Attendees: [Alice] {=alice:alice}, [Bob] {+alice:bob ?attendees}
Location: [Coffee Shop] {alice:location}
Discussed [Project Alpha] {alice:discussed}

## ✨ Core Features

- **🔗 Prefix folding** — Build hierarchical namespaces with CURIE-based IRI authoring
- **📍 Subject declarations** — `{=IRI}` and `{=#fragment}` for context setting
- **🎯 Object IRIs** — `{+IRI}` and `{+#fragment}` for temporary object declarations
- **🔄 Three predicate forms** — `p` (S→L), `?p` (S→O), `!p` (O→S)
- **🏷️ Type declarations** — `.Class` for rdf:type triples
- **📅 Datatypes & language** — `^^xsd:date` and `@en` support
- **🧩 Fragments** — Document structuring with `{=#fragment}`
- **⚡ Polarity system** — Sophisticated diff authoring with `+` and `-` prefixes
- **📍 Origin tracking** — Complete provenance with lean quad-to-source mapping
- **🔗 Span chains** — Walkable textual topology between semantic blocks for context recovery and resonance
- **🎯 Elevated statements** — Automatic rdf:Statement pattern detection
- **🏷️ Primary metadata quartet** — Subject, type, label, comment for document identity
- **🔄 Round-trip safety** — Deterministic parse ↔ generate cycles
- **🌐 HTML Codec** — Lossless `render()` and `deconstruct()` pair for web publishing

**Bundle size:** 101KB unminified, 24KB gzipped

## 📦 Installation

### Node.js

```bash
pnpm install mdld-parse
node -e "
import { parse } from 'mdld-parse';
console.log(parse({ text: '# Test {=tag:test@example.org,2026:index .prov:Entity label}' }));
"
```

### Browser ESM (importmap)

```html
<script type="importmap">
{
  "imports": {
    "mdld-parse": "https://cdn.jsdelivr.net/npm/mdld-parse/+esm",
  }
}
</script>
<script type="module">
  import { parse } from 'mdld-parse';
  const result = parse('[ex] <tag:my@example.com,2026:test/>\n\n# Hello {=ex:init .prov:Activity label}');
</script>
```

### Example use in browser console

You can copy and paste this code into your browser console to see the list of tasks as an easy to render JSON object. 

```javascript
const mdld = await import('https://cdn.jsdelivr.net/npm/mdld-parse/+esm')

const text = `[my] <tag:alice@example.org:>

# Tasks {=my:tasks .prov:Collection label}

## Task 1 {=my:tasks/1 .prov:Activity label}
One of my [urgent] {my:tasks/status} [tasks] {+my:tasks !prov:hadMember}
> Explore deeper the concept of a triple in RDF {comment}

## Task 2 {=my:tasks/2 .prov:Activity label}
One of my [tasks] {+my:tasks !prov:hadMember}
> Start building knowledge graphs {comment}
`;

const result = parse({ text });

function extractByType (quads, type) {
  return Object.values(
    quads.reduce((acc, q) => {
      const s = q.subject.value;
      const key = q.predicate.value.split(/[#/]/).pop();

      (acc[s] ??= { iri: s })[key] = q.object.value;

      return acc;
    }, {})
  )
  .filter(x => x.type === type)
  .map(({ type, ...x }) => x);
}

const tasks = extractByType(result.quads,"http://www.w3.org/ns/prov#Activity")

console.log(tasks);
/*
[
  {
    "iri": "tag:alice@example.org:tasks/1",
    "label": "Task 1",
    "status": "urgent",
    "comment": "Explore deeper the concept of a triple in RDF"
  },
  {
    "iri": "tag:alice@example.org:tasks/2",
    "label": "Task 2",
    "comment": "Start building knowledge graphs"
  }
]
*/
```

## 🧠 Semantic Model

MD-LD encodes a directed labeled multigraph where three nodes may be in scope:

- **S** — current subject (IRI)
- **O** — object resource (IRI from link/image)
- **L** — literal value (string + optional datatype/language)

### Predicate Routing

Each predicate form determines the graph edge:

| Form  | Edge    | Example                      | Meaning          |
|-------|---------|------------------------------|------------------|
| `p`   | S → L   | `[Alice] {label}`            | literal property |
| `?p`  | S → O   | `[NASA] {=ex:nasa ?org}`     | object property  |
| `!p`  | O → S   | `[Parent] {=ex:p !hasPart}`  | reverse object   |

## 🎨 Syntax Quick Reference

### Subject Declaration

Set current subject (emits no quads):

```markdown
[ex] <tag:nasa@example.org,2026:>
## Apollo 11 {=ex:apollo11}
```

### Type Declaration

Emit `rdf:type` triple:

```markdown
[ex] <tag:nasa@example.org,2026:>
## Apollo 11 {=ex:apollo11 .ex:SpaceMission .prov:Entity}
```

### Literal Properties

Inline value carriers emit literal properties:

```markdown
[ex] <tag:nasa@example.org,2026:>
# Mission {=ex:apollo11}
[Neil Armstrong] {ex:commander}
[1969] {ex:year ^^xsd:gYear}
[Historic mission] {ex:description @en}
```

### Object Properties

Links create relationships (use `?` prefix):

```markdown
[ex] <tag:nasa@example.org,2026:>
# Mission {=ex:apollo11}
[NASA] {=ex:nasa ?ex:organizer}
```

### Resource Declaration

Declare resources inline with `{+iri}`:

```markdown
[ex] <tag:nasa@example.org,2026:>
# Mission {=ex:apollo11}
[Neil Armstrong] {+ex:armstrong ?ex:commander .Person}
```

### Diff Authoring (Polarity)

Use `+` and `-` for retractions:

```markdown
[ex] <tag:carol@example.org,2026:>

New student [Alice] {=ex:new-student .prov:Person ex:name} is our [class] {+ex:my-class !member}. I think she might know [Bob] {+ex:bob ?ex:knows}.

**Correction:** [Her] {=ex:new-student} name is not [Alice] {-ex:name}, it's [Ellie] {ex:name}.

**Correction:** I asked her directly - no, she doesn't know [him] {+ex:bob -?ex:knows}.

**IRI replacement:** Let's create a proper [Class] {=ex:my-class} record for [Ellie] {+ex:Ellie .prov:Person ex:name label ?member} instead of temporary [Ellie] {+ex:new-student -.prov:Person -ex:name -?member} record created earlier.
```

After `generate(parse({text}))` would look like this:
```markdown
[ex] <tag:carol@example.org,2026:>

# Ellie {=ex:Ellie .prov:Person label}
[Ellie] {ex:name}

# my-class {=ex:my-class}
[ex:Ellie] {+ex:Ellie ?member}
```


## 🔧 API Reference

### `parse({ text, context, dataFactory, graph })`

Parse MDLD to RDF quads with lean origin tracking.

**Parameters:**
- `text` (string, required) — MDLD formatted text
- `context` (object, optional) — Prefix mappings
- `dataFactory` (object, optional) — Custom RDF/JS DataFactory
- `graph` (string, optional) — Named graph IRI

**Returns:** `{ quads, remove, statements, origin, context, primarySubject, primary, md }`

- `quads` — RDF/JS Quads (final resolved graph state)
- `remove` — RDF/JS Quads (external retractions for diff workflows)
- `statements` — Elevated SPO quads from rdf:Statement patterns
- `origin` — Lean origin tracking: `quadIndex`, `blocks`, `spans`, `documentStructure`
- `context` — Final context with prefixes
- `primarySubject` — String IRI or null (canonical append identity)
- `primary` — Primary metadata quartet: `{ subject, type, label, comment }`
- `md` — Clean Markdown with annotations stripped

`primarySubject` is useful to allow each iri have it's page and vice versa - so we can have arbitrary MD content attached to it. This is where we can render the `md` on the entity page if we have it in our custom `const pages = new Map()`. 

`md` is useful to detect parsing success: `if(originalText!=parsed.md) {console.log('Parse success. Total annotations: ', originalText.length-md.length) letters.`

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**
- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings

**Returns:** `{ quads, remove, statements, origin, context, primarySubjects, primary }`

- `quads` — RDF/JS Quads (final resolved graph state)
- `remove` — RDF/JS Quads (external retractions)
- `statements` — Elevated statements from all documents
- `origin` — Merge origin with document tracking
- `context` — Final context with prefixes
- `primarySubjects` — Array of string IRIs (canonical identities)
- `primary` — Array of primary metadata objects

**Use case:** CRDT-style state management with append-only documents.

### `generate({ quads, context, primarySubject, compactInline, renderReverse, remove, lang })`

Generate deterministic MDLD from RDF quads.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings
- `primarySubject` (string, optional) — IRI to place first in output
- `compactInline` (boolean, optional) — Inline type/label compaction (default: `false`)
- `renderReverse` (boolean, optional) — Reverse connections as `!p` (default: `false`)
- `remove` (array, optional) — RDF/JS Quads to retract (for diff generation)
- `lang` (string, optional) — Preferred language for labels (e.g., `'en'`, `'es'`, `'fr'`). Priority: specified lang → untagged → English → any language

**Returns:** `{ text, context, compactStats }`

- `text` — Generated MDLD text
- `context` — Full context with prefixes
- `compactStats` — Compaction metrics

**Features:** Visual styling, label-in-heading, round-trip safe, diff generation, language preference.

**Example with language preference:**
```javascript
const { text } = generate({
  quads: result.quads,
  lang: 'es'  // Prefer Spanish labels
});
```

### `generateNode({ quads, focusIRI, context, compactInline, renderReverse, lang })`

Generate node-centric MDLD for a specific IRI.

**Parameters:**
- `quads` (array, required) — RDF/JS Quads to search
- `focusIRI` (string, required) — IRI to center view on
- `context` (object, optional) — Prefix mappings
- `compactInline` (boolean, optional) — Inline compaction (default: `true`)
- `renderReverse` (boolean, optional) — Reverse connections (default: `true`)
- `lang` (string, optional) — Preferred language for labels (e.g., `'en'`, `'es'`, `'fr'`). Priority: specified lang → untagged → English → any language

**Returns:** `{ text, context, compactStats }`

**Safety:** Returns empty text if focusIRI not found (prevents accidental full database rendering).

### `updateValue({ text, quad, value, origin })`

Update carrier text of a literal quad in MDLD text.

**Parameters:**
- `text` (string) — Original MDLD text
- `quad` (object) — Quad to update
- `value` (string) — New carrier text
- `origin` (object, optional) — ParseResult.origin

**Returns:** Updated MDLD text (fail-safe)

**Use case:** Editor applications updating literal values.

### `locate(quad, origin)`

Locate quad origin entry for UI navigation.

**Returns:** `{ blockId, range, valueRange, carrierType, ... }` or `null`

### `render(mdld, options?)`

Convert MD-LD to semantic HTML with preserved annotations.

**Parameters:**
- `mdld` (string, required) — MD-LD formatted text
- `options` (object, optional):
  - `context` (object) — Additional prefix mappings

**Returns:** `string` — Semantic HTML with `data-annotation` attributes

**Features:**
- Preserves complete MD-LD syntax in `data-annotation` for roundtrip reconstruction
- Resolves IRIs into `data-iri` attributes for easy querying
- Adds semantic CSS classes: `.mdld-heading`, `.mdld-link`, `.typed`, `.retracted`
- Platform-agnostic: works in Node.js, Deno, browsers, edge workers

**Example:**
```javascript
const html = render('# Alice {=ex:alice .Person label}');
```
produces 
```html
<h1 class="mdld-heading typed" 
     data-annotation="{=ex:alice .Person label}" 
     data-iri="http://example.org/alice">Alice</h1>
```

### `deconstruct(html)`

Reconstruct MD-LD from rendered HTML via pure string scanning.

**Parameters:**
- `html` (string, required) — HTML produced by `render()`

**Returns:** `string` — Reconstructed MD-LD text

**Roundtrip invariant:**
```javascript
parse(deconstruct(render(mdld))).quads === parse(mdld).quads
```

**Example:**
```javascript
const html = '<h1 data-annotation="{=ex:alice .Person label}">Alice</h1>';
const mdld = deconstruct(html);
// # Alice {=ex:alice .Person label}
```

**Use cases:**
- Server-side rendering: render MD-LD to HTML, send to client
- Client-side graph extraction: `parse(deconstruct(document.body.innerHTML))`
- Offline-first apps: cache HTML, reconstruct quads on demand

## Styling by Type

Use CSS attribute selectors to style elements by their RDF types:

```css
/* Style all Person entities */
[data-iri$="Person"] { color: green; }

/* Style all Recipe entities */
[data-types*="Recipe"] { background: #fff3cd; }

/* Style entities with specific IRI */
[data-iri="http://example.org/alice"] { font-weight: bold; }
```

## 🕸️ Crawling the graph — `crawl.js`

MD-LD documents link to each other with ordinary Markdown links, so the graph
is already on the wire — you just need to follow it. `crawl.js` is a
**zero-dependency crawler primitive** that does exactly that: fetch raw text,
extract links, recurse. It knows nothing about MD-LD — the parser is applied at
the call site, which keeps the core pure and the crawler reusable for *any*
linked text format.

New in **v1.0.9**. Ships as a separate entry point (`mdld-parse/crawl`) and is
self-contained enough to load straight from the browser console — no bundler,
no build step:

```js
// Browser console, on any MD-LD site
const { crawl } = await import('/crawl.js');
const { pages, errors } = await crawl('/index.md', { sameOrigin: true });
console.table(pages.map(p => ({ url: p.url, depth: p.depth, links: p.links.length })));
```

```js
// Node ≥ 18 / Deno / Bun
import { crawl } from 'mdld-parse/crawl';
const { pages } = await crawl('https://mdld.js.org/index.md', { maxPages: 25 });
```

Full pipeline — crawl the graph, parse every document into its own named graph:

```js
import { crawl } from 'mdld-parse/crawl';
import { parse, deconstruct } from 'mdld-parse';

const { pages } = await crawl('/index.md', { sameOrigin: true, cache: myCache });

const results = pages.map(p => parse({
  text: p.kind === 'html' ? deconstruct(p.text) : p.text, // HTML is a first-class transport
  graph: p.finalUrl,                                      // redirect-correct document identity
}));
const quads = results.flatMap(r => r.quads); // the whole crawled graph, provenance intact
```

### What it extracts

Both scanners run on **every** document — inline HTML is valid CommonMark, so
documents are routinely mixed:

- **Markdown**: inline links & images `[text](url)`, reference definitions
  `[label]: url`, autolinks `<https://…>`
- **HTML**: `<a href>` — comment-aware, quote-aware, entities decoded;
  `<script>`/`<style>` contents are skipped

Extraction is character-scanned (no regex in hot paths) and context-aware:
fenced code blocks, code spans and HTML comments never yield phantom links.

### Options

| Option | Default | Description |
| --- | --- | --- |
| `maxDepth` | `5` | Maximum link distance from the start document |
| `maxPages` | `100` | Hard cap on fetched pages — untrusted graphs can't balloon the crawl |
| `concurrency` | `5` | Maximum in-flight fetches |
| `sameOrigin` | `false` | Restrict the crawl to the start document's origin |
| `cache` | `memoryCache()` | Any `{ get, set, delete? }` adapter |
| `fetchFn` | `globalThis.fetch` | Wrap for retries, auth, proxies, rate limits |
| `accept` | docs extensions | `(url) => boolean` target filter |
| `onPage` | — | Per-page callback — parse incrementally while the crawl is in flight |
| `signal` | — | `AbortSignal` — cancels and resolves with partial results |

### Cache

Caching is a three-method interface — bring your own storage:

```js
const cache = {
  async get(url) { /* → { text, etag, lastModified, ... } | null  */ },
  async set(url, entry) { /* persist */ },
  async delete(url) { /* evict */ },
};
```

Conditional requests are automatic: stored `ETag` / `Last-Modified` are re-sent
as validators, `304` responses cost zero bytes and zero re-parse, and on 5xx or
network failure the cached copy is served (stale-if-error). Cache failures are
swallowed — a broken adapter (e.g. Safari private mode) degrades to "no cache",
never to a failed crawl. Drop-in adapters for IndexedDB, localStorage and Node
JSON-file caching live in `docs/cache-adapters.md`.

### Guarantees

- **Deterministic** — pages return in BFS discovery order, never completion order
- **Bounded** — `maxDepth`, `maxPages`, http(s)-only protocol allow-list, binary content-types rejected
- **Partial-result-safe** — errors are collected in `result.errors`; the crawl continues
- **Cancellable** — `AbortSignal` yields `{ aborted: true }` plus everything fetched so far

### Utility Functions

```javascript
import {
  DEFAULT_CONTEXT,    // Default prefix mappings
  DataFactory,        // RDF/JS DataFactory
  hash,              // String hashing
  expandIRI,         // IRI expansion
  shortenIRI,        // IRI shortening
  parseSemanticBlock // Semantic block parsing
} from 'mdld-parse';
```

## 🏗️ Architecture

### Design Principles
- **Zero dependencies** — Pure JavaScript, 101KB unminified (24KB gzipped)
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Character-based tokenization** — 20-28% faster than regex-based approaches
- **Standards-compliant** — RDF/JS data model, W3C CURIE 1.0 syntax
- **Deterministic** — Same input always produces same output
- **Explicit semantics** — No guessing, inference, or heuristics
- **Dual-layer origin** — Every parse emits both a semantic quad graph and a walkable textual topology graph simultaneously
- **HTML as codec** — Lossless roundtrip between MD-LD and HTML via `render()`/`deconstruct()`

### Origin: Blocks and Spans

The parser output includes a complete document chain at no extra cost:

```
[Block] --(Span)-- [Block] --(Span)-- [Block]
```

- **Blocks** (`origin.blocks`) — semantic anchors: tokens that produced RDF quads, with `prevSpanId`/`nextSpanId` links
- **Spans** (`origin.spans`) — textual observations: raw byte ranges between blocks, with bidirectional block and span links

Spans store no text — content is always recovered via `sourceText.slice(span.range[0], span.range[1])`. This unlocks context-aware UI, autocomplete neighborhood retrieval, and cross-document topology without any parser-level interpretation.

### HTML Codec: Server/Client Equivalence

The `render()` and `deconstruct()` pair enables two equivalent workflows:

**Server-Side Rendering (SSR):**
```
MD-LD files → render() → HTML → Browser
                              ↓
                    deconstruct() → parse() → quads
```

**Client-Side Rendering (CSR):**
```
MD-LD files → Browser → render() → HTML
                         ↓
                    deconstruct() → parse() → quads
```

Both modes produce identical quads. The choice depends on your deployment model:
- **SSR:** Better for SEO, faster initial page load, works without JavaScript
- **CSR:** Better for offline-first apps, reduces server load, enables dynamic updates

**Bandwidth optimization:**
- Full fidelity: `render(mdld)` includes `data-annotation` for roundtrip
- Lossy mode: `render(parse(mdld).md)` strips annotations for privacy-preserving publishing
- HTML payload is 2-3x smaller than MD-LD + JSON-LD combination

**Use cases:**
- Personal knowledge bases (Obsidian-like, web-native)
- Community wikis with semantic search
- Offline-first research notes with citations
- Collaborative task management with provenance
- Reading lists that become knowledge graphs
- Meeting notes with automatic linking
- Decentralized community event calendars

### Performance Characteristics
- **Real-time (60fps):** Up to 4,527 quads per frame
- **Batch processing:** Up to 225,059 quads per second
- **Memory efficient:** ~640 bytes per quad retained after GC
- **Streaming-friendly:** Full document never in memory

### RDF/JS Compatibility
Quads work with:
- [`n3.js`](https://github.com/rdfjs/N3.js) — Turtle/N-Triples serialization
- [`rdflib.js`](https://github.com/linkeddata/rdflib.js) — RDF stores
- [`sparqljs`](https://github.com/RubenVerborgh/SPARQL.js) — SPARQL queries
- [`rdf-ext`](https://github.com/rdf-ext/rdf-ext) — RDF utilities

### Standards Compliance
- **RDF 1.1** — Core RDF concepts
- **RDFS** — Schema vocabulary
- **PROV-O** — Provenance ontology
- **SHACL** — Constraint validation
- **W3C CURIE 1.0** — Compact URI syntax

## 🧪 Testing

```bash
pnpm test
```

Comprehensive test suite covering:
- Syntax parsing and tokenization
- Context management and prefix folding
- Polarity system and retractions
- Elevated statements detection
- Primary metadata extraction
- Round-trip parse/generate cycles
- HTML codec roundtrip — `mdld = deconstruct(render(mdld))` 
- Origin tracking and provenance


## 📚 Documentation Hub

- **📋 [Specification](./spec/index.md)** — Formal specification and test suite
  - [Formal Specification](./spec/Spec.md)
  - [Compact Spec](./spec/Spec-compact.md)
  - [Ultra Compact Spec](./spec/Spec-ultra.md)

- **📚 [Grammar](./grammar/index.md)** — EBNF+TextMate grammar specifications
- [The TextMate grammar](./grammar/mdld.tmLanguage.json)
- [ISO 14977 EBNF grammar](./grammar/mdld.ebnf)

- **📖 [Documentation](./docs/index.md)** — Complete documentation with guides and references
  - [MD-LD Authoring Guide](./docs/Guide.md)
  - [One Page Guide](./docs/one-page.md)
  - [Semantic Infrastructure as Readable Text](./docs/Semantic-Text.md)
  - [Elevated Statements](./docs/statements.md)
  - [Primary Metadata System](./docs/primary-subject.md)
  - [Origin System](./docs/origin.md)
  - [Polarity & Retraction](./docs/polarity.md)
  - [Subject System](./docs/Subject.md)
  - [API Reference](./docs/API.md)
  - [Generate: Quads to MDLD](./docs/generate.md)
  - [Render MDLD to HTML and deconstruct it back](./docs/render.md)
  - [Diff Documents](./docs/diff.md)
  - [Syntax Reference](./docs/Syntax.md)
  - [Architecture & Design](./docs/Architecture.md)
  - [Parser Architecture](./docs/Parser.md)
  - [Performance Benchmarks](./docs/Performance.md)
  - [Token Efficiency](./docs/Token-Efficiency.md)
  - [Knowledge Round Trip](./docs/Knowledge-Round-Trip.md)
  - [Human-Scale Software & Semantic Infrastructure](./docs/Human-Scale.md)
  - [Quad[] as a Universal Semantic Runtime](./docs/quad-runtime.md)
  - [Use Cases](./docs/Use-Cases.md)

- **🎯 [Examples](./examples/index.md)** — Real-world MD-LD examples and use cases
  - [Minimal](./examples/demo/minimal.md)
  - [One-Page Guide](./examples/one-page.md)
  - [Few-Shot Examples](./examples/few-shot.md)
  - [Journal](./examples/demo/journal.md)
  - [Tasks](./examples/demo/tasks.md)
  - [Medical AI Research](./examples/demo/research.md)
  - [Cookbook](./examples/Cookbook.md)
  - [Website Redesign Project](./examples/demo/project.md)
  - [Task Management System](./examples/demo/tasks.md)
  - [Cassini-Huygens Mission](./examples/demo/space-mission.md)
  - [RDF Fundamentals](./examples/demo/rdf.md)
  - [Statements Golden Graph](./examples/statements.md)
  - [PROV-O Patterns](./examples/demo/prov.md)
  - [SHACL Validation](./examples/demo/shacl.md)
  - [XSD Datatypes](./examples/demo/xsd.md)
  - [Status & SHACL Validation](./examples/Status-SHACL.md)
  - [LLM Time Workflow](./examples/llm-time-workflow.md)
  - [Research Workflow](./examples/workflow.md)
  - [Dogfood](./examples/dogfood.md)

- **💻 [Reference server](./server/index.md) - a Node.js implementation of the server for git-powered semantic workflows and publishing
  - [Source code](./server/mdld-server.js)

- **🧩 [Ontologies](./ontologies/index.md)** — W3C and related standard ontologies used in RDF
  - [RDF — Resource Description Framework](./ontologies/rdf.md)
  - [RDFS — RDF Schema](./ontologies/rdfs.md)
  - [SHACL — Shapes Constraint Language](./ontologies/shacl.md)
  - [PROV-O — W3C Provenance Ontology](./ontologies/prov-o.md)
  - [XSD — XML Schema Definition Datatypes](./ontologies/xsd.md)
  - [DCTERMS — Dublin Core Metadata Terms](./ontologies/dcterms.md)
  - [DCAT — Data Catalog Vocabulary](./ontologies/dcat.md)
  - [FOAF — Friend of a Friend](./ontologies/foaf.md)
  - [VCard](./ontologies/vcard.md)
  - [Time — OWL-Time Ontology](./ontologies/time.md)
  - [Activity Streams 2.0](./ontologies/activity-streams-2.md)
  - [SKOS — Simple Knowledge Organization System](./ontologies/skos.md)
  - [Schema.org](./ontologies/schemaorg.md)
  - [CIDOC CRM — Conceptual Reference Model](./ontologies/cidoc_crm.md)
  - [SOSA — Sensor, Observation, Sample, and Actuator](./ontologies/sosa.md)
  - [QUDT — Quantities, Units, Dimensions and Types](./ontologies/qudt.md)
  - [GOLD — General Ontology for Linguistic Description](./ontologies/gold.md)
  - [LexInfo — Lexical Information Ontology](./ontologies/lexinfo.md)
  - [OWL — Web Ontology Language](./ontologies/owl.md)
  - [P-PLAN — Plan Ontology](./ontologies/p-plan.md)
  - [Hydra — Hypermedia API Vocabulary](./ontologies/hydra.md)
  - [Web Annotations](./ontologies/web-annotations.md)

## Governance

MD-LD is a craft project. Its coherence comes from a single evolving understanding of how semantic text should work — not from consensus, but from sustained attention to the same problem over time.

This means:

- Decisions are made by the steward, informed by discussion and use
- The project prioritizes conceptual integrity over inclusiveness
- Contributions that align with the model are welcomed and incorporated
- Contributions that expand scope without deepening coherence are respectfully declined
- The spec will not grow features to attract users — it will grow depth to serve understanding

## Licensing

MD-LD is currently published as copyrighted source material.

The project is under active development and no open-source license has been selected yet.

Individuals, researchers, educators, and non-commercial users are welcome to experiment with the technology.

Organizations interested in production or commercial use should contact the author.

The long-term governance and licensing model remains under evaluation.

The primary goal at this stage is preserving the simplicity, interoperability, and long-term integrity of the system while the ecosystem forms around it.
