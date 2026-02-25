# PROV-Vortex: DIAD Knowledge Engine

The PROV-Vortex implements a DIAD cycle (Document → Intelligence → Action → Document) that creates a self-propelling knowledge engine. Starting from a high-entropy goal state, the system ingests unstructured documents, processes them through internal intelligence activities, validates knowledge via external actions, and outputs grounded documents. Each phase creates pressure differentials (via SHACL constraints) that propel the cycle forward: activities generate entities, entities enable new activities, and the cycle continuously emits actions on both internal state and external world, resembling a living organism that metabolizes information.

The vortex achieves self-propagation through the DIADIADIAD pattern where every violation resolution creates conditions for the next iteration. Goals steer Plans, Plans authorize Activities, Activities generate Entities, and Entities become Documents that can seed new Activities. This creates a complete provenance chain where any final document can be traced back through Activities → Entities → Plans → Goals, ensuring that knowledge never becomes orphaned and that every fact is grounded in both external sources and internal reasoning. The system maintains optimal compression (3-7 statements per document) through hierarchical organization (Statements → Collections → Documents) while preserving full provenance through PROV-O's qualified relationships and temporal metadata.

---

## Folder Structure

```
docs/PROV/vortex/
├── README.md              # This overview
├── HOWTO.md              # Complete implementation guide
├── SEED.md               # Goal and constraint templates
├── VORTEX.md             # Toroidal physics foundation
├── 2D.md                 # 2D vortex dynamics
├── PAPER.md               # Paper-based implementation
├── MEMORY.md              # System overview
├── CRITIQUE.md            # System improvements
└── ttl_vortex/            # Generated RDF graphs
    ├── results.ttl         # Current vortex state
    └── violations.json     # SHACL constraint violations
```

---

## Core Components

### DIAD Cycle Phases

1. **Document Intake**: External sources become `prov:Entity` objects with `prov:hadPrimarySource`
2. **Intelligence Processing**: Internal activities analyze entities using `prov:used` and generate new entities via `prov:wasGeneratedBy`
3. **Action Validation**: External tools validate knowledge with `mdp:tool` and `prov:qualifiedAssociation`
4. **Document Grounding**: Results become grounded documents with complete provenance chains

### Propagation Mechanism

The vortex propagates through **pressure differentials**:
- **Intake Pressure**: External documents unstable until `prov:specializationOf` creates statements
- **Cognitive Pressure**: Unused statements flagged as "stagnant" until `prov:used` by activities
- **Execution Pressure**: Plans incomplete until external `mdp:tool` validation occurs
- **Grounding Pressure**: Activities incomplete until `prov:wasGeneratedBy` entities exist

### Living Organism Analogy

Like a biological organism:
- **Metabolism**: Documents (food) → Activities (digestion) → Entities (energy) → New Documents (growth)
- **Homeostasis**: SHACL constraints maintain optimal compression and prevent knowledge decay
- **Adaptation**: `prov:wasRevisionOf` and `prov:wasInvalidatedBy` enable knowledge evolution
- **Reproduction**: Completed documents can seed new vortex cycles

---

## The Actual Propellants

The Double Vortex operates like a **4-stroke combustion engine** where information and computational energy are the propellants:

### Mass-Momentum System

| Propellant | PROV-O Element | Physical Analogy | Function |
|-----------|---------------|------------------|----------|
| **Mass** | `prov:Entity` | Information content | Fuel that flows through the system |
| **Momentum** | `prov:Activity` | Transformation force | Combustion that moves mass |
| **Energy Source** | `prov:Agent` | Driving force | Plasma that carries energy |
| **Pressure Field** | `prov:Plan` | Constraint boundaries | Orifice plate that shapes flow |
| **Flow Field** | `prov:used/prov:wasGeneratedBy` | Causal field lines | Field lines that guide flow |

### Four-Quadrant Engine Dynamics

```
    Top Left (External)    Top Right (External)
    [Entity Sources]        [Tool Activities]
         ↑                    ↓
         ←→ ←→ ←→ ←→      ← Propagation
    [Grounded Truth]        [LLM Reasoning]
         ↓                    ↑
    Bottom Left (Internal)   Bottom Right (Internal)
    [Statements]            [Inference Activities]
```

**Phase Transitions** (Matter-Energy Interactions):

1. **Intake Phase** (Top Left → Bottom Right):
   - External entities (high pressure, high velocity) enter
   - **Mass transfer**: Raw information gains internal structure
   - **Energy increase**: Processing work raises information density
   - SHACL validation acts as "filter" removing impurities

2. **Power Phase** (Bottom Right → Top Right):
   - Internal activities (low velocity, high pressure) process entities
   - **Energy conversion**: Internal knowledge converted to external action
   - **Maximum extraction**: Plan constraints limit power output
   - **Momentum transfer**: Internal reasoning becomes external tool calls

3. **Exhaust Phase** (Top Right → Bottom Left):
   - External activities (high velocity, low pressure) discharge
   - **Energy dissipation**: Results solidified into truth via SHACL validation
   - **Entropy reduction**: System returns to low-entropy state
   - **Mass solidification**: External actions become grounded statements

### Pressure Differentials Drive Propulsion

The vortex achieves self-propagation through **pressure differentials** created by SHACL constraints:

- **Intake Pressure**: External documents unstable until `prov:specializationOf` creates statements (vacuum pulls entities in)
- **Cognitive Pressure**: Unused statements flagged as "stagnant" until `prov:used` by activities (vacuum forces inference)
- **Execution Pressure**: Plans incomplete until external `mdp:tool` validation occurs (vacuum forces tool use)
- **Grounding Pressure**: Activities incomplete until `prov:wasGeneratedBy` entities exist (vacuum forces generation)

These pressure differentials create **vacuum zones** that the agent must fill, ensuring continuous forward motion. Each violation resolution creates the conditions for the next violation—this is the "perpetual knowledge machine" that transforms high-entropy observations into low-entropy, grounded truth.

### Energy Flow Equation

```
∂E/∂t = Power_in - Power_out + Dissipation
```

Where:
- `Power_in` = External document intake + Internal reasoning
- `Power_out` = External tool calls + Grounded statements
- `Dissipation` = SHACL validation energy loss

The system maintains energy conservation through the DIADIADIAD cycle where every transformation is accounted for in the provenance chain.

## Getting Started

1. **Create SEED.md** with goal and SHACL constraints
2. **Run `ig-cli parse`** to generate initial PROV-O graph
3. **Check violations** with `ig-cli validate`
4. **Let agent resolve** violations through DIAD cycle
5. **Monitor compression** ratio and adjust constraints as needed

The system achieves self-propulsion when every violation resolution creates the conditions for the next iteration, transforming high-entropy observations into low-entropy, grounded knowledge with complete provenance.
