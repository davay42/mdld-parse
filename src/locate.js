import { parse } from './parse.js';
import { normalizeQuad, quadIndexKey } from './utils.js';

/**
 * Locate the precise text range of a quad in MDLD text using origin tracking
 * 
 * @param {Object} quad - The quad to locate (subject, predicate, object)
 * @param {Object} origin - Origin object containing blocks and quadIndex (optional)
 * @param {string} text - Original MDLD text (optional, parsed if origin not provided)
 * @param {Object} context - Context for parsing (optional, used if text needs parsing)
 * @returns {Object|null} Range information or null if not found
 */
export function locate(quad, origin, text = '', context = {}) {
    // If origin not provided, parse text to get origin
    if (!origin && text) {
        const parseResult = parse(text, { context });
        origin = parseResult.origin;
    }

    if (!quad || !origin || !origin.quadIndex || !origin.blocks) {
        return null;
    }

    // Normalize the quad for consistent key generation
    const normalizedQuad = normalizeQuad(quad);
    if (!normalizedQuad) {
        return null;
    }

    // Generate the quad key to lookup in quadIndex
    const quadKey = quadIndexKey(normalizedQuad.subject, normalizedQuad.predicate, normalizedQuad.object);

    // Find the slot information in quadIndex
    const slotInfo = origin.quadIndex.get(quadKey);
    if (!slotInfo) {
        return null;
    }

    // Get the block information
    const block = origin.blocks.get(slotInfo.blockId);
    if (!block) {
        return null;
    }

    // Extract the actual text content based on carrier type and entry
    let contentRange = null;
    let content = '';

    if (block.carrierType === 'heading') {
        // For headings, use the block's main range
        contentRange = block.range;
        content = text.substring(block.range.start, block.range.end);
    } else if (block.carrierType === 'blockquote' || block.carrierType === 'list' || block.carrierType === 'span') {
        // For blockquotes, lists, and spans, extract from block range
        contentRange = block.range;
        content = text.substring(block.range.start, block.range.end);

        // For blockquotes, try to extract the specific carrier content from entries
        if (slotInfo.entryIndex != null && block.entries && block.entries[slotInfo.entryIndex]) {
            const entry = block.entries[slotInfo.entryIndex];
            if (entry.raw) {
                // For blockquotes, the entry.raw contains the full carrier text
                // Extract just the content part before the annotation
                const annotationStart = entry.raw.indexOf('{');
                if (annotationStart !== -1) {
                    const carrierContent = entry.raw.substring(0, annotationStart).trim();
                    // Find this content in the block text
                    const contentStart = text.indexOf(carrierContent, block.range.start);
                    if (contentStart !== -1) {
                        const contentEnd = contentStart + carrierContent.length;
                        contentRange = { start: contentStart, end: contentEnd };
                        content = text.substring(contentStart, contentEnd);
                    }
                }
            }
        }
    }

    return {
        blockId: slotInfo.blockId,
        entryIndex: slotInfo.entryIndex,
        kind: slotInfo.kind,
        subject: normalizedQuad.subject,
        predicate: normalizedQuad.predicate,
        object: normalizedQuad.object,
        range: contentRange,
        content: content,
        blockRange: block.range,
        carrierType: block.carrierType,
        isVacant: slotInfo.isVacant || false
    };
}
