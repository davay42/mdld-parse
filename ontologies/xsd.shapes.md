[pack] <https://mdld.js.org/ns/pack/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# XSD Vocabulary Shapes

Validation pack for XML Schema datatypes — `sh:datatype` checks the datatype *IRI*, but cannot check the lexical *form*. `sh:js` fills that gap: `pack:LexicalCheck` verifies literal lexical forms against common XSD datatypes, and any property shape can attach it.

======

# XSD Datatype Shape {=pack:DatatypeShape .sh:NodeShape label}

Every [datatype] {+rdfs:Datatype ?sh:targetClass} has a **label** {+#dtLabel ?sh:property sh:name}.

`Datatype label is required — {$focusNode} missing {$path}` {=#dtLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

# XSD Lexical Check {=pack:LexicalCheck .sh:JSConstraint label}

A shared `sh:js` constraint — attach via `?sh:js` on any property shape to enforce lexical validity on top of `sh:datatype`. Covers `integer`, `decimal`, `boolean`, `date`, and `dateTime`; other datatypes pass through.

```js {=pack:LexicalCheck .sh:JSConstraint sh:script}
const dt = (value.datatype && value.datatype.value) || ''
const lex = String(value.value).trim()
if (dt.endsWith('boolean')) return lex === 'true' || lex === 'false' || lex === '0' || lex === '1'
if (dt.endsWith('integer')) return /^-?\d+$/.test(lex)
if (dt.endsWith('decimal') || dt.endsWith('float') || dt.endsWith('double')) return /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(lex)
if (dt.endsWith('dateTime')) return !isNaN(new Date(lex).getTime()) && /T\d{2}:\d{2}/.test(lex)
if (dt.endsWith('date')) return /^\d{4}-\d{2}-\d{2}$/.test(lex) && !isNaN(new Date(lex).getTime())
return true
```

# Measurement Shape {=pack:MeasurementShape .sh:NodeShape label}

A [measurement] {+pack:Measurement ?sh:targetClass} — the demo domain for datatype discipline. Its **value** {+#mValue ?sh:property sh:name} must be `xsd:decimal` *and* lexically valid; its **flag** {+#mFlag ?sh:property sh:name} must be `xsd:boolean` *and* lexically valid; its **taken at** {+#mAt ?sh:property sh:name} must be `xsd:dateTime` *and* lexically valid.

`Measurement value — {$focusNode} lexical check failed` {=#mValue .sh:PropertyShape sh:message}
Our [value] {+pack:value ?sh:path} must be decimal — checked by [lexical check] {+pack:LexicalCheck ?sh:js}, datatype [decimal] {+xsd:decimal ?sh:datatype}.

`Measurement flag — {$focusNode} lexical check failed` {=#mFlag .sh:PropertyShape sh:message}
Our [flag] {+pack:flag ?sh:path} must be boolean — checked by [lexical check] {+pack:LexicalCheck ?sh:js}, datatype [boolean] {+xsd:boolean ?sh:datatype}.

`Measurement timestamp — {$focusNode} lexical check failed` {=#mAt .sh:PropertyShape sh:message}
Our [taken at] {+pack:takenAt ?sh:path} must be dateTime — checked by [lexical check] {+pack:LexicalCheck ?sh:js}, datatype [dateTime] {+xsd:dateTime ?sh:datatype}.

======

## Examples

Each `pack:Demo` node carries its own contract in the graph: the source lives in the annotated fence, expectations are quads — `pack:expectedViolations` for validation and `pack:extractedPOJO` for extraction. `selftest.mjs` verifies all three.

## Clean instrument readings {=pack:xsdExample .pack:Demo label}

[0] {pack:expectedViolations ^^xsd:integer}
`{"DatatypeShape": {}, "MeasurementShape": {"pack:m1": {"value": 12.5, "flag": true, "taken at": "2026-01-15T03:30:00.000Z"}, "pack:m2": {"value": 36.6, "flag": false, "taken at": "2026-01-15T03:31:00.000Z"}}}` {pack:extractedPOJO}

~~~~~~md {pack:demo}
[pack] <https://mdld.js.org/ns/pack/>

# Scale Reading {=pack:m1 .pack:Measurement label}
Weighed [12.5] {pack:value ^^xsd:decimal}, flagged [true] {pack:flag ^^xsd:boolean}, taken [2026-01-15T10:30:00] {pack:takenAt ^^xsd:dateTime}.

# Thermometer Reading {=pack:m2 .pack:Measurement label}
Weighed [36.6] {pack:value ^^xsd:decimal}, flagged [false] {pack:flag ^^xsd:boolean}, taken [2026-01-15T10:31:00] {pack:takenAt ^^xsd:dateTime}.
~~~~~~

## Spreadsheet-corrupted readings {=pack:xsdViolation .pack:Demo label}

[3] {pack:expectedViolations ^^xsd:integer}
`{"DatatypeShape":{},"MeasurementShape":{}}` {pack:extractedPOJO}

~~~~~~md {pack:demo}
[pack] <https://mdld.js.org/ns/pack/>

# Corrupted Reading {=pack:m3 .pack:Measurement label}
Imported [12,5] {pack:value ^^xsd:decimal} — European decimal comma; [yes] {pack:flag ^^xsd:boolean}; [Jan 15] {pack:takenAt ^^xsd:dateTime}.
~~~~~~
