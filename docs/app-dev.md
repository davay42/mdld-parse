# Application Development Patterns with MD-LD

Traditional web development often forces a rigid separation: content lives in a database, logic lives in an API, and presentation lives in the frontend. This creates friction, documentation drift, and unnecessary complexity. 

MD-LD introduces a paradigm shift: **The Document is the Database, the API, and the Schema.** 

This guide distills the core patterns and practices for building scalable, agent-ready, and highly maintainable web applications using Markdown-Linked Data.

See [DEMO APP](../demo/index.html)

---

## Core Philosophy: "Extract and Elevate"

The most powerful workflow in MD-LD development is the **Extract-and-Elevate** lifecycle. It allows you to start with zero infrastructure and scale seamlessly without rewriting your frontend contracts.

### Phase 1: The Single-File Prototype (Day 1)
Start by embedding your MD-LD directly in your `index.html`. This provides a millisecond feedback loop. No build steps, no servers, no databases.
```html
<script type="text/plain" id="mdld-source">
[app] <tag:myapp@local,2024:>
# Welcome {=page:home .app:Page label}
> This is a fully functional prototype. {app:description}
</script>
```

### Phase 2: Static Extraction (Day 14)
As the app grows, extract the MD-LD into separate `.md` files. Your frontend becomes a "dumb" semantic renderer that simply fetches the text.
```javascript
const response = await fetch('/content/home.md');
const { quads } = await parse({ text: await response.text() });
renderUI(quads);
```
*Benefit: Content is now decoupled from UI, yet remains 100% human-readable and version-controlled via Git.*

### Phase 3: Dynamic GET (Month 3)
When you need live data (e.g., a product catalog), you don't change the frontend. You simply replace the static file with a backend route that *generates* the exact same MD-LD text format from your database.
```javascript
// Express.js example
app.get('/products.md', async (req, res) => {
  res.setHeader('Content-Type', 'text/markdown');
  const products = await db.query('SELECT * FROM products');
  res.send(generateMDLDFromProducts(products)); 
});
```
*Benefit: Zero-friction scaling. The frontend contract remains perfectly stable.*

### Phase 4: Dynamic POST with Server-Side Validation (Month 6)
When the app needs to write data, bypass JSON entirely. Have the client generate an MD-LD draft and POST it as raw text. Crucially, the server validates the graph structure and detects syntax drift before persisting.

```javascript
// Server-side validation of the incoming semantic payload
app.post('/api/submissions', async (req, res) => {
  const text = req.body;
  
  // 1. Parse the incoming MD-LD
  const { quads, primary, md } = parse({ text });

  // 2. Detect syntax drift (if raw text != clean text, the parser ignored malformed syntax)
  if (text.trim() !== md.trim()) {
    return res.status(400).send('Invalid MD-LD syntax detected. Please check your annotations.');
  }

  // 3. Validate the graph structure (e.g., ensure it declares the correct type)
  const SUBMISSION_TYPE = 'tag:myapp@local,2024:Submission';
  const isSubmission = quads.some(q => 
    q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && 
    q.object.value === SUBMISSION_TYPE
  );
  
  if (!isSubmission) {
    return res.status(422).send('Unprocessable Entity: Missing required rdf:type Submission');
  }

  // 4. Persist the valid graph (append to local file or map to SQL)
  await fs.appendFile('data/submissions.md', '\n\n' + text);
  
  // Return the canonical IRI of the newly created entity
  res.status(201).json({ iri: primary.subject });
});
```
*Benefit: Self-documenting logs, free schema evolution, and guaranteed graph integrity.*

---

## Pattern 1: Data-Driven Business Logic

Instead of hardcoding `if/else` statements in your JavaScript, encode your business rules directly into the MD-LD graph. Your JavaScript becomes a generic semantic interpreter.

**The MD-LD Source:**
```markdown
[app] <tag:myapp@local,2024:>

## High Caffeine Rule {=app:rule-1 .app:TraitRule label}
Targets question [3] {app:targetsQuestion ^^xsd:integer}
Condition: [gte:7] {app:condition}
Applies trait: [⚡ High Voltage] {app:appliesTrait}
Visual hint: [red] {app:colorHint}
```

**The JavaScript Interpreter:**
```javascript
// The JS doesn't know about "caffeine" or "High Voltage". 
// It just evaluates the graph.
rules.forEach(rule => {
  const answer = answers[rule.targetsQuestion];
  if (evaluateCondition(answer, rule.condition)) {
    applyTrait(rule.appliesTrait, rule.colorHint);
  }
});
```
*Benefit: Adding new features, traits, or validation rules requires **zero JavaScript changes**. You just append to the Markdown.*

---

## Pattern 2: The Markdown API (Bypassing JSON)

Traditional APIs use `application/json`. MD-LD apps use `text/markdown`. This seemingly small change yields massive advantages:

1. **Self-Documenting Logs**: Server logs contain human-readable Markdown, not opaque JSON blobs. Debugging is instantaneous.
2. **Schema Evolution is Free**: If the frontend starts sending a new field, the backend doesn't crash. It just receives the new text. You can update the backend parser at your own pace.
3. **Agent-Native**: LLMs and autonomous agents natively understand Markdown. They can generate, read, and reason over the API payload without needing strict JSON formatting prompts or OpenAPI specs.
4. **Replayability**: A failed submission can be copied directly from a log, saved as a `.md` file, and replayed locally for debugging.

---

## Pattern 3: Git Consensus as the Knowledge Base

For public or internal knowledge bases, lean into the universal developer convention: the `README.md`. 

By hosting your authoritative MD-LD in a Git repository and serving it via a CDN (like `cdn.jsdelivr.net/gh/org/repo@main/README.md`), you get:
* **Free Versioning**: Every commit is a snapshot of your knowledge graph.
* **Built-in Collaboration**: Developers use standard `git branch` and `git merge` to propose changes to the data schema or content.
* **Zero Infrastructure**: No database process, no connection pooling, no ORM. Just static files served globally.

---

## Pattern 4: The HTML Codec (Bandwidth-Efficient Hydration)

Traditional SPAs fetch JSON for data and HTML for templates, or they fetch raw Markdown and parse it in the browser. MD-LD introduces a third way: **HTML as a lossless semantic codec**. 

Because the `render()` function embeds the exact MD-LD syntax into `data-annotation` attributes, the rendered HTML *is* the graph transport. You only need to send one payload over the wire.

**Server-Side Rendering (SSR):**
```javascript
// The server reads the source of truth and sends semantic HTML
const mdld = fs.readFileSync('content/article.md', 'utf8');
const html = render(mdld); 
res.send(`<article>${html}</article>`);
```

**Client-Side Hydration (Zero extra network requests):**
```javascript
// The client wants to build an interactive graph view or run local queries.
// It doesn't fetch the .md file again. It extracts it from the DOM.
const html = document.querySelector('article').innerHTML;
const reconstructedMDLD = deconstruct(html);
const { quads } = parse({ text: reconstructedMDLD });

// Now the client has the full Quad[] array in memory to power UI interactions
```
*Benefit: CDNs cache the HTML perfectly for fast page loads and SEO. When the user interacts with the page, the client instantly hydrates a local semantic database from the DOM, enabling offline-first interactions and local graph traversals with zero API latency.*

---

## Best Practices Checklist

- [ ] **Use Standard Content Types**: Always serve and request MD-LD with `Content-Type: text/markdown` or `text/plain`.
- [ ] **Namespace Your Vocabulary**: Use a consistent prefix (e.g., `[myapp] <tag:myapp@domain.com,2024:>`) to prevent predicate collisions.
- [ ] **Default to Text Inputs**: When building dynamic form renderers, always provide a fallback (e.g., `type="text"`) if an MD-LD `form:type` is unrecognized, ensuring graceful degradation.
- [ ] **Validate Server-Side**: When accepting POST requests, always run the incoming MD-LD through `mdld-parse` on the server to validate the graph structure and detect syntax drift before saving.
- [ ] **Keep the Renderer Dumb**: The frontend JavaScript should only know how to query quads (`getByType`, `getLiteral`) and build DOM elements. It should not contain hardcoded business logic.
- [ ] **Leverage the HTML Codec**: Use `deconstruct()` on the client to avoid redundant network requests for data you've already rendered to the DOM.

---

## Summary

MD-LD application development is about **delaying complexity until it provides business value**. 

You can build a fully semantic, AI-agent-ready, queryable web application in a single 42KB HTML file. When you outgrow that file, the escape hatch is just a standard HTTP `fetch()` to a text endpoint, culminating in a robust, graph-validated POST architecture. 

By making the document the single source of truth, you align human readability, machine queryability, and developer velocity into one unified, frictionless workflow.

