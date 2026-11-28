#!/usr/bin/env node
/**
 * kitchen-sink.mjs — one complex document exercising every projection feature.
 * Assembles shapes+data as quads, renders canonical MD-LD via generate(),
 * re-parses it, then runs validate + extract + extractGraph.
 */
import { DataFactory, generate, parse } from '../src/index.js'
import { validate, extract, extractGraph } from '../src/evaluate.js'

const df = DataFactory
const nn = v => df.namedNode(v)
const lit = (v, dt) => df.literal(v, dt ? nn(dt) : undefined)
const BASE = 'tag:acme,2026:hr/'
const T = n => BASE + n
const EX = 'ex:'
const SH = 'http://www.w3.org/ns/shacl#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const iri = v => v.includes('://') || v.includes('tag:') ? nn(v) : nn(T(v))
const q = (s, p, o) => df.quad(iri(s), iri(p), o)

// ── Shapes ──────────────────────────────────────────────────────────────────
const shapes = [
  // EmployeeShape: closed NodeShape, targetClass Employee
  q('EmployeeShape', RDF + 'type', nn(SH + 'NodeShape')),
  q('EmployeeShape', SH + 'targetClass', nn(T('Employee'))),
  q('EmployeeShape', SH + 'closed', lit('true', XSD + 'boolean')),
  // simple properties
  ...[['nameProp', 'name', XSD + 'string', 'name'],
  ['ageProp', 'age', XSD + 'integer', 'age'],
  ['emailProp', 'email', XSD + 'string', 'email'],
  ['salaryProp', 'salary', XSD + 'decimal', 'salary'],
  ['statusProp', 'status', null, 'status'],
  ['roleProp', 'role', null, 'role'],
  ['passwordProp', 'password', XSD + 'string', null],  // deactivated → no key
  ].flatMap(([n, p, dt, name]) => [
    q(n, RDF + 'type', nn(SH + 'PropertyShape')),
    q('EmployeeShape', SH + 'property', nn(T(n))),
    ...(name ? [q(n, SH + 'name', lit(name))] : []),
    q(n, SH + 'path', nn(T(p))),
    ...(dt ? [q(n, SH + 'datatype', nn(dt))] : []),
  ]),
  // name: minLength 2
  q('nameProp', SH + 'minLength', lit('2', XSD + 'integer')),
  // age: 18..100
  q('ageProp', SH + 'minInclusive', lit('18', XSD + 'integer')),
  q('ageProp', SH + 'maxInclusive', lit('100', XSD + 'integer')),
  // email: acme pattern + minCount 1
  q('emailProp', SH + 'pattern', lit('@acme\\.com$')),
  q('emailProp', SH + 'minCount', lit('1', XSD + 'integer')),
  // salary: decimal, minInclusive 0
  q('salaryProp', SH + 'minInclusive', lit('0', XSD + 'decimal')),
  // bonus < salary (property-pair constraint)
  q('bonusProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('EmployeeShape', SH + 'property', nn(T('bonusProp'))),
  q('bonusProp', SH + 'name', lit('bonus')),
  q('bonusProp', SH + 'path', nn(T('bonus'))),
  q('bonusProp', SH + 'datatype', nn(XSD + 'decimal')),
  q('bonusProp', SH + 'lessThanOrEquals', nn(T('salary'))),
  // status: in-list of active statuses (property-level sh:not can't constrain
  // literals via a path-bearing shape — the inner path resolves from the value)
  q('statusProp', SH + 'in', nn(T('statusList'))),
  q('statusList', RDF + 'first', lit('active')),
  q('statusList', RDF + 'rest', nn(T('statusList2'))),
  q('statusList2', RDF + 'first', lit('on-leave')),
  q('statusList2', RDF + 'rest', nn(RDF + 'nil')),
  // role: in-list admin/user/manager
  q('roleProp', SH + 'in', nn(T('roleList'))),
  q('roleList', RDF + 'first', lit('admin')),
  q('roleList', RDF + 'rest', nn(T('roleList2'))),
  q('roleList2', RDF + 'first', lit('user')),
  q('roleList2', RDF + 'rest', nn(T('roleList3'))),
  q('roleList3', RDF + 'first', lit('manager')),
  q('roleList3', RDF + 'rest', nn(RDF + 'nil')),
  // contact: alternativePath email|phone, minCount 1 — complex path
  q('contactProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('EmployeeShape', SH + 'property', nn(T('contactProp'))),
  q('contactProp', SH + 'name', lit('contact')),
  q('contactProp', SH + 'path', nn(T('contactPath'))),
  q('contactPath', RDF + 'type', nn(SH + 'AlternativePath')),
  q('contactPath', SH + 'alternativePath', nn(T('pathList'))),
  q('pathList', RDF + 'first', nn(T('email'))),
  q('pathList', RDF + 'rest', nn(T('pathList2'))),
  q('pathList2', RDF + 'first', nn(T('phone'))),
  q('pathList2', RDF + 'rest', nn(RDF + 'nil')),
  q('contactProp', SH + 'minCount', lit('1', XSD + 'integer')),
  // password deactivated
  q('passwordProp', SH + 'deactivated', lit('true', XSD + 'boolean')),
  // address → AddressShape (sh:node)
  q('addressProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('EmployeeShape', SH + 'property', nn(T('addressProp'))),
  q('addressProp', SH + 'name', lit('address')),
  q('addressProp', SH + 'path', nn(T('address'))),
  q('addressProp', SH + 'node', nn(T('AddressShape'))),
  // projects → ProjectShape (qualifiedValueShape)
  q('projectsProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('EmployeeShape', SH + 'property', nn(T('projectsProp'))),
  q('projectsProp', SH + 'name', lit('projects')),
  q('projectsProp', SH + 'path', nn(T('project'))),
  q('projectsProp', SH + 'qualifiedValueShape', nn(T('ProjectShape'))),
  // skills: RDF list
  q('skillsProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('EmployeeShape', SH + 'property', nn(T('skillsProp'))),
  q('skillsProp', SH + 'name', lit('skills')),
  q('skillsProp', SH + 'path', nn(T('skills'))),

  // AddressShape
  q('AddressShape', RDF + 'type', nn(SH + 'NodeShape')),
  q('AddressShape', SH + 'targetClass', nn(T('Address'))),
  q('AddressShape', SH + 'property', nn(T('cityProp'))),
  q('AddressShape', SH + 'property', nn(T('zipProp'))),
  q('cityProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('cityProp', SH + 'name', lit('city')),
  q('cityProp', SH + 'path', nn(T('city'))),
  q('cityProp', SH + 'datatype', nn(XSD + 'string')),
  q('cityProp', SH + 'minLength', lit('2', XSD + 'integer')),
  q('zipProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('zipProp', SH + 'name', lit('zip')),
  q('zipProp', SH + 'path', nn(T('zip'))),
  q('zipProp', SH + 'pattern', lit('^\\d{5}$')),

  // ProjectShape
  q('ProjectShape', RDF + 'type', nn(SH + 'NodeShape')),
  q('ProjectShape', SH + 'targetClass', nn(T('Project'))),
  q('ProjectShape', SH + 'property', nn(T('pstatusProp'))),
  q('ProjectShape', SH + 'property', nn(T('pbudgetProp'))),
  q('pstatusProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('pstatusProp', SH + 'name', lit('status')),
  q('pstatusProp', SH + 'path', nn(T('pstatus'))),
  q('pstatusProp', SH + 'in', nn(T('projStatusList'))),
  q('projStatusList', RDF + 'first', lit('planned')),
  q('projStatusList', RDF + 'rest', nn(T('projStatusList2'))),
  q('projStatusList2', RDF + 'first', lit('active')),
  q('projStatusList2', RDF + 'rest', nn(T('projStatusList3'))),
  q('projStatusList3', RDF + 'first', lit('completed')),
  q('projStatusList3', RDF + 'rest', nn(RDF + 'nil')),
  q('pbudgetProp', RDF + 'type', nn(SH + 'PropertyShape')),
  q('pbudgetProp', SH + 'name', lit('budget')),
  q('pbudgetProp', SH + 'path', nn(T('budget'))),
  q('pbudgetProp', SH + 'datatype', nn(XSD + 'decimal')),
  q('pbudgetProp', SH + 'minInclusive', lit('0', XSD + 'decimal')),
]

// ── Data ────────────────────────────────────────────────────────────────────
const data = []
const emp = (n, fields) => {
  data.push(q(n, RDF + 'type', nn(T('Employee'))))
  for (const [p, o] of fields) data.push(q(n, T(p), o))
}
const D = (v, dt) => lit(v, dt)

// Alice — fully valid
emp('Alice', [
  ['name', D('Alice Ivanova')], ['age', D('34', XSD + 'integer')],
  ['email', D('alice@acme.com')], ['salary', D('85000', XSD + 'decimal')],
  ['bonus', D('5000', XSD + 'decimal')], ['status', D('active')],
  ['role', D('admin')], ['phone', D('+49-30-1234')],
  ['password', D('s3cret')],  // deactivated → invisible to extraction
  ['address', nn(T('Addr1'))], ['project', nn(T('Proj1'))], ['skills', nn(T('aliceSkills'))],
])
data.push(q('Addr1', RDF + 'type', nn(T('Address'))))
data.push(q('Addr1', 'city', D('Berlin')), q('Addr1', 'zip', D('10115')))
data.push(q('Proj1', RDF + 'type', nn(T('Project'))))
data.push(q('Proj1', 'pstatus', D('active')), q('Proj1', 'budget', D('12000', XSD + 'decimal')))
data.push(q('aliceSkills', RDF + 'first', D('javascript')))
data.push(q('aliceSkills', RDF + 'rest', nn(T('aliceSkills2'))))
data.push(q('aliceSkills2', RDF + 'first', D('rdf')))
data.push(q('aliceSkills2', RDF + 'rest', nn(RDF + 'nil')))

// Bob — bad email pattern (gmail), valid phone → contact falls back to phone
emp('Bob', [
  ['name', D('Bob Smith')], ['age', D('41', XSD + 'integer')],
  ['email', D('bob@gmail.com')], ['salary', D('62000', XSD + 'decimal')],
  ['status', D('active')], ['role', D('user')], ['phone', D('+1-555-0100')],
])

// Carol — underage + closed-shape violation (undeclared nickname) → whole record dropped
emp('Carol', [
  ['name', D('Carol Young')], ['age', D('16', XSD + 'integer')],
  ['email', D('carol@acme.com')], ['salary', D('30000', XSD + 'decimal')],
  ['status', D('active')], ['role', D('user')], ['nickname', D('Caz')],
])

// Dave — terminated + bad role + bonus > salary + bad project status → fields drop
emp('Dave', [
  ['name', D('Dave Brown')], ['age', D('52', XSD + 'integer')],
  ['email', D('dave@acme.com')], ['salary', D('80000', XSD + 'decimal')],
  ['bonus', D('90000', XSD + 'decimal')], ['status', D('terminated')],
  ['role', D('superuser')], ['address', nn(T('Addr2'))],
  ['project', nn(T('Proj2'))], ['project', nn(T('Proj3'))],
])
data.push(q('Addr2', RDF + 'type', nn(T('Address'))))
data.push(q('Addr2', 'city', D('L')), q('Addr2', 'zip', D('12345')))  // city too short
data.push(q('Proj2', RDF + 'type', nn(T('Project'))))
data.push(q('Proj2', 'pstatus', D('completed')), q('Proj2', 'budget', D('9000', XSD + 'decimal')))
data.push(q('Proj3', RDF + 'type', nn(T('Project'))))
data.push(q('Proj3', 'pstatus', D('bogus')), q('Proj3', 'budget', D('-5', XSD + 'decimal')))

// Eve — minimal valid
emp('Eve', [
  ['name', D('Eve Davis')], ['age', D('29', XSD + 'integer')],
  ['email', D('eve@acme.com')], ['salary', D('71000', XSD + 'decimal')],
  ['status', D('active')], ['role', D('manager')], ['phone', D('+44-20-9999')],
])

// ── Round-trip through generate() → parse() ─────────────────────────────────
const all = [...shapes, ...data]
const { text } = generate({ quads: all, context: { ex: BASE, sh: SH, xsd: XSD, rdf: RDF } })
const reparsed = parse({ text }).quads
console.log(`generated ${text.split('\n').length} lines → ${all.length} quads → re-parsed ${reparsed.length} quads`)

// diff original vs reparsed quads
const key = qd => [qd.subject.value, qd.predicate.value, qd.object.value, qd.graph.value].join('|')
const cnt = a => { const m = new Map(); for (const qd of a) m.set(key(qd), (m.get(key(qd)) || 0) + 1); return m }
const A = cnt(all), B = cnt(reparsed)
const short = s => s.replace('tag:acme,2026:hr/', 'ex:').replace('http://www.w3.org/ns/shacl#', 'sh:').replace('http://www.w3.org/2001/XMLSchema#', 'xsd:').replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:')
for (const [k, n] of A) if ((B.get(k) || 0) < n) console.log('  LOST  x' + (n - (B.get(k) || 0)), short(k))
for (const [k, n] of B) if ((A.get(k) || 0) < n) console.log('  GAINED x' + (n - (A.get(k) || 0)), short(k))

// ── Validate ────────────────────────────────────────────────────────────────
const report = validate({ quads: all })
console.log(`\n=== VALIDATION: ${report.conforms ? 'CONFORMS' : `${report.results.length} violations`} ===`)
for (const v of report.results) {
  const short = t => (t?.value || '?').replace(BASE, 'ex:').split('/').pop()
  console.log(`  ${short(v.severity)}/${short(v.component)}  ${short(v.focusNode)} ← ${short(v.shape)} path=${short(v.path)} → ${JSON.stringify(v.value?.value ?? v.value?.id ?? v.value).slice(0, 60)}`)
}

// ── Extract POJO ────────────────────────────────────────────────────────────
console.log('\n=== extract ===')
const pojos = extract({ quads: all }, T('EmployeeShape'))
console.log(JSON.stringify(pojos, null, 2))

// ── Extract SubGraph ────────────────────────────────────────────────────────
console.log('\n=== extractGraph ===')
const sub = extractGraph({ quads: all }, T('EmployeeShape'))
const predCount = {}
for (const qd of sub) {
  const p = qd.predicate.value.replace(BASE, 'ex:').split('/').pop()
  predCount[p] = (predCount[p] || 0) + 1
}
console.log(`${sub.length} quads:`)
for (const [p, c] of Object.entries(predCount).sort()) console.log(`  ${p}: ${c}`)
// confirm undeclared predicates absent
const leaked = sub.filter(qd => ['nickname', 'password'].includes(qd.predicate.value.replace(BASE, '')))
console.log(`undeclared/nickname+password quads present: ${leaked.length} (expect 0)`)
