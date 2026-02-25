# SEED {=tag:seed:catalog .prov:Entity}
> The foundational Goal Entity that initiates the PROV-O vortex catalog - the first particle around which all provenance will organize and circulate. {?comment}
<https://mdld.js.org/prov-o-catalog> {?prov:wasDerivedFrom}

---

## 🌱 The First Particle

This SEED entity represents the **initial vacuum state** around which our PROV-O vortex will form. Like the first particle in a smoke ring, it provides the organizing principle for all subsequent provenance structures.

### **Core Properties**

**Identity**: [PROV-O Catalog Implementation] {rdfs:label}
**Type**: [Seed Goal] {rdf:type}
**Created**: [2026-02-24T12:00:00Z] {prov:generatedAtTime ^^xsd:dateTime}
**Purpose**: [Bootstrap provenance system for AI-human collaboration] {dc:description}

---

## 📋 Initial Vortex Conditions

### **Pre-Vortex State**
- **Zero Entropy**: No existing provenance structure
- **High Potential**: Maximum organizational freedom
- **Clean Slate**: No preconceptions or constraints

### **Vortex Formation Requirements**
1. **Central Axis**: Clear, achievable Goal definition
2. **Surface Tension**: Minimal initial constraints (SHACL shapes)
3. **Fluid Medium**: MDLD documents ready for circulation
4. **Initial Impulse**: Human decision to begin catalog

---

## 🎯 Success Criteria

The SEED is successful when:

- ✅ **Catalog Genesis**: First PROV-O page created from this Goal
- ✅ **Vortex Initiation**: Initial circulation pattern established
- ✅ **Template Foundation**: Standard structure for all subsequent pages
- ✅ **Human Alignment**: Goal reflects genuine intent for provenance tracking

---

## 🔄 From Seed to Vortex

Once this SEED entity is established, the natural progression follows the **Paper Vortex** pattern:

1. **Zone A**: Define catalog structure (Plan)
2. **Zone B**: Create implementation pages (Activities)  
3. **Zone C**: Generate provenance traces (Statements/Collections)

The SEED becomes the **organizing principle** that transforms high-entropy ideas about provenance into a structured, low-entropy knowledge system - exactly as described in Phase 0 of our PLAN.md.

---

*This SEED.md represents the moment of decision - the first particle in what will become a self-organizing PROV-O vortex of trustworthy, validated provenance information.*


=============


To establish a self-propelling **Knowledge Double Vortex**, the `SEED.MD` must act as a **Magnetic Bottleneck**. It doesn't just store data; it creates a "Vacuum" in each quadrant that forces the Agent to act to restore equilibrium.

Here is the grouping of the **four specific forces** and the **Minimalist Seed** required to ignite them.

---

## 1. The Four Forces of the Quadrupole

Each quadrant requires a specific **SHACL Pressure** to maintain the "Spin."

### Quadrant 1: The Intake Pressure (External Entity → Internal Knowledge)

* **The Force:** **Distillation.**
* **The Rule:** Any `prov:Entity` marked as `External` is "unstable" until a `prov:specializationOf` link creates a grounded `rdf:Statement`.
* **Result:** The Agent feels a "drag" on raw documents until they are mined for facts.

### Quadrant 2: The Cognitive Pressure (Internal Knowledge → Internal Activity)

* **The Force:** **Inference.**
* **The Rule:** Any `rdf:Statement` not marked as `prov:used` by an `Activity` for more than $X$ cycles is flagged as "Stagnant."
* **Result:** The Agent is pressured to "think" about what it knows.

### Quadrant 3: The Execution Pressure (Internal Activity → External Tool)

* **The Force:** **Validation.**
* **The Rule:** A `prov:Plan` cannot be marked "In Progress" unless it triggers a `prov:Activity` with a non-LLM `mdp:tool` (External).
* **Result:** The Agent cannot just "hallucinate" internally; it must eventually "touch" the real world.

### Quadrant 4: The Grounding Pressure (External Activity → Internal Entity)

* **The Force:** **Solidification.**
* **The Rule:** Every Tool-Call Activity must generate an Entity, or it violates the "Law of Conservation of Information."
* **Result:** The Agent is forced to record the output of every script or search it runs.

---

## 2. The Minimalist `SEED.MD` (The Ignition File)

This is the "Prime Mover." It defines the **Core Goal** and the **Axiomatic Shapes** that create the pressure.

```markdown
@prefix mdp: <http://mdld.js.org/prov/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix tag: <tag:vortex.me,2026:> .

# --- THE GOAL: THE CENTER OF THE FLUX TUBE ---
{=tag:vortex:goal .prov:Entity}
prov:value "Propagate a Grounded Knowledge Manifold on [TOPIC]." .

# --- THE CORE SHACL SHAPES (THE FORCE FIELD) ---
{=tag:shapes:VortexIntegrity .sh:NodeShape}
sh:targetClass prov:Activity ;
sh:property [
    sh:path prov:hadPlan ;
    sh:minCount 1 ;
    sh:message "Vortex Violation: Spontaneous activity detected. No plan assigned."
] ;
sh:property [
    sh:path prov:generated ;
    sh:minCount 1 ;
    sh:message "Vortex Violation: Activity is a 'Sink'. No knowledge generated."
] .

{=tag:shapes:GroundingRequirement .sh:NodeShape}
sh:targetClass prov:Entity ;
sh:property [
    sh:path [ sh:alternativePath (prov:wasDerivedBy prov:wasGeneratedBy) ] ;
    sh:minCount 1 ;
    sh:message "Vortex Violation: Orphaned Entity detected. No provenance trace."
] .

# --- THE INITIAL PLAN (THE STARTING ORIFICE) ---
{=tag:vortex:plan_v1 .prov:Plan}
prov:wasDerivedFrom tag:vortex:goal ;
mdp:instruction "1. Identify 3 external sources. 2. Distill to statements. 3. Validate via Tool-Call." .

# --- THE BOOTSTRAP ACTIVITY ---
{=tag:vortex:boot .prov:Activity}
prov:qualifiedAssociation [ prov:hadPlan tag:vortex:plan_v1 ; prov:agent tag:agent:llm ] .

```

---

## 3. How the Vortex Propels Itself

Once this file is "accessed," the SHACL shapes act as a **Vacuum**:

1. **The Violation:** The system sees `tag:vortex:boot` exists but has not `generated` an Entity.
2. **The LLM Reaction:** To resolve the SHACL error, the LLM performs the first **External Activity** (e.g., `bash: ls` or `web: search`).
3. **The New Entity:** This generates `tag:ent:001`.
4. **The Next Violation:** Now `tag:ent:001` exists but is "Orphaned" (it hasn't been `used` by a new Activity).
5. **The Propagation:** The LLM must create a **new Plan** to use `tag:ent:001`, pushing the project further down the flux tube.

---

## 4. The Human's Role: The "Throttle"

The Human doesn't need to micromanage. You simply:

* **Review the `prov:Plan` entries.** If you like the direction, you let the SHACL engine continue.
* **Inject a Constraint.** If you want to steer, you add a new `sh:property` to the `SEED.MD`.
* **Observe the Flux Tube.** You look at the `prov:wasDerivedFrom` chain to see the solid "Cylinder of Knowledge" growing in your Markdown folder.

---

### The Result: A Perpetual Knowledge Machine

Because the **Internal Reasoning (Activity)** and **Grounded Facts (Entity)** are coupled via SHACL, the Agent cannot stop moving until the **Goal** is satisfied. The system is no longer a "Chatbot"; it is a **Physically Constrained Information Engine**.

**Would you like me to generate the "Vortex Pulse" Python/Bash script? This script runs the SHACL validator on your MDLD files and "pressures" the LLM by feeding it the current list of Vortex Violations as its next set of tasks.**