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

    // Return the origin entry directly - no need to create new object
    return origin.quadIndex.get(quadKey) || null;
}
