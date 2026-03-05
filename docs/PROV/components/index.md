[mdp] <https://mdld.js.org/prov/>

## Components {=mdp:components .Container label}

> Provenance concepts, expressed as PROV-DM types and relations, are organized according to six components.

6 components in layers: {?member}

- [Entities and Activities](./entities-activities.md) {=mdp:components#entities-activities}
- Derivations {=mdp:components#derivations}
  
includes:  {!prov:component}

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

- Agents, responsibility and influence {=mdp:components#agents-responsibility}
  
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
- Bundles {=mdp:components#bundles}
  includes: {!prov:component}

  - Bundle {=prov:Bundle}
- Alternate {=mdp:components#alternate}
  includes: {!prov:component}

  - alternateOf {=prov:alternateOf}
  - specializationOf {=prov:specializationOf}
- Collections {=mdp:components#collections}
  includes: {!prov:component}

  - Collection {=prov:Collection}
  - EmptyCollection {=prov:EmptyCollection}
  - hadMember {=prov:hadMember}
