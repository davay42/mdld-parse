[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/hasvalue/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Has Value {=sh:hasValue .class:Constraint label}

> Requires a property to have exactly this specific value - useful for fixed status fields, required constants, or mandatory identifiers. {comment}

<http://www.w3.org/ns/shacl#hasValue> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

The **System Status Test Shape** {=ex:SystemStatusTestShape .sh:NodeShape ?cat:hasShape label} validates all [member] {+member ?sh:targetObjectsOf} entities of the test data container to demonstrate hasValue constraints for mandatory system properties.

**Status Required Rule** {=ex:#statusRequired .sh:PropertyShape ?sh:property} requires the [status] {+ex:status ?sh:path} property to be exactly [active] {sh:hasValue}: **Main server must have active status** {sh:message}

[Test Shape] {=ex:SystemStatusTestShape} also has **Environment Required Rule** {=ex:#environmentRequired .sh:PropertyShape ?sh:property} that requires the [environment] {+ex:environment ?sh:path} property to be exactly [production] {sh:hasValue}: **Main server must be in production environment** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Main Server {=ex:MainServer ?member}

The primary production server that must meet all requirements.

Status: [active] {ex:status}
Environment: [production] {ex:environment}
Version: [1.2.3] {ex:version}

#### Backup Server {=ex:BackupServer ?member}

A secondary server that fails status requirement.

Status: [standby] {ex:status}
Environment: [production] {ex:environment}
Version: [1.2.3] {ex:version}

#### Development Server {=ex:DevelopmentServer ?member}

A dev server that fails environment requirement.

Status: [active] {ex:status}
Environment: [development] {ex:environment}
Version: [1.2.4] {ex:version}

---

{=ex:demo} must produce exactly **2** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Main Server** - passes (has active status AND production environment)
2. **Backup Server** - fails once (status is standby, not active)
3. **Development Server** - fails once (environment is development, not production)

Note: Container member targeting with proper member annotations ensures all servers are validated. HasValue constraints enforce exact value matches for mandatory properties.

### 🔍 Test Validation

```bash
# This should show 2 violations - status and environment failures
ig-cli validate ./constraints/hasvalue.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for hasValue constraints:**

1. Use `sh:targetNode` for direct entity targeting
2. Apply current subject redeclaration for multiple PropertyShapes
3. Use literal values for hasValue constraints
4. Combine multiple hasValue rules for comprehensive validation

**Key advantages:**
- ✅ **Exact value matching** - no ambiguity
- ✅ **Mandatory constants** - enforce required states
- ✅ **Status validation** - ensure proper system states
- ✅ **Identifier verification** - validate fixed identifiers

---

## 🎯 Use Cases

- **System status validation** - ensure services are in required states
- **Configuration verification** - validate mandatory settings
- **Environment enforcement** - ensure proper deployment environments
- **Version constraints** - validate specific required versions
- **Access level validation** - ensure proper permission levels
