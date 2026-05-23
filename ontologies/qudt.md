[dc] <http://purl.org/dc/elements/1.1/>
[dcterms] <http://purl.org/dc/terms/>
[dtype] <http://www.linkedmodel.org/schema/dtype#>
[owl] <http://www.w3.org/2002/07/owl#>
[qudt] <http://qudt.org/schema/qudt/>
[skos] <http://www.w3.org/2004/02/skos/core#>
[vaem] <http://www.linkedmodel.org/schema/vaem#>
[voag] <http://voag.linkedmodel.org/schema/voag#>

# QUDT Schema - Version 3.1.2 {=http://qudt.org/schema/qudt .owl:Ontology label}

[QUDT Schema - Version 3.1.2] {+vaem:GMD_QUDT-SCHEMA ?vaem:hasGraphMetadata}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[http://www.linkedmodel.org/schema/dtype] {+http://www.linkedmodel.org/schema/dtype ?owl:imports}
[http://www.linkedmodel.org/schema/vaem] {+http://www.linkedmodel.org/schema/vaem ?owl:imports}
[http://www.w3.org/2004/02/skos/core] {+http://www.w3.org/2004/02/skos/core ?owl:imports}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?owl:versionIRI}

# abstract {=dcterms:abstract .owl:AnnotationProperty label}

[dcterms:] {+dcterms: ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# contributor {=dcterms:contributor .rdf:Property label}


# created {=dcterms:created .rdf:Property label}

[xsd:date] {+xsd:date ?range}

# creator {=dcterms:creator .owl:AnnotationProperty label}


# description {=dcterms:description .owl:DatatypeProperty label}


# is replaced by {=dcterms:isReplacedBy .owl:ObjectProperty label}


# modified {=dcterms:modified .rdf:Property label}

[xsd:date] {+xsd:date ?range}

# rights {=dcterms:rights .owl:AnnotationProperty label}

[xsd:string] {+xsd:string ?range}

# source {=dcterms:source .owl:AnnotationProperty label}

[dcterms:] {+dcterms: ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# subject {=dcterms:subject .owl:AnnotationProperty label}

[xsd:string] {+xsd:string ?range}

# title {=dcterms:title .owl:AnnotationProperty label}

[xsd:string] {+xsd:string ?range}

# Quantity Kind (abstract) {=qudt:AbstractQuantityKind .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Angle unit {=qudt:AngleUnit .owl:Class label}

[All units relating to specification of angles. ] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Dimensionless Unit] {+qudt:DimensionlessUnit ?subClassOf}
[http://dbpedia.org/resource/Category:Units_of_angle] {+http://dbpedia.org/resource/Category:Units_of_angle ?skos:exactMatch}

# QUDT Aspect {=qudt:Aspect .qudt:AspectClass label}

[An aspect is an abstract type class that defines properties that can be reused.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[owl:Thing] {+owl:Thing ?subClassOf}

# Aspect Class {=qudt:AspectClass .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Class] {+Class ?subClassOf}

# Base Dimension Magnitude {=qudt:BaseDimensionMagnitude .owl:Class label}

[http://en.wikipedia.org/wiki/Dimensional_analysis] {qudt:informativeReference ^^xsd:anyURI}
[http://web.mit.edu/2.25/www/pdf/DA_unified.pdf] {qudt:informativeReference ^^xsd:anyURI}
~~~ {comment ^^rdf:HTML}
<p class="lm-para">A <em>Dimension</em> expresses a magnitude for a base quantiy kind such as mass, length and time.</p>
<p class="lm-para">DEPRECATED - each exponent is expressed as a property. Keep until a validaiton of this has been done.</p>
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Big Endian {=qudt:BigEndian .qudt:EndianType label}

[big] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Binary Prefix {=qudt:BinaryPrefix .owl:Class label}

[A <em>Binary Prefix</em> is a prefix for multiples of units in data processing, data transmission, and digital information, notably the bit and the byte, to indicate multiplication by a power of 2.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Prefix] {+qudt:Prefix ?subClassOf}

# Bit Encoding {=qudt:BitEncoding .qudt:BitEncodingType label}

`1` {qudt:bits ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Bit Encoding {=qudt:BitEncodingType .owl:Class label}

[A bit encoding is a correspondence between the two possible values of a bit, 0 or 1, and some interpretation. For example, in a boolean encoding, a bit denotes a truth value, where 0 corresponds to False and 1 corresponds to True.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Encoding] {+qudt:Encoding ?subClassOf}

# Boolean Encoding {=qudt:BooleanEncoding .qudt:BooleanEncodingType label}

`1` {qudt:bits ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Boolean encoding type {=qudt:BooleanEncodingType .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Encoding] {+qudt:Encoding ?subClassOf}

# Byte Encoding {=qudt:ByteEncodingType .owl:Class label}

[This class contains the various ways that information may be encoded into bytes.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Encoding] {+qudt:Encoding ?subClassOf}

# Countably Infinite Cardinality Type {=qudt:CT_COUNTABLY-INFINITE .qudt:CardinalityType label}

~~~ {dcterms:description ^^qudt:LatexString}

  A set of numbers is called countably infinite if there is a way to enumerate them. 
  Formally this is done with a bijection function that associates each number in the set with exactly one of the positive integers.
  The set of all fractions is also countably infinite.
  In other words, any set $X$ that has the same cardinality as the set of the natural numbers,
   or $| X | \; =  \; | \mathbb N | \; = \; \aleph0$, is said to be a countably infinite set.
  
~~~

[http://www.math.vanderbilt.edu/~schectex/courses/infinity.pdf] {qudt:informativeReference ^^xsd:anyURI}
[countable] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Finite Cardinality Type {=qudt:CT_FINITE .qudt:CardinalityType label}

[Any set $X$ with cardinality less than that of the natural numbers, or $| X | \; <  \; | \mathbb N | $, is said to be a finite set.] {dcterms:description ^^qudt:LatexString}
[finite] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Uncountable Cardinality Type {=qudt:CT_UNCOUNTABLE .qudt:CardinalityType label}

[Any set with cardinality greater than that of the natural numbers, or $| X | \; >  \; | \mathbb N | $,  for example $| R| \; =  \;  c  \; > |\mathbb N |$, is said to be uncountable.] {dcterms:description ^^qudt:LatexString}
[uncountable] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Cardinality Type {=qudt:CardinalityType .owl:Class label}

~~~ {dcterms:description ^^qudt:LatexString}

  In mathematics, the cardinality of a set is a measure of the number of elements of the set.
  For example, the set $A = {2, 4, 6}$ contains 3 elements, and therefore $A$ has a cardinality of 3. 
  There are two approaches to cardinality: one which compares sets directly using bijections and injections,
   and another which uses cardinal numbers.
  
~~~

[http://en.wikipedia.org/wiki/Cardinal_number] {qudt:informativeReference ^^xsd:anyURI}
[http://en.wikipedia.org/wiki/Cardinality] {qudt:informativeReference ^^xsd:anyURI}
[In mathematics, the cardinality of a set is a measure of the number of elements of the set.  For example, the set 'A = {2, 4, 6}' contains 3 elements, and therefore 'A' has a cardinality of 3. There are two approaches to cardinality – one which compares sets directly using bijections and injections, and another which uses cardinal numbers.] {qudt:plainTextDescription}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# Char Encoding {=qudt:CharEncoding .qudt:BooleanEncodingType .qudt:CharEncodingType label}

[7 bits of 1 octet] {dc:description}
`1` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Char Encoding Type {=qudt:CharEncodingType .owl:Class label}

[The class of all character encoding schemes, each of which defines a rule or algorithm for encoding character data as a sequence of bits or bytes.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Encoding] {+qudt:Encoding ?subClassOf}

# Citation {=qudt:Citation .owl:Class label}

[Provides a simple way of making citations.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Comment {=qudt:Comment .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Verifiable] {+qudt:Verifiable ?subClassOf}
[owl:Thing] {+owl:Thing ?subClassOf}

# QUDT Concept {=qudt:Concept .owl:Class label}

[The root class for all QUDT concepts.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[owl:Thing] {+owl:Thing ?subClassOf}

# Constant value {=qudt:ConstantValue .owl:Class label}

[Used to specify the values of a constant.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity value] {+qudt:QuantityValue ?subClassOf}

# Contextual Unit {=qudt:ContextualUnit .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?subClassOf}

# Counting Unit {=qudt:CountingUnit .owl:Class label}

[Used for all units that express counts. Examples are Atomic Number, Number, Number per Year, Percent and Sample per Second.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Dimensionless Unit] {+qudt:DimensionlessUnit ?subClassOf}

# Currency Unit {=qudt:CurrencyUnit .owl:Class label}

[Currency Units have their own subclass of unit because: (a) they have additonal properites such as 'country' and (b) their URIs do not conform to the same rules as other units.] {comment ^^rdf:HTML}
[Used for all units that express currency.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Dimensionless Unit] {+qudt:DimensionlessUnit ?subClassOf}

# Data Encoding {=qudt:DataEncoding .owl:Class label}

[<p><em>Data Encoding</em> expresses the properties that specify how data is represented at the bit and byte level. These properties are applicable to describing raw data.</p>] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Aspect] {+qudt:Aspect ?subClassOf}

# Data Item {=qudt:DataItem .owl:Class label}

~~~ {dcterms:description ^^rdf:HTML}

  <p>A <em>Data Item</em> holds a value that maybe a scalar or structured datatype.
  <em>Quantity Value</em> specifies which case applies.
  </p>
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# QUDT Datatype {=qudt:Datatype .owl:Class label}

~~~ {dcterms:description ^^rdf:HTML}

   <p>A <em>Datatype</em> is a definition of the type of the "value" of a data item (for example, "all integers between 0 and 10"),
   and the allowable operations on those values; the meaning of the data; and the way values of that type can be stored. 
  Some types are primitive - built-in to the language, with no visible internal structure.
  For example "Boolean"; others are composite - constructed from one or more other types (of either kind).
  For example lists, arrays, structures, unions. 
  Some languages provide strong typing, others allow implicit type conversion and/or explicit type conversion.
  </p>
~~~

[http://en.wikipedia.org/wiki/Data_type] {qudt:informativeReference ^^xsd:anyURI}
[http://foldoc.org/data+type] {qudt:informativeReference ^^xsd:anyURI}
[http://www.princeton.edu/~achaney/tmve/wiki100k/docs/Data_type.html] {qudt:informativeReference ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Date Time String Encoding Type {=qudt:DateTimeStringEncodingType .owl:Class label}

[Date Time encodings are logical encodings for expressing date/time quantities as strings by applying unambiguous formatting and parsing rules.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[qudt:StringEncodingType] {+qudt:StringEncodingType ?subClassOf}

# Decimal Prefix {=qudt:DecimalPrefix .owl:Class label}

[A <em>Decimal Prefix</em> is a prefix for multiples of units that are powers of 10.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Prefix] {+qudt:Prefix ?subClassOf}

# Derived Unit {=qudt:DerivedUnit .owl:Class label}

[http://dbpedia.org/resource/Category:SI_derived_units] {qudt:dbpediaMatch ^^xsd:anyURI}
[A DerivedUnit is a type specification for units that are derived from other units.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?subClassOf}

# Dimensionless Unit {=qudt:DimensionlessUnit .owl:Class label}

[A Dimensionless Unit is a quantity for which all the exponents of the factors corresponding to the base quantities in its quantity dimension are zero.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?subClassOf}

# Discipline {=qudt:Discipline .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Single Precision Real Encoding {=qudt:DoublePrecisionEncoding .qudt:FloatingPointEncodingType label}

`64` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Encoding {=qudt:Encoding .owl:Class label}

[An encoding is a rule or algorithm that is used to convert data from a native, or unspecified form into a specific form that satisfies the encoding rules. Examples of encodings include character encodings, such as UTF-8.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Endian Type {=qudt:EndianType .owl:Class label}

[http://en.wikipedia.org/wiki/Endianness] {qudt:informativeReference ^^xsd:anyURI}
[In computing, endianness is the ordering used to represent some kind of data as a sequence of smaller units. Typical cases are the order in which integer values are stored as bytes in computer memory (relative to a given memory addressing scheme) and the transmission order over a network or other medium. When specifically talking about bytes, endianness is also referred to simply as byte order.  Most computer processors simply store integers as sequences of bytes, so that, conceptually, the encoded value can be obtained by simple concatenation. For an 'n-byte' integer value this allows 'n!' (n factorial) possible representations (one for each byte permutation). The two most common of them are: increasing numeric significance with increasing memory addresses, known as little-endian, and its opposite, called big-endian.] {qudt:plainTextDescription}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# Enumerated Quantity {=qudt:EnumeratedQuantity .qudt:AspectClass label}

[QUDT Concept] {+qudt:Concept ?subClassOf}

# Enumerated Value {=qudt:EnumeratedValue .owl:Class label}

~~~ {dcterms:description ^^rdf:HTML}
<p>This class is for all enumerated and/or coded values.  For example, it contains the dimension objects that are the basis elements in some abstract vector space associated with a quantity kind system. Another use is for the base dimensions for quantity systems. Each quantity kind system that defines a base set has a corresponding ordered enumeration whose elements are the dimension objects for the base quantity kinds. The order of the dimensions in the enumeration determines the canonical order of the basis elements in the corresponding abstract vector space.</p>

<p>An enumeration is a set of literals from which a single value is selected. Each literal can have a tag as an integer within a standard encoding appropriate to the range of integer values. Consistency of enumeration types will allow them, and the enumerated values, to be referred to unambiguously either through symbolic name or encoding. Enumerated values are also controlled vocabularies and as such need to be standardized. Without this consistency enumeration literals can be stated differently and result in  data conflicts and misinterpretations.</p>

<p>The tags are a set of positive whole numbers, not necessarily contiguous and having no numerical significance, each corresponding to the associated literal identifier. An order attribute can also be given on the enumeration elements. An enumeration can itself be a member of an enumeration. This allows enumerations to be enumerated in a selection. Enumerations are also subclasses of Scalar Datatype. This allows them to be used as the reference of a datatype specification.</p>
~~~

[http://en.wikipedia.org/wiki/Enumeration] {qudt:informativeReference ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Verifiable] {+qudt:Verifiable ?subClassOf}
[dtype:EnumeratedValue] {+dtype:EnumeratedValue ?subClassOf}

# Enumeration {=qudt:Enumeration .owl:Class label}

[http://dbpedia.org/resource/Enumeration] {qudt:dbpediaMatch ^^xsd:anyURI}
[http://en.wikipedia.org/wiki/Enumerated_type] {qudt:informativeReference ^^xsd:anyURI}
[http://en.wikipedia.org/wiki/Enumeration] {qudt:informativeReference ^^xsd:anyURI}
~~~ {comment ^^rdf:HTML}
<p>An enumeration is a set of literals from which a single value is selected. Each literal can have a tag as an integer within a standard encoding appropriate to the range of integer values. Consistency of enumeration types will allow them, and the enumerated values, to be referred to unambiguously either through symbolic name or encoding. Enumerated values are also controlled vocabularies and as such need to be standardized. Without this consistency enumeration literals can be stated differently and result in  data conflicts and misinterpretations.</p>

<p>The tags are a set of positive whole numbers, not necessarily contiguous and having no numerical significance, each corresponding to the associated literal identifier. An order attribute can also be given on the enumeration elements. An enumeration can itself be a member of an enumeration. This allows enumerations to be enumerated in a selection. Enumerations are also subclasses of <em>Scalar Datatype</em>. This allows them to be used as the reference of a datatype specification.</p>
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[dtype:Enumeration] {+dtype:Enumeration ?subClassOf}

# Enumeration scale {=qudt:EnumerationScale .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Scale] {+qudt:Scale ?subClassOf}
[dtype:Enumeration] {+dtype:Enumeration ?subClassOf}

# Figure {=qudt:Figure .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Floating Point Encoding {=qudt:FloatingPointEncodingType .owl:Class label}

[A "Encoding" with the following instance(s): "Double Precision Encoding", "Single Precision Real Encoding".] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Encoding] {+qudt:Encoding ?subClassOf}

# IEEE 754 1985 Real Encoding {=qudt:IEEE754_1985RealEncoding .qudt:FloatingPointEncodingType label}

`32` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# ISO 8601 UTC Date Time - Basic Format {=qudt:ISO8601-UTCDateTime-BasicFormat .qudt:DateTimeStringEncodingType label}

[[0-9]{4}[0-9]{2}[0-9]{2}T[0-9]{2}[0-9]{2}[0-9]{2}.[0-9]+Z] {qudt:allowedPattern}
[[0-9]{4}[0-9]{2}[0-9]{2}T[0-9]{2}[0-9]{2}[0-9]{2}Z] {qudt:allowedPattern}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Integer Encoding {=qudt:IntegerEncodingType .owl:Class label}

[The encoding scheme for integer types] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Encoding] {+qudt:Encoding ?subClassOf}

# Interval scale {=qudt:IntervalScale .owl:Class label}

[https://en.wikipedia.org/wiki/Level_of_measurement] {qudt:informativeReference ^^xsd:anyURI}
~~~ {comment ^^rdf:HTML}
<p>The interval type allows for the degree of difference between items, but not the ratio between them. Examples include temperature with the Celsius scale, which has two defined points (the freezing and boiling point of water at specific conditions) and then separated into 100 intervals, date when measured from an arbitrary epoch (such as AD), percentage such as a percentage return on a stock,[16] location in Cartesian coordinates, and direction measured in degrees from true or magnetic north. Ratios are not meaningful since 20 °C cannot be said to be "twice as hot" as 10 °C, nor can multiplication/division be carried out between any two dates directly. However, ratios of differences can be expressed; for example, one difference can be twice another. Interval type variables are sometimes also called "scaled variables", but the formal mathematical term is an affine space (in this case an affine line).</p>
<p>Characteristics: median, percentile &amp; Monotonic increasing (order (&lt;) &amp; totally ordered set</p>
~~~

[median, percentile & Monotonic increasing (order (<)) & totally ordered set] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Nominal scale] {+qudt:NominalScale ?seeAlso}
[Ordinal scale] {+qudt:OrdinalScale ?seeAlso}
[Ratio scale] {+qudt:RatioScale ?seeAlso}
[Scale] {+qudt:Scale ?subClassOf}

# Latex String {=qudt:LatexString .Datatype label}

[A type of string in which some characters may be wrapped with '$' and '$ characters for LaTeX rendering.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?subClassOf}

# Little Endian {=qudt:LittleEndian .qudt:EndianType label}

[little] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Logarithmic Unit {=qudt:LogarithmicUnit .owl:Class label}

[Logarithmic units are abstract mathematical units that can be used to express any quantities (physical or mathematical) that are defined on a logarithmic scale, that is, as being proportional to the value of a logarithm function. Examples of logarithmic units include common units of information and entropy, such as the bit, and the byte, as well as units of relative signal strength magnitude such as the decibel.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Dimensionless Unit] {+qudt:DimensionlessUnit ?subClassOf}

# Long Unsigned Integer Encoding {=qudt:LongUnsignedIntegerEncoding .qudt:IntegerEncodingType label}

`8` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Maths Function Type {=qudt:MathsFunctionType .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# NIST SP~811 Comment {=qudt:NIST_SP811_Comment .owl:Class label}

[National Institute of Standards and Technology (NIST) Special Publication 811 Comments on some quantities and their units] {dc:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Comment] {+qudt:Comment ?subClassOf}

# Nominal scale {=qudt:NominalScale .owl:Class label}

[https://en.wikipedia.org/wiki/Level_of_measurement] {qudt:informativeReference ^^xsd:anyURI}
[A nominal scale differentiates between items or subjects based only on their names or (meta-)categories and other qualitative classifications they belong to; thus dichotomous data involves the construction of classifications as well as the classification of items. Discovery of an exception to a classification can be viewed as progress. Numbers may be used to represent the variables but the numbers do not have numerical value or relationship: For example, a Globally unique identifier. Examples of these classifications include gender, nationality, ethnicity, language, genre, style, biological species, and form. In a university one could also use hall of affiliation as an example.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Interval scale] {+qudt:IntervalScale ?seeAlso}
[Ordinal scale] {+qudt:OrdinalScale ?seeAlso}
[Ratio scale] {+qudt:RatioScale ?seeAlso}
[Scale] {+qudt:Scale ?subClassOf}

# Numeric union {=qudt:NumericUnion .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[dtype:numericUnion] {+dtype:numericUnion ?subClassOf}

# OCTET Encoding {=qudt:OctetEncoding .qudt:BooleanEncodingType .qudt:ByteEncodingType label}

`1` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Ordered type {=qudt:OrderedType .owl:Class label}

[Describes how a data or information structure is ordered.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# Ordinal scale {=qudt:OrdinalScale .owl:Class label}

[https://en.wikipedia.org/wiki/Level_of_measurement] {qudt:informativeReference ^^xsd:anyURI}
[The ordinal type allows for rank order (1st, 2nd, 3rd, etc.) by which data can be sorted, but still does not allow for relative degree of difference between them. Examples include, on one hand, dichotomous data with dichotomous (or dichotomized) values such as 'sick' vs. 'healthy' when measuring health, 'guilty' vs. 'innocent' when making judgments in courts, 'wrong/false' vs. 'right/true' when measuring truth value, and, on the other hand, non-dichotomous data consisting of a spectrum of values, such as 'completely agree', 'mostly agree', 'mostly disagree', 'completely disagree' when measuring opinion.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Interval scale] {+qudt:IntervalScale ?seeAlso}
[Nominal scale] {+qudt:NominalScale ?seeAlso}
[Ratio scale] {+qudt:RatioScale ?seeAlso}
[Scale] {+qudt:Scale ?subClassOf}

# Organization {=qudt:Organization .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Partially Ordered {=qudt:PartiallyOrdered .qudt:OrderedType label}

[Partial ordered structure.] {qudt:plainTextDescription}
[partial] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Physical Constant {=qudt:PhysicalConstant .owl:Class label}

[http://dbpedia.org/resource/Physical_constant] {qudt:dbpediaMatch ^^xsd:anyURI}
[A physical constant is a physical quantity that is generally believed to be both universal in nature and constant in time. It can be contrasted with a mathematical constant, which is a fixed numerical value but does not directly involve any physical measurement. There are many physical constants in science, some of the most widely recognized being the speed of light in vacuum c, Newton's gravitational constant G, Planck's constant h, the electric permittivity of free space ε0, and the elementary charge e. Physical constants can take many dimensional forms, or may be dimensionless depending on the system of quantities and units used.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity] {+qudt:Quantity ?subClassOf}

# Plane Angle Unit {=qudt:PlaneAngleUnit .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Angle unit] {+qudt:AngleUnit ?subClassOf}

# Prefix {=qudt:Prefix .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Verifiable] {+qudt:Verifiable ?subClassOf}

# Quantifiable {=qudt:Quantifiable .owl:Class label}

[<p><em>Quantifiable</em> ascribes to some thing the capability of being measured, observed, or counted.</p>] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Aspect] {+qudt:Aspect ?subClassOf}

# Quantity {=qudt:Quantity .owl:Class label}

[http://dbpedia.org/resource/Quantity] {qudt:dbpediaMatch ^^xsd:anyURI}
~~~ {comment ^^rdf:HTML}
<p class="lm-para">A <b>quantity</b> is the measurement of an observable property of a particular object, event, or physical system. 
  A quantity is always associated with the context of measurement (i.e. the thing measured, the measured value, the accuracy of measurement, etc.) whereas the 
  underlying <b>quantity kind</b> is independent of any particular measurement. Thus, length is a quantity kind while the height of a rocket is a specific 
  quantity of length; its magnitude that may be expressed in meters, feet, inches, etc. Examples of physical quantities include physical constants, such as 
  the speed of light in a vacuum, Planck's constant, the electric permittivity of free space, and the fine structure constant. </p>
<p class="lm-para">In other words, quantities are quantifiable aspects of the world, such as the duration of a movie, the distance between two points, 
velocity of a car, the pressure of the atmosphere, and a person's weight; and units are used to describe their numerical measure.</p> 
<p class="lm-para">Many <b>quantity kinds</b> are related to each other by various physical laws, and as a result, the associated units of some quantity 
kinds can be expressed as products (or ratios) of powers of other quantity kinds (e.g., momentum is mass times velocity and velocity is defined as distance 
divided by time). In this way, some quantities can be calculated from other measured quantities using their associations to the quantity kinds in these 
expressions. These quantity kind relationships are also discussed in dimensional analysis. Those that cannot be so expressed can be regarded 
as "fundamental" in this sense.</p>
<p class="lm-para">A quantity is distinguished from a "quantity kind" in that the former carries a value and the latter is a type specifier.</p>
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Quantifiable] {+qudt:Quantifiable ?subClassOf}

# Quantity Kind {=qudt:QuantityKind .owl:Class label}

[http://www.electropedia.org/iev/iev.nsf/display?openform&ievref=112-01-04] {qudt:informativeReference ^^xsd:anyURI}
[A <b>Quantity Kind</b> is any observable property that can be  measured and quantified numerically. Familiar examples include physical properties such as length, mass, time, force, energy, power, electric charge, etc. Less familiar examples include currency, interest rate, price to earning ratio, and information capacity.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind (abstract)] {+qudt:AbstractQuantityKind ?subClassOf}
[Verifiable] {+qudt:Verifiable ?subClassOf}

# Quantity Kind Dimension Vector {=qudt:QuantityKindDimensionVector .owl:Class label}

[http://en.wikipedia.org/wiki/Dimensional_analysis] {qudt:informativeReference ^^xsd:anyURI}
[http://web.mit.edu/2.25/www/pdf/DA_unified.pdf] {qudt:informativeReference ^^xsd:anyURI}
~~~ {comment ^^rdf:HTML}
<p class="lm-para">A  <em>Quantity Kind Dimension Vector</em> describes the dimensionality of a quantity kind in the context of a system of units. In the SI system of units, the dimensions of a quantity kind are expressed as a product of the basic physical dimensions mass ($M$), length ($L$), time ($T$) current ($I$), amount of substance ($N$), luminous intensity ($J$) and absolute temperature ($\theta$) as $dim \, Q = L^{\alpha} \, M^{\beta} \, T^{\gamma} \, I ^{\delta} \, \theta ^{\epsilon} \, N^{\eta} \, J ^{\nu}$.</p>

<p class="lm-para">The rational powers of the dimensional exponents, $\alpha, \, \beta, \, \gamma, \, \delta, \, \epsilon, \, \eta, \, \nu$, are positive, negative, or zero.</p>

<p class="lm-para">For example, the dimension of the physical quantity kind $\it{speed}$ is $\boxed{length/time}$, $L/T$ or $LT^{-1}$, and the dimension of the physical quantity kind force is $\boxed{mass \times acceleration}$ or $\boxed{mass \times (length/time)/time}$, $ML/T^2$ or $MLT^{-2}$ respectively.</p>
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# CGS Dimension vector {=qudt:QuantityKindDimensionVector_CGS .owl:Class label}

[A <em>CGS Dimension Vector</em> is used to specify the dimensions for a C.G.S. quantity kind.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?subClassOf}

# CGS EMU Dimension vector {=qudt:QuantityKindDimensionVector_CGS-EMU .owl:Class label}

[A <em>CGS EMU Dimension Vector</em> is used to specify the dimensions for EMU C.G.S. quantity kind.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[CGS Dimension vector] {+qudt:QuantityKindDimensionVector_CGS ?subClassOf}

# CGS ESU Dimension vector {=qudt:QuantityKindDimensionVector_CGS-ESU .owl:Class label}

[A <em>CGS ESU Dimension Vector</em> is used to specify the dimensions for ESU C.G.S. quantity kind.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[CGS Dimension vector] {+qudt:QuantityKindDimensionVector_CGS ?subClassOf}

# CGS GAUSS Dimension vector {=qudt:QuantityKindDimensionVector_CGS-GAUSS .owl:Class label}

[A <em>CGS GAUSS Dimension Vector</em> is used to specify the dimensions for Gaussioan C.G.S. quantity kind.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[CGS Dimension vector] {+qudt:QuantityKindDimensionVector_CGS ?subClassOf}

# CGS LH Dimension vector {=qudt:QuantityKindDimensionVector_CGS-LH .owl:Class label}

[A <em>CGS LH Dimension Vector</em> is used to specify the dimensions for Lorentz-Heaviside C.G.S. quantity kind.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[CGS Dimension vector] {+qudt:QuantityKindDimensionVector_CGS ?subClassOf}

# ISO Dimension vector {=qudt:QuantityKindDimensionVector_ISO .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?subClassOf}

# Imperial dimension vector {=qudt:QuantityKindDimensionVector_Imperial .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?subClassOf}

# Quantity Kind Dimension vector (SI) {=qudt:QuantityKindDimensionVector_SI .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?subClassOf}

# Quantity type {=qudt:QuantityType .owl:Class label}

~~~ {dcterms:description ^^qudt:LatexString}

  A $\textit{Quantity Type}$ is an enumeration of quantity kinds. 
  It specializes $\boxed{dtype:EnumeratedValue}$ by constrinaing $\boxed{dtype:value}$ to instances of $\boxed{qudt:QuantityKind}$.
  
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# Quantity value {=qudt:QuantityValue .owl:Class label}

[A <i>Quantity Value</i> expresses the magnitude and kind of a quantity and is given by the product of a numerical value <code>n</code> and a unit of measure <code>U</code>. The number multiplying the unit is referred to as the numerical value of the quantity expressed in that unit. Refer to <a href="http://physics.nist.gov/Pubs/SP811/sec07.html">NIST SP 811 section 7</a> for more on quantity values.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Quantifiable] {+qudt:Quantifiable ?subClassOf}

# Ratio scale {=qudt:RatioScale .owl:Class label}

[https://en.wikipedia.org/wiki/Level_of_measurement] {qudt:informativeReference ^^xsd:anyURI}
[The ratio type takes its name from the fact that measurement is the estimation of the ratio between a magnitude of a continuous quantity and a unit magnitude of the same kind (Michell, 1997, 1999). A ratio scale possesses a meaningful (unique and non-arbitrary) zero value. Most measurement in the physical sciences and engineering is done on ratio scales. Examples include mass, length, duration, plane angle, energy and electric charge. In contrast to interval scales, ratios are now meaningful because having a non-arbitrary zero point makes it meaningful to say, for example, that one object has "twice the length" of another (= is "twice as long"). Very informally, many ratio scales can be described as specifying "how much" of something (i.e. an amount or magnitude) or "how many" (a count). The Kelvin temperature scale is a ratio scale because it has a unique, non-arbitrary zero point called absolute zero.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Interval scale] {+qudt:IntervalScale ?seeAlso}
[Nominal scale] {+qudt:NominalScale ?seeAlso}
[Ordinal scale] {+qudt:OrdinalScale ?seeAlso}
[Scale] {+qudt:Scale ?subClassOf}

# Rule {=qudt:Rule .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Verifiable] {+qudt:Verifiable ?subClassOf}

# Rule Type {=qudt:RuleType .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# Signed {=qudt:SIGNED .qudt:SignednessType label}

[signed] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Scalar Datatype {=qudt:ScalarDatatype .owl:Class label}

[Scalar data types are those that have a single value. The permissible values are defined over a domain that may be integers, float, character or boolean. Often a scalar data type is referred to as a primitive data type.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Datatype] {+qudt:Datatype ?subClassOf}

# Scale {=qudt:Scale .owl:Class label}

[Scales (also called "scales of measurement" or "levels of measurement")  are expressions that typically refer to the theory of scale types.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# Scale type {=qudt:ScaleType .owl:Class label}

[Scales, or scales of measurement (or categorization) provide ways of quantifying measurements, values and other enumerated values according to a normative frame of reference.  Four different types of scales are typically used. These are interval, nominal, ordinal and ratio scales.] {qudt:plainTextDescription}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# Short Signed Integer Encoding {=qudt:ShortSignedIntegerEncoding .qudt:IntegerEncodingType label}

`2` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Short Unsigned Integer Encoding {=qudt:ShortUnsignedIntegerEncoding .qudt:BooleanEncodingType .qudt:IntegerEncodingType label}

`2` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Signed Integer Encoding {=qudt:SignedIntegerEncoding .qudt:IntegerEncodingType label}

`4` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Single Precision Real Encoding {=qudt:SinglePrecisionRealEncoding .qudt:FloatingPointEncodingType label}

`32` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Solid Angle Unit {=qudt:SolidAngleUnit .owl:Class label}

[The solid angle subtended by a surface S is defined as the surface area of a unit sphere covered by the surface S's projection onto the sphere. A solid angle is related to the surface of a sphere in the same way an ordinary angle is related to the circumference of a circle. Since the total surface area of the unit sphere is 4*pi, the measure of solid angle will always be between 0 and 4*pi.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Angle unit] {+qudt:AngleUnit ?subClassOf}

# Statement {=qudt:Statement .Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[rdf:Statement] {+rdf:Statement ?subClassOf}

# Symbol {=qudt:Symbol .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# System of Quantity Kinds {=qudt:SystemOfQuantityKinds .owl:Class label}

[A system of quantity kinds is a set of one or more quantity kinds together with a set of zero or more algebraic equations that define relationships between quantity kinds in the set. In the physical sciences, the equations relating quantity kinds are typically physical laws and definitional relations, and constants of proportionality. Examples include Newton’s First Law of Motion, Coulomb’s Law, and the definition of velocity as the instantaneous change in position.  In almost all cases, the system identifies a subset of base quantity kinds. The base set is chosen so that all other quantity kinds of interest can be derived from the base quantity kinds and the algebraic equations. If the unit system is explicitly associated with a quantity kind system, then the unit system must define at least one unit for each quantity kind.  From a scientific point of view, the division of quantities into base quantities and derived quantities is a matter of convention.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}

# System of Units {=qudt:SystemOfUnits .owl:Class label}

[http://dbpedia.org/resource/Category:Systems_of_units] {qudt:informativeReference ^^xsd:anyURI}
[http://www.ieeeghn.org/wiki/index.php/System_of_Measurement_Units] {qudt:informativeReference ^^xsd:anyURI}
[A system of units is a set of units which are chosen as the reference scales for some set of quantity kinds together with the definitions of each unit. Units may be defined by experimental observation or by proportion to another unit not included in the system. If the unit system is explicitly associated with a quantity kind system, then the unit system must define at least one unit for each quantity kind.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Verifiable] {+qudt:Verifiable ?subClassOf}

# Totally Ordered {=qudt:TotallyOrdered .qudt:OrderedType label}

[Totally ordered structure.] {qudt:plainTextDescription}
[total] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Transform type {=qudt:TransformType .owl:Class label}

[Transform type] {skos:prefLabel}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumerated Value] {+qudt:EnumeratedValue ?subClassOf}

# case-sensitive UCUM code {=qudt:UCUMcs .Datatype label}

[https://ucum.org/ucum.html] {dcterms:source ^^xsd:anyURI}
[Lexical pattern for the case-sensitive version of UCUM code] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[https://ucum.org/ucum.html] {+https://ucum.org/ucum.html ?seeAlso}
[Resource] {+Resource ?subClassOf}
[xsd:string] {+xsd:string ?owl:onDatatype}

# case-sensitive UCUM terminal {=qudt:UCUMcs-term .Datatype label}

[https://ucum.org/ucum.html] {dcterms:source ^^xsd:anyURI}
[Lexical pattern for the terminal symbols in the case-sensitive version of UCUM code] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[https://ucum.org/ucum.html] {+https://ucum.org/ucum.html ?seeAlso}
[Resource] {+Resource ?subClassOf}
[xsd:string] {+xsd:string ?owl:onDatatype}

# Unsigned {=qudt:UNSIGNED .qudt:SignednessType label}

[unsigned] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Unit {=qudt:Unit .owl:Class label}

~~~ {dcterms:description ^^qudt:LatexString}

  A unit of measure, or unit, is a particular quantity value that has been chosen as a scale for measuring other quantities the same kind (more generally of equivalent dimension). 
  For example, the meter is a quantity of length that has been rigorously defined and standardized by the BIPM (International Board of Weights and Measures). 
  Any measurement of the length can be expressed as a number multiplied by the unit meter. 
  More formally, the value of a physical quantity Q with respect to a unit (U) is expressed as the scalar multiple of a real number (n) and U, as  $Q = nU$.
  
~~~

[http://dbpedia.org/resource/Category:Units_of_measure] {qudt:informativeReference ^^xsd:anyURI}
[http://www.allmeasures.com/Fullconversion.asp] {qudt:informativeReference ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?subClassOf}
[Verifiable] {+qudt:Verifiable ?subClassOf}

# Unordered {=qudt:Unordered .qudt:OrderedType label}

[Unordered structure.] {qudt:plainTextDescription}
[unordered] {dtype:literal}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Unsigned Integer Encoding {=qudt:UnsignedIntegerEncoding .qudt:IntegerEncodingType label}

`4` {qudt:bytes ^^xsd:integer}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# User Quantity Kind {=qudt:UserQuantityKind .owl:Class label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind (abstract)] {+qudt:AbstractQuantityKind ?subClassOf}

# Verifiable {=qudt:Verifiable .qudt:AspectClass label}

[An aspect class that holds properties that provide external knowledge and specifications of a given resource.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Aspect] {+qudt:Aspect ?subClassOf}

# abbreviation {=qudt:abbreviation .owl:DatatypeProperty label}

[An abbreviation for a unit is a short ASCII string that is used in place of the full name for the unit in contexts where non-ASCII characters would be problematic, or where using the abbreviation will enhance readability. When a power of abase unit needs to be expressed, such as squares this can be done using abbreviations rather than symbols. For example, <em>sq ft</em> means <em>square foot</em>, and <em>cu ft</em> means <em>cubic foot</em>.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# acronym {=qudt:acronym .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# allowed pattern {=qudt:allowedPattern .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# alt symbol {=qudt:altSymbol .owl:DatatypeProperty label}

[An alternative symbol] {dcterms:description ^^qudt:LatexString}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[literal] {+dtype:literal ?subPropertyOf}

# ANSI SQL Name {=qudt:ansiSQLName .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# applicable CGS unit {=qudt:applicableCGSUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[applicable unit] {+qudt:applicableUnit ?subPropertyOf}

# applicable ISO unit {=qudt:applicableISOUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[applicable unit] {+qudt:applicableUnit ?subPropertyOf}

# applicable Imperial unit {=qudt:applicableImperialUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[applicable unit] {+qudt:applicableUnit ?subPropertyOf}

# applicable physical constant {=qudt:applicablePhysicalConstant .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# applicable Planck unit {=qudt:applicablePlanckUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[applicable unit] {+qudt:applicableUnit ?subPropertyOf}

# applicable SI unit {=qudt:applicableSIUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[applicable unit] {+qudt:applicableUnit ?subPropertyOf}

# applicable system {=qudt:applicableSystem .owl:ObjectProperty label}

[This property relates a unit of measure with a unit system that may or may not define the unit, but within which the unit is compatible.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# applicable US Customary unit {=qudt:applicableUSCustomaryUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[applicable unit] {+qudt:applicableUnit ?subPropertyOf}

# applicable unit {=qudt:applicableUnit .owl:ObjectProperty label}

[See https://github.com/qudt/qudt-public-repo/wiki/Advanced-User-Guide#4-computing-applicable-units-for-a-quantitykind on how `qudt:applicableUnit` is computed from `qudt:hasQuantityKind` and then materialized] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}

# base dimension enumeration {=qudt:baseDimensionEnumeration .owl:FunctionalProperty .owl:ObjectProperty label}

[This property associates a system of quantities with an enumeration that enumerates the base dimensions of the system in canonical order.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Enumeration] {+qudt:Enumeration ?range}

# is base unit of system {=qudt:baseUnitOfSystem .owl:ObjectProperty label}

[This property relates a unit of measure to the system of units in which it is defined as a base unit for the system. The base units of a system are used to define the derived units of the system by expressing the derived units as products of the base units raised to a rational power.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[defined unit of system] {+qudt:definedUnitOfSystem ?subPropertyOf}
[base unit] {+qudt:hasBaseUnit ?owl:inverseOf}

# basis {=qudt:basis .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# belongs to system of quantities {=qudt:belongsToSystemOfQuantities .owl:ObjectProperty label}

[Quantity Kind] {+qudt:QuantityKind ?domain}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[System of Quantity Kinds] {+qudt:SystemOfQuantityKinds ?range}

# bit order {=qudt:bitOrder .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Endian Type] {+qudt:EndianType ?range}

# bits {=qudt:bits .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

# bounded {=qudt:bounded .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# byte order {=qudt:byteOrder .owl:ObjectProperty label}

[Byte order is an enumeration of two values: 'Big Endian' and 'Little Endian' and is used to denote whether the most signiticant byte is either first or last, respectively.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Endian Type] {+qudt:EndianType ?range}

# bytes {=qudt:bytes .owl:DatatypeProperty .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

# C Language name {=qudt:cName .rdf:Property label}

[Datatype name in the C programming language] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# cardinality {=qudt:cardinality .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# categorized as {=qudt:categorizedAs .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# coherent unit system {=qudt:coherentUnitSystem .owl:FunctionalProperty .owl:ObjectProperty label}

~~~ {dcterms:description ^^qudt:LatexString}

  A system of units is coherent with respect to a system of quantities and equations if the system of units is chosen in such a way that the equations between numerical values have exactly the same form (including the numerical factors) as the corresponding equations between the quantities. 
  In such a coherent system, no numerical factor other than the number 1 ever occurs in the expressions for the derived units in terms of the base units. 
  For example, the $newton$ and the $joule$. 
  These two are, respectively, the force that causes one kilogram to be accelerated at 1 metre per (1) second per (1) second, and the work done by 1 newton acting over 1 metre. 
  Being coherent refers to this consistent use of 1. 
  In the old c.g.s. system , with its base units the centimetre and the gram, the corresponding coherent units were the dyne and the erg,
   respectively the force that causes 1 gram to be accelerated at 1 centimetre per (1) second per (1) second, and the work done by 1 dyne acting over 1 centimetre. 
  So $1\,newton = 10^5 dyne$, $1 joule = 10^7 erg$, making each of the four compatible in a decimal sense within its respective other system, but not coherent therein.</p>
  
~~~

[https://en.wikipedia.org/wiki/Coherence_(units_of_measurement)] {qudt:informativeReference ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[has unit system] {+qudt:hasUnitSystem ?subPropertyOf}

# conversion multiplier {=qudt:conversionMultiplier .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:decimal] {+xsd:decimal ?range}

# conversion multiplier scientific {=qudt:conversionMultiplierSN .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:decimal] {+xsd:decimal ?range}

# conversion offset {=qudt:conversionOffset .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:decimal] {+xsd:decimal ?range}

# conversion offset scientific {=qudt:conversionOffsetSN .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:double] {+xsd:double ?range}

# currency code {=qudt:currencyCode .owl:DatatypeProperty .owl:FunctionalProperty label}

[Alphabetic Currency Code as defined by ISO 4217. For example, US Dollar has the code 'USD'.] {dcterms:description ^^rdf:HTML}
[https://en.wikipedia.org/wiki/ISO_4217] {seeAlso ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# currency exponent {=qudt:currencyExponent .owl:DatatypeProperty .owl:FunctionalProperty label}

[The currency exponent indicates the number of decimal places between a major currency unit and its minor currency unit. For example, the US dollar is the major currency unit of the United States, and the US cent is the minor currency unit. Since one cent is 1/100 of a dollar, the US dollar has a currency exponent of 2. However, the Japanese Yen has no minor currency units, so the yen has a currency exponent of 0.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

# currency number {=qudt:currencyNumber .owl:DatatypeProperty .owl:FunctionalProperty label}

[Numeric currency Code as defined by ISO 4217. For example, US Dollar has the number 840.] {dcterms:description ^^rdf:HTML}
[https://en.wikipedia.org/wiki/ISO_4217] {seeAlso ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# data encoding {=qudt:dataEncoding .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Data Encoding] {+qudt:DataEncoding ?range}

# data structure {=qudt:dataStructure .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# element type {=qudt:datatype .owl:ObjectProperty label}

[datatype] {label}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dbpedia match {=qudt:dbpediaMatch .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# default {=qudt:default .owl:ObjectProperty label}

[The default element in an enumeration] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# defined unit of system {=qudt:definedUnitOfSystem .owl:ObjectProperty label}

[This property relates a unit of measure with the unit system that defines the unit.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[is unit of system] {+qudt:isUnitOfSystem ?subPropertyOf}
[defined unit] {+qudt:hasDefinedUnit ?owl:inverseOf}

# denominator dimension vector {=qudt:denominatorDimensionVector .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?range}

# deprecated {=qudt:deprecated .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# is coherent derived unit of system {=qudt:derivedCoherentUnitOfSystem .owl:ObjectProperty label}

[This property relates a unit of measure to the unit system in which the unit is derived from the system's base units with a proportionality constant of one.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[defined unit of system] {+qudt:definedUnitOfSystem ?subPropertyOf}
[is derived unit of system] {+qudt:derivedUnitOfSystem ?subPropertyOf}
[derived coherent unit] {+qudt:hasDerivedCoherentUnit ?owl:inverseOf}

# is non-coherent derived unit of system {=qudt:derivedNonCoherentUnitOfSystem .owl:ObjectProperty label}

[This property relates a unit of measure to the unit system in which the unit is derived from the system's base units without proportionality constant of one.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[System of Units] {+qudt:SystemOfUnits ?range}
[is derived unit of system] {+qudt:derivedUnitOfSystem ?subPropertyOf}
[has coherent derived unit] {+qudt:hasDerivedNonCoherentUnit ?owl:inverseOf}

# is derived unit of system {=qudt:derivedUnitOfSystem .owl:ObjectProperty label}

[This property relates a unit of measure to the system of units in which it is defined as a derived unit. That is, the derived unit is defined as a product of the base units for the system raised to some rational power.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[is unit of system] {+qudt:isUnitOfSystem ?subPropertyOf}
[derived unit] {+qudt:hasDerivedUnit ?owl:inverseOf}

# dimension exponent {=qudt:dimensionExponent .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for amount of substance {=qudt:dimensionExponentForAmountOfSubstance .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for electric current {=qudt:dimensionExponentForElectricCurrent .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for length {=qudt:dimensionExponentForLength .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for luminous intensity {=qudt:dimensionExponentForLuminousIntensity .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for mass {=qudt:dimensionExponentForMass .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for thermodynamic temperature {=qudt:dimensionExponentForThermodynamicTemperature .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension exponent for time {=qudt:dimensionExponentForTime .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension inverse {=qudt:dimensionInverse .owl:FunctionalProperty .owl:InverseFunctionalProperty .owl:ObjectProperty .owl:SymmetricProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[dimension inverse] {+qudt:dimensionInverse ?owl:inverseOf}

# dimension vector for SI {=qudt:dimensionVectorForSI .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension vector (SI)] {+qudt:QuantityKindDimensionVector_SI ?range}

# dimensionless exponent {=qudt:dimensionlessExponent .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# element {=qudt:element .owl:ObjectProperty label}

[An element of an enumeration] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# element kind {=qudt:elementKind .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# encoding {=qudt:encoding .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# enumerated value {=qudt:enumeratedValue .owl:ObjectProperty label}

[Enumerated Value] {+qudt:EnumeratedValue ?range}

# enumeration {=qudt:enumeration .owl:ObjectProperty label}

[Enumeration] {+qudt:Enumeration ?range}

# exact constant {=qudt:exactConstant .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# exact match {=qudt:exactMatch .owl:ObjectProperty .qudt:SymmetricRelation label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# example {=qudt:example .owl:AnnotationProperty label}

[The 'qudt:example' property is used to annotate an instance of a class with a reference to a concept that is an example. The type of this property is 'rdf:Property'. This allows both scalar and object ranges.] {comment ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# exponent {=qudt:exponent .owl:ObjectProperty label}

[This property relates a factor unit its exponent] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# expression {=qudt:expression .owl:AnnotationProperty label}

[An 'expression' is a finite combination of symbols that are well-formed according to rules that apply to units of measure, quantity kinds and their dimensions.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# factorUnitScalar {=qudt:factorUnitScalar .owl:DatatypeProperty label}

[For a derived unit that is not exactly the product of its factor units, this property defines the scalar with which that product has to be multiplied with.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# field code {=qudt:fieldCode .owl:DatatypeProperty label}

[A field code is a generic property for representing unique codes that make up other identifers. For example each QuantityKind class caries a domain code as its field code.] {qudt:plainTextDescription}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# figure {=qudt:figure .owl:ObjectProperty label}

[Provides a link to an image.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Figure] {+qudt:Figure ?range}

# figure caption {=qudt:figureCaption .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# figure label {=qudt:figureLabel .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# float percentage {=qudt:floatPercentage .Datatype label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# guidance {=qudt:guidance .owl:DatatypeProperty label}

[QUDT Concept] {+qudt:Concept ?domain}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[rdf:HTML] {+rdf:HTML ?range}

# allowed unit {=qudt:hasAllowedUnit .owl:ObjectProperty label}

[This property relates a unit system with a unit of measure that is not defined by or part of the system, but is allowed for use within the system. An allowed unit must be convertible to some dimensionally eqiuvalent unit that is defined by the system.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[hasUnit] {+qudt:hasUnit ?subPropertyOf}

# has base quantity kind {=qudt:hasBaseQuantityKind .owl:FunctionalProperty .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[has quantity kind] {+qudt:hasQuantityKind ?subPropertyOf}

# base unit {=qudt:hasBaseUnit .owl:ObjectProperty label}

[This property relates a system of units to a base unit defined within the system. The base units of a system are used to define the derived units of the system by expressing the derived units as products of the base units raised to a rational power.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[coherent unit] {+qudt:hasCoherentUnit ?subPropertyOf}
[is base unit of system] {+qudt:baseUnitOfSystem ?owl:inverseOf}

# citation {=qudt:hasCitation .owl:DatatypeProperty label}

[Used to provide an annotation for an informative reference.] {qudt:plainTextDescription}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# coherent unit {=qudt:hasCoherentUnit .owl:ObjectProperty label}

[A coherent unit of measurement for a unit system is a defined unit that may be expressed as a product of powers of the system's base units with the proportionality factor of one.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[defined unit] {+qudt:hasDefinedUnit ?subPropertyOf}

# defined unit {=qudt:hasDefinedUnit .owl:ObjectProperty label}

[This property relates a unit system with a unit of measure that is defined by the system.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}
[hasUnit] {+qudt:hasUnit ?subPropertyOf}

# has quantity kind dimension vector denominator part {=qudt:hasDenominatorPart .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# derived coherent unit {=qudt:hasDerivedCoherentUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[coherent unit] {+qudt:hasCoherentUnit ?subPropertyOf}
[derived unit] {+qudt:hasDerivedUnit ?subPropertyOf}
[is coherent derived unit of system] {+qudt:derivedCoherentUnitOfSystem ?owl:inverseOf}

# has coherent derived unit {=qudt:hasDerivedNonCoherentUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[derived unit] {+qudt:hasDerivedUnit ?subPropertyOf}
[is non-coherent derived unit of system] {+qudt:derivedNonCoherentUnitOfSystem ?owl:inverseOf}

# derived unit {=qudt:hasDerivedUnit .owl:ObjectProperty label}

[This property relates a system of units to a unit of measure that is defined within the system in terms of the base units for the system. That is, the derived unit is defined as a product of the base units for the system raised to some rational power.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[is derived unit of system] {+qudt:derivedUnitOfSystem ?owl:inverseOf}

# has dimension {=qudt:hasDimension .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# dimension expression {=qudt:hasDimensionExpression .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# has dimension vector {=qudt:hasDimensionVector .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?range}

# hasFactorUnit {=qudt:hasFactorUnit .owl:ObjectProperty label}

[This property relates a derived unit to one of its constituent factor units] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# has quantity kind dimension vector numerator part {=qudt:hasNumeratorPart .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# prefix unit {=qudt:hasPrefixUnit .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[defined unit] {+qudt:hasDefinedUnit ?subPropertyOf}

# has quantity {=qudt:hasQuantity .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity] {+qudt:Quantity ?range}

# has quantity kind {=qudt:hasQuantityKind .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind] {+qudt:QuantityKind ?range}

# has reference quantity kind {=qudt:hasReferenceQuantityKind .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# has rule {=qudt:hasRule .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# hasUnit {=qudt:hasUnit .owl:ObjectProperty label}

[This property relates a factor unit its unit] {dcterms:description ^^rdf:HTML}
[This property relates a factor unit to its unit or a system of units with a unit of measure that is either a) defined by the system, or b) accepted for use by the system and is convertible to a unit of equivalent dimension that is defined by the system. Systems of units may distinguish between base and derived units. Base units are the units which measure the base quantities for the corresponding system of quantities. The base units are used to define units for all other quantities as products of powers of the base units. Such units are called derived units for the system.] {dcterms:description ^^rdf:HTML}
[has unit] {label}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}

# has unit system {=qudt:hasUnitSystem .owl:FunctionalProperty .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# has vocabulary {=qudt:hasVocabulary .owl:ObjectProperty label}

[Used to relate a class to one or more graphs where vocabularies for the class are defined.] {qudt:plainTextDescription}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[owl:Ontology] {+owl:Ontology ?range}

# height {=qudt:height .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# qudt id {=qudt:id .owl:DatatypeProperty label}

[The "qudt:id" is an identifier string that uniquely identifies a QUDT concept.  The identifier is constructed using a prefix. For example, units are coded using the pattern: "UCCCENNNN", where "CCC" is a numeric code or a category and "NNNN" is a digit string for a member element of that category. For scaled units there may be an addition field that has the format "QNN" where "NN" is a digit string representing an exponent power, and "Q" is a qualifier that indicates with the code "P" that the power is a positive decimal exponent, or the code "N" for a negative decimal exponent, or the code "B" for binary positive exponents.] {dcterms:description ^^rdf:HTML}
[QUDT Concept] {+qudt:Concept ?domain}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# iec-61360 code {=qudt:iec61360Code .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# image {=qudt:image .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# image location {=qudt:imageLocation .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# informative reference {=qudt:informativeReference .owl:AnnotationProperty label}

[Provides a way to reference a source that provided useful but non-normative information.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# integer percentage {=qudt:integerPercentage .Datatype label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# is Delta Quantity {=qudt:isDeltaQuantity .owl:DatatypeProperty label}

[This property is used to identify a Quantity instance that is a measure of a change, or interval, of some property, rather than a measure of its absolute value. This is important for measurements such as temperature differences where the conversion among units would be calculated differently because of offsets.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# is dimension in system {=qudt:isDimensionInSystem .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# is metric unit {=qudt:isMetricUnit .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# is unit of system {=qudt:isUnitOfSystem .owl:ObjectProperty label}

[This property relates a unit of measure with a system of units that either a) defines the unit or b) allows the unit to be used within the system.] {dcterms:description ^^rdf:HTML}
[Unit] {+qudt:Unit ?domain}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[System of Units] {+qudt:SystemOfUnits ?range}

# normative reference (ISO) {=qudt:isoNormativeReference .owl:DatatypeProperty label}

[Provides a way to reference the ISO unit definition.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}
[normative reference] {+qudt:normativeReference ?subPropertyOf}

# java name {=qudt:javaName .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# Javascript name {=qudt:jsName .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# landscape {=qudt:landscape .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# latex definition {=qudt:latexDefinition .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Latex String] {+qudt:LatexString ?range}

# latex symbol {=qudt:latexSymbol .owl:DatatypeProperty label}

~~~ {dcterms:description ^^qudt:LatexString}

  The symbol is a glyph that is used to represent some concept, typically a unit or a quantity, in a compact form. 
  For example, the symbol for an Ohm is $ohm$. 
  This contrasts with 'unit:abbreviation', which gives a short alphanumeric abbreviation for the unit, 'ohm' for Ohm.
  
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Latex String] {+qudt:LatexString ?range}

# length {=qudt:length .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:integer] {+xsd:integer ?range}

# lower bound {=qudt:lowerBound .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# math definition {=qudt:mathDefinition .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# mathML definition {=qudt:mathMLdefinition .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[math definition] {+qudt:mathDefinition ?subPropertyOf}

# matlab name {=qudt:matlabName .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# max exclusive {=qudt:maxExclusive .owl:DatatypeProperty label}

[maxExclusive is the exclusive upper bound of the value space for a datatype with the ordered property. The value of maxExclusive must be in the value space of the base type or be equal to {value} in {base type definition}.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[upper bound] {+qudt:upperBound ?subPropertyOf}

# max inclusive {=qudt:maxInclusive .owl:DatatypeProperty label}

[maxInclusive is the inclusive upper bound of the value space for a datatype with the ordered property. The value of maxInclusive must be in the value space of the base type.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[upper bound] {+qudt:upperBound ?subPropertyOf}

# Microsoft SQL Server name {=qudt:microsoftSQLServerName .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# min exclusive {=qudt:minExclusive .owl:DatatypeProperty .rdf:Property label}

[minExclusive is the exclusive lower bound of the value space for a datatype with the ordered property. The value of minExclusive must be in the value space of the base type or be equal to {value} in {base type definition}.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[lower bound] {+qudt:lowerBound ?subPropertyOf}

# min inclusive {=qudt:minInclusive .owl:DatatypeProperty label}

[minInclusive is the inclusive lower bound of the value space for a datatype with the ordered property. The value of minInclusive must be in the value space of the base type.] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[lower bound] {+qudt:lowerBound ?subPropertyOf}

# MySQL name {=qudt:mySQLName .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# negative delta limit {=qudt:negativeDeltaLimit .owl:DatatypeProperty label}

[A negative change limit between consecutive sample values for a parameter. The Negative Delta may be the encoded value or engineering units value depending on whether or not a Calibrator is defined.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# normative reference {=qudt:normativeReference .owl:DatatypeProperty label}

[Provides a way to reference information that is an authorative source providing a standard definition] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# numerator dimension vector {=qudt:numeratorDimensionVector .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?range}

# numeric value {=qudt:numericValue .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Numeric union] {+qudt:NumericUnion ?range}

# ODBC name {=qudt:odbcName .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# OLE DB name {=qudt:oleDBName .owl:DatatypeProperty label}

[OLE DB (Object Linking and Embedding, Database, sometimes written as OLEDB or OLE-DB), an API designed by Microsoft, allows accessing data from a variety of sources in a uniform manner. The API provides a set of interfaces implemented using the Component Object Model (COM); it is otherwise unrelated to OLE. ] {dcterms:description}
[http://en.wikipedia.org/wiki/OLE_DB] {qudt:informativeReference ^^xsd:anyURI}
[http://msdn.microsoft.com/en-us/library/windows/desktop/ms714931(v=vs.85).aspx] {qudt:informativeReference ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# om unit {=qudt:omUnit .owl:ObjectProperty label}

[Unit] {+qudt:Unit ?domain}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# online reference {=qudt:onlineReference .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# ORACLE SQL name {=qudt:oracleSQLName .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# order {=qudt:order .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# ordered type {=qudt:orderedType .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# out of scope {=qudt:outOfScope .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:boolean] {+xsd:boolean ?range}

# permissible maths {=qudt:permissibleMaths .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# permissible transformation {=qudt:permissibleTransformation .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# description (plain text) {=qudt:plainTextDescription .owl:DatatypeProperty label}

[A plain text description is used to provide a description with only simple ASCII characters for cases where LaTeX , HTML or other markup would not be appropriate.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# Positive delta limit {=qudt:positiveDeltaLimit .owl:DatatypeProperty label}

[A positive change limit between consecutive sample values for a parameter. The Positive Delta may be the encoded value or engineering units value depending on whether or not a Calibrator is defined.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# prefix {=qudt:prefix .owl:ObjectProperty label}

[Associates a unit with the appropriate prefix, if any.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Prefix] {+qudt:Prefix ?range}

# prefix multiplier {=qudt:prefixMultiplier .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:decimal] {+xsd:decimal ?range}

# prefix multiplier scientific {=qudt:prefixMultiplierSN .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:double] {+xsd:double ?range}

# protocol buffers name {=qudt:protocolBuffersName .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# python name {=qudt:pythonName .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# denominator dimension vector {=qudt:qkdvDenominator .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?range}

# numerator dimension vector {=qudt:qkdvNumerator .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?range}

# quantity {=qudt:quantity .owl:ObjectProperty label}

[a property to relate an observable thing with a quantity (qud:Quantity)] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# quantity value {=qudt:quantityValue .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity value] {+qudt:QuantityValue ?range}

# rationale {=qudt:rationale .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[rdf:HTML] {+rdf:HTML ?range}

# rdfs datatype {=qudt:rdfsDatatype .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# reference {=qudt:reference .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# reference unit {=qudt:referenceUnit .owl:FunctionalProperty .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# relative standard uncertainty {=qudt:relativeStandardUncertainty .owl:DatatypeProperty label}

[The relative standard uncertainty of a measurement is the (absolute) standard uncertainty divided by the magnitude of the exact value.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:double] {+xsd:double ?range}

# relevant quantity kind {=qudt:relevantQuantityKind .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Quantity Kind] {+qudt:QuantityKind ?range}

# Relevant Unit {=qudt:relevantUnit .owl:ObjectProperty label}

[This property is used for qudt:Discipline instances to identify the Unit instances that are used within a given discipline.] {comment}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Unit] {+qudt:Unit ?range}

# rule type {=qudt:ruleType .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# scale type {=qudt:scaleType .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# scalingOf {=qudt:scalingOf .owl:ObjectProperty label}

[This property relates a unit that is scaled to the base unit that its qudt:conversionMultiplier converts it to] {dcterms:description ^^rdf:HTML}
[This property relates a unit to another unit it is scaled from] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# Individual from SI Reference Point {=qudt:siExactMatch .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# si units expression {=qudt:siUnitsExpression .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# standard uncertainty {=qudt:standardUncertainty .owl:DatatypeProperty label}

[The standard uncertainty of a quantity is the estimated standard deviation of the mean taken from a series of measurements.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:decimal] {+xsd:decimal ?range}

# standard uncertainty scientific {=qudt:standardUncertaintySN .owl:DatatypeProperty label}

[The standard uncertainty of a quantity is the estimated standard deviation of the mean taken from a series of measurements.] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:double] {+xsd:double ?range}

# symbol {=qudt:symbol .owl:DatatypeProperty label}

~~~ {dcterms:description ^^qudt:LatexString}

  The symbol is a glyph that is used to represent some concept, typically a unit or a quantity, in a compact form. 
  For example, the symbol for an Ohm is $ohm$. 
  This contrasts with 'unit:abbreviation', which gives a short alphanumeric abbreviation for the unit, 'ohm' for Ohm.
  
~~~

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[literal] {+dtype:literal ?subPropertyOf}

# system definition {=qudt:systemDefinition .owl:ObjectProperty .owl:TransitiveProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# system derived quantity kind {=qudt:systemDerivedQuantityKind .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[has quantity kind] {+qudt:hasQuantityKind ?subPropertyOf}

# system dimension {=qudt:systemDimension .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# ucum code {=qudt:ucumCode .owl:DatatypeProperty label}

[<p><em>ucumCode</em> associates a QUDT unit with its UCUM code (case-sensitive). </p><p>In SHACL the values are derived from specific ucum properties using 'sh:values'.</p>] {dcterms:description ^^rdf:HTML}
[https://ucum.org/ucum.html] {dcterms:source ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[https://ucum.org/ucum.html] {+https://ucum.org/ucum.html ?seeAlso}
[skos:notation] {+skos:notation ?subPropertyOf}

# udunits code {=qudt:udunitsCode .owl:DatatypeProperty label}

[The UDUNITS package supports units of physical quantities. Its C library provides for arithmetic manipulation of units and for conversion of numeric values between compatible units. The package contains an extensive unit database, which is in XML format and user-extendable. The package also contains a command-line utility for investigating units and converting values.] {dcterms:description ^^rdf:HTML}
[https://www.unidata.ucar.edu/software/udunits/] {dcterms:source ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# unece common code {=qudt:uneceCommonCode .owl:DatatypeProperty label}

[The UN/CEFACT Recommendation 20 provides three character alphabetic and alphanumeric codes for representing units of measurement for length, area, volume/capacity, mass (weight), time, and other quantities used in international trade. The codes are intended for use in manual and/or automated systems for the exchange of information between participants in international trade.] {dcterms:description ^^rdf:HTML}
[https://service.unece.org/trade/uncefact/vocabulary/rec20/] {dcterms:source ^^xsd:anyURI}
[https://unece.org/trade/documents/2021/06/uncefact-rec20-0] {dcterms:source ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# unit for {=qudt:unitFor .owl:ObjectProperty label}

[Unit] {+qudt:Unit ?domain}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[hasUnit] {+qudt:hasUnit ?owl:inverseOf}

# upper bound {=qudt:upperBound .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anySimpleType] {+xsd:anySimpleType ?range}

# url {=qudt:url .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:anyURI] {+xsd:anyURI ?range}

# value {=qudt:value .owl:DatatypeProperty label}

[A property to relate an observable thing with a value of any kind] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# value for quantity {=qudt:valueQuantity .owl:ObjectProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[quantity value] {+qudt:quantityValue ?owl:inverseOf}

# value scientific {=qudt:valueSN .owl:DatatypeProperty label}

[A property to relate an observable thing with a value of any kind] {dcterms:description ^^rdf:HTML}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# value union {=qudt:valueUnion .Datatype label}

[A datatype that is the union of numeric xsd data types. "numericUnion" is equivalent to the xsd specification that uses an xsd:union of memberTypes="xsd:decimal xsd:double xsd:float xsd:integer".] {dcterms:description}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[Resource] {+Resource ?subClassOf}

# Vusal Basic name {=qudt:vbName .rdf:Property label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# vector magnitude {=qudt:vectorMagnitude .owl:DatatypeProperty .owl:FunctionalProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:float] {+xsd:float ?range}

# width {=qudt:width .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}

# QUDT Schema Catalog Entry {=voag:QUDT-SchemaCatalogEntry .vaem:CatalogEntry label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# superseded by {=voag:supersededBy .owl:ObjectProperty label}

[http://voag.linkedmodel.org/schema/voag] {+http://voag.linkedmodel.org/schema/voag ?isDefinedBy}

#  {=http://www.linkedmodel.org/schema/dtype}

[http://www.linkedmodel.org/schema/dtype#] {vaem:namespace ^^xsd:anyURI}
[dtype] {vaem:namespacePrefix}

# literal {=dtype:literal .owl:DatatypeProperty label}

[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[xsd:string] {+xsd:string ?range}
[literal] {+dtype:literal ?subPropertyOf}

# QUDT Schema - Version 3.1.2 {=vaem:GMD_QUDT-SCHEMA .vaem:GraphMetaData label}

[Daniel Mekonnen] {dcterms:contributor}
[David Price] {dcterms:contributor}
[Jack Hodges] {dcterms:contributor}
[James E. Masters] {dcterms:contributor}
[Simon J D Cox] {dcterms:contributor}
[Steve Ray] {dcterms:contributor}
*2011-04-20* {dcterms:created ^^xsd:date}
[Ralph Hodgson] {dcterms:creator}
~~~ {dcterms:description ^^rdf:HTML}
<p class="lm-para">The QUDT, or "Quantity, Unit, Dimension and Type" schema defines the base classes properties, and restrictions used for modeling physical quantities, units of measure, and their dimensions in various measurement systems. The goal of the QUDT ontology is to provide a unified model of, measurable quantities, units for measuring different kinds of quantities, the numerical values of quantities in different units of measure and the data structures and data types used to store and manipulate these objects in software.</p>

<p class="lm-para">Except for unit prefixes, all units are specified in separate vocabularies. Descriptions are provided in both HTML and LaTeX formats. A quantity is a measure of an observable phenomenon, that, when associated with something, becomes a property of that thing; a particular object, event, or physical system. </p>

<p class="lm-para">A quantity has meaning in the context of a measurement (i.e. the thing measured, the measured value, the accuracy of measurement, etc.) whereas the underlying quantity kind is independent of any particular measurement. Thus, length is a quantity kind while the height of a rocket is a specific quantity of length; its magnitude that may be expressed in meters, feet, inches, etc.  Or, as stated at Wikipedia, in the language of measurement, quantities are quantifiable aspects of the world, such as time, distance, velocity, mass, momentum, energy, and weight, and units are used to describe their measure. Many of these quantities are related to each other by various physical laws, and as a result the units of some of the quantities can be expressed as products (or ratios) of powers of other units (e.g., momentum is mass times velocity and velocity is measured in distance divided by time).</p>
~~~

*2025-05-30T12:03:48Z* {dcterms:modified ^^xsd:dateTime}
~~~ {dcterms:rights}

  This product includes all or a portion of the UCUM table, UCUM codes, and UCUM definitions or is derived from it, subject to a license from Regenstrief Institute, Inc. and The UCUM Organization. Your use of the UCUM table, UCUM codes, UCUM definitions also is subject to this license, a copy of which is available at ​http://unitsofmeasure.org. The current complete UCUM table, UCUM Specification are available for download at ​http://unitsofmeasure.org. The UCUM table and UCUM codes are copyright © 1995-2009, Regenstrief Institute, Inc. and the Unified Codes for Units of Measures (UCUM) Organization. All rights reserved.

THE UCUM TABLE (IN ALL FORMATS), UCUM DEFINITIONS, AND SPECIFICATION ARE PROVIDED 'AS IS.' ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
  
~~~

[The QUDT Ontologies are issued under a Creative Commons Attribution 4.0 International License (CC BY 4.0), available at https://creativecommons.org/licenses/by/4.0/. Attribution should be made to QUDT.org] {dcterms:rights}
[QUDT] {dcterms:subject}
[QUDT Schema - Version 3.1.2] {dcterms:title}
[http://unitsofmeasure.org/trac] {qudt:informativeReference ^^xsd:anyURI}
[http://www.bipm.org/en/publications/si-brochure] {qudt:informativeReference ^^xsd:anyURI}
[http://www.bipm.org/utils/common/documents/jcgm/JCGM_200_2008.pdf] {qudt:informativeReference ^^xsd:anyURI}
[https://books.google.com/books?id=pIlCAAAAIAAJ&dq=dimensional+analysis&hl=en] {qudt:informativeReference ^^xsd:anyURI}
[https://www.nist.gov/physical-measurement-laboratory/special-publication-811] {qudt:informativeReference ^^xsd:anyURI}
[qudt] {vaem:graphName}
[Quantities, Units, Dimensions and Types (QUDT) Schema - Version 3.1.2] {vaem:graphTitle}
[Specifies the schema for quantities, units and dimensions. Types are defined in other schemas.] {vaem:intent}
[https://qudt.org/doc/2025/05/DOC_SCHEMA-QUDT.html] {vaem:latestPublishedVersion ^^xsd:anyURI}
[https://qudt.org/linkedmodels.org/assets/lib/lm/images/logos/qudt_logo-300x110.png] {vaem:logo ^^xsd:anyURI}
[http://qudt.org/schema/qudt/] {vaem:namespace ^^xsd:anyURI}
[qudt] {vaem:namespacePrefix}
[qudt.org] {vaem:owner}
[https://qudt.org/doc/2025/04/DOC_SCHEMA-QUDT.html] {vaem:previousPublishedVersion ^^xsd:anyURI}
[http://qudt.org/schema/qudt] {vaem:turtleFileURL ^^xsd:anyURI}
[vaem:SchemaGraph] {+vaem:SchemaGraph ?vaem:hasGraphRole}
[QUDT] {+vaem:QUDT ?vaem:hasOwner}
[QUDT] {+vaem:QUDT ?vaem:hasSteward}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?vaem:isMetadataFor}
[abstract] {+dcterms:abstract ?vaem:usesNonImportedResource}
[contributor] {+dcterms:contributor ?vaem:usesNonImportedResource}
[created] {+dcterms:created ?vaem:usesNonImportedResource}
[description] {+dcterms:description ?vaem:usesNonImportedResource}
[modified] {+dcterms:modified ?vaem:usesNonImportedResource}
[rights] {+dcterms:rights ?vaem:usesNonImportedResource}
[source] {+dcterms:source ?vaem:usesNonImportedResource}
[subject] {+dcterms:subject ?vaem:usesNonImportedResource}
[title] {+dcterms:title ?vaem:usesNonImportedResource}
[voag:QUDT-Attribution] {+voag:QUDT-Attribution ?vaem:usesNonImportedResource}
[voag:QUDT-Attribution] {+voag:QUDT-Attribution ?vaem:withAttributionTo}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?owl:versionIRI}

# QUDT {=vaem:QUDT .vaem:Party label}

[QUDT is a non-profit organization that governs the QUDT ontologies.] {dcterms:description ^^rdf:HTML}
[qudt.org] {vaem:graphName}
[http://www.qudt.org] {vaem:website ^^xsd:anyURI}
[QUDT Schema - Version 3.1.2] {+http://qudt.org/schema/qudt ?isDefinedBy}

# n3-251 {=n3-251 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[skos:broader] {+skos:broader ?owl:onProperty}

# n3-252 {=n3-252 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[symbol] {+qudt:symbol ?owl:onProperty}

# n3-253 {=n3-253 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[alt symbol] {+qudt:altSymbol ?owl:onProperty}

# n3-254 {=n3-254 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[latex symbol] {+qudt:latexSymbol ?owl:onProperty}

# n3-255 {=n3-255 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has base quantity kind] {+qudt:hasBaseQuantityKind ?owl:onProperty}

# n3-256 {=n3-256 .owl:Restriction}

[xsd:float] {+xsd:float ?owl:allValuesFrom}
[vector magnitude] {+qudt:vectorMagnitude ?owl:onProperty}

# n3-257 {=n3-257 .owl:Restriction}

[1] {owl:cardinality ^^xsd:int}
[has base quantity kind] {+qudt:hasBaseQuantityKind ?owl:onProperty}

# n3-258 {=n3-258 .owl:Restriction}

[1] {owl:cardinality ^^xsd:int}
[vector magnitude] {+qudt:vectorMagnitude ?owl:onProperty}

# n3-259 {=n3-259}

[Bit Encoding] {+qudt:BitEncoding ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-260 {=n3-260}

[Boolean Encoding] {+qudt:BooleanEncoding ?rdf:first}

# n3-261 {=n3-261}

[Bit Encoding] {+qudt:BitEncoding ?rdf:first}

# n3-262 {=n3-262}

[OCTET Encoding] {+qudt:OctetEncoding ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-263 {=n3-263 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[literal] {+dtype:literal ?owl:onProperty}

# n3-264 {=n3-264}

[Countably Infinite Cardinality Type] {+qudt:CT_COUNTABLY-INFINITE ?rdf:first}

# n3-265 {=n3-265}

[Finite Cardinality Type] {+qudt:CT_FINITE ?rdf:first}

# n3-266 {=n3-266}

[Uncountable Cardinality Type] {+qudt:CT_UNCOUNTABLE ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-267 {=n3-267}

[Char Encoding] {+qudt:CharEncoding ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-268 {=n3-268 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[description] {+dcterms:description ?owl:onProperty}

# n3-269 {=n3-269 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[url] {+qudt:url ?owl:onProperty}

# n3-270 {=n3-270 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[description] {+dcterms:description ?owl:onProperty}

# n3-271 {=n3-271 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[rationale] {+qudt:rationale ?owl:onProperty}

# n3-272 {=n3-272 .owl:Restriction}

[Rule] {+qudt:Rule ?owl:allValuesFrom}
[has rule] {+qudt:hasRule ?owl:onProperty}

# n3-273 {=n3-273 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[description] {+dcterms:description ?owl:onProperty}

# n3-274 {=n3-274 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[is replaced by] {+dcterms:isReplacedBy ?owl:onProperty}

# n3-275 {=n3-275 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[abbreviation] {+qudt:abbreviation ?owl:onProperty}

# n3-276 {=n3-276 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[deprecated] {+qudt:deprecated ?owl:onProperty}

# n3-277 {=n3-277 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[qudt id] {+qudt:id ?owl:onProperty}

# n3-278 {=n3-278 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[description (plain text)] {+qudt:plainTextDescription ?owl:onProperty}

# n3-279 {=n3-279 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[exact constant] {+qudt:exactConstant ?owl:onProperty}

# n3-280 {=n3-280 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[skos:broader] {+skos:broader ?owl:onProperty}

# n3-281 {=n3-281 .owl:Restriction}

[^\d{3}$] {xsd:pattern}
`1` {owl:maxCardinality ^^xsd:integer}
[currency code] {+qudt:currencyCode ?owl:onProperty}

# n3-282 {=n3-282 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[currency exponent] {+qudt:currencyExponent ?owl:onProperty}

# n3-283 {=n3-283 .owl:Restriction}

[Encoding] {+qudt:Encoding ?owl:allValuesFrom}
[encoding] {+qudt:encoding ?owl:onProperty}

# n3-284 {=n3-284 .owl:Restriction}

[Endian Type] {+qudt:EndianType ?owl:allValuesFrom}
[bit order] {+qudt:bitOrder ?owl:onProperty}

# n3-285 {=n3-285 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[bit order] {+qudt:bitOrder ?owl:onProperty}

# n3-286 {=n3-286 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[byte order] {+qudt:byteOrder ?owl:onProperty}

# n3-287 {=n3-287 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[encoding] {+qudt:encoding ?owl:onProperty}

# n3-288 {=n3-288 .owl:Restriction}

[xsd:string] {+xsd:string ?owl:allValuesFrom}
[value] {+qudt:value ?owl:onProperty}

# n3-289 {=n3-289 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[value] {+qudt:value ?owl:onProperty}

# n3-290 {=n3-290 .owl:Restriction}

[Cardinality Type] {+qudt:CardinalityType ?owl:allValuesFrom}
[cardinality] {+qudt:cardinality ?owl:onProperty}

# n3-291 {=n3-291 .owl:Restriction}

[QUDT Datatype] {+qudt:Datatype ?owl:allValuesFrom}
[basis] {+qudt:basis ?owl:onProperty}

# n3-292 {=n3-292 .owl:Restriction}

[Ordered type] {+qudt:OrderedType ?owl:allValuesFrom}
[ordered type] {+qudt:orderedType ?owl:onProperty}

# n3-293 {=n3-293 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[ANSI SQL Name] {+qudt:ansiSQLName ?owl:onProperty}

# n3-294 {=n3-294 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[basis] {+qudt:basis ?owl:onProperty}

# n3-295 {=n3-295 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[bounded] {+qudt:bounded ?owl:onProperty}

# n3-296 {=n3-296 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[C Language name] {+qudt:cName ?owl:onProperty}

# n3-297 {=n3-297 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[cardinality] {+qudt:cardinality ?owl:onProperty}

# n3-298 {=n3-298 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[qudt id] {+qudt:id ?owl:onProperty}

# n3-299 {=n3-299 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[java name] {+qudt:javaName ?owl:onProperty}

# n3-300 {=n3-300 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[Javascript name] {+qudt:jsName ?owl:onProperty}

# n3-301 {=n3-301 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[matlab name] {+qudt:matlabName ?owl:onProperty}

# n3-302 {=n3-302 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[Microsoft SQL Server name] {+qudt:microsoftSQLServerName ?owl:onProperty}

# n3-303 {=n3-303 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[MySQL name] {+qudt:mySQLName ?owl:onProperty}

# n3-304 {=n3-304 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[ODBC name] {+qudt:odbcName ?owl:onProperty}

# n3-305 {=n3-305 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[OLE DB name] {+qudt:oleDBName ?owl:onProperty}

# n3-306 {=n3-306 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[ORACLE SQL name] {+qudt:oracleSQLName ?owl:onProperty}

# n3-307 {=n3-307 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[ordered type] {+qudt:orderedType ?owl:onProperty}

# n3-308 {=n3-308 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[protocol buffers name] {+qudt:protocolBuffersName ?owl:onProperty}

# n3-309 {=n3-309 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[python name] {+qudt:pythonName ?owl:onProperty}

# n3-310 {=n3-310 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[Vusal Basic name] {+qudt:vbName ?owl:onProperty}

# n3-311 {=n3-311 .owl:Restriction}

[1] {owl:minCardinality ^^xsd:nonNegativeInteger}
[allowed pattern] {+qudt:allowedPattern ?owl:onProperty}

# n3-312 {=n3-312 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[bits] {+qudt:bits ?owl:onProperty}

# n3-313 {=n3-313 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[bytes] {+qudt:bytes ?owl:onProperty}

# n3-314 {=n3-314}

[http://qudt.org/vocab/type/LittleEndian] {+http://qudt.org/vocab/type/LittleEndian ?rdf:first}

# n3-315 {=n3-315}

[http://qudt.org/vocab/type/BigEndian] {+http://qudt.org/vocab/type/BigEndian ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-316 {=n3-316 .owl:Restriction}

[Enumerated Value] {+qudt:EnumeratedValue ?owl:allValuesFrom}
[enumerated value] {+qudt:enumeratedValue ?owl:onProperty}

# n3-317 {=n3-317 .owl:Restriction}

[Enumeration] {+qudt:Enumeration ?owl:allValuesFrom}
[enumeration] {+qudt:enumeration ?owl:onProperty}

# n3-318 {=n3-318 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[description] {+dcterms:description ?owl:onProperty}

# n3-319 {=n3-319 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[abbreviation] {+qudt:abbreviation ?owl:onProperty}

# n3-320 {=n3-320 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[symbol] {+qudt:symbol ?owl:onProperty}

# n3-321 {=n3-321 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:int}
[alt symbol] {+qudt:altSymbol ?owl:onProperty}

# n3-322 {=n3-322 .owl:Restriction}

[Enumerated Value] {+qudt:EnumeratedValue ?owl:allValuesFrom}
[default] {+qudt:default ?owl:onProperty}

# n3-323 {=n3-323 .owl:Restriction}

[Enumerated Value] {+qudt:EnumeratedValue ?owl:allValuesFrom}
[element] {+qudt:element ?owl:onProperty}

# n3-324 {=n3-324 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[abbreviation] {+qudt:abbreviation ?owl:onProperty}

# n3-325 {=n3-325 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[default] {+qudt:default ?owl:onProperty}

# n3-326 {=n3-326 .owl:Restriction}

[1] {owl:minCardinality ^^xsd:nonNegativeInteger}
[element] {+qudt:element ?owl:onProperty}

# n3-327 {=n3-327 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[image location] {+qudt:imageLocation ?owl:onProperty}

# n3-328 {=n3-328 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[figure caption] {+qudt:figureCaption ?owl:onProperty}

# n3-329 {=n3-329 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[figure label] {+qudt:figureLabel ?owl:onProperty}

# n3-330 {=n3-330 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[height] {+qudt:height ?owl:onProperty}

# n3-331 {=n3-331 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[image] {+qudt:image ?owl:onProperty}

# n3-332 {=n3-332 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[landscape] {+qudt:landscape ?owl:onProperty}

# n3-333 {=n3-333 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[width] {+qudt:width ?owl:onProperty}

# n3-334 {=n3-334}

[Long Unsigned Integer Encoding] {+qudt:LongUnsignedIntegerEncoding ?rdf:first}

# n3-335 {=n3-335}

[Short Unsigned Integer Encoding] {+qudt:ShortUnsignedIntegerEncoding ?rdf:first}

# n3-336 {=n3-336}

[Short Unsigned Integer Encoding] {+qudt:ShortUnsignedIntegerEncoding ?rdf:first}

# n3-337 {=n3-337}

[Signed Integer Encoding] {+qudt:SignedIntegerEncoding ?rdf:first}

# n3-338 {=n3-338}

[Unsigned Integer Encoding] {+qudt:UnsignedIntegerEncoding ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-339 {=n3-339 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[literal] {+dtype:literal ?owl:onProperty}

# n3-340 {=n3-340}

[Unordered] {+qudt:Unordered ?rdf:first}

# n3-341 {=n3-341}

[Partially Ordered] {+qudt:PartiallyOrdered ?rdf:first}

# n3-342 {=n3-342}

[Totally Ordered] {+qudt:TotallyOrdered ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-343 {=n3-343 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[order] {+qudt:order ?owl:onProperty}

# n3-344 {=n3-344 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[url] {+qudt:url ?owl:onProperty}

# n3-345 {=n3-345 .owl:Restriction}

[Physical Constant] {+qudt:PhysicalConstant ?owl:allValuesFrom}
[exact match] {+qudt:exactMatch ?owl:onProperty}

# n3-346 {=n3-346 .owl:Restriction}

[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:allValuesFrom}
[has dimension vector] {+qudt:hasDimensionVector ?owl:onProperty}

# n3-347 {=n3-347 .owl:Restriction}

[System of Units] {+qudt:SystemOfUnits ?owl:allValuesFrom}
[applicable system] {+qudt:applicableSystem ?owl:onProperty}

# n3-348 {=n3-348 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[applicable unit] {+qudt:applicableUnit ?owl:onProperty}

# n3-349 {=n3-349 .owl:Restriction}

[xsd:boolean] {+xsd:boolean ?owl:allValuesFrom}
[exact constant] {+qudt:exactConstant ?owl:onProperty}

# n3-350 {=n3-350 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[latex definition] {+qudt:latexDefinition ?owl:onProperty}

# n3-351 {=n3-351 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[mathML definition] {+qudt:mathMLdefinition ?owl:onProperty}

# n3-352 {=n3-352 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:int}
[alt symbol] {+qudt:altSymbol ?owl:onProperty}

# n3-353 {=n3-353 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[dbpedia match] {+qudt:dbpediaMatch ?owl:onProperty}

# n3-354 {=n3-354 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[normative reference (ISO)] {+qudt:isoNormativeReference ?owl:onProperty}

# n3-355 {=n3-355 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[latex symbol] {+qudt:latexSymbol ?owl:onProperty}

# n3-356 {=n3-356 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[normative reference] {+qudt:normativeReference ?owl:onProperty}

# n3-357 {=n3-357 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[symbol] {+qudt:symbol ?owl:onProperty}

# n3-358 {=n3-358 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[ucum code] {+qudt:ucumCode ?owl:onProperty}

# n3-359 {=n3-359 .owl:Restriction}

[Prefix] {+qudt:Prefix ?owl:allValuesFrom}
[exact match] {+qudt:exactMatch ?owl:onProperty}

# n3-360 {=n3-360 .owl:Restriction}

[case-sensitive UCUM terminal] {+qudt:UCUMcs-term ?owl:allValuesFrom}
[ucum code] {+qudt:ucumCode ?owl:onProperty}

# n3-361 {=n3-361 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[prefix multiplier] {+qudt:prefixMultiplier ?owl:onProperty}

# n3-362 {=n3-362 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:int}
[alt symbol] {+qudt:altSymbol ?owl:onProperty}

# n3-363 {=n3-363 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[latex symbol] {+qudt:latexSymbol ?owl:onProperty}

# n3-364 {=n3-364 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[symbol] {+qudt:symbol ?owl:onProperty}

# n3-365 {=n3-365 .owl:Restriction}

[Data Encoding] {+qudt:DataEncoding ?owl:allValuesFrom}
[data encoding] {+qudt:dataEncoding ?owl:onProperty}

# n3-366 {=n3-366 .owl:Restriction}

[QUDT Datatype] {+qudt:Datatype ?owl:allValuesFrom}
[element type] {+qudt:datatype ?owl:onProperty}

# n3-367 {=n3-367 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[hasUnit] {+qudt:hasUnit ?owl:onProperty}

# n3-368 {=n3-368 .owl:Restriction}

[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[standard uncertainty] {+qudt:standardUncertainty ?owl:onProperty}

# n3-369 {=n3-369 .owl:Restriction}

[xsd:double] {+xsd:double ?owl:allValuesFrom}
[relative standard uncertainty] {+qudt:relativeStandardUncertainty ?owl:onProperty}

# n3-370 {=n3-370 .owl:Restriction}

[xsd:double] {+xsd:double ?owl:allValuesFrom}
[standard uncertainty scientific] {+qudt:standardUncertaintySN ?owl:onProperty}

# n3-371 {=n3-371 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[element type] {+qudt:datatype ?owl:onProperty}

# n3-372 {=n3-372 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[relative standard uncertainty] {+qudt:relativeStandardUncertainty ?owl:onProperty}

# n3-373 {=n3-373 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[standard uncertainty] {+qudt:standardUncertainty ?owl:onProperty}

# n3-374 {=n3-374 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[data encoding] {+qudt:dataEncoding ?owl:onProperty}

# n3-375 {=n3-375 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[hasUnit] {+qudt:hasUnit ?owl:onProperty}

# n3-376 {=n3-376 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[value] {+qudt:value ?owl:onProperty}

# n3-377 {=n3-377 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[value scientific] {+qudt:valueSN ?owl:onProperty}

# n3-378 {=n3-378 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-379 {=n3-379 .owl:Restriction}

[Quantity value] {+qudt:QuantityValue ?owl:allValuesFrom}
[quantity value] {+qudt:quantityValue ?owl:onProperty}

# n3-380 {=n3-380 .owl:Restriction}

[xsd:boolean] {+xsd:boolean ?owl:allValuesFrom}
[is Delta Quantity] {+qudt:isDeltaQuantity ?owl:onProperty}

# n3-381 {=n3-381 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-382 {=n3-382 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[exact match] {+qudt:exactMatch ?owl:onProperty}

# n3-383 {=n3-383 .owl:Restriction}

[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:allValuesFrom}
[has dimension vector] {+qudt:hasDimensionVector ?owl:onProperty}

# n3-384 {=n3-384 .owl:Restriction}

[Quantity Kind Dimension vector (SI)] {+qudt:QuantityKindDimensionVector_SI ?owl:allValuesFrom}
[dimension vector for SI] {+qudt:dimensionVectorForSI ?owl:onProperty}

# n3-385 {=n3-385 .owl:Restriction}

[xsd:string] {+xsd:string ?owl:allValuesFrom}
[iec-61360 code] {+qudt:iec61360Code ?owl:onProperty}

# n3-386 {=n3-386 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[dimension vector for SI] {+qudt:dimensionVectorForSI ?owl:onProperty}

# n3-387 {=n3-387 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[latex definition] {+qudt:latexDefinition ?owl:onProperty}

# n3-388 {=n3-388 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[mathML definition] {+qudt:mathMLdefinition ?owl:onProperty}

# n3-389 {=n3-389 .owl:Restriction}

[1] {owl:maxQualifiedCardinality ^^xsd:nonNegativeInteger}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:onClass}
[denominator dimension vector] {+qudt:qkdvDenominator ?owl:onProperty}

# n3-390 {=n3-390 .owl:Restriction}

[1] {owl:maxQualifiedCardinality ^^xsd:nonNegativeInteger}
[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:onClass}
[numerator dimension vector] {+qudt:qkdvNumerator ?owl:onProperty}

# n3-391 {=n3-391 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[applicable CGS unit] {+qudt:applicableCGSUnit ?owl:onProperty}

# n3-392 {=n3-392 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[applicable ISO unit] {+qudt:applicableISOUnit ?owl:onProperty}

# n3-393 {=n3-393 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[applicable Imperial unit] {+qudt:applicableImperialUnit ?owl:onProperty}

# n3-394 {=n3-394 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[applicable SI unit] {+qudt:applicableSIUnit ?owl:onProperty}

# n3-395 {=n3-395 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[applicable US Customary unit] {+qudt:applicableUSCustomaryUnit ?owl:onProperty}

# n3-396 {=n3-396 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[applicable unit] {+qudt:applicableUnit ?owl:onProperty}

# n3-397 {=n3-397 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has reference quantity kind] {+qudt:hasReferenceQuantityKind ?owl:onProperty}

# n3-398 {=n3-398 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for amount of substance] {+qudt:dimensionExponentForAmountOfSubstance ?owl:onProperty}

# n3-399 {=n3-399 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for electric current] {+qudt:dimensionExponentForElectricCurrent ?owl:onProperty}

# n3-400 {=n3-400 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for length] {+qudt:dimensionExponentForLength ?owl:onProperty}

# n3-401 {=n3-401 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for luminous intensity] {+qudt:dimensionExponentForLuminousIntensity ?owl:onProperty}

# n3-402 {=n3-402 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for mass] {+qudt:dimensionExponentForMass ?owl:onProperty}

# n3-403 {=n3-403 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for thermodynamic temperature] {+qudt:dimensionExponentForThermodynamicTemperature ?owl:onProperty}

# n3-404 {=n3-404 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimension exponent for time] {+qudt:dimensionExponentForTime ?owl:onProperty}

# n3-405 {=n3-405 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[dimensionless exponent] {+qudt:dimensionlessExponent ?owl:onProperty}

# n3-406 {=n3-406 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[latex definition] {+qudt:latexDefinition ?owl:onProperty}

# n3-407 {=n3-407 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[latex symbol] {+qudt:latexSymbol ?owl:onProperty}

# n3-408 {=n3-408 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[dtype:value] {+dtype:value ?owl:onProperty}

# n3-409 {=n3-409 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[hasUnit] {+qudt:hasUnit ?owl:onProperty}

# n3-410 {=n3-410 .owl:Restriction}

[Rule Type] {+qudt:RuleType ?owl:allValuesFrom}
[rule type] {+qudt:ruleType ?owl:onProperty}

# n3-411 {=n3-411 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[rationale] {+qudt:rationale ?owl:onProperty}

# n3-412 {=n3-412 .owl:Restriction}

[Datatype] {+Datatype ?owl:allValuesFrom}
[rdfs datatype] {+qudt:rdfsDatatype ?owl:onProperty}

# n3-413 {=n3-413 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[bits] {+qudt:bits ?owl:onProperty}

# n3-414 {=n3-414 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[bytes] {+qudt:bytes ?owl:onProperty}

# n3-415 {=n3-415 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[length] {+qudt:length ?owl:onProperty}

# n3-416 {=n3-416 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[max exclusive] {+qudt:maxExclusive ?owl:onProperty}

# n3-417 {=n3-417 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[max inclusive] {+qudt:maxInclusive ?owl:onProperty}

# n3-418 {=n3-418 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[min exclusive] {+qudt:minExclusive ?owl:onProperty}

# n3-419 {=n3-419 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[min inclusive] {+qudt:minInclusive ?owl:onProperty}

# n3-420 {=n3-420 .owl:Restriction}

`1` {owl:maxCardinality ^^xsd:integer}
[rdfs datatype] {+qudt:rdfsDatatype ?owl:onProperty}

# n3-421 {=n3-421 .owl:Restriction}

[Maths Function Type] {+qudt:MathsFunctionType ?owl:allValuesFrom}
[permissible maths] {+qudt:permissibleMaths ?owl:onProperty}

# n3-422 {=n3-422 .owl:Restriction}

[Scale type] {+qudt:ScaleType ?owl:allValuesFrom}
[scale type] {+qudt:scaleType ?owl:onProperty}

# n3-423 {=n3-423 .owl:Restriction}

[Transform type] {+qudt:TransformType ?owl:allValuesFrom}
[permissible transformation] {+qudt:permissibleTransformation ?owl:onProperty}

# n3-424 {=n3-424 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[data structure] {+qudt:dataStructure ?owl:onProperty}

# n3-425 {=n3-425 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[scale type] {+qudt:scaleType ?owl:onProperty}

# n3-426 {=n3-426 .owl:Restriction}

[Maths Function Type] {+qudt:MathsFunctionType ?owl:allValuesFrom}
[permissible maths] {+qudt:permissibleMaths ?owl:onProperty}

# n3-427 {=n3-427 .owl:Restriction}

[Transform type] {+qudt:TransformType ?owl:allValuesFrom}
[permissible transformation] {+qudt:permissibleTransformation ?owl:onProperty}

# n3-428 {=n3-428 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[data structure] {+qudt:dataStructure ?owl:onProperty}

# n3-429 {=n3-429 .owl:Restriction}

[Enumeration] {+qudt:Enumeration ?owl:allValuesFrom}
[base dimension enumeration] {+qudt:baseDimensionEnumeration ?owl:onProperty}

# n3-430 {=n3-430 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has base quantity kind] {+qudt:hasBaseQuantityKind ?owl:onProperty}

# n3-431 {=n3-431 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-432 {=n3-432 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[system derived quantity kind] {+qudt:systemDerivedQuantityKind ?owl:onProperty}

# n3-433 {=n3-433 .owl:Restriction}

[System of Units] {+qudt:SystemOfUnits ?owl:allValuesFrom}
[has unit system] {+qudt:hasUnitSystem ?owl:onProperty}

# n3-434 {=n3-434 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[base dimension enumeration] {+qudt:baseDimensionEnumeration ?owl:onProperty}

# n3-435 {=n3-435 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-436 {=n3-436 .owl:Restriction}

[Physical Constant] {+qudt:PhysicalConstant ?owl:allValuesFrom}
[applicable physical constant] {+qudt:applicablePhysicalConstant ?owl:onProperty}

# n3-437 {=n3-437 .owl:Restriction}

[Prefix] {+qudt:Prefix ?owl:allValuesFrom}
[prefix] {+qudt:prefix ?owl:onProperty}

# n3-438 {=n3-438 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[allowed unit] {+qudt:hasAllowedUnit ?owl:onProperty}

# n3-439 {=n3-439 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[base unit] {+qudt:hasBaseUnit ?owl:onProperty}

# n3-440 {=n3-440 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[coherent unit] {+qudt:hasCoherentUnit ?owl:onProperty}

# n3-441 {=n3-441 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[defined unit] {+qudt:hasDefinedUnit ?owl:onProperty}

# n3-442 {=n3-442 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[derived coherent unit] {+qudt:hasDerivedCoherentUnit ?owl:onProperty}

# n3-443 {=n3-443 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[derived unit] {+qudt:hasDerivedUnit ?owl:onProperty}

# n3-444 {=n3-444 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[hasUnit] {+qudt:hasUnit ?owl:onProperty}

# n3-445 {=n3-445}

[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-446 {=n3-446}

[[\x21-\x7e]+] {xsd:pattern}

# n3-447 {=n3-447}

[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-448 {=n3-448}

[[\x21,\x23-\x27,\x2a,\x2c,\x30-\x3c,\x3e-\x5a,\x5c,\x5e-\x7a,\x7c,\x7e]+] {xsd:pattern}

# n3-449 {=n3-449 .owl:Restriction}

[Prefix] {+qudt:Prefix ?owl:allValuesFrom}
[prefix] {+qudt:prefix ?owl:onProperty}

# n3-450 {=n3-450 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-451 {=n3-451 .owl:Restriction}

[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:allValuesFrom}
[has dimension vector] {+qudt:hasDimensionVector ?owl:onProperty}

# n3-452 {=n3-452 .owl:Restriction}

[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:allValuesFrom}
[denominator dimension vector] {+qudt:qkdvDenominator ?owl:onProperty}

# n3-453 {=n3-453 .owl:Restriction}

[Quantity Kind Dimension Vector] {+qudt:QuantityKindDimensionVector ?owl:allValuesFrom}
[numerator dimension vector] {+qudt:qkdvNumerator ?owl:onProperty}

# n3-454 {=n3-454 .owl:Restriction}

[System of Units] {+qudt:SystemOfUnits ?owl:allValuesFrom}
[applicable system] {+qudt:applicableSystem ?owl:onProperty}

# n3-455 {=n3-455 .owl:Restriction}

[System of Units] {+qudt:SystemOfUnits ?owl:allValuesFrom}
[defined unit of system] {+qudt:definedUnitOfSystem ?owl:onProperty}

# n3-456 {=n3-456 .owl:Restriction}

[System of Units] {+qudt:SystemOfUnits ?owl:allValuesFrom}
[is coherent derived unit of system] {+qudt:derivedCoherentUnitOfSystem ?owl:onProperty}

# n3-457 {=n3-457 .owl:Restriction}

[System of Units] {+qudt:SystemOfUnits ?owl:allValuesFrom}
[is derived unit of system] {+qudt:derivedUnitOfSystem ?owl:onProperty}

# n3-458 {=n3-458 .owl:Restriction}

[case-sensitive UCUM code] {+qudt:UCUMcs ?owl:allValuesFrom}
[ucum code] {+qudt:ucumCode ?owl:onProperty}

# n3-459 {=n3-459 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[exact match] {+qudt:exactMatch ?owl:onProperty}

# n3-460 {=n3-460 .owl:Restriction}

[Unit] {+qudt:Unit ?owl:allValuesFrom}
[scalingOf] {+qudt:scalingOf ?owl:onProperty}

# n3-461 {=n3-461 .owl:Restriction}

[xsd:string] {+xsd:string ?owl:allValuesFrom}
[iec-61360 code] {+qudt:iec61360Code ?owl:onProperty}

# n3-462 {=n3-462 .owl:Restriction}

[xsd:string] {+xsd:string ?owl:allValuesFrom}
[udunits code] {+qudt:udunitsCode ?owl:onProperty}

# n3-463 {=n3-463 .owl:Restriction}

[xsd:string] {+xsd:string ?owl:allValuesFrom}
[unece common code] {+qudt:uneceCommonCode ?owl:onProperty}

# n3-464 {=n3-464 .owl:Restriction}

[owl:Class] {+owl:Class ?owl:allValuesFrom}
[hasFactorUnit] {+qudt:hasFactorUnit ?owl:onProperty}

# n3-465 {=n3-465 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[conversion multiplier] {+qudt:conversionMultiplier ?owl:onProperty}

# n3-466 {=n3-466 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[conversion multiplier scientific] {+qudt:conversionMultiplierSN ?owl:onProperty}

# n3-467 {=n3-467 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[conversion offset] {+qudt:conversionOffset ?owl:onProperty}

# n3-468 {=n3-468 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[conversion offset scientific] {+qudt:conversionOffsetSN ?owl:onProperty}

# n3-469 {=n3-469 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:int}
[factorUnitScalar] {+qudt:factorUnitScalar ?owl:onProperty}

# n3-470 {=n3-470 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[has dimension vector] {+qudt:hasDimensionVector ?owl:onProperty}

# n3-471 {=n3-471 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[mathML definition] {+qudt:mathMLdefinition ?owl:onProperty}

# n3-472 {=n3-472 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[denominator dimension vector] {+qudt:qkdvDenominator ?owl:onProperty}

# n3-473 {=n3-473 .owl:Restriction}

[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[numerator dimension vector] {+qudt:qkdvNumerator ?owl:onProperty}

# n3-474 {=n3-474 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:int}
[alt symbol] {+qudt:altSymbol ?owl:onProperty}

# n3-475 {=n3-475 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[latex definition] {+qudt:latexDefinition ?owl:onProperty}

# n3-476 {=n3-476 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[latex symbol] {+qudt:latexSymbol ?owl:onProperty}

# n3-477 {=n3-477 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[si units expression] {+qudt:siUnitsExpression ?owl:onProperty}

# n3-478 {=n3-478 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[symbol] {+qudt:symbol ?owl:onProperty}

# n3-479 {=n3-479 .owl:Restriction}

[Quantity Kind] {+qudt:QuantityKind ?owl:allValuesFrom}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-480 {=n3-480 .owl:Restriction}

[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[has quantity kind] {+qudt:hasQuantityKind ?owl:onProperty}

# n3-481 {=n3-481 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[dbpedia match] {+qudt:dbpediaMatch ?owl:onProperty}

# n3-482 {=n3-482 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[normative reference (ISO)] {+qudt:isoNormativeReference ?owl:onProperty}

# n3-483 {=n3-483 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[normative reference (ISO)] {+qudt:isoNormativeReference ?owl:onProperty}

# n3-484 {=n3-484 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[normative reference] {+qudt:normativeReference ?owl:onProperty}

# n3-485 {=n3-485 .owl:Restriction}

[0] {owl:minCardinality ^^xsd:nonNegativeInteger}
[normative reference] {+qudt:normativeReference ?owl:onProperty}

# n3-486 {=n3-486 .Datatype}

[xsd:float] {+xsd:float ?owl:onDatatype}

# n3-488 {=n3-488}

`0.00` {xsd:minInclusive ^^xsd:float}

# n3-489 {=n3-489}

[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-490 {=n3-490}

`100.00` {xsd:maxInclusive ^^xsd:float}

# n3-491 {=n3-491 .Datatype}

[xsd:integer] {+xsd:integer ?owl:onDatatype}

# n3-493 {=n3-493}

`0` {xsd:minInclusive ^^xsd:integer}

# n3-494 {=n3-494}

[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-495 {=n3-495}

`100` {xsd:maxInclusive ^^xsd:integer}

# n3-496 {=n3-496 .owl:Class}


# n3-497 {=n3-497}

[case-sensitive UCUM code] {+qudt:UCUMcs ?rdf:first}

# n3-498 {=n3-498}

[case-sensitive UCUM terminal] {+qudt:UCUMcs-term ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# n3-499 {=n3-499 .owl:Class}


# n3-500 {=n3-500}

[xsd:anySimpleType] {+xsd:anySimpleType ?rdf:first}

# n3-501 {=n3-501}

[dtype:EnumeratedValue] {+dtype:EnumeratedValue ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# was derived from {=prov:wasDerivedFrom .rdf:Property label}

[http://www.w3.org/ns/prov] {+http://www.w3.org/ns/prov ?isDefinedBy}
[QUDT Concept] {+qudt:Concept ?range}

