[my] <tag:alice@example.com,2026:>

## 2024-07-18 — A good day {=my:journal-2024-07-18 .my:Event}

Mood: [Happy] {my:mood}
Energy level: [8] {my:energyLevel ^^xsd:integer}
Place: [Central Park] {+my:central-park ?my:location .my:Place label @en}
With: [Sam] {+my:sam .my:Person ?my:attendee}
Weather: [Sunny] {my:weather}

Activities:

- Walking {+#walking ?my:hasActivity .my:Activity label}
- Reading {+#reading ?my:hasActivity .my:Activity label}

Reflections:
I felt [peaceful] {my:emotionalState} and park was [beautiful] {my:description}.

Related events:

- Morning coffee {+my:coffee-2024-07-18 !my:relatedEvent .my:Event}
- Evening dinner {+my:dinner-2024-07-18 !my:relatedEvent .my:Event}
