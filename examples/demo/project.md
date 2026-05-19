[proj] <tag:alice@example.com,2026:project/>

# Website Redesign {=proj:website .proj:Project .prov:Plan label}

The Q2 2026 website redesign is a [$25,000] {proj:budget ^^xsd:decimal} initiative running from [2026-06-01] {prov:startedAtTime ^^xsd:date} through [2026-08-31] {prov:endedAtTime ^^xsd:date}, currently in [planning] {proj:status} status. It is backed by the [Marketing Department] {+proj:marketing ?proj:sponsor .prov:Organization label} and [Customer Support] {+proj:support ?proj:stakeholder .prov:Organization label}, both of whom provided the brief.

## Team

Three people assembled under the [Q2 Website Plan] {+proj:q2-plan .prov:Plan label} to staff this project.

### Alice Johnson {=proj:alice .prov:Person label}

[alice@example.com] {proj:email} — [Project Manager] {proj:role}, responsible for overall delivery and stakeholder communication.

### Bob Smith {=proj:bob .prov:Person label}

[bob@example.com] {proj:email} — [Lead Developer] {proj:role}, leading all frontend and backend implementation work. Bob acts on behalf of [Alice] {+proj:alice ?prov:actedOnBehalfOf} as the technical authority for the project.

### Carol Davis {=proj:carol .prov:Person label}

[carol@example.com] {proj:email} — [UX Designer] {proj:role}, responsible for user research through to final visual design.

## Team Formation {=proj:team-formation .prov:Activity label}

On [2026-05-15T09:00:00Z] {prov:startedAtTime ^^xsd:dateTime} Alice convened the team and formalised the plan. She was [associated with] {+proj:alice ?prov:wasAssociatedWith} the activity directly, and it produced the [assembled team entity] {+proj:team-structure .prov:Entity ?prov:generated label} — the agreed roster and responsibility assignments that subsequent phases depend on.

## Design Phase {=proj:design-phase .prov:Activity ?prov:wasInformedBy label}

Kicking off on [2026-06-01] {prov:startedAtTime ^^xsd:date} and wrapping by [2026-06-15] {prov:endedAtTime ^^xsd:date}, the design phase was led by [Carol] {+proj:carol ?prov:wasAssociatedWith}. It drew on the [assembled team entity] {+proj:team-structure ?prov:used} established during team formation and consumed the [existing design system] {+proj:design-system .prov:Entity ?prov:used label} as a constraint baseline. The phase moved from user interviews through wireframes to polished mockups, producing the [design documentation] {+proj:design-docs .prov:Entity ?prov:generated label} that development would build from.

## Development Phase {=proj:dev-phase .prov:Activity ?prov:wasInformedBy label}

Development ran from [2026-06-16] {prov:startedAtTime ^^xsd:date} to [2026-07-30] {prov:endedAtTime ^^xsd:date}, led by [Bob] {+proj:bob ?prov:wasAssociatedWith}. The team used the [design documentation] {+proj:design-docs ?prov:used} directly — no redesign, just implementation — alongside the [API documentation] {+proj:api-docs .prov:Entity ?prov:used label} for backend contracts. The phase generated the [working prototype] {+proj:prototype .prov:Entity ?prov:generated label} deployed to staging.

## Validation Shapes

Every project document should be self-consistent. These shapes enforce the minimum structural expectations for a project, its team, and its deliverables.

### Project Shape {=proj:ProjectShape .sh:NodeShape label}

Validates every [proj:Project] {+proj:Project ?sh:targetClass} to carry a [budget] {+#budget ?sh:property sh:name}, a [status] {+#status ?sh:property sh:name}, and at least one [sponsor] {+#sponsor ?sh:property sh:name}.

#### Budget is required {=#budget .sh:PropertyShape sh:message}
[proj:budget] {+proj:budget ?sh:path} must appear exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} time and be a [decimal] {+xsd:decimal ?sh:datatype}.

#### Status is required {=#status .sh:PropertyShape sh:message}
[proj:status] {+proj:status ?sh:path} must appear at least [1] {sh:minCount ^^xsd:integer} time.

#### Sponsor is required {=#sponsor .sh:PropertyShape sh:message}
A project must be backed by at least [1] {sh:minCount ^^xsd:integer} [proj:sponsor] {+proj:sponsor ?sh:path}.

### Team Member Shape {=proj:PersonShape .sh:NodeShape label}

Validates every [prov:Person] {+prov:Person ?sh:targetClass} in this project to have an [email] {+#email ?sh:property sh:name} and a [role] {+#role ?sh:property sh:name}.

#### Email is required {=#email .sh:PropertyShape sh:message}
[proj:email] {+proj:email ?sh:path} must appear exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} time and match the pattern [^.+@.+$] {sh:pattern}.

#### Role is required {=#role .sh:PropertyShape sh:message}
[proj:role] {+proj:role ?sh:path} must appear at least [1] {sh:minCount ^^xsd:integer} time.

### Deliverable Shape {=proj:DeliverableShape .sh:NodeShape label}

Validates every [prov:Entity] {+prov:Entity ?sh:targetClass} produced by a project activity to have a [label] {+#dlabel ?sh:property sh:name} and a [wasGeneratedBy] {+#generated ?sh:property sh:name} link.

#### Label is required {=#dlabel .sh:PropertyShape sh:message}
Every deliverable must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [rdfs:label] {+rdfs:label ?sh:path}.

#### Generation link is required {=#generated .sh:PropertyShape sh:message}
Every deliverable must trace back to at least [1] {sh:minCount ^^xsd:integer} [prov:wasGeneratedBy] {+prov:wasGeneratedBy ?sh:path} activity.

## Project Is On Schedule {=proj:stmt-schedule .rdf:Statement .prov:Entity label}

**The working prototype** {+proj:prototype ?rdf:subject} *was delivered by* {+proj:deliveredBy ?rdf:predicate} **2026-07-30, within the original timeline** {+proj:original-timeline ?rdf:object}.
Generated by: [Development Phase] {+proj:dev-phase ?prov:wasGeneratedBy}
Derived from: [Design Documentation] {+proj:design-docs ?prov:wasDerivedFrom}
Established: [2026-07-30T00:00:00Z] {prov:generatedAtTime ^^xsd:dateTime}

## Design System Adopted as Foundation {=proj:stmt-design-system .rdf:Statement .prov:Entity label}

**The design documentation** {+proj:design-docs ?rdf:subject} *was derived from* {+prov:wasDerivedFrom ?rdf:predicate} **the existing design system** {+proj:design-system ?rdf:object}.
Generated by: [Design Phase] {+proj:design-phase ?prov:wasGeneratedBy}
Derived from: [Team Formation] {+proj:team-formation ?prov:wasDerivedFrom}
Established: [2026-06-15T00:00:00Z] {prov:generatedAtTime ^^xsd:dateTime}
