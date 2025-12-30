---
'@context':
  '@vocab': 'http://schema.org/'
  dct: 'http://purl.org/dc/terms/'
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#'
  xsd: 'http://www.w3.org/2001/XMLSchema#'
  '@base': 'urn:spec:md-ld:v0.1'
'@id': '#root'
'@type': TechArticle
name: 'MD-LD – Markdown-Linked Data Specification'
version: '0.1'
datePublished: '2025-12-30'
inLanguage: 'en'
keywords:
  - Markdown
  - RDF
  - Linked Data
  - Semantic Web
abstract: 'A specification for authoring RDF graphs directly in Markdown without requiring RDF-specific syntaxes.'
---

# MD-LD – Markdown-Linked Data Specification {#spec}

[MD-LD]{property="name"} is a [Markdown authoring format]{property="description"} that allows humans and digital agents to author RDF graphs directly in plain text, without requiring RDF-specific syntaxes like Turtle or RDF/XML.

## What MD-LD Is
{#what-is typeof="Article"}

MD-LD documents have the following characteristics:

- [Rooted – exactly one primary subject per document]{property="about"}
- [Self-describing – YAML-LD frontmatter defines context and global data]{property="about"}
- [Incrementally semantic – plain Markdown yields minimal RDF; attributes add precision]{property="about"}
- [Projection-safe – deterministically lowers to HTML + RDFa]{property="about"}
- [Round-trippable – RDF can be extracted and re-embedded without loss]{property="about"}

[MD-LD does not replace RDFa or JSON-LD. It is an authoring surface that projects into those standards.]{property="disambiguatingDescription"}

## Core Principles
{#principles typeof="ItemList"}

These principles are normative and MUST be followed by conforming implementations:

- [One document maps to one root subject]{property="itemListElement"}
- [YAML-LD frontmatter is mandatory]{property="itemListElement"}
- [Markdown body may introduce additional subjects]{property="itemListElement"}
- [Visible text is authoritative]{property="itemListElement"}
- [Semantics follow document structure]{property="itemListElement"}
- [No implicit inference rules]{property="itemListElement"}
- [Anything not expressible cleanly is deferred to generated HTML]{property="itemListElement"}

## YAML-LD Frontmatter
{#frontmatter typeof="HowTo"}

### Required Fields
{#required-fields typeof="HowToSection"}

[Every MD-LD document MUST include YAML-LD frontmatter with @context and @id fields.]{property="text"}

Example frontmatter:

```yaml
'@context': …
'@id': …
```

### Default Context
{#default-context typeof="HowToSection"}

[Unless overridden, implementations SHOULD assume a default vocabulary of http://schema.org/.]{property="text"}

This enables concise authoring using terms like `name`, `startDate`, `Action` without prefixes.

### Root Subject Declaration
{#root-subject typeof="HowToSection"}

[The root subject is declared in frontmatter using the @id field.]{property="text"}

Example:

```yaml
'@id': urn:fs:/notes/identity.md
'@type': NoteDigitalDocument
name: "My Research Notes"
```

[This subject becomes the implicit context for the Markdown body.]{property="text"}

## Markdown to RDF Minimal Mapping
{#minimal-mapping typeof="Article"}

[Even plain Markdown without attributes yields RDF triples.]{property="abstract"}

### Headings
{#headings-rule typeof="HowToSection"}

The document's top-level heading becomes the title of the root subject.

```markdown
# My Research Notes
```

Maps to:

```turtle
<#doc> a schema:NoteDigitalDocument ;
  dct:title "My Research Notes" .
```

### First Paragraph
{#first-para-rule typeof="HowToSection"}

[The first paragraph after the title becomes the description property.]{property="text"}

```markdown
This is a personal note about identity systems.
```

Maps to:

```turtle
<#doc> dct:description
  "This is a personal note about identity systems." .
```

### Bare Links
{#bare-links-rule typeof="HowToSection"}

[Standalone URLs in the text create reference relationships.]{property="text"}

```markdown
See https://example.org.
```

Maps to:

```turtle
<#doc> dct:references <https://example.org/> .
```

[This rule ensures semantic value even without explicit annotations.]{property="text"}

## RDF Markdown Attribute Syntax
{#attribute-syntax typeof="Article"}

[MD-LD uses Pandoc-style attribute blocks to add semantic annotations.]{property="abstract"}

### Subject Declaration
{#subject-decl typeof="HowToSection"}

[Headings can declare new subjects using the #id and typeof attributes.]{property="text"}

```markdown
## Alice Johnson
{#alice typeof="Person"}
```

Maps to:

```turtle
:alice a schema:Person .
```

### Literal Properties
{#literal-props typeof="HowToSection"}

[Inline spans with the property attribute create literal values.]{property="text"}

```markdown
[Alice Johnson]{property="name"}
```

Maps to:

```turtle
:alice schema:name "Alice Johnson" .
```

For typed literals, use the datatype attribute:

```markdown
[12]{property="gradeLevel" datatype="xsd:integer"}
```

### Object Properties
{#object-props typeof="HowToSection"}

[Links with the rel attribute create relationships between subjects.]{property="text"}

```markdown
[ACME Corp](#acme){rel="affiliation"}
```

Maps to:

```turtle
:alice schema:affiliation :acme .
```

### Lists as Repeated Properties
{#lists-repeated typeof="HowToSection"}

[List items with the same property attribute create multiple values for that property.]{property="text"}

```markdown
- [Blouse and Skirt]{property="dressCode"}
- [Blazer and Tie]{property="dressCode"}
```

[This maps to repeated RDF triples with the same predicate.]{property="text"}

### Nested Blocks as Blank Nodes
{#nested-blanks typeof="HowToSection"}

[Nested list structures create blank nodes with multiple properties.]{property="text"}

```markdown
- Uniform:
  - [Blazer]{property="top"}
  - [Skirt]{property="bottom"}
```

[This creates a blank node resource with both properties attached.]{property="text"}

## Tasks and Actions
{#tasks typeof="Article"}

[Markdown task lists are mapped to schema:Action instances.]{property="abstract"}

```markdown
- [x] Submit paper
- [ ] Revise abstract
```

Maps to:

```turtle
[] a schema:Action ;
   schema:name "Submit paper" ;
   schema:actionStatus schema:CompletedActionStatus .

[] a schema:Action ;
   schema:name "Revise abstract" ;
   schema:actionStatus schema:PotentialActionStatus .
```

Extend tasks semantically:

```markdown
---
'@context':
  '@vocab': 'http://schema.org/'
'@id': 'urn:md:tasks1'
---

# Tasks

- [x] Complete review {#review typeof="Event" }
- [ ] Submit paper {#submit}
```

Maps to:

```turtle
<urn:md:tasks1> <http://purl.org/dc/terms/title> "Tasks" .
<urn:md:tasks1#review> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Event> .
<urn:md:tasks1#review> <http://schema.org/name> "Complete review" .
<urn:md:tasks1#review> <http://schema.org/actionStatus> <http://schema.org/CompletedActionStatus> .
<urn:md:tasks1> <http://schema.org/potentialAction> <urn:md:tasks1#review> .
<urn:md:tasks1#submit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Action> .
<urn:md:tasks1#submit> <http://schema.org/name> "Submit paper" .
<urn:md:tasks1#submit> <http://schema.org/actionStatus> <http://schema.org/PotentialActionStatus> .
<urn:md:tasks1> <http://schema.org/potentialAction> <urn:md:tasks1#submit> .
```


[If the task appears under a subject section, it is linked via schema:potentialAction.]{property="text"}

## Images and Media
{#media typeof="HowToSection"}

[Image syntax creates image relationships.]{property="text"}

```markdown
![Experiment setup](setup.png)
```

Maps to:

```turtle
<#doc> schema:image <setup.png> .
```

With attributes:

```markdown
![Microscope](scope.png){#img1 typeof="ImageObject"}
```

[This creates a typed ImageObject subject.]{property="text"}

## Cross-Referencing
{#cross-ref typeof="Article"}

[Subjects may be defined in YAML-LD and referenced in Markdown, or vice versa.]{property="abstract"}

Example with YAML-LD collection:

```yaml
itemListElement:
  - '@id': '#alice'
  - '@id': '#bob'
```

[The Markdown body then defines the #alice and #bob subjects with full details.]{property="text"}

## Attribute Reference
{#attr-reference typeof="DefinedTermSet"}

### id attribute
{#attr-id typeof="DefinedTerm"}

- [Subject IRI fragment identifier]{property="name"}
- [Creates or references a subject with the given fragment identifier]{property="description"}

### typeof attribute
{#attr-typeof typeof="DefinedTerm"}

- [RDF type declaration]{property="name"}
- [Specifies the rdf:type of a subject]{property="description"}

### property attribute
{#attr-property typeof="DefinedTerm"}

- [Literal predicate]{property="name"}
- [Creates a literal-valued property on the current subject]{property="description"}

### rel attribute
{#attr-rel typeof="DefinedTerm"}

- [Object predicate]{property="name"}
- [Creates a relationship to another resource]{property="description"}

### resource attribute
{#attr-resource typeof="DefinedTerm"}

- [Object IRI]{property="name"}
- [Specifies the target IRI for a relationship]{property="description"}

### datatype attribute
{#attr-datatype typeof="DefinedTerm"}

- [Literal datatype]{property="name"}
- [Specifies the XSD datatype for a literal value]{property="description"}

### lang attribute
{#attr-lang typeof="DefinedTerm"}

- [Language tag]{property="name"}
- [Specifies the language of a literal value]{property="description"}

## Tutorial Example: Recipe with Nutrition
{#tutorial typeof="Article"}

[Here is a complete example showing how to model a recipe with ingredients and nutritional information.]{property="abstract"}

```markdown
## Pancake Recipe
{#recipe typeof="Recipe"}

- [Flour]{rel="recipeIngredient" resource="#flour"}
- [Milk]{rel="recipeIngredient" resource="#milk"}

### Flour
{#flour typeof="Food"}

- [76]{property="carbohydrateContent" datatype="xsd:float"}
- [10]{property="proteinContent" datatype="xsd:float"}

### Milk
{#milk typeof="Food"}

- [5]{property="carbohydrateContent" datatype="xsd:float"}
- [3.4]{property="proteinContent" datatype="xsd:float"}
```

[This creates approximately 15 triples forming a fully navigable graph.]{property="text"}

## Future Extensions
{#future typeof="ItemList"}

[The following features are planned for future versions but omitted from v0.1:]{property="description"}

- [Tables for tabular data representation]{property="itemListElement"}
- [CSVW code blocks for CSV data integration]{property="itemListElement"}

## Non-Goals
{#non-goals typeof="ItemList"}

[MD-LD intentionally does not attempt to:]{property="description"}

- [Replace Turtle or other RDF serializations]{property="itemListElement"}
- [Encode OWL axioms or ontology definitions]{property="itemListElement"}
- [Express inference rules]{property="itemListElement"}
- [Model named graphs inline]{property="itemListElement"}
- [Validate constraints or perform SHACL validation]{property="itemListElement"}

[Those capabilities belong to downstream processing layers.]{property="disambiguatingDescription"}

## Summary
{#summary typeof="Article"}

MD-LD is:

- [Markdown first – readable as plain text]{property="about"}
- [RDF grounded – produces valid RDF graphs]{property="about"}
- [HTML/RDFa compatible – projects cleanly to web standards]{property="about"}
- [LLM friendly – easy for AI agents to parse and generate]{property="about"}
- [Deterministic – same input always produces same output]{property="about"}

MD-LD is not:

- [A new RDF serialization format]{property="mentions"}
- [A database query language]{property="mentions"}
- [A reasoning or inference system]{property="mentions"}

[MD-LD turns Markdown into a semantic authoring medium, while keeping the Web as the universal runtime.]{property="abstract"}
