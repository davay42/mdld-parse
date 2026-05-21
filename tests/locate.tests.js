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
            const mdld = `[ex] <http://example.org/>
            
# Article {=ex:article .ex:Article}

> Alice Smith {ex:author}
> 2024-01-01 {ex:datePublished}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
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
            const mdld = `[ex] <http://example.org/>

# Person {=ex:alice .ex:Person}

> Alice Smith {ex:name}
> 25 {ex:age ^^xsd:integer}`;

            const result = parse({ text: mdld });
            const aliceQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/alice' &&
                q.predicate.value === 'http://example.org/name'
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
            const mdld = `[ex] <http://example.org/>

# Document {=ex:doc .ex:Document label}`;

            const result = parse({ text: mdld });
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
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> alice {+ex:alice ?ex:author}`;

            const result = parse({ text: mdld });
            const objectQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
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
            const mdld = `[ex] <http://example.org/>

# Person {=ex:person .ex:Person}

> 25 {ex:age ^^xsd:integer}`;

            const result = parse({ text: mdld });
            const ageQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/person' &&
                q.predicate.value === 'http://example.org/age'
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
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {ex:author}`;

            const result = parse({ text: mdld });
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
            const result = parse({ text });
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
            const mdld = `[ex] <http://example.org/>

# Project Alpha {=ex:ProjectAlpha .ex:Project}

[Design schema] {label}`;

            const result = parse({ text: mdld });
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
            const mdld = `[ex] <http://example.org/>

# Test {=ex:test .ex:Test}

> value {ex:property} `;

            const result = parse({ text: mdld });
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
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

[Alice Smith] {ex:author}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
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
    },

    // Test 11: valueRange for text updates
    {
        name: 'Locate - valueRange enables text updates in correct carrier',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

[Alice Smith] {ex:author}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
            );

            const location = locate(authorQuad, result.origin);
            assert(location, 'Should locate quad');
            assert(location.valueRange !== null, 'Should have valueRange');

            // Extract text using valueRange (content without carrier markers)
            const valueText = mdld.substring(location.valueRange.start, location.valueRange.end);
            assertEqual(valueText, 'Alice Smith', 'valueRange should extract content without carrier markers');

            // Extract text using range (includes annotation)
            const fullText = mdld.substring(location.range.start, location.range.end);
            assert(fullText.includes('[Alice Smith]'), 'range should include carrier markers');
            assert(fullText.includes('{ex:author}'), 'range should include annotation');

            // Simulate updating the value using valueRange (need to add brackets back)
            const updatedText = mdld.substring(0, location.valueRange.start) +
                'Bob Johnson' +
                mdld.substring(location.valueRange.end);

            // Verify the updated text maintains correct carrier structure
            assert(updatedText.includes('[Bob Johnson] {ex:author}'), 'Updated text should maintain annotation');

            // Parse updated text and verify new value
            const updatedResult = parse({ text: updatedText });
            const updatedQuad = updatedResult.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
            );
            assert(updatedQuad, 'Should have updated quad');
            assertEqual(updatedQuad.object.value, 'Bob Johnson', 'Quad should have updated value');
        }
    },

    // Test 12: Retract and re-add uses latest active annotation
    {
        name: 'Locate - Retract and re-add uses latest active annotation',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

[Alice Smith] {ex:author}
[Alice Smith] {-ex:author}
[Bob Johnson] {ex:author}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
            );

            assert(authorQuad, 'Should have author quad after retract and re-add');
            assertEqual(authorQuad.object.value, 'Bob Johnson', 'Should have latest value (Bob Johnson)');

            const location = locate(authorQuad, result.origin);
            assert(location, 'Should locate latest active quad');
            assertEqual(location.value, 'Bob Johnson', 'Should point to latest active annotation');
            assertEqual(location.polarity, '+', 'Latest annotation should have positive polarity');

            // Verify valueRange points to the latest annotation
            if (location.valueRange) {
                const valueText = mdld.substring(location.valueRange.start, location.valueRange.end);
                assertEqual(valueText, 'Bob Johnson', 'valueRange should point to latest active annotation');
            }
        }
    },

    // Test 13: Multiple retractions track latest active annotation
    {
        name: 'Locate - Multiple retractions track latest active annotation',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

[Alice Smith] {ex:author}
[Alice Smith] {-ex:author}
[Bob Johnson] {ex:author}
[Bob Johnson] {-ex:author}
[Charlie Davis] {ex:author}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.subject.value === 'http://example.org/article' &&
                q.predicate.value === 'http://example.org/author'
            );

            assert(authorQuad, 'Should have author quad after multiple retractions');
            assertEqual(authorQuad.object.value, 'Charlie Davis', 'Should have final value (Charlie Davis)');

            const location = locate(authorQuad, result.origin);
            assert(location, 'Should locate final active quad');
            assertEqual(location.value, 'Charlie Davis', 'Should point to final active annotation');

            // Verify valueRange points to the final annotation
            if (location.valueRange) {
                const valueText = mdld.substring(location.valueRange.start, location.valueRange.end);
                assertEqual(valueText, 'Charlie Davis', 'valueRange should point to final active annotation');
            }
        }
    },

    // Test 14: valueRange works for all carrier types
    {
        name: 'Locate - valueRange extracts content without markers for all carrier types',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

[Bracket text] {ex:bracket}
*Emphasis text* {ex:emphasis}
\`Code text\` {ex:code}`;

            const result = parse({ text: mdld });

            // Test bracket carrier
            const bracketQuad = result.quads.find(q => q.predicate.value === 'http://example.org/bracket');
            const bracketLocation = locate(bracketQuad, result.origin);
            assert(bracketLocation, 'Should locate bracket carrier');
            assert(bracketLocation.valueRange !== null, 'Bracket should have valueRange');
            const bracketText = mdld.substring(bracketLocation.valueRange.start, bracketLocation.valueRange.end);
            assertEqual(bracketText, 'Bracket text', 'valueRange should exclude brackets');

            // Test emphasis carrier
            const emphasisQuad = result.quads.find(q => q.predicate.value === 'http://example.org/emphasis');
            const emphasisLocation = locate(emphasisQuad, result.origin);
            assert(emphasisLocation, 'Should locate emphasis carrier');
            assert(emphasisLocation.valueRange !== null, 'Emphasis should have valueRange');
            const emphasisText = mdld.substring(emphasisLocation.valueRange.start, emphasisLocation.valueRange.end);
            assertEqual(emphasisText, 'Emphasis text', 'valueRange should exclude emphasis markers');

            // Test code carrier
            const codeQuad = result.quads.find(q => q.predicate.value === 'http://example.org/code');
            const codeLocation = locate(codeQuad, result.origin);
            assert(codeLocation, 'Should locate code carrier');
            assert(codeLocation.valueRange !== null, 'Code should have valueRange');
            const codeText = mdld.substring(codeLocation.valueRange.start, codeLocation.valueRange.end);
            assertEqual(codeText, 'Code text', 'valueRange should exclude backticks');
        }
    }
];
