# llm-chat — a self-describing knowledge document

A single-file demo of MD-LD as a complete knowledge-work system: one Markdown
document that is simultaneously prose, a dormant-module database, a signed
ledger, a SHACL-validated graph, and a tiny web service. `llm-chat.mjs` is its
agent console.

## The files

- `llm-chat.md` — the document. Everything lives here; nothing else is state.
- `llm-chat.mjs` — the agent harness. Three modes: chat (default), `log`,
  `serve`.

## The contract

**The file is truth; memory is only a cache.** Every command re-parses the
document fresh, unfolds its dormant modules on purpose, and evaluates the
result. Writes go through an atomic tmp+rename so a crash cannot tear the file.

## Document anatomy

The root graph is an `llm:Document` — navigable at ~60 quads while all payload
content stays collapsed inside `llm:payload` literals:

- **The Walkthrough** — five `llm:Step`s (ontology, tools/agents, meta-shapes,
  conversation, golden graph). Each step holds its draft as a dormant literal
  plus a seal: `llm:canonicalHash` for settled parts, verbose
  `llm:canonicalText` for the small demo part.
- **Daily Log** — `llm:Conversation` modules, one per day, chained by
  `llm:follows` back to `llm:log-origin`. Every message carries a
  `content ‖ author` signature — fool-proofing, not cryptography.
- **Golden graph** — six `.rdf:Statement` nodes the parser auto-elevates into
  `result.statements`: the founding, the label, ownership, the SDKC thesis, the
  gate rule, and the agent's credential-ceiling proposal. Chained by
  `llm:previous`, signed with embedded demo keys, credentialed
  rule/guideline/suggestion by key custody.

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
node llm-chat.mjs serve      # http://localhost:3737 — dashboard + /cmd + /quads.json
```

In chat or on the web: `/records` dumps shape extraction, `/statements` shows
the golden graph, `/verify` checks all seals, `/audit` re-verifies signatures.

## What it proves

Prose documents can carry verifiable subgraphs. Humans rewrite around semantic
carriers; agents manipulate quads; hashes prove nothing drifted; signatures
prove who claimed what; shapes prove the graph still means what it should.
One file, airgappable, self-checking — usable by a person, an agent, or both.
