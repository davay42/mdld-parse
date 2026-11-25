/**
 * Character-based Tokenizers for MDLD
 * 
 * Replaces regex patterns with direct character scanning for better performance.
 * Each tokenizer follows the EBNF grammar exactly.
 */

// ============================================================================
// BLOCK-LEVEL TOKENIZERS (Line-based)
// ============================================================================

function skipHorizontalWs(text, pos) {
    while (pos < text.length && (text[pos] === ' ' || text[pos] === '\t')) pos++;
    return pos;
}

const isSpaceChar = ch => ch.trim() === '';

function firstAttrs(text) {
    let open = text.indexOf('{');
    while (open !== -1) {
        const close = text.indexOf('}', open + 1);
        if (close === -1) return null;
        if (close > open + 1) return text.slice(open + 1, close);
        open = text.indexOf('{', open + 1);
    }
    return null;
}

function hasUrlScheme(url) {
    const colon = url.indexOf(':');
    if (colon <= 0) return false;
    const first = url.charCodeAt(0);
    if (!((first >= 65 && first <= 90) || (first >= 97 && first <= 122))) return false;
    for (let i = 1; i < colon; i++) {
        const c = url.charCodeAt(i);
        if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 43 || c === 45 || c === 46)) return false;
    }
    return true;
}

function splitTrailingAttrs(text) {
    let end = text.length;
    while (end > 0 && isSpaceChar(text[end - 1])) end--;
    if (end === 0 || text[end - 1] !== '}') return { text, attrs: null };

    const closeIdx = end - 1;
    const prevClose = text.lastIndexOf('}', closeIdx - 1);
    let openIdx = -1;
    for (let i = prevClose + 1; i < closeIdx; i++) {
        if (text[i] === '{') { openIdx = i; break; }
    }
    if (openIdx === -1 || openIdx + 1 === closeIdx) return { text, attrs: null };

    return { text: text.slice(0, openIdx).trim(), attrs: text.slice(openIdx + 1, closeIdx) };
}

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
    let langEnd = 0;
    while (langEnd < infoString.length && infoString[langEnd] !== '{' && !isSpaceChar(infoString[langEnd])) langEnd++;
    const lang = infoString.slice(0, langEnd);
    const attrs = firstAttrs(infoString);

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
    let pos = skipHorizontalWs(line, closeBracket + 1);

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
    const contentStart = skipHorizontalWs(line, depth);

    // Check for trailing attributes {=...} or {...}
    const split = splitTrailingAttrs(line.slice(contentStart));
    let content = split.text;
    const attrs = split.attrs;

    // CommonMark closing sequence: optional spaces + #+ + optional spaces
    content = content.replace(/[ \t]+#+[ \t]*$/, '');
    if (/^#+$/.test(content)) content = '';

    return { depth, content, attrs };
}

/**
 * Detect list item: -, *, +, or digits followed by .
 * EBNF: listMarker = "-" | "*" | "+" | digit, { digit }, "."
 */
export function detectList(line) {
    // Skip leading whitespace for indentation detection
    const pos = skipHorizontalWs(line, 0);

    const indent = pos;
    if (pos >= line.length) return null;

    const char = line[pos];
    let marker;
    let contentStart = pos + 1;

    if (char === '-' || char === '*' || char === '+') {
        marker = char;
    } else if (char >= '0' && char <= '9') {
        // Ordered list: digits followed by . or )
        let numEnd = pos + 1;
        while (numEnd < line.length && line[numEnd] >= '0' && line[numEnd] <= '9') {
            numEnd++;
        }
        if (numEnd >= line.length || (line[numEnd] !== '.' && line[numEnd] !== ')')) return null;
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
    contentStart = skipHorizontalWs(line, contentStart);

    // Extract content and check for trailing attributes
    const split = splitTrailingAttrs(line.slice(contentStart));
    const content = split.text;
    const attrs = split.attrs;

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
    const contentStart = skipHorizontalWs(line, 1);
    const split = splitTrailingAttrs(line.slice(contentStart));
    const content = split.text;
    const attrs = split.attrs;

    return { content, attrs };
}

/**
 * Detect standalone subject: {=...} with optional whitespace
 * EBNF: standaloneSubject = whitespace*, "{", "=", ( iriRef | "#", fragment ), "}", whitespace*
 */
export function detectStandaloneSubject(line) {
    let pos = skipHorizontalWs(line, 0);

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
    pos = skipHorizontalWs(line, pos + 1);

    // Must consume entire line (after optional trailing whitespace)
    if (pos < line.length) return null;

    return { content };
}

// CommonMark HTML block tag names (type 6)
const HTML_BLOCK_TAGS = new Set([
    'address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body',
    'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir',
    'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
    'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem',
    'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'search',
    'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
    'title', 'tr', 'track', 'ul'
]);

// Raw-text elements: block ends at the matching close tag (CommonMark type 1)
const HTML_RAW_TEXT_TAGS = new Set(['script', 'pre', 'style', 'textarea']);

/**
 * Detect indented code block line: 4+ spaces or a tab (CommonMark).
 * Cannot interrupt a paragraph — callers must only check at block start.
 */
export function detectIndentedCode(line) {
    if (line[0] === '\t') return { indent: '\t' };
    if (line[0] === ' ' && line[1] === ' ' && line[2] === ' ' && line[3] === ' ') {
        return { indent: '    ' };
    }
    return null;
}

/**
 * Detect an HTML block start (CommonMark HTML blocks).
 * Returns { tag, closeTag, interrupt } or null.
 * - interrupt: whether the block may interrupt a paragraph (type 7 cannot).
 * - closeTag: if set, the block ends on the line containing this string;
 *   otherwise it ends at the first blank line.
 */
export function detectHtmlBlock(line, interruptOnly = false) {
    const trimmed = line.trim();
    if (trimmed[0] !== '<') return null;

    const m = trimmed.match(/^<(\/?)([A-Za-z][A-Za-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/);
    if (!m) return null;

    const tag = m[2].toLowerCase();
    const closing = m[1] === '/';
    let interrupt = true;
    let closeTag = null;

    if (!closing && HTML_RAW_TEXT_TAGS.has(tag)) {
        closeTag = `</${tag}`;
    } else if (!HTML_BLOCK_TAGS.has(tag)) {
        // Type 7: any other complete open tag alone on its line; cannot
        // interrupt a paragraph.
        if (closing || m[0] !== trimmed) return null;
        interrupt = false;
    }

    if (interruptOnly && !interrupt) return null;
    return { tag, closeTag, interrupt };
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
    const pos = skipHorizontalWs(text, startPos);

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
    if (!hasUrlScheme(url)) return null;

    return {
        url,
        endPos: closeAngle + 1,
        contentStart: startPos + 1,
        contentEnd: closeAngle
    };
}

const UNICODE_PUNCT_RE = /\p{P}/u;
const UNICODE_WS_RE = /\s/;

function isUnicodeWs(ch) {
    return ch === undefined || UNICODE_WS_RE.test(ch);
}

function isUnicodePunct(ch) {
    return ch !== undefined && UNICODE_PUNCT_RE.test(ch);
}

// CommonMark flanking rules for a delimiter run of `char` over [start, start+len)
function delimiterFlags(text, start, len, char) {
    const before = start > 0 ? text[start - 1] : undefined;
    const after = start + len < text.length ? text[start + len] : undefined;

    const leftFlanking = !isUnicodeWs(after) &&
        (!isUnicodePunct(after) || isUnicodeWs(before) || isUnicodePunct(before));
    const rightFlanking = !isUnicodeWs(before) &&
        (!isUnicodePunct(before) || isUnicodeWs(after) || isUnicodePunct(after));

    if (char === '_') {
        return {
            canOpen: leftFlanking && (!rightFlanking || isUnicodePunct(before)),
            canClose: rightFlanking && (!leftFlanking || isUnicodePunct(after))
        };
    }
    return { canOpen: leftFlanking, canClose: rightFlanking };
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

    // The opening run must be able to open emphasis
    if (!delimiterFlags(text, startPos, delimCount, char).canOpen) return null;

    const type = delimCount === 1 ? 'emphasis' : 'strong';
    const contentStart = startPos + delimCount;
    let pos = contentStart;
    let depth = 0;

    while (pos < text.length) {
        if (text[pos] === char) {
            // Measure the full delimiter run at this position
            let runLen = 1;
            while (pos + runLen < text.length && text[pos + runLen] === char) {
                runLen++;
            }

            const flags = delimiterFlags(text, pos, runLen, char);

            if (depth === 0 && flags.canClose && runLen >= delimCount) {
                const content = text.slice(contentStart, pos);
                if (content.length === 0) return null;

                const endPos = pos + delimCount;

                // Check for attributes after
                const attrsResult = extractAttributes(text, endPos);
                const finalPos = attrsResult ? attrsResult.endPos : endPos;

                return {
                    type,
                    content,
                    attrs: attrsResult?.attrs || null,
                    endPos: finalPos,
                    contentStart,
                    contentEnd: pos
                };
            }

            // Nested same-char delimiters: openers push, closers pop —
            // approximates the CommonMark delimiter-stack pairing
            if (flags.canClose) depth = Math.max(0, depth - 1);
            else if (flags.canOpen) depth++;
            pos += runLen;
            continue;
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
                contentStart,
                contentEnd: pos
            };
        }
        pos++;
    }

    return null;
}

// Parse a link title: "...", '...', or (...)
function parseLinkTitle(s) {
    if (s.length < 2) return null;
    const open = s[0];
    const close = s[s.length - 1];
    const match = (open === '"' && close === '"') ||
        (open === "'" && close === "'") ||
        (open === '(' && close === ')');
    return match ? s.slice(1, -1) : null;
}

// Parse the inside of "(...)" as a CommonMark link destination + optional title.
// Returns { dest, title } or null when invalid (caller emits literal text).
function parseLinkDestination(inner) {
    const s = inner.trim();
    if (s === '') return null;

    let dest, rest;
    if (s[0] === '<') {
        const close = s.indexOf('>');
        if (close === -1) return null;
        dest = s.slice(1, close);
        rest = s.slice(close + 1).trim();
    } else {
        let w = 0;
        while (w < s.length && s[w] !== ' ' && s[w] !== '\t' && s[w] !== '\n') w++;
        dest = s.slice(0, w);
        rest = s.slice(w).trim();
        // Bare destinations may contain balanced parentheses only
        let depth = 0;
        for (let k = 0; k < dest.length; k++) {
            if (dest[k] === '(') depth++;
            else if (dest[k] === ')') depth--;
            if (depth < 0) return null;
        }
        if (depth !== 0) return null;
    }
    if (dest === '') return null;

    if (rest !== '') {
        const title = parseLinkTitle(rest);
        if (title === null) return null;
        return { dest, title };
    }
    return { dest, title: null };
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
    let title = null;
    if (pos < text.length && text[pos] === '(') {
        // Try successive ')' candidates — titles may contain parentheses
        let parenEnd = text.indexOf(')', pos + 1);
        while (parenEnd !== -1) {
            const parsed = parseLinkDestination(text.slice(pos + 1, parenEnd));
            if (parsed) {
                url = parsed.dest;
                title = parsed.title;
                pos = parenEnd + 1;
                break;
            }
            parenEnd = text.indexOf(')', parenEnd + 1);
        }
        if (url === null) return null;
    } else if (pos < text.length && text[pos] === '<') {
        // Check for <url> after ]
        const closeAngle = text.indexOf('>', pos + 1);
        if (closeAngle !== -1) {
            const angleUrl = text.slice(pos + 1, closeAngle).trim();
            if (hasUrlScheme(angleUrl)) {
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
        title,
        attrs: attrsResult?.attrs || null,
        endPos: finalPos,
        contentStart: startPos + 1,
        contentEnd: bracketEnd
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
// Count preceding backslashes; odd count means this char is escaped
function isEscaped(text, pos) {
    let n = 0;
    let j = pos - 1;
    while (j >= 0 && text[j] === '\\') { n++; j--; }
    return n % 2 === 1;
}

export function scanInlineCarriers(text, baseOffset = 0) {
    const carriers = [];
    const len = text.length;
    let pos = 0;

    while (pos < len) {
        const char = text[pos];
        let detected = null;

        // Escaped punctuation (\*, \[, \<, …) never starts a carrier
        if (isEscaped(text, pos)) {
            pos++;
            continue;
        }

        // Fast path: only check carrier start characters
        switch (char) {
            case '!':
                if (text[pos + 1] === '[') {
                    const inner = detectBracketLink(text, pos + 1);
                    if (inner && inner.url) {
                        detected = inner;
                        detected.type = 'image';
                    }
                }
                break;

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
        const absContentEnd = baseOffset + detected.contentEnd;

        // Calculate valueRange using detected contentStart/contentEnd (all detection functions now provide these)
        const valueRange = [
            baseOffset + detected.contentStart,
            baseOffset + detected.contentEnd
        ];

        // Build carrier object with minimal properties
        const carrier = {
            type: type,
            text: detected.content !== undefined ? detected.content : (detected.text !== undefined ? detected.text : url),
            range: [absStart, absEnd],
            valueRange,
            attrs: attrs,
            url: url,
            title: detected.title || null,
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
