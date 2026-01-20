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

[Alice] {=ex:alice ?author .Person}`;
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

    // §8.1 Predicate Forms - Reverse Properties (!p)
    {
        name: 'Reverse object property: O → S (form !p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Parent] {=ex:parent !hasPart}`;
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
- Flour {=ex:flour name} 
- Water {=ex:water name}\t`;
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

- Flour {=ex:flour name}
- Water {=ex:water name}`;
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
        name: 'Reverse list relationship (!p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

Part of: {!hasPart}

- Book {=ex:book}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/book', 'http://schema.org/hasPart', 'http://ex.org/doc'),
                'Book should have doc as part');
        }
    },

    {
        name: 'Literal predicate forms in list scope emit nothing',
        fn: () => {
            const md = `# Recipe {=ex:recipe}

Ingredients: {ingredient .Ingredient}

- Flour {=ex:flour name}
- Water {=ex:water name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            // Should have type quads from .Ingredient and name quads from list items, but NOT ingredient relationships
            assert(quads.length === 4, `Should emit 4 triples (2 types + 2 names), got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://schema.org/name', 'Flour'),
                'Flour should have name');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://schema.org/name', 'Water'),
                'Water should have name');
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Flour should have Ingredient type');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Water should have Ingredient type');
            // Should NOT have ingredient relationships because {ingredient} is literal form
            assert(!hasQuad(quads, 'http://ex.org/recipe', 'http://schema.org/ingredient', 'http://ex.org/flour'),
                'Should not have literal ingredient relationship');
            assert(!hasQuad(quads, 'http://ex.org/recipe', 'http://schema.org/ingredient', 'http://ex.org/water'),
                'Should not have literal ingredient relationship');
        }
    },

    // §8.1 Predicate Forms - Edge Cases
    {
        name: 'Empty literal should still emit',
        fn: () => {
            const md = `# Doc {=ex:doc}

[] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, `Should emit 1 quad, got ${quads.length}`);
            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', '');
            assert(q.object.value === '', 'Empty literal should be empty string');
        }
    },

    {
        name: 'Literal with special characters',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Hello \"world\"! @#$%] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Hello "world"! @#$%');
            assert(q, 'Should handle special characters');
        }
    },

    {
        name: 'Multiple predicates on same carrier',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value] {name description author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 3, `Should emit 3 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Value'), 'Should have name');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/description', 'Value'), 'Should have description');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/author', 'Value'), 'Should have author');
        }
    },

    {
        name: 'Mixed datatype and language should prioritize language',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Hello] {name @en ^^xsd:string}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Hello');
            assert(q.object.language === 'en', 'Should have language tag');
            assert(q.object.datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString', 'Should use langString datatype when language present');
        }
    },

    // §9 Edge Cases - Invalid Syntax
    {
        name: 'Malformed annotation should be ignored',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value] {name incomplete`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 0, `Malformed annotation should emit nothing, got ${quads.length}`);
        }
    },

    {
        name: 'Empty annotation block should be ignored',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value] {}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 0, `Empty annotation should emit nothing, got ${quads.length}`);
        }
    },

    {
        name: 'Nested brackets should not crash',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value [nested]] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, `Should handle nested brackets gracefully, got ${quads.length}`);
            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/name', 'Value [nested]');
            assert(q, 'Should extract literal with brackets');
        }
    },

    // §10 Complex Structures
    {
        name: 'Simple list contexts work reliably',
        fn: () => {
            const md = `# Project {=ex:project}

Tasks: {?hasPart .Action}
- Task 1 {=ex:task1 name}
- Task 2 {=ex:task2 name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 6, `Should emit 6 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/project', 'http://schema.org/hasPart', 'http://ex.org/task1'), 'Should have task1');
            assert(hasQuad(quads, 'http://ex.org/project', 'http://schema.org/hasPart', 'http://ex.org/task2'), 'Should have task2');
            assert(hasQuad(quads, 'http://ex.org/task1', 'http://schema.org/name', 'Task 1'), 'Task 1 should have name');
        }
    },

    {
        name: 'Multiple reverse relationships',
        fn: () => {
            const md = `# Event {=ex:event}

Attendees: {!attendedBy}
- Alice {=ex:alice name}
- Bob {=ex:bob name}

Location: {!locatedAt}
- Venue {=ex:venue name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 6, `Should emit 6 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/attendedBy', 'http://ex.org/event'), 'Alice should attend event');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/attendedBy', 'http://ex.org/event'), 'Bob should attend event');
            assert(hasQuad(quads, 'http://ex.org/venue', 'http://schema.org/locatedAt', 'http://ex.org/event'), 'Venue should locate event');
        }
    },

    // §11 Datatype Validation
    {
        name: 'Boolean datatype handling',
        fn: () => {
            const md = `# Doc {=ex:doc}

[true] {active ^^xsd:boolean}
[false] {completed ^^xsd:boolean}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const trueQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/active', 'true');
            const falseQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/completed', 'false');

            assert(trueQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean', 'True should be boolean');
            assert(falseQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean', 'False should be boolean');
            assert(trueQ.object.value === 'true', 'True value should be "true"');
            assert(falseQ.object.value === 'false', 'False value should be "false"');
        }
    },

    {
        name: 'Float datatype handling',
        fn: () => {
            const md = `# Doc {=ex:doc}

[3.14159] {pi ^^xsd:float}
[2.71828] {e ^^xsd:double}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            const piQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/pi', '3.14159');
            const eQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/e', '2.71828');

            assert(piQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#float', 'Pi should be float');
            assert(eQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#double', 'E should be double');
        }
    },

    // §12 Error Conditions
    {
        name: 'Invalid IRI in subject should not crash',
        fn: () => {
            const md = `# Doc {=ex:invalid-iri-with spaces}

[Value] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            // Should handle gracefully - either emit nothing or expand as-is
            assert(quads.length >= 0, 'Should not crash on invalid IRI');
        }
    },

    {
        name: 'Circular prefix reference should not crash',
        fn: () => {
            const md = `[ex] <http://example.org/ex:>

# Doc {=ex:doc}

[Value] {ex:property}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            // Should handle gracefully
            assert(quads.length >= 0, 'Should not crash on circular prefix');
        }
    },

    // §13 Round-trip Complex Cases
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
    },

    // §14 Performance Edge Cases
    {
        name: 'Large document handling',
        fn: () => {
            let md = `# Doc {=ex:doc}\n\n`;
            for (let i = 0; i < 100; i++) {
                md += `[Item ${i}] {name}\n`;
            }

            const startTime = performance.now();
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });
            const duration = performance.now() - startTime;

            assert(quads.length === 100, `Should emit 100 triples, got ${quads.length}`);
            assert(duration < 1000, `Should parse quickly, took ${duration}ms`);
        }
    },

    // §15 Current Tests
    {
        name: 'Serialize - Add quad',
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
            const md = `[ex] <http://example.org/>

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

    // All inline carrier variants
    {
        name: 'All inline carrier variants work correctly',
        fn: () => {
            const md = `# Document {=ex:doc}

[span] {spanName}
*emphasis* {emphasisName}
**strong** {strongName}
_underline_ {underlineName}
__double_underline__ {doubleUnderlineName}
\`code\` {codeName}
[link](http://example.com) {linkName}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', '@vocab': 'http://example.org/' } });

            assert(quads.length === 7, `Should emit 7 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/spanName', 'span'), 'Should have span');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/emphasisName', 'emphasis'), 'Should have emphasis');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/strongName', 'strong'), 'Should have strong');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/underlineName', 'underline'), 'Should have underline');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/doubleUnderlineName', 'double_underline'), 'Should have double underline');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/codeName', 'code'), 'Should have code');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/linkName', 'link'), 'Should have link');
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

    // Serialization tests - comprehensive CRUD and semantic operations
    {
        name: 'Serialize - Add complex quads with datatypes',
        fn: () => {
            const original = `# Order {=ex:order-123}
            
Customer: [John Doe](ex:customer-456) {.Person name}
Amount: [99.95 USD] {price ^^xsd:decimal}
Status: [Pending] {status ^^ex:orderStatus}
Date: [2024-01-15] {orderDate ^^xsd:date}
Items: {?containsItem .Product}
- Widget A {=ex:widget-a .Product name}
- Widget B {=ex:widget-b .Product name}`;

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
            
Name: [Premium Widget] {name}
Price: [149.99] {price ^^xsd:decimal}
Category: [Electronics] {category}
Rating: [4.5] {rating ^^xsd:float}`;

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
            const original = `# Project {=ex:project-alpha}
            
Team: {?hasMember .Person}
- Alice {=ex:alice .Person name}
- Bob {=ex:bob .Person name}

Milestones: {?hasMilestone .Event}
- Planning Complete {=ex:milestone-1 .Event date ^^xsd:date}
- Testing Phase {=ex:milestone-2 .Event date ^^xsd:date}`;

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

Title: [My Document] {title}
[] {description}
Content: [Sample content] {text}`;

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
            
Title: [Hello World] {title}
Content: [Bonjour le monde] {content @fr}
Summary: [Hello world summary] {summary @en }`;

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

    // Soft IRI Tests - {+IRI} syntax
    {
        name: 'Soft IRI declaration with ?predicate',
        fn: () => {
            const md = `# Apollo 11 {=wd:Q43653}

Part of the [Apollo Program] {+wd:Q495307 ?schema:partOf}
and launched on a [Saturn V] {+wd:Q193237 ?schema:vehicle}.`;
            const { quads } = parse(md, { context: { wd: 'http://www.wikidata.org/entity/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://www.wikidata.org/entity/Q43653', 'http://schema.org/partOf', 'http://www.wikidata.org/entity/Q495307'),
                'Should use soft IRI as object for partOf');
            assert(hasQuad(quads, 'http://www.wikidata.org/entity/Q43653', 'http://schema.org/vehicle', 'http://www.wikidata.org/entity/Q193237'),
                'Should use soft IRI as object for vehicle');
        }
    },

    {
        name: 'Soft IRI with reverse predicate !p',
        fn: () => {
            const md = `# Document {=ex:doc}

[Parent] {+ex:parent !hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/parent', 'http://schema.org/hasPart', 'http://ex.org/doc'),
                'Should create reverse relationship from soft IRI to subject');
        }
    },

    {
        name: 'Soft IRI with type declaration',
        fn: () => {
            const md = `# Project {=ex:project}

[Team Lead] {+ex:alice ?schema:teamLead .Person}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/project', 'http://schema.org/teamLead', 'http://ex.org/alice'),
                'Should link project to alice');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
                'Should declare alice as Person');
        }
    },

    {
        name: 'Soft IRI does not persist between annotations',
        fn: () => {
            const md = `# Doc {=ex:doc}

[First] {+ex:object1 ?p}
[Second] {?p}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/p', 'http://ex.org/object1'),
                'Should use soft IRI from first annotation only');
        }
    },

    {
        name: 'Complex context switching with soft IRI and subject declarations',
        fn: () => {
            const md = `# Document {=ex:doc}

[One] {=urn:one .Article name} is an [text] {+urn:text name ?isInstanceOf}. Then continue writing about One article, not the text. Like add [Jane] {=urn:jane.Person .Person name ?author} - now we switch context - we can annotate Jane now - [1987] {yearOfBirth ^^xsd:gYear}.`;
            const { quads } = parse(md, {
                context: {
                    ex: 'http://example.org/',
                    xsd: 'http://www.w3.org/2001/XMLSchema#'
                }
            });

            assert(quads.length === 8, `Should emit 8 triples, got ${quads.length}`);

            // Check urn:one (Article)
            assert(hasQuad(quads, 'urn:one', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Article'),
                'urn:one should have type Article');
            assert(hasQuad(quads, 'urn:one', 'http://schema.org/name', 'One'),
                'urn:one should have name "One"');
            assert(hasQuad(quads, 'urn:one', 'http://schema.org/isInstanceOf', 'urn:text'),
                'urn:one should be instance of urn:text');
            assert(hasQuad(quads, 'urn:one', 'http://schema.org/author', 'urn:jane.Person'),
                'urn:one should have author urn:jane.Person');

            // Check urn:text (soft IRI object)
            assert(hasQuad(quads, 'urn:text', 'http://schema.org/name', 'text'),
                'urn:text should have name "text"');

            // Check urn:jane.Person (subject declaration with type)
            assert(hasQuad(quads, 'urn:jane.Person', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
                'urn:jane.Person should have type Person');
            assert(hasQuad(quads, 'urn:jane.Person', 'http://schema.org/name', 'Jane'),
                'urn:jane.Person should have name "Jane"');
            assert(hasQuad(quads, 'urn:jane.Person', 'http://schema.org/yearOfBirth', '1987'),
                'urn:jane.Person should have yearOfBirth "1987"');
        }
    },

    // Soft Fragment Tests - {+#fragment} syntax
    {
        name: 'Soft fragment declaration with ?predicate',
        fn: () => {
            const md = `# Document {=ex:doc}

[Section] {+#section1 name ?hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#section1', 'http://schema.org/name', 'Section'),
                'Soft fragment should have name');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/hasPart', 'http://example.org/doc#section1'),
                'Should use soft fragment as object');
        }
    },

    {
        name: 'Soft fragment with reverse predicate !p',
        fn: () => {
            const md = `# Document {=ex:doc}

[Parent] {+#parent !hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#parent', 'http://schema.org/hasPart', 'http://example.org/doc'),
                'Should create reverse relationship from soft fragment to subject');
        }
    },

    {
        name: 'Soft fragment with type declaration',
        fn: () => {
            const md = `# Document {=ex:doc}

[Chapter] {+#chapter1 .Section name}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#chapter1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Section'),
                'Soft fragment should have type');
            assert(hasQuad(quads, 'http://example.org/doc#chapter1', 'http://schema.org/name', 'Chapter'),
                'Soft fragment should have name');
        }
    },

    {
        name: 'Soft fragment does not persist between annotations',
        fn: () => {
            const md = `# Doc {=ex:doc}

[First] {+#frag1 ?p}
[Second] {?p}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/p', 'http://ex.org/doc#frag1'),
                'Should use soft fragment from first annotation only');
        }
    },

    {
        name: 'Complex context switching with soft fragments',
        fn: () => {
            const md = `# Document {=ex:doc}

[Section] {+#section1 .Section name}
[Subsection] {+#section2 name ?hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/' } });

            assert(quads.length === 4, `Should emit 4 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#section1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Section'),
                'Section should have type');
            assert(hasQuad(quads, 'http://example.org/doc#section1', 'http://schema.org/name', 'Section'),
                'Section should have name');
            assert(hasQuad(quads, 'http://example.org/doc#section2', 'http://schema.org/name', 'Subsection'),
                'Subsection should have name');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/hasPart', 'http://example.org/doc#section2'),
                'Should use soft fragment as object');
        }
    },

    // Fragment Syntax Tests
    {
        name: 'Fragment syntax uses current subject IRI base',
        fn: () => {
            const md = `# Document {=ex:document}
            
{=#summary}
[This is the summary] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/' } });

            assert(hasQuad(quads, 'http://example.org/document#summary', 'http://schema.org/name', 'This is the summary'),
                'Fragment should resolve to current subject + #fragment');
        }
    },

    {
        name: 'Fragment syntax with nested path segments',
        fn: () => {
            const md = `# Document {=ex:document}

## Section {=#section1}
[Section content] {headline}
            
## Subsection {=#subsection}
[Content here] {name}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/' } });


            assert(hasQuad(quads, 'http://example.org/document#section1', 'http://schema.org/headline', 'Section content'),
                'Fragment should append to existing path');
            assert(hasQuad(quads, 'http://example.org/document#subsection', 'http://schema.org/name', 'Content here'),
                'Fragment should replace existing fragment, not nest');
        }
    },

    {
        name: 'Fragment syntax without current subject emits nothing',
        fn: () => {
            const md = `{=#summary}
[Content] {name}`;
            const { quads } = parse(md);

            assert(quads.length === 0, `Fragment without subject should emit nothing, got ${quads.length}`);
        }
    },

    // Subject Chaining Tests
    {
        name: 'Subject chaining with standalone declarations',
        fn: () => {
            const md = `[ex] <http://example.org/>

## Main Event {=ex:main-event .Event}
Title: [Main Title] {title}
Description: [Main description] {description}

{=ex:sub-event-1 .Event}
Sub title: [Sub Title 1] {title}
Sub description: [Sub description 1] {description}

{=ex:sub-event-2 .Event}
Sub title: [Sub Title 2] {title}
Sub description: [Sub description 2] {description}

Back to main: [Back to main] {description}`;

            const { quads } = parse(md);

            // Main event quads
            assert(hasQuad(quads, 'http://example.org/main-event', 'http://schema.org/title', 'Main Title'),
                'Main event title should use ex:main-event as subject');
            assert(hasQuad(quads, 'http://example.org/main-event', 'http://schema.org/description', 'Main description'),
                'Main event description should use ex:main-event as subject');

            // Sub event 1 quads
            assert(hasQuad(quads, 'http://example.org/sub-event-1', 'http://schema.org/title', 'Sub Title 1'),
                'Sub event 1 title should use ex:sub-event-1 as subject');
            assert(hasQuad(quads, 'http://example.org/sub-event-1', 'http://schema.org/description', 'Sub description 1'),
                'Sub event 1 description should use ex:sub-event-1 as subject');

            // Sub event 2 quads
            assert(hasQuad(quads, 'http://example.org/sub-event-2', 'http://schema.org/title', 'Sub Title 2'),
                'Sub event 2 title should use ex:sub-event-2 as subject');
            assert(hasQuad(quads, 'http://example.org/sub-event-2', 'http://schema.org/description', 'Sub description 2'),
                'Sub event 2 description should use ex:sub-event-2 as subject');

            // Back to main (should use previous subject ex:sub-event-2)
            assert(hasQuad(quads, 'http://example.org/sub-event-2', 'http://schema.org/description', 'Back to main'),
                'Back to main should use ex:sub-event-2 as subject');

            // Type declarations
            assert(hasQuad(quads, 'http://example.org/main-event', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Event'),
                'Main event should have Event type');
            assert(hasQuad(quads, 'http://example.org/sub-event-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Event'),
                'Sub event 1 should have Event type');
            assert(hasQuad(quads, 'http://example.org/sub-event-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Event'),
                'Sub event 2 should have Event type');
        }
    },

    {
        name: 'Subject reset with standalone {=}',
        fn: () => {
            const md = `[ex] <http://example.org/>

## First {=ex:first}
Title: [First Title] {title}
Description: [First description] {description}

{=}
Title: [No subject title] {title}
Description: [No subject description] {description}`;

            const { quads } = parse(md);

            // Should only have quads for the first subject
            assert(hasQuad(quads, 'http://example.org/first', 'http://schema.org/title', 'First Title'),
                'First title should use ex:first as subject');
            assert(hasQuad(quads, 'http://example.org/first', 'http://schema.org/description', 'First description'),
                'First description should use ex:first as subject');

            // Should not have quads after reset (no subject)
            assert(!hasQuad(quads, 'http://example.org/first', 'http://schema.org/title', 'No subject title'),
                'Should not emit title after subject reset');
            assert(!hasQuad(quads, 'http://example.org/first', 'http://schema.org/description', 'No subject description'),
                'Should not emit description after subject reset');

            assert(quads.length === 2, `Should have exactly 2 quads (title, description), got ${quads.length}`);
        }
    },

    {
        name: 'Mixed subject declarations with carriers and standalone',
        fn: () => {
            const md = `[ex] <http://example.org/>

## Document {=ex:doc .Document}
Title: [Document Title] {title}

{=ex:section1 .Section}
Section title: [Section 1] {title}
Content: [Section 1 content] {content}

## Section 2 {=ex:section2 .Section}
Section title: [Section 2] {title}
Content: [Section 2 content] {content}

{=ex:doc}
Summary: [Document summary] {summary}`;

            const { quads } = parse(md);

            // Document quads
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/title', 'Document Title'),
                'Document title should use ex:doc as subject');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/summary', 'Document summary'),
                'Document summary should use ex:doc as subject');

            // Section 1 quads (from standalone declaration)
            assert(hasQuad(quads, 'http://example.org/section1', 'http://schema.org/title', 'Section 1'),
                'Section 1 title should use ex:section1 as subject');
            assert(hasQuad(quads, 'http://example.org/section1', 'http://schema.org/content', 'Section 1 content'),
                'Section 1 content should use ex:section1 as subject');

            // Section 2 quads (from heading carrier)
            assert(hasQuad(quads, 'http://example.org/section2', 'http://schema.org/title', 'Section 2'),
                'Section 2 title should use ex:section2 as subject');
            assert(hasQuad(quads, 'http://example.org/section2', 'http://schema.org/content', 'Section 2 content'),
                'Section 2 content should use ex:section2 as subject');

            // Type declarations
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Document'),
                'Document should have Document type');
            assert(hasQuad(quads, 'http://example.org/section1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Section'),
                'Section 1 should have Section type');
            assert(hasQuad(quads, 'http://example.org/section2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Section'),
                'Section 2 should have Section type');
        }
    },

    // §16 List Item Predicate Inheritance
    {
        name: 'List items inherit literal predicates from context',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?attendee name}
- Alice {=ex:alice}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/name', 'Alice'),
                'Alice should inherit name predicate');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/name', 'Bob'),
                'Bob should inherit name predicate');
        }
    },

    {
        name: 'List items inherit predicates with trailing spaces',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?attendee name}
- Alice {=ex:alice} 
- Bob {=ex:bob}  
- Carol {=ex:carol}\t`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee (trailing space)');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee (multiple trailing spaces)');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/carol'),
                'Meeting should have carol as attendee (tab trailing)');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/name', 'Alice'),
                'Alice should inherit name predicate (trailing space)');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/name', 'Bob'),
                'Bob should inherit name predicate (multiple trailing spaces)');
            assert(hasQuad(quads, 'http://ex.org/carol', 'http://schema.org/name', 'Carol'),
                'Carol should inherit name predicate (tab trailing)');
        }
    },

    {
        name: 'List items inherit predicates with leading spaces in annotations',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?attendee name}
- Alice { =ex:alice }
- Bob {  =ex:bob  }
- Carol {=ex:carol}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee (space in annotation)');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee (multiple spaces in annotation)');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/carol'),
                'Meeting should have carol as attendee (normal annotation)');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/name', 'Alice'),
                'Alice should inherit name predicate (space in annotation)');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/name', 'Bob'),
                'Bob should inherit name predicate (multiple spaces in annotation)');
            assert(hasQuad(quads, 'http://ex.org/carol', 'http://schema.org/name', 'Carol'),
                'Carol should inherit name predicate (normal annotation)');
        }
    },

    {
        name: 'List items inherit predicates with mixed whitespace patterns',
        fn: () => {
            const md = `# Document {=ex:doc}

Items: {?hasItem name description}
- First item {=ex:item1}   
- Second item{=ex:item2}\t
- Third item  {=ex:item3} 
- Fourth item{=ex:item4}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            // Should have 4 hasItem relationships
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/hasItem', 'http://ex.org/item1'),
                'Doc should have first item');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/hasItem', 'http://ex.org/item2'),
                'Doc should have second item');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/hasItem', 'http://ex.org/item3'),
                'Doc should have third item');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/hasItem', 'http://ex.org/item4'),
                'Doc should have fourth item');

            // Should have 8 inherited predicates (name + description for each)
            assert(hasQuad(quads, 'http://ex.org/item1', 'http://schema.org/name', 'First item'),
                'First item should inherit name');
            assert(hasQuad(quads, 'http://ex.org/item1', 'http://schema.org/description', 'First item'),
                'First item should inherit description');
            assert(hasQuad(quads, 'http://ex.org/item2', 'http://schema.org/name', 'Second item'),
                'Second item should inherit name');
            assert(hasQuad(quads, 'http://ex.org/item2', 'http://schema.org/description', 'Second item'),
                'Second item should inherit description');
            assert(hasQuad(quads, 'http://ex.org/item3', 'http://schema.org/name', 'Third item'),
                'Third item should inherit name');
            assert(hasQuad(quads, 'http://ex.org/item3', 'http://schema.org/description', 'Third item'),
                'Third item should inherit description');
            assert(hasQuad(quads, 'http://ex.org/item4', 'http://schema.org/name', 'Fourth item'),
                'Fourth item should inherit name');
            assert(hasQuad(quads, 'http://ex.org/item4', 'http://schema.org/description', 'Fourth item'),
                'Fourth item should inherit description');
        }
    },

    {
        name: 'List items with own predicates dont inherit',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?attendee name}
- Alice {=ex:alice name description}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/name', 'Alice'),
                'Alice should have her own name predicate');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/description', 'Alice'),
                'Alice should have her own description predicate');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/name', 'Bob'),
                'Bob should inherit name predicate');
        }
    },

    {
        name: 'Only literal predicates are inherited',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?attendee name ?role}
- Alice {=ex:alice}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/name', 'Alice'),
                'Alice should inherit literal name predicate');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/name', 'Bob'),
                'Bob should inherit literal name predicate');
            // Should NOT inherit ?role predicate as it's object predicate form
            assert(!hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/role', 'Alice'),
                'Alice should not inherit object predicate ?role');
            assert(!hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/role', 'Bob'),
                'Bob should not inherit object predicate ?role');
        }
    },

    {
        name: 'Multiple literal predicates inheritance',
        fn: () => {
            const md = `# Document {=ex:doc}

People: {?knows name description}
- Alice {=ex:alice}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/knows', 'http://ex.org/alice'),
                'Doc should know alice');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/knows', 'http://ex.org/bob'),
                'Doc should know bob');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/name', 'Alice'),
                'Alice should inherit name');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/description', 'Alice'),
                'Alice should inherit description');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/name', 'Bob'),
                'Bob should inherit name');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/description', 'Bob'),
                'Bob should inherit description');
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

async function runTests() {
    console.log('# MD-LD v0.3 Specification Test Suite\n');

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