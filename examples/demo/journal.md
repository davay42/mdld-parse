[j] <tag:alice@example.com,2026:journal:>

# Personal Journal {=j:index .prov:Collection label}

Daily journal with proper PROV-O provenance and temporal structure.

Includes records for [2026] {+j:2026/index ?prov:hadMember}.

## Year 2026 {=j:2026/index .prov:Activity .prov:Collection label}

This is all notes made in 2026 collection. It includes monthly collections:

- January {+j:2026/01/index ?prov:hadMember}
- February {+j:2026/02/index ?prov:hadMember}
- March {+j:2026/03/index ?prov:hadMember}
- April {+j:2026/04/index ?prov:hadMember}
- May {+j:2026/05/index ?prov:hadMember}

## May 2026 {=j:2026/05/index .prov:Activity .prov:Collection label}

Started: [2026-05-01T00:00:00+04:00] {prov:startedAtTime ^^xsd:dateTime}

We have 5 weeks in May - [1-3] {+j:2026/05/week-1/index ?prov:hadMember}, [4-10] {+j:2026/05/week-2/index ?prov:hadMember}, [11-17] {+j:2026/05/week-3/index ?prov:hadMember}, [18-24] {+j:2026/05/week-4/index ?prov:hadMember}, [25-31] {+j:2026/05/week-5/index ?prov:hadMember}.

======

#### 06 May 2026 {=j:2026/05/06/index .prov:Activity label}

It's our first record in [week 2] {+j:2026/05/week-2/index ?prov:wasInformedBy}.

Complete day with activities, locations, and emotional state.

Started: [2026-05-06T08:00:00+04:00] {prov:startedAtTime ^^xsd:dateTime}
Ended: [2026-05-06T23:30:00+04:00] {prov:endedAtTime ^^xsd:dateTime}

Includes these activities: [morning] {+#morning !prov:wasInformedBy}, [afternoon] {+#afternoon !prov:wasInformedBy} and [social] {+#social !prov:wasInformedBy}.

### Morning Activities {=#morning .prov:Activity label}

I had a [walk] {+#walk ?prov:wasInformedBy} and a [coffee] {+#coffee-prep ?prov:wasInformedBy}.

**Morning Walk** {=#walk .prov:Activity label}
- Duration: [45] {j:duration ^^xsd:integer} minutes
- Distance: [2.5] {j:distance ^^xsd:decimal} miles
- Location: [Central Park] {+j:place/central-park .prov:Location ?prov:atLocation}
- Equipment: [Running Shoes] {+j:shoes/running ?prov:used}
- Generated: [Heart Rate Data] {+j:2026/05/06/hr-data ?prov:generated}

**Coffee Preparation** {=#coffee-prep .prov:Activity ?prov:used}
- Location: [Home] {+j:place/home ?prov:atLocation}
- Resources: [Coffee Beans] {+j:coffee/beans ?prov:used}, [Water] {+j:coffee/water ?prov:used}
- Generated: [Morning Coffee] {+#morning-coffee ?prov:generated}

### Afternoon Activities {=#afternoon .prov:Activity label}

**Reading Session** {=#reading .prov:Activity}
- Book: [Dune] {+j:dune-book .prov:Entity ?prov:used}
- Pages: [42] {j:pages ^^xsd:integer}
- Duration: [2] {j:hours ^^xsd:integer}
- Generated: [Reading Notes] {+j:reading-notes ?prov:generated}

**Work Session** {+j:work .prov:Activity ?prov:used}
- Task: [API Documentation] {+j:api-docs .prov:Entity ?prov:used}
- Duration: [3] {j:hours ^^xsd:integer}
- Generated: [Documentation Updates] {+j:doc-updates ?prov:generated}

### Social Interactions {=#social .prov:Activity label}

**Coffee Meeting** {+j:coffee-meeting .prov:Activity ?prov:used}
- Associated with: [Sam] {+j:sam .prov:Person ?prov:wasAssociatedWith}
- Location: [Local Cafe] {+j:cafe .prov:Location ?prov:atLocation}
- Duration: [30] {j:minutes ^^xsd:integer}
- Topic: [Career Changes] {j:topic}

## Emotional State Tracking {=#emotional-state .prov:Entity label}

Daily mood and energy levels with temporal context.

### Mood Data {=j:mood-data .prov:Entity label}
Date: [2026-05-06] {j:date ^^xsd:date}
Mood: [happy] {j:mood}
Energy level: [8] {j:energy ^^xsd:integer} out of 10
Stress level: [2] {j:stress ^^xsd:integer} out of 10

### Location History {=j:location-history .prov:Entity label}
Places visited with frequency and context.

Locations:
- [Central Park] {+j:central-park ?j:visited} - [3] {j:visitCount ^^xsd:integer} times this week
- [Local Cafe] {+j:cafe ?j:visited} - [2] {j:visitCount ^^xsd:integer} times this week
- [Home Office] {+j:home-office ?j:visited} - [5] {j:visitCount ^^xsd:integer} days this week

## Week 2 May 2026 {=j:2026/05/week-2/index .prov:Activity .prov:Collection label}

Started: [2026-05-04T00:00:00+04:00] {prov:startedAtTime ^^xsd:dateTime}

Aggregated activities and patterns for the week.

Started: [2026-05-06T23:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
Ended: [2026-05-06T23:15:00Z] {prov:endedAtTime ^^xsd:dateTime}

### Activities Summary
Total activities: [6] {j:totalActivities ^^xsd:integer}
Reading time: [5] {j:readingHours ^^xsd:integer} hours
Work time: [8] {j:workHours ^^xsd:integer} hours
Exercise time: [3] {j:exerciseHours ^^xsd:integer} hours

### Goals Progress
Weekly goals: [Set on Monday] {j:weeklyGoals}
Completed: [4] {j:goalsCompleted ^^xsd:integer} out of 5
Carry over: [1] {j:goalsCarryOver ^^xsd:integer} goal

This demonstrates:
- Proper PROV-O activity chains
- Temporal properties with XSD
- Location and emotional tracking
- Activity aggregation and summarization
- Social interaction modeling

