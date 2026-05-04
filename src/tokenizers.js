/**
 * Character-based Tokenizers for MDLD
 * 
 * Replaces regex patterns with direct character scanning for better performance.
 * Each tokenizer follows the EBNF grammar exactly.
 */

// ============================================================================
// BLOCK-LEVEL TOKENIZERS (Line-based)
// ============================================================================

/**
 * Detect code fence: 3+ backticks or tildes at line start
 * EBNF: backticks = "`", "`", "`", { "`" } | tildes = "~", "~", "~", { "~" }
 */
export function detectFence(line) {
    if (line.length < 3) return null;

    const char = line[0];
    if (char !== '`' && char !== '~') return null;

    // Count consecutive fence characters
    let count = 1;
    while (count < line.length && line[count] === char) {
        count++;
    }

    if (count < 3) return null;

    // Extract info string (everything after fence chars)
    const rest = line.slice(count).trimStart();
    const infoString = rest;

    // Parse info string for language and attributes
    const langMatch = infoString.match(/^([^\s{]+)/);
    const lang = langMatch ? langMatch[1] : '';

    // Find attributes in info string
    const attrsMatch = infoString.match(/\{([^}]+)\}/);
    const attrs = attrsMatch ? attrsMatch[1] : null;

    return {
        fenceChar: char,
        fenceLength: count,
        lang,
        attrs,
        infoString
    };
}

/**
 * Detect prefix declaration: [prefix] <IRI>
 * EBNF: contextDecl = "[", contextKey, "]", whitespace, "<", contextIri, ">"
 */
export function detectPrefix(line) {
    if (line[0] !== '[') return null;

    // Find closing bracket
    const closeBracket = line.indexOf(']', 1);
    if (closeBracket === -1) return null;

    const prefix = line.slice(1, closeBracket).trim();
    if (!prefix) return null;

    // Find < after bracket (skip whitespace)
    let pos = closeBracket + 1;
    while (pos < line.length && (line[pos] === ' ' || line[pos] === '\t')) {
        pos++;
    }

    if (pos >= line.length || line[pos] !== '<') return null;

    // Find closing >
    const closeAngle = line.indexOf('>', pos + 1);
    if (closeAngle === -1) return null;

    const iri = line.slice(pos + 1, closeAngle).trim();
    if (!iri) return null;

    return { prefix, iri };
}

/**
 * Detect heading: 1-6 # characters followed by space and text
 * EBNF: heading = "#", { "#" }, whitespace, text
 */
export function detectHeading(line) {
    if (line[0] !== '#') return null;

    // Count # characters (max 6)
    let depth = 1;
    while (depth < line.length && depth < 6 && line[depth] === '#') {
        depth++;
    }

    // Must be followed by whitespace
    if (depth >= line.length || (line[depth] !== ' ' && line[depth] !== '\t')) {
        return null;
    }

    // Extract content (skip # and whitespace)
    let contentStart = depth;
    while (contentStart < line.length && (line[contentStart] === ' ' || line[contentStart] === '\t')) {
        contentStart++;
    }

    // Check for trailing attributes {=...} or {...}
    const trimmed = line.slice(contentStart);
    const attrsMatch = trimmed.match(/\s*\{([^}]+)\}\s*$/);

    let content = trimmed;
    let attrs = null;

    if (attrsMatch) {
        attrs = attrsMatch[1];
        content = trimmed.slice(0, -attrsMatch[0].length).trim();
    }

    return { depth, content, attrs };
}

/**
 * Detect list item: -, *, +, or digits followed by .
 * EBNF: listMarker = "-" | "*" | "+" | digit, { digit }, "."
 */
export function detectList(line) {
    // Skip leading whitespace for indentation detection
    let pos = 0;
    while (pos < line.length && (line[pos] === ' ' || line[pos] === '\t')) {
        pos++;
    }

    const indent = pos;
    if (pos >= line.length) return null;

    const char = line[pos];
    let marker;
    let contentStart = pos + 1;

    if (char === '-' || char === '*' || char === '+') {
        marker = char;
    } else if (char >= '0' && char <= '9') {
        // Ordered list: digits followed by .
        let numEnd = pos + 1;
        while (numEnd < line.length && line[numEnd] >= '0' && line[numEnd] <= '9') {
            numEnd++;
        }
        if (numEnd >= line.length || line[numEnd] !== '.') return null;
        marker = line.slice(pos, numEnd + 1);
        contentStart = numEnd + 1;
    } else {
        return null;
    }

    // Must be followed by whitespace
    if (contentStart >= line.length || (line[contentStart] !== ' ' && line[contentStart] !== '\t')) {
        return null;
    }

    // Skip whitespace after marker
    while (contentStart < line.length && (line[contentStart] === ' ' || line[contentStart] === '\t')) {
        contentStart++;
    }

    // Extract content and check for trailing attributes
    let content = line.slice(contentStart);
    let attrs = null;

    const attrsMatch = content.match(/\s*\{([^}]+)\}\s*$/);
    if (attrsMatch) {
        attrs = attrsMatch[1];
        content = content.slice(0, -attrsMatch[0].length).trim();
    }

    return { indent, marker, content, attrs };
}

/**
 * Detect blockquote: > followed by space and text
 * EBNF: blockquote = ">", whitespace, text
 */
export function detectBlockquote(line) {
    if (line[0] !== '>') return null;

    // Must be followed by whitespace or end of line
    if (line.length > 1 && line[1] !== ' ' && line[1] !== '\t') {
        return null;
    }

    // Extract content
    let contentStart = 1;
    while (contentStart < line.length && (line[contentStart] === ' ' || line[contentStart] === '\t')) {
        contentStart++;
    }

    let content = line.slice(contentStart);
    let attrs = null;

    // Check for trailing attributes
    const attrsMatch = content.match(/\s*\{([^}]+)\}\s*$/);
    if (attrsMatch) {
        attrs = attrsMatch[1];
        content = content.slice(0, -attrsMatch[0].length).trim();
    }

    return { content, attrs };
}

/**
 * Detect standalone subject: {=...} with optional whitespace
 * EBNF: standaloneSubject = whitespace*, "{", "=", ( iriRef | "#", fragment ), "}", whitespace*
 */
export function detectStandaloneSubject(line) {
    let pos = 0;

    // Skip leading whitespace
    while (pos < line.length && (line[pos] === ' ' || line[pos] === '\t')) {
        pos++;
    }

    if (pos >= line.length || line[pos] !== '{') return null;
    pos++;

    if (pos >= line.length || line[pos] !== '=') return null;
    pos++;

    // Extract content until }
    const contentStart = pos;
    let braceCount = 1;

    while (pos < line.length && braceCount > 0) {
        if (line[pos] === '{') braceCount++;
        if (line[pos] === '}') braceCount--;
        if (braceCount > 0) pos++;
    }

    if (braceCount > 0) return null; // No closing brace

    const content = line.slice(contentStart, pos).trim();

    // Skip trailing whitespace
    pos++;
    while (pos < line.length && (line[pos] === ' ' || line[pos] === '\t')) {
        pos++;
    }

    // Must consume entire line (after optional trailing whitespace)
    if (pos < line.length) return null;

    return { content };
}

// ============================================================================
// INLINE CARRIER TOKENIZERS (Character-based within block content)
// ============================================================================

/**
 * Find matching closing bracket, accounting for nesting
 */
export function findMatchingBracket(text, startPos, openChar = '[', closeChar = ']') {
    let depth = 1;
    let pos = startPos + 1;

    while (pos < text.length && depth > 0) {
        if (text[pos] === openChar) depth++;
        if (text[pos] === closeChar) depth--;
        if (depth > 0) pos++;
    }

    return depth === 0 ? pos : null;
}

/**
 * Extract attributes block after a position: {...}
 */
export function extractAttributes(text, startPos) {
    let pos = startPos;

    // Skip whitespace
    while (pos < text.length && (text[pos] === ' ' || text[pos] === '\t')) {
        pos++;
    }

    if (pos >= text.length || text[pos] !== '{') return null;

    // Find closing brace (simple version - no nesting for attribute blocks)
    const closeBrace = text.indexOf('}', pos + 1);
    if (closeBrace === -1) return null;

    const attrs = text.slice(pos + 1, closeBrace);
    const endPos = closeBrace + 1;

    return { attrs, endPos };
}

/**
 * Detect URL in angle brackets: <URL>
 * Returns null if not a valid URL per EBNF scheme rules
 */
export function detectAngleBracketUrl(text, startPos) {
    if (text[startPos] !== '<') return null;

    const closeAngle = text.indexOf('>', startPos + 1);
    if (closeAngle === -1) return null;

    const url = text.slice(startPos + 1, closeAngle).trim();

    // Validate URL scheme (letter followed by letters/digits/+/ - /.)
    const schemeMatch = url.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/);
    if (!schemeMatch) return null;

    return { url, endPos: closeAngle + 1 };
}

/**
 * Detect emphasis/strong spans: *text* or _text_
 * EBNF: emphasisSpan = "*", text, "*" | "_", text, "_"
 *       strongSpan = "**", text, "**" | "__", text, "__"
 */
export function detectEmphasis(text, startPos) {
    const char = text[startPos];
    if (char !== '*' && char !== '_') return null;

    // Count delimiter characters
    let delimCount = 1;
    while (startPos + delimCount < text.length &&
        text[startPos + delimCount] === char) {
        delimCount++;
    }

    if (delimCount > 2) return null; // Only 1 or 2 allowed

    const type = delimCount === 1 ? 'emphasis' : 'strong';
    const closer = char.repeat(delimCount);

    // Find closing delimiter
    const contentStart = startPos + delimCount;
    let pos = contentStart;

    while (pos < text.length) {
        // Check for closing delimiter
        if (text.slice(pos, pos + delimCount) === closer) {
            // Must not be followed by same char (would be longer delimiter)
            if (pos + delimCount < text.length && text[pos + delimCount] === char) {
                pos++;
                continue;
            }

            const content = text.slice(contentStart, pos);
            const endPos = pos + delimCount;

            // Check for attributes after
            const attrsResult = extractAttributes(text, endPos);
            const finalPos = attrsResult ? attrsResult.endPos : endPos;

            return {
                type,
                content,
                attrs: attrsResult?.attrs || null,
                endPos: finalPos,
                contentEnd: endPos
            };
        }
        pos++;
    }

    return null; // No closing delimiter found
}

/**
 * Detect code span: `text` or ``text``
 * EBNF: codeSpan = "`", text, "`" | "``", text, "``"
 */
export function detectCodeSpan(text, startPos) {
    if (text[startPos] !== '`') return null;

    // Count opening backticks
    let backtickCount = 1;
    while (startPos + backtickCount < text.length &&
        text[startPos + backtickCount] === '`') {
        backtickCount++;
    }

    if (backtickCount > 2) return null; // Only 1 or 2 allowed in current grammar

    const opener = '`'.repeat(backtickCount);
    const contentStart = startPos + backtickCount;

    // Find closing backticks
    let pos = contentStart;

    while (pos < text.length) {
        if (text.slice(pos, pos + backtickCount) === opener) {
            const content = text.slice(contentStart, pos);
            const endPos = pos + backtickCount;

            // Check for attributes after
            const attrsResult = extractAttributes(text, endPos);
            const finalPos = attrsResult ? attrsResult.endPos : endPos;

            return {
                type: 'code',
                content,
                attrs: attrsResult?.attrs || null,
                endPos: finalPos,
                contentEnd: endPos
            };
        }
        pos++;
    }

    return null;
}

/**
 * Detect bracket link: [text](url) or [text]{...} or [text] alone
 * EBNF: linkSpan = "[", text, "](", text, ")" | "[", text, "]"
 */
export function detectBracketLink(text, startPos) {
    if (text[startPos] !== '[') return null;

    const bracketEnd = findMatchingBracket(text, startPos, '[', ']');
    if (!bracketEnd) return null;

    const linkText = text.slice(startPos + 1, bracketEnd);
    let pos = bracketEnd + 1;
    let url = null;

    // Check for (url) after ]
    if (pos < text.length && text[pos] === '(') {
        const parenEnd = text.indexOf(')', pos + 1);
        if (parenEnd !== -1) {
            url = text.slice(pos + 1, parenEnd);
            pos = parenEnd + 1;
        }
    } else if (pos < text.length && text[pos] === '<') {
        // Check for <url> after ]
        const closeAngle = text.indexOf('>', pos + 1);
        if (closeAngle !== -1) {
            const angleUrl = text.slice(pos + 1, closeAngle).trim();
            // Validate URL scheme
            const schemeMatch = angleUrl.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/);
            if (schemeMatch) {
                url = angleUrl;
                pos = closeAngle + 1;
            }
        }
    }

    // Check for attributes
    const attrsResult = extractAttributes(text, pos);
    const finalPos = attrsResult ? attrsResult.endPos : pos;

    // Determine carrier type: 'link' if URL present, 'span' otherwise
    const carrierType = url ? 'link' : 'span';

    return {
        type: carrierType,
        text: linkText,
        url,
        attrs: attrsResult?.attrs || null,
        endPos: finalPos,
        bracketEnd: bracketEnd + 1
    };
}

// ============================================================================
// RANGE CALCULATION HELPERS
// ============================================================================

/**
 * Calculate absolute ranges for a token given base offset
 */
export function calcRanges(token, baseOffset) {
    return {
        range: [baseOffset + token.start, baseOffset + token.end],
        valueRange: token.valueStart !== undefined
            ? [baseOffset + token.valueStart, baseOffset + token.valueEnd]
            : null,
        attrsRange: token.attrsStart !== undefined
            ? [baseOffset + token.attrsStart, baseOffset + token.attrsEnd]
            : null
    };
}

// ============================================================================
// COMPLETE INLINE CARRIER SCANNER (replaces extractInlineCarriers)
// ============================================================================

/**
 * Scan text for all inline carriers using character-based detection
 * Memory-optimized version - minimizes object allocations
 */
export function scanInlineCarriers(text, baseOffset = 0) {
    const carriers = [];
    const len = text.length;
    let pos = 0;

    while (pos < len) {
        const char = text[pos];
        let detected = null;

        // Fast path: only check carrier start characters
        switch (char) {
            case '<':
                detected = detectAngleBracketUrl(text, pos);
                if (detected) {
                    const attrsResult = extractAttributes(text, detected.endPos);
                    if (attrsResult) {
                        detected.attrs = attrsResult.attrs;
                        detected.endPos = attrsResult.endPos;
                    }
                    detected.type = 'link';
                    detected.text = detected.url;
                }
                break;

            case '[':
                detected = detectBracketLink(text, pos);
                break;

            case '*':
            case '_':
                detected = detectEmphasis(text, pos);
                break;

            case '`':
                detected = detectCodeSpan(text, pos);
                break;
        }

        if (!detected) {
            pos++;
            continue;
        }

        // Skip annotation-only patterns
        const url = detected.url;
        const type = detected.type;
        const attrs = detected.attrs;

        if (url?.startsWith('=') || (type === 'link' && !attrs && !url)) {
            pos = detected.endPos;
            continue;
        }

        // Calculate ranges once
        const absStart = baseOffset + pos;
        const absEnd = baseOffset + detected.endPos;
        const contentEndOffset = detected.contentEnd || detected.bracketEnd || detected.endPos;
        const absContentEnd = baseOffset + contentEndOffset;

        // Build carrier object with minimal properties
        const carrier = {
            type: type,
            text: detected.content !== undefined ? detected.content : (detected.text !== undefined ? detected.text : url),
            range: [absStart, absEnd],
            valueRange: [absStart + (type === 'url' ? 1 : 0), absContentEnd - (type === 'url' ? 1 : 0)],
            attrs: attrs,
            url: url,
            pos: detected.endPos
        };

        // Only add attrsRange if attrs exist (saves memory for carriers without attrs)
        if (attrs) {
            carrier.attrsRange = [absContentEnd, absEnd];
        }

        carriers.push(carrier);
        pos = detected.endPos;
    }

    return carriers;
}

// ============================================================================
// TESTING EXPORTS (for validation)
// ============================================================================

export const TEST = {
    detectFence,
    detectPrefix,
    detectHeading,
    detectList,
    detectBlockquote,
    detectStandaloneSubject,
    detectAngleBracketUrl,
    detectEmphasis,
    detectCodeSpan,
    detectBracketLink,
    extractAttributes,
    findMatchingBracket,
    scanInlineCarriers
};