
## `src/fetch.js`

Here's the production version — `src/fetch.js`, shipped as `mdld-parse/fetch`. Design notes are inline; the cache adapters, wiring, and rationale follow.

## Cache adapters (`docs/cache-adapters.md` or `examples/`)

These stay out of the module on purpose — each is environment-specific, and importing `node:fs` in the shared entry would break browser bundling. The interface is three methods.

**IndexedDB (browser, persistent, large budgets):**

```js
// cache-adapters/idb.js
export function idbCache({ name = "mdld-cache", store = "docs", version = 1 } = {}) {
  let dbPromise;
  const open = () => (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(store))
        req.result.createObjectStore(store, { keyPath: "url" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
  const run = (mode, action) => open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
  return {
    async get(url) { return (await run("readonly", (s) => s.get(url))) ?? null; },
    async set(url, entry) { await run("readwrite", (s) => s.put({ url, ...entry })); },
    async delete(url) { await run("readwrite", (s) => s.delete(url)); },
  };
}
```

**localStorage (browser, synchronous, ~5 MB budget → eviction matters):**

```js
// cache-adapters/localstorage.js
export function localStorageCache({ prefix = "mdld:", maxEntries = 100 } = {}) {
  const ls = globalThis.localStorage;
  const key = (url) => prefix + url;
  const keys = () => {
    const out = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k?.startsWith(prefix)) out.push(k);
    }
    return out;
  };
  return {
    async get(url) {
      const raw = ls.getItem(key(url));
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { ls.removeItem(key(url)); return null; }
    },
    async set(url, entry) {
      try { ls.setItem(key(url), JSON.stringify(entry)); } catch { return; } // quota
      const all = keys();
      if (all.length <= maxEntries) return;
      const oldest = all
        .map((k) => { try { return { k, t: JSON.parse(ls.getItem(k)).timestamp || 0 }; } catch { return { k, t: 0 }; } })
        .sort((a, b) => a.t - b.t);
      for (const { k } of oldest.slice(0, all.length - maxEntries)) ls.removeItem(k);
    },
    async delete(url) { ls.removeItem(key(url)); },
  };
}
```

**JSON file (Node — offline cache for scripts, agents, CI):**

```js
// cache-adapters/json-file.js
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export function jsonFileCache(filePath, { flushEveryMs = 1000 } = {}) {
  let data = null;
  let timer = null;
  const load = async () => {
    if (data) return data;
    try { data = JSON.parse(await readFile(filePath, "utf8")); } catch { data = {}; }
    return data;
  };
  const flush = async () => {
    clearTimeout(timer); timer = null;
    if (!data) return;
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data));
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, flushEveryMs);
    timer.unref?.(); // don't hold the process open
  };
  return {
    async get(url) { return (await load())[url] ?? null; },
    async set(url, entry) { (await load())[url] = { ...entry, timestamp: Date.now() }; schedule(); },
    async delete(url) { delete (await load())[url]; schedule(); },
    flush, // call at shutdown for immediate persistence
  };
}
```

## Wiring

```jsonc
// package.json
"exports": {
  ".": "./dist/index.js",
  "./fetch": "./dist/fetch.js"
}
```

```js
// vite.config.lib.js — Rollup auto-splits shared code into a common chunk
build: {
  lib: {
    entry: { index: resolve(__dirname, "src/index.js"), fetch: resolve(__dirname, "src/fetch.js") },
    formats: ["es"],
  },
},
```

## Usage

```js
// Browser / edge worker — persistent cache, never leave the docs site
import { fetchMDLD } from "mdld-parse/fetch";
import { idbCache } from "./cache-adapters/idb.js";

const graph = await fetchMDLD("/docs/index.md", {
  cache: idbCache(),
  sameOrigin: true,
  signal: AbortSignal.timeout(15_000),
});
for (const r of graph.results) renderInto(r.quads);

// Node — offline crawl with JSON cache
const { quads, errors, aborted } = await fetchMDLD("https://example.com/notes/index.md", {
  cache: jsonFileCache(".mdld-cache.json"),
  maxDepth: 3,
  maxPages: 50,
});
```

## What changed vs. your draft, and why

- **Batch splice → event-driven pump.** Batches stalled the whole frontier behind the slowest member; the pump always keeps `concurrency` requests in flight.
- **Cache is injected, memory-LRU default, failures never fatal.** Fixes Node/Deno/Workers, enables testing without `fake-indexeddb`, and a Safari-private-mode `indexedDB.open()` rejection now degrades to "no cache" instead of killing the crawl.
- **Single cache authority.** `cache: 'no-store'` + manual validators — no drift between HTTP cache and the adapter.
- **HTML is genuinely first-class now.** `text/html` responses go through `deconstruct()` before `parse()`, links come from `<a href>` (comment/quote/entity aware) — your fetcher can finally traverse a rendered MD-LD site, which is v1.0.8's whole pitch.
- **Link extraction is CommonMark-best-effort.** Fences, code spans (matched-run semantics), HTML comments, reference definitions, autolinks, titles, balanced parens, backslash escapes — all char-scanned, no regex in hot paths. This kills the phantom-crawl problem where `](` inside a code example was followed.
- **Determinism.** Results come back in BFS discovery order (iterating the queue), not completion order — matching the spec's determinism promise.
- **Bounded and cancel-safe.** `maxPages` (untrusted docs could balloon the crawl), `sameOrigin`, http(s)-only allow-list, `AbortSignal` → partial results with `aborted: true` instead of a thrown mess.
- **Redirect-aware provenance.** `res.url` names the graph, so `/#frag` subjects resolve against where the document actually lives.
- **`304` = zero re-parse**, stale-if-error on 5xx/network, plain-object headers (no `Headers` dependency), and the visited check-and-add happens in one synchronous section so concurrent workers can't double-enqueue.

Two honest limitations to document: extraction skips fenced/inline code and comments but not 4-space-indented code blocks or raw HTML blocks (other than comments), so a link-shaped string inside those will be followed; and the default `accept` heuristic (extension or extensionless) is overridable for anything unusual. Both are documented in the header so nobody's surprised.

One thing I'd still flag for a follow-up: a tiny `merge-graph` convenience (or a `{ merge: true }` option wired to `merge.js`) — `flatMap` over `results` works today, but "give me one graph" is the first thing every consumer will want.