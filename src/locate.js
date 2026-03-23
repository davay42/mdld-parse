import { quadToKeyForOrigin } from './utils.js';

/**
 * Locate the origin entry for a quad using the lean origin system
 * 
 * @param {Object} quad - The quad to locate (subject, predicate, object)
 * @param {Object} origin - Origin object containing quadIndex
 * @returns {Object|null} Origin entry or null if not found
 */
export function locate(quad, origin) {
    if (!quad || !origin || !origin.quadIndex) {
        return null;
    }

    // Generate the quad key to lookup in quadIndex
    const quadKey = quadToKeyForOrigin(quad);
    if (!quadKey) {
        return null;
    }

    // Find the origin entry in quadIndex
    const entry = origin.quadIndex.get(quadKey);
    if (!entry) {
        return null;
    }

    // Return the lean origin entry structure
    return {
        blockId: entry.blockId,
        range: entry.range,
        carrierType: entry.carrierType,
        subject: entry.subject,
        predicate: entry.predicate,
        context: entry.context,
        value: entry.value,
        polarity: entry.polarity
    };
}
