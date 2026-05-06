[dc] <http://purl.org/dc/terms/>
[owl] <http://www.w3.org/2002/07/owl#>
[skos] <http://www.w3.org/2004/02/skos/core#>

#  {=http://www.w3.org/2004/02/skos/core .owl:Ontology}

[Dave Beckett] {dc:contributor}
[Nikki Rogers] {dc:contributor}
[Participants in W3C's Semantic Web Deployment Working Group.] {dc:contributor}
[Alistair Miles] {dc:creator}
[Sean Bechhofer] {dc:creator}
[An RDF vocabulary for describing the basic structure and content of concept schemes such as thesauri, classification schemes, subject heading lists, taxonomies, 'folksonomies', other types of controlled vocabulary, and also concept schemes embedded in glossaries and terminologies.] {dc:description @en}
[SKOS Vocabulary] {dc:title @en}
[http://www.w3.org/TR/skos-reference/] {+http://www.w3.org/TR/skos-reference/ ?seeAlso}

# n3-0 {=n3-0 .owl:Class}


# n3-1 {=n3-1}

[Concept] {+skos:Concept ?rdf:first}

# n3-2 {=n3-2}

[Collection] {+skos:Collection ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# Collection {=skos:Collection .owl:Class label}

[A meaningful collection of concepts.] {skos:definition @en}
[Labelled collections can be used where you would like a set of concepts to be displayed under a 'node label' in the hierarchy.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Concept] {+skos:Concept ?owl:disjointWith}
[Concept Scheme] {+skos:ConceptScheme ?owl:disjointWith}

# Concept {=skos:Concept .owl:Class label}

[An idea or notion; a unit of thought.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}

# Concept Scheme {=skos:ConceptScheme .owl:Class label}

[A set of concepts, optionally including statements about semantic relationships between those concepts.] {skos:definition @en}
[Thesauri, classification schemes, subject heading lists, taxonomies, 'folksonomies', and other types of controlled vocabulary are all examples of concept schemes. Concept schemes are also embedded in glossaries and terminologies.] {skos:example @en}
[A concept scheme may be defined to include concepts from different sources.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Concept] {+skos:Concept ?owl:disjointWith}

# Ordered Collection {=skos:OrderedCollection .owl:Class label}

[An ordered collection of concepts, where both the grouping and the ordering are meaningful.] {skos:definition @en}
[Ordered collections can be used where you would like a set of concepts to be displayed in a specific order, and optionally under a 'node label'.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Collection] {+skos:Collection ?subClassOf}

# alternative label {=skos:altLabel .owl:AnnotationProperty .rdf:Property label}

[skos:prefLabel, skos:altLabel and skos:hiddenLabel are pairwise disjoint properties.] {comment @en}
[The range of skos:altLabel is the class of RDF plain literals.] {comment @en}
[An alternative lexical label for a resource.] {skos:definition @en}
[Acronyms, abbreviations, spelling variants, and irregular plural/singular forms may be included among the alternative labels for a concept. Mis-spelled terms are normally included as hidden labels (see skos:hiddenLabel).] {skos:example @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[label] {+label ?subPropertyOf}

# has broader match {=skos:broadMatch .owl:ObjectProperty .rdf:Property label}

[skos:broadMatch is used to state a hierarchical mapping link between two conceptual resources in different concept schemes.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[has broader] {+skos:broader ?subPropertyOf}
[is in mapping relation with] {+skos:mappingRelation ?subPropertyOf}
[has narrower match] {+skos:narrowMatch ?owl:inverseOf}

# has broader {=skos:broader .owl:ObjectProperty .rdf:Property label}

[Broader concepts are typically rendered as parents in a concept hierarchy (tree).] {comment @en}
[Relates a concept to a concept that is more general in meaning.] {skos:definition @en}
[By convention, skos:broader is only used to assert an immediate (i.e. direct) hierarchical link between two conceptual resources.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[has broader transitive] {+skos:broaderTransitive ?subPropertyOf}
[has narrower] {+skos:narrower ?owl:inverseOf}

# has broader transitive {=skos:broaderTransitive .owl:ObjectProperty .owl:TransitiveProperty .rdf:Property label}

[skos:broaderTransitive is a transitive superproperty of skos:broader.] {skos:definition}
[By convention, skos:broaderTransitive is not used to make assertions. Rather, the properties can be used to draw inferences about the transitive closure of the hierarchical relation, which is useful e.g. when implementing a simple query expansion algorithm in a search application.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in semantic relation with] {+skos:semanticRelation ?subPropertyOf}
[has narrower transitive] {+skos:narrowerTransitive ?owl:inverseOf}

# change note {=skos:changeNote .owl:AnnotationProperty .rdf:Property label}

[A note about a modification to a concept.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[note] {+skos:note ?subPropertyOf}

# has close match {=skos:closeMatch .owl:ObjectProperty .owl:SymmetricProperty .rdf:Property label}

[skos:closeMatch is used to link two concepts that are sufficiently similar that they can be used interchangeably in some information retrieval applications. In order to avoid the possibility of "compound errors" when combining mappings across more than two concept schemes, skos:closeMatch is not declared to be a transitive property.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in mapping relation with] {+skos:mappingRelation ?subPropertyOf}

# definition {=skos:definition .owl:AnnotationProperty .rdf:Property label}

[A statement or formal explanation of the meaning of a concept.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[note] {+skos:note ?subPropertyOf}

# editorial note {=skos:editorialNote .owl:AnnotationProperty .rdf:Property label}

[A note for an editor, translator or maintainer of the vocabulary.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[note] {+skos:note ?subPropertyOf}

# has exact match {=skos:exactMatch .owl:ObjectProperty .owl:SymmetricProperty .owl:TransitiveProperty .rdf:Property label}

[skos:exactMatch is disjoint with each of the properties skos:broadMatch and skos:relatedMatch.] {comment @en}
[skos:exactMatch is used to link two concepts, indicating a high degree of confidence that the concepts can be used interchangeably across a wide range of information retrieval applications. skos:exactMatch is a transitive property, and is a sub-property of skos:closeMatch.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[has close match] {+skos:closeMatch ?subPropertyOf}

# example {=skos:example .owl:AnnotationProperty .rdf:Property label}

[An example of the use of a concept.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[note] {+skos:note ?subPropertyOf}

# has top concept {=skos:hasTopConcept .owl:ObjectProperty .rdf:Property label}

[Relates, by convention, a concept scheme to a concept which is topmost in the broader/narrower concept hierarchies for that scheme, providing an entry point to these hierarchies.] {skos:definition @en}
[Concept Scheme] {+skos:ConceptScheme ?domain}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Concept] {+skos:Concept ?range}
[is top concept in scheme] {+skos:topConceptOf ?owl:inverseOf}

# hidden label {=skos:hiddenLabel .owl:AnnotationProperty .rdf:Property label}

[skos:prefLabel, skos:altLabel and skos:hiddenLabel are pairwise disjoint properties.] {comment @en}
[The range of skos:hiddenLabel is the class of RDF plain literals.] {comment @en}
[A lexical label for a resource that should be hidden when generating visual displays of the resource, but should still be accessible to free text search operations.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[label] {+label ?subPropertyOf}

# history note {=skos:historyNote .owl:AnnotationProperty .rdf:Property label}

[A note about the past state/use/meaning of a concept.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[note] {+skos:note ?subPropertyOf}

# is in scheme {=skos:inScheme .owl:ObjectProperty .rdf:Property label}

[Relates a resource (for example a concept) to a concept scheme in which it is included.] {skos:definition @en}
[A concept may be a member of more than one concept scheme.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Concept Scheme] {+skos:ConceptScheme ?range}

# is in mapping relation with {=skos:mappingRelation .owl:ObjectProperty .rdf:Property label}

[These concept mapping relations mirror semantic relations, and the data model defined below is similar (with the exception of skos:exactMatch) to the data model defined for semantic relations. A distinct vocabulary is provided for concept mapping relations, to provide a convenient way to differentiate links within a concept scheme from links between concept schemes. However, this pattern of usage is not a formal requirement of the SKOS data model, and relies on informal definitions of best practice.] {comment @en}
[Relates two concepts coming, by convention, from different schemes, and that have comparable meanings] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in semantic relation with] {+skos:semanticRelation ?subPropertyOf}

# has member {=skos:member .owl:ObjectProperty .rdf:Property label}

[Relates a collection to one of its members.] {skos:definition @en}
[Collection] {+skos:Collection ?domain}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}

# has member list {=skos:memberList .owl:FunctionalProperty .owl:ObjectProperty .rdf:Property label}

~~~ {comment @en}
For any resource, every item in the list given as the value of the
      skos:memberList property is also a value of the skos:member property.
~~~

[Relates an ordered collection to the RDF list containing its members.] {skos:definition @en}
[Ordered Collection] {+skos:OrderedCollection ?domain}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[rdf:List] {+rdf:List ?range}

# has narrower match {=skos:narrowMatch .owl:ObjectProperty .rdf:Property label}

[skos:narrowMatch is used to state a hierarchical mapping link between two conceptual resources in different concept schemes.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in mapping relation with] {+skos:mappingRelation ?subPropertyOf}
[has narrower] {+skos:narrower ?subPropertyOf}
[has broader match] {+skos:broadMatch ?owl:inverseOf}

# has narrower {=skos:narrower .owl:ObjectProperty .rdf:Property label}

[Narrower concepts are typically rendered as children in a concept hierarchy (tree).] {comment @en}
[Relates a concept to a concept that is more specific in meaning.] {skos:definition @en}
[By convention, skos:broader is only used to assert an immediate (i.e. direct) hierarchical link between two conceptual resources.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[has narrower transitive] {+skos:narrowerTransitive ?subPropertyOf}
[has broader] {+skos:broader ?owl:inverseOf}

# has narrower transitive {=skos:narrowerTransitive .owl:ObjectProperty .owl:TransitiveProperty .rdf:Property label}

[skos:narrowerTransitive is a transitive superproperty of skos:narrower.] {skos:definition}
[By convention, skos:narrowerTransitive is not used to make assertions. Rather, the properties can be used to draw inferences about the transitive closure of the hierarchical relation, which is useful e.g. when implementing a simple query expansion algorithm in a search application.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in semantic relation with] {+skos:semanticRelation ?subPropertyOf}
[has broader transitive] {+skos:broaderTransitive ?owl:inverseOf}

# notation {=skos:notation .owl:DatatypeProperty .rdf:Property label}

[A notation, also known as classification code, is a string of characters such as "T58.5" or "303.4833" used to uniquely identify a concept within the scope of a given concept scheme.] {skos:definition @en}
[By convention, skos:notation is used with a typed literal in the object position of the triple.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}

# note {=skos:note .owl:AnnotationProperty .rdf:Property label}

[A general note, for any purpose.] {skos:definition @en}
[This property may be used directly, or as a super-property for more specific note types.] {skos:scopeNote @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}

# preferred label {=skos:prefLabel .owl:AnnotationProperty .rdf:Property label}

[A resource has no more than one value of skos:prefLabel per language tag, and no more than one value of skos:prefLabel without language tag.] {comment @en}
~~~ {comment @en}
skos:prefLabel, skos:altLabel and skos:hiddenLabel are pairwise
      disjoint properties.
~~~

[The range of skos:prefLabel is the class of RDF plain literals.] {comment @en}
[The preferred lexical label for a resource, in a given language.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[label] {+label ?subPropertyOf}

# has related {=skos:related .owl:ObjectProperty .owl:SymmetricProperty .rdf:Property label}

[skos:related is disjoint with skos:broaderTransitive] {comment @en}
[Relates a concept to a concept with which there is an associative semantic relationship.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in semantic relation with] {+skos:semanticRelation ?subPropertyOf}

# has related match {=skos:relatedMatch .owl:ObjectProperty .owl:SymmetricProperty .rdf:Property label}

[skos:relatedMatch is used to state an associative mapping link between two conceptual resources in different concept schemes.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[is in mapping relation with] {+skos:mappingRelation ?subPropertyOf}
[has related] {+skos:related ?subPropertyOf}

# scope note {=skos:scopeNote .owl:AnnotationProperty .rdf:Property label}

[A note that helps to clarify the meaning and/or the use of a concept.] {skos:definition @en}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[note] {+skos:note ?subPropertyOf}

# is in semantic relation with {=skos:semanticRelation .owl:ObjectProperty .rdf:Property label}

[Links a concept to a concept related by meaning.] {skos:definition @en}
[This property should not be used directly, but as a super-property for all properties denoting a relationship of meaning between concepts.] {skos:scopeNote @en}
[Concept] {+skos:Concept ?domain}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Concept] {+skos:Concept ?range}

# is top concept in scheme {=skos:topConceptOf .owl:ObjectProperty .rdf:Property label}

[Relates a concept to the concept scheme that it is a top level concept of.] {skos:definition @en}
[Concept] {+skos:Concept ?domain}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?isDefinedBy}
[Concept Scheme] {+skos:ConceptScheme ?range}
[is in scheme] {+skos:inScheme ?subPropertyOf}
[has top concept] {+skos:hasTopConcept ?owl:inverseOf}

