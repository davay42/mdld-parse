# MD-LD

**Markdown-Linked Data (MD-LD)** — a deterministic, streaming-friendly RDF authoring format that extends Markdown with explicit `{...}` annotations.

[![NPM](https://img.shields.io/npm/v/mdld-parse)](https://www.npmjs.com/package/mdld-parse)

[Demo](https://mdld.js.org) | [Repository](https://github.com/davay42/mdld-parse) 

## 🚀 Quick Start

```bash
pnpm install mdld-parse
```

```javascript
import { parse } from 'mdld-parse';

const result = parse(`
[ex] <http://example.org/>

# Document {=ex:doc .ex:Article label}

[Alice] {?ex:author =ex:alice .prov:Person ex:firstName label}
[Smith] {ex:lastName}`);

console.log(result.quads);
// RDF/JS quads ready for n3.js, rdflib, etc.
// @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
// @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
// @prefix prov: <http://www.w3.org/ns/prov#>.
// @prefix ex: <http://example.org/>.

// ex:doc a ex:Article;
//     rdfs:label "Document";
//     ex:author ex:alice.
// ex:alice a prov:Person;
//     rdfs:label "Alice";
//     ex:firstName "Alice";
//     ex:lastName "Smith".
```

## 📚 Documentation Hub

- **📖 [Documentation](./docs/index.md)** - Complete documentation with guides and references
- **🎯 [Examples](./examples/index.md)** - Real-world MD-LD examples and use cases  
- **� [Specification](./spec/index.md)** - Formal specification and test suite



## 🌟 What is MD-LD?

MD-LD allows you to author RDF graphs directly in Markdown using explicit `{...}` annotations:

```markdown
[my] <tag:alice@example.com,2026:>
# 2024-07-18 {=my:journal-2024-07-18 .my:Event my:date ^^xsd:date}

## A good day {label}

Mood: [Happy] {my:mood}
Energy level: [8] {my:energyLevel ^^xsd:integer}

Met [Sam] {+my:sam .my:Person ?my:attendee} on my regular walk at [Central Park] {+my:central-park ?my:location .my:Place label @en} and talked about [Sunny] {my:weather} weather. 

Activities:

- **Walking** {+ex:walking ?my:hasActivity .my:Activity label}
- **Reading** {+ex:reading ?my:hasActivity .my:Activity label}
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

## ✨ Core Features

- **🔗 Prefix folding** - Build hierarchical namespaces with lightweight IRI authoring
- **📍 Subject declarations** - `{=IRI}` and `{=#fragment}` for context setting
- **🎯 Object IRIs** - `{+IRI}` and `{+#fragment}` for temporary object declarations  
- **🔄 Three predicate forms** - `p` (S→L), `?p` (S→O), `!p` (O→S)
- **🏷️ Type declarations** - `.Class` for rdf:type triples
- **📅 Datatypes & language** - `^^xsd:date` and `@en` support
- **🧩 Fragments** - Document structuring with `{=#fragment}`
- **⚡ Polarity system** - Sophisticated diff authoring with `+` and `-` prefixes
- **📍 Origin tracking** - Complete provenance with lean quad-to-source mapping

## 📦 Installation

### Node.js

```bash
pnpm install mdld-parse
```

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
  
  const result = parse('# Hello {=ex:hello label}');
</script>
```


## 🧠 Semantic Model

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

## 🎨 Syntax Quick Reference

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
[Content] {label}
```

```turtle
ex:document#summary rdfs:label "Content" .
```

Fragments replace any existing fragment and require a current subject.

Subject remains in scope until reset with `{=}` or new subject declared.

### Type Declaration

Emit `rdf:type` triple:

```markdown
## Apollo 11 {=ex:apollo11 .ex:SpaceMission .ex:Event}
```

```turtle
ex:apollo11 a ex:SpaceMission, ex:Event .
```

### Literal Properties

Inline value carriers emit literal properties:

```markdown
# Mission {=ex:apollo11}

[Neil Armstrong] {ex:commander}
[1969] {ex:year ^^xsd:gYear}
[Historic mission] {ex:description @en}
```

```turtle
ex:apollo11 ex:commander "Neil Armstrong" ;
  ex:year "1969"^^xsd:gYear ;
  ex:description "Historic mission"@en .
```

### Object Properties

Links create relationships (use `?` prefix):

```markdown
# Mission {=ex:apollo11}

[NASA] {=ex:nasa ?ex:organizer}
```

```turtle
ex:apollo11 ex:organizer ex:nasa .
```

### Resource Declaration

Declare resources inline with `{=iri}`:

```markdown
# Mission {=ex:apollo11}

[Neil Armstrong] {=ex:armstrong ?ex:commander .prov:Person}
```

```turtle
ex:apollo11 ex:commander ex:armstrong .
ex:armstrong a prov:Person .
```

### Lists

Lists are pure Markdown structure. Each list item requires explicit annotations:

```markdown
# Recipe {=ex:recipe}

Ingredients:

- **Flour** {+ex:flour ?ex:ingredient .ex:Ingredient label}
- **Water** {+ex:water ?ex:ingredient .ex:Ingredient label}
```

```turtle
ex:recipe ex:ingredient ex:flour, ex:water .
ex:flour a ex:Ingredient ; rdfs:label "Flour" .
ex:water a ex:Ingredient ; rdfs:label "Water" .
```

**Key Rules:**
- No semantic propagation from list scope
- Each item must have explicit annotations
- Use `+IRI` to maintain subject chaining for repeated object properties

### Code Blocks

Code blocks are value carriers:

````markdown
# Example {=ex:example}

```javascript {=ex:code .ex:SoftwareSourceCode ex:text}
console.log("hello");
```
````

```turtle
ex:code a ex:SoftwareSourceCode ;
  ex:text "console.log(\"hello\")" .
```

### Blockquotes

```markdown
# Article {=ex:article}

> MD-LD bridges Markdown and RDF. {comment}
```

```turtle
ex:article rdfs:comment "MD-LD bridges Markdown and RDF." .
```

### Reverse Relations

Reverse the relationship direction:

```markdown
# Part {=ex:part}

Part of: {!ex:hasPart}

- Book {=ex:book}
```

```turtle
ex:book ex:hasPart ex:part .
```

### Prefix Declarations

```markdown
[ex] <http://example.org/>
[foaf] <http://xmlns.com/foaf/0.1/>

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

## 🔧 API Reference
- `remove`: Empty (cancelled in-stream)

### External Retraction

When removing a quad that doesn't exist in the current document:

```markdown
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}  # External retract
[Senior Software Engineer] {my:jobTitle}
```

**Results:**
- `quads`: Contains `Senior Software Engineer` job title  
- `remove`: Contains `Software Engineer` job title (targets prior state)

### Remove Token Forms

| Token | Normal | Remove | Effect |
|-------|---------|--------|---------|
| `p` | `[value] {label}` | `[value] {-label}` | Remove literal property |
| `?p` | `[obj] {?rel}` | `[obj] {-?rel}` | Remove object property |
| `!p` | `[obj] {!rel}` | `[obj] {-!rel}` | Remove reverse property |
| `.C` | `{.Type}` | `{-.Type}` | Remove type assertion |

### Mixed Polarity

Same annotation can have both add and remove tokens:

```markdown
# Doc {=my:doc -.my:Draft .my:Published -my:version}
[2.0] {my:version}
```

**Streaming trace:**
1. `-.my:Draft` → External retract (Draft not in current state)
2. `.my:Published` → Add Published type
3. `-my:version "Doc"` → External retract (version not in current state)  
4. `my:version "2.0"` → Add version 2.0

### Type Migration

Replace types in a single annotation:

```markdown
# Project Alpha {=my:proj -.my:ActiveProject .my:ArchivedProject}
```

**Results:**
- `quads`: `my:proj rdf:type my:ArchivedProject`
- `remove`: `my:proj rdf:type my:ActiveProject`

### Live State Guarantee

The parser maintains a live quad buffer representing the current graph state at every point during parsing. Remove tokens route against this state:

- **If quad exists in buffer** → Cancel immediately (appears nowhere)
- **If quad absent from buffer** → Add to remove array (external retract)

This enables powerful diff authoring while maintaining streaming-safe single-pass parsing.

### Invalid Remove Syntax

Some tokens don't support remove polarity and will warn:

```markdown
# These warn but don't crash
{-=my:subject}     # Subject declarations have no polarity
{-+my:object}      # Object declarations have no polarity  
{-^^xsd:date}      # Datatype modifiers have no polarity
{-@en}             # Language tags have no polarity
```

## API Reference

### `parse(markdown, options)`

Parse MD-LD markdown and return RDF quads with lean origin tracking.

**Parameters:**

- `markdown` (string) — MD-LD formatted text
- `options` (object, optional):
  - `context` (object) — Prefix mappings (default: `{ '@vocab': 'http://www.w3.org/2000/01/rdf-schema#', rdf, rdfs, xsd, sh, prov }`)
  - `dataFactory` (object) — Custom RDF/JS DataFactory

**Returns:** `{ quads, remove, origin, context }`

- `quads` — Array of RDF/JS Quads (final resolved graph state)
- `remove` — Array of RDF/JS Quads (external retractions targeting prior state)
- `origin` — Lean origin tracking object with:
  - `quadIndex` — Map of quads to origin entries for UI navigation and audit
- `context` — Final context used (includes prefixes)

**Note:** `remove` contains external retractions for multi-document scenarios. See [Polarity Documentation](./docs/polarity.md) for complete details.

**Example:**

```javascript
const result = parse(
  `# Article {=ex:article .ex:Article}
  
  [Alice] {=ex:alice ?author}
  [Bob] {-ex:author}`,  // Remove previous author
  { context: { ex: 'http://example.org/' } }
);

console.log(result.quads);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
//     object: { termType: 'NamedNode', value: 'http://example.org/Article' }
//   },
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
//     object: { termType: 'NamedNode', value: 'http://example.org/alice' }
//   }
// ]

console.log(result.remove);
// [] - Empty because Alice author was cancelled in-stream

// For external retractions:
const result2 = parse(
  `# Article {=ex:article}
  [Alice] {-ex:author}`,  // External retract (Alice not in current state)
  { context: { ex: 'http://example.org/' } }
);

console.log(result2.remove);
// [
//   {
//     subject: { termType: 'NamedNode', value: 'http://example.org/article' },
//     predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
//     object: { termType: 'NamedNode', value: 'http://example.org/alice' }
//   }
// ]
```

### `merge(docs, options)`

Merge multiple MDLD documents with diff polarity resolution.

**Parameters:**

- `docs` (array) — Array of markdown strings or ParseResult objects
- `options` (object, optional):
  - `context` (object) — Prefix mappings (merged with DEFAULT_CONTEXT)

**Returns:** `{ quads, remove, origin, context }`

- `quads` — Merged array of RDF/JS Quads
- `remove` — Array of retractions from merge process
- `origin` — Merge origin with document chain:
  - `documents` — Array of document metadata
  - `quadIndex` — Combined quad index from all documents
- `context` — Final merged context

**Example:**

```javascript
const merged = merge([
  `# Article {=ex:article}
  [Bob] {author}`,
  `# Article {=ex:article}
  [Bob] {-author}
  [Charlie] {author}`
], { context: { ex: 'http://example.org/' } });

console.log(merged.quads.length); // 2 (type + Charlie author)
console.log(merged.remove.length); // 1 (Bob author removal)
```

### `generate(quads, context)`

Generate deterministic MDLD from RDF quads.

**Parameters:**

- `quads` (array) — Array of RDF/JS Quads to convert
- `context` (object, optional) — Prefix mappings (default: `{}`)
  - Merged with DEFAULT_CONTEXT for proper CURIE shortening
  - Only user-defined prefixes are rendered in output

**Returns:** `{ text, context }`

- `text` — Generated MDLD markdown
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
    predicate: { termType: 'NamedNode', value: 'http://example.org/author' },
    object: { termType: 'NamedNode', value: 'http://example.org/alice' }
  }
];

const result = generate(quads, { 
  ex: 'http://example.org/',
});

console.log(result.text);
// # Article {=ex:article .ex:Article}
//
// > alice {+ex:alice ?ex:author}
```

### `locate(quad, origin)`

Locate the origin entry for a quad using the lean origin system.

**Parameters:**

- `quad` (object) — The quad to locate (subject, predicate, object)
- `origin` (object) — Origin object containing quadIndex

**Returns:** `{ blockId, range, carrierType, subject, predicate, context, value, polarity }` or `null`

- `blockId` — ID of the containing block
- `range` — Character range of the carrier in the source text
- `carrierType` — Type of carrier (heading, blockquote, span)
- `subject` — Subject IRI of the quad
- `predicate` — Predicate IRI of the quad
- `context` — Context object inherited from parsing
- `value` — Raw carrier text content
- `polarity` — '+' for assertions, '-' for retractions

**Example:**

```javascript
import { parse, locate } from 'mdld-parse';

const result = parse(mdldText, { context: { ex: 'http://example.org/' } });
const quad = result.quads[0]; // Find a quad to locate

const location = locate(quad, result.origin);

console.log(location.range); // { start: 38, end: 44 }
console.log(location.value); // "Alice"
console.log(location.carrierType); // "blockquote"
```

📖 **See [Origin Documentation](./docs/origin.md)** for complete origin system details and advanced usage.

### `render(quads, options)`

Render RDF quads as HTML+RDFa for web display.

**Parameters:**

- `quads` (array) — Array of RDF/JS Quads to render
- `options` (object, optional):
  - `context` (object) — Prefix mappings for CURIE shortening
  - `baseIRI` (string) — Base IRI for resolving relative references

**Returns:** `{ html, context }`

- `html` — HTML string with RDFa annotations
- `context` — Context used for rendering

**Example:**

```javascript
import { parse, render } from 'mdld-parse';

const result = parse(mdldText);
const rendered = render(result.quads, { ex: 'http://example.org/' });

console.log(rendered.html);
// <div typeof="ex:Article">
//   <span property="ex:author">Alice</span>
// </div>
```

### Utility Functions

The following utility functions are also exported:

```javascript
import {
  DEFAULT_CONTEXT,    // Default prefix mappings
  DataFactory,        // RDF/JS DataFactory instance
  hash,              // String hashing function
  expandIRI,         // IRI expansion with context
  shortenIRI,        // IRI shortening with context
  parseSemanticBlock // Parse semantic block syntax
} from 'mdld-parse';
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
- List items (`- item`, `1. item`) — pure Markdown structure
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

Therefore, algebra is **closed**.

## Use Cases

### Personal Knowledge Management

```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting}

Attendees:

- **Alice** {+alice:alice ?alice:attendee label}
- **Bob** {+alice:bob ?alice:attendee label}

Action items:

- **Review proposal** {+alice:task-1 ?alice:actionItem label}
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
- Explicit list item annotations
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