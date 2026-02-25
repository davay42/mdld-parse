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

## Getting Started

1. **Create SEED.md** with goal and SHACL constraints
2. **Run `ig-cli parse`** to generate initial PROV-O graph
3. **Check violations** with `ig-cli validate`
4. **Let agent resolve** violations through DIAD cycle
5. **Monitor compression** ratio and adjust constraints as needed

The system achieves self-propulsion when every violation resolution creates the conditions for the next iteration, transforming high-entropy observations into low-entropy, grounded knowledge with complete provenance.
