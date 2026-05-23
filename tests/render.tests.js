import { render } from '../src/render.js';

/**
 * Test suite for minimal MDLD HTML rendering
 */
export function runrenderTests() {
    console.log('🧪 Running MDLD Render Tests...\n');

    const tests = [
        testBasicRendering,
        testHeadings,
        testInlineFormatting,
        testLists,
        testCodeBlocks,
        testBlockquotes
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
 * Test basic HTML rendering
 */
function testBasicRendering() {
    const mdld = `[ex] <http://example.org/>

# Alice {=ex:alice .Person}
Name: [Alice] {ex:name}
Age: [30] {ex:age}`;

    const result = render(mdld);

    if (!result.html.includes('<h1>Alice</h1>')) {
        return {
            passed: false,
            error: 'Heading not rendered correctly',
            details: result.html
        };
    }

    if (!result.html.includes('<p>')) {
        return {
            passed: false,
            error: 'Paragraph not rendered',
            details: result.html
        };
    }

    // Should NOT contain MDLD annotations
    if (result.html.includes('{') || result.html.includes('}')) {
        return {
            passed: false,
            error: 'MDLD annotations not stripped',
            details: result.html
        };
    }

    return { passed: true };
}

/**
 * Test heading levels
 */
function testHeadings() {
    const mdld = `[ex] <http://example.org/>
    
# H1 {=ex:h1}
## H2 {=ex:h2}
### H3 {=ex:h3}`;

    const result = render(mdld);

    if (!result.html.includes('<h1>H1</h1>')) {
        return { passed: false, error: 'H1 not rendered' };
    }
    if (!result.html.includes('<h2>H2</h2>')) {
        return { passed: false, error: 'H2 not rendered' };
    }
    if (!result.html.includes('<h3>H3</h3>')) {
        return { passed: false, error: 'H3 not rendered' };
    }

    return { passed: true };
}

/**
 * Test inline formatting
 */
function testInlineFormatting() {
    const mdld = `[ex] <http://example.org/>
    
# Test {=ex:test}
Bold: **text** {ex:bold}
Italic: *text* {ex:italic}
Code: \`code\` {ex:code}
Link: [text](url) {ex:link}`;

    const result = render(mdld);

    if (!result.html.includes('<strong>text</strong>')) {
        return { passed: false, error: 'Bold not rendered' };
    }
    if (!result.html.includes('<em>text</em>')) {
        return { passed: false, error: 'Italic not rendered' };
    }
    if (!result.html.includes('<code>code</code>')) {
        return { passed: false, error: 'Code not rendered' };
    }
    if (!result.html.includes('<a href="url">text</a>')) {
        return { passed: false, error: 'Link not rendered' };
    }

    return { passed: true };
}

/**
 * Test list rendering
 */
function testLists() {
    const mdld = `[ex] <http://example.org/>
    
# Test {=ex:test}
- Item 1 {ex:item1}
- Item 2 {ex:item2}`;

    const result = render(mdld);

    if (!result.html.includes('<li>')) {
        return { passed: false, error: 'List items not rendered' };
    }
    if (result.html.includes('{')) {
        return { passed: false, error: 'Annotations not stripped from lists' };
    }

    return { passed: true };
}

/**
 * Test code blocks
 */
function testCodeBlocks() {
    const mdld = `[ex] <http://example.org/>
    
# Test {=ex:test}
\`\`\`javascript
const x = 1;
\`\`\` {ex:code}`;

    const result = render(mdld);

    if (!result.html.includes('<pre><code')) {
        return { passed: false, error: 'Code block not rendered' };
    }
    if (!result.html.includes('const x = 1;')) {
        return { passed: false, error: 'Code content not preserved' };
    }

    return { passed: true };
}

/**
 * Test blockquotes
 */
function testBlockquotes() {
    const mdld = `[ex] <http://example.org/>
    
# Test {=ex:test}
> Quote text {ex:quote}`;

    const result = render(mdld);

    if (!result.html.includes('<blockquote>')) {
        return { passed: false, error: 'Blockquote not rendered' };
    }
    if (result.html.includes('{')) {
        return { passed: false, error: 'Annotations not stripped from blockquote' };
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
