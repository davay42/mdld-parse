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
    expandIRI
} from './utils.js';

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

export function serialize({ text, diff, origin, options = {} }) {
    if (!diff || (!diff.add?.length && !diff.delete?.length)) {
        const reparsed = parse(text, { context: options.context || {} });
        return { text, origin: reparsed.origin };
    }

    const base = origin || parse(text, { context: options.context || {} }).origin;
    let result = text;
    const edits = [];
    const ctx = options.context || {};

    const findOriginEntryForLiteralByValue = (subjectIri, predicateIri, literalValue) => {
        for (const [k, entry] of base?.quadIndex || []) {
            const parsed = parseQuadIndexKey(k);
            if (!parsed) continue;
            if (parsed.s !== subjectIri || parsed.p !== predicateIri) continue;
            if (parsed.o?.t !== 'Literal') continue;
            if (parsed.o?.v === literalValue) return entry;
        }
        return null;
    };

    const findLiteralCarrierBlocksBySP = (subjectIri, predicateIri) => {
        const out = [];
        for (const [k, entry] of base?.quadIndex || []) {
            const parsed = parseQuadIndexKey(k);
            if (!parsed) continue;
            if (parsed.s !== subjectIri || parsed.p !== predicateIri) continue;
            if (parsed.o?.t !== 'Literal') continue;
            const blockId = entry?.blockId || entry;
            const block = blockId ? base?.blocks?.get(blockId) : null;
            if (block) out.push({ block, entry, obj: parsed.o });
        }
        return out;
    };

    const anchors = new Map();
    for (const q0 of diff.delete || []) {
        const q = normalizeQuad(q0);
        if (!q) continue;
        if (!q?.subject || !q?.object || !q?.predicate) continue;
        const key = JSON.stringify([q.subject.value, objectSignature(q.object)]);
        const qk = quadToKeyForOrigin(q);
        const entry = qk ? base?.quadIndex?.get(qk) : null;
        const blockId = entry?.blockId || entry;
        const block = blockId ? base?.blocks?.get(blockId) : null;
        if (!block?.attrsRange) continue;
        anchors.set(key, { block, entry });
    }

    const addBySP = new Map();
    for (const q0 of diff.add || []) {
        const q = normalizeQuad(q0);
        if (!q) continue;
        if (!q?.subject || !q?.predicate || !q?.object) continue;
        const k = JSON.stringify([q.subject.value, q.predicate.value]);
        const list = addBySP.get(k) || [];
        list.push(q);
        addBySP.set(k, list);
    }

    const consumedAdds = new Set();
    const literalUpdates = [];
    for (const dq0 of diff.delete || []) {
        const dq = normalizeQuad(dq0);
        if (!dq) continue;
        if (!dq?.subject || !dq?.predicate || !dq?.object) continue;
        if (dq.object.termType !== 'Literal') continue;
        const k = JSON.stringify([dq.subject.value, dq.predicate.value]);
        const candidates = addBySP.get(k) || [];
        const aq = candidates.find(x => x?.object?.termType === 'Literal' && !consumedAdds.has(quadToKeyForOrigin(x)));
        if (!aq) continue;

        const dqk = quadToKeyForOrigin(dq);
        let entry = dqk ? base?.quadIndex?.get(dqk) : null;
        if (!entry && dq.object?.termType === 'Literal') {
            entry = findOriginEntryForLiteralByValue(dq.subject.value, dq.predicate.value, dq.object.value);
        }
        const blockId = entry?.blockId || entry;
        const block = blockId ? base?.blocks?.get(blockId) : null;
        if (!block) continue;

        literalUpdates.push({ deleteQuad: dq, addQuad: aq, entry, block });
        consumedAdds.add(quadToKeyForOrigin(aq));
    }

    for (const q0 of diff.add || []) {
        const quad = normalizeQuad(q0);
        if (!quad || quad.object?.termType !== 'Literal') continue;
        if (consumedAdds.has(quadToKeyForOrigin(quad))) continue;

        // Check if there's a vacant slot we can reuse
        const vacantSlot = findVacantSlot(base?.quadIndex, quad.subject, quad.predicate);
        if (!vacantSlot) continue;

        const block = base?.blocks?.get(vacantSlot.blockId);
        if (!block) continue;

        const span = readSpan(block, text, 'attrs');
        if (!span) continue;

        // Occupy the vacant slot and update the annotation
        const occupiedSlot = occupySlot(vacantSlot, quad.object);
        if (!occupiedSlot) continue;

        // Update the carrier value
        const valueSpan = readSpan(block, text, 'value');
        if (valueSpan) {
            edits.push({ start: valueSpan.start, end: valueSpan.end, text: quad.object.value });
        }

        // Update the annotation block to restore the predicate token
        const tokens = normalizeAttrsTokens(span.text);
        const predToken = `${vacantSlot.form || ''}${shortenIRI(quad.predicate.value, ctx)}`;

        // For empty annotation blocks, replace entirely; for non-empty, add if missing
        if (tokens.length === 0) {
            edits.push({ start: span.start, end: span.end, text: `{${predToken}}` });
        } else if (!tokens.includes(predToken)) {
            const updated = [...tokens, predToken];
            edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
        }

        // Mark as consumed and continue
        consumedAdds.add(quadToKeyForOrigin(quad));
        continue;

        const matches = findLiteralCarrierBlocksBySP(quad.subject.value, quad.predicate.value);
        if (matches.length === 0) continue;

        const desiredLang = quad.object.language || '';
        const sameLang = matches.filter(m => {
            const entries = m.block?.entries || [];
            const langEntry = entries.find(e => e.kind === 'language');
            const lang = langEntry?.language || '';
            return lang === desiredLang;
        });

        if (sameLang.length !== 1) continue;
        const target = sameLang[0].block;
        const vSpan = readSpan(target, text, 'value');
        if (!vSpan) continue;

        const newValue = sanitizeCarrierValueForBlock(target, quad.object.value);
        edits.push({ start: vSpan.start, end: vSpan.end, text: newValue });

        const aSpan = readSpan(target, text, 'attrs');
        if (aSpan && target?.entries?.length) {
            const nextEntries = replaceLangDatatypeEntries(target, quad.object, ctx);
            if (nextEntries) {
                const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(nextTokens) });
            }
        }

        consumedAdds.add(quad);
    }

    for (const u of literalUpdates) {
        const span = readSpan(u.block, text, 'value');
        if (span) {
            const newValue = sanitizeCarrierValueForBlock(u.block, u.addQuad.object.value);
            edits.push({ start: span.start, end: span.end, text: newValue });
        }

        const aSpan = readSpan(u.block, text, 'attrs');
        if (aSpan) {
            if (u.block?.entries?.length) {
                const nextEntries = replaceLangDatatypeEntries(u.block, u.addQuad.object, ctx);
                if (nextEntries) {
                    const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                    if (nextTokens.length === 0) {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: '{}' });
                    } else {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(nextTokens) });
                    }
                }
            } else {
                const tokens = normalizeAttrsTokens(aSpan.text);
                const updated = updateAttrsDatatypeLang(tokens, u.addQuad.object, ctx);
                if (updated.join(' ') !== tokens.join(' ')) {
                    if (updated.length === 0) {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: '{}' });
                    } else {
                        edits.push({ start: aSpan.start, end: aSpan.end, text: writeAttrsTokens(updated) });
                    }
                }
            }
        }
    }


    if (diff.delete) {
        diff.delete.forEach(q0 => {
            const quad = normalizeQuad(q0);
            if (!quad) return;
            if (!quad?.subject || !quad?.predicate || !quad?.object) return;

            if (quad.object.termType === 'Literal') {
                const isUpdated = literalUpdates.some(u =>
                    u.deleteQuad.subject.value === quad.subject.value &&
                    u.deleteQuad.predicate.value === quad.predicate.value &&
                    u.deleteQuad.object.value === quad.object.value
                );
                if (isUpdated) return;
            }

            const key = quadToKeyForOrigin(quad);
            let entry = key ? base?.quadIndex?.get(key) : null;
            if (!entry && quad.object?.termType === 'Literal') {
                entry = findOriginEntryForLiteralByValue(quad.subject.value, quad.predicate.value, quad.object.value);
            }

            // Mark the semantic slot as vacant for future reuse
            if (entry && entry.slotId) {
                // Capture block information before marking as vacant
                const block = base?.blocks?.get(entry.blockId);
                const blockInfo = block ? {
                    id: entry.blockId,
                    range: block.range,
                    attrsRange: block.attrsRange,
                    valueRange: block.valueRange,
                    carrierType: block.carrierType,
                    subject: block.subject,
                    context: block.context
                } : null;

                const vacantSlot = markSlotAsVacant(entry, quad.object);
                if (vacantSlot && blockInfo) {
                    vacantSlot.blockInfo = blockInfo;
                    base.quadIndex.set(key, vacantSlot);
                }
            }

            const blockId = entry?.blockId || entry;
            if (!blockId) return;

            const block = base?.blocks?.get(blockId);
            if (!block) return;

            const span = readSpan(block, text, 'attrs');
            if (!span) return;

            // Handle entry removal by index
            if (entry?.entryIndex != null && block?.entries?.length) {
                const nextEntries = removeEntryAt(block, entry.entryIndex);
                if (!nextEntries) return;

                const nextTokens = nextEntries.map(e => e.raw).filter(Boolean);
                const newText = nextTokens.length === 0 ? '{}' : writeAttrsTokens(nextTokens);
                edits.push({ start: span.start, end: span.end, text: newText });
                return;
            }

            // Handle object token removal
            if (entry?.kind === 'object') {
                const objectIRI = shortenIRI(quad.object.value, ctx);
                const { tokens: updated, removed } = removeObjectToken(tokens, objectIRI);
                if (!removed) return;

                const newAttrs = updated.length === 0 ? '{}' : writeAttrsTokens(updated);
                edits.push({ start: span.start, end: span.end, text: newAttrs });
                return;
            }

            // Handle soft fragment token removal
            if (entry?.kind === 'softFragment') {
                const fragment = entry.fragment;
                const { tokens: updated, removed } = removeSoftFragmentToken(tokens, fragment);
                if (!removed) return;

                const newAttrs = updated.length === 0 ? '{}' : writeAttrsTokens(updated);
                edits.push({ start: span.start, end: span.end, text: newAttrs });
                return;
            }

            const tokens = normalizeAttrsTokens(span.text);
            let updated = tokens;
            let removed = false;

            if (entry?.kind === 'type' && quad.predicate.value.endsWith('rdf-syntax-ns#type')) {
                const expectedType = entry.expandedType || quad.object.value;
                ({ tokens: updated, removed } = removeOneToken(tokens, t => {
                    if (!t.startsWith('.')) return false;
                    const raw = t.slice(1);
                    return expandIRI(raw, ctx) === expectedType;
                }));
            } else {
                const expectedPred = entry?.expandedPredicate || quad.predicate.value;
                const expectedForm = entry?.form;
                ({ tokens: updated, removed } = removeOneToken(tokens, t => {
                    const m = String(t).match(/^(\^\?|\^|\?|)(.+)$/);
                    if (!m) return false;
                    const form = m[1] || '';
                    const raw = m[2];
                    if (expectedForm != null && form !== expectedForm) return false;
                    return expandIRI(raw, ctx) === expectedPred;
                }));
            }

            if (!removed) return;

            if (updated.length === 0) {
                edits.push({ start: span.start, end: span.end, text: '{}' });
                return;
            }

            const newAttrs = writeAttrsTokens(updated);
            edits.push({ start: span.start, end: span.end, text: newAttrs });
        });
    }

    if (diff.add) {
        diff.add.forEach(q0 => {
            const quad = normalizeQuad(q0);
            if (!quad) return;
            if (!quad?.subject || !quad?.predicate || !quad?.object) return;

            if (consumedAdds.has(quadToKeyForOrigin(quad))) return;

            const anchorKey = JSON.stringify([quad.subject.value, objectSignature(quad.object)]);
            const anchored = anchors.get(anchorKey) || null;
            let targetBlock = anchored?.block || null;

            if (!targetBlock) {
                for (const [, block] of base?.blocks || []) {
                    if (block.subject === quad.subject.value && block.attrsRange) {
                        targetBlock = block;
                        break;
                    }
                }
            }

            if (quad.object.termType === 'Literal' || quad.object.termType === 'NamedNode') {
                if (!targetBlock) {
                    const predShort = shortenIRI(quad.predicate.value, ctx);
                    if (quad.object.termType === 'Literal') {
                        const value = String(quad.object.value ?? '');
                        let ann = predShort;
                        if (quad.object.language) ann += ` @${quad.object.language}`;
                        else if (quad.object.datatype?.value && quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                            ann += ` ^^${shortenIRI(quad.object.datatype.value, ctx)}`;
                        }
                        edits.push({ start: result.length, end: result.length, text: `\n[${value}] {${ann}}` });
                    } else {
                        const full = quad.object.value;
                        const label = shortenIRI(full, ctx);
                        const objectShort = shortenIRI(full, ctx);
                        edits.push({ start: result.length, end: result.length, text: `\n[${label}] {+${objectShort} ?${predShort}}` });
                    }
                    return;
                }

                const predShort = shortenIRI(quad.predicate.value, ctx);
                if (quad.object.termType === 'Literal') {
                    const value = String(quad.object.value ?? '');
                    let ann = predShort;
                    if (quad.object.language) ann += ` @${quad.object.language}`;
                    else if (quad.object.datatype?.value && quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                        ann += ` ^^${shortenIRI(quad.object.datatype.value, ctx)}`;
                    }
                    edits.push({ start: result.length, end: result.length, text: `\n[${value}] {${ann}}` });
                    return;
                }

                if (quad.object.termType === 'NamedNode') {
                    const full = quad.object.value;
                    const objectShort = shortenIRI(full, ctx);
                    const predShort = shortenIRI(quad.predicate.value, ctx);

                    // Check if this is a soft fragment
                    const isSoftFragment = full.includes('#') && anchored?.entry?.kind === 'softFragment';

                    if (isSoftFragment || anchored?.entry?.form === '?') {
                        // Add soft fragment token if not present
                        if (isSoftFragment) {
                            const fragment = full.split('#')[1];
                            const updated = addSoftFragmentToken(tokens, fragment);
                            if (updated.length !== tokens.length) {
                                edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
                            }
                        } else {
                            const updated = addObjectToken(tokens, objectShort);
                            if (updated.length !== tokens.length) {
                                edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
                            }
                        }
                    } else {
                        // Create new annotation with object token
                        if (isSoftFragment) {
                            const fragment = full.split('#')[1];
                            edits.push({ start: result.length, end: result.length, text: `\n[${objectShort}] {+#${fragment} ?${predShort}}` });
                        } else {
                            edits.push({ start: result.length, end: result.length, text: `\n[${objectShort}] {+${objectShort} ?${predShort}}` });
                        }
                    }
                    return;
                }
            }

            const span = readSpan(targetBlock, text, 'attrs');
            if (!span) return;
            const tokens = blockTokensFromEntries(targetBlock) || normalizeAttrsTokens(span.text);

            if (quad.predicate.value.endsWith('rdf-syntax-ns#type') && quad.object?.termType === 'NamedNode') {
                const typeShort = shortenIRI(quad.object.value, ctx);
                const typeToken = typeShort.includes(':') || !typeShort.startsWith('http') ? `.${typeShort}` : null;
                if (!typeToken) return;
                if (tokens.includes(typeToken)) return;
                const updated = [...tokens, typeToken];
                edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
                return;
            }

            const form = anchored?.entry?.form;
            if (form == null) return;
            const predShort = shortenIRI(quad.predicate.value, ctx);
            const predToken = `${form}${predShort}`;
            if (!predToken) return;
            if (tokens.includes(predToken)) return;
            const updated = [...tokens, predToken];
            edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
        });
    }

    edits.sort((a, b) => b.start - a.start);
    edits.forEach(edit => {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    });

    // Extract vacant slots before reparsing to preserve them
    const vacantSlots = new Map();
    base?.quadIndex?.forEach((slot, key) => {
        if (slot.isVacant) {
            vacantSlots.set(key, slot);
        }
    });

    const reparsed = parse(result, { context: options.context || {} });

    // Merge vacant slots back into the new origin
    vacantSlots.forEach((vacantSlot, key) => {
        // Check if the block still exists in the new origin
        if (!reparsed.origin.blocks.has(vacantSlot.blockId)) {
            // Recreate the empty block for the vacant slot using preserved info
            const blockInfo = vacantSlot.blockInfo;
            if (blockInfo) {
                const emptyBlock = {
                    id: blockInfo.id,
                    range: blockInfo.range || { start: 0, end: 0 },
                    attrsRange: blockInfo.attrsRange,
                    valueRange: blockInfo.valueRange,
                    carrierType: blockInfo.carrierType || 'span',
                    subject: blockInfo.subject || '',
                    types: [],
                    predicates: [],
                    entries: [], // Empty entries - just {} annotation
                    context: blockInfo.context || { ...ctx }
                };
                reparsed.origin.blocks.set(vacantSlot.blockId, emptyBlock);
            }
        }

        // Merge the vacant slot back
        reparsed.origin.quadIndex.set(key, vacantSlot);
    });

    return { text: result, origin: reparsed.origin };
}
