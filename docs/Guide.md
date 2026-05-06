# MD-LD User Guide

This document will guide you from the start to proficiency in MD-LD authoring.

Let's imagine that we start a fresh personal semantic notebook using knowledge graphs. Let's start from a couple of contacts, it's nice to see the connections between people as a graph. So, as always, we have Alice, Bob, Claire and David.

## 1. First annotation, primary subject definition

So Alice starts her personal semantic notebook and wants to define herself as the primary subject of her notebook.

~~~md
# Alice

This is my personal semantic notebook. I build connections here and grow my understanding of the world. 
~~~

This is a regular Markdown note. It doesn't contain any semantic meaning yet and is transparent for MD-LD parser. Now let's add our first annotation to it. We can think of it as like we have a special highlighter that we use to mark important parts of the text. We can go through the text and mark different parts with different colors. And these marks connect to each other to form a knowledge graph that we can query and visualize.

~~~md
# Alice {=tag:alice.smith@example.org,2026:person/alice .prov:Person label}

This is my personal semantic notebook. I build connections here and grow my understanding of the world. 
~~~

## 2. Context, authority, prefixes

First step is to understand the namespaces we use to craft our knowledge graphs. Every entity in the graph - be it subject (a noun), a predicate (a verb) or an object (another noun) - all have unique identifiers - IRI, that may be defined in multiple ways. Most straightforward is the use of URL as IRI. You can see this in all W3C ontologies definitions, that are included as default context in MD-LD. These prefixes may be used without declaration:

```md
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[sh] <http://www.w3.org/ns/shacl#>
[prov] <http://www.w3.org/ns/prov#>
```

These are 5 core ontologies - collections of interconnected terms - that lay foundation to the semantic graphs.

So `[prefix]` holds the short version of the IRI in `<IRI>` and it allows us to author complex IRIs without repeating long strings every time. To generate `http://www.w3.org/ns/prov#Entity` we can use shorter version - `prov:Entity` interchangeably. 

To create a piece of data we need to use our own semantic namespace - a base IRI to become a root for our terms. It may be a web-site that you own and may use to publish or verify published data. Let's say you own a `https://example.org` domain, then you may start your document with `[ex] <https://example.org/my-project/>` line so that you may describe your public project. You don't need to publish the data there - IRI is used to identify and not necessarity retrieve pieces of data.

But what if you don't have a domain or just want a personal namespaced IRI? Use the RFC 4151 standard that allows to create private namespace with domain/email or any other authority you may provide - be it an ID in some system or a cryptographic key. The IRI assembles as follows - starts with `tag:`, then we put the authority - domain, email or other, then `,2026-05-04:` - the time when the authority was active. You can use only year or only year and month - then it will be assumed that you were owning the authority on 1st day of the month/year. Then you may add a custom subspace `journal:` and here you go - your own tag-based namespace is ready for use.

`[me] <tag:me@example.org,2026:>`

