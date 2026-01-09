

[mdld]{: http://mdld.js.org/#/}
[@vocab]{: http://schema.org/}
[@base]{: http://mdld.js.org/#/}

# MD-LD Specification v.0.2 {=mdld:spec .Article}

## Design Principles

1. Make an easy and accessible Semantic Markdown RDF authoring system
2. Minimal annotations, maximum expressiveness
3. Keep aligned with W3C standards and other relevant specifications and tech philosophies
4. Semantic notes are always contained in curly braces, easy to exclude for plain content views
5. Semantic notes are additive and is naturally combined with Markdown
6. Each note has one root subject that also defines the baseIRI for the note
7. Optimize for single-pass streaming parsing

## Syntax

### Headings define subjects

If no annotations are set - we just slugify the heading text and use is as the implied subject IRI via `urn:mdld:*` customizable pattern.

### Subject Markers

You can specify a subject IRI explicitly using subject marker annotations. If specified on a heading - it will define subject IRI until next heading. If specified inline in a text - it will define subject IRI for following expressions until the end of paragraph or next subject set.

`{=iri}` - used to mark subjects with IRIs

`{#id}` - used to mark subjects with relative IDs to the root subject

### Class Markers

Core relation is `rdf:type` - the `a` predicate of RDF. We use single dot `.` marker to define it. You can assign multiple classes.

`{.class}` - used to mark classes 

### Property Markers

`{property}` - used to mark properties

### Datatype Markers

`{^^datatype}` - used to mark datatypes

### Language Markers

`{@language}` - used to mark languages

### Bare URLs and links

Each link in the document generates a `dc:references` statement. Markdown links also produce an `rdfs:label` extracted from the link text.

```md
https://example.com
[Example](https://example.org)
```

### Semantic Links

A link can become semantic with addition of a curly braces extension.

```md
[Alice](https://example.org/Alice){name .Person}
[John](https://example.org/John){name .Person}
```

### Lists

A list can become semantic by adding a property annotation on the line before the list.

```md
Fruits: {ex:fruit}

- Apple
- Orange
- Banana
```

### Custom prefixes and vocabs

By default we imply RDFa core prefixes and Schema.org vocabulary. You can define your own prefixes and vocabs. As we use single-pass streaming approach these work only for following annotations, so it's better to define them at the document root.

```md
[@vocab]{: https://schema.org/}
[ex]{: http://example.com/}
[@base]{: http://example.com/}
```

