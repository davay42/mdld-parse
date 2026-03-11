# MD-LD Syntax Guide

Add semantic annotations to Markdown using `{...}` blocks.

## Basic Annotation

```md
# Apollo 11 {=wd:Q43653 .SpaceMission}
Launched in [1969] {launchYear ^^xsd:gYear} with crew {?crew .Person name}.
```

## Value Carriers

**Inline**: `[text]` `*text*` `**text**` `_text_` `__text__` `` `text` ``
**Block**: `# Heading` `- list item` `> blockquote`
**Links**: `[label](url)` `![image](url)` `<url>`

```md
[*Important*] {mission:status} mission using **Saturn V** {mission:rocket} rocket.
> Longer text description. {quote}
[Photo of the moon](moon.jpg) {?image .Image label}
<https://nasa.gov> {?website .Organization}
```

## Subject Chaining

```md
# Document {=ex:doc}
## Section 1 {=#section1}
[Content] {name}

## Section 2 {=#section2}  
[More content] {name}
```

Creates: `ex:doc#section1`, `ex:doc#section2`

## Predicate Forms

| Syntax | Direction | Example |
|--------|-----------|---------|
| `p`     | S → L     | `[1969] {year}` |
| `?p`    | S → O     | `[NASA] {?operator}` |
| `!p`    | O → S     | `[Mission] {!hasPart}` |

## Lists

Lists are pure Markdown structure with **no semantic scope**. Each list item requires explicit annotations.

```md
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

## Analysis Project {=prj:project .Project label}
Analysis steps:

- **Sample preparation** {+prj:step1 ?member .prj:Task label}
- **Data collection** {+prj:step2 ?member .prj:Task label}
```

**Key Rules:**
- No semantic propagation from list scope
- Each item must have explicit annotations
- Use `+IRI` to maintain subject chaining for repeated object properties
- Nested lists have no inheritance

## List Item Requirements

**✅ CORRECT**
```md
- **Flour** {=ex:flour}              # Subject declaration
- **Walnuts** {+ex:walnuts}          # Subject chaining
```


**Rule**: List items must have explicit subject (`{=iri}` or `{+iri}`) to emit semantics.

## Temporary Objects

```md
[Related] {+ex:related ?schema:isRelatedTo .Entity name}
[Parent] {+ex:parent !schema:hasPart .Organization name}
[Section] {+#subsection name ?hasPart}
```

**Soft Object IRI (`{+iri}`)** - Temporary object for `?` and `!` predicates without changing current subject

**Soft Fragment (`{+#fragment}`)** - Temporary fragment relative to current subject base

The soft IRI only exists within the current annotation block.

## Literals

```md
[1969] {year ^^xsd:gYear}
[July] {month @en}
[Juillet] {month @fr}
[5.2] {rating ^^xsd:decimal}
```

## Code Blocks

```md
```js {=ex:code .SoftwareSourceCode text}
console.log("hello")
```
```

## Context

```md
[ex] <http://example.org/>
[wd] <https://www.wikidata.org/entity/>
[@vocab] <http://schema.org/>
```

## Prefix Folding

Build namespace hierarchies by referencing previously declared prefixes:

```md
# Domain authority
[my] <tag:mymail@domain.com,2026:>

# Hierarchical prefixes
[j] <my:journal:>
[p] <my:property:>
[c] <my:class:>
[person] <my:people:>

# Multi-level nesting
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
[dev] <emp:developer/>
```

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- Circular references are treated as literal strings
- Later declarations override earlier ones

**Examples:**
- `j:2026-01-27` → `tag:mymail@domain.com,2026:journal:2026-01-27`
- `emp:harry` → `https://org.example.com/person/employee/harry`
- `dev:john` → `https://org.example.com/person/employee/developer/john`

## Quick Reference

- `{=IRI}` - Set subject
- `{=#frag}` - Fragment subject  
- `{+IRI}` - Temporary object
- `.Class` - Type declaration
- `p` - Literal predicate
- `?p` - Object predicate  
- `!p` - Reverse predicate
- `^^type` - Datatype
- `@lang` - Language
