# MD-LD

**Markdown-Linked Data (MD-LD)** — a deterministic, streaming-friendly RDF authoring format that extends Markdown with explicit `{...}` annotations.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Documentation](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse) | [Playground](https://mdld.js.org/playground)

## What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using explicit `{...}` annotations:

```markdown
[my] <tag:alice@example.com,2026:>

# 2024-07-18 {=my:journal-2024-07-18 .my:Event my:date ^^xsd:date}

## A good day {label}

Mood: [Happy] {my:mood}
Energy level: [8] {my:energyLevel ^^xsd:integer}

Met [Sam] {+my:sam .my:Person ?my:attendee} on my regular walk at [Central Park] {+my:central-park ?my:location .my:Place label @en} and talked about [Sunny] {my:weather} weather. 

Activities: {?my:hasActivity .my:Activity label}

- Walking {=#walking}
- Reading {=#reading}

```

Generates valid RDF triples:

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix prov: <http://www.w3.org/ns/prov#>.
@prefix ex: <http://example.org/>.
@prefix my: <tag:alice@example.com,2026:>.

my:journal-2024-07-18 a my:Event;
    my:date "2024-07-18"^^xsd:date;
    rdfs:label "A good day";
    my:mood "Happy";
    my:energyLevel 8;
    my:attendee my:sam;
    my:location my:central-park;
    my:weather "Sunny";
    my:hasActivity <tag:alice@example.com,2026:journal-2024-07-18#walking>, <tag:alice@example.com,2026:journal-2024-07-18#reading>.
my:sam a my:Person.
my:central-park a my:Place;
    rdfs:label "Central Park"@en.
<tag:alice@example.com,2026:journal-2024-07-18#walking> a my:Activity;
    rdfs:label "Walking".
<tag:alice@example.com,2026:journal-2024-07-18#reading> a my:Activity;
    rdfs:label "Reading".

```

Read the [FULL SPEC](./docs/Spec/Spec.md).

## Core Features

- **Prefix folding**: Build hierarchical namespaces with lightweight IRI authoring
- **Subject declarations**: `{=IRI}` and `{=#fragment}` for context setting
- **Object IRIs**: `{+IRI}` and `{+#fragment}` for temporary object declarations  
- **Four predicate forms**: `p` (S→L), `?p` (S→O), `!p` (O→S)
- **Type declarations**: `.Class` for rdf:type triples
- **Datatypes & language**: `^^xsd:date` and `@en` support
- **Lists**: Explicit subject declarations and numbered ordered lists with `rdf:List` support
- **Fragments**: Built-in document structuring with `{=#fragment}`
- **Round-trip serialization**: Markdown ↔ RDF ↔ Markdown preserves structure

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
| `?p`  | S → O   | `[NASA] {=ex:nasa ?org}`     | object property  |
| `!p` | O → S    | `[Parent] {=ex:p !hasPart}`  | reverse object   |

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

Lists require explicit subjects per item. 

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

Part of: {!hasPart}

- Book {=ex:book}
```

```turtle
ex:book schema:hasPart ex:part .
```

### Prefix Declarations

```markdown
[ex] <http://example.org/>
[foaf] <http://xmlns.com/foaf/0.1/>
[@vocab] <http://schema.org/>

# Person {=ex:alice .foaf:Person}
```

### Prefix Folding: Lightweight IRI Authoring

Build hierarchical namespaces by referencing previously defined prefixes:

```markdown
# Create your domain authority
[my] <tag:mymail@domain.com,2026:>

# Build namespace hierarchy
[j] <my:journal:>
[p] <my:property:>
[c] <my:class:>
[person] <my:people:>

# Use in content
# 2026-01-27 {=j:2026-01-27 .c:Event p:date ^^xsd:date}

## Harry {=person:harry p:name}
```

**Resolves to absolute IRIs:**
- `j:2026-01-27` → `tag:mymail@domain.com,2026:journal:2026-01-27`
- `c:Event` → `tag:mymail@domain.com,2026:class:Event`
- `p:date` → `tag:mymail@domain.com,2026:property:date`
- `person:harry` → `tag:mymail@domain.com,2026:people:harry`

**Benefits:**
- **Lightweight**: No external ontology dependencies
- **Domain authority**: Use `tag:` URIs for personal namespaces
- **Hierarchical**: Build deep namespace structures
- **Streaming-safe**: Forward-reference only, single-pass parsing

## API Reference

### `parse(markdown, options)`

Parse MD-LD markdown and return RDF quads with origin tracking.

**Parameters:**

- `markdown` (string) — MD-LD formatted text
- `options` (object, optional):
  - `context` (object) — Prefix mappings (default: `{ '@vocab': 'http://www.w3.org/2000/01/rdf-schema#', rdf, rdfs, xsd, schema }`)
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
  `# Article {=ex:article .ex:Article}
  
  [Alice] {=ex:alice ?author}`,
  { context: { ex: 'http://example.org/' } }
);

console.log(result.quads);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//     object: { termType: 'NamedNode', value: 'http://example.org/Article' }
//   },
//   ...
// ]
```

### `applyDiff({ text, diff, origin, options })`

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

const updated = applyDiff({
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

### `generate(quads, context)`

Generate deterministic MDLD from RDF quads with origin tracking.

**Parameters:**

- `quads` (array) — Array of RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings (default: `{}`)
  - Merged with DEFAULT_CONTEXT for proper CURIE shortening
  - Only user-defined prefixes are rendered in output

**Returns:** `{ text, origin, context }`

- `text` — Generated MDLD markdown
- `origin` — Origin tracking object with:
  - `blocks` — Map of block IDs to source locations  
  - `quadIndex` — Map of quads to block IDs
- `context` — Final context used (includes defaults)

**Example:**

```javascript
const quads = [
  {
    subject: { termType: 'NamedNode', value: 'http://example.org/article' },
    predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
    object: { termType: 'NamedNode', value: 'http://example.org/Article' }
  },
  {
    subject: { termType: 'NamedNode', value: 'http://example.org/article' },
    predicate: { termType: 'NamedNode', value: 'http://schema.org/author' },
    object: { termType: 'NamedNode', value: 'http://example.org/alice' }
  }
];

const result = generate(quads, { 
  ex: 'http://example.org/',
  schema: 'http://schema.org/'
});

console.log(result.text);
// # Article {=ex:article .ex:Article}
//
// > alice {+ex:alice ?schema:author}
```

### `locate(quad, origin, text, context)`

Locate the precise text range of a quad in MDLD text using origin tracking.

**Parameters:**

- `quad` (object) — The quad to locate (subject, predicate, object)
- `origin` (object, optional) — Origin object containing blocks and quadIndex
- `text` (string, optional) — MDLD text (auto-parsed if origin not provided)
- `context` (object, optional) — Context for parsing when text needs to be parsed

**Returns:** `{ blockId, entryIndex, range, content, blockRange, carrierType, isVacant }` or `null`

- `blockId` — ID of the containing block
- `entryIndex` — Position within block entries
- `range` — Precise character range of the quad content
- `content` — Actual text content at that range
- `blockRange` — Full range of the containing block
- `carrierType` — Type of carrier (heading, blockquote, list, span)
- `isVacant` — Whether the slot is marked as vacant

**Example:**

```javascript
import { parse, locate } from './src/index.js';

const result = parse(mdldText, { context: { ex: 'http://example.org/' } });
const quad = result.quads[0]; // Find a quad to locate

// Pattern 1: With origin (most efficient)
const location1 = locate(quad, result.origin, mdldText);

// Pattern 2: Auto-parse text (convenient)
const location2 = locate(quad, null, mdldText, { ex: 'http://example.org/' });

console.log(location1.range); // { start: 38, end: 44 }
console.log(location1.content); // " Alice"
console.log(location1.carrierType); // "blockquote"
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
| not allowed    | `L ─p→ S`      |
| `!p`           | `O ─p→ S`      |

This spans all **2 × 2** combinations of:

* source ∈ {subject, object/literal}
* target ∈ {subject, object/literal}

Therefore, the algebra is **closed**.

## Use Cases

### Personal Knowledge Management

```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting}

Attendees: {?alice:attendee label}

- Alice {=alice:alice}
- Bob {=alice:bob}

Action items: {?alice:actionItem label}

- Review proposal {=alice:task-1}
```

### Developer Documentation

````markdown
# API Endpoint {=api:/users/:id .api:Endpoint}

[GET] {api:method}
[/users/:id] {api:path}

Example:

```bash {=api:/users/:id#example .api:CodeExample api:code}
curl https://api.example.com/users/123
```
````

### Academic Research

```markdown
[alice] <tag:alice@example.com,2026:>

# Paper {=alice:paper-semantic-markdown .alice:ScholarlyArticle}

[Semantic Web] {label}
[Alice Johnson] {=alice:alice-johnson ?alice:author}
[2024-01] {alice:datePublished ^^xsd:gYearMonth}

> This paper explores semantic markup in Markdown. {comment @en}
```

## Testing

The parser includes comprehensive tests covering all spec requirements:

```bash
npm test
```

Tests validate:
- Subject declaration and context
- All predicate forms (p, ?p, !p)
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

Developed by [Denis Starov](https://github.com/davay42).

Inspired by:
- Thomas Francart's [Semantic Markdown](https://blog.sparna.fr/2020/02/20/semantic-markdown/) article
- RDFa decades of structured data experience
- CommonMark's rigorous parsing approach

## License

See [LICENCE](./LICENCE)