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
    const subjectMatch = cleaned.match(/=([^\s.^@]+)/);
    if (subjectMatch) subject = subjectMatch[1];

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

function parseInlineSpans(text) {
    const spans = [];
    const regex = /\[([^\]]+)\](?:\(([^)]+)\))?(?:\s*\{([^}]+)\})?/g;
    let last = 0;
    let m;

    while ((m = regex.exec(text)) !== null) {
        if (m.index > last) spans.push({ type: 'text', value: text.substring(last, m.index) });
        spans.push({ type: 'span', text: m[1], url: m[2] || null, attrs: m[3] ? `{${m[3]}}` : null, range: [m.index, m.index + m[0].length] });
        last = m.index + m[0].length;
    }

    if (last < text.length) spans.push({ type: 'text', value: text.substring(last) });
    return spans.length ? spans : [{ type: 'text', value: text }];
}

export function parse(text, options = {}) {
    const ctx = { ...DEFAULT_CONTEXT, ...(options.context || {}) };
    const df = options.dataFactory || DataFactory;
    const quads = [];
    const origin = { blocks: new Map(), quadIndex: new Map() };

    const tokens = scanTokens(text);

    for (const token of tokens) {
        if (token.type === 'prefix') {
            ctx[token.prefix] = token.iri;
            continue;
        }
    }

    let currentSubject = null;
    let rootSubject = null;

    for (const token of tokens) {
        if (token.type === 'heading' && token.attrs) {
            const ann = parseAnnotation(token.attrs);
            if (ann.subject) {
                const subjIRI = expandIRI(ann.subject, ctx);
                currentSubject = df.namedNode(subjIRI);
                if (!rootSubject) rootSubject = currentSubject;

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
                        const q = df.quad(currentSubject, df.namedNode(expandIRI('rdf:type', ctx)), df.namedNode(e.classIRI));
                        quads.push(q);
                        origin.quadIndex.set(JSON.stringify([q.subject.value, q.predicate.value, q.object.value]), blockId);
                    }
                });

                const labelQ = df.quad(currentSubject, df.namedNode(expandIRI('rdfs:label', ctx)), df.literal(token.text));
                quads.push(labelQ);
                origin.quadIndex.set(JSON.stringify([labelQ.subject.value, labelQ.predicate.value, labelQ.object.value]), blockId);
            }
            continue;
        }

        if (token.type === 'code' && token.attrs) {
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
                    const q = df.quad(codeSubj, df.namedNode(expandIRI('rdf:type', ctx)), df.namedNode(e.classIRI));
                    quads.push(q);
                    origin.quadIndex.set(JSON.stringify([q.subject.value, q.predicate.value, q.object.value]), blockId);
                }
                if (e.kind === 'property' && e.predicate) {
                    const pred = df.namedNode(e.predicate);
                    let obj = df.literal(token.lang || token.text);
                    if (e.predicate.includes('programmingLanguage')) obj = df.literal(token.lang);
                    if (e.predicate.includes('text')) obj = df.literal(token.text);
                    const q = df.quad(codeSubj, pred, obj);
                    quads.push(q);
                    origin.quadIndex.set(JSON.stringify([q.subject.value, q.predicate.value, q.object.value]), blockId);
                }
            });

            if (currentSubject) {
                const q = df.quad(currentSubject, df.namedNode(expandIRI('hasPart', ctx)), codeSubj);
                quads.push(q);
            }
            continue;
        }

        if ((token.type === 'para' || token.type === 'list') && currentSubject) {
            const spans = parseInlineSpans(token.text);

            for (const span of spans) {
                if (span.type === 'span' && span.attrs) {
                    const ann = parseAnnotation(span.attrs);
                    let spanSubj = currentSubject;

                    if (ann.subject) {
                        spanSubj = df.namedNode(expandIRI(ann.subject, ctx));
                    }

                    ann.entries.forEach(e => {
                        if (e.kind === 'property' && e.predicate) {
                            const pred = df.namedNode(expandIRI(e.predicate, ctx));
                            let obj;

                            if (span.url) {
                                obj = df.namedNode(expandIRI(span.url, ctx));
                            } else {
                                obj = ann.datatype
                                    ? df.literal(span.text, df.namedNode(expandIRI(ann.datatype, ctx)))
                                    : ann.language
                                        ? df.literal(span.text, ann.language)
                                        : df.literal(span.text);
                            }

                            const q = e.direction === 'reverse'
                                ? df.quad(obj.termType === 'NamedNode' ? obj : df.blankNode(), pred, spanSubj)
                                : df.quad(spanSubj, pred, obj);

                            quads.push(q);
                        }

                        if (e.kind === 'type') {
                            const q = df.quad(spanSubj, df.namedNode(expandIRI('rdf:type', ctx)), df.namedNode(expandIRI(e.classIRI, ctx)));
                            quads.push(q);
                        }
                    });
                }
            }
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
                    edits.push({ start: block.range.start, end: block.range.end, text: '' });
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