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

### Unordered Lists
```md
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

## Analysis Project {=prj:project .Project label}
Analysis steps: {?member .prj:Task label}
- Sample preparation {=prj:step1}
  Sub-tasks: {?member .prj.Task label}
  - Weigh sample {=prj:step1-1}
  - Mix reagents {=prj:step1-2}
- Data collection {=prj:step2}
  Sub-tasks: {?member .Task label}
  - Run analysis {=prj:step2-1}
  - Record results {=prj:step2-2}
```

### Ordered Lists (Auto-generated `rdf:List`)
```md
## Status Values {=ex:statusValues}
Status values: {?sh:in .ex:StatusType label}
1. Active {=ex:Active .ex:StatusType}
2. Pending {=ex:Pending .ex:StatusType}
3. Inactive {=ex:Inactive .ex:StatusType}
```


## List Item Policy: Single-Value Carriers

**✅ CORRECT**
```md
- Flour {=ex:flour}              # Subject declaration, participates in list
- Walnuts {+ex:walnuts}          # Subject declaration, participates in list
```

**❌ INCORRECT (Excluded from List Context)**
```md
- Whole wheat flour {description} # No subject = excluded
- [*Important* ingredient] {priority}     # No subject = excluded
- Flour {=ex:flour} [extra] {desc}        # Text after annotation = excluded
- Flour {=ex:flour} - description         # Text after annotation = excluded
```

**Rule**: List items must have explicit subject (`{=iri}` or `{+iri}`) to participate in list context. Items without subjects are excluded.

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
