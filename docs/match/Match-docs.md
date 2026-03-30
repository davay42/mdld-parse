# MDLD Match

Pattern matching lets you extract specific triples from an MDLD document
as it parses. Write `*` in any position of an annotation and that
annotation becomes a filter instead of an assertion.

## The short version

```md
[ex] <http://example.org/>

## Alice {=ex:alice .ex:Person ex:name}

She knows several people.

[Who] {?ex:knows +*} are those people?
```

The last line is a match pattern. It produces no quads. Instead it
collects every `(ex:alice, ex:knows, ?)` triple emitted after it —
including the ones that will appear later in this document — and
returns them in `result.matches`.

## Writing patterns

Patterns look like normal annotations. Replace any term with `*`:

```md
All [types] {=* .*}  
All [Alice] {=ex:alice} outgoing [edges] {?* +*} 
All literal names: [*] {=* ex:name}
[Alice] {=ex:alice} knows [who] {?ex:knows +*}?
[Who] {=*} knows [Bob] {?* +ex:bob}?
[Alice] {=ex:alice} is known by [whom] {!ex:knows +*}?
What connects [Alice] {=ex:alice} and [Bob] {?* +ex:bob}?
```

## Subject inheritance

Patterns inherit the current subject like any other annotation:

```md
## Alice {=ex:alice .ex:Person ex:name}

[who] {?ex:knows +*}              # matches (ex:alice, ex:knows, ?)
[*] {ex:email}              # matches (ex:alice, ex:email, ?)
```

Use `{=*}` to explicitly wildcard the subject and match any entity:

```md
{=* .ex:Person}   # match any subject typed as :Person
```

## Scope

Patterns apply forward only — they match triples emitted after the
pattern declaration. A pattern at the top of a document covers everything.
A pattern mid-document covers only the section below it.

This is intentional. It means you can scope a pattern to a section:

```md
# Project Status

[every] {=*} [status] {?ex:status +*}    ← matches only triples in this section and below

## Task A {=ex:taskA }
[done] {?ex:status +ex:done}
## Task B {=ex:taskB }
[progress] {?ex:status +ex:inProgress}
```

## Reading results

```js
import { parse } from './parse.js'

const result = parse(mdldText)

for (const { pattern, results } of result.matches) {
  console.log('Pattern:', pattern)
  for (const { quad, origin } of results) {
    console.log(quad.subject.value, quad.predicate.value, quad.object.value)
    console.log('From:', origin.value, 'in', origin.carrierType)
  }
}
```

Each result carries the matched quad and its origin — the prose text
and block type that the triple came from.

## Rendering results as MDLD

Matched results are valid quads with full origin context. They can be
rendered back to MDLD to produce a focused subgraph document:

```js
import { generate } from './generate.js'

const summary = generate(result.matches, result.context)
// Returns a valid MDLD string covering only the matched triples,
// with the original prose context preserved.
```

The rendered document is itself parseable — re-parsing it produces
the same triples that matched. No information is lost.

## Limitations

Patterns see each triple once, in document order. They cannot:

- Match triples that appear **before** the pattern declaration
- Express joins across multiple subjects
- Test for the **absence** of a triple
- Produce aggregated counts as match output
- Follow property paths (transitive closure)

For these, use SPARQL over `result.quads` after parsing.