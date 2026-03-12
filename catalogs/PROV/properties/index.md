[mdp] <https://mdld.js.org/prov/>
[owl] <http://www.w3.org/2002/07/owl#>

## Lists Shape {=mdp:shape:list .sh:NodeShape label}

This shape keeps lists grounded in original ttl data - any missed IRI would trigger a violation.

[Object] {+owl:ObjectProperty ?sh:targetClass} and [Datatype] {+owl:DatatypeProperty ?sh:targetClass} properties lists in the catalog are validated.

**Property List integrity violation** {=mdp:rule:listed .sh:propertyShape ?sh:property sh:message} checks for it to have [listed] {+mdp:listed ?sh:path} at least once [1] {sh:minCount ^^xsd:integer}  - this is *informational* {+sh:Info ?sh:severity} constrain to keep the list integrity.


## Object Properties {=mdp:properties .Container label}

The list contains 44 object properties: 

- actedOnBehalfOf {+prov:actedOnBehalfOf ?member mdp:listed}
- activity {+prov:activity ?member mdp:listed}
- agent {+prov:agent ?member mdp:listed}
- alternateOf {+prov:alternateOf ?member mdp:listed}
- atLocation {+prov:atLocation ?member mdp:listed}
- entity {+prov:entity ?member mdp:listed}
- generated {+prov:generated ?member mdp:listed}
- hadActivity {+prov:hadActivity ?member mdp:listed}
- hadGeneration {+prov:hadGeneration ?member mdp:listed}
- hadMember {+prov:hadMember ?member mdp:listed}
- hadPlan {+prov:hadPlan ?member mdp:listed}
- hadPrimarySource {+prov:hadPrimarySource ?member mdp:listed}
- hadRole {+prov:hadRole ?member mdp:listed}
- hadUsage {+prov:hadUsage ?member mdp:listed}
- influenced {+prov:influenced ?member mdp:listed}
- influencer {+prov:influencer ?member mdp:listed}
- invalidated {+prov:invalidated ?member mdp:listed}
- qualifiedAssociation {+prov:qualifiedAssociation ?member mdp:listed}
- qualifiedAttribution {+prov:qualifiedAttribution ?member mdp:listed}
- qualifiedCommunication {+prov:qualifiedCommunication ?member mdp:listed}
- qualifiedDelegation {+prov:qualifiedDelegation ?member mdp:listed}
- qualifiedDerivation {+prov:qualifiedDerivation ?member mdp:listed}
- qualifiedEnd {+prov:qualifiedEnd ?member mdp:listed}
- qualifiedGeneration {+prov:qualifiedGeneration ?member mdp:listed}
- qualifiedInfluence {+prov:qualifiedInfluence ?member mdp:listed}
- qualifiedInvalidation {+prov:qualifiedInvalidation ?member mdp:listed}
- qualifiedPrimarySource {+prov:qualifiedPrimarySource ?member mdp:listed}
- qualifiedQuotation {+prov:qualifiedQuotation ?member mdp:listed}
- qualifiedRevision {+prov:qualifiedRevision ?member mdp:listed}
- qualifiedStart {+prov:qualifiedStart ?member mdp:listed}
- qualifiedUsage {+prov:qualifiedUsage ?member mdp:listed}
- specializationOf {+prov:specializationOf ?member mdp:listed}
- used {+prov:used ?member mdp:listed}
- wasAssociatedWith {+prov:wasAssociatedWith ?member mdp:listed}
- wasAttributedTo {+prov:wasAttributedTo ?member mdp:listed}
- wasDerivedFrom {+prov:wasDerivedFrom ?member mdp:listed}
- wasEndedBy {+prov:wasEndedBy ?member mdp:listed}
- wasGeneratedBy {+prov:wasGeneratedBy ?member mdp:listed}
- wasInfluencedBy {+prov:wasInfluencedBy ?member mdp:listed}
- wasInformedBy {+prov:wasInformedBy ?member mdp:listed}
- wasInvalidatedBy {+prov:wasInvalidatedBy ?member mdp:listed}
- wasQuotedFrom {+prov:wasQuotedFrom ?member mdp:listed}
- wasRevisionOf {+prov:wasRevisionOf ?member mdp:listed}
- wasStartedBy {+prov:wasStartedBy ?member mdp:listed}

===============

## Datatype Properties {=mdp:datatypes .Container label}

The list contains 6 datatype properties:

- atTime {+prov:atTime ?member mdp:listed}
- endedAtTime {+prov:endedAtTime ?member mdp:listed}
- generatedAtTime {+prov:generatedAtTime ?member mdp:listed}
- invalidatedAtTime {+prov:invalidatedAtTime ?member mdp:listed}
- startedAtTime {+prov:startedAtTime ?member mdp:listed}
- value {+prov:value ?member mdp:listed}