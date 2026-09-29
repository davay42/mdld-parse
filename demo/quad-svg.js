// quad-graph.js
// 0-dependency RDF quad graph renderer.
// Usage:
//   import './quad-graph.js';
//   const el = document.querySelector('quad-graph');
//   el.quads = quads;
//   el.context = { ex: 'http://example.org/' };
//   el.addEventListener('node-click', e => console.log(e.detail.id));

const SVG_NS = 'http://www.w3.org/2000/svg';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';

const CSS = `
quad-graph{display:block}
.qg-wrap{
  position:relative;
  overflow:hidden;
  border-radius:14px;
  border:1px solid rgba(15,23,42,.10);
  background:
    radial-gradient(1200px 600px at 30% 0%, rgba(59,130,246,.08), transparent),
    linear-gradient(180deg,#fbfdff,#f6f8fb);
}
.qg-svg{display:block;touch-action:none;user-select:none}
.qg-hud{
  position:absolute;top:10px;left:10px;
  display:flex;gap:8px;align-items:center;
  padding:5px 8px;border-radius:999px;
  background:rgba(255,255,255,.82);
  box-shadow:0 1px 8px rgba(15,23,42,.08);
  font:11px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  color:#334155;pointer-events:none;
}
.qg-energy{width:70px;height:4px;border-radius:999px;background:rgba(15,23,42,.12);overflow:hidden}
.qg-ebar{width:0%;height:100%;background:#94a3b8}
.qg-link{stroke-linecap:round}
.qg-link-label{
  font:8px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  fill:#64748b;text-anchor:middle;dominant-baseline:central;
  pointer-events:none;opacity:.75;
}
.qg-node text{
  pointer-events:none;
  text-anchor:middle;
  dominant-baseline:central;
  font:9px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
}
.qg-count{
  fill:#fff;font-weight:700;font-size:10px;
  paint-order:stroke;stroke:rgba(15,23,42,.35);stroke-width:2px;
}
.qg-cluster .qg-text{font-size:10px;font-weight:600;fill:#1f2937}
.qg-empty{fill:#64748b;font:12px system-ui;text-anchor:middle;dominant-baseline:central}
.qg-node circle{transition:stroke-width .12s ease}
.qg-node:hover circle{stroke-width:4px}
.qg-selected circle{stroke:#0f172a !important;stroke-width:3.5px}
`;

function ensureStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('quad-graph-style')) return;
    const style = document.createElement('style');
    style.id = 'quad-graph-style';
    style.textContent = CSS;
    document.head.appendChild(style);
}

function clamp(v, min, max) {
    v = Number(v) || 0;
    return Math.max(min, Math.min(max, v));
}

function hash(s) {
    s = String(s || '');
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function val(term) {
    if (!term) return '';
    if (typeof term === 'string') return term;
    if (typeof term.value === 'string') return term.value;
    return String(term);
}

function isLiteral(term) {
    return !!term && term.termType === 'Literal';
}

function curie(iri, ctx) {
    if (!iri || typeof iri !== 'string') return '';
    if (ctx) {
        for (const [pfx, ns] of Object.entries(ctx)) {
            if (ns && iri.startsWith(ns)) return pfx + ':' + iri.slice(ns.length);
        }
    }
    const m = iri.match(/[#/]([^#/]+)$/);
    if (m && m[1]) return m[1];
    return iri.replace(/^https?:\/\//, '');
}

function namespaceOf(iri) {
    iri = String(iri || '');
    const h = iri.indexOf('#');
    if (h > 0) return iri.slice(0, h + 1);
    const s = iri.lastIndexOf('/');
    if (s > 8) return iri.slice(0, s + 1);
    return iri;
}

function nsLabel(ns) {
    ns = String(ns || '');
    const noProto = ns.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/$/, '');
    const parts = noProto.split('/').filter(Boolean);
    if (!parts.length) return 'namespace';
    if (parts.length === 1) return parts[0];
    return `${parts[0]}/${parts[parts.length - 1]}`;
}

function colorFor(key, light = 54, sat = 70) {
    const h = hash(key) % 360;
    return {
        fill: `hsl(${h}, ${sat}%, ${light}%)`,
        stroke: `hsl(${h}, ${sat}%, ${Math.max(18, light - 20)}%)`,
        text: `hsl(${h}, 45%, 24%)`
    };
}

function linkColor(iri) {
    if (!iri) return '#94a3b8';
    const h = hash(iri) % 360;
    return `hsl(${h}, 35%, 56%)`;
}

function shortLabel(s, max = 34) {
    s = String(s == null ? '' : s);
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function svgEl(name) {
    return document.createElementNS(SVG_NS, name);
}

function htmlEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
}

function frame() {
    return new Promise(resolve => {
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(resolve);
        else setTimeout(resolve, 0);
    });
}

const BaseElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class { };

export class QuadGraph extends BaseElement {
    static get observedAttributes() {
        return [
            'height',
            'charge',
            'link-dist',
            'max-render',
            'cluster-threshold',
            'max-links',
            'max-focus',
            'labels',
            'focus'
        ];
    }

    constructor() {
        super();
        this._quads = [];
        this._ctx = {};
        this._index = null;
        this._view = null;
        this._nodeById = new Map();

        this._dirty = false;
        this._buildRunning = false;
        this._buildRaf = 0;
        this._buildToken = 0;

        this._raf = 0;
        this._alpha = 0;
        this._sleeping = true;
        this._drag = null;
        this._selectedId = null;
        this._focusId = null;

        this._W = 600;
        this._H = 480;

        this._tick = this._tick.bind(this);
    }

    connectedCallback() {
        this._mount();
        if (this.hasAttribute('focus')) this._focusId = this.getAttribute('focus');
        this._scheduleBuild();
    }

    disconnectedCallback() {
        this._dirty = false;
        if (this._buildRaf) cancelAnimationFrame(this._buildRaf);
        if (this._raf) cancelAnimationFrame(this._raf);
        if (this._ro) this._ro.disconnect();
        this._buildRaf = 0;
        this._raf = 0;
    }

    attributeChangedCallback(name, old, value) {
        if (!this._wrap) return;

        if (name === 'height') {
            this._wrap.style.height = this._num('height', 480) + 'px';
            this._resize();
            this._restart();
            return;
        }

        if (name === 'focus') {
            if (value) this.focus(value);
            else this.clearFocus();
            return;
        }

        if (name === 'link-dist') {
            this._applyLinkDistances();
            this._restart();
            return;
        }

        if (name === 'charge') {
            this._restart();
            return;
        }

        if ([
            'max-render',
            'cluster-threshold',
            'max-links',
            'max-focus',
            'labels'
        ].includes(name)) {
            this._scheduleBuild();
        }
    }

    set quads(q) {
        if (Array.isArray(q)) this._quads = q;
        else if (q && typeof q[Symbol.iterator] === 'function') this._quads = Array.from(q);
        else this._quads = [];
        this._scheduleBuild();
    }

    get quads() {
        return this._quads;
    }

    set context(ctx) {
        this._ctx = ctx || {};
        this._scheduleBuild();
    }

    get context() {
        return this._ctx;
    }

    get focusedId() {
        return this._focusId;
    }

    focus(id) {
        if (!id) return;
        this._focusId = String(id);
        this._selectedId = this._focusId;
        this._scheduleBuild();
    }

    clearFocus() {
        if (!this._focusId) return;
        this._focusId = null;
        this._scheduleBuild();
    }

    select(id, opts = {}) {
        id = String(id || '');
        if (!id) return;
        this._selectedId = id;

        const rendered = this._nodeById.get(id);
        if (rendered) {
            this._applySelection();
            this._restart();
            return;
        }

        if (opts.focusIfMissing !== false && this._index?.nodes?.has(id)) {
            this.focus(id);
        }
    }

    getNode(id) {
        id = String(id || '');
        return this._nodeById.get(id) || this._index?.nodes?.get(id) || null;
    }

    get renderedNodes() {
        return this._view?.nodes || [];
    }

    get renderedLinks() {
        return this._view?.links || [];
    }

    get graphSummary() {
        return {
            quads: this._quads?.length || 0,
            indexedNodes: this._index?.nodes?.size || 0,
            renderedNodes: this._view?.nodes?.length || 0,
            renderedLinks: this._view?.links?.length || 0,
            mode: this._view?.mode || 'idle',
            focus: this._focusId || null
        };
    }

    _num(name, fallback) {
        const raw = this.getAttribute?.(name);
        const n = parseFloat(raw);
        return Number.isFinite(n) ? n : fallback;
    }

    get _maxRender() {
        return clamp(this._num('max-render', 900), 50, 3000);
    }

    get _clusterThreshold() {
        const explicit = this._num('cluster-threshold', NaN);
        if (Number.isFinite(explicit)) return Math.max(50, explicit);
        return Math.max(80, Math.floor(this._maxRender * 1.15));
    }

    get _maxLinks() {
        return clamp(this._num('max-links', 2400), 50, 10000);
    }

    get _maxFocus() {
        return clamp(this._num('max-focus', 220), 20, 800);
    }

    _scheduleBuild() {
        this._dirty = true;
        if (!this.isConnected || this._buildRunning || this._buildRaf) return;
        this._buildRaf = requestAnimationFrame(() => {
            this._buildRaf = 0;
            this._buildLoop();
        });
    }

    async _buildLoop() {
        this._buildRunning = true;
        try {
            while (this._dirty && this.isConnected) {
                this._dirty = false;
                await this._buildOnce();
            }
        } catch (err) {
            console.error('[quad-graph] build failed', err);
        } finally {
            this._buildRunning = false;
            if (this._dirty && this.isConnected) this._scheduleBuild();
        }
    }

    async _buildOnce() {
        const token = ++this._buildToken;
        const quads = this._quads || [];
        if (!this._wrap) return;

        if (!quads.length) {
            this._index = {
                nodes: new Map(),
                types: new Set(),
                predicates: new Set(),
                edgeCount: 0
            };
            this._setView({ nodes: [], links: [], mode: 'empty', notice: 'No quads' });
            return;
        }

        this._setStatus(`indexing ${quads.length} quads…`);
        const index = await this._indexQuads(quads, token);
        if (!index || token !== this._buildToken || !this.isConnected) return;

        this._index = index;

        let view = null;
        if (this._focusId) {
            view = await this._buildFocusView(index, quads, token);
        } else if (index.nodes.size <= this._clusterThreshold) {
            view = await this._buildDetailView(index, quads, token);
        } else {
            view = await this._buildClusterView(index, quads, token);
        }

        if (!view || token !== this._buildToken || !this.isConnected) return;
        this._setView(view);
    }

    async _forEachQuad(quads, token, fn) {
        const CHUNK = 30000;
        for (let i = 0; i < quads.length; i += CHUNK) {
            const end = Math.min(quads.length, i + CHUNK);
            for (let j = i; j < end; j++) {
                const q = quads[j];
                if (!q) continue;
                try {
                    fn(q);
                } catch {
                    // Ignore malformed quad.
                }
            }

            if (token !== this._buildToken || this._dirty) return false;
            if (end < quads.length) await frame();
            if (token !== this._buildToken || this._dirty) return false;
        }
        return true;
    }

    async _indexQuads(quads, token) {
        const nodes = new Map();
        const types = new Set();
        const predicates = new Set();
        let edgeCount = 0;

        const ensure = id => {
            let n = nodes.get(id);
            if (!n) {
                n = { id, t: '', l: '', d: 0, c: 0 };
                nodes.set(id, n);
            }
            return n;
        };

        const ok = await this._forEachQuad(quads, token, q => {
            const s = val(q.subject);
            const p = val(q.predicate);
            const o = q.object;
            if (!s || !p || !o) return;

            predicates.add(p);
            const sn = ensure(s);

            if (isLiteral(o)) {
                if (p === RDFS_LABEL) sn.l = val(o);
                else sn.c += 1;
                return;
            }

            const ov = val(o);
            if (!ov) return;
            const on = ensure(ov);

            if (p === RDF_TYPE) {
                sn.t = ov;
                types.add(ov);
                edgeCount++;
            } else if (p !== RDFS_LABEL) {
                sn.d += 1;
                on.d += 1;
                edgeCount++;
            } else {
                edgeCount++;
            }
        });

        if (!ok) return null;
        return { nodes, types, predicates, edgeCount };
    }

    _isVisibleInfo(id, info, index) {
        if (id === this._focusId) return true;
        if (!info) return false;
        if (info.d > 0 || info.c > 0) return true;

        // Typed instances with only rdf:type should remain visible.
        if (info.t && !index.types.has(id)) return true;

        // Label-only non-predicate, non-class nodes can be useful for tiny graphs.
        if (info.l && !index.predicates.has(id) && !index.types.has(id)) return true;

        return false;
    }

    async _buildDetailView(index, quads, token) {
        const entries = [...index.nodes.entries()]
            .filter(([id, info]) => this._isVisibleInfo(id, info, index));

        let chosen = entries;
        if (chosen.length > this._maxRender) {
            chosen = chosen
                .sort((a, b) => (b[1].d + b[1].c) - (a[1].d + a[1].c))
                .slice(0, this._maxRender);
        }

        const nodes = [];
        const nodeById = new Map();
        for (const [id, info] of chosen) {
            const n = this._makeNode(id, info, {});
            nodes.push(n);
            nodeById.set(id, n);
        }

        const linkMap = new Map();
        const ok = await this._forEachQuad(quads, token, q => {
            const s = val(q.subject);
            const p = val(q.predicate);
            const o = q.object;
            if (!s || !p || !o || isLiteral(o)) return;
            const ov = val(o);
            if (!ov || p === RDFS_LABEL) return;
            if (!nodeById.has(s) || !nodeById.has(ov)) return;

            const key = s + '\u0000' + ov;
            let l = linkMap.get(key);
            if (!l) {
                linkMap.set(key, { source: s, target: ov, iri: p, count: 1, multi: false });
            } else {
                l.count++;
                if (l.iri !== p) l.multi = true;
            }
        });

        if (!ok) return null;

        let links = [...linkMap.values()];
        if (links.length > this._maxLinks) {
            links.sort((a, b) => b.count - a.count);
            links.length = this._maxLinks;
        }

        for (const l of links) l.label = this._linkLabel(l, index, false);
        return { nodes, links, mode: 'detail' };
    }

    _clusterKeyFor(info) {
        if (info.t) return 'type:' + info.t;
        return 'ns:' + namespaceOf(info.id);
    }

    async _buildClusterView(index, quads, token) {
        const clusterData = new Map();

        for (const [id, info] of index.nodes) {
            if (!this._isVisibleInfo(id, info, index)) continue;
            if (index.types.has(id) && info.d <= 0 && info.c === 0 && id !== this._focusId) continue;

            const key = this._clusterKeyFor(info);
            let c = clusterData.get(key);
            if (!c) {
                const isType = key.startsWith('type:');
                const iri = isType ? key.slice(5) : key.slice(3);
                c = {
                    id: key,
                    iri,
                    isType,
                    label: index.nodes.get(iri)?.l || (isType ? curie(iri, this._ctx) : nsLabel(iri)),
                    count: 0,
                    degree: 0,
                    internal: 0,
                    samples: []
                };
                clusterData.set(key, c);
            }

            c.count++;
            c.degree += info.d;
            if (c.samples.length < 12) c.samples.push(id);
        }

        const maxRender = this._maxRender;
        let visible = new Set(clusterData.keys());

        if (clusterData.size > maxRender) {
            const arr = [...clusterData.values()]
                .sort((a, b) => (b.count + b.degree) - (a.count + a.degree));

            visible = new Set(arr.slice(0, maxRender - 1).map(c => c.id));

            const other = {
                id: 'other',
                iri: '',
                isType: false,
                label: 'Other',
                count: 0,
                degree: 0,
                internal: 0,
                samples: []
            };

            for (const c of arr.slice(maxRender - 1)) {
                other.count += c.count;
                other.degree += c.degree;
                clusterData.delete(c.id);
            }

            if (other.count > 0) clusterData.set(other.id, other);
        }

        const keyFor = info => {
            const k = this._clusterKeyFor(info);
            return visible.has(k) ? k : 'other';
        };

        const linkMap = new Map();
        const ok = await this._forEachQuad(quads, token, q => {
            const s = val(q.subject);
            const p = val(q.predicate);
            const o = q.object;
            if (!s || !p || !o || isLiteral(o)) return;
            if (p === RDF_TYPE || p === RDFS_LABEL) return;

            const ov = val(o);
            if (!ov) return;

            const si = index.nodes.get(s);
            const oi = index.nodes.get(ov);
            if (!si || !oi) return;

            const a = keyFor(si);
            const b = keyFor(oi);
            if (a === b) {
                const c = clusterData.get(a);
                if (c) c.internal++;
                return;
            }

            const key = a + '\u0000' + b;
            let l = linkMap.get(key);
            if (!l) {
                linkMap.set(key, { source: a, target: b, iri: p, count: 1, multi: false });
            } else {
                l.count++;
                if (l.iri !== p) l.multi = true;
            }
        });

        if (!ok) return null;

        const nodes = [...clusterData.values()].map(c => this._makeNode(
            c.id,
            { l: c.label, t: c.isType ? c.iri : '', d: c.degree, c: 0 },
            {
                isCluster: true,
                count: c.count,
                internal: c.internal,
                samples: c.samples,
                label: c.label,
                colorKey: c.iri || c.id,
                iri: c.iri
            }
        ));

        let links = [...linkMap.values()]
            .filter(l => clusterData.has(l.source) && clusterData.has(l.target));

        if (links.length > this._maxLinks) {
            links.sort((a, b) => b.count - a.count);
            links.length = this._maxLinks;
        }

        for (const l of links) l.label = this._linkLabel(l, index, true);

        return { nodes, links, mode: 'cluster' };
    }

    async _buildFocusView(index, quads, token) {
        const focus = this._focusId;
        const info = index.nodes.get(focus);
        if (!info) {
            return {
                nodes: [],
                links: [],
                mode: 'focus',
                notice: 'Focus not found in current quads'
            };
        }

        const scores = new Map();
        const ok1 = await this._forEachQuad(quads, token, q => {
            const s = val(q.subject);
            const p = val(q.predicate);
            const o = q.object;
            if (!s || !p || !o || isLiteral(o)) return;
            const ov = val(o);
            if (!ov || p === RDFS_LABEL) return;

            if (s === focus) {
                scores.set(ov, (scores.get(ov) || 0) + (p === RDF_TYPE ? 2 : 1));
            }
            if (ov === focus) {
                scores.set(s, (scores.get(s) || 0) + 1);
            }
        });

        if (!ok1) return null;

        const ids = new Set([focus]);
        if (info.t && index.nodes.has(info.t)) ids.add(info.t);

        const max = this._maxFocus;
        if (ids.size < max) {
            const top = [...scores.entries()]
                .filter(([id]) => !ids.has(id))
                .sort((a, b) => b[1] - a[1])
                .slice(0, max - ids.size);

            for (const [id] of top) ids.add(id);
        }

        const nodes = [];
        const nodeById = new Map();
        for (const id of ids) {
            const inf = index.nodes.get(id);
            if (!inf) continue;
            const n = this._makeNode(id, inf, {});
            n.showLabel = true;
            nodes.push(n);
            nodeById.set(id, n);
        }

        const linkMap = new Map();
        const ok2 = await this._forEachQuad(quads, token, q => {
            const s = val(q.subject);
            const p = val(q.predicate);
            const o = q.object;
            if (!s || !p || !o || isLiteral(o)) return;
            const ov = val(o);
            if (!ov || p === RDFS_LABEL) return;
            if (!ids.has(s) || !ids.has(ov)) return;

            const key = s + '\u0000' + ov;
            let l = linkMap.get(key);
            if (!l) {
                linkMap.set(key, { source: s, target: ov, iri: p, count: 1, multi: false });
            } else {
                l.count++;
                if (l.iri !== p) l.multi = true;
            }
        });

        if (!ok2) return null;

        let links = [...linkMap.values()];
        if (links.length > this._maxLinks) {
            links.sort((a, b) => b.count - a.count);
            links.length = this._maxLinks;
        }

        for (const l of links) l.label = this._linkLabel(l, index, false);
        return { nodes, links, mode: 'focus', focusId: focus };
    }

    _linkLabel(l, index, clusterMode) {
        const predLabel = index.nodes.get(l.iri)?.l;
        const base = predLabel || curie(l.iri, this._ctx);

        if (clusterMode) {
            if (l.multi || l.count > 1) return String(l.count);
            return base;
        }

        if (l.multi || l.count > 1) return `${base} ×${l.count}`;
        return base;
    }

    _makeNode(id, info, opts = {}) {
        const isCluster = !!opts.isCluster;
        const label = opts.label || info?.l || curie(id, this._ctx);
        const degree = info?.d || 0;
        const lit = info?.c || 0;
        const count = opts.count || 0;

        const massish = degree + lit + (info?.t ? 1 : 0);
        const r = isCluster
            ? clamp(13 + Math.sqrt(count || 1) * 2.1, 14, 52)
            : clamp(6 + Math.sqrt(massish) * 2.1, 6, 26);

        const colorKey = info?.t || opts.colorKey || id;
        const c = colorFor(colorKey, isCluster ? 62 : 54);

        return {
            id,
            label,
            rawLabel: info?.l || '',
            iri: opts.iri || id,
            type: info?.t || '',
            r,
            degree,
            lit,
            count,
            internal: opts.internal || 0,
            samples: opts.samples || null,
            isCluster,
            mass: Math.max(1, r / 7),
            color: c.fill,
            stroke: c.stroke,
            textColor: c.text,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            fx: 0,
            fy: 0,
            showLabel: true,
            _pinned: false
        };
    }

    _setView(view) {
        this._view = view;
        this._nodeById = new Map(view.nodes.map(n => [n.id, n]));

        view.nodes.forEach((n, i) => { n.i = i; });

        view.links = (view.links || []).map(l => {
            const s = this._nodeById.get(l.source);
            const t = this._nodeById.get(l.target);
            if (!s || !t || s === t) return null;
            return {
                source: s,
                target: t,
                iri: l.iri,
                count: l.count || 1,
                multi: !!l.multi,
                label: l.label || ''
            };
        }).filter(Boolean);

        this._applyLinkDistances();
        this._applyLabelBudget();
        this._renderView();
        this._initPositions();
        this._updateHud();

        this._alpha = 1;
        this._sleeping = false;
        this._wake();
    }

    _applyLinkDistances() {
        const view = this._view;
        if (!view) return;

        const userDist = this._num('link-dist', 0);

        for (const l of view.links) {
            const s = l.source;
            const t = l.target;
            const count = l.count || 1;
            const clusterBoost = (s.isCluster || t.isCluster) ? 1.3 : 1;
            const typeFactor = l.iri === RDF_TYPE ? 0.78 : 1;

            let dist;
            if (userDist > 0) {
                dist = userDist * typeFactor * clusterBoost;
            } else {
                const base = 30 + s.r + t.r + Math.log2(count + 1) * 16;
                dist = base * typeFactor * clusterBoost;
            }

            l.dist = clamp(dist, 36, 380);
            l.strength = clamp(0.025 + Math.log2(count + 1) * 0.012, 0.018, 0.08);
        }
    }

    _applyLabelBudget() {
        const view = this._view;
        if (!view) return;

        const labels = String(this.getAttribute('labels') || 'auto').toLowerCase();
        const nodes = view.nodes;

        if (labels === 'none') {
            nodes.forEach(n => n.showLabel = false);
        } else if (labels === 'all') {
            nodes.forEach(n => n.showLabel = true);
        } else {
            const budget = clamp(this._num('label-budget', 220), 30, 800);
            if (nodes.length <= budget) {
                nodes.forEach(n => n.showLabel = true);
            } else {
                const score = n =>
                    (n.isCluster ? 10000 : 0) +
                    n.r * 4 +
                    (n.degree || 0) +
                    (n.count || 0) * 0.1;

                const chosen = new Set(
                    nodes.slice()
                        .sort((a, b) => score(b) - score(a))
                        .slice(0, budget)
                        .map(n => n.id)
                );

                if (this._focusId) chosen.add(this._focusId);
                nodes.forEach(n => n.showLabel = chosen.has(n.id));
            }
        }

        const linkBudget = clamp(this._num('link-label-budget', 220), 0, 1000);
        view.showLinkLabels =
            labels !== 'none' &&
            view.links.length <= (labels === 'all' ? Math.min(800, linkBudget * 2) : linkBudget);
    }

    _mount() {
        if (this._wrap || typeof document === 'undefined') return;

        ensureStyle();

        this._arrowId = 'qg-arrow-' + Math.random().toString(36).slice(2);

        this._wrap = htmlEl('div', 'qg-wrap');
        this._wrap.style.height = this._num('height', 480) + 'px';

        this._svg = svgEl('svg');
        this._svg.setAttribute('class', 'qg-svg');
        this._svg.setAttribute('width', '100%');
        this._svg.setAttribute('height', '100%');

        const defs = svgEl('defs');
        const marker = svgEl('marker');
        marker.setAttribute('id', this._arrowId);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '5');
        marker.setAttribute('markerHeight', '5');
        marker.setAttribute('orient', 'auto-start-reverse');

        const arrowPath = svgEl('path');
        arrowPath.setAttribute('d', 'M2 1L8 5L2 9');
        arrowPath.setAttribute('fill', 'none');
        arrowPath.setAttribute('stroke', '#94a3b8');
        arrowPath.setAttribute('stroke-width', '1.5');
        arrowPath.setAttribute('stroke-linecap', 'round');

        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        this._svg.appendChild(defs);

        this._gLinks = svgEl('g');
        this._gLinkLabels = svgEl('g');
        this._gNodes = svgEl('g');
        this._svg.appendChild(this._gLinks);
        this._svg.appendChild(this._gLinkLabels);
        this._svg.appendChild(this._gNodes);

        this._hud = htmlEl('div', 'qg-hud');
        this._statEl = htmlEl('span');
        this._energyWrap = htmlEl('div', 'qg-energy');
        this._ebar = htmlEl('div', 'qg-ebar');
        this._energyWrap.appendChild(this._ebar);
        this._hud.appendChild(this._statEl);
        this._hud.appendChild(this._energyWrap);

        this._wrap.appendChild(this._svg);
        this._wrap.appendChild(this._hud);
        this.appendChild(this._wrap);

        this._svg.addEventListener('pointermove', e => this._dragMove(e));
        this._svg.addEventListener('pointerup', e => this._dragEnd(e));
        this._svg.addEventListener('pointercancel', e => this._dragEnd(e));

        if (typeof ResizeObserver !== 'undefined') {
            this._ro = new ResizeObserver(() => this._resize());
            this._ro.observe(this._wrap);
        }

        this._resize();
    }

    _resize() {
        if (!this._wrap) return;
        const rect = this._wrap.getBoundingClientRect();
        this._W = Math.max(200, rect.width || 600);
        this._H = Math.max(160, rect.height || 480);
        if (this._view) this._restart();
    }

    _renderView() {
        if (!this._svg) return;

        this._gLinks.textContent = '';
        this._gLinkLabels.textContent = '';
        this._gNodes.textContent = '';

        const view = this._view;
        if (!view || !view.nodes.length) {
            const t = svgEl('text');
            t.setAttribute('class', 'qg-empty');
            t.setAttribute('x', '50%');
            t.setAttribute('y', '50%');
            t.textContent = view?.notice || 'No visible nodes';
            this._gNodes.appendChild(t);
            return;
        }

        for (const l of view.links) {
            const line = svgEl('line');
            line.setAttribute('class', 'qg-link');

            const color = (l.source.isCluster || l.target.isCluster)
                ? '#94a3b8'
                : linkColor(l.iri || l.source.type || l.source.id);

            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', clamp(0.8 + Math.log2((l.count || 1) + 1) * 0.7, 0.8, 3.2));
            line.setAttribute('stroke-opacity', '0.55');
            line.setAttribute('marker-end', `url(#${this._arrowId})`);

            this._gLinks.appendChild(line);
            l._el = line;

            if (view.showLinkLabels && l.label) {
                const text = svgEl('text');
                text.setAttribute('class', 'qg-link-label');
                text.textContent = shortLabel(l.label, 24);
                this._gLinkLabels.appendChild(text);
                l._labelEl = text;
            }
        }

        for (const n of view.nodes) {
            const g = svgEl('g');
            g.setAttribute('class', 'qg-node' + (n.isCluster ? ' qg-cluster' : ''));
            g.dataset.id = n.id;
            g.style.cursor = 'grab';

            const circle = svgEl('circle');
            circle.setAttribute('r', n.r);
            circle.setAttribute('fill', n.color);
            circle.setAttribute('stroke', n.stroke);
            circle.setAttribute('stroke-width', n.isCluster ? 2.5 : 2);
            circle.setAttribute('fill-opacity', n.isCluster ? 0.82 : 0.9);
            g.appendChild(circle);

            const title = svgEl('title');
            let titleText = `${n.label}\n${n.iri || n.id}`;
            if (n.count) titleText += `\n${n.count} nodes`;
            if (n.internal) titleText += `\n${n.internal} internal links`;
            title.textContent = titleText;
            g.appendChild(title);

            if (n.isCluster) {
                const count = svgEl('text');
                count.setAttribute('class', 'qg-count');
                count.textContent = n.count >= 1000
                    ? (n.count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
                    : String(n.count || 0);
                g.appendChild(count);

                if (n.showLabel) {
                    const label = svgEl('text');
                    label.setAttribute('class', 'qg-text');
                    label.setAttribute('dy', n.r + 11);
                    label.textContent = shortLabel(n.label, 28);
                    g.appendChild(label);
                }
            } else if (n.showLabel) {
                const label = svgEl('text');
                label.setAttribute('class', 'qg-text');
                label.setAttribute('dy', -n.r - 5);
                label.setAttribute('fill', n.textColor);
                label.textContent = shortLabel(n.label, 34);
                g.appendChild(label);
            }

            g.addEventListener('pointerdown', e => this._dragStart(e, n));
            g.addEventListener('dblclick', e => this._dblclickNode(e, n));

            this._gNodes.appendChild(g);
            n._el = g;
            n._circle = circle;
        }

        this._applySelection();
    }

    _initPositions() {
        const view = this._view;
        if (!view) return;

        const W = this._W || 600;
        const H = this._H || 480;
        const cx = W / 2;
        const cy = H / 2;

        view.nodes.forEach((n, i) => {
            const h = hash(n.id || String(i));
            const angle = (h % 628) / 100;
            const ring = n.isCluster ? 0.26 : 0.34;
            const radius = Math.min(W, H) * ring * (0.35 + ((h >> 9) % 100) / 140);

            n.x = cx + Math.cos(angle) * radius + (((h >> 13) % 80) - 40);
            n.y = cy + Math.sin(angle) * radius + (((h >> 17) % 80) - 40);
            n.vx = 0;
            n.vy = 0;
        });

        const focusNode = this._focusId ? this._nodeById.get(this._focusId) : null;
        if (focusNode) {
            focusNode.x = cx;
            focusNode.y = cy;
        }
    }

    _updateHud() {
        if (!this._statEl) return;

        const v = this._view;
        if (!v) {
            this._statEl.textContent = 'idle';
            return;
        }

        const total = this._index?.nodes?.size ?? v.nodes.length;
        const focus = this._focusId ? ' · focus' : '';
        this._statEl.textContent =
            `${v.nodes.length}/${total} n · ${v.links.length} e · ${v.mode}${focus}`;
    }

    _setStatus(text) {
        if (this._statEl) this._statEl.textContent = text;
    }

    _restart() {
        if (!this._view) return;
        this._sleeping = false;
        this._alpha = Math.max(this._alpha, 0.45);
        this._wake();
    }

    _wake() {
        if (this._raf) return;
        this._raf = requestAnimationFrame(this._tick);
    }

    _tick() {
        this._raf = 0;

        const view = this._view;
        if (!view || this._sleeping) return;

        const nodes = view.nodes;
        const links = view.links;
        if (!nodes.length) {
            this._sleeping = true;
            return;
        }

        const W = this._W || 600;
        const H = this._H || 480;
        const alpha = this._alpha;
        const charge = -Math.abs(this._num('charge', 120));

        for (const n of nodes) {
            n.fx = 0;
            n.fy = 0;
        }

        const cell = Math.max(68, Math.sqrt((W * H) / Math.max(1, nodes.length)));
        const grid = new Map();

        for (const n of nodes) {
            const key = Math.floor(n.x / cell) + ':' + Math.floor(n.y / cell);
            let arr = grid.get(key);
            if (!arr) {
                arr = [];
                grid.set(key, arr);
            }
            arr.push(n);
        }

        // Local repulsion.
        for (const n of nodes) {
            const gx = Math.floor(n.x / cell);
            const gy = Math.floor(n.y / cell);

            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    const arr = grid.get((gx + dx) + ':' + (gy + dy));
                    if (!arr) continue;

                    for (const other of arr) {
                        if (other === n) continue;

                        let ox = other.x - n.x;
                        let oy = other.y - n.y;
                        let d2 = ox * ox + oy * oy;

                        const maxD = cell * 2.2;
                        if (d2 > maxD * maxD) continue;

                        if (d2 < 1) {
                            ox = (Math.random() - 0.5) * 2;
                            oy = (Math.random() - 0.5) * 2;
                            d2 = ox * ox + oy * oy || 1;
                        }

                        const d = Math.sqrt(d2);
                        const f = (charge * alpha) / d2;
                        n.fx += (ox / d) * f / n.mass;
                        n.fy += (oy / d) * f / n.mass;
                    }
                }
            }
        }

        // Link springs.
        for (const l of links) {
            const s = l.source;
            const t = l.target;
            if (!s || !t) continue;

            let dx = t.x - s.x;
            let dy = t.y - s.y;
            let d = Math.sqrt(dx * dx + dy * dy) || 1;

            const f = (d - l.dist) * l.strength * alpha;
            const ux = dx / d;
            const uy = dy / d;

            const ws = t.mass / (s.mass + t.mass);
            const wt = s.mass / (s.mass + t.mass);

            s.fx += ux * f * ws;
            s.fy += uy * f * ws;
            t.fx -= ux * f * wt;
            t.fy -= uy * f * wt;
        }

        // Centering.
        let cx = 0;
        let cy = 0;
        for (const n of nodes) {
            cx += n.x;
            cy += n.y;
        }
        cx /= nodes.length;
        cy /= nodes.length;

        const pullX = W / 2 - cx;
        const pullY = H / 2 - cy;
        const centerK = this._focusId ? 0.006 : 0.012;

        for (const n of nodes) {
            n.fx += pullX * centerK * alpha;
            n.fy += pullY * centerK * alpha;
        }

        // Focus gravity.
        if (this._focusId) {
            const f = this._nodeById.get(this._focusId);
            if (f) {
                f.fx += (W / 2 - f.x) * 0.06 * alpha;
                f.fy += (H / 2 - f.y) * 0.06 * alpha;
            }
        }

        // Integrate.
        let ke = 0;
        for (const n of nodes) {
            if (n._pinned) {
                n.vx = 0;
                n.vy = 0;
                continue;
            }

            n.vx = (n.vx + n.fx) * 0.80;
            n.vy = (n.vy + n.fy) * 0.80;

            const v = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            const maxV = 11;
            if (v > maxV) {
                n.vx = (n.vx / v) * maxV;
                n.vy = (n.vy / v) * maxV;
            }

            n.x += n.vx;
            n.y += n.vy;

            const pad = n.r + 4;
            n.x = Math.max(pad, Math.min(W - pad, n.x));
            n.y = Math.max(pad, Math.min(H - pad, n.y));

            ke += n.vx * n.vx + n.vy * n.vy;
        }

        this._alpha *= 0.986;
        this._collide(nodes, cell);

        // Clamp again after collision.
        for (const n of nodes) {
            if (n._pinned) continue;
            const pad = n.r + 4;
            n.x = Math.max(pad, Math.min(W - pad, n.x));
            n.y = Math.max(pad, Math.min(H - pad, n.y));
        }

        const energy = Math.min(1, Math.sqrt(ke / Math.max(1, nodes.length)) / 3.5);
        if (this._ebar) {
            this._ebar.style.width = Math.round(energy * 100) + '%';
            this._ebar.style.background =
                energy > 0.35 ? '#16a34a' :
                    energy > 0.10 ? '#d97706' :
                        '#94a3b8';
        }

        this._draw();

        if (this._alpha < 0.004 && !this._drag) {
            this._sleeping = true;
            if (this._ebar) this._ebar.style.width = '0%';
            return;
        }

        this._wake();
    }

    _collide(nodes, cell) {
        const grid = new Map();

        for (const n of nodes) {
            const key = Math.floor(n.x / cell) + ':' + Math.floor(n.y / cell);
            let arr = grid.get(key);
            if (!arr) {
                arr = [];
                grid.set(key, arr);
            }
            arr.push(n);
        }

        for (const n of nodes) {
            const gx = Math.floor(n.x / cell);
            const gy = Math.floor(n.y / cell);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const arr = grid.get((gx + dx) + ':' + (gy + dy));
                    if (!arr) continue;

                    for (const o of arr) {
                        if (o === n || n.i >= o.i) continue;

                        const min = n.r + o.r + 2;
                        let ox = o.x - n.x;
                        let oy = o.y - n.y;
                        let d2 = ox * ox + oy * oy;

                        if (d2 >= min * min) continue;

                        if (d2 < 0.01) {
                            ox = (Math.random() - 0.5) * 2;
                            oy = (Math.random() - 0.5) * 2;
                            d2 = ox * ox + oy * oy || 1;
                        }

                        const d = Math.sqrt(d2);
                        const push = (min - d) / d * 0.5;

                        if (!n._pinned) {
                            n.x -= ox * push;
                            n.y -= oy * push;
                        }
                        if (!o._pinned) {
                            o.x += ox * push;
                            o.y += oy * push;
                        }
                    }
                }
            }
        }
    }

    _draw() {
        const view = this._view;
        if (!view) return;

        for (const l of view.links) {
            const s = l.source;
            const t = l.target;
            if (!s || !t || !l._el) continue;

            let dx = t.x - s.x;
            let dy = t.y - s.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / d;
            const uy = dy / d;

            const x1 = s.x + ux * (s.r + 1);
            const y1 = s.y + uy * (s.r + 1);
            const x2 = t.x - ux * (t.r + 6);
            const y2 = t.y - uy * (t.r + 6);

            l._el.setAttribute('x1', x1.toFixed(1));
            l._el.setAttribute('y1', y1.toFixed(1));
            l._el.setAttribute('x2', x2.toFixed(1));
            l._el.setAttribute('y2', y2.toFixed(1));

            if (l._labelEl) {
                l._labelEl.setAttribute('x', ((x1 + x2) / 2).toFixed(1));
                l._labelEl.setAttribute('y', ((y1 + y2) / 2 - 5).toFixed(1));
            }
        }

        for (const n of view.nodes) {
            if (!n._el) continue;
            n._el.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
        }
    }

    _dragStart(e, n) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        e.preventDefault();

        this._drag = {
            node: n,
            id: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            moved: false
        };

        try {
            this._svg.setPointerCapture(e.pointerId);
        } catch {
            // Ignore.
        }

        n._pinned = true;
        if (n._el) n._el.style.cursor = 'grabbing';

        this._sleeping = false;
        this._alpha = Math.max(this._alpha, 0.35);
        this._wake();
    }

    _dragMove(e) {
        if (!this._drag || e.pointerId !== this._drag.id) return;

        const rect = this._svg.getBoundingClientRect();
        const n = this._drag.node;
        if (!n) return;

        n.x = e.clientX - rect.left;
        n.y = e.clientY - rect.top;
        n.vx = 0;
        n.vy = 0;

        const dx = e.clientX - this._drag.startX;
        const dy = e.clientY - this._drag.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._drag.moved = true;

        if (this._sleeping) {
            this._sleeping = false;
            this._alpha = Math.max(this._alpha, 0.2);
            this._wake();
        } else {
            this._alpha = Math.max(this._alpha, 0.12);
        }
    }

    _dragEnd(e) {
        if (!this._drag || e.pointerId !== this._drag.id) return;

        const n = this._drag.node;
        const moved = this._drag.moved;

        if (n) {
            n._pinned = false;
            if (n._el) n._el.style.cursor = 'grab';
            n.vx = (Math.random() - 0.5) * 0.4;
            n.vy = (Math.random() - 0.5) * 0.4;
        }

        this._drag = null;
        this._alpha = Math.max(this._alpha, 0.2);

        if (n && !moved) this._selectRendered(n);

        this._wake();
    }

    _dblclickNode(e, n) {
        e.stopPropagation();

        if (n.isCluster) {
            this.dispatchEvent(new CustomEvent('cluster-dblclick', {
                detail: n,
                bubbles: true,
                composed: true
            }));

            if (n.samples?.length) this.focus(n.samples[0]);
            return;
        }

        this.dispatchEvent(new CustomEvent('node-dblclick', {
            detail: n,
            bubbles: true,
            composed: true
        }));
    }

    _selectRendered(n) {
        this._selectedId = n.id;
        this._applySelection();

        if (n.isCluster) {
            this.dispatchEvent(new CustomEvent('cluster-click', {
                detail: n,
                bubbles: true,
                composed: true
            }));
        } else {
            this.dispatchEvent(new CustomEvent('node-click', {
                detail: n,
                bubbles: true,
                composed: true
            }));
        }
    }

    _applySelection() {
        const view = this._view;
        if (!view) return;

        for (const n of view.nodes) {
            if (!n._el) continue;
            n._el.classList.toggle('qg-selected', n.id === this._selectedId);
        }
    }
}

if (typeof window !== 'undefined' && window.customElements && !window.customElements.get('quad-graph')) {
    window.customElements.define('quad-graph', QuadGraph);
}

export default QuadGraph;