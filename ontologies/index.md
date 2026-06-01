

# Public Ontologies converted to MD-LD

This folder collects the most useful and meaningful ontologies and namespaces maintained as core web standards, all converted to MD-LD format for human-readable and machine-processable linked data.

---

## Core Foundation Ontologies

MD-LD includes 5 foundational W3C ontologies by default. These are the intrinsic structures defining RDF as a functional system. Every semantic statement in MD-LD is built upon these primitives.

### [RDF — Resource Description Framework](./rdf.md)

The fundamental grammar of linked data. RDF defines how statements are made: every fact is a triple of *subject–predicate–object*. This ontology includes core classes like `rdf:Property`, `rdf:Statement` (for reification), and specialized containers (`rdf:Bag`, `rdf:Seq`, `rdf:Alt`, `rdf:List`). It also defines essential datatypes like `rdf:langString` (language-tagged text), `rdf:HTML`, `rdf:XML`, and `rdf:JSON`.

**Use case (2026):** Whenever you're creating a semantic model, RDF provides the meta-vocabulary to describe types, properties, and complex relationships. The reification pattern (`rdf:Statement`) is essential for adding context or metadata to statements themselves—for example, recording who said something or when it was said.

---

### [RDFS — RDF Schema](./rdfs.md)

The schema layer that sits atop RDF, providing vocabulary for describing *classes*, *inheritance hierarchies*, and *domains/ranges* of properties. RDFS defines `rdfs:Class`, `rdfs:Resource` (the universal parent), `rdfs:Datatype`, and annotation properties like `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, and `rdfs:isDefinedBy`. It enables type hierarchies and schema constraints without the complexity of OWL.

**Use case (2026):** Use RDFS when you need to organize concepts into taxonomies, annotate your vocabulary with human-readable labels and descriptions, and define which properties apply to which classes. Simpler and more scalable than OWL for many use cases.

---

### [SHACL — Shapes Constraint Language](./shacl.md)

The validation framework for RDF graphs. SHACL allows you to define *shapes*—constraints that data must satisfy. You define targets (which nodes to validate), then apply constraints (`sh:minCount`, `sh:maxCount`, `sh:datatype`, `sh:pattern`, etc.) to validate that data conforms to your specification. SHACL supports property paths, logical operators, and custom SPARQL constraints.

**Use case (2026):** Use SHACL in MD-LD to make documentation self-validating. Define a shape for "User" records, enforce that usernames and emails are present, validate email patterns, and automatically extract metadata for API documentation. SHACL turns descriptions into machine-checkable contracts.

---

### [PROV-O — W3C Provenance Ontology](./prov-o.md)

The standard vocabulary for tracking *who* made *what* *when* and *how*. PROV-O defines three core classes: `prov:Entity` (things with fixed aspects), `prov:Activity` (processes that unfold over time), and `prov:Agent` (responsible parties). It captures relationships like `prov:wasGeneratedBy`, `prov:used`, `prov:wasDerivedFrom`, `prov:wasAssociatedWith`, and `prov:actedOnBehalfOf`.

**Use case (2026):** Trace the origin and evolution of data. Track which datasets fed into a data processing pipeline, who ran the analysis, what agent (human or automated) was responsible, and how outputs were derived from inputs. Provenance chains are essential for reproducibility, auditability, and attribution in AI/ML workflows and data journalism.

---

### [XSD — XML Schema Definition Datatypes](./xsd.md)

The canonical vocabulary of *literal types* for RDF. XSD provides atomic datatypes: primitives like `xsd:string`, `xsd:boolean`, `xsd:integer`, `xsd:decimal`, `xsd:double`, and temporal types like `xsd:dateTime`, `xsd:date`, `xsd:time`, `xsd:duration`. It also defines specialized numeric types (`xsd:nonNegativeInteger`, `xsd:positiveInteger`), durations (`xsd:dayTimeDuration`, `xsd:yearMonthDuration`), and URI references (`xsd:anyURI`).

**Use case (2026):** Every literal value in an RDF triple carries a datatype. XSD ensures type safety and interoperability: a client knows that `[2026-06-01] {ex:date ^^xsd:date}` is parseable as a calendar date, not a string. Essential for API contracts, database schemas, and scientific data where precision and type checking matter.

---

## Metadata & Discovery Ontologies

These vocabularies provide standardized ways to describe and catalog resources, enabling discovery and interoperability across distributed data systems.

### [DCTERMS — Dublin Core Metadata Terms](./dcterms.md)

The foundational metadata vocabulary, maintained by the Dublin Core Metadata Initiative since 1995. DCTERMS provides 50+ properties for describing any resource: `dcterms:title`, `dcterms:creator`, `dcterms:date`, `dcterms:subject`, `dcterms:description`, `dcterms:license`, and many more. It also defines classes like `dcterms:Agent`, `dcterms:Location`, `dcterms:BibliographicResource`, and encoding schemes like ISO 639 (languages), ISO 3166 (countries), and Dewey Decimal Classification.

**Use case (2026):** Use DCTERMS to annotate any digital resource with metadata. A dataset's creator, publication date, subject matter, rights statement, and language are all covered by DCTERMS. It's the lingua franca of digital libraries, archives, and data portals. Combine with DCAT for machine-readable data catalogs.

---

### [DCAT — Data Catalog Vocabulary](./dcat.md)

The W3C standard for publishing structured metadata about datasets and data services. DCAT introduces `dcat:Catalog` (a curated collection of metadata), `dcat:Dataset` (a collection of data), `dcat:Distribution` (a concrete file or API endpoint), and `dcat:DataService` (a service providing data). It enables cross-catalog discovery and federated searching.

**Use case (2026):** Build a data portal that aggregates datasets from multiple agencies or organizations. DCAT enables searching across decentralized catalogs, automatic discovery of datasets, and federation of metadata. Government open data platforms, research data repositories, and corporate data governance use DCAT for machine-readable data discovery.

---

### [FOAF — Friend of a Friend](./foaf.md)

A social ontology for describing people, organizations, and their relationships. FOAF defines `foaf:Person`, `foaf:Organization`, `foaf:Group`, `foaf:Agent`, `foaf:Document`, and properties like `foaf:name`, `foaf:email`, `foaf:homepage`, `foaf:knows`, `foaf:givenName`, `foaf:familyName`, and online account types (`foaf:OnlineAccount`, `foaf:OnlineChatAccount`).

**Use case (2026):** Model social networks, organizational structures, and contact information. FOAF enables decentralized identity systems, social graph queries, and machine-readable profiles. It bridges personal web pages, professional networks, and organizational directories. Though partly superseded by Schema.org, FOAF remains the core vocabulary for semantic social networks.

---

## Time & Events Ontologies

These vocabularies provide precise ways to model temporal phenomena, from instants and intervals to recurring events and complex temporal relationships.

### [Time — OWL-Time Ontology](./time.md)

A comprehensive formal ontology for representing temporal concepts. Time defines classes for instants (`time:Instant`), intervals (`time:ProperInterval`), durations (`time:Duration`), and temporal reference frames. It supports multiple calendar systems, time zones, and fine-grained temporal descriptions (year, month, day, hour, minute, second). Relationships include `time:before`, `time:after`, `time:inside`, `time:during`, and `time:intervalIn`.

**Use case (2026):** Model complex temporal requirements: project schedules with overlapping phases, historical events with uncertain dates, astronomical observations across different calendars, or business rules that change over time. OWL-Time supports non-Gregorian calendars for international and scientific applications.

---

### [Activity Streams 2.0](./activity-streams-2.md)

A vocabulary for modeling activities, notifications, and event streams in social media and collaborative systems. Activity Streams defines an `as:Activity` class with actor-action-object patterns: `as:Create`, `as:Update`, `as:Delete`, `as:Like`, `as:Follow`. Each activity carries temporal metadata and can reference actors, objects, and audiences.

**Use case (2026):** Build federated social media platforms, activity feeds, and real-time notification systems. Activity Streams is the foundation of ActivityPub, a decentralized social networking protocol. Use it to model user interactions, publish timelines of events, and enable interoperability across different social platforms.

---

## Knowledge Organization & Semantic Vocabularies

These ontologies provide tools for organizing and expressing knowledge—from controlled vocabularies to linked data vocabularies for web markup.

### [SKOS — Simple Knowledge Organization System](./skos.md)

A vocabulary for representing *concept schemes*—thesauri, taxonomies, classification schemes, and controlled vocabularies. SKOS defines `skos:Concept`, `skos:ConceptScheme`, and relationships like `skos:broader`, `skos:narrower`, `skos:related`, `skos:exactMatch`, `skos:closeMatch`, and `skos:broadMatch`. It supports multiple labels (preferred, alternative, hidden) and facilitates mapping between different vocabularies.

**Use case (2026):** Build and publish controlled vocabularies—subject headings for libraries, medical terminology (SNOMED CT, ICD), or domain-specific glossaries. SKOS enables concept matching across different languages and systems. Use it to publish your taxonomy as linked data and enable faceted search and semantic enrichment in your applications.

---

### [Schema.org](./schemaorg.md)

A collaborative vocabulary for structured data on the web, supported by Google, Microsoft, Yahoo, and Yandex. Schema.org provides over 800 types and 6000+ properties covering entities like `schema:Person`, `schema:Organization`, `schema:Event`, `schema:Product`, `schema:Article`, `schema:Thing`. It's designed for SEO and machine-readable web markup (via JSON-LD, RDFa, microdata).

**Use case (2026):** Markup your web content with structured data for search engines and aggregators. A recipe page marked up with `schema:Recipe` properties enables rich snippets in search results. Event information marked with `schema:Event` appears in calendar searches. Schema.org is the dominant vocabulary for web markup and powers e-commerce platforms, search enhancements, and knowledge graph construction.

---

## Domain-Specific Ontologies

Specialized vocabularies tailored to specific scientific, cultural, linguistic, and technical domains.

### [CIDOC CRM — Conceptual Reference Model](./cidoc_crm.md)

The international standard for cultural heritage information, used by museums, archives, and historical research communities. CIDOC CRM models entities (`cidoc_crm:E1_CRM_Entity`), physical objects, events, actors, temporal relationships, and provenance with museum-grade precision. It supports complex inheritance hierarchies for describing cultural objects and their transformations over time.

**Use case (2026):** Document museum collections, archaeological artifacts, historical records, and cultural heritage. CIDOC CRM enables semantic queries like "find all paintings created by a specific artist in the 19th century that are currently housed in a particular museum and have been restored." It's the ontology of record for Europeana, the largest digital library of European cultural heritage.

---

### [SOSA — Sensor, Observation, Sample, and Actuator](./sosa.md)

The vocabulary for IoT, sensor networks, and scientific measurements. SOSA defines `sosa:Observation` (a measurement result), `sosa:Sensor` (a device), `sosa:Sample` (a specimen), `sosa:FeatureOfInterest` (what is being observed), and relationships like `sosa:madeBySensor`, `sosa:hasResult`, `sosa:observedProperty`, and `sosa:resultTime`. It connects to QUDT for units and dimensions.

**Use case (2026):** Model weather stations, scientific instruments, laboratory experiments, and environmental monitoring. SOSA powers machine-to-machine data exchange in smart cities, precision agriculture, and research data management. Link observations to temporal and spatial contexts to create queryable sensor data lakes.

---

### [QUDT — Quantities, Units, Dimensions and Types](./qudt.md)

A comprehensive vocabulary for scientific quantities, units of measurement, and dimensional analysis. QUDT includes all SI units (meter, kilogram, second, ampere) and common derived units, with conversion factors. It defines `qudt:Quantity`, `qudt:Unit`, and `qudt:QuantityKind` to enable dimensional consistency checking and unit conversion.

**Use case (2026):** Annotate scientific and engineering data with precise units. A measurement `[42.5] {ex:temperature ^^xsd:double; qudt:unit qudt:DegreeCelsius}` is unambiguous and machine-processable. QUDT enables automatic unit conversion, dimensional analysis checks, and integration of data from instruments using different unit systems.

---

### [GOLD — General Ontology for Linguistic Description](./gold.md)

A linguistic ontology for describing language resources, linguistic features, and morphosyntactic properties. GOLD models concepts like language, part-of-speech, grammatical case, tense, aspect, and provides a foundation for NLP and digital humanities research.

**Use case (2026):** Annotate multilingual datasets, define linguistic feature sets for language processing, and link language corpora to linguistic metadata. GOLD enables semantic queries over language resources and supports computational linguistics research.

---

### [LexInfo — Lexical Information Ontology](./lexinfo.md)

A vocabulary for describing lexical-semantic data: words, senses, definitions, and linguistic relationships. LexInfo extends the Lemon model with properties for morphological features, syntactic frames, and semantic relations between lexical entries.

**Use case (2026):** Build machine-readable dictionaries, thesauri, and lexical databases. LexInfo enables applications to understand word meanings, grammatical properties, and relationships like synonymy and hypernymy. Combine with SKOS for hierarchical semantic relationships.

---

## Web Standards & Infrastructure Ontologies

Vocabularies that support the infrastructure of the semantic web and modern APIs.

### [OWL — Web Ontology Language](./owl.md)

The formal knowledge representation language underlying semantic web inference. OWL extends RDFS with class constructors (union, intersection, complement), cardinality constraints, property restrictions, and inverse properties. It enables logical reasoning: deriving new facts from explicit statements and detecting contradictions.

**Use case (2026):** Define formal ontologies with logical constraints when simple RDFS schemas are insufficient. OWL enables expert systems, semantic reasoning, and automated knowledge base construction. Use it for regulatory compliance checking, medical diagnosis support, or complex business rule engines where inference is critical.

---

### [P-PLAN — Plan Ontology](./p-plan.md)

A vocabulary for modeling plans, workflows, and execution provenance. P-PLAN distinguishes between the *plan* (a specification) and its *execution* (actual steps taken), with relationships between planned and executed entities tracking how reality matched the specification.

**Use case (2026):** Document workflows, business processes, scientific research protocols, and project plans. Track deviations between plan and execution to identify bottlenecks or issues. P-PLAN combines with PROV-O to create auditable workflow records essential for compliance and reproducibility.

---

### [Hydra — Hypermedia API Vocabulary](./hydra.md)

A vocabulary for describing hypermedia APIs and REST services in machine-readable form. Hydra enables API documentation to be processed by clients to discover and invoke operations dynamically, without hardcoding endpoint URLs.

**Use case (2026):** Publish self-documenting APIs that clients can navigate and invoke without manual documentation. Hydra enables generic API clients and supports content negotiation, operation discovery, and semantic understanding of API operations.

---

### [Web Annotations](./web-annotations.md)

The W3C standard for creating, exchanging, and querying annotations (comments, highlights, tags, corrections) on web resources. Web Annotations define `oa:Annotation`, motivation types (commenting, tagging, highlighting, etc.), and relationships to both annotated content and annotation bodies.

**Use case (2026):** Build collaborative annotation platforms where users comment on, tag, and highlight web resources. Web Annotations enable interoperable annotation exchange across applications, supporting open scholarly communication, collaborative research, and community knowledge curation. Combine with Activity Streams for shared annotation histories.

