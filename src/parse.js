import {
    DataFactory,
    expandIRI,
    quadIndexKey,
    createLiteral,
    hash
} from './utils.js';
import {
    DEFAULT_CONTEXT,
    RDFS_LABEL,
    RDFS_COMMENT,
    RDF_TYPE,
    RDF_STATEMENT,
    RDF_SUBJECT,
    RDF_PREDICATE,
    RDF_OBJECT
} from './constants.js';
import {
    detectStandaloneSubject,
    detectPrefix,
    detectHeading,
    detectList,
    detectBlockquote,
    detectFence,
    scanInlineCarriers
} from './tokenizers.js';
import {

    getFenceClosePattern,
    calcRangeInfo,
    calcAttrsRange,
    createToken,
    createListToken,
    parseSemCached,
    extractCleanText,
    createLeanOriginEntry,
    resolveSubject,
    resolveObject,
    processTokenWithBlockTracking
} from './shared.js';


export function parse(firstArg, secondArg = {}) {
    // Dual-mode API: backward compatible with (text, options) and new ({ text, context, ... })
    const isNamedParams = typeof firstArg === 'object' && firstArg !== null && 'text' in firstArg;

    const text = isNamedParams ? firstArg.text : firstArg;
    const options = isNamedParams
        ? { context: firstArg.context, dataFactory: firstArg.dataFactory, graph: firstArg.graph }
        : secondArg;

    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        graph: options.graph ? DataFactory.namedNode(options.graph) : DataFactory.defaultGraph(),
        quads: [],
        quadBuffer: new Map(),
        removeSet: new Set(),
        origin: {
            quadIndex: new Map(),
            blocks: new Map(),
            spans: new Map(),
            documentStructure: []
        },
        currentSubject: null,
        primarySubject: null,
        primaryType: null,
        primaryLabel: null,
        tokens: null,
        currentTokenIndex: -1,
        statements: [],
        statementCandidates: new Map(),
        currentBlock: null,
        blockStack: [],
        lastBlockEnd: 0,
        lastBlockId: null,
        lastSpanId: null
    };

    const scanResult = scanTokens(text);
    state.tokens = scanResult.tokens;

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

    const quadKeys = new Set();
    for (const quad of state.quads) {
        quadKeys.add(quadIndexKey(quad.subject, quad.predicate, quad.object));
    }
    // 1. Materialize quads array from quadBuffer Map
    state.quads = Array.from(state.quadBuffer.values());

    // 2. Filter removeSet using O(1) state.quadBuffer lookup
    const filteredRemove = [];
    for (const quad of state.removeSet) {
        const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
        if (!state.quadBuffer.has(key)) {
            filteredRemove.push(quad);
        }
    }

    // 3. Create structured primary object for semantic surface
    const primary = {
        subject: state.primarySubject,
        type: state.primaryType,
        label: state.primaryLabel,
        comment: state.primaryComment
    };

    return {
        quads: state.quads,
        remove: filteredRemove,
        statements: state.statements,
        origin: state.origin,
        context: state.ctx,
        primarySubject: state.primarySubject,  // Canonical append identity
        primary,                             // Semantic surface descriptor
        md: scanResult.md
    };
}


// Cache for fence regex patterns - using shared utility

function getCarriers(token) {
    if (token.type === 'code') return [];
    return token._carriers || (token._carriers = extractInlineCarriers(token.text, token.range[0]));
}

function scanTokens(text) {
    const tokens = [];
    const mdLines = [];
    const lines = text.split('\n');
    let pos = 0;
    let codeBlock = null;
    let sfcBlock = null;

    function detectSfcStart(trimmed) {
        if (trimmed.startsWith('<!--')) return true;
        return /^<(script|style|template)\b/i.test(trimmed);
    }

    function checkSfcClose(line) {
        if (!sfcBlock) return;
        if (sfcBlock.tag === 'comment') {
            if (line.includes('-->')) sfcBlock = null;
        } else if (sfcBlock.tag === 'script' || sfcBlock.tag === 'style') {
            const closeReg = new RegExp(`</\\s*${sfcBlock.tag}\\s*>`, 'i');
            if (closeReg.test(line)) sfcBlock = null;
        } else if (sfcBlock.tag === 'template') {
            const openMatches = (line.match(/<template\b/gi) || []).length;
            const closeMatches = (line.match(/<\/template>/gi) || []).length;
            sfcBlock.depth += openMatches - closeMatches;
            if (sfcBlock.depth <= 0) sfcBlock = null;
        }
    }

    function handleSfcStart(line) {
        const trimmed = line.trim();
        if (trimmed.startsWith('<!--')) {
            sfcBlock = { tag: 'comment', depth: 1 };
        } else {
            const match = trimmed.match(/^<(script|style|template)\b/i);
            if (!match) return false;
            const tag = match[1].toLowerCase();
            sfcBlock = { tag, depth: tag === 'template' ? 0 : 1 };
        }
        mdLines.push(line);
        checkSfcClose(line);
        return true;
    }

    function handleSfcContent(line) {
        mdLines.push(line);
        checkSfcClose(line);
        return true;
    }

    const PROCESSORS = [
        { type: 'fence', test: line => detectFence(line.trim()), process: handleFence },
        { type: 'codeContent', test: () => codeBlock, process: line => codeBlock.content.push(line) },
        { type: 'sfcContent', test: () => sfcBlock, process: handleSfcContent },
        { type: 'sfcStart', test: line => detectSfcStart(line.trim()), process: handleSfcStart },
        { type: 'prefix', test: line => detectPrefix(line), process: handlePrefix },
        { type: 'standalone', test: line => detectStandaloneSubject(line), process: handleStandaloneSubject },
        { type: 'heading', test: line => detectHeading(line), process: handleHeading },
        { type: 'list', test: line => detectList(line), process: handleList },
        { type: 'blockquote', test: line => detectBlockquote(line), process: handleBlockquote },
        { type: 'para', test: line => line.trim(), process: handlePara }
    ];

    function handleFence(line, lineStart, pos) {
        const trimmedLine = line.trim();
        if (!codeBlock) {
            const fenceResult = detectFence(trimmedLine);
            if (!fenceResult) return false;

            const attrsText = fenceResult.attrs;
            const attrsStartInLine = attrsText ? line.indexOf(attrsText) : -1;
            const contentStart = lineStart + line.length + 1;

            codeBlock = {
                fence: fenceResult.fenceChar.repeat(fenceResult.fenceLength),
                start: lineStart,
                content: [],
                lang: fenceResult.lang,
                attrs: attrsText,
                attrsRange: attrsText && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrsText.length] : null,
                valueRangeStart: contentStart
            };

            const cleanFence = line.replace(/\s*\{[^}]+\}\s*$/, '');
            mdLines.push(cleanFence);
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

                for (const contentLine of codeBlock.content) {
                    mdLines.push(contentLine);
                }

                codeBlock = null;
                const closingFence = line.replace(/\r?\n.*$/, '');
                mdLines.push(closingFence);
            }
        }
        return true;
    }

    function handlePrefix(line, lineStart, pos) {
        const result = detectPrefix(line);
        tokens.push({ type: 'prefix', prefix: result.prefix, iri: result.iri });
        return true;
    }

    function handleHeading(line, lineStart, pos) {
        const result = detectHeading(line);
        const attrs = result.attrs;
        const afterHashes = result.depth;
        const rangeInfo = calcRangeInfo(line, attrs, lineStart, afterHashes, result.content.length);
        tokens.push(createToken('heading', [lineStart, pos - 1], result.content, attrs,
            rangeInfo.attrsRange, rangeInfo.valueRange, { depth: result.depth }));

        const cleanHeading = `${'#'.repeat(result.depth)} ${result.content}`;
        mdLines.push(cleanHeading);
        return true;
    }

    function handleList(line, lineStart, pos) {
        const result = detectList(line);
        const indentStr = ' '.repeat(result.indent);
        const match = [line, indentStr, result.marker, result.content, result.attrs];
        tokens.push(createListToken('list', line, lineStart, pos, match));

        const cleanList = `${indentStr}${result.marker} ${result.content}`;
        mdLines.push(cleanList);
        return true;
    }

    function handleBlockquote(line, lineStart, pos) {
        const result = detectBlockquote(line);
        const attrs = result.attrs;
        const valueStartInLine = line.startsWith('> ') ? 2 : line.indexOf('>') + 1;
        const valueEndInLine = valueStartInLine + result.content.length;
        tokens.push(createToken('blockquote', [lineStart, pos - 1], result.content, attrs,
            calcAttrsRange(line, attrs, lineStart),
            [lineStart + valueStartInLine, lineStart + valueEndInLine]));

        const cleanBlockquote = `> ${result.content}`;
        mdLines.push(cleanBlockquote);
        return true;
    }

    function handlePara(line, lineStart, pos) {
        tokens.push(createToken('para', [lineStart, pos - 1], line.trim()));

        let cleanPara = line;

        // 1. Mask inline code spans (`...`) first to prevent processing inside code
        const codeSpans = [];
        cleanPara = cleanPara.replace(/`[^`]+`/g, match => {
            codeSpans.push(match);
            return `__INLINE_CODE_${codeSpans.length - 1}__`;
        });

        // 2. Mask Vue double-curly interpolations (handles single nested braces like JS objects)
        const mustaches = [];
        cleanPara = cleanPara.replace(/\{\{(?:[^{}]|\{[^{}]*\})*\}\}/g, match => {
            mustaches.push(match);
            return `__VUE_INTERPOLATION_${mustaches.length - 1}__`;
        });

        // 3. Remove inline carriers in REVERSE order to preserve character ranges
        const carriers = scanInlineCarriers(cleanPara, 0);
        for (let i = carriers.length - 1; i >= 0; i--) {
            const carrier = carriers[i];
            if (carrier.attrs && (carrier.type === 'emphasis' || carrier.type === 'code')) {
                const before = cleanPara.substring(0, carrier.range[0]);
                const after = cleanPara.substring(carrier.range[1]);
                cleanPara = before + (carrier.text || '') + after;
            }
        }

        // 4. Remove MD-LD bracket & single-brace annotations
        cleanPara = cleanPara.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, '$1');
        cleanPara = cleanPara.replace(/([^{]|^)\{[^{}]+\}(?=[^}]|$)/g, '$1');

        // 5. Restore Vue interpolations & inline code
        cleanPara = cleanPara.replace(/__VUE_INTERPOLATION_(\d+)__/g, (_, idx) => mustaches[Number(idx)]);
        cleanPara = cleanPara.replace(/__INLINE_CODE_(\d+)__/g, (_, idx) => codeSpans[Number(idx)]);

        // 6. Preserve Markdown hard line breaks (2+ trailing spaces) while trimming single spaces/tabs
        const trailingSpaces = cleanPara.match(/ {2,}$/);
        if (trailingSpaces) {
            cleanPara = cleanPara.replace(/[ \t]+$/, trailingSpaces[0]);
        } else {
            cleanPara = cleanPara.replace(/[ \t]+$/, '');
        }

        mdLines.push(cleanPara);
        return true;
    }

    function handleStandaloneSubject(line, lineStart, pos) {
        tokens.push({ type: 'standalone', text: line.trim(), range: [lineStart, pos - 1] });
        return true;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = pos;
        pos += line.length + 1;

        for (const processor of PROCESSORS) {
            if (processor.test(line) && processor.process(line, lineStart, pos)) {
                break;
            }
        }
    }

    const mdContent = mdLines.join('\n');
    return { tokens, md: mdContent };
}

function extractInlineCarriers(text, baseOffset = 0) {
    return scanInlineCarriers(text, baseOffset);
}


function createBlockEntry(token, state) {
    const blockId = token._blockId || hash(`${token.type}:${token.range?.[0]}:${token.range?.[1]}`);
    token._blockId = blockId; // Store for later reference

    // Extract inline carriers first to enable clean text extraction
    const carriers = getCarriers(token);

    const cleanText = extractCleanText(token);

    const blockStart = token.range[0];
    const blockEnd = token.range[1];

    // Construct span between previous block and this block (single-pass, O(1))
    let prevSpanId = null;
    if (state.lastBlockId !== null) {
        const spanStart = state.lastBlockEnd;
        const spanEnd = blockStart;
        if (spanEnd > spanStart) {
            const spanId = hash(`span:${spanStart}:${spanEnd}`);
            const span = {
                id: spanId,
                range: [spanStart, spanEnd],
                prevBlockId: state.lastBlockId,
                nextBlockId: blockId,
                prevSpanId: state.lastSpanId || null,
                nextSpanId: null,
                byteLength: spanEnd - spanStart
            };
            state.origin.spans.set(spanId, span);

            // Link previous span's nextSpanId
            if (state.lastSpanId) {
                const prevSpan = state.origin.spans.get(state.lastSpanId);
                if (prevSpan) prevSpan.nextSpanId = spanId;
            }

            // Link previous block's nextSpanId
            const prevBlock = state.origin.blocks.get(state.lastBlockId);
            if (prevBlock) prevBlock.nextSpanId = spanId;

            state.lastSpanId = spanId;
            prevSpanId = spanId;
        }
    }
    state.lastBlockEnd = blockEnd;
    state.lastBlockId = blockId;

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
        quadKeys: [],
        prevSpanId,
        nextSpanId: null
    };

    // Process carriers and add to block
    for (const carrier of carriers) {
        const carrierInfo = {
            type: carrier.type,
            range: carrier.range,
            text: carrier.text,
            subject: null,
            predicates: [],
            sem: null
        };

        // Extract carrier-specific semantics
        if (carrier.attrs) {
            const carrierSem = parseSemCached(carrier.attrs);
            carrierInfo.sem = carrierSem; // Store full semantics
            carrierInfo.predicates = carrierSem.predicates || [];
            carrierInfo.subject = carrierSem.subject;
            carrierInfo.types = carrierSem.types || [];
        }

        blockEntry.carriers.push(carrierInfo);
    }

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
            carrierInfo.sem = carrierSem; // Store full semantics
            carrierInfo.predicates = carrierSem.predicates || [];
            carrierInfo.subject = carrierSem.subject;
            carrierInfo.types = carrierSem.types || [];
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
        valueRange: valueRange ? { start: valueRange[0], end: valueRange[1] } : null,
        carrierType: carrierType || null,
        subject,
        types: expanded.types,
        predicates: expanded.predicates,
        context: ctx,
        text: text || ''
    };
}

/**
 * Hardened O(1) quad emitter.
 * Uses state.quadBuffer (Map) as the single source of truth during parsing to
 * eliminate O(N^2) array searching/splicing during quad retractions.
 */
function emitQuad(state, block, subject, predicate, object, meta = null) {
    // 1. Guard against invalid RDF terms
    if (!subject || !predicate || !object) return;

    const quadKey = quadIndexKey(subject, predicate, object);
    const isRetract = Boolean(meta?.remove);

    // 2. O(1) Retraction path
    if (isRetract) {
        if (state.quadBuffer.has(quadKey)) {
            // Cancel quad from active document state - O(1)
            state.quadBuffer.delete(quadKey);
            state.origin.quadIndex.delete(quadKey);
        } else {
            // Quad originated externally -> track quad object for external retraction
            const retractQuad = state.df.quad(subject, predicate, object, state.graph);
            state.removeSet.add(retractQuad);
        }
        return;
    }

    // 3. O(1) Insertion path
    const quad = state.df.quad(subject, predicate, object, state.graph);
    state.quadBuffer.set(quadKey, quad);

    // 4. Primary metadata tracking (first occurrence only)
    const predVal = predicate.value;
    if (!state.primaryType && predVal === RDF_TYPE) {
        state.primaryType = object.value;
    } else if (!state.primaryLabel && predVal === RDFS_LABEL && object.termType === 'Literal') {
        state.primaryLabel = object.value;
    } else if (!state.primaryComment && predVal === RDFS_COMMENT && object.termType === 'Literal') {
        state.primaryComment = object.value;
    }

    // 5. Single-pass rdf:Statement reification pattern detection
    if (state.statements && state.statementCandidates) {
        detectStatementPatternSinglePass(quad, state.df, meta, state.statements, state.statementCandidates);
    }

    // 6. Origin tracking
    const originEntry = createLeanOriginEntry(block, subject, predicate, meta);
    state.origin.quadIndex.set(quadKey, originEntry);

    // 7. Safe block linking for reverse visual lookup
    if (block && state.currentBlock && block.id === state.currentBlock.id) {
        if (!state.currentBlock.quadKeys) {
            state.currentBlock.quadKeys = [];
        }
        state.currentBlock.quadKeys.push(quadKey);
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
        state,
        block,
        subject,
        state.df.namedNode(expandIRI('rdf:type', state.ctx)),
        state.df.namedNode(expandedType),
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
            emitQuad(
                state,
                block,
                role.subject,
                P,
                role.object,
                {
                    kind: 'pred',
                    token: `${pred.form}${pred.iri}`,
                    form: pred.form,
                    expandedPredicate: P.value,
                    entryIndex: pred.entryIndex,
                    remove: pred.remove || false
                }
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
    const result = detectStandaloneSubject(token.text);
    if (!result) return;

    const sem = parseSemCached(`{=${result.content}}`);
    const attrsStart = token.range[0] + token.text.indexOf('{=');
    processAnnotation({
        type: 'standalone', text: '', range: token.range,
        attrsRange: [attrsStart, attrsStart + (result.content ? result.content.length : 0)],
        valueRange: null
    }, sem, state);
}

const TOKEN_PROCESSORS = {
    heading: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    code: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    blockquote: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    para: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry, [processStandaloneSubject]),
    list: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
    standalone: (token, state) => processStandaloneSubject(token, state),
};
