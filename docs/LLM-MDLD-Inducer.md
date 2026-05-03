# LLM MDLD Pattern Inducer

**Pattern-first grounding for semantic MDLD authoring**

---

## Default Prefixes (Always Available)

```
[@vocab] <http://www.w3.org/2000/01/rdf-schema#>

[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[sh] <http://www.w3.org/ns/shacl#>
[prov] <http://www.w3.org/ns/prov#>
```

Add custom prefixes: `[prefix] <IRI>`

---

## Pattern 1: Simple Entity with Literal Properties

```md
[my] <tag:myemail@example.com,2026:>

# Document Title {=my:document .my:Document label}

This document has a [title] {my:title} and was created on [2026-01-15] {my:created ^^xsd:date}.
The author is [Alice] {my:author}.
```

**Emits:**
- `my:document rdf:type my:Document`
- `my:document rdfs:label "Document Title"`
- `my:document my:title "title"`
- `my:document my:created "2026-01-15"^^xsd:date`
- `my:document my:author "Alice"`

---

## Pattern 2: Entity with Object Properties (Subject Chaining)

```md
[my] <tag:myemail@example.com,2026:>

# Project {=my:project .my:Project label}

The project is led by [Alice] {+my:alice ?my:lead .my:Person label} and includes [Bob] {+my:bob ?my:member .my:Person label}.
```

**Emits:**
- `my:project rdf:type my:Project`
- `my:project rdfs:label "Project"`
- `my:project my:lead my:alice`
- `my:alice rdf:type my:Person`
- `my:alice rdfs:label "Alice"`
- `my:project my:member my:bob`
- `my:bob rdf:type my:Person`
- `my:bob rdfs:label "Bob"`

**Key:** `{+IRI}` introduces temporary object, subject remains `my:project`

---

## Pattern 3: Fragment Subjects for Related Entities

```md
[ex] <http://example.org/>

# Report {=ex:report .ex:Report label}

Contains sections:
- Introduction {+#intro ?ex:hasSection .ex:Section label}
- Analysis {+#analysis ?ex:hasSection .ex:Section label}
- Conclusion {+#conclusion ?ex:hasSection .ex:Section label}
```

**Emits:**
- `ex:report rdf:type ex:Report`
- `ex:report ex:hasSection ex:report#intro`
- `ex:report#intro rdf:type ex:Section`
- `ex:report#intro rdfs:label "Introduction"`
- `ex:report ex:hasSection ex:report#analysis`
- `ex:report#analysis rdf:type ex:Section`
- `ex:report#analysis rdfs:label "Analysis"`
- `ex:report ex:hasSection ex:report#conclusion`
- `ex:report#conclusion rdf:type ex:Section`
- `ex:report#conclusion rdfs:label "Conclusion"`

**Key:** `{=#fragment}` creates `currentSubjectBase#fragment`

---

## Pattern 4: Lists (No Semantic Scope - Explicit Annotations Required)

```md
[ex] <http://example.org/>

# Team {=ex:team .ex:Team label}

Members:
- **Alice** {+ex:alice ?ex:member .ex:Person label}
- **Bob** {+ex:bob ?ex:member .ex:Person label}
- **Carol** {+ex:carol ?ex:member .ex:Person label}
```

**Emits:**
- `ex:team rdf:type ex:Team`
- `ex:team ex:member ex:alice`
- `ex:alice rdf:type ex:Person`
- `ex:alice rdfs:label "Alice"`
- `ex:team ex:member ex:bob`
- `ex:bob rdf:type ex:Person`
- `ex:bob rdfs:label "Bob"`
- `ex:team ex:member ex:carol`
- `ex:carol rdf:type ex:Person`
- `ex:carol rdfs:label "Carol"`

**Critical:** Each list item needs explicit `{+IRI ?predicate}` - no inheritance

---

## Pattern 5: Reverse Relationships with !

```md
[ex] <http://example.org/>

# Recipe {=ex:recipe .ex:Recipe label}

Ingredients used in this recipe:
- Flour {+ex:Flour !hasIngredient}
- Sugar {+ex:Sugar !hasIngredient}
- Eggs {+ex:Eggs !hasIngredient}
```

**Emits:**
- `ex:recipe rdf:type ex:Recipe`
- `ex:Flour ex:hasIngredient ex:recipe`
- `ex:Sugar ex:hasIngredient ex:recipe`
- `ex:Eggs ex:hasIngredient ex:recipe`

**Key:** `!predicate` flips direction: Object → Subject

---

## Pattern 6: PROV Entity with Provenance

```md
[prov] <http://www.w3.org/ns/prov#>
[ex] <tag:example.org,2026:>

# Dataset {=ex:dataset .prov:Entity label}

Created at [2026-01-15T10:00:00Z] {prov:generatedAtTime ^^xsd:dateTime} by [Alice] {+ex:alice .prov:Agent ?prov:wasAttributedTo} during the [Data Collection] {+ex:collection .prov:Activity ?prov:wasGeneratedBy}.
```

**Emits:**
- `ex:dataset rdf:type prov:Entity`
- `ex:dataset prov:generatedAtTime "2026-01-15T10:00:00Z"^^xsd:dateTime`
- `ex:dataset prov:wasAttributedTo ex:alice`
- `ex:alice rdf:type prov:Agent`
- `ex:dataset prov:wasGeneratedBy ex:collection`
- `ex:collection rdf:type prov:Activity`

---

## Pattern 7: PROV Activity with Temporal and Agent

```md
[prov] <http://www.w3.org/ns/prov#>
[ex] <tag:example.org,2026:>

# Data Processing {=ex:processing .prov:Activity label}

Started at [2026-01-15T09:00:00Z] {prov:startedAtTime ^^xsd:dateTime} and ended at [2026-01-15T11:00:00Z] {prov:endedAtTime ^^xsd:dateTime}.
Performed by [Alice] {+ex:alice .prov:Agent ?prov:wasAssociatedWith}.
Used the [Raw Data] {+ex:rawData .prov:Entity ?prov:used}.
```

**Emits:**
- `ex:processing rdf:type prov:Activity`
- `ex:processing prov:startedAtTime "2026-01-15T09:00:00Z"^^xsd:dateTime`
- `ex:processing prov:endedAtTime "2026-01-15T11:00:00Z"^^xsd:dateTime`
- `ex:processing prov:wasAssociatedWith ex:alice`
- `ex:alice rdf:type prov:Agent`
- `ex:processing prov:used ex:rawData`
- `ex:rawData rdf:type prov:Entity`

---

## Pattern 8: PROV Complete Workflow (Entity → Activity → Entity)

```md
[prov] <http://www.w3.org/ns/prov#>
[ex] <tag:example.org,2026:>

# User Request {=ex:request .prov:Entity label}
Received at [2026-03-10T14:51:05Z] {prov:generatedAtTime ^^xsd:dateTime} from [User] {+ex:user .prov:Agent ?prov:wasAttributedTo}.

~~~~~~ {prov:value}
What time is it?
~~~~~~

# Time Query Activity {=ex:activity .prov:Activity}
Started at [2026-03-10T14:51:10Z] {prov:startedAtTime ^^xsd:dateTime}, ended at [2026-03-10T14:51:12Z] {prov:endedAtTime ^^xsd:dateTime}.
Led by [LLM Agent] {+ex:agent .prov:SoftwareAgent ?prov:wasAssociatedWith}.
Used the [request] {+ex:request ?prov:used}.

# Time Response {=ex:response .prov:Entity ?prov:generated label}
Generated at [2026-03-10T14:51:15Z] {prov:generatedAtTime ^^xsd:dateTime}.
Derived from [request] {+ex:request ?prov:wasDerivedFrom}.
Attributed to [agent] {+ex:agent ?prov:wasAttributedTo}.
```

**Emits:**
- `ex:request rdf:type prov:Entity`
- `ex:request prov:generatedAtTime "2026-03-10T14:51:05Z"^^xsd:dateTime`
- `ex:request prov:wasAttributedTo ex:user`
- `ex:user rdf:type prov:Agent`
- `ex:request prov:value "What time is it?"`
- `ex:activity rdf:type prov:Activity`
- `ex:activity prov:startedAtTime "2026-03-10T14:51:10Z"^^xsd:dateTime`
- `ex:activity prov:endedAtTime "2026-03-10T14:51:12Z"^^xsd:dateTime`
- `ex:activity prov:wasAssociatedWith ex:agent`
- `ex:agent rdf:type prov:SoftwareAgent`
- `ex:activity prov:used ex:request`
- `ex:response rdf:type prov:Entity`
- `ex:response prov:generatedAtTime "2026-03-10T14:51:15Z"^^xsd:dateTime`
- `ex:response prov:wasDerivedFrom ex:request`
- `ex:response prov:wasAttributedTo ex:agent`

---

## Pattern 9: SHACL Node Shape with Property Constraints

```md
[sh] <http://www.w3.org/ns/shacl#>
[ex] <tag:example.org,2026:>

**User Validation Shape** {=ex:UserShape .sh:NodeShape label}
Targets all [User] {+ex:User ?sh:targetClass} instances to have [username] {+#username ?sh:property sh:name} and [email] {+#email ?sh:property sh:name}.

**Username is required** {=#username .sh:PropertyShape sh:message}
Requires [username] {+ex:username ?sh:path} to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Email is required** {=#email .sh:PropertyShape sh:message}
Requires [email] {+ex:email ?sh:path} to be a valid email pattern [^.+@.+\..+] {sh:pattern}.
```

**Emits:**
- `ex:UserShape rdf:type sh:NodeShape`
- `ex:UserShape rdfs:label "User Validation Shape"`
- `ex:UserShape sh:targetClass ex:User`
- `ex:UserShape sh:property ex:UserShape#username`
- `ex:UserShape#username rdfs:label "username"`
- `ex:UserShape sh:property ex:UserShape#email`
- `ex:UserShape#email rdfs:label "email"`
- `ex:UserShape#username rdf:type sh:PropertyShape`
- `ex:UserShape#username sh:message "Username is required"`
- `ex:UserShape#username sh:path ex:username`
- `ex:UserShape#username sh:minCount 1^^xsd:integer`
- `ex:UserShape#username sh:maxCount 1^^xsd:integer`
- `ex:UserShape#email rdf:type sh:PropertyShape`
- `ex:UserShape#email sh:message "Email is required"`
- `ex:UserShape#email sh:path ex:email`
- `ex:UserShape#email sh:pattern ".+@.+\..+"`


---

## Pattern 10: SHACL Shape with Test Data

```md
[sh] <http://www.w3.org/ns/shacl#>
[ex] <tag:example.org,2026:>

**User Validation Shape** {=ex:UserShape .sh:NodeShape label}
Targets all [User] {+ex:User ?sh:targetClass} instances to have [username] {+#username ?sh:property sh:name}.

**Username is required** {=#username .sh:PropertyShape sh:message}
Requires [username] {+ex:username ?sh:path} to have exactly [1] {sh:minCount ^^xsd:integer} value.

{=}

# Test Data

## Valid User {=ex:user1 .ex:User}
Username: [alice] {ex:username}

## Invalid User {=ex:user2 .ex:User}
Missing username - should fail validation.
```

**Emits:**
- Shape definition quads (from Pattern 9)
- `ex:user1 rdf:type ex:User`
- `ex:user1 ex:username "alice"`
- `ex:user2 rdf:type ex:User`

**Key:** `{=} resets subject before test data section

---

## Pattern 11: RDF Reification (Statement about Statement)

```md
[ex] <tag:example.org,2026:>

# Observation {=ex:obs1 .rdf:Statement label}

I observed that [the sensor] {+ex:sensor ?rdf:subject} [reported] {+ex:reported ?rdf:predicate} a [temperature] {+ex:temp ?rdf:object} of [25] {ex:value ^^xsd:decimal}.
```

**Emits:**
- `ex:obs1 rdf:type rdf:Statement`
- `ex:obs1 rdfs:label "Observation"`
- `ex:obs1 rdf:subject ex:sensor`
- `ex:obs1 rdf:predicate ex:reported`
- `ex:obs1 rdf:object ex:temp`
- `ex:obs1 ex:value 25^^xsd:decimal`

---

## Pattern 12: RDF List Construction

```md
[ex] <tag:example.org,2026:>

# Ordered List {=ex:list .rdf:List label}

[head] {=ex:l1 ?rdf:first .rdf:List}
[first item] {+ex:item1 ?rdf:first}
[rest] {=ex:l2 ?rdf:rest}
[second item] {+ex:item2 ?rdf:first}
[nil] {+rdf:nil ?rdf:rest}
```

**Emits:**
- `ex:list rdf:type rdf:List`
- `ex:list rdf:first ex:l1`
- `ex:l1 rdf:first ex:item1`
- `ex:l1 rdf:rest ex:l2`
- `ex:l2 rdf:first ex:item2`
- `ex:l2 rdf:rest rdf:nil`

---

## Pattern 13: RDFS Class Hierarchy

```md
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[ex] <tag:example.org,2026:>

# Person {=ex:Person .rdfs:Class label}

[Employee] {=ex:Employee .rdfs:Class label} is a subclass of [Person] {+ex:Person ?rdfs:subClassOf}.

[Manager] {=ex:Manager .rdfs:Class label} is a subclass of [Employee] {+ex:Employee ?rdfs:subClassOf}.
```

**Emits:**
- `ex:Person rdf:type rdfs:Class`
- `ex:Person rdfs:label "Person"`
- `ex:Employee rdf:type rdfs:Class`
- `ex:Employee rdfs:subClassOf ex:Person`
- `ex:Manager rdf:type rdfs:Class`
- `ex:Manager rdfs:subClassOf ex:Employee`

---

## Pattern 14: RDFS Property Schema

```md
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>
[ex] <tag:example.org,2026:>

# Author Property {=ex:author .rdf:Property label}

Domain is [Document] {+ex:Document ?rdfs:domain}.
Range is [Person] {+ex:Person ?rdfs:range}.
```

**Emits:**
- `ex:author rdf:type rdf:Property`
- `ex:author rdfs:label "Author Property"`
- `ex:author rdfs:domain ex:Document`
- `ex:author rdfs:range ex:Person`

---

## Pattern 15: Language-Tagged Literals

```md
[ex] <tag:example.org,2026:>

# Document {=ex:doc .ex:Document label}

Title in English: [Hello World] {ex:title @en}.
Title in French: [Bonjour le monde] {ex:title @fr}.
Title in German: [Hallo Welt] {ex:title @de}.
```

**Emits:**
- `ex:doc rdf:type ex:Document`
- `ex:doc ex:title "Hello World"@en`
- `ex:doc ex:title "Bonjour le monde"@fr`
- `ex:doc ex:title "Hallo Welt"@de`

---

## Pattern 16: Code Block as Value Carrier

```md
[ex] <tag:example.org,2026:>

~~~~~~js {=ex:code .ex:SourceCode text}
console.log("Hello, MDLD!");
~~~~~~
```

**Emits:**
- `ex:code rdf:type ex:SourceCode`
- `ex:code schema:text "console.log(\"Hello, MDLD!\");"`

---

## Pattern 17: Link with URL as Object

```md
[ex] <tag:example.org,2026:>

# Document {=ex:doc .ex:Document label}

See the [specification](https://example.org/spec) {?ex:references name}.
```

**Emits:**
- `ex:doc rdf:type ex:Document`
- `ex:doc ex:references <https://example.org/spec>`
- `<https://example.org/spec> schema:name "specification"`

---

## Pattern 18: Subject Reset for Context Switch

```md
[ex] <tag:example.org,2026:>

# First Document {=ex:doc1 .ex:Document label}
Has title [Doc 1] {ex:title}.

{=}

# Second Document {=ex:doc2 .ex:Document ?member label}
Has title [Doc 2] {ex:title}.
```

**Emits:**
- `ex:doc1 rdf:type ex:Document`
- `ex:doc1 ex:title "Doc 1"`
- `ex:doc2 rdf:type ex:Document`
- `ex:doc2 ex:title "Doc 2"`

**Key:** Note that this triple is not generated: `ex:doc2 rdfs:member ex:doc1` - {=} clears current subject before new context to avoid accidental chaining. 

---

## Pattern 19: Related Entities with Fragment Subjects

```md
[ex] <tag:example.org,2026:>

# Organization {=ex:org .ex:Organization label}

Has 2 departments: **Engineering** {+#eng ?ex:hasDepartment} and **Marketing** {+#mkt ?ex:hasDepartment}.

# Engineering Department {=ex:org#eng .ex:Department label}
Led by [Alice] {+ex:alice ?ex:head .ex:Person label}.

# Marketing Department {=ex:org#mkt .ex:Department label}
Led by [Bob] {+ex:bob ?ex:head .ex:Person label}.
```

**Emits:**
- `ex:org rdf:type ex:Organization`
- `ex:org ex:hasDepartment ex:org#eng`
- `ex:org#eng rdf:type ex:Department`
- `ex:org#eng rdfs:label "Engineering"`
- `ex:org ex:hasDepartment ex:org#mkt`
- `ex:org#mkt rdf:type ex:Department`
- `ex:org#mkt rdfs:label "Marketing"`
- `ex:org#eng rdf:type ex:Department`
- `ex:org#eng ex:head ex:alice`
- `ex:alice rdf:type ex:Person`
- `ex:alice rdfs:label "Alice"`
- `ex:org#mkt rdf:type ex:Department`
- `ex:org#mkt ex:head ex:bob`
- `ex:bob rdf:type ex:Person`
- `ex:bob rdfs:label "Bob"`

**Key:** Lists have no semantic scope - use fragment subjects and explicit subject resets to model nested relationships

---

## Pattern 20: Diff Polarity (Remove Facts)

```md
[ex] <tag:example.org,2026:>

**Document** {=ex:doc} originally had [draft] {-ex:status} status, now it's [published] {ex:status}.
```

**Emits:**
- `ex:doc rdf:type ex:Document`
- `ex:doc ex:status "draft"`
- Remove: `ex:doc ex:status "draft"`
- `ex:doc ex:status ex:published`

**Key:** `-predicate` removes existing fact, `+IRI ?predicate` adds new

---

## Quick Reference

| Symbol | Meaning | Example |
|--------|---------|---------|
| `{=IRI}` | Set subject (persists) | `{=ex:doc .ex:Document label}` |
| `{=#frag}` | Fragment subject | `{=#intro ?ex:hasSection}` |
| `{=} | Reset subject | `{=} |
| `{+IRI}` | Temporary object | `{+ex:alice ?ex:author}` |
| `p` | Literal property | `{ex:title}` |
| `?p` | Object property | `{?ex:author}` |
| `!p` | Reverse property | `{!ex:hasIngredient}` |
| `-p` | Remove literal | `{-ex:status}` |
| `.Class` | Type declaration | `{.ex:Person}` |
| `^^type` | Datatype | `{^^xsd:integer}` |
| `@lang` | Language tag | `{@en}` |

---

## Critical Rules

1. **Every triple from annotation** - No implicit semantics
2. **Literals from value carriers** - Text must be attached
3. **Subject chaining** - Use `{+IRI}` for temporary objects
4. **Lists have no scope** - Each item needs explicit annotation
5. **No blank nodes** - Every entity needs IRI
6. **Subject reset** - Use `{=} when switching contexts
7. **Attachment rule** - `{...}` must follow carrier immediately
