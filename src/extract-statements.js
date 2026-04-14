import { DataFactory } from './utils.js';
import { RDF_TYPE, RDF_SUBJECT, RDF_PREDICATE, RDF_OBJECT, RDF_STATEMENT } from './shared.js';

/**
 * Extract elevated statements from a quad set by detecting rdf:Statement patterns.
 * 
 * This function scans quads for complete rdf:Statement patterns (rdf:type rdf:Statement
 * with rdf:subject, rdf:predicate, and rdf:object) and extracts the corresponding SPO quads.
 * 
 * @param {Array} quads - Array of RDF/JS Quads to scan
 * @param {Object} dataFactory - RDF/JS DataFactory instance (defaults to built-in)
 * @returns {Array} Array of elevated SPO quads extracted from rdf:Statement patterns
 */
export function extractStatements(quads, dataFactory = DataFactory) {
    const statementCandidates = new Map();
    const statements = [];

    for (const quad of quads) {
        const predicate = quad.predicate.value;

        // Early filter: only process rdf:Statement related predicates
        if (predicate !== RDF_TYPE &&
            predicate !== RDF_SUBJECT &&
            predicate !== RDF_PREDICATE &&
            predicate !== RDF_OBJECT) {
            continue;
        }

        // Check if this quad starts a new rdf:Statement pattern
        if (predicate === RDF_TYPE && quad.object.value === RDF_STATEMENT) {
            statementCandidates.set(quad.subject.value, { spo: {} });
            continue;
        }

        // Check if this quad completes part of an existing rdf:Statement pattern
        const candidate = statementCandidates.get(quad.subject.value);
        if (!candidate) continue;

        // Direct property assignment for better performance
        if (predicate === RDF_SUBJECT) {
            candidate.spo.subject = quad.object;
        } else if (predicate === RDF_PREDICATE) {
            candidate.spo.predicate = quad.object;
        } else if (predicate === RDF_OBJECT) {
            candidate.spo.object = quad.object;
        }

        // Check if pattern is complete and create elevated SPO quad
        if (candidate.spo.subject && candidate.spo.predicate && candidate.spo.object) {
            const spoQuad = dataFactory.quad(
                candidate.spo.subject,
                candidate.spo.predicate,
                candidate.spo.object
            );
            statements.push(spoQuad);
            // Clean up candidate to avoid duplicate detection
            statementCandidates.delete(quad.subject.value);
        }
    }

    return statements;
}
