[as] <http://www.w3.org/ns/activitystreams#>
[dc] <http://purl.org/dc/elements/1.1/>
[dcterms] <http://purl.org/dc/terms/>
[foaf] <http://xmlns.com/foaf/0.1/>
[oa] <http://www.w3.org/ns/oa#>
[owl] <http://www.w3.org/2002/07/owl#>
[skos] <http://www.w3.org/2004/02/skos/core#>

#  {=oa: .owl:Ontology}
[Web Annotation Ontology] {dc:title}
[2016-11-12T21:28:11Z] {dcterms:modified}
[The Web Annotation ontology defines the terms of the Web Annotation vocabulary. Any changes to this document MUST be from a Working Group in the W3C that has established expertise in the area.] {comment}
[2016-11-12T21:28:11Z] {owl:versionInfo}
[http://www.w3.org/TR/annotation-vocab/] {+http://www.w3.org/TR/annotation-vocab/ ?seeAlso}
[http://www.openannotation.org/spec/core/20130208/oa.owl] {+http://www.openannotation.org/spec/core/20130208/oa.owl ?prov:wasRevisionOf}

# Annotation {=oa:Annotation .Class label}
[The class for Web Annotations.] {comment}
[oa:] {+oa: ?isDefinedBy}

# Choice {=oa:Choice .Class label}
[A subClass of  as:OrderedCollection  that conveys to a consuming application that it should select one of the resources in the  as:items  list to use, rather than all of them.  This is typically used to provide a choice of resources to render to the user, based on further supplied properties.  If the consuming application cannot determine the user's preference, then it should use the first in the list.] {comment}
[oa:] {+oa: ?isDefinedBy}
[as:OrderedCollection] {+as:OrderedCollection ?subClassOf}

# CssSelector {=oa:CssSelector .Class label}
[A CssSelector describes a Segment of interest in a representation that conforms to the Document Object Model through the use of the CSS selector specification.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# CssStyle {=oa:CssStyle .Class label}
[A resource which describes styles for resources participating in the Annotation using CSS.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Style] {+oa:Style ?subClassOf}

# DataPositionSelector {=oa:DataPositionSelector .Class label}
[DataPositionSelector describes a range of data by recording the start and end positions of the selection in the stream. Position 0 would be immediately before the first byte, position 1 would be immediately before the second byte, and so on. The start byte is thus included in the list, but the end byte is not.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# Direction {=oa:Direction .Class label}
[A class to encapsulate the different text directions that a textual resource might take.  It is not used directly in the Annotation Model, only its three instances.] {comment}
[oa:] {+oa: ?isDefinedBy}

# FragmentSelector {=oa:FragmentSelector .Class label}
[The FragmentSelector class is used to record the segment of a representation using the IRI fragment specification defined by the representation's media type.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# HttpRequestState {=oa:HttpRequestState .Class label}
[The HttpRequestState class is used to record the HTTP request headers that a client SHOULD use to request the correct representation from the resource. ] {comment}
[oa:] {+oa: ?isDefinedBy}
[State] {+oa:State ?subClassOf}

# Motivation {=oa:Motivation .Class label}
[The Motivation class is used to record the user's intent or motivation for the creation of the Annotation, or the inclusion of the body or target, that it is associated with.] {comment}
[oa:] {+oa: ?isDefinedBy}
[skos:Concept] {+skos:Concept ?subClassOf}

# PreferContainedDescriptions {=oa:PreferContainedDescriptions .Resource label}
[An IRI to signal the client prefers to receive full descriptions of the Annotations from a container, not just their IRIs.] {comment}
[oa:] {+oa: ?isDefinedBy}

# PreferContainedIRIs {=oa:PreferContainedIRIs .Resource label}
[An IRI to signal that the client prefers to receive only the IRIs of the Annotations from a container, not their full descriptions.] {comment}
[oa:] {+oa: ?isDefinedBy}

# RangeSelector {=oa:RangeSelector .Class label}
[A Range Selector can be used to identify the beginning and the end of the selection by using other Selectors. The selection consists of everything from the beginning of the starting selector through to the beginning of the ending selector, but not including it.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# ResourceSelection {=oa:ResourceSelection .Class label}
[Instances of the ResourceSelection class identify part (described by an oa:Selector) of another resource (referenced with oa:hasSource), possibly from a particular representation of a resource (described by an oa:State). Please note that ResourceSelection is not used directly in the Web Annotation model, but is provided as a separate class for further application profiles to use, separate from oa:SpecificResource which has many Annotation specific features.] {comment}
[oa:] {+oa: ?isDefinedBy}

# Selector {=oa:Selector .Class label}
[A resource which describes the segment of interest in a representation of a Source resource, indicated with oa:hasSelector from the Specific Resource. This class is not used directly in the Annotation model, only its subclasses.] {comment}
[oa:] {+oa: ?isDefinedBy}

# SpecificResource {=oa:SpecificResource .Class label}
[Instances of the SpecificResource class identify part of another resource (referenced with oa:hasSource), a particular representation of a resource, a resource with styling hints for renders, or any combination of these, as used within an Annotation.] {comment}
[oa:] {+oa: ?isDefinedBy}
[ResourceSelection] {+oa:ResourceSelection ?subClassOf}

# State {=oa:State .Class label}
[A State describes the intended state of a resource as applied to the particular Annotation, and thus provides the information needed to retrieve the correct representation of that resource.] {comment}
[oa:] {+oa: ?isDefinedBy}

# Style {=oa:Style .Class label}
[A Style describes the intended styling of a resource as applied to the particular Annotation, and thus provides the information to ensure that rendering is consistent across implementations.] {comment}
[oa:] {+oa: ?isDefinedBy}

# SvgSelector {=oa:SvgSelector .Class label}
[An SvgSelector defines an area through the use of the Scalable Vector Graphics [SVG] standard. This allows the user to select a non-rectangular area of the content, such as a circle or polygon by describing the region using SVG. The SVG may be either embedded within the Annotation or referenced as an External Resource.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# TextPositionSelector {=oa:TextPositionSelector .Class label}
[The TextPositionSelector describes a range of text by recording the start and end positions of the selection in the stream. Position 0 would be immediately before the first character, position 1 would be immediately before the second character, and so on.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# TextQuoteSelector {=oa:TextQuoteSelector .Class label}
[The TextQuoteSelector describes a range of text by copying it, and including some of the text immediately before (a prefix) and after (a suffix) it to distinguish between multiple copies of the same sequence of characters.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# TextualBody {=oa:TextualBody .Class label}
[[object Object]] {comment}
[oa:] {+oa: ?isDefinedBy}

# TimeState {=oa:TimeState .Class label}
[A TimeState records the time at which the resource's state is appropriate for the Annotation, typically the time that the Annotation was created and/or a link to a persistent copy of the current version.] {comment}
[oa:] {+oa: ?isDefinedBy}
[State] {+oa:State ?subClassOf}

# XPathSelector {=oa:XPathSelector .Class label}
[ An XPathSelector is used to select elements and content within a resource that supports the Document Object Model via a specified XPath value.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?subClassOf}

# annotationService {=oa:annotationService .rdf:Property label}
~~~ {comment}
The object of the relationship is the end point of a service that conforms to the annotation-protocol, and it may be associated with any resource.  The expectation of asserting the relationship is that the object is the preferred service for maintaining annotations about the subject resource, according to the publisher of the relationship.

  This relationship is intended to be used both within Linked Data descriptions and as the  rel  type of a Link, via HTTP Link Headers rfc5988 for binary resources and in HTML <link> elements.  For more information about these, please see the Annotation Protocol specification annotation-protocol.
  
~~~

[oa:] {+oa: ?isDefinedBy}

# assessing {=oa:assessing .oa:Motivation label}
[The motivation for when the user intends to provide an assessment about the Target resource.] {comment}
[oa:] {+oa: ?isDefinedBy}

# bodyValue {=oa:bodyValue .rdf:Property label}
~~~ {comment}
The object of the predicate is a plain text string to be used as the content of the body of the Annotation.  The value MUST be an  xsd:string  and that data type MUST NOT be expressed in the serialization. Note that language MUST NOT be associated with the value either as a language tag, as that is only available for  rdf:langString .
  
~~~

[Annotation] {+oa:Annotation ?domain}
[oa:] {+oa: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# bookmarking {=oa:bookmarking .oa:Motivation label}
[The motivation for when the user intends to create a bookmark to the Target or part thereof.] {comment}
[oa:] {+oa: ?isDefinedBy}

# cachedSource {=oa:cachedSource .rdf:Property label}
[A object of the relationship is a copy of the Source resource's representation, appropriate for the Annotation.] {comment}
[TimeState] {+oa:TimeState ?domain}
[oa:] {+oa: ?isDefinedBy}

# canonical {=oa:canonical .rdf:Property label}
[A object of the relationship is the canonical IRI that can always be used to deduplicate the Annotation, regardless of the current IRI used to access the representation.] {comment}
[oa:] {+oa: ?isDefinedBy}

# classifying {=oa:classifying .oa:Motivation label}
[The motivation for when the user intends to that classify the Target as something.] {comment}
[oa:] {+oa: ?isDefinedBy}

# commenting {=oa:commenting .oa:Motivation label}
[The motivation for when the user intends to comment about the Target.] {comment}
[oa:] {+oa: ?isDefinedBy}

# describing {=oa:describing .oa:Motivation label}
[The motivation for when the user intends to describe the Target, as opposed to a comment about them.] {comment}
[oa:] {+oa: ?isDefinedBy}

# editing {=oa:editing .oa:Motivation label}
[The motivation for when the user intends to request a change or edit to the Target resource.] {comment}
[oa:] {+oa: ?isDefinedBy}

# end {=oa:end .rdf:Property label}
[The end property is used to convey the 0-based index of the end position of a range of content.] {comment}
[oa:] {+oa: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# exact {=oa:exact .rdf:Property label}
[The object of the predicate is a copy of the text which is being selected, after normalization.] {comment}
[oa:] {+oa: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# hasBody {=oa:hasBody .rdf:Property label}
[The object of the relationship is a resource that is a body of the Annotation.] {comment}
[Annotation] {+oa:Annotation ?domain}
[oa:] {+oa: ?isDefinedBy}

# hasEndSelector {=oa:hasEndSelector .rdf:Property label}
[The relationship between a RangeSelector and the Selector that describes the end position of the range. ] {comment}
[RangeSelector] {+oa:RangeSelector ?domain}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?range}

# hasPurpose {=oa:hasPurpose .rdf:Property label}
[The purpose served by the resource in the Annotation.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Motivation] {+oa:Motivation ?range}

# hasScope {=oa:hasScope .rdf:Property label}
[The scope or context in which the resource is used within the Annotation.] {comment}
[SpecificResource] {+oa:SpecificResource ?domain}
[oa:] {+oa: ?isDefinedBy}

# hasSelector {=oa:hasSelector .rdf:Property label}
[The object of the relationship is a Selector that describes the segment or region of interest within the source resource.  Please note that the domain ( oa:ResourceSelection ) is not used directly in the Web Annotation model.] {comment}
[ResourceSelection] {+oa:ResourceSelection ?domain}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?range}

# hasSource {=oa:hasSource .rdf:Property label}
[The resource that the ResourceSelection, or its subclass SpecificResource, is refined from, or more specific than. Please note that the domain ( oa:ResourceSelection ) is not used directly in the Web Annotation model.] {comment}
[ResourceSelection] {+oa:ResourceSelection ?domain}
[oa:] {+oa: ?isDefinedBy}

# hasStartSelector {=oa:hasStartSelector .rdf:Property label}
[The relationship between a RangeSelector and the Selector that describes the start position of the range. ] {comment}
[RangeSelector] {+oa:RangeSelector ?domain}
[oa:] {+oa: ?isDefinedBy}
[Selector] {+oa:Selector ?range}

# hasState {=oa:hasState .rdf:Property label}
[The relationship between the ResourceSelection, or its subclass SpecificResource, and a State resource. Please note that the domain ( oa:ResourceSelection ) is not used directly in the Web Annotation model.] {comment}
[ResourceSelection] {+oa:ResourceSelection ?domain}
[oa:] {+oa: ?isDefinedBy}
[State] {+oa:State ?range}

# hasTarget {=oa:hasTarget .rdf:Property label}
[The relationship between an Annotation and its Target.] {comment}
[Annotation] {+oa:Annotation ?domain}
[oa:] {+oa: ?isDefinedBy}

# highlighting {=oa:highlighting .oa:Motivation label}
[The motivation for when the user intends to highlight the Target resource or segment of it.] {comment}
[oa:] {+oa: ?isDefinedBy}

# identifying {=oa:identifying .oa:Motivation label}
[The motivation for when the user intends to assign an identity to the Target or identify what is being depicted or described in the Target.] {comment}
[oa:] {+oa: ?isDefinedBy}

# linking {=oa:linking .oa:Motivation label}
[The motivation for when the user intends to link to a resource related to the Target.] {comment}
[oa:] {+oa: ?isDefinedBy}

# ltrDirection {=oa:ltrDirection .oa:Direction label}
[The direction of text that is read from left to right.] {comment}
[oa:] {+oa: ?isDefinedBy}

# moderating {=oa:moderating .oa:Motivation label}
[The motivation for when the user intends to assign some value or quality to the Target.] {comment}
[oa:] {+oa: ?isDefinedBy}

# motivatedBy {=oa:motivatedBy .rdf:Property label}
[The relationship between an Annotation and a Motivation that describes the reason for the Annotation's creation.] {comment}
[Annotation] {+oa:Annotation ?domain}
[oa:] {+oa: ?isDefinedBy}
[Motivation] {+oa:Motivation ?range}

# prefix {=oa:prefix .rdf:Property label}
[The object of the property is a snippet of content that occurs immediately before the content which is being selected by the Selector.] {comment}
[oa:] {+oa: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# processingLanguage {=oa:processingLanguage .rdf:Property label}
[The object of the property is the language that should be used for textual processing algorithms when dealing with the content of the resource, including hyphenation, line breaking, which font to use for rendering and so forth.  The value must follow the recommendations of BCP47.] {comment}
[oa:] {+oa: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# questioning {=oa:questioning .oa:Motivation label}
[The motivation for when the user intends to ask a question about the Target.] {comment}
[oa:] {+oa: ?isDefinedBy}

# refinedBy {=oa:refinedBy .rdf:Property label}
[The relationship between a Selector and another Selector or a State and a Selector or State that should be applied to the results of the first to refine the processing of the source resource. ] {comment}
[oa:] {+oa: ?isDefinedBy}

# renderedVia {=oa:renderedVia .rdf:Property label}
[A system that was used by the application that created the Annotation to render the resource.] {comment}
[SpecificResource] {+oa:SpecificResource ?domain}
[oa:] {+oa: ?isDefinedBy}

# replying {=oa:replying .oa:Motivation label}
[The motivation for when the user intends to reply to a previous statement, either an Annotation or another resource.] {comment}
[oa:] {+oa: ?isDefinedBy}

# rtlDirection {=oa:rtlDirection .oa:Direction label}
[The direction of text that is read from right to left.] {comment}
[oa:] {+oa: ?isDefinedBy}

# sourceDate {=oa:sourceDate .rdf:Property label}
[The timestamp at which the Source resource should be interpreted as being applicable to the Annotation.] {comment}
[TimeState] {+oa:TimeState ?domain}
[oa:] {+oa: ?isDefinedBy}
[xsd:dateTime] {+xsd:dateTime ?range}

# sourceDateEnd {=oa:sourceDateEnd .rdf:Property label}
[The end timestamp of the interval over which the Source resource should be interpreted as being applicable to the Annotation.] {comment}
[TimeState] {+oa:TimeState ?domain}
[oa:] {+oa: ?isDefinedBy}
[xsd:dateTime] {+xsd:dateTime ?range}

# sourceDateStart {=oa:sourceDateStart .rdf:Property label}
[The start timestamp of the interval over which the Source resource should be interpreted as being applicable to the Annotation.] {comment}
[TimeState] {+oa:TimeState ?domain}
[oa:] {+oa: ?isDefinedBy}
[xsd:dateTime] {+xsd:dateTime ?range}

# start {=oa:start .rdf:Property label}
[The start position in a 0-based index at which a range of content is selected from the data in the source resource.] {comment}
[oa:] {+oa: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# styleClass {=oa:styleClass .rdf:Property label}
[The name of the class used in the CSS description referenced from the Annotation that should be applied to the Specific Resource.] {comment}
[SpecificResource] {+oa:SpecificResource ?domain}
[oa:] {+oa: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# styledBy {=oa:styledBy .rdf:Property label}
[A reference to a Stylesheet that should be used to apply styles to the Annotation rendering.] {comment}
[Annotation] {+oa:Annotation ?domain}
[oa:] {+oa: ?isDefinedBy}
[Style] {+oa:Style ?range}

# suffix {=oa:suffix .rdf:Property label}
[The snippet of text that occurs immediately after the text which is being selected.] {comment}
[oa:] {+oa: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# tagging {=oa:tagging .oa:Motivation label}
[The motivation for when the user intends to associate a tag with the Target.] {comment}
[oa:] {+oa: ?isDefinedBy}

# textDirection {=oa:textDirection .rdf:Property label}
[The direction of the text of the subject resource. There MUST only be one text direction associated with any given resource.] {comment}
[oa:] {+oa: ?isDefinedBy}
[Direction] {+oa:Direction ?range}

# via {=oa:via .rdf:Property label}
[A object of the relationship is a resource from which the source resource was retrieved by the providing system.] {comment}
[oa:] {+oa: ?isDefinedBy}

# n3-0 {=n3-0 .foaf:Person}
[Benjamin Young] {foaf:name}

# n3-1 {=n3-1 .foaf:Person}
[Paolo Ciccarese] {foaf:name}

# n3-2 {=n3-2 .foaf:Person}
[Robert Sanderson] {foaf:name}

