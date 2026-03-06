[mdp] <https://mdld.js.org/prov/>

## Classes {=mdp:class:index .Container label}

Includes 30 classes {?member .Class mdp:class:listed}

- [Generation](./Generation.md) {=prov:Generation}
- [Usage](./Usage.md) {=prov:Usage}
- [Start](./Start.md) {=prov:Start}
- [End](./End.md) {=prov:End}
- [Invalidation](./Invalidation.md) {=prov:Invalidation}
- ActivityInfluence {=prov:ActivityInfluence}
- AgentInfluence {=prov:AgentInfluence}
- Association {=prov:Association}
- Attribution {=prov:Attribution}
- Communication {=prov:Communication}
- Delegation {=prov:Delegation}
- Derivation {=prov:Derivation}
- EntityInfluence {=prov:EntityInfluence}
- Influence {=prov:Influence}
- InstantaneousEvent {=prov:InstantaneousEvent}
- Location {=prov:Location}
- PrimarySource {=prov:PrimarySource}
- Quotation {=prov:Quotation}
- Revision {=prov:Revision}
- Role {=prov:Role}

***

## Entity {=prov:Entity .Class label mdp:class:listed}

> An entity is a physical, digital, conceptual, or other kind of thing with some fixed aspects; entities may be real or imaginary. {prov:definition}

Has 3 sub-classes: {!subClassOf}

- Collection {=prov:Collection}
- Plan {=prov:Plan}
- Bundle {=prov:Bundle}

## Collection {=prov:Collection .Class label mdp:class:listed}

> A collection is an entity that provides a structure to some constituents, which are themselves entities. These constituents are said to be member of the collections. {prov:definition}

Has a subclass - **Empty Collection** {=prov:EmptyCollection .Class mdp:class:listed label} - *An empty collection is a collection without members.* {prov:definition}

The prov:Collection class can be used to express the provenance of the collection itself: e.g. who maintained the collection, which members it contained as it evolved, and how it was assembled. The prov:hadMember property is used to assert membership in a collection.

## Plan {=prov:Plan .Class label mdp:class:listed}

> A plan is an entity that represents a set of actions or steps intended by one or more agents to achieve some goals. {prov:definition}

> There exist no prescriptive requirement on the nature of plans, their representation, the actions or steps they consist of, or their intended goals. Since plans may evolve over time, it may become necessary to track their provenance, so plans themselves are entities. Representing the plan explicitly in the provenance can be useful for various tasks: for example, to validate the execution as represented in the provenance record, to manage expectation failures, or to provide explanations. {comment}

## Bundle {=prov:Bundle .Class label mdp:class:listed}

> A bundle is a named set of provenance descriptions, and is itself an Entity, so allowing provenance of provenance to be expressed. {prov:definition}

> Note that there are kinds of bundles (e.g. handwritten letters, audio recordings, etc.) that are not expressed in PROV-O, but can be still be described by PROV-O. {comment}

A bundle's identifier id identifies a unique set of descriptions.

A bundle is a named set of descriptions, but it is also an entity so that its provenance can be described.

A prov:Bundle is a named set of provenance descriptions, which may itself have provenance. The named set of provenance descriptions may be expressed as PROV-O or any other form. The subclass of Bundle that names a set of PROV-O assertions is not provided by PROV-O, since it is more appropriate to do so using other recommendations, standards, or technologies. In any case, a Bundle of PROV-O assertions is an abstract set of RDF triples, and adding or removing a triple creates a new distinct Bundle of PROV-O assertions.

***

## Activity {=prov:Activity label mdp:class:listed}

> An activity is something that occurs over a period of time and acts upon or with entities; it may include consuming, processing, transforming, modifying, relocating, using, or generating entities. {prov:definition}

> An activity is not an entity. This distinction is similar to the distinction between 'continuant' and 'occurrent' in logic. {comment}

***

## Agent {=prov:Agent label mdp:class:listed}

> An agent is something that bears some form of responsibility for an activity taking place, for the existence of an entity, or for another agent's activity. {prov:definition}

Has 3 sub-classes: {!subClassOf mdp:class:listed}

- Organization {=prov:Organization}
- Person {=prov:Person}
- SoftwareAgent {=prov:SoftwareAgent}
