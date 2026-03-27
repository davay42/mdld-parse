[wf] <tag:mdld.workflow.example,2026:>

# MDLD Minimal Research Workflow {=wf:workflow .prov:Entity}

This document records the full research workflow that produced a
minimal SHACL validation model for MDLD workspaces.

The workflow is self-contained and reproducible.  
Every step is represented as a provenance activity that consumes
entities and generates new entities.

The goal is to produce a minimal SHACL shape set capable of validating
core MDLD semantics.

---

## Research Plan {=nih:sha-256-128;4889b626d88785b4eed19b2aa6e5ca24;8 .prov:Plan label}

~~~~~~ {prov:value}
Research goal:
Define a minimal SHACL validation model for MDLD documents.

Steps:

1. Identify the minimal semantic primitives of MDLD.
2. Map those primitives to PROV concepts.
3. Determine which invariants must be enforced by validation.
4. Encode these invariants as SHACL shapes.
5. Produce a minimal reusable SHACL schema.

Success criteria:

- shapes validate core MDLD constructs
- shapes remain ontology-minimal
- shapes rely only on RDF, PROV and SHACL

Outcome:

A portable SHACL shape set usable by MDLD parsers and verification tools.
~~~~~~

---

## Exploration Activity {=wf:exploration .prov:Activity}

This step explores MDLD semantics and identifies the minimal set
of primitives required for a functional system.

Uses plan  
[research plan] {+nih:sha-256-128;4889b626d88785b4eed19b2aa6e5ca24;8 ?prov:hadPlan}

## Exploration notes {=nih:sha-256-128;aaa55e922921171296c05b322320bc7e;5 .prov:Entity ?prov:generated}

~~~~~~ {prov:value}
Core MDLD primitives identified:

1. Entity
2. Activity
3. Plan
4. Content-addressed value
5. Location-based artifact
6. Provenance links

Integrity model:

- ni hash IRIs identify immutable entities
- prov:value represents inline artifacts
- prov:atLocation represents external artifacts
- prov:used and prov:generated describe workflows

Validation requirements:

- entities with ni identifiers must match content hash
- prov:value must appear only once per entity
- prov:Activity must connect inputs and outputs
- plans must exist when referenced
~~~~~~

---

# Shape Design Activity {=wf:shapeDesign .prov:Activity}

This activity formalizes the exploration notes into SHACL validation rules.

Uses plan  
[research plan] {+nih:sha-256-128;4889b626d88785b4eed19b2aa6e5ca24;8 ?prov:hadPlan}

Uses exploration results  
[exploration notes] {+nih:sha-256-128;aaa55e922921171296c05b322320bc7e;5 ?prov:used}

This activity was informed by the exploration step.

[drafting phase] {+wf:exploration ?prov:wasInformedBy}

Generated draft shape model:

## Draft Shape model {=nih:sha-256-128;776aee4fd5e0fe3cf808e5895a12dfb2;9 .prov:Entity ?prov:generated label}

~~~~~~ {prov:value}
Initial validation concepts:

Entity integrity rule
Activity connectivity rule
Plan presence rule
Artifact content rule

Shape design principle:

validate graph structure
avoid imposing domain semantics
keep shapes minimal and composable
~~~~~~

---

# Validation Activity {=wf:shapeValidation .prov:Activity}

This activity refines the shape draft into the final validation schema.

Uses plan  
[research plan] {+nih:sha-256-128;4889b626d88785b4eed19b2aa6e5ca24;8 ?prov:hadPlan}

Uses draft shapes  
[draft shape model] {+nih:sha-256-128;776aee4fd5e0fe3cf808e5895a12dfb2;9 ?prov:used}

This activity was informed by the shape design step.

[shape design] {+wf:shapeDesign ?prov:wasInformedBy}

Generated final SHACL schema:

[./shapes.ttl] {+nih:sha-256-128;4594cd6cd9079dad278ba99078437888;4 prov:atLocation .prov:Entity ?prov:generated}

---

# Completion

The research workflow produced a minimal SHACL validation schema.

The provenance chain is:

plan → exploration activity → exploration notes  
plan + exploration → shape design activity → draft shapes  
plan + draft shapes → validation activity → final SHACL schema

Because every artifact is content-addressed, the workflow and its
outputs remain reproducible and verifiable.

This document therefore records both the research process and
its resulting validation model in a single MDLD workflow artifact.
