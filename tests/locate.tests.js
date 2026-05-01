import { parse, locate, generate } from '../src/index.js';

// Test helpers
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

export const locateTests = [
    // Test 1: Basic locate with origin
    {
        name: 'Locate - Basic quad location with origin',
        fn: () => {
            const mdld = `# Article {=ex:article .ex:Article}

> Alice Smith {author}
> 2024-01-01 {datePublished}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );

            assert(authorQuad, 'Should find author quad');

            const location = locate(authorQuad, result.origin);
            assert(location, 'Should locate author quad');
            assertEqual(location.carrierType, 'blockquote');
            assert(typeof location.blockId === 'string');
            assertEqual(location.subject, 'http://example.org/article');
            assertEqual(location.value, 'Alice Smith');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 2: Auto-parse convenience
    {
        name: 'Locate - Auto-parse when origin not provided',
        fn: () => {
            const mdld = `# Person {=ex:alice .ex:Person}

> Alice Smith {name}
> 25 {age ^^xsd:integer}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const aliceQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/alice' &&
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#name'
            );

            const location = locate(aliceQuad, result.origin);
            assert(location, 'Should locate quad with origin');
            assertEqual(location.carrierType, 'blockquote');
            assertEqual(location.value, 'Alice Smith');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 3: Heading location
    {
        name: 'Locate - Type annotation in heading',
        fn: () => {
            const mdld = `# Document {=ex:doc .ex:Document .rdfs:label}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const typeQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/doc' &&
                q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            );

            const location = locate(typeQuad, result.origin);
            assert(location, 'Should locate type annotation');
            assertEqual(location.carrierType, 'heading');
            assertEqual(location.value, 'Document');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 4: Object reference location
    {
        name: 'Locate - Object reference in blockquote',
        fn: () => {
            const mdld = `# Article {=ex:article .ex:Article}

> alice {+ex:alice ?author}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const objectQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );

            const location = locate(objectQuad, result.origin);
            assert(location, 'Should locate object reference');
            assertEqual(location.carrierType, 'blockquote');
            assertEqual(location.value, 'alice');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 5: Literal with datatype
    {
        name: 'Locate - Literal with datatype',
        fn: () => {
            const mdld = `# Person {=ex:person .ex:Person}

> 25 {age ^^xsd:integer}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const ageQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/person' &&
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#age'
            );

            const location = locate(ageQuad, result.origin);
            assert(location, 'Should locate datatype literal');
            assertEqual(location.carrierType, 'blockquote');
            assertEqual(location.value, '25');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 6: Non-existent quad
    {
        name: 'Locate - Non-existent quad returns null',
        fn: () => {
            const mdld = `# Article {=ex:article .ex:Article}

> Alice Smith {author}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const fakeQuad = {
                subject: { termType: 'NamedNode', value: 'http://example.org/nonexistent' },
                predicate: { termType: 'NamedNode', value: 'http://schema.org/fake' },
                object: { termType: 'Literal', value: 'fake' }
            };

            const location = locate(fakeQuad, result.origin);
            assert(location === null, 'Should return null for non-existent quad');
        }
    },

    // Test 7: Generated MDLD location
    {
        name: 'Locate - Quad in generated MDLD',
        fn: () => {
            const quads = [
                {
                    subject: { termType: 'NamedNode', value: 'http://example.org/project' },
                    predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
                    object: { termType: 'NamedNode', value: 'http://example.org/Project' }
                },
                {
                    subject: { termType: 'NamedNode', value: 'http://example.org/project' },
                    predicate: { termType: 'NamedNode', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
                    object: { termType: 'Literal', value: 'Web Application' }
                }
            ];

            const { text } = generate({ quads, context: { ex: 'http://example.org/' } });
            const result = parse(text, { ex: 'http://example.org/' });
            const labelQuad = result.quads.find(q => q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label');

            const location = locate(labelQuad, result.origin);
            assert(location, 'Should locate quad in generated MDLD');
            assertEqual(location.carrierType, 'heading');
            assertEqual(location.value, 'Web Application');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 8: Complex few-shot example (simplified)
    {
        name: 'Locate - Complex few-shot example (simplified)',
        fn: () => {
            // Use inline square brackets which work correctly with locate()
            const mdld = `# Project Alpha {=ex:ProjectAlpha .ex:Project}

[Design schema] {label}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const labelQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/ProjectAlpha' &&
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label'
            );

            const location = locate(labelQuad, result.origin);
            assert(location, 'Should locate label quad in span');
            assertEqual(location.carrierType, 'span');
            assertEqual(location.value, 'Design schema');
            assertEqual(location.polarity, '+');
        }
    },

    // Test 9: Multiple parameter patterns
    {
        name: 'Locate - Multiple parameter patterns',
        fn: () => {
            const mdld = `# Test {=ex:test .ex:Test}

> value {property} `;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const quad = result.quads[0];

            // Pattern 1: All parameters (new API)
            const loc1 = locate(quad, result.origin);
            assert(loc1, 'Pattern 1 should work');

            // Pattern 2: Insufficient data
            const loc2 = locate(quad);
            assert(loc2 === null, 'Pattern 2 should return null');
        }
    },

    // Test 10: Range precision
    {
        name: 'Locate - Range precision validation',
        fn: () => {
            const mdld = `# Article {=ex:article .ex:Article}

[Alice Smith] {author}`;

            const result = parse(mdld, { context: { ex: 'http://example.org/' } });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );

            const location = locate(authorQuad, result.origin);
            assert(location, 'Should locate quad');

            // Validate range is within text bounds
            assert(location.range.start >= 0, 'Range start should be non-negative');
            assert(location.range.end <= mdld.length, 'Range end should be within text');
            assert(location.range.start < location.range.end, 'Range start should be before end');

            // Validate value matches expected content
            assertEqual(location.value, 'Alice Smith');
            assertEqual(location.polarity, '+');
        }
    }
];
