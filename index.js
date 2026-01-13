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

function expandIRI(term, ctx) {
    if (!term) return null;
    const t = term.trim();
    if (t.match(/^https?:/)) return t;
    if (t.includes(':')) {
        const [prefix, ref] = t.split(':', 2);
        return ctx[prefix] ? ctx[prefix] + ref : t;
    }
    return (ctx['@vocab'] || '') + t;
}

function parseSemanticBlock(raw) {
    try {
        const cleaned = raw.replace(/^\{|\}$/g, '').trim();
        if (!cleaned) return { subject: null, types: [], predicates: [], datatype: null, language: null };

        const result = { subject: null, types: [], predicates: [], datatype: null, language: null };
        const tokens = cleaned.split(/\s+/).filter(t => t);

        for (const token of tokens) {
            if (token === '=') {
                result.subject = 'RESET';
            } else if (token.startsWith('=')) {
                result.subject = token.substring(1);
            } else if (token.startsWith('^^')) {
                // Only set datatype if no language is set
                if (!result.language) {
                    result.datatype = token.substring(2);
                }
            } else if (token.startsWith('@')) {
                result.language = token.substring(1);
                // Clear datatype when language is set (language takes priority)
                result.datatype = null;
            } else if (token.startsWith('.')) {
                result.types.push(token.substring(1));
            } else if (token.startsWith('^?')) {
                result.predicates.push({ iri: token.substring(2), form: '^?' });
            } else if (token.startsWith('^')) {
                result.predicates.push({ iri: token.substring(1), form: '^' });
            } else if (token.startsWith('?')) {
                result.predicates.push({ iri: token.substring(1), form: '?' });
            } else {
                result.predicates.push({ iri: token, form: '' });
            }
        }

        return result;
    } catch (error) {
        console.error(`Error parsing semantic block ${raw}:`, error);
        return { subject: null, types: [], predicates: [], datatype: null, language: null };
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
                codeBlock = {
                    fence: fence[1],
                    start: lineStart,
                    content: [],
                    lang: fence[2].trim().split(/[\s{]/)[0],
                    attrs: attrsText,
                    attrsRange: attrsText && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrsText.length] : null
                };
            } else if (line.startsWith(codeBlock.fence)) {
                tokens.push({
                    type: 'code',
                    range: [codeBlock.start, lineStart],
                    text: codeBlock.content.join('\n'),
                    lang: codeBlock.lang,
                    attrs: codeBlock.attrs,
                    attrsRange: codeBlock.attrsRange
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
            tokens.push({
                type: 'heading',
                depth: headingMatch[1].length,
                range: [lineStart, pos - 1],
                text: headingMatch[2].trim(),
                attrs,
                attrsRange: attrs && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null
            });
            continue;
        }

        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (listMatch) {
            const attrs = listMatch[4] || null;
            const attrsStartInLine = attrs ? line.lastIndexOf(attrs) : -1;
            tokens.push({
                type: 'list',
                indent: listMatch[1].length,
                range: [lineStart, pos - 1],
                text: listMatch[3].trim(),
                attrs,
                attrsRange: attrs && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null
            });
            continue;
        }

        const blockquoteMatch = line.match(/^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (blockquoteMatch) {
            const attrs = blockquoteMatch[2] || null;
            const attrsStartInLine = attrs ? line.lastIndexOf(attrs) : -1;
            tokens.push({
                type: 'blockquote',
                range: [lineStart, pos - 1],
                text: blockquoteMatch[1].trim(),
                attrs,
                attrsRange: attrs && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null
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

// Extract inline carriers: [text] {...}, [text](url) {...}, [text](URL) {...}
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
                // Invalid syntax - [=iri] in links is forbidden, skip this carrier
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

function createBlock(subject, types, predicates, range, attrsRange, valueRange, ctx) {
    const expanded = {
        subject: subject,
        types: types.map(t => expandIRI(t, ctx)),
        predicates: predicates.map(p => ({
            iri: expandIRI(p.iri, ctx),
            form: p.form
        }))
    };

    const blockId = hash([subject, JSON.stringify(expanded)].join('|'));
    return {
        id: blockId,
        range: { start: range[0], end: range[1] },
        attrsRange: attrsRange ? { start: attrsRange[0], end: attrsRange[1] } : null,
        valueRange: valueRange ? { start: valueRange[0], end: valueRange[1] } : null,
        subject,
        types: expanded.types,
        predicates: expanded.predicates,
        context: { ...ctx }
    };
}

function quadIndexKey(subject, predicate, object) {
    const objKey = object.termType === 'Literal'
        ? JSON.stringify({ t: 'Literal', v: object.value, lang: object.language || '', dt: object.datatype?.value || '' })
        : JSON.stringify({ t: object.termType, v: object.value });
    return JSON.stringify([subject.value, predicate.value, objKey]);
}

function emitQuad(quads, quadIndex, blockId, subject, predicate, object, dataFactory, meta = null) {
    if (!subject || !predicate || !object) return;
    const quad = dataFactory.quad(subject, predicate, object);
    quads.push(quad);
    const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
    quadIndex.set(key, meta ? { blockId, ...meta } : { blockId });
}

function createLiteral(value, datatype, language, context, dataFactory) {
    if (datatype) {
        return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
    }
    if (language) {
        return dataFactory.literal(value, language);
    }
    return dataFactory.literal(value);
}

// Core processing: handle subject/type declarations and property emissions
function processAnnotation(carrier, sem, state) {
    // §6.1 Subject declaration
    if (sem.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }

    // Store previous subject and set new subject if declared
    const previousSubject = state.currentSubject;
    let newSubject = null;

    if (sem.subject) {
        newSubject = state.df.namedNode(expandIRI(sem.subject, state.ctx));
        state.currentSubject = newSubject;
    }

    // Determine the subject for emissions
    const S = state.currentSubject;
    if (!S) return; // Need a subject to emit anything

    // Create origin block
    const block = createBlock(
        S.value,
        sem.types,
        sem.predicates,
        carrier.range,
        carrier.attrsRange || null,
        carrier.valueRange || null,
        state.ctx
    );
    state.origin.blocks.set(block.id, block);

    // Extract L (literal) and O (object IRI)
    const L = createLiteral(carrier.text, sem.datatype, sem.language, state.ctx, state.df);
    const O = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;

    // §7 Emit type triples - types apply to the new subject (O or S)
    sem.types.forEach(typeIRI => {
        const typeSubject = O || S;
        const expandedType = expandIRI(typeIRI, state.ctx);
        emitQuad(
            state.quads,
            state.origin.quadIndex,
            block.id,
            typeSubject,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)),
            state.df.namedNode(expandedType),
            state.df,
            { kind: 'type', token: `.${typeIRI}`, expandedType }
        );
    });

    // §8 Emit predicate triples (routing table)
    // Predicates use the previous subject as S, new subject as O when applicable
    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
        const token = `${pred.form}${pred.iri}`;

        if (pred.form === '') {
            // p: S → L (use current subject)
            emitQuad(state.quads, state.origin.quadIndex, block.id, S, P, L, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value });
        } else if (pred.form === '?') {
            // ?p: previousSubject → newSubject (if new subject declared)
            if (newSubject) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, previousSubject, P, newSubject, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value });
            } else if (O) {
                // Fallback: S → O (regular link)
                emitQuad(state.quads, state.origin.quadIndex, block.id, S, P, O, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value });
            }
        } else if (pred.form === '^') {
            // ^p: reverse literal (L → S impossible, emit nothing per spec)
        } else if (pred.form === '^?') {
            // ^?p: newSubject → previousSubject (if new subject declared)
            if (newSubject) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, newSubject, P, previousSubject, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value });
            } else if (O) {
                // Fallback: O → S (regular reverse link)
                emitQuad(state.quads, state.origin.quadIndex, block.id, O, P, S, state.df, { kind: 'pred', token, form: pred.form, expandedPredicate: P.value });
            }
        }
    });
}

// Process list with context annotation (single-level only)
function processListContext(contextSem, listTokens, state, contextSubject = null) {
    if (!contextSubject) contextSubject = state.currentSubject;

    listTokens.forEach(listToken => {
        // Extract carriers from list item text
        const carriers = extractInlineCarriers(listToken.text, listToken.range[0]);

        // Find subject from list item attrs first, then inline carriers
        let itemSubject = null;
        let itemSubjectCarrier = null;

        // First check list item's own attrs for subject declaration
        if (listToken.attrs) {
            const itemSem = parseSemanticBlock(listToken.attrs);
            if (itemSem.subject && itemSem.subject !== 'RESET') {
                itemSubject = state.df.namedNode(expandIRI(itemSem.subject, state.ctx));
                // List items are plain text value carriers, no brackets to remove
                itemSubjectCarrier = { type: 'list', text: listToken.text, attrs: listToken.attrs, range: listToken.range };
            }
        }

        // If no subject in list item attrs, check inline carriers
        if (!itemSubject) {
            for (const carrier of carriers) {
                if (carrier.attrs) {
                    const itemSem = parseSemanticBlock(carrier.attrs);
                    if (itemSem.subject && itemSem.subject !== 'RESET') {
                        itemSubject = state.df.namedNode(expandIRI(itemSem.subject, state.ctx));
                        itemSubjectCarrier = carrier;
                        break;
                    }
                }
            }
        }

        if (!itemSubject) return; // List items must declare subjects

        // Apply context types to item
        contextSem.types.forEach(typeIRI => {
            emitQuad(
                state.quads,
                state.origin.quadIndex,
                'list-context',
                itemSubject,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(expandIRI(typeIRI, state.ctx)),
                state.df
            );
        });

        // Emit context relationships
        contextSem.predicates.forEach(pred => {
            const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));

            if (pred.form === '^' || pred.form === '^?') {
                // Reverse: item → context
                emitQuad(state.quads, state.origin.quadIndex, 'list-context',
                    itemSubject, P, contextSubject, state.df);
            } else {
                // Forward: context → item
                emitQuad(state.quads, state.origin.quadIndex, 'list-context',
                    contextSubject, P, itemSubject, state.df);
            }
        });

        // Process item's own annotations
        const prevSubject = state.currentSubject;
        state.currentSubject = itemSubject;

        // Process the list token's own attributes
        if (listToken.attrs) {
            const itemSem = parseSemanticBlock(listToken.attrs);
            // For list item attributes, the literal is the plain text content
            const carrier = { type: 'list', text: listToken.text, range: listToken.range, attrsRange: listToken.attrsRange || null };
            processAnnotation(carrier, itemSem, state);
        }

        // Process inline carriers' attributes
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

    // Apply prefix declarations
    tokens.filter(t => t.type === 'prefix').forEach(t => state.ctx[t.prefix] = t.iri);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'heading' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'heading', text: token.text, range: token.range, attrsRange: token.attrsRange || null };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'code' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'code', text: token.text, range: token.range, attrsRange: token.attrsRange || null };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'blockquote' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'blockquote', text: token.text, range: token.range, attrsRange: token.attrsRange || null };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'para') {
            // Check for list context (simple single-level only)
            const followingLists = [];
            let j = i + 1;
            while (j < tokens.length && tokens[j].type === 'list') {
                followingLists.push(tokens[j]);
                j++;
            }

            // Check if this paragraph ends with {attrs} and is followed by lists
            const contextMatch = token.text.match(/^(.+?)\s*\{([^}]+)\}$/);
            if (contextMatch && followingLists.length > 0) {
                // This is a list context annotation
                const contextSem = parseSemanticBlock(`{${contextMatch[2]}}`);

                // Simple context subject resolution: use current subject or find heading
                let contextSubject = state.currentSubject;

                // Look backwards for heading subject if no current subject
                if (!contextSubject) {
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
                }

                processListContext(contextSem, followingLists, state, contextSubject);
                i = j - 1;
                continue;
            }

            // Process inline carriers
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

export function shortenIRI(iri, ctx) {
    if (!iri || !iri.startsWith('http')) return iri;

    if (ctx['@vocab'] && iri.startsWith(ctx['@vocab'])) {
        return iri.substring(ctx['@vocab'].length);
    }

    for (const [prefix, namespace] of Object.entries(ctx)) {
        if (prefix !== '@vocab' && iri.startsWith(namespace)) {
            return prefix + ':' + iri.substring(namespace.length);
        }
    }

    return iri;
}

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) return { text, origin };

    let result = text;
    const edits = [];
    const ctx = options.context || {};

    function readAttrsSpan(block) {
        if (!block?.attrsRange) return null;
        const start = block.attrsRange.start;
        const end = block.attrsRange.end;
        if (!(Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start)) return null;
        return { start, end, text: text.substring(start, end) };
    }

    function readValueSpan(block) {
        if (!block?.valueRange) return null;
        const start = block.valueRange.start;
        const end = block.valueRange.end;
        if (!(Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end >= start)) return null;
        return { start, end, text: text.substring(start, end) };
    }

    function normalizeAttrsTokens(attrsText) {
        const cleaned = String(attrsText || '').replace(/^\s*\{|\}\s*$/g, '').trim();
        if (!cleaned) return [];
        return cleaned.split(/\s+/).filter(Boolean);
    }

    function writeAttrsTokens(tokens) {
        const inside = tokens.join(' ').trim();
        return `{${inside}}`;
    }

    function removeOneToken(tokens, matchFn) {
        const i = tokens.findIndex(matchFn);
        if (i === -1) return { tokens, removed: false };
        return { tokens: [...tokens.slice(0, i), ...tokens.slice(i + 1)], removed: true };
    }

    function quadToKeyForOrigin(q) {
        return quadIndexKey(q.subject, q.predicate, q.object);
    }

    function objectSignature(o) {
        if (!o) return '';
        if (o.termType === 'Literal') {
            return JSON.stringify({ t: 'Literal', v: o.value, lang: o.language || '', dt: o.datatype?.value || '' });
        }
        return JSON.stringify({ t: o.termType, v: o.value });
    }

    // Build anchors from deletes so adds can be applied back into the exact same annotation span.
    // Keyed by subject + object identity (carrier value/resource) since predicates may change in updates.
    const anchors = new Map();
    for (const q of diff.delete || []) {
        if (!q?.subject || !q?.object || !q?.predicate) continue;
        const key = JSON.stringify([q.subject.value, objectSignature(q.object)]);
        const entry = origin?.quadIndex?.get(quadToKeyForOrigin(q));
        const blockId = entry?.blockId || entry;
        const block = blockId ? origin?.blocks?.get(blockId) : null;
        if (!block?.attrsRange) continue;
        anchors.set(key, { block, entry });
    }

    // Pair DELETE/ADD literal quads with the same S and P and update carrier value in-place.
    // This is the primary SPARQL-update workflow: change only the value text, keep structure intact.
    const addBySP = new Map();
    for (const q of diff.add || []) {
        if (!q?.subject || !q?.predicate || !q?.object) continue;
        const k = JSON.stringify([q.subject.value, q.predicate.value]);
        const list = addBySP.get(k) || [];
        list.push(q);
        addBySP.set(k, list);
    }

    const consumedAdds = new Set();
    const literalUpdates = [];
    for (const dq of diff.delete || []) {
        if (!dq?.subject || !dq?.predicate || !dq?.object) continue;
        if (dq.object.termType !== 'Literal') continue;
        const k = JSON.stringify([dq.subject.value, dq.predicate.value]);
        const candidates = addBySP.get(k) || [];
        const aq = candidates.find(x => x?.object?.termType === 'Literal' && !consumedAdds.has(x));
        if (!aq) continue;

        const entry = origin?.quadIndex?.get(quadToKeyForOrigin(dq));
        const blockId = entry?.blockId || entry;
        const block = blockId ? origin?.blocks?.get(blockId) : null;
        if (!block) continue;

        literalUpdates.push({ deleteQuad: dq, addQuad: aq, entry, block });
        consumedAdds.add(aq);
    }

    function sanitizeCarrierValue(s) {
        // Carrier value is the raw text inside [...]. Keep this minimal and safe.
        return String(s ?? '').replace(/[\n\r\[\]]/g, ' ').trim();
    }

    function updateAttrsDatatypeLang(tokens, newLit) {
        // Keep subject/predicate/type tokens intact; only normalize @lang / ^^datatype for literal binding.
        const without = tokens.filter(t => !t.startsWith('@') && !t.startsWith('^^'));
        if (newLit?.language) return [...without, `@${newLit.language}`];
        const dt = newLit?.datatype?.value;
        if (dt && dt !== 'http://www.w3.org/2001/XMLSchema#string') {
            return [...without, `^^${shortenIRI(dt, ctx)}`];
        }
        return without;
    }

    // Apply literal updates first (so subsequent token edits use original coordinates).
    for (const u of literalUpdates) {
        const span = readValueSpan(u.block);
        if (span) {
            const newValue = sanitizeCarrierValue(u.addQuad.object.value);
            edits.push({ start: span.start, end: span.end, text: newValue });
        }

        // Also adjust @lang/^^datatype tokens in the same annotation span when present.
        const aSpan = readAttrsSpan(u.block);
        if (aSpan) {
            const tokens = normalizeAttrsTokens(aSpan.text);
            const updated = updateAttrsDatatypeLang(tokens, u.addQuad.object);
            if (updated.join(' ') !== tokens.join(' ')) {
                if (updated.length === 0) {
                    const before = text.substring(Math.max(0, aSpan.start - 1), aSpan.start);
                    const deleteStart = before === ' ' ? aSpan.start - 1 : aSpan.start;
                    edits.push({ start: deleteStart, end: aSpan.end, text: '' });
                } else {
                    edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(updated) });
                }
            }
        }
    }

    if (diff.delete) {
        diff.delete.forEach(quad => {
            if (!quad?.subject || !quad?.predicate || !quad?.object) return;

            // If this delete is part of a literal update pair, skip token deletion.
            // Updating the carrier value keeps the predicate token in-place.
            if (quad.object.termType === 'Literal') {
                const isUpdated = literalUpdates.some(u => u.deleteQuad === quad);
                if (isUpdated) return;
            }

            const key = quadToKeyForOrigin(quad);
            const entry = origin?.quadIndex?.get(key);
            const blockId = entry?.blockId || entry;
            if (!blockId) return;
            const block = origin?.blocks?.get(blockId);
            const span = readAttrsSpan(block);
            if (!span) return; // lossless: never touch carrier text, only edit when attrs span exists

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
                    // Match by expanded predicate + form
                    const m = String(t).match(/^(\^\?|\^|\?|)(.+)$/);
                    if (!m) return false;
                    const form = m[1] || '';
                    const raw = m[2];
                    if (expectedForm != null && form !== expectedForm) return false;
                    return expandIRI(raw, ctx) === expectedPred;
                }));
            }

            if (!removed) return;

            // If the block becomes empty, remove just the annotation (optionally eat one leading space)
            if (updated.length === 0) {
                const before = text.substring(Math.max(0, span.start - 1), span.start);
                const deleteStart = before === ' ' ? span.start - 1 : span.start;
                edits.push({ start: deleteStart, end: span.end, text: '' });
                return;
            }

            const newAttrs = writeAttrsTokens(updated);
            edits.push({ start: span.start, end: span.end, text: newAttrs });
        });
    }

    if (diff.add) {
        diff.add.forEach(quad => {
            if (!quad?.subject || !quad?.predicate || !quad?.object) return;

            // If this add was consumed as a literal update, skip token insertion.
            if (consumedAdds.has(quad)) return;

            // Lossless rule: only add tokens into an existing {...} span; never create/move carriers.
            // Prefer the exact annotation span where a related quad used to live (replacement update).
            const anchorKey = JSON.stringify([quad.subject.value, objectSignature(quad.object)]);
            const anchored = anchors.get(anchorKey) || null;
            let targetBlock = anchored?.block || null;

            // Fallback: pick the first block for this subject that has attrsRange (only if we can infer a safe token form).
            if (!targetBlock) {
                for (const [, block] of origin?.blocks || []) {
                    if (block.subject === quad.subject.value && block.attrsRange) {
                        targetBlock = block;
                        break;
                    }
                }
            }

            if (!targetBlock) return;

            const span = readAttrsSpan(targetBlock);
            if (!span) return;
            const tokens = normalizeAttrsTokens(span.text);

            // Add rdf:type by inserting a .Class token when possible
            if (quad.predicate.value.endsWith('rdf-syntax-ns#type') && quad.object?.termType === 'NamedNode') {
                const typeShort = shortenIRI(quad.object.value, ctx);
                const typeToken = typeShort.includes(':') || !typeShort.startsWith('http') ? `.${typeShort}` : null;
                if (!typeToken) return;
                if (tokens.includes(typeToken)) return;
                const updated = [...tokens, typeToken];
                edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
                return;
            }

            // Add predicate token only (never encode object here; object lives in the value carrier)
            // For stable routing, only add when we have a safe routing form.
            // If anchored from a deleted quad, reuse that quad's routing form.
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

    // Sort edits by start position in reverse order to avoid position shifts
    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    return { text: result, origin };
}

export default { parse, serialize, parseSemanticBlock, shortenIRI };