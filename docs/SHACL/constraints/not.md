[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/not/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# NOT Constraint {=sh:not .class:LogicalConstraint label}

> Requires value nodes to NOT conform to a given shape. Essential for negation patterns and exclusion rules. {comment}

<http://www.w3.org/ns/shacl#not> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

This demo demonstrates logical NOT constraint using forbidden status validation scenario.

### Forbidden Status Demo

The **User Status Shape** {=ex:UserStatusShape .sh:NodeShape ?cat:hasShape label} targets all [users] {+ex:User ?sh:targetClass} to validate forbidden status: **User cannot have deleted status** {sh:message}

User status must not conform to the forbidden shape using sh:not: [Forbidden Status Shape] {+ex:ForbiddenStatusShape ?sh:not}.

**Forbidden Status Shape** {=ex:ForbiddenStatusShape .sh:NodeShape} requires the [status] {+ex:status ?sh:path} property to be exactly [deleted] {sh:hasValue}.

{=ex:demo}

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid User - Active {=ex:ValidActiveUser .ex:User}

A valid user with active status.

Name: [Alice] {ex:name}
Status: [active] {ex:status}

#### Valid User - Inactive {=ex:ValidInactiveUser .ex:User}

A valid user with inactive status.

Name: [Bob] {ex:name}
Status: [inactive] {ex:status}

#### Invalid User - Deleted {=ex:InvalidDeletedUser .ex:User}

An invalid user with deleted status (forbidden).

Name: [Charlie] {ex:name}
Status: [deleted] {ex:status}

#### Valid User - No Status {=ex:ValidNoStatusUser .ex:User}

A valid user with no status (doesn't match forbidden shape).

Name: [Dana] {ex:name}

---

[This demo] {=ex:demo} must produce exactly **1** {cat:expectsViolations ^^xsd:integer} violation.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid User - Active** - passes (status: active ≠ deleted)
2. **Valid User - Inactive** - passes (status: inactive ≠ deleted)  
3. **Invalid User - Deleted** - fails once (status: deleted = forbidden)
4. **Valid User - No Status** - passes (no status property, doesn't match forbidden shape)

Note: sh:not only validates nodes that would conform to the forbidden shape.

### 🔍 Test Validation

```bash
# This should show 1 violation - user with deleted status
ig-cli validate ./constraints/not.md
```

---

## 📝 MDLD Syntax Patterns

**Use cases:**
- **Forbidden values** - status cannot be "deleted" or "blocked"
- **Exclusion rules** - users cannot be in certain categories
- **Negation patterns** - documents cannot have "draft" and "published" simultaneously
- **Business rules** - orders cannot have "cancelled" and "shipped" status
- **Data quality** - records cannot have "test" or "demo" identifiers

**Key advantages:**
- ✅ **Exclusion validation** - clearly defines forbidden conditions
- ✅ **Business rules** - models real-world prohibition scenarios
- ✅ **Data integrity** - prevents invalid states
- ✅ **Flexible shapes** - can negate any constraint shape
- ✅ **Clear semantics** - unambiguous exclusion logic

---

## 🔧 Technical Notes

### **Logical Behavior:**
- `sh:not` succeeds if the value node does NOT conform to the given shape
- Only validates nodes that would conform to the negated shape
- Works with any shape type (NodeShape, PropertyShape)
- Can negate complex constraint combinations

### **SHACL Behavior:**
- Creates a validation context for the negated shape
- Violations only reported for nodes conforming to negated shape
- Performance depends on complexity of negated shape
- Can be nested within other logical constraints

### **Best Practices:**
- Keep negated shapes simple and focused
- Use descriptive names for forbidden shapes
- Test the negated shape independently first
- Document exclusion rules clearly in comments
- Consider using sh:and for multiple exclusion conditions
