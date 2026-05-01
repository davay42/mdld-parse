import { parse, locate } from '../src/index.js';

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

export const originLeanTests = [
    // Test 1: Origin contains only quadIndex
    {
        name: 'Origin Lean - Only quadIndex present',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}
> 2024-01-01 {datePublished}`;

            const result = parse({ text: mdld });

            assert(result.origin, 'Origin should exist');
            assert(result.origin.quadIndex instanceof Map, 'Origin should have quadIndex Map');
            assert(!result.origin.quadMap, 'Origin should not have quadMap');
            assert(!result.origin.entries, 'Origin should not have entries array');
        }
    },

    // Test 2: OriginEntry structure matches spec
    {
        name: 'Origin Lean - OriginEntry structure',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Person {=ex:alice .ex:Person}

> Alice Smith {name}`;

            const result = parse({ text: mdld });
            const nameQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#name'
            );

            const location = locate(nameQuad, result.origin);

            assert(location, 'Should locate name quad');
            assertEqual(location.predicate, 'http://www.w3.org/2000/01/rdf-schema#name', 'Should include predicate IRI');

            // Check required fields according to spec
            assert(typeof location.blockId === 'string', 'Should have blockId string');
            assert(typeof location.range === 'object', 'Should have range object');
            assert(typeof location.range.start === 'number', 'Range should have start number');
            assert(typeof location.range.end === 'number', 'Range should have end number');
            assert(typeof location.carrierType === 'string', 'Should have carrierType string');
            assert(typeof location.subject === 'string', 'Should have subject string');
            assert(typeof location.predicate === 'string', 'Should have predicate string');
            assert(typeof location.polarity === 'string', 'Should have polarity string');
            assertEqual(location.polarity, '+', 'Default polarity should be +');

            // Check optional fields
            assert(typeof location.context === 'object', 'Should have context object');
            assert(typeof location.value === 'string', 'Should have value string');

            // Check removed fields
            assert(location.entryIndex === undefined, 'Should not have entryIndex');
            assert(location.kind === undefined, 'Should not have kind');
            assert(location.isVacant === undefined, 'Should not have isVacant');
            assert(location.attrsRange === undefined, 'Should not have attrsRange');
            assert(location.valueRange === undefined, 'Should not have valueRange');
            assert(location.slotId === undefined, 'Should not have slotId');
            assert(location.lastValue === undefined, 'Should not have lastValue');
            assert(location.vacantSince === undefined, 'Should not have vacantSince');
        }
    },

    // Test 3: Multiple quads share same blockId
    {
        name: 'Origin Lean - Multiple quads same block',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article .ex:PublishedContent}

[Alice Smith] {author datePublished}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );
            const dateQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#datePublished'
            );

            const authorLocation = locate(authorQuad, result.origin);
            const dateLocation = locate(dateQuad, result.origin);

            assertEqual(authorLocation.blockId, dateLocation.blockId, 'Quads in same block should share blockId');
            assertEqual(authorLocation.carrierType, 'span', 'Should have correct carrierType');
            assertEqual(dateLocation.carrierType, 'span', 'Should have correct carrierType');
        }
    },

    // Test 4: Different carrier types
    {
        name: 'Origin Lean - Different carrier types',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Document {=ex:doc .ex:Document}

[Design spec] {label}
> alice {+ex:alice ?author}`;

            const result = parse({ text: mdld });
            const typeQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            );
            const labelQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label'
            );
            const authorQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );

            const typeLocation = locate(typeQuad, result.origin);
            const labelLocation = locate(labelQuad, result.origin);
            const authorLocation = locate(authorQuad, result.origin);

            assertEqual(typeLocation.carrierType, 'heading', 'Type should be in heading');
            assertEqual(labelLocation.carrierType, 'span', 'Label should be in span');
            assertEqual(authorLocation.carrierType, 'blockquote', 'Author should be in blockquote');
        }
    },

    // Test 5: Range precision
    {
        name: 'Origin Lean - Range precision',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );

            const location = locate(authorQuad, result.origin);

            assert(location.range.start >= 0, 'Range start should be non-negative');
            assert(location.range.end <= mdld.length, 'Range end should be within text');
            assert(location.range.start < location.range.end, 'Range start should be before end');

            // Check that range actually contains the expected text
            const extracted = mdld.substring(location.range.start, location.range.end);
            assert(extracted.includes('Alice Smith'), 'Range should contain expected text');
        }
    },

    // Test 6: Context inheritance
    {
        name: 'Origin Lean - Context inheritance',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}`;

            const result = parse({ text: mdld });
            const authorQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#author'
            );

            const location = locate(authorQuad, result.origin);

            assert(location.context, 'Should have context');
            assertEqual(location.context.ex, 'http://example.org/', 'Should inherit prefix context');
        }
    },

    // Test 7: Value field contains carrier text
    {
        name: 'Origin Lean - Value field content',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Person {=ex:person .ex:Person}

> Alice Smith {name}
> 25 {age ^^xsd:integer}
> alice {+ex:alice ?knows}`;

            const result = parse({ text: mdld });
            const nameQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#name'
            );
            const ageQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#age'
            );
            const knowsQuad = result.quads.find(q =>
                q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#knows'
            );

            const nameLocation = locate(nameQuad, result.origin);
            const ageLocation = locate(ageQuad, result.origin);
            const knowsLocation = locate(knowsQuad, result.origin);

            assertEqual(nameLocation.value, 'Alice Smith', 'Value should match literal text');
            assertEqual(ageLocation.value, '25', 'Value should match datatype literal text');
            assertEqual(knowsLocation.value, 'alice', 'Value should match object reference text');
        }
    }
];
