[mdld] <https://mdld.js.org/>
[cat] <mdld:prov/>
[ex] <mdld:prov/example/agent/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Agent {=prov:Agent .Class label}

> A person, organization, software agent, or other entity that can act and bear responsibility for activities. Agents are the actors in provenance who initiate, control, or participate in activities. {?comment}

<http://www.w3.org/ns/prov#Agent> {?cat:fullIRI}

---

## 🧩 Core Concept

Agents represent **entities that can act** - people, organizations, software programs, or autonomous systems that can perform activities and bear responsibility for actions.

**Key characteristics:**
- ✅ **Acting capability** - can perform or influence activities
- ✅ **Responsibility** - can be held accountable for actions
- ✅ **Association** - can be linked to activities they control
- ✅ **Attribution** - can be credited for entity creation

---

## 📋 Agent Validation Shape

The **Agent Shape** {=ex:AgentShape .sh:NodeShape ?cat:hasShape label} ensures proper agent modeling by targeting all [Agent] {+prov:Agent ?sh:targetClass} instances.

Agent shape defines these constraints: {?sh:property .sh:PropertyShape label}

- Association Rule {=ex:#association}
- Attribution Rule {=ex:#attribution}
- Delegation Rule {=ex:#delegation}

**Association Rule** {=ex:#association .sh:PropertyShape ?sh:property} allows [wasAssociatedWith] {+prov:wasAssociatedWith ?sh:path} to link agents to activities they participated in.

**Attribution Rule** {=ex:#attribution .sh:PropertyShape ?sh:property} allows [wasAttributedTo] {+prov:wasAttributedTo ?sh:path} to credit agents for entity creation.

**Delegation Rule** {=ex:#delegation .sh:PropertyShape ?sh:property} allows [actedOnBehalfOf] {+prov:actedOnBehalfOf ?sh:path} for responsibility chains.

---

## 📝 Test Data {=ex:data .Container ?cat:hasData}

### Person Agent {=ex:person .prov:Agent}

A human agent with typical properties.

Name: [Dr. Alice Chen] {foaf:name}
Email: [alice@university.edu] {foaf:mbox}

### Organization Agent {=ex:organization .prov:Agent}

An organizational agent.

Name: [Research Lab] {foaf:name}
Homepage: [https://research-lab.example] {foaf:homepage}

### Software Agent {=ex:software .prov:Agent}

A software agent.

Name: [Data Processor v2.1] {foaf:name}
Version: [2.1] {ex:version}

### Invalid Agent {=ex:invalidAgent .ex:Resource}

Missing required prov:Agent type - will fail validation.

---

[Shape] {=ex:AgentShape} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Person Agent** - passes (has prov:Agent type)
2. **Organization Agent** - passes (has prov:Agent type)  
3. **Software Agent** - passes (has prov:Agent type)
4. **Invalid Agent** - fails (missing prov:Agent type)

---

## 🔍 Test Validation

```bash
# Should show 1 violation - missing prov:Agent type
ig-cli validate ./agent.md
```

---

## 🎯 Authoring Patterns

### **Person Agent Pattern:**
```md
# Researcher {ex:alice .prov:Agent}
Name: [Dr. Alice Chen] {foaf:name}
Email: [alice@university.edu] {foaf:mbox}
```

### **Organization Agent Pattern:**
```md
# University {ex:university .prov:Agent}
Name: [State University] {foaf:name}
Homepage: [https://university.edu] {foaf:homepage}
```

### **Software Agent Pattern:**
```md
# Bot {ex:dataprocessor .prov:Agent}
Name: [Data Processor] {foaf:name}
Version: [1.0] {ex:version}
```

### **Agent Activity Association:**
```md
# Analysis Activity {ex:analysis .prov:Activity}
Associated with: [Researcher] {+ex:alice ?prov:wasAssociatedWith}
```

---

## ⚡ Key Benefits

- **Responsibility tracking** - clear attribution of actions
- **Trust modeling** - identify sources of information
- **Audit trails** - complete actor accountability
- **Multi-agent systems** - support for complex actor networks
- **Human + machine agents** - unified modeling approach

---

## 🔄 Related Terms

- **Activity** - what agents perform
- **Entity** - what agents create or influence
- **wasAssociatedWith** - links agent to activity
- **wasAttributedTo** - links entity to agent
- **actedOnBehalfOf** - delegation between agents
- **foaf:Agent** - complementary FOAF vocabulary
