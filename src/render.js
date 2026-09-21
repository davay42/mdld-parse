import {
  detectFence, detectPrefix, detectHeading, detectList,
  detectBlockquote, detectStandaloneSubject, scanInlineCarriers
} from './tokenizers.js';
import { escapeHtml } from './shared.js';
import { expandIRI, parseSemanticBlock } from './utils.js';
import { DEFAULT_CONTEXT, RDFS_LABEL } from './constants.js';

export function render(src) {
  const lines = src.split('\n');
  const ctx = { ...DEFAULT_CONTEXT };

  // Pass 1: Extract prefixes to build context (supports folding)
  for (const line of lines) {
    const prefix = detectPrefix(line);
    if (prefix) {
      let iri = prefix.iri;
      if (iri.includes(':')) {
        const colonIndex = iri.indexOf(':');
        const p = iri.substring(0, colonIndex);
        const ref = iri.substring(colonIndex + 1);
        if (ctx[p]) iri = ctx[p] + ref;
      }
      ctx[prefix.prefix] = iri;
    }
  }

  function safeExpand(term) {
    if (!term) return null;
    if (term === 'RESET') return null;
    if (term.startsWith('=#') || term.startsWith('#')) return term; // Preserve fragments
    return expandIRI(term, ctx);
  }

  function buildAttrs(sem, baseClasses, isLink, rawAttrs, overrideHref, carrierText) {
    let classes = [...baseClasses];
    let attrs = [];

    let iri = null;
    if (sem?.subject && sem.subject !== 'RESET') iri = safeExpand(sem.subject);
    else if (sem?.object) iri = safeExpand(sem.object);

    if (iri) {
      attrs.push(`data-iri="${escapeHtml(iri)}"`);
      if (isLink) attrs.push(`href="${escapeHtml(iri)}"`);
    } else if (isLink && overrideHref) {
      attrs.push(`href="${escapeHtml(overrideHref)}"`);
    }

    if (sem?.types?.length > 0) {
      const resolvedTypes = sem.types.map(t => safeExpand(t.iri)).filter(Boolean);
      classes.push(...resolvedTypes.map(t => `type-${String(t).split(/[#\/]/).pop()}`));
      attrs.push(`data-types="${escapeHtml(resolvedTypes.join(' '))}"`);
    }

    let hasLabel = false;
    if (sem?.predicates?.length > 0) {
      const predStrs = sem.predicates.map(p => {
        const resolvedIri = safeExpand(p.iri);
        const prefix = p.remove ? '-' : '';
        return `${prefix}${p.form || ''}${resolvedIri}`;
      });
      attrs.push(`data-preds="${escapeHtml(predStrs.join(' '))}"`);

      hasLabel = sem.predicates.some(p => {
        const resolved = safeExpand(p.iri);
        return resolved === RDFS_LABEL && !p.remove;
      });
    }

    if (sem?.datatype) attrs.push(`data-datatype="${escapeHtml(safeExpand(sem.datatype))}"`);
    if (sem?.language) attrs.push(`lang="${escapeHtml(sem.language)}"`);
    if (rawAttrs) attrs.push(`data-mdld="${escapeHtml('{' + rawAttrs + '}')}"`);

    const hasRetraction = sem?.types?.some(t => t.remove) || sem?.predicates?.some(p => p.remove);
    if (hasRetraction) {
      attrs.push(`data-retracted="true"`);
      classes.push('mdld-retracted');
    }

    if (hasLabel && carrierText) {
      attrs.push(`title="${escapeHtml(carrierText)}"`);
    }

    attrs.unshift(`class="${classes.join(' ')}"`);
    return attrs.join(' ');
  }

  function renderInline(text) {
    const carriers = scanInlineCarriers(text, 0);
    if (carriers.length === 0) return escapeHtml(text);

    let out = '';
    let lastPos = 0;

    for (const c of carriers) {
      if (c.range[0] > lastPos) {
        out += escapeHtml(text.slice(lastPos, c.range[0]));
      }

      const sem = c.attrs ? parseSemanticBlock(c.attrs) : null;
      const rawAttrs = c.attrs || '';
      const carrierText = c.text || '';

      if (c.type === 'link') {
        let attrs = buildAttrs(sem, ['mdld-link'], true, rawAttrs, c.url, carrierText);
        out += `<a ${attrs}>${renderInline(carrierText)}</a>`;
      } else if (c.type === 'span') {
        out += `<span ${buildAttrs(sem, ['mdld-bracket'], false, rawAttrs, null, carrierText)}>${renderInline(carrierText)}</span>`;
      } else if (c.type === 'code') {
        out += `<code ${buildAttrs(sem, ['mdld-code'], false, rawAttrs, null, carrierText)}>${escapeHtml(carrierText)}</code>`;
      } else if (c.type === 'strong') {
        out += `<strong ${buildAttrs(sem, ['mdld-bold'], false, rawAttrs, null, carrierText)}>${renderInline(carrierText)}</strong>`;
      } else if (c.type === 'emphasis') {
        out += `<em ${buildAttrs(sem, ['mdld-italic'], false, rawAttrs, null, carrierText)}>${renderInline(carrierText)}</em>`;
      }

      lastPos = c.range[1];
    }

    if (lastPos < text.length) {
      out += escapeHtml(text.slice(lastPos));
    }

    return out;
  }

  // Pass 2: Render blocks
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
        out.push(`<pre><code ${buildAttrs(sem, ['mdld-codeblock', `language-${codeBlock.lang}`], false, codeBlock.attrs, null, carrierText)}>${escapeHtml(carrierText)}</code></pre>`);
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
      const resolvedIri = ctx[prefix.prefix];
      out.push(`<div class="mdld-prefix" data-prefix="${prefix.prefix}" data-iri="${escapeHtml(resolvedIri)}" style="display:none"></div>`);
      i++;
      continue;
    }

    const heading = detectHeading(line);
    if (heading) {
      const sem = heading.attrs ? parseSemanticBlock(heading.attrs) : null;
      out.push(`<h${heading.depth} ${buildAttrs(sem, ['mdld-heading'], false, heading.attrs, null, heading.content)}>${renderInline(heading.content)}</h${heading.depth}>`);
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
        out.push(`<li ${buildAttrs(sem, ['mdld-list-item'], false, l.attrs, null, l.content)}>${renderInline(l.content)}</li>`);
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
      const carrierText = quoteLines.join('\n');
      out.push(`<blockquote ${buildAttrs(sem, ['mdld-blockquote'], false, blockquote.attrs, null, carrierText)}>${renderInline(carrierText)}</blockquote>`);
      continue;
    }

    const standalone = detectStandaloneSubject(line);
    if (standalone) {
      const fakeSem = parseSemanticBlock(`=${standalone.content}`);
      const rawStr = `=${standalone.content}`;
      out.push(`<div ${buildAttrs(fakeSem, ['mdld-standalone'], false, rawStr, null, '')} data-raw="{${escapeHtml(rawStr)}}">{${escapeHtml(rawStr)}}</div>`);
      i++;
      continue;
    }

    // Paragraph fallback
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