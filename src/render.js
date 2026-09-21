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
      out.push(`<div class="mdld-prefix" data-prefix="${prefix.prefix}" data-iri="${escapeHtml(resolvedIri)}" style="display:none"></div>`);
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