[j] <tag:alice@example.com,2026:journal/>

# Personal Journal {=tag:alice@example.com,2026:journal .j:Journal label}

Includes records: [06 May 2026] {+j:2026/05/06 ?member}

### 06 May 2026 {=j:2026/05/06 .j:DayEntry label}

Good day. Up at [2026-05-06T08:00:00+04:00] {prov:startedAtTime ^^xsd:dateTime}, lights out [2026-05-06T23:30:00+04:00] {prov:endedAtTime ^^xsd:dateTime}. This is [week 2] {+j:2026/05/week-2 ?prov:hadMember}. By end of day I had a [daily wrap-up] {+j:2026/05/06/summary .j:Record ?prov:generated label} written.

Morning led into afternoon which led into [evening out] {+#morning ?prov:wasInformedBy} → [#afternoon] {+#afternoon ?prov:wasInformedBy} → [#social] {+#social ?prov:wasInformedBy}.

#### Morning {=#morning .j:Session label}

Started slow, which was the point. [Run first] {+#walk ?prov:wasInformedBy}, then [coffee] {+#coffee-prep ?prov:wasInformedBy}.

##### Morning Run {=#walk .j:Session label}

[45] {j:durationMin ^^xsd:integer} minutes, [2.5] {j:distanceMiles ^^xsd:decimal} miles around [Central Park] {+j:place/central-park .j:Place ?prov:atLocation label}. Wore my [running shoes] {+j:shoes/running .j:Record ?prov:used label} — watch logged [heart rate data] {+j:2026/05/06/hr-data .j:Record ?prov:generated label} the whole time.

##### Coffee {=#coffee-prep .j:Session label}

Back [home] {+j:place/home .j:Place ?prov:atLocation label}. Ground the [beans] {+j:coffee/beans .j:Record ?prov:used label}, boiled [water] {+j:coffee/water .j:Record ?prov:used label}, got a proper [cup] {+#morning-coffee .j:Record ?prov:generated label}.

#### Afternoon {=#afternoon .j:Session ?prov:wasInformedBy label}

Split between reading and grinding through docs.

##### Reading {=#reading .j:Session ?prov:wasInformedBy label}

[2] {j:durationHours ^^xsd:integer} hours with [Dune] {+j:dune-book .j:Book .j:Record ?prov:used label} — got through [42] {j:pages ^^xsd:integer} pages. Wrote up [some notes] {+j:reading-notes .j:Record ?prov:generated label} while it was fresh.

##### Work {=#work .j:Session ?prov:wasInformedBy label}

[3] {j:durationHours ^^xsd:integer} hours on [API docs] {+j:api-docs .j:Record ?prov:used label}. Pushed [a round of updates] {+j:doc-updates .j:Record ?prov:generated label}.

#### Evening — coffee with Sam {=#social .j:Session ?prov:wasInformedBy label}

Met [Sam] {+j:sam .j:Contact ?prov:wasAssociatedWith label} at [our usual spot] {+j:place/cafe .j:Place ?prov:atLocation label}. [30] {j:durationMin ^^xsd:integer} minutes turned into a real conversation about [the book] {+j:dune-book ?j:topic}.

### Journaling - short session about 60 LOC {=#journaling .j:Session ?prov:wasInformedBy label}

### Wrap-up {=#summary .j:Record ?prov:wasGeneratedBy label}

Mood: [happy] {j:mood}. Energy [8] {j:energy ^^xsd:integer}/10, stress [2] {j:stress ^^xsd:integer}/10 — good ratio. Was out at [Central Park] {+j:place/central-park ?j:visited}, [home] {+j:place/home ?j:visited}, and [the café] {+j:place/cafe ?j:visited}.

======

## Vocabulary

[j:Journal] {=j:Journal .Class label} is `the whole notebook` {comment} — a [period] {+prov:Collection ?subClassOf} of writing.
[j:Period] {=j:Period .Class label} is `a span of journal structure — year, month, week` {comment} — also a [period] {+prov:Collection ?subClassOf}.
[j:DayEntry] {=j:DayEntry .Class label} is `one dated day` {comment} — a [journal activity] {+prov:Activity ?subClassOf}.
[j:Session] {=j:Session .Class label} is `a session inside a day — morning, reading, work` {comment} — also a [journal activity] {+prov:Activity ?subClassOf}.
[j:Record] {=j:Record .Class label} is `anything the journal generated or used — notes, data, updates` {comment} — a [journal entry] {+prov:Entity ?subClassOf}.
[j:Book] {=j:Book .Class label} is `a book the journal references` {comment} — a kind of [record] {+j:Record ?subClassOf}.
[j:Contact] {=j:Contact .Class label} is `a person in the journal` {comment} — a [person] {+prov:Person ?subClassOf}.
[j:Place] {=j:Place .Class label} is `a location the journal visits` {comment} — a [location] {+prov:Location ?subClassOf}.

Journal properties — typed and labeled like everything else:

[duration-minutes] {=j:durationMin .rdf:Property label} is `exercise time in minutes` {comment}.
[duration-hours] {=j:durationHours .rdf:Property label} is `reading or work time in hours` {comment}.
[distance] {=j:distanceMiles .rdf:Property label} is `route length in miles` {comment}.
[pages] {=j:pages .rdf:Property label} is `pages read` {comment}.
[mood] {=j:mood .rdf:Property label} is `the day's mood` {comment}.
[energy] {=j:energy .rdf:Property label} is `energy out of ten` {comment}.
[stress] {=j:stress .rdf:Property label} is `stress out of ten` {comment}.
[visited] {=j:visited .rdf:Property label} is `places the day visited` {comment}.
[topic] {=j:topic .rdf:Property label} is `what a conversation was about` {comment}.

Everything I write ends up here. Started keeping this in [2026] {+j:2026 ?prov:hadMember label}.

======

## Shapes

`prov:*` stays the ontology layer; `j:*` classes carry the data. Shapes target the **prototype** — `prov:Entity` catches every `j:Record`, `prov:Activity` catches `j:DayEntry` + `j:Session` — so common rules like mandatory labeling apply everywhere for free.

# Journal Activity Shape {=j:ActivityShape .sh:NodeShape label}

Every [activity] {+prov:Activity ?sh:targetClass} — days and sessions alike — has a **label** {+#activityLabel ?sh:property sh:name}, and may carry **start** {+#activityStart ?sh:property sh:name}, **end** {+#activityEnd ?sh:property sh:name}, **minutes** {+#activityMinutes ?sh:property sh:name}, or **hours** {+#activityHours ?sh:property sh:name}, plus **distance** {+#activityDistance ?sh:property sh:name} and **pages** {+#activityPages ?sh:property sh:name} when the session measured them.

`Activity label is required — {$focusNode} missing {$path}` {=#activityLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Activity start — {$focusNode}` {=#activityStart .sh:PropertyShape sh:name} reads our [started-at] {+prov:startedAtTime ?sh:path}.

`Activity end — {$focusNode}` {=#activityEnd .sh:PropertyShape sh:name} reads our [ended-at] {+prov:endedAtTime ?sh:path}.

`Activity minutes — {$focusNode}` {=#activityMinutes .sh:PropertyShape sh:name} reads our [duration-minutes] {+j:durationMin ?sh:path}.

`Activity hours — {$focusNode}` {=#activityHours .sh:PropertyShape sh:name} reads our [duration-hours] {+j:durationHours ?sh:path}.

`Activity distance — {$focusNode}` {=#activityDistance .sh:PropertyShape sh:name} reads our [distance] {+j:distanceMiles ?sh:path} in miles.

`Activity pages — {$focusNode}` {=#activityPages .sh:PropertyShape sh:name} reads our [pages] {+j:pages ?sh:path} count.

# Journal Entry Shape {=j:EntryShape .sh:NodeShape label}

Every [entry] {+prov:Entity ?sh:targetClass} — records, books, the wrap-up — has a **label** {+#entryLabel ?sh:property sh:name}.

`Entry label is required — {$focusNode} missing {$path}` {=#entryLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

# Journal Person Shape {=j:PersonShape .sh:NodeShape label}

Every [person] {+prov:Person ?sh:targetClass} has a **label** {+#personLabel ?sh:property sh:name}.

`Person label is required — {$focusNode} missing {$path}` {=#personLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

# Journal Location Shape {=j:LocationShape .sh:NodeShape label}

Every [location] {+prov:Location ?sh:targetClass} has a **label** {+#locationLabel ?sh:property sh:name}.

`Location label is required — {$focusNode} missing {$path}` {=#locationLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

# Journal Day Shape {=j:DayShape .sh:NodeShape label}

[The day] {+j:2026/05/06 ?sh:targetNode} itself carries its **label** {+#dayLabel ?sh:property sh:name}, **start** {+#dayStart ?sh:property sh:name}, and **end** {+#dayEnd ?sh:property sh:name}.

`Day label is required — {$focusNode} missing {$path}` {=#dayLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Day start is required — {$focusNode} missing {$path}` {=#dayStart .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [start] {+prov:startedAtTime ?sh:path}.

`Day end is required — {$focusNode} missing {$path}` {=#dayEnd .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [end] {+prov:endedAtTime ?sh:path}.

# Journal Stats Shape {=j:StatsShape .sh:NodeShape label}

[The wrap-up] {+j:2026/05/06#summary ?sh:targetNode} carries **mood** {+#statsMood ?sh:property sh:name}, **energy** {+#statsEnergy ?sh:property sh:name}, and **stress** {+#statsStress ?sh:property sh:name}.

`Stats mood — {$focusNode}` {=#statsMood .sh:PropertyShape sh:name} reads our [mood] {+j:mood ?sh:path}.

`Stats energy — {$focusNode}` {=#statsEnergy .sh:PropertyShape sh:name} reads our [energy] {+j:energy ?sh:path} out of ten.

`Stats stress — {$focusNode}` {=#statsStress .sh:PropertyShape sh:name} reads our [stress] {+j:stress ?sh:path} out of ten.


## Year 2026 {=j:2026 .j:Period label}

Quite a year so far. I've been writing through [January] {+j:2026/01 ?prov:hadMember label}, [February] {+j:2026/02 ?prov:hadMember label}, [March] {+j:2026/03 ?prov:hadMember label}, [April] {+j:2026/04 ?prov:hadMember label}, and now [May] {+j:2026/05 ?prov:hadMember label}.

## May 2026 {=j:2026/05 .j:Period label}

May kicked off on [2026-05-01] {prov:startedAtTime ^^xsd:date}. I'm splitting it into weeks: [1–3] {+j:2026/05/week-1 ?prov:hadMember label}, [4–10] {+j:2026/05/week-2 ?prov:hadMember label}, [11–17] {+j:2026/05/week-3 ?prov:hadMember label}, [18–24] {+j:2026/05/week-4 ?prov:hadMember label}, [25–31] {+j:2026/05/week-5 ?prov:hadMember label}.

## Week 2, May 2026 {=j:2026/05/week-2 .j:Period label}

Week ran [2026-05-04] {prov:startedAtTime ^^xsd:date} to [2026-05-10] {prov:endedAtTime ^^xsd:date}. Decent week overall — [6] {j:totalActivities ^^xsd:integer} things logged, [5] {j:readingHours ^^xsd:integer} hrs reading, [8] {j:workHours ^^xsd:integer} hrs work, [3] {j:exerciseHours ^^xsd:integer} hrs moving. Set [5] {j:goalsTotal ^^xsd:integer} goals Monday, hit [4] {j:goalsCompleted ^^xsd:integer}, rolled [1] {j:goalsCarryOver ^^xsd:integer} over.

======
# Generated Records Shape {=j:GeneratedShape .sh:NodeShape label}

Everything [generated] {+prov:generated ?sh:targetObjectsOf} by the journal must be a [record] {+j:Record ?sh:class} — provenance output is domain data, not raw prov. Each carries its **label** {+#genLabel ?sh:property sh:name}.

`Generated label — {$focusNode}` {=#genLabel .sh:PropertyShape sh:name} reads our [label] {+rdfs:label ?sh:path}.
