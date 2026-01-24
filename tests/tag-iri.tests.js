import { parse } from '../src/index.js';

// Test helpers
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function hasQuad(quads, subject, predicate, object) {
    return quads.some(quad =>
        quad.subject.value === subject &&
        quad.predicate.value === predicate &&
        (quad.object.termType === 'Literal' ? quad.object.value : quad.object.value) === object
    );
}

// Refactored Tag URI test suite - focused on semantic scenarios
export const tagIriTests = [
    {
        name: 'Complete research workflow with tag URIs',
        fn: () => {
            // Tests: base namespace, date authority, email authority, paths, types
            const md = `[lab] <tag:research-lab.org,2025:exp/>
[alice] <tag:alice@university.edu,2025:researcher/>

# Experiment Series {=lab:series/quantum-computing .schema:ResearchProject}
Title: [Quantum Computing Experiments] {schema:title}
Description: [Series of quantum computing experiments] {schema:description}
Principal Investigator: [Dr. Alice Smith] {?schema:principalInvestigator =alice:alice}

{=#experiment-001 .schema:Experiment}
Name: [Qubit Entanglement Test] {schema:name}
Date: [2025-10-15] {schema:date}
Status: [Completed] {schema:status}

Results: {?schema:hasPart .Measurement label}
- Entanglement Rate {=lab:measurement-001}
  Value: [0.87] {schema:measurementValue ^^xsd:decimal}
  Unit: [Probability] {schema:measurementUnit}
- Coherence Time {=lab:measurement-002}
  Value: [120] {schema:measurementValue ^^xsd:integer}
  Unit: [Microseconds] {schema:measurementUnit}`;

            const { quads } = parse(md, {
                context: {
                    schema: 'http://schema.org/',
                    xsd: 'http://www.w3.org/2001/XMLSchema#'
                }
            });

            // Core experiment structure
            assert(hasQuad(quads, 'tag:research-lab.org,2025:exp/series/quantum-computing', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/ResearchProject'),
                'Should have project type with tag URI');
            assert(hasQuad(quads, 'tag:research-lab.org,2025:exp/series/quantum-computing', 'http://schema.org/title', 'Quantum Computing Experiments'),
                'Should have title with tag URI subject');

            // Fragment-based experiment (resolves to last subject)
            assert(hasQuad(quads, 'tag:alice@university.edu,2025:researcher/alice#experiment-001', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Experiment'),
                'Should handle fragment with current subject base');

            // Cross-namespace relationships
            assert(hasQuad(quads, 'tag:research-lab.org,2025:exp/series/quantum-computing', 'http://schema.org/principalInvestigator', 'tag:alice@university.edu,2025:researcher/alice'),
                'Should reference different tag namespace');

            // List with tag URI items (correctly resolved IRIs)
            assert(hasQuad(quads, 'tag:alice@university.edu,2025:researcher/alice#experiment-001', 'http://schema.org/hasPart', 'tag:research-lab.org,2025:exp/measurement-001'),
                'Should have list relationships with tag URIs (IRIs properly resolved)');

            // Datatype handling (resolved to correct subject)
            assert(hasQuad(quads, 'tag:alice@university.edu,2025:researcher/alice#experiment-001', 'http://schema.org/measurementValue', '0.87'),
                'Should handle decimal datatype with tag URI subject');

            assert(quads.length >= 10, `Should emit comprehensive workflow triples, got ${quads.length}`);
        }
    },

    {
        name: 'Collaborative document with multiple authorities',
        fn: () => {
            // Tests: special characters, multiple namespaces, object relationships
            const md = `[org] <tag:company!dev@example.org,2026:docs/>
[reviewer] <tag:user!noreply@quality-assurance.org,2026:reviewers/>

# Technical Specification {=org:spec-v2 .schema:TechnicalDocument}
Title: [API Specification v2.0] {schema:title}
Version: [2.0] {schema:version}

Authors: {?schema:author .Person label}
- Lead Developer {=org:dev-team}
- System Architect {=org:arch-team}

Review Process: {?schema:reviewedBy .Reviewer label}
- Senior Reviewer {=reviewer:senior-1}
- Security Review {=reviewer:security-1}

{=#security-section .schema:DocumentSection}
Content: [Security requirements and authentication flows] {schema:text}
Requirements: {?schema:hasRequirement .SecurityRequirement}
- OAuth 2.0 {=org:req-oauth}
- JWT Validation {=org:req-jwt}`;

            const { quads } = parse(md, {
                context: {
                    schema: 'http://schema.org/'
                }
            });

            // Special characters in authority
            assert(hasQuad(quads, 'tag:company!dev@example.org,2026:docs/spec-v2', 'http://schema.org/title', 'API Specification v2.0'),
                'Should handle special characters in tag URI authority');

            // Multiple namespace interactions
            assert(hasQuad(quads, 'tag:company!dev@example.org,2026:docs/spec-v2', 'http://schema.org/reviewedBy', 'tag:user!noreply@quality-assurance.org,2026:reviewers/senior-1'),
                'Should reference across different tag namespaces');

            // Fragment with complex path
            assert(hasQuad(quads, 'tag:company!dev@example.org,2026:docs/spec-v2#security-section', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/DocumentSection'),
                'Should handle fragment with special character authority');

            // Nested list relationships
            assert(hasQuad(quads, 'tag:company!dev@example.org,2026:docs/spec-v2#security-section', 'http://schema.org/hasRequirement', 'tag:company!dev@example.org,2026:docs/req-oauth'),
                'Should handle nested list with tag URIs');

            assert(quads.length >= 8, `Should emit collaborative document triples, got ${quads.length}`);
        }
    },

    {
        name: 'Scientific dataset with provenance tracking',
        fn: () => {
            // Tests: soft IRIs, object predicates, complex relationships
            const md = `[dataset] <tag:climate-research.org,2024:dataset/>
[instrument] <tag:noaa.gov,2024:instruments/>

# Climate Study {=dataset:arctic-2024 .schema:Dataset}
Name: [Arctic Temperature Study 2024] {schema:name}
Description: [Comprehensive arctic temperature analysis] {schema:description}

Data Collection: {?schema:instrumentUsed .Instrument}
- Weather Station Alpha {=instrument:station-alpha}
- Satellite Sensor {=instrument:satellite-beta}

{=#processing-pipeline .schema:SoftwareApplication}
Name: [Temperature Processing Pipeline] {schema:name}
Version: [1.2.3] {schema:version}

Related Studies: [Related climate studies] {+dataset:related-studies ?schema:isRelatedTo}

Quality Assurance: [QA Results] {+dataset:qa-results ?schema:qualityAssurance}`;

            const { quads } = parse(md, {
                context: {
                    schema: 'http://schema.org/'
                }
            });

            // Base tag URI with date
            assert(hasQuad(quads, 'tag:climate-research.org,2024:dataset/arctic-2024', 'http://schema.org/name', 'Arctic Temperature Study 2024'),
                'Should handle date-based tag URI authority');

            // Cross-domain relationships
            assert(hasQuad(quads, 'tag:climate-research.org,2024:dataset/arctic-2024', 'http://schema.org/instrumentUsed', 'tag:noaa.gov,2024:instruments/station-alpha'),
                'Should reference government agency tag namespace');

            // Soft IRI with tag URI (resolves to current subject)
            assert(hasQuad(quads, 'tag:climate-research.org,2024:dataset/arctic-2024#processing-pipeline', 'http://schema.org/isRelatedTo', 'tag:climate-research.org,2024:dataset/related-studies'),
                'Should use soft IRI with current subject base');

            // Fragment with type
            assert(hasQuad(quads, 'tag:climate-research.org,2024:dataset/arctic-2024#processing-pipeline', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/SoftwareApplication'),
                'Should handle fragment with explicit type');

            assert(quads.length >= 6, `Should emit provenance tracking triples, got ${quads.length}`);
        }
    },

    {
        name: 'Personal knowledge graph with semantic relationships',
        fn: () => {
            // Tests: email authority, bidirectional relationships, inheritance
            const md = `[me] <tag:john.doe@gmail.com,2026:pkg/>

# Personal Profile {=me:profile .schema:Person}
Name: [John Doe] {schema:name}
Email: [john.doe@gmail.com] {schema:email}
Skills: [Python, RDF, Semantic Web] {schema:knowsAbout}

{=#projects .schema:Collection}
Name: [My Projects] {schema:name}

Projects: {?schema:hasPart .Project label}
- MD-LD Parser {=me:project-mdld}
  Status: [Active] {schema:status}
  Technologies: [JavaScript, RDF] {schema:programmingLanguage}
- Climate Graph {=me:project-climate}
  Status: [Planning] {schema:status}

{=#learning .schema:LearningResource}
Topics: [Semantic Web, Linked Data, RDF Schema] {schema:teaches}

Connections: [Professional Network] {+me:network ?schema:knows}
Collaborators: [Alice, Bob] {?schema:collaboratesWith .Person}`;

            const { quads } = parse(md, {
                context: {
                    schema: 'http://schema.org/'
                }
            });

            // Email-based authority
            assert(hasQuad(quads, 'tag:john.doe@gmail.com,2026:pkg/profile', 'http://schema.org/name', 'John Doe'),
                'Should handle email authority in tag URI');

            // Fragment-based organization
            assert(hasQuad(quads, 'tag:john.doe@gmail.com,2026:pkg/profile#projects', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Collection'),
                'Should organize content with fragments');

            // List inheritance
            assert(hasQuad(quads, 'tag:john.doe@gmail.com,2026:pkg/project-mdld', 'http://www.w3.org/2000/01/rdf-schema#label', 'MD-LD Parser'),
                'Should inherit label predicate in list context');

            // Soft IRI relationships (resolves to current subject)
            assert(hasQuad(quads, 'tag:john.doe@gmail.com,2026:pkg/profile#learning', 'http://schema.org/knows', 'tag:john.doe@gmail.com,2026:pkg/network'),
                'Should establish relationships via soft IRI from current subject');

            assert(quads.length >= 8, `Should emit personal knowledge graph triples, got ${quads.length}`);
        }
    },

    {
        name: 'Complex nested structures with mixed namespaces',
        fn: () => {
            // Tests: edge cases, mixed tag/HTTP namespaces, complex nesting
            const md = `[tag] <tag:experimental.org,2026:complex/>
[st] <https://standard.org/ns/>

# Complex Document {=tag:main-doc .st:Document}
Title: [Complex Nested Structure] {st:title}

{=#section-1 .st:Section}
Heading: [First Section] {st:heading}

Subsections: {?st:hasSubsection .st:SubSection}
- Subsection 1.1 {=tag:subsection-1-1}
  Content: [Nested content here] {tag:content}
- Subsection 1.2 {=tag:subsection-1-2}

{=#metadata .tag:Metadata}
Created: [2026-01-15] {schema:dateCreated}
Modified: [2026-01-20] {schema:dateModified}

Tags: [experimental, nested, complex] {?schema:keyword .tag:Tag}
- Experimental {=tag:exp-tag}
- Nested {=tag:nested-tag}

Additional info {=tag:main-doc}

References: [External resources] {?st:references}
- Standard Spec {=st:standard-spec}`;

            const { quads } = parse(md, {
                context: {
                    schema: 'http://schema.org/',
                    st: 'https://standard.org/ns/'
                }
            });

            // Mixed namespace types
            assert(hasQuad(quads, 'tag:experimental.org,2026:complex/main-doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'https://standard.org/ns/Document'),
                'Should handle mixed tag/HTTP namespaces');

            // Deep nesting with fragments
            assert(hasQuad(quads, 'tag:experimental.org,2026:complex/main-doc#section-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'https://standard.org/ns/Section'),
                'Should handle nested fragments');

            // Cross-namespace relationships
            assert(hasQuad(quads, 'tag:experimental.org,2026:complex/main-doc#section-1', 'https://standard.org/ns/hasSubsection', 'tag:experimental.org,2026:complex/subsection-1-1'),
                'Should relate across namespace boundaries');

            // Complex list with mixed types
            assert(hasQuad(quads, 'tag:experimental.org,2026:complex/main-doc#metadata', 'http://schema.org/keyword', 'tag:experimental.org,2026:complex/exp-tag'),
                'Should handle mixed types in complex lists');

            // Soft IRI with HTTP namespace (object resolves to standard namespace)
            assert(hasQuad(quads, 'tag:experimental.org,2026:complex/main-doc#metadata', 'https://standard.org/ns/references', 'https://standard.org/ns/standard-spec'),
                'Should use soft IRI with mixed namespaces');

            assert(quads.length >= 10, `Should emit complex nested structure triples, got ${quads.length}`);
        }
    }
];
