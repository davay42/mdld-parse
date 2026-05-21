import { parse } from './parse.js';
import { merge } from './merge.js';
import { generate, generateNode } from './generate.js';
import { render } from './render.js';
import { getIRIColor, hashIRI, highlightMDLD } from './highlight.js'
import { DEFAULT_CONTEXT } from './constants.js';
import {
    DataFactory,
    hash,
    expandIRI,
    shortenIRI,
    parseSemanticBlock,
    locate
} from './utils.js';

export { parse, merge, generate, generateNode, render, getIRIColor, hashIRI, highlightMDLD, DEFAULT_CONTEXT, DataFactory, hash, expandIRI, shortenIRI, parseSemanticBlock, locate };

/**
 * Update the value of a quad in MDLD text and return the updated text
 *
 * @param {Object} params - Parameters object
 * @param {string} params.text - The original MDLD text
 * @param {Object} params.quad - The quad to update (subject, predicate, object)
 * @param {string} params.value - The new value to set
 * @param {Object} [params.origin] - Origin object or ParseResult (if not provided, text will be parsed)
 * @returns {string} Updated MDLD text, or original if update fails
 */
export function updateValue({ text, quad, value, origin }) {
    // Auto-parse if origin not provided
    const originObj = origin?.quadIndex ? origin : parse({ text }).origin
    // Locate the quad
    const location = locate(quad, originObj);
    if (!location || !location.valueRange) {
        return text; // Return original if can't locate or no valueRange
    }

    // Replace value using valueRange
    return text.substring(0, location.valueRange.start) +
        value +
        text.substring(location.valueRange.end);
}