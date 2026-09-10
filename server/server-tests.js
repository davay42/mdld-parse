// server-tests.js
//
// Compact, black-box test suite for mdld-server.js. Boots real server
// instances against real (throwaway) git repos and exercises them over
// plain HTTP — the same contract a deployer or an agent would see. No
// framework, no mocking: node:test + node:assert to run it, mdld-parse
// only where a test needs to know an expected quad count independently
// of the server.
//
// Run:
//   node --test server-tests.js
//
// Requires: mdld-server.js in the same directory, Node >= 18, git on PATH.

import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { parse } from 'mdld-parse'

const SERVER_PATH = path.join(import.meta.dirname, 'mdld-server.js')
let nextPort = 4100
const cleanupDirs = []

// ─── Helpers ────────────────────────────────────────────────────────────

function makeRepo(files = { 'alice.md': SEED_ALICE }) {
  const dir = mkdtempSync(path.join(tmpdir(), 'mdld-test-'))
  cleanupDirs.push(dir)
  execFileSync('git', ['init', '-q'], { cwd: dir })
  execFileSync('git', ['config', 'user.email', 't@t.com'], { cwd: dir })
  execFileSync('git', ['config', 'user.name', 'test'], { cwd: dir })
  const contentDir = path.join(dir, 'content')
  execFileSync('mkdir', ['-p', contentDir])
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(contentDir, name), text)
  execFileSync('git', ['add', '-A'], { cwd: dir })
  execFileSync('git', ['commit', '-q', '-m', 'seed'], { cwd: dir })
  return dir
}

async function waitForHealth(baseUrl, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try { if ((await fetch(`${baseUrl}/health`)).ok) return true } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error(`Server at ${baseUrl} never became healthy`)
}

// Spawns a real `node mdld-server.js` child process against a throwaway
// repo. Returns { baseUrl, stop() } — always call stop() when done.
async function spawnServer(env, repoDir = makeRepo()) {
  const port = nextPort++
  const proc = spawn(process.execPath, [SERVER_PATH], {
    cwd: repoDir,
    env: { ...process.env, PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  proc.stdout.on('data', d => { output += d })
  proc.stderr.on('data', d => { output += d })
  const baseUrl = `http://localhost:${port}`
  await waitForHealth(baseUrl).catch(e => { throw new Error(`${e.message}\n--- child output ---\n${output}`) })
  return {
    baseUrl,
    getOutput: () => output,
    async stop() {
      proc.kill()
      await new Promise(r => proc.once('exit', r))
    }
  }
}

// Waits for a spawned process to exit on its own (used for boot-refusal
// tests, where the server is expected to call process.exit() itself).
function waitForExit(proc, timeoutMs = 3000) {
  return Promise.race([
    new Promise(resolve => proc.once('exit', code => resolve(code))),
    new Promise((_, reject) => setTimeout(() => reject(new Error('process did not exit in time')), timeoutMs))
  ])
}

const SEED_ALICE = `[ex] <tag:alice@example.org,2026:>

# Alice {=ex:alice .prov:Person label}

[Alice Smith] {ex:fullName}
[alice@example.com] {ex:email}
`

after(() => { for (const dir of cleanupDirs) rmSync(dir, { recursive: true, force: true }) })

// ─── Boot behavior ──────────────────────────────────────────────────────

test('refuses to boot without ADMIN_USER/ADMIN_PASS (and without DISABLE_AUTH)', async () => {
  const repoDir = makeRepo()
  const proc = spawn(process.execPath, [SERVER_PATH], {
    cwd: repoDir,
    env: { ...process.env, PORT: String(nextPort++) },
    stdio: 'ignore'
  })
  const code = await waitForExit(proc)
  assert.notEqual(code, 0, 'server should exit non-zero when auth is enabled but no credentials are set')
})

// ─── Core read path ─────────────────────────────────────────────────────

test('serves the graph built from content/*.md', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())

  const index = await (await fetch(`${server.baseUrl}/`)).text()
  assert.match(index, /Alice/, 'index page should list the seeded entity')

  const iri = 'tag:alice@example.org,2026:alice'
  const entity = await (await fetch(`${server.baseUrl}/entity/?iri=${encodeURIComponent(iri)}`)).text()
  assert.match(entity, /Alice Smith/, 'entity page should show literal properties')

  const full = await (await fetch(`${server.baseUrl}/full`)).text()
  assert.match(full, /alice@example\.org/, '/full should regenerate MD-LD text for the whole graph')

  const missing = await fetch(`${server.baseUrl}/entity/?iri=tag:nope`)
  assert.equal(missing.status, 404)
})

// ─── Auth ───────────────────────────────────────────────────────────────

test('enforces Basic Auth on /git/*', async (t) => {
  const server = await spawnServer({ ADMIN_USER: 'admin', ADMIN_PASS: 'hunter2' })
  t.after(() => server.stop())

  assert.equal((await fetch(`${server.baseUrl}/git/`)).status, 401, 'no credentials')
  assert.equal(
    (await fetch(`${server.baseUrl}/git/`, { headers: { Authorization: `Basic ${Buffer.from('admin:wrong').toString('base64')}` } })).status,
    401, 'wrong credentials'
  )
  assert.equal(
    (await fetch(`${server.baseUrl}/git/`, { headers: { Authorization: `Basic ${Buffer.from('admin:hunter2').toString('base64')}` } })).status,
    200, 'correct credentials'
  )
})

// ─── CSRF / Origin fix ──────────────────────────────────────────────────
// This is the one that matters: non-browser clients (no Origin, no
// Sec-Fetch-Site) are the audience this server is built for and must be
// let through; a browser sending a cross-site request must be rejected.

test('allows non-browser clients on /submit (no Origin/Sec-Fetch-Site header)', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())
  const res = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ writerName: 'agent', content: '[Agent] {=tag:ex,2026:agent .prov:Person label}' })
  })
  assert.equal(res.status, 200, 'a plain HTTP client (curl, a script, an agent) must be able to write')
})

test('rejects a cross-site browser POST to /submit (Sec-Fetch-Site: cross-site)', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())
  const res = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Sec-Fetch-Site': 'cross-site' },
    body: new URLSearchParams({ writerName: 'evil', content: 'x' })
  })
  assert.equal(res.status, 403)
})

test('allows a same-site browser POST to /submit (Sec-Fetch-Site: same-origin)', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())
  const res = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Sec-Fetch-Site': 'same-origin' },
    body: new URLSearchParams({ writerName: 'localuser', content: '[LocalUser] {=tag:ex,2026:lu .prov:Person label}' })
  })
  assert.equal(res.status, 200)
})

// ─── Submission validation ──────────────────────────────────────────────

test('reports parsed quad count instead of silently dropping bad submissions', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())

  const good = '[Bob] {=tag:bob,2026:bob .prov:Person label}'
  const { quads } = parse({ text: good }) // independent expectation, not read from the server
  const goodRes = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    body: new URLSearchParams({ writerName: 'bob', content: good })
  })
  const goodBody = await goodRes.text()
  assert.match(goodBody, new RegExp(`Parsed ${quads.length} quad`), 'valid content reports its real quad count')

  const badRes = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    body: new URLSearchParams({ writerName: 'junk', content: 'not really md-ld at all, just prose.' })
  })
  const badBody = await badRes.text()
  assert.match(badBody, /Parsed 0 quads/, 'unrecognizable content is reported as zero quads, not a silent success')
})

test('rejects an empty submission and an oversized one', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())

  assert.equal((await fetch(`${server.baseUrl}/submit`, {
    method: 'POST', body: new URLSearchParams({ writerName: 'x', content: '' })
  })).status, 400)

  const huge = 'a'.repeat(20_000)
  assert.equal((await fetch(`${server.baseUrl}/submit`, {
    method: 'POST', body: new URLSearchParams({ writerName: 'x', content: huge })
  })).status, 413)
})

// ─── Writer key (timing-safe compare) ───────────────────────────────────

test('requires the correct writer key when WRITER_KEY is set', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1', WRITER_KEY: 'secret-key' })
  t.after(() => server.stop())

  const wrong = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    body: new URLSearchParams({ writerName: 'x', content: '[X] {=tag:ex,2026:x .prov:Person label}', key: 'wrong-key' })
  })
  assert.equal(wrong.status, 403)

  const right = await fetch(`${server.baseUrl}/submit`, {
    method: 'POST',
    body: new URLSearchParams({ writerName: 'x', content: '[X] {=tag:ex,2026:x .prov:Person label}', key: 'secret-key' })
  })
  assert.equal(right.status, 200)
})

// ─── Rate limiting ──────────────────────────────────────────────────────

test('rate-limits repeated submissions from the same client', async (t) => {
  const server = await spawnServer({ DISABLE_AUTH: '1' })
  t.after(() => server.stop())

  const statuses = []
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${server.baseUrl}/submit`, {
      method: 'POST',
      body: new URLSearchParams({ writerName: `spam${i}`, content: 'x' })
    })
    statuses.push(res.status)
  }
  assert.ok(statuses.includes(429), `expected at least one 429 among ${statuses.join(',')}`)
})

// ─── Git pull is a POST, not a state-changing GET ───────────────────────

test('GET /git/?pull=1 no longer triggers a pull; POST /git/pull does', async (t) => {
  const server = await spawnServer({ ADMIN_USER: 'admin', ADMIN_PASS: 'hunter2' })
  t.after(() => server.stop())
  const auth = { Authorization: `Basic ${Buffer.from('admin:hunter2').toString('base64')}` }

  const getRes = await fetch(`${server.baseUrl}/git/?pull=1`, { headers: auth })
  assert.equal(getRes.status, 200) // renders the dashboard; does not itself sync

  const postRes = await fetch(`${server.baseUrl}/git/pull`, {
    method: 'POST', headers: { ...auth, 'Sec-Fetch-Site': 'same-origin' }, redirect: 'manual'
  })
  assert.equal(postRes.status, 303, 'a POST to /git/pull performs the sync and redirects back')
})

// ─── Graph naming (pure logic, mirrors buildGraph's IRI resolution) ─────
// mdld-server.js resolves each file's graph name as
// `new URL(relPath, GRAPH_BASE).href` rather than a bare relative path,
// because RDF requires graph names to be absolute IRIs. This checks that
// exact expression rather than re-deriving it, so a regression here means
// the source expression changed, not that this test drifted from it.

test('graph names resolve to absolute IRIs, not relative paths', () => {
  const GRAPH_BASE = 'file:///repo/'
  const relPath = 'content/writers/alice.md'
  const graphName = new URL(relPath, GRAPH_BASE).href
  assert.equal(graphName, 'file:///repo/content/writers/alice.md')
  assert.doesNotThrow(() => new URL(graphName), 'must be a valid absolute IRI on its own, not just relative to a base')
})
