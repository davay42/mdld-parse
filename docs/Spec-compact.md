# MD-LD — Core Specification (Minimal)

**Markdown-Linked Data**

A deterministic, streaming-friendly semantic annotation layer for CommonMark Markdown that emits RDF quads **only** from explicit `{...}` annotations.

---

## 1. Core Guarantees

1. **Markdown-preserving** - Removing `{...}` yields valid Markdown
2. **No implicit semantics** - Everything must be explicit
3. **Explicit origin** - All quads come from `{...}` blocks
4. **Single-pass streaming** - No backtracking required
5. **No blank nodes** - Every entity has an IRI
6. **No inference** - No guessing or structural heuristics
7. **Traceable** - Every quad traces to source span

---

## 2. Graph Model

MD-LD creates facts: **Subject → Predicate → Object**

**Building blocks:**
- **IRIs** - Unique identifiers (subjects and objects)
- **Literals** - Data values (objects only)

**Rules:**
- IRIs can be subjects or objects
- Literals are always objects
- Creates a directed labeled multigraph

---

## 3. Available Nodes (S, O, L)

When parsing `{...}`, MD-LD knows:

- **S** - Current subject (IRI, from `{=IRI}` or `{=#fragment}`)
- **O** - Object resource (IRI, from links/images or `{=IRI}`)  
- **L** - Literal value (text from value carrier)

---

## 4. Value Carriers

`{...}` attaches to exactly one value carrier:

### Inline
- `[text] {...}` - Link text
- `*text* {...}`, `_text_ {...}` - Emphasis
- `**text** {...}`, `__text__ {...}` - Strong
- `` `text` {...}`` - Code

### Block
- `# Heading {...}` - Heading text
- `- item {...}` - List item text
- `> quote {...}` - Quote text
- ````lang {...}`` - Code block content

### Links/Media
- `<URL> {...}` - URL (IRI)
- `[label](URL) {...}` - Link (text + URL)
- `![alt](URL) {...}` - Image (alt + URL)

**Rule:** `{...}` must immediately follow the carrier.

---

## 5. Semantic Block Attachment

`{...}` blocks attach by:

1. **Nearest preceding value carrier**, OR
2. **Stand alone** - applies to current subject or following list

**Ambiguous attachment = no output**

---

## 6. Subjects

### Full IRI
```
{=IRI}
```
Sets current subject. Persists until changed.

### Fragment
```
{=#fragment}
```
Creates `currentSubjectBase#fragment`. Requires existing subject.

### Soft Object IRI (Temporary)

```
{+iri}
```

Declares a temporary object for use with `?` and `!` predicates, without changing the current subject.

### Soft Fragment (Temporary)

```
{+#fragment}
```

Creates a temporary fragment relative to the current subject base.

**Use cases:**
- `[Related Item] {+ex:related ?schema:isRelatedTo}` - Links to a local fragment
- `[Parent] {+ex:parent !schema:hasPart}` - Reverse relationship
- `[Section] {+#section1 name ?hasPart}` - Object property with fragment

The soft IRI only exists within the current annotation block.

---

## 7. Types

```
.Class
```
Declares type: `S rdf:type schema:Class`

Multiple types allowed: `.Person .Astronaut`

---

## 8. Predicate Forms

| Syntax | Direction | Use |
|--------|-----------|-----|
| `p`    | S → L     | Literal properties |
| `?p`   | S → O     | Object properties |
| `!p`   | O → S     | Reverse properties |

**Emission rule:** Create quad only if all nodes exist and roles are valid.

---

## 9. Literals

Extracted **only** from attached value carrier.

### Datatypes/Languages
```
^^datatypeIRI  # Typed data
@lang          # Language tag
```

Mutually exclusive. Common types: `xsd:string`, `xsd:integer`, `xsd:gYear`, `xsd:date`, `xsd:boolean`.

---

## 10. Object Resources

Available from:
- Link URLs: `[text](URL)`
- Image URLs: `![alt](URL)`  
- Explicit IRIs: `{=IRI}`

**Example:**
```md
## References {=ex:references}
[Example image](https://example.com/image.jpg) {?image name}
[W3C RDF](https://www.w3.org/RDF) {?dct:references name}
[Alice] {=urn:person:alice ?author name}
```

**Result:**
```turtle
ex:references schema:image <https://example.com/image.jpg> .
<https://example.com/image.jpg> schema:name "Example image" .
ex:references dct:references <https://www.w3.org/RDF> .
<https://www.w3.org/RDF> schema:name "W3C RDF" .
ex:references schema:author <urn:person:alice> .
<urn:person:alice> schema:name "Alice" .
```

---

## 11. Lists

### List Context
`{...}` immediately before list applies to **all items** at same indentation level.

**Unordered lists** (explicit subjects):
```md
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

## Research Team {=prj:team .Container label}
Team members: {?member .Person label}
- Lead researcher {=prj:lead}
- Data analyst {=prj:analyst}
```

**Ordered lists** (auto-generated `rdf:List`):
```md
## Status Values {=ex:statusValues}
Status values: {?ex:in .ex:StatusType label}
1. Active {=ex:Active}
2. Pending {=ex:Pending}
3. Inactive {=ex:Inactive}
```

### Nested Lists
Each indentation level = new semantic scope. No inheritance across levels.

**Example:**
```md
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

## Analysis Project {=prj:project .Project label}
Analysis steps: {?member .Container label}
- Sample preparation {=prj:step1 .Task label}
  Sub-tasks: {?member .Container label}
  - Weigh sample {=prj:step1-1 .Task label}
  - Mix reagents {=prj:step1-2 .Task label}
- Data collection {=prj:step2 .Task label}
  Sub-tasks: {?member .Container label}
  - Run analysis {=prj:step2-1 .Task label}
  - Record results {=prj:step2-2 .Task label}
```

---

## 12. Reverse Relationships

`!p` flips direction only, not meaning.

**Example:**
```md
Used in: {!hasPart}
- Bread {=ex:bread}
```
Creates: `ex:bread schema:hasPart S`

---

## 13. Code Blocks

`{...}` on opening fence makes code block a value carrier.

**Example:**
```md
```js {=ex:code .SoftwareSourceCode text}
console.log("hi")
```
```

**Result:**
```turtle
ex:code a schema:SoftwareSourceCode ;
  schema:text "console.log(\"hi\")" .
```

---

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

### Prefix Declaration
```
[prefix] <IRI>
```

### Prefix Folding: Hierarchical IRI Authoring

Build namespace hierarchies by referencing previously declared prefixes:

```
[my] <tag:mymail@domain.com,2026:>
[j] <my:journal:>
[p] <my:property:>
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
```

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- References are resolved immediately during declaration
- Circular references are treated as literal strings
- Later declarations override earlier ones

### Vocabulary Setting
```
[@vocab] <IRI>
```

**Rules:** Apply forward, later overrides earlier, single-pass resolution.

---

## 15. Forbidden Constructs

- Implicit labels
- Structural inference  
- Auto-subjects
- Literal lists
- Blank nodes
- key=value syntax
- Predicate guessing
- Backtracking parses
- CURIE in Markdown links

These ensure predictability, traceability, and single-pass processing.

---

## 16. Conformance

A conformant MD-LD processor must:

1. Follow predicate routing rules (§8)
2. Emit quads only from `{...}` blocks
3. Implement single-pass streaming parsing
4. Provide deterministic output
5. Maintain traceable origins
6. Support all three predicate forms (`p`, `?p`, `!p`)

No guessing, no blank nodes, no backtracking. Round-trip MD → RDF → MD preserves quads and origins.
