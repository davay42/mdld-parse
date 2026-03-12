[mdld] <https://mdld.js.org/>
[cat] <mdld:shacl/>
[ex] <mdld:shacl/example/range/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Minimum Inclusive {=sh:minInclusive .class:Constraint label}

> Specifies the minimum inclusive value for range constraints - the value must be greater than or equal to this bound. Works with numbers, dates, times, and other ordered datatypes. {comment}

<http://www.w3.org/ns/shacl#minInclusive> {?cat:fullIRI}

# Maximum Inclusive {=sh:maxInclusive .class:Constraint label}

> Specifies the maximum inclusive value for range constraints - the value must be less than or equal to this bound. Works with numbers, dates, times, and other ordered datatypes. {comment}

<http://www.w3.org/ns/shacl#maxInclusive> {?cat:fullIRI}

# Minimum Exclusive {=sh:minExclusive .class:Constraint label}

> Specifies the minimum exclusive value for range constraints - the value must be greater than this bound. Works with numbers, dates, times, and other ordered datatypes. {comment}

<http://www.w3.org/ns/shacl#minExclusive> {?cat:fullIRI}

# Maximum Exclusive {=sh:maxExclusive .class:Constraint label}

> Specifies the maximum exclusive value for range constraints - the value must be less than this bound. Works with numbers, dates, times, and other ordered datatypes. {comment}

<http://www.w3.org/ns/shacl#maxExclusive> {?cat:fullIRI}

---

## Demo {=ex:demo ?cat:hasDemo}

The **Event Management Test Shape** {=ex:EventTestShape .sh:NodeShape ?cat:hasShape label} validates all [member] {+member ?sh:targetObjectsOf} entities of the test data container to demonstrate comprehensive range constraints across multiple datatypes for event management scenarios.

**Ticket Price Range Rule** {=ex:#priceRange .sh:PropertyShape ?sh:property} ensures the [ticketPrice] {+ex:price ?sh:path} property follows standard event pricing guidelines by being at least [10.00] {sh:minInclusive ^^xsd:decimal} (minimum viable ticket price) and at most [1000.00] {sh:maxInclusive ^^xsd:decimal} (premium event cap): **Event ticket prices must be between $10.00 and $1000.00 inclusive for fair pricing** {sh:message}

[Test Shape] {=ex:EventTestShape} declares the **Attendee Age Restriction Rule** {=ex:#ageRange .sh:PropertyShape ?sh:property} that enforces legal and safety requirements by requiring the [attendeeAge] {+ex:age ?sh:path} property to be greater than [18] {sh:minExclusive ^^xsd:integer} (legal adult age) and less than [65] {sh:maxExclusive ^^xsd:integer} (senior discount eligibility): **Event attendees must be strictly between 18 and 65 years old for age-restricted events** {sh:message}

[Test Shape] {=ex:EventTestShape} also has **Event Scheduling Window Rule** {=ex:#eventDate .sh:PropertyShape ?sh:property} that validates the [eventDate] {+ex:eventDate ?sh:path} property falls within the current planning cycle by being at least [2024-01-01] {sh:minInclusive ^^xsd:date} (start of fiscal year) and at most [2025-12-31] {sh:maxInclusive ^^xsd:date} (end of planning horizon): **Events must be scheduled within the 2024-2025 planning period for proper resource allocation** {sh:message}

[Test Shape] {=ex:EventTestShape} also has **Registration Deadline Rule** {=ex:#registrationDeadline .sh:PropertyShape ?sh:property} that ensures proper advance planning by requiring the [registrationDeadline] {+ex:registrationDeadline ?sh:path} property to be greater than [2024-12-31T23:59:59Z] {sh:minExclusive ^^xsd:dateTime} (end of current year): **Registration deadlines must be set after December 31, 2024 to allow adequate preparation time** {sh:message}

---

### 📋 Test Data {=ex:data .Container ?cat:hasData}

#### Valid Event {=ex:ValidEvent ?member}

A perfectly configured conference event with all values within approved business ranges - standard pricing, adult attendee age, current fiscal year scheduling, and proper advance registration deadline.

Ticket Price: [99.99] {ex:price ^^xsd:decimal}
Attendee Age: [25] {ex:age ^^xsd:integer}
Event Date: [2024-06-15] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Budget Price Violation {=ex:InvalidEventLowPrice ?member}

A community workshop priced below the minimum viable ticket price threshold, violating standard event pricing guidelines.

Ticket Price: [5.99] {ex:price ^^xsd:decimal}
Attendee Age: [25] {ex:age ^^xsd:integer}
Event Date: [2024-06-15] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Premium Price Violation {=ex:InvalidEventHighPrice ?member}

An exclusive gala event priced above the maximum premium event cap, exceeding standard pricing guidelines.

Ticket Price: [1500.00] {ex:price ^^xsd:decimal}
Attendee Age: [25] {ex:age ^^xsd:integer}
Event Date: [2024-06-15] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Underage Attendee {=ex:InvalidEventYoungAge ?member}

A music festival with age restrictions that incorrectly allows attendees at the minimum legal boundary age.

Ticket Price: [99.99] {ex:price ^^xsd:decimal}
Attendee Age: [18] {ex:age ^^xsd:integer}
Event Date: [2024-06-15] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Senior Age Boundary {=ex:InvalidEventOldAge ?member}

A sports training camp that violates the age restriction by including attendees at the senior discount eligibility boundary.

Ticket Price: [99.99] {ex:price ^^xsd:decimal}
Attendee Age: [65] {ex:age ^^xsd:integer}
Event Date: [2024-06-15] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Historical Scheduling {=ex:InvalidEventEarlyDate ?member}

A retrospective event scheduled before the current fiscal year, violating the planning period constraints.

Ticket Price: [99.99] {ex:price ^^xsd:decimal}
Attendee Age: [25] {ex:age ^^xsd:integer}
Event Date: [2023-12-31] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Future Scheduling {=ex:InvalidEventLateDate ?member}

A technology summit scheduled beyond the planning horizon, exceeding the maximum allowed scheduling window.

Ticket Price: [99.99] {ex:price ^^xsd:decimal}
Attendee Age: [25] {ex:age ^^xsd:integer}
Event Date: [2026-01-01] {ex:eventDate ^^xsd:date}
Registration Deadline: [2025-01-15T10:00:00Z] {ex:registrationDeadline ^^xsd:dateTime}

#### Invalid Event - Insufficient Preparation Time {=ex:InvalidEventEarlyDeadline ?member}

A corporate training event with registration deadline set exactly at the exclusive boundary, not allowing adequate preparation time.

Ticket Price: [99.99] {ex:price ^^xsd:decimal}
Attendee Age: [25] {ex:age ^^xsd:integer}
Event Date: [2024-06-15] {ex:eventDate ^^xsd:date}
Registration Deadline: [2024-12-31T23:59:59Z] {ex:registrationDeadline ^^xsd:dateTime}

---

{=ex:demo} must produce exactly **7** {cat:expectsViolations ^^xsd:integer} violations.

### Expected Validation Results {=ex:results ?cat:hasResults}

1. **Valid Event** - passes (all range constraints satisfied)
2. **Invalid Event - Price Too Low** - fails once (price: 5.99 < 10.00 minInclusive)
3. **Invalid Event - Price Too High** - fails once (price: 1500.00 > 1000.00 maxInclusive)
4. **Invalid Event - Age Too Young** - fails once (age: 18 = 18 minExclusive)
5. **Invalid Event - Age Too Old** - fails once (age: 65 = 65 maxExclusive)
6. **Invalid Event - Date Too Early** - fails once (date: 2023-12-31 < 2024-01-01 minInclusive)
7. **Invalid Event - Date Too Late** - fails once (date: 2026-01-01 > 2025-12-31 maxInclusive)
8. **Invalid Event - Deadline Too Early** - fails once (deadline: 2024-12-31T23:59:59Z = 2024-12-31T23:59:59Z minExclusive)

Note: Inclusive bounds (minInclusive, maxInclusive) include the boundary values, while exclusive bounds (minExclusive, maxExclusive) exclude the boundary values. Range constraints work with any ordered datatype including numbers, dates, times, and strings.

### 🔍 Test Validation

```bash
# This should show 7 violations - various range constraint failures across multiple datatypes
ig-cli validate ./constraints/range.md
```

---

## 📝 MDLD Syntax Patterns

**Recommended pattern for range constraints:**

1. Use container member targeting for comprehensive validation
2. Apply inline subject redeclaration for multiple PropertyShapes
3. Combine minInclusive/maxInclusive for inclusive ranges
4. Use minExclusive/maxExclusive for exclusive ranges
5. Use appropriate datatypes (xsd:decimal, xsd:integer, xsd:date, xsd:dateTime, etc.)

**Supported Ordered Datatypes:**
- **Numeric:** xsd:decimal, xsd:integer, xsd:float, xsd:double
- **Date/Time:** xsd:date, xsd:dateTime, xsd:time, xsd:gYear, xsd:gYearMonth
- **String:** Lexicographic ordering (A-Z, 0-9)

**Key advantages:**
- ✅ **Multi-datatype support** - numbers, dates, times, strings
- ✅ **Inclusive/Exclusive control** - precise boundary behavior
- ✅ **Business rule enforcement** - age limits, price ranges, scheduling
- ✅ **Temporal validation** - event scheduling, deadline management

---

## 🎯 Use Cases

### **Numeric Ranges**
- **Price validation** - enforce product pricing ranges
- **Age restrictions** - validate user age requirements
- **Inventory management** - ensure non-negative stock levels
- **Score ranges** - validate test scores or ratings
- **Financial constraints** - validate transaction amounts

### **Date/Time Ranges**
- **Event scheduling** - ensure events are within valid date ranges
- **Registration periods** - validate signup deadlines
- **Expiration dates** - check product/service validity
- **Booking windows** - enforce reservation timeframes
- **Compliance dates** - validate regulatory deadlines
- **Historical constraints** - ensure dates are within historical periods

### **String Ranges**
- **Alphabetical ordering** - validate code sequences
- **Version ranges** - enforce version string ordering
- **Identifier ranges** - validate ID ranges lexicographically
