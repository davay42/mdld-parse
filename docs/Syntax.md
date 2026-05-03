# MD-LD Syntax Guide

Add semantic annotations to Markdown using `{...}` blocks.

## Basic Annotation

```md
# Apollo 11 {=wd:Q43653 .SpaceMission}
Launched in [1969] {launchYear ^^xsd:gYear} with crew {?crew .Person name}.
```

## Value Carriers

**Inline**: `[text]` `*text*` `**text**` `_text_` `__text__` `` `text` ``
**Block**: `# Heading` `- list item` `> blockquote`
**Links**: `[label](url)` `![image](url)` `<url>`

```md
[*Important*] {mission:status} mission using **Saturn V** {mission:rocket} rocket.
> Longer text description. {quote}
[Photo of the moon](moon.jpg) {?image .Image label}
<https://nasa.gov> {?website .Organization}
```

## Subject Chaining

```md
# Document {=ex:doc}
## Section 1 {=#section1}
[Content] {name}

## Section 2 {=#section2}  
[More content] {name}
```

Creates: `ex:doc#section1`, `ex:doc#section2`

## Predicate Forms

| Syntax | Direction | Example |
|--------|-----------|---------|
| `p`     | S → L     | `[1969] {year}` |
| `?p`    | S → O     | `[NASA] {?operator}` |
| `!p`    | O → S     | `[Mission] {!hasPart}` |

## Lists

Lists are pure Markdown structure with **no semantic scope**. Each list item requires explicit annotations.

```md
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

## Analysis Project {=prj:project .Project label}
Analysis steps:

- **Sample preparation** {+prj:step1 ?member .prj:Task label}
- **Data collection** {+prj:step2 ?member .prj:Task label}
```

**Key Rules:**
- No semantic propagation from list scope
- Each item must have explicit annotations
- Use `+IRI` to maintain subject chaining for repeated object properties
- Nested lists have no inheritance

## List Item Requirements

**✅ CORRECT**
```md
- **Flour** {=ex:flour}              # Subject declaration
- **Walnuts** {+ex:walnuts}          # Subject chaining
```


**Rule**: List items must have explicit subject (`{=iri}` or `{+iri}`) to emit semantics.

## Temporary Objects

```md
[Related] {+ex:related ?schema:isRelatedTo .Entity name}
[Parent] {+ex:parent !schema:hasPart .Organization name}
[Section] {+#subsection name ?hasPart}
```

**Soft Object IRI (`{+iri}`)** - Temporary object for `?` and `!` predicates without changing current subject

**Soft Fragment (`{+#fragment}`)** - Temporary fragment relative to current subject base

The soft IRI only exists within the current annotation block.

## Literals

```md
[1969] {year ^^xsd:gYear}
[July] {month @en}
[Juillet] {month @fr}
[5.2] {rating ^^xsd:decimal}
```

## Code Blocks

```md
```js {=ex:code .SoftwareSourceCode text}
console.log("hello")
```
```

## Context

```md
[ex] <http://example.org/>
[wd] <https://www.wikidata.org/entity/>
[@vocab] <http://schema.org/>
```

## Prefix Folding

Build namespace hierarchies by referencing previously declared prefixes:

```md
# Domain authority
[my] <tag:mymail@domain.com,2026:>

# Hierarchical prefixes
[j] <my:journal:>
[p] <my:property:>
[c] <my:class:>
[person] <my:people:>

# Multi-level nesting
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
[dev] <emp:developer/>
```

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- Circular references are treated as literal strings
- Later declarations override earlier ones

**Examples:**
- `j:2026-01-27` → `tag:mymail@domain.com,2026:journal:2026-01-27`
- `emp:harry` → `https://org.example.com/person/employee/harry`
- `dev:john` → `https://org.example.com/person/employee/developer/john`

## Quick Reference

- `{=IRI}` - Set subject
- `{=#frag}` - Fragment subject  
- `{+IRI}` - Temporary object
- `.Class` - Type declaration
- `p` - Literal predicate
- `?p` - Object predicate  
- `!p` - Reverse predicate
- `^^type` - Datatype
- `@lang` - Language

## Detailed Syntax Reference

### Subject Declaration

Set current subject (emits no quads):

```markdown
## Apollo 11 {=ex:apollo11}
```

### Fragment Syntax

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

```markdown
# Example {=ex:example}

```javascript {=ex:code .ex:SoftwareSourceCode ex:text}
console.log("hello");
```
```

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

Reverse relationship direction:

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

### Value Carriers

### Inline Elements
- `[text] {...}` — span with annotation
- `[text](url) {...}` — link to external resource
- `[text] {...}` — inline resource declaration
- `![alt text](image.png) {...}` — embedding with annotation

### Block Elements
- `# Title` — headings
- `- item` — list items (pure Markdown structure)
- `> quote` — blockquotes
- ```lang code``` — code blocks

### Links and Media
- **Links:** [MD-LD Website](https://mdld.js.org) creates relationships
- **Images:** ![Logo](https://mdld.js.org/logo.png) creates object resources

### Predicate Forms

| Form  | Edge    | Example                      | Meaning          |
|-------|---------|------------------------------|------------------|
| `p`   | S → L   | `[Alice] {name}`             | literal property |
| `?p`  | S → O   | `[NASA] {=ex:nasa ?org}`     | object property  |
| `!p` | O → S    | `[Parent] {=ex:p !hasPart}`  | reverse object   |

### Type Declarations

### Single Types
```markdown
[Single type example] {=mdld:single .Class label}
```

### Multiple Types
```markdown
[Multiple types example] {=mdld:multiple .Class .mdld:Class1 label}
```

### Literal Modifiers

### Typed Literals
```markdown
[2024] {+mdld:year ^^xsd:gYear}
[3.14159] {+mdld:pi ^^xsd:decimal}
[true] {+mdld:bool ^^xsd:boolean}
```

### Language-Tagged Literals
```markdown
[Hello] {+mdld:english @en}
[Bonjour] {+mdld:french @fr}
[Hola] {+mdld:spanish @es}
```

### Datatypes and Language

MD-LD supports standard XML Schema datatypes and language tags:

- **`^^xsd:string`** (default) - Plain text
- **`^^xsd:integer`** - Whole numbers  
- **`^^xsd:decimal`** - Decimal numbers
- **`^^xsd:boolean`** - True/false values
- **`^^xsd:date`** - Date values
- **`^^xsd:dateTime`** - Date and time
- **`@en`**, **`@fr`**, etc. - Language tags

### Context Management

### Subject Context
Subject persists until:
- New subject declaration: `{=new-subject}`
- Subject reset: `{=}`
- End of document

### Prefix Context
Prefixes persist for the entire document:
```markdown
[ex] <http://example.org/>
[foaf] <http://xmlns.com/foaf/0.1/>
```

### Forbidden Constructs

MD-LD explicitly forbids to ensure deterministic parsing:

- ❌ Implicit semantics or structural inference
- ❌ Auto-generated subjects or blank nodes
- ❌ Predicate guessing from context
- ❌ Multi-pass or backtracking parsers

### Processing Pipeline

Document processing follows this pipeline:

1. **Line-by-line scanning** - Sequential token creation
2. **Context resolution** - Prefix and vocabulary expansion  
3. **Subject tracking** - Current subject management
4. **Annotation processing** - Semantic block evaluation
5. **Quad emission** - RDF triple generation

### Core Principles

- **Markdown-preserving** - Remove `{...}` → valid Markdown
- **Explicit only** - No implicit semantics or guessing
- **Single-pass** - Streaming-friendly processing
- **Deterministic** - Same input → same output
- **Traceable** - Every fact traces to its source
- `@lang` - Language
