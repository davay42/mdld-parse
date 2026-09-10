#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// mdld-server.js
//
// A knowledge-graph server in one file. The only dependency is mdld-parse.
// Everything else — HTTP, HTML, forms, auth, rate limiting, git — is the
// Node.js platform and the Fetch API standard.
//
//   node mdld-server.js
//
// The content/ directory (git-tracked Markdown with MD-LD annotations) is
// the database. git is the transaction log. This file is the query engine,
// the write path, and the admin UI — one contract (mdld-parse's quads) all
// the way down.
//
// See mdld-server.md for the architecture writeup, env vars, and deploy
// notes. https://mdld.js.org/server.md 
//
// Requires Node >= 18 (uses top-level await, Readable.toWeb/fromWeb, and
// the global Request/Response/Headers/FormData objects) and `git` on PATH.
//
// ─────────────────────────────────────────────────────────────────────────

import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { readdir, readFile, writeFile, unlink, rm, mkdir } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import crypto from 'node:crypto'
import { parse, generate, shortenIRI } from '../src/index.js'

// ─── Config ─────────────────────────────────────────────────────────────

// content/ and static/ are resolved against the working directory, the
// same base every git command already uses (process.cwd()) — not against
// this script's own file location. That distinction only shows up once
// you run the server from somewhere other than "cd into the repo, then
// `node mdld-server.js`" (e.g. installed globally and pointed at a repo
// with `cwd`), but when it does, content and git silently disagree about
// which repo they're operating on.
const REPO_DIR = process.cwd()
const CONTENT_DIR = path.join(REPO_DIR, 'content')
const STATIC_DIR = path.join(REPO_DIR, 'public')

const PORT = Number(process.env.PORT) || 3000
const AUTH_ENABLED = process.env.DISABLE_AUTH !== '1'
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS
const WRITER_KEY = process.env.WRITER_KEY || null
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null
const GIT_REMOTE_URL = process.env.GIT_REMOTE_URL || null
const MAX_SUBMIT_BYTES = 8 * 1024
const MAX_REQUEST_BYTES = MAX_SUBMIT_BYTES + 4096 // + form-encoding/multipart overhead

// Named graphs must be absolute IRIs per the RDF data model — a relative
// path like "content/writers/alice.md" isn't legal as a graph name, and
// strict consumers (N3 -> TriG, SPARQL stores) will reject or mishandle
// it. Every file becomes its own named graph, giving you file-level
// provenance ("which file did this quad come from") for free; set
// GRAPH_BASE_URI if you want that IRI space to reflect a public URL
// instead of a file:// path.
const GRAPH_BASE = (process.env.GRAPH_BASE_URI || `file://${REPO_DIR}/`).replace(/\/?$/, '/')

// Off by default: req.socket.remoteAddress is the reverse proxy's own IP
// for every request once you're behind one, which collapses per-IP rate
// limiting into a single shared bucket for all users — the common
// deployment shape for this server. Only enable this if you control the
// proxy and know it sets X-Forwarded-For itself (never trust it from an
// untrusted edge, since it's otherwise a client-supplied, spoofable header).
const TRUST_PROXY = process.env.TRUST_PROXY === '1'

if (AUTH_ENABLED && (!ADMIN_USER || !ADMIN_PASS)) {
  console.error('❌ ADMIN_USER and ADMIN_PASS must both be set.')
  console.error('   For local development only, set DISABLE_AUTH=1 instead.')
  process.exit(1)
}
if (!AUTH_ENABLED) console.warn('⚠️  DISABLE_AUTH=1 — /git/* is unauthenticated. Do not deploy like this.')
if (!WRITER_KEY) console.warn('⚠️  WRITER_KEY not set — /submit accepts writes from anyone.')

// ─── HTML templating (auto-escaping, zero deps) ────────────────────────
// Mirrors the "tagged template escapes by default, nested calls compose
// without double-escaping" behavior of hono/html, in ~15 lines.

class Safe { constructor(s) { this.value = s } }
const raw = s => new Safe(s)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function html(strings, ...values) {
  let out = strings[0]
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v == null || v === false) { /* render nothing */ }
    else if (v instanceof Safe) out += v.value
    else if (Array.isArray(v)) out += v.map(x => (x instanceof Safe ? x.value : esc(x))).join('')
    else out += esc(v)
    out += strings[i + 1]
  }
  return raw(out)
}

const page = (title, body) => raw(
  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>` +
  `<meta name="viewport" content="width=device-width,initial-scale=1.0"/>` +
  `<title>${esc(title)}</title><link rel="stylesheet" href="/styles.css"/></head>` +
  `<body>${body.value}</body></html>`
)

const link = (iri, g) => html`<li><a href="/entity/?iri=${encodeURIComponent(iri)}">${g.short(iri)}</a></li>`
const entityLink = (e, g) => html`<li><a href="/entity/?iri=${encodeURIComponent(e.id)}">${e.primary?.label || g.short(e.id)}</a><br/><code>${g.short(e.id)}</code></li>`
const properties = (lits, g) => html`<ul>${Object.entries(lits).map(([p, o]) => html`<li><strong>${g.short(p)}</strong>: ${o.join(', ')}</li>`)}</ul>`

// ─── Security ───────────────────────────────────────────────────────────

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(String(a)), bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function checkBasicAuth(request) {
  if (!AUTH_ENABLED) return true
  const header = request.headers.get('authorization') || ''
  const [scheme, encoded] = header.split(' ')
  if (scheme !== 'Basic' || !encoded) return false
  let decoded
  try { decoded = Buffer.from(encoded, 'base64').toString('utf8') } catch { return false }
  const i = decoded.indexOf(':')
  if (i === -1) return false
  return timingSafeEqualStr(decoded.slice(0, i), ADMIN_USER) && timingSafeEqualStr(decoded.slice(i + 1), ADMIN_PASS)
}

const unauthorized = () => new Response('Authentication required', {
  status: 401, headers: { 'WWW-Authenticate': 'Basic realm="mdld-admin"' }
})

// CSRF protection for state-changing POSTs. There's no session/cookie
// state in this server, so a CSRF token has nothing to bind to — the
// threat that matters is a browser, holding a user's session in its
// ambient state (cookies, or here, cached Basic Auth credentials),
// making a request on a malicious page's behalf. A non-browser client —
// curl, a script, an LLM agent — sends no Origin and no Sec-Fetch-Site
// header, and critically cannot forge either while also riding on
// someone else's browser session, so it isn't CSRF-capable and is let
// through: blocking it would only lock out the "text-native agent
// memory" use case this project is built for, while doing nothing for
// security.
//
// Modern browsers attach Sec-Fetch-Site to every request and it can't be
// set by page script, unlike Origin/Host (which a DNS-rebinding attack
// can align). Check it first, when present, and trust nothing else from
// a browser unless it says "same-origin" or "none" (typed/bookmarked).
function trustedOrigin(request) {
  const origin = request.headers.get('origin')
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (!origin && !secFetchSite) return true // no browser signals present: not a browser request
  if (secFetchSite) return secFetchSite === 'same-origin' || secFetchSite === 'none'
  const host = request.headers.get('host')
  if (!host) return false
  try { return new URL(origin).host === host } catch { return false }
}

const rateBuckets = new Map()
function rateLimited(key, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateBuckets.get(key)
  if (!entry || now > entry.resetAt) { rateBuckets.set(key, { count: 1, resetAt: now + windowMs }); return false }
  entry.count++
  return entry.count > limit
}
// Buckets are cheap but unbounded without this — one IP per key, forever,
// is a slow memory leak on a long-running process. Sweep expired entries
// every 5 minutes rather than tracking per-entry timers.
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateBuckets) if (now > entry.resetAt) rateBuckets.delete(key)
}, 5 * 60_000).unref()

function clientIp(request, socketAddress) {
  if (TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
  }
  return socketAddress
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  headers.set('Content-Security-Policy', "default-src 'self'")
  return new Response(response.body, { status: response.status, headers })
}

// ─── Git ────────────────────────────────────────────────────────────────

const execFileAsync = promisify(execFile)

async function git(args) {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd: REPO_DIR, encoding: 'utf8' })
    return stdout.trim()
  } catch (e) {
    const err = new Error(e.stderr || e.message)
    err.stderr = e.stderr
    throw err
  }
}

let gitBusy = false
async function withGitLock(fn) {
  while (gitBusy) await new Promise(r => setTimeout(r, 50))
  gitBusy = true
  try { return await fn() } finally { gitBusy = false }
}

async function ensureRemote() {
  if (!GIT_REMOTE_URL) return
  try { await git(['remote', 'set-url', 'origin', GIT_REMOTE_URL]) }
  catch { await git(['remote', 'add', 'origin', GIT_REMOTE_URL]) }
}

async function configureIdentity() {
  await git(['config', 'user.email', 'mdld-bot@server.local']).catch(() => { })
  await git(['config', 'user.name', 'MDLD Server']).catch(() => { })
}

async function ensureGitRepo() {
  for (const f of ['.git/config.lock', '.git/index.lock', '.git/HEAD.lock']) {
    await unlink(path.join(REPO_DIR, f)).catch(() => { })
  }
  try {
    await git(['config', '--global', '--add', 'safe.directory', REPO_DIR])
    await git(['rev-parse', '--is-inside-work-tree'])
    console.log('✅ Git repository detected.')
    await ensureRemote()
  } catch {
    console.log('⚠️  .git missing — self-healing...')
    if (!GIT_REMOTE_URL) { console.log('⚠️  GIT_REMOTE_URL not set; running without git sync.'); return }
    // Caution: this branch runs on ANY rev-parse failure, not just a
    // genuinely missing .git — a transient/corrupt git state (e.g. a
    // half-written index after a crash) hits the same catch and gets
    // wiped and re-cloned from GIT_REMOTE_URL. That's the right recovery
    // for "no .git at all" and the wrong one for "recoverable corruption
    // with uncommitted local state" — there is none here since content
    // ships through git itself, but keep this in mind if you start
    // storing anything else uncommitted in this working tree.
    await rm(path.join(REPO_DIR, '.git'), { recursive: true, force: true }).catch(() => { })
    await git(['init'])
    await git(['config', '--global', 'init.defaultBranch', 'main'])
    await configureIdentity()
    await git(['remote', 'add', 'origin', GIT_REMOTE_URL])
    await git(['fetch', 'origin'])
    await git(['checkout', '-f', '-B', 'main', 'origin/main'])
    console.log('✅ Git repository initialized and synced.')
  }
}

// Last sync result, kept in memory so the dashboard can display it after
// a redirect without needing a query-string flag on a GET (see the
// pull-is-now-a-POST fix below: a GET that changes/reports server state
// via ?pull=1 is the kind of thing a link, a prefetcher, or a crawler can
// trigger by accident).
let lastSyncMessage = 'No sync requested yet.'

async function syncPull() {
  const result = await withGitLock(async () => {
    try {
      const dirty = (await git(['status', '--porcelain'])).length > 0
      if (dirty) await git(['stash', 'push', '--include-untracked', '-m', 'auto-sync'])
      try {
        const msg = (await git(['pull', '--no-rebase'])) || 'Already up to date.'
        if (dirty) {
          try { await git(['stash', 'pop']) }
          catch { return msg + '\n⚠️ Merge conflicts restoring local changes — resolve manually.' }
        }
        await rebuildGraph()
        return msg
      } catch (e) {
        if (dirty) await git(['stash', 'pop']).catch(() => { })
        return `Pull failed: ${e.message}\n✅ Local state safely restored.`
      }
    } catch (e) { return `Sync failed: ${e.stderr || e.message}` }
  })
  lastSyncMessage = result
  return result
}

const sanitizeFilename = name =>
  (path.basename(String(name || 'new'), '.md').replace(/[^a-z0-9\-_]/gi, '-') || 'new') + '.md'

// ─── Graph ──────────────────────────────────────────────────────────────

async function markdownFiles(dir) {
  const files = []
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return files }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...await markdownFiles(p))
    else if (e.isFile() && e.name.endsWith('.md')) files.push(p)
  }
  return files
}

async function buildGraph() {
  const files = await markdownFiles(CONTENT_DIR)
  const quads = [], entities = new Map(), context = {}, types = {}
  const getEntity = id => {
    if (!entities.has(id)) entities.set(id, { id, out: {}, in: {}, literals: {} })
    return entities.get(id)
  }
  for (const filePath of files) {
    let text
    try { text = await readFile(filePath, 'utf8') } catch { continue }
    const relPath = path.relative(REPO_DIR, filePath).replace(/\\/g, '/')
    const graphName = new URL(relPath, GRAPH_BASE).href
    let parsed
    try { parsed = parse({ text, graph: graphName }) }
    catch (e) { console.error(`⚠️  Failed to parse ${graphName}:`, e.message); continue }
    Object.assign(context, parsed.context)
    quads.push(...parsed.quads)
    if (parsed.primarySubject) getEntity(parsed.primarySubject).primary = parsed.primary
    for (const { subject: { value: s }, predicate: { value: p }, object: { value: o, termType } } of parsed.quads) {
      const e = getEntity(s)
      if (p === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') (types[o] ??= new Set()).add(s)
      if (termType === 'Literal') (e.literals[p] ??= []).push(o)
      else { (e.out[p] ??= []).push(o); (getEntity(o).in[p] ??= []).push(s) }
    }
  }
  return { quads, types, entities, context, short: iri => shortenIRI(iri, context) }
}

// The graph is always cached in memory and only rebuilt after a write,
// a pull, or a webhook — not on every GET. That's a deliberate change
// from a "rebuild every request in dev" strategy: it's simpler to reason
// about and doesn't punish anyone for running with NODE_ENV unset.
const state = { graph: null }
async function getGraph() { if (!state.graph) state.graph = await buildGraph(); return state.graph }
async function rebuildGraph() { state.graph = await buildGraph() }

// ─── Static files ───────────────────────────────────────────────────────

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.html': 'text/html; charset=utf-8'
}

async function serveStatic(pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '')
  const filePath = path.join(STATIC_DIR, rel)
  if (!filePath.startsWith(STATIC_DIR)) return new Response('Forbidden', { status: 403 })
  try {
    const data = await readFile(filePath)
    const type = CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream'
    return new Response(data, { headers: { 'Content-Type': type } })
  } catch { return null }
}

// ─── Views ──────────────────────────────────────────────────────────────

async function viewIndex() {
  const g = await getGraph()
  return page('Knowledge Graph', html`<div class="container">
    <h1>Knowledge Graph Overview</h1>
    <p><a href="/git/" class="btn btn-primary">↻ Sync Repository</a></p>
    <p>Total Quads: <span>${g.quads.length}</span> | Total Entities: <span>${g.entities.size}</span></p>
    <h2>Types</h2><ul>${Object.entries(g.types).map(([t, set]) => html`<li><a href="/entity/?iri=${encodeURIComponent(t)}">${g.short(t)} (${set.size})</a></li>`)}</ul>
    <h2>Entities</h2><ul>${[...g.entities.values()].map(e => entityLink(e, g))}</ul>
  </div>`)
}

async function viewEntity(iri) {
  const g = await getGraph()
  const e = iri && g.entities.get(iri)
  if (!e) return null
  const p = e.primary || {}
  return page(p.label || e.id, html`<main class="container">
    <p><a href="/" class="btn">← Overview</a></p>
    <h1>${p.label || e.id}</h1><p><code>${e.id}</code></p>
    ${p.comment ? html`<p>${p.comment}</p>` : ''}
    <h2>Literal properties</h2>${properties(e.literals, g)}
    <h2>Outgoing links</h2><ul>${Object.entries(e.out).map(([k, v]) => html`<li><strong>${g.short(k)}</strong>: <ul>${v.map(x => link(x, g))}</ul></li>`)}</ul>
    <h2>Incoming links</h2><ul>${Object.entries(e.in).map(([k, v]) => html`<li><strong>${g.short(k)}</strong>: <ul>${v.map(x => link(x, g))}</ul></li>`)}</ul>
  </main>`)
}

const viewWrite = () => page('Contribute', html`<div class="container">
  <h1>Interactive Graph State</h1>
  <p>Append MD-LD quads to your personal node. Changes are staged for admin review.</p>
  <form method="POST" action="/submit" class="form-stack">
    <input type="text" name="writerName" placeholder="Your name (e.g. alice)" required class="input" />
    ${WRITER_KEY ? html`<input type="text" name="key" placeholder="Writer key" required class="input" />` : ''}
    <textarea name="content" rows="4" required class="textarea" placeholder="[alice] &lt;tag:alice@example.com,2026;&gt;&#10;[Alice] {=alice:me .prov:Person label}"></textarea>
    <button type="submit" class="btn btn-primary">Submit to graph</button>
  </form>
</div>`)

async function viewGitDashboard() {
  await ensureRemote()
  let log = [], branch = 'unknown', modified = 0, staged = [], statusMsg = lastSyncMessage
  try {
    log = (await git(['log', '-5', '--pretty=format:%h|%s|%an|%ar'])).split('\n').filter(Boolean)
    branch = await git(['branch', '--show-current'])
    modified = (await git(['status', '--porcelain'])).split('\n').filter(Boolean).length
    staged = (await git(['diff', '--cached', '--name-only'])).split('\n').filter(Boolean)
  } catch { statusMsg = '⚠️ Git repository not found.' }

  return page('Git Sync', html`<div class="container">
    <p><a href="/" class="btn">← Knowledge Graph</a></p>
    <h1>Repository Sync</h1>
    <p><strong>Status:</strong></p><pre class="status-box">${statusMsg}</pre>
    <form method="POST" action="/git/pull" class="form-inline">
      <button type="submit" class="btn btn-primary">↻ Pull & Rebuild Graph</button>
    </form>
    <h2>Current State</h2><p>Branch: <code>${branch}</code> | Modified/Untracked: <strong>${modified}</strong></p>
    ${staged.length > 0 ? html`
      <h2>Staged Changes (review before commit)</h2>
      <ul>${staged.map(f => html`<li><a href="/git/review/${encodeURIComponent(f)}">${f}</a></li>`)}</ul>
      <form method="POST" action="/git/commit" class="form-inline">
        <input type="text" name="message" placeholder="Commit message" required class="input" />
        <button type="submit" class="btn btn-success">Commit & Push</button>
      </form>` : ''}
    <h2>Add New Content</h2>
    <form method="POST" action="/git/new" class="form-stack">
      <input type="text" name="filename" placeholder="entity-name.md" required class="input" />
      <textarea name="content" rows="5" placeholder="Markdown content..." required class="textarea"></textarea>
      <button type="submit" class="btn btn-warning">Save & Stage</button>
    </form>
    <h2>Recent History</h2>
    <ul>${log.map(l => { const [h, s, a, d] = l.split('|'); return html`<li><strong>${h}</strong> ${s} <em>by ${a} (${d})</em></li>` })}</ul>
  </div>`)
}

async function viewGitReview(file) {
  let diff = ''
  try { diff = (await git(['diff', '--cached', '--', file])) || '(no textual diff — binary or empty file)' }
  catch (e) { diff = e.message }
  return page('Review', html`<div class="container">
    <p><a href="/git/" class="btn">← Back</a></p>
    <h1>Review: ${file}</h1>
    <pre class="status-box">${diff}</pre>
  </div>`)
}

// ─── Route handlers ─────────────────────────────────────────────────────

const html2response = safe => new Response(safe.value, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })

async function handleSubmit(request, ip) {
  const resolvedIp = clientIp(request, ip)
  if (rateLimited(`submit:${resolvedIp}`, 10, 60_000)) return new Response('Too many submissions — slow down.', { status: 429 })
  if (!trustedOrigin(request)) return new Response('Rejected: cross-origin request.', { status: 403 })

  // Best-effort pre-check against the declared Content-Length, before
  // formData() buffers the whole body into memory. This is cheap and
  // covers the realistic case (an honest client, or a naive flood), but
  // it isn't a hard guarantee: a client that lies about Content-Length
  // and streams more than it declared would still be buffered in full by
  // formData() below. A true streaming cap would mean reading the body
  // manually instead of using the Fetch API's form parser.
  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > MAX_REQUEST_BYTES) return new Response('Submission too large.', { status: 413 })

  const form = await request.formData().catch(() => null)
  if (!form) return new Response('Invalid form submission.', { status: 400 })

  const writerName = String(form.get('writerName') || 'anon')
  const content = String(form.get('content') || '').trim()
  const key = form.get('key')

  if (WRITER_KEY && !timingSafeEqualStr(String(key ?? ''), WRITER_KEY)) return new Response('Invalid writer key.', { status: 403 })
  if (!content) return new Response('Empty submission.', { status: 400 })
  if (Buffer.byteLength(content, 'utf8') > MAX_SUBMIT_BYTES) return new Response('Submission too large.', { status: 413 })

  // Validate before staging: mdld-parse is deliberately lenient — it
  // degrades unrecognized syntax to zero quads rather than throwing — so
  // a malformed submission has never produced an error here, only
  // silence. Without this, that silence surfaced later and invisibly,
  // inside buildGraph(), as a file that just contributed nothing to the
  // graph. Parsing here and reporting the quad count back to the
  // submitter turns "the server is broken" into "you wrote zero
  // recognizable triples, here's what you wrote." The try/catch is a
  // safety net for inputs that do throw (non-string content, pathological
  // input) rather than the primary signal. Note this parses the
  // submitted fragment in isolation, so the count may differ slightly
  // from the eventual merge — prefixes declared earlier in the same
  // writer file aren't visible to this standalone check.
  let parsed
  try { parsed = parse({ text: content }) }
  catch (e) { return new Response(`Invalid MD-LD syntax: ${e.message}`, { status: 400 }) }

  const safeName = (path.basename(writerName, '.md').replace(/[^a-z0-9\-_]/gi, '-') || 'anon') + '.md'
  const dir = path.join(CONTENT_DIR, 'writers')
  const filePath = path.join(dir, safeName)

  await withGitLock(async () => {
    await mkdir(dir, { recursive: true })
    await writeFile(filePath, `\n${content}\n`, { flag: 'a' })
    await git(['add', path.relative(REPO_DIR, filePath).replace(/\\/g, '/')])
  })
  await rebuildGraph()

  return html2response(page('Success', html`<div class="container">
    <h1>✅ Recorded</h1>
    <p>Parsed ${parsed.quads.length} quad${parsed.quads.length === 1 ? '' : 's'} from your submission. Appended and staged for admin review.</p>
    <p><a href="/" class="btn">← Back to graph</a> | <a href="/write" class="btn">Add more</a></p>
  </div>`))
}

async function handleWebhook(request) {
  const bodyText = await request.text()
  if (WEBHOOK_SECRET) {
    const sig = request.headers.get('x-hub-signature-256')
    if (!sig) return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 401 })
    const digest = 'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(bodyText).digest('hex')
    try { if (!timingSafeEqualStr(sig, digest)) return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 }) }
    catch { return new Response(JSON.stringify({ error: 'Invalid signature format' }), { status: 401 }) }
  }
  syncPull()
    .then(r => console.log(`✅ [webhook] sync: ${r}`))
    .catch(e => console.error('❌ [webhook] sync failed:', e.message || e))
  return new Response(JSON.stringify({ status: 'accepted' }), { status: 202, headers: { 'Content-Type': 'application/json' } })
}

async function handleGitDashboard(request) {
  if (!checkBasicAuth(request)) return unauthorized()
  return html2response(await viewGitDashboard())
}

async function handleGitPull(request) {
  if (!checkBasicAuth(request)) return unauthorized()
  if (!trustedOrigin(request)) return new Response('Rejected: cross-origin request.', { status: 403 })
  await syncPull()
  return Response.redirect(new URL('/git/', request.url), 303)
}

async function handleGitReview(request, pathname) {
  if (!checkBasicAuth(request)) return unauthorized()
  const file = decodeURIComponent(pathname.slice('/git/review/'.length))
  return html2response(await viewGitReview(file))
}

async function handleGitNew(request) {
  if (!checkBasicAuth(request)) return unauthorized()
  if (!trustedOrigin(request)) return new Response('Rejected: cross-origin request.', { status: 403 })
  const form = await request.formData().catch(() => null)
  if (!form) return new Response('Invalid form.', { status: 400 })
  const filename = sanitizeFilename(form.get('filename'))
  const content = String(form.get('content') || '')
  await withGitLock(async () => {
    const filePath = path.join(CONTENT_DIR, filename)
    await writeFile(filePath, content)
    await git(['add', path.relative(REPO_DIR, filePath).replace(/\\/g, '/')])
  })
  return Response.redirect(new URL('/git/', request.url), 303)
}

async function handleGitCommit(request) {
  if (!checkBasicAuth(request)) return unauthorized()
  if (!trustedOrigin(request)) return new Response('Rejected: cross-origin request.', { status: 403 })
  const form = await request.formData().catch(() => null)
  if (!form) return new Response('Invalid form.', { status: 400 })
  const message = String(form.get('message') || 'Update content via UI')
  let errorMsg = ''
  await withGitLock(async () => {
    const staged = await git(['diff', '--cached', '--name-only'])
    if (!staged.trim()) { errorMsg = 'No changes staged.'; return }
    try {
      await git(['commit', '-m', message])
      const branch = await git(['branch', '--show-current'])
      await git(['pull', '--no-rebase', '--no-edit'])
      await git(['push', 'origin', branch])
      await rebuildGraph()
    } catch (e) { errorMsg = e.stderr || e.message }
  })
  if (errorMsg) {
    return html2response(page('Commit Failed', html`<div class="container"><h1>Commit Failed</h1><pre class="status-box">${errorMsg}</pre><p><a href="/git/" class="btn">← Back</a></p></div>`))
  }
  return Response.redirect(new URL('/git/', request.url), 303)
}

// ─── Router ─────────────────────────────────────────────────────────────

async function route(request, ip) {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method

  if (method === 'GET' && pathname === '/health') return new Response('ok')
  if (method === 'GET' && pathname === '/') return html2response(await viewIndex())

  if (method === 'GET' && pathname === '/full') {
    const g = await getGraph()
    return new Response(generate({ quads: g.quads, context: g.context }).text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
  }

  if (method === 'GET' && pathname === '/entity/') {
    const view = await viewEntity(url.searchParams.get('iri'))
    return view ? html2response(view) : new Response('Entity not found', { status: 404 })
  }

  if (method === 'GET' && pathname === '/write') return html2response(viewWrite())
  if (method === 'POST' && pathname === '/submit') return handleSubmit(request, ip)
  if (method === 'POST' && pathname === '/webhook') return handleWebhook(request)

  if (method === 'GET' && pathname === '/git/') return handleGitDashboard(request)
  if (method === 'GET' && pathname.startsWith('/git/review/')) return handleGitReview(request, pathname)
  if (method === 'POST' && pathname === '/git/pull') return handleGitPull(request)
  if (method === 'POST' && pathname === '/git/new') return handleGitNew(request)
  if (method === 'POST' && pathname === '/git/commit') return handleGitCommit(request)

  const staticResponse = await serveStatic(pathname)
  if (staticResponse) return staticResponse

  return new Response('Not found', { status: 404 })
}

// ─── Fetch <-> node:http adapter ────────────────────────────────────────
// The only piece a framework would normally give you for free. It's ~15
// lines because Node's http module still hands you IncomingMessage /
// ServerResponse rather than Request / Response.

async function toWebRequest(req) {
  const url = `http://${req.headers.host}${req.url}`
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Readable.toWeb(req),
    duplex: 'half'
  })
}

async function sendWebResponse(res, response) {
  res.writeHead(response.status, Object.fromEntries(response.headers))
  if (!response.body) return res.end()
  Readable.fromWeb(response.body).pipe(res)
}

// ─── Boot ───────────────────────────────────────────────────────────────

await mkdir(CONTENT_DIR, { recursive: true })
await ensureGitRepo()
await getGraph()

createServer(async (req, res) => {
  try {
    const request = await toWebRequest(req)
    const response = withSecurityHeaders(await route(request, req.socket.remoteAddress))
    await sendWebResponse(res, response)
  } catch (e) {
    console.error('❌ Unhandled error:', e)
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal server error')
  }
}).listen(PORT, () => console.log(`✅ mdld-server listening on :${PORT}`))
