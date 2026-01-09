

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

## Syntax

### Subject Markers

`=iri` - used to mark subjects with IRIs

`#id` - used to mark subjects with relative IDs to the root subject

