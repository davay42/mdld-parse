export const DEFAULT_CONTEXT = {
    '@vocab': 'http://schema.org/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    schema: 'http://schema.org/'
};

export const DataFactory = {
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

export function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return Math.abs(h).toString(16).slice(0, 12);
}

export function expandIRI(term, ctx) {
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

export function parseSemanticBlock(raw) {
    try {
        const src = String(raw || '').trim();
        const cleaned = src.replace(/^\{|\}$/g, '').trim();
        if (!cleaned) return { subject: null, object: null, types: [], predicates: [], datatype: null, language: null, entries: [] };

        const result = { subject: null, object: null, types: [], predicates: [], datatype: null, language: null, entries: [] };
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

            if (token.startsWith('+#')) {
                const fragment = token.substring(2);
                result.object = `#${fragment}`;
                result.entries.push({ kind: 'softFragment', fragment, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('+')) {
                const iri = token.substring(1);
                result.object = iri;
                result.entries.push({ kind: 'object', iri, relRange: { start: relStart, end: relEnd }, raw: token });
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

            if (token.startsWith('!')) {
                const iri = token.substring(1);
                result.predicates.push({ iri, form: '!', entryIndex });
                result.entries.push({ kind: 'property', iri, form: '!', relRange: { start: relStart, end: relEnd }, raw: token });
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
        return { subject: null, object: null, types: [], predicates: [], datatype: null, language: null, entries: [] };
    }
}

export function quadIndexKey(subject, predicate, object) {
    const objKey = object.termType === 'Literal'
        ? JSON.stringify({ t: 'Literal', v: object.value, lang: object.language || '', dt: object.datatype?.value || '' })
        : JSON.stringify({ t: object.termType, v: object.value });
    return JSON.stringify([subject.value, predicate.value, objKey]);
}

export function normalizeQuad(q) {
    if (!q) return null;
    const { subject, predicate, object } = q;
    if (object?.termType === 'Literal') {
        const language = typeof object.language === 'string' ? object.language : '';
        const datatype = object.datatype?.value || 'http://www.w3.org/2001/XMLSchema#string';
        return { ...q, subject, predicate, object: { ...object, language, datatype } };
    }
    return { ...q, subject, predicate, object };
}

export function objectSignature(o) {
    if (!o) return '';
    if (o.termType === 'Literal') {
        return JSON.stringify({ t: 'Literal', v: o.value, lang: o.language || '', dt: o.datatype?.value || '' });
    }
    return JSON.stringify({ t: o.termType, v: o.value });
}

export function quadToKeyForOrigin(q) {
    const nq = normalizeQuad(q);
    return nq ? quadIndexKey(nq.subject, nq.predicate, nq.object) : null;
}

export function parseQuadIndexKey(key) {
    try {
        const [s, p, objKey] = JSON.parse(key);
        return { s, p, o: JSON.parse(objKey) };
    } catch {
        return null;
    }
}

export function createSemanticSlotId(subject, predicate) {
    return hash(`${subject.value}|${predicate.value}`);
}

export function createSlotInfo(blockId, entryIndex, meta = {}) {
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

export function markSlotAsVacant(slotInfo, deletedValue) {
    if (!slotInfo) return null;
    return {
        ...slotInfo,
        isVacant: true,
        lastValue: deletedValue,
        vacantSince: Date.now()
    };
}

export function findVacantSlot(quadIndex, subject, predicate) {
    const targetSlotId = createSemanticSlotId(subject, predicate);
    return Array.from(quadIndex.values())
        .find(slot => slot.slotId === targetSlotId && slot.isVacant);
}

export function occupySlot(slotInfo, newValue) {
    if (!slotInfo || !slotInfo.isVacant) return null;
    return {
        ...slotInfo,
        isVacant: false,
        lastValue: newValue,
        vacantSince: null
    };
}

export function normalizeAttrsTokens(attrsText) {
    const cleaned = String(attrsText || '').replace(/^\s*\{|\}\s*$/g, '').trim();
    return cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
}

export function writeAttrsTokens(tokens) {
    return `{${tokens.join(' ').trim()}}`;
}

export function removeOneToken(tokens, matchFn) {
    const i = tokens.findIndex(matchFn);
    return i === -1 ? { tokens, removed: false } : { tokens: [...tokens.slice(0, i), ...tokens.slice(i + 1)], removed: true };
}

export function addObjectToken(tokens, iri) {
    const objectToken = `+${iri}`;
    return tokens.includes(objectToken) ? tokens : [...tokens, objectToken];
}

export function removeObjectToken(tokens, iri) {
    const objectToken = `+${iri}`;
    return removeOneToken(tokens, t => t === objectToken);
}

export function addSoftFragmentToken(tokens, fragment) {
    const fragmentToken = `+#${fragment}`;
    return tokens.includes(fragmentToken) ? tokens : [...tokens, fragmentToken];
}

export function removeSoftFragmentToken(tokens, fragment) {
    const fragmentToken = `+#${fragment}`;
    return removeOneToken(tokens, t => t === fragmentToken);
}

export function createLiteral(value, datatype, language, context, dataFactory) {
    if (datatype) return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
    if (language) return dataFactory.literal(value, language);
    return dataFactory.literal(value);
}
