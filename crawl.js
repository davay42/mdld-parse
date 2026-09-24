//#region src/crawl.js
/**
* crawl — a platform-agnostic linked-text-document crawler.
*
* Fetches raw text starting from one URL, follows markdown `[label](url)`
* and HTML `<a href="url">` links (both valid in CommonMark inline HTML, so
* both extractors run on every document), and returns pages in deterministic
* BFS discovery order.
*
* ZERO dependencies and ZERO internal imports: this module is fully
* self-contained and can be published standalone or vendored verbatim.
* Nothing here knows about MD-LD — the consumer decides how to interpret
* the text (see "Consuming with mdld-parse" below).
*
* ── Cache ────────────────────────────────────────────────────────────────
* Inject any adapter implementing:
*   get(url)    → Promise<{text, contentType, finalUrl, etag, lastModified, timestamp} | null>
*   set(url, e) → Promise<void>
*   delete?(url)→ Promise<void>
* Cache failures are swallowed: a broken cache degrades to "no cache",
* never to a failed crawl. Default: in-process LRU (`memoryCache`).
* Conditional requests reuse stored ETag/Last-Modified. fetch runs with
* `cache: 'no-store'` so this module's cache is the single authority.
*
* ── Guarantees ───────────────────────────────────────────────────────────
* - Deterministic: pages return in BFS discovery order, never completion order.
* - Partial-result-safe: HTTP/network failures land in `errors`; the crawl
*   continues. 5xx/network failure with a cached copy → stale-if-error.
* - Cancellable: pass `signal`; resolves with `aborted: true` plus partial results.
* - Bounded: `maxDepth`, `maxPages` (default 100), optional `sameOrigin`,
*   http(s)-only protocol allow-list, binary content-types rejected.
*
* @example
* // Generic use: crawl a docs site, get text + edges
* const { pages, errors, aborted } = await crawl("/docs/index.md", { sameOrigin: true });
* for (const p of pages) console.log(p.url, "→", p.links.length, "outgoing links");
*/
var HTTP_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:"]);
var ACCEPT = "text/markdown, text/x-mdld, text/plain;q=0.9, text/html;q=0.8, application/xhtml+xml;q=0.8, */*;q=0.5";
var DEFAULT_MAX_DEPTH = 5;
var DEFAULT_CONCURRENCY = 5;
var DEFAULT_MAX_PAGES = 100;
var DEFAULT_ACCEPT_RE = /\.(md|mdld|markdown|html?|xhtml)$/i;
var BINARY_CT = /image\/|audio\/|video\/|font\/|application\/(octet-stream|zip|gzip|pdf|wasm|protobuf)/i;
/**
* In-process LRU cache. O(1) get/set, recency refreshed on read.
* @param {number} [maxEntries=500]
*/
function memoryCache(maxEntries = 500) {
	const map = /* @__PURE__ */ new Map();
	return {
		async get(url) {
			const entry = map.get(url);
			if (entry === void 0) return null;
			map.delete(url);
			map.set(url, entry);
			return entry;
		},
		async set(url, entry) {
			if (map.has(url)) map.delete(url);
			map.set(url, entry);
			if (map.size > maxEntries) map.delete(map.keys().next().value);
		},
		async delete(url) {
			map.delete(url);
		}
	};
}
/** Resolve + validate. Absolute http(s) URL without fragment, or null. */
function normalizeUrl(raw, base) {
	if (raw == null) return null;
	const s = String(raw).trim();
	if (!s) return null;
	try {
		const url = new URL(s, base || void 0);
		if (!HTTP_PROTOCOLS.has(url.protocol)) return null;
		url.hash = "";
		return url.href;
	} catch {
		return null;
	}
}
/** Default target filter: docs extensions + extensionless clean URLs. */
function defaultAccept(url) {
	let file = url.slice(url.lastIndexOf("/") + 1);
	const q = file.indexOf("?");
	if (q !== -1) file = file.slice(0, q);
	if (!file.includes(".")) return true;
	return DEFAULT_ACCEPT_RE.test(file);
}
/** Cheap hint for consumers (they decide how to interpret the text). */
function looksLikeHTML(contentType, text) {
	if (contentType) {
		const ct = contentType.toLowerCase();
		if (ct.includes("html")) return true;
		if (/(markdown|mdld|json|javascript|css)/.test(ct)) return false;
	}
	const head = text.slice(0, 256).trimStart().slice(0, 32).toLowerCase();
	return head.startsWith("<!doctype html") || head.startsWith("<html");
}
/**
* Extract all http(s) links from a text document (markdown + HTML syntaxes).
* Character-scanned: fence-aware, code-span-aware, comment-aware, and
* `<script>`/`<style>`-skipping. Handles inline links, images, autolinks,
* reference definitions, titles, balanced parens, backslash escapes,
* HTML entities in hrefs.
*
* @param {string} text
* @param {string} [base] Base URL for relative resolution.
* @returns {string[]} Absolute http(s) URLs (fragments stripped), deduped, discovery order.
*/
function extractLinks(text, base) {
	const out = /* @__PURE__ */ new Set();
	extractMarkdownLinks(text, base, out);
	extractHTMLLinks(text, base, out);
	return [...out];
}
function extractMarkdownLinks(text, base, out) {
	let fenceChar = 0;
	let fenceLen = 0;
	let lineStart = 0;
	for (let i = 0; i <= text.length; i++) {
		if (i < text.length && text.charCodeAt(i) !== 10) continue;
		let line = text.slice(lineStart, i);
		lineStart = i + 1;
		if (line.endsWith("\r")) line = line.slice(0, -1);
		const trimmed = line.trimStart();
		const indent = line.length - trimmed.length;
		const c0 = trimmed.charCodeAt(0);
		if (fenceLen > 0) {
			if (c0 === fenceChar) {
				let n = 0;
				while (trimmed.charCodeAt(n) === fenceChar) n++;
				if (n >= fenceLen && trimmed.slice(n).trim() === "") fenceLen = 0;
			}
			continue;
		}
		if (indent <= 3 && (c0 === 96 || c0 === 126)) {
			let n = 0;
			while (trimmed.charCodeAt(n) === c0) n++;
			if (n >= 3) {
				fenceChar = c0;
				fenceLen = n;
				continue;
			}
		}
		if (indent <= 3 && c0 === 91 && extractRefDefinition(trimmed, base, out)) continue;
		scanInlineLinks(line, base, out);
	}
}
/** `[label]: url "title"` — CommonMark reference definition. */
function extractRefDefinition(line, base, out) {
	let close = -1;
	let depth = 0;
	for (let i = 1; i < line.length; i++) {
		const c = line.charCodeAt(i);
		if (c === 92) i++;
		else if (c === 91) depth++;
		else if (c === 93) {
			if (depth === 0) {
				close = i;
				break;
			}
			depth--;
		}
	}
	if (close === -1 || line.charCodeAt(close + 1) !== 58) return false;
	let j = close + 2;
	while (line[j] === " " || line[j] === "	") j++;
	let raw;
	if (line[j] === "<") {
		const gt = line.indexOf(">", j + 1);
		if (gt === -1) return true;
		raw = line.slice(j + 1, gt);
	} else {
		let k = j;
		while (k < line.length && line[k] !== " " && line[k] !== "	") k++;
		raw = line.slice(j, k);
	}
	addLink(raw, base, out);
	return true;
}
function scanInlineLinks(line, base, out) {
	let i = 0;
	while (i < line.length) {
		const c = line.charCodeAt(i);
		if (c === 92) {
			i += 2;
			continue;
		}
		if (c === 96) {
			let n = 1;
			while (line.charCodeAt(i + n) === 96) n++;
			const close = findBacktickRun(line, i + n, n);
			i = close === -1 ? i + n : close;
			continue;
		}
		if (c === 60) {
			if (line.startsWith("<!--", i)) {
				const end = line.indexOf("-->", i + 4);
				if (end === -1) return;
				i = end + 3;
				continue;
			}
			const gt = line.indexOf(">", i + 1);
			if (gt !== -1 && isAutolink(line, i + 1, gt)) {
				addLink(line.slice(i + 1, gt), base, out);
				i = gt + 1;
				continue;
			}
			i++;
			continue;
		}
		if (c === 93 && line.charCodeAt(i + 1) === 40) {
			const m = findLinkEnd(line, i + 2);
			if (m) {
				addLink(line.slice(m.urlStart, m.urlEnd), base, out);
				i = m.end + 1;
				continue;
			}
		}
		i++;
	}
}
function findBacktickRun(line, from, n) {
	let i = from;
	while (i < line.length) if (line.charCodeAt(i) === 96) {
		let m = 1;
		while (line.charCodeAt(i + m) === 96) m++;
		if (m === n) return i + m;
		i += m;
	} else i++;
	return -1;
}
/** scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ) ":" */
function isAutolink(line, s, e) {
	if (e - s < 2) return false;
	let c = line.charCodeAt(s);
	if (!(c >= 65 && c <= 90 || c >= 97 && c <= 122)) return false;
	for (let i = s + 1; i < e; i++) {
		c = line.charCodeAt(i);
		if (c === 58) return true;
		if (!(c >= 65 && c <= 90 || c >= 97 && c <= 122 || c >= 48 && c <= 57 || c === 43 || c === 45 || c === 46)) return false;
	}
	return false;
}
/** CommonMark inline destination: `<url>`, bare url, optional title. */
function findLinkEnd(line, start) {
	if (line[start] === "<") {
		const gt = line.indexOf(">", start + 1);
		if (gt === -1) return null;
		const end = findTitle(line, gt + 1);
		return end === -1 ? null : {
			urlStart: start + 1,
			urlEnd: gt,
			end
		};
	}
	let depth = 0;
	let i = start;
	while (i < line.length) {
		const c = line[i];
		if (c === "\\") {
			i += 2;
			continue;
		}
		if (c === "(") depth++;
		else if (c === ")") {
			if (depth === 0) return {
				urlStart: start,
				urlEnd: i,
				end: i
			};
			depth--;
		} else if (c === " " || c === "	") {
			const end = findTitle(line, i);
			if (end === -1) return null;
			return {
				urlStart: start,
				urlEnd: i,
				end
			};
		}
		i++;
	}
	return null;
}
function findTitle(line, from) {
	let i = from;
	while (line[i] === " " || line[i] === "	") i++;
	const open = line[i];
	if (open !== "\"" && open !== "'" && open !== "(") return -1;
	const close = open === "(" ? ")" : open;
	const end = line.indexOf(close, i + 1);
	if (end === -1) return -1;
	let j = end + 1;
	while (line[j] === " " || line[j] === "	") j++;
	return line[j] === ")" ? j : -1;
}
function extractHTMLLinks(text, base, out) {
	let i = 0;
	while (i < text.length) {
		const lt = text.indexOf("<", i);
		if (lt === -1) break;
		i = lt;
		if (text.startsWith("<!--", i)) {
			const end = text.indexOf("-->", i + 4);
			if (end === -1) return;
			i = end + 3;
			continue;
		}
		const t1 = text[i + 1];
		if (t1 === "s" || t1 === "S") {
			const name = rawTagName(text, i);
			if (name) {
				i = skipRawElement(text, i, name);
				continue;
			}
		}
		if ((t1 === "a" || t1 === "A") && isNameBoundary(text[i + 2])) {
			const tagEnd = scanTagEnd(text, i);
			if (tagEnd === -1) return;
			const href = readAttr(text.slice(i, tagEnd + 1), "href");
			if (href) addLink(href, base, out);
			i = tagEnd + 1;
			continue;
		}
		i = lt + 1;
	}
}
/** Returns "script"|"style" if text[i..] opens one (case-insensitive), else null. */
function rawTagName(text, i) {
	if (!(text[i + 1] === "s" || text[i + 1] === "S" ? text[i + 1] : null)) return null;
	const rest4 = text.slice(i + 2, i + 7).toLowerCase();
	if (rest4.startsWith("cript")) {
		const after = text[i + 7];
		if (isNameBoundary(after) || after === void 0) return "script";
	}
	if (rest4.startsWith("tyle")) {
		const after = text[i + 6];
		if (isNameBoundary(after) || after === void 0) return "style";
	}
	return null;
}
function skipRawElement(text, start, name) {
	let i = start + 1;
	while (i < text.length) {
		const c = text.indexOf("</", i);
		if (c === -1) return text.length;
		if (text.slice(c + 2, c + 2 + name.length).toLowerCase() === name) {
			const after = text[c + 2 + name.length];
			if (isNameBoundary(after) || after === void 0) {
				const gt = text.indexOf(">", c);
				return gt === -1 ? text.length : gt + 1;
			}
		}
		i = c + 2;
	}
	return text.length;
}
function isNameBoundary(c) {
	return c === void 0 || c === ">" || c === "/" || c === " " || c === "	" || c === "\n" || c === "\r" || c === "\f";
}
function scanTagEnd(text, start) {
	let quote = 0;
	for (let j = start + 1; j < text.length; j++) {
		const c = text[j];
		if (quote) {
			if (c === quote) quote = 0;
		} else if (c === "\"" || c === "'") quote = c;
		else if (c === ">") return j;
	}
	return -1;
}
function isWs(c) {
	return c === " " || c === "	" || c === "\n" || c === "\r" || c === "\f";
}
/** Read an attribute value from a tag substring (case-insensitive name, entities decoded). */
function readAttr(tag, name) {
	let i = 0;
	while (i < tag.length) {
		const eq = tag.indexOf("=", i);
		if (eq === -1) return null;
		let e2 = eq - 1;
		while (e2 >= 0 && isWs(tag[e2])) e2--;
		let s = e2;
		while (s >= 0 && !isWs(tag[s])) s--;
		let v = eq + 1;
		while (isWs(tag[v])) v++;
		let value, next;
		const q = tag[v];
		if (q === "\"" || q === "'") {
			const end = tag.indexOf(q, v + 1);
			if (end === -1) return null;
			value = tag.slice(v + 1, end);
			next = end + 1;
		} else {
			let e = v;
			while (e < tag.length && !isWs(tag[e]) && tag[e] !== ">") e++;
			value = tag.slice(v, e);
			next = e;
		}
		if (tag.slice(s + 1, e2 + 1).toLowerCase() === name) return decodeEntities(value);
		i = next;
	}
	return null;
}
function decodeEntities(s) {
	if (!s.includes("&")) return s;
	return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, body) => {
		if (body[0] === "#") {
			const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : m;
		}
		switch (body) {
			case "amp": return "&";
			case "lt": return "<";
			case "gt": return ">";
			case "quot": return "\"";
			case "apos": return "'";
			default: return m;
		}
	});
}
function addLink(raw, base, out) {
	const url = normalizeUrl(raw, base);
	if (url) out.add(url);
}
/**
* Crawl a graph of linked text documents.
*
* @param {string} startUrl Absolute URL, or relative path resolved against `baseHref`.
* @param {Object} [options]
* @param {number} [options.maxDepth=5]        Maximum link distance from the start document.
* @param {number} [options.concurrency=5]     Max in-flight fetches.
* @param {number} [options.maxPages=100]      Hard cap on total documents considered.
* @param {boolean} [options.sameOrigin=false] Only follow links on the start document's origin.
* @param {Function} [options.fetchFn]         Defaults to `globalThis.fetch`.
* @param {string} [options.baseHref]          Base for relative URLs. Defaults to
*                                             `location.href` when available.
* @param {Object} [options.cache]             Cache adapter. Default: `memoryCache()`.
* @param {(url: string) => boolean} [options.accept] Target filter (sync).
* @param {(page: CrawlPage) => (void|Promise<void>)} [options.onPage]
*                                             Called per page as it completes —
*                                             parse incrementally instead of waiting
*                                             for the whole crawl.
* @param {AbortSignal} [options.signal]       Cancels the crawl; partial results returned.
* @returns {Promise<CrawlResult>}
*/
async function crawl(startUrl, options = {}) {
	const maxDepth = Math.max(0, options.maxDepth ?? DEFAULT_MAX_DEPTH) | 0;
	const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY) | 0;
	const maxPages = Math.max(1, options.maxPages ?? DEFAULT_MAX_PAGES) | 0;
	const sameOrigin = options.sameOrigin ?? false;
	const fetchFn = options.fetchFn ?? globalThis.fetch;
	const baseHref = options.baseHref ?? globalThis.location?.href;
	const cache = options.cache ?? memoryCache();
	const accept = options.accept ?? defaultAccept;
	const signal = options.signal ?? null;
	if (typeof fetchFn !== "function") throw new TypeError("crawl: no fetch implementation available — pass options.fetchFn");
	const start = normalizeUrl(startUrl, baseHref);
	if (!start) throw new TypeError(`crawl: cannot resolve "${startUrl}" to an absolute http(s) URL (baseHref: ${baseHref ?? "none"})`);
	if (signal?.aborted) return {
		urls: [],
		pages: [],
		errors: [],
		aborted: true
	};
	const startOrigin = new URL(start).origin;
	const store = {
		get: async (url) => {
			try {
				return await cache.get(url) ?? null;
			} catch {
				return null;
			}
		},
		set: async (url, entry) => {
			try {
				await cache.set(url, entry);
			} catch {}
		}
	};
	const queue = [{
		url: start,
		depth: 0
	}];
	const visited = /* @__PURE__ */ new Set([start]);
	const pages = /* @__PURE__ */ new Map();
	const errors = [];
	let cursor = 0;
	let aborted = false;
	const isAllowed = (url) => (!sameOrigin || new URL(url).origin === startOrigin) && accept(url);
	async function process(job) {
		if (signal?.aborted) {
			aborted = true;
			return;
		}
		const { url, depth } = job;
		const entry = await store.get(url);
		const headers = { Accept: ACCEPT };
		if (entry?.etag) headers["If-None-Match"] = entry.etag;
		if (entry?.lastModified) headers["If-Modified-Since"] = entry.lastModified;
		let text, contentType, finalUrl = url, status = null, stale = false;
		try {
			const res = await fetchFn(url, {
				headers,
				signal: signal || void 0,
				redirect: "follow",
				cache: "no-store"
			});
			status = res.status;
			finalUrl = normalizeUrl(res.url, url) || url;
			if (res.status === 304 && entry) {
				text = entry.text;
				contentType = entry.contentType || "";
				finalUrl = entry.finalUrl || finalUrl;
				await store.set(url, entry);
			} else if (res.ok) {
				contentType = res.headers.get("content-type") || "";
				if (BINARY_CT.test(contentType)) {
					try {
						await res.body?.cancel();
					} catch {}
					errors.push({
						url,
						kind: "binary",
						status,
						message: `unsupported content-type: ${contentType}`
					});
					return;
				}
				text = await res.text();
				await store.set(url, {
					text,
					contentType,
					finalUrl,
					etag: res.headers.get("etag"),
					lastModified: res.headers.get("last-modified"),
					timestamp: Date.now()
				});
			} else if (res.status >= 500 && entry) {
				text = entry.text;
				contentType = entry.contentType || "";
				finalUrl = entry.finalUrl || finalUrl;
				stale = true;
			} else {
				errors.push({
					url,
					kind: "http",
					status: res.status,
					message: `HTTP ${res.status} for ${url}`
				});
				return;
			}
		} catch (err) {
			if (signal?.aborted || err?.name === "AbortError") {
				aborted = true;
				return;
			}
			if (entry) {
				text = entry.text;
				contentType = entry.contentType || "";
				finalUrl = entry.finalUrl || url;
				stale = true;
			} else {
				errors.push({
					url,
					kind: "network",
					message: String(err?.message || err)
				});
				return;
			}
		}
		const links = /* @__PURE__ */ new Set();
		extractMarkdownLinks(text, finalUrl, links);
		extractHTMLLinks(text, finalUrl, links);
		const page = {
			url,
			finalUrl,
			depth,
			status,
			contentType,
			kind: looksLikeHTML(contentType, text) ? "html" : "text",
			stale,
			text,
			links: [...links]
		};
		pages.set(url, page);
		if (depth < maxDepth) for (const link of links) {
			if (visited.size >= maxPages) return;
			if (visited.has(link) || !isAllowed(link)) continue;
			visited.add(link);
			queue.push({
				url: link,
				depth: depth + 1
			});
		}
		try {
			await options.onPage?.(page);
		} catch (err) {
			errors.push({
				url,
				kind: "callback",
				message: String(err?.message || err)
			});
		}
	}
	const inflight = /* @__PURE__ */ new Set();
	for (;;) {
		while (cursor < queue.length && inflight.size < concurrency && !aborted) {
			const job = queue[cursor++];
			const p = process(job).catch((err) => {
				errors.push({
					url: job.url,
					kind: "internal",
					message: String(err?.message || err)
				});
			}).finally(() => {
				inflight.delete(p);
			});
			inflight.add(p);
		}
		if (inflight.size === 0) break;
		await Promise.race(inflight);
	}
	const ordered = [];
	for (const { url } of queue) {
		const page = pages.get(url);
		if (page) ordered.push(page);
	}
	return {
		urls: ordered.map((p) => p.url),
		pages: ordered,
		errors,
		aborted
	};
}
/**
* @typedef {Object} CrawlPage
* @property {string} url          Requested URL (cache key).
* @property {string} finalUrl     URL after redirects — use as the document's identity.
* @property {number} depth        Link distance from the start document.
* @property {number|null} status  HTTP status (304 served from cache keeps original text).
* @property {string} contentType  Response Content-Type.
* @property {"html"|"text"} kind  Cheap sniff hint — interpretation is the consumer's job.
* @property {boolean} stale       True if served from cache due to 5xx/network failure.
* @property {string} text         Raw response body.
* @property {string[]} links      Absolute http(s) outgoing links, deduped, in discovery order.
*/
/**
* @typedef {Object} CrawlResult
* @property {string[]} urls                    Pages in BFS discovery order.
* @property {CrawlPage[]} pages
* @property {Array<{url: string, kind: "http"|"network"|"binary"|"callback"|"internal",
*   status?: number, message: string}>} errors
* @property {boolean} aborted
*/
//#endregion
export { crawl, extractLinks, memoryCache };
