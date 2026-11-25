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

**Zero install — paste into any browser console:**

```javascript
const m = await import('https://mdld.js.org/mdld-parse.js')
const { parse, evaluate, shortenIRI, recordTable } = m
const mdld = `[ex] <tag:demo,2026:>
# Signup sheet {=ex:Sheet .sh:NodeShape label}
Every [User] {+ex:User ?sh:targetClass} needs **name** {+#nameRule ?sh:property sh:name}, **email** {+#emailRule ?sh:property sh:name} and **age** {+#ageRule ?sh:property sh:name}.
[Email is required — {$focusNode}] {=#emailRule .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [email] {+ex:email ?sh:path}.
[Name] {=#nameRule .sh:PropertyShape sh:name} reads our [name] {+ex:name ?sh:path}.
[Age] {=#ageRule .sh:PropertyShape sh:name} reads our [age] {+ex:age ?sh:path}.
# Bobby {=ex:Bob .ex:User label}
[Bobby] {ex:name} is [34] {ex:age ^^xsd:integer}`
document.body.innerHTML = `<style>
  #demo{background:#fff;color:#111;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;padding:14px;max-width:960px}
  #demo mdld-editor,#demo quad-graph{display:block;border:1px solid #ddd;border-radius:8px;margin-top:8px}
  #out{margin-top:8px;color:#111}#out h3{margin:.8em 0 .2em;font-size:1em}#out table{border-collapse:collapse}#out th,#out td{padding:2px 10px 2px 0;text-align:left;vertical-align:top}#out th{font-weight:600;opacity:.75}#out ul{margin:.2em 0;padding-left:1.2em}.violation{color:#c00;}
</style><div id="demo">
<mdld-editor height="42svh"></mdld-editor>
<quad-graph height="320"></quad-graph>
<div id="out"></div></div>`
const ed = document.querySelector('mdld-editor')
ed.value = mdld                                  // edit this — graph + records follow live
const g = document.querySelector('quad-graph'), out = document.getElementById('out')
const esc = s => String(s).replace(/[&<>]/g, c => '&#' + c.charCodeAt(0) + ';')
function update() {
  try {
    const { quads, context } = parse({ text: ed.value })
    g.context = context; g.quads = quads         // graph appears/updates instantly
    const r = evaluate({ quads, context })
    const bad = r.violations.map(v => `<li class="violation">✗ ${esc(v.message || v.component.value)}</li>`).join('')
    const rec = Object.entries(r.records).flatMap(([shape, nodes]) =>
      Object.entries(nodes).map(([node, pojo]) =>
        `<h3>${esc(shortenIRI(shape, context))} › ${esc(node)}</h3>${recordTable(pojo)}`)).join('')
    out.innerHTML = (bad ? `<ul>${bad}</ul>` : '') + (rec || '<p>no records</p>')
  } catch (e) { out.textContent = 'parse error: ' + e.message }
}
let t; ed.addEventListener('input', () => { clearTimeout(t); t = setTimeout(update, 200) })
update()
// → ✗ Email is required — tag:demo,2026:Bob
// → tag:demo,2026:Sheet › tag:demo,2026:Bob renders as a semantic recordTable()
```

That's the whole engine booting in one paste — parser, SHACL evaluator, syntax-highlighted live editor, and the visual cortex. Type in the editor and watch the graph re-layout while `evaluate()` streams violations and typed records back as compact lines.

### Node.js

Install the package:

```bash
pnpm install mdld-parse
```

Or use `importmap` in the browser:

```html
  <script type="importmap">
    {
      "imports": {
        "mdld-parse": "https://mdld.js.org/mdld-parse.js"
      }
    }
  </script>
```


```javascript
import { parse, generate, merge, render, deconstruct, highlight } from 'mdld-parse';

// Parse MDLD to RDF quads
const { quads, primary, statements, origin } = parse({ text: mdldString });
console.log(quads); // RDF/JS quads
console.log(primary); // Primary metadata (subject, type, label, comment)
console.log(statements); // Elevated statements
console.log(origin); // Provenance tracking

// Generate MDLD from quads
const { text } = generate({ quads });

// Highlight MDLD text with syntax coloring
const highlighted = highlight(text);

// Render to semantic HTML with preserved annotations
const html = render(text);

// Reconstruct MDLD from HTML (lossless roundtrip)
const reconstructed = deconstruct(html);
const reconstructedQuads = parse(reconstructed).quads; // Same quads as original!

// Verify roundtrip integrity by using generate() as canonicalization
const canonical = generate({ quads: reconstructedQuads });
console.log('Roundtrip preserved:', text === canonical.text);

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


## 📚 Documentation Hub

- **📋 [Specification](./spec/index.md)** — Formal specification and test suite    
- **📚 [Grammar](./grammar/index.md)** — EBNF+TextMate grammar specifications    
- **📖 [Documentation](./docs/index.md)** — Complete documentation with guides and references    
- **🎯 [Examples](./examples/index.md)** — Real-world MD-LD examples and use cases    
- **💾 [Reference server](./server/index.md)** - a Node.js implementation of the server for git-powered semantic workflows and publishing   
- **🧩 [Ontologies](./ontologies/index.md)** — W3C and related standard ontologies used in RDF    

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

**Bundle size:** ~222KB unminified, ~60KB gzipped (~55.5K tokens) — the complete engine in one file

## 📦 Installation

**One file. Zero dependencies. Fully self-contained** — `mdld-parse.js`
(~222 kB) is the entire engine: parser, canonical generator, SHACL validator
(`evaluate`/`validate`/`extract`), graph renderer (`<quad-graph>`, browser-only,
exported as `undefined` elsewhere), merge, render, and highlight. There are no
sub-path exports — everything is importable from `'mdld-parse'`, and the file
can be air-gapped, vendored, or embedded anywhere ESM runs.

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

**Canonical output:** `generate()` is a deterministic serializer — quads are normalized into a total order (subject → predicate → object → term type → datatype → language) before rendering, so the same quad *set* always produces byte-identical text regardless of input array order. This makes it usable for RDF graph comparison: `generate(g1).text === generate(g2).text` iff the graphs are equal (modulo blank nodes, which are out of scope, and named graphs, which MD-LD does not serialize). Note that options (`context`, `primarySubject`, `compactInline`, `renderReverse`, `lang`, `remove`) are part of the canonical form — compare outputs generated with the same options.

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
- External links (`http(s)://`, `mailto:`, any scheme, protocol-relative) get `target="_blank" rel="noopener noreferrer"`; fragment (`#`) and relative links stay on-page
- Full CommonMark inline links: `[text](#fragment)`, `[text](/path)`, `[text](mailto:…)`, titles (`[t](url "title")`), and images `![alt](src)`
- Entity references (`&amp;`, `&copy;`, `&#169;`, `&#xA9;`) decode; backslash escapes (`\*`) suppress markup
- Standard Markdown/HTML passthrough: raw HTML blocks (`<table>`, `<div>`, …), inline HTML, hard breaks (`<br />`), and indented code blocks render per CommonMark; code stays escaped
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

**Notes:**
- Raw HTML blocks pass through `deconstruct()` verbatim, so `<table>` and friends roundtrip losslessly
- `deconstruct()` only recognizes elements carrying `mdld-*` classes — hand-written HTML without them is treated as raw passthrough

**CommonMark compatibility — deliberate limitations:**
- **Setext headings** (`Title` + `===`/`---`) are not supported: they need lookahead that conflicts with per-line annotation parsing, and `---` already means `<hr>`. Use ATX `#` headings.
- **Reference-style links** (`[text][ref]`, `[ref]: url`) are not supported: definitions require document-level state that wouldn't survive `deconstruct()` round-trips anyway. Use inline `[text](url)`.
- **Shortcut references** (`[ref]` alone as a link) conflict with MD-LD's `[text]` bracket-span syntax.
- **GFM extensions** (pipe tables, `~~strikethrough~~`, task lists, `www.` autolinks) are out of scope — use raw HTML for tables.
- Combined emphasis `***text***` renders as `*<strong>text</strong>*`, not nested `<em><strong>`.
- Empty link destinations `[text]()` stay literal; indented code inside list items is not recognized; inline HTML tags are dropped by `deconstruct()` (inner text preserved).

## 🎨 Graph Visualization — `<quad-graph>`

Visualize your RDF quads as an interactive force-directed graph with the zero-dependency `<quad-graph>` web component.

### Quick Start

`<quad-graph>` ships **inside** `mdld-parse.js` — importing the library in a
browser registers the custom element automatically. No second import, no
sub-path, no extra file:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
    { "imports": { "mdld-parse": "https://mdld.js.org/mdld-parse.js" } }
  </script>
</head>
<body>
  <quad-graph height="600"></quad-graph>
  <script type="module">
    import { parse } from 'mdld-parse';   // registers <quad-graph> as a side effect
    const graph = document.querySelector('quad-graph');

    const mdld = `[ex] <tag:example.org,2026:>
# Alice {=ex:alice .prov:Person label}
[Alice] {ex:name} knows [Bob] {+ex:bob ?ex:knows}`;

    const result = parse({ text: mdld });
    graph.context = result.context;
    graph.quads = result.quads;
  </script>
</body>
</html>
```

### Node.js / non-browser

`QuadGraph` is exported but **`undefined` outside the DOM** — feature-detect:

```javascript
import { QuadGraph, parse } from 'mdld-parse';
if (QuadGraph) { /* browser only — render graphs */ }
```

The rest of the engine (parse, generate, evaluate, extract, render) is
fully environment-agnostic — the visual layer simply stays dormant.

### Features

- **Zero dependencies** — Pure Canvas2D rendering, ~820 LOC
- **Interactive** — Wheel/pinch zoom, drag background to pan, drag nodes to move, double-click to pin/unpin
- **Neighborhood highlighting** — Hovering a node dims the rest of the graph and lights up its direct connections at ~50% strength; selecting does the same at 100%. Both fade smoothly in and out
- **Force-directed layout** — Barnes-Hut quadtree for performance, time-sliced across frames
- **Collision-free labels** — Greedy placement with viewport culling
- **Dark theme** — High contrast light text on dark background
- **Customizable** — Attributes for height, charge, link distance, labels
- **Layout persistence** — `persist = true` saves node positions and viewport across reloads via `localStorage` (opt-in, privacy-safe hashed keys)
- **API methods** — `focus(iri)`, `select(iri)`, `fit()`, `pin(iri, on)`, `reheat()`, `getNode(iri)`, `positions` get/set, `persist` get/set

### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `height` | `480px` | Component height |
| `charge` | `40` | Repulsion force between nodes |
| `link-dist` | `45` | Preferred link length |
| `labels` | `on` | Set to `"off"` to hide labels |

### API Methods

```javascript
const graph = document.querySelector('quad-graph');

// Focus on a specific node
graph.focus('http://example.org/alice');

// Select a node
graph.select('http://example.org/bob');

// Fit graph to viewport
graph.fit();

// Pin/unpin a node
graph.pin('http://example.org/alice', true);

// Reheat the simulation
graph.reheat();

// Get node data
const nodeData = graph.getNode('http://example.org/alice');
// { id, label, x, y, degree, pinned, type, literals }

// Persist layout + viewport across reloads (localStorage, opt-in)
graph.persist = true;

// Manual layout seed/restore — { iri: [x, y] }, takes precedence over the store
graph.positions = { 'http://example.org/alice': [120, -40] };
const saved = graph.positions;   // snapshot of current layout
```

### Layout persistence (`persist`)

Set `graph.persist = true` and the component remembers where you left off:

- **Node positions** go into a single shared `localStorage` ring buffer (`qg:positions`, ~12k entries) keyed by a 64-bit hash of each IRI — IRIs are never stored in plaintext. All `<quad-graph>` instances share the store, so nodes keep their positions across documents and edits: unchanged subjects stay put while the rest of the graph rearranges around them.
- **Viewport** (zoom + pan) is anchored to the node nearest screen-center and stored per document under `qg:views`, keyed by an order-independent hash of the quad set — so it survives window resizes and falls back to the absolute transform if the anchor node disappears.
- Positions are saved when the layout settles, on page hide, and on disconnect; everything is `try/catch`-guarded and silently no-ops where `localStorage` is unavailable.
- Blank nodes (`_:` ids) are skipped — their ids aren't stable across parses. An explicit `graph.positions = {...}` assignment always wins over the store.

### Events

```javascript
graph.addEventListener('node-click', (e) => {
  console.log('Clicked:', e.detail); // IRI string
});

graph.addEventListener('node-select', (e) => {
  console.log('Selected:', e.detail); // IRI string or null
});

graph.addEventListener('node-hover', (e) => {
  console.log('Hovered:', e.detail); // IRI string or null
});

graph.addEventListener('settled', () => {
  console.log('Layout settled');
});
```

## ✏️ `<mdld-editor>`

A zero-dependency MD-LD editor custom element — a transparent `<textarea>` over a `highlight()`-painted backdrop, so you get syntax highlighting with fully native editing (caret, selection, IME, undo). Ships inside `mdld-parse.js` and auto-registers in the browser, same as `<quad-graph>`.

```html
<mdld-editor id="editor" height="80svh"></mdld-editor>
<script type="module">
  import { parse } from 'mdld-parse';
  const ed = document.getElementById('editor');
  ed.value = '[ex] <tag:demo,2026:>\n# Alice {ex:alice .prov:Person}';
  ed.addEventListener('input', () => {
    const { quads } = parse({ text: ed.value });
    document.querySelector('quad-graph').quads = quads;
  });
</script>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `value` | `''` | Initial/editor content (also a get/set property) |
| `height` | `320px` | Editor height (`80svh`, `400px`, …) |
| `placeholder` | — | Placeholder text |
| `readonly` | off | Read-only mode |

- **Events** — `input` bubbles normally; listen on the element for live parse-on-type
- **Methods** — `focus()`
- **Theming** — `--mdld-text`, `--mdld-caret`, `--mdld-placeholder` CSS vars; font is fixed 12px monospace with `tab-size: 2`
- **Keys** — Tab inserts two spaces
- `MdldEditor` is exported but `undefined` outside the DOM — feature-detect like `QuadGraph`

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

## 🕸️ Crawling the graph

MD-LD documents link to each other, so the graph is already on the wire.
Link-following is a **client concern**, not a library one — it lives in the
playground (`demo/crawl.js`) and is documented in `docs/crawl.md`. The core
stays pure: given knowledge, it parses, validates, extracts, renders, and
displays it — acquisition is the caller's job.

## ✅ SHACL Validation

A zero-dependency, synchronous **SHACL Core validator** (~1,600 LOC, no RDF libraries) that consumes `mdld-parse` quads directly — and doubles as a **projection engine**: the same shapes that validate also extract.

```js
import { evaluate, validate, extract, recordTable } from 'mdld-parse';

// evaluate() — the core operation: one traversal, both views
const report = evaluate({ quads, allowJS: true });
// report.violations — what failed    report.records — what conforms (POJOs)
// violations and records are mutually exclusive by construction
// recordTable(pojo) renders one record as a semantic HTML table (no CSS)

// validate() / extract() are thin views over evaluate()
const v = validate({ quads });                // → { conforms, results }
const pojos = extract({ quads }, 'tag:ex,PersonShape');
// or: new Validator(shapeQuads).validate(dataQuads)
```

- **Full SHACL 1.1 Core surface** — every constraint component (except
  `qualifiedValueShapesDisjoint`, deprecated in the 1.2 WD), all target
  types, all property path types (IRI structures — no blank nodes needed),
  logical constraints (`not`/`and`/`or`/`xone` with RDF lists), qualified
  counts, closed shapes, `sh:message` templates
  (`{$value}`/`{$path}`/`{$focusNode}`), `sh:severity`/`sh:deactivated`,
  and `sh:js` (opt-in). SHACL 1.2 WD additions are documented future work.
- **SHACL-JS** (`sh:js` → `sh:JSConstraint` → `sh:script`) — opt-in via
  `allowJS: true`, disabled by default so untrusted shapes can't execute code
- **Out of scope by design** — SHACL-SPARQL, SHACL-AF, external JS libraries
- **Shape-driven extraction (v1.2.1)** — `extract()` projects quads through
  a shape into typed JS objects (`sh:name` keys, datatype casting, nested
  `sh:node`/`sh:qualifiedValueShape`, RDF lists → arrays) — emitting only
  fields that conform, so every key is a validated fact;
  `extractGraph()`
  returns the quad sub-graph a shape permits — the `rdf-lens` idea with zero
  dependencies
- **Record tables** — `recordTable(pojo)` renders one `evaluate()`/`extract()`
  record as a semantic HTML table: escaped text, `<time>` dates, nested
  POJOs/arrays, no CSS — the human-facing finisher for the fixed POJO surface
- **Measured** — `evaluate()` sustains ~500K quads/sec end-to-end (violations + records in one pass, tri-indexed + memoized graph cache): 25,000 products / ~125K quads in ~230ms, Apple Silicon

Extraction uses the same shape — `sh:name` keys, datatype casting, conformance
gating (only validated fields/records are emitted):

```js
import { extract, extractGraph, recordTable } from 'mdld-parse';

const pojos = extract({ quads }, 'tag:ex,2026:PersonShape');
// → [{ name: "Alice", age: 30, address: { city: "Paris" }, tags: ["a","b"] }]
//   only fields that conform — offending keys are simply absent

const sub = extractGraph({ quads }, 'tag:ex,2026:PersonShape');
// → Quad[] with only shape-permitted predicates, nested entities, list chains
// recordTable(pojos[0]) → semantic HTML table for reports/quickstarts
```

The `shapes/` directory is itself a self-validating ecosystem: `catalog.md`
holds 33 executable `cat:Demo` worlds with expected violation counts **and**
expected extractions (`cat:extractedPOJO` blocks, regenerated by
`gen-extracted.js`), `ontology.md` is the W3C vocabulary ground truth, and
`selftest.js` closes the loop — every ontology term accounted for, every demo
verified, every extraction verified, and the catalog validated by its own
SHACL shapes. See `shapes/README.md`.

`ontologies/*.shapes.md` ships **validation packs** — companion shape documents
for the core vocabularies (`rdf`, `rdfs`, `xsd`), each a self-verifying seed
with `pack:Demo` nodes carrying source + expected violations + expected POJOs
in the graph itself. `node ontologies/selftest.mjs` verifies every pack.

```bash
npm run test-shapes   # catalog selftest + all ontology packs
```

### The knowledge loop — canonical text as fixed point

The core workflow: **quads are truth, MD-LD is its canonical rendering.**

```
JS/quads ──generate()──▶ canonical MD-LD ──rewrite prose──▶ parse() ──generate()──▶ same quads?
   ▲                                                                              │
   └──────────────────────────── shapes: validate + extract ◀───────────────────────┘
```

- **Agents** build knowledge as quads in JS, `generate({ quads })` emits
  canonical MD-LD, then prose is rewritten *around* the annotation
  carriers — never inside them. `parse(text) → generate(quads)` must
  reproduce the canonical text quad-identically: that's the definition of
  a graph-preserving transformation, checked mechanically.
- **Humans** edit the same text — narrative first, carriers invisible.
  The graph view exposes orphans and broken links instantly.
- **Shapes are queries.** `validate()` reports violations;
  `extract({ quads, context }, shapeIRI)` returns clean typed JSON —
  only conforming fields and records — shareable without the graph;
  `extractGraph` does the same for RDF.

Worked example: `examples/demo/education.md`. Full API and conformance
semantics: `shapes/README.md`.

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

## 🧬 Epistemology — the eight closures

Every claim in this library is the output of an executed invariant, not a
promise. If a loop fails, it fails loudly — `npm run test-shapes` is the proof.

| # | Loop | Invariant | Mechanism |
|---|------|-----------|-----------|
| I | **Fixed point** | `generate(parse(canonical)) ≡ canonical` | canonical serializer |
| II | **Codec** | MD-LD → HTML → MD-LD → same quads | `render()`/`deconstruct()` |
| III | **Gate** | violations and records are mutually exclusive | `evaluate()` single traversal |
| IV | **Triangle** | spec ↔ docs ↔ code, 101/101 terms | catalog coverage+sync selftest |
| V | **Seeds** | examples carry source+violations+POJOs in-graph | `cat:Demo`/`pack:Demo` nodes |
| VI | **Origin** | every quad maps to byte range in source | `locate()`/`updateValue()` |
| VII | **Merge** | assertion ∩ retraction = ∅, order-independent | `merge()` polarity replay |
| VIII | **Gestalt** | human sees global topology SHACL can't | `<quad-graph>` (browser-only) |

Two rules follow: **conservation** (nothing lost — loops I, II) and **admission**
(nothing false passes — loops III–V). VI–VIII close the loop to the human:
origin makes violations clickable, merge makes collaboration safe, the graph
makes topology visible.

**Conventions for agents**: shapes are contracts (`sh:property` + `sh:path` +
`sh:name`), examples are executable (`cat:Demo`/`pack:Demo` nodes), and
`evaluate({quads})` returns both `violations` and `records` in one pass —
every emitted key is a validated fact. The full catalog (`shapes/catalog.md`,
`ontologies/*.shapes.md`) and essays (`docs/loops.md`, `docs/kernel-alignment.md`)
are in the repo — this README + the single `.js` file are the operational kernel.

## 🏗️ Architecture

### Design Principles
- **Zero dependencies** — Pure JavaScript, ~222KB unminified (~60KB gzipped, ~55.5K tokens), one file
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
