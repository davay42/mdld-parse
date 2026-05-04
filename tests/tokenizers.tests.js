/**
 * Tests for character-based tokenizers
 * Validates that new character-based detection matches regex behavior
 */

import {
    detectFence,
    detectPrefix,
    detectHeading,
    detectList,
    detectBlockquote,
    detectStandaloneSubject,
    detectAngleBracketUrl,
    detectEmphasis,
    detectCodeSpan,
    detectBracketLink,
    extractAttributes,
    findMatchingBracket,
    scanInlineCarriers
} from '../src/tokenizers.js';

import {
    FENCE_REGEX,
    PREFIX_REGEX,
    HEADING_REGEX,
    UNORDERED_LIST_REGEX,
    BLOCKQUOTE_REGEX,
    STANDALONE_SUBJECT_REGEX,
    URL_REGEX,
    CARRIER_PATTERN_ARRAY
} from '../src/constants.js';

// ============================================================================
// BLOCK-LEVEL TOKENIZER TESTS
// ============================================================================

describe('Block-Level Tokenizers', () => {

    describe('detectFence', () => {
        const testCases = [
            { line: '```', expected: { fenceChar: '`', fenceLength: 3, lang: '', attrs: null } },
            { line: '```javascript', expected: { fenceChar: '`', fenceLength: 3, lang: 'javascript', attrs: null } },
            { line: '```js {=ex:Code}', expected: { fenceChar: '`', fenceLength: 3, lang: 'js', attrs: '=ex:Code' } },
            { line: '~~~', expected: { fenceChar: '~', fenceLength: 3, lang: '', attrs: null } },
            { line: '~~~~~', expected: { fenceChar: '~', fenceLength: 5, lang: '', attrs: null } },
            { line: '``', expected: null },  // Too short
            { line: 'not a fence', expected: null },
            { line: '# Heading', expected: null },
        ];

        testCases.forEach(({ line, expected }) => {
            test(`detectFence("${line.replace(/\n/g, '\\n')}")`, () => {
                const result = detectFence(line);

                // Compare against regex
                const regexMatch = FENCE_REGEX.exec(line.trim());

                if (expected === null) {
                    expect(result).toBeNull();
                    expect(regexMatch).toBeNull();
                } else {
                    expect(result).not.toBeNull();
                    expect(result.fenceChar).toBe(expected.fenceChar);
                    expect(result.fenceLength).toBe(expected.fenceLength);
                    expect(result.lang).toBe(expected.lang);
                    expect(result.attrs).toBe(expected.attrs);

                    // Verify fence char matches regex
                    expect(regexMatch[1][0]).toBe(expected.fenceChar);
                }
            });
        });
    });

    describe('detectPrefix', () => {
        const testCases = [
            { line: '[ex] <http://example.org/>', expected: { prefix: 'ex', iri: 'http://example.org/' } },
            { line: '[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>', expected: { prefix: 'rdf', iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' } },
            { line: '[my-prefix] <tag:test,2024:>', expected: { prefix: 'my-prefix', iri: 'tag:test,2024:' } },
            { line: '[ex]http://example.org/>', expected: null },  // Missing space
            { line: '[ex]<http://example.org/>', expected: null },  // Missing space
            { line: '# Heading', expected: null },
            { line: 'not a prefix', expected: null },
        ];

        testCases.forEach(({ line, expected }) => {
            test(`detectPrefix("${line}")`, () => {
                const result = detectPrefix(line);

                // Compare against regex
                const regexMatch = PREFIX_REGEX.exec(line);

                if (expected === null) {
                    expect(result).toBeNull();
                    expect(regexMatch).toBeNull();
                } else {
                    expect(result).toEqual(expected);
                    expect(regexMatch[1]).toBe(expected.prefix);
                    expect(regexMatch[2].trim()).toBe(expected.iri);
                }
            });
        });
    });

    describe('detectHeading', () => {
        const testCases = [
            { line: '# Heading 1', expected: { depth: 1, content: 'Heading 1', attrs: null } },
            { line: '## Heading 2', expected: { depth: 2, content: 'Heading 2', attrs: null } },
            { line: '###### Heading 6', expected: { depth: 6, content: 'Heading 6', attrs: null } },
            { line: '####### Too many', expected: null },  // 7 is too many
            { line: '# Heading with attrs {=ex:Test}', expected: { depth: 1, content: 'Heading with attrs', attrs: '=ex:Test' } },
            { line: '## Multiple words {=ex:Subject .ex:Type}', expected: { depth: 2, content: 'Multiple words', attrs: '=ex:Subject .ex:Type' } },
            { line: '#NoSpace', expected: null },  // No space after #
            { line: 'Not a heading', expected: null },
        ];

        testCases.forEach(({ line, expected }) => {
            test(`detectHeading("${line}")`, () => {
                const result = detectHeading(line);

                // Compare against regex
                const regexMatch = HEADING_REGEX.exec(line);

                if (expected === null) {
                    expect(result).toBeNull();
                    expect(regexMatch).toBeNull();
                } else {
                    expect(result.depth).toBe(expected.depth);
                    expect(result.content).toBe(expected.content);
                    expect(result.attrs).toBe(expected.attrs);

                    // Verify regex match
                    expect(regexMatch[1].length).toBe(expected.depth);
                    expect(regexMatch[2].trim()).toBe(expected.content);
                    const regexAttrs = regexMatch[3] ? regexMatch[3].slice(1, -1) : null;
                    expect(regexAttrs).toBe(expected.attrs);
                }
            });
        });
    });

    describe('detectList', () => {
        const testCases = [
            { line: '- Item', expected: { indent: 0, marker: '-', content: 'Item', attrs: null } },
            { line: '* Star', expected: { indent: 0, marker: '*', content: 'Star', attrs: null } },
            { line: '+ Plus', expected: { indent: 0, marker: '+', content: 'Plus', attrs: null } },
            { line: '1. Ordered', expected: { indent: 0, marker: '1.', content: 'Ordered', attrs: null } },
            { line: '  42. Indented', expected: { indent: 2, marker: '42.', content: 'Indented', attrs: null } },
            { line: '- Item with attrs {=ex:Item}', expected: { indent: 0, marker: '-', content: 'Item with attrs', attrs: '=ex:Item' } },
            { line: '-NoSpace', expected: null },
            { line: 'Not a list', expected: null },
            { line: '  no marker here', expected: null },
        ];

        testCases.forEach(({ line, expected }) => {
            test(`detectList("${line}")`, () => {
                const result = detectList(line);

                // Compare against regex
                const regexMatch = UNORDERED_LIST_REGEX.exec(line);

                if (expected === null) {
                    expect(result).toBeNull();
                    expect(regexMatch).toBeNull();
                } else {
                    expect(result.indent).toBe(expected.indent);
                    expect(result.marker).toBe(expected.marker);
                    expect(result.content).toBe(expected.content);
                    expect(result.attrs).toBe(expected.attrs);

                    // Verify regex
                    expect(regexMatch[1].length).toBe(expected.indent);
                    expect(regexMatch[2]).toBe(expected.marker);
                    expect(regexMatch[3].trim()).toBe(expected.content);
                }
            });
        });
    });

    describe('detectBlockquote', () => {
        const testCases = [
            { line: '> Quote', expected: { content: 'Quote', attrs: null } },
            { line: '> Quote with attrs {=ex:Quote}', expected: { content: 'Quote with attrs', attrs: '=ex:Quote' } },
            { line: '>  Indented quote', expected: { content: 'Indented quote', attrs: null } },
            { line: '>Quote no space', expected: null },
            { line: 'Not a quote', expected: null },
        ];

        testCases.forEach(({ line, expected }) => {
            test(`detectBlockquote("${line}")`, () => {
                const result = detectBlockquote(line);

                // Compare against regex
                const regexMatch = BLOCKQUOTE_REGEX.exec(line);

                if (expected === null) {
                    expect(result).toBeNull();
                    expect(regexMatch).toBeNull();
                } else {
                    expect(result.content).toBe(expected.content);
                    expect(result.attrs).toBe(expected.attrs);

                    // Verify regex
                    expect(regexMatch[1].trim()).toBe(expected.content);
                }
            });
        });
    });

    describe('detectStandaloneSubject', () => {
        const testCases = [
            { line: '{=ex:Subject}', expected: { content: 'ex:Subject' } },
            { line: '  {=ex:Subject}  ', expected: { content: 'ex:Subject' } },
            { line: '{=#fragment}', expected: { content: '#fragment' } },
            { line: '{=}', expected: { content: '' } },
            { line: '{=ex:Subject} extra', expected: null },
            { line: 'Not standalone', expected: null },
        ];

        testCases.forEach(({ line, expected }) => {
            test(`detectStandaloneSubject("${line}")`, () => {
                const result = detectStandaloneSubject(line);

                // Compare against regex
                const regexMatch = STANDALONE_SUBJECT_REGEX.exec(line);

                if (expected === null) {
                    expect(result).toBeNull();
                    expect(regexMatch).toBeNull();
                } else {
                    expect(result.content).toBe(expected.content);
                    expect(regexMatch[1]).toBe(expected.content);
                }
            });
        });
    });
});

// ============================================================================
// INLINE TOKENIZER TESTS
// ============================================================================

describe('Inline Tokenizers', () => {

    describe('detectAngleBracketUrl', () => {
        const testCases = [
            { text: '<https://example.com>', start: 0, expected: { url: 'https://example.com' } },
            { text: '<http://test.org>', start: 0, expected: { url: 'http://test.org' } },
            { text: '<tag:uri>', start: 0, expected: { url: 'tag:uri' } },
            { text: '<mailto:test@example.com>', start: 0, expected: { url: 'mailto:test@example.com' } },
            { text: '<not a url>', start: 0, expected: null },
            { text: '<123numbers>', start: 0, expected: null },  // Invalid scheme
            { text: 'text <https://example.com> more', start: 5, expected: { url: 'https://example.com' } },
        ];

        testCases.forEach(({ text, start, expected }) => {
            test(`detectAngleBracketUrl("${text}", ${start})`, () => {
                const result = detectAngleBracketUrl(text, start);

                if (expected === null) {
                    expect(result).toBeNull();
                } else {
                    expect(result.url).toBe(expected.url);

                    // Verify URL format
                    expect(URL_REGEX.test(expected.url)).toBe(true);
                }
            });
        });
    });

    describe('detectEmphasis', () => {
        const testCases = [
            { text: '*emphasis*', start: 0, expected: { type: 'emphasis', content: 'emphasis' } },
            { text: '_emphasis_', start: 0, expected: { type: 'emphasis', content: 'emphasis' } },
            { text: '**strong**', start: 0, expected: { type: 'strong', content: 'strong' } },
            { text: '__strong__', start: 0, expected: { type: 'strong', content: 'strong' } },
            { text: '*with attrs* {=ex:pred}', start: 0, expected: { type: 'emphasis', content: 'with attrs', attrs: '=ex:pred' } },
            { text: '*unclosed', start: 0, expected: null },
            { text: '**partial', start: 0, expected: null },
            { text: 'text *emphasis* more', start: 5, expected: { type: 'emphasis', content: 'emphasis' } },
        ];

        testCases.forEach(({ text, start, expected }) => {
            test(`detectEmphasis("${text}", ${start})`, () => {
                const result = detectEmphasis(text, start);

                if (expected === null) {
                    expect(result).toBeNull();
                } else {
                    expect(result.type).toBe(expected.type);
                    expect(result.content).toBe(expected.content);
                    expect(result.attrs).toBe(expected.attrs || null);
                }
            });
        });
    });

    describe('detectCodeSpan', () => {
        const testCases = [
            { text: '`code`', start: 0, expected: { content: 'code', attrs: null } },
            { text: '``code``', start: 0, expected: { content: 'code', attrs: null } },
            { text: '`with code attrs` {^^xsd:string}', start: 0, expected: { content: 'with code attrs', attrs: '^^xsd:string' } },
            { text: '`unclosed', start: 0, expected: null },
            { text: '``partial', start: 0, expected: null },
            { text: 'text `code` more', start: 5, expected: { content: 'code' } },
        ];

        testCases.forEach(({ text, start, expected }) => {
            test(`detectCodeSpan("${text}", ${start})`, () => {
                const result = detectCodeSpan(text, start);

                if (expected === null) {
                    expect(result).toBeNull();
                } else {
                    expect(result.content).toBe(expected.content);
                    expect(result.attrs).toBe(expected.attrs);
                }
            });
        });
    });

    describe('detectBracketLink', () => {
        const testCases = [
            { text: '[text]', start: 0, expected: { text: 'text', url: null, attrs: null } },
            { text: '[text](url)', start: 0, expected: { text: 'text', url: 'url', attrs: null } },
            { text: '[text] {=ex:link}', start: 0, expected: { text: 'text', url: null, attrs: '=ex:link' } },
            { text: '[text](url) {=ex:link}', start: 0, expected: { text: 'text', url: 'url', attrs: '=ex:link' } },
            { text: '[nested [brackets]]', start: 0, expected: null },  // Invalid - nested brackets
            { text: '[unclosed', start: 0, expected: null },
            { text: 'text [link] more', start: 5, expected: { text: 'link', url: null } },
        ];

        testCases.forEach(({ text, start, expected }) => {
            test(`detectBracketLink("${text}", ${start})`, () => {
                const result = detectBracketLink(text, start);

                if (expected === null) {
                    expect(result).toBeNull();
                } else {
                    expect(result.text).toBe(expected.text);
                    expect(result.url).toBe(expected.url);
                    expect(result.attrs).toBe(expected.attrs);
                }
            });
        });
    });

    describe('findMatchingBracket', () => {
        const testCases = [
            { text: '[simple]', start: 0, expected: 7 },
            { text: '[with (paren)]', start: 0, expected: 13 },
            { text: '[[nested]]', start: 0, expected: 9 },
            { text: '[a][b]', start: 0, expected: 2 },  // First closing bracket
            { text: '[unclosed', start: 0, expected: null },
            { text: 'text [link] more', start: 5, expected: 10 },
        ];

        testCases.forEach(({ text, start, expected }) => {
            test(`findMatchingBracket("${text}", ${start})`, () => {
                const result = findMatchingBracket(text, start);
                expect(result).toBe(expected);
            });
        });
    });

    describe('extractAttributes', () => {
        const testCases = [
            { text: '{=ex:pred}', start: 0, expected: { attrs: '=ex:pred', endPos: 10 } },
            { text: '  {=ex:pred}', start: 0, expected: { attrs: '=ex:pred', endPos: 12 } },
            { text: '{.Type}', start: 0, expected: { attrs: '.Type', endPos: 7 } },
            { text: 'no attrs', start: 0, expected: null },
            { text: 'text {=pred} more', start: 5, expected: { attrs: '=pred', endPos: 12 } },
            { text: '{unclosed', start: 0, expected: null },
        ];

        testCases.forEach(({ text, start, expected }) => {
            test(`extractAttributes("${text}", ${start})`, () => {
                const result = extractAttributes(text, start);

                if (expected === null) {
                    expect(result).toBeNull();
                } else {
                    expect(result.attrs).toBe(expected.attrs);
                    expect(result.endPos).toBe(expected.endPos);
                }
            });
        });
    });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('scanInlineCarriers Integration', () => {
    test('detects all carrier types in mixed content', () => {
        const text = 'Text with *emphasis* and `code` and [link](url) and <https://example.com>';
        const carriers = scanInlineCarriers(text, 0);

        expect(carriers).toHaveLength(4);

        // Check types
        expect(carriers[0].type).toBe('emphasis');
        expect(carriers[0].text).toBe('emphasis');

        expect(carriers[1].type).toBe('code');
        expect(carriers[1].text).toBe('code');

        expect(carriers[2].type).toBe('link');
        expect(carriers[2].text).toBe('link');
        expect(carriers[2].url).toBe('url');

        expect(carriers[3].type).toBe('url');
        expect(carriers[3].text).toBe('https://example.com');
    });

    test('handles carriers with attributes', () => {
        const text = '*emphasis* {=ex:pred} and `code` {^^xsd:string}';
        const carriers = scanInlineCarriers(text, 0);

        expect(carriers).toHaveLength(2);
        expect(carriers[0].attrs).toBe('=ex:pred');
        expect(carriers[1].attrs).toBe('^^xsd:string');
    });

    test('respects baseOffset for ranges', () => {
        const text = 'prefix *emphasis* suffix';
        const baseOffset = 100;
        const carriers = scanInlineCarriers(text, baseOffset);

        expect(carriers).toHaveLength(1);
        // "prefix " is 7 chars, so emphasis starts at 7
        expect(carriers[0].range[0]).toBe(107);  // 100 + 7
        expect(carriers[0].range[1]).toBe(118);  // 100 + 7 + 8 + 3
    });

    test('skips annotation-only links', () => {
        const text = '[text] {=ex:subject} and [normal](url)';
        const carriers = scanInlineCarriers(text, 0);

        // Should only find the normal link, skip the annotation-only one
        expect(carriers).toHaveLength(1);
        expect(carriers[0].type).toBe('link');
        expect(carriers[0].url).toBe('url');
    });
});

// ============================================================================
// PERFORMANCE COMPARISON (basic sanity check)
// ============================================================================

describe('Performance Comparison', () => {
    test('character-based is reasonably fast', () => {
        const iterations = 1000;
        const line = '## Heading with {=ex:Subject .ex:Type}';

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            detectHeading(line);
        }
        const charTime = performance.now() - start;

        // Should complete in reasonable time (< 100ms for 1000 iterations)
        expect(charTime).toBeLessThan(100);

        console.log(`Character-based heading detection: ${charTime.toFixed(2)}ms for ${iterations} iterations`);
    });

    test('scanInlineCarriers handles large texts', () => {
        const text = '*emphasis* '.repeat(100);  // 100 carriers

        const start = performance.now();
        const carriers = scanInlineCarriers(text, 0);
        const time = performance.now() - start;

        expect(carriers).toHaveLength(100);
        expect(time).toBeLessThan(50);  // Should be fast

        console.log(`Scan 100 carriers: ${time.toFixed(2)}ms`);
    });
});

// Helper functions
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function assertNull(value, message) {
    if (value !== null) {
        throw new Error(`${message}: expected null, got ${value}`);
    }
}

function assertNotNull(value, message) {
    if (value === null) {
        throw new Error(`${message}: expected non-null value`);
    }
}

// Convert Jest-style tests to simple format
const allTests = [
    // Block-level tokenizer tests
    ...blockTests,
    // Inline tokenizer tests
    ...inlineTests,
    // Integration tests
    ...integrationTests
];

// Helper to create simple test format
function createSimpleTest(name, fn) {
    return { name, fn };
}

// Transform tests to simple format
const tokenizerTests = allTests.map(([name, fn]) => createSimpleTest(name, fn));

export { tokenizerTests };
