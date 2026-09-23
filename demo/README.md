# MD-LD Guide for Agents — Implementation Patterns

A self-contained, single-file web application that serves as both documentation and a live demonstration of MD-LD (Markdown-Linked Data). This README documents the architectural patterns and technical decisions used to create this demo.

## Overview

This project demonstrates a radical approach to semantic web applications: **the content itself is the data**. Instead of separating content from presentation, we embed MD-LD-annotated Markdown directly in the HTML file, then use a rendering engine to parse it into RDF quads and build the UI by querying those quads.

**Key insight:** The page you're reading is itself an MD-LD document. View source → find `<script type="text/plain" id="mdld-source">` to see the knowledge graph that renders this entire guide.

## Architecture

### Single-File Pattern

```
index.html (53 kB)
├── <style> — All CSS (dark theme, responsive)
├── <script type="importmap"> — ESM imports for mdld-parse
├── <body> — HTML skeleton (header, nav, tab containers)
├── <script type="text/plain" id="mdld-source"> — MD-LD source data (the knowledge graph)
└── <script type="module"> — Dumb rendering engine (parses MD-LD → queries graph → builds UI)
```

**Why single-file?**
- Zero build dependencies (except Vite for development)
- Fully portable — just open the HTML file
- Self-documenting — the source is the spec
- Easy to fork and customize
- Works offline (after initial mdld-parse load)

### Importmap for Zero-Build Dependencies

```html
<script type="importmap">
  {
    "imports": {
      "mdld-parse": "https://esm.sh/mdld-parse"
    }
  }
</script>
```

**Why importmap?**
- No npm install, no bundler configuration
- Browser-native ESM imports
- Works in any modern browser
- mdld-parse is 24KB gzipped — loads instantly
- No lock-in — swap CDN if needed

### Rendering Engine

The rendering engine is a ~400-line JavaScript module that:

1. **Parses MD-LD source** into RDF quads using `parse({ text: source })`
2. **Queries the graph** using helper functions:
   - `getByType(typeCurie)` — find all subjects with a given rdf:type
   - `getLiterals(subjectIRI, predCurie)` — get literal values for a subject
   - `getLiteral(subjectIRI, predCurie)` — get first literal value
   - `getObjects(subjectIRI, predCurie)` — get linked resources
3. **Builds HTML** by iterating over query results and generating DOM
4. **Attaches interactivity** (event listeners for tabs, playground, etc.)

**Why query-based rendering?**
- Declarative — describe what you want, not how to build it
- Flexible — change the MD-LD source, UI updates automatically
- Debuggable — inspect the quads to see what's in the graph
- Extensible — add new content types by defining new rdf:type values

## Content Organization

### MD-LD Source Structure

The MD-LD source uses a custom vocabulary (`my:` prefix) to define content types:

```md
[my] <tag:mdld-guide@agents.org,2026:>

# MD-LD Guide {=my:doc .my:Guide label}

## Section {=g:1 .my:Section label}
[1] {my:order ^^xsd:integer}
> Paragraph text {my:p}
> Advantage text {my:advantage}

## Example {=e:1 .my:SyntaxExample label}
[1] {my:order ^^xsd:integer}
[basics] {my:category}
> Description {my:description}
~~~ {my:mdldCode}
MD-LD input
~~~
~~~ {my:quadOutput}
Generated quads
~~~
```

**Content types:**
- `my:Guide` — document metadata (subtitle)
- `my:Section` — guide sections (order, paragraphs, advantages, phases, flows, node types, predicate forms, anti-patterns)
- `my:SyntaxExample` — syntax examples (order, category, description, mdldCode, quadOutput)
- `my:PlaygroundExample` — live playground presets (order, buttonLabel, code)
- `my:Pattern` — agent patterns (patternKind: identity/workflow/structure/reasoning/architecture, description, mdldCode, quadOutput)
- `my:Concept` — knowledge graph nodes (category, description)
- `my:Relation` — knowledge graph edges (from, to, label)
- `my:CheatEntry` — cheatsheet cards (order, cheat lines)

**Key principle: The renderer is dumb.** It doesn't know about "minimal", "person", "prov", etc. It just queries for `my:PlaygroundExample` entities and renders whatever it finds. Add a new playground example by adding a new entity to the graph — no JavaScript changes required.

**Why custom vocabulary?**
- Self-documenting — the types describe their purpose
- Extensible — add new types without changing the renderer
- Queryable — use standard RDF queries to find content
- Interoperable — anyone can parse and understand the structure

### Tab Structure

The guide is organized into 5 tabs, each rendered from different quad types:

1. **Guide** — `my:Section` quads, ordered by `my:order` (18 sections covering syntax, semantics, architecture, and agent patterns)
2. **Syntax** — `my:SyntaxExample` quads, ordered by `my:order` (9 examples from minimal to shop API)
3. **Patterns** — `my:Pattern` quads, grouped by `my:patternKind` (5 patterns: identity, workflow, structure, reasoning, architecture)
4. **Playground** — `my:PlaygroundExample` quads, ordered by `my:order` (6 live parser presets, all from the graph)
5. **Cheatsheet** — `my:CheatEntry` quads, ordered by `my:order` (9 reference cards)

**Why tabs?**
- Progressive disclosure — don't overwhelm with all content at once
- Logical grouping — related content stays together
- Fast navigation — click to switch, no page reload
- Mobile-friendly — tabs work well on small screens

## MD-LD Inline Annotation Grammar

Inside `{ }` curly braces, use these operators to define RDF triples. This is the complete micro-syntax for MD-LD annotations:

### Core Operators

| Operator | Syntax | Meaning | Example |
|----------|--------|---------|---------|
| **Subject Assignment** | `=prefix:local` | Sets the subject IRI for the current block | `{=my:doc}` |
| **Type Assignment** | `.TypeIRI` | Adds `rdf:type` triple (subject a TypeIRI) | `{.my:Guide}` |
| **Predicate (Literal)** | `predicate` | Adds literal triple: subject predicate "block text" | `{my:order}` |
| **Predicate (Object)** | `?predicate` | Adds object triple: subject predicate objectIRI | `{?my:knows}` |
| **Predicate (Reverse)** | `!predicate` | Adds reverse triple: object predicate subject | `{!my:hasPart}` |
| **Object Declaration** | `+prefix:local` | Declares a temporary object IRI | `{+my:bob}` |
| **Literal Datatype** | `^^xsd:type` | Casts literal to XSD datatype | `{my:age ^^xsd:integer}` |
| **Literal Language** | `@lang` | Tags literal with language code | `{my:city @en}` |

### Subject Scoping Rules

**Subject inheritance:** Once you set a subject with `{=my:doc}`, it persists for all subsequent annotations until you change it with another `{=...}` or reset it with `{=}` (bare).

**Block-level inheritance:** Headings (`#`), blockquotes (`>`), and list items (`-`) inherit the subject from their parent heading. Example:

```md
# Section {=g:1 .my:Section label}
> This paragraph inherits subject g:1 {my:p}
- This list item also inherits g:1 {my:item}
```

Both the blockquote and list item emit triples with `g:1` as the subject.

### Combining Operators

You can combine multiple operators in a single `{ }` block:

```md
# Alice {=my:alice .prov:Person label}
```

This emits three triples:
- `my:alice a prov:Person` (type)
- `my:alice rdfs:label "Alice"` (literal from heading text)

### Complete Example

```md
[my] <tag:agent@example.org,2026:>

# Alice {=my:alice .prov:Person label}

Email: [alice@example.org] {my:email}
Age: [34] {my:age ^^xsd:integer}
Knows [Bob] {+my:bob ?my:knows}
```

**Generated quads:**
```turtle
my:alice a prov:Person ;
    rdfs:label "Alice" ;
    my:email "alice@example.org" ;
    my:age "34"^^xsd:integer ;
    my:knows my:bob .
```

### Key Rules

1. **Every triple must come from a `{...}` block** — no implicit semantics
2. **Literals come from carrier text** — `[text]`, `**bold**`, `# heading`, `- list item`, `> quote`, or ` ```code``` `
3. **No blank nodes** — every entity needs a proper IRI (use `tag:` URIs or fragments)
4. **Forward-reference only** — declare prefixes before using them
5. **Default vocabulary is `rdfs:`** — bare `label` means `rdfs:label`, bare `comment` means `rdfs:comment`

## Technical Decisions

### Why MD-LD for Content Storage?

**Traditional approach:** Store content in JSON/YAML/Markdown files, load at build time, generate HTML.

**MD-LD approach:** Store content as MD-LD in the HTML file, parse at runtime, render dynamically.

**Benefits:**
- **Single source of truth** — content and presentation in one file
- **Semantic** — content is a knowledge graph, not just text
- **Queryable** — use RDF queries to find and filter content
- **Mergeable** — multiple agents can collaborate by appending MD-LD
- **Round-trip safe** — parse → generate → parse produces identical quads

**Tradeoffs:**
- Runtime parsing overhead (mitigated by mdld-parse's 24KB size)
- No static site generation (but who needs it for a guide?)
- Requires JavaScript (but that's true for most modern web apps)

### Why Not React/Vue/Svelte?

**Traditional approach:** Use a framework for component-based UI.

**This approach:** Vanilla JavaScript with query-based rendering.

**Benefits:**
- Zero framework dependencies
- Smaller bundle size (53KB total vs 100KB+ with React)
- No build step required
- Easier to understand and modify
- Framework-agnostic pattern (works with any library)

**Tradeoffs:**
- More manual DOM manipulation
- No virtual DOM diffing (but we're not re-rendering frequently)
- Less "modern" feeling (but simpler is better for demos)

### The Dumb Renderer Pattern

**Traditional approach:** JavaScript contains hardcoded content, configuration, and business logic.

**MD-LD approach:** JavaScript is a "dumb" interpreter that queries the graph and renders whatever it finds.

**Example:** The playground tab doesn't know about "minimal", "person", "prov", etc. It queries for `my:PlaygroundExample` entities and renders buttons from `my:buttonLabel` literals. To add a new playground example:

```md
## New Example {=pg:new .my:PlaygroundExample label}
[7] {my:order ^^xsd:integer}
[New] {my:buttonLabel}
~~~~~~ {my:code}
[your MD-LD content here]
~~~~~~
```

That's it. No JavaScript changes. The renderer automatically picks it up.

**Benefits:**
- **Separation of concerns** — content lives in the graph, logic lives in the renderer
- **Extensibility** — add new features by adding new entities, not new code
- **Maintainability** — the renderer is small and stable; content evolves independently
- **Agent-friendly** — AI agents can modify the graph without touching JavaScript

**This is the "Extract-and-Elevate" pattern in action:** Start with everything in one file (Phase 1), extract content into the graph (Phase 2), and the renderer becomes a stable, reusable component that works across all phases.

### The Extract-and-Elevate Lifecycle

This project demonstrates a complete lifecycle of semantic web application development:

**Phase 1: Single-File Prototype**
Everything lives in one `index.html` file. The MD-LD source is embedded in a `<script type="text/plain">` tag. The renderer queries the graph and builds the UI. Zero infrastructure, zero build steps, instant iteration.

**Phase 2: Static Extraction** (not yet implemented in this demo)
Extract the MD-LD source into separate `.md` files. The renderer fetches them via `fetch()`. Content is now decoupled from the HTML, but still static.

**Phase 3: Dynamic Generation** (not yet implemented in this demo)
Replace static files with a backend that generates MD-LD from a database. The renderer doesn't change — it still fetches and parses MD-LD. The contract is preserved.

**Phase 4: Agent-Native API** (not yet implemented in this demo)
The MD-LD endpoint becomes an API that AI agents can consume directly. No JSON, no OpenAPI specs — just Markdown that agents can read and reason over.

**This demo is Phase 1.** It shows the complete pattern in a single file. The renderer is stable and reusable. To move to Phase 2, just extract the `<script type="text/plain">` content into a separate file and fetch it. The renderer code doesn't change.

### Why Dark Theme?

**Decision:** Dark theme with emerald/cyan accents.

**Reasons:**
- Developer-friendly (most devs prefer dark themes)
- Reduces eye strain for long reading sessions
- Makes code blocks stand out
- Matches the "technical documentation" aesthetic
- Looks good in screenshots and demos

### Why Responsive Design?

**Decision:** Mobile-first responsive layout with CSS Grid.

**Reasons:**
- Many developers read docs on mobile
- Code examples should be readable on any device
- CSS Grid makes layout trivial
- No media query hell (just `grid-template-columns: 1fr` on mobile)

## Application Development Patterns

### The Extract-and-Elevate Lifecycle

Traditional web development forces rigid separation: content in a database, logic in an API, presentation in the frontend. MD-LD introduces a paradigm shift: **The Document is the Database, the API, and the Schema.**

The most powerful workflow is the **Extract-and-Elevate** lifecycle — start with zero infrastructure and scale seamlessly without rewriting frontend contracts.

**Phase 1 — Single-File Prototype (Day 1)**
Embed MD-LD directly in `index.html`. Millisecond feedback loop. No build steps, no servers, no databases.

```html
<script type="text/plain" id="mdld-source">
[app] <tag:myapp@local,2024:>
# Welcome {=page:home .app:Page label}
> This is a fully functional prototype. {app:description}
</script>
```

**Phase 2 — Static Extraction (Day 14)**
Extract MD-LD into separate `.mdld` files. Frontend becomes a "dumb" semantic renderer.

```javascript
const response = await fetch('/content/home.mdld');
const { quads } = await parse({ text: await response.text() });
renderUI(quads);
```

*Benefit: Content decoupled from UI, yet 100% human-readable and version-controlled via Git.*

**Phase 3 — Dynamic GET (Month 3)**
Need live data? Don't change the frontend. Replace the static file with a backend route that *generates* the exact same MD-LD text format.

```javascript
// Express.js example
app.get('/products.mdld', async (req, res) => {
  res.setHeader('Content-Type', 'text/markdown');
  const products = await db.query('SELECT * FROM products');
  res.send(generateMDLDFromProducts(products)); 
});
```

*Benefit: Zero-friction scaling. Frontend contract remains perfectly stable.*

**Phase 4 — Dynamic POST (Month 6)**
App needs to write data? Bypass JSON entirely. Client generates MD-LD draft and POSTs as raw text.

```javascript
// Client
await fetch('/api/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'text/markdown' },
  body: generatedMDLDDraft
});

// Server
app.post('/api/submissions', async (req, res) => {
  const { quads } = await parse({ text: req.body });
  // Validate the graph, extract fields, save to DB or file
  res.status(201).send('Graph received and validated.');
});
```

### Pattern: Data-Driven Business Logic

Instead of hardcoding `if/else` statements in JavaScript, encode business rules directly into the MD-LD graph. JavaScript becomes a generic semantic interpreter.

**The MD-LD Source:**
```markdown
## Rule 1 {=rule:high-caffeine .app:TraitRule label}
[3] {app:questionId}
[gte:7] {app:condition}
[⚡ High Voltage] {app:trait}
[red] {app:color}
```

**The JavaScript Interpreter:**
```javascript
// The JS doesn't know about "caffeine" or "High Voltage". 
// It just evaluates the graph.
rules.forEach(rule => {
  const answer = answers[rule.questionId];
  if (evaluateCondition(answer, rule.condition)) {
    applyTrait(rule.trait, rule.color);
  }
});
```

*Benefit: Adding new features, traits, or validation rules requires **zero JavaScript changes**. Just append to the Markdown.*

### Pattern: The Markdown API (Bypassing JSON)

Traditional APIs use `application/json`. MD-LD apps use `text/markdown`. This yields massive advantages:

1. **Self-Documenting Logs**: Server logs contain human-readable Markdown, not opaque JSON blobs. Debugging is instantaneous.
2. **Schema Evolution is Free**: If the frontend sends a new field, the backend doesn't crash. Update the parser at your own pace.
3. **Agent-Native**: LLMs natively understand Markdown. They generate, read, and reason over API payloads without strict JSON formatting or OpenAPI specs.
4. **Replayability**: Failed submissions copy directly from logs, save as `.mdld` files, replay locally for debugging.

### Pattern: Git Consensus as Knowledge Base

For public or internal knowledge bases, leverage the universal developer convention: the `README.md`.

Host authoritative MD-LD in a Git repository, serve via CDN (e.g., `cdn.jsdelivr.net/gh/org/repo@main/README.md`):
- **Free Versioning**: Every commit is a snapshot of your knowledge graph
- **Built-in Collaboration**: Developers use standard `git branch` and `git merge` to propose changes
- **Zero Infrastructure**: No database process, no connection pooling, no ORM. Just static files served globally

### Best Practices Checklist

- [ ] **Use Standard Content Types**: Always serve/request MD-LD with `Content-Type: text/markdown` or `text/plain`
- [ ] **Namespace Your Vocabulary**: Use consistent prefix (e.g., `[myapp] <tag:myapp@domain.com,2024:>`) to prevent predicate collisions
- [ ] **Default to Text Inputs**: When building dynamic form renderers, provide fallback (e.g., `type="text"`) if MD-LD `form:type` is unrecognized
- [ ] **Parse Server-Side for Validation**: When accepting POST requests, always run incoming MD-LD through `mdld-parse` on server to validate graph structure
- [ ] **Keep the Renderer Dumb**: Frontend JavaScript should only query quads (`getByType`, `getLiteral`) and build DOM. No hardcoded business logic

### Summary

MD-LD application development is about **delaying complexity until it provides business value**.

You can build a fully semantic, AI-agent-ready, queryable web application in a single 42KB HTML file. When you outgrow that file, the escape hatch is just a standard HTTP `fetch()` to a text endpoint.

By making the document the single source of truth, you align human readability, machine queryability, and developer velocity into one unified workflow.

## How to Extend

### Adding a New Content Type

1. **Define the type in MD-LD source:**

```md
## New Content {=n:1 .my:NewType label}
[1] {my:order ^^xsd:integer}
> Description {my:description}
[custom-data] {my:customField}
```

2. **Query it in the rendering engine:**

```javascript
const newItems = getByType('my:NewType');
newItems.sort((a, b) => 
  parseInt(getLiteral(a, 'my:order') || '99') - 
  parseInt(getLiteral(b, 'my:order') || '99')
);

newItems.forEach(nIRI => {
  const label = getLiteral(nIRI, 'label');
  const description = getLiteral(nIRI, 'my:description');
  const customField = getLiteral(nIRI, 'my:customField');
  // Build HTML...
});
```

3. **Add a tab (optional):**

```javascript
const tabs = [
  // ... existing tabs
  { id: 'newtab', label: 'New Tab', icon: '✨' },
];
```

### Adding a New Example

1. **Add to MD-LD source:**

```md
## New Example {=e:9 .my:SyntaxExample label}
[9] {my:order ^^xsd:integer}
[basics] {my:category}
> This example shows... {my:description}
~~~ {my:mdldCode}
[your prefix] <your:namespace:>

# Your Example {=your:example .your:Type label}
[your content] {your:property}
~~~
~~~ {my:quadOutput}
your:example a your:Type ;
    rdfs:label "Your Example" ;
    your:property "your content" .
~~~
```

2. **Done!** The renderer will automatically pick it up and display it in the Syntax tab.

### Adding a New Playground Example

1. **Add to the `examples` object in `renderPlayground()`:**

```javascript
const examples = {
  // ... existing examples
  newExample: `[my] <tag:agent@example.org,2026:>

# Your Example {=my:example .my:Type label}
[content] {my:property}`
};
```

2. **Add a button in the toolbar:**

```html
<button onclick="loadExample('newExample')">Your Example</button>
```

### Customizing the Theme

All colors are CSS custom properties in `:root`:

```css
:root {
  --bg: #020617;
  --surface: #0f172a;
  --emerald: #34d399;
  --cyan: #22d3ee;
  /* ... */
}
```

Change these to retheme the entire app.

## Development Workflow

### Local Development

```bash
# Install Vite (if not already installed)
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Editing the MD-LD Source

1. Open `index.html`
2. Find `<script type="text/plain" id="mdld-source">`
3. Edit the MD-LD content
4. Save and refresh the browser
5. The UI updates automatically

### Debugging Quads

Open browser console and run:

```javascript
// Get all quads
const source = document.getElementById('mdld-source').textContent;
const result = await import('mdld-parse').then(m => m.parse({ text: source }));
console.log(result.quads);

// Get all sections
const sections = result.quads.filter(q => 
  q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
  q.object.value === 'tag:mdld-guide@agents.org,2026:Section'
);
console.log(sections.map(q => q.subject.value));
```

## Performance

- **Initial load:** ~53KB (HTML + CSS + JS)
- **mdld-parse load:** ~24KB (gzipped)
- **Parse time:** <10ms for this document (~400 quads)
- **Render time:** <5ms (DOM manipulation is fast)
- **Total time to interactive:** <200ms

**Why so fast?**
- mdld-parse is optimized for streaming (single-pass, O(n))
- No virtual DOM diffing
- No framework overhead
- Browser-native ESM imports
- CSS is inlined (no extra requests)

## Browser Support

- Chrome/Edge 89+ (importmap support)
- Firefox 108+ (importmap support)
- Safari 16.4+ (importmap support)

**Why importmap?**
- Native ESM imports (no bundler needed)
- Works in all modern browsers
- Fallback: use a bundler for older browsers

## Known Limitations

1. **No static site generation** — requires JavaScript to render
2. **No SEO** — search engines can't parse the MD-LD source (yet)
3. **No offline support** — requires internet for initial mdld-parse load (could be cached)
4. **No server-side rendering** — pure client-side
5. **No hot module replacement** — manual refresh after editing MD-LD source

**Mitigations:**
- For SEO: add a `<noscript>` fallback with pre-rendered HTML
- For offline: bundle mdld-parse locally instead of using CDN
- For SSR: use a build step to pre-render the HTML
- For HMR: use Vite's dev server (already configured)

## Future Enhancements

Potential improvements:

1. **Syntax highlighting** — add Prism.js or highlight.js for code blocks
2. **Search** — add a search bar that queries the quads
3. **Export** — add buttons to export as JSON-LD, Turtle, N-Triples
4. **Validation** — add SHACL validation to check the MD-LD source
5. **Versioning** — use polarity to track changes over time
6. **Collaboration** — add a merge UI for combining multiple MD-LD sources
7. **Themes** — add a theme switcher (light/dark/custom)
8. **Print** — add print styles for PDF export
9. **Accessibility** — add ARIA labels and keyboard navigation
10. **Analytics** — track which sections are most viewed

## License

This demo is provided as-is for educational purposes. The MD-LD specification and mdld-parse library are maintained by the MD-LD project.

## Resources

- **MD-LD Specification:** https://mdld.js.org/spec/Spec.md
- **MD-LD Documentation:** https://mdld.js.org/docs/Guide.md
- **mdld-parse npm:** https://www.npmjs.com/package/mdld-parse
- **MD-LD GitHub:** https://github.com/mdld-js
- **W3C RDF:** https://www.w3.org/RDF/
- **W3C PROV-O:** https://www.w3.org/TR/prov-o/

## Credits

This demo was created as a showcase of MD-LD's capabilities for AI agents. It demonstrates that semantic web applications can be:

- **Simple** — single file, zero dependencies
- **Semantic** — content is a knowledge graph
- **Self-documenting** — the source is the spec
- **Extensible** — add content by editing MD-LD
- **Portable** — works anywhere JavaScript runs

The patterns documented here can be applied to build any semantic web application, from documentation sites to knowledge bases to collaborative editing tools.

---

**TL;DR:** This is a single-file web app where the content is stored as MD-LD (Markdown with RDF annotations), parsed into quads at runtime, and rendered by querying those quads. It's a clean, extensible pattern for building semantic web applications with zero build dependencies.
