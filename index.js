const DEFAULT_CONTEXT = {
    '@vocab': 'http://schema.org/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    schema: 'http://schema.org/'
};

const DataFactory = {
    namedNode: (v) => ({ termType: 'NamedNode', value: v }),
    blankNode: (v = `b${Math.random().toString(36).slice(2, 11)}`) => ({ termType: 'BlankNode', value: v }),
    literal: (v, lang) => {
        if (typeof lang === 'string') {
            return { termType: 'Literal', value: v, language: lang, datatype: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') };
        }
        return { termType: 'Literal', value: v, language: '', datatype: lang || DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#string') };
    },
    quad: (s, p, o, g) => ({ subject: s, predicate: p, object: o, graph: g || DataFactory.namedNode('') })
};

function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return Math.abs(h).toString(16).slice(0, 12);
}

// IRI Utilities
function expandIRI(term, ctx) {
    if (term == null) return null;
    const raw = typeof term === 'string' ? term : (typeof term === 'object' && typeof term.value === 'string') ? term.value : String(term);
    const t = raw.trim();
    if (t.match(/^https?:/)) return t;
    if (t.includes(':')) {
        const [prefix, ref] = t.split(':', 2);
        return ctx[prefix] ? ctx[prefix] + ref : t;
    }
    return (ctx['@vocab'] || '') + t;
}

export function shortenIRI(iri, ctx) {
    if (!iri || !iri.startsWith('http')) return iri;
    if (ctx['@vocab'] && iri.startsWith(ctx['@vocab'])) return iri.substring(ctx['@vocab'].length);
    for (const [prefix, namespace] of Object.entries(ctx)) {
        if (prefix !== '@vocab' && iri.startsWith(namespace)) {
            return prefix + ':' + iri.substring(namespace.length);
        }
    }
    return iri;
}

function processIRI(term, ctx, operation = 'expand') {
    return operation === 'expand' ? expandIRI(term, ctx) : shortenIRI(term, ctx);
}

function parseSemanticBlock(raw) {
    try {
        const src = String(raw || '').trim();
        const cleaned = src.replace(/^\{|\}$/g, '').trim();
        if (!cleaned) return { subject: null, types: [], predicates: [], datatype: null, language: null, entries: [] };

        const result = { subject: null, types: [], predicates: [], datatype: null, language: null, entries: [] };
        const re = /\S+/g;
        let m;
        while ((m = re.exec(cleaned)) !== null) {
            const token = m[0];
            const relStart = 1 + m.index;
            const relEnd = relStart + token.length;
            const entryIndex = result.entries.length;

            if (token === '=') {
                result.subject = 'RESET';
                result.entries.push({ kind: 'subjectReset', relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('=#')) {
                const fragment = token.substring(2);
                result.subject = `=#${fragment}`;
                result.entries.push({ kind: 'fragment', fragment, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('=')) {
                const iri = token.substring(1);
                result.subject = iri;
                result.entries.push({ kind: 'subject', iri, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('^^')) {
                const datatype = token.substring(2);
                if (!result.language) result.datatype = datatype;
                result.entries.push({ kind: 'datatype', datatype, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('@')) {
                const language = token.substring(1);
                result.language = language;
                result.datatype = null;
                result.entries.push({ kind: 'language', language, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('.')) {
                const classIRI = token.substring(1);
                result.types.push({ iri: classIRI, entryIndex });
                result.entries.push({ kind: 'type', iri: classIRI, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('^?')) {
                const iri = token.substring(2);
                result.predicates.push({ iri, form: '^?', entryIndex });
                result.entries.push({ kind: 'property', iri, form: '^?', relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('^')) {
                const iri = token.substring(1);
                result.predicates.push({ iri, form: '^', entryIndex });
                result.entries.push({ kind: 'property', iri, form: '^', relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('?')) {
                const iri = token.substring(1);
                result.predicates.push({ iri, form: '?', entryIndex });
                result.entries.push({ kind: 'property', iri, form: '?', relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            result.predicates.push({ iri: token, form: '', entryIndex });
            result.entries.push({ kind: 'property', iri: token, form: '', relRange: { start: relStart, end: relEnd }, raw: token });
        }

        return result;
    } catch (error) {
        console.error(`Error parsing semantic block ${raw}:`, error);
        return { subject: null, types: [], predicates: [], datatype: null, language: null, entries: [] };
    }
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

        const prefixMatch = line.match(/^\[([^\]]+)\]\s*\{:\s*([^}]+)\}/);
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

        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
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

function extractInlineCarriers(text, baseOffset = 0) {
    const carriers = [];
    let pos = 0;

    while (pos < text.length) {
        const bracketStart = text.indexOf('[', pos);
        if (bracketStart === -1) break;

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

        if (bracketDepth > 0) break;

        const carrierText = text.substring(bracketStart + 1, bracketEnd - 1);
        const valueRange = [baseOffset + bracketStart + 1, baseOffset + bracketEnd - 1];
        let spanEnd = bracketEnd;
        let url = null;

        if (text[spanEnd] === '(') {
            const parenEnd = text.indexOf(')', spanEnd);
            if (parenEnd !== -1) {
                url = text.substring(spanEnd + 1, parenEnd);
                spanEnd = parenEnd + 1;
            }
        }

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

        let carrierType = 'span';
        let resourceIRI = null;

        if (url) {
            if (url.startsWith('=')) {
                pos = spanEnd;
                continue;
            } else {
                carrierType = 'link';
                resourceIRI = url;
            }
        }

        carriers.push({
            type: carrierType,
            text: carrierText,
            url: resourceIRI,
            attrs: attrs,
            attrsRange,
            valueRange,
            range: [baseOffset + bracketStart, baseOffset + spanEnd]
        });

        pos = spanEnd;
    }

    return carriers;
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

// Quad Utilities
function quadIndexKey(subject, predicate, object) {
    const objKey = object.termType === 'Literal'
        ? JSON.stringify({ t: 'Literal', v: object.value, lang: object.language || '', dt: object.datatype?.value || '' })
        : JSON.stringify({ t: object.termType, v: object.value });
    return JSON.stringify([subject.value, predicate.value, objKey]);
}

function normalizeQuad(q) {
    if (!q) return null;
    const { subject, predicate, object } = q;
    if (object?.termType === 'Literal') {
        const language = typeof object.language === 'string' ? object.language : '';
        const datatype = object.datatype?.value || 'http://www.w3.org/2001/XMLSchema#string';
        return { ...q, subject, predicate, object: { ...object, language, datatype } };
    }
    return { ...q, subject, predicate, object };
}

function objectSignature(o) {
    if (!o) return '';
    if (o.termType === 'Literal') {
        return JSON.stringify({ t: 'Literal', v: o.value, lang: o.language || '', dt: o.datatype?.value || '' });
    }
    return JSON.stringify({ t: o.termType, v: o.value });
}

function quadToKeyForOrigin(q) {
    const nq = normalizeQuad(q);
    return nq ? quadIndexKey(nq.subject, nq.predicate, nq.object) : null;
}

function parseQuadIndexKey(key) {
    try {
        const [s, p, objKey] = JSON.parse(key);
        return { s, p, o: JSON.parse(objKey) };
    } catch {
        return null;
    }
}

// Semantic Slot Utilities
function createSemanticSlotId(subject, predicate) {
    return hash(`${subject.value}|${predicate.value}`);
}

function createSlotInfo(blockId, entryIndex, meta = {}) {
    const slotId = meta.subject && meta.predicate ? createSemanticSlotId(meta.subject, meta.predicate) : null;
    return {
        blockId,
        entryIndex,
        slotId,
        isVacant: false,
        lastValue: null,
        vacantSince: null,
        ...meta
    };
}

function markSlotAsVacant(slotInfo, deletedValue) {
    if (!slotInfo) return null;
    return {
        ...slotInfo,
        isVacant: true,
        lastValue: deletedValue,
        vacantSince: Date.now()
    };
}

function findVacantSlot(quadIndex, subject, predicate) {
    const targetSlotId = createSemanticSlotId(subject, predicate);
    return Array.from(quadIndex.values())
        .find(slot => slot.slotId === targetSlotId && slot.isVacant);
}

function occupySlot(slotInfo, newValue) {
    if (!slotInfo || !slotInfo.isVacant) return null;
    return {
        ...slotInfo,
        isVacant: false,
        lastValue: newValue,
        vacantSince: null
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

function createLiteral(value, datatype, language, context, dataFactory) {
    if (datatype) return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
    if (language) return dataFactory.literal(value, language);
    return dataFactory.literal(value);
}

function processAnnotation(carrier, sem, state) {
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }

    const previousSubject = state.currentSubject;
    let newSubject = null;

    if (sem.subject) {
        if (sem.subject.startsWith('=#')) {
            // Handle fragment syntax
            const fragment = sem.subject.substring(2);
            if (state.currentSubject) {
                // Replace any existing fragment in current subject
                const baseIRI = state.currentSubject.value.split('#')[0];
                newSubject = state.df.namedNode(`${baseIRI}#${fragment}`);
            }
        } else {
            // Regular IRI
            newSubject = state.df.namedNode(expandIRI(sem.subject, state.ctx));
        }
    }
    if (newSubject) state.currentSubject = newSubject;

    const S = state.currentSubject;
    if (!S) return;

    const block = createBlock(S.value, sem.types, sem.predicates, sem.entries, carrier.range, carrier.attrsRange || null, carrier.valueRange || null, carrier.type || null, state.ctx);
    state.origin.blocks.set(block.id, block);

    const L = createLiteral(carrier.text, sem.datatype, sem.language, state.ctx, state.df);
    const O = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;

    sem.types.forEach(t => {
        const typeIRI = typeof t === 'string' ? t : t.iri;
        const entryIndex = typeof t === 'string' ? null : t.entryIndex;
        const typeSubject = O || S;
        const expandedType = expandIRI(typeIRI, state.ctx);
        emitQuad(state.quads, state.origin.quadIndex, block.id, typeSubject, state.df.namedNode(expandIRI('rdf:type', state.ctx)), state.df.namedNode(expandedType), state.df, { kind: 'type', token: `.${typeIRI}`, expandedType, entryIndex });
    });

    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
        const token = `${pred.form}${pred.iri}`;

        if (pred.form === '') {
            emitQuad(state.quads, state.origin.quadIndex, block.id, S, P, L, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex });
        } else if (pred.form === '?') {
            if (newSubject) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, previousSubject, P, newSubject, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex });
            } else if (O) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, S, P, O, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex });
            }
        } else if (pred.form === '^?') {
            if (newSubject) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, newSubject, P, previousSubject, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex });
            } else if (O) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, O, P, S, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value, entryIndex: pred.entryIndex });
            }
        }
    });
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
            if (pred.form === '^' || pred.form === '^?') {
                emitQuad(state.quads, state.origin.quadIndex, 'list-context', itemSubject, P, contextSubject, state.df);
            } else {
                emitQuad(state.quads, state.origin.quadIndex, 'list-context', contextSubject, P, itemSubject, state.df);
            }
        });

        const prevSubject = state.currentSubject;
        state.currentSubject = itemSubject;

        if (listToken.attrs) {
            const itemSem = parseSemanticBlock(listToken.attrs);
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
        currentSubject: null
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


// Text Processing Utilities
function readSpan(block, text, spanType = 'attrs') {
    const range = spanType === 'attrs' ? block?.attrsRange : block?.valueRange;
    if (!range) return null;
    const { start, end } = range;
    return (Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end >= start)
        ? { start, end, text: text.substring(start, end) }
        : null;
}

function normalizeAttrsTokens(attrsText) {
    const cleaned = String(attrsText || '').replace(/^\s*\{|\}\s*$/g, '').trim();
    return cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
}

function writeAttrsTokens(tokens) {
    return `{${tokens.join(' ').trim()}}`;
}

function removeOneToken(tokens, matchFn) {
    const i = tokens.findIndex(matchFn);
    return i === -1 ? { tokens, removed: false } : { tokens: [...tokens.slice(0, i), ...tokens.slice(i + 1)], removed: true };
}

function sanitizeCarrierValueForBlock(block, raw) {
    const s = String(raw ?? '');
    const t = block?.carrierType;
    if (t === 'code') return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const oneLine = s.replace(/[\n\r]+/g, ' ').trim();
    return (t === 'span' || t === 'link') ? oneLine.replace(/[\[\]]/g, ' ') : oneLine;
}

function blockTokensFromEntries(block) {
    return block?.entries?.length ? block.entries.map(e => e.raw).filter(Boolean) : null;
}

function removeEntryAt(block, entryIndex) {
    if (!block?.entries || entryIndex == null || entryIndex < 0 || entryIndex >= block.entries.length) return null;
    return [...block.entries.slice(0, entryIndex), ...block.entries.slice(entryIndex + 1)];
}

function replaceLangDatatypeEntries(block, lit, ctx) {
    if (!block?.entries) return null;
    const filtered = block.entries.filter(e => e.kind !== 'language' && e.kind !== 'datatype');
    const extras = [];
    if (lit?.language) extras.push({ kind: 'language', language: lit.language, raw: `@${lit.language}`, relRange: { start: 0, end: 0 } });
    const dt = lit?.datatype?.value;
    if (!lit?.language && dt && dt !== 'http://www.w3.org/2001/XMLSchema#string') {
        extras.push({ kind: 'datatype', datatype: shortenIRI(dt, ctx), raw: `^^${shortenIRI(dt, ctx)}`, relRange: { start: 0, end: 0 } });
    }
    return [...filtered, ...extras];
}

function updateAttrsDatatypeLang(tokens, newLit, ctx) {
    const predicatesAndTypes = tokens.filter(t => !t.startsWith('@') && !t.startsWith('^^'));
    if (newLit?.language) return [...predicatesAndTypes, `@${newLit.language}`];
    const dt = newLit?.datatype?.value;
    if (dt && dt !== 'http://www.w3.org/2001/XMLSchema#string') {
        return [...predicatesAndTypes, `^^${shortenIRI(dt, ctx)}`];
    }
    return predicatesAndTypes;
}

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) {
        const reparsed = parse(text, { context: options.context || {} });
        return { text, origin: reparsed.origin };
    }

    const base = origin || parse(text, { context: options.context || {} }).origin;
    let result = text;
    const edits = [];
    const ctx = options.context || {};

    const findOriginEntryForLiteralByValue = (subjectIri, predicateIri, literalValue) => {
        for (const [k, entry] of base?.quadIndex || []) {
            const parsed = parseQuadIndexKey(k);
            if (!parsed) continue;
            if (parsed.s !== subjectIri || parsed.p !== predicateIri) continue;
            if (parsed.o?.t !== 'Literal') continue;
            if (parsed.o?.v === literalValue) return entry;
        }
        return null;
    };

    const findLiteralCarrierBlocksBySP = (subjectIri, predicateIri) => {
        const out = [];
        for (const [k, entry] of base?.quadIndex || []) {
            const parsed = parseQuadIndexKey(k);
            if (!parsed) continue;
            if (parsed.s !== subjectIri || parsed.p !== predicateIri) continue;
            if (parsed.o?.t !== 'Literal') continue;
            const blockId = entry?.blockId || entry;
            const block = blockId ? base?.blocks?.get(blockId) : null;
            if (block) out.push({ block, entry, obj: parsed.o });
        }
        return out;
    };

    const anchors = new Map();
    for (const q0 of diff.delete || []) {
        const q = normalizeQuad(q0);
        if (!q) continue;
        if (!q?.subject || !q?.object || !q?.predicate) continue;
        const key = JSON.stringify([q.subject.value, objectSignature(q.object)]);
        const qk = quadToKeyForOrigin(q);
        const entry = qk ? base?.quadIndex?.get(qk) : null;
        const blockId = entry?.blockId || entry;
        const block = blockId ? base?.blocks?.get(blockId) : null;
        if (!block?.attrsRange) continue;
        anchors.set(key, { block, entry });
    }

    const addBySP = new Map();
    for (const q0 of diff.add || []) {
        const q = normalizeQuad(q0);
        if (!q) continue;
        if (!q?.subject || !q?.predicate || !q?.object) continue;
        const k = JSON.stringify([q.subject.value, q.predicate.value]);
        const list = addBySP.get(k) || [];
        list.push(q);
        addBySP.set(k, list);
    }

    const consumedAdds = new Set();
    const literalUpdates = [];
    for (const dq0 of diff.delete || []) {
        const dq = normalizeQuad(dq0);
        if (!dq) continue;
        if (!dq?.subject || !dq?.predicate || !dq?.object) continue;
        if (dq.object.termType !== 'Literal') continue;
        const k = JSON.stringify([dq.subject.value, dq.predicate.value]);
        const candidates = addBySP.get(k) || [];
        const aq = candidates.find(x => x?.object?.termType === 'Literal' && !consumedAdds.has(quadToKeyForOrigin(x)));
        if (!aq) continue;

        const dqk = quadToKeyForOrigin(dq);
        let entry = dqk ? base?.quadIndex?.get(dqk) : null;
        if (!entry && dq.object?.termType === 'Literal') {
            entry = findOriginEntryForLiteralByValue(dq.subject.value, dq.predicate.value, dq.object.value);
        }
        const blockId = entry?.blockId || entry;
        const block = blockId ? base?.blocks?.get(blockId) : null;
        if (!block) continue;

        literalUpdates.push({ deleteQuad: dq, addQuad: aq, entry, block });
        consumedAdds.add(quadToKeyForOrigin(aq));
    }

    for (const q0 of diff.add || []) {
        const quad = normalizeQuad(q0);
        if (!quad || quad.object?.termType !== 'Literal') continue;
        if (consumedAdds.has(quadToKeyForOrigin(quad))) continue;

        // Check if there's a vacant slot we can reuse
        const vacantSlot = findVacantSlot(base?.quadIndex, quad.subject, quad.predicate);
        if (!vacantSlot) continue;

        const block = base?.blocks?.get(vacantSlot.blockId);
        if (!block) continue;

        const span = readSpan(block, text, 'attrs');
        if (!span) continue;

        // Occupy the vacant slot and update the annotation
        const occupiedSlot = occupySlot(vacantSlot, quad.object);
        if (!occupiedSlot) continue;

        // Update the carrier value
        const valueSpan = readSpan(block, text, 'value');
        if (valueSpan) {
            edits.push({ start: valueSpan.start, end: valueSpan.end, text: quad.object.value });
        }

        // Update the annotation block to restore the predicate token
        const tokens = normalizeAttrsTokens(span.text);
        const predToken = `${vacantSlot.form || ''}${shortenIRI(quad.predicate.value, ctx)}`;

        // For empty annotation blocks, replace entirely; for non-empty, add if missing
        if (tokens.length === 0) {
            edits.push({ start: span.start, end: span.end, text: `{${predToken}}` });
        } else if (!tokens.includes(predToken)) {
            const updated = [...tokens, predToken];
            edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
        }

        // Mark as consumed and continue
        consumedAdds.add(quadToKeyForOrigin(quad));
        continue;

        const matches = findLiteralCarrierBlocksBySP(quad.subject.value, quad.predicate.value);
        if (matches.length === 0) continue;

        const desiredLang = quad.object.language || '';
        const sameLang = matches.filter(m => {
            const entries = m.block?.entries || [];
            const langEntry = entries.find(e => e.kind === 'language');
            const lang = langEntry?.language || '';
            return lang === desiredLang;
        });

        if (sameLang.length !== 1) continue;
        const target = sameLang[0].block;
        const vSpan = readSpan(target, text, 'value');
        if (!vSpan) continue;

        const newValue = sanitizeCarrierValueForBlock(target, quad.object.value);
        edits.push({ start: vSpan.start, end: vSpan.end, text: newValue });

        const aSpan = readSpan(target, text, 'attrs');
        if (aSpan && target?.entries?.length) {
            const nextEntries = replaceLangDatatypeEntries(target, quad.object, ctx);
            if (nextEntries) {
                const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(nextTokens) });
            }
        }

        consumedAdds.add(quad);
    }

    for (const u of literalUpdates) {
        const span = readSpan(u.block, text, 'value');
        if (span) {
            const newValue = sanitizeCarrierValueForBlock(u.block, u.addQuad.object.value);
            edits.push({ start: span.start, end: span.end, text: newValue });
        }

        const aSpan = readSpan(u.block, text, 'attrs');
        if (aSpan) {
            if (u.block?.entries?.length) {
                const nextEntries = replaceLangDatatypeEntries(u.block, u.addQuad.object, ctx);
                if (nextEntries) {
                    const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                    if (nextTokens.length === 0) {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: '{}' });
                    } else {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(nextTokens) });
                    }
                }
            } else {
                const tokens = normalizeAttrsTokens(aSpan.text);
                const updated = updateAttrsDatatypeLang(tokens, u.addQuad.object, ctx);
                if (updated.join(' ') !== tokens.join(' ')) {
                    if (updated.length === 0) {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: '{}' });
                    } else {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(updated) });
                    }
                }
            }
        }
    }


    if (diff.delete) {
        diff.delete.forEach(q0 => {
            const quad = normalizeQuad(q0);
            if (!quad) return;
            if (!quad?.subject || !quad?.predicate || !quad?.object) return;

            if (quad.object.termType === 'Literal') {
                const isUpdated = literalUpdates.some(u =>
                    u.deleteQuad.subject.value === quad.subject.value &&
                    u.deleteQuad.predicate.value === quad.predicate.value &&
                    u.deleteQuad.object.value === quad.object.value
                );
                if (isUpdated) return;
            }

            const key = quadToKeyForOrigin(quad);
            let entry = key ? base?.quadIndex?.get(key) : null;
            if (!entry && quad.object?.termType === 'Literal') {
                entry = findOriginEntryForLiteralByValue(quad.subject.value, quad.predicate.value, quad.object.value);
            }

            // Mark the semantic slot as vacant for future reuse
            if (entry && entry.slotId) {
                // Capture block information before marking as vacant
                const block = base?.blocks?.get(entry.blockId);
                const blockInfo = block ? {
                    id: entry.blockId,
                    range: block.range,
                    attrsRange: block.attrsRange,
                    valueRange: block.valueRange,
                    carrierType: block.carrierType,
                    subject: block.subject,
                    context: block.context
                } : null;

                const vacantSlot = markSlotAsVacant(entry, quad.object);
                if (vacantSlot && blockInfo) {
                    vacantSlot.blockInfo = blockInfo;
                    base.quadIndex.set(key, vacantSlot);
                }
            }

            const blockId = entry?.blockId || entry;
            if (!blockId) return;

            const block = base?.blocks?.get(blockId);
            if (!block) return;

            const span = readSpan(block, text, 'attrs');
            if (!span) return;

            // Handle entry removal by index
            if (entry?.entryIndex != null && block?.entries?.length) {
                const nextEntries = removeEntryAt(block, entry.entryIndex);
                if (!nextEntries) return;

                const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                const newText = nextTokens.length === 0 ? '{}' : writeAttrsTokens(nextTokens);
                edits.push({ start: span.start, end: span.end, text: newText });
                return;
            }

            const tokens = normalizeAttrsTokens(span.text);
            let updated = tokens;
            let removed = false;

            if (entry?.kind === 'type' && quad.predicate.value.endsWith('rdf-syntax-ns#type')) {
                const expectedType = entry.expandedType || quad.object.value;
                ({ tokens: updated, removed } = removeOneToken(tokens, t => {
                    if (!t.startsWith('.')) return false;
                    const raw = t.slice(1);
                    return expandIRI(raw, ctx) === expectedType;
                }));
            } else {
                const expectedPred = entry?.expandedPredicate || quad.predicate.value;
                const expectedForm = entry?.form;
                ({ tokens: updated, removed } = removeOneToken(tokens, t => {
                    const m = String(t).match(/^(\^\?|\^|\?|)(.+)$/);
                    if (!m) return false;
                    const form = m[1] || '';
                    const raw = m[2];
                    if (expectedForm != null && form !== expectedForm) return false;
                    return expandIRI(raw, ctx) === expectedPred;
                }));
            }

            if (!removed) return;

            if (updated.length === 0) {
                edits.push({ start: span.start, end: span.end, text: '{}' });
                return;
            }

            const newAttrs = writeAttrsTokens(updated);
            edits.push({ start: span.start, end: span.end, text: newAttrs });
        });
    }

    if (diff.add) {
        diff.add.forEach(q0 => {
            const quad = normalizeQuad(q0);
            if (!quad) return;
            if (!quad?.subject || !quad?.predicate || !quad?.object) return;

            if (consumedAdds.has(quadToKeyForOrigin(quad))) return;

            const anchorKey = JSON.stringify([quad.subject.value, objectSignature(quad.object)]);
            const anchored = anchors.get(anchorKey) || null;
            let targetBlock = anchored?.block || null;

            if (!targetBlock) {
                for (const [, block] of base?.blocks || []) {
                    if (block.subject === quad.subject.value && block.attrsRange) {
                        targetBlock = block;
                        break;
                    }
                }
            }

            if (quad.object.termType === 'Literal' || quad.object.termType === 'NamedNode') {
                if (!targetBlock) {
                    const predShort = shortenIRI(quad.predicate.value, ctx);
                    if (quad.object.termType === 'Literal') {
                        const value = String(quad.object.value ?? '');
                        let ann = predShort;
                        if (quad.object.language) ann += ` @${quad.object.language}`;
                        else if (quad.object.datatype?.value && quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                            ann += ` ^^${shortenIRI(quad.object.datatype.value, ctx)}`;
                        }
                        edits.push({ start: result.length, end: result.length, text: `\n[${value}] {${ann}}` });
                    } else {
                        const full = quad.object.value;
                        const label = shortenIRI(full, ctx);
                        edits.push({ start: result.length, end: result.length, text: `\n[${label}] {=${label}) {?${predShort}}` });
                    }
                    return;
                }

                const predShort = shortenIRI(quad.predicate.value, ctx);
                if (quad.object.termType === 'Literal') {
                    const value = String(quad.object.value ?? '');
                    let ann = predShort;
                    if (quad.object.language) ann += ` @${quad.object.language}`;
                    else if (quad.object.datatype?.value && quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                        ann += ` ^^${shortenIRI(quad.object.datatype.value, ctx)}`;
                    }
                    edits.push({ start: result.length, end: result.length, text: `\n[${value}] {${ann}}` });
                    return;
                }

                if (quad.object.termType === 'NamedNode') {
                    const full = quad.object.value;
                    const label = shortenIRI(full, ctx);
                    edits.push({ start: result.length, end: result.length, text: `\n[${label}] {=${shortenIRI(full, ctx)} ?${predShort}}` });
                    return;
                }
            }

            const span = readSpan(targetBlock, text, 'attrs');
            if (!span) return;
            const tokens = blockTokensFromEntries(targetBlock) || normalizeAttrsTokens(span.text);

            if (quad.predicate.value.endsWith('rdf-syntax-ns#type') && quad.object?.termType === 'NamedNode') {
                const typeShort = shortenIRI(quad.object.value, ctx);
                const typeToken = typeShort.includes(':') || !typeShort.startsWith('http') ? `.${typeShort}` : null;
                if (!typeToken) return;
                if (tokens.includes(typeToken)) return;
                const updated = [...tokens, typeToken];
                edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
                return;
            }

            const form = anchored?.entry?.form;
            if (form == null) return;
            const predShort = shortenIRI(quad.predicate.value, ctx);
            const predToken = `${form}${predShort}`;
            if (!predToken) return;
            if (tokens.includes(predToken)) return;
            const updated = [...tokens, predToken];
            edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
        });
    }

    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    // Extract vacant slots before reparsing to preserve them
    const vacantSlots = new Map();
    base?.quadIndex?.forEach((slot, key) => {
        if (slot.isVacant) {
            vacantSlots.set(key, slot);
        }
    });

    const reparsed = parse(result, { context: options.context || {} });

    // Merge vacant slots back into the new origin
    vacantSlots.forEach((vacantSlot, key) => {
        // Check if the block still exists in the new origin
        if (!reparsed.origin.blocks.has(vacantSlot.blockId)) {
            // Recreate the empty block for the vacant slot using preserved info
            const blockInfo = vacantSlot.blockInfo;
            if (blockInfo) {
                const emptyBlock = {
                    id: blockInfo.id,
                    range: blockInfo.range || { start: 0, end: 0 },
                    attrsRange: blockInfo.attrsRange,
                    valueRange: blockInfo.valueRange,
                    carrierType: blockInfo.carrierType || 'span',
                    subject: blockInfo.subject || '',
                    types: [],
                    predicates: [],
                    entries: [], // Empty entries - just {} annotation
                    context: blockInfo.context || { ...ctx }
                };
                reparsed.origin.blocks.set(vacantSlot.blockId, emptyBlock);
            }
        }

        // Merge the vacant slot back
        reparsed.origin.quadIndex.set(key, vacantSlot);
    });

    return { text: result, origin: reparsed.origin };
}

export default { parse, serialize, parseSemanticBlock, shortenIRI };