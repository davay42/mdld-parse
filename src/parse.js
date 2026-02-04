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

// Constants and patterns
const URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const FENCE_REGEX = /^(`{3,})(.*)/;
const PREFIX_REGEX = /^\[([^\]]+)\]\s*<([^>]+)>/;
const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
const UNORDERED_LIST_REGEX = /^(\s*)([-*+])\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
const ORDERED_LIST_REGEX = /^(\s*)(\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
const BLOCKQUOTE_REGEX = /^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
const STANDALONE_SUBJECT_REGEX = /^\s*\{=(.*?)\}\s*$/;
const LIST_CONTEXT_REGEX = /^(.+?)\s*\{([^}]+)\}$/;

// Inline carrier pattern constants
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/y,
    CODE_SPAN: /``(.+?)``\s*\{([^}]+)\}/y
};

// Semantic block cache to avoid repeated parsing
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

function calcAttrsRange(line, attrs, lineStart) {
    if (!attrs) return null;
    const attrsStartInLine = line.lastIndexOf(attrs);
    return attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null;
}

function calcValueRange(lineStart, valueStartInLine, valueEndInLine) {
    return [lineStart + valueStartInLine, lineStart + valueEndInLine];
}

function createToken(type, range, text, attrs = null, attrsRange = null, valueRange = null, extra = {}) {
    const token = { type, range, text, attrs, attrsRange, valueRange, ...extra };
    // Add lazy carrier caching
    Object.defineProperty(token, '_carriers', {
        enumerable: false,
        writable: true,
        value: null
    });
    return token;
}

function getCarriers(token) {
    // Skip inline carrier extraction for code blocks to allow safe self-documentation
    if (token.type === 'code') {
        return [];
    }

    if (!token._carriers) {
        token._carriers = extractInlineCarriers(token.text, token.range[0]);
    }
    return token._carriers;
}

function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let pos = 0;
    let codeBlock = null;

    // Token processors in order of priority
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
                return true; // handled
            }
        },
        {
            test: () => codeBlock,
            process: line => {
                codeBlock.content.push(line);
                return true; // handled
            }
        },
        {
            test: line => PREFIX_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = PREFIX_REGEX.exec(line);
                tokens.push({ type: 'prefix', prefix: match[1], iri: match[2].trim() });
                return true; // handled
            }
        },
        {
            test: line => HEADING_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = HEADING_REGEX.exec(line);
                const attrs = match[3] || null;
                const afterHashes = match[1].length;
                const wsLength = afterHashes < line.length && line[afterHashes] === ' ' ? 1 :
                    line.slice(afterHashes).match(/^\s+/)?.[0]?.length || 0;
                const valueStartInLine = afterHashes + wsLength;
                const valueEndInLine = valueStartInLine + match[2].length;
                tokens.push(createToken('heading', [lineStart, pos - 1], match[2].trim(), attrs,
                    calcAttrsRange(line, attrs, lineStart),
                    calcValueRange(lineStart, valueStartInLine, valueEndInLine),
                    { depth: match[1].length }));
                return true; // handled
            }
        },
        {
            test: line => UNORDERED_LIST_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = UNORDERED_LIST_REGEX.exec(line);
                const attrs = match[4] || null;
                const prefix = match[1].length + match[2].length;
                const wsLength = prefix < line.length && line[prefix] === ' ' ? 1 :
                    line.slice(prefix).match(/^\s+/)?.[0]?.length || 0;
                const valueStartInLine = prefix + wsLength;
                const valueEndInLine = valueStartInLine + match[3].length;
                tokens.push(createToken('unordered-list', [lineStart, pos - 1], match[3].trim(), attrs,
                    calcAttrsRange(line, attrs, lineStart),
                    calcValueRange(lineStart, valueStartInLine, valueEndInLine),
                    { indent: match[1].length }));
                return true; // handled
            }
        },
        {
            test: line => ORDERED_LIST_REGEX.test(line),
            process: (line, lineStart, pos) => {
                const match = ORDERED_LIST_REGEX.exec(line);
                const attrs = match[4] || null;
                const prefix = match[1].length + match[2].length;
                const wsLength = prefix < line.length && line[prefix] === ' ' ? 1 :
                    line.slice(prefix).match(/^\s+/)?.[0]?.length || 0;
                const valueStartInLine = prefix + wsLength;
                const valueEndInLine = valueStartInLine + match[3].length;
                tokens.push(createToken('ordered-list', [lineStart, pos - 1], match[3].trim(), attrs,
                    calcAttrsRange(line, attrs, lineStart),
                    calcValueRange(lineStart, valueStartInLine, valueEndInLine),
                    { indent: match[1].length, number: parseInt(match[2]) }));
                return true; // handled
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
                    calcValueRange(lineStart, valueStartInLine, valueEndInLine)));
                return true; // handled
            }
        },
        {
            test: line => line.trim(),
            process: (line, lineStart, pos) => {
                tokens.push(createToken('para', [lineStart, pos - 1], line.trim()));
                return true; // handled
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
                break; // line handled, move to next line
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

    // Unified carrier extractor with pattern-based handlers
    const extractCarrier = (text, pos, baseOffset) => {
        // Angle-bracket URLs: <URL>{...}
        if (text[pos] === '<') {
            const angleEnd = text.indexOf('>', pos);
            if (angleEnd !== -1) {
                const url = text.slice(pos + 1, angleEnd);
                if (URL_REGEX.test(url)) {
                    const { attrs, attrsRange, finalSpanEnd } = extractAttributesFromText(text, angleEnd + 1, baseOffset);
                    return createCarrier('link', url, attrs, attrsRange,
                        [baseOffset + pos + 1, baseOffset + angleEnd],
                        [baseOffset + pos, baseOffset + finalSpanEnd],
                        finalSpanEnd, { url });
                }
            }
            return null;
        }

        // Bracketed links: [text](URL){...} and [text]{...}
        if (text[pos] === '[') {
            const bracketEnd = findMatchingBracket(text, pos);
            if (bracketEnd) {
                const carrierText = text.slice(pos + 1, bracketEnd - 1);
                const { url, spanEnd } = extractUrlFromBrackets(text, bracketEnd);
                const { attrs, attrsRange, finalSpanEnd } = extractAttributesFromText(text, spanEnd, baseOffset);
                const { carrierType, resourceIRI } = determineCarrierType(url);

                if (url?.startsWith('=')) return { skip: true, pos: finalSpanEnd };

                return createCarrier(carrierType, carrierText, attrs, attrsRange,
                    [baseOffset + pos + 1, baseOffset + bracketEnd - 1],
                    [baseOffset + pos, baseOffset + finalSpanEnd],
                    finalSpanEnd, { url: resourceIRI });
            }
            return null;
        }

        // Regex-based carriers: emphasis and code spans
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

    const signature = [
        subject,
        carrierType || 'unknown',
        expanded.types.join(','),
        expanded.predicates.map(p => `${p.form}${p.iri}`).join(',')
    ].join('|');

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
function resolveSubject(sem, state) {
    if (!sem.subject) return null;
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return null;
    }
    if (sem.subject.startsWith('=#')) {
        const fragment = sem.subject.substring(2);
        if (state.currentSubject) {
            const baseIRI = state.currentSubject.value.split('#')[0];
            return state.df.namedNode(`${baseIRI}#${fragment}`);
        }
        return null;
    }
    return state.df.namedNode(expandIRI(sem.subject, state.ctx));
}

function resolveObject(sem, state) {
    if (!sem.object) return null;
    if (sem.object.startsWith('#')) {
        const fragment = sem.object.substring(1);
        if (state.currentSubject) {
            const baseIRI = state.currentSubject.value.split('#')[0];
            return state.df.namedNode(`${baseIRI}#${fragment}`);
        }
        return null;
    }
    return state.df.namedNode(expandIRI(sem.object, state.ctx));
}

function processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier) {
    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        const entryIndex = typeof t === 'string' ? null : t.entryIndex;

        // For angle-bracket URLs and bracketed links [text](URL), use the URL as the subject 
        // for type declarations when there's no explicit subject declaration.
        // This implements {+URL} soft subject behavior.
        let typeSubject = newSubject ? newSubject : (localObject || carrierO || S);
        if (carrier?.type === 'link' && carrier?.url && !newSubject) {
            typeSubject = carrierO; // Use URL as subject for type declarations
        }

        const expandedType = expandIRI(typeIRI, state.ctx);

        emitQuad(
            state.quads, state.origin.quadIndex, block.id,
            typeSubject,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)),
            state.df.namedNode(expandedType),
            state.df,
            { kind: 'type', token: `.${typeIRI}`, expandedType, entryIndex }
        );
    });
}

function processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier) {
    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));

        // Skip literal predicates for angle-bracket URLs only
        if (pred.form === '' && carrier?.type === 'link' && carrier?.url && carrier.text === carrier.url) {
            return;
        }

        // Determine subject/object roles based on predicate form
        let role;
        switch (pred.form) {
            case '':
                // For bracketed links with literal predicates and no explicit subject, use URL as subject
                if (carrier?.type === 'link' && carrier?.url && carrier.text !== carrier.url && !newSubject) {
                    role = { subject: newSubjectOrCarrierO, object: L };
                } else {
                    role = { subject: localObject || S, object: L };
                }
                break;
            case '?':
                role = { subject: newSubject ? previousSubject : S, object: localObject || newSubjectOrCarrierO };
                break;
            case '!':
                role = { subject: localObject || newSubjectOrCarrierO, object: newSubject ? previousSubject : S };
                break;
            default:
                role = null;
        }

        if (role) {
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

    // Use implicit subject if provided (for list items)
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
    // Check for explicit predicates (excluding subject declarations)
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

// Unified list context processing
function processContextSem({ sem, itemSubject, contextSubject, inheritLiterals = false, state, blockId = 'list-context' }) {
    // Emit types
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

    // Emit directional predicates
    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
        if (pred.form === '!') {
            emitQuad(state.quads, state.origin.quadIndex, blockId, itemSubject, P, contextSubject, state.df);
        } else if (pred.form === '?') {
            emitQuad(state.quads, state.origin.quadIndex, blockId, contextSubject, P, itemSubject, state.df);
        }
    });

    // Optionally inherit literal predicates
    if (inheritLiterals) {
        const literalPredicates = sem.predicates.filter(p => p.form === '');
        if (literalPredicates.length > 0) {
            return {
                subject: null,
                object: null,
                types: [],
                predicates: literalPredicates.map(p => ({ iri: p.iri, form: p.form, entryIndex: p.entryIndex })),
                datatype: null,
                language: null,
                entries: []
            };
        }
    }
    return null;
}

// List stack management functions
function manageListStack(token, state) {
    // Pop stack frames for lists that have ended (strictly less indent)
    while (
        state.listStack.length &&
        token.indent < state.listStack[state.listStack.length - 1].indent
    ) {
        state.listStack.pop();
    }

    // If we have pending context, always create a new frame for it
    if (state.pendingListContext) {
        state.listStack.push({
            indent: token.indent,
            anchorSubject: state.pendingListContext.subject,
            contextSubject: state.pendingListContext.subject,
            contextSem: state.pendingListContext.sem
        });
        state.pendingListContext = null;
    } else if (state.listStack.length === 0 || token.indent > state.listStack[state.listStack.length - 1].indent) {
        // Push empty frame for nested lists without explicit context
        // Inherit anchorSubject from parent frame if available
        const parentFrame = state.listStack.length > 0 ? state.listStack[state.listStack.length - 1] : null;
        state.listStack.push({
            indent: token.indent,
            anchorSubject: parentFrame?.anchorSubject || null,
            contextSubject: parentFrame?.anchorSubject || null,
            contextSem: null
        });
    }
    // If token.indent == current frame indent and no pending context, we're at same level - do nothing
}

function processListItem(token, state) {
    const carriers = getCarriers(token);

    // Find item subject from list token or inline carriers
    const itemInfo = findItemSubject(token, carriers, state);
    if (!itemInfo) return;

    const { subject: itemSubject } = itemInfo;

    // Update the current list frame to track this item's subject for nested contexts
    if (state.listStack.length > 0) {
        const currentFrame = state.listStack[state.listStack.length - 1];
        currentFrame.anchorSubject = itemSubject;
    }

    const listFrame = state.listStack[state.listStack.length - 1];

    // Collect all semantic information for this list item
    let combinedSem = {
        subject: null,
        object: null,
        types: [],
        predicates: [],
        datatype: null,
        language: null,
        entries: []
    };

    // Apply list context if available - inherit everything
    if (listFrame?.contextSem) {
        const inheritedSem = processContextSem({
            sem: listFrame.contextSem,
            itemSubject,
            contextSubject: listFrame.contextSubject,
            inheritLiterals: true,
            state
        });

        if (inheritedSem) {
            combinedSem.types.push(...inheritedSem.types);
            combinedSem.predicates.push(...inheritedSem.predicates);
            combinedSem.entries.push(...inheritedSem.entries);
        }
    }

    // Add item's own annotations
    if (token.attrs) {
        const sem = parseSemCached(token.attrs);
        combinedSem.types.push(...sem.types);
        combinedSem.predicates.push(...sem.predicates);
        combinedSem.entries.push(...sem.entries);
    }

    // Add inline carriers' annotations
    carriers.forEach(carrier => {
        if (carrier.attrs) {
            const sem = parseSemCached(carrier.attrs);
            combinedSem.types.push(...sem.types);
            combinedSem.predicates.push(...sem.predicates);
            combinedSem.entries.push(...sem.entries);
        }
    });

    // Only create a block if we have semantic information
    if (combinedSem.entries.length > 0) {
        const prevSubject = state.currentSubject;
        state.currentSubject = itemSubject;

        processAnnotation({
            type: 'list',
            text: token.text,
            range: token.range,
            attrsRange: token.attrsRange || null,
            valueRange: token.valueRange || null
        }, combinedSem, state, {
            preserveGlobalSubject: !state.listStack.length,
            implicitSubject: itemSubject
        });

        state.currentSubject = prevSubject;
    }
}

function processOrderedListItem(token, state) {
    // Reset list-specific state for new ordered lists
    if (!state.isProcessingOrderedList) {
        state.listCounter = (state.listCounter || 0) + 1;
        state.rdfListIndex = 0;
        state.firstListNode = null;
        state.previousListNode = null;
        state.contextConnected = false;
        state.isProcessingOrderedList = true;
    }

    // First, generate the RDF list triples
    generateRdfListTriples(token, state);

    // Then, connect context to the first list node (override processListItem behavior)
    const listFrame = state.listStack[state.listStack.length - 1];

    // Only connect context for the first ordered list item
    if (listFrame?.contextSem && listFrame?.contextSubject && !state.contextConnected) {
        // Use predicates directly from contextSem
        listFrame.contextSem.predicates.forEach(pred => {
            const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
            if (pred.form === '?') {
                // For the first ordered list item, connect context to the list node
                const firstListNode = state.firstListNode;
                if (firstListNode) {
                    emitQuad(state.quads, state.origin.quadIndex, 'ordered-list-context',
                        listFrame.contextSubject, // Use the NamedNode directly
                        P,
                        state.df.namedNode(firstListNode),
                        state.df
                    );
                    // Mark that context has been connected to avoid duplicate connections
                    state.contextConnected = true;
                }
            }
        });
    }
}

function generateRdfListTriples(token, state) {
    const carriers = getCarriers(token);

    // Initialize list counter if not exists
    if (!state.listCounter) {
        state.listCounter = 0;
    }

    // Generate list node name (list-N-M where N=list counter, M=item index)
    const listIndex = (state.rdfListIndex || 0) + 1;
    state.rdfListIndex = listIndex;
    const listNodeName = `list-${state.listCounter}-${listIndex}`;

    // Create the list node IRI using proper fragment-based IRI generation
    // For ordered lists, use the list frame context subject, not global current subject
    const listFrame = state.listStack[state.listStack.length - 1];
    const contextSubject = listFrame?.contextSubject || state.currentSubject || state.documentSubject;
    const baseIRI = contextSubject ? contextSubject.value : (state.ctx[''] || '');

    // Handle existing fragments properly (avoid double fragments)
    let listNodeIri;
    if (baseIRI.includes('#')) {
        // Remove existing fragment and add new one
        const baseWithoutFragment = baseIRI.split('#')[0];
        listNodeIri = `${baseWithoutFragment}#${listNodeName}`;
    } else {
        // Add fragment to base IRI
        listNodeIri = `${baseIRI}#${listNodeName}`;
    }

    // Store the first list node for context connection
    if (!state.firstListNode) {
        state.firstListNode = listNodeIri;
    }

    // Add rdf:type rdf:List for the list node
    state.quads.push(DataFactory.quad(
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#List')
    ));

    // Process the list item to get its value
    const itemInfo = findItemSubject(token, carriers, state);
    if (!itemInfo) {
        // Fallback: use the text content as a literal
        const literalValue = DataFactory.literal(token.text);
        state.quads.push(DataFactory.quad(
            DataFactory.namedNode(listNodeIri),
            DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
            literalValue
        ));
    } else {
        const { subject: itemSubject, value: itemValue } = itemInfo;

        // Add rdf:first for this list item
        let firstObject;
        if (itemValue) {
            firstObject = itemValue;
        } else if (itemSubject) {
            firstObject = itemSubject;
        } else {
            // Fallback: use the text content as a literal
            firstObject = DataFactory.literal(token.text);
        }

        state.quads.push(DataFactory.quad(
            DataFactory.namedNode(listNodeIri),
            DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
            firstObject
        ));
    }

    // Chain with previous list node if exists
    if (state.previousListNode) {
        // Update previous list node's rdf:rest to point to this node
        const prevRestQuad = state.quads.find(q =>
            q.subject.value === state.previousListNode &&
            q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'
        );
        if (prevRestQuad) {
            prevRestQuad.object = DataFactory.namedNode(listNodeIri);
        }
    }

    // Add rdf:rest pointing to nil (will be updated if more items follow)
    state.quads.push(DataFactory.quad(
        DataFactory.namedNode(listNodeIri),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
        DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
    ));

    // Store for potential chaining with next item
    state.previousListNode = listNodeIri;
}

function processListContextFromParagraph(token, state) {
    const contextMatch = LIST_CONTEXT_REGEX.exec(token.text);

    if (contextMatch) {
        const contextSem = parseSemCached(`{${contextMatch[2]}}`);

        // Context subject resolution:
        // 1. For top-level lists: use current subject or document subject
        // 2. For nested lists: use parent list item's subject
        let contextSubject = state.currentSubject || state.documentSubject;

        // If no current subject, try to find it from previous tokens
        if (!contextSubject && state.tokens) {
            // Look backwards through tokens to find the most recent subject
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

        // Check if this is a nested list context by looking ahead
        const nextTokenIndex = state.currentTokenIndex + 1;
        const nextToken = state.tokens && state.tokens[nextTokenIndex];

        if (state.listStack.length > 0 && nextToken && (nextToken.type === 'unordered-list' || nextToken.type === 'ordered-list')) {
            const currentFrame = state.listStack[state.listStack.length - 1];
            if (currentFrame.anchorSubject && nextToken.indent > currentFrame.indent) {
                contextSubject = currentFrame.anchorSubject;
            }
        }

        state.pendingListContext = {
            sem: contextSem,
            subject: contextSubject
        };
    }
}

// Helper functions for token processing
function processTokenAnnotations(token, state, tokenType) {
    // Process token's own attributes
    if (token.attrs) {
        const sem = parseSemCached(token.attrs);
        processAnnotation({
            type: tokenType,
            text: token.text,
            range: token.range,
            attrsRange: token.attrsRange || null,
            valueRange: token.valueRange || null
        }, sem, state);
    }

    // Process inline carriers
    const carriers = getCarriers(token);
    carriers.forEach(carrier => {
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
    const attrsEnd = attrsStart + (match[1] ? match[1].length : 0);

    processAnnotation({
        type: 'standalone',
        text: '',
        range: token.range,
        attrsRange: [attrsStart, attrsEnd],
        valueRange: null
    }, sem, state);
}

export function parse(text, options = {}) {
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        quads: [],
        origin: { blocks: new Map(), quadIndex: new Map() },
        currentSubject: null,
        documentSubject: null, // Track main document subject from headings
        listStack: [],
        pendingListContext: null,
        tokens: null, // Store tokens for lookahead
        currentTokenIndex: -1, // Track current token index
        // Reset list-related state for fresh parsing
        listCounter: 0,
        rdfListIndex: 0,
        firstListNode: null,
        previousListNode: null,
        contextConnected: false,
        isProcessingOrderedList: false
    };

    state.tokens = scanTokens(text);

    // Process prefix declarations first with prefix folding support
    state.tokens.filter(t => t.type === 'prefix').forEach(t => {
        // Check if the IRI value contains a CURIE that references a previously defined prefix
        let resolvedIri = t.iri;
        if (t.iri.includes(':')) {
            const [potentialPrefix, ...referenceParts] = t.iri.split(':');
            const reference = referenceParts.join(':'); // Preserve any additional colons in reference
            if (state.ctx[potentialPrefix] && potentialPrefix !== '@vocab') {
                // This is a CURIE referencing an existing prefix - resolve it
                resolvedIri = state.ctx[potentialPrefix] + reference;
            }
        }
        state.ctx[t.prefix] = resolvedIri;
    });

    // Process all other tokens
    for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i];
        state.currentTokenIndex = i;

        switch (token.type) {
            case 'heading':
                // Reset ordered list processing when encountering new heading
                state.isProcessingOrderedList = false;
                // Update document subject when processing headings
                if (token.attrs) {
                    const headingSem = parseSemCached(token.attrs);
                    if (headingSem.subject) {
                        const subject = resolveSubject(headingSem, state);
                        if (subject) {
                            state.documentSubject = subject;
                        }
                    }
                }
                processTokenAnnotations(token, state, token.type);
                break;
            case 'code':
                // Reset ordered list processing when encountering code block
                state.isProcessingOrderedList = false;
                // Process annotations on the opening fence, but skip content processing
                // This allows safe self-explaining of the format in documentation
                processTokenAnnotations(token, state, token.type);
                break;
            case 'blockquote':
                // Reset ordered list processing when encountering blockquote
                state.isProcessingOrderedList = false;
                processTokenAnnotations(token, state, token.type);
                break;

            case 'para':
                // Reset ordered list processing when encountering paragraph (unless it's list context)
                if (!token.text.includes('{?') && !token.text.includes('{!')) {
                    state.isProcessingOrderedList = false;
                }
                processStandaloneSubject(token, state);
                processListContextFromParagraph(token, state);
                processTokenAnnotations(token, state, token.type);
                break;

            case 'unordered-list':
                // Reset ordered list processing when encountering unordered list
                state.isProcessingOrderedList = false;
                manageListStack(token, state);
                processListItem(token, state);
                break;

            case 'ordered-list':
                manageListStack(token, state);
                processOrderedListItem(token, state);
                break;
        }
    }

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}
