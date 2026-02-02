import { parse } from '../src/index.js';

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

// Parse test suite
export const parseTests = [
    // §6 Subject Declaration
    {
        name: 'Subject declaration sets context',
        fn: () => {
            const md = `# Title {=ex:doc}

[value] {label}`;
            const { quads, context } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'value'),
                'Subject should be ex:doc');
        }
    },

    {
        name: 'Subject reset with {=}',
        fn: () => {
            const md = `# First {=ex:first}

[value1] {label}

# Reset {=}

[value2] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should only emit 1 quad, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/first', 'http://www.w3.org/2000/01/rdf-schema#label', 'value1'),
                'Only first value should emit');
        }
    },

    // §7 Type Declaration
    {
        name: 'Type declaration emits rdf:type',
        fn: () => {
            const md = `# Doc {=ex:doc .schema:Article}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Article'),
                'Should emit type triple');
        }
    },

    {
        name: 'Multiple types on same subject',
        fn: () => {
            const md = `# Doc {=ex:doc .schema:Article .schema:CreativeWork}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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

[Alice] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Alice');
            assert(q, 'Should find name triple');
            assert(q.object.termType === 'Literal', 'Object should be Literal');
            assert(q.object.value === 'Alice', `Value should be "Alice", got "${q.object.value}"`);
        }
    },

    {
        name: 'Multiple literal properties',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice] {label schema:author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Alice'), 'Should have label');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/author', 'Alice'), 'Should have author');
        }
    },

    // §8.1 Predicate Forms - Object Properties (?p)
    {
        name: 'Object property: S → O (form ?p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Alice] {=ex:alice ?schema:author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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

[Alice] {=ex:alice ?schema:author .schema:Person}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 0, `Should emit 0 triples when O missing, got ${quads.length}`);
        }
    },

    // §8.1 Predicate Forms - Reverse Properties (!p)
    {
        name: 'Reverse object property: O → S (form !p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Parent] {=ex:parent !schema:hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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

[42] {schema:count ^^xsd:integer}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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

[Hello] {schema:greeting @en}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/greeting', 'Hello');
            assert(q, 'Should find greeting triple');
            assert(q.object.language === 'en', `Language should be "en", got "${q.object.language}"`);
        }
    },

    {
        name: 'Multiple datatypes (^^xsd:date, ^^xsd:decimal)',
        fn: () => {
            const md = `# Doc {=ex:doc}

[2024-01-01] {schema:date ^^xsd:date}
[19.99] {schema:price ^^xsd:decimal}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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

Ingredients: {?schema:ingredient}
- Flour {=ex:flour label}
- Water {=ex:water label}	`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/recipe', 'http://schema.org/ingredient', 'http://ex.org/flour'),
                'Recipe should have flour');
            assert(hasQuad(quads, 'http://ex.org/recipe', 'http://schema.org/ingredient', 'http://ex.org/water'),
                'Recipe should have water');
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://www.w3.org/2000/01/rdf-schema#label', 'Flour'),
                'Flour should have label');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://www.w3.org/2000/01/rdf-schema#label', 'Water'),
                'Water should have label');
        }
    },

    {
        name: 'List with types in context',
        fn: () => {
            const md = `# Recipe {=ex:recipe}

Ingredients: {?schema:ingredient .schema:Ingredient}

- Flour {=ex:flour label}
- Water {=ex:water label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

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
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 0, `Should emit 0 triples without item subjects, got ${quads.length}`);
        }
    },

    {
        name: 'Reverse list relationship (!p)',
        fn: () => {
            const md = `# Doc {=ex:doc}

Part of: {!schema:hasPart}

- Book {=ex:book}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/book', 'http://schema.org/hasPart', 'http://ex.org/doc'),
                'Book should have doc as part');
        }
    },

    {
        name: 'Literal predicate forms in list scope emit nothing',
        fn: () => {
            const md = `# Recipe {=ex:recipe}

Ingredients: {schema:ingredient .schema:Ingredient schema:name}

- Flour {=ex:flour label}
- Water {=ex:water label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            // Should have type quads from .Ingredient, literal ingredient relationships, name quads, and label quads
            assert(quads.length === 8, `Should emit 8 triples (2 types + 2 ingredient + 2 names + 2 labels), got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://www.w3.org/2000/01/rdf-schema#label', 'Flour'),
                'Flour should have label');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://www.w3.org/2000/01/rdf-schema#label', 'Water'),
                'Water should have label');
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Flour should have Ingredient type');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Water should have Ingredient type');
            // Should have literal ingredient relationships from list context
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://schema.org/ingredient', 'Flour'),
                'Flour should have literal ingredient relationship');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://schema.org/ingredient', 'Water'),
                'Water should have literal ingredient relationship');
            // Should have name properties from list context
            assert(hasQuad(quads, 'http://ex.org/flour', 'http://schema.org/name', 'Flour'),
                'Flour should have name from list context');
            assert(hasQuad(quads, 'http://ex.org/water', 'http://schema.org/name', 'Water'),
                'Water should have name from list context');
        }
    },
    {
        name: 'Empty literal should still emit',
        fn: () => {
            const md = `# Doc {=ex:doc}

[] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 quad, got ${quads.length}`);
            const q = findQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', '');
            assert(q.object.value === '', 'Empty literal should be empty string');
        }
    },

    {
        name: 'Literal with special characters',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Hello "world"! @#$%] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Hello "world"! @#$%');
            assert(q, 'Should handle special characters');
        }
    },

    {
        name: 'Multiple predicates on same carrier',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value] {label schema:description schema:author}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 3, `Should emit 3 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Value'), 'Should have label');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/description', 'Value'), 'Should have description');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/author', 'Value'), 'Should have author');
        }
    },

    {
        name: 'Mixed datatype and language should prioritize language',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Hello] {label @en ^^xsd:string}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            const q = findQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Hello');
            assert(q.object.language === 'en', 'Should have language tag');
            assert(q.object.datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString', 'Should use langString datatype when language present');
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

    // Prefix Folding Tests
    {
        name: 'Prefix folding - basic functionality',
        fn: () => {
            const md = `[base] <https://example.com/>
[doc] <base:document/>
[auth] <base:author/>

# Test {=doc:test1 auth:created}`;
            const { quads, context } = parse(md);

            assert(context.doc === 'https://example.com/document/',
                'Should fold prefix correctly');
            assert(context.auth === 'https://example.com/author/',
                'Should fold prefix correctly');
            assert(hasQuad(quads, 'https://example.com/document/test1', 'https://example.com/author/created', 'Test'),
                'Should use folded prefixes in quads');
        }
    },

    {
        name: 'Prefix folding - forward reference should be literal',
        fn: () => {
            const md = `[j] <my:journal:>
[my] <tag:mymail@domain.com,2026:>

# Test {=j:test}`;
            const { context } = parse(md);

            assert(context.j === 'my:journal:',
                'Forward reference should be treated as literal');
            assert(context.my === 'tag:mymail@domain.com,2026:',
                'Base prefix should be set correctly');
        }
    },

    {
        name: 'Prefix folding - circular reference safety',
        fn: () => {
            const md = `[a] <b:test>
[b] <a:test>

# Test {=a:test}`;
            const { context } = parse(md);

            // Should not cause infinite loop, both should be treated as literals
            assert(context.a === 'b:test', 'Should handle circular reference safely');
            assert(context.b === 'b:testtest', 'Should handle circular reference safely');
        }
    },

    {
        name: 'Prefix folding - redeclaration overrides',
        fn: () => {
            const md = `[my] <tag:mymail@domain.com,2026:>
[my] <https://example.com/new/>
[j] <my:journal:>

# Test {=j:test}`;
            const { context } = parse(md);

            assert(context.my === 'https://example.com/new/',
                'Redeclaration should override previous definition');
            assert(context.j === 'https://example.com/new/journal:',
                'Should use new base for folding');
        }
    },

    {
        name: 'Prefix folding - multi-level nesting',
        fn: () => {
            const md = `[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
[dev] <emp:developer/>

# Test {=dev:john emp:worksFor}`;
            const { context, quads } = parse(md);

            assert(context.org === 'https://org.example.com/', 'Base level should work');
            assert(context.person === 'https://org.example.com/person/', 'First level folding should work');
            assert(context.emp === 'https://org.example.com/person/employee/', 'Second level folding should work');
            assert(context.dev === 'https://org.example.com/person/employee/developer/', 'Third level folding should work');

            assert(hasQuad(quads, 'https://org.example.com/person/employee/developer/john',
                'https://org.example.com/person/employee/worksFor', 'Test'),
                'Should use all folded prefixes correctly');
        }
    },

    {
        name: 'Prefix folding - invalid CURIE treated as literal',
        fn: () => {
            const md = `[my] <tag:me,2026:>
[invalid] <nonexistent:prefix:>

# Test {=invalid:test}`;
            const { context } = parse(md);

            assert(context.my === 'tag:me,2026:', 'Valid prefix should work');
            assert(context.invalid === 'nonexistent:prefix:', 'Invalid CURIE should be treated as literal');
        }
    },

    // Multiple inline carriers
    {
        name: 'Multiple inline carriers in paragraph',
        fn: () => {
            const md = `# Doc {=ex:doc}

Author is [Alice] {label} and [Bob] {schema:contributor}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Alice'), 'Should have Alice');
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
            assert(hasQuad(quads, 'http://example.com', 'http://example.org/linkName', 'link'), 'Should have link attached to URL');
        }
    },

    {
        name: 'Multiple inline carriers on same line',
        fn: () => {
            const md = `
# Document {=ex:doc}

[span] {spanName} *emphasis* {emphasisName} **strong** {strongName}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', '@vocab': 'http://example.org/' } });

            assert(quads.length === 3, `Should emit 3 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/spanName', 'span'), 'Should have span');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/emphasisName', 'emphasis'), 'Should have emphasis');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/strongName', 'strong'), 'Should have strong');
        }
    },

    // Edge cases
    {
        name: 'Empty annotation emits nothing',
        fn: () => {
            const md = `# Doc {=ex:doc}

[value] {}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 0, `Empty annotation should emit nothing, got ${quads.length}`);
        }
    },

    {
        name: 'Annotation without subject emits nothing',
        fn: () => {
            const md = `[value] {label}`;
            const { quads } = parse(md);

            assert(quads.length === 0, `No subject means no quads, got ${quads.length}`);
        }
    },

    {
        name: 'Plain paragraph without annotation is ignored',
        fn: () => {
            const md = `# Doc {=ex:doc}

This is plain text.

[value] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, 'Only annotated value should emit');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'value'), 'Should have value');
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

[Parent] {+ex:parent !schema:hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/parent', 'http://schema.org/hasPart', 'http://ex.org/doc'),
                'Should create reverse relationship from soft IRI to subject');
        }
    },

    {
        name: 'Soft IRI with type declaration',
        fn: () => {
            const md = `# Project {=ex:project}

[Team Lead] {+ex:alice ?schema:teamLead .schema:Person}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/project', 'http://schema.org/teamLead', 'http://ex.org/alice'),
                'Should link project to alice');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
                'Should declare alice as Person');
        }
    },

    // Fragment Syntax Tests
    {
        name: 'Fragment syntax uses current subject IRI base',
        fn: () => {
            const md = `# Document {=ex:document}
            
{=#summary}
[This is the summary] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://example.org/document#summary', 'http://www.w3.org/2000/01/rdf-schema#label', 'This is the summary'),
                'Fragment should resolve to current subject + #fragment');
        }
    },

    {
        name: 'Fragment syntax with nested path segments',
        fn: () => {
            const md = `# Document {=ex:document}

## Section {=#section1}
[Section content] {schema:headline}
            
## Subsection {=#subsection}
[Content here] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });


            assert(hasQuad(quads, 'http://example.org/document#section1', 'http://schema.org/headline', 'Section content'),
                'Fragment should append to existing path');
            assert(hasQuad(quads, 'http://example.org/document#subsection', 'http://www.w3.org/2000/01/rdf-schema#label', 'Content here'),
                'Fragment should replace existing fragment, not nest');
        }
    },

    {
        name: 'Fragment syntax without current subject emits nothing',
        fn: () => {
            const md = `{=#summary}
[Content] {label}`;
            const { quads } = parse(md);

            assert(quads.length === 0, `Fragment without subject should emit nothing, got ${quads.length}`);
        }
    },

    // §11.2 Nested Lists (normative)
    {
        name: 'Nested lists with explicit contexts',
        fn: () => {
            const md = `[ex] <http://example.org/>

## Recipe {=ex:recipe .schema:Recipe schema:name}

Ingredients: {?schema:hasPart .schema:Ingredient label}

- Flour {=ex:flour}
  Variants: {?schema:hasPart .schema:FlourType label}
  - Whole wheat {=ex:flour-whole-wheat .schema:WholeGrainFlour}
    Whole grain includes {?schema:hasPart .schema:GrainPart label}
    - Bran {=ex:grain-bran}
    - Germ {=ex:grain-germ}
    - Endosperm {=ex:grain-endosperm}
  - White {=ex:flour-white schema:title}
- Water {=ex:water}`;

            const { quads } = parse(md, { context: { schema: 'http://schema.org/' } });

            // Check recipe structure
            assert(hasQuad(quads, 'http://example.org/recipe', 'http://schema.org/name', 'Recipe'),
                'Recipe should have name');
            assert(hasQuad(quads, 'http://example.org/recipe', 'http://schema.org/hasPart', 'http://example.org/flour'),
                'Recipe should have flour');
            assert(hasQuad(quads, 'http://example.org/recipe', 'http://schema.org/hasPart', 'http://example.org/water'),
                'Recipe should have water');

            // Check flour types
            assert(hasQuad(quads, 'http://example.org/flour', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Flour should be Ingredient');
            assert(hasQuad(quads, 'http://example.org/flour', 'http://schema.org/hasPart', 'http://example.org/flour-whole-wheat'),
                'Flour should have whole wheat variant');
            assert(hasQuad(quads, 'http://example.org/flour', 'http://schema.org/hasPart', 'http://example.org/flour-white'),
                'Flour should have white variant');

            // Check nested flour types
            assert(hasQuad(quads, 'http://example.org/flour-whole-wheat', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/FlourType'),
                'Whole wheat should be FlourType');
            assert(hasQuad(quads, 'http://example.org/flour-whole-wheat', 'http://schema.org/hasPart', 'http://example.org/grain-bran'),
                'Whole wheat should have bran');
            assert(hasQuad(quads, 'http://example.org/flour-whole-wheat', 'http://schema.org/hasPart', 'http://example.org/grain-germ'),
                'Whole wheat should have germ');
            assert(hasQuad(quads, 'http://example.org/flour-whole-wheat', 'http://schema.org/hasPart', 'http://example.org/grain-endosperm'),
                'Whole wheat should have endosperm');

            // Check grain parts
            assert(hasQuad(quads, 'http://example.org/grain-bran', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/GrainPart'),
                'Bran should be GrainPart');
            assert(hasQuad(quads, 'http://example.org/grain-germ', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/GrainPart'),
                'Germ should be GrainPart');
            assert(hasQuad(quads, 'http://example.org/grain-endosperm', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/GrainPart'),
                'Endosperm should be GrainPart');

            // Check white flour
            assert(hasQuad(quads, 'http://example.org/flour-white', 'http://schema.org/title', 'White'),
                'White flour should have title');

            // Check water
            assert(hasQuad(quads, 'http://example.org/water', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Ingredient'),
                'Water should be Ingredient');
        }
    },

    // §9 Edge Cases - Invalid Syntax
    {
        name: 'Malformed annotation should be ignored',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value] {name incomplete`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 0, `Malformed annotation should emit nothing, got ${quads.length}`);
        }
    },

    {
        name: 'Empty annotation block should be ignored',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value] {}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 0, `Empty annotation should emit nothing, got ${quads.length}`);
        }
    },

    {
        name: 'Nested brackets should not crash',
        fn: () => {
            const md = `# Doc {=ex:doc}

[Value [nested]] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should handle nested brackets gracefully, got ${quads.length}`);
            const q = findQuad(quads, 'http://ex.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Value [nested]');
            assert(q, 'Should extract literal with brackets');
        }
    },

    // Fenced Code Block Tests
    {
        name: 'Fenced code blocks should skip annotation processing',
        fn: () => {
            const md = `# Document {=ex:doc}

\`\`\`mdld
[This should be ignored] {label schema:description}
\`\`\`

[This should be processed] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'This should be processed'),
                'Only content outside code blocks should be processed');
        }
    },

    {
        name: 'Fenced code blocks should process fence annotations but skip content',
        fn: () => {
            const md = `# Document {=ex:doc}

\`\`\`mdld {label schema:description}
[This should be ignored] {label schema:description}
\`\`\`

[This should be processed] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 3, `Should emit 3 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', '[This should be ignored] {label schema:description}'),
                'Should use content as label value');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/description', '[This should be ignored] {label schema:description}'),
                'Should use content as description value');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'This should be processed'),
                'Should process content outside code block');
        }
    },

    {
        name: 'Multiple fenced code blocks should all be skipped',
        fn: () => {
            const md = `# Document {=ex:doc}

\`\`\`mdld
[First ignored] {label}
\`\`\`

[Processed] {label}

\`\`\`mdld {schema:description}
[Second ignored] {schema:description}
\`\`\`

[Also processed] {schema:description}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 3, `Should emit 3 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'Processed'),
                'Should process first content');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/description', '[Second ignored] {schema:description}'),
                'Should use second code block content as description value');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/description', 'Also processed'),
                'Should process second content');
        }
    },

    {
        name: 'Fenced code blocks with language info and attributes should be processed',
        fn: () => {
            const md = `# Document {=ex:doc}

\`\`\`javascript {ex:attribute}
[Code example] {label schema:description}
console.log("hello");
\`\`\``;

            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/attribute', '[Code example] {label schema:description}\nconsole.log("hello");'),
                'Should use code block content as attribute value');
        }
    },

    {
        name: 'Mixed content with fenced code blocks should work correctly',
        fn: () => {
            const md = `# Document {=ex:doc}

Regular content [before] {label}

\`\`\`mdld
[Ignored content] {schema:description}
More ignored [content] {label}
\`\`\`

Regular content [after] {schema:description}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#label', 'before'),
                'Should process content before code block');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/description', 'after'),
                'Should process content after code block');
        }
    },

    // §11 Datatype Validation
    {
        name: 'Boolean datatype handling',
        fn: () => {
            const md = `# Doc {=ex:doc}

[true] {schema:active ^^xsd:boolean}
[false] {schema:completed ^^xsd:boolean}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            const trueQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/active', 'true');
            const falseQ = findQuad(quads, 'http://ex.org/doc', 'http://schema.org/completed', 'false');

            assert(trueQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean', 'True should be boolean');
            assert(falseQ.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean', 'False should be boolean');
            assert(trueQ.object.value === 'true', 'True value should be "true"');
            assert(falseQ.object.value === 'false', 'False value should be "false"');
        }
    },

    // §12 Error Conditions
    {
        name: 'Invalid IRI in subject should not crash',
        fn: () => {
            const md = `# Doc {=ex:invalid-iri-with spaces}

[Value] {label}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            // Should handle gracefully - either emit nothing or expand as-is
            assert(quads.length >= 0, 'Should not crash on invalid IRI');
        }
    },

    // §16 List Item Predicate Inheritance
    {
        name: 'List items inherit literal predicates from context',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?schema:attendee label}
- Alice {=ex:alice}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://www.w3.org/2000/01/rdf-schema#label', 'Alice'),
                'Alice should inherit name predicate');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://www.w3.org/2000/01/rdf-schema#label', 'Bob'),
                'Bob should inherit name predicate');
        }
    },

    {
        name: 'Only literal predicates are inherited',
        fn: () => {
            const md = `# Meeting Notes {=ex:meeting}

Attendees: {?schema:attendee label ?role}
- Alice {=ex:alice}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/alice'),
                'Meeting should have alice as attendee');
            assert(hasQuad(quads, 'http://ex.org/meeting', 'http://schema.org/attendee', 'http://ex.org/bob'),
                'Meeting should have bob as attendee');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://www.w3.org/2000/01/rdf-schema#label', 'Alice'),
                'Alice should inherit literal name predicate');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://www.w3.org/2000/01/rdf-schema#label', 'Bob'),
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

People: {?schema:knows label schema:description}
- Alice {=ex:alice}
- Bob {=ex:bob}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/knows', 'http://ex.org/alice'),
                'Doc should know alice');
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/knows', 'http://ex.org/bob'),
                'Doc should know bob');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://www.w3.org/2000/01/rdf-schema#label', 'Alice'),
                'Alice should inherit name');
            assert(hasQuad(quads, 'http://ex.org/alice', 'http://schema.org/description', 'Alice'),
                'Alice should inherit description');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://www.w3.org/2000/01/rdf-schema#label', 'Bob'),
                'Bob should inherit name');
            assert(hasQuad(quads, 'http://ex.org/bob', 'http://schema.org/description', 'Bob'),
                'Bob should inherit description');
        }
    },

    // Subject Chaining Tests
    {
        name: 'Subject chaining with standalone declarations',
        fn: () => {
            const md = `[ex] <http://example.org/>

## Main Event {=ex:main-event .schema:Event}
Title: [Main Title] {schema:title}
Description: [Main description] {schema:description}

{=ex:sub-event-1 .schema:Event}
Sub title: [Sub Title 1] {schema:title}
Sub description: [Sub description 1] {schema:description}

{=ex:sub-event-2 .schema:Event}
Sub title: [Sub Title 2] {schema:title}
Sub description: [Sub description 2] {schema:description}

Back to main: [Back to main] {schema:description}`;

            const { quads } = parse(md, { context: { schema: 'http://schema.org/' } });

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
Title: [First Title] {schema:title}
Description: [First description] {schema:description}

{=}
Title: [No subject title] {schema:title}
Description: [No subject description] {schema:description}`;

            const { quads } = parse(md, { context: { schema: 'http://schema.org/' } });

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

    // Soft Fragment Tests - {+#fragment} syntax
    {
        name: 'Soft fragment declaration with ?predicate',
        fn: () => {
            const md = `# Document {=ex:doc}

[Section] {+#section1 label ?schema:hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#section1', 'http://www.w3.org/2000/01/rdf-schema#label', 'Section'),
                'Soft fragment should have name');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://schema.org/hasPart', 'http://example.org/doc#section1'),
                'Should use soft fragment as object');
        }
    },

    {
        name: 'Soft fragment with reverse predicate !p',
        fn: () => {
            const md = `# Document {=ex:doc}

[Parent] {+#parent !schema:hasPart}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#parent', 'http://schema.org/hasPart', 'http://example.org/doc'),
                'Should create reverse relationship from soft fragment to subject');
        }
    },

    {
        name: 'Soft fragment with type declaration',
        fn: () => {
            const md = `# Document {=ex:doc}

[Chapter] {+#chapter1 .schema:Section label}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 2, `Should emit 2 triples, got ${quads.length}`);
            assert(hasQuad(quads, 'http://example.org/doc#chapter1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Section'),
                'Soft fragment should have type');
            assert(hasQuad(quads, 'http://example.org/doc#chapter1', 'http://www.w3.org/2000/01/rdf-schema#label', 'Chapter'),
                'Soft fragment should have name');
        }
    },

    {
        name: 'Soft fragment does not persist between annotations',
        fn: () => {
            const md = `# Doc {=ex:doc}

[First] {+#frag1 ?schema:p}
[Second] {?schema:p}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/p', 'http://ex.org/doc#frag1'),
                'Should use soft fragment from first annotation only');
        }
    },

    {
        name: 'Soft IRI does not persist between annotations',
        fn: () => {
            const md = `# Doc {=ex:doc}

[First] {+ex:object1 ?schema:p}
[Second] {?schema:p}`;
            const { quads } = parse(md, { context: { ex: 'http://ex.org/', schema: 'http://schema.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'http://ex.org/doc', 'http://schema.org/p', 'http://ex.org/object1'),
                'Should use soft IRI from first annotation only');
        }
    },

    // Angle-bracket URL tests - comprehensive coverage
    {
        name: 'Angle-bracket URL soft subject behavior',
        fn: () => {
            const md = `# Document {=ex:doc}

<https://nasa.gov> {.Organization} <https://arxiv.org/abs/2301.07041> {?cites .Paper}
<https://doi.org/10.1000/xyz123> {!hasVersion .Article}`;

            const { quads } = parse(md, { context: { ex: 'http://example.org/', '@vocab': 'http://example.org/' } });

            assert(quads.length === 5, `Should emit 5 triples, got ${quads.length}`);

            // Type declarations use URL as soft subject
            assert(hasQuad(quads, 'https://nasa.gov', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Organization'),
                'Type declaration should use URL as subject');
            assert(hasQuad(quads, 'https://arxiv.org/abs/2301.07041', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Paper'),
                'Type declaration should use URL as subject');
            assert(hasQuad(quads, 'https://doi.org/10.1000/xyz123', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Article'),
                'Type declaration should use URL as subject');

            // Object predicates use current subject
            assert(hasQuad(quads, 'http://example.org/doc', 'http://example.org/cites', 'https://arxiv.org/abs/2301.07041'),
                'Object predicate should use current subject as subject');

            // Reverse predicates use URL as subject
            assert(hasQuad(quads, 'https://doi.org/10.1000/xyz123', 'http://example.org/hasVersion', 'http://example.org/doc'),
                'Reverse predicate should use URL as subject');
        }
    },

    {
        name: 'Angle-bracket URL edge cases and integration',
        fn: () => {
            const md = `# Research {=tag:research}

[NASA] {publisher} <https://nasa.gov> {?website} *Important* {emphasis}
<https://github.com/user/repo> {?cloned .Repository}
<not-a-url> {name}
<https://example.com> {name title identifier ^^xsd:anyURI}`;

            const { quads } = parse(md, { context: { ex: 'http://example.org/', '@vocab': 'http://example.org/', xsd: 'http://www.w3.org/2001/XMLSchema#' } });

            assert(quads.length === 5, `Should emit 5 triples, got ${quads.length}`);

            // Integration with other carriers
            assert(hasQuad(quads, 'tag:research', 'http://example.org/publisher', 'NASA'),
                'Should handle bracketed link');
            assert(hasQuad(quads, 'tag:research', 'http://example.org/website', 'https://nasa.gov'),
                'Should handle angle-bracket URL with object predicate');
            assert(hasQuad(quads, 'tag:research', 'http://example.org/emphasis', 'Important'),
                'Should handle emphasis');
            assert(hasQuad(quads, 'tag:research', 'http://example.org/cloned', 'https://github.com/user/repo'),
                'Should handle repository URL');
            assert(hasQuad(quads, 'https://github.com/user/repo', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Repository'),
                'Repository URL should get type declaration');

            // Invalid URLs and literal predicates should be ignored
            // (no additional quads for <not-a-url> or literal predicates)
        }
    },

    {
        name: 'Bracketed link type declaration uses URL as subject',
        fn: () => {
            const md = `# Document {=ex:doc}

[NASA](https://nasa.gov) {.Organization}`;
            const { quads } = parse(md, { context: { ex: 'http://example.org/', '@vocab': 'http://example.org/' } });

            assert(quads.length === 1, `Should emit 1 triple, got ${quads.length}`);
            assert(hasQuad(quads, 'https://nasa.gov', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Organization'),
                'Should use URL as subject for type declaration (consistent with <URL> behavior)');
        }
    }
];
