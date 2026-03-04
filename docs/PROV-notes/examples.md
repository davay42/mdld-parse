[foaf] <http://xmlns.com/foaf/0.1/>
[my] <tag:my@notes,2026:>

# Morning lab note {=my:obsLab1 .rdf:Statement .prov:Entity}

While reviewing the overnight logs, I confirmed that [the calibration bot] {+my:calibBot ?rdf:subject} successfully [updated] {+my:performedUpdate ?rdf:predicate} the [spectrometer firmware] {+my:spectrometerFW ?rdf:object}.  
The change looked routine, but I still recorded the provenance carefully.

## Verification activity {=my:actLab1 .prov:Activity ?prov:wasGeneratedBy}

The check was performed by [Dr. Lena Ortiz] {+my:lenaOrtiz .prov:Agent ?prov:wasAssociatedWith} during the early shift, finishing at [2026-02-18T06:42:00Z] {prov:endedAtTime ^^xsd:dateTime}.  
Given the clean checksum match, I assign a confidence of [0.97] {my:confidence ^^xsd:decimal} to this observation.


======


# Family journal entry {=my:obsFamily1 .rdf:Statement .prov:Entity}

At dinner tonight I noticed that [my brother] {+my:daniel ?rdf:subject} genuinely [enjoys] {+my:enjoys ?rdf:predicate} the new [piano lessons] {+my:pianoLessons ?rdf:object}.  
He stayed at the keyboard long after everyone else left the room, which is usually a good sign.

## Dinner observation context {=my:actFamily1 .prov:Activity ?prov:wasGeneratedBy}

This note was written by [me] {+my:authorSelf .prov:Agent ?prov:wasAssociatedWith} shortly after the meal, timestamped [2026-02-19T19:25:00Z] {prov:endedAtTime ^^xsd:dateTime}.  
It’s a personal impression, so the confidence is moderate at [0.65] {my:confidence ^^xsd:decimal}.

=======

# Gym tracker log {=my:obsGym1 .rdf:Statement .prov:Entity}

During the afternoon session I recorded that [I] {+my:authorSelf ?rdf:subject} [completed] {+my:completedExercise ?rdf:predicate} the planned [5km treadmill run] {+my:run5km ?rdf:object}.  
The machine metrics and my watch were in agreement.

## Workout recording {=my:actGym1 .prov:Activity ?prov:wasGeneratedBy}

The session was logged automatically by [FitConsole Unit 3] {+my:fitConsole3 .prov:Agent ?prov:wasAssociatedWith} at [2026-02-19T15:12:44Z] {prov:endedAtTime ^^xsd:dateTime}.  
Sensor alignment was good, so I keep the confidence high at [0.93] {my:confidence ^^xsd:decimal}.
