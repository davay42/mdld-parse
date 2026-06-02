[foaf] <http://xmlns.com/foaf/0.1/>
[dc] <http://purl.org/dc/elements/1.1/>
[dct] <http://purl.org/dc/terms/>
[owl] <http://www.w3.org/2002/07/owl#>
[vs] <http://www.w3.org/2003/06/sw-vocab-status/ns#>
[wot] <http://xmlns.com/wot/0.1/>
[geo] <http://www.w3.org/2003/01/geo/wgs84_pos#>
[skos] <http://www.w3.org/2004/02/skos/core#>
[pim] <http://www.w3.org/2000/10/swap/pim/contact#>
[schema] <http://schema.org/>

# Friend of a Friend (FOAF) vocabulary {=foaf: .owl:Ontology label dc:title}

> The Friend of a Friend (FOAF) RDF vocabulary, described using W3C RDF Schema and the Web Ontology Language. {dc:description}

This ontology uses external terms: `date` {=dc:date .owl:AnnotationProperty}, `description` {=dc:description .owl:AnnotationProperty}, `title` {=dc:title .owl:AnnotationProperty}, `Class` {=Class .owl:Class}, `Thing` {=owl:Thing label}, `Spatial Thing` {=geo:SpatialThing .owl:Class label}, `term_status` {=vs:term_status .owl:AnnotationProperty}, `Concept` {=skos:Concept label}.

## Identity & Structural Agents
===============================

Classes
=======

The core of the [FOAF] {=foaf:} vocabulary provides a hierarchy for identifying entities that act in the physical or digital world. FOAF defines a base class **Agent** {+foaf:Agent !isDefinedBy} that encompasses any operational entity, which then specializes into structural categories like human individuals, organizational bodies, and collective groups. There are different types of Agents - **Person** {+foaf:Person !isDefinedBy}, **Group** {+foaf:Group !isDefinedBy} and **Organization** {+foaf:Organization !isDefinedBy}.

### Agent {=foaf:Agent .Class .owl:Class label}

> An agent (eg. person, group, software or physical artifact). {comment}

[stable] {vs:term_status}

Same as [dct:Agent] {+dct:Agent ?owl:equivalentClass}.

Agents are the active nodes in FOAF graphs. They can be people, organizations, groups, or even software and artifacts that carry identity and relationships.

### Person {=foaf:Person .Class .owl:Class label}

> A person. {comment}

[stable] {vs:term_status}

A Person is an instance of a [Spatial Thing] {+geo:SpatialThing ?subClassOf} and  an `Agent` {+foaf:Agent ?subClassOf}. `foaf:Person` is equivalent to `schema:Person` {+schema:Person ?owl:equivalentClass} and `pim:Person` {+pim:Person ?owl:equivalentClass}. Person is not an `Organization` {+foaf:Organization ?owl:disjointWith} or a `Project` {+foaf:Project ?owl:disjointWith}.

People are the most common FOAF actors, modeled as agents with personal identity, relationships, and online presence.

### Group {=foaf:Group .Class .owl:Class label}

> A class of Agents. {comment}

[stable] {vs:term_status}

Is a kind of [Agent] {+foaf:Agent ?subClassOf}.

Groups are collective agents whose membership and shared structure can be expressed through FOAF relationships. 

### Organization {=foaf:Organization .Class .owl:Class label}

> An organization. {comment}

[stable] {vs:term_status}

Organization is a kind of [Agent] {+foaf:Agent ?subClassOf}. It is not a  [Document] {+foaf:Document ?owl:disjointWith} and not a single [Person] {+foaf:Person ?owl:disjointWith}.

Organizations are structured agents with formal identity, often acting as employers, sponsors, or publishers in FOAF graphs. 

Properties
==========

[FOAF] {=foaf:} defines basic relations between agents - **knows** {+foaf:knows !isDefinedBy}, **member** {+foaf:member !isDefinedBy}, **membershipClass** {+foaf:membershipClass !isDefinedBy}, **based_near** {+foaf:based_near !isDefinedBy} and **fundedBy** {+foaf:fundedBy !isDefinedBy}.

### knows {=foaf:knows .owl:ObjectProperty .rdf:Property label}

> A person known by this person (indicating some level of reciprocated interaction between the parties). {comment}

[stable] {vs:term_status}

Links two [Persons] {+foaf:Person ?domain ?range} with a relation.

A core social property, `foaf:knows` maps one person to another and forms the backbone of FOAF social graphs. 

### member {=foaf:member .owl:ObjectProperty .rdf:Property label}

> Indicates a member of a Group {comment}

[stable] {vs:term_status}

Notes [Group] {+foaf:Group ?domain} membership of an [Agent] {+foaf:Agent ?range}.

`foaf:member` links a group to its members, making group membership explicit and navigable in FOAF data.

### membershipClass {=foaf:membershipClass .owl:AnnotationProperty .rdf:Property label}

> Indicates the class of individuals that are a member of a Group {comment}

[unstable] {vs:term_status}

Used to express the expected class of members in a group, such as distinguishing people from organizations in membership lists.

### based near {=foaf:based_near .owl:ObjectProperty .rdf:Property label}

> A location that something is based near, for some broadly human notion of near. {comment}

[testing] {vs:term_status}

Connects two [Spatial Things] {+geo:SpatialThing ?domain ?range} to each other.

This property captures a loose spatial relationship useful for people, organizations, or projects that are “near” a place.



## Naming & Personal Profile Metrics
====================================

An Agent's identity is constructed through strings, metrics, and demographic tags. [FOAF] {=foaf:} handles naming conventions natively via general and specialized sub-properties, while storing physical indicators like age or functional classification variables like Myers-Briggs profiles. The properties are: *name* {+foaf:name !isDefinedBy}, *firstName* {+foaf:firstName !isDefinedBy}, *lastName* {+foaf:lastName !isDefinedBy}, *familyName* {+foaf:familyName !isDefinedBy}, *givenName* {+foaf:givenName !isDefinedBy}

### name {=foaf:name .owl:DatatypeProperty .rdf:Property label}

> A name for some thing. {comment}

[testing] {vs:term_status}

Is a kind of [label] {+label ?subPropertyOf} attached as [Literal] {+Literal ?range} to a [Thing] {+owl:Thing ?domain}.

The generic `foaf:name` is the broad name property used for people, groups, organizations, and other things.

### firstName {=foaf:firstName .owl:DatatypeProperty .rdf:Property label}

> The first name of a person. {comment}

[testing] {vs:term_status}

Captures a [Literal] {+Literal ?range} first name to a [Person] {+foaf:Person ?domain}.

Used to capture the given or personal name portion of a person’s identity.

### lastName {=foaf:lastName .owl:DatatypeProperty .rdf:Property label}

> The last name of a person. {comment}

[testing] {vs:term_status}

Captures a [Literal] {+Literal ?range} last name to a [Person] {+foaf:Person ?domain}.

Used to capture the family or surname portion of a person’s name.

### familyName {=foaf:familyName .owl:DatatypeProperty .rdf:Property label}

> The family name of some person. {comment}

[testing] {vs:term_status}

Captures a [Literal] {+Literal ?range} last name to a [Person] {+foaf:Person ?domain}.

An explicit property for a person’s family name.

### givenName {=foaf:givenName .owl:DatatypeProperty .rdf:Property label}

> The given name of some person. {comment}

[testing] {vs:term_status}

Captures a person’s given name as an alternative to firstName.

### nickname {=foaf:nick .owl:DatatypeProperty .rdf:Property label}
[A short informal nickname characterising an agent (includes login identifiers, IRC and other chat nicknames).] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

A concise informal handle for an agent, useful in social and chat contexts.

### title {=foaf:title .owl:DatatypeProperty .rdf:Property label}
[Title (Mr, Mrs, Ms, Dr. etc)] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

A personal honorific or title associated with an agent.

### gender {=foaf:gender .owl:DatatypeProperty .owl:FunctionalProperty .rdf:Property label}
[The gender of this Agent (typically but not necessarily 'male' or 'female').] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

Stores a person’s gender information as a literal value.

### age {=foaf:age .owl:DatatypeProperty .owl:FunctionalProperty .rdf:Property label}
[The age in years of some agent.] {comment}
[unstable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A numeric age value for an agent.

### birthday {=foaf:birthday .owl:DatatypeProperty .owl:FunctionalProperty .rdf:Property label}
[The birthday of this Agent, represented in mm-dd string form, eg. '12-31'.] {comment}
[unstable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A recurring birthdate value that captures month and day without a year.

### myersBriggs {=foaf:myersBriggs .owl:DatatypeProperty .rdf:Property label}
[A Myers Briggs (MBTI) personality classification.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A personality classification used for richer personal profiles.

### status {=foaf:status .owl:DatatypeProperty .rdf:Property label}
> A string expressing what the user is happy for the general public (normally) to know about their current activity. {comment}

[unstable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A public status message describing current activity or mood.

### plan {=foaf:plan .owl:DatatypeProperty .rdf:Property label}
[A .plan comment, in the tradition of finger and '.plan' files.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A legacy personal text field for hand-authored status or planning notes.

### Label Property {=foaf:LabelProperty .Class .owl:Class label}
[A foaf:LabelProperty is any RDF property with texual values that serve as labels.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

A class for properties that provide human-readable labels.



## Project Collaboration
========================

[FOAF] {=foaf:} defines collective endeavours of Agents - **Projects** {+foaf:Project !isDefinedBy} and involvement of Persons in them as **currentProject** {+foaf:currentProject !isDefinedBy} or **pastProject** {+foaf:pastProject !isDefinedBy}.

### Project {=foaf:Project .Class .owl:Class label}

> A project (a collective endeavour of some kind). {comment}

[testing] {vs:term_status}

Project is not a [Document] {+foaf:Document ?owl:disjointWith} and not a [Person] {+foaf:Person ?owl:disjointWith}.

Projects model collaborative activities and shared undertakings as entities that can be linked to people and organizations. 

### current project {=foaf:currentProject .owl:ObjectProperty .rdf:Property label}

> A current project this person works on. {comment}

[testing] {vs:term_status}

Connects a [Person] {+foaf:Person ?domain} to a [Thing] {+owl:Thing ?range} they are doing now.

Expresses active involvement by a person in an ongoing project.

### past project {=foaf:pastProject .owl:ObjectProperty .rdf:Property label}

> A project this person has previously worked on. {comment}

[testing] {vs:term_status}

Connect a [Person] {+foaf:Person ?domain} to a [Thing] {+owl:Thing ?range} they were working on in the past.

Captures historical involvement with a project that is no longer current.

## The Digital Footprint
========================

To bridge physical entities with their virtual actions, [FOAF] {=foaf:} provides an extensive framework for classifying **Online Accounts** {+OnlineAccount !isDefinedBy}. Rather than flattening account usernames into simple string attributes on a person, FOAF models an account as a standalone resource with a dedicated service home, separating real-world network actors from their provider spaces.

### Online Account {=foaf:OnlineAccount .Class .owl:Class label}
[An online account.] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?subClassOf}

A structured account resource representing credentials, service URLs, or provider identity.

### Online Chat Account {=foaf:OnlineChatAccount .Class .owl:Class label}
[An online chat account.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?subClassOf}

Models instant messaging accounts as typed resources.

### Online E-commerce Account {=foaf:OnlineEcommerceAccount .Class .owl:Class label}
[An online e-commerce account.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?subClassOf}

Represents retail or payment-related online identities.

### Online Gaming Account {=foaf:OnlineGamingAccount .Class .owl:Class label}
[An online gaming account.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?subClassOf}

Represents gaming profile identities with separate semantics.

### account {=foaf:account .owl:ObjectProperty .rdf:Property label}
[Indicates an account held by this agent.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?range}

Links an agent to a structured online account resource.

### account name {=foaf:accountName .owl:DatatypeProperty .rdf:Property label}
[Indicates the name (identifier) associated with this online account.] {comment}
[testing] {vs:term_status}
[Online Account] {+foaf:OnlineAccount ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

The identifier string associated with an account, such as a username.

### account service homepage {=foaf:accountServiceHomepage .owl:ObjectProperty .rdf:Property label}
[Indicates a homepage of the service provide for this online account.] {comment}
[testing] {vs:term_status}
[Online Account] {+foaf:OnlineAccount ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

A service homepage for the online provider behind the account.

### openid {=foaf:openid .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[An OpenID for an Agent.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[is primary topic of] {+foaf:isPrimaryTopicOf ?subPropertyOf}

A unique federated identity used to authenticate an agent across services.

### personal mailbox {=foaf:mbox .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A  personal mailbox, ie. an Internet mailbox associated with exactly one owner, the first owner of this mailbox. This is a 'static inverse functional property', in that  there is (across time and change) at most one individual that ever has any particular value for foaf:mbox.] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

A unique mailbox URI used as a global identifier for an agent.

### sha1sum of a personal mailbox URI name {=foaf:mbox_sha1sum .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[The sha1sum of the URI of an Internet mailbox associated with exactly one owner, the  first owner of the mailbox.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A hashed mailbox identifier useful for privacy-preserving agent references.

### phone {=foaf:phone .owl:ObjectProperty .rdf:Property label}

> A phone,  specified using fully qualified tel: URI scheme (refs: http://www.w3.org/Addressing/schemes.html#tel). {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}


## Documents, Publishing & Web Spaces
======================================

Information delivery and publishing context are modeled in [FOAF] {=foaf:} via the **Document** {+Document !isDefinedBy} class. This section governs how resources link out to contextual hubs like personal blogs, corporate web instances, project definitions, or structured cryptographic checksum pointers.

### Document {=foaf:Document .Class .owl:Class label}
[A document.] {comment}
[stable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Organization] {+foaf:Organization ?owl:disjointWith}
[Project] {+foaf:Project ?owl:disjointWith}
[schema:CreativeWork] {+schema:CreativeWork ?owl:equivalentClass}

A generic web or publication resource used as the target of FOAF web and document relations.

### PersonalProfileDocument {=foaf:PersonalProfileDocument .Class .owl:Class label}
[A personal profile RDF document.] {comment}
[testing] {vs:term_status}
[Document] {+foaf:Document ?subClassOf}

A specialized document class for personal FOAF profiles.

### homepage {=foaf:homepage .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A homepage for some thing.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[is primary topic of] {+foaf:isPrimaryTopicOf ?subPropertyOf}
[page] {+foaf:page ?subPropertyOf}

A unique primary web page used to identify an entity online.

### weblog {=foaf:weblog .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A weblog of some thing (whether person, group, company etc.).] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[page] {+foaf:page ?subPropertyOf}

A blog or web log resource linked to an agent.

### page {=foaf:page .owl:ObjectProperty .rdf:Property label}
[A page or document about this thing.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[topic] {+foaf:topic ?owl:inverseOf}

A generic document or page related to a thing.

### publications {=foaf:publications .owl:ObjectProperty .rdf:Property label}
[A link to the publications of this person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

Links a person to their published works.

### schoolHomepage {=foaf:schoolHomepage .owl:ObjectProperty .rdf:Property label}
[A homepage of a school attended by the person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

A school homepage associated with a person.

### work info homepage {=foaf:workInfoHomepage .owl:ObjectProperty .rdf:Property label}
[A work info homepage of some person; a page about their work for some organization.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

A professional work page about a person’s role or organization.

### workplace homepage {=foaf:workplaceHomepage .owl:ObjectProperty .rdf:Property label}
[A workplace homepage of some person; the homepage of an organization they work for.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

A workplace web page associated with a person.

### interest {=foaf:interest .owl:ObjectProperty .rdf:Property label}
[A page about a topic of interest to this person.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

Links an agent to a page that represents something they find interesting.

### topic {=foaf:topic .owl:ObjectProperty .rdf:Property label}
[A topic of some page or document.] {comment}
[testing] {vs:term_status}
[Document] {+foaf:Document ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[page] {+foaf:page ?owl:inverseOf}

Connects a document to the subject it covers.

### topic_interest {=foaf:topic_interest .owl:ObjectProperty .rdf:Property label}
[A thing of interest to this person.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

Defines a thing that is of interest to an agent.

### focus {=foaf:focus .owl:ObjectProperty .rdf:Property label}
[The underlying or 'focal' entity associated with some SKOS-described concept.] {comment}
[testing] {vs:term_status}
[Concept] {+http://www.w3.org/2004/02/skos/core#Concept ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

Relates a SKOS concept to the entity that it describes.

### sha1sum (hex) {=foaf:sha1 .owl:DatatypeProperty .rdf:Property label}
[A sha1sum hash, in hex.] {comment}
[unstable] {vs:term_status}
[Document] {+foaf:Document ?domain}
[foaf:] {+foaf: ?isDefinedBy}

A document-level checksum reference used for identifying content fingerprints.

### tipjar {=foaf:tipjar .owl:ObjectProperty .rdf:Property label}
[A tipjar document for this agent, describing means for payment and reward.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[page] {+foaf:page ?subPropertyOf}

Links an agent to a payment or reward document.


## Depictions & Creative Artifacts
==================================

Graphs become rich media environments through depiction mappings and simple tracking of creative provenance. [FOAF] {=foaf:} sets up directional, inverse properties to track both the visual assets illustrating a node and the agency trails defining who built it.

### Image {=foaf:Image .Class .owl:Class label}
[An image.] {comment}
[stable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?subClassOf}
[schema:ImageObject] {+schema:ImageObject ?owl:equivalentClass}

Image is the FOAF class used for visual media that depicts or represents a thing.

### logo {=foaf:logo .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A logo representing some thing.] {comment}
[testing] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

A visual mark or badge representing an entity.

### depiction {=foaf:depiction .owl:ObjectProperty .rdf:Property label}
[A depiction of some thing.] {comment}
[testing] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Image] {+foaf:Image ?range}
[depicts] {+foaf:depicts ?owl:inverseOf}

Links a resource to an image that depicts it.

### depicts {=foaf:depicts .owl:ObjectProperty .rdf:Property label}
[A thing depicted in this representation.] {comment}
[testing] {vs:term_status}
[Image] {+foaf:Image ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[depiction] {+foaf:depiction ?owl:inverseOf}

Links an image to the thing it depicts.

### image {=foaf:img .owl:ObjectProperty .rdf:Property label}
[An image that can be used to represent some thing (ie. those depictions which are particularly representative of something, eg. one's photo on a homepage).] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Image] {+foaf:Image ?range}
[depiction] {+foaf:depiction ?subPropertyOf}

A common property for an image that represents a person or thing.

### thumbnail {=foaf:thumbnail .owl:ObjectProperty .rdf:Property label}
[A derived thumbnail image.] {comment}
[testing] {vs:term_status}
[Image] {+foaf:Image ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Image] {+foaf:Image ?range}

A smaller image representation derived from a larger image.

### made {=foaf:made .owl:ObjectProperty .rdf:Property label}
[Something that was made by this agent.] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[maker] {+foaf:maker ?owl:inverseOf}

Indicates creative provenance from an agent to a thing they produced.

### maker {=foaf:maker .owl:ObjectProperty .rdf:Property label}
[An agent that  made this thing.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Agent] {+foaf:Agent ?range}
[http://purl.org/dc/terms/creator] {+http://purl.org/dc/terms/creator ?owl:equivalentProperty}
[made] {+foaf:made ?owl:inverseOf}

Traces the origin of a thing back to the producing agent.

## Deprecated and Historical Profile Properties
===============================================

[FOAF] {=foaf:} has a long history and many old and abandoned terms that are kept around for backwards compatibility. They are marked as `archaic`: *fundedBy* {+foaf:fundedBy !isDefinedBy}, *theme* {+foaf:theme !isDefinedBy}

### funded by {=foaf:fundedBy .owl:ObjectProperty .rdf:Property label}

> An organization funding a project or person. {comment}

[archaic] {vs:term_status}

Connects two [Things] {+owl:Thing ?domain ?range}. An older property for financial support relationships, preserved here for legacy FOAF graphs.

### theme {=foaf:theme .owl:ObjectProperty .rdf:Property label}

> A theme. {comment}

[archaic] {vs:term_status}

Connects two [Things] {+owl:Thing ?domain ?range}

A legacy document theme property preserved for historical FOAF graphs.

### family_name {=foaf:family_name .owl:DatatypeProperty .rdf:Property label}
[The family name of some person.] {comment}
[archaic] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

An older family name property retained for legacy FOAF data.

### Given name {=foaf:givenName .owl:DatatypeProperty .rdf:Property label}
[The given name of some person.] {comment}
[archaic] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

A deprecated spelling variant of givenName.

### Surname {=foaf:surname .owl:DatatypeProperty .rdf:Property label}
[The surname of some person.] {comment}
[archaic] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

An older synonym for familyName.

### geekcode {=foaf:geekcode .owl:DatatypeProperty .rdf:Property label}
[A textual geekcode for this person, see http://www.geekcode.com/geek.html] {comment}
[archaic] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A playful legacy property for old social profiles.

### DNA checksum {=foaf:dnaChecksum .owl:DatatypeProperty .rdf:Property label}
[A checksum for the DNA of some thing. Joke.] {comment}
[archaic] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A humorous legacy property, preserved only for historical FOAF content.

### AIM chat ID {=foaf:aimChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[An AIM chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

A legacy IM handle for AIM.

### jabber ID {=foaf:jabberID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[A jabber ID for something.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

A Jabber/XMPP handle for an agent.

### ICQ chat ID {=foaf:icqChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[An ICQ chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

A legacy chat handle for ICQ.

### MSN chat ID {=foaf:msnChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[An MSN chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

A legacy chat handle for MSN.

### Yahoo chat ID {=foaf:yahooChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[A Yahoo chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

A legacy chat handle for Yahoo Messenger.

### Skype ID {=foaf:skypeID .owl:DatatypeProperty .rdf:Property label}
[A Skype ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

A chat handle for Skype.

### account {=foaf:holdsAccount .owl:ObjectProperty .rdf:Property label}
[Indicates an account held by this agent.] {comment}
[archaic] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?range}

An older form of the account relationship, preserved for compatibility.