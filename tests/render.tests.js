import { render } from '../src/render.js';
import { parse } from '../src/parse.js';
import { parseRDFa } from 'rdfa-parse';

/**
 * Test suite for faithful MDLD rendering with round-trip validation
 */
export function runrenderTests() {
    console.log('🧪 Running MDLD Render Tests...\n');

    const tests = [
        testBasicRoundTrip,
        testComplexAnnotations,
        testNestedStructures,
        testListHandling,
        testInlineCarriers,
        testTypeAnnotations,
        testMultipleSubjects,
        testEdgeCases
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
 * Test basic round-trip functionality
 */
function testBasicRoundTrip() {
    const mdld = `[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Alice {=ex:alice .Person}
Name: [Alice] {ex:name}
Age: [30] {ex:age ^^xsd:integer}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Basic round-trip failed',
            details: `Missing: ${result.validation.missingQuads.length}, Extra: ${result.validation.extraQuads.length}`
        };
    }

    return { passed: true };
}

/**
 * Test complex annotations with multiple predicates
 */
function testComplexAnnotations() {
    const mdld = `[ex] <http://example.org/>
[dc] <http://purl.org/dc/terms/>

# Project {=ex:project .Project .Important}
Title: [AI Research] {ex:title dc:title}
Description: [Advanced AI project] {ex:description dc:description}
Lead: [Alice] {+ex:alice ?ex:lead .Person}
Status: [Active] {ex:status ex:Active}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Complex annotations round-trip failed',
            details: `Expected 5 quads, got ${result.validation.parsedCount}`
        };
    }

    return { passed: true };
}

/**
 * Test nested structures and hierarchy
 */
function testNestedStructures() {
    const mdld = `[ex] <http://example.org/>

# Company {=ex:company .Organization}
Name: [TechCorp] {ex:name}

## Department {=ex:dept .Department}
Name: [R&D] {ex:name}
Parent: [TechCorp] {+ex:company ?ex:parent}

### Team {=ex:team .Team}
Name: [AI Team] {ex:name}
Department: [R&D] {+ex:dept ?ex:department}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Nested structures round-trip failed',
            details: `Missing: ${result.validation.missingQuads.join(', ')}`
        };
    }

    return { passed: true };
}

/**
 * Test list handling with RDFa
 */
function testListHandling() {
    const mdld = `[ex] <http://example.org/>

# Tasks {=ex:tasks .TaskList}
Items:
- [Task 1] {+ex:task1 ?ex:task}
- [Task 2] {+ex:task2 ?ex:task}
  - [Subtask 2.1] {+ex:subtask1 ?ex:subtask}
- [Task 3] {+ex:task3 ?ex:task}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'List handling round-trip failed',
            details: `Expected 4 quads, got ${result.validation.parsedCount}`
        };
    }

    return { passed: true };
}

/**
 * Test inline carriers with formatting
 */
function testInlineCarriers() {
    const mdld = `[ex] <http://example.org/>

# Document {=ex:doc .Document}
Title: *[Important]* {ex:title .Important}
Author: [Alice] {+ex:alice ?ex:author .Person}
Code: \`test()\` {ex:example}
Link: [Website](https://example.com) {+ex:website ?ex:url}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Inline carriers round-trip failed',
            details: `Missing: ${result.validation.missingQuads.length}`
        };
    }

    return { passed: true };
}

/**
 * Test type annotations and inheritance
 */
function testTypeAnnotations() {
    const mdld = `[ex] <http://example.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Person {=ex:person .Person .Agent}
Name: [Bob] {ex:name}
Email: [bob@example.com] {ex:email}

# Employee {=ex:employee .Employee .Person}
Name: [Alice] {ex:name}
Salary: [75000] {ex:salary ^^xsd:decimal}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Type annotations round-trip failed',
            details: `Expected 6 quads, got ${result.validation.parsedCount}`
        };
    }

    return { passed: true };
}

/**
 * Test multiple subjects and relationships
 */
function testMultipleSubjects() {
    const mdld = `[ex] <http://example.org/>

# Alice {=ex:alice .Person}
Name: [Alice] {ex:name}
Knows: [Bob] {+ex:bob ?ex:knows}

# Bob {=ex:bob .Person}
Name: [Bob] {ex:name}
Knows: [Alice] {+ex:alice ?ex:knows}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Multiple subjects round-trip failed',
            details: `Expected 4 quads, got ${result.validation.parsedCount}`
        };
    }

    return { passed: true };
}

/**
 * Test edge cases and special characters
 */
function testEdgeCases() {
    const mdld = `[ex] <http://example.org/>

# Special {=ex:special .Special}
Quote: ["Hello & World"] {ex:quote}
HTML: [<div>test</div>] {ex:html}
Empty: [] {ex:empty}
Unicode: [Café] {ex:unicode}`;

    const result = render(mdld, { validate: true });

    if (!result.validation.isValid) {
        return {
            passed: false,
            error: 'Edge cases round-trip failed',
            details: `Missing: ${result.validation.missingQuads.length}`
        };
    }

    return { passed: true };
}

/**
 * Performance test for large documents
 */
export function testPerformance() {
    console.log('⚡ Running performance test...');

    // Generate large MDLD document
    let mdld = `[ex] <http://example.org/>

# Root {=ex:root .Root}\n`;
    for (let i = 0; i < 1000; i++) {
        mdld += `Item ${i}: [Value ${i}] {ex:item${i}}\n`;
    }

    const startTime = Date.now();
    const result = render(mdld, { validate: false });
    const renderTime = Date.now() - startTime;

    console.log(`   Rendered 1000 quads in ${renderTime}ms`);
    console.log(`   HTML length: ${result.html.length} characters`);

    return { renderTime, quadCount: 1000, htmlLength: result.html.length };
}

/**
 * Debug helper to show detailed validation
 */
export function debugRoundTrip(mdld, options = {}) {
    console.log('🔍 Debug round-trip validation:');
    console.log('Input MDLD:');
    console.log(mdld);
    console.log('\n---\n');

    const result = render(mdld, { validate: true, debug: true, ...options });

    console.log('Rendered HTML:');
    console.log(result.html);
    console.log('\n---\n');

    console.log('Validation:');
    console.log(JSON.stringify(result.validation, null, 2));

    if (result.debug) {
        console.log('\n---\nDebug Info:');
        console.log('Origin blocks:', result.debug.originBlocks.length);
        console.log('Quad index entries:', result.debug.quadIndex.length);
        console.log('Render map entries:', result.debug.renderMap.size);
    }

    return result;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runrenderTests();
}
