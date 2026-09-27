# The Alignment

## A Field Guide to Personal Semantic Infrastructure

---

## I. The Observatory

Standards in computing are not inventions. They are discoveries — like planets, they exist before we name them, and the names we give them say more about what we hoped to find than what we actually found.

Look up at the night sky of infrastructure and you will see the same constellations every builder has navigated by: the File System, Git, HTTP, HTML, CSS, JavaScript, Markdown, RDF. Each has its own gravity. Each pulls in its own direction. Most applications are built by fighting these forces — by bolting a framework to a database, by wrapping a triple store in an ORM, by hiding a file system behind a proprietary sync layer. The work of a generation has been to keep the planets from colliding.

MD-LD is not a new planet. It is an observation about alignment.

We noticed that if you arrange a small set of existing standards in a particular configuration, the forces balance. The file system holds the truth. Git carries time. HTTP moves the truth between machines. HTML renders it for eyes. JavaScript lets it respond to touch. Markdown lets humans write it without ceremony. RDF lets machines reason over it without guessing.

None of these needed to be invented. They needed to be *noticed* in resonance.

This document is a field guide to that resonance. It is written for the curious developer who has wandered into `mdld-parse` and is trying to understand why a 100KB JavaScript file claims to be a complete semantic infrastructure. The answer is not that the file is large. The answer is that it sits at a Lagrange point where several very old forces cancel each other out.

---

## II. The Giants and Their Orbits

Every technology in this configuration was built by someone who was solving a different problem. We did not recruit them. We just noticed they were already here.

### The File System (Unix, 1969) — The Bedrock

A directory. A file. A name. A path. The file system is the oldest stable orbit in computing. It does not require a query language, a connection string, or a running process. It is always available. It survives crashes, migrations, and decades of neglect. A file written today can be read by a machine built fifty years from now — not because the format is standard, but because the *abstraction* is standard.

We chose the file system because it is honest. It does not hide anything, optimize anything, or anticipate anything. It holds your text and gives it back when you ask.

### Git (Linus Torvalds, 2005) — Time Travel for Text

Git gave text a fourth dimension. Every change is recorded. Every version is recoverable. Every author is attributed. The history of a document is not a separate artifact stored in a database — it is the document itself, extended through time. Git also gave us collaboration without coordination: two people can edit the same file on different machines at different times and merge their changes without a central server. The text is the protocol. The diff is the message.

### HTTP (Tim Berners-Lee, 1989) — The Simplest Conversation

`GET` — give me this thing. `POST` — here is a new thing. `200` — I got it. `404` — I don't have it. HTTP does not require a framework, a schema, or authentication middleware. It requires a URL and a method. It is the lowest-friction way to move text between machines, and it has been running, unmodified, on every machine on Earth for thirty-five years.

### HTML and CSS (1990s) — The Universal Surface

HTML is the skeleton. CSS is the skin. Together they form the most widely deployed rendering engine in human history. Every device has one. Every human has seen its output. We chose HTML as the presentation layer because it requires no installation, no learning curve, and no runtime. The browser *is* the renderer.

### JavaScript (Brendan Eich, 1995) — The Everywhere Language

JavaScript is not the most elegant language, nor the most performant. But it is the most *present*. A function written in JavaScript will run on any machine that has a browser, which is to say on every machine. We chose JavaScript because we wanted the kernel to run in the same environment as the user — no compilation, no deployment pipeline, no container. Just a function that takes text and returns quads, running in the same runtime as the page the user is looking at.

### Markdown (John Gruber, 2004) — The Permission to Write

Markdown is the art of saying: *the text is the interface*. A hash for a heading. A bracket for a link. A dash for a list. Markdown gave us permission to treat a plain text file as a finished document. It does not need to be exported from an application. It does not need to be saved into a proprietary format. It is already portable. It is already yours.

### RDF and the Triple (W3C, 1999) — The Atom of Meaning

The Resource Description Framework gave us the smallest unit of knowledge that can be asserted: the triple. A subject, a predicate, an object. `(Alice, knows, Bob)`. Three words. One fact. The triple is perfect in shape — it maps directly to the subject-verb-object structure of natural language and to the atoms of first-order logic.

But RDF, in its original form, was too heavy for humans to write and too divorced from documents to be useful for reading. This is the half-problem that haunted the Semantic Web for two decades: **we had a perfect machine-readable atom, but no surface on which a human could write it without noticing.**

### RFC 4151 `tag:` URIs (2005) and Pandoc's Attribute Syntax — Borrowed Idioms

Two smaller borrowings deserve explicit credit. The `tag:` URI scheme — `tag:alice@example.com,2026:` — gives us self-sovereign identity without a certificate authority. You control an email address; you control every identifier under it. And the `{...}` attribute syntax comes straight from Pandoc, a project that has been solving the same problem (attributes on Markdown elements) for fifteen years. We did not invent these idioms. We inherited them because they were already proven.

---

## III. The Alignment — The Core Thesis

For twenty years, the Semantic Web failed because it solved only half its own problem. It produced a perfect machine-readable representation of knowledge (RDF) but had no human-writable surface on which that knowledge could be authored naturally. Every attempt to bridge the gap — RDFa embedded in HTML, JSON-LD injected into script tags, custom XML dialects — required the human to speak the machine's language. The human became a transcriber for the triple store.

The conjunction that MD-LD observes is this: **a human-writable surface and a machine-readable reader arrived at the same moment.**

Markdown gave us the human surface — documents that could be written in a text editor at 2 AM and shipped as finished artifacts. The agentic era — LLMs, local inference, autonomous scripts — gave us the machine reader. For the first time in the history of the Semantic Web, there exists a consumer capable of genuinely *understanding* machine-readable semantics: not a SPARQL endpoint, but an agent that can read a document, extract its graph, reason over it, and write changes back in the same format.

The Semantic Web did not fail because RDF was wrong. It failed because it was early. The reader hadn't arrived yet. MD-LD is not a new idea. It is the old idea, finally in phase with its reader.

This is the resonance. The human writes Markdown with curly-brace annotations. The agent reads it. The kernel parses it into quads. The HTML codec renders it for eyes. The agent modifies the graph and writes it back. The human sees the changes in the same document they wrote. The file system holds the truth throughout.

Two halves of a problem, solved twenty years apart, finally aligned.

---

## IV. The Configuration — How the Forces Balance

When you arrange these planets in the MD-LD configuration, they fall into a stable orbit. Here is the shape of that orbit:

### The Source of Truth is Text

Knowledge lives in `.mdld` files on a file system, in a Git repository, or on a static host. The file is the ground state. Every other representation is a projection of the file.

### The Kernel is a Translation Layer

The 100KB `mdld-parse` file provides four operations: `parse` (text → quads), `generate` (quads → text), `render` (text → HTML), and `deconstruct` (HTML → text). These are all invertible. They do not add information. They do not lose information. They translate between three isomorphic representations of the same knowledge: text, graph, and surface.

### The Browser is the Runtime

The kernel runs wherever JavaScript runs. The HTML it produces runs wherever HTML runs. The file system access runs wherever the File System Access API is available (primarily Chromium; Safari and Firefox require the file picker or OPFS — a known limitation, worth planning around rather than pretending it doesn't exist). The user does not install anything. The agent does not require a plugin.

### The Service is a Thin Shell

When you need authentication, routing, concurrency control, or public hosting, you add a service. The service reads and writes text. It does not maintain a separate database. It does not impose a schema. It is a thin shell around the file system — the load-bearing wall exists, but it is outside the kernel.

### Libraries are Peripheral

Use a library for syntax highlighting. Use a library for chart rendering. Use a library for PDF generation. Do not use a library that sits between you and the graph. A library that translates your data into a format you cannot read, hides your schema behind a configuration file, or requires a running service to function — that library is a planet in the wrong orbit, and it will perturb the alignment.

---

## V. The Terrain — What Is Easy, What Is Hard

A field guide that pretends every step is equally easy is lying. Here is the honest topology of building on this configuration.

### Easy — Weekend Work

- **Steps 1–3: Write text, parse to quads, render to HTML.** You can have a working semantic document viewer in an afternoon. The parser is fast. The renderer produces clean HTML. The quads are a plain JavaScript array you can filter and map.
- **Step 6: Save the text.** Writing the updated MD-LD back to a file, committing it to Git, or sending it over HTTP is trivial. It is just text going where text goes.

### Hard — The Only Step Where You Can Lose the Pie

**Steps 4–5: The editable surface and its round-trip.**

This is the graveyard of semantic editors. Making a DOM `contenteditable` is a line of code. Making it a *faithful* semantic editor — where caret position is preserved across re-renders, where the formatter doesn't fight the author's formatting, where annotation ordering survives the round-trip through `deconstruct` — is the whole game. Over-kneading the DOM (mutating it with UI chrome that the codec can't reconstruct) will silently corrupt the text. Under-kneading (failing to preserve the exact attribute structure the renderer expects) will produce MD-LD that parses but doesn't round-trip.

If you build a serious editing surface on this configuration, budget the time here. The kernel is stable. The file system is stable. The DOM ↔ text boundary is where craft matters.

---

## VI. The Boundaries — Where This Configuration Fails

A configuration that claims to work everywhere works nowhere. MD-LD is optimized for a specific regime of matter, and it is honest about where it does not apply.

### This configuration is wrong for:

- **Multiplayer surface computing.** Figma-class simultaneous editing with sub-second cursor presence requires a different substrate — operational transforms or CRDTs on a shared state graph, with the file system as a persistence layer rather than the source of truth. The file system is a slow, optimistic-based ledger; collaborative surfaces need a pessimistic one.

- **High-write multi-user concurrency.** If hundreds of users are modifying the same document per second, appending polarity diffs to a single `.mdld` file will not scale. You need a proper database with write-ahead logs, and the file becomes an export format rather than the operational store.

- **Billion-quad analytics.** If your corpus is a billion triples and your workload is analytical (joins, aggregations, graph traversals over the whole corpus), an in-memory `Quad[]` array is the wrong substrate. You want a columnar triple store, and MD-LD becomes an import/export format at the edges.

- **Adversarial multi-tenant trust.** If the writers of your documents do not trust each other — if you need cryptographic integrity, permission boundaries, and audit trails that survive hostile actors — plain text files are insufficient. You need signed commits, capability-based access, and a trust layer that MD-LD deliberately does not provide.

These are not shortcomings. They are the edges of the configuration. A telescope that cannot see radio waves is not broken; it is a telescope. Knowing where your instrument stops working is what makes it useful.

---

## VII. The First Principles

Every kitchen has rules that are not derivable from the recipe — "never store washed mushrooms," "salt the pasta water until it tastes like the sea." The MD-LD configuration has four such rules. They are not theorems. They are constraints that, when violated, collapse the alignment.

**1. The kernel must remain domain-agnostic.** It must not contain logic specific to forms, sync, auth, or any particular use case. The moment it does, it becomes a wrapper, and wrappers are lossy.

**2. The kernel must remain lossless round-trip.** `parse(generate(quads))` must produce the same quads. `deconstruct(render(mdld))` must produce the same MD-LD. Every operation must be invertible. If you lose information across a round-trip, you have broken the configuration.

**3. The kernel must remain small.** It must fit in a single file that one developer can understand in one sitting. The current size is roughly 100KB. If it grows beyond what one person can hold in their head, the alignment is lost.

**4. The kernel must remain dependency-free.** It must run on the JavaScript standard library alone. No external packages, no framework dependencies, no build tools. The moment the kernel depends on a dependency, it inherits that dependency's orbit, and the configuration wobbles.

These are not aesthetic preferences. They are the conditions under which the planets stay in resonance.

---

## VIII. The Simple Test

A theorem requires proof. A recipe requires only a test you can run in an afternoon.

Here is the test for any system built on this configuration:

> **If I delete every dependency, is my data still readable? If I open the file in Notepad, can I still see the meaning?**

If the answer is yes, the configuration is intact. If the answer is no, something has been added that should not have been. The file system, Git, HTTP, and Notepad will outlive any framework, any runtime, any company. A system that survives them is a system that survives.

The durability claim is not about JavaScript. JavaScript is the least durable ingredient in this configuration — runtimes come and go. The durability claim is about the *text*. The text outlives any runtime. The kernel is small enough to reimplement in a weekend in whatever language exists in 2076. That is the fifty-year story: not that JavaScript will last, but that the text will, and anyone who wants to can rebuild the kernel against it.

---

## IX. An Invitation

This configuration is not a commandment. It is a clearing.

We invite you to build on it. Build a tool for your specific domain. Build a UI that makes sense for your users. Build an agent that automates your workflow. Build a service that serves your community.

Stay close to the text. Do not add layers that hide the graph. Do not add abstractions that restrict the domain. Do not add dependencies that make the system fragile.

The giants built the planets. The alignment happened on its own. You get to build in the clearing they made.

The field is clear. The configuration is stable. The work is yours.

---

*Written with gratitude, from the orbits of giants, for the developers and agents who will build in the clearing.*