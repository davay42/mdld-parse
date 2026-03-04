[mdp] <https://mdld.js.org/prov/>
[owl] <http://www.w3.org/2002/07/owl#>

## Components {=mdp:components .Container label}

> Provenance concepts, expressed as PROV-DM types and relations, are organized according to six components. 

6 components in layers: {?member .mdp:Component label}
- Entities and Activities {=#entities-activities}
    includes: {!prov:component}
    - Activity {=prov:Activity}
    - Communication {=prov:Communication}
    - End {=prov:End}
    - Entity {=prov:Entity}
    - Generation {=prov:Generation}
    - InstantaneousEvent {=prov:InstantaneousEvent}
    - Invalidation {=prov:Invalidation}
    - Start {=prov:Start}
    - Usage {=prov:Usage}
    - atTime {=prov:atTime}
    - endedAtTime {=prov:endedAtTime}
    - generated {=prov:generated}
    - generatedAtTime {=prov:generatedAtTime}
    - invalidated {=prov:invalidated}
    - invalidatedAtTime {=prov:invalidatedAtTime}
    - qualifiedCommunication {=prov:qualifiedCommunication}
    - qualifiedEnd {=prov:qualifiedEnd}
    - qualifiedGeneration {=prov:qualifiedGeneration}
    - qualifiedInvalidation {=prov:qualifiedInvalidation}
    - qualifiedStart {=prov:qualifiedStart}
    - qualifiedUsage {=prov:qualifiedUsage}
    - startedAtTime {=prov:startedAtTime}
    - used {=prov:used}
    - value {=prov:value}
    - wasEndedBy {=prov:wasEndedBy}
    - wasGeneratedBy {=prov:wasGeneratedBy}
    - wasInformedBy {=prov:wasInformedBy}
    - wasInvalidatedBy {=prov:wasInvalidatedBy}
    - wasStartedBy {=prov:wasStartedBy}
    
- Derivations {=#derivations}
    includes: {!prov:component}
    - Derivation {=prov:Derivation}
    - Influence {=prov:Influence}
    - PrimarySource {=prov:PrimarySource}
    - Quotation {=prov:Quotation}
    - Revision {=prov:Revision}
    - hadActivity {=prov:hadActivity}
    - hadGeneration {=prov:hadGeneration}
    - hadPrimarySource {=prov:hadPrimarySource}
    - hadUsage {=prov:hadUsage}
    - qualifiedDerivation {=prov:qualifiedDerivation}
    - qualifiedInfluence {=prov:qualifiedInfluence}
    - qualifiedPrimarySource {=prov:qualifiedPrimarySource}
    - qualifiedQuotation {=prov:qualifiedQuotation}
    - qualifiedRevision {=prov:qualifiedRevision}
    - wasDerivedFrom {=prov:wasDerivedFrom}
    - wasQuotedFrom {=prov:wasQuotedFrom}
    - wasRevisionOf {=prov:wasRevisionOf}
    
- Agents, responsibility and influence {=#agents-responsibility}
    includes: {!prov:component}
    - Agent {=prov:Agent}
    - Association {=prov:Association}
    - Attribution {=prov:Attribution}
    - Delegation {=prov:Delegation}
    - Organization {=prov:Organization}
    - Person {=prov:Person}
    - Plan {=prov:Plan}
    - Role {=prov:Role}
    - SoftwareAgent {=prov:SoftwareAgent}
    - actedOnBehalfOf {=prov:actedOnBehalfOf}
    - hadPlan {=prov:hadPlan}
    - hadRole {=prov:hadRole}
    - influenced {=prov:influenced}
    - qualifiedAssociation {=prov:qualifiedAssociation}
    - qualifiedAttribution {=prov:qualifiedAttribution}
    - qualifiedDelegation {=prov:qualifiedDelegation}
    - wasAssociatedWith {=prov:wasAssociatedWith}
    - wasAttributedTo {=prov:wasAttributedTo}
    - wasInfluencedBy {=prov:wasInfluencedBy}
    
- Bundles {=#bundles}
    includes: {!prov:component}
    - Bundle {=prov:Bundle}
    
- Alternate {=#alternate}
    includes: {!prov:component}
    - alternateOf {=prov:alternateOf}
    - specializationOf {=prov:specializationOf}
    
- Collections {=#collections}
    includes: {!prov:component}
    - Collection {=prov:Collection}
    - EmptyCollection {=prov:EmptyCollection}
    - hadMember {=prov:hadMember}
