# HOWTO: Agentic DIAD Loop Operations

## Abstract

This guide instructs modern agents equipped with computers, ig-cli, and LLM capabilities on how to initiate, propel, steer, and regulate agentic DIAD (Document Intake → Internal Analysis → External Validation → Grounding) loops using local MDLD notes and SHACL+SPARQL constraints.

The Knowledge Double Vortex operates as a **self-propelling information engine** where SHACL violations provide the propulsion pressure that drives each phase transition.

---

## Quick Start: 5-Minute Ignition

### Step 1: Create Your SEED.md

Create `SEED.md` in your project root:

```markdown
@prefix mdp: <http://mdld.js.org/prov/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix tag: <tag:myproject,2026:> .

# THE GOAL (Vacuum Center)
{=tag:vortex:goal .prov:Entity}
rdfs:label "Build verifiable knowledge base about [TOPIC]" ;
mdp:desiredState "All facts grounded with primary sources" .

# THE FOUR FORCES (SHACL Pressure Field)
{=tag:shapes:VortexIntegrity .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:hadPlan ;
    sh:minCount 1 ;
    sh:message "Vortex Violation: Spontaneous activity - no plan assigned"
] ;
sh:property [
    sh:path prov:generated ;
    sh:minCount 1 ;
    sh:message "Vortex Violation: Activity is a Sink - no knowledge generated"
] .

{=tag:shapes:GroundingRequirement .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path [ sh:alternativePath (prov:wasDerivedBy prov:wasGeneratedBy) ] ;
    sh:minCount 1 ;
    sh:message "Vortex Violation: Orphaned Entity - no provenance trace"
] .

# THE INITIAL PLAN (Orifice Plate)
{=tag:vortex:plan_v1 .prov:Plan}
prov:wasDerivedFrom tag:vortex:goal ;
mdp:instruction "1. Identify 3 external sources. 2. Distill to statements. 3. Validate via tool-call." .
```

### Step 2: Run ig-cli to Parse

```bash
ig-cli parse SEED.md
```

This generates the initial PROV-O graph with your goal and constraints.

### Step 3: Check SHACL Violations

```bash
ig-cli validate --graph output.ttl
```

You'll see violations like: "Activity `tag:vortex:boot` exists but has not generated an Entity."

### Step 4: Let the Agent Resolve Violations

The LLM agent reads violations and performs the first external activity (e.g., web search, file read) to resolve them. This generates new entities, which creates new violations, driving the vortex forward.

---

## Knowledge Scales and Scaling

The vortex operates across **three orthogonal scales** that enable proportional scaling as knowledge accumulates. Each scale serves a distinct purpose in the knowledge manifold.

### The Three Scales

| Scale | PROV-O Type | Physical Analogy | Vortex Function | Compression |
|-------|-------------|------------------|----------------|-------------|
| **Statement** | `rdf:Statement` | Atomic particles | Grounded facts (micro-flow) | 10x (highest) |
| **Collection** | `prov:Collection` | Streamline bundles | Organized knowledge groups (meso-flow) | 3x (medium) |
| **Document** | `prov:Entity` | Structural ribs | External sources (macro-flow) | 1x (base) |

### Scale Dynamics

**Statements (Micro-Flow)**:
- **Function**: Atomic, verifiable S-P-O facts
- **Velocity**: Low (high precision, low momentum)
- **Viscosity**: High (resistant to chaotic motion)
- **Purpose**: Foundational truth storage
- **SHACL Constraint**: Must have `rdf:subject`, `rdf:predicate`, `rdf:object`, `prov:wasGeneratedBy`

**Collections (Meso-Flow)**:
- **Function**: Grouped statements sharing common theme
- **Velocity**: Medium (guided flow)
- **Viscosity**: Medium (balanced structure)
- **Purpose**: Knowledge organization and batch processing
- **SHACL Constraint**: Must have `prov:hadMember` (minCount 1)

**Documents (Macro-Flow)**:
- **Function**: External sources (books, articles, web pages)
- **Velocity**: High (intake speed)
- **Viscosity**: Low (fluid intake)
- **Purpose**: Raw material intake
- **SHACL Constraint**: Must have `prov:hadPrimarySource`

### Proportional Scaling Rule

**Golden Ratio**: 10:3:1 (Statements:Collections:Documents)

As knowledge accumulates, the vortex maintains proportional scaling:

```
1 Document → 3 Collections → 10 Statements
```

**Why this ratio works**:
- **1 Document**: Single source of information
- **3 Collections**: Three thematic groupings (e.g., definitions, examples, applications)
- **10 Statements**: Ten specific facts extracted from those themes

**Compression Formula**:
```
Compression Ratio = (Statements × 10) + (Collections × 3) + (Documents × 1)
```

Optimal range: **3-7** (balanced knowledge density)

### Scaling Workflow

**Phase 1: Statement Accumulation**
```markdown
# Individual Statements
{=tag:stmt:fact_001 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" ;
prov:wasGeneratedBy tag:act:validate_001 .

{=tag:stmt:fact_002 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "entanglement" ;
prov:wasGeneratedBy tag:act:validate_001 .

# ... more statements accumulate
```

**Phase 2: Collection Grouping**
```markdown
# Collection of Related Statements
{=tag:coll:qubit_properties .prov:Collection}
prov:hadMember tag:stmt:fact_001 ;
prov:hadMember tag:stmt:fact_002 ;
prov:hadMember tag:stmt:fact_003 ;
prov:wasGeneratedBy tag:act:group_001 ;
rdfs:label "Qubit quantum properties" .
```

**Phase 3: Document Consolidation**
```markdown
# Document Full Content (Tool Call Generated)
{=tag:doc:quantum_summary .prov:Entity}
rdfs:label "Quantum Computing Summary" ;
prov:hadPrimarySource <https://arxiv.org/abs/quantum-2024> ;
prov:generatedAtTime "2026-02-24T12:00:00Z"^^xsd:dateTime ;
mdp:content """
# Quantum Computing Summary

## Qubit Properties
- Qubits exhibit superposition (fact_001)
- Qubits exhibit entanglement (fact_002)
- Qubits enable quantum parallelism (fact_003)

## Applications
- Cryptography
- Drug discovery
- Climate modeling
""" .
```

**Key Insight**: The full document content can be generated via a **tool call** that aggregates all statements and collections into a coherent document. The tool call:
1. Queries all statements in the collection
2. Organizes them by theme
3. Generates human-readable markdown
4. Stores as `prov:Entity` with `mdp:content` property

### Scale Transition Rules

**Upward Scaling (Statements → Collections → Documents)**:
1. **Statements** accumulate until threshold (e.g., 10 statements)
2. **Agent** groups them into a **Collection** based on theme
3. **Collections** accumulate until threshold (e.g., 3 collections)
4. **Agent** consolidates them into a **Document** via tool call

**Downward Scaling (Documents → Collections → Statements)**:
1. **Document** is parsed into **Collections** (thematic extraction)
2. **Collections** are distilled into **Statements** (S-P-O extraction)
3. Each **Statement** is validated with external source

**Lateral Scaling (Cross-Reference)**:
- **Statements** can belong to multiple **Collections**
- **Collections** can reference multiple **Documents**
- **Documents** can share **Statements** (via `prov:alternateOf`)

### SHACL Constraints for Scaling

**Statement Scale**:
```turtle
{=tag:shapes:StatementScale .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path rdf:subject ;
    sh:minCount 1 ;
    sh:message "Statement must have subject"
] ;
sh:property [
    sh:path rdf:predicate ;
    sh:minCount 1 ;
    sh:message "Statement must have predicate"
] ;
sh:property [
    sh:path rdf:object ;
    sh:minCount 1 ;
    sh:message "Statement must have object"
] ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Statement must be generated by activity"
] .
```

**Collection Scale**:
```turtle
{=tag:shapes:CollectionScale .sh:NodeShape}
sh:targetClass prov:Collection ;
sh:property [
    sh:path prov:hadMember ;
    sh:minCount 1 ;
    sh:message "Collection must have at least one member"
] ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Collection must be generated by activity"
] ;
sh:property [
    sh:path rdfs:label ;
    sh:minCount 1 ;
    sh:message "Collection must have label"
] .
```

**Document Scale**:
```turtle
{=tag:shapes:DocumentScale .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:hadPrimarySource ;
    sh:minCount 1 ;
    sh:message "Document must have primary source"
] ;
sh:property [
    sh:path mdp:content ;
    sh:minCount 1 ;
    sh:message "Document must have content"
] .
```

### Scaling Health Metrics

**Compression Ratio Check**:
```sparql
SELECT ?compression_health WHERE {
  {
    SELECT (COUNT(?stmt) AS ?stmt_count)
           (COUNT(?coll) AS ?coll_count)
           (COUNT(?doc) AS ?doc_count) WHERE {
      ?stmt a rdf:Statement .
      ?coll a prov:Collection .
      ?doc a prov:Entity ; prov:hadPrimarySource ?source .
    }
  }
  BIND(?stmt_count / ?doc_count AS ?ratio)
  BIND(
    IF(?ratio < 2.0, "Under-processed - Extract more statements",
    IF(?ratio > 10.0, "Over-solidified - Group into collections",
    "Optimal scaling - 10:3:1 ratio maintained"
  )) AS ?compression_health)
}
```

**Scale Balance Check**:
```sparql
SELECT ?scale_balance WHERE {
  {
    SELECT (COUNT(?stmt) AS ?stmt_count)
           (COUNT(?coll) AS ?coll_count)
           (COUNT(?doc) AS ?doc_count) WHERE {
      ?stmt a rdf:Statement .
      ?coll a prov:Collection .
      ?doc a prov:Entity ; prov:hadPrimarySource ?source .
    }
  }
  BIND(
    IF(?stmt_count < 10, "Too few statements - Extract more facts",
    IF(?coll_count < 3, "Too few collections - Group statements",
    IF(?doc_count < 1, "No documents - Need external sources",
    "Balanced scales - Optimal vortex structure"
  ))) AS ?scale_balance)
}
```

### Tool Call for Document Generation

To maintain full document content while scaling:

```bash
# Agent tool call to generate document
ig-cli generate-document \
  --collections tag:coll:qubit_properties \
  --output quantum_summary.md \
  --format markdown
```

This tool:
1. Queries all statements in the collection
2. Organizes them by theme
3. Generates human-readable markdown
4. Creates `prov:Entity` with `mdp:content` property
5. Links to original sources via `prov:hadPrimarySource`

**Result**: Full document content is preserved and accessible, while maintaining the structured provenance chain.

---

## System Goal and Completion Criteria

### What the System Does

**Input → Process → Output**:

```
[Defined Goal] + [Unstructured Documents] → [DIAD Cycle] → [Grounded Knowledge Document]
```

**Not**: Take unstructured documents without a goal and output a document.

**Yes**: Start with a defined goal, ingest unstructured documents, process them through the vortex, and output grounded knowledge that satisfies the goal.

### Goal Definition

Every vortex begins with a **goal entity** in SEED.md:

```markdown
{=tag:vortex:goal .prov:Entity}
rdfs:label "Build verifiable knowledge base about quantum computing" ;
mdp:desiredState "All facts grounded with primary sources and organized into coherent document" .
```

**Goal Components**:
- **`rdfs:label`**: Human-readable goal description
- **`mdp:desiredState`**: Machine-checkable completion criteria
- **Optional**: `mdp:threshold` (minimum statements required), `mdp:deadline` (time constraint)

### Goal Completion Criteria

A goal is **reached** when all five conditions are satisfied:

#### 1. Temporal Boundary (Closure)

**Condition**: Final activity has `prov:endedAtTime`

```sparql
SELECT ?goal ?completion_time WHERE {
  ?goal a prov:Entity ; mdp:desiredState ?state .
  ?activity prov:wasDerivedFrom* ?goal ;
           prov:endedAtTime ?completion_time .
  FILTER NOT EXISTS {
    ?next_activity prov:wasInformedBy ?activity ;
                   prov:startedAtTime ?next_start .
    FILTER(?next_start > ?completion_time)
  }
}
```

**Meaning**: No more activities are being generated. The vortex has stopped spinning.

---

#### 2. Causal Completeness (Traceability)

**Condition**: Result entity traces to initial goal via `prov:wasDerivedFrom*`

```sparql
SELECT ?goal ?result WHERE {
  ?goal a prov:Entity ; mdp:desiredState ?state .
  ?result prov:wasDerivedFrom* ?goal .
  FILTER EXISTS {
    ?result prov:wasGeneratedBy ?activity .
    ?activity prov:hadPlan ?plan .
    ?plan prov:wasDerivedFrom ?goal .
  }
}
```

**Meaning**: Every result can be traced back to the original goal through a chain of plans and activities.

---

#### 3. Semantic Satisfaction (Goal Match)

**Condition**: Result satisfies `mdp:desiredState` from goal

```sparql
SELECT ?goal ?result ?satisfaction WHERE {
  ?goal a prov:Entity ;
        mdp:desiredState ?desired_state .
  ?result prov:wasDerivedFrom* ?goal ;
          prov:satisfies ?desired_state .
  BIND("SATISFIED" AS ?satisfaction)
}
```

**Meaning**: The result actually meets the criteria specified in `mdp:desiredState`.

**Example**: If goal is "All facts grounded with primary sources," then every statement in the result must have `prov:hadPrimarySource`.

---

#### 4. Zero Violations (Frozen Vortex)

**Condition**: All SHACL constraints pass

```bash
ig-cli validate --graph output.ttl
# Expected: 0 violations
```

**Meaning**: The vortex has achieved a "frozen state" where no pressure differentials exist. All entities are properly grounded, all activities have generated results, and all plans are satisfied.

---

#### 5. Optimal Compression (Knowledge Density)

**Condition**: Compression ratio in 3-7 range

```sparql
SELECT ?compression_health WHERE {
  {
    SELECT (COUNT(?stmt) AS ?stmt_count)
           (COUNT(?doc) AS ?doc_count) WHERE {
      ?stmt a rdf:Statement .
      ?doc a prov:Entity ; prov:hadPrimarySource ?source .
    }
  }
  BIND(?stmt_count / ?doc_count AS ?ratio)
  BIND(
    IF(?ratio >= 3.0 && ?ratio <= 7.0, "OPTIMAL",
    IF(?ratio < 3.0, "UNDER_PROCESSED",
    "OVER_PROCESSED"
  )) AS ?compression_health)
}
```

**Meaning**: Knowledge has been properly distilled from documents into statements and organized into collections.

---

### Goal Completion Example

**Goal**: Create verifiable list of Spanish-speaking countries

**Initial State**:
```markdown
{=tag:goal:spanish_countries .prov:Entity}
rdfs:label "Create verifiable list of Spanish-speaking countries" ;
mdp:desiredState "All countries have ISO codes and population data with primary sources" .
```

**Processing**:
1. **Intake**: Web search for "Spanish-speaking countries"
2. **Analysis**: Extract country names from results
3. **Validation**: API call to verify ISO codes and population
4. **Grounding**: Generate statements for each country

**Completion Check**:
```sparql
# Check if goal is satisfied
SELECT ?goal ?result ?satisfaction WHERE {
  ?goal a prov:Entity ;
        mdp:desiredState "All countries have ISO codes and population data with primary sources" .
  ?result prov:wasDerivedFrom* ?goal ;
          prov:hadMember ?country .
  ?country a rdf:Statement ;
           rdf:subject ?country_name ;
           rdf:predicate tag:pred:hasISOCode ;
           rdf:object ?iso_code ;
           prov:hadPrimarySource ?source .
  FILTER NOT EXISTS {
    ?country a rdf:Statement .
    FILTER NOT EXISTS {
      ?country prov:hadPrimarySource ?source .
    }
  }
  BIND("SATISFIED" AS ?satisfaction)
}
```

**Final Output Document**:
```markdown
{=tag:doc:spanish_countries .prov:Entity}
rdfs:label "Spanish-Speaking Countries" ;
mdp:content """
# Spanish-Speaking Countries

## Argentina
- ISO Code: AR
- Population: 45,810,000
- Source: https://www.worldbank.org

## Bolivia
- ISO Code: BO
- Population: 11,673,000
- Source: https://www.worldbank.org

[... 19 more countries ...]
""" ;
prov:satisfiedBy tag:goal:spanish_countries .
```

### Goal Scaling

As knowledge accumulates, goals can be **refined** or **expanded**:

**Goal Refinement**:
```markdown
# Original Goal
{=tag:goal:v1 .prov:Entity}
rdfs:label "Research quantum computing" ;
mdp:desiredState "10 grounded statements about qubits" .

# Refined Goal
{=tag:goal:v2 .prov:Entity}
prov:wasDerivedFrom tag:goal:v1 ;
rdfs:label "Research quantum computing applications" ;
mdp:desiredState "50 grounded statements about quantum algorithms" .
```

**Goal Expansion**:
```markdown
# Sub-Goal
{=tag:goal:sub .prov:Entity}
prov:wasDerivedFrom tag:goal:main ;
rdfs:label "Quantum cryptography research" ;
mdp:desiredState "20 grounded statements about quantum encryption" .
```

### Goal Failure Modes

**Incomplete Goal**:
- Symptom: Activities continue generating new statements
- Cause: `mdp:desiredState` too vague or threshold not met
- Solution: Refine goal criteria or increase statement threshold

**Stagnant Goal**:
- Symptom: No new activities for 24 hours
- Cause: All statements used, no external sources remaining
- Solution: Add new external sources or expand goal scope

**Over-Processed Goal**:
- Symptom: Compression ratio > 10
- Cause: Too many statements per document
- Solution: Group statements into collections and consolidate to documents

---

## Part 1: Vortex Initiation

### The Four Quadrupole Forces

The vortex achieves self-propulsion through pressure differentials in four quadrants. Each quadrant has a specific SHACL constraint that creates a "vacuum" the agent must fill.

#### Quadrant 1: Intake Pressure (External Entity → Internal Knowledge)

**Force**: **Distillation**

**SHACL Rule**: Any `prov:Entity` marked as external is "unstable" until a `prov:specializationOf` link creates a grounded `rdf:Statement`.

**PROV-O Predicate**: `prov:specializationOf`

**Force Explanation**: External documents are high-entropy, low-precision information. The `specializationOf` constraint forces the agent to distill raw documents into precise, atomic statements. This creates a pressure gradient from "many facts in one document" to "one fact in one statement."

**Agent Action**: When encountering an external document, the agent must extract at least one S-P-O statement before moving on.

---

#### Quadrant 2: Cognitive Pressure (Internal Knowledge → Internal Activity)

**Force**: **Inference**

**SHACL Rule**: Any `rdf:Statement` not marked as `prov:used` by an `Activity` for more than N cycles is flagged as "Stagnant."

**PROV-O Predicate**: `prov:used`

**Force Explanation**: Knowledge without use is stagnation. The `used` constraint creates cognitive pressure to "think about what you know." Each statement must either be used to derive new knowledge or archived.

**Agent Action**: Query for unused statements and either:
- Use them to generate new activities (inference)
- Archive them with `prov:wasDerivedFrom` to a collection (storage)

---

#### Quadrant 3: Execution Pressure (Internal Activity → External Tool)

**Force**: **Validation**

**SHACL Rule**: A `prov:Plan` cannot be marked "In Progress" unless it triggers a `prov:Activity` with a non-LLM `mdp:tool` (External).

**PROV-O Predicate**: `prov:hadPlan` + `prov:qualifiedAssociation`

**Force Explanation**: Internal reasoning without external validation is hallucination. The `hadPlan` constraint forces activities to be authorized, and `qualifiedAssociation` requires a tool (web search, file read, API call) rather than pure LLM generation.

**Agent Action**: Before executing a plan, verify it includes at least one external tool call.

---

#### Quadrant 4: Grounding Pressure (External Activity → Internal Entity)

**Force**: **Solidification**

**SHACL Rule**: Every Tool-Call Activity must generate an Entity, or it violates "Law of Conservation of Information."

**PROV-O Predicate**: `prov:wasGeneratedBy`

**Force Explanation**: Information cannot be created from nothing. Every external activity must produce at least one grounded entity. This prevents "disappearing work" where agents perform actions but record no results.

**Agent Action**: After every tool call, generate at least one `rdf:Statement` with `prov:wasGeneratedBy` pointing to the activity.

---

### The Ignition Sequence

1. **SEED.md** defines the Goal (vacuum center) and SHACL shapes (pressure field)
2. **ig-cli parse** converts MDLD to PROV-O graph
3. **SHACL validation** detects violations (pressure differentials)
4. **Agent resolves violations** by performing activities
5. **New entities** create new violations (self-induction)
6. **Vortex achieves self-propagation**

---

## Part 2: Vortex Propulsion (DIAD Cycle)

### Phase 1: Document Intake (Bottom Left)

**Physical Analogy**: Inlet flow - high-velocity, low-precision information enters the vortex.

**PROV-O Predicates in Phase Transition**:

| Predicate | Force Direction | Explanation |
|-----------|----------------|-------------|
| `prov:hadPrimarySource` | External → Internal | Links document to authoritative source (URL, file, conversation). This is the "inlet valve" that allows information to enter the vortex. |
| `prov:wasDerivedFrom` | Document → Collection | When you extract facts from a document, the collection is "derived from" the source. This creates the pressure gradient from raw to processed. |

**Agent Workflow**:

```markdown
# Document Intake
{=tag:doc:research_001 .prov:Entity}
rdfs:label "Research paper on quantum computing" ;
prov:hadPrimarySource <https://arxiv.org/abs/quantum-2024> ;
prov:generatedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:DocumentIntake .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:hadPrimarySource ;
    sh:minCount 1 ;
    sh:pattern "^https?://" ;
    sh:message "Document must have HTTP/HTTPS source"
] .
```

**Phase Transition Force**: The `hadPrimarySource` constraint creates a "suction" that pulls external information into the vortex. Without a source, the document cannot exist.

---

### Phase 2: Internal Analysis (Bottom Right)

**Physical Analogy**: Vortex core - low-velocity, high-precision processing.

**PROV-O Predicates in Phase Transition**:

| Predicate | Force Direction | Explanation |
|-----------|----------------|-------------|
| `prov:used` | Entity → Activity | Activity "inhales" entities. This is the mass transfer from external documents to internal processing. |
| `prov:hadPlan` | Activity → Plan | Every activity must follow a plan. This is the "orifice plate" that constrains flow direction. |
| `prov:qualifiedAssociation` | Activity → Agent | Links activity to responsible agent. This is the "plasma" carrying energy through the vortex. |

**Agent Workflow**:

```markdown
# Internal Analysis
{=tag:act:extract_001 .prov:Activity}
prov:startedAtTime "2026-02-24T10:30:00Z"^^xsd:dateTime ;
prov:used tag:doc:research_001 ;
prov:hadPlan tag:vortex:plan_v1 ;
prov:qualifiedAssociation [
    prov:hadPlan tag:vortex:plan_v1 ;
    prov:agent tag:agent:llm_processor
] .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:InternalAnalysis .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:used ;
    sh:minCount 1 ;
    sh:message "Activity must inhale at least one entity"
] ;
sh:property [
    sh:path prov:hadPlan ;
    sh:minCount 1 ;
    sh:message "Activity must follow a plan"
] .
```

**Phase Transition Force**: The `used` constraint creates "mass transfer pressure" - activities cannot exist without consuming entities. The `hadPlan` constraint creates "directional pressure" - activities must follow authorized paths.

---

### Phase 3: External Validation (Top Right)

**Physical Analogy**: Propulsion jet - high-velocity discharge to external world.

**PROV-O Predicates in Phase Transition**:

| Predicate | Force Direction | Explanation |
|-----------|----------------|-------------|
| `prov:wasInformedBy` | Activity → Activity | Sequential influence without direct use. This is the "wake" that one activity leaves for the next. |
| `prov:qualifiedUsage` | Activity → Entity | Detailed consumption tracking. This is the "fuel gauge" showing exactly what was consumed. |
| `mdp:tool` | Activity → External | Links activity to external tool (web search, API, file). This is the "exhaust valve" that validates internal knowledge. |

**Agent Workflow**:

```markdown
# External Validation
{=tag:act:validate_001 .prov:Activity}
prov:startedAtTime "2026-02-24T11:00:00Z"^^xsd:dateTime ;
prov:wasInformedBy tag:act:extract_001 ;
prov:qualifiedUsage [
    prov:entity tag:doc:research_001 ;
    prov:role "source_material"
] ;
mdp:tool "web_search" ;
mdp:query "quantum computing qubits superposition" .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:ExternalValidation .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path mdp:tool ;
    sh:minCount 1 ;
    sh:in ( "web_search" "api_call" "file_read" "bash_command" ) ;
    sh:message "Activity must use external tool"
] .
```

**Phase Transition Force**: The `mdp:tool` constraint creates "validation pressure" - internal reasoning must touch the external world. This prevents hallucination by requiring tool use.

---

### Phase 4: Grounding (Top Left)

**Physical Analogy**: Solidified truth - low-velocity, high-precision knowledge storage.

**PROV-O Predicates in Phase Transition**:

| Predicate | Force Direction | Explanation |
|-----------|----------------|-------------|
| `prov:wasGeneratedBy` | Entity → Activity | Entity "exhales" from activity. This is the mass transfer from external action to internal truth. |
| `rdf:subject/predicate/object` | Statement components | Atomic S-P-O structure. This is the "crystal lattice" of grounded knowledge. |
| `prov:generatedAtTime` | Entity → Time | Timestamps knowledge. This is the "temporal coordinate" in the manifold. |

**Agent Workflow**:

```markdown
# Grounded Statement
{=tag:stmt:fact_001 .rdf:Statement .prov:Entity}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" ;
prov:wasGeneratedBy tag:act:validate_001 ;
prov:generatedAtTime "2026-02-24T11:05:00Z"^^xsd:dateTime .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:Grounding .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path rdf:subject ;
    sh:minCount 1 ;
    sh:message "Statement must have subject"
] ;
sh:property [
    sh:path rdf:predicate ;
    sh:minCount 1 ;
    sh:message "Statement must have predicate"
] ;
sh:property [
    sh:path rdf:object ;
    sh:minCount 1 ;
    sh:message "Statement must have object"
] ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Statement must be generated by activity"
] .
```

**Phase Transition Force**: The `wasGeneratedBy` constraint creates "solidification pressure" - every activity must produce at least one grounded statement. This is the "conservation of information" law.

---

### Phase 5: Goal Completion (Center)

**Physical Analogy**: Frozen vortex state - zero violations, complete knowledge grounding.

**PROV-O Predicates in Phase Transition**:

| Predicate | Force Direction | Explanation |
|-----------|----------------|-------------|
| `prov:satisfied` | Goal → Result | Goal is achieved when result satisfies desired state. This is the "equilibrium condition." |
| `prov:endedAtTime` | Activity → Time | Activity completion. This is the "closure condition" for the vortex turn. |

**Agent Workflow**:

```markdown
# Goal Completion Check
{=tag:vortex:goal .prov:Entity}
mdp:desiredState "All facts grounded with primary sources" ;
prov:satisfiedBy tag:stmt:fact_001 .

{=tag:act:completion .prov:Activity}
prov:endedAtTime "2026-02-24T12:00:00Z"^^xsd:dateTime ;
prov:generated tag:stmt:fact_001 .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:GoalCompletion .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path mdp:desiredState ;
    sh:minCount 1 ;
    sh:message "Goal must have desired state"
] ;
sh:property [
    sh:path prov:satisfiedBy ;
    sh:minCount 1 ;
    sh:message "Goal must be satisfied by result"
] .
```

**Phase Transition Force**: The `satisfiedBy` constraint creates "completion pressure" - the vortex cannot stop until the goal is achieved. This is the "thermodynamic drive" toward equilibrium.

---

## Part 3: Vortex Steering

### Steering via SHACL Shape Modification

To change direction without erasing history:

1. **Add new constraint** to SEED.md
2. **Run ig-cli parse** to update graph
3. **Check SHACL violations** for new pressure points
4. **Agent adapts** to new constraints

**Example: Steer toward API validation**

```markdown
# Add to SEED.md
{=tag:shapes:APIValidation .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path mdp:tool ;
    sh:in ( "api_call" ) ;
    sh:minCount 1 ;
    sh:message "Must use API call for validation"
] .
```

### Steering via Plan Bifurcation

To fork the vortex:

```markdown
# New Plan from Existing Result
{=tag:vortex:plan_v2 .prov:Plan}
prov:wasDerivedFrom tag:stmt:fact_001 ;
mdp:instruction "Validate fact via API call instead of web search" .
```

This creates a new "orifice plate" without closing the old one, allowing parallel exploration.

---

## Part 4: Vortex Regulation

### Compression Ratio Control

**Formula**: `R = Statements / Documents`

**Optimal Range**: 3-7 (balanced knowledge density)

**Adjustment Rules**:
- **R < 2**: "Increase viscosity" - be more selective, process deeper
- **R > 10**: "Decrease viscosity" - process more broadly, less depth

**SPARQL Query**:

```sparql
SELECT ?compression_health WHERE {
  {
    SELECT (COUNT(?stmt) AS ?stmt_count) (COUNT(?doc) AS ?doc_count) WHERE {
      ?stmt a rdf:Statement .
      ?doc a prov:Entity ; prov:hadPrimarySource ?source .
    }
  }
  BIND(?stmt_count / ?doc_count AS ?ratio)
  BIND(
    IF(?ratio < 2.0, "Under-processed - Increase viscosity",
    IF(?ratio > 10.0, "Over-solidified - Decrease viscosity",
    "Optimal compression"
  )) AS ?compression_health)
}
```

### Viscosity Adjustment

**Reynolds Number**: `Re = (ρ × v × L) / μ`

Where:
- `ρ` = Information density (entities per document)
- `v` = Agent activity velocity (activities per hour)
- `L` = Plan complexity (number of constraints)
- `μ` = System viscosity (resistance to flow)

**Regulation Rules**:
- **Re > 100** (High turbulence): Increase μ (add more SHACL constraints)
- **Re < 1** (Stagnation): Decrease μ (remove constraints, allow faster flow)
- **Re ≈ 10** (Optimal): Maintain current μ

**Implementation**:

```markdown
# Adaptive Viscosity Constraint
{=tag:shapes:AdaptiveViscosity .sh:NodeShape}
sh:targetClass prov:Plan ;
sh:property [
    sh:path mdp:adaptiveViscosity ;
    sh:datatype xsd:boolean ;
    sh:value true ;
    sh:description "Enable automatic viscosity adjustment"
] .
```

### Health Monitoring

**Daily Audit (3 Questions)**:

1. **Is it Tethered?** Does every entity trace to a goal via `prov:wasDerivedFrom`?
2. **Is it Grounded?** Is every statement a verifiable S-P-O with source?
3. **Is it Pushing?** Does every result suggest the next activity?

**SPARQL Health Check**:

```sparql
# Check for orphaned entities
SELECT ?entity WHERE {
  ?entity a prov:Entity .
  FILTER NOT EXISTS {
    ?entity prov:wasDerivedFrom* ?goal .
    ?goal a prov:Entity ; mdp:desiredState ?state .
  }
}

# Check for ungrounded activities
SELECT ?activity WHERE {
  ?activity a prov:Activity .
  FILTER NOT EXISTS {
    ?entity prov:wasGeneratedBy ?activity .
    ?entity a rdf:Statement .
  }
}
```

---

## Part 5: Complete PROV-O Predicate Reference

### Core Classes

| Class | Physical Analogy | Function |
|-------|-----------------|----------|
| `prov:Entity` | Mass | Knowledge objects, statements, collections |
| `prov:Activity` | Momentum | Transformations, actions, processing |
| `prov:Agent` | Plasma | Energy carrier (human, LLM, tool) |
| `prov:Plan` | Orifice Plate | Constraint boundaries, flow shaping |

### Predicates by Phase

#### Document Intake Phase

| Predicate | Direction | Force Type | SHACL Constraint |
|-----------|-----------|------------|------------------|
| `prov:hadPrimarySource` | External → Internal | Suction | Must match HTTP/HTTPS pattern |
| `prov:wasDerivedFrom` | Document → Collection | Distillation | Required for all collections |
| `prov:generatedAtTime` | Entity → Time | Temporal | Required for all entities |

#### Internal Analysis Phase

| Predicate | Direction | Force Type | SHACL Constraint |
|-----------|-----------|------------|------------------|
| `prov:used` | Entity → Activity | Mass Transfer | minCount 1 |
| `prov:hadPlan` | Activity → Plan | Directional | minCount 1 |
| `prov:qualifiedAssociation` | Activity → Agent | Plasma | Required for all activities |
| `prov:startedAtTime` | Activity → Time | Temporal | Required for all activities |

#### External Validation Phase

| Predicate | Direction | Force Type | SHACL Constraint |
|-----------|-----------|------------|------------------|
| `prov:wasInformedBy` | Activity → Activity | Wake | Optional but recommended |
| `prov:qualifiedUsage` | Activity → Entity | Fuel Gauge | Optional for tracking |
| `mdp:tool` | Activity → External | Exhaust | Must be external tool |
| `mdp:query` | Activity → String | Parameter | Required for web search |

#### Grounding Phase

| Predicate | Direction | Force Type | SHACL Constraint |
|-----------|-----------|------------|------------------|
| `prov:wasGeneratedBy` | Entity → Activity | Solidification | minCount 1 |
| `rdf:subject` | Statement → Entity | Crystal | minCount 1 |
| `rdf:predicate` | Statement → Entity | Crystal | minCount 1 |
| `rdf:object` | Statement → Entity | Crystal | minCount 1 |
| `prov:generatedAtTime` | Entity → Time | Temporal | Required for all entities |

#### Goal Completion Phase

| Predicate | Direction | Force Type | SHACL Constraint |
|-----------|-----------|------------|------------------|
| `prov:satisfiedBy` | Goal → Result | Equilibrium | minCount 1 |
| `prov:endedAtTime` | Activity → Time | Closure | Required for completion |

### Advanced Predicates

| Predicate | Use Case | Force Type |
|-----------|----------|------------|
| `prov:specializationOf` | Document → Statement | Distillation pressure |
| `prov:alternateOf` | Multiple representations | Topological flexibility |
| `prov:wasAttributedTo` | Entity → Agent | Responsibility tracking |
| `prov:wasAssociatedWith` | Activity → Agent | Association tracking |
| `prov:wasGeneratedBy` | Entity → Activity | Solidification |
| `prov:used` | Activity → Entity | Mass transfer |
| `prov:wasInformedBy` | Activity → Activity | Sequential influence |
| `prov:wasDerivedFrom` | Entity → Entity | Derivation chain |
| `prov:hadPrimarySource` | Entity → Source | Source grounding |
| `prov:qualifiedAssociation` | Activity → Association | Detailed association |
| `prov:qualifiedUsage` | Activity → Usage | Detailed usage |
| `prov:qualifiedGeneration` | Entity → Generation | Detailed generation |
| `prov:qualifiedDerivation` | Entity → Derivation | Detailed derivation |

---

## Part 5.5: Advanced PROV-O Features for Vortex Dynamics

The vortex system leverages advanced PROV-O features to capture nuanced knowledge relationships. These features enable precise tracking of quotations, knowledge evolution, decay, and hierarchical organization.

### 1. prov:wasQuotedFrom - Direct Quotation Tracking

**Purpose**: Track exact text quotations from sources to distinguish from paraphrased knowledge.

**Vortex Function**: Enables precise source attribution when extracting verbatim quotes from documents.

**Example**:

```markdown
# Original Document
{=tag:doc:research_paper .prov:Entity}
rdfs:label "Quantum Computing Research Paper" ;
prov:hadPrimarySource <https://arxiv.org/abs/quantum-2024> ;
mdp:content """
Quantum computers leverage superposition to process multiple states simultaneously.
""" .

# Verbatim Quote Statement
{=tag:stmt:quote_001 .rdf:Statement}
rdf:subject tag:concept:quantum_computer ;
rdf:predicate tag:pred:hasQuote ;
rdf:object "Quantum computers leverage superposition to process multiple states simultaneously." ;
prov:wasQuotedFrom tag:doc:research_paper ;
prov:generatedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime .

# Paraphrased Statement (for comparison)
{=tag:stmt:paraphrase_001 .rdf:Statement}
rdf:subject tag:concept:quantum_computer ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" ;
prov:wasDerivedFrom tag:doc:research_paper ;
prov:generatedAtTime "2026-02-24T10:05:00Z"^^xsd:dateTime .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:QuotationTracking .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path prov:wasQuotedFrom ;
    sh:nodeKind sh:IRI ;
    sh:message "Quotation must reference source document"
] ;
sh:property [
    sh:path rdf:object ;
    sh:pattern "^\".*\"$" ;
    sh:message "Quoted text must be in quotes"
] .
```

**Phase**: Grounding Phase (Top Left) - Distinguishes verbatim quotes from paraphrased knowledge.

---

### 2. Nested Collections - Hierarchical Organization

**Purpose**: Organize collections within collections to create hierarchical knowledge structures.

**Vortex Function**: Enables multi-scale knowledge organization (statements → sub-collections → parent collections → documents).

**Example**:

```markdown
# Individual Statements
{=tag:stmt:fact_001 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" .

{=tag:stmt:fact_002 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "entanglement" .

# Sub-Collection: Qubit Properties
{=tag:coll:qubit_properties .prov:Collection}
prov:hadMember tag:stmt:fact_001 ;
prov:hadMember tag:stmt:fact_002 ;
rdfs:label "Qubit quantum properties" .

# Sub-Collection: Qubit Applications
{=tag:coll:qubit_applications .prov:Collection}
prov:hadMember tag:stmt:fact_003 ;
prov:hadMember tag:stmt:fact_004 ;
rdfs:label "Qubit practical applications" .

# Parent Collection: Complete Qubit Knowledge
{=tag:coll:qubit_complete .prov:Collection}
prov:hadMember tag:coll:qubit_properties ;
prov:hadMember tag:coll:qubit_applications ;
rdfs:label "Complete qubit knowledge base" ;
prov:wasGeneratedBy tag:act:consolidate_001 .

# Document: Full Content
{=tag:doc:quantum_summary .prov:Entity}
prov:hadMember tag:coll:qubit_complete ;
prov:hadPrimarySource <https://arxiv.org/abs/quantum-2024> ;
mdp:content """
# Quantum Computing Summary

## Qubit Properties
- Superposition
- Entanglement

## Applications
- Cryptography
- Drug discovery
""" .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:NestedCollections .sh:NodeShape}
sh:targetClass prov:Collection ;
sh:property [
    sh:path prov:hadMember ;
    sh:minCount 1 ;
    sh:message "Collection must have at least one member"
] ;
sh:property [
    sh:path [ sh:alternativePath (prov:hadMember rdf:Statement) ] ;
    sh:description "Members can be statements or collections"
] .
```

**Phase**: All phases - Enables hierarchical knowledge organization across scales.

---

### 3. prov:wasRevisionOf - Knowledge Evolution

**Purpose**: Track how knowledge evolves over time through revisions and refinements.

**Vortex Function**: Captures the iterative refinement process as statements are updated with new information.

**Example**:

```markdown
# Original Statement (v1)
{=tag:stmt:fact_v1 .rdf:Statement}
rdf:subject tag:concept:quantum_computer ;
rdf:predicate tag:pred:hasSpeedup ;
rdf:object "1000x faster than classical" ;
prov:generatedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:wasGeneratedBy tag:act:initial_research .

# Revised Statement (v2)
{=tag:stmt:fact_v2 .rdf:Statement}
rdf:subject tag:concept:quantum_computer ;
rdf:predicate tag:pred:hasSpeedup ;
rdf:object "1000x faster for specific algorithms" ;
prov:generatedAtTime "2026-02-24T14:00:00Z"^^xsd:dateTime ;
prov:wasGeneratedBy tag:act:validation_001 ;
prov:wasRevisionOf tag:stmt:fact_v1 ;
mdp:revisionReason "Clarified scope of speedup claim" .

# Revision Activity
{=tag:act:validation_001 .prov:Activity}
prov:startedAtTime "2026-02-24T13:30:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T14:00:00Z"^^xsd:dateTime ;
prov:used tag:stmt:fact_v1 ;
prov:hadPlan tag:plan:clarify_scope ;
prov:qualifiedAssociation [
    prov:hadPlan tag:plan:clarify_scope ;
    prov:agent tag:agent:llm_validator
] .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:RevisionTracking .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path prov:wasRevisionOf ;
    sh:nodeKind sh:IRI ;
    sh:message "Revision must reference previous version"
] ;
sh:property [
    sh:path mdp:revisionReason ;
    sh:minCount 1 ;
    sh:message "Revision must include reason for change"
] .
```

**Phase**: Internal Analysis → External Validation - Tracks knowledge refinement cycles.

---

### 4. prov:wasInvalidatedBy - Knowledge Decay

**Purpose**: Track when knowledge becomes obsolete or is proven incorrect.

**Vortex Function**: Enables cleanup of outdated knowledge while maintaining provenance of what was invalidated.

**Example**:

```markdown
# Original Statement (Later Found Incorrect)
{=tag:stmt:incorrect .rdf:Statement}
rdf:subject tag:concept:quantum_computer ;
rdf:predicate tag:pred:hasLimitation ;
rdf:object "Cannot factor large numbers" ;
prov:generatedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:wasInvalidatedBy tag:act:discovery_001 ;
mdp:invalidationReason "Shor's algorithm disproves this claim" ;
prov:invalidatedAtTime "2026-02-24T16:00:00Z"^^xsd:dateTime .

# Corrected Statement
{=tag:stmt:correct .rdf:Statement}
rdf:subject tag:concept:quantum_computer ;
rdf:predicate tag:pred:hasCapability ;
rdf:object "Can factor large numbers via Shor's algorithm" ;
prov:generatedAtTime "2026-02-24T16:00:00Z"^^xsd:dateTime ;
prov:wasGeneratedBy tag:act:discovery_001 ;
prov:wasDerivedFrom tag:stmt:incorrect .

# Discovery Activity
{=tag:act:discovery_001 .prov:Activity}
prov:startedAtTime "2026-02-24T15:30:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T16:00:00Z"^^xsd:dateTime ;
prov:used tag:stmt:incorrect ;
prov:hadPlan tag:plan:research_shor ;
mdp:tool "web_search" ;
mdp:query "Shor's algorithm factoring capabilities" .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:InvalidationTracking .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path prov:wasInvalidatedBy ;
    sh:nodeKind sh:IRI ;
    sh:message "Invalidation must reference activity"
] ;
sh:property [
    sh:path mdp:invalidationReason ;
    sh:minCount 1 ;
    sh:message "Invalidation must include reason"
] ;
sh:property [
    sh:path prov:invalidatedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:message "Invalidation must have timestamp"
] .
```

**Phase**: External Validation → Grounding - Marks knowledge as obsolete while preserving provenance.

---

### 5. prov:wasAssociatedWith - Passive Observation

**Purpose**: Track agents who were present during activities but not directly responsible.

**Vortex Function**: Captures observational roles (e.g., human reviewer monitoring AI agent).

**Example**:

```markdown
# AI Agent Activity
{=tag:act:research .prov:Activity}
prov:startedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T11:00:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:research ;
prov:qualifiedAssociation [
    prov:hadPlan tag:plan:research ;
    prov:agent tag:agent:llm_researcher ;
    prov:role "primary_executor"
] ;
prov:wasAssociatedWith tag:agent:human_reviewer ;
mdp:observationNote "Human monitored for accuracy" .

# Human Reviewer Agent
{=tag:agent:human_reviewer .prov:Agent}
rdfs:label "Human Knowledge Reviewer" ;
prov:actedOnBehalfOf tag:agent:human_primary .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:AssociationTracking .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasAssociatedWith ;
    sh:nodeKind sh:IRI ;
    sh:description "Optional: Track observers"
] .
```

**Phase**: All phases - Enables audit trails of who observed what.

---

### 6. prov:qualifiedGeneration - Multi-Role Attribution

**Purpose**: Capture detailed information about how entities were generated, including multiple roles.

**Vortex Function**: Enables precise tracking of entity generation with role-specific metadata.

**Example**:

```markdown
# Statement with Qualified Generation
{=tag:stmt:fact_001 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" ;
prov:qualifiedGeneration [
    a prov:Generation ;
    prov:activity tag:act:extract_001 ;
    prov:atTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
    prov:hadRole tag:role:knowledge_extraction ;
    prov:wasInfluencedBy tag:goal:research_quantum
] .

# Generation Activity
{=tag:act:extract_001 .prov:Activity}
prov:startedAtTime "2026-02-24T09:30:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:extract_facts ;
prov:used tag:doc:research_paper .

# Role Definition
{=tag:role:knowledge_extraction .prov:Role}
rdfs:label "Knowledge Extraction Role" ;
mdp:description "Extracts factual statements from documents" .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:QualifiedGeneration .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path prov:qualifiedGeneration ;
    sh:class prov:Generation ;
    sh:message "Generation must be qualified"
] ;
sh:property [
    sh:path prov:atTime ;
    sh:datatype xsd:dateTime ;
    sh:message "Generation must have timestamp"
] .
```

**Phase**: Grounding Phase - Provides detailed provenance for entity generation.

---

### 7. prov:wasInfluencedBy - Contextual Influence

**Purpose**: Track contextual influences on activities without direct use of entities.

**Vortex Function**: Captures how goals, deadlines, or external context shape activities.

**Example**:

```markdown
# Goal-Driven Activity
{=tag:act:urgent_research .prov:Activity}
prov:startedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T11:00:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:research ;
prov:used tag:doc:research_paper ;
prov:wasInfluencedBy tag:goal:urgent_deadline ;
mdp:influenceType "time_pressure" ;
mdp:influenceDescription "Deadline accelerated research pace" .

# Goal Entity
{=tag:goal:urgent_deadline .prov:Entity}
rdfs:label "Complete research by deadline" ;
mdp:deadline "2026-02-24T12:00:00Z"^^xsd:dateTime ;
mdp:desiredState "All facts extracted and validated" .

# Another Example: Contextual Influence
{=tag:act:market_analysis .prov:Activity}
prov:startedAtTime "2026-02-24T14:00:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:analyze_market ;
prov:used tag:doc:market_data ;
prov:wasInfluencedBy tag:context:market_trends ;
mdp:influenceType "market_context" ;
mdp:influenceDescription "Market downturn influenced analysis focus" .

# Context Entity
{=tag:context:market_trends .prov:Entity}
rdfs:label "Current Market Trends" ;
mdp:description "Bear market conditions in Q1 2026" .
```

**SHACL Constraint**:

```turtle
{=tag:shapes:InfluenceTracking .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasInfluencedBy ;
    sh:nodeKind sh:IRI ;
    sh:description "Optional: Track contextual influences"
] ;
sh:property [
    sh:path mdp:influenceType ;
    sh:in ( "time_pressure" "market_context" "resource_constraint" "goal_alignment" ) ;
    sh:description "Type of influence"
] .
```

**Phase**: All phases - Captures contextual factors shaping activities.

---

### Integration with Vortex Cycle

These advanced features integrate into the DIAD cycle as follows:

| Feature | Phase | Vortex Function |
|---------|-------|------------------|
| `prov:wasQuotedFrom` | Grounding | Distinguishes verbatim quotes from paraphrases |
| Nested Collections | All phases | Hierarchical knowledge organization |
| `prov:wasRevisionOf` | Analysis → Validation | Tracks knowledge refinement |
| `prov:wasInvalidatedBy` | Validation → Grounding | Marks obsolete knowledge |
| `prov:wasAssociatedWith` | All phases | Observational audit trails |
| `prov:qualifiedGeneration` | Grounding | Detailed entity provenance |
| `prov:wasInfluencedBy` | All phases | Contextual influence tracking |

### SPARQL Queries for Advanced Features

**Find all quotations**:
```sparql
SELECT ?quote ?source WHERE {
  ?quote a rdf:Statement ;
         prov:wasQuotedFrom ?source .
}
```

**Track knowledge evolution**:
```sparql
SELECT ?original ?revised ?reason WHERE {
  ?revised prov:wasRevisionOf ?original ;
          mdp:revisionReason ?reason .
}
```

**Find invalidated knowledge**:
```sparql
SELECT ?statement ?reason ?time WHERE {
  ?statement prov:wasInvalidatedBy ?activity ;
            mdp:invalidationReason ?reason ;
            prov:invalidatedAtTime ?time .
}
```

**Find nested collection hierarchy**:
```sparql
SELECT ?parent ?child ?grandchild WHERE {
  ?parent prov:hadMember ?child .
  ?child prov:hadMember ?grandchild .
}
```

---

## Part 5.6: Temporal PROV-O Dimension and Causality

The vortex system operates in **temporal space** where causality is enforced through SHACL constraints on temporal predicates. This ensures activities happen in the correct order and knowledge flows forward through time.

### Temporal PROV-O Predicates

| Predicate | Domain | Range | Purpose |
|-----------|--------|-------|---------|
| `prov:startedAtTime` | prov:Activity | xsd:dateTime | Activity start timestamp |
| `prov:endedAtTime` | prov:Activity | xsd:dateTime | Activity end timestamp |
| `prov:generatedAtTime` | prov:Entity | xsd:dateTime | Entity creation timestamp |
| `prov:invalidatedAtTime` | prov:Entity | xsd:dateTime | Entity invalidation timestamp |
| `prov:atTime` | prov:Generation/Usage | xsd:dateTime | Qualified relationship timestamp |

### Causality Through Temporal Ordering

**Principle**: Causality is enforced by ensuring temporal consistency across the vortex.

#### 1. Activity Duration Constraint

```turtle
{=tag:shapes:ActivityDuration .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:startedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Activity must have start time"
] ;
sh:property [
    sh:path prov:endedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Activity must have end time"
] .
```

**Temporal Logic**: `prov:endedAtTime` > `prov:startedAtTime`

```sparql
# Validate activity duration
SELECT ?activity ?start ?end WHERE {
  ?activity a prov:Activity ;
           prov:startedAtTime ?start ;
           prov:endedAtTime ?end .
  FILTER(?end <= ?start)
}
```

**Violation**: "Activity ends before it starts - time travel detected"

---

#### 2. Entity Generation Temporal Constraint

```turtle
{=tag:shapes:EntityGenerationTiming .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Entity must be generated by activity"
] .
```

**Temporal Logic**: Entity generation occurs during activity execution.

```sparql
# Validate entity generation timing
SELECT ?entity ?activity ?entity_time ?act_start ?act_end WHERE {
  ?entity prov:wasGeneratedBy ?activity ;
          prov:generatedAtTime ?entity_time .
  ?activity prov:startedAtTime ?act_start ;
           prov:endedAtTime ?act_end .
  FILTER(?entity_time < ?act_start || ?entity_time > ?act_end)
}
```

**Violation**: "Entity generated outside activity execution window"

---

#### 3. Causal Activity Sequencing

```turtle
{=tag:shapes:CausalSequencing .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasInformedBy ;
    sh:nodeKind sh:IRI ;
    sh:description "Optional: Track causal influence"
] .
```

**Temporal Logic**: If Activity B is informed by Activity A, then B must start after A ends.

```sparql
# Validate causal sequencing
SELECT ?activity_b ?activity_a ?start_b ?end_a WHERE {
  ?activity_b prov:wasInformedBy ?activity_a ;
              prov:startedAtTime ?start_b .
  ?activity_a prov:endedAtTime ?end_a .
  FILTER(?start_b < ?end_a)
}
```

**Violation**: "Activity starts before predecessor completes - causality violation"

---

#### 4. Entity Invalidation Temporal Constraint

```turtle
{=tag:shapes:InvalidationTiming .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:invalidatedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:message "Invalidation must have timestamp"
] ;
sh:property [
    sh:path prov:wasInvalidatedBy ;
    sh:minCount 1 ;
    sh:message "Invalidation must reference activity"
] .
```

**Temporal Logic**: Entity invalidation occurs after generation.

```sparql
# Validate invalidation timing
SELECT ?entity ?generated ?invalidated WHERE {
  ?entity prov:generatedAtTime ?generated ;
          prov:invalidatedAtTime ?invalidated .
  FILTER(?invalidated <= ?generated)
}
```

**Violation**: "Entity invalidated before generation - temporal paradox"

---

### Causality Chains in Vortex

The vortex enforces causality through temporal chains:

```
Activity A (10:00-10:30)
    ↓ prov:wasInformedBy
Activity B (10:35-11:00)
    ↓ prov:used
Entity C (10:45)
    ↓ prov:wasGeneratedBy
Entity D (10:50)
```

**Temporal Rules**:
1. **Activity B start** > **Activity A end** (causal sequencing)
2. **Entity C generation** ∈ [Activity B start, Activity B end] (generation window)
3. **Entity D generation** > **Entity C generation** (sequence)

---

### SHACL Constraints for Temporal Consistency

#### Temporal Consistency Shape

```turtle
{=tag:shapes:TemporalConsistency .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:startedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:message "Activity must have exactly one start time"
] ;
sh:property [
    sh:path prov:endedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:message "Activity must have exactly one end time"
] ;
sh:property [
    sh:path [ sh:inversePath prov:wasGeneratedBy ] ;
    sh:minCount 1 ;
    sh:message "Activity must generate at least one entity"
] .
```

#### Entity Temporal Shape

```turtle
{=tag:shapes:EntityTemporal .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:generatedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:message "Entity must have exactly one generation time"
] ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Entity must be generated by activity"
] .
```

---

### Temporal Vortex Dynamics

#### Vortex Propagation Through Time

The vortex moves forward through time with measurable velocity:

```
Vortex Velocity = (Activity Count) / (Time Duration)
```

**Example**:
- 10 activities in 1 hour = 10 activities/hour
- 50 activities in 1 hour = 50 activities/hour (high velocity)

#### Temporal Pressure Gradient

SHACL violations create temporal pressure:

```sparql
# Calculate temporal pressure
SELECT ?pressure WHERE {
  {
    SELECT (COUNT(?activity) AS ?count)
           (MAX(?end) - MIN(?start) AS ?duration) WHERE {
      ?activity a prov:Activity ;
               prov:startedAtTime ?start ;
               prov:endedAtTime ?end .
    }
  }
  BIND(?count / ?duration AS ?pressure)
}
```

**High pressure**: Many activities in short time → need more temporal constraints
**Low pressure**: Few activities in long time → vortex may stagnate

---

### Temporal Health Metrics

#### Activity Duration Distribution

```sparql
SELECT ?avg_duration ?min_duration ?max_duration WHERE {
  {
    SELECT AVG(?duration) AS ?avg_duration
           MIN(?duration) AS ?min_duration
           MAX(?duration) AS ?max_duration WHERE {
      {
        SELECT (?end - ?start) AS ?duration WHERE {
          ?activity a prov:Activity ;
                   prov:startedAtTime ?start ;
                   prov:endedAtTime ?end .
        }
      }
    }
  }
}
```

**Healthy range**: 5-60 minutes per activity
**Warning**: < 1 minute (too fast) or > 120 minutes (too slow)

#### Temporal Gap Detection

```sparql
SELECT ?gap_start ?gap_end ?gap_duration WHERE {
  ?activity_a a prov:Activity ;
              prov:endedAtTime ?gap_start .
  ?activity_b a prov:Activity ;
              prov:startedAtTime ?gap_end .
  FILTER NOT EXISTS {
    ?activity_c a prov:Activity ;
                prov:startedAtTime ?c_start ;
                prov:endedAtTime ?c_end .
    FILTER(?c_start > ?gap_start && ?c_end < ?gap_end)
  }
  FILTER(?gap_end > ?gap_start)
  BIND(?gap_end - ?gap_start AS ?gap_duration)
  FILTER(?gap_duration > 3600)  # Gaps > 1 hour
}
```

**Large gaps**: May indicate vortex stagnation or external blocking

---

### Temporal Vortex States

| State | Temporal Pattern | Meaning |
|-------|------------------|---------|
| **Active Propagation** | Continuous activity flow | Healthy vortex |
| **Temporal Stagnation** | No activities > 24 hours | Vortex stalled |
| **Temporal Turbulence** | Overlapping activities | Causality violations |
| **Temporal Equilibrium** | Balanced activity spacing | Optimal flow |

---

### SPARQL Queries for Temporal Analysis

**Find all time travel violations**:
```sparql
SELECT ?violation WHERE {
  {
    SELECT ?activity WHERE {
      ?activity a prov:Activity ;
               prov:startedAtTime ?start ;
               prov:endedAtTime ?end .
      FILTER(?end <= ?start)
    }
  }
  BIND("Time travel: Activity ends before it starts" AS ?violation)
}
```

**Find causality violations**:
```sparql
SELECT ?violation WHERE {
  {
    SELECT ?activity_b ?activity_a WHERE {
      ?activity_b prov:wasInformedBy ?activity_a ;
                  prov:startedAtTime ?start_b .
      ?activity_a prov:endedAtTime ?end_a .
      FILTER(?start_b < ?end_a)
    }
  }
  BIND("Causality: Activity starts before predecessor" AS ?violation)
}
```

**Find generation window violations**:
```sparql
SELECT ?violation WHERE {
  {
    SELECT ?entity ?activity WHERE {
      ?entity prov:wasGeneratedBy ?activity ;
              prov:generatedAtTime ?entity_time .
      ?activity prov:startedAtTime ?act_start ;
               prov:endedAtTime ?act_end .
      FILTER(?entity_time < ?act_start || ?entity_time > ?act_end)
    }
  }
  BIND("Generation: Entity created outside activity window" AS ?violation)
}
```

**Calculate vortex velocity**:
```sparql
SELECT ?velocity WHERE {
  {
    SELECT (COUNT(?activity) AS ?count)
           (MAX(?end) - MIN(?start) AS ?duration) WHERE {
      ?activity a prov:Activity ;
               prov:startedAtTime ?start ;
               prov:endedAtTime ?end .
    }
  }
  BIND(?count / ?duration AS ?velocity)
}
```

---

### Temporal SHACL Constraint Examples

#### Activity Duration Constraint

```turtle
{=tag:shapes:ActivityDuration .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:startedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Activity must have start time"
] ;
sh:property [
    sh:path prov:endedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Activity must have end time"
] .
```

#### Entity Generation Constraint

```turtle
{=tag:shapes:EntityGeneration .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:generatedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Entity must have generation time"
] ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Entity must be generated by activity"
] .
```

#### Causal Sequencing Constraint

```turtle
{=tag:shapes:CausalSequencing .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasInformedBy ;
    sh:description "Optional: Track causal influence"
] .
```

---

## Part 6: Practical Implementation

### Daily Vortex Operations

**Morning Routine**:

```bash
# 1. Parse all MDLD notes
ig-cli parse --dir ./notes --output today.ttl

# 2. Validate graph
ig-cli validate --graph today.ttl --violations violations.json

# 3. Check vortex health
ig-cli health --graph today.ttl --metrics health.json

# 4. Review violations
cat violations.json | jq '.[] | .message'
```

**Agent Response to Violations**:

```python
# Pseudocode for agent violation resolution
for violation in violations:
    if "Spontaneous activity" in violation.message:
        # Add plan to activity
        add_plan_to_activity(violation.entity)
    elif "Activity is a Sink" in violation.message:
        # Generate statement from activity
        generate_statement(violation.entity)
    elif "Orphaned Entity" in violation.message:
        # Use entity in new activity
        create_activity_using(violation.entity)
```

**Evening Audit**:

```bash
# Calculate compression ratio
ig-cli metrics --graph today.ttl --ratio

# Check for stagnant statements
ig-cli query --graph today.ttl --query "
  SELECT ?stmt WHERE {
    ?stmt a rdf:Statement .
    FILTER NOT EXISTS {
      ?activity prov:used ?stmt .
      ?activity prov:startedAtTime ?start .
      FILTER(?start > NOW() - 24HOURS)
    }
  }
"

# Verify goal progress
ig-cli query --graph today.ttl --query "
  SELECT ?goal ?progress WHERE {
    ?goal a prov:Entity ; mdp:desiredState ?state .
    ?result prov:wasDerivedFrom* ?goal .
    BIND(COUNT(?result) AS ?progress)
  }
"
```

### Multi-Agent Coordination

**Agent Roles**:

- **Intake Agent**: Processes external documents (Quadrant 1)
- **Analysis Agent**: Performs internal reasoning (Quadrant 2)
- **Validation Agent**: Executes external tools (Quadrant 3)
- **Grounding Agent**: Generates grounded statements (Quadrant 4)

**Coordination Protocol**:

```markdown
# Agent Handoff
{=tag:agent:intake .prov:Agent}
prov:actedOnBehalfOf tag:agent:human ;
prov:wasAssociatedWith tag:act:intake_001 .

{=tag:agent:analysis .prov:Agent}
prov:wasInformedBy tag:act:intake_001 ;
prov:wasAssociatedWith tag:act:analysis_001 .
```

### Error Recovery

**Scenario**: Agent hallucinates without tool use

**Detection**:
```sparql
SELECT ?activity WHERE {
  ?activity a prov:Activity .
  FILTER NOT EXISTS {
    ?activity mdp:tool ?tool .
  }
}
```

**Recovery**:
1. Add SHACL constraint requiring `mdp:tool`
2. Re-validate graph
3. Agent resolves violations by adding tool calls

**Scenario**: Orphaned entities accumulate

**Detection**:
```sparql
SELECT ?entity WHERE {
  ?entity a prov:Entity .
  FILTER NOT EXISTS {
    ?activity prov:used ?entity .
  }
}
```

**Recovery**:
1. Query for unused entities
2. Agent creates new activities to use them
3. Or archive with `prov:wasDerivedFrom` to collection

---

## Part 7: Advanced Techniques

### Vortex Bifurcation

To explore multiple directions simultaneously:

```markdown
# Original Plan
{=tag:vortex:plan_v1 .prov:Plan}
mdp:instruction "Validate via web search" .

# Bifurcated Plan
{=tag:vortex:plan_v2 .prov:Plan}
prov:wasDerivedFrom tag:vortex:plan_v1 ;
mdp:instruction "Validate via API call" .
```

Both plans can execute in parallel, creating two vortex filaments.

### Vortex Merging

To combine results from parallel filaments:

```markdown
# Collection from Plan v1
{=tag:coll:results_v1 .prov:Collection}
prov:hadMember tag:stmt:fact_001 ;
prov:hadMember tag:stmt:fact_002 .

# Collection from Plan v2
{=tag:coll:results_v2 .prov:Collection}
prov:hadMember tag:stmt:fact_003 ;
prov:hadMember tag:stmt:fact_004 .

# Merged Collection
{=tag:coll:merged .prov:Collection}
prov:wasDerivedFrom tag:coll:results_v1 ;
prov:wasDerivedFrom tag:coll:results_v2 ;
prov:hadMember tag:stmt:fact_001 ;
prov:hadMember tag:stmt:fact_002 ;
prov:hadMember tag:stmt:fact_003 ;
prov:hadMember tag:stmt:fact_004 .
```

### Recursive Vortices (Nested Bundles)

For complex projects with sub-goals:

```markdown
# Main Vortex
{=tag:bundle:main .prov:Bundle}
prov:hadMember tag:goal:research ;
prov:hadMember tag:plan:research_v1 .

# Sub-Vortex
{=tag:bundle:sub .prov:Bundle}
prov:hadMember tag:goal:literature_review ;
prov:hadMember tag:plan:review_v1 ;
prov:wasDerivedFrom tag:bundle:main .
```

Each bundle has independent circulation but shares provenance.

---

## Part 8: Troubleshooting

### Symptom: Vortex Stagnation (No New Activities)

**Diagnosis**:
```sparql
SELECT ?entity WHERE {
  ?entity a prov:Entity .
  FILTER NOT EXISTS {
    ?activity prov:used ?entity .
    ?activity prov:startedAtTime ?start .
    FILTER(?start > NOW() - 24HOURS)
  }
}
```

**Solution**: Query for unused entities and create activities to use them.

### Symptom: High Turbulence (Many Violations)

**Diagnosis**: Check Reynolds number

```sparql
SELECT ?reynolds WHERE {
  BIND(?entity_density * ?activity_velocity * ?plan_complexity / ?viscosity AS ?reynolds)
}
```

**Solution**: Increase viscosity by adding SHACL constraints.

### Symptom: Low Compression (R < 2)

**Diagnosis**: Check ratio

```sparql
SELECT (COUNT(?stmt) / COUNT(?doc) AS ?ratio) WHERE {
  ?stmt a rdf:Statement .
  ?doc a prov:Entity ; prov:hadPrimarySource ?source .
}
```

**Solution**: Process documents more deeply, extract more statements per document.

### Symptom: Hallucination (Facts Without Sources)

**Diagnosis**:
```sparql
SELECT ?stmt WHERE {
  ?stmt a rdf:Statement .
  FILTER NOT EXISTS {
    ?stmt prov:wasDerivedFrom ?doc .
    ?doc prov:hadPrimarySource ?source .
  }
}
```

**Solution**: Add SHACL constraint requiring `prov:hadPrimarySource` for all statements.

---

## Part 9: DIAD Mapping to Chatbot Chat History

The DIAD cycle maps directly to normal chatbot/chatgpt interactions, transforming casual conversations into structured knowledge with complete provenance.

### Chat History as DIAD Cycle

Every chatbot interaction follows the DIAD pattern:

| Chatbot Phase | DIAD Phase | PROV-O Element | Example |
|---------------|------------|----------------|---------|
| **User Prompt** | Document Intake | Incoming `prov:Entity` | Human request as input document |
| **LLM Response** | Internal Analysis | Internal `prov:Activity` | LLM reasoning generates entities |
| **Tool Call** | External Validation | External `prov:Activity` | API/web tool validates knowledge |
| **Tool Result** | Grounding | Grounded `prov:Entity` | Result becomes provenance-tracked entity |

### Vault as Morphing Knowledge Graph

Everything in the Vault is either an **Activity** or **Entity** that morphs with project SHACL shapes:

**Project SHACL Shapes as prov:Collection Records**:

```markdown
# Project Shape Collection (Created by Internal Activity)
{=tag:coll:project_shapes .prov:Collection}
prov:wasGeneratedBy tag:act:create_shapes ;
prov:hadMember tag:shapes:VortexIntegrity ;
prov:hadMember tag:shapes:GroundingRequirement ;
prov:hadMember tag:shapes:CompressionOptimal ;
mdp:createdBy "internal_activity_reacting_to_goal_pressure" .

# Internal Activity (LLM Run)
{=tag:act:create_shapes .prov:Activity}
prov:startedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T10:05:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:setup_vortex ;
prov:used tag:vortex:goal ;
prov:qualifiedAssociation [
    prov:hadPlan tag:plan:setup_vortex ;
    prov:agent tag:agent:llm_architect ;
    prov:role "shape_creator"
] .
```

**Human Prompts as Incoming Entities**:

```markdown
# User Prompt as Entity
{=tag:entity:user_prompt_001 .prov:Entity}
rdfs:label "User: Create knowledge base about quantum computing" ;
prov:wasGeneratedBy tag:act:human_input ;
prov:generatedAtTime "2026-02-24T09:00:00Z"^^xsd:dateTime ;
mdp:source "human_user" ;
mdp:content "Create knowledge base about quantum computing" .

# Human Input Activity
{=tag:act:human_input .prov:Activity}
prov:startedAtTime "2026-02-24T09:00:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T09:00:05Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:goal_setting ;
prov:wasAssociatedWith tag:agent:human_user .
```

**LLM Runs as Internal Activities**:

```markdown
# LLM Reasoning Activity
{=tag:act:llm_reasoning_001 .prov:Activity}
prov:startedAtTime "2026-02-24T10:00:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T10:30:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:extract_facts ;
prov:used tag:entity:user_prompt_001 ;
prov:used tag:doc:quantum_paper ;
prov:qualifiedAssociation [
    prov:hadPlan tag:plan:extract_facts ;
    prov:agent tag:agent:llm_researcher ;
    prov:role "knowledge_extractor"
] ;
mdp:model "gpt-4-turbo" ;
mdp:temperature 0.7 ;
mdp:tokens_in 1500 ;
mdp:tokens_out 800 .

# Generated Entities
{=tag:stmt:fact_001 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" ;
prov:wasGeneratedBy tag:act:llm_reasoning_001 ;
prov:generatedAtTime "2026-02-24T10:15:00Z"^^xsd:dateTime .
```

**Tool Calls as External Activities**:

```markdown
# External Tool Call Activity
{=tag:act:web_search_001 .prov:Activity}
prov:startedAtTime "2026-02-24T11:00:00Z"^^xsd:dateTime ;
prov:endedAtTime "2026-02-24T11:05:00Z"^^xsd:dateTime ;
prov:hadPlan tag:plan:validate_facts ;
prov:used tag:stmt:fact_001 ;
mdp:tool "web_search" ;
mdp:query "quantum computing superposition applications" ;
mdp:response_time 5.2 ;
mdp:status "success" .

# Tool Result Entity
{=tag:entity:search_result_001 .prov:Entity}
rdfs:label "Web Search Result" ;
prov:wasGeneratedBy tag:act:web_search_001 ;
prov:hadPrimarySource <https://example.com/quantum-apps> ;
prov:generatedAtTime "2026-02-24T11:05:00Z"^^xsd:dateTime ;
mdp:relevance_score 0.92 ;
mdp:content "Quantum computers leverage superposition for cryptography..." .
```

### Complete Chatbot Conversation as DIAD Cycle

**Example Chat Session**:

```markdown
# Turn 1: User Prompt (Document Intake)
Human: "Create knowledge base about quantum computing"

{=tag:entity:prompt_001 .prov:Entity}
rdfs:label "User prompt" ;
prov:wasGeneratedBy tag:act:human_input ;
mdp:source "human_user" .

# Turn 2: LLM Response (Internal Analysis)
AI: "I'll help you build that. Let me start by gathering information..."

{=tag:act:llm_planning .prov:Activity}
prov:used tag:entity:prompt_001 ;
prov:hadPlan tag:plan:research_quantum ;
prov:qualifiedAssociation [
    prov:agent tag:agent:llm_planner ;
    prov:role "planner"
] .

# Turn 3: Tool Call (External Validation)
AI: [calls web_search tool]

{=tag:act:web_search .prov:Activity}
mdp:tool "web_search" ;
mdp:query "quantum computing overview" ;
prov:hadPlan tag:plan:research_quantum .

{=tag:entity:search_result .prov:Entity}
prov:wasGeneratedBy tag:act:web_search ;
prov:hadPrimarySource <https://example.com> .

# Turn 4: LLM Processes Result (Internal Analysis)
AI: "Based on my research, quantum computing uses qubits with superposition..."

{=tag:act:llm_extraction .prov:Activity}
prov:used tag:entity:search_result ;
prov:hadPlan tag:plan:extract_facts .

{=tag:stmt:fact_001 .rdf:Statement}
rdf:subject tag:concept:qubit ;
rdf:predicate tag:pred:hasProperty ;
rdf:object "superposition" ;
prov:wasGeneratedBy tag:act:llm_extraction ;
prov:wasDerivedFrom tag:entity:search_result .

# Turn 5: Tool Call for Validation (External Validation)
AI: [calls fact_check tool]

{=tag:act:fact_check .prov:Activity}
mdp:tool "fact_check" ;
prov:used tag:stmt:fact_001 .

{=tag:entity:validation_result .prov:Entity}
prov:wasGeneratedBy tag:act:fact_check ;
mdp:validation_status "verified" .

# Turn 6: Final Response (Grounding)
AI: "Here's your knowledge base: [document with provenance]"

{=tag:doc:quantum_summary .prov:Entity}
prov:hadMember tag:coll:quantum_facts ;
prov:hadPrimarySource <https://arxiv.org/abs/quantum-2024> ;
prov:wasGeneratedBy tag:act:consolidation ;
mdp:content """
# Quantum Computing Summary

## Qubit Properties
- Superposition
- Entanglement
""" .
```

### Vault Morphing with Project SHACL Shapes

The Vault continuously morphs as internal activities react to Goal/Plan pressure:

**Pressure-Driven Morphing**:

1. **Goal Pressure**: Creates vacuum for plan creation
2. **Plan Pressure**: Creates vacuum for activity execution
3. **Activity Pressure**: Creates vacuum for entity generation
4. **Entity Pressure**: Creates vacuum for grounding

**SHACL Shapes as Pressure Sensors**:

```turtle
# Shape detects when Vault needs morphing
{=tag:shapes:VaultMorphing .sh:NodeShape}
sh:targetClass prov:Collection ;
sh:property [
    sh:path prov:hadMember ;
    sh:minCount 1 ;
    sh:message "Collection must have members"
] ;
sh:property [
    sh:path prov:wasGeneratedBy ;
    sh:minCount 1 ;
    sh:message "Collection must be generated by activity"
] ;
sh:property [
    sh:path mdp:pressureSource ;
    sh:in ( "goal_pressure" "plan_pressure" "activity_pressure" "entity_pressure" ) ;
    sh:message "Collection must track pressure source"
] .
```

**Example Vault Morphing**:

```markdown
# Initial Vault State (High Entropy)
{=tag:coll:vortex_v1 .prov:Collection}
prov:hadMember tag:entity:prompt_001 ;
prov:hadMember tag:stmt:fact_001 ;
mdp:entropy 0.95 ;
mdp:compression_ratio 1.2 .

# Internal Activity Reacts to Pressure
{=tag:act:morph_vault .prov:Activity}
prov:hadPlan tag:plan:optimize_vault ;
prov:used tag:coll:vortex_v1 ;
mdp:action "consolidate_statements" ;
mdp:pressure_source "entity_pressure" .

# Morphed Vault State (Low Entropy)
{=tag:coll:vortex_v2 .prov:Collection}
prov:wasDerivedFrom tag:coll:vortex_v1 ;
prov:hadMember tag:doc:quantum_summary ;
prov:hadMember tag:coll:quantum_facts ;
mdp:entropy 0.35 ;
mdp:compression_ratio 4.5 .
```

### Chatbot Conversation as Provenance Chain

Every turn in a chatbot conversation becomes a node in the provenance graph:

```
User Prompt (Entity)
    ↓ prov:wasGeneratedBy
Human Input (Activity)
    ↓ prov:used
LLM Planning (Activity)
    ↓ prov:wasGeneratedBy
Plan (Entity)
    ↓ prov:hadPlan
LLM Extraction (Activity)
    ↓ prov:wasGeneratedBy
Statements (Entities)
    ↓ prov:used
Web Search (Activity)
    ↓ prov:wasGeneratedBy
Search Results (Entities)
    ↓ prov:wasDerivedFrom
Validated Statements (Entities)
    ↓ prov:hadMember
Final Document (Entity)
```

This ensures that every chatbot response can be traced back to its source through a complete provenance chain, eliminating hallucinations and enabling verification.

---

## Conclusion

The Knowledge Double Vortex provides a **physically grounded** framework for agentic knowledge work. By treating information flow as a vortex with measurable forces:

- **Initiation**: SEED.md creates pressure field via SHACL constraints
- **Propagation**: DIAD cycle drives knowledge through 4 phases
- **Steering**: Modify SHACL shapes to change direction
- **Regulation**: Adjust viscosity and compression ratio for optimal flow

The key insight is that **SHACL violations are not errors**—they are the **propulsion pressure** that drives the vortex forward. Each violation creates a vacuum the agent must fill, ensuring continuous progress toward the goal.

**Final Rule**: The vortex achieves self-propagation when every violation resolution creates the conditions for the next violation. This is the "perpetual knowledge machine" that transforms high-entropy observations into low-entropy, grounded truth.
