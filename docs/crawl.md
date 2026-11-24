# Crawl — client-side knowledge acquisition

`demo/crawl.js` is a **client concern**, deliberately outside the library core.
The core (`mdld-parse`) operates on knowledge it is given — parse, generate,
evaluate, extract, render. Crawling answers a different question: *how do we
acquire knowledge?* It is transport, not meaning.

## API

```js
import { crawl, memoryCache } from './demo/crawl.js'

const result = await crawl(startUrl, {
  maxDepth: 3,        // link-following depth
  maxPages: 50,       // hard page cap
  sameOrigin: true,   // stay on the start origin
  concurrency: 4,     // parallel fetches
  signal,             // AbortSignal for cancellation
  fetchFn,            // injectable fetch (tests, non-browser)
  cache,              // memoryCache() or custom {get,set}
})
// → { urls, pages: [{url, text}], errors, aborted }
```

## Design notes worth keeping

- **Zero dependencies, zero internal imports** — fully self-contained; safe to
  lift into any client app unchanged
- **BFS queue with visited set** — `maxDepth`/`maxPages` bound the crawl;
  dedup by normalized absolute URL
- **ETag / Last-Modified revalidation** — cached entries send conditional
  headers; 304s reuse stored text
- **Soft-fail cache** — a broken cache degrades to "no cache", never to
  failure; same for per-page fetch errors (collected in `errors[]`)
- **`AbortSignal` throughout** — queue processing checks `signal.aborted`
  per job; callers can cancel mid-crawl
- **Accept-based filtering** — `accept(url)` predicate decides which links
  are followed; `sameOrigin` restricts to the start origin

## Usage in the playground

`index.html` imports it for the crawl dialog — paste a URL, the client
fetches linked MD-LD pages and concatenates them into the editor. The library
itself never touches the network.
