//#region src/constants.js
var e = {
	"@vocab": "http://www.w3.org/2000/01/rdf-schema#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	sh: "http://www.w3.org/ns/shacl#",
	prov: "http://www.w3.org/ns/prov#"
}, t = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/, n = /^(`{3,}|~{3,})(.*)/, r = /^\[([^\]]+)\]\s*<([^>]+)>/, i = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/, a = /^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/, o = /^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/, s = /^\s*\{=(.*?)\}\s*$/, c = [
	["EMPHASIS", /[*__]+(.+?)[*__]+\s*\{([^}]+)\}/y],
	["CODE_SPAN_SINGLE", /`(.+?)`\s*\{([^}]+)\}/y],
	["CODE_SPAN_DOUBLE", /``(.+?)``\s*\{([^}]+)\}/y]
], l = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file):/, u = class {
	constructor(e) {
		this.id = e;
	}
	equals(e) {
		return !!e && this.termType === e.termType && this.value === e.value;
	}
}, d = class extends u {
	constructor(e) {
		super(e), this.termType = "NamedNode", this.value = e;
	}
}, f = class extends u {
	constructor(e) {
		super(e), this.termType = "Literal", this.value = "", this.language = "", this.datatype = null;
		let t = e.match(/^"([^"\\]*(?:\\.[^"\\]*)*)"(\^\^([^"]+))?(@([^-]+)(--(.+))?)?$/);
		t ? (this.value = t[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"), t[5] ? (this.language = t[5], this.datatype = new d("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")) : t[3] ? this.datatype = new d(t[3]) : this.datatype = new d("http://www.w3.org/2001/XMLSchema#string")) : (this.value = e.replace(/^"|"$/g, ""), this.datatype = new d("http://www.w3.org/2001/XMLSchema#string"));
	}
	equals(e) {
		return !!e && this.termType === e.termType && this.value === e.value && this.language === e.language && this.datatype?.value === e.datatype?.value;
	}
}, p = class extends u {
	constructor(e) {
		super(e || `b${Math.random().toString(36).slice(2, 11)}`), this.termType = "BlankNode", this.value = this.id;
	}
}, m = class extends u {
	constructor(e) {
		super(e), this.termType = "Variable", this.value = e;
	}
}, h = new class extends u {
	constructor() {
		super(""), this.termType = "DefaultGraph", this.value = "";
	}
	equals(e) {
		return !!e && this.termType === e.termType;
	}
}(), g = class extends u {
	constructor(e, t, n, r = h) {
		super(`${e.id}|${t.id}|${n.id}|${r.id}`), this.termType = "Quad", this.subject = e, this.predicate = t, this.object = n, this.graph = r;
	}
	equals(e) {
		return !!e && this.termType === e.termType && this.subject.equals(e.subject) && this.predicate.equals(e.predicate) && this.object.equals(e.object) && this.graph.equals(e.graph);
	}
	toJSON() {
		return {
			termType: this.termType,
			subject: this.subject.toJSON ? this.subject.toJSON() : {
				termType: this.subject.termType,
				value: this.subject.value
			},
			predicate: this.predicate.toJSON ? this.predicate.toJSON() : {
				termType: this.predicate.termType,
				value: this.predicate.value
			},
			object: this.object.toJSON ? this.object.toJSON() : {
				termType: this.object.termType,
				value: this.object.value
			},
			graph: this.graph.toJSON ? this.graph.toJSON() : {
				termType: this.graph.termType,
				value: this.graph.value
			}
		};
	}
}, _ = {
	boolean: "http://www.w3.org/2001/XMLSchema#boolean",
	integer: "http://www.w3.org/2001/XMLSchema#integer",
	double: "http://www.w3.org/2001/XMLSchema#double",
	string: "http://www.w3.org/2001/XMLSchema#string"
}, v = {
	namedNode: (e) => new d(e),
	blankNode: (e) => new p(e),
	literal: (e, t) => {
		let n = String(e).replace(/"/g, "\\\"");
		if (typeof t == "string") return new f(`"${n}"@${t.toLowerCase()}`);
		if (t !== void 0 && !("termType" in t)) {
			let e = t.direction ? `--${t.direction.toLowerCase()}` : "";
			return new f(`"${n}"@${t.language.toLowerCase()}${e}`);
		}
		let r = t ? t.value : "";
		return r === "" && (typeof e == "boolean" ? r = _.boolean : typeof e == "number" && (Number.isFinite(e) ? r = Number.isInteger(e) ? _.integer : _.double : (r = _.double, Number.isNaN(e) || (e = e > 0 ? "INF" : "-INF")))), r === "" || r === _.string ? new f(`"${n}"`) : new f(`"${n}"^^${r}`);
	},
	variable: (e) => new m(e),
	defaultGraph: () => h,
	quad: (e, t, n, r) => new g(e, t, n, r),
	triple: (e, t, n, r) => new g(e, t, n, r),
	fromTerm: (e) => {
		if (e instanceof u) return e;
		switch (e.termType) {
			case "NamedNode": return new d(e.value);
			case "BlankNode": return new p(e.value);
			case "Variable": return new m(e.value);
			case "DefaultGraph": return h;
			case "Literal":
				let t = String(e.value).replace(/"/g, "\\\"");
				return e.language ? new f(`"${t}"@${e.language}`) : e.datatype ? new f(`"${t}"^^${e.datatype.value || e.datatype}`) : new f(`"${t}"`);
			case "Quad": return v.fromQuad(e);
			default: throw Error(`Unexpected termType: ${e.termType}`);
		}
	},
	fromQuad: (e) => {
		if (e instanceof g) return e;
		if (e.termType !== "Quad") {
			if (e.subject && e.predicate && e.object) return new g(v.fromTerm(e.subject), v.fromTerm(e.predicate), v.fromTerm(e.object), v.fromTerm(e.graph || v.defaultGraph()));
			throw Error(`Unexpected termType: ${e.termType}`);
		}
		return new g(v.fromTerm(e.subject), v.fromTerm(e.predicate), v.fromTerm(e.object), v.fromTerm(e.graph));
	}
};
function y(e) {
	let t = 5381;
	for (let n = 0; n < e.length; n++) t = (t << 5) + t + e.charCodeAt(n);
	return Math.abs(t).toString(16).slice(0, 12);
}
var b = /* @__PURE__ */ new Map();
function x(e, n) {
	if (e == null) return null;
	let r = `${e}|${n["@vocab"] || ""}|${Object.keys(n).filter((e) => e !== "@vocab").sort().map((e) => `${e}:${n[e]}`).join(",")}`;
	if (b.has(r)) return b.get(r);
	let i = (typeof e == "string" ? e : typeof e == "object" && typeof e.value == "string" ? e.value : String(e)).trim(), a;
	if (i.match(t)) a = i;
	else if (i.includes(":")) {
		let [e, t] = i.split(":", 2);
		e && !n[e] && e !== "@vocab" && console.warn(`Undefined prefix "${e}" in IRI "${i}" - treating as literal`), a = n[e] ? n[e] + t : i;
	} else a = (n["@vocab"] || "") + i;
	return b.set(r, a), a;
}
function S(e, t) {
	if (!e || !l.test(e)) return e;
	if (t["@vocab"] && e.startsWith(t["@vocab"])) return e.substring(t["@vocab"].length);
	for (let [n, r] of Object.entries(t)) if (n !== "@vocab" && e.startsWith(r) && Object.entries(t).filter(([t, n]) => t !== "@vocab" && e.startsWith(n)).every(([e, t]) => r.length >= t.length || e === n && t.length === r.length)) return n + ":" + e.substring(r.length);
	return e;
}
var ee = {
	"=#": {
		kind: "fragment",
		extract: (e) => e.substring(2).replace("}", "")
	},
	"+#": {
		kind: "softFragment",
		extract: (e) => e.substring(2).replace("}", "")
	},
	"+": {
		kind: "object",
		extract: (e) => e.substring(1)
	},
	"^^": {
		kind: "datatype",
		extract: (e) => e.substring(2)
	},
	"@": {
		kind: "language",
		extract: (e) => e.substring(1)
	},
	".": {
		kind: "type",
		extract: (e) => e.substring(1)
	},
	"!": {
		kind: "property",
		form: "!",
		extract: (e) => e.substring(1)
	},
	"?": {
		kind: "property",
		form: "?",
		extract: (e) => e.substring(1)
	}
};
function C(e) {
	try {
		let t = String(e || "").trim().replace(/^\{|\}$/g, "").trim();
		if (!t) return {
			subject: null,
			object: null,
			types: [],
			predicates: [],
			datatype: null,
			language: null,
			entries: []
		};
		let n = {
			subject: null,
			object: null,
			types: [],
			predicates: [],
			datatype: null,
			language: null,
			entries: []
		}, r = /\S+/g, i;
		for (; (i = r.exec(t)) !== null;) {
			let e = i[0], t = 1 + i.index, r = t + e.length, a = n.entries.length, o = !1;
			if (e.startsWith("-") && e.length > 1 && (o = !0, e = e.slice(1)), e === "=") {
				o && console.warn("-= is not valid, subject declarations have no polarity"), n.subject = "RESET", n.entries.push({
					kind: "subjectReset",
					relRange: {
						start: t,
						end: r
					},
					raw: e
				});
				continue;
			}
			if (e.startsWith("=") && !e.startsWith("=#")) {
				o && console.warn("-= is not valid, subject declarations have no polarity");
				let i = e.substring(1);
				n.subject = i, n.entries.push({
					kind: "subject",
					iri: i,
					relRange: {
						start: t,
						end: r
					},
					raw: e
				});
				continue;
			}
			let s = !1;
			for (let [c, l] of Object.entries(ee)) if (e.startsWith(c)) {
				let c = {
					kind: l.kind,
					relRange: {
						start: t,
						end: r
					},
					raw: i[0]
				}, u = l.extract(e);
				l.kind === "fragment" ? (n.subject = `=#${u}`, c.fragment = u) : l.kind === "softFragment" ? (n.object = `#${u}`, c.fragment = u) : l.kind === "object" ? (o && (console.warn("-+ is not valid, object declarations have no polarity"), o = !1), n.object = u, c.iri = u) : l.kind === "datatype" ? (o && (console.warn("-^^ is not valid, datatype modifiers have no polarity"), o = !1), n.language || (n.datatype = u), c.datatype = u) : l.kind === "language" ? (o && (console.warn("-@ is not valid, language modifiers have no polarity"), o = !1), n.language = u, n.datatype = null, c.language = u) : l.kind === "type" ? (n.types.push({
					iri: u,
					entryIndex: a,
					remove: o
				}), c.iri = u, c.remove = o) : l.kind === "property" && (n.predicates.push({
					iri: u,
					form: l.form,
					entryIndex: a,
					remove: o
				}), c.iri = u, c.form = l.form, c.remove = o), n.entries.push(c), s = !0;
				break;
			}
			s || (n.predicates.push({
				iri: e,
				form: "",
				entryIndex: a,
				remove: o
			}), n.entries.push({
				kind: "property",
				iri: e,
				form: "",
				relRange: {
					start: t,
					end: r
				},
				raw: i[0],
				remove: o
			}));
		}
		return n;
	} catch (t) {
		return console.error(`Error parsing semantic block ${e}:`, t), {
			subject: null,
			object: null,
			types: [],
			predicates: [],
			datatype: null,
			language: null,
			entries: []
		};
	}
}
function w(e, t, n) {
	let r = n.termType === "Literal" ? JSON.stringify({
		t: "Literal",
		v: n.value,
		lang: n.language || "",
		dt: n.datatype?.value || ""
	}) : JSON.stringify({
		t: n.termType,
		v: n.value
	});
	return JSON.stringify([
		e.value,
		t.value,
		r
	]);
}
function T(e) {
	return e ? w(e.subject, e.predicate, e.object) : null;
}
function te(e, t, n, r, i) {
	return t ? i.literal(e, i.namedNode(x(t, r))) : n ? i.literal(e, n) : i.literal(e);
}
//#endregion
//#region src/shared.js
var E = /* @__PURE__ */ new Map();
function ne(e) {
	return E.has(e) || E.set(e, RegExp(`^(${e}{3,})`)), E.get(e);
}
function D(e, t, n, r, i) {
	let a = r + (r < e.length && e[r] === " " ? 1 : e.slice(r).match(/^\s+/)?.[0]?.length || 0);
	return {
		valueRange: [n + a, n + a + i],
		attrsRange: O(e, t, n)
	};
}
function O(e, t, n) {
	if (!t) return null;
	let r = e.lastIndexOf(t);
	return r >= 0 ? [n + r, n + r + t.length] : null;
}
function k(e, t, n, r = null, i = null, a = null, o = {}) {
	let s = {
		type: e,
		range: t,
		text: n,
		attrs: r,
		attrsRange: i,
		valueRange: a,
		...o
	};
	return Object.defineProperty(s, "_carriers", {
		enumerable: !1,
		writable: !0,
		value: null
	}), s;
}
function A(e, t, n, r, i, a, o, s = {}) {
	return {
		type: e,
		text: t,
		attrs: n,
		attrsRange: r,
		valueRange: i,
		range: a,
		pos: o,
		...s
	};
}
function re(e, t, n, r, i) {
	let a = i[4] || null, o = D(t, a, n, i[1].length + (i[2] ? i[2].length : 0), i[3].length);
	return k(e, [n, r - 1], i[3].trim(), a, o.attrsRange, o.valueRange, { indent: i[1].length });
}
var j = {}, ie = Object.freeze({
	predicates: [],
	types: [],
	subject: null
});
function M(e) {
	if (!e) return ie;
	let t = j[e];
	return t || (t = Object.freeze(C(e)), j[e] = t), t;
}
function ae(e, t) {
	if (!e.range || !t) return 0;
	let n = t.substring(e.range.start, e.range.end).match(/^(\s*)/), r = n ? n[1].length : 0;
	return Math.floor(r / 2);
}
function oe(e, t, n = null) {
	if (!t || !e) return "";
	let r = e.substring(t[0], t[1]);
	return n && (r = r.substring(0, n[0] - t[0]) + r.substring(n[1] - t[0])), r.trim();
}
function se(e) {
	let t = e.indexOf(" "), n = e.indexOf("{"), r = Math.min(t > -1 ? t : Infinity, n > -1 ? n : Infinity);
	return {
		lang: e.substring(0, r),
		attrsText: e.substring(r).match(/\{[^{}]*\}/)?.[0] || null
	};
}
function ce(e, t) {
	let n = 1, r = t + 1;
	for (; r < e.length && n > 0;) e[r] === "[" ? n++ : e[r] === "]" && n--, r++;
	return n > 0 ? null : r;
}
function le(e, t) {
	let n = null, r = t;
	if (e[r] === "(") {
		let t = e.indexOf(")", r);
		t !== -1 && (n = e.substring(r + 1, t), r = t + 1);
	}
	return {
		url: n,
		spanEnd: r
	};
}
function N(e, t, n) {
	let r = null, i = null, a = e.substring(t), o = a.match(/^\s+/), s = o ? o[0].length : 0;
	if (a[s] === "{") {
		let e = a.indexOf("}", s);
		if (e !== -1) {
			r = a.substring(s, e + 1);
			let o = n + t + s;
			i = [o, o + r.length], t += e + 1;
		}
	}
	return {
		attrs: r,
		attrsRange: i,
		finalSpanEnd: t
	};
}
function ue(e) {
	return e && !e.startsWith("=") ? {
		carrierType: "link",
		resourceIRI: e
	} : {
		carrierType: "span",
		resourceIRI: null
	};
}
function de(e, t, n) {
	let r = t + n + e[0].indexOf(e[1]), i = r + e[1].length, a = t + n + e[0].indexOf("{"), o = a + e[2].length + 2;
	return {
		valueRange: [r, i],
		attrsRange: [a, o],
		range: [t + n, o],
		pos: n + e[0].length
	};
}
function fe(e) {
	if (!e.text) return "";
	let t = e.text;
	e.attrsRange && (t = t.substring(0, e.attrsRange[0] - (e.range?.[0] || 0)) + t.substring(e.attrsRange[1] - (e.range?.[0] || 0)));
	let n = (e._carriers || []).filter((e) => e.attrsRange).map((t) => t.attrsRange.map((t) => t - (e.range?.[0] || 0))).filter(([e, n]) => e >= 0 && n <= t.length).sort((e, t) => t[0] - e[0]);
	for (let [e, r] of n) t = t.substring(0, e) + t.substring(r);
	switch (e.type) {
		case "heading": return t.replace(/^#+\s*/, "").trim();
		case "list": return t.replace(/^[-*+]\s*/, "").trim();
		case "blockquote": return t.replace(/^>\s*/, "").trim();
		default: return t.trim();
	}
}
function pe(e, t, n, r = null) {
	return {
		blockId: e.id,
		range: e.range,
		carrierType: e.carrierType,
		subject: t.value,
		predicate: n.value,
		context: e.context,
		polarity: r?.remove ? "-" : "+",
		value: e.text || ""
	};
}
function P(e, t, n) {
	if (!t) return null;
	let r = t.value, i = r.indexOf("#"), a = i > -1 ? r.slice(0, i) : r;
	return n.namedNode(a + "#" + e);
}
function F(e, t) {
	return e.subject ? e.subject === "RESET" ? (t.currentSubject = null, null) : e.subject.startsWith("=#") ? P(e.subject.substring(2), t.currentSubject, t.df) : t.df.namedNode(x(e.subject, t.ctx)) : null;
}
function me(e, t) {
	return e.object ? e.object.startsWith("#") ? P(e.object.substring(1), t.currentSubject, t.df) : t.df.namedNode(x(e.object, t.ctx)) : null;
}
function I(e) {
	return e ? e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : "";
}
function L(e) {
	return e?.termType === "Literal";
}
function R(e) {
	return e?.termType === "NamedNode";
}
function he(e) {
	return e?.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
}
function z(e, t) {
	if (!e) return null;
	let n = S(e, t);
	return n.includes(":") ? n.split(":")[0] : null;
}
function ge(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of e.values()) for (let e of r) {
		let r = z(e.subject.value, t);
		r && n.add(r);
		let i = z(e.predicate.value, t);
		if (i && n.add(i), R(e.object)) {
			let r = z(e.object.value, t);
			r && n.add(r);
		}
		if (e.object.datatype && e.object.datatype.value) {
			let r = z(e.object.datatype.value, t);
			r && n.add(r);
		}
	}
	return n;
}
function B(e, t, n, r, i = []) {
	let a = r(e, t);
	t.currentBlock = a, t.blockStack.push(a.id), i.forEach((n) => n(e, t)), n(e, t, e.type), t.blockStack.pop(), t.currentBlock = t.blockStack.length > 0 ? t.origin.blocks.get(t.blockStack[t.blockStack.length - 1]) : null;
}
function V(e) {
	return e.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
}
var _e = (e, t) => `[${e}] <${t}>\n`;
function ve(e, t) {
	let n = S(e.predicate.value, t);
	e.object.language ? n += ` @${e.object.language}` : e.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" && (n += ` ^^${S(e.object.datatype.value, t)}`);
	let r = e.object.value || e.object, i = typeof r == "string" ? r : String(r), a = e.object.datatype?.value || "";
	return i.includes("\n") ? `~~~ {${n}}\n${i}\n~~~\n\n` : a.includes("integer") || a.includes("decimal") || a.includes("double") || a.includes("float") ? `\`${i}\` {${n}}\n` : a.includes("date") || a.includes("time") ? `*${i}* {${n}}\n` : a.includes("boolean") ? `**${i}** {${n}}\n` : `[${i}] {${n}}\n`;
}
var ye = (e, t, n = null) => {
	let r = S(e.object.value, t), i = S(e.predicate.value, t);
	return `[${n && n.has(e.object.value) ? n.get(e.object.value) : r}] {+${r} ?${i}}\n`;
};
function be(e) {
	let t = [], n = [], r = [];
	for (let i of e) he(i.predicate) ? t.push(i) : L(i.object) ? n.push(i) : R(i.object) && r.push(i);
	return {
		types: t,
		literals: n,
		objects: r
	};
}
//#endregion
//#region src/parse.js
function H(t, n = {}) {
	let r = typeof t == "object" && !!t && "text" in t, i = r ? t.text : t, a = r ? {
		context: t.context,
		dataFactory: t.dataFactory,
		graph: t.graph
	} : n, o = {
		ctx: {
			...e,
			...a.context || {}
		},
		df: a.dataFactory || v,
		graph: a.graph ? v.namedNode(a.graph) : v.defaultGraph(),
		quads: [],
		quadBuffer: /* @__PURE__ */ new Map(),
		removeSet: /* @__PURE__ */ new Set(),
		origin: {
			quadIndex: /* @__PURE__ */ new Map(),
			blocks: /* @__PURE__ */ new Map(),
			documentStructure: []
		},
		currentSubject: null,
		primarySubject: null,
		tokens: null,
		currentTokenIndex: -1,
		statements: [],
		statementCandidates: /* @__PURE__ */ new Map(),
		currentBlock: null,
		blockStack: []
	}, s = xe(i);
	o.tokens = s.tokens;
	for (let e = 0; e < o.tokens.length; e++) {
		let t = o.tokens[e];
		if (o.currentTokenIndex = e, t.type === "prefix") {
			let e = t.iri;
			if (t.iri.includes(":")) {
				let n = t.iri.indexOf(":"), r = t.iri.substring(0, n), i = t.iri.substring(n + 1);
				o.ctx[r] && r !== "@vocab" && (e = o.ctx[r] + i);
			}
			o.ctx[t.prefix] = e;
			continue;
		}
		je[t.type]?.(t, o);
	}
	let c = /* @__PURE__ */ new Set();
	for (let e of o.quads) c.add(w(e.subject, e.predicate, e.object));
	let l = [];
	for (let e of o.removeSet) {
		let t = w(e.subject, e.predicate, e.object);
		c.has(t) || l.push(e);
	}
	return {
		quads: o.quads,
		remove: l,
		statements: o.statements,
		origin: o.origin,
		context: o.ctx,
		primarySubject: o.primarySubject,
		md: s.md
	};
}
function U(e) {
	return e.type === "code" ? [] : e._carriers || (e._carriers = Se(e.text, e.range[0]));
}
function xe(e) {
	let t = [], l = [], u = e.split("\n"), d = 0, f = null, p = [
		{
			type: "fence",
			test: (e) => n.test(e.trim()),
			process: m
		},
		{
			type: "content",
			test: () => f,
			process: (e) => f.content.push(e)
		},
		{
			type: "prefix",
			test: (e) => r.test(e),
			process: h
		},
		{
			type: "standalone",
			test: (e) => s.test(e),
			process: b
		},
		{
			type: "heading",
			test: (e) => i.test(e),
			process: g
		},
		{
			type: "list",
			test: (e) => a.test(e),
			process: _
		},
		{
			type: "blockquote",
			test: (e) => o.test(e),
			process: v
		},
		{
			type: "para",
			test: (e) => e.trim(),
			process: y
		}
	];
	function m(e, r, i) {
		let a = e.trim();
		if (f) {
			let n = f.fence[0], i = n.repeat(f.fence.length), o = a.match(ne(n));
			if (o && o[1] === i) {
				let n = f.valueRangeStart, i = Math.max(n, r - 1);
				t.push({
					type: "code",
					range: [f.start, r],
					text: f.content.join("\n"),
					lang: f.lang,
					attrs: f.attrs,
					attrsRange: f.attrsRange,
					valueRange: [n, i]
				});
				for (let e of f.content) l.push(e);
				f = null;
				let a = e.replace(/\r?\n.*$/, "");
				l.push(a);
			}
		} else {
			let t = a.match(n);
			if (!t) return !1;
			let { lang: i, attrsText: o } = se(t[2]), s = o ? e.indexOf(o) : -1, c = r + e.length + 1;
			f = {
				fence: t[1],
				start: r,
				content: [],
				lang: i,
				attrs: o,
				attrsRange: o && s >= 0 ? [r + s, r + s + o.length] : null,
				valueRangeStart: c
			};
			let u = e.replace(/\s*\{[^}]+\}\s*$/, "");
			l.push(u);
		}
		return !0;
	}
	function h(e, n, i) {
		let a = r.exec(e);
		return t.push({
			type: "prefix",
			prefix: a[1],
			iri: a[2].trim()
		}), !0;
	}
	function g(e, n, r) {
		let a = i.exec(e), o = a[3] || null, s = a[1].length, c = D(e, o, n, s, a[2].length);
		t.push(k("heading", [n, r - 1], a[2].trim(), o, c.attrsRange, c.valueRange, { depth: a[1].length }));
		let u = `${a[1]} ${a[2].trim()}`;
		return l.push(u), !0;
	}
	function _(e, n, r) {
		let i = a.exec(e);
		t.push(re("list", e, n, r, i));
		let o = `${i[1]}${i[2]} ${i[3].trim()}`;
		return l.push(o), !0;
	}
	function v(e, n, r) {
		let i = o.exec(e), a = i[2] || null, s = e.startsWith("> ") ? 2 : e.indexOf(">") + 1, c = s + i[1].length;
		t.push(k("blockquote", [n, r - 1], i[1].trim(), a, O(e, a, n), [n + s, n + c]));
		let u = `> ${i[1].trim()}`;
		return l.push(u), !0;
	}
	function y(e, n, r) {
		t.push(k("para", [n, r - 1], e.trim()));
		let i = e;
		for (let [e, t] of c) {
			let e = new RegExp(t.source, "gy");
			i = i.replace(e, (e, t, n) => t || "");
		}
		return i = i.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, "$1"), i = i.replace(/\s*\{[^}]+\}\s*/g, " "), i = i.replace(/\s+/g, " ").trim(), l.push(i), !0;
	}
	function b(e, n, r) {
		return t.push({
			type: "standalone",
			text: e.trim(),
			range: [n, r - 1]
		}), !0;
	}
	for (let e = 0; e < u.length; e++) {
		let t = u[e], n = d;
		d += t.length + 1;
		for (let e of p) if (e.test(t) && e.process(t, n, d)) break;
	}
	return {
		tokens: t,
		md: l.join("\n")
	};
}
function Se(e, n = 0) {
	let r = [], i = 0, a = {
		"<": (e, n, r) => {
			let i = e.indexOf(">", n);
			if (i === -1) return null;
			let a = e.slice(n + 1, i);
			if (!t.test(a)) return null;
			let { attrs: o, attrsRange: s, finalSpanEnd: c } = N(e, i + 1, r);
			return A("link", a, o, s, [r + n + 1, r + i], [r + n, r + c], c, { url: a });
		},
		"[": (e, t, n) => {
			let r = ce(e, t);
			if (!r) return null;
			let i = e.slice(t + 1, r - 1), { url: a, spanEnd: o } = le(e, r), { attrs: s, attrsRange: c, finalSpanEnd: l } = N(e, o, n), { carrierType: u, resourceIRI: d } = ue(a);
			return a?.startsWith("=") ? {
				skip: !0,
				pos: l
			} : A(u, i, s, c, [n + t + 1, n + r - 1], [n + t, n + l], l, { url: d });
		}
	}, o = (e, t, n) => {
		let r = a[e[t]];
		if (r) return r(e, t, n);
		for (let [r, i] of c) {
			i.lastIndex = t;
			let a = i.exec(e);
			if (a) {
				let e = de(a, n, a.index);
				return A(r === "EMPHASIS" ? "emphasis" : "code", a[1], `{${a[2]}}`, e.attrsRange, e.valueRange, e.range, e.pos);
			}
		}
		return null;
	};
	for (; i < e.length;) {
		let t = o(e, i, n);
		t ? (t.skip || r.push(t), i = t.pos) : i++;
	}
	return r;
}
function W(e, t) {
	let n = e._blockId || y(`${e.type}:${e.range?.[0]}:${e.range?.[1]}`);
	e._blockId = n;
	let r = U(e), i = fe(e), a = {
		id: n,
		type: e.type,
		range: e.range,
		text: i,
		subject: null,
		types: [],
		predicates: [],
		carriers: [],
		listLevel: e.indent || 0,
		parentBlockId: t.blockStack.length > 0 ? t.blockStack[t.blockStack.length - 1] : null,
		quadKeys: []
	};
	for (let e of r) {
		let t = {
			type: e.type,
			range: e.range,
			text: e.text,
			subject: null,
			predicates: [],
			sem: null
		};
		if (e.attrs) {
			let n = M(e.attrs);
			t.sem = n, t.predicates = n.predicates || [], t.subject = n.subject, t.types = n.types || [];
		}
		a.carriers.push(t);
	}
	return t.origin.blocks.set(n, a), t.origin.documentStructure.push(a), a;
}
function Ce(e, t, n, r) {
	if (t.subject && t.subject !== "RESET") {
		let n = F(t, r);
		n && (e.subject = n.value);
	}
	if (t.types && t.types.length > 0 && t.types.forEach((t) => {
		let n = x(typeof t == "string" ? t : t.iri, r.ctx);
		e.types.includes(n) || e.types.push(n);
	}), t.predicates && t.predicates.length > 0 && t.predicates.forEach((t) => {
		let n = {
			iri: x(t.iri, r.ctx),
			form: t.form || "",
			object: null
		};
		e.predicates.push(n);
	}), n) {
		let t = {
			type: n.type,
			range: n.range,
			text: n.text,
			subject: null,
			predicates: []
		};
		if (n.attrs) {
			let e = M(n.attrs);
			t.sem = e, t.predicates = e.predicates || [], t.subject = e.subject, t.types = e.types || [];
		}
		e.carriers.push(t);
	}
}
function we(e, t, n, r = {}) {
	let { preserveGlobalSubject: i = !1, implicitSubject: a = null } = r;
	if (t.subject === "RESET") {
		n.currentSubject = null;
		return;
	}
	let o = n.currentSubject, s = F(t, n), c = me(t, n);
	s && !n.primarySubject && !t.subject.startsWith("=#") && (n.primarySubject = s.value), s && !i && !a && (n.currentSubject = s);
	let l = i ? s || o : a || n.currentSubject;
	if (!l) return;
	let u = Te(l.value, t.types, t.predicates, e.range, e.attrsRange || null, e.valueRange || null, e.type || null, n.ctx, e.text), d = te(e.text, t.datatype, t.language, n.ctx, n.df), f = e.url ? n.df.namedNode(x(e.url, n.ctx)) : null, p = s || f;
	n.currentBlock && Ce(n.currentBlock, t, e, n), Oe(t, s, c, f, l, u, n, e), Ae(t, s, o, c, p, l, d, u, n, e);
}
function Te(e, t, n, r, i, a, o, s, c) {
	let l = {
		subject: e,
		types: t.map((e) => x(typeof e == "string" ? e : e.iri, s)),
		predicates: n.map((e) => ({
			iri: x(e.iri, s),
			form: e.form
		}))
	};
	return {
		id: y([
			e,
			o || "unknown",
			l.types.join(","),
			l.predicates.map((e) => `${e.form}${e.iri}`).join(",")
		].join("|")),
		range: {
			start: r[0],
			end: r[1]
		},
		carrierType: o || null,
		subject: e,
		types: l.types,
		predicates: l.predicates,
		context: s,
		text: c || ""
	};
}
function G(e, t, n, r, i, a, o, s, c, l = null, u = null, d = null, f = null) {
	if (!a || !o || !s) return;
	let p = c.quad(a, o, s);
	if (l?.remove) {
		let i = w(p.subject, p.predicate, p.object);
		if (t.has(i)) {
			t.delete(i);
			let n = e.findIndex((e) => e.subject.value === p.subject.value && e.predicate.value === p.predicate.value && e.object.value === p.object.value);
			n !== -1 && e.splice(n, 1), r.delete(i);
		} else n.add(p);
	} else {
		let n = w(p.subject, p.predicate, p.object);
		t.set(n, p), e.push(p), Ee(p, c, l, u, d);
		let s = pe(i, a, o, l);
		r.set(n, s), f.currentBlock && i.id === f.currentBlock.id && (f.currentBlock.quadKeys || (f.currentBlock.quadKeys = []), f.currentBlock.quadKeys.push(n));
	}
}
function Ee(e, t, n, r = null, i = null) {
	if (!r || !i) return;
	let a = e.predicate.value;
	if (a !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && a !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject" && a !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate" && a !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#object") return;
	if (a === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && e.object.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement") {
		i.set(e.subject.value, { spo: {} });
		return;
	}
	let o = i.get(e.subject.value);
	if (o && (a === "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject" ? o.spo.subject = e.object : a === "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate" ? o.spo.predicate = e.object : a === "http://www.w3.org/1999/02/22-rdf-syntax-ns#object" && (o.spo.object = e.object, o.objectQuad = e), o.spo.subject && o.spo.predicate && o.spo.object)) {
		let n = t.quad(o.spo.subject, o.spo.predicate, o.spo.object);
		r.push(n), i.delete(e.subject.value);
	}
}
var De = (e, t, n, r, i = null) => {
	let a = x(e, n.ctx), o = typeof i == "object" ? i : {
		entryIndex: i,
		remove: !1
	};
	G(n.quads, n.quadBuffer, n.removeSet, n.origin.quadIndex, r, t, n.df.namedNode(x("rdf:type", n.ctx)), n.df.namedNode(a), n.df, {
		kind: "type",
		token: `.${e}`,
		expandedType: a,
		entryIndex: o.entryIndex,
		remove: o.remove
	}, n.statements, n.statementCandidates, n);
};
function Oe(e, t, n, r, i, a, o, s) {
	e.types.forEach((e) => {
		De(typeof e == "string" ? e : e.iri, t || n || r || i, o, a, typeof e == "string" ? {
			entryIndex: null,
			remove: !1
		} : e);
	});
}
var ke = (e, t, n, r, i, a, o, s) => {
	if (e.form === "" && t?.type === "link" && t?.url && t.text === t.url) return null;
	switch (e.form) {
		case "": return n ? {
			subject: i || o,
			object: s
		} : t?.type === "link" && t?.url && t.text !== t.url ? {
			subject: a,
			object: s
		} : {
			subject: i || o,
			object: s
		};
		case "?": return {
			subject: n ? r : o,
			object: i || a
		};
		case "!": return {
			subject: i || a,
			object: n ? r : o
		};
		default: return null;
	}
};
function Ae(e, t, n, r, i, a, o, s, c, l) {
	e.predicates.forEach((e) => {
		let u = ke(e, l, t, n, r, i, a, o);
		if (u) {
			let t = c.df.namedNode(x(e.iri, c.ctx));
			G(c.quads, c.quadBuffer, c.removeSet, c.origin.quadIndex, s, u.subject, t, u.object, c.df, {
				kind: "pred",
				token: `${e.form}${e.iri}`,
				form: e.form,
				expandedPredicate: t.value,
				entryIndex: e.entryIndex,
				remove: e.remove || !1
			}, c.statements, c.statementCandidates, c);
		}
	});
}
function K(e, t, n, r = {}) {
	we(e, t, n, r);
}
function q(e, t, n) {
	if (e.attrs) {
		let r = M(e.attrs);
		K({
			type: n,
			text: e.text,
			range: e.range,
			attrsRange: e.attrsRange || null,
			valueRange: e.valueRange || null
		}, r, t);
	}
	U(e).forEach((e) => {
		e.attrs && K(e, M(e.attrs), t);
	});
}
function J(e, t) {
	let n = s.exec(e.text);
	if (!n) return;
	let r = M(`{=${n[1]}}`), i = e.range[0] + e.text.indexOf("{=");
	K({
		type: "standalone",
		text: "",
		range: e.range,
		attrsRange: [i, i + (n[1] ? n[1].length : 0)],
		valueRange: null
	}, r, t);
}
var je = {
	heading: (e, t) => B(e, t, q, W),
	code: (e, t) => B(e, t, q, W),
	blockquote: (e, t) => B(e, t, q, W),
	para: (e, t) => B(e, t, q, W, [J]),
	list: (e, t) => B(e, t, q, W),
	standalone: (e, t) => J(e, t)
};
//#endregion
//#region src/merge.js
function Y(e) {
	return T(e);
}
function Me(e, t, n) {
	return typeof e == "string" ? H({
		text: e,
		...t,
		context: {
			...n,
			...t.context
		}
	}) : e;
}
function Ne(t, n = {}) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = [], o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Map(), l = [];
	for (let u = 0; u < t.length; u++) {
		let d = t[u], f = Me(d, n, {
			...e,
			...n.context
		});
		if (f.context) for (let [t, n] of Object.entries(f.context)) !c.has(t) && !e[t] && c.set(t, n);
		let p = {
			index: u,
			input: typeof d == "string" ? "string" : "ParseResult",
			origin: f.origin,
			context: f.context,
			statementsCount: f.statements?.length || 0
		};
		a.push(p), f.statements && f.statements.length > 0 && s.push(...f.statements), f.primarySubject && l.push(f.primarySubject);
		for (let e of f.quads) {
			let t = Y(e);
			r.set(t, e);
			let n = f.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: u,
				polarity: "+"
			});
		}
		for (let e of f.remove) {
			let t = Y(e);
			r.has(t) ? r.delete(t) : i.add(e);
			let n = f.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: u,
				polarity: "-"
			});
		}
	}
	let u = Array.from(r.values()), d = Array.from(i), f = {
		documents: a,
		quadIndex: o
	}, p = {
		...e,
		...n.context,
		...Object.fromEntries(c)
	}, m = new Set(u.map(Y)), h = new Set(d.map(Y));
	return {
		quads: u.filter((e) => !h.has(Y(e))),
		remove: d.filter((e) => !m.has(Y(e))),
		statements: s,
		origin: f,
		context: p,
		primarySubjects: l
	};
}
//#endregion
//#region src/generate.js
function Pe(e, t = {}) {
	if (!e) return e;
	for (let [n, r] of Object.entries(t)) if (e.startsWith(r) || e.startsWith(r.slice(0, -1))) return e.substring(r.length);
	for (let t of [
		"#",
		"/",
		":"
	]) {
		let n = e.lastIndexOf(t);
		if (n !== -1 && n < e.length - 1) return e.substring(n + 1);
	}
	return e;
}
function Fe({ quads: t, context: n = {}, primarySubject: r = null }) {
	let i = {
		...e,
		...n
	}, a = X(t), o = Le(a), s = r;
	!s && a.length > 0 && (s = a[0].subject.value);
	let { text: c } = ze(o, i, s);
	return {
		text: c,
		context: i
	};
}
function Ie({ quads: t, focusIRI: n, context: r = {} }) {
	if (!t?.length || !n) return {
		text: "",
		context: {
			...e,
			...r
		}
	};
	let i = {
		...e,
		...r
	}, a = Re(X(t));
	if (!a.has(n)) return {
		text: "",
		context: i
	};
	let { text: o } = ze(a, i, n);
	return {
		text: o,
		context: i
	};
}
function X(e) {
	return e.map((e) => ({
		subject: v.fromTerm(e.subject),
		predicate: v.fromTerm(e.predicate),
		object: v.fromTerm(e.object)
	})).sort((e, t) => {
		let n = e.subject.value.localeCompare(t.subject.value);
		if (n !== 0) return n;
		let r = e.predicate.value.localeCompare(t.predicate.value);
		if (r !== 0) return r;
		let i = (L(e.object), e.object.value), a = (L(t.object), t.object.value);
		return i.localeCompare(a);
	});
}
function Le(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.has(n.subject.value) || t.set(n.subject.value, []), t.get(n.subject.value).push(n);
	return t;
}
function Re(e) {
	let t = /* @__PURE__ */ new Map(), n = (e) => (t.has(e) || t.set(e, []), t.get(e));
	for (let t of e) {
		let { subject: e, predicate: r, object: i } = t;
		n(e.value).push(t), i.termType === "NamedNode" && n(i.value).push(t), n(r.value).push(t), r.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && i.termType === "NamedNode" && n(i.value).push(t), i.termType === "Literal" && i.datatype && n(i.datatype.value || i.datatype).push(t);
	}
	return t;
}
function ze(t, n, r = null) {
	let i = "", a = ge(t, n), o = Be(t), s = Object.entries(n).sort(([e], [t]) => e.localeCompare(t));
	for (let [t, n] of s) t !== "@vocab" && !t.startsWith("@") && !e[t] && a.has(t) && (i += _e(t, n));
	s.length > 0 && (i += "\n");
	let c = Array.from(t.keys()).sort(), l = r, u = l ? [l, ...c.filter((e) => e !== l)] : c;
	for (let e of u) {
		let r = t.get(e);
		if (!r) continue;
		let a = S(e, n), { types: s, literals: c, objects: l } = be(r), u = o.has(e), d = u ? o.get(e) : Pe(e, n), f = s.length > 0 ? s.map((e) => "." + S(e.object.value, n)).sort().join(" ") : "";
		u && (f += (f ? " " : "") + "label");
		let p = f ? " " + f : "";
		i += `# ${d} {=${a}${p}}\n\n`;
		let m = u ? o.get(e) : null;
		V(c).forEach((e) => {
			e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.value === m || (i += ve(e, n));
		}), V(l).forEach((e) => {
			i += ye(e, n, o);
		}), i += "\n";
	}
	return { text: i };
}
function Be(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.values()) for (let e of n) e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.termType === "Literal" && t.set(e.subject.value, e.object.value);
	return t;
}
//#endregion
//#region src/locate.js
function Ve(e, t) {
	if (!e || !t || !t.quadIndex) return null;
	let n = T(e);
	return n && t.quadIndex.get(n) || null;
}
//#endregion
//#region src/render.js
function He(e, t = {}) {
	let n = H({
		text: e,
		context: t.context || {}
	}), r = Ue(n, t, e), i = {
		html: st(We(n.origin.blocks, r), r.ctx),
		context: r.ctx,
		metadata: {
			blockCount: n.origin.blocks.size,
			quadCount: n.quads.length,
			renderedRDFaCount: r.renderedRDFaCount,
			renderTime: Date.now()
		}
	};
	return t.debug && (i.debug = {
		originBlocks: Array.from(n.origin.blocks.values()),
		quadIndex: Array.from(n.origin.quadIndex.entries()),
		renderMap: r.renderMap
	}), i;
}
function Ue(t, n, r) {
	return {
		ctx: t.context || {
			...e,
			...n.context || {}
		},
		df: n.dataFactory || v,
		baseIRI: n.baseIRI || "",
		sourceText: r,
		output: [],
		currentSubject: null,
		quadIndex: t.origin.quadIndex,
		blocks: t.origin.blocks,
		renderMap: /* @__PURE__ */ new Map(),
		renderedRDFaCount: 0,
		validation: n.validate || !1
	};
}
function We(e, t) {
	let n = Array.from(e.values()).sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0)), r = n.filter((e) => e.carrierType === "list");
	return n.filter((e) => e.carrierType !== "list").forEach((e) => {
		Ge(e, t);
	}), r.length > 0 && tt(r, t), t.output.join("");
}
function Ge(e, t) {
	e.subject && e.subject !== "RESET" && (t.currentSubject = e.subject);
	let n = Ke(e, t);
	switch (n && t.renderMap.set(e.id || ct(e), n), e.type || e.carrierType) {
		case "heading":
			qe(e, n, t);
			break;
		case "para":
			Je(e, n, t);
			break;
		case "list": break;
		case "quote":
			Ye(e, n, t);
			break;
		case "code":
			Xe(e, n, t);
			break;
		default: Ze(e, n, t);
	}
}
function Ke(e, t) {
	let n = [];
	if (!e.subject || e.subject === "RESET" || e.subject.startsWith("=#") || e.subject.startsWith("+")) return "";
	let r = x(e.subject, t.ctx);
	if (n.push(`about="${I(r)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => x(typeof e == "string" ? e : e.iri, t.ctx)).join(" ");
		n.push(`typeof="${I(r)}"`);
	}
	let i = [];
	if (e.predicates && e.predicates.length > 0 && i.push(...e.predicates), e.carriers && e.carriers.length > 0) for (let t of e.carriers) t.predicates && t.predicates.length > 0 && i.push(...t.predicates);
	if (i.length > 0) {
		let { literalProps: e, objectProps: r, reverseProps: a } = Z(i, t.ctx);
		e.length > 0 && n.push(`property="${I(e.join(" "))}"`), r.length > 0 && n.push(`rel="${I(r.join(" "))}"`), a.length > 0 && n.push(`rev="${I(a.join(" "))}"`);
	}
	return n.length > 1 && t.renderedRDFaCount++, n.length > 0 ? ` ${n.join(" ")}` : "";
}
function Z(e, t) {
	let n = [], r = [], i = [];
	for (let a of e) {
		let e = x(typeof a == "string" ? a : a.iri, t);
		a.polarity === "-" ? i.push(e) : a.object && a.object.termType === "NamedNode" ? r.push(e) : n.push(e);
	}
	return {
		literalProps: n,
		objectProps: r,
		reverseProps: i
	};
}
function qe(e, t, n) {
	let r = `h${e.text && e.text.match(/^#+/)?.[0]?.length || 1}`, i = oe(n.sourceText, e.range);
	i = i.replace(/\s*\{[^}]+\}\s*$/g, "").trim(), n.output.push(`<${r}${t}>${I(i)}</${r}>`);
}
function Je(e, t, n) {
	let r = Q(e, n);
	n.output.push(`<p${t}>${r}</p>`);
}
function Ye(e, t, n) {
	let r = Q(e, n);
	n.output.push(`<blockquote${t}>${r}</blockquote>`);
}
function Xe(e, t, n) {
	let r = e.info || "", i = e.text || "";
	n.output.push(`<pre><code${t}${r ? ` class="language-${I(r)}"` : ""}>${I(i)}</code></pre>`);
}
function Ze(e, t, n) {
	let r = Q(e, n);
	n.output.push(`<div${t}>${r}</div>`);
}
function Q(e, t) {
	if (!e.carriers || e.carriers.length === 0) return I($(t.sourceText, e.range));
	let n = Qe(e);
	return $e($(t.sourceText, e.range), n, t);
}
function $(e, t) {
	if (!t || !e) return "";
	let n = e.substring(t[0], t[1]);
	return n = n.replace(/\s*\{[^}]*\}\s*$/gm, ""), n = n.replace(/\{[^}]*\}/g, ""), n = n.replace(/\s+/g, " ").trim(), n = n.replace(/\]$/, ""), n;
}
function Qe(e) {
	let t = [];
	if (!e.carriers) return t;
	for (let n of e.carriers) !n.text || !n.range || t.push({
		pos: n.range[0] - e.range[0],
		carrier: n,
		length: n.text.length
	});
	return t.sort((e, t) => e.pos - t.pos);
}
function $e(e, t, n) {
	if (t.length === 0) return I(e);
	let r = "", i = 0;
	for (let a of t) a.pos > i && (r += I(e.substring(i, a.pos))), r += et(a.carrier, n), i = a.pos + a.length;
	return i < e.length && (r += I(e.substring(i))), r;
}
function et(e, t) {
	let n = [], r = e.subject || t.currentSubject;
	if (!r || r === "RESET" || r.startsWith("=#") || r.startsWith("+")) return I(e.text || "");
	let i = S(x(r, t.ctx), t.ctx);
	if (n.push(`about="${I(i)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => S(x(typeof e == "string" ? e : e.iri, t.ctx), t.ctx)).join(" ");
		n.push(`typeof="${I(r)}"`);
	}
	if (e.predicates && e.predicates.length > 0) {
		let { literalProps: r, objectProps: i, reverseProps: a } = Z(e.predicates, t.ctx);
		if (r.length > 0) {
			let e = r.map((e) => S(e, t.ctx)).join(" ");
			n.push(`property="${I(e)}"`);
		}
		if (i.length > 0) {
			let e = i.map((e) => S(e, t.ctx)).join(" ");
			n.push(`rel="${I(e)}"`);
		}
		if (a.length > 0) {
			let e = a.map((e) => S(e, t.ctx)).join(" ");
			n.push(`rev="${I(e)}"`);
		}
	}
	let a = n.length > 0 ? ` ${n.join(" ")}` : "";
	switch (e.type) {
		case "emphasis": return `<em${a}>${I(e.text || "")}</em>`;
		case "strong": return `<strong${a}>${I(e.text || "")}</strong>`;
		case "code": return `<code${a}>${I(e.text || "")}</code>`;
		case "link": return `<a href="${I(e.url || "")}"${a}>${I(e.text || "")}</a>`;
		default: return `<span${a}>${I(e.text || "")}</span>`;
	}
}
function tt(e, t) {
	nt(e, t.sourceText).forEach((e) => {
		rt(e, t);
	});
}
function nt(e, t) {
	let n = [], r = null, i = e.sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0));
	for (let e of i) ae(e, t) === 0 ? (r && n.push(r), r = {
		contextName: "Items",
		blocks: [e]
	}) : r ? r.blocks.push(e) : r = {
		contextName: "Items",
		blocks: [e]
	};
	return r && n.push(r), n;
}
function rt(e, t) {
	t.output.push("<ul>");
	for (let n of e.blocks) it(n, t);
	t.output.push("</ul>");
}
function it(e, t) {
	let n = Ke(e, t), r = Q(e, t);
	t.output.push(`<li${n}>${r}</li>`);
}
function at(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) n !== "@vocab" && t.push(`${n}: ${r}`);
	return t.length > 0 ? ` prefix="${t.join(" ")}"` : "";
}
function ot(e) {
	return e["@vocab"] ? ` vocab="${e["@vocab"]}"` : "";
}
function st(e, t) {
	return `<div${at(t)}${ot(t)}>${e}</div>`;
}
function ct(e) {
	return lt(`${e.type || e.carrierType}|${e.subject || ""}|${e.text || ""}`);
}
function lt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return t.toString(36);
}
//#endregion
export { e as DEFAULT_CONTEXT, v as DataFactory, x as expandIRI, Fe as generate, Ie as generateNode, y as hash, Ve as locate, Ne as merge, H as parse, C as parseSemanticBlock, He as render, S as shortenIRI };
