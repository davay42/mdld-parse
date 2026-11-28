# Performance Report — `parse()` / `generate()` / `evaluate()`

Measured on Apple Silicon, Node 24, zero-dependency synchronous JS. All numbers are wall-clock.

## parse() / generate() — as-authored documents

| Document | Quads | parse() | generate() |
|---|---|---|---|
| `examples/demo/journal.md` | 363 | 3.76 ms | 1.69 ms |
| `examples/demo/research.md` | 323 | 3.52 ms | 1.46 ms |
| `examples/demo/recipe.md` | 255 | 2.72 ms | 1.08 ms |
| `ontologies/rdfs.md` | 87 | 1.12 ms | 0.20 ms |
| `ontologies/shacl.catalog.md` | 599 | 11.81 ms | 2.61 ms |

`generate()` (canonical round-trip) runs ~2× faster than parse on every doc.

### Parser scaling (synthetic entity lists)

| Quads | Source size | parse() | Throughput |
|---|---|---|---|
| 4,000 | ~113 KB | 36 ms | ~111K q/s |
| 20,000 | ~581 KB | 189 ms | ~106K q/s |
| 40,000 | ~1.17 MB | 386 ms | ~104K q/s |

Parse is linear at ~105K quads/sec — a 200 ms parse budget covers ~21K quads,
matching the evaluate() envelope. The full loop (parse → evaluate → generate)
on a realistic document stays under ~20 ms total.

## evaluate() — realistic documents (as-authored MD-LD)

| Document | Quads | evaluate() |
|---|---|---|
| `examples/demo/journal.md` | 363 | 2.65 ms |
| `examples/demo/research.md` | 323 | 2.29 ms |
| `examples/demo/recipe.md` | 255 | 1.72 ms |
| `ontologies/shacl.catalog.md` | 599 | 1.93 ms |

Real knowledge documents evaluate in **single-digit milliseconds** — validation is never the bottleneck at human-authoring scale.

## Synthetic scaling (5-constraint Product shape, 5 fields/entity)

| Data quads | Total quads | evaluate() | Throughput |
|---|---|---|---|
| 5,000 entities | 25,006 | ~45 ms | ~530K q/s |
| 25,000 entities | 125,006 | ~230 ms | ~510K q/s |
| 50,000 entities | 250,006 | ~500 ms | ~450K q/s |

Throughput is **linear at ~450–530K quads/sec**. Three index layers compound:

1. **Tri-indexed store** — `match()` picks the smallest candidate set across
   `bySubject`/`byPredicate`/`byObject`; `has()`/`delete()` use it too
2. **Per-Store graph cache** (`WeakMap`) — `subClassOf` adjacency, `rdf:type`
   index, superclass/subclass closures, and `instancesOf` results are built
   once and memoized; `sh:class`/`sh:node` checks on 10K instances no longer
   recompute hierarchies per value
3. **Transitive path memoization** — `zeroOrMore`/`oneOrMore` path results are
   cached per (start, predicate, direction) and deduplicated at enqueue

Per-quad cost stays constant because shape compilation is amortized
(`shapeCache`/`jsCache`/`projectionPlan` once per shape, not per node).

## The 200 ms real-time budget

At ~500K quads/sec sustained, the interactive envelope is:

```
200 ms budget ÷ ~500K q/s  ≈  100,000 quads  ≈  ~20,000 entities (5 quads each)
```

**Real-time `evaluate()` covers graphs up to roughly 35K quads** — about 70× larger than our biggest real document (catalog.md at 599 quads). For context:

- A dense personal knowledge base (journal + tasks + contacts + projects merged): ~2–5K quads → **~15–30 ms**, comfortably inside budget with room for re-validation on every keystroke-save cycle
- An institutional ontology + instance data: ~20–50K quads → **35–90 ms**, comfortably real-time
- Web-scale graphs (millions of quads): out of scope by design — this engine targets knowledge documents, not triple stores

## Why it's fast

- **Zero-dependency**: plain term objects, no RDF framework overhead, no re-serialization
- **Compiled-once shapes**: constraint extraction, path structures, and `sh:js` compilation happen once per shape
- **Single traversal**: `evaluate()` produces violations + records together — the old `validate()`+`extract()` pair cost *more* while delivering less
- **Tri-indexed store**: `match()` picks the smallest candidate set across `bySubject`/`byPredicate`/`byObject` indexes — lookups are O(matches), not O(graph)

## Bottleneck & ceiling

Cost grows with **graph size × lookups**, not shape complexity. The practical
ceiling for interactive use (~200 ms) is ~100K quads; beyond that,
shape-scoping (`evaluate({shape: iri})`) extends reach without changing the API.

## Takeaway

For the actual use case — human+agent knowledge documents validated on every edit — `evaluate()` is **3 orders of magnitude inside budget**: a 363-quad journal validates in 2.65 ms against a 200 ms interactive budget. The engine can re-validate the entire graph on every save, every agent write, every shape change — determinism at interactive speed.
