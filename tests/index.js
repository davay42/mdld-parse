import { parseTests } from './parse.tests.js';
import { serializeTests } from './serialize.tests.js';
import { tagIriTests } from './tag-iri.tests.js';
import { orderedListsTests } from './ordered-lists.tests.js';
// import { comprehensiveOriginTests } from './comprehensive-origin.tests.js';

// Combine all test suites
const tests = [
    ...parseTests,
    ...serializeTests,
    ...tagIriTests,
    ...orderedListsTests,
    // ...comprehensiveOriginTests
];

// Run tests
let passed = 0;
let failed = 0;

async function runTests() {
    console.log('# MD-LD Specification Test Suite\n');

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
