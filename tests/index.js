import { parseTests } from './parse.tests.js';
import { locateTests } from './locate.tests.js';
import { mergeTests } from './merge.tests.js';
import { originLeanTests } from './origin-lean.tests.js';
import { elevatedStatementTests } from './elevated-statements.tests.js';

const tests = [
    ...parseTests,
    ...locateTests,
    ...mergeTests,
    ...originLeanTests,
    ...elevatedStatementTests,
];

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
