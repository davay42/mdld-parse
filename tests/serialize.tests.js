import { parse, applyDiff } from '../src/index.js';

// Test helpers
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function findQuad(quads, s, p, o) {
    return quads.find(q =>
        q.subject.value === s &&
        q.predicate.value === p &&
        (o === null || (q.object.termType === 'Literal' ? q.object.value === o : q.object.value === o))
    );
}

function hasQuad(quads, s, p, o) {
    return !!findQuad(quads, s, p, o);
}

// Serialize test suite
export const serializeTests = [
    // Basic serialization tests
    {
        name: 'Serialize - Add quad',
        fn: () => {
            const md = `# Doc {=ex:doc}

> This is a quote. {schema:description}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/description', 'This is a quote.'),
                'Should extract blockquote text');
        }
    },

    // Complex serialization operations
    {
        name: 'Serialize - Add complex quads with datatypes',
        fn: () => {
            const original = `# Order {=ex:order-123}
            
Customer: [John Doe] {ex:customer-456 .Person label}
Amount: [99.95 USD] {ex:price ^^xsd:decimal}
Status: [Pending] {ex:status ^^ex:orderStatus}
Date: [2024-01-15] {ex:orderDate ^^xsd:date}
Items: {?ex:containsItem .Product}
- Widget A {=ex:widget-a .Product label}
- Widget B {=ex:widget-b .Product label}`;

            const result = parse(original, { context: { ex: 'tag:user@example.com,2026:' } });

            const newQuads = [
                {
                    subject: { termType: 'NamedNode', value: 'tag:user@example.com,2026:order-123' },
                    predicate: { termType: 'NamedNode', value: 'tag:user@example.com,2026:discountCode' },
                    object: { termType: 'Literal', value: 'SAVE20', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
                },
                {
                    subject: { termType: 'NamedNode', value: 'tag:user@example.com,2026:order-123' },
                    predicate: { termType: 'NamedNode', value: 'tag:user@example.com,2026:priority' },
                    object: { termType: 'Literal', value: 'HIGH', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
                }
            ];

            const { text } = applyDiff({
                text: original,
                diff: { add: newQuads },
                origin: result.origin,
                options: { context: result.context }
            });

            // Precise assertions for actual applyDiff behavior
            const lines = text.split('\n').filter(line => line.trim());

            // Check that new properties were added as standalone annotations
            assert(text.includes('tag:user@example.com,2026:discountCode'), 'Should add discountCode predicate');
            assert(text.includes('tag:user@example.com,2026:priority'), 'Should add priority predicate');

            // Verify standalone annotation structure
            const discountLine = lines.find(line => line.includes('SAVE20'));
            assert(discountLine === '[SAVE20] {tag:user@example.com,2026:discountCode}',
                `Discount should be standalone annotation, got: ${discountLine}`);

            const priorityLine = lines.find(line => line.includes('HIGH'));
            assert(priorityLine === '[HIGH] {tag:user@example.com,2026:priority}',
                `Priority should be standalone annotation, got: ${priorityLine}`);

            // Verify other lines remain unchanged
            assert(text.includes('Customer: [John Doe] {ex:customer-456 .Person label}'), 'Customer line should be unchanged');
            assert(text.includes('Amount: [99.95 USD] {ex:price ^^xsd:decimal}'), 'Amount line should be unchanged');
            assert(text.includes('Status: [Pending] {ex:status ^^ex:orderStatus}'), 'Status line should be unchanged');
            assert(text.includes('Date: [2024-01-15] {ex:orderDate ^^xsd:date}'), 'Date line should be unchanged');

            // Verify list structure is preserved
            assert(text.includes('Items: {?ex:containsItem .Product}'), 'Items list should be unchanged');
            assert(text.includes('- Widget A {=ex:widget-a .Product label}'), 'Widget A should be unchanged');
            assert(text.includes('- Widget B {=ex:widget-b .Product label}'), 'Widget B should be unchanged');
        }
    },

    {
        name: 'Serialize - Delete quads and update existing',
        fn: () => {
            const original = `# Product {=ex:product-789}
            
Name: [Premium Widget] {label}
Price: [149.99] {ex:price ^^xsd:decimal}
Category: [Electronics] {ex:category}
Rating: [4.5] {ex:rating ^^xsd:float}`;

            const result = parse(original, { context: { ex: 'tag:user@example.com,2026:' } });

            // Proper literal update: delete old value, add new value for same subject+predicate
            // This should trigger the vacant slot system for in-place update
            const changes = {
                add: [
                    {
                        subject: { termType: 'NamedNode', value: 'tag:user@example.com,2026:product-789' },
                        predicate: { termType: 'NamedNode', value: 'tag:user@example.com,2026:price' },
                        object: { termType: 'Literal', value: '129.99', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#decimal' } }
                    }
                ],
                delete: [
                    {
                        subject: { termType: 'NamedNode', value: 'tag:user@example.com,2026:product-789' },
                        predicate: { termType: 'NamedNode', value: 'tag:user@example.com,2026:price' },
                        object: { termType: 'Literal', value: '149.99', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#decimal' } }
                    }
                ]
            };

            const { text } = applyDiff({
                text: original,
                diff: changes,
                origin: result.origin,
                options: { context: result.context }
            });

            // Precise assertions for literal update behavior (vacant slot system)
            const lines = text.split('\n').filter(line => line.trim());

            // Find the price line and verify it was updated in-place
            const priceLine = lines.find(line => line.includes('Price:'));
            assert(priceLine === 'Price: [129.99] {ex:price ^^xsd:decimal}',
                `Price should be updated in-place via vacant slot system, got: ${priceLine}`);

            // Verify category is preserved (not deleted)
            const categoryLine = lines.find(line => line.includes('Category: [Electronics]'));
            assert(categoryLine === 'Category: [Electronics] {ex:category}',
                `Category should be preserved, got: ${categoryLine}`);

            // Verify other properties are preserved exactly
            const nameLine = lines.find(line => line.includes('Name:'));
            assert(nameLine === 'Name: [Premium Widget] {label}',
                `Name should be preserved exactly, got: ${nameLine}`);

            const ratingLine = lines.find(line => line.includes('Rating:'));
            assert(ratingLine === 'Rating: [4.5] {ex:rating ^^xsd:float}',
                `Rating should be preserved exactly, got: ${ratingLine}`);

            // Verify heading is preserved
            assert(text.includes('# Product {=ex:product-789}'), 'Product heading should be preserved');

            // Verify only one price annotation (in-place update, not duplicate)
            const priceLines = lines.filter(line => line.includes('price') && line.includes('xsd:decimal'));
            assert(priceLines.length === 1, 'Should have exactly one price annotation after in-place update');
        }
    },

    {
        name: 'Serialize - Simple structure updates',
        fn: () => {
            const original = `
            
# Project {=ex:project-alpha}
            
Team: {?hasMember .Person}
- Alice {=ex:alice .Person name}
- Bob {=ex:bob .Person name}

Milestones: {?hasMilestone .Event name}

- Planning Complete {=ex:milestone-1}
- Testing Phase {=ex:milestone-2}`;

            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            // Update milestone status and add new team member
            const changes = {
                add: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/milestone-2' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/status' },
                        object: { termType: 'Literal', value: 'completed', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
                    },
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/project-alpha' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/hasMember' },
                        object: { termType: 'NamedNode', value: 'http://ex.org/carol' }
                    }
                ]
            };

            const { text } = applyDiff({
                text: original,
                diff: changes,
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text.includes('completed'), 'Should update milestone status');
            assert(text.includes('carol'), 'Should add new team member');
            assert(text.includes('Alice'), 'Should preserve existing team');
            assert(text.includes('Planning Complete'), 'Should preserve existing milestones');
        }
    },

    {
        name: 'Serialize - Handle empty carriers and partial updates',
        fn: () => {
            const original = `# Document {=ex:doc-001}

Title: [My Document] {schema:title}
[] {schema:description}
Content: [Sample content] {schema:text}`;

            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            // Update with proper description and add metadata
            const changes = {
                add: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/doc-001' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/description' },
                        object: { termType: 'Literal', value: 'Updated description with proper content', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
                    },
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/doc-001' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/modified' },
                        object: { termType: 'Literal', value: '2024-01-15T10:30:00Z', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#dateTime' } }
                    }
                ],
                delete: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/doc-001' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/description' },
                        object: { termType: 'Literal', value: '' }
                    }
                ]
            };

            const { text } = applyDiff({
                text: original,
                diff: changes,
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text.includes('Updated description'), 'Should add proper description');
            assert(!text.includes('[] {description}'), 'Should update empty carrier value in-place');
            assert(text.includes('modified'), 'Should add metadata');
            assert(text.includes('Sample content'), 'Should preserve existing content');
        }
    },

    {
        name: 'Serialize - Language and datatype preservation',
        fn: () => {
            const original = `# Article {=ex:article-multilang}
            
Title: [Hello World] {schema:title}
Content: [Bonjour le monde] {schema:content @fr}
Summary: [Hello world summary] {schema:summary @en }`;

            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            // Add Spanish version and fix datatype
            const changes = {
                add: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/article-multilang' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/content' },
                        object: { termType: 'Literal', value: 'Hola mundo', language: 'es' }
                    },
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/article-multilang' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/summary' },
                        object: { termType: 'Literal', value: 'Hello world summary', language: 'en' }
                    }
                ],
                delete: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/article-multilang' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/summary' },
                        object: { termType: 'Literal', value: 'Hello world summary' }
                    }
                ]
            };

            const { text } = applyDiff({
                text: original,
                diff: changes,
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text.includes('Hola mundo'), 'Should add Spanish content');
            assert(text.includes('Bonjour le monde'), 'Should preserve French language tag');
            assert(text.includes('Hello world summary'), 'Should preserve English language tag');
            assert(!text.includes('^^xsd:string'), 'Should remove conflicting datatype');
        }
    },

    // Round-trip tests
    {
        name: 'Complex document round-trip',
        fn: () => {
            const original = `[@vocab] <http://schema.org/>
[ex] <http://example.org/>

## Complex Document {=ex:doc .Article}

Metadata: {dateModified ^^xsd:date}
- 2024-01-15 {dateModified}

Authors: {author .Person}
- Alice {=ex:alice name}
- Bob {=ex:bob name}

Content: {?hasPart}
- Section 1 {=ex:section1 .Section name}
- Section 2 {=ex:section2 .Section name}

References: {!ex:citedBy}
- Other Doc {=ex:other-doc .Article name}`;

            const result = parse(original);
            const { text } = applyDiff({
                text: original,
                diff: {},
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text === original, 'Complex document should round-trip exactly');
        }
    }
];
