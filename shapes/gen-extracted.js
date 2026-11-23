#!/usr/bin/env node
/**
 * gen-extracted.js — regenerate cat:extractedPOJO blocks in catalog.md.
 *
 * For every cat:Demo, computes the canonical extraction of its fenced MD-LD
 * world: { "<shapeShortIRI>": { "<focusShortIRI>": { ...pojo... } } } with IRIs
 * shortened by the demo's own [ex] prefix. The block is written as
 * ~~~~~~json {cat:extractedPOJO} immediately after the ~~~~~~md {cat:demo} fence,
 * and selftest.js verifies it deterministically against extract.
 *
 * Usage:  node gen-extracted.js [catalog.md]
 * Exit:   0 = blocks written, 1 = parse/extraction error
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parse } from '../src/index.js'
import { extract } from './validator.js'

const here = dirname(fileURLToPath(import.meta.url))
const catalogPath = process.argv[2] || join(here, 'catalog.md')

const SH = 'http://www.w3.org/ns/shacl#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const lines = readFileSync(catalogPath, 'utf8').split('\n')

/** Shorten an IRI with the demo's [ex] base prefix. */
function shortener(source) {
  const m = source.match(/\[ex\]\s*<([^>\s]+)>/)
  const base = m ? m[1] : null
  return (iri) => (base && typeof iri === 'string' && iri.startsWith(base)) ? 'ex:' + iri.slice(base.length) : iri
}

/** Targeted NodeShapes of a demo, in document order. */
function targetedShapes(quads) {
  const seen = new Set()
  const shapes = []
  for (const q of quads) {
    if (q.predicate.value === RDF + 'type' && q.object.value === SH + 'NodeShape' && !seen.has(q.subject.value)) {
      seen.add(q.subject.value)
      const s = q.subject.value
      if (quads.some(x => x.subject.value === s && x.predicate.value.startsWith(SH + 'target'))) shapes.push(s)
    }
  }
  return shapes
}

/** Canonical extraction: { shapeShort: { focusShort: pojo } }. */
function extractAll(source) {
  const quads = parse({ text: source }).quads
  const short = shortener(source)
  const out = {}
  for (const shape of targetedShapes(quads)) {
    const byNode = extract({ quads }, shape, { byNode: true })
    const shaped = {}
    for (const [focus, pojo] of Object.entries(byNode)) shaped[short(focus)] = pojo
    out[short(shape)] = shaped
  }
  return out
}

const out = []
let currentDemo = null
let i = 0
let blocks = 0
while (i < lines.length) {
  const line = lines[i]
  const dm = line.match(/\{=cat:demo\/([\w-]+)/)
  if (dm) currentDemo = dm[1]
  out.push(line)
  i++

  if (line.trim() === '~~~~~~md {cat:demo}') {
    // capture the fenced demo source, emitting lines as we go
    const src = []
    while (i < lines.length && lines[i].trim() !== '~~~~~~') { src.push(lines[i]); out.push(lines[i]); i++ }
    if (i >= lines.length) { console.error('unterminated cat:demo fence'); process.exit(1) }
    out.push(lines[i]); i++  // closing fence
    if (!currentDemo) { console.error('cat:demo fence with no demo heading'); process.exit(1) }

    // skip blanks and any existing extractedPOJO block (idempotent regen)
    while (i < lines.length && lines[i].trim() === '') i++
    if (lines[i]?.trim() === '~~~~~~json {cat:extractedPOJO}') {
      i++
      while (i < lines.length && lines[i].trim() !== '~~~~~~') i++
      if (i < lines.length) i++  // closing fence of old block
      while (i < lines.length && lines[i].trim() === '') i++
    }

    const extracted = extractAll(src.join('\n'))
    const json = JSON.stringify(extracted, null, 4)
    out.push('', '~~~~~~json {cat:extractedPOJO}', json, '~~~~~~', '')
    blocks++
    console.log(`  ${currentDemo.padEnd(14)} ${Object.keys(extracted).length} shape(s)`)
  }
}

writeFileSync(catalogPath, out.join('\n'))
console.log(`\n${blocks} cat:extractedPOJO blocks written to ${catalogPath}`)
