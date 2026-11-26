# llm-chat — a self-describing knowledge document

A single-file demo of MD-LD as a complete knowledge-work system: one Markdown
document that is simultaneously prose, a dormant-module database, a signed
ledger, a SHACL-validated graph, a working knowledge tool, and a tiny web
service. `llm-chat.mjs` is its agent console.

## The files

- `llm-chat.md` — the document. Everything lives here; nothing else is state.
- `llm-chat.mjs` — the agent harness. Three modes: chat (default), `log`,
  `serve`.

## The contract

**The file is truth; memory is only a cache.** Every command and every HTTP
request re-parses the document fresh, unfolds its dormant modules on purpose,
and evaluates the result. Writes go through an atomic tmp+rename so a crash
cannot tear the file. Command results on the web are one-shot overlays —
rendered once, never persisted.

## Document anatomy

The root graph is an `llm:Document` — navigable while all payload content
stays collapsed inside `llm:payload` literals:

- **The Walkthrough** — five `llm:Step`s (ontology, tools/agents, meta-shapes,
  conversation, golden graph). Each step holds its draft as a dormant literal
  plus a seal: `llm:canonicalHash` for settled parts, verbose
  `llm:canonicalText` for the small demo part.
- **Daily Log** — `llm:Conversation` modules, one per day, chained by
  `llm:follows` back to `llm:log-origin`. Append-only: each exchange adds a
  self-contained message block — membership on the record via
  `llm:memberOf`, replies via `llm:inReplyTo`, every message signed
  `content ‖ author` — fool-proofing, not cryptography.
- **Terms** — a dormant `llm:Module` glossary. Looked-up and taught terms
  accumulate as `llm:Term` nodes (`rdfs:comment` + `rdfs:seeAlso`), policed by
  `TermShape`.
- **Golden graph** — six `.rdf:Statement` nodes the parser auto-elevates into
  `result.statements`: the founding, the label, ownership, the SDKC thesis, the
  gate rule, and the agent's credential-ceiling proposal. Chained by
  `llm:previous`, signed with embedded demo keys, credentialed
  rule/guideline/suggestion by key custody.

## The vocabulary rule

Ontology and shapes are built on the W3C floor — `rdf`, `rdfs`, `sh`, `prov`,
`xsd` — while instance data speaks the document's own `llm:` vocabulary.
`rdf:type`, `rdfs:label`, and the `rdf:Statement` reification are the shared
grounding; everything else in data has an `llm:` name (`attributedTo`, `at`,
`memberOf`, `content`, `role`, `signature`, `follows`…). `/vocab` audits the
boundary: declarations should be W3C-heavy, data `llm:`-heavy.

## The authoring style

Ontology, shapes, and root vocabulary all use the same blended prose: each
classification arrives with its expectation — "a Step is a module that carries
a seal; a step without `canonicalHash` is a draft that forgot to be checked."
Prose teaches the rule; carriers enforce it; the seal proves they stayed in
sync. Shape labels are plural (`Messages`, `Terms`, `Statements`) so extracted
records read like a catalog.

## The agent

The agent is a real (if tiny) knowledge tool:

- `What is X?` / `who is` / `define` / `tell me about` → Wikipedia lookup;
  disambiguation pages and misses get an honest *"I don't know"*.
- Resolved terms are cached into the Terms module — later asks answer from the
  graph, no refetch.
- `X is/means/= definition` → the human teaches; the agent records a
  user-supplied term. Human authority outranks fetched content.
- Anything else → gate-check reply: violations listed, or clean bill with
  shape-record count.

## The loop this demonstrates

1. Declare shapes aspirationally — violations become the work list.
2. Author prose with inline carriers until violations resolve and records
   become meaningful.
3. Seal each module: regenerate canonical text, store the digest.
4. Elevate what must survive: statements, not triples, for decisions.
5. Let the gate judge everything — `evaluate()` runs on every load.

## Using it

```bash
node llm-chat.mjs            # chat: messages append to today's log, signed
node llm-chat.mjs log "..."  # scripted exchange into the day module
node llm-chat.mjs serve      # http://localhost:3737 — chat UI + /cmd + /quads.json
```

In chat or on the web:

- `/records` lists shapes; `/records <ShapeName>` opens entity cards —
  key marker + flat key/value table per record, in a one-shot overlay.
- `/statements` shows the golden graph, `/verify` checks all seals,
  `/audit` re-verifies signatures, `/vocab` audits the W3C/`llm:` boundary.
- Plain messages go to the agent; `What is…` looks things up;
  `X is…` teaches it.

## What it proves

Prose documents can carry verifiable subgraphs *and* working tools. Humans
rewrite around semantic carriers; agents manipulate quads and accumulate
knowledge; hashes prove nothing drifted; signatures prove who claimed what;
shapes prove the graph still means what it should. One file, airgappable,
self-checking — usable by a person, an agent, or both.
