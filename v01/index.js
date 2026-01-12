const DEFAULT_CONTEXT = {
  '@vocab': 'http://schema.org/',
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'dct': 'http://purl.org/dc/terms/',
  'foaf': 'http://xmlns.com/foaf/0.1/'
};

const DefaultDataFactory = {
  namedNode: (value) => ({ termType: 'NamedNode', value }),
  blankNode: (value = `b${Math.random().toString(36).slice(2, 11)}`) => ({
    termType: 'BlankNode',
    value
  }),
  literal: (value, languageOrDatatype) => {
    if (typeof languageOrDatatype === 'string') {
      return {
        termType: 'Literal',
        value,
        language: languageOrDatatype,
        datatype: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString' }
      };
    }
    return {
      termType: 'Literal',
      value,
      language: '',
      datatype: languageOrDatatype || { termType: 'NamedNode', value: 'http://www.w3.org/2001/XMLSchema#string' }
    };
  },
  quad: (subject, predicate, object, graph) => ({
    subject,
    predicate,
    object,
    graph: graph || DefaultDataFactory.defaultGraph()
  }),
  defaultGraph: () => ({ termType: 'DefaultGraph', value: '' })
};

function inferBaseIRI(markdown) {
  const h1Match = markdown.match(/^#\s+(.+?)(?:\s*\{[^}]+\})?$/m);
  if (h1Match) {
    const slug = h1Match[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (slug) return `urn:mdld:${slug}`;
  }

  let hash = 5381;
  for (let i = 0; i < markdown.length; i++) {
    hash = ((hash << 5) + hash) + markdown.charCodeAt(i);
  }
  return `urn:mdld:${Math.abs(hash).toString(16)}`;
}

function tokenizeMarkdown(text) {
  const tokens = [];
  const lines = text.split('\n');
  let i = 0;
  let inCodeBlock = false;
  let codeFence = null;
  let codeLang = null;
  let codeAttrs = {};
  let codeLines = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    const fenceMatch = line.match(/^(```+)(.*)$/);
    if (fenceMatch) {
      const [, fence, rest] = fenceMatch;

      if (!inCodeBlock) {
        inCodeBlock = true;
        codeFence = fence;
        codeLines = [];
        codeLang = null;
        codeAttrs = {};

        const restTrimmed = rest.trim();
        if (restTrimmed) {
          const attrIndex = restTrimmed.indexOf('{');
          const langPart = attrIndex >= 0 ? restTrimmed.substring(0, attrIndex).trim() : restTrimmed;
          if (langPart) {
            codeLang = langPart.split(/\s+/)[0];
          }

          const attrMatch = restTrimmed.match(/\{[^}]+\}/);
          if (attrMatch) {
            codeAttrs = parseAttributes(attrMatch[0]);
          }
        }

        i++;
        continue;
      }

      if (inCodeBlock && fence === codeFence) {
        tokens.push({
          type: 'code',
          lang: codeLang,
          text: codeLines.join('\n'),
          attrs: codeAttrs
        });

        inCodeBlock = false;
        codeFence = null;
        codeLang = null;
        codeAttrs = {};
        codeLines = [];

        i++;
        continue;
      }
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)(\s*\{[^}]+\})?$/);
    if (headingMatch) {
      const [, hashes, text, attrs] = headingMatch;
      let attributes = attrs ? parseAttributes(attrs) : {};

      if (!attrs && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/^\{[^}]+\}$/)) {
          attributes = parseAttributes(nextLine);
          i++;
        }
      }

      tokens.push({
        type: 'heading',
        depth: hashes.length,
        text: text.trim(),
        attrs: attributes
      });
      i++;
      continue;
    }

    const taskMatch = line.match(/^(\s*)([-*+])\s+\[([ xX])\]\s+(.+?)(\s*\{[^}]+\})?$/);
    if (taskMatch) {
      const [, indent, marker, checked, text, attrs] = taskMatch;
      tokens.push({
        type: 'taskItem',
        indent: indent.length,
        checked: checked.toLowerCase() === 'x',
        text: text.trim(),
        attrs: attrs ? parseAttributes(attrs) : {}
      });
      i++;
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(\s*\{[^}]+\})?$/);
    if (listMatch) {
      const [, indent, marker, text, attrs] = listMatch;
      const combinedText = attrs ? `${text}${attrs.trim()}` : text;

      tokens.push({
        type: 'listItem',
        indent: indent.length,
        text: combinedText.trim(),
        attrs: attrs ? parseAttributes(attrs) : {}
      });
      i++;
      continue;
    }

    if (trimmed && !trimmed.match(/^(---|```)/)) {
      tokens.push({
        type: 'paragraph',
        text: line
      });
      i++;
      continue;
    }

    if (!trimmed) {
      tokens.push({ type: 'blank' });
    }

    i++;
  }

  return tokens;
}

function parseAttributes(attrString) {
  const attrs = {};
  const cleaned = attrString.replace(/^\{|\}$/g, '').trim();

  const idMatch = cleaned.match(/#([^\s.]+)/);
  if (idMatch) attrs.id = idMatch[1];

  const classMatches = cleaned.match(/\.([^\s.#]+)/g);
  if (classMatches) {
    attrs.class = classMatches.map(c => c.substring(1)).join(' ');
  }

  const kvRegex = /(\w+)=["']([^"']*)["']/g;
  let match;
  while ((match = kvRegex.exec(cleaned)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

function parseInline(text) {
  const spans = [];
  const inlineRegex = /\[([^\]]+)\](?:\(([^)]+)\))?(?:\{([^}]+)\})?/g;
  let match;
  let lastIndex = 0;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      spans.push({
        type: 'text',
        value: text.substring(lastIndex, match.index)
      });
    }

    const [fullMatch, linkText, url, attrs] = match;
    spans.push({
      type: url ? 'link' : 'span',
      text: linkText,
      url: url || null,
      attrs: attrs ? parseAttributes(`{${attrs}}`) : {}
    });

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    spans.push({
      type: 'text',
      value: text.substring(lastIndex)
    });
  }

  return spans.length > 0 ? spans : [{ type: 'text', value: text }];
}

export class MDLDParser {
  constructor(options = {}) {
    this.options = {
      baseIRI: options.baseIRI || null,
      context: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
      dataFactory: options.dataFactory || DefaultDataFactory,
      ...options
    };

    this.df = this.options.dataFactory;
    this.quads = [];
    this.rootSubject = null;
    this.currentSubject = null;
    this.blankNodeMap = new Map();
  }

  hashBlankNode(input) {
    if (this.blankNodeMap.has(input)) {
      return this.blankNodeMap.get(input);
    }
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) + hash) + input.charCodeAt(i);
    }
    const bnId = `b${Math.abs(hash).toString(16).slice(0, 12)}`;
    this.blankNodeMap.set(input, bnId);
    return bnId;
  }

  parse(markdown) {
    this.quads = [];

    const baseIRI = this.options.baseIRI || inferBaseIRI(markdown);
    this.rootSubject = this.df.namedNode(baseIRI);
    this.currentSubject = this.rootSubject;

    const tokens = tokenizeMarkdown(markdown);
    this.processTokens(tokens);

    return this.quads;
  }

  processTokens(tokens) {
    let firstParagraph = true;
    let titleEmitted = false;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'heading') {
        if (token.depth === 1 && !titleEmitted && !token.attrs.id) {
          this.emitQuad(
            this.rootSubject,
            this.df.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            this.df.literal(token.text)
          );
          titleEmitted = true;
        }

        if (token.attrs.id) {
          const newSubject = this.resolveSubjectIRI(token.attrs.id);
          if (!newSubject) continue;

          if (token.attrs.typeof) {
            const types = token.attrs.typeof.trim().split(/\s+/).filter(Boolean);
            types.forEach(type => {
              const typeNode = this.resolveResource(type);
              if (typeNode) {
                this.emitQuad(
                  newSubject,
                  this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                  typeNode
                );
              }
            });
          }

          this.emitQuad(
            newSubject,
            this.df.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            this.df.literal(token.text.trim())
          );

          this.currentSubject = newSubject;
        }

        continue;
      }

      if (token.type === 'code') {
        let snippetSubject;

        if (token.attrs && token.attrs.id) {
          snippetSubject = this.resolveSubjectIRI(token.attrs.id);
          if (!snippetSubject) {
            snippetSubject = this.df.blankNode(
              this.hashBlankNode(`code:${token.lang || ''}:${token.text}`)
            );
          }
        } else {
          snippetSubject = this.df.blankNode(
            this.hashBlankNode(`code:${token.lang || ''}:${token.text}`)
          );
        }

        if (token.attrs && token.attrs.typeof) {
          const types = token.attrs.typeof.trim().split(/\s+/).filter(Boolean);
          types.forEach(type => {
            const typeNode = this.resolveResource(type);
            if (typeNode) {
              this.emitQuad(
                snippetSubject,
                this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                typeNode
              );
            }
          });
        } else {
          const defaultType = this.resolveResource('SoftwareSourceCode');
          if (defaultType) {
            this.emitQuad(
              snippetSubject,
              this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
              defaultType
            );
          }
        }

        if (token.lang) {
          const langPred = this.resolveResource('programmingLanguage');
          if (langPred) {
            this.emitQuad(snippetSubject, langPred, this.df.literal(token.lang));
          }
        }

        const textPred = this.resolveResource('text');
        if (textPred && token.text) {
          this.emitQuad(snippetSubject, textPred, this.df.literal(token.text));
        }

        const hasPartPred = this.resolveResource('hasPart');
        if (hasPartPred) {
          this.emitQuad(this.currentSubject, hasPartPred, snippetSubject);
        }

        continue;
      }

      if (token.type === 'paragraph') {
        if (firstParagraph && titleEmitted) {
          const text = token.text.trim();
          if (text && !text.match(/\[.*\]/)) {
            this.emitQuad(
              this.rootSubject,
              this.df.namedNode('http://purl.org/dc/terms/description'),
              this.df.literal(text)
            );
          }
          firstParagraph = false;
        }

        this.processInline(token.text);
        continue;
      }

      if (token.type === 'listItem') {
        this.processInline(token.text);
        continue;
      }

      if (token.type === 'taskItem') {
        let action;
        if (token.attrs.id) {
          action = this.resolveSubjectIRI(token.attrs.id);
          if (!action) {
            action = this.df.blankNode(this.hashBlankNode(`task:${token.text}`));
          }
        } else {
          action = this.df.blankNode(this.hashBlankNode(`task:${token.text}`));
        }

        if (token.attrs.typeof) {
          const types = token.attrs.typeof.trim().split(/\s+/).filter(Boolean);
          types.forEach(type => {
            const typeNode = this.resolveResource(type);
            if (typeNode) {
              this.emitQuad(
                action,
                this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                typeNode
              );
            }
          });
        } else {
          this.emitQuad(
            action,
            this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            this.df.namedNode('http://schema.org/Action')
          );
        }

        this.emitQuad(
          action,
          this.df.namedNode('http://schema.org/name'),
          this.df.literal(token.text)
        );

        const status = token.checked
          ? 'http://schema.org/CompletedActionStatus'
          : 'http://schema.org/PotentialActionStatus';

        this.emitQuad(
          action,
          this.df.namedNode('http://schema.org/actionStatus'),
          this.df.namedNode(status)
        );

        this.emitQuad(
          this.currentSubject,
          this.df.namedNode('http://schema.org/potentialAction'),
          action
        );

        continue;
      }
    }
  }

  processInline(text) {
    const spans = parseInline(text);
    const urlRegex = /https?:\/\/[^\s\]\)]+/g;

    for (const span of spans) {
      if (span.type === 'link') {
        // Handle regular Markdown links [text](url)
        const url = span.url;
        const linkText = span.text;

        // First triple: current subject references the URL
        this.emitQuad(
          this.currentSubject,
          this.df.namedNode('http://purl.org/dc/terms/references'),
          this.df.namedNode(url)
        );

        // Second triple: URL has a label (the link text)
        if (linkText) {
          this.emitQuad(
            this.df.namedNode(url),
            this.df.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            this.df.literal(linkText)
          );
        }
        continue;
      }

      if (span.type === 'text') {
        // Handle bare URLs in text
        let match;
        const processed = new Set();
        while ((match = urlRegex.exec(span.value)) !== null) {
          const url = match[0];
          if (!processed.has(url)) {
            this.emitQuad(
              this.currentSubject,
              this.df.namedNode('http://purl.org/dc/terms/references'),
              this.df.namedNode(url)
            );
            processed.add(url);
          }
        }
        continue;
      }

      if (span.type === 'link' || span.type === 'span') {
        const attrs = span.attrs;
        let subject = this.currentSubject;

        if (attrs.id) {
          const resolvedSubject = this.resolveSubjectIRI(attrs.id);
          if (resolvedSubject) {
            subject = resolvedSubject;
          }

          if (attrs.typeof) {
            const types = attrs.typeof.trim().split(/\s+/).filter(Boolean);
            types.forEach(type => {
              const typeNode = this.resolveResource(type);
              if (typeNode) {
                this.emitQuad(
                  subject,
                  this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                  typeNode
                );
              }
            });
          }

          if (span.text && !attrs.property && !attrs.rel) {
            this.emitQuad(
              subject,
              this.df.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
              this.df.literal(span.text.trim())
            );
          }
        }

        if (attrs.property) {
          const properties = attrs.property.trim().split(/\s+/).filter(Boolean);
          properties.forEach(prop => {
            const predicate = this.resolveResource(prop);
            if (!predicate) return;

            let object;
            if (attrs.datatype) {
              const datatypeIRI = this.resolveResource(attrs.datatype);
              if (datatypeIRI && datatypeIRI.value) {
                object = this.df.literal(span.text, datatypeIRI);
              } else {
                object = this.df.literal(span.text);
              }
            } else {
              object = this.df.literal(span.text);
            }

            this.emitQuad(subject, predicate, object);
          });
        }

        if (attrs.rel) {
          const rels = attrs.rel.trim().split(/\s+/).filter(Boolean);
          let objectNode;

          if (span.url) {
            objectNode = this.resolveObjectIRI(span.url);
          } else if (attrs.typeof && !attrs.id) {
            objectNode = this.df.blankNode(
              this.hashBlankNode(`span:${span.text}:${JSON.stringify(attrs)}`)
            );

            const types = attrs.typeof.trim().split(/\s+/).filter(Boolean);
            types.forEach(type => {
              const typeNode = this.resolveResource(type);
              if (typeNode) {
                this.emitQuad(
                  objectNode,
                  this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                  typeNode
                );
              }
            });
          }

          if (objectNode) {
            rels.forEach(rel => {
              const predicate = this.resolveResource(rel);
              if (predicate) {
                this.emitQuad(subject, predicate, objectNode);
              }
            });
          }
        }
      }
    }
  }

  resolveSubjectIRI(idValue) {
    if (!idValue || typeof idValue !== 'string') return null;

    const trimmed = idValue.trim();
    if (!trimmed) return null;

    if (trimmed.match(/^https?:/)) {
      return this.df.namedNode(trimmed);
    }

    if (trimmed.startsWith('_:')) {
      return this.df.blankNode(trimmed.substring(2));
    }

    if (trimmed.startsWith('#')) {
      const baseForFragment = this.rootSubject.value.split('#')[0];
      return this.df.namedNode(baseForFragment + trimmed);
    }

    if (trimmed.includes(':')) {
      const [prefix, reference] = trimmed.split(':', 2);
      if (this.options.context[prefix]) {
        return this.df.namedNode(this.options.context[prefix] + reference);
      }
      return this.df.namedNode(trimmed);
    }

    const baseForFragment = this.rootSubject.value.split('#')[0];
    return this.df.namedNode(baseForFragment + '#' + trimmed);
  }

  resolveObjectIRI(urlValue) {
    if (!urlValue || typeof urlValue !== 'string') return null;

    const trimmed = urlValue.trim();
    if (!trimmed) return null;

    if (trimmed.match(/^https?:/)) {
      return this.df.namedNode(trimmed);
    }

    if (trimmed.startsWith('_:')) {
      return this.df.blankNode(trimmed.substring(2));
    }

    if (trimmed.startsWith('#')) {
      const baseForFragment = this.rootSubject.value.split('#')[0];
      return this.df.namedNode(baseForFragment + trimmed);
    }

    if (trimmed.includes(':')) {
      const [prefix, reference] = trimmed.split(':', 2);
      if (this.options.context[prefix]) {
        return this.df.namedNode(this.options.context[prefix] + reference);
      }
      if (prefix === 'xsd') {
        return this.df.namedNode('http://www.w3.org/2001/XMLSchema#' + reference);
      }
      return this.df.namedNode(trimmed);
    }

    const baseForFragment = this.rootSubject.value.split('#')[0];
    return this.df.namedNode(baseForFragment + '#' + trimmed);
  }

  resolveResource(term) {
    if (!term || typeof term !== 'string') return null;

    const trimmed = term.trim();
    if (!trimmed) return null;

    if (trimmed.match(/^https?:/)) {
      return this.df.namedNode(trimmed);
    }

    if (trimmed.includes(':')) {
      const [prefix, reference] = trimmed.split(':', 2);
      if (this.options.context[prefix]) {
        return this.df.namedNode(this.options.context[prefix] + reference);
      }
      if (prefix === 'xsd') {
        return this.df.namedNode('http://www.w3.org/2001/XMLSchema#' + reference);
      }
    }

    const vocab = this.options.context['@vocab'] || 'http://schema.org/';
    return this.df.namedNode(vocab + trimmed);
  }

  emitQuad(subject, predicate, object) {
    if (!subject || !predicate || !object) return;
    const quad = this.df.quad(subject, predicate, object);
    this.quads.push(quad);
  }

  getQuads() {
    return this.quads;
  }
}

export function parseMDLD(markdown, options = {}) {
  const parser = new MDLDParser(options);
  return parser.parse(markdown);
}

export default { MDLDParser, parseMDLD, DefaultDataFactory, DEFAULT_CONTEXT };