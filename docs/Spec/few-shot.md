# MDLD Few-Shot Induction 

## MENTAL MODEL

Annotations generate RDF triples.
Text outside annotations is free form and is ignored by the graph.
Subject context persists until next {=...} declaration or explicit `{=}` reset marker

## STRICT GRAMMAR
```
Prefixes:
[my] <tag:myemail@example.com,2026:>
[folded] <my:folded:>

Subjects:
=IRI        # Full IRI, persists
=#fragment  # Relative to current subject, replaces current fragment

Predicates:
p           # Literal property
?p          # Object property
!p          # Reverse property

Objects:
+iri        # Object for local  ?/! predicates
+#fragment  # Soft fragment, replaces current fragment

Classes:
.Class      # S rdf:type schema:Class
    
Inline value carriers:
[value]        # Literal span
**value**      # Bold span
`value`        # Code span
[value](url)   # Link
![value](url)  # Image

Block value carriers:
```value```    # Code block
> value        # Quote
# value        # Headings
- value        # List item

Datatypes:
^^datatypeIRI  # Typed data
@lang          # Language tag
```

## RULES

- {=IRI} sets subject
- {+IRI} introduces object
- ?p forward object property
- !p inverse property
- literals come only from value carriers

## Invariants (strict)

- Every triple must come from an annotation
- Every literal must come from a value carrier
- {=} always sets the current subject
- {+IRI} creates a new node reference
- List headers apply only to immediate list items
- Do not invent predicates or prefixes
- No blank nodes - all nodes must be IRIs
- never use example.org prefix - prefer `tag:myemail@example.com,2026:` as per RFC 4151


## Default context

The following prefixes are assumed available: `rdf`, `rdfs`, `xsd`, `sh`, `prov`.

## Examples

### Example 0

```plaintext
Alice knows Bob.
```

```ttl              
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix my: <tag:alice@example.com,2026:>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

my:alice foaf:knows my:bob.
```

```mdld
[my] <tag:alice@example.com,2026:>
[foaf] <http://xmlns.com/foaf/0.1/>

[Alice] {=my:alice} knows [Bob] {+my:bob ?foaf:knows}.
```

### Example 1

```plaintext
Today was a good day. I was happy and the weather was sunny. I went to Central Park. It felt peaceful and the park was beautiful. I met Sam there. I had my coffee in the morning, so I went straight to dinner.
```

```ttl
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix my: <tag:alice@example.com,2026:>.
@prefix j: <tag:alice@example.com,2026:journal:>.

j:2026-02-27 a j:Record;
    j:date "2026-02-27"^^xsd:date;
    rdfs:label "A nice day in the park";
    j:mood "happy";
    j:energyLevel 8^^xsd:integer;
    my:location my:central-park;
    my:weather "Sunny";
    j:emotionalState "peaceful";
    j:comment "beautiful";
    j:met my:sam;
my:central-park a my:Place;
    rdfs:label "Central Park"@en.
my:sam a my:Person.
```

```mdld
[my] <tag:alice@example.com,2026:>
[j] <my:journal:>

# 2026-02-27 {=j:2026-02-27 .j:Record j:date ^^xsd:date}

## A nice day in the park {label}

With a [happy] {j:mood} mood and quite high energy [8] {j:energyLevel ^^xsd:integer} I went to the [Central Park] {+my:central-park ?my:location .my:Place label @en}. The weather was [Sunny] {my:weather}. I felt [peaceful] {j:emotionalState} and the park was [beautiful] {j:comment}.

In the park I met [Sam] {+my:sam .my:Person ?j:met}.
```

### Example 2

```plaintext
Project Alpha has 3 tasks - Design schema, Implement parser and Write documentation.
Design schema is done, Implement parser is done and Write documentation is in process - we need to add API reference.
```

```ttl
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.

@prefix ex: <http://example.org/>.

ex:ProjectAlpha a ex:Project;
    ex:hasTask <http://example.org/ProjectAlpha#task1>, <http://example.org/ProjectAlpha#task2>, <http://example.org/ProjectAlpha#task3>.
<http://example.org/ProjectAlpha#task1> a ex:Task;
    rdfs:label "Design schema";
    ex:status ex:done.
<http://example.org/ProjectAlpha#task2> a ex:Task;
    rdfs:label "Implement parser";
    ex:status ex:done.
<http://example.org/ProjectAlpha#task3> a ex:Task;
    rdfs:label "Write documentation";
    ex:subTask <http://example.org/ProjectAlpha#subtask3a>;
    ex:status ex:in-process.
<http://example.org/ProjectAlpha#subtask3a> a ex:Task;
    rdfs:label "API reference";
    ex:status ex:todo.

```


```mdld
[ex] <http://example.org/>

# Project Alpha {=ex:ProjectAlpha .ex:Project}

Project includes tasks: {?ex:hasTask .ex:Task label}

- Design schema {=#task1}
- Implement parser {=#task2}
- Write documentation {=#task3}
  with a subtask of {?ex:subTask .ex:Task label}
  - API reference {=#subtask3a}

# Tasks

**Design schema** {=#task1} is [ready] {?ex:status +ex:done}, **parser** {=#task2} is also [done] {?ex:status +ex:done}, but **documentation** {=#task3} is still [in process] {?ex:status +ex:in-process} - we are starting documenting the **API** {=#subtask3a} - it's still a [to do] {?ex:status +ex:todo}
```

### Example 3

```plaintext
A lab observation recording a firmware update and resulting system state performed by Dr. Lena Ortiz.
```

```ttl                                
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix prov: <http://www.w3.org/ns/prov#>.
@prefix lab: <tag:lab@example.com,2026:>.

lab:obsLab1 a rdf:Statement, prov:Entity;
    rdf:subject lab:calibBot;
    rdf:predicate lab:performedUpdate;
    rdf:object lab:spectrometerFW;
    lab:confidence 0.97;
    prov:wasGeneratedBy lab:actLab1.
lab:obsLab2 a rdf:Statement, prov:Entity;
    rdf:subject lab:spectrometerFW;
    rdf:predicate lab:hasStatus;
    rdf:object lab:stable;
    lab:confidence 0.90;
    prov:wasGeneratedBy lab:actLab1.
lab:actLab1 a prov:Activity;
    prov:wasAssociatedWith lab:lenaOrtiz;
    prov:endedAtTime "2026-02-18T06:42:00Z"^^xsd:dateTime.
lab:lenaOrtiz a prov:Agent.

```

```mdld
[lab] <tag:lab@example.com,2026:>

# Lab journal

## System update {=lab:obsLab1 .rdf:Statement .prov:Entity}

While reviewing the overnight logs, I confirmed that [the calibration bot] {+lab:calibBot ?rdf:subject} successfully [updated] {+lab:performedUpdate ?rdf:predicate} the [spectrometer firmware] {+lab:spectrometerFW ?rdf:object}.  
The change looked routine, but I still recorded the provenance carefully.  I assign a confidence of [0.97] {lab:confidence ^^xsd:decimal} to this observation.

## System status {=lab:obsLab2 .rdf:Statement .prov:Entity}

I also noted that the [spectrometer firmware] {+lab:spectrometerFW ?rdf:subject} remained in [stable condition] {+lab:stable ?rdf:object} according to the [reported status] {+lab:hasStatus ?rdf:predicate}.  I assign a confidence of [0.90] {lab:confidence ^^xsd:decimal} to this observation.


## Verification activity {=lab:actLab1 .prov:Activity}

Has 2 observations stated: {!prov:wasGeneratedBy}
- [System update] {=lab:obsLab1}
- [System status] {=lab:obsLab2}

The check was performed by [Dr. Lena Ortiz] {+lab:lenaOrtiz .prov:Agent ?prov:wasAssociatedWith} during the early shift, finishing at [2026-02-18T06:42:00Z] {prov:endedAtTime ^^xsd:dateTime}.  
```


### Example 4

```plaintext
A product validation SHACL shape defining mandatory name and positive price.
```

```ttl
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix ex: <http://example.org/>.

ex:ProductValidationShape a sh:NodeShape;
    rdfs:label "Product Validation Shape";
    sh:targetClass ex:Product;
    sh:property <http://example.org/#productName>, <http://example.org/#productPrice>.
<http://example.org/#productName> a sh:PropertyShape;
    sh:path rdfs:label;
    sh:minCount 1^^xsd:integer;
    sh:maxCount 1^^xsd:integer;
    sh:message "Product must have exactly one label".
<http://example.org/#productPrice> a sh:PropertyShape;
    sh:path ex:price;
    sh:message "Product price must be positive";
    sh:minInclusive 0.01^^xsd:decimal.
```

```mdld
[ex] <http://example.org/>

The **Product Validation Shape** {=ex:ProductValidationShape .sh:NodeShape label} targets all [Products] {+ex:Product ?sh:targetClass} to validate core product requirements.

**Product Name Rule** {=ex:#productName .sh:PropertyShape ?sh:property} requires the [label] {+label ?sh:path} property to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

> Product must have exactly one label {sh:message}

[The shape] {=ex:ProductValidationShape} also has **Product Price Rule** {=ex:#productPrice .sh:PropertyShape ?sh:property} that requires the [price] {+ex:price ?sh:path} property to be at least [0.01] {sh:minInclusive ^^xsd:decimal}

> Product price must be positive {sh:message}
```

## ❌ Invalid patterns

INVALID:
`{ex:energy "8"^^xsd:integer}`

VALID:
`[8] {ex:energy ^^xsd:integer}`

## Pattern Summary:

Literal:
[value] {predicate}

Object:
[value] {+IRI ?predicate}

Statement:
{=stmt .rdf:Statement}
[A] {+S ?rdf:subject} [B] {+P ?rdf:predicate} [C] {+O ?rdf:object}

Activity:
{=act .prov:Activity}
[Agent] {+A .prov:Agent ?prov:wasAssociatedWith}
[time] {prov:endedAtTime ^^xsd:dateTime}