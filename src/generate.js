import { shortenIRI, expandIRI, quadIndexKey, createSlotInfo, DEFAULT_CONTEXT } from './utils.js';


function extractLocalName(iri) {
    const separators = ['#', '/', ':'];
    for (const sep of separators) {
        const lastSep = iri.lastIndexOf(sep);
        if (lastSep !== -1 && lastSep < iri.length - 1) {
            return iri.substring(lastSep + 1);
        }
    }
    return iri;
}

/**
 * Generate deterministic MDLD from RDF quads
 * Purpose: TTL→MDLD conversion with canonical structure
 * Input: RDF quads + context
 * Output: MDLD text + origin + context
 */
export function generate(quads, context = {}) {
    const fullContext = { ...DEFAULT_CONTEXT, ...context };

    const normalizedQuads = normalizeAndSortQuads(quads);

    const subjectGroups = groupQuadsBySubject(normalizedQuads);

    const { text, blocks, quadIndex } = buildDeterministicMDLD(subjectGroups, fullContext);

    return {
        text,
        origin: { blocks, quadIndex },
        context: fullContext
    };
}

function normalizeAndSortQuads(quads) {
    return quads
        .map(quad => ({
            subject: { termType: quad.subject.termType, value: quad.subject.value },
            predicate: { termType: quad.predicate.termType, value: quad.predicate.value },
            object: quad.object.termType === 'Literal'
                ? {
                    termType: 'Literal',
                    value: quad.object.value,
                    language: quad.object.language || null,
                    datatype: quad.object.datatype || { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' }
                }
                : { termType: 'NamedNode', value: quad.object.value }
        }))
        .sort((a, b) => {
            // Deterministic sorting: subject -> predicate -> object
            const sComp = a.subject.value.localeCompare(b.subject.value);
            if (sComp !== 0) return sComp;
            const pComp = a.predicate.value.localeCompare(b.predicate.value);
            if (pComp !== 0) return pComp;
            const oA = a.object.termType === 'Literal' ? a.object.value : a.object.value;
            const oB = b.object.termType === 'Literal' ? b.object.value : b.object.value;
            return oA.localeCompare(oB);
        });
}

function groupQuadsBySubject(quads) {
    const groups = new Map();
    for (const quad of quads) {
        if (!groups.has(quad.subject.value)) {
            groups.set(quad.subject.value, []);
        }
        groups.get(quad.subject.value).push(quad);
    }
    return groups;
}

function buildDeterministicMDLD(subjectGroups, context) {
    let text = '';
    let currentPos = 0;
    const blocks = new Map();
    const quadIndex = new Map();

    // Add prefixes first (deterministic order), but exclude default context prefixes
    const sortedPrefixes = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, namespace] of sortedPrefixes) {
        // Skip default context prefixes - they're implicit in MDLD
        if (prefix !== '@vocab' && !prefix.startsWith('@') && !DEFAULT_CONTEXT[prefix]) {
            const prefixDecl = `[${prefix}] <${namespace}>\n`;
            const blockId = generateBlockId();
            blocks.set(blockId, {
                id: blockId,
                range: { start: currentPos, end: currentPos + prefixDecl.length },
                subject: null,
                entries: [{ kind: 'prefix', prefix, namespace, raw: prefixDecl.trim() }],
                carrierType: 'prefix'
            });
            text += prefixDecl;
            currentPos += prefixDecl.length;
        }
    }

    if (sortedPrefixes.length > 0) {
        text += '\n';
        currentPos += 1;
    }

    // Process subjects in deterministic order
    const sortedSubjects = Array.from(subjectGroups.keys()).sort();

    for (const subjectIRI of sortedSubjects) {
        const subjectQuads = subjectGroups.get(subjectIRI);
        const shortSubject = shortenIRI(subjectIRI, context);

        // Separate types, literals, and objects
        const types = subjectQuads.filter(q => q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        const literals = subjectQuads.filter(q => q.object.termType === 'Literal' && q.predicate.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        const objects = subjectQuads.filter(q => q.object.termType === 'NamedNode' && q.predicate.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

        // Generate heading
        const localSubjectName = extractLocalName(subjectIRI);
        const typeAnnotations = types.length > 0
            ? ' ' + types.map(t => '.' + extractLocalName(t.object.value)).sort().join(' ')
            : '';

        const headingText = `# ${localSubjectName} {=${shortSubject}${typeAnnotations}}\n\n`;
        const blockId = generateBlockId();
        const headingBlock = {
            id: blockId,
            range: { start: currentPos, end: currentPos + headingText.length },
            subject: subjectIRI,
            entries: [
                { kind: 'subject', raw: `=${shortSubject}`, expandedSubject: subjectIRI },
                ...types.map((t, i) => ({
                    kind: 'type',
                    raw: '.' + extractLocalName(t.object.value),
                    expandedType: t.object.value,
                    entryIndex: i
                }))
            ],
            carrierType: 'heading'
        };
        blocks.set(blockId, headingBlock);

        // Add type quads to index
        types.forEach((quad, i) => {
            const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
            quadIndex.set(key, createSlotInfo(blockId, i, {
                kind: 'type',
                subject: quad.subject,
                predicate: quad.predicate,
                object: quad.object
            }));
        });

        text += headingText;
        currentPos += headingText.length;

        // Add literals (deterministic order)
        const sortedLiterals = literals.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));
        for (const quad of sortedLiterals) {
            const predShort = shortenIRI(quad.predicate.value, context);
            let annotation = predShort;

            if (quad.object.language) {
                annotation += ` @${quad.object.language}`;
            } else if (quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                annotation += ` ^^${shortenIRI(quad.object.datatype.value, context)}`;
            }

            const literalText = `> ${quad.object.value} {${annotation}}\n`;
            const literalBlockId = generateBlockId();
            const literalBlock = {
                id: literalBlockId,
                range: { start: currentPos, end: currentPos + literalText.length },
                subject: subjectIRI,
                entries: [{
                    kind: 'property',
                    raw: annotation,
                    expandedPredicate: quad.predicate.value,
                    form: '',
                    entryIndex: 0
                }],
                carrierType: 'span',
                valueRange: { start: currentPos + 1, end: currentPos + 1 + quad.object.value.length },
                attrsRange: { start: currentPos + literalText.indexOf('{'), end: currentPos + literalText.indexOf('}') + 1 }
            };
            blocks.set(literalBlockId, literalBlock);

            // Add to quad index
            const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
            quadIndex.set(key, createSlotInfo(literalBlockId, 0, {
                kind: 'pred',
                subject: quad.subject,
                predicate: quad.predicate,
                object: quad.object,
                form: ''
            }));

            text += literalText;
            currentPos += literalText.length;
        }

        // Add objects (deterministic order)
        const sortedObjects = objects.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));
        for (const quad of sortedObjects) {
            const predShort = shortenIRI(quad.predicate.value, context);
            const objShort = shortenIRI(quad.object.value, context);
            const localName = extractLocalName(quad.object.value);

            const objectText = `> ${localName} {+${objShort} ?${predShort}}\n`;
            const objectBlockId = generateBlockId();
            const objectBlock = {
                id: objectBlockId,
                range: { start: currentPos, end: currentPos + objectText.length },
                subject: subjectIRI,
                entries: [{
                    kind: 'object',
                    raw: objShort,
                    expandedObject: quad.object.value,
                    entryIndex: 0
                }],
                carrierType: 'span'
            };
            blocks.set(objectBlockId, objectBlock);

            // Add to quad index
            const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
            quadIndex.set(key, createSlotInfo(objectBlockId, 0, {
                kind: 'pred',
                subject: quad.subject,
                predicate: quad.predicate,
                object: quad.object,
                form: '?'
            }));

            text += objectText;
            currentPos += objectText.length;
        }

        if (sortedLiterals.length > 0 || sortedObjects.length > 0) {
            text += '\n';
            currentPos += 1;
        }
    }

    return { text: text.trim(), blocks, quadIndex };
}

function generateBlockId() {
    return Math.random().toString(36).substring(2, 10);
}
