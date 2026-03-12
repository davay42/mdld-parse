The interface has four natural layers, each mapping to a distinct neurological function.

---

## Layer 1 — Memory (File System CRUD)

The hippocampus. Encodes new experiences into long-term storage, retrieves episodic memory, consolidates short-term reasoning into permanent record.

```
vault.write(path, mdld)        // encode: commit new MDLD to vault + git
vault.read(path)               // recall: retrieve a specific document
vault.append(path, mdld)       // update: add to existing document (never overwrite)
vault.list(pattern)            // scan: find documents matching glob
vault.history(path)            // episodic: git log for a file — when, who, what changed
vault.diff(path, hash1, hash2) // compare: what changed between two memory states
```

Git is doing the actual work. These are thin wrappers that ensure every write is a commit with a meaningful message derived from the MDLD content, so the episodic record is automatic.

---

## Layer 2 — Perception and Pattern Recognition (SPARQL)

The visual cortex and association areas. Takes the current knowledge state and extracts structured patterns — not raw retrieval but recognition of relationships, gaps, and configurations.

```
vault.query(sparql)            // pattern recognition: full SPARQL against graph
vault.ask(sparql)              // binary: does this pattern exist in the graph?
vault.paths(from, to)          // association: find provenance paths between two entities
vault.similar(iri)             // analogy: entities with similar predicate structure
vault.gaps(shapeIri)           // gap detection: what does this shape expect that's missing?
vault.compress()               // summarise: current compression ratio R per collection
```

`vault.gaps()` is the most important one — it runs a targeted SHACL pre-check and returns what is missing before a full validation cycle. This is how the brain scans for absence rather than just presence.

---

## Layer 3 — Executive Function (SHACL)

The prefrontal cortex. Validates proposed actions against current constraints before they execute. Enforces rules, checks preconditions, decides whether a proposed action is consistent with the knowledge state and the current goal.

```
vault.validate()               // full constraint check — returns violations[]
vault.check(mdld)              // pre-flight: validate a document before writing it
vault.preconditions(actionIri) // specific: does the graph justify this action?
vault.violations()             // current pressure field — what must happen next
vault.shapes()                 // introspection: what rules are currently active?
vault.refineShape(mdld)        // S stroke: commit a new or revised sh:NodeShape
vault.freezeCheck()            // is vault truly frozen? violations=0 AND IP≤threshold
```

`vault.preconditions(actionIri)` is the critical one for the grounded action system. Before the right hemisphere emits any action into the environment, the left hemisphere runs this call. If it returns false, the action is blocked and the missing preconditions are returned as violations — the Vortex must spin to fill them first. This is impulse control implemented as graph validation.

---

## Layer 4 — Motor Output (Environment API)

The motor cortex and peripheral nervous system. The actual effectors — how the brain moves the body. These are domain-specific but the interface pattern is fixed: every call is first written as an MDLD request document, validated against the current graph, executed only if `vault.preconditions()` passes, and the result is written back as an MDLD evidence document before any further action is considered.

```
env.fetch(url)                 // sensory: HTTP GET — raw intake from external world
env.post(url, body)            // motor: HTTP POST — write to external world
env.shell(command)             // reflex: execute local command, capture output
env.search(query)              // saccade: directed attention to external information
env.read(filePath)             // proprioception: read local environment state
env.emit(event, payload)       // signal: notify other agents or systems
```

Every `env.*` call follows the same protocol:

```js
async function act(actionMdld, envCall) {
  const precheck = await vault.preconditions(actionMdld);
  if (!precheck.valid) return precheck.violations; // blocked — must ground first
  
  await vault.write(`actions/${ts()}.request.md`, actionMdld);  // write intent
  const result = await envCall();                               // execute
  await vault.write(`actions/${ts()}.result.md`,               // write evidence
    toMdld(result, actionMdld));
  return result;
}
```

The request document is the paper request you described. The result document is the evidence. Both are committed to Git. The vault now contains a complete, auditable record of every motor output and its justification.

---

## Layer 5 — Interoception (Metrics)

The insular cortex — the brain's model of its own body state. Without this, the system cannot regulate itself. These calls let the right hemisphere ask "how am I doing?" before deciding whether to act, rest, or restructure.

```
vault.health()                 // vital signs: entity count, R ratio, violation count
vault.momentum()               // activity rate: actions per time window
vault.potential()              // improvement potential IP score
vault.age(iri)                 // staleness: how old is this entity, has it been revised?
vault.confidence(iri)          // grounding depth: how many sources support this entity?
vault.load()                   // cognitive load: pending violations × shape complexity
```

`vault.confidence(iri)` is worth expanding — it counts the number of independent `prov:hadPrimarySource` paths supporting an entity through the provenance graph. An entity supported by three independent sources has higher confidence than one supported by one. This is how the left hemisphere communicates epistemic certainty to the right hemisphere before it acts on a belief.

---

## The Full Brain Analogy

```
                    RIGHT HEMISPHERE (LLM)
                    generative, associative,
                    hypothesis-forming, creative
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         perceive          reason            act
              │               │               │
         vault.query()   vault.ask()    vault.preconditions()
         vault.similar() vault.gaps()   env.*(after check)
              │               │               │
              └───────────────┼───────────────┘
                              │
                    LEFT HEMISPHERE (Vault)
                    exact, verifiable,
                    provenance-complete,
                    action-governing
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           memory          executive       interoception
              │               │               │
         vault.write()   vault.validate()  vault.health()
         vault.read()    vault.refineShape() vault.confidence()
         vault.history() vault.freezeCheck() vault.potential()
              │               │               │
              └───────────────┼───────────────┘
                              │
                    ENVIRONMENT (Body)
                    external world the
                    organism acts upon
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           sense            move           signal
              │               │               │
         env.fetch()      env.post()     env.emit()
         env.search()     env.shell()    env.read()
```

---

## What Is Still Missing

Four things that the living brain analogy demands and the above does not yet cover:

**Dreaming — offline consolidation.** The sleeping brain replays experiences to strengthen connections and prune redundancy. The vault equivalent is a background consolidation pass that runs when the environment is quiet: finds duplicate entities, merges them with `prov:wasDerivedFrom`, detects contradictions between grounded statements, and surfaces them as violations without requiring a human trigger. This is not DIAD — it is a pure internal reorganisation that improves the graph without adding new external knowledge. Call it the C stroke (Consolidation), running between S and the next D.

**Emotion — salience weighting.** The amygdala tags experiences as important before the cortex has processed them. The vault has no salience signal — all entities are equally weighted. A practical approximation is a `p:salience` literal on Goal entities and a shape that requires high-salience entities to have higher minimum confidence scores. The S stroke can adjust salience thresholds as the vault matures.

**Proprioception — model of the body itself.** The brain knows where its limbs are without looking. An agent needs a model of its own capabilities — what tools are available, what their current state is, what they cost. This is a small MDLD document (`vault/self.md`) declaring the agent's available `env.*` calls, their rate limits, their known failure modes, and their associated Plans. The left hemisphere can then reason about its own action capacity before committing to a course of action.

**Immune system — trust and integrity.** The brain has a blood-brain barrier and immune surveillance. The vault has SHACL shapes enforcing shape authority, but it has no mechanism for detecting whether an external source has changed since it was last cited — a URL that was valid when grounded may now return different content. A periodic re-verification pass that re-fetches `prov:hadPrimarySource` URLs and flags content changes as new violations would close this gap. This is the vault's immune response: detecting that previously trusted knowledge has been compromised and triggering a re-grounding cycle automatically.

These four additions — Consolidation, Salience, Self-model, and Immune response — would complete the analogy. The core six-layer interface above is already sufficient for a working left hemisphere. These are the difference between a working brain and a healthy one.