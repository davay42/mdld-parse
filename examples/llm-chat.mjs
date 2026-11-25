#!/usr/bin/env node
// llm-chat — chat with the document's own graph.
// Loads examples/llm-chat.md, unfolds its modules, and grows conv-001
// turn by turn. The "agent" replies with live evaluate() output —
// the document answers in its own contract language.
//
//   node examples/llm-chat.mjs
//   /quit to exit, /records to dump the latest extraction

import { parse, evaluate, generate } from '../src/index.js'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'

const LLM = 'tag:llm.chat.example,2026:'
const PROV = 'http://www.w3.org/ns/prov#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const nn = v => ({ termType: 'NamedNode', value: v })
const lit = (v, dt) => ({ termType: 'Literal', value: v, datatype: nn(dt || XSD + 'string') })

const doc = readFileSync(new URL('./llm-chat.md', import.meta.url), 'utf8')
const { quads: shell } = parse({ text: doc })

// unfold: ~~~~md {=…#workbench … prov:value} blocks are dormant modules —
// parse their literal content intentionally to make them graph.
const quads = [...shell]
const statements = [...(parse({ text: doc }).statements || [])]
const modules = []
for (const q of shell) {
  if (q.predicate.value === PROV + 'value' && (q.subject.value.includes('#workbench')||q.subject.value.includes('day-'))) {
    const inner = parse({ text: q.object.value })
    modules.push(q.subject.value.split(',').pop() + '=' + inner.quads.length)
    quads.push(...inner.quads)
    statements.push(...(inner.statements || []))
  }
}

const CONV = nn(LLM + 'conv-001')
const USER = nn(LLM + 'user-davay')
const AGENT = nn(LLM + 'agent-devin')
let lastMsg = nn(LLM + 'msg-002')
let turn = 2 // msg-001, msg-002 already exist

const report = () => evaluate({ quads })

// one-line loading log
{
  const r = report()
  console.log(`llm-chat — ${quads.length} quads (${modules.length} modules: ${modules.join(' ')}) · ${statements.length} elevated · ${r.violations.length} violations · conforms=${r.conforms}`)
}

const addMsg = (iri, type, role, content, agent) => {
  const now = new Date().toISOString()
  quads.push(
    { subject: nn(iri), predicate: nn(RDF + 'type'), object: nn(LLM + type) },
    { subject: nn(iri), predicate: nn(RDFS + 'label'), object: lit(content.slice(0, 60)) },
    { subject: nn(iri), predicate: nn(LLM + 'role'), object: nn(LLM + 'role-' + role) },
    { subject: nn(iri), predicate: nn(LLM + 'content'), object: lit(content) },
    { subject: nn(iri), predicate: nn(PROV + 'generatedAtTime'), object: lit(now, XSD + 'dateTime') },
    { subject: nn(iri), predicate: nn(PROV + 'wasAttributedTo'), object: agent },
    { subject: CONV, predicate: nn(PROV + 'hadMember'), object: nn(iri) },
  )
  if (lastMsg) quads.push({ subject: nn(iri), predicate: nn(LLM + 'inReplyTo'), object: lastMsg })
  lastMsg = nn(iri)
  return iri
}

const agentReply = () => {
  const r = report()
  const lines = []
  if (r.violations.length) {
    lines.push(`Gate check: ${r.violations.length} violation(s) —`)
    r.violations.slice(0, 3).forEach(v => lines.push('  • ' + (v.message || v.component?.value || 'constraint failed')))
  } else {
    lines.push(`Gate check: clean — ${Object.keys(r.records).length} shape record(s) conform.`)
  }
  return lines.join('\n')
}

const sha = t => 'sha256:' + createHash('sha256').update(t).digest('hex').slice(0, 16)
const CTX = { llm: LLM, rdfs: RDFS, rdf: RDF, xsd: XSD, prov: PROV, sh: 'http://www.w3.org/ns/shacl#' }

// verify: for each workbench module, regenerate canonical from its quads,
// then check its oracle — canonicalHash digest first; canonicalText diff on mismatch.
const verify = () => {
  for (const q of shell) {
    if (q.predicate.value !== PROV + 'value' || !(q.subject.value.includes('#workbench')||q.subject.value.includes('day-'))) continue
    const key = q.subject.value.match(/(part\d)#workbench/)?.[1]
    if (!key) continue
    const canon = generate({ quads: parse({ text: q.object.value }).quads, context: CTX }).text.trim()
    const digest = sha(canon)
    const oracle = shell.find(x => x.subject.value.includes(key + '#canonical'))
    const hashQuad = oracle && shell.find(x => x.subject.value === oracle.subject.value && x.predicate.value === LLM + 'canonicalHash')
    const textQuad = oracle && shell.find(x => x.subject.value === oracle.subject.value && x.predicate.value === PROV + 'value')
    if (hashQuad) {
      const ok = hashQuad.object.value === digest
      console.log(`  ${key}: hash ${ok ? 'MATCH' : 'MISMATCH'} (${hashQuad.object.value} vs ${digest})`)
      if (!ok && textQuad) {
        const stored = textQuad.object.value.trim().split('\n')
        const fresh = canon.split('\n')
        const onlyFresh = fresh.filter(l => !stored.includes(l))
        const onlyStored = stored.filter(l => !fresh.includes(l))
        console.log(`    canonicalText diff — +${onlyFresh.length}/-${onlyStored.length} lines`)
        onlyFresh.slice(0, 5).forEach(l => console.log('      + ' + l))
        onlyStored.slice(0, 5).forEach(l => console.log('      - ' + l))
      }
    } else if (textQuad) {
      const ok = textQuad.object.value.trim() === canon
      console.log(`  ${key}: canonicalText ${ok ? 'MATCH' : 'MISMATCH'} (${textQuad.object.value.length} chars)`)
    } else {
      console.log(`  ${key}: no oracle found`)
    }
  }
}

// ---- log mode: node examples/llm-chat.mjs log [--user NAME] [--agent NAME]
// Alternating prompts capture a real exchange; the day is written back into
// llm-chat.md as a ~~~~md conversation module (dormant until unfolded).
if (process.argv[2] === 'log') {
  const arg = n => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : null }
  const userName = arg('user') || 'Davay'
  const agentName = arg('agent') || 'Devin'
  const userIri = LLM + 'user-' + userName.toLowerCase()
  const agentIri = LLM + 'agent-' + agentName.toLowerCase()
  const day = new Date().toISOString().slice(0, 10)
  const convIri = LLM + 'day-' + day
  const convQuads = [
    { subject: nn(convIri), predicate: nn(RDF + 'type'), object: nn(LLM + 'Conversation') },
    { subject: nn(convIri), predicate: nn(RDFS + 'label'), object: lit('Day log ' + day) },
    // participants
    { subject: nn(userIri), predicate: nn(RDF + 'type'), object: nn(PROV + 'Agent') },
    { subject: nn(userIri), predicate: nn(RDFS + 'label'), object: lit(userName) },
    { subject: nn(agentIri), predicate: nn(RDF + 'type'), object: nn(LLM + 'Agent') },
    { subject: nn(agentIri), predicate: nn(RDFS + 'label'), object: lit(agentName) },
  ]
  // load existing day module FIRST so msg numbering and reply-chaining continue
  const dayRe = new RegExp('~~~~~~md \\{=[^}]*day-' + day + ' [^}]*prov:value\\}\\n([\\s\\S]*?)\\n~~~~~~')
  const dmEarly = doc.match(dayRe)
  const priorDayQuads = dmEarly ? parse({ text: dmEarly[1] }).quads : []
  const turns = []
  let last = null, n = 0
  if (priorDayQuads.length) {
    n = Math.max(0, ...priorDayQuads.map(q => +(q.subject.value.match(/-msg-(\d+)$/)?.[1] || 0)))
    const msgT = priorDayQuads.filter(q => q.subject.value.includes('-msg-') && q.predicate.value === RDF + 'type')
    if (msgT.length) last = msgT[msgT.length - 1].subject
  }
  const mkMsg = (role, content, agent) => {
    const iri = nn(convIri + '-msg-' + String(++n).padStart(2, '0'))
    const now = new Date().toISOString()
    const q = [
      { subject: iri, predicate: nn(RDF + 'type'), object: nn(LLM + (role === 'user' ? 'UserMessage' : 'AssistantMessage')) },
      { subject: iri, predicate: nn(RDFS + 'label'), object: lit(content.slice(0, 60)) },
      { subject: iri, predicate: nn(LLM + 'role'), object: nn(LLM + 'role-' + role) },
      { subject: iri, predicate: nn(LLM + 'content'), object: lit(content) },
      { subject: iri, predicate: nn(PROV + 'generatedAtTime'), object: lit(now, XSD + 'dateTime') },
      { subject: iri, predicate: nn(PROV + 'wasAttributedTo'), object: agent },
      { subject: nn(convIri), predicate: nn(PROV + 'hadMember'), object: iri },
    ]
    if (last) q.push({ subject: iri, predicate: nn(LLM + 'inReplyTo'), object: last })
    last = iri
    turns.push(q)
    return q
  }
  const rest = process.argv.slice(3).filter(a => !a.startsWith('--') && !['user','agent'].includes(process.argv[process.argv.indexOf(a)-1]))
  const scripted = rest.length ? rest : null
  if (scripted) {
    for (const t of scripted) { const [r, ...w] = t.split(':'); mkMsg(r.trim().toLowerCase() === 'a' ? 'assistant' : 'user', w.join(':').trim(), nn(r.trim().toLowerCase() === 'a' ? agentIri : userIri)) }
  } else {
    const ask = (who, rl2) => new Promise(res => rl2.question(who + '> ', res))
    const rl2 = createInterface({ input: process.stdin, output: process.stdout })
    console.log(`logging to ${convIri} — empty line ends the exchange`)
    for (;;) {
      const u = (await ask(userName, rl2)).trim()
      if (!u) break
      mkMsg('user', u, nn(userIri))
      const a = (await ask(agentName, rl2)).trim()
      if (!a) break
      mkMsg('assistant', a, nn(agentIri))
    }
    rl2.close()
  }
  if (!turns.length) { console.log('nothing logged'); process.exit(0) }
  // merge with existing day module if present, then regenerate canonical text
  const prior = priorDayQuads
  const merged = [...prior]
  const seen = new Set(merged.map(q => [q.subject.value, q.predicate.value, q.object.value, q.object.datatype?.value || ''].join('|')))
  for (const q of [...convQuads.flat(), ...turns.flat()]) {
    const k = [q.subject.value, q.predicate.value, q.object.value, q.object.datatype?.value || ''].join('|')
    if (!seen.has(k)) { seen.add(k); merged.push(q) }
  }
  const canon = generate({ quads: merged, context: CTX }).text.trim()
  // append or replace the day module under # Daily Log
  let text = readFileSync(new URL('./llm-chat.md', import.meta.url), 'utf8')
  const block = '~~~~~~md {=llm:day-' + day + ' .llm:Conversation prov:value}\n' + canon + '\n~~~~~~'
  if (dmEarly) {
    text = text.replace(dayRe, block)
  } else {
    if (!text.includes('# Daily Log')) text = text.trimEnd() + '\n\n---\n\n# Daily Log\n'
    text = text.trimEnd() + '\n\n' + block + '\n'
  }
  writeFileSync(new URL('./llm-chat.md', import.meta.url), text)
  console.log(`logged ${turns.length / 2} exchanges → ${convIri} (${canon.split('\n').length} canonical lines)`)
  process.exit(0)
}

const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' })
rl.prompt()
rl.on('line', line => {
  const text = line.trim()
  if (!text) return rl.prompt()
  if (text === '/quit') return rl.close()
  if (text === '/records') {
    const r = report()
    console.log(JSON.stringify(r.records, null, 2))
    return rl.prompt()
  }
  if (text === '/verify') {
    console.log('oracles:')
    verify()
    return rl.prompt()
  }
  if (text === '/statements') {
    console.log(`elevated statements: ${statements.length}`)
    for (const q of statements)
      console.log(`  ${q.subject.value.split(',').pop()} → ${q.predicate.value.split(',').pop().slice(0, 60)} → ${String(q.object.value).slice(0, 60)}`)
    return rl.prompt()
  }
  const um = `llm:msg-${String(++turn).padStart(3, '0')}`
  addMsg(um, 'UserMessage', 'user', text, USER)
  const am = `llm:msg-${String(++turn).padStart(3, '0')}`
  addMsg(am, 'AssistantMessage', 'assistant', agentReply(), AGENT)
  const r = report()
  console.log(`  [${quads.length} quads · ${r.violations.length} violations]`)
  rl.prompt()
})
rl.on('close', () => {
  // persist the grown conversation as canonical text for Part IV
  console.log(`conversation grew to ${quads.length} quads — /records dumps extraction, edits live in memory only`)
})
