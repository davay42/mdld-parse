[edu] <tag:alice@example.com,2026:edu/>

# Fall Semester 2026 {=edu:fall2026 .edu:Semester label}

My third semester at State University. Three courses, nine hours a week of
lecture, and a growing pile of notes that increasingly cite each other.

## Courses

### CS 101 — Algorithms {=edu:cs101 .edu:Course label}
Introduced by [Dr. Chen] {+edu:chen ?edu:taughtBy}, meets [MWF] {edu:schedule} 10:00–10:50. Prerequisite: [MATH 140] {+edu:math140 ?edu:prerequisite}.
Textbook: [CLRS] {+edu:clrs .edu:Book ?edu:textbook label} — *Introduction to Algorithms*.

### MATH 221 — Linear Algebra {=edu:math221 .edu:Course label}
Taught by [Prof. Okafor] {+edu:okafor ?edu:taughtBy}, meets [TR] {edu:schedule} 13:00–14:15.
Textbook: [Strang] {+edu:strang .edu:Book ?edu:textbook label} — *Introduction to Linear Algebra*.

### PHIL 110 — Ethics in Technology {=edu:phil110 .edu:Course label}
Taught by [Dr. Reyes] {+edu:reyes ?edu:taughtBy}, meets [TR] {edu:schedule} 15:00–16:15. No prerequisite — open to all undergraduates.

## Teachers

### Dr. Chen {=edu:chen .edu:Teacher label}
Algorithms and data structures. Known for asking "but *why* is it O(n log n)?"
in every lecture.

### Prof. Okafor {=edu:okafor .edu:Teacher label}
Linear algebra. Draws every proof on the board by hand — no slides, ever.

### Dr. Reyes {=edu:reyes .edu:Teacher label}
Philosophy of technology. Runs the seminar as a genuine conversation; students
argue back and are graded on the quality of their objections.

## Classmates

### Marcus Webb {=edu:marcus .edu:Student label}
CS major, sits front-left. Once explained merge sort to me in the library until
2 a.m. — the explanation became [my own words] {+edu:merge-sort-note ?edu:explainedBy}.

### Priya Nair {=edu:priya .edu:Student label}
Philosophy minor taking PHIL 110 with me. We co-noted the [Turing] {+edu:turing-quote ?edu:discussedWith} debate.

---

## Shapes {=edu:shapes .edu:Container label}

The notebook describes itself — two shapes govern what a good note looks like.

# Lecture Note Shape {=edu:LectureNoteShape .sh:NodeShape label}

Every [lecture note] {+edu:LectureNote ?sh:targetClass} in the notebook must
carry a **label** {+#noteLabel ?sh:property sh:name}, a **date** {+#noteDate ?sh:property sh:name},
and its **quotes** {+#noteQuotes ?sh:property sh:name} — said in that note,
whoever said them.

## Note label must be single-valued — got {$value} at {$path} {=#noteLabel .sh:PropertyShape sh:message}
Our [label] {+rdfs:label ?sh:path} must have at most [1] {sh:maxCount ^^xsd:integer} value.

## Note date is required — {$focusNode} has no valid {$path} (xsd:date) {=#noteDate .sh:PropertyShape sh:message}
Our [date] {+edu:date ?sh:path} must be a [date] {+xsd:date ?sh:datatype} — at least [1] {sh:minCount ^^xsd:integer} value.

## Quotes must satisfy Quote Shape — bad quote on {$focusNode} via {$path} {=#noteQuotes .sh:PropertyShape sh:message}
Our [said-in quotes] {+edu:saidInPath ?sh:path} must satisfy the **Quote Shape** {+edu:QuoteShape ?sh:node} — each with its text and author.

**Said-in path** {=edu:saidInPath} walks [saidIn] {+edu:saidIn ?sh:inversePath} backwards — from the note to the quotes that point at it.

# Quote Shape {=edu:QuoteShape .sh:NodeShape label}

Every quote carries its **text** {+#quoteText ?sh:property sh:name} and its
**author** {+#quoteAuthor ?sh:property sh:name}.

## Quote must have text — {$focusNode} missing {$path} {=#quoteText .sh:PropertyShape sh:message}
Our [text] {+edu:text ?sh:path} must have at least [1] {sh:minCount ^^xsd:integer} value.

## Quote must name its author — {$focusNode} missing {$path} {=#quoteAuthor .sh:PropertyShape sh:message}
Our [author] {+edu:author ?sh:path} must have at least [1] {sh:minCount ^^xsd:integer} value — teacher or classmate, attribution is mandatory.

---

## Lecture Notes — CS 101

### Week 4 — Divide and Conquer {=edu:cs101-w4 .edu:LectureNote label}
[2026-09-23] {edu:date ^^xsd:date} — second lecture on sorting.

Covered [merge sort] {+edu:mergesort .edu:Topic ?edu:covered} and started on
[quicksort] {+edu:quicksort .edu:Topic ?edu:covered}. The key insight from
last time finally clicked: divide-and-conquer isn't a technique, it's a
*accounting method* — you pay for the split once and collect on it at every
level.

> The best sort is the one you don't need. {=edu:chen-quote1 .edu:Quote edu:text}
> said by [Dr. Chen] {+edu:chen ?edu:author} during [Week 4] {+edu:cs101-w4 ?edu:saidIn}.

Links: follows [Week 3 — Recurrence Relations] {+edu:cs101-w3 ?edu:follows};
cites [CLRS ch. 4] {+edu:clrs-ch4 .edu:BookSection ?edu:cites};
related to [MATH 221 — Eigenvalues] {+edu:math221-w5 ?edu:relatedTo} because
both are about decomposing a problem until it disappears.

### Week 3 — Recurrence Relations {=edu:cs101-w3 .edu:LectureNote label}
[2026-09-16] {edu:date ^^xsd:date} — solved recurrences by substitution and
the master theorem. [Homework 3] {+edu:hw3 .edu:Assignment ?edu:assigned}
due [2026-09-20] {edu:dueDate ^^xsd:date}.

> Prove it twice: once by hand, once by your program disagreeing with you. {=edu:chen-quote2 .edu:Quote edu:text}
> said by [Dr. Chen] {+edu:chen ?edu:author} during [Week 3] {+edu:cs101-w3 ?edu:saidIn}.

### Week 5 — Graphs {=edu:cs101-w5 .edu:LectureNote label}
[2026-09-30] {edu:date ^^xsd:date} — BFS/DFS, then a taste of shortest paths.
Marcus stayed after class and walked me through [priority queues] {+edu:pq .edu:Topic ?edu:covered}
— the whiteboard session became [my own summary] {+edu:cs101-w5-pq .edu:LectureNote ?edu:derivedFrom}.

> Merge sort is stable. Quicksort isn't. Stability is a promise you make to
> your data. {=edu:marcus-quote .edu:Quote edu:text}
> said by [Marcus Webb] {+edu:marcus ?edu:author} during [Week 5] {+edu:cs101-w5 ?edu:saidIn} —
> he was quoting Dr. Chen, who quoted Knuth.

---

## Lecture Notes — MATH 221

### Week 5 — Eigenvalues {=edu:math221-w5 .edu:LectureNote label}
[2026-10-01] {edu:date ^^xsd:date} — eigenvectors as the directions a matrix
refuses to rotate.

> An eigenvector is a direction that survives the transformation.
> Everything else gets bent. {=edu:okafor-quote .edu:Quote edu:text}
> said by [Prof. Okafor] {+edu:okafor ?edu:author} during [Week 5] {+edu:math221-w5 ?edu:saidIn}.

Links: related to [CS 101 — Divide and Conquer] {+edu:cs101-w4 ?edu:relatedTo};
cites [Strang §6.1] {+edu:strang-61 .edu:BookSection ?edu:cites}.

---

## Lecture Notes — PHIL 110

### Week 6 — The Turing Test, Revisited {=edu:phil110-w6 .edu:LectureNote label}
[2026-10-02] {edu:date ^^xsd:date} — seminar on whether passing the Turing
test means anything. Priya argued the test measures *performance of deception*,
not intelligence.

> A machine that passes is a machine that has learned our patterns —
> not one that has a mind. {=edu:priya-quote .edu:Quote edu:text}
> said by [Priya Nair] {+edu:priya ?edu:author} during [Week 6] {+edu:phil110-w6 ?edu:saidIn}.

> But the patterns ARE the mind, arguably. {=edu:reyes-quote .edu:Quote edu:text}
> said by [Dr. Reyes] {+edu:reyes ?edu:author} during [Week 6] {+edu:phil110-w6 ?edu:saidIn} —
> which is exactly the move the course keeps circling.

Links: related to [CS 101 — Graphs] {+edu:cs101-w5 ?edu:relatedTo} (both
ask what a formal system can and cannot capture); assigned
[reflection paper] {+edu:phil110-essay ?edu:Assignment ?edu:assigned}
due [2026-10-17] {edu:dueDate ^^xsd:date}.

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
