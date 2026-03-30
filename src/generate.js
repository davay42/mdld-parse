import { shortenIRI, expandIRI, DataFactory } from './utils.js';
import { DEFAULT_CONTEXT } from './shared.js';

// Helper function to extract prefix from IRI
function getPrefixFromIRI(iri, context) {
    if (!iri) return null;

    const shortened = shortenIRI(iri, context);
    if (shortened.includes(':')) {
        return shortened.split(':')[0];
    }
    return null;
}

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


export function extractLocalName(iri, ctx = {}) {
    if (!iri) return iri;

    // Check for exact prefix matches first
    for (const [prefix, namespace] of Object.entries(ctx)) {
        if (iri.startsWith(namespace) || iri.startsWith(namespace.slice(0, -1))) {
            return iri.substring(namespace.length);
        }
    }

    // Fallback to original logic for local names
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
 * Output: MDLD text
 */
export function generate(quads, context = {}) {
    const fullContext = { ...DEFAULT_CONTEXT, ...context };

    const normalizedQuads = normalizeAndSortQuads(quads);

    const subjectGroups = groupQuadsBySubject(normalizedQuads);

    const { text } = buildDeterministicMDLD(subjectGroups, fullContext);

    return text;
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
    const usedPrefixes = new Set();

    // First pass: collect all prefixes used in content
    for (const subjectQuads of subjectGroups.values()) {
        for (const quad of subjectQuads) {
            // Check subject prefix
            const subjectPrefix = getPrefixFromIRI(quad.subject.value, context);
            if (subjectPrefix) usedPrefixes.add(subjectPrefix);

            // Check predicate prefix
            const predicatePrefix = getPrefixFromIRI(quad.predicate.value, context);
            if (predicatePrefix) usedPrefixes.add(predicatePrefix);

            // Check object prefix if it's a named node
            if (quad.object.termType === 'NamedNode') {
                const objectPrefix = getPrefixFromIRI(quad.object.value, context);
                if (objectPrefix) usedPrefixes.add(objectPrefix);
            }

            // Check datatype prefix if present
            if (quad.object.datatype && quad.object.datatype.value) {
                const datatypePrefix = getPrefixFromIRI(quad.object.datatype.value, context);
                if (datatypePrefix) usedPrefixes.add(datatypePrefix);
            }
        }
    }

    // Add prefixes first (deterministic order), but exclude default context prefixes
    const sortedPrefixes = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, namespace] of sortedPrefixes) {
        // Skip default context prefixes - they're implicit in MDLD
        if (prefix !== '@vocab' && !prefix.startsWith('@') && !DEFAULT_CONTEXT[prefix] && usedPrefixes.has(prefix)) {
            const prefixDecl = `[${prefix}] <${namespace}>\n`;
            text += prefixDecl;
        }
    }

    if (sortedPrefixes.length > 0) {
        text += '\n';
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
        const localSubjectName = extractLocalName(subjectIRI, context);
        const typeAnnotations = types.length > 0
            ? ' ' + types.map(t => '.' + shortenIRI(t.object.value, context)).sort().join(' ')
            : '';

        const headingText = `# ${localSubjectName} {=${shortSubject}${typeAnnotations}}\n`;

        text += headingText;

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
            text += literalText;
        }

        // Add objects (deterministic order)
        const sortedObjects = objects.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));
        for (const quad of sortedObjects) {
            const objShort = shortenIRI(quad.object.value, context);
            const predShort = shortenIRI(quad.predicate.value, context);
            const objectText = `[${objShort}] {+${objShort} ?${predShort}}\n`;
            text += objectText;
        }

        text += '\n';
    }

    return { text };
}
