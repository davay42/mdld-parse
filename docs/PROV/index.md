[mdp] <https://mdld.js.org/prov/>
[owl] <http://www.w3.org/2002/07/owl#>

# PROV-O MDLD Catalog {=mdp:index .Container label}

> W3C standard for provenance chains working in MDLD text with SHACL validation {comment}

We have authoritative source - the [prov-o.ttl](./prov-o.ttl) {+mdp:ttl ?prov:wasDerivedFrom label}

## Class shape {=mdp:shape:class .sh:NodeShape label}

Initial [class] {+owl:Class ?sh:targetClass} list in the catalog is validated by **Listed Rule** {=mdp:rule:listed .sh:propertyShape ?sh:property} that checks for it to have [listed] {+mdp:class:listed ?sh:path} at least once [1] {sh:minCount}  - this is[informational] {+sh:Info ?sh:severity} constrain to keep the list integrity
**Classes list integrity violation** {sh:message}

## Classes {=mdp:class:index .Container label}

Includes {?member mdp:class:listed}
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

## Object Shape {=mdp:shape:object .Container label}

Initial [object property] {+owl:ObjectProperty ?sh:targetClass} list in catalog is validated by **Listed Object Rule** {=mdp:rule:listed ?sh:property} **Object list integrity violation** {sh:message}

## Object Properties {=mdp:object:index .Container label}

The list contains 44 objects: {?member mdp:class:listed}

- used {=prov:used}
