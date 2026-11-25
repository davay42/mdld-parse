import { generate, parse, DataFactory } from '../src/index.js';

const { namedNode, literal, quad } = DataFactory;
const XSD = 'http://www.w3.org/2001/XMLSchema#';
const CONTEXT = {
    ex: 'http://example.org/',
    xsd: XSD,
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#'
};

function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function pick(rng, items) {
    return items[Math.floor(rng() * items.length)];
}

function randInt(rng, max) {
    return Math.floor(rng() * max);
}

const MARKERS = [
    '[', ']', '[]', '][', '][[', '`', '``', '```', '~~~', '{', '}', '\\',
    '*', '_', '<', '>', '@', '#', '^', '&', '%', '$', '=', '!', '?', '|', '~',
    '\t', '\n', '\r\n', ' {', ' }', 'label', '^^', '@en'
];

const UNICODE_RANGES = [
    () => String.fromCharCode(0x20 + randInt(rngRef, 0x5f)),
    () => String.fromCharCode(0xa0 + randInt(rngRef, 0x150)),
    () => String.fromCharCode(0x300 + randInt(rngRef, 0x70)),
    () => String.fromCharCode(0x370 + randInt(rngRef, 0x90)),
    () => String.fromCharCode(0x400 + randInt(rngRef, 0x100)),
    () => String.fromCharCode(0x4e00 + randInt(rngRef, 0x5000)),
    () => String.fromCodePoint(0x1f300 + randInt(rngRef, 0x500)),
    () => String.fromCharCode(0x2000 + randInt(rngRef, 0x6f)),
    () => String.fromCharCode(0xfe00 + randInt(rngRef, 0x20))
];

let rngRef = mulberry32(1);

function randomPart() {
    const r = rngRef();
    if (r < 0.42) return pick(rngRef, MARKERS);
    if (r < 0.72) return UNICODE_RANGES[randInt(rngRef, UNICODE_RANGES.length)]();
    return String.fromCharCode(0x20 + randInt(rngRef, 0x5f));
}

function randomValue() {
    const parts = randInt(rngRef, 38);
    let value = '';
    for (let i = 0; i < parts; i++) value += randomPart();
    return value;
}

const LANGS = ['en', 'en-us', 'de'];
const DATATYPES = [
    XSD + 'string', XSD + 'integer', XSD + 'decimal', XSD + 'double', XSD + 'float',
    XSD + 'date', XSD + 'dateTime', XSD + 'boolean', 'http://example.org/Custom'
];

function randomLiteral() {
    const value = randomValue();
    const kind = randInt(rngRef, 10);
    if (kind < 6) return literal(value);
    if (kind < 8) return literal(value, pick(rngRef, LANGS));
    return literal(value, namedNode(pick(rngRef, DATATYPES)));
}

function termKey(term) {
    return [term.termType, term.value, term.language || '', term.datatype?.value || ''].join('|');
}

function runBatch(seed, count) {
    rngRef = mulberry32(seed);
    const subject = namedNode('http://example.org/s');
    const expected = [];
    let signal = 0;

    for (let i = 0; i < count; i++) {
        const predicate = namedNode(`http://example.org/p${String(i).padStart(4, '0')}`);
        const object = randomLiteral();
        signal += Math.max(1, object.value.length);
        expected.push({ predicate, object, key: termKey(object) });
    }

    const quads = expected.map(e => quad(subject, e.predicate, e.object));
    const { text } = generate({ quads, context: CONTEXT });
    const parsed = parse({ text, context: CONTEXT });
    const regen = generate({ quads: parsed.quads, context: CONTEXT }).text;

    const actual = new Map();
    for (const q of parsed.quads) actual.set(q.predicate.value, termKey(q.object));

    const failures = [];
    let matches = 0;
    for (const e of expected) {
        const got = actual.get(e.predicate.value);
        if (got === e.key) matches++;
        else if (failures.length < 6) {
            failures.push({
                predicate: e.predicate.value,
                value: JSON.stringify(e.object.value).slice(0, 160),
                language: e.object.language || '',
                datatype: e.object.datatype?.value || '',
                expected: e.key,
                actual: got || '<missing>'
            });
        }
    }

    return {
        total: count,
        matches,
        clean: parsed.quads.length === quads.length,
        stable: regen === text,
        noiseSignalRatio: text.length / Math.max(1, signal),
        failures,
        parsedCount: parsed.quads.length
    };
}

export const canonicalRoundtripTests = [
    {
        name: 'stochastic literal carrier round-trip safety',
        fn: () => {
            const batches = [
                runBatch(0xC0FFEE, 420),
                runBatch(0x5EED5, 420),
                runBatch(0xBEEF, 420)
            ];
            const total = batches.reduce((n, b) => n + b.total, 0);
            const matches = batches.reduce((n, b) => n + b.matches, 0);
            const clean = batches.every(b => b.clean);
            const stable = batches.every(b => b.stable);
            const noiseSignalRatio = batches.reduce((n, b) => n + b.noiseSignalRatio, 0) / batches.length;

            if (matches !== total || !clean || !stable) {
                const first = batches.flatMap(b => b.failures)[0] || batches.find(b => !b.clean || !b.stable);
                throw new Error(
                    `literal carrier round-trip unsafe: ${matches}/${total} matched ` +
                    `(clean=${clean}, stable=${stable}, noise/signal=${noiseSignalRatio.toFixed(2)}). ` +
                    `First failure: ${JSON.stringify(first)}`
                );
            }
        }
    }
];
