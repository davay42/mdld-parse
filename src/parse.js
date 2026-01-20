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
            const attrsStartInLine = attrs ? line.lastIndexOf(attrs) : -1;
            const afterHashes = headingMatch[1].length;
            const ws = line.substring(afterHashes).match(/^\s+/)?.[0]?.length || 0;
            const valueStartInLine = afterHashes + ws;
            const valueEndInLine = valueStartInLine + headingMatch[2].length;
            tokens.push({
                type: 'heading',
                depth: headingMatch[1].length,
                range: [lineStart, pos - 1],
                text: headingMatch[2].trim(),
                attrs,
                attrsRange: attrs && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null,
                valueRange: [lineStart + valueStartInLine, lineStart + valueEndInLine]
            });
            continue;
        }

        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/);
        if (listMatch) {
            const attrs = listMatch[4] || null;
            const attrsStartInLine = attrs ? line.lastIndexOf(attrs) : -1;
            const prefix = listMatch[1].length + listMatch[2].length;
            const ws = line.substring(prefix).match(/^\s+/)?.[0]?.length || 0;
            const valueStartInLine = prefix + ws;
            const valueEndInLine = valueStartInLine + listMatch[3].length;
            tokens.push({
                type: 'list',
                indent: listMatch[1].length,
                range: [lineStart, pos - 1],
                text: listMatch[3].trim(),
                attrs,
                attrsRange: attrs && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null,
                valueRange: [lineStart + valueStartInLine, lineStart + valueEndInLine]
            });
            continue;
        }

        const blockquoteMatch = line.match(/^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (blockquoteMatch) {
            const attrs = blockquoteMatch[2] || null;
            const attrsStartInLine = attrs ? line.lastIndexOf(attrs) : -1;
            const prefixMatch = line.match(/^>\s+/);
            const valueStartInLine = prefixMatch ? prefixMatch[0].length : 2;
            const valueEndInLine = valueStartInLine + blockquoteMatch[1].length;
            tokens.push({
                type: 'blockquote',
                range: [lineStart, pos - 1],
                text: blockquoteMatch[1].trim(),
                attrs,
                attrsRange: attrs && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null,
                valueRange: [lineStart + valueStartInLine, lineStart + valueEndInLine]
            });
            continue;
        }

        if (line.trim()) {
            tokens.push({
                type: 'para',
                range: [lineStart, pos - 1],
                text: line.trim(),
                attrs: null
            });
        }
    }

    return tokens;
}

// Inline carrier pattern constants
const INLINE_CARRIER_PATTERNS = {
    EMPHASIS: /^[*__`]+(.+?)[*__`]+\s*\{([^}]+)\}/,
    CODE_SPAN: /^``(.+?)``\s*\{([^}]+)\}/
};

function extractInlineCarriers(text, baseOffset = 0) {
    const carriers = [];
    let pos = 0;

    while (pos < text.length) {
        // Try emphasis patterns first (before brackets)
        const emphasisCarrier = tryExtractEmphasisCarrier(text, pos, baseOffset);
        if (emphasisCarrier) {
            carriers.push(emphasisCarrier);
            pos = emphasisCarrier.pos;
            continue;
        }

        // Try code spans
        const codeCarrier = tryExtractCodeCarrier(text, pos, baseOffset);
        if (codeCarrier) {
            carriers.push(codeCarrier);
            pos = codeCarrier.pos;
            continue;
        }

        // Try bracket patterns (original logic)
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

function tryExtractEmphasisCarrier(text, pos, baseOffset) {
    const emphasisMatch = text.match(INLINE_CARRIER_PATTERNS.EMPHASIS, pos);
    if (!emphasisMatch) return null;

    const carrierText = emphasisMatch[1];
    const valueRange = [baseOffset + emphasisMatch[0].length, baseOffset + emphasisMatch[0].length + emphasisMatch[1].length];

    return {
        type: 'emphasis',
        text: carrierText,
        attrs: `{${emphasisMatch[2]}}`,
        attrsRange: [baseOffset + emphasisMatch[0].length + emphasisMatch[1].length + 2, baseOffset + emphasisMatch[0].length + emphasisMatch[1].length + emphasisMatch[2].length],
        valueRange,
        range: [baseOffset + emphasisMatch[0].length, baseOffset + emphasisMatch[0].length + emphasisMatch[1].length],
        pos: baseOffset + emphasisMatch[0].length + emphasisMatch[1].length + emphasisMatch[2].length
    };
}

function tryExtractCodeCarrier(text, pos, baseOffset) {
    const codeMatch = text.match(INLINE_CARRIER_PATTERNS.CODE_SPAN, pos);
    if (!codeMatch) return null;

    const carrierText = codeMatch[1];
    const valueRange = [baseOffset + 2, baseOffset + 2 + codeMatch[1].length];

    return {
        type: 'code',
        text: carrierText,
        attrs: `{${codeMatch[2]}}`,
        attrsRange: [baseOffset + 2 + codeMatch[1].length + 2, baseOffset + 2 + codeMatch[1].length + 2],
        valueRange,
        range: [baseOffset + 2, baseOffset + 2 + codeMatch[1].length + 2],
        pos: baseOffset + 2 + codeMatch[1].length + 2
    };
}

function tryExtractBracketCarrier(text, pos, baseOffset) {
    const bracketStart = text.indexOf('[', pos);
    if (bracketStart === -1) return null;

    const bracketEnd = findMatchingBracket(text, bracketStart);
    if (!bracketEnd) return null;

    const carrierText = text.substring(bracketStart + 1, bracketEnd - 1);
    const valueRange = [baseOffset + bracketStart + 1, baseOffset + bracketEnd - 1];

    // Extract URL if present
    const { url, spanEnd } = extractUrlFromBrackets(text, bracketEnd);

    // Extract attributes if present
    const { attrs, attrsRange, finalSpanEnd } = extractAttributesFromText(text, spanEnd, baseOffset);

    // Determine carrier type and resource IRI
    const { carrierType, resourceIRI } = determineCarrierType(url);

    // Handle reference-style links
    if (url && url.startsWith('=')) {
        return { skip: true, pos: finalSpanEnd };
    }

    return {
        type: carrierType,
        text: carrierText,
        url: resourceIRI,
        attrs,
        attrsRange,
        valueRange,
        range: [baseOffset + bracketStart, baseOffset + finalSpanEnd],
        pos: finalSpanEnd
    };
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
    const blockId = hash([subject, JSON.stringify(expanded)].join('|'));
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

function processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier) {
    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        const entryIndex = typeof t === 'string' ? null : t.entryIndex;

        // For types with subject declarations, type applies to new subject
        // For types with soft IRI declarations, type applies to soft IRI object
        // Otherwise, type applies to carrier object or current subject
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
        const token = `${pred.form}${pred.iri}`;

        if (pred.form === '') {
            // S —p→ L (use soft IRI object as subject if available, otherwise current subject)
            const subjectIRI = localObject || S;
            emitQuad(
                state.quads, state.origin.quadIndex, block.id,
                subjectIRI, P, L, state.df,
                { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
            );
        } else if (pred.form === '?') {
            // S —p→ O (use previous subject as subject, newSubject as object)
            const subjectIRI = newSubject ? previousSubject : S;
            const objectIRI = localObject || newSubjectOrCarrierO;
            if (objectIRI && subjectIRI) {
                emitQuad(
                    state.quads, state.origin.quadIndex, block.id,
                    subjectIRI, P, objectIRI, state.df,
                    { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
                );
            }
        } else if (pred.form === '^') {
            // L —p→ S (use soft IRI object as subject if available, otherwise current subject)
            const subjectIRI = localObject || S;
            emitQuad(
                state.quads, state.origin.quadIndex, block.id,
                L, P, subjectIRI, state.df,
                { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
            );
        } else if (pred.form === '!') {
            // O —p→ S (use previous subject as object, newSubject as subject)
            const objectIRI = newSubject ? previousSubject : S;
            const subjectIRI = localObject || newSubjectOrCarrierO;
            if (objectIRI && subjectIRI) {
                emitQuad(
                    state.quads, state.origin.quadIndex, block.id,
                    subjectIRI, P, objectIRI, state.df,
                    { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex }
                );
            }
        }
    });
}

function processAnnotation(carrier, sem, state) {
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        state.currentObject = null;
        return;
    }

    const previousSubject = state.currentSubject;
    const newSubject = resolveSubject(sem, state);
    const localObject = resolveObject(sem, state);

    if (newSubject) state.currentSubject = newSubject;

    const S = state.currentSubject;
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

    // Process type annotations
    processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier);

    // Process predicate annotations
    processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state);
}

function processListContext(contextSem, listTokens, state, contextSubject = null) {
    if (!contextSubject) contextSubject = state.currentSubject;

    listTokens.forEach(listToken => {
        const carriers = extractInlineCarriers(listToken.text, listToken.range[0]);
        let itemSubject = null;
        let itemSubjectCarrier = null;

        if (listToken.attrs) {
            const itemSem = parseSemanticBlock(listToken.attrs);
            if (itemSem.subject && itemSem.subject !== 'RESET') {
                if (itemSem.subject.startsWith('=#')) {
                    // Handle fragment syntax in list items
                    const fragment = itemSem.subject.substring(2);
                    if (state.currentSubject) {
                        const baseIRI = state.currentSubject.value.split('#')[0];
                        itemSubject = state.df.namedNode(`${baseIRI}#${fragment}`);
                    }
                } else {
                    itemSubject = state.df.namedNode(expandIRI(itemSem.subject, state.ctx));
                }
                itemSubjectCarrier = { type: 'list', text: listToken.text, attrs: listToken.attrs, range: listToken.range };
            }
        }

        if (!itemSubject) {
            for (const carrier of carriers) {
                if (carrier.attrs) {
                    const itemSem = parseSemanticBlock(carrier.attrs);
                    if (itemSem.subject && itemSem.subject !== 'RESET') {
                        if (itemSem.subject.startsWith('=#')) {
                            // Handle fragment syntax in inline carriers
                            const fragment = itemSem.subject.substring(2);
                            if (state.currentSubject) {
                                const baseIRI = state.currentSubject.value.split('#')[0];
                                itemSubject = state.df.namedNode(`${baseIRI}#${fragment}`);
                            }
                        } else {
                            itemSubject = state.df.namedNode(expandIRI(itemSem.subject, state.ctx));
                        }
                        itemSubjectCarrier = carrier;
                        break;
                    }
                }
            }
        }

        if (!itemSubject) return;

        contextSem.types.forEach(t => {
            const typeIRI = typeof t === 'string' ? t : t.iri;
            emitQuad(state.quads, state.origin.quadIndex, 'list-context', itemSubject, state.df.namedNode(expandIRI('rdf:type', state.ctx)), state.df.namedNode(expandIRI(typeIRI, state.ctx)), state.df);
        });

        contextSem.predicates.forEach(pred => {
            const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));

            // According to MD-LD spec: list predicates that connect to item subjects MUST use object predicate forms (?p or !p)
            // Literal predicate forms (p) in list scope emit no quads
            if (pred.form === '!') {
                // Reverse object property: O —p→ S
                emitQuad(state.quads, state.origin.quadIndex, 'list-context', itemSubject, P, contextSubject, state.df);
            } else if (pred.form === '?') {
                // Object property: S —p→ O
                emitQuad(state.quads, state.origin.quadIndex, 'list-context', contextSubject, P, itemSubject, state.df);
            }
            // Note: pred.form === '' and pred.form === '^' are intentionally ignored (literal predicate forms)
        });

        const prevSubject = state.currentSubject;
        state.currentSubject = itemSubject;

        // Check if item has its own predicates
        let hasOwnPredicates = false;
        let itemSem = null;

        if (listToken.attrs) {
            itemSem = parseSemanticBlock(listToken.attrs);
            if (itemSem.predicates.length > 0) {
                hasOwnPredicates = true;
            }
        }

        if (!hasOwnPredicates) {
            // Check inline carriers for predicates
            for (const carrier of carriers) {
                if (carrier.attrs) {
                    const carrierSem = parseSemanticBlock(carrier.attrs);
                    if (carrierSem.predicates.length > 0) {
                        hasOwnPredicates = true;
                        break;
                    }
                }
            }
        }

        // If item has no predicates, inherit literal predicates from context
        if (!hasOwnPredicates) {
            const inheritedPredicates = contextSem.predicates.filter(p => p.form === '');
            if (inheritedPredicates.length > 0 && listToken.text) {
                // Create inherited annotation block
                const inheritedTokens = inheritedPredicates.map(p => p.iri).join(' ');
                const inheritedSem = parseSemanticBlock(`{${inheritedTokens}}`);
                const carrier = { type: 'list', text: listToken.text, range: listToken.range, attrsRange: listToken.attrsRange || null, valueRange: listToken.valueRange || null };
                processAnnotation(carrier, inheritedSem, state);
            }
        }

        if (listToken.attrs) {
            if (!itemSem) itemSem = parseSemanticBlock(listToken.attrs);
            const carrier = { type: 'list', text: listToken.text, range: listToken.range, attrsRange: listToken.attrsRange || null, valueRange: listToken.valueRange || null };
            processAnnotation(carrier, itemSem, state);
        }

        carriers.forEach(carrier => {
            if (carrier.attrs) {
                const itemSem = parseSemanticBlock(carrier.attrs);
                processAnnotation(carrier, itemSem, state);
            }
        });

        state.currentSubject = prevSubject;
    });
}

export function parse(text, options = {}) {
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        quads: [],
        origin: { blocks: new Map(), quadIndex: new Map() },
        currentSubject: null,
        currentObject: null
    };

    const tokens = scanTokens(text);
    tokens.filter(t => t.type === 'prefix').forEach(t => state.ctx[t.prefix] = t.iri);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'heading' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'heading', text: token.text, range: token.range, attrsRange: token.attrsRange || null, valueRange: token.valueRange || null };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'code' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'code', text: token.text, range: token.range, attrsRange: token.attrsRange || null, valueRange: token.valueRange || null };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'blockquote' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'blockquote', text: token.text, range: token.range, attrsRange: token.attrsRange || null, valueRange: token.valueRange || null };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'para') {
            // Check for standalone subject declarations: {=iri} on its own line
            const standaloneSubjectMatch = token.text.match(/^\s*\{=(.*?)\}\s*$/);
            if (standaloneSubjectMatch) {
                const sem = parseSemanticBlock(`{=${standaloneSubjectMatch[1]}}`);
                const attrsStart = token.range[0] + token.text.indexOf('{=');
                const attrsEnd = attrsStart + (standaloneSubjectMatch[1] ? standaloneSubjectMatch[1].length : 0);
                processAnnotation({ type: 'standalone', text: '', range: token.range, attrsRange: [attrsStart, attrsEnd], valueRange: null }, sem, state);
            }

            const followingLists = [];
            let j = i + 1;
            while (j < tokens.length && tokens[j].type === 'list') {
                followingLists.push(tokens[j]);
                j++;
            }

            const contextMatch = token.text.match(/^(.+?)\s*\{([^}]+)\}$/);
            if (contextMatch && followingLists.length > 0) {
                const contextSem = parseSemanticBlock(`{${contextMatch[2]}}`);
                let contextSubject = state.currentSubject;

                // Always look for the most recent heading subject for context
                for (let k = i - 1; k >= 0; k--) {
                    const prevToken = tokens[k];
                    if (prevToken.type === 'heading' && prevToken.attrs) {
                        const headingSem = parseSemanticBlock(prevToken.attrs);
                        if (headingSem.subject) {
                            contextSubject = state.df.namedNode(expandIRI(headingSem.subject, state.ctx));
                            break;
                        }
                    }
                }

                processListContext(contextSem, followingLists, state, contextSubject);
                i = j - 1;
                continue;
            }

            const carriers = extractInlineCarriers(token.text, token.range[0]);
            carriers.forEach(carrier => {
                if (carrier.attrs) {
                    const sem = parseSemanticBlock(carrier.attrs);
                    processAnnotation(carrier, sem, state);
                }
            });
        }
    }

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}
