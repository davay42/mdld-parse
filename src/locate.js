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

    if (!quad || !origin || !origin.quadMap) {
        return null;
    }

    // Normalize the quad for consistent key generation
    const normalizedQuad = normalizeQuad(quad);
    if (!normalizedQuad) {
        return null;
    }

    // Generate the quad key to lookup in quadMap
    const quadKey = quadIndexKey(normalizedQuad.subject, normalizedQuad.predicate, normalizedQuad.object);

    // Find the slot information in quadMap
    const slotInfo = origin.quadMap.get(quadKey);
    if (!slotInfo) {
        return null;
    }

    // In unified structure, slotInfo contains all block information
    const block = slotInfo;

    // Extract the actual text content based on carrier type
    let contentRange = null;
    let content = '';

    if (block.carrierType === 'heading') {
        // For headings, use the value range for the heading text
        contentRange = block.valueRange;
        content = text.substring(block.valueRange.start, block.valueRange.end);
    } else if (block.carrierType === 'emphasis' || block.carrierType === 'blockquote' || block.carrierType === 'list' || block.carrierType === 'span') {
        // For emphasis, blockquotes, lists, and spans, use the value range
        if (block.valueRange) {
            contentRange = block.valueRange;
            content = text.substring(block.valueRange.start, block.valueRange.end);
        } else {
            // Fallback to block range
            contentRange = block.range;
            content = text.substring(block.range.start, block.range.end);
        }
    }

    return {
        blockId: slotInfo.id,
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
