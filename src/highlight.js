/**
 * MD-LD Syntax Highlighter
 * 
 * A performant, token-based syntax highlighter for MD-LD (Markdown Linked Data).
 * Uses simple string operations rather than complex grammars for reliability
 * and maintainability.
 * 
 * Features:
 * - Token-based parsing with string operations
 * - Markdown formatting support with semantic distinction
 * - Lookahead detection for legal value carriers
 * - Orange semantic markers vs default markdown spans
 * - Annotation, value carrier, and heading highlighting
 */

import { DEFAULT_CONTEXT } from './constants.js';

// HTML escaping function
export function escapeHtml(s) {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// Token color scheme
export const TOKEN_COLORS = {
    text: '#6b7280',          // Grayscale - main text
    marker: '#f97316',        // Orange - .?!^^@
    retraction: '#dc2626',    // Red - whole predicate with -
    value: '#eab308',         // Yellow - values in []
    annotation: '#4b5563'     // Darker gray - annotation braces
};

// Check if markdown formatting has following annotation
function hasFollowingAnnotation(code, endPos) {
    let i = endPos;
    // Skip all non-newline characters to find annotation on same line
    while (i < code.length && code[i] !== '\n' && code[i] !== '\r') {
        if (code[i] === '{') {
            return true;
        }
        i++;
    }
    return false;
}

// Process markdown formatting at specific position for non-bracket text
function processMarkdownFormattingAtPosition(code, startPos) {
    const char = code[startPos];

    // Check for **bold**
    if (char === '*' && startPos + 1 < code.length && code[startPos + 1] === '*') {
        const endPos = code.indexOf('**', startPos + 2);
        if (endPos !== -1) {
            const content = code.slice(startPos + 2, endPos);
            const hasAnnotation = hasFollowingAnnotation(code, endPos + 2);
            const color = hasAnnotation ? ` style="color: ${TOKEN_COLORS.marker}"` : '';
            return {
                html: `<span${color}>**</span><strong>${escapeHtml(content)}</strong><span${color}>**</span>`,
                nextIndex: endPos + 2
            };
        }
    }

    // Check for __bold__
    if (char === '_' && startPos + 1 < code.length && code[startPos + 1] === '_') {
        const endPos = code.indexOf('__', startPos + 2);
        if (endPos !== -1) {
            const content = code.slice(startPos + 2, endPos);
            const hasAnnotation = hasFollowingAnnotation(code, endPos + 2);
            const color = hasAnnotation ? ` style="color: ${TOKEN_COLORS.marker}"` : '';
            return {
                html: `<span${color}>__</span><strong>${escapeHtml(content)}</strong><span${color}>__</span>`,
                nextIndex: endPos + 2
            };
        }
    }

    // Check for *italic*
    if (char === '*') {
        const endPos = code.indexOf('*', startPos + 1);
        if (endPos !== -1) {
            const content = code.slice(startPos + 1, endPos);
            const hasAnnotation = hasFollowingAnnotation(code, endPos + 1);
            const color = hasAnnotation ? ` style="color: ${TOKEN_COLORS.marker}"` : '';
            return {
                html: `<span${color}>*</span><em>${escapeHtml(content)}</em><span${color}>*</span>`,
                nextIndex: endPos + 1
            };
        }
    }

    // Check for _italic_
    if (char === '_') {
        const endPos = code.indexOf('_', startPos + 1);
        if (endPos !== -1) {
            const content = code.slice(startPos + 1, endPos);
            const hasAnnotation = hasFollowingAnnotation(code, endPos + 1);
            const color = hasAnnotation ? ` style="color: ${TOKEN_COLORS.marker}"` : '';
            return {
                html: `<span${color}>_</span><em>${escapeHtml(content)}</em><span${color}>_</span>`,
                nextIndex: endPos + 1
            };
        }
    }

    // Check for `code`
    if (char === '`') {
        const endPos = code.indexOf('`', startPos + 1);
        if (endPos !== -1) {
            const content = code.slice(startPos + 1, endPos);
            const hasAnnotation = hasFollowingAnnotation(code, endPos + 1);
            const color = hasAnnotation ? ` style="color: ${TOKEN_COLORS.marker}"` : '';
            return {
                html: `<span${color}>\`</span><code style="background-color:#7773">${escapeHtml(content)}</code><span${color}>\`</span>`,
                nextIndex: endPos + 1
            };
        }
    }

    return null;
}

// IRI to color mapping with deterministic hashing and subtle tints
export const colorCache = new Map();

export function hashIRI(iri) {
    let hash = 0;
    for (let i = 0; i < iri.length; i++) {
        const char = iri.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

export function getIRIColor(iri) {
    if (colorCache.has(iri)) {
        return colorCache.get(iri);
    }

    const hash = hashIRI(iri);
    // Use hue from hash, but keep saturation and lightness low for subtle tints
    const hue = hash % 360;
    const saturation = 15 + (hash % 10); // 15-25% saturation (very subtle)
    const lightness = 45 + (hash % 10);  // 45-55% lightness (medium gray range)

    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    colorCache.set(iri, color);
    return color;
}

// Extract declared prefixes with IRI resolution for CURIE coloring
function extractPrefixes(code) {
    const prefixes = new Map(); // prefix -> IRI
    // Match [prefix] <...> declarations
    const prefixRegex = /^\[(\w+)\]\s*<([^>]*)>\s*$/gm;
    let match;
    while ((match = prefixRegex.exec(code)) !== null) {
        const prefixName = match[1];
        let iri = match[2];

        // Resolve folded prefixes (check if IRI contains CURIE)
        if (iri.includes(':')) {
            const colonIndex = iri.indexOf(':');
            if (colonIndex > 0) {
                const refPrefix = iri.slice(0, colonIndex);
                const refSuffix = iri.slice(colonIndex + 1);

                // Check if referenced prefix is already declared
                if (prefixes.has(refPrefix)) {
                    const baseIRI = prefixes.get(refPrefix);
                    iri = baseIRI + refSuffix;
                }
                // If not declared, treat as literal string (as per spec)
            }
        }

        prefixes.set(prefixName, iri);
    }
    // Merge built-in prefixes (skip the special @vocab key)
    for (const [key, iri] of Object.entries(DEFAULT_CONTEXT)) {
        if (key !== '@vocab') prefixes.set(key, iri);
    }
    return prefixes;
}

// Render a CURIE or plain term with IRI-based transitive coloring
function renderTerm(part, isRetracted, prefixes) {
    const baseColor = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;

    // Try to split as CURIE: prefix:local
    const colonIndex = part.indexOf(':');
    if (colonIndex > 0) {
        const prefix = part.slice(0, colonIndex);
        const local = part.slice(colonIndex + 1);
        if (prefixes.has(prefix)) {
            const prefixIRI = prefixes.get(prefix);
            const prefixColor = getIRIColor(prefixIRI);
            const fullIRI = prefixIRI + local;
            const localColor = getIRIColor(fullIRI);

            return `<span style="color: ${prefixColor}">${escapeHtml(prefix)}</span>` +
                `<span style="color: ${TOKEN_COLORS.marker}">:</span>` +
                `<span data-iri="${fullIRI}" style="color: ${localColor}">${escapeHtml(local)}</span> `;
        }
    }

    // Plain term or unknown CURIE - try as full IRI
    if (part.startsWith('http:') || part.startsWith('https:') || part.startsWith('tag:') || part.startsWith('urn:')) {
        const iriColor = getIRIColor(part);
        return `<span style="color: ${iriColor}">${escapeHtml(part)}</span> `;
    }

    // Fallback to base color
    return `<span style="color: ${baseColor}">${escapeHtml(part)}</span> `;
}

// Parse an annotation token { ... }
function parseAnnotation(content, prefixes) {
    const parts = content.trim().split(/\s+/);
    let result = '';
    let nextTermIsRetracted = false;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        // Check for subject markers (= or +)
        if (part.startsWith('=') || part.startsWith('+')) {
            const marker = part[0]; // = or +
            const rest = part.slice(1); // the rest of the subject
            result += `<span style="color: ${TOKEN_COLORS.marker}">${escapeHtml(marker)}</span>${renderTerm(rest, false, prefixes)}`;
            continue;
        }

        // Check for retraction marker (-)
        if (part === '-') {
            nextTermIsRetracted = true;
            result += `<span style="color: ${TOKEN_COLORS.retraction}">${escapeHtml(part)}</span> `;
            continue;
        }

        // Handle case where - and predicate are combined (e.g., -predicate)
        if (part.startsWith('-') && part.length > 1) {
            result += `<span style="color: ${TOKEN_COLORS.retraction}">${escapeHtml(part)}</span> `;
            continue;
        }

        // Apply retraction color to the immediate next term only
        const isRetracted = nextTermIsRetracted;
        nextTermIsRetracted = false; // Reset after one term

        // Check for object markers (? or !)
        if (part.startsWith('?') || part.startsWith('!')) {
            const marker = part[0]; // ? or !
            const rest = part.slice(1); // the CURIE or rest of the term
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
            continue;
        }

        // Check for datatype markers (^^, @)
        if (part.startsWith('^^')) {
            const marker = '^^'; // the datatype marker
            const rest = part.slice(2); // the datatype
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
            continue;
        }

        if (part.startsWith('@')) {
            const marker = '@'; // the language marker
            const rest = part.slice(1); // the language code
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
            continue;
        }

        // Check for type marker (.)
        if (part.startsWith('.')) {
            const marker = '.'; // the dot
            const rest = part.slice(1); // the class name
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
            continue;
        }

        // Regular CURIE or IRI
        result += renderTerm(part, isRetracted, prefixes);
    }

    return result.trim();
}

// Main MDLD syntax highlighting function
export function highlightMDLD(code) {
    const prefixes = extractPrefixes(code);
    let result = '';
    let i = 0;

    while (i < code.length) {
        const char = code[i];

        // Handle annotation blocks { ... }
        if (char === '{') {
            const endIdx = code.indexOf('}', i);
            if (endIdx === -1) {
                // No closing brace, treat as regular text
                result += escapeHtml(char);
                i++;
                continue;
            }

            const content = code.slice(i + 1, endIdx);
            const parsed = parseAnnotation(content, prefixes);

            result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>`;
            result += parsed;
            result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span>`;

            i = endIdx + 1;
            continue;
        }

        // Handle prefix declarations [prefix] <...> (before value carriers)
        if (char === '[') {
            const endBracket = code.indexOf(']', i);
            if (endBracket === -1) {
                result += escapeHtml(char);
                i++;
                continue;
            }

            const prefixName = code.slice(i + 1, endBracket);
            // Look ahead for the IRI part
            let j = endBracket + 1;
            while (j < code.length && /\s/.test(code[j])) j++;

            if (j < code.length && code[j] === '<') {
                const iriEnd = code.indexOf('>', j);
                if (iriEnd !== -1) {
                    const iriContent = code.slice(j + 1, iriEnd);
                    const prefixColor = prefixes.has(prefixName) ? getIRIColor(prefixes.get(prefixName)) : TOKEN_COLORS.text;

                    result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">[</span>` +
                        `<span style="color: ${prefixColor}">${escapeHtml(prefixName)}</span>` +
                        `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">]</span> ` +
                        `<span style="color: ${TOKEN_COLORS.text}; opacity: 0.6">&lt;${escapeHtml(iriContent)}&gt;</span>`;

                    i = iriEnd + 1;
                    continue;
                }
            }

            // Fallback: treat as value carrier
            const content = code.slice(i + 1, endBracket);
            const hasAnnotation = hasFollowingAnnotation(code, endBracket + 1);
            // Only make brackets orange if this is a legal value carrier (has following annotation)
            const bracketColor = hasAnnotation ? TOKEN_COLORS.marker : TOKEN_COLORS.value;
            // Content always stays default text color with full opacity, no markdown formatting coloring
            const escapedContent = escapeHtml(content);
            result += `<span style="color: ${bracketColor}; opacity: 0.85">[</span>` +
                `<span style=" opacity: 1.0">${escapedContent}</span>` +
                `<span style="color: ${bracketColor}; opacity: 0.85">]</span>`;

            i = endBracket + 1;
            continue;
        }

        // Handle markdown formatting outside brackets
        if (char === '*' || char === '_' || char === '`') {
            const processed = processMarkdownFormattingAtPosition(code, i);
            if (processed) {
                result += processed.html;
                i = processed.nextIndex;
                continue;
            }
        }

        // Handle markdown headers
        if (char === '#') {
            let hashCount = 0;
            let j = i;
            while (j < code.length && code[j] === '#') {
                hashCount++;
                j++;
            }

            if (hashCount <= 6 && (j >= code.length || code[j] === ' ' || code[j] === '\t')) {
                // Find end of line
                const lineEnd = code.indexOf('\n', j);
                const endIdx = lineEnd === -1 ? code.length : lineEnd;
                const headerText = code.slice(j, endIdx).trim();

                // Process heading text for annotations
                let processedHeaderText = '';
                let lastIndex = 0;

                // Find and process annotations in heading text
                let annotationStart = headerText.indexOf('{');
                while (annotationStart !== -1) {
                    const annotationEnd = headerText.indexOf('}', annotationStart);
                    if (annotationEnd === -1) break;

                    // Add text before annotation (escaped)
                    const beforeText = headerText.slice(lastIndex, annotationStart);
                    processedHeaderText += escapeHtml(beforeText);

                    // Process annotation content
                    const annotationContent = headerText.slice(annotationStart + 1, annotationEnd);
                    const parsedAnnotation = parseAnnotation(annotationContent, prefixes);

                    // Add annotation HTML
                    processedHeaderText += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>` +
                        parsedAnnotation +
                        `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span>`;

                    lastIndex = annotationEnd + 1;
                    annotationStart = headerText.indexOf('{', lastIndex);
                }

                // Add remaining text after last annotation (escaped)
                processedHeaderText += escapeHtml(headerText.slice(lastIndex));

                // Check if heading is legal (has annotation)
                const hasAnnotation = headerText.includes('{') && headerText.includes('}');
                const headingTag = `h${hashCount}`;
                const headingStyle = `margin: 0; font-weight: 600;`;
                const hashes = '#'.repeat(hashCount);

                // Only color # markers orange if heading is legal (has annotation)
                const hashColor = hasAnnotation ? `color: ${TOKEN_COLORS.marker}; opacity: 0.8` : '';
                result += `<${headingTag} style="${headingStyle}"><span style="${hashColor}">${hashes}</span> ${processedHeaderText}</${headingTag}>`;

                i = endIdx;
                continue;
            }
        }

        // Handle list markers (-, *)
        if (char === '-' || char === '*') {
            // Check if this is a list marker (at start of line or after whitespace)
            const prevChar = i > 0 ? code[i - 1] : '\n';
            const isAtLineStart = prevChar === '\n' || prevChar === '\r';
            const isAfterSpace = prevChar === ' ' || prevChar === '\t';

            if (isAtLineStart || isAfterSpace) {
                // Check if followed by space and has annotation
                const nextChar = code[i + 1];
                if (nextChar === ' ') {
                    const hasAnnotation = hasFollowingAnnotation(code, i + 2);
                    const markerColor = hasAnnotation ? `color: ${TOKEN_COLORS.marker}; opacity: 0.85` : '';
                    result += `<span style="${markerColor}">${escapeHtml(char)}</span>`;
                    i++;
                    continue;
                }
            }
        }

        // Handle blockquotes (>)
        if (char === '>') {
            // Check if this is a blockquote marker (at start of line or after whitespace)
            const prevChar = i > 0 ? code[i - 1] : '\n';
            const isAtLineStart = prevChar === '\n' || prevChar === '\r';
            const isAfterSpace = prevChar === ' ' || prevChar === '\t';

            if (isAtLineStart || isAfterSpace) {
                // Check if followed by space and has annotation
                const nextChar = code[i + 1];
                if (nextChar === ' ') {
                    const hasAnnotation = hasFollowingAnnotation(code, i + 2);
                    const markerColor = hasAnnotation ? `color: ${TOKEN_COLORS.marker}; opacity: 0.85` : '';
                    result += `<span style="${markerColor}">${escapeHtml(char)}</span>`;
                    i++;
                    continue;
                }
            }
        }

        // Regular text
        result += escapeHtml(char);
        i++;
    }

    return result;
}
