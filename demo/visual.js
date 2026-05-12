import { getIRIColor } from "../src/highlight.js"


const PALETTES = [
    ['#534AB7', '#AFA9EC'], ['#0F6E56', '#5DCAA5'], ['#993C1D', '#F0997B'],
    ['#993556', '#ED93B1'], ['#185FA5', '#85B7EB'], ['#3B6D11', '#97C459'],
    ['#854F0B', '#EF9F27'], ['#A32D2D', '#F09595']
];
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
const SVG_NS = 'http://www.w3.org/2000/svg';

function curie(iri, ctx) {
    if (!iri || typeof iri !== 'string') return iri;
    if (ctx) {
        for (const [pfx, ns] of Object.entries(ctx)) {
            if (iri.startsWith(ns)) return pfx + ':' + iri.slice(ns.length);
        }
    }
    const m = iri.match(/[#\/:]([^#\/:]+)$/);
    return m ? m[1] : iri;
}

function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++)h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h; }

class RdfGraph extends HTMLElement {
    static get observedAttributes() { return ['height', 'charge', 'link-dist']; }
    constructor() {
        super();
        this._quads = []; this._ctx = {}; this._nodes = []; this._links = [];
        this._sim = null; this._raf = null; this._alpha = 0; this._sleeping = false;
        this._drag = null;
        // Reusable objects to prevent GC
        this._grid = new Map();
        this._gridKeyBuffer = '';
        this._chargeCache = -120;
        this._linkDistCache = 180;
        this._transformBuffer = '';
        this._colorBuffer = '';
        this._gridArrays = new Map(); // Reuse grid cell arrays
    }
    connectedCallback() { this._build(); }
    attributeChangedCallback() { if (this._svg) this._restart(); }

    set quads(q) { this._quads = q || []; this._build(); }
    set context(c) { this._ctx = c || {}; this._build(); }

    _build() {
        // --- parse quads ---
        const nodeMap = new Map();
        const typeMap = new Map();
        const literalSize = new Map();
        const nodeLabels = new Map();
        const linkLabels = new Map();
        const links = [];

        for (const q of this._quads) {
            if (!q || q.termType !== 'Quad') continue;
            const s = q.subject.value, p = q.predicate.value, o = q.object;
            if (!nodeMap.has(s)) nodeMap.set(s, { id: s, size: 10, r: 10 });

            // Collect rdfs:label for nodes (last wins)
            if (p === RDFS_LABEL && o.termType === 'Literal') {
                nodeLabels.set(s, o.value);
            }
            // Track all predicates for potential labeling
            if (!linkLabels.has(p)) {
                linkLabels.set(p, null);
            }

            if (p === RDF_TYPE && o.termType === 'NamedNode') {
                typeMap.set(s, o.value);
                if (!nodeMap.has(o.value)) nodeMap.set(o.value, { id: o.value, size: 8, r: 8 });
                links.push({ source: s, target: o.value, iri: p });
            } else if (o.termType === 'NamedNode') {
                if (!nodeMap.has(o.value)) nodeMap.set(o.value, { id: o.value, size: 8, r: 8 });
                links.push({ source: s, target: o.value, iri: p });
            } else if (o.termType === 'Literal') {
                const cur = literalSize.get(s) || 0;
                literalSize.set(s, cur + 1);
            }
        }

        // Second pass to collect predicate labels
        for (const q of this._quads) {
            if (!q || q.termType !== 'Quad') continue;
            const s = q.subject.value, p = q.predicate.value, o = q.object;
            if (p === RDFS_LABEL && o.termType === 'Literal' && linkLabels.has(s)) {
                linkLabels.set(s, o.value);
            }
        }
        for (const [id, cnt] of literalSize) {
            const n = nodeMap.get(id);
            if (n) n.size = Math.min(10 + cnt * 3, 26);
        }

        // assign colors by type
        const typeColors = new Map();
        let ci = 0;
        for (const [, t] of typeMap) {
            if (!typeColors.has(t)) typeColors.set(t, PALETTES[ci++ % PALETTES.length]);
        }
        for (const [id, n] of nodeMap) {
            const t = typeMap.get(id);
            n.color = t ? typeColors.get(t) : PALETTES[7];
            n.r = n.size;
        }

        // Assign labels to links (prefer rdfs:label, fallback to CURIE)
        for (const link of links) {
            const predicateLabel = linkLabels.get(link.iri);
            link.label = predicateLabel || curie(link.iri, this._ctx);
        }

        this._types = typeMap;
        this._nodes = [...nodeMap.values()];
        this._links = links;
        this._typeColors = typeColors;
        this._nodeLabels = nodeLabels;

        // Phase 2: sparse adjacency (O(degree) neighbour queries)
        this._buildSparseAdjacency();
        this._renderSvg();
        this._initSim();

    }

    _renderSvg() {
        this.innerHTML = '';
        const h = parseInt(this.getAttribute('height') || '480');
        const wrap = document.createElement('div');
        wrap.className = 'rdf-wrap';
        wrap.style.height = h + 'px';

        const hud = document.createElement('div');
        hud.className = 'rdf-hud';
        this._statEl = document.createElement('span');
        this._statEl.textContent = this._nodes.length + 'n · ' + this._links.length + 'e';
        const energyWrap = document.createElement('div');
        energyWrap.className = 'rdf-energy';
        this._ebar = document.createElement('div');
        this._ebar.className = 'rdf-ebar';
        this._ebar.style.width = '100%';
        energyWrap.appendChild(this._ebar);
        hud.appendChild(this._statEl);
        hud.appendChild(energyWrap);
        wrap.appendChild(hud);

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');

        const defs = document.createElementNS(SVG_NS, 'defs');
        // arrowhead per color
        const usedColors = new Set([...this._typeColors.values()].map(p => p[0]));
        usedColors.add('#888');
        for (const c of usedColors) {
            const mk = document.createElementNS(SVG_NS, 'marker');
            const mid = 'arr' + hashStr(c);
            mk.setAttribute('id', mid);
            mk.setAttribute('viewBox', '0 0 10 10');
            mk.setAttribute('refX', '9'); mk.setAttribute('refY', '5');
            mk.setAttribute('markerWidth', '5'); mk.setAttribute('markerHeight', '5');
            mk.setAttribute('orient', 'auto-start-reverse');
            const mp = document.createElementNS(SVG_NS, 'path');
            mp.setAttribute('d', 'M2 1L8 5L2 9');
            mp.setAttribute('fill', 'none'); mp.setAttribute('stroke', 'gray');
            mp.setAttribute('stroke-width', '1.5'); mp.setAttribute('stroke-linecap', 'round');
            mk.appendChild(mp); defs.appendChild(mk);
        }
        svg.appendChild(defs);

        this._gLinks = document.createElementNS(SVG_NS, 'g');
        this._gLinkLabels = document.createElementNS(SVG_NS, 'g');
        this._gNodes = document.createElementNS(SVG_NS, 'g');

        // build link elements
        this._linkEls = this._links.map(l => {
            const line = document.createElementNS(SVG_NS, 'line');
            const sc = this._nodeById(l.source);
            const c = sc && sc.color ? sc.color[0] : '#888';
            const mid = 'arr' + hashStr(c);

            line.setAttribute('stroke', getIRIColor(l?.iri || ''));
            line.setAttribute('stroke-width', '0.8');
            line.setAttribute('stroke-opacity', '0.55');
            line.setAttribute('marker-end', 'url(#' + mid + ')');
            this._gLinks.appendChild(line);
            if (l.label) {
                const lt = document.createElementNS(SVG_NS, 'text');
                lt.setAttribute('font-size', '8');
                lt.setAttribute('fill', getIRIColor(l?.iri || ''));
                lt.setAttribute('text-anchor', 'middle');
                lt.setAttribute('dominant-baseline', 'central');
                lt.setAttribute('pointer-events', 'none');
                lt.setAttribute('opacity', '0.7');
                lt.textContent = l.label;

                this._gLinkLabels.appendChild(lt);
                l._labelEl = lt;
            }
            l._el = line;
            return line;
        });

        // build node elements
        this._nodeElMap = new Map();
        for (const n of this._nodes) {
            let color = getIRIColor(n?.id)
            let typeColor = getIRIColor(this._types.get(n?.id) || n?.id)
            const g = document.createElementNS(SVG_NS, 'g');
            g.style.cursor = 'grab';
            const c = document.createElementNS(SVG_NS, 'circle');
            c.setAttribute('r', n.r);
            c.setAttribute('fill', color);
            c.setAttribute('stroke', typeColor);
            c.setAttribute('stroke-width', '2');
            c.setAttribute('fill-opacity', '0.85');
            const t = document.createElementNS(SVG_NS, 'text');
            t.setAttribute('font-size', '8');
            t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', getIRIColor(n?.id));
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('dominant-baseline', 'central');
            t.setAttribute('dy', -n.r - 10);
            t.setAttribute('pointer-events', 'none');
            t.setAttribute('opacity', '0.75');
            // Use rdfs:label if available, fallback to CURIE
            const nodeLabel = this._nodeLabels.get(n.id);
            t.textContent = nodeLabel || curie(n.id, this._ctx);
            g.appendChild(c); g.appendChild(t);
            this._gNodes.appendChild(g);
            this._nodeElMap.set(n.id, g);
            n._el = g; n._c = c;
            // drag events
            g.addEventListener('pointerdown', e => this._dragStart(e, n));
        }

        svg.appendChild(this._gLinks);
        svg.appendChild(this._gLinkLabels);
        svg.appendChild(this._gNodes);
        svg.addEventListener('pointermove', e => this._dragMove(e));
        svg.addEventListener('pointerup', e => this._dragEnd(e));
        svg.addEventListener('pointerleave', e => this._dragEnd(e));
        wrap.appendChild(svg);
        this.appendChild(wrap);
        this._svg = svg; this._wrap = wrap;
    }

    _nodeById(id) { return this._nodes.find(n => n.id === id); }

    _initSim() {
        const W = this._wrap.clientWidth || 600;
        const H = this._wrap.clientHeight || 480;
        this._W = W; this._H = H;

        // Phase 3+4: structured initial positions (degree-clustering → spectral diffusion)
        this._applyDegreeClustering();
        this._spectralInit();

        for (const n of this._nodes) {
            n.vx = n.vx || 0; n.vy = n.vy || 0;
            n.mass = Math.max(1, n.size / 8);
        }
        this._alpha = 1; this._sleeping = false;
        this._wake();
    }

    _restart() { this._alpha = Math.max(this._alpha, 0.8); this._sleeping = false; this._wake(); }

    _wake() {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => { this._raf = null; this._tick(); });
    }

    _tick() {
        if (this._sleeping) { this._raf = null; return; }
        // Cache parsed values to avoid parseFloat every frame
        const charge = this._chargeCache !== parseFloat(this.getAttribute('charge') || -120)
            ? (this._chargeCache = parseFloat(this.getAttribute('charge') || -120))
            : this._chargeCache;
        const ld = this._linkDistCache !== parseFloat(this.getAttribute('link-dist') || 180)
            ? (this._linkDistCache = parseFloat(this.getAttribute('link-dist') || 180))
            : this._linkDistCache;
        const nodes = this._nodes, links = this._links;
        const W = this._W, H = this._H;
        const alpha = this._alpha, decay = 0.985;

        // Reset forces
        for (const n of nodes) {
            n.fx = 0;
            n.fy = 0;
        }

        // Optimized repulsion using grid-based approximation O(n log n)
        const gridSize = Math.max(50, Math.sqrt(W * H / nodes.length));
        const grid = this._grid;
        // Clear unused grid cells to prevent memory leaks
        for (const [key, cell] of grid) {
            if (cell.length === 0) {
                grid.delete(key);
            }
        }

        // Assign nodes to grid cells - reuse arrays to prevent GC
        const invGridSize = 1 / gridSize; // Precompute division
        for (const n of nodes) {
            const gx = (n.x * invGridSize) | 0; // Bitwise floor is faster
            const gy = (n.y * invGridSize) | 0;
            // Reuse string concatenation buffer
            this._gridKeyBuffer = gx + ',' + gy;
            let cell = grid.get(this._gridKeyBuffer);
            if (!cell) {
                // Try to reuse existing array from pool
                cell = this._gridArrays.get(this._gridKeyBuffer);
                if (!cell) {
                    cell = []; // Create new array only if no reusable one
                    this._gridArrays.set(this._gridKeyBuffer, cell);
                }
                grid.set(this._gridKeyBuffer, cell);
            }
            cell.length = 0; // Clear array instead of creating new one
            cell.push(n);
        }

        // Calculate repulsion forces using grid optimization
        for (const n of nodes) {
            const gx = (n.x * invGridSize) | 0; // Reuse precomputed division
            const gy = (n.y * invGridSize) | 0;

            // Check neighboring cells (3x3 grid around current cell)
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    // Reuse string concatenation buffer
                    this._gridKeyBuffer = (gx + dx) + ',' + (gy + dy);
                    const cellNodes = grid.get(this._gridKeyBuffer);
                    if (!cellNodes) continue;

                    for (const other of cellNodes) {
                        if (n === other) continue;

                        let deltaX = other.x - n.x;
                        let deltaY = other.y - n.y;
                        const d2 = deltaX * deltaX + deltaY * deltaY || 1;
                        const d = Math.sqrt(d2);
                        // Phase 4: degree-adaptive charge (high-degree hubs push harder)
                        const adaptiveCharge = charge * (1 + this._getDegree(n.id) * 0.1);

                        // Apply Barnes-Hut approximation for distant nodes
                        if (d > gridSize * 2) {
                            const cellForce = adaptiveCharge * alpha / (d2 * cellNodes.length);
                            n.fx -= (deltaX / d) * cellForce / n.mass;
                            n.fy -= (deltaY / d) * cellForce / n.mass;
                        } else {
                            const f = adaptiveCharge * alpha / d2;
                            n.fx -= (deltaX / d) * f / n.mass;
                            n.fy -= (deltaY / d) * f / n.mass;
                        }
                    }
                }
            }
        }
        // link attraction – uses adaptive link-distance per node pair
        for (const l of links) {
            const s = typeof l.source === 'object' ? l.source : this._nodeById(l.source);
            const t = typeof l.target === 'object' ? l.target : this._nodeById(l.target);
            if (!s || !t) continue;
            l.source = s; l.target = t;
            const dx = t.x - s.x, dy = t.y - s.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            // Phase 4 adaptive: average link-dist for this pair
            const adaptiveLd = (ld * (1 - this._getLocalDensity(s.id) * 0.2) +
                ld * (1 - this._getLocalDensity(t.id) * 0.2)) * 0.5;
            const f = (d - adaptiveLd) * 0.02 * alpha;
            const nx = dx / d, ny = dy / d;
            s.fx += nx * f / s.mass;
            s.fy += ny * f / s.mass;
            t.fx -= nx * f / t.mass;
            t.fy -= ny * f / t.mass;
        }
        // gentler centering
        let cx = 0, cy = 0;
        for (const n of nodes) { cx += n.x; cy += n.y; }
        cx /= nodes.length || 1; cy /= nodes.length || 1;
        const gcx = W / 2 - cx, gcy = H / 2 - cy;
        for (const n of nodes) {
            n.fx += (gcx) * 0.008 * alpha;
            n.fy += (gcy) * 0.008 * alpha;
        }
        // integrate + bounds
        let ke = 0;
        for (const n of nodes) {
            if (n._pinned) { n.vx = 0; n.vy = 0; n.fx = 0; n.fy = 0; continue; }
            // Apply forces to velocity with better damping
            n.vx = (n.vx + n.fx) * 0.85;
            n.vy = (n.vy + n.fy) * 0.85;

            // Limit maximum velocity to prevent jitter
            const maxV = 8;
            const v = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            if (v > maxV) {
                n.vx = (n.vx / v) * maxV;
                n.vy = (n.vy / v) * maxV;
            }

            n.x += n.vx; n.y += n.vy;
            n.x = Math.max(n.r + 5, Math.min(W - n.r - 5, n.x));
            n.y = Math.max(n.r + 5, Math.min(H - n.r - 5, n.y));
            ke += n.vx * n.vx + n.vy * n.vy;
        }
        this._alpha *= decay;
        const energy = Math.min(1, Math.sqrt(ke / Math.max(nodes.length, 1)) / 3);

        // HUD - reuse color buffer
        const pct = Math.round(energy * 100);
        if (energy > 0.3) {
            this._colorBuffer = '#1D9E75';
        } else if (energy > 0.08) {
            this._colorBuffer = '#BA7517';
        } else {
            this._colorBuffer = '#888780';
        }
        this._ebar.style.width = pct + '%';
        this._ebar.style.background = this._colorBuffer;

        this._draw();

        if (this._alpha < 0.002 && !this._drag) {
            this._sleeping = true;
            this._ebar.style.width = '0%';
            this._raf = null; return;
        }
        this._raf = requestAnimationFrame(() => { this._raf = null; this._tick(); });
    }

    _draw() {
        // Batch DOM updates and reuse buffers
        for (const l of this._links) {
            const s = l.source, t = l.target;
            if (!s || !t || typeof s !== 'object') continue;
            const dx = t.x - s.x, dy = t.y - s.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / d, ny = dy / d;
            const x1 = s.x + nx * (s.r + 1);
            const y1 = s.y + ny * (s.r + 1);
            const x2 = t.x - nx * (t.r + 6);
            const y2 = t.y - ny * (t.r + 6);
            const el = l._el;
            el.setAttribute('x1', x1); el.setAttribute('y1', y1);
            el.setAttribute('x2', x2); el.setAttribute('y2', y2);
            if (l._labelEl) {
                l._labelEl.setAttribute('x', (x1 + x2) * 0.5);
                l._labelEl.setAttribute('y', (y1 + y2) * 0.5 - 4);
            }
        }
        // Reuse transform string buffer
        for (const n of this._nodes) {
            if (!n._el) continue;
            this._transformBuffer = 'translate(' + n.x + ',' + n.y + ')';
            n._el.setAttribute('transform', this._transformBuffer);
        }
    }

    // ─── Phase 2: Sparse adjacency ──────────────────────────────────────────
    _buildSparseAdjacency() {
        this._adjacency = new Map();
        this._degrees = new Map();
        for (const n of this._nodes) {
            this._adjacency.set(n.id, new Set());
            this._degrees.set(n.id, 0);
        }
        for (const l of this._links) {
            const sid = typeof l.source === 'object' ? l.source.id : l.source;
            const tid = typeof l.target === 'object' ? l.target.id : l.target;
            if (this._adjacency.has(sid)) this._adjacency.get(sid).add(tid);
            if (this._adjacency.has(tid)) this._adjacency.get(tid).add(sid);
            this._degrees.set(sid, (this._degrees.get(sid) || 0) + 1);
            this._degrees.set(tid, (this._degrees.get(tid) || 0) + 1);
        }
    }

    _getNeighbors(nodeId) { return this._adjacency?.get(nodeId) || new Set(); }
    _getDegree(nodeId) { return this._degrees?.get(nodeId) || 0; }

    _getLocalDensity(nodeId, radius = 100) {
        const neighbors = this._getNeighbors(nodeId);
        if (!neighbors.size) return 0;
        const node = this._nodes.find(n => n.id === nodeId);
        if (!node) return 0;
        let count = 0;
        const r2 = radius * radius;
        for (const nid of neighbors) {
            const nb = this._nodes.find(n => n.id === nid);
            if (nb) {
                const dx = nb.x - node.x, dy = nb.y - node.y;
                if (dx * dx + dy * dy < r2) count++;
            }
        }
        return count / neighbors.size;
    }

    // ─── Phase 3: Degree-based initial clustering ────────────────────────────
    _applyDegreeClustering() {
        const W = this._W, H = this._H;
        const degreeGroups = new Map();
        for (const n of this._nodes) {
            const g = Math.floor(Math.log2(this._getDegree(n.id) + 1));
            if (!degreeGroups.has(g)) degreeGroups.set(g, []);
            degreeGroups.get(g).push(n);
        }
        const groupCount = degreeGroups.size;
        let gi = 0;
        for (const nodes of degreeGroups.values()) {
            const angle = (gi / groupCount) * 2 * Math.PI;
            const radius = Math.min(W, H) * 0.3;
            const gx = W / 2 + Math.cos(angle) * radius;
            const gy = H / 2 + Math.sin(angle) * radius;
            for (const n of nodes) {
                n.x = gx + (Math.random() - 0.5) * 50;
                n.y = gy + (Math.random() - 0.5) * 50;
            }
            gi++;
        }
    }

    // ─── Phase 1: Spectral-inspired diffusion layout ─────────────────────────
    _spectralInit() {
        const positions = new Map();
        for (const n of this._nodes) positions.set(n.id, { x: n.x, y: n.y });

        // 3-step Laplacian diffusion (power-iteration approximation)
        for (let step = 0; step < 3; step++) {
            const next = new Map();
            for (const [id, neighbors] of this._adjacency) {
                if (!neighbors.size) { next.set(id, positions.get(id)); continue; }
                let sx = 0, sy = 0;
                for (const nid of neighbors) {
                    const p = positions.get(nid);
                    if (p) { sx += p.x; sy += p.y; }
                }
                const cur = positions.get(id);
                next.set(id, {
                    x: cur.x * 0.65 + (sx / neighbors.size) * 0.35,
                    y: cur.y * 0.65 + (sy / neighbors.size) * 0.35,
                });
            }
            for (const [id, pos] of next) positions.set(id, pos);
        }

        for (const n of this._nodes) {
            const p = positions.get(n.id);
            if (p) { n.x = p.x; n.y = p.y; }
        }
    }

    _dragStart(e, n) {
        e.preventDefault();
        this._drag = { node: n, id: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false };
        this._svg.setPointerCapture(e.pointerId);
        n._pinned = true;
        n._el.style.cursor = 'grabbing';
        // REVIVE sim on drag
        this._sleeping = false;
        this._alpha = Math.max(this._alpha, 0.5);
        this._wake();
    }
    _dragMove(e) {
        if (!this._drag || e.pointerId !== this._drag.id) return;
        const r = this._svg.getBoundingClientRect();
        const sx = this._svg.viewBox?.baseVal?.width || this._W;
        const sy = this._svg.viewBox?.baseVal?.height || this._H;
        const scaleX = (sx || this._W) / r.width;
        const scaleY = (sy || this._H) / r.height;
        const n = this._drag.node;
        n.x = (e.clientX - r.left) * scaleX;
        n.y = (e.clientY - r.top) * scaleY;
        n.vx = 0; n.vy = 0;
        // Track if actually moved (more than 3 pixels = drag, not click)
        const dx = e.clientX - this._drag.startX;
        const dy = e.clientY - this._drag.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            this._drag.moved = true;
        }
        if (this._sleeping) { this._sleeping = false; this._alpha = 0.3; this._wake(); }
    }
    _dragEnd(e) {
        if (!this._drag) return;
        const node = this._drag.node;
        const wasMoved = this._drag.moved;
        node._pinned = false;
        node._el.style.cursor = 'grab';
        // smaller thermal kick on release for more stability
        node.vx = (Math.random() - .5) * 0.5;
        node.vy = (Math.random() - .5) * 0.5;
        this._alpha = Math.max(this._alpha, 0.25);
        this._drag = null;
        // If not moved significantly, treat as click
        if (!wasMoved) {
            // console.log(node.id);
            this.dispatchEvent(new CustomEvent('node-click', { detail: node.id, bubbles: true }));
        }
        this._wake();
    }
}

if (window) {
    customElements.define('rdf-graph', RdfGraph);
}