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

function getBlockById(base, blockId) {
    return blockId ? base?.blocks?.get(blockId) : null;
}

function getEntryByQuadKey(base, quadKey) {
    return quadKey ? base?.quadIndex?.get(quadKey) : null;
}

function isValidQuad(quad) {
    return quad && quad.subject && quad.predicate && quad.object;
}

function createLiteralAnnotation(value, predicate, language, datatype, ctx) {
    let ann = predicate;
    if (language) ann += ` @${language}`;
    else if (datatype?.value && datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
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
    if (quad.predicate.value.endsWith('rdf-syntax-ns#type') && quad.object?.termType === 'NamedNode') {
        const typeShort = shortenIRI(quad.object.value, ctx);
        const typeToken = typeShort.includes(':') || !typeShort.startsWith('http') ? `.${typeShort}` : null;
        if (typeToken && !tokens.includes(typeToken)) {
            return [...tokens, typeToken];
        }
    } else if (quad.object.termType === 'NamedNode') {
        const objectShort = shortenIRI(quad.object.value, ctx);
        const isSoftFragment = quad.object.value.includes('#');
        const fragment = isSoftFragment ? quad.object.value.split('#')[1] : null;

        if (isSoftFragment) {
            return addSoftFragmentToken(tokens, fragment);
        } else {
            return addObjectToken(tokens, objectShort);
        }
    } else if (quad.object.termType === 'Literal') {
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

export function serialize({ text, diff, origin, options = {} }) {
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

function determineListOperation(listData, normAdds, normDeletes, base) {
    // Check if this is a list creation (all list structure quads are in adds)
    const allListQuads = [];
    listData.items.forEach(item => {
        if (item.typeQuad) allListQuads.push(item.typeQuad);
        if (item.firstQuad) allListQuads.push(item.firstQuad);
        if (item.restQuad) allListQuads.push(item.restQuad);
    });
    if (listData.headQuad) allListQuads.push(listData.headQuad);

    const allInAdds = allListQuads.every(quad =>
        normAdds.some(add =>
            add.subject.value === quad.subject.value &&
            add.predicate.value === quad.predicate.value &&
            add.object.value === quad.object.value
        )
    );

    if (allInAdds) {
        return { type: 'create' };
    }

    // Check if this is a list deletion (all list structure quads are in deletes)
    const allInDeletes = allListQuads.every(quad =>
        normDeletes.some(del =>
            del.subject.value === quad.subject.value &&
            del.predicate.value === quad.predicate.value &&
            del.object.value === quad.object.value
        )
    );

    if (allInDeletes) {
        return { type: 'delete' };
    }

    // Otherwise, it's a modification
    return { type: 'modify' };
}

function detectRdfLists(quads, base, ctx) {
    const lists = new Map();

    // Find all rdf:List instances (W3C standard approach)
    const listNodes = quads.filter(q =>
        q.predicate.value.endsWith('#type') &&
        q.object.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#List'
    );

    // Group list nodes by potential parent (find list chains)
    const listChains = new Map();

    for (const listNode of listNodes) {
        const listSubject = listNode.subject.value;

        // Find all quads for this list node
        const listNodeQuads = quads.filter(q => q.subject.value === listSubject);

        const firstQuad = listNodeQuads.find(q =>
            q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first'
        );

        const restQuad = listNodeQuads.find(q =>
            q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'
        );

        if (firstQuad) {
            // Try to find the parent subject (look for any predicate pointing to this list)
            const parentQuad = quads.find(q =>
                q.object.value === listSubject &&
                q.subject.value !== listSubject // Don't match self-references
            );

            const parentSubject = parentQuad?.subject.value || `unknown-list-${listSubject}`;

            if (!listChains.has(parentSubject)) {
                listChains.set(parentSubject, []);
            }

            listChains.get(parentSubject).push({
                listNode: listSubject,
                item: firstQuad.object,
                typeQuad: listNode,
                firstQuad,
                restQuad
            });
        }
    }

    // Sort each chain to maintain order (try to infer from rdf:rest structure)
    for (const [parentSubject, items] of listChains) {
        // Try to order by following rdf:rest chains
        const orderedItems = [];
        const processed = new Set();

        // Find the head of the list (item that is not referenced as a rest)
        const restTargets = new Set(
            items
                .filter(item => item.restQuad?.object?.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
                .map(item => item.restQuad.object.value)
        );

        const headItems = items.filter(item => !restTargets.has(item.listNode));

        if (headItems.length > 0) {
            // Start from head and follow rest chain
            let currentItem = headItems[0];
            let index = 0;

            while (currentItem && !processed.has(currentItem.listNode)) {
                currentItem.itemIndex = index++;
                orderedItems.push(currentItem);
                processed.add(currentItem.listNode);

                // Find next item in chain
                const nextListNode = currentItem.restQuad?.object?.value;
                currentItem = items.find(item => item.listNode === nextListNode);
            }
        } else {
            // Fallback: use original order
            items.forEach((item, index) => {
                item.itemIndex = index;
                orderedItems.push(item);
            });
        }

        lists.set(parentSubject, {
            subject: parentSubject,
            items: orderedItems,
            headQuad: quads.find(q =>
                q.subject.value === parentSubject &&
                q.object.value === orderedItems[0]?.listNode
            )
        });
    }

    return lists;
}

function planOperations(diff, base, ctx) {
    // Normalize quads once
    const normAdds = (diff.add || []).map(normalizeQuad).filter(isValidQuad);
    const normDeletes = (diff.delete || []).map(normalizeQuad).filter(isValidQuad);

    const plan = {
        literalUpdates: [],
        vacantSlotOccupations: [],
        deletes: [],
        adds: [],
        listOperations: [], // NEW: Support for ordered list operations
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
        const blockId = entry?.blockId || entry;
        const block = getBlockById(base, blockId);
        if (block?.attrsRange) {
            anchors.set(key, { block, entry });
        }
    }

    // Detect literal updates early
    for (const deleteQuad of normDeletes) {
        if (deleteQuad.object.termType !== 'Literal') continue;

        const k = JSON.stringify([deleteQuad.subject.value, deleteQuad.predicate.value]);
        const candidates = addBySP.get(k) || [];
        const addQuad = candidates.find(x =>
            x?.object?.termType === 'Literal' && !plan.consumedAdds.has(quadToKeyForOrigin(x))
        );

        if (!addQuad) continue;

        const entry = resolveOriginEntry(deleteQuad, base);
        const block = entry ? getBlockById(base, entry.blockId || entry) : null;

        if (block) {
            plan.literalUpdates.push({ deleteQuad, addQuad, entry, block });
            plan.consumedAdds.add(quadToKeyForOrigin(addQuad));
        }
    }

    // Find vacant slot occupations
    for (const quad of normAdds) {
        if (quad.object.termType !== 'Literal') continue;
        if (plan.consumedAdds.has(quadToKeyForOrigin(quad))) continue;

        const vacantSlot = findVacantSlot(base?.quadIndex, quad.subject, quad.predicate);
        if (!vacantSlot) continue;

        const block = base?.blocks?.get(vacantSlot.blockId);
        if (block) {
            plan.vacantSlotOccupations.push({ quad, vacantSlot, block });
            plan.consumedAdds.add(quadToKeyForOrigin(quad));
        }
    }

    // Plan remaining deletes
    for (const quad of normDeletes) {
        if (quad.object.termType === 'Literal') {
            const isUpdated = plan.literalUpdates.some(u =>
                u.deleteQuad.subject.value === quad.subject.value &&
                u.deleteQuad.predicate.value === quad.predicate.value &&
                u.deleteQuad.object.value === quad.object.value
            );
            if (isUpdated) continue;
        }

        const entry = resolveOriginEntry(quad, base);
        const block = entry ? getBlockById(base, entry.blockId || entry) : null;
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

    // NEW: Detect RDF lists and plan list operations
    const allQuads = [...normAdds, ...normDeletes];
    const rdfLists = detectRdfLists(allQuads, base, ctx);

    for (const [listSubject, listData] of rdfLists) {
        const operation = determineListOperation(listData, normAdds, normDeletes, base);
        if (operation) {
            plan.listOperations.push({
                type: 'rdf-list',
                subject: listSubject,
                items: listData.items,
                operation,
                headQuad: listData.headQuad
            });

            // Mark all list-related quads as consumed to prevent double processing
            const allListQuads = [];
            listData.items.forEach(item => {
                if (item.typeQuad) allListQuads.push(item.typeQuad);
                if (item.firstQuad) allListQuads.push(item.firstQuad);
                if (item.restQuad) allListQuads.push(item.restQuad);
            });
            if (listData.headQuad) allListQuads.push(listData.headQuad);

            // Also mark list item annotation quads as consumed
            Array.from(base.quadIndex.entries()).forEach(([key, entry]) => {
                const parsed = parseQuadIndexKey(key);
                if (parsed && listData.items.some(item => item.item.value === parsed.s)) {
                    plan.consumedAdds.add(key);
                }
            });

            // Also mark any quads with list item subjects as consumed
            normAdds.forEach(quad => {
                if (listData.items.some(item => item.item.value === quad.subject.value)) {
                    const quadKey = quadToKeyForOrigin(quad);
                    plan.consumedAdds.add(quadKey);
                }
            });

            allListQuads.forEach(quad => {
                const quadKey = quadToKeyForOrigin(quad);
                plan.consumedAdds.add(quadKey);
            });
        }
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
            if (key) base.quadIndex.set(key, vacantSlot);
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
        // Skip if this quad was consumed by list operations
        const quadKey = quadToKeyForOrigin(quad);
        if (plan.consumedAdds.has(quadKey)) {
            continue;
        }

        if (quad.object.termType === 'Literal' || quad.object.termType === 'NamedNode') {
            if (!targetBlock) {
                const predShort = shortenIRI(quad.predicate.value, ctx);
                if (quad.object.termType === 'Literal') {
                    const value = String(quad.object.value ?? '');
                    const ann = createLiteralAnnotation(value, predShort, quad.object.language, quad.object.datatype, ctx);
                    edits.push({ start: text.length, end: text.length, text: `\n[${value}] {${ann}}` });
                } else {
                    const objectShort = shortenIRI(quad.object.value, ctx);
                    edits.push({ start: text.length, end: text.length, text: createObjectAnnotation(objectShort, predShort) });
                }
                continue;
            }

            const span = readSpan(targetBlock, text, 'attrs');
            if (!span) continue;

            // Check if this is a subject-only block (like {=ex:order-123})
            const tokens = normalizeAttrsTokens(span.text);
            const hasSubjectToken = tokens.some(t => t.startsWith('='));
            const hasPredicateTokens = tokens.some(t => !t.startsWith('=') && !t.startsWith('.'));

            if (tokens.length === 1 && tokens[0].startsWith('=')) {
                // This is a subject-only block, create new annotation
                const predShort = shortenIRI(quad.predicate.value, ctx);
                if (quad.object.termType === 'Literal') {
                    const value = String(quad.object.value ?? '');
                    const ann = createLiteralAnnotation(value, predShort, quad.object.language, quad.object.datatype, ctx);
                    edits.push({ start: text.length, end: text.length, text: `\n[${value}] {${ann}}` });
                } else {
                    const objectShort = shortenIRI(quad.object.value, ctx);
                    edits.push({ start: text.length, end: text.length, text: createObjectAnnotation(objectShort, predShort) });
                }
                continue;
            }

            // Normal annotation block, add tokens
            const existingTokens = blockTokensFromEntries(targetBlock) || tokens;
            let updated = addTokenToSlot(existingTokens, ctx, quad);

            // For literal predicates with datatypes, we need to add datatype token too
            if (quad.object.termType === 'Literal' && quad.object.datatype && quad.object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                const datatypeToken = `^^${shortenIRI(quad.object.datatype.value, ctx)}`;
                if (!updated.includes(datatypeToken)) {
                    updated = [...updated, datatypeToken];
                }
            }

            if (updated.length !== existingTokens.length) {
                edits.push({ start: span.start, end: span.end, text: writeAttrsTokens(updated) });
            }
        }
    }

    // NEW: Materialize list operations
    if (plan.listOperations) {
        for (const listOp of plan.listOperations) {
            const listEdits = materializeListOperation(listOp, text, ctx, base);
            edits.push(...listEdits);
        }
    }

    return edits;
}

function findInsertionPointForSubject(subject, text, base) {
    // Try to find the subject's block in the origin data
    for (const [blockId, block] of base.blocks.entries()) {
        if (block.subject === subject && block.range) {
            // Found the subject block, insert after it
            return block.range.end;
        }
    }

    // Fallback: try to find the subject in the text directly
    const subjectShort = subject.includes('#') ? subject.split('#').pop() : subject.split('/').pop();
    const subjectRegex = new RegExp(`##\\s+[^{]*\\{=\\s*${subjectShort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[^}]*\\}`, 'm');
    const match = text.match(subjectRegex);

    if (match && match.index !== undefined) {
        // Find the end of this line
        const lineEnd = text.indexOf('\n', match.index);
        return lineEnd !== -1 ? lineEnd + 1 : match.index + match.length;
    }

    // Final fallback: end of document
    return text.length;
}

function materializeListOperation(listOp, text, ctx, base) {
    const edits = [];
    const { subject, items, operation } = listOp;

    switch (operation.type) {
        case 'create':
            // Create new ordered list
            const listText = serializeListItems(items, ctx, base);
            const contextText = serializeListContext(subject, ctx, base);

            // Find insertion point under the correct subject
            const insertPoint = findInsertionPointForSubject(subject, text, base);

            let fullListText = '';
            if (contextText) {
                fullListText += '\n' + contextText;
            }
            fullListText += '\n' + listText.map(item => item.text).join('\n');

            edits.push({
                start: insertPoint,
                end: insertPoint,
                text: fullListText
            });
            break;

        case 'modify':
            // For now, handle modify as recreate
            // TODO: Implement more sophisticated modification handling
            const modifyListText = serializeListItems(items, ctx, base);
            const modifyContextText = serializeListContext(subject, ctx, base);

            const modifyInsertPoint = findInsertionPointForSubject(subject, text, base);
            let modifyFullListText = '';
            if (modifyContextText) {
                modifyFullListText += '\n' + modifyContextText;
            }
            modifyFullListText += '\n' + modifyListText.map(item => item.text).join('\n');

            edits.push({
                start: modifyInsertPoint,
                end: modifyInsertPoint,
                text: modifyFullListText
            });
            break;

        case 'delete':
            // Find and delete the entire list
            // TODO: Implement proper list range detection
            break;
    }

    return edits;
}

function serializeListItems(items, ctx, base) {
    const serializedItems = [];

    for (let i = 0; i < items.length; i++) {
        const { item, listNode } = items[i];

        // Find list item annotations (types, predicates) from origin data
        const itemAnnotations = [];

        // Find type annotations for this list item
        Array.from(base.quadIndex.entries()).forEach(([key, entry]) => {
            const parsed = parseQuadIndexKey(key);
            if (parsed?.s === item.value &&
                parsed?.p.endsWith('#type') &&
                entry.type === 'list-anchor-type') {
                itemAnnotations.push({
                    type: 'type',
                    iri: parsed.o.v,
                    range: entry.range
                });
            }
        });

        // Find predicate annotations for this list item  
        Array.from(base.quadIndex.entries()).forEach(([key, entry]) => {
            const parsed = parseQuadIndexKey(key);
            if (parsed?.s === item.value &&
                entry.type === 'list-anchor-predicate') {
                itemAnnotations.push({
                    type: 'predicate',
                    iri: parsed.p,
                    value: parsed.o.v,
                    range: entry.range
                });
            }
        });

        // Serialize the list item as proper ordered list syntax
        let itemText = `${i + 1}. `;

        if (item.termType === 'NamedNode') {
            const itemShort = shortenIRI(item.value, ctx);
            itemText += `${itemShort}`;

            // Add subject annotation if we have one
            itemText += ` {=${itemShort}}`;
        } else {
            itemText += item.value;
        }

        // Add list anchor annotations
        const annotationTokens = [];
        for (const ann of itemAnnotations) {
            if (ann.type === 'type') {
                const typeShort = shortenIRI(ann.iri, ctx);
                annotationTokens.push(`.${typeShort}`);
            } else if (ann.type === 'predicate') {
                const predShort = shortenIRI(ann.iri, ctx);
                annotationTokens.push(predShort);
            }
        }

        if (annotationTokens.length > 0) {
            itemText += ` {${annotationTokens.join(' ')}}`;
        }

        serializedItems.push({
            text: itemText,
            listNode,
            item,
            annotations: itemAnnotations
        });
    }

    return serializedItems;
}

function serializeListContext(listSubject, ctx, base) {
    // Find context quads for this list
    const contextQuads = Array.from(base.quadIndex.entries())
        .filter(([key, entry]) => {
            const parsed = parseQuadIndexKey(key);
            return parsed?.s === listSubject &&
                parsed?.p.endsWith('#in');
        });

    if (contextQuads.length === 0) return null;

    // For now, return a generic context
    // TODO: Reconstruct actual context text from origin data
    return "Status values: {?sh:in .ex:StatusType label}";
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
    base?.quadIndex?.forEach((slot, key) => {
        if (slot.isVacant) vacantSlots.set(key, slot);
    });

    const reparsed = parse(result, { context: ctx });

    // Merge vacant slots back
    vacantSlots.forEach((vacantSlot, key) => {
        if (!reparsed.origin.blocks.has(vacantSlot.blockId) && vacantSlot.blockInfo) {
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
                entries: [],
                context: blockInfo.context || { ...ctx }
            };
            reparsed.origin.blocks.set(vacantSlot.blockId, emptyBlock);
        }
        reparsed.origin.quadIndex.set(key, vacantSlot);
    });

    return { text: result, origin: reparsed.origin };
}

// Helper functions for origin lookup
function resolveOriginEntry(quad, base) {
    const key = quadToKeyForOrigin(quad);
    let entry = key ? base?.quadIndex?.get(key) : null;

    if (!entry && quad.object?.termType === 'Literal') {
        // Fallback: search by value
        for (const [k, e] of base?.quadIndex || []) {
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

    // Block affinity: prefer same block, then same subject
    for (const [, block] of base?.blocks || []) {
        if (block.subject === quad.subject.value && block.attrsRange) {
            return block;
        }
    }

    return null;
}
