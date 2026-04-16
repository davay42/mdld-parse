import { parse } from '../src/index.js';

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

export const elevatedStatementTests = [
    // Test 1: Basic elevated statement with IRIs
    {
        name: 'Elevated Statements - Basic pattern with IRIs',
        fn: () => {
            const markdown = `
[ex] <http://example.org/>

## Elevated statement {=ex:stmt1 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *knows* {+ex:knows ?rdf:predicate} **Bob** {+ex:bob ?rdf:object}

**Alice** {=ex:alice} knows **Bob** {?ex:knows +ex:bob}
`;

            const result = parse(markdown);

            assert(result.statements.length === 1, 'Should have 1 elevated statement');

            const elevated = result.statements[0];
            assert(elevated.subject.value === 'http://example.org/alice', 'Subject should be Alice');
            assert(elevated.predicate.value === 'http://example.org/knows', 'Predicate should be knows');
            assert(elevated.object.value === 'http://example.org/bob', 'Object should be Bob');

            // Should have the rdf:Statement pattern quads
            const statementQuads = result.quads.filter(q =>
                q.subject.value === 'http://example.org/stmt1' &&
                q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            );
            assert(statementQuads.length === 1, 'Should have rdf:Statement type quad');
        }
    },

    // Test 2: Elevated statements with datatypes and language tags
    {
        name: 'Elevated Statements - Datatypes and language tags',
        fn: () => {
            const markdown = `
[ex] <http://example.org/>

## Statement with integer datatype {=ex:stmt2 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *has age* {+ex:hasAge ?rdf:predicate} **25** {rdf:object ^^xsd:integer}

## Statement with language tag {=ex:stmt3 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *has name* {+ex:hasName ?rdf:predicate} **Alice** {rdf:object @en}
`;

            const result = parse(markdown);

            assert(result.statements.length === 2, 'Should have 2 elevated statements');

            // Check integer datatype
            const ageStatement = result.statements.find(q => q.predicate.value.endsWith('hasAge'));
            assert(ageStatement.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#integer',
                'Should preserve integer datatype');
            assert(ageStatement.object.value === '25', 'Should preserve literal value');

            // Check language tag
            const nameStatement = result.statements.find(q => q.predicate.value.endsWith('hasName'));
            assert(nameStatement.object.language === 'en', 'Should preserve language tag');
            assert(nameStatement.object.value === 'Alice', 'Should preserve literal value');
        }
    },

    // Test 3: Multiple elevated statements and incomplete patterns
    {
        name: 'Elevated Statements - Multiple and incomplete patterns',
        fn: () => {
            const markdown = `
[ex] <http://example.org/>

## Complete statement 1 {=ex:stmt1 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *knows* {+ex:knows ?rdf:predicate} **Bob** {+ex:bob ?rdf:object}

## Complete statement 2 {=ex:stmt2 .rdf:Statement}
**Charlie** {+ex:charlie ?rdf:subject} *works with* {+ex:works-with ?rdf:predicate} **David** {+ex:david ?rdf:object}

## Incomplete statement {=ex:incomplete .rdf:Statement}
**Eve** {+ex:eve ?rdf:subject} *has age* {+ex:hasAge ?rdf:predicate}
// Missing rdf:object - should not be elevated
`;

            const result = parse(markdown);

            assert(result.statements.length === 2, 'Should have 2 elevated statements (incomplete ignored)');

            const subjects = result.statements.map(q => q.object.value);
            assert(subjects.includes('http://example.org/bob'), 'Should include Bob');
            assert(subjects.includes('http://example.org/david'), 'Should include David');
        }
    },

    // Test 4: Real-world example with tag URIs and FOAF
    {
        name: 'Elevated Statements - Real-world example with tag URIs and FOAF',
        fn: () => {
            const markdown = `
[my] <tag:alice@example.com,2026:>
[foaf] <http://xmlns.com/foaf/0.1/>

My name is **Alice** {=my:Alice .foaf:Person foaf:name}.

Today I have learned that my colleague name is [Clair] {=my:Claire .foaf:Person foaf:name}

## I know Claire's name {=my:claire-name .rdf:Statement}
[My colleague] {+my:Claire ?rdf:subject} [name] {+foaf:name ?rdf:predicate} is [Clair] {rdf:object}.

{=}

## We've talked! {=my:claire-first-talk .rdf:Statement}
Today [I] {+my:Alice ?rdf:subject} came to office a bit earlier and [talked for some time] {+foaf:knows ?rdf:predicate} with [Claire] {+my:Claire ?rdf:object}.

Now **I** {=my:Alice} know **Claire** {+my:Claire ?foaf:knows}.
`;

            const result = parse(markdown);

            assert(result.statements.length === 2, 'Should have 2 elevated statements');

            // Verify tag: IRIs work correctly
            const tagIRIs = result.statements.filter(q => q.subject.value.startsWith('tag:'));
            assert(tagIRIs.length === 2, 'Should have 2 tag: IRIs in elevated statements');

            const predicates = result.statements.map(q => q.predicate.value);
            assert(predicates.includes('http://xmlns.com/foaf/0.1/name'), 'Should include FOAF name predicate');
            assert(predicates.includes('http://xmlns.com/foaf/0.1/knows'), 'Should include FOAF knows predicate');
        }
    }
];
