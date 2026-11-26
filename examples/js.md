[ex] <tag:js.lab,2026:>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# sh:js Lab — constraints that prose can't express

Five stories where standard SHACL runs out of road and a few lines of JavaScript
carry the contract. Each demo is self-contained: a shape, a script, and data
that half-passes. Run with `validate({ quads, allowJS: true })` — `sh:js` is
opt-in because scripts are code, and code is trusted input.

The script signature, for reference:

```
fn(value, term, focusNode, values, graph, termEquals, valuesOf)
```

`value` is the lexical form under test; `focusNode` is the subject being
validated; `valuesOf(s, p)` reads any property off any node — which is what
makes cross-field and graph-wide rules possible.

---

## Story 1 — The event window {=ex:s1 .ex:Story label}

Our community center books rooms by the hour. Standard shapes can require
`start` and `end` to exist — but "the yoga class can't end before it begins"
is a *relationship between two fields*, invisible to per-value constraints.

**EventWindowShape** {=ex:EventWindowShape .sh:NodeShape label}
Every [Event] {+ex:Event ?sh:targetClass} must have **start** {+#s1Start ?sh:property sh:name}, **end** {+#s1End ?sh:property sh:name}, and an **order check** {+#s1Order ?sh:property sh:name}.
[Start is required — {focusNode}] {=#s1Start .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[start] {+ex:start ?sh:path}
[End is required — {focusNode}] {=#s1End .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[end] {+ex:end ?sh:path}
[End must be after start — {focusNode}] {=#s1Order .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[end] {+ex:end ?sh:path}
[order check] {+ex:EndAfterStart ?sh:js}

```js {=ex:EndAfterStart .sh:JSConstraint sh:script}
const START = { termType: 'NamedNode', value: 'tag:js.lab,2026:start' };
const starts = valuesOf(focusNode, START).map(t => new Date(t.value).getTime());
return starts.length === 0 || new Date(value).getTime() > starts[0];
```

### Valid Event {=ex:ValidEvent .ex:Event label}
[2026-11-26T10:00:00Z] {ex:start ^^xsd:dateTime}
[2026-11-26T11:00:00Z] {ex:end ^^xsd:dateTime}

### Backwards Event {=ex:BackwardsEvent .ex:Event label}
[2026-11-26T18:00:00Z] {ex:start ^^xsd:dateTime}
[2026-11-26T09:00:00Z] {ex:end ^^xsd:dateTime}

---

## Story 2 — The password confirmation {=ex:s2 .ex:Story label}

Account settings ask users to type their new password twice — a ritual that
only works if something *compares* the two fields. SHACL can check each field
exists; equality across fields is script territory.

**PasswordShape** {=ex:PasswordShape .sh:NodeShape label}
Every [Account] {+ex:Account ?sh:targetClass} must have **password** {+#s2Pw ?sh:property sh:name}, **confirmation** {+#s2Cf ?sh:property sh:name}, and a **match check** {+#s2Match ?sh:property sh:name}.
[Password is required — {focusNode}] {=#s2Pw .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[password] {+ex:password ?sh:path}
[Confirmation is required — {focusNode}] {=#s2Cf .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[confirm] {+ex:confirm ?sh:path}
[Passwords must match — {focusNode}] {=#s2Match .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[confirm] {+ex:confirm ?sh:path}
[match check] {+ex:PasswordMatch ?sh:js}

```js {=ex:PasswordMatch .sh:JSConstraint sh:script}
const PW = { termType: 'NamedNode', value: 'tag:js.lab,2026:password' };
const pws = valuesOf(focusNode, PW).map(t => t.value);
return pws.length === 0 || value === pws[0];
```

### Matching Account {=ex:MatchingAccount .ex:Account label}
[s3cret!] {ex:password}
[s3cret!] {ex:confirm}

### Mismatched Account {=ex:MismatchedAccount .ex:Account label}
[s3cret!] {ex:password}
[s3cr3t?] {ex:confirm}

---

## Story 3 — The unique slug {=ex:s3 .ex:Story label}

Our CMS generates URL slugs from titles — and two posts must never share one.
Uniqueness is a *graph-wide* property: no per-value constraint can see the
other posts. This script scans the whole dataset.

**SlugShape** {=ex:SlugShape .sh:NodeShape label}
Every [Post] {+ex:Post ?sh:targetClass} must have a **slug** {+#s3Slug ?sh:property sh:name} and a **uniqueness check** {+#s3Uniq ?sh:property sh:name}.
[Slug is required — {focusNode}] {=#s3Slug .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[slug] {+ex:slug ?sh:path}
[Slug must be unique — {focusNode}] {=#s3Uniq .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[slug] {+ex:slug ?sh:path}
[unique check] {+ex:SlugUnique ?sh:js}

```js {=ex:SlugUnique .sh:JSConstraint sh:script}
const SLUG = { termType: 'NamedNode', value: 'tag:js.lab,2026:slug' };
const TYPE = { termType: 'NamedNode', value: 'tag:js.lab,2026:Post' };
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const posts = [...graph.match(null, { termType: 'NamedNode', value: RDF_TYPE }, TYPE)];
const owners = new Set(
  [...graph.match(null, SLUG, null)]
    .filter(q => q.object.value === value)
    .map(q => q.subject.value)
);
return [...owners].every(o => termEquals({ termType: 'NamedNode', value: o }, focusNode));
```

### First Post {=ex:FirstPost .ex:Post label}
[hello-world] {ex:slug}

### Second Post {=ex:SecondPost .ex:Post label}
[hello-world] {ex:slug}

### Third Post {=ex:ThirdPost .ex:Post label}
[goodbye-moon] {ex:slug}

---

## Story 4 — The honest review {=ex:s4 .ex:Story label}

Our recipe site asks for a rating *and* a comment. Five stars need no
explanation; one star demands a reason. The rule is conditional — it fires
only when the rating is low — which is exactly the kind of logic that makes
SHACL shapes ugly and scripts short.

**ReviewShape** {=ex:ReviewShape .sh:NodeShape label}
Every [Review] {+ex:Review ?sh:targetClass} must have **rating** {+#s4Rate ?sh:property sh:name}, **comment** {+#s4Com ?sh:property sh:name}, and a **reason check** {+#s4Why ?sh:property sh:name}.
[Rating is required — {focusNode}] {=#s4Rate .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[rating] {+ex:rating ?sh:path}
[Comment is required — {focusNode}] {=#s4Com .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[comment] {+ex:comment ?sh:path}
[A bad review needs a reason — {focusNode}] {=#s4Why .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[comment] {+ex:comment ?sh:path}
[reason check] {+ex:ReviewReason ?sh:js}

```js {=ex:ReviewReason .sh:JSConstraint sh:script}
const RATE = { termType: 'NamedNode', value: 'tag:js.lab,2026:rating' };
const ratings = valuesOf(focusNode, RATE).map(t => parseInt(t.value, 10));
if (ratings.length === 0 || ratings[0] > 2) return true;
return value.length >= 20;
```

### Five-Star Review {=ex:FiveStar .ex:Review label}
[5] {ex:rating ^^xsd:integer}
[Loved it!] {ex:comment}

### One-Star Mystery {=ex:OneStarMystery .ex:Review label}
[1] {ex:rating ^^xsd:integer}
[Bad.] {ex:comment}

### One-Star Explained {=ex:OneStarExplained .ex:Review label}
[1] {ex:rating ^^xsd:integer}
[The crust burned and the filling was cold — wasted an evening.] {ex:comment}

---

## Story 5 — The catalog's own demo, kept honest {=ex:s5 .ex:Story label}

The catalog's JS demo — an event date that must parse as a real date —
repeated here as the baseline: the simplest possible script, and the reason
the feature exists.

**DateShape** {=ex:DateShape .sh:NodeShape label}
Every [Dated] {+ex:Dated ?sh:targetClass} must have **eventDate** {+#s5Date ?sh:property sh:name} and a **validity check** {+#s5Valid ?sh:property sh:name}.
[Date is required — {focusNode}] {=#s5Date .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[eventDate] {+ex:eventDate ?sh:path}
[Event date must be valid — {focusNode}] {=#s5Valid .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[eventDate] {+ex:eventDate ?sh:path}
[date check] {+ex:DateJS ?sh:js}

```js {=ex:DateJS .sh:JSConstraint sh:script}
const date = new Date(value);
return !isNaN(date.getTime());
```

### Valid Dated {=ex:ValidDated .ex:Dated label}
[2024-12-25] {ex:eventDate ^^xsd:date}

### Invalid Dated {=ex:InvalidDated .ex:Dated label}
[not-a-date] {ex:eventDate}

---

## Story 6 — The advisory nudge {=ex:s6 .ex:Story label}

Our community board lets anyone post events, but titles over 80 characters
hurt the printed newsletter. It's not *wrong* — just unwise. Standard SHACL
can't express "discouraged but allowed"; `sh:severity` can, and the message
template can name the actual offender via `{$value}` — no script-side
reporting needed.

**TitleShape** {=ex:TitleShape .sh:NodeShape label}
Every [Listing] {+ex:Listing ?sh:targetClass} must have a **title** {+#s6Title ?sh:property sh:name} and a **brevity check** {+#s6Brief ?sh:property sh:name}.
[Title is required — {focusNode}] {=#s6Title .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[title] {+ex:title ?sh:path}
[Keep it under 80 characters — {$value} is too long — {focusNode}] {=#s6Brief .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[title] {+ex:title ?sh:path}
[briefness check] {+ex:TitleBrief ?sh:js}
[Warning] {+sh:Warning ?sh:severity}

```js {=ex:TitleBrief .sh:JSConstraint sh:script}
return value.length <= 80;
```

### Short Title {=ex:ShortTitle .ex:Listing label}
[Pottery night] {ex:title}

### Long Title {=ex:LongTitle .ex:Listing label}
[An absolutely delightful evening of pottery painting, glazing, and firing with the Riverside Community Studio collective — all welcome] {ex:title}

---

## Story 7 — The venue allowlist {=ex:s7 .ex:Story label}

The community center only books its own rooms — a venue name is valid only if
it appears in the office's `venues.txt`. That list lives *outside* the graph,
on the filesystem, and it changes without the document changing. A shape that
consults `fs` turns the document into a client of the real world.

**VenueShape** {=ex:VenueShape .sh:NodeShape label}
Every [Booking] {+ex:Booking ?sh:targetClass} must have a **venue** {+#s7Venue ?sh:property sh:name} and an **allowlist check** {+#s7Allow ?sh:property sh:name}.
[Venue is required — {focusNode}] {=#s7Venue .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[venue] {+ex:venue ?sh:path}
[Venue must be on the approved list — {focusNode}] {=#s7Allow .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[venue] {+ex:venue ?sh:path}
[allowlist check] {+ex:VenueAllowlist ?sh:js}

```js {=ex:VenueAllowlist .sh:JSConstraint sh:script}
const fs = process.getBuiltinModule('node:fs');
const list = fs.readFileSync(process.cwd() + '/examples/venues.txt', 'utf8');
return list.split('\n').map(s => s.trim()).includes(value);
```

### Approved Booking {=ex:ApprovedBooking .ex:Booking label}
[Riverside Hall] {ex:venue}

### Rogue Booking {=ex:RogueBooking .ex:Booking label}
[Some Random Warehouse] {ex:venue}

---

## Story 8 — The sealed claim {=ex:s8 .ex:Story label}

Our ledger requires every claim to carry a checksum: `sha256:` of the claim
text, first 16 hex chars. The document stores the claim and its seal as
data — but *verifying* the seal is arithmetic, and arithmetic is script
territory. `node:crypto` is reachable synchronously, so the shape can check
the seal against the content at validation time.

**ClaimShape** {=ex:ClaimShape .sh:NodeShape label}
Every [Claim] {+ex:Claim ?sh:targetClass} must have **text** {+#s8Text ?sh:property sh:name}, **seal** {+#s8Seal ?sh:property sh:name}, and a **checksum check** {+#s8Sum ?sh:property sh:name}.
[Text is required — {focusNode}] {=#s8Text .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[text] {+ex:text ?sh:path}
[Seal is required — {focusNode}] {=#s8Seal .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[seal] {+ex:seal ?sh:path}
[Seal must match content — {focusNode}] {=#s8Sum .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[seal] {+ex:seal ?sh:path}
[checksum check] {+ex:ClaimChecksum ?sh:js}

```js {=ex:ClaimChecksum .sh:JSConstraint sh:script}
const crypto = process.getBuiltinModule('node:crypto');
const TEXT = { termType: 'NamedNode', value: 'tag:js.lab,2026:text' };
const texts = valuesOf(focusNode, TEXT).map(t => t.value);
if (texts.length === 0) return true;
const digest = 'sha256:' + crypto.createHash('sha256').update(texts[0]).digest('hex').slice(0, 16);
return value === digest;
```

### Honest Claim {=ex:HonestClaim .ex:Claim label}
[The server is down until Friday] {ex:text}
[sha256:0cd766c24ffb2628] {ex:seal}

### Tampered Claim {=ex:TamperedClaim .ex:Claim label}
[The server is down until Friday] {ex:text}
[sha256:0000000000000000] {ex:seal}
