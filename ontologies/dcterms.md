[dcam] <http://purl.org/dc/dcam/>
[dcterms] <http://purl.org/dc/terms/>
[dcth] <http://dublincore.org/usage/terms/history/#>
[owl] <http://www.w3.org/2002/07/owl#>
[skos] <http://www.w3.org/2004/02/skos/core#>

#  {=dcterms:}
*2012-06-14* {dcterms:modified ^^xsd:date}
[DCMI Metadata Terms - other] {dcterms:title @en}
[http://purl.org/dc/aboutdcmi#DCMI] {+http://purl.org/dc/aboutdcmi#DCMI ?dcterms:publisher}

# Agent {=dcterms:Agent .Class .dcterms:AgentClass label}
[Examples of Agent include person, organization, and software agent.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A resource that acts or has the power to act.] {comment @en}
[dcth:Agent-001] {+dcth:Agent-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# Agent Class {=dcterms:AgentClass .Class label}
[Examples of Agent Class include groups seen as classes, such as students, women, charities, lecturers.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2012-06-14* {dcterms:modified ^^xsd:date}
[A group of agents.] {comment @en}
[dcth:AgentClass-003] {+dcth:AgentClass-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Class] {+Class ?subClassOf}

# Bibliographic Resource {=dcterms:BibliographicResource .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A book, article, or other documentary resource.] {comment @en}
[dcth:BibliographicResource-001] {+dcth:BibliographicResource-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# DCMI Box {=dcterms:Box .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of regions in space defined by their geographic coordinates according to the DCMI Box Encoding Scheme.] {comment @en}
[dcth:Box-003] {+dcth:Box-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://dublincore.org/documents/dcmi-box/] {+http://dublincore.org/documents/dcmi-box/ ?seeAlso}

# DCMI Type Vocabulary {=dcterms:DCMIType .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2012-06-14* {dcterms:modified ^^xsd:date}
[The set of classes specified by the DCMI Type Vocabulary, used to categorize the nature or genre of the resource.] {comment @en}
[dcth:DCMIType-005] {+dcth:DCMIType-005 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/dcmitype/] {+http://purl.org/dc/dcmitype/ ?seeAlso}

# DDC {=dcterms:DDC .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of conceptual resources specified by the Dewey Decimal Classification.] {comment @en}
[dcth:DDC-003] {+dcth:DDC-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.oclc.org/dewey/] {+http://www.oclc.org/dewey/ ?seeAlso}

# File Format {=dcterms:FileFormat .Class label}
[Examples include the formats defined by the list of Internet Media Types.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A digital resource format.] {comment @en}
[dcth:FileFormat-001] {+dcth:FileFormat-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Media Type] {+dcterms:MediaType ?subClassOf}

# Frequency {=dcterms:Frequency .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A rate at which something recurs.] {comment @en}
[dcth:Frequency-001] {+dcth:Frequency-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# IMT {=dcterms:IMT .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of media types specified by the Internet Assigned Numbers Authority.] {comment @en}
[dcth:IMT-004] {+dcth:IMT-004 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.iana.org/assignments/media-types/] {+http://www.iana.org/assignments/media-types/ ?seeAlso}

# ISO 3166 {=dcterms:ISO3166 .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of codes listed in ISO 3166-1 for the representation of names of countries.] {comment @en}
[dcth:ISO3166-004] {+dcth:ISO3166-004 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.iso.org/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html] {+http://www.iso.org/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html ?seeAlso}

# ISO 639-2 {=dcterms:ISO639-2 .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The three-letter alphabetic codes listed in ISO639-2 for the representation of names of languages.] {comment @en}
[dcth:ISO639-2-003] {+dcth:ISO639-2-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://lcweb.loc.gov/standards/iso639-2/langhome.html] {+http://lcweb.loc.gov/standards/iso639-2/langhome.html ?seeAlso}

# ISO 639-3 {=dcterms:ISO639-3 .Datatype label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[The set of three-letter codes listed in ISO 639-3 for the representation of names of languages.] {comment @en}
[dcth:ISO639-3-001] {+dcth:ISO639-3-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.sil.org/iso639-3/] {+http://www.sil.org/iso639-3/ ?seeAlso}

# Jurisdiction {=dcterms:Jurisdiction .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[The extent or range of judicial, law enforcement, or other authority.] {comment @en}
[dcth:Jurisdiction-001] {+dcth:Jurisdiction-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Location, Period, or Jurisdiction] {+dcterms:LocationPeriodOrJurisdiction ?subClassOf}

# LCC {=dcterms:LCC .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of conceptual resources specified by the Library of Congress Classification.] {comment @en}
[dcth:LCC-003] {+dcth:LCC-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://lcweb.loc.gov/catdir/cpso/lcco/lcco.html] {+http://lcweb.loc.gov/catdir/cpso/lcco/lcco.html ?seeAlso}

# LCSH {=dcterms:LCSH .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of labeled concepts specified by the Library of Congress Subject Headings.] {comment @en}
[dcth:LCSH-003] {+dcth:LCSH-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# License Document {=dcterms:LicenseDocument .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A legal document giving official permission to do something with a Resource.] {comment @en}
[dcth:LicenseDocument-001] {+dcth:LicenseDocument-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Rights Statement] {+dcterms:RightsStatement ?subClassOf}

# Linguistic System {=dcterms:LinguisticSystem .Class label}
[Examples include written, spoken, sign, and computer languages.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A system of signs, symbols, sounds, gestures, or rules used in communication.] {comment @en}
[dcth:LinguisticSystem-001] {+dcth:LinguisticSystem-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# Location {=dcterms:Location .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A spatial region or named place.] {comment @en}
[dcth:Location-001] {+dcth:Location-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Location, Period, or Jurisdiction] {+dcterms:LocationPeriodOrJurisdiction ?subClassOf}

# Location, Period, or Jurisdiction {=dcterms:LocationPeriodOrJurisdiction .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A location, period of time, or jurisdiction.] {comment @en}
[dcth:LocationPeriodOrJurisdiction-001] {+dcth:LocationPeriodOrJurisdiction-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# MeSH {=dcterms:MESH .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of labeled concepts specified by the Medical Subject Headings.] {comment @en}
[dcth:MESH-003] {+dcth:MESH-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.nlm.nih.gov/mesh/meshhome.html] {+http://www.nlm.nih.gov/mesh/meshhome.html ?seeAlso}

# Media Type {=dcterms:MediaType .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A file format or physical medium.] {comment @en}
[dcth:MediaType-001] {+dcth:MediaType-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Media Type or Extent] {+dcterms:MediaTypeOrExtent ?subClassOf}

# Media Type or Extent {=dcterms:MediaTypeOrExtent .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A media type or extent.] {comment @en}
[dcth:MediaTypeOrExtent-001] {+dcth:MediaTypeOrExtent-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# Method of Accrual {=dcterms:MethodOfAccrual .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A method by which resources are added to a collection.] {comment @en}
[dcth:MethodOfAccrual-001] {+dcth:MethodOfAccrual-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# Method of Instruction {=dcterms:MethodOfInstruction .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A process that is used to engender knowledge, attitudes, and skills.] {comment @en}
[dcth:MethodOfInstruction-001] {+dcth:MethodOfInstruction-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# NLM {=dcterms:NLM .dcam:VocabularyEncodingScheme label}
*2005-06-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of conceptual resources specified by the National Library of Medicine Classification.] {comment @en}
[dcth:NLM-002] {+dcth:NLM-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://wwwcf.nlm.nih.gov/class/] {+http://wwwcf.nlm.nih.gov/class/ ?seeAlso}

# DCMI Period {=dcterms:Period .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of time intervals defined by their limits according to the DCMI Period Encoding Scheme.] {comment @en}
[dcth:Period-003] {+dcth:Period-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://dublincore.org/documents/dcmi-period/] {+http://dublincore.org/documents/dcmi-period/ ?seeAlso}

# Period of Time {=dcterms:PeriodOfTime .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[An interval of time that is named or defined by its start and end dates.] {comment @en}
[dcth:PeriodOfTime-001] {+dcth:PeriodOfTime-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Location, Period, or Jurisdiction] {+dcterms:LocationPeriodOrJurisdiction ?subClassOf}

# Physical Medium {=dcterms:PhysicalMedium .Class label}
[Examples include paper, canvas, or DVD.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A physical material or carrier.] {comment @en}
[dcth:PhysicalMedium-001] {+dcth:PhysicalMedium-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Media Type] {+dcterms:MediaType ?subClassOf}

# Physical Resource {=dcterms:PhysicalResource .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A material thing.] {comment @en}
[dcth:PhysicalResource-001] {+dcth:PhysicalResource-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# DCMI Point {=dcterms:Point .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of points in space defined by their geographic coordinates according to the DCMI Point Encoding Scheme.] {comment @en}
[dcth:Point-003] {+dcth:Point-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://dublincore.org/documents/dcmi-point/] {+http://dublincore.org/documents/dcmi-point/ ?seeAlso}

# Policy {=dcterms:Policy .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A plan or course of action by an authority, intended to influence and determine decisions, actions, and other matters.] {comment @en}
[dcth:Policy-001] {+dcth:Policy-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# Provenance Statement {=dcterms:ProvenanceStatement .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A statement of any changes in ownership and custody of a resource since its creation that are significant for its authenticity, integrity, and interpretation.] {comment @en}
[dcth:ProvenanceStatement-001] {+dcth:ProvenanceStatement-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# RFC 1766 {=dcterms:RFC1766 .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of tags, constructed according to RFC 1766, for the identification of languages.] {comment @en}
[dcth:RFC1766-003] {+dcth:RFC1766-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.ietf.org/rfc/rfc1766.txt] {+http://www.ietf.org/rfc/rfc1766.txt ?seeAlso}

# RFC 3066 {=dcterms:RFC3066 .Datatype label}
[RFC 3066 has been obsoleted by RFC 4646.] {dcterms:description @en}
*2002-07-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of tags constructed according to RFC 3066 for the identification of languages.] {comment @en}
[dcth:RFC3066-002] {+dcth:RFC3066-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.ietf.org/rfc/rfc3066.txt] {+http://www.ietf.org/rfc/rfc3066.txt ?seeAlso}

# RFC 4646 {=dcterms:RFC4646 .Datatype label}
[RFC 4646 obsoletes RFC 3066.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
[The set of tags constructed according to RFC 4646 for the identification of languages.] {comment @en}
[dcth:RFC4646-001] {+dcth:RFC4646-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.ietf.org/rfc/rfc4646.txt] {+http://www.ietf.org/rfc/rfc4646.txt ?seeAlso}

# RFC 5646 {=dcterms:RFC5646 .Datatype label}
[RFC 5646 obsoletes RFC 4646.] {dcterms:description @en}
*2010-10-11* {dcterms:issued ^^xsd:date}
[The set of tags constructed according to RFC 5646 for the identification of languages.] {comment @en}
[dcth:RFC5646-001] {+dcth:RFC5646-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.ietf.org/rfc/rfc5646.txt] {+http://www.ietf.org/rfc/rfc5646.txt ?seeAlso}

# Rights Statement {=dcterms:RightsStatement .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A statement about the intellectual property rights (IPR) held in or over a Resource, a legal document giving official permission to do something with a resource, or a statement about access rights.] {comment @en}
[dcth:RightsStatement-001] {+dcth:RightsStatement-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# Size or Duration {=dcterms:SizeOrDuration .Class label}
[Examples include a number of pages, a specification of length, width, and breadth, or a period in hours, minutes, and seconds.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A dimension or extent, or a time taken to play or execute.] {comment @en}
[dcth:SizeOrDuration-001] {+dcth:SizeOrDuration-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Media Type or Extent] {+dcterms:MediaTypeOrExtent ?subClassOf}

# Standard {=dcterms:Standard .Class label}
*2008-01-14* {dcterms:issued ^^xsd:date}
[A basis for comparison; a reference point against which other things can be evaluated.] {comment @en}
[dcth:Standard-001] {+dcth:Standard-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}

# TGN {=dcterms:TGN .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of places specified by the Getty Thesaurus of Geographic Names.] {comment @en}
[dcth:TGN-003] {+dcth:TGN-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.getty.edu/research/tools/vocabulary/tgn/index.html] {+http://www.getty.edu/research/tools/vocabulary/tgn/index.html ?seeAlso}

# UDC {=dcterms:UDC .dcam:VocabularyEncodingScheme label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of conceptual resources specified by the Universal Decimal Classification.] {comment @en}
[dcth:UDC-003] {+dcth:UDC-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.udcc.org/] {+http://www.udcc.org/ ?seeAlso}

# URI {=dcterms:URI .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of identifiers constructed according to the generic syntax for Uniform Resource Identifiers as specified by the Internet Engineering Task Force.] {comment @en}
[dcth:URI-003] {+dcth:URI-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.ietf.org/rfc/rfc3986.txt] {+http://www.ietf.org/rfc/rfc3986.txt ?seeAlso}

# W3C-DTF {=dcterms:W3CDTF .Datatype label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The set of dates and times constructed according to the W3C Date and Time Formats Specification.] {comment @en}
[dcth:W3CDTF-003] {+dcth:W3CDTF-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://www.w3.org/TR/NOTE-datetime] {+http://www.w3.org/TR/NOTE-datetime ?seeAlso}

# Abstract {=dcterms:abstract .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A summary of the resource.] {comment @en}
[dcth:abstract-003] {+dcth:abstract-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/description] {+http://purl.org/dc/elements/1.1/description ?subPropertyOf}
[Description] {+dcterms:description ?subPropertyOf}

# Access Rights {=dcterms:accessRights .rdf:Property label}
[Access Rights may include information regarding access or restrictions based on privacy, security, or other policies.] {dcterms:description @en}
*2003-02-15* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Information about who can access the resource or an indication of its security status.] {comment @en}
[dcth:accessRights-002] {+dcth:accessRights-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Rights Statement] {+dcterms:RightsStatement ?range}
[http://purl.org/dc/elements/1.1/rights] {+http://purl.org/dc/elements/1.1/rights ?subPropertyOf}
[Rights] {+dcterms:rights ?subPropertyOf}

# Accrual Method {=dcterms:accrualMethod .rdf:Property label}
*2005-06-13* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[The method by which items are added to a collection.] {comment @en}
[dcth:accrualMethod-003] {+dcth:accrualMethod-003 ?dcterms:hasVersion}
[http://purl.org/dc/dcmitype/Collection] {+http://purl.org/dc/dcmitype/Collection ?domain}
[dcterms:] {+dcterms: ?isDefinedBy}
[Method of Accrual] {+dcterms:MethodOfAccrual ?range}

# Accrual Periodicity {=dcterms:accrualPeriodicity .rdf:Property label}
*2005-06-13* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[The frequency with which items are added to a collection.] {comment @en}
[dcth:accrualPeriodicity-003] {+dcth:accrualPeriodicity-003 ?dcterms:hasVersion}
[http://purl.org/dc/dcmitype/Collection] {+http://purl.org/dc/dcmitype/Collection ?domain}
[dcterms:] {+dcterms: ?isDefinedBy}
[Frequency] {+dcterms:Frequency ?range}

# Accrual Policy {=dcterms:accrualPolicy .rdf:Property label}
*2005-06-13* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[The policy governing the addition of items to a collection.] {comment @en}
[dcth:accrualPolicy-003] {+dcth:accrualPolicy-003 ?dcterms:hasVersion}
[http://purl.org/dc/dcmitype/Collection] {+http://purl.org/dc/dcmitype/Collection ?domain}
[dcterms:] {+dcterms: ?isDefinedBy}
[Policy] {+dcterms:Policy ?range}

# Alternative Title {=dcterms:alternative .rdf:Property label}
[The distinction between titles and alternative titles is application-specific.] {dcterms:description @en}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[An alternative name for the resource.] {comment @en}
[dcth:alternative-003] {+dcth:alternative-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/title] {+http://purl.org/dc/elements/1.1/title ?subPropertyOf}
[Title] {+dcterms:title ?subPropertyOf}

# Audience {=dcterms:audience .rdf:Property label}
*2001-05-21* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A class of entity for whom the resource is intended or useful.] {comment @en}
[dcth:audience-003] {+dcth:audience-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent Class] {+dcterms:AgentClass ?range}

# Date Available {=dcterms:available .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date (often a range) that the resource became or will become available.] {comment @en}
[dcth:available-003] {+dcth:available-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Bibliographic Citation {=dcterms:bibliographicCitation .rdf:Property label}
[Recommended practice is to include sufficient bibliographic detail to identify the resource as unambiguously as possible.] {dcterms:description @en}
*2003-02-15* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A bibliographic reference for the resource.] {comment @en}
[dcth:bibliographicCitation-002] {+dcth:bibliographicCitation-002 ?dcterms:hasVersion}
[Bibliographic Resource] {+dcterms:BibliographicResource ?domain}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/identifier] {+http://purl.org/dc/elements/1.1/identifier ?subPropertyOf}
[Identifier] {+dcterms:identifier ?subPropertyOf}

# Conforms To {=dcterms:conformsTo .rdf:Property label}
*2001-05-21* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[An established standard to which the described resource conforms.] {comment @en}
[dcth:conformsTo-003] {+dcth:conformsTo-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Standard] {+dcterms:Standard ?range}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Contributor {=dcterms:contributor .rdf:Property label}
[Examples of a Contributor include a person, an organization, or a service.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[An entity responsible for making contributions to the resource.] {comment @en}
[dcth:contributorT-001] {+dcth:contributorT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent] {+dcterms:Agent ?range}
[http://purl.org/dc/elements/1.1/contributor] {+http://purl.org/dc/elements/1.1/contributor ?subPropertyOf}

# Coverage {=dcterms:coverage .rdf:Property label}
[Spatial topic and spatial applicability may be a named place or a location specified by its geographic coordinates. Temporal topic may be a named period, date, or date range. A jurisdiction may be a named administrative entity or a geographic place to which the resource applies. Recommended best practice is to use a controlled vocabulary such as the Thesaurus of Geographic Names [TGN]. Where appropriate, named places or time periods can be used in preference to numeric identifiers such as sets of coordinates or date ranges.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The spatial or temporal topic of the resource, the spatial applicability of the resource, or the jurisdiction under which the resource is relevant.] {comment @en}
[dcth:coverageT-001] {+dcth:coverageT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Location, Period, or Jurisdiction] {+dcterms:LocationPeriodOrJurisdiction ?range}
[http://purl.org/dc/elements/1.1/coverage] {+http://purl.org/dc/elements/1.1/coverage ?subPropertyOf}

# Date Created {=dcterms:created .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date of creation of the resource.] {comment @en}
[dcth:created-003] {+dcth:created-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Creator {=dcterms:creator .rdf:Property label}
[Examples of a Creator include a person, an organization, or a service.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[An entity primarily responsible for making the resource.] {comment @en}
[dcth:creatorT-002] {+dcth:creatorT-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent] {+dcterms:Agent ?range}
[http://purl.org/dc/elements/1.1/creator] {+http://purl.org/dc/elements/1.1/creator ?subPropertyOf}
[Contributor] {+dcterms:contributor ?subPropertyOf}
[http://xmlns.com/foaf/0.1/maker] {+http://xmlns.com/foaf/0.1/maker ?owl:equivalentProperty}

# Date {=dcterms:date .rdf:Property label}
[Date may be used to express temporal information at any level of granularity.  Recommended best practice is to use an encoding scheme, such as the W3CDTF profile of ISO 8601 [W3CDTF].] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A point or period of time associated with an event in the lifecycle of the resource.] {comment @en}
[dcth:dateT-001] {+dcth:dateT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}

# Date Accepted {=dcterms:dateAccepted .rdf:Property label}
[Examples of resources to which a Date Accepted may be relevant are a thesis (accepted by a university department) or an article (accepted by a journal).] {dcterms:description @en}
*2002-07-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date of acceptance of the resource.] {comment @en}
[dcth:dateAccepted-002] {+dcth:dateAccepted-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Date Copyrighted {=dcterms:dateCopyrighted .rdf:Property label}
*2002-07-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date of copyright.] {comment @en}
[dcth:dateCopyrighted-002] {+dcth:dateCopyrighted-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Date Submitted {=dcterms:dateSubmitted .rdf:Property label}
[Examples of resources to which a Date Submitted may be relevant are a thesis (submitted to a university department) or an article (submitted to a journal).] {dcterms:description @en}
*2002-07-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date of submission of the resource.] {comment @en}
[dcth:dateSubmitted-002] {+dcth:dateSubmitted-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Description {=dcterms:description .rdf:Property label}
[Description may include but is not limited to: an abstract, a table of contents, a graphical representation, or a free-text account of the resource.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[An account of the resource.] {comment @en}
[dcth:descriptionT-001] {+dcth:descriptionT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/description] {+http://purl.org/dc/elements/1.1/description ?subPropertyOf}

# Audience Education Level {=dcterms:educationLevel .rdf:Property label}
*2002-07-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A class of entity, defined in terms of progression through an educational or training context, for which the described resource is intended.] {comment @en}
[dcth:educationLevel-002] {+dcth:educationLevel-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent Class] {+dcterms:AgentClass ?range}
[Audience] {+dcterms:audience ?subPropertyOf}

# Extent {=dcterms:extent .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The size or duration of the resource.] {comment @en}
[dcth:extent-003] {+dcth:extent-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Size or Duration] {+dcterms:SizeOrDuration ?range}
[http://purl.org/dc/elements/1.1/format] {+http://purl.org/dc/elements/1.1/format ?subPropertyOf}
[Format] {+dcterms:format ?subPropertyOf}

# Format {=dcterms:format .rdf:Property label}
[Examples of dimensions include size and duration. Recommended best practice is to use a controlled vocabulary such as the list of Internet Media Types [MIME].] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The file format, physical medium, or dimensions of the resource.] {comment @en}
[dcth:formatT-001] {+dcth:formatT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Media Type or Extent] {+dcterms:MediaTypeOrExtent ?range}
[http://purl.org/dc/elements/1.1/format] {+http://purl.org/dc/elements/1.1/format ?subPropertyOf}

# Has Format {=dcterms:hasFormat .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is substantially the same as the pre-existing described resource, but in another format.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:hasFormat-003] {+dcth:hasFormat-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Has Part {=dcterms:hasPart .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is included either physically or logically in the described resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:hasPart-003] {+dcth:hasPart-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Has Version {=dcterms:hasVersion .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is a version, edition, or adaptation of the described resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:hasVersion-003] {+dcth:hasVersion-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Identifier {=dcterms:identifier .rdf:Property label}
[Recommended best practice is to identify the resource by means of a string conforming to a formal identification system. ] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[An unambiguous reference to the resource within a given context.] {comment @en}
[dcth:identifierT-001] {+dcth:identifierT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/identifier] {+http://purl.org/dc/elements/1.1/identifier ?subPropertyOf}

# Instructional Method {=dcterms:instructionalMethod .rdf:Property label}
[Instructional Method will typically include ways of presenting instructional materials or conducting instructional activities, patterns of learner-to-learner and learner-to-instructor interactions, and mechanisms by which group and individual levels of learning are measured.  Instructional methods include all aspects of the instruction and learning processes from planning and implementation through evaluation and feedback.] {dcterms:description @en}
*2005-06-13* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A process, used to engender knowledge, attitudes and skills, that the described resource is designed to support.] {comment @en}
[dcth:instructionalMethod-002] {+dcth:instructionalMethod-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Method of Instruction] {+dcterms:MethodOfInstruction ?range}

# Is Format Of {=dcterms:isFormatOf .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is substantially the same as the described resource, but in another format.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:isFormatOf-003] {+dcth:isFormatOf-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Is Part Of {=dcterms:isPartOf .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource in which the described resource is physically or logically included.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:isPartOf-003] {+dcth:isPartOf-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Is Referenced By {=dcterms:isReferencedBy .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that references, cites, or otherwise points to the described resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:isReferencedBy-003] {+dcth:isReferencedBy-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Is Replaced By {=dcterms:isReplacedBy .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that supplants, displaces, or supersedes the described resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:isReplacedBy-003] {+dcth:isReplacedBy-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Is Required By {=dcterms:isRequiredBy .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that requires the described resource to support its function, delivery, or coherence.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:isRequiredBy-003] {+dcth:isRequiredBy-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Is Version Of {=dcterms:isVersionOf .rdf:Property label}
[Changes in version imply substantive changes in content rather than differences in format.] {dcterms:description @en}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource of which the described resource is a version, edition, or adaptation.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:isVersionOf-003] {+dcth:isVersionOf-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Date Issued {=dcterms:issued .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date of formal issuance (e.g., publication) of the resource.] {comment @en}
[dcth:issued-003] {+dcth:issued-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Language {=dcterms:language .rdf:Property label}
[Recommended best practice is to use a controlled vocabulary such as RFC 4646 [RFC4646].] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A language of the resource.] {comment @en}
[dcth:languageT-001] {+dcth:languageT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Linguistic System] {+dcterms:LinguisticSystem ?range}
[http://purl.org/dc/elements/1.1/language] {+http://purl.org/dc/elements/1.1/language ?subPropertyOf}

# License {=dcterms:license .rdf:Property label}
*2004-06-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A legal document giving official permission to do something with the resource.] {comment @en}
[dcth:license-002] {+dcth:license-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[License Document] {+dcterms:LicenseDocument ?range}
[http://purl.org/dc/elements/1.1/rights] {+http://purl.org/dc/elements/1.1/rights ?subPropertyOf}
[Rights] {+dcterms:rights ?subPropertyOf}

# Mediator {=dcterms:mediator .rdf:Property label}
[In an educational context, a mediator might be a parent, teacher, teaching assistant, or care-giver.] {dcterms:description @en}
*2001-05-21* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[An entity that mediates access to the resource and for whom the resource is intended or useful.] {comment @en}
[dcth:mediator-003] {+dcth:mediator-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent Class] {+dcterms:AgentClass ?range}
[Audience] {+dcterms:audience ?subPropertyOf}

# Medium {=dcterms:medium .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The material or physical carrier of the resource.] {comment @en}
[dcth:medium-003] {+dcth:medium-003 ?dcterms:hasVersion}
[Physical Resource] {+dcterms:PhysicalResource ?domain}
[dcterms:] {+dcterms: ?isDefinedBy}
[Physical Medium] {+dcterms:PhysicalMedium ?range}
[http://purl.org/dc/elements/1.1/format] {+http://purl.org/dc/elements/1.1/format ?subPropertyOf}
[Format] {+dcterms:format ?subPropertyOf}

# Date Modified {=dcterms:modified .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date on which the resource was changed.] {comment @en}
[dcth:modified-003] {+dcth:modified-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

# Provenance {=dcterms:provenance .rdf:Property label}
[The statement may include a description of any changes successive custodians made to the resource.] {dcterms:description @en}
*2004-09-20* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A statement of any changes in ownership and custody of the resource since its creation that are significant for its authenticity, integrity, and interpretation.] {comment @en}
[dcth:provenance-002] {+dcth:provenance-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Provenance Statement] {+dcterms:ProvenanceStatement ?range}

# Publisher {=dcterms:publisher .rdf:Property label}
[Examples of a Publisher include a person, an organization, or a service.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[An entity responsible for making the resource available.] {comment @en}
[dcth:publisherT-001] {+dcth:publisherT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent] {+dcterms:Agent ?range}
[http://purl.org/dc/elements/1.1/publisher] {+http://purl.org/dc/elements/1.1/publisher ?subPropertyOf}

# References {=dcterms:references .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is referenced, cited, or otherwise pointed to by the described resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:references-003] {+dcth:references-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Relation {=dcterms:relation .rdf:Property label}
[Recommended best practice is to identify the related resource by means of a string conforming to a formal identification system. ] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:relationT-001] {+dcth:relationT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}

# Replaces {=dcterms:replaces .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is supplanted, displaced, or superseded by the described resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:replaces-003] {+dcth:replaces-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Requires {=dcterms:requires .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource that is required by the described resource to support its function, delivery, or coherence.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:requires-003] {+dcth:requires-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/relation] {+http://purl.org/dc/elements/1.1/relation ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Rights {=dcterms:rights .rdf:Property label}
[Typically, rights information includes a statement about various property rights associated with the resource, including intellectual property rights.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Information about rights held in and over the resource.] {comment @en}
[dcth:rightsT-001] {+dcth:rightsT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Rights Statement] {+dcterms:RightsStatement ?range}
[http://purl.org/dc/elements/1.1/rights] {+http://purl.org/dc/elements/1.1/rights ?subPropertyOf}

# Rights Holder {=dcterms:rightsHolder .rdf:Property label}
*2004-06-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A person or organization owning or managing rights over the resource.] {comment @en}
[dcth:rightsHolder-002] {+dcth:rightsHolder-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Agent] {+dcterms:Agent ?range}

# Source {=dcterms:source .rdf:Property label}
[The described resource may be derived from the related resource in whole or in part. Recommended best practice is to identify the related resource by means of a string conforming to a formal identification system.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A related resource from which the described resource is derived.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:sourceT-001] {+dcth:sourceT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/source] {+http://purl.org/dc/elements/1.1/source ?subPropertyOf}
[Relation] {+dcterms:relation ?subPropertyOf}

# Spatial Coverage {=dcterms:spatial .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Spatial characteristics of the resource.] {comment @en}
[dcth:spatial-003] {+dcth:spatial-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Location] {+dcterms:Location ?range}
[http://purl.org/dc/elements/1.1/coverage] {+http://purl.org/dc/elements/1.1/coverage ?subPropertyOf}
[Coverage] {+dcterms:coverage ?subPropertyOf}

# Subject {=dcterms:subject .rdf:Property label}
[Typically, the subject will be represented using keywords, key phrases, or classification codes. Recommended best practice is to use a controlled vocabulary.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2012-06-14* {dcterms:modified ^^xsd:date}
[The topic of the resource.] {comment @en}
[This term is intended to be used with non-literal values as defined in the DCMI Abstract Model (http://dublincore.org/documents/abstract-model/).  As of December 2007, the DCMI Usage Board is seeking a way to express this intention with a formal range declaration.] {skos:note @en}
[dcth:subjectT-002] {+dcth:subjectT-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/subject] {+http://purl.org/dc/elements/1.1/subject ?subPropertyOf}

# Table Of Contents {=dcterms:tableOfContents .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[A list of subunits of the resource.] {comment @en}
[dcth:tableOfContents-003] {+dcth:tableOfContents-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[http://purl.org/dc/elements/1.1/description] {+http://purl.org/dc/elements/1.1/description ?subPropertyOf}
[Description] {+dcterms:description ?subPropertyOf}

# Temporal Coverage {=dcterms:temporal .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Temporal characteristics of the resource.] {comment @en}
[dcth:temporal-003] {+dcth:temporal-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Period of Time] {+dcterms:PeriodOfTime ?range}
[http://purl.org/dc/elements/1.1/coverage] {+http://purl.org/dc/elements/1.1/coverage ?subPropertyOf}
[Coverage] {+dcterms:coverage ?subPropertyOf}

# Title {=dcterms:title .rdf:Property label}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2010-10-11* {dcterms:modified ^^xsd:date}
[A name given to the resource.] {comment @en}
[dcth:titleT-002] {+dcth:titleT-002 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/title] {+http://purl.org/dc/elements/1.1/title ?subPropertyOf}

# Type {=dcterms:type .rdf:Property label}
[Recommended best practice is to use a controlled vocabulary such as the DCMI Type Vocabulary [DCMITYPE]. To describe the file format, physical medium, or dimensions of the resource, use the Format element.] {dcterms:description @en}
*2008-01-14* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[The nature or genre of the resource.] {comment @en}
[dcth:typeT-001] {+dcth:typeT-001 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Class] {+Class ?range}
[http://purl.org/dc/elements/1.1/type] {+http://purl.org/dc/elements/1.1/type ?subPropertyOf}

# Date Valid {=dcterms:valid .rdf:Property label}
*2000-07-11* {dcterms:issued ^^xsd:date}
*2008-01-14* {dcterms:modified ^^xsd:date}
[Date (often a range) of validity of a resource.] {comment @en}
[dcth:valid-003] {+dcth:valid-003 ?dcterms:hasVersion}
[dcterms:] {+dcterms: ?isDefinedBy}
[Literal] {+Literal ?range}
[http://purl.org/dc/elements/1.1/date] {+http://purl.org/dc/elements/1.1/date ?subPropertyOf}
[Date] {+dcterms:date ?subPropertyOf}

