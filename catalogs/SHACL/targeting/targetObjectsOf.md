[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Target Objects Of {=sh:targetObjectsOf .class:TargetingMechanism label}

> Targets all objects (values) that are pointed to by a specific property. Ideal for validating referenced entities, relationship targets, and entities that are the destination of relationships. {comment}

<http://www.w3.org/ns/shacl#targetObjectsOf> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates object-based targeting using team membership and product reference scenarios where we validate entities that are referenced by others.

### Team Membership Demo

The **Team Member Validation Shape** {=ex:TeamMemberValidationShape .sh:NodeShape ?cat:hasShape label} targets all [team members] {+ex:memberOf ?sh:targetObjectsOf} to validate team membership requirements.

**Workload Rule** {=ex:#workloadRule .sh:PropertyShape ?sh:property} requires the [workload] {+ex:workload ?sh:path} property to be at most [40] {sh:maxInclusive ^^xsd:integer}: **Team members must not exceed 40 hours workload** {sh:message}

[The shape] {=ex:TeamMemberValidationShape} also has **Active Status Rule** {=ex:#activeStatus .sh:PropertyShape ?sh:property} that requires the [status] {+ex:status ?sh:path} property to be exactly [active] {sh:hasValue}: **Team members must be active** {sh:message}

### Product Reference Demo

**Referenced Product Validation Shape** {=ex:ReferencedProductValidationShape .sh:NodeShape ?cat:hasShape label} targets all [referenced products] {+ex:references ?sh:targetObjectsOf} to validate product reference requirements.

**Product Availability Rule** {=ex:#productAvailability .sh:PropertyShape ?sh:property} requires the [available] {+ex:available ?sh:path} property to be exactly [true] {sh:hasValue}: **Referenced products must be available** {sh:message}

{=ex:ReferencedProductValidationShape} also has **Product Price Rule** {=ex:#productPrice .sh:PropertyShape ?sh:property} that requires the [price] {+ex:price ?sh:path} property to be at most [1000.00] {sh:maxInclusive ^^xsd:decimal}: **Referenced products must cost $1000 or less** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Senior Developer {=ex:SeniorDeveloper}

A team member with excessive workload and inactive status.

Workload: [45] {ex:workload ^^xsd:integer}
Status: [inactive] {ex:status}
Member Of: [EngineeringTeam] {ex:memberOf}

#### Junior Developer {=ex:JuniorDeveloper}

A team member with appropriate workload and active status.

Workload: [35] {ex:workload ^^xsd:integer}
Status: [active] {ex:status}
Member Of: [EngineeringTeam] {ex:memberOf}

#### Manager {=ex:Manager}

A manager who manages the team (not targeted as team member).

Workload: [50] {ex:workload ^^xsd:integer}
Status: [active] {ex:status}

#### Expensive Product {=ex:ExpensiveProduct}

A product that's too expensive and unavailable.

Price: [1500.00] {ex:price ^^xsd:decimal}
Available: [false] {ex:available}
Referenced By: [Order123] {ex:references}

#### Affordable Product {=ex:AffordableProduct}

A product that meets all requirements.

Price: [299.99] {ex:price ^^xsd:decimal}
Available: [true] {ex:available}
Referenced By: [Order456] {ex:references}

#### Unreferenced Product {=ex:UnreferencedProduct}

A product not referenced by any order (not targeted).

Price: [500.00] {ex:price ^^xsd:decimal}
Available: [true] {ex:available}

---

{=ex:demo} must produce exactly **4** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

#### Team Membership Validation (objects of memberOf):
1. **Senior Developer** - fails twice (workload 45 > 40 AND status: inactive ≠ active)
2. **Junior Developer** - passes (workload 35 ≤ 40 AND status: active)
3. **Manager** - not validated (not a team member, manages the team)

#### Product Reference Validation (objects of references):
4. **Expensive Product** - fails twice (price 1500.00 > 1000.00 AND available: false ≠ true)
5. **Affordable Product** - passes (price 299.99 ≤ 1000.00 AND available: true)
6. **Unreferenced Product** - not validated (not referenced by any order)

Note: Object-based targeting validates entities that are referenced by others, making it ideal for team membership, product references, and destination validation scenarios.

### 🔍 Test Validation

```bash
# This should show 4 violations - workload, status, price, and availability
ig-cli validate ./targeting/targetObjectsOf.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for object-based targeting:**

```md
# Target all entities that are referenced by this property
{+ex:memberOf ?sh:targetObjectsOf}
{+ex:references ?sh:targetObjectsOf}
{+ex:partOf ?sh:targetObjectsOf}
{+ex:locatedIn ?sh:targetObjectsOf}
```

**Use cases:**
- **Team membership** - validate all members of teams
- **Product references** - validate all referenced products
- **Component validation** - validate all parts of assemblies
- **Location validation** - validate all entities in locations
- **Destination validation** - validate targets of relationships

**Key advantages:**
- ✅ **Reference validation** - validates entities that are referenced
- ✅ **Relationship targets** - focuses on destination entities
- ✅ **Dependency validation** - ensures referenced entities meet requirements
- ✅ **Membership validation** - validates all members of collections
- ✅ **Quality assurance** - validates referenced quality standards

---

## 🎯 Real-World Examples

### **Teams:**
```md
# All team members must meet requirements
{+org:memberOf ?sh:targetObjectsOf}
{+org:participantIn ?sh:targetObjectsOf}
```

### **Products:**
```md
# All referenced products must be available
{+catalog:references ?sh:targetObjectsOf}
{+inventory:contains ?sh:targetObjectsOf}
```

### **Components:**
```md
# All parts must meet specifications
{+manufacturing:contains ?sh:targetObjectsOf}
{+assembly:includes ?sh:targetObjectsOf}
```

### **Locations:**
```md
# All located entities must meet requirements
{+geo:locatedIn ?sh:targetObjectsOf}
{+facility:contains ?sh:targetObjectsOf}
```
