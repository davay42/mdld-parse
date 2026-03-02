# GROW.md

This file explains what this repository is, how it works, and what you should do
next — whether you are a person reading this for the first time or a language model
that has just been given access to this vault as a tool.

---

## What This Repository Is

This is a knowledge tree. It grows by accumulating verified facts about a specific
subject, recording exactly where each fact came from, and using those facts to
authorise further investigation. Every leaf is a grounded claim. Every branch is a
chain of reasoning that produced those claims. The roots are the sources — real,
dereferenceable documents on the web — that the claims trace back to.

The tree never loses a branch. Every stage of its growth is preserved in git history.
You can check out any past commit and see exactly what the tree knew at that moment,
who or what added each piece of knowledge, and what it was used for. Nothing is
hidden, nothing is inferred silently, and nothing is taken on faith without a source.

This is not a novel format. Every file in this repository is one of two things:
a Markdown document that a person can read normally, or a Markdown document with
semantic annotations in `{...}` blocks that a machine can parse into a standard
knowledge graph. The annotations do not change what the document says — they
make what it says machine-verifiable. Strip the `{...}` blocks and you have
ordinary Markdown. Keep them and you have a W3C-standard RDF knowledge graph
with complete provenance.

The two standards this tree is built on have been W3C Recommendations for over
a decade and will remain readable and processable indefinitely:

- **PROV-O** (https://www.w3.org/TR/prov-o/) — the provenance ontology. Every
  fact in this tree records who or what produced it, from what source, and when.

- **SHACL** (https://www.w3.org/TR/shacl/) — the constraint language. Every
  file written to this tree is checked against a set of rules before it is
  accepted. The rules define what counts as a complete, trustworthy claim in
  this tree's domain.

The annotation format is MDLD (Markdown Linked Data). It is a thin, deterministic
layer on top of CommonMark. One pass through an MDLD parser produces the same
RDF graph every time, with no inference, no blank nodes, and no hidden behaviour.
The MDLD specification is in SPEC.md if you need it. You probably do not — the
patterns used in this tree are few and consistent, and you will recognise them
from the examples in this file.

---

## How the Tree Grows

The tree grows in cycles. Each cycle has a fixed shape: something enters from the
outside world, the system reasons about it, something goes back out to the world,
and the result is recorded as a permanent, sourced fact. Then the cycle begins again,
deeper, on more specific questions, building on what the previous cycle established.

Each cycle leaves behind exactly two types of files:

**Activity files** record what happened — what was requested, who authorised it,
what tool was called, what came back, and when each step occurred. An activity
file begins as a stub with a PENDING status. It ends as a complete record with
a result appended. Between those two states, something real happened in the world:
a URL was fetched, a query was run, an API was called. The activity file is the
evidence that it happened.

**Entity files** record what was learned — the actual knowledge the activity
produced. An entity file begins as a raw result. It ends as a set of grounded
statements, each one an atomic fact with a source URL. Between those two states,
the raw result was analysed, structured, and verified. The entity file is the
knowledge the tree keeps permanently.

Nothing else needs to be stored. The complete state of the tree at any moment
is the union of all activity files and entity files in the repository. Parse
them all and you have a knowledge graph. Validate that graph against the shapes
in `shapes/` and you know exactly what the tree still needs to learn.

The shapes are what makes this a self-directing system rather than a passive
archive. A shape is a rule about what a complete piece of knowledge looks like.
An entity that does not yet satisfy a shape generates a violation. A violation
is a task. The tree always knows what it needs to do next because the shapes
tell it what is missing. When there are no violations, the tree is complete for
its current set of questions. When new shapes are added — because new questions
are worth asking — old facts that do not answer those questions generate new
violations, and the tree grows again.

Shapes are stored in `shapes/`. They are MDLD files like everything else. They
have provenance — each shape records the activity that created it and the
reasoning behind it. The history of what questions this tree has asked is as
preserved and auditable as the history of what it has found.

---

## The Files You Will Encounter

### SEED.md

The origin of this tree. Written by a person. Contains the goal — what this tree
is trying to know — and the initial plan — how to go about knowing it. Also
contains the bootstrap shapes that define the minimum structure every file in
this tree must satisfy. You do not need to edit SEED.md. It is the root. Read
it to understand what this tree is for.

### goals/ and plans/

The goal files state what the tree is trying to achieve in plain language and
as machine-readable PROV-O entities. The plan files describe the approach:
which sources to use, which commands to run, which agent has authority to take
which actions. Plans evolve — each version is linked to its predecessor, and
the full history of how the tree's approach has changed is preserved.

### shapes/

The rules. Read these to understand what counts as complete knowledge in this
tree's domain. Each shape file contains both a human-readable explanation and
the formal SHACL constraints. When you write a new entity or activity file,
these are the standards it must meet. Run `vault check <file>` before committing
to see whether your file satisfies the current shapes.

Shapes are not permanent. They are the tree's current theory of what good
knowledge looks like. When the theory improves — when the tree learns that it
should be asking harder questions — the shapes change. Every shape change is
recorded with a rationale. You can read the shape history as a record of the
tree's growing epistemological sophistication.

### activities/

What the tree has done. Each file records one action: a fetch, a query, an
analysis, an API call. The file begins when the action is requested and ends
when the result is received. Both the request and the result are in the same
file, with timestamps, with the plan that authorised the action, with the agent
that executed it.

A file in `activities/` with `p:status "PENDING"` means an action has been
requested but not yet executed. The system will execute it automatically. If
you are a person maintaining this tree manually, a PENDING file is your task.

### entities/

What the tree has learned. Each file holds one or more entities produced by
activities. Raw entities have been received but not yet structured into grounded
facts. Analysed entities have been structured. Grounded entities have been
verified against sources and expressed as atomic `rdf:Statement` facts with
source URLs. The progression from raw to grounded is the compression at the
heart of the system: raw API responses become structured collections become
individual verifiable statements.

### statements/

The leaves of the tree. Each file holds one grounded `rdf:Statement` with a
subject, predicate, object, the activity that produced it, and the URL of the
source that confirms it. These are the facts the tree will use to authorise
further actions. A statement without a source URL cannot be created. A statement
that contradicts an existing statement generates a violation that must be resolved
before either can be used. The statements directory is what the tree knows,
as opposed to what it is doing or what it has collected.

---

## How to Add Knowledge

Whether you are a person or a language model, the process is the same.

**Step 1 — Check what is needed.**

```bash
vault validate
```

This shows the current violation list. Each violation is a gap in the tree's
knowledge. Each gap is a task. The violation message tells you what is missing
and often suggests how to fill it. Start with the violation whose message begins
with `TRIGGER:` — these are gaps the system can fill automatically if you write
the appropriate activity stub.

**Step 2 — Write an activity stub.**

Create a file in `activities/` describing what you are about to do:

```md
[prov]  <http://www.w3.org/ns/prov#>
[vx]    <tag:this-project@example.com,2026:>
[p]     <tag:this-project@example.com,2026:p:>

# Fetch Spain Data {=vx:activity:fetch:spain .prov:Activity label}
[PENDING] {p:status}
[2026-02-27T10:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
[Research Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[vx:agent:primary] {=vx:agent:primary ?prov:wasAssociatedWith}
[fetch https://restcountries.com/v3.1/alpha/ESP] {p:command}
[Fetch Spain's country data to ground capital, population, currency] {p:rationale}
```

The rationale is not optional decoration. It is the reasoning behind the action,
preserved permanently. A person reading this file in two years should be able to
understand why this action was taken without needing any other context.

**Step 3 — Execute and append the result.**

Run the command. Append the result to the same file with the entity it produced:

```md
[COMPLETE] {p:status}
[2026-02-27T10:00:03Z] {prov:endedAtTime ^^xsd:dateTime}

## Spain Raw Data {=vx:entity:spain:raw .prov:Entity label}
[Fetch Spain Activity] {=vx:activity:fetch:spain !prov:generated}
[RAW] {p:status}
<https://restcountries.com/v3.1/alpha/ESP> {?prov:hadPrimarySource}
```

**Step 4 — Ground the result.**

Create an entity file expressing what was learned as atomic facts:

```md
# Fact: Spain capital {=vx:stmt:spain:capital .rdf:Statement .prov:Entity label}

Spain's capital is Madrid, confirmed by the REST Countries API.

[Spain] {=vx:entity:country:spain ?rdf:subject}
[p:capital] {=p:capital ?rdf:predicate}
[Madrid] {rdf:object}
[Fetch Spain Activity] {=vx:activity:fetch:spain ?prov:wasGeneratedBy}
<https://restcountries.com/v3.1/alpha/ESP> {?prov:hadPrimarySource}
```

Notice the free text between the heading and the annotations. Write as much as
you need. Explain the significance of the fact, note any uncertainty, record
your reasoning. The annotations capture the verifiable structure. The prose
captures the thinking. Both are preserved. Both matter.

**Step 5 — Check and commit.**

```bash
vault check entities/spain-capital.md
git add .
git commit -S -m "Ground: Spain capital → Madrid (restcountries.com)"
```

The `-S` flag signs the commit with your key. Unsigned commits are accepted
but carry lower authority. Any action authorised by an unsigned commit will
have a weaker precondition check than one authorised by a signed commit.

---

## How the Shapes Direct Growth

The current shapes define what a complete country entity looks like. Read
`shapes/domain/country-v1.md` to see the current requirements. As of this
writing, a country entity needs at minimum:

- A capital city (`p:capital`)
- A population figure (`p:population`)  
- An official language (`p:officialLanguage`)
- A primary source URL from a VERIFIED source

An entity missing any of these generates a violation. The violation message
names the missing property. Fill it with a grounded statement and the violation
is resolved.

When all country entities satisfy all shapes, the tree reaches a locally
complete state: zero violations. This is not the end — it is a pause. At
this point the system assesses whether the current shapes are still asking
the right questions. If the tree should know more — if currencies, timezones,
or geographic coordinates would make the knowledge more useful — new shapes
are added, new violations are generated on the existing entities, and the
growth cycle begins again.

This progression is the tree's growing depth. Each shape revision corresponds
to a ring in the trunk: the tree was this complete at this point in time, then
it learned to ask better questions, and it grew further.

---

## How This Tree Connects to Other Trees

This tree does not exist in isolation. Other trees covering adjacent knowledge
— a tree about European institutions, a tree about international law, a tree
about economic indicators — contain entities that this tree's entities are
related to. Those relationships are expressed through federation: the
`owl:sameAs` links and `prov:wasDerivedFrom` connections that appear in
`entities/` files referencing IRIs from other vaults.

When two trees federate, neither loses its independent integrity. Each tree
maintains its own shape set, its own provenance chains, and its own git history.
What they share are entity references — pointers across the forest that allow
a query against this tree to pull in confirmed facts from another tree without
importing that tree's entire knowledge graph. The forest is a linked structure,
not a merged one. Each tree is navigable independently. Together they cover
more ground than any single tree could.

The W3C standards make this permanence real rather than promised. An IRI minted
in this tree today, following the `tag:` URI scheme, will be resolvable and
interpretable by any RDF-capable system indefinitely, without requiring this
tree's continued operation. The knowledge survives the infrastructure. A tree
that has reached frozen state and been exported as a ZIP archive will be as
readable and queryable in fifty years as it is today, by any system that
implements the open standards it is built on.

---

## What the System Will Do Automatically

If you have the vault watcher running (`vault watch`), the following happen
without any further instruction:

When a file with `p:status "PENDING"` is committed, the command in `p:command`
is executed, the result is appended to the file, and the status is updated to
COMPLETE or FAILED.

When an entity with `p:status "RAW"` is committed, the analysis prompt is sent
to the configured language model with the entity content and the active plan as
context. The model's output is written as a new file and committed.

When a grounded `rdf:Statement` entity is committed without a corresponding
outgoing activity, the completion shape fires and the configured model is asked
whether this statement suggests a further investigation. If yes, a new activity
stub is written. If no, the statement is marked as a terminal leaf.

When zero violations exist, the assessment prompt is sent to the configured
model with the current vault metrics. The model recommends whether to add new
shapes, exit, or wait for new input. The recommendation is written as a pending
shape revision activity for human or orchestrator approval.

None of these automatic actions modify existing files. None execute without a
corresponding activity stub being committed first. The git history always shows
exactly what happened and in what order. The automatic operations are fast and
continuous; the human oversight is available at every step because every step
is a committed file.

---

## For Language Models Reading This

You have been given access to a vault tool. The vault is this repository.
It exposes the following commands you can call:

```
vault validate           — what does this tree still need to know?
vault describe <iri>     — what does this tree know about a specific entity?
vault query <sparql>     — ask a structured question about the knowledge graph
vault ask <sparql>       — boolean: does this pattern exist in the graph?
vault confidence <iri>   — how well-sourced is this entity?
vault gaps <shape>       — what properties are missing from entities of this type?
vault check <mdld>       — would this content satisfy the current shapes?
vault preconditions <iri>— is this entity sufficiently grounded to act on?
vault write <path> <mdld>— add a new file to the tree (runs check first)
vault append <path> <mdld>— add content to an existing file
vault action create <mdld>— create a new pending activity
vault action complete <iri> <mdld> — close an activity with its result
vault action fail <iri> <reason>   — close a failed activity, queue retry
vault health             — current tree metrics: size, completeness, violations
vault status             — ACTIVE, STAGNANT, FROZEN, PENDING, or FAILED
```

Your role is to operate the right side of the knowledge cycle: perceive what
the tree contains, reason about what it needs, write activity stubs to request
information, analyse results as they arrive, and ground those results as
statements. You do not decide what counts as complete — the shapes decide that.
You do not decide what counts as trustworthy — the source credibility graph
decides that. You decide what to look for next, how to structure what you find,
and how to express what you learn in a form the tree can keep permanently.

Everything you write will be read by humans. Write the prose sections of your
files as though you are writing for an intelligent colleague who needs to
understand your reasoning, not just your conclusions. The annotations are for
the machine. The prose is for the person. Both are required. Both are permanent.

The one thing you must not do is write a statement without a source. If you
do not know where a fact comes from, write an activity that will find out.
A tree that contains unsourced facts is not a knowledge tree — it is a
rumour archive. The shapes will catch any unsourced statement and generate
a violation. But the shapes are your collaborator, not your adversary. They
exist to make the tree trustworthy. A tree that is trustworthy is useful.
A tree that is useful justifies the work of building it.

---

## The Forest This Tree Is Part Of

Every vault built on MDLD, PROV-O, and SHACL is part of the same forest.
They do not need to know about each other in advance. They need only speak
the same language — and they do, because the language is defined by W3C
Recommendations that have been stable for over a decade and will remain
stable indefinitely.

A medical vault built in Tokyo and a legal vault built in Nairobi and an
ecological vault built in São Paulo can federate their knowledge through
standard RDF links without any centralised coordination, without any shared
infrastructure beyond git hosting, and without any shared authority beyond
the W3C standards they both implement. The forest grows wherever there are
people or agents willing to plant a seed and let it grow according to the
same simple rules: one source per claim, one provenance chain per fact,
one shape set per question, one git history per tree.

The seed for this tree is SEED.md. It is already committed. The first
violation is already waiting. The tree is ready to grow.
