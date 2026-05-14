import {
    DataFactory,
    expandIRI,
    quadIndexKey,
    createLiteral,
    hash
} from './utils.js';
import {
    DEFAULT_CONTEXT,
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
        blockStack: []
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

    // Create structured primary object for semantic surface
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
    const PROCESSORS = [
        { type: 'fence', test: line => detectFence(line.trim()), process: handleFence },
        { type: 'content', test: () => codeBlock, process: line => codeBlock.content.push(line) },
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

            // Add stripped fence line to mdLines
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

                // Add all code content to mdLines before closing fence
                for (const contentLine of codeBlock.content) {
                    mdLines.push(contentLine);
                }

                codeBlock = null;

                // Add closing fence to mdLines without trailing newline
                const closingFence = line.replace(/\r?\n.*$/, '');
                mdLines.push(closingFence);
            } else {
                // Code content - don't add to mdLines here, will be added when closing block
                // No need to add individual lines as they're processed when closing
            }
        }
        return true;
    }

    function handlePrefix(line, lineStart, pos) {
        const result = detectPrefix(line);
        tokens.push({ type: 'prefix', prefix: result.prefix, iri: result.iri });
        // Prefixes are typically stripped from clean MD
        return true;
    }

    function handleHeading(line, lineStart, pos) {
        const result = detectHeading(line);
        const attrs = result.attrs;
        const afterHashes = result.depth;
        const rangeInfo = calcRangeInfo(line, attrs, lineStart, afterHashes, result.content.length);
        tokens.push(createToken('heading', [lineStart, pos - 1], result.content, attrs,
            rangeInfo.attrsRange, rangeInfo.valueRange, { depth: result.depth }));

        // Add stripped heading to mdLines
        const cleanHeading = `${'#'.repeat(result.depth)} ${result.content}`;
        mdLines.push(cleanHeading);
        return true;
    }

    function handleList(line, lineStart, pos) {
        const result = detectList(line);
        // Create match array format expected by createListToken
        const indentStr = ' '.repeat(result.indent);
        const match = [line, indentStr, result.marker, result.content, result.attrs];
        tokens.push(createListToken('list', line, lineStart, pos, match));

        // Add stripped list item to mdLines
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

        // Add stripped blockquote to mdLines
        const cleanBlockquote = `> ${result.content}`;
        mdLines.push(cleanBlockquote);
        return true;
    }

    function handlePara(line, lineStart, pos) {
        tokens.push(createToken('para', [lineStart, pos - 1], line.trim()));

        // Add stripped paragraph to mdLines
        let cleanPara = line;

        // Remove inline carrier annotations using character-based detection
        const carriers = scanInlineCarriers(cleanPara, 0);
        for (const carrier of carriers) {
            if (carrier.attrs && (carrier.type === 'emphasis' || carrier.type === 'code')) {
                // Replace with just the content
                const before = cleanPara.substring(0, carrier.range[0]);
                const after = cleanPara.substring(carrier.range[1]);
                cleanPara = before + (carrier.text || '') + after;
            }
        }

        // Remove bracket-style annotations [text] {annotation}
        cleanPara = cleanPara.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, '$1');

        // Remove any remaining standalone annotations
        cleanPara = cleanPara.replace(/\s*\{[^}]+\}\s*/g, ' ');

        // Clean up extra whitespace
        cleanPara = cleanPara.replace(/\s+/g, ' ').trim();

        mdLines.push(cleanPara);
        return true;
    }

    function handleStandaloneSubject(line, lineStart, pos) {
        tokens.push({ type: 'standalone', text: line.trim(), range: [lineStart, pos - 1] });

        // Standalone subjects are stripped from MD by default
        // Don't add anything to mdLines
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

    // Join without trailing newline to match expected output
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

        // Track primary type and label (first occurrence only)
        if (state) {
            if (!state.primaryType && predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                state.primaryType = object.value;
            }
            if (!state.primaryLabel && predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label' && object.termType === 'Literal') {
                state.primaryLabel = object.value;
            }
            if (!state.primaryComment && predicate.value === 'http://www.w3.org/2000/01/rdf-schema#comment' && object.termType === 'Literal') {
                state.primaryComment = object.value;
            }
        }

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
