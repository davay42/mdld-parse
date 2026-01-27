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
**Links**: `[label](url)` `![image](url)` `http://url`

```md
[*Important*] {emphasis} mission using **Saturn V** {rocket} rocket.
> Longer text description. {quote}
[Photo](moon.jpg) {?image .Image name}
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

## Nested Lists

```md
## Recipe {=ex:recipe .Recipe name}
Ingredients: {?hasPart .Ingredient name}
- Flour {=ex:flour}
  Types: {?hasPart .FlourType name}
  - Whole wheat {=ex:flour-whole .WholeGrain name}
  - White {=ex:flour-white .White name}
- Water {=ex:water}
```

## List Context

```md
Crew members: {?crew .Person name}
- Neil Armstrong {=ex:neil}
- Buzz Aldrin {=ex:buzz}
- Michael Collins {=ex:michael}
```

## Temporary Objects

```md
[Related] {+ex:related ?schema:isRelatedTo .Entity name}
[Parent] {+ex:parent !schema:hasPart .Organization name}
[Section] {+#subsection name ?hasPart}
```

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

```md
# Domain authority
[my] <tag:mymail@domain.com,2026:>

# Hierarchical prefixes
[j] <my:journal:>
[p] <my:property:>
[c] <my:class:>

# Multi-level nesting
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
[dev] <emp:developer/>
```

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
