[dc] <http://purl.org/dc/elements/1.1/>
[grddl] <http://www.w3.org/2003/g/data-view#>
[owl] <http://www.w3.org/2002/07/owl#>

#  {=http://www.w3.org/2002/07/owl .owl:Ontology}

[The OWL 2 Schema vocabulary (OWL 2)] {dc:title}
~~~ {comment}

  This ontology partially describes the built-in classes and
  properties that together form the basis of the RDF/XML syntax of OWL 2.
  The content of this ontology is based on Tables 6.1 and 6.2
  in Section 6.4 of the OWL 2 RDF-Based Semantics specification,
  available at http://www.w3.org/TR/owl2-rdf-based-semantics/.
  Please note that those tables do not include the different annotations
  (labels, comments and rdfs:isDefinedBy links) used in this file.
  Also note that the descriptions provided in this ontology do not
  provide a complete and correct formal description of either the syntax
  or the semantics of the introduced terms (please see the OWL 2
  recommendations for the complete and normative specifications).
  Furthermore, the information provided by this ontology may be
  misleading if not used with care. This ontology SHOULD NOT be imported
  into OWL ontologies. Importing this file into an OWL 2 DL ontology
  will cause it to become an OWL 2 Full ontology and may have other,
  unexpected, consequences.
   
~~~

[$Date: 2009/11/15 10:54:12 $] {owl:versionInfo}
[http://www.w3.org/TR/owl2-mapping-to-rdf/] {+http://www.w3.org/TR/owl2-mapping-to-rdf/ ?isDefinedBy}
[http://www.w3.org/TR/owl2-rdf-based-semantics/] {+http://www.w3.org/TR/owl2-rdf-based-semantics/ ?isDefinedBy}
[http://www.w3.org/TR/owl2-syntax/] {+http://www.w3.org/TR/owl2-syntax/ ?isDefinedBy}
[http://www.w3.org/TR/owl2-rdf-based-semantics/#table-axiomatic-classes] {+http://www.w3.org/TR/owl2-rdf-based-semantics/#table-axiomatic-classes ?seeAlso}
[http://www.w3.org/TR/owl2-rdf-based-semantics/#table-axiomatic-properties] {+http://www.w3.org/TR/owl2-rdf-based-semantics/#table-axiomatic-properties ?seeAlso}
[http://www.w3.org/2000/01/rdf-schema] {+http://www.w3.org/2000/01/rdf-schema ?owl:imports}
[http://www.w3.org/2002/07/owl] {+http://www.w3.org/2002/07/owl ?owl:versionIRI}
[http://dev.w3.org/cvsweb/2009/owl-grddl/owx2rdf.xsl] {+http://dev.w3.org/cvsweb/2009/owl-grddl/owx2rdf.xsl ?grddl:namespaceTransformation}

# AllDifferent {=owl:AllDifferent .Class label}

[The class of collections of pairwise different individuals.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# AllDisjointClasses {=owl:AllDisjointClasses .Class label}

[The class of collections of pairwise disjoint classes.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# AllDisjointProperties {=owl:AllDisjointProperties .Class label}

[The class of collections of pairwise disjoint properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# Annotation {=owl:Annotation .Class label}

[The class of annotated annotations for which the RDF serialization consists of an annotated subject, predicate and object.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# AnnotationProperty {=owl:AnnotationProperty .Class label}

[The class of annotation properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}

# AsymmetricProperty {=owl:AsymmetricProperty .Class label}

[The class of asymmetric properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?subClassOf}

# Axiom {=owl:Axiom .Class label}

[The class of annotated axioms for which the RDF serialization consists of an annotated subject, predicate and object.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# Class {=owl:Class .Class label}

[The class of OWL classes.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Class] {+Class ?subClassOf}

# DataRange {=owl:DataRange .Class label}

[The class of OWL data ranges, which are special kinds of datatypes. Note: The use of the IRI owl:DataRange has been deprecated as of OWL 2. The IRI rdfs:Datatype SHOULD be used instead.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Datatype] {+Datatype ?subClassOf}

# DatatypeProperty {=owl:DatatypeProperty .Class label}

[The class of data properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}

# DeprecatedClass {=owl:DeprecatedClass .Class label}

[The class of deprecated classes.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Class] {+Class ?subClassOf}

# DeprecatedProperty {=owl:DeprecatedProperty .Class label}

[The class of deprecated properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}

# FunctionalProperty {=owl:FunctionalProperty .Class label}

[The class of functional properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}

# InverseFunctionalProperty {=owl:InverseFunctionalProperty .Class label}

[The class of inverse-functional properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?subClassOf}

# IrreflexiveProperty {=owl:IrreflexiveProperty .Class label}

[The class of irreflexive properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?subClassOf}

# NamedIndividual {=owl:NamedIndividual .Class label}

[The class of named individuals.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?subClassOf}

# NegativePropertyAssertion {=owl:NegativePropertyAssertion .Class label}

[The class of negative property assertions.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# Nothing {=owl:Nothing .owl:Class label}

[This is the empty class.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?subClassOf}

# ObjectProperty {=owl:ObjectProperty .Class label}

[The class of object properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}

# Ontology {=owl:Ontology .Class label}

[The class of ontologies.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# OntologyProperty {=owl:OntologyProperty .Class label}

[The class of ontology properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?subClassOf}

# ReflexiveProperty {=owl:ReflexiveProperty .Class label}

[The class of reflexive properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?subClassOf}

# Restriction {=owl:Restriction .Class label}

[The class of property restrictions.] {comment}
[owl:] {+owl: ?isDefinedBy}
[Class] {+owl:Class ?subClassOf}

# SymmetricProperty {=owl:SymmetricProperty .Class label}

[The class of symmetric properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?subClassOf}

# Thing {=owl:Thing .owl:Class label}

[The class of OWL individuals.] {comment}
[owl:] {+owl: ?isDefinedBy}

# TransitiveProperty {=owl:TransitiveProperty .Class label}

[The class of transitive properties.] {comment}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?subClassOf}

# allValuesFrom {=owl:allValuesFrom .rdf:Property label}

[The property that determines the class that a universal property restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[Class] {+Class ?range}

# annotatedProperty {=owl:annotatedProperty .rdf:Property label}

[The property that determines the predicate of an annotated axiom or annotated annotation.] {comment}
[Resource] {+Resource ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# annotatedSource {=owl:annotatedSource .rdf:Property label}

[The property that determines the subject of an annotated axiom or annotated annotation.] {comment}
[Resource] {+Resource ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# annotatedTarget {=owl:annotatedTarget .rdf:Property label}

[The property that determines the object of an annotated axiom or annotated annotation.] {comment}
[Resource] {+Resource ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# assertionProperty {=owl:assertionProperty .rdf:Property label}

[The property that determines the predicate of a negative property assertion.] {comment}
[NegativePropertyAssertion] {+owl:NegativePropertyAssertion ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

# backwardCompatibleWith {=owl:backwardCompatibleWith .owl:AnnotationProperty .owl:OntologyProperty label}

[The annotation property that indicates that a given ontology is backward compatible with another ontology.] {comment}
[Ontology] {+owl:Ontology ?domain}
[owl:] {+owl: ?isDefinedBy}
[Ontology] {+owl:Ontology ?range}

# bottomDataProperty {=owl:bottomDataProperty .owl:DatatypeProperty label}

[The data property that does not relate any individual to any data value.] {comment}
[Thing] {+owl:Thing ?domain}
[owl:] {+owl: ?isDefinedBy}
[Literal] {+Literal ?range}

# bottomObjectProperty {=owl:bottomObjectProperty .owl:ObjectProperty label}

[The object property that does not relate any two individuals.] {comment}
[Thing] {+owl:Thing ?domain}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# cardinality {=owl:cardinality .rdf:Property label}

[The property that determines the cardinality of an exact cardinality restriction.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# complementOf {=owl:complementOf .rdf:Property label}

[The property that determines that a given class is the complement of another class.] {comment}
[Class] {+owl:Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[Class] {+owl:Class ?range}

# datatypeComplementOf {=owl:datatypeComplementOf .rdf:Property label}

[The property that determines that a given data range is the complement of another data range with respect to the data domain.] {comment}
[Datatype] {+Datatype ?domain}
[owl:] {+owl: ?isDefinedBy}
[Datatype] {+Datatype ?range}

# deprecated {=owl:deprecated .owl:AnnotationProperty label}

[The annotation property that indicates that a given entity has been deprecated.] {comment}
[Resource] {+Resource ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# differentFrom {=owl:differentFrom .rdf:Property label}

[The property that determines that two given individuals are different.] {comment}
[Thing] {+owl:Thing ?domain}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# disjointUnionOf {=owl:disjointUnionOf .rdf:Property label}

[The property that determines that a given class is equivalent to the disjoint union of a collection of other classes.] {comment}
[Class] {+owl:Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# disjointWith {=owl:disjointWith .rdf:Property label}

[The property that determines that two given classes are disjoint.] {comment}
[Class] {+owl:Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[Class] {+owl:Class ?range}

# distinctMembers {=owl:distinctMembers .rdf:Property label}

[The property that determines the collection of pairwise different individuals in a owl:AllDifferent axiom.] {comment}
[AllDifferent] {+owl:AllDifferent ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# equivalentClass {=owl:equivalentClass .rdf:Property label}

[The property that determines that two given classes are equivalent, and that is used to specify datatype definitions.] {comment}
[Class] {+Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[Class] {+Class ?range}

# equivalentProperty {=owl:equivalentProperty .rdf:Property label}

[The property that determines that two given properties are equivalent.] {comment}
[rdf:Property] {+rdf:Property ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

# hasKey {=owl:hasKey .rdf:Property label}

[The property that determines the collection of properties that jointly build a key.] {comment}
[Class] {+owl:Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# hasSelf {=owl:hasSelf .rdf:Property label}

[The property that determines the property that a self restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# hasValue {=owl:hasValue .rdf:Property label}

[The property that determines the individual that a has-value restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# imports {=owl:imports .owl:OntologyProperty label}

[The property that is used for importing other ontologies into a given ontology.] {comment}
[Ontology] {+owl:Ontology ?domain}
[owl:] {+owl: ?isDefinedBy}
[Ontology] {+owl:Ontology ?range}

# incompatibleWith {=owl:incompatibleWith .owl:AnnotationProperty .owl:OntologyProperty label}

[The annotation property that indicates that a given ontology is incompatible with another ontology.] {comment}
[Ontology] {+owl:Ontology ?domain}
[owl:] {+owl: ?isDefinedBy}
[Ontology] {+owl:Ontology ?range}

# intersectionOf {=owl:intersectionOf .rdf:Property label}

[The property that determines the collection of classes or data ranges that build an intersection.] {comment}
[Class] {+Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# inverseOf {=owl:inverseOf .rdf:Property label}

[The property that determines that two given properties are inverse.] {comment}
[ObjectProperty] {+owl:ObjectProperty ?domain}
[owl:] {+owl: ?isDefinedBy}
[ObjectProperty] {+owl:ObjectProperty ?range}

# maxCardinality {=owl:maxCardinality .rdf:Property label}

[The property that determines the cardinality of a maximum cardinality restriction.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# maxQualifiedCardinality {=owl:maxQualifiedCardinality .rdf:Property label}

[The property that determines the cardinality of a maximum qualified cardinality restriction.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# members {=owl:members .rdf:Property label}

[The property that determines the collection of members in either a owl:AllDifferent, owl:AllDisjointClasses or owl:AllDisjointProperties axiom.] {comment}
[Resource] {+Resource ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# minCardinality {=owl:minCardinality .rdf:Property label}

[The property that determines the cardinality of a minimum cardinality restriction.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# minQualifiedCardinality {=owl:minQualifiedCardinality .rdf:Property label}

[The property that determines the cardinality of a minimum qualified cardinality restriction.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# onClass {=owl:onClass .rdf:Property label}

[The property that determines the class that a qualified object cardinality restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[Class] {+owl:Class ?range}

# onDataRange {=owl:onDataRange .rdf:Property label}

[The property that determines the data range that a qualified data cardinality restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[Datatype] {+Datatype ?range}

# onDatatype {=owl:onDatatype .rdf:Property label}

[The property that determines the datatype that a datatype restriction refers to.] {comment}
[Datatype] {+Datatype ?domain}
[owl:] {+owl: ?isDefinedBy}
[Datatype] {+Datatype ?range}

# onProperties {=owl:onProperties .rdf:Property label}

[The property that determines the n-tuple of properties that a property restriction on an n-ary data range refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# onProperty {=owl:onProperty .rdf:Property label}

[The property that determines the property that a property restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

# oneOf {=owl:oneOf .rdf:Property label}

[The property that determines the collection of individuals or data values that build an enumeration.] {comment}
[Class] {+Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# priorVersion {=owl:priorVersion .owl:AnnotationProperty .owl:OntologyProperty label}

[The annotation property that indicates the predecessor ontology of a given ontology.] {comment}
[Ontology] {+owl:Ontology ?domain}
[owl:] {+owl: ?isDefinedBy}
[Ontology] {+owl:Ontology ?range}

# propertyChainAxiom {=owl:propertyChainAxiom .rdf:Property label}

[The property that determines the n-tuple of properties that build a sub property chain of a given property.] {comment}
[ObjectProperty] {+owl:ObjectProperty ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# propertyDisjointWith {=owl:propertyDisjointWith .rdf:Property label}

[The property that determines that two given properties are disjoint.] {comment}
[rdf:Property] {+rdf:Property ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:Property] {+rdf:Property ?range}

# qualifiedCardinality {=owl:qualifiedCardinality .rdf:Property label}

[The property that determines the cardinality of an exact qualified cardinality restriction.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# sameAs {=owl:sameAs .rdf:Property label}

[The property that determines that two given individuals are equal.] {comment}
[Thing] {+owl:Thing ?domain}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# someValuesFrom {=owl:someValuesFrom .rdf:Property label}

[The property that determines the class that an existential property restriction refers to.] {comment}
[Restriction] {+owl:Restriction ?domain}
[owl:] {+owl: ?isDefinedBy}
[Class] {+Class ?range}

# sourceIndividual {=owl:sourceIndividual .rdf:Property label}

[The property that determines the subject of a negative property assertion.] {comment}
[NegativePropertyAssertion] {+owl:NegativePropertyAssertion ?domain}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# targetIndividual {=owl:targetIndividual .rdf:Property label}

[The property that determines the object of a negative object property assertion.] {comment}
[NegativePropertyAssertion] {+owl:NegativePropertyAssertion ?domain}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# targetValue {=owl:targetValue .rdf:Property label}

[The property that determines the value of a negative data property assertion.] {comment}
[NegativePropertyAssertion] {+owl:NegativePropertyAssertion ?domain}
[owl:] {+owl: ?isDefinedBy}
[Literal] {+Literal ?range}

# topDataProperty {=owl:topDataProperty .owl:DatatypeProperty label}

[The data property that relates every individual to every data value.] {comment}
[Thing] {+owl:Thing ?domain}
[owl:] {+owl: ?isDefinedBy}
[Literal] {+Literal ?range}

# topObjectProperty {=owl:topObjectProperty .owl:ObjectProperty label}

[The object property that relates every two individuals.] {comment}
[Thing] {+owl:Thing ?domain}
[owl:] {+owl: ?isDefinedBy}
[Thing] {+owl:Thing ?range}

# unionOf {=owl:unionOf .rdf:Property label}

[The property that determines the collection of classes or data ranges that build a union.] {comment}
[Class] {+Class ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# versionIRI {=owl:versionIRI .owl:OntologyProperty label}

[The property that identifies the version IRI of an ontology.] {comment}
[Ontology] {+owl:Ontology ?domain}
[owl:] {+owl: ?isDefinedBy}
[Ontology] {+owl:Ontology ?range}

# versionInfo {=owl:versionInfo .owl:AnnotationProperty label}

[The annotation property that provides version information for an ontology or another OWL construct.] {comment}
[Resource] {+Resource ?domain}
[owl:] {+owl: ?isDefinedBy}
[Resource] {+Resource ?range}

# withRestrictions {=owl:withRestrictions .rdf:Property label}

[The property that determines the collection of facet-value pairs that define a datatype restriction.] {comment}
[Datatype] {+Datatype ?domain}
[owl:] {+owl: ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

