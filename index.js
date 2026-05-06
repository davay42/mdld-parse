//#region src/constants.js
var e = {
	"@vocab": "http://www.w3.org/2000/01/rdf-schema#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	sh: "http://www.w3.org/ns/shacl#",
	prov: "http://www.w3.org/ns/prov#"
}, t = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/, n = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file):/, r = class {
	constructor(e) {
		this.id = e;
	}
	equals(e) {
		return !!e && this.termType === e.termType && this.value === e.value;
	}
}, i = class extends r {
	constructor(e) {
		super(e), this.termType = "NamedNode", this.value = e;
	}
}, a = class extends r {
	constructor(e) {
		super(e), this.termType = "Literal", this.value = "", this.language = "", this.datatype = null;
		let t = e.match(/^"([^"\\]*(?:\\.[^"\\]*)*)"(\^\^([^"]+))?(@([^-]+)(--(.+))?)?$/);
		t ? (this.value = t[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"), t[5] ? (this.language = t[5], this.datatype = new i("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")) : t[3] ? this.datatype = new i(t[3]) : this.datatype = new i("http://www.w3.org/2001/XMLSchema#string")) : (this.value = e.replace(/^"|"$/g, ""), this.datatype = new i("http://www.w3.org/2001/XMLSchema#string"));
	}
	equals(e) {
		return !!e && this.termType === e.termType && this.value === e.value && this.language === e.language && this.datatype?.value === e.datatype?.value;
	}
}, o = class extends r {
	constructor(e) {
		super(e || `b${Math.random().toString(36).slice(2, 11)}`), this.termType = "BlankNode", this.value = this.id;
	}
}, s = class extends r {
	constructor(e) {
		super(e), this.termType = "Variable", this.value = e;
	}
}, c = new class extends r {
	constructor() {
		super(""), this.termType = "DefaultGraph", this.value = "";
	}
	equals(e) {
		return !!e && this.termType === e.termType;
	}
}(), l = class extends r {
	constructor(e, t, n, r = c) {
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
}, u = {
	boolean: "http://www.w3.org/2001/XMLSchema#boolean",
	integer: "http://www.w3.org/2001/XMLSchema#integer",
	double: "http://www.w3.org/2001/XMLSchema#double",
	string: "http://www.w3.org/2001/XMLSchema#string"
}, d = {
	namedNode: (e) => new i(e),
	blankNode: (e) => new o(e),
	literal: (e, t) => {
		let n = String(e).replace(/"/g, "\\\"");
		if (typeof t == "string") return new a(`"${n}"@${t.toLowerCase()}`);
		if (t !== void 0 && !("termType" in t)) {
			let e = t.direction ? `--${t.direction.toLowerCase()}` : "";
			return new a(`"${n}"@${t.language.toLowerCase()}${e}`);
		}
		let r = t ? t.value : "";
		return r === "" && (typeof e == "boolean" ? r = u.boolean : typeof e == "number" && (Number.isFinite(e) ? r = Number.isInteger(e) ? u.integer : u.double : (r = u.double, Number.isNaN(e) || (e = e > 0 ? "INF" : "-INF")))), r === "" || r === u.string ? new a(`"${n}"`) : new a(`"${n}"^^${r}`);
	},
	variable: (e) => new s(e),
	defaultGraph: () => c,
	quad: (e, t, n, r) => new l(e, t, n, r),
	triple: (e, t, n, r) => new l(e, t, n, r),
	fromTerm: (e) => {
		if (e instanceof r) return e;
		switch (e.termType) {
			case "NamedNode": return new i(e.value);
			case "BlankNode": return new o(e.value);
			case "Variable": return new s(e.value);
			case "DefaultGraph": return c;
			case "Literal":
				let t = String(e.value).replace(/"/g, "\\\"");
				return e.language ? new a(`"${t}"@${e.language}`) : e.datatype ? new a(`"${t}"^^${e.datatype.value || e.datatype}`) : new a(`"${t}"`);
			case "Quad": return d.fromQuad(e);
			default: throw Error(`Unexpected termType: ${e.termType}`);
		}
	},
	fromQuad: (e) => {
		if (e instanceof l) return e;
		if (e.termType !== "Quad") {
			if (e.subject && e.predicate && e.object) return new l(d.fromTerm(e.subject), d.fromTerm(e.predicate), d.fromTerm(e.object), d.fromTerm(e.graph || d.defaultGraph()));
			throw Error(`Unexpected termType: ${e.termType}`);
		}
		return new l(d.fromTerm(e.subject), d.fromTerm(e.predicate), d.fromTerm(e.object), d.fromTerm(e.graph));
	}
};
function f(e, t) {
	if (!e || !t || !t.quadIndex) return null;
	let n = te(e);
	return n && t.quadIndex.get(n) || null;
}
function p(e) {
	let t = 5381;
	for (let n = 0; n < e.length; n++) t = (t << 5) + t + e.charCodeAt(n);
	return Math.abs(t).toString(16).slice(0, 12);
}
var m = /* @__PURE__ */ new Map();
function h(e, n) {
	if (e == null) return null;
	let r = `${e}|${n["@vocab"] || ""}|${Object.keys(n).filter((e) => e !== "@vocab").sort().map((e) => `${e}:${n[e]}`).join(",")}`;
	if (m.has(r)) return m.get(r);
	let i = (typeof e == "string" ? e : typeof e == "object" && typeof e.value == "string" ? e.value : String(e)).trim(), a;
	if (i.match(t)) a = i;
	else if (i.includes(":")) {
		let [e, t] = i.split(":", 2);
		e && !n[e] && e !== "@vocab" && console.warn(`Undefined prefix "${e}" in IRI "${i}" - treating as literal`), a = n[e] ? n[e] + t : i;
	} else a = (n["@vocab"] || "") + i;
	return m.set(r, a), a;
}
function g(e, t) {
	if (!e || !n.test(e)) return e;
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
function _(e) {
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
function v(e, t, n) {
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
function te(e) {
	return e ? v(e.subject, e.predicate, e.object) : null;
}
function ne(e, t, n, r, i) {
	return t ? i.literal(e, i.namedNode(h(t, r))) : n ? i.literal(e, n) : i.literal(e);
}
//#endregion
//#region src/tokenizers.js
function re(e) {
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
function ie(e) {
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
function ae(e) {
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
function y(e) {
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
function oe(e) {
	if (e[0] !== ">" || e.length > 1 && e[1] !== " " && e[1] !== "	") return null;
	let t = 1;
	for (; t < e.length && (e[t] === " " || e[t] === "	");) t++;
	let n = e.slice(t), r = null, i = n.match(/\s*\{([^}]+)\}\s*$/);
	return i && (r = i[1], n = n.slice(0, -i[0].length).trim()), {
		content: n,
		attrs: r
	};
}
function se(e) {
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
function ce(e, t, n = "[", r = "]") {
	let i = 1, a = t + 1;
	for (; a < e.length && i > 0;) e[a] === n && i++, e[a] === r && i--, i > 0 && a++;
	return i === 0 ? a : null;
}
function b(e, t) {
	let n = t;
	for (; n < e.length && (e[n] === " " || e[n] === "	");) n++;
	if (n >= e.length || e[n] !== "{") return null;
	let r = e.indexOf("}", n + 1);
	return r === -1 ? null : {
		attrs: e.slice(n + 1, r),
		endPos: r + 1
	};
}
function le(e, t) {
	if (e[t] !== "<") return null;
	let n = e.indexOf(">", t + 1);
	if (n === -1) return null;
	let r = e.slice(t + 1, n).trim();
	return r.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/) ? {
		url: r,
		endPos: n + 1
	} : null;
}
function ue(e, t) {
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
			let t = e.slice(o, s), a = s + r, c = b(e, a), l = c ? c.endPos : a;
			return {
				type: i,
				content: t,
				attrs: c?.attrs || null,
				endPos: l,
				contentEnd: a
			};
		}
		s++;
	}
	return null;
}
function de(e, t) {
	if (e[t] !== "`") return null;
	let n = 1;
	for (; t + n < e.length && e[t + n] === "`";) n++;
	if (n > 2) return null;
	let r = "`".repeat(n), i = t + n, a = i;
	for (; a < e.length;) {
		if (e.slice(a, a + n) === r) {
			let t = e.slice(i, a), r = a + n, o = b(e, r), s = o ? o.endPos : r;
			return {
				type: "code",
				content: t,
				attrs: o?.attrs || null,
				endPos: s,
				contentEnd: r
			};
		}
		a++;
	}
	return null;
}
function fe(e, t) {
	if (e[t] !== "[") return null;
	let n = ce(e, t, "[", "]");
	if (!n) return null;
	let r = e.slice(t + 1, n), i = n + 1, a = null;
	if (i < e.length && e[i] === "(") {
		let t = e.indexOf(")", i + 1);
		t !== -1 && (a = e.slice(i + 1, t), i = t + 1);
	} else if (i < e.length && e[i] === "<") {
		let t = e.indexOf(">", i + 1);
		if (t !== -1) {
			let n = e.slice(i + 1, t).trim();
			n.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/) && (a = n, i = t + 1);
		}
	}
	let o = b(e, i), s = o ? o.endPos : i;
	return {
		type: a ? "link" : "span",
		text: r,
		url: a,
		attrs: o?.attrs || null,
		endPos: s,
		bracketEnd: n + 1
	};
}
function x(e, t = 0) {
	let n = [], r = e.length, i = 0;
	for (; i < r;) {
		let r = e[i], a = null;
		switch (r) {
			case "<":
				if (a = le(e, i), a) {
					let t = b(e, a.endPos);
					t && (a.attrs = t.attrs, a.endPos = t.endPos), a.type = "link", a.text = a.url;
				}
				break;
			case "[":
				a = fe(e, i);
				break;
			case "*":
			case "_":
				a = ue(e, i);
				break;
			case "`":
				a = de(e, i);
				break;
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
		let l = t + i, u = t + a.endPos, d = t + (a.contentEnd || a.bracketEnd || a.endPos), f = {
			type: s,
			text: a.content === void 0 ? a.text === void 0 ? o : a.text : a.content,
			range: [l, u],
			valueRange: [l + +(s === "url"), d - +(s === "url")],
			attrs: c,
			url: o,
			pos: a.endPos
		};
		c && (f.attrsRange = [d, u]), n.push(f), i = a.endPos;
	}
	return n;
}
//#endregion
//#region src/shared.js
var S = /* @__PURE__ */ new Map();
function pe(e) {
	return S.has(e) || S.set(e, RegExp(`^(${e}{3,})`)), S.get(e);
}
function C(e, t, n, r, i) {
	let a = r + (r < e.length && e[r] === " " ? 1 : e.slice(r).match(/^\s+/)?.[0]?.length || 0);
	return {
		valueRange: [n + a, n + a + i],
		attrsRange: w(e, t, n)
	};
}
function w(e, t, n) {
	if (!t) return null;
	let r = e.lastIndexOf(t);
	return r >= 0 ? [n + r, n + r + t.length] : null;
}
function T(e, t, n, r = null, i = null, a = null, o = {}) {
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
function me(e, t, n, r, i) {
	let a = i[4] || null, o = C(t, a, n, i[1].length + (i[2] ? i[2].length : 0), i[3].length);
	return T(e, [n, r - 1], i[3].trim(), a, o.attrsRange, o.valueRange, { indent: i[1].length });
}
var E = {}, he = Object.freeze({
	predicates: [],
	types: [],
	subject: null
});
function D(e) {
	if (!e) return he;
	let t = E[e];
	return t || (t = Object.freeze(_(e)), E[e] = t), t;
}
function ge(e, t) {
	if (!e.range || !t) return 0;
	let n = t.substring(e.range.start, e.range.end).match(/^(\s*)/), r = n ? n[1].length : 0;
	return Math.floor(r / 2);
}
function _e(e, t, n = null) {
	if (!t || !e) return "";
	let r = e.substring(t[0], t[1]);
	return n && (r = r.substring(0, n[0] - t[0]) + r.substring(n[1] - t[0])), r.trim();
}
function ve(e) {
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
function ye(e, t, n, r = null) {
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
function O(e, t, n) {
	if (!t) return null;
	let r = t.value, i = r.indexOf("#"), a = i > -1 ? r.slice(0, i) : r;
	return n.namedNode(a + "#" + e);
}
function k(e, t) {
	return e.subject ? e.subject === "RESET" ? (t.currentSubject = null, null) : e.subject.startsWith("=#") ? O(e.subject.substring(2), t.currentSubject, t.df) : t.df.namedNode(h(e.subject, t.ctx)) : null;
}
function be(e, t) {
	return e.object ? e.object.startsWith("#") ? O(e.object.substring(1), t.currentSubject, t.df) : t.df.namedNode(h(e.object, t.ctx)) : null;
}
function A(e) {
	return e ? e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : "";
}
function j(e) {
	return e?.termType === "Literal";
}
function M(e) {
	return e?.termType === "NamedNode";
}
function xe(e) {
	return e?.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
}
function N(e, t) {
	if (!e) return null;
	let n = g(e, t);
	return n.includes(":") ? n.split(":")[0] : null;
}
function Se(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of e.values()) for (let e of r) {
		let r = N(e.subject.value, t);
		r && n.add(r);
		let i = N(e.predicate.value, t);
		if (i && n.add(i), M(e.object)) {
			let r = N(e.object.value, t);
			r && n.add(r);
		}
		if (e.object.datatype && e.object.datatype.value) {
			let r = N(e.object.datatype.value, t);
			r && n.add(r);
		}
	}
	return n;
}
function P(e, t, n, r, i = []) {
	let a = r(e, t);
	t.currentBlock = a, t.blockStack.push(a.id), i.forEach((n) => n(e, t)), n(e, t, e.type), t.blockStack.pop(), t.currentBlock = t.blockStack.length > 0 ? t.origin.blocks.get(t.blockStack[t.blockStack.length - 1]) : null;
}
function F(e) {
	return e.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
}
var Ce = (e, t) => `[${e}] <${t}>\n`;
function we(e, t) {
	let n = g(e.predicate.value, t);
	e.object.language ? n += ` @${e.object.language}` : e.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" && (n += ` ^^${g(e.object.datatype.value, t)}`);
	let r = e.object.value || e.object, i = typeof r == "string" ? r : String(r), a = e.object.datatype?.value || "";
	return i.includes("\n") ? `~~~ {${n}}\n${i}\n~~~\n\n` : a.includes("integer") || a.includes("decimal") || a.includes("double") || a.includes("float") ? `\`${i}\` {${n}}\n` : a.includes("date") || a.includes("time") ? `*${i}* {${n}}\n` : a.includes("boolean") ? `**${i}** {${n}}\n` : `[${i}] {${n}}\n`;
}
var Te = (e, t, n = null) => {
	let r = g(e.object.value, t), i = g(e.predicate.value, t);
	return `[${n && n.has(e.object.value) ? n.get(e.object.value) : r}] {+${r} ?${i}}\n`;
};
function Ee(e) {
	let t = [], n = [], r = [];
	for (let i of e) xe(i.predicate) ? t.push(i) : j(i.object) ? n.push(i) : M(i.object) && r.push(i);
	return {
		types: t,
		literals: n,
		objects: r
	};
}
//#endregion
//#region src/parse.js
function I(t, n = {}) {
	let r = typeof t == "object" && !!t && "text" in t, i = r ? t.text : t, a = r ? {
		context: t.context,
		dataFactory: t.dataFactory,
		graph: t.graph
	} : n, o = {
		ctx: {
			...e,
			...a.context || {}
		},
		df: a.dataFactory || d,
		graph: a.graph ? d.namedNode(a.graph) : d.defaultGraph(),
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
		Le[t.type]?.(t, o);
	}
	let c = /* @__PURE__ */ new Set();
	for (let e of o.quads) c.add(v(e.subject, e.predicate, e.object));
	let l = [];
	for (let e of o.removeSet) {
		let t = v(e.subject, e.predicate, e.object);
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
function L(e) {
	return e.type === "code" ? [] : e._carriers || (e._carriers = Oe(e.text, e.range[0]));
}
function De(e) {
	let t = [], n = [], r = e.split("\n"), i = 0, a = null, o = [
		{
			type: "fence",
			test: (e) => re(e.trim()),
			process: s
		},
		{
			type: "content",
			test: () => a,
			process: (e) => a.content.push(e)
		},
		{
			type: "prefix",
			test: (e) => ie(e),
			process: c
		},
		{
			type: "standalone",
			test: (e) => se(e),
			process: p
		},
		{
			type: "heading",
			test: (e) => ae(e),
			process: l
		},
		{
			type: "list",
			test: (e) => y(e),
			process: u
		},
		{
			type: "blockquote",
			test: (e) => oe(e),
			process: d
		},
		{
			type: "para",
			test: (e) => e.trim(),
			process: f
		}
	];
	function s(e, r, i) {
		let o = e.trim();
		if (a) {
			let i = a.fence[0], s = i.repeat(a.fence.length), c = o.match(pe(i));
			if (c && c[1] === s) {
				let i = a.valueRangeStart, o = Math.max(i, r - 1);
				t.push({
					type: "code",
					range: [a.start, r],
					text: a.content.join("\n"),
					lang: a.lang,
					attrs: a.attrs,
					attrsRange: a.attrsRange,
					valueRange: [i, o]
				});
				for (let e of a.content) n.push(e);
				a = null;
				let s = e.replace(/\r?\n.*$/, "");
				n.push(s);
			}
		} else {
			let t = re(o);
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
	function c(e, n, r) {
		let i = ie(e);
		return t.push({
			type: "prefix",
			prefix: i.prefix,
			iri: i.iri
		}), !0;
	}
	function l(e, r, i) {
		let a = ae(e), o = a.attrs, s = a.depth, c = C(e, o, r, s, a.content.length);
		t.push(T("heading", [r, i - 1], a.content, o, c.attrsRange, c.valueRange, { depth: a.depth }));
		let l = `${"#".repeat(a.depth)} ${a.content}`;
		return n.push(l), !0;
	}
	function u(e, r, i) {
		let a = y(e), o = " ".repeat(a.indent), s = [
			e,
			o,
			a.marker,
			a.content,
			a.attrs
		];
		t.push(me("list", e, r, i, s));
		let c = `${o}${a.marker} ${a.content}`;
		return n.push(c), !0;
	}
	function d(e, r, i) {
		let a = oe(e), o = a.attrs, s = e.startsWith("> ") ? 2 : e.indexOf(">") + 1, c = s + a.content.length;
		t.push(T("blockquote", [r, i - 1], a.content, o, w(e, o, r), [r + s, r + c]));
		let l = `> ${a.content}`;
		return n.push(l), !0;
	}
	function f(e, r, i) {
		t.push(T("para", [r, i - 1], e.trim()));
		let a = e, o = x(a, 0);
		for (let e of o) if (e.attrs && (e.type === "emphasis" || e.type === "code")) {
			let t = a.substring(0, e.range[0]), n = a.substring(e.range[1]);
			a = t + (e.text || "") + n;
		}
		return a = a.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, "$1"), a = a.replace(/\s*\{[^}]+\}\s*/g, " "), a = a.replace(/\s+/g, " ").trim(), n.push(a), !0;
	}
	function p(e, n, r) {
		return t.push({
			type: "standalone",
			text: e.trim(),
			range: [n, r - 1]
		}), !0;
	}
	for (let e = 0; e < r.length; e++) {
		let t = r[e], n = i;
		i += t.length + 1;
		for (let e of o) if (e.test(t) && e.process(t, n, i)) break;
	}
	return {
		tokens: t,
		md: n.join("\n")
	};
}
function Oe(e, t = 0) {
	return x(e, t);
}
function R(e, t) {
	let n = e._blockId || p(`${e.type}:${e.range?.[0]}:${e.range?.[1]}`);
	e._blockId = n;
	let r = L(e), i = ve(e), a = {
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
			let n = D(e.attrs);
			t.sem = n, t.predicates = n.predicates || [], t.subject = n.subject, t.types = n.types || [];
		}
		a.carriers.push(t);
	}
	return t.origin.blocks.set(n, a), t.origin.documentStructure.push(a), a;
}
function ke(e, t, n, r) {
	if (t.subject && t.subject !== "RESET") {
		let n = k(t, r);
		n && (e.subject = n.value);
	}
	if (t.types && t.types.length > 0 && t.types.forEach((t) => {
		let n = h(typeof t == "string" ? t : t.iri, r.ctx);
		e.types.includes(n) || e.types.push(n);
	}), t.predicates && t.predicates.length > 0 && t.predicates.forEach((t) => {
		let n = {
			iri: h(t.iri, r.ctx),
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
			let e = D(n.attrs);
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
	let o = n.currentSubject, s = k(t, n), c = be(t, n);
	s && !n.primarySubject && !t.subject.startsWith("=#") && (n.primarySubject = s.value), s && !i && !a && (n.currentSubject = s);
	let l = i ? s || o : a || n.currentSubject;
	if (!l) return;
	let u = je(l.value, t.types, t.predicates, e.range, e.attrsRange || null, e.valueRange || null, e.type || null, n.ctx, e.text), d = ne(e.text, t.datatype, t.language, n.ctx, n.df), f = e.url ? n.df.namedNode(h(e.url, n.ctx)) : null, p = s || f;
	n.currentBlock && ke(n.currentBlock, t, e, n), Pe(t, s, c, f, l, u, n, e), Ie(t, s, o, c, p, l, d, u, n, e);
}
function je(e, t, n, r, i, a, o, s, c) {
	let l = {
		subject: e,
		types: t.map((e) => h(typeof e == "string" ? e : e.iri, s)),
		predicates: n.map((e) => ({
			iri: h(e.iri, s),
			form: e.form
		}))
	};
	return {
		id: p([
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
function z(e, t, n, r, i, a, o, s, c, l = null, u = null, d = null, f = null) {
	if (!a || !o || !s) return;
	let p = c.quad(a, o, s);
	if (l?.remove) {
		let i = v(p.subject, p.predicate, p.object);
		if (t.has(i)) {
			t.delete(i);
			let n = e.findIndex((e) => e.subject.value === p.subject.value && e.predicate.value === p.predicate.value && e.object.value === p.object.value);
			n !== -1 && e.splice(n, 1), r.delete(i);
		} else n.add(p);
	} else {
		let n = v(p.subject, p.predicate, p.object);
		t.set(n, p), e.push(p), Me(p, c, l, u, d);
		let s = ye(i, a, o, l);
		r.set(n, s), f.currentBlock && i.id === f.currentBlock.id && (f.currentBlock.quadKeys || (f.currentBlock.quadKeys = []), f.currentBlock.quadKeys.push(n));
	}
}
function Me(e, t, n, r = null, i = null) {
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
var Ne = (e, t, n, r, i = null) => {
	let a = h(e, n.ctx), o = typeof i == "object" ? i : {
		entryIndex: i,
		remove: !1
	};
	z(n.quads, n.quadBuffer, n.removeSet, n.origin.quadIndex, r, t, n.df.namedNode(h("rdf:type", n.ctx)), n.df.namedNode(a), n.df, {
		kind: "type",
		token: `.${e}`,
		expandedType: a,
		entryIndex: o.entryIndex,
		remove: o.remove
	}, n.statements, n.statementCandidates, n);
};
function Pe(e, t, n, r, i, a, o, s) {
	e.types.forEach((e) => {
		Ne(typeof e == "string" ? e : e.iri, t || n || r || i, o, a, typeof e == "string" ? {
			entryIndex: null,
			remove: !1
		} : e);
	});
}
var Fe = (e, t, n, r, i, a, o, s) => {
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
function Ie(e, t, n, r, i, a, o, s, c, l) {
	e.predicates.forEach((e) => {
		let u = Fe(e, l, t, n, r, i, a, o);
		if (u) {
			let t = c.df.namedNode(h(e.iri, c.ctx));
			z(c.quads, c.quadBuffer, c.removeSet, c.origin.quadIndex, s, u.subject, t, u.object, c.df, {
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
function B(e, t, n, r = {}) {
	Ae(e, t, n, r);
}
function V(e, t, n) {
	if (e.attrs) {
		let r = D(e.attrs);
		B({
			type: n,
			text: e.text,
			range: e.range,
			attrsRange: e.attrsRange || null,
			valueRange: e.valueRange || null
		}, r, t);
	}
	L(e).forEach((e) => {
		e.attrs && B(e, D(e.attrs), t);
	});
}
function H(e, t) {
	let n = se(e.text);
	if (!n) return;
	let r = D(`{=${n.content}}`), i = e.range[0] + e.text.indexOf("{=");
	B({
		type: "standalone",
		text: "",
		range: e.range,
		attrsRange: [i, i + (n.content ? n.content.length : 0)],
		valueRange: null
	}, r, t);
}
var Le = {
	heading: (e, t) => P(e, t, V, R),
	code: (e, t) => P(e, t, V, R),
	blockquote: (e, t) => P(e, t, V, R),
	para: (e, t) => P(e, t, V, R, [H]),
	list: (e, t) => P(e, t, V, R),
	standalone: (e, t) => H(e, t)
};
//#endregion
//#region src/merge.js
function U(e) {
	return te(e);
}
function Re(e, t, n) {
	return typeof e == "string" ? I({
		text: e,
		...t,
		context: {
			...n,
			...t.context
		}
	}) : e;
}
function ze(t, n = {}) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = [], o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Map(), l = [];
	for (let u = 0; u < t.length; u++) {
		let d = t[u], f = Re(d, n, {
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
			let t = U(e);
			r.set(t, e);
			let n = f.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: u,
				polarity: "+"
			});
		}
		for (let e of f.remove) {
			let t = U(e);
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
	}, m = new Set(u.map(U)), h = new Set(d.map(U));
	return {
		quads: u.filter((e) => !h.has(U(e))),
		remove: d.filter((e) => !m.has(U(e))),
		statements: s,
		origin: f,
		context: p,
		primarySubjects: l
	};
}
//#endregion
//#region src/generate.js
var W = /* @__PURE__ */ new Map(), G = 1e3;
function K(e, t) {
	let n = `${e}|${JSON.stringify(t)}`;
	if (W.has(n)) return W.get(n);
	let r = g(e, t);
	return W.size >= G && Array.from(W.keys()).slice(0, Math.floor(G / 2)).forEach((e) => W.delete(e)), W.set(n, r), r;
}
function Be(e, t = {}) {
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
function Ve({ quads: t, context: n = {}, primarySubject: r = null }) {
	let i = Object.assign({}, e, n), a = Ue(t), o = We(a), s = r;
	!s && a.length > 0 && (s = a[0].subject.value);
	let { text: c } = Ke(o, i, s);
	return {
		text: c,
		context: i
	};
}
function He({ quads: t, focusIRI: n, context: r = {} }) {
	if (!t?.length || !n) return {
		text: "",
		context: Object.assign({}, e, r)
	};
	let i = Object.assign({}, e, r), a = Ge(Ue(t));
	if (!a.has(n)) return {
		text: "",
		context: i
	};
	let { text: o } = Ke(a, i, n);
	return {
		text: o,
		context: i
	};
}
function Ue(e) {
	return !e || e.length === 0 ? [] : e.map((e) => e.subject.termType && e.predicate.termType && e.object.termType ? e : {
		subject: d.fromTerm(e.subject),
		predicate: d.fromTerm(e.predicate),
		object: d.fromTerm(e.object)
	}).sort((e, t) => {
		let n = e.subject.value.localeCompare(t.subject.value);
		if (n !== 0) return n;
		let r = e.predicate.value.localeCompare(t.predicate.value);
		if (r !== 0) return r;
		let i = (j(e.object), e.object.value), a = (j(t.object), t.object.value);
		return i.localeCompare(a);
	});
}
function We(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.subject.value, r = t.get(e);
		r ? r.push(n) : t.set(e, [n]);
	}
	return t;
}
function Ge(e) {
	let t = /* @__PURE__ */ new Map(), n = (e) => {
		let n = t.get(e);
		if (n) return n;
		let r = [];
		return t.set(e, r), r;
	};
	for (let t of e) {
		let { subject: e, predicate: r, object: i } = t;
		n(e.value).push(t), i.termType === "NamedNode" && n(i.value).push(t), n(r.value).push(t), r.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && i.termType === "NamedNode" && n(i.value).push(t), i.termType === "Literal" && i.datatype && n(i.datatype.value || i.datatype).push(t);
	}
	return t;
}
function Ke(t, n, r = null) {
	let i = [], a = Se(t, n), o = qe(t), s = Object.entries(n).sort(([e], [t]) => e.localeCompare(t));
	for (let [t, n] of s) t !== "@vocab" && !t.startsWith("@") && !e[t] && a.has(t) && i.push(Ce(t, n));
	s.length > 0 && i.push("\n");
	let c = Array.from(t.keys()).sort(), l = r, u = l ? [l, ...c.filter((e) => e !== l)] : c;
	for (let e of u) {
		let r = t.get(e);
		if (!r) continue;
		let a = K(e, n), { types: s, literals: c, objects: l } = Ee(r), u = o.has(e), d = u ? o.get(e) : Be(e, n), f = s.length > 0 ? s.map((e) => "." + K(e.object.value, n)).sort().join(" ") : "";
		u && (f += (f ? " " : "") + "label");
		let p = f ? " " + f : "";
		i.push(`# ${d} {=${a}${p}}\n\n`);
		let m = u ? o.get(e) : null;
		F(c).forEach((e) => {
			e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.value === m || i.push(we(e, n));
		}), F(l).forEach((e) => {
			i.push(Te(e, n, o));
		}), i.push("\n");
	}
	return { text: i.join("") };
}
function qe(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.values()) for (let e of n) e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.termType === "Literal" && t.set(e.subject.value, e.object.value);
	return t;
}
//#endregion
//#region src/render.js
function Je(e, t = {}) {
	let n = I({
		text: e,
		context: t.context || {}
	}), r = Ye(n, t, e), i = {
		html: ht(Xe(n.origin.blocks, r), r.ctx),
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
function Ye(t, n, r) {
	return {
		ctx: t.context || {
			...e,
			...n.context || {}
		},
		df: n.dataFactory || d,
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
function Xe(e, t) {
	let n = Array.from(e.values()).sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0)), r = n.filter((e) => e.carrierType === "list");
	return n.filter((e) => e.carrierType !== "list").forEach((e) => {
		Ze(e, t);
	}), r.length > 0 && lt(r, t), t.output.join("");
}
function Ze(e, t) {
	e.subject && e.subject !== "RESET" && (t.currentSubject = e.subject);
	let n = Qe(e, t);
	switch (n && t.renderMap.set(e.id || gt(e), n), e.type || e.carrierType) {
		case "heading":
			et(e, n, t);
			break;
		case "para":
			tt(e, n, t);
			break;
		case "list": break;
		case "quote":
			nt(e, n, t);
			break;
		case "code":
			rt(e, n, t);
			break;
		default: it(e, n, t);
	}
}
function Qe(e, t) {
	let n = [];
	if (!e.subject || e.subject === "RESET" || e.subject.startsWith("=#") || e.subject.startsWith("+")) return "";
	let r = h(e.subject, t.ctx);
	if (n.push(`about="${A(r)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => h(typeof e == "string" ? e : e.iri, t.ctx)).join(" ");
		n.push(`typeof="${A(r)}"`);
	}
	let i = [];
	if (e.predicates && e.predicates.length > 0 && i.push(...e.predicates), e.carriers && e.carriers.length > 0) for (let t of e.carriers) t.predicates && t.predicates.length > 0 && i.push(...t.predicates);
	if (i.length > 0) {
		let { literalProps: e, objectProps: r, reverseProps: a } = $e(i, t.ctx);
		e.length > 0 && n.push(`property="${A(e.join(" "))}"`), r.length > 0 && n.push(`rel="${A(r.join(" "))}"`), a.length > 0 && n.push(`rev="${A(a.join(" "))}"`);
	}
	return n.length > 1 && t.renderedRDFaCount++, n.length > 0 ? ` ${n.join(" ")}` : "";
}
function $e(e, t) {
	let n = [], r = [], i = [];
	for (let a of e) {
		let e = h(typeof a == "string" ? a : a.iri, t);
		a.polarity === "-" ? i.push(e) : a.object && a.object.termType === "NamedNode" ? r.push(e) : n.push(e);
	}
	return {
		literalProps: n,
		objectProps: r,
		reverseProps: i
	};
}
function et(e, t, n) {
	let r = `h${e.text && e.text.match(/^#+/)?.[0]?.length || 1}`, i = _e(n.sourceText, e.range);
	i = i.replace(/\s*\{[^}]+\}\s*$/g, "").trim(), n.output.push(`<${r}${t}>${A(i)}</${r}>`);
}
function tt(e, t, n) {
	let r = q(e, n);
	n.output.push(`<p${t}>${r}</p>`);
}
function nt(e, t, n) {
	let r = q(e, n);
	n.output.push(`<blockquote${t}>${r}</blockquote>`);
}
function rt(e, t, n) {
	let r = e.info || "", i = e.text || "";
	n.output.push(`<pre><code${t}${r ? ` class="language-${A(r)}"` : ""}>${A(i)}</code></pre>`);
}
function it(e, t, n) {
	let r = q(e, n);
	n.output.push(`<div${t}>${r}</div>`);
}
function q(e, t) {
	if (!e.carriers || e.carriers.length === 0) return A(at(t.sourceText, e.range));
	let n = ot(e);
	return st(at(t.sourceText, e.range), n, t);
}
function at(e, t) {
	if (!t || !e) return "";
	let n = e.substring(t[0], t[1]);
	return n = n.replace(/\s*\{[^}]*\}\s*$/gm, ""), n = n.replace(/\{[^}]*\}/g, ""), n = n.replace(/\s+/g, " ").trim(), n = n.replace(/\]$/, ""), n;
}
function ot(e) {
	let t = [];
	if (!e.carriers) return t;
	for (let n of e.carriers) !n.text || !n.range || t.push({
		pos: n.range[0] - e.range[0],
		carrier: n,
		length: n.text.length
	});
	return t.sort((e, t) => e.pos - t.pos);
}
function st(e, t, n) {
	if (t.length === 0) return A(e);
	let r = "", i = 0;
	for (let a of t) a.pos > i && (r += A(e.substring(i, a.pos))), r += ct(a.carrier, n), i = a.pos + a.length;
	return i < e.length && (r += A(e.substring(i))), r;
}
function ct(e, t) {
	let n = [], r = e.subject || t.currentSubject;
	if (!r || r === "RESET" || r.startsWith("=#") || r.startsWith("+")) return A(e.text || "");
	let i = g(h(r, t.ctx), t.ctx);
	if (n.push(`about="${A(i)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => g(h(typeof e == "string" ? e : e.iri, t.ctx), t.ctx)).join(" ");
		n.push(`typeof="${A(r)}"`);
	}
	if (e.predicates && e.predicates.length > 0) {
		let { literalProps: r, objectProps: i, reverseProps: a } = $e(e.predicates, t.ctx);
		if (r.length > 0) {
			let e = r.map((e) => g(e, t.ctx)).join(" ");
			n.push(`property="${A(e)}"`);
		}
		if (i.length > 0) {
			let e = i.map((e) => g(e, t.ctx)).join(" ");
			n.push(`rel="${A(e)}"`);
		}
		if (a.length > 0) {
			let e = a.map((e) => g(e, t.ctx)).join(" ");
			n.push(`rev="${A(e)}"`);
		}
	}
	let a = n.length > 0 ? ` ${n.join(" ")}` : "";
	switch (e.type) {
		case "emphasis": return `<em${a}>${A(e.text || "")}</em>`;
		case "strong": return `<strong${a}>${A(e.text || "")}</strong>`;
		case "code": return `<code${a}>${A(e.text || "")}</code>`;
		case "link": return `<a href="${A(e.url || "")}"${a}>${A(e.text || "")}</a>`;
		default: return `<span${a}>${A(e.text || "")}</span>`;
	}
}
function lt(e, t) {
	ut(e, t.sourceText).forEach((e) => {
		dt(e, t);
	});
}
function ut(e, t) {
	let n = [], r = null, i = e.sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0));
	for (let e of i) ge(e, t) === 0 ? (r && n.push(r), r = {
		contextName: "Items",
		blocks: [e]
	}) : r ? r.blocks.push(e) : r = {
		contextName: "Items",
		blocks: [e]
	};
	return r && n.push(r), n;
}
function dt(e, t) {
	t.output.push("<ul>");
	for (let n of e.blocks) ft(n, t);
	t.output.push("</ul>");
}
function ft(e, t) {
	let n = Qe(e, t), r = q(e, t);
	t.output.push(`<li${n}>${r}</li>`);
}
function pt(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) n !== "@vocab" && t.push(`${n}: ${r}`);
	return t.length > 0 ? ` prefix="${t.join(" ")}"` : "";
}
function mt(e) {
	return e["@vocab"] ? ` vocab="${e["@vocab"]}"` : "";
}
function ht(e, t) {
	return `<div${pt(t)}${mt(t)}>${e}</div>`;
}
function gt(e) {
	return _t(`${e.type || e.carrierType}|${e.subject || ""}|${e.text || ""}`);
}
function _t(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return t.toString(36);
}
//#endregion
//#region src/highlight.js
function J(e) {
	return String(e).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
var Y = {
	text: "#6b7280",
	marker: "#f97316",
	retraction: "#dc2626",
	value: "#eab308",
	annotation: "#4b5563"
};
function X(e, t) {
	let n = t;
	for (; n < e.length && e[n] !== "\n" && e[n] !== "\r";) {
		if (e[n] === "{") return !0;
		n++;
	}
	return !1;
}
function vt(e, t) {
	let n = e[t];
	if (n === "*" && t + 1 < e.length && e[t + 1] === "*") {
		let n = e.indexOf("**", t + 2);
		if (n !== -1) {
			let r = e.slice(t + 2, n), i = X(e, n + 2) ? ` style="color: ${Y.marker}"` : "";
			return {
				html: `<span${i}>**</span><strong>${J(r)}</strong><span${i}>**</span>`,
				nextIndex: n + 2
			};
		}
	}
	if (n === "_" && t + 1 < e.length && e[t + 1] === "_") {
		let n = e.indexOf("__", t + 2);
		if (n !== -1) {
			let r = e.slice(t + 2, n), i = X(e, n + 2) ? ` style="color: ${Y.marker}"` : "";
			return {
				html: `<span${i}>__</span><strong>${J(r)}</strong><span${i}>__</span>`,
				nextIndex: n + 2
			};
		}
	}
	if (n === "*") {
		let n = e.indexOf("*", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = X(e, n + 1) ? ` style="color: ${Y.marker}"` : "";
			return {
				html: `<span${i}>*</span><em>${J(r)}</em><span${i}>*</span>`,
				nextIndex: n + 1
			};
		}
	}
	if (n === "_") {
		let n = e.indexOf("_", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = X(e, n + 1) ? ` style="color: ${Y.marker}"` : "";
			return {
				html: `<span${i}>_</span><em>${J(r)}</em><span${i}>_</span>`,
				nextIndex: n + 1
			};
		}
	}
	if (n === "`") {
		let n = e.indexOf("`", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = X(e, n + 1) ? ` style="color: ${Y.marker}"` : "";
			return {
				html: `<span${i}>\`</span><code style="background-color:#7773">${J(r)}</code><span${i}>\`</span>`,
				nextIndex: n + 1
			};
		}
	}
	return null;
}
var Z = /* @__PURE__ */ new Map();
function yt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return Math.abs(t);
}
function Q(e) {
	if (Z.has(e)) return Z.get(e);
	let t = yt(e), n = `hsl(${t % 360}, ${15 + t % 10}%, ${45 + t % 10}%)`;
	return Z.set(e, n), n;
}
function bt(t) {
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
	let r = t ? Y.retraction : Y.text, i = e.indexOf(":");
	if (i > 0) {
		let t = e.slice(0, i), r = e.slice(i + 1);
		if (n.has(t)) {
			let e = n.get(t), i = Q(e), a = e + r, o = Q(a);
			return `<span style="color: ${i}">${J(t)}</span><span style="color: ${Y.marker}">:</span><span data-iri="${a}" style="color: ${o}">${J(r)}</span> `;
		}
	}
	return e.startsWith("http:") || e.startsWith("https:") || e.startsWith("tag:") || e.startsWith("urn:") ? `<span style="color: ${Q(e)}">${J(e)}</span> ` : `<span style="color: ${r}">${J(e)}</span> `;
}
function xt(e, t) {
	let n = e.trim().split(/\s+/), r = "", i = !1;
	for (let e = 0; e < n.length; e++) {
		let a = n[e];
		if (!a) continue;
		if (a.startsWith("=") || a.startsWith("+")) {
			let e = a[0], n = a.slice(1);
			r += `<span style="color: ${Y.marker}">${J(e)}</span>${$(n, !1, t)}`;
			continue;
		}
		if (a === "-") {
			i = !0, r += `<span style="color: ${Y.retraction}">${J(a)}</span> `;
			continue;
		}
		if (a.startsWith("-") && a.length > 1) {
			r += `<span style="color: ${Y.retraction}">${J(a)}</span> `;
			continue;
		}
		let o = i;
		if (i = !1, a.startsWith("?") || a.startsWith("!")) {
			let e = a[0], n = a.slice(1), i = o ? Y.retraction : Y.marker;
			r += `<span style="color: ${i}">${J(e)}</span>${$(n, o, t)}`;
			continue;
		}
		if (a.startsWith("^^")) {
			let e = a.slice(2), n = o ? Y.retraction : Y.marker;
			r += `<span style="color: ${n}">${J("^^")}</span>${$(e, o, t)}`;
			continue;
		}
		if (a.startsWith("@")) {
			let e = a.slice(1), n = o ? Y.retraction : Y.marker;
			r += `<span style="color: ${n}">${J("@")}</span>${$(e, o, t)}`;
			continue;
		}
		if (a.startsWith(".")) {
			let e = a.slice(1), n = o ? Y.retraction : Y.marker;
			r += `<span style="color: ${n}">${J(".")}</span>${$(e, o, t)}`;
			continue;
		}
		r += $(a, o, t);
	}
	return r.trim();
}
function St(e) {
	let t = bt(e), n = "", r = 0;
	for (; r < e.length;) {
		let i = e[r];
		if (i === "{") {
			let a = e.indexOf("}", r);
			if (a === -1) {
				n += J(i), r++;
				continue;
			}
			let o = xt(e.slice(r + 1, a), t);
			n += `<span style="color: ${Y.annotation}; opacity: 0.75">{</span>`, n += o, n += `<span style="color: ${Y.annotation}; opacity: 0.75">}</span>`, r = a + 1;
			continue;
		}
		if (i === "[") {
			let a = e.indexOf("]", r);
			if (a === -1) {
				n += J(i), r++;
				continue;
			}
			let o = e.slice(r + 1, a), s = a + 1;
			for (; s < e.length && /\s/.test(e[s]);) s++;
			if (s < e.length && e[s] === "<") {
				let i = e.indexOf(">", s);
				if (i !== -1) {
					let a = e.slice(s + 1, i), c = t.has(o) ? Q(t.get(o)) : Y.text;
					n += `<span style="color: ${Y.annotation}; opacity: 0.75">[</span><span style="color: ${c}">${J(o)}</span><span style="color: ${Y.annotation}; opacity: 0.75">]</span> <span style="color: ${Y.text}; opacity: 0.6">&lt;${J(a)}&gt;</span>`, r = i + 1;
					continue;
				}
			}
			let c = e.slice(r + 1, a), l = X(e, a + 1) ? Y.marker : Y.value, u = J(c);
			n += `<span style="color: ${l}; opacity: 0.85">[</span><span style=" opacity: 1.0">${u}</span><span style="color: ${l}; opacity: 0.85">]</span>`, r = a + 1;
			continue;
		}
		if (i === "*" || i === "_" || i === "`") {
			let t = vt(e, r);
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
					l += J(n);
					let r = xt(c.slice(d + 1, e), t);
					l += `<span style="color: ${Y.annotation}; opacity: 0.75">{</span>` + r + `<span style="color: ${Y.annotation}; opacity: 0.75">}</span>`, u = e + 1, d = c.indexOf("{", u);
				}
				l += J(c.slice(u));
				let f = c.includes("{") && c.includes("}"), p = `h${i}`, m = "#".repeat(i), h = f ? `color: ${Y.marker}; opacity: 0.8` : "";
				n += `<${p} style="margin: 0; font-weight: 600;"><span style="${h}">${m}</span> ${l}</${p}>`, r = s;
				continue;
			}
		}
		if (i === "-" || i === "*") {
			let t = r > 0 ? e[r - 1] : "\n";
			if ((t === "\n" || t === "\r" || t === " " || t === "	") && e[r + 1] === " ") {
				let t = X(e, r + 2) ? `color: ${Y.marker}; opacity: 0.85` : "";
				n += `<span style="${t}">${J(i)}</span>`, r++;
				continue;
			}
		}
		if (i === ">") {
			let t = r > 0 ? e[r - 1] : "\n";
			if ((t === "\n" || t === "\r" || t === " " || t === "	") && e[r + 1] === " ") {
				let t = X(e, r + 2) ? `color: ${Y.marker}; opacity: 0.85` : "";
				n += `<span style="${t}">${J(i)}</span>`, r++;
				continue;
			}
		}
		n += J(i), r++;
	}
	return n;
}
//#endregion
export { e as DEFAULT_CONTEXT, d as DataFactory, h as expandIRI, Ve as generate, He as generateNode, Q as getIRIColor, p as hash, yt as hashIRI, St as highlightMDLD, f as locate, ze as merge, I as parse, _ as parseSemanticBlock, Je as render, g as shortenIRI };
