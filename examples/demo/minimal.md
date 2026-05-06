[my] <tag:alice@example.com,2026:minimal/>

# Simple Note {=my:note .prov:Entity label}

This demonstrates basic MD-LD annotation patterns.

## Basic Properties

Title: [Hello World] {my:title} 
Status: *draft* {my:status}
Priority: **medium** {my:priority}

## Typed Values

Created: `2026-05-06` {my:created ^^xsd:date}
Count: `42` {my:count ^^xsd:integer}
Rating: __4.5__ {my:rating ^^xsd:decimal}
Active: **true** {my:active ^^xsd:boolean}

## Simple Link

Related to: [Example Project] {+my:example-project ?my:relatedTo .prov:Project label}

