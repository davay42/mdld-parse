import { parse } from './parse.js';
import {
    DataFactory,
    expandIRI,
    shortenIRI
} from './utils.js';
import {
    escapeHtml,
    extractContentFromRange,
    getIndentLevel
} from './shared.js';
import { DEFAULT_CONTEXT } from './constants.js';

/**
 * Render MD-LD to HTML+RDFa with round-trip safety using origin system
 * 
 * This implementation leverages the origin tracking system to ensure that:
 * 1. Every quad from parsing is represented in the RDFa output
 * 2. RDFa attributes are placed exactly where the original annotations were
 * 3. The rendered HTML can be parsed back to identical quads
 * 
 * @param {string} mdld - MD-LD input string
 * @param {Object} options - Rendering options
 * @param {Object} options.context - Additional context prefixes
 * @param {string} options.baseIRI - Base IRI for relative URLs
 * @param {boolean} options.validate - Enable round-trip validation
 * @param {boolean} options.debug - Enable debug output
 * @returns {Object} Render result with HTML, metadata, and validation
 */
export function render(mdld, options = {}) {
    // Phase 1: Parse MD-LD with full origin tracking
    const parsed = parse({ text: mdld, context: options.context || {} });

    // Phase 2: Build render state using origin system
    const state = buildOriginBasedState(parsed, options, mdld);

    // Phase 3: Render HTML using origin-based positioning
    const html = renderWithOriginTracking(parsed.origin.blocks, state);

    // Phase 4: Wrap with RDFa context
    const wrapped = wrapWithRDFaContext(html, state.ctx);

    const result = {
        html: wrapped,
        context: state.ctx,
        metadata: {
            blockCount: parsed.origin.blocks.size,
            quadCount: parsed.quads.length,
            renderedRDFaCount: state.renderedRDFaCount,
            renderTime: Date.now()
        }
    };

    if (options.debug) {
        result.debug = {
            originBlocks: Array.from(parsed.origin.blocks.values()),
            quadIndex: Array.from(parsed.origin.quadIndex.entries()),
            renderMap: state.renderMap
        };
    }

    return result;
}

/**
 * Build render state using origin system for precise quad tracking
 */
function buildOriginBasedState(parsed, options, mdld) {
    return {
        ctx: parsed.context || { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        baseIRI: options.baseIRI || '',
        sourceText: mdld,
        output: [],
        currentSubject: null,
        // Origin-based tracking
        quadIndex: parsed.origin.quadIndex,
        blocks: parsed.origin.blocks,
        renderMap: new Map(), // Maps block ID to rendered RDFa attributes
        renderedRDFaCount: 0,
        validation: options.validate || false
    };
}

/**
 * Render blocks using origin tracking for precise RDFa placement
 */
function renderWithOriginTracking(blocks, state) {
    // Sort blocks by document order
    const sortedBlocks = Array.from(blocks.values()).sort((a, b) => {
        return (a.range?.start || 0) - (b.range?.start || 0);
    });

    // Separate list blocks for special handling
    const listBlocks = sortedBlocks.filter(block => block.carrierType === 'list');
    const otherBlocks = sortedBlocks.filter(block => block.carrierType !== 'list');

    // Render non-list blocks
    otherBlocks.forEach(block => {
        renderBlockWithOrigin(block, state);
    });

    // Render list blocks with proper structure
    if (listBlocks.length > 0) {
        renderListsWithOrigin(listBlocks, state);
    }

    return state.output.join('');
}

/**
 * Render a single block using origin information
 */
function renderBlockWithOrigin(block, state) {
    // Update subject context
    if (block.subject && block.subject !== 'RESET') {
        state.currentSubject = block.subject;
    }

    // Build RDFa attributes from origin data
    const rdfaAttrs = buildRDFaFromOrigin(block, state);

    // Store render mapping for validation
    if (rdfaAttrs) {
        state.renderMap.set(block.id || hashBlock(block), rdfaAttrs);
    }

    // Render based on block type
    switch (block.type || block.carrierType) {
        case 'heading':
            renderHeading(block, rdfaAttrs, state);
            break;
        case 'para':
            renderParagraph(block, rdfaAttrs, state);
            break;
        case 'list':
            // Handled separately
            break;
        case 'quote':
            renderBlockquote(block, rdfaAttrs, state);
            break;
        case 'code':
            renderCode(block, rdfaAttrs, state);
            break;
        default:
            renderDiv(block, rdfaAttrs, state);
    }
}

/**
 * Build RDFa attributes from origin tracking data
 */
function buildRDFaFromOrigin(block, state) {
    const attrs = [];

    // Skip invalid subjects
    if (!block.subject || block.subject === 'RESET' ||
        block.subject.startsWith('=#') || block.subject.startsWith('+')) {
        return '';
    }

    // Subject resolution - use full IRI for round-trip compatibility
    const expandedSubject = expandIRI(block.subject, state.ctx);
    attrs.push(`about="${escapeHtml(expandedSubject)}"`);

    // Types from block annotations - use full IRIs
    if (block.types && block.types.length > 0) {
        const types = block.types.map(t => {
            const iri = typeof t === 'string' ? t : t.iri;
            return expandIRI(iri, state.ctx);
        }).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }

    // Predicates from carriers and block
    const allPredicates = [];

    // Add predicates from block (for paragraph-level annotations)
    if (block.predicates && block.predicates.length > 0) {
        allPredicates.push(...block.predicates);
    }

    // Add predicates from carriers
    if (block.carriers && block.carriers.length > 0) {
        for (const carrier of block.carriers) {
            if (carrier.predicates && carrier.predicates.length > 0) {
                allPredicates.push(...carrier.predicates);
            }
        }
    }

    if (allPredicates.length > 0) {
        const { literalProps, objectProps, reverseProps } = processPredicates(allPredicates, state.ctx);

        if (literalProps.length > 0) {
            attrs.push(`property="${escapeHtml(literalProps.join(' '))}"`);
        }
        if (objectProps.length > 0) {
            attrs.push(`rel="${escapeHtml(objectProps.join(' '))}"`);
        }
        if (reverseProps.length > 0) {
            attrs.push(`rev="${escapeHtml(reverseProps.join(' '))}"`);
        }
    }

    // Count rendered RDFa attributes
    if (attrs.length > 1) { // More than just about
        state.renderedRDFaCount++;
    }

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

/**
 * Process predicates for RDFa attribute generation
 */
function processPredicates(predicates, ctx) {
    const literalProps = [];
    const objectProps = [];
    const reverseProps = [];

    for (const pred of predicates) {
        const iri = typeof pred === 'string' ? pred : pred.iri;
        const expanded = expandIRI(iri, ctx);

        if (pred.polarity === '-') {
            reverseProps.push(expanded);
        } else {
            if (pred.object && pred.object.termType === 'NamedNode') {
                objectProps.push(expanded);
            } else {
                literalProps.push(expanded);
            }
        }
    }

    return { literalProps, objectProps, reverseProps };
}

/**
 * Render heading with RDFa
 */
function renderHeading(block, rdfaAttrs, state) {
    const level = block.text ? block.text.match(/^#+/)?.[0]?.length || 1 : 1;
    const tag = `h${level}`;

    // Extract clean content by removing MDLD annotations
    let content = extractContentFromRange(state.sourceText, block.range);
    // Remove any remaining {...} patterns
    content = content.replace(/\s*\{[^}]+\}\s*$/g, '').trim();

    state.output.push(`<${tag}${rdfaAttrs}>${escapeHtml(content)}</${tag}>`);
}

/**
 * Render paragraph with inline carriers
 */
function renderParagraph(block, rdfaAttrs, state) {
    const content = renderContentWithCarriers(block, state);

    state.output.push(`<p${rdfaAttrs}>${content}</p>`);
}

/**
 * Render blockquote with RDFa
 */
function renderBlockquote(block, rdfaAttrs, state) {
    const content = renderContentWithCarriers(block, state);

    state.output.push(`<blockquote${rdfaAttrs}>${content}</blockquote>`);
}

/**
 * Render code block with RDFa
 */
function renderCode(block, rdfaAttrs, state) {
    const language = block.info || '';
    const content = block.text || '';

    state.output.push(`<pre><code${rdfaAttrs}${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(content)}</code></pre>`);
}

/**
 * Render generic div with RDFa
 */
function renderDiv(block, rdfaAttrs, state) {
    const content = renderContentWithCarriers(block, state);

    state.output.push(`<div${rdfaAttrs}>${content}</div>`);
}

/**
 * Render content with inline carriers using origin positions
 */
function renderContentWithCarriers(block, state) {
    if (!block.carriers || block.carriers.length === 0) {
        const content = extractCleanContent(state.sourceText, block.range);
        return escapeHtml(content);
    }

    // Build carrier position map using origin data
    const carrierMap = buildCarrierPositionMap(block);

    // Extract clean text without carriers (they'll be added separately)
    const cleanText = extractCleanContent(state.sourceText, block.range);

    // Render with carriers at exact positions
    return renderTextWithCarriers(cleanText, carrierMap, state);
}

/**
 * Extract clean content by removing all MDLD annotations
 */
function extractCleanContent(sourceText, range) {
    if (!range || !sourceText) return '';

    let text = sourceText.substring(range[0], range[1]);

    // Remove MDLD annotation patterns
    // 1. Remove {...} at end of lines (including multiline)
    text = text.replace(/\s*\{[^}]*\}\s*$/gm, '');
    // 2. Remove {...} anywhere in content (more aggressive)
    text = text.replace(/\{[^}]*\}/g, '');
    // 3. Clean up extra whitespace and trailing characters
    text = text.replace(/\s+/g, ' ').trim();
    // 4. Remove any remaining annotation fragments like "]"
    text = text.replace(/\]$/, '');

    return text;
}

/**
 * Build carrier position map from origin data
 */
function buildCarrierPositionMap(block) {
    const positionMap = [];

    if (!block.carriers) return positionMap;

    for (const carrier of block.carriers) {
        if (!carrier.text || !carrier.range) continue;

        positionMap.push({
            pos: carrier.range[0] - block.range[0], // Relative to block start
            carrier: carrier,
            length: carrier.text.length
        });
    }

    return positionMap.sort((a, b) => a.pos - b.pos);
}

/**
 * Render text with carriers at mapped positions
 */
function renderTextWithCarriers(text, carrierMap, state) {
    if (carrierMap.length === 0) {
        return escapeHtml(text);
    }

    let html = '';
    let pos = 0;

    for (const mapping of carrierMap) {
        // Add text before carrier
        if (mapping.pos > pos) {
            html += escapeHtml(text.substring(pos, mapping.pos));
        }

        // Render carrier with RDFa
        html += renderCarrierWithOrigin(mapping.carrier, state);

        // Move position past carrier
        pos = mapping.pos + mapping.length;
    }

    // Add remaining text
    if (pos < text.length) {
        html += escapeHtml(text.substring(pos));
    }

    return html;
}

/*
 * Render carrier with origin - based RDFa
*/
function renderCarrierWithOrigin(carrier, state) {
    const attrs = [];

    // Subject from carrier or current context
    const subject = carrier.subject || state.currentSubject;
    if (!subject || subject === 'RESET' || subject.startsWith('=#') || subject.startsWith('+')) {
        return escapeHtml(carrier.text || '');
    }

    // About attribute - use CURIE for consistency
    const shortenedSubject = shortenIRI(expandIRI(subject, state.ctx), state.ctx);
    attrs.push(`about="${escapeHtml(shortenedSubject)}"`);

    // Types - use CURIEs
    if (carrier.types && carrier.types.length > 0) {
        const types = carrier.types.map(t => {
            const iri = typeof t === 'string' ? t : t.iri;
            return shortenIRI(expandIRI(iri, state.ctx), state.ctx);
        }).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }

    // Predicates - use CURIEs
    if (carrier.predicates && carrier.predicates.length > 0) {
        const { literalProps, objectProps, reverseProps } = processPredicates(carrier.predicates, state.ctx);

        if (literalProps.length > 0) {
            const shortProps = literalProps.map(prop => shortenIRI(prop, state.ctx)).join(' ');
            attrs.push(`property="${escapeHtml(shortProps)}"`);
        }
        if (objectProps.length > 0) {
            const shortProps = objectProps.map(prop => shortenIRI(prop, state.ctx)).join(' ');
            attrs.push(`rel="${escapeHtml(shortProps)}"`);
        }
        if (reverseProps.length > 0) {
            const shortProps = reverseProps.map(prop => shortenIRI(prop, state.ctx)).join(' ');
            attrs.push(`rev="${escapeHtml(shortProps)}"`);
        }
    }

    const rdfaAttrs = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';

    // Render based on carrier type
    switch (carrier.type) {
        case 'emphasis':
            return `<em${rdfaAttrs}>${escapeHtml(carrier.text || '')}</em>`;
        case 'strong':
            return `<strong${rdfaAttrs}>${escapeHtml(carrier.text || '')}</strong>`;
        case 'code':
            return `<code${rdfaAttrs}>${escapeHtml(carrier.text || '')}</code>`;
        case 'link':
            return `<a href="${escapeHtml(carrier.url || '')}"${rdfaAttrs}>${escapeHtml(carrier.text || '')}</a>`;
        default:
            return `<span${rdfaAttrs}>${escapeHtml(carrier.text || '')}</span>`;
    }
}

/**
 * Render lists using origin tracking
 */
function renderListsWithOrigin(listBlocks, state) {
    // Group list blocks by hierarchy
    const listGroups = groupListBlocks(listBlocks, state.sourceText);

    listGroups.forEach(group => {
        renderListGroup(group, state);
    });
}

/**
 * Group list blocks by structural hierarchy
 */
function groupListBlocks(listBlocks, sourceText) {
    const groups = [];
    let currentGroup = null;

    // Sort by position
    const sortedBlocks = listBlocks.sort((a, b) =>
        (a.range?.start || 0) - (b.range?.start || 0)
    );

    for (const block of sortedBlocks) {
        const indent = getIndentLevel(block, sourceText);

        if (indent === 0) {
            // Start new group
            if (currentGroup) {
                groups.push(currentGroup);
            }
            currentGroup = {
                contextName: 'Items',
                blocks: [block]
            };
        } else {
            // Add to current group
            if (currentGroup) {
                currentGroup.blocks.push(block);
            } else {
                currentGroup = {
                    contextName: 'Items',
                    blocks: [block]
                };
            }
        }
    }

    if (currentGroup) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Render a list group with proper structure
 */
function renderListGroup(group, state) {
    state.output.push('<ul>');

    // Render list items preserving hierarchy
    for (const block of group.blocks) {
        renderListItem(block, state);
    }

    state.output.push('</ul>');
}

/**
 * Render individual list item
 */
function renderListItem(block, state) {
    const rdfaAttrs = buildRDFaFromOrigin(block, state);
    const content = renderContentWithCarriers(block, state);

    state.output.push(`<li${rdfaAttrs}>${content}</li>`);
}

/**
 * Generate prefix declarations for RDFa
 */
function generatePrefixDeclarations(ctx) {
    const prefixes = [];

    for (const [prefix, iri] of Object.entries(ctx)) {
        if (prefix !== '@vocab') {
            prefixes.push(`${prefix}: ${iri}`);
        }
    }

    return prefixes.length > 0 ? ` prefix="${prefixes.join(' ')}"` : '';
}

/**
 * Generate vocabulary declaration
 */
function generateVocabDeclaration(ctx) {
    return ctx['@vocab'] ? ` vocab="${ctx['@vocab']}"` : '';
}

/**
 * Wrap HTML with RDFa context declarations
 */
function wrapWithRDFaContext(html, ctx) {
    const prefixDecl = generatePrefixDeclarations(ctx);
    const vocabDecl = generateVocabDeclaration(ctx);

    return `<div${prefixDecl}${vocabDecl}>${html}</div>`;
}

/**
 * Generate hash for block identification
 */
function hashBlock(block) {
    const content = `${block.type || block.carrierType}|${block.subject || ''}|${block.text || ''}`;
    return simpleHash(content);
}

/**
 * Simple hash function for block IDs
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}
