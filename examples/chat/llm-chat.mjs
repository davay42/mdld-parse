#!/usr/bin/env node
// llm-chat — chat with the document's own graph.
// Loads examples/llm-chat.md, unfolds its modules, and grows conv-001
// turn by turn. The "agent" replies with live evaluate() output —
// the document answers in its own contract language.
//
//   node examples/llm-chat.mjs
//   /quit to exit, /records to dump the latest extraction

import { parse, evaluate, generate, render } from '../../src/index.js'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, renameSync } from 'node:fs'
import { createInterface } from 'node:readline'

const LLM = 'tag:llm.chat.example,2026:'
const PROV = 'http://www.w3.org/ns/prov#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const nn = v => ({ termType: 'NamedNode', value: v })
const lit = (v, dt) => ({ termType: 'Literal', value: v, datatype: nn(dt || XSD + 'string') })

// file is truth: every load re-parses llm-chat.md fresh — memory is only a
// cache of the current file state, never the source of record.
const MD = new URL('./llm-chat.md', import.meta.url)
// atomic write: tmp+rename so a crash mid-write can't tear the document
const writeMD = text => { writeFileSync(MD.pathname + '.tmp', text); renameSync(MD.pathname + '.tmp', MD.pathname) }
let doc, shell, quads, statements, modules
const reload = () => {
  doc = readFileSync(MD, 'utf8')
  const top = parse({ text: doc })
  shell = top.quads
  quads = [...shell]
  statements = [...(top.statements || [])]
  modules = []
  for (const q of shell) {
    if (q.predicate.value === LLM + 'payload' && (q.subject.value.includes(':step') || q.subject.value.includes('day-') || q.subject.value.includes(':terms'))) {
      const inner = parse({ text: q.object.value })
      modules.push(q.subject.value.split(',').pop().replace(':', '.') + '=' + inner.quads.length)
      quads.push(...inner.quads)
      statements.push(...(inner.statements || []))
    }
  }
}
reload()

const report = () => evaluate({ quads })

// one-line loading log
{
  const r = report()
  console.log(`llm-chat — ${quads.length} quads (${modules.length} modules: ${modules.join(' ')}) · ${statements.length} elevated · ${r.violations.length} violations · conforms=${r.conforms}`)
}


const termSlug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const RDFS_C = 'http://www.w3.org/2000/01/rdf-schema#comment'
const lookupCached = name => quads.find(q =>
  q.subject.value === LLM + 'term-' + termSlug(name) && q.predicate.value === RDFS_C
)?.object.value || null
const appendTerm = (name, def, url) => {
  const key = 'term-' + termSlug(name)
  if (lookupCached(name)) return // already a term
  const short = def.length > 300 ? def.slice(0, 297) + '…' : def
  const block = `## ${name} {=llm:${key} .llm:Term label}\n[${short.replace(/\n/g, ' ')}] {rdfs:comment}${url ? `\n[${url}] {rdfs:seeAlso}` : ''}\n`
  let text = readFileSync(MD, 'utf8')
  const termsQ = shell.find(q => q.subject.value === LLM + 'terms' && q.predicate.value === LLM + 'payload')
  if (termsQ) {
    const dmPos = text.match(/## Terms[\s\S]*?~~~~~~md \{llm:payload\}/)
    const closeIdx = text.indexOf('\n~~~~~~', dmPos.index + dmPos[0].length)
    text = text.slice(0, closeIdx) + '\n' + block + text.slice(closeIdx)
  } else {
    text = text.trimEnd() + `\n\n## Terms {=llm:terms .llm:Module label}\n~~~~~~md {llm:payload}\n[llm] <tag:llm.chat.example,2026:>\n[rdfs] <http://www.w3.org/2000/01/rdf-schema#>\n\n## Glossary {=llm:terms .llm:Module label}\n${block}~~~~~~\n`
  }
  writeMD(text)
  doc = readFileSync(MD, 'utf8') // keep cache coherent for appendExchange
}
const wikiLookup = async name => {
  const r = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(name), { signal: AbortSignal.timeout(5000) })
  const j = await r.json()
  return j.extract && j.type !== 'disambiguation' ? { def: j.extract, url: j.content_urls?.desktop?.page } : null
}

const agentReply = async (userText = '') => {
  const wm = userText.match(/^(?:what is|who is|define|tell me about)\s+(.+?)\s*\??$/i)
  if (wm) {
    const term = wm[1].trim().replace(/^(?:a|an|the)\s+/i, '')
    const cached = lookupCached(term)
    if (cached) return `${term} — ${cached}`
    try {
      const hit = await wikiLookup(term)
      if (hit) { appendTerm(term, hit.def, hit.url); return `${term} — ${lookupCached(term) || hit.def}` }
    } catch { }
    return `I don't know what "${term}" is — no entry found.`
  }
  // teach: "X is/means/= definition" — the human supplies what the agent lacks
  const tm = userText.match(/^([A-Za-z][\w\s-]{1,50}?)\s+(?:is|means|equals|=|:)\s+(.{10,})$/)
  if (tm && !userText.startsWith('/')) {
    const name = tm[1].trim(), def = tm[2].trim()
    if (!lookupCached(name)) {
      appendTerm(name, def + ' (user-supplied)', null)
      return `Noted — "${name}" added to the glossary on your authority.`
    }
    return `"${name}" is already in the glossary.`
  }
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
const auditSignatures = (quiet = false) => {
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
  const line = `audit: ${msgOk} messages + ${stmtOk} statements signed-ok${msgBad.length || stmtBad.length ? ` · BAD: ${[...msgBad, ...stmtBad].join(', ')}` : ''}`
  if (!quiet) console.log(line)
  return { msgOk, msgBad, stmtOk, stmtBad, line }
}
let audit = auditSignatures()

// verify: for each workbench module, regenerate canonical from its quads,
// then check its oracle — canonicalHash digest first; canonicalText diff on mismatch.
const verify = () => {
  for (const q of shell) {
    if (q.predicate.value !== LLM + 'payload' || !(q.subject.value.includes(':step') || q.subject.value.includes('day-'))) continue
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
  const dayRe = new RegExp('## Day ' + day + '[\\s\\S]*?~~~~~~md \\{llm:payload\\}\\n([\\s\\S]*?)\\n~~~~~~')
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
  const rest = process.argv.slice(3).filter(a => !a.startsWith('--') && !['user', 'agent'].includes(process.argv[process.argv.indexOf(a) - 1]))
  const scripted = rest.length ? rest : null
  if (scripted) {
    for (const t of scripted) { const [r, ...w] = t.split(':'); mkMsg(r.trim().toLowerCase() === 'a' ? 'assistant' : 'user', w.join(':').trim(), nn(r.trim().toLowerCase() === 'a' ? agentIri : userIri)) }
  } else {
    const ask = (who, rl2) => new Promise(res => rl2.question(who + '> ', res))
    const rl2 = createInterface({ input: process.stdin, output: process.stdout })
    console.log(`logging to ${convIri} — empty line ends the exchange`)
    for (; ;) {
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
  const block = '~~~~~~md {=llm:day-' + day + ' .llm:Conversation llm:payload}\n' + canon + '\n~~~~~~'
  if (dmEarly) {
    text = text.replace(dayRe, block)
  } else {
    if (!text.includes('# Daily Log')) text = text.trimEnd() + '\n\n---\n\n# Daily Log\n'
    text = text.trimEnd() + '\n\n' + block + '\n'
  }
  writeMD(text)
  console.log(`logged ${turns.length / 2} exchanges → ${convIri} (${canon.split('\n').length} canonical lines)`)
  process.exit(0)
}

// append one user+assistant exchange to today's day module in the FILE —
// append-only text template: existing content is never regenerated, diffs stay additive.
const USER_IRI = LLM + 'user-davay', AGENT_IRI = LLM + 'agent-devin'
const S = v => v.replace('tag:llm.chat.example,2026:', 'llm:')
const msgBlock = (convIri, day, n, role, content, agent, agentName, last) => {
  const iri = S(convIri + '-msg-' + String(n).padStart(2, '0'))
  const label = content.replace(/\n/g, ' ').slice(0, 60)
  const who = role === 'user' ? ['Davay', USER_IRI, 'role-user', 'UserMessage'] : [agentName, AGENT_IRI, 'role-assistant', 'AssistantMessage']
  return `## ${label} {=${iri} .llm:${who[3]} label}
A message on [Day log ${day}] {+llm:day-${day} !prov:hadMember}
*${new Date().toISOString()}* {prov:generatedAtTime ^^xsd:dateTime}
[${content.replace(/\n/g, ' ')}] {llm:content}
[${sha(content + '|' + agent)}] {llm:signature}
[${who[0]}] {+${S(who[1])} ?prov:wasAttributedTo}
[llm:${who[2]}] {+llm:${who[2]} ?llm:role}${last ? `
[${last.label}] {+${S(last.iri)} ?llm:inReplyTo}` : ''}
`
}
const appendExchange = (userText, agentText, agentName = 'Devin') => {
  const day = new Date().toISOString().slice(0, 10)
  const convIri = LLM + 'day-' + day
  const payloadQ = shell.find(q => q.subject.value === convIri && q.predicate.value === LLM + 'payload')
  const prior = payloadQ ? parse({ text: payloadQ.object.value }).quads : []
  // chain: this day follows the most recent earlier day module, else log-origin
  const prevDay = shell.map(q => q.subject.value.match(/day-(\d{4}-\d{2}-\d{2})$/)?.[1])
    .filter(d => d && d < day).sort().pop()
  const followsObj = prevDay ? 'llm:day-' + prevDay : 'llm:log-origin'
  const followsLabel = prevDay ? 'Day log ' + prevDay : 'Log origin'
  const msgNodes = prior.filter(q => q.subject.value.includes('-msg-') && q.predicate.value === RDF + 'type').map(q => q.subject)
  let n = Math.max(0, ...msgNodes.map(q => +(q.value.match(/-msg-(\d+)$/)?.[1] || 0)))
  const lastQ = prior.filter(q => q.predicate.value === LLM + 'content').map(q => q.subject.value).filter(v => v.includes('-msg-')).pop()
  let last = lastQ ? { iri: lastQ, label: (prior.find(q => q.subject.value === lastQ && q.predicate.value === RDFS + 'label')?.object.value || '').slice(0, 60) } : null
  const blocks = []
  for (const [role, content, agent] of [['user', userText, USER_IRI], ['assistant', agentText, AGENT_IRI]]) {
    n++
    const b = msgBlock(convIri, day, n, role, content, agent, agentName, last)
    last = { iri: S(convIri + '-msg-' + String(n).padStart(2, '0')), label: content.replace(/\n/g, ' ').slice(0, 60) }
    blocks.push(b)
  }
  let text = readFileSync(MD, 'utf8')
  if (payloadQ) {
    // insert before this day's closing fence (offset lookup only — semantics came from quads)
    const dayRePos = new RegExp('## Day ' + day + '[\\s\\S]*?~~~~~~md \\{llm:payload\\}')
    const dmPos = text.match(dayRePos)
    const closeIdx = text.indexOf('\n~~~~~~', dmPos.index + dmPos[0].length)
    text = text.slice(0, closeIdx) + '\n' + blocks.join('\n') + text.slice(closeIdx)
  } else {
    if (!text.includes('# Daily Log')) text = text.trimEnd() + '\n\n---\n\n# Daily Log\n'
    const header = `[llm] <tag:llm.chat.example,2026:>\n\n## Day ${day} {=llm:day-${day} .llm:Conversation label}\nFollows [${followsLabel}] {+${followsObj} ?llm:follows}.\n~~~~~~md {llm:payload}\n## Day log ${day} {=llm:day-${day} .llm:Conversation label}\n## Davay {=llm:user-davay .prov:Agent label}\n## Devin {=llm:agent-devin .llm:Agent label}\n`
    const block = header + blocks.join('\n') + '\n~~~~~~'
    text = text.trimEnd() + '\n\n' + block + '\n'
  }
  writeMD(text)
  return convIri
}

// shared command executor — REPL and HTTP run identical logic
const execCmd = async text => {
  const cap = fn => { const out = []; const orig = console.log; console.log = (...a) => out.push(a.join(' ')); try { fn() } finally { console.log = orig } return out }
  if (text === '/quit') return { quit: true, lines: [] }
  if (text === '/records' || text.startsWith('/records ')) {
      const recs = report().records
      const arg = text.slice(8).trim()
      if (!arg) return { lines: Object.entries(recs).map(([sh, n]) => `${sh.split(':').pop()}: ${Object.keys(n).length} record(s)`) }
      const hit = Object.entries(recs).find(([sh]) => sh.split(':').pop() === arg || sh.endsWith(arg))
      if (!hit) return { lines: [`no shape "${arg}" — available: ${Object.keys(recs).map(x => x.split(':').pop()).join(', ')}`] }
      return { lines: [`${hit[0].split(':').pop()} — ${Object.keys(hit[1]).length} record(s)`], json: hit[1] }
    }
  if (text === '/verify') return { lines: ['oracles:', ...cap(verify)] }
  if (text === '/statements') return { lines: [`elevated statements: ${statements.length}`, ...statements.map(q => `  ${q.subject.value.split(',').pop()} → ${q.predicate.value.split(',').pop().slice(0, 60)} → ${String(q.object.value).slice(0, 60)}`)] }
  if (text === '/audit') { audit = auditSignatures(); return { lines: cap(() => { }) } }
  const reply = await agentReply(text)
  appendExchange(text, reply)
  reload()
  const r = report()
  return { lines: [`you: ${text}`, `agent: ${reply}`, `  [${quads.length} quads · ${r.violations.length} violations · ${statements.length} elevated · logged to ${new Date().toISOString().slice(0, 10)}]`] }
}

if (process.argv[2] === 'serve') {
  const { createServer } = await import('node:http')
  const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const short = v => esc(String(v).split(',').pop())
  // one-shot command results: set by POST /cmd, consumed by next GET — never persisted
  let pending = null
  const page = (pend = null) => {
    const r = report()

    // Extract conversation messages from quads
    const messages = []
    const bySubj = new Map()
    for (const q of quads) {
      if (!bySubj.has(q.subject.value)) bySubj.set(q.subject.value, {})
      bySubj.get(q.subject.value)[q.predicate.value] = q.object
    }

    for (const [sub, p] of bySubj) {
      if (p[LLM + 'content'] && p[PROV + 'wasAttributedTo']) {
        const role = p[LLM + 'role']?.value.split(':').pop() || 'unknown'
        const author = p[PROV + 'wasAttributedTo'].value.split(':').pop()
        const time = p[PROV + 'generatedAtTime']?.value
        messages.push({
          role,
          author,
          content: p[LLM + 'content'].value,
          time: time ? new Date(time).toLocaleTimeString() : '',
          iri: sub.split(',').pop()
        })
      }
    }

    // Sort by time
    messages.sort((a, b) => a.time.localeCompare(b.time))

    // Render messages
    const msgHtml = messages.map(m => {
      const isUser = m.role === 'user'
      return `<div class="msg ${isUser ? 'user' : 'agent'}">
      <div class="meta">
        <span class="author">${esc(m.author)}</span>
        <span class="time">${esc(m.time)}</span>
      </div>
      <div class="content">${render(m.content)}</div>
    </div>`
    }).join('')

    // Stats
    const statsHtml = `
    <div class="stats">
      <div class="stat">
        <span class="label">Quads</span>
        <span class="value">${quads.length}</span>
      </div>
      <div class="stat">
        <span class="label">Violations</span>
        <span class="value ${r.violations.length ? 'bad' : 'ok'}">${r.violations.length}</span>
      </div>
      <div class="stat">
        <span class="label">Statements</span>
        <span class="value">${statements.length}</span>
      </div>
      <div class="stat">
        <span class="label">Modules</span>
        <span class="value">${modules.length}</span>
      </div>
    </div>
  `

    // Audit status
    const auditHtml = audit.msgBad.length + audit.stmtBad.length
      ? `<div class="audit bad">⚠ ${audit.msgBad.length + audit.stmtBad.length} signature failures</div>`
      : `<div class="audit ok">✓ All signatures valid</div>`

    // Command buttons
    const cmdButtons = [
      { cmd: '/records', label: 'Records', icon: '📋' },
      { cmd: '/verify', label: 'Verify', icon: '✓' },
      { cmd: '/statements', label: 'Statements', icon: '⭐' },
      { cmd: '/audit', label: 'Audit', icon: '🔐' }
    ].map(c => `<button type="button" class="cmd-btn" data-cmd="${esc(c.cmd)}">${c.icon} ${esc(c.label)}</button>`).join('')

    // History from server
    // flat kv cell + entity cards for shape records
    const cell = v => {
      if (Array.isArray(v)) return esc(v.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(', '))
      if (v !== null && typeof v === 'object') return `<code>${esc(JSON.stringify(v))}</code>`
      return esc(String(v))
    }
    const cardHtml = nodes => `<div class="cards">` + Object.entries(nodes).map(([id, rec]) =>
      `<div class="ecard"><div class="ekey">${short(id)}</div><table class="kv">` +
      Object.entries(rec).map(([k, v]) => `<tr><td class="kk">${esc(k)}</td><td class="kv2">${cell(v)}</td></tr>`).join('') +
      `</table></div>`).join('') + '</div>'
    // one-shot overlay: rendered once, gone on refresh
    const overlayHtml = pend ? `
    <div class="overlay" onclick="if(event.target===this)this.remove()">
      <div class="odialog">
        <div class="ocmd">$ ${esc(pend.cmd)}</div>
        ${pend.lines?.length ? `<pre class="olines">${pend.lines.map(esc).join('\n')}</pre>` : ''}
        ${pend.cards ? cardHtml(pend.cards) : ''}
        <div class="ofoot"><a href="/">close ✕</a></div>
      </div>
    </div>` : '' 

    return `<!doctype html>
<meta charset=utf-8>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>llm-chat</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body {
    font: 14px/1.5 -apple-system, system-ui, sans-serif;
    background: #0a0a0a;
    color: #e0e0e0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  /* Header */
  header {
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  header h1 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
  }
  .stats {
    display: flex;
    gap: 1.5rem;
    flex: 1;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat .label {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .stat .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
  .stat .value.ok { color: #4ade80 }
  .stat .value.bad { color: #f87171 }
  .audit {
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
  }
  .audit.ok { background: #166534; color: #4ade80 }
  .audit.bad { background: #7f1d1d; color: #fca5a5 }
  
  /* Main chat area */
  main {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  /* Messages */
  .msg {
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
  }
  .msg.user {
    align-self: flex-end;
    background: #2563eb;
    color: #fff;
  }
  .msg.agent {
    align-self: flex-start;
    background: #27272a;
    border: 1px solid #3f3f46;
  }
  .msg .meta {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-bottom: 0.25rem;
    display: flex;
    gap: 0.5rem;
  }
  .msg .author { font-weight: 600 }
  .msg .content { white-space: pre-wrap }
  
  /* Command results */
  .cmd-result {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1rem;
    margin: 0.5rem 0;
  }
  .cmd-echo {
    font-size: 0.875rem;
    color: #888;
    margin-bottom: 0.5rem;
  }
  JTBL{font-size:11px;border-collapse:collapse}.jt{border-collapse:collapse;font-size:11px}.jt td{border:1px solid #333;padding:2px 8px;vertical-align:top}.jk{color:#888;white-space:nowrap}.jv{word-break:break-all}.ja{margin:0;padding-left:1.2em}.json-out{margin-top:.4em;overflow-x:auto}.cmd-output {
    font-size: 0.875rem;
    line-height: 1.4;
    white-space: pre-wrap;
    color: #e0e0e0;
    font-family: 'SF Mono', Monaco, monospace;
  }
  
  /* Input area */
  footer {
    background: #1a1a1a;
    border-top: 1px solid #333;
    padding: 1rem;
  }
  .input-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  input[type=text] {
    flex: 1;
    padding: 0.75rem 1rem;
    background: #0a0a0a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
  }
  input[type=text]:focus {
    outline: none;
    border-color: #2563eb;
  }
  button {
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:hover { background: #1d4ed8 }
  button:active { background: #1e40af }
  
  .cmd-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .cmd-btn {
    padding: 0.5rem 1rem;
    background: #27272a;
    border: 1px solid #3f3f46;
    font-size: 0.875rem;
  }
  .cmd-btn:hover {
    background: #3f3f46;
    border-color: #52525b;
  }
</style>

<header>
  <h1>llm-chat</h1>
  ${statsHtml}
  ${auditHtml}
</header>

<main id="chat">
  ${msgHtml}
  ${overlayHtml}
</main>

<footer>
  <form method=post action=/cmd class="input-row">
    <input name=cmd autofocus placeholder="Type a message or command...">
    <button type=submit>Send</button>
  </form>
  <div class="cmd-buttons">
    ${cmdButtons}
  </div>
</footer>

<script>
  // Auto-scroll to bottom
  const chat = document.getElementById('chat')
  chat.scrollTop = chat.scrollHeight
  
  // Command buttons submit via form
  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = document.querySelector('form')
      form.cmd.value = btn.dataset.cmd
      form.submit()
    })
  })
  
  // Focus input on load
  document.querySelector('input[name=cmd]').focus()
</script>`
  }
  createServer(async (req, res) => {
    reload()
    audit = auditSignatures(true)
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
      const pend = pending; pending = null
      return res.end(page(pend))
    }
    if (u.pathname === '/cmd' && req.method === 'POST') {
      let body = ''
      for await (const chunk of req) body += chunk
      const cmd = new URLSearchParams(body).get('cmd')?.trim() || ''
      if (cmd && cmd !== '/quit') {
        const out = await execCmd(cmd)
        pending = { cmd, lines: out.lines, cards: out.cards || out.json }
      }
      res.statusCode = 303; res.setHeader('location', '/'); return res.end()
    }
    res.statusCode = 404; res.end('not found')
  }).listen(Number(process.env.PORT) || 3737, () => console.log(`serving on http://localhost:${process.env.PORT || 3737} — /quads.json · /llm-chat.md`))
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' })
  rl.prompt()
  rl.on('line', async line => {
    const text = line.trim()
    if (!text) return rl.prompt()
    const { quit, lines } = await execCmd(text)
    lines.forEach(l => console.log(l))
    if (quit) return rl.close()
    if (!rl.closed) rl.prompt()
  })
  rl.on('close', () => {
    // exchanges already persisted per-message to the day log
    console.log(`session ended — ${quads.length} quads on disk (all exchanges appended to the day log)`)
  })
}
