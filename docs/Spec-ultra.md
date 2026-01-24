# MD-LD v0.3 — Core Specification

**Markdown-Linked Data**: Semantic annotations for CommonMark using `{...}` blocks only.

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
**Links**: `http://url` `[label](url)` `![alt](url)`

**Rule**: `{...}` immediately follows carrier.

## 5. Attachment

1. Nearest preceding value carrier, OR
2. Stand alone (current subject or following list)

Ambiguous = no output.

## 6. Subjects

```
{=IRI}        # Full IRI, persists
{=#fragment}  # Relative to current subject
{+iri}        # Temporary object for ?/! predicates
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
[Image](https://example.com/img.jpg) {?image name}
[W3C](https://www.w3.org/RDF) {?dct:references name}
[Alice] {=urn:person:alice ?author name}
```

## 11. Lists

`{...}` before list applies to all items at same indentation.

```md
Crew: {?crew .Person name}
- Neil {=ex:neil}
- Buzz {=ex:buzz}
```

Nested lists = new scope, no inheritance.

## 12. Reverse Relations

`!p` flips direction only.

```md
Used in: {!hasPart}
- Bread {=ex:bread}
# Creates: ex:bread schema:hasPart S
```

## 13. Code Blocks

`{...}` on opening fence:

```md
```js {=ex:code .SoftwareSourceCode text}
console.log("hi")
```
```

## 14. Context

**Default**:
```json
{"@vocab": "http://www.w3.org/2000/01/rdf-schema#", "rdf": "...", "rdfs": "...", "xsd": "...", "schema": "..."}
```

**Declarations**:
```
[prefix] <IRI>      # Prefix
[@vocab] <IRI>       # Vocabulary
```

Forward-apply, later overrides earlier.

## 15. Forbidden

Implicit labels, structural inference, auto-subjects, literal lists, blank nodes, key=value, predicate guessing, backtracking, CURIE in links.

## 16. Conformance

Must: Follow routing rules, emit only from `{...}`, single-pass, deterministic, traceable, support all predicate forms (`p`, `?p`, `!p`).
