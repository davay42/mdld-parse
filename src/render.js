import { parse } from './parse.js';
import {
  DEFAULT_CONTEXT,
  DataFactory,
  expandIRI,
  shortenIRI,
  parseSemanticBlock,
  hash
} from './utils.js';

/**
 * Render MD-LD to HTML+RDFa
 * @param {string} mdld - MD-LD input string
 * @param {Object} options - Rendering options
 * @param {Object} options.context - Additional context prefixes
 * @param {string} options.baseIRI - Base IRI for relative URLs
 * @param {boolean} options.validate - Enable validation
 * @param {boolean} options.pretty - Pretty print output
 * @returns {Object} Render result with HTML and metadata
 */
export function render(mdld, options = {}) {
  // Phase 1: Parse MD-LD (reuse parser)
  const parsed = parse(mdld, { context: options.context || {} });

  // Phase 2: Build render state
  const state = buildRenderState(parsed, options, mdld);

  // Phase 3: Render blocks to HTML
  const html = renderBlocks(parsed.origin.blocks, state);

  // Phase 4: Wrap with RDFa context
  const wrapped = wrapWithRDFaContext(html, state.ctx);

  return {
    html: wrapped,
    context: state.ctx,
    metadata: {
      blockCount: parsed.origin.blocks.size,
      quadCount: parsed.quads.length,
      renderTime: Date.now()
    }
  };
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
    carrierStack: []
  };
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
 * Get indent level from source text
 */
function getIndentLevel(block, sourceText) {
  if (!block.range || !sourceText) return 0;

  const text = sourceText.substring(block.range.start, block.range.end);
  const indentMatch = text.match(/^(\s*)/);
  return indentMatch ? indentMatch[1].length : 0;
}

/**
 * Render a single block
 */
function renderBlock(block, state) {
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
  // Extract text from source using range information
  if (block.range && state.sourceText) {
    let text = state.sourceText.substring(block.range.start, block.range.end);

    // Remove semantic block annotations from the text
    if (block.attrsRange) {
      const beforeAttrs = text.substring(0, block.attrsRange.start - block.range.start);
      const afterAttrs = text.substring(block.attrsRange.end - block.range.start);
      text = beforeAttrs + afterAttrs;
    }

    // For headings, extract text content from the heading
    if (block.carrierType === 'heading') {
      // Remove heading markers (#) and trim
      const content = text.replace(/^#+\s*/, '').trim();
      state.output.push(escapeHtml(content));
    } else {
      state.output.push(escapeHtml(text.trim()));
    }
  }
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

  // Predicates
  if (block.predicates && block.predicates.length > 0) {
    const literalProps = [];
    const objectProps = [];
    const reverseProps = [];

    block.predicates.forEach(pred => {
      const iri = typeof pred === 'string' ? pred : pred.iri;
      const expanded = expandIRI(iri, ctx);
      const shortened = shortenIRI(expanded, ctx);
      const form = typeof pred === 'string' ? '' : (pred.form || '');

      if (form === '!') {
        reverseProps.push(shortened);
      } else if (form === '?') {
        objectProps.push(shortened);
      } else {
        literalProps.push(shortened);
      }
    });

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

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text || '').replace(/[&<>"']/g, m => map[m]);
}
