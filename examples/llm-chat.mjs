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
  if (q.predicate.value === PROV + 'value' && (q.subject.value.includes(':step')||q.subject.value.includes('day-'))) {
    const inner = parse({ text: q.object.value })
    modules.push(q.subject.value.split(',').pop().replace(':','.') + '=' + inner.quads.length)
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
    { subject: nn(iri), predicate: nn(LLM + 'signature'), object: lit(sha(content + '|' + agent.value)) },
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

// audit: fool-proofing check — recompute every signature in the unfolded
// graph. Messages: sha(content|author). Statements: sha(s|p|o|key), where the
// key is the prov:Key node attributed to the statement's author.
const auditSignatures = () => {
  const bySubj = new Map()
  for (const q of quads) {
    if (!bySubj.has(q.subject.value)) bySubj.set(q.subject.value, {})
    bySubj.get(q.subject.value)[q.predicate.value] = q.object
  }
  // author -> key material, via prov:Key nodes
  const keyByAuthor = new Map()
  for (const [sub, p] of bySubj) {
    if (p[RDF + 'type']?.value === PROV + 'Key' && p[PROV + 'value'] && p[PROV + 'wasAttributedTo'])
      keyByAuthor.set(p[PROV + 'wasAttributedTo'].value, p[PROV + 'value'].value)
  }
  let msgOk = 0, msgBad = [], stmtOk = 0, stmtBad = []
  for (const [sub, p] of bySubj) {
    const author = p[PROV + 'wasAttributedTo']?.value
    if (p[LLM + 'content'] && author && p[LLM + 'signature']) {
      if (p[LLM + 'signature'].value === sha(p[LLM + 'content'].value + '|' + author)) msgOk++
      else msgBad.push(sub.split(',').pop())
    }
    if (p[RDF + 'subject'] && p[RDF + 'predicate'] && p[RDF + 'object'] && author && p[LLM + 'signature']) {
      const key = keyByAuthor.get(author)
      const claim = [p[RDF + 'subject'].value, p[RDF + 'predicate'].value, p[RDF + 'object'].value].join('|') + '|' + key
      if (key && p[LLM + 'signature'].value === sha(claim)) stmtOk++
      else stmtBad.push(sub.split(',').pop())
    }
  }
  console.log(`audit: ${msgOk} messages + ${stmtOk} statements signed-ok${msgBad.length || stmtBad.length ? ` · BAD: ${[...msgBad, ...stmtBad].join(', ')}` : ''}`)
  return { msgOk, msgBad, stmtOk, stmtBad }
}
let audit = auditSignatures()

// verify: for each workbench module, regenerate canonical from its quads,
// then check its oracle — canonicalHash digest first; canonicalText diff on mismatch.
const verify = () => {
  for (const q of shell) {
    if (q.predicate.value !== PROV + 'value' || !(q.subject.value.includes(':step')||q.subject.value.includes('day-'))) continue
    const key = q.subject.value.match(/step(\d)/)?.[1]
    if (!key) continue
    const canon = generate({ quads: parse({ text: q.object.value }).quads, context: CTX }).text.trim()
    const digest = sha(canon)
    const hashQuad = shell.find(x => x.subject.value === q.subject.value && x.predicate.value === LLM + 'canonicalHash')
    const textQuad = shell.find(x => x.subject.value === q.subject.value && x.predicate.value === LLM + 'canonicalText')
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
      { subject: iri, predicate: nn(LLM + 'signature'), object: lit(sha(content + '|' + agent.value)) },
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

// shared command executor — REPL and HTTP run identical logic
const execCmd = text => {
  const cap = fn => { const out = []; const orig = console.log; console.log = (...a) => out.push(a.join(' ')); try { fn() } finally { console.log = orig } return out }
  if (text === '/quit') return { quit: true, lines: [] }
  if (text === '/records') return { lines: [JSON.stringify(report().records, null, 2)] }
  if (text === '/verify') return { lines: ['oracles:', ...cap(verify)] }
  if (text === '/statements') return { lines: [`elevated statements: ${statements.length}`, ...statements.map(q => `  ${q.subject.value.split(',').pop()} → ${q.predicate.value.split(',').pop().slice(0, 60)} → ${String(q.object.value).slice(0, 60)}`)] }
  if (text === '/audit') { audit = auditSignatures(); return { lines: cap(() => {}) } }
  const um = `llm:msg-${String(++turn).padStart(3, '0')}`
  addMsg(um, 'UserMessage', 'user', text, USER)
  const am = `llm:msg-${String(++turn).padStart(3, '0')}`
  const reply = agentReply()
  addMsg(am, 'AssistantMessage', 'assistant', reply, AGENT)
  const r = report()
  return { lines: [`you: ${text}`, `agent: ${reply}`, `  [${quads.length} quads · ${r.violations.length} violations · ${statements.length} elevated]`] }
}

if (process.argv[2] === 'serve') {
  const { createServer } = await import('node:http')
  const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const short = v => esc(String(v).split(',').pop())
  const history = []
  const page = () => {
    const r = report()
    const recRows = Object.entries(r.records).flatMap(([shape, nodes]) =>
      Object.entries(nodes).map(([id, rec]) => `<tr><td>${esc(shape.split(':').pop())}</td><td>${short(id)}</td><td><code>${esc(JSON.stringify(rec)).slice(0, 300)}</code></td></tr>`))
    const stmtRows = statements.map(q => `<tr><td>${short(q.subject.value)}</td><td>${esc(q.predicate.value)}</td><td>${esc(String(q.object.value).slice(0, 120))}</td></tr>`)
    const violRows = r.violations.map(v => `<li>${esc(v.message || JSON.stringify(v).slice(0, 120))}</li>`)
    return `<!doctype html><meta charset=utf-8><title>llm-chat graph</title>
<style>body{font:14px/1.5 system-ui;max-width:1000px;margin:2em auto;padding:0 1em}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:3px 6px;text-align:left;font-size:12px}code{word-break:break-all}.ok{color:green}.bad{color:red}h2{margin-top:1.5em}</style>
<h1>llm-chat — live graph</h1>
<p><b>${quads.length}</b> quads · ${modules.length} modules · <b>${statements.length}</b> elevated ·
<span class="${r.conforms ? 'ok' : 'bad'}">${r.violations.length} violations · conforms=${r.conforms}</span></p>
<p class="${audit.msgBad.length + audit.stmtBad.length ? 'bad' : 'ok'}">audit: ${audit.msgOk} messages + ${audit.stmtOk} statements signed-ok${audit.msgBad.length + audit.stmtBad.length ? ' · BAD: ' + esc([...audit.msgBad, ...audit.stmtBad].join(', ')) : ''}</p>
<h2>Elevated statements (${statements.length})</h2><table><tr><th>subject</th><th>predicate</th><th>object</th></tr>${stmtRows.join('')}</table>
<h2>Console</h2>
<form method=post action=/cmd><input name=cmd size=80 autofocus placeholder="message or /records /verify /statements /audit /quit"> <button>send</button></form>
${history.map(h => `<pre>> ${esc(h.cmd)}\n${h.lines.map(esc).join('\n')}</pre>`).join('')}
<h2>Violations</h2><ul>${violRows.join('') || '<li class=ok>none</li>'}</ul>
<h2>Shape records (${Object.keys(r.records).length} shapes)</h2><table><tr><th>shape</th><th>node</th><th>record</th></tr>${recRows.join('')}</table>`
  }
  createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x')
    if (u.pathname === '/quads.json') {
      res.setHeader('content-type', 'application/json')
      return res.end(JSON.stringify({ quads: quads.map(q => ({ s: q.subject.value, p: q.predicate.value, o: String(q.object.value) })), statements: statements.map(q => ({ s: q.subject.value, p: q.predicate.value, o: String(q.object.value) })), records: report().records, audit }, null, 1))
    }
    if (u.pathname === '/llm-chat.md') {
      res.setHeader('content-type', 'text/markdown')
      return res.end(doc)
    }
    if (u.pathname === '/' && req.method === 'GET') {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return res.end(page())
    }
    if (u.pathname === '/cmd' && req.method === 'POST') {
      let body = ''
      for await (const chunk of req) body += chunk
      const cmd = new URLSearchParams(body).get('cmd')?.trim() || ''
      if (cmd && cmd !== '/quit') {
        const { lines } = execCmd(cmd)
        history.push({ cmd, lines })
        if (history.length > 30) history.shift()
      }
      res.statusCode = 303; res.setHeader('location', '/'); return res.end()
    }
    res.statusCode = 404; res.end('not found')
  }).listen(Number(process.env.PORT) || 3737, () => console.log(`serving on http://localhost:${process.env.PORT || 3737} — /quads.json · /llm-chat.md`))
} else {
const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' })
rl.prompt()
rl.on('line', line => {
  const text = line.trim()
  if (!text) return rl.prompt()
  const { quit, lines } = execCmd(text)
  lines.forEach(l => console.log(l))
  if (quit) return rl.close()
  rl.prompt()
})
rl.on('close', () => {
  // persist the grown conversation as canonical text for Part IV
  console.log(`conversation grew to ${quads.length} quads — /records dumps extraction, edits live in memory only`)
})
}
