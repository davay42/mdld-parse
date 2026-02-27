# MDLD few-shot format induction 

## Grammar
```
Prefixes:
[my] <tag:myemail@example.com,2026:>
[folded] <my:folded:>

Subjects:
=IRI        # Full IRI, persists
=#fragment  # Relative to current subject
+iri        # Temporary object for local  ?/! predicates
+#fragment  # Temporary soft fragment

Types:
.Class      # S rdf:type schema:Class

Predicates:
p           # Literal property
?p          # Object property
!p          # Reverse property
    
Inline value carriers:
[value]        # Literal span
**value**      # Bold span
*value*        # Italic span
`value`        # Code span
[value](url)   # Link
![value](url)  # Image

Block value carriers:
```value```    # Code block
> value        # Quote
# value        # Heading
- value        # List item

Types:
^^datatypeIRI  # Typed data
@lang          # Language tag
```

## Examples

### Example 1

```plaintext
Today was a good day. I was happy and the weather was sunny. I went to walk and read in Central Park. It felt peaceful and the park was beautiful. I met Sam there. I had my coffee in the morning, so I went straight to dinner.
```

```ttl
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix prov: <http://www.w3.org/ns/prov#>.
@prefix ex: <http://example.org/>.
@prefix my: <tag:alice@example.com,2026:>.
@prefix j: <tag:alice@example.com,2026:journal:>.

j:2024-07-18 a j:Record;
    j:date "2026-02-27"^^xsd:date;
    rdfs:label "A nice day in the park";
    j:mood "happy";
    j:energyLevel 8^^xsd:integer;
    my:location my:central-park;
    my:weather "Sunny";
    j:emotionalState "peaceful";
    j:comment "beautiful";
    j:met my:sam;
    j:did <tag:alice@example.com,2026:journal:2024-07-18#walking>, <tag:alice@example.com,2026:journal:2024-07-18#reading>.
my:central-park a my:Place;
    rdfs:label "Central Park"@en.
my:sam a my:Person.
<tag:alice@example.com,2026:journal:2024-07-18#walking> a j:Activity;
    rdfs:label "Walking".
<tag:alice@example.com,2026:journal:2024-07-18#reading> a j:Activity;
    rdfs:label "Reading".
my:coffee-2024-07-18 a my:Event;
    my:relatedEvent j:2024-07-18.
my:dinner-2024-07-18 a my:Event;
    my:relatedEvent j:2024-07-18.
```


```mdld
[my] <tag:alice@example.com,2026:>
[j] <my:journal:>

# 2026-02-27 {=j:2024-07-18 .j:Record j:date ^^xsd:date}

## A nice day in the park {label}

With a [happy] {j:mood} mood and quite high energy [8] {j:energyLevel ^^xsd:integer} I went to the [Central Park] {+my:central-park ?my:location .my:Place label @en}. The weather was [Sunny] {my:weather}. I felt [peaceful] {j:emotionalState} and the park was [beautiful] {j:comment}.

In the park I met [Sam] {+my:sam .my:Person ?j:met}.

Activities: {?j:did .j:Activity label}

- Walking {=#walking}
- Reading {=#reading}

Related events: {!my:relatedEvent  .my:Event}
- Morning coffee {=my:coffee-2024-07-18}
- Evening dinner {=my:dinner-2024-07-18}
```

### Example 2

```plaintext
A product validation SHACL shape defining mandatory name and positive price.
```

```ttl
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix prov: <http://www.w3.org/ns/prov#>.
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

The **Product Validation Shape** {=ex:ProductValidationShape .sh:NodeShape ?cat:hasShape label} targets all [Products] {+ex:Product ?sh:targetClass} to validate core product requirements.

**Product Name Rule** {=ex:#productName .sh:PropertyShape ?sh:property} requires the [label] {+label ?sh:path} property to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value: **Product must have exactly one label** {sh:message}

[The shape] {=ex:ProductValidationShape} also has **Product Price Rule** {=ex:#productPrice .sh:PropertyShape ?sh:property} that requires the [price] {+ex:price ?sh:path} property to be at least [0.01] {sh:minInclusive ^^xsd:decimal}: **Product price must be positive** {sh:message}
```

### Example 3

```plaintext
A lab observation recording a firmware update performed by Dr. Lena Ortiz.
```

```ttl                 
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix prov: <http://www.w3.org/ns/prov#>.
@prefix ex: <http://example.org/>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix my: <tag:my@notes,2026:>.

my:obsLab1 a rdf:Statement, prov:Entity;
    rdf:subject my:calibBot;
    rdf:predicate my:performedUpdate;
    rdf:object my:spectrometerFW;
    prov:wasGeneratedBy my:actLab1.
my:actLab1 a prov:Activity;
    prov:wasAssociatedWith my:lenaOrtiz;
    prov:endedAtTime "2026-02-18T06:42:00Z"^^xsd:dateTime;
    my:confidence 0.97.
my:lenaOrtiz a prov:Agent.

```

```mdld
[foaf] <http://xmlns.com/foaf/0.1/>
[my] <tag:my@notes,2026:>

# Morning lab note {=my:obsLab1 .rdf:Statement .prov:Entity}

While reviewing the overnight logs, I confirmed that [the calibration bot] {+my:calibBot ?rdf:subject} successfully [updated] {+my:performedUpdate ?rdf:predicate} the [spectrometer firmware] {+my:spectrometerFW ?rdf:object}.  
The change looked routine, but I still recorded the provenance carefully.

## Verification activity {=my:actLab1 .prov:Activity ?prov:wasGeneratedBy}

The check was performed by [Dr. Lena Ortiz] {+my:lenaOrtiz .prov:Agent ?prov:wasAssociatedWith} during the early shift, finishing at [2026-02-18T06:42:00Z] {prov:endedAtTime ^^xsd:dateTime}.  
Given the clean checksum match, I assign a confidence of [0.97] {my:confidence ^^xsd:decimal} to this observation.
```