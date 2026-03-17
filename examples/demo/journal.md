[my] <tag:me@example.com,2026:>
[j] <my:day-2024-07-18:>

## 2024-07-18 — A good day {=my:day-2024-07-18 .prov:Activity label}

> This was a productive and enjoyable day with meaningful activities. {comment}

[2024-07-18T00:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
[2024-07-18T11:59:59Z] {prov:endedAtTime ^^xsd:dateTime}

Mood: [Happy] {my:mood}
Energy level: [8] {my:energyLevel ^^xsd:integer}
Weather: [Sunny] {my:weather}

### Location

Place: [Central Park] {+my:central-park ?prov:atLocation .prov:Location label @en}

### Reflections

I felt [peaceful] {my:emotionalState} and the park was [beautiful] {my:description}.

## People

[Met Sam at the park] {=j:met-sam ?prov:qualifiedAssociation label .prov:Association} - talked with [Sam] {+my:sam ?prov:agent} [briefly] {+my:role:talking .prov:Role ?prov:hadRole}.

### Activities

I was **Walking** {=j:walking  .prov:Activity label} [today] {+my:day-2024-07-18 ?prov:wasInformedBy} for [45] {my:duration ^^xsd:integer} minutes - covered distance of [2.5] {my:distance ^^xsd:decimal} miles

Also had some **Reading** {=j:reading .prov:Activity label} [today] {+my:day-2024-07-18 ?prov:wasInformedBy} - used my copy of [Dune] {=my:dune-book ?prov:used .prov:Entity label} - I'm at page [42] {my:currentPage ^^xsd:integer} out of [412] {my:pages ^^xsd:integer} pages, <https://openlibrary.org/works/OL27448W> {?seeAlso}.


### Food

Had a **Morning coffee** {=j:coffee .prov:Activity label} [today] {+my:day-2024-07-18 ?prov:wasInformedBy}. at [2024-07-18T08:30:00Z] {prov:startedAtTime ^^xsd:dateTime} at [Home] {+my:home ?prov:atLocation .prov:Location label} 

**Evening dinner** {=j:dinner .prov:Activity my:label} [today] {+my:day-2024-07-18 ?prov:wasInformedBy}. at  [CP Cafe] {=my:cafe ?prov:atLocation .prov:Location label}. Mostly [Italian] {my:cuisine} food. [Link](https://example.com/central-park-cafe) {?seeAlso}.

