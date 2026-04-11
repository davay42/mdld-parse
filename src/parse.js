import {
    DataFactory,
    expandIRI,
    quadIndexKey,
    createLiteral,
    hash
} from './utils.js';
import {
    DEFAULT_CONTEXT,
    URL_REGEX,
    FENCE_REGEX,
    PREFIX_REGEX,
    HEADING_REGEX,
    UNORDERED_LIST_REGEX,
    BLOCKQUOTE_REGEX,
    STANDALONE_SUBJECT_REGEX,
    CARRIER_PATTERN_ARRAY,

} from './constants.js';
import {

    getFenceClosePattern,
    calcRangeInfo,
    calcAttrsRange,
    createToken,
    createCarrier,
    createListToken,
    parseSemCached,
    parseLangAndAttrs,
    findMatchingBracket,
    extractUrlFromBrackets,
    extractAttributesFromText,
    determineCarrierType,
    calcCarrierRanges,
    extractCleanText,
    RDF_TYPE,
    RDF_STATEMENT,
    RDF_SUBJECT,
    RDF_PREDICATE,
    RDF_OBJECT,
    createLeanOriginEntry,
    resolveSubject,
    resolveObject,
    processTokenWithBlockTracking
} from './shared.js';


export function parse(text, options = {}) {
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        graph: DataFactory.namedNode(options.graph) || DataFactory.defaultGraph(),
        quads: [],
        quadBuffer: new Map(),
        removeSet: new Set(),
        origin: {
            quadIndex: new Map(),
            blocks: new Map(),
            documentStructure: []
        },
        currentSubject: null,
        primarySubject: null,
        tokens: null,
        currentTokenIndex: -1,
        statements: [],
        statementCandidates: new Map(),
        currentBlock: null,
        blockStack: []
    };

    state.tokens = scanTokens(text);

    // Single-pass processing: resolve prefixes AND process tokens together
    for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i];
        state.currentTokenIndex = i;

        // Handle prefix tokens immediately during main pass
        if (token.type === 'prefix') {
            let resolvedIri = token.iri;
            if (token.iri.includes(':')) {
                const colonIndex = token.iri.indexOf(':');
                const potentialPrefix = token.iri.substring(0, colonIndex);
                const reference = token.iri.substring(colonIndex + 1);
                if (state.ctx[potentialPrefix] && potentialPrefix !== '@vocab') {
                    resolvedIri = state.ctx[potentialPrefix] + reference;
                }
            }
            state.ctx[token.prefix] = resolvedIri;
            continue; // Skip token processor for prefixes
        }

        // Process all other tokens
        TOKEN_PROCESSORS[token.type]?.(token, state);
    }

    // Optimized quad filtering - use Set.has() instead of array.includes()
    const quadKeys = new Set();
    for (const quad of state.quads) {
        quadKeys.add(quadIndexKey(quad.subject, quad.predicate, quad.object));
    }

    // Direct Set iteration - more efficient than filter()
    const filteredRemove = [];
    for (const quad of state.removeSet) {
        const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
        if (!quadKeys.has(key)) {
            filteredRemove.push(quad);
        }
    }

    return { quads: state.quads, remove: filteredRemove, statements: state.statements, origin: state.origin, context: state.ctx, primarySubject: state.primarySubject };
}


// Cache for fence regex patterns - using shared utility

function getCarriers(token) {
    if (token.type === 'code') return [];
    return token._carriers || (token._carriers = extractInlineCarriers(token.text, token.range[0]));
}

function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let pos = 0;
    let codeBlock = null;
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

        // Use pre-compiled patterns instead of Object.entries()
        for (const [type, pattern] of CARRIER_PATTERN_ARRAY) {
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


function createBlockEntry(token, state) {
    const blockId = token._blockId || hash(`${token.type}:${token.range?.[0]}:${token.range?.[1]}`);
    token._blockId = blockId; // Store for later reference

    const cleanText = extractCleanText(token);

    const blockEntry = {
        id: blockId,
        type: token.type,
        range: token.range,
        text: cleanText,
        subject: null,
        types: [],
        predicates: [],
        carriers: [],
        listLevel: token.indent || 0,
        parentBlockId: state.blockStack.length > 0 ? state.blockStack[state.blockStack.length - 1] : null,
        quadKeys: [] // Will be populated during quad emission
    };

    // Store block and add to document structure
    state.origin.blocks.set(blockId, blockEntry);
    state.origin.documentStructure.push(blockEntry);

    return blockEntry;
}

function enrichBlockFromAnnotation(blockEntry, sem, carrier, state) {
    // Update subject if available
    if (sem.subject && sem.subject !== 'RESET') {
        const resolvedSubject = resolveSubject(sem, state);
        if (resolvedSubject) {
            blockEntry.subject = resolvedSubject.value;
        }
    }

    // Add types
    if (sem.types && sem.types.length > 0) {
        sem.types.forEach(t => {
            const typeIRI = typeof t === 'string' ? t : t.iri;
            const expanded = expandIRI(typeIRI, state.ctx);
            if (!blockEntry.types.includes(expanded)) {
                blockEntry.types.push(expanded);
            }
        });
    }

    // Add predicates
    if (sem.predicates && sem.predicates.length > 0) {
        sem.predicates.forEach(pred => {
            const expandedPred = {
                iri: expandIRI(pred.iri, state.ctx),
                form: pred.form || '',
                object: null // Will be filled during quad emission
            };
            blockEntry.predicates.push(expandedPred);
        });
    }

    // Add carrier information
    if (carrier) {
        const carrierInfo = {
            type: carrier.type,
            range: carrier.range,
            text: carrier.text,
            subject: null,
            predicates: []
        };

        // Extract carrier-specific semantics
        if (carrier.attrs) {
            const carrierSem = parseSemCached(carrier.attrs);
            if (carrierSem.types) {
                carrierInfo.predicates = carrierSem.predicates || [];
            }
        }

        blockEntry.carriers.push(carrierInfo);
    }
}

function processAnnotationWithBlockTracking(carrier, sem, state, options = {}) {
    const { preserveGlobalSubject = false, implicitSubject = null } = options;

    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }

    const previousSubject = state.currentSubject;
    const newSubject = resolveSubject(sem, state);
    const localObject = resolveObject(sem, state);

    // Track primary subject: first non-fragment subject declaration (fixed once detected)
    if (newSubject && !state.primarySubject && !sem.subject.startsWith('=#')) {
        state.primarySubject = newSubject.value; // Store as string IRI
    }

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

    // Enrich current block with semantic information
    if (state.currentBlock) {
        enrichBlockFromAnnotation(state.currentBlock, sem, carrier, state);
    }

    processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier);
    processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier);
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

function emitQuad(quads, quadBuffer, removeSet, quadIndex, block, subject, predicate, object, dataFactory, meta = null, statements = null, statementCandidates = null, state = null) {
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

        // Detect rdf:Statement pattern during single-pass parsing
        detectStatementPatternSinglePass(quad, dataFactory, meta, statements, statementCandidates);

        // Create lean origin entry using shared utility
        const originEntry = createLeanOriginEntry(block, subject, predicate, meta);

        quadIndex.set(quadKey, originEntry);

        // Link block to this quad for reverse lookup during rendering
        if (state.currentBlock && block.id === state.currentBlock.id) {
            if (!state.currentBlock.quadKeys) {
                state.currentBlock.quadKeys = [];
            }
            state.currentBlock.quadKeys.push(quadKey);
        }
    }
}

function detectStatementPatternSinglePass(quad, dataFactory, meta, statements = null, statementCandidates = null) {
    // Skip if not called from parse context (for testing compatibility)
    if (!statements || !statementCandidates) return;

    const predicate = quad.predicate.value;

    // Early filter: only process rdf:Statement related predicates
    if (predicate !== RDF_TYPE &&
        predicate !== RDF_SUBJECT &&
        predicate !== RDF_PREDICATE &&
        predicate !== RDF_OBJECT) {
        return;
    }

    // Check if this quad starts a new rdf:Statement pattern
    if (predicate === RDF_TYPE && quad.object.value === RDF_STATEMENT) {
        statementCandidates.set(quad.subject.value, { spo: {} });
        return;
    }

    // Check if this quad completes part of an existing rdf:Statement pattern
    const candidate = statementCandidates.get(quad.subject.value);
    if (!candidate) return;

    // Direct property assignment instead of switch for better performance
    if (predicate === RDF_SUBJECT) {
        candidate.spo.subject = quad.object;
    } else if (predicate === RDF_PREDICATE) {
        candidate.spo.predicate = quad.object;
    } else if (predicate === RDF_OBJECT) {
        candidate.spo.object = quad.object;
        // Store the original quad for potential literal extraction
        candidate.objectQuad = quad;
    }

    // Check if pattern is complete and create elevated SPO quad
    if (candidate.spo.subject && candidate.spo.predicate && candidate.spo.object) {
        // Use the object directly - literal detection happens at parse time
        const spoQuad = dataFactory.quad(
            candidate.spo.subject,
            candidate.spo.predicate,
            candidate.spo.object
        );
        statements.push(spoQuad);
        // Clean up candidate to avoid duplicate detection
        statementCandidates.delete(quad.subject.value);
    }
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
        { kind: 'type', token: `.${typeIRI}`, expandedType, entryIndex: typeInfo.entryIndex, remove: typeInfo.remove },
        state.statements, state.statementCandidates,
        state
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
                { kind: 'pred', token: `${pred.form}${pred.iri}`, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex, remove: pred.remove || false },
                state.statements, state.statementCandidates,
                state
            );
        }
    });
}

function processAnnotation(carrier, sem, state, options = {}) {
    // Use the enhanced block tracking version
    processAnnotationWithBlockTracking(carrier, sem, state, options);
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
    heading: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    code: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    blockquote: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    para: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry, [processStandaloneSubject]),
    list: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
};
