import { merge, parse } from '../src/index.js';

// Test helpers
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Helper function to create a quad key for comparison
function quadKey(quad) {
    const datatype = quad.object.datatype?.value || '';
    const language = quad.object.language || '';
    return `${quad.subject.value}|${quad.predicate.value}|${quad.object.value}|${datatype}|${language}`;
}

// Helper to check if quad exists in array
function hasQuad(quads, subject, predicate, object) {
    return quads.some(q =>
        q.subject.value === subject &&
        q.predicate.value === predicate &&
        q.object.value === object
    );
}

export const mergeTests = [
    // §17 Primary Subject - Merge
    {
        name: 'Primary subjects - single document',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Alice] {my:name}`;

            const result = merge([md],);

            assert(result.primarySubjects.length === 1,
                `Should have 1 primary subject, got ${result.primarySubjects.length}`);
            assert(result.primarySubjects[0] === 'tag:hr@example.com,2026:emp456',
                `Primary subject should be my:emp456, got ${result.primarySubjects[0]}`);
        }
    },

    {
        name: 'Primary subjects - multiple documents',
        fn: () => {
            const doc1 = `[ex] <http://example.org/>
# Doc1 {=ex:doc1}
[Value] {label}`;

            const doc2 = `[ex] <http://example.org/>
# Doc2 {=ex:doc2}
[Value] {label}`;

            const result = merge([doc1, doc2],);

            assert(result.primarySubjects.length === 2,
                `Should have 2 primary subjects, got ${result.primarySubjects.length}`);
            assert(result.primarySubjects[0] === 'http://example.org/doc1',
                `First primary subject should be ex:doc1, got ${result.primarySubjects[0]}`);
            assert(result.primarySubjects[1] === 'http://example.org/doc2',
                `Second primary subject should be ex:doc2, got ${result.primarySubjects[1]}`);
        }
    },

    {
        name: 'Primary subjects - document with no primary subject',
        fn: () => {
            const doc1 = `[ex] <http://example.org/>
# Doc1 {=ex:doc1}
[Value] {label}`;

            const doc2 = `[Value] {label}`;

            const result = merge([doc1, doc2],);

            assert(result.primarySubjects.length === 1,
                `Should have 1 primary subject (doc2 has none), got ${result.primarySubjects.length}`);
            assert(result.primarySubjects[0] === 'http://example.org/doc1',
                `Primary subject should be ex:doc1, got ${result.primarySubjects[0]}`);
        }
    },

    {
        name: 'Primary subjects - ParseResult input',
        fn: () => {
            const doc1 = parse(`[ex] <http://example.org/>
# Doc1 {=ex:doc1}
[Value] {label}`, { context: { ex: 'http://example.org/' } });

            const doc2 = parse(`[ex] <http://example.org/>
# Doc2 {=ex:doc2}
[Value] {label}`, { context: { ex: 'http://example.org/' } });

            const result = merge([doc1, doc2],);

            assert(result.primarySubjects.length === 2,
                `Should have 2 primary subjects, got ${result.primarySubjects.length}`);
            assert(result.primarySubjects[0] === 'http://example.org/doc1',
                `First primary subject should be ex:doc1, got ${result.primarySubjects[0]}`);
            assert(result.primarySubjects[1] === 'http://example.org/doc2',
                `Second primary subject should be ex:doc2, got ${result.primarySubjects[1]}`);
        }
    },

    {
        name: 'Single document — equivalence to parse()',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Alice] {my:name}>`;

            const result = merge([md],);

            assert(result.quads.length === parse(md,).quads.length,
                `Merge quads length ${result.quads.length} should equal parse quads length ${parse(md,).quads.length}`);
            assert(result.remove.length === 0,
                `Merge remove should be empty, got ${result.remove.length}`);
            assert(result.origin.documents.length === 1,
                `Should have 1 document, got ${result.origin.documents.length}`);
        }
    },

    {
        name: 'Single document with appended diff — primary use case',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}

---

# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`;

            const result = merge([md],);

            assert(result.quads.length === 2, `Should have 2 quads, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:Employee'),
                'Should have Employee type');
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'tag:hr@example.com,2026:jobTitle', 'Senior Software Engineer'),
                'Should have Senior Engineer title');
            assert(result.remove.length === 0, `Remove should be empty, got ${result.remove.length}`);
        }
    },

    {
        name: 'Single document — external retract',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`;

            const result = merge([md],);

            assert(result.quads.length === 1, `Should have 1 quad, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'tag:hr@example.com,2026:jobTitle', 'Senior Software Engineer'),
                'Should have Senior Engineer title');
            assert(result.remove.length === 1, `Should have 1 remove, got ${result.remove.length}`);
            assert(hasQuad(result.remove, 'tag:hr@example.com,2026:emp456', 'tag:hr@example.com,2026:jobTitle', 'Software Engineer'),
                'Should remove Software Engineer title');
        }
    },

    {
        name: 'Two documents — inter-document cancel',
        fn: () => {
            const doc1 = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Software Engineer] {my:jobTitle}`;

            const doc2 = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`;

            const result = merge([doc1, doc2],);

            assert(result.quads.length === 2, `Should have 2 quads, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:Employee'),
                'Should have Employee type');
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'tag:hr@example.com,2026:jobTitle', 'Senior Software Engineer'),
                'Should have Senior Engineer title');
            assert(result.remove.length === 0, `Remove should be empty, got ${result.remove.length}`);
            assert(result.origin.documents.length === 2, `Should have 2 documents, got ${result.origin.documents.length}`);
        }
    },

    {
        name: 'Type migration — single annotation',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Project {=my:proj .my:ActiveProject}
# Project {=my:proj -.my:ActiveProject .my:ArchivedProject}`;

            const result = merge([md],);

            assert(result.quads.length === 1, `Should have 1 quad, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:proj', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:ArchivedProject'),
                'Should have ArchivedProject type');
            assert(!hasQuad(result.quads, 'tag:hr@example.com,2026:proj', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:ActiveProject'),
                'Should not have ActiveProject type');
            assert(result.remove.length === 0, `Remove should be empty, got ${result.remove.length}`);
        }
    },

    {
        name: 'Type migration — with prior assertion in same document',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Project {=my:proj .my:ActiveProject}
# Project {=my:proj -.my:ActiveProject .my:ArchivedProject}`;

            const result = merge([md],);

            assert(result.quads.length === 1, `Should have 1 quad, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:proj', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:ArchivedProject'),
                'Should have ArchivedProject type');
            assert(!hasQuad(result.quads, 'tag:hr@example.com,2026:proj', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:ActiveProject'),
                'Should not have ActiveProject type');
            assert(result.remove.length === 0, `Remove should be empty, got ${result.remove.length}`);
        }
    },

    {
        name: 'ParseResult passthrough — no re-parse',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}
[Alice] {my:name}`;

            const parsed = parse(md, { context: { my: 'tag:hr@example.com,2026:' } });
            const result = merge([parsed, md], { context: { my: 'tag:hr@example.com,2026:' } });

            assert(result.origin.documents.length === 2, `Should have 2 documents, got ${result.origin.documents.length}`);
            assert(result.origin.documents[0].input === 'ParseResult',
                `First document should be ParseResult, got ${result.origin.documents[0].input}`);
            assert(result.origin.documents[1].input === 'string',
                `Second document should be string, got ${result.origin.documents[1].input}`);
        }
    },

    {
        name: 'Hard invariant — quads ∩ remove = ∅',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {my:jobTitle}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`;

            const result = merge([md],);

            // Check that no quad appears in both arrays
            const quadKeys = new Set();
            result.quads.forEach(q => quadKeys.add(quadKey(q)));

            let overlap = false;
            result.remove.forEach(q => {
                if (quadKeys.has(quadKey(q))) {
                    overlap = true;
                }
            });

            assert(!overlap, 'Hard invariant violated: quads ∩ remove should be empty');
        }
    },

    {
        name: 'Four-document replay chain',
        fn: () => {
            const genesis = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456 .my:Employee}`;

            const promotion = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Junior Software Engineer] {my:jobTitle}`;

            const reorg = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Junior Software Engineer] {-my:jobTitle}
[Software Engineer] {my:jobTitle}`;

            const salaryUpdate = `[my] <tag:hr@example.com,2026:>
# Employee {=my:emp456}
[Software Engineer] {-my:jobTitle}
[Senior Software Engineer] {my:jobTitle}`;

            const result = merge([genesis, promotion, reorg, salaryUpdate],
            );

            assert(result.quads.length === 2, `Should have 2 quads, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:Employee'),
                'Should have Employee type');
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:emp456', 'tag:hr@example.com,2026:jobTitle', 'Senior Software Engineer'),
                'Should have Senior Engineer title');
            assert(result.origin.documents.length === 4, `Should have 4 documents, got ${result.origin.documents.length}`);
        }
    },

    {
        name: 'Mixed polarity in single annotation',
        fn: () => {
            const md = `[my] <tag:hr@example.com,2026:>
# Doc {=my:doc -.my:Draft .my:Published -my:version}
[2.0] {my:version}`;

            const result = merge([md],);

            assert(result.quads.length === 2, `Should have 2 quads, got ${result.quads.length}`);
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'tag:hr@example.com,2026:Published'),
                'Should have Published type');
            assert(hasQuad(result.quads, 'tag:hr@example.com,2026:doc', 'tag:hr@example.com,2026:version', '2.0'),
                'Should have version 2.0');
        }
    },

    {
        name: 'Statements merging',
        fn: () => {
            const doc1 = `[ex] <http://example.org/>

## Statement 1 {=ex:stmt1 .rdf:Statement}
**Alice** {+ex:alice ?rdf:subject} *knows* {+ex:knows ?rdf:predicate} **Bob** {+ex:bob ?rdf:object}

**Alice** {=ex:alice} knows **Bob** {?ex:knows +ex:bob}`;

            const doc2 = `[ex] <http://example.org/>

## Statement 2 {=ex:stmt2 .rdf:Statement}
**Charlie** {+ex:charlie ?rdf:subject} *works with* {+ex:works-with ?rdf:predicate} **David** {+ex:david ?rdf:object}

**Charlie** {=ex:charlie} works with **David** {?ex:works-with +ex:david}`;

            const result = merge([doc1, doc2]);

            assert(result.statements.length === 2, `Should have 2 statements, got ${result.statements.length}`);

            // Verify statement content
            const aliceKnowsBob = result.statements.find(s =>
                s.subject.value === 'http://example.org/alice' &&
                s.predicate.value === 'http://example.org/knows' &&
                s.object.value === 'http://example.org/bob'
            );

            const charlieWorksDavid = result.statements.find(s =>
                s.subject.value === 'http://example.org/charlie' &&
                s.predicate.value === 'http://example.org/works-with' &&
                s.object.value === 'http://example.org/david'
            );

            assert(aliceKnowsBob, 'Should have Alice knows Bob statement');
            assert(charlieWorksDavid, 'Should have Charlie works with David statement');

            // Verify origin tracking
            assert(result.origin.documents[0].statementsCount === 1, 'Document 1 should have 1 statement');
            assert(result.origin.documents[1].statementsCount === 1, 'Document 2 should have 1 statement');
        }
    },

    {
        name: 'Context accumulation across documents',
        fn: () => {
            const doc1 = `[ex1] <http://example.org/1/>
# Person {=ex1:alice}
[Alice] {ex1:name}`;

            const doc2 = `[ex2] <http://example.org/2/>
# Person {=ex2:bob}
[Bob] {ex2:name}`;

            const result = merge([doc1, doc2]);

            // Should have both prefixes in context
            assert(result.context.ex1 === 'http://example.org/1/',
                `Should have ex1 prefix, got ${JSON.stringify(result.context)}`);
            assert(result.context.ex2 === 'http://example.org/2/',
                `Should have ex2 prefix, got ${JSON.stringify(result.context)}`);

            // Should have both quads
            assert(result.quads.length === 2, `Should have 2 quads, got ${result.quads.length}`);
        }
    }
];
