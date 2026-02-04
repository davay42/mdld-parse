import {
    DEFAULT_CONTEXT,
    DataFactory,
    expandIRI,
    parseSemanticBlock,
    quadIndexKey,
    createSlotInfo,
    createLiteral,
    hash
} from './utils.js';

const URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const FENCE_REGEX = /^(`{3,})(.*)/;
const PREFIX_REGEX = /^\[([^\]]+)\]\s*<([^>]+)>/;
const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
const UNORDERED_LIST_REGEX = /^(\s*)([-*+])\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
const ORDERED_LIST_REGEX = /^(\s*)(\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
const BLOCKQUOTE_REGEX = /^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
const STANDALONE_SUBJECT_REGEX = /^\s*\{=(.*?)\}\s*$/;
const LIST_CONTEXT_REGEX = /^(.+?)\s*\{([^}]+)\}$/;
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};

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

const createListToken = (type, line, lineStart, pos, match, indent = null) => {
    const attrs = match[4] || null;
    const prefix = match[1].length + (match[2] ? match[2].length : 0);
    const rangeInfo = calcRangeInfo(line, attrs, lineStart, prefix, match[3].length);
    const extra = indent !== null ? { indent } : { indent: match[1].length, number: parseInt(match[2]) };
    return createToken(type, [lineStart, pos - 1], match[3].trim(), attrs,
        rangeInfo.attrsRange, rangeInfo.valueRange, extra);
};

function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let pos = 0;
    let codeBlock = null;

    const processors = [
        {
            test: line => line.startsWith('```'),
            process: (line, lineStart, pos) => {
                if (!codeBlock) {
                    const fenceMatch = line.match(FENCE_REGEX);
                    const attrsText = fenceMatch[2].match(/\{[^{}]*\}/)?.[0] || null;
                    const attrsStartInLine = attrsText ? line.indexOf(attrsText) : -1;
                    const contentStart = lineStart + line.length + 1;
                    const langAndAttrs = fenceMatch[2];
                    const langEnd = langAndAttrs.indexOf(' ') > -1 ? langAndAttrs.indexOf(' ') :
                        langAndAttrs.indexOf('{') > -1 ? langAndAttrs.indexOf('{') : langAndAttrs.length;
                    codeBlock = {
                        fence: fenceMatch[1],
                        start: lineStart,
                        content: [],
                        lang: langAndAttrs.substring(0, langEnd),
                        attrs: attrsText,
                        attrsRange: attrsText && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrsText.length] : null,
                        valueRangeStart: contentStart
                    };
                } else if (line.startsWith(codeBlock.fence)) {
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
                return true;
            }
        },
        {
            test: () => codeBlock,
            process: line => {
                codeBlock.content.push(line);
                return true;
            }
        },
        {
            test: line => PREFIX_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = PREFIX_REGEX.exec(line);
                tokens.push({ type: 'prefix', prefix: match[1], iri: match[2].trim() });
                return true;
            }
        },
        {
            test: line => HEADING_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = HEADING_REGEX.exec(line);
                const attrs = match[3] || null;
                const afterHashes = match[1].length;
                const rangeInfo = calcRangeInfo(line, attrs, lineStart, afterHashes, match[2].length);
                tokens.push(createToken('heading', [lineStart, pos - 1], match[2].trim(), attrs,
                    rangeInfo.attrsRange, rangeInfo.valueRange, { depth: match[1].length }));
                return true;
            }
        },
        {
            test: line => UNORDERED_LIST_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = UNORDERED_LIST_REGEX.exec(line);
                tokens.push(createListToken('unordered-list', line, lineStart, pos, match, match[1].length));
                return true;
            }
        },
        {
            test: line => ORDERED_LIST_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = ORDERED_LIST_REGEX.exec(line);
                tokens.push(createListToken('ordered-list', line, lineStart, pos, match));
                return true;
            }
        },
        {
            test: line => BLOCKQUOTE_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = BLOCKQUOTE_REGEX.exec(line);
                const attrs = match[2] || null;
                const valueStartInLine = line.startsWith('> ') ? 2 : line.indexOf('>') + 1;
                const valueEndInLine = valueStartInLine + match[1].length;
                tokens.push(createToken('blockquote', [lineStart, pos - 1], match[1].trim(), attrs,
                    calcAttrsRange(line, attrs, lineStart),
                    [lineStart + valueStartInLine, lineStart + valueEndInLine]));
                return true;
            }
        },
        {
            test: line => line.trim(),
            process: (line, lineStart, pos) => {
                tokens.push(createToken('para', [lineStart, pos - 1], line.trim()));
                return true;
            }
        }
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = pos;
        pos += line.length + 1;

        // Try each processor until one handles the line
        for (const processor of processors) {
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
    const valueStart = baseOffset + matchStart;
    const valueEnd = valueStart + match[1].length;
    const attrsStart = baseOffset + matchStart + match[0].indexOf('{');
    const attrsEnd = attrsStart + match[2].length + 2; // +2 for { and }
    return {
        valueRange: [valueStart, valueEnd],
        attrsRange: [attrsStart + 1, attrsEnd - 1], // Exclude braces
        range: [valueStart, attrsEnd],
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

function createBlock(subject, types, predicates, entries, range, attrsRange, valueRange, carrierType, ctx) {
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
        attrsRange: attrsRange ? { start: attrsRange[0], end: attrsRange[1] } : null,
        valueRange: valueRange ? { start: valueRange[0], end: valueRange[1] } : null,
        carrierType: carrierType || null,
        subject,
        types: expanded.types,
        predicates: expanded.predicates,
        entries: entries || [],
        context: { ...ctx }
    };
}

function emitQuad(quads, quadIndex, blockId, subject, predicate, object, dataFactory, meta = null) {
    if (!subject || !predicate || !object) return;
    const quad = dataFactory.quad(subject, predicate, object);
    quads.push(quad);

    const slotInfo = createSlotInfo(blockId, meta?.entryIndex, {
        ...meta,
        subject, predicate, object
    });

    quadIndex.set(quadIndexKey(quad.subject, quad.predicate, quad.object), slotInfo);
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

const createTypeQuad = (typeIRI, subject, state, blockId, entryIndex = null) => {
    const expandedType = expandIRI(typeIRI, state.ctx);
    emitQuad(
        state.quads, state.origin.quadIndex, blockId,
        subject,
        state.df.namedNode(expandIRI('rdf:type', state.ctx)),
        state.df.namedNode(expandedType),
        state.df,
        { kind: 'type', token: `.${typeIRI}`, expandedType, entryIndex }
    );
};

function processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier) {
    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        const entryIndex = typeof t === 'string' ? null : t.entryIndex;
        let typeSubject = newSubject ? newSubject : (localObject || carrierO || S);
        if (carrier?.type === 'link' && carrier?.url && !newSubject) {
            typeSubject = carrierO;
        }
        createTypeQuad(typeIRI, typeSubject, state, block.id, entryIndex);
    });
}

const determinePredicateRole = (pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L) => {
    if (pred.form === '' && carrier?.type === 'link' && carrier?.url && carrier.text === carrier.url) {
        return null;
    }
    switch (pred.form) {
        case '':
            return carrier?.type === 'link' && carrier?.url && carrier.text !== carrier.url && !newSubject
                ? { subject: newSubjectOrCarrierO, object: L }
                : { subject: localObject || S, object: L };
        case '?':
            return { subject: newSubject ? previousSubject : S, object: localObject || newSubjectOrCarrierO };
        case '!':
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
            emitQuad(state.quads, state.origin.quadIndex, block.id,
                role.subject, P, role.object, state.df,
                { kind: 'pred', token: `${pred.form}${pred.iri}`, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
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
        S.value, sem.types, sem.predicates, sem.entries,
        carrier.range, carrier.attrsRange || null, carrier.valueRange || null,
        carrier.type || null, state.ctx
    );
    state.origin.blocks.set(block.id, block);

    const L = createLiteral(carrier.text, sem.datatype, sem.language, state.ctx, state.df);
    const carrierO = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;
    const newSubjectOrCarrierO = newSubject || carrierO;

    processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier);
    processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier);
}

export function findItemSubject(listToken, carriers, state) {
    const sem = parseSemCached(listToken.attrs);
    if (sem.subject && sem.subject !== 'RESET') {
        const subject = resolveSubject(sem, state);
        if (subject) {
            return {
                subject,
                carrier: { type: 'list', text: listToken.text, attrs: listToken.attrs, range: listToken.range }
            };
        }
    }

    for (const carrier of carriers) {
        const carrierSem = parseSemCached(carrier.attrs);
        if (carrierSem.subject && carrierSem.subject !== 'RESET') {
            const subject = resolveSubject(carrierSem, state);
            if (subject) {
                return { subject, carrier };
            }
        }
    }

    return null;
}

function hasOwnPredicates(listToken, carriers) {
    if (listToken.attrs) {
        const attrs = parseSemCached(listToken.attrs);
        if (attrs.predicates.some(p => !p.subject && p.iri !== 'RESET')) {
            return true;
        }
    }
    return carriers.some(carrier => {
        const carrierAttrs = parseSemCached(carrier.attrs);
        return carrierAttrs.predicates.some(p => !p.subject && p.iri !== 'RESET');
    });
}

const processContextSem = ({ sem, itemSubject, contextSubject, inheritLiterals = false, state, blockId = 'list-context' }) => {
    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        emitQuad(
            state.quads, state.origin.quadIndex, blockId,
            itemSubject,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)),
            state.df.namedNode(expandIRI(typeIRI, state.ctx)),
            state.df
        );
    });

    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
        if (pred.form === '!') {
            emitQuad(state.quads, state.origin.quadIndex, blockId, itemSubject, P, contextSubject, state.df);
        } else if (pred.form === '?') {
            emitQuad(state.quads, state.origin.quadIndex, blockId, contextSubject, P, itemSubject, state.df);
        }
    });

    if (inheritLiterals) {
        const literalPredicates = sem.predicates.filter(p => p.form === '');
        if (literalPredicates.length > 0) {
            return {
                subject: null, object: null, types: [],
                predicates: literalPredicates.map(p => ({ iri: p.iri, form: p.form, entryIndex: p.entryIndex })),
                datatype: null, language: null, entries: []
            };
        }
    }
    return null;
};

const manageListStack = (token, state) => {
    while (state.listStack.length && token.indent < state.listStack[state.listStack.length - 1].indent) {
        state.listStack.pop();
    }

    if (state.pendingListContext) {
        state.listStack.push({
            indent: token.indent,
            anchorSubject: state.pendingListContext.subject,
            contextSubject: state.pendingListContext.subject,
            contextSem: state.pendingListContext.sem,
            contextText: state.pendingListContext.contextText,
            contextToken: state.pendingListContext.contextToken // Store context token for origins
        });
        state.pendingListContext = null;
    } else if (state.listStack.length === 0 || token.indent > state.listStack[state.listStack.length - 1].indent) {
        const parentFrame = state.listStack.length > 0 ? state.listStack[state.listStack.length - 1] : null;
        state.listStack.push({
            indent: token.indent,
            anchorSubject: parentFrame?.anchorSubject || null,
            contextSubject: parentFrame?.anchorSubject || null,
            contextSem: null
        });
    }
};

const combineSemanticInfo = (token, carriers, listFrame, state, itemSubject) => {
    const combinedSem = { subject: null, object: null, types: [], predicates: [], datatype: null, language: null, entries: [] };
    const addSem = (sem) => { combinedSem.types.push(...sem.types); combinedSem.predicates.push(...sem.predicates); combinedSem.entries.push(...sem.entries); };

    if (listFrame?.contextSem) {
        const inheritedSem = processContextSem({ sem: listFrame.contextSem, itemSubject, contextSubject: listFrame.contextSubject, inheritLiterals: true, state });
        if (inheritedSem) addSem(inheritedSem);
    }

    if (token.attrs) addSem(parseSemCached(token.attrs));
    carriers.forEach(carrier => { if (carrier.attrs) addSem(parseSemCached(carrier.attrs)); });

    return combinedSem;
};

const processListItem = (token, state) => {
    const carriers = getCarriers(token);
    const itemInfo = findItemSubject(token, carriers, state);
    if (!itemInfo) return;

    const { subject: itemSubject } = itemInfo;
    if (state.listStack.length > 0) state.listStack[state.listStack.length - 1].anchorSubject = itemSubject;

    const listFrame = state.listStack[state.listStack.length - 1];
    const combinedSem = combineSemanticInfo(token, carriers, listFrame, state, itemSubject);

    if (combinedSem.entries.length > 0) {
        const prevSubject = state.currentSubject;
        state.currentSubject = itemSubject;

        processAnnotation({ type: 'list', text: token.text, range: token.range, attrsRange: token.attrsRange || null, valueRange: token.valueRange || null }, combinedSem, state, { preserveGlobalSubject: !state.listStack.length, implicitSubject: itemSubject });

        state.currentSubject = prevSubject;
    }
};

const applyListAnchorAnnotations = (itemSubject, contextSem, state, listItemText, contextToken) => {
    // Use the context token's ranges for proper origin tracking
    const baseToken = contextToken || { range: [0, 0], attrsRange: [0, 0] };

    const paragraphText = baseToken.text || '';
    const annotationMatch = paragraphText.match(/\{[^}]+\}/);

    let annotationStart;
    if (annotationMatch && baseToken.range) {
        // Found annotation in paragraph, calculate its absolute position
        const relativeStart = paragraphText.indexOf(annotationMatch[0]);
        annotationStart = baseToken.range[0] + relativeStart;
    } else {
        // Fallback to start of token
        annotationStart = baseToken.range ? baseToken.range[0] : 0;
    }

    // Apply types with proper ranges
    contextSem.types.forEach(type => {
        const entry = contextSem.entries.find(e => e.kind === 'type' && e.iri === type.iri);
        if (entry && entry.relRange) {
            // Calculate absolute range: annotation start + relative range within annotation
            const typeRange = [annotationStart + entry.relRange.start, annotationStart + entry.relRange.end];

            emitQuad(state.quads, state.origin.quadIndex, 'list-anchor-type',
                itemSubject,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(expandIRI(type.iri, state.ctx)),
                state.df,
                { type: 'list-anchor', range: typeRange, entryIndex: type.entryIndex }
            );
        }
    });

    // Apply predicates with proper ranges
    contextSem.predicates.forEach(pred => {
        if (pred.form !== '?' && pred.form !== '!') { // Skip context predicates
            const entry = contextSem.entries.find(e => e.kind === 'property' && e.iri === pred.iri);
            if (entry && entry.relRange) {
                // Calculate absolute range: annotation start + relative range within annotation
                const predRange = [annotationStart + entry.relRange.start, annotationStart + entry.relRange.end];

                const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));

                // For literal predicates, the value comes from the list item text
                let objectValue;
                if (pred.form === '') {
                    objectValue = state.df.literal(listItemText || '');
                } else {
                    // For other forms, this would need more complex handling
                    objectValue = state.df.literal(listItemText || '');
                }

                emitQuad(state.quads, state.origin.quadIndex, 'list-anchor-predicate',
                    itemSubject, P, objectValue, state.df,
                    { type: 'list-anchor', range: predRange, entryIndex: pred.entryIndex }
                );
            }
        }
    });
}

function processOrderedListItem(token, state) {
    if (!state.isProcessingOrderedList) {
        state.listCounter = (state.listCounter || 0) + 1;
        state.rdfListIndex = 0;
        state.firstListNode = null;
        state.previousListNode = null;
        state.contextConnected = false;
        state.isProcessingOrderedList = true;
    }

    generateRdfListTriples(token, state);

    const listFrame = state.listStack[state.listStack.length - 1];
    if (listFrame?.contextSem) {
        const carriers = getCarriers(token);
        const itemInfo = findItemSubject(token, carriers, state);
        if (itemInfo?.subject) {
            applyListAnchorAnnotations(itemInfo.subject, listFrame.contextSem, state, token.text, listFrame.contextToken);
        }
    }

    if (listFrame?.contextSem && listFrame?.contextSubject && !state.contextConnected) {
        listFrame.contextSem.predicates.forEach(pred => {
            if (pred.form === '?') {
                const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
                const firstListNode = state.firstListNode;
                if (firstListNode) {
                    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-context',
                        listFrame.contextSubject, P, state.df.namedNode(firstListNode), state.df);
                    state.contextConnected = true;
                }
            }
        });
    }
}

function generateRdfListTriples(token, state) {
    const carriers = getCarriers(token);
    const listIndex = (state.rdfListIndex || 0) + 1;
    state.rdfListIndex = listIndex;
    const listNodeName = `list-${state.listCounter}-${listIndex}`;

    const listFrame = state.listStack[state.listStack.length - 1];
    const contextSubject = listFrame?.contextSubject || state.currentSubject || state.documentSubject;
    const baseIRI = contextSubject ? contextSubject.value : (state.ctx[''] || '');

    const listNodeIri = baseIRI.includes('#')
        ? `${baseIRI.split('#')[0]}#${listNodeName}`
        : `${baseIRI}#${listNodeName}`;

    if (!state.firstListNode) state.firstListNode = listNodeIri;

    // Emit rdf:type triple with origin tracking
    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-type',
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#List'),
        DataFactory,
        { type: 'ordered-list', range: token.valueRange || token.range, listNodeName }
    );

    const itemInfo = findItemSubject(token, carriers, state);
    let firstObject;
    if (itemInfo?.value) {
        firstObject = itemInfo.value;
    } else if (itemInfo?.subject) {
        firstObject = itemInfo.subject;
    } else {
        firstObject = DataFactory.literal(token.text);
    }

    // Determine the appropriate range based on object type
    let originRange;
    if (itemInfo?.subject) {
        // For IRIs, target the annotation range
        originRange = token.attrsRange || token.valueRange || token.range;
    } else {
        // For literals, target the value range
        originRange = token.valueRange || token.range;
    }

    // Emit rdf:first triple with origin tracking
    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-first',
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
        firstObject,
        DataFactory,
        { type: 'ordered-list', range: originRange, listNodeName }
    );

    if (state.previousListNode) {
        // Find and remove the previous rdf:rest -> rdf:nil quad, then emit a new one
        const prevRestQuadIndex = state.quads.findIndex(q =>
            q.subject.value === state.previousListNode &&
            q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'
        );
        if (prevRestQuadIndex !== -1) {
            // Remove the old quad
            state.quads.splice(prevRestQuadIndex, 1);

            // Emit new rdf:rest quad with proper origin tracking
            emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-rest-update',
                DataFactory.namedNode(state.previousListNode),
                DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
                DataFactory.namedNode(listNodeIri),
                DataFactory,
                { type: 'ordered-list', range: token.valueRange || token.range, listNodeName: state.previousListNode }
            );
        }
    }

    // Emit rdf:rest triple with origin tracking
    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-rdf-rest',
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
        DataFactory,
        { type: 'ordered-list', range: token.valueRange || token.range, listNodeName }
    );

    state.previousListNode = listNodeIri;
}

function processListContextFromParagraph(token, state) {
    const contextMatch = LIST_CONTEXT_REGEX.exec(token.text);
    if (!contextMatch) return;

    const contextSem = parseSemCached(`{${contextMatch[2]}}`);
    let contextSubject = state.currentSubject || state.documentSubject;

    if (!contextSubject && state.tokens) {
        for (let i = state.currentTokenIndex - 1; i >= 0; i--) {
            const prevToken = state.tokens[i];
            if (prevToken.type === 'heading' && prevToken.attrs) {
                const prevSem = parseSemCached(prevToken.attrs);
                if (prevSem.subject) {
                    const resolvedSubject = resolveSubject(prevSem, state);
                    if (resolvedSubject) {
                        contextSubject = resolvedSubject.value;
                        break;
                    }
                }
            }
        }
    }

    const nextToken = state.tokens?.[state.currentTokenIndex + 1];
    if (state.listStack.length > 0 && nextToken && (nextToken.type === 'unordered-list' || nextToken.type === 'ordered-list')) {
        const currentFrame = state.listStack[state.listStack.length - 1];
        if (currentFrame.anchorSubject && nextToken.indent > currentFrame.indent) {
            contextSubject = currentFrame.anchorSubject;
        }
    }

    state.pendingListContext = {
        sem: contextSem,
        subject: contextSubject,
        contextText: contextMatch[1].replace(':', '').trim(),
        contextToken: token // Store the context token for origin ranges
    };
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
        state.isProcessingOrderedList = false;
        if (token.attrs) {
            const headingSem = parseSemCached(token.attrs);
            if (headingSem.subject) {
                const subject = resolveSubject(headingSem, state);
                if (subject) state.documentSubject = subject;
            }
        }
        processTokenAnnotations(token, state, token.type);
    },
    code: (token, state) => {
        state.isProcessingOrderedList = false;
        processTokenAnnotations(token, state, token.type);
    },
    blockquote: (token, state) => {
        state.isProcessingOrderedList = false;
        processTokenAnnotations(token, state, token.type);
    },
    para: (token, state) => {
        if (!token.text.includes('{?') && !token.text.includes('{!')) {
            state.isProcessingOrderedList = false;
        }
        processStandaloneSubject(token, state);
        processListContextFromParagraph(token, state);
        processTokenAnnotations(token, state, token.type);
    },
    'unordered-list': (token, state) => {
        state.isProcessingOrderedList = false;
        manageListStack(token, state);
        processListItem(token, state);
    },
    'ordered-list': (token, state) => {
        manageListStack(token, state);
        processOrderedListItem(token, state);
    }
};

export function parse(text, options = {}) {
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        quads: [],
        origin: { blocks: new Map(), quadIndex: new Map() },
        currentSubject: null,
        documentSubject: null,
        listStack: [],
        pendingListContext: null,
        tokens: null,
        currentTokenIndex: -1,
        listCounter: 0,
        rdfListIndex: 0,
        firstListNode: null,
        previousListNode: null,
        contextConnected: false,
        isProcessingOrderedList: false
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

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}
