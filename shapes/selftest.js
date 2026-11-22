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
 * 4. SELF       — the catalog's own SHACL shapes (cat:self section) must
 *                 conform against the catalog graph itself.
 *
 * Usage:  node selftest.js [catalog.md] [ontology.md]
 * Exit:   0 = all checks pass, 1 = any failure
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parse, DataFactory } from '../src/index.js'
import { validate, isSupportedTerm, extractPOJO, extractSubGraph } from './validator.js'

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
    // catalog demos are trusted shapes — sh:js enabled explicitly
    const actual = validate({ quads: demoQuads, allowJS: true }).results.length
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

// ── 4. SELF: the catalog validates itself with its own shapes ─────────────────

let selfViolations = 0
try {
  const report = validate({ quads: cat })
  selfViolations = report.results.length
  if (selfViolations > 0) {
    fail(`self: catalog violates its own shapes — ${selfViolations} violation(s)`)
    for (const v of report.results.slice(0, 10)) {
      problems.push(`self: ${v.component?.value?.split('#').pop()} on ${v.focusNode?.value?.split('/').pop()} (shape ${v.shape?.value?.split('/').pop()})`)
    }
  }
} catch (e) {
  fail(`self: ${e.message}`)
}

// ── 5. PROJECTION: extractPOJO / extractSubGraph ─────────────────────────────
// The shape is the extraction schema: same quads, same shapes, two projections.

{
  const df = DataFactory
  const nn = v => df.namedNode(v)
  const lit = (v, dt) => df.literal(v, dt ? nn(dt) : undefined)
  const T = n => 'tag:proj-test,2026/' + n
  const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  const XSD = 'http://www.w3.org/2001/XMLSchema#'
  const P = p => p.includes('://') ? p : T(p)
  const q = (s, p, o) => df.quad(nn(T(s)), nn(P(p)), o)

  const pShapes = [
    q('PersonShape', RDF + 'type', nn(SH + 'NodeShape')),
    q('PersonShape', SH + 'targetClass', nn(T('Person'))),
    q('PersonShape', SH + 'property', nn(T('NameProp'))),
    q('PersonShape', SH + 'property', nn(T('AgeProp'))),
    q('PersonShape', SH + 'property', nn(T('AddrProp'))),
    q('PersonShape', SH + 'property', nn(T('TagsProp'))),
    q('NameProp', RDF + 'type', nn(SH + 'PropertyShape')),
    q('NameProp', SH + 'name', lit('name')),
    q('NameProp', SH + 'path', nn(T('name'))),
    q('NameProp', SH + 'datatype', nn(XSD + 'string')),
    q('AgeProp', RDF + 'type', nn(SH + 'PropertyShape')),
    q('AgeProp', SH + 'name', lit('age')),
    q('AgeProp', SH + 'path', nn(T('age'))),
    q('AgeProp', SH + 'datatype', nn(XSD + 'integer')),
    q('AddrProp', RDF + 'type', nn(SH + 'PropertyShape')),
    q('AddrProp', SH + 'name', lit('address')),
    q('AddrProp', SH + 'path', nn(T('address'))),
    q('AddrProp', SH + 'node', nn(T('AddrShape'))),
    q('TagsProp', RDF + 'type', nn(SH + 'PropertyShape')),
    q('TagsProp', SH + 'name', lit('tags')),
    q('TagsProp', SH + 'path', nn(T('tags'))),
    q('AddrShape', RDF + 'type', nn(SH + 'NodeShape')),
    q('AddrShape', SH + 'targetClass', nn(T('Address'))),
    q('AddrShape', SH + 'property', nn(T('CityProp'))),
    q('CityProp', RDF + 'type', nn(SH + 'PropertyShape')),
    q('CityProp', SH + 'name', lit('city')),
    q('CityProp', SH + 'path', nn(T('city'))),
    q('CityProp', SH + 'datatype', nn(XSD + 'string')),
  ]
  const pData = [
    q('Alice', RDF + 'type', nn(T('Person'))),
    q('Alice', 'name', lit('Alice')),
    q('Alice', 'age', lit('30', XSD + 'integer')),
    q('Alice', 'address', nn(T('Addr1'))),
    q('Alice', 'tags', nn(T('L1'))),
    q('Alice', 'nickname', lit('Al')),
    q('L1', RDF + 'first', lit('a')),
    q('L1', RDF + 'rest', nn(T('L2'))),
    q('L2', RDF + 'first', lit('b')),
    q('L2', RDF + 'rest', nn(RDF + 'nil')),
    q('Addr1', RDF + 'type', nn(T('Address'))),
    q('Addr1', 'city', lit('Paris')),
    q('Addr1', 'secret', lit('hidden')),
    q('Bob', RDF + 'type', nn(T('Person'))),
    q('Bob', 'name', lit('Bob')),
    q('Bob', 'age', lit('41', XSD + 'integer')),
  ]
  const projQuads = [...pShapes, ...pData]

  try {
    const pojos = extractPOJO({ quads: projQuads }, T('PersonShape'))
    const [alice, bob] = pojos
    const ok =
      pojos.length === 2 &&
      alice.name === 'Alice' && alice.age === 30 && typeof alice.age === 'number' &&
      alice.address?.city === 'Paris' &&
      Array.isArray(alice.tags) && alice.tags.join(',') === 'a,b' &&
      !('nickname' in alice) &&
      bob.name === 'Bob' && bob.age === 41 && !('address' in bob)
    if (ok) {
      console.log('  ok   projection        POJO: typed casts, sh:name keys, nested sh:node, RDF list')
    } else {
      fail(`projection: unexpected POJO ${JSON.stringify(pojos)}`)
    }

    const single = extractPOJO({ quads: projQuads.filter(q => q.subject.value !== T('Bob')) }, T('PersonShape'))
    if (!single || single.name !== 'Alice') fail('projection: single-target extractPOJO should return one object')

    const sub = extractSubGraph({ quads: projQuads }, T('PersonShape'))
    const subKeys = new Set(sub.map(q => `${q.subject.value}|${q.predicate.value}|${q.object.value}`))
    const has = (s, p) => [...subKeys].some(k => k.startsWith(`${T(s)}|${T(p)}|`))
    const keepsList = sub.some(q => q.predicate.value === RDF + 'first') &&
      sub.some(q => q.predicate.value === RDF + 'rest')
    const dropsSecrets = !has('Alice', 'nickname') && !has('Addr1', 'secret')
    const keepsNested = has('Addr1', 'city') && sub.some(q => q.subject.value === T('Addr1') && q.predicate.value === RDF + 'type')
    if (keepsList && dropsSecrets && keepsNested) {
      console.log(`  ok   projection        subgraph: ${sub.length} quads, predicates filtered, list+nested kept`)
    } else {
      fail(`projection: subgraph keepsList=${keepsList} dropsSecrets=${dropsSecrets} keepsNested=${keepsNested} (${sub.length} quads)`)
    }
  } catch (e) {
    fail(`projection: ${e.message}`)
  }
}

// ── 5b. EXTRACTED POJO: cat:extractedPOJO ↔ extractPOJO ─────────────────────
// Every demo declares its canonical extraction as ~~~~~~json {cat:extractedPOJO}:
// { "<shapeShortIRI>": { "<focusShortIRI>": { ...pojo... } } }. Verify it.

function canonJSON(v) {
  if (v instanceof Date) return JSON.stringify(v)
  if (Array.isArray(v)) return '[' + v.map(canonJSON).join(',') + ']'
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonJSON(v[k])).join(',') + '}'
  }
  return JSON.stringify(v)
}

{
  const RDFNS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  const expectedByDemo = new Map()
  for (const q of cat) {
    if (q.predicate.value === CAT + 'extractedPOJO') expectedByDemo.set(q.subject.value, q.object.value)
  }

  let checked = 0
  for (const [iri, d] of demos) {
    if (d.notCovered || !d.source) continue
    const raw = expectedByDemo.get(iri)
    if (raw == null) { fail(`extractedPOJO ${iri.split('/').pop()}: missing cat:extractedPOJO block`); continue }
    try {
      const expected = JSON.parse(raw)
      const quads = parse({ text: d.source }).quads
      const m = d.source.match(/\[ex\]\s*<([^>\s]+)>/)
      const base = m ? m[1] : null
      const short = v => (base && typeof v === 'string' && v.startsWith(base)) ? 'ex:' + v.slice(base.length) : v
      const actual = {}
      const seen = new Set()
      for (const q of quads) {
        if (q.predicate.value !== RDFNS + 'type' || q.object.value !== SH + 'NodeShape' || seen.has(q.subject.value)) continue
        seen.add(q.subject.value)
        const s = q.subject.value
        if (!quads.some(x => x.subject.value === s && x.predicate.value.startsWith(SH + 'target'))) continue
        const byNode = extractPOJO({ quads }, s, { byNode: true })
        const shaped = {}
        for (const [focus, pojo] of Object.entries(byNode)) shaped[short(focus)] = pojo
        actual[short(s)] = shaped
      }
      checked++
      if (canonJSON(actual) !== canonJSON(expected)) {
        fail(`extractedPOJO ${iri.split('/').pop()}: catalog expects ${canonJSON(expected).slice(0, 120)}… got ${canonJSON(actual).slice(0, 120)}…`)
      }
    } catch (e) {
      fail(`extractedPOJO ${iri.split('/').pop()}: ${e.message}`)
    }
  }
  console.log(`  ok   extractedPOJO    ${checked} demo(s) verified against cat:extractedPOJO`)
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
console.log(`self:      ${selfViolations} violation(s) against the catalog's own shapes`)
console.log(`coverage:  ${JSON.stringify(cov)} — ${termStatus.size} sh: properties in ontology`)
for (const p of problems.filter(p => p.startsWith('warn:'))) console.log(`  ${p}`)
for (const p of problems.filter(p => !p.startsWith('warn:'))) console.log(`  ${p}`)

process.exit(failures ? 1 : 0)
