import { DEFAULT_CONTEXT, STANDALONE_SUBJECT_REGEX, FENCE_REGEX, PREFIX_REGEX, HEADING_REGEX, UNORDERED_LIST_REGEX, BLOCKQUOTE_REGEX } from './constants.js';
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

export function createCarrier(type, text, attrs, attrsRange, valueRange, range, pos, extra = {}) {
    return { type, text, attrs, attrsRange, valueRange, range, pos, ...extra };
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

// List marker utilities - shared for advanced list processing
export function getListMarker(block, sourceText) {
    if (!block.range) return null;

    const text = sourceText.substring(block.range.start, block.range.end);
    const markerMatch = text.match(/^(\s*)([-*+]|\d+\[\.|\])\s+/);

    if (!markerMatch) return null;

    return {
        type: markerMatch[2].startsWith('-') ? 'dash' :
            markerMatch[2].startsWith('*') ? 'asterisk' :
                markerMatch[2].startsWith('+') ? 'plus' : 'ordered',
        marker: markerMatch[2],
        indent: markerMatch[1].length
    };
}

// CommonMark line processors - shared between parser and renderer
export const PROCESSORS = [
    { test: line => line.startsWith('```'), process: null }, // Code blocks handled separately
    { test: line => line.startsWith('`'), process: null },    // Code spans handled separately  
    { test: line => PREFIX_REGEX.test(line), process: null }, // Prefixes handled separately
    { test: line => HEADING_REGEX.test(line), process: null }, // Headings handled separately
    { test: line => UNORDERED_LIST_REGEX.test(line), process: null }, // Lists handled separately
    { test: line => BLOCKQUOTE_REGEX.test(line), process: null }, // Blockquotes handled separately
    { test: line => STANDALONE_SUBJECT_REGEX.test(line), process: null }, // Standalone subjects handled separately
    { test: line => line.trim() === '', process: null }, // Empty lines handled separately
    { test: line => true, process: null } // Default: paragraph
];

// Token scanning processors - shared between parser and renderer
export const TOKEN_PROCESSORS = [
    { type: 'fence', test: line => FENCE_REGEX.test(line.trim()), process: null }, // Will be overridden in parse.js
    { type: 'content', test: line => false, process: null }, // Will be overridden in parse.js  
    { type: 'prefix', test: line => PREFIX_REGEX.test(line), process: null }, // Will be overridden in parse.js
    { type: 'heading', test: line => HEADING_REGEX.test(line), process: null }, // Will be overridden in parse.js
    { type: 'list', test: line => UNORDERED_LIST_REGEX.test(line), process: null }, // Will be overridden in parse.js
    { type: 'blockquote', test: line => BLOCKQUOTE_REGEX.test(line), process: null }, // Will be overridden in parse.js
    { type: 'para', test: line => line.trim(), process: null } // Will be overridden in parse.js
];

// Language and attributes parsing
export function parseLangAndAttrs(langAndAttrs) {
    const spaceIndex = langAndAttrs.indexOf(' ');
    const braceIndex = langAndAttrs.indexOf('{');
    const langEnd = Math.min(
        spaceIndex > -1 ? spaceIndex : Infinity,
        braceIndex > -1 ? braceIndex : Infinity
    );
    return {
        lang: langAndAttrs.substring(0, langEnd),
        attrsText: langAndAttrs.substring(langEnd).match(/\{[^{}]*\}/)?.[0] || null
    };
}

// Carrier extraction utilities
export function findMatchingBracket(text, bracketStart) {
    let bracketDepth = 1;
    let bracketEnd = bracketStart + 1;

    while (bracketEnd < text.length && bracketDepth > 0) {
        if (text[bracketEnd] === '[') bracketDepth++;
        else if (text[bracketEnd] === ']') bracketDepth--;
        bracketEnd++;
    }

    return bracketDepth > 0 ? null : bracketEnd;
}

export function extractUrlFromBrackets(text, bracketEnd) {
    let url = null;
    let spanEnd = bracketEnd;

    if (text[spanEnd] === '(') {
        const parenEnd = text.indexOf(')', spanEnd);
        if (parenEnd !== -1) {
            url = text.substring(spanEnd + 1, parenEnd);
            spanEnd = parenEnd + 1;
        }
    }

    return { url, spanEnd };
}

export function extractAttributesFromText(text, spanEnd, baseOffset) {
    let attrs = null;
    let attrsRange = null;
    const remaining = text.substring(spanEnd);

    const wsMatch = remaining.match(/^\s+/);
    const attrsStart = wsMatch ? wsMatch[0].length : 0;

    if (remaining[attrsStart] === '{') {
        const braceEnd = remaining.indexOf('}', attrsStart);
        if (braceEnd !== -1) {
            attrs = remaining.substring(attrsStart, braceEnd + 1);
            const absStart = baseOffset + spanEnd + attrsStart;
            attrsRange = [absStart, absStart + attrs.length];
            spanEnd += braceEnd + 1;
        }
    }

    return { attrs, attrsRange, finalSpanEnd: spanEnd };
}

export function determineCarrierType(url) {
    if (url && !url.startsWith('=')) {
        return { carrierType: 'link', resourceIRI: url };
    }
    return { carrierType: 'span', resourceIRI: null };
}

export function calcCarrierRanges(match, baseOffset, matchStart) {
    const valueStart = baseOffset + matchStart + match[0].indexOf(match[1]);
    const valueEnd = valueStart + match[1].length;
    const attrsStart = baseOffset + matchStart + match[0].indexOf('{');
    const attrsEnd = attrsStart + match[2].length + 2; // +2 for { and }
    return {
        valueRange: [valueStart, valueEnd],
        attrsRange: [attrsStart + 1, attrsEnd - 1], // Exclude braces
        range: [baseOffset + matchStart, attrsEnd],
        pos: matchStart + match[0].length // pos should be relative to current text, not document
    };
}

// Clean text extraction utilities
export function extractCleanText(token) {
    if (!token.text) return '';

    let text = token.text;

    // Remove semantic annotations
    if (token.attrsRange) {
        const beforeAttrs = text.substring(0, token.attrsRange[0] - (token.range?.[0] || 0));
        const afterAttrs = text.substring(token.attrsRange[1] - (token.range?.[0] || 0));
        text = beforeAttrs + afterAttrs;
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
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const RDF_STATEMENT = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement';
export const RDF_SUBJECT = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject';
export const RDF_PREDICATE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate';
export const RDF_OBJECT = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object';

export function createLeanOriginEntry(block, subject, predicate, meta = null) {
    return {
        blockId: block.id,
        range: block.range,
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
    return term?.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
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

// IRI expansion and shortening - shared utilities
export function expandAndShortenIRI(iri, ctx) {
    const expanded = expandIRI(iri, ctx);
    return shortenIRI(expanded, ctx);
}

// Subject resolution utilities - shared between parser and renderer
export function resolveSubjectType(subjectDecl) {
    if (!subjectDecl) return 'none';

    if (subjectDecl.startsWith('=#')) {
        return 'fragment';
    }

    if (subjectDecl.startsWith('+')) {
        return 'soft-object';
    }

    if (subjectDecl === 'RESET') {
        return 'reset';
    }

    return 'full-iri';
}

// Constants - shared across modules (bundle-size optimized)
export const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';

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

export const generateObjectText = (quad, context, labelLookup = null) => {
    const objShort = shortenIRI(quad.object.value, context);
    const predShort = shortenIRI(quad.predicate.value, context);

    // Use rdfs:label if available, otherwise use shortened IRI
    const displayText = labelLookup && labelLookup.has(quad.object.value)
        ? labelLookup.get(quad.object.value)
        : objShort;

    // Object links: italic
    return `[${displayText}] {+${objShort} ?${predShort}}\n`;
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

// Deterministic sorting utilities - ensure consistent output
export function sortDeterministic(array, keyFn) {
    return array.sort((a, b) => {
        const keyA = keyFn(a);
        const keyB = keyFn(b);
        return keyA.localeCompare(keyB);
    });
}

export function sortQuadsDeterministically(quads) {
    return quads.sort((a, b) => {
        // Deterministic sorting: subject -> predicate -> object
        const sComp = a.subject.value.localeCompare(b.subject.value);
        if (sComp !== 0) return sComp;
        const pComp = a.predicate.value.localeCompare(b.predicate.value);
        if (pComp !== 0) return pComp;
        const oA = isLiteral(a.object) ? a.object.value : a.object.value;
        const oB = isLiteral(b.object) ? b.object.value : b.object.value;
        return oA.localeCompare(oB);
    });
}

// Optimized deterministic prefix generation
export function generateDeterministicPrefixes(context, usedPrefixes) {
    const sortedEntries = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
    let text = '';

    for (const [prefix, namespace] of sortedEntries) {
        if (prefix !== '@vocab' && !prefix.startsWith('@') && !DEFAULT_CONTEXT[prefix] && usedPrefixes.has(prefix)) {
            text += generatePrefixDeclaration(prefix, namespace);
        }
    }

    return text;
}

// Memory-efficient block creation
export function createOptimizedBlockEntry(token, state) {
    const id = hash(`${token.range[0]}-${token.range[1]}-${token.text.slice(0, 50)}`);
    const block = {
        id,
        type: token.type,
        carrierType: token.type,
        range: token.range,
        text: token.text,
        carriers: [],
        predicates: [],
        subject: state.currentSubject,
        context: { ...state.ctx }
    };

    state.origin.blocks.set(id, block);
    return block;
}
