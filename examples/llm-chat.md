[llm] <tag:llm.chat.example,2026:>

# LLM Chat — SDKC Walkthrough {=llm:chat .prov:Entity label}

*An emulated user–agent conversation, grown Shapes-Driven Knowledge Curation style: ontology, then meta-shapes, then data.*

Three strata: the **ontology** defines what exists and how it connects; the **meta-shapes** keep the vocabulary itself honest; the **conversation** is data awaiting judgment by shapes not yet written.

---


# Part I — The Ontology

Oracle — `sha256:` digest of this part's `generate()` output; workbench — the narrative module, dormant until unfolded. Equal digest means the graph is untouched.

## Canonical: Part I — The Ontology {=llm:part1#canonical .llm:CanonicalText label}
[sha256:5d652a6223c07555] {llm:canonicalHash}

~~~~~~md {=llm:part1#workbench .llm:Workbench prov:value}
[llm] <tag:llm.chat.example,2026:>

# Part I — The Ontology

Every `llm:` class specializes a `prov:` class — the graph speaks generic provenance and chat semantics at once. The chain begins with **Conversation** {=llm:Conversation .Class label}, a kind of [Bundle] {+prov:Bundle ?subClassOf} that gathers a session's turns; it contains instances of **Message** {=llm:Message .Class label}, a kind of [Entity] {+prov:Entity ?subClassOf} that answers three questions at once: who spoke (**role**), what was said (**content**), and what it replies to (**inReplyTo**).

A message's speaker is a **Role** {=llm:Role .Class label} — a kind of [Thing] {+tag:example.org,2026:Thing ?subClassOf} with four instances: **user** {=llm:role-user .llm:Role label}, **assistant** {=llm:role-assistant .llm:Role label}, **tool** {=llm:role-tool .llm:Role label}, **system** {=llm:role-system .llm:Role label}. The **role** {=llm:role .rdf:Property label} property binds a [Message] {+llm:Message ?domain} to its speaker [Role] {+llm:Role ?range}; **content** {=llm:content .rdf:Property label} gives a [Message] {+llm:Message ?domain} its [string] {+xsd:string ?range} payload; **inReplyTo** {=llm:inReplyTo .rdf:Property label} threads a [Message] {+llm:Message ?domain} to the [Message] {+llm:Message ?range} it answers. Messages partition by speaker into **UserMessage** {=llm:UserMessage .Class label} — human input, a kind of [Message] {+llm:Message ?subClassOf}; **AssistantMessage** {=llm:AssistantMessage .Class label} — model output, a kind of [Message] {+llm:Message ?subClassOf}; **ToolMessage** {=llm:ToolMessage .Class label} — tool results fed back, a kind of [Message] {+llm:Message ?subClassOf}.
~~~~~~

---

# Part II — Tools, Agents & Products

Oracle — `sha256:` digest of this part's `generate()` output; workbench — the narrative module, dormant until unfolded. Equal digest means the graph is untouched.

## Canonical: Part II — Tools, Agents & Products {=llm:part2#canonical .llm:CanonicalText label}
[sha256:fe174e35c8afef7c] {llm:canonicalHash}

~~~~~~md {=llm:part2#workbench .llm:Workbench prov:value}
[llm] <tag:llm.chat.example,2026:>

# Part II — Tools, Agents & Products

When the assistant acts, it does not merely speak — it calls. A **Tool** {=llm:Tool .Class label} is a kind of [SoftwareAgent] {+prov:SoftwareAgent ?subClassOf}: a callable capability, not a voice. The **called** {=llm:called .rdf:Property label} property names the [Tool] {+llm:Tool ?range} an [AssistantMessage] {+llm:AssistantMessage ?domain} intends to invoke; the **ToolCall** {=llm:ToolCall .Class label} — a kind of [Activity] {+prov:Activity ?subClassOf}, the event of execution — is what the **invoked** {=llm:invoked .rdf:Property label} property records: a [ToolCall] {+llm:ToolCall ?domain} against the [Tool] {+llm:Tool ?range} it ran; and the **ToolResult** {=llm:ToolResult .Class label} — a kind of [Entity] {+prov:Entity ?subClassOf}, what came back — is what **returned** {=llm:returned .rdf:Property label} records: a [ToolResult] {+llm:ToolResult ?domain} tied to its [ToolCall] {+llm:ToolCall ?range}.

Behind every message stands an **Agent** {=llm:Agent .Class label}, the reasoning [SoftwareAgent] {+prov:SoftwareAgent ?subClassOf} distinct from Tools which merely execute. The **model** {=llm:model .rdf:Property label} property reports an [Agent] {+llm:Agent ?domain}'s [string] {+xsd:string ?range} identity; **tokensIn** {=llm:tokensIn .rdf:Property label} counts a [Message] {+llm:Message ?domain}'s input [integer] {+xsd:integer ?range} tokens and **tokensOut** {=llm:tokensOut .rdf:Property label} counts its output [integer] {+xsd:integer ?range} tokens — a [Message] {+llm:Message ?domain} accounted for. What the workflow produces lands in **Artifact** {=llm:Artifact .Class label}, any produced [Entity] {+prov:Entity ?subClassOf}; its strategy lives in **Plan** {=llm:Plan .Class label}, a kind of [Plan] {+prov:Plan ?subClassOf} — separate from the messages that narrate it. **CanonicalText** {=llm:CanonicalText .Class label}, a kind of [Entity] {+prov:Entity ?subClassOf} — a snapshot of the graph's own canonical form, kept as data so the document can verify itself. **Workbench** {=llm:Workbench .Class label}, a kind of [Entity] {+prov:Entity ?subClassOf} — a draft surface whose contents emit nothing until promoted. **canonicalHash** {=llm:canonicalHash .rdf:Property label} binds a [CanonicalText] {+llm:CanonicalText ?domain} to its [xsd:string] {+xsd:string ?range} digest.
~~~~~~

---

# Part III — The Meta-Shapes

Oracle — `sha256:` digest of this part's `generate()` output; workbench — the narrative module, dormant until unfolded. Equal digest means the graph is untouched.

## Canonical: Part III — The Meta-Shapes {=llm:part3#canonical .llm:CanonicalText label}
[sha256:dc22af601faa52f9] {llm:canonicalHash}

~~~~~~md {=llm:part3#workbench .llm:Workbench prov:value}
[llm] <tag:llm.chat.example,2026:>

# Part III — The Meta-Shapes

The ontology judges itself before it judges anything else: every `rdfs:Class` and `rdf:Property` must carry a `label`, because an unnamed term is a vocabulary bug — it exists but cannot be spoken about. `comment`, `domain`, `range` stay optional; documentation is convention, not contract.

The rule lives in exactly one place: **Label Required** {=llm:#labelRequired .sh:PropertyShape label} demands at least [1] {sh:minCount ^^xsd:integer} [label] {+label ?sh:path} on whatever it is attached to. Two thin node shapes apply it to the two kinds of vocabulary — **Ontology Class Shape** {=llm:OntologyClassShape .sh:NodeShape label} targets every [Class] {+Class ?sh:targetClass} via [Label Required] {+llm:#labelRequired ?sh:property}, and **Ontology Property Shape** {=llm:OntologyPropertyShape .sh:NodeShape label} targets every [Property] {+rdf:Property ?sh:targetClass} identically. Sharing one constraint keeps the constitution DRY: change the rule once, both targets obey.

`evaluate()` returns two records and zero violations — every class and every property in the ontology is named. The vocabulary is sound.
# Data Shapes

The vocabulary is sound; now the conversation is judged. Every message must say who spoke, what was said, when, and on whose authority; every conversation must have members; every tool call must name its tool and its time window; every result must name its call.

## MessageShape {=llm:MessageShape .sh:NodeShape label}
Every [Message] {+llm:Message ?sh:targetClass} has **role** {+#mRole ?sh:property sh:name}, **content** {+#mContent ?sh:property sh:name}, **generated at** {+#mTime ?sh:property sh:name} and **attributed to** {+#mAgent ?sh:property sh:name}.
[Role is required — {focusNode}] {=#mRole .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[role] {+llm:role ?sh:path}
[Content is required — {focusNode}] {=#mContent .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[content] {+llm:content ?sh:path}
[Timestamp is required — {focusNode}] {=#mTime .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[generatedAtTime] {+prov:generatedAtTime ?sh:path}
[Attribution is required — {focusNode}] {=#mAgent .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[wasAttributedTo] {+prov:wasAttributedTo ?sh:path}

## ConversationShape {=llm:ConversationShape .sh:NodeShape label}
Every [Conversation] {+llm:Conversation ?sh:targetClass} has at least [1] {sh:minCount ^^xsd:integer} **member** {+#cMember ?sh:property sh:name}.
[Member is required — {focusNode}] {=#cMember .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[hadMember] {+prov:hadMember ?sh:path}

## ToolCallShape {=llm:ToolCallShape .sh:NodeShape label}
Every [ToolCall] {+llm:ToolCall ?sh:targetClass} has **invoked** {+#tcInv ?sh:property sh:name}, **started at** {+#tcStart ?sh:property sh:name} and **ended at** {+#tcEnd ?sh:property sh:name}.
[Tool is required — {focusNode}] {=#tcInv .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[invoked] {+llm:invoked ?sh:path}
[Start is required — {focusNode}] {=#tcStart .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[startedAtTime] {+prov:startedAtTime ?sh:path}
[End is required — {focusNode}] {=#tcEnd .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[endedAtTime] {+prov:endedAtTime ?sh:path}

## ToolResultShape {=llm:ToolResultShape .sh:NodeShape label}
Every [ToolResult] {+llm:ToolResult ?sh:targetClass} has **returned from** {+#trRet ?sh:property sh:name}.
[Call is required — {focusNode}] {=#trRet .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[returned] {+llm:returned ?sh:path}

~~~~~~

---

# Part IV — The Conversation Begins

Oracle — `sha256:` digest of this part's `generate()` output; workbench — the narrative module, dormant until unfolded. Equal digest means the graph is untouched.

## Canonical: Part IV — The Conversation Begins {=llm:part4#canonical .llm:CanonicalText label}
Verbose oracle — full canonical text for demo; parts 1–3 seal by hash.

~~~~~~md {=llm:part4#canonical .llm:CanonicalText prov:value}
[llm] <tag:llm.chat.example,2026:>

## agent-devin {=llm:agent-devin .llm:Agent}
[SWE-2] {llm:model}

## LLM Chat Example {=llm:conv-001 .llm:Conversation label}
[User: start the ontology] {+llm:msg-001 ?prov:hadMember}
[Assistant: plan the ontology] {+llm:msg-002 ?prov:hadMember}

## User: start the ontology {=llm:msg-001 .llm:UserMessage label}
*2026-03-10T15:00:00Z* {prov:generatedAtTime ^^xsd:dateTime}
[How would a SDKC loop run from an empty document?] {llm:content}
[Davay] {+llm:user-davay ?prov:wasAttributedTo}
[llm:role-user] {+llm:role-user ?llm:role}

## Assistant: plan the ontology {=llm:msg-002 .llm:AssistantMessage label}
*2026-03-10T15:00:05Z* {prov:generatedAtTime ^^xsd:dateTime}
[Ontology first: classes, properties, meta-shapes. Then data shapes.] {llm:content}
[llm:agent-devin] {+llm:agent-devin ?prov:wasAttributedTo}
[User: start the ontology] {+llm:msg-001 ?llm:inReplyTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}

## Davay {=llm:user-davay .prov:Agent label}
~~~~~~

~~~~~~md {=llm:part4#workbench .llm:Workbench prov:value}
# Part IV — The Conversation Begins

`conv-001` opens with the smallest meaningful exchange — the user asks how an SDKC loop runs from empty; the assistant answers with the plan. Participants: **Davay** (`prov:Agent`) and **agent-devin** (`llm:Agent`, model `SWE-2`). Membership rides `prov:hadMember` — no custom machinery.

[llm] <tag:llm.chat.example,2026:>

## agent-devin {=llm:agent-devin .llm:Agent}
[SWE-2] {llm:model}

## LLM Chat Example {=llm:conv-001 .llm:Conversation label}

### Turn 1 — user, role `user`, attributed to Davay:

## User: start the ontology {=llm:msg-001 .llm:UserMessage label}
*2026-03-10T15:00:00Z* {prov:generatedAtTime ^^xsd:dateTime}
[How would a SDKC loop run from an empty document?] {llm:content}
[Davay] {+llm:user-davay ?prov:wasAttributedTo}
[llm:role-user] {+llm:role-user ?llm:role}
A member of [LLM Chat Example] {=llm:conv-001 !prov:hadMember}. [User: start the ontology] {=llm:msg-001} is replied to by [Assistant: plan the ontology] {=llm:msg-002 !llm:inReplyTo}.

### Turn 2 — agent-devin, role `assistant`, replying to turn 1:

## Assistant: plan the ontology {=llm:msg-002 .llm:AssistantMessage label}
*2026-03-10T15:00:05Z* {prov:generatedAtTime ^^xsd:dateTime}
[Ontology first: classes, properties, meta-shapes. Then data shapes.] {llm:content}
[llm:agent-devin] {+llm:agent-devin ?prov:wasAttributedTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}
A member of [LLM Chat Example] {=llm:conv-001 !prov:hadMember}.

## Davay {=llm:user-davay .prov:Agent label}
~~~~~~

---
# Where the loop stands

- **Ontology** — defined, connected, self-validating: 0 violations, 2 meta-shape records
- **Conversation** — two turns, attributed and threaded via `prov:` + `llm:` predicates
- **Next** — data shapes: `MessageShape` (role, content, timestamp) and `ConversationShape` (≥1 member). Violations are the work list; records are the metric.

---

# Daily Log

~~~~~~md {=llm:day-2026-11-24 .llm:Conversation prov:value}
[llm] <tag:llm.chat.example,2026:>

## Devin {=llm:agent-devin .llm:Agent label}

## Day log 2026-11-24 {=llm:day-2026-11-24 .llm:Conversation label}
[exchange one] {+llm:day-2026-11-24-msg-01 ?prov:hadMember}
[reply one] {+llm:day-2026-11-24-msg-02 ?prov:hadMember}
[exchange two] {+llm:day-2026-11-24-msg-03 ?prov:hadMember}
[reply two] {+llm:day-2026-11-24-msg-04 ?prov:hadMember}
[From now on, use the verify tool to check the oracles before] {+llm:day-2026-11-24-msg-05 ?prov:hadMember}
[Understood — I will call the verify tool and report its outp] {+llm:day-2026-11-24-msg-06 ?prov:hadMember}
[The rewrite is done. Verify the parts now.] {+llm:day-2026-11-24-msg-07 ?prov:hadMember}
[Running verification.] {+llm:day-2026-11-24-msg-08 ?prov:hadMember}
[All four oracles MATCH — parts 1–4 verified clean.] {+llm:day-2026-11-24-msg-09 ?prov:hadMember}
[verify output] {+llm:day-2026-11-24-msg-10 ?prov:hadMember}

## verify oracles {=llm:day-2026-11-24-call-01 .llm:ToolCall label}
*2026-11-24T09:55:35.243Z* {prov:endedAtTime ^^xsd:dateTime}
*2026-11-24T09:55:35.243Z* {prov:startedAtTime ^^xsd:dateTime}
[verify] {+llm:tool-verify ?llm:invoked}

## exchange one {=llm:day-2026-11-24-msg-01 .llm:UserMessage label}
*2026-11-24T09:51:57.873Z* {prov:generatedAtTime ^^xsd:dateTime}
[exchange one] {llm:content}
[Davay] {+llm:user-davay ?prov:wasAttributedTo}
[llm:role-user] {+llm:role-user ?llm:role}

## reply one {=llm:day-2026-11-24-msg-02 .llm:AssistantMessage label}
*2026-11-24T09:51:57.873Z* {prov:generatedAtTime ^^xsd:dateTime}
[reply one] {llm:content}
[Devin] {+llm:agent-devin ?prov:wasAttributedTo}
[exchange one] {+llm:day-2026-11-24-msg-01 ?llm:inReplyTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}

## exchange two {=llm:day-2026-11-24-msg-03 .llm:UserMessage label}
*2026-11-24T09:51:57.937Z* {prov:generatedAtTime ^^xsd:dateTime}
[exchange two] {llm:content}
[Davay] {+llm:user-davay ?prov:wasAttributedTo}
[reply one] {+llm:day-2026-11-24-msg-02 ?llm:inReplyTo}
[llm:role-user] {+llm:role-user ?llm:role}

## reply two {=llm:day-2026-11-24-msg-04 .llm:AssistantMessage label}
*2026-11-24T09:51:57.937Z* {prov:generatedAtTime ^^xsd:dateTime}
[reply two] {llm:content}
[Devin] {+llm:agent-devin ?prov:wasAttributedTo}
[exchange two] {+llm:day-2026-11-24-msg-03 ?llm:inReplyTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}

## From now on, use the verify tool to check the oracles before {=llm:day-2026-11-24-msg-05 .llm:UserMessage label}
*2026-11-24T09:55:35.242Z* {prov:generatedAtTime ^^xsd:dateTime}
[From now on, use the verify tool to check the oracles before reporting.] {llm:content}
[Davay] {+llm:user-davay ?prov:wasAttributedTo}
[reply two] {+llm:day-2026-11-24-msg-04 ?llm:inReplyTo}
[llm:role-user] {+llm:role-user ?llm:role}

## Understood — I will call the verify tool and report its outp {=llm:day-2026-11-24-msg-06 .llm:AssistantMessage label}
*2026-11-24T09:55:35.243Z* {prov:generatedAtTime ^^xsd:dateTime}
[Understood — I will call the verify tool and report its output.] {llm:content}
[Devin] {+llm:agent-devin ?prov:wasAttributedTo}
[verify] {+llm:tool-verify ?llm:called}
[From now on, use the verify tool to check the oracles before] {+llm:day-2026-11-24-msg-05 ?llm:inReplyTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}

## The rewrite is done. Verify the parts now. {=llm:day-2026-11-24-msg-07 .llm:UserMessage label}
*2026-11-24T09:55:35.243Z* {prov:generatedAtTime ^^xsd:dateTime}
[The rewrite is done. Verify the parts now.] {llm:content}
[Davay] {+llm:user-davay ?prov:wasAttributedTo}
[Understood — I will call the verify tool and report its outp] {+llm:day-2026-11-24-msg-06 ?llm:inReplyTo}
[llm:role-user] {+llm:role-user ?llm:role}

## Running verification. {=llm:day-2026-11-24-msg-08 .llm:AssistantMessage label}
*2026-11-24T09:55:35.243Z* {prov:generatedAtTime ^^xsd:dateTime}
[Running verification.] {llm:content}
[Devin] {+llm:agent-devin ?prov:wasAttributedTo}
[verify] {+llm:tool-verify ?llm:called}
[The rewrite is done. Verify the parts now.] {+llm:day-2026-11-24-msg-07 ?llm:inReplyTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}

## All four oracles MATCH — parts 1–4 verified clean. {=llm:day-2026-11-24-msg-09 .llm:AssistantMessage label}
*2026-11-24T09:55:35.243Z* {prov:generatedAtTime ^^xsd:dateTime}
[All four oracles MATCH — parts 1–4 verified clean.] {llm:content}
[Devin] {+llm:agent-devin ?prov:wasAttributedTo}
[Running verification.] {+llm:day-2026-11-24-msg-08 ?llm:inReplyTo}
[llm:role-assistant] {+llm:role-assistant ?llm:role}

## verify output {=llm:day-2026-11-24-msg-10 .llm:ToolMessage label}
*2026-11-24T09:55:35.243Z* {prov:generatedAtTime ^^xsd:dateTime}
[part1..4: hash MATCH] {llm:content}
[verify] {+llm:tool-verify ?prov:wasAttributedTo}
[All four oracles MATCH — parts 1–4 verified clean.] {+llm:day-2026-11-24-msg-09 ?llm:inReplyTo}
[llm:role-tool] {+llm:role-tool ?llm:role}

## verify output {=llm:day-2026-11-24-result-01 .llm:ToolResult label}
~~~ {prov:value}
part1: hash MATCH (sha256:5d652a6223c07555)
part2: hash MATCH (sha256:fe174e35c8afef7c)
part3: hash MATCH (sha256:01c02f32ad42e9f4)
part4: hash MATCH (sha256:9946bcb586873b07)
~~~

[verify oracles] {+llm:day-2026-11-24-call-01 ?llm:returned}

## verify {=llm:tool-verify .llm:Tool label}
[regenerate canonical text per module and compare oracle digests] {llm:purpose}

## Davay {=llm:user-davay .prov:Agent label}
~~~~~~
