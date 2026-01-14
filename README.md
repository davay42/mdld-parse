# MD-LD Parse v0.2

**Markdown-Linked Data (MD-LD)** — a deterministic, streaming-friendly RDF authoring format that extends Markdown with explicit `{...}` annotations.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Documentation](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse) | [Playground](https://mdld.js.org/playground)

## What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using explicit `{...}` annotations:

```markdown
# Apollo 11 {=ex:apollo11 .SpaceMission}

Launch: [1969-07-16] {startDate ^^xsd:date}
Crew: [Neil Armstrong](ex:armstrong) {?crewMember}
Description: [First crewed Moon landing] {description}
```

Generates valid RDF triples:

```turtle
ex:apollo11 a schema:SpaceMission ;
  schema:startDate "1969-07-16"^^xsd:date ;
  schema:crewMember ex:armstrong ;
  schema:description "First crewed Moon landing" .
```

## Core Guarantees

MD-LD v0.2 provides strict semantic guarantees:

1. **CommonMark-preserving** — Removing `{...}` yields valid Markdown
2. **Explicit semantics** — Every quad originates from explicit `{...}`
3. **Single-pass parsing** — Streaming-friendly, deterministic
4. **No blank nodes** — All subjects are stable IRIs
5. **Complete traceability** — Every quad maps to source location
6. **Round-trip capable** — Markdown ↔ RDF ↔ Markdown preserves structure

## Installation

```bash
npm install mdld-parse
```

### Node.js

```javascript
import { parse } from 'mdld-parse';

const markdown = `# Document {=ex:doc .Article}

[Alice] {author}`;

const result = parse(markdown, {
  context: { ex: 'http://example.org/' }
});

console.log(result.quads);
// RDF/JS quads ready for n3.js, rdflib, etc.
```

### Browser (ES Modules)

```html
<script type="module">
  import { parse } from 'https://cdn.jsdelivr.net/npm/mdld-parse/+esm';
  
  const result = parse('# Hello {=ex:hello}');
</script>
```

## Semantic Model

MD-LD encodes a directed labeled multigraph where three nodes may be in scope:

- **S** — current subject (IRI)
- **O** — object resource (IRI from link/image)
- **L** — literal value (string + optional datatype/language)

### Predicate Routing (§8.1)

Each predicate form determines the graph edge:

| Form  | Edge    | Example                      | Meaning          |
|-------|---------|------------------------------|------------------|
| `p`   | S → L   | `[Alice] {name}`             | literal property |
| `?p`  | S → O   | `[NASA](ex:nasa) {?org}`     | object property  |
| `^p`  | *(none)*| *(literals can't be subjects)* | reverse literal  |
| `^?p` | O → S   | `[Parent](ex:p) {^?hasPart}` | reverse object   |

## Syntax Reference

### Subject Declaration

Set current subject (emits no quads):

```markdown
## Apollo 11 {=ex:apollo11}
```

#### Fragment Syntax

Create fragment IRIs relative to current subject:

```markdown
# Document {=ex:document}
{=#summary}
[Content] {name}
```

```turtle
ex:document#summary schema:name "Content" .
```

Fragments replace any existing fragment and require a current subject.

Subject remains in scope until reset with `{=}` or new subject declared.

### Type Declaration

Emit `rdf:type` triple:

```markdown
## Apollo 11 {=ex:apollo11 .SpaceMission .Event}
```

```turtle
ex:apollo11 a schema:SpaceMission, schema:Event .
```

### Literal Properties

Inline value carriers emit literal properties:

```markdown
# Mission {=ex:apollo11}

[Neil Armstrong] {commander}
[1969] {year ^^xsd:gYear}
[Historic mission] {description @en}
```

```turtle
ex:apollo11 schema:commander "Neil Armstrong" ;
  schema:year "1969"^^xsd:gYear ;
  schema:description "Historic mission"@en .
```

### Object Properties

Links create relationships (use `?` prefix):

```markdown
# Mission {=ex:apollo11}

[NASA] {=ex:nasa ?organizer}
```

```turtle
ex:apollo11 schema:organizer ex:nasa .
```

### Resource Declaration

Declare resources inline with `{=iri}`:

```markdown
# Mission {=ex:apollo11}

[Neil Armstrong] {=ex:armstrong ?commander .Person}
```

```turtle
ex:apollo11 schema:commander ex:armstrong .
ex:armstrong a schema:Person .
```

### Lists

Lists require explicit subjects per item:

```markdown
# Recipe {=ex:recipe}

Ingredients: {?ingredient .Ingredient}

- Flour {=ex:flour name}
- Water {=ex:water name}
```

```turtle
ex:recipe schema:ingredient ex:flour, ex:water .
ex:flour a schema:Ingredient ; schema:name "Flour" .
ex:water a schema:Ingredient ; schema:name "Water" .
```

### Code Blocks

Code blocks are value carriers:

````markdown
# Example {=ex:example}

```javascript {=ex:code .SoftwareSourceCode text}
console.log("hello");
```
````

```turtle
ex:code a schema:SoftwareSourceCode ;
  schema:text "console.log(\"hello\")" .
```

### Blockquotes

```markdown
# Article {=ex:article}

> MD-LD bridges Markdown and RDF. {abstract}
```

```turtle
ex:article schema:abstract "MD-LD bridges Markdown and RDF." .
```

### Reverse Relations

Reverse the relationship direction:

```markdown
# Part {=ex:part}

Part of: {^?hasPart}

- Book {=ex:book}
```

```turtle
ex:book schema:hasPart ex:part .
```

### Prefix Declarations

```markdown
[ex] {: http://example.org/}
[foaf] {: http://xmlns.com/foaf/0.1/}

# Person {=ex:alice .foaf:Person}
```

## API Reference

### `parse(markdown, options)`

Parse MD-LD markdown and return RDF quads with origin tracking.

**Parameters:**

- `markdown` (string) — MD-LD formatted text
- `options` (object, optional):
  - `context` (object) — Prefix mappings (default: `{ '@vocab': 'http://schema.org/', rdf, rdfs, xsd, schema }`)
  - `dataFactory` (object) — Custom RDF/JS DataFactory

**Returns:** `{ quads, origin, context }`

- `quads` — Array of RDF/JS Quads
- `origin` — Origin tracking object with:
  - `blocks` — Map of block IDs to source locations
  - `quadIndex` — Map of quads to block IDs
- `context` — Final context used (includes prefixes)

**Example:**

```javascript
const result = parse(
  `# Article {=ex:article .Article}
  
  [Alice](ex:alice) {?author}`,
  { context: { ex: 'http://example.org/' } }
);

console.log(result.quads);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//     object: { termType: 'NamedNode', value: 'http://schema.org/Article' }
//   },
//   ...
// ]
```

### `serialize({ text, diff, origin, options })`

Apply RDF changes back to markdown with proper positioning.

**Parameters:**

- `text` (string) — Original markdown
- `diff` (object) — Changes to apply:
  - `add` (array) — Quads to add
  - `delete` (array) — Quads to remove
- `origin` (object) — Origin from `parse()` result
- `options` (object, optional):
  - `context` (object) — Context for IRI shortening

**Returns:** `{ text, origin }`

- `text` — Updated markdown
- `origin` — Updated origin tracking vacant slots

**Example:**

```javascript
const original = `# Article {=ex:article}

[Alice] {author}`;

const result = parse(original, { context: { ex: 'http://example.org/' } });

// Add a new property
const newQuad = {
  subject: { termType: 'NamedNode', value: 'http://example.org/article' },
  predicate: { termType: 'NamedNode', value: 'http://schema.org/datePublished' },
  object: { termType: 'Literal', value: '2024-01-01' }
};

const updated = serialize({
  text: original,
  diff: { add: [newQuad] },
  origin: result.origin,
  options: { context: result.context }
});

console.log(updated.text);
// # Article {=ex:article}
//
// [Alice] {author}
// [2024-01-01] {datePublished}
```

## Value Carriers

Only specific markdown elements can carry semantic values:

**Inline:**
- `[text] {...}` — span with annotation
- `[text](url) {...}` — link to external resource
- `[text] {...}` — inline resource declaration
- `![alt text](image.png) {...}` — embedding with annotation

**Block:**
- Headings (`# Title`)
- List items (`- item`, `1. item`) (single-level)
- Blockquotes (`> quote`)
- Code blocks (` ```lang `)

## Architecture

### Design Principles

- **Zero dependencies** — Pure JavaScript, ~15KB minified
- **Streaming-first** — Single-pass parsing, O(n) complexity
- **Standards-compliant** — RDF/JS data model
- **Origin tracking** — Full round-trip support with source maps
- **Explicit semantics** — No guessing, inference, or heuristics

### RDF/JS Compatibility

Quads are compatible with:

- [`n3.js`](https://github.com/rdfjs/N3.js) — Turtle/N-Triples serialization
- [`rdflib.js`](https://github.com/linkeddata/rdflib.js) — RDF store and reasoning
- [`sparqljs`](https://github.com/RubenVerborgh/SPARQL.js) — SPARQL queries
- [`rdf-ext`](https://github.com/rdf-ext/rdf-ext) — Extended RDF utilities

## Forbidden Constructs

MD-LD explicitly forbids to ensure deterministic parsing:

- ❌ Implicit semantics or structural inference
- ❌ Auto-generated subjects or blank nodes
- ❌ Predicate guessing from context
- ❌ Multi-pass or backtracking parsers

Below is a **tight, README-ready refinement** of the Algebra section.
It keeps the math precise, examples exhaustive, and language compact.

---

## Algebra 

> Every RDF triple `(s, p, o)` can be authored **explicitly, deterministically, and locally**, with no inference, guessing, or reordering.

MD-LD models RDF authoring as a **closed edge algebra** over a small, explicit state. To be algebraically complete for RDF triple construction, a syntax must support:

* Binding a **subject** `S`
* Binding an **object** `O`
* Emitting predicates in **both directions**
* Distinguishing **IRI nodes** from **literal nodes**
* Operating with **no implicit state or inference**

MD-LD satisfies these requirements with four explicit operators.

Each predicate is partitioned by **direction** and **node kind**:

| Predicate form | Emitted triple |
| -------------- | -------------- |
| `p`            | `S ─p→ L`      |
| `?p`           | `S ─p→ O`      |
| `^p`           | `L ─p→ S`      |
| `^?p`          | `O ─p→ S`      |

This spans all **2 × 2** combinations of:

* source ∈ {subject, object/literal}
* target ∈ {subject, object/literal}

Therefore, the algebra is **closed**.

## Use Cases

### Personal Knowledge Management

```markdown
# Meeting Notes {=urn:note:2024-01-15 .Meeting}

Attendees: {?attendee}

- Alice {=urn:person:alice name}
- Bob {=urn:person:bob name}

Action items: {?actionItem}

- Review proposal {=urn:task:1 name}
```

### Developer Documentation

````markdown
# API Endpoint {=api:/users/:id .APIEndpoint}

[GET] {method}
[/users/:id] {path}

Example:

```bash {=api:/users/:id#example .CodeExample text}
curl https://api.example.com/users/123
```
````

### Academic Research

```markdown
# Paper {=doi:10.1234/example .ScholarlyArticle}

[Semantic Web] {about}
[Alice Johnson] {=orcid:0000-0001-2345-6789 author}
[2024-01] {datePublished ^^xsd:gYearMonth}

> This paper explores semantic markup in Markdown. {abstract @en}
```

## Testing

The parser includes comprehensive tests covering all spec requirements:

```bash
npm test
```

Tests validate:
- Subject declaration and context
- All predicate forms (p, ?p, ^p, ^?p)
- Datatypes and language tags
- List processing
- Code blocks and blockquotes
- Round-trip serialization

## Contributing

Contributions welcome! Please:

1. Read the [specification](https://mdld.js.org/spec)
2. Add tests for new features
3. Ensure all tests pass
4. Follow existing code style

## Acknowledgments

Inspired by:
- Thomas Francart's [Semantic Markdown](https://blog.sparna.fr/2020/02/20/semantic-markdown/)
- RDFa decades of structured data experience
- CommonMark's rigorous parsing approach

## License

See [LICENCE](./LICENCE)