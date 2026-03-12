## The Trigger Architecture

Every file written to the vault is parsed into the shape store automatically. Shapes are grounded entities like everything else — `ig-cli` watches the vault directory, parses all MDLD on any file change, reloads the shape store, and re-runs validation. Violations are not a report you pull. They are events the filesystem emits.

The shape store has three classes of shapes:

**Structural shapes** — enforce provenance completeness. Silent unless something is malformed.

**Trigger shapes** — fire when a specific lifecycle pattern is detected. Each trigger shape maps to exactly one executable consequence. The shape message is the command specification.

**Completion shapes** — fire when a result exists but has not yet been processed. Pull the next LLM call.

```
File written → ig-cli parse → shape store reload → SHACL validate
                                                          │
                              ┌───────────────────────────┼────────────────────────┐
                              │                           │                        │
                    PENDING activity            unprocessed entity        unprocessed statement
                    → execute command           → call analysis LLM       → call grounding LLM
```

The watcher runs this loop continuously. The vault is the event bus.

---

## Filesystem Structure

```
vault/
│
├── .git/                          ← cryptographic backbone, all history
│
├── .vault/                        ← machine state, never edited by hand
│   ├── graph.ttl                  ← rebuilt on every parse cycle
│   ├── shapestore.ttl             ← all sh:NodeShape entities extracted from graph
│   ├── violations.json            ← current violation set, rebuilt on validate
│   ├── processed.json             ← set of commit hashes already dispatched
│   └── self.md                    ← agent identity, capabilities, active plan
│
├── shapes/                        ← MDLD shape definitions (ARE the shapestore source)
│   ├── core.md                    ← universal starter shapes as MDLD
│   ├── triggers.md                ← lifecycle trigger shapes
│   └── domain/                    ← S-stroke generated domain shapes
│       └── *.md
│
├── goals/
│   └── goal.md                    ← root goal entity, plan, frozen state declaration
│
├── plans/
│   └── plan-v1.md                 ← plan entity with command template and authority
│
├── sources/
│   └── *.md                       ← source credibility entities (L1 vault content)
│
├── activities/
│   ├── *.request.md               ← PENDING activity stubs → trigger command execution
│   ├── *.complete.md              ← completed activities with results appended
│   └── *.failed.md                ← failed activities with error and retry link
│
├── entities/
│   ├── *.raw.md                   ← unprocessed entities → trigger analysis LLM
│   ├── *.analysed.md              ← entities after internal analysis
│   └── *.grounded.md             ← frozen entities with rdf:Statement facts
│
├── statements/
│   └── *.md                       ← reified rdf:Statement entities, fully grounded
│
└── SEED.md                        ← bootstrap: goal + plan + core shapes, human-written
```

Everything under `shapes/` is MDLD. The parser extracts all `sh:NodeShape` entities from the full graph and writes them to `.vault/shapestore.ttl` on every parse cycle. The shape store is not a separate artifact — it is a projection of the knowledge graph. You cannot have a shape without a provenance chain because shapes are entities and all entities require provenance.

---

## The SEED — Day Zero

The only human-written file. Everything else grows from this.

```md
[prov]  <http://www.w3.org/ns/prov#>
[sh]    <http://www.w3.org/ns/shacl#>
[vx]    <tag:project@example.com,2026:>
[p]     <tag:project@example.com,2026:p:>

# Project Goal {=vx:goal .prov:Entity label}
[Verify all Spanish-speaking countries with capitals and populations] {p:desiredState}
[All country entities have ≥3 grounded statements from VERIFIED sources] {p:frozenState}

{=}

# Research Plan v1 {=vx:plan:v1 .prov:Plan label}
[Project Goal] {=vx:goal ?prov:wasDerivedFrom}
[fetch {{URL}}] {p:commandTemplate}
[vx:agent:primary] {=vx:agent:primary ?prov:wasAssociatedWith}

{=}

# Bootstrap Activity {=vx:activity:bootstrap .prov:Activity label}
[COMPLETE] {p:status}
[2026-02-27T09:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
[2026-02-27T09:00:01Z] {prov:endedAtTime ^^xsd:dateTime}
[Research Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[SEED written by human — vault initialised] {p:note}

{=}

# Core Trigger Shape {=vx:shape:trigger:pending .sh:NodeShape .prov:Entity label}
[Bootstrap Activity] {=vx:activity:bootstrap !prov:generated}
[prov:Activity] {=vx:t:activity ?sh:targetClass}
[PENDING status triggers command execution] {p:description}
[p:status — sh:hasValue PENDING — sh:severity sh:Violation —
 message: TRIGGER:EXECUTE:{{p:command}}] {p:constraint}

{=}

# Raw Entity Trigger Shape {=vx:shape:trigger:raw .sh:NodeShape .prov:Entity label}
[Bootstrap Activity] {=vx:activity:bootstrap !prov:generated}
[prov:Entity] {=vx:t:entity ?sh:targetClass}
[p:status — sh:hasValue RAW — sh:severity sh:Violation —
 message: TRIGGER:ANALYSE:{{entityIri}}] {p:constraint}

{=}

# Ungrounded Statement Trigger Shape {=vx:shape:trigger:ungrounded .sh:NodeShape .prov:Entity label}
[Bootstrap Activity] {=vx:activity:bootstrap !prov:generated}
[rdf:Statement] {=rdf:Statement ?sh:targetClass}
[prov:hadPrimarySource — sh:minCount 0 — sh:maxCount 0 — sh:severity sh:Violation —
 message: TRIGGER:GROUND:{{statementIri}}] {p:constraint}
```

One file. Four entities: Goal, Plan, Bootstrap Activity, three Shapes. The shapes are provenanced — generated by the bootstrap activity. The system is now live: any `*.request.md` file written with `p:status "PENDING"` will trigger command execution.

---

## The First Activity — Agent Writes a Request

The LLM (or human) writes this file. Writing it triggers the PENDING violation immediately.

```md
[prov]  <http://www.w3.org/ns/prov#>
[vx]    <tag:project@example.com,2026:>
[p]     <tag:project@example.com,2026:p:>

# Fetch Countries Activity {=vx:activity:fetch:countries .prov:Activity label}
[PENDING] {p:status}
[2026-02-27T09:01:00Z] {prov:startedAtTime ^^xsd:dateTime}
[Research Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[vx:agent:primary] {=vx:agent:primary ?prov:wasAssociatedWith}
[fetch https://restcountries.com/v3.1/lang/es] {p:command}
[Fetch all Spanish-speaking countries from REST Countries API] {p:rationale}
```

**What happens next is entirely automatic.**

The watcher detects the new file. Parser runs. Shape store reloads. The PENDING trigger shape fires:

```json
{
  "focusNode": "vx:activity:fetch:countries",
  "message": "TRIGGER:EXECUTE:fetch https://restcountries.com/v3.1/lang/es",
  "severity": "Violation"
}
```

The watcher's violation handler reads the `TRIGGER:EXECUTE:` prefix, extracts the command, runs it, captures the output, and appends to the same file:

```md
[COMPLETE] {p:status}
[2026-02-27T09:01:04Z] {prov:endedAtTime ^^xsd:dateTime}

## Result Entity {=vx:entity:countries:raw .prov:Entity label}
[Fetch Countries Activity] {=vx:activity:fetch:countries !prov:generated}
[RAW] {p:status}
<https://restcountries.com/v3.1/lang/es> {?prov:hadPrimarySource}
[2026-02-27T09:01:04Z] {prov:generatedAtTime ^^xsd:dateTime}
```

The activity is now COMPLETE. But a new violation fires immediately — the RAW entity trigger:

```json
{
  "focusNode": "vx:entity:countries:raw",
  "message": "TRIGGER:ANALYSE:vx:entity:countries:raw",
  "severity": "Violation"
}
```

---

## The Analysis Call — LLM Reads the Entity

The `TRIGGER:ANALYSE:` handler calls the LLM with the activity document and entity content as context. The LLM does not write to the vault directly — it produces MDLD that the watcher commits after running `vault check`.

**System prompt for analysis call:**

```
You are the analysis stroke of a PROV-Vortex DIAD cycle.
You have been given a RAW entity produced by a completed activity.
Your task: produce an MDLD document that:
1. Creates individual prov:Entity entries for each item in the raw result
2. Links each to the source activity via !prov:generated
3. Sets p:status "RAW" on each (they will trigger further grounding)
4. Groups them in a prov:Collection linked to the analysis activity

Write only valid MDLD. No explanation.
The analysis activity IRI is: vx:activity:analyse:countries:001
The source entity IRI is: vx:entity:countries:raw
Active plan: vx:plan:v1
```

**LLM produces** `activities/analyse-countries-001.complete.md`:

```md
[prov]  <http://www.w3.org/ns/prov#>
[vx]    <tag:project@example.com,2026:>
[p]     <tag:project@example.com,2026:p:>

# Analyse Countries Activity {=vx:activity:analyse:countries:001 .prov:Activity label}
[COMPLETE] {p:status}
[2026-02-27T09:01:05Z] {prov:startedAtTime ^^xsd:dateTime}
[2026-02-27T09:01:08Z] {prov:endedAtTime ^^xsd:dateTime}
[Research Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[Raw Countries Entity] {=vx:entity:countries:raw ?prov:used}

## Countries Collection {=vx:collection:countries .prov:Collection label}
[Analyse Countries Activity] {=vx:activity:analyse:countries:001 !prov:generated}

Members: {?prov:hadMember .prov:Entity label}
- [Mexico] {=vx:entity:country:mexico}
- [Colombia] {=vx:entity:country:colombia}
- [Spain] {=vx:entity:country:spain}
- [Argentina] {=vx:entity:country:argentina}

{=}

# Mexico Entity {=vx:entity:country:mexico .prov:Entity label}
[RAW] {p:status}
[Analyse Countries Activity] {=vx:activity:analyse:countries:001 ?prov:wasGeneratedBy}
<https://restcountries.com/v3.1/lang/es> {?prov:hadPrimarySource}
```

Twenty-one country entities are now in the graph. Each has `p:status "RAW"`. Each fires the RAW trigger. Twenty-one analysis violations appear simultaneously.

---

## The Grounding Wave — Parallel or Sequential

The watcher can process violations in parallel (one LLM call per entity) or sequentially. For the grounding stroke the system prompt changes:

```
You are the grounding stroke of a PROV-Vortex DIAD cycle.
You have been given a RAW entity that needs grounding as rdf:Statement facts.
Produce an MDLD document containing:
1. A grounding activity (prov:Activity, COMPLETE, with startedAtTime/endedAtTime)
2. One rdf:Statement entity per atomic fact about this entity
3. Each statement must have prov:hadPrimarySource with an HTTP URL
4. Each statement must have prov:wasGeneratedBy pointing to the grounding activity
5. Set p:status "PROCESSED" on the source entity

Entity to ground: vx:entity:country:mexico
Available command result: [Mexico raw JSON data]
Active plan: vx:plan:v1
```

**LLM produces** `entities/mexico.grounded.md`:

```md
[prov]  <http://www.w3.org/ns/prov#>
[rdf]   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[vx]    <tag:project@example.com,2026:>
[p]     <tag:project@example.com,2026:p:>

# Ground Mexico Activity {=vx:activity:ground:mexico .prov:Activity label}
[COMPLETE] {p:status}
[2026-02-27T09:01:10Z] {prov:startedAtTime ^^xsd:dateTime}
[2026-02-27T09:01:12Z] {prov:endedAtTime ^^xsd:dateTime}
[Research Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[Mexico Entity] {=vx:entity:country:mexico ?prov:used}
[PROCESSED] {=vx:entity:country:mexico ?p:status}

{=}

# Fact: Mexico capital {=vx:stmt:mexico:capital .rdf:Statement .prov:Entity label}
[Mexico] {=vx:entity:country:mexico ?rdf:subject}
[p:capital] {=p:capital ?rdf:predicate}
[Mexico City] {rdf:object}
[Ground Mexico Activity] {=vx:activity:ground:mexico ?prov:wasGeneratedBy}
<https://restcountries.com/v3.1/alpha/MEX> {?prov:hadPrimarySource}

{=}

# Fact: Mexico population {=vx:stmt:mexico:population .rdf:Statement .prov:Entity label}
[Mexico] {=vx:entity:country:mexico ?rdf:subject}
[p:population] {=p:population ?rdf:predicate}
[128932753] {rdf:object ^^xsd:integer}
[Ground Mexico Activity] {=vx:activity:ground:mexico ?prov:wasGeneratedBy}
<https://restcountries.com/v3.1/alpha/MEX> {?prov:hadPrimarySource}
```

The `rdf:Statement` entities have no `prov:hadPrimarySource` violation because they carry it directly. But they fire the UNGROUNDED trigger — wait, they have sources — so that trigger does not fire. Instead the completion shape fires:

```
TRIGGER:GROUND:vx:stmt:mexico:capital → already grounded → no trigger
```

No violation. The statement is frozen. The entity is PROCESSED. The grounding wave settles one country at a time.

---

## The Tree That Grows

After the first full cycle the filesystem looks like this:

```
vault/
├── SEED.md                                    ← 1 file, human-written, 4 entities
│
├── shapes/
│   └── core.md                                ← 3 trigger shapes, all provenanced
│
├── goals/
│   └── goal.md                                ← 1 goal entity
│
├── activities/
│   ├── fetch-countries.complete.md            ← 1 fetch + result entity
│   ├── analyse-countries-001.complete.md      ← 1 analysis + 21 member entities
│   ├── ground-mexico.complete.md              ← 1 grounding activity
│   ├── ground-colombia.complete.md
│   ├── ground-spain.complete.md
│   └── ... × 21
│
├── entities/
│   ├── countries-raw.md                       ← 1 raw collection
│   ├── mexico.grounded.md
│   ├── colombia.grounded.md
│   └── ... × 21
│
└── statements/
    ├── mexico-capital.md
    ├── mexico-population.md
    ├── mexico-language.md
    └── ... × 63 (3 facts × 21 countries)
```

**Entity count**: 1 goal + 1 plan + 1 bootstrap + 1 fetch activity + 1 raw result + 1 analysis activity + 1 collection + 21 country entities + 21 grounding activities + 63 statements = **111 entities**

**Connection count**: every entity has at minimum one incoming (`prov:wasGeneratedBy` or `prov:hadPrimarySource`) and one outgoing (`prov:generated` or `rdf:subject`) connection. The graph is a fully connected directed acyclic graph with no orphans, verified by `vault validate` reporting zero violations.

**Git commits**: approximately 50–70, one per file write, each signed, each with a meaningful message derived from the MDLD subject heading. The git log is a human-readable narrative of the vault's construction.

---

## The S Stroke as Another File

When `vault status` returns `STAGNANT` — zero violations, improvement potential 0.73 — the orchestrator writes:

```md
[prov]  <http://www.w3.org/ns/prov#>
[sh]    <http://www.w3.org/ns/shacl#>
[vx]    <tag:project@example.com,2026:>
[p]     <tag:project@example.com,2026:p:>

# Shape Refinement Activity {=vx:activity:shape:rev:001 .prov:Activity label}
[COMPLETE] {p:status}
[2026-02-27T10:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
[2026-02-27T10:00:03Z] {prov:endedAtTime ^^xsd:dateTime}
[Research Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[UNFREEZE — 21 countries frozen with 3 facts each — steering toward currency and timezone data] {p:rationale}
[PIVOT] {p:operation}

{=}

# Country Enrichment Shape v2 {=vx:shape:country:v2 .sh:NodeShape .prov:Entity label}
[Shape Refinement Activity] {=vx:activity:shape:rev:001 !prov:generated}
[Country Shape v1] {=vx:shape:country:v1 ?prov:wasRevisionOf}
[p:currency — minCount 1 — Violation —
 message: TRIGGER:FETCH:https://restcountries.com/v3.1/alpha/{{p:isoCode}}] {p:constraint}
```

This single file — written to `shapes/country-v2.md` — does four things simultaneously when parsed:

The new shape enters the shape store. Validation runs against all 21 country entities. Each entity lacks `p:currency`. The trigger shape fires 21 times with `TRIGGER:FETCH:` messages containing each country's ISO code. Twenty-one new `*.request.md` files are written by the watcher. Twenty-one PENDING violations appear. The vault unfreezes. The next DIAD wave begins.

---

## The Self-Grounding Property

The vault's shapes are MDLD entities with provenance. The vault's activities are MDLD entities with provenance. The vault's goals and plans are MDLD entities with provenance. The vault's own construction history — every file, every commit, every trigger — is parseable as a knowledge graph about itself.

This means the vault can run SPARQL against its own construction history:

```sparql
SELECT ?activity ?trigger ?result WHERE {
    ?activity a prov:Activity ;
              p:status "COMPLETE" ;
              prov:generated ?result .
    ?result p:status "PROCESSED" .
    ?activity prov:wasInformedBy ?trigger .
    ?trigger p:status "PENDING" .
}
```

And the result is a complete trace of every trigger-execute-analyse-ground cycle it has run. The vault knows how it was built. It can use that knowledge to build the next vault faster, with better shapes, with fewer wasted cycles. The L4 knowledge engineering vault described earlier is just this: the construction history of L0–L3 parsed as a knowledge graph and queried for patterns.

The seed grows into a tree. The tree describes its own growth. The description is the seed for the next tree.