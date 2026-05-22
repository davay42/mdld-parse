import { DEFAULT_CONTEXT, RDFS_LABEL, RDF_TYPE, RDF_STATEMENT, RDF_SUBJECT, RDF_PREDICATE, RDF_OBJECT, XSD_STRING, XSD_BOOLEAN, XSD_INTEGER, XSD_DOUBLE } from './constants.js';
import { parseSemanticBlock, expandIRI, shortenIRI } from './utils.js';

// Cache for fence regex patterns
export const FENCE_CLOSE_PATTERNS = new Map();

export function getFenceClosePattern(fenceChar) {
    if (!FENCE_CLOSE_PATTERNS.has(fenceChar)) {
        FENCE_CLOSE_PATTERNS.set(fenceChar, new RegExp(`^(${fenceChar}{3,})`));
    }
    return FENCE_CLOSE_PATTERNS.get(fenceChar);
}

// Range calculation utilities - shared between parser and renderer
export function calcRangeInfo(line, attrs, lineStart, prefixLength, valueLength) {
    const wsLength = prefixLength < line.length && line[prefixLength] === ' ' ? 1 :
        line.slice(prefixLength).match(/^\s+/)?.[0]?.length || 0;
    const valueStartInLine = prefixLength + wsLength;
    return {
        valueRange: [lineStart + valueStartInLine, lineStart + valueStartInLine + valueLength],
        attrsRange: calcAttrsRange(line, attrs, lineStart)
    };
}

export function calcAttrsRange(line, attrs, lineStart) {
    if (!attrs) return null;
    const attrsStartInLine = line.lastIndexOf(attrs);
    return attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null;
}

// Token creation utilities - shared structure
export function createToken(type, range, text, attrs = null, attrsRange = null, valueRange = null, extra = {}) {
    const token = { type, range, text, attrs, attrsRange, valueRange, ...extra };
    Object.defineProperty(token, '_carriers', {
        enumerable: false, writable: true, value: null
    });
    return token;
}

// List token creation - shared logic
export function createListToken(type, line, lineStart, pos, match) {
    const attrs = match[4] || null;
    const prefix = match[1].length + (match[2] ? match[2].length : 0);
    const rangeInfo = calcRangeInfo(line, attrs, lineStart, prefix, match[3].length);
    return createToken(type, [lineStart, pos - 1], match[3].trim(), attrs,
        rangeInfo.attrsRange, rangeInfo.valueRange, { indent: match[1].length });
}

// Semantic block parsing - shared between parser and renderer
export const semCache = {};
export const EMPTY_SEM = Object.freeze({ predicates: [], types: [], subject: null });

export function parseSemCached(attrs) {
    if (!attrs) return EMPTY_SEM;
    let sem = semCache[attrs];
    if (!sem) {
        sem = Object.freeze(parseSemanticBlock(attrs));
        semCache[attrs] = sem;
    }
    return sem;
}

// Indentation utilities - shared for list processing
export function getIndentLevel(block, sourceText) {
    if (!block.range || !sourceText) return 0;

    const text = sourceText.substring(block.range.start, block.range.end);
    const indentMatch = text.match(/^(\s*)/);
    const indentSpaces = indentMatch ? indentMatch[1].length : 0;

    // CommonMark: 4 spaces or 1 tab = one level
    // We'll use 2 spaces for better readability (configurable)
    return Math.floor(indentSpaces / 2);
}

// Content extraction utilities - shared between parser and renderer
export function extractContentFromRange(sourceText, range, attrsRange = null) {
    if (!range || !sourceText) return '';

    let text = sourceText.substring(range[0], range[1]);

    // Remove MD-LD annotations, preserve content
    if (attrsRange) {
        const beforeAttrs = text.substring(0, attrsRange[0] - range[0]);
        const afterAttrs = text.substring(attrsRange[1] - range[0]);
        text = beforeAttrs + afterAttrs;
    }

    return text.trim();
}

// Clean text extraction utilities
export function extractCleanText(token) {
    if (!token.text) return '';

    let text = token.text;

    // Remove block-level semantic annotations
    if (token.attrsRange) {
        const beforeAttrs = text.substring(0, token.attrsRange[0] - (token.range?.[0] || 0));
        const afterAttrs = text.substring(token.attrsRange[1] - (token.range?.[0] || 0));
        text = beforeAttrs + afterAttrs;
    }

    // Remove inline carrier annotations
    const carriers = token._carriers || [];
    const inlineRanges = carriers
        .filter(carrier => carrier.attrsRange)
        .map(carrier => carrier.attrsRange.map(pos => pos - (token.range?.[0] || 0)))
        .filter(([start, end]) => start >= 0 && end <= text.length)
        .sort((a, b) => b[0] - a[0]);

    for (const [relativeStart, relativeEnd] of inlineRanges) {
        const before = text.substring(0, relativeStart);
        const after = text.substring(relativeEnd);
        text = before + after;
    }

    // Clean based on token type
    switch (token.type) {
        case 'heading':
            return text.replace(/^#+\s*/, '').trim();
        case 'list':
            return text.replace(/^[-*+]\s*/, '').trim();
        case 'blockquote':
            return text.replace(/^>\s*/, '').trim();
        default:
            return text.trim();
    }
}

// Quad emission utilities

export function createLeanOriginEntry(block, subject, predicate, meta = null) {
    return {
        blockId: block.id,
        range: block.range,
        valueRange: block.valueRange || null,
        carrierType: block.carrierType,
        subject: subject.value,
        predicate: predicate.value,
        context: block.context, // Direct reference instead of spread
        polarity: meta?.remove ? '-' : '+',
        value: block.text || ''
    };
}

// Fragment resolution utilities
export function resolveFragment(fragment, currentSubject, dataFactory) {
    if (!currentSubject) return null;
    const subjectValue = currentSubject.value;
    const hashIndex = subjectValue.indexOf('#');
    const baseIRI = hashIndex > -1 ? subjectValue.slice(0, hashIndex) : subjectValue;
    return dataFactory.namedNode(baseIRI + '#' + fragment);
}

export function resolveSubject(sem, state) {
    if (!sem.subject) return null;
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return null;
    }
    if (sem.subject.startsWith('=#')) return resolveFragment(sem.subject.substring(2), state.currentSubject, state.df);
    return state.df.namedNode(expandIRI(sem.subject, state.ctx));
}

export function resolveObject(sem, state) {
    if (!sem.object) return null;
    if (sem.object.startsWith('#')) return resolveFragment(sem.object.substring(1), state.currentSubject, state.df);
    return state.df.namedNode(expandIRI(sem.object, state.ctx));
}

// HTML escaping - shared utility
export function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// RDF term type checking utilities - shared across modules
export function isLiteral(term) {
    return term?.termType === 'Literal';
}

export function isNamedNode(term) {
    return term?.termType === 'NamedNode';
}

export function isRdfType(term) {
    return term?.value === RDF_TYPE;
}

// IRI prefix extraction utility
export function getPrefixFromIRI(iri, context) {
    if (!iri) return null;
    const shortened = shortenIRI(iri, context);
    if (shortened.includes(':')) {
        return shortened.split(':')[0];
    }
    return null;
}

// Prefix collection utility - used by generate.js
export function collectUsedPrefixes(subjectGroups, context) {
    const usedPrefixes = new Set();

    for (const subjectQuads of subjectGroups.values()) {
        for (const quad of subjectQuads) {
            // Check subject prefix
            const subjectPrefix = getPrefixFromIRI(quad.subject.value, context);
            if (subjectPrefix) usedPrefixes.add(subjectPrefix);

            // Check predicate prefix
            const predicatePrefix = getPrefixFromIRI(quad.predicate.value, context);
            if (predicatePrefix) usedPrefixes.add(predicatePrefix);

            // Check object prefix if it's a named node
            if (isNamedNode(quad.object)) {
                const objectPrefix = getPrefixFromIRI(quad.object.value, context);
                if (objectPrefix) usedPrefixes.add(objectPrefix);
            }

            // Check datatype prefix if present
            if (quad.object.datatype && quad.object.datatype.value) {
                const datatypePrefix = getPrefixFromIRI(quad.object.datatype.value, context);
                if (datatypePrefix) usedPrefixes.add(datatypePrefix);
            }
        }
    }

    return usedPrefixes;
}

// Token processing utility - eliminates duplication in TOKEN_PROCESSORS
export function processTokenWithBlockTracking(token, state, processAnnotations, createBlockEntry, additionalProcessors = []) {
    const blockEntry = createBlockEntry(token, state);
    state.currentBlock = blockEntry;
    state.blockStack.push(blockEntry.id);

    // Run any additional processors first
    additionalProcessors.forEach(processor => processor(token, state));

    // Process annotations
    processAnnotations(token, state, token.type);

    state.blockStack.pop();
    state.currentBlock = state.blockStack.length > 0 ?
        state.origin.blocks.get(state.blockStack[state.blockStack.length - 1]) : null;
}

// Quad key generation - shared between parser and renderer
export function quadIndexKey(subject, predicate, object) {
    const datatype = object.datatype?.value || '';
    const language = object.language || '';
    return `${subject.value}|${predicate.value}|${object.value}|${datatype}|${language}`;
}

// Optimized sorting utilities - inline for better minification
export function sortQuadsByPredicate(quads) {
    return quads.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));
}

// Optimized text generation - template literals for smaller bundle
export const generatePrefixDeclaration = (prefix, namespace) => `[${prefix}] <${namespace}>\n`;

export function generateLiteralText(quad, context) {
    const predShort = shortenIRI(quad.predicate.value, context);
    let annotation = predShort;

    if (quad.object.language) {
        annotation += ` @${quad.object.language}`;
    } else if (quad.object.datatype.value !== XSD_STRING) {
        annotation += ` ^^${shortenIRI(quad.object.datatype.value, context)}`;
    }

    // Get clean value (handle both RDF/JS Literal objects and plain strings)
    const rawValue = quad.object.value || quad.object;
    const value = typeof rawValue === 'string' ? rawValue : String(rawValue);

    // Get datatype for styling decisions
    const datatype = quad.object.datatype?.value || '';

    // Multiline: fenced block (safe for arbitrary content)
    if (value.includes('\n')) {
        return `~~~ {${annotation}}\n${value}\n~~~\n\n`;
    }

    // Numbers (integer, decimal, double, float): code spans
    if (datatype.includes('integer') || datatype.includes('decimal') || datatype.includes('double') || datatype.includes('float')) {
        return `\`${value}\` {${annotation}}\n`;
    }

    if (datatype.includes('date') || datatype.includes('time')) {
        return `*${value}* {${annotation}}\n`;
    }

    // Booleans: bold (stands out visually)
    if (datatype.includes('boolean')) {
        return `**${value}** {${annotation}}\n`;
    }

    // Everything else (strings, dates, etc.): square brackets (simple, readable)
    return `[${value}] {${annotation}}\n`;
}

export const generateObjectText = (quad, context, labelLookup = null, filteredGroups = null, renderedQuads = null, compactInline = true, compactStats = null) => {
    const objShort = shortenIRI(quad.object.value, context);
    const predShort = shortenIRI(quad.predicate.value, context);

    // Use rdfs:label if available, otherwise use shortened IRI
    const displayText = labelLookup && labelLookup.has(quad.object.value)
        ? labelLookup.get(quad.object.value)
        : objShort;

    // Build inline type/label annotation if available
    // Only render inline types/labels ONCE per subject to ensure quad stability
    let inlineAnnotation = '';
    if (compactInline && filteredGroups && labelLookup && renderedQuads) {
        const filtered = filteredGroups.get(quad.object.value);
        if (filtered) {
            const { types } = filtered;
            const hasLabel = labelLookup.has(quad.object.value);

            // Check if any type or label quad for this subject has already been rendered
            const alreadyRendered = types.some(t => renderedQuads.has(t)) ||
                (hasLabel && types.some(t =>
                    t.predicate.value === RDFS_LABEL && renderedQuads.has(t)
                ));

            if (!alreadyRendered) {
                // Build inline types and label
                const typeAnnotations = types.length > 0
                    ? types.map(t => '.' + shortenIRI(t.object.value, context)).sort().join(' ')
                    : '';
                const labelAnnotation = hasLabel ? 'label' : '';

                if (typeAnnotations || labelAnnotation) {
                    inlineAnnotation = ' ' + [typeAnnotations, labelAnnotation].filter(Boolean).join(' ');
                    if (compactStats) {
                        compactStats.inlineAnnotations++;
                    }

                    // Mark only the type and label quads as rendered inline
                    types.forEach(q => renderedQuads.add(q));
                    if (hasLabel) {
                        const labelQuad = types.find(q => q.predicate.value === RDFS_LABEL);
                        if (labelQuad) renderedQuads.add(labelQuad);
                    }
                }
            }
        }
    }

    // Object links: italic
    return `[${displayText}] {+${objShort} ?${predShort}${inlineAnnotation}}\n`;
};

// Optimized quad filtering - destructuring for smaller minified output
export function filterQuadsByType(subjectQuads) {
    const types = [], literals = [], objects = [];
    for (const q of subjectQuads) {
        if (isRdfType(q.predicate)) {
            types.push(q);
        } else if (isLiteral(q.object)) {
            literals.push(q);
        } else if (isNamedNode(q.object)) {
            objects.push(q);
        }
    }
    return { types, literals, objects };
}

// Predicate processing utilities - common RDFa patterns
export function processPredicates(predicates, ctx) {
    const literalProps = [];
    const objectProps = [];
    const reverseProps = [];

    predicates.forEach(pred => {
        const iri = typeof pred === 'string' ? pred : pred.iri;
        const expanded = expandIRI(iri, ctx);
        const shortened = shortenIRI(expanded, ctx);
        const form = typeof pred === 'string' ? '' : (pred.form || '');

        if (form === '!') {
            reverseProps.push(shortened);
        } else if (form === '?') {
            objectProps.push(shortened);
        } else {
            literalProps.push(shortened);
        }
    });

    return { literalProps, objectProps, reverseProps };
}

