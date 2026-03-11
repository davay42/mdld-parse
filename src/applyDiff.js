import { parse } from './parse.js';
import {
    shortenIRI,
    normalizeQuad,
    quadToKeyForOrigin,
    parseQuadIndexKey,
    findVacantSlot,
    occupySlot,
    markSlotAsVacant,
    normalizeAttrsTokens,
    writeAttrsTokens,
    removeOneToken,
    addObjectToken,
    removeObjectToken,
    addSoftFragmentToken,
    removeSoftFragmentToken,
    objectSignature,
    expandIRI,
    DataFactory
} from './utils.js';

function getBlockById(base, blockId) {
    return blockId ? base?.quadMap?.get(blockId) : null;
}

function getEntryByQuadKey(base, quadKey) {
    return quadKey ? base?.quadMap?.get(quadKey) : null;
}

// Helper functions for cleaner term type checking
function isLiteral(term) {
    return term?.termType === 'Literal';
}

function isNamedNode(term) {
    return term?.termType === 'NamedNode';
}

function isRdfType(term) {
    return term?.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
}

function createAnnotationForQuad(quad, ctx) {
    const predShort = shortenIRI(quad.predicate.value, ctx);
    if (isLiteral(quad.object)) {
        const value = String(quad.object.value ?? '');
        const ann = createLiteralAnnotation(value, predShort, quad.object.language, quad.object.datatype, ctx);
        return { text: `[${value}] {${ann}}`, isLiteral: true };
    } else if (isNamedNode(quad.object)) {
        const objectShort = shortenIRI(quad.object.value, ctx);
        const objectAnn = createObjectAnnotation(objectShort, predShort);
        return { text: objectAnn, isLiteral: false };
    }
    return null;
}

function createSubjectBlockForQuad(quad, ctx) {
    const subjectShort = shortenIRI(quad.subject.value, ctx);
    const predShort = shortenIRI(quad.predicate.value, ctx);
    const subjectName = extractLocalName(quad.subject.value);

    if (isNamedNode(quad.object)) {
        // IRI object: create object reference
        const objectShort = shortenIRI(quad.object.value, ctx);
        return { text: `\n\n# ${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)} {=${subjectShort}}\n[${objectShort}] {${predShort}}\n`, isNewSubject: true };
    } else {
        // Literal object: create property on separate line
        const value = String(quad.object.value ?? '');
        const annotation = createLiteralAnnotation(value, predShort, quad.object.language, quad.object.datatype, ctx);
        return { text: `\n\n# ${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)} {=${subjectShort}}\n[${value}] {${annotation}}\n`, isNewSubject: true };
    }
}

function extractLocalName(iri) {
    return iri.split('/').pop() || iri.split('#').pop() || iri;
}

function isValidQuad(quad) {
    return quad && quad.subject && quad.predicate && quad.object;
}

function normalizeDiffQuads(quads, ctx) {
    // Use DataFactory.fromQuad for proper RDF/JS compatibility
    // But first expand any CURIEs in the quads to ensure proper matching
    return quads.map(quad => {
        // Expand CURIEs to full IRIs before normalization
        const expandedQuad = {
            subject: quad.subject.termType === 'NamedNode'
                ? { ...quad.subject, value: expandIRI(quad.subject.value, ctx) }
                : quad.subject,
            predicate: quad.predicate.termType === 'NamedNode'
                ? { ...quad.predicate, value: expandIRI(quad.predicate.value, ctx) }
                : quad.predicate,
            object: quad.object,
            graph: quad.graph
        };
        return DataFactory.fromQuad(expandedQuad);
    }).filter(isValidQuad);
}

function createLiteralAnnotation(value, predicate, language, datatype, ctx) {
    let ann = predicate;
    if (language) ann += ` @${language}`;
    else if (datatype?.value && datatype.value !== DataFactory.literal('').datatype.value) {
        ann += ` ^^${shortenIRI(datatype.value, ctx)}`;
    }
    return ann;
}

function createObjectAnnotation(objectShort, predicateShort, isSoftFragment = false, fragment = null) {
    if (isSoftFragment) {
        return `[${objectShort}] {+#${fragment} ?${predicateShort}}`;
    }
    return `[${objectShort}] {+${objectShort} ?${predicateShort}}`;
}

function readSpan(block, text, spanType = 'attrs') {
    const range = spanType === 'attrs' ? block?.attrsRange : block?.valueRange;
    if (!range) return null;
    const { start, end } = range;
    return (Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end >= start)
        ? { start, end, text: text.substring(start, end) }
        : null;
}

function sanitizeCarrierValueForBlock(block, raw) {
    const s = String(raw ?? '');
    const t = block?.carrierType;
    if (t === 'code') return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const oneLine = s.replace(/[\n\r]+/g, ' ').trim();
    return (t === 'span' || t === 'link') ? oneLine.replace(/[\[\]]/g, ' ') : oneLine;
}

function blockTokensFromEntries(block) {
    return block?.entries?.length ? block.entries.map(e => e.raw).filter(Boolean) : null;
}

function removeEntryAt(block, entryIndex) {
    if (!block?.entries || entryIndex == null || entryIndex < 0 || entryIndex >= block.entries.length) return null;
    return [...block.entries.slice(0, entryIndex), ...block.entries.slice(entryIndex + 1)];
}

function replaceLangDatatypeEntries(block, lit, ctx) {
    if (!block?.entries) return null;
    const filtered = block.entries.filter(e => e.kind !== 'language' && e.kind !== 'datatype');
    const extras = [];
    if (lit?.language) extras.push({ kind: 'language', language: lit.language, raw: `@${lit.language}`, relRange: { start: 0, end: 0 } });
    const dt = lit?.datatype?.value;
    if (!lit?.language && dt && dt !== 'http://www.w3.org/2001/XMLSchema#string') {
        extras.push({ kind: 'datatype', datatype: shortenIRI(dt, ctx), raw: `^^${shortenIRI(dt, ctx)}`, relRange: { start: 0, end: 0 } });
    }
    return [...filtered, ...extras];
}

function updateAttrsDatatypeLang(tokens, newLit, ctx) {
    const predicatesAndTypes = tokens.filter(t => !t.startsWith('@') && !t.startsWith('^^'));
    if (newLit?.language) return [...predicatesAndTypes, `@${newLit.language}`];
    const dt = newLit?.datatype?.value;
    if (dt && dt !== 'http://www.w3.org/2001/XMLSchema#string') {
        return [...predicatesAndTypes, `^^${shortenIRI(dt, ctx)}`];
    }
    return predicatesAndTypes;
}

// Direct slot operations - no class abstraction needed
function removeTokenFromSlot(entry, tokens, ctx, quad) {
    if (!entry) return { tokens, removed: false };

    if (entry.kind === 'object') {
        const objectIRI = shortenIRI(quad.object.value, ctx);
        return removeObjectToken(tokens, objectIRI);
    } else if (entry.kind === 'softFragment') {
        const fragment = entry.fragment;
        return removeSoftFragmentToken(tokens, fragment);
    } else if (entry.kind === 'type' && quad.predicate.value.endsWith('rdf-syntax-ns#type')) {
        const expectedType = entry.expandedType || quad.object.value;
        return removeOneToken(tokens, t => {
            if (!t.startsWith('.')) return false;
            const raw = t.slice(1);
            return expandIRI(raw, ctx) === expectedType;
        });
    } else {
        const expectedPred = entry.expandedPredicate || quad.predicate.value;
        const expectedForm = entry.form;
        return removeOneToken(tokens, t => {
            const m = String(t).match(/^(\^\?|\^|\?|)(.+)$/);
            if (!m) return false;
            const form = m[1] || '';
            const raw = m[2];
            if (expectedForm != null && form !== expectedForm) return false;
            return expandIRI(raw, ctx) === expectedPred;
        });
    }
}

function addTokenToSlot(tokens, ctx, quad) {
    // Use cleaner helper functions
    if (isRdfType(quad.predicate) && isNamedNode(quad.object)) {
        const typeShort = shortenIRI(quad.object.value, ctx);
        const typeToken = typeShort.includes(':') || !typeShort.startsWith('http') ? `.${typeShort}` : null;
        if (typeToken && !tokens.includes(typeToken)) {
            return [...tokens, typeToken];
        }
    } else if (isNamedNode(quad.object)) {
        const objectShort = shortenIRI(quad.object.value, ctx);
        const isSoftFragment = quad.object.value.includes('#');
        const fragment = isSoftFragment ? quad.object.value.split('#')[1] : null;

        if (fragment) {
            return addSoftFragmentToken(tokens, objectShort, fragment);
        } else {
            return addObjectToken(tokens, objectShort);
        }
    } else if (isLiteral(quad.object)) {
        const predShort = shortenIRI(quad.predicate.value, ctx);
        if (!tokens.includes(predShort)) {
            return [...tokens, predShort];
        }
    }
    return tokens;
}

function markEntryAsVacant(entry, quad) {
    if (entry && entry.slotId) {
        return markSlotAsVacant(entry, quad.object);
    }
    return null;
}

export function applyDiff({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) {
        const reparsed = parse(text, { context: options.context || {} });
        return { text, origin: reparsed.origin };
    }

    const base = origin || parse(text, { context: options.context || {} }).origin;
    const ctx = options.context || {};

    // Phase 1: Plan operations (pure, no text edits)
    const plan = planOperations(diff, base, ctx);

    // Phase 2: Materialize edits (ranges + strings)
    const edits = materializeEdits(plan, text, ctx, base);

    // Phase 3: Apply edits + reparse
    return applyEdits(text, edits, ctx, base);
}


function planOperations(diff, base, ctx) {
    // Normalize quads using DataFactory for proper RDF/JS compatibility
    const normAdds = normalizeDiffQuads(diff.add || [], ctx);
    const normDeletes = normalizeDiffQuads(diff.delete || [], ctx);

    const plan = {
        literalUpdates: [],
        vacantSlotOccupations: [],
        deletes: [],
        adds: [],
        consumedAdds: new Set()
    };

    // Build lookup maps
    const addBySP = new Map();
    for (const quad of normAdds) {
        const k = JSON.stringify([quad.subject.value, quad.predicate.value]);
        const list = addBySP.get(k) || [];
        list.push(quad);
        addBySP.set(k, list);
    }

    // Build anchors for delete operations
    const anchors = new Map();
    for (const quad of normDeletes) {
        const key = JSON.stringify([quad.subject.value, objectSignature(quad.object)]);
        const quadKey = quadToKeyForOrigin(quad);
        const entry = getEntryByQuadKey(base, quadKey);
        const block = entry; // In unified structure, entry is the block
        if (block?.attrsRange) {
            anchors.set(key, { block, entry });
        }
    }

    // Detect literal updates early
    for (const deleteQuad of normDeletes) {
        if (!isLiteral(deleteQuad.object)) continue;

        const k = JSON.stringify([deleteQuad.subject.value, deleteQuad.predicate.value]);
        const candidates = addBySP.get(k) || [];
        const addQuad = candidates.find(x =>
            isLiteral(x?.object) && !plan.consumedAdds.has(quadToKeyForOrigin(x))
        );

        if (!addQuad) continue;

        const entry = resolveOriginEntry(deleteQuad, base);
        const block = entry; // In unified structure, the entry is the block

        if (block) {
            plan.literalUpdates.push({ deleteQuad, addQuad, entry, block });
            plan.consumedAdds.add(quadToKeyForOrigin(addQuad));
        }
    }

    // Find vacant slot occupations
    for (const quad of normAdds) {
        if (!isLiteral(quad.object)) continue;
        if (plan.consumedAdds.has(quadToKeyForOrigin(quad))) continue;

        const vacantSlot = findVacantSlot(base?.quadMap, quad.subject, quad.predicate);
        if (!vacantSlot) continue;

        const block = vacantSlot; // In unified structure, the slot is the block
        if (block) {
            plan.vacantSlotOccupations.push({ quad, vacantSlot, block });
            plan.consumedAdds.add(quadToKeyForOrigin(quad));
        }
    }

    // Plan remaining deletes
    for (const quad of normDeletes) {
        if (isLiteral(quad.object)) {
            const isUpdated = plan.literalUpdates.some(u =>
                u.deleteQuad.subject.value === quad.subject.value &&
                u.deleteQuad.predicate.value === quad.predicate.value &&
                u.deleteQuad.object.value === quad.object.value
            );
            if (isUpdated) continue;
        }

        const entry = resolveOriginEntry(quad, base);
        const block = entry; // In unified structure, entry is the block
        if (block) {
            plan.deletes.push({ quad, entry, block });
        }
    }

    // Plan remaining adds
    for (const quad of normAdds) {
        if (plan.consumedAdds.has(quadToKeyForOrigin(quad))) continue;

        const targetBlock = findTargetBlock(quad, base, anchors);
        plan.adds.push({ quad, targetBlock });
    }

    return plan;
}

function materializeEdits(plan, text, ctx, base) {
    const edits = [];

    // Materialize vacant slot occupations
    for (const { quad, vacantSlot, block } of plan.vacantSlotOccupations) {
        const span = readSpan(block, text, 'attrs');
        if (!span) continue;

        // Update carrier value
        const valueSpan = readSpan(block, text, 'value');
        if (valueSpan) {
            edits.push({ start: valueSpan.start, end: valueSpan.end, text: quad.object.value });
        }

        // Update annotation block
        const tokens = normalizeAttrsTokens(span.text);
        const predToken = `${vacantSlot.form || ''}${shortenIRI(quad.predicate.value, ctx)}`;

        if (tokens.length === 0) {
            edits.push({ start: span.start, end: span.end, text: `{${predToken}}` });
        } else if (!tokens.includes(predToken)) {
            const updated = [...tokens, predToken];
            edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
        }
    }

    // Materialize literal updates
    for (const { deleteQuad, addQuad, entry, block } of plan.literalUpdates) {
        const span = readSpan(block, text, 'value');
        if (span) {
            const newValue = sanitizeCarrierValueForBlock(block, addQuad.object.value);
            edits.push({ start: span.start, end: span.end, text: newValue });
        }

        const aSpan = readSpan(block, text, 'attrs');
        if (aSpan) {
            if (block?.entries?.length) {
                const nextEntries = replaceLangDatatypeEntries(block, addQuad.object, ctx);
                if (nextEntries) {
                    const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                    const newText = nextTokens.length === 0 ? '{}' : writeAttrsTokens(nextTokens);
                    edits.push({ start: aSpan.start, end: aSpan.end, text: newText });
                }
            } else {
                const tokens = normalizeAttrsTokens(aSpan.text);
                const updated = updateAttrsDatatypeLang(tokens, addQuad.object, ctx);
                if (updated.join(' ') !== tokens.join(' ')) {
                    const newText = updated.length === 0 ? '{}' : writeAttrsTokens(updated);
                    edits.push({ start: aSpan.start, end: aSpan.end, text: newText });
                }
            }
        }
    }

    // Materialize deletes
    for (const { quad, entry, block } of plan.deletes) {
        // Mark slot as vacant
        const vacantSlot = markEntryAsVacant(entry, quad);
        if (vacantSlot && block) {
            const blockInfo = {
                id: entry.blockId,
                range: block.range,
                attrsRange: block.attrsRange,
                valueRange: block.valueRange,
                carrierType: block.carrierType,
                subject: block.subject,
                context: block.context
            };
            vacantSlot.blockInfo = blockInfo;
            const key = quadToKeyForOrigin(quad);
            if (key) base.quadMap.set(key, vacantSlot);
        }

        const span = readSpan(block, text, 'attrs');
        if (!span) continue;

        // Handle entry removal by index
        if (entry?.entryIndex != null && block?.entries?.length) {
            const nextEntries = removeEntryAt(block, entry.entryIndex);
            if (nextEntries) {
                const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                const newText = nextTokens.length === 0 ? '{}' : writeAttrsTokens(nextTokens);
                edits.push({ start: span.start, end: span.end, text: newText });
                continue;
            }
        }

        // Handle token-based removals using direct functions
        const tokens = normalizeAttrsTokens(span.text);
        const { tokens: updated, removed } = removeTokenFromSlot(entry, tokens, ctx, quad);

        if (removed) {
            const newText = updated.length === 0 ? '{}' : writeAttrsTokens(updated);
            edits.push({ start: span.start, end: span.end, text: newText });
        }
    }

    // Materialize adds
    for (const { quad, targetBlock } of plan.adds) {
        const quadKey = quadToKeyForOrigin(quad);
        if (plan.consumedAdds.has(quadKey)) {
            continue;
        }

        if (isLiteral(quad.object) || isNamedNode(quad.object)) {
            if (!targetBlock) {
                // No target block - check if subject already exists in document
                const subjectExists = Array.from(base?.quadMap?.values() || [])
                    .some(block => block.subject?.value === quad.subject.value);

                let annotation;
                if (!subjectExists && isNamedNode(quad.object)) {
                    // New subject with IRI object - create subject block
                    annotation = createSubjectBlockForQuad(quad, ctx);
                } else if (subjectExists) {
                    // Existing subject - create simple annotation
                    annotation = createAnnotationForQuad(quad, ctx);
                } else {
                    // New subject with literal - create subject block
                    annotation = createSubjectBlockForQuad(quad, ctx);
                }

                if (annotation) {
                    edits.push({ start: text.length, end: text.length, text: annotation.text });
                }
                continue;
            }

            // Insert annotation after target block's range
            const annotation = createAnnotationForQuad(quad, ctx);
            if (annotation) {
                // Find the end of the target block's content, not just its range
                const targetBlockEnd = targetBlock.range.end;
                let insertPos = targetBlockEnd;

                // Skip past the target block's content to find the right insertion point
                while (insertPos < text.length && text[insertPos] !== '\n') {
                    insertPos++;
                }

                // Insert after the target block's content
                const finalInsertPos = insertPos < text.length ? insertPos : text.length;
                edits.push({ start: finalInsertPos, end: finalInsertPos, text: `\n${annotation.text}` });
            }
        }
    }

    return edits;
}

function applyEdits(text, edits, ctx, base) {
    let result = text;

    // Sort edits descending to avoid position shifts
    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    // Extract vacant slots before reparsing
    const vacantSlots = new Map();
    base?.quadMap?.forEach((slot, key) => {
        if (slot.isVacant) vacantSlots.set(key, slot);
    });

    const reparsed = parse(result, { context: ctx });

    // Merge vacant slots back
    vacantSlots.forEach((vacantSlot, key) => {
        if (!reparsed.origin.quadMap.has(vacantSlot.id) && vacantSlot.blockInfo) {
            const { blockInfo } = vacantSlot;
            const emptyBlock = {
                id: blockInfo.id,
                range: blockInfo.range || { start: 0, end: 0 },
                attrsRange: blockInfo.attrsRange,
                valueRange: blockInfo.valueRange,
                carrierType: blockInfo.carrierType || 'span',
                subject: blockInfo.subject || '',
                types: [],
                predicates: [],
                context: blockInfo.context || { ...ctx }
            };
            reparsed.origin.quadMap.set(vacantSlot.id, emptyBlock);
        }
        reparsed.origin.quadMap.set(key, vacantSlot);
    });

    return { text: result, origin: reparsed.origin };
}

// Helper functions for origin lookup
function resolveOriginEntry(quad, base) {
    const key = quadToKeyForOrigin(quad);
    let entry = key ? base?.quadMap?.get(key) : null;

    if (!entry && isLiteral(quad.object)) {
        // Fallback: search by value
        for (const [k, e] of base?.quadMap || []) {
            const parsed = parseQuadIndexKey(k);
            if (parsed && parsed.s === quad.subject.value &&
                parsed.p === quad.predicate.value &&
                parsed.o?.t === 'Literal' &&
                parsed.o?.v === quad.object.value) {
                entry = e;
                break;
            }
        }
    }

    return entry;
}

function findTargetBlock(quad, base, anchors) {
    const anchorKey = JSON.stringify([quad.subject.value, objectSignature(quad.object)]);
    const anchored = anchors.get(anchorKey);
    if (anchored?.block) return anchored.block;

    // Find the best position within the subject's section
    // Look for blocks with the same subject and sort by position
    const subjectBlocks = Array.from(base?.quadMap?.values() || [])
        .filter(block => block.subject?.value === quad.subject.value)
        .sort((a, b) => a.range.start - b.range.start);

    if (subjectBlocks.length === 0) return null;

    // Strategy: Find the last block with attrsRange to maintain consistency
    // For identical subject blocks, prefer the first one to avoid creating duplicates
    const blocksWithAttrs = subjectBlocks.filter(block => block.attrsRange);
    if (blocksWithAttrs.length > 0) {
        return blocksWithAttrs[blocksWithAttrs.length - 1]; // Return last matching block
    }

    // Fallback: return the last block in the subject's section
    return subjectBlocks[subjectBlocks.length - 1];
}
