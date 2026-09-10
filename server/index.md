# mdld-server.js

**A knowledge-graph server in one file. One dependency: `mdld-parse`.**

```bash
ADMIN_USER=admin ADMIN_PASS=admin node mdld-server.js
```

No framework. No database. No build step. `git clone`, set two environment
variables, `node mdld-server.js` — you have a git-backed RDF knowledge graph
with a browsable UI, a multi-writer contribution form, and an admin review
queue, running on the platform alone.

---

## Why this exists

MD-LD's whole premise is that a knowledge graph shouldn't need an
intermediary between the person writing and the graph being built — no
platform, no hidden database, no proprietary UI standing between text and
triples. `mdld-server.js` applies that same premise one layer down, to the
server itself.

Every other "minimal" server template still asks you to trust a router
library, a body-parser, an HTML-escaping helper, and a static-file
middleware — each one a small dependency, individually reasonable, that
collectively mean you're not actually reading all the code that handles
your requests. This file is an argument that you don't need any of them
anymore. Since Node 18, `fetch`, `Request`, `Response`, `Headers`, and
`FormData` are stable, standards-track globals — the same primitives every
browser, Deno, Bun, and Cloudflare Worker already share. The only genuine
gap is that `node:http` still hands you a raw `IncomingMessage` instead of
a `Request`, and closing that gap is about twenty lines, not a dependency.

So the dependency tree for the whole server is:

```
mdld-server.js
└── mdld-parse   (the one thing that actually needs to exist: the MD-LD ↔ RDF contract)
```

Everything else — routing, HTML templating with escaping, form parsing,
static files, basic auth, rate limiting, CSRF protection, git as a
transaction log — is either a Node built-in, a Fetch API standard, or
under twenty lines of code you can read in one sitting.

## The core idea

**The content directory is the database. Git is the transaction log.**

```
content/*.md  ──parse()──>  RDF quads  ──in-memory index──>  entities Map
     ↑                                                            │
     │                                                            ▼
   git commit / pull / webhook                              GET / entity/ / full
     ↑                                                            │
   POST /git/new, /git/commit, /submit  <──────────────────────────
```

There is no ORM, no migration, no schema sync to keep consistent with a
separate store. `buildGraph()` reads every `.md` file under `content/`,
runs it through `mdld-parse`'s `parse()`, and folds the resulting quads
into an in-memory `Map` of entities. That map is a disposable cache — if
you deleted it right now, the next request would rebuild it identically
from the files on disk. The graph is rebuilt after any write, pull, or
webhook — not on every GET — so reads stay cheap and the source of truth
never has two places it could disagree with itself.

Git gives you, for free, everything a "real" database would otherwise
need custom code for: an audit log (`git log`), atomic multi-file commits,
distributed replication (`git push`/`pull`), conflict detection, and a
recovery mechanism (`git stash`) for the one dangerous moment — pulling
remote changes while local edits are staged — that `syncPull()` handles by
stashing, pulling, and popping, restoring local state safely if anything
goes wrong.

## Request handling without a framework

`node:http`'s `createServer` still gives you `IncomingMessage` /
`ServerResponse`, not `Request` / `Response`. The adapter that bridges them
is the only piece of "framework" in the file:

```js
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
```

From there, every route handler is a plain `async (request) => Response`
function — the same shape a Cloudflare Worker or a Deno server uses. A
dozen routes don't need a router library; a `pathname`/`method` switch in
`route()` is the entire routing table and it's trivially greppable.

Form parsing is the pleasant surprise: a native `Request`'s
`.formData()` handles both `application/x-www-form-urlencoded` and
`multipart/form-data` correctly, so there's no hand-rolled multipart
parser anywhere in this file.

## HTML templating, in fifteen lines

```js
class Safe { constructor(s) { this.value = s } }
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
function html(strings, ...values) {
  let out = strings[0]
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v == null || v === false) { }
    else if (v instanceof Safe) out += v.value
    else if (Array.isArray(v)) out += v.map(x => x instanceof Safe ? x.value : esc(x)).join('')
    else out += esc(v)
    out += strings[i + 1]
  }
  return raw(out)
}
```

Every interpolated value is HTML-escaped by default. Nested `html\`...\``
calls compose without double-escaping, because a tagged template's own
output is wrapped in `Safe` and recognized on the way back in — the same
behavior you'd get from a templating library, without one.

## Security model

This is the part that matters most if you're forking this as a starting
point, so it's deliberately explicit rather than implicit:

| Concern | Mechanism |
|---|---|
| Admin routes (`/git/*`) | HTTP Basic Auth. **The server refuses to boot** if `ADMIN_USER`/`ADMIN_PASS` aren't set, unless you explicitly opt out with `DISABLE_AUTH=1` for local development. No default credentials, ever. |
| Credential and key comparison | `crypto.timingSafeEqual`, not `===` — resistant to timing attacks. Used for Basic Auth, the webhook signature, and the writer key. |
| CSRF on state-changing POSTs | `trustedOrigin()` — see below; this is not a simple "reject anything without a matching Origin" check, on purpose. |
| Public write spam (`/submit`) | In-memory per-IP rate limiting (10/min by default, swept every 5 minutes so the bucket map doesn't grow unbounded), a pre-check against `Content-Length` before the body is buffered, and an 8KB body cap enforced again on the parsed field. Optional shared `WRITER_KEY` to close the endpoint entirely. |
| Submission validity | Every `/submit` is parsed with `mdld-parse` before it's staged, and the response reports the real quad count. `mdld-parse` is deliberately lenient — unrecognized syntax degrades to zero quads rather than throwing — so this is the difference between a submitter finding out immediately ("Parsed 0 quads") and the content silently vanishing later when `buildGraph()` skips it. |
| Webhook authenticity | HMAC-SHA256 signature check against `WEBHOOK_SECRET`, compared with `timingSafeEqual`, mirroring GitHub's `X-Hub-Signature-256` convention. |
| Path traversal | `sanitizeFilename()` runs every user-supplied filename through `path.basename()` before joining it to `content/`, and static file serving verifies the resolved path still starts with the static root. |
| Response headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and a `default-src 'self'` `Content-Security-Policy` are applied to every response. |
| Reviewing multi-writer submissions | `/git/review/:file` shows the actual `git diff --cached` for any staged file before an admin commits — trusting file *content*, not just file *names*. |
| State-changing GETs | None. `/git/?pull=1` used to trigger a sync from a bare `<a href>` GET; it's now `POST /git/pull`, so a link, a prefetcher, or a crawler can't accidentally sync your repo. |

### The Origin check, and why it isn't "reject anything without a matching Origin"

The obvious CSRF mitigation — require `Origin` to match `Host` on every
mutating POST — is wrong for this server, because it optimizes for the
wrong attacker. There's no session or cookie state here, so the actual
threat is narrow: a browser holding a user's *ambient* credentials (cached
Basic Auth) making a request on a malicious page's behalf. A plain HTTP
client — curl, a script, an LLM agent posting to `/submit` as "text-native
agent memory" — sends no `Origin` at all and isn't carrying anyone's
browser session, so it isn't CSRF-capable in the first place. Rejecting
it anyway blocks exactly the audience this project is for while stopping
nothing.

`trustedOrigin()` therefore:

1. Lets a request through immediately if it has **neither** `Origin` nor
   `Sec-Fetch-Site` — that's not a browser.
2. If `Sec-Fetch-Site` is present, trusts it over everything else: only
   `same-origin` or `none` pass. Unlike `Origin`/`Host`, page script can't
   set this header, so it isn't spoofable the way a DNS-rebinding attack
   can align `Origin` and `Host`.
3. Otherwise falls back to comparing `Origin` against `Host`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default `3000`) | Port to listen on. |
| `ADMIN_USER`, `ADMIN_PASS` | yes, unless `DISABLE_AUTH=1` | Credentials for `/git/*`. |
| `DISABLE_AUTH` | no | Set to `1` to skip auth entirely — **local development only.** |
| `WRITER_KEY` | no | If set, required as a form field on `/submit`. If unset, the write form is open to anyone (rate-limited). |
| `WEBHOOK_SECRET` | no | If set, `/webhook` requires a valid `X-Hub-Signature-256` HMAC. |
| `GIT_REMOTE_URL` | no | Enables self-healing git init and `git pull`/`push` in the admin UI. Without it, the server runs against a local-only repo. |
| `GRAPH_BASE_URI` | no (default `file://<repo path>/`) | Base IRI each content file's named graph is resolved against. RDF requires graph names to be absolute IRIs, so every file becomes `<GRAPH_BASE_URI><relative path>` — set this to a public URL if you want the graph-per-file provenance to reflect where the content is actually published, rather than a local filesystem path. |
| `TRUST_PROXY` | no | Set to `1` to rate-limit by `X-Forwarded-For` instead of the raw socket address. Only enable this behind a proxy you control that sets the header itself — it's otherwise a client-spoofable input, and without it every request behind a reverse proxy shares one rate-limit bucket. |

## Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/` | GET | — | Graph overview: types, entities. |
| `/entity/?iri=` | GET | — | One entity's literals and links, in and out. |
| `/full` | GET | — | The entire graph, regenerated as MD-LD text. |
| `/health` | GET | — | Liveness check. |
| `/write` | GET | — | Public contribution form. |
| `/submit` | POST | rate-limited, optional key | Append MD-LD content to a per-writer file, staged (not committed). |
| `/webhook` | POST | HMAC signature | Trigger a `git pull` + graph rebuild, e.g. from a GitHub push webhook. |
| `/git/` | GET | Basic Auth | Admin dashboard: staged files, recent history, last sync result. Read-only — does not itself sync. |
| `/git/pull` | POST | Basic Auth + same-origin | Pull, rebuild the graph, and redirect back to the dashboard. |
| `/git/review/:file` | GET | Basic Auth | Diff of one staged file. |
| `/git/new` | POST | Basic Auth + same-origin | Create and stage a new content file. |
| `/git/commit` | POST | Basic Auth + same-origin | Commit staged changes and push. |

## Deploying it

There's nothing here that needs a process manager or orchestration layer
to run correctly, but you'll want one to keep it running:

```ini
# /etc/systemd/system/mdld-server.service
[Unit]
Description=mdld-server
After=network.target

[Service]
WorkingDirectory=/srv/mdld-server
ExecStart=/usr/bin/node mdld-server.js
Restart=on-failure
Environment=PORT=3000
Environment=ADMIN_USER=admin
Environment=ADMIN_PASS=change-me
Environment=GIT_REMOTE_URL=git@github.com:you/your-graph.git
Environment=WEBHOOK_SECRET=change-me-too

[Install]
WantedBy=multi-user.target
```

Put a reverse proxy (nginx, Caddy) in front for TLS; the server itself
speaks plain HTTP and expects to be behind one. Point your git host's
webhook at `POST /webhook` with the same `WEBHOOK_SECRET`, and every push
to the tracked branch rebuilds the live graph within a request round-trip.

## Extending it

The file is organized into clearly commented sections — Config, HTML
templating, Security, Git, Graph, Static files, Views, Route handlers,
Router, Fetch adapter, Boot — in that order, top to bottom, so a new route
means adding one `if` branch to `route()` and one handler function near
the others. When (not if) this outgrows one file, the section boundaries
are already the module boundaries: `lib/git.js`, `lib/graph.js`,
`lib/security.js`, `views.js`, `routes/*.js`. Nothing about this design
resists being split later — it just doesn't need to be split yet.

What deliberately isn't here, because it's a decision your fork should
make rather than one this template should make for you: a query language
beyond "all quads for an entity" (SPARQL, if you need it, is a library
away — the quads are already RDF/JS-compatible), incremental graph
rebuilds (fine up to a few thousand files; revisit if you outgrow that),
and multi-admin identity (right now there's one shared credential pair,
not per-writer accounts).

## Testing it

`server-tests.js` is a black-box suite: it boots real `node mdld-server.js`
processes against real, throwaway git repos and exercises them over plain
HTTP, using the same `fetch()` the server itself is built on. No mocking —
if a route regresses, the test hits the actual route.

```bash
node --test server-tests.js
```

It covers the properties that actually matter for this file specifically,
not generic coverage: the server refuses to boot without credentials; the
Origin/`Sec-Fetch-Site` check lets non-browser clients through while
rejecting a cross-site browser request; a bad `/submit` reports its real
(zero) quad count instead of failing silently; the writer key and rate
limiter behave under repeated and wrong-credential requests; and
`/git/pull` requires a POST where `?pull=1` on a GET used to be enough.

## The proof this is meant to be

Zero dependencies beyond the one that does semantic work. Every remaining
line is either a Node.js built-in or a Fetch API standard that will still
be there in five years, unchanged, regardless of which framework is
fashionable by then. If MD-LD's claim is that a markdown file is enough of
a contract to carry a knowledge graph, this file is the same claim made
about the server around it: the platform was already enough.
