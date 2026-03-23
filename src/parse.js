import {
    DEFAULT_CONTEXT,
    DataFactory,
    expandIRI,
    parseSemanticBlock,
    quadIndexKey,
    createLiteral,
    hash
} from './utils.js';

const URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const FENCE_REGEX = /^(`{3,}|~{3,})(.*)/;
const PREFIX_REGEX = /^\[([^\]]+)\]\s*<([^>]+)>/;
const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
const UNORDERED_LIST_REGEX = /^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
const BLOCKQUOTE_REGEX = /^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
const STANDALONE_SUBJECT_REGEX = /^\s*\{=(.*?)\}\s*$/;
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};

// Cache for fence regex patterns to avoid recreation
const FENCE_CLOSE_PATTERNS = new Map();

function getFenceClosePattern(fenceChar) {
    if (!FENCE_CLOSE_PATTERNS.has(fenceChar)) {
        FENCE_CLOSE_PATTERNS.set(fenceChar, new RegExp(`^(${fenceChar}{3,})`));
    }
    return FENCE_CLOSE_PATTERNS.get(fenceChar);
}

function parseLangAndAttrs(langAndAttrs) {
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

const semCache = {};
const EMPTY_SEM = Object.freeze({ predicates: [], types: [], subject: null });

function parseSemCached(attrs) {
    if (!attrs) return EMPTY_SEM;
    let sem = semCache[attrs];
    if (!sem) {
        sem = Object.freeze(parseSemanticBlock(attrs));
        semCache[attrs] = sem;
    }
    return sem;
}

function calcRangeInfo(line, attrs, lineStart, prefixLength, valueLength) {
    const wsLength = prefixLength < line.length && line[prefixLength] === ' ' ? 1 :
        line.slice(prefixLength).match(/^\s+/)?.[0]?.length || 0;
    const valueStartInLine = prefixLength + wsLength;
    return {
        valueRange: [lineStart + valueStartInLine, lineStart + valueStartInLine + valueLength],
        attrsRange: calcAttrsRange(line, attrs, lineStart)
    };
}

function calcAttrsRange(line, attrs, lineStart) {
    if (!attrs) return null;
    const attrsStartInLine = line.lastIndexOf(attrs);
    return attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null;
}

function createToken(type, range, text, attrs = null, attrsRange = null, valueRange = null, extra = {}) {
    const token = { type, range, text, attrs, attrsRange, valueRange, ...extra };
    Object.defineProperty(token, '_carriers', {
        enumerable: false, writable: true, value: null
    });
    return token;
}

function getCarriers(token) {
    if (token.type === 'code') return [];
    return token._carriers || (token._carriers = extractInlineCarriers(token.text, token.range[0]));
}

const createListToken = (type, line, lineStart, pos, match) => {
    const attrs = match[4] || null;
    const prefix = match[1].length + (match[2] ? match[2].length : 0);
    const rangeInfo = calcRangeInfo(line, attrs, lineStart, prefix, match[3].length);
    return createToken(type, [lineStart, pos - 1], match[3].trim(), attrs,
        rangeInfo.attrsRange, rangeInfo.valueRange, { indent: match[1].length });
};

function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let pos = 0;
    let codeBlock = null;

    // Direct lookup instead of linear search
    const PROCESSORS = [
        { type: 'fence', test: line => FENCE_REGEX.test(line.trim()), process: handleFence },
        { type: 'content', test: () => codeBlock, process: line => codeBlock.content.push(line) },
        { type: 'prefix', test: line => PREFIX_REGEX.test(line), process: handlePrefix },
        { type: 'heading', test: line => HEADING_REGEX.test(line), process: handleHeading },
        { type: 'list', test: line => UNORDERED_LIST_REGEX.test(line), process: handleList },
        { type: 'blockquote', test: line => BLOCKQUOTE_REGEX.test(line), process: handleBlockquote },
        { type: 'para', test: line => line.trim(), process: handlePara }
    ];

    function handleFence(line, lineStart, pos) {
        const trimmedLine = line.trim();
        if (!codeBlock) {
            const fenceMatch = trimmedLine.match(FENCE_REGEX);
            if (!fenceMatch) return false;

            const { lang, attrsText } = parseLangAndAttrs(fenceMatch[2]);
            const attrsStartInLine = attrsText ? line.indexOf(attrsText) : -1;
            const contentStart = lineStart + line.length + 1;

            codeBlock = {
                fence: fenceMatch[1],
                start: lineStart,
                content: [],
                lang,
                attrs: attrsText,
                attrsRange: attrsText && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrsText.length] : null,
                valueRangeStart: contentStart
            };
        } else {
            const fenceChar = codeBlock.fence[0];
            const expectedFence = fenceChar.repeat(codeBlock.fence.length);
            const fenceMatch = trimmedLine.match(getFenceClosePattern(fenceChar));

            if (fenceMatch && fenceMatch[1] === expectedFence) {
                const valueStart = codeBlock.valueRangeStart;
                const valueEnd = Math.max(valueStart, lineStart - 1);
                tokens.push({
                    type: 'code',
                    range: [codeBlock.start, lineStart],
                    text: codeBlock.content.join('\n'),
                    lang: codeBlock.lang,
                    attrs: codeBlock.attrs,
                    attrsRange: codeBlock.attrsRange,
                    valueRange: [valueStart, valueEnd]
                });
                codeBlock = null;
            }
        }
        return true;
    }

    function handlePrefix(line, lineStart, pos) {
        const match = PREFIX_REGEX.exec(line);
        tokens.push({ type: 'prefix', prefix: match[1], iri: match[2].trim() });
        return true;
    }

    function handleHeading(line, lineStart, pos) {
        const match = HEADING_REGEX.exec(line);
        const attrs = match[3] || null;
        const afterHashes = match[1].length;
        const rangeInfo = calcRangeInfo(line, attrs, lineStart, afterHashes, match[2].length);
        tokens.push(createToken('heading', [lineStart, pos - 1], match[2].trim(), attrs,
            rangeInfo.attrsRange, rangeInfo.valueRange, { depth: match[1].length }));
        return true;
    }

    function handleList(line, lineStart, pos) {
        const match = UNORDERED_LIST_REGEX.exec(line);
        tokens.push(createListToken('list', line, lineStart, pos, match));
        return true;
    }

    function handleBlockquote(line, lineStart, pos) {
        const match = BLOCKQUOTE_REGEX.exec(line);
        const attrs = match[2] || null;
        const valueStartInLine = line.startsWith('> ') ? 2 : line.indexOf('>') + 1;
        const valueEndInLine = valueStartInLine + match[1].length;
        tokens.push(createToken('blockquote', [lineStart, pos - 1], match[1].trim(), attrs,
            calcAttrsRange(line, attrs, lineStart),
            [lineStart + valueStartInLine, lineStart + valueEndInLine]));
        return true;
    }

    function handlePara(line, lineStart, pos) {
        tokens.push(createToken('para', [lineStart, pos - 1], line.trim()));
        return true;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = pos;
        pos += line.length + 1;

        // Direct processor lookup - O(n) instead of O(n*m)
        for (const processor of PROCESSORS) {
            if (processor.test(line) && processor.process(line, lineStart, pos)) {
                break;
            }
        }
    }

    return tokens;
}

function createCarrier(type, text, attrs, attrsRange, valueRange, range, pos, extra = {}) {
    return { type, text, attrs, attrsRange, valueRange, range, pos, ...extra };
}

function extractInlineCarriers(text, baseOffset = 0) {
    const carriers = [];
    let pos = 0;

    const CARRIER_EXTRACTORS = {
        '<': (text, pos, baseOffset) => {
            const angleEnd = text.indexOf('>', pos);
            if (angleEnd === -1) return null;
            const url = text.slice(pos + 1, angleEnd);
            if (!URL_REGEX.test(url)) return null;
            const { attrs, attrsRange, finalSpanEnd } = extractAttributesFromText(text, angleEnd + 1, baseOffset);
            return createCarrier('link', url, attrs, attrsRange,
                [baseOffset + pos + 1, baseOffset + angleEnd],
                [baseOffset + pos, baseOffset + finalSpanEnd], finalSpanEnd, { url });
        },
        '[': (text, pos, baseOffset) => {
            const bracketEnd = findMatchingBracket(text, pos);
            if (!bracketEnd) return null;
            const carrierText = text.slice(pos + 1, bracketEnd - 1);
            const { url, spanEnd } = extractUrlFromBrackets(text, bracketEnd);
            const { attrs, attrsRange, finalSpanEnd } = extractAttributesFromText(text, spanEnd, baseOffset);
            const { carrierType, resourceIRI } = determineCarrierType(url);
            if (url?.startsWith('=')) return { skip: true, pos: finalSpanEnd };
            return createCarrier(carrierType, carrierText, attrs, attrsRange,
                [baseOffset + pos + 1, baseOffset + bracketEnd - 1],
                [baseOffset + pos, baseOffset + finalSpanEnd], finalSpanEnd, { url: resourceIRI });
        }
    };

    const extractCarrier = (text, pos, baseOffset) => {
        const extractor = CARRIER_EXTRACTORS[text[pos]];
        if (extractor) return extractor(text, pos, baseOffset);

        for (const [type, pattern] of Object.entries(INLINE_CARRIER_PATTERNS)) {
            pattern.lastIndex = pos;
            const match = pattern.exec(text);
            if (match) {
                const ranges = calcCarrierRanges(match, baseOffset, match.index);
                const carrierType = type === 'EMPHASIS' ? 'emphasis' : 'code';
                return createCarrier(carrierType, match[1], `{${match[2]}}`,
                    ranges.attrsRange, ranges.valueRange, ranges.range, ranges.pos);
            }
        }
        return null;
    };

    while (pos < text.length) {
        const carrier = extractCarrier(text, pos, baseOffset);
        if (carrier) {
            if (carrier.skip) {
                pos = carrier.pos;
            } else {
                carriers.push(carrier);
                pos = carrier.pos;
            }
        } else {
            pos++;
        }
    }

    return carriers;
}

function calcCarrierRanges(match, baseOffset, matchStart) {
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

function findMatchingBracket(text, bracketStart) {
    let bracketDepth = 1;
    let bracketEnd = bracketStart + 1;

    while (bracketEnd < text.length && bracketDepth > 0) {
        if (text[bracketEnd] === '[') bracketDepth++;
        else if (text[bracketEnd] === ']') bracketDepth--;
        bracketEnd++;
    }

    return bracketDepth > 0 ? null : bracketEnd;
}

function extractUrlFromBrackets(text, bracketEnd) {
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

function extractAttributesFromText(text, spanEnd, baseOffset) {
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

function determineCarrierType(url) {
    if (url && !url.startsWith('=')) {
        return { carrierType: 'link', resourceIRI: url };
    }
    return { carrierType: 'span', resourceIRI: null };
}

function createBlock(subject, types, predicates, range, attrsRange, valueRange, carrierType, ctx, text) {
    const expanded = {
        subject,
        types: types.map(t => expandIRI(typeof t === 'string' ? t : t.iri, ctx)),
        predicates: predicates.map(p => ({ iri: expandIRI(p.iri, ctx), form: p.form }))
    };

    const signature = [subject, carrierType || 'unknown', expanded.types.join(','), expanded.predicates.map(p => `${p.form}${p.iri}`).join(',')].join('|');
    const blockId = hash(signature);

    return {
        id: blockId,
        range: { start: range[0], end: range[1] },
        carrierType: carrierType || null,
        subject,
        types: expanded.types,
        predicates: expanded.predicates,
        context: ctx,
        text: text || ''
    };
}

function emitQuad(quads, quadBuffer, removeSet, quadIndex, block, subject, predicate, object, dataFactory, meta = null) {
    if (!subject || !predicate || !object) return;

    const quad = dataFactory.quad(subject, predicate, object);
    const remove = meta?.remove || false;

    if (remove) {
        // Check if quad exists in current buffer
        const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
        if (quadBuffer.has(quadKey)) {
            // In current state → cancel, appears nowhere
            quadBuffer.delete(quadKey);
            // Also remove from quads array if present
            const index = quads.findIndex(q =>
                q.subject.value === quad.subject.value &&
                q.predicate.value === quad.predicate.value &&
                q.object.value === quad.object.value
            );
            if (index !== -1) {
                quads.splice(index, 1);
            }
            // Remove from quadIndex
            quadIndex.delete(quadKey);
        } else {
            // Not in current state → external retract
            removeSet.add(quad);
        }
    } else {
        // Add to buffer and quads
        const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
        quadBuffer.set(quadKey, quad);
        quads.push(quad);

        // Create lean origin entry
        const originEntry = {
            blockId: block.id,
            range: block.range,
            carrierType: block.carrierType,
            subject: subject.value,
            predicate: predicate.value,
            context: { ...block.context },
            polarity: meta?.remove ? '-' : '+',
            value: block.text || ''
        };

        quadIndex.set(quadKey, originEntry);
    }
}

const resolveFragment = (fragment, state) => {
    if (!state.currentSubject) return null;
    const baseIRI = state.currentSubject.value.split('#')[0];
    return state.df.namedNode(`${baseIRI}#${fragment}`);
};

function resolveSubject(sem, state) {
    if (!sem.subject) return null;
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return null;
    }
    if (sem.subject.startsWith('=#')) return resolveFragment(sem.subject.substring(2), state);
    return state.df.namedNode(expandIRI(sem.subject, state.ctx));
}

function resolveObject(sem, state) {
    if (!sem.object) return null;
    if (sem.object.startsWith('#')) return resolveFragment(sem.object.substring(1), state);
    return state.df.namedNode(expandIRI(sem.object, state.ctx));
}

const createTypeQuad = (typeIRI, subject, state, block, entryIndex = null) => {
    const expandedType = expandIRI(typeIRI, state.ctx);
    const typeInfo = typeof entryIndex === 'object' ? entryIndex : { entryIndex, remove: false };
    emitQuad(
        state.quads, state.quadBuffer, state.removeSet, state.origin.quadIndex, block,
        subject,
        state.df.namedNode(expandIRI('rdf:type', state.ctx)),
        state.df.namedNode(expandedType),
        state.df,
        { kind: 'type', token: `.${typeIRI}`, expandedType, entryIndex: typeInfo.entryIndex, remove: typeInfo.remove }
    );
};

function processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier) {
    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        const typeInfo = typeof t === 'string' ? { entryIndex: null, remove: false } : t;
        // Type subject priority: explicit subject > soft object > carrier URL > current subject
        let typeSubject = newSubject || localObject || carrierO || S;
        createTypeQuad(typeIRI, typeSubject, state, block, typeInfo);
    });
}

const determinePredicateRole = (pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L) => {
    if (pred.form === '' && carrier?.type === 'link' && carrier?.url && carrier.text === carrier.url) {
        return null;
    }
    switch (pred.form) {
        case '':
            // Literal predicates: explicit subject > current subject, URL only when no explicit subject
            return newSubject ? { subject: localObject || S, object: L }
                : (carrier?.type === 'link' && carrier?.url && carrier.text !== carrier.url)
                    ? { subject: newSubjectOrCarrierO, object: L }
                    : { subject: localObject || S, object: L };
        case '?':
            // Object predicates: use current subject → explicit object or URL
            return { subject: newSubject ? previousSubject : S, object: localObject || newSubjectOrCarrierO };
        case '!':
            // Reverse predicates: explicit object or URL → current subject
            return { subject: localObject || newSubjectOrCarrierO, object: newSubject ? previousSubject : S };
        default:
            return null;
    }
};

function processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier) {
    sem.predicates.forEach(pred => {
        const role = determinePredicateRole(pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L);
        if (role) {
            const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
            emitQuad(state.quads, state.quadBuffer, state.removeSet, state.origin.quadIndex, block,
                role.subject, P, role.object, state.df,
                { kind: 'pred', token: `${pred.form}${pred.iri}`, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex, remove: pred.remove || false }
            );
        }
    });
}

function processAnnotation(carrier, sem, state, options = {}) {
    const { preserveGlobalSubject = false, implicitSubject = null } = options;

    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }

    const previousSubject = state.currentSubject;
    const newSubject = resolveSubject(sem, state);
    const localObject = resolveObject(sem, state);

    const effectiveSubject = implicitSubject || (newSubject && !preserveGlobalSubject ? newSubject : previousSubject);
    if (newSubject && !preserveGlobalSubject && !implicitSubject) {
        state.currentSubject = newSubject;
    }
    const S = preserveGlobalSubject ? (newSubject || previousSubject) : (implicitSubject || state.currentSubject);
    if (!S) return;

    const block = createBlock(
        S.value, sem.types, sem.predicates,
        carrier.range, carrier.attrsRange || null, carrier.valueRange || null,
        carrier.type || null, state.ctx, carrier.text
    );

    const L = createLiteral(carrier.text, sem.datatype, sem.language, state.ctx, state.df);
    const carrierO = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;
    const newSubjectOrCarrierO = newSubject || carrierO;

    processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier);
    processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier);
}








function processTokenAnnotations(token, state, tokenType) {
    if (token.attrs) {
        const sem = parseSemCached(token.attrs);
        processAnnotation({
            type: tokenType, text: token.text, range: token.range,
            attrsRange: token.attrsRange || null, valueRange: token.valueRange || null
        }, sem, state);
    }

    getCarriers(token).forEach(carrier => {
        if (carrier.attrs) {
            const sem = parseSemCached(carrier.attrs);
            processAnnotation(carrier, sem, state);
        }
    });
}

function processStandaloneSubject(token, state) {
    const match = STANDALONE_SUBJECT_REGEX.exec(token.text);
    if (!match) return;

    const sem = parseSemCached(`{=${match[1]}}`);
    const attrsStart = token.range[0] + token.text.indexOf('{=');
    processAnnotation({
        type: 'standalone', text: '', range: token.range,
        attrsRange: [attrsStart, attrsStart + (match[1] ? match[1].length : 0)],
        valueRange: null
    }, sem, state);
}

const TOKEN_PROCESSORS = {
    heading: (token, state) => {
        processTokenAnnotations(token, state, token.type);
    },
    code: (token, state) => {
        processTokenAnnotations(token, state, token.type);
    },
    blockquote: (token, state) => {
        processTokenAnnotations(token, state, token.type);
    },
    para: (token, state) => {
        processStandaloneSubject(token, state);
        processTokenAnnotations(token, state, token.type);
    },
    list: (token, state) => {
        processTokenAnnotations(token, state, token.type);
    },
};

export function parse(text, options = {}) {
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        quads: [],
        quadBuffer: new Map(),
        removeSet: new Set(),
        origin: { quadIndex: new Map() },
        currentSubject: null,
        tokens: null,
        currentTokenIndex: -1
    };

    state.tokens = scanTokens(text);

    state.tokens.filter(t => t.type === 'prefix').forEach(t => {
        let resolvedIri = t.iri;
        if (t.iri.includes(':')) {
            const colonIndex = t.iri.indexOf(':');
            const potentialPrefix = t.iri.substring(0, colonIndex);
            const reference = t.iri.substring(colonIndex + 1);
            if (state.ctx[potentialPrefix] && potentialPrefix !== '@vocab') {
                resolvedIri = state.ctx[potentialPrefix] + reference;
            }
        }
        state.ctx[t.prefix] = resolvedIri;
    });

    for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i];
        state.currentTokenIndex = i;
        TOKEN_PROCESSORS[token.type]?.(token, state);
    }

    // Convert removeSet to array and ensure hard invariant: quads ∩ remove = ∅
    const removeArray = Array.from(state.removeSet);
    const quadKeys = new Set();
    state.quads.forEach(q => {
        quadKeys.add(quadIndexKey(q.subject, q.predicate, q.object));
    });

    // Filter removeArray to ensure no overlap with quads
    const filteredRemove = removeArray.filter(quad => {
        const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
        return !quadKeys.has(key);
    });

    return { quads: state.quads, remove: filteredRemove, origin: state.origin, context: state.ctx };
}
