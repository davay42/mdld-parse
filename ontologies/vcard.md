[vc] <http://www.w3.org/2006/vcard/ns>
[vcard] <http://www.w3.org/2006/vcard/ns#>
[owl] <http://www.w3.org/2002/07/owl#>
[solid] <https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl>

# Ontology for vCard {=vc: .owl:Ontology label @en}

> Ontology for vCard based on RFC6350 {comment @en}

[Final] {owl:versionInfo @en}

The vCard ontology maps the IETF RFC 6350 contact card standard into RDF. Where RFC 6350 defines a text-based format for exchanging contact data (.vcf files), this ontology provides the same structure as linked data classes and properties. It is the primary contact vocabulary used by the Solid ecosystem, CardDAV servers, and interoperability layers between Apple, Google, and Microsoft contact systems. The central concept is **Kind** {+vcard:Kind}, the parent class for the four disjoint entity types — **Individual** {+vcard:Individual}, **Organization** {+vcard:Organization}, **Location** {+vcard:Location}, and **Group** {+vcard:Group} — with **VCard** {+vcard:VCard} as its historical alias.

## Identity & Entity Types
=======================

[vCard] {=vc:} defines [Kind] {+vcard:Kind !isDefinedBy} as the parent class for the four disjoint entity types — [Individual] {+vcard:Individual !isDefinedBy}, [Organization] {+vcard:Organization !isDefinedBy}, [Location] {+vcard:Location !isDefinedBy}, and [Group] {+vcard:Group !isDefinedBy} — with [VCard] {+vcard:VCard !isDefinedBy} as its historical alias. Every contact record is exactly one of these types. The `fn` (formatted name) property is mandatory on every Kind instance — it is the single required field in RFC 6350.

###
### Kind {=vcard:Kind .owl:Class label @en}

> The parent class for all objects {comment @en}

[VCard] {+vcard:VCard ?owl:equivalentClass}

Kind is the root class of the vCard type hierarchy. Every vCard entity — person, organization, place, or group — is a Kind. The historical name "VCard" is equivalent; new implementations should prefer Kind to avoid confusion with the .vcf file format itself.

### Individual {=vcard:Individual .owl:Class label @en}

> An object representing a single person or entity {comment @en}

[Kind] {+vcard:Kind ?subClassOf}
[Location] {+vcard:Location ?owl:disjointWith}
[Organization] {+vcard:Organization ?owl:disjointWith}

An Individual represents a single person or entity — the most common vCard type. It is disjoint with Location and Organization, meaning a contact cannot be both an Individual and an Organization simultaneously.

### Organization {=vcard:Organization .owl:Class label @en}

~~~
An object representing an organization.  An organization is a single entity, and might represent a business or government, a department or division within a business or government, a club, an association, or the like.
~~~
{comment @en}

[Kind] {+vcard:Kind ?subClassOf}
[Location] {+vcard:Location ?owl:disjointWith}

An Organization is a single structured entity — a company, government body, club, or association. It is disjoint with both Individual and Location.

### Location {=vcard:Location .owl:Class label @en}

> An object representing a named geographical place {comment @en}

[Kind] {+vcard:Kind ?subClassOf}
[Organization] {+vcard:Organization ?owl:disjointWith}

A Location represents a named geographical place — an office, a venue, a landmark. It is disjoint with both Individual and Organization.

### Group {=vcard:Group .owl:Class label @en}

> Object representing a group of persons or entities.  A group object will usually contain hasMember properties to specify the members of the group. {comment @en}

[Kind] {+vcard:Kind ?subClassOf}
[Individual] {+vcard:Individual ?owl:disjointWith}
[Location] {+vcard:Location ?owl:disjointWith}
[Organization] {+vcard:Organization ?owl:disjointWith}

A Group represents a collection of persons or entities. Unlike the other three Kind subclasses, a Group has no standalone identity — its meaning comes from its members via `vcard:hasMember`. It is disjoint with Individual, Location, and Organization.

### VCard {=vcard:VCard .owl:Class label @en}

> The vCard class is equivalent to the new Kind class, which is the parent for the four explicit types of vCards (Individual, Organization, Location, Group) {comment @en}

[Kind] {+vcard:Kind ?owl:equivalentClass}

VCard is the historical name for Kind, retained for backward compatibility. New implementations should use Kind as the primary class name.

## Personal Names
==============

[vCard] {=vc:} models names with both a simple formatted string ([fn] {+vcard:fn !isDefinedBy}) and a structured decomposition using the [Name] {+vcard:Name !isDefinedBy} class linked via [hasName] {+vcard:hasName !isDefinedBy}. The structured components are [given-name] {+vcard:given-name !isDefinedBy}, [family-name] {+vcard:family-name !isDefinedBy}, [additional-name] {+vcard:additional-name !isDefinedBy}, [honorific-prefix] {+vcard:honorific-prefix !isDefinedBy}, and [honorific-suffix] {+vcard:honorific-suffix !isDefinedBy}. Each data property also has a corresponding `has*` object property — [hasFN] {+vcard:hasFN !isDefinedBy}, [hasGivenName] {+vcard:hasGivenName !isDefinedBy}, [hasFamilyName] {+vcard:hasFamilyName !isDefinedBy}, [hasAdditionalName] {+vcard:hasAdditionalName !isDefinedBy}, [hasHonorificPrefix] {+vcard:hasHonorificPrefix !isDefinedBy}, [hasHonorificSuffix] {+vcard:hasHonorificSuffix !isDefinedBy} — that supports RFC 6350 property parameters. [nickname] {+vcard:nickname !isDefinedBy} and [hasNickname] {+vcard:hasNickname !isDefinedBy} provide informal name support.

###
### formatted name {=vcard:fn .owl:DatatypeProperty label @en}

> The formatted text corresponding to the name of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The single required property on every vCard Kind. `fn` holds the full display name as it should appear in a contact list — "Dr. Jane Smith" rather than separate given/family components. This is the mandatory field in RFC 6350.

### has formatted name {=vcard:hasFN .owl:ObjectProperty label @en}

> Used to support property parameters for the formatted name data property {comment @en}


The object property version of `fn`, supporting RFC 6350 property parameters like type, language, and preference. Use this when you need to attach parameters to the formatted name value.

### Name {=vcard:Name .owl:Class label @en}

> To specify the components of the name of the object {comment @en}


A structured name resource that decomposes a person's name into its component parts: given name, family name, additional names, and honorific prefixes/suffixes. Link to it via `vcard:hasName`.

### has name {=vcard:hasName .owl:ObjectProperty label @en}

> To specify the components of the name of the object {comment @en}

[Name] {+vcard:Name ?range}
[name] {+vcard:n ?owl:equivalentProperty}

Links a Kind to a structured Name resource. The equivalent property `vcard:n` is the legacy name from earlier vCard RDF mappings.

### given name {=vcard:given-name .owl:DatatypeProperty label @en}

> The given name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

The person's first or given name — "Jane" in "Dr. Jane Smith".

### has given name {=vcard:hasGivenName .owl:ObjectProperty label @en}

> Used to support property parameters for the given name data property {comment @en}


Object property version supporting RFC 6350 parameters on given names.

### family name {=vcard:family-name .owl:DatatypeProperty label @en}

> The family name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

The person's family name or surname — "Smith" in "Dr. Jane Smith".

### has family name {=vcard:hasFamilyName .owl:ObjectProperty label @en}

> Used to support property parameters for the family name data property {comment @en}


Object property version supporting RFC 6350 parameters on family names.

### additional name {=vcard:additional-name .owl:DatatypeProperty label @en}

> The additional name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

Middle names, patronymics, and other name components that fall between given and family names. Multiple additional names are allowed.

### has additional name {=vcard:hasAdditionalName .owl:ObjectProperty label @en}

> Used to support property parameters for the additional name data property {comment @en}


Object property version supporting RFC 6350 parameters on additional names.

### honorific prefix {=vcard:honorific-prefix .owl:DatatypeProperty label @en}

> The honorific prefix of the name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

Titles that precede a name — "Dr.", "Prof.", "Mr.", "Ms.", "Hon.".

### has honorific prefix {=vcard:hasHonorificPrefix .owl:ObjectProperty label @en}

> Used to support property parameters for the honorific prefix data property {comment @en}


Object property version supporting RFC 6350 parameters on honorific prefixes.

### honorific suffix {=vcard:honorific-suffix .owl:DatatypeProperty label @en}

> The honorific suffix of the name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

Designations that follow a name — "Ph.D.", "M.D.", "Jr.", "III", "CBE".

### has honorific suffix {=vcard:hasHonorificSuffix .owl:ObjectProperty label @en}

> Used to support property parameters for the honorific suffix data property {comment @en}


Object property version supporting RFC 6350 parameters on honorific suffixes.

### nickname {=vcard:nickname .owl:DatatypeProperty label @en}

> The nick name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

An informal or familiar name — "Bob" for Robert, "Babs" for Barbara.

### has nickname {=vcard:hasNickname .owl:ObjectProperty label @en}

> Used to support property parameters for the nickname data property {comment @en}

[nickname] {+vcard:nickname ?seeAlso}

Object property version. The `seeAlso` link to the data property helps tools discover both forms.

## Contact Channels
================

[vCard] {=vc:} provides structured properties for the primary communication channels: [hasEmail] {+vcard:hasEmail !isDefinedBy} for electronic mail, [hasTelephone] {+vcard:hasTelephone !isDefinedBy} for telephony, and [hasInstantMessage] {+vcard:hasInstantMessage !isDefinedBy} for instant messaging and presence protocols. Each channel has a richer object property that supports typed resources and RFC 6350 parameters.

###
### has email {=vcard:hasEmail .owl:ObjectProperty label @en}

> To specify the electronic mail address for communication with the object {comment @en}

[Email] {+vcard:Email ?range}

The primary email property. Links a Kind to an Email resource, supporting RFC 6350 parameters like type (home, work) and preference.

### has telephone {=vcard:hasTelephone .owl:ObjectProperty label @en}

> To specify the telephone number for telephony communication with the object {comment @en}

[telephone] {+vcard:tel ?owl:equivalentProperty}

Links a Kind to a telephone resource. The type of phone (cell, fax, voice, video, text) is indicated by the TelephoneType subclasses. The legacy property `vcard:tel` is equivalent.

### has messaging {=vcard:hasInstantMessage .owl:ObjectProperty label @en}

> To specify the instant messaging and presence protocol communications with the object. (Was called IMPP in RFC6350) {comment @en}


Links a Kind to an instant messaging handle. In RFC 6350 this was the IMPP property, representing XMPP, IRC, or other presence protocol addresses.

## Address Structure
=================

[vCard] {=vc:} models postal addresses as structured resources using the [Address] {+vcard:Address !isDefinedBy} class, linked via [hasAddress] {+vcard:hasAddress !isDefinedBy}. Individual components are separate data properties: [street-address] {+vcard:street-address !isDefinedBy}, [locality] {+vcard:locality !isDefinedBy}, [region] {+vcard:region !isDefinedBy}, [postal-code] {+vcard:postal-code !isDefinedBy}, and [country-name] {+vcard:country-name !isDefinedBy}. Each also has a `has*` object property for RFC 6350 parameter support: [hasStreetAddress] {+vcard:hasStreetAddress !isDefinedBy}, [hasLocality] {+vcard:hasLocality !isDefinedBy}, [hasRegion] {+vcard:hasRegion !isDefinedBy}, [hasPostalCode] {+vcard:hasPostalCode !isDefinedBy}, and [hasCountryName] {+vcard:hasCountryName !isDefinedBy}.

###
### Address {=vcard:Address .owl:Class label @en}

> To specify the components of the delivery address for the object {comment @en}


A structured delivery address resource. An Address instance holds the individual address components (street, city, region, postal code, country) as separate data properties. Link to it via `vcard:hasAddress`.

### has address {=vcard:hasAddress .owl:ObjectProperty label @en}

> To specify the components of the delivery address for the object {comment @en}

[Address] {+vcard:Address ?range}

Links a Kind to a structured Address resource. The equivalent property `vcard:adr` is the legacy name from earlier vCard RDF mappings.

### street address {=vcard:street-address .owl:DatatypeProperty label @en}

> The street address associated with the address of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The street address component — "123 Main Street", "Suite 400".

### has street address {=vcard:hasStreetAddress .owl:ObjectProperty label @en}

> Used to support property parameters for the street address data property {comment @en}


Object property version supporting RFC 6350 parameters on street addresses.

### locality {=vcard:locality .owl:DatatypeProperty label @en}

> The locality (e.g. city or town) associated with the address of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The city or town component — "San Francisco", "London".

### has locality {=vcard:hasLocality .owl:ObjectProperty label @en}

> Used to support property parameters for the locality data property {comment @en}


Object property version supporting RFC 6350 parameters on localities.

### region {=vcard:region .owl:DatatypeProperty label @en}

> The region (e.g. state or province) associated with the address of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The state, province, or region component — "California", "Ontario".

### has region {=vcard:hasRegion .owl:ObjectProperty label @en}

> Used to support property parameters for the region data property {comment @en}


Object property version supporting RFC 6350 parameters on regions.

### postal code {=vcard:postal-code .owl:DatatypeProperty label @en}

> The postal code associated with the address of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The ZIP, postal, or postcode component — "94105", "SW1A 1AA".

### has postal code {=vcard:hasPostalCode .owl:ObjectProperty label @en}

> Used to support property parameters for the postal code data property {comment @en}


Object property version supporting RFC 6350 parameters on postal codes.

### country name {=vcard:country-name .owl:DatatypeProperty label @en}

> The country name associated with the address of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The country component — "United States", "Germany". ISO 3166-1 country codes are recommended but not required.

### has country name {=vcard:hasCountryName .owl:ObjectProperty label @en}

> Used to support property parameters for the country name data property {comment @en}


Object property version supporting RFC 6350 parameters on country names.

## Telephone Types
===============

[vCard] {=vc:} types telephone numbers using the [TelephoneType] {+vcard:TelephoneType !isDefinedBy} controlled vocabulary. Active types are [Cell] {+vcard:Cell !isDefinedBy} (mobile), [Voice] {+vcard:Voice !isDefinedBy} (landline), [Fax] {+vcard:Fax !isDefinedBy} (facsimile), [Video] {+vcard:Video !isDefinedBy} (video call), [Text] {+vcard:Text !isDefinedBy} (SMS), [TextPhone] {+vcard:TextPhone !isDefinedBy} (TDD/TTY), and [Pager] {+vcard:Pager !isDefinedBy}. Each type is a subclass of TelephoneType and can be combined on a single telephone resource.

###
### Phone {=vcard:TelephoneType .owl:Class label @en}

> Used for telephone type codes. The URI of the telephone type code must be used as the value for the Telephone Type. {comment @en}


The parent class for all telephone type codes. Use the URI of a specific TelephoneType subclass (e.g., `vcard:Cell`) as the value when typing a telephone resource.

### Cell {=vcard:Cell .owl:Class label @en}

> Also called mobile telephone {comment @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

A mobile or cellular telephone number — the most common phone type in 2026.

### Voice {=vcard:Voice .owl:Class label @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

A voice telephone number — a standard landline or voice-capable line.

### Fax {=vcard:Fax .owl:Class label @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

A facsimile telephone number. Still used in legal and medical contexts.

### Video {=vcard:Video .owl:Class label @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

A video-capable telephone number — for video calling systems that use phone-number addressing.

### Text {=vcard:Text .owl:Class label @en}

> Also called sms telephone {comment @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

An SMS-capable telephone number. Distinct from Voice because some numbers are SMS-only.

### Text phone {=vcard:TextPhone .owl:Class label @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

A TDD/TTY text telephone number for hearing-impaired communication.

### Pager {=vcard:Pager .owl:Class label @en}

[Phone] {+vcard:TelephoneType ?subClassOf}

A pager number. Rare in 2026 but retained for legacy system interop.

## Gender & Personal Details
=========================

[vCard] {=vc:} models gender as a controlled vocabulary through the [Gender] {+vcard:Gender !isDefinedBy} class and [hasGender] {+vcard:hasGender !isDefinedBy} property. The gender codes are [Male] {+vcard:Male !isDefinedBy}, [Female] {+vcard:Female !isDefinedBy}, [Other] {+vcard:Other !isDefinedBy}, [None] {+vcard:None !isDefinedBy}, and [Unknown] {+vcard:Unknown !isDefinedBy}. Personal lifecycle dates use [bday] {+vcard:bday !isDefinedBy} (birth date) and [anniversary] {+vcard:anniversary !isDefinedBy}, which accept multiple date formats for flexible precision.

###
### Gender {=vcard:Gender .owl:Class label @en}

> Used for gender codes. The URI of the gender code must be used as the value for Gender. {comment @en}


The parent class for gender codes. Use the URI of a specific Gender subclass (e.g., `vcard:Female`) as the value for `vcard:hasGender`. This controlled vocabulary approach enables consistent cross-system gender representation.

### has gender {=vcard:hasGender .owl:ObjectProperty label @en}

> To specify  the sex or gender identity of the object. URIs are recommended to enable interoperable sex and gender codes to be used. {comment @en}


Links a Kind to a Gender subclass URI. The use of URIs rather than free text allows interoperable gender coding across systems, including values beyond the traditional male/female binary.

### Male {=vcard:Male .owl:Class label @en}

[Gender] {+vcard:Gender ?subClassOf}

### Female {=vcard:Female .owl:Class label @en}

[Gender] {+vcard:Gender ?subClassOf}

### Other {=vcard:Other .owl:Class label @en}

[Gender] {+vcard:Gender ?subClassOf}

A gender value that does not fit Male or Female — encompasses non-binary, genderqueer, and other gender identities not represented by the other codes.

### None {=vcard:None .owl:Class label @en}

[Gender] {+vcard:Gender ?subClassOf}

The person or entity does not have a gender or it is not applicable (e.g., an Organization).

### Unknown {=vcard:Unknown .owl:Class label @en}

[Gender] {+vcard:Gender ?subClassOf}

The gender is not known — a deliberate statement of ignorance rather than absence.

### birth date {=vcard:bday .owl:DatatypeProperty label @en}

> To specify the birth date of the object {comment @en}


The date of birth. Accepts multiple date formats: full date-time, date-time stamp, or just a year — allowing different levels of precision depending on privacy requirements.

### anniversary {=vcard:anniversary .owl:DatatypeProperty label @en}

> The date of marriage, or equivalent, of the object {comment @en}


The date of marriage or equivalent commitment. Like bday, it accepts date-time or year-only values for flexible precision.

## Relationships & Social Taxonomy
===============================

[vCard] {=vc:} models interpersonal relationships through the [RelatedType] {+vcard:RelatedType !isDefinedBy} controlled vocabulary and [hasRelated] {+vcard:hasRelated !isDefinedBy} property. Family relationships: [Child] {+vcard:Child !isDefinedBy}, [Parent] {+vcard:Parent !isDefinedBy}, [Sibling] {+vcard:Sibling !isDefinedBy}, [Kin] {+vcard:Kin !isDefinedBy}, [Spouse] {+vcard:Spouse !isDefinedBy}, [Sweetheart] {+vcard:Sweetheart !isDefinedBy}. Social: [Friend] {+vcard:Friend !isDefinedBy}, [Acquaintance] {+vcard:Acquaintance !isDefinedBy}, [Met] {+vcard:Met !isDefinedBy}, [Crush] {+vcard:Crush !isDefinedBy}, [Muse] {+vcard:Muse !isDefinedBy}, [Date] {+vcard:Date !isDefinedBy}. Professional & civic: [Colleague] {+vcard:Colleague !isDefinedBy}, [Coworker] {+vcard:Coworker !isDefinedBy}, [Coresident] {+vcard:Coresident !isDefinedBy}, [Neighbor] {+vcard:Neighbor !isDefinedBy}, [Contact] {+vcard:Contact !isDefinedBy}, [Emergency] {+vcard:Emergency !isDefinedBy}, [Agent] {+vcard:Agent !isDefinedBy}, [Me] {+vcard:Me !isDefinedBy}.

###
### Relation Type {=vcard:RelatedType .owl:Class label @en}

> Used for relation type codes. The URI of the relation type code must be used as the value for the Relation Type. {comment @en}


The parent class for all relationship type codes. Use the URI of a specific RelatedType subclass (e.g., `vcard:Friend`) as the value when typing a related resource.

### has related {=vcard:hasRelated .owl:ObjectProperty label @en}

> To specify a relationship between another entity and the entity represented by this object {comment @en}


Links a Kind to another entity with which it has a relationship. The nature of the relationship is specified by the RelatedType subclass used.

#### Family Relationships

### Child {=vcard:Child .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Parent {=vcard:Parent .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Sibling {=vcard:Sibling .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Kin {=vcard:Kin .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A general family relationship not captured by Child, Parent, or Sibling — extended family, cousins, etc.

### Spouse {=vcard:Spouse .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Sweetheart {=vcard:Sweetheart .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A romantic partner who is not a spouse.

#### Social Relationships

### Friend {=vcard:Friend .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Acquaintance {=vcard:Acquaintance .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person known less closely than a Friend — someone you recognize but may not socialize with regularly.

### Met {=vcard:Met .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person you have met, without implying any deeper social connection.

### Crush {=vcard:Crush .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Muse {=vcard:Muse .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person who serves as a source of inspiration.

### Date {=vcard:Date .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person the subject is dating — a romantic contact at an earlier stage than Sweetheart.

#### Professional & Civic Relationships

### Colleague {=vcard:Colleague .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Coworker {=vcard:Coworker .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

Distinguished from Colleague: a Coworker shares the same workplace, while a Colleague shares the same profession but not necessarily the same employer.

### Coresident {=vcard:Coresident .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person who shares the same residence — a roommate, flatmate, or housemate.

### Neighbor {=vcard:Neighbor .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

### Contact {=vcard:Contact .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A generic contact — someone you know but whose relationship does not fit a more specific category.

### Emergency {=vcard:Emergency .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person to contact in case of emergency — the "ICE" contact on phone lock screens.

### Agent {=vcard:Agent .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A person who acts as an agent or representative — a talent agent, power of attorney, or legal representative.

### Me {=vcard:Me .owl:Class label @en}

[Relation Type] {+vcard:RelatedType ?subClassOf}

A self-referential relationship — the entity is the same person as the subject. Useful in merged address books to link duplicate entries.

## Group Membership
================

[vCard] {=vc:} Groups are defined by their members. The [hasMember] {+vcard:hasMember !isDefinedBy} property links a Group to its constituent Kinds, with domain and range constraints that restrict membership to proper vCard entities.

###
### has member {=vcard:hasMember .owl:ObjectProperty label @en}

> To include a member in the group this object represents. (This property can only be used by Group individuals) {comment @en}

[Group] {+vcard:Group ?domain}
[Kind] {+vcard:Kind ?range}

The primary membership property. It links a Group to the Kinds it contains. The domain constraint (Group) means only Group instances can have members. The range constraint (Kind) means members must be vCard entities.

## Organization & Professional Identity
====================================

[vCard] {=vc:} captures professional identity through [organization-name] {+vcard:organization-name !isDefinedBy} and its object property [hasOrganizationName] {+vcard:hasOrganizationName !isDefinedBy}, the sub-property [organization-unit] {+vcard:organization-unit !isDefinedBy} with [hasOrganizationUnit] {+vcard:hasOrganizationUnit !isDefinedBy}, [role] {+vcard:role !isDefinedBy} with [hasRole] {+vcard:hasRole !isDefinedBy}, and [title] {+vcard:title !isDefinedBy} with [hasTitle] {+vcard:hasTitle !isDefinedBy}.

###
### organization name {=vcard:organization-name .owl:DatatypeProperty label @en}

> To specify the organizational name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

The name of the organization the person belongs to — "Acme Corp", "Stanford University".

### has organization name {=vcard:hasOrganizationName .owl:ObjectProperty label @en}

> Used to support property parameters for the organization name data property {comment @en}


Object property version supporting RFC 6350 parameters on organization names.

### organizational unit name {=vcard:organization-unit .owl:DatatypeProperty label @en}

> To specify the organizational unit name associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}
[organization name] {+vcard:organization-name ?subPropertyOf}

The name of a specific unit within the organization — "Department of Physics", "Sales Division". It is a sub-property of organization-name, meaning any organizational unit name is also an organization name.

### has organization unit name {=vcard:hasOrganizationUnit .owl:ObjectProperty label @en}

> Used to support property parameters for the organization unit name data property {comment @en}


Object property version supporting RFC 6350 parameters on organizational unit names.

### role {=vcard:role .owl:DatatypeProperty label @en}

> To specify the function or part played in a particular situation by the object {comment @en}

[xsd:string] {+xsd:string ?range}

The function or part played by the person — "Project Lead", "Researcher", "CEO". Distinct from title (the position) and organization-name (the employer).

### has role {=vcard:hasRole .owl:ObjectProperty label @en}

> Used to support property parameters for the role data property {comment @en}


Object property version supporting RFC 6350 parameters on roles.

### title {=vcard:title .owl:DatatypeProperty label @en}

> To specify the position or job of the object {comment @en}

[xsd:string] {+xsd:string ?range}

The position or job title — "Vice President", "Senior Engineer", "Director". Distinct from honorific-prefix (Dr., Prof.) which is a name component, and from role which describes function.

### has title {=vcard:hasTitle .owl:ObjectProperty label @en}

> Used to support property parameters for the title data property {comment @en}


Object property version supporting RFC 6350 parameters on titles.

## Media, Geo & Web Presence
=========================

[vCard] {=vc:} links entities to visual and geographic representations through [hasPhoto] {+vcard:hasPhoto !isDefinedBy}, [hasLogo] {+vcard:hasLogo !isDefinedBy}, [hasGeo] {+vcard:hasGeo !isDefinedBy}, [hasURL] {+vcard:hasURL !isDefinedBy}, and [hasSound] {+vcard:hasSound !isDefinedBy}. Each has a legacy equivalent property for backward compatibility.

###
### has photo {=vcard:hasPhoto .owl:ObjectProperty label @en}

> To specify an image or photograph information that annotates some aspect of the object {comment @en}

[photo] {+vcard:photo ?owl:equivalentProperty}

A photograph of the entity. The equivalent property `vcard:photo` is the legacy name.

### has logo {=vcard:hasLogo .owl:ObjectProperty label @en}

> To specify a graphic image of a logo associated with the object {comment @en}

[logo] {+vcard:logo ?owl:equivalentProperty}

A logo representing the entity — particularly relevant for Organization kinds.

### has geo {=vcard:hasGeo .owl:ObjectProperty label @en}

> To specify information related to the global positioning of the object. May also be used as a property parameter. {comment @en}


Geographic positioning information for the entity. Can also be used as a property parameter on addresses to specify altitude and other geo metadata. The equivalent property `vcard:geo` is the legacy name.

### has url {=vcard:hasURL .owl:ObjectProperty label @en}

> To specify a uniform resource locator associated with the object {comment @en}

[url] {+vcard:url ?owl:equivalentProperty}

A URL associated with the entity — a homepage, social profile, or any web resource. The equivalent property `vcard:url` is the legacy name.

### has sound {=vcard:hasSound .owl:ObjectProperty label @en}

> To specify a digital sound content information that annotates some aspect of the object {comment @en}

[sound] {+vcard:sound ?owl:equivalentProperty}

A digital sound clip associated with the entity — a pronunciation of the name, or an audio logo.

## Calendar & Scheduling
=====================

[vCard] {=vc:} includes three calendar-related properties: [hasCalendarLink] {+vcard:hasCalendarLink !isDefinedBy} (CALURI), [hasCalendarRequest] {+vcard:hasCalendarRequest !isDefinedBy} (CALADRURI), and [hasCalendarBusy] {+vcard:hasCalendarBusy !isDefinedBy} (FBURL), enabling scheduling integration between contact data and calendar systems.

###
### has calendar link {=vcard:hasCalendarLink .owl:ObjectProperty label @en}

> To specify the calendar associated with the object. (Was called CALURI in RFC6350) {comment @en}


A link to the entity's calendar — typically a CalDAV or iCalendar URL that allows viewing free/busy information or subscribing to their schedule.

### has calendar request {=vcard:hasCalendarRequest .owl:ObjectProperty label @en}

> To specify the calendar user address to which a scheduling request be sent for the object. (Was called CALADRURI in RFC6350) {comment @en}


The calendar address for sending scheduling requests — a "mailto:" or other URI where meeting invitations should be directed.

### has calendar busy {=vcard:hasCalendarBusy .owl:ObjectProperty label @en}

> To specify the busy time associated with the object. (Was called FBURL in RFC6350) {comment @en}


A URL pointing to the entity's free/busy time information — typically an iCalendar FBURL resource that publishing available time slots.

## Cryptographic Identity & Annotations
====================================

[vCard] {=vc:} supports public key associations via [hasKey] {+vcard:hasKey !isDefinedBy}, language preferences via [hasLanguage] {+vcard:hasLanguage !isDefinedBy} and [language] {+vcard:language !isDefinedBy}, note annotations via [hasNote] {+vcard:hasNote !isDefinedBy} and [note] {+vcard:note !isDefinedBy}, unique identifiers via [hasUID] {+vcard:hasUID !isDefinedBy}, and value wrapping via [hasValue] {+vcard:hasValue !isDefinedBy} and [value] {+vcard:value !isDefinedBy}.

###
### has key {=vcard:hasKey .owl:ObjectProperty label @en}

> To specify a public key or authentication certificate associated with the object {comment @en}

[key] {+vcard:key ?owl:equivalentProperty}

A public key or authentication certificate linked to the entity. Used for verifying signed communications or establishing trust in decentralized identity systems.

### has language {=vcard:hasLanguage .owl:ObjectProperty label @en}

> Used to support property parameters for the language data property {comment @en}


The preferred language for communicating with the entity. Supports RFC 6350 parameters for specifying type and preference level.

### language {=vcard:language .owl:DatatypeProperty label @en}

> To specify the language that may be used for contacting the object. May also be used as a property parameter. {comment @en}


A language tag (e.g., "en", "fr", "ja") indicating the preferred language for communication. Can also appear as a property parameter on other vCard properties.

### has note {=vcard:hasNote .owl:ObjectProperty label @en}

> Used to support property parameters for the note data property {comment @en}


Object property version supporting RFC 6350 parameters on notes.

### note {=vcard:note .owl:DatatypeProperty label @en}

> A note associated with the object {comment @en}

[xsd:string] {+xsd:string ?range}

A free-text note or comment about the entity — supplementary information that does not fit any structured property.

### has uid {=vcard:hasUID .owl:ObjectProperty label @en}

> To specify a value that represents a globally unique identifier corresponding to the object {comment @en}


A globally unique identifier for the vCard entity, enabling deduplication across systems. URIs are preferred.

### has value {=vcard:hasValue .owl:ObjectProperty label @en}

> Used to indicate the resource value of an object property that requires property parameters {comment @en}


Points to the actual resource value of a structured object property. Used when RFC 6350 parameters require wrapping a value in a structured node.

### value {=vcard:value .owl:DatatypeProperty label @en}

> Used to indicate the literal value of a data property that requires property parameters {comment @en}


The literal value within a structured node that carries RFC 6350 parameters. Used alongside `hasValue` for the object property equivalent.

## Categorization & Metadata
=========================

[vCard] {=vc:} supports tagging via [category] {+vcard:category !isDefinedBy} and [hasCategory] {+vcard:hasCategory !isDefinedBy}, sorting via [sort-string] {+vcard:sort-string !isDefinedBy}, revision tracking via [rev] {+vcard:rev !isDefinedBy}, product identification via [prodid] {+vcard:prodid !isDefinedBy}, source tracking via [hasSource] {+vcard:hasSource !isDefinedBy}, and time zone via [tz] {+vcard:tz !isDefinedBy}.

###
### category {=vcard:category .owl:DatatypeProperty label @en}

> The category information about the object, also known as tags {comment @en}

[xsd:string] {+xsd:string ?range}

Tags or categories for the entity — "VIP", "Family", "Contractor". Multiple categories are allowed.

### has category {=vcard:hasCategory .owl:ObjectProperty label @en}

> Used to support property parameters for the category data property {comment @en}


Object property version supporting RFC 6350 parameters on categories.

### sort as {=vcard:sort-string .owl:DatatypeProperty label @en}

> To specify the string to be used for national-language-specific sorting. Used as a property parameter only. {comment @en}

[xsd:string] {+xsd:string ?range}

A sort key for national-language-specific sorting — determines where this entity appears in an alphabetically ordered list when the display name does not sort correctly.

### revision {=vcard:rev .owl:DatatypeProperty label @en}

> To specify revision information about the object {comment @en}

[xsd:dateTime] {+xsd:dateTime ?range}

A timestamp indicating when this vCard was last modified. Used by synchronization systems (CardDAV) to detect conflicts and resolve updates.

### product id {=vcard:prodid .owl:DatatypeProperty label @en}

> To specify the identifier for the product that created the object {comment @en}

[xsd:string] {+xsd:string ?range}

An identifier for the software product that created the vCard — "-//Apple Inc.//iOS 19.0//EN". Useful for diagnosing format issues in interop scenarios.

### has source {=vcard:hasSource .owl:ObjectProperty label @en}

> To identify the source of directory information of the object {comment @en}


Identifies the source directory or database from which the contact information was obtained — useful for provenance tracking in merged address books.

### time zone {=vcard:tz .owl:DatatypeProperty label @en}

> To indicate time zone information that is specific to the object. May also be used as a property parameter. {comment @en}

[xsd:string] {+xsd:string ?range}

A time zone identifier — "America/Los_Angeles", "Europe/Berlin". IANA time zone names are preferred. Can also appear as a property parameter on other properties.

## Type Codes (Home & Work)
========================

[vCard] {=vc:} provides the [Type] {+vcard:Type !isDefinedBy} class as a controlled vocabulary for property parameter values. The two active Type subclasses are [Home] {+vcard:Home !isDefinedBy} (personal context) and [Work] {+vcard:Work !isDefinedBy} (professional context), indicating whether a communication channel, address, or other property relates to personal life or professional context.

###
### Type {=vcard:Type .owl:Class label @en}

> Used for type codes. The URI of the type code must be used as the value for Type. {comment @en}


The parent class for type codes. These are used as property parameter values, not as standalone classes — they indicate the context (home, work) of another property.

### Home {=vcard:Home .owl:Class label @en}

> This implies that the property is related to an individual's personal life {comment @en}

[Type] {+vcard:Type ?subClassOf}

Indicates a personal or home context — a home phone, home address, personal email.

### Work {=vcard:Work .owl:Class label @en}

> This implies that the property is related to an individual's work place {comment @en}

[Type] {+vcard:Type ?subClassOf}

Indicates a professional or work context — an office phone, work address, business email.

## Solid Project Extensions
============================

The Solid Project extends vCard with address book management and WebID identity properties. These terms are not part of IETF RFC 6350 but are essential for decentralized contact management in Solid pods.

### AddressBook {=vcard:AddressBook}

> This term is not part of vCard as defined by the IETF {comment @en}

[solid] {+solid: ?isDefinedBy}

A collection of vCard people and groups. AddressBook is the Solid-specific container for managing contacts within a pod, providing index documents for efficient access.

### groupIndex {=vcard:groupIndex}

> This term is not part of vCard as defined by the IETF {comment @en}

[solid] {+solid: ?isDefinedBy}

Links an AddressBook to a document containing all its includesGroup properties — the index of groups within the address book.

### includesGroup {=vcard:includesGroup}

> This term is not part of vCard as defined by the IETF {comment @en}

[solid] {+solid: ?isDefinedBy}

When included in the group index document of an AddressBook, adds the group to the AddressBook's group collection.

### nameEmailIndex {=vcard:nameEmailIndex}

> This term is not part of vCard as defined by the IETF {comment @en}

[solid] {+solid: ?isDefinedBy}

Links an AddressBook to a document containing Individuals that appear in it — the index of contacts by name and email.

### inAddressBook {=vcard:inAddressBook}

> This term is not part of vCard as defined by the IETF {comment @en}

[solid] {+solid: ?isDefinedBy}

Indicates that an Individual appears in an AddressBook. The inverse traversal of the nameEmailIndex relationship.

### WebID {=vcard:WebID}

> This term is not part of vCard as defined by the IETF {comment @en}

[solid] {+solid: ?isDefinedBy}

The WebID of an Individual — a decentralized identity URI that links a vCard contact to a Solid pod profile. This is the bridge between contact data and the decentralized social web.

## Deprecated & Mapped Properties
=================================

[vCard] {=vc:} carries a number of legacy properties from earlier RDF mappings and pre-RFC6350 formats. **Mapped** properties: [adr] {+vcard:adr !isDefinedBy}, [email] {+vcard:email !isDefinedBy}, [geo] {+vcard:geo !isDefinedBy}, [key] {+vcard:key !isDefinedBy}, [logo] {+vcard:logo !isDefinedBy}, [n] {+vcard:n !isDefinedBy}, [org] {+vcard:org !isDefinedBy}, [photo] {+vcard:photo !isDefinedBy}, [sound] {+vcard:sound !isDefinedBy}, [tel] {+vcard:tel !isDefinedBy}, [url] {+vcard:url !isDefinedBy}. **Deprecated** classes: [Email] {+vcard:Email !isDefinedBy}, [Tel] {+vcard:Tel !isDefinedBy}. Mapped properties are listed with their modern equivalent; deprecated properties are listed with their deprecation reason.

### Mapped Properties (old → new)

The following properties are equivalent to their modern `has*` counterparts. Use the `has*` form in new data; the legacy form exists for backward compatibility.

### address {=vcard:adr .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has address] {+vcard:hasAddress ?owl:equivalentProperty}

Legacy name for `vcard:hasAddress`. Use `hasAddress` in new data.

### email {=vcard:email .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has email] {+vcard:hasEmail ?owl:equivalentProperty}

Legacy name for `vcard:hasEmail`. Use `hasEmail` in new data.

### geo {=vcard:geo .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has geo] {+vcard:hasGeo ?owl:equivalentProperty}

Legacy name for `vcard:hasGeo`. Use `hasGeo` in new data.

### key {=vcard:key .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has key] {+vcard:hasKey ?owl:equivalentProperty}

Legacy name for `vcard:hasKey`. Use `hasKey` in new data.

### logo {=vcard:logo .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has logo] {+vcard:hasLogo ?owl:equivalentProperty}

Legacy name for `vcard:hasLogo`. Use `hasLogo` in new data.

### name {=vcard:n .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has name] {+vcard:hasName ?owl:equivalentProperty}

Legacy name for `vcard:hasName`. Use `hasName` in new data.

### organization {=vcard:org .owl:ObjectProperty label @en}

> This object property has been mapped. Use the organization-name data property. {comment @en}

[organization name] {+vcard:organization-name ?owl:equivalentProperty}

Legacy name for `vcard:organization-name`. Use `organization-name` in new data.

### photo {=vcard:photo .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has photo] {+vcard:hasPhoto ?owl:equivalentProperty}

Legacy name for `vcard:hasPhoto`. Use `hasPhoto` in new data.

### sound {=vcard:sound .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has sound] {+vcard:hasSound ?owl:equivalentProperty}

Legacy name for `vcard:hasSound`. Use `hasSound` in new data.

### telephone {=vcard:tel .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has telephone] {+vcard:hasTelephone ?owl:equivalentProperty}

Legacy name for `vcard:hasTelephone`. Use `hasTelephone` in new data.

### url {=vcard:url .owl:ObjectProperty label @en}

> This object property has been mapped {comment @en}

[has url] {+vcard:hasURL ?owl:equivalentProperty}

Legacy name for `vcard:hasURL`. Use `hasURL` in new data.

### Deprecated Classes

These classes are retained for backward compatibility but should not be used in new data. They are marked `owl:deprecated true`.

### Email {=vcard:Email .owl:Class label @en}

> To specify the electronic mail address for communication with the object the vCard represents. Use the hasEmail object property. {comment @en}

**true** {owl:deprecated ^^xsd:boolean}

Deprecated in favor of using `vcard:hasEmail` directly. The Email class itself is no longer needed — the email address can be expressed as a literal value on the hasEmail object property.

### Tel {=vcard:Tel .owl:Class label @en}

> This class is deprecated. Use the hasTelephone object property. {comment @en}

**true** {owl:deprecated ^^xsd:boolean}

Deprecated in favor of using `vcard:hasTelephone` directly. Like Email, the Tel class is no longer needed.

### Deprecated TelephoneType Subclasses

BBS {+vcard:BBS}, Car {+vcard:Car}, Modem {+vcard:Modem}, Msg {+vcard:Msg}, and PCS {+vcard:PCS} are deprecated TelephoneType subclasses from the pre-RFC6350 era. They represent communication methods that are no longer in use. All are marked `owl:deprecated true`.

### Deprecated Type Subclasses

Dom {+vcard:Dom}, ISDN {+vcard:ISDN}, Internet {+vcard:Internet}, Intl {+vcard:Intl}, Label {+vcard:Label}, Parcel {+vcard:Parcel}, Postal {+vcard:Postal}, Pref {+vcard:Pref}, and X400 {+vcard:X400} are deprecated Type subclasses. They represented delivery and communication type distinctions that RFC 6350 eliminated or folded into other mechanisms. All are marked `owl:deprecated true`.

### Deprecated Data Properties

The following data properties are deprecated and should not be used in new data: **agent** {+vcard:agent} (use `hasRelated` with `vcard:Agent` type), **class** {+vcard:class}, **extended-address** {+vcard:extended-address}, **label** {+vcard:label} (use Address class instead), **latitude** {+vcard:latitude} (use `hasGeo`), **longitude** {+vcard:longitude} (use `hasGeo`), **mailer** {+vcard:mailer}, and **post-office-box** {+vcard:post-office-box}. All are marked `owl:deprecated true`.
