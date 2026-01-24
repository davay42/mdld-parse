[mdld] <https://mdld.js.org/>
[wd] <https://www.wikidata.org/wiki/>
[w3c] <https://www.w3.org/TR/>
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

# MDLD Dogfood Specification {=mdld:dogfood .mdld:Document label}

It is a self-describing **MDLD Document** {=mdld:Document .Class label} - a semantically annotated _Text_ {+mdld:Text .Class ?subClassOf label}.

This _document_ {=mdld:dogfood} is a dogfood example of the **MDLD specification** {=mdld:spec ?about .mdld:Document label}. It demonstrates how to use the *MDLD syntax* {=mdld:syntax ?hasPart .programmingLanguage label} to annotate __Markdown__ {+wd:Q18019138 ?derivedFrom .programmingLanguage label} documents with _semantic information_ {describes}. 

**MD-LD Parser** {=mdld:parser .Program label} emits *RDF* {=w3c:rdf11-concepts .Framework label} from explicit `{...}` {=mdld:annotation label} annotations.

## Rules {=mdld:rules .Rules label}

MD-LD follows strict rules to make it predictable and reliable: {?hasPart .Rule label}

1. No guessing {=#no-guessing}
2. Valid CommonMark {=#valid-commonmark}
3. No blank nodes {=#no-blank-nodes}
4. Each facts comes from a `{...}` {=#explicit-rdf}
5. Single-pass processing {=#streaming}

## The Building Blocks {=mdld:Block .Class comment}

MD-LD uses two types of things: 

1. **IRI** {+#iri .mdld:Block label} - Unique identifiers for entities (like web addresses)
   - `http://schema.org/Person` - the concept of "Person"
   - `https://www.wikidata.org/wiki/Q2005` - JavaScript language
   - `urn:isbn:0060831014` - A book global identifier

2. **Literal** {+#literal .mdld:Block label} - Actual data values (text, numbers, dates)
   - "Apollo 11" (text)
   - 1969 (number)
   - "1969"^^xsd:gYear (typed date)
   - "Hola"@es (with language)

## Graph model {=mdld:model .Class label}

MDLD is built on **RDF** {+mdld:rdf ?subClassOf label} - _the Resource Definition Framework_ {+mdld:rdf comment}. It's a W3C international standards way to operate on knowledge.

MD-LD creates RDF knowledge graphs from your Markdown documents. {?hasPart .Concept label}

- Subject {=#subject}
- Predicate {=#predicate}
- Object {=#object}

**IRIs** {=mdld:blocks#iri} can be *subjects* {+mdld:rdf-subject ?canBe} or *objects* {+mdld:rdf-subject ?canBe} - they can point to things or be pointed at

**Literals** {=mdld:blocks#literal} are always *objects* {+mdld:rdf-object ?canBe} - they can only be pointed at (never subjects)

Every fact connects exactly two things through a **Predicate** {=mdld:rdf-predicate .Class label}

### Subject {=mdld:rdf-subject}

What we're talking about:

- This is the entity we're describing
- Set by `=IRI` or `=#fragment` 
- Is used as current until next subject declaration or subject reset `{=}` marker

## Predicate {=mdld:rdf-predicate}

What is the property of the subject we are describing:

- set by a `{property}` annotation
- defines a relation between the subject and the object