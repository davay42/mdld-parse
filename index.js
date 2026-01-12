const DEFAULT_CONTEXT = {
    '@vocab': 'http://schema.org/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    schema: 'http://schema.org/'
};

const DataFactory = {
    namedNode: (v) => ({ termType: 'NamedNode', value: v }),
    blankNode: (v = `b${Math.random().toString(36).slice(2, 11)}`) => ({ termType: 'BlankNode', value: v }),
    literal: (v, lang) => {
        if (typeof lang === 'string') {
            return { termType: 'Literal', value: v, language: lang, datatype: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') };
        }
        return { termType: 'Literal', value: v, language: '', datatype: lang || DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#string') };
    },
    quad: (s, p, o, g) => ({ subject: s, predicate: p, object: o, graph: g || DataFactory.namedNode('') })
};

function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return Math.abs(h).toString(16).slice(0, 12);
}

function expandIRI(term, ctx) {
    if (!term) return null;
    const t = term.trim();
    if (t.match(/^https?:/)) return t;
    if (t.includes(':')) {
        const [prefix, ref] = t.split(':', 2);
        return ctx[prefix] ? ctx[prefix] + ref : t;
    }
    return (ctx['@vocab'] || '') + t;
}

// Annotation parsing helpers
function parseSubject(annotation) {
    if (annotation === '=') return 'RESET';
    const match = annotation.match(/^=([^\s]+)/);
    return match ? match[1].trim() : null;
}

function parseLanguage(annotation) {
    const match = annotation.match(/@([a-z]{2}(?:-[A-Z]{2})?)/);
    return match ? match[1] : null;
}

function parseDatatype(annotation) {
    const match = annotation.match(/\^\^([a-zA-Z_][a-zA-Z0-9_-]*(?::[^\s]+)?|[a-zA-Z0-9._-]+:[^\s]+)/);
    return match ? match[1] : null;
}

function parseTypes(annotation) {
    const matches = annotation.match(/\.[a-zA-Z_][a-zA-Z0-9_-]*(?::[^\s.=^@]+)?/g);
    return matches ? matches.map(t => ({ kind: 'type', classIRI: t.substring(1) })) : [];
}

function parseProperties(annotation, excludeDatatype = false) {
    let text = annotation;
    if (excludeDatatype) {
        const datatype = parseDatatype(text);
        if (datatype) {
            text = text.replace(`^^${datatype}`, '');
        }
    }

    const matches = text.match(/(?:^|\s)([a-zA-Z_][a-zA-Z0-9_-]*(?::[^\s.=^@]+)?)(?=\s|$|@|\^\^)/g);
    if (!matches) return [];

    return matches
        .map(p => p.trim())
        .filter(p => p && !p.startsWith('.') && !p.startsWith('=') && !p.startsWith('^'))
        .map(p => ({ kind: 'property', predicate: p, direction: 'forward' }));
}

function parseReverseProperties(annotation) {
    const matches = annotation.match(/\^([a-zA-Z_][a-zA-Z0-9_-]*(?::[^\s.=^@]+)?)/g);
    return matches ? matches.map(r => ({ kind: 'property', predicate: r.substring(1), direction: 'reverse' })) : [];
}

export function parseAnnotation(raw) {
    try {
        const cleaned = raw.replace(/^\{|\}$/g, '').trim();
        if (!cleaned) return { subject: null, entries: [], datatype: null, language: null };

        // Validate basic structure
        const openQuotes = (cleaned.match(/"/g) || []).length;
        if (openQuotes % 2 !== 0) {
            console.warn(`Unbalanced quotes in annotation: ${raw}`);
            return { subject: null, entries: [], datatype: null, language: null };
        }

        const subject = parseSubject(cleaned);
        const language = parseLanguage(cleaned);
        const datatype = parseDatatype(cleaned);

        const entries = [
            ...parseTypes(cleaned),
            ...parseReverseProperties(cleaned),
            ...parseProperties(cleaned, !!datatype)
        ];

        // Validate that we have valid entries or subject
        if (entries.length === 0 && !subject) {
            console.warn(`No valid entries found in annotation: ${raw}`);
            return { subject: null, entries: [], datatype: null, language: null };
        }

        return { subject, entries, datatype, language };
    } catch (error) {
        console.error(`Error parsing annotation ${raw}:`, error);
        return { subject: null, entries: [], datatype: null, language: null };
    }
}

// Token scanning helpers
function createToken(type, content, range = null) {
    const token = { type, ...content };
    if (range) token.range = range;
    return token;
}

function parseCodeFence(line) {
    return line.match(/^(`{3,})(.*)/);
}

function parseHeading(line) {
    return line.match(/^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
}

function parsePrefix(line) {
    return line.match(/^\[([^\]]+)\]\s*\{:\s*([^}]+)\}/);
}

function parseList(line) {
    return line.match(/^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
}

function parseBlockquote(line) {
    return line.match(/^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/);
}

function parseParagraph(line) {
    return line.match(/^(.+?)(?:\s*(\{[^}]+\}))?$/);
}

function scanTokens(text) {
    const tokens = [];
    const lines = text.split('\n');
    let position = 0;
    let codeBlock = {
        active: false,
        fence: null,
        startPos: 0,
        content: [],
        language: null,
        attributes: null
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = position;
        position += line.length + 1;

        // Handle code blocks
        const fenceMatch = parseCodeFence(line);
        if (fenceMatch) {
            if (!codeBlock.active) {
                // Start code block
                codeBlock.active = true;
                codeBlock.fence = fenceMatch[1];
                codeBlock.startPos = lineStart;
                codeBlock.content = [];

                const rest = fenceMatch[2].trim();
                const attrIndex = rest.indexOf('{');
                codeBlock.language = attrIndex >= 0 ? rest.substring(0, attrIndex).trim() : rest;
                codeBlock.attributes = rest.match(/\{[^}]+\}/)?.[0];
                continue;
            } else if (fenceMatch[1] === codeBlock.fence) {
                // End code block
                tokens.push(createToken('code', {
                    text: codeBlock.content.join('\n'),
                    lang: codeBlock.language,
                    attrs: codeBlock.attributes
                }, [codeBlock.startPos, lineStart]));

                codeBlock.active = false;
                continue;
            }
        }

        if (codeBlock.active) {
            codeBlock.content.push(line);
            continue;
        }

        // Handle other token types
        const headingMatch = parseHeading(line);
        if (headingMatch) {
            tokens.push(createToken('heading', {
                depth: headingMatch[1].length,
                text: headingMatch[2].trim(),
                attrs: headingMatch[3]
            }, [lineStart, position]));
            continue;
        }

        const prefixMatch = parsePrefix(line);
        if (prefixMatch) {
            tokens.push(createToken('prefix', {
                prefix: prefixMatch[1],
                iri: prefixMatch[2].trim()
            }));
            continue;
        }

        const listMatch = parseList(line);
        if (listMatch) {
            tokens.push(createToken('list', {
                indent: listMatch[1].length,
                text: listMatch[3].trim(),
                attrs: listMatch[4]
            }, [lineStart, position]));
            continue;
        }

        const blockquoteMatch = parseBlockquote(line);
        if (blockquoteMatch) {
            tokens.push(createToken('blockquote', {
                text: blockquoteMatch[1].trim(),
                attrs: blockquoteMatch[2]
            }, [lineStart, position]));
            continue;
        }

        const paraMatch = parseParagraph(line);
        if (line.trim() && paraMatch) {
            tokens.push(createToken('para', {
                text: paraMatch[1].trim(),
                attrs: paraMatch[2] || null
            }, [lineStart, position]));
        }
    }

    return tokens;
}

// Inline value extraction helpers
function findMatchingBracket(text, startPos, openChar, closeChar) {
    let depth = 1;
    let pos = startPos + 1;
    while (pos < text.length && depth > 0) {
        if (text[pos] === openChar) depth++;
        if (text[pos] === closeChar) depth--;
        if (depth === 0) return pos;
        pos++;
    }
    return -1;
}

function parseLinkDestination(text, startPos) {
    if (text[startPos] !== '(') return null;

    const closeParen = findMatchingBracket(text, startPos, '(', ')');
    return closeParen !== -1 ? {
        url: text.substring(startPos + 1, closeParen),
        endPos: closeParen + 1
    } : null;
}

function parseAttributes(text, startPos) {
    const attrsMatch = text.substring(startPos).match(/^\s*\{([^}]+)\}/);
    if (!attrsMatch) return null;

    return {
        attrs: `{${attrsMatch[1]}`,
        endPos: startPos + attrsMatch[0].length
    };
}

function createSpan(type, text, url = null, attrs = null, range = null) {
    const span = { type, text };
    if (url) span.url = url;
    if (attrs) span.attrs = attrs;
    if (range) span.range = range;
    return span;
}

function extractInlineValue(text, baseOffset = 0) {
    const spans = [];
    let position = 0;

    while (position < text.length) {
        const bracketStart = text.indexOf('[', position);
        if (bracketStart === -1) {
            if (position < text.length) {
                spans.push(createSpan('text', text.substring(position)));
            }
            break;
        }

        // Add text before bracket
        if (bracketStart > position) {
            spans.push(createSpan('text', text.substring(position, bracketStart)));
        }

        const bracketEnd = findMatchingBracket(text, bracketStart, '[', ']');
        if (bracketEnd === -1) {
            spans.push(createSpan('text', text.substring(bracketStart)));
            break;
        }

        const spanText = text.substring(bracketStart + 1, bracketEnd);
        let spanEnd = bracketEnd + 1;

        // Parse optional link destination
        const link = parseLinkDestination(text, spanEnd);
        if (link) {
            spanEnd = link.endPos;
        }

        // Parse optional attributes
        const attrs = parseAttributes(text, spanEnd);
        if (attrs) {
            spanEnd = attrs.endPos;
        }

        spans.push(createSpan(
            link ? 'link' : 'span',
            spanText,
            link?.url,
            attrs?.attrs,
            [baseOffset + bracketStart, baseOffset + spanEnd]
        ));

        position = spanEnd;
    }

    return spans.length ? spans : [createSpan('text', text)];
}

// Block and quad creation helpers
function createBlock(subject, entries, range, ctx) {
    const expanded = entries.map(e => ({
        ...e,
        predicate: e.predicate ? expandIRI(e.predicate, ctx) : null,
        classIRI: e.classIRI ? expandIRI(e.classIRI, ctx) : null
    }));

    const blockId = hash([subject, ...expanded.map(e => JSON.stringify(e))].join('|'));
    return {
        id: blockId,
        range: { start: range[0], end: range[1] },
        subject,
        entries: expanded,
        context: { ...ctx }
    };
}

function emitQuad(quads, quadIndex, blockId, subject, predicate, object, dataFactory) {
    if (!subject || !predicate || !object) return;

    const quad = dataFactory.quad(subject, predicate, object);
    quads.push(quad);

    const key = JSON.stringify([
        quad.subject.value,
        quad.predicate.value,
        quad.object.value
    ]);
    quadIndex.set(key, blockId);
}

function createLiteralValue(value, datatype, language, context, dataFactory) {
    if (datatype) {
        return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
    }
    if (language) {
        return dataFactory.literal(value, language);
    }
    return dataFactory.literal(value);
}

function resolveSubject(annotationSubject, currentSubject, context, dataFactory) {
    if (annotationSubject) {
        const iri = expandIRI(annotationSubject, context);
        return dataFactory.namedNode(iri);
    }
    return currentSubject;
}

// Annotation processing helpers
function handleSubjectDeclaration(annotation, state) {
    if (annotation.subject === 'RESET') {
        state.currentSubject = null;
        return true;
    }

    if (annotation.subject) {
        const iri = expandIRI(annotation.subject, state.ctx);
        state.currentSubject = state.df.namedNode(iri);
        return true;
    }

    return false;
}

function emitTypeTriples(annotation, token, targetSubject, state, blockId) {
    annotation.entries
        .filter(e => e.kind === 'type')
        .forEach(e => {
            const typeSubject = token.url ?
                state.df.namedNode(expandIRI(token.url, state.ctx)) :
                targetSubject;

            emitQuad(
                state.quads, state.origin.quadIndex, blockId,
                typeSubject,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(e.classIRI),
                state.df
            );
        });
}

function emitPropertyTriples(annotation, token, targetSubject, originalSubject, state, blockId, textContent) {
    annotation.entries
        .filter(e => e.kind === 'property' && e.predicate)
        .forEach(e => {
            const predicate = state.df.namedNode(expandIRI(e.predicate, state.ctx));
            let object;

            if (token.url) {
                // Object property with URL
                object = state.df.namedNode(expandIRI(token.url, state.ctx));
            } else if (annotation.subject && !token.url) {
                // Subject declaration without URL
                if (e.direction === 'reverse') {
                    object = targetSubject;
                } else {
                    if (token.type === 'code') {
                        object = createLiteralValue(
                            textContent || token.text || '',
                            annotation.datatype,
                            annotation.language,
                            state.ctx,
                            state.df
                        );
                    } else {
                        object = targetSubject;
                    }
                }
            } else {
                // Literal property
                object = createLiteralValue(
                    textContent || token.text || '',
                    annotation.datatype,
                    annotation.language,
                    state.ctx,
                    state.df
                );
            }

            if (e.direction === 'reverse') {
                emitQuad(state.quads, state.origin.quadIndex, blockId, object, predicate, originalSubject, state.df);
            } else {
                const subject = annotation.subject && !token.url && token.type !== 'code' ? originalSubject : targetSubject;
                emitQuad(state.quads, state.origin.quadIndex, blockId, subject, predicate, object, state.df);
            }
        });
}

function processAnnotation(token, state, textContent = null) {
    if (!token.attrs) return;

    const annotation = parseAnnotation(token.attrs);
    const originalSubject = state.currentSubject;

    // Handle subject declaration
    handleSubjectDeclaration(annotation, state);

    // Skip if no subject for emitting triples
    if (!originalSubject && !annotation.subject) {
        return;
    }

    const targetSubject = resolveSubject(annotation.subject, originalSubject, state.ctx, state.df);
    const block = createBlock(targetSubject.value, annotation.entries, token.range, state.ctx);
    state.origin.blocks.set(block.id, block);

    // Handle list context types for list items
    if (token.type === 'list' && state.listContext && state.listContext.types.length > 0) {
        state.listContext.types.forEach(typeIRI => {
            emitQuad(
                state.quads, state.origin.quadIndex, block.id,
                targetSubject,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(typeIRI),
                state.df
            );
        });
    }

    // Emit type and property triples
    emitTypeTriples(annotation, token, targetSubject, state, block.id);
    emitPropertyTriples(annotation, token, targetSubject, originalSubject, state, block.id, textContent);
}

// List processing helpers
function setupListContext(token, state, nextToken) {
    const isListHeader = nextToken?.type === 'list';
    if (!token.attrs || !isListHeader) return false;

    const headerAnnotation = parseAnnotation(token.attrs);
    state.listContext = { predicate: null, types: [], reverse: false };

    headerAnnotation.entries.forEach(entry => {
        if (entry.kind === 'property') {
            state.listContext.predicate = expandIRI(entry.predicate, state.ctx);
            state.listContext.reverse = entry.direction === 'reverse';
        }
        if (entry.kind === 'type') {
            state.listContext.types.push(expandIRI(entry.classIRI, state.ctx));
        }
    });

    return true;
}

function processListItemProperties(annotation, token, state) {
    annotation.entries.forEach(entry => {
        if (entry.kind === 'type') {
            emitQuad(
                state.quads, state.origin.quadIndex, 'list-item',
                state.currentSubject,
                state.df.namedNode(expandIRI('rdf:type', state.ctx)),
                state.df.namedNode(expandIRI(entry.classIRI, state.ctx)),
                state.df
            );
        }
        if (entry.kind === 'property' && entry.predicate) {
            const predicate = state.df.namedNode(expandIRI(entry.predicate, state.ctx));
            const object = createLiteralValue(
                token.text,
                annotation.datatype,
                annotation.language,
                state.ctx,
                state.df
            );
            emitQuad(
                state.quads, state.origin.quadIndex, 'list-item',
                state.currentSubject, predicate, object, state.df
            );
        }
    });
}

function processListContextRelationships(originalSubject, state) {
    if (!state.listContext || !state.listContext.predicate || !originalSubject) {
        return;
    }

    const predicate = state.df.namedNode(state.listContext.predicate);
    if (state.listContext.reverse) {
        emitQuad(
            state.quads, state.origin.quadIndex, 'list-context',
            state.currentSubject, predicate, originalSubject, state.df
        );
    } else {
        emitQuad(
            state.quads, state.origin.quadIndex, 'list-context',
            originalSubject, predicate, state.currentSubject, state.df
        );
    }
}

function processListItemTypes(annotation, state) {
    if (!state.listContext || state.listContext.types.length === 0 || !annotation.subject) {
        return;
    }

    state.listContext.types.forEach(type => {
        emitQuad(
            state.quads, state.origin.quadIndex, 'list-item',
            state.currentSubject,
            state.df.namedNode(expandIRI('rdf:type', state.ctx)),
            state.df.namedNode(expandIRI(type, state.ctx)),
            state.df
        );
    });
}

function processListItem(token, state) {
    const annotation = parseAnnotation(token.attrs);
    const originalSubject = state.currentSubject;

    // Handle subject declaration in list item
    if (annotation.subject) {
        state.currentSubject = state.df.namedNode(expandIRI(annotation.subject, state.ctx));
    }

    // Process properties on the list item itself
    processListItemProperties(annotation, token, state);

    // Handle list context relationships
    processListContextRelationships(originalSubject, state);

    // Apply list context types to declared subjects
    processListItemTypes(annotation, state);

    // Restore original current subject
    state.currentSubject = originalSubject;
}

function processCode(token, state) {
    processAnnotation(token, state, token.text);
}

function processInline(span, state) {
    processAnnotation(span, state, span.text);
}

// Main parsing function
export function parse(text, options = {}) {
    // Initialize parsing state
    const state = {
        ctx: { ...DEFAULT_CONTEXT, ...(options.context || {}) },
        df: options.dataFactory || DataFactory,
        quads: [],
        origin: { blocks: new Map(), quadIndex: new Map() },
        currentSubject: null,
        listContext: null
    };

    // Scan tokens and process prefix declarations
    const tokens = scanTokens(text);
    tokens.filter(t => t.type === 'prefix').forEach(t => state.ctx[t.prefix] = t.iri);

    // Process each token
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextToken = tokens[i + 1];

        switch (token.type) {
            case 'heading':
                processAnnotation(token, state, token.text);
                break;

            case 'code':
                processCode(token, state);
                break;

            case 'para':
                if (setupListContext(token, state, nextToken)) {
                    break; // This is a list header, skip normal processing
                }
                // Fall through to paragraph processing
                if (state.currentSubject) {
                    processParagraphContent(token, state);
                }
                break;

            case 'list':
                if (state.listContext) {
                    processListItem(token, state);
                }
                break;

            case 'blockquote':
                if (state.currentSubject) {
                    processAnnotation(token, state, token.text);
                }
                break;
        }
    }

    return { quads: state.quads, origin: state.origin, context: state.ctx };
}

// Helper for processing paragraph content
function processParagraphContent(token, state) {
    // Process the paragraph annotation
    processAnnotation(token, state, token.text);

    // Extract and process inline spans and links
    const spans = extractInlineValue(token.text, token.range[0]);
    spans
        .filter(s => s.type === 'span' || s.type === 'link')
        .forEach(span => processInline(span, state));
}

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) return { text, origin };

    let result = text;
    const edits = [];

    if (diff.delete) {
        diff.delete.forEach(quad => {
            const key = JSON.stringify([quad.subject.value, quad.predicate.value, quad.object.value]);
            const blockId = origin?.quadIndex.get(key);
            if (!blockId) return;

            const block = origin.blocks.get(blockId);
            if (!block) return;

            const start = block.range.start;
            const end = block.range.end;
            const before = text.substring(Math.max(0, start - 1), start);
            const after = text.substring(end, end + 1);
            const deleteStart = before === '\n' ? start - 1 : start;
            const deleteEnd = after === '\n' ? end + 1 : end;

            edits.push({ start: deleteStart, end: deleteEnd, text: '' });
        });
    }

    if (diff.add) {
        diff.add.forEach(quad => {
            let insertPos = result.length;

            for (const [, block] of origin?.blocks || []) {
                if (block.subject === quad.subject.value) {
                    insertPos = block.range.end;
                    break;
                }
            }

            const pred = quad.predicate.value.split(/[/#]/).pop();
            const objText = quad.object.termType === 'Literal' ? quad.object.value : quad.object.value;
            const newLine = `\n[${objText}] {${pred}}`;

            edits.push({ start: insertPos, end: insertPos, text: newLine });
        });
    }

    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    return { text: result, origin };
}

export default { parse, serialize, parseAnnotation };