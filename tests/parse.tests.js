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

[Alice] {=ex:alice ?author}`;
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

[Hello "world"! @#$%] {name}`;
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

    // §11.2 Nested Lists (normative)
    {
        name: 'Nested lists with explicit contexts',
        fn: () => {
            const md = `[ex] <http://example.org/>

## Recipe {=ex:recipe .Recipe name}

Ingredients: {?hasPart .Ingredient name}

- Flour {=ex:flour}
  Variants: {?hasPart .FlourType name}
  - Whole wheat {=ex:flour-whole-wheat .WholeGrainFlour}
    Whole grain includes {?hasPart .GrainPart name}
    - Bran {=ex:grain-bran}
    - Germ {=ex:grain-germ}
    - Endosperm {=ex:grain-endosperm}
  - White {=ex:flour-white title}
- Water {=ex:water}`;

            const { quads } = parse(md);

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
    }
];
