[edu] <tag:alice@example.com,2026:edu/>

# Fall Semester 2026 {=edu:fall2026 .edu:Semester label}

My third semester at State University — [CS 101] {+edu:cs101 ?edu:hasCourse},
[MATH 221] {+edu:math221 ?edu:hasCourse}, and [PHIL 110] {+edu:phil110 ?edu:hasCourse}:
nine hours a week of lecture, and a growing pile of notes that increasingly
cite each other.

## Courses

### CS 101 — Algorithms {=edu:cs101 .edu:Course label}
Introduced by [Dr. Chen] {+edu:chen ?edu:taughtBy}, meets [MWF] {edu:schedule} 10:00–10:50. Prerequisite: [MATH 140] {+edu:math140 .edu:Course ?edu:prerequisite label}.
Textbook: [CLRS] {+edu:clrs .edu:Book ?edu:textbook label} — *Introduction to Algorithms*.

### MATH 221 — Linear Algebra {=edu:math221 .edu:Course label}
Taught by [Prof. Okafor] {+edu:okafor ?edu:taughtBy}, meets [TR] {edu:schedule} 13:00–14:15.
Textbook: [Strang] {+edu:strang .edu:Book ?edu:textbook label} — *Introduction to Linear Algebra*.

### PHIL 110 — Ethics in Technology {=edu:phil110 .edu:Course label}
Taught by [Dr. Reyes] {+edu:reyes ?edu:taughtBy}, meets [TR] {edu:schedule} 15:00–16:15. No prerequisite — open to all undergraduates.

## Teachers

### Dr. Chen {=edu:chen .edu:Teacher label}
> Algorithms and data structures. Known for asking "but *why* is it O(n log n)?" in every lecture. {comment}

### Prof. Okafor {=edu:okafor .edu:Teacher label}
> Linear algebra. Draws every proof on the board by hand — no slides, ever. {comment}

### Dr. Reyes {=edu:reyes .edu:Teacher label}
> Philosophy of technology. Runs the seminar as a genuine conversation; students argue back and are graded on the quality of their objections. {comment}

## Classmates

### Marcus Webb {=edu:marcus .edu:Student label}
> CS major, sits front-left. {comment}

Once explained merge sort to me in the library until
2 a.m. — the explanation became [my own words] {+edu:merge-sort-note ?edu:explainedBy label}.

### Priya Nair {=edu:priya .edu:Student label}
> Philosophy minor taking PHIL 110 with me. {comment}

We co-noted the [Turing] {+edu:turing-quote .edu:Quote ?edu:discussedWith label} debate.

---

## Lecture Notes — CS 101

### Week 4 — Divide and Conquer {=edu:cs101-w4 .edu:LectureNote label}
[2026-09-23] {edu:date ^^xsd:date} — second lecture on sorting.

Covered [merge sort] {+edu:mergesort .edu:Topic ?edu:covered label} and started on
[quicksort] {+edu:quicksort .edu:Topic ?edu:covered label}. The key insight from
last time finally clicked: divide-and-conquer isn't a technique, it's a
*accounting method* — you pay for the split once and collect on it at every
level.

**Best sort** {=edu:chen-quote1 .edu:Quote label}
> The best sort is the one you don't need. {comment}
during [Week 4] {+edu:cs101-w4 ?edu:saidIn}
[Dr. Chen] {=edu:chen ?edu:author}

Links: follows [Week 3 — Recurrence Relations] {+edu:cs101-w3 ?edu:follows};
cites [CLRS ch. 4] {+edu:clrs-ch4 .edu:BookSection ?edu:cites label};
related to [MATH 221 — Eigenvalues] {+edu:math221-w5 ?edu:relatedTo} because
both are about decomposing a problem until it disappears.

### Week 3 — Recurrence Relations {=edu:cs101-w3 .edu:LectureNote label}
[2026-09-16] {edu:date ^^xsd:date} — solved recurrences by substitution and
the master theorem. [Homework 3] {+edu:hw3 .edu:Assignment ?edu:assigned label}
due [2026-09-20] {edu:dueDate ^^xsd:date}.

**Prove it twice** {=edu:chen-quote2 .edu:Quote label}
> Prove it twice: once by hand, once by your program disagreeing with you. {comment}
during [Week 3] {+edu:cs101-w3 ?edu:saidIn}
[Dr. Chen] {=edu:chen ?edu:author}

### Week 5 — Graphs {=edu:cs101-w5 .edu:LectureNote label}
[2026-09-30] {edu:date ^^xsd:date} — BFS/DFS, then a taste of shortest paths.
Marcus stayed after class and walked me through [priority queues] {+edu:pq .edu:Topic ?edu:covered}
— the whiteboard session became [my own summary] {+edu:cs101-w5-pq .edu:LectureNote ?edu:derivedFrom}.

**Stability promise** {=edu:marcus-quote .edu:Quote label}
> Merge sort is stable. Quicksort isn't. Stability is a promise you make to your data. {comment}
during [Week 5] {+edu:cs101-w5 ?edu:saidIn}
[Marcus Webb] {=edu:marcus ?edu:author} was quoting [Dr. Chen] {=edu:chen ?edu:quoted}, who quoted [Knuth] {=edu:knuth .edu:Person ?edu:quoted label}. 

**My own summary** {=edu:cs101-w5-pq .edu:LectureNote label}
> Half-formed notes from the whiteboard session — never got a date. {comment}

**Priority queues** {=edu:pq .edu:Topic label}
> A heap-backed structure for always extracting the smallest element — Marcus drew the sift-down operation on the board. {comment}

---

## Lecture Notes — MATH 221

### Week 5 — Eigenvalues {=edu:math221-w5 .edu:LectureNote label}
[2026-10-01] {edu:date ^^xsd:date} — eigenvectors as the directions a matrix
refuses to rotate.

**Eigenvector promise** {=edu:okafor-quote .edu:Quote label}
~~~md {comment}
An eigenvector is a direction that survives the transformation.
Everything else gets bent.
~~~
during [Week 5] {+edu:math221-w5 ?edu:saidIn}
[Prof. Okafor] {=edu:okafor ?edu:author}

Links: related to [CS 101 — Divide and Conquer] {+edu:cs101-w4 ?edu:relatedTo};
cites [Strang §6.1] {+edu:strang-61 .edu:BookSection ?edu:cites label}.

---

## Lecture Notes — PHIL 110

### Week 6 — The Turing Test, Revisited {=edu:phil110-w6 .edu:LectureNote label}
[2026-10-02] {edu:date ^^xsd:date} — seminar on whether passing the Turing
test means anything. Priya argued the test measures *performance of deception*,
not intelligence.

**Patterns as performance** {=edu:priya-quote .edu:Quote label}
~~~md {comment}
A machine that passes is a machine that has learned our patterns —
not one that has a mind.
~~~
during [Week 6] {+edu:phil110-w6 ?edu:saidIn}
[Priya Nair] {=edu:priya ?edu:author} was thinking of [Alan Turing] {=edu:turing .edu:Person ?edu:quoted label}.

**Patterns as mind** {=edu:reyes-quote .edu:Quote label}
> But the patterns ARE the mind, arguably. {comment}
during [Week 6] {+edu:phil110-w6 ?edu:saidIn}
[Dr. Reyes] {=edu:reyes ?edu:author} was answering [Priya Nair] {=edu:priya ?edu:quoted} — which is exactly the move the course keeps circling.

Links: related to [CS 101 — Graphs] {+edu:cs101-w5 ?edu:relatedTo} (both
ask what a formal system can and cannot capture); assigned
[reflection paper] {+edu:phil110-essay .edu:Assignment ?edu:assigned label}
due [2026-10-17] {edu:dueDate ^^xsd:date}.

---


## Shapes

The notebook describes itself — six shapes govern what a good record looks
like. Every typed node must carry a **label**: that's the string the UI
renders on each card, so a missing label is a broken card.

# Lecture Note Shape {=edu:LectureNoteShape .sh:NodeShape label}

Every [lecture note] {+edu:LectureNote ?sh:targetClass} in the notebook must
carry a **label** {+#noteLabel ?sh:property sh:name}, a **date** {+#noteDate ?sh:property sh:name},
and its **quotes** {+#noteQuotes ?sh:property sh:name} — said in that note,
whoever said them.

`Note label is required — {$focusNode} missing {$path}` {=#noteLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} human-readable [label] {+label ?sh:path}.

`Note date is required — {$focusNode} has no valid {$path} (xsd:date)` {=#noteDate .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} value that is a [date] {+xsd:date ?sh:datatype}.

`Quotes must satisfy Quote Shape — bad quote on {$focusNode} via {$path}` {=#noteQuotes .sh:PropertyShape sh:message} expects each [said-in quote] {+edu:saidInPath ?sh:path} to satisfy the **Quote Shape** {+edu:QuoteShape ?sh:node} — each with its text and author.

**Said-in path** {=edu:saidInPath label} walks [saidIn] {+edu:saidIn ?sh:inversePath} backwards — from the note to the quotes that point at it.

# Quote Shape {=edu:QuoteShape .sh:NodeShape label}

Every quote carries its **text** {+#quoteText ?sh:property sh:name} and its
**author** {+#quoteAuthor ?sh:property sh:name}.

`Quote must have text — {$focusNode} missing {$path}` {=#quoteText .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} quote [text] {+comment ?sh:path}.

`Quote must name its author — {$focusNode} missing {$path}` {=#quoteAuthor .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} quote [author] {+edu:author ?sh:path} — teacher or classmate, attribution is mandatory.

# Course Shape {=edu:CourseShape .sh:NodeShape label}

Every [course] {+edu:Course ?sh:targetClass} has a **label** {+#courseLabel ?sh:property sh:name} and a **teacher** {+#courseTeacher ?sh:property sh:name}.

## Course label is required — {$focusNode} missing {$path} {=#courseLabel .sh:PropertyShape sh:message}
Our [label] {+label ?sh:path} must have at least [1] {sh:minCount ^^xsd:integer} value.

## Course teacher is required — {$focusNode} missing {$path} {=#courseTeacher .sh:PropertyShape sh:message}
Our [teacher] {+edu:taughtBy ?sh:path} must satisfy the **Teacher Shape** {+edu:TeacherShape ?sh:node} — at least [1] {sh:minCount ^^xsd:integer} value.

## Teacher Shape {=edu:TeacherShape .sh:NodeShape label} 

Expects every [teacher] {+edu:Teacher ?sh:targetClass} to have a **label** {+#teacherLabel ?sh:property sh:name}.

`Teacher label is required — {$focusNode} missing {$path}` {=#teacherLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+label ?sh:path}.

# Student Shape {=edu:StudentShape .sh:NodeShape label}

Every [student] {+edu:Student ?sh:targetClass} has a **label** {+#studentLabel ?sh:property sh:name}.

`Student label is required — {$focusNode} missing {$path}` {=#studentLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+label ?sh:path}.

# Person Shape {=edu:PersonShape .sh:NodeShape label}

Every [person] {+edu:Person ?sh:targetClass} — quoted authors, historical
figures — has a **label** {+#personLabel ?sh:property sh:name}.

`Person label is required — {$focusNode} missing {$path}` {=#personLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+label ?sh:path}.

---

# What this graph demonstrates

- **Growing notes** — each `edu:LectureNote` carries a date, course context
  via `edu:saidIn`/`edu:covered`, and links (`edu:follows`, `edu:relatedTo`,
  `edu:cites`, `edu:derivedFrom`) that make the notebook a traversable graph,
  not a folder of files.
- **Embedded quotes** — every `edu:Quote` is a first-class node with an
  `edu:author` (teacher *or* student) and `edu:saidIn` pointing back to the
  lecture it came from. Quotes from classmates carry the same weight as
  professors' — Marcus's stability remark and Priya's objection are
  attributed knowledge, not decoration.
- **Cross-course links** — eigenvalues ↔ divide-and-conquer, Turing test ↔
  graph traversal: `edu:relatedTo` captures the "wait, these are the same
  idea" moments that make learning feel like a network.
