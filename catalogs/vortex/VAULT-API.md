# Vault API — Double Vortex Left Hemisphere

> A deterministic, intelligence-free CLI and programmatic API surface for the Knowledge Vortex vault. All computation is pure: same input always produces same output. No inference, no scoring heuristics, no LLM calls inside the vault. Intelligence lives at the boundary — in the calling agent. The vault is the left hemisphere: exact, verifiable, action-governing.
>
> Distribution: single ZIP containing JS source + CLI entry point. Requires Node.js ≥ 20 and `git` on PATH. All persistent state is MDLD files + git history. No database, no server, no daemon.


---

## CLI Usage

```bash
vault <command> [args] [--vault <path>] [--format json|mdld|text]

# default vault path: ./vault
# default output format: json
# all commands exit 0 on success, non-zero on error
# all output goes to stdout; errors to stderr
```

---

## 1. Lifecycle — Vault Initialisation and State

```bash
vault init [--tag <email,year>] [--goal <text>] [--frozen <text>]
```
Creates vault directory, writes `SEED.md` with Goal + Plan stubs, copies `shapes/core.ttl`, runs initial `git init` + first commit. Returns `{ path, goalIri, planIri, shapesLoaded }`. **Deterministic**: same tag + goal always produces the same SEED.md.

```bash
vault status
```
Returns current vault state classification. No arguments. Pure read.
```json
{
  "state": "ACTIVE | FROZEN | STAGNANT | PENDING | FAILED",
  "violations": 42,
  "improvement_potential": 0.73,
  "compression_ratio": 4.2,
  "entity_count": 21,
  "activity_count": 8,
  "shape_count": 3,
  "orphan_count": 0,
  "pending_count": 2,
  "last_commit": "2026-02-27T11:00:00Z"
}
```

States are mutually exclusive and exhaustive:
- `ACTIVE` — violations > 0; DIAD must run
- `STAGNANT` — violations = 0, IP > threshold; S stroke must run
- `FROZEN` — violations = 0, IP ≤ threshold; complete
- `PENDING` — one or more activities have status PENDING and no endedAtTime
- `FAILED` — one or more activities have status FAILED with no revision queued

```bash
vault export [--out <file.zip>]
```
Packages entire vault directory (MDLD + git history + shapes) into a portable ZIP. The ZIP is the complete, self-contained artifact — another agent can `vault import` it and resume from exact state.

```bash
vault import <file.zip> [--dest <path>]
```
Unpacks ZIP, verifies git integrity, validates all MDLD, reports status. Returns status object. Fails loudly if git history is inconsistent.

```bash
vault reset --to <git-hash>
```
Hard reset to a previous commit. All files after that commit are removed. Git history is preserved — the reset itself becomes a new commit with `p:status "RESET"` and `p:resetTo` literal. **Deterministic rollback**: the vault can always return to any previously committed state.

---

## 2. Memory — Encode, Retrieve, History

All writes are atomic git commits. Reads are pure file operations against the working tree or git objects.

```bash
vault write <path> [--content <mdld>] [--stdin] [--message <msg>]
```
Writes MDLD to `vault/<path>`, runs `vault check` on it first (rejects if invalid), commits to git with auto-generated message derived from the MDLD subject heading if `--message` not supplied. Returns `{ path, commit, tripleCount, subjectIri }`. **Append-only by convention**: if file exists, use `vault append`.

```bash
vault append <path> [--content <mdld>] [--stdin]
```
Appends MDLD block to existing file (adds blank line separator), re-parses, re-validates, commits. Returns same shape as `write`. Fails if the append would create a SHACL violation that did not exist before — the calling agent must resolve it first or pass `--force` to allow controlled violation introduction (used by S stroke to deliberately unfreeze).

```bash
vault read <path>
```
Returns raw MDLD content of file. No parsing, no transformation. Pure file read.

```bash
vault parse [<path>]
```
Parses all MDLD in vault (or single file) into Turtle. Returns `{ tripleCount, graphPath }`. Writes `vault/.graph/current.ttl` as a side effect. This is the only command that touches `.graph/` — all query and validate commands call parse implicitly if `.graph/current.ttl` is stale relative to last commit.

```bash
vault list [--pattern <glob>] [--type <mdld-class-iri>]
```
Lists files matching pattern or containing entities of given rdf:type. Returns `[{ path, subjects[], lastModified, commitHash }]`. Pure filesystem + git read.

```bash
vault history <path> [--limit <n>]
```
Returns git log for a specific file as structured data. No intelligence — raw git log parsed to JSON.
```json
[{
  "hash": "abc123",
  "timestamp": "2026-02-27T11:00:00Z",
  "author": "agent@example.com",
  "message": "Grounding: Spain officialLanguage Spanish",
  "additions": 4,
  "deletions": 0
}]
```

```bash
vault diff <path> <hash1> [<hash2>]
```
Returns line diff between two commits (or commit and working tree). Output is raw unified diff — the calling agent interprets meaning.

```bash
vault show <git-hash>
```
Returns complete vault state at a given commit: all file contents reconstructed. Equivalent to `git checkout` without modifying working tree. Useful for the agent to reason about past states without altering current state.

---

## 3. Perception — Pattern Recognition and Gap Detection

All SPARQL is executed against the current parsed graph. No inference beyond RDF Schema subclass/subproperty. Deterministic: same graph always returns same results.

```bash
vault query <sparql> [--limit <n>]
```
Executes SPARQL SELECT against current graph. Returns `{ columns[], rows[], count }`. The most general perception primitive — everything else in this section is a named shortcut built on top of it.

```bash
vault ask <sparql>
```
Executes SPARQL ASK. Returns `{ result: true|false }`. Used for binary precondition checks — does this pattern exist in the graph right now?

```bash
vault describe <iri>
```
Returns all triples where the IRI is subject or object, plus one hop of context (subjects and objects of those triples). Structured as `{ subject, predicates: [{predicate, object, source}] }`. This is the vault's equivalent of focused attention on a single entity.

```bash
vault paths <from-iri> <to-iri> [--max-hops <n>]
```
Finds all RDF property paths connecting two entities up to max-hops length. Returns `[{ path: [iri, predicate, iri, ...], length }]` sorted shortest first. Deterministic graph traversal — no scoring. Used by the agent to reason about provenance chains and knowledge connections.

```bash
vault similar <iri> [--threshold <int>]
```
Finds entities with identical or near-identical predicate sets (same predicates, regardless of object values). Returns `[{ iri, sharedPredicates[], missingPredicates[] }]`. Threshold is minimum shared predicate count — purely structural, no semantic similarity. Used to find candidates for consolidation.

```bash
vault gaps [--shape <iri>] [--entity <iri>]
```
Runs targeted gap detection: for each entity matching the shape target, returns what required properties are missing WITHOUT running full SHACL validation. Faster than `vault validate` — used to check a single entity before the agent writes its grounding document.
```json
[{
  "entity": "vx:country:spain",
  "missingProperties": ["p:capital", "p:population"],
  "requiredByShape": "vx:shape:country_v2"
}]
```

```bash
vault search <text> [--predicate <iri>]
```
Full-text search over literal values in the graph. Returns `[{ iri, predicate, value, score }]` sorted by simple substring match frequency — no semantic search, no embeddings. Score is integer occurrence count. The agent decides what to do with results.

```bash
vault stale [--days <n>]
```
Returns entities whose `prov:generatedAtTime` is older than n days AND which have no `prov:wasRevisionOf` pointing to a newer version. Default 90 days. Pure date arithmetic against graph timestamps. Returns `[{ iri, age_days, lastSource }]`. Input to immune response cycle.

---

## 4. Executive Function — Validation and Precondition Checking

The prefrontal cortex layer. All functions here are pure constraint evaluation — no modification of vault state.

```bash
vault validate [--shapes <path>] [--entity <iri>]
```
Runs full SHACL validation against current graph and all shapes in `vault/shapes/`. Returns `{ valid: bool, violations: [{ focusNode, shape, message, severity, path }] }`. The primary propulsion signal — violations are the task queue. With `--entity` runs validation only against shapes targeting that entity's type.

```bash
vault check <mdld-content>
```
Pre-flight validation: parses the supplied MDLD string, merges it hypothetically with current graph, runs SHACL, returns what violations would be introduced or resolved. Does NOT write to vault. Returns `{ newViolations[], resolvedViolations[], netChange }`. Used by the agent before deciding to write.

```bash
vault preconditions <action-iri>
```
Runs the precondition shapes for a declared action entity. Returns `{ satisfied: bool, missing: [{ property, message }] }`. The gate between reasoning and acting — if `satisfied: false`, the agent must ground the missing facts before the action can proceed. No intelligence: pure SPARQL ASK queries against required property paths declared in the action's shape.

```bash
vault contradictions [--entity <iri>]
```
Finds pairs of `rdf:Statement` entities where the same subject-predicate pair has two different object values from different `prov:hadPrimarySource` URLs. Returns `[{ subject, predicate, value1, source1, value2, source2 }]`. Deterministic: any two conflicting grounded statements are a contradiction by definition. The agent decides how to resolve.

```bash
vault shapes [--active] [--history]
```
Lists all currently active `sh:NodeShape` entities in the vault, with their generating activity and `prov:wasRevisionOf` chain. With `--history` returns the full shape lineage — every version of every shape ever committed, in chronological order. The steering history of the vortex.

```bash
vault authority <agent-iri> <operation>
```
Checks whether a given agent IRI is authorised to perform an operation (WRITE, SHAPE, FEDERATE, RESET) according to the current authority meta-shapes. Returns `{ authorised: bool, shape: <iri>, reason: <message> }`. Pure SPARQL ASK against authority shapes — no policy engine, no external auth.

---

## 5. Motor Output — Action Protocol

Every action is gated by a write-validate-execute-commit cycle. No `env.*` call executes without a preceding `vault preconditions` pass and a committed request document.

```bash
vault action create <mdld-stub> [--force]
```
Writes an action request document to `vault/actions/<timestamp>.request.md`, runs `vault preconditions` on the declared action IRI, returns `{ actionIri, preconditionsSatisfied, violations[], requestPath, commitHash }`. If preconditions are not satisfied and `--force` is not set, the action document is written (creating the violation as a pressure signal) but marked `p:status "BLOCKED"`. The agent must resolve the violations before proceeding.

```bash
vault action complete <action-iri> [--result <mdld>] [--stdin]
```
Closes an open action: appends result MDLD to the corresponding request document (or writes a new result file), updates `p:status` to COMPLETE, adds `prov:endedAtTime`, commits. Returns `{ actionIri, resultPath, commitHash, newTriples }`. Fails if action is not in PENDING state.

```bash
vault action fail <action-iri> --reason <text> [--retry]
```
Closes a failed action: sets `p:status "FAILED"`, `p:errorMessage`, `prov:endedAtTime`, commits. With `--retry` immediately creates a new PENDING stub linked via `prov:wasRevisionOf` to the failed action. Returns `{ failed: actionIri, retryIri? }`. Ensures the Temporal shape is satisfied — no dangling PENDING activities.

```bash
vault action list [--status <PENDING|COMPLETE|FAILED|BLOCKED>]
```
Returns all action entities in the vault matching the given status. Returns `[{ iri, status, startedAt, endedAt?, plan, agent }]`. The agent's motor cortex survey — what is currently in flight, blocked, or failed.

---

## 6. Interoception — Vault Self-Model

Pure metric computation against the current graph. No thresholds hardcoded — all returned as raw numbers for the calling agent to interpret against its current goal.

```bash
vault health
```
Full vital signs. All numbers, no interpretation.
```json
{
  "entity_count": 21,
  "activity_count": 8,
  "statement_count": 63,
  "collection_count": 3,
  "shape_count": 4,
  "orphan_count": 0,
  "pending_count": 0,
  "failed_count": 0,
  "contradiction_count": 0,
  "stale_count": 2,
  "compression_ratio": 3.0,
  "violation_count": 0,
  "improvement_potential": 0.41,
  "pass_count": 3,
  "total_commits": 47,
  "vault_age_days": 12
}
```

```bash
vault confidence <iri>
```
Returns grounding depth for a single entity: how many independent `prov:hadPrimarySource` paths support it through the provenance graph. Returns `{ iri, confidence: int, sources: [url], chains: [{ path[], length }] }`. Integer count — no weighting, no Bayesian reasoning. The agent decides what confidence score is sufficient for a given action.

```bash
vault momentum [--window <hours>]
```
Activity rate over the last N hours: completed activities per hour, entities generated per hour, statements grounded per hour. Returns `{ activitiesPerHour, entitiesPerHour, statementsPerHour, windowHours }`. Pure count of commits in git log within time window.

```bash
vault load
```
Returns current cognitive load: `{ pendingViolations, shapeComplexity, blockedActions, staleness }`. `shapeComplexity` is the sum of `sh:minCount` values across all active shapes — higher means more pressure per entity. `staleness` is the count of entities older than 90 days with no revision. All raw integers — no normalisation.

```bash
vault age <iri>
```
Returns `{ iri, generatedAt, lastRevisedAt, age_days, revisionCount }` for a single entity. Pure git log + graph query. Used to determine whether a specific belief should be re-verified before acting on it.

```bash
vault improvement_potential
```
Runs the multi-factor IP query. Returns `{ score: float, factors: { sparse: int, isolated: int, stale: int }, enrichable: [{ iri, reason }] }`. The three factors (sparse statements, no cross-links, old with no revision) are returned separately so the calling agent can reason about which type of improvement is warranted, not just whether improvement is warranted.

---

## 7. Consolidation — Offline Reorganisation

Runs without external data. Pure internal graph operations. No intelligence — all decisions are structural (duplicate detection, contradiction surfacing, dead link pruning). Called by the agent during downtime between active cycles.

```bash
vault consolidate duplicates [--dry-run]
```
Finds entity pairs where `vault similar` returns 100% predicate overlap AND their literal values are identical or differ only in whitespace normalisation. Returns `[{ entity1, entity2, mergeCandidate }]`. With `--dry-run` returns candidates without acting. Without `--dry-run` writes a federation-style merge document linking both via `prov:wasDerivedFrom`. **Never deletes** — creates canonical entity, marks originals as superseded.

```bash
vault consolidate orphans [--dry-run]
```
Finds entities with no `prov:hadPrimarySource` and no `prov:wasGeneratedBy` — entities that exist in the graph but have no provenance. Returns them as a violation list. With `--dry-run` lists only. Without `--dry-run` creates explicit violation annotations so SHACL picks them up in the next `vault validate` cycle.

```bash
vault consolidate chains [--dry-run]
```
Finds `prov:wasRevisionOf` chains longer than 5 links and compresses them to direct links (A wasRevisionOf E, skipping B→C→D). Preserves full chain in git history. Returns `{ compressed: int, chainsAffected }`. Keeps the working graph navigable without losing historical depth.

```bash
vault consolidate index
```
Rebuilds `.graph/current.ttl` and `.graph/index.json` (entity → file mapping) from scratch by re-parsing all MDLD. Used after import, after reset, or when the index is suspected stale. Returns `{ tripleCount, entityCount, duration_ms }`. Deterministic — same MDLD always produces the same graph.

---

## 8. Immune System — Trust and Integrity

Detects when previously trusted knowledge has been compromised or when the vault's own integrity has been violated.

```bash
vault immune verify [--limit <n>] [--age <days>]
```
Re-fetches up to N `prov:hadPrimarySource` URLs (prioritising oldest first) using HTTP HEAD requests, checks ETag or Last-Modified headers against stored values. Returns `[{ iri, url, status: UNCHANGED|CHANGED|GONE|ERROR, lastChecked, storedEtag, currentEtag }]`. Does not modify the vault — returns findings only. The agent decides whether changed or gone sources warrant a re-grounding cycle.

```bash
vault immune flag <iri> --reason <text>
```
Writes a `p:trustFlag` annotation to the entity's document: source changed, source gone, contradiction detected, manually flagged. Creates a SHACL violation via the `vx:shape:TrustShape` (requires `p:trustFlag` to have a corresponding `p:trustResolution` before the entity can be used in precondition checks). Returns `{ flagged: iri, violationCreated: bool }`.

```bash
vault immune resolve <iri> --resolution <text>
```
Writes `p:trustResolution` to a flagged entity, clears the trust violation. Resolution text is recorded verbatim — it is evidence, not evaluation. Returns `{ resolved: iri, remainingFlags: int }`.

```bash
vault immune integrity
```
Verifies git object integrity for all committed files: runs `git fsck`, checks that every file referenced in git log still exists and has not been modified outside of git. Returns `{ valid: bool, corrupted: [], missing: [] }`. The vault's equivalent of a neurological integrity check — confirms the memory substrate itself has not been tampered with.

---

## 9. Self-Model — Capability Declaration

The agent's proprioception. A static MDLD document (`vault/self.md`) declaring the agent's own capabilities, constraints, and identity. Written once at `vault init`, updated via `vault self update`. All reads are pure file operations.

```bash
vault self show
```
Returns parsed content of `vault/self.md` as structured JSON.
```json
{
  "agentIri": "vx:agent:primary",
  "capabilities": ["env.fetch", "env.search", "env.shell"],
  "rateLimits": { "env.fetch": "100/hour", "env.search": "50/hour" },
  "authorisedOperations": ["WRITE", "SHAPE"],
  "planInEffect": "vx:plan:v1",
  "goalIri": "vx:goal"
}
```

```bash
vault self update [--capability <add|remove> <name>] [--plan <iri>]
```
Updates `vault/self.md` and commits. The self-model is versioned like any other document — `vault history vault/self.md` shows the full evolution of the agent's declared capabilities. Used when the agent gains or loses access to a tool, or when the active plan changes.

```bash
vault self can <operation>
```
Returns `{ can: bool, reason }` by cross-referencing `vault/self.md` capabilities with `vault authority` for the current agent IRI. Pure lookup — no reasoning. The agent asks this before attempting any operation that requires authority.

---

## 10. Shape Stroke — S Stroke Interface

The S stroke is the only vault operation that directly modifies the constraint graph. All other operations work within the current shape set. These calls require orchestrator authority (checked automatically).

```bash
vault shape add <mdld> [--force]
```
Writes a new `sh:NodeShape` MDLD document to `vault/shapes/`, validates that it is well-formed SHACL, checks authority, commits. Returns `{ shapeIri, expectedNewViolations, path, commitHash }`. `expectedNewViolations` is computed by running the new shape against the current graph before committing — the agent sees exactly how many entities will be unfrozen before deciding to proceed.

```bash
vault shape revise <shape-iri> <mdld>
```
Writes a new version of an existing shape, automatically links it to predecessor via `prov:wasRevisionOf`, deactivates old version (adds `p:status "SUPERSEDED"`), commits. Returns same shape as `vault shape add`. The old shape remains in git history; only the working tree version is superseded.

```bash
vault shape deactivate <shape-iri>
```
Marks a shape as `p:status "INACTIVE"` without deleting it. It will no longer be used in `vault validate` runs. Returns `{ deactivated: iri, violationsRemoved: int }`. Used by the agent when a shape has served its purpose and the associated pressure should be released.

```bash
vault shape simulate <mdld>
```
Runs a proposed shape against the current graph WITHOUT committing it. Returns `{ newViolations[], resolvedViolations[], affectedEntities[], netPressureChange }`. The agent's dry-run for S stroke decisions — see the full pressure consequence before committing to a steering change.

```bash
vault shape library list [--domain <name>]
vault shape library install <name>
```
Lists and installs pre-built shape sets from `vault/shapes/library/` (bundled in ZIP). Domains: `geographic`, `scientific`, `legal`, `temporal`, `financial`. Each install writes the shape MDLD, runs `vault shape simulate`, and reports expected violations before asking for confirmation (or proceeding with `--yes`). All library shapes ship with `p:rationale` literals explaining their purpose.

---

## 11. Federation — Multi-Vault Operations

```bash
vault federate <vault-b-path> [--entity <iri>] [--dry-run]
```
Merges entities from a second vault into current vault. Finds matching entities via IRI or structural similarity, writes canonical merge documents with `prov:wasDerivedFrom` and `owl:sameAs` links, flags contradictions via `vault immune flag`. With `--dry-run` returns the merge plan without writing. Returns `{ merged: int, contradictions: int, plan: [{ entity, action }] }`.

```bash
vault federate export <iri-list> [--out <path>]
```
Exports a subset of vault entities (and their full provenance chains) as a portable MDLD bundle. Used to share specific knowledge with another vault without exporting the entire vault. Returns a ZIP containing only the relevant MDLD files and the git commits that produced them.

---

## 12. ZIP Distribution Structure

```
vault-cli.zip
├── bin/
│   └── vault.mjs              ← CLI entry point (Node.js ESM, shebang)
├── src/
│   ├── memory.mjs             ← §2: write, read, append, list, history, diff
│   ├── perception.mjs         ← §3: query, ask, describe, paths, similar, gaps
│   ├── executive.mjs          ← §4: validate, check, preconditions, contradictions
│   ├── motor.mjs              ← §5: action create/complete/fail/list
│   ├── interoception.mjs      ← §6: health, confidence, momentum, load, age, ip
│   ├── consolidation.mjs      ← §7: duplicates, orphans, chains, index
│   ├── immune.mjs             ← §8: verify, flag, resolve, integrity
│   ├── self.mjs               ← §9: show, update, can
│   ├── shape.mjs              ← §10: add, revise, deactivate, simulate, library
│   ├── federation.mjs         ← §11: federate, export
│   ├── lifecycle.mjs          ← §1: init, status, export, import, reset
│   ├── parser.mjs             ← MDLD → Turtle (ig-cli wrapper or native)
│   ├── sparql.mjs             ← SPARQL engine (oxigraph-wasm or comunica)
│   └── shacl.mjs              ← SHACL engine (rdf-validate-shacl or pySHACL via subprocess)
├── shapes/
│   └── library/
│       ├── core.ttl           ← §4: universal starter shapes
│       ├── geographic.ttl
│       ├── scientific.ttl
│       ├── legal.ttl
│       ├── temporal.ttl
│       └── financial.ttl
├── templates/
│   └── SEED.md                ← bootstrap template with {{PLACEHOLDERS}}
└── package.json               ← { "type": "module", "bin": { "vault": "bin/vault.mjs" } }
```

No build step. `npm install -g vault-cli.zip` or `node bin/vault.mjs` directly. All dependencies (SPARQL engine, SHACL validator, MDLD parser) are bundled. `git` is the only external dependency.

---

## Invariants — What the Vault Guarantees Without Intelligence

1. **Append-only**: no file is ever overwritten; `vault append` and `vault write` always produce new git commits
2. **Deterministic parse**: `vault parse` on the same MDLD always produces the same Turtle
3. **Provenance completeness**: `vault validate` always catches entities without `prov:hadPrimarySource` or `prov:wasGeneratedBy`
4. **Temporal completeness**: `vault validate` always catches activities without `prov:endedAtTime`
5. **Shape provenance**: `vault validate` always catches shapes without `prov:wasGeneratedBy`
6. **Authority enforcement**: `vault shape add` always checks `vault authority` before writing
7. **Integrity**: `vault immune integrity` can always detect external tampering via git object store
8. **Rollback**: `vault reset` can always restore any prior committed state
9. **Portability**: `vault export` + `vault import` preserves complete vault state including git history
10. **No hidden state**: everything the vault knows is in MDLD files and git history — no database, no cache that is not reconstructable via `vault consolidate index`


-----

> Focus on vault init, vault write, vault append, vault validate, vault check, vault preconditions, vault action, vault health, and vault shape. These twelve commands are sufficient to run the full DIADS cycle. 