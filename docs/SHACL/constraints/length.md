[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/length/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Min Length {=sh:minLength .class:Constraint label}

> Specifies the minimum length of string values - useful for password requirements, username validation, or content length limits. {comment}

<http://www.w3.org/ns/shacl#minLength> {?cat:fullIRI}

# Max Length {=sh:maxLength .class:Constraint label}

> Specifies the maximum length of string values - useful for field size limits, message length restrictions, or data entry constraints. {comment}

<http://www.w3.org/ns/shacl#maxLength> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

The **User Account Test Shape** {=ex:UserAccountTestShape .sh:NodeShape ?cat:hasShape label} validates all [member] {+member ?sh:targetObjectsOf} entities of the test data container to demonstrate length constraints.

**Username Length Rule** {=ex:#usernameLength .sh:PropertyShape ?sh:property} requires the [username] {+ex:username ?sh:path} property to have at least [3] {sh:minLength ^^xsd:integer} and at most [20] {sh:maxLength ^^xsd:integer} characters: **Username must be 3-20 characters long** {sh:message}

[Test Shape] {=ex:UserAccountTestShape} declares the **Password Length Rule** {=ex:#passwordLength .sh:PropertyShape ?sh:property} that requires the [password] {+ex:password ?sh:path} property to have at least [8] {sh:minLength ^^xsd:integer} characters: **Password must be at least 8 characters long** {sh:message}

[Test Shape] {=ex:UserAccountTestShape} also has **Bio Length Rule** {=ex:#bioLength .sh:PropertyShape ?sh:property} that requires the [bio] {+ex:bio ?sh:path} property to have at most [200] {sh:maxLength ^^xsd:integer} characters: **Bio must be at most 200 characters long** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid User {=ex:ValidUser ?member}

A user with properly sized fields.

Username: [john_doe] {ex:username}
Password: [securepass123] {ex:password}
Bio: [Software developer with 5 years of experience in web technologies] {ex:bio}

#### Invalid User - Short Username {=ex:InvalidUserShort ?member}

A user with username that's too short.

Username: [jd] {ex:username}
Password: [securepass123] {ex:password}
Bio: [Software developer] {ex:bio}

#### Invalid User - Long Username {=ex:InvalidUserLong ?member}

A user with username that's too long.

Username: [this_username_is_way_too_long_for_the_system] {ex:username}
Password: [securepass123] {ex:password}
Bio: [Software developer] {ex:bio}

#### Invalid User - Short Password {=ex:InvalidUserPassword ?member}

A user with password that's too short.

Username: [john_doe] {ex:username}
Password: [short] {ex:password}
Bio: [Software developer] {ex:bio}

#### Invalid User - Long Bio {=ex:InvalidUserBio ?member}

A user with bio that's too long.

Username: [john_doe] {ex:username}
Password: [securepass123] {ex:password}
Bio: [Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.] {ex:bio}

---

{=ex:demo} must produce exactly **4** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid User** - passes (all length constraints satisfied)
2. **Invalid User - Short Username** - fails once (username too short: 2 < 3)
3. **Invalid User - Long Username** - fails once (username too long: 33 > 20)
4. **Invalid User - Short Password** - fails once (password too short: 5 < 8)
5. **Invalid User - Long Bio** - fails once (bio too long: > 200 characters)

Note: Length constraints enforce string size limits for usernames, passwords, and bio fields. Both minLength and maxLength can be used together or separately.

### 🔍 Test Validation

```bash
# This should show 4 violations - various length constraint failures
ig-cli validate ./constraints/length.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for length constraints:**

1. Use container member targeting for comprehensive validation
2. Apply inline subject redeclaration for multiple PropertyShapes
3. Combine minLength and maxLength in single PropertyShape when needed
4. Use integer literals with xsd:integer datatype for bounds

**Key advantages:**
- ✅ **String size validation** - enforce minimum and maximum lengths
- ✅ **Input validation** - prevent too short or too long entries
- ✅ **User experience** - ensure appropriate field sizes
- ✅ **Data quality** - maintain consistent string lengths

---

## 🎯 Use Cases

- **Username validation** - enforce reasonable username lengths
- **Password policies** - ensure minimum password complexity
- **Content limits** - restrict post/comment/message sizes
- **Form validation** - enforce field size requirements
- **Database constraints** - match column length limits
- **API validation** - ensure request payload sizes
