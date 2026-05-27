[as] <https://www.w3.org/ns/activitystreams#>
[owl] <http://www.w3.org/2002/07/owl#>

# langString {=rdf:langString .Datatype}

# nil {=rdf:nil .as:OrderedItems}

# duration {=xsd:duration .Datatype}

# Activity Streams 2.0 {=as: .owl:Ontology label @en}
[Extended Activity Streams 2.0 Vocabulary] {comment @en}
[prov:] {+prov: ?owl:imports}

# Accept {=as:Accept .owl:Class label @en}
[Actor accepts the Object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Activity {=as:Activity .owl:Class label @en}
[An Object representing some form of Action that has been taken] {comment @en}
[Object] {+as:Object ?subClassOf}

# Add {=as:Add .owl:Class label @en}
[To Add an Object or Link to Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Announce {=as:Announce .owl:Class label @en}
[Actor announces the object to the target] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Application {=as:Application .owl:Class label @en}
[Represents a software application of any sort] {comment @en}
[Object] {+as:Object ?subClassOf}

# Arrive {=as:Arrive .owl:Class label @en}
[To Arrive Somewhere (can be used, for instance, to indicate that a particular entity is currently located somewhere, e.g. a "check-in")] {comment @en}
[IntransitiveActivity] {+as:IntransitiveActivity ?subClassOf}

# Article {=as:Article .owl:Class label @en}
[A written work. Typically several paragraphs long. For example, a blog post or a news article.] {comment @en}
[Object] {+as:Object ?subClassOf}

# Audio {=as:Audio .owl:Class label @en}
[An audio file] {comment @en}
[Document] {+as:Document ?subClassOf}

# Block {=as:Block .owl:Class label @en}
[Ignore] {+as:Ignore ?subClassOf}

# Collection {=as:Collection .owl:Class label @en}
[An ordered or unordered collection of Objects or Links] {comment @en}
[Object] {+as:Object ?subClassOf}

# CollectionPage {=as:CollectionPage .owl:Class label @en}
[A subset of items from a Collection] {comment @en}
[Collection] {+as:Collection ?subClassOf}

# Create {=as:Create .owl:Class label @en}
[To Create Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Delete {=as:Delete .owl:Class label @en}
[To Delete Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Dislike {=as:Dislike .owl:Class label @en}
[The actor dislikes the object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Document {=as:Document .owl:Class label @en}
[Represents a digital document/file of any sort] {comment @en}
[Object] {+as:Object ?subClassOf}

# Event {=as:Event .owl:Class label @en}
[An Event of any kind] {comment @en}
[Object] {+as:Object ?subClassOf}

# Flag {=as:Flag .owl:Class label @en}
[To flag something (e.g. flag as inappropriate, flag as spam, etc)] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Follow {=as:Follow .owl:Class label @en}
[To Express Interest in Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Group {=as:Group .owl:Class label @en}
[A Group of any kind.] {comment @en}
[Object] {+as:Object ?subClassOf}

# Ignore {=as:Ignore .owl:Class label @en}
[Actor is ignoring the Object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Image {=as:Image .owl:Class label @en}
[An Image file] {comment @en}
[Document] {+as:Document ?subClassOf}

# IntransitiveActivity {=as:IntransitiveActivity .owl:Class label @en}
[An Activity that has no direct object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Invite {=as:Invite .owl:Class label @en}
[To invite someone or something to something] {comment @en}
[Offer] {+as:Offer ?subClassOf}

# Join {=as:Join .owl:Class label @en}
[To Join Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Leave {=as:Leave .owl:Class label @en}
[To Leave Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Like {=as:Like .owl:Class label @en}
[To Like Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Link {=as:Link .owl:Class label @en}
[Represents a qualified reference to another resource. Patterned after the RFC5988 Web Linking Model] {comment @en}
[Object] {+as:Object ?owl:disjointWith}

# Listen {=as:Listen .owl:Class label @en}
[The actor listened to the object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Mention {=as:Mention .owl:Class label @en}
[A specialized Link that represents an @mention] {comment @en}
[Link] {+as:Link ?subClassOf}

# Move {=as:Move .owl:Class label @en}
[The actor is moving the object. The target specifies where the object is moving to. The origin specifies where the object is moving from.] {comment}
[Activity] {+as:Activity ?subClassOf}

# Note {=as:Note .owl:Class label @en}
[A Short note, typically less than a single paragraph. A "tweet" is an example, or a "status update"] {comment @en}
[Object] {+as:Object ?subClassOf}

# Object {=as:Object .owl:Class label @en}

# Offer {=as:Offer .owl:Class label @en}
[To Offer something to someone or something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# OrderedCollection {=as:OrderedCollection .owl:Class label @en}
[A variation of Collection in which items are strictly ordered] {comment @en}

# OrderedCollectionPage {=as:OrderedCollectionPage .owl:Class label @en}
[An ordered subset of items from an OrderedCollection] {comment @en}
[CollectionPage] {+as:CollectionPage ?subClassOf}
[OrderedCollection] {+as:OrderedCollection ?subClassOf}

# OrderedItems {=as:OrderedItems .owl:Class label @en}
[A rdf:List variant for Objects and Links] {comment @en}

# Organization {=as:Organization .owl:Class label @en}
[An Organization] {comment @en}
[Object] {+as:Object ?subClassOf}

# Page {=as:Page .owl:Class label @en}
[A Web Page] {comment @en}
[Object] {+as:Object ?subClassOf}

# Person {=as:Person .owl:Class label @en}
[A Person] {comment @en}
[Object] {+as:Object ?subClassOf}

# Place {=as:Place .owl:Class label @en}
[A physical or logical location] {comment @en}
[Object] {+as:Object ?subClassOf}

# Profile {=as:Profile .owl:Class label @en}
[A Profile Document] {comment @en}
[Object] {+as:Object ?subClassOf}

# Question {=as:Question .owl:Class label @en}
[A question of any sort.] {comment @en}
[IntransitiveActivity] {+as:IntransitiveActivity ?subClassOf}

# Read {=as:Read .owl:Class label @en}
[The actor read the object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Reject {=as:Reject .owl:Class label @en}
[Actor rejects the Object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Relationship {=as:Relationship .owl:Class .rdf:Statement label @en}
[Represents a Social Graph relationship between two Individuals (indicated by the 'a' and 'b' properties)] {comment @en}
[Object] {+as:Object ?subClassOf}

# Remove {=as:Remove .owl:Class label @en}
[To Remove Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Service {=as:Service .owl:Class label @en}
[A service provided by some entity] {comment @en}
[Object] {+as:Object ?subClassOf}

# TentativeAccept {=as:TentativeAccept .owl:Class label @en}
[Actor tentatively accepts the Object] {comment @en}
[Accept] {+as:Accept ?subClassOf}

# TentativeReject {=as:TentativeReject .owl:Class label @en}
[Actor tentatively rejects the object] {comment @en}
[Reject] {+as:Reject ?subClassOf}

# Tombstone {=as:Tombstone .owl:Class label @en}
[A placeholder for a deleted object] {comment @en}
[Object] {+as:Object ?subClassOf}

# Travel {=as:Travel .owl:Class label @en}
[The actor is traveling to the target. The origin specifies where the actor is traveling from.] {comment}
[IntransitiveActivity] {+as:IntransitiveActivity ?subClassOf}

# Undo {=as:Undo .owl:Class label @en}
[To Undo Something. This would typically be used to indicate that a previous Activity has been undone.] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Update {=as:Update .owl:Class label @en}
[To Update/Modify Something] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# Video {=as:Video .owl:Class label @en}
[A Video document of any kind.] {comment @en}
[Document] {+as:Document ?subClassOf}

# View {=as:View .owl:Class label @en}
[The actor viewed the object] {comment @en}
[Activity] {+as:Activity ?subClassOf}

# accuracy {=as:accuracy .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Specifies the accuracy around the point established by the longitude and latitude] {comment @en}
[Place] {+as:Place ?domain}

# actor {=as:actor .owl:ObjectProperty label @en}
[Subproperty of as:attributedTo that identifies the primary actor] {comment @en}
[Activity] {+as:Activity ?domain}
[attributedTo] {+as:attributedTo ?subPropertyOf}

# altitude {=as:altitude .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The altitude of a place] {comment @en}
[Place] {+as:Place ?domain}
[xsd:float] {+xsd:float ?range}

# oneOf {=as:anyOf .owl:ObjectProperty label @en}
[Describes a possible inclusive answer or option for a question.] {comment @en}
[Question] {+as:Question ?domain}

# attachment {=as:attachment .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}
[attachments] {+as:attachments ?owl:equivalentProperty}

# attachments {=as:attachments .owl:DeprecatedProperty .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# attributedTo {=as:attributedTo .owl:ObjectProperty label @en}
[Identifies an entity to which an object is attributed] {comment @en}

# audience {=as:audience .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# author {=as:author .owl:DeprecatedProperty .owl:ObjectProperty label @en}
[Identifies the author of an object. Deprecated. Use as:attributedTo instead] {comment @en}
[Object] {+as:Object ?domain}
[attributedTo] {+as:attributedTo ?subPropertyOf}

# bcc {=as:bcc .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# bto {=as:bto .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# cc {=as:cc .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# content {=as:content .owl:DatatypeProperty label @en}
[The content of the object.] {comment @en}
[Object] {+as:Object ?domain}

# context {=as:context .owl:ObjectProperty label @en}
[Specifies the context within which an object exists or an activity was performed] {comment @en}
[Object] {+as:Object ?domain}

# current {=as:current .owl:FunctionalProperty .owl:ObjectProperty label @en}
[Collection] {+as:Collection ?domain}

# deleted {=as:deleted .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Specifies the date and time the object was deleted] {comment @en}
[Tombstone] {+as:Tombstone ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# describes {=as:describes .owl:FunctionalProperty .owl:ObjectProperty label @en}
[On a Profile object, describes the object described by the profile] {comment @en}
[Profile] {+as:Profile ?domain}
[Object] {+as:Object ?range}

# downstreamDuplicates {=as:downstreamDuplicates .owl:DatatypeProperty .owl:DeprecatedProperty label @en}
[Object] {+as:Object ?domain}
[xsd:anyURI] {+xsd:anyURI ?range}

# duration {=as:duration .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The duration of the object] {comment @en}
[Object] {+as:Object ?domain}
[xsd:duration] {+xsd:duration ?range}

# endTime {=as:endTime .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The ending time of the object] {comment @en}
[Object] {+as:Object ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# first {=as:first .owl:FunctionalProperty .owl:ObjectProperty label @en}
[Collection] {+as:Collection ?domain}

# formerType {=as:formerType .owl:FunctionalProperty .owl:ObjectProperty label @en}
[On a Tombstone object, describes the former type of the deleted object] {comment @en}
[Tombstone] {+as:Tombstone ?domain}
[Object] {+as:Object ?range}

# generator {=as:generator .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# height {=as:height .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The display height expressed as device independent pixels] {comment @en}
[Link] {+as:Link ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# href {=as:href .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The target URI of the Link] {comment @en}
[Link] {+as:Link ?domain}
[xsd:anyURI] {+xsd:anyURI ?range}

# hreflang {=as:hreflang .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[A hint about the language of the referenced resource] {comment @en}
[Link] {+as:Link ?domain}
[xsd:language] {+xsd:language ?range}

# icon {=as:icon .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# id {=as:id .owl:DatatypeProperty .owl:DeprecatedProperty .owl:FunctionalProperty label @en}
[xsd:anyURI] {+xsd:anyURI ?range}

# image {=as:image .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# inReplyTo {=as:inReplyTo .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# instrument {=as:instrument .owl:ObjectProperty label @en}
[Indentifies an object used (or to be used) to complete an activity] {comment @en}
[Activity] {+as:Activity ?domain}

# items {=as:items .owl:ObjectProperty label @en}
[Collection] {+as:Collection ?domain}

# last {=as:last .owl:FunctionalProperty .owl:ObjectProperty label @en}
[Collection] {+as:Collection ?domain}

# latitude {=as:latitude .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The latitude] {comment @en}
[Place] {+as:Place ?domain}
[xsd:float] {+xsd:float ?range}

# location {=as:location .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# longitude {=as:longitude .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The longitude] {comment @en}
[Place] {+as:Place ?domain}
[xsd:float] {+xsd:float ?range}

# mediaType {=as:mediaType .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The MIME Media Type] {comment @en}
[xsd:string] {+xsd:string ?range}

# name {=as:name .owl:DatatypeProperty label @en}
[The default, plain-text display name of the object or link.] {comment @en}

# next {=as:next .owl:FunctionalProperty .owl:ObjectProperty label @en}
[CollectionPage] {+as:CollectionPage ?domain}

# object {=as:object .owl:ObjectProperty label @en}

# objectType {=as:objectType .owl:DatatypeProperty .owl:DeprecatedProperty .owl:FunctionalProperty label @en}
[Object] {+as:Object ?domain}
[xsd:anyURI] {+xsd:anyURI ?range}

# oneOf {=as:oneOf .owl:ObjectProperty label @en}
[Describes a possible exclusive answer or option for a question.] {comment @en}
[Question] {+as:Question ?domain}

# origin {=as:origin .owl:ObjectProperty label @en}
[For certain activities, specifies the entity from which the action is directed.] {comment @en}
[Activity] {+as:Activity ?domain}

# partOf {=as:partOf .owl:FunctionalProperty .owl:ObjectProperty label @en}
[CollectionPage] {+as:CollectionPage ?domain}

# prev {=as:prev .owl:FunctionalProperty .owl:ObjectProperty label @en}
[CollectionPage] {+as:CollectionPage ?domain}

# preview {=as:preview .owl:ObjectProperty label @en}

# provider {=as:provider .owl:DeprecatedProperty .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# published {=as:published .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Specifies the date and time the object was published] {comment @en}
[Object] {+as:Object ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# radius {=as:radius .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Specifies a radius around the point established by the longitude and latitude] {comment @en}
[Place] {+as:Place ?domain}

# rating {=as:rating .owl:DatatypeProperty .owl:DeprecatedProperty .owl:FunctionalProperty label @en}
[A numeric rating (>= 0.0, <= 5.0) for the object] {comment @en}
[Object] {+as:Object ?domain}

# rel {=as:rel .owl:DatatypeProperty label @en}
[The RFC 5988 or HTML5 Link Relation associated with the Link] {comment @en}
[Link] {+as:Link ?domain}
[xsd:string] {+xsd:string ?range}

# relationship {=as:relationship .owl:ObjectProperty label @en}
[On a Relationship object, describes the type of relationship] {comment @en}
[Relationship] {+as:Relationship ?domain}
[rdf:Property] {+rdf:Property ?range}
[rdf:predicate] {+rdf:predicate ?subPropertyOf}

# replies {=as:replies .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}
[Collection] {+as:Collection ?range}

# result {=as:result .owl:ObjectProperty label @en}
[Activity] {+as:Activity ?domain}

# startIndex {=as:startIndex .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[In a strictly ordered logical collection, specifies the index position of the first item in the items list] {comment @en}
[OrderedCollectionPage] {+as:OrderedCollectionPage ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# startTime {=as:startTime .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The starting time of the object] {comment @en}
[Object] {+as:Object ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# a {=as:subject .owl:FunctionalProperty .owl:ObjectProperty label @en}
[On a Relationship object, identifies the subject. e.g. when saying "John is connected to Sally", 'subject' refers to 'John'] {comment @en}
[Relationship] {+as:Relationship ?domain}
[rdf:subject] {+rdf:subject ?subPropertyOf}

# summary {=as:summary .owl:DatatypeProperty label @en}
[A short summary of the object] {comment @en}
[Object] {+as:Object ?domain}

# tag {=as:tag .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# tags {=as:tags .owl:DeprecatedProperty .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}
[tag] {+as:tag ?owl:equivalentProperty}

# target {=as:target .owl:ObjectProperty label @en}
[Activity] {+as:Activity ?domain}

# to {=as:to .owl:ObjectProperty label @en}
[Object] {+as:Object ?domain}

# totalItems {=as:totalItems .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[The total number of items in a logical collection] {comment @en}
[Collection] {+as:Collection ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# units {=as:units .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Identifies the unit of measurement used by the radius, altitude and accuracy properties. The value can be expressed either as one of a set of predefined units or as a well-known common URI that identifies units.] {comment @en}
[Place] {+as:Place ?domain}

# updated {=as:updated .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Specifies when the object was last updated] {comment @en}
[Object] {+as:Object ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# upstreamDuplicates {=as:upstreamDuplicates .owl:DatatypeProperty .owl:DeprecatedProperty label @en}
[Object] {+as:Object ?domain}
[xsd:anyURI] {+xsd:anyURI ?range}

# url {=as:url .owl:ObjectProperty label @en}
[Specifies a link to a specific representation of the Object] {comment @en}
[Object] {+as:Object ?domain}

# verb {=as:verb .owl:DatatypeProperty .owl:DeprecatedProperty .owl:FunctionalProperty label @en}
[Activity] {+as:Activity ?domain}
[xsd:anyURI] {+xsd:anyURI ?range}

# width {=as:width .owl:DatatypeProperty .owl:FunctionalProperty label @en}
[Specifies the preferred display width of the content, expressed in terms of device independent pixels.] {comment @en}
[Link] {+as:Link ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# n3-0 {=n3-0 .owl:Class}

# n3-1 {=n3-1}
[Object] {+as:Object ?rdf:first}

# n3-10 {=n3-10}
[Link] {+as:Link ?rdf:first}

# n3-100 {=n3-100}
[Object] {+as:Object ?rdf:first}

# n3-101 {=n3-101}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-102 {=n3-102 .owl:Class}

# n3-103 {=n3-103}
[Object] {+as:Object ?rdf:first}

# n3-104 {=n3-104}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-105 {=n3-105 .owl:Class}

# n3-106 {=n3-106}
[Object] {+as:Object ?rdf:first}

# n3-107 {=n3-107}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-108 {=n3-108 .owl:Class}

# n3-109 {=n3-109}
[Object] {+as:Object ?rdf:first}

# n3-11 {=n3-11}
[Object] {+as:Object ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-110 {=n3-110}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-111 {=n3-111 .owl:Class}

# n3-112 {=n3-112}
[Object] {+as:Object ?rdf:first}

# n3-113 {=n3-113}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-114 {=n3-114 .owl:Class}

# n3-115 {=n3-115}
[Link] {+as:Link ?rdf:first}

# n3-116 {=n3-116}
[owl:Thing] {+owl:Thing ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-117 {=n3-117 .owl:Class}

# n3-118 {=n3-118}
[Link] {+as:Link ?rdf:first}

# n3-119 {=n3-119}
[Object] {+as:Object ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-12 {=n3-12 .owl:Class}

# n3-120 {=n3-120 .Datatype}
[xsd:float] {+xsd:float ?owl:onDatatype}

# n3-121 {=n3-121}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-122 {=n3-122}
`0.0` {xsd:minInclusive ^^xsd:float}

# n3-123 {=n3-123 .owl:Class}

# n3-124 {=n3-124}
[rdf:langString] {+rdf:langString ?rdf:first}

# n3-125 {=n3-125}
[xsd:string] {+xsd:string ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-126 {=n3-126 .owl:Class}

# n3-127 {=n3-127}
[rdf:langString] {+rdf:langString ?rdf:first}

# n3-128 {=n3-128}
[xsd:string] {+xsd:string ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-129 {=n3-129 .owl:Class}

# n3-13 {=n3-13}
[Object] {+as:Object ?rdf:first}

# n3-130 {=n3-130}
[Object] {+as:Object ?rdf:first}

# n3-131 {=n3-131}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-132 {=n3-132 .owl:Class}

# n3-133 {=n3-133}
[Link] {+as:Link ?rdf:first}

# n3-134 {=n3-134}
[Object] {+as:Object ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-135 {=n3-135 .owl:Class}

# n3-136 {=n3-136}
[Link] {+as:Link ?rdf:first}

# n3-137 {=n3-137}
[Object] {+as:Object ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-138 {=n3-138 .Datatype}
[xsd:float] {+xsd:float ?owl:onDatatype}

# n3-139 {=n3-139}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-14 {=n3-14}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-140 {=n3-140}
`0.0` {xsd:minInclusive ^^xsd:float}

# n3-141 {=n3-141 .Datatype}
[xsd:float] {+xsd:float ?owl:onDatatype}

# n3-142 {=n3-142}

# n3-143 {=n3-143}
`0.0` {xsd:minInclusive ^^xsd:float}

# n3-144 {=n3-144}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-145 {=n3-145}
`5.0` {xsd:maxInclusive ^^xsd:float}

# n3-146 {=n3-146 .owl:Class}

# n3-147 {=n3-147}
[rdf:langString] {+rdf:langString ?rdf:first}

# n3-148 {=n3-148}
[xsd:string] {+xsd:string ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-149 {=n3-149 .Datatype}

# n3-15 {=n3-15 .owl:Class}

# n3-150 {=n3-150}

# n3-151 {=n3-151 .Datatype}

# n3-152 {=n3-152}
[inches] {rdf:first}

# n3-153 {=n3-153}
[feet] {rdf:first}

# n3-154 {=n3-154}
[miles] {rdf:first}

# n3-155 {=n3-155}
[cm] {rdf:first}

# n3-156 {=n3-156}
[m] {rdf:first}

# n3-157 {=n3-157}
[km] {rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-158 {=n3-158}
[xsd:anyURI] {+xsd:anyURI ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-159 {=n3-159 .owl:Restriction}
[0] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[object] {+as:object ?owl:onProperty}

# n3-16 {=n3-16}
[Object] {+as:Object ?rdf:first}

# n3-160 {=n3-160 .owl:Class}

# n3-161 {=n3-161}
[Collection] {+as:Collection ?rdf:first}

# n3-162 {=n3-162}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-163 {=n3-163 .owl:Restriction}
[items] {+as:items ?owl:onProperty}

# n3-164 {=n3-164 .owl:Class}

# n3-165 {=n3-165}
[OrderedItems] {+as:OrderedItems ?rdf:first}

# n3-166 {=n3-166}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-167 {=n3-167 .owl:Class}

# n3-168 {=n3-168 .owl:Class}

# n3-169 {=n3-169}
[Object] {+as:Object ?rdf:first}

# n3-17 {=n3-17}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-170 {=n3-170}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-171 {=n3-171 .owl:Class}

# n3-172 {=n3-172}
[rdf:List] {+rdf:List ?rdf:first}

# n3-173 {=n3-173}

# n3-174 {=n3-174 .owl:Restriction}
[rdf:first] {+rdf:first ?owl:onProperty}

# n3-175 {=n3-175 .owl:Class}

# n3-176 {=n3-176}
[Object] {+as:Object ?rdf:first}

# n3-177 {=n3-177}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-178 {=n3-178}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-179 {=n3-179 .owl:Restriction}
[OrderedItems] {+as:OrderedItems ?owl:allValuesFrom}
[rdf:rest] {+rdf:rest ?owl:onProperty}

# n3-18 {=n3-18 .owl:Class}

# n3-19 {=n3-19}
[Object] {+as:Object ?rdf:first}

# n3-2 {=n3-2}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-20 {=n3-20}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-21 {=n3-21 .owl:Class}

# n3-22 {=n3-22}
[Object] {+as:Object ?rdf:first}

# n3-23 {=n3-23}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-24 {=n3-24 .owl:Class}

# n3-25 {=n3-25}
[Object] {+as:Object ?rdf:first}

# n3-26 {=n3-26}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-27 {=n3-27 .owl:Class}

# n3-28 {=n3-28}
[Object] {+as:Object ?rdf:first}

# n3-29 {=n3-29}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-3 {=n3-3 .owl:Class}

# n3-30 {=n3-30 .owl:Class}

# n3-31 {=n3-31}
[CollectionPage] {+as:CollectionPage ?rdf:first}

# n3-32 {=n3-32}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-33 {=n3-33 .owl:Class}

# n3-34 {=n3-34}
[CollectionPage] {+as:CollectionPage ?rdf:first}

# n3-35 {=n3-35}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-36 {=n3-36 .owl:Class}

# n3-37 {=n3-37}
[Object] {+as:Object ?rdf:first}

# n3-38 {=n3-38}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-39 {=n3-39 .owl:Class}

# n3-4 {=n3-4}
[Object] {+as:Object ?rdf:first}

# n3-40 {=n3-40}
[Image] {+as:Image ?rdf:first}

# n3-41 {=n3-41}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-42 {=n3-42 .owl:Class}

# n3-43 {=n3-43}
[Image] {+as:Image ?rdf:first}

# n3-44 {=n3-44}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-45 {=n3-45 .owl:Class}

# n3-46 {=n3-46}
[Object] {+as:Object ?rdf:first}

# n3-47 {=n3-47}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-48 {=n3-48 .owl:Class}

# n3-49 {=n3-49}

# n3-5 {=n3-5}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-50 {=n3-50 .owl:Class}

# n3-51 {=n3-51}
[Object] {+as:Object ?rdf:first}

# n3-52 {=n3-52}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-53 {=n3-53}
[OrderedItems] {+as:OrderedItems ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-54 {=n3-54 .owl:Class}

# n3-55 {=n3-55}
[CollectionPage] {+as:CollectionPage ?rdf:first}

# n3-56 {=n3-56}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-57 {=n3-57 .owl:Class}

# n3-58 {=n3-58}
[Object] {+as:Object ?rdf:first}

# n3-59 {=n3-59}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-6 {=n3-6 .owl:Class}

# n3-60 {=n3-60 .owl:Class}

# n3-61 {=n3-61}
[CollectionPage] {+as:CollectionPage ?rdf:first}

# n3-62 {=n3-62}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-63 {=n3-63 .owl:Class}

# n3-64 {=n3-64}
[Activity] {+as:Activity ?rdf:first}

# n3-65 {=n3-65}
[Relationship] {+as:Relationship ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-66 {=n3-66 .owl:Class}

# n3-67 {=n3-67}
[Object] {+as:Object ?rdf:first}

# n3-68 {=n3-68}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-69 {=n3-69 .owl:Class}

# n3-7 {=n3-7}
[Object] {+as:Object ?rdf:first}

# n3-70 {=n3-70}
[Object] {+as:Object ?rdf:first}

# n3-71 {=n3-71}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-72 {=n3-72 .owl:Class}

# n3-73 {=n3-73}
[Object] {+as:Object ?rdf:first}

# n3-74 {=n3-74}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-75 {=n3-75 .owl:Class}

# n3-76 {=n3-76}
[CollectionPage] {+as:CollectionPage ?rdf:first}

# n3-77 {=n3-77}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-78 {=n3-78 .owl:Class}

# n3-79 {=n3-79}
[Object] {+as:Object ?rdf:first}

# n3-8 {=n3-8}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-80 {=n3-80}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-81 {=n3-81 .owl:Class}

# n3-82 {=n3-82}
[Object] {+as:Object ?rdf:first}

# n3-83 {=n3-83}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-84 {=n3-84 .owl:Class}

# n3-85 {=n3-85}
[Object] {+as:Object ?rdf:first}

# n3-86 {=n3-86}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-87 {=n3-87 .owl:Class}

# n3-88 {=n3-88}
[Object] {+as:Object ?rdf:first}

# n3-89 {=n3-89}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-9 {=n3-9 .owl:Class}

# n3-90 {=n3-90 .owl:Class}

# n3-91 {=n3-91}
[Object] {+as:Object ?rdf:first}

# n3-92 {=n3-92}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-93 {=n3-93 .owl:Class}

# n3-94 {=n3-94}
[Collection] {+as:Collection ?rdf:first}

# n3-95 {=n3-95}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-96 {=n3-96 .owl:Class}

# n3-97 {=n3-97}
[Object] {+as:Object ?rdf:first}

# n3-98 {=n3-98}
[Link] {+as:Link ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-99 {=n3-99 .owl:Class}

