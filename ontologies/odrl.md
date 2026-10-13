[cc] <http://creativecommons.org/ns#>
[dct] <http://purl.org/dc/terms/>
[foaf] <http://xmlns.com/foaf/0.1/>
[odrl] <http://www.w3.org/ns/odrl/2/>
[owl] <http://www.w3.org/2002/07/owl#>
[schema] <http://schema.org/>
[skos] <http://www.w3.org/2004/02/skos/core#>
[vcard] <http://www.w3.org/2006/vcard/ns#>

**ODRL (Open Digital Rights Language)** is a W3C Recommendation ontology used to express **rules, rights, permissions, obligations, and prohibitions** governing digital or physical assets.

It provides a machine-readable way to answer questions like:

* *Who* can exercise *what action* on *which resource*?
* *Under what conditions* or temporal/spatial constraints?
* *What duties* (e.g., payment, attribution, logging) must be fulfilled first?

---

### Core Structure & Information Model

An ODRL policy revolves around **4 primary concepts**:

```
                +-------------------+
                |    odrl:Policy    |
                +---------+---------+
                          |
             +------------+------------+
             |            |            |
             v            v            v
      odrl:Permission  odrl:Prohibition  odrl:Duty
             |            |            |
             +------------+------------+
                          |
             +------------+------------+------------+
             |            |            |            |
             v            v            v            v
        odrl:Asset   odrl:Action   odrl:Party  odrl:Constraint

```

#### 1. Policy (`odrl:Policy`)

The root container. Common subclasses include:

* **`odrl:Set`**: A generic bundle of rules.
* **`odrl:Offer`**: Terms offered by an assigner.
* **`odrl:Agreement`**: A binding agreement between an assigner and assignee.

#### 2. Rules (`odrl:Rule`)

Policies hold one or more rules, categorized as:

* **`odrl:Permission`**: Actions an assignee *is allowed* to perform.
* **`odrl:Prohibition`**: Actions an assignee *must not* perform.
* **`odrl:Duty`**: Mandatory pre-conditions or obligations (e.g., pay fee, credit author).

#### 3. Core Properties

* **`odrl:Asset`**: The target resource being governed (e.g., your educational block or dataset).
* **`odrl:Action`**: The operation performed (e.g., `odrl:use`, `odrl:read`, `odrl:modify`, `odrl:display`, `odrl:distribute`).
* **`odrl:Party`**: The entity involved (`odrl:assigner` granting the rights, or `odrl:assignee` receiving them).

#### 4. Constraints & Refinements (`odrl:Constraint`)

Conditions that restrict the scope of a Rule, Action, Asset, or Party:

* **Operands:** Uses `odrl:leftOperand`, `odrl:operator`, and `odrl:rightOperand`.
* *Example:* `dateTime gte "2026-01-01T00:00:00Z"` or `dateTime lte "2026-12-31T23:59:59Z"`.

# Attribution {=cc:Attribution .odrl:Action .skos:Concept label @en}
[Credit be given to copyright holder and/or author.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Commercial Use {=cc:CommercialUse .odrl:Action .skos:Concept label @en}
[Exercising rights for commercial purposes.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Derivative Works {=cc:DerivativeWorks .odrl:Action .skos:Concept label @en}
[Distribution of derivative works.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Distribution {=cc:Distribution .odrl:Action .skos:Concept label @en}
[Distribution, public display, and publicly performance.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Notice {=cc:Notice .odrl:Action .skos:Concept label @en}
[Copyright and license notices be kept intact.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Reproduction {=cc:Reproduction .odrl:Action .skos:Concept label @en}
[Making multiple copies.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Share Alike {=cc:ShareAlike .odrl:Action .skos:Concept label @en}
[Derivative works be licensed under the same terms or compatible terms as the original work.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Sharing {=cc:Sharing .odrl:Action .skos:Concept label @en}
[Permits commercial derivatives, but only non-commercial distribution.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Source Code {=cc:SourceCode .odrl:Action .skos:Concept label @en}
[Source code (the preferred form for making modifications) must be provided when exercising some rights granted by the license.] {skos:definition @en}
[This term is defined by Creative Commons.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# contributor {=dct:contributor .owl:AnnotationProperty}

# creator {=dct:creator .owl:AnnotationProperty}

# description {=dct:description .owl:AnnotationProperty}

# format {=dct:format .owl:AnnotationProperty}

# isVersionOf {=dct:isVersionOf .owl:AnnotationProperty}

# issued {=dct:issued .owl:AnnotationProperty}

# license {=dct:license .owl:AnnotationProperty}

# subject {=dct:subject .owl:AnnotationProperty}

# Collection {=skos:Collection .owl:Class}

# Concept {=skos:Concept .owl:Class}

# ConceptScheme {=skos:ConceptScheme .owl:Class}

# broader {=skos:broader .owl:AnnotationProperty .owl:AnnotationProperty}

# definition {=skos:definition .owl:AnnotationProperty}

# hasTopConcept {=skos:hasTopConcept .owl:AnnotationProperty}

# member {=skos:member .owl:AnnotationProperty}

# note {=skos:note .owl:AnnotationProperty}

# prefLabel {=skos:prefLabel .owl:AnnotationProperty}

# scopeNote {=skos:scopeNote .owl:AnnotationProperty}

# ODRL Version 2.2 {=odrl: .owl:Ontology label @en}
[W3C Permissions & Obligations Expression Working Group] {dct:contributor}
[Michael Steidl] {dct:creator}
[Renato Iannella] {dct:creator}
[Stuart Myles] {dct:creator}
[Víctor Rodríguez-Doncel] {dct:creator}
[The ODRL Vocabulary and Expression defines a set of concepts and terms (the vocabulary) and encoding mechanism (the expression) for permissions and obligations statements describing digital content usage based on the ODRL Information Model.] {dct:description @en}
[This is the RDF ontology for ODRL Version 2.2.] {comment @en}
[2.2] {owl:versionInfo}
[https://www.w3.org/Consortium/Legal/2002/ipr-notice-20021231#Copyright/] {+https://www.w3.org/Consortium/Legal/2002/ipr-notice-20021231#Copyright/ ?dct:license}

# #actionConcepts {=odrl:#actionConcepts .skos:Collection}
[Action] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Has Action] {+odrl:action ?skos:member}
[Action] {+odrl:Action ?skos:member}
[Implies] {+odrl:implies ?skos:member}
[Included In] {+odrl:includedIn ?skos:member}

# #actions {=odrl:#actions .skos:Collection}
[Actions for Rules] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Transfer Ownership] {+odrl:transfer ?skos:member}
[Use] {+odrl:use ?skos:member}

# #actionsCommon {=odrl:#actionsCommon .skos:Collection}
[Actions for Rules] {skos:prefLabel @en}
[ODRL Common Vocabulary Terms] {skos:scopeNote @en}
[Attribution] {+cc:Attribution ?skos:member}
[Commercial Use] {+cc:CommercialUse ?skos:member}
[Derivative Works] {+cc:DerivativeWorks ?skos:member}
[Distribution] {+cc:Distribution ?skos:member}
[Notice] {+cc:Notice ?skos:member}
[Reproduction] {+cc:Reproduction ?skos:member}
[Share Alike] {+cc:ShareAlike ?skos:member}
[Sharing] {+cc:Sharing ?skos:member}
[Source Code] {+cc:SourceCode ?skos:member}
[Accept Tracking] {+odrl:acceptTracking ?skos:member}
[Aggregate] {+odrl:aggregate ?skos:member}
[Annotate] {+odrl:annotate ?skos:member}
[Anonymize] {+odrl:anonymize ?skos:member}
[Archive] {+odrl:archive ?skos:member}
[Attribute] {+odrl:attribute ?skos:member}
[Compensate] {+odrl:compensate ?skos:member}
[Concurrent Use] {+odrl:concurrentUse ?skos:member}
[Delete] {+odrl:delete ?skos:member}
[Derive] {+odrl:derive ?skos:member}
[Digitize] {+odrl:digitize ?skos:member}
[Display] {+odrl:display ?skos:member}
[Distribute] {+odrl:distribute ?skos:member}
[Ensure Exclusivity] {+odrl:ensureExclusivity ?skos:member}
[Execute] {+odrl:execute ?skos:member}
[Extract] {+odrl:extract ?skos:member}
[Give] {+odrl:give ?skos:member}
[Grant Use] {+odrl:grantUse ?skos:member}
[Include] {+odrl:include ?skos:member}
[Index] {+odrl:index ?skos:member}
[Inform] {+odrl:inform ?skos:member}
[Install] {+odrl:install ?skos:member}
[Modify] {+odrl:modify ?skos:member}
[Move] {+odrl:move ?skos:member}
[Next Policy] {+odrl:nextPolicy ?skos:member}
[Obtain Consent] {+odrl:obtainConsent ?skos:member}
[Play] {+odrl:play ?skos:member}
[Present] {+odrl:present ?skos:member}
[Print] {+odrl:print ?skos:member}
[Read] {+odrl:read ?skos:member}
[Reproduce] {+odrl:reproduce ?skos:member}
[Review Policy] {+odrl:reviewPolicy ?skos:member}
[Sell] {+odrl:sell ?skos:member}
[Stream] {+odrl:stream ?skos:member}
[Synchronize] {+odrl:synchronize ?skos:member}
[Text-to-speech] {+odrl:textToSpeech ?skos:member}
[Transform] {+odrl:transform ?skos:member}
[Translate] {+odrl:translate ?skos:member}
[Uninstall] {+odrl:uninstall ?skos:member}
[Watermark] {+odrl:watermark ?skos:member}

# #assetConcepts {=odrl:#assetConcepts .skos:Collection}
[Asset] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Asset] {+odrl:Asset ?skos:member}
[Asset Collection] {+odrl:AssetCollection ?skos:member}

# #assetParty {=odrl:#assetParty .skos:Collection}
[Asset and Party] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Part Of] {+odrl:partOf ?skos:member}
[Source] {+odrl:source ?skos:member}

# #assetRelations {=odrl:#assetRelations .skos:Collection}
[Asset Relations] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Target Policy] {+odrl:hasPolicy ?skos:member}
[Target] {+odrl:target ?skos:member}

# #assetRelationsCommon {=odrl:#assetRelationsCommon .skos:Collection}
[Asset Relations] {skos:prefLabel @en}
[ODRL Common Vocabulary Terms] {skos:scopeNote @en}
[Output] {+odrl:output ?skos:member}

# #conflictConcepts {=odrl:#conflictConcepts .skos:Collection}
[Policy Conflict Strategy] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Handle Policy Conflicts] {+odrl:conflict ?skos:member}
[Conflict Strategy Preference] {+odrl:ConflictTerm ?skos:member}
[Void Policy] {+odrl:invalid ?skos:member}
[Prefer Permissions] {+odrl:perm ?skos:member}
[Prefer Prohibitions] {+odrl:prohibit ?skos:member}

# #constraintLeftOperandCommon {=odrl:#constraintLeftOperandCommon .skos:Collection}
[Constraint Left Operands] {skos:prefLabel @en}
[ODRL Common Vocabulary Terms] {skos:scopeNote @en}
[Absolute Asset Position] {+odrl:absolutePosition ?skos:member}
[Absolute Asset Size] {+odrl:absoluteSize ?skos:member}
[Absolute Spatial Asset Position] {+odrl:absoluteSpatialPosition ?skos:member}
[Absolute Temporal Asset Position] {+odrl:absoluteTemporalPosition ?skos:member}
[Count] {+odrl:count ?skos:member}
[Datetime] {+odrl:dateTime ?skos:member}
[Delay Period] {+odrl:delayPeriod ?skos:member}
[Delivery Channel] {+odrl:deliveryChannel ?skos:member}
[Elapsed Time] {+odrl:elapsedTime ?skos:member}
[Event] {+odrl:event ?skos:member}
[File Format] {+odrl:fileFormat ?skos:member}
[Industry Context] {+odrl:industry ?skos:member}
[Language] {+odrl:language ?skos:member}
[Media Context] {+odrl:media ?skos:member}
[Metered Time] {+odrl:meteredTime ?skos:member}
[Payment Amount] {+odrl:payAmount ?skos:member}
[Asset Percentage] {+odrl:percentage ?skos:member}
[Product Context] {+odrl:product ?skos:member}
[Purpose] {+odrl:purpose ?skos:member}
[Recipient] {+odrl:recipient ?skos:member}
[Relative Asset Position] {+odrl:relativePosition ?skos:member}
[Relative Asset Size] {+odrl:relativeSize ?skos:member}
[Relative Spatial Asset Position] {+odrl:relativeSpatialPosition ?skos:member}
[Relative Temporal Asset Position] {+odrl:relativeTemporalPosition ?skos:member}
[Rendition Resolution] {+odrl:resolution ?skos:member}
[Geospatial Named Area] {+odrl:spatial ?skos:member}
[Geospatial Coordinates] {+odrl:spatialCoordinates ?skos:member}
[System Device] {+odrl:systemDevice ?skos:member}
[Recurring Time Interval] {+odrl:timeInterval ?skos:member}
[Unit Of Count] {+odrl:unitOfCount ?skos:member}
[Version] {+odrl:version ?skos:member}
[Virtual IT Communication Location] {+odrl:virtualLocation ?skos:member}

# #constraintLogicalOperands {=odrl:#constraintLogicalOperands .skos:Collection}
[Logical Constraint Operands] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[And] {+odrl:and ?skos:member}
[And Sequence] {+odrl:andSequence ?skos:member}
[Or] {+odrl:or ?skos:member}
[Only One] {+odrl:xone ?skos:member}

# #constraintRelationalOperators {=odrl:#constraintRelationalOperators .skos:Collection}
[Constraint Operators] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Equal to] {+odrl:eq ?skos:member}
[Greater than] {+odrl:gt ?skos:member}
[Greater than or equal to] {+odrl:gteq ?skos:member}
[Has part] {+odrl:hasPart ?skos:member}
[Is a] {+odrl:isA ?skos:member}
[Is all of] {+odrl:isAllOf ?skos:member}
[Is any of] {+odrl:isAnyOf ?skos:member}
[Is none of] {+odrl:isNoneOf ?skos:member}
[Is part of] {+odrl:isPartOf ?skos:member}
[Less than] {+odrl:lt ?skos:member}
[Less than or equal to] {+odrl:lteq ?skos:member}
[Not equal to] {+odrl:neq ?skos:member}

# #constraintRightOpCommon {=odrl:#constraintRightOpCommon .skos:Collection}
[Constraint Right Operands] {skos:prefLabel @en}
[ODRL Common Vocabulary Terms] {skos:scopeNote @en}
[Policy Rule Usage] {+odrl:policyUsage ?skos:member}

# #constraints {=odrl:#constraints .skos:Collection}
[Constraint] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Has Constraint] {+odrl:constraint ?skos:member}
[Constraint] {+odrl:Constraint ?skos:member}
[Datatype] {+odrl:dataType ?skos:member}
[Has Left Operand] {+odrl:leftOperand ?skos:member}
[Left Operand] {+odrl:LeftOperand ?skos:member}
[Has Operator] {+odrl:operator ?skos:member}
[Operator] {+odrl:Operator ?skos:member}
[Refinement] {+odrl:refinement ?skos:member}
[Has Right Operand] {+odrl:rightOperand ?skos:member}
[Right Operand] {+odrl:RightOperand ?skos:member}
[Has Right Operand Reference] {+odrl:rightOperandReference ?skos:member}
[Status] {+odrl:status ?skos:member}
[Unit] {+odrl:unit ?skos:member}

# #deprecatedTerms {=odrl:#deprecatedTerms .skos:Collection}
[Deprecated Terms] {skos:prefLabel @en}
[Ad-hoc sharing] {+odrl:adHocShare ?skos:member}
[All] {+odrl:All ?skos:member}
[All Second-level Connections] {+odrl:All2ndConnections ?skos:member}
[All First-Level Connections] {+odrl:AllConnections ?skos:member}
[All Group Connections] {+odrl:AllGroups ?skos:member}
[Append] {+odrl:append ?skos:member}
[Append To] {+odrl:appendTo ?skos:member}
[Asset Scope] {+odrl:AssetScope ?skos:member}
[Attach policy] {+odrl:attachPolicy ?skos:member}
[Attach source] {+odrl:attachSource ?skos:member}
[Commercialize] {+odrl:commercialize ?skos:member}
[Copy] {+odrl:copy ?skos:member}
[Device] {+odrl:device ?skos:member}
[Export] {+odrl:export ?skos:member}
[Extract character] {+odrl:extractChar ?skos:member}
[Extract page] {+odrl:extractPage ?skos:member}
[Extract word] {+odrl:extractWord ?skos:member}
[Extract word] {+odrl:extractWord ?skos:member}
[Group] {+odrl:Group ?skos:member}
[Ignore Undefined Actions] {+odrl:ignore ?skos:member}
[Individual] {+odrl:Individual ?skos:member}
[Inheritance Allowed] {+odrl:inheritAllowed ?skos:member}
[Inherit Relation] {+odrl:inheritRelation ?skos:member}
[Lease] {+odrl:lease ?skos:member}
[Lend] {+odrl:lend ?skos:member}
[License] {+odrl:license ?skos:member}
[Party Scope] {+odrl:PartyScope ?skos:member}
[Pay] {+odrl:pay ?skos:member}
[Payee Party] {+odrl:payeeParty ?skos:member}
[Preview] {+odrl:preview ?skos:member}
[proximity] {+odrl:proximity ?skos:member}
[Scope] {+odrl:scope ?skos:member}
[Secondary Use] {+odrl:secondaryUse ?skos:member}
[Share] {+odrl:share ?skos:member}
[Share-alike] {+odrl:shareAlike ?skos:member}
[Support Undefined Actions] {+odrl:support ?skos:member}
[System] {+odrl:system ?skos:member}
[Timed Count] {+odrl:timedCount ?skos:member}
[Handle Undefined Term] {+odrl:undefined ?skos:member}
[Undefined Term] {+odrl:UndefinedTerm ?skos:member}
[Write] {+odrl:write ?skos:member}
[Write to] {+odrl:writeTo ?skos:member}

# #duties {=odrl:#duties .skos:Collection}
[Duty] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Consequence] {+odrl:consequence ?skos:member}
[Has Duty] {+odrl:duty ?skos:member}
[Duty] {+odrl:Duty ?skos:member}
[Obligation] {+odrl:obligation ?skos:member}
[Remedy] {+odrl:remedy ?skos:member}

# #logicalConstraints {=odrl:#logicalConstraints .skos:Collection}
[Logical Constraint] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Logical Constraint] {+odrl:LogicalConstraint ?skos:member}
[Operand] {+odrl:operand ?skos:member}

# #partyConcepts {=odrl:#partyConcepts .skos:Collection}
[Party] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Party] {+odrl:Party ?skos:member}
[Party Collection] {+odrl:PartyCollection ?skos:member}

# #partyRoles {=odrl:#partyRoles .skos:Collection}
[Party Functions] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Assignee] {+odrl:assignee ?skos:member}
[Assignee Of] {+odrl:assigneeOf ?skos:member}
[Assigner] {+odrl:assigner ?skos:member}
[Assigner Of] {+odrl:assignerOf ?skos:member}

# #partyRolesCommon {=odrl:#partyRolesCommon .skos:Collection}
[Party Functions] {skos:prefLabel @en}
[ODRL Common Vocabulary Terms] {skos:scopeNote @en}
[Attributed Party] {+odrl:attributedParty ?skos:member}
[Attributing Party] {+odrl:attributingParty ?skos:member}
[Compensated Party] {+odrl:compensatedParty ?skos:member}
[Compensating Party] {+odrl:compensatingParty ?skos:member}
[Consented Party] {+odrl:consentedParty ?skos:member}
[Consenting Party] {+odrl:consentingParty ?skos:member}
[Contracted Party] {+odrl:contractedParty ?skos:member}
[Contracting Party] {+odrl:contractingParty ?skos:member}
[Informed Party] {+odrl:informedParty ?skos:member}
[Informing Party] {+odrl:informingParty ?skos:member}
[Tracked Party] {+odrl:trackedParty ?skos:member}
[Tracking Party] {+odrl:trackingParty ?skos:member}

# #permissions {=odrl:#permissions .skos:Collection}
[Permission] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Has Permission] {+odrl:permission ?skos:member}
[Permission] {+odrl:Permission ?skos:member}

# #policyConcepts {=odrl:#policyConcepts .skos:Collection}
[Policy] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Inherits From] {+odrl:inheritFrom ?skos:member}
[Policy] {+odrl:Policy ?skos:member}
[Profile] {+odrl:profile ?skos:member}
[Unique Identifier] {+odrl:uid ?skos:member}

# #policySubClasses {=odrl:#policySubClasses .skos:Collection}
[Policy Subclasses] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Agreement] {+odrl:Agreement ?skos:member}
[Offer] {+odrl:Offer ?skos:member}
[Set] {+odrl:Set ?skos:member}

# #policySubClassesCommon {=odrl:#policySubClassesCommon .skos:Collection}
[Policy Subclasses] {skos:prefLabel @en}
[ODRL Common Vocabulary Terms] {skos:scopeNote @en}
[Assertion] {+odrl:Assertion ?skos:member}
[Privacy Policy] {+odrl:Privacy ?skos:member}
[Request] {+odrl:Request ?skos:member}
[Ticket] {+odrl:Ticket ?skos:member}

# #prohibitions {=odrl:#prohibitions .skos:Collection}
[Prohibition] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Has Prohibition] {+odrl:prohibition ?skos:member}
[Prohibition] {+odrl:Prohibition ?skos:member}

# #ruleConcepts {=odrl:#ruleConcepts .skos:Collection}
[Rule] {skos:prefLabel @en}
[ODRL Core Vocabulary Terms] {skos:scopeNote @en}
[Failure] {+odrl:failure ?skos:member}
[Function] {+odrl:function ?skos:member}
[Relation] {+odrl:relation ?skos:member}
[Rule] {+odrl:Rule ?skos:member}

# Action {=odrl:Action .Class .owl:Class .skos:Concept label @en}
[An operation on an Asset.] {skos:definition @en}
[Actions may be allowed by Permissions, disallowed by Prohibitions, or made mandatory by Duties.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[schema:Action] {+schema:Action ?subClassOf}

# Agreement {=odrl:Agreement .Class .owl:Class .skos:Concept label @en}
[A Policy that grants the assignee a Rule over an Asset from an assigner.] {skos:definition @en}
[An Agreement Policy MUST contain at least one Permission or Prohibition rule, a Party with Assigner function, and a Party with Assignee function (in the same Permission or Prohibition). The Agreement Policy will grant the terms of the Policy from the Assigner to the Assignee.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Assertion] {+odrl:Assertion ?owl:disjointWith}
[Offer] {+odrl:Offer ?owl:disjointWith}
[Privacy Policy] {+odrl:Privacy ?owl:disjointWith}
[Request] {+odrl:Request ?owl:disjointWith}
[Ticket] {+odrl:Ticket ?owl:disjointWith}

# All {=odrl:All .odrl:PartyScope .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Specifies that the scope of the relationship is all of the collective individuals within a context.] {skos:definition @en}
[For example, may be used to indicate all the users of a specific social network the party is a member of. Note that “group” scope is also assumed.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# All Second-level Connections {=odrl:All2ndConnections .odrl:PartyScope .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Specifies that the scope of the relationship is all of the second-level connections to the Party.] {skos:definition @en}
[For example, may be used to indicate all “friends of friends” of the Party. Note that “group” scope is also assumed.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# All First-Level Connections {=odrl:AllConnections .odrl:PartyScope .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Specifies that the scope of the relationship is all of the first-level connections of the Party.] {skos:definition @en}
[For example, may be used to indicate all “friends” of the Party. Note that “group” scope is also assumed.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# All Group Connections {=odrl:AllGroups .odrl:PartyScope .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Specifies that the scope of the relationship is all of the group connections of the Party.] {skos:definition @en}
[For example, may be used to indicate all groups that the Party is a member of. Note that “group” scope is also assumed.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Assertion {=odrl:Assertion .Class .owl:Class .skos:Concept label @en}
[A Policy that asserts a Rule over an Asset from parties.] {skos:definition @en}
[For example, a party (an assignee or assigner) can claim what terms they have over an Asset. An Assertion Policy does not grant such permissions/prohibitions but only asserts the parties claims. An Assetion Policy  MUST contain a target Asset, a Party with any functional role, and at least one of a Permission or Prohibition rule.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Offer] {+odrl:Offer ?owl:disjointWith}
[Privacy Policy] {+odrl:Privacy ?owl:disjointWith}
[Request] {+odrl:Request ?owl:disjointWith}
[Ticket] {+odrl:Ticket ?owl:disjointWith}

# Asset {=odrl:Asset .Class .owl:Class .skos:Concept label @en}
[A resource or a collection of resources that are the subject of a Rule.] {skos:definition @en}
[The Asset entity can be any form of identifiable resource, such as data/information, content/media, applications, or services. Furthermore, it can be used to represent other Asset entities that are needed to undertake the Policy expression, such as with the Duty entity. To describe more details about the Asset, it is recommended to use Dublin Core [[dcterms]] elements or other content metadata.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Asset Collection {=odrl:AssetCollection .Class .owl:Class .skos:Concept label @en}
[An Asset that is collection of individual resources] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Asset] {+odrl:Asset ?subClassOf}

# Asset Scope {=odrl:AssetScope .Class .owl:Class .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Scopes for Asset Scope expressions.] {skos:definition @en}
[Instances of the AssetScope class represent the terms for the scope property of Assets.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Conflict Strategy Preference {=odrl:ConflictTerm .Class .owl:Class .skos:Concept label @en}
[Used to establish strategies to resolve conflicts that arise from the merging of Policies or conflicts between Permissions and Prohibitions in the same Policy.] {skos:definition @en}
[Instances of ConflictTerm describe strategies for resolving conflicts.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Constraint {=odrl:Constraint .Class .owl:Class .skos:Concept label @en}
[A boolean expression that refines the semantics of an Action and Party/Asset Collection or declare the conditions applicable to a Rule.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Duty {=odrl:Duty .Class .owl:Class .skos:Concept label @en}
[The obligation to perform an Action] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Rule] {+odrl:Rule ?subClassOf}
[Permission] {+odrl:Permission ?owl:disjointWith}
[Prohibition] {+odrl:Prohibition ?owl:disjointWith}

# Group {=odrl:Group .odrl:PartyScope .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Specifies that the scope of the relationship is the defined group with multiple individual members.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Individual {=odrl:Individual .odrl:PartyScope .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Specifies that the scope of the relationship is the single Party individual.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Left Operand {=odrl:LeftOperand .Class .owl:Class .skos:Concept label @en}
[Left operand for a constraint expression.] {skos:definition @en}
[Instances of the LeftOperand class are used as the leftOperand of a Constraint.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Logical Constraint {=odrl:LogicalConstraint .Class .owl:Class .skos:Concept label @en}
[A logical expression that refines the semantics of an Action and Party/Asset Collection or declare the conditions applicable to a Rule.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Offer {=odrl:Offer .Class .owl:Class .skos:Concept label @en}
[A Policy that proposes a Rule over an Asset from an assigner.] {skos:definition @en}
[An Offer Policy MUST contain at least one Permission or Prohibition rule and a Party with Assigner function (in the same Permission or Prohibition). The Offer Policy MAY contain a Party with Assignee function, but MUST not grant any privileges to that Party.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Agreement] {+odrl:Agreement ?owl:disjointWith}
[Assertion] {+odrl:Assertion ?owl:disjointWith}
[Privacy Policy] {+odrl:Privacy ?owl:disjointWith}
[Request] {+odrl:Request ?owl:disjointWith}
[Ticket] {+odrl:Ticket ?owl:disjointWith}

# Operator {=odrl:Operator .Class .owl:Class .skos:Concept label @en}
[Operator for constraint expression.] {skos:definition @en}
[Instances of the Operator class representing relational operators.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Party {=odrl:Party .Class .owl:Class .skos:Concept label @en}
[An entity or a collection of entities that undertake Roles in a Rule.] {skos:definition @en}
[The Party entity could be a person, group of people, organisation, or agent. An agent is a person or thing that takes an active role or produces a specified effect. To describe more details about the Party, it is recommended to use W3C vCard Ontology [[vcard-rdf]] or FOAF Vocabulary [[foaf]].] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Party Collection {=odrl:PartyCollection .Class .owl:Class .skos:Concept label @en}
[A Party that is a group of individual entities] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Party] {+odrl:Party ?subClassOf}

# Party Scope {=odrl:PartyScope .Class .owl:Class .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Scopes for Party Scope expressions.] {skos:definition @en}
[Instances of the PartyScope class represent the terms for the scope property of Parties.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Permission {=odrl:Permission .Class .owl:Class .skos:Concept label @en}
[The ability to perform an Action over an Asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Rule] {+odrl:Rule ?subClassOf}
[Duty] {+odrl:Duty ?owl:disjointWith}
[Prohibition] {+odrl:Prohibition ?owl:disjointWith}

# Policy {=odrl:Policy .Class .owl:Class .skos:Concept label @en}
[A non-empty group of Permissions and/or Prohibitions.] {skos:definition @en}
[A Policy may contain multiple Rules.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Privacy Policy {=odrl:Privacy .Class .owl:Class .skos:Concept label @en}
[A Policy that expresses a Rule over an Asset containing personal information.] {skos:definition @en}
[A Privacy Policy  MUST contain a target Asset, a Party with Assigner  is, a Party with Assignee function, and at least one of a Permission or Prohibition rule that MUST include a Duty. The target Asset SHOULD contain or relate to personal information about the Assignee. The Duty MUST describe obligations on the Assigner about managing the Asset. The Assignee is being granted the terms of the Privacy policy from the Assigner.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Agreement] {+odrl:Agreement ?owl:disjointWith}
[Assertion] {+odrl:Assertion ?owl:disjointWith}
[Offer] {+odrl:Offer ?owl:disjointWith}
[Request] {+odrl:Request ?owl:disjointWith}
[Ticket] {+odrl:Ticket ?owl:disjointWith}

# Prohibition {=odrl:Prohibition .Class .owl:Class .skos:Concept label @en}
[The inability to perform an Action over an Asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Rule] {+odrl:Rule ?subClassOf}
[Duty] {+odrl:Duty ?owl:disjointWith}
[Permission] {+odrl:Permission ?owl:disjointWith}

# Request {=odrl:Request .Class .owl:Class .skos:Concept label @en}
[A Policy that proposes a Rule over an Asset from an assignee.] {skos:definition @en}
[A Request Policy  MUST contain a target Asset, a Party with Assignee function, and at least one of a Permission or Prohibition rule. The Request MAY also contain the Party with Assigner function if this is known. No privileges are granted to any Party.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Agreement] {+odrl:Agreement ?owl:disjointWith}
[Assertion] {+odrl:Assertion ?owl:disjointWith}
[Offer] {+odrl:Offer ?owl:disjointWith}
[Privacy Policy] {+odrl:Privacy ?owl:disjointWith}
[Ticket] {+odrl:Ticket ?owl:disjointWith}

# Right Operand {=odrl:RightOperand .Class .owl:Class .skos:Concept label @en}
[Right operand for constraint expression.] {skos:definition @en}
[Instances of the RightOperand class are used as the rightOperand of a Constraint.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Rule {=odrl:Rule .Class .owl:Class .skos:Concept label @en}
[An abstract concept that represents the common characteristics of Permissions, Prohibitions, and Duties.] {skos:definition @en}
[Rule is an abstract concept.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Set {=odrl:Set .Class .owl:Class .skos:Concept label @en}
[A Policy that expresses a Rule over an Asset.] {skos:definition @en}
[A Set Policy MUST contain a target Asset, and at least one Rule. A Set Policy is the default Policy subclass. The Set is aimed at scenarios where there is an open criteria for the semantics of the policy expressions and typically refined by other systems/profiles that process the information at a later time. No privileges are granted to any Party (if defined).] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Agreement] {+odrl:Agreement ?owl:disjointWith}
[Assertion] {+odrl:Assertion ?owl:disjointWith}
[Offer] {+odrl:Offer ?owl:disjointWith}
[Privacy Policy] {+odrl:Privacy ?owl:disjointWith}
[Request] {+odrl:Request ?owl:disjointWith}
[Ticket] {+odrl:Ticket ?owl:disjointWith}

# Ticket {=odrl:Ticket .Class .owl:Class .skos:Concept label @en}
[A Policy that grants the holder a Rule over an Asset from an assigner.] {skos:definition @en}
[A Ticket Policy MUST contain a target Asset and at least one of a Permission or Prohibition rule.  The Ticket MAY contain the Party with Assigner function and MUST NOT contain an Assignee. The Ticket Policy will grant the terms of the Policy to the holder of that Ticket. The holder of the Ticket MAY remain unknown or MAY have to be identified at some later stage.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?subClassOf}
[Agreement] {+odrl:Agreement ?owl:disjointWith}
[Assertion] {+odrl:Assertion ?owl:disjointWith}
[Offer] {+odrl:Offer ?owl:disjointWith}
[Privacy Policy] {+odrl:Privacy ?owl:disjointWith}
[Request] {+odrl:Request ?owl:disjointWith}

# Undefined Term {=odrl:UndefinedTerm .Class .owl:Class .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Is used to indicate how to support Actions that are not part of any vocabulary or profile in the policy expression system.] {skos:definition @en}
[Instances of UndefinedTerm describe strategies for processing unsupported actions.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Absolute Asset Position {=odrl:absolutePosition .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A point in space or time defined with absolute coordinates for the positioning of the target Asset.] {skos:definition @en}
[Example: The upper left corner of a picture may be constrained to a specific position of the canvas rendering it.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Absolute Asset Size {=odrl:absoluteSize .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[Measure(s) of one or two axes for 2D-objects or measure(s) of one to tree axes for 3D-objects of the target Asset.] {skos:definition @en}
[Example: The image can be resized in width to a maximum of 1000px.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Absolute Spatial Asset Position {=odrl:absoluteSpatialPosition .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The absolute spatial positions of four corners of a rectangle on a 2D-canvas or the eight corners of a cuboid in a 3D-space for the target Asset to fit.] {skos:definition @en}
[Example: The upper left corner of a picture may be constrained to a specific position of the canvas rendering it. Note: see also the Left Operand Relative Spatial Asset Position. ] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Absolute Asset Position] {+odrl:absolutePosition ?skos:broader}

# Absolute Temporal Asset Position {=odrl:absoluteTemporalPosition .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The absolute temporal positions in a media stream the target Asset has to fit.] {skos:definition @en}
[Use with Actions including the target Asset in a larger media stream. The fragment part of a Media Fragment URI (https://www.w3.org/TR/media-frags/) may be used for the right operand. See the Left Operand realativeTemporalPosition. <br />Example: The MP3 music file must be positioned between second 192 and 250 of the temporal length of a stream.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Absolute Asset Position] {+odrl:absolutePosition ?skos:broader}

# Accept Tracking {=odrl:acceptTracking .odrl:Action .skos:Concept label @en}
[To accept that the use of the Asset may be tracked.] {skos:definition @en}
[The collected information may be tracked by the Assigner, or may link to a Party with the role 'trackingParty' function.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Has Action {=odrl:action .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The operation relating to the Asset for which the Rule is being subjected.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Action] {+odrl:Action ?range}

# Ad-hoc sharing {=odrl:adHocShare .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of sharing the asset to parties in close proximity to the owner.] {skos:definition @en}
[This original term and URI from the OMA specification should be used: http://www.openmobilealliance.com/oma-dd/adhoc-share .] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Aggregate {=odrl:aggregate .odrl:Action .skos:Concept label @en}
[To use the Asset or parts of it as part of a composite collection.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}
[Use] {+odrl:use ?odrl:includedIn}

# And {=odrl:and .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The relation is satisfied when all of the Constraints are satisfied.] {skos:definition @en}
[This property MUST only be used for Logical Constraints, and the list of operand values MUST be Constraint instances.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Operand] {+odrl:operand ?subPropertyOf}

# And Sequence {=odrl:andSequence .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The relation is satisfied when each of the Constraints are satisfied in the order specified.] {skos:definition @en}
[This property MUST only be used for Logical Constraints, and the list of operand values MUST be Constraint instances. The order of the list MUST be preserved. The andSequence operator is an example where there may be temporal conditional requirements between the operands. This may lead to situations where the outcome is unresolvable, such as deadlock if one of the Constraints is unable to be satisfied. ODRL Processing systems SHOULD plan for these scenarios and implement mechanisms to resolve them.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Operand] {+odrl:operand ?subPropertyOf}

# Annotate {=odrl:annotate .odrl:Action .skos:Concept label @en}
[To add explanatory notations/commentaries to the Asset without modifying the Asset in any other way.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Anonymize {=odrl:anonymize .odrl:Action .skos:Concept label @en}
[To anonymize all or parts of the Asset.] {skos:definition @en}
[For example, to remove identifying particulars for statistical or for other comparable purposes, or to use the Asset without stating the author/source.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Append {=odrl:append .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of adding to the end of an asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Modify] {+odrl:modify ?skos:exactMatch}

# Append To {=odrl:appendTo .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of appending data to the Asset without modifying the Asset in any other way.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Modify] {+odrl:modify ?skos:exactMatch}

# Archive {=odrl:archive .odrl:Action .skos:Concept label @en}
[To store the Asset (in a non-transient form).] {skos:definition @en}
[Temporal constraints may be used for temporal conditions.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Assignee {=odrl:assignee .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party is the recipient of the Rule.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Party] {+odrl:Party ?range}
[Function] {+odrl:function ?subPropertyOf}

# Assignee Of {=odrl:assigneeOf .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Identifies an ODRL Policy for which the identified Party undertakes the assignee functional role.] {skos:definition @en}
[When assigneeOf has been asserted between a metadata expression and an ODRL Policy, the Party being identified MUST be inferred to undertake the assignee functional role of all the Rules of that Policy.] {skos:note @en}
[Party] {+odrl:Party ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?range}

# Assigner {=odrl:assigner .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party is the issuer of the Rule.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Party] {+odrl:Party ?range}
[Function] {+odrl:function ?subPropertyOf}

# Assigner Of {=odrl:assignerOf .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Identifies an ODRL Policy for which the identified Party undertakes the assigner functional role.] {skos:definition @en}
[When assignerOf has been asserted between a metadata expression and an ODRL Policy, the Party being identified MUST be inferred to undertake the assigner functional role of all the Rules of that Policy.] {skos:note @en}
[Party] {+odrl:Party ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?range}

# Attach policy {=odrl:attachPolicy .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of keeping the policy notice with the asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Notice] {+cc:Notice ?skos:exactMatch}

# Attach source {=odrl:attachSource .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of attaching the source of the asset and its derivatives.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Source Code] {+cc:SourceCode ?skos:exactMatch}

# Attribute {=odrl:attribute .odrl:Action .skos:Concept label @en}
[To attribute the use of the Asset.] {skos:definition @en}
[May link to an Asset with the attribution information. May link to a Party with the  role “attributedParty” function.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Attributed Party {=odrl:attributedParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party to be attributed.] {skos:definition @en}
[Maybe specified as part of the attribute action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Attributing Party {=odrl:attributingParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party who undertakes the attribution.] {skos:definition @en}
[Maybe specified as part of the attribute action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Commercialize {=odrl:commercialize .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of using the asset in a business environment.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Commercial Use] {+cc:CommercialUse ?skos:exactMatch}

# Compensate {=odrl:compensate .odrl:Action .skos:Concept label @en}
[To compensate by transfer of some amount of value, if defined, for using or selling the Asset.] {skos:definition @en}
[The compensation may use different types of things with a value: (i) the thing is expressed by the value (term) of the Constraint name; (b) the value is expressed by operator, rightOperand, dataType and unit. Typically the assignee will compensate the assigner, but other compensation party roles may be used.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Compensated Party {=odrl:compensatedParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party is the recipient of the compensation.] {skos:definition @en}
[Maybe specified as part of the compensate duty action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Compensating Party {=odrl:compensatingParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party that is the provider of the compensation.] {skos:definition @en}
[Maybe specified as part of the compensate duty action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Concurrent Use {=odrl:concurrentUse .odrl:Action .skos:Concept label @en}
[To create multiple copies of the Asset that are being concurrently used.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Handle Policy Conflicts {=odrl:conflict .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The conflict-resolution strategy for a Policy.] {skos:definition @en}
[If no strategy is specified, the default is invalid.] {skos:note @en}
[Policy] {+odrl:Policy ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Conflict Strategy Preference] {+odrl:ConflictTerm ?range}

# Consented Party {=odrl:consentedParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party who obtains the consent.] {skos:definition @en}
[Maybe specified as part of the obtainConsent action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Consenting Party {=odrl:consentingParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party to obtain consent from.] {skos:definition @en}
[Maybe specified as part of the obtainConsent action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Consequence {=odrl:consequence .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates a Duty to another Duty, the latter being a consequence of not fulfilling the former.] {skos:definition @en}
[The consequence property is utilised to express the repercussions of not fulfilling an agreed Policy obligation or duty for a Permission. If either of these fails to be fulfilled, then this will result in the consequence Duty also becoming a new requirement, meaning that the original obligation or duty, as well as the consequence Duty must all be fulfilled] {skos:note @en}
[Duty] {+odrl:Duty ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Duty] {+odrl:Duty ?range}
[Failure] {+odrl:failure ?subPropertyOf}

# Has Constraint {=odrl:constraint .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Constraint applied to a Rule] {skos:definition @en}
[Constraints on Rules are used to determine if a rule is Active or not. Example: the Permission rule is only active during the year 2018.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Contracted Party {=odrl:contractedParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party who is being contracted.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Contracting Party {=odrl:contractingParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party who is offering the contract.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Copy {=odrl:copy .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of making an exact reproduction of the asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Reproduce] {+odrl:reproduce ?owl:sameAs}
[Reproduce] {+odrl:reproduce ?skos:exactMatch}

# ODRL Core Profile {=odrl:core .owl:Thing .skos:Concept label @en}
[Identifier for the ODRL Core Profile] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Count {=odrl:count .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[Numeric count of executions of the action of the Rule.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Datatype {=odrl:dataType .rdf:Property .skos:Concept label @en}
[The datatype of the value of the rightOperand or rightOperandReference of a Constraint.] {skos:definition @en}
[In RDF encodings, use of the rdf:datatype MUST be used. In JSON-LD encoding, the use of @type MUST be used.] {skos:note @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Datatype] {+Datatype ?range}

# Datetime {=odrl:dateTime .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The date (and optional time and timezone) of exercising the action of the Rule. Right operand value MUST be an xsd:date or xsd:dateTime as defined by [[xmlschema11-2]].] {skos:definition @en}
[The use of Timezone information is strongly recommended. The Rule may be exercised before (with operator lt/lteq) or after (with operator gt/gteq) the date(time) defined by the Right operand. <br />Example: <code>dateTime gteq 2017-12-31T06:00Z</code> means the Rule can only be exercised after (and including) 6:00AM on the 31st Decemeber 2017 UTC time.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Delay Period {=odrl:delayPeriod .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A time delay period prior to exercising the action of the Rule. The point in time triggering this period MAY be defined by another temporal Constraint combined by a Logical Constraint (utilising the odrl:andSequence operand). Right operand value MUST be an xsd:duration as defined by [[xmlschema11-2]].] {skos:definition @en}
[Only the eq, gt, gteq operators SHOULD be used. <br />Example: <code>delayPeriod eq P60M</code> indicates a delay of 60 Minutes before exercising the action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Delete {=odrl:delete .odrl:Action .skos:Concept label @en}
[To permanently remove all copies of the Asset after it has been used.] {skos:definition @en}
[Use a constraint to define under which conditions the Asset must be deleted.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Delivery Channel {=odrl:deliveryChannel .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The delivery channel used for exercising the action of the Rule.] {skos:definition @en}
[Example: the asset may be distributed only on mobile networks.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Derive {=odrl:derive .odrl:Action .skos:Concept label @en}
[To create a new derivative Asset from this Asset and to edit or modify the derivative.] {skos:definition @en}
[A new asset is created and may have significant overlaps with the original Asset. (Note that the notion of whether or not the change is significant enough to qualify as a new asset is subjective). To the derived Asset a next policy may be applied.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Device {=odrl:device .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[An identified device used for exercising the action of the Rule.] {skos:definition @en}
[See System Device.] {skos:note}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[System Device] {+odrl:systemDevice ?skos:exactMatch}

# Digitize {=odrl:digitize .odrl:Action .skos:Concept label @en}
[To produce a digital copy of (or otherwise digitize) the Asset from its analogue form.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Display {=odrl:display .odrl:Action .skos:Concept label @en}
[To create a static and transient rendition of an Asset.] {skos:definition @en}
[For example, displaying an image on a screen. If the action is to be performed to a wider audience than just the Assignees, then the Recipient constraint is recommended to be used.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Play] {+odrl:play ?odrl:includedIn}

# Distribute {=odrl:distribute .odrl:Action .skos:Concept label @en}
[To supply the Asset to third-parties.] {skos:definition @en}
[It is recommended to use nextPolicy to express the allowable usages by third-parties.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Has Duty {=odrl:duty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates an individual Duty to a Permission.] {skos:definition @en}
[A Duty is a pre-condition which must be fulfilled in order to receive the Permission.] {skos:note @en}
[Permission] {+odrl:Permission ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Duty] {+odrl:Duty ?range}

# Elapsed Time {=odrl:elapsedTime .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A continuous elapsed time period which may be used for exercising of the action of the Rule. Right operand value MUST be an xsd:duration as defined by [[xmlschema11-2]].] {skos:definition @en}
[Only the eq, lt, lteq operators SHOULD be used. See also Metered Time. <br />Example: <code>elpasedTime eq P60M</code> indicates a total elapsed time of 60 Minutes.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Ensure Exclusivity {=odrl:ensureExclusivity .odrl:Action .skos:Concept label @en}
[To ensure that the Rule on the Asset is exclusive.] {skos:definition @en}
[If used as a Duty, the assignee should be explicitly indicated as the party that is ensuring the exclusivity of the Rule.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Equal to {=odrl:eq .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[Indicating that a given value equals the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Event {=odrl:event .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[An identified event setting a context for exercising the action of the Rule.] {skos:definition @en}
[Events are temporal periods of time, and operators can be used to signal before (lt), during (eq) or after (gt) the event. <br />Example: May be taken during the “FIFA World Cup 2020” only.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Execute {=odrl:execute .odrl:Action .skos:Concept label @en}
[To run the computer program Asset.] {skos:definition @en}
[For example, machine executable code or Java such as a game or application.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Export {=odrl:export .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of transforming the asset into a new form.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Transform] {+odrl:transform ?skos:exactMatch}

# Extract {=odrl:extract .odrl:Action .skos:Concept label @en}
[To extract parts of the Asset and to use it as a new Asset.] {skos:definition @en}
[A new asset is created and may have very little in common with the original Asset. (Note that the notion of whether or not the change is significant enough to qualify as a new asset is subjective). To the extracted Asset a next policy may be applied.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Reproduce] {+odrl:reproduce ?odrl:includedIn}

# Extract character {=odrl:extractChar .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of extracting (replicating) unchanged characters from the asset.] {skos:definition @en}
[This original term and URI from the ONIX specification should be used: http://www.editeur.org/onix-pl/extract-char .] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Extract page {=odrl:extractPage .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of extracting (replicating) unchanged pages from the asset.] {skos:definition @en}
[This original term and URI from the ONIX specification should be used: http://www.editeur.org/onix-pl/extract-page .] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Extract word {=odrl:extractWord .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of extracting (replicating) unchanged words from the asset.] {skos:definition @en}
[This original term and URI from the ONIX specification should be used: http://www.editeur.org/onix-pl/extract-word .] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Failure {=odrl:failure .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Failure is an abstract property that defines the violation (or unmet) relationship between Rules.] {skos:definition @en}
[The parent property to sub-properties that express explicit failure contexts.] {skos:note @en}
[Rule] {+odrl:Rule ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Rule] {+odrl:Rule ?range}

# File Format {=odrl:fileFormat .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A transformed file format of the target Asset.] {skos:definition @en}
[Example: An asset may be transformed into JPEG format.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Function {=odrl:function .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Function is an abstract property whose sub-properties define the functional roles which may be fulfilled by a party in relation to a Rule.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Party] {+odrl:Party ?range}

# Give {=odrl:give .odrl:Action .skos:Concept label @en}
[To transfer the ownership of the Asset to a third party without compensation and while deleting the original asset.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Transfer Ownership] {+odrl:transfer ?odrl:includedIn}

# Grant Use {=odrl:grantUse .odrl:Action .skos:Concept label @en}
[To grant the use of the Asset to third parties.] {skos:definition @en}
[This action enables the assignee to create policies for the use of the Asset for third parties. The nextPolicy is recommended to be agreed with the third party. Use of temporal constraints is recommended.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Greater than {=odrl:gt .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[Indicating that a given value is greater than the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Greater than or equal to {=odrl:gteq .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[Indicating that a given value is greater than or equal to the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Has part {=odrl:hasPart .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[A set-based operator indicating that a given value contains the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Target Policy {=odrl:hasPolicy .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Identifies an ODRL Policy for which the identified Asset is the target Asset to all the Rules.] {skos:definition @en}
[The Asset being identified MUST be inferred to be the target Asset of all of the Rules of the Policy.] {skos:note @en}
[Asset] {+odrl:Asset ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?range}

# Ignore Undefined Actions {=odrl:ignore .odrl:UndefinedTerm .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The Action is to be ignored and is not part of the policy – and the policy remains valid.] {skos:definition @en}
[Used to support actions not known to the policy system.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Implies {=odrl:implies .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[An Action asserts that another Action is not prohibited to enable its operational semantics.] {skos:definition @en}
[The property asserts that an instance of Action entails that the other instance of Action is not prohibited.] {skos:note @en}
[Action] {+odrl:Action ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Action] {+odrl:Action ?range}

# Include {=odrl:include .odrl:Action .skos:Concept label @en}
[To include other related assets in the Asset.] {skos:definition @en}
[For example: bio picture must be included in the attribution. Use of a relation sub-property is required for the related assets.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Included In {=odrl:includedIn .owl:ObjectProperty .owl:TransitiveProperty .rdf:Property .skos:Concept label @en}
[An Action transitively asserts that another Action that encompasses its operational semantics.] {skos:definition @en}
[The purpose is to explicitly assert that the semantics of the referenced instance of an other Action encompasses (includes) the semantics of this instance of Action. The includedIn property is transitive, and as such, the Actions form ancestor relationships.] {skos:note @en}
[Action] {+odrl:Action ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Action] {+odrl:Action ?range}

# Index {=odrl:index .odrl:Action .skos:Concept label @en}
[To record the Asset in an index.] {skos:definition @en}
[For example, to include a link to the Asset in a search engine database.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Industry Context {=odrl:industry .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A defined industry sector setting a context for exercising the action of the Rule.] {skos:definition @en}
[Example: publishing or financial industry.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Inform {=odrl:inform .odrl:Action .skos:Concept label @en}
[To inform that an action has been performed on or in relation to the Asset.] {skos:definition @en}
[May link to a Party with the role 'informedParty' function.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Informed Party {=odrl:informedParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party to be informed of all uses.] {skos:definition @en}
[Maybe specified as part of the inform action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Informing Party {=odrl:informingParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party who provides the inform use data.] {skos:definition @en}
[Maybe specified as part of the inform action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Inheritance Allowed {=odrl:inheritAllowed .owl:DatatypeProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Indicates if the Policy entity can be inherited.] {skos:definition @en}
[A boolean value.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Inherits From {=odrl:inheritFrom .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates a (child) policy to another (parent) policy from which terms are inherited.] {skos:definition @en}
[The child policy will inherit Rules from the parent policy] {skos:note @en}
[Policy] {+odrl:Policy ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Policy] {+odrl:Policy ?range}

# Inherit Relation {=odrl:inheritRelation .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Indentifies the type of inheritance.] {skos:definition @en}
[For example, this may indicate the business scenario, such as subscription, or prior arrangements between the parties (that are not machine representable).] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Install {=odrl:install .odrl:Action .skos:Concept label @en}
[To load the computer program Asset onto a storage device which allows operating or running the Asset.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Void Policy {=odrl:invalid .odrl:ConflictTerm .owl:NamedIndividual .skos:Concept label @en}
[The policy is void.] {skos:definition @en}
[Used to indicate the policy is void for Conflict Strategy.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Is a {=odrl:isA .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[A set-based operator indicating that a given value is an instance of the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Is all of {=odrl:isAllOf .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[A set-based operator indicating that a given value is all of the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Is any of {=odrl:isAnyOf .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[A set-based operator indicating that a given value is any of the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Is none of {=odrl:isNoneOf .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[A set-based operator indicating that a given value is none of the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Is part of {=odrl:isPartOf .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[A set-based operator indicating that a given value is contained by the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Language {=odrl:language .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A natural language used by the target Asset.] {skos:definition @en}
[Example: the asset can only be translated into Greek. Must use [[bcp47]] codes for language values.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Lease {=odrl:lease .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of making available the asset to a third-party for a fixed period of time with exchange of value.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Has Left Operand {=odrl:leftOperand .rdf:Property .skos:Concept label @en}
[The left operand in a constraint expression.] {skos:definition @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Left Operand] {+odrl:LeftOperand ?range}

# Lend {=odrl:lend .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of making available the asset to a third-party for a fixed period of time without exchange of value.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# License {=odrl:license .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of granting the right to use the asset to a third-party.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Grant Use] {+odrl:grantUse ?skos:exactMatch}

# Less than {=odrl:lt .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[Indicating that a given value is less than the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Less than or equal to {=odrl:lteq .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[Indicating that a given value is less than or equal to the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Media Context {=odrl:media .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[Category of a media asset setting a context for exercising the action of the Rule.] {skos:definition @en}
[Example media types: electronic, print, advertising, marketing. Note: The used type should not be an IANA MediaType as they are focused on technical characteristics. ] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Metered Time {=odrl:meteredTime .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[An accumulated amount of one to many metered time periods which were used for exercising the action of the Rule. Right operand value MUST be an xsd:duration as defined by [[xmlschema11-2]].] {skos:definition @en}
[Only the eq, lt, lteq operators SHOULD be used. See also Elapsed Time. <br />Example: <code>meteredTime lteq P60M</code> indicates an accumulated period of 60 Minutes or less.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Modify {=odrl:modify .odrl:Action .skos:Concept label @en}
[To change existing content of the Asset. A new asset is not created by this action.] {skos:definition @en}
[This action will modify an asset which is typically updated from time to time without creating a new asset. If the result from modifying the asset should be a new asset the actions derive or extract should be used. (Note that the notion of whether or not the change is significant enough to qualify as a new asset is subjective).] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Move {=odrl:move .odrl:Action .skos:Concept label @en}
[To move the Asset from one digital location to another including deleting the original copy.] {skos:definition @en}
[After the Asset has been moved, the original copy must be deleted.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Not equal to {=odrl:neq .odrl:Operator .owl:NamedIndividual .skos:Concept label @en}
[Indicating that a given value is not equal to the right operand of the Constraint.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Next Policy {=odrl:nextPolicy .odrl:Action .skos:Concept label @en}
[To grant the specified Policy to a third party for their use of the Asset.] {skos:definition @en}
[Useful for downstream policies.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Obligation {=odrl:obligation .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates an individual Duty to a Policy.] {skos:definition @en}
[The Duty is a requirement which must be fulfilled.] {skos:note @en}
[Policy] {+odrl:Policy ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Duty] {+odrl:Duty ?range}

# Obtain Consent {=odrl:obtainConsent .odrl:Action .skos:Concept label @en}
[To obtain verifiable consent to perform the requested action in relation to the Asset.] {skos:definition @en}
[May be used as a Duty to ensure that the Assigner or a Party is authorized to approve such actions on a case-by-case basis. May link to a Party with the role “consentingParty” function.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Operand {=odrl:operand .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Operand is an abstract property for a logical relationship.] {skos:definition @en}
[Sub-properties of operand are used for Logical Constraints.] {skos:note @en}
[Logical Constraint] {+odrl:LogicalConstraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Has Operator {=odrl:operator .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The operator function applied to operands of a Constraint] {skos:definition @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Operator] {+odrl:Operator ?range}

# Or {=odrl:or .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The relation is satisfied when at least one of the Constraints is satisfied.] {skos:definition @en}
[This property MUST only be used for Logical Constraints, and the list of operand values MUST be Constraint instances.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Operand] {+odrl:operand ?subPropertyOf}

# Output {=odrl:output .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The output property specifies the Asset which is created from the output of the Action.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[Rule] {+odrl:Rule ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Asset] {+odrl:Asset ?range}
[Relation] {+odrl:relation ?subPropertyOf}

# Part Of {=odrl:partOf .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Identifies an Asset/PartyCollection that the Asset/Party is a member of.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Pay {=odrl:pay .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of paying a financial amount to a party for use of the asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Compensate] {+odrl:compensate ?skos:exactMatch}

# Payment Amount {=odrl:payAmount .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The amount of a financial payment. Right operand value MUST be an xsd:decimal. ] {skos:definition @en}
[Can be used for compensation duties with the unit property indicating the currency of the payment.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Payee Party {=odrl:payeeParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The Party is the recipient of the payment.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Compensated Party] {+odrl:compensatedParty ?skos:exactMatch}

# Asset Percentage {=odrl:percentage .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A percentage amount of the target Asset relevant for exercising the action of the Rule. Right operand value MUST be an xsd:decimal from 0 to 100.] {skos:definition @en}
[Example: Extract less than or equal to 50%.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Prefer Permissions {=odrl:perm .odrl:ConflictTerm .owl:NamedIndividual .skos:Concept label @en}
[Permissions take preference over prohibitions.] {skos:definition @en}
[Used to determine policy conflict outcomes.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Has Permission {=odrl:permission .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates an individual Permission to a Policy.] {skos:definition @en}
[Policy] {+odrl:Policy ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Permission] {+odrl:Permission ?range}

# Play {=odrl:play .odrl:Action .skos:Concept label @en}
[To create a sequential and transient rendition of an Asset.] {skos:definition @en}
[For example, to play a video or audio track. If the action is to be performed to a wider audience than just the Assignees, then the Recipient constraint is recommended to be used.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Policy Rule Usage {=odrl:policyUsage .odrl:RightOperand .owl:NamedIndividual .skos:Concept label @en}
[Indicates the actual datetime the action of the Rule was exercised.] {skos:definition @en}
[This can be used to express constraints with a LeftOperand relative to the time the rule is exercised. Operators indicate before (lt, lteq), during (eq) or after (gt, gteq) the usage of the rule. <br />Example: <code>event lt policyUsage</code> expresses that the identified event must have happened before the action of the rule is exercised.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Present {=odrl:present .odrl:Action .skos:Concept label @en}
[To publicly perform the Asset.] {skos:definition @en}
[The asset can be performed (or communicated) in public.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Preview {=odrl:preview .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of providing a short preview of the asset.] {skos:definition @en}
[Use a time constraint with the appropriate action.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Print {=odrl:print .odrl:Action .skos:Concept label @en}
[To create a tangible and permanent rendition of an Asset.] {skos:definition @en}
[For example, creating a permanent, fixed (static), and directly perceivable representation of the Asset, such as printing onto paper.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Product Context {=odrl:product .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[Category of product or service setting a context for exercising the action of the Rule.] {skos:definition @en}
[Example: May only be used in the XYZ Magazine.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Profile {=odrl:profile .rdf:Property .skos:Concept label @en}
[The identifier(s) of an ODRL Profile that the Policy conforms to.] {skos:definition @en}
[The profile property is mandatory if the Policy is using an ODRL Profile.] {skos:note @en}
[Policy] {+odrl:Policy ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Prefer Prohibitions {=odrl:prohibit .odrl:ConflictTerm .owl:NamedIndividual .skos:Concept label @en}
[Prohibitions take preference over permissions.] {skos:definition @en}
[Used to determine policy conflict outcomes.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Has Prohibition {=odrl:prohibition .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates an individual Prohibition to a Policy.] {skos:definition @en}
[Policy] {+odrl:Policy ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Prohibition] {+odrl:Prohibition ?range}

# proximity {=odrl:proximity .owl:DatatypeProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[An value indicating the closeness or nearness.] {skos:definition @en}
[This original term and URI from the OMA specification should be used: http://www.openmobilealliance.com/oma-dd/proximity .] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Purpose {=odrl:purpose .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A defined purpose for exercising the action of the Rule.] {skos:definition @en}
[Example: Educational use.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Read {=odrl:read .odrl:Action .skos:Concept label @en}
[To obtain data from the Asset.] {skos:definition @en}
[For example, the ability to read a record from a database (the Asset).] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Recipient {=odrl:recipient .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The party receiving the result/outcome of exercising the action of the Rule.] {skos:definition @en}
[The Right Operand must identify one or more specific Parties or category/ies of the Party.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Refinement {=odrl:refinement .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Constraint used to refine the semantics of an Action, or Party/Asset Collection] {skos:definition @en}
[Example: the Action print is only permitted on 50% of the asset.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Relation {=odrl:relation .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relation is an abstract property which creates an explicit link between an Action and an Asset.] {skos:definition @en}
[Sub-properties of relation are used to define the nature of that link.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Asset] {+odrl:Asset ?range}

# Relative Asset Position {=odrl:relativePosition .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A point in space or time defined with coordinates relative to full measures the positioning of the target Asset.] {skos:definition @en}
[Example: The upper left corner of a picture may be constrained to a specific position of the canvas rendering it.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Relative Asset Size {=odrl:relativeSize .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[Measure(s) of one or two axes for 2D-objects or measure(s) of one to tree axes for 3D-objects - expressed as percentages of full values - of the target Asset.] {skos:definition @en}
[Example: The image can be resized in width to a maximum of 200%. Note: See the Left Operand absoluteSize. ] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Relative Spatial Asset Position {=odrl:relativeSpatialPosition .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The relative spatial positions - expressed as percentages of full values - of four corners of a rectangle on a 2D-canvas or the eight corners of a cuboid in a 3D-space of the target Asset.] {skos:definition @en}
[See also Absolute Spatial Asset Position.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Relative Asset Position] {+odrl:relativePosition ?skos:broader}

# Relative Temporal Asset Position {=odrl:relativeTemporalPosition .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A point in space or time defined with coordinates relative to full measures the positioning of the target Asset.] {skos:definition @en}
[See also Absolute Temporal Asset Position. <br />Example: The MP3 music file must be positioned between the positions at 33% and 48% of the temporal length of a stream. ] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Relative Asset Position] {+odrl:relativePosition ?skos:broader}

# Remedy {=odrl:remedy .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[Relates an individual remedy Duty to a Prohibition.] {skos:definition @en}
[The remedy property expresses an agreed Duty that must be fulfilled in case that a Prohibition has been violated by being exercised.] {skos:note @en}
[Prohibition] {+odrl:Prohibition ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Duty] {+odrl:Duty ?range}
[Failure] {+odrl:failure ?subPropertyOf}

# Reproduce {=odrl:reproduce .odrl:Action .skos:Concept label @en}
[To make duplicate copies the Asset in any material form.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Rendition Resolution {=odrl:resolution .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[Resolution of the rendition of the target Asset.] {skos:definition @en}
[Example: the image may be printed at 1200dpi.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Review Policy {=odrl:reviewPolicy .odrl:Action .skos:Concept label @en}
[To review the Policy applicable to the Asset.] {skos:definition @en}
[Used when human intervention is required to review the Policy. May link to an Asset which represents the full Policy information.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Has Right Operand {=odrl:rightOperand .owl:DatatypeProperty .rdf:Property .skos:Concept label @en}
[The value of the right operand in a constraint expression.] {skos:definition @en}
[When used with set-based operators, a list of values may be used.] {skos:note @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Has Right Operand Reference {=odrl:rightOperandReference .rdf:Property .skos:Concept label @en}
[A reference to a web resource providing the value for the right operand of a Constraint.] {skos:definition @en}
[An IRI that MUST be dereferenced to obtain the actual right operand value. When used with set-based operators, a list of IRIs may be used] {skos:note @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Scope {=odrl:scope .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The identifier of a scope that provides context to the extent of the entity.] {skos:definition @en}
[Used to define scopes for Assets and Parties.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Secondary Use {=odrl:secondaryUse .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of using the asset for a purpose other than the purpose it was intended for.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Sell {=odrl:sell .odrl:Action .skos:Concept label @en}
[To transfer the ownership of the Asset to a third party with compensation and while deleting the original asset.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Transfer Ownership] {+odrl:transfer ?odrl:includedIn}

# Share {=odrl:share .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of the non-commercial reproduction and distribution of the asset to third-parties.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Sharing] {+cc:Sharing ?skos:exactMatch}

# Share-alike {=odrl:shareAlike .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of distributing any derivative asset under the same terms as the original asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Share Alike] {+cc:ShareAlike ?skos:exactMatch}

# Source {=odrl:source .rdf:Property .skos:Concept label @en}
[Reference to a Asset/PartyCollection] {skos:definition @en}
[Used by AssetCollection and PartyCollection when constraints are applied.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Geospatial Named Area {=odrl:spatial .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A named and identified geospatial area with defined borders which is used for exercising the action of the Rule. An IRI MUST be used to represent this value.] {skos:definition @en}
[A code value for the area and source of the code must be presented in the Right Operand. <br />Example: the [[iso3166]] Country Codes or the Getty Thesaurus of Geographic Names. ] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Geospatial Coordinates {=odrl:spatialCoordinates .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A set of coordinates setting the borders of a geospatial area used for exercising the action of the Rule. The coordinates MUST include longitude and latitude, they MAY include altitude and the geodetic datum.] {skos:definition @en}
[The default values are the altitude of earth's surface at this location and the WGS 84 datum.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Geospatial Named Area] {+odrl:spatial ?skos:broader}

# Status {=odrl:status .rdf:Property .skos:Concept label @en}
[the value generated from the leftOperand action or a value related to the leftOperand set as the reference for the comparison.] {skos:definition @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Stream {=odrl:stream .odrl:Action .skos:Concept label @en}
[To deliver the Asset in real-time.] {skos:definition @en}
[The Asset maybe utilised in real-time as it is being delivered. If the action is to be performed to a wider audience than just the Assignees, then the Recipient constraint is recommended to be used.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Support Undefined Actions {=odrl:support .odrl:UndefinedTerm .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The Action is to be supported as part of the policy – and the policy remains valid.] {skos:definition @en}
[Used to support actions not known to the policy system.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Synchronize {=odrl:synchronize .odrl:Action .skos:Concept label @en}
[To use the Asset in timed relations with media (audio/visual) elements of another Asset.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# System {=odrl:system .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[An identified computing system used for exercising the action of the Rule.] {skos:definition @en}
[See System Device] {skos:note}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[System Device] {+odrl:systemDevice ?skos:exactMatch}

# System Device {=odrl:systemDevice .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[An identified computing system or computing device used for exercising the action of the Rule.] {skos:definition @en}
[Example: The system device can be identified by a unique code created from the used hardware.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Device] {+odrl:device ?skos:exactMatch}
[System] {+odrl:system ?skos:exactMatch}

# Target {=odrl:target .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The target property indicates the Asset that is the primary subject to which the Rule action directly applies.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Asset] {+odrl:Asset ?range}
[Relation] {+odrl:relation ?subPropertyOf}

# Text-to-speech {=odrl:textToSpeech .odrl:Action .skos:Concept label @en}
[To have a text Asset read out loud.] {skos:definition @en}
[If the action is to be performed to a wider audience than just the Assignees, then the recipient constraint is recommended to be used.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Recurring Time Interval {=odrl:timeInterval .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[A recurring period of time before the next execution of the action of the Rule. Right operand value MUST be an xsd:duration as defined by [[xmlschema11-2]].] {skos:definition @en}
[Only the eq operator SHOULD be used. <br />Example: <code>timeInterval eq P7D</code> indicates a recurring 7 day period.] {skos:note}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Timed Count {=odrl:timedCount .owl:DatatypeProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The number of seconds after which timed metering use of the asset begins.] {skos:definition @en}
[This original term and URI from the OMA specification should be used: http://www.openmobilealliance.com/oma-dd/timed-count .] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Literal] {+Literal ?range}

# Tracked Party {=odrl:trackedParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party whose usage is being tracked.] {skos:definition @en}
[May be specified as part of the acceptTracking action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Tracking Party {=odrl:trackingParty .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The Party who is tracking usage.] {skos:definition @en}
[May be specified as part of the acceptTracking action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Function] {+odrl:function ?subPropertyOf}

# Transfer Ownership {=odrl:transfer .odrl:Action .skos:Concept label @en}
[To transfer the ownership of the Asset in perpetuity.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Transform {=odrl:transform .odrl:Action .skos:Concept label @en}
[To convert the Asset into a different format.] {skos:definition @en}
[Typically used to convert the Asset into a different format for consumption on/transfer to a third party system.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Translate {=odrl:translate .odrl:Action .skos:Concept label @en}
[To translate the original natural language of an Asset into another natural language.] {skos:definition @en}
[A new derivative Asset is created by that action.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Unique Identifier {=odrl:uid .rdf:Property .skos:Concept label @en}
[An unambiguous identifier] {skos:definition @en}
[Used by the Policy, Rule, Asset, Party, Constraint, and Logical Constraint Classes.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Handle Undefined Term {=odrl:undefined .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[Relates the strategy used for handling undefined actions to a Policy.] {skos:definition @en}
[If no strategy is specified, the default is invalid.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Undefined Term] {+odrl:UndefinedTerm ?range}

# Uninstall {=odrl:uninstall .odrl:Action .skos:Concept label @en}
[To unload and delete the computer program Asset from a storage device and disable its readiness for operation.] {skos:definition @en}
[The Asset is no longer accessible to the assignees after it has been used.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Unit {=odrl:unit .rdf:Property label @en}
[The unit of measurement of the value of the rightOperand or rightOperandReference of a Constraint.] {skos:definition @en}
[Constraint] {+odrl:Constraint ?domain}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Unit Of Count {=odrl:unitOfCount .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The unit of measure used for counting the executions of the action of the Rule.] {skos:definition @en}
[Note: Typically used with Duties to indicate the unit entity to be counted of the Action. <br />Example: A duty to compensate and a unitOfCount constraint of 'perUser' would indicate that the compensation by multiplied by the 'number of users'.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Use {=odrl:use .odrl:Action .skos:Concept label @en}
[To use the Asset] {skos:definition @en}
[Use is the most generic action for all non-third-party usage. More specific types of the use action can be expressed by more targetted actions.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Version {=odrl:version .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[The version of the target Asset.] {skos:definition @en}
[Example: Single Paperback or Multiple Issues or version 2.0 or higher.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Virtual IT Communication Location {=odrl:virtualLocation .odrl:LeftOperand .owl:NamedIndividual .skos:Concept label @en}
[An identified location of the IT communication space which is relevant for exercising the action of the Rule.] {skos:definition @en}
[Example: an Internet domain or IP address range.] {skos:note @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}

# Watermark {=odrl:watermark .odrl:Action .skos:Concept label @en}
[To apply a watermark to the Asset.] {skos:definition @en}
[Non-Normative] {skos:scopeNote @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Use] {+odrl:use ?odrl:includedIn}

# Write {=odrl:write .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of writing to the Asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Modify] {+odrl:modify ?skos:exactMatch}

# Write to {=odrl:writeTo .odrl:Action .skos:Concept label @en}
**true** {owl:deprecated ^^xsd:boolean}
[The act of adding data to the Asset.] {skos:definition @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Modify] {+odrl:modify ?skos:exactMatch}

# Only One {=odrl:xone .owl:ObjectProperty .rdf:Property .skos:Concept label @en}
[The relation is satisfied when only one, and not more, of the Constaints is satisfied] {skos:definition @en}
[This property MUST only be used for Logical Constraints, and the list of operand values MUST be Constraint instances.] {skos:note @en}
[ODRL Version 2.2] {+odrl: ?isDefinedBy}
[Operand] {+odrl:operand ?subPropertyOf}
