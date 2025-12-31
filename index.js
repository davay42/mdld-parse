/**
 * MD-LD Parser — Markdown-Linked Data to RDF Quads
 * 
 * Zero-dependency, streaming-capable parser for MD-LD documents.
 * Outputs RDF/JS compatible quads.
 */

// ============================================================================
// RDF/JS Data Factory (Minimal Implementation)
// ============================================================================

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

// ============================================================================
// YAML-LD Parser (Minimal YAML subset for frontmatter)
// ============================================================================

function parseYAMLLD(yamlText) {
  try {
    const lines = yamlText.trim().split('\n');
    const obj = {};
    let currentKey = null;
    let indent = 0;
    let inArray = false;
    let currentArray = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const leadingSpaces = line.match(/^\s*/)[0].length;

      // Array item
      if (trimmed.startsWith('- ')) {
        if (!inArray) {
          currentArray = [];
          inArray = true;
        }
        const value = trimmed.substring(2).trim();
        currentArray.push(parseYAMLValue(value));
        continue;
      }

      // Key-value pair
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim().replace(/^['"]|['"]$/g, '');
        let value = trimmed.substring(colonIndex + 1).trim();

        // Save previous array
        if (inArray && currentKey && currentArray) {
          obj[currentKey] = currentArray;
          inArray = false;
          currentArray = null;
        }

        currentKey = key;

        if (!value) {
          // Empty value or nested object/array coming
          indent = leadingSpaces;
          continue;
        }

        obj[key] = parseYAMLValue(value);
      }
    }

    // Save last array
    if (inArray && currentKey && currentArray) {
      obj[currentKey] = currentArray;
    }

    return obj;
  } catch (e) {
    console.warn('YAML-LD parse error:', e);
    return {};
  }
}

function parseYAMLValue(value) {
  value = value.replace(/^['"]|['"]$/g, '');

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  return value;
}

// ============================================================================
// Markdown Tokenizer (Minimal - focuses on structure)
// ============================================================================

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

    // Fenced code block ```lang {attrs}
    const fenceMatch = line.match(/^(```+)(.*)$/);
    if (fenceMatch) {
      const [, fence, rest] = fenceMatch;

      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        codeFence = fence;
        codeLines = [];
        codeLang = null;
        codeAttrs = {};

        const restTrimmed = rest.trim();
        if (restTrimmed) {
          // Extract language (first token that is not an attribute block)
          const attrIndex = restTrimmed.indexOf('{');
          const langPart = attrIndex >= 0 ? restTrimmed.substring(0, attrIndex).trim() : restTrimmed;
          if (langPart) {
            codeLang = langPart.split(/\s+/)[0];
          }

          // Attributes after language: ```lang {#id typeof="..."}
          const attrMatch = restTrimmed.match(/\{[^}]+\}/);
          if (attrMatch) {
            codeAttrs = parseAttributes(attrMatch[0]);
          }
        }

        i++;
        continue;
      }

      // Closing fence (must match opening fence length)
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

    // Heading with potential attributes on next line
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)(\s*\{[^}]+\})?$/);
    if (headingMatch) {
      const [, hashes, text, attrs] = headingMatch;
      let attributes = attrs ? parseAttributes(attrs) : {};

      // Check next line for attributes
      if (!attrs && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/^\{[^}]+\}$/)) {
          attributes = parseAttributes(nextLine);
          i++; // Skip the attribute line
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

    // Task list item
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

    // Regular list item (must come after task item check)
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(\s*\{[^}]+\})?$/);
    if (listMatch) {
      const [, indent, marker, text, attrs] = listMatch;

      // If the list item has trailing attribute syntax (e.g. - [Link](#id){rel="hasPart"})
      // treat those attributes as part of the inline content so that parseInline
      // can correctly interpret them on the link/span itself.
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

    // Paragraph
    if (trimmed && !trimmed.match(/^(---|```)/)) {
      tokens.push({
        type: 'paragraph',
        text: line
      });
      i++;
      continue;
    }

    // Blank line
    if (!trimmed) {
      tokens.push({ type: 'blank' });
    }

    i++;
  }

  return tokens;
}

// ============================================================================
// Attribute Parser {#id .class key="value"}
// ============================================================================

function parseAttributes(attrString) {
  const attrs = {};
  const cleaned = attrString.replace(/^\{|\}$/g, '').trim();

  // ID: #something
  const idMatch = cleaned.match(/#([^\s.]+)/);
  if (idMatch) attrs.id = idMatch[1];

  // Classes: .class1 .class2
  const classMatches = cleaned.match(/\.([^\s.#]+)/g);
  if (classMatches) {
    attrs.class = classMatches.map(c => c.substring(1)).join(' ');
  }

  // Key-value pairs: key="value" or key='value'
  const kvRegex = /(\w+)=["']([^"']*)["']/g;
  let match;
  while ((match = kvRegex.exec(cleaned)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

// ============================================================================
// Inline Parser (for [text](url){attrs} and [text]{attrs})
// ============================================================================

function parseInline(text) {
  const spans = [];
  let pos = 0;

  // Pattern: [text](url){attrs} or [text]{attrs}
  const inlineRegex = /\[([^\]]+)\](?:\(([^)]+)\))?(?:\{([^}]+)\})?/g;
  let match;
  let lastIndex = 0;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Text before match
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

  // Remaining text
  if (lastIndex < text.length) {
    spans.push({
      type: 'text',
      value: text.substring(lastIndex)
    });
  }

  return spans.length > 0 ? spans : [{ type: 'text', value: text }];
}

// ============================================================================
// MD-LD Parser
// ============================================================================

export class MDLDParser {
  constructor(options = {}) {
    this.options = {
      baseIRI: options.baseIRI || '',
      defaultVocab: options.defaultVocab || 'http://schema.org/',
      dataFactory: options.dataFactory || DefaultDataFactory,
      ...options
    };

    this.df = this.options.dataFactory;
    this.quads = [];
    this.context = null;
    this.rootSubject = null;
    this.currentSubject = null;
    this.blankNodeCounter = 0;
    this.subjectStack = [];
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

    // Extract frontmatter
    const { frontmatter, body } = this.extractFrontmatter(markdown);

    // Parse YAML-LD frontmatter
    if (frontmatter) {
      try {
        this.context = parseYAMLLD(frontmatter);

        // Check for @base in @context (JSON-LD standard)
        if (this.context['@context']?.['@base']) {
          this.options.baseIRI = this.context['@context']['@base'];
        }

        this.rootSubject = this.resolveRootSubject(this.context);

        // Emit root subject type if present
        if (this.context['@type']) {
          const types = Array.isArray(this.context['@type'])
            ? this.context['@type']
            : [this.context['@type']];

          types.forEach(type => {
            const typeNode = this.resolveResource(type);
            if (typeNode) {
              this.emitQuad(
                this.rootSubject,
                this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                typeNode
              );
            }
          });
        }
      } catch (e) {
        console.error('YAML-LD parse error:', e);
        this.context = {
          '@context': { '@vocab': this.options.defaultVocab }
        };
        this.rootSubject = this.df.namedNode(this.options.baseIRI || '');
      }
    } else {
      // No frontmatter - use base IRI as root
      this.context = {
        '@context': { '@vocab': this.options.defaultVocab }
      };
      this.rootSubject = this.df.namedNode(this.options.baseIRI || '');
    }

    this.currentSubject = this.rootSubject;

    // Tokenize markdown
    const tokens = tokenizeMarkdown(body);

    // Process tokens
    this.processTokens(tokens);

    return this.quads;
  }

  extractFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (match) {
      return { frontmatter: match[1], body: match[2] };
    }
    return { frontmatter: null, body: markdown };
  }

  resolveRootSubject(context) {
    if (context['@id']) {
      const id = context['@id'];
      if (id.startsWith('#')) {
        const fullIRI = (this.options.baseIRI || '') + id;
        return this.df.namedNode(fullIRI);
      }
      if (id.startsWith('_:')) {
        return this.df.blankNode(id.substring(2));
      }
      if (id.includes(':')) {
        return this.df.namedNode(id);
      }
      return this.df.namedNode(this.options.baseIRI + id);
    }
    return this.df.namedNode(this.options.baseIRI || '');
  }

  getRootFragment() {
    const rootValue = this.rootSubject.value;
    const hashIndex = rootValue.lastIndexOf('#');
    return hashIndex >= 0 ? rootValue.substring(hashIndex + 1) : '';
  }

  /**
   * Resolves an object IRI from a URL (used in rel attributes).
   * Supports:
   * - Full IRIs: http://example.org/alice
   * - CURIEs: ex:Alice (expanded via context)
   * - Blank nodes: _:bnode1
   * - Fragment relative to root: #alice (becomes baseIRI#alice)
   */
  resolveObjectIRI(urlValue) {
    if (!urlValue || typeof urlValue !== 'string') {
      return null;
    }

    const trimmed = urlValue.trim();
    if (!trimmed) return null;

    // Full IRI (http:// or https://)
    if (trimmed.match(/^https?:/)) {
      return this.df.namedNode(trimmed);
    }

    // Blank node
    if (trimmed.startsWith('_:')) {
      return this.df.blankNode(trimmed.substring(2));
    }

    // Fragment relative to root (starts with #)
    if (trimmed.startsWith('#')) {
      const baseForFragment = this.rootSubject.value.split('#')[0];
      return this.df.namedNode(baseForFragment + trimmed);
    }

    // CURIE (contains : but not at start)
    if (trimmed.includes(':')) {
      const [prefix, reference] = trimmed.split(':', 2);
      // Check both nested @context and top-level context (YAML-LD parser may flatten)
      const contextObj = this.context?.['@context'] || this.context || {};

      if (contextObj[prefix]) {
        return this.df.namedNode(contextObj[prefix] + reference);
      }

      // Default XSD namespace
      if (prefix === 'xsd') {
        return this.df.namedNode('http://www.w3.org/2001/XMLSchema#' + reference);
      }

      // If prefix not found in context, treat as full IRI
      return this.df.namedNode(trimmed);
    }

    // Plain fragment (relative to base IRI)
    const baseForFragment = this.rootSubject.value.split('#')[0];
    return this.df.namedNode(baseForFragment + '#' + trimmed);
  }

  /**
   * Resolves a subject IRI from an id attribute.
   * Supports:
   * - Full IRIs: http://example.org/alice
   * - CURIEs: ex:Alice (expanded via context)
   * - Blank nodes: _:bnode1
   * - Fragment relative to root: #alice (becomes baseIRI#alice)
   * - Plain fragment: alice (becomes baseIRI#alice)
   */
  resolveSubjectIRI(idValue) {
    if (!idValue || typeof idValue !== 'string') {
      return null;
    }

    const trimmed = idValue.trim();
    if (!trimmed) return null;

    // Full IRI (http:// or https://)
    if (trimmed.match(/^https?:/)) {
      return this.df.namedNode(trimmed);
    }

    // Blank node
    if (trimmed.startsWith('_:')) {
      return this.df.blankNode(trimmed.substring(2));
    }

    // Fragment relative to root (starts with #)
    if (trimmed.startsWith('#')) {
      const rootFragment = this.getRootFragment();
      const fragment = trimmed.substring(1);

      if (fragment === rootFragment) {
        // Same as root document subject
        return this.rootSubject;
      } else {
        // Fragment relative to root base
        const baseForFragment = this.rootSubject.value.split('#')[0];
        return this.df.namedNode(baseForFragment + '#' + fragment);
      }
    }

    // CURIE (contains : but not at start)
    if (trimmed.includes(':')) {
      const [prefix, reference] = trimmed.split(':', 2);
      // Check both nested @context and top-level context (YAML-LD parser may flatten)
      const contextObj = this.context?.['@context'] || this.context || {};

      if (contextObj[prefix]) {
        return this.df.namedNode(contextObj[prefix] + reference);
      }

      // Default XSD namespace
      if (prefix === 'xsd') {
        return this.df.namedNode('http://www.w3.org/2001/XMLSchema#' + reference);
      }

      // If prefix not found in context, treat as full IRI
      return this.df.namedNode(trimmed);
    }

    // Plain fragment (relative to base IRI)
    const rootFragment = this.getRootFragment();
    if (trimmed === rootFragment) {
      return this.rootSubject;
    } else {
      const baseForFragment = this.rootSubject.value.split('#')[0];
      return this.df.namedNode(baseForFragment + '#' + trimmed);
    }
  }

  processTokens(tokens) {
    let firstParagraph = true;
    let titleEmitted = false;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'heading') {
        // First h1 becomes label (but don't emit if heading has #id attribute)
        if (token.depth === 1 && !titleEmitted && !token.attrs.id) {
          this.emitQuad(
            this.rootSubject,
            this.df.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            this.df.literal(token.text)
          );
          titleEmitted = true;
        }

        // Heading with #id becomes new subject
        if (token.attrs.id) {
          const newSubject = this.resolveSubjectIRI(token.attrs.id);
          if (!newSubject) continue;

          // Type assertion
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

          // Heading text becomes an rdfs:label of the subject
          this.emitQuad(
            newSubject,
            this.df.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            this.df.literal(token.text.trim())
          );

          // Set as current subject
          this.currentSubject = newSubject;
          this.subjectStack.push(newSubject);
        } else if (!titleEmitted) {
          // Heading without id keeps parent context
          // but h1 without attributes still sets root as current
          if (token.depth === 1) {
            this.currentSubject = this.rootSubject;
          }
        }

        continue;
      }

      if (token.type === 'code') {
        // Code blocks become SoftwareSourceCode-like resources
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

        // Type assertion: typeof override or default SoftwareSourceCode
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

        // Programming language from fenced code info string
        if (token.lang) {
          const langPred = this.resolveResource('programmingLanguage');
          if (langPred) {
            this.emitQuad(
              snippetSubject,
              langPred,
              this.df.literal(token.lang)
            );
          }
        }

        // Raw source text
        const textPred = this.resolveResource('text');
        if (textPred && token.text) {
          this.emitQuad(
            snippetSubject,
            textPred,
            this.df.literal(token.text)
          );
        }

        // Link from current subject to code snippet
        const hasPartPred = this.resolveResource('hasPart');
        if (hasPartPred) {
          this.emitQuad(
            this.currentSubject,
            hasPartPred,
            snippetSubject
          );
        }

        continue;
      }

      if (token.type === 'paragraph') {
        // First paragraph after title becomes description
        if (firstParagraph && titleEmitted) {
          const text = token.text.trim();
          if (text && !text.match(/\[.*\]/)) { // Simple text, no links
            this.emitQuad(
              this.rootSubject,
              this.df.namedNode('http://purl.org/dc/terms/description'),
              this.df.literal(text)
            );
          }
          firstParagraph = false;
        }

        // Process inline annotations
        this.processInline(token.text);
        continue;
      }

      if (token.type === 'listItem') {
        this.processInline(token.text);
        continue;
      }

      if (token.type === 'taskItem') {
        // Task items create Action instances
        let action;
        if (token.attrs.id) {
          action = this.resolveSubjectIRI(token.attrs.id);
          if (!action) {
            action = this.df.blankNode(this.hashBlankNode(`task:${token.text}`));
          }
        } else {
          action = this.df.blankNode(this.hashBlankNode(`task:${token.text}`));
        }

        // Type declaration (always Action, or overridden by typeof)
        let actionType = 'http://schema.org/Action';
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
            this.df.namedNode(actionType)
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

        // Link to current subject
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

    for (const span of spans) {
      if (span.type === 'text') {
        continue;
      }

      if (span.type === 'link' || span.type === 'span') {
        const attrs = span.attrs;

        // Subject declaration
        let subject = this.currentSubject;
        if (attrs.id) {
          const resolvedSubject = this.resolveSubjectIRI(attrs.id);
          if (resolvedSubject) {
            subject = resolvedSubject;
          }

          // Type assertion
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
        }

        // Property (literal)
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

        // Relationship (object property)
        if (attrs.rel && span.url) {
          const rels = attrs.rel.trim().split(/\s+/).filter(Boolean);
          const objectNode = this.resolveObjectIRI(span.url);
          if (!objectNode) continue;

          rels.forEach(rel => {
            const predicate = this.resolveResource(rel);
            if (predicate) {
              this.emitQuad(subject, predicate, objectNode);
            }
          });
        }

        // typeof without id creates typed blank node
        if (attrs.typeof && !attrs.id && attrs.rel) {
          const blankSubject = this.df.blankNode(this.hashBlankNode(`span:${span.text}:${JSON.stringify(attrs)}}`));

          const types = attrs.typeof.trim().split(/\s+/).filter(Boolean);
          types.forEach(type => {
            const typeNode = this.resolveResource(type);
            if (typeNode) {
              this.emitQuad(
                blankSubject,
                this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                typeNode
              );
            }
          });

          // Link from current subject
          if (attrs.rel) {
            const rels = attrs.rel.trim().split(/\s+/).filter(Boolean);
            rels.forEach(rel => {
              const predicate = this.resolveResource(rel);
              if (predicate) {
                this.emitQuad(subject, predicate, blankSubject);
              }
            });
          }
        }
      }
    }
  }

  resolveResource(term) {
    if (!term || typeof term !== 'string') return null;

    const trimmed = term.trim();
    if (!trimmed) return null;

    // Absolute IRI
    if (trimmed.match(/^https?:/)) {
      return this.df.namedNode(trimmed);
    }

    // CURIE
    if (trimmed.includes(':')) {
      const [prefix, reference] = trimmed.split(':', 2);
      // Check both nested @context and top-level context (YAML-LD parser may flatten)
      const contextObj = this.context?.['@context'] || this.context || {};

      if (contextObj[prefix]) {
        return this.df.namedNode(contextObj[prefix] + reference);
      }

      // Default XSD namespace
      if (prefix === 'xsd') {
        return this.df.namedNode('http://www.w3.org/2001/XMLSchema#' + reference);
      }
    }

    // Default vocab
    const vocab = this.context?.['@context']?.['@vocab'] || this.options.defaultVocab;
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

// ============================================================================
// Convenience API
// ============================================================================

export function parseMDLD(markdown, options = {}) {
  const parser = new MDLDParser(options);
  return parser.parse(markdown);
}

export default { MDLDParser, parseMDLD, DefaultDataFactory };