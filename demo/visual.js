// RDF Graph Viewer Module
(() => {
    const PALETTES = [
        ['#534AB7', '#AFA9EC'], ['#0F6E56', '#5DCAA5'], ['#993C1D', '#F0997B'],
        ['#993556', '#ED93B1'], ['#185FA5', '#85B7EB'], ['#3B6D11', '#97C459'],
        ['#854F0B', '#EF9F27'], ['#A32D2D', '#F09595']
    ];
    const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
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
            const links = [];

            for (const q of this._quads) {
                if (!q || q.termType !== 'Quad') continue;
                const s = q.subject.value, p = q.predicate.value, o = q.object;
                if (!nodeMap.has(s)) nodeMap.set(s, { id: s, size: 10, r: 10 });
                if (p === RDF_TYPE && o.termType === 'NamedNode') {
                    typeMap.set(s, o.value);
                    if (!nodeMap.has(o.value)) nodeMap.set(o.value, { id: o.value, size: 8, r: 8 });
                    links.push({ source: s, target: o.value, label: curie(p, this._ctx) });
                } else if (o.termType === 'NamedNode') {
                    if (!nodeMap.has(o.value)) nodeMap.set(o.value, { id: o.value, size: 8, r: 8 });
                    links.push({ source: s, target: o.value, label: curie(p, this._ctx) });
                } else if (o.termType === 'Literal') {
                    const cur = literalSize.get(s) || 0;
                    literalSize.set(s, cur + 1);
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

            this._nodes = [...nodeMap.values()];
            this._links = links;
            this._typeColors = typeColors;
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
                mp.setAttribute('fill', 'none'); mp.setAttribute('stroke', c);
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
                line.setAttribute('stroke', c);
                line.setAttribute('stroke-width', '0.8');
                line.setAttribute('stroke-opacity', '0.55');
                line.setAttribute('marker-end', 'url(#' + mid + ')');
                this._gLinks.appendChild(line);
                if (l.label) {
                    const lt = document.createElementNS(SVG_NS, 'text');
                    lt.setAttribute('font-size', '8');
                    lt.setAttribute('fill', '#999');
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
                const g = document.createElementNS(SVG_NS, 'g');
                g.style.cursor = 'grab';
                const c = document.createElementNS(SVG_NS, 'circle');
                c.setAttribute('r', n.r);
                c.setAttribute('fill', n.color ? n.color[0] : '#888');
                c.setAttribute('stroke', n.color ? n.color[1] : '#aaa');
                c.setAttribute('stroke-width', '1.2');
                c.setAttribute('fill-opacity', '0.85');
                const t = document.createElementNS(SVG_NS, 'text');
                t.setAttribute('font-size', '8');
                t.setAttribute('fill', '#374151');
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'central');
                t.setAttribute('dy', n.r + 10);
                t.setAttribute('pointer-events', 'none');
                t.setAttribute('opacity', '0.75');
                t.textContent = curie(n.id, this._ctx);
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
            for (const n of this._nodes) {
                if (n.x == null) { n.x = W / 2 + (Math.random() - .5) * 200; n.y = H / 2 + (Math.random() - .5) * 200; }
                n.vx = n.vx || 0; n.vy = n.vy || 0;
                // Add mass proportional to node size (larger nodes = more mass)
                n.mass = Math.max(1, n.size / 8);
            }
            this._W = W; this._H = H;
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
            const charge = parseFloat(this.getAttribute('charge') || -120);
            const ld = parseFloat(this.getAttribute('link-dist') || 180);
            const nodes = this._nodes, links = this._links;
            const W = this._W, H = this._H;
            const alpha = this._alpha, decay = 0.985;

            // Reset forces
            for (const n of nodes) {
                n.fx = 0;
                n.fy = 0;
            }

            // repulsion O(n²) - small graphs only
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    let dx = b.x - a.x, dy = b.y - a.y;
                    const d2 = dx * dx + dy * dy || 1;
                    const f = charge * alpha / d2;
                    const d = Math.sqrt(d2) || 1;
                    dx /= d; dy /= d;
                    // Apply forces based on mass (F = ma, so a = F/m)
                    a.fx -= dx * f / a.mass;
                    a.fy -= dy * f / a.mass;
                    b.fx += dx * f / b.mass;
                    b.fy += dy * f / b.mass;
                }
            }
            // link attraction
            for (const l of links) {
                const s = typeof l.source === 'object' ? l.source : this._nodeById(l.source);
                const t = typeof l.target === 'object' ? l.target : this._nodeById(l.target);
                if (!s || !t) continue;
                l.source = s; l.target = t;
                const dx = t.x - s.x, dy = t.y - s.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                const f = (d - ld) * 0.02 * alpha;
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

            // HUD
            const pct = Math.round(energy * 100);
            const col = energy > 0.3 ? '#1D9E75' : energy > 0.08 ? '#BA7517' : '#888780';
            this._ebar.style.width = pct + '%';
            this._ebar.style.background = col;

            this._draw();

            if (this._alpha < 0.002 && !this._drag) {
                this._sleeping = true;
                this._ebar.style.width = '0%';
                this._raf = null; return;
            }
            this._raf = requestAnimationFrame(() => { this._raf = null; this._tick(); });
        }

        _draw() {
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
                    l._labelEl.setAttribute('x', (x1 + x2) / 2);
                    l._labelEl.setAttribute('y', (y1 + y2) / 2 - 4);
                }
            }
            for (const n of this._nodes) {
                if (!n._el) continue;
                n._el.setAttribute('transform', 'translate(' + n.x + ',' + n.y + ')');
            }
        }

        _dragStart(e, n) {
            e.preventDefault();
            this._drag = { node: n, id: e.pointerId };
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
            if (this._sleeping) { this._sleeping = false; this._alpha = 0.3; this._wake(); }
        }
        _dragEnd(e) {
            if (!this._drag) return;
            this._drag.node._pinned = false;
            this._drag.node._el.style.cursor = 'grab';
            // smaller thermal kick on release for more stability
            this._drag.node.vx = (Math.random() - .5) * 0.5;
            this._drag.node.vy = (Math.random() - .5) * 0.5;
            this._alpha = Math.max(this._alpha, 0.25);
            this._drag = null;
            this._wake();
        }
    }

    customElements.define('rdf-graph', RdfGraph);
})();
