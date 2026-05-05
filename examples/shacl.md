<a id="index"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Catalog {=cat:index .Container label}

> A comprehensive guide to SHACL validation in MDLD (Markdown Linked Data) - self-validating documentation for semantic authors. {?comment}

This catalog [includes] {+cat:includes .rdf:Property label} all constraints and targeting mechanisms available in SHACL.

## Contents

[Getting Started](#teach-getting-started)
[Choosing Constraints](#teach-choosing-constraints)
[Practical Workflow](#teach-practical-workflow)
[Advanced Techniques](#teach-advanced)
[Targeting](#targeting-index)
[Constraints](#constraints-index)






{=}



<a id="teach-getting-started"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Getting Started with MDLD SHACL

> Learn the fundamentals of SHACL validation in MDLD (Markdown Linked Data) {comment}

## What is SHACL?

SHACL (Shapes Constraint Language) is a W3C standard for validating RDF graphs. In MDLD, SHACL constraints are written directly in Markdown, making validation rules human-readable and machine-processable.

## Core Concepts

**Shapes** define validation rules for your data. Think of a shape as a template that your data must conform to.

**Targets** determine which nodes in your data get validated. You can target by class, specific node, or relationship.

**Constraints** define the actual validation rules (e.g., required properties, value ranges, string patterns).

## Your First Shape

Let's create a simple shape for validating user accounts:

~~~~~~md
[ex] <tag:my@example.org,2026:users/>

**User Validation Shape** {=ex:UserShape .sh:NodeShape label}
Validates all [User] {+ex:User ?sh:targetClass} instances to have a [name] {+ex:UsernameRule ?sh:property sh:name} and an [email] {+ex:EmailRule ?sh:property sh:name}.

**Username is required** {=ex:UsernameRule .sh:PropertyShape sh:message} requires [username] {+ex:username ?sh:path} to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Email is required** {=ex:EmailRule .sh:PropertyShape sh:message} requires [email] {+ex:email ?sh:path} must have at least [1] {sh:minCount ^^xsd:integer} value.
~~~~~~

## Key MDLD Syntax Patterns

| Pattern | Meaning | Example |
|---------|---------|---------|
| `{=}` | Subject declaration (persists) | `{=ex:shape .sh:NodeShape}` |
| `{+}` | Object introduction (temporary) | `{+ex:target ?sh:targetClass}` |
| `?` | Object predicate (Subject → Object) | `?sh:targetClass`, `?sh:path` |
| `.` | Class type declaration | `.sh:NodeShape` |
| `^^` | Literal datatype | `^^xsd:integer` |

## Basic Workflow

1. **Define your shape** - Create a NodeShape with a descriptive name
2. **Set your target** - Choose how to select data (targetClass, targetNode, etc.)
3. **Add property rules** - Define PropertyShapes for each property to validate
4. **Add constraints** - Apply constraint rules (minCount, datatype, pattern, etc.)
5. **Test with data** - Create test data with valid and invalid examples

## Next Steps

- Learn about [Targeting Mechanisms](#targeting-index) to select your data
- Explore [Constraints](#constraints-index) to define validation rules
- See practical examples in the constraint documentation






{=}



<a id="targeting-index"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Catalog {=cat:index}

## Targeting Mechanism {+class:Targeting ?member .Class label}

These are targeting predicates that determine which nodes get validated (not constraints themselves): 

- [Target Class](#targeting-targetclass) {+sh:targetClass ?cat:includes .class:TargetingPredicate}
- [Target Node](#targeting-targetnode) {+sh:targetNode ?cat:includes .class:TargetingPredicate}
- [Target Subjects](#targeting-targetsubjectsof) {+sh:targetSubjectsOf ?cat:includes .class:TargetingPredicate}
- [Target Objects](#targeting-targetobjectsof) {+sh:targetObjectsOf ?cat:includes .class:TargetingPredicate}

---

[Syntax Reference](#syntax-reference)






{=}



<a id="targeting-targetclass"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>


# Target Class {=sh:targetClass .class:TargetingMechanism label}

> Targets all nodes that are instances of a specific RDF class (rdf:type) for shape validation. Essential for class-based validation scenarios across entire domains. {comment}

<http://www.w3.org/ns/shacl#targetClass> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The targetClass constraint targets all nodes that are instances of a specific RDF class. This example validates all Product instances for business requirements.

~~~~~~md
[ex] <mdld:shacl/example/targeting/>

## Product Validation Shape {=ex:ProductValidationShape .sh:NodeShape  label}

Targets all [Product] {+ex:Product ?sh:targetClass} instances to validate core product requirements: [name] {+#productName ?sh:property sh:name} and [price] {+#productPrice ?sh:property sh:name}.

**Product must have exactly one name** {=#productName .sh:PropertyShape sh:message} requires the [name] {+ex:name ?sh:path} property to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Product price must be positive** {=#productPrice .sh:PropertyShape sh:message} requires the [price] {+ex:price ?sh:path} property to be at least [0.01] {sh:minInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### Laptop {=ex:Laptop .ex:Product}
Name: [MacBook Pro] {ex:name}
Price: [1299.99] {ex:price ^^xsd:decimal}

### Invalid Product {=ex:InvalidProduct .ex:Product}
Price: [-50.00] {ex:price ^^xsd:decimal}

### Service {=ex:Service .ex:Service}
Name: [Consulting] {ex:name}
Price: [200.00] {ex:price ^^xsd:decimal}
~~~~~~

**Expected Result:** 2 violations (InvalidProduct fails twice: missing name AND negative price; Service not validated since it's not a Product)

---

## 📝 MDLD Syntax Patterns

Target class targets all nodes that are instances of a specific RDF class for shape validation.

~~~~~~md
**[Shape] targets [Class] instances** {=ex:ShapeName .sh:NodeShape label}

[Shape Name] {=ex:ShapeName .sh:NodeShape label} targets all [Class] {+ex:Class ?sh:targetClass} instances to validate requirements.
~~~~~~

**Key components:**
- **Shape declaration** - The shape being defined (`{=ex:ShapeName .sh:NodeShape label}`)
- **Target class** - The class to target (`{+ex:Class ?sh:targetClass}`)
- **Validation rules** - Property constraints within the shape
- **Class-based selection** - Validates all instances of the specified class

**Important notes:**
- Target class validates all instances of the specified class
- Ideal for domain-wide validation rules
- Works with rdf:type relationships
- Combine with targeting mechanisms for complex scenarios
- Use for consistent validation across class instances

---

## 🎯 Use Cases

- **Domain validation** - Validate all instances of a domain class
- **Business rules** - Enforce class-specific business requirements
- **Data quality** - Ensure data consistency across class instances
- **Schema enforcement** - Apply validation rules to entire class hierarchies
- **Compliance** - Validate regulatory requirements for specific entity types

---

## 🔧 Implementation Guidelines

**When to use target class:**
- **Domain-wide validation** - When validating entire classes of entities
- **Business rules** - Enforce class-specific business requirements
- **Data quality** - Ensure consistency across class instances
- **Schema enforcement** - Apply validation to class hierarchies
- **Compliance** - Validate regulatory requirements

**Best practices:**
- Use descriptive shape names that reflect the target class
- Combine with other targeting mechanisms for complex scenarios
- Test with valid and invalid instances
- Document the validation scope clearly
- Consider performance for large class instances

**Common pitfalls:**
- ❌ Forgetting that target class validates all instances
- ❌ Not testing with instances outside the target class
- ❌ Confusing target class with target node
- ❌ Not considering performance for large datasets
- ❌ Overusing target class when target node would be more appropriate






{=}



<a id="targeting-targetnode"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>


# Target Node {=sh:targetNode .class:TargetingMechanism label}

> Targets specific individual nodes identified by their IRI for precise, node-by-node validation. Perfect for critical infrastructure, testing scenarios, and executive-level validation. {comment}

<http://www.w3.org/ns/shacl#targetNode> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The targetNode constraint targets specific individual nodes for validation. This example demonstrates critical infrastructure and executive validation scenarios.

~~~~~~md
[ex] <mdld:shacl/example/targeting/>

## Critical Infrastructure Demo

The **Database Validation Shape** {=ex:DatabaseValidationShape .sh:NodeShape ?cat:hasShape label} targets the [Main Database] {+ex:MainDatabase ?sh:targetNode} for critical infrastructure validation: [status] {+#databaseStatus ?sh:property sh:name} and [uptime] {+#databaseUptime ?sh:property sh:name}.

**Main database must be online** {=#databaseStatus .sh:PropertyShape sh:message} requires the [status] {+ex:status ?sh:path} property to be exactly [online] {sh:hasValue}.

**Database uptime must be at least 99.9%** {=#databaseUptime .sh:PropertyShape sh:message} that requires the [uptime] {+ex:uptime ?sh:path} property to be at least [99.9] {sh:minInclusive ^^xsd:decimal}.

## Executive Validation Demo

**CEO Validation Shape** {=ex:CEOValidationShape .sh:NodeShape ?cat:hasShape label} targets the [CEO] {+ex:CEO ?sh:targetNode} for [executive] {+#executiveClearance ?sh:property sh:name} level clearance.

**CEO must have top-secret security clearance** {=#executiveClearance .sh:PropertyShape sh:message} requires the [securityClearance] {+ex:securityClearance ?sh:path} property to be exactly [top-secret] {sh:hasValue}.

---

## Test Data {=ex:data .Container}

### Main Database {=ex:MainDatabase}
Status: [offline] {ex:status}
Uptime: [95.5] {ex:uptime ^^xsd:decimal}

### Backup Database {=ex:BackupDatabase}
Status: [online] {ex:status}
Uptime: [99.8] {ex:uptime ^^xsd:decimal}

### CEO {=ex:CEO}
Security Clearance: [secret] {ex:securityClearance}

### CFO {=ex:CFO}
Security Clearance: [secret] {ex:securityClearance}
~~~~~~

**Expected Result:** 3 violations (MainDatabase fails twice: status offline AND uptime < 99.9%; CEO fails: clearance is secret not top-secret; BackupDatabase and CFO not validated as they're not targeted)

---

## 📝 MDLD Syntax Patterns

Target node targets specific individual nodes identified by their IRI for precise validation.

~~~~~~md
**[Shape] targets [Node]** {=ex:ShapeName .sh:NodeShape label}

[Shape Name] {=ex:ShapeName .sh:NodeShape label} targets the [Node] {+ex:Node ?sh:targetNode} for validation.
~~~~~~

**Key components:**
- **Shape declaration** - The shape being defined (`{=ex:ShapeName .sh:NodeShape label}`)
- **Target node** - The specific node to target (`{+ex:Node ?sh:targetNode}`)
- **Validation rules** - Property constraints within the shape
- **Node-specific selection** - Validates only the specified node

**Important notes:**
- Target node validates only the specified individual node
- Ideal for critical infrastructure and executive validation
- Provides precise control over validation scope
- Use for testing specific scenarios
- Combine with other targeting mechanisms for complex scenarios

---

## 🎯 Use Cases

- **Critical infrastructure** - Validate critical systems and infrastructure
- **Executive validation** - Validate executive-level entities
- **Testing scenarios** - Test specific nodes in isolation
- **Compliance** - Validate specific regulatory entities
- **Quality assurance** - Validate specific production nodes

---

## 🔧 Implementation Guidelines

**When to use target node:**
- **Critical infrastructure** - When validating specific critical systems
- **Executive validation** - When validating executive-level entities
- **Testing** - When testing specific nodes in isolation
- **Compliance** - When validating specific regulatory entities
- **Quality assurance** - When validating specific production nodes

**Best practices:**
- Use descriptive node identifiers for clarity
- Combine with target class for comprehensive validation
- Test with valid and invalid node states
- Document why specific nodes are targeted
- Consider using target class for broader validation

**Common pitfalls:**
- ❌ Forgetting that target node validates only one specific node
- ❌ Overusing target node when target class would be more appropriate
- ❌ Not testing with nodes outside the target
- ❌ Confusing target node with target class
- ❌ Not documenting why specific nodes are targeted






{=}



<a id="targeting-targetsubjectsof"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>


# Target Subjects Of {=sh:targetSubjectsOf .class:TargetingMechanism label}

> Targets all subjects (nodes) that have a specific property pointing to any value. Useful for reverse relationship targeting, source validation, and validating entities that initiate relationships. {comment}

<http://www.w3.org/ns/shacl#targetSubjectsOf> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The targetSubjectsOf constraint targets all subjects (nodes) that have a specific property pointing to any value. This example demonstrates management and approval scenarios where we validate entities that initiate relationships.

~~~~~~md
[ex] <mdld:shacl/example/targeting/>

## Management Validation Demo

The **Manager Validation Shape** {=ex:ManagerValidationShape .sh:NodeShape label} targets all [managers] {+ex:manages ?sh:targetSubjectsOf} of the manages relationship to validate management requirements: [level] {+#managementLevel ?sh:property sh:name} and [teamSize] {+#teamSize ?sh:property sh:name}.

**Managers must have level 3 or higher** {=#managementLevel .sh:PropertyShape sh:message} requires the [level] {+ex:level ?sh:path} property to be at least [3] {sh:minInclusive ^^xsd:integer}.

**Managers can oversee at most 10 team members** {=#teamSize .sh:PropertyShape sh:message} that requires the [teamSize] {+ex:teamSize ?sh:path} property to be at most [10] {sh:maxInclusive ^^xsd:integer}.

## Approval Validation Demo

**Approver Validation Shape** {=ex:ApproverValidationShape .sh:NodeShape label} targets all [approvers] {+ex:approves ?sh:targetSubjectsOf} of the approves relationship to validate approval [authority] {+#approvalAuthority ?sh:property sh:name}.

**Approvers must have authority level 2 or higher** {=#approvalAuthority .sh:PropertyShape sh:message} requires the [authority] {+ex:authority ?sh:path} property to be at least [2] {sh:minInclusive ^^xsd:integer}.

---

## Test Data {=ex:data .Container}

### Engineering Manager {=ex:EngineeringManager}
Level: [2] {ex:level ^^xsd:integer}
Team Size: [15] {ex:teamSize ^^xsd:integer}
Manages: [EngineeringTeam] {ex:manages}

### Senior Manager {=ex:SeniorManager}
Level: [4] {ex:level ^^xsd:integer}
Team Size: [8] {ex:teamSize ^^xsd:integer}
Manages: [QATeam] {ex:manages}

### Junior Developer {=ex:JuniorDeveloper}
Level: [1] {ex:level ^^xsd:integer}
Team Size: [0] {ex:teamSize ^^xsd:integer}

### Finance Approver {=ex:FinanceApprover}
Authority: [1] {ex:authority ^^xsd:integer}
Approves: [ExpenseReport] {ex:approves}

### Executive Approver {=ex:ExecutiveApprover}
Authority: [3] {ex:authority ^^xsd:integer}
Approves: [BudgetRequest] {ex:approves}

### Regular Employee {=ex:RegularEmployee}
Authority: [0] {ex:authority ^^xsd:integer}
~~~~~~

**Expected Result:** 3 violations (EngineeringManager fails twice: level < 3 AND teamSize > 10; FinanceApprover fails: authority < 2; JuniorDeveloper and RegularEmployee not validated as they don't initiate the relationships)

---

## 📝 MDLD Syntax Patterns

Target subjects of targets all subjects that have a specific property pointing to any value.

~~~~~~md
**[Shape] targets subjects of [Property]** {=ex:ShapeName .sh:NodeShape label}

[Shape Name] {=ex:ShapeName .sh:NodeShape label} targets all subjects of [Property] {+ex:property ?sh:targetSubjectsOf} to validate requirements.
~~~~~~

**Key components:**
- **Shape declaration** - The shape being defined (`{=ex:ShapeName .sh:NodeShape label}`)
- **Target property** - The property to target subjects of (`{+ex:property ?sh:targetSubjectsOf}`)
- **Validation rules** - Property constraints within the shape
- **Subject-based selection** - Validates entities that initiate relationships

**Important notes:**
- Target subjects of validates entities that initiate relationships
- Ideal for management, approval, and source validation
- Works in reverse direction of the property
- Use for validating relationship sources
- Combine with other targeting mechanisms for complex scenarios

---

## 🎯 Use Cases

- **Management validation** - Validate managers who manage teams
- **Approval validation** - Validate approvers who approve requests
- **Source validation** - Validate entities that initiate relationships
- **Reverse relationship targeting** - Target based on outgoing relationships
- **Business rules** - Enforce rules on relationship initiators

---

## 🔧 Implementation Guidelines

**When to use target subjects of:**
- **Management validation** - When validating managers or supervisors
- **Approval validation** - When validating approvers or authorizers
- **Source validation** - When validating relationship sources
- **Reverse targeting** - When targeting based on outgoing relationships
- **Business rules** - When enforcing rules on relationship initiators

**Best practices:**
- Use descriptive property names for clarity
- Combine with target objects of for bidirectional validation
- Test with entities that do and don't have the property
- Document the relationship direction clearly
- Consider performance for large relationship graphs

**Common pitfalls:**
- ❌ Confusing target subjects of with target objects of
- ❌ Forgetting that it targets relationship sources, not destinations
- ❌ Not testing with entities that don't have the property
- ❌ Not considering the direction of the relationship
- ❌ Overusing when target class would be more appropriate






{=}



<a id="targeting-targetobjectsof"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>


# Target Objects Of {=sh:targetObjectsOf .class:TargetingMechanism label}

> Targets all objects (values) that are pointed to by a specific property. Ideal for validating referenced entities, relationship targets, and entities that are the destination of relationships. {comment}

<http://www.w3.org/ns/shacl#targetObjectsOf> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The targetObjectsOf constraint targets all objects (nodes) that are referenced by a specific property. This example demonstrates team membership and product reference scenarios where we validate entities that are referenced by others.

~~~~~~md
[ex] <mdld:shacl/example/targeting/>

## Team Membership Demo

The **Team Member Validation Shape** {=ex:TeamMemberValidationShape .sh:NodeShape label} targets all [team members] {+ex:memberOf ?sh:targetObjectsOf} to validate team membership requirements: [workload] {+#workloadRule ?sh:property sh:name} and [status] {+#activeStatus ?sh:property sh:name}.

**Team members must not exceed 40 hours workload** {=#workloadRule .sh:PropertyShape sh:message} requires the [workload] {+ex:workload ?sh:path} property to be at most [40] {sh:maxInclusive ^^xsd:integer}.

**Team members must be active** {=#activeStatus .sh:PropertyShape sh:message} that requires the [status] {+ex:status ?sh:path} property to be exactly [active] {sh:hasValue}.

## Product Reference Demo

**Referenced Product Validation Shape** {=ex:ReferencedProductValidationShape .sh:NodeShape label} targets all [referenced products] {+ex:references ?sh:targetObjectsOf} to validate product reference requirements: [availability] {+#productAvailability ?sh:property sh:name} and [price] {+#productPrice ?sh:property sh:name}.

**Referenced products must be available** {=#productAvailability .sh:PropertyShape sh:message} requires the [available] {+ex:available ?sh:path} property to be exactly [true] {sh:hasValue}.

**Referenced products must cost $1000 or less** {=#productPrice .sh:PropertyShape sh:message} that requires the [price] {+ex:price ?sh:path} property to be at most [1000.00] {sh:maxInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### EngineeringTeam {=ex:EngineeringTeam}
Workload: [45] {ex:workload ^^xsd:integer}
Status: [inactive] {ex:status}

### QATeam {=ex:QATeam}
Workload: [35] {ex:workload ^^xsd:integer}
Status: [active] {ex:status}

### Senior Developer {=ex:SeniorDeveloper}
Member Of: [Engineering team] {+ex:EngineeringTeam ?ex:memberOf}

### Junior Developer {=ex:JuniorDeveloper}
Member Of: [QATeam] {+ex:QATeam ?ex:memberOf}

### Expensive Product {=ex:ExpensiveProduct}
Price: [1500.00] {ex:price ^^xsd:decimal}
Available: [false] {ex:available}

### Affordable Product {=ex:AffordableProduct}
Price: [299.99] {ex:price ^^xsd:decimal}
Available: [true] {ex:available}

### Order123 {=ex:Order123}
References: [Expensive product] {+ex:ExpensiveProduct ?ex:references}

### Order456 {=ex:Order456}
References: [Affordable product] {+ex:AffordableProduct ?ex:references}
~~~~~~

**Expected Result:** 4 violations (EngineeringTeam fails twice: workload > 40 AND status inactive; ExpensiveProduct fails twice: price > 1000 AND unavailable; QATeam and AffordableProduct pass; developers and orders not validated as they're subjects, not objects)

---

## 📝 MDLD Syntax Patterns

Target objects of targets all objects that are pointed to by a specific property.

~~~~~~md
**[Shape] targets objects of [Property]** {=ex:ShapeName .sh:NodeShape label}

[Shape Name] {=ex:ShapeName .sh:NodeShape label} targets all objects of [Property] {+ex:property ?sh:targetObjectsOf} to validate requirements.
~~~~~~

**Key components:**
- **Shape declaration** - The shape being defined (`{=ex:ShapeName .sh:NodeShape label}`)
- **Target property** - The property to target objects of (`{+ex:property ?sh:targetObjectsOf}`)
- **Validation rules** - Property constraints within the shape
- **Object-based selection** - Validates entities that are referenced by others

**Important notes:**
- Target objects of validates entities that are referenced by others
- Ideal for team membership, product references, and destination validation
- Works in forward direction of the property
- Use for validating relationship destinations
- Combine with other targeting mechanisms for complex scenarios

---

## 🎯 Use Cases

- **Team membership validation** - Validate team members referenced by teams
- **Product reference validation** - Validate products referenced by orders
- **Destination validation** - Validate entities that are relationship targets
- **Referenced entity validation** - Validate entities referenced by others
- **Business rules** - Enforce rules on relationship destinations

---

## 🔧 Implementation Guidelines

**When to use target objects of:**
- **Team membership** - When validating team members
- **Product references** - When validating referenced products
- **Destination validation** - When validating relationship targets
- **Referenced entities** - When validating entities referenced by others
- **Business rules** - When enforcing rules on relationship destinations

**Best practices:**
- Use descriptive property names for clarity
- Combine with target subjects of for bidirectional validation
- Test with entities that do and don't have the property
- Document the relationship direction clearly
- Consider performance for large relationship graphs

**Common pitfalls:**
- ❌ Confusing target objects of with target subjects of
- ❌ Forgetting that it targets relationship destinations, not sources
- ❌ Not testing with entities that don't have the property
- ❌ Not considering the direction of the relationship
- ❌ Overusing when target class would be more appropriate






{=}



<a id="syntax-reference"></a>

## 📝 MDLD Syntax Reference

**Authors should refer to MDLD Spec and few-shot examples for complete syntax documentation. Key patterns:**

| Symbol | Meaning | Example |
|--------|---------|---------|
| `{=}` | Subject declaration (persists) | `{=ex:shape .sh:NodeShape}` |
| `{+}` | Object introduction (temporary for ?/! predicates) | `{+ex:target ?sh:targetClass}` |
| `?` | Object predicate (Subject → Object) | `?sh:targetClass`, `?sh:targetNode` |
| `!` | Reverse predicate (Object → Subject) | `!member` |
| `.` | Class type declaration | `.sh:NodeShape` |
| `^^` | Literal datatype | `^^xsd:integer` |
| `{}` | Subject reset (clears current subject) | `{=}` |

**Test data pattern:**
~~~~~~md
[Label] {+ex:instanceID ?ex:propertyName .ex:ClassName}
~~~~~~

**For detailed syntax, see:**
- MDLD Spec: `/Users/davay/Documents/DeFUCC/MDLD/mdld-parse/spec/Spec.md`
- Few-shot examples: `/Users/davay/Documents/DeFUCC/MDLD/mdld-parse/examples/few-shot.md`






{=}



<a id="constraints-index"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

### 📋 Constraint {=class:Constraint ?member .Class label}

> A SHACL constraint is a rule that defines a validation condition for a specific shape and target node. {comment}

We can broadly divide them into these type groups: 
- Metadata Predicate {+class:MetadataPredicate !subClassOf label}
- Targeting Predicate {+class:TargetingPredicate !subClassOf label}
- Value Type Constraint {+class:ValueTypeConstraint !subClassOf label}
- Cardinality Constraint {+class:CardinalityConstraint !subClassOf label}
- String-based Constraint {+class:StringConstraint !subClassOf label}
- Property Pair Constraint {+class:PropertyPairConstraint !subClassOf label}
- Logical Constraint {+class:LogicalConstraint !subClassOf label}
- Shape-based Constraint {+class:ShapeConstraint !subClassOf label}
- Property Path {+class:PropertyPath !subClassOf label}
- JavaScript Constraint {+class:JSConstraint !subClassOf label}
- SPARQL Constraint {+class:SPARQLConstraint !subClassOf label}

---

[Syntax Reference](#syntax-reference)

---

# Catalog {=cat:index}

This catalog includes these constraints: 

## Value Type Constraints

- [Class](#constraints-class) {+sh:class ?cat:includes .class:ValueTypeConstraint}
- [Data Type](#constraints-datatype) {+sh:datatype ?cat:includes .class:ValueTypeConstraint}
- [Node Kind](#constraints-nodekind) {+sh:nodeKind ?cat:includes .class:ValueTypeConstraint}

## Cardinality Constraints

- [Min Count](#constraints-count) {+sh:minCount ?cat:includes .class:CardinalityConstraint}
- [Max Count](#constraints-count) {+sh:maxCount ?cat:includes .class:CardinalityConstraint}

## Value Range Constraints

- [Min Inclusive](#constraints-range) {+sh:minInclusive ?cat:includes .class:ValueRangeConstraint}
- [Max Inclusive](#constraints-range) {+sh:maxInclusive ?cat:includes .class:ValueRangeConstraint}
- [Min Exclusive](#constraints-range) {+sh:minExclusive ?cat:includes .class:ValueRangeConstraint}
- [Max Exclusive](#constraints-range) {+sh:maxExclusive ?cat:includes .class:ValueRangeConstraint}

## Property Pair Constraints

- [Equals](#constraints-comparison) {+sh:equals ?cat:includes .class:PropertyPairConstraint}
- [Disjoint](#constraints-disjoint) {+sh:disjoint ?cat:includes .class:PropertyPairConstraint}
- [Less Than](#constraints-comparison) {+sh:lessThan ?cat:includes .class:PropertyPairConstraint}
- [Less Than or Equals](#constraints-comparison) {+sh:lessThanOrEquals ?cat:includes .class:PropertyPairConstraint}

## Logical Constraints

- [NOT](#constraints-not) {+sh:not ?cat:includes .class:LogicalConstraint}
- [AND](#constraints-and) {+sh:and ?cat:includes .class:LogicalConstraint}
- [OR](#constraints-or) {+sh:or ?cat:includes .class:LogicalConstraint}
- [XONE](#constraints-xone) {+sh:xone ?cat:includes .class:LogicalConstraint}

## String Constraints

- [Minimum Length](#constraints-length) {+sh:minLength ?cat:includes .class:StringConstraint}
- [Maximum Length](#constraints-length) {+sh:maxLength ?cat:includes .class:StringConstraint}
- [Pattern](#constraints-pattern) {+sh:pattern ?cat:includes .class:StringConstraint}
- [Pattern Flags](#constraints-pattern) {+sh:flags ?cat:includes .class:StringConstraint}
- [Language In](#constraints-language) {+sh:languageIn ?cat:includes .class:StringConstraint}
- [Unique Languages](#constraints-uniquelang) {+sh:uniqueLang ?cat:includes .class:StringConstraint}

## Other Constraints

- [Has Value](#constraints-hasvalue) {+sh:hasValue ?cat:includes}
- [Entity type](#constraints-node) {+sh:node ?cat:includes .class:ShapeConstraint}
- [Value enumeration](#constraints-in) {+sh:in ?cat:includes}
- [Qualified Min Count](#constraints-qualifiedcount) {+sh:qualifiedMinCount ?cat:includes}
- [Qualified Max Count](#constraints-qualifiedcount) {+sh:qualifiedMaxCount ?cat:includes}
- [Closed world](#constraints-closed) {+sh:closed ?cat:includes .class:MetadataPredicate}
- [Deactivation flag](#constraints-deactivated) {+sh:deactivated ?cat:includes .class:MetadataPredicate}
- [Severity levels](#constraints-severity) {+sh:severity ?cat:includes .class:MetadataPredicate}
- [Violation message](#constraints-message) {+sh:message ?cat:includes .class:MetadataPredicate}

Some parts are still completely uncovered and don't work even on ttl or pure quads - something might be wrong in the validator or in examples we use in tests, need deeper investigation:

- Ignored Properties {+sh:ignoredProperties ?cat:includes .class:MetadataPredicate .cat:notCovered}

## JavaScript Constraints

- [JavaScript Function](#constraints-js) {+sh:js ?cat:includes .class:JSConstraint}
- JS Function Name {+sh:jsFunctionName ?cat:includes .class:JSConstraint .cat:notCovered}
- JS Library {+sh:jsLibrary ?cat:includes .class:JSConstraint .cat:notCovered}
- JS Library URL {+sh:jsLibraryURL ?cat:includes .class:JSConstraint .cat:notCovered}

## SPARQL Constraints

- SPARQL ASK Query {+sh:ask ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- SPARQL SELECT Query {+sh:select ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- SPARQL CONSTRUCT Query {+sh:construct ?cat:includes .class:SPARQLConstraint .cat:notCovered}
- SPARQL UPDATE Query {+sh:update ?cat:includes .class:SPARQLConstraint .cat:notCovered}



## Property Path Constraints

Need to check if these are working:

- Qualified Value Shape {+sh:qualifiedValueShape ?cat:includes .class:ShapeConstraint .cat:notCovered}
- Qualified Value Shapes Disjoint {+sh:qualifiedValueShapesDisjoint ?cat:includes .class:ShapeConstraint .cat:notCovered}
- Inverse Path {+sh:inversePath ?cat:includes .class:PropertyPath .cat:notCovered}
- Alternative Path {+sh:alternativePath ?cat:includes .class:PropertyPath .cat:notCovered}
- Zero or More Path {+sh:zeroOrMorePath ?cat:includes .class:PropertyPath .cat:notCovered}
- One or More Path {+sh:oneOrMorePath ?cat:includes .class:PropertyPath .cat:notCovered}
- Zero or One Path {+sh:zeroOrOnePath ?cat:includes .class:PropertyPath .cat:notCovered}

---

## Some constraints are environment dependent, are not tested to be working and are [Not covered] {=cat:notCovered .Class label} by this calalog.






{=}



<a id="constraints-class"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Class {=sh:class .class:Constraint label}

> Expects each value to be an instance of a specific class (RDF type) {comment}

<http://www.w3.org/ns/shacl#class> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The class constraint ensures property values are instances of a specific RDF class. This example validates that employee managers must be Person instances.

~~~~~~md
[ex] <tag:my@example.org,2026:class/>

## Employee Test Shape {=ex:EmployeeTestShape .sh:NodeShape  label}

All [employees] {+member ?sh:targetObjectsOf} must have **manager** {+#managerClass ?sh:property sh:name} class assigned.

**Manager must be a Person instance** {=#managerClass .sh:PropertyShape sh:message} requires the [manager] {+ex:manager ?sh:path} property to be an instance of a [Person] {+ex:Person ?sh:class}.

---

## Test Data {=ex:data .Container}

### Valid Employee {=ex:ValidEmployee ?member}
Manager: [john] {+ex:john ?ex:manager .ex:Person}

### Invalid Employee {=ex:InvalidEmployee ?member}
Manager: [robot] {+ex:robot ?ex:manager ex:Role}
~~~~~~

**Expected Result:** 1 violation (InvalidEmployee fails because manager is not a Person)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be an instance of [Class] {+ex:Class ?sh:class}
~~~~~~

**Use for:** Type safety, referential integrity, data quality

**Important:**
- Works with IRI values only (use nodeKind for literals)
- Class must be defined in ontology
- Combine with minCount for required properties

---

## 🔧 Implementation Guidelines

**When to use:** Ensure property values have correct RDF types

**Best practices:**
- Define classes in ontology first
- Use descriptive class names
- Combine with minCount for required properties

**Common pitfalls:**
- ❌ Using on literal values (use nodeKind instead)
- ❌ Forgetting to define the class
- ❌ Not combining with minCount for required properties






{=}



<a id="constraints-datatype"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Data Type {=sh:datatype .class:Constraint label}

> Expects a literal value to have certain datatype {comment}

<http://www.w3.org/ns/shacl#datatype> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The datatype constraint ensures literal values have the correct datatype. This example validates that product prices must be decimal values.

~~~~~~md
[ex] <tag:my@example.org,2026:datatype/>

## Product Test Shape {=ex:ProductTestShape .sh:NodeShape sh:name}

Validates [Valid Product] {+ex:ValidProduct ?sh:targetNode} and [Invalid Product] {+ex:InvalidProduct ?sh:targetNode} with **price** {+#priceDecimal ?sh:property sh:name}.

**Price must be decimal** {=#priceDecimal .sh:PropertyShape sh:message} requires the [price] {+ex:price ?sh:path} property to be a [decimal] {+xsd:decimal ?sh:datatype} value.

---

## Test Data {=ex:data .Container}

### Valid Product {=ex:ValidProduct ?member}
Price: [29.99] {ex:price ^^xsd:decimal}

### Invalid Product {=ex:InvalidProduct ?member}
Price: [29.99] {ex:price ^^xsd:string}
~~~~~~

**Expected Result:** 1 violation (InvalidProduct fails because price is string, not decimal)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be a [Datatype] {+xsd:datatype ?sh:datatype} value.
~~~~~~

**Use for:** Type safety, data quality, calculations

**Important:**
- Works with literal values only (use nodeKind for IRIs)
- Common datatypes: xsd:string, xsd:integer, xsd:decimal, xsd:boolean, xsd:date
- Combine with minCount for required properties

---

## 🔧 Implementation Guidelines

**When to use:** Ensure literal values have correct datatypes

**Best practices:**
- Use appropriate datatypes (decimal for money, integer for counts)
- Combine with minCount for required properties

**Common pitfalls:**
- ❌ Using on IRI values (use nodeKind instead)
- ❌ Forgetting to specify the datatype prefix
- ❌ Not combining with minCount for required properties






{=}



<a id="constraints-nodekind"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Node Kind {=sh:nodeKind .class:Constraint label}

> Expects a node to be of a specific kind (blank node, IRI, or literal) {comment}

<http://www.w3.org/ns/shacl#nodeKind> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The nodeKind constraint expects a node to be of a specific kind (blank node, IRI, or literal). This example validates that content must be literal and references must be IRIs.

~~~~~~md
[ex] <tag:my@example.org,2026:nodekind/>

## Document Test Shape {=ex:DocumentTestShape .sh:NodeShape  label}

Validates [Valid Document] {+ex:ValidDocument ?sh:targetNode} and [Invalid Document] {+ex:InvalidDocument ?sh:targetNode} with literal **content** {+#contentLiteral ?sh:property sh:name} and IRI for **reference** {+#referenceIRI ?sh:property sh:name}.

**Content must be literal** {=#contentLiteral .sh:PropertyShape sh:message} requires [content] {+ex:content ?sh:path} to be a [Literal] {+sh:Literal ?sh:nodeKind}.

**Reference must be IRI** {=#referenceIRI .sh:PropertyShape sh:message} requires [reference] {+ex:reference ?sh:path} to be an [IRI] {+sh:IRI ?sh:nodeKind}.

---

## Test Data {=ex:data .Container}

### Valid Document {=ex:ValidDocument ?member}
Content: [text] {ex:content}
Reference: <https://example.org> {?ex:reference}

### Invalid Document {=ex:InvalidDocument ?member}
Content: <https://example.org> {?ex:content}
Reference: [text] {ex:reference}
~~~~~~

**Expected Result:** 2 violations (InvalidDocument fails twice: content is IRI not literal, reference is text not IRI)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be a [NodeKind] {+sh:NodeKind ?sh:nodeKind}.
~~~~~~

**Use for:** Type safety, IRI vs literal validation

**Important:**
- MDLD doesn't produce blank nodes (focus on IRI/Literal)
- IRI values use `<URL> {?property}` syntax
- Literal values use `[text] {property}` syntax
- Use datatype constraint for literal types, class for IRI types

---

## 🔧 Implementation Guidelines

**When to use:** Ensure references are IRIs, content is literal

**Best practices:**
- Use correct syntax for IRI vs literal
- Combine with datatype for literal types, class for IRI types

**Common pitfalls:**
- ❌ Wrong syntax for IRI vs literal
- ❌ Confusing with datatype (nodeKind for IRI/Literal, datatype for literal types)






{=}



<a id="constraints-count"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Min Count {=sh:minCount .class:Constraint label}

> Specifies the minimum number of values a property must have {comment}

<http://www.w3.org/ns/shacl#minCount> {?cat:fullIRI}

# Max Count {=sh:maxCount .class:Constraint label}

> Specifies the maximum number of values a property can have {comment}

<http://www.w3.org/ns/shacl#maxCount> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

Count constraints specify the minimum and maximum number of values a property must have. This example validates that email must be exactly one value.

~~~~~~md
[ex] <tag:my@example.org,2026:count/>

## Person Test Shape {=ex:PersonTestShape .sh:NodeShape  sh:name}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **email** {+#emailExact ?sh:property sh:name}.

**Email must be exactly one** {=#emailExact .sh:PropertyShape sh:message} requires [email] {+ex:email ?sh:path} to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

---

## Test Data {=ex:data .Container}

### Valid Person {=ex:ValidPerson ?member}
Email: [work@example.com] {ex:email}

### Invalid Person {=ex:InvalidPerson ?member}
Email: [work@example.com] {ex:email}
Email: [personal@example.com] {ex:email}
~~~~~~

**Expected Result:** 1 violation (InvalidPerson fails because it has two emails instead of one)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must have at least [min] {sh:minCount ^^xsd:integer} and at most [max] {sh:maxCount ^^xsd:integer} values.
~~~~~~

**Use for:** Required properties, single-valued properties, multi-valued limits

**Important:**
- Use minCount alone for "at least X values"
- Use maxCount alone for "at most X values"
- Use both with same value for "exactly X values"
- Empty properties fail minCount validation

---

## 🔧 Implementation Guidelines

**When to use:** Ensure property has correct number of values

**Best practices:**
- Use minCount: 1 for required properties
- Use both minCount and maxCount: 1 for single-valued properties

**Common pitfalls:**
- ❌ Forgetting to specify the datatype ^^xsd:integer
- ❌ Using negative values for counts
- ❌ Confusing minCount with maxCount






{=}



<a id="constraints-range"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Minimum Inclusive {=sh:minInclusive .class:Constraint label}

> Specifies the minimum inclusive value for range constraints {comment}

<http://www.w3.org/ns/shacl#minInclusive> {?cat:fullIRI}

# Maximum Inclusive {=sh:maxInclusive .class:Constraint label}

> Specifies the maximum inclusive value for range constraints {comment}

<http://www.w3.org/ns/shacl#maxInclusive> {?cat:fullIRI}

# Minimum Exclusive {=sh:minExclusive .class:Constraint label}

> Specifies the minimum exclusive value for range constraints {comment}

<http://www.w3.org/ns/shacl#minExclusive> {?cat:fullIRI}

# Maximum Exclusive {=sh:maxExclusive .class:Constraint label}

> Specifies the maximum exclusive value for range constraints {comment}

<http://www.w3.org/ns/shacl#maxExclusive> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

Range constraints specify minimum and maximum values for numeric or date properties. This example validates that product prices must be between 10 and 100 inclusive.

~~~~~~md
[ex] <tag:my@example.org,2026:range/>

## Product Test Shape {=ex:ProductTestShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with conforming **price** {+#priceRange ?sh:property}.

**Price must be between 10 and 100 inclusive** {=#priceRange .sh:PropertyShape sh:message} requires [price] {+ex:price ?sh:path} to be at least [10] {sh:minInclusive ^^xsd:decimal} and at most [100] {sh:maxInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### Valid Product {=ex:ValidProduct ?member}
Price: [50] {ex:price ^^xsd:decimal}

### Invalid Product {=ex:InvalidProduct ?member}
Price: [5] {ex:price ^^xsd:decimal}
~~~~~~

**Expected Result:** 1 violation (InvalidProduct fails because price is 5, below the minimum of 10)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be at least [min] {sh:minInclusive ^^xsd:datatype} and at most [max] {sh:maxInclusive ^^xsd:datatype}.
~~~~~~

**Use for:** Price validation, age restrictions, date validation, numeric ranges

**Important:**
- Works with ordered datatypes (numbers, dates, times)
- Inclusive bounds include boundary values
- Exclusive bounds exclude boundary values
- Use minInclusive for "at least X", maxInclusive for "at most X"

---

## 🔧 Implementation Guidelines

**When to use:** Values must be within numeric or date bounds

**Best practices:**
- Use inclusive bounds for "at least/at most"
- Use exclusive bounds for "greater than/less than"
- Test with boundary values

**Common pitfalls:**
- ❌ Using wrong inclusive/exclusive bound
- ❌ Forgetting to specify the datatype
- ❌ Confusing inclusive with exclusive bounds






{=}



<a id="constraints-comparison"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Comparison Constraints {=sh:lessThan .class:ComparisonConstraint label}

> Validates property values against reference nodes using comparison operators {comment}

<http://www.w3.org/ns/shacl#lessThan> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#lessThanOrEquals> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#equals> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

Comparison constraints validate property values against reference nodes using comparison operators. This example validates that order dates must be before shipping dates.

~~~~~~md
[ex] <tag:my@example.org,2026:comparison/>

## Order Test Shape {=ex:OrderTestShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **order date before shipping date** {+#orderDateRule ?sh:property sh:name}.

**Order date must be before shipping date** {=#orderDateRule .sh:PropertyShape sh:message} requires [order date] {+ex:orderDate ?sh:path} to be before [shipping date] {+ex:shippingDate ?sh:lessThan}.

---

## Test Data {=ex:data .Container}

### Valid Order {=ex:ValidOrder ?member}
Order Date: [2024-06-15] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}

### Invalid Order {=ex:InvalidOrder ?member}
Order Date: [2024-06-25] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}
~~~~~~

**Expected Result:** 1 violation (InvalidOrder fails because order date is after shipping date)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be [operator] {sh:lessThan} [Reference] {+ex:reference ?sh:lessThan}.
~~~~~~

**Use for:** Date validation, version control, business rules, ordering constraints

**Important:**
- Works with comparable values (dates, numbers, strings)
- Compares values within the same node
- Use lessThan for strict ordering, lessThanOrEquals for inclusive, equals for exact matching
- Both properties must be present

---

## 🔧 Implementation Guidelines

**When to use:** Enforce ordering constraints between properties

**Best practices:**
- Ensure compatible datatypes
- Test with boundary values

**Common pitfalls:**
- ❌ Comparing incompatible datatypes
- ❌ Forgetting both properties must be present
- ❌ Using wrong comparison operator






{=}



<a id="constraints-disjoint"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Disjoint {=sh:disjoint .class:DisjointConstraint label}

> Ensures that values of a property are disjoint with values of another property {comment}

<http://www.w3.org/ns/shacl#disjoint> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The disjoint constraint ensures that values of a property are disjoint with values of another property. This example validates that preferred labels must be different from alternative labels.

~~~~~~md
[ex] <tag:my@example.org,2026:disjoint/>

## Label Test Shape {=ex:DisjointExampleShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **disjoint labels** {+#disjointRule ?sh:property sh:name}.

**Preferred labels must be different from alternative labels** {=#disjointRule .sh:PropertyShape sh:message} requires [preferred labels] {+ex:prefLabel ?sh:path} to be disjoint with [alternative labels] {+ex:altLabel ?sh:disjoint}.

---

## Test Data {=ex:data .Container}

### Valid Case {=ex:USA ?member}
Preferred Label: [USA] {ex:prefLabel}
Alternative Label: [United States] {ex:altLabel}

### Invalid Case {=ex:Germany ?member}
Preferred Label: [Germany] {ex:prefLabel}
Alternative Label: [Germany] {ex:altLabel}
~~~~~~

**Expected Result:** 1 violation (Germany fails because preferred and alternative labels are the same)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be [disjoint] {+ex:otherProperty ?sh:disjoint} with [Other Property].
~~~~~~

**Use for:** Label validation, category separation, mutually exclusive attributes

**Important:**
- Prevents any value from appearing in both properties
- Works with both literal values and IRIs
- Both properties must be present

---

## 🔧 Implementation Guidelines

**When to use:** Properties must not share values

**Best practices:**
- Use for mutually exclusive properties
- Test with overlapping and non-overlapping values

**Common pitfalls:**
- ❌ Using disjoint when properties should be related
- ❌ Forgetting both properties must be present






{=}



<a id="constraints-not"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# NOT Constraint {=sh:not .class:LogicalConstraint label}

> Requires value nodes to NOT conform to a given shape {comment}

<http://www.w3.org/ns/shacl#not> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The NOT constraint requires value nodes to NOT conform to a given shape. This example validates that users cannot have a deleted status.

~~~~~~md
[ex] <tag:my@example.org,2026:not/>

## User Status Shape {=ex:UserStatusShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities to not conform to the forbidden **shape** {+ex:ForbiddenStatusShape ?sh:not}.

**Forbidden Status Shape** {=ex:ForbiddenStatusShape .sh:NodeShape} requires [status] {+ex:status ?sh:path} to be exactly [deleted] {sh:hasValue}.

---

## Test Data {=ex:data .Container}

### Valid User {=ex:ValidActiveUser ?member}
Status: [active] {ex:status}

### Invalid User {=ex:InvalidDeletedUser ?member}
Status: [deleted] {ex:status}
~~~~~~

**Expected Result:** 1 violation (InvalidDeletedUser fails because status is deleted, which conforms to the forbidden shape)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Shape] {=ex:Shape .sh:NodeShape} must not conform to [Forbidden Shape] {+ex:ForbiddenShape ?sh:not}.
~~~~~~

**Use for:** Forbidden values, exclusion patterns, business rule negation

**Important:**
- Forbidden shape defines pattern to reject
- Nodes not matching forbidden shape pass automatically
- Can be used with PropertyShape and NodeShape

---

## 🔧 Implementation Guidelines

**When to use:** Certain values must be explicitly prohibited

**Best practices:**
- Keep forbidden shapes simple
- Use descriptive names for forbidden shapes

**Common pitfalls:**
- ❌ Creating circular dependencies
- ❌ Making forbidden shapes too complex






{=}



<a id="constraints-and"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# AND Constraint {=sh:and .class:LogicalConstraint label}

> Requires all constraints in the list to be satisfied {comment}

<http://www.w3.org/ns/shacl#and> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The AND constraint requires all specified constraints to be satisfied. This example validates that products must have both a price and a category.

~~~~~~md
[ex] <tag:my@example.org,2026:and/>

## Product Validation Shape {=ex:ProductValidationShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **Product must have price and category** {sh:message}.

**Constraints List** {=ex:and-l1 ?sh:and .rdf:List}: [Price Required] {+ex:priceRequired ?rdf:first}, then [followed] {=ex:and-l2 ?rdf:rest} by [Category Required] {+ex:categoryRequired ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}

**Price Required** {=ex:priceRequired .sh:PropertyShape} ensures [price] {+ex:price ?sh:path} has at least [1] {sh:minCount ^^xsd:integer} value.

**Category Required** {=ex:categoryRequired .sh:PropertyShape} ensures [category] {+ex:category ?sh:path} has at least [1] {sh:minCount ^^xsd:integer} value.

---

## Test Data {=ex:data .Container}

### Valid Product {=ex:ValidProduct ?member}
Price: [999] {ex:price ^^xsd:integer}
Category: [Electronics] {ex:category}

### Invalid Product {=ex:MissingPriceProduct ?member}
Category: [Electronics] {ex:category}
~~~~~~

**Expected Result:** 1 violation (MissingPriceProduct fails because it lacks price)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Constraints List] {=ex:and-l1 ?sh:and .rdf:List}: [First] {+ex:first ?rdf:first}, then [rest] {=ex:and-l2 ?rdf:rest} by [Second] {+ex:second ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}
~~~~~~

**Use for:** Multi-property validation, cross-field validation, business rule combinations

**Important:**
- Uses RDF list syntax (rdf:first, rdf:rest, rdf:nil)
- All constraints in list must be satisfied
- Use unique list identifiers (and-l1, and-l2)
- Always reset subject with {=} after list definition

---

## 🔧 Implementation Guidelines

**When to use:** Multiple conditions must all pass

**Best practices:**
- Keep list short (2-3 constraints)
- Test each constraint individually first

**Common pitfalls:**
- ❌ Forgetting subject reset {=} after list
- ❌ Reusing list identifiers causing collisions






{=}



<a id="constraints-or"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# OR Constraint {=sh:or .class:LogicalConstraint label}

> Requires at least one constraint in the list to be satisfied {comment}

<http://www.w3.org/ns/shacl#or> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The OR constraint requires at least one of the specified constraints to be satisfied. This example validates that a contact must be either an email (contains @) or a phone number (contains -).

~~~~~~md
[ex] <tag:my@example.org,2026:or/>

## Contact Validation Shape {=ex:ContactValidationShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **Contact must be email or phone** {sh:message}.

**Options List** {=ex:or-l1 ?sh:or .rdf:List}: [Email Contact] {+ex:emailContact ?rdf:first}, then [followed] {=ex:or-l2 ?rdf:rest} by [Phone Contact] {+ex:phoneContact ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}

**Email Contact** {=ex:emailContact .sh:PropertyShape} ensures [contact] {+ex:contact ?sh:path} contains [@] {sh:pattern}.

**Phone Contact** {=ex:phoneContact .sh:PropertyShape} ensures [contact] {+ex:contact ?sh:path} contains [-] {sh:pattern}.

---

## Test Data {=ex:data .Container}

### Valid Email Contact {=ex:ValidEmail ?member}
Contact: [user@example.com] {ex:contact}

### Valid Phone Contact {=ex:ValidPhone ?member}
Contact: [555-123-4567] {ex:contact}

### Invalid Contact {=ex:InvalidContact ?member}
Contact: [invalid] {ex:contact}
~~~~~~

**Expected Result:** 1 violation (InvalidContact fails because it matches neither email nor phone pattern)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Options List] {=ex:or-l1 ?sh:or .rdf:List}: [First] {+ex:first ?rdf:first}, then [rest] {=ex:or-l2 ?rdf:rest} by [Second] {+ex:second ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}
~~~~~~

**Use for:** Alternative value formats, optional properties, multiple valid patterns

**Important:**
- Uses RDF list syntax (rdf:first, rdf:rest, rdf:nil)
- At least one constraint in list must be satisfied
- Use unique list identifiers (or-l1, or-l2)
- Always reset subject with {=} after list definition

---

## 🔧 Implementation Guidelines

**When to use:** Multiple valid alternatives exist

**Best practices:**
- Keep list short (2-3 alternatives)
- Test each alternative individually first
- Ensure alternatives are mutually exclusive when appropriate

**Common pitfalls:**
- ❌ Forgetting subject reset {=} after list
- ❌ Reusing list identifiers causing collisions
- ❌ Overlapping alternatives causing ambiguity






{=}



<a id="constraints-xone"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# XONE Constraint {=sh:xone .class:LogicalConstraint label}

> Requires exactly one constraint in the list to be satisfied (exclusive OR) {comment}

<http://www.w3.org/ns/shacl#xone> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The XONE constraint requires exactly one of the specified constraints to be satisfied. This example validates that a role must be exactly one type (admin or user), not both and not neither.

~~~~~~md
[ex] <tag:my@example.org,2026:xone/>

## Role Validation Shape {=ex:RoleValidationShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **Role must be exactly one type** {sh:message}.

**Options List** {=ex:xone-l1 ?sh:xone .rdf:List}: [Admin Role] {+ex:adminRole ?rdf:first}, then [followed] {=ex:xone-l2 ?rdf:rest} by [User Role] {+ex:userRole ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}

**Admin Role** {=ex:adminRole .sh:PropertyShape} ensures [role] {+ex:role ?sh:path} is exactly [admin] {sh:hasValue}.

**User Role** {=ex:userRole .sh:PropertyShape} ensures [role] {+ex:role ?sh:path} is exactly [user] {sh:hasValue}.

---

## Test Data {=ex:data .Container}

### Valid Admin {=ex:ValidAdmin ?member}
Role: [admin] {ex:role}

### Valid User {=ex:ValidUser ?member}
Role: [user] {ex:role}

### Invalid - No Role {=ex:NoRole ?member}
Role: [guest] {ex:role}
~~~~~~

**Expected Result:** 1 violation (NoRole fails because it matches neither admin nor user)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Options List] {=ex:xone-l1 ?sh:xone .rdf:List}: [First] {+ex:first ?rdf:first}, then [rest] {=ex:xone-l2 ?rdf:rest} by [Second] {+ex:second ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}
~~~~~~

**Use for:** Mutually exclusive options, single-choice validation, exclusive categories

**Important:**
- Uses RDF list syntax (rdf:first, rdf:rest, rdf:nil)
- Exactly one constraint in list must be satisfied
- Use unique list identifiers (xone-l1, xone-l2)
- Always reset subject with {=} after list definition

---

## 🔧 Implementation Guidelines

**When to use:** Mutually exclusive alternatives where exactly one must match

**Best practices:**
- Ensure alternatives are truly mutually exclusive
- Test each alternative individually first
- Consider edge cases (no match, multiple matches)

**Common pitfalls:**
- ❌ Forgetting subject reset {=} after list
- ❌ Reusing list identifiers causing collisions
- ❌ Overlapping alternatives causing ambiguous results






{=}



<a id="constraints-length"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Min Length {=sh:minLength .class:Constraint label}

> Specifies the minimum length of string values {comment}

<http://www.w3.org/ns/shacl#minLength> {?cat:fullIRI}

# Max Length {=sh:maxLength .class:Constraint label}

> Specifies the maximum length of string values {comment}

<http://www.w3.org/ns/shacl#maxLength> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

Length constraints specify the minimum and maximum length of string values. This example validates that usernames must be between 3 and 20 characters.

~~~~~~md
[ex] <tag:my@example.org,2026:length/>

## User Account Test Shape {=ex:UserAccountTestShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with correct length of the **username** {+#usernameLength ?sh:property sh:name}.

**Username must be 3-20 characters** {=#usernameLength .sh:PropertyShape sh:message} requires [username] {+ex:username ?sh:path} to have at least [3] {sh:minLength ^^xsd:integer} and at most [20] {sh:maxLength ^^xsd:integer} characters.

---

## Test Data {=ex:data .Container}

### Valid User {=ex:ValidUser ?member}
Username: [john_doe] {ex:username}

### Invalid User {=ex:InvalidUser ?member}
Username: [jd] {ex:username}
~~~~~~

**Expected Result:** 1 violation (InvalidUser fails because username is only 2 characters, below the minimum of 3)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must have at least [min] {sh:minLength ^^xsd:integer} and at most [max] {sh:maxLength ^^xsd:integer} characters.
~~~~~~

**Use for:** Username validation, password policies, content limits, form validation

**Important:**
- Works with literal string values only
- Length measured in characters, not bytes
- Empty strings have length 0

---

## 🔧 Implementation Guidelines

**When to use:** String length must be controlled

**Best practices:**
- Use reasonable length limits
- Test with boundary values

**Common pitfalls:**
- ❌ Forgetting datatype ^^xsd:integer
- ❌ Using negative values for lengths






{=}



<a id="constraints-pattern"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Pattern {=sh:pattern .class:PatternConstraint label}

> Validates string values against regular expression patterns {comment}

<http://www.w3.org/ns/shacl#pattern> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#flags> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The pattern constraint validates string values against regular expression patterns. This example validates that emails must end with example.com.

~~~~~~md
[ex] <tag:my@example.org,2026:pattern/>

## Email Validation Shape {=ex:PatternExampleShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with corporate **email** {+ex:EmailPatternConstraint ?sh:property sh:name}.

**Email must end with example.com** {=ex:EmailPatternConstraint .sh:PropertyShape sh:message} requires [email] {+ex:email ?sh:path} to match [example\.com$] {sh:pattern} with [i] {sh:flags}.

---

## Test Data {=ex:data .Container}

### Valid Email {=ex:ValidEmail ?member}
Email: [user@example.com] {ex:email}

### Invalid Email {=ex:InvalidEmail ?member}
Email: [user@example.org] {ex:email}
~~~~~~

**Expected Result:** 1 violation (InvalidEmail fails because it doesn't match the pattern - ends with .org not .com)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must match [regex pattern] {sh:pattern} with [flags] {sh:flags}.
~~~~~~

**Use for:** Email validation, phone number formatting, identifier patterns, URL validation

**Important:**
- Works with literal string values only
- Supports standard regex syntax
- Common flags: i (case-insensitive), m (multiline), s (dotall)
- Empty values automatically pass

---

## 🔧 Implementation Guidelines

**When to use:** Values must match specific format

**Best practices:**
- Use well-tested regex patterns
- Keep patterns simple
- Test with valid and invalid examples

**Common pitfalls:**
- ❌ Using overly complex regex
- ❌ Forgetting pattern only works with strings






{=}



<a id="constraints-language"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Language In {=sh:languageIn .class:StringConstraint label}

> Constrains string literals to have language tags from a specified list {comment}

<http://www.w3.org/ns/shacl#languageIn> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The languageIn constraint constrains string literals to have language tags from a specified list. This example validates that document titles must be in English or French.

~~~~~~md
[ex] <tag:my@example.org,2026:language/>

## Multilingual Document Shape {=ex:MultilingualDocumentShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with english or french **title** {+#titleLanguage ?sh:property sh:name}.

**Title language must be en or fr** {=#titleLanguage .sh:PropertyShape sh:message} requires [title] {+ex:title ?sh:path} language tags to be in the **Allowed Languages List** {=ex:lang-l1 ?sh:languageIn .rdf:List}: **en** {rdf:first},  [or] {=ex:lang-l2 ?rdf:rest} **fr** {rdf:first} - [only these 2 languages are allowed] {+rdf:nil ?rdf:rest}. {=}

---

## Test Data {=ex:data .Container}

### English Document {=ex:EnglishDocument ?member}
Title: [Hello World] {ex:title @en}

### Invalid Document {=ex:GermanDocument ?member}
Title: [Hallo Welt] {ex:title @de}
~~~~~~

**Expected Result:** 1 violation (GermanDocument fails because title language is de, not in the allowed list)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} language tags must be in allowed list.

**Allowed Languages List** {=ex:lang-l1 ?sh:languageIn .rdf:List}: [en] {rdf:first}, then [rest] {=ex:lang-l2 ?rdf:rest} by [fr] {rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}
~~~~~~

**Use for:** Multilingual content, regional compliance, content localization

**Important:**
- Uses RDF list syntax (rdf:first, rdf:rest, rdf:nil)
- Only validates language tags if they exist
- Use @lang syntax for language-tagged literals
- Use valid BCP 47 language codes (en, fr, de, etc.)

---

## 🔧 Implementation Guidelines

**When to use:** Content must be in specific languages

**Best practices:**
- Use valid BCP 47 language codes
- Keep language list short

**Common pitfalls:**
- ❌ Forgetting subject reset {=} after list
- ❌ Reusing list identifiers causing collisions






{=}



<a id="constraints-uniquelang"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Unique Languages {=sh:uniqueLang .class:UniqueLanguageConstraint label}

> Ensures that language tags of string literals are unique within a property {comment}

<http://www.w3.org/ns/shacl#uniqueLang> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The uniqueLang constraint ensures that language tags of string literals are unique within a property. This example validates that document titles cannot have duplicate language tags.

~~~~~~md
[ex] <tag:my@example.org,2026:uniqueLang/>

## Unique Language Example Shape {=ex:UniqueLangExampleShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with unique **language** {+ex:TitleProperty ?sh:property sh:name}.

**Each language tag must appear only once** {=ex:TitleProperty .sh:PropertyShape sh:message} requires [title] {+ex:title ?sh:path} values to have [true] {sh:uniqueLang ^^xsd:boolean}.

---

## Test Data {=ex:data .Container}

### Valid Document {=ex:ValidNode ?member}
Title: [Hello World] {ex:title @en}
Title: [Bonjour Monde] {ex:title @fr}

### Invalid Document {=ex:InvalidNode ?member}
Title: [Hello World] {ex:title @en}
Title: [Hola Mundo] {ex:title @en}
~~~~~~

**Expected Result:** 1 violation (InvalidDocument fails because it has duplicate @en language tags)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} values have [true] {sh:uniqueLang ^^xsd:boolean}.
~~~~~~

**Use for:** Multilingual content, translation management, content localization

**Important:**
- Only applies to language-tagged string literals
- Prevents duplicate language tags within same property
- Use @lang syntax for language-tagged literals

---

## 🔧 Implementation Guidelines

**When to use:** Prevent duplicate language entries

**Best practices:**
- Use with language-tagged string literals
- Combine with languageIn for complete validation

**Common pitfalls:**
- ❌ Using uniqueLang on non-language-tagged literals
- ❌ Forgetting to use @lang syntax






{=}



<a id="constraints-hasvalue"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Has Value {=sh:hasValue .class:Constraint label}

> Requires a property to have exactly this specific value {comment}

<http://www.w3.org/ns/shacl#hasValue> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The hasValue constraint requires a property to have exactly a specific value. This example validates that server status must be exactly "active".

~~~~~~md
[ex] <tag:my@example.org,2026:hasvalue/>

## System Status Test Shape {=ex:SystemStatusTestShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with active **status** {+#statusRequired ?sh:property sh:name}.

**Status must be active** {=#statusRequired .sh:PropertyShape sh:message} requires [status] {+ex:status ?sh:path} to be exactly [active] {sh:hasValue ^^xsd:string}.

---

## Test Data {=ex:data .Container}

### Valid Server {=ex:MainServer ?member}
Status: [active] {ex:status}

### Invalid Server {=ex:BackupServer ?member}
Status: [standby] {ex:status}
~~~~~~

**Expected Result:** 1 violation (BackupServer fails because status is standby, not active)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be exactly [Value] {sh:hasValue}.
~~~~~~

**Use for:** Fixed status fields, required constants, environment flags, system identifiers

**Important:**
- Requires exact match, no partial matches
- Works with both literal values and IRIs
- Property must have the value (use minCount for required properties)
- Often used with NOT constraint to forbid specific values

---

## 🔧 Implementation Guidelines

**When to use:** Property must have a specific constant value

**Best practices:**
- Use for fixed, unchanging values
- Combine with NOT to forbid specific values

**Common pitfalls:**
- ❌ Using hasValue for variable values
- ❌ Forgetting hasValue requires exact match
- ❌ Not combining with minCount for required properties






{=}



<a id="constraints-node"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Node {=sh:node .class:NodeConstraint label}

> Requires property values to conform to a specific node shape {comment}

<http://www.w3.org/ns/shacl#node> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The node constraint requires property values to conform to a specific node shape. This example validates that employee addresses must conform to an AddressShape with minimum street length.

~~~~~~md
[ex] <tag:my@example.org,2026:node/>

## Employee Validation Shape {=ex:EmployeeValidationShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities to have correct **address** {+#addressRule ?sh:property sh:name}.

**Employee must have valid address** {=#addressRule .sh:PropertyShape sh:message} requires [address] {+ex:address ?sh:path} to conform to [Address Shape] {+ex:AddressShape ?sh:node}.

**Address Shape** {=ex:AddressShape .sh:NodeShape} requires [street] {+ex:street ?sh:path} to have at least [5] {sh:minLength ^^xsd:integer} characters.

---

## Test Data {=ex:data .Container}

### Valid Employee {=ex:ValidEmployee ?member}
Address: [Valid Address] {=ex:ValidAddress .ex:Address ?ex:address}
Street: [Main Street] {ex:street}

### Invalid Employee {=ex:InvalidEmployee ?member}
Address: [Short Address] {=ex:ShortAddress .ex:Address ?ex:address}
Street: [St] {ex:street}
~~~~~~

**Expected Result:** 1 violation (InvalidEmployee fails because address doesn't conform to AddressShape - street is too short)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must conform to [Shape] {+ex:ShapeName ?sh:node}.
~~~~~~

**Use for:** Nested object validation, complex data models, structural integrity

**Important:**
- Only applies to node values (IRIs/blank nodes), not literal values
- Referenced shape must be defined in ontology
- Enables validation of complex nested objects

---

## 🔧 Implementation Guidelines

**When to use:** Property values are complex objects

**Best practices:**
- Define referenced shapes clearly
- Use descriptive shape names

**Common pitfalls:**
- ❌ Forgetting node only applies to nodes, not literals
- ❌ Not defining the referenced shape
- ❌ Confusing node with class constraint (node for structure, class for type)






{=}



<a id="constraints-in"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Value Enumeration {=sh:in .class:PresenceConstraint label}

> Constrains property values to be within a specified list of allowed values {comment}

<http://www.w3.org/ns/shacl#in> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The in constraint constrains property values to be within a specified list of allowed values. This example validates that status must be either "Active" or "Inactive".

~~~~~~md
[ex] <tag:my@example.org,2026:in/>

## Status Validation Shape {=ex:StatusValidationShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with correct **status** {+#allowedStatus ?sh:property sh:name}.

**Status must be Active or Inactive** {=#allowedStatus .sh:PropertyShape sh:message} requires [status] {+ex:status ?sh:path} to be in allowed list.

**Allowed Values List** {=ex:in-l1 ?sh:in .rdf:List}: **Active** {+ex:Active ?rdf:first} [or] {=ex:in-l2 ?rdf:rest} **Inactive** {+ex:Inactive ?rdf:first} - [only] {+rdf:nil ?rdf:rest} these 2 values are allowed.

---

## Test Data {=ex:data .Container}

### Valid Employee {=ex:ValidEmployee ?member}
Status: [Active] {+ex:Active ?ex:status}

### Invalid Employee {=ex:InvalidStatusEmployee ?member}
Status: [Pending] {+ex:Pending ?ex:status}
~~~~~~

**Expected Result:** 1 violation (InvalidStatusEmployee fails because status is Pending, not in the allowed list)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must be in allowed list.

**Allowed List** {=ex:in-l1 ?sh:in .rdf:List}: [First] {+ex:first ?rdf:first}, then [rest] {=ex:in-l2 ?rdf:rest} by [Second] {+ex:second ?rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}
~~~~~~

**Use for:** Controlled vocabularies, status codes, enumeration validation, category validation

**Important:**
- Uses RDF list syntax (rdf:first, rdf:rest, rdf:nil)
- Only validates values if property exists
- Use minCount to check for required properties
- Always reset subject with {=} after list definition

---

## 🔧 Implementation Guidelines

**When to use:** Values must be from a predefined set

**Best practices:**
- Keep list short for maintainability
- Combine with minCount for required properties

**Common pitfalls:**
- ❌ Forgetting subject reset {=} after list
- ❌ Reusing list identifiers causing collisions
- ❌ Not combining with minCount for required properties






{=}



<a id="constraints-qualifiedcount"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Qualified Count {=sh:qualifiedMinCount .class:QualifiedConstraint label}

> Applies count constraints only to values that meet additional shape criteria {comment}

<http://www.w3.org/ns/shacl#qualifiedMinCount> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#qualifiedMaxCount> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

Qualified count constraints apply count constraints only to values that meet additional shape criteria. This example validates that employees must have exactly one work email (matching the WorkEmailShape pattern).

~~~~~~md
[ex] <tag:my@example.org,2026:qualified/>

## Employee Validation Shape {=ex:EmployeeValidationShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with one work **email** {+#workEmailRule ?sh:property sh:name}.

**Employee must have exactly one work email** {=#workEmailRule .sh:PropertyShape sh:message} requires [email] {+ex:email ?sh:path} to have exactly [1] {sh:qualifiedMinCount sh:qualifiedMaxCount ^^xsd:integer} work email matching **Work Email Shape** {=ex:WorkEmailShape .sh:NodeShape ?sh:qualifiedValueShape}.

**Work Email Shape** {=ex:WorkEmailShape .sh:NodeShape} must be a [literal] {+sh:Literal ?sh:nodeKind} with pattern [company.org] {sh:pattern}.

---

## Test Data {=ex:data .Container}

### Valid Employee {=ex:ValidEmployee ?member}
Email: [john@company.org] {ex:email}

### Invalid Employee {=ex:NoWorkEmployee ?member}
Email: [bob@gmail.com] {ex:email}
~~~~~~

**Expected Result:** 1 violation (NoWorkEmployee fails because it has 0 work emails - the email doesn't match the WorkEmailShape pattern)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must have exactly [count] {sh:qualifiedMinCount sh:qualifiedMaxCount ^^xsd:integer} values that conform to [Shape] {=ex:ShapeName ?sh:qualifiedValueShape}.
~~~~~~

**Use for:** Work email validation, primary contact validation, conditional counting

**Important:**
- Only counts values that conform to the qualified shape
- Other values are ignored for the count
- Use for conditional validation scenarios

---

## 🔧 Implementation Guidelines

**When to use:** Only certain values should be counted

**Best practices:**
- Define the qualified shape clearly
- Test with mixed value scenarios

**Common pitfalls:**
- ❌ Forgetting to define the qualified shape
- ❌ Confusing qualified count with regular count






{=}



<a id="constraints-closed"></a>

[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[schema] <http://schema.org/>


# Closed World Constraint {=sh:closed .class:ClosedWorldConstraint label}

> Enables closed world validation where only explicitly declared properties are allowed. Essential for strict data modeling, schema enforcement, and preventing property proliferation in RDF graphs. {comment}

<http://www.w3.org/ns/shacl#closed> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The closed constraint enables closed world validation where only explicitly declared properties are allowed. This example validates that person data can only have declared properties (name, age).

~~~~~~md
[ex] <tag:my@example.org,2026:closed/>
[schema] <http://schema.org/>

## Person Data Demo

**Only declared properties allowed** {=ex:ClosedExampleShape .sh:NodeShape label} targets [ValidPerson] {+ex:ValidPerson ?sh:targetNode} and [InvalidPerson] {+ex:InvalidPerson ?sh:targetNode} with **no additional properties** {sh:closed} constraint except [Name] {+ex:NameProperty ?sh:property sh:name} and [Age] {+ex:AgeProperty ?sh:property sh:name}.

**Person must have a name** {=ex:NameProperty .sh:PropertyShape sh:message} ensures [name] {+schema:name ?sh:path} is [string] {+xsd:string ?sh:datatype} and [1] {sh:minCount ^^xsd:integer}.

**Person must have exactly one age** {=ex:AgeProperty .sh:PropertyShape sh:message} ensures [age] {+ex:age ?sh:path} is [integer] {+xsd:integer ?sh:datatype} and exactly [1] {sh:minCount sh:maxCount ^^xsd:integer}.

---

## Test Data {=ex:data .Container}

### Valid Person {=ex:ValidPerson}

Person with only declared properties.

Name: [John Doe] {schema:name ^^xsd:string}
Age: [30] {ex:age ^^xsd:integer}

### Invalid Person {=ex:InvalidPerson}

Person with undeclared property (violates closed world constraint).

Name: [Jane Smith] {schema:name ^^xsd:string}
Age: [25] {ex:age ^^xsd:integer}
Email: [<jane@example.com>] {ex:email}
~~~~~~

**Expected Result:** 1 violation (InvalidPerson fails because it has undeclared email property)

---

## 📝 MDLD Syntax Patterns

The closed constraint enables closed world validation where only explicitly declared properties are allowed.

~~~~~~md
**[Shape] with closed world validation** {=ex:ClosedShape .sh:NodeShape  label}

[Shape Name] {=ex:ShapeName .sh:NodeShape} has **no additional properties** {sh:closed}.
~~~~~~

**Key components:**
- **Shape declaration** - The shape to apply closed world validation (`{=ex:ShapeName .sh:NodeShape}`)
- **Closed constraint** - Enables closed world validation (`{sh:closed}`)
- **Property declarations** - Only declared properties are allowed
- **Property shapes** - Define allowed properties with constraints

**Important notes:**
- Only explicitly declared properties are allowed
- Undeclared properties cause validation violations
- Apply at NodeShape level, not PropertyShape level
- Useful for strict data modeling and schema enforcement
- Prevents property proliferation in RDF graphs

---

## 🎯 Use Cases

- **Strict data modeling** - Enforce exact schema compliance
- **Schema enforcement** - Prevent property proliferation
- **Data validation** - Ensure only declared properties exist
- **API contracts** - Enforce exact API contract compliance
- **Data quality** - Prevent unexpected properties

---

## 🔧 Implementation Guidelines

**When to use closed:**
- **Strict schemas** - When exact schema compliance is required
- **API contracts** - Enforce exact API contract compliance
- **Data quality** - Prevent unexpected properties
- **Schema enforcement** - Strict property validation
- **Closed world assumptions** - When business logic requires closed world

**Best practices:**
- Declare all required properties explicitly
- Combine with property constraints for complete validation
- Use descriptive property names for clarity
- Test with both valid and invalid data
- Document why closed world validation is needed

**Common pitfalls:**
- ❌ Forgetting to declare all required properties
- ❌ Using closed when open world is more appropriate
- ❌ Not combining with property constraints
- ❌ Overusing closed world validation
- ❌ Not documenting the closed world assumption






{=}



<a id="constraints-deactivated"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Deactivated {=sh:deactivated .class:DeactivatedConstraint label}

> Temporarily disables specific constraints during validation {comment}

<http://www.w3.org/ns/shacl#deactivated> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The deactivated constraint temporarily disables specific constraints during validation. This example shows a deactivated category rule while the status rule remains active.

~~~~~~md
[ex] <tag:my@example.org,2026:deactivated/>

## Deactivated Example Shape {=ex:DeactivatedExampleShape .sh:NodeShape label}

Validates all **member** {+member ?sh:targetObjectsOf} entities to be an active *user* {+ex:ActiveProperty ?sh:property sh:name} and have an active *category* {+ex:CategoryProperty ?sh:property sh:name}.

**User status must be active** {=ex:ActiveProperty .sh:PropertyShape sh:message} requires [status] {+ex:status ?sh:path} to be [active] {sh:hasValue}.

**Category rule** {=ex:DeactivatedProperty .sh:PropertyShape sh:message} requires [category] {+ex:category ?sh:path} to be [active] {sh:hasValue}. This rule is temporarily [deactivated] {sh:deactivated}.

---

## Test Data {=ex:data .Container}

### Valid Account {=ex:ValidNode ?member}
Status: [active] {ex:status}
Category: [active] {ex:status}

### Invalid Account {=ex:InvalidNode ?member}
Status: [inactive] {ex:status}
Category: [inactive] {ex:status}
~~~~~~

**Expected Result:** 1 violation (InvalidAccount fails because status is inactive; category rule is deactivated so it doesn't cause a violation)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Constraint] {=ex:PropertyConstraint .sh:PropertyShape} is [deactivated] {sh:deactivated}.
~~~~~~

**Use for:** Phased validation, conditional rules, schema evolution, testing

**Important:**
- Deactivated constraints are skipped during validation
- Useful for temporary constraint disabling
- Can be reactivated by removing the flag

---

## 🔧 Implementation Guidelines

**When to use:** Temporarily disable constraints

**Best practices:**
- Document why constraint is deactivated
- Plan for reactivation

**Common pitfalls:**
- ❌ Forgetting to reactivate deactivated constraints
- ❌ Using deactivated instead of removing obsolete constraints






{=}



<a id="constraints-severity"></a>

[mdld] <https://mdld.js.org/vocab/>
[cat] <https://mdld.js.org/shacl/catalog/>
[ex] <http://example.org/>

# Severity Levels {=sh:severity .class:SeverityConstraint label}

> Defines the severity level of validation violations (Info, Warning, Violation). Essential for prioritizing validation results and managing different types of constraint failures. {comment}

<http://www.w3.org/ns/shacl#severity> {?cat:fullIRI}
<http://www.w3.org/ns/shacl#message> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The severity constraint defines the severity level of validation violations (Info, Warning, Violation). This example demonstrates user account validation with different severity levels for different constraints.

~~~~~~md
[ex] <tag:my@example.org,2026:range/>

## User Validation Shape {=ex:UserValidationShape .sh:NodeShape label}

Targets all [users] {+ex:User ?sh:targetClass} to validate account requirements with different severity levels: critical **email** {+ex:CriticalRule ?sh:property sh:name}, warning **age** {+ex:WarningRule ?sh:property sh:name} and info **name** {+ex:InfoNameRule ?sh:property sh:name}.

**Email address is required and must be valid** {=ex:CriticalRule .sh:PropertyShape sh:message} requires [email] {+ex:email ?sh:path} to be [string] {+xsd:string ?sh:datatype} and at least [1] {sh:minCount ^^xsd:integer} corporate email [example.com] {sh:pattern} with [Violation severity] {+sh:Violation ?sh:severity}.

**Age should be between 18 and 120** {=ex:WarningRule .sh:PropertyShape sh:message} requires [age] {+ex:age ?sh:path} to be [integer] {+xsd:integer ?sh:datatype}, more than [18] {sh:minInclusive ^^xsd:integer} and less than [120] {sh:maxInclusive ^^xsd:integer} with [Warning severity] {+sh:Warning ?sh:severity}.

**Name should be a string of 2+ letters** {=ex:InfoNameRule .sh:PropertyShape sh:message} requires [name] {+ex:name ?sh:path} to be [string] {+xsd:string ?sh:datatype} at least [1] {sh:minCount} and longer than [3] {sh:minInclusive} with [Info severity] {+sh:Info ?sh:severity}.

---

## Test Data {=ex:data .Container}

### Valid User {=ex:ValidUser .ex:User}
Email: [user@example.com] {ex:email}
Age: [25] {ex:age ^^xsd:integer}
Name: [John Doe] {ex:name}

### Invalid User {=ex:InvalidUser .ex:User}
Email: [invalid-email] {ex:email}
Age: [150] {ex:age ^^xsd:integer}
Name: [] {ex:name}
~~~~~~

**Expected Result:** 3 violations (InvalidUser fails three times: Critical for invalid email, Warning for age > 120, Info for missing name)

---

## 📝 MDLD Syntax Patterns

The severity constraint defines the severity level of validation violations.

~~~~~~md
**[Constraint description]** {=ex:PropertyConstraint .sh:PropertyShape sh:message}

[Property Name] {+ex:propertyName ?sh:path} [constraint description] with [Severity] {+sh:SeverityLevel ?sh:severity}.
~~~~~~

**Key components:**
- **Validation message** - Human-readable error message (`{sh:message}`)
- **Severity level** - Severity of the violation (`{+sh:Violation ?sh:severity}`, `{+sh:Warning ?sh:severity}`, `{+sh:Info ?sh:severity}`)
- **Constraint description** - The constraint being validated
- **Priority management** - Helps prioritize validation results
- **Categorization** - Manages different types of constraint failures

**Important notes:**
- Use `sh:Violation` for critical failures that must be fixed
- Use `sh:Warning` for issues that should be addressed but aren't critical
- Use `sh:Info` for informational violations or recommendations
- Severity helps prioritize validation results
- Combine with message for clear user feedback

---

## 🎯 Use Cases

- **Prioritization** - Prioritize critical vs non-critical issues
- **User feedback** - Provide different feedback based on severity
- **Compliance** - Distinguish between critical compliance issues and recommendations
- **Data quality** - Manage different types of data quality issues
- **Workflow management** - Route issues based on severity

---

## 🔧 Implementation Guidelines

**When to use severity:**
- **Critical constraints** - Use `sh:Violation` for must-fix issues
- **Warnings** - Use `sh:Warning` for should-fix issues
- **Informational** - Use `sh:Info` for recommendations
- **Prioritization** - Help users prioritize fixes
- **Compliance** - Distinguish critical vs non-critical compliance issues

**Best practices:**
- Use severity consistently across constraints
- Document why certain constraints have specific severity
- Combine with message for clear feedback
- Consider user workflow when assigning severity
- Test with violations at different severity levels

**Common pitfalls:**
- ❌ Using wrong severity level for the constraint
- ❌ Not using severity consistently
- ❌ Overusing high severity for minor issues
- ❌ Not combining severity with message
- ❌ Forgetting to assign severity to constraints






{=}



<a id="constraints-message"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Violation Message {=sh:message .class:MessageConstraint label}

> Provides human-readable error messages for constraint violations {comment}

<http://www.w3.org/ns/shacl#message> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The message constraint provides human-readable error messages for constraint violations. This example shows a custom violation message for contract value validation.

~~~~~~md
[ex] <tag:my@example.org,2026:message/>

## Business Rule Validation Shape {=ex:BusinessRuleValidationShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with positive **contract** {+ex:ContractValueRule ?sh:property sh:name}.

**Contract value must be positive** {=ex:ContractValueRule .sh:PropertyShape sh:message} ensures [contract value] {+ex:contractValue ?sh:path} is greater than [0] {sh:minInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### Valid Contract {=ex:ValidContract ?member}
Value: [50000.00] {ex:contractValue ^^xsd:decimal}

### Invalid Contract {=ex:InvalidContract ?member}
Value: [-1000.00] {ex:contractValue ^^xsd:decimal}
~~~~~~

**Expected Result:** 1 violation (InvalidContract fails with message "Contract value must be positive")

---

## 📝 MDLD Syntax Patterns

~~~~~~md
**[Business rule]** {=ex:PropertyConstraint .sh:PropertyShape sh:message}
[Property] {+ex:propertyName ?sh:path} [constraint description].
~~~~~~

**Use for:** User-friendly feedback, debugging, actionable reporting, business context

**Important:**
- Messages should be specific and actionable
- Use business terminology, not just technical
- Keep messages concise but informative

---

## 🔧 Implementation Guidelines

**When to use:** Always provide messages for user-friendly feedback

**Best practices:**
- Use semantic, business-focused language
- Keep messages concise but informative

**Common pitfalls:**
- ❌ Using technical jargon instead of business language
- ❌ Writing vague or unclear messages






{=}



<a id="constraints-js"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# JavaScript Function {=sh:js .class:Constraint label}

> Allows custom JavaScript validation functions for complex constraint logic {comment}

<http://www.w3.org/ns/shacl#js> {?cat:fullIRI}

---

## 📋 Quick Start Pattern

The JavaScript constraint allows custom JavaScript validation functions for complex constraint logic. This example validates that event dates must be valid JavaScript dates.

~~~~~~md
[ex] <tag:my@example.org,2026:js/>

## Date Validation Shape {=ex:DateValidationShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with valid **date** {+ex:DatePropertyShape ?sh:property sh:name}.

**Event date must be valid** {=ex:DatePropertyShape .sh:PropertyShape sh:message} requires [eventDate] {+ex:eventDate ?sh:path} to be a valid JS date:

~~~~~~js {=ex:DateJSConstraint ?sh:JSConstraint sh:js}
const date = new Date(value);
return !isNaN(date.getTime());
~~~~~~

---

## Test Data {=ex:data .Container}

### Valid Event {=ex:ValidEvent ?member}
Event Date: [2024-12-25] {ex:eventDate ^^xsd:date}

### Invalid Event {=ex:InvalidEvent ?member}
Event Date: [not-a-date] {ex:eventDate}
~~~~~~

**Expected Result:** 1 violation (InvalidEvent fails because "not-a-date" is not a valid JavaScript date)

---

## 📝 MDLD Syntax Patterns

~~~~~~md
[Property] {+ex:propertyName ?sh:path} must pass custom validation.

~~~~~~js {=ex:JSConstraintName ?sh:JSConstraint sh:js}
// Custom validation logic
const result = validate(value);
return result;
~~~~~~
~~~~~~

**Use for:** Custom validation, complex logic, cross-property validation

**Important:**
- JavaScript code is executed during validation
- Function receives `value` parameter
- Return `true` for valid, `false` for invalid
- Use for complex validation not possible with standard constraints

---

## 🔧 Implementation Guidelines

**When to use:** Standard constraints are insufficient

**Best practices:**
- Keep JavaScript functions simple
- Test JavaScript functions thoroughly

**Common pitfalls:**
- ❌ Writing overly complex JavaScript functions
- ❌ Not testing JavaScript functions thoroughly






{=}



<a id="teach-choosing-constraints"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Choosing the Right Constraint

> A decision guide for selecting appropriate SHACL constraints for your validation needs {comment}

## Quick Decision Tree

**What do you need to validate?**

### Property Existence
- **Property must be present** → Use `sh:minCount` with value `1`
- **Property must have exactly one value** → Use both `sh:minCount` and `sh:maxCount` with value `1`
- **Property can have multiple values** → Use `sh:maxCount` to set upper limit

### Property Values
- **Value must be a specific constant** → Use `sh:hasValue`
- **Value must be from a predefined list** → Use `sh:in` (enumeration)
- **Value must be a specific type (IRI)** → Use `sh:class`
- **Value must be a specific type (literal)** → Use `sh:datatype`
- **Value must be IRI or literal** → Use `sh:nodeKind`

### Numeric Values
- **Value must be within a range** → Use `sh:minInclusive`/`sh:maxInclusive` or `sh:minExclusive`/`sh:maxExclusive`
- **Value must be positive** → Use `sh:minInclusive` with `0` or `0.01`
- **Value must be less than another property** → Use `sh:lessThan`

### String Values
- **String must have minimum/maximum length** → Use `sh:minLength`/`sh:maxLength`
- **String must match a pattern** → Use `sh:pattern`
- **String must have specific language tag** → Use `sh:languageIn`

### Complex Objects
- **Property value must conform to a shape** → Use `sh:node` (nested validation)
- **Property values must be unique in some way** → Use `sh:qualifiedMinCount`/`sh:qualifiedMaxCount`

### Relationships Between Properties
- **Properties must have disjoint values** → Use `sh:disjoint`
- **Properties must be equal** → Use `sh:equals`
- **One property must be before another** → Use `sh:lessThan`

### Logical Combinations
- **All conditions must pass** → Use `sh:and`
- **Condition must not pass** → Use `sh:not`

### Metadata
- **Add custom error message** → Use `sh:message`
- **Set violation severity** → Use `sh:severity`
- **Temporarily disable constraint** → Use `sh:deactivated`

## Common Validation Scenarios

### Required Field
```md
[Property] {+ex:propertyName ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.
```

### Email Validation
```md
[Property] {+ex:propertyName ?sh:path} must match [pattern] {sh:pattern}.
```

### Positive Number
```md
[Property] {+ex:propertyName ?sh:path} must be at least [0] {sh:minInclusive ^^xsd:decimal}.
```

### Enumerated Values
```md
[Property] {+ex:propertyName ?sh:path} must be in allowed list.
**Allowed List** {=ex:list ?sh:in .rdf:List}: [value1] {rdf:first}, then [rest] {=ex:rest ?rdf:rest} by [value2] {rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}
```

### Date Range
```md
[Property] {+ex:propertyName ?sh:path} must be at least [min-date] {sh:minInclusive ^^xsd:date} and at most [max-date] {sh:maxInclusive ^^xsd:date}.
```

## Constraint Groups Reference

- **Value Type**: class, datatype, nodeKind
- **Cardinality**: minCount, maxCount
- **Value Range**: minInclusive, maxInclusive, minExclusive, maxExclusive
- **String**: minLength, maxLength, pattern, languageIn
- **Property Pair**: equals, disjoint, lessThan
- **Logical**: and, not
- **Shape-based**: node
- **Other**: hasValue, in, qualifiedMinCount, qualifiedMaxCount

See [Constraints](#constraints-index) for detailed documentation on each constraint.






{=}



<a id="teach-practical-workflow"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Practical Workflow: Designing a Complete Shape

> Step-by-step example of designing a multi-constraint shape for a real-world use case {comment}

## Use Case: E-Commerce Product Validation

We need to validate product data with these requirements:
- Product must have a name (required)
- Product must have a price (required, must be positive)
- Product must have a category (must be from allowed list)
- Product description is optional but if present must be at least 10 characters
- Product SKU must follow pattern "PROD-XXXXX" (5 digits)

## Step 1: Define the Shape and Target

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

# Product Validation Shape {=ex:ProductShape .sh:NodeShape  label}
Validates all [Product] {+ex:Product ?sh:targetClass} instances to have mandatory [name] {+ex:NameRule ?sh:property sh:name}, [price] {+ex:PriceRule ?sh:property sh:name} and [category] {+ex:CategoryRule ?sh:property sh:name} assigned.


~~~~~~

## Step 2: Add Required Properties

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

## Product Validation Shape required properties {=ex:ProductShape}

**Product name is required** {=ex:NameRule .sh:PropertyShape sh:message} requires that [name] {+ex:name ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Product price is required** {=ex:PriceRule .sh:PropertyShape sh:message} requires that [price] {+ex:price ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Product category is required** {=ex:CategoryRule .sh:PropertyShape sh:message} requires that [category] {+ex:category ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.
~~~~~~

## Step 3: Add Value Constraints

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

**Product** {=ex:ProductShape} also must have a positive [price] {+ex:PriceRule ?sh:property sh:name}.

**Product price must be positive** {=ex:PriceRule .sh:PropertyShape sh:message}: [price] {+ex:price ?sh:path} must be at least [0.01] {sh:minInclusive ^^xsd:decimal}.
~~~~~~

## Step 4: Add Enumeration Constraint

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

**Product** {=ex:ProductShape} must have an allowed [category] {+ex:CategoryRule ?sh:property sh:name}.

**Product category must be from allowed list** {=ex:CategoryRule .sh:PropertyShape sh:message}: [category] {+ex:category ?sh:path} must be in **Allowed Categories List** {=ex:cat-l1 ?sh:in .rdf:List}: [Electronics] {rdf:first}, then [followed by] {=ex:cat-l2 ?rdf:rest} by [Clothing] {rdf:first} - [only these] {+rdf:nil ?rdf:rest}. {=}
~~~~~~

## Step 5: Add Optional Property with Conditional Constraint

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

**Product** {=ex:ProductShape} must have an optional [descripton] {+ex:DescriptionRule ?sh:property sh:name}.

**Product description is optional** {=ex:DescriptionRule .sh:PropertyShape sh:message}: [description] {+ex:description ?sh:path} must have at least [10] {sh:minLength ^^xsd:integer} characters.
~~~~~~

## Step 6: Add Pattern Constraint

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

**Product** {=ex:ProductShape} must have an [SKU] {+ex:DescriptioSKURulenRule ?sh:property sh:name}.

**Product SKU must match pattern** {=ex:SKURule .sh:PropertyShape sh:message}: [sku] {+ex:sku ?sh:path} must match [PROD-\d{5}] {sh:pattern}.
~~~~~~

## Complete Shape

~~~~~~md
[ex] <tag:my@example.org,2026:product/>

**Product Validation Shape** {=ex:ProductShape .sh:NodeShape  label}
Validates all [Product] {+ex:Product ?sh:targetClass} instances to have mandatory [name] {+ex:NameRule ?sh:property sh:name}, [price] {+ex:PriceRule ?sh:property sh:name} and [category] {+ex:CategoryRule ?sh:property sh:name} assigned, must have a positive [price] {+ex:PriceRule ?sh:property sh:name}, must have an allowed [category] {+ex:CategoryRule ?sh:property sh:name}, an optional [descripton] {+ex:DescriptionRule ?sh:property sh:name} and a correct [SKU] {+ex:DescriptioSKURulenRule ?sh:property sh:name}.

**Product name is required** {=ex:NameRule .sh:PropertyShape}
[name] {+ex:name ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Product price is required and positive** {=ex:PriceRule .sh:PropertyShape}
[price] {+ex:price ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value and be at least [0.01] {sh:minInclusive ^^xsd:decimal}.

**Product category is required and from allowed list** {=ex:CategoryRule .sh:PropertyShape}
[category] {+ex:category ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value and be in allowed list.

**Allowed Categories List** {=ex:cat-l1 ?sh:in .rdf:List}: [Electronics] {rdf:first}, then [rest] {=ex:cat-l2 ?rdf:rest} by [Clothing] {rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}

**Product description is optional but must be 10+ characters** {=ex:DescriptionRule .sh:PropertyShape}
[description] {+ex:description ?sh:path} must have at least [10] {sh:minLength ^^xsd:integer} characters.

**Product SKU must match pattern** {=ex:SKURule .sh:PropertyShape}
[sku] {+ex:sku ?sh:path} must match [PROD-\d{5}] {sh:pattern}.
~~~~~~

## Test Data

~~~~~~md
### Test Data {=ex:data .Container}

#### Valid Product {=ex:Laptop .ex:Product ?member}
Name: [MacBook Pro] {ex:name}
Price: [1299.99] {ex:price ^^xsd:decimal}
Category: [Electronics] {ex:category}
Description: [High-performance laptop] {ex:description}
SKU: [PROD-12345] {ex:sku}

#### Invalid Product - Missing Name {=ex:InvalidProduct1 .ex:Product ?member}
Price: [99.99] {ex:price ^^xsd:decimal}
Category: [Clothing] {ex:category}

#### Invalid Product - Negative Price {=ex:InvalidProduct2 .ex:Product ?member}
Name: [T-Shirt] {ex:name}
Price: [-10.00] {ex:price ^^xsd:decimal}
Category: [Clothing] {ex:category}

#### Invalid Product - Invalid Category {=ex:InvalidProduct3 .ex:Product ?member}
Name: [Shoes] {ex:name}
Price: [50.00] {ex:price ^^xsd:decimal}
Category: [Books] {ex:category}

#### Invalid Product - Short Description {=ex:InvalidProduct4 .ex:Product ?member}
Name: [Hat] {ex:name}
Price: [25.00] {ex:price ^^xsd:decimal}
Category: [Clothing] {ex:category}
Description: [Small] {ex:description}
~~~~~~

## Key Takeaways

1. **Start with targeting** - Define which data to validate first
2. **Add required properties** - Use minCount/maxCount for required fields
3. **Add value constraints** - Apply datatype, range, and pattern constraints
4. **Combine constraints** - Multiple constraints can apply to the same property
5. **Use RDF lists** - For enumeration (sh:in) and logical combinations (sh:and)
6. **Test thoroughly** - Create valid and invalid test cases for each rule
7. **Add error messages** - Use sh:message for user-friendly validation feedback

## Next Steps

- Explore [Targeting Mechanisms](#targeting-index) for more targeting options
- Learn about specific [Constraints](#constraints-index) for detailed constraint patterns






{=}



<a id="teach-advanced"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>

# Advanced Shape Composition Techniques

> Learn advanced SHACL techniques for complex validation scenarios in MDLD {comment}

## Overview

Advanced SHACL techniques enable you to model complex business rules and validation requirements that go beyond simple property constraints. This guide covers shape composition, logical constraints, qualified counting, and proper test data structure.

## Key Advanced Techniques

### 1. Shape Composition with sh:node

Shape composition allows you to reuse validation logic across multiple shapes by referencing one shape within another.

~~~~~~md
**Property must conform to shape** {=ex:PropertyRule .sh:PropertyShape ?sh:property}
[propertyName] {+ex:propertyName ?sh:path} must conform to [Target Shape] {+ex:TargetShape ?sh:node}.
~~~~~~

**Use cases:**
- Reusing common validation patterns
- Nested object validation
- Complex type checking

**Important notes:**
- The referenced shape is validated independently
- All constraints in the referenced shape apply
- Can chain multiple shapes together

### 2. NOT Constraint (sh:not)

The NOT constraint prevents data from conforming to a specific shape pattern.

~~~~~~md
**Property must not conform to forbidden shape** {=ex:PropertyRule .sh:PropertyShape ?sh:property}
[propertyName] {+ex:propertyName ?sh:path} must not conform to [Forbidden Shape] {+ex:ForbiddenShape ?sh:not}.
~~~~~~

**Use cases:**
- Forbidden status values
- Preventing certain data patterns
- Business rule enforcement

**Example:**
```md
**Employee status cannot be terminated** {=ex:StatusRule .sh:PropertyShape ?sh:property}
Employee status must not conform to [Terminated Status Shape] {+ex:TerminatedStatusShape ?sh:not}.
```

### 3. Qualified Count Constraints

Qualified count constraints allow you to count only values that conform to a specific shape, enabling conditional counting.

~~~~~~md
**Property must have N values conforming to shape** {=ex:PropertyRule .sh:PropertyShape ?sh:property}
[propertyName] {+ex:propertyName ?sh:path} must have at least [N] {sh:qualifiedMinCount ^^xsd:integer} values that conform to [Qualified Shape] {=ex:QualifiedShape .sh:NodeShape ?sh:qualifiedValueShape}.
~~~~~~

**Use cases:**
- Counting only active items
- Conditional validation based on subset
- Business rules with exceptions

**Example:**
```md
**Employee must have at least 2 completed projects** {=ex:ProjectsRule .sh:PropertyShape ?sh:property}
[projects] {+ex:projects ?sh:path} must have at least [2] {sh:qualifiedMinCount ^^xsd:integer} values that conform to [Completed Project Shape] {=ex:CompletedProjectShape .sh:NodeShape ?sh:qualifiedValueShape}.
```

### 4. Multiple Constraints on Same Property

You can apply multiple constraints to the same property by combining them in a single rule.

~~~~~~md
**Property with multiple constraints** {=ex:PropertyRule .sh:PropertyShape ?sh:property}
[propertyName] {+ex:propertyName ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value and be at least [0.01] {sh:minInclusive ^^xsd:decimal}.
~~~~~~

**Use cases:**
- Combining cardinality with value constraints
- Multi-factor validation rules
- Complex business requirements

### 5. Proper Test Data Structure

When testing advanced shapes with nested objects, use subject chaining to create proper test data.

~~~~~~md
#### Parent Entity {=ex:Parent1 .ex:Parent ?member}
Property: [value1] {+ex:Child1 ?ex:property} and [value2] {+ex:Child2 ?ex:property}

##### Child 1 {=ex:Child1 .ex:Child}
Status: [active] {ex:status}

##### Child 2 {=ex:Child2 .ex:Child}
Status: [active] {ex:status}
~~~~~~

**Key pattern:**
```
- Use `[literal] {+ex:Identifier ?property}` to link to nested objects
- Use `#####` headings to define nested objects with `{=ex:Identifier .ex:Class}`
- Use `and` to chain multiple values
```

## Complete Example

The following example demonstrates multiple advanced techniques in a single validation scenario:

~~~~~~md
[ex] <tag:my@example.org,2026:advanced/>

## Employee Validation Shape {=ex:EmployeeValidationShape .sh:NodeShape label}

Validates all [Employee] {+ex:Employee ?sh:targetClass} instances with comprehensive business rules: [department] {+ex:DepartmentRule ?sh:property sh:name}, [status] {+ex:StatusRule ?sh:property sh:name}, [projects] {+ex:ProjectsRule ?sh:property sh:name}, [salary] {+ex:SalaryRule ?sh:property sh:name}.

### Property Rules

**Employee must have valid department** {=ex:DepartmentRule .sh:PropertyShape} requires [department] {+ex:department ?sh:path} must have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value and must be in **Allowed Departments List** {=ex:dept-l1 ?sh:in .rdf:List}: [Engineering] {rdf:first}, then [rest] {=ex:dept-l2 ?rdf:rest} by [Sales] {rdf:first} and [nil] {+rdf:nil ?rdf:rest}. {=}

**Employee status cannot be terminated** {=ex:StatusRule .sh:PropertyShape sh:message}: Employee status must not conform to [Terminated Status Shape] {+ex:TerminatedStatusShape ?sh:not}.

**Employee must have at least 2 completed projects** {=ex:ProjectsRule .sh:PropertyShape sh:message}: [projects] {+ex:projects ?sh:path} must have at least [2] {sh:qualifiedMinCount ^^xsd:integer} values that conform to [Completed Project Shape] {=ex:CompletedProjectShape .sh:NodeShape ?sh:qualifiedValueShape}.

**Salary must be positive** {=ex:SalaryRule .sh:PropertyShape sh:message}: [salary] {+ex:salary ?sh:path} must be at least [0.01] {sh:minInclusive ^^xsd:decimal}.

---

## Terminated Status Shape {=ex:TerminatedStatusShape .sh:NodeShape  label}
Defines the forbidden terminated [status] {+ex:TerminatedStatusRule ?sh:property sh:name} pattern.

**Status must be terminated** {=ex:TerminatedStatusRule .sh:PropertyShape sh:message}: [status] {+ex:status ?sh:path} must be exactly [terminated] {sh:hasValue}.

---

## Completed Project Shape {=ex:CompletedProjectShape .sh:NodeShape  label}

Validates completed projects to have completed [status] {+ex:ProjectStatusRule ?sh:property sh:name} and positive [budget] {+ex:ProjectBudgetRule ?sh:property sh:name}.

**Project must be completed** {=ex:ProjectStatusRule .sh:PropertyShape sh:message}: [status] {+ex:status ?sh:path} must be exactly [completed] {sh:hasValue}.

**Project must have positive budget** {=ex:ProjectBudgetRule .sh:PropertyShape sh:message}: [budget] {+ex:budget ?sh:path} must be at least [0.01] {sh:minInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### Valid Employee {=ex:Employee1 .ex:Employee ?member}
Department: [Engineering] {ex:department}
Status: [active] {ex:status}
Salary: [75000.00] {ex:salary ^^xsd:decimal}
Projects: [project1] {+ex:Project1 ?ex:projects} and [project2] {+ex:Project2 ?ex:projects}

##### Project 1 {=ex:Project1 .ex:Project}
Status: [completed] {ex:status}
Budget: [50000.00] {ex:budget ^^xsd:decimal}

##### Project 2 {=ex:Project2 .ex:Project}
Status: [completed] {ex:status}
Budget: [30000.00] {ex:budget ^^xsd:decimal}

### Invalid Employee - Invalid Department {=ex:Employee2 .ex:Employee ?member}
Department: [invalid-dept] {ex:department}
Status: [active] {ex:status}
Salary: [65000.00] {ex:salary ^^xsd:decimal}
Projects: [project3] {+ex:Project3 ?ex:projects} and [project3b] {+ex:Project3b ?ex:projects}

##### Project 3 {=ex:Project3 .ex:Project}
Status: [completed] {ex:status}
Budget: [40000.00] {ex:budget ^^xsd:decimal}

##### Project 3b {=ex:Project3b .ex:Project}
Status: [completed] {ex:status}
Budget: [20000.00] {ex:budget ^^xsd:decimal}

### Invalid Employee - Terminated Status {=ex:Employee3 .ex:Employee ?member}
Department: [Engineering] {ex:department}
Status: [terminated] {ex:status}
Salary: [60000.00] {ex:salary ^^xsd:decimal}
Projects: [project4] {+ex:Project4 ?ex:projects} and [project4b] {+ex:Project4b ?ex:projects}

##### Project 4 {=ex:Project4 .ex:Project}
Status: [completed] {ex:status}
Budget: [35000.00] {ex:budget ^^xsd:decimal}

##### Project 4b {=ex:Project4b .ex:Project}
Status: [completed] {ex:status}
Budget: [15000.00] {ex:budget ^^xsd:decimal}

### Invalid Employee - Insufficient Completed Projects {=ex:Employee4 .ex:Employee ?member}
Department: [Engineering] {ex:department}
Status: [active] {ex:status}
Salary: [70000.00] {ex:salary ^^xsd:decimal}
Projects: [project5] {+ex:Project5 ?ex:projects}

##### Project 5 {=ex:Project5 .ex:Project}
Status: [completed] {ex:status}
Budget: [45000.00] {ex:budget ^^xsd:decimal}

### Invalid Employee - Negative Salary {=ex:Employee5 .ex:Employee ?member}
Department: [Engineering] {ex:department}
Status: [active] {ex:status}
Salary: [-1000.00] {ex:salary ^^xsd:decimal}
Projects: [project6] {+ex:Project6 ?ex:projects} and [project6b] {+ex:Project6b ?ex:projects}

##### Project 6 {=ex:Project6 .ex:Project}
Status: [completed] {ex:status}
Budget: [20000.00] {ex:budget ^^xsd:decimal}

##### Project 6b {=ex:Project6b .ex:Project}
Status: [completed] {ex:status}
Budget: [15000.00] {ex:budget ^^xsd:decimal}
~~~~~~

**Expected Result:** 4 violations (Employee2 fails: invalid department; Employee3 fails: terminated status (NOT constraint); Employee4 fails: only 1 completed project, needs 2; Employee5 fails: negative salary; Employee1 passes)

## Best Practices

**Shape Composition:**
- Create reusable shapes for common validation patterns
- Keep shapes focused and single-purpose
- Document shape dependencies clearly

**NOT Constraint:**
- Use for forbidden patterns rather than negative conditions
- Combine with other constraints for comprehensive rules
- Test with both valid and invalid cases

**Qualified Count:**
- Define clear criteria for qualified values
- Test boundary conditions (0, 1, N values)
- Consider performance implications for large datasets

**Test Data:**
- Always include valid test cases
- Test each constraint independently
- Use descriptive test case names
- Structure nested data with proper subject chaining

## Common Pitfalls

- **Shape cycles** - Avoid circular shape references
- **Over-composition** - Don't nest shapes too deeply
- **Ambiguous constraints** - Ensure constraints are clear and specific
- **Incomplete test coverage** - Test all constraint combinations
- **Incorrect subject chaining** - Use proper syntax for nested objects

## Next Steps


- Explore [Constraints](#constraints-index) for detailed constraint patterns
- Learn about [Targeting Mechanisms](#targeting-index) for data selection
