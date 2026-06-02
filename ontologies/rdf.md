[owl] <http://www.w3.org/2002/07/owl#>
[dc] <http://purl.org/dc/elements/1.1/> 

# The RDF Concepts Vocabulary (RDF) {=rdf: .owl:Ontology dc:title label}

> This is the RDF Schema for the RDF vocabulary terms in the RDF Namespace, defined in RDF 1.1 Concepts. {dc:description}

Published on [2019-12-16] {dc:date}.

## Overview

This catalog presents the complete RDF 1.1 Concepts vocabulary in MDLD format, organized by the key modeling topics that matter for RDF authoring and graph design: **Types and Values**, **Statements**, **Collections**, **Lists**, and **Compound Literals**.

## Types and Values 

**RDF** {=rdf:} includes the definition of a general **Property** {+rdf:Property !isDefinedBy} class and most important properties of any subject - its  **type** {+rdf:type !isDefinedBy} and structured **value** {+rdf:value !isDefinedBy}.

### Property {=rdf:Property .Class label}

`The class of RDF properties.` {comment}

Unlike traditional database columns or Object-Oriented instance variables, RDF properties exist as first-class [citizens] {+Resource ?rdfs:subClassOf} completely independent of any class. They define directed edges in a global graph. This allows you to dynamically extend any entity with new relationships at runtime without modifying a central table schema.

**Use cases**: Creating decoupled, reusable relationship predicates (e.g., hasAuthor, dependsOn) across disparate data sources. Enabling schema-less data integration where properties from entirely different domains (e.g., FOAF and Dublin Core) are safely merged on the same node.

### type {=rdf:type .rdf:Property label}

`The subject is an instance of a class.` {comment}

Assigns a [subject] {+Resource ?domain} to be an instance of a [Class] {+Class ?range}.

The foundational link between graph instances and their semantic blueprints. In the semantic web's Open-World Assumption, an entity is not limited to a single rigid type; a single resource can simultaneously belong to multiple classes (e.g., a node can be both an Organization and a Publisher).

**Use cases**: Classifying resources as instances of specific types (e.g., a person as a foaf:Person, a document as a schema:CreativeWork), enabling type-based reasoning and querying, organizing resources into categories for better data management.

### value {=rdf:value .rdf:Property label}

`Idiomatic property used for structured values.` {comment}

Assigns a [subject] {+Resource ?domain} to have a structured [value] {+Resource ?range}.

A general-purpose property for structured values. The rdf:value property is idiomatic, meaning it's a convention used by the RDF community to provide the main value of a structured resource. It's commonly used when a resource represents a value with additional structure or metadata.

**Use cases**: Providing the main value of a measurement resource (e.g., the numeric value of a temperature reading with unit metadata), representing structured values like dates with timezones, quantities with units, or ranges with bounds.

## Statements

**RDF** {=rdf:} describes elevated **Statements** {+rdf:Statement !isDefinedBy} composed of a **subject** {+rdf:subject !isDefinedBy}, a **predicate** {+rdf:predicate !isDefinedBy}, and an **object** {+rdf:object !isDefinedBy}.

### Statement {=rdf:Statement .Class label}

The class of RDF [statements] {+Resource ?rdfs:subClassOf}.

Each statement consists of a **subject** {+rdf:subject .rdf:Property label !domain}, a **predicate** {+rdf:predicate .rdf:Property label !domain}, and an **object** {+rdf:object .rdf:Property label !domain}. All of which are [Resources] {=Resource}: *subject* {+rdf:subject !range}, *predicate* {+rdf:predicate !range}, *object* {+rdf:object !range}.

**Explanation**: In addition to making statements about Web resources, RDF can be used for making statements about other RDF statements (higher-order statements). In order to make a statement about another statement, we actually have to build a model of the original statement; this model is a new resource to which we can attach additional properties. This process is formally called reification in the Knowledge Representation community. A model of a statement is called a reified statement.

**Use cases**: Attributing statements to specific sources, adding metadata like confidence scores or timestamps to statements, modeling provenance and trust in information.

## Collections

[RDF] {=rdf:} models collections through a small set of container classes and list vocabulary. The class **Bag** {+rdf:Bag !isDefinedBy} represents unordered containers, while **Seq** {+rdf:Seq !isDefinedBy} captures ordered sequences and **Alt** {+rdf:Alt !isDefinedBy} captures alternative variants. 

### Bag {=rdf:Bag .Class label}

`The class of unordered containers.` {comment}

Bag [containers] {+Container ?rdfs:subClassOf} represent unordered collections of resources or literals. The membership relation between the container resource and the resources that belong in the collection is defined by properties named "_1", "_2", "_3", etc. Bag containers are not equivalent to repeated properties of the same type - authors need to decide on a case-by-case basis which one is more appropriate.

**Use cases**: Listing students in a course where order doesn't matter, representing mirrored web sites, collecting tags or categories, grouping equivalent items.

### Seq {=rdf:Seq .Class label}

`The class of ordered containers.` {comment}

Seq [containers] {+Container ?rdfs:subClassOf} represent ordered sequences of resources or literals. Like Bag containers, they use membership properties "_1", "_2", "_3", etc., but the order of these properties is significant. The sequence maintains the intended ordering of its members.

**Use cases**: Listing authors in alphabetical order, sorting papers by publication date, representing ordered steps in a process, maintaining sequence numbers where position matters.

### Alt {=rdf:Alt .Class label}

`The class of alternatives.` {comment}

Alt [containers] {+Container ?rdfs:subClassOf} represent collections of alternatives where typically one member is the default or preferred value. An Alt container is required to have at least one member, which will be identified by the property "_1" and is considered the default or preferred value. Alternative containers are frequently used in conjunction with language tagging.

**Use cases**: Providing multiple language variants of a title, listing alternative distribution sites where any one is acceptable, offering different format versions of a resource, representing fallback options.

## Lists

The linked-list structure in [RDF] {=rdf:} is represented by **List** {+rdf:List !isDefinedBy} together with the list-building properties **first** {+rdf:first .rdf:Property !isDefinedBy} and **rest** {+rdf:rest .rdf:Property !isDefinedBy}, and the unique empty list node **nil** {+rdf:nil !isDefinedBy}.

### List {=rdf:List .Class label}

`The class of RDF Lists.` {comment}

RDF Lists are linked list [resources] {+Resource ?rdfs:subClassOf} that provide a more flexible way to represent ordered collections than Seq containers. Lists use rdf:first to identify the first item and rdf:rest to point to the remainder of the list. The empty list is represented by rdf:nil. Lists can be nested and shared between multiple statements.

**Use cases**: Representing ordered sequences that need to be shared across multiple contexts, building complex nested structures, implementing functional programming-style list operations, creating reusable sequence definitions.


### First List Item {=rdf:first .rdf:Property label}

The first [item] {+Resource ?range} in the subject RDF [list] {+rdf:List ?domain}.

**Explanation**: Used with rdf:rest to construct linked lists in RDF. The rdf:first property identifies the first item in an RDF list. Together with rdf:rest, this provides a functional approach to representing ordered sequences that can be shared and nested.

**Use cases**: Building ordered sequences that can be shared across multiple contexts, implementing functional programming-style list operations, creating reusable sequence definitions, representing collections where the list structure itself is important.

### Rest List Item {=rdf:rest .rdf:Property label}

The [rest] {+rdf:List ?range} of the subject RDF [list] {+rdf:List ?domain} after the first item.

**Explanation**: Used with rdf:first to construct linked lists in RDF. The rdf:rest property points to the remainder of the list after the first item. The rest of the final list is rdf:nil, which serves as the list terminator. This enables functional list processing and sharing.

**Use cases**: Building recursive list structures, implementing list processing algorithms, sharing list tails between multiple lists, representing sequences where functional composition is needed.

### nil {=rdf:nil .rdf:List label}

The empty list, with no items in it. If the rest of a list is nil then the list has no more items in it.

**Explanation**: The empty list, with no items in it. If the rest of a list is nil then the list has no more items in it.

**Use cases**: Building recursive list structures, implementing list processing algorithms, sharing list tails between multiple lists, representing sequences where functional composition is needed.


## Compound Literals

[RDF] {=rdf:} supports structured literal values with **rdf:CompoundLiteral** {+rdf:CompoundLiteral !isDefinedBy}, carrying both text and presentation metadata. The properties **rdf:language** {+rdf:language .rdf:Property !isDefinedBy} and **rdf:direction** {+rdf:direction .rdf:Property !isDefinedBy} describe the language and base text direction for such literals. RDF also defines specialized literal datatypes for rich value spaces: **rdf:HTML** {+rdf:HTML .Datatype !isDefinedBy}, **rdf:langString** {+rdf:langString .Datatype !isDefinedBy}, **rdf:PlainLiteral** {+rdf:PlainLiteral .Datatype !isDefinedBy}, **rdf:XMLLiteral** {+rdf:XMLLiteral .Datatype !isDefinedBy}, and **rdf:JSON** {+rdf:JSON .Datatype !isDefinedBy}. 

### CompoundLiteral {=rdf:CompoundLiteral .Class label}

A [Resource] {+Resource ?rdfs:subClassOf} representing a compound literal.

**Explanation**: CompoundLiteral represents literals that have additional structure beyond simple string values. It is used with rdf:language to specify the language component and rdf:direction to specify the base direction (left-to-right or right-to-left) for internationalized content. This enables proper handling of bidirectional text in languages like Arabic or Hebrew.

**Use cases**: Representing text with explicit language and direction information, handling internationalized content that requires bidirectional text support, storing literals with rich metadata about language and text direction.


### Compound Literal Language {=rdf:language .rdf:Property label}

The language component of a [CompoundLiteral] {+rdf:CompoundLiteral ?domain}

**Explanation**: Specifies the language component of a CompoundLiteral, enabling proper handling of multilingual text. Used together with rdf:direction to provide complete language and direction information for internationalized content, particularly important for bidirectional text.

**Use cases**: Storing text with explicit language tags for proper display, supporting internationalization of RDF data, enabling language-specific processing and rendering, handling content that requires both language and direction information.

### Compound Literal Direction {=rdf:direction .rdf:Property label}

The base direction component of a [CompoundLiteral] {+rdf:CompoundLiteral ?domain}.

**Explanation**: Specifies the base direction component of a CompoundLiteral, indicating whether text should be displayed left-to-right (ltr) or right-to-left (rtl). Used together with rdf:language to provide complete language and direction information for internationalized content, particularly important for languages like Arabic, Hebrew, and other bidirectional scripts.

**Use cases**: Handling bidirectional text in internationalized applications, supporting proper text rendering for right-to-left languages, ensuring correct display direction for mixed-language content, enabling accessibility for users who require specific text direction settings.


### HTML {=rdf:HTML .Datatype label}

The datatype of RDF [literals] {+Literal ?rdfs:subClassOf} storing fragments of HTML content.

**Explanation**: rdf:HTML allows storing HTML markup as literal values in RDF. This enables RDF graphs to contain rich HTML content that can be rendered directly in web applications while maintaining the semantic structure of the data.

**Use cases**: Storing formatted descriptions with HTML markup, preserving rich text content from web pages, embedding HTML snippets in metadata, representing content that needs to be displayed with formatting.

### Language-tagged String {=rdf:langString .Datatype label}

The datatype of language-tagged string [values] {+Literal ?rdfs:subClassOf}.

**Explanation**: rdf:langString represents string values with associated language tags (e.g., "hello"@en, "bonjour"@fr). This enables RDF to store multilingual content while maintaining language information for proper display and processing. Language tags follow BCP 47 standards.

**Use cases**: Storing titles and descriptions in multiple languages, representing localized content, enabling internationalization of RDF data, supporting language-specific display in applications.

### Plain Literal {=rdf:PlainLiteral .Datatype label}

> The class of plain (i.e. untyped) literal values, as used in RIF and OWL 2 {comment}

<http://www.w3.org/TR/rdf-plain-literal/> {?seeAlso}

The class of plain (i.e. untyped) [literal] {+Literal ?rdfs:subClassOf} values, as used in RIF and OWL 2.

**Explanation**: rdf:PlainLiteral represents untyped literal values that don't have a specific datatype assigned. This is used primarily in Rule Interchange Format (RIF) and OWL 2 for representing plain string values without additional type constraints.

**Use cases**: Storing simple string values without datatype constraints, interoperating with RIF and OWL 2 systems, representing data where the specific datatype is unknown or not important.

### XMLLiteral {=rdf:XMLLiteral .Datatype label}

> The datatype of XML literal values. {comment}

The datatype of XML [literal] {+Literal ?rdfs:subClassOf} values.

**Explanation**: rdf:XMLLiteral allows storing XML content as literal values in RDF. This enables RDF graphs to contain well-formed XML fragments that can be parsed and processed as XML while maintaining their integration with the semantic graph structure.

**Use cases**: Storing XML fragments as metadata, preserving XML markup from legacy systems, embedding structured data in XML format within RDF, representing content that requires XML validation and processing.

### JSON {=rdf:JSON .Datatype label}

> The datatype of RDF literals storing JSON content. {comment}

The datatype of RDF [literals] {+Literal ?rdfs:subClassOf} storing JSON content.

**Explanation**: rdf:JSON allows storing JSON data as literal values in RDF.

**Use cases**: Storing JSON-LD compatible data, preserving JSON structures from web APIs, embedding configuration data in JSON format, representing complex nested data structures within RDF, interoperating with modern web applications that use JSON.

