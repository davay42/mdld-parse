# MDLD Match Examples

## 1. Document inventory

What kinds of things are in this document?

```md
[ex] <http://example.org/>
[schema] <http://schema.org/>

{=* .*}

[Jane] {=ex:jane .prov:Person ex:name}
```

Matches every type assertion from this point forward.
Result: every `(subject, rdf:type, class)` triple in the document.
One pattern, complete type index, zero post-processing.

---

## 2. Entity profile

Extract everything known about one entity.

```md
[ex] <http://example.org/>

## Alice {=ex:alice}

[*] {+* .* ?* !*  *}

[Jane] {=ex:jane .prov:Person ex:name}
[Alice] {=ex:alice .prov:Person ?ex:daughterOf !ex:hasDaughter ex:name}
```
Alice's complete description — every predicate
and every value — in one pass.

## 3. Relationship map

Who knows whom in this document?

```md
[ex] <http://example.org/>

[Who] {=*} knows [who] {?ex:knows +*}? 

## People {=ex:people}

[Jane] {=ex:jane .prov:Person ex:name} knows [Alice] {=ex:alice .prov:Person ?ex:knows !ex:knows ex:name}
```


## 4. Reverse lookup

Find who knows a specific person.

```md
[ex] <http://example.org/>

## Match

[Who] {=ex:*} knows [Bob] {?ex:knows +ex:bob}? 

## Data

[Bob] {=ex:bob .prov:Person ex:name} and [Alice] {=ex:alice .prov:Person ?ex:knows !ex:knows ex:name} know each other.
```

Subject is `ex:*`, predicate is `ex:knows`, object is ground `ex:bob`.
Returns all subjects that have a `knows` edge to Bob.
Classic reverse lookup, no index needed, O(n) over the document.

---

## 6. Multi-predicate extraction

Collect names from two different vocabularies.

```md
[schema] <http://schema.org/>
[foaf] <http://xmlns.com/foaf/0.1/>

[*] {=* schema:name}
[*] {=* foaf:name}
```

Two independent patterns, same callback intent. Both collect literal name
values from any subject. Register the same handler for both. OR semantics
without OR syntax.

---

## 7. Match-and-render workflow

An agent reads a large MDLD document and needs a compact summary.

```js
const result = parse(largeDocument)

// Register interest patterns before the document body:
// {=* .*}          — type index
// [*] {=* schema:name}       — all names
// [*] {=* schema:description} — all descriptions

const summary = renderMatches(result.matches, result.context)
```

The summary is a valid MDLD document containing only the matched triples,
each with its original prose carrier text. The agent receives a document
that is both human-readable and semantically annotated — ready to parse
again if needed, ready to read directly, ready to pass to another agent.

**Input (large document, many triples):**

```md
# Research Project {=my:project .ex:Project schema:name}

A long document with many sections, extensive background...

## Team {=my:team}

**Dr. Sarah Chen** {+my:sarah .foaf:Person ?foaf:member schema:name}
is the principal investigator...

[hundreds more lines]
```

**Output summary (matched triples only):**

```md
[ex] <http://example.org/>
[schema] <http://schema.org/>
[my] <tag:research@example.com,2026:>
[foaf] <http://xmlns.com/foaf/0.1/>

# Research Project {=my:project .ex:Project schema:name}

## Dr. Sarah Chen {=my:sarah .foaf:Person schema:name}
```

Six triples. Valid MDLD. Parseable. Human-readable.
The prefix declarations come from `result.context`.
The prose comes from `origin.value`.
The annotations are reconstructed from the quad's subject, predicate, object.

---

## 8. What patterns cannot do

```md
# Things that need SPARQL instead

## Join: people who know someone named Alice

This needs two triple patterns sharing a variable:
  ?x ex:knows ?y .
  ?y schema:name "Alice" .

The match system sees one triple at a time. Use result.quads + SPARQL.

## Negation: projects without a status

  ex:project NOT having ex:status
  
Absence is unknowable mid-stream. Full quad set + SPARQL MINUS.

## Count: how many people are in the document

  COUNT(?x WHERE { ?x rdf:type ex:Person })

The parser can accumulate a count internally but only emits it post-parse.
Read result.matches[n].results.length after parsing.
```