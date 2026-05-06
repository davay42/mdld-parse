<a id="index"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDF+RDFS MDLD Catalog {=mrdf:index .Container label}

> Complete MDLD documentation for RDF and RDFS vocabularies with explanations and use cases from W3C specifications {comment}

## Overview

This catalog provides comprehensive MDLD documentation for the foundational RDF and RDFS vocabularies, which form the basis of the Semantic Web data model and schema language.

## Catalogs

### RDF Vocabulary {=mrdf:rdf .Container label}

The RDF 1.1 Concepts vocabulary defines the core data model for representing resources, statements, containers, lists, and literal datatypes.

[**RDF Catalog**](#rdf-index) {+mrdf:rdf ?member}

**Coverage:**
- 7 Classes (Property, Statement, Bag, Seq, Alt, List, CompoundLiteral)
- 5 Datatypes (HTML, langString, PlainLiteral, XMLLiteral, JSON)
- 9 Properties (type, subject, predicate, object, value, first, rest, language, direction)
- 1 Instance (nil)

### RDFS Vocabulary {=mrdf:rdfs .Container label}

The RDF Schema 1.1 vocabulary provides schema definition capabilities for describing classes, properties, and their relationships.

[**RDFS Catalog**](#rdfs-index) {+mrdf:rdfs ?member}

**Coverage:**
- 6 Classes (Resource, Class, Literal, Datatype, Container, ContainerMembershipProperty)
- 9 Properties (subClassOf, subPropertyOf, domain, range, comment, label, seeAlso, isDefinedBy, member)

## Authoritative Sources

- **RDF**: [22-rdf-syntax-ns.ttl](./22-rdf-syntax-ns.ttl) - The RDF Concepts Vocabulary
- **RDFS**: [rdf-schema.ttl](./rdf-schema.ttl) - The RDF Schema Vocabulary
- **RDF Spec**: [W3C RDF 1.1 Concepts](https://www.w3.org/TR/rdf11-concepts/)
- **RDFS Spec**: [W3C RDF Schema 1.1](https://www.w3.org/TR/rdf-schema/)

## Features

- **Complete Coverage**: All RDF and RDFS terms documented
- **W3C-Aligned**: Explanations and use cases from official W3C specifications
- **MDLD Format**: Follows MDLD syntax patterns from mdld-prov and mdld-shapes catalogs
- **Validated**: Tested with ig-cli for graph integrity
- **Organized**: Separate catalogs for RDF and RDFS with classes and properties






{=}



<a id="rdf-index"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDF Vocabulary {=mrdf:index .prov:Entity .Container label}

> W3C standard for RDF concepts and syntax in MDLD format {comment}

> We have authoritative source - the [22-rdf-syntax-ns.ttl](./22-rdf-syntax-ns.ttl) {+mrdf:ttl ?member}

## Overview

This catalog presents the complete RDF 1.1 Concepts vocabulary in MDLD format, featuring:

- **7 Classes** - Core RDF modeling constructs
- **5 Datatypes** - Specialized literal types
- **9 Properties** - Structural and reification properties
- **1 Instance** - The empty list (rdf:nil)

## Classes

Core RDF classes for modeling:

- **rdf:Property** {+rdf:Property .Class ?mrdf:includes} - The class of RDF properties
- **rdf:Statement** {+rdf:Statement .Class ?mrdf:includes} - The class of RDF statements (reification)
- **rdf:Bag** {+rdf:Bag .Class ?mrdf:includes} - The class of unordered containers
- **rdf:Seq** {+rdf:Seq .Class ?mrdf:includes} - The class of ordered containers
- **rdf:Alt** {+rdf:Alt .Class ?mrdf:includes} - The class of containers of alternatives
- **rdf:List** {+rdf:List .Class ?mrdf:includes} - The class of RDF lists
- **rdf:CompoundLiteral** {+rdf:CompoundLiteral .Class ?mrdf:includes} - A class representing a compound literal

[See all RDF classes](#rdf-classes)

## Datatypes

RDF provides these specialized literal datatypes:

- **rdf:HTML** {+rdf:HTML .Datatype ?mrdf:includes} - The datatype of RDF literals storing fragments of HTML content
- **rdf:langString** {+rdf:langString .Datatype ?mrdf:includes} - The datatype of language-tagged string values
- **rdf:PlainLiteral** {+rdf:PlainLiteral .Datatype ?mrdf:includes} - The class of plain (i.e. untyped) literal values
- **rdf:XMLLiteral** {+rdf:XMLLiteral .Datatype ?mrdf:includes} - The datatype of XML literal values
- **rdf:JSON** {+rdf:JSON .Datatype ?mrdf:includes} - The datatype of RDF literals storing JSON content

[See all RDF datatypes](#rdf-datatypes)

## Properties

Structural and reification properties for RDF modeling:

- **rdf:type** {+rdf:type .rdf:Property ?mrdf:includes} - The subject is an instance of a class
- **rdf:subject** {+rdf:subject .rdf:Property ?mrdf:includes} - The subject of the subject RDF statement
- **rdf:predicate** {+rdf:predicate .rdf:Property ?mrdf:includes} - The predicate of the subject RDF statement
- **rdf:object** {+rdf:object .rdf:Property ?mrdf:includes} - The object of the subject RDF statement
- **rdf:value** {+rdf:value .rdf:Property ?mrdf:includes} - Idiomatic property used for structured values
- **rdf:first** {+rdf:first .rdf:Property ?mrdf:includes} - The first item in the subject RDF list
- **rdf:rest** {+rdf:rest .rdf:Property ?mrdf:includes} - The rest of the subject RDF list after the first item
- **rdf:language** {+rdf:language .rdf:Property ?mrdf:includes} - The language component of a CompoundLiteral
- **rdf:direction** {+rdf:direction .rdf:Property ?mrdf:includes} - The base direction component of a CompoundLiteral

[See all RDF properties](#rdf-properties)

## Instances

- **[rdf:nil](http://www.w3.org/1999/02/22-rdf-syntax-ns#nil)** {+rdf:nil .rdf:List ?mrdf:includes} - The empty list

The terminating node for all RDF lists.






{=}



<a id="rdf-classes"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDF Classes {=mrdf:classes .Container label}

> Core RDF modeling constructs for representing types and structures in the RDF data model {comment}

## Overview

RDF provides 7 core classes that form the foundation of the RDF data model:

- **rdf:Property** - The class of RDF properties
- **rdf:Statement** - The class of RDF statements (reification)
- **rdf:Bag** - The class of unordered containers
- **rdf:Seq** - The class of ordered containers
- **rdf:Alt** - The class of containers of alternatives
- **rdf:List** - The class of RDF lists
- **rdf:CompoundLiteral** - A class representing a compound literal

---

## Class Details

### rdf:Property {#property}

The class of RDF properties.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: RDF properties may be thought of as attributes of resources and in this sense correspond to traditional attribute-value pairs. RDF properties also represent relationships between resources and an RDF model can therefore resemble an entity-relationship diagram. In object-oriented design terminology, resources correspond to objects and properties correspond to instance variables.

**Use cases**: Modeling characteristics of resources (like author, title, date) and relationships between resources (like partOf, references, dependsOn).

### rdf:Statement {#statement}

The class of RDF statements.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: In addition to making statements about Web resources, RDF can be used for making statements about other RDF statements (higher-order statements). In order to make a statement about another statement, we actually have to build a model of the original statement; this model is a new resource to which we can attach additional properties. This process is formally called reification in the Knowledge Representation community. A model of a statement is called a reified statement.

**Use cases**: Attributing statements to specific sources, adding metadata like confidence scores or timestamps to statements, modeling provenance and trust in information.

### rdf:Bag {#bag}

The class of unordered containers.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Container](http://www.w3.org/2000/01/rdf-schema#Container) {+Container ?rdfs:subClassOf}

**Explanation**: Bag containers represent unordered collections of resources or literals. The membership relation between the container resource and the resources that belong in the collection is defined by properties named "_1", "_2", "_3", etc. Bag containers are not equivalent to repeated properties of the same type - authors need to decide on a case-by-case basis which one is more appropriate.

**Use cases**: Listing students in a course where order doesn't matter, representing mirrored web sites, collecting tags or categories, grouping equivalent items.

### rdf:Seq {#seq}

The class of ordered containers.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Container](http://www.w3.org/2000/01/rdf-schema#Container) {+Container ?rdfs:subClassOf}

**Explanation**: Seq containers represent ordered sequences of resources or literals. Like Bag containers, they use membership properties "_1", "_2", "_3", etc., but the order of these properties is significant. The sequence maintains the intended ordering of its members.

**Use cases**: Listing authors in alphabetical order, sorting papers by publication date, representing ordered steps in a process, maintaining sequence numbers where position matters.

### rdf:Alt {#alt}

The class of containers of alternatives.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#Alt> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Container](http://www.w3.org/2000/01/rdf-schema#Container) {+Container ?rdfs:subClassOf}

**Explanation**: Alt containers represent collections of alternatives where typically one member is the default or preferred value. An Alt container is required to have at least one member, which will be identified by the property "_1" and is considered the default or preferred value. Alternative containers are frequently used in conjunction with language tagging.

**Use cases**: Providing multiple language variants of a title, listing alternative distribution sites where any one is acceptable, offering different format versions of a resource, representing fallback options.

### rdf:List {#list}

The class of RDF Lists.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#List> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: RDF Lists are linked list structures that provide a more flexible way to represent ordered collections than Seq containers. Lists use rdf:first to identify the first item and rdf:rest to point to the remainder of the list. The empty list is represented by rdf:nil. Lists can be nested and shared between multiple statements.

**Use cases**: Representing ordered sequences that need to be shared across multiple contexts, building complex nested structures, implementing functional programming-style list operations, creating reusable sequence definitions.

### rdf:CompoundLiteral {#compoundliteral}

A class representing a compound literal.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#CompoundLiteral> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:subClassOf}

**Explanation**: CompoundLiteral represents literals that have additional structure beyond simple string values. It is used with rdf:language to specify the language component and rdf:direction to specify the base direction (left-to-right or right-to-left) for internationalized content. This enables proper handling of bidirectional text in languages like Arabic or Hebrew.

**Use cases**: Representing text with explicit language and direction information, handling internationalized content that requires bidirectional text support, storing literals with rich metadata about language and text direction.






{=}



<a id="rdf-datatypes"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDF Datatypes {=mrdf:datatypes .Container label}

> Specialized literal types for representing different kinds of data in RDF {comment}

## Overview

RDF provides 5 specialized literal datatypes for representing different kinds of data:

- **rdf:HTML** - The datatype of RDF literals storing fragments of HTML content
- **rdf:langString** - The datatype of language-tagged string values
- **rdf:PlainLiteral** - The class of plain (i.e. untyped) literal values
- **rdf:XMLLiteral** - The datatype of XML literal values
- **rdf:JSON** - The datatype of RDF literals storing JSON content

---

## Datatype Details

### rdf:HTML {#html}

The datatype of RDF literals storing fragments of HTML content.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?rdfs:subClassOf}

**Explanation**: rdf:HTML allows storing HTML markup as literal values in RDF. This enables RDF graphs to contain rich HTML content that can be rendered directly in web applications while maintaining the semantic structure of the data.

**Use cases**: Storing formatted descriptions with HTML markup, preserving rich text content from web pages, embedding HTML snippets in metadata, representing content that needs to be displayed with formatting.

### rdf:langString {#langstring}

The datatype of language-tagged string values.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?rdfs:subClassOf}

**Explanation**: rdf:langString represents string values with associated language tags (e.g., "hello"@en, "bonjour"@fr). This enables RDF to store multilingual content while maintaining language information for proper display and processing. Language tags follow BCP 47 standards.

**Use cases**: Storing titles and descriptions in multiple languages, representing localized content, enabling internationalization of RDF data, supporting language-specific display in applications.

### rdf:PlainLiteral {#plainliteral}

The class of plain (i.e. untyped) literal values, as used in RIF and OWL 2.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?rdfs:subClassOf}

**Explanation**: rdf:PlainLiteral represents untyped literal values that don't have a specific datatype assigned. This is used primarily in Rule Interchange Format (RIF) and OWL 2 for representing plain string values without additional type constraints.

**Use cases**: Storing simple string values without datatype constraints, interoperating with RIF and OWL 2 systems, representing data where the specific datatype is unknown or not important.

### rdf:XMLLiteral {#xmlliteral}

The datatype of XML literal values.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?rdfs:subClassOf}

**Explanation**: rdf:XMLLiteral allows storing XML content as literal values in RDF. This enables RDF graphs to contain well-formed XML fragments that can be parsed and processed as XML while maintaining their integration with the semantic graph structure.

**Use cases**: Storing XML fragments as metadata, preserving XML markup from legacy systems, embedding structured data in XML format within RDF, representing content that requires XML validation and processing.

### rdf:JSON {#json}

The datatype of RDF literals storing JSON content.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON> {?mrdf:fullIRI}

**Subclass of**: [rdfs:Literal](http://www.w3.org/2000/01/rdf-schema#Literal) {+Literal ?rdfs:subClassOf}

**Explanation**: rdf:JSON allows storing JSON data as literal values in RDF. This enables RDF graphs to contain structured JSON data that can be parsed and processed as JSON while maintaining integration with the semantic graph. This is particularly useful for bridging RDF and JSON-based systems.

**Use cases**: Storing JSON-LD compatible data, preserving JSON structures from web APIs, embedding configuration data in JSON format, representing complex nested data structures within RDF, interoperating with modern web applications that use JSON.






{=}



<a id="rdf-properties"></a>

[mrdf] <https://mdld.js.org/rdf/>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# RDF Properties {=mrdf:properties .Container label}

> Structural and reification properties for RDF modeling and statement management {comment}

## Overview

RDF provides 9 core properties for modeling relationships and reification:

- **rdf:type** - The subject is an instance of a class
- **rdf:subject** - The subject of the subject RDF statement
- **rdf:predicate** - The predicate of the subject RDF statement
- **rdf:object** - The object of the subject RDF statement
- **rdf:value** - Idiomatic property used for structured values
- **rdf:first** - The first item in the subject RDF list
- **rdf:rest** - The rest of the subject RDF list after the first item
- **rdf:language** - The language component of a CompoundLiteral
- **rdf:direction** - The base direction component of a CompoundLiteral

---

## Property Details

### rdf:type {#type}

The subject is an instance of a class.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:domain}

**Range**: [rdfs:Class](http://www.w3.org/2000/01/rdf-schema#Class) {+Class ?rdfs:range}

**Explanation**: The most fundamental property in RDF, used to state that a resource is an instance of a class. This property is used to make type declarations in RDF, enabling classification and organization of resources. In object-oriented terminology, this corresponds to the relationship between an object and its class.

**Use cases**: Classifying resources as instances of specific types (e.g., a person as a foaf:Person, a document as a schema:CreativeWork), enabling type-based reasoning and querying, organizing resources into categories for better data management.

### rdf:subject {#subject}

The subject of the subject RDF statement.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#subject> {?mrdf:fullIRI}

**Domain**: [rdf:Statement](http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement) {+rdf:Statement ?rdfs:domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:range}

**Explanation**: Used in RDF reification to identify the subject (the resource being described) of a reified statement. When making statements about statements (higher-order statements), rdf:subject is one of the four properties needed to model the original statement as a resource.

**Use cases**: Attributing statements to specific sources, adding provenance metadata to track who said what about which resource, enabling trust mechanisms by allowing statements about the reliability of other statements.

### rdf:predicate {#predicate}

The predicate of the subject RDF statement.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate> {?mrdf:fullIRI}

**Domain**: [rdf:Statement](http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement) {+rdf:Statement ?rdfs:domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:range}

**Explanation**: Used in RDF reification to identify the predicate (the property or relationship) of a reified statement. When making statements about statements, rdf:predicate is one of the four properties needed to model the original statement as a resource.

**Use cases**: Analyzing which properties are being used in statements, enabling queries about statement patterns, supporting metadata about the types of relationships being asserted in the graph.

### rdf:object {#object}

The object of the subject RDF statement.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#object> {?mrdf:fullIRI}

**Domain**: [rdf:Statement](http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement) {+rdf:Statement ?rdfs:domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:range}

**Explanation**: Used in RDF reification to identify the object (the value or target resource) of a reified statement. When making statements about statements, rdf:object is one of the four properties needed to model the original statement as a resource.

**Use cases**: Tracking what values are being asserted in statements, enabling analysis of statement patterns, supporting queries about the targets of relationships in the graph.

### rdf:value {#value}

Idiomatic property used for structured values.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#value> {?mrdf:fullIRI}

**Domain**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:range}

**Explanation**: A general-purpose property for structured values. The rdf:value property is idiomatic, meaning it's a convention used by the RDF community to provide the main value of a structured resource. It's commonly used when a resource represents a value with additional structure or metadata.

**Use cases**: Providing the main value of a measurement resource (e.g., the numeric value of a temperature reading with unit metadata), representing structured values like dates with timezones, quantities with units, or ranges with bounds.

### rdf:first {#first}

The first item in the subject RDF list.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> {?mrdf:fullIRI}

**Domain**: [rdf:List](http://www.w3.org/1999/02/22-rdf-syntax-ns#List) {+rdf:List ?rdfs:domain}

**Range**: [rdfs:Resource](http://www.w3.org/2000/01/rdf-schema#Resource) {+Resource ?rdfs:range}

**Explanation**: Used with rdf:rest to construct linked lists in RDF. The rdf:first property identifies the first item in an RDF list. Together with rdf:rest, this provides a functional approach to representing ordered sequences that can be shared and nested.

**Use cases**: Building ordered sequences that can be shared across multiple contexts, implementing functional programming-style list operations, creating reusable sequence definitions, representing collections where the list structure itself is important.

### rdf:rest {#rest}

The rest of the subject RDF list after the first item.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> {?mrdf:fullIRI}

**Domain**: [rdf:List](http://www.w3.org/1999/02/22-rdf-syntax-ns#List) {+rdf:List ?rdfs:domain}

**Range**: [rdf:List](http://www.w3.org/1999/02/22-rdf-syntax-ns#List) {+rdf:List ?rdfs:range}

**Explanation**: Used with rdf:first to construct linked lists in RDF. The rdf:rest property points to the remainder of the list after the first item. The rest of the final list is rdf:nil, which serves as the list terminator. This enables functional list processing and sharing.

**Use cases**: Building recursive list structures, implementing list processing algorithms, sharing list tails between multiple lists, representing sequences where functional composition is needed.

### rdf:language {#language}

The language component of a CompoundLiteral.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#language> {?mrdf:fullIRI}

**Domain**: [rdf:CompoundLiteral](http://www.w3.org/1999/02/22-rdf-syntax-ns#CompoundLiteral) {+rdf:CompoundLiteral ?rdfs:domain}

**Explanation**: Specifies the language component of a CompoundLiteral, enabling proper handling of multilingual text. Used together with rdf:direction to provide complete language and direction information for internationalized content, particularly important for bidirectional text.

**Use cases**: Storing text with explicit language tags for proper display, supporting internationalization of RDF data, enabling language-specific processing and rendering, handling content that requires both language and direction information.

### rdf:direction {#direction}

The base direction component of a CompoundLiteral.

<http://www.w3.org/1999/02/22-rdf-syntax-ns#direction> {?mrdf:fullIRI}

**Domain**: [rdf:CompoundLiteral](http://www.w3.org/1999/02/22-rdf-syntax-ns#CompoundLiteral) {+rdf:CompoundLiteral ?rdfs:domain}

**Explanation**: Specifies the base direction component of a CompoundLiteral, indicating whether text should be displayed left-to-right (ltr) or right-to-left (rtl). Used together with rdf:language to provide complete language and direction information for internationalized content, particularly important for languages like Arabic, Hebrew, and other bidirectional scripts.

**Use cases**: Handling bidirectional text in internationalized applications, supporting proper text rendering for right-to-left languages, ensuring correct display direction for mixed-language content, enabling accessibility for users who require specific text direction settings.






{=}



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

- **rdfs:Resource** {+Resource .Class ?mrdf:includes} - The class resource, everything
- **rdfs:Class** {+Class .Class ?mrdf:includes} - The class of classes
- **rdfs:Literal** {+Literal .Class ?mrdf:includes} - The class of literal values
- **rdfs:Datatype** {+Datatype .Class ?mrdf:includes} - The class of RDF datatypes
- **rdfs:Container** {+Container .Class ?mrdf:includes} - The class of RDF containers
- **rdfs:ContainerMembershipProperty** {+ContainerMembershipProperty .Class ?mrdf:includes} - The class of container membership properties

[See all RDFS classes](#rdfs-classes)

## Properties

Schema definition and annotation properties:

- **rdfs:subClassOf** {+subClassOf .rdf:Property ?mrdf:includes} - The subject is a subclass of a class
- **rdfs:subPropertyOf** {+subPropertyOf .rdf:Property ?mrdf:includes} - The subject is a subproperty of a property
- **rdfs:domain** {+domain .rdf:Property ?mrdf:includes} - A domain of the subject property
- **rdfs:range** {+range .rdf:Property ?mrdf:includes} - A range of the subject property
- **rdfs:comment** {+comment .rdf:Property ?mrdf:includes} - A description of the subject resource
- **rdfs:label** {+label .rdf:Property ?mrdf:includes} - A human-readable name for the subject
- **rdfs:seeAlso** {+seeAlso .rdf:Property ?mrdf:includes} - Further information about the subject resource
- **rdfs:isDefinedBy** {+isDefinedBy .rdf:Property ?mrdf:includes} - The definition of the subject resource
- **rdfs:member** {+member .rdf:Property ?mrdf:includes} - A member of the subject resource

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
