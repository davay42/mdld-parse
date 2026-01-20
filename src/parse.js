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

// Semantic block cache to avoid repeated parsing
const semCache = new Map();
const EMPTY_SEM = { predicates: [], types: [], subject: null };

function parseSemCached(attrs) {
    if (!attrs) return EMPTY_SEM;
    let sem = semCache.get(attrs);
    if (!sem) {
        sem = parseSemanticBlock(attrs);
        semCache.set(attrs, sem);
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

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = pos;
        pos += line.length + 1;

        if (line.startsWith('```')) {
            if (!codeBlock) {
                const fence = line.match(/^(`{3,})(.*)/);
                const attrsText = fence[2].match(/\{[^}]+\}/)?.[0] || null;
                const attrsStartInLine = attrsText ? line.indexOf(attrsText) : -1;
                const contentStart = lineStart + line.length + 1;
                codeBlock = {
                    fence: fence[1],
                    start: lineStart,
                    content: [],
                    lang: fence[2].trim().split(/[\s{]/)[0],
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
            continue;
        }

        if (codeBlock) {
            codeBlock.content.push(line);
            continue;
        }

        const prefixMatch = line.match(/^\[([^\]]+)\]\s*<([^>]+)>/);
        if (prefixMatch) {
            tokens.push({ type: 'prefix', prefix: prefixMatch[1], iri: prefixMatch[2].trim() });
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (headingMatch) {
            const attrs = headingMatch[3] || null;
            const afterHashes = headingMatch[1].length;
            const ws = line.substring(afterHashes).match(/^\s+/)?.[0]?.length || 0;
            const valueStartInLine = afterHashes + ws;
            const valueEndInLine = valueStartInLine + headingMatch[2].length;
            tokens.push(createToken('heading', [lineStart, pos - 1], headingMatch[2].trim(), attrs,
                calcAttrsRange(line, attrs, lineStart),
                calcValueRange(lineStart, valueStartInLine, valueEndInLine),
                { depth: headingMatch[1].length }));
            continue;
        }

        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/);
        if (listMatch) {
            const attrs = listMatch[4] || null;
            const prefix = listMatch[1].length + listMatch[2].length;
            const ws = line.substring(prefix).match(/^\s+/)?.[0]?.length || 0;
            const valueStartInLine = prefix + ws;
            const valueEndInLine = valueStartInLine + listMatch[3].length;
            tokens.push(createToken('list', [lineStart, pos - 1], listMatch[3].trim(), attrs,
                calcAttrsRange(line, attrs, lineStart),
                calcValueRange(lineStart, valueStartInLine, valueEndInLine),
                { indent: listMatch[1].length }));
            continue;
        }

        const blockquoteMatch = line.match(/^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (blockquoteMatch) {
            const attrs = blockquoteMatch[2] || null;
            const prefixMatch = line.match(/^>\s+/);
            const valueStartInLine = prefixMatch ? prefixMatch[0].length : 2;
            const valueEndInLine = valueStartInLine + blockquoteMatch[1].length;
            tokens.push(createToken('blockquote', [lineStart, pos - 1], blockquoteMatch[1].trim(), attrs,
                calcAttrsRange(line, attrs, lineStart),
                calcValueRange(lineStart, valueStartInLine, valueEndInLine)));
            continue;
        }

        if (line.trim()) {
            tokens.push(createToken('para', [lineStart, pos - 1], line.trim()));
        }
    }

    return tokens;
}

// Inline carrier pattern constants
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /^[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/,
    CODE_SPAN: /^``(.+?)``\s*\{([^}]+)\}/
};

function createCarrier(type, text, attrs, attrsRange, valueRange, range, pos, extra = {}) {
    return { type, text, attrs, attrsRange, valueRange, range, pos, ...extra };
}

function extractInlineCarriers(text, baseOffset = 0) {
    const carriers = [];
    let pos = 0;

    while (pos < text.length) {
        const emphasisCarrier = tryExtractEmphasisCarrier(text, pos, baseOffset);
        if (emphasisCarrier) {
            carriers.push(emphasisCarrier);
            pos = emphasisCarrier.pos;
            continue;
        }

        const codeCarrier = tryExtractCodeCarrier(text, pos, baseOffset);
        if (codeCarrier) {
            carriers.push(codeCarrier);
            pos = codeCarrier.pos;
            continue;
        }

        const bracketCarrier = tryExtractBracketCarrier(text, pos, baseOffset);
        if (bracketCarrier) {
            if (bracketCarrier.skip) {
                pos = bracketCarrier.pos;
                continue;
            }
            carriers.push(bracketCarrier);
            pos = bracketCarrier.pos;
            continue;
        }

        break;
    }

    return carriers;
}

function calcCarrierRanges(match, baseOffset, offset = 0) {
    const valueStart = baseOffset + offset;
    const valueEnd = valueStart + match[1].length;
    const attrsStart = valueEnd + 2;
    const attrsEnd = attrsStart + match[2].length;
    return {
        valueRange: [valueStart, valueEnd],
        attrsRange: [attrsStart, attrsEnd],
        range: [valueStart, attrsEnd],
        pos: attrsEnd
    };
}

function tryExtractEmphasisCarrier(text, pos, baseOffset) {
    const match = text.match(INLINE_CARRIER_PATTERNS.EMPHASIS, pos);
    if (!match) return null;

    const ranges = calcCarrierRanges(match, baseOffset, match[0].length);
    return createCarrier('emphasis', match[1], `{${match[2]}}`,
        ranges.attrsRange, ranges.valueRange, ranges.range, ranges.pos);
}

function tryExtractCodeCarrier(text, pos, baseOffset) {
    const match = text.match(INLINE_CARRIER_PATTERNS.CODE_SPAN, pos);
    if (!match) return null;

    const ranges = calcCarrierRanges(match, baseOffset, 2);
    return createCarrier('code', match[1], `{${match[2]}}`,
        ranges.attrsRange, ranges.valueRange, ranges.range, ranges.pos);
}

function tryExtractBracketCarrier(text, pos, baseOffset) {
    const bracketStart = text.indexOf('[', pos);
    if (bracketStart === -1) return null;

    const bracketEnd = findMatchingBracket(text, bracketStart);
    if (!bracketEnd) return null;

    const carrierText = text.substring(bracketStart + 1, bracketEnd - 1);
    const { url, spanEnd } = extractUrlFromBrackets(text, bracketEnd);
    const { attrs, attrsRange, finalSpanEnd } = extractAttributesFromText(text, spanEnd, baseOffset);
    const { carrierType, resourceIRI } = determineCarrierType(url);

    if (url && url.startsWith('=')) {
        return { skip: true, pos: finalSpanEnd };
    }

    return createCarrier(carrierType, carrierText, attrs, attrsRange,
        [baseOffset + bracketStart + 1, baseOffset + bracketEnd - 1],
        [baseOffset + bracketStart, baseOffset + finalSpanEnd],
        finalSpanEnd, { url: resourceIRI });
}

function findMatchingBracket(text, bracketStart) {
    let bracketDepth = 1;
    let bracketEnd = bracketStart + 1;

    while (bracketEnd < text.length && bracketDepth > 0) {
        if (text[bracketEnd] === '[') {
            bracketDepth++;
        } else if (text[bracketEnd] === ']') {
            bracketDepth--;
        }
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

    const attrsMatch = text.substring(spanEnd).match(/^\s*\{([^}]+)\}/);
    if (attrsMatch) {
        attrs = `{${attrsMatch[1]}}`;
        const braceIndex = attrsMatch[0].indexOf('{');
        const absStart = baseOffset + spanEnd + (braceIndex >= 0 ? braceIndex : 0);
        attrsRange = [absStart, absStart + attrs.length];
        spanEnd += attrsMatch[0].length;
    }

    return { attrs, attrsRange, finalSpanEnd: spanEnd };
}

function determineCarrierType(url) {
    let carrierType = 'span';
    let resourceIRI = null;

    if (url && !url.startsWith('=')) {
        carrierType = 'link';
        resourceIRI = url;
    }

    return { carrierType, resourceIRI };
}

function createBlock(subject, types, predicates, entries, range, attrsRange, valueRange, carrierType, ctx) {
    const expanded = {
        subject,
        types: types.map(t => expandIRI(typeof t === 'string' ? t : t.iri, ctx)),
        predicates: predicates.map(p => ({ iri: expandIRI(p.iri, ctx), form: p.form }))
    };

    // Use semantic signature for stable block identity
    const signature = [
        subject,
        expanded.types.sort().join(','),
        expanded.predicates.map(p => `${p.form}${p.iri}`).sort().join(',')
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

    // Create enhanced slot info with semantic slot tracking
    const slotInfo = createSlotInfo(blockId, meta?.entryIndex, {
        ...meta,
        subject,
        predicate,
        object
    });

    quadIndex.set(quadIndexKey(quad.subject, quad.predicate, quad.object), slotInfo);
}


// Helper functions for subject and object resolution
function resolveSubject(sem, state) {
    if (!sem.subject) return null;

    if (sem.subject.startsWith('=#')) {
        // Handle fragment syntax
        const fragment = sem.subject.substring(2);
        if (state.currentSubject) {
            const baseIRI = state.currentSubject.value.split('#')[0];
            return state.df.namedNode(`${baseIRI}#${fragment}`);
        }
        return null;
    } else {
        // Regular IRI
        return state.df.namedNode(expandIRI(sem.subject, state.ctx));
    }
}

function resolveObject(sem, state) {
    if (!sem.object) return null;

    // Handle soft IRI object declaration - local to this annotation only
    if (sem.object.startsWith('#')) {
        // Soft fragment - resolve against current subject base
        const fragment = sem.object.substring(1);
        if (state.currentSubject) {
            const baseIRI = state.currentSubject.value.split('#')[0];
            return state.df.namedNode(`${baseIRI}#${fragment}`);
        }
        return null;
    } else {
        // Regular soft IRI
        return state.df.namedNode(expandIRI(sem.object, state.ctx));
    }
}

function processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state) {
    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        const entryIndex = typeof t === 'string' ? null : t.entryIndex;
        const typeSubject = newSubject ? newSubject : (localObject || carrierO || S);
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

function processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state) {
    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));

        // Pre-bind subject/object roles for clarity
        const roles = {
            '': { subject: localObject || S, object: L },
            '?': { subject: newSubject ? previousSubject : S, object: localObject || newSubjectOrCarrierO },
            '!': { subject: localObject || newSubjectOrCarrierO, object: newSubject ? previousSubject : S }
        };

        const role = roles[pred.form];
        if (role && role.subject && role.object) {
            emitQuad(
                state.quads, state.origin.quadIndex, block.id,
                role.subject, P, role.object, state.df,
                { kind: 'pred', token: `${pred.form}${pred.iri}`, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
            );
        }
    });
}

function processAnnotation(carrier, sem, state, preserveGlobalSubject = false) {
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        state.currentObject = null;
        return;
    }

    const previousSubject = state.currentSubject;
    const newSubject = resolveSubject(sem, state);
    const localObject = resolveObject(sem, state);

    if (newSubject && !preserveGlobalSubject) {
        state.currentSubject = newSubject;
    }
    const S = preserveGlobalSubject ? (newSubject || previousSubject) : state.currentSubject;
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

    processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state);
    processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state);
}

// Helper functions for list item processing
function findSubjectInAttrs(attrs, state, carrierInfo = null) {
    const sem = parseSemCached(attrs);
    if (sem.subject && sem.subject !== 'RESET') {
        const subject = resolveSubject(sem, state);
        if (subject) {
            return { subject, carrier: carrierInfo || { type: 'unknown', text: '', attrs } };
        }
    }
    return null;
}

function hasPredicatesInAttrs(attrs) {
    const sem = parseSemCached(attrs);
    return sem.predicates.length > 0;
}

export function findItemSubject(listToken, carriers, state) {
    const subjectFromAttrs = findSubjectInAttrs(listToken.attrs, state, {
        type: 'list', text: listToken.text, attrs: listToken.attrs, range: listToken.range
    });
    if (subjectFromAttrs) return subjectFromAttrs;

    for (const carrier of carriers) {
        const subjectFromCarrier = findSubjectInAttrs(carrier.attrs, state, carrier);
        if (subjectFromCarrier) return subjectFromCarrier;
    }

    return null;
}

function hasOwnPredicates(listToken, carriers) {
    // Check for explicit predicates (excluding subject declarations)
    if (hasPredicatesInAttrs(listToken.attrs)) {
        const attrs = parseSemCached(listToken.attrs);
        // Only count non-subject predicates as "own predicates"
        const nonSubjectPreds = attrs.predicates.filter(p => !p.subject && p.iri !== 'RESET');
        return nonSubjectPreds.length > 0;
    }
    return carriers.some(carrier => {
        const carrierAttrs = parseSemCached(carrier.attrs);
        const nonSubjectPreds = carrierAttrs.predicates.filter(p => !p.subject && p.iri !== 'RESET');
        return nonSubjectPreds.length > 0;
    });
}

function processListContextTypes(contextSem, itemSubject, state) {
    contextSem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        emitQuad(
            state.quads, state.origin.quadIndex, 'list-context',
            itemSubject,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)),
            state.df.namedNode(expandIRI(typeIRI, state.ctx)),
            state.df
        );
    });
}

function processListContextPredicates(contextSem, itemSubject, contextSubject, state) {
    contextSem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
        if (pred.form === '!') {
            emitQuad(state.quads, state.origin.quadIndex, 'list-context', itemSubject, P, contextSubject, state.df);
        } else if (pred.form === '?') {
            emitQuad(state.quads, state.origin.quadIndex, 'list-context', contextSubject, P, itemSubject, state.df);
        }
    });
}

function processInheritedPredicates(contextSem, listToken, state) {
    const inheritedPredicates = contextSem.predicates.filter(p => p.form === '');
    if (inheritedPredicates.length === 0 || !listToken.text) return;

    const inheritedSem = parseSemCached(`{${inheritedPredicates.map(p => p.iri).join(' ')}}`);
    const itemInfo = findItemSubject(listToken, [], state);
    const itemSubject = itemInfo?.subject;

    if (!itemSubject) return;

    const prevSubject = state.currentSubject;
    state.currentSubject = itemSubject;

    processAnnotation(createCarrierFromToken(listToken, 'list'), inheritedSem, state, true);

    state.currentSubject = prevSubject;
}

function processListContext(contextSem, listTokens, state, contextSubject = null) {
    if (!contextSubject) contextSubject = state.currentSubject;

    listTokens.forEach(listToken => {
        const carriers = getCarriers(listToken);
        const itemInfo = findItemSubject(listToken, carriers, state);
        if (!itemInfo) return;

        const { subject: itemSubject } = itemInfo;

        // Apply context types and predicates
        processListContextTypes(contextSem, itemSubject, state);
        processListContextPredicates(contextSem, itemSubject, contextSubject, state);

        const prevSubject = state.currentSubject;
        state.currentSubject = itemSubject;

        // Inherit literal predicates if item has no own predicates
        if (!hasOwnPredicates(listToken, carriers)) {
            processInheritedPredicates(contextSem, listToken, state);
        }

        // Process token annotations
        if (listToken.attrs) {
            const sem = parseSemCached(listToken.attrs);
            processAnnotation(createCarrierFromToken(listToken, 'list'), sem, state);
        }

        // Process inline carriers
        carriers.forEach(carrier => {
            if (carrier.attrs) {
                const sem = parseSemCached(carrier.attrs);
                processAnnotation(carrier, sem, state);
            }
        });

        state.currentSubject = prevSubject;
    });
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

    // Apply list context if available
    if (listFrame?.contextSem) {
        processListContextTypes(listFrame.contextSem, itemSubject, state);
        processListContextPredicates(listFrame.contextSem, itemSubject, listFrame.contextSubject, state);

        // Inherit literal predicates if item has no own predicates
        const hasOwnPreds = hasOwnPredicates(token, carriers);
        if (!hasOwnPreds) {
            processInheritedPredicates(listFrame.contextSem, token, state);
        }
    }

    // Process item's own annotations - but don't change global current subject for list items
    const prevSubject = state.currentSubject;
    const shouldUpdateGlobalSubject = !state.listStack.length;

    if (shouldUpdateGlobalSubject) {
        state.currentSubject = itemSubject;
    }

    // Process token attributes using consolidated function
    if (token.attrs) {
        const sem = parseSemCached(token.attrs);
        processAnnotation(createCarrierFromToken(token, 'list'), sem, state, !shouldUpdateGlobalSubject);
    }

    // Process inline carriers' annotations
    carriers.forEach(carrier => {
        if (carrier.attrs) {
            const sem = parseSemCached(carrier.attrs);
            processAnnotation(carrier, sem, state, !shouldUpdateGlobalSubject);
        }
    });

    // Restore global current subject
    if (shouldUpdateGlobalSubject) {
        state.currentSubject = prevSubject;
    }
}

function processListContextFromParagraph(token, state) {
    const contextMatch = token.text.match(/^(.+?)\s*\{([^}]+)\}$/);

    if (contextMatch) {
        const contextSem = parseSemCached(`{${contextMatch[2]}}`);

        // Context subject resolution:
        // 1. For top-level lists: use current subject or document subject
        // 2. For nested lists: use parent list item's subject
        let contextSubject = state.currentSubject || state.documentSubject;

        // Check if this is a nested list context by looking ahead
        const nextTokenIndex = state.currentTokenIndex + 1;
        const nextToken = state.tokens && state.tokens[nextTokenIndex];

        if (state.listStack.length > 0 && nextToken && nextToken.type === 'list') {
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
function createCarrierFromToken(token, tokenType) {
    return {
        type: tokenType,
        text: token.text,
        range: token.range,
        attrsRange: token.attrsRange || null,
        valueRange: token.valueRange || null
    };
}

function processTokenAnnotations(token, state, tokenType) {
    // Process token's own attributes
    if (token.attrs) {
        const sem = parseSemCached(token.attrs);
        processAnnotation(createCarrierFromToken(token, tokenType), sem, state);
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
    const match = token.text.match(/^\s*\{=(.*?)\}\s*$/);
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
        currentObject: null,
        documentSubject: null, // Track main document subject from headings
        listStack: [],
        pendingListContext: null,
        tokens: null, // Store tokens for lookahead
        currentTokenIndex: -1 // Track current token index
    };

    state.tokens = scanTokens(text);

    // Process prefix declarations first
    state.tokens.filter(t => t.type === 'prefix').forEach(t => state.ctx[t.prefix] = t.iri);

    // Process all other tokens
    for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i];
        state.currentTokenIndex = i;

        switch (token.type) {
            case 'heading':
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
            case 'blockquote':
                processTokenAnnotations(token, state, token.type);
                break;

            case 'para':
                processStandaloneSubject(token, state);
                processListContextFromParagraph(token, state);
                processTokenAnnotations(token, state, token.type);
                break;

            case 'list':
                manageListStack(token, state);
                processListItem(token, state);
                break;
        }
    }

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}
