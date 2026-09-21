# The Presentation Layer: HTML as Codec

Knowledge lives in documents, but documents live in the world. A graph in memory is computationally powerful, but a graph on a screen is where human understanding happens. We read, we scan, we follow links, we recognize typographic hierarchy. The web is the universal reading surface, and HTML is its native tongue. But historically, HTML has been a graveyard for semantics. When knowledge is rendered for the screen, the structural meaning is typically stripped away, leaving only visual formatting behind. The graph is lost in translation.

The Semantic Web attempted to solve this with RDFa and JSON-LD — embedding machine-readable triples directly into HTML attributes or script tags. But these approaches suffer from a fundamental impedance mismatch. RDFa tries to map a stream-based scope (the document flow) onto a tree-based scope (the DOM hierarchy), resulting in nested spans, parser ambiguities, and brittle roundtrips. JSON-LD solves the machine side but abandons the presentation side entirely, creating a dual-source-of-truth problem where the visual HTML and the semantic JSON can drift out of sync.

MD-LD rejects this compromise. It begins from a different premise: HTML does not need to *be* the graph. HTML only needs to be a **lossless presentation codec** for the text that produced the graph. 

This document describes the `render()` and `deconstruct()` pair — the bridge between the `Quad[]` runtime and the human eye. It explains how MD-LD turns HTML into a first-class transport format for knowledge graphs, enabling server/client equivalence, offline-first graph extraction, and privacy-preserving publishing, all without the overhead of the Semantic Web stack.

---

## HTML as a Lossless Codec

The core insight of the MD-LD presentation layer is that the rendered HTML must be perfectly reversible. If you render an MD-LD document to HTML, and then deconstruct that HTML back to MD-LD, the resulting text must parse into the exact same quads as the original. 

```js
import { parse, render, deconstruct } from 'mdld-parse'

const original = parse({ text: mdldString })
const html = render(mdldString)
const reconstructed = parse({ text: deconstruct(html) })

// The invariant holds:
// original.quads === reconstructed.quads
```

This is not a "best effort" serialization. It is a mathematical guarantee. The HTML is not a rendering of the graph; it is a serialization of the text that produced the graph. Because the text is the source of truth, and the HTML preserves the text, the HTML becomes a lossless transport layer.

```js
const html = render(`
[alice] <tag:alice@example.com,2026:>
# Alice {=alice:me .prov:Person label}
Knows [Bob] {+alice:bob ?alice:knows}
`)
```

The output is clean, semantic HTML:

```html
<div class="mdld-prefix" data-prefix="alice" data-raw="tag:alice@example.com,2026:" style="display:none"></div>
<h1 class="mdld-heading typed" 
    data-annotation="{=alice:me .prov:Person label}" 
    data-iri="tag:alice@example.com,2026:me">
  Alice
</h1>
<p class="mdld-paragraph">
  Knows <a class="mdld-link" 
           href="tag:alice@example.com,2026:bob" 
           data-annotation="{+alice:bob ?alice:knows}" 
           data-iri="tag:alice@example.com,2026:bob">Bob</a>
</p>
```

Notice what is absent. There is no `typeof="prov:Person"`. There is no `rel="alice:knows"`. There are no nested spans attempting to chain subjects and objects. The renderer deliberately avoids RDFa. Instead, it relies on a single, powerful contract: the `data-annotation` attribute.

---

## The Annotation Contract

The `data-annotation` attribute holds the exact, verbatim MD-LD syntax that generated the element, including the curly braces. This is the bridge back to the source.

Why keep the braces? Why not just store the parsed JSON or the raw tokens? Because the braces make the attribute a **self-contained, valid MD-LD token**. 

1. **DevTools as Debugger:** When you inspect an element in the browser, you see `{=alice:me .prov:Person label}`. You can copy it, paste it into a scratchpad, and it is immediately valid MD-LD. The inspector becomes a direct window into the source document.
2. **Trivial Reconstruction:** The `deconstruct()` function does not need to reverse-engineer a complex AST from HTML attributes. It simply finds the visible text of the element, appends the `data-annotation`, and reconstructs the original Markdown line.
3. **CSS Hooks:** The braces provide syntactic anchors for CSS attribute selectors, allowing you to style elements based on their semantic role without cluttering the DOM with ontology-specific classes.

```css
/* Style all subject declarations */
[data-annotation^="{="] { font-weight: bold; }

/* Style all retractions */
[data-annotation*=" -"] { text-decoration: line-through; opacity: 0.6; }

/* Style specific entities */
[data-iri$="Person"] { border-left: 3px solid green; }
```

This is the first crystallization point: **presentation should not be coupled to ontology**. The renderer provides structural classes (`.mdld-heading`, `.mdld-link`, `.typed`) and raw data attributes (`data-iri`, `data-annotation`). How you style a `prov:Person` versus a `schema:Recipe` is a decision for your application's CSS, not the parser's HTML output. The renderer remains minimal, focused, and entirely agnostic to your vocabulary.

---

## Server, Client, and the Wire

Because the HTML is a lossless codec, it completely dissolves the boundary between Server-Side Rendering (SSR) and Client-Side Rendering (CSR). Both modes produce identical graphs, and you can switch between them based on your deployment constraints without changing your data model.

**Server-Side Rendering:**
Your server reads the `.mdld` file, runs `render()`, and sends the HTML to the browser. The browser displays the document instantly. If the user wants to explore the graph, the client runs `deconstruct(document.body.innerHTML)` and feeds the result to `parse()`. The graph is extracted locally, with zero additional network requests.

**Client-Side Rendering:**
Your server sends the raw `.mdld` text (or fetches it via API). The browser runs `render()` locally to display the document, and `parse()` to build the graph. 

In both cases, the wire carries either HTML or MD-LD, and the client ends up with the exact same `Quad[]` array. 

```js
// Client-side graph extraction from a rendered blog post
const html = document.querySelector('article').innerHTML
const mdld = deconstruct(html)
const { quads } = parse({ text: mdld })

// Now you can render a D3 force graph, run SPARQL, or find related posts
// entirely in the browser, using the HTML that was already downloaded for display.
```

This is the second crystallization point: **HTML is the graph transport**. You do not need to send JSON-LD alongside your blog posts. You do not need a separate API endpoint to fetch the RDF triples. The blog post itself, rendered as standard HTML, is a fully queryable linked data document. The bandwidth cost is minimal, the caching is native to the CDN, and the client-side extraction is instantaneous.

---

## Lossy Projection: Privacy and the Public Web

Not every audience needs your knowledge graph. When you publish a blog post to the open web, you may want to strip the semantic annotations entirely to prevent casual crawlers from harvesting your graph structure, or simply to reduce the payload size.

MD-LD handles this through composition. Because `parse()` returns a clean Markdown string in its `md` property (with all annotations stripped), you can feed that directly into the renderer:

```js
const result = parse({ text: mdldString })
const publicHtml = render(result.md)
```

The resulting HTML contains standard headings, paragraphs, and links, but zero `data-annotation` or `data-iri` attributes. It is a purely visual document. 

This creates a powerful duality for local-first applications:
- **Authenticated / Local View:** Render the full MD-LD. The user sees the document, and the client extracts the graph to power interactive features, backlinks, and visualizations.
- **Public / Lossy View:** Render the stripped Markdown. The public sees a beautiful, fast-loading blog post, and your semantic layer remains private.

The round trip still works perfectly on the lossy HTML — it just deconstructs back into clean Markdown instead of MD-LD. The presentation layer adapts to the privacy requirements of the context without requiring a different rendering engine.

---

## Platform Agnosticism: No DOM Required

A naive implementation of `deconstruct()` would rely on the browser's `DOMParser` to walk the HTML tree. But MD-LD is designed for local-first, offline-capable, edge-computed environments. Relying on browser APIs ties the codec to the DOM, breaking it in Node.js, Deno, Bun, Cloudflare Workers, or server-side static site generators.

Instead, `deconstruct()` is implemented as a **pure string scanner**. Because the `render()` function emits a strictly constrained subset of HTML (a known grammar of tags, attributes, and nesting), the deconstructor can parse it using simple string indexing and regular expressions. 

It looks for `<div class="mdld-prefix">`, `<h1`, `<pre><code`, and `<p class="mdld-paragraph">`. It extracts attributes by name, recursively walks inline nesting by counting tag depth, and unescapes HTML entities. 

```js
// Works identically in Node.js, Deno, and the Browser
import { render, deconstruct } from 'mdld-parse'

const html = render(mdldText)
const mdld = deconstruct(html) 
```

This is the third crystallization point: **the codec is environment-agnostic**. There is no `xmldom`, no `cheerio`, no `jsdom`. The bundle size remains tiny (adding only ~3KB gzipped to the core parser), and the performance is bounded only by raw string operations. You can render MD-LD to HTML in a serverless function, cache it at the edge, and deconstruct it in a service worker offline. The same code runs everywhere.

---

## The Local-First Web

The true power of the HTML codec emerges in local-first, personal, or community-scale applications. Imagine a personal knowledge base — an Obsidian-like vault stored as a directory of `.mdld` files on your local device, synced via Git or IPFS.

When you open a note, the app renders it to HTML for display. But because the HTML is a lossless codec, the app doesn't need to maintain a separate SQLite database or a background indexing process to power the "Graph View". 

```js
// 1. Read all cached HTML files from the local file system
const htmlFiles = await localFS.glob('**/*.html')

// 2. Deconstruct and parse them in a Web Worker
const allQuads = []
for (const html of htmlFiles) {
  const mdld = deconstruct(html)
  const { quads } = parse({ text: mdld })
  allQuads.push(...quads)
}

// 3. Render the interactive knowledge graph
renderForceGraph(allQuads)
```

The HTML files *are* the database. They are cacheable by the browser, readable by the user, indexable by search engines, and perfectly reconstructable into a graph by the application. If the user exports their vault, they can hand the HTML files to a colleague, and the colleague's MD-LD reader will extract the exact same graph.

This applies to community wikis, offline-first research notes, decentralized event calendars, and collaborative task managers. In every case, the architecture is the same: **author in MD-LD, transport as HTML, extract as Quads.**

---

## The Triad of MD-LD

The knowledge round trip relies on three distinct representations, each optimized for a different phase of the knowledge lifecycle:

1. **Text (MD-LD):** The source of truth. Optimized for human authorship, version control, and diffing. It is where knowledge is born and where it returns.
2. **Array (`Quad[]`):** The engine. Optimized for computation, querying, traversal, and validation. It is where knowledge is processed.
3. **Surface (HTML):** The presentation. Optimized for human reading, CSS styling, and network transport. It is where knowledge is perceived.

The `render()` and `deconstruct()` functions are the bridge between the Surface and the Text. Because the bridge is lossless, the Surface never degrades the Source. You can cache the HTML, email the HTML, or render the HTML to a PDF, and the semantic graph is never lost — it is merely waiting to be deconstructed.

This is the final crystallization point of the presentation layer: **HTML is not the end of the line.** In the legacy web, HTML was a terminal format — a visual dead end where data went to be looked at, but not queried. In MD-LD, HTML is a reversible projection. The document is rendered for the eye, but the graph remains intact in the markup, ready to be parsed, traversed, and reasoned over the moment the user decides to look deeper.