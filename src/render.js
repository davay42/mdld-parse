import { parse } from './parse.js';
import { escapeHtml } from './shared.js';

/**
 * Render MD-LD to clean HTML (minimal, no RDFa)
 * 
 * This implementation provides a minimal HTML renderer that:
 * 1. Preserves document structure (headings, paragraphs, lists, etc.)
 * 2. Handles inline formatting (bold, italic, code, links)
 * 3. Strips MDLD annotations from output
 * 4. Uses the same parsing foundation as generate()
 * 
 * @param {string} mdld - MD-LD input string
 * @param {Object} options - Rendering options
 * @param {Object} options.context - Additional context prefixes
 * @returns {Object} Render result with HTML and metadata
 */
export function render(mdld, options = {}) {
    // Parse MD-LD to get structure
    const parsed = parse({ text: mdld, context: options.context || {} });

    // Render to clean HTML
    const html = renderToHTML(parsed, mdld);

    return {
        html,
        context: parsed.context,
        metadata: {
            blockCount: parsed.origin.blocks.size,
            quadCount: parsed.quads.length,
            renderTime: Date.now()
        }
    };
}

/**
 * Render parsed MDLD to clean HTML
 * Uses the md field from parse result (already stripped of annotations)
 */
function renderToHTML(parsed, sourceText) {
    // Use source text and strip only MDLD annotations, preserving markdown formatting
    // The md field from parse strips too much (converts markdown to plain text)
    const cleanMarkdown = stripOnlyMDLDAnnotations(sourceText);

    // Convert markdown to HTML
    return markdownToHTML(cleanMarkdown);
}

/**
 * Strip only MDLD annotations, preserve markdown formatting
 */
function stripOnlyMDLDAnnotations(text) {
    let cleaned = text;

    // Remove prefix declarations
    cleaned = cleaned.replace(/^\[[^\]]+\]\s*<[^>]+>\s*$/gm, '');

    // Remove MDLD annotations from headings (preserve markdown formatting)
    cleaned = cleaned.replace(/^(#{1,6}\s+[^\n]+)\s*\{[^}]*\}\s*$/gm, '$1');

    // Remove MDLD annotations from inline content (preserve markdown formatting)
    cleaned = cleaned.replace(/\s*\{[^}]*\}\s*$/gm, '');

    // Remove soft subject declarations
    cleaned = cleaned.replace(/^\[([^\]]+)\]\s*\{[?!][^}]*\}\s*$/gm, '');

    return cleaned;
}

/**
 * Convert markdown to HTML (minimal implementation)
 */
function markdownToHTML(markdown) {
    let html = markdown;

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Headings
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
        const level = hashes.length;
        return `<h${level}>${escapeHtml(text.trim())}</h${level}>`;
    });

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Lists
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');

    // Inline formatting
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Paragraphs (wrap non-block lines)
    const lines = html.split('\n');
    const output = [];
    let inParagraph = false;

    for (const line of lines) {
        if (line.trim() === '') {
            if (inParagraph) {
                output.push('</p>');
                inParagraph = false;
            }
        } else if (line.match(/^(<h|<pre|<blockquote|<li|<ul)/)) {
            if (inParagraph) {
                output.push('</p>');
                inParagraph = false;
            }
            output.push(line);
        } else {
            if (!inParagraph) {
                output.push('<p>');
                inParagraph = true;
            }
            // Don't escape if line already contains HTML (from markdown conversion)
            if (line.includes('<') && line.includes('>')) {
                output.push(line + ' ');
            } else {
                output.push(escapeHtml(line) + ' ');
            }
        }
    }

    if (inParagraph) {
        output.push('</p>');
    }

    return output.join('\n');
}
