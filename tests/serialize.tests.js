import { parse, serialize } from '../src/index.js';

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
Amount: [99.95 USD] {schema:price ^^xsd:decimal}
Status: [Pending] {schema:status ^^ex:orderStatus}
Date: [2024-01-15] {schema:orderDate ^^xsd:date}
Items: {?schema:containsItem .Product}
- Widget A {=ex:widget-a .Product label}
- Widget B {=ex:widget-b .Product label}`;

            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            const newQuads = [
                {
                    subject: { termType: 'NamedNode', value: 'http://ex.org/order-123' },
                    predicate: { termType: 'NamedNode', value: 'http://schema.org/discountCode' },
                    object: { termType: 'Literal', value: 'SAVE20', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
                },
                {
                    subject: { termType: 'NamedNode', value: 'http://ex.org/order-123' },
                    predicate: { termType: 'NamedNode', value: 'http://schema.org/priority' },
                    object: { termType: 'Literal', value: 'HIGH', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
                }
            ];

            const { text } = serialize({
                text: original,
                diff: { add: newQuads },
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text.includes('discountCode'), 'Should add discount code');
            assert(text.includes('priority'), 'Should add priority');
            assert(text.includes('SAVE20'), 'Should include new discount value');
            assert(text.includes('HIGH'), 'Should include new priority value');
        }
    },

    {
        name: 'Serialize - Delete quads and update existing',
        fn: () => {
            const original = `# Product {=ex:product-789}
            
Name: [Premium Widget] {label}
Price: [149.99] {schema:price ^^xsd:decimal}
Category: [Electronics] {schema:category}
Rating: [4.5] {schema:rating ^^xsd:float}`;

            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            // Simulate price update and category removal
            const changes = {
                add: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/product-789' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/price' },
                        object: { termType: 'Literal', value: '129.99', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#decimal' } }
                    }
                ],
                delete: [
                    {
                        subject: { termType: 'NamedNode', value: 'http://ex.org/product-789' },
                        predicate: { termType: 'NamedNode', value: 'http://schema.org/category' },
                        object: { termType: 'Literal', value: 'Electronics' }
                    }
                ]
            };

            const { text } = serialize({
                text: original,
                diff: changes,
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text.includes('129.99'), 'Should update price');
            assert(!text.includes('{category'), 'Should remove category semantics');
            assert(text.includes('Premium Widget'), 'Should preserve original name');
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

            const { text } = serialize({
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

            const { text } = serialize({
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

            const { text } = serialize({
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
            const { text } = serialize({
                text: original,
                diff: {},
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text === original, 'Complex document should round-trip exactly');
        }
    }
];
