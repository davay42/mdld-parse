# MD-LD — Core Specification (Minimal)

**Markdown-Linked Data**

A deterministic, streaming-friendly semantic annotation layer for CommonMark Markdown that emits RDF quads **only** from explicit `{...}` annotations.

## 1. Core Rules

- Markdown-preserving (remove `{...}` → valid Markdown)
- No implicit semantics, explicit only
- Single-pass streaming, no backtracking
- No blank nodes, all IRIs
- Every quad traces to `{...}` source

## 2. Graph Model

**Facts**: Subject → Predicate → Object
- **IRIs**: Subjects + objects (identifiers)
- **Literals**: Objects only (data values)

## 3. Available Nodes

- **S**: Current subject (`{=IRI}`, `{=#fragment}`)
- **O**: Object resource (links, images, `{=IRI}`)
- **L**: Literal value (from value carrier)

## 4. Value Carriers

`{...}` attaches to exactly one:

**Inline**: `[text]` `*text*` `**text**` `` `text` ``
**Block**: `# Heading` `- item` `> quote` ````lang````
**Links**: `http://url` `[label](url)` `![alt](url)` `<url>`

**Rule**: `{...}` immediately follows carrier.

## 5. Attachment

1. Nearest preceding value carrier, OR
2. Stand alone (current subject or following list)

Ambiguous = no output.

## 6. Subjects

```
{=IRI}        # Full IRI, persists
{=#fragment}  # Relative to current subject
{+iri}        # Temporary object for local  ?/! predicates
{+#fragment}  # Temporary soft fragment
```

## 7. Types

```
.Class        # S rdf:type schema:Class
.Person .Astronaut  # Multiple types
```

## 8. Predicates

| Syntax | Direction | Use |
|--------|-----------|-----|
| `p`     | S → L     | Literal properties |
| `?p`    | S → O     | Object properties |
| `!p`    | O → S     | Reverse properties |

Create quad only if all nodes exist.

## 9. Literals

From value carrier only.

```
^^datatypeIRI  # Typed data
@lang          # Language tag
```

Common: `xsd:string`, `xsd:integer`, `xsd:gYear`, `xsd:date`.

## 10. Objects

From: `[text](url)`, `![alt](url)`, `{=IRI}`

**Example**:
```md
## References {=ex:references}
[Image](https://example.com/img.jpg) {?image label}
[W3C](https://www.w3.org/RDF) {?dct:references label}
[Alice] {=tag:alice@example.com,2026:me ? label}
```

## 11. Lists

`Anything {...}` before list applies to all items at same indentation.

```md
[prj] <tag:project@example.com,2026-02-03:>
[foaf] <http://xmlns.com/foaf/0.1/>

## Local Projects Team {=prj:team .foaf:Group label}

Team members: {?foaf:member .foaf:Person foaf:name}

- Alice Cooper {=prj:alice}
- Bruce Miles {=prj:bruce}
  And his helpful family: {?foaf:knows .foaf:Person foaf:name}
  - Cecile Miles {prj:cecile}
  - Roger Miles {prj:roger}
- Eva Clark {=prj:eva}
```

Nested lists = new scope, no inheritance.

**Ordered lists**  are possible with explicit rdf:List construction:
```md
[ex] <http://example.org/>

# Manual list construction {=ex:manualList label}
[head] {=ex:l1 ?sh:in .rdf:List}
[a] {+ex:A ?rdf:first}
[list2] {=ex:l2 ?rdf:rest}
[b] {+ex:B ?rdf:first}
[nil] {+rdf:nil ?rdf:rest}
{=}
```

## 12. Reverse Relations

`!p` flips direction only.

```md
Used in: {!schema:hasPart}
- Bread {=ex:bread}
# Creates: ex:bread schema:hasPart S
```

## 13. Code Blocks

`{...}` on opening fence:

```md
```js {=ex:code .SoftwareSourceCode schema:text }
console.log("hi")
```
```

## 14. Context

### Default Context

```json
{
    "@vocab": "http://www.w3.org/2000/01/rdf-schema#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "sh": "http://www.w3.org/ns/shacl#",
    "prov": "http://www.w3.org/ns/prov#"
}
```

### Adding Prefixes

```md
[alice] <tag:alice@example.com,2026:>
[wd] <https://www.wikidata.org/entity/>
```

### Prefix Folding: Hierarchical IRI Authoring

Build namespace hierarchies by referencing previously declared prefixes:

```md
[my] <tag:mymail@domain.com,2026:>
[j] <my:journal:>
[p] <my:property:>
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
```

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- Circular references are treated as literal strings
- Later declarations override earlier ones

### Setting Vocabulary

```md
[@vocab] <http://schema.org/>
```

**Rules:** Apply forward, later overrides earlier, single-pass resolution.

## 15. Forbidden

Implicit labels, structural inference, auto-subjects, literal lists, blank nodes, key=value, predicate guessing, backtracking, CURIE in links.

## 16. Conformance

Must: Follow routing rules, emit only from `{...}`, single-pass, deterministic, traceable, support all predicate forms (`p`, `?p`, `!p`).
