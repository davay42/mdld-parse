[mdld] <https://mdld.js.org/>
[vortex] <https://mdld.js.org/vortex/>

# Vortex Template {=vortex:Template .sh:NodeShape label}

> Single-file self-contained vortex with SHACL+PROV-O for goal-driven knowledge propulsion {comment}

---

## Goal Definition {=vortex:GoalSection .Container label}

### Acieve Goal X {=vortex:PrimaryGoal .prov:Plan ?member label}

> Complete description of what needs to be achieved. {comment}

Goal is [yet to achieve] {+vortex:status/todo ?vortex:status}
Achieved: [false] {vortex:achieved ^^xsd:boolean}

---

## Command Log {=vortex:CommandLog .prov:Collection label}

### Command 1 - Initial Analysis {=vortex:Command1 .prov:Activity ?member}

According to [goal] {+vortex:PrimaryGoal ?prov:used} I ran the command `ig-cli stats ./docs` {vortex:command} at [2024-01-01T12:00:00Z] {prov:startedAtTime} and at [2024-01-01T12:01:00Z] {prov:endedAtTime} in resulted in this output: 

``` {vortex:output}
📄 Found 6 supported files
📊 RDF Statistics
🔗 Total Quads: 588
```

Has violations: [true] {vortex:hasViolations ^^xsd:boolean}

### Command 2 - Validation Check {=vortex:Command2 .prov:Activity ?member}

It's our second step in the [command log] {+vortex:CommandLog !member}. Based on [command 1] {+vortex:Command1 ?prov:wasInformedBy} I ran the command `ig-cli validate shapes.ttl` {vortex:command} at [2024-01-01T12:01:00Z] {prov:startedAtTime} and at [2024-01-01T12:02:00Z] {prov:endedAtTime} in resulted in this output: 

``` {vortex:output}
Conforms: ❌ NO
Total Violations: 2
```

Has violations: [true] {vortex:hasViolations ^^xsd:boolean}
---

## Propulsion Rules {=vortex:Shapes .prov:Entity label}

### Goal Achievement Shape {=vortex:GoalShape .sh:NodeShape label}

Targets the [Primary Goal] {+vortex:PrimaryGoal ?sh:targetNode} to ensure goal completion tracking.

**Achievement Required** {=vortex:#achievementRequired .sh:PropertyShape ?sh:property} requires the [achieved] {+vortex:achieved ?sh:path} property to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value: **Goal must be marked as achieved** {sh:message} .

### Violation Detection Shape {=vortex:ViolationShape .sh:NodeShape label}

Targets all [activities] {+prov:Activity ?sh:targetClass} to detect when action is needed.

**Violation Check** {=vortex:#violationCheck .sh:PropertyShape ?sh:property} requires the [hasViolations] {+vortex:hasViolations ?sh:path} property to be [false] {sh:hasValue ^^xsd:boolean} when present: **Activity with violations requires resolution** {sh:message}.

### Command Sequence Shape {=vortex:SequenceShape .sh:NodeShape label}

Targets all [activities] {+prov:Activity ?sh:targetClass} to ensure proper command sequencing.

**Sequencing Rule** {=vortex:#sequencingRule .sh:PropertyShape ?sh:property} requires activities to [not be first command] {+vortex:NotFirstCommandShape ?sh:not}: **Activities must follow sequencing rules** {sh:message} .

### Not First Command Shape {=vortex:NotFirstCommandShape .sh:NodeShape}

**Has Predecessor Required** {=vortex:#hasPredecessor .sh:PropertyShape ?sh:property} requires the [wasInformedBy] {+prov:wasInformedBy ?sh:path} property to have at least [1] {sh:minCount ^^xsd:integer} value: **Commands must be informed by previous activity** {sh:message} .

### First Command Exception Shape {=vortex:FirstCommandShape .sh:NodeShape label}

Targets the [first command] {+vortex:Command1 ?sh:targetNode} to exempt it from sequencing requirements.

**No Predecessor Required** {=vortex:#noPredecessor .sh:PropertyShape ?sh:property} requires the [wasInformedBy] {+prov:wasInformedBy ?sh:path} property to have exactly [0] {sh:maxCount ^^xsd:integer} values: **First command has no predecessor** {sh:message} .

---

## Current State {=vortex:CurrentState .prov:Entity label}

Last command: [Command 2] {?vortex:lastCommand +vortex:Command2}
Violations: [2] {vortex:violations ^^xsd:integer}
Next decision: [human_or_llm] {vortex:nextDecision}
Propulsion active: [true] {vortex:propulsionActive ^^xsd:boolean}


### 🔍 Test Validation

```bash
# This should show 3 violations for vortex template validation
ig-cli validate ./vortex/VORTEX_TEMPLATE.md
```

---

## 📝 Usage Instructions

### Creating a New Vortex

1. Copy this template to your project directory
2. Modify the goal definition in the Goal Section
3. Update the command log as you execute commands
4. Add new command activities to maintain provenance

### Vortex Propulsion

The vortex self-propels through:
1. **SHACL violations** create pressure for action
2. **Command activities** resolve violations
3. **Goal achievement** ends propulsion
4. **Continuous logging** maintains provenance

### Single-File Architecture

This template demonstrates how a single MDLD file can contain:
- Complete PROV-O activity chains
- SHACL propulsion rules
- Current state tracking
- Test data for validation
- Self-contained knowledge engine

---

## 🔧 Technical Notes

### **Vortex Self-Modification**
- Each new command is added as a new activity heading
- Command outputs are preserved in activity properties
- State updates maintain current vortex status
- Provenance chains grow automatically

### **SHACL Propulsion**
- Violations in goal state drive new commands
- Missing properties create actionable requirements
- Sequence validation ensures proper command flow
- Achievement criteria define completion

### **PROV-O Integration**
- Activities represent command executions
- Plans represent goals and strategies
- Entities represent files and data
- wasInformedBy creates command chains

This template provides the minimal complete vortex engine in a single file!
