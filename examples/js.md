[ex] <tag:js.lab,2026:>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>
[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
[rdfs] <http://www.w3.org/2000/01/rdf-schema#>

# sh:js Lab — constraints that prose can't express

Three stories where standard SHACL runs out of road and a few lines of
JavaScript carry the contract — all within the strict W3C calling convention:

```
fn(value, path, focusNode)
```

`value` is the RDF term under test (`.value` lexical, `.datatype`, `.language`); `path` is the shape path that
produced it; `focusNode` is the subject being validated. That is the whole
contract — no graph access, no sibling reads, and no environment access:
`sh:js` judges one value in one node's context, nothing more. Rules that
need siblings (cross-field equality), the world (uniqueness, referential
checks), or the filesystem are deliberately out of scope — they belong to
different mechanisms, not to constraint scripts.

Run with `validate({ quads, allowJS: true })` — `sh:js` is opt-in because
scripts are code, and code is trusted input.

---

## Story 1 — The catalog's own demo, kept honest {=ex:s1 .ex:Story label}

The baseline: an event date that must parse as a real date — the simplest
possible script, and the reason the feature exists.

**DateShape** {=ex:DateShape .sh:NodeShape label}
Every [Dated] {+ex:Dated ?sh:targetClass} must have **eventDate** {+#d1Date ?sh:property sh:name} and a **validity check** {+#d1Valid ?sh:property sh:name}.
[Date is required — {focusNode}] {=#d1Date .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[eventDate] {+ex:eventDate ?sh:path}
[Event date must be valid — {focusNode}] {=#d1Valid .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[eventDate] {+ex:eventDate ?sh:path}
[date check] {+ex:DateJS ?sh:js}

```js {=ex:DateJS .sh:JSConstraint sh:script}
const date = new Date(value.value);
return !isNaN(date.getTime());
```

### Valid Dated {=ex:ValidDated .ex:Dated label}
[2024-12-25] {ex:eventDate ^^xsd:date}

### Invalid Dated {=ex:InvalidDated .ex:Dated label}
[not-a-date] {ex:eventDate}

---

## Story 2 — The advisory nudge · universal {=ex:s2 .ex:Story label}

Our community board lets anyone post events, but titles over 80 characters
hurt the printed newsletter. It's not *wrong* — just unwise. Standard SHACL
can't express "discouraged but allowed"; `sh:severity` can, and the message
template names the offender via `{$value}` — no script-side reporting.

**TitleShape** {=ex:TitleShape .sh:NodeShape label}
Every [Listing] {+ex:Listing ?sh:targetClass} must have a **title** {+#t2Title ?sh:property sh:name} and a **brevity check** {+#t2Brief ?sh:property sh:name}.
[Title is required — {focusNode}] {=#t2Title .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[title] {+ex:title ?sh:path}
[Keep it under 80 characters — {$value} is too long — {focusNode}] {=#t2Brief .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[title] {+ex:title ?sh:path}
[briefness check] {+ex:TitleBrief ?sh:js}
[Warning] {+sh:Warning ?sh:severity}

```js {=ex:TitleBrief .sh:JSConstraint sh:script}
return value.value.length <= 80;
```

### Short Title {=ex:ShortTitle .ex:Listing label}
[Pottery night] {ex:title}

### Long Title {=ex:LongTitle .ex:Listing label}
[An absolutely delightful evening of pottery painting, glazing, and firing with the Riverside Community Studio collective — all welcome] {ex:title}

---

---

## Story 4 — The ISBN checksum · universal {=ex:s4 .ex:Story label}

Our library catalog stores ISBN-10s as plain strings. The check digit isn't
decoration — it's arithmetic: weighted sum mod 11 must equal zero. SHACL has
no "compute a checksum" constraint; ten lines of JS do.

**ISBNShape** {=ex:ISBNShape .sh:NodeShape label}
Every [Book] {+ex:Book ?sh:targetClass} must have an **isbn** {+#i4Isbn ?sh:property sh:name} and a **checksum check** {+#i4Sum ?sh:property sh:name}.
[ISBN is required — {focusNode}] {=#i4Isbn .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[isbn] {+ex:isbn ?sh:path}
[ISBN check digit invalid — {focusNode}] {=#i4Sum .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[isbn] {+ex:isbn ?sh:path}
[checksum check] {+ex:ISBNCheck ?sh:js}

```js {=ex:ISBNCheck .sh:JSConstraint sh:script}
const s = value.value.replace(/-/g, '');
if (!/^\d{9}[\dX]$/.test(s)) return false;
let sum = 0;
for (let i = 0; i < 9; i++) sum += (10 - i) * parseInt(s[i], 10);
sum += s[9] === 'X' ? 10 : parseInt(s[9], 10);
return sum % 11 === 0;
```

### Valid Book {=ex:ValidBook .ex:Book label}
[0-306-40615-2] {ex:isbn}

### Invalid Book {=ex:InvalidBook .ex:Book label}
[0-306-40615-9] {ex:isbn}

---

## Story 5 — The JSON payload · universal {=ex:s5 .ex:Story label}

Tool results carry JSON payloads. "Is this valid JSON?" is a parse-or-die
question — `JSON.parse` in a try/catch is the entire constraint. No regex
can do this; the language's own parser can.

**PayloadShape** {=ex:PayloadShape .sh:NodeShape label}
Every [ToolResult] {+ex:ToolResult ?sh:targetClass} must have a **payload** {+#p5Pay ?sh:property sh:name} and a **JSON check** {+#p5Json ?sh:property sh:name}.
[Payload is required — {focusNode}] {=#p5Pay .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[payload] {+ex:payload ?sh:path}
[Payload is not valid JSON — {focusNode}] {=#p5Json .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[payload] {+ex:payload ?sh:path}
[json check] {+ex:JsonValid ?sh:js}

```js {=ex:JsonValid .sh:JSConstraint sh:script}
try { JSON.parse(value.value); return true; } catch { return false; }
```

### Valid Result {=ex:ValidResult .ex:ToolResult label}
[{"temperature": 21.5, "unit": "C"}] {ex:payload}

### Truncated Result {=ex:TruncatedResult .ex:ToolResult label}
[{"temperature": 21.5, "unit":] {ex:payload}

---

## Story 6 — The focusNode matters · universal {=ex:s6 .ex:Story label}

`focusNode` is spec-provided — and it unlocks *identity-aware* constraints:
the same property can be judged differently depending on *which node* carries
it. Here, system announcements must be well-formed URLs while user posts may
be anything — the rule keys off the subject's IRI, still purely local.

**LinkShape** {=ex:LinkShape .sh:NodeShape label}
Every [Notice] {+ex:Notice ?sh:targetClass} must have a **link** {+#l6Link ?sh:property sh:name} and a **URL check** {+#l6Url ?sh:property sh:name}.
[Link is required — {focusNode}] {=#l6Link .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[link] {+ex:link ?sh:path}
[System notices need absolute URLs — {focusNode}] {=#l6Url .sh:PropertyShape sh:message}
`1` {sh:minCount ^^xsd:integer}
[link] {+ex:link ?sh:path}
[url check] {+ex:UrlCheck ?sh:js}

```js {=ex:UrlCheck .sh:JSConstraint sh:script}
if (!focusNode.value.endsWith('SystemNotice')) return true;
try { const u = new URL(value.value); return u.protocol === 'https:'; } catch { return false; }
```

### User Notice {=ex:UserNotice .ex:Notice label}
[see the notes page] {ex:link}

### System Notice {=ex:SystemNotice .ex:Notice label}
[https://status.example.com/incidents/42] {ex:link}

### Broken System Notice {=ex:BrokenSystemNotice .ex:Notice label}
[status page is down] {ex:link}
