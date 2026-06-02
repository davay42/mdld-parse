[owl] <http://www.w3.org/2002/07/owl#>
[dc] <http://purl.org/dc/elements/1.1/> 


# The RDF Schema vocabulary (RDFS) {=rdfs: .owl:Ontology dc:title label}

> W3C standard for RDF Schema 1.1 in MD-LD {comment}

## Classes and Resources
========================

[RDFS] {=rdfs:} defines what is a [Class] {+Class !isDefinedBy} and establishes a root level [Resource] {+Resource !isDefinedBy} class that serves as the base for all resources in the RDF model.

### Class {=Class .Class label} 

`The class of classes.` {comment} 

Classes are themselves [resources] {+Resource ?subClassOf} and may be described using RDF properties. The rdf:type property may be used to state that a resource is an instance of a class.

**Use cases**: Defining schema classes for vocabularies, creating class hierarchies with subClassOf, enabling type-based reasoning and validation, organizing resources into meaningful categories.

### Resource {=Resource .Class label}

`The class resource, everything.` {comment}

All things described by RDF are instances of this [class] {+Class !subClassOf} . This is the most general class in RDFS and serves as the root of the class hierarchy.

**Use cases**: Defining the base class for all resources in a schema, enabling universal queries across all resources, serving as the default type for untyped resources.

## Sub-Properties
=================

RDF defines core `rdf:Property` and `rdf:type`, [RDF] {=rdfs:} extends them with hierarchical properties - `subClassOf` {+subClassOf !isDefinedBy} and `subPropertyOf` {+subPropertyOf !isDefinedBy}.

### subClassOf {=subClassOf .rdf:Property label}

`The subject is a subclass of a class.` {comment}

It connects a class to a broader [Class] {+Class ?range ?domain}.

If a class C is a subclass of a class C', then all instances of C will also be instances of C'. The term super-class is used as the inverse of subclass. This property is fundamental to class hierarchies in RDFS.

**Use cases**: Building class hierarchies (e.g., Person -> Student, Faculty), enabling inheritance of properties, supporting type-based reasoning and inference, organizing classes in taxonomies.

### subPropertyOf {=subPropertyOf .rdf:Property label}

`The subject is a subproperty of a property.` {comment}

If a [property] {+rdf:Property ?range ?domain} P is a subproperty of property P', then all pairs of resources which are related by P are also related by P'. The term super-property is often used as the inverse of subproperty. This enables property hierarchies.

**Use cases**: Creating specialized properties (e.g., hasChild -> hasDaughter), enabling property inheritance, supporting more specific property definitions, organizing properties in hierarchies.

## Property domains and ranges
==============================

[RDFS] {=rdfs:} defines property [domains] {+domain !isDefinedBy} and [ranges] {+range !isDefinedBy} to constrain the classes of subjects and objects that a property can connect.

### domain {=domain .rdf:Property label}

`A domain of the subject property.` {comment}

It maps an [rdf:Property] {+rdf:Property ?domain} to its valid [rdfs:Class] {+Class ?range}.

`rdfs:domain` is used to state that the subject property has a specific domain. This provides a mechanism for describing the meaningful use of properties in RDF data, indicating limitations on the classes to which it makes sense to ascribe such properties.

**Use cases**: Specifying that a property applies to certain classes (e.g., author domain Person), enabling data validation, supporting inference of class membership, documenting property usage constraints.

### range {=range .rdf:Property label}

`A range of the subject property` {comment}

It defines which for which [values] {+Class ?range} given [property] {+rdf:Property ?domain} applies. 

`rdfs:range` is used to state that the subject property has a specific range. This provides a mechanism for describing limitations on the types of values that are appropriate for some property.

**Use cases**: Specifying property value types (e.g., homepage range URI), enabling data type checking, supporting inference for class membership, documenting expected value types.

## Resource Metadata
====================

[RDFS] {=rdfs:} provides common properties for adding metadata to resources - short [labels] {+label !isDefinedBy} and detailed [comments] {+comment !isDefinedBy}.

### label {=label .rdf:Property label}

`A human-readable name for the subject.` {comment} 

It is widely used for short familiar aliases in the interfaces. It allows to add a short [literal] {+Literal ?range} to any [resource] {+Resource ?domain} for ease of identification. 

`rdfs:label` provides a human-readable name for the subject resource. This is an annotation property used to give resources a preferred name for display purposes.

**Use cases**: Providing user-friendly names for vocabulary terms, enabling display of resources in applications, supporting internationalization with language-tagged labels, improving user experience with readable names.

### comment {=comment .rdf:Property label}

`A description of the subject resource.` {comment}

It allows to add longer text [descriptions] {+Literal ?range} to any [resource] {+Resource ?domain} for context handling.

`rdfs:comment` provides a human-readable description of the subject resource. This is an annotation property used to document resources in RDF vocabularies.

**Use cases**: Documenting vocabulary terms with descriptions, providing explanations for classes and properties, adding human-readable documentation to RDF schemas.

## Resource linking
===================

[RDFS] {=rdfs:} provides common properties for linking resources - [seeAlso] {+seeAlso !isDefinedBy} for additional information and [isDefinedBy] {+isDefinedBy !isDefinedBy} for vocabulary definitions.

### seeAlso {=seeAlso .rdf:Property label}

`Further information about the subject resource.` {comment}

It is used for generic linking of two associated [resources] {+Resource ?range ?domain}.

`rdfs:seeAlso` indicates a resource that provides further information about the subject resource. This is used to link to related resources or documentation.

**Use cases**: Linking to external documentation, providing references to related resources, connecting vocabulary terms to their specifications, enabling discovery of related information.

### isDefinedBy {=isDefinedBy .rdf:Property label}

`The definition of the subject resource.` {comment}

It is a sub-property of [+seeAlso ?subPropertyOf] that also connects two [resources] {+Resource ?domain ?range} - where the object is not merely documenting, but ontologically defining or specifying the subject resource.

`rdfs:isDefinedBy` indicates the resource that defines the subject resource. This is a subproperty of rdfs:seeAlso and is used to point to the authoritative definition or specification of a resource.

**Use cases**: Linking vocabulary terms to their defining documents, pointing to authoritative specifications, establishing provenance of vocabulary definitions, enabling resolution to official documentation.

## Containers
=============

[RDFS] {=rdfs:} provides the class [Container] {+Container !isDefinedBy} and its sub-class [ContainerMembershipProperty] {+ContainerMembershipProperty !isDefinedBy} for representing collections of resources in a structured way. Generic [member] {+member !isDefinedBy} is used to link container resources to their elements.

### Container {=Container .Class label}

Is defined by [RDFS] {+rdfs: ?isDefinedBy} as `The class of RDF containers.` {comment} - a [resource] {+Resource ?subClassOf} that includes other resources as members.

The class `rdfs:Container` is the class of RDF containers, including Bag, Seq, and Alt. Containers are resources that hold collections of other resources or literals.

**Use cases**: Defining the superclass for all container types, enabling queries that work with any container, representing collections of resources in RDF data.

### ContainerMembershipProperty {=ContainerMembershipProperty .Class label}

`The class of container membership properties, rdf:_1, rdf:_2, ..., all of which are sub-properties of 'member'.` {comment}

`rdfs:ContainerMembershipProperty` is the [property] {+rdf:Property ?subClassOf} class that categorizes dynamically generated, numbered predicates (rdf:_1, rdf:_2, rdf:_3, etc.) used to order elements inside an rdfs:Container (such as a Bag, Seq, or Alt). Because standard graph architectures rely entirely on independent triples, RDF cannot inherently use traditional array indices. To solve this, these dynamic properties act as positional index labels, allowing developers to map graph nodes to explicit positions (e.g., establishing track 1 and track 2 on an album) directly through graph edges.

**Use cases**: Defining the class for container membership properties, enabling generic queries over all container membership, working with container structures in RDF data.

### member {=member .rdf:Property label}

`A member of the subject resource.` {comment}

It connects included and including [resources] {+Resource ?domain ?range}.

`rdfs:member` is a super-property of the container membership properties (rdf:_1, rdf:_2, etc.). It indicates that a resource is a member of a container resource.

**Use cases**: Generic queries over container membership, working with any container type, enabling reasoning about container contents, providing a general membership property for collections.

## Literal values
=================

[RDF] {=rdfs:} defines non-resource leaf nodes as [literals] {+Literal !isDefinedBy} with [datatypes] {+Datatype !isDefinedBy}.

### Literal {=Literal .Class label}

`The class of literal values, eg. textual strings and integers.` {comment}

A leaf data point [resource] {+Resource ?subClassOf}.

The class `rdfs:Literal` is the class of literal values such as strings and integers. Literals are values that are not resources and cannot be the subject of RDF statements.

**Use cases**: Defining the range of properties that take literal values, enabling data type checking for string and numeric values, representing simple values like names, dates, and numbers in RDF data.

### Datatype {=Datatype .Class label}

`The class of RDF datatypes.` {comment}

It's a [class] {+Class ?subClassOf} of all formats of data a Literal can contain.

The class `rdfs:Datatype` is the class of RDF datatypes. All datatypes are classes. The instances of a class that is a datatype are the members of the value space of the datatype.

**Use cases**: Defining custom datatypes for specific value spaces, enabling type-safe property ranges, representing specialized data types like dates, coordinates, or measurement units.

