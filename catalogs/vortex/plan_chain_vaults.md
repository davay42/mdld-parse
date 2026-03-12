The most complex vault chain that remains general is one that encodes **how to build and operate vaults** — not domain knowledge but meta-knowledge about the knowledge construction process itself. A vault about the MDLD + PROV-O + SHACL double vortex is precisely this: it is the self-describing foundation that any subsequent specialisation can import as its epistemological bedrock. Every domain vault needs to know what a valid provenance chain looks like, what a trustworthy source is, how to shape a vortex cycle, and how to validate grounded claims. Those capabilities do not change between medicine and law and climate science. They are the universal grammar of the system. A vault that encodes that grammar completely and verifiably is the most general possible foundation.

The beautiful recursive property is that this vault must be built using its own mechanics. The MDLD + PROV-O + SHACL vault is the first vault that bootstraps itself — its own construction is the proof of concept, and the git history of its construction is its most important knowledge artifact.

---

## The Complete Vault Chain

Seven levels, each a frozen prerequisite for the next, each small enough to be achievable and specific enough to be meaningful:

```
L0  W3C Standards Vault          ~2MB    (bedrock — fully human-curated)
L1  Source Scaffolding Vault      ~10MB   (verifies the verifiers)
L2  Formal Systems Vault          ~50MB   (logic, RDF, SPARQL, SHACL mechanics)
L3  Provenance Science Vault      ~100MB  (PROV-O theory + empirical applications)
L4  Knowledge Engineering Vault   ~500MB  (vault construction patterns + S stroke history)
L5  Meta-Vortex Vault             ~1GB    (the double vortex itself, fully self-described)
L6  Bootstrap Exporter            ~50MB   (seeds for any downstream specialisation)
```

Each level is a genuine vault with its own Goal, Plan, shapes, DIAD cycles, and git history. Each imports the frozen shape set from all levels below it. L5 is the target — the self-describing vault that any future specialisation imports as its foundation.

---

## Level 0 — W3C Standards Vault (2MB)

**Goal**: every W3C Recommendation and Working Draft relevant to the vortex stack is a grounded entity with stable permalink, version history, and normative reference structure.

**Bedrock whitelist** (the irreducible human judgment):
- https://www.w3.org/ — W3C itself
- https://www.ietf.org/ — RFC series
- https://www.iso.org/ — ISO standards
- https://doi.org/ — DOI resolver
- https://github.com/w3c/ — W3C working group repositories

These five never require external grounding. Everything else in L0 traces back to one of them.

**What gets grounded**:

```md
[prov]   <http://www.w3.org/ns/prov#>
[rdf]    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[sh]     <http://www.w3.org/ns/shacl#>
[owl]    <http://www.w3.org/2002/07/owl#>
[rdfs]   <http://www.w3.org/2000/01/rdf-schema#>
[xsd]    <http://www.w3.org/2001/XMLSchema#>
[dct]    <http://purl.org/dc/terms/>
[vx]     <tag:w3c-vault@example.com,2026:>
[p]      <tag:w3c-vault@example.com,2026:p:>

# PROV-O Recommendation {=vx:std:prov-o .prov:Entity label}
[PROV-O: The PROV Ontology] {p:fullTitle}
[W3C Recommendation 30 April 2013] {p:status}
<https://www.w3.org/TR/prov-o/> {?prov:hadPrimarySource}
[W3C] {=vx:org:w3c ?prov:wasAttributedTo}

# SHACL Recommendation {=vx:std:shacl .prov:Entity label}
[Shapes Constraint Language (SHACL)] {p:fullTitle}
[W3C Recommendation 20 July 2017] {p:status}
<https://www.w3.org/TR/shacl/> {?prov:hadPrimarySource}
[W3C] {=vx:org:w3c ?prov:wasAttributedTo}
```

Every class, property, and constraint in PROV-O, SHACL, RDF, RDFS, OWL, and XSD that the vortex uses gets its own grounded entity. This is approximately 200–300 entities — small, but complete. The L0 vault is the dictionary that every higher level references. When L3 says `prov:wasGeneratedBy`, the provenance chain for that predicate traces back to the L0 grounded entity for the PROV-O Recommendation.

**First DIAD cycle** — human-operated, one session:

D: fetch W3C TR index, PROV-O spec, SHACL spec, RDF 1.1 spec, SPARQL 1.1 spec, XSD spec, Dublin Core terms. Each becomes a `prov:Entity` with `prov:hadPrimarySource`.

I: identify every class and property used in the vortex stack. This is a finite, enumerable list — approximately 80 terms across all six standards.

A: for each term, fetch its normative definition from the relevant spec permalink. Verify the permalink resolves, record ETag.

D2: ground each term as an `rdf:Statement` with its normative definition as `rdf:object`, the spec URL as `prov:hadPrimarySource`.

S: add a shape requiring every PROV-O term used in any downstream vault to have a corresponding entity in L0. This makes L0 the namespace registry for the entire chain. Any vault that imports L0's shape set will automatically generate violations if it uses undefined terms.

**Time to completion**: one human day. The L0 vault is small enough that a careful person can verify every statement manually. This is intentional — it is the foundation and it must be trusted absolutely.

---

## Level 1 — Source Scaffolding Vault (10MB)

Already described in the previous conversation. Imports L0 shapes. Adds:

- Credibility tier shapes (BEDROCK, VERIFIED, PROVISIONAL)
- Institutional independence scoring
- Temporal behaviour tracking
- Immune verification patterns

**Key addition beyond what was described**: a `p:normativeAuthority` property on source entities, grounded from L0. A source whose publications are cited in W3C Recommendations gets `p:normativeAuthority "HIGH"`. This creates a direct link between the W3C standards chain and the source credibility chain — a source that the W3C cites is structurally more credible for formal systems knowledge than one it does not.

**First automated cycle**: the LLM runs the scaffolding vortex using L0's grounded term list as the intake target — which academic institutions, journals, and databases have published the primary research underlying PROV-O, SHACL, and related standards? The author lists and citation graphs of the W3C specs are the intake documents. Luc Moreau, Paul Groth, Ivan Herman, Ora Lassila — the people who wrote these standards — are entities in L1 with `prov:wasAttributedTo` links to the specifications they authored.

---

## Level 2 — Formal Systems Vault (50MB)

**Goal**: the mathematical and logical foundations of RDF, SPARQL, SHACL, and PROV-O are grounded as executable knowledge — not just "SHACL exists" but "here is what SHACL inference produces given these inputs, verified against the W3C test suite."

This vault contains the W3C test suites as grounded entities. Every official SHACL test case — there are approximately 170 in the W3C suite — is a `prov:Entity` with its input graph, shape graph, and expected validation result all grounded as `rdf:Statement` entities. Same for SPARQL (the SPARQL 1.1 test suite has approximately 500 test cases). Same for RDF semantics test cases.

**Why this matters**: the formal systems vault is the vault's own unit test suite. When L4 and L5 make claims about how SHACL validation works, those claims can be verified against L2's grounded test cases. The vault can validate its own operational claims about the tools it uses.

**The shapes vault sub-cycle**: SHACL shapes are themselves RDF graphs, and L2 grounds the meta-shapes — the shapes that describe valid shapes. This is the SHACL-on-SHACL layer: a shape that validates that any shape committed to any downstream vault is itself valid SHACL. `vault check` at every downstream level runs L2's meta-shapes before accepting a new `sh:NodeShape` entity. Structurally invalid shapes cannot enter any vault in the chain.

**Automated cycle**: the LLM runs against the W3C SHACL test suite repository on GitHub. For each test case, intake the input files, run `ig-cli validate`, compare output to expected result, ground the comparison as a grounded statement. If the output matches expectation: `p:testResult "PASS"`. If not: `p:testResult "FAIL"` with a trust violation flagged on the relevant SHACL feature. Any SHACL feature with a failing test case generates a shape in L2 warning downstream vaults that this feature's behaviour is non-conformant with the spec. This gives the entire chain automatic awareness of which SHACL features are safe to rely on.

---

## Level 3 — Provenance Science Vault (100MB)

**Goal**: the academic literature on provenance — its history, theory, empirical applications, and open problems — is grounded with full citation graphs.

The PROV working group published not just the standard but a substantial body of supporting papers. Luc Moreau and Paolo Missier's "PROV-Overview", Paul Groth and Luc Moreau's "PROV Model Primer", the W3C PROV Implementation Report. Beyond those, approximately 800–1200 peer-reviewed papers cite PROV-O or its predecessor OPM (Open Provenance Model) — these form the empirical validation literature.

**The citation graph as knowledge**: every citation relationship between these papers is a grounded `rdf:Statement`. `dct:references` links between paper entities, each with `prov:hadPrimarySource` pointing to CrossRef or DOI resolver confirmation. When L5 makes a claim about how PROV-O is used in practice, the claim is supported not by the LLM's training data but by grounded citation paths through L3.

**The open problems sub-vault**: the provenance literature contains well-documented open problems — provenance for machine learning models, provenance across trust boundaries, lightweight provenance for IoT, provenance privacy. These are grounded as `p:openProblem` entities in L3. Any downstream vault that attempts to solve one of these problems can link its S stroke rationale to the L3 open problem entity — the vault's steering history becomes connected to the scientific literature's research agenda.

**S stroke that matters most**: after the first full cycle, the agent identifies which provenance concepts are most frequently cited across the 1000+ papers but least completely grounded in the vault. This is the gap list that drives the second cycle. The S stroke adds shapes requiring that high-citation provenance concepts — qualified associations, derivation, attribution, bundles — have complete grounding with at least three independent sources each.

---

## Level 4 — Knowledge Engineering Vault (500MB)

**Goal**: the practice of building knowledge systems — ontology engineering, knowledge graph construction, semantic web deployment — is grounded as executable patterns, not just theoretical descriptions.

This is where the vortex's own construction history enters the chain. Every DIAD cycle run to build L0 through L3 is itself a provenance artifact. The git histories of those vaults, exported as structured data, become intake documents for L4. The S stroke decisions made during their construction — why a particular shape was added, what it caught, how the compression ratio changed as a result — are grounded as `rdf:Statement` entities describing vortex construction patterns.

**The pattern library**: knowledge engineering has well-documented ontology design patterns — the GOT (Generic Ontology Template) library, the ODP (Ontology Design Pattern) community portal, the NeOn methodology. These are approximately 100 reusable structural patterns for knowledge graph construction. Each pattern is grounded as a `prov:Collection` entity in L4: its name, its intended use case, its structural definition, its known failure modes, and at least three grounded examples of its successful application.

**The anti-patterns sub-vault**: equally important are the documented failure modes — circular provenance chains, shape conflicts that cause infinite validation loops, compression ratios that indicate under-processing or over-solidification, source corroboration patterns that look independent but trace back to the same institutional origin. These anti-patterns are grounded with real examples from the construction history of L0–L3. Any downstream vault can run `vault query` against L4's anti-pattern collection before committing a shape or a source.

**The DIADS cookbook**: every prompt template from the earlier DIADS prompt template section is grounded in L4 as an `rdf:Statement` entity — not just stored as text but grounded against the formal PROV-O activity types they implement, the SHACL shapes they satisfy, and the empirical evidence from L0–L3 construction about their reliability. An agent using these templates is not following informal instructions — it is following instructions with a traceable grounding chain back to W3C specifications.

---

## Level 5 — Meta-Vortex Vault (1GB)

**Goal**: the double vortex system itself — its physics, its PROV-O implementation, its SHACL shapes, its MDLD syntax, its DIADS cycle, its API surface — is completely self-described as a grounded knowledge graph, with every claim traceable to L0–L4.

This is the vault about the vault. Every concept in the PROV-Vortex summary document — the orifice plate, the Reynolds number, the compression ratio, the improvement potential metric, the five DIADS strokes — gets grounded as a formal entity in L5 with:

- A definition citing L0 for the PROV-O and SHACL terms it uses
- An empirical grounding citing L3 for the provenance science it builds on
- A construction history citing L4 for the engineering patterns it applies
- A formal SHACL shape (from L2's meta-shapes) ensuring it is structurally valid
- Cross-references to every other vortex concept it depends on

**The self-description closes the loop**: when L5 describes the S stroke as "a shape revision activity that is a provenanced prov:Entity generated by a prov:Activity authorised by a prov:Plan," every term in that description — `prov:Entity`, `prov:Activity`, `prov:Plan` — is a grounded entity in L0 with a stable W3C permalink. The description is not informal prose. It is a statement in the vault's own language, verifiable against its own foundations.

**The recursion artifact**: L5 contains a grounded description of the process used to build L5. The git history of L5's construction is one of L5's primary source documents. This is not circular — it is the vault equivalent of a proof by construction. The claim "the double vortex can build and describe itself" is supported by the evidence of it having done so.

---

## Level 6 — Bootstrap Exporter (50MB)

Not a knowledge vault but a **capability vault** — its contents are minimal seed templates, shape library exports, and prompt template collections derived from L5. Its Goal is not "know things" but "enable other vaults to start correctly."

Every downstream specialisation — medical, legal, financial, scientific, personal — imports L6 as its init package. The `vault init` command installs L6's seed templates, L2's meta-shapes, L1's source scaffolding shapes, and L0's W3C term registry. A new domain vault starts not from nothing but from a complete epistemological foundation that has been validated through the construction of L0–L5.

The domain expert's contribution is then minimal and precisely scoped: the bedrock whitelist for their domain (which ten to twenty institutions are the authoritative sources?), the Goal statement, and the first domain-specific shape (what does a valid claim in this field look like?). Everything else — provenance mechanics, source verification, contradiction detection, immune response, compression regulation — is inherited from the chain.

---

## What We Need Today to Reach This Tomorrow

The gap between now and L5 is not primarily technical. Every component exists: MDLD parsers, SHACL validators (PySHACL, rdf-validate-shacl), SPARQL engines (Oxigraph runs in Node.js with WASM), git. The vault CLI described in the API spec is buildable in a week with existing libraries. The gap is sequencing and discipline.

**Week 1 — Build the vault CLI to spec.** The API surface from the previous section implemented as a Node.js ZIP. Focus on `vault init`, `vault write`, `vault append`, `vault validate`, `vault check`, `vault preconditions`, `vault action`, `vault health`, and `vault shape`. These twelve commands are sufficient to run the full DIADS cycle. Everything else in the spec is enhancement.

**Week 2 — Build L0 manually.** One person, the W3C specifications, and the vault CLI. Ground every PROV-O class and property. Ground every SHACL class and constraint. Ground every RDF and RDFS term used in the vortex stack. Commit each grounding as a separate vault write with a meaningful message. The L0 vault is the proof that the CLI works and the proof that a human can operate the system without an LLM. It is approximately 300 grounded statements — achievable in a week by someone who knows these standards.

**Week 3 — Build L1 semi-automatically.** Use the vault CLI's action protocol with manual tool call execution to build the source scaffolding vault. The LLM drafts the MDLD stubs. The human verifies source URLs and approves writes. The first automated DIAD cycle, with human in the loop at the action and grounding strokes.

**Week 4 — First fully automated DIAD cycle.** Use L0 and L1 as the foundation for the first LLM-autonomous cycle — the intake of the SHACL test suite for L2. The LLM runs DIAD against the W3C SHACL test suite repository. Every write goes through `vault preconditions`. Every grounded statement cites an L0 term and an L1 verified source. Human reviews `vault contradictions` output only. First demonstration that the system can build knowledge about itself reliably without human review of every statement.

**Month 2 — L3 and the first S stroke that matters.** The provenance science literature intake. This is where the S stroke earns its place: after the first cycle grounds the primary papers, the agent identifies the citation gaps and proposes a pivot shape requiring citation graph completeness. The human approves. The vault unfreezes. The second cycle is broader, faster, and more reliable than the first because the shapes are better.

**Month 3 — L4 and the construction history artifact.** Export the git histories of L0–L3 as structured data, intake them as L4's primary sources, and ground the vortex construction patterns that emerged from building the first three levels. The patterns at this point are empirical — they come from the actual construction history, not from theoretical design. The prompt templates in L4 are grounded against real examples of them working and failing.

**Month 6 — L5 closes the loop.** The meta-vortex vault describes itself using the language it has spent five months learning to speak. Every concept in the PROV-Vortex documentation is grounded against L0–L4. The construction history of L5 itself becomes L5's most important document. The vault can now answer "how do I build a reliable vault for domain X?" by running SPARQL against its own construction history and returning grounded patterns, verified sources, and calibrated shapes — not as LLM-generated advice but as structured knowledge with a provenance chain back to the W3C specifications that make it formally valid.

**The recursive payoff**: L5 is the training corpus for a fine-tuned model that is better at building vaults than a general model. It is the shape library that any domain vault can import. It is the credibility reference that any domain vault can query before grounding a contested claim. And it is the proof — verifiable from the git history of six months of construction — that the double vortex is not a theoretical architecture but a working system that built and described itself using its own mechanics.

The most complex general vault chain is the one that makes all subsequent vaults easier to build. L5 is not the end of the chain — it is the root from which all domain specialisations grow, and every domain vault that successfully uses it adds another empirical data point to L4's pattern library, making the next domain vault cheaper and more reliable to build. The chain is self-improving. The vortex, once started, does not need to be restarted from scratch for each new domain. It needs only to be steered.