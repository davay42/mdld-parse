import { parse, serialize } from './index.js';

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

// Test suite
const tests = [
    // §6 Subject Declaration
    {
        name: 'Subject declaration sets context',
        fn: () => {
            const md = `# Title {=ex:doc}

[value] {name}`;
            const { quads, context } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'value'),
                'Subject should be ex:doc');
        }
    },

    {
        name: 'Subject reset with {=}',
        fn: () => {
            const md = `# First {=ex:first}

[value1] {name}

# Reset {=}

[value2] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, `Should only emit 1 quad, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/first', 'http://schema.org/name', 'value1'),
                'Only first value should emit');
        }
    },

    // §7 Type Declaration
    {
        name: 'Type declaration emits rdf:type',
        fn: () => {
            const md = `# Doc {=ex:doc .Article}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Article'),
                'Should emit type triple');
        }
    },

    {
        name: 'Multiple types on same subject',
        fn: () => {
            const md = `# Doc {=ex:doc .Article .CreativeWork}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 2, `Should emit 2 type triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Article'),
                'Should have Article type');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/CreativeWork'),
                'Should have CreativeWork type');
        }
    },

    // §8.1 Predicate Forms - Literal Properties (p)
    {
        name: 'Literal property: S → L (form p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Alice');
            assert(q, 'Should find name triple');
            assert(q.object.termType === 'Literal', 'Object should be Literal');
            assert(q.object.value === 'Alice', `Value should be "Alice", got "${q.object.value}"`);
        }
    },

    {
        name: 'Multiple literal properties',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice] {name author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Alice'), 'Should have name');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/author', 'Alice'), 'Should have author');
        }
    },

    // §8.1 Predicate Forms - Object Properties (?p)
    {
        name: 'Object property: S → O (form ?p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice](ex:alice) {?author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/author', 'http://ex.org/alice');
            assert(q, 'Should find author triple');
            assert(q.object.termType === 'NamedNode', 'Object should be NamedNode');
            assert(q.object.value === 'http://ex.org/alice', 'Object should be ex:alice');
        }
    },

    {
        name: 'Object property with resource declaration',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice](=ex:alice) {?author .Person}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/author', 'http://ex.org/alice'),
                'Should link to alice');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
                'Alice should be Person');
        }
    },

    {
        name: 'Object property without O emits nothing',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice] {?author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 0, `Should emit 0 triples when O missing, got ${quads.length}`);
        }
    },

    // §8.1 Predicate Forms - Reverse Properties (^p, ^?p)
    {
        name: 'Reverse object property: O → S (form ^?p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Parent](ex:parent) {^?hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/parent', 'http://schema.org/hasPart', 'http://ex.org/doc');
            assert(q, 'Should find reverse triple');
            assert(q.subject.value === 'http://ex.org/parent', 'Subject should be parent');
            assert(q.object.value === 'http://ex.org/doc', 'Object should be doc');
        }
    },

    // §9 Literals with Datatypes and Languages
    {
        name: 'Datatype annotation (^^xsd:integer)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[42] {count ^^xsd:integer}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/count', '42');
            assert(q, 'Should find count triple');
            assert(q.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#integer',
                `Datatype should be xsd:integer, got ${q.object.datatype.value}`);
        }
    },

    {
        name: 'Language tag (@en)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Hello] {greeting @en}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/greeting', 'Hello');
            assert(q, 'Should find greeting triple');
            assert(q.object.language === 'en', `Language should be "en", got "${q.object.language}"`);
        }
    },

    {
        name: 'Multiple datatypes (^^xsd:date, ^^xsd:decimal)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[2024-01-01] {date ^^xsd:date}
[19.99] {price ^^xsd:decimal}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const dateQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/date', '2024-01-01');
            const priceQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/price', '19.99');

            assert(dateQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#date', 'Should be xsd:date');
            assert(priceQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#decimal', 'Should be xsd:decimal');
        }
    },

    // §11 Lists
    {
        name: 'List with context - all items get relationship',
        fn: () => {
            const md = `# Recipe {=ex:recipe}

Ingredients: {?ingredient}

- [Flour](=ex:flour) {name}
- [Water](=ex:water) {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/recipe', 'http://schema.org/ingredient', 'http://ex.org/flour'),
                'Recipe should have flour');
            assert(hasQuad(quads, 'http://ex.org/recipe', 'http://schema.org/ingredient', 'http://ex.org/water'),
                'Recipe should have water');
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://schema.org/name', 'Flour'),
                'Flour should have name');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://schema.org/name', 'Water'),
                'Water should have name');
        }
    },

    {
        name: 'List with types in context',
        fn: () => {
            const md = `# Recipe {=ex:recipe}

Ingredients: {?ingredient .Ingredient}

- [Flour](=ex:flour) {name}
- [Water](=ex:water) {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/flour', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Flour should be Ingredient');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Water should be Ingredient');
        }
    },

    {
        name: 'List items without subject emit nothing',
        fn: () => {
            const md = `# Recipe {=ex:recipe}

Ingredients: {?ingredient}

- Flour
- Water`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 0, `Should emit 0 triples without item subjects, got ${quads.length}`);
        }
    },

    {
        name: 'Reverse list relationship (^?p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

Part of: {^?hasPart}

- [Book](=ex:book) {}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/book', 'http://schema.org/hasPart', 'http://ex.org/doc'),
                'Book should have doc as part');
        }
    },

    // §13 Code Blocks
    {
        name: 'Code block as value carrier',
        fn: () => {
            const md = `# Doc {=ex:doc}

\`\`\`javascript {=ex:code .SoftwareSourceCode text}
console.log("hi");
\`\`\``;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/code', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/SoftwareSourceCode'),
                'Should be SoftwareSourceCode');
            assert(hasQuad(quads, 'http://ex.org/code', 'http://schema.org/text', 'console.log("hi");'),
                'Should have code text');
        }
    },

    // Blockquotes
    {
        name: 'Blockquote as value carrier',
        fn: () => {
            const md = `# Doc {=ex:doc}

> This is a quote. {description}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/description', 'This is a quote.'),
                'Should extract blockquote text');
        }
    },

    // Prefix Declarations
    {
        name: 'Prefix declarations',
        fn: () => {
            const md = `[ex] {: http://example.org/}

# Doc {=ex:doc}

[value] {ex:property}`;
            const { quads } = parse(md);

            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/property', 'value'),
                'Should use declared prefix');
        }
    },

    // Multiple inline carriers
    {
        name: 'Multiple inline carriers in paragraph',
        fn: () => {
            const md = `# Doc {=ex:doc}

Author is [Alice] {name} and [Bob] {contributor}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Alice'), 'Should have Alice');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/contributor', 'Bob'), 'Should have Bob');
        }
    },

    // Edge cases
    {
        name: 'Empty annotation emits nothing',
        fn: () => {
            const md = `# Doc {=ex:doc}

[value] {}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 0, `Empty annotation should emit nothing, got ${quads.length}`);
        }
    },

    {
        name: 'Annotation without subject emits nothing',
        fn: () => {
            const md = `[value] {name}`;
            const { quads } = parse(md);

            assert(quads.length === 0, `No subject means no quads, got ${quads.length}`);
        }
    },

    {
        name: 'Plain paragraph without annotation is ignored',
        fn: () => {
            const md = `# Doc {=ex:doc}

This is plain text.

[value] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, 'Only annotated value should emit');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'value'), 'Should have value');
        }
    },

    // Serialization tests
    {
        name: 'Serialize - Add quad',
        fn: () => {
            const original = `# Doc {=ex:doc}

[Alice] {name}`;
            const { origin, context } = parse(original, { context: { ex: 'http://ex.org/' } });

            const newQuad = {
                subject: { termType: 'NamedNode', value: 'http://ex.org/doc' },
                predicate: { termType: 'NamedNode', value: 'http://schema.org/author' },
                object: { termType: 'Literal', value: 'Bob' }
            };

            const { text } = serialize({
                text: original,
                diff: { add: [newQuad] },
                origin,
                options: { context }
            });

            assert(text.includes('[Bob] {author}'), 'Should add new triple');
            assert(text.includes('[Alice] {name}'), 'Should preserve original');
        }
    },

    {
        name: 'Serialize - Delete quad',
        fn: () => {
            const original = `# Doc {=ex:doc}

[Alice] {name}
[Bob] {author}`;
            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            const quadToDelete = result.quads.find(q =>
                q.predicate.value === 'http://schema.org/name'
            );

            const { text } = serialize({
                text: original,
                diff: { delete: [quadToDelete] },
                origin: result.origin,
                options: { context: result.context }
            });

            assert(!text.includes('[Alice] {name}'), 'Should remove deleted triple');
            assert(text.includes('[Bob] {author}'), 'Should preserve other triples');
        }
    },

    {
        name: 'Serialize - Round-trip preservation',
        fn: () => {
            const original = `# Doc {=ex:doc}

[Alice] {name}`;
            const result = parse(original, { context: { ex: 'http://ex.org/' } });

            const { text } = serialize({
                text: original,
                diff: {},
                origin: result.origin,
                options: { context: result.context }
            });

            assert(text === original, 'No-op serialization should preserve text');
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

async function runTests() {
    console.log('# MD-LD v0.2 Specification Test Suite\n');

    const results = [];

    for (const { name, fn } of tests) {
        try {
            fn();
            results.push({ name, status: 'passed' });
            passed++;
            console.log(`✓ ${name}`);
        } catch (error) {
            results.push({ name, status: 'failed', error: error.message });
            failed++;
            console.log(`✗ ${name}`);
            console.log(`  ${error.message}`);
        }
    }

    console.log(`\n${'-'.repeat(60)}`);
    console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total`);

    if (failed > 0) {
        process?.exit(1);
    }

    return results;
}

// Export for use in browser
export { runTests, tests };

// Auto-run in Node.js
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}