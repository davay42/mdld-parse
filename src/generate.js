import { shortenIRI, expandIRI, quadIndexKey, createUnifiedSlot, DEFAULT_CONTEXT, DataFactory } from './utils.js';

// Helper functions for cleaner term type checking
function isLiteral(term) {
    return term?.termType === 'Literal';
}

function isNamedNode(term) {
    return term?.termType === 'NamedNode';
}

function isRdfType(term) {
    return term?.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
}


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

    const { text, quadMap } = buildDeterministicMDLD(subjectGroups, fullContext);

    return {
        text,
        origin: { quadMap },
        context: fullContext
    };
}

function normalizeAndSortQuads(quads) {
    return quads
        .map(quad => {
            // Use DataFactory.fromTerm to ensure proper RDF/JS compatibility
            const normSubject = DataFactory.fromTerm(quad.subject);
            const normPredicate = DataFactory.fromTerm(quad.predicate);
            const normObject = DataFactory.fromTerm(quad.object);

            return {
                subject: normSubject,
                predicate: normPredicate,
                object: normObject
            };
        })
        .sort((a, b) => {
            // Deterministic sorting: subject -> predicate -> object
            const sComp = a.subject.value.localeCompare(b.subject.value);
            if (sComp !== 0) return sComp;
            const pComp = a.predicate.value.localeCompare(b.predicate.value);
            if (pComp !== 0) return pComp;
            const oA = isLiteral(a.object) ? a.object.value : a.object.value;
            const oB = isLiteral(b.object) ? b.object.value : b.object.value;
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
    const quadMap = new Map();

    // Add prefixes first (deterministic order), but exclude default context prefixes
    const sortedPrefixes = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, namespace] of sortedPrefixes) {
        // Skip default context prefixes - they're implicit in MDLD
        if (prefix !== '@vocab' && !prefix.startsWith('@') && !DEFAULT_CONTEXT[prefix]) {
            const prefixDecl = `[${prefix}] <${namespace}>\n`;
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

        // Separate types, literals, and objects using helper functions
        const types = subjectQuads.filter(q => isRdfType(q.predicate));
        const literals = subjectQuads.filter(q => isLiteral(q.object) && !isRdfType(q.predicate));
        const objects = subjectQuads.filter(q => isNamedNode(q.object) && !isRdfType(q.predicate));

        // Generate heading
        const localSubjectName = extractLocalName(subjectIRI);
        const typeAnnotations = types.length > 0
            ? ' ' + types.map(t => '.' + extractLocalName(t.object.value)).sort().join(' ')
            : '';

        const headingText = `# ${localSubjectName} {=${shortSubject}${typeAnnotations}}\n\n`;

        const headingBlock = {
            id: generateBlockId(),
            range: { start: currentPos, end: currentPos + headingText.length },
            subject: subjectIRI,
            types: types.map(t => t.object.value),
            predicates: [],
            context: { ...context },
            carrierType: 'heading',
            attrsRange: { start: currentPos + headingText.indexOf('{'), end: currentPos + headingText.indexOf('}') + 1 },
            valueRange: { start: currentPos + 2, end: currentPos + 2 + localSubjectName.length }
        };

        // Add type quads to quadMap
        types.forEach((quad, i) => {
            const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
            quadMap.set(key, createUnifiedSlot(headingBlock, i, {
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

            // Use DataFactory XSD constants for datatype comparison
            const xsdString = 'http://www.w3.org/2001/XMLSchema#string';
            if (quad.object.language) {
                annotation += ` @${quad.object.language}`;
            } else if (quad.object.datatype.value !== xsdString) {
                annotation += ` ^^${shortenIRI(quad.object.datatype.value, context)}`;
            }

            const literalText = `[${quad.object.value}] {${annotation}}\n`;
            const literalBlock = {
                id: generateBlockId(),
                range: { start: currentPos, end: currentPos + literalText.length },
                subject: subjectIRI,
                types: [],
                predicates: [{ iri: quad.predicate.value, form: '' }],
                context: { ...context },
                carrierType: 'span',
                valueRange: { start: currentPos + 1, end: currentPos + 1 + quad.object.value.length },
                attrsRange: { start: currentPos + literalText.indexOf('{'), end: currentPos + literalText.indexOf('}') + 1 }
            };

            // Add to quadMap
            const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
            quadMap.set(key, createUnifiedSlot(literalBlock, 0, {
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
            const objShort = shortenIRI(quad.object.value, context);
            const predShort = shortenIRI(quad.predicate.value, context);
            const objectText = `[${objShort}] {+${objShort} ?${predShort}}\n`;

            const objectBlock = {
                id: generateBlockId(),
                range: { start: currentPos, end: currentPos + objectText.length },
                subject: subjectIRI,
                types: [],
                predicates: [{ iri: quad.predicate.value, form: '?' }],
                context: { ...context },
                carrierType: 'span',
                valueRange: { start: currentPos + 1, end: currentPos + 1 + objShort.length },
                attrsRange: { start: currentPos + objectText.indexOf('{'), end: currentPos + objectText.indexOf('}') + 1 }
            };

            // Add to quadMap
            const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
            quadMap.set(key, createUnifiedSlot(objectBlock, 0, {
                kind: 'pred',
                subject: quad.subject,
                predicate: quad.predicate,
                object: quad.object,
                form: '?'
            }));

            text += objectText;
            currentPos += objectText.length;
        }

        text += '\n';
        currentPos += 1;
    }

    return { text, quadMap };
}

function generateBlockId() {
    return Math.random().toString(36).substring(2, 10);
}
