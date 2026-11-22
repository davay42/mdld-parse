#!/usr/bin/env node
/**
 * coverage.js — ontology-driven completeness check for the catalog.
 *
 * ontology.md is the SHACL vocabulary (converted from the standard ttl).
 * Every sh: term it defines must be accounted for in catalog.md, either as:
 *   demo      — a cat:Demo is linked to it via cat:hasDemo
 *   included  — listed via cat:includes (documented constraint/targeting term)
 *   section   — it is the subject of a catalog entry ({=sh:foo ...})
 *   notCovered— explicitly marked cat:notCovered
 * Anything else is MISSING and fails the check.
 *
 * Usage:  node coverage.js [catalog.md] [ontology.md]
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parse } from '../src/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const catalogPath = process.argv[2] || join(here, 'catalog.md')
const ontologyPath = process.argv[3] || join(here, 'ontology.md')

const CAT = 'https://mdld.js.org/shacl/'
const SH = 'http://www.w3.org/ns/shacl#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'

const cat = parse({ text: readFileSync(catalogPath, 'utf8') }).quads
const ont = parse({ text: readFileSync(ontologyPath, 'utf8') }).quads

// ── Ontology: every sh: property term (the shape-authoring surface) ────────────

/** @type {Map<string, {iri:string, name:string, kind:string}>} */
const terms = new Map()
for (const q of ont) {
  if (!q.subject.value.startsWith(SH)) continue
  if (q.predicate.value === RDF + 'type' && q.object.value === RDF + 'Property') {
    terms.set(q.subject.value, { iri: q.subject.value, name: q.subject.value.slice(SH.length), kind: 'property' })
  }
}

// ── Catalog: classify coverage per sh: term ───────────────────────────────────

const hasDemo = new Set()       // constraint/target subject -> demo exists
const included = new Set()      // cat:includes objects
const notCovered = new Set()    // subjects also typed cat:notCovered
const sectionSubjects = new Set()
const mentioned = new Set()

for (const q of cat) {
  if (q.predicate.value === CAT + 'hasDemo') hasDemo.add(q.subject.value)
  if (q.predicate.value === CAT + 'includes') included.add(q.object.value)
  if (q.predicate.value === RDF + 'type' && q.object.value === CAT + 'notCovered') notCovered.add(q.subject.value)
  if (q.subject.value.startsWith(SH)) sectionSubjects.add(q.subject.value)
  for (const t of [q.subject, q.predicate, q.object]) {
    if (t?.value?.startsWith(SH)) mentioned.add(t.value)
  }
}

function statusOf(iri) {
  if (hasDemo.has(iri)) return 'demo'
  if (included.has(iri)) return notCovered.has(iri) ? 'notCovered' : 'included'
  if (sectionSubjects.has(iri)) return notCovered.has(iri) ? 'notCovered' : 'section'
  if (mentioned.has(iri)) return 'mentioned'
  return 'MISSING'
}

// ── Report ────────────────────────────────────────────────────────────────────

const rows = [...terms.values()].map(t => ({ ...t, status: statusOf(t.iri) })).sort((a, b) => a.name.localeCompare(b.name))
const order = { demo: 0, included: 1, section: 2, mentioned: 3, notCovered: 4, MISSING: 5 }
rows.sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name))

const counts = {}
for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1

const w = Math.max(...rows.map(r => r.name.length), 4)
for (const r of rows) {
  const tag = r.status === 'MISSING' ? 'MISS' : r.status.toUpperCase().slice(0, 4).padEnd(4)
  console.log(`${tag} ${r.name.padEnd(w)}  ${r.kind}`)
}
console.log(`\n${JSON.stringify(counts)} — ${rows.length} sh: terms in ontology, ${catalogPath}`)
const missing = rows.filter(r => r.status === 'MISSING')
process.exit(missing.length ? 1 : 0)
