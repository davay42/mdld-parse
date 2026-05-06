# MD-LD User Guide

This document will guide you from the start to proficiency in MD-LD authoring.

## 1. First annotation, primary subject definition

~~~md
# Alice's Journal 

Hi! My name is Alice Smith. This is my personal semantic journal.
~~~

This is a regular Markdown note. It is transparent for MD-LD parser. Now let's add our first annotation. We can think of it as like we have a set of special highlighters that we use to mark important parts of the text. So first line is the choice of particular set of markers and in the `##` header you can see our first `{}` curly braces annotation. 

~~~md
[my] <tag:alice.smith@example.org,2026:>

# Alice's Journal 

## Alice {=my:person/alice .prov:Person label}

Hi! My name is Alice Smith. This is my personal semantic journal.
~~~

Now we have used our personal identifier for Alice - `tag:alice.smith@example.org,2026:person/alice` - it gets unfolded from the short `my:` value with the base IRI set in the first line. This declared that Alice is a person with a label "Alice". Our first point in the knowledge graph. We use built-in PROV-O standard ontology that is designed to describe relations between agents, entities and activities. A `prov:Person` is a kind of `prov:Agent`. `label` is also added as a literal property to have a nice short name for display in graph visualizations. Not having a prefix assumes use the default `@vocab` - `rdfs:`. So `label` is a shortcut for `rdfs:label` to ease friction at labeling things. Then the node on the graph will show cleanly as `Alice` in most graph visualizers and interfaces.

## 2. Context, authority, prefixes

First step is to get the concept of namespaces for building knowledge graphs. Everything in the graph - be it subjects, predicates or objects - each of them have unique identifiers - IRI. An IRI may be defined in multiple ways. Most straightforward is the use of URL as IRI. You can see this in all W3C ontologies definitions, that are included as default context in MD-LD. These prefixes may be used without declaration:

```md
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[sh] <http://www.w3.org/ns/shacl#>
[prov] <http://www.w3.org/ns/prov#>
```

These are 5 core ontologies - collections of interconnected terms - that lay foundation to the expressive knowledge graphs. You can open the links and read about the terms available in each ontology.


So how do we create an IRI? If you have a web-site or you prefer to use some external authority like your company domain or your own social media account - just use the URL link as IRI and it's good to go - `# Alice {=https://example.org/person/alice .prov:Person label}`


But what if you don't have a domain or just want a local personal namespaced IRI? just use the RFC 4151 format that allows to create private namespace with domain/email or any other authority you may provide - be it an ID in some system or a cryptographic key. The IRI assembles as follows - starts with `tag:`, then we put the authority - domain, email or other, then `,2026-05-04:` - the time when the authority was active. You can also provide only year or only year and month - then it will be assumed that you were owning the authority on 1st day of the month/year. Then you may add a custom subspace `journal/` and here you go - your own tag-based namespace is ready for use.

`[journal] <tag:alice.smith@example.org,2026:journal/>`

This is your first important line of MD-LD - a prefix declaration - a choice of that particular highlighter color that we need to build or own knowledge graphs.

When you write `[prefix]` it holds the short version of the IRI in `<IRI>` and it allows us to author complex IRIs without repeating long strings every time. To generate `http://www.w3.org/ns/prov#Entity` we can use shorter version - `prov:Entity` - 'prov:' is built-in. For everything else - don't forget to declare all prefixes first. This is the key feature of MD-LD - each note is self-contained and can be understood without any external context.





