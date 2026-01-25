[mdld] <https://mdld.js.org/>
[wd] <https://www.wikidata.org/wiki/>
[w3c] <https://www.w3.org/TR/>

# MD-LD Specification {=mdld:Spec .Class label}

A minimal, streaming-friendly language for embedding RDF semantics in Markdown.

> This document is written **in MD-LD itself** and serves as both
> a language specification and an executable semantic example. {=mdld:Spec comment}

---

## Core Concepts {=mdld:CoreConcepts .Class label}

The following concepts define the MD-LD processing model.

Concepts: {?mdld:hasConcept .Class label}

- Carrier {=mdld:Carrier}
- Annotation {=mdld:Annotation}
- Semantic Scope {=mdld:SemanticScope}
- Explicit Subject {=mdld:ExplicitSubject}
- Local Object {=mdld:LocalObject}

---

## Carriers {=mdld:CarrierSection label}

A **carrier** is a Markdown element that can emit RDF triples
when annotated.

Examples include paragraphs, headings, list items, blockquotes,
and code blocks.

> Carriers are the bridge between human-readable Markdown
> and machine-readable RDF semantics.
{=mdld:Carrier comment}

---

## Annotations {=mdld:AnnotationSection label}

Annotations are written in `{}` blocks and attach RDF meaning
to the preceding carrier.

Syntax example:

`{=mdld:example ?mdld:predicate .mdld:Type}` {=mdld:AnnotationExample .mdld:Example label}

Annotation components:
- **Subject declarations** (`=IRI`, `=#fragment`)
- **Object declarations** (`+IRI`, `+#fragment`) 
- **Type declarations** (`.Class`)
- **Predicates** (`p`, `?p`, `!p`)
- **Literal modifiers** (`^^datatype`, `@lang`)

---

## Lists {=mdld:ListSection label}

A list anchor defines semantics for all immediate list items.

List semantics do not recurse into nested lists.

List semantics: {?mdld:appliesTo .mdld:ListItem label}

- First item {=mdld:item1 }
- Second item {=mdld:item2}

Nested list example:

Variants: {?mdld:hasVariant .mdld:Variant label}
- Variant A {=mdld:variantA}
  Details: {?mdld:hasDetail .mdld:Detail label}
  - Detail 1 {=mdld:detail1}
  - Detail 2 {=mdld:detail2}

---

## Blockquotes {=mdld:BlockquoteSection label}

> Blockquotes may also act as carriers.
> They are often used for normative statements. {=mdld:NormativeStatement .mdld:Rule label}

---

## Code Blocks {=mdld:CodeSection label}

Code blocks do not emit semantics by default,
but may be annotated as semantic objects.

```ebnf {=mdld:EBNFGrammar .mdld:GrammarFragment label}
attrsBlock = "{" , attrsTokens , "}" ;
```

---

## Processing Model {=mdld:ProcessingModel label}

MD-LD processing is strictly streaming and deterministic.

Rules: {?mdld:hasRule .mdld:Rule label}

* An annotation applies to the nearest preceding carrier. {=#nearest-carrier}
* Semantic scope resets at nested list boundaries. {=#scoped-lists}
* No inference is performed at syntax level. {=#no-inference}
* Context declarations apply forward from declaration point. {=#forward-context}
* Subject resolution follows explicit declaration rules. {=#explicit-subject}

---

## Subject Resolution {=mdld:SubjectResolution label}

Subject declarations establish the current subject for subsequent annotations:

1. **Full IRI**: `{=ex:entity}` → sets current subject to expanded IRI
2. **Fragment**: `{=#fragment}` → creates `currentSubjectBase#fragment`
3. **Reset**: `{=}` → clears current subject
4. **Local Object**: `{+ex:related}` → temporary object for current annotation

---

## Predicate Forms {=mdld:PredicateForms label}

MD-LD supports three predicate forms for different relationship types:

Predicates: {?mdld:hasPredicate .mdld:Predicate label}

- **Literal predicate** (`p`) - Subject → Literal: `{name}`
- **Object predicate** (`?p`) - Subject → Object: `{?website}`
- **Reverse predicate** (`!p`) - Object → Subject: `{!hasPart}`

---

## Conformance {=mdld:Conformance label}

A conforming MD-LD processor MUST:

* Preserve round-trip stability
* Track origin positions for serialization
* Produce RDF/JS compatible quads
* Process documents in a single pass
* Recover gracefully from malformed annotations
* Maintain deterministic subject resolution

---

## Implementation Status {=mdld:Implementation label}

This specification is implemented by the `mdld-parse` JavaScript library:

Features: {?mdld:hasFeature .mdld:Feature label}

- **Parser** {=mdld:Parser .mdld:Implementation}
- **Serializer** {=mdld:Serializer .mdld:Implementation}
- **Origin Tracking** {=mdld:OriginTracking}
- **Streaming Support** {=mdld:Streaming}

---

## Expected RDF Output

Parsing this document produces the following RDF graph (129 quads):

```turtle
@prefix mdld: <https://mdld.js.org/>.
@prefix wd: <https://www.wikidata.org/wiki/>.
@prefix w3c: <https://www.w3.org/TR/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

mdld:Spec a rdfs:Class;
    rdfs:label "MD-LD Specification";
    rdfs:comment "a language specification and an executable semantic example.".

mdld:CoreConcepts a rdfs:Class;
    rdfs:label "Core Concepts".

mdld:Carrier a rdfs:Class.
mdld:CoreConcepts mdld:hasConcept mdld:Carrier.
mdld:Carrier a rdfs:Class;
    rdfs:label "Carrier".

mdld:Annotation a rdfs:Class.
mdld:CoreConcepts mdld:hasConcept mdld:Annotation.
mdld:Annotation a rdfs:Class;
    rdfs:label "Annotation".

mdld:SemanticScope a rdfs:Class.
mdld:CoreConcepts mdld:hasConcept mdld:SemanticScope.
mdld:SemanticScope a rdfs:Class;
    rdfs:label "Semantic Scope".

mdld:ExplicitSubject a rdfs:Class.
mdld:CoreConcepts mdld:hasConcept mdld:ExplicitSubject.
mdld:ExplicitSubject a rdfs:Class;
    rdfs:label "Explicit Subject".

mdld:LocalObject a rdfs:Class.
mdld:CoreConcepts mdld:hasConcept mdld:LocalObject.
mdld:LocalObject a rdfs:Class;
    rdfs:label "Local Object".

mdld:CarrierSection rdfs:label "Carriers".
mdld:Carrier rdfs:comment "".

mdld:AnnotationSection rdfs:label "Annotations".

mdld:AnnotationExample a mdld:Example;
    rdfs:label "{=mdld:example ?mdld:predicate .mdld:Type}".

mdld:ListSection rdfs:label "Lists".
mdld:item1 a mdld:ListItem.
mdld:ListSection mdld:appliesTo mdld:item1.
mdld:item1 rdfs:label "First item".

mdld:item2 a mdld:ListItem.
mdld:ListSection mdld:appliesTo mdld:item2.
mdld:item2 rdfs:label "Second item".

mdld:variantA a mdld:Variant.
mdld:ListSection mdld:hasVariant mdld:variantA.
mdld:variantA rdfs:label "Variant A".

mdld:detail1 a mdld:Detail.
mdld:variantA mdld:hasDetail mdld:detail1.
mdld:detail1 rdfs:label "Detail 1".

mdld:detail2 a mdld:Detail.
mdld:variantA mdld:hasDetail mdld:detail2.
mdld:detail2 rdfs:label "Detail 2".

mdld:BlockquoteSection rdfs:label "Blockquotes".
mdld:NormativeStatement a mdld:Rule;
    rdfs:label "They are often used for normative statements.".

mdld:CodeSection rdfs:label "Code Blocks".
mdld:EBNFGrammar a mdld:GrammarFragment;
    rdfs:label "attrsBlock = \"{\" , attrsTokens , \"}\" ;".

mdld:ProcessingModel rdfs:label "Processing Model".
mdld:ProcessingModel mdld:hasRule mdld:ProcessingModel#nearest-carrier.
mdld:ProcessingModel#nearest-carrier rdfs:label "An annotation applies to the nearest preceding carrier.".

mdld:ProcessingModel mdld:hasRule mdld:ProcessingModel#scoped-lists.
mdld:ProcessingModel#scoped-lists rdfs:label "Semantic scope resets at nested list boundaries.".

mdld:ProcessingModel mdld:hasRule mdld:ProcessingModel#no-inference.
mdld:ProcessingModel#no-inference rdfs:label "No inference is performed at syntax level.".

mdld:ProcessingModel mdld:hasRule mdld:ProcessingModel#forward-context.
mdld:ProcessingModel#forward-context rdfs:label "Context declarations apply forward from declaration point.".

mdld:ProcessingModel mdld:hasRule mdld:ProcessingModel#explicit-subject.
mdld:ProcessingModel#explicit-subject rdfs:label "Subject resolution follows explicit declaration rules.".

mdld:SubjectResolution rdfs:label "Subject Resolution".
mdld:ProcessingModel mdld:hasRule mdld:SubjectResolution#fragment.
mdld:SubjectResolution#fragment rdfs:label "**Full IRI**: `{=ex:entity}` → sets current subject to expanded IRI".

mdld:SubjectResolution#fragment a mdld:Rule.
mdld:ProcessingModel mdld:hasRule mdld:SubjectResolution#fragment.
mdld:SubjectResolution#fragment rdfs:label "**Fragment**: `{=#fragment}` → creates `currentSubjectBase#fragment`".

mdld:PredicateForms rdfs:label "Predicate Forms".
mdld:Conformance rdfs:label "Conformance".
mdld:Implementation rdfs:label "Implementation Status".

mdld:Parser a mdld:Feature.
mdld:Implementation mdld:hasFeature mdld:Parser.
mdld:Parser rdfs:label "**Parser**";
    a mdld:Implementation.

mdld:Serializer a mdld:Feature.
mdld:Implementation mdld:hasFeature mdld:Serializer.
mdld:Serializer rdfs:label "**Serializer**";
    a mdld:Implementation.

mdld:OriginTracking a mdld:Feature.
mdld:Implementation mdld:hasFeature mdld:OriginTracking.
mdld:OriginTracking rdfs:label "**Origin Tracking**".

mdld:Streaming a mdld:Feature.
mdld:Implementation mdld:hasFeature mdld:Streaming.
mdld:Streaming rdfs:label "**Streaming Support**".
```
