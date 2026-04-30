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
 * Input: RDF quads + context + optional primarySubject (string IRI)
 * Output: MDLD text
 */
export function generate(quads, context = {}, primarySubject = null) {
    const fullContext = { ...DEFAULT_CONTEXT, ...context };

    const normalizedQuads = normalizeAndSortQuads(quads);

    const subjectGroups = groupQuadsBySubject(normalizedQuads);

    const { text } = buildDeterministicMDLD(subjectGroups, fullContext, primarySubject);

    return { text, context: fullContext };
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

function buildDeterministicMDLD(subjectGroups, context, primarySubject = null) {
    let text = '';
    const usedPrefixes = collectUsedPrefixes(subjectGroups, context);

    // Build label lookup map for all IRIs that have rdfs:label
    const labelLookup = buildLabelLookup(subjectGroups);

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

    // Process subjects in deterministic order, with primary subject first
    const sortedSubjects = Array.from(subjectGroups.keys()).sort();
    const primarySubjectIRI = primarySubject; // Already a string IRI

    // If primary subject exists, place it first
    const orderedSubjects = primarySubjectIRI
        ? [primarySubjectIRI, ...sortedSubjects.filter(s => s !== primarySubjectIRI)]
        : sortedSubjects;

    for (const subjectIRI of orderedSubjects) {
        const subjectQuads = subjectGroups.get(subjectIRI);
        const shortSubject = shortenIRI(subjectIRI, context);

        // Separate types, literals, and objects using shared utility
        const { types, literals, objects } = filterQuadsByType(subjectQuads);

        // Check if this subject has a label
        const hasLabel = labelLookup.has(subjectIRI);
        const displayName = hasLabel ? labelLookup.get(subjectIRI) : extractLocalName(subjectIRI, context);

        // Build annotations: types + label indicator if present
        let annotations = types.length > 0
            ? types.map(t => '.' + shortenIRI(t.object.value, context)).sort().join(' ')
            : '';
        if (hasLabel) {
            annotations += (annotations ? ' ' : '') + 'label';
        }

        const annotationStr = annotations ? ' ' + annotations : '';
        text += `# ${displayName} {=${shortSubject}${annotationStr}}\n\n`;

        // Add literals (excluding the label used in heading) and objects
        const rdfsLabelIRI = 'http://www.w3.org/2000/01/rdf-schema#label';
        const headingLabel = hasLabel ? labelLookup.get(subjectIRI) : null;
        sortQuadsByPredicate(literals).forEach(quad => {
            // Skip only the label that matches the heading display, render additional labels
            if (quad.predicate.value === rdfsLabelIRI && quad.object.value === headingLabel) {
                return; // Skip the heading label
            }
            text += generateLiteralText(quad, context);
        });

        sortQuadsByPredicate(objects).forEach(quad => {
            text += generateObjectText(quad, context, labelLookup);
        });

        text += '\n';
    }

    return { text };
}

function buildLabelLookup(subjectGroups) {
    const labelLookup = new Map();
    const rdfsLabelIRI = 'http://www.w3.org/2000/01/rdf-schema#label';

    for (const subjectQuads of subjectGroups.values()) {
        for (const quad of subjectQuads) {
            if (quad.predicate.value === rdfsLabelIRI && quad.object.termType === 'Literal') {
                labelLookup.set(quad.subject.value, quad.object.value);
            }
        }
    }

    return labelLookup;
}
