/**
 * MDLD Tokenization Performance Benchmark
 * 
 * Compares regex-based vs character-based tokenization approaches
 * for both speed and memory efficiency.
 */

import { performance } from 'perf_hooks';

// Test data generation
function generateTestMDLD(size = 'medium') {
    const sizes = {
        small: { lines: 50, carriers: 5, annotations: 10 },
        medium: { lines: 200, carriers: 15, annotations: 30 },
        large: { lines: 1000, carriers: 50, annotations: 100 },
        huge: { lines: 5000, carriers: 200, annotations: 400 }
    };

    const config = sizes[size];
    const lines = [];

    // Add prefix declarations
    lines.push('[ex] <http://example.org/>');
    lines.push('[rdf] <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
    lines.push('[rdfs] <http://www.w3.org/2000/01/rdf-schema#>');
    lines.push('');

    // Generate content with various markdown patterns
    for (let i = 0; i < config.lines; i++) {
        const lineType = Math.random();

        if (lineType < 0.3) {
            // Heading with annotation
            lines.push(`## Section ${i} {=ex:section${i} ?rdfs:label}`);
        } else if (lineType < 0.6) {
            // List item with carriers and annotations
            const carriers = [];
            for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
                const carrierType = Math.random();
                if (carrierType < 0.33) {
                    carriers.push(`**Item ${i}-${j}**`);
                } else if (carrierType < 0.66) {
                    carriers.push(`*Item ${i}-${j}*`);
                } else {
                    carriers.push(`\`Item ${i}-${j}\``);
                }
            }
            const annotation = `{=ex:item${i} ?rdf:type .Item ?ex:index ${i}}`;
            lines.push(`- ${carriers.join(' ')} ${annotation}`);
        } else {
            // Regular text with some markdown
            lines.push(`This is **bold** text with *italic* and \`code\` examples.`);
        }
    }

    return lines.join('\n');
}

// Current parser regex-based approach
function regexBasedTokenization(text) {
    const CARRIER_PATTERN_ARRAY = [
        ['EMPHASIS', /[*__]+(.+?)[*__]+\s*\{([^}]+)\}/y],
        ['CODE_SPAN_SINGLE', /`(.+?)`\s*\{([^}]+)\}/y],
        ['CODE_SPAN_DOUBLE', /``(.+?)``\s*\{([^}]+)\}/y]
    ];

    const tokens = [];
    let pos = 0;

    while (pos < text.length) {
        let found = false;

        // Test each pattern
        for (const [type, pattern] of CARRIER_PATTERN_ARRAY) {
            pattern.lastIndex = pos;
            const match = pattern.exec(text);
            if (match) {
                tokens.push({
                    type: type.toLowerCase(),
                    content: match[1],
                    annotation: match[2],
                    start: match.index,
                    end: match.index + match[0].length
                });
                pos = match.index + match[0].length;
                found = true;
                break;
            }
        }

        if (!found) pos++;
    }

    return tokens;
}

// Highlighter character-based approach
function characterBasedTokenization(text) {
    const tokens = [];
    let i = 0;

    function hasFollowingAnnotation(endPos) {
        let j = endPos;
        while (j < text.length && /\s/.test(text[j])) {
            j++;
        }
        return j < text.length && text[j] === '{';
    }

    while (i < text.length) {
        const char = text[i];

        // Check for **bold**
        if (char === '*' && i + 1 < text.length && text[i + 1] === '*') {
            const endPos = text.indexOf('**', i + 2);
            if (endPos !== -1) {
                const content = text.slice(i + 2, endPos);
                const annotationStart = text.indexOf('{', endPos + 2);
                if (annotationStart !== -1 && hasFollowingAnnotation(endPos + 2)) {
                    const annotationEnd = text.indexOf('}', annotationStart);
                    if (annotationEnd !== -1) {
                        const annotation = text.slice(annotationStart + 1, annotationEnd);
                        tokens.push({
                            type: 'emphasis',
                            content: content,
                            annotation: annotation,
                            start: i,
                            end: annotationEnd + 1,
                            hasFollowingAnnotation: true
                        });
                        i = annotationEnd + 1;
                        continue;
                    }
                }
                i = endPos + 2;
                continue;
            }
        }

        // Check for *italic*
        if (char === '*') {
            const endPos = text.indexOf('*', i + 1);
            if (endPos !== -1) {
                const content = text.slice(i + 1, endPos);
                const annotationStart = text.indexOf('{', endPos + 1);
                if (annotationStart !== -1 && hasFollowingAnnotation(endPos + 1)) {
                    const annotationEnd = text.indexOf('}', annotationStart);
                    if (annotationEnd !== -1) {
                        const annotation = text.slice(annotationStart + 1, annotationEnd);
                        tokens.push({
                            type: 'emphasis',
                            content: content,
                            annotation: annotation,
                            start: i,
                            end: annotationEnd + 1,
                            hasFollowingAnnotation: true
                        });
                        i = annotationEnd + 1;
                        continue;
                    }
                }
                i = endPos + 1;
                continue;
            }
        }

        // Check for `code`
        if (char === '`') {
            const endPos = text.indexOf('`', i + 1);
            if (endPos !== -1) {
                const content = text.slice(i + 1, endPos);
                const annotationStart = text.indexOf('{', endPos + 1);
                if (annotationStart !== -1 && hasFollowingAnnotation(endPos + 1)) {
                    const annotationEnd = text.indexOf('}', annotationStart);
                    if (annotationEnd !== -1) {
                        const annotation = text.slice(annotationStart + 1, annotationEnd);
                        tokens.push({
                            type: 'code',
                            content: content,
                            annotation: annotation,
                            start: i,
                            end: annotationEnd + 1,
                            hasFollowingAnnotation: true
                        });
                        i = annotationEnd + 1;
                        continue;
                    }
                }
                i = endPos + 1;
                continue;
            }
        }

        i++;
    }

    return tokens;
}

// Performance measurement utilities
function measurePerformance(fn, text, iterations = 100) {
    // Warm up
    for (let i = 0; i < 10; i++) {
        fn(text);
    }

    // Measure memory before
    const memBefore = process.memoryUsage();

    // Measure time
    const start = performance.now();
    let results = [];

    for (let i = 0; i < iterations; i++) {
        results.push(fn(text));
    }

    const end = performance.now();

    // Measure memory after
    const memAfter = process.memoryUsage();

    return {
        totalTime: end - start,
        avgTime: (end - start) / iterations,
        iterations: iterations,
        memoryDelta: {
            heapUsed: memAfter.heapUsed - memBefore.heapUsed,
            heapTotal: memAfter.heapTotal - memBefore.heapTotal,
            external: memAfter.external - memBefore.external
        },
        results: results
    };
}

// Comprehensive benchmark
function runBenchmark() {
    const sizes = ['small', 'medium', 'large', 'huge'];
    const results = {};

    console.log('MDLD Tokenization Performance Benchmark\n');
    console.log('=====================================\n');

    for (const size of sizes) {
        console.log(`Testing ${size} documents...`);
        const testText = generateTestMDLD(size);
        console.log(`Document size: ${testText.length} characters`);

        // Test regex approach
        console.log('  Regex-based tokenization...');
        const regexResults = measurePerformance(regexBasedTokenization, testText, 50);

        // Test character approach
        console.log('  Character-based tokenization...');
        const charResults = measurePerformance(characterBasedTokenization, testText, 50);

        results[size] = {
            documentSize: testText.length,
            regex: {
                avgTime: regexResults.avgTime,
                memoryDelta: regexResults.memoryDelta,
                tokenCount: regexResults.results[0].length
            },
            character: {
                avgTime: charResults.avgTime,
                memoryDelta: charResults.memoryDelta,
                tokenCount: charResults.results[0].length
            }
        };

        // Calculate performance differences
        const timeRatio = charResults.avgTime / regexResults.avgTime;
        const memoryRatio = charResults.memoryDelta.heapUsed / regexResults.memoryDelta.heapUsed;

        console.log(`  Results for ${size}:`);
        console.log(`    Regex: ${regexResults.avgTime.toFixed(2)}ms avg, ${regexResults.memoryDelta.heapUsed} bytes memory`);
        console.log(`    Character: ${charResults.avgTime.toFixed(2)}ms avg, ${charResults.memoryDelta.heapUsed} bytes memory`);
        console.log(`    Time ratio: ${timeRatio.toFixed(2)}x (${timeRatio > 1 ? 'slower' : 'faster'})`);
        console.log(`    Memory ratio: ${memoryRatio.toFixed(2)}x (${memoryRatio > 1 ? 'more' : 'less'})`);
        console.log(`    Token counts: Regex=${regexResults.results[0].length}, Character=${charResults.results[0].length}`);
        console.log('');
    }

    return results;
}

// Detailed analysis
function analyzeResults(results) {
    console.log('Performance Analysis Summary\n');
    console.log('===========================\n');

    const sizes = Object.keys(results);

    // Time analysis
    console.log('Time Performance (ms):');
    console.log('Size\t\tRegex\t\tCharacter\tRatio');
    console.log('----\t\t-----\t\t---------\t-----');

    for (const size of sizes) {
        const r = results[size];
        const ratio = r.character.avgTime / r.regex.avgTime;
        console.log(`${size}\t\t${r.regex.avgTime.toFixed(2)}\t\t${r.character.avgTime.toFixed(2)}\t\t${ratio.toFixed(2)}x`);
    }

    console.log('\nMemory Usage (bytes):');
    console.log('Size\t\tRegex\t\tCharacter\tRatio');
    console.log('----\t\t-----\t\t---------\t-----');

    for (const size of sizes) {
        const r = results[size];
        const ratio = r.character.memoryDelta.heapUsed / r.regex.memoryDelta.heapUsed;
        console.log(`${size}\t\t${r.regex.memoryDelta.heapUsed}\t\t${r.character.memoryDelta.heapUsed}\t\t${ratio.toFixed(2)}x`);
    }

    // Scaling analysis
    console.log('\nScaling Analysis:');
    console.log('Size\t\tRegex Time/Char\tChar Time/Char\tRegex Mem/Char\tChar Mem/Char');
    console.log('----\t\t--------------\t--------------\t--------------\t--------------');

    for (const size of sizes) {
        const r = results[size];
        const regexTimePerChar = r.regex.avgTime / r.documentSize * 1000; // microseconds
        const charTimePerChar = r.character.avgTime / r.documentSize * 1000;
        const regexMemPerChar = r.regex.memoryDelta.heapUsed / r.documentSize;
        const charMemPerChar = r.character.memoryDelta.heapUsed / r.documentSize;

        console.log(`${size}\t\t${regexTimePerChar.toFixed(2)}μs\t\t${charTimePerChar.toFixed(2)}μs\t\t${regexMemPerChar.toFixed(2)}B\t\t${charMemPerChar.toFixed(2)}B`);
    }

    // Recommendations
    console.log('\nRecommendations:');

    const avgTimeRatio = sizes.reduce((sum, size) => sum + (results[size].character.avgTime / results[size].regex.avgTime), 0) / sizes.length;
    const avgMemRatio = sizes.reduce((sum, size) => sum + (results[size].character.memoryDelta.heapUsed / results[size].regex.memoryDelta.heapUsed), 0) / sizes.length;

    if (avgTimeRatio < 1.2) {
        console.log('✅ Character-based approach has acceptable time performance');
    } else {
        console.log('⚠️  Character-based approach is significantly slower');
    }

    if (avgMemRatio < 1.5) {
        console.log('✅ Character-based approach has acceptable memory usage');
    } else {
        console.log('⚠️  Character-based approach uses significantly more memory');
    }

    // Feature comparison
    console.log('\nFeature Comparison:');
    console.log('Approach\t\tSemantic Awareness\tMaintainability\tDebuggability');
    console.log('--------\t\t-----------------\t---------------\t-------------');
    console.log('Regex-based\t\t❌ Limited\t\t⚠️  Complex\t\t⚠️  Hard');
    console.log('Character-based\t\t✅ Full\t\t\t✅ Simple\t\t✅ Easy');
}

// Run the benchmark
export function runTokenizationBenchmark() {
    try {
        const results = runBenchmark();
        analyzeResults(results);
        return results;
    } catch (error) {
        console.error('Benchmark failed:', error);
        throw error;
    }
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTokenizationBenchmark();
}
