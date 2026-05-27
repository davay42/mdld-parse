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
            assert(location.valueRange === null || typeof location.valueRange === 'object', 'Should have valueRange object or null');

            // Check removed fields
            assert(location.entryIndex === undefined, 'Should not have entryIndex');
            assert(location.kind === undefined, 'Should not have kind');
            assert(location.isVacant === undefined, 'Should not have isVacant');
            assert(location.attrsRange === undefined, 'Should not have attrsRange');
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
    },

    // Test 8: Spans Map exists on origin
    {
        name: 'Origin Spans - spans Map present',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}`;

            const result = parse({ text: mdld });

            assert(result.origin.spans instanceof Map, 'origin.spans should be a Map');
        }
    },

    // Test 9: Spans are created between consecutive blocks
    {
        name: 'Origin Spans - spans created between blocks',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}`;

            const result = parse({ text: mdld });
            const { blocks, spans } = result.origin;

            assert(spans.size > 0, 'Should have at least one span between blocks');

            for (const span of spans.values()) {
                assert(typeof span.id === 'string', 'Span should have string id');
                assert(Array.isArray(span.range), 'Span should have range array');
                assert(span.range[0] < span.range[1], 'Span range start should be before end');
                assert(typeof span.byteLength === 'number', 'Span should have byteLength');
                assert(span.byteLength === span.range[1] - span.range[0], 'byteLength should equal range difference');
                assert(span.prevBlockId === null || blocks.has(span.prevBlockId), 'prevBlockId should reference existing block or null');
                assert(span.nextBlockId === null || blocks.has(span.nextBlockId), 'nextBlockId should reference existing block or null');
            }
        }
    },

    // Test 10: Block↔span bidirectional links are consistent
    {
        name: 'Origin Spans - block and span links are consistent',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}

> Bob Jones {author}`;

            const result = parse({ text: mdld });
            const { blocks, spans } = result.origin;

            for (const span of spans.values()) {
                // nextBlockId's prevSpanId should point back to this span
                if (span.nextBlockId) {
                    const nextBlock = blocks.get(span.nextBlockId);
                    assert(nextBlock, 'nextBlockId should resolve to a block');
                    assertEqual(nextBlock.prevSpanId, span.id, 'nextBlock.prevSpanId should point to this span');
                }
                // prevBlockId's nextSpanId should point to this span
                if (span.prevBlockId) {
                    const prevBlock = blocks.get(span.prevBlockId);
                    assert(prevBlock, 'prevBlockId should resolve to a block');
                    assertEqual(prevBlock.nextSpanId, span.id, 'prevBlock.nextSpanId should point to this span');
                }
            }
        }
    },

    // Test 11: Span text is recoverable from source via range
    {
        name: 'Origin Spans - span text recoverable from range',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .ex:Article}

> Alice Smith {author}`;

            const result = parse({ text: mdld });
            const { spans } = result.origin;

            for (const span of spans.values()) {
                const recovered = mdld.slice(span.range[0], span.range[1]);
                assert(typeof recovered === 'string', 'Should recover string from range');
                assert(recovered.length === span.byteLength, 'Recovered text length should match byteLength');
            }
        }
    },

    // Test 12: Span chain is ordered (prevSpanId/nextSpanId links form valid sequence)
    {
        name: 'Origin Spans - span chain is sequentially ordered',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Section One {=ex:s1 .ex:Section}

> First blockquote {label}

# Section Two {=ex:s2 .ex:Section}

> Second blockquote {label}`;

            const result = parse({ text: mdld });
            const { spans } = result.origin;

            // Walk chain: find first span (prevSpanId === null), walk forward
            let head = null;
            for (const span of spans.values()) {
                if (span.prevSpanId === null) { head = span; break; }
            }

            if (head && spans.size > 1) {
                let current = head;
                let steps = 0;
                while (current.nextSpanId) {
                    const next = spans.get(current.nextSpanId);
                    assert(next, 'nextSpanId should resolve to an existing span');
                    assert(next.range[0] >= current.range[1], 'Spans should not overlap');
                    current = next;
                    steps++;
                    assert(steps < 100, 'Span chain should not be circular');
                }
            }
        }
    },

    // Test 13: Mini-autocomplete using span chain (text ending with {= or {+)
    {
        name: 'Origin Spans - mini-autocomplete for incomplete annotations',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Document {=ex:doc .Article}

[Alice] {+ex:alice ?ex:author .Person label}
[Bob] {+ex:bob ?ex:author .Person label}
[Charlie] {+ex:charlie ?ex:author .Person label}`;

            const result = parse({ text: mdld });
            const { blocks, spans } = result.origin;

            // Simulate autocomplete: find similar patterns in the document
            // Given text ending with "{+", suggest completing with similar object patterns
            function suggestCompletion(origin, sourceText, prefix) {
                const suggestions = [];
                for (const block of blocks.values()) {
                    // Look at carriers within blocks (inline carriers like [Alice])
                    for (const carrier of block.carriers || []) {
                        // For {+} syntax, object is in carrier.sem.object (string)
                        if (carrier.sem && carrier.sem.object && carrier.sem.object.startsWith(prefix)) {
                            suggestions.push(carrier.sem.object);
                        }
                    }
                }
                return suggestions;
            }

            const suggestions = suggestCompletion(result.origin, mdld, 'ex:');
            assert(suggestions.length > 0, 'Should find objects with given prefix');
            assert(suggestions.includes('ex:alice'), 'Should include ex:alice');
            assert(suggestions.includes('ex:bob'), 'Should include ex:bob');
        }
    },

    // Test 14: Annotation proposal based on span similarity
    {
        name: 'Origin Spans - annotation proposal from similar text',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# People

[Alice] {=ex:alice  .Person label}
[Bob] {=ex:bob  .Person label}

# More People

[Carol] {=ex:carol .Person label}
[David] {=ex:david .Person label}`;

            const result = parse({ text: mdld });
            const { blocks, spans } = result.origin;

            // Given plain text "Alice", find similar patterns and propose annotation
            function proposeAnnotation(origin, sourceText, plainText) {
                const proposals = [];
                for (const block of blocks.values()) {
                    // Look at carriers within blocks
                    for (const carrier of block.carriers || []) {
                        if (carrier.text === plainText) {
                            proposals.push({
                                subject: carrier.subject,
                                types: carrier.sem?.types || [],
                                predicates: carrier.predicates
                            });
                        }
                    }
                }
                return proposals;
            }

            // "Alice" appears with annotation, so we can propose it
            const proposals = proposeAnnotation(result.origin, mdld, 'Alice');
            assert(proposals.length > 0, 'Should find annotation proposals for Alice');
            assertEqual(proposals[0].subject, 'ex:alice', 'Should propose ex:alice subject');
        }
    },

    // Test 15: Span-based context recovery for autocomplete
    {
        name: 'Origin Spans - context recovery for autocomplete',
        fn: () => {
            const mdld = `[ex] <http://example.org/>

# Article {=ex:article .Article}

The author is [Alice] {+ex:alice ?ex:author .Person label}.
The editor is [Bob] {+ex:bob ?ex:editor .Person label}.`;

            const result = parse({ text: mdld });
            const { blocks, spans } = result.origin;

            // Function to recover context around a block using span chain
            function recoverContext(origin, sourceText, blockId, spanCount = 1) {
                const block = origin.blocks.get(blockId);
                if (!block) return null;

                let start = block.range[0];
                let end = block.range[1];

                // Walk backward through spans
                let span = block.prevSpanId ? origin.spans.get(block.prevSpanId) : null;
                for (let i = 0; i < spanCount && span; i++) {
                    start = span.range[0];
                    span = span.prevSpanId ? origin.spans.get(span.prevSpanId) : null;
                }

                // Walk forward through spans
                span = block.nextSpanId ? origin.spans.get(block.nextSpanId) : null;
                for (let i = 0; i < spanCount && span; i++) {
                    end = span.range[1];
                    span = span.nextSpanId ? origin.spans.get(span.nextSpanId) : null;
                }

                return sourceText.slice(start, end);
            }

            // Find the paragraph block containing Alice carrier
            const aliceBlock = Array.from(blocks.values()).find(b =>
                b.carriers && b.carriers.some(c => c.text === 'Alice')
            );
            assert(aliceBlock, 'Should find block containing Alice carrier');

            const context = recoverContext(result.origin, mdld, aliceBlock.id, 1);
            assert(context, 'Should recover context');
            assert(context.includes('The author is'), 'Context should include preceding text');
            assert(context.includes('Alice'), 'Context should include the carrier text');
        }
    }
];
