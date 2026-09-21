import {
  detectFence, detectPrefix, detectHeading, detectList,
  detectBlockquote, detectStandaloneSubject, scanInlineCarriers
} from './tokenizers.js';
import { escapeHtml } from './shared.js';
import { expandIRI, parseSemanticBlock } from './utils.js';
import { DEFAULT_CONTEXT } from './constants.js';

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
    } else if (isLink && fallbackHref) {
      iri = safeExpand(fallbackHref);
    }

    if (iri) {
      attrs.push(`data-iri="${escapeHtml(iri)}"`);
      if (isLink) attrs.push(`href="${escapeHtml(iri)}"`);
    } else if (isLink && fallbackHref) {
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
    const carriers = scanInlineCarriers(text, 0);
    if (carriers.length === 0) return escapeHtml(text);

    let out = '';
    let lastPos = 0;

    for (const c of carriers) {
      if (c.range[0] > lastPos) out += escapeHtml(text.slice(lastPos, c.range[0]));

      const sem = c.attrs ? parseSemanticBlock(c.attrs) : null;
      const raw = c.attrs || '';
      const isLink = c.type === 'link';
      const fallbackHref = c.url || null;

      let tag = 'span';
      let baseClass = 'mdld-bracket';
      if (c.type === 'link') { tag = 'a'; baseClass = 'mdld-link'; }
      else if (c.type === 'code') { tag = 'code'; baseClass = 'mdld-code'; }
      else if (c.type === 'strong') { tag = 'strong'; baseClass = 'mdld-bold'; }
      else if (c.type === 'emphasis') { tag = 'em'; baseClass = 'mdld-italic'; }

      const customAttrs = getAttrs(raw, sem, isLink, fallbackHref);
      const attrString = mergeClasses(baseClass, customAttrs);

      out += `<${tag} ${attrString}>${renderInline(c.text)}</${tag}>`;
      lastPos = c.range[1];
    }

    if (lastPos < text.length) out += escapeHtml(text.slice(lastPos));
    return out;
  }

  const out = [];
  let i = 0;
  let codeBlock = null;

  while (i < lines.length) {
    const line = lines[i];

    if (codeBlock) {
      const fenceClosePattern = new RegExp(`^${codeBlock.fenceChar}{${codeBlock.fenceLength},}\\s*$`);
      if (fenceClosePattern.test(line.trim())) {
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
      // data-raw preserves the original folded form (e.g. "my:journal:") 
      // for lossless prefix folding roundtrip
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
      out.push('<ul class="mdld-list">');
      while (i < lines.length) {
        const l = detectList(lines[i]);
        if (!l) break;
        const sem = l.attrs ? parseSemanticBlock(l.attrs) : null;
        const customAttrs = getAttrs(l.attrs, sem);
        const attrString = mergeClasses('mdld-item', customAttrs);
        out.push(`<li ${attrString}>${renderInline(l.content)}</li>`);
        i++;
      }
      out.push('</ul>');
      continue;
    }

    const blockquote = detectBlockquote(line);
    if (blockquote) {
      let quoteLines = [blockquote.content];
      i++;
      while (i < lines.length) {
        const bq = detectBlockquote(lines[i]);
        if (!bq) break;
        quoteLines.push(bq.content);
        i++;
      }
      const sem = blockquote.attrs ? parseSemanticBlock(blockquote.attrs) : null;
      const customAttrs = getAttrs(blockquote.attrs, sem);
      const attrString = mergeClasses('mdld-quote', customAttrs);
      const carrierText = quoteLines.join('\n');
      out.push(`<blockquote ${attrString}>${renderInline(carrierText)}</blockquote>`);
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

    let paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' &&
      !detectFence(lines[i].trim()) && !detectPrefix(lines[i]) &&
      !detectHeading(lines[i]) && !detectList(lines[i]) &&
      !detectBlockquote(lines[i]) && !detectStandaloneSubject(lines[i])) {
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
export function deconstruct(html) {
  const blocks = [];
  let pos = 0;

  while (pos < html.length) {
    while (pos < html.length && /\s/.test(html[pos])) pos++;
    if (pos >= html.length) break;

    if (html.startsWith('<div class="mdld-prefix"', pos)) {
      const end = html.indexOf('></div>', pos);
      if (end === -1) break;
      const tag = html.slice(pos, end + 7);
      const prefix = extractAttr(tag, 'data-prefix');
      const raw = extractAttr(tag, 'data-raw') || extractAttr(tag, 'data-iri');
      blocks.push(`[${prefix}] <${raw}>`);
      pos = end + 7;
    } else if (html.startsWith('<div class="mdld-standalone"', pos)) {
      const end = html.indexOf('</div>', pos);
      if (end === -1) break;
      const tag = html.slice(pos, end + 6);
      const ann = extractAttr(tag, 'data-annotation');
      if (ann) blocks.push(ann);
      pos = end + 6;
    } else if (html.startsWith('<pre><code', pos)) {
      const closePre = html.indexOf('</code></pre>', pos);
      if (closePre === -1) break;
      const full = html.slice(pos, closePre + 13);

      // FIX: Skip past <pre> to find <code> opening tag
      const preClose = full.indexOf('>') + 1; // End of <pre>
      const codeOpenEnd = full.indexOf('>', preClose) + 1; // End of <code ...>
      const codeTag = full.slice(preClose, codeOpenEnd);
      const content = full.slice(codeOpenEnd, full.length - 13);

      const classMatch = extractAttr(codeTag, 'class');
      const langMatch = (classMatch || '').match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      const ann = extractAttr(codeTag, 'data-annotation');

      blocks.push(`\`\`\`${lang}${ann ? ' ' + ann : ''}\n${unescapeHtml(content)}\n\`\`\``);
      pos = closePre + 13;
    } else if (html[pos] === '<' && /^<h[1-6]/.test(html.slice(pos, pos + 4))) {
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
    } else if (html.startsWith('<blockquote', pos)) {
      const close = html.indexOf('</blockquote>', pos);
      if (close === -1) break;
      const full = html.slice(pos, close + 13);
      const openEnd = full.indexOf('>') + 1;
      const openTag = full.slice(0, openEnd);
      const content = full.slice(openEnd, full.length - 13);
      const ann = extractAttr(openTag, 'data-annotation');
      const lines = deconstructInline(content).split('\n');
      const quoted = lines.map(l => l.trim() ? `> ${l}` : '>').join('\n');
      blocks.push(ann ? `${quoted} ${ann}` : quoted);
      pos = close + 13;
    } else if (html.startsWith('<ul class="mdld-list">', pos)) {
      const close = html.indexOf('</ul>', pos);
      if (close === -1) break;
      const inner = html.slice(pos + 21, close);
      const items = [];
      let itemPos = 0;
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
        items.push(`- ${deconstructInline(liContent)}${ann ? ' ' + ann : ''}`);
        itemPos = liClose + 5;
      }
      blocks.push(items.join('\n'));
      pos = close + 5;
    } else if (html.startsWith('<p class="mdld-paragraph">', pos)) {
      const close = html.indexOf('</p>', pos);
      if (close === -1) break;
      const content = html.slice(pos + 25, close);
      blocks.push(deconstructInline(content));
      pos = close + 4;
    } else {
      pos++;
    }
  }
  return blocks.join('\n\n');
}

function deconstructInline(html) {
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

      const closeTag = `</${tagName}>`;
      let depth = 1;
      let j = closeGt + 1;
      let found = false;
      while (j < html.length && depth > 0) {
        const nextOpen = html.indexOf(`<${tagName}`, j);
        const nextClose = html.indexOf(closeTag, j);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          j = nextOpen + 1;
        } else {
          depth--;
          if (depth === 0) {
            const inner = html.slice(closeGt + 1, nextClose);
            out += deconstructInlineElement(tagName, attrs, inner);
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
      out += unescapeHtml(html.slice(i, textEnd));
      i = textEnd;
    }
  }
  return out;
}

function deconstructInlineElement(tagName, attrs, inner) {
  const ann = extractAttr(attrs, 'data-annotation');
  const content = deconstructInline(inner);
  const suffix = ann ? ' ' + ann : '';

  switch (tagName) {
    case 'a': {
      const href = extractAttr(attrs, 'href') || '';
      return `[${content}](${href})${suffix}`;
    }
    case 'span': return `[${content}]${suffix}`;
    case 'code': return `\`${content}\`${suffix}`;
    case 'strong': return `**${content}**${suffix}`;
    case 'em': return `*${content}*${suffix}`;
    default: return content + suffix;
  }
}

function extractAttr(tag, name) {
  const re = new RegExp(`${name}=(?:"([^"]*)"|'([^']*)')`, 'i');
  const m = tag.match(re);
  if (!m) return null;
  const value = m[1] !== undefined ? m[1] : m[2];
  return unescapeHtml(value);
}

function unescapeHtml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}