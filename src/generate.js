import { shortenIRI, expandIRI, DataFactory } from './utils.js';
import { DEFAULT_CONTEXT, RDFS_LABEL, RDF_TYPE } from './constants.js';
import {
    isLiteral,
    collectUsedPrefixes,
    sortQuadsByPredicate,
    generatePrefixDeclaration,
    generateLiteralText,
    generateObjectText,
    generateRetractionText,
    filterQuadsByType
} from './shared.js';

// Simple cache for IRI shortening to avoid repeated processing
const iriCache = new Map();
const CACHE_SIZE_LIMIT = 1000;

function getCachedShortIRI(iri, context) {
    const cacheKey = `${iri}|${JSON.stringify(context)}`;
    if (iriCache.has(cacheKey)) {
        return iriCache.get(cacheKey);
    }

    const result = shortenIRI(iri, context);

    // Simple LRU: if cache is full, clear half
    if (iriCache.size >= CACHE_SIZE_LIMIT) {
        const keysToDelete = Array.from(iriCache.keys()).slice(0, Math.floor(CACHE_SIZE_LIMIT / 2));
        keysToDelete.forEach(key => iriCache.delete(key));
    }

    iriCache.set(cacheKey, result);
    return result;
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
 * Input: RDF quads + context + optional primarySubject (string IRI) + compactInline (boolean) + remove (array) + lang (string)
 * Output: MDLD text + context + compactStats
 */
export function generate({ quads, context = {}, primarySubject = null, compactInline = false, renderReverse = false, remove = [], lang = null }) {
    // Optimized context merging - avoid spread operator overhead
    const fullContext = Object.assign({}, DEFAULT_CONTEXT, context);

    const normalizedQuads = normalizeAndSortQuads(quads);
    const normalizedRemove = normalizeAndSortQuads(remove);

    const { subjectGroups, reverseIndex } = groupQuadsBySubject(normalizedQuads);
    const removeBySubject = groupQuadsBySubject(normalizedRemove).subjectGroups;

    // Only use reverseIndex if primarySubject is explicitly provided AND renderReverse is true
    // Avoids order-sensitive fallback that could break with quad ordering changes
    const effectiveReverseIndex = (primarySubject && renderReverse) ? reverseIndex : null;

    const { text, compactStats } = buildDeterministicMDLD(subjectGroups, fullContext, primarySubject, effectiveReverseIndex, compactInline, removeBySubject, lang);

    return { text, context: fullContext, compactStats };
}

/**
 * Generate node-centric MDLD showing all quads where a specific IRI appears
 * in any position: subject, object, predicate, type, or datatype.
 * Perfect for exploring individual nodes and their complete relationship graph.
 */
export function generateNode({ quads, focusIRI, context = {}, compactInline = true, renderReverse = true, lang = null }) {
    // Validate: must have quads and a focus IRI
    if (!quads?.length || !focusIRI) {
        return { text: '', context: Object.assign({}, DEFAULT_CONTEXT, context), compactStats: null };
    }

    const fullContext = Object.assign({}, DEFAULT_CONTEXT, context);
    const normalizedQuads = normalizeAndSortQuads(quads);
    const { nodeGroups, reverseIndex } = groupQuadsByNode(normalizedQuads);

    // SAFETY: If focusIRI not in graph, return empty - NEVER fall back to all data
    // This prevents accidental rendering of entire databases on misspelled IRIs
    if (!nodeGroups.has(focusIRI)) {
        return { text: '', context: fullContext, compactStats: null };
    }

    // Only use reverseIndex if renderReverse is true
    const effectiveReverseIndex = renderReverse ? reverseIndex : null;

    const { text, compactStats } = buildDeterministicMDLD(nodeGroups, fullContext, focusIRI, effectiveReverseIndex, compactInline, new Map(), lang);

    return { text, context: fullContext, compactStats };
}

function normalizeAndSortQuads(quads) {
    // Early return for empty input
    if (!quads || quads.length === 0) return [];

    return quads
        .map(quad => {
            // Early return if already normalized (check for RDF/JS compatibility)
            if (quad.subject.termType && quad.predicate.termType && quad.object.termType) {
                return quad;
            }

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
    const reverseIndex = new Map(); // object IRI -> [quads pointing to it]

    for (const quad of quads) {
        const subjectValue = quad.subject.value;
        const existing = groups.get(subjectValue);
        if (existing) {
            existing.push(quad);
        } else {
            groups.set(subjectValue, [quad]);
        }

        // Track reverse connections (where this quad's object is a named node)
        if (quad.object.termType === 'NamedNode') {
            const objectValue = quad.object.value;
            const reverseList = reverseIndex.get(objectValue);
            if (reverseList) {
                reverseList.push(quad);
            } else {
                reverseIndex.set(objectValue, [quad]);
            }
        }
    }

    return { subjectGroups: groups, reverseIndex };
}

function groupQuadsByNode(quads) {
    const groups = new Map();
    const reverseIndex = new Map(); // object IRI -> [quads pointing to it]

    const ensure = (key) => {
        const existing = groups.get(key);
        if (existing) {
            return existing;
        }
        const newArray = [];
        groups.set(key, newArray);
        return newArray;
    };

    for (const quad of quads) {
        const { subject, predicate, object } = quad;

        // 1. Subject (direct properties)
        ensure(subject.value).push(quad);

        // 2. Object (reverse relations - where this IRI is pointed to)
        if (object.termType === 'NamedNode') {
            ensure(object.value).push(quad);
            // Track reverse connections
            const objectValue = object.value;
            const reverseList = reverseIndex.get(objectValue);
            if (reverseList) {
                reverseList.push(quad);
            } else {
                reverseIndex.set(objectValue, [quad]);
            }
        }

        // 3. Predicate (where this IRI is used as a property)
        ensure(predicate.value).push(quad);

        // 4. Type (instances - where this IRI is the class/type)
        if (predicate.value === RDF_TYPE && object.termType === 'NamedNode') {
            ensure(object.value).push(quad);
        }

        // 5. Datatype (literals using this as their type)
        if (object.termType === 'Literal' && object.datatype) {
            ensure(object.datatype.value || object.datatype).push(quad);
        }
    }
    return { nodeGroups: groups, reverseIndex };
}

function buildDeterministicMDLD(subjectGroups, context, primarySubject = null, reverseIndex = null, compactInline = true, removeBySubject = new Map(), lang = null) {
    const textParts = [];
    const usedPrefixes = collectUsedPrefixes(subjectGroups, context);

    // Build label lookup map for all IRIs that have rdfs:label (stores { value, language })
    const labelLookup = buildLabelLookup(subjectGroups, lang);

    // Track compaction statistics
    const compactStats = {
        compactedSubjects: 0,
        skippedHeadings: 0,
        inlineAnnotations: 0
    };

    // Track all quads that have been rendered (reverse, inline, etc.) to ensure quad stability
    const renderedQuads = new Set();
    // Pre-compute filtered quad groups for rapid O(1) access
    const filteredGroups = new Map();
    for (const [subjectIRI, quads] of subjectGroups.entries()) {
        filteredGroups.set(subjectIRI, filterQuadsByType(quads));
    }

    // Add prefixes first (deterministic order), but exclude default context prefixes
    const sortedPrefixes = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, namespace] of sortedPrefixes) {
        // Skip default context prefixes - they're implicit in MDLD
        if (prefix !== '@vocab' && !prefix.startsWith('@') && !DEFAULT_CONTEXT[prefix] && usedPrefixes.has(prefix)) {
            textParts.push(generatePrefixDeclaration(prefix, namespace));
        }
    }

    if (sortedPrefixes.length > 0) {
        textParts.push('\n');
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
        // Skip if subject not found in groups (e.g., primarySubject provided but no quads for it)
        if (!subjectQuads) continue;

        // Skip subjects where all quads have been rendered (reverse, inline, etc.)
        if (subjectQuads.every(q => renderedQuads.has(q))) {
            compactStats.skippedHeadings++;
            compactStats.compactedSubjects++;
            continue;
        }

        // Separate types, literals, and objects using pre-computed filtered groups
        const { types, literals, objects } = filteredGroups.get(subjectIRI);

        const shortSubject = getCachedShortIRI(subjectIRI, context);

        // Check if this subject has a label
        const labelEntry = labelLookup.get(subjectIRI);
        const hasLabel = !!labelEntry;
        const displayName = hasLabel ? labelEntry.value : extractLocalName(subjectIRI, context);

        // Build annotations: types + label indicator if present
        // Exclude types already rendered inline to maintain quad stability
        const typesNotRendered = types.filter(t => !renderedQuads.has(t));
        let annotations = typesNotRendered.length > 0
            ? typesNotRendered.map(t => '.' + getCachedShortIRI(t.object.value, context)).sort().join(' ')
            : '';
        // Only add label indicator if label quad not already rendered inline
        const labelQuad = subjectQuads.find(q => q.predicate.value === RDFS_LABEL);
        if (hasLabel && (!labelQuad || !renderedQuads.has(labelQuad))) {
            const langTag = labelEntry.language ? ' @' + labelEntry.language : '';
            annotations += (annotations ? ' ' : '') + 'label' + langTag;
        }

        const annotationStr = annotations ? ' ' + annotations : '';
        textParts.push(`# ${displayName} {=${shortSubject}${annotationStr}}\n`);

        // Mark all type and label quads as rendered to prevent inline duplication
        types.forEach(t => renderedQuads.add(t));
        if (labelQuad) renderedQuads.add(labelQuad);

        // Add literals (excluding the label used in heading) and objects
        const headingLabel = hasLabel ? labelEntry.value : null;
        sortQuadsByPredicate(literals).forEach(quad => {
            // Skip only the label that matches the heading display, render additional labels
            if (quad.predicate.value === RDFS_LABEL && quad.object.value === headingLabel) {
                return; // Skip the heading label
            }
            textParts.push(generateLiteralText(quad, context));
        });

        sortQuadsByPredicate(objects).forEach(quad => {
            // Skip quads already rendered (reverse annotations, inline, etc.)
            if (renderedQuads.has(quad)) {
                return;
            }
            textParts.push(generateObjectText(quad, context, labelLookup, filteredGroups, renderedQuads, compactInline, compactStats));
        });

        // Render reverse connections for primarySubject as !p annotations
        if (subjectIRI === primarySubjectIRI && reverseIndex && reverseIndex.has(subjectIRI)) {
            const reverseQuads = reverseIndex.get(subjectIRI);
            // Sort by predicate for deterministic output
            reverseQuads.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));

            for (const quad of reverseQuads) {
                // Mark this quad as rendered to exclude from normal subject rendering
                renderedQuads.add(quad);

                const subjectQuads = subjectGroups.get(quad.subject.value);

                const subjectLabelEntry = labelLookup.get(quad.subject.value);
                const subjectLabel = subjectLabelEntry ? subjectLabelEntry.value : extractLocalName(quad.subject.value, context);
                const shortSubject = getCachedShortIRI(quad.subject.value, context);
                const shortPredicate = getCachedShortIRI(quad.predicate.value, context);

                // Build inline type/label annotation for reverse connections
                // Only render inline types/labels ONCE per subject to ensure quad stability
                let inlineAnnotation = '';
                if (compactInline && subjectQuads) {
                    const { types } = filteredGroups.get(quad.subject.value) || { types: [] };
                    const reverseSubjectLabelEntry = labelLookup.get(quad.subject.value);
                    const hasLabel = !!reverseSubjectLabelEntry;

                    const typeAnnotations = types.length > 0
                        ? types.map(t => '.' + getCachedShortIRI(t.object.value, context)).sort().join(' ')
                        : '';
                    const labelAnnotation = hasLabel ? 'label' + (reverseSubjectLabelEntry.language ? ' @' + reverseSubjectLabelEntry.language : '') : '';

                    if (typeAnnotations || labelAnnotation) {
                        inlineAnnotation = ' ' + [typeAnnotations, labelAnnotation].filter(Boolean).join(' ');
                        compactStats.inlineAnnotations++;

                        // Mark only the type and label quads as rendered inline
                        types.forEach(q => renderedQuads.add(q));
                        if (hasLabel) {
                            const labelQuad = subjectQuads.find(q => q.predicate.value === RDFS_LABEL);
                            if (labelQuad) renderedQuads.add(labelQuad);
                        }
                    }

                    // Check if this subject's quads are all rendered (reverse + inline types/labels)
                    // If so, skip the separate heading
                    const allRendered = subjectQuads.every(q => renderedQuads.has(q));
                    if (allRendered) {
                        compactStats.skippedHeadings++;
                        compactStats.compactedSubjects++;
                    }
                }

                textParts.push(`[${subjectLabel}] {+${shortSubject} !${shortPredicate}${inlineAnnotation}}\n`);
            }
        }

        // Append retractions for this subject
        if (removeBySubject.has(subjectIRI)) {
            const removeQuads = removeBySubject.get(subjectIRI);
            for (const quad of removeQuads) {
                textParts.push(generateRetractionText(quad, context));
            }
            removeBySubject.delete(subjectIRI);
        }

        textParts.push('\n');
    }

    // Handle external retractions (subjects in remove but not in quads)
    for (const [subjectIRI, removeQuads] of removeBySubject) {
        const shortSubject = getCachedShortIRI(subjectIRI, context);
        const displayName = extractLocalName(subjectIRI, context);
        textParts.push(`# ${displayName} {=${shortSubject}}\n`);
        for (const quad of removeQuads) {
            textParts.push(generateRetractionText(quad, context));
        }
        textParts.push('\n');
    }

    return { text: textParts.join(''), compactStats };
}

function buildLabelLookup(subjectGroups, lang = null) {
    const labelLookup = new Map();
    const labelsBySubject = new Map(); // Track all labels per subject to select best one

    for (const subjectQuads of subjectGroups.values()) {
        for (const quad of subjectQuads) {
            if (quad.predicate.value === RDFS_LABEL && quad.object.termType === 'Literal') {
                const subjectIRI = quad.subject.value;
                if (!labelsBySubject.has(subjectIRI)) {
                    labelsBySubject.set(subjectIRI, []);
                }
                labelsBySubject.get(subjectIRI).push(quad.object);
            }
        }
    }

    // Helper function to select best label from a candidate list with tie-breaking
    const selectBestLabel = (candidates) => {
        if (candidates.length === 0) return null;
        // Sort by: length (ascending), then value (alphabetically)
        candidates.sort((a, b) => {
            const lenDiff = a.value.length - b.value.length;
            return lenDiff !== 0 ? lenDiff : a.value.localeCompare(b.value);
        });
        return candidates[0];
    };

    // Select best label for each subject: prioritize by language preference, then untagged, then English, then any language
    for (const [subjectIRI, labels] of labelsBySubject) {
        let selectedLabel = null;

        // If lang is specified, try to find that language first
        if (lang) {
            const langLabels = labels.filter(lit => lit.language === lang);
            selectedLabel = selectBestLabel(langLabels);
        }

        // Try to find untagged label (most generic)
        if (!selectedLabel) {
            const untaggedLabels = labels.filter(lit => !lit.language);
            selectedLabel = selectBestLabel(untaggedLabels);
        }

        // Fall back to English label
        if (!selectedLabel) {
            const englishLabels = labels.filter(lit => lit.language === 'en');
            selectedLabel = selectBestLabel(englishLabels);
        }

        // Fall back to any language-tagged label
        if (!selectedLabel) {
            const taggedLabels = labels.filter(lit => lit.language);
            selectedLabel = selectBestLabel(taggedLabels);
        }

        // Store the selected label value and language
        if (selectedLabel) {
            labelLookup.set(subjectIRI, {
                value: selectedLabel.value,
                language: selectedLabel.language || null
            });
        }
    }

    return labelLookup;
}
