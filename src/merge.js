import { parse } from './parse.js';
import { DEFAULT_CONTEXT } from './shared.js';

/**
 * Creates a unique key for quad identity matching
 * @param {Quad} quad 
 * @returns {string}
 */
function quadKey(quad) {
    const datatype = quad.object.datatype?.value || '';
    const language = quad.object.language || '';
    return `${quad.subject.value}|${quad.predicate.value}|${quad.object.value}|${datatype}|${language}`;
}

/**
 * Normalizes merge input to ParseResult format
 * @param {string|ParseResult} input 
 * @param {Object} options
 * @param {Object} docContext
 * @returns {ParseResult}
 */
function normalizeInput(input, options, docContext) {
    if (typeof input === 'string') {
        return parse(input, {
            ...options,
            context: { ...docContext, ...options.context }
        });
    }
    // ParseResult passthrough - no re-parse
    return input;
}

/**
 * Merges multiple MDLD documents with diff polarity resolution
 * @param {Array<string|ParseResult>} docs 
 * @param {Object} options
 * @returns {Object} Merge result with quads, remove, statements, origin, and context
 */
export function merge(docs, options = {}) {
    const sessionBuffer = new Map(); // Use Map instead of Set for proper quad storage
    const sessionRemoveSet = new Set();
    const allDocuments = [];
    const quadIndex = new Map();
    const allStatements = []; // Collect statements from all documents

    // Process each document in order
    for (let i = 0; i < docs.length; i++) {
        const input = docs[i];

        // Each document gets the same context (no inheritance)
        const docContext = { ...DEFAULT_CONTEXT, ...options.context };

        // Normalize input to ParseResult
        const doc = normalizeInput(input, options, docContext);

        // Create document origin
        const documentOrigin = {
            index: i,
            input: typeof input === 'string' ? 'string' : 'ParseResult',
            origin: doc.origin,
            context: doc.context,
            statementsCount: doc.statements?.length || 0 // Track statements count
        };
        allDocuments.push(documentOrigin);

        // Collect statements from this document
        if (doc.statements && doc.statements.length > 0) {
            allStatements.push(...doc.statements);
        }

        // Fold assertions into session buffer
        for (const quad of doc.quads) {
            const key = quadKey(quad);
            sessionBuffer.set(key, quad);

            // Create quad origin with document index and polarity
            const existingOrigin = doc.origin.quadIndex.get(quadKey(quad));
            if (existingOrigin) {
                quadIndex.set(quadKey(quad), {
                    ...existingOrigin,
                    documentIndex: i,
                    polarity: '+'
                });
            }
        }

        // Fold retractions
        for (const quad of doc.remove) {
            const key = quadKey(quad);

            if (sessionBuffer.has(key)) {
                // Inter-document cancel - remove from buffer
                sessionBuffer.delete(key);
            } else {
                // External retract - add to remove set
                sessionRemoveSet.add(quad);
            }

            // Create quad origin for remove quads
            const existingOrigin = doc.origin.quadIndex.get(quadKey(quad));
            if (existingOrigin) {
                quadIndex.set(quadKey(quad), {
                    ...existingOrigin,
                    documentIndex: i,
                    polarity: '-'
                });
            }
        }
    }

    // Build final result
    const finalQuads = Array.from(sessionBuffer.values());
    const finalRemove = Array.from(sessionRemoveSet);

    // Build merge origin
    const mergeOrigin = {
        documents: allDocuments,
        quadIndex: quadIndex
    };

    // Build final context (union of all contexts)
    const finalContext = { ...DEFAULT_CONTEXT, ...options.context };

    // Enforce hard invariant
    const quadKeys = new Set(finalQuads.map(quadKey));
    const removeKeys = new Set(finalRemove.map(quadKey));

    // Filter out any overlaps (shouldn't happen with correct implementation)
    const filteredQuads = finalQuads.filter(quad => !removeKeys.has(quadKey(quad)));
    const filteredRemove = finalRemove.filter(quad => !quadKeys.has(quadKey(quad)));

    return {
        quads: filteredQuads,
        remove: filteredRemove,
        statements: allStatements, // Include all collected statements
        origin: mergeOrigin,
        context: finalContext
    };
}
