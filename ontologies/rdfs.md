<a id="rdfs-index"></a>

[mrdf] <https://mdld.js.org/rdf/>

# RDFS Vocabulary {=mrdf:rdfs .Container label}

> W3C standard for RDF Schema in MDLD format {comment}

> We have authoritative source - the [rdf-schema.ttl](./rdf-schema.ttl) {+mrdf:ttl ?member}

## Overview

This catalog presents the complete RDF Schema 1.1 vocabulary in MDLD format, featuring:

- **6 Classes** - Core RDFS modeling constructs for schema definition
- **9 Properties** - Schema definition and annotation properties

## Classes

Core RDFS classes for schema definition:

**rdfs:Resource** {+Resource .Class ?mrdf:includes} - The class resource, everything
**rdfs:Class** {+Class .Class ?mrdf:includes} - The class of classes
**rdfs:Literal** {+Literal .Class ?mrdf:includes} - The class of literal values
**rdfs:Datatype** {+Datatype .Class ?mrdf:includes} - The class of RDF datatypes
**rdfs:Container** {+Container .Class ?mrdf:includes} - The class of RDF containers
**rdfs:ContainerMembershipProperty** {+ContainerMembershipProperty .Class ?mrdf:includes} - The class of container membership properties

[See all RDFS classes](#rdfs-classes)

## Properties

Schema definition and annotation properties:

**rdfs:label** {+label .rdf:Property ?mrdf:includes} - A human-readable name for the subject
**rdfs:comment** {+comment .rdf:Property ?mrdf:includes} - A description of the subject resource
**rdfs:seeAlso** {+seeAlso .rdf:Property ?mrdf:includes} - Further information about the subject resource
**rdfs:isDefinedBy** {+isDefinedBy .rdf:Property ?mrdf:includes} - The definition of the subject resource
**rdfs:member** {+member .rdf:Property ?mrdf:includes} - A member of the subject resource
**rdfs:subClassOf** {+subClassOf .rdf:Property ?mrdf:includes} - The subject is a subclass of a class
**rdfs:subPropertyOf** {+subPropertyOf .rdf:Property ?mrdf:includes} - The subject is a subproperty of a property
**rdfs:domain** {+domain .rdf:Property ?mrdf:includes} - A domain of the subject property
**rdfs:range** {+range .rdf:Property ?mrdf:includes} - A range of the subject property

[See all RDFS properties](#rdfs-properties)






{=}



<a id="rdfs-classes"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDFS Classes {=mrdf:rdfs-classes .Container label}

> Core RDFS modeling constructs for schema definition and vocabulary description {comment}

## Overview

RDFS provides 6 core classes that form the foundation of the RDF Schema vocabulary:

- **rdfs:Resource** - The class resource, everything
- **rdfs:Class** - The class of classes
- **rdfs:Literal** - The class of literal values
- **rdfs:Datatype** - The class of RDF datatypes
- **rdfs:Container** - The class of RDF containers
- **rdfs:ContainerMembershipProperty** - The class of container membership properties

---

## Class Details

### rdfs:Resource {#resource}

The class resource, everything.

<http://www.w3.org/2000/01/rdf-schema#Resource> {?mrdf:fullIRI}

**Subclass of**: None (top class)

**Explanation**: The class rdfs:Resource is the class of all resources. All things described by RDF are instances of this class. This is the most general class in RDFS and serves as the root of the class hierarchy.

**Use cases**: Defining the base class for all resources in a schema, enabling universal queries across all resources, serving as the default type for untyped resources.

### rdfs:Class {#class}

The class of classes.

<http://www.w3.org/2000/01/rdf-schema#Class> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: The class rdfs:Class is the class of all classes. Classes are themselves resources and may be described using RDF properties. The rdf:type property may be used to state that a resource is an instance of a class.

**Use cases**: Defining schema classes for vocabularies, creating class hierarchies with subClassOf, enabling type-based reasoning and validation, organizing resources into meaningful categories.

### rdfs:Literal {#literal}

The class of literal values, eg. textual strings and integers.

<http://www.w3.org/2000/01/rdf-schema#Literal> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: The class rdfs:Literal is the class of literal values such as strings and integers. Literals are values that are not resources and cannot be the subject of RDF statements.

**Use cases**: Defining the range of properties that take literal values, enabling data type checking for string and numeric values, representing simple values like names, dates, and numbers in RDF data.

### rdfs:Datatype {#datatype}

The class of RDF datatypes.

<http://www.w3.org/2000/01/rdf-schema#Datatype> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Class](http://www.w3.org/2000/01/rdf-schema#Class) {+Class ?rdfs:subClassOf}

**Explanation**: The class rdfs:Datatype is the class of RDF datatypes. All datatypes are classes. The instances of a class that is a datatype are the members of the value space of the datatype.

**Use cases**: Defining custom datatypes for specific value spaces, enabling type-safe property ranges, representing specialized data types like dates, coordinates, or measurement units.

### rdfs:Container {#container}

The class of RDF containers.

<http://www.w3.org/2000/01/rdf-schema#Container> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: The class rdfs:Container is the class of RDF containers, including Bag, Seq, and Alt. Containers are resources that hold collections of other resources or literals.

**Use cases**: Defining the superclass for all container types, enabling queries that work with any container, representing collections of resources in RDF data.

### rdfs:ContainerMembershipProperty {#containermembershipproperty}

The class of container membership properties, rdf:_1, rdf:_2, ..., all of which are sub-properties of 'member'.

<http://www.w3.org/2000/01/rdf-schema#ContainerMembershipProperty> {?mrdf:fullIRI}

**Subclass of**: [rdf:Property](http://www.w3.org/1999/02/22-rdf-syntax-ns#Property) {+rdf:Property ?rdfs:subClassOf}

**Explanation**: The class rdfs:ContainerMembershipProperty is the class of container membership properties, which include rdf:_1, rdf:_2, etc. These properties are used to indicate membership in RDF containers and are all sub-properties of rdfs:member.

**Use cases**: Defining the class for container membership properties, enabling generic queries over all container membership, working with container structures in RDF data.






{=}



<a id="rdfs-properties"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDFS Properties {=mrdf:rdfs-properties .Container label}

> Schema definition and annotation properties for describing RDF vocabularies {comment}

## Overview

RDFS provides 9 core properties for schema definition and vocabulary description:

- **rdfs:subClassOf** - The subject is a subclass of a class
- **rdfs:subPropertyOf** - The subject is a subproperty of a property
- **rdfs:domain** - A domain of the subject property
- **rdfs:range** - A range of the subject property
- **rdfs:comment** - A description of the subject resource
- **rdfs:label** - A human-readable name for the subject
- **rdfs:seeAlso** - Further information about the subject resource
- **rdfs:isDefinedBy** - The definition of the subject resource
- **rdfs:member** - A member of the subject resource

---

## Property Details

### rdfs:subClassOf {#subclassof}

The subject is a subclass of a class.

<http://www.w3.org/2000/01/rdf-schema#subClassOf> {?mrdf:fullIRI}

**Domain**: [rdfs:Class](http://www.w3.org/2000/01/rdf-schema#Class) {+Class ?domain}

**Range**: [rdfs:Class](http://www.w3.org/2000/01/rdf-schema#Class) {+Class ?range}

**Explanation**: If a class C is a subclass of a class C', then all instances of C will also be instances of C'. The term super-class is used as the inverse of subclass. This property is fundamental to class hierarchies in RDFS.

**Use cases**: Building class hierarchies (e.g., Person -> Student, Faculty), enabling inheritance of properties, supporting type-based reasoning and inference, organizing classes in taxonomies.

### rdfs:subPropertyOf {#subpropertyof}

The subject is a subproperty of a property.

<http://www.w3.org/2000/01/rdf-schema#subPropertyOf> {?mrdf:fullIRI}

**Domain**: [rdf:Property](http://www.w3.org/1999/02/22-rdf-syntax-ns#Property) {+rdf:Property ?domain}

**Range**: [rdf:Property](http://www.w3.org/1999/02/22-rdf-syntax-ns#Property) {+rdf:Property ?range}

**Explanation**: If a property P is a subproperty of property P', then all pairs of resources which are related by P are also related by P'. The term super-property is often used as the inverse of subproperty. This enables property hierarchies.

**Use cases**: Creating specialized properties (e.g., hasChild -> hasDaughter), enabling property inheritance, supporting more specific property definitions, organizing properties in hierarchies.

### rdfs:domain {#domain}

A domain of the subject property.

<http://www.w3.org/2000/01/rdf-schema#domain> {?mrdf:fullIRI}

**Domain**: [rdf:Property](http://www.w3.org/1999/02/22-rdf-syntax-ns#Property) {+rdf:Property ?domain}

**Range**: [rdfs:Class](http://www.w3.org/2000/01/rdf-schema#Class) {+Class ?range}

**Explanation**: rdfs:domain is used to state that the subject property has a specific domain. This provides a mechanism for describing the meaningful use of properties in RDF data, indicating limitations on the classes to which it makes sense to ascribe such properties.

**Use cases**: Specifying that a property applies to certain classes (e.g., author domain Person), enabling data validation, supporting inference of class membership, documenting property usage constraints.

### rdfs:range {#range}

A range of the subject property.

<http://www.w3.org/2000/01/rdf-schema#range> {?mrdf:fullIRI}

**Domain**: [rdf:Property](http://www.w3.org/1999/02/22-rdf-syntax-ns#Property) {+rdf:Property ?domain}

**Range**: [rdfs:Class](http://www.w3.org/2000/01/rdf-schema#Class) {+Class ?range}

**Explanation**: rdfs:range is used to state that the subject property has a specific range. This provides a mechanism for describing limitations on the types of values that are appropriate for some property.

**Use cases**: Specifying property value types (e.g., homepage range URI), enabling data type checking, supporting inference for class membership, documenting expected value types.

### rdfs:comment {#comment}

A description of the subject resource.

<http://www.w3.org/2000/01/rdf-schema#comment> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?domain}

**Range**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?range}

**Explanation**: rdfs:comment provides a human-readable description of the subject resource. This is an annotation property used to document resources in RDF vocabularies.

**Use cases**: Documenting vocabulary terms with descriptions, providing explanations for classes and properties, adding human-readable documentation to RDF schemas.

### rdfs:label {#label}

A human-readable name for the subject.

<http://www.w3.org/2000/01/rdf-schema#label> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?domain}

**Range**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?range}

**Explanation**: rdfs:label provides a human-readable name for the subject resource. This is an annotation property used to give resources a preferred name for display purposes.

**Use cases**: Providing user-friendly names for vocabulary terms, enabling display of resources in applications, supporting internationalization with language-tagged labels, improving user experience with readable names.

### rdfs:seeAlso {#seealso}

Further information about the subject resource.

<http://www.w3.org/2000/01/rdf-schema#seeAlso> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?range}

**Explanation**: rdfs:seeAlso indicates a resource that provides further information about the subject resource. This is used to link to related resources or documentation.

**Use cases**: Linking to external documentation, providing references to related resources, connecting vocabulary terms to their specifications, enabling discovery of related information.

### rdfs:isDefinedBy {#isdefinedby}

The definition of the subject resource.

<http://www.w3.org/2000/01/rdf-schema#isDefinedBy> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?range}

**Subproperty of**: [rdfs:seeAlso](http://www.w3.org/2000/01/rdf-schema#seeAlso) {+seeAlso ?subPropertyOf}

**Explanation**: rdfs:isDefinedBy indicates the resource that defines the subject resource. This is a subproperty of rdfs:seeAlso and is used to point to the authoritative definition or specification of a resource.

**Use cases**: Linking vocabulary terms to their defining documents, pointing to authoritative specifications, establishing provenance of vocabulary definitions, enabling resolution to official documentation.

### rdfs:member {#member}

A member of the subject resource.

<http://www.w3.org/2000/01/rdf-schema#member> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?range}

**Explanation**: rdfs:member is a super-property of the container membership properties (rdf:_1, rdf:_2, etc.). It indicates that a resource is a member of a container resource.

**Use cases**: Generic queries over container membership, working with any container type, enabling reasoning about container contents, providing a general membership property for collections.
