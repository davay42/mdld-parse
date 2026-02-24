# PROV-Vortex: Toroidal Provenance Manifold

## Abstract

The PROV-Vortex model treats provenance as a **toroidal vortex ring** moving through an information medium. This physical metaphor provides mathematical rigor to W3C PROV-O operations, creating a self-sustaining knowledge manifold where every fact is topologically bound to its origin through causal field lines.

---

## Physical Foundations

### Vortex Ring Dynamics

A vortex ring is a self-propagating toroidal structure where fluid circulates in two orthogonal directions:

- **Poloidal Flow**: Circulation through the donut hole (inner → outer → inner)
- **Toroidal Flow**: Rotation around the central axis

In PROV-Vortex:
- **Poloidal flow** = Activity → Entity → Activity transformation cycle
- **Toroidal flow** = Continuous project momentum along time axis
- **Vortex core** = Human intent/goals (low-pressure center)
- **Surface tension** = SHACL constraints maintaining structural integrity

### Kelvin-Helmholtz Principles

**Helmholtz Vortex Theorems** applied to knowledge:

1. **Vorticity moves with the fluid**: Provenance stays attached to data as it transforms
2. **Vorticity cannot be created/destroyed**: Every fact must have an origin (prov:Entity)
3. **Circulation conservation**: Total "informational momentum" remains constant in closed system

**Circulation Formula**:
```
Γ = ∮C v · dl
```
Where:
- `Γ` (Gamma) = Knowledge circulation strength
- `v` = Rate of agent prov:Activity
- `dl` = Path of prov:used/prov:wasGeneratedBy links

High circulation = stable, resistant-to-hallucination knowledge manifold.

---

## W3C PROV-O Topological Mapping

### Core Entities as Geometric Components

| PROV-O Class | Geometric Element | Physical Function |
|--------------|------------------|-------------------|
| `prov:Entity` | Vortex Core (Inner Ring) | Grounded knowledge mass |
| `prov:Activity` | Poloidal Surface (Outer Ring) | Work/transformations |
| `prov:Agent` | Fluid/Plasma | Energy carrier through system |
| `prov:Plan` | Orifice Constraint | Pressure gradient shaping flow |
| `prov:Association` | Field Line Junction | Agent-Plan-Activity coupling |

### Mandatory Topology (SHACL Constraints)

```turtle
# The Toroidal Closure Constraint
tag:shapes:ToroidalTopology
    a sh:NodeShape ;
    sh:targetClass prov:Activity ;
    sh:property [
        sh:path prov:qualifiedAssociation ;
        sh:minCount 1 ;
        sh:class prov:Association ;
        sh:description "Forces poloidal flow through plan-orifice" ;
    ] ;
    sh:property [
        sh:path prov:used ;
        sh:minCount 1 ;
        sh:description "Inhales existing core mass" ;
    ] ;
    sh:property [
        sh:path [ sh:inversePath prov:wasGeneratedBy ] ;
        sh:minCount 1 ;
        sh:description "Exhales transformed mass back to core" ;
    ] .
```

---

## Manifold Geometry

### Three Orthogonal Axes

#### 1. Temporal Axis (Z) - Propagation Direction
- **Physical**: Vortex translation through medium
- **PROV-O**: Chronological sequence of prov:startedAtTime/endedAtTime
- **Function**: Project maturity from initial state to goal achievement

#### 2. Intentional Axis (Radial) - Goal-to-Execution Distance
- **Physical**: Radius from vortex core to surface
- **PROV-O**: prov:Plan → prov:Activity → prov:Entity depth
- **Function**: Abstraction gradient from strategic to tactical

#### 3. Social Axis (Angular) - Agent Responsibility
- **Physical**: Angular position around toroidal circumference
- **PROV-O**: prov:Agent → prov:Association → prov:Activity chains
- **Function**: Distribution of work across multiple actors

### Manifold Volume Calculation

```
V = ∫Axis Area(Circulation) dZ
```

- **Volume**: Total grounded knowledge base
- **Area(Circulation)**: Cross-sectional "information density"
- **dZ**: Incremental progress along time axis

---

## Dynamics and Forces

### Centripetal Pressure (SHACL Constraints)

SHACL shapes act as **magnetic pressure** confining the vortex:

```turtle
# Pressure Gradient Constraint
tag:props:PlanConfinement
    a sh:PropertyShape ;
    sh:path prov:hadPlan ;
    sh:minCount 1 ;
    sh:class prov:Plan ;
    sh:description "Prevents activity escape from authorized trajectory" .
```

**Pressure Effects**:
- **Orphaned Entity Violation**: Creates low-pressure zone pulling agent to create new activity
- **Incomplete Activity Violation**: Creates drag forcing completion before forward motion
- **Plan Deviation Violation**: Surface tension preventing vortex rupture

### Viscosity and Reynolds Number

**Reynolds Number for Knowledge**:
```
Re = (ρ × v × L) / μ
```
Where:
- `ρ` = Information density (triples per unit)
- `v` = Agent processing velocity
- `L` = Plan complexity (orifice diameter)
- `μ` = System viscosity (friction/resistance)

**Flow Regimes**:
- **Low Re (Laminar)**: Human-only, deliberate, high-trust flow
- **High Re (Turbulent)**: AI agents, high-speed, requires stronger SHACL confinement

### Self-Induction Mechanism

When vortex circulation `Γ` exceeds critical threshold:
```
∂v/∂t = (Γ × B) / ρ
```

Where induced velocity `∂v/∂t` automatically generates next activity from previous result.

**Self-Induction Criteria**:
1. SHACL validation passes (structural integrity)
2. Result entity has unused potential (prov:hadMember count)
3. Plan constraints remain active (mdp:constraint satisfied)

---

## Energy and Information Flow

### Flux Tube Analogy

The PROV-Vortex acts as an **informational flux tube**:

| Physics Component | Knowledge Counterpart | Function |
|-------------------|---------------------|----------|
| Magnetic field lines | prov:wasDerivedFrom/prov:used | Directs truth/causality flow |
| Magnetic flux | Number of validated triples | Measures documentation density |
| Confinement pressure | SHACL shapes | Prevents orphaned data generation |
| Tube radius | Plan complexity scope | Defines agent operation boundaries |

### Energy Conservation

**Information Energy Equation**:
```
E = ½ρv² + P + Φ
```
Where:
- `½ρv²` = Kinetic energy (agent activity)
- `P` = Pressure energy (SHACL constraints)
- `Φ` = Potential energy (goal-state distance)

**Conservation Law**: Total system energy remains constant through Activity → Entity transformations.

---

## W3C PROV-O Compliance

### 100% Standard Implementation

No custom classes required. All vortex behavior achieved through standard PROV-O:

```turtle
# Goal as Entity (100% W3C)
tag:goal:project a prov:Entity ;
    rdfs:label "Complete roof research" ;
    mdp:desiredState "Material selected and sourced" .

# Plan as Entity (100% W3C)  
tag:plan:research a prov:Plan ;
    prov:wasDerivedFrom tag:goal:project ;
    rdfs:label "Compare materials" .

# Activity with Association (100% W3C)
tag:act:web_search a prov:Activity ;
    prov:qualifiedAssociation [
        a prov:Association ;
        prov:hadPlan tag:plan:research ;
        prov:agent tag:agent:ai_assistant
    ] ;
    prov:startedAtTime "2026-02-24T17:30:00Z"^^xsd:dateTime .
```

### Qualified Relationships

PROV-O's **qualified relationships** provide the "reification" needed for vortex field lines:

- `prov:qualifiedAssociation` = Agent-Plan coupling junction
- `prov:qualifiedUsage` = Entity-Activity consumption point  
- `prov:qualifiedGeneration` = Activity-Entity creation point

Each qualified relationship becomes a **named vertex** in the manifold, preventing blank node anonymity.

---

## Collection and Document Filaments

### Entity Scales in Vortex Geometry

The PROV-Vortex operates across **multiple entity scales**, each representing different structural components of the toroidal manifold:

| Entity Scale | Vortex Component | Physical Analogy | Function |
|-------------|------------------|------------------|----------|
| **rdf:Statement** | Fluid Particles | Individual atoms/molecules | Atomic facts with full provenance |
| **prov:Entity** | Vortex Core Mass | Condensed matter clusters | Grounded knowledge objects |
| **prov:Collection** | Streamline Bundles | Coherent fluid filaments | Organized knowledge groups |
| **prov:Bundle** | Nested Vortices | Sub-ring structures | Meta-provenance containers |

### Collection Dynamics

**prov:Collection** acts as **streamline bundles** within the vortex:

```turtle
# Collection Shape (Streamline Constraint)
tag:shapes:CollectionShape
    a sh:NodeShape ;
    sh:targetClass prov:Collection ;
    sh:property [
        sh:path prov:hadMember ;
        sh:minCount 1 ;
        sh:description "Streamline must contain at least one particle" ;
    ] ;
    sh:property [
        sh:path prov:wasGeneratedBy ;
        sh:minCount 1 ;
        sh:description "Bundle must originate from activity" ;
    ] .
```

**Physical Properties**:
- **Streamline Coherence**: All members share common prov:Plan trajectory
- **Bulk Validation**: Collection validity implies member validity (pressure transmission)
- **Momentum Transfer**: Collections can be prov:used as single units

### Document Filaments

**Document entities** represent **structural ribs** providing vortex stability:

```turtle
# Document Shape (Structural Rib)
tag:shapes:DocumentShape
    a sh:NodeShape ;
    sh:targetClass prov:Entity ;
    sh:property [
        sh:path prov:atLocation ;
        sh:nodeKind sh:IRI ;
        sh:description "Document must have physical/digital location" ;
    ] ;
    sh:property [
        sh:path prov:hadPrimarySource ;
        sh:description "Document must trace to authoritative source" ;
    ] .
```

**Geometric Functions**:
- **Cross-sectional Reinforcement**: Documents prevent vortex collapse
- **Anchoring Points**: Provide stable reference coordinates
- **Surface Tension Distribution**: Spread SHACL constraints across vortex surface

### Multi-Scale Topology

The vortex maintains **hierarchical coherence** across scales:

```
Micro-scale (Statements) → Meso-scale (Collections) → Macro-scale (Documents)
        ↓                        ↓                      ↓
   Atomic Truth          Organized Knowledge        Project Structure
```

**Scale Transition Rules**:
1. **Upward**: Multiple rdf:Statements aggregate into prov:Collection
2. **Downward**: prov:Collection prov:hadMember links to individual statements
3. **Lateral**: Documents prov:hadMember multiple collections
4. **Temporal**: Each scale maintains independent prov:startedAtTime

### Bundle Nesting (Meta-Vortices)

**prov:Bundle** enables **recursive provenance**:

```turtle
# Bundle as Nested Vortex
tag:bundle:project_review a prov:Bundle ;
    prov:hadMember tag:collection:findings ;
    prov:hadMember tag:entity:review_plan ;
    prov:wasAttributedTo tag:agent:reviewer .
```

**Meta-Vortex Properties**:
- **Independent Circulation**: Bundle has its own Γ (circulation)
- **Pressure Isolation**: Internal SHACL constraints don't affect external vortex
- **Recursive Validation**: Bundle validity independent of member validity

### Filament Interactions

**Cross-Scale Forces** in vortex dynamics:

| Interaction | Physical Analogy | PROV-O Implementation | Effect |
|-------------|------------------|---------------------|--------|
| **Coalescence** | Streamline merging | Collections combine into larger collections | Increased momentum |
| **Fragmentation** | Vortex breakdown | Document splits into multiple entities | Distributed processing |
| **Reconnection** | Field line reconnection | Collections reorganize under new plan | Topological change |
| **Dissipation** | Vortex decay | Entities become orphaned | Knowledge loss |

### Energy Distribution Across Scales

**Multi-Scale Energy Equation**:
```
E_total = Σ(E_micro) + E_meso + E_macro
```

Where:
- `E_micro` = Individual statement energy (truth value)
- `E_meso` = Collection binding energy (organizational value)
- `E_macro` = Document structural energy (project coherence)

**Conservation Principles**:
- **Scale Invariance**: Total energy conserved across transformations
- **Causal Continuity**: Each scale maintains complete provenance chain
- **Information Preservation**: No loss during scale transitions

---

## Vortex States and Transitions

### Formation Number (F)

In fluid dynamics, vortex formation requires optimal impulse-to-orifice ratio:

```
F = (Impulse Duration) / (Orifice Diameter)
```

**PROV-Vortex Application**:
- **Underspecified Plan (F << 1)**: Weak vortex, agents generate random facts
- **Overspecified Plan (F >> 1)**: Vortex snaps, loses momentum in pedantry
- **Optimal Plan (F ≈ 1)**: Stable, self-propagating knowledge ring

### State Transitions

| State | PROV-O Pattern | Physical Analogy | Trigger |
|-------|----------------|------------------|---------|
| **Seed** | Single prov:Entity + prov:Plan | Vortex nucleus formation | Initial goal declaration |
| **Ignition** | First prov:Activity with prov:Association | Ring starts spinning | Agent executes first plan |
| **Propagation** | Chain of prov:used/prov:wasGeneratedBy | Self-sustaining motion | Each result used by next activity |
| **Bifurcation** | New prov:Plan from existing prov:Entity | Vortex filament splitting | Direction change required |
| **Termination** | prov:endedAtTime + goal satisfaction | Vortex dissipation | Project completion |

---

## Multi-Scale Implementation

### Paper-Based Vortex (1900s Laboratory)

**Physical Components**:
- **Lab Notebook** = Information medium
- **Scientific Method** = SHACL rulebook  
- **Ink and Paper** = Field lines
- **Researcher Signature** = prov:Agent declaration

**Vortex Audit** (Nightly SHACL check):
1. **Connectivity**: Every note traces to goal?
2. **Grounding**: Clear Subject-Predicate-Object statements?
3. **Momentum**: Today's result suggests tomorrow's plan?

### Digital Vortex (MD-LD + SHACL)

**Enhanced Capabilities**:
- **Automatic Validation**: SHACL engine as real-time pressure sensor
- **Multi-Agent Coordination**: Multiple plasma streams in same vortex
- **Forking/Bifurcation**: Digital filament splitting without information loss
- **Volume Calculation**: SPARQL queries computing manifold metrics

---

## Achievement and Completion

### Topological Closure Criteria

A goal is **achieved** when the manifold exhibits **homeomorphic closure**:

1. **Temporal Boundary**: Final prov:Activity has prov:endedAtTime
2. **Causal Completeness**: Result entity traces to initial goal via prov:wasDerivedFrom
3. **Semantic Satisfaction**: Result satisfies mdp:desiredState from seed goal

### Mathematical Verification

```sparql
# Goal Achievement Query
SELECT ?goal ?result WHERE {
  ?goal a prov:Entity ;
        mdp:desiredState ?desired .
  
  ?result prov:wasDerivedFrom* ?goal ;
          prov:wasGeneratedBy ?activity ;
          ?satisfies ?desired .
  
  ?activity prov:endedAtTime ?endTime .
}
```

---

## Societal Implications

### Truth Manifold Protocol

When all public information requires PROV-Vortex provenance:

- **Fake News** = Information without prov:Plan/prov:Activity field lines (turbulence)
- **Expertise** = High-circulation vortex with strong SHACL confinement
- **Accountability** = Complete trace path from claim to human prov:Agent

### Knowledge Conservation

The vortex creates a **low-entropy information channel**:
- **Input**: High-entropy observations, data, ideas
- **Process**: SHACL-constrained transformation (cooling)
- **Output**: Low-entropy, grounded, traceable knowledge

---

## Minimal Startup Protocol

### Genesis Vortex Seed

```markdown
@prefix mdp: <http://mdld.js.org/prov/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix tag: <tag:personal.me,2026:> .

# Core Impulse (Goal)
{=tag:genesis:goal .prov:Entity}
rdfs:label "Establish self-sustaining knowledge manifold" ;
mdp:desiredState "Continuous SHACL-valid provenance for all facts" .

# Orifice (Plan) 
{=tag:genesis:plan .prov:Plan}
prov:wasDerivedFrom tag:genesis:goal ;
mdp:constraint "No blank nodes, every fact must be rdf:Statement" .

# First Revolution (Activity)
{=tag:genesis:boot .prov:Activity}
prov:startedAtTime "2026-02-24T16:40:00Z"^^xsd:dateTime ;
prov:qualifiedAssociation [
    prov:hadPlan tag:genesis:plan ;
    prov:agent tag:agent:autonomous
] .
```

### Ignition Criteria

Vortex achieves self-propagation when:
1. **Structural Integrity**: All SHACL validations pass
2. **Causal Continuity**: Every entity has prov:wasGeneratedBy path
3. **Momentum Transfer**: Each result suggests next activity

---

## Conclusion

The PROV-Vortex model provides **mathematical grounding** for provenance management by treating knowledge flow as a physical phenomenon. The toroidal vortex metaphor ensures:

- **Topological Consistency**: No orphaned information through manifold closure
- **Physical Intuition**: Viscosity, pressure, and circulation guide system design  
- **W3C Compliance**: 100% standard PROV-O implementation without custom classes
- **Scalable Application**: Works from paper notebooks to multi-agent AI systems

By constraining information flow through the vortex geometry, we create a **self-correcting knowledge engine** where truth emerges not from authority, but from the mathematical necessity of maintaining causal continuity in a low-entropy provenance manifold.
