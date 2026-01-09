# MD-LD v0.2 Specification

**Markdown-Linked Data** — A streaming-parseable RDF authoring format that extends Markdown with semantic annotations contained in curly braces.

## Design Principles

1. **Streaming single-pass parsing** — Process line-by-line, emit RDF quads immediately
2. **Curly-brace containment** — All semantics in `{...}`, trivial to strip for plain Markdown view
3. **RDFa-aligned semantics** — Follow RDFa Core patterns for chaining, relations, and context
4. **Automatic IRI generation** — Slugify text content when explicit IRI not provided
5. **Subject context persistence** — Current subject continues until next subject declaration
6. **Unambiguous syntax** — No parser guesswork, deterministic RDF output

## Default Context

MD-LD assumes RDFa core prefixes and schema.org vocabulary by default:

```javascript
{
  '@vocab': 'http://schema.org/',
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'dct': 'http://purl.org/dc/terms/',
  'foaf': 'http://xmlns.com/foaf/0.1/',
  'dc': 'http://purl.org/dc/elements/1.1/'
}
```

## Prefix & Vocabulary Declaration

Use link reference definition syntax for custom prefixes:

```markdown
[@vocab]{: https://schema.org/}
[ex]{: http://example.com/}
[@base]{: http://example.com/}
[wd]{: https://www.wikidata.org/entity/}
```

This syntax is unambiguous (uses `:` after closing `}`) and applies to all following content in streaming order.

## Core Syntax

### Subject Declaration

**Headings** establish subjects. Use `{=iri}` for explicit IRI or CURIE. If omitted, heading text is slugified:

```markdown
# Apollo 11 Mission {=wd:Q43653 .SpaceMission}

## Launch Vehicle

## Crew {=urn:mdld:crew}
```

```turtle
@prefix schema: <http://schema.org/> .
@prefix wd: <https://www.wikidata.org/entity/> .

wd:Q43653 a schema:SpaceMission ;
  rdfs:label "Apollo 11 Mission" .

<urn:mdld:launch-vehicle> rdfs:label "Launch Vehicle" .

<urn:mdld:crew> rdfs:label "Crew" .
```

**Inline spans** can also declare subjects:

```markdown
The [Saturn V]{=wd:Q190532 .Vehicle} rocket was powerful.
```

```turtle
wd:Q190532 a schema:Vehicle ;
  rdfs:label "Saturn V" .
```

### Subject Context Persistence

Current subject persists until next subject declaration (RDFa-style chaining):

```markdown
# Apollo 11 {=wd:Q43653}

Launch date: [July 16, 1969]{startDate ^^xsd:date}
Launch site: [Kennedy Space Center]{location}

## Crew

Commander: [Neil Armstrong]{name}
```

```turtle
wd:Q43653 rdfs:label "Apollo 11" ;
  schema:startDate "July 16, 1969"^^xsd:date ;
  schema:location "Kennedy Space Center" .

<urn:mdld:crew> rdfs:label "Crew" ;
  schema:name "Neil Armstrong" .
```

### Type Declaration

Use `.ClassName` to assign RDF types. Multiple types allowed:

```markdown
# Berlin {=wd:Q64 .City .Place}
```

```turtle
wd:Q64 a schema:City , schema:Place ;
  rdfs:label "Berlin" .
```

### Literal Properties

Inline spans with `{property}` create literal values on current subject:

```markdown
## Meeting {=ex:meeting1 .Event}

Date: [2025-01-15]{startDate ^^xsd:date}
Location: [Berlin]{location}
Capacity: [150]{maximumAttendeeCapacity ^^xsd:integer}
```

```turtle
<http://example.org/meeting1> a schema:Event ;
  rdfs:label "Meeting" ;
  schema:startDate "2025-01-15"^^xsd:date ;
  schema:location "Berlin" ;
  schema:maximumAttendeeCapacity "150"^^xsd:integer .
```

### Object Properties via Links

Links with `{property}` create relationships. Link destination always uses an explicit IRI `=iri`:

```markdown
# Apollo 11 {=wd:Q43653}

Launched from [Kennedy Space Center](=wd:Q483282){location}
Commander [Neil Armstrong](=urn:mdld:armstrong){astronaut}

## Neil Armstrong {=urn:mdld:armstrong .Person}
```

```turtle
wd:Q43653 rdfs:label "Apollo 11" ;
  schema:location wd:Q483282 ;
  schema:astronaut <#armstrong> .

wd:Q483282 rdfs:label "Kennedy Space Center" .

<urn:mdld:armstrong> a schema:Person ;
  rdfs:label "Neil Armstrong" .
```

### Chained Subject Declaration

Combine subject declaration with property in link annotation:

```markdown
# Mission {=ex:apollo11}

Commander: [Neil Armstrong](=wd:Q1615){astronaut .Person}
```

```turtle
<http://example.org/apollo11> rdfs:label "Mission" ;
  schema:astronaut wd:Q1615 .

wd:Q1615 a schema:Person ;
  rdfs:label "Neil Armstrong" .
```

### Backward Relations

Use `{^property}` to reverse the triple direction:

```markdown
# Saturn V {=wd:Q190532}

Part of [Apollo Program](=wd:Q495307){^hasPart}
```

```turtle
wd:Q495307 schema:hasPart wd:Q190532 .
wd:Q495307 rdfs:label "Apollo Program" .
```

### Block-level properties

You can add a semantic annotation in the end of any block - the content of the block will become the value. Block = paragraph, list item, heading, code block, quote.

```md
Long text paragraph that spans multiple
lines and end with the annotation {description}
```

```turtle
<current-subject> schema:description "Long text paragraph that spans multiple\nlines and end with the annotation" .
```

### Lists as Repeated Properties

Lists following `{property}` annotation create multiple values:

```markdown
# Conference {=ex:conf2025}

Speakers: {performer .Person}

- Alice Johnson {=ex:alice}
- Bob Smith {=ex:bob}
- Carol White {=ex:carol}
```

```turtle
<http://example.org/conf2025> rdfs:label "Conference" ;
  schema:performer <http://example.org/alice> ,
                   <http://example.org/bob> ,
                   <http://example.org/carol> .

<http://example.org/alice> a schema:Person ;
  rdfs:label "Alice Johnson" .

<http://example.org/bob> a schema:Person ;
  rdfs:label "Bob Smith" .

<http://example.org/carol> a schema:Person ;
  rdfs:label "Carol White" .
```

### Code Blocks

Fenced code blocks become `SoftwareSourceCode`. Annotations in fence line:

```markdown
\`\`\`sparql {=urn:mdld:query1 .SparqlQuery}
SELECT \* WHERE { ?s ?p ?o }
\`\`\`

\`\`\`javascript {=ex:parser-v2}
function parse(input) { return tokens; }
\`\`\`
```

```turtle
<urn:mdld:query1> a schema:SparqlQuery , schema:SoftwareSourceCode ;
  schema:programmingLanguage "sparql" ;
  schema:text "SELECT * WHERE { ?s ?p ?o }" .

<http://example.org/parser-v2> a schema:SoftwareSourceCode ;
  schema:programmingLanguage "javascript" ;
  schema:text "function parse(input) { return tokens; }" .
```

### Task Lists

Markdown tasks map to `Action` instances. Linked to parent via `potentialAction`. Auto-slugify if no explicit IRI:

```markdown
# Project Tasks

- [x] Review paper {=ex:task1}
- [ ] Submit revision
- [ ] Present findings
```

```turtle
<urn:mdld:project-tasks> rdfs:label "Project Tasks" ;
  schema:potentialAction <http://example.org/task1> ,
                         <urn:task:submit-revision> ,
                         <urn:task:present-findings> .

<http://example.org/task1> a schema:Action ;
  schema:name "Review paper" ;
  schema:actionStatus schema:CompletedActionStatus .

<urn:task:submit-revision> a schema:Action ;
  schema:name "Submit revision" ;
  schema:actionStatus schema:PotentialActionStatus .

<urn:task:present-findings> a schema:Action ;
  schema:name "Present findings" ;
  schema:actionStatus schema:PotentialActionStatus .
```

### Language Tags

Use `{@lang}` for language-tagged literals:

```markdown
# Berlin {=wd:Q64}

[Berlin]{name @en}
[Берлин]{name @ru}
[柏林]{name @zh}
```

```turtle
wd:Q64 rdfs:label "Berlin" ;
  schema:name "Berlin"@en ;
  schema:name "Берлин"@ru ;
  schema:name "柏林"@zh .
```

### Bare URLs

Bare URLs create `dc:references` from current subject:

```markdown
# Research Note {=ex:note1}

See https://www.w3.org/TR/rdf11-primer/ for details.
Also https://schema.org/docs/documents.html
```

```turtle
<http://example.org/note1> rdfs:label "Research Note" ;
  dc:references <https://www.w3.org/TR/rdf11-primer/> ,
                <https://schema.org/docs/documents.html> .
```

### Inline Compact Properties

Multiple properties on one subject using `key="value"` syntax:

```markdown
[Berlin](=wd:Q64){name="Berlin" population="3850809"^^xsd:integer .City}
```

```turtle
wd:Q64 a schema:City ;
  rdfs:label "Berlin" ;
  schema:name "Berlin" ;
  schema:population "3850809"^^xsd:integer .
```

### Images and media embeds

```md
Generic media embedding (default)
![Apollo launch audio](./launch.mp3)
```

Emits:

```turtle
<current-subject> schema:associatedMedia <./launch.mp3> .

<./launch.mp3> a schema:MediaObject ;
  rdfs:label "Apollo launch audio" .
```

#### Explicit media typing

```md
![Launch audio](./launch.mp3){=ex:apollo-audio .AudioObject}
```

```turtle
ex:apollo-audio a schema:AudioObject ;
  rdfs:label "Launch audio" ;
  schema:contentUrl <./launch.mp3> .

<current-subject> schema:associatedMedia ex:apollo-audio .
```

#### Custom predicates

```md
![Dataset](./data.csv){distribution .Dataset}
```

```turtle
<current-subject> schema:distribution <./data.csv> .
<./data.csv> a schema:Dataset .
```

## Parsing Rules

1. **Subject Context**: Current subject starts as document root, changes at headings/spans with `{=iri}`, persists until next declaration
2. **Auto-slugification**: Missing IRI generates `urn:mdld:slugified-text` for headings, `urn:task:slugified-text` for tasks
3. **Property Resolution**: Bare property names resolve via `@vocab` (default: `http://schema.org/`)
4. **Label Extraction**: Text content automatically becomes `rdfs:label` on subjects
5. **Streaming Processing**: Line-by-line parsing, immediate quad emission
6. **Prefix Scope**: Declarations apply forward in document order

## Complete Example

```markdown
[@vocab]{: http://schema.org/}
[ex]{: http://example.org/}
[wd]{: https://www.wikidata.org/entity/}

# Apollo 11 Mission {=wd:Q43653 .SpaceMission}

Launch date: [July 16, 1969]{startDate ^^xsd:date}
Launch site: [Kennedy Space Center](=wd:Q483282){location .Place}

## Crew

Commander: [Neil Armstrong](=wd:Q1615){astronaut .Person}
Lunar Module Pilot: [Buzz Aldrin](=wd:Q2252){astronaut .Person}

[Buzz Aldrin](=wd:Q2252)

Born: [January 20, 1930]{birthDate ^^xsd:date}
Education: [MIT](=wd:Q49108){alumniOf .EducationalOrganization}

## Launch Vehicle {=wd:Q190532 .Vehicle}

[Saturn V]{name}

Height: [110.6 meters]{height}
Mass: [2,970,000 kg]{weight}

Engines: {hasPart}

- F-1 Engine {=wd:Q936250 .Engine}
- J-2 Engine {=wd:Q1677854 .Engine}

Part of [Apollo Program](=wd:Q495307){^hasPart}

## Mission Timeline

- [x] Launch vehicle
- [x] Lunar orbit insertion {=ex:task-orbit}
- [x] Lunar landing
- [x] Moonwalk
- [x] Return to Earth

## Analysis Code

\`\`\`sparql {#trajectory-query}
SELECT ?event ?time WHERE {
?event a schema:Event ;
schema:startDate ?time .
}
ORDER BY ?time
\`\`\`

References:
https://history.nasa.gov/ap11ann/introduction.htm
```

```turtle
@prefix schema: <http://schema.org/> .
@prefix ex: <http://example.org/> .
@prefix wd: <https://www.wikidata.org/entity/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .

wd:Q43653 a schema:SpaceMission ;
  rdfs:label "Apollo 11 Mission" ;
  schema:startDate "July 16, 1969"^^xsd:date ;
  schema:location wd:Q483282 .

wd:Q483282 a schema:Place ;
  rdfs:label "Kennedy Space Center" .

<urn:mdld:crew> rdfs:label "Crew" .

wd:Q43653 schema:astronaut wd:Q1615 , wd:Q2252 .

wd:Q1615 a schema:Person ;
  rdfs:label "Neil Armstrong" .

wd:Q2252 a schema:Person ;
  rdfs:label "Buzz Aldrin" ;
  schema:birthDate "January 20, 1930"^^xsd:date ;
  schema:alumniOf wd:Q49108 .

wd:Q49108 a schema:EducationalOrganization ;
  rdfs:label "MIT" .

wd:Q190532 a schema:Vehicle ;
  rdfs:label "Launch Vehicle" ;
  schema:name "Saturn V" ;
  schema:height "110.6 meters" ;
  schema:weight "2,970,000 kg" ;
  schema:hasPart wd:Q936250 , wd:Q1677854 .

wd:Q936250 a schema:Engine ;
  rdfs:label "F-1 Engine" .

wd:Q1677854 a schema:Engine ;
  rdfs:label "J-2 Engine" .

wd:Q495307 schema:hasPart wd:Q190532 ;
  rdfs:label "Apollo Program" .

<urn:mdld:mission-timeline> rdfs:label "Mission Timeline" ;
  schema:potentialAction <urn:task:launch-vehicle> ,
                         <http://example.org/task-orbit> ,
                         <urn:task:lunar-landing> ,
                         <urn:task:moonwalk> ,
                         <urn:task:return-to-earth> .

<urn:task:launch-vehicle> a schema:Action ;
  schema:name "Launch vehicle" ;
  schema:actionStatus schema:CompletedActionStatus .

<http://example.org/task-orbit> a schema:Action ;
  schema:name "Lunar orbit insertion" ;
  schema:actionStatus schema:CompletedActionStatus .

<urn:task:lunar-landing> a schema:Action ;
  schema:name "Lunar landing" ;
  schema:actionStatus schema:CompletedActionStatus .

<urn:task:moonwalk> a schema:Action ;
  schema:name "Moonwalk" ;
  schema:actionStatus schema:CompletedActionStatus .

<urn:task:return-to-earth> a schema:Action ;
  schema:name "Return to Earth" ;
  schema:actionStatus schema:CompletedActionStatus .

<urn:mdld:trajectory-query> a schema:SoftwareSourceCode ;
  schema:programmingLanguage "sparql" ;
  schema:text "SELECT ?event ?time WHERE {\n  ?event a schema:Event ;\n         schema:startDate ?time .\n}\nORDER BY ?time" .

wd:Q43653 dc:references <https://history.nasa.gov/ap11ann/introduction.htm> .
```

## Summary

MD-LD v0.2 provides:

- **Full RDF expressivity** — Forward/backward relations, chaining, datatypes, languages
- **Streaming-friendly** — Single-pass line-by-line parsing with persistent subject context
- **Readable Markdown** — Semantics contained in `{...}`, easily stripped
- **Auto-IRI generation** — Slugified text when explicit IRI not provided
- **RDFa-aligned** — Familiar patterns from RDFa Core 1.1
- **Default context** — RDFa core prefixes + schema.org vocabulary built-in
- **Unambiguous syntax** — Deterministic parsing, predictable RDF output

This specification enables rich semantic authoring while maintaining the simplicity and readability of Markdown.
