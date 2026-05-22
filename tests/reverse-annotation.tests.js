import { parse } from '../src/parse.js';
import { generate } from '../src/generate.js';

/**
 * Test suite for reverse connection rendering in generate()
 */
export function runReverseAnnotationTests() {
    console.log('🧪 Running Reverse Annotation Tests...\n');

    const tests = [
        testBasicReverseAnnotation,
        testMultipleReverseConnections,
        testNoReverseConnections,
        testSubjectWithBothDirectAndReverse
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
        try {
            const result = test();
            if (result.passed) {
                console.log(`✅ ${test.name}`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: ${result.error}`);
                if (result.details) {
                    console.log(`   Details: ${result.details}`);
                }
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }

    console.log(`\n📊 Results: ${passed}/${total} tests passed`);
    return passed === total;
}

/**
 * Test basic reverse connection rendering
 */
function testBasicReverseAnnotation() {
    const mdld = `[my] <tag:alice@example.com,2026:minimal/>

# Simple Note {=my:note .prov:Entity label}

Related to: [Example Project] {+my:example-project !my:relatedTo .prov:Project label}`;

    const result = parse({ text: mdld });
    const generated = generate({ ...result });

    const expected = `[my] <tag:alice@example.com,2026:minimal/>

# Simple Note {=my:note .prov:Entity label}
[Example Project] {+my:example-project !my:relatedTo .prov:Project label}

`;

    if (generated.text === expected) {
        return { passed: true };
    } else {
        return {
            passed: false,
            error: 'Generated text does not match expected',
            details: `Expected:\n${expected}\n\nGot:\n${generated.text}`
        };
    }
}

/**
 * Test multiple reverse connections
 */
function testMultipleReverseConnections() {
    const mdld = `[ex] <http://example.org/>

# Main {=ex:main label}
[Item 1] {+ex:item1 !ex:related}
[Item 2] {+ex:item2 !ex:related}`;

    const result = parse({ text: mdld });
    const generated = generate({ ...result });

    // Should render reverse connections inline for primarySubject
    const hasReverseAnnotation = generated.text.includes('!ex:related');

    if (hasReverseAnnotation) {
        return { passed: true };
    } else {
        return {
            passed: false,
            error: 'Reverse annotation not found in generated text',
            details: generated.text
        };
    }
}

/**
 * Test when there are no reverse connections
 */
function testNoReverseConnections() {
    const mdld = `[ex] <http://example.org/>

# Main {=ex:main label}
[Value] {ex:property}`;

    const result = parse({ text: mdld });
    const generated = generate({ ...result });

    // Should not have any !p annotations
    const hasReverseAnnotation = generated.text.includes('!');

    if (!hasReverseAnnotation) {
        return { passed: true };
    } else {
        return {
            passed: false,
            error: 'Unexpected reverse annotation found',
            details: generated.text
        };
    }
}

/**
 * Test subject with both direct and reverse connections
 */
function testSubjectWithBothDirectAndReverse() {
    const mdld = `[ex] <http://example.org/>

# Main {=ex:main label}
[Direct Link] {+ex:direct ?ex:pointsTo}
[Reverse Link] {+ex:reverse !ex:pointedBy}`;

    const result = parse({ text: mdld });
    const generated = generate({ ...result });

    // Should have ?p for direct, !p for reverse
    const hasDirect = generated.text.includes('?ex:pointsTo');
    const hasReverse = generated.text.includes('!ex:pointedBy');

    if (hasDirect && hasReverse) {
        return { passed: true };
    } else {
        return {
            passed: false,
            error: 'Missing direct or reverse annotations',
            details: `Has direct: ${hasDirect}, Has reverse: ${hasReverse}\nText:\n${generated.text}`
        };
    }
}

// Auto-run in Node.js
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
    runReverseAnnotationTests();
}
