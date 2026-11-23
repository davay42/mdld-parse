# SHACL: Validation and Extraction

A SHACL shape is usually described as a constraint — a filter that says what data is *allowed*. In the MD-LD ecosystem it plays a second, equally important role: it is an **extraction schema**. The same shape that decides whether a record is valid also decides what the record looks like when projected into plain JavaScript.

```
MD-LD text → parse → quads ──► validate()      → violations (what's wrong)
                          └─► extract()    → objects   (what's true)
                          └─► extractGraph()→ quads     (what's permitted)
```

Write the shape once. Get validation, UI-ready objects, and sanitized sub-graphs — no TypeScript interface, no GraphQL schema, no SPARQL query. The shape is the single source of truth for an entity's structure, its integrity, and its serialization.

This document covers `mdld-parse` — a zero-dependency, synchronous SHACL Core validator (~1,450 LOC) that consumes mdld-parse quads directly.

---

## Validation

### Quick start

```js
import { validate, Validator } from 'mdld-parse'
import { parse } from 'mdld-parse'

const { quads } = parse({ text: mdldString })
const report = validate({ quads })        // auto-classifies shapes vs data

console.log(report.conforms)   // true | false
console.log(report.results)    // ValidationResult[]
```

Three ways to feed it:

```js
validate({ quads })                  // mixed graph, auto-classified
validate({ shapes, data })           // pre-separated quad arrays
new Validator(shapeQuads).validate(dataQuads)   // reusable shape cache
```

### What a result looks like

```js
{
  focusNode,                        // the node being validated
  path,                             // property path (property shapes only)
  value,                            // the offending value
  severity,                         // sh:Violation | sh:Warning | sh:Info
  component,                        // e.g. sh:MinCountConstraintComponent
  shape,                            // the shape that produced it
  message                           // sh:message with {$value}/{$path}/{$focusNode} substituted
}
```

### Coverage

Full SHACL Core surface: all constraint components (value-type, cardinality, range, string, property-pair, logical `not`/`and`/`or`/`xone`, shape-based, `closed`), all target types (`targetClass` with `subClassOf` traversal, `targetNode`, `target`, `targetSubjectsOf`, `targetObjectsOf`), all seven property-path types — expressed as IRIs, so MD-LD needs no blank nodes — qualified counts, `sh:message`/`sh:severity`/`sh:deactivated`. SHACL-JS (`sh:js`) is opt-in via `allowJS: true`, off by default.

Out of scope by design: SHACL-SPARQL, SHACL-AF, external JS libraries. See `shapes/README.md` for the honest-limitations list.

---

## Extraction

Validation answers "is this record allowed?" Extraction answers "what does this record look like through the schema?" — and, crucially, **only the parts that validate**.

### `extract` — the UI lens

```js
import { extract } from 'mdld-parse'

const people = extract({ quads }, 'tag:ex,2026:PersonShape')
// → [{ name: "Alice", age: 30, address: { city: "Paris" }, tags: ["a", "b"] }]
```

For each extractable property the shape declares, `extract` resolves `sh:path` values and emits a key:

- **Key** — `sh:name` if present, else the predicate's local name
- **Literal casting** — `xsd:integer`/`decimal`/etc. → `Number`, `xsd:boolean` → `boolean`, `xsd:date`/`dateTime` → `Date`, everything else → `string`
- **Nesting** — `sh:node` and `sh:qualifiedValueShape` recurse into nested POJOs; RDF lists (`rdf:first`/`rdf:rest`) become arrays; bare IRIs project to their IRI string
- **Multi-value** — one value → scalar, several → array (`arrays: true` forces arrays)

#### Conformance-gated output

Extraction is **two-tier conformance-gated** — this is what makes "if it extracts, it works" literal:

1. **Node-level** — `sh:closed`, `sh:not`, node-level `sh:and`/`or`/`xone`, etc. gate *whole records*. A record that fails is excluded entirely.
2. **Property-level** — each field is emitted only if its values pass the property shape. Offending fields are omitted; records left with nothing conforming are dropped.

```js
// ProductShape declares name/price/category; InvalidProduct2 has price = -10
extract({ quads }, 'tag:ex,ProductShape')
// InvalidProduct2 appears WITHOUT "price" — the key's absence is the violation
```

Every key in the output is a validated fact. `sh:js` guards don't execute during projection (`allowJS` stays off), so js-guarded fields are kept.

`extract` accepts `{ quads }`, `{ shapes, data }`, or a raw `Quad[]`; omitting `shapeIRI` uses the first non-deactivated NodeShape. Options: `byNode: true` returns `{ focusValue: pojo }`, `maxDepth` bounds `sh:node` recursion (cycles degrade to the bare IRI).

### `extractGraph` — the RDF lens

```js
const sub = extractGraph({ quads }, 'tag:ex,PersonShape')
// → Quad[] containing only what the shape permits
```

For each targeted node it keeps quads whose predicate is declared by a property path (plus `rdf:type`), recurses into nested entities via `sh:node`, `sh:qualifiedValueShape`, or `sh:targetClass` on the object's type, and emits RDF list chains whole. Use it to sanitize a graph before handing it to an agent, caching a response, or scoping an API payload.

---

## The self-validating catalog

`shapes/` doesn't just ship the validator — it ships its own proof. `catalog.md` holds 32 executable `cat:Demo` worlds, each a small-business story that is simultaneously documentation, test fixture, and expected output:

```markdown
### Product Demo {=cat:demo/product .cat:Demo ?cat:hasDemo}
Expects `4` {cat:expectedViolations ^^xsd:integer} violations (...)
~~~~~~md {cat:demo}
  ... MD-LD world: shapes + data ...
~~~~~~

~~~~~~json {cat:extractedPOJO}
{
    "ex:ProductShape": {
        "ex:Laptop": { "name": "MacBook Pro", "price": 1299.99, ... }
    }
}
~~~~~~
```

`selftest.js` closes five loops plus two machinery guards in one command:

1. **Coverage** — every `sh:` property in `ontology.md` (the W3C vocabulary, ground truth) is accounted for in the catalog
2. **Sync** — every term the catalog presents as covered exists in `SUPPORTED_VOCABULARY`
3. **Demos** — every `cat:demo` source re-parses and validates to `cat:expectedViolations`
4. **Extraction** — every demo's `cat:extractedPOJO` block deep-equals live `extract` output
5. **Self** — the catalog's own SHACL shapes conform against the catalog graph

Plus: a procedural **projection** check on hand-built quads, and a **document round-trip** guard (`parse → generate → parse` is quad-identical — the catalog is canonical MD-LD).

```bash
node shapes/selftest.js
# 32/32 demos, 32/32 extractions verified, 0 self-violations, 101/101 terms
```

`gen-extracted.js` regenerates the `cat:extractedPOJO` blocks whenever demos change — the expected JSON is `{ shapeShortIRI → focusShortIRI → pojo }` with IRIs shortened by each demo's own `[ex]` prefix.

---

## Performance

Extraction costs ≈1.3–1.4× `validate()` on the same graph — the conformance gate reuses the validator, constraint-free shapes skip the gate entirely, and per-shape metadata compiles once into a cached projection plan. Measured on Apple Silicon (4-property Person shape, nested `sh:node` + RDF list):

| Entities | Quads | validate | extract |
|---|---|---|---|
| 1,000 | 11K | 50ms | 62ms |
| 10,000 | 110K | 448ms | 631ms |
| 25,000 | 275K | 1.1s | 1.6s |

Linear, ~15K entities/sec. Comfortable to ~25K entities per call — the right envelope for personal and small-business knowledge graphs. The next scale step is an indexed `Store`, which would lift the whole validator, not just extraction.

---

## The shape is the contract

The deeper point: MD-LD already treats text as the source of truth. SHACL completes the triangle — the same artifact that *describes* an entity also *constrains* it and *projects* it. No schema registry, no ORM layer, no serialization boilerplate. Write the shape once; validation catches what's wrong, extraction emits what's true, and the catalog proves both — every commit.
