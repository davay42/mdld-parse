import { parse } from '../src/index.js';

// Test helpers
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

export const comprehensiveOriginTests = [
    {
        name: '§13.1 Comprehensive Origin Test - All Annotation Types',
        fn: () => {
            const md = `
[ex] <http://example.org/>

# Document {=ex:Document .ex:DocumentType label "Test Document"}

## Section {=ex:Section .ex:SectionType rdfs:comment "A section"}

### Properties {=ex:Properties}
- Name: "Example Name" {ex:name}
- Value: 42 {ex:value ^^xsd:integer}
- Reference: [Target] {ex:ref ?ex:target}
- Status: "Active" {ex:status}

## Status List {=ex:StatusList .ex:ListType}
Status values: {?sh:in .ex:StatusType ex:category label}
1. Active {=ex:Active}
2. Inactive {=ex:Inactive}
3. Pending {=ex:Pending}

## Mixed List
- Item with type {=ex:ListItem .ex:ItemType}
- Item with property {ex:hasProperty "test"}
- Item with both {=ex:BothType ex:property "value"}
`;

            const result = parse(md);

            console.log('\n=== Comprehensive Origin Analysis ===');
            console.log(`Total quads: ${result.quads.length}`);
            console.log(`Origin entries: ${result.origin.quadIndex.size}`);

            // Test categories
            const categories = {
                'Heading Annotations': [],
                'List Item Annotations': [],
                'List Anchor Annotations': [],
                'Ordered List RDF': [],
                'Inline Carriers': [],
                'Context Connections': []
            };

            // Categorize quads
            result.quads.forEach((quad, i) => {
                const quadKey = JSON.stringify([quad.subject.value, quad.predicate.value,
                quad.object.termType === 'Literal' ?
                    JSON.stringify({ t: 'Literal', v: quad.object.value, lang: quad.object.language || '', dt: quad.object.datatype?.value || '' }) :
                    JSON.stringify({ t: quad.object.termType, v: quad.object.value })]);

                const origin = result.origin.quadIndex.get(quadKey);

                const info = {
                    index: i + 1,
                    subject: quad.subject.value.split('/').pop() || quad.subject.value,
                    predicate: quad.predicate.value.split('#').pop() || quad.predicate.value,
                    object: quad.object.value,
                    hasOrigin: !!origin,
                    range: origin?.range,
                    type: origin?.type,
                    entryIndex: origin?.entryIndex
                };

                // Categorize
                if (quad.subject.value.includes('Document') || quad.subject.value.includes('Section') || quad.subject.value.includes('Properties')) {
                    categories['Heading Annotations'].push(info);
                } else if (quad.subject.value.includes('Active') || quad.subject.value.includes('Inactive') || quad.subject.value.includes('Pending')) {
                    categories['List Anchor Annotations'].push(info);
                } else if (quad.subject.value.includes('list-')) {
                    categories['Ordered List RDF'].push(info);
                } else if (quad.subject.value.includes('ListItem') || quad.subject.value.includes('Both')) {
                    categories['List Item Annotations'].push(info);
                } else if (quad.predicate.value.includes('sh:in')) {
                    categories['Context Connections'].push(info);
                } else {
                    categories['Inline Carriers'].push(info);
                }
            });

            // Analyze each category
            Object.entries(categories).forEach(([category, quads]) => {
                console.log(`\n--- ${category} (${quads.length} quads) ---`);

                const withOrigin = quads.filter(q => q.hasOrigin).length;
                const withoutOrigin = quads.filter(q => !q.hasOrigin);

                console.log(`With origin: ${withOrigin}/${quads.length}`);
                console.log(`Without origin: ${withoutOrigin.length}/${quads.length}`);

                if (withoutOrigin.length > 0) {
                    console.log('Missing origins:');
                    withoutOrigin.forEach(q => {
                        console.log(`  ${q.index}. ${q.subject} -> ${q.predicate} -> ${q.object}`);
                    });
                }

                // Check range consistency for those with origins
                const withValidRanges = quads.filter(q => q.hasOrigin && q.range);
                if (withValidRanges.length > 0) {
                    console.log('Range samples:');
                    withValidRanges.slice(0, 3).forEach(q => {
                        const [start, end] = q.range;
                        const extracted = md.substring(start, end);
                        console.log(`  ${q.subject} -> ${q.predicate}: [${start}, ${end}] -> "${extracted}"`);
                    });
                }
            });

            // Assertions for critical categories
            assert(categories['Heading Annotations'].filter(q => q.hasOrigin).length >= 4,
                'Heading annotations should have origin tracking');
            assert(categories['List Anchor Annotations'].filter(q => q.hasOrigin).length >= 6,
                'List anchor annotations should have origin tracking');
            assert(categories['Ordered List RDF'].filter(q => q.hasOrigin).length >= 9,
                'Ordered list RDF structure should have origin tracking');

            // Context connections might be in other categories, so check overall
            const totalContextConnections = result.quads.filter(q => q.predicate.value.includes('sh:in')).length;
            const contextConnectionsWithOrigin = result.quads.filter(q =>
                q.predicate.value.includes('sh:in') && (() => {
                    const quadKey = JSON.stringify([q.subject.value, q.predicate.value,
                    q.object.termType === 'Literal' ?
                        JSON.stringify({ t: 'Literal', v: q.object.value, lang: q.object.language || '', dt: q.object.datatype?.value || '' }) :
                        JSON.stringify({ t: q.object.termType, v: q.object.value })]);
                    return result.origin.quadIndex.has(quadKey);
                })()
            ).length;

            if (totalContextConnections > 0) {
                assert(contextConnectionsWithOrigin >= totalContextConnections * 0.8,
                    'Most context connections should have origin tracking');
            }

            // Check that all list anchor annotations have proper ranges
            const listAnchorWithRanges = categories['List Anchor Annotations'].filter(q => q.hasOrigin && q.range);
            assert(listAnchorWithRanges.length >= 6, 'List anchor annotations should have ranges');

            // Verify range accuracy for list anchors
            listAnchorWithRanges.forEach(q => {
                const [start, end] = q.range;
                const extracted = md.substring(start, end);
                assert(start >= 0 && end <= md.length && start < end,
                    `Invalid range for ${q.subject} -> ${q.predicate}: [${start}, ${end}]`);

                // Check if range makes sense for the type
                if (q.predicate === 'type') {
                    assert(extracted.includes('.ex:'),
                        `Type annotation range should contain IRI reference: got "${extracted}"`);
                } else if (q.predicate === 'label') {
                    assert(extracted === 'label' || extracted.includes('label'),
                        `Label annotation range should target 'label': got "${extracted}"`);
                }
            });

            console.log('\n✅ Comprehensive origin test completed successfully!');
        }
    },

    {
        name: '§13.2 Origin Range Precision Test',
        fn: () => {
            const md = `[ex] <http://example.org/>
## Test {=ex:Test .ex:Type label}
Name: "Value" {ex:name}`;

            const result = parse(md);

            console.log('\n=== Origin Range Precision Test ===');

            // Find specific quads and verify their ranges
            const testQuads = result.quads.filter(q => q.subject.value === 'http://example.org/Test');

            testQuads.forEach(quad => {
                const quadKey = JSON.stringify([quad.subject.value, quad.predicate.value,
                quad.object.termType === 'Literal' ?
                    JSON.stringify({ t: 'Literal', v: quad.object.value, lang: quad.object.language || '', dt: quad.object.datatype?.value || '' }) :
                    JSON.stringify({ t: quad.object.termType, v: quad.object.value })]);

                const origin = result.origin.quadIndex.get(quadKey);

                if (origin && origin.range) {
                    const [start, end] = origin.range;
                    const extracted = md.substring(start, end);
                    const predicate = quad.predicate.value.split('#').pop();

                    console.log(`${predicate} -> ${quad.object.value}:`);
                    console.log(`  Range: [${start}, ${end}]`);
                    console.log(`  Extracted: "${extracted}"`);

                    // Verify precision
                    if (quad.object.termType === 'NamedNode') {
                        // For IRIs, should target the annotation part
                        assert(extracted.includes('.ex:'), `IRI range should contain reference: ${extracted}`);
                    } else if (quad.object.termType === 'Literal') {
                        // For literals, should exactly match or contain the value
                        assert(extracted.includes(quad.object.value), `Literal range should contain value: ${extracted}`);
                    }
                }
            });

            console.log('✅ Origin range precision test passed!');
        }
    }
];
