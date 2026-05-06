[prov] <http://www.w3.org/ns/prov#>
[nasa] <http://nasa.gov/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Apollo 11 Mission {=nasa:apollo11 .prov:Activity label}

Historic lunar landing mission with complete provenance tracking.

## Mission Overview {=nasa:mission-overview .prov:Entity label}

Launch date: [1969-07-16] {nasa:launchDate ^^xsd:date}
Landing date: [1969-07-20] {nasa:landingDate ^^xsd:date}
Mission duration: [8] {nasa:durationDays ^^xsd:integer} days
Budget: [$2.5] {nasa:budget ^^xsd:decimal} billion USD
Status: [Success] {nasa:missionStatus}

## Mission Timeline {=nasa:timeline .prov:Activity label}

Complete chronological sequence of mission events.

### Launch Phase {=nasa:launch .prov:Activity label}
Started: [1969-07-16T13:32:00Z] {prov:startedAtTime ^^xsd:dateTime}
Ended: [1969-07-16T13:35:00Z] {prov:endedAtTime ^^xsd:dateTime}
Associated with: [Launch Team] {+nasa:launch-team ?prov:wasAssociatedWith .prov:Organization}
Used: [Saturn V Rocket] {+nasa:saturnv .nasa:Rocket ?prov:used}
Generated: [Earth Orbit] {+nasa:earth-orbit ?prov:generated}

### Trans-Lunar Injection {=nasa:tli .prov:Activity label}
Started: [1969-07-16T13:35:00Z] {prov:startedAtTime ^^xsd:dateTime}
Ended: [1969-07-16T16:00:00Z] {prov:endedAtTime ^^xsd:dateTime}
Informed by: [Launch Phase] {+nasa:launch ?prov:wasInformedBy}
Used: [Saturn V S-IVB Stage] {+nasa:saturnv-stage ?prov:used}
Generated: [Lunar Trajectory] {+nasa:lunar-trajectory ?prov:generated}

### Lunar Landing {=nasa:landing .prov:Activity label}
Started: [1969-07-20T20:05:00Z] {prov:startedAtTime ^^xsd:dateTime}
Ended: [1969-07-20T20:17:00Z] {prov:endedAtTime ^^xsd:dateTime}
Informed by: [Trans-Lunar Injection] {+nasa:tli ?prov:wasInformedBy}
Used: [LM Eagle] {+nasa:eagle .nasa:Module ?prov:used}
Generated: [Lunar Surface Presence] {+nasa:lunar-presence ?prov:generated}

## Personnel {=nasa:crew .prov:Entity label}

Mission crew with defined roles and responsibilities.

### Mission Commander {=nasa:armstrong .prov:Person label}
Name: [Neil Armstrong] {rdfs:label}
Born: [1930-08-05] {nasa:birthDate ^^xsd:date}
Role: [Commander] {nasa:missionRole}
First step: [First human on Moon] {nasa:achievement}

### Lunar Module Pilot {=nasa:aldrin .prov:Person label}
Name: [Buzz Aldrin] {rdfs:label}
Born: [1930-01-20] {nasa:birthDate ^^xsd:date}
Role: [Lunar Module Pilot] {nasa:missionRole}
EVA duration: [2h 18m] {nasa:evaDuration ^^xsd:string}

### Command Module Pilot {=nasa:collins .prov:Person label}
Name: [Michael Collins] {rdfs:label}
Born: [1930-10-31] {nasa:birthDate ^^xsd:date}
Role: [Command Module Pilot] {nasa:missionRole}
Responsibility: [Orbital operations] {nasa:responsibility}

## Equipment {=nasa:equipment .prov:Entity label}

All mission hardware and systems used.

### Launch Vehicle {=nasa:saturnv .nasa:Rocket label}
Name: [Saturn V] {rdfs:label}
Manufacturer: [Boeing] {nasa:manufacturer}
Height: [363] {nasa:height ^^xsd:integer} ft
Thrust: [7.6] {nasa:thrust ^^xsd:decimal} million lbs

### Lunar Module {=nasa:eagle .nasa:Module label}
Name: [Eagle] {rdfs:label}
Manufacturer: [Grumman Aircraft] {nasa:manufacturer}
Mass: [15,897] {nasa:mass ^^xsd:decimal} lb
Crew capacity: [2] {nasa:crewCapacity ^^xsd:integer}

### Command Module {=nasa:columbia .nasa:Module label}
Name: [Columbia] {rdfs:label}
Manufacturer: [North American Aviation] {nasa:manufacturer}
Mass: [28,801] {nasa:mass ^^xsd:decimal} lb
Crew capacity: [3] {nasa:crewCapacity ^^xsd:integer}

## Mission Objectives {=nasa:objectives .prov:Entity label}

Primary goals and their achievement status.

### Primary Objective {=nasa:primary-goal .nasa:Goal label}
Description: [Land humans on Moon and return safely] {rdfs:label}
Status: [Achieved] {nasa:achievementStatus}
Achievement date: [1969-07-20] {nasa:achievementDate ^^xsd:date}

### Secondary Objectives

#### Lunar Sample Collection {=nasa:sample-goal .nasa:Goal label}
Description: [Collect lunar samples for scientific analysis] {rdfs:label}
Status: [Achieved] {nasa:achievementStatus}
Sample weight: [21.5] {nasa:sampleWeight ^^xsd:decimal} kg

#### EVA Operations {=nasa:eva-goal .nasa:Goal label}
Description: [Conduct extravehicular activities] {rdfs:label}
Status: [Achieved] {nasa:achievementStatus}
EVA duration: [2h 18m] {nasa:evaDuration ^^xsd:string}

## Mission Control {=nasa:mission-control .prov:Organization label}

Ground support team with delegation structure.

### Flight Directors {=nasa:flight-directors .prov:Organization label}
Role: [Mission supervision] {nasa:role}
Personnel: [Gene Kranz, Glynn Lunney, Gerald Griffin] {nasa:personnel}

### Delegation Pattern {=nasa:operation-delegation .prov:Delegation ?prov:qualifiedDelegation}

NASA Administrator delegates operational authority to Mission Control.

Delegator: [NASA Administrator] {+nasa:admin ?prov:delegate}
Responsible: [Mission Control] {+nasa:mission-control ?prov:responsible}
Activity: [Flight Operations] {+nasa:flight-ops ?prov:hadActivity}
Role: [Flight Director] {+nasa:flight-director ?prov:hadRole}

This demonstrates:
- Complete PROV-O activity chains
- Proper temporal properties with XSD
- Organizational structure and delegation
- Equipment tracking and relationships
- Goal achievement modeling
