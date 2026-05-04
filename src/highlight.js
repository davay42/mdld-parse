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
    value: '#f97316',         // Yellow - values in []
    annotation: '#4b5563'     // Darker gray - annotation braces
};

// Check if markdown formatting has following annotation
function hasFollowingAnnotation(code, endPos) {
    let i = endPos;
    while (i < code.length && /\s/.test(code[i])) {
        i++;
    }
    return i < code.length && code[i] === '{';
}

// Process markdown formatting in text while preserving original syntax
export function processMarkdownFormatting(text, hasFollowingAnnotation = false) {
    let result = escapeHtml(text);
    
    if (hasFollowingAnnotation) {
        // Orange for legal value carriers (with following annotation)
        result = result.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${TOKEN_COLORS.marker}">$1</strong>`);
        result = result.replace(/__(.*?)__/g, `<strong style="color: ${TOKEN_COLORS.marker}">$1</strong>`);
        result = result.replace(/\*(.*?)\*/g, `<em style="color: ${TOKEN_COLORS.marker}">$1</em>`);
        result = result.replace(/_(.*?)_/g, `<em style="color: ${TOKEN_COLORS.marker}">$1</em>`);
        result = result.replace(/`(.*?)`/g, `<code style="color: ${TOKEN_COLORS.marker}">$1</code>`);
    } else {
        // Default browser styles for regular markdown spans
        result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');
        result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
        result = result.replace(/_(.*?)_/g, '<em>$1</em>');
        result = result.replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    return result;
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
                html: `<strong${color}>**${escapeHtml(content)}**</strong>`,
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
                html: `<strong${color}>__${escapeHtml(content)}__</strong>`,
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
                html: `<em${color}>*${escapeHtml(content)}*</em>`,
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
                html: `<em${color}>_${escapeHtml(content)}_</em>`,
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
                html: `<code${color}>\`${escapeHtml(content)}\`</code>`,
                nextIndex: endPos + 1
            };
        }
    }
    
    return null;
}

// Parse an annotation token { ... }
function parseAnnotation(content) {
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
            result += `<span style="color: ${TOKEN_COLORS.marker}">${escapeHtml(marker)}</span><span style="color: ${TOKEN_COLORS.text}">${escapeHtml(rest)}</span> `;
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
            const textColor = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span><span style="color: ${textColor}">${escapeHtml(rest)}</span> `;
            continue;
        }

        // Check for datatype markers (^^, @)
        if (part.startsWith('^^')) {
            const marker = '^^'; // the datatype marker
            const rest = part.slice(2); // the datatype
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            const textColor = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span><span style="color: ${textColor}">${escapeHtml(rest)}</span> `;
            continue;
        }
        
        if (part.startsWith('@')) {
            const marker = '@'; // the language marker
            const rest = part.slice(1); // the language code
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            const textColor = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span><span style="color: ${textColor}">${escapeHtml(rest)}</span> `;
            continue;
        }

        // Check for type marker (.)
        if (part.startsWith('.')) {
            const marker = '.'; // the dot
            const rest = part.slice(1); // the class name
            const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
            const textColor = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;
            result += `<span style="color: ${color}">${escapeHtml(marker)}</span><span style="color: ${textColor}">${escapeHtml(rest)}</span> `;
            continue;
        }

        // Regular CURIE or IRI
        const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;
        result += `<span style="color: ${color}">${escapeHtml(part)}</span> `;
    }

    return result.trim();
}

// Main MDLD syntax highlighting function
export function highlightMDLD(code) {
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
            const parsed = parseAnnotation(content);
            
            result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>`;
            result += parsed;
            result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span>`;
            
            i = endIdx + 1;
            continue;
        }

        // Handle value carriers [ ... ] and markdown formatting
        if (char === '[') {
            const endIdx = code.indexOf(']', i);
            if (endIdx === -1) {
                // No closing bracket, treat as regular text
                result += escapeHtml(char);
                i++;
                continue;
            }

            const content = code.slice(i + 1, endIdx);
            const hasAnnotation = hasFollowingAnnotation(code, endIdx + 1);
            const processedContent = processMarkdownFormatting(content, hasAnnotation);
            result += `<span style="color: ${TOKEN_COLORS.value}; opacity: 0.85">[${processedContent}]</span>`;
            
            i = endIdx + 1;
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

        // Handle prefix declarations < ... >
        if (char === '<') {
            const endIdx = code.indexOf('>', i);
            if (endIdx === -1) {
                result += escapeHtml(char);
                i++;
                continue;
            }

            const content = code.slice(i + 1, endIdx);
            result += `<span style="color: ${TOKEN_COLORS.text}; opacity: 0.6">&lt;${escapeHtml(content)}&gt;</span>`;
            
            i = endIdx + 1;
            continue;
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
                    const parsedAnnotation = parseAnnotation(annotationContent);
                    
                    // Add annotation HTML
                    processedHeaderText += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>` +
                        parsedAnnotation +
                        `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span>`;
                    
                    lastIndex = annotationEnd + 1;
                    annotationStart = headerText.indexOf('{', lastIndex);
                }
                
                // Add remaining text after last annotation (escaped)
                processedHeaderText += escapeHtml(headerText.slice(lastIndex));

                // Create HTML heading that preserves the original markdown syntax
                const headingTag = `h${hashCount}`;
                const headingStyle = `margin: 0.5em 0; font-weight: 600;`;
                const hashes = '#'.repeat(hashCount);
                result += `<${headingTag} style="${headingStyle}"><span style="color: ${TOKEN_COLORS.marker}; opacity: 0.8">${hashes}</span> ${processedHeaderText}</${headingTag}>`;

                i = endIdx;
                continue;
            }
        }

        // Regular text
        result += escapeHtml(char);
        i++;
    }

    return result;
}
