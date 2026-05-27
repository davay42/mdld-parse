[cc] <http://creativecommons.org/ns#>
[dc] <http://purl.org/dc/terms/>
[hydra] <http://www.w3.org/ns/hydra/core#>
[owl] <http://www.w3.org/2002/07/owl#>
[preferredPrefix] <http://purl.org/vocab/vann/preferredNamespacePrefix>
[schema] <http://schema.org/>
[vs] <http://www.w3.org/2003/06/sw-vocab-status/ns#>

# The Hydra Core Vocabulary {=http://www.w3.org/ns/hydra/core .owl:Ontology label}
[Hydra W3C Community Group] {cc:attributionName}
[The Hydra Core Vocabulary is a lightweight vocabulary to create hypermedia-driven Web APIs. By specifying a number of concepts commonly used in Web APIs it enables the creation of generic API clients.] {dc:description}
[Hydra W3C Community Group] {dc:publisher}
[Copyright © 2012-2014 the Contributors to the Hydra Core Vocabulary Specification] {dc:rights}
[hydra] {preferredPrefix:}
[A lightweight vocabulary for hypermedia-driven Web APIs] {comment}
[http://www.hydra-cg.com/] {+http://www.hydra-cg.com/ ?cc:attributionURL}
[http://creativecommons.org/licenses/by/4.0/] {+http://creativecommons.org/licenses/by/4.0/ ?cc:license}

# ApiDocumentation {=hydra:ApiDocumentation .hydra:Class label}
[The Hydra API documentation class] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# BasicRepresentation {=hydra:BasicRepresentation .hydra:VariableRepresentation label}
[A representation that serializes just the lexical form of a variable value, but omits language and type information.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}

# Hydra Class {=hydra:Class .Class .hydra:Resource label}
[The class of Hydra classes. Hydra classes and their instances are dereferenceable resources.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Class] {+Class ?subClassOf}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Collection {=hydra:Collection .hydra:Class label}
[A collection holding references to a number of related resources.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Error {=hydra:Error .hydra:Class label}
[A runtime error, used to report information beyond the returned status code.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Status code description] {+hydra:Status ?subClassOf}

# ExplicitRepresentation {=hydra:ExplicitRepresentation .hydra:VariableRepresentation label}
[A representation that serializes a variable value including its language and type information and thus differentiating between IRIs and literals.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}

# IRI Template {=hydra:IriTemplate .hydra:Class label}
[The class of IRI templates.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# IriTemplateMapping {=hydra:IriTemplateMapping .hydra:Class label}
[A mapping from an IRI template variable to a property.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Link {=hydra:Link .hydra:Class label}
[The class of properties representing links.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Operation {=hydra:Operation .hydra:Class label}
[An operation.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# PartialCollectionView {=hydra:PartialCollectionView .hydra:Class label}
[A PartialCollectionView describes a partial view of a Collection. Multiple PartialCollectionViews can be connected with the the next/previous properties to allow a client to retrieve all members of the collection.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Hydra Resource {=hydra:Resource .hydra:Class label}
[The class of dereferenceable resources.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# RFC6570 IRI template {=hydra:Rfc6570Template .Datatype label}
[An IRI template as defined by RFC6570.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[http://tools.ietf.org/html/rfc6570] {+http://tools.ietf.org/html/rfc6570 ?seeAlso}

# Status code description {=hydra:Status .hydra:Class label}
[Additional information about a status code that might be returned.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Supported Property {=hydra:SupportedProperty .hydra:Class label}
[A property known to be supported by a Hydra class.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# Templated Link {=hydra:TemplatedLink .hydra:Class label}
[A templated link.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# VariableRepresentation {=hydra:VariableRepresentation .hydra:Class label}
[A representation specifies how to serialize variable values into strings.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?subClassOf}

# apiDocumentation {=hydra:apiDocumentation .hydra:Link label}
[A link to the API documentation] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[ApiDocumentation] {+hydra:ApiDocumentation ?range}

# collection {=hydra:collection .hydra:Link label}
[Collections somehow related to this resource.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Collection] {+hydra:Collection ?range}

# description {=hydra:description .rdf:Property label}
[A description.] {comment}
[testing] {vs:term_status}
[ApiDocumentation] {+hydra:ApiDocumentation ?schema:domainIncludes}
[Hydra Class] {+hydra:Class ?schema:domainIncludes}
[Link] {+hydra:Link ?schema:domainIncludes}
[Operation] {+hydra:Operation ?schema:domainIncludes}
[Status code description] {+hydra:Status ?schema:domainIncludes}
[Supported Property] {+hydra:SupportedProperty ?schema:domainIncludes}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[comment] {+comment ?subPropertyOf}

# entrypoint {=hydra:entrypoint .hydra:Link label}
[A link to main entry point of the Web API] {comment}
[testing] {vs:term_status}
[ApiDocumentation] {+hydra:ApiDocumentation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# expects {=hydra:expects .hydra:Link label}
[The information expected by the Web API.] {comment}
[testing] {vs:term_status}
[Operation] {+hydra:Operation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Class] {+hydra:Class ?range}

# expects header {=hydra:expectsHeader .rdf:Property label}
[Specification of the header expected by the operation.] {comment}
[testing] {vs:term_status}
[Operation] {+hydra:Operation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# first {=hydra:first .hydra:Link label}
[The first resource of an interlinked set of resources.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# freetext query {=hydra:freetextQuery .rdf:Property label}
[A property representing a freetext query.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# last {=hydra:last .hydra:Link label}
[The last resource of an interlinked set of resources.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# take {=hydra:limit .rdf:Property label}
[Instructs to limit set only to N elements.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# manages {=hydra:manages label}
[Semantics of each member provided by the collection.] {comment}
[testing] {vs:term_status}
[Collection] {+hydra:Collection ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}

# mapping {=hydra:mapping .rdf:Property label}
[A variable-to-property mapping of the IRI template.] {comment}
[testing] {vs:term_status}
[IRI Template] {+hydra:IriTemplate ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[IriTemplateMapping] {+hydra:IriTemplateMapping ?range}

# member {=hydra:member .hydra:Link label}
[A member of the collection] {comment}
[testing] {vs:term_status}
[Collection] {+hydra:Collection ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# method {=hydra:method .rdf:Property label}
[The HTTP method.] {comment}
[testing] {vs:term_status}
[Operation] {+hydra:Operation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# next {=hydra:next .hydra:Link label}
[The resource following the current instance in an interlinked set of resources.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# object {=hydra:object label}
[The object.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}

# skip {=hydra:offset .rdf:Property label}
[Instructs to skip N elements of the set.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# operation {=hydra:operation .hydra:Link label}
[An operation supported by the Hydra resource] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Operation] {+hydra:Operation ?range}

# page index {=hydra:pageIndex .rdf:Property label}
[Instructs to provide a specific page of the collection at a given index.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}
[page reference] {+hydra:pageReference ?subPropertyOf}

# page reference {=hydra:pageReference .rdf:Property label}
[Instructs to provide a specific page reference of the collection.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}

# possible status {=hydra:possibleStatus .hydra:Link label}
[A status that might be returned by the Web API (other statuses should be expected and properly handled as well)] {comment}
[testing] {vs:term_status}
[ApiDocumentation] {+hydra:ApiDocumentation ?schema:domainIncludes}
[Operation] {+hydra:Operation ?schema:domainIncludes}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Status code description] {+hydra:Status ?range}

# previous {=hydra:previous .hydra:Link label}
[The resource preceding the current instance in an interlinked set of resources.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# property {=hydra:property .rdf:Property label}
[A property] {comment}
[testing] {vs:term_status}
[IriTemplateMapping] {+hydra:IriTemplateMapping ?schema:domainIncludes}
[Supported Property] {+hydra:SupportedProperty ?schema:domainIncludes}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

# readable {=hydra:readable .rdf:Property label}
[True if the client can retrieve the property's value, false otherwise.] {comment}
[testing] {vs:term_status}
[Supported Property] {+hydra:SupportedProperty ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# required {=hydra:required .rdf:Property label}
[True if the property is required, false otherwise.] {comment}
[testing] {vs:term_status}
[IriTemplateMapping] {+hydra:IriTemplateMapping ?schema:domainIncludes}
[Supported Property] {+hydra:SupportedProperty ?schema:domainIncludes}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# returns {=hydra:returns .hydra:Link label}
[The information returned by the Web API on success] {comment}
[testing] {vs:term_status}
[Operation] {+hydra:Operation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Class] {+hydra:Class ?range}

# returns header {=hydra:returnsHeader .rdf:Property label}
[Name of the header returned by the operation.] {comment}
[testing] {vs:term_status}
[Operation] {+hydra:Operation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# search {=hydra:search .hydra:TemplatedLink label}
[A IRI template that can be used to query a collection.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[IRI Template] {+hydra:IriTemplate ?range}

# status code {=hydra:statusCode .rdf:Property label}
[The HTTP status code] {comment}
[testing] {vs:term_status}
[Status code description] {+hydra:Status ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

# subject {=hydra:subject label}
[The subject.] {comment}
[testing] {vs:term_status}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}

# supported classes {=hydra:supportedClass .hydra:Link label}
[A class known to be supported by the Web API] {comment}
[testing] {vs:term_status}
[ApiDocumentation] {+hydra:ApiDocumentation ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Class] {+hydra:Class ?range}

# supported operation {=hydra:supportedOperation .hydra:Link label}
[An operation supported by instances of the specific Hydra class or the target of the Hydra link] {comment}
[testing] {vs:term_status}
[Hydra Class] {+hydra:Class ?schema:domainIncludes}
[Link] {+hydra:Link ?schema:domainIncludes}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Operation] {+hydra:Operation ?range}

# supported properties {=hydra:supportedProperty .hydra:Link label}
[The properties known to be supported by a Hydra class] {comment}
[testing] {vs:term_status}
[Hydra Class] {+hydra:Class ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Supported Property] {+hydra:SupportedProperty ?range}

# template {=hydra:template .rdf:Property label}
[A templated string with placeholders. The literal's datatype indicates the template syntax; if not specified, hydra:Rfc6570Template is assumed.] {comment}
[testing] {vs:term_status}
[IRI Template] {+hydra:IriTemplate ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[RFC6570 IRI template] {+hydra:Rfc6570Template ?range}
[RFC6570 IRI template] {+hydra:Rfc6570Template ?seeAlso}

# title {=hydra:title .rdf:Property label}
[A title, often used along with a description.] {comment}
[testing] {vs:term_status}
[ApiDocumentation] {+hydra:ApiDocumentation ?schema:domainIncludes}
[Hydra Class] {+hydra:Class ?schema:domainIncludes}
[Link] {+hydra:Link ?schema:domainIncludes}
[Operation] {+hydra:Operation ?schema:domainIncludes}
[Status code description] {+hydra:Status ?schema:domainIncludes}
[Supported Property] {+hydra:SupportedProperty ?schema:domainIncludes}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[label] {+label ?subPropertyOf}

# total items {=hydra:totalItems .rdf:Property label}
[The total number of items referenced by a collection.] {comment}
[testing] {vs:term_status}
[Collection] {+hydra:Collection ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

# variable {=hydra:variable .rdf:Property label}
[An IRI template variable] {comment}
[testing] {vs:term_status}
[IriTemplateMapping] {+hydra:IriTemplateMapping ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# variable representation {=hydra:variableRepresentation .rdf:Property label}
[The representation format to use when expanding the IRI template.] {comment}
[testing] {vs:term_status}
[IriTemplateMapping] {+hydra:IriTemplateMapping ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[VariableRepresentation] {+hydra:VariableRepresentation ?range}

# view {=hydra:view .hydra:Link label}
[A specific view of a resource.] {comment}
[testing] {vs:term_status}
[Hydra Resource] {+hydra:Resource ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[Hydra Resource] {+hydra:Resource ?range}

# writeable {=hydra:writeable .rdf:Property label}
[True if the client can change the property's value, false otherwise.] {comment}
[testing] {vs:term_status}
[Supported Property] {+hydra:SupportedProperty ?domain}
[The Hydra Core Vocabulary] {+http://www.w3.org/ns/hydra/core ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

