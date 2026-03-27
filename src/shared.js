/**
 * Shared utilities for MD-LD Parser and Renderer
 * Ensures DRY code and consistent CommonMark processing
 */

export const DEFAULT_CONTEXT = {
    '@vocab': "http://www.w3.org/2000/01/rdf-schema#",
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    sh: "http://www.w3.org/ns/shacl#",
    prov: 'http://www.w3.org/ns/prov#'
};

// CommonMark patterns - shared between parser and renderer
export const URL_REGEX = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/;
export const FENCE_REGEX = /^(`{3,}|~{3,})(.*)/;
export const PREFIX_REGEX = /^\[([^\]]+)\]\s*<([^>]+)>/;
export const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
export const UNORDERED_LIST_REGEX = /^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
export const BLOCKQUOTE_REGEX = /^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
export const STANDALONE_SUBJECT_REGEX = /^\s*\{=(.*?)\}\s*$/;

// Inline carrier patterns - shared extraction logic
export const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};

// Pre-compiled carrier patterns for performance
export const CARRIER_PATTERN_ARRAY = [
    ['EMPHASIS', /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y],
    ['CODE_SPAN', /``(.+?)``\s*\{([^}]+)\}/y]
];

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

// Fragment resolution - shared logic
export function resolveFragment(fragment, currentSubject) {
    if (!currentSubject) {
        throw new Error('Fragment requires current subject');
    }
    const fragmentName = fragment.substring(2); // Remove =#
    const baseIRI = currentSubject.value;
    const hashIndex = baseIRI.indexOf('#');
    const base = hashIndex > -1 ? baseIRI.slice(0, hashIndex) : baseIRI;
    return base + '#' + fragmentName;
}
