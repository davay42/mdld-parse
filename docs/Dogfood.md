[mdld] <https://mdld.js.org/>
[wd] <https://www.wikidata.org/wiki/>
[w3c] <https://www.w3.org/TR/>

# MDLD Dogfood Specification {=mdld:dogfood .Document name}

This document is a dogfood example for the **MDLD specification** {=mdld:spec ?about .Document name}. It demonstrates how to use the *MDLD syntax* {=mdld:syntax ?hasPart .programmingLanguage name} to annotate __Markdown__ {+wd:Q18019138 ?derivedFrom .programmingLanguage name} documents with _semantic information_ {describes}. 

**MD-LD Parser** {=mdld:parser .Program name} emits *RDF* {=w3c:rdf11-concepts .Framework name} from explicit `{...}` {=mdld:annotation name} annotations.

## Rules {=mdld:rules .Rules name}

MD-LD follows stric rules to make it predictable and reliable: {?hasPart .Rule name}

1. No guessing {=#no-guessing}
2. Valid CommonMark {=#valid-commonmark}
3. No blank nodes {=#no-blank-nodes}
4. Each facts comes from a `{...}` {=#explicit-rdf}
5. Single-pass processing {=#streaming}

## The Building Blocks {=mdld:blocks}

MD-LD uses two types of things: 

1. **IRI** {+#iri .Value name} - Unique identifiers for entities (like web addresses)
   - `http://schema.org/Person` - the concept of "Person"
   - `https://www.wikidata.org/entity/Q43653` - Apollo 11 mission
   - `urn:isbn:0060831014` - A book global identifier

2. **Literal** {+#literal .Value name} - Actual data values (text, numbers, dates)
   - "Apollo 11" (text)
   - 1969 (number)
   - "1969"^^xsd:gYear (typed date)
   - "Hola"@es (with language)

## Graph model {=mdld:model .Model name}

MD-LD creates knowledge graphs from your Markdown documents. {?hasPart .Concept name}

- Subject {=mdld:rdf-subject}
- Predicate {=mdld:rdf-predicate}
- Object {=mdld:rdf-object}

**IRIs** {=mdld:blocks#iri} can be *subjects* {+mdld:rdf-subject ?canBe} or *objects* {+mdld:rdf-subject ?canBe} - they can point to things or be pointed at

**Literals** {=mdld:blocks#literal} are always *objects* {+mdld:rdf-object ?canBe} - they can only be pointed at (never subjects)

Every fact connects exactly two things through a **predicate** {=mdld:rdf-predicate .Concept name}

### Subject {=mdld:rdf-subject}

What we're talking about:

- This is the entity we're describing
- Set by `=IRI` or `=#fragment` 
- Temporarily set by `+IRI` and `+#fragment`
- Stays current until you change it