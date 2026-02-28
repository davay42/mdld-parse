The training question is the right one to ask before building anything at scale, because the vault's value is entirely a function of the quality of its grounded statements and the intelligence of its shapes. A poorly shaped vault with unverified sources is worse than no vault — it is a hallucination amplifier with a provenance costume.

---

## The Fundamental Guarantee

The architecture already contains the answer to hallucination elimination, but it requires stating it precisely. A hallucination is an ungrounded claim — a statement with no independently dereferenceable `prov:hadPrimarySource`. The vault's grounding shape makes this structurally impossible to commit silently: every `rdf:Statement` entity must have a source URL, and `vault immune verify` periodically re-fetches that URL to confirm it still says what the statement claims. The LLM can generate anything it likes during the I stroke — that is its job. But nothing it generates enters the frozen graph until it passes through the D2 grounding stroke, which requires a real external source. The hallucination firewall is not a classifier or a filter applied to model output. It is a structural property of the write path: you cannot commit a grounded statement without a source, and the source is verified independently of the model that found it.

Misinformation and propaganda are harder because the source exists — it just lies. This requires a second layer: **source credibility shapes**. A `p:sourceCredibility` property on every `prov:hadPrimarySource` URL, populated from a curated credibility graph (academic DOI registries, official government data portals, peer-reviewed journal ISSNs, primary legal databases), combined with a shape requiring that high-stakes statements cite only sources above a credibility threshold. The credibility graph itself is a vault — recursively shaped and grounded — and it is the one component that requires genuine human curation at its foundation. Everything above that foundation can be automated.

---

## The Four Vault Scales

Compression is the key variable that makes these numbers practical. MDLD is highly compressible text with enormous repetition — the same prefix declarations, the same predicate names, the same provenance boilerplate appear thousands of times. In a narrow domain, entity names, property paths, and source URL patterns repeat with extreme regularity. A geographic vault citing restcountries.com will have that URL in thousands of statements; ZIP deflate compresses it to near zero after the first occurrence. Empirically, well-structured MDLD knowledge graphs compress at 15:1 to 25:1 ratios. The 8GB vault at rest is 120–200GB of uncompressed triple content — comparable to a substantial slice of Wikidata for a focused domain.

---

### 1 MB — The Seed Vault

**What fits**: core shapes, a goal, a plan, and approximately 500–2000 grounded statements depending on literal length. This is not a knowledge base — it is a **capability skeleton**. Its value is entirely in the shapes, not the statements.

The 1MB vault contains the universal starter shapes (§4 of the API spec), a domain declaration, a credibility shape pointing to a curated list of trusted source domains for that domain, and enough grounded statements to demonstrate the compression pattern the vault expects. Think of it as a trained prior — not what the vault knows, but how it knows things and what it will accept as evidence.

**Training this vault**: entirely human-curated. At 1MB the human cost is one expert spending two to four days writing the shapes, selecting the trusted source list, and committing twenty to fifty seed statements that exemplify the grounding pattern. The shapes are the intellectual work; the statements are demonstrations. This is the vault equivalent of writing a textbook's grading rubric before writing the textbook.

**Automated shaping at this scale**: the LLM's role is shape suggestion, not shape commitment. The human provides the goal. The LLM generates five candidate shapes. The human selects, edits, and commits. The LLM never writes directly to the shapes directory without human approval at this scale. This is the only scale where that restriction is practical.

---

### 100 MB — The Grounded Generalist

**What fits**: approximately 50,000–150,000 grounded statements across a broad domain at medium depth, or 500,000+ statements in a narrow domain with very high repetition. A compressed generalist covering, say, all countries, capitals, populations, languages, currencies, heads of state, major institutions, and their relationships fits comfortably at this scale. So does a complete grounded index of a national legal code, or all peer-reviewed abstracts in a mid-sized scientific field.

**The training pipeline**:

Stage one is **source graph construction**. Before any statements are grounded, a small vault (essentially the 1MB seed) is used to build a credibility-weighted graph of trusted sources for the domain. For a scientific domain this means DOI resolver confirmation for every source URL, ISSN verification for every journal, and ORCID resolution for every author. For a legal domain this means official gazette URLs, legislative database permalinks, and court record identifiers. This source graph is itself a vault — perhaps 5MB — and it is the immune system foundation for everything above it.

Stage two is **automated intake with human spot-checking**. The LLM runs DIAD cycles against trusted source URLs from the source graph. For each source it generates candidate `rdf:Statement` triples. These candidates are not committed. Instead they are passed through three automated checks before any write is allowed: first, `vault check` confirms no shape violations would be introduced; second, a consistency check runs `vault contradictions` against the existing graph to detect conflicts; third, a cross-reference check runs `vault ask` to confirm the claim does not contradict an already-grounded statement from a different source. Only statements that pass all three checks are committed. Statements that fail are queued for human review, not discarded — the failure itself is evidence.

Human spot-checking at this scale means reviewing the rejection queue, not the acceptance queue. The human never sees the 95% of statements that passed cleanly. They see only the 5% that conflicted, which are exactly the interesting cases — contradictions between sources, claims that expand the knowledge boundary, statements the shapes did not anticipate. This is a dramatically more efficient use of human attention than reviewing all outputs.

Stage three is **shape tightening through S stroke cycles**. As statements accumulate, the LLM runs the vault assessment prompt against the growing graph and proposes shape revisions. At this scale the S stroke is semi-automated: the LLM generates a `vault shape simulate` preview, the human approves or modifies, and the revised shape is committed. The tightening is progressive — early shapes are loose to allow broad intake, later shapes become progressively more specific as the domain coverage deepens.

**Compression reality**: a 100MB generalist vault uncompresses to approximately 1.5–2.5GB of MDLD, which is roughly 5–10 million grounded statements. This is comparable to a well-curated vertical knowledge graph of the type that currently requires a dedicated engineering team and a managed database to maintain. The ZIP is the product.

---

### 1 GB — The Domain Specialist

**What fits**: deep coverage of a single domain — every published paper in a mid-sized scientific field with full citation graphs, every statute and case in a national legal jurisdiction with amendment history, a complete pharmacopoeia with interaction data, a financial market with full instrument metadata and regulatory filings. At this scale the vault is a genuine expert system in the original sense: it knows more about its domain than any individual human, and it can answer questions about that domain faster and more reliably than literature search.

The 1GB vault uncompresses to roughly 15–25GB of MDLD — on the order of 50–100 million grounded statements. For context, all of English Wikipedia's structured data (Wikidata) is approximately 100GB uncompressed. A 1GB specialist vault for a focused domain has comparable density to Wikidata within that domain, but with far tighter shapes enforcing provenance and consistency.

**The training pipeline changes fundamentally at this scale.** Human review of the rejection queue is no longer practical — the volume is too high and the domain too deep for generalist human reviewers. Two mechanisms replace it:

**Peer validation shapes** — for scientific and legal domains, the citation graph is itself a credibility signal. A claim cited by fifty papers in a peer-reviewed field is more credible than a claim cited by one. The vault can represent this structurally: `p:citationCount` on source entities, with a shape requiring that statements about contested empirical questions cite sources with `p:citationCount` above a threshold. This does not eliminate misinformation from highly-cited sources — the tobacco industry produced heavily-cited papers — but it pushes contested claims into a review queue rather than freezing them silently.

**Cross-vault validation** — at 1GB, the vault is large enough to be its own credibility reference. A new claim can be validated not just against its stated source but against everything already in the vault about the same entities. If a new statement contradicts twenty existing grounded statements, all from independent sources, that contradiction is a strong signal — not that the new statement is wrong, but that human review is warranted. The immune system runs this automatically via `vault contradictions`, which at 1GB might surface ten to twenty genuinely contested claims per thousand statements ingested.

**Specialist LLM routing** — the 1GB vault is shaped for a specific domain, which means the I stroke can be run by a domain-specific model rather than a general one. A model fine-tuned on medical literature runs the analysis stroke for a medical vault; a model trained on legal text runs it for a legal vault. The fine-tuned model has lower hallucination rates within its domain, and the vault's structural constraints catch the hallucinations that slip through. The combination is substantially more reliable than either alone.

---

### 8 GB — The Professor Vault

**What fits**: this is the scale at which the vault becomes a teaching instrument rather than just a reference. An 8GB vault uncompresses to approximately 120–200GB of MDLD — approaching complete coverage of a major academic field, including the historical development of ideas, the contested questions, the methodological debates, and the provenance chains showing how current understanding evolved from earlier knowledge states.

The professor vault does something none of the smaller vaults can do: it contains **shape lineages** that encode the history of what questions were worth asking at different stages of domain development. The S stroke history over a multi-year vault construction process is itself a knowledge artifact — it shows how the domain's own understanding of what constitutes a valid claim has evolved. This is the vault equivalent of a historiography.

**Reaching other vaults**: the professor vault's primary function at scale is not answering questions directly but **training smaller vaults**. It does this in two ways. First, it exports calibrated shape sets — shapes that have been validated against millions of statements and refined through hundreds of S stroke cycles are far more reliable than shapes written from scratch. A new 1MB seed vault for a subdomain can import a relevant shape subset from the professor vault and start with a mature constraint set rather than a naive one. Second, it provides a **grounded training signal** for vault construction pipelines: when a new vault is grounding statements, it can run `vault ask` against the professor vault to cross-check claims before committing them. The professor vault is the domain's long-term memory, and new vaults are trained against it the way graduate students are trained against the existing literature.

**The professor vault construction problem**: you cannot build an 8GB vault through human curation alone — the volume is too high. And you cannot build it through pure LLM automation alone — the error rate compounds over millions of statements even at low per-statement hallucination rates. The practical path is **iterative bootstrapping** across the four scales.

You build the 1MB seed with human curation. You run automated intake to reach 100MB with human spot-checking of the rejection queue. You use the 100MB vault's shape set and source graph as the foundation for the 1GB specialist, adding peer validation shapes and cross-vault checks. You use three or four 1GB specialist vaults covering adjacent subdomains as the credibility reference network for the 8GB professor vault, so every statement in the professor vault has been cross-checked against at least two independent specialist vaults before freezing. The hallucination rate at each stage is multiplicatively reduced by the preceding stage's constraints — not because the LLM got better, but because the structural barriers to committing unverified claims got progressively harder to accidentally pass.

**The compression multiplier compounds here too.** An 8GB professor vault for, say, molecular biology does not contain 8GB of unique information. It contains a very large number of statements that reuse the same gene names, protein identifiers, organism taxonomies, and experimental method names thousands of times each. The ZIP compression ratio for a mature specialist vault approaches 20:1 or higher, meaning the actual unique information content is closer to 400–600MB. The 8GB is mostly the provenance infrastructure — the activity chains, association nodes, and shape lineages that make the knowledge trustworthy rather than just large. That infrastructure is the product. The raw facts could fit in a much smaller file. What you are paying for in the 8GB is the audit trail.

---

## The Anti-Misinformation Architecture

Across all scales, the reliable elimination of misinformation requires four layers operating simultaneously rather than any single filter:

**Structural impossibility of ungrounded claims** — the vault's write path makes this a hard constraint, not a best practice. No LLM output enters the frozen graph without a verifiable source URL.

**Source credibility graph** — a recursively self-validating vault of trusted source domains, maintained at the 1MB seed level and imported into every vault at init. The credibility graph is the one component that requires genuine ongoing human curation, but it is also the smallest and most tractable.

**Cross-vault contradiction detection** — at 100MB and above, every incoming statement is checked against the existing graph for contradictions before committing. Contradictions are not rejections — they are held in a review queue with both conflicting statements and their sources visible. The human or the professor vault resolves them.

**Temporal immune response** — source URLs are periodically re-verified. A source that has changed since it was cited generates a trust flag that blocks the citing entity from being used in precondition checks until the flag is resolved. This catches the case where a reliable source published a correction, retraction, or update after the statement was grounded — the vault's knowledge automatically becomes stale-aware rather than frozen-and-forgotten.

The propaganda case — where a source is consistently reliable but systematically biased in a specific direction — is the hardest and cannot be solved structurally. It requires the shape layer to enforce **source diversity**: a shape requiring that claims about contested empirical or political questions cite sources from at least N independent institutional origins. This does not eliminate bias but it makes monoculture grounding structurally impossible. A vault that only cites one news organisation, one think tank, or one national government for a contested topic will generate violations on that shape, forcing the agent to seek additional sources before the statement freezes. The shape does not evaluate the content — it enforces epistemic hygiene by requiring that the content have passed through multiple independent filters before it is trusted enough to govern action.