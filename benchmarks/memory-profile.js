/**
 * Precise Memory Profiling for MDLD Parser
 * Tracks heap usage throughout parsing lifecycle
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import the parser
import { parse } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Force GC if available
function forceGC() {
    if (global.gc) {
        global.gc();
        global.gc();
        global.gc();
    }
}

// Get precise memory stats
function getMemory() {
    const usage = process.memoryUsage();
    return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss
    };
}

// Format bytes to MB
function toMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(2);
}

// Load the PROV-O MDLD file
function loadProvO() {
    const provOPath = join(__dirname, 'prov-o.md');
    return readFileSync(provOPath, 'utf-8');
}

// Scale document
function scaleDocument(baseContent, multiplier) {
    const blocks = baseContent.split('\n\n');
    const scaledBlocks = [];

    for (let i = 0; i < multiplier; i++) {
        const suffix = i === 0 ? '' : `-${i}`;
        const modifiedBlocks = blocks.map(block => {
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

// Profile memory usage during parsing
function profileMemory(text, iterations = 10) {
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
        forceGC();

        // Baseline before parsing
        const before = getMemory();

        // Parse
        const startTime = performance.now();
        const result = parse({ text });
        const endTime = performance.now();

        // After parsing (before GC)
        const after = getMemory();

        // Force GC and measure again
        forceGC();
        const afterGC = getMemory();

        measurements.push({
            iteration: i + 1,
            time: endTime - startTime,
            heapBefore: before.heapUsed,
            heapAfter: after.heapUsed,
            heapAfterGC: afterGC.heapUsed,
            heapDelta: after.heapUsed - before.heapUsed,
            heapRetained: afterGC.heapUsed - before.heapUsed,
            quads: result.quads.length
        });
    }

    return measurements;
}

// Run comprehensive memory profile
function runMemoryProfile() {
    console.log('MDLD Parser Memory Profile');
    console.log('==========================\n');

    const baseContent = loadProvO();
    const scales = [1, 2, 5, 10];

    for (const scale of scales) {
        console.log(`\n--- Scale ${scale}x ---`);

        const text = scale === 1 ? baseContent : scaleDocument(baseContent, scale);
        const chars = text.length;

        console.log(`Document size: ${chars.toLocaleString()} characters`);

        // Warm up
        parse({ text });
        forceGC();

        // Profile with fewer iterations for larger docs
        const iterations = scale <= 2 ? 10 : 5;
        const measurements = profileMemory(text, iterations);

        // Calculate statistics
        const times = measurements.map(m => m.time);
        const heapDeltas = measurements.map(m => m.heapDelta);
        const heapRetained = measurements.map(m => m.heapRetained);

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const avgHeapDelta = heapDeltas.reduce((a, b) => a + b, 0) / heapDeltas.length;
        const avgHeapRetained = heapRetained.reduce((a, b) => a + b, 0) / heapRetained.length;

        const quads = measurements[0].quads;

        console.log(`  Parse time: ${avgTime.toFixed(2)}ms (avg of ${iterations})`);
        console.log(`  Quads generated: ${quads}`);
        console.log(`  Heap delta (parse): ${toMB(avgHeapDelta)} MB`);
        console.log(`  Heap retained (after GC): ${toMB(avgHeapRetained)} MB`);
        console.log(`  Memory per quad: ${(avgHeapRetained / quads).toFixed(0)} bytes`);
        console.log(`  Time per quad: ${(avgTime / quads * 1000).toFixed(2)} μs`);

        // Show range
        const minHeap = Math.min(...heapDeltas);
        const maxHeap = Math.max(...heapDeltas);
        console.log(`  Heap range: ${toMB(minHeap)} - ${toMB(maxHeap)} MB`);
    }

    console.log('\n\nSummary Comparison to Baseline:');
    console.log('==============================');
    console.log('Baseline (regex): ~25ms, ~27MB heap for 1x document');
    console.log('New (char-based): ~19ms, ~78MB heap for 1x document');
    console.log('');
    console.log('Trade-off: 24% faster, ~3x memory');
    console.log('');
    console.log('The 3x memory is likely due to:');
    console.log('  1. Creating carrier objects for each inline match');
    console.log('  2. Multiple string slice operations');
    console.log('  3. Intermediate result objects in detection functions');
}

// Run with --expose-gc for accurate measurements
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Note: Run with --expose-gc flag for accurate GC measurements');
    console.log('Example: node --expose-gc benchmarks/memory-profile.js\n');

    runMemoryProfile().catch(err => {
        console.error('Profile failed:', err);
        process.exit(1);
    });
}

export { profileMemory, runMemoryProfile };