[edu] <tag:education@example.org,2026:>
[prov] <http://www.w3.org/ns/prov#>
[foaf] <http://xmlns.com/foaf/0.1/>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[course] <tag:course@example.org,2026:>

### 2026-01-15T08:00:00Z {=edu:course-s2026 .prov:Activity prov:startedAtTime ^^xsd:dateTime}

# Introduction to Semantic Web Technologies {=edu:course-s2026 .edu:Course rdfs:label}
A comprehensive course covering RDF, OWL, and SPARQL fundamentals for graduate students.

## Course Instructor {=edu:instructor-1 .foaf:Person}
**Dr. Emily Rodriguez** {edu:instructor-1 foaf:name}
Contact: [emily.rodriguez@example.org] {edu:instructor-1 foaf:mbox}
Office Hours: [Wednesdays 2-4pm] {edu:instructor-1 edu:officeHours}

## Course Modules {=edu:modules .prov:Collection}

### Module 1: RDF Fundamentals {=edu:module1 .edu:Module rdfs:label}
Introduction to Resource Description Framework and RDF syntax.
Prerequisites: None
Duration: [3 weeks] {edu:module1 edu:duration}

### Module 2: OWL and Ontologies {=edu:module2 .edu:Module rdfs:label}
Web Ontology Language and knowledge representation.
Prerequisites: [Module 1] {+edu:module1 ?edu:prerequisite}
Duration: [4 weeks] {edu:module2 edu:duration}

### Module 3: SPARQL Query Language {=edu:module3 .edu:Module rdfs:label}
Querying RDF data with SPARQL.
Prerequisites: [Module 2] {+edu:module2 ?edu:prerequisite}
Duration: [3 weeks] {edu:module3 edu:duration}

## Enrolled Students {=edu:students .prov:Collection}

### Student 1 {=edu:student-1 .foaf:Person}
**Alice Johnson** {edu:student-1 foaf:name}
Email: [alice.j@example.org] {edu:student-1 foaf:mbox}
Enrollment Date: [2026-01-20] {edu:student-1 edu:enrollmentDate ^^xsd:date}
Student ID: [S2026-001] {edu:student-1 edu:studentId}

### Student 2 {=edu:student-2 .foaf:Person}
**Bob Smith** {edu:student-2 foaf:name}
Email: [bob.smith@example.org] {edu:student-2 foaf:mbox}
Enrollment Date: [2026-01-22] {edu:student-2 edu:enrollmentDate ^^xsd:date}
Student ID: [S2026-002] {edu:student-2 edu:studentId}

## Student Enrollment Statements {=edu:enrollment-statements .rdf:Statement}

### Alice Enrolled in Course {=edu:enrollment-1 .rdf:Statement}
**Alice Johnson** {+edu:student-1 ?rdf:subject} *enrolled in* {+edu:enrolledIn ?rdf:predicate} **Introduction to Semantic Web Technologies** {+edu:course-s2026 ?rdf:object} on [2026-01-20] {edu:enrollmentDate ^^xsd:date}.

### Bob Enrolled in Course {=edu:enrollment-2 .rdf:Statement}
**Bob Smith** {+edu:student-2 ?rdf:subject} *enrolled in* {+edu:enrolledIn ?rdf:predicate} **Introduction to Semantic Web Technologies** {+edu:course-s2026 ?rdf:object} on [2026-01-22] {edu:enrollmentDate ^^xsd:date}.

---

### 2026-02-01T09:00:00Z {=edu:module1-start .prov:Activity prov:startedAtTime ^^xsd:dateTime}

## Module 1 Progress Tracking

### Alice Started Module 1 {=edu:activity-1 .rdf:Statement}
**Alice Johnson** {+edu:student-1 ?rdf:subject} *started* {+edu:started ?rdf:predicate} **Module 1: RDF Fundamentals** {+edu:module1 ?rdf:object} on [2026-02-01] {edu:startDate ^^xsd:date}.

### Bob Started Module 1 {=edu:activity-2 .rdf:Statement}
**Bob Smith** {+edu:student-2 ?rdf:subject} *started* {+edu:started ?rdf:predicate} **Module 1: RDF Fundamentals** {+edu:module1 ?rdf:object} on [2026-02-01] {edu:startDate ^^xsd:date}.

### Alice Completed Module 1 {=edu:activity-3 .rdf:Statement}
**Alice Johnson** {+edu:student-1 ?rdf:subject} *completed* {+edu:completed ?rdf:predicate} **Module 1: RDF Fundamentals** {+edu:module1 ?rdf:object} on [2026-02-15] {edu:completionDate ^^xsd:date} with grade [A] {edu:grade ^^xsd:string}.

### Bob Started Module 1 Assignment {=edu:activity-4 .rdf:Statement}
**Bob Smith** {+edu:student-2 ?rdf:subject} *started* {+edu:started ?rdf:predicate} **Module 1 Assignment** {+edu:assignment1 ?rdf:object} on [2026-02-10] {edu:startDate ^^xsd:date}.

---

### 2026-03-01T09:00:00Z {=edu:module2-start .prov:Activity prov:startedAtTime ^^xsd:dateTime}

## Module 2 Progress Tracking

### Alice Started Module 2 {=edu:activity-5 .rdf:Statement}
**Alice Johnson** {+edu:student-1 ?rdf:subject} *started* {+edu:started ?rdf:predicate} **Module 2: OWL and Ontologies** {+edu:module2 ?rdf:object} on [2026-03-01] {edu:startDate ^^xsd:date}.

### Bob Completed Module 1 {=edu:activity-6 .rdf:Statement}
**Bob Smith** {+edu:student-2 ?rdf:subject} *completed* {+edu:completed ?rdf:predicate} **Module 1: RDF Fundamentals** {+edu:module1 ?rdf:object} on [2026-02-20] {edu:completionDate ^^xsd:date} with grade [B+] {edu:grade ^^xsd:string}.

### Bob Started Module 2 {=edu:activity-7 .rdf:Statement}
**Bob Smith** {+edu:student-2 ?rdf:subject} *started* {+edu:started ?rdf:predicate} **Module 2: OWL and Ontologies** {+edu:module2 ?rdf:object} on [2026-03-05] {edu:startDate ^^xsd:date}.

## Student Performance Summary {=edu:performance .prov:Entity}

> Alice has demonstrated excellent progress, completing Module 1 with an A grade and advancing to Module 2. Bob is showing steady progress, completing Module 1 with a B+ grade and beginning Module 2 slightly later than Alice. {comment}

## Instructor Observations {=edu:instructor-notes .prov:Entity}

> Dr. Rodriguez noted that Alice's strong performance in Module 1 indicates she may be ready for advanced topics earlier than scheduled. Bob's consistent progress suggests he would benefit from additional exercises in RDF syntax before Module 3. {comment}

## 📊 Key MD-LD Features Demonstrated

This educational example showcases several important MD-LD capabilities:

### 1. **Provenance Tracking with PROV-O**
- Activities like course start (`prov:Activity`) and module completion are tracked
- Timestamps using `prov:startedAtTime` with `xsd:dateTime` datatype
- Clear separation between provenance metadata and factual statements

### 2. **Elevated Statements (rdf:Statement)**
- Student enrollments, module starts, and completions are modeled as reified statements
- Clear subject-predicate-object structure for educational events
- Allows for metadata about the statements themselves (e.g., dates, grades)

### 3. **Educational Ontology Extension**
- Custom `edu:` prefix for educational-specific terms
- `edu:Course`, `edu:Module`, `edu:Student`, `edu:enrolledIn`, `edu:started`, `edu:completed`
- Demonstrates how MD-LD can extend existing ontologies

### 4. **Prerequisite Relationships**
- Module prerequisites modeled as object properties (`?edu:prerequisite`)
- Temporal ordering of modules captured through dates and provenance

### 5. **Student Performance Tracking**
- Grades captured with appropriate datatypes (`xsd:string`)
- Completion dates with `xsd:date` datatype
- Separate statements for different educational activities

## 🔧 Technical Implementation Notes

<details>
<summary>📖 Parsing this Example</summary>

```javascript
import { parse } from 'mdld-parse';

const educationalMdld = `...`; // The MD-LD text above
const result = parse({ text: educationalMdld });

// Extract all student completions
const completions = result.quads.filter(quad => 
  quad.predicate.value.includes('completed')
);

// Extract all enrollment statements
const enrollments = result.quads.filter(quad =>
  quad.predicate.value.includes('enrolledIn')
);

console.log(`Found ${completions.length} module completions`);
console.log(`Found ${enrollments.length} enrollments`);
```
</details>
