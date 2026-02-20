
[foaf] <http://xmlns.com/foaf/0.1/>
[my] <tag:my@notes,2026:>

# Observation {=my:obs1 .rdf:Statement .prov:Entity}

I noticed that [Alice] {+my:Alice ?rdf:subject} seems to [know] {+foaf:knows ?rdf:predicate} the [guy I met in the park] {+my:Bob ?rdf:object}

## Recording activity {=my:act1 .prov:Activity ?prov:wasGeneratedBy}

[My sister] {+my:Claire ?prov:wasAssociatedWith} told me that she once saw them talking it at [2026-01-01T12:00:00Z] {prov:endedAtTime ^^xsd:dateTime}. It was regular [lunch] {+my:lunch ?prov:used} talk and she's not 100% sure though. [0.8] {my:confidence ^^xsd:decimal}

==============

This looks about right! Let's explore possible improvements to bring more PROV power and allow for complex statements or statement compositions

===

7) Time semantics: follow PROV carefully

Common mistake zone.

For Activities

Use:

prov:startedAtTime

prov:endedAtTime

For Entities

Use:

prov:generatedAtTime

prov:invalidatedAtTime

Use prov:used for inputs (high-value but often missed)