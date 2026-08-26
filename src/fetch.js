// Paste this directly into the browser console, or save as an ESM module.
// It dynamically imports mdld-parse from a CDN for instant zero-setup usage.
import { parse } from './parse.js';
import { merge } from './merge.js';

// ==========================================
// 1. Vanilla IndexedDB Helper (Promise-based)
// ==========================================
const DB_NAME = 'MDLD_CACHE';
const STORE_NAME = 'docs';
let dbConnection = null;

async function getDB() {
  if (dbConnection) return dbConnection;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: 'url' });
      }
    };
    req.onsuccess = () => { dbConnection = req.result; resolve(dbConnection); };
    req.onerror = () => reject(req.error);
  });
}

async function getCached(db, url) {
  return new Promise((resolve) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(url);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null); // Fail silently to fallback to network
  });
}

async function setCached(db, url, data) {
  return new Promise((resolve) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put({ url, ...data });
    req.onsuccess = () => resolve();
    req.onerror = () => console.warn('[MD-LD] IndexedDB write failed');
  });
}

// ==========================================
// 2. Zero-Regex String Link Extractor
// ==========================================
function extractLinks(text, baseUrl) {
  const links = new Set();
  let pos = 0;

  while ((pos = text.indexOf('](', pos)) !== -1) {
    const start = pos + 2;
    const end = text.indexOf(')', start);
    if (end === -1) break;

    let raw = text.substring(start, end).trim();

    // Strip optional title: [text](url "title") or [text](url 'title')
    const spaceIdx = raw.indexOf(' ');
    if (spaceIdx > 0) {
      const potentialTitle = raw.substring(spaceIdx).trim();
      if ((potentialTitle.startsWith('"') && potentialTitle.endsWith('"')) ||
        (potentialTitle.startsWith("'") && potentialTitle.endsWith("'"))) {
        raw = raw.substring(0, spaceIdx).trim();
      }
    }

    // Strip angle brackets if present: <http://...>
    if (raw.startsWith('<') && raw.endsWith('>')) {
      raw = raw.slice(1, -1);
    }

    try {
      // Resolves both absolute URLs and relative paths against the current document's URL
      const resolved = new URL(raw, baseUrl).href.split('#')[0];
      if (resolved.endsWith('.md') || resolved.endsWith('.mdld')) {
        links.add(resolved);
      }
    } catch {
      // Ignore invalid URLs (mailto:, javascript:, etc.)
    }

    pos = end + 1;
  }

  return Array.from(links);
}

// ==========================================
// 3. Core Recursive Fetch & Merge Function
// ==========================================
async function fetchAndMergeMDLD(startUrl, options = {}) {
  const {
    maxDepth = 5,
    concurrency = 5,
    fetchFn = globalThis.fetch,
    baseHref = globalThis.location.href
  } = options;

  // Normalize input: accepts both absolute URLs and relative paths (e.g., './index.md')
  const startAbsolute = new URL(startUrl, baseHref).href.split('#')[0];

  const visited = new Set([startAbsolute]);
  const parseResults = [];
  const queue = [{ url: startAbsolute, depth: 0 }];

  const db = await getDB();

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const nextLinks = [];

    await Promise.all(batch.map(async ({ url, depth }) => {
      const cached = await getCached(db, url);
      const headers = new Headers();

      if (cached?.lastModified) headers.set('If-Modified-Since', cached.lastModified);
      if (cached?.etag) headers.set('If-None-Match', cached.etag);

      try {
        const res = await fetchFn(url, { headers, cache: 'no-cache' });
        let text;

        if (res.status === 304 && cached) {
          // 🚀 Instant reload: Server confirms no changes
          text = cached.text;
        } else if (res.ok) {
          // 📥 Fresh fetch: Update IndexedDB
          text = await res.text();
          await setCached(db, url, {
            text,
            lastModified: res.headers.get('Last-Modified'),
            etag: res.headers.get('ETag'),
            timestamp: Date.now()
          });
        } else {
          console.warn(`[MD-LD] ${res.status} for ${url}`);
          return;
        }

        // CRITICAL: baseIRI ensures relative subjects (e.g., { #my-node }) resolve to this document's URL
        parseResults.push(parse({ text, baseIRI: url }));

        // Queue newly discovered links
        if (depth < maxDepth) {
          for (const link of extractLinks(text, url)) {
            if (!visited.has(link)) {
              visited.add(link);
              nextLinks.push({ url: link, depth: depth + 1 });
            }
          }
        }
      } catch (err) {
        console.error(`[MD-LD] Fetch failed: ${url}`, err);
      }
    }));

    queue.push(...nextLinks);
  }

  return merge(parseResults);
}
