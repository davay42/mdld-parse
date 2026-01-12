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

function parseAnnotation(raw) {
    const cleaned = raw.replace(/^\{|\}$/g, '').trim();
    if (!cleaned) return { subject: null, entries: [], datatype: null, language: null };

    const entries = [];
    let subject = null;

    const urlMatch = cleaned.match(/=(https?:\/\/[^\s}]+)/);
    const simpleMatch = cleaned.match(/=([^\s.^@]+)/);
    if (urlMatch) subject = urlMatch[1];
    else if (simpleMatch) subject = simpleMatch[1];

    if (subject === '') subject = 'RESET';

    const types = cleaned.match(/\.([^\s.=^@]+)/g);
    if (types) types.forEach(t => entries.push({ kind: 'type', classIRI: t.substring(1) }));

    const props = cleaned.match(/(?:^|\s)([^\s.=^@\{]+)(?=\s|$|@|\^\^)/g);
    if (props) {
        props.forEach(p => {
            const t = p.trim();
            if (t && !t.startsWith('.') && !t.startsWith('=') && !t.startsWith('^')) {
                entries.push({ kind: 'property', predicate: t, direction: 'forward' });
            }
        });
    }

    const reverse = cleaned.match(/\^([^\s.=^@]+)/g);
    if (reverse) reverse.forEach(r => entries.push({ kind: 'property', predicate: r.substring(1), direction: 'reverse' }));

    const datatype = cleaned.match(/\^\^([^\s]+)/);
    const lang = cleaned.match(/@([a-z]{2}(?:-[A-Z]{2})?)/);

    return { subject, entries, datatype: datatype?.[1], language: lang?.[1] };
}

function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let pos = 0;
    let inCode = false;
    let codeFence = null;
    let codeStart = 0;
    let codeLines = [];
    let codeLang = null;
    let codeAttrs = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = pos;
        pos += line.length + 1;

        const fenceMatch = line.match(/^(`{3,})(.*)/);
        if (fenceMatch) {
            if (!inCode) {
                inCode = true;
                codeFence = fenceMatch[1];
                codeStart = lineStart;
                codeLines = [];
                const rest = fenceMatch[2].trim();
                const attrIdx = rest.indexOf('{');
                codeLang = attrIdx >= 0 ? rest.substring(0, attrIdx).trim() : rest;
                codeAttrs = rest.match(/\{[^}]+\}/)?.[0];
                continue;
            } else if (fenceMatch[1] === codeFence) {
                tokens.push({
                    type: 'code',
                    range: [codeStart, lineStart],
                    text: codeLines.join('\n'),
                    lang: codeLang,
                    attrs: codeAttrs
                });
                inCode = false;
                continue;
            }
        }

        if (inCode) {
            codeLines.push(line);
            continue;
        }

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

        const prefixMatch = line.match(/^\[([^\]]+)\]\s*\{:\s*([^}]+)\}/);
        if (prefixMatch) {
            tokens.push({ type: 'prefix', prefix: prefixMatch[1], iri: prefixMatch[2].trim() });
            continue;
        }

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

        if (line.trim()) {
            tokens.push({ type: 'para', range: [lineStart, pos], text: line });
        }
    }

    return tokens;
}

function findMatchingBracket(text, startPos, openChar, closeChar) {
    let depth = 1;
    let pos = startPos + 1;
    while (pos < text.length && depth > 0) {
        if (text[pos] === openChar) depth++;
        if (text[pos] === closeChar) depth--;
        if (depth === 0) return pos;
        pos++;
    }
    return -1;
}

function extractInlineValue(text, baseOffset = 0) {
    const spans = [];
    let pos = 0;

    while (pos < text.length) {
        const openBracket = text.indexOf('[', pos);
        if (openBracket === -1) {
            if (pos < text.length) spans.push({ type: 'text', value: text.substring(pos) });
            break;
        }

        if (openBracket > pos) spans.push({ type: 'text', value: text.substring(pos, openBracket) });

        const closeBracket = findMatchingBracket(text, openBracket, '[', ']');
        if (closeBracket === -1) {
            spans.push({ type: 'text', value: text.substring(openBracket) });
            break;
        }

        const spanText = text.substring(openBracket + 1, closeBracket);
        let spanEnd = closeBracket + 1;
        let url = null;
        let attrs = null;

        if (text[spanEnd] === '(') {
            const closeParen = findMatchingBracket(text, spanEnd, '(', ')');
            if (closeParen !== -1) {
                url = text.substring(spanEnd + 1, closeParen);
                spanEnd = closeParen + 1;
            }
        }

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
            range: [baseOffset + openBracket, baseOffset + spanEnd]
        });

        pos = spanEnd;
    }

    return spans.length ? spans : [{ type: 'text', value: text }];
}

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

function emit(quads, quadIndex, blockId, s, p, o, df) {
    if (!s || !p || !o) return;
    const q = df.quad(s, p, o);
    quads.push(q);
    const key = JSON.stringify([q.subject.value, q.predicate.value, q.object.value]);
    quadIndex.set(key, blockId);
}

function makeObject(value, datatype, language, ctx, df) {
    if (datatype) return df.literal(value, df.namedNode(expandIRI(datatype, ctx)));
    if (language) return df.literal(value, language);
    return df.literal(value);
}

function processHeading(token, state) {
    if (!token.attrs) {
        state.currentSubject = null;
        return;
    }

    const ann = parseAnnotation(token.attrs);
    if (ann.subject === 'RESET') {
        state.currentSubject = null;
        return;
    }
    if (!ann.subject) {
        state.currentSubject = null;
        return;
    }

    const subjIRI = expandIRI(ann.subject, state.ctx);
    state.currentSubject = state.df.namedNode(subjIRI);

    const block = createBlock(subjIRI, ann.entries, token.range, state.ctx);
    state.origin.blocks.set(block.id, block);

    block.entries.forEach(e => {
        if (e.kind === 'type') {
            emit(state.quads, state.origin.quadIndex, block.id, state.currentSubject,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)), state.df.namedNode(e.classIRI), state.df);
        }
    });

    emit(state.quads, state.origin.quadIndex, block.id, state.currentSubject,
        state.df.namedNode(expandIRI('rdfs:label', state.ctx)), state.df.literal(token.text), state.df);
}

function processCode(token, state) {
    if (!token.attrs) return;

    const ann = parseAnnotation(token.attrs);
    const codeSubj = ann.subject ? state.df.namedNode(expandIRI(ann.subject, state.ctx)) : state.df.blankNode(hash(`code:${token.text}`));

    const block = createBlock(codeSubj.value, ann.entries, token.range, state.ctx);
    state.origin.blocks.set(block.id, block);

    block.entries.forEach(e => {
        if (e.kind === 'type') {
            emit(state.quads, state.origin.quadIndex, block.id, codeSubj,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)), state.df.namedNode(e.classIRI), state.df);
        }
        if (e.kind === 'property' && e.predicate) {
            const pred = state.df.namedNode(e.predicate);
            const obj = makeObject(token.text, ann.datatype, ann.language, state.ctx, state.df);
            emit(state.quads, state.origin.quadIndex, block.id, codeSubj, pred, obj, state.df);
        }
    });

    if (state.currentSubject) {
        emit(state.quads, state.origin.quadIndex, block.id, state.currentSubject,
            state.df.namedNode(expandIRI('hasPart', state.ctx)), codeSubj, state.df);
    }
}

function processInline(span, state) {
    if (!span.attrs || !state.currentSubject) return;

    const ann = parseAnnotation(span.attrs);
    let targetSubj = null;

    if (span.url) targetSubj = state.df.namedNode(expandIRI(span.url, state.ctx));
    else if (ann.subject) targetSubj = state.df.namedNode(expandIRI(ann.subject, state.ctx));

    const block = createBlock(targetSubj?.value || state.currentSubject.value, ann.entries, span.range, state.ctx);
    state.origin.blocks.set(block.id, block);

    ann.entries.forEach(e => {
        if (e.kind === 'type' && targetSubj) {
            emit(state.quads, state.origin.quadIndex, block.id, targetSubj,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)), state.df.namedNode(expandIRI(e.classIRI, state.ctx)), state.df);
        }

        if (e.kind === 'property' && e.predicate) {
            const pred = state.df.namedNode(expandIRI(e.predicate, state.ctx));

            if (targetSubj) {
                if (e.direction === 'reverse') {
                    emit(state.quads, state.origin.quadIndex, block.id, targetSubj, pred, state.currentSubject, state.df);
                } else {
                    emit(state.quads, state.origin.quadIndex, block.id, state.currentSubject, pred, targetSubj, state.df);
                }
            } else {
                const obj = makeObject(span.text, ann.datatype, ann.language, state.ctx, state.df);
                if (e.direction === 'reverse') {
                    emit(state.quads, state.origin.quadIndex, block.id, obj.termType === 'NamedNode' ? obj : state.df.blankNode(), pred, state.currentSubject, state.df);
                } else {
                    emit(state.quads, state.origin.quadIndex, block.id, state.currentSubject, pred, obj, state.df);
                }
            }
        }
    });
}

function processList(token, state, nextToken) {
    const isListHeader = nextToken?.type === 'list';
    if (!token.attrs || !isListHeader) return false;

    const headerAnn = parseAnnotation(token.attrs);
    state.listContext = { predicate: null, types: [], reverse: false };

    headerAnn.entries.forEach(e => {
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
    if (!state.listContext || !token.attrs) return;

    const ann = parseAnnotation(token.attrs);
    if (!ann.subject) return;

    const itemSubj = state.df.namedNode(expandIRI(ann.subject, state.ctx));

    const block = createBlock(itemSubj.value, ann.entries, token.range, state.ctx);
    state.origin.blocks.set(block.id, block);

    state.listContext.types.forEach(typeIRI => {
        emit(state.quads, state.origin.quadIndex, block.id, itemSubj,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)), state.df.namedNode(typeIRI), state.df);
    });

    ann.entries.forEach(e => {
        if (e.kind === 'property' && e.predicate) {
            const pred = state.df.namedNode(expandIRI(e.predicate, state.ctx));
            const obj = makeObject(token.text, ann.datatype, ann.language, state.ctx, state.df);
            emit(state.quads, state.origin.quadIndex, block.id, itemSubj, pred, obj, state.df);
        }
    });

    if (state.listContext.predicate && state.currentSubject) {
        const pred = state.df.namedNode(state.listContext.predicate);
        if (state.listContext.reverse) {
            emit(state.quads, state.origin.quadIndex, block.id, itemSubj, pred, state.currentSubject, state.df);
        } else {
            emit(state.quads, state.origin.quadIndex, block.id, state.currentSubject, pred, itemSubj, state.df);
        }
    }
}

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

        if (token.type === 'heading') {
            processHeading(token, state);
            continue;
        }

        if (token.type === 'code') {
            processCode(token, state);
            continue;
        }

        if (token.type === 'para' && processList(token, state, nextToken)) {
            continue;
        }

        if (token.type === 'list' && state.listContext) {
            processListItem(token, state);
            continue;
        }

        if ((token.type === 'para' || token.type === 'blockquote') && state.currentSubject) {
            const spans = extractInlineValue(token.text, token.range[0]);
            spans.filter(s => s.type === 'span' || s.type === 'link').forEach(span => {
                processInline(span, state);
            });
        }
    }

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) return { text, origin };

    let result = text;
    const edits = [];

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

            const pred = quad.predicate.value.split(/[/#]/).pop();
            const objText = quad.object.termType === 'Literal' ? quad.object.value : quad.object.value;
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

export default { parse, serialize };