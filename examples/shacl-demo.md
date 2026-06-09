<a id="index.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# MDLD SHACL Demos {=cat:index .Container label}

> Demo files for SHACL validation in MDLD - test data, shapes, and validation scenarios for development and testing. {?comment}

This catalog contains demo files with test data and expected violations for all SHACL constraints and targeting mechanisms.

## Contents

[Targeting Demos](#targeting-index.demo)
[Constraint Demos](#constraints-index.demo)






{=}



<a id="targeting-index.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Demo Catalog {=cat:index}

## Targeting Mechanism Demos

Demo files for SHACL targeting predicates that determine which nodes get validated:

- [Target Class Demo](#targeting-targetclass.demo)
- [Target Node Demo](#targeting-targetnode.demo)
- [Target Subjects Demo](#targeting-targetsubjectsof.demo)
- [Target Objects Demo](#targeting-targetobjectsof.demo)






{=}



<a id="targeting-targetclass.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>


# Target Class Demo {=ex:demo} 

This demo demonstrates class-based targeting using a product management scenario where all Product instances are validated for business requirements:

The **Product Validation Shape** {=ex:ProductValidationShape .sh:NodeShape  label} targets all [Product] {+ex:Product ?sh:targetClass} instances to validate core product requirements: [name] {+#productName ?sh:property sh:name} and [price] {+#productPrice ?sh:property sh:name}.

**Product must have exactly one name** {=#productName .sh:PropertyShape sh:message} requires the [name] {+ex:name ?sh:path} property to have exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} value.

**Product price must be positive** {=#productPrice .sh:PropertyShape sh:message} requires the [price] {+ex:price ?sh:path} property to be at least [0.01] {sh:minInclusive ^^xsd:decimal}

---

## 📋 Test Data {=ex:data .Container}

### Laptop {=ex:Laptop .ex:Product}

A valid product with name and positive price.

Name: [MacBook Pro] {ex:name}
Price: [1299.99] {ex:price ^^xsd:decimal}

### Invalid Product {=ex:InvalidProduct .ex:Product}

A product with missing name and negative price.

Price: [-50.00] {ex:price ^^xsd:decimal}

### Service {=ex:Service .ex:Service}

A service that shouldn't be targeted by product validation.

Name: [Consulting] {ex:name}
Price: [200.00] {ex:price ^^xsd:decimal}

---

[Demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violations.

## Expected Validation Results

1. **Laptop** - passes (has name and positive price)
2. **Invalid Product** - fails twice (missing name AND negative price)
3. **Service** - not validated (not a Product, so not targeted by class-based validation)

Note: Class-based targeting validates all instances of the specified class, making it ideal for domain-wide validation rules.

### 🔍 Test Validation

```bash
# This should show 2 violations - missing name and negative price
ig-cli validate ./targeting/targetClass.md
```

---






{=}



<a id="targeting-targetnode.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>

# Target Node Demo {=ex:demo}

This demo demonstrates node-based targeting using critical infrastructure and executive validation scenarios.

## Critical Infrastructure Demo

The **Database Validation Shape** {=ex:DatabaseValidationShape .sh:NodeShape label} targets the [Main Database] {+ex:MainDatabase ?sh:targetNode} for critical infrastructure validation: [status] {+#databaseStatus ?sh:property sh:name} and [uptime] {+#databaseUptime ?sh:property sh:name}.

**Main database must be online** {=#databaseStatus .sh:PropertyShape sh:message} requires the [status] {+ex:status ?sh:path} property to be exactly [online] {sh:hasValue}

**Database uptime must be at least 99.9%** {=#databaseUptime .sh:PropertyShape sh:message} that requires the [uptime] {+ex:uptime ?sh:path} property to be at least [99.9] {sh:minInclusive ^^xsd:decimal}

## Executive Validation Demo

**CEO Validation Shape** {=ex:CEOValidationShape .sh:NodeShape label} targets the [CEO] {+ex:CEO ?sh:targetNode} for [executive] {+#executiveClearance ?sh:property sh:name} level clearance.

**CEO must have top-secret security clearance** {=#executiveClearance .sh:PropertyShape sh:message} requires the [securityClearance] {+ex:securityClearance ?sh:path} property to be exactly [top-secret] {sh:hasValue}.

---

## 📋 Test Data {=ex:data .Container}

### Main Database {=ex:MainDatabase}

Critical infrastructure that should be online with high uptime.

Status: [offline] {ex:status}
Uptime: [95.5] {ex:uptime ^^xsd:decimal}

### Backup Database {=ex:BackupDatabase}

Secondary infrastructure (not targeted by node-based validation).

Status: [online] {ex:status}
Uptime: [99.8] {ex:uptime ^^xsd:decimal}

### CEO {=ex:CEO}

The chief executive with improper clearance.

Security Clearance: [secret] {ex:securityClearance}

### CFO {=ex:CFO}

The chief financial officer (not targeted by CEO-specific validation).

Security Clearance: [secret] {ex:securityClearance}

---

[Demo] {=ex:demo} must produce exactly **3** {cat:expectsViolations ^^xsd:integer} violations.

## Expected Validation Results

1. **Main Database** - fails twice (status: offline ≠ online AND uptime: 95.5% < 99.9%)
2. **Backup Database** - not validated (not targeted by specific node validation)
3. **CEO** - fails (security clearance is secret, not top-secret)
4. **CFO** - not validated (not targeted by CEO-specific validation)

Note: Node-based targeting provides precise control over which specific entities get validated, making it ideal for critical infrastructure and executive validation.

### 🔍 Test Validation

```bash
# This should show 3 violations - database status, uptime, and CEO clearance
ig-cli validate ./targeting/targetNode.md
```

---






{=}



<a id="targeting-targetsubjectsof.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>


# Target Subjects Of {=sh:targetSubjectsOf .class:TargetingMechanism label} Demo

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates subject-based targeting using management and approval scenarios where we validate entities that initiate relationships.

### Management Validation Demo

The **Manager Validation Shape** {=ex:ManagerValidationShape .sh:NodeShape  label} targets all [managers] {+ex:manages ?sh:targetSubjectsOf} of the manages relationship to validate management requirements: [level] {+#managementLevel ?sh:property sh:name} and [teamSize] {+#teamSize ?sh:property sh:name}.

**Managers must have level 3 or higher** {=#managementLevel .sh:PropertyShape sh:message} requires the [level] {+ex:level ?sh:path} property to be at least [3] {sh:minInclusive ^^xsd:integer}.

**Managers can oversee at most 10 team members** {=#teamSize .sh:PropertyShape sh:message} that requires the [teamSize] {+ex:teamSize ?sh:path} property to be at most [10] {sh:maxInclusive ^^xsd:integer}.

### Approval Validation Demo

**Approver Validation Shape** {=ex:ApproverValidationShape .sh:NodeShape  label} targets all [approvers] {+ex:approves ?sh:targetSubjectsOf} of the approves relationship to validate approval [authority] {+#approvalAuthority ?sh:property sh:name}.

**Approvers must have authority level 2 or higher** {=#approvalAuthority .sh:PropertyShape sh:message} requires the [authority] {+ex:authority ?sh:path} property to be at least [2] {sh:minInclusive ^^xsd:integer}.

---

### 📋 Test Data {=ex:data .Container}

#### Engineering Manager {=ex:EngineeringManager}

A manager with insufficient level and oversized team.

Level: [2] {ex:level ^^xsd:integer}
Team Size: [15] {ex:teamSize ^^xsd:integer}
Manages: [EngineeringTeam] {ex:manages}

#### Senior Manager {=ex:SeniorManager}

A manager with appropriate level and team size.

Level: [4] {ex:level ^^xsd:integer}
Team Size: [8] {ex:teamSize ^^xsd:integer}
Manages: [QATeam] {ex:manages}

#### Junior Developer {=ex:JuniorDeveloper}

A team member who doesn't manage anyone (not targeted).

Level: [1] {ex:level ^^xsd:integer}
Team Size: [0] {ex:teamSize ^^xsd:integer}

#### Finance Approver {=ex:FinanceApprover}

An approver with insufficient authority.

Authority: [1] {ex:authority ^^xsd:integer}
Approves: [ExpenseReport] {ex:approves}

#### Executive Approver {=ex:ExecutiveApprover}

An approver with sufficient authority.

Authority: [3] {ex:authority ^^xsd:integer}
Approves: [BudgetRequest] {ex:approves}

#### Regular Employee {=ex:RegularEmployee}

An employee who doesn't approve anything (not targeted).

Authority: [0] {ex:authority ^^xsd:integer}

---

{=ex:demo} must produce exactly **3** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results 

#### Management Validation (subjects of manages):
1. **Engineering Manager** - fails twice (level 2 < 3 AND teamSize 15 > 10)
2. **Senior Manager** - passes (level 4 ≥ 3 AND teamSize 8 ≤ 10)
3. **Junior Developer** - not validated (doesn't manage anyone)

#### Approval Validation (subjects of approves):
4. **Finance Approver** - fails once (authority 1 < 2)
5. **Executive Approver** - passes (authority 3 ≥ 2)
6. **Regular Employee** - not validated (doesn't approve anything)

Note: Subject-based targeting validates entities that initiate relationships, making it ideal for management, approval, and source validation scenarios.

### 🔍 Test Validation

```bash
# This should show 3 violations - management level, team size, and approval authority
ig-cli validate ./targeting/targetSubjectsOf.md
```

---






{=}



<a id="targeting-targetobjectsof.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>

# Target Objects Of Demo {=ex:demo .Container}

This demo demonstrates object-based targeting using team membership and product reference scenarios where we validate entities that are referenced by others.

### Team Membership Demo

The **Team Member Validation Shape** {=ex:TeamMemberValidationShape .sh:NodeShape label} targets all [team members] {+ex:memberOf ?sh:targetObjectsOf} to validate team membership requirements: [workload] {+#workloadRule ?sh:property sh:name} and [status] {+#activeStatus ?sh:property sh:name}.

**Team members must not exceed 40 hours workload** {=#workloadRule .sh:PropertyShape sh:message} requires the [workload] {+ex:workload ?sh:path} property to be at most [40] {sh:maxInclusive ^^xsd:integer}.

**Team members must be active** {=#activeStatus .sh:PropertyShape sh:message} that requires the [status] {+ex:status ?sh:path} property to be exactly [active] {sh:hasValue}.

### Product Reference Demo

**Referenced Product Validation Shape** {=ex:ReferencedProductValidationShape .sh:NodeShape label} targets all [referenced products] {+ex:references ?sh:targetObjectsOf} to validate product reference requirements: [availability] {+#productAvailability ?sh:property sh:name} and [price] {+#productPrice ?sh:property sh:name}.

**Referenced products must be available** {=#productAvailability .sh:PropertyShape sh:message} requires the [available] {+ex:available ?sh:path} property to be exactly [true] {sh:hasValue}.

**Referenced products must cost $1000 or less** {=#productPrice .sh:PropertyShape sh:message} that requires the [price] {+ex:price ?sh:path} property to be at most [1000.00] {sh:maxInclusive ^^xsd:decimal}.

---

### 📋 Test Data {=ex:data .Container}

#### EngineeringTeam {=ex:EngineeringTeam}

A team with excessive workload and inactive status (targeted as object of memberOf).

Workload: [45] {ex:workload ^^xsd:integer}
Status: [inactive] {ex:status}

#### QATeam {=ex:QATeam}

A team with appropriate workload and active status.

Workload: [35] {ex:workload ^^xsd:integer}
Status: [active] {ex:status}

#### Senior Developer {=ex:SeniorDeveloper}

A team member (not targeted as subject).

Member Of: [Engineering team] {+ex:EngineeringTeam ?ex:memberOf}

#### Junior Developer {=ex:JuniorDeveloper}

A team member (not targeted as subject).

Member Of: [QATeam] {+ex:QATeam ?ex:memberOf}

#### Expensive Product {=ex:ExpensiveProduct}

A product that's too expensive and unavailable (targeted as object of references).

Price: [1500.00] {ex:price ^^xsd:decimal}
Available: [false] {ex:available}

#### Affordable Product {=ex:AffordableProduct}

A product that meets all requirements.

Price: [299.99] {ex:price ^^xsd:decimal}
Available: [true] {ex:available}

#### Order123 {=ex:Order123}

An order referencing expensive product (not targeted as subject).

References: [Expensive product] {+ex:ExpensiveProduct ?ex:references}

#### Order456 {=ex:Order456}

An order referencing affordable product (not targeted as subject).

References: [Affordable product] {+ex:AffordableProduct ?ex:references}

#### Unreferenced Product {=ex:UnreferencedProduct}

A product not referenced by any order (not targeted).

Price: [500.00] {ex:price ^^xsd:decimal}
Available: [true] {ex:available}

---

{=ex:demo} must produce exactly **4** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results 

#### Team Membership Validation (objects of memberOf):
1. **EngineeringTeam** - fails twice (workload 45 > 40 AND status: inactive ≠ active)
2. **QATeam** - passes (workload 35 ≤ 40 AND status: active)
3. **Senior Developer** - not validated (is a subject, not an object of memberOf)
4. **Junior Developer** - not validated (is a subject, not an object of memberOf)

#### Product Reference Validation (objects of references):
5. **Expensive Product** - fails twice (price 1500.00 > 1000.00 AND available: false ≠ true)
6. **Affordable Product** - passes (price 299.99 ≤ 1000.00 AND available: true)
7. **Order123** - not validated (is a subject, not an object of references)
8. **Order456** - not validated (is a subject, not an object of references)
9. **Unreferenced Product** - not validated (not referenced by any order)

Note: Object-based targeting validates entities that are referenced by others, making it ideal for team membership, product references, and destination validation scenarios.

### 🔍 Test Validation

```bash
# This should show 4 violations - workload, status, price, and availability
ig-cli validate ./targeting/targetObjectsOf.md
```

---






{=}



<a id="constraints-index.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>

# Demo Catalog {=cat:index}

## Constraint Demos

Demo files for SHACL constraints with test data and validation scenarios:

## Value Type Constraints

- [Class Demo](#constraints-class.demo)
- [Data Type Demo](#constraints-datatype.demo)
- [Node Kind Demo](#constraints-nodekind.demo)

## Cardinality Constraints

- [Count Demo](#constraints-count.demo)

## Value Range Constraints

- [Range Demo](#constraints-range.demo)

## Property Pair Constraints

- [Comparison Demo](#constraints-comparison.demo)
- [Disjoint Demo](#constraints-disjoint.demo)

## Logical Constraints

- [NOT Demo](#constraints-not.demo)
- [AND Demo](#constraints-and.demo)
- [OR Demo](#constraints-or.demo)
- [XONE Demo](#constraints-xone.demo)

## String Constraints

- [Length Demo](#constraints-length.demo)
- [Pattern Demo](#constraints-pattern.demo)
- [Language Demo](#constraints-language.demo)
- [Unique Languages Demo](#constraints-uniquelang.demo)

## Other Constraints

- [Has Value Demo](#constraints-hasvalue.demo)
- [Node Demo](#constraints-node.demo)
- [In Demo](#constraints-in.demo)
- [Qualified Count Demo](#constraints-qualifiedcount.demo)
- [Closed Demo](#constraints-closed.demo)
- [Deactivated Demo](#constraints-deactivated.demo)
- [Severity Demo](#constraints-severity.demo)
- [Message Demo](#constraints-message.demo)

## JavaScript Constraints

- [JavaScript Function Demo](#constraints-js.demo)






{=}



<a id="constraints-class.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <tag:my@example.org,2026:class/>

# Class Demo {=ex:demo .Container}

## Employee Test Shape {=ex:EmployeeTestShape .sh:NodeShape  label}

All [employees] {+member ?sh:targetObjectsOf} must have **manager** {+#managerClass ?sh:property sh:name} class assigned.

**Manager must be a Person instance** {=#managerClass .sh:PropertyShape sh:message} requires the [manager] {+ex:manager ?sh:path} property to be an instance of a [Person] {+ex:Person ?sh:class}.

---

## 📋 Test Data {=ex:data .Container}

### Valid Employee {=ex:ValidEmployee ?member}
Manager: [john] {+ex:john ?ex:manager .ex:Person}

### Invalid Employee {=ex:InvalidEmployee ?member}
Manager: [robot] {+ex:robot ?ex:manager ex:Role}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Employee** - passes (manager is a Person)
2. **Invalid Employee** - fails (manager is not a Person)

## 🔍 Test Validation

```bash
# This should show 1 violation for class constraint violation
ig-cli validate ./constraints/class.demo.md
```

---






{=}



<a id="constraints-datatype.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <tag:my@example.org,2026:datatype/>

# Data Type Demo {=ex:demo .Container}

## Product Test Shape {=ex:ProductTestShape .sh:NodeShape sh:name}

Validates [Valid Product] {+ex:ValidProduct ?sh:targetNode} and [Invalid Product] {+ex:InvalidProduct ?sh:targetNode} with **price** {+#priceDecimal ?sh:property sh:name}.

**Price must be decimal** {=#priceDecimal .sh:PropertyShape sh:message} requires the [price] {+ex:price ?sh:path} property to be a [decimal] {+xsd:decimal ?sh:datatype} value.

---

## 📋 Test Data {=ex:data .Container}

### Valid Product {=ex:ValidProduct ?member}
Price: [29.99] {ex:price ^^xsd:decimal}

### Invalid Product {=ex:InvalidProduct ?member}
Price: [29.99] {ex:price ^^xsd:string}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid Product** - passes (price is decimal)
2. **Invalid Product** - fails (price is string, not decimal)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/datatype.demo.md
```

---






{=}



<a id="constraints-nodekind.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <tag:my@example.org,2026:nodekind/>

# Node Kind Demo {=ex:demo}

## Document Test Shape {=ex:DocumentTestShape .sh:NodeShape  label}

Validates [Valid Document] {+ex:ValidDocument ?sh:targetNode} and [Invalid Document] {+ex:InvalidDocument ?sh:targetNode} with literal **content** {+#contentLiteral ?sh:property sh:name} and IRI for **reference** {+#referenceIRI ?sh:property sh:name}.

**Content must be literal** {=#contentLiteral .sh:PropertyShape sh:message} requires [content] {+ex:content ?sh:path} to be a [Literal] {+sh:Literal ?sh:nodeKind}.

**Reference must be IRI** {=#referenceIRI .sh:PropertyShape sh:message} requires [reference] {+ex:reference ?sh:path} to be an [IRI] {+sh:IRI ?sh:nodeKind}.

---

## 📋 Test Data {=ex:data .Container}

### Valid Document {=ex:ValidDocument ?member}
Content: [text] {ex:content}
Reference: <https://example.org> {?ex:reference}

### Invalid Document {=ex:InvalidDocument ?member}
Content: <https://example.org> {?ex:content}
Reference: [text] {ex:reference}

---

[Demo] {=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Document** - passes (content is literal, reference is IRI)
2. **Invalid Document** - fails 2 times (content is IRI not literal, reference is text not IRI)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/nodekind.demo.md
```






{=}



<a id="constraints-count.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[class] <cat:class/>
[ex] <tag:my@example.org,2026:count/>

# Count Demo {=ex:demo .Container}

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Person** - passes (exactly one email)
2. **Invalid Person** - fails (two emails instead of one)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/count.demo.md
```






{=}



<a id="constraints-range.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:range/>

# Range Demo {=ex:demo .Container}

## Product Test Shape {=ex:ProductTestShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with conforming **price** {+#priceRange ?sh:property}.

**Price must be between 10 and 100 inclusive** {=#priceRange .sh:PropertyShape sh:message} requires [price] {+ex:price ?sh:path} to be at least [10] {sh:minInclusive ^^xsd:decimal} and at most [100] {sh:maxInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### Valid Product {=ex:ValidProduct ?member}
Price: [50] {ex:price ^^xsd:decimal}

### Invalid Product {=ex:InvalidProduct ?member}
Price: [5] {ex:price ^^xsd:decimal}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid Product** - passes (price is within range)
2. **Invalid Product** - fails (price is below minimum)

## 🔍 Test Validation

```bash
ig-cli validate ./constraints/range.demo.md
```

---






{=}



<a id="constraints-comparison.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:comparison/>

# Comparison Demo {=ex:demo .Container}

### Order Test Shape {=ex:OrderTestShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **order date before shipping date** {+#orderDateRule ?sh:property sh:name}.

**Order date must be before shipping date** {=#orderDateRule .sh:PropertyShape sh:message} requires [order date] {+ex:orderDate ?sh:path} to be before [shipping date] {+ex:shippingDate ?sh:lessThan}.

---

### Test Data {=ex:data .Container}

#### Valid Order {=ex:ValidOrder ?member}
Order Date: [2024-06-15] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}

#### Invalid Order {=ex:InvalidOrder ?member}
Order Date: [2024-06-25] {ex:orderDate ^^xsd:date}
Shipping Date: [2024-06-20] {ex:shippingDate ^^xsd:date}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Order** - passes (order date is before shipping date)
2. **Invalid Order** - fails (order date is after shipping date)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/comparison.demo.md
```

---






{=}



<a id="constraints-disjoint.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:disjoint/>

# Disjoint {=ex:demo .Container}

### Label Test Shape {=ex:DisjointExampleShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with **disjoint labels** {+#disjointRule ?sh:property sh:name}.

**Preferred labels must be different from alternative labels** {=#disjointRule .sh:PropertyShape sh:message} requires [preferred labels] {+ex:prefLabel ?sh:path} to be disjoint with [alternative labels] {+ex:altLabel ?sh:disjoint}.

---

### Test Data {=ex:data .Container}

#### Valid Case {=ex:USA ?member}
Preferred Label: [USA] {ex:prefLabel}
Alternative Label: [United States] {ex:altLabel}

#### Invalid Case {=ex:Germany ?member}
Preferred Label: [Germany] {ex:prefLabel}
Alternative Label: [Germany] {ex:altLabel}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid Case** - passes (labels are different)
2. **Invalid Case** - fails (labels are the same)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/disjoint.demo.md
```

---






{=}



<a id="constraints-not.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:not/>

# NOT {=sh:not .class:LogicalConstraint label} Demo

## Demo {=ex:demo ?cat:hasDemo}

### User Status Shape {=ex:UserStatusShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities to not conform to the forbidden **shape** {+ex:ForbiddenStatusShape ?sh:not}.

**Forbidden Status Shape** {=ex:ForbiddenStatusShape .sh:NodeShape} requires [status] {+ex:status ?sh:path} to be exactly [deleted] {sh:hasValue}.

---

### Test Data {=ex:data .Container}

#### Valid User {=ex:ValidActiveUser ?member}
Status: [active] {ex:status}

#### Invalid User {=ex:InvalidDeletedUser ?member}
Status: [deleted] {ex:status}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid User** - passes (status is not deleted)
2. **Invalid User** - fails (status is deleted)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/not.demo.md
```

---






{=}



<a id="constraints-and.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:and/>

# AND Demo {=ex:demo .prov:Entity label}

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid Product** - passes (has price and category)
2. **Invalid Product** - fails (missing price)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/and.demo.md
```

---






{=}



<a id="constraints-or.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:or/>

# OR Demo {=ex:demo .Container}

This demo demonstrates the OR constraint, which requires a value to conform to at least one of several shapes.

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Email Contact** - passes (matches email pattern)
2. **Valid Phone Contact** - passes (matches phone pattern)
3. **Invalid Contact** - fails (matches neither email nor phone pattern)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/or.demo.md
```






{=}



<a id="constraints-xone.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:xone/>

# XONE Demo {=ex:demo .Container}

This demo demonstrates the XONE constraint, which requires a value to conform to exactly one of several shapes (exclusive OR).

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Admin** - passes (role is admin - matches exactly one)
2. **Valid User** - passes (role is user - matches exactly one)
3. **Invalid - No Role** - fails (role is guest - matches none)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/xone.demo.md
```






{=}



<a id="constraints-length.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:length/>

# Length {=sh:minLength .class:Constraint label} Demo

## Demo {=ex:demo ?cat:hasDemo}

### User Account Test Shape {=ex:UserAccountTestShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with correct length of the **username** {+#usernameLength ?sh:property sh:name}.

**Username must be 3-20 characters** {=#usernameLength .sh:PropertyShape sh:message} requires [username] {+ex:username ?sh:path} to have at least [3] {sh:minLength ^^xsd:integer} and at most [20] {sh:maxLength ^^xsd:integer} characters.

---

### Test Data {=ex:data .Container}

#### Valid User {=ex:ValidUser ?member}
Username: [john_doe] {ex:username}

#### Invalid User {=ex:InvalidUser ?member}
Username: [jd] {ex:username}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid User** - passes (username is 8 characters)
2. **Invalid User** - fails (username is only 2 characters)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/length.demo.md
```






{=}



<a id="constraints-pattern.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:pattern/>

# Pattern Demo {=ex:demo .Container} 

## Email Validation Shape {=ex:PatternExampleShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with corporate **email** {+ex:EmailPatternConstraint ?sh:property sh:name}.

**Email must end with example.com** {=ex:EmailPatternConstraint .sh:PropertyShape sh:message} requires [email] {+ex:email ?sh:path} to match [example\.com$] {sh:pattern} with [i] {sh:flags}.

---

## Test Data {=ex:data .Container}

### Valid Email {=ex:ValidEmail ?member}
Email: [user@example.com] {ex:email}

### Invalid Email {=ex:InvalidEmail ?member}
Email: [user@example.org] {ex:email}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Email** - passes (matches pattern)
2. **Invalid Email** - fails (doesn't match pattern)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/pattern.demo.md
```

---






{=}



<a id="constraints-language.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:language/>

# Language Demo {ex:demo.Container} 

## Multilingual Document Shape {=ex:MultilingualDocumentShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with english or french **title** {+#titleLanguage ?sh:property sh:name}.

**Title language must be en or fr** {=#titleLanguage .sh:PropertyShape sh:message} requires [title] {+ex:title ?sh:path} language tags to be in the **Allowed Languages List** {=ex:lang-l1 ?sh:languageIn .rdf:List}: **en** {rdf:first},  [or] {=ex:lang-l2 ?rdf:rest} **fr** {rdf:first} - [only these 2 languages are allowed] {+rdf:nil ?rdf:rest}. {=}

---

## Test Data {=ex:data .Container}

### English Document {=ex:EnglishDocument ?member}
Title: [Hello World] {ex:title @en}

### Invalid Document {=ex:GermanDocument ?member}
Title: [Hallo Welt] {ex:title @de}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **English Document** - passes (title language is en)
2. **Invalid Document** - fails (title language is de, not allowed)

## 🔍 Test Validation

```bash
ig-cli validate ./constraints/language.demo.md
```






{=}



<a id="constraints-uniquelang.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:uniqueLang/>

# Unique Languages Demo {=ex:demo .Container} 

### Unique Language Example Shape {=ex:UniqueLangExampleShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with unique **language** {+ex:TitleProperty ?sh:property sh:name}.

**Each language tag must appear only once** {=ex:TitleProperty .sh:PropertyShape sh:message} requires [title] {+ex:title ?sh:path} values to have [true] {sh:uniqueLang ^^xsd:boolean}.

---

### Test Data {=ex:data .Container}

#### Valid Document {=ex:ValidNode ?member}
Title: [Hello World] {ex:title @en}
Title: [Bonjour Monde] {ex:title @fr}

#### Invalid Document {=ex:InvalidNode ?member}
Title: [Hello World] {ex:title @en}
Title: [Hola Mundo] {ex:title @en}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results

1. **Valid Document** - passes (unique language tags)
2. **Invalid Document** - fails (duplicate en language tag)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/uniqueLang.demo.md
```

***






{=}



<a id="constraints-hasvalue.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:hasvalue/>

# Has Value Demo {=ex:demo .Container} 

## System Status Test Shape {=ex:SystemStatusTestShape .sh:NodeShape label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with active **status** {+#statusRequired ?sh:property sh:name}.

**Status must be active** {=#statusRequired .sh:PropertyShape sh:message} requires [status] {+ex:status ?sh:path} to be exactly [active] {sh:hasValue ^^xsd:string}.

---

### Test Data {=ex:data .Container}

#### Valid Server {=ex:MainServer ?member}
Status: [active] {ex:status}

#### Invalid Server {=ex:BackupServer ?member}
Status: [standby] {ex:status}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results 

1. **Valid Server** - passes (status is active)
2. **Invalid Server** - fails (status is standby, not active)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/hasvalue.demo.md
```

---






{=}



<a id="constraints-node.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:node/>

# Node Demo {=ex:demo .Container}

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Employee** - passes (address conforms to AddressShape)
2. **Invalid Employee** - fails (address doesn't conform to AddressShape)

## 🔍 Test Validation

```bash
ig-cli validate ./constraints/node.demo.md
```

---






{=}



<a id="constraints-in.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:in/>

# Value Enumeration Demo {=ex:demo .Container} 


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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results 

1. **Valid Employee** - passes (status is Active)
2. **Invalid Employee** - fails (status is Pending, not allowed)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/in.demo.md
```

---






{=}



<a id="constraints-qualifiedcount.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:qualified/>

# Qualified Count Demo {=ex:demo}

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Employee** - passes (1 work email)
2. **Invalid Employee** - fails (0 work emails)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/qualifiedCount.demo.md
```

---






{=}



<a id="constraints-closed.demo"></a>

[cat] <https://mdld.js.org/shacl/catalog/>
[schema] <http://schema.org/>
[ex] <tag:my@example.org,2026:closed/>


# Closed World Constraint {=ex:demo .Container}

## Demo 

This demo demonstrates closed world validation using person data.

### Person Data Demo

**Only declared properties allowed** {=ex:ClosedExampleShape .sh:NodeShape label} targets [ValidPerson] {+ex:ValidPerson ?sh:targetNode} and [InvalidPerson] {+ex:InvalidPerson ?sh:targetNode} with **no additional properties** {sh:closed} constraint except [Name] {+ex:NameProperty ?sh:property sh:name} and [Age] {+ex:AgeProperty ?sh:property sh:name}.

**Person must have a name** {=ex:NameProperty .sh:PropertyShape  sh:message} ensures [name] {+schema:name ?sh:path} is [string] {+xsd:string ?sh:datatype} and [1] {sh:minCount ^^xsd:integer}.

**Person must have exactly one age** {=ex:AgeProperty .sh:PropertyShape sh:message} ensures [age] {+ex:age ?sh:path} is [integer] {+xsd:integer ?sh:datatype} and exactly [1] {sh:minCount sh:maxCount ^^xsd:integer}.

### 📋 Test Data {=ex:data .Container}

#### Valid Person {=ex:ValidPerson}

Person with only declared properties.

Name: [John Doe] {schema:name ^^xsd:string}
Age: [30] {ex:age ^^xsd:integer}

#### Invalid Person {=ex:InvalidPerson}

Person with undeclared property (violates closed world constraint).

Name: [Jane Smith] {schema:name ^^xsd:string}
Age: [25] {ex:age ^^xsd:integer}
Email: [<jane@example.com>] {ex:email}  # Undeclared property

***

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Person** - passes (only declared properties: name, age ✓)
2. **Invalid Person** - fails once (has undeclared property: email ✗)

### 🔍 Test Validation

```bash
# This should show 1 violation - InvalidPerson has undeclared email property
ig-cli validate ./constraints/closed.demo.md
```

***






{=}



<a id="constraints-deactivated.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:deactivated/>

# Deactivated Demo {=ex:demo .Container}

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Account** - passes (status is active)
2. **Invalid Account** - fails (status is inactive)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/deactivated.demo.md
```

---






{=}



<a id="constraints-severity.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:range/>


# Severity Levels Demo {=ex:demo .Container} 

This demo demonstrates severity levels and custom messages using user account validation.

### User Account Validation Demo

The **User Validation Shape** {=ex:UserValidationShape .sh:NodeShape label} targets all [users] {+ex:User ?sh:targetClass} to validate account requirements with different severity levels: critical **email** {+ex:CriticalRule ?sh:property sh:name}, warning **age** {+ex:WarningRule ?sh:property sh:name} and info **name** {+ex:InfoNameRule ?sh:property sh:name}.

**Email address is required and must be valid** {=ex:CriticalRule .sh:PropertyShape sh:message} that requires [email] {+ex:email ?sh:path} to be [string] {+xsd:string ?sh:datatype} and at least [1] {sh:minCount ^^xsd:integer} corporate email [example.com] {sh:pattern} with [Violation severity] {+sh:Violation ?sh:severity}.

**Age should be between 18 and 120** {=ex:WarningRule .sh:PropertyShape sh:message} that requires [age] {+ex:age ?sh:path} to be [integer] {+xsd:integer ?sh:datatype}, more than [18] {sh:minInclusive ^^xsd:integer} and less than [120] {sh:maxInclusive ^^xsd:integer} with [Warning severity] {+sh:Warning ?sh:severity}.

**Name should be a string of 2+ letters** {=ex:InfoNameRule .sh:PropertyShape sh:message} that requires [name] {+ex:name ?sh:path} to be [string] {+xsd:string ?sh:datatype} at least [1] {sh:minCount} and longer than [3] {sh:minInclusive} with [Info severity] {+sh:Info ?sh:severity}.

### 📋 Test Data {=ex:data .Container}

#### Valid User {=ex:ValidUser .ex:User}

User with complete valid information.

Email: [user@example.com] {ex:email}
Age: [25] {ex:age ^^xsd:integer}
Name: [John Doe] {ex:name}

#### Invalid User {=ex:InvalidUser .ex:User}

User with multiple issues at different severity levels.

Email: [invalid-email] {ex:email}  # Critical violation
Age: [150] {ex:age ^^xsd:integer}  # Warning violation
Name: [] {ex:name}  # Info violation (empty string)

---

[This demo] {=ex:demo} must produce exactly **3** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results

1. **Valid User** - passes (has valid email, reasonable age, and name ✓)
2. **Invalid User** - fails three times:
   - **Critical**: Email is invalid format ✗
   - **Warning**: Age is unusually high ✗  
   - **Info**: Name is missing ✗

### 🔍 Test Validation

```bash
# This should show 3 violations with different severity levels
ig-cli validate ./constraints/severity.demo.md
```

---






{=}



<a id="constraints-message.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:message/>

# Violation Message Demo {=ex:demo .Container} 

## Business Rule Validation Shape {=ex:BusinessRuleValidationShape .sh:NodeShape  label}

Validates all [member] {+member ?sh:targetObjectsOf} entities with positive **contract** {+ex:ContractValueRule ?sh:property sh:name}.

**Contract value must be positive** {=ex:ContractValueRule .sh:PropertyShape sh:message} ensures [contract value] {+ex:contractValue ?sh:path} is greater than [0] {sh:minInclusive ^^xsd:decimal}.

---

## Test Data {=ex:data .Container}

### Valid Contract {=ex:ValidContract ?member}
Value: [50000.00] {ex:contractValue ^^xsd:decimal}

### Invalid Contract {=ex:InvalidContract ?member}
Value: [-1000.00] {ex:contractValue ^^xsd:decimal}

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Contract** - passes (positive value)
2. **Invalid Contract** - fails (negative value)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/message.demo.md
```

---






{=}



<a id="constraints-js.demo"></a>

[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <tag:my@example.org,2026:js/>

# JavaScript Function Demo {=ex:demo .Container} 

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

---

[Demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

## Expected Validation Results

1. **Valid Event** - passes (valid date string)
2. **Invalid Event** - fails (not a valid date)

### 🔍 Test Validation

```bash
ig-cli validate ./constraints/js.demo.md
```

---
