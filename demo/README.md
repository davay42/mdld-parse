# MD-LD Guide for Agents — Implementation Patterns

A self-contained, single-file web application that serves as both documentation and a live demonstration of MD-LD (Markdown-Linked Data). This README documents the architectural patterns and technical decisions used to create this demo.

## Overview

This project demonstrates a radical approach to semantic web applications: **the content itself is the data**. Instead of separating content from presentation, we embed MD-LD-annotated Markdown directly in the HTML file, then use a rendering engine to parse it into RDF quads and build the UI by querying those quads.

**Key insight:** The page you're reading is itself an MD-LD document. View source → find `<script type="text/plain" id="mdld-source">` to see the knowledge graph that renders this entire guide.

## Architecture

### Single-File Pattern

```
index.html (42 kB)
├── <style> — All CSS (dark theme, responsive)
├── <script type="importmap"> — ESM imports for mdld-parse
├── <body> — HTML skeleton (header, nav, tab containers)
├── <script type="text/plain" id="mdld-source"> — MD-LD source data
└── <script type="module"> — Rendering engine (parses MD-LD → builds UI)
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
- `my:Section` — guide sections (order, paragraphs, advantages, node types, predicate forms, anti-patterns)
- `my:SyntaxExample` — syntax examples (order, category, description, mdldCode, quadOutput)
- `my:Pattern` — agent patterns (patternKind, description, mdldCode, quadOutput)
- `my:Concept` — knowledge graph nodes (category, description)
- `my:Relation` — knowledge graph edges (from, to, label)
- `my:CheatEntry` — cheatsheet cards (order, cheat lines)

**Why custom vocabulary?**
- Self-documenting — the types describe their purpose
- Extensible — add new types without changing the renderer
- Queryable — use standard RDF queries to find content
- Interoperable — anyone can parse and understand the structure

### Tab Structure

The guide is organized into 5 tabs, each rendered from different quad types:

1. **Guide** — `my:Section` quads, ordered by `my:order`
2. **Syntax** — `my:SyntaxExample` quads, ordered by `my:order`
3. **Patterns** — `my:Pattern` quads, grouped by `my:patternKind`
4. **Playground** — Live parser (no quads, just JavaScript)
5. **Cheatsheet** — `my:CheatEntry` quads, ordered by `my:order`

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
- Smaller bundle size (42KB vs 100KB+ with React)
- No build step required
- Easier to understand and modify
- Framework-agnostic pattern (works with any library)

**Tradeoffs:**
- More manual DOM manipulation
- No virtual DOM diffing (but we're not re-rendering frequently)
- Less "modern" feeling (but simpler is better for demos)

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

- **Initial load:** ~50KB (HTML + CSS + JS)
- **mdld-parse load:** ~24KB (gzipped)
- **Parse time:** <10ms for this document (~300 quads)
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
