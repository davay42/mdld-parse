/**
 * MD-LD Semantic Renderer
 * 
 * A lightweight, spec-compliant renderer that converts MD-LD to semantic HTML.
 * It extracts IRIs, types, and predicates into clean, space-separated data-attributes 
 * for JS/CSS interactivity, while preserving the raw annotation string in `data-mdld`.
 */

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function render(src) {
  const ctx = buildContext(src);

  function resolveIRI(term) {
    if (!term) return term;
    if (term.startsWith('=#')) return term; // Fragment relative to current subject
    const colon = term.indexOf(':');
    if (colon > 0) {
      const p = term.slice(0, colon);
      if (ctx.has(p)) return ctx.get(p) + term.slice(colon + 1);
    } else if (!term.startsWith('http') && !term.startsWith('urn') && !term.startsWith('tag')) {
      // Unprefixed term, use @vocab
      const vocab = ctx.get('@vocab') || 'http://www.w3.org/2000/01/rdf-schema#';
      return vocab + term;
    }
    return term;
  }

  function parseAnnotation(content) {
    const parts = content.trim().split(/\s+/);
    const meta = { subject: null, softSubject: null, types: [], predicates: [], datatype: null, language: null };

    for (let part of parts) {
      if (!part) continue;
      let remove = false;
      if (part.startsWith('-')) { remove = true; part = part.slice(1); }

      if (part === '=') { meta.subject = { reset: true }; }
      else if (part.startsWith('=')) { meta.subject = { iri: part.slice(1), remove }; }
      else if (part.startsWith('+')) { meta.softSubject = { iri: part.slice(1) }; }
      else if (part.startsWith('^^')) { meta.datatype = part.slice(2); }
      else if (part.startsWith('@')) { meta.language = part.slice(1); }
      else if (part.startsWith('.')) { meta.types.push({ iri: part.slice(1), remove }); }
      else {
        let form = '', iri = part;
        if (part.startsWith('?')) { form = '?'; iri = part.slice(1); }
        else if (part.startsWith('!')) { form = '!'; iri = part.slice(1); }
        meta.predicates.push({ iri, form, remove });
      }
    }
    return meta;
  }

  function buildAttrs(meta, baseClasses, isLink = false, rawAttrs = '', overrideHref = null, carrierText = '') {
    let classes = [...baseClasses];
    let attrs = [];

    if (meta?.subject?.reset) attrs.push(`data-reset="true"`);

    let iri = null;
    if (meta?.subject?.iri) iri = resolveIRI(meta.subject.iri);
    else if (meta?.softSubject?.iri) iri = resolveIRI(meta.softSubject.iri);

    if (iri) {
      attrs.push(`data-iri="${escapeHtml(iri)}"`);
      if (isLink) attrs.push(`href="${escapeHtml(iri)}"`);
    } else if (isLink && overrideHref) {
      attrs.push(`href="${escapeHtml(overrideHref)}"`);
    }

    if (meta?.types?.length > 0) {
      const resolvedTypes = meta.types.map(t => resolveIRI(t.iri));
      classes.push(...resolvedTypes.map(t => `type-${t.split(/[#\/]/).pop()}`));
      attrs.push(`data-types="${escapeHtml(resolvedTypes.join(' '))}"`);
    }

    let hasLabel = false;
    if (meta?.predicates?.length > 0) {
      const predStrs = meta.predicates.map(p => {
        const resolvedIri = resolveIRI(p.iri);
        const prefix = p.remove ? '-' : '';
        return `${prefix}${p.form}${resolvedIri}`;
      });
      attrs.push(`data-preds="${escapeHtml(predStrs.join(' '))}"`);

      hasLabel = meta.predicates.some(p => {
        const resolved = resolveIRI(p.iri);
        return (resolved === 'http://www.w3.org/2000/01/rdf-schema#label' || resolved === 'label') && !p.remove;
      });
    }

    if (meta?.datatype) attrs.push(`data-datatype="${escapeHtml(resolveIRI(meta.datatype))}"`);
    if (meta?.language) { attrs.push(`lang="${escapeHtml(meta.language)}"`); }
    if (rawAttrs) attrs.push(`data-mdld="${escapeHtml('{' + rawAttrs + '}')}"`);

    if (meta?.types?.some(t => t.remove) || meta?.predicates?.some(p => p.remove)) {
      attrs.push(`data-retracted="true"`);
      classes.push('mdld-retracted');
    }

    if (hasLabel && carrierText) {
      attrs.push(`title="${escapeHtml(carrierText)}"`);
    }

    attrs.unshift(`class="${classes.join(' ')}"`);
    return attrs.join(' ');
  }

  function parseInline(text) {
    let out = '';
    let i = 0;
    while (i < text.length) {
      if (text[i] === '`') {
        let end = text.indexOf('`', i + 1);
        if (end !== -1) {
          let after = text.slice(end + 1);
          let annMatch = after.match(/^\s*\{([^}]+)\}/);
          let raw = annMatch ? annMatch[1] : null;
          let meta = raw ? parseAnnotation(raw) : null;
          let carrierText = text.slice(i + 1, end);
          out += `<code ${buildAttrs(meta, ['mdld-code'], false, raw, null, carrierText)}>${escapeHtml(carrierText)}</code>`;
          i = end + 1 + (annMatch ? annMatch[0].length : 0); continue;
        }
      }
      if (text[i] === '!' && text[i + 1] === '[') {
        let m = text.slice(i).match(/^!\[([^\]]*)\]\(([^)]+)\)(\s*\{([^}]+)\})?/);
        if (m) {
          let raw = m[4] || null;
          let meta = raw ? parseAnnotation(raw) : null;
          out += `<img src="${escapeHtml(m[2])}" alt="${escapeHtml(m[1])}" ${buildAttrs(meta, ['mdld-image'], false, raw, null, m[1])} />`;
          i += m[0].length; continue;
        }
      }
      if (text[i] === '[') {
        let m = text.slice(i).match(/^\[([^\]]*)\]\(([^)]+)\)(\s*\{([^}]+)\})?/);
        if (m) {
          let raw = m[4] || null;
          let meta = raw ? parseAnnotation(raw) : null;
          let href = m[2];
          let semanticHref = meta?.subject?.iri ? resolveIRI(meta.subject.iri) : (meta?.softSubject?.iri ? resolveIRI(meta.softSubject.iri) : null);
          let attrs = buildAttrs(meta, ['mdld-link'], true, raw, href, m[1]);
          if (semanticHref) attrs = attrs.replace(/href="[^"]*"/, `href="${escapeHtml(semanticHref)}"`);
          out += `<a ${attrs}>${parseInline(m[1])}</a>`;
          i += m[0].length; continue;
        }
        let m2 = text.slice(i).match(/^\[([^\]]*)\](\s*\{([^}]+)\})?/);
        if (m2) {
          let raw = m2[3] || null;
          let meta = raw ? parseAnnotation(raw) : null;
          out += `<span ${buildAttrs(meta, ['mdld-bracket'], false, raw, null, m2[1])}>${parseInline(m2[1])}</span>`;
          i += m2[0].length; continue;
        }
      }
      if (text[i] === '<') {
        let m = text.slice(i).match(/^<([^>]+)>(\s*\{([^}]+)\})?/);
        if (m) {
          let raw = m[3] || null;
          let meta = raw ? parseAnnotation(raw) : null;
          let href = m[1];
          let semanticHref = meta?.subject?.iri ? resolveIRI(meta.subject.iri) : (meta?.softSubject?.iri ? resolveIRI(meta.softSubject.iri) : null);
          let attrs = buildAttrs(meta, ['mdld-bare-url'], true, raw, href, m[1]);
          if (semanticHref) attrs = attrs.replace(/href="[^"]*"/, `href="${escapeHtml(semanticHref)}"`);
          out += `<a ${attrs}>${escapeHtml(m[1])}</a>`;
          i += m[0].length; continue;
        }
      }
      if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
        let marker = text.slice(i, i + 2);
        let end = text.indexOf(marker, i + 2);
        if (end !== -1) {
          let after = text.slice(end + 2);
          let annMatch = after.match(/^\s*\{([^}]+)\}/);
          let raw = annMatch ? annMatch[1] : null;
          let meta = raw ? parseAnnotation(raw) : null;
          let carrierText = text.slice(i + 2, end);
          out += `<strong ${buildAttrs(meta, ['mdld-bold'], false, raw, null, carrierText)}>${parseInline(carrierText)}</strong>`;
          i = end + 2 + (annMatch ? annMatch[0].length : 0); continue;
        }
      }
      if ((text[i] === '*' && text[i + 1] !== '*') || (text[i] === '_' && text[i + 1] !== '_')) {
        let marker = text[i];
        let end = text.indexOf(marker, i + 1);
        if (end !== -1) {
          let after = text.slice(end + 1);
          let annMatch = after.match(/^\s*\{([^}]+)\}/);
          let raw = annMatch ? annMatch[1] : null;
          let meta = raw ? parseAnnotation(raw) : null;
          let carrierText = text.slice(i + 1, end);
          out += `<em ${buildAttrs(meta, ['mdld-italic'], false, raw, null, carrierText)}>${parseInline(carrierText)}</em>`;
          i = end + 1 + (annMatch ? annMatch[0].length : 0); continue;
        }
      }
      if (text[i] === '{') {
        let m = text.slice(i).match(/^\{([^}]+)\}/);
        if (m) { out += `<span class="mdld-stray">${escapeHtml(m[0])}</span>`; i += m[0].length; continue; }
      }
      out += escapeHtml(text[i]); i++;
    }
    return out;
  }

  const lines = src.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];
    if (line.trim() === '') { i++; continue; }

    let prefixMatch = line.match(/^\[(\w+)\]\s*<([^>]+)>\s*$/);
    if (prefixMatch) {
      let resolvedIri = ctx.get(prefixMatch[1]);
      out.push(`<div class="mdld-prefix" data-prefix="${prefixMatch[1]}" data-iri="${escapeHtml(resolvedIri)}" style="display:none"></div>`);
      i++; continue;
    }

    let fence = parseFence(line.trim());
    if (fence) {
      let meta = fence.attrs ? parseAnnotation(fence.attrs) : null;
      let codeLines = [];
      i++;
      while (i < lines.length && !isClosingFence(lines[i].trim(), fence.fenceChar, fence.fenceLength)) {
        codeLines.push(lines[i]); i++;
      }
      if (i < lines.length) i++;
      let raw = fence.attrs || '';
      let carrierText = codeLines.join('\n');
      out.push(`<pre><code ${buildAttrs(meta, ['mdld-codeblock', `language-${fence.lang}`], false, raw, null, carrierText)}>${escapeHtml(carrierText)}</code></pre>`);
      continue;
    }

    let headMatch = line.match(/^(#{1,6})\s+(.+?)(\s*\{([^}]+)\})?\s*$/);
    if (headMatch) {
      let level = headMatch[1].length;
      let raw = headMatch[4] || null;
      let meta = raw ? parseAnnotation(raw) : null;
      out.push(`<h${level} ${buildAttrs(meta, ['mdld-heading'], false, raw, null, headMatch[2])}>${parseInline(headMatch[2])}</h${level}>`);
      i++; continue;
    }

    if (line.startsWith('>')) {
      let m = line.match(/^>\s*(.+?)(\s*\{([^}]+)\})?\s*$/);
      let firstLineContent = m ? m[1] : line.replace(/^>\s?/, '');
      let raw = m && m[3] ? m[3] : null;
      let meta = raw ? parseAnnotation(raw) : null;
      let quoteLines = [firstLineContent];
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        let qm = lines[i].match(/^>\s*(.+?)(\s*\{([^}]+)\})?\s*$/);
        quoteLines.push(qm ? qm[1] : lines[i].replace(/^>\s?/, '')); i++;
      }
      let carrierText = quoteLines.join('\n');
      out.push(`<blockquote ${buildAttrs(meta, ['mdld-blockquote'], false, raw, null, carrierText)}>${parseInline(carrierText)}</blockquote>`);
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      out.push('<ul class="mdld-list">');
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        let m = lines[i].match(/^([-*+])\s+(.+?)(\s*\{([^}]+)\})?\s*$/);
        let content = m ? m[2] : lines[i].replace(/^[-*+]\s+/, '');
        let raw = m && m[4] ? m[4] : null;
        let meta = raw ? parseAnnotation(raw) : null;
        out.push(`<li ${buildAttrs(meta, ['mdld-list-item'], false, raw, null, content)}>${parseInline(content)}</li>`);
        i++;
      }
      out.push('</ul>'); continue;
    }

    let standMatch = line.match(/^\s*\{([^}]+)\}\s*$/);
    if (standMatch) {
      let raw = standMatch[1];
      let meta = parseAnnotation(raw);
      out.push(`<div ${buildAttrs(meta, ['mdld-standalone'], false, raw, null, '')} data-raw="{${escapeHtml(raw)}}">{${escapeHtml(raw)}}</div>`);
      i++; continue;
    }

    let paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) && !/^[-*+]\s+/.test(lines[i]) &&
      !lines[i].startsWith('>') && !/^\[(\w+)\]\s*<[^>]+>\s*$/.test(lines[i]) &&
      !parseFence(lines[i].trim()) && !/^\s*\{([^}]+)\}\s*$/.test(lines[i])) {
      paraLines.push(lines[i]); i++;
    }
    if (paraLines.length > 0) {
      out.push(`<p class="mdld-paragraph">${parseInline(paraLines.join('\n'))}</p>`);
    }
  }
  return out.join('\n');
}

function buildContext(src) {
  const ctx = new Map();
  // Default MD-LD context
  ctx.set('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
  ctx.set('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
  ctx.set('xsd', 'http://www.w3.org/2001/XMLSchema#');
  ctx.set('sh', 'http://www.w3.org/ns/shacl#');
  ctx.set('prov', 'http://www.w3.org/ns/prov#');

  let vocab = 'http://www.w3.org/2000/01/rdf-schema#';

  const lines = src.split('\n');
  for (const line of lines) {
    const m = line.match(/^\[(\w+)\]\s*<([^>]+)>\s*$/);
    if (m) {
      if (m[1] === '@vocab') {
        vocab = m[2];
        continue;
      }
      let iri = m[2];
      if (iri.includes(':')) {
        const colonIndex = iri.indexOf(':');
        const p = iri.substring(0, colonIndex);
        const ref = iri.substring(colonIndex + 1);
        if (ctx.has(p)) iri = ctx.get(p) + ref;
      }
      ctx.set(m[1], iri);
    }
  }

  ctx.set('@vocab', vocab);
  return ctx;
}

function parseFence(line) {
  const match = line.match(/^(\`{3,}|~{3,})([^\`~\{]*)(\s*\{([^}]+)\})?\s*$/);
  if (!match) return null;
  return { fenceChar: match[1][0], fenceLength: match[1].length, lang: match[2].trim(), attrs: match[4] || null };
}

function isClosingFence(line, fenceChar, fenceLength) {
  const match = line.match(/^(\`{3,}|~{3,})\s*$/);
  if (!match) return false;
  return match[1][0] === fenceChar && match[1].length >= fenceLength;
}