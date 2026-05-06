[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[my] <tag:alice@example.com,2026:>

# RDF Fundamentals {=my:rdf-demo .rdfs:Resource label}

Demonstrates core RDF concepts using RDF and RDFS vocabularies.

## Class Definitions

### Document Class {=my:Document .rdfs:Class label}

A document is a resource that can have content.

Properties:
- **Title**: [string] {+xsd:string ?rdfs:range}
- **Content**: [text] {+rdfs:Literal ?rdfs:range}
- **Format**: [string] {+xsd:string ?rdfs:range}

### Person Class {=my:Person .rdfs:Class label}

A person is an agent who can create documents.

Subclass of: [Agent] {+rdfs:Resource ?rdfs:subClassOf}

Properties:
- **Name**: [string] {+xsd:string ?rdfs:range}
- **Email**: [string] {+xsd:string ?rdfs:range}
- **Created**: [Document] {+my:Document ?rdfs:range}

### Property Definitions

### Title Property {=my:title .rdf:Property label}

Relates a document to its title.

Domain: [Document] {+my:Document ?rdfs:domain}
Range: [string] {+xsd:string ?rdfs:range}

### Author Property {=my:author .rdf:Property label}

Relates a document to its author.

Domain: [Document] {+my:Document ?rdfs:domain}
Range: [Person] {+my:Person ?rdfs:range}

## Instance Data

### Sample Document {=my:sample-doc .my:Document label}

Title: [RDF Basics] {my:title}
Content: [This document explains RDF fundamentals.] {my:content}
Format: [Markdown] {my:format}

### Sample Person {=my:alice .my:Person label}

Name: [Alice Smith] {my:name}
Email: [alice@example.com] {my:email}

### Connecting Them

The document was created by [Alice] {+my:alice ?my:author}.

This demonstrates:
- Class definitions with rdfs:Class
- Property definitions with rdf:Property
- Domain and range constraints
- Subclass relationships with rdfs:subClassOf
- Instance data with proper typing
