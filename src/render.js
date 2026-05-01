import { parse } from './parse.js';
import {
    DataFactory,
    expandIRI,
    shortenIRI,
    parseSemanticBlock,
    hash
} from './utils.js';
import {
    escapeHtml,
    getIndentLevel,
    processPredicates
} from './shared.js';
import { DEFAULT_CONTEXT } from './constants.js';

/**
 * Render MD-LD to HTML+RDFa
 * @param {string} mdld - MD-LD input string
 * @param {Object} options - Rendering options
 * @param {Object} options.context - Additional context prefixes
 * @param {string} options.baseIRI - Base IRI for relative URLs
 * @param {boolean} options.strict - Enable strict quad-RDFa correspondence checking
 * @param {boolean} options.pretty - Pretty print output
 * @returns {Object} Render result with HTML, metadata, and optional quad mapping
 */
export function render(mdld, options = {}) {
    // Phase 1: Parse MD-LD (reuse parser)
    const parsed = parse(mdld, { context: options.context || {} });

    // Phase 2: Build render state (includes quads for validation)
    const state = buildRenderState(parsed, options, mdld);

    // Phase 3: Render blocks to HTML
    const html = renderBlocks(parsed.origin.blocks, state);

    // Phase 4: Wrap with RDFa context
    const wrapped = wrapWithRDFaContext(html, state.ctx);

    const result = {
        html: wrapped,
        context: state.ctx,
        metadata: {
            blockCount: parsed.origin.blocks.size,
            quadCount: parsed.quads.length,
            renderedRDFaCount: state.renderedRDFaCount || 0,
            renderTime: Date.now()
        }
    };

    // Add quad mapping if requested
    if (options.strict) {
        result.quadMap = state.quadMap || [];
        result.validation = {
            allQuadsRendered: (state.quadMap || []).length === parsed.quads.length,
            orphanedQuads: identifyOrphanedQuads(parsed.quads, state.quadMap || [])
        };
    }

    return result;
}

/**
 * Build render state following parser pattern
 */
function buildRenderState(parsed, options, mdld) {
    // Use the parser's context which already includes document prefixes
    const ctx = parsed.context || { ...DEFAULT_CONTEXT, ...(options.context || {}) };

    return {
        ctx,
        df: options.dataFactory || DataFactory,
        baseIRI: options.baseIRI || '',
        sourceText: mdld, // Store original text for content extraction
        output: [],
        currentSubject: null,
        documentSubject: null,
        blockStack: [],
        carrierStack: [],
        // Quad tracking for 1-1 correspondence
        quads: parsed.quads,
        quadMap: options.strict ? [] : null, // Maps rendered RDFa to quads
        renderedRDFaCount: 0,
        strict: options.strict || false
    };
}

/**
 * Helper: Check if a quad exists in the quads array
 */
function quadExists(quads, subject, predicate, object) {
    return quads.some(q =>
        q.subject.equals(subject) &&
        q.predicate.equals(predicate) &&
        q.object.equals(object)
    );
}

/**
 * Helper: Identify quads that weren't rendered
 */
function identifyOrphanedQuads(allQuads, renderedQuads) {
    const renderedKeys = new Set(renderedQuads.map(qm =>
        `${qm.subject.value}|${qm.predicate.value}|${qm.object.value}`
    ));

    return allQuads.filter(q =>
        !renderedKeys.has(`${q.subject.value}|${q.predicate.value}|${q.object.value}`)
    );
}

/**
 * Render blocks to HTML with RDFa annotations
 */
function renderBlocks(blocks, state) {
    // Sort blocks by position
    const sortedBlocks = Array.from(blocks.values()).sort((a, b) => {
        return (a.range?.start || 0) - (b.range?.start || 0);
    });

    // Separate list blocks from other blocks
    const listBlocks = sortedBlocks.filter(block => block.carrierType === 'list');
    const otherBlocks = sortedBlocks.filter(block => block.carrierType !== 'list');

    // Render non-list blocks normally
    otherBlocks.forEach(block => {
        renderBlock(block, state);
    });

    // Render lists using Markdown approach with RDFa enrichment
    if (listBlocks.length > 0) {
        renderListsWithRDFa(listBlocks, state);
    }

    return state.output.join('');
}

/**
 * Render lists using Markdown structure with RDFa enrichment
 */
function renderListsWithRDFa(listBlocks, state) {
    // Group list blocks by their context (consecutive blocks with similar context)
    const listGroups = groupListBlocksByContext(listBlocks, state.sourceText);

    listGroups.forEach(group => {
        renderListGroup(group, state);
    });
}

/**
 * Group list blocks by their structural hierarchy
 */
function groupListBlocksByContext(listBlocks, sourceText) {
    const groups = [];

    // Group consecutive list blocks
    let currentGroup = null;

    for (const block of listBlocks) {
        // Start new group for each top-level item (indent 0)
        const indent = getIndentLevel(block, sourceText);

        if (indent === 0) {
            // Close previous group
            if (currentGroup) {
                groups.push(currentGroup);
            }

            // Start new group with a generic name
            currentGroup = {
                contextName: 'Items',
                blocks: [block]
            };
        } else {
            // Add nested items to current group
            if (currentGroup) {
                currentGroup.blocks.push(block);
            } else {
                // This shouldn't happen, but handle it
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
 * Render a list group with proper Markdown structure and RDFa enrichment
 */
function renderListGroup(group, state) {
    // Extract the list anchor text from the first block's position
    const firstBlock = group.blocks[0];
    const listAnchorText = extractListAnchorText(firstBlock, state.sourceText);

    // Render the list anchor as a paragraph if it exists
    if (listAnchorText) {
        state.output.push(`<p>${escapeHtml(listAnchorText)}</p>`);
    }

    // Render the list directly without the semantic-list wrapper
    state.output.push(`<ul>`);

    // Render list items preserving Markdown structure
    const markdownList = group.blocks.map(block =>
        state.sourceText.substring(block.range.start, block.range.end)
    ).join('\n');

    // Parse markdown list and enrich with RDFa
    const htmlList = parseMarkdownList(markdownList, group.blocks, state);
    state.output.push(htmlList);

    state.output.push(`</ul>`);
}

/**
 * Extract list anchor text (the paragraph before the list)
 */
function extractListAnchorText(firstBlock, sourceText) {
    if (!firstBlock.range || !sourceText) return null;

    // Look backwards from the first list item to find the list anchor
    const startPos = firstBlock.range.start;

    // Search backwards for a line that has semantic annotation but no value carrier
    let searchPos = startPos;
    let foundAnchor = null;

    while (searchPos > 0 && !foundAnchor) {
        // Find the start of the current line
        let lineStart = searchPos - 1;
        while (lineStart > 0 && sourceText[lineStart - 1] !== '\n') {
            lineStart--;
        }

        // Extract the line
        let lineEnd = searchPos;
        while (lineEnd < sourceText.length && sourceText[lineEnd] !== '\n') {
            lineEnd++;
        }

        const line = sourceText.substring(lineStart, lineEnd).trim();

        // Check if this looks like a list anchor (has semantic annotation but no value carrier)
        if (line.includes('{') && !line.match(/^-\s/)) {
            foundAnchor = line;
            break;
        }

        // Continue searching backwards
        searchPos = lineStart - 1;
    }

    if (foundAnchor) {
        // Clean the line by removing MD-LD annotations
        const cleanLine = foundAnchor.replace(/\s*\{[^}]+\}\s*$/, '');
        return cleanLine;
    }

    return null;
}

/**
 * Parse markdown list and enrich with RDFa attributes
 */
function parseMarkdownList(markdownList, blocks, state) {
    const lines = markdownList.split('\n').filter(line => line.trim());
    let html = '';
    let currentLevel = 0;
    let openLi = false;

    lines.forEach((line, index) => {
        const indent = line.match(/^(\s*)/)[1].length;
        const content = line.trim();

        if (content.startsWith('-')) {
            const level = Math.floor(indent / 2); // 2 spaces per level
            const itemContent = content.substring(1).trim();

            // Find corresponding block for RDFa attributes
            // Try exact match first, then try without MD-LD annotations
            const cleanLine = itemContent.replace(/\s*\{[^}]+\}\s*$/, '');
            let block = blocks.find(b =>
                b.range && state.sourceText.substring(b.range.start, b.range.end).trim() === line
            );

            // If no exact match, try matching by clean content
            if (!block) {
                block = blocks.find(b => {
                    if (!b.range) return false;
                    const blockText = state.sourceText.substring(b.range.start, b.range.end).trim();
                    const blockCleanContent = blockText.replace(/^-\s*/, '').replace(/\s*\{[^}]+\}\s*$/, '');
                    return blockCleanContent === cleanLine;
                });
            }

            // Clean content by removing MD-LD annotations
            const cleanContent = itemContent.replace(/\s*\{[^}]+\}\s*$/, '');

            // Close lists if going to a higher level
            while (currentLevel > level) {
                if (openLi) {
                    html += '</li>';
                    openLi = false;
                }
                html += '</ul>';
                currentLevel--;
            }

            // Open lists if going deeper
            while (currentLevel < level) {
                if (openLi) {
                    html += '<ul>';
                    openLi = false;
                } else {
                    html += '<ul>';
                }
                currentLevel++;
            }

            // Close previous li if open
            if (openLi) {
                html += '</li>';
                openLi = false;
            }

            const attrs = block ? buildRDFaAttrsFromBlock(block, state.ctx) : '';
            html += `<li${attrs}>${escapeHtml(cleanContent)}`;
            openLi = true;
        }
    });

    // Close any remaining open li and lists
    if (openLi) {
        html += '</li>';
    }
    while (currentLevel > 0) {
        html += '</ul>';
        currentLevel--;
    }

    return html;
}

/**
 * Render a single block
 */
function renderBlock(block, state) {
    // Update current subject context
    if (block.subject && block.subject !== 'RESET') {
        state.currentSubject = block.subject;
    }

    const attrs = buildRDFaAttrsFromBlock(block, state.ctx);

    switch (block.type || block.carrierType) {
        case 'heading':
            const level = block.text ? block.text.match(/^#+/)?.[0]?.length || 1 : 1;
            const tag = `h${level}`;
            state.output.push(`<${tag}${attrs}>`);
            renderBlockContent(block, state);
            state.output.push(`</${tag}>`);
            break;

        case 'para':
            state.output.push(`<p${attrs}>`);
            renderBlockContent(block, state);
            state.output.push(`</p>`);
            break;

        case 'list':
            // List blocks are handled separately in renderListsWithRDFa
            break;

        case 'quote':
            state.output.push(`<blockquote${attrs}>`);
            renderBlockContent(block, state);
            state.output.push(`</blockquote>`);
            break;

        case 'code':
            const language = block.info || '';
            state.output.push(`<pre><code${attrs}${language ? ` class="language-${escapeHtml(language)}"` : ''}>`);
            state.output.push(escapeHtml(block.text || ''));
            state.output.push(`</code></pre>`);
            break;

        default:
            // Default rendering as paragraph
            state.output.push(`<div${attrs}>`);
            renderBlockContent(block, state);
            state.output.push(`</div>`);
    }
}

/**
 * Render block content with inline carriers
 */
function renderBlockContent(block, state) {
    if (!block.text) return;

    // Get inline carriers for this block
    const carriers = block.carriers || [];

    // Parse markdown with inline RDFa enrichment
    const html = parseInlineMarkdown(block.text, carriers, state);

    state.output.push(html);
}

/**
 * Parse inline markdown and enrich with RDFa
 */
function parseInlineMarkdown(text, carriers, state) {
    if (carriers.length === 0) {
        return escapeHtml(text);
    }

    let html = '';
    let lastPos = 0;

    // Sort carriers by their position in the original text
    const sortedCarriers = carriers.sort((a, b) => a.range[0] - b.range[0]);

    for (const carrier of sortedCarriers) {
        // Find the markdown pattern for this carrier in the cleaned text
        const pattern = getMarkdownPattern(carrier);
        if (!pattern) continue;

        const regex = new RegExp(pattern, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {
            // Check if this match corresponds to our carrier by content
            if (match[1] === carrier.text) {
                // Add text before the match
                if (match.index > lastPos) {
                    html += escapeHtml(text.substring(lastPos, match.index));
                }

                // Render the element with RDFa
                const element = {
                    type: carrier.type,
                    content: carrier.text,
                    url: carrier.url
                };
                html += renderMarkdownElement(element, carrier, state);

                lastPos = match.index + match[0].length;
                break; // Found the match, move to next carrier
            }
        }
    }

    // Add remaining text
    if (lastPos < text.length) {
        html += escapeHtml(text.substring(lastPos));
    }

    return html;
}

/**
 * Get markdown pattern for a carrier type
 */
function getMarkdownPattern(carrier) {
    switch (carrier.type) {
        case 'emphasis':
            return /\*([^\*]+)\*/;
        case 'strong':
            return /\*\*([^\*]+)\*\*/;
        case 'code':
            return /`([^`]+)`/;
        case 'link':
            return /\[([^\]]+)\]\(([^)]+)\)/;
        case 'angle-link':
            return /<([^>]+)>/;
        default:
            return null;
    }
}

/**
 * Render markdown element with RDFa attributes
 */
function renderMarkdownElement(element, carrier, state) {
    const rdfaAttrs = carrier ? buildRDFaAttrsFromCarrier(carrier, element, state) : '';

    switch (element.type) {
        case 'code':
            return `<code${rdfaAttrs}>${escapeHtml(element.content)}</code>`;
        case 'link':
            return `<a href="${escapeHtml(element.url)}"${rdfaAttrs}>${escapeHtml(element.content)}</a>`;
        case 'angle-link':
            return `<a href="${escapeHtml(element.url)}"${rdfaAttrs}>${escapeHtml(element.content)}</a>`;
        case 'strong':
            return `<strong${rdfaAttrs}>${escapeHtml(element.content)}</strong>`;
        case 'emphasis':
            return `<em${rdfaAttrs}>${escapeHtml(element.content)}</em>`;
        default:
            return escapeHtml(element.content);
    }
}

/**
 * Build RDFa attributes from carrier with optional quad validation
 */
function buildRDFaAttrsFromCarrier(carrier, element, state) {
    const attrs = [];
    const trackableQuads = []; // Track which quads we render

    // Subject resolution based on carrier type and element
    let subject = null;

    if (element.type === 'link' || element.type === 'angle-link') {
        // For links: explicit subject > URL > current subject
        if (carrier.subject && carrier.subject !== 'RESET') {
            subject = carrier.subject;
        } else if (element.url) {
            subject = element.url;
        } else {
            subject = state.currentSubject;
        }
    } else {
        // For other inline: use carrier subject or current subject
        subject = carrier.subject || state.currentSubject;
    }

    // No subject = no RDFa (dangling annotation, won't generate quads)
    if (!subject || subject === 'RESET' || subject.startsWith('=#') || subject.startsWith('+')) {
        return '';
    }

    // Subject is valid, add about attribute
    const expanded = expandIRI(subject, state.ctx);
    const subjectNode = state.df.namedNode(expanded);
    const shortened = shortenIRI(expanded, state.ctx);
    attrs.push(`about="${escapeHtml(shortened)}"`);

    // Types
    if (carrier.types && carrier.types.length > 0) {
        const types = carrier.types.map(t => {
            const iri = typeof t === 'string' ? t : t.iri;
            const expanded = expandIRI(iri, state.ctx);
            const typeNode = state.df.namedNode(expanded);

            // Track type quads in strict mode
            if (state.strict && state.quads) {
                const rdfType = state.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                if (quadExists(state.quads, subjectNode, rdfType, typeNode)) {
                    trackableQuads.push({ subject: subjectNode, predicate: rdfType, object: typeNode });
                }
            }

            return shortenIRI(expanded, state.ctx);
        }).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }

    // Predicates using shared utility
    if (carrier.predicates && carrier.predicates.length > 0) {
        const { literalProps, objectProps, reverseProps } = processPredicates(carrier.predicates, state.ctx);

        if (literalProps.length > 0) {
            // Track literal property quads
            if (state.strict && state.quads && element.content) {
                literalProps.forEach(prop => {
                    const predNode = state.df.namedNode(expandIRI(prop, state.ctx));
                    const objNode = state.df.literal(element.content);
                    if (quadExists(state.quads, subjectNode, predNode, objNode)) {
                        trackableQuads.push({ subject: subjectNode, predicate: predNode, object: objNode });
                    }
                });
            }
            attrs.push(`property="${escapeHtml(literalProps.join(' '))}"`);
        }
        if (objectProps.length > 0) {
            attrs.push(`rel="${escapeHtml(objectProps.join(' '))}"`);
        }
        if (reverseProps.length > 0) {
            attrs.push(`rev="${escapeHtml(reverseProps.join(' '))}"`);
        }
    }

    // Track rendered RDFa in strict mode
    if (state.strict && trackableQuads.length > 0) {
        state.quadMap.push(...trackableQuads);
        state.renderedRDFaCount += trackableQuads.length;
    }

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

/**
 * Build RDFa attributes from block
 */
function buildRDFaAttrsFromBlock(block, ctx) {
    const attrs = [];

    // Subject
    if (block.subject && block.subject !== 'RESET' && !block.subject.startsWith('=#') && !block.subject.startsWith('+')) {
        const expanded = expandIRI(block.subject, ctx);
        const shortened = shortenIRI(expanded, ctx);
        attrs.push(`about="${escapeHtml(shortened)}"`);
    }

    // Types
    if (block.types && block.types.length > 0) {
        const types = block.types.map(t => {
            const iri = typeof t === 'string' ? t : t.iri;
            const expanded = expandIRI(iri, ctx);
            return shortenIRI(expanded, ctx);
        }).join(' ');
        attrs.push(`typeof="${escapeHtml(types)}"`);
    }

    // Predicates using shared utility
    if (block.predicates && block.predicates.length > 0) {
        const { literalProps, objectProps, reverseProps } = processPredicates(block.predicates, ctx);

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

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
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
