[nasa] <http://nasa.gov/>
[mission] <nasa:mission:>
[crew] <nasa:crew:>
[equip] <nasa:equipment:>

# Apollo 11 {=mission:apollo-11 .nasa:SpaceMission label}

Launch year: [1969] {nasa:startDate ^^xsd:gYear}
Landing date: [1969-07-20] {nasa:endDate ^^xsd:date}
Duration: [8] {nasa:durationDays ^^xsd:integer}
Budget: [2.5] {nasa:billionUSD ^^xsd:decimal}

Crew:

- Neil Armstrong {+crew:armstrong ?nasa:hasCrew .nasa:Person nasa:name}
- Buzz Aldrin {+crew:aldrin ?nasa:hasCrew .nasa:Person nasa:name}
- Michael Collins {+crew:collins ?nasa:hasCrew .nasa:Person nasa:name}

Equipment:

- Saturn V {+equip:saturn-v ?nasa:hasEquipment .nasa:Rocket label}
- Lunar Module {+equip:lm-eagle ?nasa:hasEquipment .nasa:Module label}
- Command Module {+equip:cm-columbia ?nasa:hasEquipment .nasa:Module label}

Mission objectives:

- Land on Moon {+nasa:goal-land ?nasa:objective .nasa:Goal label}
- Return safely {+nasa:goal-return ?nasa:objective .nasa:Goal label}
- Collect samples {+nasa:goal-sample ?nasa:objective .nasa:Goal label}

Related missions:

- Apollo 10 {+mission:apollo-10 !nasa:precededBy .nasa:SpaceMission label}
- Gemini 8 {+mission:gemini-8 !nasa:precededBy .nasa:SpaceMission label}
