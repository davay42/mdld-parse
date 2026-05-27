[dc] <http://purl.org/dc/elements/1.1/>
[foaf] <http://xmlns.com/foaf/0.1/>
[owl] <http://www.w3.org/2002/07/owl#>
[vs] <http://www.w3.org/2003/06/sw-vocab-status/ns#>
[wot] <http://xmlns.com/wot/0.1/>

# date {=dc:date .owl:AnnotationProperty}

# description {=dc:description .owl:AnnotationProperty}

# title {=dc:title .owl:AnnotationProperty}

# Class {=Class .owl:Class}

# Thing {=owl:Thing label}

# Spatial Thing {=http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing .owl:Class label}

# term_status {=vs:term_status .owl:AnnotationProperty}

# Concept {=http://www.w3.org/2004/02/skos/core#Concept label}

#  {=foaf: .owl:Ontology}
[The Friend of a Friend (FOAF) RDF vocabulary, described using W3C RDF Schema and the Web Ontology Language.] {dc:description}
[Friend of a Friend (FOAF) vocabulary] {dc:title}

# Agent {=foaf:Agent .Class .owl:Class label}
[An agent (eg. person, group, software or physical artifact).] {comment}
[stable] {vs:term_status}
[http://purl.org/dc/terms/Agent] {+http://purl.org/dc/terms/Agent ?owl:equivalentClass}

# Document {=foaf:Document .Class .owl:Class label}
[A document.] {comment}
[stable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Organization] {+foaf:Organization ?owl:disjointWith}
[Project] {+foaf:Project ?owl:disjointWith}
[http://schema.org/CreativeWork] {+http://schema.org/CreativeWork ?owl:equivalentClass}

# Group {=foaf:Group .Class .owl:Class label}
[A class of Agents.] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?subClassOf}

# Image {=foaf:Image .Class .owl:Class label}
[An image.] {comment}
[stable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?subClassOf}
[http://schema.org/ImageObject] {+http://schema.org/ImageObject ?owl:equivalentClass}

# Label Property {=foaf:LabelProperty .Class .owl:Class label}
[A foaf:LabelProperty is any RDF property with texual values that serve as labels.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# Online Account {=foaf:OnlineAccount .Class .owl:Class label}
[An online account.] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?subClassOf}

# Online Chat Account {=foaf:OnlineChatAccount .Class .owl:Class label}
[An online chat account.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?subClassOf}

# Online E-commerce Account {=foaf:OnlineEcommerceAccount .Class .owl:Class label}
[An online e-commerce account.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?subClassOf}

# Online Gaming Account {=foaf:OnlineGamingAccount .Class .owl:Class label}
[An online gaming account.] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?subClassOf}

# Organization {=foaf:Organization .Class .owl:Class label}
[An organization.] {comment}
[stable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Agent] {+foaf:Agent ?subClassOf}
[Document] {+foaf:Document ?owl:disjointWith}
[Person] {+foaf:Person ?owl:disjointWith}

# Person {=foaf:Person .Class .owl:Class label}
[A person.] {comment}
[stable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Spatial Thing] {+http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing ?subClassOf}
[Agent] {+foaf:Agent ?subClassOf}
[Organization] {+foaf:Organization ?owl:disjointWith}
[Project] {+foaf:Project ?owl:disjointWith}
[http://schema.org/Person] {+http://schema.org/Person ?owl:equivalentClass}
[http://www.w3.org/2000/10/swap/pim/contact#Person] {+http://www.w3.org/2000/10/swap/pim/contact#Person ?owl:equivalentClass}

# PersonalProfileDocument {=foaf:PersonalProfileDocument .Class .owl:Class label}
[A personal profile RDF document.] {comment}
[testing] {vs:term_status}
[Document] {+foaf:Document ?subClassOf}

# Project {=foaf:Project .Class .owl:Class label}
[A project (a collective endeavour of some kind).] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?owl:disjointWith}
[Person] {+foaf:Person ?owl:disjointWith}

# account {=foaf:account .owl:ObjectProperty .rdf:Property label}
[Indicates an account held by this agent.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?range}

# account name {=foaf:accountName .owl:DatatypeProperty .rdf:Property label}
[Indicates the name (identifier) associated with this online account.] {comment}
[testing] {vs:term_status}
[Online Account] {+foaf:OnlineAccount ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# account service homepage {=foaf:accountServiceHomepage .owl:ObjectProperty .rdf:Property label}
[Indicates a homepage of the service provide for this online account.] {comment}
[testing] {vs:term_status}
[Online Account] {+foaf:OnlineAccount ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

# age {=foaf:age .owl:DatatypeProperty .owl:FunctionalProperty .rdf:Property label}
[The age in years of some agent.] {comment}
[unstable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# AIM chat ID {=foaf:aimChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[An AIM chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

# based near {=foaf:based_near .owl:ObjectProperty .rdf:Property label}
[A location that something is based near, for some broadly human notion of near.] {comment}
[testing] {vs:term_status}
[Spatial Thing] {+http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Spatial Thing] {+http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing ?range}

# birthday {=foaf:birthday .owl:DatatypeProperty .owl:FunctionalProperty .rdf:Property label}
[The birthday of this Agent, represented in mm-dd string form, eg. '12-31'.] {comment}
[unstable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# current project {=foaf:currentProject .owl:ObjectProperty .rdf:Property label}
[A current project this person works on.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# depiction {=foaf:depiction .owl:ObjectProperty .rdf:Property label}
[A depiction of some thing.] {comment}
[testing] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Image] {+foaf:Image ?range}
[depicts] {+foaf:depicts ?owl:inverseOf}

# depicts {=foaf:depicts .owl:ObjectProperty .rdf:Property label}
[A thing depicted in this representation.] {comment}
[testing] {vs:term_status}
[Image] {+foaf:Image ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[depiction] {+foaf:depiction ?owl:inverseOf}

# DNA checksum {=foaf:dnaChecksum .owl:DatatypeProperty .rdf:Property label}
[A checksum for the DNA of some thing. Joke.] {comment}
[archaic] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# familyName {=foaf:familyName .owl:DatatypeProperty .rdf:Property label}
[The family name of some person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# family_name {=foaf:family_name .owl:DatatypeProperty .rdf:Property label}
[The family name of some person.] {comment}
[archaic] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# firstName {=foaf:firstName .owl:DatatypeProperty .rdf:Property label}
[The first name of a person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# focus {=foaf:focus .owl:ObjectProperty .rdf:Property label}
[The underlying or 'focal' entity associated with some SKOS-described concept.] {comment}
[testing] {vs:term_status}
[Concept] {+http://www.w3.org/2004/02/skos/core#Concept ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# funded by {=foaf:fundedBy .owl:ObjectProperty .rdf:Property label}
[An organization funding a project or person.] {comment}
[archaic] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# geekcode {=foaf:geekcode .owl:DatatypeProperty .rdf:Property label}
[A textual geekcode for this person, see http://www.geekcode.com/geek.html] {comment}
[archaic] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# gender {=foaf:gender .owl:DatatypeProperty .owl:FunctionalProperty .rdf:Property label}
[The gender of this Agent (typically but not necessarily 'male' or 'female').] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# Given name {=foaf:givenName .owl:DatatypeProperty .rdf:Property label}
[The given name of some person.] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# Given name {=foaf:givenname .owl:DatatypeProperty .rdf:Property label}
[The given name of some person.] {comment}
[archaic] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# account {=foaf:holdsAccount .owl:ObjectProperty .rdf:Property label}
[Indicates an account held by this agent.] {comment}
[archaic] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Online Account] {+foaf:OnlineAccount ?range}

# homepage {=foaf:homepage .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A homepage for some thing.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[is primary topic of] {+foaf:isPrimaryTopicOf ?subPropertyOf}
[page] {+foaf:page ?subPropertyOf}

# ICQ chat ID {=foaf:icqChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[An ICQ chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

# image {=foaf:img .owl:ObjectProperty .rdf:Property label}
[An image that can be used to represent some thing (ie. those depictions which are particularly representative of something, eg. one's photo on a homepage).] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Image] {+foaf:Image ?range}
[depiction] {+foaf:depiction ?subPropertyOf}

# interest {=foaf:interest .owl:ObjectProperty .rdf:Property label}
[A page about a topic of interest to this person.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

# is primary topic of {=foaf:isPrimaryTopicOf .owl:InverseFunctionalProperty .rdf:Property label}
[A document that this thing is the primary topic of.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[page] {+foaf:page ?subPropertyOf}
[primary topic] {+foaf:primaryTopic ?owl:inverseOf}

# jabber ID {=foaf:jabberID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[A jabber ID for something.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# knows {=foaf:knows .owl:ObjectProperty .rdf:Property label}
[A person known by this person (indicating some level of reciprocated interaction between the parties).] {comment}
[stable] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Person] {+foaf:Person ?range}

# lastName {=foaf:lastName .owl:DatatypeProperty .rdf:Property label}
[The last name of a person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# logo {=foaf:logo .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A logo representing some thing.] {comment}
[testing] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# made {=foaf:made .owl:ObjectProperty .rdf:Property label}
[Something that was made by this agent.] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[maker] {+foaf:maker ?owl:inverseOf}

# maker {=foaf:maker .owl:ObjectProperty .rdf:Property label}
[An agent that  made this thing.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Agent] {+foaf:Agent ?range}
[http://purl.org/dc/terms/creator] {+http://purl.org/dc/terms/creator ?owl:equivalentProperty}
[made] {+foaf:made ?owl:inverseOf}

# personal mailbox {=foaf:mbox .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A  personal mailbox, ie. an Internet mailbox associated with exactly one owner, the first owner of this mailbox. This is a 'static inverse functional property', in that  there is (across time and change) at most one individual that ever has any particular value for foaf:mbox.] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# sha1sum of a personal mailbox URI name {=foaf:mbox_sha1sum .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[The sha1sum of the URI of an Internet mailbox associated with exactly one owner, the  first owner of the mailbox.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# member {=foaf:member .owl:ObjectProperty .rdf:Property label}
[Indicates a member of a Group] {comment}
[stable] {vs:term_status}
[Group] {+foaf:Group ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Agent] {+foaf:Agent ?range}

# membershipClass {=foaf:membershipClass .owl:AnnotationProperty .rdf:Property label}
[Indicates the class of individuals that are a member of a Group] {comment}
[unstable] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# MSN chat ID {=foaf:msnChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[An MSN chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

# myersBriggs {=foaf:myersBriggs .owl:DatatypeProperty .rdf:Property label}
[A Myers Briggs (MBTI) personality classification.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# name {=foaf:name .owl:DatatypeProperty .rdf:Property label}
[A name for some thing.] {comment}
[testing] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[label] {+label ?subPropertyOf}

# nickname {=foaf:nick .owl:DatatypeProperty .rdf:Property label}
[A short informal nickname characterising an agent (includes login identifiers, IRC and other chat nicknames).] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# openid {=foaf:openid .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[An OpenID for an Agent.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[is primary topic of] {+foaf:isPrimaryTopicOf ?subPropertyOf}

# page {=foaf:page .owl:ObjectProperty .rdf:Property label}
[A page or document about this thing.] {comment}
[stable] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[topic] {+foaf:topic ?owl:inverseOf}

# past project {=foaf:pastProject .owl:ObjectProperty .rdf:Property label}
[A project this person has previously worked on.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# phone {=foaf:phone .owl:ObjectProperty .rdf:Property label}
[A phone,  specified using fully qualified tel: URI scheme (refs: http://www.w3.org/Addressing/schemes.html#tel).] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# plan {=foaf:plan .owl:DatatypeProperty .rdf:Property label}
[A .plan comment, in the tradition of finger and '.plan' files.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# primary topic {=foaf:primaryTopic .owl:FunctionalProperty .owl:ObjectProperty .rdf:Property label}
[The primary topic of some page or document.] {comment}
[stable] {vs:term_status}
[Document] {+foaf:Document ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[is primary topic of] {+foaf:isPrimaryTopicOf ?owl:inverseOf}

# publications {=foaf:publications .owl:ObjectProperty .rdf:Property label}
[A link to the publications of this person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

# schoolHomepage {=foaf:schoolHomepage .owl:ObjectProperty .rdf:Property label}
[A homepage of a school attended by the person.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

# sha1sum (hex) {=foaf:sha1 .owl:DatatypeProperty .rdf:Property label}
[A sha1sum hash, in hex.] {comment}
[unstable] {vs:term_status}
[Document] {+foaf:Document ?domain}
[foaf:] {+foaf: ?isDefinedBy}

# Skype ID {=foaf:skypeID .owl:DatatypeProperty .rdf:Property label}
[A Skype ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

# status {=foaf:status .owl:DatatypeProperty .rdf:Property label}
[A string expressing what the user is happy for the general public (normally) to know about their current activity.] {comment}
[unstable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# Surname {=foaf:surname .owl:DatatypeProperty .rdf:Property label}
[The surname of some person.] {comment}
[archaic] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}

# theme {=foaf:theme .owl:ObjectProperty .rdf:Property label}
[A theme.] {comment}
[archaic] {vs:term_status}
[Thing] {+owl:Thing ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# thumbnail {=foaf:thumbnail .owl:ObjectProperty .rdf:Property label}
[A derived thumbnail image.] {comment}
[testing] {vs:term_status}
[Image] {+foaf:Image ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Image] {+foaf:Image ?range}

# tipjar {=foaf:tipjar .owl:ObjectProperty .rdf:Property label}
[A tipjar document for this agent, describing means for payment and reward.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[page] {+foaf:page ?subPropertyOf}

# title {=foaf:title .owl:DatatypeProperty .rdf:Property label}
[Title (Mr, Mrs, Ms, Dr. etc)] {comment}
[testing] {vs:term_status}
[foaf:] {+foaf: ?isDefinedBy}

# topic {=foaf:topic .owl:ObjectProperty .rdf:Property label}
[A topic of some page or document.] {comment}
[testing] {vs:term_status}
[Document] {+foaf:Document ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}
[page] {+foaf:page ?owl:inverseOf}

# topic_interest {=foaf:topic_interest .owl:ObjectProperty .rdf:Property label}
[A thing of interest to this person.] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# weblog {=foaf:weblog .owl:InverseFunctionalProperty .owl:ObjectProperty .rdf:Property label}
[A weblog of some thing (whether person, group, company etc.).] {comment}
[stable] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}
[page] {+foaf:page ?subPropertyOf}

# work info homepage {=foaf:workInfoHomepage .owl:ObjectProperty .rdf:Property label}
[A work info homepage of some person; a page about their work for some organization.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

# workplace homepage {=foaf:workplaceHomepage .owl:ObjectProperty .rdf:Property label}
[A workplace homepage of some person; the homepage of an organization they work for.] {comment}
[testing] {vs:term_status}
[Person] {+foaf:Person ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Document] {+foaf:Document ?range}

# Yahoo chat ID {=foaf:yahooChatID .owl:DatatypeProperty .owl:InverseFunctionalProperty .rdf:Property label}
[A Yahoo chat ID] {comment}
[testing] {vs:term_status}
[Agent] {+foaf:Agent ?domain}
[foaf:] {+foaf: ?isDefinedBy}
[Literal] {+Literal ?range}
[nickname] {+foaf:nick ?subPropertyOf}

# assurance {=wot:assurance .owl:AnnotationProperty}

# src_assurance {=wot:src_assurance .owl:AnnotationProperty}

