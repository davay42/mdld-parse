[doc] <https://mdld.js.org/ontologies/xsd.md#>

# XML Schema Definition (XSD) Datatype Ontology {=doc:index}

## Introduction {=doc:Introduction}

XML Schema Definition (XSD) fundamentally serves as the structural grammar for data. While its origins lie in defining the content of XML documents, its datatypes have transcended XML to become the standard literal vocabulary for the Resource Description Framework (RDF) and modern Linked Data ecosystems. Operating under the standard namespace `[http://www.w3.org/2001/XMLSchema#](http://www.w3.org/2001/XMLSchema#)`, XSD ensures global data consistency and predictability across disparate systems.

As of 2026, the RDF ecosystem has distilled the extensive XSD vocabulary into a highly practical hierarchy. At the theoretical apex sits *anyType* {+xsd:anyType}, which branches into Complex Types (document structures) and Simple Types (literal values). However, modern usage categorizes these types based on their relevance to graph models rather than legacy XML document validation.

---

## Level 1: Most Used Terms (The Modern RDF Core) {=doc:Level1}

These primitives form the backbone of modern Turtle (TTL), RDF, and Linked Data applications. They represent the essential datatypes required for standard knowledge representation, completely independent of XML structural syntax.

### `xsd:string`

**Description:** Standard text values, labels, comments, and descriptions.
**MDLD Syntax Example:** `[Hello World] {ex:label ^^xsd:string}`

### `xsd:boolean`

**Description:** Binary true or false states for logical flags.
**MDLD Syntax Example:** `[true] {ex:isActive ^^xsd:boolean}`

### `xsd:integer`

**Description:** Standard whole numbers.
**MDLD Syntax Example:** `[42] {ex:count ^^xsd:integer}`

### `xsd:decimal`

**Description:** Precise decimal numbers, typically used for financial transactions or exact metrics where floating-point math rounding errors are unacceptable.
**MDLD Syntax Example:** `[3.14] {ex:ratio ^^xsd:decimal}`

### `xsd:double`

**Description:** Double-precision (64-bit) floating-point numbers for scientific and continuous scale calculations.
**MDLD Syntax Example:** `[3.1415926535] {ex:measure ^^xsd:double}`

### `xsd:float`

**Description:** Single-precision (32-bit) floating-point numbers.
**MDLD Syntax Example:** `[1.0E5] {ex:weight ^^xsd:float}`

### `xsd:dateTime`

**Description:** Timestamps combining a specific date, time, and optional timezone indicator.
**MDLD Syntax Example:** `[2026-06-01T14:46:34Z] {ex:timestamp ^^xsd:dateTime}`

### `xsd:date`

**Description:** Standard calendar dates without specific times or timezones (Format: YYYY-MM-DD).
**MDLD Syntax Example:** `[2026-06-01] {ex:created ^^xsd:date}`

### `xsd:time`

**Description:** Time of day without date or timezone contexts (Format: hh:mm:ss).
**MDLD Syntax Example:** `[14:46:34] {ex:timeOfDay ^^xsd:time}`

### `xsd:anyURI`

**Description:** Web identifiers and external resource links. In modern RDF, these are often replaced by direct object references, but the literal type remains vital for storing raw hyperlink strings.
**MDLD Syntax Example:** `[https://example.com] {ex:link ^^xsd:anyURI}`

---

## Level 2: Useful but Rare Terms (Domain-Specific) {=doc:Level2}

While not ubiquitous across all graphs, these specialized types provide necessary precision for specific business logic, interval tracking, string normalization, and constrained numeric ranges. They are excellent for strict SHACL (Shapes Constraint Language) validation in enterprise environments.

### `xsd:duration`

**Description:** General time intervals following the strict Y-M-D-T-H-M-S sequence.
**MDLD Syntax Example:** `[P1Y2M3DT4H5M6S] {ex:interval ^^xsd:duration}`

### `xsd:dayTimeDuration`

**Description:** Precise intervals limited strictly to days, hours, minutes, and seconds (no years or months).
**MDLD Syntax Example:** `[P1DT2H30M] {ex:sla ^^xsd:dayTimeDuration}`

### `xsd:yearMonthDuration`

**Description:** Intervals restricted to years and months, perfect for contract terms and billing cycles.
**MDLD Syntax Example:** `[P1Y2M] {ex:term ^^xsd:yearMonthDuration}`

### `xsd:dateTimeStamp`

**Description:** Identical to `dateTime`, but the timezone offset is strictly mandatory.
**MDLD Syntax Example:** `[2026-06-01T14:46:34+07:00] {ex:exactMoment ^^xsd:dateTimeStamp}`

### `xsd:nonNegativeInteger` & `xsd:positiveInteger`

**Description:** `nonNegativeInteger` includes zero and positive whole numbers (ideal for inventory logic). `positiveInteger` strictly requires 1 or greater (ideal for rankings).
**MDLD Syntax Example:** `[0] {ex:stockCount ^^xsd:nonNegativeInteger}`

### `xsd:nonPositiveInteger` & `xsd:negativeInteger`

**Description:** `nonPositiveInteger` includes zero and negative numbers. `negativeInteger` is strictly -1 or lower.
**MDLD Syntax Example:** `[-10] {ex:depth ^^xsd:negativeInteger}`

### `xsd:long`, `xsd:int`, `xsd:short`, `xsd:byte`

**Description:** Progressively smaller memory-bound integer constraints. Derived from `integer` to represent 64-bit, 32-bit, 16-bit, and 8-bit signed limits respectively.
**MDLD Syntax Example:** `[127] {ex:smallValue ^^xsd:byte}`

### `xsd:unsignedLong`, `xsd:unsignedInt`, `xsd:unsignedShort`, `xsd:unsignedByte`

**Description:** Progressively smaller memory-bound constraints for integers that cannot be negative.
**MDLD Syntax Example:** `[255] {ex:colorChannel ^^xsd:unsignedByte}`

### `xsd:normalizedString` & `xsd:token`

**Description:** `normalizedString` forbids carriage returns, line feeds, and tabs. `token` goes further by stripping leading/trailing spaces and collapsing multiple internal spaces into a single space.
**MDLD Syntax Example:** `[Clean Text] {ex:title ^^xsd:token}`

### `xsd:language`

**Description:** Specific language codes. Note that in modern RDF, standard `@` language tags on plain strings (e.g., `"Hello"@en`) are vastly preferred over this literal datatype.
**MDLD Syntax Example:** `[th] {ex:langCode ^^xsd:language}`

### **Gregorian Partial Dates (`xsd:gYear`, `xsd:gMonth`, `xsd:gDay`, `xsd:gYearMonth`, `xsd:gMonthDay`)**

**Description:** Represents isolated calendar components. `gYear` handles fiscal years; `gMonthDay` handles annual recurring events like birthdays; `gDay` handles monthly recurring dates.
**MDLD Syntax Example:** `[--06-01] {ex:holiday ^^xsd:gMonthDay}`

---

## Level 3: Deprecated and Abandoned Terms (XML Legacy) {=doc:Level3}

Modern graph models rely on direct URIs and Resource objects rather than document-internal identifiers. Consequently, XSD types originally designed for XML document validation, internal parsing, and DTD cross-referencing have been abandoned in contemporary RDF pipelines.

### `xsd:anyType`, `xsd:anySimpleType`, `xsd:anyAtomicType`

**Description:** The theoretical root wildcard types for XML structures.
**Modern Status:** Abandoned. Open-world RDF reasoning natively accommodates flexible typing without needing explicit wildcard declarations.

### `xsd:ID`, `xsd:IDREF`, `xsd:IDREFS`

**Description:** Used to create unique identifiers and document-internal cross-references within a single XML file.
**Modern Status:** Replaced entirely by direct URIs to represent entity identity and structural graph relationships natively.

### `xsd:ENTITY` & `xsd:ENTITIES`

**Description:** Used for unparsed external binary resource linking within XML.
**Modern Status:** Replaced by direct Resource URIs.

### `xsd:NOTATION`

**Description:** Associated a name with an external format in DTDs (like flagging a string as base64 or a specific image format).
**Modern Status:** Replaced by standard semantic metadata properties (e.g., `dct:format`).

### `xsd:QName`

**Description:** Combined namespace prefixes with local XML names (e.g., `xs:string`).
**Modern Status:** Handled natively by standard CURIE syntax or fully expanded URIs in Turtle/RDF processors.

### `xsd:Name` & `xsd:NCName`

**Description:** Enforced generic and local XML naming rules (e.g., forbidding spaces or starting with numbers).
**Modern Status:** URIs are utilized for all structural naming (predicates/classes); standard strings are utilized for descriptive values.

### `xsd:NMTOKEN` & `xsd:NMTOKENS`

**Description:** Highly restrictive name-like attribute values, often used for space-separated lists in XML tags.
**Modern Status:** Replaced by standard strings (`xsd:string`) backed by SHACL validation shapes, or by passing multiple individual RDF triples instead of space-separated strings.

### `xsd:base64Binary` & `xsd:hexBinary`

**Description:** Designed to hold inline base64 or hexadecimal encoded binary data directly inside XML elements.
**Modern Status:** While technically still valid, embedding raw binary data inside graphs causes massive performance degradation. Modern architectures store binary data in external blob storage and reference it via standard URIs and cryptographic hashes.