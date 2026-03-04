[mdp] <https://mdld.js.org/prov/>
[owl] <http://www.w3.org/2002/07/owl#>

# Lists {=mdp:lists .Container label}

This page lists all meaningful terms from PROV-O ontology {?member}

- Classes {=mdp:class:index}
- Object Properties {=mdp:object:index}
- Datatype Properties {=mdp:datatype:index}

## Classes {=mdp:class:index .Container label}

Includes 30 classes {?member mdp:class:listed}
- [Activity](./classes/Activity.md) {=prov:Activity}
- ActivityInfluence {=prov:ActivityInfluence}
- Agent {=prov:Agent}
- AgentInfluence {=prov:AgentInfluence}
- Association {=prov:Association}
- Attribution {=prov:Attribution}
- Bundle {=prov:Bundle}
- Collection {=prov:Collection}
- Communication {=prov:Communication}
- Delegation {=prov:Delegation}
- Derivation {=prov:Derivation}
- EmptyCollection {=prov:EmptyCollection}
- End {=prov:End}
- Entity {=prov:Entity}
- EntityInfluence {=prov:EntityInfluence}
- Generation {=prov:Generation}
- Influence {=prov:Influence}
- InstantaneousEvent {=prov:InstantaneousEvent}
- Invalidation {=prov:Invalidation}
- Location {=prov:Location}
- Organization {=prov:Organization}
- Person {=prov:Person}
- Plan {=prov:Plan}
- PrimarySource {=prov:PrimarySource}
- Quotation {=prov:Quotation}
- Revision {=prov:Revision}
- Role {=prov:Role}
- SoftwareAgent {=prov:SoftwareAgent}
- Start {=prov:Start}
- Usage {=prov:Usage}

===============

## Object Properties {=mdp:object:index .Container label}

The list contains 44 objects: {?member mdp:class:listed}

- actedOnBehalfOf {=prov:actedOnBehalfOf}
- activity {=prov:activity}
- agent {=prov:agent}
- alternateOf {=prov:alternateOf}
- atLocation {=prov:atLocation}
- entity {=prov:entity}
- generated {=prov:generated}
- hadActivity {=prov:hadActivity}
- hadGeneration {=prov:hadGeneration}
- hadMember {=prov:hadMember}
- hadPlan {=prov:hadPlan}
- hadPrimarySource {=prov:hadPrimarySource}
- hadRole {=prov:hadRole}
- hadUsage {=prov:hadUsage}
- influenced {=prov:influenced}
- influencer {=prov:influencer}
- invalidated {=prov:invalidated}
- qualifiedAssociation {=prov:qualifiedAssociation}
- qualifiedAttribution {=prov:qualifiedAttribution}
- qualifiedCommunication {=prov:qualifiedCommunication}
- qualifiedDelegation {=prov:qualifiedDelegation}
- qualifiedDerivation {=prov:qualifiedDerivation}
- qualifiedEnd {=prov:qualifiedEnd}
- qualifiedGeneration {=prov:qualifiedGeneration}
- qualifiedInfluence {=prov:qualifiedInfluence}
- qualifiedInvalidation {=prov:qualifiedInvalidation}
- qualifiedPrimarySource {=prov:qualifiedPrimarySource}
- qualifiedQuotation {=prov:qualifiedQuotation}
- qualifiedRevision {=prov:qualifiedRevision}
- qualifiedStart {=prov:qualifiedStart}
- qualifiedUsage {=prov:qualifiedUsage}
- specializationOf {=prov:specializationOf}
- used {=prov:used}
- wasAssociatedWith {=prov:wasAssociatedWith}
- wasAttributedTo {=prov:wasAttributedTo}
- wasDerivedFrom {=prov:wasDerivedFrom}
- wasEndedBy {=prov:wasEndedBy}
- wasGeneratedBy {=prov:wasGeneratedBy}
- wasInfluencedBy {=prov:wasInfluencedBy}
- wasInformedBy {=prov:wasInformedBy}
- wasInvalidatedBy {=prov:wasInvalidatedBy}
- wasQuotedFrom {=prov:wasQuotedFrom}
- wasRevisionOf {=prov:wasRevisionOf}
- wasStartedBy {=prov:wasStartedBy}

===============

## Datatype Properties {=mdp:datatype:index .Container label}

The list contains 44 objects: {?member mdp:class:listed}

- atTime {=prov:atTime}
- endedAtTime {=prov:endedAtTime}
- generatedAtTime {=prov:generatedAtTime}
- invalidatedAtTime {=prov:invalidatedAtTime}
- startedAtTime {=prov:startedAtTime}
- value {=prov:value}

===============

## Lists Shape {=mdp:shape:list .sh:NodeShape label}

This shape keeps lists grounded in original ttl data - any missed IRI would trigger a violation.

Initial [Class] {+owl:Class ?sh:targetClass}, [Object Props] {+owl:ObjectProperty ?sh:targetClass} and [Datatype Props] {+owl:DatatypeProperty ?sh:targetClass} lists in the catalog are validated.

**Listed Rule** {=mdp:rule:listed .sh:propertyShape ?sh:property} checks for it to have [listed] {+mdp:class:listed ?sh:path} at least once [1] {sh:minCount}  - this is *informational* {+sh:Info ?sh:severity} constrain to keep the list integrity: **List integrity violation** {sh:message}