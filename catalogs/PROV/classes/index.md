[mdp] <https://mdld.js.org/prov/>
[owl] <http://www.w3.org/2002/07/owl#>


This list is grounded in original ontology in Turtle format [../prov-o.ttl] {=nih:sha-256-128;cf1acd21933033f75b215e665722ed13;1 .prov:Entity prov:atLocation}.

## Class List Shape {=mdp:shape:classes .sh:NodeShape label}

All [owl:Classes] {+owl:Class ?sh:targetClass} present is the system are validated - this is quite a broad approach and we had to comment out a couple of lines in original code, but this should be good enough for now.

**Class List integrity violation** {=mdp:rule:listed .sh:propertyShape ?sh:property sh:message} checks for it to have [listed] {+mdp:listed ?sh:path} exactly once [1] {sh:minCount sh:maxCount ^^xsd:integer}  - this is *informational* {+sh:Info ?sh:severity} constrain to keep the list integrity.

====

## Agent {=prov:Agent label mdp:listed}

> An agent is something that bears some form of responsibility for an activity taking place, for the existence of an entity, or for another agent's activity. {prov:definition}

Has 3 sub-classes: [Organization] {+prov:Organization !subClassOf}, [Person] {+prov:Person !subClassOf} and [SoftwareAgent] {+prov:SoftwareAgent !subClassOf mdp:listed}.

## Person {=prov:Person .Class label mdp:listed}

> Person agents are people. {prov:definition}

## Organization {=prov:Organization .Class label mdp:listed}

> An organization is a social or legal institution such as a company, society, etc. {prov:definition}

## SoftwareAgent {=prov:SoftwareAgent .Class label mdp:listed}

> A software agent is running software. {prov:definition}

## Entity {=prov:Entity .Class label mdp:listed}

> An entity is a physical, digital, conceptual, or other kind of thing with some fixed aspects; entities may be real or imaginary. {prov:definition}

Has 3 sub-classes: [Collection] {+prov:Collection !subClassOf}, [Plan] {+prov:Plan !subClassOf} and [Bundle] {+prov:Bundle !subClassOf}.

## Collection {=prov:Collection .Class label mdp:listed}

> A collection is an entity that provides a structure to some constituents, which are themselves entities. These constituents are said to be member of the collections. {prov:definition}

The prov:Collection class can be used to express the provenance of the collection itself: e.g. who maintained the collection, which members it contained as it evolved, and how it was assembled. The prov:hadMember property is used to assert membership in a collection.

Has a subclass - **Empty Collection** {=prov:EmptyCollection .Class mdp:listed label !subClassOf} - *An empty collection is a collection without members.* {prov:definition}

## Plan {=prov:Plan .Class label mdp:listed}

> A plan is an entity that represents a set of actions or steps intended by one or more agents to achieve some goals. {prov:definition}

> There exist no prescriptive requirement on the nature of plans, their representation, the actions or steps they consist of, or their intended goals. Since plans may evolve over time, it may become necessary to track their provenance, so plans themselves are entities. Representing the plan explicitly in the provenance can be useful for various tasks: for example, to validate the execution as represented in the provenance record, to manage expectation failures, or to provide explanations. {comment}

## Bundle {=prov:Bundle .Class label mdp:listed}

> A bundle is a named set of provenance descriptions, and is itself an Entity, so allowing provenance of provenance to be expressed. {prov:definition}

> Note that there are kinds of bundles (e.g. handwritten letters, audio recordings, etc.) that are not expressed in PROV-O, but can be still be described by PROV-O. {comment}

A bundle's identifier id identifies a unique set of descriptions.

A bundle is a named set of descriptions, but it is also an entity so that its provenance can be described.

A prov:Bundle is a named set of provenance descriptions, which may itself have provenance. The named set of provenance descriptions may be expressed as PROV-O or any other form. The subclass of Bundle that names a set of PROV-O assertions is not provided by PROV-O, since it is more appropriate to do so using other recommendations, standards, or technologies. In any case, a Bundle of PROV-O assertions is an abstract set of RDF triples, and adding or removing a triple creates a new distinct Bundle of PROV-O assertions.

***

## Activity {=prov:Activity label mdp:listed}

> An activity is something that occurs over a period of time and acts upon or with entities; it may include consuming, processing, transforming, modifying, relocating, using, or generating entities. {prov:definition}

> An activity is not an entity. This distinction is similar to the distinction between 'continuant' and 'occurrent' in logic. {comment}

***

## Generation {=prov:Generation label mdp:listed}

> Generation is the completion of production of a new entity by an activity. This entity did not exist before generation and becomes available for usage after this generation. {prov:definition}

***

## Usage {=prov:Usage label mdp:listed}

> Usage is the beginning of utilizing an entity by an activity. Before usage, the activity had not begun to utilize this entity and could not have been affected by the entity. (Note: This definition is formulated for a given usage; it is permitted for an activity to have used a same entity multiple times.) {prov:definition}

> Given that a usage is the beginning of utilizing an entity, it is instantaneous. {comment}

***

## Start {=prov:Start label mdp:listed}

> Start is when an activity is deemed to have been started by an entity, known as trigger. The activity did not exist before its start. Any usage, generation, or invalidation involving an activity follows the activity's start. A start may refer to a trigger entity that set off the activity, or to an activity, known as starter ◊, that generated the trigger. {prov:definition}

> Given that a start is when an activity is deemed to have started, it is instantaneous. {comment}

***

## End {=prov:End label mdp:listed}

> End is when an activity is deemed to have been ended by an entity, known as trigger. The activity no longer exists after its end. Any usage, generation, or invalidation involving an activity precedes the activity's end. An end may refer to a trigger entity that terminated the activity, or to an activity, known as ender ◊ that generated the trigger. {prov:definition}

> Given that an end is when an activity is deemed to have ended, it is instantaneous. {comment}

***

## Invalidation {=prov:Invalidation label mdp:listed}

> Invalidation is the start of the destruction, cessation, or expiry of an existing entity by an activity. The entity is no longer available for use (or further invalidation) after invalidation. Any generation or usage of an entity precedes its invalidation. {prov:definition}

> Given that an invalidation is the start of destruction, cessation, or expiry, it is instantaneous. {comment}

Entities have a duration. Generation marks the beginning of an entity, whereas invalidation marks its end.

***

## Communication {=prov:Communication label mdp:listed}

> Communication is the exchange of some unspecified entity by two activities, one activity using some entity generated by the other. {prov:definition}

> A communication implies that activity a2 is dependent on another a1, by way of some unspecified entity that is generated by a1 and used by a2. {comment}

***

## InstantaneousEvent {=prov:InstantaneousEvent label mdp:listed}

> The PROV data model is implicitly based on a notion of instantaneous events (or just events), that mark transitions in the world. Events include generation, usage, or invalidation of entities, as well as starting or ending of activities. This notion of event is not first-class in the data model, but it is useful for explaining its other concepts and its semantics. {prov:definition}

> An instantaneous event, or event for short, happens in the world and marks a change in the world, in its activities and in its entities. The term 'event' is commonly used in process algebra with a similar meaning. Events represent communications or interactions; they are assumed to be atomic and instantaneous. {comment}


## Other classes {=mdp:class:index .Container label}

**ActivityInfluence** {+prov:ActivityInfluence ?member .Class mdp:listed}
**AgentInfluence** {+prov:AgentInfluence ?member .Class mdp:listed}

Not yet inlined classes {?member .Class mdp:listed}

-   Association {=prov:Association}
-   Attribution {=prov:Attribution}
-   Delegation {=prov:Delegation}
-   Derivation {=prov:Derivation}
-   EntityInfluence {=prov:EntityInfluence}
-   Influence {=prov:Influence}
-   InstantaneousEvent {=prov:InstantaneousEvent}
-   Location {=prov:Location}
-   PrimarySource {=prov:PrimarySource}
-   Quotation {=prov:Quotation}
-   Revision {=prov:Revision}
-   Role {=prov:Role}
