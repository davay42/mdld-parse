# mdld-shapes — Specification

> **A zero-dependency SHACL Core validator for the MD-LD ecosystem.**
> Compact, readable, W3C-compliant. Ships alongside `mdld-parse` as core semantic infrastructure.

## 1. Philosophy

mdld-shapes exists to validate RDF data against SHACL shapes using the same principles as mdld-parse:

- **Zero dependencies** — Pure JavaScript. No rdf-ext, no grapoi, no clownface, no lodash.
- **Compact** — ~1,500 LOC total. Every line earns its place.
- **Readable** — A developer should understand the full validator in one sitting.
- **Specialized** — Built for mdld-parse's DataFactory and quads. Not a general-purpose RDF library.
- **Deterministic** — Same shapes + data → same report, always.
- **Sync** — SHACL Core validation is pure graph traversal. No I/O. No async.

The validator does one thing: given shapes and data (as RDF/JS quads), produce a validation report. It does this by walking the graph with `match()` calls, evaluating constraint functions, and collecting results. That's it.

## 2. Scope

### In Scope: SHACL Core (W3C REC-shacl-20170720 + 1.2 Core WD)

| Category | Components |
|----------|-----------|
| Value Type | `sh:class`, `sh:datatype`, `sh:nodeKind` |
| Cardinality | `sh:minCount`, `sh:maxCount` |
| Value Range | `sh:minExclusive`, `sh:maxExclusive`, `sh:minInclusive`, `sh:maxInclusive` |
| String-based | `sh:minLength`, `sh:maxLength`, `sh:pattern`, `sh:flags`, `sh:languageIn`, `sh:uniqueLang` |
| Property Pair | `sh:equals`, `sh:disjoint`, `sh:lessThan`, `sh:lessThanOrEquals` |
| Logical | `sh:not`, `sh:and`, `sh:or`, `sh:xone` |
| Shape-based | `sh:node`, `sh:property`, `sh:qualifiedValueShape`, `sh:qualifiedMinCount`, `sh:qualifiedMaxCount` |
| Other | `sh:closed`, `sh:ignoredProperties`, `sh:hasValue`, `sh:in` |
| Property Paths | Predicate, Inverse, Sequence, Alternative, ZeroOrMore, OneOrMore, ZeroOrOne |
| Targets | `sh:targetClass`, `sh:targetNode`, `sh:targetSubjectsOf`, `sh:targetObjectsOf`, implicit class |

### Out of Scope

- **SHACL-SPARQL** — `sh:sparql`, `sh:targetWhere`, SPARQL-based constraints. Requires a SPARQL engine.
- **SHACL-JS** — `sh:js`, JavaScript function constraints. Security-sensitive, not needed for MD-LD.
- **SHACL-AF** — Advanced Features: rules, inference, functions. Different use case.
- **SHACL-UI** — User interface generation. Orthogonal concern.
- **Entailment regimes** — RDFS/OWL reasoning over data or shapes. SHACL Core defines `sh:subClassOf` traversal for `sh:class` but not full RDFS entailment.

### Rationale

MD-LD documents describe knowledge graphs declaratively. The validation use case is: "does this data conform to these structural constraints?" This is exactly SHACL Core. SPARQL/JS/AF add complexity without serving the primary use case. If needed later, they can be added as separate packages that depend on mdld-shapes.

## 3. Integration with mdld-parse

### DataFactory

mdld-shapes uses mdld-parse's `DataFactory` by default. All terms in the validation report are created with this factory. Users can supply a different factory, but the terms in shapes/data must be compatible (same term `.equals()` semantics).

```js
import { DataFactory } from 'mdld-parse'
// DataFactory is the default — no need to pass it explicitly
```

### Quad Input

The validator accepts quads as:
1. **Plain arrays** — `Quad[]` (simplest, most common with mdld-parse)
2. **DatasetCore** — any object implementing `{ add, delete, has, match, [Symbol.iterator], size }`

Internally, arrays are wrapped in a minimal `Store` (see §4). DatasetCore objects are used directly.

### Shape/Data Separation

mdld-parse produces a flat array of quads. Some are shapes (SHACL vocabulary), some are data (instance data), some are list structure (`rdf:first`/`rdf:rest`). The validator includes a built-in **shape detector** that classifies quads automatically:

```js
import { validate } from 'mdld-shapes'

// Pass all quads together — the detector separates them
const report = validate({ quads: allQuads })
```

The detector uses a two-pass algorithm:
1. **Pass 1**: Identify shape subjects via `rdf:type sh:NodeShape/PropertyShape`, `sh:target*` predicates, and any `sh:*` predicate.
2. **Pass 2**: Follow blank node chains (`rdf:first`/`rdf:rest`) from known shape subjects to include list structure quads.

Users can supply a custom classifier:

```js
const report = validate({
  quads: allQuads,
  classify: (quad) => quad.predicate.value.startsWith('http://www.w3.org/ns/shacl#')
})
```

## 4. Internal Data Model

### Store

A minimal RDF/JS DatasetCore implementation. ~80 LOC.

```js
class Store {
  constructor(quads = []) { /* Set<Quad> */ }
  get size() { /* number */ }
  add(quad) { /* this */ }
  delete(quad) { /* this */ }
  has(quad) { /* boolean */ }
  match(s, p, o, g) { /* Store — filtered quads */ }
  [Symbol.iterator]() { /* Iterator<Quad> */ }
}
```

Term equality uses `.equals()` if available, otherwise `termType + value` comparison. This matches mdld-parse's DataFactory output.

### Graph Helpers

Thin wrappers over `match()` for common patterns:

```js
// Get all objects of (subject, predicate, ?) in dataset
function valuesOf(dataset, subject, predicate) → Term[]

// Read an RDF list (rdf:first/rdf:rest chain) starting at head
function readList(dataset, head) → Term[]

// Get all subjects that have rdf:type = class (including rdfs:subClassOf chain)
function instancesOf(dataset, classIRI) → Term[]

// Resolve a SHACL property path from a focus node
function resolvePath(dataset, focusNode, path) → Term[]
```

### RDF Lists

Lists are read into plain arrays. No iterator protocol, no graph-pointer abstraction.

```js
function readList(dataset, head) {
  const items = []
  const visited = new Set()
  let current = head

  while (current && !equals(current, RDF.nil)) {
    if (visited.has(termKey(current))) throw new Error(`Circular list at ${current.value}`)
    visited.add(termKey(current))

    const [first] = valuesOf(dataset, current, RDF.first)
    const [rest] = valuesOf(dataset, current, RDF.rest)
    if (!first || !rest) throw new Error(`Malformed list at ${current.value}`)

    items.push(first)
    current = rest
  }
  return items
}
```

This is the function that fixes the `ptr.list is not a function` bug. It's 15 lines of direct graph traversal.

## 5. Public API

### `validate(options)`

One-shot validation. Returns a report.

```js
import { validate } from 'mdld-shapes'

const report = validate({
  // Input (choose one):
  quads: Quad[],           // All quads — auto-classified into shapes + data
  // OR:
  shapes: Quad[],          // Shape quads only
  data: Quad[],            // Data quads only

  // Options:
  factory: DataFactory,    // RDF/JS factory (default: mdld-parse DataFactory)
  classify: Function,      // Custom quad classifier (default: built-in detector)
})

// report = {
//   conforms: boolean,
//   results: ValidationResult[]
// }
```

### `Validator` class

For repeated validation against the same shapes.

```js
import { Validator } from 'mdld-shapes'

const v = new Validator(shapesQuads, { factory })
const report1 = v.validate(dataQuads1)
const report2 = v.validate(dataQuads2)
```

The constructor parses shapes once (resolves targets, compiles constraints). Each `validate()` call runs the constraints against new data.

### `ValidationResult`

```js
{
  focusNode: Term,                    // The node being validated
  path: Term | Path | null,          // Property path (for property shapes)
  value: Term | null,                // The offending value (if any)
  severity: Term,                    // sh:Violation | sh:Warning | sh:Info
  sourceConstraintComponent: Term,   // e.g., sh:MinCountConstraintComponent
  sourceShape: Term,                 // The shape that produced this result
  message: string | null,            // Human-readable message (from sh:message or generated)
}
```

### `createShapeDetector()`

Exported for users who want to classify quads themselves.

```js
import { createShapeDetector } from 'mdld-shapes'

const detector = createShapeDetector()
const isShape = detector.classify(quad)  // boolean
const stats = detector.getStats()        // { shapeSubjects, listNodes, shapeReferences }
detector.reset()                         // Clear state for new session
```

## 6. Shape Detection

The built-in detector classifies quads as "shape" or "data" using these rules (evaluated in order):

1. **Type declarations**: `?s rdf:type sh:NodeShape` or `sh:PropertyShape` → `s` is a shape subject.
2. **SHACL predicates**: Any triple with predicate in `http://www.w3.org/ns/shacl#` → subject is shape-related. Track referenced objects (blank nodes, shape IRIs).
3. **Known shape subjects**: If subject is already identified as a shape, the quad is a shape quad.
4. **List structure**: `rdf:first`/`rdf:rest` triples where the subject is a known shape node or list node → include as shape. Follow the chain transitively.
5. **List types**: `?s rdf:type rdf:List` where `s` is referenced by a SHACL predicate → include.

The detector maintains three sets during classification:
- `shapeSubjects` — Nodes declared as shapes (Rule 1, 2)
- `shapeReferences` — Objects referenced by SHACL predicates (Rule 2)
- `listNodes` — Blank nodes in RDF list chains connected to shapes (Rule 4)

## 7. Target Resolution

Before validating, the engine resolves which data nodes each shape applies to.

### Target Types

| Target | Semantics |
|--------|-----------|
| `sh:targetClass C` | All instances of C (and its SHACL subclasses via `rdfs:subClassOf` chains) |
| `sh:targetNode N` | The specific node N |
| `sh:targetSubjectsOf P` | All subjects that have a value for property P |
| `sh:targetObjectsOf P` | All objects that are values of property P |
| Implicit class | If shape S has `rdf:type sh:NodeShape` and `sh:targetClass C`, then C is the implicit class target |

### Resolution Algorithm

```js
function resolveTargets(dataset, shape) {
  const targets = new Set()

  // sh:targetClass
  for (const cls of valuesOf(shapesDataset, shape, SH.targetClass)) {
    for (const instance of instancesOf(dataset, cls)) {
      targets.add(instance)
    }
  }

  // sh:targetNode
  for (const node of valuesOf(shapesDataset, shape, SH.targetNode)) {
    targets.add(node)
  }

  // sh:targetSubjectsOf
  for (const pred of valuesOf(shapesDataset, shape, SH.targetSubjectsOf)) {
    for (const quad of dataset.match(null, pred, null)) {
      targets.add(quad.subject)
    }
  }

  // sh:targetObjectsOf
  for (const pred of valuesOf(shapesDataset, shape, SH.targetObjectsOf)) {
    for (const quad of dataset.match(null, pred, null)) {
      targets.add(quad.object)
    }
  }

  return [...targets]
}
```

### SHACL Subclass Traversal

`instancesOf(dataset, classIRI)` returns all nodes with `rdf:type` equal to `classIRI` or any of its SHACL superclasses. Superclasses are found by following `rdfs:subClassOf` chains in the **data** dataset (SHACL 1.2 §1.1 terminology).

```js
function instancesOf(dataset, classIRI) {
  // Build superclass set via rdfs:subClassOf chains
  const superclasses = new Set([termKey(classIRI)])
  let changed = true
  while (changed) {
    changed = false
    for (const quad of dataset.match(null, RDFS.subClassOf, null)) {
      if (superclasses.has(termKey(quad.subject)) && !superclasses.has(termKey(quad.object))) {
        superclasses.add(termKey(quad.object))
        changed = true
      }
    }
  }

  // Find all instances
  const instances = []
  for (const quad of dataset.match(null, RDF.type, null)) {
    if (superclasses.has(termKey(quad.object))) {
      instances.push(quad.subject)
    }
  }
  return instances
}
```

## 8. Constraint Components

Each constraint is a pure function: `(dataset, focusNode, valueNode, params, ctx) → ValidationResult[]`

### 8.1 Value Type Constraints

**sh:class** — Value must be an instance of the given class (or its subclasses).

```js
function classConstraint(dataset, focus, value, params) {
  const cls = params.class
  const types = valuesOf(dataset, value, RDF.type)
  const isInstance = types.some(t => isSubclassOf(dataset, t, cls))
  return isInstance ? [] : [violation(focus, SH.ClassConstraintComponent, value)]
}
```

**sh:datatype** — Literal value must have the given datatype.

```js
function datatypeConstraint(dataset, focus, value, params) {
  if (value.termType !== 'Literal') return [violation(focus, SH.DatatypeConstraintComponent, value)]
  return value.datatype.value === params.datatype.value ? [] : [violation(...)]
}
```

**sh:nodeKind** — Value must be of the given node kind (`sh:IRI`, `sh:BlankNode`, `sh:Literal`, `sh:BlankNodeOrIRI`, `sh:BlankNodeOrLiteral`, `sh:IRIOrLiteral`).

### 8.2 Cardinality Constraints

**sh:minCount** / **sh:maxCount** — Applied to the *values* of a property shape (all values at once, not per-value).

```js
function minCountConstraint(dataset, focus, values, params) {
  return values.length >= params.minCount ? [] : [violation(focus, SH.MinCountConstraintComponent, null, { minCount: params.minCount, actual: values.length })]
}
```

### 8.3 Value Range Constraints

**sh:minInclusive**, **sh:maxInclusive**, **sh:minExclusive**, **sh:maxExclusive** — Compare value against a boundary using XSD ordering.

Comparison logic:
- If both values are numeric literals (integer, decimal, float, double), compare as JS numbers.
- If both are `xsd:date` or `xsd:dateTime`, compare as JS Dates.
- If both are strings, compare lexicographically.
- Otherwise, the constraint is not applicable (no violation).

### 8.4 String-based Constraints

**sh:minLength** / **sh:maxLength** — String length of the value's lexical form.

**sh:pattern** (+ optional **sh:flags**) — JavaScript `RegExp` test against the value's lexical form.

**sh:languageIn** — Literal's language tag must be in the given list (case-insensitive prefix match per SHACL spec: `"en"` matches `"en"`, `"en-US"`, etc.).

**sh:uniqueLang** — No two values of the property may have the same language tag.

### 8.5 Property Pair Constraints

**sh:equals** — The set of values for this property must equal the set of values for the other property.

**sh:disjoint** — No overlap between values of this property and the other.

**sh:lessThan** / **sh:lessThanOrEquals** — Every value of this property must be less than (or equal to) every value of the other property.

### 8.6 Logical Constraints

**sh:not** — Value must NOT conform to the given shape.

```js
function notConstraint(dataset, focus, value, params, ctx) {
  const innerReport = validateNode(dataset, params.shape, value, ctx)
  return innerReport.conforms
    ? [violation(focus, SH.NotConstraintComponent, value)]
    : []
}
```

**sh:and** — Value must conform to ALL shapes in the RDF list.

```js
function andConstraint(dataset, focus, value, params, ctx) {
  const shapes = readList(shapesDataset, params.and)
  const allConform = shapes.every(shape => validateNode(dataset, shape, value, ctx).conforms)
  return allConform ? [] : [violation(focus, SH.AndConstraintComponent, value)]
}
```

**sh:or** — Value must conform to at least one shape in the RDF list.

**sh:xone** — Value must conform to exactly one shape in the RDF list.

### 8.7 Shape-based Constraints

**sh:node** — Value must conform to the given shape (recursive validation).

**sh:property** — Nested property shape. For each value of the property shape's path, validate against the nested property shape.

**sh:qualifiedValueShape** + **sh:qualifiedMinCount** + **sh:qualifiedMaxCount** — At least N (and at most M) values must conform to the given shape.

**sh:closed** + **sh:ignoredProperties** — The focus node must not have any properties other than those declared in `sh:property` constraints on this shape, plus the ignored properties. Default ignored: `rdf:type`.

### 8.8 Other Constraints

**sh:hasValue** — The property must have at least one value equal to the given term.

**sh:in** — The value must be a member of the given RDF list.

## 9. Property Paths

SHACL property paths determine which values a property shape operates on.

### Path Types

| Type | Syntax | Resolution |
|------|--------|-----------|
| PredicatePath | `<iri>` | `match(focus, iri, null)` → objects |
| InversePath | `sh:inversePath <iri>` | `match(null, iri, focus)` → subjects |
| SequencePath | `sh:path ( <p1> <p2> )` | Follow p1, then p2 from each result |
| AlternativePath | `sh:path ( <p1> \| <p2> )` | Union of p1 and p2 results |
| ZeroOrMorePath | `sh:zeroOrMorePath <iri>` | Transitive closure (including focus itself) |
| OneOrMorePath | `sh:oneOrMorePath <iri>` | Transitive closure (excluding focus itself) |
| ZeroOrOnePath | `sh:zeroOrOnePath <iri>` | Focus + one step |

### Resolution Algorithm

```js
function resolvePath(dataset, focusNode, path) {
  // Simple predicate
  if (path.termType === 'NamedNode') {
    return valuesOf(dataset, focusNode, path)
  }

  // Complex path (blank node with sh:inversePath, sh:path list, etc.)
  if (path.termType === 'BlankNode') {
    const [inverse] = valuesOf(shapesDataset, path, SH.inversePath)
    if (inverse) return resolveInverse(dataset, focusNode, inverse)

    const [alt] = valuesOf(shapesDataset, path, SH.alternativePath)
    if (alt) return resolveAlternative(dataset, focusNode, readList(shapesDataset, alt))

    const [zeroOrMore] = valuesOf(shapesDataset, path, SH.zeroOrMorePath)
    if (zeroOrMore) return resolveTransitive(dataset, focusNode, zeroOrMore, true)

    const [oneOrMore] = valuesOf(shapesDataset, path, SH.oneOrMorePath)
    if (oneOrMore) return resolveTransitive(dataset, focusNode, oneOrMore, false)

    const [zeroOrOne] = valuesOf(shapesDataset, path, SH.zeroOrOnePath)
    if (zeroOrOne) return [focusNode, ...valuesOf(dataset, focusNode, zeroOrOne)]

    // Sequence path (rdf:list of predicates)
    const steps = readList(shapesDataset, path)
    return steps.reduce(
      (nodes, step) => nodes.flatMap(n => resolvePath(dataset, n, step)),
      [focusNode]
    )
  }
}
```

### Cycle Detection

Transitive paths (`zeroOrMore`, `oneOrMore`) use a visited set to prevent infinite loops in cyclic data:

```js
function resolveTransitive(dataset, start, predicate, includeStart) {
  const results = includeStart ? [start] : []
  const visited = new Set()
  const queue = [start]

  while (queue.length > 0) {
    const current = queue.shift()
    const key = termKey(current)
    if (visited.has(key)) continue
    visited.add(key)

    for (const next of valuesOf(dataset, current, predicate)) {
      results.push(next)
      queue.push(next)
    }
  }
  return results
}
```

## 10. Validation Engine

### Node Validation

For a node shape applied to a focus node:

```js
function validateNode(dataset, shape, focusNode, ctx) {
  const results = []

  // Evaluate each constraint declared on the shape
  for (const [component, params] of constraintsOf(shape)) {
    results.push(...evaluateConstraint(dataset, focusNode, focusNode, component, params, ctx))
  }

  // Evaluate nested property shapes
  for (const propShape of valuesOf(shapesDataset, shape, SH.property)) {
    const path = valuesOf(shapesDataset, propShape, SH.path)[0]
    const values = resolvePath(dataset, focusNode, path)

    // Property-level constraints (minCount, maxCount, etc.)
    for (const [component, params] of constraintsOf(propShape)) {
      if (isPropertyLevelConstraint(component)) {
        results.push(...evaluateConstraint(dataset, focusNode, values, component, params, ctx))
      }
    }

    // Value-level constraints (applied to each value)
    for (const value of values) {
      for (const [component, params] of constraintsOf(propShape)) {
        if (!isPropertyLevelConstraint(component)) {
          results.push(...evaluateConstraint(dataset, focusNode, value, component, params, ctx))
        }
      }
    }
  }

  return { conforms: results.length === 0, results }
}
```

### Recursion & Cycle Detection

SHACL allows shapes to reference each other (e.g., `sh:node`, `sh:property` with recursive shapes). The spec leaves recursion policy to implementations.

mdld-shapes uses a **visited set** of `(shapeTerm, focusNode)` pairs. If a pair is seen twice during a single validation, the nested validation returns `conforms: true` (optimistic cycle-breaking). This prevents infinite loops while allowing legitimate recursive shapes to validate finite data.

```js
function validateNode(dataset, shape, focusNode, ctx) {
  const key = `${termKey(shape)}|${termKey(focusNode)}`
  if (ctx.visited.has(key)) return { conforms: true, results: [] }
  ctx.visited.add(key)
  // ... validate ...
  ctx.visited.delete(key)  // Allow re-validation in different contexts
}
```

### Constraint Dispatch

```js
const constraintEvaluators = {
  [SH.ClassConstraintComponent]: classConstraint,
  [SH.DatatypeConstraintComponent]: datatypeConstraint,
  [SH.NodeKindConstraintComponent]: nodeKindConstraint,
  [SH.MinCountConstraintComponent]: minCountConstraint,
  [SH.MaxCountConstraintComponent]: maxCountConstraint,
  [SH.MinExclusiveConstraintComponent]: minExclusiveConstraint,
  // ... all ~30 components
}

function evaluateConstraint(dataset, focus, value, component, params, ctx) {
  const evaluator = constraintEvaluators[component.value]
  if (!evaluator) return []  // Unknown component — skip silently
  return evaluator(dataset, focus, value, params, ctx)
}
```

## 11. Validation Report

The report follows the W3C SHACL Validation Report vocabulary.

```js
function buildReport(allResults) {
  return {
    conforms: allResults.every(r => !isDisallowed(r.severity)),
    results: allResults.map(r => ({
      focusNode: r.focusNode,
      path: r.path || null,
      value: r.value || null,
      severity: r.severity || SH.Violation,
      sourceConstraintComponent: r.component,
      sourceShape: r.shape,
      message: r.message || generateMessage(r),
    }))
  }
}
```

### Default Severity

If a shape does not declare `sh:severity`, the default is `sh:Violation`.

### Message Generation

If a shape declares `sh:message`, it is used as a template. Parameter substitution:
- `{$value}` → value's lexical form or IRI
- `{$path}` → path's IRI or CURIE
- `{$constraint}` → constraint component's local name

If no `sh:message` is declared, a default message is generated:
- `sh:minCount` → "Less than {$minCount} values"
- `sh:class` → "Value is not an instance of {$class}"
- etc.

## 12. Error Handling

### Principles

- **Fail-loud on malformed input** — Throw on circular lists, malformed paths, missing required parameters.
- **Fail-soft on unknown components** — Skip unknown constraint components silently (forward compatibility).
- **No partial reports on crash** — If validation throws, no report is returned. The caller catches the error.

### Error Types

| Condition | Behavior |
|-----------|----------|
| Circular RDF list | `throw Error("Circular list at <iri>")` |
| Malformed list (missing rdf:first or rdf:rest) | `throw Error("Malformed list at <iri>")` |
| Unknown constraint component | Skip silently (return `[]`) |
| Missing required parameter (e.g., `sh:minCount` without value) | `throw Error("Missing parameter for <component>")` |
| Recursive shape cycle | Return `conforms: true` (optimistic) |
| Empty shapes dataset | Return `{ conforms: true, results: [] }` |
| Empty data dataset | Return `{ conforms: true, results: [] }` |

## 13. Performance Characteristics

### Complexity

- **Shape parsing**: O(S) where S = number of shape quads. Done once in `Validator` constructor.
- **Target resolution**: O(D) where D = number of data quads. Done once per `validate()` call.
- **Constraint evaluation**: O(V × C) where V = number of value nodes, C = number of constraints per shape. Each constraint is O(1) to O(D) depending on type.
- **Property path resolution**: O(P × D) where P = path length. Transitive paths are O(D) worst case.

### Memory

- Store: ~640 bytes per quad (same as mdld-parse).
- Validation context: O(depth) for recursive shapes. Typically <10 frames.
- Visited sets: O(V) per validation.

### Benchmarks (expected)

| Dataset size | Validation time |
|-------------|----------------|
| 100 quads | <1ms |
| 1,000 quads | <5ms |
| 10,000 quads | <50ms |
| 100,000 quads | <500ms |

These are estimates based on the algorithmic complexity. Actual performance depends on shape complexity and constraint types.

## 14. File Structure

```
mdld-shapes/
├── package.json              # deps: mdld-parse (peer or direct)
├── index.js                  # Public API: validate, Validator, createShapeDetector
├── validator.js              # Main engine (~1500 LOC)
│   // OR split into:
│   ├── namespaces.js         # RDF, SH, XSD namespace constants
│   ├── store.js              # Store class (minimal DatasetCore)
│   ├── detector.js           # Shape/data classifier
│   ├── list.js               # readList, writeList
│   ├── paths.js              # Property path resolution
│   ├── targets.js            # Target resolution
│   ├── constraints/          # One file per constraint group
│   │   ├── value-type.js     # class, datatype, nodeKind
│   │   ├── cardinality.js    # minCount, maxCount
│   │   ├── range.js          # min/max inclusive/exclusive
│   │   ├── string.js         # pattern, length, language
│   │   ├── pair.js           # equals, disjoint, lessThan
│   │   ├── logical.js        # and, or, not, xone
│   │   └── shape.js          # node, property, qualified, closed, in, hasValue
│   └── report.js             # Validation report builder
├── validate.js               # CLI tool (already exists)
├── constraints/              # MDLD constraint catalog (documentation)
│   ├── class.md
│   ├── class.demo.md
│   └── ...
└── SPEC.md                   # This document
```

### Single-file vs Multi-file

The spec allows either approach. For maximum readability, a single `validator.js` file (~1500 LOC) is preferred. Developers can read the entire validator in one sitting. If the file grows beyond 2000 LOC, split into the sub-modules shown above.

## 15. Testing Strategy

### Unit Tests

Each constraint component gets its own test file:

```js
// test/constraints/class.test.js
import { validate } from '../index.js'
import { DataFactory } from 'mdld-parse'

test('sh:class passes for valid instance', () => {
  const shapes = [
    DataFactory.quad(shape, RDF.type, SH.NodeShape),
    DataFactory.quad(shape, SH.targetClass, Person),
    DataFactory.quad(propShape, SH.path, knows),
    DataFactory.quad(propShape, SH.class, Person),
    // ...
  ]
  const data = [
    DataFactory.quad(alice, RDF.type, Person),
    DataFactory.quad(alice, knows, bob),
    DataFactory.quad(bob, RDF.type, Person),
  ]
  const report = validate({ shapes, data })
  assert(report.conforms === true)
})
```

### Integration Tests

Use the existing MDLD constraint catalog (`constraints/*.demo.md`):

```bash
node validate.js ./constraints/class.demo.md
# Expected: specific number of violations
```

### W3C Test Suite

Run the official SHACL 1.2 test suite (github.com/w3c/data-shapes/tree/gh-pages/shacl12-test-suite). Target: >90% pass rate for SHACL Core tests.

### Round-trip Tests

Verify that `validate(parse(generate(quads)))` produces the same report as `validate(quads)`.

## 16. Compliance

### SHACL Core Conformance

mdld-shapes aims for **SHACL Core conformance** as defined by the W3C recommendation:

- ✅ All core constraint components implemented
- ✅ All target types supported
- ✅ All property path types supported
- ✅ Validation report conforms to W3C vocabulary
- ✅ `sh:message` template support
- ✅ `sh:severity` support
- ✅ `sh:deactivated` support
- ✅ `sh:closed` with `sh:ignoredProperties`

### Non-Goals

- ❌ SHACL-SPARQL conformance
- ❌ SHACL-JS conformance
- ❌ SHACL-AF conformance
- ❌ Full RDFS entailment (only `rdfs:subClassOf` for `sh:class`)
- ❌ SPARQL-based targets (`sh:targetWhere`)

### Versioning

mdld-shapes follows semver. The SHACL spec version supported is documented in `package.json`:

```json
{
  "shacl": "1.2-core"
}
```

## 17. Examples

### Basic Validation

```js
import { validate } from 'mdld-shapes'
import { parse } from 'mdld-parse'

const shapesMd = `
[ex] <tag:example.org,2026:>

# Person Shape {=ex:PersonShape .sh:NodeShape label}
[ex:Person] {+ex:PersonShape ?sh:targetClass}

**Name is required** {+ex:PersonShape ?sh:property}
{=ex:NameProperty .sh:PropertyShape}
[ex:name] {sh:path}
[1] {sh:minCount}
`

const dataMd = `
[ex] <tag:example.org,2026:>

# Alice {=ex:alice .ex:Person label}
[Alice Smith] {ex:name}
`

const shapes = parse({ text: shapesMd }).quads
const data = parse({ text: dataMd }).quads

const report = validate({ shapes, data })
console.log(report.conforms)  // true
```

### Logical Constraints

```js
const shapesMd = `
[ex] <tag:example.org,2026:>

# Contact Shape {=ex:ContactShape .sh:NodeShape label}
[ex:Contact] {+ex:ContactShape ?sh:targetClass}

**Must have email OR phone** {+ex:ContactShape ?sh:or}
{=ex:EmailOrPhone}
{+ex:EmailShape ?sh:property}
{=ex:EmailShape .sh:PropertyShape}
[ex:email] {sh:path}
[1] {sh:minCount}

{+ex:PhoneShape ?sh:property}
{=ex:PhoneShape .sh:PropertyShape}
[ex:phone] {sh:path}
[1] {sh:minCount}
`
```

### Custom Classifier

```js
import { validate } from 'mdld-shapes'

const report = validate({
  quads: allQuads,
  classify: (quad) => {
    // Custom logic: only quads with sh: predicates are shapes
    return quad.predicate.value.startsWith('http://www.w3.org/ns/shacl#')
  }
})
```

## 18. Migration from shacl-engine

### Breaking Changes

- **Sync API** — `validate()` returns a report directly, not a Promise.
- **No SPARQL support** — `sh:sparql` constraints are ignored.
- **No JavaScript constraints** — `sh:js` constraints are ignored.
- **No advanced features** — SHACL-AF rules, functions, etc. are not supported.

### Migration Guide

```js
// Before (shacl-engine)
import Validator from 'shacl-engine/Validator.js'
const validator = new Validator(shapesDataset, { factory })
const report = await validator.validate({ dataset: dataDataset })

// After (mdld-shapes)
import { validate } from 'mdld-shapes'
const report = validate({ shapes: shapesQuads, data: dataQuads })
```

### Compatibility

- ✅ Accepts the same RDF/JS quads
- ✅ Produces the same validation report structure
- ✅ Supports the same SHACL Core constraints
- ❌ Does not support SPARQL/JS/AF extensions

## 19. Governance

mdld-shapes is part of the MD-LD ecosystem. It follows the same governance model as mdld-parse:

- Decisions are made by the steward, informed by discussion and use
- The project prioritizes conceptual integrity and simplicity
- Contributions that align with the zero-dependency, compact philosophy are welcomed
- Scope creep is resisted — SHACL Core is the target, not SHACL-everything

## 20. License

Same as mdld-parse. See the mdld-parse repository for licensing details.

---

**End of Specification**

*This spec defines the contract for mdld-shapes v1.0. Implementation should follow this spec precisely. Deviations must be documented and justified.*
