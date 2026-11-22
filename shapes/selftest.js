#!/usr/bin/env node
/**
 * selftest.js — the catalog validates itself.
 *
 * catalog.md is both documentation and test suite: every `cat:Demo` node
 * carries its MD-LD source in `cat:demo` and the expected violation count in
 * `cat:expectedViolations`. This script parses the catalog, re-parses each
 * demo, runs it through validator.js, and confirms completeness.
 *
 * Usage:  node selftest.js [catalog.md]
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parse } from '../src/index.js'
import { validate } from './validator.js'

const here = dirname(fileURLToPath(import.meta.url))
const catalogPath = process.argv[2] || join(here, 'catalog.md')

const CAT = 'https://mdld.js.org/shacl/'
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

// ── Collect demos from the catalog graph ──────────────────────────────────────

const { quads } = parse({ text: readFileSync(catalogPath, 'utf8') })

/** @type {Map<string, {iri:string, name:string, source?:string, expected?:number, notCovered:boolean}>} */
const demos = new Map()

for (const q of quads) {
  if (q.predicate.value !== RDF_TYPE || q.object.value !== CAT + 'Demo') continue
  const iri = q.subject.value
  if (!demos.has(iri)) demos.set(iri, { iri, name: iri.split('/').pop(), notCovered: false })
}
for (const q of quads) {
  const d = demos.get(q.subject.value)
  if (!d) continue
  if (q.predicate.value === CAT + 'demo') d.source = q.object.value
  else if (q.predicate.value === CAT + 'expectedViolations') d.expected = parseInt(q.object.value, 10)
  else if (q.predicate.value === RDF_TYPE && q.object.value === CAT + 'notCovered') d.notCovered = true
}

// ── Run each demo ─────────────────────────────────────────────────────────────

let pass = 0, fail = 0, skip = 0
const rows = []

for (const d of demos.values()) {
  if (d.notCovered) {
    skip++
    rows.push({ name: d.name, status: 'SKIP', detail: 'not covered (SHACL-JS/SPARQL)' })
    continue
  }
  if (d.expected == null) {
    fail++
    rows.push({ name: d.name, status: 'FAIL', detail: 'missing cat:expectedViolations' })
    continue
  }
  if (!d.source) {
    fail++
    rows.push({ name: d.name, status: 'FAIL', detail: 'missing cat:demo source' })
    continue
  }
  try {
    const { quads: demoQuads } = parse({ text: d.source })
    const report = validate({ quads: demoQuads })
    const actual = report.results.length
    if (actual === d.expected) {
      pass++
      rows.push({ name: d.name, status: 'ok', detail: `${actual} violation(s)` })
    } else {
      fail++
      rows.push({ name: d.name, status: 'FAIL', detail: `expected ${d.expected}, got ${actual}` })
    }
  } catch (e) {
    fail++
    rows.push({ name: d.name, status: 'ERROR', detail: e.message })
  }
}

const w = Math.max(...rows.map(r => r.name.length), 4)
for (const r of rows) {
  const tag = r.status === 'ok' ? '  ok  ' : r.status === 'SKIP' ? ' skip ' : ' FAIL '
  console.log(`${tag} ${r.name.padEnd(w)}  ${r.detail}`)
}
console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped — ${demos.size} demos in ${catalogPath}`)
process.exit(fail ? 1 : 0)
