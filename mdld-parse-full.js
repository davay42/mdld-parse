//#region src/constants.js
var e = {
	"@vocab": "http://www.w3.org/2000/01/rdf-schema#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	sh: "http://www.w3.org/ns/shacl#",
	prov: "http://www.w3.org/ns/prov#"
}, t = "http://www.w3.org/2000/01/rdf-schema#label", n = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", r = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString", i = "http://www.w3.org/2001/XMLSchema#string", a = "http://www.w3.org/2001/XMLSchema#boolean", o = "http://www.w3.org/2001/XMLSchema#integer", s = "http://www.w3.org/2001/XMLSchema#double", c = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/, l = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file):/, u = class {
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
		t ? (this.value = t[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"), t[5] ? (this.language = t[5], this.datatype = new d(r)) : this.datatype = t[3] ? new d(t[3]) : new d(i)) : (this.value = e.replace(/^"|"$/g, ""), this.datatype = new d(i));
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
		return r === "" && (typeof e == "boolean" ? r = a : typeof e == "number" && (Number.isFinite(e) ? r = Number.isInteger(e) ? o : s : (r = s, Number.isNaN(e) || (e = e > 0 ? "INF" : "-INF")))), r === "" || r === "http://www.w3.org/2001/XMLSchema#string" ? new f(`"${n}"`) : new f(`"${n}"^^${r}`);
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
			case "Quad": return _.fromQuad(e);
			default: throw Error(`Unexpected termType: ${e.termType}`);
		}
	},
	fromQuad: (e) => {
		if (e instanceof g) return e;
		if (e.termType !== "Quad") {
			if (e.subject && e.predicate && e.object) return new g(_.fromTerm(e.subject), _.fromTerm(e.predicate), _.fromTerm(e.object), _.fromTerm(e.graph || _.defaultGraph()));
			throw Error(`Unexpected termType: ${e.termType}`);
		}
		return new g(_.fromTerm(e.subject), _.fromTerm(e.predicate), _.fromTerm(e.object), _.fromTerm(e.graph));
	}
};
function v(e, t) {
	if (!e || !t || !t.quadIndex) return null;
	let n = E(e);
	return n && t.quadIndex.get(n) || null;
}
function y(e) {
	let t = 5381;
	for (let n = 0; n < e.length; n++) t = (t << 5) + t + e.charCodeAt(n);
	return Math.abs(t).toString(16).slice(0, 12);
}
var b = /* @__PURE__ */ new Map();
function x(e, t) {
	if (e == null) return null;
	let n = `${e}|${t["@vocab"] || ""}|${Object.keys(t).filter((e) => e !== "@vocab").sort().map((e) => `${e}:${t[e]}`).join(",")}`;
	if (b.has(n)) return b.get(n);
	let r = (typeof e == "string" ? e : typeof e == "object" && typeof e.value == "string" ? e.value : String(e)).trim(), i;
	if (r.match(c)) i = r;
	else if (r.includes(":")) {
		let [e, n] = r.split(":", 2);
		e && !t[e] && e !== "@vocab" && console.warn(`Undefined prefix "${e}" in IRI "${r}" - treating as literal`), i = t[e] ? t[e] + n : r;
	} else i = (t["@vocab"] || "") + r;
	return b.set(n, i), i;
}
function S(e, t) {
	if (!e || !l.test(e)) return e;
	if (t["@vocab"] && e.startsWith(t["@vocab"])) return e.substring(t["@vocab"].length);
	for (let [n, r] of Object.entries(t)) if (n !== "@vocab" && e.startsWith(r) && Object.entries(t).filter(([t, n]) => t !== "@vocab" && e.startsWith(n)).every(([e, t]) => r.length >= t.length || e === n && t.length === r.length)) return n + ":" + e.substring(r.length);
	return e;
}
var C = {
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
function w(e) {
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
			for (let [c, l] of Object.entries(C)) if (e.startsWith(c)) {
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
function T(e, t, n) {
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
function E(e) {
	return e ? T(e.subject, e.predicate, e.object) : null;
}
function D(e, t, n, r, i) {
	return t ? i.literal(e, i.namedNode(x(t, r))) : n ? i.literal(e, n) : i.literal(e);
}
//#endregion
//#region src/tokenizers.js
function O(e) {
	if (e.length < 3) return null;
	let t = e[0];
	if (t !== "`" && t !== "~") return null;
	let n = 1;
	for (; n < e.length && e[n] === t;) n++;
	if (n < 3) return null;
	let r = e.slice(n).trimStart(), i = r.match(/^([^\s{]+)/), a = i ? i[1] : "", o = r.match(/\{([^}]+)\}/), s = o ? o[1] : null;
	return {
		fenceChar: t,
		fenceLength: n,
		lang: a,
		attrs: s,
		infoString: r
	};
}
function k(e) {
	if (e[0] !== "[") return null;
	let t = e.indexOf("]", 1);
	if (t === -1) return null;
	let n = e.slice(1, t).trim();
	if (!n) return null;
	let r = t + 1;
	for (; r < e.length && (e[r] === " " || e[r] === "	");) r++;
	if (r >= e.length || e[r] !== "<") return null;
	let i = e.indexOf(">", r + 1);
	if (i === -1) return null;
	let a = e.slice(r + 1, i).trim();
	return a ? {
		prefix: n,
		iri: a
	} : null;
}
function A(e) {
	if (e[0] !== "#") return null;
	let t = 1;
	for (; t < e.length && t < 6 && e[t] === "#";) t++;
	if (t >= e.length || e[t] !== " " && e[t] !== "	") return null;
	let n = t;
	for (; n < e.length && (e[n] === " " || e[n] === "	");) n++;
	let r = e.slice(n), i = r.match(/\s*\{([^}]+)\}\s*$/), a = r, o = null;
	return i && (o = i[1], a = r.slice(0, -i[0].length).trim()), {
		depth: t,
		content: a,
		attrs: o
	};
}
function j(e) {
	let t = 0;
	for (; t < e.length && (e[t] === " " || e[t] === "	");) t++;
	let n = t;
	if (t >= e.length) return null;
	let r = e[t], i, a = t + 1;
	if (r === "-" || r === "*" || r === "+") i = r;
	else if (r >= "0" && r <= "9") {
		let n = t + 1;
		for (; n < e.length && e[n] >= "0" && e[n] <= "9";) n++;
		if (n >= e.length || e[n] !== ".") return null;
		i = e.slice(t, n + 1), a = n + 1;
	} else return null;
	if (a >= e.length || e[a] !== " " && e[a] !== "	") return null;
	for (; a < e.length && (e[a] === " " || e[a] === "	");) a++;
	let o = e.slice(a), s = null, c = o.match(/\s*\{([^}]+)\}\s*$/);
	return c && (s = c[1], o = o.slice(0, -c[0].length).trim()), {
		indent: n,
		marker: i,
		content: o,
		attrs: s
	};
}
function M(e) {
	if (e[0] !== ">" || e.length > 1 && e[1] !== " " && e[1] !== "	") return null;
	let t = 1;
	for (; t < e.length && (e[t] === " " || e[t] === "	");) t++;
	let n = e.slice(t), r = null, i = n.match(/\s*\{([^}]+)\}\s*$/);
	return i && (r = i[1], n = n.slice(0, -i[0].length).trim()), {
		content: n,
		attrs: r
	};
}
function ee(e) {
	let t = 0;
	for (; t < e.length && (e[t] === " " || e[t] === "	");) t++;
	if (t >= e.length || e[t] !== "{" || (t++, t >= e.length || e[t] !== "=")) return null;
	t++;
	let n = t, r = 1;
	for (; t < e.length && r > 0;) e[t] === "{" && r++, e[t] === "}" && r--, r > 0 && t++;
	if (r > 0) return null;
	let i = e.slice(n, t).trim();
	for (t++; t < e.length && (e[t] === " " || e[t] === "	");) t++;
	return t < e.length ? null : { content: i };
}
function te(e, t, n = "[", r = "]") {
	let i = 1, a = t + 1;
	for (; a < e.length && i > 0;) e[a] === n && i++, e[a] === r && i--, i > 0 && a++;
	return i === 0 ? a : null;
}
function N(e, t) {
	let n = t;
	for (; n < e.length && (e[n] === " " || e[n] === "	");) n++;
	if (n >= e.length || e[n] !== "{") return null;
	let r = e.indexOf("}", n + 1);
	return r === -1 ? null : {
		attrs: e.slice(n + 1, r),
		endPos: r + 1
	};
}
function ne(e, t) {
	if (e[t] !== "<") return null;
	let n = e.indexOf(">", t + 1);
	if (n === -1) return null;
	let r = e.slice(t + 1, n).trim();
	return r.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/) ? {
		url: r,
		endPos: n + 1,
		contentStart: t + 1,
		contentEnd: n
	} : null;
}
function P(e, t) {
	let n = e[t];
	if (n !== "*" && n !== "_") return null;
	let r = 1;
	for (; t + r < e.length && e[t + r] === n;) r++;
	if (r > 2) return null;
	let i = r === 1 ? "emphasis" : "strong", a = n.repeat(r), o = t + r, s = o;
	for (; s < e.length;) {
		if (e.slice(s, s + r) === a) {
			if (s + r < e.length && e[s + r] === n) {
				s++;
				continue;
			}
			let t = e.slice(o, s), a = s + r, c = N(e, a), l = c ? c.endPos : a;
			return {
				type: i,
				content: t,
				attrs: c?.attrs || null,
				endPos: l,
				contentStart: o,
				contentEnd: s
			};
		}
		s++;
	}
	return null;
}
function F(e, t) {
	if (e[t] !== "`") return null;
	let n = 1;
	for (; t + n < e.length && e[t + n] === "`";) n++;
	if (n > 2) return null;
	let r = "`".repeat(n), i = t + n, a = i;
	for (; a < e.length;) {
		if (e.slice(a, a + n) === r) {
			let t = e.slice(i, a), r = a + n, o = N(e, r), s = o ? o.endPos : r;
			return {
				type: "code",
				content: t,
				attrs: o?.attrs || null,
				endPos: s,
				contentStart: i,
				contentEnd: a
			};
		}
		a++;
	}
	return null;
}
function I(e, t) {
	if (e[t] !== "[") return null;
	let n = te(e, t, "[", "]");
	if (!n) return null;
	let r = e.slice(t + 1, n), i = n + 1, a = null;
	if (i < e.length && e[i] === "(") {
		let t = e.indexOf(")", i + 1);
		if (t !== -1) {
			let n = e.slice(i + 1, t), r = n.toLowerCase();
			(r.startsWith("http://") || r.startsWith("https://")) && (a = n), i = t + 1;
		}
	} else if (i < e.length && e[i] === "<") {
		let t = e.indexOf(">", i + 1);
		if (t !== -1) {
			let n = e.slice(i + 1, t).trim();
			n.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/) && (a = n, i = t + 1);
		}
	}
	let o = N(e, i), s = o ? o.endPos : i;
	return {
		type: a ? "link" : "span",
		text: r,
		url: a,
		attrs: o?.attrs || null,
		endPos: s,
		contentStart: t + 1,
		contentEnd: n
	};
}
function L(e, t = 0) {
	let n = [], r = e.length, i = 0;
	for (; i < r;) {
		let r = e[i], a = null;
		switch (r) {
			case "<":
				if (a = ne(e, i), a) {
					let t = N(e, a.endPos);
					t && (a.attrs = t.attrs, a.endPos = t.endPos), a.type = "link", a.text = a.url;
				}
				break;
			case "[":
				a = I(e, i);
				break;
			case "*":
			case "_":
				a = P(e, i);
				break;
			case "`": a = F(e, i);
		}
		if (!a) {
			i++;
			continue;
		}
		let o = a.url, s = a.type, c = a.attrs;
		if (o?.startsWith("=") || s === "link" && !c && !o) {
			i = a.endPos;
			continue;
		}
		let l = t + i, u = t + a.endPos, d = t + a.contentEnd, f = [t + a.contentStart, t + a.contentEnd], p = {
			type: s,
			text: a.content === void 0 ? a.text === void 0 ? o : a.text : a.content,
			range: [l, u],
			valueRange: f,
			attrs: c,
			url: o,
			pos: a.endPos
		};
		c && (p.attrsRange = [d, u]), n.push(p), i = a.endPos;
	}
	return n;
}
//#endregion
//#region src/shared.js
var R = /* @__PURE__ */ new Map();
function re(e) {
	return R.has(e) || R.set(e, RegExp(`^(${e}{3,})`)), R.get(e);
}
function ie(e, t, n, r, i) {
	let a = r + (r < e.length && e[r] === " " ? 1 : e.slice(r).match(/^\s+/)?.[0]?.length || 0);
	return {
		valueRange: [n + a, n + a + i],
		attrsRange: ae(e, t, n)
	};
}
function ae(e, t, n) {
	if (!t) return null;
	let r = e.lastIndexOf(t);
	return r >= 0 ? [n + r, n + r + t.length] : null;
}
function oe(e, t, n, r = null, i = null, a = null, o = {}) {
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
function se(e, t, n, r, i) {
	let a = i[4] || null, o = ie(t, a, n, i[1].length + (i[2] ? i[2].length : 0), i[3].length);
	return oe(e, [n, r - 1], i[3].trim(), a, o.attrsRange, o.valueRange, { indent: i[1].length });
}
var z = {}, ce = Object.freeze({
	predicates: [],
	types: [],
	subject: null
});
function B(e) {
	if (!e) return ce;
	let t = z[e];
	return t || (t = Object.freeze(w(e)), z[e] = t), t;
}
function le(e) {
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
function ue(e, t, n, r = null) {
	return {
		blockId: e.id,
		range: e.range,
		valueRange: e.valueRange || null,
		carrierType: e.carrierType,
		subject: t.value,
		predicate: n.value,
		context: e.context,
		polarity: r?.remove ? "-" : "+",
		value: e.text || ""
	};
}
function de(e, t, n) {
	if (!t) return null;
	let r = t.value, i = r.indexOf("#"), a = i > -1 ? r.slice(0, i) : r;
	return n.namedNode(a + "#" + e);
}
function fe(e, t) {
	return e.subject ? e.subject === "RESET" ? (t.currentSubject = null, null) : e.subject.startsWith("=#") ? de(e.subject.substring(2), t.currentSubject, t.df) : t.df.namedNode(x(e.subject, t.ctx)) : null;
}
function pe(e, t) {
	return e.object ? e.object.startsWith("#") ? de(e.object.substring(1), t.currentSubject, t.df) : t.df.namedNode(x(e.object, t.ctx)) : null;
}
function V(e) {
	return e ? e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : "";
}
function me(e) {
	return e?.termType === "Literal";
}
function he(e) {
	return e?.termType === "NamedNode";
}
function ge(e) {
	return e?.value === n;
}
function _e(e, t) {
	if (!e) return null;
	let n = S(e, t);
	return n.includes(":") ? n.split(":")[0] : null;
}
function ve(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of e.values()) for (let e of r) {
		let r = _e(e.subject.value, t);
		r && n.add(r);
		let i = _e(e.predicate.value, t);
		if (i && n.add(i), he(e.object)) {
			let r = _e(e.object.value, t);
			r && n.add(r);
		}
		if (e.object.datatype && e.object.datatype.value) {
			let r = _e(e.object.datatype.value, t);
			r && n.add(r);
		}
	}
	return n;
}
function H(e, t, n, r, i = []) {
	let a = r(e, t);
	t.currentBlock = a, t.blockStack.push(a.id), i.forEach((n) => n(e, t)), n(e, t, e.type), t.blockStack.pop(), t.currentBlock = t.blockStack.length > 0 ? t.origin.blocks.get(t.blockStack[t.blockStack.length - 1]) : null;
}
function ye(e) {
	return e.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
}
var be = (e, t) => `[${e}] <${t}>\n`;
function xe(e, t) {
	let n = S(e.predicate.value, t);
	e.object.language ? n += ` @${e.object.language}` : e.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" && (n += ` ^^${S(e.object.datatype.value, t)}`);
	let r = e.object.value || e.object, i = typeof r == "string" ? r : String(r), a = e.object.datatype?.value || "";
	return i.includes("\n") ? `~~~ {${n}}\n${i}\n~~~\n\n` : a.includes("integer") || a.includes("decimal") || a.includes("double") || a.includes("float") ? `\`${i}\` {${n}}\n` : a.includes("date") || a.includes("time") ? `*${i}* {${n}}\n` : a.includes("boolean") ? `**${i}** {${n}}\n` : `[${i}] {${n}}\n`;
}
var Se = (e, n, r = null, i = null, a = null, o = !0, s = null) => {
	let c = S(e.object.value, n), l = S(e.predicate.value, n), u = r && r.has(e.object.value) ? r.get(e.object.value).value : c, d = "";
	if (o && i && r && a) {
		let o = i.get(e.object.value);
		if (o) {
			let { types: i } = o, c = r.has(e.object.value);
			if (!(i.some((e) => a.has(e)) || c && i.some((e) => e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && a.has(e)))) {
				let e = i.length > 0 ? i.map((e) => "." + S(e.object.value, n)).sort().join(" ") : "", r = c ? "label" : "";
				if ((e || r) && (d = " " + [e, r].filter(Boolean).join(" "), s && s.inlineAnnotations++, i.forEach((e) => a.add(e)), c)) {
					let e = i.find((e) => e.predicate.value === t);
					e && a.add(e);
				}
			}
		}
	}
	return `[${u}] {+${c} ?${l}${d}}\n`;
};
function Ce(e) {
	let t = [], n = [], r = [];
	for (let i of e) ge(i.predicate) ? t.push(i) : me(i.object) ? n.push(i) : he(i.object) && r.push(i);
	return {
		types: t,
		literals: n,
		objects: r
	};
}
function we(e, t) {
	let n = S(e.predicate.value, t), r;
	if (e.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") return r = `-.${S(e.object.value, t)}`, `> {${r}}\n`;
	if (he(e.object)) {
		let i = S(e.object.value, t);
		return r = `-?${n}`, `[${i}] {+${i} ${r}}\n`;
	}
	{
		r = `-${n}`, e.object.language ? r += ` @${e.object.language}` : e.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" && (r += ` ^^${S(e.object.datatype.value, t)}`);
		let i = e.object.value || e.object, a = typeof i == "string" ? i : String(i), o = e.object.datatype?.value || "";
		return a.includes("\n") ? `~~~ {${r}}\n${a}\n~~~\n` : o.includes("integer") || o.includes("decimal") || o.includes("double") || o.includes("float") ? `\`${a}\` {${r}}\n` : o.includes("boolean") ? `**${a}** {${r}}\n` : `[${a}] {${r}}\n`;
	}
}
//#endregion
//#region src/parse.js
function Te(t, n = {}) {
	let r = typeof t == "object" && !!t && "text" in t, i = r ? t.text : t, a = r ? {
		context: t.context,
		dataFactory: t.dataFactory,
		graph: t.graph
	} : n, o = {
		ctx: {
			...e,
			...a.context || {}
		},
		df: a.dataFactory || _,
		graph: a.graph ? _.namedNode(a.graph) : _.defaultGraph(),
		quads: [],
		quadBuffer: /* @__PURE__ */ new Map(),
		removeSet: /* @__PURE__ */ new Set(),
		origin: {
			quadIndex: /* @__PURE__ */ new Map(),
			blocks: /* @__PURE__ */ new Map(),
			spans: /* @__PURE__ */ new Map(),
			documentStructure: []
		},
		currentSubject: null,
		primarySubject: null,
		primaryType: null,
		primaryLabel: null,
		primaryComment: null,
		tokens: null,
		currentTokenIndex: -1,
		statements: [],
		statementCandidates: /* @__PURE__ */ new Map(),
		currentBlock: null,
		blockStack: [],
		lastBlockEnd: 0,
		lastBlockId: null,
		lastSpanId: null
	}, s = De(i);
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
		Be[t.type]?.(t, o);
	}
	o.quads = Array.from(o.quadBuffer.values());
	let c = [];
	for (let e of o.removeSet) {
		let t = T(e.subject, e.predicate, e.object);
		o.quadBuffer.has(t) || c.push(e);
	}
	let l = {
		subject: o.primarySubject,
		type: o.primaryType,
		label: o.primaryLabel,
		comment: o.primaryComment
	};
	return {
		quads: o.quads,
		remove: c,
		statements: o.statements,
		origin: o.origin,
		context: o.ctx,
		primarySubject: o.primarySubject,
		primary: l,
		md: s.md
	};
}
function Ee(e) {
	if (e.type === "code") return [];
	let t = e.valueRange ? e.valueRange[0] : e.range[0];
	return e._carriers || (e._carriers = Oe(e.text, t));
}
function De(e) {
	let t = [], n = [], r = e.split("\n"), i = 0, a = null, o = null;
	function s(e) {
		return e.startsWith("<!--") ? !0 : /^<(script|style|template)\b/i.test(e);
	}
	function c(e) {
		if (o) {
			if (o.tag === "comment") e.includes("-->") && (o = null);
			else if (o.tag === "script" || o.tag === "style") RegExp(`</\\s*${o.tag}\\s*>`, "i").test(e) && (o = null);
			else if (o.tag === "template") {
				let t = (e.match(/<template\b/gi) || []).length, n = (e.match(/<\/template>/gi) || []).length;
				o.depth += t - n, o.depth <= 0 && (o = null);
			}
		}
	}
	function l(e) {
		let t = e.trim();
		if (t.startsWith("<!--")) o = {
			tag: "comment",
			depth: 1
		};
		else {
			let e = t.match(/^<(script|style|template)\b/i);
			if (!e) return !1;
			let n = e[1].toLowerCase();
			o = {
				tag: n,
				depth: n === "template" ? 0 : 1
			};
		}
		return n.push(e), c(e), !0;
	}
	function u(e) {
		return n.push(e), c(e), !0;
	}
	let d = [
		{
			type: "fence",
			test: (e) => O(e.trim()),
			process: f
		},
		{
			type: "codeContent",
			test: () => a,
			process: (e) => a.content.push(e)
		},
		{
			type: "sfcContent",
			test: () => o,
			process: u
		},
		{
			type: "sfcStart",
			test: (e) => s(e.trim()),
			process: l
		},
		{
			type: "prefix",
			test: (e) => k(e),
			process: p
		},
		{
			type: "standalone",
			test: (e) => ee(e),
			process: v
		},
		{
			type: "heading",
			test: (e) => A(e),
			process: m
		},
		{
			type: "list",
			test: (e) => j(e),
			process: h
		},
		{
			type: "blockquote",
			test: (e) => M(e),
			process: g
		},
		{
			type: "para",
			test: (e) => e.trim(),
			process: _
		}
	];
	function f(e, r, i) {
		let o = e.trim();
		if (a) {
			let s = a.fence[0], c = s.repeat(a.fence.length), l = o.match(re(s));
			if (l && l[1] === c) {
				let o = a.valueRangeStart, s = Math.max(o, r - 1);
				t.push({
					type: "code",
					range: [a.start, i - 1],
					text: a.content.join("\n"),
					lang: a.lang,
					attrs: a.attrs,
					attrsRange: a.attrsRange,
					valueRange: [o, s]
				});
				for (let e of a.content) n.push(e);
				a = null;
				let c = e.replace(/\r?\n.*$/, "");
				n.push(c);
			}
		} else {
			let t = O(o);
			if (!t) return !1;
			let i = t.attrs, s = i ? e.indexOf(i) : -1, c = r + e.length + 1;
			a = {
				fence: t.fenceChar.repeat(t.fenceLength),
				start: r,
				content: [],
				lang: t.lang,
				attrs: i,
				attrsRange: i && s >= 0 ? [r + s, r + s + i.length] : null,
				valueRangeStart: c
			};
			let l = e.replace(/\s*\{[^}]+\}\s*$/, "");
			n.push(l);
		}
		return !0;
	}
	function p(e, n, r) {
		let i = k(e);
		return t.push({
			type: "prefix",
			prefix: i.prefix,
			iri: i.iri
		}), !0;
	}
	function m(e, r, i) {
		let a = A(e), o = a.attrs, s = a.depth, c = ie(e, o, r, s, a.content.length);
		t.push(oe("heading", [r, i - 1], a.content, o, c.attrsRange, c.valueRange, { depth: a.depth }));
		let l = `${"#".repeat(a.depth)} ${a.content}`;
		return n.push(l), !0;
	}
	function h(e, r, i) {
		let a = j(e), o = " ".repeat(a.indent), s = [
			e,
			o,
			a.marker,
			a.content,
			a.attrs
		];
		t.push(se("list", e, r, i, s));
		let c = `${o}${a.marker} ${a.content}`;
		return n.push(c), !0;
	}
	function g(e, r, i) {
		let a = M(e), o = a.attrs, s = e.startsWith("> ") ? 2 : e.indexOf(">") + 1, c = s + a.content.length;
		t.push(oe("blockquote", [r, i - 1], a.content, o, ae(e, o, r), [r + s, r + c]));
		let l = `> ${a.content}`;
		return n.push(l), !0;
	}
	function _(e, r, i) {
		let a = e.search(/\S/), o = a === -1 ? r : r + a, s = e.trim(), c = o + s.length;
		t.push(oe("para", [r, i - 1], s, null, null, [o, c]));
		let l = e, u = [];
		l = l.replace(/`[^`]+`/g, (e) => (u.push(e), `__INLINE_CODE_${u.length - 1}__`));
		let d = [];
		l = l.replace(/\{\{(?:[^{}]|\{[^{}]*\})*\}\}/g, (e) => (d.push(e), `__VUE_INTERPOLATION_${d.length - 1}__`));
		let f = L(l, 0);
		for (let e = f.length - 1; e >= 0; e--) {
			let t = f[e];
			if (t.attrs && (t.type === "emphasis" || t.type === "code")) {
				let e = l.substring(0, t.range[0]), n = l.substring(t.range[1]);
				l = e + (t.text || "") + n;
			}
		}
		l = l.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, "$1"), l = l.replace(/([^{]|^)\{[^{}]+\}(?=[^}]|$)/g, "$1"), l = l.replace(/__VUE_INTERPOLATION_(\d+)__/g, (e, t) => d[Number(t)]), l = l.replace(/__INLINE_CODE_(\d+)__/g, (e, t) => u[Number(t)]);
		let p = l.match(/ {2,}$/);
		return l = p ? l.replace(/[ \t]+$/, p[0]) : l.replace(/[ \t]+$/, ""), n.push(l), !0;
	}
	function v(e, n, r) {
		return t.push({
			type: "standalone",
			text: e.trim(),
			range: [n, r - 1]
		}), !0;
	}
	for (let e = 0; e < r.length; e++) {
		let t = r[e], n = i;
		i += t.length + 1;
		for (let e of d) if (e.test(t) && e.process(t, n, i)) break;
	}
	return {
		tokens: t,
		md: n.join("\n")
	};
}
function Oe(e, t = 0) {
	return L(e, t);
}
function U(e, t) {
	let n = e._blockId || y(`${e.type}:${e.range?.[0]}:${e.range?.[1]}`);
	e._blockId = n;
	let r = Ee(e), i = le(e), a = e.range[0], o = e.range[1], s = null;
	if (t.lastBlockId !== null) {
		let e = t.lastBlockEnd, r = a;
		if (r > e) {
			let i = y(`span:${e}:${r}`), a = {
				id: i,
				range: [e, r],
				prevBlockId: t.lastBlockId,
				nextBlockId: n,
				prevSpanId: t.lastSpanId || null,
				nextSpanId: null,
				byteLength: r - e
			};
			if (t.origin.spans.set(i, a), t.lastSpanId) {
				let e = t.origin.spans.get(t.lastSpanId);
				e && (e.nextSpanId = i);
			}
			let o = t.origin.blocks.get(t.lastBlockId);
			o && (o.nextSpanId = i), t.lastSpanId = i, s = i;
		}
	}
	t.lastBlockEnd = o, t.lastBlockId = n;
	let c = {
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
		quadKeys: [],
		prevSpanId: s,
		nextSpanId: null
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
			let n = B(e.attrs);
			t.sem = n, t.predicates = n.predicates || [], t.subject = n.subject, t.types = n.types || [];
		}
		c.carriers.push(t);
	}
	return t.origin.blocks.set(n, c), t.origin.documentStructure.push(c), c;
}
function ke(e, t, n, r) {
	if (t.subject && t.subject !== "RESET") {
		let n = fe(t, r);
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
			let e = B(n.attrs);
			t.sem = e, t.predicates = e.predicates || [], t.subject = e.subject, t.types = e.types || [];
		}
		e.carriers.push(t);
	}
}
function Ae(e, t, n, r = {}) {
	let { preserveGlobalSubject: i = !1, implicitSubject: a = null } = r;
	if (t.subject === "RESET") {
		n.currentSubject = null;
		return;
	}
	let o = n.currentSubject, s = fe(t, n), c = pe(t, n);
	s && !n.primarySubject && !t.subject.startsWith("=#") && (n.primarySubject = s.value), s && !i && !a && (n.currentSubject = s);
	let l = i ? s || o : a || n.currentSubject;
	if (!l) return;
	let u = je(l.value, t.types, t.predicates, e.range, e.attrsRange || null, e.valueRange || null, e.type || null, n.ctx, e.text), d = D(e.text, t.datatype, t.language, n.ctx, n.df), f = e.url ? n.df.namedNode(x(e.url, n.ctx)) : null, p = s || f;
	n.currentBlock && ke(n.currentBlock, t, e, n), Fe(t, s, c, f, l, u, n, e), Le(t, s, o, c, p, l, d, u, n, e);
}
function je(e, t, n, r, i, a, o, s, c) {
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
		valueRange: a ? {
			start: a[0],
			end: a[1]
		} : null,
		carrierType: o || null,
		subject: e,
		types: l.types,
		predicates: l.predicates,
		context: s,
		text: c || ""
	};
}
function Me(e, t, n, r, i, a = null) {
	if (!n || !r || !i) return;
	let o = T(n, r, i);
	if (a?.remove) {
		if (e.quadBuffer.has(o)) e.quadBuffer.delete(o), e.origin.quadIndex.delete(o);
		else {
			let t = e.df.quad(n, r, i, e.graph);
			e.removeSet.add(t);
		}
		return;
	}
	let s = e.df.quad(n, r, i, e.graph);
	e.quadBuffer.set(o, s);
	let c = r.value;
	!e.primaryType && c === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" ? e.primaryType = i.value : !e.primaryLabel && c === "http://www.w3.org/2000/01/rdf-schema#label" && i.termType === "Literal" ? e.primaryLabel = i.value : !e.primaryComment && c === "http://www.w3.org/2000/01/rdf-schema#comment" && i.termType === "Literal" && (e.primaryComment = i.value), e.statements && e.statementCandidates && Ne(s, e.df, a, e.statements, e.statementCandidates);
	let l = ue(t, n, r, a);
	e.origin.quadIndex.set(o, l), t && e.currentBlock && t.id === e.currentBlock.id && (e.currentBlock.quadKeys || (e.currentBlock.quadKeys = []), e.currentBlock.quadKeys.push(o));
}
function Ne(e, t, n, r = null, i = null) {
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
var Pe = (e, t, n, r, i = null) => {
	let a = x(e, n.ctx), o = typeof i == "object" ? i : {
		entryIndex: i,
		remove: !1
	};
	Me(n, r, t, n.df.namedNode(x("rdf:type", n.ctx)), n.df.namedNode(a), {
		kind: "type",
		token: `.${e}`,
		expandedType: a,
		entryIndex: o.entryIndex,
		remove: o.remove
	});
};
function Fe(e, t, n, r, i, a, o, s) {
	e.types.forEach((e) => {
		Pe(typeof e == "string" ? e : e.iri, t || n || r || i, o, a, typeof e == "string" ? {
			entryIndex: null,
			remove: !1
		} : e);
	});
}
var Ie = (e, t, n, r, i, a, o, s) => {
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
function Le(e, t, n, r, i, a, o, s, c, l) {
	e.predicates.forEach((e) => {
		let u = Ie(e, l, t, n, r, i, a, o);
		if (u) {
			let t = c.df.namedNode(x(e.iri, c.ctx));
			Me(c, s, u.subject, t, u.object, {
				kind: "pred",
				token: `${e.form}${e.iri}`,
				form: e.form,
				expandedPredicate: t.value,
				entryIndex: e.entryIndex,
				remove: e.remove || !1
			});
		}
	});
}
function Re(e, t, n, r = {}) {
	Ae(e, t, n, r);
}
function W(e, t, n) {
	if (e.attrs) {
		let r = B(e.attrs);
		Re({
			type: n,
			text: e.text,
			range: e.range,
			attrsRange: e.attrsRange || null,
			valueRange: e.valueRange || null
		}, r, t);
	}
	Ee(e).forEach((e) => {
		e.attrs && Re(e, B(e.attrs), t);
	});
}
function ze(e, t) {
	let n = ee(e.text);
	if (!n) return;
	let r = B(`{=${n.content}}`), i = e.range[0] + e.text.indexOf("{="), a = 3 + (n.content ? n.content.length : 0);
	Re({
		type: "standalone",
		text: "",
		range: e.range,
		attrsRange: [i, i + a],
		valueRange: null
	}, r, t);
}
var Be = {
	heading: (e, t) => H(e, t, W, U),
	code: (e, t) => H(e, t, W, U),
	blockquote: (e, t) => H(e, t, W, U),
	para: (e, t) => H(e, t, W, U, [ze]),
	list: (e, t) => H(e, t, W, U),
	standalone: (e, t) => ze(e, t)
};
//#endregion
//#region src/merge.js
function G(e) {
	return E(e);
}
function Ve(e, t, n) {
	return typeof e == "string" ? Te({
		text: e,
		...t,
		context: {
			...n,
			...t.context
		}
	}) : e;
}
function He(t, n = {}) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = [], o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Map(), l = [], u = [];
	for (let d = 0; d < t.length; d++) {
		let f = t[d], p = Ve(f, n, {
			...e,
			...n.context
		});
		if (p.context) for (let [t, n] of Object.entries(p.context)) !c.has(t) && !e[t] && c.set(t, n);
		let m = {
			index: d,
			input: typeof f == "string" ? "string" : "ParseResult",
			origin: p.origin,
			context: p.context,
			statementsCount: p.statements?.length || 0
		};
		a.push(m), p.statements && p.statements.length > 0 && s.push(...p.statements), p.primary && (p.primary.subject || p.primary.type || p.primary.label) && l.push(p.primary), p.primarySubject && u.push(p.primarySubject);
		for (let e of p.quads) {
			let t = G(e);
			r.set(t, e);
			let n = p.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: d,
				polarity: "+"
			});
		}
		for (let e of p.remove) {
			let t = G(e);
			r.has(t) ? r.delete(t) : i.add(e);
			let n = p.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: d,
				polarity: "-"
			});
		}
	}
	let d = Array.from(r.values()), f = Array.from(i), p = {
		documents: a,
		quadIndex: o
	}, m = {
		...e,
		...n.context,
		...Object.fromEntries(c)
	}, h = new Set(d.map(G)), g = new Set(f.map(G));
	return {
		quads: d.filter((e) => !g.has(G(e))),
		remove: f.filter((e) => !h.has(G(e))),
		statements: s,
		origin: p,
		context: m,
		primarySubjects: u,
		primary: l
	};
}
//#endregion
//#region src/generate.js
var K = /* @__PURE__ */ new Map(), Ue = 1e3;
function q(e, t) {
	let n = `${e}|${JSON.stringify(t)}`;
	if (K.has(n)) return K.get(n);
	let r = S(e, t);
	return K.size >= Ue && Array.from(K.keys()).slice(0, Math.floor(Ue / 2)).forEach((e) => K.delete(e)), K.set(n, r), r;
}
function We(e, t = {}) {
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
function Ge({ quads: t, context: n = {}, primarySubject: r = null, compactInline: i = !1, renderReverse: a = !1, remove: o = [], lang: s = null }) {
	let c = Object.assign({}, e, n), l = qe(t), u = qe(o), { subjectGroups: d, reverseIndex: f } = Je(l), p = Je(u).subjectGroups, { text: m, compactStats: h } = Ye(d, c, r, r && a ? f : null, i, p, s);
	return {
		text: m,
		context: c,
		compactStats: h
	};
}
function Ke({ quads: t, focusIRI: n, context: r = {}, compactInline: i = !0, renderReverse: a = !0, lang: o = null }) {
	if (!t?.length || !n) return {
		text: "",
		context: Object.assign({}, e, r),
		compactStats: null
	};
	let s = Object.assign({}, e, r), c = qe(t.filter((e) => e.subject.value === n || e.predicate.value === n || e.object.value === n || e.object.termType === "Literal" && e.object.datatype && (e.object.datatype.value || e.object.datatype) === n)), { subjectGroups: l, reverseIndex: u } = Je(c), d = Array.from(new Set(c.map((e) => e.subject.value)));
	if (d.length === 0) return {
		text: "",
		context: s,
		compactStats: null
	};
	let { text: f, compactStats: p } = Ye(l, s, d.includes(n) ? n : d[0], a ? u : null, i, /* @__PURE__ */ new Map(), o);
	return {
		text: f,
		context: s,
		compactStats: p
	};
}
function qe(e) {
	return !e || e.length === 0 ? [] : e.map((e) => e.subject.termType && e.predicate.termType && e.object.termType ? e : {
		subject: _.fromTerm(e.subject),
		predicate: _.fromTerm(e.predicate),
		object: _.fromTerm(e.object)
	}).sort((e, t) => {
		let n = e.subject.value.localeCompare(t.subject.value);
		if (n !== 0) return n;
		let r = e.predicate.value.localeCompare(t.predicate.value);
		if (r !== 0) return r;
		let i = (me(e.object), e.object.value), a = (me(t.object), t.object.value);
		return i.localeCompare(a);
	});
}
function Je(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = r.subject.value, i = t.get(e);
		if (i ? i.push(r) : t.set(e, [r]), r.object.termType === "NamedNode") {
			let e = r.object.value, t = n.get(e);
			t ? t.push(r) : n.set(e, [r]);
		}
	}
	return {
		subjectGroups: t,
		reverseIndex: n
	};
}
function Ye(n, r, i = null, a = null, o = !0, s = /* @__PURE__ */ new Map(), c = null) {
	let l = [], u = ve(n, r), d = Xe(n, c), f = {
		compactedSubjects: 0,
		skippedHeadings: 0,
		inlineAnnotations: 0
	}, p = /* @__PURE__ */ new Set(), m = /* @__PURE__ */ new Map();
	for (let [e, t] of n.entries()) m.set(e, Ce(t));
	let h = Object.entries(r).sort(([e], [t]) => e.localeCompare(t));
	for (let [t, n] of h) t !== "@vocab" && !t.startsWith("@") && !e[t] && u.has(t) && l.push(be(t, n));
	h.length > 0 && l.push("\n");
	let g = Array.from(n.keys()).sort(), _ = i ? [i, ...g.filter((e) => e !== i)] : g;
	for (let e of _) {
		let c = n.get(e);
		if (!c) continue;
		if (c.every((e) => p.has(e))) {
			f.skippedHeadings++, f.compactedSubjects++;
			continue;
		}
		let { types: u, literals: h, objects: g } = m.get(e), _ = q(e, r), v = d.get(e), y = !!v, b = y ? v.value : We(e, r), x = u.filter((e) => !p.has(e)), S = x.length > 0 ? x.map((e) => "." + q(e.object.value, r)).sort().join(" ") : "", C = c.find((e) => e.predicate.value === t);
		if (y && (!C || !p.has(C))) {
			let e = v.language ? " @" + v.language : "";
			S += (S ? " " : "") + "label" + e;
		}
		let w = S ? " " + S : "";
		l.push(`## ${b} {=${_}${w}}\n`), u.forEach((e) => p.add(e)), C && p.add(C);
		let T = y ? v.value : null;
		if (ye(h).forEach((e) => {
			(e.predicate.value !== "http://www.w3.org/2000/01/rdf-schema#label" || e.object.value !== T) && l.push(xe(e, r));
		}), ye(g).forEach((e) => {
			p.has(e) || l.push(Se(e, r, d, m, p, o, f));
		}), e === i && a && a.has(e)) {
			let i = a.get(e);
			i.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
			for (let e of i) {
				p.add(e);
				let i = n.get(e.subject.value), a = d.get(e.subject.value), s = a ? a.value : We(e.subject.value, r), c = q(e.subject.value, r), u = q(e.predicate.value, r), h = "";
				if (o && i) {
					let { types: n } = m.get(e.subject.value) || { types: [] }, a = d.get(e.subject.value), o = !!a, s = n.length > 0 ? n.map((e) => "." + q(e.object.value, r)).sort().join(" ") : "", c = o ? "label" + (a.language ? " @" + a.language : "") : "";
					if ((s || c) && (h = " " + [s, c].filter(Boolean).join(" "), f.inlineAnnotations++, n.forEach((e) => p.add(e)), o)) {
						let e = i.find((e) => e.predicate.value === t);
						e && p.add(e);
					}
					i.every((e) => p.has(e)) && (f.skippedHeadings++, f.compactedSubjects++);
				}
				l.push(`[${s}] {+${c} !${u}${h}}\n`);
			}
		}
		if (s.has(e)) {
			let t = s.get(e);
			for (let e of t) l.push(we(e, r));
			s.delete(e);
		}
		l.push("\n");
	}
	for (let [e, t] of s) {
		let n = q(e, r), i = We(e, r);
		l.push(`### ${i} {=${n}}\n`);
		for (let e of t) l.push(we(e, r));
		l.push("\n");
	}
	return {
		text: l.join(""),
		compactStats: f
	};
}
function Xe(e, t = null) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
	for (let t of e.values()) for (let e of t) if (e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.termType === "Literal") {
		let t = e.subject.value;
		r.has(t) || r.set(t, []), r.get(t).push(e.object);
	}
	let i = (e) => e.length === 0 ? null : (e.sort((e, t) => {
		let n = e.value.length - t.value.length;
		return n === 0 ? e.value.localeCompare(t.value) : n;
	}), e[0]);
	for (let [e, a] of r) {
		let r = null;
		t && (r = i(a.filter((e) => e.language === t))), r || (r = i(a.filter((e) => !e.language))), r || (r = i(a.filter((e) => e.language === "en"))), r || (r = i(a.filter((e) => e.language))), r && n.set(e, {
			value: r.value,
			language: r.language || null
		});
	}
	return n;
}
//#endregion
//#region src/index.js
function Ze({ text: e, quad: t, value: n, origin: r }) {
	let i = v(t, r?.quadIndex ? r : Te({ text: e }).origin);
	return !i || !i.valueRange ? e : e.substring(0, i.valueRange.start) + n + e.substring(i.valueRange.end);
}
//#endregion
//#region src/crawl.js
var Qe = /* @__PURE__ */ new Set(["http:", "https:"]), $e = "text/markdown, text/x-mdld, text/plain;q=0.9, text/html;q=0.8, application/xhtml+xml;q=0.8, */*;q=0.5", et = 5, tt = 5, nt = 100, rt = /\.(md|mdld|markdown|html?|xhtml)$/i, it = /image\/|audio\/|video\/|font\/|application\/(octet-stream|zip|gzip|pdf|wasm|protobuf)/i;
function at(e = 500) {
	let t = /* @__PURE__ */ new Map();
	return {
		async get(e) {
			let n = t.get(e);
			return n === void 0 ? null : (t.delete(e), t.set(e, n), n);
		},
		async set(n, r) {
			t.has(n) && t.delete(n), t.set(n, r), t.size > e && t.delete(t.keys().next().value);
		},
		async delete(e) {
			t.delete(e);
		}
	};
}
function ot(e, t) {
	if (e == null) return null;
	let n = String(e).trim();
	if (!n) return null;
	try {
		let e = new URL(n, t || void 0);
		return Qe.has(e.protocol) ? (e.hash = "", e.href) : null;
	} catch {
		return null;
	}
}
function st(e) {
	let t = e.slice(e.lastIndexOf("/") + 1), n = t.indexOf("?");
	return n !== -1 && (t = t.slice(0, n)), !t.includes(".") || rt.test(t);
}
function ct(e, t) {
	if (e) {
		let t = e.toLowerCase();
		if (t.includes("html")) return !0;
		if (/(markdown|mdld|json|javascript|css)/.test(t)) return !1;
	}
	let n = t.slice(0, 256).trimStart().slice(0, 32).toLowerCase();
	return n.startsWith("<!doctype html") || n.startsWith("<html");
}
function lt(e, t) {
	let n = /* @__PURE__ */ new Set();
	return ut(e, t, n), _t(e, t, n), [...n];
}
function ut(e, t, n) {
	let r = 0, i = 0, a = 0;
	for (let o = 0; o <= e.length; o++) {
		if (o < e.length && e.charCodeAt(o) !== 10) continue;
		let s = e.slice(a, o);
		a = o + 1, s.endsWith("\r") && (s = s.slice(0, -1));
		let c = s.trimStart(), l = s.length - c.length, u = c.charCodeAt(0);
		if (i > 0) {
			if (u === r) {
				let e = 0;
				for (; c.charCodeAt(e) === r;) e++;
				e >= i && c.slice(e).trim() === "" && (i = 0);
			}
			continue;
		}
		if (l <= 3 && (u === 96 || u === 126)) {
			let e = 0;
			for (; c.charCodeAt(e) === u;) e++;
			if (e >= 3) {
				r = u, i = e;
				continue;
			}
		}
		l <= 3 && u === 91 && dt(c, t, n) || ft(s, t, n);
	}
}
function dt(e, t, n) {
	let r = -1, i = 0;
	for (let t = 1; t < e.length; t++) {
		let n = e.charCodeAt(t);
		if (n === 92) t++;
		else if (n === 91) i++;
		else if (n === 93) {
			if (i === 0) {
				r = t;
				break;
			}
			i--;
		}
	}
	if (r === -1 || e.charCodeAt(r + 1) !== 58) return !1;
	let a = r + 2;
	for (; e[a] === " " || e[a] === "	";) a++;
	let o;
	if (e[a] === "<") {
		let t = e.indexOf(">", a + 1);
		if (t === -1) return !0;
		o = e.slice(a + 1, t);
	} else {
		let t = a;
		for (; t < e.length && e[t] !== " " && e[t] !== "	";) t++;
		o = e.slice(a, t);
	}
	return Tt(o, t, n), !0;
}
function ft(e, t, n) {
	let r = 0;
	for (; r < e.length;) {
		let i = e.charCodeAt(r);
		if (i === 92) {
			r += 2;
			continue;
		}
		if (i === 96) {
			let t = 1;
			for (; e.charCodeAt(r + t) === 96;) t++;
			let n = pt(e, r + t, t);
			r = n === -1 ? r + t : n;
			continue;
		}
		if (i === 60) {
			if (e.startsWith("<!--", r)) {
				let t = e.indexOf("-->", r + 4);
				if (t === -1) return;
				r = t + 3;
				continue;
			}
			let i = e.indexOf(">", r + 1);
			if (i !== -1 && mt(e, r + 1, i)) {
				Tt(e.slice(r + 1, i), t, n), r = i + 1;
				continue;
			}
			r++;
			continue;
		}
		if (i === 93 && e.charCodeAt(r + 1) === 40) {
			let i = ht(e, r + 2);
			if (i) {
				Tt(e.slice(i.urlStart, i.urlEnd), t, n), r = i.end + 1;
				continue;
			}
		}
		r++;
	}
}
function pt(e, t, n) {
	let r = t;
	for (; r < e.length;) if (e.charCodeAt(r) === 96) {
		let t = 1;
		for (; e.charCodeAt(r + t) === 96;) t++;
		if (t === n) return r + t;
		r += t;
	} else r++;
	return -1;
}
function mt(e, t, n) {
	if (n - t < 2) return !1;
	let r = e.charCodeAt(t);
	if (!(r >= 65 && r <= 90 || r >= 97 && r <= 122)) return !1;
	for (let i = t + 1; i < n; i++) {
		if (r = e.charCodeAt(i), r === 58) return !0;
		if (!(r >= 65 && r <= 90 || r >= 97 && r <= 122 || r >= 48 && r <= 57 || r === 43 || r === 45 || r === 46)) return !1;
	}
	return !1;
}
function ht(e, t) {
	if (e[t] === "<") {
		let n = e.indexOf(">", t + 1);
		if (n === -1) return null;
		let r = gt(e, n + 1);
		return r === -1 ? null : {
			urlStart: t + 1,
			urlEnd: n,
			end: r
		};
	}
	let n = 0, r = t;
	for (; r < e.length;) {
		let i = e[r];
		if (i === "\\") {
			r += 2;
			continue;
		}
		if (i === "(") n++;
		else if (i === ")") {
			if (n === 0) return {
				urlStart: t,
				urlEnd: r,
				end: r
			};
			n--;
		} else if (i === " " || i === "	") {
			let n = gt(e, r);
			return n === -1 ? null : {
				urlStart: t,
				urlEnd: r,
				end: n
			};
		}
		r++;
	}
	return null;
}
function gt(e, t) {
	let n = t;
	for (; e[n] === " " || e[n] === "	";) n++;
	let r = e[n];
	if (r !== "\"" && r !== "'" && r !== "(") return -1;
	let i = r === "(" ? ")" : r, a = e.indexOf(i, n + 1);
	if (a === -1) return -1;
	let o = a + 1;
	for (; e[o] === " " || e[o] === "	";) o++;
	return e[o] === ")" ? o : -1;
}
function _t(e, t, n) {
	let r = 0;
	for (; r < e.length;) {
		let i = e.indexOf("<", r);
		if (i === -1) break;
		if (r = i, e.startsWith("<!--", r)) {
			let t = e.indexOf("-->", r + 4);
			if (t === -1) return;
			r = t + 3;
			continue;
		}
		let a = e[r + 1];
		if (a === "s" || a === "S") {
			let t = vt(e, r);
			if (t) {
				r = yt(e, r, t);
				continue;
			}
		}
		if ((a === "a" || a === "A") && bt(e[r + 2])) {
			let i = xt(e, r);
			if (i === -1) return;
			let a = Ct(e.slice(r, i + 1), "href");
			a && Tt(a, t, n), r = i + 1;
			continue;
		}
		r = i + 1;
	}
}
function vt(e, t) {
	if (e[t + 1] !== "s" && e[t + 1] !== "S" || !e[t + 1]) return null;
	let n = e.slice(t + 2, t + 7).toLowerCase();
	if (n.startsWith("cript")) {
		let n = e[t + 7];
		if (bt(n) || n === void 0) return "script";
	}
	if (n.startsWith("tyle")) {
		let n = e[t + 6];
		if (bt(n) || n === void 0) return "style";
	}
	return null;
}
function yt(e, t, n) {
	let r = t + 1;
	for (; r < e.length;) {
		let t = e.indexOf("</", r);
		if (t === -1) return e.length;
		if (e.slice(t + 2, t + 2 + n.length).toLowerCase() === n) {
			let r = e[t + 2 + n.length];
			if (bt(r) || r === void 0) {
				let n = e.indexOf(">", t);
				return n === -1 ? e.length : n + 1;
			}
		}
		r = t + 2;
	}
	return e.length;
}
function bt(e) {
	return e === void 0 || e === ">" || e === "/" || e === " " || e === "	" || e === "\n" || e === "\r" || e === "\f";
}
function xt(e, t) {
	let n = 0;
	for (let r = t + 1; r < e.length; r++) {
		let t = e[r];
		if (n) t === n && (n = 0);
		else if (t === "\"" || t === "'") n = t;
		else if (t === ">") return r;
	}
	return -1;
}
function St(e) {
	return e === " " || e === "	" || e === "\n" || e === "\r" || e === "\f";
}
function Ct(e, t) {
	let n = 0;
	for (; n < e.length;) {
		let r = e.indexOf("=", n);
		if (r === -1) return null;
		let i = r - 1;
		for (; i >= 0 && St(e[i]);) i--;
		let a = i;
		for (; a >= 0 && !St(e[a]);) a--;
		let o = r + 1;
		for (; St(e[o]);) o++;
		let s, c, l = e[o];
		if (l === "\"" || l === "'") {
			let t = e.indexOf(l, o + 1);
			if (t === -1) return null;
			s = e.slice(o + 1, t), c = t + 1;
		} else {
			let t = o;
			for (; t < e.length && !St(e[t]) && e[t] !== ">";) t++;
			s = e.slice(o, t), c = t;
		}
		if (e.slice(a + 1, i + 1).toLowerCase() === t) return wt(s);
		n = c;
	}
	return null;
}
function wt(e) {
	return e.includes("&") ? e.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (e, t) => {
		if (t[0] === "#") {
			let n = t[1] === "x" || t[1] === "X" ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10);
			return Number.isFinite(n) ? String.fromCodePoint(n) : e;
		}
		switch (t) {
			case "amp": return "&";
			case "lt": return "<";
			case "gt": return ">";
			case "quot": return "\"";
			case "apos": return "'";
			default: return e;
		}
	}) : e;
}
function Tt(e, t, n) {
	let r = ot(e, t);
	r && n.add(r);
}
async function Et(e, t = {}) {
	let n = Math.max(0, t.maxDepth ?? et) | 0, r = Math.max(1, t.concurrency ?? tt) | 0, i = Math.max(1, t.maxPages ?? nt) | 0, a = t.sameOrigin ?? !1, o = t.fetchFn ?? globalThis.fetch, s = t.baseHref ?? globalThis.location?.href, c = t.cache ?? at(), l = t.accept ?? st, u = t.signal ?? null;
	if (typeof o != "function") throw TypeError("crawl: no fetch implementation available — pass options.fetchFn");
	let d = ot(e, s);
	if (!d) throw TypeError(`crawl: cannot resolve "${e}" to an absolute http(s) URL (baseHref: ${s ?? "none"})`);
	if (u?.aborted) return {
		urls: [],
		pages: [],
		errors: [],
		aborted: !0
	};
	let f = new URL(d).origin, p = {
		get: async (e) => {
			try {
				return await c.get(e) ?? null;
			} catch {
				return null;
			}
		},
		set: async (e, t) => {
			try {
				await c.set(e, t);
			} catch {}
		}
	}, m = [{
		url: d,
		depth: 0
	}], h = /* @__PURE__ */ new Set([d]), g = /* @__PURE__ */ new Map(), _ = [], v = 0, y = !1, b = (e) => (!a || new URL(e).origin === f) && l(e);
	async function x(e) {
		if (u?.aborted) {
			y = !0;
			return;
		}
		let { url: r, depth: a } = e, s = await p.get(r), c = { Accept: $e };
		s?.etag && (c["If-None-Match"] = s.etag), s?.lastModified && (c["If-Modified-Since"] = s.lastModified);
		let l, d, f = r, v = null, x = !1;
		try {
			let e = await o(r, {
				headers: c,
				signal: u || void 0,
				redirect: "follow",
				cache: "no-store"
			});
			if (v = e.status, f = ot(e.url, r) || r, e.status === 304 && s) l = s.text, d = s.contentType || "", f = s.finalUrl || f, await p.set(r, s);
			else if (e.ok) {
				if (d = e.headers.get("content-type") || "", it.test(d)) {
					try {
						await e.body?.cancel();
					} catch {}
					_.push({
						url: r,
						kind: "binary",
						status: v,
						message: `unsupported content-type: ${d}`
					});
					return;
				}
				l = await e.text(), await p.set(r, {
					text: l,
					contentType: d,
					finalUrl: f,
					etag: e.headers.get("etag"),
					lastModified: e.headers.get("last-modified"),
					timestamp: Date.now()
				});
			} else if (e.status >= 500 && s) l = s.text, d = s.contentType || "", f = s.finalUrl || f, x = !0;
			else {
				_.push({
					url: r,
					kind: "http",
					status: e.status,
					message: `HTTP ${e.status} for ${r}`
				});
				return;
			}
		} catch (e) {
			if (u?.aborted || e?.name === "AbortError") {
				y = !0;
				return;
			}
			if (s) l = s.text, d = s.contentType || "", f = s.finalUrl || r, x = !0;
			else {
				_.push({
					url: r,
					kind: "network",
					message: String(e?.message || e)
				});
				return;
			}
		}
		let S = /* @__PURE__ */ new Set();
		ut(l, f, S), _t(l, f, S);
		let C = {
			url: r,
			finalUrl: f,
			depth: a,
			status: v,
			contentType: d,
			kind: ct(d, l) ? "html" : "text",
			stale: x,
			text: l,
			links: [...S]
		};
		if (g.set(r, C), a < n) for (let e of S) {
			if (h.size >= i) return;
			!h.has(e) && b(e) && (h.add(e), m.push({
				url: e,
				depth: a + 1
			}));
		}
		try {
			await t.onPage?.(C);
		} catch (e) {
			_.push({
				url: r,
				kind: "callback",
				message: String(e?.message || e)
			});
		}
	}
	let S = /* @__PURE__ */ new Set();
	for (;;) {
		for (; v < m.length && S.size < r && !y;) {
			let e = m[v++], t = x(e).catch((t) => {
				_.push({
					url: e.url,
					kind: "internal",
					message: String(t?.message || t)
				});
			}).finally(() => {
				S.delete(t);
			});
			S.add(t);
		}
		if (S.size === 0) break;
		await Promise.race(S);
	}
	let C = [];
	for (let { url: e } of m) {
		let t = g.get(e);
		t && C.push(t);
	}
	return {
		urls: C.map((e) => e.url),
		pages: C,
		errors: _,
		aborted: y
	};
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/typeof.js
function J(e) {
	"@babel/helpers - typeof";
	return J = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, J(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/toPrimitive.js
function Dt(e, t) {
	if (J(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (J(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/toPropertyKey.js
function Ot(e) {
	var t = Dt(e, "string");
	return J(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.149.0/helpers/esm/defineProperty.js
function kt(e, t, n) {
	return (t = Ot(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/graph.js
var At = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", jt = new Map([
	"http://www.w3.org/2000/01/rdf-schema#label",
	"http://www.w3.org/2004/02/skos/core#prefLabel",
	"http://schema.org/name",
	"https://schema.org/name",
	"http://xmlns.com/foaf/0.1/name",
	"http://purl.org/dc/terms/title",
	"http://purl.org/dc/elements/1.1/title"
].map((e, t) => [e, t])), Mt = 6, Nt = 6.2832, Pt = 2.39996, Ft = 25, It = 60, Lt = typeof HTMLElement < "u" ? HTMLElement : class {}, Rt = (e) => {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t ^= t >>> 15, t = Math.imul(t, 2246822507), t ^= t >>> 13, t >>> 0;
}, zt = (e, t, n) => e < t ? t : e > n ? n : e, Bt = (e, t) => {
	let n = new Int32Array(t + 1), r = new Int32Array(e.length);
	for (let t = 0; t < e.length; t++) n[e[t] + 1]++;
	for (let e = 0; e < t; e++) n[e + 1] += n[e];
	let i = n.slice(0, t);
	for (let t = 0; t < e.length; t++) r[i[e[t]]++] = t;
	return [n, r];
}, Vt = class {
	constructor() {
		this.n = 0, this.alpha = 0, this.target = 0, this.iter = 0, this.charge = 40, this.linkDist = 45, this.gravity = .03, this.x = this.y = /* @__PURE__ */ new Float64Array(), this.ls = this.lt = /* @__PURE__ */ new Int32Array(), this._ph = 0, this._cur = 0, this._cap = 0, this._stk = /* @__PURE__ */ new Int32Array(256);
	}
	get active() {
		return this.n > 0 && (this.alpha >= .001 || this.target > 0);
	}
	load(e, t, n, r, i, a, o, s) {
		let c = e.length;
		Object.assign(this, {
			n: c,
			x: e,
			y: t,
			ls: n,
			lt: r,
			deg: i,
			r: a,
			mass: o,
			pin: s,
			vx: new Float64Array(c),
			vy: new Float64Array(c),
			alpha: 1,
			_ph: 0
		}), this.decay = 1 - .001 ** (1 / (c > 5e4 ? 120 : c > 2e4 ? 180 : 300)), this.theta = c > 5e4 ? 1.2 : c > 5e3 ? 1 : .85, this.relink();
	}
	relink() {
		let { ls: e, lt: t, deg: n, linkDist: r } = this, i = e.length;
		this.len = new Float32Array(i), this.str = new Float32Array(i), this.bias = new Float32Array(i);
		for (let a = 0; a < i; a++) {
			let i = n[e[a]], o = n[t[a]];
			this.len[a] = r * (.7 + .4 * Math.log2(1 + Math.max(i, o))), this.str[a] = 1 / Math.min(i, o), this.bias[a] = i / (i + o);
		}
	}
	reheat(e = .6) {
		this.alpha = Math.max(this.alpha, e);
	}
	step(e, t = 1) {
		let n = performance.now(), r = 0;
		for (; this.active;) {
			if (this._ph === 0 && (this._build(), this._cur = 0, this._ph = 1), this._ph === 1) {
				if (!this._repel(n + e)) return !0;
				this._ph = 2;
			}
			if (this._integrate(), this._ph = 0, ++r >= t || performance.now() - n > e) break;
		}
		return this.active;
	}
	_alloc(e) {
		let t = (e, t) => {
			let n = new e.constructor(t);
			return n.set(e), n;
		};
		if (!this.nm) Object.assign(this, {
			nm: new Float64Array(e),
			nsx: new Float64Array(e),
			nsy: new Float64Array(e),
			nw: new Float64Array(e),
			nb: new Int32Array(e),
			ch: new Int32Array(e * 4)
		});
		else {
			for (let n of [
				"nm",
				"nsx",
				"nsy",
				"nw"
			]) this[n] = t(this[n], e);
			this.nb = t(this.nb, e), this.ch = t(this.ch, e * 4);
		}
		this._cap = e;
	}
	_new(e) {
		let t = this._cnt++;
		return this.nm[t] = this.nsx[t] = this.nsy[t] = 0, this.nb[t] = -2, this.nw[t] = e, this.ch.fill(0, t * 4, t * 4 + 4), t;
	}
	_build() {
		let { x: e, y: t, n } = this, r = Infinity, i = Infinity, a = -Infinity, o = -Infinity;
		for (let s = 0; s < n; s++) {
			let n = e[s], c = t[s];
			n < r && (r = n), n > a && (a = n), c < i && (i = c), c > o && (o = c);
		}
		let s = Math.max(a - r, o - i, 1) * 1.001;
		this._cx = (r + a) / 2, this._cy = (i + o) / 2, this._hw = s / 2, this._cap < 2 * n + 80 && this._alloc(2 * n + 80), this._cnt = 0, this._new(s);
		for (let e = 0; e < n; e++) this._cnt + 70 > this._cap && this._alloc(this._cap * 2), this._insert(e);
	}
	_insert(e) {
		let { x: t, y: n, mass: r, nm: i, nsx: a, nsy: o, nb: s, ch: c } = this, l = t[e], u = n[e], d = r[e], f = 0, p = this._cx, m = this._cy, h = this._hw, g = 0;
		for (;;) {
			i[f] += d, a[f] += l * d, o[f] += u * d;
			let _ = s[f];
			if (_ === -2) {
				s[f] = e;
				return;
			}
			if (_ >= 0) {
				if (g >= 28) return;
				s[f] = -1;
				let e = this._new(h), l = +(t[_] > p) | (n[_] > m ? 2 : 0);
				c[f * 4 + l] = e, s[e] = _, i[e] = r[_], a[e] = t[_] * r[_], o[e] = n[_] * r[_];
			}
			let v = l > p | (u > m ? 2 : 0);
			h *= .5, p += v & 1 ? h : -h, m += v & 2 ? h : -h;
			let y = c[f * 4 + v];
			y || (y = this._new(h * 2), c[f * 4 + v] = y), f = y, g++;
		}
	}
	_repel(e) {
		let { x: t, y: n, vx: r, vy: i, r: a, n: o, nm: s, nsx: c, nsy: l, nw: u, nb: d, ch: f, _stk: p } = this, m = this.charge * this.alpha, h = this.theta * this.theta;
		for (let g = this._cur; g < o; g++) {
			if ((g & 63) == 63 && performance.now() > e) return this._cur = g, !1;
			let o = t[g], _ = n[g], v = a[g], y = 0, b = 0, x = 0;
			for (p[x++] = 0; x;) {
				let e = p[--x], t = s[e];
				if (t === 0) continue;
				let n = d[e], r = c[e] / t - o, i = l[e] / t - _, S = r * r + i * i;
				if (n >= 0) {
					if (n === g) continue;
					S < 1e-6 && (r = Math.random() - .5, i = Math.random() - .5, S = r * r + i * i + 1e-6);
					let e = v + a[n] + 3, o = m * t / Math.max(S, Ft);
					if (S < e * e) {
						let t = Math.sqrt(S);
						o += (e - t) / t * .35;
					}
					y -= r * o, b -= i * o;
				} else if (u[e] * u[e] < h * S) {
					let e = m * t / Math.max(S, Ft);
					y -= r * e, b -= i * e;
				} else {
					let t = e * 4;
					for (let e = 0; e < 4; e++) {
						let n = f[t + e];
						n && (p[x++] = n);
					}
				}
			}
			r[g] += y, i[g] += b;
		}
		return !0;
	}
	_integrate() {
		let { x: e, y: t, vx: n, vy: r, ls: i, lt: a, len: o, str: s, bias: c, n: l, alpha: u, pin: d } = this;
		for (let l = 0; l < i.length; l++) {
			let d = i[l], f = a[l], p = e[f] + n[f] - e[d] - n[d], m = t[f] + r[f] - t[d] - r[d], h = Math.sqrt(p * p + m * m) || 1e-6, g = (h - o[l]) / h * u * s[l], _ = c[l];
			p *= g, m *= g, n[f] -= p * _, r[f] -= m * _, n[d] += p * (1 - _), r[d] += m * (1 - _);
		}
		let f = this.gravity * u;
		for (let i = 0; i < l; i++) {
			if (d[i]) {
				n[i] = r[i] = 0;
				continue;
			}
			n[i] = (n[i] - e[i] * f) * .6, r[i] = (r[i] - t[i] * f) * .6;
			let a = n[i] * n[i] + r[i] * r[i];
			if (a > 3600) {
				let e = It / Math.sqrt(a);
				n[i] *= e, r[i] *= e;
			}
			a !== a && (n[i] = r[i] = 0, e[i] = t[i] = 0), e[i] += n[i], t[i] += r[i];
		}
		this.alpha += (this.target - this.alpha) * this.decay, this.iter++;
	}
};
function Ht(e, t, n, r, i, a, o, s, c, l) {
	let u = new Int32Array(e), d = new Int32Array(e), f = 0, p = 0, m = 0;
	for (let t = 0; t < e; t++) c[t] && (u[p++] = t);
	let h = () => {
		for (; f < p;) {
			let e = u[f++];
			for (let a = r[e]; a < r[e + 1]; a++) {
				let r = i[a], f = t[r] === e ? n[r] : t[r];
				if (c[f]) continue;
				let m = d[e]++, h = m * Pt + e, g = l * (.8 + .3 * Math.sqrt(m));
				o[f] = o[e] + Math.cos(h) * g, s[f] = s[e] + Math.sin(h) * g, c[f] = 1, u[p++] = f;
			}
		}
	};
	h();
	for (let t = 0; t < e; t++) {
		let e = a[t];
		if (c[e]) continue;
		let n = m * Pt, r = l * 1.6 * Math.sqrt(++m);
		o[e] = Math.cos(n) * r, s[e] = Math.sin(n) * r, c[e] = 1, u[p++] = e, h();
	}
}
var Ut = ":host{display:block;position:relative;height:480px;overflow:hidden;color:#eee;touch-action:none;user-select:none;-webkit-user-select:none;background:#1a1a1a}\ncanvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;background:#1a1a1a}\n.hud{position:absolute;left:8px;top:6px;font:11px/1.2 system-ui,sans-serif;opacity:.6;pointer-events:none;display:flex;gap:8px;align-items:center;color:#ccc}\n.bar{width:44px;height:3px;border-radius:2px;background:#444;overflow:hidden}.bar i{display:block;height:100%;width:0;background:#1D9E75}\n.tip{position:absolute;left:0;top:0;pointer-events:none;max-width:320px;padding:6px 9px;border-radius:7px;font:12px/1.4 system-ui,sans-serif;background:#2a2a2a;color:#eee;border:1px solid #444;box-shadow:0 4px 16px #0003;display:none;z-index:2;overflow-wrap:anywhere}\n.tip b{display:block}.tip small{display:block;opacity:.6}", Wt = class extends Lt {
	constructor() {
		super();
		let e = this.attachShadow({ mode: "open" });
		e.innerHTML = `<style>${Ut}</style><canvas></canvas><div class="hud"><span></span><div class="bar"><i></i></div></div><div class="tip"></div>`, this._cv = e.querySelector("canvas"), this._g2 = this._cv.getContext("2d"), this._stat = e.querySelector(".hud span"), this._bar = e.querySelector(".bar i"), this._tip = e.querySelector(".tip"), this._quads = [], this._pfx = [], this._L = new Vt(), this._ids = null, this._names = [], this._typ = /* @__PURE__ */ new Int32Array(), this._classes = [null], this._lits = /* @__PURE__ */ new Map(), this._lab = /* @__PURE__ */ new Map(), this._lc = [], this._plc = [], this._v = {
			k: 1,
			x: 0,
			y: 0
		}, this._w = 600, this._h = 480, this._dpr = 1, this._fg = "#888", this._halo = "rgba(255,255,255,.8)", this._tt = -1e9, this._sel = -1, this._hov = -1, this._nl = [], this._el = [], this._auto = !0, this._fc = 0, this._ht = 0, this._st = "", this._occ = /* @__PURE__ */ new Uint8Array(), this._oc = 1, this._or = 1, this._ptrs = /* @__PURE__ */ new Map(), this._gs = null, this._bend = /* @__PURE__ */ new Float32Array(), this._lp = /* @__PURE__ */ new Int32Array(), this._pc = [], this._fill = [], this._ring = [], this._pOff = this._pList = this._cOff = this._cList = this._order = this._off = this._adj = /* @__PURE__ */ new Int32Array(), this._bind();
	}
	connectedCallback() {
		this._ro = new ResizeObserver(() => this._resize()), this._ro.observe(this), this._mq = typeof matchMedia < "u" ? matchMedia("(prefers-color-scheme: dark)") : null, this._onTheme = () => {
			this._tt = -1e9, this._dirty = !0, this._wake();
		}, this._mq?.addEventListener("change", this._onTheme), this._resize(), this._quads.length && !this._ids && this._queue(), this._wake();
	}
	disconnectedCallback() {
		cancelAnimationFrame(this._raf), this._raf = 0, this._ro?.disconnect(), this._mq?.removeEventListener("change", this._onTheme);
	}
	attributeChangedCallback(e, t, n) {
		let r = this._L;
		e === "height" ? this.style.height = /^\d+$/.test(n) ? n + "px" : n || "" : e === "charge" ? (r.charge = Math.abs(parseFloat(n)) || 40, this.reheat(.5)) : e === "link-dist" ? (r.linkDist = parseFloat(n) || 45, r.n && r.relink(), this.reheat(.6)) : (this._dirty = !0, this._wake());
	}
	get quads() {
		return this._quads;
	}
	set quads(e) {
		this._quads = e || [], this._queue();
	}
	get context() {
		return this._ctxObj;
	}
	set context(e) {
		this._ctxObj = e || {}, this._pfx = Object.entries(this._ctxObj).map(([e, t]) => [e, typeof t == "string" ? t : t?.["@id"]]).filter(([e, t]) => t && e[0] !== "@").sort((e, t) => t[1].length - e[1].length), this._queue();
	}
	get positions() {
		let e = {}, t = this._L;
		for (let n = 0; n < t.n; n++) e[this._names[n]] = [t.x[n], t.y[n]];
		return e;
	}
	set positions(e) {
		this._seed = e, this._queue();
	}
	reheat(e = .6) {
		this._L.reheat(e), this._wake();
	}
	fit() {
		this._auto = !1, this._anim = this._fitTarget(), this._wake();
	}
	select(e) {
		let t = e == null ? -1 : this._ids?.get(e);
		this._select(t === void 0 ? -1 : t);
	}
	focus(e, { zoom: t = 1.5 } = {}) {
		let n = this._ids?.get(e);
		if (n === void 0) return !1;
		this._select(n);
		let r = Math.max(this._v.k, t);
		return this._auto = !1, this._anim = {
			k: r,
			x: this._w / 2 - this._L.x[n] * r,
			y: this._h / 2 - this._L.y[n] * r
		}, this._wake(), !0;
	}
	pin(e, t = !0) {
		let n = this._ids?.get(e);
		n !== void 0 && (this._L.pin[n] = +!!t, this._dirty = !0, this._wake());
	}
	getNode(e) {
		let t = this._ids?.get(e);
		if (t === void 0) return null;
		let n = this._L, r = this._typ[t];
		return {
			id: e,
			label: this._label(t),
			x: n.x[t],
			y: n.y[t],
			degree: n.deg[t],
			pinned: !!(n.pin[t] & 1),
			type: r ? this._classes[r] : null,
			literals: (this._lits.get(t) || []).map(([e, t]) => ({
				predicate: e,
				value: t
			}))
		};
	}
	_queue() {
		this._pend || (this._pend = !0, queueMicrotask(() => {
			this._pend = !1, this._ingest();
		}));
	}
	_ingest() {
		let e = /* @__PURE__ */ new Map(), t = [], n = [], r = [], i = [], a = [], o = [], s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = [null], u = /* @__PURE__ */ new Map(), d = [], f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set(), m = (e) => e.termType === "BlankNode" ? "_:" + e.value : e.value, h = (i) => {
			let a = e.get(i);
			return a === void 0 && (a = t.length, e.set(i, a), t.push(i), n.push(0), r.push(0)), a;
		};
		for (let e of this._quads) {
			if (!e || !e.subject || !e.predicate || !e.object) continue;
			let t = e.object, g = e.predicate.value, _ = m(e.subject), v = h(_);
			if (t.termType === "Literal") {
				n[v]++;
				let e = jt.get(g);
				if (e !== void 0) {
					let n = s.get(_);
					(!n || e < n[1]) && s.set(_, [t.value, e]);
				}
				let r = c.get(v);
				r || c.set(v, r = []), r.length < Mt && r.push([g, t.value]);
				continue;
			}
			if (t.termType !== "NamedNode" && t.termType !== "BlankNode") continue;
			let y = h(m(t));
			if (v === y) continue;
			let b = f.get(g);
			b === void 0 && (b = d.length, f.set(g, b), d.push(g));
			let x = (v * 1048576 + y) * 4096 + (b & 4095);
			if (!p.has(x) && (p.add(x), i.push(v), a.push(y), o.push(b), g === At && t.termType === "NamedNode" && !r[v])) {
				let e = u.get(t.value);
				e === void 0 && (e = l.length, u.set(t.value, e), l.push(t.value)), r[v] = e;
			}
		}
		for (let t = 1; t < l.length; t++) {
			let n = e.get(l[t]);
			r[n] || (r[n] = t);
		}
		let g = t.length, _ = i.length, v = Int32Array.from(i), y = Int32Array.from(a), b = Int32Array.from(o), x = new Int32Array(g + 1);
		for (let e = 0; e < _; e++) x[v[e] + 1]++, x[y[e] + 1]++;
		for (let e = 0; e < g; e++) x[e + 1] += x[e];
		let S = x.slice(0, g), C = new Int32Array(2 * _), w = new Int32Array(g);
		for (let e = 0; e < _; e++) C[S[v[e]]++] = e, C[S[y[e]]++] = e;
		let T = new Float64Array(g), E = new Float64Array(g);
		for (let e = 0; e < g; e++) w[e] = x[e + 1] - x[e], T[e] = Math.min(18, 3 + 1.6 * Math.sqrt(w[e] + .5 * n[e])), E[e] = 1 + .5 * Math.sqrt(w[e]);
		let D = /* @__PURE__ */ new Map(), O = new Float32Array(_), k = (e) => Math.min(v[e], y[e]) * 1048576 + Math.max(v[e], y[e]);
		for (let e = 0; e < _; e++) D.set(k(e), (D.get(k(e)) || 0) + 1);
		let A = /* @__PURE__ */ new Map();
		for (let e = 0; e < _; e++) {
			let t = k(e), n = D.get(t);
			if (n < 2) continue;
			let r = A.get(t) || 0;
			A.set(t, r + 1), O[e] = (r - (n - 1) / 2) * 16 * (v[e] < y[e] ? 1 : -1);
		}
		let j = this._ids, M = this._L, ee = M.x, te = M.y, N = M.pin, ne = this._seed;
		this._seed = null;
		let P = new Float64Array(g), F = new Float64Array(g), I = new Uint8Array(g), L = new Uint8Array(g);
		for (let e = 0; e < g; e++) {
			let n = ne?.[t[e]], r = j?.get(t[e]);
			n ? (P[e] = n[0], F[e] = n[1], I[e] = 1) : r !== void 0 && (P[e] = ee[r], F[e] = te[r], I[e] = 1, L[e] = N[r] & 1);
		}
		let R = j && j.size > 0 && I.some((e) => e), re = Int32Array.from({ length: g }, (e, t) => t).sort((e, t) => w[t] - w[e]);
		Ht(g, v, y, x, C, re, P, F, I, M.linkDist);
		let [ie, ae] = Bt(b, d.length), [oe, se] = Bt(r, l.length);
		this._pc = d.map((e) => e === At ? "hsl(220 8% 55%)" : `hsl(${Rt(e) % 360} 50% 55%)`), this._fill = l.map((e, t) => t ? `hsl(${Rt(e) % 360} 70% 56%)` : "hsl(215 12% 62%)"), this._ring = l.map((e, t) => t ? `hsl(${Rt(e) % 360} 70% 36%)` : "hsl(215 12% 42%)"), Object.assign(this, {
			_ids: e,
			_names: t,
			_typ: Int32Array.from(r),
			_classes: l,
			_lits: c,
			_lab: s,
			_lc: [],
			_plc: [],
			_preds: d,
			_bend: O,
			_lp: b,
			_pOff: ie,
			_pList: ae,
			_cOff: oe,
			_cList: se,
			_order: re,
			_off: x,
			_adj: C
		});
		let z = this._L;
		z.charge = Math.abs(parseFloat(this.getAttribute("charge"))) || 40, z.linkDist = parseFloat(this.getAttribute("link-dist")) || 45, z.load(P, F, v, y, w, T, E, L), R && (z.alpha = .5), this._sel = -1, this._hov = -1, this._nl = [], this._el = [], this._tip.style.display = "none", R || (this._auto = !0, g && Object.assign(this._v, this._fitTarget())), this._theme(), this._dirty = !0, this._wake();
	}
	_curie(e) {
		for (let [t, n] of this._pfx) if (e.length > n.length && e.startsWith(n)) return t + ":" + e.slice(n.length);
		let t = e.match(/[#/:]([^#/:]+)\/?$/), n = t ? t[1] : e;
		try {
			n = decodeURIComponent(n);
		} catch {}
		return n;
	}
	_label(e) {
		var t;
		return (t = this._lc)[e] ?? (t[e] = this._lab.get(this._names[e])?.[0] ?? this._curie(this._names[e]));
	}
	_plabel(e) {
		var t;
		return (t = this._plc)[e] ?? (t[e] = this._lab.get(this._preds[e])?.[0] ?? this._curie(this._preds[e]));
	}
	_theme() {
		this._tt = performance.now(), this._fg = "#eee", this._halo = "rgba(0,0,0,.8)";
	}
	_resize() {
		let e = this.clientWidth || 600, t = this.clientHeight || 480, n = Math.min(globalThis.devicePixelRatio || 1, this._L.n > 5e4 ? 1.5 : 2);
		Object.assign(this, {
			_w: e,
			_h: t,
			_dpr: n,
			_oc: Math.ceil(e / 12) + 1,
			_or: Math.ceil(t / 12) + 1
		}), this._cv.width = Math.round(e * n), this._cv.height = Math.round(t * n), this._occ = new Uint8Array(this._oc * this._or), this._auto && this._L.n && Object.assign(this._v, this._fitTarget()), this._dirty = !0, this._wake();
	}
	_fitTarget() {
		let { x: e, y: t, n } = this._L, r = this._w, i = this._h;
		if (!n) return {
			k: 1,
			x: r / 2,
			y: i / 2
		};
		let a = 0, o = 0;
		for (let r = 0; r < n; r++) a += e[r], o += t[r];
		a /= n, o /= n;
		let s = 0, c = 0;
		for (let r = 0; r < n; r++) s += (e[r] - a) ** 2, c += (t[r] - o) ** 2;
		let l = 3 * Math.sqrt(s / n) + 20, u = 3 * Math.sqrt(c / n) + 20, d = Infinity, f = Infinity, p = -Infinity, m = -Infinity;
		for (let r = 0; r < n; r++) Math.abs(e[r] - a) <= l && Math.abs(t[r] - o) <= u && (e[r] < d && (d = e[r]), e[r] > p && (p = e[r]), t[r] < f && (f = t[r]), t[r] > m && (m = t[r]));
		let h = zt(Math.min((r - 100) / (p - d || 1), (i - 100) / (m - f || 1)), .005, 1.5);
		return {
			k: h,
			x: r / 2 - h * (d + p) / 2,
			y: i / 2 - h * (f + m) / 2
		};
	}
	_zoomAt(e, t, n) {
		let r = this._v, i = zt(r.k * n, .005, 60);
		n = i / r.k, r.x = e - (e - r.x) * n, r.y = t - (t - r.y) * n, r.k = i, this._dirty = !0, this._wake();
	}
	_wake() {
		this._raf || (this._raf = requestAnimationFrame(() => {
			this._raf = 0, this._frame();
		}));
	}
	_frame() {
		let e = this._L, t = e.active, n = !1;
		if (t) {
			let t = e.iter;
			e.step(e.n > 2e4 ? 8 : 5, e.n > 3e3 ? 1 : 2), e.iter !== t && (this._dirty = !0), n = e.active;
		}
		if (this._auto && e.n && (n ? ++this._fc % 6 == 0 : t) && (this._anim = this._fitTarget()), t && !n && (this._auto = !1, this.dispatchEvent(new CustomEvent("settled"))), this._anim) {
			let e = this._anim, t = this._v;
			t.k += (e.k - t.k) * .2, t.x += (e.x - t.x) * .2, t.y += (e.y - t.y) * .2, this._dirty = !0, Math.abs(e.k - t.k) < e.k * .001 && Math.abs(e.x - t.x) < .5 && Math.abs(e.y - t.y) < .5 && (Object.assign(t, e), this._anim = null);
		}
		this._dirty && (this._dirty = !1, this._draw());
		let r = performance.now();
		if (r - this._ht > 150 || !n) {
			this._ht = r;
			let t = `${e.n.toLocaleString()} nodes · ${e.ls.length.toLocaleString()} links`;
			t !== this._st && (this._stat.textContent = this._st = t), this._bar.style.width = (n ? Math.min(1, e.alpha) * 100 : 0) + "%";
		}
		(n || this._anim) && this._wake();
	}
	_draw() {
		let e = this._L, t = this._cv, n = this._g2, r = this._dpr, i = this._v, a = this._w, o = this._h;
		if (n.setTransform(1, 0, 0, 1, 0, 0), n.clearRect(0, 0, t.width, t.height), !e.n) return;
		performance.now() - this._tt > 1e3 && this._theme();
		let { x: s, y: c, r: l, ls: u, lt: d } = e, f = i.k, p = 1 / f, m = u.length, h = this._sel, g = this._bend, _ = -i.x * p, v = -i.y * p, y = (a - i.x) * p, b = (o - i.y) * p;
		n.setTransform(r * f, 0, 0, r * f, r * i.x, r * i.y), n.lineCap = "round";
		let x = (e, t) => {
			let r = u[e], i = d[e], a = s[r], o = c[r], m = s[i], h = c[i];
			if (a < _ && m < _ || a > y && m > y || o < v && h < v || o > b && h > b) return;
			let x = m - a, S = h - o, C = Math.sqrt(x * x + S * S) || 1e-6, w = x / C, T = S / C, E = a + w * l[r], D = o + T * l[r], O = m - w * (l[i] + 1), k = h - T * (l[i] + 1), A = g[e];
			if (n.moveTo(E, D), A ? n.quadraticCurveTo((E + O) / 2 - T * A * 2, (D + k) / 2 + w * A * 2, O, k) : n.lineTo(O, k), t && C * f > 18) {
				let e = 6 * p, n = O - w * e, r = k - T * e;
				t.moveTo(O, k), t.lineTo(n - T * e * .45, r + w * e * .45), t.lineTo(n + T * e * .45, r - w * e * .45), t.closePath();
			}
		}, S = f > .45 && m < 4e4, C = (m > 1e5 ? .2 : m > 2e4 ? .3 : m > 3e3 ? .45 : .65) * (h >= 0 ? .25 : 1);
		n.lineWidth = (m > 5e4 ? .7 : 1) * p;
		for (let e = 0; e < this._pc.length; e++) {
			let t = S ? new Path2D() : null;
			n.beginPath();
			for (let n = this._pOff[e]; n < this._pOff[e + 1]; n++) x(this._pList[n], t);
			n.globalAlpha = C, n.strokeStyle = this._pc[e], n.stroke(), t && (n.globalAlpha = Math.min(1, C * 1.5), n.fillStyle = this._pc[e], n.fill(t));
		}
		let w = f > .65 && (e.n < 3e4 || f > 2);
		n.lineWidth = 1.4 * p, n.globalAlpha = h >= 0 ? .28 : 1;
		for (let e = 0; e < this._fill.length; e++) {
			n.beginPath();
			for (let t = this._cOff[e]; t < this._cOff[e + 1]; t++) {
				let e = this._cList[t], r = s[e], i = c[e], a = l[e];
				if (!(r + a < _ || r - a > y || i + a < v || i - a > b)) {
					if (a * f < 1) {
						let e = .9 * p;
						n.rect(r - e, i - e, 2 * e, 2 * e);
					} else n.moveTo(r + a, i), n.arc(r, i, a, 0, Nt);
				}
			}
			n.fillStyle = this._fill[e], n.fill(), w && (n.strokeStyle = this._ring[e], n.stroke());
		}
		n.globalAlpha = 1;
		let T = (e, t) => {
			let r = this._typ[e];
			n.beginPath(), n.arc(s[e], c[e], l[e], 0, Nt), n.fillStyle = this._fill[r], n.fill(), n.lineWidth = (t ? 2.5 : 1.4) * p, n.strokeStyle = t ? this._fg : this._ring[r], n.stroke();
		};
		if (h >= 0) {
			n.lineWidth = 1.6 * p, n.globalAlpha = .9;
			for (let e of this._el) {
				let t = new Path2D(), r = this._pc[this._lp[e]];
				n.beginPath(), x(e, t), n.strokeStyle = n.fillStyle = r, n.stroke(), n.fill(t);
			}
			n.globalAlpha = 1;
			for (let e of this._nl) T(e, !1);
			T(h, !0);
		}
		this._hov >= 0 && this._hov !== h && T(this._hov, !0), n.lineWidth = 1.2 * p, n.strokeStyle = this._fg, n.setLineDash([3 * p, 3 * p]);
		for (let t = 0; t < e.n; t++) e.pin[t] & 1 && (n.beginPath(), n.arc(s[t], c[t], l[t] + 3 * p, 0, Nt), n.stroke());
		n.setLineDash([]), this.getAttribute("labels") !== "off" && this._drawLabels(n, r), n.globalAlpha = 1;
	}
	_drawLabels(e, t) {
		let n = this._L, { x: r, y: i, r: a, ls: o, lt: s } = n, c = this._v, l = c.k, u = this._w, d = this._h, f = this._sel, p = this._occ, m = this._oc;
		e.setTransform(t, 0, 0, t, 0, 0), p.fill(0), e.font = "11px system-ui,sans-serif", e.textAlign = "center", e.textBaseline = "middle", e.lineJoin = "round", e.lineWidth = 1.5;
		let h = (e, t, n, r, i) => {
			let a = Math.max(0, (e - n / 2) / 12 | 0), o = Math.max(0, (t - r / 2) / 12 | 0), s = Math.min(m - 1, (e + n / 2) / 12 | 0), c = Math.min(this._or - 1, (t + r / 2) / 12 | 0);
			if (!i) {
				for (let e = o; e <= c; e++) for (let t = a; t <= s; t++) if (p[e * m + t]) return !1;
			}
			for (let e = o; e <= c; e++) for (let t = a; t <= s; t++) p[e * m + t] = 1;
			return !0;
		}, g = (t, n) => {
			let o = r[t] * l + c.x, s = i[t] * l + c.y, p = a[t] * l;
			if (o < -60 || o > u + 60 || s < -10 || s > d + 30) return -1;
			if (!n && p < 2) return 0;
			let m = this._label(t), g = m.length * 6.1 + 6, _ = s - p - 8;
			return h(o, _, g, 14, n) ? (e.globalAlpha = f >= 0 && !n ? .35 : 1, e.strokeStyle = this._halo, e.strokeText(m, o, _), e.fillStyle = this._fg, e.fillText(m, o, _), 1) : 0;
		};
		if (f >= 0) {
			g(f, !0);
			for (let e of this._nl) g(e, !0);
		}
		this._hov >= 0 && g(this._hov, !0);
		for (let e = 0, t = 0, r = 0; e < n.n && r < 700 && t < 6e3; e++) {
			let n = g(this._order[e], !1);
			n >= 0 && t++, n > 0 && r++;
		}
		if (!(l < .5 || !o.length)) {
			e.font = "9px system-ui,sans-serif", e.globalAlpha = .9, e.lineWidth = 1;
			for (let t = 0, n = 0; t < o.length && n < 150; t++) {
				let a = o[t], f = s[t], p = (r[f] - r[a]) * l, m = (i[f] - i[a]) * l, g = Math.sqrt(p * p + m * m);
				if (g < 70) continue;
				let _ = this._bend[t] * l, v = (r[a] + r[f]) / 2 * l + c.x - m / g * _, y = (i[a] + i[f]) / 2 * l + c.y + p / g * _;
				if (v < 0 || v > u || y < 0 || y > d) continue;
				let b = this._plabel(this._lp[t]), x = b.length * 5.2;
				if (g < x + 30) continue;
				let S = Math.abs(p / g), C = Math.abs(m / g);
				if (!h(v, y, x * S + 10 * C, x * C + 10 * S)) continue;
				let w = Math.atan2(m, p);
				(w > Math.PI / 2 || w < -Math.PI / 2) && (w += Math.PI), e.save(), e.translate(v, y), e.rotate(w), e.strokeStyle = this._halo, e.strokeText(b, 0, -5), e.fillStyle = this._pc[this._lp[t]], e.fillText(b, 0, -5), e.restore(), n++;
			}
		}
	}
	_pick(e, t) {
		let n = this._L, { x: r, y: i, r: a } = n, o = this._v.k, s = (e - this._v.x) / o, c = (t - this._v.y) / o, l = 5 / o, u = -1, d = 1;
		for (let e = 0; e < n.n; e++) {
			let t = a[e] > l ? a[e] : l, n = r[e] - s;
			if (n > t || n < -t) continue;
			let o = i[e] - c;
			if (o > t || o < -t) continue;
			let f = (n * n + o * o) / (t * t);
			f <= d && (d = f, u = e);
		}
		return u;
	}
	_select(e) {
		if (e === this._sel) return;
		let t = this._L, n = this._off, r = this._adj;
		if (this._sel = e, this._nl = [], this._el = [], e >= 0) {
			let i = /* @__PURE__ */ new Set();
			for (let a = n[e]; a < n[e + 1]; a++) {
				let n = r[a];
				this._el.push(n), i.add(t.ls[n] === e ? t.lt[n] : t.ls[n]);
			}
			this._nl = [...i];
		}
		this.dispatchEvent(new CustomEvent("node-select", {
			detail: e >= 0 ? this._names[e] : null,
			bubbles: !0
		})), this._dirty = !0, this._wake();
	}
	_showTip(e, t, n) {
		let r = this._tip;
		if (e < 0) {
			r.style.display = "none";
			return;
		}
		if (r._i !== e) {
			r._i = e, r.replaceChildren();
			let t = (e, t) => {
				let n = document.createElement(e);
				n.textContent = t, r.append(n);
			};
			t("b", this._label(e)), t("small", this._names[e]);
			let n = this._typ[e];
			n && this._classes[n] !== this._names[e] && t("small", "a " + this._curie(this._classes[n]));
			for (let [n, r] of this._lits.get(e) || []) t("div", this._curie(n) + ": " + (r.length > 80 ? r.slice(0, 80) + "…" : r));
			t("small", this._L.deg[e] + " links");
		}
		r.style.display = "block";
		let i = r.offsetWidth, a = r.offsetHeight;
		r.style.transform = `translate(${t + 14 + i > this._w ? Math.max(0, t - 14 - i) : t + 14}px,${Math.max(0, Math.min(n + 14, this._h - a - 4))}px)`;
	}
	_xy(e) {
		let t = this._cv.getBoundingClientRect();
		return {
			x: e.clientX - t.left,
			y: e.clientY - t.top
		};
	}
	_release() {
		let e = this._gs;
		e && e.i >= 0 && (this._L.pin[e.i] &= 1, this._L.target = 0), this._gs = null;
	}
	_bind() {
		let e = this._cv, t = this._ptrs;
		e.addEventListener("pointerdown", (n) => {
			e.setPointerCapture(n.pointerId);
			let r = this._xy(n);
			if (t.set(n.pointerId, {
				x: r.x,
				y: r.y
			}), this._auto = !1, this._anim = null, t.size > 1) {
				this._release();
				return;
			}
			let i = this._pick(r.x, r.y);
			this._gs = {
				i,
				sx: r.x,
				sy: r.y,
				moved: !1
			}, i >= 0 ? (this._L.pin[i] |= 2, this._L.target = .3, this._L.reheat(.3), e.style.cursor = "grabbing", this._showTip(-1), this._wake()) : e.style.cursor = "grabbing";
		}), e.addEventListener("pointermove", (n) => {
			let r = this._xy(n), i = t.get(n.pointerId), a = this._L, o = this._v;
			if (!i) {
				this._mp = r, this._hp || (this._hp = requestAnimationFrame(() => {
					this._hp = 0;
					let t = this._mp, n = this._pick(t.x, t.y);
					n !== this._hov && (this._hov = n, e.style.cursor = n >= 0 ? "pointer" : "grab", this._dirty = !0, this._wake(), this.dispatchEvent(new CustomEvent("node-hover", { detail: n >= 0 ? this._names[n] : null }))), this._showTip(n, t.x, t.y);
				}));
				return;
			}
			if (t.size === 2) {
				i.x = r.x, i.y = r.y;
				let [e, n] = [...t.values()], a = Math.hypot(e.x - n.x, e.y - n.y), s = (e.x + n.x) / 2, c = (e.y + n.y) / 2, l = this._pinch;
				l && l.d && (this._zoomAt(s, c, a / l.d), o.x += s - l.cx, o.y += c - l.cy), this._pinch = {
					d: a,
					cx: s,
					cy: c
				}, this._dirty = !0, this._wake();
				return;
			}
			let s = this._gs;
			s && (Math.hypot(r.x - s.sx, r.y - s.sy) > 3 && (s.moved = !0), s.i >= 0 ? (a.x[s.i] = (r.x - o.x) / o.k, a.y[s.i] = (r.y - o.y) / o.k, a.vx[s.i] = a.vy[s.i] = 0) : s.moved && (o.x += r.x - i.x, o.y += r.y - i.y), i.x = r.x, i.y = r.y, this._dirty = !0, this._wake());
		});
		let n = (n) => {
			if (!t.delete(n.pointerId)) return;
			this._pinch = null;
			let r = this._gs;
			t.size === 0 && r && (r.i >= 0 && !r.moved ? (this._select(r.i), this.dispatchEvent(new CustomEvent("node-click", {
				detail: this._names[r.i],
				bubbles: !0
			}))) : r.i < 0 && !r.moved && this._select(-1), this._release(), e.style.cursor = this._hov >= 0 ? "pointer" : "grab", this._wake());
		};
		e.addEventListener("pointerup", n), e.addEventListener("pointercancel", n), e.addEventListener("pointerleave", () => {
			this._hov >= 0 && !t.size && (this._hov = -1, this._dirty = !0, this._wake()), this._showTip(-1);
		}), e.addEventListener("dblclick", (e) => {
			let t = this._xy(e), n = this._pick(t.x, t.y);
			n >= 0 ? (this._L.pin[n] ^= 1, this._L.reheat(.2), this._dirty = !0, this._wake()) : this.fit();
		}), e.addEventListener("wheel", (e) => {
			e.preventDefault(), this._auto = !1, this._anim = null;
			let t = this._xy(e);
			this._zoomAt(t.x, t.y, Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0015) * (e.deltaMode === 1 ? 16 : 1)));
		}, { passive: !1 });
	}
};
kt(Wt, "observedAttributes", [
	"height",
	"charge",
	"link-dist",
	"labels"
]), typeof customElements < "u" && !customElements.get("quad-graph") && customElements.define("quad-graph", Wt);
//#endregion
//#region src/render.js
function Gt(e, t = {}) {
	let n = e.split("\n"), r = Kt(n, t.context);
	function i(e) {
		return !e || e === "RESET" ? null : e.startsWith("=#") || e.startsWith("#") ? e : x(e, r);
	}
	function a(e, t, n = !1, r = null) {
		let a = [], o = [];
		e && a.push(`data-annotation="${V("{" + e + "}")}"`);
		let s = null;
		return t?.subject && t.subject !== "RESET" ? s = i(t.subject) : t?.object && (s = i(t.object)), s && a.push(`data-iri="${V(s)}"`), n && r && a.push(`href="${V(r)}"`), t?.types?.some((e) => !e.remove) && o.push("typed"), (t?.predicates?.some((e) => e.remove) || t?.types?.some((e) => e.remove)) && o.push("retracted"), o.length > 0 && a.unshift(`class="${o.join(" ")}"`), a.join(" ");
	}
	function o(e, t) {
		let n = t.match(/class="([^"]*)"/), r = e, i = t;
		return n && (r += " " + n[1], i = t.replace(/class="[^"]*"/, "").trim()), `class="${r}"${i ? " " + i : ""}`;
	}
	function s(e) {
		let t = L(e, 0);
		if (t.length === 0) return V(e);
		let n = "", r = 0;
		for (let i of t) {
			i.range[0] > r && (n += V(e.slice(r, i.range[0])));
			let t = i.attrs ? w(i.attrs) : null, c = i.attrs || "", l = i.type === "link", u = i.url || null, d = "span", f = "mdld-bracket";
			i.type === "link" ? (d = "a", f = "mdld-link") : i.type === "code" ? (d = "code", f = "mdld-code") : i.type === "strong" ? (d = "strong", f = "mdld-bold") : i.type === "emphasis" && (d = "em", f = "mdld-italic");
			let p = a(c, t, l, u), m = o(f, p);
			n += `<${d} ${m}>${s(i.text)}</${d}>`, r = i.range[1];
		}
		return r < e.length && (n += V(e.slice(r))), n;
	}
	let c = [], l = 0, u = null;
	for (; l < n.length;) {
		let e = n[l];
		if (u) {
			if (RegExp(`^${u.fenceChar}{${u.fenceLength},}\\s*$`).test(e.trim())) {
				let e = u.attrs ? w(u.attrs) : null, t = u.content.join("\n"), n = a(u.attrs, e), r = o(`mdld-codeblock language-${u.lang || "text"}`, n);
				c.push(`<pre><code ${r}>${V(t)}</code></pre>`), u = null;
			} else u.content.push(e);
			l++;
			continue;
		}
		if (e.trim() === "") {
			l++;
			continue;
		}
		let t = O(e.trim());
		if (t) {
			u = {
				fenceChar: t.fenceChar,
				fenceLength: t.fenceLength,
				lang: t.lang,
				attrs: t.attrs,
				content: []
			}, l++;
			continue;
		}
		let i = k(e);
		if (i) {
			let e = r[i.prefix];
			c.push(`<div class="mdld-prefix" data-prefix="${i.prefix}" data-raw="${V(i.iri)}" data-iri="${V(e)}" style="display:none"></div>`), l++;
			continue;
		}
		let d = A(e);
		if (d) {
			let e = d.attrs ? w(d.attrs) : null, t = o("mdld-heading", a(d.attrs, e));
			c.push(`<h${d.depth} ${t}>${s(d.content)}</h${d.depth}>`), l++;
			continue;
		}
		if (j(e)) {
			for (c.push("<ul class=\"mdld-list\">"); l < n.length;) {
				let e = j(n[l]);
				if (!e) break;
				let t = e.attrs ? w(e.attrs) : null, r = o("mdld-item", a(e.attrs, t));
				c.push(`<li ${r}>${s(e.content)}</li>`), l++;
			}
			c.push("</ul>");
			continue;
		}
		let f = M(e);
		if (f) {
			let e = [f.content];
			for (l++; l < n.length;) {
				let t = M(n[l]);
				if (!t) break;
				e.push(t.content), l++;
			}
			let t = f.attrs ? w(f.attrs) : null, r = o("mdld-quote", a(f.attrs, t)), i = e.join("\n");
			c.push(`<blockquote ${r}>${s(i)}</blockquote>`);
			continue;
		}
		let p = ee(e);
		if (p) {
			let e = w(`=${p.content}`), t = o("mdld-standalone", a(`=${p.content}`, e));
			c.push(`<div ${t} style="display:none"></div>`), l++;
			continue;
		}
		let m = [e];
		for (l++; l < n.length && n[l].trim() !== "" && !O(n[l].trim()) && !k(n[l]) && !A(n[l]) && !j(n[l]) && !M(n[l]) && !ee(n[l]);) m.push(n[l]), l++;
		let h = m.join("\n");
		c.push(`<p class="mdld-paragraph">${s(h)}</p>`);
	}
	return c.join("\n");
}
function Kt(t, n = {}) {
	let r = {
		...e,
		...n
	};
	for (let e of t) {
		let t = k(e);
		if (t) {
			let e = t.iri;
			if (e.includes(":")) {
				let t = e.indexOf(":"), n = e.substring(0, t), i = e.substring(t + 1);
				r[n] && n !== "@vocab" && (e = r[n] + i);
			}
			r[t.prefix] = e;
		}
	}
	return r;
}
function qt(e) {
	let t = [], n = 0;
	for (; n < e.length;) {
		for (; n < e.length && /\s/.test(e[n]);) n++;
		if (n >= e.length) break;
		let r = e.indexOf("<", n);
		if (r === -1) break;
		let i = e.indexOf(">", r);
		if (i === -1) break;
		let a = e.slice(r, i + 1);
		if (a.startsWith("<p") && Y(a, "class")?.includes("mdld-paragraph")) {
			let r = e.indexOf("</p>", n);
			if (r === -1) break;
			let i = e.indexOf(">", n) + 1, a = e.slice(i, r);
			t.push(Jt(a)), n = r + 4;
		} else if (a.startsWith("<div") && Y(a, "class")?.includes("mdld-prefix")) {
			let r = e.indexOf("></div>", n);
			if (r === -1) break;
			let i = e.slice(n, r + 7), a = Y(i, "data-prefix"), o = Y(i, "data-raw") || Y(i, "data-iri");
			t.push(`[${a}] <${o}>`), n = r + 7;
		} else if (a.startsWith("<div") && Y(a, "class")?.includes("mdld-standalone")) {
			let r = e.indexOf("</div>", n);
			if (r === -1) break;
			let i = Y(e.slice(n, r + 6), "data-annotation");
			i && t.push(i), n = r + 6;
		} else if (e.startsWith("<pre><code", n)) {
			let r = e.indexOf("</code></pre>", n);
			if (r === -1) break;
			let i = e.slice(n, r + 13), a = i.indexOf(">") + 1, o = i.indexOf(">", a) + 1, s = i.slice(a, o), c = i.slice(o, i.length - 13), l = (Y(s, "class") || "").match(/language-(\w+)/), u = l ? l[1] : "", d = Y(s, "data-annotation");
			t.push(`\`\`\`${u}${d ? " " + d : ""}\n${Xt(c)}\n\`\`\``), n = r + 13;
		} else if (e[n] === "<" && /^<h[1-6]/.test(e.slice(n, n + 4))) {
			let r = e[n + 2], i = `</h${r}>`, a = e.indexOf(i, n);
			if (a === -1) break;
			let o = e.slice(n, a + i.length), s = o.indexOf(">") + 1, c = o.slice(0, s), l = o.slice(s, o.length - i.length), u = "#".repeat(parseInt(r)), d = Y(c, "data-annotation");
			t.push(`${u} ${Jt(l)}${d ? " " + d : ""}`), n = a + i.length;
		} else if (e.startsWith("<blockquote", n)) {
			let r = e.indexOf("</blockquote>", n);
			if (r === -1) break;
			let i = e.slice(n, r + 13), a = i.indexOf(">") + 1, o = i.slice(0, a), s = i.slice(a, i.length - 13), c = Y(o, "data-annotation"), l = Jt(s).split("\n").map((e) => e.trim() ? `> ${e}` : ">").join("\n");
			t.push(c ? `${l} ${c}` : l), n = r + 13;
		} else if (e.startsWith("<ul class=\"mdld-list\">", n)) {
			let r = e.indexOf("</ul>", n);
			if (r === -1) break;
			let i = e.slice(n + 21, r), a = [], o = 0;
			for (; o < i.length;) {
				let e = i.indexOf("<li", o);
				if (e === -1) break;
				let t = i.indexOf("</li>", e);
				if (t === -1) break;
				let n = i.slice(e, t + 5), r = n.indexOf(">") + 1, s = n.slice(0, r), c = n.slice(r, n.length - 5), l = Y(s, "data-annotation");
				a.push(`- ${Jt(c)}${l ? " " + l : ""}`), o = t + 5;
			}
			t.push(a.join("\n")), n = r + 5;
		} else n++;
	}
	return t.join("\n\n");
}
function Jt(e) {
	let t = "", n = 0;
	for (; n < e.length;) if (e[n] === "<") {
		let r = e.indexOf(">", n);
		if (r === -1) {
			t += e.slice(n);
			break;
		}
		let i = e.slice(n + 1, r);
		if (i.startsWith("/")) {
			n = r + 1;
			continue;
		}
		let a = i.search(/[\s/]/), o = (a === -1 ? i : i.slice(0, a)).toLowerCase(), s = a === -1 ? "" : i.slice(a), c = `</${o}>`, l = 1, u = r + 1, d = !1;
		for (; u < e.length && l > 0;) {
			let i = e.indexOf(`<${o}`, u), a = e.indexOf(c, u);
			if (a === -1) break;
			if (i !== -1 && i < a) l++, u = i + 1;
			else {
				if (l--, l === 0) {
					let i = e.slice(r + 1, a);
					t += Yt(o, s, i), n = a + c.length, d = !0;
					break;
				}
				u = a + 1;
			}
		}
		d || (t += e[n], n++);
	} else {
		let r = e.indexOf("<", n), i = r === -1 ? e.length : r;
		t += Xt(e.slice(n, i)), n = i;
	}
	return t;
}
function Yt(e, t, n) {
	let r = Y(t, "data-annotation"), i = Jt(n), a = r ? " " + r : "";
	switch (e) {
		case "a": return `[${i}](${Y(t, "href") || ""})${a}`;
		case "span": return `[${i}]${a}`;
		case "code": return `\`${i}\`${a}`;
		case "strong": return `**${i}**${a}`;
		case "em": return `*${i}*${a}`;
		default: return i + a;
	}
}
function Y(e, t) {
	let n = RegExp(`(?:\\s|^)${t}=(["'])(.*?)\\1`, "is"), r = e.match(n);
	return r ? Xt(r[2]) : null;
}
function Xt(e) {
	return String(e).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}
//#endregion
//#region src/highlight.js
function X(e) {
	return String(e).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
var Z = {
	text: "#6b7280",
	marker: "#f97316",
	retraction: "#dc2626",
	value: "#eab308",
	annotation: "#4b5563"
};
function Q(e, t) {
	let n = t;
	for (; n < e.length && e[n] !== "\n" && e[n] !== "\r";) {
		if (e[n] === "{") return !0;
		n++;
	}
	return !1;
}
function Zt(e, t) {
	let n = e[t];
	if (n === "*" && t + 1 < e.length && e[t + 1] === "*") {
		let n = e.indexOf("**", t + 2);
		if (n !== -1) {
			let r = e.slice(t + 2, n), i = Q(e, n + 2) ? ` style="color: ${Z.marker}"` : "";
			return {
				html: `<span${i}>**</span><strong>${X(r)}</strong><span${i}>**</span>`,
				nextIndex: n + 2
			};
		}
	}
	if (n === "_" && t + 1 < e.length && e[t + 1] === "_") {
		let n = e.indexOf("__", t + 2);
		if (n !== -1) {
			let r = e.slice(t + 2, n), i = Q(e, n + 2) ? ` style="color: ${Z.marker}"` : "";
			return {
				html: `<span${i}>__</span><strong>${X(r)}</strong><span${i}>__</span>`,
				nextIndex: n + 2
			};
		}
	}
	if (n === "*") {
		let n = e.indexOf("*", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = Q(e, n + 1) ? ` style="color: ${Z.marker}"` : "";
			return {
				html: `<span${i}>*</span><em>${X(r)}</em><span${i}>*</span>`,
				nextIndex: n + 1
			};
		}
	}
	if (n === "_") {
		let n = e.indexOf("_", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = Q(e, n + 1) ? ` style="color: ${Z.marker}"` : "";
			return {
				html: `<span${i}>_</span><em>${X(r)}</em><span${i}>_</span>`,
				nextIndex: n + 1
			};
		}
	}
	if (n === "`") {
		let n = e.indexOf("`", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = Q(e, n + 1) ? ` style="color: ${Z.marker}"` : "";
			return {
				html: `<span${i}>\`</span><code style="background-color:#7773">${X(r)}</code><span${i}>\`</span>`,
				nextIndex: n + 1
			};
		}
	}
	return null;
}
var Qt = /* @__PURE__ */ new Map();
function $t(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return Math.abs(t);
}
function en(e) {
	if (Qt.has(e)) return Qt.get(e);
	let t = $t(e), n = `hsl(${t % 360}, ${15 + t % 10}%, ${45 + t % 10}%)`;
	return Qt.set(e, n), n;
}
function tn(t) {
	let n = /* @__PURE__ */ new Map(), r = /^\[(\w+)\]\s*<([^>]*)>\s*$/gm, i;
	for (; (i = r.exec(t)) !== null;) {
		let e = i[1], t = i[2];
		if (t.includes(":")) {
			let e = t.indexOf(":");
			if (e > 0) {
				let r = t.slice(0, e), i = t.slice(e + 1);
				n.has(r) && (t = n.get(r) + i);
			}
		}
		n.set(e, t);
	}
	for (let [t, r] of Object.entries(e)) t !== "@vocab" && n.set(t, r);
	return n;
}
function $(e, t, n) {
	let r = t ? Z.retraction : Z.text, i = e.indexOf(":");
	if (i > 0) {
		let t = e.slice(0, i), r = e.slice(i + 1);
		if (n.has(t)) {
			let e = n.get(t), i = en(e), a = e + r, o = en(a);
			return `<span data-iri="${a}"><span style="color: ${i}">${X(t)}</span><span style="color: ${Z.marker}">:</span><span  style="color: ${o}">${X(r)}</span></span> `;
		}
	}
	return e.startsWith("http:") || e.startsWith("https:") || e.startsWith("tag:") || e.startsWith("urn:") ? `<span style="color: ${en(e)}">${X(e)}</span> ` : `<span style="color: ${r}">${X(e)}</span> `;
}
function nn(e, t) {
	let n = e.trim().split(/\s+/), r = "", i = !1;
	for (let e = 0; e < n.length; e++) {
		let a = n[e];
		if (!a) continue;
		if (a.startsWith("=") || a.startsWith("+")) {
			let e = a[0], n = a.slice(1);
			r += `<span style="color: ${Z.marker}">${X(e)}</span>${$(n, !1, t)}`;
			continue;
		}
		if (a === "-") {
			i = !0, r += `<span style="color: ${Z.retraction}">${X(a)}</span> `;
			continue;
		}
		if (a.startsWith("-") && a.length > 1) {
			r += `<span style="color: ${Z.retraction}">${X(a)}</span> `;
			continue;
		}
		let o = i;
		if (i = !1, a.startsWith("?") || a.startsWith("!")) {
			let e = a[0], n = a.slice(1), i = o ? Z.retraction : Z.marker;
			r += `<span style="color: ${i}">${X(e)}</span>${$(n, o, t)}`;
			continue;
		}
		if (a.startsWith("^^")) {
			let e = a.slice(2), n = o ? Z.retraction : Z.marker;
			r += `<span style="color: ${n}">${X("^^")}</span>${$(e, o, t)}`;
			continue;
		}
		if (a.startsWith("@")) {
			let e = a.slice(1), n = o ? Z.retraction : Z.marker;
			r += `<span style="color: ${n}">${X("@")}</span>${$(e, o, t)}`;
			continue;
		}
		if (a.startsWith(".")) {
			let e = a.slice(1), n = o ? Z.retraction : Z.marker;
			r += `<span style="color: ${n}">${X(".")}</span>${$(e, o, t)}`;
			continue;
		}
		r += $(a, o, t);
	}
	return r.trim();
}
function rn(e) {
	let t = tn(e), n = "", r = 0;
	for (; r < e.length;) {
		let i = e[r];
		if (i === "{") {
			let a = e.indexOf("}", r);
			if (a === -1) {
				n += X(i), r++;
				continue;
			}
			let o = nn(e.slice(r + 1, a), t);
			n += `<span class="mdld-annotation"><span style="color: ${Z.annotation}; opacity: 0.75">{</span>`, n += o, n += `<span style="color: ${Z.annotation}; opacity: 0.75">}</span></span>`, r = a + 1;
			continue;
		}
		if (i === "[") {
			let a = e.indexOf("]", r);
			if (a === -1) {
				n += X(i), r++;
				continue;
			}
			let o = e.slice(r + 1, a), s = a + 1;
			for (; s < e.length && /\s/.test(e[s]);) s++;
			if (s < e.length && e[s] === "<") {
				let i = e.indexOf(">", s);
				if (i !== -1) {
					let a = e.slice(s + 1, i), c = t.has(o) ? en(t.get(o)) : Z.text;
					n += `<span style="color: ${Z.annotation}; opacity: 0.75">[</span><span style="color: ${c}">${X(o)}</span><span style="color: ${Z.annotation}; opacity: 0.75">]</span> <span style="color: ${Z.text}; opacity: 0.6">&lt;${X(a)}&gt;</span>`, r = i + 1;
					continue;
				}
			}
			let c = e.slice(r + 1, a), l = Q(e, a + 1) ? Z.marker : Z.value, u = X(c);
			n += `<span style="color: ${l}; opacity: 0.85">[</span><span style="background-color: ${l}15">${u}</span><span style="color: ${l}; opacity: 0.85">]</span>`, r = a + 1;
			continue;
		}
		if (i === "*" || i === "_" || i === "`") {
			let t = Zt(e, r);
			if (t) {
				n += t.html, r = t.nextIndex;
				continue;
			}
		}
		if (i === "#") {
			let i = 0, a = r;
			for (; a < e.length && e[a] === "#";) i++, a++;
			if (i <= 6 && (a >= e.length || e[a] === " " || e[a] === "	")) {
				let o = e.indexOf("\n", a), s = o === -1 ? e.length : o, c = e.slice(a, s).trim(), l = "", u = 0, d = c.indexOf("{");
				for (; d !== -1;) {
					let e = c.indexOf("}", d);
					if (e === -1) break;
					let n = c.slice(u, d);
					l += X(n);
					let r = nn(c.slice(d + 1, e), t);
					l += `<span class="mdld-annotation"><span style="color: ${Z.annotation}; opacity: 0.75">{</span>` + r + `<span style="color: ${Z.annotation}; opacity: 0.75">}</span></span>`, u = e + 1, d = c.indexOf("{", u);
				}
				l += X(c.slice(u));
				let f = c.includes("{") && c.includes("}"), p = `h${i}`, m = "#".repeat(i), h = f ? `color: ${Z.marker}; opacity: 0.8` : "";
				n += `<${p} style="margin: 0; font-weight: 600;"><span style="${h}">${m}</span> ${l}</${p}>`, r = s;
				continue;
			}
		}
		if (i === "-" || i === "*") {
			let t = r > 0 ? e[r - 1] : "\n";
			if ((t === "\n" || t === "\r" || t === " " || t === "	") && e[r + 1] === " ") {
				let t = Q(e, r + 2) ? `color: ${Z.marker}; opacity: 0.85` : "";
				n += `<span style="${t}">${X(i)}</span>`, r++;
				continue;
			}
		}
		if (i === ">") {
			let t = r > 0 ? e[r - 1] : "\n";
			if ((t === "\n" || t === "\r" || t === " " || t === "	") && e[r + 1] === " ") {
				let t = Q(e, r + 2) ? `color: ${Z.marker}; opacity: 0.85` : "";
				n += `<span style="${t}">${X(i)}</span>`, r++;
				continue;
			}
		}
		n += X(i), r++;
	}
	return n;
}
//#endregion
export { e as DEFAULT_CONTEXT, _ as DataFactory, Vt as Layout, Wt as QuadGraph, Z as TOKEN_COLORS, Qt as colorCache, Et as crawl, qt as deconstruct, X as escapeHtml, x as expandIRI, lt as extractLinks, Ge as generate, Ke as generateNode, en as getIRIColor, y as hash, $t as hashIRI, rn as highlight, v as locate, at as memoryCache, He as merge, Te as parse, w as parseSemanticBlock, Gt as render, S as shortenIRI, Ze as updateValue };
