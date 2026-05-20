[j] <tag:alice@example.com,2026:journal:>

# Personal Journal {=j:index .prov:Collection label}

Everything I write ends up here. Started keeping this in [2026] {+j:2026/index ?prov:hadMember label}.

## Year 2026 {=j:2026/index .prov:Collection label}

Quite a year so far. I've been writing through [January] {+j:2026/01/index ?prov:hadMember label}, [February] {+j:2026/02/index ?prov:hadMember label}, [March] {+j:2026/03/index ?prov:hadMember label}, [April] {+j:2026/04/index ?prov:hadMember label}, and now [May] {+j:2026/05/index ?prov:hadMember label}.

## May 2026 {=j:2026/05/index .prov:Collection label}

May kicked off on [2026-05-01] {prov:startedAtTime ^^xsd:date}. I'm splitting it into weeks: [1–3] {+j:2026/05/week-1/index ?prov:hadMember label}, [4–10] {+j:2026/05/week-2/index ?prov:hadMember label}, [11–17] {+j:2026/05/week-3/index ?prov:hadMember label}, [18–24] {+j:2026/05/week-4/index ?prov:hadMember label}, [25–31] {+j:2026/05/week-5/index ?prov:hadMember label}.

## Week 2, May 2026 {=j:2026/05/week-2/index .prov:Collection label}

Week ran [2026-05-04] {prov:startedAtTime ^^xsd:date} to [2026-05-10] {prov:endedAtTime ^^xsd:date}. Decent week overall — [6] {j:totalActivities ^^xsd:integer} things logged, [5] {j:readingHours ^^xsd:integer} hrs reading, [8] {j:workHours ^^xsd:integer} hrs work, [3] {j:exerciseHours ^^xsd:integer} hrs moving. Set [5] {j:goalsTotal ^^xsd:integer} goals Monday, hit [4] {j:goalsCompleted ^^xsd:integer}, rolled [1] {j:goalsCarryOver ^^xsd:integer} over.

======

### 06 May 2026 {=j:2026/05/06/index .prov:Activity label}

Good day. Up at [2026-05-06T08:00:00+04:00] {prov:startedAtTime ^^xsd:dateTime}, lights out [2026-05-06T23:30:00+04:00] {prov:endedAtTime ^^xsd:dateTime}. This is [week 2] {+j:2026/05/week-2/index ?prov:hadMember}. By end of day I had a [daily wrap-up] {+j:2026/05/06/summary .prov:Entity ?prov:generated label} written.

Morning led into afternoon which led into [evening out] {+#morning ?prov:wasInformedBy} → [#afternoon] {+#afternoon ?prov:wasInformedBy} → [#social] {+#social ?prov:wasInformedBy}.

#### Morning {=#morning .prov:Activity label}

Started slow, which was the point. [Run first] {+#walk ?prov:wasInformedBy}, then [coffee] {+#coffee-prep ?prov:wasInformedBy}.

##### Morning Run {=#walk .prov:Activity label}

[45] {j:durationMin ^^xsd:integer} minutes, [2.5] {j:distanceMiles ^^xsd:decimal} miles around [Central Park] {+j:place/central-park .prov:Location ?prov:atLocation label}. Wore my [running shoes] {+j:shoes/running .prov:Entity ?prov:used label} — watch logged [heart rate data] {+j:2026/05/06/hr-data .prov:Entity ?prov:generated label} the whole time.

##### Coffee {=#coffee-prep .prov:Activity label}

Back [home] {+j:place/home .prov:Location ?prov:atLocation label}. Ground the [beans] {+j:coffee/beans .prov:Entity ?prov:used label}, boiled [water] {+j:coffee/water .prov:Entity ?prov:used label}, got a proper [cup] {+#morning-coffee .prov:Entity ?prov:generated label}.

#### Afternoon {=#afternoon .prov:Activity ?prov:wasInformedBy label}

Split between reading and grinding through docs.

##### Reading {=#reading .prov:Activity label}

[2] {j:durationHours ^^xsd:integer} hours with [Dune] {+j:dune-book .prov:Entity ?prov:used label} — got through [42] {j:pages ^^xsd:integer} pages. Wrote up [some notes] {+j:reading-notes .prov:Entity ?prov:generated label} while it was fresh.

##### Work {=#work .prov:Activity ?prov:wasInformedBy label}

[3] {j:durationHours ^^xsd:integer} hours on [API docs] {+j:api-docs .prov:Entity ?prov:used label}. Pushed [a round of updates] {+j:doc-updates .prov:Entity ?prov:generated label}.

#### Evening — coffee with Sam {=#social .prov:Activity ?prov:wasInformedBy label}

Met [Sam] {+j:sam .prov:Person ?prov:wasAssociatedWith label} at [our usual spot] {+j:place/cafe .prov:Location ?prov:atLocation label}. [30] {j:durationMin ^^xsd:integer} minutes turned into a real conversation about [career changes] {j:topic}.

### Wrap-up {=j:2026/05/06/summary .prov:Entity label}

Mood: [happy] {j:mood}. Energy [8] {j:energy ^^xsd:integer}/10, stress [2] {j:stress ^^xsd:integer}/10 — good ratio. Was out at [Central Park] {+j:place/central-park ?j:visited}, [home] {+j:place/home ?j:visited}, and [the café] {+j:place/cafe ?j:visited}.

