
## TEST CASE 1 — Apollo Mission (project, team, dates, components)

### MDLD input


```md
[@vocab] {: http://schema.org/}
[wd] {: https://www.wikidata.org/entity/}
[ex] {: http://example.org/}

# Apollo 11 {=wd:Q43653 .SpaceMission}

Launch year: [1969] {startDate ^^xsd:gYear}
Landing date: [1969-07-20] {endDate ^^xsd:date}

Crew: {hasPart .Person}
- Neil Armstrong {=wd:Q1615}
- Buzz Aldrin {=wd:Q2252}
- Michael Collins {=wd:Q298}

Components: {hasPart .Vehicle}
- Command Module {=ex:command-module}
- Lunar Module {=ex:lunar-module}
```


### Expected Turtle

```turtle
@prefix schema: <http://schema.org/> .
@prefix wd: <https://www.wikidata.org/entity/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

wd:Q43653 a schema:SpaceMission ;
  schema:startDate "1969"^^xsd:gYear ;
  schema:endDate "1969-07-20"^^xsd:date ;
  schema:hasPart wd:Q1615 ,
                 wd:Q2252 ,
                 wd:Q298 ,
                 ex:command-module ,
                 ex:lunar-module .

wd:Q1615 a schema:Person .
wd:Q2252 a schema:Person .
wd:Q298 a schema:Person .

ex:command-module a schema:Vehicle .
ex:lunar-module a schema:Vehicle .
```

---

## TEST CASE 2 — Recipe with ingredients, quantities, datatypes, languages

### MDLD input


```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Pancake Recipe {=ex:recipe-pancake .Recipe}

Ingredients: {hasPart .Ingredient}

- Flour {=ex:flour name @en name "Mehl"@de}
  Amount: [200] {quantity ^^xsd:integer}
  Unit: [grams] {unitText}

- Milk {=ex:milk name @en name "Milch"@de}
  Amount: [300] {quantity ^^xsd:integer}
  Unit: [ml] {unitText}

- Egg {=ex:egg name @en name "Ei"@de}
  Amount: [2] {quantity ^^xsd:integer}
  Unit: [pieces] {unitText}

- Sugar {=ex:sugar name @en name "Zucker"@de}
  Amount: [30] {quantity ^^xsd:integer}
  Unit: [grams] {unitText}
```


### Expected Turtle

```turtle
@prefix schema: <http://schema.org/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:recipe-pancake a schema:Recipe ;
  schema:hasPart ex:flour ,
                 ex:milk ,
                 ex:egg ,
                 ex:sugar .

ex:flour a schema:Ingredient ;
  schema:name "Flour"@en ;
  schema:name "Mehl"@de ;
  schema:quantity "200"^^xsd:integer ;
  schema:unitText "grams" .

ex:milk a schema:Ingredient ;
  schema:name "Milk"@en ;
  schema:name "Milch"@de ;
  schema:quantity "300"^^xsd:integer ;
  schema:unitText "ml" .

ex:egg a schema:Ingredient ;
  schema:name "Egg"@en ;
  schema:name "Ei"@de ;
  schema:quantity "2"^^xsd:integer ;
  schema:unitText "pieces" .

ex:sugar a schema:Ingredient ;
  schema:name "Sugar"@en ;
  schema:name "Zucker"@de ;
  schema:quantity "30"^^xsd:integer ;
  schema:unitText "grams" .
```

---

## TEST CASE 3 — Free-form purchases with human context, SPARQL-ready

### MDLD input

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Grocery Shopping — Saturday {=ex:purchase-2025-01-10 .Purchase}

At the local market, I bought the following items:

Items: {hasPart .Product}

- Organic apples {=ex:apples}
  Price: [3.99] {price ^^xsd:decimal}
  Currency: [EUR] {priceCurrency}
  Quantity: [1.5] {weight ^^xsd:decimal}
  Unit: [kg] {unitText}

- Cheese (aged) {=ex:cheese}
  Price: [4.50] {price ^^xsd:decimal}
  Currency: [EUR] {priceCurrency}
  Quantity: [250] {weight ^^xsd:integer}
  Unit: [grams] {unitText}

- Coffee beans {=ex:coffee}
  Price: [12.90] {price ^^xsd:decimal}
  Currency: [EUR] {priceCurrency}
  Quantity: [1] {quantity ^^xsd:integer}
  Unit: [bag] {unitText}
```

### Expected Turtle

```turtle
@prefix schema: <http://schema.org/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:purchase-2025-01-10 a schema:Purchase ;
  schema:hasPart ex:apples ,
                 ex:cheese ,
                 ex:coffee .

ex:apples a schema:Product ;
  schema:price "3.99"^^xsd:decimal ;
  schema:priceCurrency "EUR" ;
  schema:weight "1.5"^^xsd:decimal ;
  schema:unitText "kg" .

ex:cheese a schema:Product ;
  schema:price "4.50"^^xsd:decimal ;
  schema:priceCurrency "EUR" ;
  schema:weight "250"^^xsd:integer ;
  schema:unitText "grams" .

ex:coffee a schema:Product ;
  schema:price "12.90"^^xsd:decimal ;
  schema:priceCurrency "EUR" ;
  schema:quantity "1"^^xsd:integer ;
  schema:unitText "bag" .
```

---

## TEST CASE 4 — SPARQL discovery queries (code blocks)

### MDLD input

[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## SPARQL Discovery Queries {=ex:sparql-discovery .Collection}

### List all subjects with labels

```sparql {=ex:q-subject-labels .SoftwareSourceCode schema:text schema:programmingLanguage "SPARQL"}
SELECT DISTINCT ?s ?label WHERE {
  ?s ?p ?o .
  OPTIONAL { ?s rdfs:label ?label }
}
```

### List all predicates used

```sparql {=ex:q-predicates .SoftwareSourceCode schema:text schema:programmingLanguage "SPARQL"}
SELECT DISTINCT ?p WHERE {
  ?s ?p ?o .
}
```

### List predicates with example objects

```sparql {=ex:q-predicate-objects .SoftwareSourceCode schema:text schema:programmingLanguage "SPARQL"}
SELECT DISTINCT ?p ?o WHERE {
  ?s ?p ?o .
}
LIMIT 50
```

### List all classes in use

```sparql {=ex:q-classes .SoftwareSourceCode schema:text schema:programmingLanguage "SPARQL"}
SELECT DISTINCT ?class WHERE {
  ?s a ?class .
}
```

---

### Expected Turtle

```turtle
@prefix schema: <http://schema.org/> .
@prefix ex: <http://example.org/> .

ex:sparql-discovery a schema:Collection .

ex:q-subject-labels a schema:SoftwareSourceCode ;
  schema:text """SELECT DISTINCT ?s ?label WHERE {
  ?s ?p ?o .
  OPTIONAL { ?s rdfs:label ?label }
}""" ;
  schema:programmingLanguage "SPARQL" .

ex:q-predicates a schema:SoftwareSourceCode ;
  schema:text """SELECT DISTINCT ?p WHERE {
  ?s ?p ?o .
}""" ;
  schema:programmingLanguage "SPARQL" .

ex:q-predicate-objects a schema:SoftwareSourceCode ;
  schema:text """SELECT DISTINCT ?p ?o WHERE {
  ?s ?p ?o .
}
LIMIT 50""" ;
  schema:programmingLanguage "SPARQL" .

ex:q-classes a schema:SoftwareSourceCode ;
  schema:text """SELECT DISTINCT ?class WHERE {
  ?s a ?class .
}""" ;
  schema:programmingLanguage "SPARQL" .
```

---


Below is a **self-contained MD-LD v0.2 example** that adds **SHACL shapes** to a **list of lab measurements**, written **entirely in MDLD syntax** (no inline Turtle), using the same principles as the rest of the spec:

* SHACL is authored as **normal RDF facts**
* Shapes are just **subjects with properties**
* Constraints are expressed via `{...}` blocks
* Code blocks are **not required**
* Fully streaming-friendly
* Demonstrates **full RDF expressiveness** without leaving MD-LD

---

## MDLD example — Lab measurements with SHACL shapes

### MDLD input

```md
[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[sh] {: http://www.w3.org/ns/shacl#}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Blood Test Report {=ex:report1 .MedicalTest}

Patient: [Alice] {=ex:alice .Person name}

Measurements: {hasPart .MedicalTest}

- Hemoglobin {=ex:hgb}
  Value: [13.5] {value ^^xsd:decimal}
  Unit: [g/dL] {unitText}

- White Blood Cells {=ex:wbc}
  Value: [6.2] {value ^^xsd:decimal}
  Unit: [10^9/L] {unitText}

---

## Validation Rules {=ex:lab-shapes .sh:NodeShape}

Target: [Lab Measurement] {sh:targetClass ex:LabMeasurement}

Property constraints: {sh:property}

- Hemoglobin value shape {=ex:hgb-value-shape}
  Path: [value] {sh:path}
  Datatype: [decimal] {sh:datatype xsd:decimal}
  Min: [12.0] {sh:minInclusive ^^xsd:decimal}
  Max: [18.0] {sh:maxInclusive ^^xsd:decimal}

- WBC value shape {=ex:wbc-value-shape}
  Path: [value] {sh:path}
  Datatype: [decimal] {sh:datatype xsd:decimal}
  Min: [4.0] {sh:minInclusive ^^xsd:decimal}
  Max: [11.0] {sh:maxInclusive ^^xsd:decimal}
```

---

## Resulting Turtle (expected parse output)

```turtle
@prefix schema: <http://schema.org/> .
@prefix ex: <http://example.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:report1 a schema:MedicalTest ;
  schema:hasPart ex:hgb , ex:wbc .

ex:alice a schema:Person ;
  schema:name "Alice" .

ex:hgb a schema:MedicalTest ;
  schema:value "13.5"^^xsd:decimal ;
  schema:unitText "g/dL" .

ex:wbc a schema:MedicalTest ;
  schema:value "6.2"^^xsd:decimal ;
  schema:unitText "10^9/L" .

ex:lab-shapes a sh:NodeShape ;
  sh:targetClass ex:LabMeasurement ;
  sh:property ex:hgb-value-shape ,
              ex:wbc-value-shape .

ex:hgb-value-shape
  sh:path schema:value ;
  sh:datatype xsd:decimal ;
  sh:minInclusive "12.0"^^xsd:decimal ;
  sh:maxInclusive "18.0"^^xsd:decimal .

ex:wbc-value-shape
  sh:path schema:value ;
  sh:datatype xsd:decimal ;
  sh:minInclusive "4.0"^^xsd:decimal ;
  sh:maxInclusive "11.0"^^xsd:decimal .
```
