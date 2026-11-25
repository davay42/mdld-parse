import {
  detectFence, detectPrefix, detectHeading, detectList,
  detectBlockquote, detectStandaloneSubject, detectHtmlBlock, detectIndentedCode, scanInlineCarriers
} from './tokenizers.js';
import { escapeHtml, matchFenceClose } from './shared.js';
import { expandIRI, parseSemanticBlock } from './utils.js';
import { DEFAULT_CONTEXT } from './constants.js';

function detectHr(line) {
  return /^(\s*[-*_]\s*){3,}$/.test(line);
}

function isExternalHref(href) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

// Does this line start any block-level construct? (used for lazy blockquote
// continuation and could serve paragraph interruption checks)
function isBlockStart(line) {
  const t = line.trim();
  return !!(detectFence(t) || detectPrefix(line) || detectHeading(line) ||
    detectList(line) || detectBlockquote(line) || detectHtmlBlock(line) ||
    detectHr(line) || detectStandaloneSubject(line) || detectIndentedCode(line));
}

// Stripped blockquote content that can host a lazily-continued paragraph:
// non-blank and not itself a structural block start (lists/quotes are fine —
// their items contain paragraphs).
function isLazyParagraphContent(content) {
  const t = content.trim();
  if (t === '') return false;
  return !(detectFence(t) || detectHeading(t) || detectHtmlBlock(t) ||
    detectHr(t) || detectStandaloneSubject(t) || detectPrefix(t));
}

const INLINE_HTML_RE = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/g;

const ASCII_PUNCT = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

const NAMED_ENTITIES = Object.assign(Object.create(null), {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  times: '×', divide: '÷', plusmn: '±', deg: '°', micro: 'µ', para: '¶',
  sect: '§', middot: '·', bull: '•', dagger: '†', Dagger: '‡', permil: '‰',
  prime: '′', Prime: '″', euro: '€', pound: '£', yen: '¥', cent: '¢',
  curren: '¤', brvbar: '¦', uml: '¨', ordf: 'ª', ordm: 'º', iexcl: '¡',
  iquest: '¿', szlig: 'ß', shy: '\u00ad', ensp: '\u2002', emsp: '\u2003',
  thinsp: '\u2009', zwnj: '\u200c', zwj: '\u200d', lrm: '\u200e', rlm: '\u200f',
  oline: '‾', frasl: '⁄', weierp: '℘', image: 'ℑ', real: 'ℜ', alefsym: 'ℵ',
  larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔', crarr: '↵',
  lArr: '⇐', uArr: '⇑', rArr: '⇒', dArr: '⇓', hArr: '⇔',
  forall: '∀', part: '∂', exist: '∃', empty: '∅', nabla: '∇', isin: '∈',
  notin: '∉', ni: '∋', prod: '∏', sum: '∑', minus: '−', lowast: '∗',
  radic: '√', prop: '∝', infin: '∞', ang: '∠', and: '∧', or: '∨',
  cap: '∩', cup: '∪', int: '∫', there4: '∴', sim: '∼', cong: '≅',
  asymp: '≈', ne: '≠', equiv: '≡', le: '≤', ge: '≥', sub: '⊂', sup: '⊃',
  nsub: '⊄', sube: '⊆', supe: '⊇', oplus: '⊕', otimes: '⊗', perp: '⊥',
  sdot: '⋅', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋', lang: '〈',
  rang: '〉', loz: '◊', spades: '♠', clubs: '♣', hearts: '♥', diams: '♦'
});

function decodeNumericEntity(body) {
  let digits = body.slice(1);
  let radix = 10;
  if (digits[0] === 'x' || digits[0] === 'X') { radix = 16; digits = digits.slice(1); }
  if (digits === '') return null;
  for (let k = 0; k < digits.length; k++) {
    const c = digits[k];
    const ok = radix === 10
      ? c >= '0' && c <= '9'
      : (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
    if (!ok) return null;
  }
  const cp = parseInt(digits, radix);
  if (cp === 0 || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) return '�';
  try { return String.fromCodePoint(cp); } catch { return '�'; }
}

// Single pass: backslash-escaped punctuation becomes literal (and can never
// start an entity), entity references decode to their characters.
function decodeInlineText(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\' && i + 1 < s.length && ASCII_PUNCT.indexOf(s[i + 1]) !== -1) {
      out += s[i + 1];
      i += 2;
      continue;
    }
    if (ch === '&') {
      const semi = s.indexOf(';', i + 1);
      if (semi !== -1 && semi - i <= 33) {
        const body = s.slice(i + 1, semi);
        const decoded = body[0] === '#'
          ? decodeNumericEntity(body)
          : (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : null);
        if (decoded !== null) {
          out += decoded;
          i = semi + 1;
          continue;
        }
      }
      out += '&';
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function isEscapedAt(s, pos) {
  let n = 0;
  let j = pos - 1;
  while (j >= 0 && s[j] === '\\') { n++; j--; }
  return n % 2 === 1;
}

// CommonMark hard break: 2+ trailing spaces or a backslash before a newline
// (not at end of block — the final line has no trailing \n, so it can't match)
function applyHardBreaks(escaped) {
  let out = '';
  let i = 0;
  while (i < escaped.length) {
    const nl = escaped.indexOf('\n', i);
    if (nl === -1) { out += escaped.slice(i); break; }

    let contentEnd = nl;
    let hard = false;
    if (escaped[nl - 1] === '\\' && escaped[nl - 2] !== '\\') {
      contentEnd = nl - 1;
      hard = true;
    } else {
      let j = nl;
      while (j > i && escaped[j - 1] === ' ') j--;
      if (nl - j >= 2) {
        contentEnd = j;
        hard = true;
      }
    }

    out += escaped.slice(i, contentEnd) + (hard ? '<br />\n' : '\n');
    i = nl + 1;
  }
  return out;
}

function escapeTextPreserveHtml(s) {
  let out = '';
  let last = 0;
  let m;
  INLINE_HTML_RE.lastIndex = 0;
  while ((m = INLINE_HTML_RE.exec(s))) {
    if (isEscapedAt(s, m.index)) {
      INLINE_HTML_RE.lastIndex = m.index + 1;
      continue;
    }
    out += applyHardBreaks(escapeHtml(decodeInlineText(s.slice(last, m.index)))) + m[0];
    last = m.index + m[0].length;
  }
  return out + applyHardBreaks(escapeHtml(decodeInlineText(s.slice(last))));
}

/**
 * MD-LD UI Renderer
 * 
 * Generates clean, semantic HTML for presentation.
 * Preserves the raw MD-LD annotation in `data-annotation` for client-side 
 * JS/CSS targeting, and resolves the primary IRI into `data-iri`.
 */
export function render(src, options = {}) {
  const lines = src.split('\n');
  const context = buildRenderContext(lines, options.context);

  function safeExpand(term) {
    if (!term || term === 'RESET') return null;
    if (term.startsWith('=#') || term.startsWith('#')) return term;
    return expandIRI(term, context);
  }

  function getAttrs(rawAnnotation, parsedSem, isLink = false, fallbackHref = null) {
    const attrs = [];
    const classes = [];

    if (rawAnnotation) {
      attrs.push(`data-annotation="${escapeHtml('{' + rawAnnotation + '}')}"`);
    }

    let iri = null;
    if (parsedSem?.subject && parsedSem.subject !== 'RESET') {
      iri = safeExpand(parsedSem.subject);
    } else if (parsedSem?.object) {
      iri = safeExpand(parsedSem.object);
    }

    if (iri) {
      attrs.push(`data-iri="${escapeHtml(iri)}"`);
    }

    if (isLink && fallbackHref) {
      attrs.push(`href="${escapeHtml(fallbackHref)}"`);
    }

    if (parsedSem?.types?.some(t => !t.remove)) classes.push('typed');
    if (parsedSem?.predicates?.some(p => p.remove) || parsedSem?.types?.some(t => t.remove)) {
      classes.push('retracted');
    }

    if (classes.length > 0) {
      attrs.unshift(`class="${classes.join(' ')}"`);
    }

    return attrs.join(' ');
  }

  function mergeClasses(baseClass, customAttrs) {
    const classMatch = customAttrs.match(/class="([^"]*)"/);
    let finalClass = baseClass;
    let remainingAttrs = customAttrs;
    if (classMatch) {
      finalClass += ' ' + classMatch[1];
      remainingAttrs = customAttrs.replace(/class="[^"]*"/, '').trim();
    }
    return `class="${finalClass}"${remainingAttrs ? ' ' + remainingAttrs : ''}`;
  }

  function renderInline(text) {
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    const carriers = scanInlineCarriers(text, 0);
    if (carriers.length === 0) return escapeTextPreserveHtml(text);

    let out = '';
    let lastPos = 0;

    for (const c of carriers) {
      if (c.range[0] > lastPos) out += escapeTextPreserveHtml(text.slice(lastPos, c.range[0]));

      const sem = c.attrs ? parseSemanticBlock(c.attrs) : null;
      const raw = c.attrs || '';
      const isLink = c.type === 'link';
      const fallbackHref = c.url || null;

      const titleAttr = c.title ? ` title="${escapeHtml(c.title)}"` : '';

      if (c.type === 'image') {
        const alt = escapeHtml(c.text);
        const src = escapeHtml(c.url);
        const customAttrs = getAttrs(raw, sem, false, null);
        const attrString = mergeClasses('mdld-image', customAttrs);
        out += `<img src="${src}" alt="${alt}" ${attrString}${titleAttr} />`;
      } else {
        let tag = 'span';
        let baseClass = 'mdld-bracket';
        if (c.type === 'link') { tag = 'a'; baseClass = 'mdld-link'; }
        else if (c.type === 'code') { tag = 'code'; baseClass = 'mdld-code'; }
        else if (c.type === 'strong') { tag = 'strong'; baseClass = 'mdld-bold'; }
        else if (c.type === 'emphasis') { tag = 'em'; baseClass = 'mdld-italic'; }

        const customAttrs = getAttrs(raw, sem, isLink, fallbackHref);
        const attrString = mergeClasses(baseClass,
          isLink && fallbackHref && isExternalHref(fallbackHref)
            ? customAttrs + ' target="_blank" rel="noopener noreferrer"'
            : customAttrs);

        const inner = c.type === 'code' ? escapeHtml(c.text) : renderInline(c.text);
        out += `<${tag} ${attrString}${titleAttr}>${inner}</${tag}>`;
      }
      lastPos = c.range[1];
    }

    if (lastPos < text.length) out += escapeTextPreserveHtml(text.slice(lastPos));
    return out;
  }

  const out = [];
  let i = 0;
  let codeBlock = null;
  let inComment = false;

  while (i < lines.length) {
    let line = lines[i];

    if (codeBlock) {
      const trimmedLine = line.trim();
      const fenceRun = matchFenceClose(trimmedLine, codeBlock.fenceChar);
      if (fenceRun && fenceRun.length >= codeBlock.fenceLength && fenceRun.length === trimmedLine.length) {
        const sem = codeBlock.attrs ? parseSemanticBlock(codeBlock.attrs) : null;
        const carrierText = codeBlock.content.join('\n');
        const customAttrs = getAttrs(codeBlock.attrs, sem);
        const attrString = mergeClasses(`mdld-codeblock language-${codeBlock.lang || 'text'}`, customAttrs);

        out.push(`<pre><code ${attrString}>${escapeHtml(carrierText)}</code></pre>`);
        codeBlock = null;
      } else {
        codeBlock.content.push(line);
      }
      i++;
      continue;
    }

    if (inComment) {
      const endIdx = line.indexOf('-->');
      if (endIdx !== -1) {
        inComment = false;
        line = line.slice(endIdx + 3);
      } else {
        i++;
        continue;
      }
    }

    let processedLine = '';
    let current = line;
    while (true) {
      const startIdx = current.indexOf('<!--');
      if (startIdx === -1) {
        processedLine += current;
        break;
      }
      const endIdx = current.indexOf('-->', startIdx);
      if (endIdx === -1) {
        inComment = true;
        processedLine += current.slice(0, startIdx);
        break;
      }
      processedLine += current.slice(0, startIdx);
      current = current.slice(endIdx + 3);
    }
    line = processedLine;

    if (line.trim() === '') { i++; continue; }

    const fence = detectFence(line.trim());
    if (fence) {
      codeBlock = {
        fenceChar: fence.fenceChar,
        fenceLength: fence.fenceLength,
        lang: fence.lang,
        attrs: fence.attrs,
        content: []
      };
      i++;
      continue;
    }

    const prefix = detectPrefix(line);
    if (prefix) {
      const resolvedIri = context[prefix.prefix];
      out.push(`<div class="mdld-prefix" data-prefix="${prefix.prefix}" data-raw="${escapeHtml(prefix.iri)}" data-iri="${escapeHtml(resolvedIri)}" style="display:none"></div>`);
      i++;
      continue;
    }

    const heading = detectHeading(line);
    if (heading) {
      const sem = heading.attrs ? parseSemanticBlock(heading.attrs) : null;
      const customAttrs = getAttrs(heading.attrs, sem);
      const attrString = mergeClasses('mdld-heading', customAttrs);
      out.push(`<h${heading.depth} ${attrString}>${renderInline(heading.content)}</h${heading.depth}>`);
      i++;
      continue;
    }

    const list = detectList(line);
    if (list) {
      const isOrdered = /^\s*\d+[.)]\s/.test(line);
      const listTag = isOrdered ? 'ol' : 'ul';
      // CommonMark: changing bullet marker or ordered delimiter starts a new list
      const sameMarker = (m) => isOrdered
        ? m.marker[m.marker.length - 1] === list.marker[list.marker.length - 1]
        : m.marker === list.marker;
      const startNum = isOrdered ? parseInt(list.marker, 10) : 1;
      const startAttr = isOrdered && startNum !== 1 ? ` start="${startNum}"` : '';
      out.push(`<${listTag} class="mdld-list"${startAttr}>`);

      let currentListItemLines = [];
      let currentAttrs = null;

      const processListItem = (content, attrs) => {
        const sem = attrs ? parseSemanticBlock(attrs) : null;
        const customAttrs = getAttrs(attrs, sem);
        const attrString = mergeClasses('mdld-item', customAttrs);
        out.push(`<li ${attrString}>${renderInline(content.join('\n'))}</li>`);
      };

      while (i < lines.length) {
        const l = detectList(lines[i]);
        if (l) {
          const nextIsOrdered = /^\s*\d+[.)]\s/.test(lines[i]);
          if (currentListItemLines.length > 0 &&
            (nextIsOrdered !== isOrdered || !sameMarker(l))) break;

          if (currentListItemLines.length > 0) {
            processListItem(currentListItemLines, currentAttrs);
            currentListItemLines = [];
          }
          currentListItemLines.push(l.content);
          currentAttrs = l.attrs;
          i++;
        } else if (lines[i].trim() === '') {
          let peek = i + 1;
          while (peek < lines.length && lines[peek].trim() === '') peek++;

          if (peek < lines.length) {
            const nextList = detectList(lines[peek]);
            if (nextList) {
              const nextIsOrdered = /^\s*\d+[.)]\s/.test(lines[peek]);
              if (nextIsOrdered === isOrdered && sameMarker(nextList)) {
                currentListItemLines.push('');
                i = peek;
                continue;
              }
            }
            if (/^\s{2,}/.test(lines[peek]) || /^\t/.test(lines[peek])) {
              currentListItemLines.push('');
              i = peek;
              continue;
            }
          }
          break;
        } else if (/^\s{2,}/.test(lines[i]) || /^\t/.test(lines[i])) {
          currentListItemLines.push(lines[i].replace(/^(\s{2,}|\t)/, ''));
          i++;
        } else {
          break;
        }
      }

      if (currentListItemLines.length > 0) {
        processListItem(currentListItemLines, currentAttrs);
      }

      out.push(`</${listTag}>`);
      continue;
    }

    const blockquote = detectBlockquote(line);
    if (blockquote) {
      let quoteLines = [blockquote.content];
      i++;
      // Track whether the last quote line can lazily continue a paragraph
      let lazyOk = isLazyParagraphContent(quoteLines[quoteLines.length - 1]);
      while (i < lines.length) {
        const bq = detectBlockquote(lines[i]);
        if (bq) {
          // Preserve per-line annotations as inline carriers — only the
          // first line's attrs become block-level attributes
          quoteLines.push(bq.attrs ? `${bq.content} {${bq.attrs}}` : bq.content);
          lazyOk = isLazyParagraphContent(bq.content);
          i++;
          continue;
        }
        // CommonMark lazy continuation: a paragraph line inside a quote may
        // omit the '>' marker — but only while the quote's last block is a
        // paragraph and the line doesn't start a new block itself.
        if (!lazyOk || lines[i].trim() === '' || isBlockStart(lines[i])) break;
        quoteLines.push(lines[i]);
        lazyOk = true;
        i++;
      }
      const sem = blockquote.attrs ? parseSemanticBlock(blockquote.attrs) : null;
      const customAttrs = getAttrs(blockquote.attrs, sem);
      const attrString = mergeClasses('mdld-quote', customAttrs);

      const innerHtml = render(quoteLines.join('\n'), { context });
      out.push(`<blockquote ${attrString}>${innerHtml}</blockquote>`);
      continue;
    }

    const standalone = detectStandaloneSubject(line);
    if (standalone) {
      const fakeSem = parseSemanticBlock(`=${standalone.content}`);
      const customAttrs = getAttrs(`=${standalone.content}`, fakeSem);
      const attrString = mergeClasses('mdld-standalone', customAttrs);
      out.push(`<div ${attrString} style="display:none"></div>`);
      i++;
      continue;
    }

    if (detectHr(line)) {
      out.push(`<hr class="mdld-hr" />`);
      i++;
      continue;
    }

    const htmlBlock = detectHtmlBlock(line);
    if (htmlBlock) {
      const blockLines = [line];
      i++;
      if (htmlBlock.closeTag) {
        const needle = htmlBlock.closeTag.toLowerCase();
        while (i < lines.length) {
          blockLines.push(lines[i]);
          const done = lines[i].toLowerCase().includes(needle);
          i++;
          if (done) break;
        }
      } else {
        while (i < lines.length && lines[i].trim() !== '') {
          blockLines.push(lines[i]);
          i++;
        }
      }
      out.push(blockLines.join('\n'));
      continue;
    }

    if (detectIndentedCode(line)) {
      const codeLines = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '') {
          codeLines.push('');
          i++;
          continue;
        }
        const ind = detectIndentedCode(l);
        if (!ind) break;
        codeLines.push(l.slice(ind.indent.length));
        i++;
      }
      while (codeLines.length > 0 && codeLines[codeLines.length - 1] === '') codeLines.pop();
      out.push(`<pre><code class="mdld-codeblock language-text">${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    let paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' &&
      !detectFence(lines[i].trim()) && !detectPrefix(lines[i]) &&
      !detectHeading(lines[i]) && !detectList(lines[i]) &&
      !detectBlockquote(lines[i]) && !detectStandaloneSubject(lines[i]) &&
      !detectHr(lines[i]) && !detectHtmlBlock(lines[i], true)) {
      paraLines.push(lines[i]);
      i++;
    }

    const paraText = paraLines.join('\n');
    out.push(`<p class="mdld-paragraph">${renderInline(paraText)}</p>`);
  }

  return out.join('\n');
}

function buildRenderContext(lines, userContext = {}) {
  const context = { ...DEFAULT_CONTEXT, ...userContext };
  for (const line of lines) {
    const prefix = detectPrefix(line);
    if (prefix) {
      let iri = prefix.iri;
      if (iri.includes(':')) {
        const colonIndex = iri.indexOf(':');
        const p = iri.substring(0, colonIndex);
        const ref = iri.substring(colonIndex + 1);
        if (context[p] && p !== '@vocab') iri = context[p] + ref;
      }
      context[prefix.prefix] = iri;
    }
  }
  return context;
}

/**
 * Reconstruct MD-LD from rendered HTML.
 * Pure string scanning over our constrained output format.
 * Platform-agnostic: no DOMParser, no browser APIs required.
 */
// Matches the block-level tags emitted by render() — used to find the end of
// a raw HTML block during deconstruction.
const MDLD_BLOCK_START_RE = /^<(?:p class="mdld-paragraph"|div class="mdld-prefix"|div class="mdld-standalone"|pre><code class="mdld-codeblock|h[1-6] class="mdld-heading"|blockquote class="mdld-quote"|ul class="mdld-list"|ol class="mdld-list"|hr class="mdld-hr")/;

export function deconstruct(html) {
  const blocks = [];
  let pos = 0;

  while (pos < html.length) {
    while (pos < html.length && /\s/.test(html[pos])) pos++;
    if (pos >= html.length) break;

    const nextTagStart = html.indexOf('<', pos);
    if (nextTagStart === -1) break;

    const tagEnd = html.indexOf('>', nextTagStart);
    if (tagEnd === -1) break;

    const openTag = html.slice(nextTagStart, tagEnd + 1);

    if (openTag.startsWith('<p') && extractAttr(openTag, 'class')?.includes('mdld-paragraph')) {
      const close = html.indexOf('</p>', pos);
      if (close === -1) break;
      const openEnd = html.indexOf('>', pos) + 1;
      const content = html.slice(openEnd, close);
      blocks.push(deconstructInline(content));
      pos = close + 4;
    } else if (openTag.startsWith('<div') && extractAttr(openTag, 'class')?.includes('mdld-prefix')) {
      const end = html.indexOf('></div>', pos);
      if (end === -1) break;
      const tag = html.slice(pos, end + 7);
      const prefix = extractAttr(tag, 'data-prefix');
      const raw = extractAttr(tag, 'data-raw') || extractAttr(tag, 'data-iri');
      blocks.push(`[${prefix}] <${raw}>`);
      pos = end + 7;
    } else if (openTag.startsWith('<div') && extractAttr(openTag, 'class')?.includes('mdld-standalone')) {
      const end = html.indexOf('</div>', pos);
      if (end === -1) break;
      const tag = html.slice(pos, end + 6);
      const ann = extractAttr(tag, 'data-annotation');
      if (ann) blocks.push(ann);
      pos = end + 6;
    } else if (html.startsWith('<pre><code', pos)) {
      const preClose = html.indexOf('>', pos) + 1;
      const codeOpenEnd = html.indexOf('>', preClose) + 1;
      const codeTag = html.slice(preClose, codeOpenEnd);
      if (!extractAttr(codeTag, 'class')?.includes('mdld-codeblock')) {
        pos = nextTagStart + 1;
        continue;
      }
      const closePre = html.indexOf('</code></pre>', pos);
      if (closePre === -1) break;
      const full = html.slice(pos, closePre + 13);

      const content = full.slice(codeOpenEnd - pos, full.length - 13);

      const classMatch = extractAttr(codeTag, 'class');
      const langMatch = (classMatch || '').match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      const ann = extractAttr(codeTag, 'data-annotation');

      blocks.push(`\`\`\`${lang}${ann ? ' ' + ann : ''}\n${unescapeHtml(content)}\n\`\`\``);
      pos = closePre + 13;
    } else if (html[pos] === '<' && /^<h[1-6]/.test(html.slice(pos, pos + 4)) &&
      extractAttr(openTag, 'class')?.includes('mdld-heading')) {
      const level = html[pos + 2];
      const closeTag = `</h${level}>`;
      const close = html.indexOf(closeTag, pos);
      if (close === -1) break;
      const full = html.slice(pos, close + closeTag.length);
      const openEnd = full.indexOf('>') + 1;
      const openTag = full.slice(0, openEnd);
      const content = full.slice(openEnd, full.length - closeTag.length);
      const hashes = '#'.repeat(parseInt(level));
      const ann = extractAttr(openTag, 'data-annotation');
      blocks.push(`${hashes} ${deconstructInline(content)}${ann ? ' ' + ann : ''}`);
      pos = close + closeTag.length;
    } else if (html.startsWith('<blockquote', pos) &&
      extractAttr(openTag, 'class')?.includes('mdld-quote')) {
      const close = html.indexOf('</blockquote>', pos);
      if (close === -1) break;
      const full = html.slice(pos, close + 13);
      const openEnd = full.indexOf('>') + 1;
      const openTag = full.slice(0, openEnd);
      const content = full.slice(openEnd, full.length - 13);
      const ann = extractAttr(openTag, 'data-annotation');

      const innerMd = deconstruct(content);
      const quoted = innerMd.split('\n').map(l => l.trim() ? `> ${l}` : '>').join('\n');
      blocks.push(ann ? `${quoted} ${ann}` : quoted);
      pos = close + 13;
    } else if ((openTag.startsWith('<ul') || openTag.startsWith('<ol')) &&
      extractAttr(openTag, 'class')?.includes('mdld-list')) {
      const isOrdered = openTag.startsWith('<ol');
      const closeTag = isOrdered ? '</ol>' : '</ul>';
      const close = html.indexOf(closeTag, pos);
      if (close === -1) break;
      const openEnd = html.indexOf('>', pos) + 1;
      const inner = html.slice(openEnd, close);
      const items = [];
      let itemPos = 0;
      let counter = isOrdered ? (parseInt(extractAttr(openTag, 'start') || '1', 10) || 1) : 1;
      while (itemPos < inner.length) {
        const liStart = inner.indexOf('<li', itemPos);
        if (liStart === -1) break;
        const liClose = inner.indexOf('</li>', liStart);
        if (liClose === -1) break;
        const liFull = inner.slice(liStart, liClose + 5);
        const openEnd = liFull.indexOf('>') + 1;
        const openTag = liFull.slice(0, openEnd);
        const liContent = liFull.slice(openEnd, liFull.length - 5);
        const ann = extractAttr(openTag, 'data-annotation');

        const deconContent = deconstructInline(liContent);
        const lines = deconContent.split('\n');
        const indent = isOrdered ? '   ' : '  ';
        const indented = lines.map((l, idx) => idx === 0 ? l : `${indent}${l}`).join('\n');

        const bullet = isOrdered ? `${counter}. ` : '- ';
        items.push(`${bullet}${indented}${ann ? ' ' + ann : ''}`);
        counter++;
        itemPos = liClose + 5;
      }
      blocks.push(items.join('\n'));
      pos = close + closeTag.length;
    } else if (openTag.startsWith('<hr') && extractAttr(openTag, 'class')?.includes('mdld-hr')) {
      blocks.push('---');
      pos = tagEnd + 1;
    } else if (html[pos] === '<' && /^<\/?[A-Za-z]/.test(html.slice(pos, pos + 3))) {
      // Raw HTML block (e.g. <table>): pass through until a blank line or
      // the next MD-LD block element.
      let end = pos;
      while (end < html.length) {
        const nl = html.indexOf('\n', end);
        const lineEnd = nl === -1 ? html.length : nl;
        const line = html.slice(end, lineEnd);
        if (end !== pos && (line.trim() === '' || MDLD_BLOCK_START_RE.test(line.trimStart()))) break;
        end = nl === -1 ? html.length : nl + 1;
      }
      blocks.push(html.slice(pos, end).trim());
      pos = end;
    } else {
      pos++;
    }
  }
  return blocks.join('\n\n');
}

// Re-escape characters that are literal in HTML text but significant in
// Markdown source ('<' would otherwise resurrect as a live tag on re-render).
// Skipped inside code spans where markup is literal anyway.
function mdEscapeText(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '&') out += '&amp;';
    else if (ch === '<') out += '&lt;';
    else if (ch === '\\' || ch === '`' || ch === '*' || ch === '_' || ch === '[' || ch === ']') out += '\\' + ch;
    else out += ch;
  }
  return out;
}

function deconstructInline(html, inCode = false) {
  let out = '';
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const closeGt = html.indexOf('>', i);
      if (closeGt === -1) { out += html.slice(i); break; }
      const tagContent = html.slice(i + 1, closeGt);
      if (tagContent.startsWith('/')) { i = closeGt + 1; continue; }

      const spaceOrEnd = tagContent.search(/[\s/]/);
      const tagName = (spaceOrEnd === -1 ? tagContent : tagContent.slice(0, spaceOrEnd)).toLowerCase();
      const attrs = spaceOrEnd === -1 ? '' : tagContent.slice(spaceOrEnd);

      if (tagContent.endsWith('/')) {
        out += deconstructInlineElement(tagName, attrs, '', inCode);
        i = closeGt + 1;
        continue;
      }

      const closeTag = `</${tagName}>`;
      let depth = 1;
      let j = closeGt + 1;
      let found = false;
      while (j < html.length && depth > 0) {
        let nextOpen = -1;
        let searchIdx = j;
        while (searchIdx < html.length) {
          const idx = html.indexOf(`<${tagName}`, searchIdx);
          if (idx === -1) break;
          const nextChar = html[idx + tagName.length + 1];
          if (nextChar === ' ' || nextChar === '>' || nextChar === '/' || nextChar === undefined) {
            nextOpen = idx;
            break;
          }
          searchIdx = idx + 1;
        }

        const nextClose = html.indexOf(closeTag, j);
        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          j = nextOpen + 1;
        } else {
          depth--;
          if (depth === 0) {
            const inner = html.slice(closeGt + 1, nextClose);
            out += deconstructInlineElement(tagName, attrs, inner, inCode);
            i = nextClose + closeTag.length;
            found = true;
            break;
          }
          j = nextClose + 1;
        }
      }
      if (!found) { out += html[i]; i++; }
    } else {
      const nextTag = html.indexOf('<', i);
      const textEnd = nextTag === -1 ? html.length : nextTag;
      const text = unescapeHtml(html.slice(i, textEnd));
      out += inCode ? text : mdEscapeText(text);
      i = textEnd;
    }
  }
  return out;
}

function deconstructInlineElement(tagName, attrs, inner, inCode = false) {
  const ann = extractAttr(attrs, 'data-annotation');
  const content = deconstructInline(inner, inCode || tagName === 'code');
  const suffix = ann ? ' ' + ann : '';
  const title = extractAttr(attrs, 'title');
  const titleStr = title ? ` "${title}"` : '';

  switch (tagName) {
    case 'a': {
      const href = extractAttr(attrs, 'href') || '';
      return `[${content}](${href}${titleStr})${suffix}`;
    }
    case 'img': {
      const src = extractAttr(attrs, 'src') || '';
      const alt = extractAttr(attrs, 'alt') || '';
      return `![${alt}](${src}${titleStr})${suffix}`;
    }
    case 'span': return `[${content}]${suffix}`;
    case 'code': return `\`${content}\`${suffix}`;
    case 'strong': return `**${content}**${suffix}`;
    case 'em': return `*${content}*${suffix}`;
    case 'br': return '  ' + suffix;
    default: return content + suffix;
  }
}

function extractAttr(tag, name) {
  const re = new RegExp(`(?:\\s|^)${name}=(["'])(.*?)\\1`, 'is');
  const m = tag.match(re);
  if (!m) return null;
  return unescapeHtml(m[2]);
}

function unescapeHtml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}