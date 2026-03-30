import { shortenIRI, expandIRI, DataFactory } from './utils.js';
import { DEFAULT_CONTEXT } from './constants.js';
import {
    isLiteral,
    collectUsedPrefixes,
    sortQuadsByPredicate,
    generatePrefixDeclaration,
    generateLiteralText,
    generateObjectText,
    filterQuadsByType
} from './shared.js';

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
    const usedPrefixes = collectUsedPrefixes(subjectGroups, context);

    // Add prefixes first (deterministic order), but exclude default context prefixes
    const sortedPrefixes = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, namespace] of sortedPrefixes) {
        // Skip default context prefixes - they're implicit in MDLD
        if (prefix !== '@vocab' && !prefix.startsWith('@') && !DEFAULT_CONTEXT[prefix] && usedPrefixes.has(prefix)) {
            text += generatePrefixDeclaration(prefix, namespace);
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

        // Separate types, literals, and objects using shared utility
        const { types, literals, objects } = filterQuadsByType(subjectQuads);

        // Generate heading
        const localSubjectName = extractLocalName(subjectIRI, context);
        const typeAnnotations = types.length > 0
            ? ' ' + types.map(t => '.' + shortenIRI(t.object.value, context)).sort().join(' ')
            : '';

        text += `# ${localSubjectName} {=${shortSubject}${typeAnnotations}}\n`;

        // Add literals and objects using shared utilities
        sortQuadsByPredicate(literals).forEach(quad => {
            text += generateLiteralText(quad, context);
        });

        sortQuadsByPredicate(objects).forEach(quad => {
            text += generateObjectText(quad, context);
        });

        text += '\n';
    }

    return { text };
}
