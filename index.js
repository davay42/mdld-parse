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
                codeBlock = {
                    fence: fence[1],
                    start: lineStart,
                    content: [],
                    lang: fence[2].trim().split(/[\s{]/)[0],
                    attrs: fence[2].match(/\{[^}]+\}/)?.[0]
                };
            } else if (line.startsWith(codeBlock.fence)) {
                tokens.push({
                    type: 'code',
                    range: [codeBlock.start, lineStart],
                    text: codeBlock.content.join('\n'),
                    lang: codeBlock.lang,
                    attrs: codeBlock.attrs
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
            tokens.push({
                type: 'heading',
                depth: headingMatch[1].length,
                range: [lineStart, pos - 1],
                text: headingMatch[2].trim(),
                attrs: headingMatch[3]
            });
            continue;
        }

        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (listMatch) {
            tokens.push({
                type: 'list',
                indent: listMatch[1].length,
                range: [lineStart, pos - 1],
                text: listMatch[3].trim(),
                attrs: listMatch[4]
            });
            continue;
        }

        const blockquoteMatch = line.match(/^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (blockquoteMatch) {
            tokens.push({
                type: 'blockquote',
                range: [lineStart, pos - 1],
                text: blockquoteMatch[1].trim(),
                attrs: blockquoteMatch[2]
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
        const attrsMatch = text.substring(spanEnd).match(/^\s*\{([^}]+)\}/);
        if (attrsMatch) {
            attrs = `{${attrsMatch[1]}}`;
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
            range: [baseOffset + bracketStart, baseOffset + spanEnd]
        });

        pos = spanEnd;
    }

    return carriers;
}

function createBlock(subject, types, predicates, range, ctx) {
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
        subject,
        types: expanded.types,
        predicates: expanded.predicates,
        context: { ...ctx }
    };
}

function emitQuad(quads, quadIndex, blockId, subject, predicate, object, dataFactory) {
    if (!subject || !predicate || !object) return;
    const quad = dataFactory.quad(subject, predicate, object);
    quads.push(quad);
    const key = JSON.stringify([
        quad.subject.value,
        quad.predicate.value,
        quad.object.termType === 'Literal' ? quad.object.value : quad.object.value
    ]);
    quadIndex.set(key, blockId);
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
        state.ctx
    );
    state.origin.blocks.set(block.id, block);

    // Extract L (literal) and O (object IRI)
    const L = createLiteral(carrier.text, sem.datatype, sem.language, state.ctx, state.df);
    const O = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;

    // §7 Emit type triples - types apply to the new subject (O or S)
    sem.types.forEach(typeIRI => {
        const typeSubject = O || S;
        emitQuad(
            state.quads,
            state.origin.quadIndex,
            block.id,
            typeSubject,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)),
            state.df.namedNode(expandIRI(typeIRI, state.ctx)),
            state.df
        );
    });

    // §8 Emit predicate triples (routing table)
    // Predicates use the previous subject as S, new subject as O when applicable
    sem.predicates.forEach(pred => {
        const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));

        if (pred.form === '') {
            // p: S → L (use current subject)
            emitQuad(state.quads, state.origin.quadIndex, block.id, S, P, L, state.df);
        } else if (pred.form === '?') {
            // ?p: previousSubject → newSubject (if new subject declared)
            if (newSubject) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, previousSubject, P, newSubject, state.df);
            } else if (O) {
                // Fallback: S → O (regular link)
                emitQuad(state.quads, state.origin.quadIndex, block.id, S, P, O, state.df);
            }
        } else if (pred.form === '^') {
            // ^p: reverse literal (L → S impossible, emit nothing per spec)
        } else if (pred.form === '^?') {
            // ^?p: newSubject → previousSubject (if new subject declared)
            if (newSubject) {
                emitQuad(state.quads, state.origin.quadIndex, block.id, newSubject, P, previousSubject, state.df);
            } else if (O) {
                // Fallback: O → S (regular reverse link)
                emitQuad(state.quads, state.origin.quadIndex, block.id, O, P, S, state.df);
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
            const carrier = { type: 'list', text: listToken.text, range: listToken.range };
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
            const carrier = { type: 'heading', text: token.text, range: token.range };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'code' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'code', text: token.text, range: token.range };
            processAnnotation(carrier, sem, state);
        } else if (token.type === 'blockquote' && token.attrs) {
            const sem = parseSemanticBlock(token.attrs);
            const carrier = { type: 'blockquote', text: token.text, range: token.range };
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

function shortenIRI(iri, ctx) {
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

    if (diff.delete) {
        diff.delete.forEach(quad => {
            if (!quad || !quad.subject) return;

            // Try to find matching quad by subject and predicate first
            let blockId = null;

            // First try exact match
            const exactKey = JSON.stringify([
                quad.subject.value,
                quad.predicate.value,
                quad.object.termType === 'Literal' ? quad.object.value : quad.object.value
            ]);
            blockId = origin?.quadIndex.get(exactKey);

            // If not found, try to find any quad with same subject and predicate
            if (!blockId) {
                for (const [key, bid] of origin?.quadIndex || []) {
                    const parsedKey = JSON.parse(key);
                    if (parsedKey[0] === quad.subject.value && parsedKey[1] === quad.predicate.value) {
                        blockId = bid;
                        break;
                    }
                }
            }

            if (!blockId) return;

            const block = origin.blocks.get(blockId);
            if (!block) return;

            const start = block.range.start;
            const end = block.range.end;
            const before = text.substring(Math.max(0, start - 1), start);
            const after = text.substring(end, Math.min(end + 1, text.length));
            const deleteStart = before === '\n' ? start - 1 : start;
            const deleteEnd = after === '\n' ? end + 1 : end;

            edits.push({ start: deleteStart, end: deleteEnd, text: '' });
        });
    }

    if (diff.add) {
        diff.add.forEach(quad => {
            let insertPos = result.length;

            // Find the best position to insert - look for existing blocks with same subject
            let bestPos = result.length;
            for (const [, block] of origin?.blocks || []) {
                if (block.subject === quad.subject.value) {
                    bestPos = Math.min(bestPos, block.range.end);
                }
            }
            insertPos = bestPos;

            const pred = shortenIRI(quad.predicate.value, ctx);
            let objText;
            let annotation = pred;

            if (quad.object.termType === 'Literal') {
                objText = quad.object.value;

                // Handle language tags and datatypes
                if (quad.object.language) {
                    annotation += ` @${quad.object.language}`;
                } else if (quad.object.datatype && quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                    const datatype = shortenIRI(quad.object.datatype.value, ctx);
                    annotation += ` ^^${datatype}`;
                }
            } else {
                objText = shortenIRI(quad.object.value, ctx);
            }

            const newLine = `\n[${objText}] {${annotation}}`;
            edits.push({ start: insertPos, end: insertPos, text: newLine });
        });
    }

    // Sort edits by start position in reverse order to avoid position shifts
    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    return { text: result, origin };
}

export default { parse, serialize, parseSemanticBlock };