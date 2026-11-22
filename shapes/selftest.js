#!/usr/bin/env node
/**
 * selftest.js — the ecosystem validates itself.
 *
 * Three-way synchronization check across the MD-LD SHACL stack:
 *
 *   ontology.md ──► catalog.md ──► validator.js
 *   (ground truth)  (docs + demos)  (implementation)
 *
 * 1. COVERAGE   — every sh: property defined in ontology.md is accounted for
 *                 in catalog.md as demo / included / section / notCovered.
 * 2. SYNC       — every term the catalog presents as covered is actually
 *                 implemented in validator.js (SUPPORTED_VOCABULARY).
 *                 Implemented-but-marked-notCovered terms are reported.
 * 3. DEMOS      — every cat:Demo's cat:demo source is parsed and validated;
 *                 the violation count must equal cat:expectedViolations.
 *
 * Usage:  node selftest.js [catalog.md] [ontology.md]
 * Exit:   0 = all checks pass, 1 = any failure
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parse } from '../src/index.js'
import { validate, isSupportedTerm } from './validator.js'

const here = dirname(fileURLToPath(import.meta.url))
const catalogPath = process.argv[2] || join(here, 'catalog.md')
const ontologyPath = process.argv[3] || join(here, 'ontology.md')

const CAT = 'https://mdld.js.org/shacl/'
const SH = 'http://www.w3.org/ns/shacl#'
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const RDF_PROPERTY = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'

let failures = 0
const problems = []
function fail(msg) { failures++; problems.push(msg) }
function warn(msg) { problems.push('warn: ' + msg) }

// ── Load graphs ───────────────────────────────────────────────────────────────

const cat = parse({ text: readFileSync(catalogPath, 'utf8') }).quads
const ont = parse({ text: readFileSync(ontologyPath, 'utf8') }).quads

// ── Catalog indexes ───────────────────────────────────────────────────────────

/** @type {Map<string, {name:string, source?:string, expected?:number, notCovered:boolean}>} */
const demos = new Map()
const hasDemo = new Set()
const included = new Set()
const notCovered = new Set()
const sectionSubjects = new Set()
const mentioned = new Set()

for (const q of cat) {
  if (q.predicate.value === RDF_TYPE && q.object.value === CAT + 'Demo') {
    const iri = q.subject.value
    if (!demos.has(iri)) demos.set(iri, { name: iri.split('/').pop(), notCovered: false })
    continue
  }
  if (q.predicate.value === CAT + 'hasDemo') hasDemo.add(q.subject.value)
  else if (q.predicate.value === CAT + 'includes') included.add(q.object.value)
  else if (q.predicate.value === RDF_TYPE && q.object.value === CAT + 'notCovered') notCovered.add(q.subject.value)
  if (q.subject.value.startsWith(SH)) sectionSubjects.add(q.subject.value)
  for (const t of [q.subject, q.predicate, q.object]) {
    if (t?.value?.startsWith(SH)) mentioned.add(t.value)
  }
}
for (const q of cat) {
  const d = demos.get(q.subject.value)
  if (!d) continue
  if (q.predicate.value === CAT + 'demo') d.source = q.object.value
  else if (q.predicate.value === CAT + 'expectedViolations') d.expected = parseInt(q.object.value, 10)
  else if (q.predicate.value === RDF_TYPE && q.object.value === CAT + 'notCovered') d.notCovered = true
}

function coverageStatus(iri) {
  // Explicit notCovered wins: a term may have a demo that is itself skipped.
  if (notCovered.has(iri)) return 'notCovered'
  if (hasDemo.has(iri)) return 'demo'
  if (included.has(iri)) return 'included'
  if (sectionSubjects.has(iri)) return 'section'
  if (mentioned.has(iri)) return 'mentioned'
  return 'MISSING'
}

// ── 1. COVERAGE: ontology → catalog ───────────────────────────────────────────

/** @type {Map<string, string>} sh: property IRI → catalog status */
const termStatus = new Map()
for (const q of ont) {
  if (q.subject.value.startsWith(SH) && q.predicate.value === RDF_TYPE && q.object.value === RDF_PROPERTY) {
    termStatus.set(q.subject.value, coverageStatus(q.subject.value))
  }
}

const uncovered = [...termStatus].filter(([, s]) => s === 'MISSING' || s === 'mentioned')
for (const [iri, s] of uncovered) fail(`coverage: sh:${iri.slice(SH.length)} is ${s} — defined in ontology but not accounted for in catalog`)

// ── 2. SYNC: catalog ↔ validator ──────────────────────────────────────────────

for (const [iri, status] of termStatus) {
  const name = iri.slice(SH.length)
  const covered = status === 'demo' || status === 'included' || status === 'section'
  if (covered && !isSupportedTerm(name)) {
    fail(`sync: sh:${name} is ${status} in catalog but not implemented in validator.js`)
  }
  if (status === 'notCovered' && isSupportedTerm(name)) {
    warn(`sync: sh:${name} is implemented in validator.js but marked cat:notCovered in catalog`)
  }
}

// ── 3. DEMOS: catalog → validator ─────────────────────────────────────────────

let pass = 0, skip = 0
const rows = []

for (const d of demos.values()) {
  if (d.notCovered) {
    skip++
    rows.push({ name: d.name, status: 'SKIP', detail: 'cat:notCovered' })
    continue
  }
  if (d.expected == null) {
    fail(`demo ${d.name}: missing cat:expectedViolations`)
    rows.push({ name: d.name, status: 'FAIL', detail: 'missing cat:expectedViolations' })
    continue
  }
  if (!d.source) {
    fail(`demo ${d.name}: missing cat:demo source`)
    rows.push({ name: d.name, status: 'FAIL', detail: 'missing cat:demo source' })
    continue
  }
  try {
    const { quads: demoQuads } = parse({ text: d.source })
    const actual = validate({ quads: demoQuads }).results.length
    if (actual === d.expected) {
      pass++
      rows.push({ name: d.name, status: 'ok', detail: `${actual} violation(s)` })
    } else {
      fail(`demo ${d.name}: expected ${d.expected} violations, got ${actual}`)
      rows.push({ name: d.name, status: 'FAIL', detail: `expected ${d.expected}, got ${actual}` })
    }
  } catch (e) {
    fail(`demo ${d.name}: ${e.message}`)
    rows.push({ name: d.name, status: 'ERROR', detail: e.message })
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

const cov = {}
for (const s of termStatus.values()) cov[s] = (cov[s] || 0) + 1

const w = Math.max(...rows.map(r => r.name.length), 4)
for (const r of rows) {
  const tag = r.status === 'ok' ? '  ok  ' : r.status === 'SKIP' ? ' skip ' : ' FAIL '
  console.log(`${tag} ${r.name.padEnd(w)}  ${r.detail}`)
}

console.log(`\ndemos:     ${pass} passed, ${failures} failed, ${skip} skipped — ${demos.size} cat:Demo nodes`)
console.log(`coverage:  ${JSON.stringify(cov)} — ${termStatus.size} sh: properties in ontology`)
for (const p of problems.filter(p => p.startsWith('warn:'))) console.log(`  ${p}`)
for (const p of problems.filter(p => !p.startsWith('warn:'))) console.log(`  ${p}`)

process.exit(failures ? 1 : 0)
