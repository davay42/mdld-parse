[w] <tag:atlas.world,2026:>

# The Atlas Workbench {=w:workbench .w:Workbench label}

*An intention, written before any code: **a world that asks to be understood.** Explorers who know nothing, whose only senses are shapes.*

This document is the whole design. Four explorers walk a world they cannot see. Each carries a **worldview** — a set of SHACL shapes — and nothing else. The loop is the one this repository teaches, bent into a game:

1. **Perception is the evaluated record.** An explorer only commits a fact to memory if one of its shapes targets the subject *and* names the predicate. Scenery that no shape asks about never enters its mind.
2. **Violations are the work list.** A missing value (`sh:minCount`) is a task: *go where the answer lives*. A value the world contradicts is a *finding*, not a task — the shape, not the explorer, is wrong.
3. **Ontology first.** The first shapes cannot ask about places, because the explorer has no words for them. They ask for *definitions*: every class needs a label and a comment, and the atlas must define eight words. Only when those hold does the next stage unfold.
4. **Deepen by promotion.** Each stage is a dormant module below. When an explorer's own gate shape has enough complete records, the next module is appended to its worldview — append-only, never rewritten. Humans may edit any worldview at any moment; the gate does not care who wrote the shape.
5. **Collaboration is merging.** Explorers who meet exchange memories — but only facts that fit the *receiver's* lens. A Naturalist can hand a Prospector a map, never a vitality reading the Prospector has no shape for.

| Stage | Demands | Asks the world for | Unlocks |
|-------|---------|--------------------|---------|
| 0 — Vocabulary | every class has a label and a comment; atlas defines ≥ 8 words | *words*: terrain and feature kinds, learned by standing on an instance | the noticing of places |
| 1 — Places | every Feature is located and has richness 1–5; atlas holds ≥ 6 places | *instances*: where things are, how rich | role-specific depth |
| 2 — Depth | per role: vitality / grade / age, or wider extent (≥ 12 places) | *properties* that only a specialist has a word for | the shared view |
| 3 — Trails | every Feature knows ≥ 1 trail; atlas holds ≥ 20 places | *relations*: which places connect, revealing places never yet seen | the human's turn |

| Commons | the Charter: each viewpoint's standard for a shared place | *joins* — facts no one explorer can hold at once | a settlement: the world changes, and asks for new words |

**Beside the ladder runs the Commons.** It is a mind of its own, reading the union of everyone's memory through the Charter below. A *Site* is a living place with an ore and a relic nearby; the Charter says what each role needs before it will settle there. A site that lacks a measurement sends a *request* to whoever owns the word for it; a site that fails a standard is *unfit*; a site that satisfies everyone is *viable*, and the explorers gather to found it. A founding is a **shared consequence**: a Settlement appears in the world, so the ontology grows (new words to define) and explorers who share its market exchange memories.

**After stage 3 the shapes are yours.** Write a new shape in any worldview — say, every tile needs an `elevation`, or every Ruin must be near a Spring — and watch the explorer turn toward the work. A shape the world cannot answer shows up as a *blocked* task: the signal to tighten or loosen the shape, never to bypass the gate.

## Shell Shapes

Two shapes keep this workbench honest before any module is unfolded. **Steps** {=w:StepShape .sh:NodeShape label} are instances of [Step] {+w:Step ?sh:targetClass} and each must declare a **rank** {+#sRank ?sh:property sh:name}, a **gate** {+#sGate ?sh:property sh:name} and a dormant **payload** {+#sPay ?sh:property sh:name} — a module without content is an empty promise.
[A step needs a rank — {$focusNode}] {=#sRank .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[rank] {+w:rank ?sh:path}
[A step needs a gate shape — {$focusNode}] {=#sGate .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[gate] {+w:gate ?sh:path}
[A step needs a payload — {$focusNode}] {=#sPay .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[payload] {+w:payload ?sh:path}

## Explorers {=w:ExplorerShape .sh:NodeShape label}
Every [Agent] {+w:Agent ?sh:targetClass} must wear a **role** {+#aRole ?sh:property sh:name} and carry a **color** {+#aCol ?sh:property sh:name} to be told apart on the map.
[An explorer needs a role — {$focusNode}] {=#aRole .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[role] {+w:role ?sh:path}
[An explorer needs a color — {$focusNode}] {=#aCol .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[color] {+w:color ?sh:path}

---

## The Explorers

Four roles, one shared ladder. The roles diverge only at stage 2, where each learns a word the others lack — so no single explorer can finish the atlas alone.

## Cartographer {=w:cartographer .w:Role label}
Reads the world as an extent: *how much of it is there?* Pulled outward by wide demands, so it finds places the others later specialise on.

## Naturalist {=w:naturalist .w:Role label}
Reads the world as a living system: springs, groves, herds. Wants their *vitality*.

## Prospector {=w:prospector .w:Role label}
Reads the world as a seam of resources: ore and caves. Wants their *grade*.

## Archivist {=w:archivist .w:Role label}
Reads the world as a record of people: ruins, shrines, wrecks. Wants their *age*.

## Ada {=w:agent-ada .w:Agent label}
[cartographer] {+w:cartographer ?w:role}
[#f2b134] {w:color}

## Bo {=w:agent-bo .w:Agent label}
[naturalist] {+w:naturalist ?w:role}
[#5fd38d] {w:color}

## Cy {=w:agent-cy .w:Agent label}
[prospector] {+w:prospector ?w:role}
[#6aa9ff] {w:color}

## Di {=w:agent-di .w:Agent label}
[archivist] {+w:archivist ?w:role}
[#ff7a90] {w:color}

---

## The Ladder

Each module below is dormant: its words stay sealed in a literal until an explorer earns it. The gate names the shape whose complete records open the way forward.

## Stage 0 — Vocabulary {=w:stage0 .w:Step label}
[0] {w:rank ^^xsd:integer}
[ClassShape] {+w:ClassShape ?w:gate}
[10] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage0 w:payload}
# Stage 0 — Vocabulary

Nothing exists in this world until it has a name. Before it can notice a single place, an explorer must learn the *words* — and a word is not learned from a sign, but by standing on something that bears it.

## Classes {=w:ClassShape .sh:NodeShape label}
Every [Class] {+rdfs:Class ?sh:targetClass} must carry a **label** {+#clL ?sh:property sh:name} and a **comment** {+#clC ?sh:property sh:name} — a word without a definition is noise.
[A class needs a name — {$focusNode}] {=#clL .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[label] {+rdfs:label ?sh:path}
[A class needs a definition — {$focusNode}] {=#clC .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[comment] {+rdfs:comment ?sh:path}

## Vocabulary {=w:VocabularyShape .sh:NodeShape label}
[The atlas] {+w:atlas ?sh:targetNode} is an empty book until it **defines** {+#voD ?sh:property sh:name} its first words — at least eight.
[The atlas must define at least eight words — {$focusNode}] {=#voD .sh:PropertyShape sh:message}
[8] {sh:minCount ^^xsd:integer}
[defines] {+w:defines ?sh:path}
~~~~~~

## Stage 1 — Places {=w:stage1 .w:Step label}
[1] {w:rank ^^xsd:integer}
[PlaceShape] {+w:PlaceShape ?w:gate}
[6] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage1 w:payload}
# Stage 1 — Places

Now there are words, the world has things. A **Feature** is a place worth a trip — it must be *located*, and it must be weighed: **richness** from one to five. Features seen from afar are only half-known; the rest is a walk away.

## Places {=w:PlaceShape .sh:NodeShape label}
Every [Feature] {+w:Feature ?sh:targetClass} must be **located** {+#plA ?sh:property sh:name} on a tile and carry a **richness** {+#plR ?sh:property sh:name} from one to five.
[A place must be located — {$focusNode}] {=#plA .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[at] {+w:at ?sh:path}
[Richness is unknown — {$focusNode}] {=#plR .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[1] {sh:minInclusive ^^xsd:integer}
[5] {sh:maxInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[richness] {+w:richness ?sh:path}

## Holdings {=w:HoldingsShape .sh:NodeShape label}
[The atlas] {+w:atlas ?sh:targetNode} is more than a dictionary once it **holds** {+#hoH ?sh:property sh:name} places — at least six.
[The atlas must hold at least six places — {$focusNode}] {=#hoH .sh:PropertyShape sh:message}
[6] {sh:minCount ^^xsd:integer}
[holds] {+w:holds ?sh:path}
~~~~~~

## Stage 2 — Cartographer depth {=w:stage2-cartographer .w:Step label}
[2] {w:rank ^^xsd:integer}
[cartographer] {+w:cartographer ?w:forRole}
[ExtentShape] {+w:ExtentShape ?w:gate}
[1] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage2-cartographer w:payload}
# Stage 2 — Extent

The Cartographer's word is *extent*: a place is only a place if there are many of them. Its depth is not a new property but a wider appetite — and with no anchor to walk to, the only way to satisfy it is to go and see.

## Extent {=w:ExtentShape .sh:NodeShape label}
[The atlas] {+w:atlas ?sh:targetNode} must **hold** {+#exH ?sh:property sh:name} at least twelve places before the Cartographer will call it a map.
[The atlas must hold at least twelve places — {$focusNode}] {=#exH .sh:PropertyShape sh:message}
[12] {sh:minCount ^^xsd:integer}
[holds] {+w:holds ?sh:path}
~~~~~~

## Stage 2 — Naturalist depth {=w:stage2-naturalist .w:Step label}
[2] {w:rank ^^xsd:integer}
[naturalist] {+w:naturalist ?w:forRole}
[VitalityShape] {+w:VitalityShape ?w:gate}
[4] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage2-naturalist w:payload}
# Stage 2 — Vitality

Living places differ in how alive they are. A **Natural** feature — spring, grove or herd — must report its **vitality**, and only a Naturalist has the word for it.

## Vitality {=w:VitalityShape .sh:NodeShape label}
Every [Natural] {+w:Natural ?sh:targetClass} must report a **vitality** {+#viV ?sh:property sh:name} from one to five.
[Vitality is unknown — {$focusNode}] {=#viV .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[1] {sh:minInclusive ^^xsd:integer}
[5] {sh:maxInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[vitality] {+w:vitality ?sh:path}
~~~~~~

## Stage 2 — Prospector depth {=w:stage2-prospector .w:Step label}
[2] {w:rank ^^xsd:integer}
[prospector] {+w:prospector ?w:forRole}
[GradeShape] {+w:GradeShape ?w:gate}
[3] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage2-prospector w:payload}
# Stage 2 — Grade

Seams are worth what they yield. A **Mineral** feature — ore or cave — must report its **grade**, and only a Prospector has the word for it.

## Grade {=w:GradeShape .sh:NodeShape label}
Every [Mineral] {+w:Mineral ?sh:targetClass} must report a **grade** {+#grG ?sh:property sh:name} from one to five.
[Grade is unknown — {$focusNode}] {=#grG .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[1] {sh:minInclusive ^^xsd:integer}
[5] {sh:maxInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[grade] {+w:grade ?sh:path}
~~~~~~

## Stage 2 — Archivist depth {=w:stage2-archivist .w:Step label}
[2] {w:rank ^^xsd:integer}
[archivist] {+w:archivist ?w:forRole}
[AgeShape] {+w:AgeShape ?w:gate}
[5] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage2-archivist w:payload}
# Stage 2 — Age

Traces of the past are only legible with a date. A **Relic** — ruin, shrine or wreck — must report its **age** in years, and no relic is younger than a century.

## Age {=w:AgeShape .sh:NodeShape label}
Every [Relic] {+w:Relic ?sh:targetClass} must report an **age** {+#agA ?sh:property sh:name} of at least a hundred years.
[Age is unknown — {$focusNode}] {=#agA .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[100] {sh:minInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[age] {+w:age ?sh:path}
~~~~~~

## Stage 3 — Trails {=w:stage3 .w:Step label}
[3] {w:rank ^^xsd:integer}
[TrailShape] {+w:TrailShape ?w:gate}
[12] {w:gateRecords ^^xsd:integer}

~~~~~~md {=w:stage3 w:payload}
# Stage 3 — Trails

A place alone is a point; a place with a trail is a *network*. Standing on a feature reveals where its trails lead — including places never yet seen. Following trails is how the last of the atlas gets filled in.

## Trails {=w:TrailShape .sh:NodeShape label}
Every [Feature] {+w:Feature ?sh:targetClass} must know at least one **trail** {+#trT ?sh:property sh:name} to another place.
[A place must know a trail — {$focusNode}] {=#trT .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[linkedTo] {+w:linkedTo ?sh:path}

## Reach {=w:ReachShape .sh:NodeShape label}
[The atlas] {+w:atlas ?sh:targetNode} is a finished survey once it **holds** {+#reH ?sh:property sh:name} twenty places or more.
[The atlas must hold at least twenty places — {$focusNode}] {=#reH .sh:PropertyShape sh:message}
[20] {sh:minCount ^^xsd:integer}
[holds] {+w:holds ?sh:path}
~~~~~~

---

## The Charter {=w:charter .w:Charter label}
[6] {w:spacing ^^xsd:integer}
[3] {w:quorum ^^xsd:integer}
[3] {w:maxSettlements ^^xsd:integer}

~~~~~~md {=w:charter w:payload}
# The Charter — what four viewpoints need from one place

No explorer can judge a site alone: the water belongs to the Naturalist, the ore to the Prospector, the age of the ruins to the Archivist, the roads to the Cartographer. The Commons joins what each has measured, and the Charter says what each will accept. Raise a number and fewer places qualify; lower it and settlements come sooner.

## Sites {=w:SiteShape .sh:NodeShape label}
Every [Site] {+w:Site ?sh:targetClass} needs an **ore** {+#siO ?sh:property sh:name} and a **relic** {+#siR ?sh:property sh:name} within reach, and then each viewpoint speaks: **vitality** {+#siV ?sh:property sh:name}, **grade** {+#siG ?sh:property sh:name}, **age** {+#siA ?sh:property sh:name} and **trails** {+#siT ?sh:property sh:name}.
[No ore within reach — {$focusNode}] {=#siO .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[ore] {+w:ore ?sh:path}
[No relic within reach — {$focusNode}] {=#siR .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[relic] {+w:relic ?sh:path}
[Bo will not settle beside poor water — {$focusNode}] {=#siV .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[3] {sh:minInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[vitality] {+w:vitality ?sh:path}
[Cy will not settle without workable ore — {$focusNode}] {=#siG .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[2] {sh:minInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[grade] {+w:grade ?sh:path}
[Di will not settle without old foundations — {$focusNode}] {=#siA .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[1000] {sh:minInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[age] {+w:age ?sh:path}
[Ada wants a crossroads — {$focusNode}] {=#siT .sh:PropertyShape sh:message}
[1] {sh:minCount ^^xsd:integer}
[3] {sh:minInclusive ^^xsd:integer}
[xsd:integer] {+xsd:integer ?sh:datatype}
[trails] {+w:trails ?sh:path}
~~~~~~

---

## What the shapes do not yet say

Ideas left dormant on purpose — each would pull the explorers somewhere new. Paste one into any worldview and watch the tasks change:

- *Every Terrain tile has an `elevation`.* The explorer starts noticing tiles at all, and sweeps the map to survey them.
- *Every Ruin must `linkedTo` a Spring.* A relation the world mostly does not offer — a good way to see a **blocked** task.
- *Every `rdf:Property` has a `domain` and a `range`.* Ontology first, one level deeper: the vocabulary must describe its own predicates.
