[owl] <http://www.w3.org/2002/07/owl#>
[vc] <http://www.w3.org/2006/vcard/ns>
[vcard] <http://www.w3.org/2006/vcard/ns#>

# Ontology for vCard {=vc: .owl:Ontology label @en}
[Ontology for vCard based on RFC6350] {comment @en}
[Final] {owl:versionInfo @en}

# Acquaintance {=vcard:Acquaintance .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Address {=vcard:Address .owl:Class label @en}
[To specify the components of the delivery address for the  object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# AddressBook {=vcard:AddressBook}
> This term is not part of vCard as defined by the IETF {comment @en}
[https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl] {+https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl ?isDefinedBy}

# Agent {=vcard:Agent .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# BBS {=vcard:BBS .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Car {=vcard:Car .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Cell {=vcard:Cell .owl:Class label @en}
[Also called mobile telephone] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Child {=vcard:Child .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Colleague {=vcard:Colleague .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Contact {=vcard:Contact .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Coresident {=vcard:Coresident .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Coworker {=vcard:Coworker .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Crush {=vcard:Crush .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Date {=vcard:Date .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Dom {=vcard:Dom .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Email {=vcard:Email .owl:Class label @en}
[To specify the electronic mail address for communication with the object the vCard represents. Use the hasEmail object property.] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Emergency {=vcard:Emergency .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Fax {=vcard:Fax .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Female {=vcard:Female .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Gender] {+vcard:Gender ?subClassOf}

# Friend {=vcard:Friend .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Gender {=vcard:Gender .owl:Class label @en}
[Used for gender codes. The URI of the gender code must be used as the value for Gender.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Group {=vcard:Group .owl:Class label @en}
[Object representing a group of persons or entities.  A group object will usually contain hasMember properties to specify the members of the group.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Kind] {+vcard:Kind ?subClassOf}
[Individual] {+vcard:Individual ?owl:disjointWith}
[Location] {+vcard:Location ?owl:disjointWith}
[Organization] {+vcard:Organization ?owl:disjointWith}

# Home {=vcard:Home .owl:Class label @en}
[This implies that the property is related to an individual's personal life] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# ISDN {=vcard:ISDN .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Individual {=vcard:Individual .owl:Class label @en}
[An object representing a single person or entity] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Kind] {+vcard:Kind ?subClassOf}
[Location] {+vcard:Location ?owl:disjointWith}
[Organization] {+vcard:Organization ?owl:disjointWith}

# Internet {=vcard:Internet .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Intl {=vcard:Intl .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Kin {=vcard:Kin .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Kind {=vcard:Kind .owl:Class label @en}
[The parent class for all objects] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[VCard] {+vcard:VCard ?owl:equivalentClass}

# Label {=vcard:Label .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Location {=vcard:Location .owl:Class label @en}
[An object representing a named geographical place] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Kind] {+vcard:Kind ?subClassOf}
[Organization] {+vcard:Organization ?owl:disjointWith}

# Male {=vcard:Male .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Gender] {+vcard:Gender ?subClassOf}

# Me {=vcard:Me .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Met {=vcard:Met .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Modem {=vcard:Modem .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Msg {=vcard:Msg .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Muse {=vcard:Muse .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Name {=vcard:Name .owl:Class label @en}
[To specify the components of the name of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Neighbor {=vcard:Neighbor .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# None {=vcard:None .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Gender] {+vcard:Gender ?subClassOf}

# Organization {=vcard:Organization .owl:Class label @en}
~~~ {comment @en}
An object representing an organization.  An organization is a single entity, and might represent a business or government, a department or division within a business or government, a club, an association, or the like.

~~~

[Ontology for vCard] {+vc: ?isDefinedBy}
[Kind] {+vcard:Kind ?subClassOf}

# Other {=vcard:Other .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Gender] {+vcard:Gender ?subClassOf}

# PCS {=vcard:PCS .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Pager {=vcard:Pager .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Parcel {=vcard:Parcel .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Parent {=vcard:Parent .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Postal {=vcard:Postal .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Pref {=vcard:Pref .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# Relation Type {=vcard:RelatedType .owl:Class label @en}
[Used for relation type codes. The URI of the relation type code must be used as the value for the Relation Type.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Sibling {=vcard:Sibling .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Spouse {=vcard:Spouse .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Sweetheart {=vcard:Sweetheart .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Relation Type] {+vcard:RelatedType ?subClassOf}

# Tel {=vcard:Tel .owl:Class label @en}
[This class is deprecated. Use the hasTelephone object property.] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Phone {=vcard:TelephoneType .owl:Class label @en}
[Used for telephone type codes. The URI of the telephone type code must be used as the value for the Telephone Type.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Text {=vcard:Text .owl:Class label @en}
[Also called sms telephone] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Text phone {=vcard:TextPhone .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Type {=vcard:Type .owl:Class label @en}
[Used for type codes. The URI of the type code must be used as the value for Type.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# Unknown {=vcard:Unknown .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Gender] {+vcard:Gender ?subClassOf}

# VCard {=vcard:VCard .owl:Class label @en}
[The vCard class is  equivalent to the new Kind class, which is the parent for the four explicit types of vCards (Individual, Organization, Location, Group)] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Kind] {+vcard:Kind ?owl:equivalentClass}

# Video {=vcard:Video .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# Voice {=vcard:Voice .owl:Class label @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Phone] {+vcard:TelephoneType ?subClassOf}

# WebID {=vcard:WebID}
> This term is not part of vCard as defined by the IETF {comment @en}
[https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl] {+https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl ?isDefinedBy}

# Work {=vcard:Work .owl:Class label @en}
[This implies that the property is related to an individual's work place] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# X400 {=vcard:X400 .owl:Class label @en}
[This class is deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Type] {+vcard:Type ?subClassOf}

# additional name {=vcard:additional-name .owl:DatatypeProperty label @en}
[The additional name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# address {=vcard:adr .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has address] {+vcard:hasAddress ?owl:equivalentProperty}

# agent {=vcard:agent .owl:ObjectProperty label @en}
[This object property has been deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# anniversary {=vcard:anniversary .owl:DatatypeProperty label @en}
[The date of marriage, or equivalent, of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# birth date {=vcard:bday .owl:DatatypeProperty label @en}
[To specify the birth date of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# category {=vcard:category .owl:DatatypeProperty label @en}
[The category information about the object, also known as tags] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# class {=vcard:class .owl:DatatypeProperty label @en}
[This data property has been deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# country name {=vcard:country-name .owl:DatatypeProperty label @en}
[The country name associated with the address of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# email {=vcard:email .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has email] {+vcard:hasEmail ?owl:equivalentProperty}

# extended address {=vcard:extended-address .owl:DatatypeProperty label @en}
[This data property has been deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# family name {=vcard:family-name .owl:DatatypeProperty label @en}
[The family name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# formatted name {=vcard:fn .owl:DatatypeProperty label @en}
[The formatted text corresponding to the name of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# geo {=vcard:geo .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has geo] {+vcard:hasGeo ?owl:equivalentProperty}

# given name {=vcard:given-name .owl:DatatypeProperty label @en}
[The given name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# groupIndex {=vcard:groupIndex}
> This term is not part of vCard as defined by the IETF {comment @en}
[https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl] {+https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl ?isDefinedBy}

# has additional name {=vcard:hasAdditionalName .owl:ObjectProperty label @en}
[Used to support property parameters for the additional name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has address {=vcard:hasAddress .owl:ObjectProperty label @en}
[To specify the components of the delivery address for the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Address] {+vcard:Address ?range}

# has calendar busy {=vcard:hasCalendarBusy .owl:ObjectProperty label @en}
[To specify the busy time associated with the object. (Was called FBURL in RFC6350)] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has calendar link {=vcard:hasCalendarLink .owl:ObjectProperty label @en}
[To specify the calendar associated with the object. (Was called CALURI in RFC6350)] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has calendar request {=vcard:hasCalendarRequest .owl:ObjectProperty label @en}
[To specify the calendar user address to which a scheduling request be sent for the object. (Was called CALADRURI in RFC6350)] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has category {=vcard:hasCategory .owl:ObjectProperty label @en}
[Used to support property parameters for the category data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has country name {=vcard:hasCountryName .owl:ObjectProperty label @en}
[Used to support property parameters for the country name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has email {=vcard:hasEmail .owl:ObjectProperty label @en}
[To specify the electronic mail address for communication with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Email] {+vcard:Email ?range}

# has formatted name {=vcard:hasFN .owl:ObjectProperty label @en}
[Used to support property parameters for the formatted name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has family name {=vcard:hasFamilyName .owl:ObjectProperty label @en}
[Used to support property parameters for the family name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has gender {=vcard:hasGender .owl:ObjectProperty label @en}
[To specify  the sex or gender identity of the object. URIs are recommended to enable interoperable sex and gender codes to be used.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has geo {=vcard:hasGeo .owl:ObjectProperty label @en}
[To specify information related to the global positioning of the object. May also be used as a property parameter.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has given name {=vcard:hasGivenName .owl:ObjectProperty label @en}
[Used to support property parameters for the given name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has honorific prefix {=vcard:hasHonorificPrefix .owl:ObjectProperty label @en}
[Used to support property parameters for the honorific prefix data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has honorific suffix {=vcard:hasHonorificSuffix .owl:ObjectProperty label @en}
[Used to support property parameters for the honorific suffix data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has messaging {=vcard:hasInstantMessage .owl:ObjectProperty label @en}
[To specify the instant messaging and presence protocol communications with the object. (Was called IMPP in RFC6350)] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has key {=vcard:hasKey .owl:ObjectProperty label @en}
[To specify a public key or authentication certificate associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[key] {+vcard:key ?owl:equivalentProperty}

# has language {=vcard:hasLanguage .owl:ObjectProperty label @en}
[Used to support property parameters for the language data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has locality {=vcard:hasLocality .owl:ObjectProperty label @en}
[Used to support property parameters for the locality data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has logo {=vcard:hasLogo .owl:ObjectProperty label @en}
[To specify a graphic image of a logo associated with the object ] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[logo] {+vcard:logo ?owl:equivalentProperty}

# has member {=vcard:hasMember .owl:ObjectProperty label @en}
[To include a member in the group this object represents. (This property can only be used by Group individuals)] {comment @en}
[Group] {+vcard:Group ?domain}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Kind] {+vcard:Kind ?range}

# has name {=vcard:hasName .owl:ObjectProperty label @en}
[To specify the components of the name of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[Name] {+vcard:Name ?range}
[name] {+vcard:n ?owl:equivalentProperty}

# has nickname {=vcard:hasNickname .owl:ObjectProperty label @en}
[Used to support property parameters for the nickname data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[nickname] {+vcard:nickname ?seeAlso}

# has note {=vcard:hasNote .owl:ObjectProperty label @en}
[Used to support property parameters for the note data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has organization name {=vcard:hasOrganizationName .owl:ObjectProperty label @en}
[Used to support property parameters for the organization name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has organization unit name {=vcard:hasOrganizationUnit .owl:ObjectProperty label @en}
[Used to support property parameters for the organization unit name data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has photo {=vcard:hasPhoto .owl:ObjectProperty label @en}
[To specify an image or photograph information that annotates some aspect of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[photo] {+vcard:photo ?owl:equivalentProperty}

# has postal code {=vcard:hasPostalCode .owl:ObjectProperty label @en}
[Used to support property parameters for the postal code data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has region {=vcard:hasRegion .owl:ObjectProperty label @en}
[Used to support property parameters for the region data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has related {=vcard:hasRelated .owl:ObjectProperty label @en}
[To specify a relationship between another entity and the entity represented by this object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has role {=vcard:hasRole .owl:ObjectProperty label @en}
[Used to support property parameters for the role data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has sound {=vcard:hasSound .owl:ObjectProperty label @en}
[To specify a digital sound content information that annotates some aspect of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[sound] {+vcard:sound ?owl:equivalentProperty}

# has source {=vcard:hasSource .owl:ObjectProperty label @en}
[To identify the source of directory information of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has street address {=vcard:hasStreetAddress .owl:ObjectProperty label @en}
[Used to support property parameters for the street address data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has telephone {=vcard:hasTelephone .owl:ObjectProperty label @en}
[To specify the telephone number for telephony communication with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[telephone] {+vcard:tel ?owl:equivalentProperty}

# has title {=vcard:hasTitle .owl:ObjectProperty label @en}
[Used to support property parameters for the title data property] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has uid {=vcard:hasUID .owl:ObjectProperty label @en}
[To specify a value that represents a globally unique identifier corresponding to the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# has url {=vcard:hasURL .owl:ObjectProperty label @en}
[To specify a uniform resource locator associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[url] {+vcard:url ?owl:equivalentProperty}

# has value {=vcard:hasValue .owl:ObjectProperty label @en}
[Used to indicate the resource value of an object property that requires property parameters] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# honorific prefix {=vcard:honorific-prefix .owl:DatatypeProperty label @en}
[The honorific prefix of the name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# honorific suffix {=vcard:honorific-suffix .owl:DatatypeProperty label @en}
[The honorific suffix of the name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# inAddressBook {=vcard:inAddressBook}
> This term is not part of vCard as defined by the IETF {comment @en}
[https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl] {+https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl ?isDefinedBy}

# includesGroup {=vcard:includesGroup}
> This term is not part of vCard as defined by the IETF {comment @en}
[https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl] {+https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl ?isDefinedBy}

# key {=vcard:key .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has key] {+vcard:hasKey ?owl:equivalentProperty}

# label {=vcard:label .owl:DatatypeProperty label @en}
[This data property has been deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# language {=vcard:language .owl:DatatypeProperty label @en}
[To specify the language that may be used for contacting the object. May also be used as a property parameter.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}

# latitude {=vcard:latitude .owl:DatatypeProperty label @en}
[This data property has been deprecated. See hasGeo] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# locality {=vcard:locality .owl:DatatypeProperty label @en}
[The locality (e.g. city or town) associated with the address of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# logo {=vcard:logo .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has logo] {+vcard:hasLogo ?owl:equivalentProperty}

# longitude {=vcard:longitude .owl:DatatypeProperty label @en}
[This data property has been deprecated. See hasGeo] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# mailer {=vcard:mailer .owl:DatatypeProperty label @en}
[This data property has been deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# name {=vcard:n .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has name] {+vcard:hasName ?owl:equivalentProperty}

# nameEmailIndex {=vcard:nameEmailIndex}
> This term is not part of vCard as defined by the IETF {comment @en}
[https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl] {+https://raw.githack.com/solid/contacts/refs/heads/main/vcard-extension-addressbook.ttl ?isDefinedBy}

# nickname {=vcard:nickname .owl:DatatypeProperty label @en}
[The nick name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# note {=vcard:note .owl:DatatypeProperty label @en}
[A note associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# organization {=vcard:org .owl:ObjectProperty label @en}
[This object property has been mapped. Use the organization-name data property.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[organization name] {+vcard:organization-name ?owl:equivalentProperty}

# organization name {=vcard:organization-name .owl:DatatypeProperty label @en}
[To specify the organizational name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# organizational unit name {=vcard:organization-unit .owl:DatatypeProperty label @en}
[To specify the organizational unit name associated with the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[organization name] {+vcard:organization-name ?subPropertyOf}

# photo {=vcard:photo .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has photo] {+vcard:hasPhoto ?owl:equivalentProperty}

# post office box {=vcard:post-office-box .owl:DatatypeProperty label @en}
[This data property has been deprecated] {comment @en}
**true** {owl:deprecated ^^xsd:boolean}
[Ontology for vCard] {+vc: ?isDefinedBy}

# postal code {=vcard:postal-code .owl:DatatypeProperty label @en}
[The postal code associated with the address of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# product id {=vcard:prodid .owl:DatatypeProperty label @en}
[To specify the identifier for the product that created the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# region {=vcard:region .owl:DatatypeProperty label @en}
[The region (e.g. state or province) associated with the address of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# revision {=vcard:rev .owl:DatatypeProperty label @en}
[To specify revision information about the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:dateTime] {+xsd:dateTime ?range}

# role {=vcard:role .owl:DatatypeProperty label @en}
[To specify the function or part played in a particular situation by the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# sort as {=vcard:sort-string .owl:DatatypeProperty label @en}
[To specify the string to be used for national-language-specific sorting. Used as a property parameter only.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# sound {=vcard:sound .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has sound] {+vcard:hasSound ?owl:equivalentProperty}

# street address {=vcard:street-address .owl:DatatypeProperty label @en}
[The street address associated with the address of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# telephone {=vcard:tel .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has telephone] {+vcard:hasTelephone ?owl:equivalentProperty}

# title {=vcard:title .owl:DatatypeProperty label @en}
[To specify the position or job of the object] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# time zone {=vcard:tz .owl:DatatypeProperty label @en}
[To indicate time zone information that is specific to the object. May also be used as a property parameter.] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# url {=vcard:url .owl:ObjectProperty label @en}
[This object property has been mapped] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
[has url] {+vcard:hasURL ?owl:equivalentProperty}

# value {=vcard:value .owl:DatatypeProperty label @en}
[Used to indicate the literal value of a data property that requires property parameters] {comment @en}
[Ontology for vCard] {+vc: ?isDefinedBy}
