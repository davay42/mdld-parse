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

function canonicalizeBlock(subject, entries) {
    const parts = [`subject=${subject || ''}`];
    entries.sort((a, b) => {
        const aKey = `${a.kind}:${a.predicate || ''}:${JSON.stringify(a.value || '')}`;
        const bKey = `${b.kind}:${b.predicate || ''}:${JSON.stringify(b.value || '')}`;
        return aKey.localeCompare(bKey);
    }).forEach(e => {
        if (e.kind === 'type') parts.push(`type=${e.classIRI}`);
        if (e.kind === 'property') parts.push(`prop=${e.predicate}|${JSON.stringify(e.value)}|${e.direction}`);
    });
    return hash(parts.join('\n'));
}

function expandIRI(term, context) {
    if (!term) return null;
    const t = term.trim();
    if (t.match(/^https?:/)) return t;
    if (t.includes(':')) {
        const [prefix, ref] = t.split(':', 2);
        return context[prefix] ? context[prefix] + ref : t;
    }
    return (context['@vocab'] || '') + t;
}

function parseAnnotation(raw) {
    const entries = [];
    const cleaned = raw.replace(/^\{|\}$/g, '').trim();

    let subject = null;
    // Match full URLs first, then fallback to simple identifiers
    const urlMatch = cleaned.match(/=(https?:\/\/[^\s}]+)/);
    const simpleMatch = cleaned.match(/=([^\s.^@]+)/);

    if (urlMatch) {
        subject = urlMatch[1];
    } else if (simpleMatch) {
        subject = simpleMatch[1];
    }

    const types = cleaned.match(/\.([^\s.=^@]+)/g);
    if (types) types.forEach(t => entries.push({ kind: 'type', classIRI: t.substring(1) }));

    const props = cleaned.match(/(?:^|\s)([^\s.=^@]+)(?=\s|$)/g);
    if (props) {
        props.forEach(p => {
            const trimmed = p.trim();
            if (trimmed && !trimmed.startsWith('.') && !trimmed.startsWith('=')) {
                entries.push({ kind: 'property', predicate: trimmed, direction: 'forward', value: null });
            }
        });
    }

    const reverse = cleaned.match(/\^([^\s.=^@]+)/g);
    if (reverse) reverse.forEach(r => entries.push({ kind: 'property', predicate: r.substring(1), direction: 'reverse', value: null }));

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
                const codeEnd = lineStart;
                tokens.push({ type: 'code', range: [codeStart, codeEnd], text: codeLines.join('\n'), lang: codeLang, attrs: codeAttrs });
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
            const text = headingMatch[2].trim();
            const attrs = headingMatch[3];
            tokens.push({ type: 'heading', depth: headingMatch[1].length, range: [lineStart, pos], text, attrs });
            continue;
        }

        const prefixMatch = line.match(/^\[([^\]]+)\]\s*\{:\s*([^}]+)\}/);
        if (prefixMatch) {
            tokens.push({ type: 'prefix', prefix: prefixMatch[1], iri: prefixMatch[2].trim(), range: [lineStart, pos] });
            continue;
        }

        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
        if (listMatch) {
            const text = listMatch[3].trim();
            const attrs = listMatch[4];
            tokens.push({ type: 'list', indent: listMatch[1].length, range: [lineStart, pos], text, attrs });
            continue;
        }

        if (line.trim()) {
            tokens.push({ type: 'para', range: [lineStart, pos], text: line });
        }
    }

    return tokens;
}

function parseInlineSpans(text, baseOffset = 0) {
    const spans = [];
    let pos = 0;

    while (pos < text.length) {
        const openBracket = text.indexOf('[', pos);
        if (openBracket === -1) {
            if (pos < text.length) {
                spans.push({ type: 'text', value: text.substring(pos) });
            }
            break;
        }

        if (openBracket > pos) {
            spans.push({ type: 'text', value: text.substring(pos, openBracket) });
        }

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
            type: 'span',
            text: spanText,
            url: url,
            attrs: attrs,
            range: [baseOffset + openBracket, baseOffset + spanEnd]
        });

        pos = spanEnd;
    }

    return spans.length ? spans : [{ type: 'text', value: text }];
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

function emitQuad(quads, quadIndex, blockId, subject, predicate, object, df) {
    if (!subject || !predicate || !object) return;
    const q = df.quad(subject, predicate, object);
    quads.push(q);
    const key = JSON.stringify([q.subject.value, q.predicate.value, q.object.value]);
    quadIndex.set(key, blockId);
}

function processHeadingBlock(token, ctx, df, quads, origin, currentSubject) {
    if (!token.attrs) return null;

    const ann = parseAnnotation(token.attrs);
    if (!ann.subject) return null;

    const subjIRI = expandIRI(ann.subject, ctx);
    const newSubject = df.namedNode(subjIRI);

    const entries = ann.entries.map(e => ({
        ...e,
        predicate: e.predicate ? expandIRI(e.predicate, ctx) : null,
        classIRI: e.classIRI ? expandIRI(e.classIRI, ctx) : null
    }));

    const blockId = canonicalizeBlock(subjIRI, entries);
    origin.blocks.set(blockId, {
        id: blockId,
        range: { start: token.range[0], end: token.range[1] },
        subject: subjIRI,
        entries,
        context: { ...ctx }
    });

    entries.forEach(e => {
        if (e.kind === 'type') {
            emitQuad(quads, origin.quadIndex, blockId, newSubject,
                df.namedNode(expandIRI('rdf:type', ctx)), df.namedNode(e.classIRI), df);
        }
    });

    emitQuad(quads, origin.quadIndex, blockId, newSubject,
        df.namedNode(expandIRI('rdfs:label', ctx)), df.literal(token.text), df);

    return newSubject;
}

function processCodeBlock(token, ctx, df, quads, origin, currentSubject) {
    if (!token.attrs) return;

    const ann = parseAnnotation(token.attrs);
    const codeSubj = ann.subject ? df.namedNode(expandIRI(ann.subject, ctx)) : df.blankNode(hash(`code:${token.text}`));

    const entries = ann.entries.map(e => ({
        ...e,
        predicate: e.predicate ? expandIRI(e.predicate, ctx) : null,
        classIRI: e.classIRI ? expandIRI(e.classIRI, ctx) : null
    }));

    const blockId = canonicalizeBlock(codeSubj.value, entries);
    origin.blocks.set(blockId, {
        id: blockId,
        range: { start: token.range[0], end: token.range[1] },
        subject: codeSubj.value,
        entries,
        context: { ...ctx }
    });

    entries.forEach(e => {
        if (e.kind === 'type') {
            emitQuad(quads, origin.quadIndex, blockId, codeSubj,
                df.namedNode(expandIRI('rdf:type', ctx)), df.namedNode(e.classIRI), df);
        }
        if (e.kind === 'property' && e.predicate) {
            const pred = df.namedNode(e.predicate);
            let obj = df.literal(token.lang || token.text);
            if (e.predicate.includes('programmingLanguage')) obj = df.literal(token.lang);
            if (e.predicate.includes('text')) obj = df.literal(token.text);
            emitQuad(quads, origin.quadIndex, blockId, codeSubj, pred, obj, df);
        }
    });

    if (currentSubject) {
        emitQuad(quads, origin.quadIndex, blockId, currentSubject,
            df.namedNode(expandIRI('hasPart', ctx)), codeSubj, df);
    }
}

function processInlineSpan(span, ctx, df, quads, origin, currentSubject) {
    if (!span.attrs) return;

    const ann = parseAnnotation(span.attrs);

    // Determine the target subject (the thing being described)
    let targetSubj = null;
    if (span.url) {
        targetSubj = df.namedNode(expandIRI(span.url, ctx));
    } else if (ann.subject) {
        targetSubj = df.namedNode(expandIRI(ann.subject, ctx));
    }

    // Create a block ID for this inline span
    const entries = ann.entries.map(e => ({
        ...e,
        predicate: e.predicate ? expandIRI(e.predicate, ctx) : null,
        classIRI: e.classIRI ? expandIRI(e.classIRI, ctx) : null
    }));

    const blockId = canonicalizeBlock(targetSubj?.value || currentSubject?.value, entries);
    if (span.range) {
        origin.blocks.set(blockId, {
            id: blockId,
            range: { start: span.range[0], end: span.range[1] },
            subject: targetSubj?.value || currentSubject?.value,
            entries,
            context: { ...ctx }
        });
    }

    ann.entries.forEach(e => {
        if (e.kind === 'type' && targetSubj) {
            // Types go on the target subject
            const pred = df.namedNode(expandIRI('rdf:type', ctx));
            const obj = df.namedNode(expandIRI(e.classIRI, ctx));
            emitQuad(quads, origin.quadIndex, blockId, targetSubj, pred, obj, df);
        }

        if (e.kind === 'property' && e.predicate) {
            const pred = df.namedNode(expandIRI(e.predicate, ctx));

            // If there's a URL/target, the property links FROM currentSubject TO target
            if (targetSubj) {
                emitQuad(quads, origin.quadIndex, blockId, currentSubject, pred, targetSubj, df);
            } else {
                // Otherwise it's a literal property on currentSubject
                const obj = ann.datatype
                    ? df.literal(span.text, df.namedNode(expandIRI(ann.datatype, ctx)))
                    : ann.language
                        ? df.literal(span.text, ann.language)
                        : df.literal(span.text);

                const q = e.direction === 'reverse'
                    ? df.quad(obj.termType === 'NamedNode' ? obj : df.blankNode(), pred, currentSubject)
                    : df.quad(currentSubject, pred, obj);

                emitQuad(quads, origin.quadIndex, blockId, q.subject, q.predicate, q.object, df);
            }
        }
    });
}

export function parse(text, options = {}) {
    const ctx = { ...DEFAULT_CONTEXT, ...(options.context || {}) };
    const df = options.dataFactory || DataFactory;
    const quads = [];
    const origin = { blocks: new Map(), quadIndex: new Map() };

    const tokens = scanTokens(text);

    tokens.filter(t => t.type === 'prefix').forEach(t => {
        ctx[t.prefix] = t.iri;
    });

    let currentSubject = null;

    for (const token of tokens) {
        if (token.type === 'heading') {
            currentSubject = processHeadingBlock(token, ctx, df, quads, origin, currentSubject);
            continue;
        }

        if (token.type === 'code') {
            processCodeBlock(token, ctx, df, quads, origin, currentSubject);
            continue;
        }

        if ((token.type === 'para' || token.type === 'list') && currentSubject) {
            const spans = parseInlineSpans(token.text, token.range[0]);
            spans.filter(s => s.type === 'span').forEach(span => {
                processInlineSpan(span, ctx, df, quads, origin, currentSubject);
            });
        }
    }

    return { quads, origin, context: ctx };
}

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) return { text, origin };

    const ctx = origin?.context || { ...DEFAULT_CONTEXT };
    let result = text;
    const edits = [];

    if (diff.delete) {
        for (const quad of diff.delete) {
            const key = JSON.stringify([quad.subject.value, quad.predicate.value, quad.object.value]);
            const blockId = origin?.quadIndex.get(key);
            if (blockId) {
                const block = origin.blocks.get(blockId);
                if (block) {
                    const start = block.range.start;
                    const end = block.range.end;
                    const before = text.substring(Math.max(0, start - 1), start);
                    const after = text.substring(end, end + 1);

                    const deleteStart = before === '\n' ? start - 1 : start;
                    const deleteEnd = after === '\n' ? end + 1 : end;

                    edits.push({ start: deleteStart, end: deleteEnd, text: '' });
                }
            }
        }
    }

    if (diff.add) {
        for (const quad of diff.add) {
            const subjVal = quad.subject.value;
            let insertPos = result.length;

            for (const [, block] of origin?.blocks || []) {
                if (block.subject === subjVal) {
                    insertPos = block.range.end;
                    break;
                }
            }

            const pred = quad.predicate.value.split(/[/#]/).pop();
            const objText = quad.object.termType === 'Literal' ? quad.object.value : quad.object.value;
            const newLine = `\n[${objText}] {${pred}}`;

            edits.push({ start: insertPos, end: insertPos, text: newLine });
        }
    }

    edits.sort((a, b) => b.start - a.start);
    for (const edit of edits) {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    }

    return { text: result, origin };
}

export default { parse, serialize };