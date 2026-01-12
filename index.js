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

// Annotation parsing - explicit string operations
function parseAnnotation(raw) {
    try {
        const cleaned = raw.replace(/^\{|\}$/g, '').trim();
        if (!cleaned) return { subject: null, entries: [], datatype: null, language: null };

        // Validate quotes
        let quoteCount = 0;
        for (let i = 0; i < cleaned.length; i++) {
            if (cleaned[i] === '"') quoteCount++;
        }
        if (quoteCount % 2 !== 0) {
            console.warn(`Unbalanced quotes in annotation: ${raw}`);
            return { subject: null, entries: [], datatype: null, language: null };
        }

        const result = { subject: null, entries: [], datatype: null, language: null };
        const parts = cleaned.split(/\s+/).filter(p => p);

        for (const part of parts) {
            if (part === '=') {
                result.subject = 'RESET';
            } else if (part.startsWith('=')) {
                result.subject = part.substring(1);
            } else if (part.startsWith('@')) {
                result.language = part.substring(1);
            } else if (part.startsWith('^^')) {
                result.datatype = part.substring(2);
            } else if (part.startsWith('^')) {
                result.entries.push({ kind: 'property', predicate: part.substring(1), direction: 'reverse' });
            } else if (part.startsWith('.')) {
                result.entries.push({ kind: 'type', classIRI: part.substring(1) });
            } else {
                result.entries.push({ kind: 'property', predicate: part, direction: 'forward' });
            }
        }

        if (result.entries.length === 0 && !result.subject) {
            console.warn(`No valid entries found in annotation: ${raw}`);
            return { subject: null, entries: [], datatype: null, language: null };
        }

        return result;
    } catch (error) {
        console.error(`Error parsing annotation ${raw}:`, error);
        return { subject: null, entries: [], datatype: null, language: null };
    }
}

// Token scanning - consolidated helpers
function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let pos = 0;
    let codeBlock = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = pos;
        pos += line.length + 1;

        // Code blocks
        if (line.startsWith('```')) {
            if (!codeBlock) {
                const fence = line.match(/^(`{3,})(.*)/);
                codeBlock = {
                    fence: fence[1],
                    start: lineStart,
                    content: [],
                    lang: fence[2].trim().split('{')[0].trim(),
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

        // Prefix declarations
        const prefixMatch = line.match(/^\[([^\]]+)\]\s*\{:\s*([^}]+)\}/);
        if (prefixMatch) {
            tokens.push({ type: 'prefix', prefix: prefixMatch[1], iri: prefixMatch[2].trim() });
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (headingMatch) {
            tokens.push({
                type: 'heading',
                depth: headingMatch[1].length,
                range: [lineStart, pos],
                text: headingMatch[2].trim(),
                attrs: headingMatch[3]
            });
            continue;
        }

        // Lists
        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (listMatch) {
            tokens.push({
                type: 'list',
                indent: listMatch[1].length,
                range: [lineStart, pos],
                text: listMatch[3].trim(),
                attrs: listMatch[4]
            });
            continue;
        }

        // Blockquotes
        const blockquoteMatch = line.match(/^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (blockquoteMatch) {
            tokens.push({
                type: 'blockquote',
                range: [lineStart, pos],
                text: blockquoteMatch[1].trim(),
                attrs: blockquoteMatch[2]
            });
            continue;
        }

        // Paragraphs
        if (line.trim()) {
            const paraMatch = line.match(/^(.+?)(?:\s*(\{[^}]+\}))?$/);
            if (paraMatch) {
                tokens.push({
                    type: 'para',
                    range: [lineStart, pos],
                    text: paraMatch[1].trim(),
                    attrs: paraMatch[2] || null
                });
            }
        }
    }

    return tokens;
}

// Inline value extraction - simplified
function extractInlineValue(text, baseOffset = 0) {
    const spans = [];
    let pos = 0;

    while (pos < text.length) {
        const bracketStart = text.indexOf('[', pos);
        if (bracketStart === -1) {
            if (pos < text.length) spans.push({ type: 'text', text: text.substring(pos) });
            break;
        }

        if (bracketStart > pos) spans.push({ type: 'text', text: text.substring(pos, bracketStart) });

        const bracketEnd = text.indexOf(']', bracketStart);
        if (bracketEnd === -1) {
            spans.push({ type: 'text', text: text.substring(bracketStart) });
            break;
        }

        const spanText = text.substring(bracketStart + 1, bracketEnd);
        let spanEnd = bracketEnd + 1;
        let url = null;
        let attrs = null;

        // Parse link destination
        if (text[spanEnd] === '(') {
            const parenEnd = text.indexOf(')', spanEnd);
            if (parenEnd !== -1) {
                url = text.substring(spanEnd + 1, parenEnd);
                spanEnd = parenEnd + 1;
            }
        }

        // Parse attributes
        const attrsMatch = text.substring(spanEnd).match(/^\s*\{([^}]+)\}/);
        if (attrsMatch) {
            attrs = `{${attrsMatch[1]}}`;
            spanEnd += attrsMatch[0].length;
        }

        spans.push({
            type: url ? 'link' : 'span',
            text: spanText,
            url: url,
            attrs: attrs,
            range: [baseOffset + bracketStart, baseOffset + spanEnd]
        });

        pos = spanEnd;
    }

    return spans.length ? spans : [{ type: 'text', text: text }];
}

// Core processing functions - consolidated
function createBlock(subject, entries, range, ctx) {
    const expanded = entries.map(e => ({
        ...e,
        predicate: e.predicate ? expandIRI(e.predicate, ctx) : null,
        classIRI: e.classIRI ? expandIRI(e.classIRI, ctx) : null
    }));

    const blockId = hash([subject, ...expanded.map(e => JSON.stringify(e))].join('|'));
    return {
        id: blockId,
        range: { start: range[0], end: range[1] },
        subject,
        entries: expanded,
        context: { ...ctx }
    };
}

function emitQuad(quads, quadIndex, blockId, subject, predicate, object, dataFactory) {
    if (!subject || !predicate || !object) return;
    const quad = dataFactory.quad(subject, predicate, object);
    quads.push(quad);
    quadIndex.set(JSON.stringify([quad.subject.value, quad.predicate.value, quad.object.value]), blockId);
}

function createLiteralValue(value, datatype, language, context, dataFactory) {
    if (datatype) return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
    if (language) return dataFactory.literal(value, language);
    return dataFactory.literal(value);
}

function processAnnotation(token, state, textContent = null) {
    if (!token.attrs) return;

    const ann = parseAnnotation(token.attrs);
    const originalSubject = state.currentSubject;

    // Handle subject declaration
    if (ann.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }
    if (ann.subject) {
        state.currentSubject = state.df.namedNode(expandIRI(ann.subject, state.ctx));
    }

    if (!originalSubject && !ann.subject) return;

    const targetSubject = ann.subject ?
        state.df.namedNode(expandIRI(ann.subject, state.ctx)) :
        originalSubject;

    const block = createBlock(targetSubject.value, ann.entries, token.range, state.ctx);
    state.origin.blocks.set(block.id, block);

    // Handle list context types
    if (token.type === 'list' && state.listContext?.types.length > 0) {
        state.listContext.types.forEach(typeIRI => {
            emitQuad(state.quads, state.origin.quadIndex, block.id,
                targetSubject, state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(typeIRI), state.df);
        });
    }

    // Emit triples
    ann.entries.forEach(e => {
        if (e.kind === 'type') {
            const typeSubject = token.url ?
                state.df.namedNode(expandIRI(token.url, state.ctx)) : targetSubject;
            emitQuad(state.quads, state.origin.quadIndex, block.id,
                typeSubject, state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(expandIRI(e.classIRI, state.ctx)), state.df);
        } else if (e.kind === 'property' && e.predicate) {
            const predicate = state.df.namedNode(expandIRI(e.predicate, state.ctx));
            let object;

            if (token.url) {
                object = state.df.namedNode(expandIRI(token.url, state.ctx));
            } else if (ann.subject && !token.url) {
                if (e.direction === 'reverse') {
                    object = targetSubject;
                } else {
                    object = token.type === 'code' ?
                        createLiteralValue(textContent || token.text || '', ann.datatype, ann.language, state.ctx, state.df) :
                        targetSubject;
                }
            } else {
                object = createLiteralValue(textContent || token.text || '', ann.datatype, ann.language, state.ctx, state.df);
            }

            const subject = e.direction === 'reverse' ? object :
                (ann.subject && !token.url && token.type !== 'code') ? originalSubject : targetSubject;
            const objectRef = e.direction === 'reverse' ? originalSubject : object;

            emitQuad(state.quads, state.origin.quadIndex, block.id, subject, predicate, objectRef, state.df);
        }
    });
}

// List processing - simplified
function setupListContext(token, state, nextToken) {
    if (!token.attrs || nextToken?.type !== 'list') return false;

    const ann = parseAnnotation(token.attrs);
    state.listContext = { predicate: null, types: [], reverse: false };

    ann.entries.forEach(e => {
        if (e.kind === 'property') {
            state.listContext.predicate = expandIRI(e.predicate, state.ctx);
            state.listContext.reverse = e.direction === 'reverse';
        }
        if (e.kind === 'type') {
            state.listContext.types.push(expandIRI(e.classIRI, state.ctx));
        }
    });
    return true;
}

function processListItem(token, state) {
    const ann = parseAnnotation(token.attrs);
    const originalSubject = state.currentSubject;

    if (ann.subject) {
        state.currentSubject = state.df.namedNode(expandIRI(ann.subject, state.ctx));
    }

    // Process item properties
    ann.entries.forEach(e => {
        if (e.kind === 'type') {
            emitQuad(state.quads, state.origin.quadIndex, 'list-item',
                state.currentSubject, state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(expandIRI(e.classIRI, state.ctx)), state.df);
        } else if (e.kind === 'property' && e.predicate) {
            const predicate = state.df.namedNode(expandIRI(e.predicate, state.ctx));
            const object = createLiteralValue(token.text, ann.datatype, ann.language, state.ctx, state.df);
            emitQuad(state.quads, state.origin.quadIndex, 'list-item',
                state.currentSubject, predicate, object, state.df);
        }
    });

    // Process list context relationship
    if (state.listContext?.predicate && originalSubject) {
        const predicate = state.df.namedNode(expandIRI(state.listContext.predicate, state.ctx));
        if (state.listContext.reverse) {
            emitQuad(state.quads, state.origin.quadIndex, 'list-context',
                state.currentSubject, predicate, originalSubject, state.df);
        } else {
            emitQuad(state.quads, state.origin.quadIndex, 'list-context',
                originalSubject, predicate, state.currentSubject, state.df);
        }
    }

    // Apply list context types
    if (state.listContext?.types.length > 0 && ann.subject) {
        state.listContext.types.forEach(type => {
            emitQuad(state.quads, state.origin.quadIndex, 'list-item',
                state.currentSubject, state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(expandIRI(type, state.ctx)), state.df);
        });
    }

    state.currentSubject = originalSubject;
}

// Main parsing function
export function parse(text, options = {}) {
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        quads: [],
        origin: { blocks: new Map(), quadIndex: new Map() },
        currentSubject: null,
        listContext: null
    };

    const tokens = scanTokens(text);
    tokens.filter(t => t.type === 'prefix').forEach(t => state.ctx[t.prefix] = t.iri);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextToken = tokens[i + 1];

        switch (token.type) {
            case 'heading':
                processAnnotation(token, state, token.text);
                break;
            case 'code':
                processAnnotation(token, state, token.text);
                break;
            case 'para':
                if (setupListContext(token, state, nextToken)) break;
                // Regular paragraphs are NOT value carriers per spec
                // Only process spans and links within paragraphs
                if (state.currentSubject) {
                    const spans = extractInlineValue(token.text, token.range[0]);

                    // Process annotated spans (value carriers)
                    spans.filter(s => s.type === 'span' && s.attrs)
                        .forEach(span => processAnnotation(span, state, span.text));

                    // Process spans where paragraph has annotation
                    if (token.attrs) {
                        spans.filter(s => s.type === 'span')
                            .forEach(span => {
                                // Attach paragraph's annotation to the span
                                const spanWithAttrs = { ...span, attrs: token.attrs };
                                processAnnotation(spanWithAttrs, state, span.text);
                            });
                    }

                    // Process links (value carriers)
                    spans.filter(s => s.type === 'link')
                        .forEach(link => processAnnotation(link, state, link.text));
                }
                break;
            case 'list':
                if (state.listContext) processListItem(token, state);
                break;
            case 'blockquote':
                if (state.currentSubject) processAnnotation(token, state, token.text);
                break;
        }
    }

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}

function shortenIRI(iri, ctx) {
    if (!iri || !iri.startsWith('http')) return iri;

    // Check @vocab first
    if (ctx['@vocab'] && iri.startsWith(ctx['@vocab'])) {
        return iri.substring(ctx['@vocab'].length);
    }

    // Check prefixes
    for (const [prefix, namespace] of Object.entries(ctx)) {
        if (prefix !== '@vocab' && iri.startsWith(namespace)) {
            return prefix + ':' + iri.substring(namespace.length);
        }
    }

    // No prefix found, return full IRI
    return iri;
}

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) return { text, origin };

    let result = text;
    const edits = [];
    const ctx = options.context || {};

    if (diff.delete) {
        diff.delete.forEach(quad => {
            const key = JSON.stringify([quad.subject.value, quad.predicate.value, quad.object.value]);
            const blockId = origin?.quadIndex.get(key);
            if (!blockId) return;

            const block = origin.blocks.get(blockId);
            if (!block) return;

            const start = block.range.start;
            const end = block.range.end;
            const before = text.substring(Math.max(0, start - 1), start);
            const after = text.substring(end, end + 1);
            const deleteStart = before === '\n' ? start - 1 : start;
            const deleteEnd = after === '\n' ? end + 1 : end;

            edits.push({ start: deleteStart, end: deleteEnd, text: '' });
        });
    }

    if (diff.add) {
        diff.add.forEach(quad => {
            let insertPos = result.length;

            for (const [, block] of origin?.blocks || []) {
                if (block.subject === quad.subject.value) {
                    insertPos = block.range.end;
                    break;
                }
            }

            const pred = shortenIRI(quad.predicate.value, ctx);
            let objText;

            if (quad.object.termType === 'Literal') {
                objText = quad.object.value;
            } else {
                objText = shortenIRI(quad.object.value, ctx);
            }

            const newLine = `\n[${objText}] {${pred}}`;

            edits.push({ start: insertPos, end: insertPos, text: newLine });
        });
    }

    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    return { text: result, origin };
}

export default { parse, serialize, parseAnnotation };