[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/targeting/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Target Node {=sh:targetNode .class:TargetingMechanism label}

> Targets specific individual nodes identified by their IRI for precise, node-by-node validation. Perfect for critical infrastructure, testing scenarios, and executive-level validation. {comment}

<http://www.w3.org/ns/shacl#targetNode> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates node-based targeting using critical infrastructure and executive validation scenarios.

### Critical Infrastructure Demo

The **Database Validation Shape** {=ex:DatabaseValidationShape .sh:NodeShape ?cat:hasShape label} targets the [Main Database] {+ex:MainDatabase ?sh:targetNode} for critical infrastructure validation.

**Database Status Rule** {=ex:#databaseStatus .sh:PropertyShape ?sh:property} requires the [status] {+ex:status ?sh:path} property to be exactly [online] {sh:hasValue}: **Main database must be online** {sh:message}

[The shape] {=ex:DatabaseValidationShape} also has **Database Uptime Rule** {=ex:#databaseUptime .sh:PropertyShape ?sh:property} that requires the [uptime] {+ex:uptime ?sh:path} property to be at least [99.9] {sh:minInclusive ^^xsd:decimal}: **Database uptime must be at least 99.9%** {sh:message}

### Executive Validation Demo

**CEO Validation Shape** {=ex:CEOValidationShape .sh:NodeShape ?cat:hasShape label} targets the [CEO] {+ex:CEO ?sh:targetNode} for executive-level validation.

**Executive Clearance Rule** {=ex:#executiveClearance .sh:PropertyShape ?sh:property} requires the [securityClearance] {+ex:securityClearance ?sh:path} property to be exactly [top-secret] {sh:hasValue}: **CEO must have top-secret security clearance** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Main Database {=ex:MainDatabase}

Critical infrastructure that should be online with high uptime.

Status: [offline] {ex:status}
Uptime: [95.5] {ex:uptime ^^xsd:decimal}

#### Backup Database {=ex:BackupDatabase}

Secondary infrastructure (not targeted by node-based validation).

Status: [online] {ex:status}
Uptime: [99.8] {ex:uptime ^^xsd:decimal}

#### CEO {=ex:CEO}

The chief executive with proper clearance.

Security Clearance: [top-secret] {ex:securityClearance}

#### CFO {=ex:CFO}

The chief financial officer (not targeted by CEO-specific validation).

Security Clearance: [secret] {ex:securityClearance}

---

{=ex:demo} must produce exactly **3** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Main Database** - fails twice (status: offline ≠ online AND uptime: 95.5% < 99.9%)
2. **Backup Database** - not validated (not targeted by specific node validation)
3. **CEO** - passes (has top-secret clearance as required)
4. **CFO** - not validated (not targeted by CEO-specific validation)

Note: Node-based targeting provides precise control over which specific entities get validated, making it ideal for critical infrastructure and executive validation.

### 🔍 Test Validation

```bash
# This should show 3 violations - database status, uptime, and CEO clearance
ig-cli validate ./targeting/targetNode.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for node-based targeting:**

```md
# Target specific individual nodes
{+ex:SpecificEntity ?sh:targetNode}
{+ex:CriticalSystem ?sh:targetNode}
{+ex:ExecutivePosition ?sh:targetNode}
```

**Use cases:**
- **Critical infrastructure** - validate specific servers, databases, systems
- **Executive validation** - validate CEO, CFO, other key positions
- **Testing scenarios** - validate specific test data entities
- **Business constants** - validate specific business rules entities
- **Compliance checkpoints** - validate specific regulatory entities

**Key advantages:**
- ✅ **Precise targeting** - validates exactly what you specify
- ✅ **Critical focus** - ideal for high-value, high-risk entities
- ✅ **Testing efficiency** - validate specific test cases
- ✅ **Executive oversight** - ensure key positions meet requirements
- ✅ **Infrastructure monitoring** - validate critical systems status

---

## 🎯 Real-World Examples

### **Infrastructure:**
```md
# Critical production systems
{+infra:MainDatabase ?sh:targetNode}
{+infra:PaymentGateway ?sh:targetNode}
{+infra:AuthServer ?sh:targetNode}
```

### **Executive:**
```md
# C-suite validation
{+exec:CEO ?sh:targetNode}
{+exec:CFO ?sh:targetNode}
{+exec:CTO ?sh:targetNode}
```

### **Compliance:**
```md
# Regulatory entities
{+compliance:GDPRController ?sh:targetNode}
{+compliance:SOXCompliance ?sh:targetNode}
```

### **Testing:**
```md
# Test data validation
{+test:ValidTestCase ?sh:targetNode}
{+test:InvalidTestCase ?sh:targetNode}
```
