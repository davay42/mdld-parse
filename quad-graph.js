//#region \0@oxc-project+runtime@0.149.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
//#endregion
//#region src/graph.js
/**
* <quad-graph> — zero-dependency RDF quad graph renderer (ESM, Canvas2D, ~650 LOC).
*
*   import './quad-graph.js'
*   const element = document.createElement('quad-graph');
*   document.body.appendChild(element);
*   g.context = { ex: 'http://example.org/' }      // optional prefixes (CURIE labels)
*   g.quads   = [...rdfjsQuads]                    // RDF/JS quads; re-assign any time, updates instantly
*
* Attributes: height, charge (repulsion, default 40), link-dist (default 45), labels="off"
* Methods:    focus(iri) select(iri|null) fit() pin(iri,on) reheat() getNode(iri)
* Props:      quads, context, positions ({iri:[x,y]} get/set — persist & restore layouts)
* Events:     node-click (detail = iri) · node-select (iri|null) · node-hover (iri|null) · settled
* Input:      wheel/pinch zoom, drag background = pan, drag node = move, dblclick node = pin/unpin
* Theming:    labels use the CSS `color` of the element; background is transparent.
*
* Design: typed-array Barnes-Hut quadtree, time-sliced across frames (never blocks > ~8ms),
* degree-aware link lengths/strengths, BFS/phyllotaxis warm start, batched canvas paths with
* viewport culling, density-adaptive alpha, greedy collision-free label placement.
* Limits: < ~1M nodes, < 4096 distinct predicates (dedupe key).
*/
var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var LABEL_RANK = new Map([
	"http://www.w3.org/2000/01/rdf-schema#label",
	"http://www.w3.org/2004/02/skos/core#prefLabel",
	"http://schema.org/name",
	"https://schema.org/name",
	"http://xmlns.com/foaf/0.1/name",
	"http://purl.org/dc/terms/title",
	"http://purl.org/dc/elements/1.1/title"
].map((p, i) => [p, i]));
var MAX_LIT = 6;
var TAU = 6.2832;
var GOLD = 2.39996;
var MIN_D2 = 25;
var MAX_V = 60;
var Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
var hash = (s) => {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	h ^= h >>> 15;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	return h >>> 0;
};
var clamp = (v, a, b) => v < a ? a : v > b ? b : v;
/** Counting sort of indices 0..keys.length-1 by key → [offsets(K+1), list] */
var group = (keys, K) => {
	const off = new Int32Array(K + 1), list = new Int32Array(keys.length);
	for (let i = 0; i < keys.length; i++) off[keys[i] + 1]++;
	for (let i = 0; i < K; i++) off[i + 1] += off[i];
	const cur = off.slice(0, K);
	for (let i = 0; i < keys.length; i++) list[cur[keys[i]]++] = i;
	return [off, list];
};
var Layout = class {
	constructor() {
		this.n = 0;
		this.alpha = 0;
		this.target = 0;
		this.iter = 0;
		this.charge = 40;
		this.linkDist = 45;
		this.gravity = .03;
		this.x = this.y = /* @__PURE__ */ new Float64Array(0);
		this.ls = this.lt = /* @__PURE__ */ new Int32Array(0);
		this._ph = 0;
		this._cur = 0;
		this._cap = 0;
		this._stk = /* @__PURE__ */ new Int32Array(256);
	}
	get active() {
		return this.n > 0 && (this.alpha >= .001 || this.target > 0);
	}
	load(x, y, ls, lt, deg, r, mass, pin) {
		const n = x.length;
		Object.assign(this, {
			n,
			x,
			y,
			ls,
			lt,
			deg,
			r,
			mass,
			pin,
			vx: new Float64Array(n),
			vy: new Float64Array(n),
			alpha: 1,
			_ph: 0
		});
		this.decay = 1 - Math.pow(.001, 1 / (n > 5e4 ? 120 : n > 2e4 ? 180 : 300));
		this.theta = n > 5e4 ? 1.2 : n > 5e3 ? 1 : .85;
		this.relink();
	}
	/** Hubs get longer links (room for their leaves) and weaker springs (d3-style 1/min(deg)). */
	relink() {
		const { ls, lt, deg, linkDist } = this, m = ls.length;
		this.len = new Float32Array(m);
		this.str = new Float32Array(m);
		this.bias = new Float32Array(m);
		for (let e = 0; e < m; e++) {
			const a = deg[ls[e]], b = deg[lt[e]];
			this.len[e] = linkDist * (.7 + .4 * Math.log2(1 + Math.max(a, b)));
			this.str[e] = 1 / Math.min(a, b);
			this.bias[e] = a / (a + b);
		}
	}
	reheat(a = .6) {
		this.alpha = Math.max(this.alpha, a);
	}
	/** Run ticks until `ms` elapsed or `maxTicks` done. A tick may span several calls on huge graphs. */
	step(ms, maxTicks = 1) {
		const t0 = performance.now();
		let ticks = 0;
		while (this.active) {
			if (this._ph === 0) {
				this._build();
				this._cur = 0;
				this._ph = 1;
			}
			if (this._ph === 1) {
				if (!this._repel(t0 + ms)) return true;
				this._ph = 2;
			}
			this._integrate();
			this._ph = 0;
			if (++ticks >= maxTicks || performance.now() - t0 > ms) break;
		}
		return this.active;
	}
	_alloc(cap) {
		const grow = (A, n) => {
			const B = new A.constructor(n);
			B.set(A);
			return B;
		};
		if (!this.nm) Object.assign(this, {
			nm: new Float64Array(cap),
			nsx: new Float64Array(cap),
			nsy: new Float64Array(cap),
			nw: new Float64Array(cap),
			nb: new Int32Array(cap),
			ch: new Int32Array(cap * 4)
		});
		else {
			for (const k of [
				"nm",
				"nsx",
				"nsy",
				"nw"
			]) this[k] = grow(this[k], cap);
			this.nb = grow(this.nb, cap);
			this.ch = grow(this.ch, cap * 4);
		}
		this._cap = cap;
	}
	_new(w) {
		const c = this._cnt++;
		this.nm[c] = this.nsx[c] = this.nsy[c] = 0;
		this.nb[c] = -2;
		this.nw[c] = w;
		this.ch.fill(0, c * 4, c * 4 + 4);
		return c;
	}
	/** Rebuild Barnes-Hut quadtree. nb: -2 empty leaf, -1 internal, >=0 leaf body. */
	_build() {
		const { x, y, n } = this;
		let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
		for (let i = 0; i < n; i++) {
			const a = x[i], b = y[i];
			if (a < x0) x0 = a;
			if (a > x1) x1 = a;
			if (b < y0) y0 = b;
			if (b > y1) y1 = b;
		}
		const w = Math.max(x1 - x0, y1 - y0, 1) * 1.001;
		this._cx = (x0 + x1) / 2;
		this._cy = (y0 + y1) / 2;
		this._hw = w / 2;
		if (this._cap < 2 * n + 80) this._alloc(2 * n + 80);
		this._cnt = 0;
		this._new(w);
		for (let i = 0; i < n; i++) {
			if (this._cnt + 70 > this._cap) this._alloc(this._cap * 2);
			this._insert(i);
		}
	}
	_insert(i) {
		const { x, y, mass, nm, nsx, nsy, nb, ch } = this, px = x[i], py = y[i], m = mass[i];
		let nd = 0, cx = this._cx, cy = this._cy, hw = this._hw, depth = 0;
		for (;;) {
			nm[nd] += m;
			nsx[nd] += px * m;
			nsy[nd] += py * m;
			const b = nb[nd];
			if (b === -2) {
				nb[nd] = i;
				return;
			}
			if (b >= 0) {
				if (depth >= 28) return;
				nb[nd] = -1;
				const c = this._new(hw), q = (x[b] > cx ? 1 : 0) | (y[b] > cy ? 2 : 0);
				ch[nd * 4 + q] = c;
				nb[c] = b;
				nm[c] = mass[b];
				nsx[c] = x[b] * mass[b];
				nsy[c] = y[b] * mass[b];
			}
			const q = (px > cx ? 1 : 0) | (py > cy ? 2 : 0);
			hw *= .5;
			cx += q & 1 ? hw : -hw;
			cy += q & 2 ? hw : -hw;
			let c = ch[nd * 4 + q];
			if (!c) {
				c = this._new(hw * 2);
				ch[nd * 4 + q] = c;
			}
			nd = c;
			depth++;
		}
	}
	/** Many-body repulsion + node collision, chunked against a deadline. Returns true when all nodes done. */
	_repel(deadline) {
		const { x, y, vx, vy, r, n, nm, nsx, nsy, nw, nb, ch, _stk: stk } = this;
		const k = this.charge * this.alpha, th2 = this.theta * this.theta;
		for (let i = this._cur; i < n; i++) {
			if ((i & 63) === 63 && performance.now() > deadline) {
				this._cur = i;
				return false;
			}
			const xi = x[i], yi = y[i], ri = r[i];
			let fx = 0, fy = 0, sp = 0;
			stk[sp++] = 0;
			while (sp) {
				const nd = stk[--sp], m = nm[nd];
				if (m === 0) continue;
				const b = nb[nd];
				let dx = nsx[nd] / m - xi, dy = nsy[nd] / m - yi, d2 = dx * dx + dy * dy;
				if (b >= 0) {
					if (b === i) continue;
					if (d2 < 1e-6) {
						dx = Math.random() - .5;
						dy = Math.random() - .5;
						d2 = dx * dx + dy * dy + 1e-6;
					}
					const rr = ri + r[b] + 3;
					let w = k * m / Math.max(d2, MIN_D2);
					if (d2 < rr * rr) {
						const d = Math.sqrt(d2);
						w += (rr - d) / d * .35;
					}
					fx -= dx * w;
					fy -= dy * w;
				} else if (nw[nd] * nw[nd] < th2 * d2) {
					const w = k * m / Math.max(d2, MIN_D2);
					fx -= dx * w;
					fy -= dy * w;
				} else {
					const o = nd * 4;
					for (let q = 0; q < 4; q++) {
						const c = ch[o + q];
						if (c) stk[sp++] = c;
					}
				}
			}
			vx[i] += fx;
			vy[i] += fy;
		}
		return true;
	}
	_integrate() {
		const { x, y, vx, vy, ls, lt, len, str, bias, n, alpha, pin } = this;
		for (let e = 0; e < ls.length; e++) {
			const s = ls[e], t = lt[e];
			let dx = x[t] + vx[t] - x[s] - vx[s], dy = y[t] + vy[t] - y[s] - vy[s];
			const d = Math.sqrt(dx * dx + dy * dy) || 1e-6, l = (d - len[e]) / d * alpha * str[e], b = bias[e];
			dx *= l;
			dy *= l;
			vx[t] -= dx * b;
			vy[t] -= dy * b;
			vx[s] += dx * (1 - b);
			vy[s] += dy * (1 - b);
		}
		const g = this.gravity * alpha;
		for (let i = 0; i < n; i++) {
			if (pin[i]) {
				vx[i] = vy[i] = 0;
				continue;
			}
			vx[i] = (vx[i] - x[i] * g) * .6;
			vy[i] = (vy[i] - y[i] * g) * .6;
			const v2 = vx[i] * vx[i] + vy[i] * vy[i];
			if (v2 > 3600) {
				const s = MAX_V / Math.sqrt(v2);
				vx[i] *= s;
				vy[i] *= s;
			}
			if (v2 !== v2) {
				vx[i] = vy[i] = 0;
				x[i] = y[i] = 0;
			}
			x[i] += vx[i];
			y[i] += vy[i];
		}
		this.alpha += (this.target - this.alpha) * this.decay;
		this.iter++;
	}
};
/** Warm start: BFS outward from already-placed nodes; new components on a phyllotaxis spiral (biggest first). */
function seedLayout(n, ls, lt, off, adj, order, x, y, placed, L) {
	const q = new Int32Array(n), kids = new Int32Array(n);
	let h = 0, t = 0, comp = 0;
	for (let i = 0; i < n; i++) if (placed[i]) q[t++] = i;
	const bfs = () => {
		while (h < t) {
			const u = q[h++];
			for (let a = off[u]; a < off[u + 1]; a++) {
				const e = adj[a], v = ls[e] === u ? lt[e] : ls[e];
				if (placed[v]) continue;
				const k = kids[u]++, ang = k * GOLD + u, rad = L * (.8 + .3 * Math.sqrt(k));
				x[v] = x[u] + Math.cos(ang) * rad;
				y[v] = y[u] + Math.sin(ang) * rad;
				placed[v] = 1;
				q[t++] = v;
			}
		}
	};
	bfs();
	for (let j = 0; j < n; j++) {
		const i = order[j];
		if (placed[i]) continue;
		const a = comp * GOLD, r = L * 1.6 * Math.sqrt(++comp);
		x[i] = Math.cos(a) * r;
		y[i] = Math.sin(a) * r;
		placed[i] = 1;
		q[t++] = i;
		bfs();
	}
}
var CSS = `:host{display:block;position:relative;height:480px;overflow:hidden;color:#eee;touch-action:none;user-select:none;-webkit-user-select:none;background:#1a1a1a}
canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;background:#1a1a1a}
.hud{position:absolute;left:8px;top:6px;font:11px/1.2 system-ui,sans-serif;opacity:.6;pointer-events:none;display:flex;gap:8px;align-items:center;color:#ccc}
.bar{width:44px;height:3px;border-radius:2px;background:#444;overflow:hidden}.bar i{display:block;height:100%;width:0;background:#1D9E75}
.tip{position:absolute;left:0;top:0;pointer-events:none;max-width:320px;padding:6px 9px;border-radius:7px;font:12px/1.4 system-ui,sans-serif;background:#2a2a2a;color:#eee;border:1px solid #444;box-shadow:0 4px 16px #0003;display:none;z-index:2;overflow-wrap:anywhere}
.tip b{display:block}.tip small{display:block;opacity:.6}`;
var QuadGraph = class extends Base {
	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `<style>${CSS}</style><canvas></canvas><div class="hud"><span></span><div class="bar"><i></i></div></div><div class="tip"></div>`;
		this._cv = root.querySelector("canvas");
		this._g2 = this._cv.getContext("2d");
		this._stat = root.querySelector(".hud span");
		this._bar = root.querySelector(".bar i");
		this._tip = root.querySelector(".tip");
		this._quads = [];
		this._pfx = [];
		this._L = new Layout();
		this._ids = null;
		this._names = [];
		this._typ = /* @__PURE__ */ new Int32Array(0);
		this._classes = [null];
		this._lits = /* @__PURE__ */ new Map();
		this._lab = /* @__PURE__ */ new Map();
		this._lc = [];
		this._plc = [];
		this._v = {
			k: 1,
			x: 0,
			y: 0
		};
		this._w = 600;
		this._h = 480;
		this._dpr = 1;
		this._fg = "#888";
		this._halo = "rgba(255,255,255,.8)";
		this._tt = -1e9;
		this._sel = -1;
		this._hov = -1;
		this._nl = [];
		this._el = [];
		this._auto = true;
		this._fc = 0;
		this._ht = 0;
		this._st = "";
		this._occ = /* @__PURE__ */ new Uint8Array(0);
		this._oc = 1;
		this._or = 1;
		this._ptrs = /* @__PURE__ */ new Map();
		this._gs = null;
		this._bend = /* @__PURE__ */ new Float32Array(0);
		this._lp = /* @__PURE__ */ new Int32Array(0);
		this._pc = [];
		this._fill = [];
		this._ring = [];
		this._pOff = this._pList = this._cOff = this._cList = this._order = this._off = this._adj = /* @__PURE__ */ new Int32Array(0);
		this._bind();
	}
	connectedCallback() {
		this._ro = new ResizeObserver(() => this._resize());
		this._ro.observe(this);
		this._mq = typeof matchMedia !== "undefined" ? matchMedia("(prefers-color-scheme: dark)") : null;
		this._onTheme = () => {
			this._tt = -1e9;
			this._dirty = true;
			this._wake();
		};
		this._mq?.addEventListener("change", this._onTheme);
		this._resize();
		if (this._quads.length && !this._ids) this._queue();
		this._wake();
	}
	disconnectedCallback() {
		cancelAnimationFrame(this._raf);
		this._raf = 0;
		this._ro?.disconnect();
		this._mq?.removeEventListener("change", this._onTheme);
	}
	attributeChangedCallback(name, _, v) {
		const L = this._L;
		if (name === "height") this.style.height = /^\d+$/.test(v) ? v + "px" : v || "";
		else if (name === "charge") {
			L.charge = Math.abs(parseFloat(v)) || 40;
			this.reheat(.5);
		} else if (name === "link-dist") {
			L.linkDist = parseFloat(v) || 45;
			if (L.n) L.relink();
			this.reheat(.6);
		} else {
			this._dirty = true;
			this._wake();
		}
	}
	get quads() {
		return this._quads;
	}
	set quads(q) {
		this._quads = q || [];
		this._queue();
	}
	get context() {
		return this._ctxObj;
	}
	set context(c) {
		this._ctxObj = c || {};
		this._pfx = Object.entries(this._ctxObj).map(([p, v]) => [p, typeof v === "string" ? v : v?.["@id"]]).filter(([p, v]) => v && p[0] !== "@").sort((a, b) => b[1].length - a[1].length);
		this._queue();
	}
	get positions() {
		const o = {}, L = this._L;
		for (let i = 0; i < L.n; i++) o[this._names[i]] = [L.x[i], L.y[i]];
		return o;
	}
	set positions(o) {
		this._seed = o;
		this._queue();
	}
	reheat(a = .6) {
		this._L.reheat(a);
		this._wake();
	}
	fit() {
		this._auto = false;
		this._anim = this._fitTarget();
		this._wake();
	}
	select(iri) {
		const i = iri == null ? -1 : this._ids?.get(iri);
		this._select(i === void 0 ? -1 : i);
	}
	focus(iri, { zoom = 1.5 } = {}) {
		const i = this._ids?.get(iri);
		if (i === void 0) return false;
		this._select(i);
		const k = Math.max(this._v.k, zoom);
		this._auto = false;
		this._anim = {
			k,
			x: this._w / 2 - this._L.x[i] * k,
			y: this._h / 2 - this._L.y[i] * k
		};
		this._wake();
		return true;
	}
	pin(iri, on = true) {
		const i = this._ids?.get(iri);
		if (i === void 0) return;
		this._L.pin[i] = on ? 1 : 0;
		this._dirty = true;
		this._wake();
	}
	getNode(iri) {
		const i = this._ids?.get(iri);
		if (i === void 0) return null;
		const L = this._L, c = this._typ[i];
		return {
			id: iri,
			label: this._label(i),
			x: L.x[i],
			y: L.y[i],
			degree: L.deg[i],
			pinned: !!(L.pin[i] & 1),
			type: c ? this._classes[c] : null,
			literals: (this._lits.get(i) || []).map(([predicate, value]) => ({
				predicate,
				value
			}))
		};
	}
	_queue() {
		if (this._pend) return;
		this._pend = true;
		queueMicrotask(() => {
			this._pend = false;
			this._ingest();
		});
	}
	_ingest() {
		const ids = /* @__PURE__ */ new Map(), names = [], litN = [], typ = [], ls = [], lt = [], lp = [], lab = /* @__PURE__ */ new Map(), lits = /* @__PURE__ */ new Map();
		const classes = [null], classIdx = /* @__PURE__ */ new Map(), preds = [], predIdx = /* @__PURE__ */ new Map(), seen = /* @__PURE__ */ new Set();
		const idOf = (t) => t.termType === "BlankNode" ? "_:" + t.value : t.value;
		const node = (id) => {
			let i = ids.get(id);
			if (i === void 0) {
				i = names.length;
				ids.set(id, i);
				names.push(id);
				litN.push(0);
				typ.push(0);
			}
			return i;
		};
		for (const q of this._quads) {
			if (!q || !q.subject || !q.predicate || !q.object) continue;
			const o = q.object, p = q.predicate.value, sid = idOf(q.subject), si = node(sid);
			if (o.termType === "Literal") {
				litN[si]++;
				const lr = LABEL_RANK.get(p);
				if (lr !== void 0) {
					const c = lab.get(sid);
					if (!c || lr < c[1]) lab.set(sid, [o.value, lr]);
				}
				let a = lits.get(si);
				if (!a) lits.set(si, a = []);
				if (a.length < MAX_LIT) a.push([p, o.value]);
				continue;
			}
			if (o.termType !== "NamedNode" && o.termType !== "BlankNode") continue;
			const ti = node(idOf(o));
			if (si === ti) continue;
			let pi = predIdx.get(p);
			if (pi === void 0) {
				pi = preds.length;
				predIdx.set(p, pi);
				preds.push(p);
			}
			const key = (si * 1048576 + ti) * 4096 + (pi & 4095);
			if (seen.has(key)) continue;
			seen.add(key);
			ls.push(si);
			lt.push(ti);
			lp.push(pi);
			if (p === RDF_TYPE && o.termType === "NamedNode" && !typ[si]) {
				let c = classIdx.get(o.value);
				if (c === void 0) {
					c = classes.length;
					classIdx.set(o.value, c);
					classes.push(o.value);
				}
				typ[si] = c;
			}
		}
		for (let c = 1; c < classes.length; c++) {
			const i = ids.get(classes[c]);
			if (!typ[i]) typ[i] = c;
		}
		const n = names.length, m = ls.length, LS = Int32Array.from(ls), LT = Int32Array.from(lt), LP = Int32Array.from(lp);
		const off = new Int32Array(n + 1);
		for (let e = 0; e < m; e++) {
			off[LS[e] + 1]++;
			off[LT[e] + 1]++;
		}
		for (let i = 0; i < n; i++) off[i + 1] += off[i];
		const cur = off.slice(0, n), adj = new Int32Array(2 * m), deg = new Int32Array(n);
		for (let e = 0; e < m; e++) {
			adj[cur[LS[e]]++] = e;
			adj[cur[LT[e]]++] = e;
		}
		const r = new Float64Array(n), mass = new Float64Array(n);
		for (let i = 0; i < n; i++) {
			deg[i] = off[i + 1] - off[i];
			r[i] = Math.min(18, 3 + 1.6 * Math.sqrt(deg[i] + .5 * litN[i]));
			mass[i] = 1 + .5 * Math.sqrt(deg[i]);
		}
		const pairs = /* @__PURE__ */ new Map(), bend = new Float32Array(m), pk = (e) => Math.min(LS[e], LT[e]) * 1048576 + Math.max(LS[e], LT[e]);
		for (let e = 0; e < m; e++) pairs.set(pk(e), (pairs.get(pk(e)) || 0) + 1);
		const run = /* @__PURE__ */ new Map();
		for (let e = 0; e < m; e++) {
			const k = pk(e), c = pairs.get(k);
			if (c < 2) continue;
			const j = run.get(k) || 0;
			run.set(k, j + 1);
			bend[e] = (j - (c - 1) / 2) * 16 * (LS[e] < LT[e] ? 1 : -1);
		}
		const old = this._ids, oL = this._L, ox = oL.x, oy = oL.y, opin = oL.pin, seed = this._seed;
		this._seed = null;
		const x = new Float64Array(n), y = new Float64Array(n), placed = new Uint8Array(n), pin = new Uint8Array(n);
		for (let i = 0; i < n; i++) {
			const s = seed?.[names[i]], j = old?.get(names[i]);
			if (s) {
				x[i] = s[0];
				y[i] = s[1];
				placed[i] = 1;
			} else if (j !== void 0) {
				x[i] = ox[j];
				y[i] = oy[j];
				placed[i] = 1;
				pin[i] = opin[j] & 1;
			}
		}
		const hadOld = old && old.size > 0 && placed.some((v) => v);
		const order = Int32Array.from({ length: n }, (_, i) => i).sort((a, b) => deg[b] - deg[a]);
		seedLayout(n, LS, LT, off, adj, order, x, y, placed, oL.linkDist);
		const [pOff, pList] = group(LP, preds.length), [cOff, cList] = group(typ, classes.length);
		this._pc = preds.map((p) => p === RDF_TYPE ? "hsl(220 8% 55%)" : `hsl(${hash(p) % 360} 50% 55%)`);
		this._fill = classes.map((c, i) => i ? `hsl(${hash(c) % 360} 70% 56%)` : "hsl(215 12% 62%)");
		this._ring = classes.map((c, i) => i ? `hsl(${hash(c) % 360} 70% 36%)` : "hsl(215 12% 42%)");
		Object.assign(this, {
			_ids: ids,
			_names: names,
			_typ: Int32Array.from(typ),
			_classes: classes,
			_lits: lits,
			_lab: lab,
			_lc: [],
			_plc: [],
			_preds: preds,
			_bend: bend,
			_lp: LP,
			_pOff: pOff,
			_pList: pList,
			_cOff: cOff,
			_cList: cList,
			_order: order,
			_off: off,
			_adj: adj
		});
		const L = this._L;
		L.charge = Math.abs(parseFloat(this.getAttribute("charge"))) || 40;
		L.linkDist = parseFloat(this.getAttribute("link-dist")) || 45;
		L.load(x, y, LS, LT, deg, r, mass, pin);
		if (hadOld) L.alpha = .5;
		this._sel = -1;
		this._hov = -1;
		this._nl = [];
		this._el = [];
		this._tip.style.display = "none";
		if (!hadOld) {
			this._auto = true;
			if (n) Object.assign(this._v, this._fitTarget());
		}
		this._theme();
		this._dirty = true;
		this._wake();
	}
	_curie(iri) {
		for (const [p, ns] of this._pfx) if (iri.length > ns.length && iri.startsWith(ns)) return p + ":" + iri.slice(ns.length);
		const m = iri.match(/[#/:]([^#/:]+)\/?$/);
		let s = m ? m[1] : iri;
		try {
			s = decodeURIComponent(s);
		} catch {}
		return s;
	}
	_label(i) {
		var _this$_lc;
		return (_this$_lc = this._lc)[i] ?? (_this$_lc[i] = this._lab.get(this._names[i])?.[0] ?? this._curie(this._names[i]));
	}
	_plabel(p) {
		var _this$_plc;
		return (_this$_plc = this._plc)[p] ?? (_this$_plc[p] = this._lab.get(this._preds[p])?.[0] ?? this._curie(this._preds[p]));
	}
	_theme() {
		this._tt = performance.now();
		this._fg = "#eee";
		this._halo = "rgba(0,0,0,.8)";
	}
	_resize() {
		const w = this.clientWidth || 600, h = this.clientHeight || 480, d = Math.min(globalThis.devicePixelRatio || 1, this._L.n > 5e4 ? 1.5 : 2);
		Object.assign(this, {
			_w: w,
			_h: h,
			_dpr: d,
			_oc: Math.ceil(w / 12) + 1,
			_or: Math.ceil(h / 12) + 1
		});
		this._cv.width = Math.round(w * d);
		this._cv.height = Math.round(h * d);
		this._occ = new Uint8Array(this._oc * this._or);
		if (this._auto && this._L.n) Object.assign(this._v, this._fitTarget());
		this._dirty = true;
		this._wake();
	}
	/** Robust bounds (mean ± 3σ so flung-out strays don't wreck the zoom) → view transform. */
	_fitTarget() {
		const { x, y, n } = this._L, W = this._w, H = this._h;
		if (!n) return {
			k: 1,
			x: W / 2,
			y: H / 2
		};
		let mx = 0, my = 0;
		for (let i = 0; i < n; i++) {
			mx += x[i];
			my += y[i];
		}
		mx /= n;
		my /= n;
		let vx = 0, vy = 0;
		for (let i = 0; i < n; i++) {
			vx += (x[i] - mx) ** 2;
			vy += (y[i] - my) ** 2;
		}
		const lx = 3 * Math.sqrt(vx / n) + 20, ly = 3 * Math.sqrt(vy / n) + 20;
		let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
		for (let i = 0; i < n; i++) if (Math.abs(x[i] - mx) <= lx && Math.abs(y[i] - my) <= ly) {
			if (x[i] < a) a = x[i];
			if (x[i] > c) c = x[i];
			if (y[i] < b) b = y[i];
			if (y[i] > d) d = y[i];
		}
		const k = clamp(Math.min((W - 100) / (c - a || 1), (H - 100) / (d - b || 1)), .005, 1.5);
		return {
			k,
			x: W / 2 - k * (a + c) / 2,
			y: H / 2 - k * (b + d) / 2
		};
	}
	_zoomAt(px, py, f) {
		const v = this._v, nk = clamp(v.k * f, .005, 60);
		f = nk / v.k;
		v.x = px - (px - v.x) * f;
		v.y = py - (py - v.y) * f;
		v.k = nk;
		this._dirty = true;
		this._wake();
	}
	_wake() {
		if (!this._raf) this._raf = requestAnimationFrame(() => {
			this._raf = 0;
			this._frame();
		});
	}
	_frame() {
		const L = this._L, was = L.active;
		let more = false;
		if (was) {
			const it = L.iter;
			L.step(L.n > 2e4 ? 8 : 5, L.n > 3e3 ? 1 : 2);
			if (L.iter !== it) this._dirty = true;
			more = L.active;
		}
		if (this._auto && L.n && (more ? ++this._fc % 6 === 0 : was)) this._anim = this._fitTarget();
		if (was && !more) {
			this._auto = false;
			this.dispatchEvent(new CustomEvent("settled"));
		}
		if (this._anim) {
			const a = this._anim, v = this._v;
			v.k += (a.k - v.k) * .2;
			v.x += (a.x - v.x) * .2;
			v.y += (a.y - v.y) * .2;
			this._dirty = true;
			if (Math.abs(a.k - v.k) < a.k * .001 && Math.abs(a.x - v.x) < .5 && Math.abs(a.y - v.y) < .5) {
				Object.assign(v, a);
				this._anim = null;
			}
		}
		if (this._dirty) {
			this._dirty = false;
			this._draw();
		}
		const now = performance.now();
		if (now - this._ht > 150 || !more) {
			this._ht = now;
			const s = `${L.n.toLocaleString()} nodes · ${L.ls.length.toLocaleString()} links`;
			if (s !== this._st) this._stat.textContent = this._st = s;
			this._bar.style.width = (more ? Math.min(1, L.alpha) * 100 : 0) + "%";
		}
		if (more || this._anim) this._wake();
	}
	_draw() {
		const L = this._L, c = this._cv, g = this._g2, d = this._dpr, v = this._v, W = this._w, H = this._h;
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, c.width, c.height);
		if (!L.n) return;
		if (performance.now() - this._tt > 1e3) this._theme();
		const { x, y, r, ls, lt } = L, k = v.k, inv = 1 / k, E = ls.length, sel = this._sel, bend = this._bend;
		const x0 = -v.x * inv, y0 = -v.y * inv, x1 = (W - v.x) * inv, y1 = (H - v.y) * inv;
		g.setTransform(d * k, 0, 0, d * k, d * v.x, d * v.y);
		g.lineCap = "round";
		const addEdge = (e, ap) => {
			const s = ls[e], t = lt[e], sx = x[s], sy = y[s], tx = x[t], ty = y[t];
			if (sx < x0 && tx < x0 || sx > x1 && tx > x1 || sy < y0 && ty < y0 || sy > y1 && ty > y1) return;
			const dx = tx - sx, dy = ty - sy, len = Math.sqrt(dx * dx + dy * dy) || 1e-6, ux = dx / len, uy = dy / len;
			const ax = sx + ux * r[s], ay = sy + uy * r[s], bx = tx - ux * (r[t] + 1), by = ty - uy * (r[t] + 1), b = bend[e];
			g.moveTo(ax, ay);
			if (b) g.quadraticCurveTo((ax + bx) / 2 - uy * b * 2, (ay + by) / 2 + ux * b * 2, bx, by);
			else g.lineTo(bx, by);
			if (ap && len * k > 18) {
				const z = 6 * inv, ex = bx - ux * z, ey = by - uy * z;
				ap.moveTo(bx, by);
				ap.lineTo(ex - uy * z * .45, ey + ux * z * .45);
				ap.lineTo(ex + uy * z * .45, ey - ux * z * .45);
				ap.closePath();
			}
		};
		const arrows = k > .45 && E < 4e4, base = (E > 1e5 ? .2 : E > 2e4 ? .3 : E > 3e3 ? .45 : .65) * (sel >= 0 ? .25 : 1);
		g.lineWidth = (E > 5e4 ? .7 : 1) * inv;
		for (let p = 0; p < this._pc.length; p++) {
			const ap = arrows ? new Path2D() : null;
			g.beginPath();
			for (let a = this._pOff[p]; a < this._pOff[p + 1]; a++) addEdge(this._pList[a], ap);
			g.globalAlpha = base;
			g.strokeStyle = this._pc[p];
			g.stroke();
			if (ap) {
				g.globalAlpha = Math.min(1, base * 1.5);
				g.fillStyle = this._pc[p];
				g.fill(ap);
			}
		}
		const ring = k > .65 && (L.n < 3e4 || k > 2);
		g.lineWidth = 1.4 * inv;
		g.globalAlpha = sel >= 0 ? .28 : 1;
		for (let cl = 0; cl < this._fill.length; cl++) {
			g.beginPath();
			for (let a = this._cOff[cl]; a < this._cOff[cl + 1]; a++) {
				const i = this._cList[a], px = x[i], py = y[i], ri = r[i];
				if (px + ri < x0 || px - ri > x1 || py + ri < y0 || py - ri > y1) continue;
				if (ri * k < 1) {
					const h = .9 * inv;
					g.rect(px - h, py - h, 2 * h, 2 * h);
				} else {
					g.moveTo(px + ri, py);
					g.arc(px, py, ri, 0, TAU);
				}
			}
			g.fillStyle = this._fill[cl];
			g.fill();
			if (ring) {
				g.strokeStyle = this._ring[cl];
				g.stroke();
			}
		}
		g.globalAlpha = 1;
		const dot = (i, strong) => {
			const cl = this._typ[i];
			g.beginPath();
			g.arc(x[i], y[i], r[i], 0, TAU);
			g.fillStyle = this._fill[cl];
			g.fill();
			g.lineWidth = (strong ? 2.5 : 1.4) * inv;
			g.strokeStyle = strong ? this._fg : this._ring[cl];
			g.stroke();
		};
		if (sel >= 0) {
			g.lineWidth = 1.6 * inv;
			g.globalAlpha = .9;
			for (const e of this._el) {
				const ap = new Path2D(), col = this._pc[this._lp[e]];
				g.beginPath();
				addEdge(e, ap);
				g.strokeStyle = g.fillStyle = col;
				g.stroke();
				g.fill(ap);
			}
			g.globalAlpha = 1;
			for (const i of this._nl) dot(i, false);
			dot(sel, true);
		}
		if (this._hov >= 0 && this._hov !== sel) dot(this._hov, true);
		g.lineWidth = 1.2 * inv;
		g.strokeStyle = this._fg;
		g.setLineDash([3 * inv, 3 * inv]);
		for (let i = 0; i < L.n; i++) if (L.pin[i] & 1) {
			g.beginPath();
			g.arc(x[i], y[i], r[i] + 3 * inv, 0, TAU);
			g.stroke();
		}
		g.setLineDash([]);
		if (this.getAttribute("labels") !== "off") this._drawLabels(g, d);
		g.globalAlpha = 1;
	}
	_drawLabels(g, d) {
		const L = this._L, { x, y, r, ls, lt } = L, v = this._v, k = v.k, W = this._w, H = this._h, sel = this._sel, oc = this._occ, cols = this._oc, C = 12;
		g.setTransform(d, 0, 0, d, 0, 0);
		oc.fill(0);
		g.font = "11px system-ui,sans-serif";
		g.textAlign = "center";
		g.textBaseline = "middle";
		g.lineJoin = "round";
		g.lineWidth = 1.5;
		const reserve = (cx, cy, w, h, force) => {
			const a = Math.max(0, (cx - w / 2) / C | 0), b = Math.max(0, (cy - h / 2) / C | 0), a2 = Math.min(cols - 1, (cx + w / 2) / C | 0), b2 = Math.min(this._or - 1, (cy + h / 2) / C | 0);
			if (!force) {
				for (let j = b; j <= b2; j++) for (let i = a; i <= a2; i++) if (oc[j * cols + i]) return false;
			}
			for (let j = b; j <= b2; j++) for (let i = a; i <= a2; i++) oc[j * cols + i] = 1;
			return true;
		};
		const put = (i, force) => {
			const sx = x[i] * k + v.x, sy = y[i] * k + v.y, rs = r[i] * k;
			if (sx < -60 || sx > W + 60 || sy < -10 || sy > H + 30) return -1;
			if (!force && rs < 2) return 0;
			const t = this._label(i), w = t.length * 6.1 + 6, ty = sy - rs - 8;
			if (!reserve(sx, ty, w, 14, force)) return 0;
			g.globalAlpha = sel >= 0 && !force ? .35 : 1;
			g.strokeStyle = this._halo;
			g.strokeText(t, sx, ty);
			g.fillStyle = this._fg;
			g.fillText(t, sx, ty);
			return 1;
		};
		if (sel >= 0) {
			put(sel, true);
			for (const i of this._nl) put(i, true);
		}
		if (this._hov >= 0) put(this._hov, true);
		for (let a = 0, seen = 0, drawn = 0; a < L.n && drawn < 700 && seen < 6e3; a++) {
			const s = put(this._order[a], false);
			if (s >= 0) seen++;
			if (s > 0) drawn++;
		}
		if (k < .5 || !ls.length) return;
		g.font = "9px system-ui,sans-serif";
		g.globalAlpha = .9;
		g.lineWidth = 1;
		for (let e = 0, cnt = 0; e < ls.length && cnt < 150; e++) {
			const s = ls[e], t = lt[e], dx = (x[t] - x[s]) * k, dy = (y[t] - y[s]) * k, len = Math.sqrt(dx * dx + dy * dy);
			if (len < 70) continue;
			const b = this._bend[e] * k, mx = (x[s] + x[t]) / 2 * k + v.x - dy / len * b, my = (y[s] + y[t]) / 2 * k + v.y + dx / len * b;
			if (mx < 0 || mx > W || my < 0 || my > H) continue;
			const txt = this._plabel(this._lp[e]), tw = txt.length * 5.2;
			if (len < tw + 30) continue;
			const ca = Math.abs(dx / len), sa = Math.abs(dy / len);
			if (!reserve(mx, my, tw * ca + 10 * sa, tw * sa + 10 * ca)) continue;
			let ang = Math.atan2(dy, dx);
			if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
			g.save();
			g.translate(mx, my);
			g.rotate(ang);
			g.strokeStyle = this._halo;
			g.strokeText(txt, 0, -5);
			g.fillStyle = this._pc[this._lp[e]];
			g.fillText(txt, 0, -5);
			g.restore();
			cnt++;
		}
	}
	_pick(sx, sy) {
		const L = this._L, { x, y, r } = L, k = this._v.k, wx = (sx - this._v.x) / k, wy = (sy - this._v.y) / k, minR = 5 / k;
		let best = -1, bd = 1;
		for (let i = 0; i < L.n; i++) {
			const rr = r[i] > minR ? r[i] : minR, dx = x[i] - wx;
			if (dx > rr || dx < -rr) continue;
			const dy = y[i] - wy;
			if (dy > rr || dy < -rr) continue;
			const q = (dx * dx + dy * dy) / (rr * rr);
			if (q <= bd) {
				bd = q;
				best = i;
			}
		}
		return best;
	}
	_select(i) {
		if (i === this._sel) return;
		const L = this._L, off = this._off, adj = this._adj;
		this._sel = i;
		this._nl = [];
		this._el = [];
		if (i >= 0) {
			const s = /* @__PURE__ */ new Set();
			for (let a = off[i]; a < off[i + 1]; a++) {
				const e = adj[a];
				this._el.push(e);
				s.add(L.ls[e] === i ? L.lt[e] : L.ls[e]);
			}
			this._nl = [...s];
		}
		this.dispatchEvent(new CustomEvent("node-select", {
			detail: i >= 0 ? this._names[i] : null,
			bubbles: true
		}));
		this._dirty = true;
		this._wake();
	}
	_showTip(i, ex, ey) {
		const t = this._tip;
		if (i < 0) {
			t.style.display = "none";
			return;
		}
		if (t._i !== i) {
			t._i = i;
			t.replaceChildren();
			const add = (tag, txt) => {
				const e = document.createElement(tag);
				e.textContent = txt;
				t.append(e);
			};
			add("b", this._label(i));
			add("small", this._names[i]);
			const c = this._typ[i];
			if (c && this._classes[c] !== this._names[i]) add("small", "a " + this._curie(this._classes[c]));
			for (const [p, val] of this._lits.get(i) || []) add("div", this._curie(p) + ": " + (val.length > 80 ? val.slice(0, 80) + "…" : val));
			add("small", this._L.deg[i] + " links");
		}
		t.style.display = "block";
		const tw = t.offsetWidth, th = t.offsetHeight;
		t.style.transform = `translate(${ex + 14 + tw > this._w ? Math.max(0, ex - 14 - tw) : ex + 14}px,${Math.max(0, Math.min(ey + 14, this._h - th - 4))}px)`;
	}
	_xy(e) {
		const b = this._cv.getBoundingClientRect();
		return {
			x: e.clientX - b.left,
			y: e.clientY - b.top
		};
	}
	_release() {
		const g = this._gs;
		if (g && g.i >= 0) {
			this._L.pin[g.i] &= 1;
			this._L.target = 0;
		}
		this._gs = null;
	}
	_bind() {
		const cv = this._cv, P = this._ptrs;
		cv.addEventListener("pointerdown", (e) => {
			cv.setPointerCapture(e.pointerId);
			const p = this._xy(e);
			P.set(e.pointerId, {
				x: p.x,
				y: p.y
			});
			this._auto = false;
			this._anim = null;
			if (P.size > 1) {
				this._release();
				return;
			}
			const i = this._pick(p.x, p.y);
			this._gs = {
				i,
				sx: p.x,
				sy: p.y,
				moved: false
			};
			if (i >= 0) {
				this._L.pin[i] |= 2;
				this._L.target = .3;
				this._L.reheat(.3);
				cv.style.cursor = "grabbing";
				this._showTip(-1);
				this._wake();
			} else cv.style.cursor = "grabbing";
		});
		cv.addEventListener("pointermove", (e) => {
			const p = this._xy(e), rec = P.get(e.pointerId), L = this._L, v = this._v;
			if (!rec) {
				this._mp = p;
				if (!this._hp) this._hp = requestAnimationFrame(() => {
					this._hp = 0;
					const q = this._mp, i = this._pick(q.x, q.y);
					if (i !== this._hov) {
						this._hov = i;
						cv.style.cursor = i >= 0 ? "pointer" : "grab";
						this._dirty = true;
						this._wake();
						this.dispatchEvent(new CustomEvent("node-hover", { detail: i >= 0 ? this._names[i] : null }));
					}
					this._showTip(i, q.x, q.y);
				});
				return;
			}
			if (P.size === 2) {
				rec.x = p.x;
				rec.y = p.y;
				const [a, b] = [...P.values()], dd = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, pr = this._pinch;
				if (pr && pr.d) {
					this._zoomAt(cx, cy, dd / pr.d);
					v.x += cx - pr.cx;
					v.y += cy - pr.cy;
				}
				this._pinch = {
					d: dd,
					cx,
					cy
				};
				this._dirty = true;
				this._wake();
				return;
			}
			const gs = this._gs;
			if (!gs) return;
			if (Math.hypot(p.x - gs.sx, p.y - gs.sy) > 3) gs.moved = true;
			if (gs.i >= 0) {
				L.x[gs.i] = (p.x - v.x) / v.k;
				L.y[gs.i] = (p.y - v.y) / v.k;
				L.vx[gs.i] = L.vy[gs.i] = 0;
			} else if (gs.moved) {
				v.x += p.x - rec.x;
				v.y += p.y - rec.y;
			}
			rec.x = p.x;
			rec.y = p.y;
			this._dirty = true;
			this._wake();
		});
		const up = (e) => {
			if (!P.delete(e.pointerId)) return;
			this._pinch = null;
			const gs = this._gs;
			if (P.size === 0 && gs) {
				if (gs.i >= 0 && !gs.moved) {
					this._select(gs.i);
					this.dispatchEvent(new CustomEvent("node-click", {
						detail: this._names[gs.i],
						bubbles: true
					}));
				} else if (gs.i < 0 && !gs.moved) this._select(-1);
				this._release();
				cv.style.cursor = this._hov >= 0 ? "pointer" : "grab";
				this._wake();
			}
		};
		cv.addEventListener("pointerup", up);
		cv.addEventListener("pointercancel", up);
		cv.addEventListener("pointerleave", () => {
			if (this._hov >= 0 && !P.size) {
				this._hov = -1;
				this._dirty = true;
				this._wake();
			}
			this._showTip(-1);
		});
		cv.addEventListener("dblclick", (e) => {
			const p = this._xy(e), i = this._pick(p.x, p.y);
			if (i >= 0) {
				this._L.pin[i] ^= 1;
				this._L.reheat(.2);
				this._dirty = true;
				this._wake();
			} else this.fit();
		});
		cv.addEventListener("wheel", (e) => {
			e.preventDefault();
			this._auto = false;
			this._anim = null;
			const p = this._xy(e);
			this._zoomAt(p.x, p.y, Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0015) * (e.deltaMode === 1 ? 16 : 1)));
		}, { passive: false });
	}
};
_defineProperty(QuadGraph, "observedAttributes", [
	"height",
	"charge",
	"link-dist",
	"labels"
]);
if (typeof customElements !== "undefined" && !customElements.get("quad-graph")) customElements.define("quad-graph", QuadGraph);
//#endregion
export { Layout, QuadGraph, QuadGraph as default };
