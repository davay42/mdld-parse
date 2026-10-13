[dc] <http://purl.org/dc/terms/>
[owl] <http://www.w3.org/2002/07/owl#>
[cnt] <http://www.w3.org/2011/content#>

# Representing Content in RDF {=http://www.w3.org/2011/content .owl:Ontology label @en}

[Representing Content in RDF as defined by http://www.w3.org/TR/Content-in-RDF/] {comment @en}

This ontology was published as a [Working Draft 29 April 2011] {owl:versionInfo @en} by the W3C. It provides a standardized vocabulary for embedding content — whether text, binary data, or structured markup — directly within RDF graphs, enabling web agents to carry arbitrary payloads as first-class linked data.

The full specification is available at [http://www.w3.org/TR/Content-in-RDF/] {+http://www.w3.org/TR/Content-in-RDF/ ?isDefinedBy}. For evaluation and reporting vocabulary that complements this work, see also [http://www.w3.org/WAI/intro/earl] {+http://www.w3.org/WAI/intro/earl ?seeAlso}. The ontology [dc:] {+dc: ?owl:imports} to support rich metadata descriptions alongside content representations.

## Classes

The ontology defines a hierarchy of content types, all rooted in a single base class. Specialized subclasses handle binary, textual, and XML content, each carrying the properties appropriate to its encoding.

## Content {=cnt:Content .Class .owl:Class label @en}

[The content.] {comment @en}

This is the foundational class from which all specific content representations derive. Any resource that carries embeddable content — whether text, binary, or structured markup — should be typed as a member of this class.

## Base64 content {=cnt:ContentAsBase64 .Class .owl:Class label @en}

[The base64 encoded content (can be used for binary content).] {comment @en}

When content cannot be represented as plain text — for example, images, audio, or other binary payloads — it can be encoded as a Base64 string. This class is a [Content] {+cnt:Content ?subClassOf}, specializing it for binary data that has been encoded into ASCII-safe text.

## Text content {=cnt:ContentAsText .Class .owl:Class label @en}

[The text content (can be used for text content).] {comment @en}

For content that is naturally textual — prose, code, configuration files, or any character-based data — this class provides the appropriate typing. Like its sibling, it is a [Content] {+cnt:Content ?subClassOf}.

## XML content {=cnt:ContentAsXML .Class .owl:Class label @en}

[The XML content (can only be used for XML-wellformed content).] {comment @en}

XML content requires special handling because it must be well-formed according to the XML specification. This class, also a [Content] {+cnt:Content ?subClassOf}, carries additional properties for managing XML declarations, document type definitions, and the structural components of an XML document.

## Document type declaration {=cnt:DoctypeDecl .Class .owl:Class label @en}

[The document type declaration.] {comment @en}

XML documents may begin with a document type declaration (DOCTYPE) that specifies the grammar and constraints for the document. This class represents that declaration as a first-class resource in the graph, enabling its components — public and system identifiers, internal subsets — to be described independently.

## Properties

The following properties describe how content is stored, encoded, and structured within the ontology. Each property constrains its domain (the class of resources it applies to) and its range (the type of value it accepts).

## Base64 encoded byte sequence {=cnt:bytes .owl:ObjectProperty .rdf:Property label @en}

[The Base64 encoded byte sequence of the content.] {comment @en}

This property holds the actual Base64-encoded data for binary content. Its domain is [Base64 content] {+cnt:ContentAsBase64 ?domain}, and its range is [xsd:base64Binary] {+xsd:base64Binary ?range}, ensuring that only properly encoded binary data is associated with this property.

## Character encoding {=cnt:characterEncoding .owl:ObjectProperty .rdf:Property label @en}

[The character encoding used to create a character sequence from a byte sequence or vice versa.] {comment @en}

Character encoding bridges the gap between raw bytes and readable text. This property applies to any [Content] {+cnt:Content ?domain} resource and takes a [Literal] {+Literal ?range} value specifying the encoding scheme (such as UTF-8 or ISO-8859-1).

## Character sequence {=cnt:chars .owl:ObjectProperty .rdf:Property label @en}

[The character sequence of the text content.] {comment @en}

For text content, this property carries the actual character data. Its domain is [Text content] {+cnt:ContentAsText ?domain} and its range is [Literal] {+Literal ?range}.

## XML character encoding {=cnt:declaredEncoding .owl:ObjectProperty .rdf:Property label @en}

[The character encoding declared in the XML declaration.] {comment @en}

XML documents may declare their character encoding in the XML prolog. This property captures that declaration. Its domain is [XML content] {+cnt:ContentAsXML ?domain} and its range is [Literal] {+Literal ?range}.

## Document type name {=cnt:doctypeName .owl:ObjectProperty .rdf:Property label @en}

[The document type name.] {comment @en}

Every document type declaration identifies a root element type by name. This property records that name. Its domain is [Document type declaration] {+cnt:DoctypeDecl ?domain} and its range is [Literal] {+Literal ?range}.

## Document type declaration {=cnt:dtDecl .owl:ObjectProperty .rdf:Property label @en}

[The document type declaration.] {comment @en}

This property links an XML content resource to its associated document type declaration. Its domain is [XML content] {+cnt:ContentAsXML ?domain} and its range is [Document type declaration] {+cnt:DoctypeDecl ?range}.

## Internal DTD subset {=cnt:internalSubset .owl:ObjectProperty .rdf:Property label @en}

[The internal document type definition subset within the document type declarations.] {comment @en}

A document type declaration may contain an internal subset with element and attribute definitions. This property captures that internal subset. Its domain is [Document type declaration] {+cnt:DoctypeDecl ?domain} and its range is [Literal] {+Literal ?range}.

## XML leading misc {=cnt:leadingMisc .owl:ObjectProperty .rdf:Property label @en}

[The XML content preceding the document type declaration.] {comment @en}

XML documents may contain processing instructions or comments before the DOCTYPE declaration. This property preserves that leading miscellaneous content. Its domain is [XML content] {+cnt:ContentAsXML ?domain} and its range is [XMLLiteral] {+XMLLiteral ?range}.

## Public ID {=cnt:publicId .owl:ObjectProperty .rdf:Property label @en}

[The document type declarations's public identifier.] {comment @en}

A document type declaration may reference a public identifier that names a publicly available DTD. This property records that public identifier. Its domain is [Document type declaration] {+cnt:DoctypeDecl ?domain} and its range is [Literal] {+Literal ?range}.

## XML rest {=cnt:rest .owl:ObjectProperty .rdf:Property label @en}

[The XML content following the document type declaration.] {comment @en}

After the document type declaration, the remainder of the XML document follows. This property captures that remaining content. Its domain is [XML content] {+cnt:ContentAsXML ?domain} and its range is [XMLLiteral] {+XMLLiteral ?range}.

## XML standalone document declaration {=cnt:standalone .owl:ObjectProperty .rdf:Property label @en}

[The standalone declaration in the XML declaration.] {comment @en}

The XML declaration may include a standalone attribute indicating whether the document relies on external markup declarations. This property records that value. Its domain is [XML content] {+cnt:ContentAsXML ?domain} and its range is [Literal] {+Literal ?range}.

## System ID {=cnt:systemId .owl:ObjectProperty .rdf:Property label @en}

[The document type declarations's system identifier (typed: xsd:anyURI)] {comment @en}

A document type declaration may reference a system identifier — a URI pointing to the DTD. This property records that URI. Its domain is [Document type declaration] {+cnt:DoctypeDecl ?domain} and its range is [xsd:anyURI] {+xsd:anyURI ?range}.

## XML version {=cnt:version .owl:ObjectProperty .rdf:Property label @en}

[The XML version declared in the XML declaration.] {comment @en}

Every XML document declares its version in the XML prolog (typically "1.0" or "1.1"). This property captures that version string. Its domain is [XML content] {+cnt:ContentAsXML ?domain} and its range is [Literal] {+Literal ?range}.