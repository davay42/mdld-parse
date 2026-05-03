[nasa] <http://nasa.gov/>

# Apollo 11 Mission {=nasa:apollo11 .prov:Activity label}

## METADATA

Launch: [1969-07-16T13:32:00Z] {prov:startedAtTime ^^xsd:dateTime}
Landing: [1969-07-20T20:17:00Z] {nasa:landing ^^xsd:dateTime}
Duration (days): [8] {nasa:durationDays ^^xsd:integer}
Budget (B USD): [2.5] {nasa:budget ^^xsd:decimal}
Operator: [NASA] {+nasa:agency ?prov:wasAssociatedWith .prov:Organization}

## CREW

**Neil Armstrong** {+nasa:armstrong .prov:Person ?nasa:crew} - Commander, 1930
**Buzz Aldrin** {+nasa:aldrin .prov:Person ?nasa:crew} - LMP, 1930
**Michael Collins** {+nasa:collins .prov:Person ?nasa:crew} - CMP, 1930

## EQUIPMENT

**Saturn V** {+nasa:saturnv .nasa:Rocket ?nasa:equipment} - Boeing, 363ft
**LM Eagle** {+nasa:eagle .nasa:Module ?nasa:equipment} - Grumman
**CM Columbia** {+nasa:columbia .nasa:Module ?nasa:equipment} - NAA

## ACTIVITIES

**Launch** {+nasa:launch .prov:Activity} - Used Saturn V, generated orbit trajectory

**Lunar Landing** {+nasa:landing .prov:Activity} - Used LM Eagle, generated lunar presence and samples

**EVA** {+nasa:eva .prov:Activity} - 2h 18m, 250m, 21.5kg samples collected

## OBJECTIVES {=nasa:appollo11}

**Land on Moon** {+nasa:goal1 .nasa:Goal} - ACHIEVED 1969-07-20
**Return safely** {+nasa:goal2 .nasa:Goal} - ACHIEVED 1969-07-24
**Collect samples** {+nasa:goal3 .nasa:Goal} - ACHIEVED 21.5kg

## RELATIONSHIPS

Preceded by: [Apollo 10] {+nasa:apollo10 !nasa:precededBy .nasa:SpaceMission}, [Gemini 8] {+nasa:gemini8 !nasa:precededBy .nasa:SpaceMission}

Succeeded by: [Apollo 12] {+nasa:apollo12 ?nasa:succeededBy .nasa:SpaceMission}

**Delegation** {=nasa:delegation .prov:Delegation ?prov:qualifiedDelegation}

Delegate: [Mission Control] {+nasa:mcc ?prov:agent .prov:Organization}
Responsible: [NASA Admin] {+nasa:admin ?prov:agent .prov:Person}
