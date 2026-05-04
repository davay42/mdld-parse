/**
 * PROV-O Real-World Benchmark
 * 
 * Uses the actual PROV-O MDLD ontology as a baseline for performance testing.
 * Scales the document by creating multiple copies to test parser performance
 * at realistic document sizes.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performance } from 'perf_hooks';

// Import the parser
import { parse } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the PROV-O MDLD file
function loadProvO() {
    const provOPath = join(__dirname, 'prov-o.md');
    return readFileSync(provOPath, 'utf-8');
}

// Create scaled versions of the document
function scaleDocument(baseContent, multiplier) {
    const blocks = baseContent.split('\n\n');
    const scaledBlocks = [];

    for (let i = 0; i < multiplier; i++) {
        // Add a suffix to make IRIs unique for each copy
        const suffix = i === 0 ? '' : `-${i}`;
        const modifiedBlocks = blocks.map(block => {
            // Modify IRIs to make them unique across copies
            return block
                .replace(/\{=mdp:(\w+)\}/g, `{=mdp:$1${suffix}}`)
                .replace(/\{=mdp:(\w+)\s+/g, `{=mdp:$1${suffix} `)
                .replace(/\{\+mdp:(\w+)\}/g, `{+mdp:$1${suffix}}`)
                .replace(/\{\+mdp:(\w+)\s+/g, `{+mdp:$1${suffix} `);
        });
        scaledBlocks.push(...modifiedBlocks);
    }

    return scaledBlocks.join('\n\n');
}

// Measure parsing performance
function measureParsePerformance(text, iterations = 10) {
    // Warm up
    for (let i = 0; i < 3; i++) {
        parse({ text });
    }

    // Measure memory before
    const memBefore = process.memoryUsage();

    // Measure time
    const times = [];
    const results = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const result = parse({ text });
        const end = performance.now();

        times.push(end - start);
        results.push(result);
    }

    // Measure memory after
    const memAfter = process.memoryUsage();

    // Calculate statistics
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const medianTime = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

    return {
        avgTime,
        minTime,
        maxTime,
        medianTime,
        iterations,
        memoryDelta: {
            heapUsed: memAfter.heapUsed - memBefore.heapUsed,
            heapTotal: memAfter.heapTotal - memBefore.heapTotal,
            external: memAfter.external - memBefore.external,
            rss: memAfter.rss - memBefore.rss
        },
        lastResult: results[results.length - 1],
        times
    };
}

// Analyze document characteristics
function analyzeDocument(text) {
    const lines = text.split('\n');
    const chars = text.length;

    // Count different token types
    const headings = (text.match(/^#{1,6}\s+/gm) || []).length;
    const lists = (text.match(/^\s*[-*+]\s+/gm) || []).length;
    const blockquotes = (text.match(/^>\s+/gm) || []).length;
    const codeBlocks = (text.match(/^```/gm) || []).length / 2;
    const links = (text.match(/\[([^\]]+)\]\s*\{/g) || []).length;
    const emphasis = (text.match(/[*_]{1,2}[^*_]+[*_]{1,2}\s*\{/g) || []).length;
    const codeSpans = (text.match(/`[^`]+`\s*\{/g) || []).length;
    const annotations = (text.match(/\{[^}]+\}/g) || []).length;

    return {
        totalLines: lines.length,
        totalChars: chars,
        headings,
        lists,
        blockquotes,
        codeBlocks,
        links,
        emphasis,
        codeSpans,
        annotations,
        avgLineLength: chars / lines.length
    };
}

// Run comprehensive benchmark
async function runProvOBenchmark() {
    console.log('PROV-O Real-World Performance Benchmark');
    console.log('======================================\n');

    const baseContent = loadProvO();
    const baseAnalysis = analyzeDocument(baseContent);

    console.log('Base Document Characteristics:');
    console.log(`  Lines: ${baseAnalysis.totalLines.toLocaleString()}`);
    console.log(`  Characters: ${baseAnalysis.totalChars.toLocaleString()}`);
    console.log(`  Headings: ${baseAnalysis.headings}`);
    console.log(`  Lists: ${baseAnalysis.lists}`);
    console.log(`  Blockquotes: ${baseAnalysis.blockquotes}`);
    console.log(`  Code blocks: ${baseAnalysis.codeBlocks}`);
    console.log(`  Links with annotations: ${baseAnalysis.links}`);
    console.log(`  Emphasis with annotations: ${baseAnalysis.emphasis}`);
    console.log(`  Code spans with annotations: ${baseAnalysis.codeSpans}`);
    console.log(`  Total annotations: ${baseAnalysis.annotations}`);
    console.log(`  Avg line length: ${baseAnalysis.avgLineLength.toFixed(1)} chars\n`);

    // Test different scales
    const scales = [1, 2, 5, 10];
    const results = [];

    for (const scale of scales) {
        console.log(`\nTesting ${scale}x scale (${scale === 1 ? 'original' : scale + ' copies'})...`);

        let testContent;
        if (scale === 1) {
            testContent = baseContent;
        } else {
            testContent = scaleDocument(baseContent, scale);
        }

        const scaledAnalysis = analyzeDocument(testContent);
        console.log(`  Size: ${scaledAnalysis.totalChars.toLocaleString()} characters`);
        console.log(`  Lines: ${scaledAnalysis.totalLines.toLocaleString()}`);
        console.log(`  Annotations: ${scaledAnalysis.annotations}`);

        // Adjust iterations based on document size
        const iterations = scale <= 2 ? 20 : scale <= 5 ? 10 : 5;

        console.log(`  Running ${iterations} iterations...`);
        const perf = measureParsePerformance(testContent, iterations);

        console.log(`  Results:`);
        console.log(`    Average: ${perf.avgTime.toFixed(2)}ms`);
        console.log(`    Min: ${perf.minTime.toFixed(2)}ms`);
        console.log(`    Max: ${perf.maxTime.toFixed(2)}ms`);
        console.log(`    Median: ${perf.medianTime.toFixed(2)}ms`);
        console.log(`    Memory (heap): ${(perf.memoryDelta.heapUsed / 1024 / 1024).toFixed(2)} MB`);

        // Extract quad statistics from last result
        const lastResult = perf.lastResult;
        console.log(`  Output:`);
        console.log(`    Quads: ${lastResult.quads.length}`);
        console.log(`    Remove: ${lastResult.remove.length}`);
        console.log(`    Statements: ${lastResult.statements.length}`);
        console.log(`    Origin entries: ${lastResult.origin.quadIndex.size}`);

        // Calculate per-character and per-quad metrics
        const timePerChar = (perf.avgTime / scaledAnalysis.totalChars) * 1000; // μs
        const timePerQuad = (perf.avgTime / lastResult.quads.length) * 1000; // μs
        const memoryPerQuad = perf.memoryDelta.heapUsed / lastResult.quads.length;

        console.log(`  Efficiency:`);
        console.log(`    Time per char: ${timePerChar.toFixed(3)} μs`);
        console.log(`    Time per quad: ${timePerQuad.toFixed(3)} μs`);
        console.log(`    Memory per quad: ${memoryPerQuad.toFixed(0)} bytes`);

        results.push({
            scale,
            analysis: scaledAnalysis,
            performance: perf,
            efficiency: {
                timePerChar,
                timePerQuad,
                memoryPerQuad
            }
        });
    }

    // Summary comparison
    console.log('\n\nScaling Analysis Summary');
    console.log('========================\n');

    console.log('Performance at Scale:');
    console.log('Scale\tChars\t\tQuads\t\tTime (ms)\tTime/Char (μs)\tTime/Quad (μs)');
    console.log('-----\t-----\t\t-----\t\t---------\t--------------\t--------------');

    for (const r of results) {
        console.log(`${r.scale}x\t${r.analysis.totalChars.toLocaleString().padStart(7)}\t` +
            `${r.performance.lastResult.quads.length.toLocaleString().padStart(7)}\t` +
            `${r.performance.avgTime.toFixed(2).padStart(9)}\t` +
            `${r.efficiency.timePerChar.toFixed(3).padStart(14)}\t` +
            `${r.efficiency.timePerQuad.toFixed(3).padStart(14)}`);
    }

    // Scaling factor analysis
    console.log('\nScaling Efficiency:');
    console.log('Scale\tTime Ratio\tMemory Ratio\tEfficiency');
    console.log('-----\t----------\t------------\t----------');

    const base = results[0];
    for (let i = 1; i < results.length; i++) {
        const r = results[i];
        const timeRatio = r.performance.avgTime / base.performance.avgTime;
        const memRatio = r.performance.memoryDelta.heapUsed / base.performance.memoryDelta.heapUsed;
        const idealRatio = r.scale;
        const efficiency = (idealRatio / timeRatio * 100).toFixed(1);

        console.log(`${r.scale}x\t${timeRatio.toFixed(2)}x\t\t${memRatio.toFixed(2)}x\t\t${efficiency}%`);
    }

    // Baseline for tokenization comparison
    console.log('\n\nBASELINE RECORDED FOR TOKENIZATION COMPARISON');
    console.log('==============================================\n');

    console.log('Current Parser (Regex + Character hybrid):');
    console.log(`  1x document: ${results[0].performance.avgTime.toFixed(2)}ms, ` +
        `${results[0].performance.lastResult.quads.length} quads`);
    console.log(`  10x document: ${results[3].performance.avgTime.toFixed(2)}ms, ` +
        `${results[3].performance.lastResult.quads.length} quads`);
    console.log(`  Efficiency: ${results[0].efficiency.timePerChar.toFixed(3)} μs/char, ` +
        `${results[0].efficiency.timePerQuad.toFixed(3)} μs/quad`);

    console.log('\nTarget for Tokenizer (Character-based):');
    console.log('  Expected: 8-12x speed improvement');
    console.log(`  Target 1x: ${(results[0].performance.avgTime / 10).toFixed(2)}ms (10x faster)`);
    console.log(`  Target 10x: ${(results[3].performance.avgTime / 10).toFixed(2)}ms (10x faster)`);

    // Save results to file for comparison
    const baselineResults = {
        timestamp: new Date().toISOString(),
        document: 'prov-o.md',
        parser: 'current-hybrid',
        results: results.map(r => ({
            scale: r.scale,
            chars: r.analysis.totalChars,
            lines: r.analysis.totalLines,
            annotations: r.analysis.annotations,
            quads: r.performance.lastResult.quads.length,
            remove: r.performance.lastResult.remove.length,
            statements: r.performance.lastResult.statements.length,
            avgTime: r.performance.avgTime,
            minTime: r.performance.minTime,
            maxTime: r.performance.maxTime,
            memoryHeap: r.performance.memoryDelta.heapUsed,
            timePerChar: r.efficiency.timePerChar,
            timePerQuad: r.efficiency.timePerQuad,
            memoryPerQuad: r.efficiency.memoryPerQuad
        }))
    };

    const fs = await import('fs');
    const baselinePath = join(__dirname, 'prov-o-baseline-results.json');
    fs.writeFileSync(baselinePath, JSON.stringify(baselineResults, null, 2));

    console.log(`\nBaseline results saved to: ${baselinePath}`);

    return baselineResults;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runProvOBenchmark().catch(err => {
        console.error('Benchmark failed:', err);
        process.exit(1);
    });
}

export { runProvOBenchmark, loadProvO, scaleDocument, measureParsePerformance }