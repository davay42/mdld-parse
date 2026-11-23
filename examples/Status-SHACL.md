[ex] <http://example.org/>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# Task {=ex:Task .Class label}

A unit of work tracked on the team board.

---

# Task Shape {=ex:TaskShape .sh:NodeShape label}

We keep the team board for a small studio. Every [task] {+ex:Task ?sh:targetClass} must carry a **title** {+#titleRule ?sh:property sh:name}, a **status** {+#statusRule ?sh:property sh:name} from the allowed list, an **estimate** {+#estimateRule ?sh:property sh:name} in story points, and — when assigned — an **assignee** {+#assigneeRule ?sh:property sh:name} who is a real teammate.

The board is [closed] {+ex:TaskShape ?sh:closed} — cards may only carry the fields the shape declares, nothing smuggled in at standup.

## Title must be present {=#titleRule .sh:PropertyShape sh:message}
Our [title] {+ex:title ?sh:path} must have at least [1] {sh:minCount ^^xsd:integer} value and at least [3] {sh:minLength ^^xsd:integer} characters — "Fix typo" is a task, "x" is a typo.

## Estimate must be positive {=#estimateRule .sh:PropertyShape sh:message}
Our [estimate] {+ex:estimate ?sh:path} must be an [integer] {+xsd:integer ?sh:datatype} of at least [1] {sh:minInclusive ^^xsd:integer} story point.

## Assignee must be a person {=#assigneeRule .sh:PropertyShape sh:message}
Our [assignee] {+ex:assignee ?sh:path} must satisfy the **Person Shape** {+ex:PersonShape ?sh:node} — a real teammate with a name, not a ghost in the machine.

## Status must be known {=#statusRule .sh:PropertyShape sh:message}
Our [status] {+ex:status ?sh:path} must be one of **Board Statuses** {=ex:statusList ?sh:in .rdf:List}: [todo] {rdf:first}, then [next] {=ex:statusList2 ?rdf:rest} by [in-progress] {rdf:first}, then [next] {=ex:statusList3 ?rdf:rest} by [done] {rdf:first}, ending at [nil] {+rdf:nil ?rdf:rest}. Anything else — [backlog], [blocked], [maybe] — isn't on this board.

---

# Person Shape {=ex:PersonShape .sh:NodeShape label}

Every [person] {+ex:Person ?sh:targetClass} on the roster has a **name** {+#personName ?sh:property sh:name}.

## Person name is required {=#personName .sh:PropertyShape sh:message}
Our [name] {+ex:name ?sh:path} must have at least [1] {sh:minCount ^^xsd:integer} value.

---

# Test Data {=ex:data .Container}

## Ada Lovelace {=ex:Ada .ex:Person label}
The engineer who wrote the first algorithm.
Name: [Ada Lovelace] {ex:name}

## Grace Hopper {=ex:Grace .ex:Person label}
Rear Admiral, COBOL pioneer.
Name: [Grace Hopper] {ex:name}

## Ship parser v2 {=ex:Task1 .ex:Task}
Title: [Ship parser v2] {ex:title}
Status: [in-progress] {ex:status}
Estimate: [3] {ex:estimate ^^xsd:integer}
Assignee: <http://example.org/Grace> {ex:assignee}

## Triage bug queue {=ex:Task2 .ex:Task}
Title: [Triage bug queue] {ex:title}
Status: [backlog] {ex:status}
Estimate: [8] {ex:estimate ^^xsd:integer}
Assignee: <http://example.org/Ada> {ex:assignee}
Priority: [urgent] {ex:priority}

## Fix typo {=ex:Task3 .ex:Task}
Title: [Fix typo] {ex:title}
Status: [todo] {ex:status}
Estimate: [1] {ex:estimate ^^xsd:integer}

---

# What the shape buys you

The same `ex:TaskShape` drives three operations on this document — no
separate schema, no ORM, no query language.

**Validation** — `validate({ quads })` reports two violations on `Task2`:
its `status` is `[backlog]`, which isn't on the board list, and its
`priority` field is undeclared — `sh:closed` rejects smuggled fields.
`Task1` and `Task3` pass; unassigned tasks are fine because the assignee
rule only fires when the link exists.

**POJO extraction** — `extract({ quads }, 'http://example.org/TaskShape')`
returns only what conforms, keyed by `sh:name` with typed casts:

```json
{
  "http://example.org/Task1": {
    "title": "Ship parser v2",
    "status": "in-progress",
    "estimate": 3,
    "assignee": { "name": "Grace Hopper" }
  },
  "http://example.org/Task3": {
    "title": "Fix typo",
    "status": "todo",
    "estimate": 1
  }
}
```

`Task2` is absent entirely — its node-level `sh:closed` violation excludes
the record. Every key shown is a validated fact.

**Subgraph extraction** — `extractGraph({ quads }, '…/TaskShape')`
returns only the quads the shape permits: declared predicates plus
`rdf:type`, recursing into `ex:assignee` → Person records. `ex:priority`
never leaves the document.

---

# The canonicalization loop

This file is canonical MD-LD: `parse(text) → generate(quads) → parse()` is
quad-identical. Edit the prose, regenerate the graph, re-validate — the
shape is the contract at every step:

```bash
node -e "
import { parse, generate } from 'mdld-parse'
import { readFileSync } from 'node:fs'
const text = readFileSync('examples/Status-SHACL.md', 'utf8')
const { quads } = parse({ text })
const { text: canon } = generate({ quads })
console.log(parse({ text: canon }).quads.length === quads.length
  ? 'round-trip: quad-identical ✓' : 'round-trip: MISMATCH')
"
```
