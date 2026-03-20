export const DEFAULT_CONTEXT = {
    '@vocab': "http://www.w3.org/2000/01/rdf-schema#",
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    sh: "http://www.w3.org/ns/shacl#",
    prov: 'http://www.w3.org/ns/prov#'
};

// Base Term class for RDF/JS compatibility
export class Term {
    constructor(id) {
        this.id = id;
    }

    equals(other) {
        return !!other && this.termType === other.termType && this.value === other.value;
    }
}

// NamedNode implementation
export class NamedNode extends Term {
    constructor(iri) {
        super(iri);
        this.termType = 'NamedNode';
        this.value = iri;
    }
}

// Literal implementation with language/direction support
export class Literal extends Term {
    constructor(id) {
        super(id);
        this.termType = 'Literal';
        this.value = '';
        this.language = '';
        this.datatype = null;

        // Parse the literal ID - handle escaped quotes properly
        const dtMatch = id.match(/^"([^"\\]*(?:\\.[^"\\]*)*)"(\^\^([^"]+))?(@([^-]+)(--(.+))?)?$/);
        if (dtMatch) {
            // Unescape the value
            this.value = dtMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            if (dtMatch[5]) {
                this.language = dtMatch[5];
                this.datatype = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
            } else if (dtMatch[3]) {
                this.datatype = new NamedNode(dtMatch[3]);
            } else {
                this.datatype = new NamedNode('http://www.w3.org/2001/XMLSchema#string');
            }
        } else {
            // Fallback for simple literals without complex parsing
            this.value = id.replace(/^"|"$/g, '');
            this.datatype = new NamedNode('http://www.w3.org/2001/XMLSchema#string');
        }
    }

    equals(other) {
        return !!other &&
            this.termType === other.termType &&
            this.value === other.value &&
            this.language === other.language &&
            this.datatype?.value === other.datatype?.value;
    }
}

// BlankNode implementation
export class BlankNode extends Term {
    constructor(name) {
        super(name || `b${Math.random().toString(36).slice(2, 11)}`);
        this.termType = 'BlankNode';
        this.value = this.id;
    }
}

// Variable implementation
export class Variable extends Term {
    constructor(name) {
        super(name);
        this.termType = 'Variable';
        this.value = name;
    }
}

// DefaultGraph implementation
export class DefaultGraph extends Term {
    constructor() {
        super('');
        this.termType = 'DefaultGraph';
        this.value = '';
    }

    equals(other) {
        return !!other && this.termType === other.termType;
    }
}

// Default graph singleton
const DEFAULTGRAPH = new DefaultGraph();

// Quad implementation
export class Quad extends Term {
    constructor(subject, predicate, object, graph = DEFAULTGRAPH) {
        super(`${subject.id}|${predicate.id}|${object.id}|${graph.id}`);
        this.termType = 'Quad';
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
    }

    equals(other) {
        return !!other &&
            this.termType === other.termType &&
            this.subject.equals(other.subject) &&
            this.predicate.equals(other.predicate) &&
            this.object.equals(other.object) &&
            this.graph.equals(other.graph);
    }

    toJSON() {
        return {
            termType: this.termType,
            subject: this.subject.toJSON ? this.subject.toJSON() : { termType: this.subject.termType, value: this.subject.value },
            predicate: this.predicate.toJSON ? this.predicate.toJSON() : { termType: this.predicate.termType, value: this.predicate.value },
            object: this.object.toJSON ? this.object.toJSON() : { termType: this.object.termType, value: this.object.value },
            graph: this.graph.toJSON ? this.graph.toJSON() : { termType: this.graph.termType, value: this.graph.value }
        };
    }
}

// XSD constants
const xsd = {
    boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
    integer: 'http://www.w3.org/2001/XMLSchema#integer',
    double: 'http://www.w3.org/2001/XMLSchema#double',
    string: 'http://www.w3.org/2001/XMLSchema#string'
};

// DataFactory singleton matching N3.js interface
export const DataFactory = {
    namedNode: (iri) => new NamedNode(iri),
    blankNode: (name) => new BlankNode(name),
    literal: (value, languageOrDataType) => {
        // Convert non-string values to string for proper serialization
        const stringValue = String(value);
        // Escape quotes in the value for proper serialization
        const escapedValue = stringValue.replace(/"/g, '\\"');

        // Create a language-tagged string
        if (typeof languageOrDataType === 'string') {
            return new Literal(`"${escapedValue}"@${languageOrDataType.toLowerCase()}`);
        }

        // Create a language-tagged string with base direction
        if (languageOrDataType !== undefined && !('termType' in languageOrDataType)) {
            const direction = languageOrDataType.direction ? `--${languageOrDataType.direction.toLowerCase()}` : '';
            return new Literal(`"${escapedValue}"@${languageOrDataType.language.toLowerCase()}${direction}`);
        }

        // Automatically determine datatype for booleans and numbers
        let datatype = languageOrDataType ? languageOrDataType.value : '';
        if (datatype === '') {
            // Convert a boolean
            if (typeof value === 'boolean') {
                datatype = xsd.boolean;
            }
            // Convert an integer or double
            else if (typeof value === 'number') {
                if (Number.isFinite(value)) {
                    datatype = Number.isInteger(value) ? xsd.integer : xsd.double;
                } else {
                    datatype = xsd.double;
                    if (!Number.isNaN(value)) {
                        value = value > 0 ? 'INF' : '-INF';
                    }
                }
            }
        }

        // Create a datatyped literal
        return (datatype === '' || datatype === xsd.string)
            ? new Literal(`"${escapedValue}"`)
            : new Literal(`"${escapedValue}"^^${datatype}`);
    },
    variable: (name) => new Variable(name),
    defaultGraph: () => DEFAULTGRAPH,
    quad: (subject, predicate, object, graph) => new Quad(subject, predicate, object, graph),
    triple: (subject, predicate, object, graph) => new Quad(subject, predicate, object, graph), // Alias for quad
    fromTerm: (term) => {
        if (term instanceof Term) return term;

        // Term instantiated with another library
        switch (term.termType) {
            case 'NamedNode':
                return new NamedNode(term.value);
            case 'BlankNode':
                return new BlankNode(term.value);
            case 'Variable':
                return new Variable(term.value);
            case 'DefaultGraph':
                return DEFAULTGRAPH;
            case 'Literal':
                if (term.language) {
                    return new Literal(`"${term.value}"@${term.language}`);
                } else if (term.datatype) {
                    return new Literal(`"${term.value}"^^${term.datatype.value || term.datatype}`);
                } else {
                    return new Literal(`"${term.value}"`);
                }
            case 'Quad':
                return DataFactory.fromQuad(term);
            default:
                throw new Error(`Unexpected termType: ${term.termType}`);
        }
    },
    fromQuad: (inQuad) => {
        if (inQuad instanceof Quad) return inQuad;
        if (inQuad.termType !== 'Quad') {
            // Handle plain object quads by treating them as quads
            if (inQuad.subject && inQuad.predicate && inQuad.object) {
                return new Quad(
                    DataFactory.fromTerm(inQuad.subject),
                    DataFactory.fromTerm(inQuad.predicate),
                    DataFactory.fromTerm(inQuad.object),
                    DataFactory.fromTerm(inQuad.graph || DataFactory.defaultGraph())
                );
            }
            throw new Error(`Unexpected termType: ${inQuad.termType}`);
        }
        return new Quad(
            DataFactory.fromTerm(inQuad.subject),
            DataFactory.fromTerm(inQuad.predicate),
            DataFactory.fromTerm(inQuad.object),
            DataFactory.fromTerm(inQuad.graph)
        );
    }
};

export function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return Math.abs(h).toString(16).slice(0, 12);
}

const iriCache = new Map();

export function expandIRI(term, ctx) {
    if (term == null) return null;

    const cacheKey = `${term}|${ctx['@vocab'] || ''}|${Object.keys(ctx).filter(k => k !== '@vocab').sort().map(k => `${k}:${ctx[k]}`).join(',')}`;
    if (iriCache.has(cacheKey)) {
        return iriCache.get(cacheKey);
    }

    const raw = typeof term === 'string' ? term : (typeof term === 'object' && typeof term.value === 'string') ? term.value : String(term);
    const t = raw.trim();
    let result;

    if (t.match(/^https?:/)) {
        result = t;
    } else if (t.includes(':')) {
        const [prefix, ref] = t.split(':', 2);
        result = ctx[prefix] ? ctx[prefix] + ref : t;
    } else {
        result = (ctx['@vocab'] || '') + t;
    }

    iriCache.set(cacheKey, result);
    return result;
}

export function shortenIRI(iri, ctx) {
    if (!iri || !iri.startsWith('http')) return iri;
    if (ctx['@vocab'] && iri.startsWith(ctx['@vocab'])) return iri.substring(ctx['@vocab'].length);

    // Find the best matching prefix - more precise matching
    for (const [prefix, namespace] of Object.entries(ctx)) {
        if (prefix !== '@vocab' && iri.startsWith(namespace)) {
            // Check if this is the best match (longest namespace)
            const isBestMatch = Object.entries(ctx)
                .filter(([p, ns]) => p !== '@vocab' && iri.startsWith(ns))
                .every(([p, ns]) => namespace.length >= ns.length || (p === prefix && ns.length === namespace.length));

            if (isBestMatch) {
                return prefix + ':' + iri.substring(namespace.length);
            }
        }
    }
    return iri;
}

// Token pattern definitions for semantic block parsing
const TOKEN_PATTERNS = {
    '=#': { kind: 'fragment', extract: t => t.substring(2) },
    '+#': { kind: 'softFragment', extract: t => t.substring(2) },
    '+': { kind: 'object', extract: t => t.substring(1) },
    '^^': { kind: 'datatype', extract: t => t.substring(2) },
    '@': { kind: 'language', extract: t => t.substring(1) },
    '.': { kind: 'type', extract: t => t.substring(1) },
    '!': { kind: 'property', form: '!', extract: t => t.substring(1) },
    '?': { kind: 'property', form: '?', extract: t => t.substring(1) }
};

export function parseSemanticBlock(raw) {
    try {
        const src = String(raw || '').trim();
        const cleaned = src.replace(/^\{|\}$/g, '').trim();
        if (!cleaned) return { subject: null, object: null, types: [], predicates: [], datatype: null, language: null, entries: [] };

        const result = { subject: null, object: null, types: [], predicates: [], datatype: null, language: null, entries: [] };
        const re = /\S+/g;
        let m;

        while ((m = re.exec(cleaned)) !== null) {
            let token = m[0];
            const relStart = 1 + m.index;
            const relEnd = relStart + token.length;
            const entryIndex = result.entries.length;

            // Handle remove polarity - strip leading - and set remove flag
            let remove = false;
            if (token.startsWith('-') && token.length > 1) {
                remove = true;
                token = token.slice(1);
            }

            // Handle special tokens
            if (token === '=') {
                if (remove) {
                    console.warn('-= is not valid, subject declarations have no polarity');
                }
                result.subject = 'RESET';
                result.entries.push({ kind: 'subjectReset', relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            if (token.startsWith('=') && !token.startsWith('=#')) {
                if (remove) {
                    console.warn('-= is not valid, subject declarations have no polarity');
                }
                const iri = token.substring(1);
                result.subject = iri;
                result.entries.push({ kind: 'subject', iri, relRange: { start: relStart, end: relEnd }, raw: token });
                continue;
            }

            // Handle pattern-based tokens
            let processed = false;
            for (const [pattern, config] of Object.entries(TOKEN_PATTERNS)) {
                if (token.startsWith(pattern)) {
                    const entry = { kind: config.kind, relRange: { start: relStart, end: relEnd }, raw: m[0] };
                    const extracted = config.extract(token);

                    if (config.kind === 'fragment') {
                        result.subject = `=#${extracted}`;
                        entry.fragment = extracted;
                    } else if (config.kind === 'softFragment') {
                        result.object = `#${extracted}`;
                        entry.fragment = extracted;
                    } else if (config.kind === 'object') {
                        if (remove) {
                            console.warn('-+ is not valid, object declarations have no polarity');
                            remove = false;
                        }
                        result.object = extracted;
                        entry.iri = extracted;
                    } else if (config.kind === 'datatype') {
                        if (remove) {
                            console.warn('-^^ is not valid, datatype modifiers have no polarity');
                            remove = false;
                        }
                        if (!result.language) result.datatype = extracted;
                        entry.datatype = extracted;
                    } else if (config.kind === 'language') {
                        if (remove) {
                            console.warn('-@ is not valid, language modifiers have no polarity');
                            remove = false;
                        }
                        result.language = extracted;
                        result.datatype = null;
                        entry.language = extracted;
                    } else if (config.kind === 'type') {
                        result.types.push({ iri: extracted, entryIndex, remove });
                        entry.iri = extracted;
                        entry.remove = remove;
                    } else if (config.kind === 'property') {
                        result.predicates.push({ iri: extracted, form: config.form, entryIndex, remove });
                        entry.iri = extracted;
                        entry.form = config.form;
                        entry.remove = remove;
                    }

                    result.entries.push(entry);
                    processed = true;
                    break;
                }
            }

            // Default case (no pattern match)
            if (!processed) {
                result.predicates.push({ iri: token, form: '', entryIndex, remove });
                result.entries.push({ kind: 'property', iri: token, form: '', relRange: { start: relStart, end: relEnd }, raw: m[0], remove });
            }
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
        const datatype = object.datatype || { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' };
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

// Direct slot management functions - unified with block data
export function createUnifiedSlot(block, entryIndex, meta = {}) {
    const slotId = meta.subject && meta.predicate ? hash(`${meta.subject.value}|${meta.predicate.value}`) : null;
    return {
        // Block metadata
        id: block.id,
        range: block.range,
        attrsRange: block.attrsRange,
        valueRange: block.valueRange,
        carrierType: block.carrierType,
        subject: block.subject,
        types: block.types,
        predicates: block.predicates,
        context: block.context,

        // Slot metadata
        entryIndex,
        slotId,
        isVacant: false,
        lastValue: null,
        vacantSince: null,

        // Quad metadata
        ...meta
    };
}

export function markSlotAsVacant(slotInfo, deletedValue) {
    return slotInfo ? {
        ...slotInfo,
        isVacant: true,
        lastValue: deletedValue,
        vacantSince: Date.now()
    } : null;
}

export function findVacantSlot(quadMap, subject, predicate) {
    const targetSlotId = hash(`${subject.value}|${predicate.value}`);
    return Array.from(quadMap.values())
        .find(slot => slot.slotId === targetSlotId && slot.isVacant);
}

export function occupySlot(slotInfo, newValue) {
    return slotInfo && slotInfo.isVacant ? {
        ...slotInfo,
        isVacant: false,
        lastValue: newValue,
        vacantSince: null
    } : null;
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

// Direct token management - no wrapper function needed
export function addObjectToken(tokens, iri) {
    const token = `+${iri}`;
    return tokens.includes(token) ? tokens : [...tokens, token];
}

export function removeObjectToken(tokens, iri) {
    return removeOneToken(tokens, t => t === `+${iri}`);
}

export function addSoftFragmentToken(tokens, fragment) {
    const token = `+#${fragment}`;
    return tokens.includes(token) ? tokens : [...tokens, token];
}

export function removeSoftFragmentToken(tokens, fragment) {
    return removeOneToken(tokens, t => t === `+#${fragment}`);
}

export function createLiteral(value, datatype, language, context, dataFactory) {
    if (datatype) return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
    if (language) return dataFactory.literal(value, language);
    return dataFactory.literal(value);
}
