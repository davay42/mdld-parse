#!/usr/bin/env node
/**
 * selftest.mjs — validates every ontology validation pack in this directory.
 *
 * For each <name>.shapes.md:
 *   1. PACK    — the pack merged with its sibling <name>.md ontology must
 *                produce zero violations (vocabularies are well-formed).
 *   2. EXAMPLE — every ~~~~~~md {pack:example} block must validate clean.
 *   3. VIOLATION — every ~~~~~~md {pack:violation} block must produce ≥1
 *                violation (the pack actually catches what it claims).
 *
 * Usage:  node ontologies/selftest.mjs
 * Exit:   0 = all packs pass, 1 = any failure
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parse, merge } from '../src/index.js'
import { evaluate } from '../src/evaluate.js'

const here = dirname(fileURLToPath(import.meta.url))

function sortKeys(o) { if (o instanceof Date) return o.toISOString(); if (Array.isArray(o)) return o.map(sortKeys); if (o && typeof o === 'object' && o.constructor === Object) { return Object.fromEntries(Object.keys(o).sort().map(k => [k, sortKeys(o[k])])) } return o }

let failures = 0
const problems = []
function fail(msg) { failures++; problems.push(msg) }
function ok(msg) { console.log('  ok  ', msg) }

const packs = readdirSync(here).filter(f => f.endsWith('.shapes.md')).sort()
if (packs.length === 0) { console.log('no *.shapes.md packs found'); process.exit(0) }

for (const file of packs) {
  const name = file.replace(/\.shapes\.md$/, '')
  console.log(`\n${file}`)

  const packText = readFileSync(join(here, file), 'utf8')
  const { quads: packQuads } = parse({ text: packText })

  // 1. PACK — merge with sibling ontology if present
  try {
    const ontFile = join(here, name + '.md')
    let quads = packQuads
    try {
      const { quads: ontQuads } = parse({ text: readFileSync(ontFile, 'utf8') })
      quads = merge({ quads: packQuads }, { quads: ontQuads }).quads
    } catch { /* no sibling ontology — pack stands alone */ }
    const r = evaluate({ quads })
    if (r.violations.length === 0) ok(`pack + ontology: 0 violations`)
    else fail(`pack violations: ${r.violations.map(v => v.message?.slice(0, 60)).join(' | ')}`)
  } catch (e) { fail(`pack parse/validate error: ${e.message}`) }

  // 2/3/4. Demo nodes — source + expectations all in the graph.
  // Two vocabularies: legacy pack: (ns/pack/) and unified cat: (mdld:shacl/).
  const EXS = ['https://mdld.js.org/ns/pack/', 'https://mdld.js.org/shacl/']
  const isType = q => q.predicate.value.endsWith('type')
  const examples = packQuads.filter(q => isType(q) && EXS.some(ex => q.object.value === ex + 'Demo'))
    .map(q => q.subject.value)
  const shapeIris = packQuads.filter(q => isType(q) && q.object.value.endsWith('NodeShape'))
    .map(q => q.subject.value)
  for (const exIri of examples) {
    const name = exIri.split('/').pop()
    const local = p => EXS.map(ex => ex + p)
    const srcQ = packQuads.find(q => q.subject.value === exIri && local('demo').includes(q.predicate.value))
    const expVQ = packQuads.find(q => q.subject.value === exIri && local('expectedViolations').includes(q.predicate.value))
    const expPQ = packQuads.find(q => q.subject.value === exIri && local('extractedPOJO').includes(q.predicate.value))
    if (!srcQ) { fail(`${name}: no source literal`); continue }
    let quads, context
    try { ({ quads, context } = parse({ text: srcQ.object.value })) }
    catch (e) { fail(`${name} source parse error: ${e.message}`); continue }
    // Explicit partition: demo sources may themselves be shape documents
    // (SHACL meta-shapes), so auto-classification would eat them as shapes.
    const report = evaluate({ shapes: packQuads, data: quads, context, allowJS: true })
    const wantV = expVQ ? parseInt(expVQ.object.value) : null
    if (wantV != null && report.violations.length === wantV) ok(`${name}: ${wantV} violation(s) as declared`)
    else if (wantV != null) fail(`${name}: expected ${wantV} violations, got ${report.violations.length}`)
    if (expPQ) {
      try {
        const expected = JSON.parse(expPQ.object.value)
        const actual = {}
        for (const si of shapeIris) {
          const nm = si.split('/').pop()
          if (expected[nm] !== undefined) actual[nm] = report.records[si] ?? {}
        }
        const same = JSON.stringify(sortKeys(actual)) === JSON.stringify(sortKeys(expected))
        if (same) ok(`${name} POJO matches graph contract`)
        else fail(`${name} POJO mismatch — graph contract drifted`)
      } catch (e) { fail(`${name} extractedPOJO check error: ${e.message}`) }
    }
  }
}

console.log(`\n${packs.length} pack(s): ${failures === 0 ? 'all pass' : failures + ' failure(s)'}`)
for (const p of problems) console.log('  FAIL', p)
process.exit(failures === 0 ? 0 : 1)
