import { parseTests } from './parse.tests.js';
import { locateTests } from './locate.tests.js';
import { mergeTests } from './merge.tests.js';
import { originLeanTests } from './origin-lean.tests.js';
import { elevatedStatementTests } from './elevated-statements.tests.js';
import { mdTests } from './md.tests.js';
import { runReverseAnnotationTests } from './reverse-annotation.tests.js';
import { generateRemoveTests } from './generate-remove.tests.js';

const testGroups = [
    { name: 'Parse Tests', tests: parseTests },
    { name: 'Locate Tests', tests: locateTests },
    { name: 'Merge Tests', tests: mergeTests },
    { name: 'Origin Lean Tests', tests: originLeanTests },
    { name: 'Elevated Statement Tests', tests: elevatedStatementTests },
    { name: 'MD Tests', tests: mdTests },
    { name: 'Generate Remove Tests', tests: generateRemoveTests },
];

const allTests = testGroups.flatMap(g => g.tests);

let passed = 0;
let failed = 0;

async function runTests() {
    console.log('# MD-LD Specification Test Suite\n');

    const results = [];

    for (const group of testGroups) {
        console.log(`## ${group.name}`);
        for (const { name, fn } of group.tests) {
            try {
                fn();
                results.push({ name, status: 'passed' });
                passed++;
            } catch (error) {
                results.push({ name, status: 'failed', error: error.message });
                failed++;
                console.log(`✗ ${name}`);
                console.log(`  ${error.message}`);
            }
        }
    }

    console.log(`\n${'-'.repeat(60)}`);
    console.log(`Results: ${passed} passed, ${failed} failed, ${allTests.length} total`);

    if (failed > 0) {
        process?.exit(1);
    }

    return results;
}

// Export for use in browser
export { runTests };
export const tests = allTests;

// Auto-run in Node.js
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}
