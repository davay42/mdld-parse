/**
 * mdld-shapes.js — Zero-dependency SHACL Core validator for the MD-LD ecosystem.
 *
 * Single-file implementation: ~1200 LOC, no external deps.
 * Implements W3C SHACL Core (REC-shacl-20170720 + 1.2 Core WD).
 *
 * Usage:
 *   import { validate, Validator, createShapeDetector } from './mdld-shapes.js'
 *   const report = validate({ quads })           // auto-classify shapes + data
 *   const report = validate({ shapes, data })     // pre-separated
 */

// ─── Namespaces ────────────────────────────────────────────────────────────────

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const SH = 'http://www.w3.org/ns/shacl#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'

const nn = (v) => ({ termType: 'NamedNode', value: v, equals(t) { return t && t.termType === 'NamedNode' && t.value === v } })

const RDF_TYPE = nn(RDF + 'type')
const RDF_FIRST = nn(RDF + 'first')
const RDF_REST = nn(RDF + 'rest')
const RDF_NIL = nn(RDF + 'nil')

const SH_NS = SH  // shortcut

// ─── Term helpers ──────────────────────────────────────────────────────────────

function termKey(t) {
  if (!t) return ''
  if (t.termType === 'Literal') return `"${t.value}"${t.datatype?.value || ''}@${t.language || ''}`
  return `${t.termType}:${t.value}`
}

function termEquals(a, b) {
  if (!a || !b) return false
  if (a === b) return true
  if (typeof a.equals === 'function') return a.equals(b)
  if (a.termType !== b.termType) return false
  if (a.value !== b.value) return false
  if (a.termType === 'Literal') {
    if ((a.language || '') !== (b.language || '')) return false
    const ad = a.datatype?.value || ''
    const bd = b.datatype?.value || ''
    if (ad !== bd) return false
  }
  return true
}

function isNamedNode(t) { return t?.termType === 'NamedNode' }
function isBlankNode(t) { return t?.termType === 'BlankNode' }
function isLiteral(t) { return t?.termType === 'Literal' }
function isIRI(t) { return isNamedNode(t) }

// ─── Store ─────────────────────────────────────────────────────────────────────

class Store {
  #quads = new Set()
  #bySubject = new Map()
  #byPredicate = new Map()

  constructor(quads) {
    if (quads) for (const q of quads) this.add(q)
  }

  get size() { return this.#quads.size }

  add(q) {
    if (this.#quads.has(q)) return this
    this.#quads.add(q)
    this.#addToIndex(this.#bySubject, q.subject, q)
    this.#addToIndex(this.#byPredicate, q.predicate, q)
    return this
  }

  delete(q) {
    for (const x of this.#quads) {
      if (!quadEq(x, q)) continue
      this.#quads.delete(x)
      this.#deleteFromIndex(this.#bySubject, x.subject, x)
      this.#deleteFromIndex(this.#byPredicate, x.predicate, x)
      break
    }
    return this
  }

  has(q) { for (const x of this.#quads) if (quadEq(x, q)) return true; return false }
  *[Symbol.iterator]() { yield* this.#quads }

  match(s, p, o, g) {
    let candidates = this.#quads
    if (s) candidates = this.#getSmaller(candidates, this.#bySubject, s)
    if (p) candidates = this.#getSmaller(candidates, this.#byPredicate, p)

    const r = []
    for (const q of candidates) {
      if ((!s || termEquals(q.subject, s)) &&
        (!p || termEquals(q.predicate, p)) &&
        (!o || termEquals(q.object, o)) &&
        (!g || termEquals(q.graph, g))) {
        r.push(q)
      }
    }
    return new Store(r)
  }

  #addToIndex(index, term, quad) {
    const key = termKey(term)
    let quads = index.get(key)
    if (!quads) index.set(key, quads = new Set())
    quads.add(quad)
  }

  #deleteFromIndex(index, term, quad) {
    const key = termKey(term)
    const quads = index.get(key)
    if (!quads) return
    quads.delete(quad)
    if (quads.size === 0) index.delete(key)
  }

  #getSmaller(current, index, term) {
    const indexed = index.get(termKey(term))
    if (!indexed) return EMPTY_QUADS
    return indexed.size < current.size ? indexed : current
  }
}

const EMPTY_QUADS = new Set()

function quadEq(a, b) {
  return termEquals(a.subject, b.subject) &&
    termEquals(a.predicate, b.predicate) &&
    termEquals(a.object, b.object) &&
    termEquals(a.graph, b.graph)
}

// ─── Graph helpers ─────────────────────────────────────────────────────────────

function valuesOf(ds, subject, predicate) {
  const out = []
  for (const q of ds.match(subject, predicate, null)) out.push(q.object)
  return out
}

function subjectsOf(ds, predicate, object) {
  const out = []
  for (const q of ds.match(null, predicate, object)) out.push(q.subject)
  return out
}

/** Read an RDF list (rdf:first / rdf:rest chain) into a plain array of terms. */
function readList(ds, head) {
  const items = []
  const visited = new Set()
  let cur = head
  while (cur && !termEquals(cur, RDF_NIL)) {
    const key = termKey(cur)
    if (visited.has(key)) throw new Error(`Circular RDF list at ${cur.value}`)
    visited.add(key)
    const firsts = valuesOf(ds, cur, RDF_FIRST)
    const rests = valuesOf(ds, cur, RDF_REST)
    if (firsts.length !== 1 || rests.length !== 1)
      throw new Error(`Malformed RDF list at ${cur.value} (first:${firsts.length}, rest:${rests.length})`)
    items.push(firsts[0])
    cur = rests[0]
  }
  return items
}

/** Get all instances of a class (including rdfs:subClassOf chain). */
function instancesOf(ds, classIRI) {
  const supers = new Set([termKey(classIRI)])
  let changed = true
  while (changed) {
    changed = false
    for (const q of ds.match(null, nn(RDFS + 'subClassOf'), null)) {
      if (supers.has(termKey(q.subject)) && !supers.has(termKey(q.object))) {
        supers.add(termKey(q.object))
        changed = true
      }
    }
  }
  const out = []
  for (const q of ds.match(null, RDF_TYPE, null)) {
    if (supers.has(termKey(q.object))) out.push(q.subject)
  }
  return out
}

// ─── Shape detector ────────────────────────────────────────────────────────────

function createShapeDetector() {
  const shapeSubjects = new Set()
  const listNodes = new Set()
  const shapeRefs = new Set()

  function classify(quad) {
    if (!quad?.predicate?.value) return false
    const p = quad.predicate.value
    const o = quad.object?.value
    const s = quad.subject?.value

    // Rule 1: rdf:type sh:NodeShape / sh:PropertyShape
    if (p === RDF + 'type' && (o === SH + 'NodeShape' || o === SH + 'PropertyShape')) {
      shapeSubjects.add(s); return true
    }
    // Rule 2: any sh:* predicate
    if (p.startsWith(SH_NS)) {
      shapeRefs.add(o); return true
    }
    // Rule 3: known shape subject
    if (shapeSubjects.has(s)) return true
    // Rule 4: rdf:first / rdf:rest for shape-related lists
    if (p === RDF + 'first' || p === RDF + 'rest') {
      if (shapeRefs.has(s) || shapeSubjects.has(s) || listNodes.has(s)) {
        listNodes.add(s)
        if (p === RDF + 'rest' && o !== RDF + 'nil') listNodes.add(o)
        return true
      }
    }
    // Rule 5: rdf:type rdf:List for shape-referenced nodes
    if (p === RDF + 'type' && o === RDF + 'List' && shapeRefs.has(s)) {
      listNodes.add(s); return true
    }
    return false
  }

  return {
    classify,
    getStats: () => ({ shapeSubjects: shapeSubjects.size, listNodes: listNodes.size, shapeRefs: shapeRefs.size }),
    reset: () => { shapeSubjects.clear(); listNodes.clear(); shapeRefs.clear() }
  }
}

// ─── Shape / constraint extraction ─────────────────────────────────────────────

function sh(v) { return nn(SH + v) }

function findShapes(shapesDS) {
  const shapes = new Set()
  // Only NodeShapes are root entry points for validation
  for (const q of shapesDS.match(null, RDF_TYPE, nn(SH + 'NodeShape'))) shapes.add(termKey(q.subject))

  // Also catch any shape that has an explicit target, regardless of type declaration
  for (const pred of ['targetClass', 'targetNode', 'targetSubjectsOf', 'targetObjectsOf']) {
    for (const q of shapesDS.match(null, sh(pred), null)) shapes.add(termKey(q.subject))
  }
  return [...shapes]
}

function getShapeTerm(shapesDS, key) {
  for (const q of shapesDS) {
    if (termKey(q.subject) === key) return q.subject
  }
  return null
}

/** Extract all constraints declared directly on a shape node. */
function extractConstraints(shapesDS, shapeTerm) {
  const constraints = []
  const constraintPredicates = [
    'class', 'datatype', 'nodeKind',
    'minCount', 'maxCount',
    'minExclusive', 'maxExclusive', 'minInclusive', 'maxInclusive',
    'minLength', 'maxLength', 'pattern', 'flags', 'languageIn', 'uniqueLang',
    'equals', 'disjoint', 'lessThan', 'lessThanOrEquals',
    'not', 'and', 'or', 'xone', 'node',
    'hasValue', 'in', 'closed', 'ignoredProperties',
    'qualifiedValueShape', 'qualifiedMinCount', 'qualifiedMaxCount',
  ]

  const params = {}
  for (const pred of constraintPredicates) {
    const vals = valuesOf(shapesDS, shapeTerm, sh(pred))
    if (vals.length > 0) {
      params[pred] = vals.length === 1 ? vals[0] : vals
    }
  }

  // sh:message and sh:severity
  const messages = valuesOf(shapesDS, shapeTerm, sh('message'))
  const severities = valuesOf(shapesDS, shapeTerm, sh('severity'))
  const deactivated = valuesOf(shapesDS, shapeTerm, sh('deactivated'))

  // Group into constraint components
  // Value-type
  if (params.class) constraints.push({ component: 'ClassConstraintComponent', params: { class: params.class }, messages, severities })
  if (params.datatype) constraints.push({ component: 'DatatypeConstraintComponent', params: { datatype: params.datatype }, messages, severities })
  if (params.nodeKind) constraints.push({ component: 'NodeKindConstraintComponent', params: { nodeKind: params.nodeKind }, messages, severities })
  // Cardinality
  if (params.minCount != null) constraints.push({ component: 'MinCountConstraintComponent', params: { minCount: parseInt(params.minCount.value) }, messages, severities })
  if (params.maxCount != null) constraints.push({ component: 'MaxCountConstraintComponent', params: { maxCount: parseInt(params.maxCount.value) }, messages, severities })
  // Range
  if (params.minExclusive) constraints.push({ component: 'MinExclusiveConstraintComponent', params: { minExclusive: params.minExclusive }, messages, severities })
  if (params.maxExclusive) constraints.push({ component: 'MaxExclusiveConstraintComponent', params: { maxExclusive: params.maxExclusive }, messages, severities })
  if (params.minInclusive) constraints.push({ component: 'MinInclusiveConstraintComponent', params: { minInclusive: params.minInclusive }, messages, severities })
  if (params.maxInclusive) constraints.push({ component: 'MaxInclusiveConstraintComponent', params: { maxInclusive: params.maxInclusive }, messages, severities })
  // String
  if (params.minLength != null) constraints.push({ component: 'MinLengthConstraintComponent', params: { minLength: parseInt(params.minLength.value) }, messages, severities })
  if (params.maxLength != null) constraints.push({ component: 'MaxLengthConstraintComponent', params: { maxLength: parseInt(params.maxLength.value) }, messages, severities })
  if (params.pattern) constraints.push({ component: 'PatternConstraintComponent', params: { pattern: params.pattern.value, flags: params.flags?.value || '' }, messages, severities })
  if (params.languageIn) constraints.push({ component: 'LanguageInConstraintComponent', params: { languageIn: Array.isArray(params.languageIn) ? readList(shapesDS, params.languageIn[0]) : readList(shapesDS, params.languageIn) }, messages, severities })
  if (params.uniqueLang) constraints.push({ component: 'UniqueLangConstraintComponent', params: { uniqueLang: params.uniqueLang.value === 'true' }, messages, severities })
  // Property pair
  if (params.equals) constraints.push({ component: 'EqualsConstraintComponent', params: { equals: params.equals }, messages, severities })
  if (params.disjoint) constraints.push({ component: 'DisjointConstraintComponent', params: { disjoint: params.disjoint }, messages, severities })
  if (params.lessThan) constraints.push({ component: 'LessThanConstraintComponent', params: { lessThan: params.lessThan }, messages, severities })
  if (params.lessThanOrEquals) constraints.push({ component: 'LessThanOrEqualsConstraintComponent', params: { lessThanOrEquals: params.lessThanOrEquals }, messages, severities })
  // Logical
  if (params.not) {
    // sh:not can have multiple values - create separate constraint for each
    const notTerms = Array.isArray(params.not) ? params.not : [params.not]
    for (const notTerm of notTerms) {
      constraints.push({ component: 'NotConstraintComponent', params: { not: notTerm }, messages, severities })
    }
  }
  if (params.and) constraints.push({ component: 'AndConstraintComponent', params: { and: Array.isArray(params.and) ? readList(shapesDS, params.and[0]) : readList(shapesDS, params.and) }, messages, severities })
  if (params.or) constraints.push({ component: 'OrConstraintComponent', params: { or: Array.isArray(params.or) ? readList(shapesDS, params.or[0]) : readList(shapesDS, params.or) }, messages, severities })
  if (params.xone) constraints.push({ component: 'XoneConstraintComponent', params: { xone: Array.isArray(params.xone) ? readList(shapesDS, params.xone[0]) : readList(shapesDS, params.xone) }, messages, severities })
  // Shape-based
  if (params.node) constraints.push({ component: 'NodeConstraintComponent', params: { node: params.node }, messages, severities })
  if (params.hasValue) constraints.push({ component: 'HasValueConstraintComponent', params: { hasValue: params.hasValue }, messages, severities })
  if (params.in) constraints.push({ component: 'InConstraintComponent', params: { in: Array.isArray(params.in) ? readList(shapesDS, params.in[0]) : readList(shapesDS, params.in) }, messages, severities })
  if (params.closed != null) constraints.push({
    component: 'ClosedConstraintComponent', params: {
      closed: params.closed !== false &&
        !(isLiteral(params.closed) && ['false', '0'].includes(params.closed.value.toLowerCase())),
      ignoredProperties: params.ignoredProperties ? (Array.isArray(params.ignoredProperties) ? readList(shapesDS, params.ignoredProperties[0]) : readList(shapesDS, params.ignoredProperties)) : []
    }, messages, severities
  })
  // Qualified - split into separate components per SHACL spec
  if (params.qualifiedValueShape) {
    if (params.qualifiedMinCount != null) {
      constraints.push({
        component: 'QualifiedMinCountConstraintComponent', params: {
          qualifiedValueShape: params.qualifiedValueShape,
          qualifiedMinCount: parseInt(params.qualifiedMinCount.value),
        }, messages, severities
      })
    }
    if (params.qualifiedMaxCount != null) {
      constraints.push({
        component: 'QualifiedMaxCountConstraintComponent', params: {
          qualifiedValueShape: params.qualifiedValueShape,
          qualifiedMaxCount: parseInt(params.qualifiedMaxCount.value),
        }, messages, severities
      })
    }
  }

  return { constraints, deactivated: deactivated.length > 0 && (deactivated[0].value === 'true' || deactivated[0] === true) }
}

function getShapeInfo(shapesDS, shapeTerm, cache) {
  const key = termKey(shapeTerm)
  if (cache.has(key)) return cache.get(key)

  const { constraints, deactivated } = extractConstraints(shapesDS, shapeTerm)
  const info = {
    constraints,
    deactivated,
    isPropertyShape: valuesOf(shapesDS, shapeTerm, RDF_TYPE).some(t => t.value === SH + 'PropertyShape') ||
      valuesOf(shapesDS, shapeTerm, sh('path')).length > 0,
    pathTerms: valuesOf(shapesDS, shapeTerm, sh('path')),
    propertyShapes: valuesOf(shapesDS, shapeTerm, sh('property'))
  }
  cache.set(key, info)
  return info
}

// ─── Target resolution ─────────────────────────────────────────────────────────

function resolveTargets(dataDS, shapesDS, shapeTerm) {
  const targets = []

  for (const cls of valuesOf(shapesDS, shapeTerm, sh('targetClass'))) {
    targets.push(...instancesOf(dataDS, cls))
  }
  for (const node of valuesOf(shapesDS, shapeTerm, sh('targetNode'))) {
    targets.push(node)
  }
  for (const pred of valuesOf(shapesDS, shapeTerm, sh('targetSubjectsOf'))) {
    for (const q of dataDS.match(null, pred, null)) targets.push(q.subject)
  }
  for (const pred of valuesOf(shapesDS, shapeTerm, sh('targetObjectsOf'))) {
    for (const q of dataDS.match(null, pred, null)) targets.push(q.object)
  }

  // Deduplicate
  const seen = new Set()
  return targets.filter(t => {
    const k = termKey(t)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ─── Property path resolution ──────────────────────────────────────────────────

function resolvePath(dataDS, shapesDS, focusNode, pathTerm) {
  if (!pathTerm) return []
  // Simple predicate path
  if (isNamedNode(pathTerm)) {
    return valuesOf(dataDS, focusNode, pathTerm)
  }
  // Complex path (blank node with sh:inversePath, sh:alternativePath, etc.)
  if (isBlankNode(pathTerm)) {
    const [inverse] = valuesOf(shapesDS, pathTerm, sh('inversePath'))
    if (inverse) {
      const pred = isBlankNode(inverse) ? null : inverse
      if (pred) {
        const out = []
        for (const q of dataDS.match(null, pred, focusNode)) out.push(q.subject)
        return out
      }
    }
    const [alt] = valuesOf(shapesDS, pathTerm, sh('alternativePath'))
    if (alt) {
      const paths = readList(shapesDS, alt)
      const out = []
      for (const p of paths) out.push(...resolvePath(dataDS, shapesDS, focusNode, p))
      return out
    }
    const [zeroOrMore] = valuesOf(shapesDS, pathTerm, sh('zeroOrMorePath'))
    if (zeroOrMore) return transitive(dataDS, focusNode, zeroOrMore, true)
    const [oneOrMore] = valuesOf(shapesDS, pathTerm, sh('oneOrMorePath'))
    if (oneOrMore) return transitive(dataDS, focusNode, oneOrMore, false)
    const [zeroOrOne] = valuesOf(shapesDS, pathTerm, sh('zeroOrOnePath'))
    if (zeroOrOne) return [focusNode, ...valuesOf(dataDS, focusNode, zeroOrOne)]
    // Sequence path: the blank node itself is an rdf:List of predicates
    try {
      const steps = readList(shapesDS, pathTerm)
      if (steps.length > 0) {
        let nodes = [focusNode]
        for (const step of steps) {
          nodes = nodes.flatMap(n => resolvePath(dataDS, shapesDS, n, step))
        }
        return nodes
      }
    } catch { /* not a list, fall through */ }
  }
  return []
}

function transitive(ds, start, pred, includeStart) {
  const results = includeStart ? [start] : []
  const visited = new Set()
  const queue = [start]
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const cur = queue[cursor]
    const k = termKey(cur)
    if (visited.has(k)) continue
    visited.add(k)
    for (const next of valuesOf(ds, cur, pred)) {
      results.push(next)
      queue.push(next)
    }
  }
  return results
}

// ─── XSD comparison helpers ────────────────────────────────────────────────────

function toNumber(t) {
  if (!isLiteral(t)) return NaN
  const v = t.value
  if (t.datatype) {
    const dt = t.datatype.value
    if (dt === XSD + 'integer' || dt === XSD + 'int' || dt === XSD + 'long' ||
      dt === XSD + 'short' || dt === XSD + 'byte' || dt === XSD + 'nonNegativeInteger' ||
      dt === XSD + 'positiveInteger' || dt === XSD + 'unsignedInt' || dt === XSD + 'unsignedLong') {
      return parseInt(v, 10)
    }
    if (dt === XSD + 'decimal' || dt === XSD + 'float' || dt === XSD + 'double') {
      return parseFloat(v)
    }
  }
  const n = Number(v)
  return isNaN(n) ? NaN : n
}

function toDate(t) {
  if (!isLiteral(t)) return NaN
  const d = new Date(t.value)
  return isNaN(d.getTime()) ? NaN : d.getTime()
}

function compareValues(a, b) {
  // Try numeric
  const na = toNumber(a), nb = toNumber(b)
  if (!isNaN(na) && !isNaN(nb)) return na - nb
  // Try date
  const da = toDate(a), db = toDate(b)
  if (!isNaN(da) && !isNaN(db)) return da - db
  // Lexicographic
  return a.value < b.value ? -1 : a.value > b.value ? 1 : 0
}

// ─── Node kind check ──────────────────────────────────────────────────────────

function checkNodeKind(value, nodeKindIRI) {
  const kind = nodeKindIRI.value.replace(SH, '')
  switch (kind) {
    case 'IRI': return isNamedNode(value)
    case 'BlankNode': return isBlankNode(value)
    case 'Literal': return isLiteral(value)
    case 'BlankNodeOrIRI': return isBlankNode(value) || isNamedNode(value)
    case 'BlankNodeOrLiteral': return isBlankNode(value) || isLiteral(value)
    case 'IRIOrLiteral': return isNamedNode(value) || isLiteral(value)
    default: return true
  }
}

// ─── Constraint evaluation ─────────────────────────────────────────────────────

/**
 * Evaluate a single constraint against a value.
 * @returns {Array} array of violation objects (empty if passes)
 */
function evalConstraint(constraint, dataDS, shapesDS, focusNode, value, values, ctx) {
  const { component, params } = constraint
  const violations = []
  const severity = constraint.severities?.[0] || nn(SH + 'Violation')
  const message = constraint.messages?.[0]?.value || null

  function viol(extra = {}) {
    const v = { focusNode, value, severity, component: nn(SH + component), message, shape: ctx.shapeTerm, path: ctx.path, ...extra }
    if (process.env.DEBUG) {
      console.log(`  ⚠️  ${component} violation: focus=${focusNode?.value}, value=${value?.value || 'none'}, shape=${ctx.shapeTerm?.value}`)
    }
    return v
  }

  switch (component) {
    case 'ClassConstraintComponent': {
      if (!isNamedNode(value) && !isBlankNode(value)) { violations.push(viol()); break }
      const types = valuesOf(dataDS, value, RDF_TYPE)
      const ok = types.some(t => {
        // Check subclass chain
        const supers = new Set([termKey(t)])
        let changed = true
        while (changed) {
          changed = false
          for (const q of dataDS.match(null, nn(RDFS + 'subClassOf'), null)) {
            if (supers.has(termKey(q.subject)) && !supers.has(termKey(q.object))) {
              supers.add(termKey(q.object))
              changed = true
            }
          }
        }
        return supers.has(termKey(params.class))
      })
      if (!ok) violations.push(viol())
      break
    }
    case 'DatatypeConstraintComponent': {
      if (!isLiteral(value) || !termEquals(value.datatype, params.datatype)) violations.push(viol())
      break
    }
    case 'NodeKindConstraintComponent': {
      if (!checkNodeKind(value, params.nodeKind)) violations.push(viol())
      break
    }
    case 'MinCountConstraintComponent': {
      if (values.length < params.minCount) violations.push(viol())
      break
    }
    case 'MaxCountConstraintComponent': {
      if (values.length > params.maxCount) violations.push(viol())
      break
    }
    case 'MinInclusiveConstraintComponent': {
      // Only applies to literals
      if (!isLiteral(value)) break
      // Only compare if both values are comparable (same datatype or compatible)
      const cmp = compareValues(value, params.minInclusive)
      if (isNaN(cmp)) break  // Skip if not comparable
      if (cmp < 0) violations.push(viol())
      break
    }
    case 'MaxInclusiveConstraintComponent': {
      // Only applies to literals
      if (!isLiteral(value)) break
      // Only compare if both values are comparable
      const cmp = compareValues(value, params.maxInclusive)
      if (isNaN(cmp)) break  // Skip if not comparable
      if (cmp > 0) violations.push(viol())
      break
    }
    case 'MinExclusiveConstraintComponent': {
      if (!isLiteral(value)) break
      const cmp = compareValues(value, params.minExclusive)
      if (isNaN(cmp)) break
      if (cmp <= 0) violations.push(viol())
      break
    }
    case 'MaxExclusiveConstraintComponent': {
      if (!isLiteral(value)) break
      const cmp = compareValues(value, params.maxExclusive)
      if (isNaN(cmp)) break
      if (cmp >= 0) violations.push(viol())
      break
    }
    case 'MinLengthConstraintComponent': {
      if (!isLiteral(value)) break  // Only applies to literals
      if (value.value.length < params.minLength) violations.push(viol())
      break
    }
    case 'MaxLengthConstraintComponent': {
      if (!isLiteral(value)) break  // Only applies to literals
      if (value.value.length > params.maxLength) violations.push(viol())
      break
    }
    case 'PatternConstraintComponent': {
      if (!isLiteral(value)) { violations.push(viol()); break }
      try {
        const re = new RegExp(params.pattern, params.flags)
        if (!re.test(value.value)) violations.push(viol())
      } catch { violations.push(viol()) }
      break
    }
    case 'LanguageInConstraintComponent': {
      if (!isLiteral(value) || !value.language) { violations.push(viol()); break }
      const lang = value.language.toLowerCase()
      const ok = params.languageIn.some(allowed => {
        const a = (isLiteral(allowed) ? allowed.value : allowed.value || '').toLowerCase()
        return lang === a || lang.startsWith(a + '-')
      })
      if (!ok) violations.push(viol())
      break
    }
    case 'UniqueLangConstraintComponent': {
      if (!params.uniqueLang) break
      const langs = values.filter(v => isLiteral(v) && v.language).map(v => v.language.toLowerCase())
      const seen = new Set()
      for (const l of langs) {
        if (seen.has(l)) { violations.push(viol()); break }
        seen.add(l)
      }
      break
    }
    case 'EqualsConstraintComponent': {
      const otherVals = valuesOf(dataDS, focusNode, params.equals)
      const thisSet = new Set(values.map(termKey))
      const otherSet = new Set(otherVals.map(termKey))
      if (thisSet.size !== otherSet.size || ![...thisSet].every(k => otherSet.has(k))) violations.push(viol())
      break
    }
    case 'DisjointConstraintComponent': {
      const otherVals = valuesOf(dataDS, focusNode, params.disjoint)
      const overlap = values.some(v => otherVals.some(o => termEquals(v, o)))
      if (overlap) violations.push(viol())
      break
    }
    case 'LessThanConstraintComponent': {
      const otherVals = valuesOf(dataDS, focusNode, params.lessThan)
      for (const v of values) {
        if (!isLiteral(v)) continue  // Only applies to literals
        for (const o of otherVals) {
          if (!isLiteral(o)) continue
          if (compareValues(v, o) >= 0) { violations.push(viol()); break }
        }
      }
      break
    }
    case 'LessThanOrEqualsConstraintComponent': {
      const otherVals = valuesOf(dataDS, focusNode, params.lessThanOrEquals)
      for (const v of values) {
        if (!isLiteral(v)) continue  // Only applies to literals
        for (const o of otherVals) {
          if (!isLiteral(o)) continue
          if (compareValues(v, o) > 0) { violations.push(viol()); break }
        }
      }
      break
    }
    case 'HasValueConstraintComponent': {
      // sh:hasValue is a property-level constraint, not value-level
      // It checks if the property has at least one value equal to the specified value
      // This should only be evaluated once per property, not per value
      const ok = values.some(v => termEquals(v, params.hasValue))
      if (!ok) violations.push(viol())
      break
    }
    case 'InConstraintComponent': {
      const ok = params.in.some(item => termEquals(value, item))
      if (!ok) violations.push(viol())
      break
    }
    case 'NotConstraintComponent': {
      // sh:not takes a single shape (or list of shapes). Normalize to an array of shape terms:
      const notShapes = Array.isArray(params.not) ? params.not : (params.not ? [params.not] : [])
      for (const targetShape of notShapes) {
        const innerCtx = { ...ctx, shapeTerm: targetShape, visited: new Set() }
        const innerViolations = validateNodeAgainstShape(dataDS, shapesDS, targetShape, value, innerCtx)
        // sh:not fails if the inner shape conforms (i.e. yields 0 violations)
        if (innerViolations.length === 0) {
          violations.push(viol())
        }
      }
      break
    }
    case 'AndConstraintComponent': {
      for (const shapeTerm of params.and) {
        const inner = validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, value, ctx)
        if (inner.length > 0) { violations.push(viol()); break }
      }
      break
    }
    case 'OrConstraintComponent': {
      const anyConforms = params.or.some(shapeTerm => {
        const inner = validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, value, ctx)
        return inner.length === 0
      })
      if (!anyConforms) violations.push(viol())
      break
    }
    case 'XoneConstraintComponent': {
      const conforming = params.xone.filter(shapeTerm => {
        const inner = validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, value, ctx)
        return inner.length === 0
      })
      if (conforming.length !== 1) violations.push(viol())
      break
    }
    case 'NodeConstraintComponent': {
      if (!params.node) break
      const innerCtx = { ...ctx, shapeTerm: params.node, visited: new Set() }
      const inner = validateNodeAgainstShape(dataDS, shapesDS, params.node, value, innerCtx)
      if (inner.length > 0) violations.push(viol())
      break
    }
    case 'ClosedConstraintComponent': {
      if (!params.closed) break
      const allowedPreds = new Set()
      // Collect predicates from sh:property constraints on this shape
      for (const propShape of valuesOf(shapesDS, ctx.shapeTerm, sh('property'))) {
        const paths = valuesOf(shapesDS, propShape, sh('path'))
        for (const p of paths) {
          if (isNamedNode(p)) allowedPreds.add(termKey(p))
        }
      }
      // Add ignored properties
      for (const ig of (params.ignoredProperties || [])) {
        allowedPreds.add(termKey(ig))
      }
      // Always allow rdf:type in closed shapes according to SHACL spec
      allowedPreds.add(termKey(RDF_TYPE))

      // Check all predicates of focus node
      for (const q of dataDS.match(focusNode, null, null)) {
        if (!allowedPreds.has(termKey(q.predicate))) {
          violations.push(viol({ path: q.predicate, value: q.object }))
        }
      }
      break
    }
    case 'QualifiedMinCountConstraintComponent': {
      const conforming = values.filter(v => {
        const innerCtx = { ...ctx, shapeTerm: params.qualifiedValueShape, visited: new Set() }
        const inner = validateNodeAgainstShape(dataDS, shapesDS, params.qualifiedValueShape, v, innerCtx)
        return inner.length === 0
      })
      if (conforming.length < params.qualifiedMinCount) {
        violations.push(viol())
      }
      break
    }
    case 'QualifiedMaxCountConstraintComponent': {
      const conforming = values.filter(v => {
        const innerCtx = { ...ctx, shapeTerm: params.qualifiedValueShape, visited: new Set() }
        const inner = validateNodeAgainstShape(dataDS, shapesDS, params.qualifiedValueShape, v, innerCtx)
        return inner.length === 0
      })
      if (conforming.length > params.qualifiedMaxCount) {
        violations.push(viol())
      }
      break
    }
  }

  return violations
}

// ─── Core validation ───────────────────────────────────────────────────────────

function validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, focusNode, parentCtx) {
  const key = `${termKey(shapeTerm)}|${termKey(focusNode)}`
  if (parentCtx.visited.has(key)) return []  // cycle → optimistic
  parentCtx.visited.add(key)

  const shapeInfo = getShapeInfo(shapesDS, shapeTerm, parentCtx.shapeCache)
  const { constraints, deactivated, isPropertyShape, pathTerms } = shapeInfo
  if (deactivated) { parentCtx.visited.delete(key); return [] }

  if (process.env.DEBUG) {
    console.log(`\n🔍 Validating: ${focusNode?.value} against ${shapeTerm?.value} (${isPropertyShape ? 'PropertyShape' : 'NodeShape'})`)
    console.log(`   Constraints: ${constraints.map(c => c.component).join(', ')}`)
  }

  const violations = []
  const ctx = { ...parentCtx, shapeTerm }

  if (isPropertyShape) {
    // PropertyShape: resolve path and evaluate constraints against values
    for (const pathTerm of pathTerms) {
      const values = resolvePath(dataDS, shapesDS, focusNode, pathTerm)
      const propCtx = { ...ctx, path: pathTerm }

      for (const c of constraints) {
        // Property-level constraints (operate on values array)
        if (['MinCountConstraintComponent', 'MaxCountConstraintComponent', 'EqualsConstraintComponent',
          'DisjointConstraintComponent', 'LessThanConstraintComponent', 'LessThanOrEqualsConstraintComponent',
          'UniqueLangConstraintComponent', 'HasValueConstraintComponent',
          'QualifiedMinCountConstraintComponent', 'QualifiedMaxCountConstraintComponent',
          'ClosedConstraintComponent'].includes(c.component)) {
          violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, values, propCtx))
        } else {
          // Value-level constraints (operate on each value)
          for (const v of values) {
            violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, v, values, propCtx))
          }
        }
      }
    }
  } else {
    // NodeShape: evaluate node-level constraints against the focus node itself
    for (const c of constraints) {
      // Skip property-level constraints at node level
      if (['MinCountConstraintComponent', 'MaxCountConstraintComponent', 'EqualsConstraintComponent',
        'DisjointConstraintComponent', 'LessThanConstraintComponent', 'LessThanOrEqualsConstraintComponent',
        'UniqueLangConstraintComponent', 'HasValueConstraintComponent',
        'QualifiedMinCountConstraintComponent', 'QualifiedMaxCountConstraintComponent'].includes(c.component)) continue
      violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, [focusNode], ctx))
    }

    // Process sh:property shapes
    for (const propShape of shapeInfo.propertyShapes) {
      const propInfo = getShapeInfo(shapesDS, propShape, parentCtx.shapeCache)
      const { constraints: propConstraints, deactivated: propDeactivated, pathTerms: propPathTerms } = propInfo
      if (propDeactivated) continue

      for (const pathTerm of propPathTerms) {
        const values = resolvePath(dataDS, shapesDS, focusNode, pathTerm)
        const propCtx = { ...ctx, shapeTerm: propShape, path: pathTerm }

        for (const c of propConstraints) {
          // Property-level constraints (operate on values array)
          if (['MinCountConstraintComponent', 'MaxCountConstraintComponent', 'EqualsConstraintComponent',
            'DisjointConstraintComponent', 'LessThanConstraintComponent', 'LessThanOrEqualsConstraintComponent',
            'UniqueLangConstraintComponent', 'HasValueConstraintComponent',
            'QualifiedMinCountConstraintComponent', 'QualifiedMaxCountConstraintComponent',
            'ClosedConstraintComponent'].includes(c.component)) {
            violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, values, propCtx))
          } else {
            // Value-level constraints (operate on each value)
            for (const v of values) {
              violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, v, values, propCtx))
            }
          }
        }
      }
    }
  }

  parentCtx.visited.delete(key)
  return violations
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Validate data against SHACL shapes.
 *
 * @param {Object} options
 * @param {Array}  [options.quads]   - All quads (auto-classified into shapes + data)
 * @param {Array}  [options.shapes]  - Shape quads only
 * @param {Array}  [options.data]    - Data quads only
 * @param {Function} [options.classify] - Custom quad classifier
 * @returns {{ conforms: boolean, results: Array }}
 */
function validate(options) {
  let shapeQuads, dataQuads

  if (options.quads) {
    const classify = options.classify || (createShapeDetector().classify)
    // Need fresh detector for each call
    const detector = options.classify ? null : createShapeDetector()
    const sq = [], dq = []
    for (const q of options.quads) {
      const isShape = options.classify ? options.classify(q) : detector.classify(q)
      if (isShape) sq.push(q)
      else dq.push(q)
    }
    shapeQuads = sq
    dataQuads = dq
  } else {
    shapeQuads = options.shapes || []
    dataQuads = options.data || []
  }

  const shapesDS = new Store(shapeQuads)
  const dataDS = new Store(dataQuads)

  const allViolations = []
  const shapeKeys = findShapes(shapesDS)
  const shapeCache = new Map()

  for (const key of shapeKeys) {
    const shapeTerm = getShapeTerm(shapesDS, key)
    if (!shapeTerm) continue

    // Check if deactivated
    const deactivated = valuesOf(shapesDS, shapeTerm, sh('deactivated'))
    if (deactivated.length > 0 && (deactivated[0].value === 'true' || deactivated[0] === true)) continue

    const targets = resolveTargets(dataDS, shapesDS, shapeTerm)
    const ctx = { visited: new Set(), shapeTerm, shapeCache }

    for (const focusNode of targets) {
      allViolations.push(...validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, focusNode, ctx))
    }
  }

  // Debug: log violation summary
  if (process.env.DEBUG) {
    const byConstraint = {}
    const byShape = {}
    for (const v of allViolations) {
      const constraint = v.component?.value?.replace('http://www.w3.org/ns/shacl#', '') || 'Unknown'
      const shape = v.shape?.value || 'Unknown'
      byConstraint[constraint] = (byConstraint[constraint] || 0) + 1
      byShape[shape] = (byShape[shape] || 0) + 1
    }
    console.log('\n📊 Violation breakdown by constraint:')
    for (const [constraint, count] of Object.entries(byConstraint).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${constraint}: ${count}`)
    }
    console.log('\n📊 Violation breakdown by shape:')
    for (const [shape, count] of Object.entries(byShape).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${shape}: ${count}`)
    }

    // Log first 10 violations in detail
    console.log('\n📋 First 10 violations:')
    for (let i = 0; i < Math.min(10, allViolations.length); i++) {
      const v = allViolations[i]
      console.log(`  ${i + 1}. Focus: ${v.focusNode?.value}`)
      console.log(`     Shape: ${v.shape?.value}`)
      console.log(`     Path: ${v.path?.value || 'none'}`)
      console.log(`     Constraint: ${v.component?.value?.replace('http://www.w3.org/ns/shacl#', '')}`)
      console.log(`     Value: ${v.value?.value || 'none'}`)
    }
  }

  // Deduplicate violations (same focusNode + path + component = same violation)
  const uniqueViolations = []
  const seen = new Set()
  for (const v of allViolations) {
    const key = `${v.focusNode?.value}|${v.path?.value || ''}|${v.component?.value}|${v.value?.value || ''}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueViolations.push(v)
    }
  }

  return {
    conforms: uniqueViolations.length === 0,
    results: uniqueViolations
  }
}

/**
 * Stateful validator for repeated validation against the same shapes.
 */
class Validator {
  #shapeQuads

  constructor(shapeQuads, options = {}) {
    this.#shapeQuads = shapeQuads
  }

  validate(dataQuads) {
    return validate({ shapes: this.#shapeQuads, data: dataQuads })
  }
}

export { validate, Validator, createShapeDetector, Store }
export default validate
