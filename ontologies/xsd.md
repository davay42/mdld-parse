[doc] <https://mdld.js.org/ontologies/xsd.md#>
[owl] <http://www.w3.org/2002/07/owl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# XML Schema Definition (XSD) Datatype Ontology {=xsd: owl:Ontology label}

XML Schema Definition (XSD) fundamentally serves as the structural grammar for data. While its origins lie in defining the content of XML documents, its datatypes have transcended XML to become the standard literal vocabulary for the Resource Description Framework (RDF) and modern Linked Data ecosystems. Operating under the standard namespace `http://www.w3.org/2001/XMLSchema#`, XSD ensures global data consistency and predictability across disparate systems.

As of 2026, the RDF ecosystem has distilled the extensive XSD vocabulary into a highly practical hierarchy. At the theoretical apex sits *anyType*, which branches into Complex Types (document structures) and Simple Types (literal values). However, modern usage categorizes these types based on their relevance to graph models rather than legacy XML document validation.

---

## Boolean
==========

### boolean {=xsd:boolean .Datatype label}

> Binary true or false states for logical flags. {comment}

`[true] {ex:isActive ^^xsd:boolean}` {doc:example}

## Strings
==========

### string {=xsd:string .Datatype label}

> Standard text values, labels, comments, and descriptions. {comment}

`[Hello World] {ex:label ^^xsd:string}` {doc:example}

### xsd:anyURI {=xsd:anyURI .Datatype label}

> Web identifiers and external resource links. In modern RDF, these are often replaced by direct object references, but the literal type remains vital for storing raw hyperlink strings. {comment}

`[https://example.com] {ex:link ^^xsd:anyURI}` {doc:example}

### xsd:normalizedString {=xsd:normalizedString .Datatype label}

> Forbids carriage returns, line feeds, and tabs, but allows leading, trailing, and multiple internal spaces. Useful for multi-word text that needs structure preservation. {comment}

`[  Spaced  Text  ] {ex:content ^^xsd:normalizedString}` {doc:example}

### xsd:token {=xsd:token .Datatype label}

> Derived from `normalizedString` — additionally strips leading/trailing spaces and collapses multiple internal spaces into single spaces. Ideal for normalized tags, keywords, and identifiers. {comment}

`[Clean Text] {ex:title ^^xsd:token}` {doc:example}

### xsd:language {=xsd:language .Datatype label}

> Specific language codes. Note that in modern RDF, standard `@` language tags on plain strings (e.g., `"Hello"@en`) are vastly preferred over this literal datatype. {comment}

`[th] {ex:langCode ^^xsd:language}` {doc:example}

## Date and time
================

### xsd:dateTime {=xsd:dateTime .Datatype label}

> Timestamps combining a specific date, time, and optional timezone indicator. {comment}

`[2026-06-01T14:46:34Z] {ex:timestamp ^^xsd:dateTime}` {doc:example}

### xsd:date {=xsd:date .Datatype label}

> Standard calendar dates without specific times or timezones (Format: `YYYY-MM-DD`). {comment}

`[2026-06-01] {ex:created ^^xsd:date}` {doc:example}

### xsd:time {=xsd:time .Datatype label}

> Time of day without date or timezone contexts (Format: `hh:mm:ss`). {comment}

`[14:46:34] {ex:timeOfDay ^^xsd:time}` {doc:example}

### xsd:dateTimeStamp {=xsd:dateTimeStamp .Datatype label}

> Identical to `dateTime`, but the timezone offset is strictly mandatory. {comment}

`[2026-06-01T14:46:34+07:00] {ex:exactMoment ^^xsd:dateTimeStamp}` {doc:example}


## Durations
============

### xsd:duration {=xsd:duration .Datatype label}

> General time intervals following the strict `Y-M-D-T-H-M-S` sequence. {comment}

`[P1Y2M3DT4H5M6S] {ex:interval ^^xsd:duration}` {doc:example}

### xsd:dayTimeDuration {=xsd:dayTimeDuration .Datatype label}

> Precise intervals limited strictly to days, hours, minutes, and seconds (no years or months). {comment}

`[P1DT2H30M] {ex:sla ^^xsd:dayTimeDuration}` {doc:example}

### xsd:yearMonthDuration {=xsd:yearMonthDuration .Datatype label}

> Intervals restricted to years and months, perfect for contract terms and billing cycles. {comment}

`[P1Y2M] {ex:term ^^xsd:yearMonthDuration}` {doc:example}

## Recurring dates
==================

### xsd:gYear {=xsd:gYear .Datatype label}

> Represents a specific year (e.g., fiscal years, founding years). Format: `YYYY`. {comment}

`[2026] {ex:fiscalYear ^^xsd:gYear}` {doc:example}

### xsd:gMonth {=xsd:gMonth .Datatype label}

> Represents a specific month recurring across all years. Format: `--MM`. {comment}

`[--06] {ex:birthdayMonth ^^xsd:gMonth}` {doc:example}

### xsd:gDay {=xsd:gDay .Datatype label}

> Represents a specific day recurring monthly. Format: `---DD`. {comment}

`[---15] {ex:payday ^^xsd:gDay}` {doc:example}

### xsd:gYearMonth {=xsd:gYearMonth .Datatype label}

> Represents a specific year and month combination. Format: `YYYY-MM`. {comment}

`[2026-06] {ex:reportPeriod ^^xsd:gYearMonth}` {doc:example}

### xsd:gMonthDay {=xsd:gMonthDay .Datatype label}

> Represents a month and day recurring annually (birthdays, holidays, anniversaries). Format: `--MM-DD`. {comment}

`[--06-01] {ex:holiday ^^xsd:gMonthDay}` {doc:example}

## Integer Numbers
==================

### integer {=xsd:integer .Datatype label}

> Standard whole numbers. {comment}

`[42] {ex:count ^^xsd:integer}` {doc:example}

### xsd:short {=xsd:short .Datatype label}

> 16-bit signed integer constraint. Used when memory conservation is critical or values are known to be small. {comment}

`[32767] {ex:portNumber ^^xsd:short}` {doc:example}

### xsd:int {=xsd:int .Datatype label}

> 32-bit signed integer constraint. Standard choice for most application-level numeric identifiers and measurements. {comment}

`[2147483647] {ex:pageNumber ^^xsd:int}` {doc:example}

### xsd:long {=xsd:long .Datatype label}

> 64-bit signed integer constraint. Suitable for large counters, identifiers, or timestamps. {comment}

`[9223372036854775807] {ex:bigCounter ^^xsd:long}` {doc:example}

## Fractional Numbers
=====================

### decimal {=xsd:decimal .Datatype label}

> Precise decimal numbers, typically used for financial transactions or exact metrics where floating-point math rounding errors are unacceptable. {comment}

`[3.14] {ex:ratio ^^xsd:decimal}` {doc:example}

### xsd:float {=xsd:float .Datatype label}

> Single-precision (32-bit) floating-point numbers. {comment}

`[1.0E5] {ex:weight ^^xsd:float}` {doc:example}

### xsd:double {=xsd:double .Datatype label}

> Double-precision (64-bit) floating-point numbers for scientific and continuous scale calculations. {comment}

`[3.1415926535] {ex:measure ^^xsd:double}` {doc:example}

## Range Integers
=================

### xsd:nonNegativeInteger {=xsd:nonNegativeInteger .Datatype label}

> Includes zero and positive whole numbers (ideal for inventory logic, quantities, or counts where zero is valid). {comment}

`[0] {ex:stockCount ^^xsd:nonNegativeInteger}` {doc:example}

### xsd:positiveInteger {=xsd:positiveInteger .Datatype label}

> Strictly requires 1 or greater (ideal for rankings, priorities, or sequences where zero has no meaning). {comment}

`[5] {ex:ranking ^^xsd:positiveInteger}` {doc:example}

### xsd:nonPositiveInteger {=xsd:nonPositiveInteger .Datatype label}

> Includes zero and negative numbers (useful for debits, losses, or depths where zero represents a reference point). {comment}

`[0] {ex:offset ^^xsd:nonPositiveInteger}` {doc:example}

### xsd:negativeInteger {=xsd:negativeInteger .Datatype label}

> Strictly -1 or lower (useful for representing deficits, temperature below reference, or belowground depth). {comment}

`[-10] {ex:depth ^^xsd:negativeInteger}` {doc:example}

## Bytes
========

### xsd:byte {=xsd:byte .Datatype label}

> 8-bit signed integer constraint. Useful for single-byte values or tightly packed binary data. {comment}

`[127] {ex:smallValue ^^xsd:byte}` {doc:example}

### xsd:unsignedByte {=xsd:unsignedByte .Datatype label}

> 8-bit unsigned integer constraint. Perfect for color channels, single-byte flags, or binary octet values. {comment}

`[255] {ex:colorChannel ^^xsd:unsignedByte}` {doc:example}

### xsd:unsignedShort {=xsd:unsignedShort .Datatype label}

> 16-bit unsigned integer constraint. Used for small non-negative values like port ranges or status codes. {comment}

`[65535] {ex:statusCode ^^xsd:unsignedShort}` {doc:example}

### xsd:unsignedInt {=xsd:unsignedInt .Datatype label}

> 32-bit unsigned integer constraint. Common for non-negative identifiers, measurements, or resource counts. {comment}

`[4294967295] {ex:resourceId ^^xsd:unsignedInt}` {doc:example}

### xsd:unsignedLong {=xsd:unsignedLong .Datatype label}

> 64-bit unsigned integer constraint. Useful for large counters or identifiers that never need negative values. {comment}

`[18446744073709551615] {ex:largeId ^^xsd:unsignedLong}` {doc:example}

### xsd:hexBinary {=xsd:hexBinary .Datatype label}

> Binary data encoded in hexadecimal representation. Used for checksums, hashes, or raw byte sequences. {comment}

`[ab44df0c78335c35] {ex:checksum ^^xsd:hexBinary}` {doc:example}

### xsd:base64Binary {=xsd:base64Binary .Datatype label}

> Binary data encoded using base64 alphabet. Common for embedding images, files, or cryptographic keys inline. {comment}

`[YWJjMTIz] {ex:imageData ^^xsd:base64Binary}` {doc:example}

---

## Deprecated and Abandoned Terms (XML Legacy)

Modern graph models rely on direct URIs and Resource objects rather than document-internal identifiers. Consequently, XSD types originally designed for XML document validation, internal parsing, and DTD cross-referencing have been abandoned in contemporary RDF pipelines.

### xsd:anyType {=xsd:anyType .Datatype label}

> The theoretical root wildcard type in the XML type hierarchy. Permits any content, structure, or nested elements. {comment}

**Modern Status:** Abandoned. Open-world RDF reasoning natively accommodates flexible typing without needing explicit wildcard declarations.

### xsd:anySimpleType {=xsd:anySimpleType .Datatype label}

> The theoretical root type for all XML simple types (scalar values with no internal structure). {comment}

**Modern Status:** Abandoned. RDF literals are inherently simple and unstructured; this explicit classification adds no semantic value.

### xsd:anyAtomicType {=xsd:anyAtomicType .Datatype label}

> The theoretical root type for indivisible, atomic simple types without list or union construction. {comment}

**Modern Status:** Abandoned. RDF's semantic model does not distinguish atomic from composite simple types at the ontological level.

### xsd:ID {=xsd:ID .Datatype label}

> Used to define unique identifier attributes within a single XML document. No forward/cross-file reference capability. {comment}

**Modern Status:** Replaced entirely by direct URIs. RDF subjects and blank nodes serve as globally unique or scoped identifiers.

### xsd:IDREF {=xsd:IDREF .Datatype label}

> Creates a reference to a single document-internal `xsd:ID`. Enables intra-document linking only. {comment}

**Modern Status:** Replaced by direct URI references or property paths in RDF. Modern graphs natively support universal resource linking.

### xsd:IDREFS {=xsd:IDREFS .Datatype label}

> Creates whitespace-separated references to multiple document-internal `xsd:ID` values. {comment}

**Modern Status:** Replaced by multiple individual RDF triples with object URIs or a properly structured collection predicate.

### xsd:ENTITY {=xsd:ENTITY .Datatype label}

> References a single unparsed external entity declared in the XML DTD (binary resource, image, format hint). {comment}

**Modern Status:** Replaced by direct Resource URIs or semantic properties like `rdfs:seeAlso` or custom ontology properties.

### xsd:ENTITIES {=xsd:ENTITIES .Datatype label}

> References multiple whitespace-separated unparsed external entities defined in the DTD. {comment}

**Modern Status:** Replaced by multiple individual RDF triples with Resource URIs or collection predicates.

### xsd:NOTATION {=xsd:NOTATION .Datatype label}

> Associated a name with an external format in DTDs (like flagging a string as base64 or a specific image format). {comment}

**Modern Status:** Replaced by standard semantic metadata properties (e.g., `dct:format`).

### xsd:QName {=xsd:QName .Datatype label}

> Combined namespace prefixes with local XML names (e.g., `xs:string`). {comment}

**Modern Status:** Handled natively by standard CURIE syntax or fully expanded URIs in Turtle/RDF processors.

### xsd:Name {=xsd:Name .Datatype label}

> Enforces generic XML naming rules: must start with a letter or underscore, contain letters, digits, hyphens, underscores, or periods. {comment}

**Modern Status:** Replaced by URIs for structural naming (predicates, class identifiers) and plain strings for descriptive values.

### xsd:NCName {=xsd:NCName .Datatype label}

> Non-Colonized Name: enforces XML naming rules but additionally forbids colons (preventing namespace prefix binding). {comment}

**Modern Status:** Replaced by fully expanded URIs (no namespace prefix binding needed) for structural identifiers and plain strings for values.

### xsd:NMTOKEN {=xsd:NMTOKEN .Datatype label}

> Name Token: enforces permissive XML naming syntax (letters, digits, hyphens, underscores, periods) but allows starting with any character except letters/underscore. Used for single keyword attributes. {comment}

**Modern Status:** Replaced by standard strings (`xsd:string`) backed by SHACL validation shapes for syntax constraints.

### xsd:NMTOKENS {=xsd:NMTOKENS .Datatype label}

> Multiple whitespace-separated name tokens in a single XML attribute value. Enforces permissive token syntax but packaged as space-delimited list. {comment}

**Modern Status:** Replaced by passing multiple individual RDF triples or using a properly structured collection (list or bag) rather than encoding multiple values in a single string.

