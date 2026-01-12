import { parse, serialize } from './index.js';

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);
    if (actualStr !== expectedStr) {
        throw new Error(`${message || 'Values not equal'}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
    }
}

function findQuad(quads, predicate, objectValue) {
    return quads.find(q =>
        q.predicate.value.includes(predicate) &&
        (objectValue === undefined || q.object.value === objectValue)
    );
}

function findQuads(quads, predicate) {
    return quads.filter(q => q.predicate.value.includes(predicate));
}

// ============================================================================
// REAL-WORLD USE CASES FROM CASUAL.MD AND TESTS.MD
// ============================================================================

test('Personal Journal - Structured Memories', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## 2024-07-18 — A good day {=ex:day-2024-07-18 .Event}

Mood: [Happy] {ex:mood}
Place: [Central Park] {=ex:central-park location}
With: [Sam] {=ex:sam .Person attendee}

Notes:
I walked for hours and felt calm.`;

    const result = parse(md);

    // Validate actual quad objects, not just expected strings
    const moodQuad = findQuad(result.quads, 'mood');
    const locationQuad = findQuad(result.quads, 'location');
    const attendeeQuad = findQuad(result.quads, 'attendee');

    assertEqual(moodQuad?.object.value, 'Happy', 'Mood literal should be "Happy", not full text');
    assertEqual(locationQuad?.object.termType, 'NamedNode', 'Location should be a NamedNode');
    assertEqual(attendeeQuad?.object.termType, 'NamedNode', 'Attendee should be a NamedNode');

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Personal journal with structured memories - mood, location, people',
        expectedTriples: [
            'ex:day-2024-07-18 a schema:Event',
            'ex:day-2024-07-18 ex:mood "Happy"',
            'ex:day-2024-07-18 schema:location ex:central-park',
            'ex:day-2024-07-18 schema:attendee ex:sam',
            'ex:sam a schema:Person'
        ]
    };
});

test('Blockquote Value Carriers', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Document {=ex:doc .Article}

> Simple quote: [Important point] {important}
> [Nested quote] {nested}

> Multi-line quote
> spanning multiple lines {multiline}

> Quote with [link](https://example.com) {reference}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Blockquote value carriers with various annotation patterns',
        expectedTriples: [
            'ex:doc a schema:Article',
            'ex:doc schema:important "Important point"',
            'ex:doc ex:nested "Nested quote"',
            'ex:doc schema:multiline "Multi-line quote spanning multiple lines"',
            'ex:doc ex:reference <https://example.com>'
        ]
    };
});

test('Blockquote Edge Cases', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Test {=ex:test .Document}

> Empty quote {} {empty}
> [Text only] {noAttrs}
> [With multiple] {prop1 prop2}
> [Mixed content] {prop ^^xsd:string}
> [Link](https://example.com) {ref} and text`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Blockquote edge cases - empty, multiple annotations, datatypes',
        expectedTriples: [
            'ex:test a schema:Document',
            'ex:test ex:empty ""',
            'ex:test ex:noAttrs "Text only"',
            'ex:test ex:prop1 "With multiple"',
            'ex:test ex:prop2 "With multiple"',
            'ex:test ex:prop "Mixed content"^^xsd:string',
            'ex:test ex:ref <https://example.com>',
            'ex:test schema:reference "Link and text"'
        ]
    };
});

test('Nested Blockquote Structures', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Complex {=ex:complex .Document}

> Level 1 quote: [Content] {level1}
>> Level 2 quote: [Nested] {level2}
>>> Level 3 quote: [Deep nested] {level3}

> Mixed content with [emphasis] {emphasis} and **strong** {strong}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Nested blockquotes with multiple levels and inline formatting',
        expectedTriples: [
            'ex:complex a schema:Document',
            'ex:complex ex:level1 "Content"',
            'ex:complex ex:level2 "Nested"',
            'ex:complex ex:level3 "Deep nested"',
            'ex:complex ex:emphasis "emphasis"',
            'ex:complex ex:strong "strong"'
        ]
    };
});

test('Complex Nested Annotations', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Edge Cases {=ex:edge .Document}

> [Value 1] {prop1 ^^xsd:integer} [Value 2] {prop2 ^^xsd:string}
> [Single span] {multiple .Type propA propB}
> [Empty] {} {invalid}
> [Valid] {correct .Type} [Invalid] {invalid .Type}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Complex nested annotations and edge cases',
        expectedTriples: [
            'ex:edge a schema:Document',
            'ex:edge ex:prop1 "Value 1"^^xsd:integer',
            'ex:edge ex:prop2 "Value 2"^^xsd:string',
            'ex:edge ex:multiple a ex:Type',
            'ex:edge ex:propA "Single span"',
            'ex:edge ex:propB "Single span"',
            'ex:edge ex:invalid ""',
            'ex:edge ex:correct a ex:Type',
            'ex:edge ex:invalid a ex:Type'
        ]
    };
});

test('Performance and Error Recovery', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Stress Test {=ex:stress .Document}

${Array(100).fill(0).map((_, i) => `> Large blockquote [${i}] {content ${i}}`).join('\n')}

> [Valid content] {valid}
> [Malformed content] {invalid .Type}
> [Unclosed quote [missing end] {broken}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Performance stress test and error recovery scenarios',
        expectedTriples: [
            'Should parse 100 blockquotes without errors',
            'ex:stress ex:valid "Valid content"',
            'Should handle malformed annotations gracefully',
            'Should recover from unclosed quotes'
        ]
    };
});

test('Nested Blockquote Structures', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Complex {=ex:complex .Document}

> Level 1 quote: [Content] {level1}
>> Level 2 quote: [Nested] {level2}
>>> Level 3 quote: [Deep nested] {level3}

> Mixed content with [emphasis] {emphasis} and **strong** {strong}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Nested blockquotes with multiple levels and inline formatting',
        expectedTriples: [
            'ex:complex a schema:Document',
            'ex:complex ex:level1 "Content"',
            'ex:complex ex:level2 "Nested"',
            'ex:complex ex:level3 "Deep nested"',
            'ex:complex ex:emphasis "emphasis"',
            'ex:complex ex:strong "strong"'
        ]
    };
});

test('Apollo 11 Mission', () => {
    const md = `[@vocab] {: http://schema.org/}
[wd] {: https://www.wikidata.org/entity/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Apollo 11 {=wd:Q43653 .SpaceMission}

Launch year: [1969] {startDate ^^xsd:gYear}
Landing date: [1969-07-20] {endDate ^^xsd:date}
Mission name: [Apollo 11] {name}
Description: [First moon landing] {description}`;

    const result = parse(md, { context: { wd: 'https://www.wikidata.org/entity/' } });

    // Test literal value extraction from spans
    const startYearQuad = findQuad(result.quads, 'startDate');
    const endDateQuad = findQuad(result.quads, 'endDate');
    const nameQuad = findQuad(result.quads, 'name');
    const descriptionQuad = findQuad(result.quads, 'description');

    // Critical: Should extract span text, not full markdown
    assertEqual(startYearQuad?.object.value, '1969', 'Should extract "1969" from [1969], not full text');
    assertEqual(endDateQuad?.object.value, '1969-07-20', 'Should extract "1969-07-20" from [1969-07-20], not full text');
    assertEqual(nameQuad?.object.value, 'Apollo 11', 'Should extract "Apollo 11" from span');
    assertEqual(descriptionQuad?.object.value, 'First moon landing', 'Should extract description from span');

    // Test datatypes are properly applied
    assertEqual(startYearQuad?.object.datatype?.value, 'http://www.w3.org/2001/XMLSchema#gYear', 'Should apply gYear datatype');
    assertEqual(endDateQuad?.object.datatype?.value, 'http://www.w3.org/2001/XMLSchema#date', 'Should apply date datatype');
    assertEqual(nameQuad?.object.datatype?.value, 'http://www.w3.org/2001/XMLSchema#string', 'Should default to string datatype');
    assertEqual(descriptionQuad?.object.datatype?.value, 'http://www.w3.org/2001/XMLSchema#string', 'Should default to string datatype');

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Critical test for literal value extraction and datatype application',
        expectedTriples: [
            'wd:Q43653 a schema:SpaceMission',
            'wd:Q43653 schema:startDate "1969"^^xsd:gYear',
            'wd:Q43653 schema:endDate "1969-07-20"^^xsd:date',
            'wd:Q43653 schema:name "Apollo 11"',
            'wd:Q43653 schema:description "First moon landing"'
        ]
    };
});

test('Family Recipe - Ingredients with Types', () => {
    const md = `[@vocab] {: http://schema.org/}
        [ex] {: http://example.org/}
            [xsd] {: http://www.w3.org/2001/XMLSchema#}

## Apple Pie {=ex: apple - pie.Recipe }

                Ingredients: { recipeIngredient.Food }
                - Apples {=ex:apples name }
                - Sugar {=ex:sugar name }
                - Butter {=ex:butter name }

Baking time: [45] { cookTime ^^ xsd: integer } `;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Family recipe with structured ingredients and typed data',
        expectedTriples: [
            'ex:apple-pie a schema:Recipe',
            'ex:apple-pie schema:recipeIngredient ex:apples , ex:sugar , ex:butter',
            'ex:apple-pie schema:cookTime "45"^^xsd:integer',
            'ex:apples a schema:Food',
            'ex:sugar a schema:Food',
            'ex:butter a schema:Food'
        ]
    };
});

test('Book Club Notes - Ratings and Reviews', () => {
    const md = `[@vocab] {: http://schema.org/}
                    [ex] {: http://example.org/}

## Book Club — June {=ex: bookclub - june.Event }

                        Book: [Dune] {=ex: dune.Book name }
                        Rating: [5] { ex: rating }
                        Comment: ** Mind - blowing world building ** { reviewBody }`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Book club with structured ratings and reviews',
        expectedTriples: [
            'ex:bookclub-june a schema:Event',
            'ex:bookclub-june ex:rating "5"',
            'ex:bookclub-june schema:reviewBody "Mind-blowing world building"',
            'ex:dune a schema:Book',
            'ex:dune schema:name "Dune"'
        ]
    };
});

test('Household Expenses - Financial Tracking', () => {
    const md = `[@vocab] {: http://schema.org/}
                            [ex] {: http://example.org/}
                                [xsd] {: http://www.w3.org/2001/XMLSchema#}

## Saturday errands {=ex: errands - 1 .Event }

                                    Bought[Groceries] {=ex: groceries.Product }
                                    Cost: [42.30] { price ^^ xsd: decimal }
                                    Store: [Local Market] { seller } `;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Household expense tracking with typed financial data',
        expectedTriples: [
            'ex:errands-1 a schema:Event',
            'ex:errands-1 schema:object ex:groceries',
            'ex:errands-1 schema:price "42.30"^^xsd:decimal',
            'ex:errands-1 schema:seller "Local Market"',
            'ex:groceries a schema:Product'
        ]
    };
});

test('Travel Notes - External Links with Labels', () => {
    const md = `[@vocab] {: http://schema.org/}

## Berlin trip {=ex: berlin - trip.Trip }

                                        Visited[Berlin](https://en.wikipedia.org/wiki/Berlin)
                                            { location rdfs: label "Berlin"@en }`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Travel notes with external links and multilingual labels',
        expectedTriples: [
            'ex:berlin-trip a schema:Trip',
            'ex:berlin-trip schema:location <https://en.wikipedia.org/wiki/Berlin>',
            '<https://en.wikipedia.org/wiki/Berlin> rdfs:label "Berlin"@en'
        ]
    };
});

test('Developer Documentation - Code as Knowledge', () => {
    const md = `[@vocab] {: http://schema.org/}
                                            [ex] {: http://example.org/}

## Parsing idea {=ex: idea - 1 .CreativeWork }

                                            \`\`\`js {=ex:code-snippet-1 schema:text schema:programmingLanguage "JavaScript"}
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-')
}
\`\`\``;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Developer documentation with code blocks as structured knowledge',
        expectedTriples: [
            'ex:idea-1 a schema:CreativeWork',
            'ex:code-snippet-1 schema:text "function slugify(text) { ... }"',
            'ex:code-snippet-1 schema:programmingLanguage "JavaScript"'
        ]
    };
});

test('Project Management - Todo Lists as Graphs', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Weekend goals {=ex:weekend-goals .Project}

Tasks: {hasPart .Action}
- Clean kitchen {=ex:task-clean}
- Fix bike {=ex:task-bike}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Project management with todo lists becoming structured graphs',
        expectedTriples: [
            'ex:weekend-goals a schema:Project',
            'ex:weekend-goals schema:hasPart ex:task-clean , ex:task-bike',
            'ex:task-clean a schema:Action',
            'ex:task-bike a schema:Action'
        ]
    };
});

test('Apollo Mission - Complex Project Structure', () => {
    const md = `[@vocab] {: http://schema.org/}
[wd] {: https://www.wikidata.org/entity/}
[ex] {: http://example.org/}

# Apollo 11 {=wd:Q43653 .SpaceMission}

Launch year: [1969] {startDate ^^xsd:gYear}
Landing date: [1969-07-20] {endDate ^^xsd:date}

Crew: {hasPart .Person}
- Neil Armstrong {=wd:Q1615}
- Buzz Aldrin {=wd:Q2252}
- Michael Collins {=wd:Q298}

Components: {hasPart .Vehicle}
- Command Module {=ex:command-module}
- Lunar Module {=ex:lunar-module}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Complex project structure with crew, components, and typed dates',
        expectedTriples: [
            'wd:Q43653 a schema:SpaceMission',
            'wd:Q43653 schema:startDate "1969"^^xsd:gYear',
            'wd:Q43653 schema:endDate "1969-07-20"^^xsd:date',
            'wd:Q43653 schema:hasPart wd:Q1615 , wd:Q2252 , wd:Q298 , ex:command-module , ex:lunar-module',
            'wd:Q1615 a schema:Person',
            'wd:Q2252 a schema:Person',
            'wd:Q298 a schema:Person',
            'ex:command-module a schema:Vehicle',
            'ex:lunar-module a schema:Vehicle'
        ]
    };
});

test('Multilingual Recipe - Language Tags', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Pancake Recipe {=ex:recipe-pancake .Recipe}

Ingredients: {hasPart .Ingredient}

- Flour {=ex:flour name @en name "Mehl"@de}
  Amount: [200] {quantity ^^xsd:integer}
  Unit: [grams] {unitText}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Multilingual recipe with language tags and typed quantities',
        expectedTriples: [
            'ex:recipe-pancake a schema:Recipe',
            'ex:recipe-pancake schema:hasPart ex:flour',
            'ex:flour a schema:Ingredient',
            'ex:flour schema:name "Flour"@en',
            'ex:flour schema:name "Mehl"@de',
            'ex:flour schema:quantity "200"^^xsd:integer',
            'ex:flour schema:unitText "grams"'
        ]
    };
});

test('Shopping List - Financial Data', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Grocery Shopping — Saturday {=ex:purchase-2025-01-10 .Purchase}

Items: {hasPart .Product}

- Organic apples {=ex:apples}
  Price: [3.99] {price ^^xsd:decimal}
  Currency: [EUR] {priceCurrency}
  Quantity: [1.5] {weight ^^xsd:decimal}
  Unit: [kg] {unitText}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Shopping list with detailed financial and quantity data',
        expectedTriples: [
            'ex:purchase-2025-01-10 a schema:Purchase',
            'ex:purchase-2025-01-10 schema:hasPart ex:apples',
            'ex:apples a schema:Product',
            'ex:apples schema:price "3.99"^^xsd:decimal',
            'ex:apples schema:priceCurrency "EUR"',
            'ex:apples schema:weight "1.5"^^xsd:decimal',
            'ex:apples schema:unitText "kg"'
        ]
    };
});

test('SPARQL Queries - Code as Structured Knowledge', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## SPARQL Discovery Queries {=ex:sparql-discovery .Collection}

### List all subjects with labels

\`\`\`sparql {=ex:q-subject-labels .SoftwareSourceCode schema:text schema:programmingLanguage "SPARQL"}
SELECT DISTINCT ?s ?label WHERE {
  ?s ?p ?o .
  OPTIONAL { ?s rdfs:label ?label }
}
\`\`\``;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'SPARQL queries as structured software source code',
        expectedTriples: [
            'ex:sparql-discovery a schema:Collection',
            'ex:q-subject-labels a schema:SoftwareSourceCode',
            'ex:q-subject-labels schema:text "SELECT DISTINCT ?s ?label WHERE { ... }"',
            'ex:q-subject-labels schema:programmingLanguage "SPARQL"'
        ]
    };
});

test('Medical Report - SHACL Validation Rules', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}
[sh] {: http://www.w3.org/ns/shacl#}
[xsd] {: http://www.w3.org/2001/XMLSchema#}

## Blood Test Report {=ex:report1 .MedicalTest}

Patient: [Alice] {=ex:alice .Person name}

Measurements: {hasPart .MedicalTest}

- Hemoglobin {=ex:hgb}
  Value: [13.5] {value ^^xsd:decimal}
  Unit: [g/dL] {unitText}

---

## Validation Rules {=ex:lab-shapes .sh:NodeShape}

Target: [Lab Measurement] {sh:targetClass ex:LabMeasurement}

Property constraints: {sh:property}

- Hemoglobin value shape {=ex:hgb-value-shape}
  Path: [value] {sh:path}
  Datatype: [decimal] {sh:datatype xsd:decimal}
  Min: [12.0] {sh:minInclusive ^^xsd:decimal}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Medical report with SHACL validation rules',
        expectedTriples: [
            'ex:report1 a schema:MedicalTest',
            'ex:report1 schema:hasPart ex:hgb',
            'ex:alice a schema:Person',
            'ex:alice schema:name "Alice"',
            'ex:hgb a schema:MedicalTest',
            'ex:hgb schema:value "13.5"^^xsd:decimal',
            'ex:hgb schema:unitText "g/dL"',
            'ex:lab-shapes a sh:NodeShape',
            'ex:lab-shapes sh:targetClass ex:LabMeasurement',
            'ex:lab-shapes sh:property ex:hgb-value-shape',
            'ex:hgb-value-shape sh:path schema:value',
            'ex:hgb-value-shape sh:datatype xsd:decimal',
            'ex:hgb-value-shape sh:minInclusive "12.0"^^xsd:decimal'
        ]
    };
});

// ============================================================================
// CORE SPEC FEATURES - Essential MD-LD Functionality
// ============================================================================

test('Basic Subject Declaration and Types', () => {
    const md = `## Person {=ex:alice .Person .Agent}
Name: [Alice] {name}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Basic subject declaration with multiple types and properties',
        expectedTriples: [
            'ex:alice a schema:Person',
            'ex:alice a schema:Agent',
            'ex:alice schema:name "Alice"'
        ]
    };
});

test('Reverse Properties - Part-of Relationships', () => {
    const md = `## Document {=ex:doc}
\`\`\`javascript {=ex:codeblock ^hasPart}
console.log('test');
\`\`\``;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Reverse properties showing part-of relationships',
        expectedTriples: [
            'ex:doc schema:hasPart ex:codeblock'
        ]
    };
});

test('Fragment Identifiers and URLs', () => {
    const md = `## Section1 {=#section1}
## External {=https://example.org/external}
## Prefixed {=ex:prefixed}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Different IRI types: fragments, absolute URLs, prefixed',
        expectedTriples: [] // Subject declarations only, no properties
    };
});

test('Subject Context Persistence', () => {
    const md = `## Main {=ex:main}
[Item 1] {property}
[Item 2] {property}
## New Section {=ex:new}
[Item 3] {property}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Subject context persists until explicitly changed',
        expectedTriples: [
            'ex:main schema:property "Item 1"',
            'ex:main schema:property "Item 2"',
            'ex:new schema:property "Item 3"'
        ]
    };
});

test('Mixed Inline Annotations', () => {
    const md = `## Context {=ex:ctx}
[Alice](ex:alice) {author collaborator .Person .Agent}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Mixed inline annotations with properties and types',
        expectedTriples: [
            'ex:ctx schema:author ex:alice',
            'ex:ctx schema:collaborator ex:alice',
            'ex:alice a schema:Person',
            'ex:alice a schema:Agent'
        ]
    };
});

test('Prefix Declarations', () => {
    const md = `[ex] {: http://example.org/}
[schema] {: http://schema.org/}

## Thing {=ex:thing .schema:Person}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Prefix declarations affecting subsequent parsing',
        expectedTriples: [
            'ex:thing a schema:Person'
        ]
    };
});

test('Empty and Malformed Annotations', () => {
    const md = `## Empty {}
## Malformed {invalid
## Valid {=ex:valid}`;

    const result = parse(md);

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: result.text
        },
        description: 'Graceful handling of empty and malformed annotations',
        expectedTriples: [] // Only valid subject declaration
    };
});

// ============================================================================
// SERIALIZATION AND ROUND-TRIP
// ============================================================================

test('Serialize Round-trip - Basic', () => {
    const md = `## Test {=ex:test}
[Value] {property}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });
    const serialized = serialize({ ...result, text: md });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized
        },
        description: 'Basic serialization preserves structure and can round-trip',
        expectedTriples: [
            'ex:test schema:property "Value"'
        ]
    };
});

test('Serialize Round-trip - Delete Quad', () => {
    const md = `## Test {=ex:test}
[Value1] {property1}
[Value2] {property2}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    // Delete one quad
    const diff = { delete: [result.quads[0]] };
    const serialized = serialize({ ...result, text: md, diff });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized,
            diff: diff
        },
        description: 'Serialization can delete specific quads',
        expectedTriples: [
            'ex:test schema:property1 "Value1"',
            'ex:test schema:property2 "Value2"'
        ]
    };
});

test('Serialize Round-trip - Add Quad', () => {
    const md = `## Test {=ex:test}
[Value1] {property1}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    // Add a new quad
    const newQuad = {
        subject: { termType: 'NamedNode', value: 'http://example.org/test' },
        predicate: { termType: 'NamedNode', value: 'http://schema.org/property2' },
        object: { termType: 'Literal', value: 'Value2', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
    };

    const diff = { add: [newQuad] };
    const serialized = serialize({ ...result, text: md, diff });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized,
            diff: diff
        },
        description: 'Serialization can add new quads',
        expectedTriples: [
            'ex:test schema:property1 "Value1"'
        ]
    };
});

test('Serialize Round-trip - Add and Delete Multiple', () => {
    const md = `## Test {=ex:test}
[Value1] {property1}
[Value2] {property2}
[Value3] {property3}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    // Delete one quad, add two new ones
    const diff = {
        delete: [result.quads[1]], // Delete property2
        add: [
            {
                subject: { termType: 'NamedNode', value: 'http://example.org/test' },
                predicate: { termType: 'NamedNode', value: 'http://schema.org/property4' },
                object: { termType: 'Literal', value: 'Value4', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
            },
            {
                subject: { termType: 'NamedNode', value: 'http://example.org/test' },
                predicate: { termType: 'NamedNode', value: 'http://schema.org/property5' },
                object: { termType: 'Literal', value: 'Value5', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' } }
            }
        ]
    };

    const serialized = serialize({ ...result, text: md, diff });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized,
            diff: diff
        },
        description: 'Serialization can handle multiple add and delete operations',
        expectedTriples: [
            'ex:test schema:property1 "Value1"',
            'ex:test schema:property2 "Value2"',
            'ex:test schema:property3 "Value3"'
        ]
    };
});

test('Serialize Round-trip - Complex Document', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

## Document {=ex:doc .CreativeWork}
Title: [My Document] {name}
Author: [Alice] {=ex:alice .Person author}

## Section {=ex:section}
Content: [Some content] {text}`;

    const result = parse(md);

    // Add a new property and delete one
    const diff = {
        delete: result.quads.filter(q => q.predicate.value.includes('text')),
        add: [
            {
                subject: { termType: 'NamedNode', value: 'http://example.org/doc' },
                predicate: { termType: 'NamedNode', value: 'http://schema.org/dateCreated' },
                object: { termType: 'Literal', value: '2024-01-15', datatype: { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#date' } }
            }
        ]
    };

    const serialized = serialize({ ...result, text: md, diff });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized,
            diff: diff
        },
        description: 'Complex document round-trip with multiple subjects and types',
        expectedTriples: [
            'ex:doc a schema:CreativeWork',
            'ex:doc schema:name "My Document"',
            'ex:doc schema:author ex:alice',
            'ex:alice a schema:Person',
            'ex:section schema:text "Some content"'
        ]
    };
});

test('Serialize Round-trip - No Changes', () => {
    const md = `## Test {=ex:test .Document}
[Value] {property}`;

    const result = parse(md, { context: { ex: 'http://example.org/' } });

    // No diff - should return original
    const serialized = serialize({ ...result, text: md });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized
        },
        description: 'Serialization with no changes returns original text',
        expectedTriples: [
            {
                subject: 'http://example.org/test',
                predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                object: 'http://schema.org/Document'
            },
            {
                subject: 'http://example.org/test',
                predicate: 'http://example.org/property',
                object: 'Value'
            }
        ]
    };
});

test('Serialize Round-trip - IRI Shortening with Context', () => {
    const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}

# Document {=ex:doc .CreativeWork}
[Original Title] {ex:title}`;

    const result = parse(md);

    // Add quads that should be shortened with context
    const newQuads = [
        {
            subject: { termType: 'NamedNode', value: 'http://example.org/doc' },
            predicate: { termType: 'NamedNode', value: 'http://schema.org/dateCreated' },
            object: { termType: 'Literal', value: '2024-01-01' }
        },
        {
            subject: { termType: 'NamedNode', value: 'http://example.org/doc' },
            predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
            object: { termType: 'NamedNode', value: 'http://schema.org/Article' }
        },
        {
            subject: { termType: 'NamedNode', value: 'http://example.org/doc' },
            predicate: { termType: 'NamedNode', value: 'http://example.org/relatedTo' },
            object: { termType: 'NamedNode', value: 'http://example.org/other' }
        }
    ];

    const serialized = serialize({
        text: md,
        diff: { add: newQuads },
        origin: result.origin,
        options: { context: result.context }  // Pass context for proper IRI shortening
    });

    return {
        input: md,
        output: {
            quads: result.quads,
            origin: result.origin,
            context: result.context,
            text: md,
            serialized: serialized.text,
            addedQuads: newQuads
        },
        description: 'Serialization with context properly shortens IRIs using @vocab and prefixes',
        expectedTriples: [
            {
                subject: 'http://example.org/doc',
                predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                object: 'http://schema.org/CreativeWork'
            },
            {
                subject: 'http://example.org/doc',
                predicate: 'http://example.org/title',
                object: 'Original Title'
            }
        ]
    };
});

// ============================================================================
// RUN ALL TESTS AND EXPORT RESULTS
// ============================================================================

async function runTests() {
    console.log('# MD-LD v0.2 Real-World Test Suite');
    console.log('# Focused on spec compliance and major use cases\n');

    const results = [];

    for (const { name, fn } of tests) {
        try {
            const result = fn();
            results.push({ name, status: 'passed', ...result });
            passed++;
            console.log(`✓ ${name}`);
        } catch (error) {
            results.push({ name, status: 'failed', error: error.message });
            failed++;
            console.log(`✗ ${name}`);
            console.log(`  Error: ${error.message}`);
        }
    }

    console.log(`\n-------------------`);
    console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total`);

    return results;
}

// Export for use in HTML playground
export { runTests, tests };

// Auto-run if executed directly in Node.js
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}
