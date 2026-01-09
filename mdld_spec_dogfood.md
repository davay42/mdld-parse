# MD-LD – Markdown-Linked Data Specification {=urn:mdld:spec .Article}

[MD-LD]{name} is a [Markdown authoring format]{description} that allows humans and digital agents to author RDF graphs directly in plain text, without requiring RDF-specific syntaxes like Turtle or RDF/XML.

- [What MD-LD Is](#what-is){hasPart}
- [Markdown → RDF Mapping](#minimal-mapping){hasPart}
- [RDF Markdown Attribute Syntax](#attribute-syntax){hasPart}
- [Tasks and Actions](#tasks){hasPart}
- [Tutorial: Recipe with Nutrition](#tutorial){hasPart}
- [Future Extensions](#future){hasPart}

## What MD-LD Is {#what-is .Article}

MD-LD documents have the following characteristics: {about}

- Rooted – exactly one primary subject per document
- Self-describing – YAML-LD frontmatter defines context and global data
- Incrementally semantic – plain Markdown yields minimal RDF; attributes add precision
- Projection-safe – deterministically lowers to HTML + RDFa
- Round-trippable – RDF can be extracted and re-embedded without loss

MD-LD does not replace RDFa or JSON-LD. It is an authoring surface that projects into those standards. {disambiguatingDescription}

## Core Principles {#principles .ItemList}

These principles are normative and MUST be followed by conforming implementations: {itemListElement}

- One document maps to one root subject
- YAML-LD frontmatter is mandatory
- Markdown body may introduce additional subjects
- Visible text is authoritative
- Semantics follow document structure
- No implicit inference rules
- Anything not expressible cleanly is deferred to generated HTML

### Default Context {#default-context .HowToSection}

Unless overridden, implementations SHOULD assume a default vocabulary of http://schema.org/. {text}

This enables concise authoring using terms like `name`, `startDate`, `Action` without prefixes.

### Root Subject Declaration {#root-subject .HowToSection}

The root subject is declared in yje first heading of the document. {text}

Example:

```md
# Alice James {=http://example.org/alice .Person}
```

Maps to:

```turtle
<http://example.org/alice> a schema:Person ;
  rdfs:label "Alice James" .
```

This subject becomes the implicit base for the Markdown body. {text}

## Markdown to RDF Minimal Mapping {#minimal-mapping .Article}

Even plain Markdown without attributes yields RDF triples. {abstract}

### Headings {#headings-rule .HowToSection}

The document's top-level heading becomes the title of the root subject.

```markdown
# My Research Notes
```

Maps to:

```turtle
<urn:mdld:my-research-notes> a schema:NoteDigitalDocument ;
  rdfs:label "My Research Notes" .
```

### First Paragraph {#first-para-rule .HowToSection}

The first paragraph after the title becomes the description property. {text}

```markdown
This is a personal note about identity systems.
```

Maps to:

```turtle
<urn:mdld:my-research-notes> dct:description
  "This is a personal note about identity systems." .
```

### Bare Links {#bare-links-rule .HowToSection}

Bare links are parsed as dc:references. {text}

#### Example

MD-LD:

```markdown
See https://doi.org/10.1000/182 for more details.
Read [more](https://doi.org/10.1000/183).
```

Turtle:

```turtle
<urn:mdld:my-research-notes> dc:references <https://doi.org/10.1000/182>, <https://doi.org/10.1000/183> .
<https://doi.org/10.1000/183> rdfs:label "more"
```

## RDF Markdown Attribute Syntax {#attribute-syntax .Article}

MD-LD uses Pandoc-style attribute blocks to add semantic annotations. {abstract}

### Code Blocks {#code-blocks .HowToSection}

Fenced code blocks are treated as SoftwareSourceCode resources with programming language and raw source attached. {text}

MD‑LD:

```sparql {#all-triples}
SELECT * WHERE { ?s ?p ?o }
```

Turtle:

```turtle
@prefix schema: <http://schema.org/> .

<#all-triples> a schema:SoftwareSourceCode ;
  schema:programmingLanguage "sparql" ;
  schema:text "SELECT * WHERE { ?s ?p ?o }" .
```

The surrounding section subject also hasPart this code snippet, enabling later queries such as listing all SPARQL blocks in a notebook. {text}

### Subject Declaration {#subject-decl .HowToSection}

Headings can declare new subjects using the #id and =IRI syntax. {text}

### Literal Properties {#literal-props .HowToSection}

Inline spans with the property attribute create literal values. {text}

MD‑LD:

```markdown
# Alice {=http://example.org/alice}

[Alice Johnson]{name}
```

Turtle:

```turtle
@prefix schema: <http://schema.org/> .


<http://example.org/alice> rdfs:label "Alice"; schema:name "Alice Johnson" .
```

For typed literals, use the datatype attribute:

MD‑LD:

```markdown
[30]{age ^^xsd:integer}
```

Turtle:

```turtle
@prefix schema: <http://schema.org/> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

<http://example.org/alice> schema:age "30"^^xsd:integer .
```

### Object Properties {#object-props .HowToSection}

Links with the rel attribute create relationships between subjects. {text}

MD‑LD:

```markdown
# Alice {=ex:alice}

Works at [ACME Corp](#acme){worksFor}
```

Turtle:

```turtle
@prefix schema: <http://schema.org/> .

<http://example.org/alice> schema:worksFor <http://example.org/alice#acme> .
```

### Lists as Repeated Properties {#lists-repeated .HowToSection}

List items with the same property attribute create multiple values for that property. {text}

MD‑LD:

```markdown
# Conference Dinner {=ex:event1}

Dresscode: {dressCode}

- Blouse and Skirt
- Blazer and Tie
```

Turtle:

```turtle
@prefix schema: <http://schema.org/> .

<http://example.org/event1> schema:dressCode "Blouse and Skirt" .
<http://example.org/event1> schema:dressCode "Blazer and Tie" .
```

## Tasks and Actions {#tasks .Article}

Markdown task lists are mapped to schema:Action instances. If no id provided - slugify and truncate the text. {abstract}

```markdown
# My tasks

- [x] Submit paper {#submit}
- [ ] Revise abstract
```

Maps to:

```turtle
<urn:mdld:my-tasks#submit> a schema:Action ;
   schema:name "Submit paper" ;
   schema:actionStatus schema:CompletedActionStatus .

<urn:mdld:my-tasks#revise-abstract> a schema:Action ;
   schema:name "Revise abstract" ;
   schema:actionStatus schema:PotentialActionStatus .
```

Extend tasks semantically:

```markdown

# Tasks {=urn:md:tasks .TaskList}

- [x] Complete review {#review .Event }
- [ ] Submit paper {#submit}
```

Maps to:

```turtle
<urn:md:tasks> <http://www.w3.org/2000/01/rdf-schema#label> "Tasks" .
<urn:md:tasks> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/TaskList> .
<urn:md:tasks#review> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Event> .
<urn:md:tasks#review> <http://schema.org/name> "Complete review" .
<urn:md:tasks#review> <http://schema.org/actionStatus> <http://schema.org/CompletedActionStatus> .
<urn:md:tasks> <http://schema.org/potentialAction> <urn:md:tasks#review> .
<urn:md:tasks#submit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Action> .
<urn:md:tasks#submit> <http://schema.org/name> "Submit paper" .
<urn:md:tasks#submit> <http://schema.org/actionStatus> <http://schema.org/PotentialActionStatus> .
<urn:md:tasks> <http://schema.org/potentialAction> <urn:md:tasks#submit> .
```

If the task appears under a subject section, it is linked via schema:potentialAction. {text}

## Images and Media {#media .HowToSection}

Image syntax creating image relationships is a planned extension and is not implemented in the v0.1 parser. {text}

## Attribute Reference {#attr-reference .DefinedTermSet}

### id attribute {#attr-id .DefinedTerm}

- [Subject IRI fragment identifier]{property="name"}
- [Creates or references a subject with the given fragment identifier]{property="description"}

### typeof attribute {#attr-typeof .DefinedTerm}

- RDF type declaration {name}
- Specifies the rdf:type of a subject {description}

### property attribute {#attr-property .DefinedTerm}

- Literal predicate {name}
- Creates a literal-valued property on the current subject {description}

### rel attribute {#attr-rel .DefinedTerm}

- Object predicate {name}
- Creates a relationship to another resource {description}

### resource attribute {#attr-resource .DefinedTerm}

- Object IRI (future extension) {name}
- Planned attribute to explicitly specify the target IRI for a relationship {description}

### datatype attribute {#attr-datatype .DefinedTerm}

- Literal datatype {name}
- Specifies the XSD datatype for a literal value {description}

### lang attribute {#attr-lang .DefinedTerm}

- Language tag (future extension) {name}
- Planned attribute to specify the language of a literal value {description}

## Tutorial Example: Recipe with Nutrition {#tutorial .Article}

Here is a complete example showing how to model a recipe with ingredients and nutritional information.

```markdown
## Pancake Recipe {#recipe .Recipe}

- [Flour](#flour){recipeIngredient}
- [Milk](#milk){recipeIngredient}

### Flour

{#flour .Food}

- [76]{carbohydrateContent ^^xsd:float}
- [10]{proteinContent ^^xsd:float}

### Milk {#milk .Food}

- [5]{carbohydrateContent ^^xsd:float}
- [3.4]{proteinContent ^^xsd:float}
```

This creates approximately 15 triples forming a fully navigable graph.

## Non-Goals {#non-goals .ItemList}

MD-LD intentionally does not attempt to: {comment}

- Replace Turtle or other RDF serializations
- Encode OWL axioms or ontology definitions
- Express inference rules
- Model named graphs inline
- Validate constraints or perform SHACL validation

Those capabilities belong to downstream processing layers. { disambiguatingDescription}

## Summary {#summary .Article}

MD-LD is: {about}

- Markdown first – readable as plain text 
- RDF grounded – produces valid RDF graphs 
- HTML/RDFa compatible – projects cleanly to web standards 
- LLM friendly – easy for AI agents to parse and generate 
- Deterministic – same input always produces same output

MD-LD is not: {comment}

- A new RDF serialization format
- A database query language
- A reasoning or inference system

MD-LD turns Markdown into a semantic authoring medium, while keeping the Web as the universal runtime.
