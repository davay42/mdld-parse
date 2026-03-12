# GENERALIZATION: SHACL+PROV-O as Universal Driving Forces

## Abstract

The vortex metaphor provides one instantiation of a general principle: **SHACL constraints create pressure differentials that drive PROV-O-based knowledge systems forward**. This document generalizes beyond the specific vortex/combustion engine model to show how SHACL+PROV-O can power diverse self-propelling knowledge systems with varying properties, goals, internal structures, and external interactions.

---

## Core Generalization Principle

### The Universal Engine

**All self-propelling knowledge systems share a common architecture**:

```
[SHACL Constraints] → [Pressure Differentials] → [PROV-O Actions] → [Knowledge State Change]
     ↓                           ↓                      ↓                      ↓
  [Pressure Field]          [Vacuum Zones]         [Activities/Entities]    [State Evolution]
```

**Key Insight**: SHACL constraints are not just validation rules—they are **driving forces** that create pressure differentials. Each violation represents a vacuum that the system must fill, ensuring continuous forward motion toward goals.

### Universal Components

| Component | SHACL Role | PROV-O Role | Function |
|-----------|------------|------------|----------|
| **Pressure Field** | Constraint definitions | Plan/Goal entities | Creates potential energy |
| **Vacuum Zones** | Violation conditions | Unfilled requirements | Creates kinetic energy |
| **Driving Force** | `sh:message` | `prov:Activity` | Transforms potential into kinetic |
| **State Evolution** | `sh:targetClass` | `prov:Entity` | Stores transformed energy |
| **Feedback Loop** | Validation results | `prov:wasInformedBy` | Maintains momentum |

---

## Divergent System Properties

### Property 1: Temporal Dynamics

**Linear Time Systems** (Chatbots, Conversational Agents):
- Time flows forward: t₀ → t₁ → t₂ → ...
- Activities must be temporally ordered
- Causality enforced through `prov:startedAtTime` < `prov:endedAtTime`

**Branching Time Systems** (Simulation, Planning):
- Time branches: t₀ → {t₁a, t₁b, t₁c}
- Multiple parallel timelines
- `prov:wasInfluencedBy` captures branching decisions

**Cyclic Time Systems** (Maintenance, Monitoring):
- Time loops: ... → tₙ → t₀ → t₁ → ...
- Periodic activities
- `prov:wasRevisionOf` captures iterative refinement

**Implementation**:

```turtle
# Linear Time Constraint
{=tag:shapes:LinearTime .sh:NodeShape}
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

# Branching Time Constraint
{=tag:shapes:BranchingTime .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasInfluencedBy ;
    sh:nodeKind sh:IRI ;
    sh:description "Track branching decisions"
] .

# Cyclic Time Constraint
{=tag:shapes:CyclicTime .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasRevisionOf ;
    sh:nodeKind sh:IRI ;
    sh:description "Track iterative refinement"
] .
```

---

### Property 2: Knowledge Representation

**Statement-Based Systems** (Fact Extraction):
- Atomic facts: `rdf:Statement`
- Subject-predicate-object triples
- High compression ratio (3-7 statements per document)

**Document-Based Systems** (Content Management):
- Full documents: `prov:Entity`
- Structured content with metadata
- Low compression ratio (1-2 documents per source)

**Graph-Based Systems** (Knowledge Graphs):
- Networked entities: `prov:Entity` + `prov:Collection`
- Complex relationships
- Variable compression ratio

**Implementation**:

```turtle
# Statement-Based Constraint
{=tag:shapes:StatementBased .sh:NodeShape}
sh:targetClass rdf:Statement ;
sh:property [
    sh:path rdf:subject ;
    sh:nodeKind sh:IRI ;
    sh:minCount 1 ;
    sh:message "Statement must have subject"
] ;
sh:property [
    sh:path rdf:predicate ;
    sh:nodeKind sh:IRI ;
    sh:minCount 1 ;
    sh:message "Statement must have predicate"
] ;
sh:property [
    sh:path rdf:object ;
    sh:minCount 1 ;
    sh:message "Statement must have object"
] .

# Document-Based Constraint
{=tag:shapes:DocumentBased .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path mdp:content ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:message "Document must have content"
] ;
sh:property [
    sh:path prov:hadPrimarySource ;
    sh:nodeKind sh:IRI ;
    sh:minCount 1 ;
    sh:message "Document must have primary source"
] .

# Graph-Based Constraint
{=tag:shapes:GraphBased .sh:NodeShape}
sh:targetClass prov:Collection ;
sh:property [
    sh:path prov:hadMember ;
    sh:minCount 1 ;
    sh:message "Collection must have members"
] ;
sh:property [
    sh:path prov:wasDerivedFrom ;
    sh:minCount 1 ;
    sh:message "Collection must have derivation chain"
] .
```

---

### Property 3: Goal Structure

**Single-Goal Systems** (Task Completion):
- One primary goal
- Linear progression
- Clear completion criteria

**Multi-Goal Systems** (Project Management):
- Multiple concurrent goals
- Goal dependencies
- Sub-goals and milestones

**Adaptive Goal Systems** (Learning Agents):
- Goals evolve over time
- New goals emerge
- Old goals complete or invalidate

**Implementation**:

```turtle
# Single-Goal Constraint
{=tag:shapes:SingleGoal .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path mdp:desiredState ;
    sh:minCount 1 ;
    sh:message "Goal must specify desired state"
] ;
sh:property [
    sh:path prov:wasDerivedFrom ;
    sh:maxCount 0 ;
    sh:message "Single goal has no dependencies"
] .

# Multi-Goal Constraint
{=tag:shapes:MultiGoal .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path mdp:desiredState ;
    sh:minCount 1 ;
    sh:message "Goal must specify desired state"
] ;
sh:property [
    sh:path prov:wasDerivedFrom ;
    sh:minCount 0 ;
    sh:message "Multi-goals may have dependencies"
] ;
sh:property [
    sh:path prov:wasInformedBy ;
    sh:minCount 0 ;
    sh:message "Multi-goals may inform each other"
] .

# Adaptive Goal Constraint
{=tag:shapes:AdaptiveGoal .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path mdp:desiredState ;
    sh:minCount 1 ;
    sh:message "Goal must specify desired state"
] ;
sh:property [
    sh:path prov:wasRevisionOf ;
    sh:minCount 0 ;
    sh:message "Adaptive goals may be revised"
] ;
sh:property [
    sh:path prov:wasInvalidatedBy ;
    sh:minCount 0 ;
    sh:message "Adaptive goals may be invalidated"
] .
```

---

### Property 4: External Interaction

**Read-Only Systems** (Information Retrieval):
- Only consume external data
- No external modifications
- `prov:hadPrimarySource` for grounding

**Read-Write Systems** (Active Agents):
- Consume and modify external data
- Tool calls change external state
- `mdp:tool` + `mdp:response` tracking

**Event-Driven Systems** (Reactive Agents):
- Respond to external events
- Event-based triggers
- `prov:wasInfluencedBy` for event tracking

**Implementation**:

```turtle
# Read-Only Constraint
{=tag:shapes:ReadOnly .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:used ;
    sh:minCount 1 ;
    sh:message "Activity must use entities"
] ;
sh:property [
    sh:path mdp:tool ;
    sh:maxCount 0 ;
    sh:message "Read-only systems cannot use tools"
] .

# Read-Write Constraint
{=tag:shapes:ReadWrite .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path mdp:tool ;
    sh:minCount 1 ;
    sh:message "Activity must use tools"
] ;
sh:property [
    sh:path mdp:response ;
    sh:minCount 1 ;
    sh:message "Activity must track tool response"
] .

# Event-Driven Constraint
{=tag:shapes:EventDriven .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:wasInfluencedBy ;
    sh:minCount 1 ;
    sh:message "Activity must be influenced by events"
] ;
sh:property [
    sh:path mdp:eventType ;
    sh:minCount 1 ;
    sh:message "Activity must specify event type"
] .
```

---

## Divergent Internal Structures

### Structure 1: Centralized Processing

**Single-Agent Systems**:
- One agent handles all activities
- Centralized decision-making
- Simple provenance chains

**Implementation**:

```turtle
{=tag:shapes:Centralized .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:qualifiedAssociation ;
    sh:minCount 1 ;
    sh:message "Activity must have agent association"
] ;
sh:property [
    sh:path prov:qualifiedAssociation/prov:agent ;
    sh:maxCount 1 ;
    sh:message "Centralized systems have single agent"
] .
```

---

### Structure 2: Distributed Processing

**Multi-Agent Systems**:
- Multiple agents collaborate
- Distributed decision-making
- Complex provenance chains with `prov:actedOnBehalfOf`

**Implementation**:

```turtle
{=tag:shapes:Distributed .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:qualifiedAssociation ;
    sh:minCount 1 ;
    sh:message "Activity must have agent association"
] ;
sh:property [
    sh:path prov:actedOnBehalfOf ;
    sh:minCount 0 ;
    sh:message "Distributed systems may have delegation"
] .
```

---

### Structure 3: Hierarchical Processing

**Layered Systems**:
- Multiple processing layers
- Each layer has specific responsibilities
- Layer-specific constraints

**Implementation**:

```turtle
{=tag:shapes:Layered .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path mdp:processingLayer ;
    sh:in ( "intake" "analysis" "validation" "grounding" ) ;
    sh:message "Activity must specify processing layer"
] ;
sh:property [
    sh:path prov:wasInformedBy ;
    sh:minCount 0 ;
    sh:message "Layered activities may inform each other"
] .
```

---

## Divergent External World Interactions

### Interaction 1: Passive Consumption

**Information Gathering Systems**:
- Read from external sources
- No external modifications
- Focus on knowledge extraction

**Pressure Source**: Knowledge gaps create vacuum for extraction

**Example**:

```markdown
# External Document
{=tag:doc:research_paper .prov:Entity}
prov:hadPrimarySource <https://arxiv.org/abs/quantum-2024> ;
mdp:content "Quantum computing overview..." .

# Extraction Activity
{=tag:act:extract_facts .prov:Activity}
prov:used tag:doc:research_paper ;
prov:hadPlan tag:plan:extract ;
mdp:tool "llm_extraction" .

# Extracted Statements
{=tag:stmt:fact_001 .rdf:Statement}
prov:wasGeneratedBy tag:act:extract_facts ;
prov:wasDerivedFrom tag:doc:research_paper .
```

---

### Interaction 2: Active Modification

**Tool-Using Agents**:
- Call external tools
- Modify external state
- Track tool responses

**Pressure Source**: Task requirements create vacuum for tool use

**Example**:

```markdown
# Tool Call Activity
{=tag:act:web_search .prov:Activity}
mdp:tool "web_search" ;
mdp:query "quantum computing applications" ;
mdp:response_time 5.2 ;
mdp:status "success" .

# Tool Result Entity
{=tag:entity:search_result .prov:Entity}
prov:wasGeneratedBy tag:act:web_search ;
mdp:relevance_score 0.92 .
```

---

### Interaction 3: Event Response

**Reactive Systems**:
- Respond to external events
- Event-based triggers
- Real-time processing

**Pressure Source**: Events create vacuum for response

**Example**:

```markdown
# Event Entity
{=tag:entity:event_001 .prov:Entity}
rdfs:label "User submitted query" ;
mdp:eventType "user_query" ;
mdp:timestamp "2026-02-24T10:00:00Z"^^xsd:dateTime .

# Response Activity
{=tag:act:respond_to_query .prov:Activity}
prov:wasInfluencedBy tag:entity:event_001 ;
prov:hadPlan tag:plan:respond ;
mdp:response_time 1.5 .
```

---

## Universal Pressure Differential Pattern

### The General Pressure Equation

All self-propelling knowledge systems follow this pattern:

```
Pressure = (Goal_State - Current_State) × Constraint_Strength
```

Where:
- **Goal_State**: Desired system state (defined by `mdp:desiredState`)
- **Current_State**: Actual system state (derived from Activities/Entities)
- **Constraint_Strength**: SHACL constraint severity (violation vs. info)

### Pressure Differential Types

| Pressure Type | SHACL Constraint | PROV-O Trigger | System Response |
|---------------|------------------|----------------|-----------------|
| **Knowledge Gap** | Missing `prov:hadPrimarySource` | `prov:used` | Extract more knowledge |
| **Activity Gap** | Spontaneous activity (no plan) | `prov:hadPlan` | Create plan |
| **Entity Gap** | Orphaned entity | `prov:wasGeneratedBy` | Generate entity |
| **Grounding Gap** | Ungrounded entity | `prov:hadPrimarySource` | Add source |
| **Causality Gap** | Temporal violation | `prov:startedAtTime` | Fix timing |
| **Goal Gap** | Goal not satisfied | `mdp:desiredState` | Continue work |

### Universal Propulsion Mechanism

**Step 1**: Define Goal State
```turtle
{=tag:entity:goal .prov:Entity}
mdp:desiredState "All facts grounded with primary sources" .
```

**Step 2**: Create Pressure Field
```turtle
{=tag:shapes:PressureField .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:hadPrimarySource ;
    sh:minCount 1 ;
    sh:message "Pressure: Entity needs primary source"
] .
```

**Step 3**: Detect Vacuum (Violation)
```sparql
SELECT ?entity WHERE {
  ?entity a prov:Entity .
  FILTER NOT EXISTS {
    ?entity prov:hadPrimarySource ?source .
  }
}
```

**Step 4**: Fill Vacuum (Activity)
```markdown
{=tag:act:add_source .prov:Activity}
prov:used tag:entity:goal ;
prov:hadPlan tag:plan:ground ;
mdp:action "add_primary_source" .
```

**Step 5**: Update State (Entity)
```markdown
{=tag:entity:grounded .prov:Entity}
prov:wasGeneratedBy tag:act:add_source ;
prov:hadPrimarySource <https://example.com> .
```

**Step 6**: Repeat Until Goal Satisfied

---

## System Taxonomy

### By Temporal Dynamics

| System Type | Time Model | SHACL Focus | PROV-O Focus |
|-------------|------------|-------------|--------------|
| **Chatbot** | Linear | Temporal ordering | `prov:startedAtTime` |
| **Planner** | Branching | Decision tracking | `prov:wasInfluencedBy` |
| **Monitor** | Cyclic | Periodic validation | `prov:wasRevisionOf` |

### By Knowledge Representation

| System Type | Knowledge Unit | SHACL Focus | PROV-O Focus |
|-------------|----------------|-------------|--------------|
| **Extractor** | Statements | Triple completeness | `rdf:Statement` |
| **CMS** | Documents | Content validation | `prov:Entity` |
| **KG** | Graphs | Relationship integrity | `prov:Collection` |

### By Goal Structure

| System Type | Goal Model | SHACL Focus | PROV-O Focus |
|-------------|------------|-------------|--------------|
| **Task** | Single | Completion criteria | `mdp:desiredState` |
| **Project** | Multi | Goal dependencies | `prov:wasDerivedFrom` |
| **Learning** | Adaptive | Goal evolution | `prov:wasRevisionOf` |

### By External Interaction

| System Type | Interaction | SHACL Focus | PROV-O Focus |
|-------------|-------------|-------------|--------------|
| **Retriever** | Read-only | Source validation | `prov:hadPrimarySource` |
| **Agent** | Read-write | Tool tracking | `mdp:tool` + `mdp:response` |
| **Reactive** | Event-driven | Event handling | `prov:wasInfluencedBy` |

---

## Implementation Patterns

### Pattern 1: Minimalist Engine

**For Simple Systems**:

```turtle
# Single Constraint
{=tag:shapes:Minimal .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path prov:hadPrimarySource ;
    sh:minCount 1 ;
    sh:message "Entity needs source"
] .
```

**Use**: Chatbots, simple agents, fact extraction

---

### Pattern 2: Balanced Engine

**For Moderate Complexity**:

```turtle
# Multiple Constraints
{=tag:shapes:Balanced .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:hadPlan ;
    sh:minCount 1 ;
    sh:message "Activity needs plan"
] ;
sh:property [
    sh:path prov:generated ;
    sh:minCount 1 ;
    sh:message "Activity must generate entities"
] .
```

**Use**: Project management, research assistants, knowledge bases

---

### Pattern 3: Complex Engine

**For Advanced Systems**:

```turtle
# Comprehensive Constraints
{=tag:shapes:Complex .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:hadPlan ;
    sh:minCount 1 ;
    sh:message "Activity needs plan"
] ;
sh:property [
    sh:path prov:startedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Activity needs start time"
] ;
sh:property [
    sh:path prov:endedAtTime ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:message "Activity needs end time"
] ;
sh:property [
    sh:path prov:generated ;
    sh:minCount 1 ;
    sh:message "Activity must generate entities"
] ;
sh:property [
    sh:path prov:qualifiedAssociation ;
    sh:minCount 1 ;
    sh:message "Activity needs agent association"
] .
```

**Use**: Autonomous agents, complex reasoning systems, multi-agent systems

---

## Beyond the Vortex

### From Metaphor to Principle

The vortex metaphor is **one instantiation** of a general principle:

**SHACL constraints create pressure differentials that drive PROV-O-based knowledge systems forward.**

This principle applies to:
- **Vortex systems** (combustion engine metaphor)
- **Neural systems** (neural network metaphor)
- **Ecological systems** (ecosystem metaphor)
- **Economic systems** (market metaphor)
- **Social systems** (society metaphor)

### Universal Design Patterns

**Pattern 1: Pressure-Driven Propulsion**
- Define goal state
- Create constraints that detect gaps
- Let violations drive activities
- Activities fill gaps
- Repeat until goal satisfied

**Pattern 2: Constraint-Based Steering**
- Modify constraints to change direction
- Tighten constraints for precision
- Loosen constraints for exploration
- Balance for optimal flow

**Pattern 3: Provenance-Based Verification**
- Track all transformations
- Maintain complete chains
- Enable verification
- Prevent hallucinations

### Future Directions

**1. Adaptive Constraints**: Constraints that evolve with system state
**2. Multi-Scale Systems**: Systems operating at multiple temporal/spatial scales
**3. Emergent Goals**: Goals that emerge from system behavior
**4. Self-Optimizing Constraints**: Constraints that optimize their own parameters
**5. Cross-System Communication**: Multiple systems sharing constraints and provenance

---

## Conclusion

The generalization reveals that **SHACL+PROV-O provide a universal framework for self-propelling knowledge systems**:

- **SHACL constraints** create pressure differentials (potential energy)
- **PROV-O activities** transform potential into kinetic energy
- **PROV-O entities** store transformed energy (state)
- **Pressure differentials** drive continuous forward motion
- **Goal states** define equilibrium points

The vortex is **one instantiation** of this principle. The same principle can power chatbots, agents, planners, monitors, retrievers, and any system that needs to:
1. Define goals
2. Detect gaps
3. Take action
4. Store results
5. Verify provenance
6. Repeat

The key insight is that **SHACL violations are not errors**—they are **driving forces** that ensure continuous progress toward goals. This is the universal principle behind all self-propelling knowledge systems.
