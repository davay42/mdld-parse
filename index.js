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
	let n = y(e);
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
function y(e) {
	return e ? v(e.subject, e.predicate, e.object) : null;
}
function te(e, t, n, r, i) {
	return t ? i.literal(e, i.namedNode(h(t, r))) : n ? i.literal(e, n) : i.literal(e);
}
//#endregion
//#region src/tokenizers.js
function b(e) {
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
function x(e) {
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
function S(e) {
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
function C(e) {
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
function w(e) {
	if (e[0] !== ">" || e.length > 1 && e[1] !== " " && e[1] !== "	") return null;
	let t = 1;
	for (; t < e.length && (e[t] === " " || e[t] === "	");) t++;
	let n = e.slice(t), r = null, i = n.match(/\s*\{([^}]+)\}\s*$/);
	return i && (r = i[1], n = n.slice(0, -i[0].length).trim()), {
		content: n,
		attrs: r
	};
}
function T(e) {
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
function ne(e, t, n = "[", r = "]") {
	let i = 1, a = t + 1;
	for (; a < e.length && i > 0;) e[a] === n && i++, e[a] === r && i--, i > 0 && a++;
	return i === 0 ? a : null;
}
function E(e, t) {
	let n = t;
	for (; n < e.length && (e[n] === " " || e[n] === "	");) n++;
	if (n >= e.length || e[n] !== "{") return null;
	let r = e.indexOf("}", n + 1);
	return r === -1 ? null : {
		attrs: e.slice(n + 1, r),
		endPos: r + 1
	};
}
function re(e, t) {
	if (e[t] !== "<") return null;
	let n = e.indexOf(">", t + 1);
	if (n === -1) return null;
	let r = e.slice(t + 1, n).trim();
	return r.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/) ? {
		url: r,
		endPos: n + 1
	} : null;
}
function ie(e, t) {
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
			let t = e.slice(o, s), a = s + r, c = E(e, a), l = c ? c.endPos : a;
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
function ae(e, t) {
	if (e[t] !== "`") return null;
	let n = 1;
	for (; t + n < e.length && e[t + n] === "`";) n++;
	if (n > 2) return null;
	let r = "`".repeat(n), i = t + n, a = i;
	for (; a < e.length;) {
		if (e.slice(a, a + n) === r) {
			let t = e.slice(i, a), r = a + n, o = E(e, r), s = o ? o.endPos : r;
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
function oe(e, t) {
	if (e[t] !== "[") return null;
	let n = ne(e, t, "[", "]");
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
	let o = E(e, i), s = o ? o.endPos : i;
	return {
		type: a ? "link" : "span",
		text: r,
		url: a,
		attrs: o?.attrs || null,
		endPos: s,
		bracketEnd: n + 1
	};
}
function se(e, t = 0) {
	let n = [], r = e.length, i = 0;
	for (; i < r;) {
		let r = e[i], a = null;
		switch (r) {
			case "<":
				if (a = re(e, i), a) {
					let t = E(e, a.endPos);
					t && (a.attrs = t.attrs, a.endPos = t.endPos), a.type = "link", a.text = a.url;
				}
				break;
			case "[":
				a = oe(e, i);
				break;
			case "*":
			case "_":
				a = ie(e, i);
				break;
			case "`":
				a = ae(e, i);
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
var D = /* @__PURE__ */ new Map();
function ce(e) {
	return D.has(e) || D.set(e, RegExp(`^(${e}{3,})`)), D.get(e);
}
function O(e, t, n, r, i) {
	let a = r + (r < e.length && e[r] === " " ? 1 : e.slice(r).match(/^\s+/)?.[0]?.length || 0);
	return {
		valueRange: [n + a, n + a + i],
		attrsRange: k(e, t, n)
	};
}
function k(e, t, n) {
	if (!t) return null;
	let r = e.lastIndexOf(t);
	return r >= 0 ? [n + r, n + r + t.length] : null;
}
function A(e, t, n, r = null, i = null, a = null, o = {}) {
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
function le(e, t, n, r, i) {
	let a = i[4] || null, o = O(t, a, n, i[1].length + (i[2] ? i[2].length : 0), i[3].length);
	return A(e, [n, r - 1], i[3].trim(), a, o.attrsRange, o.valueRange, { indent: i[1].length });
}
var j = {}, ue = Object.freeze({
	predicates: [],
	types: [],
	subject: null
});
function M(e) {
	if (!e) return ue;
	let t = j[e];
	return t || (t = Object.freeze(_(e)), j[e] = t), t;
}
function de(e, t) {
	if (!e.range || !t) return 0;
	let n = t.substring(e.range.start, e.range.end).match(/^(\s*)/), r = n ? n[1].length : 0;
	return Math.floor(r / 2);
}
function fe(e, t, n = null) {
	if (!t || !e) return "";
	let r = e.substring(t[0], t[1]);
	return n && (r = r.substring(0, n[0] - t[0]) + r.substring(n[1] - t[0])), r.trim();
}
function pe(e) {
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
function me(e, t, n, r = null) {
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
function N(e, t, n) {
	if (!t) return null;
	let r = t.value, i = r.indexOf("#"), a = i > -1 ? r.slice(0, i) : r;
	return n.namedNode(a + "#" + e);
}
function P(e, t) {
	return e.subject ? e.subject === "RESET" ? (t.currentSubject = null, null) : e.subject.startsWith("=#") ? N(e.subject.substring(2), t.currentSubject, t.df) : t.df.namedNode(h(e.subject, t.ctx)) : null;
}
function he(e, t) {
	return e.object ? e.object.startsWith("#") ? N(e.object.substring(1), t.currentSubject, t.df) : t.df.namedNode(h(e.object, t.ctx)) : null;
}
function F(e) {
	return e ? e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : "";
}
function I(e) {
	return e?.termType === "Literal";
}
function L(e) {
	return e?.termType === "NamedNode";
}
function ge(e) {
	return e?.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
}
function R(e, t) {
	if (!e) return null;
	let n = g(e, t);
	return n.includes(":") ? n.split(":")[0] : null;
}
function _e(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of e.values()) for (let e of r) {
		let r = R(e.subject.value, t);
		r && n.add(r);
		let i = R(e.predicate.value, t);
		if (i && n.add(i), L(e.object)) {
			let r = R(e.object.value, t);
			r && n.add(r);
		}
		if (e.object.datatype && e.object.datatype.value) {
			let r = R(e.object.datatype.value, t);
			r && n.add(r);
		}
	}
	return n;
}
function z(e, t, n, r, i = []) {
	let a = r(e, t);
	t.currentBlock = a, t.blockStack.push(a.id), i.forEach((n) => n(e, t)), n(e, t, e.type), t.blockStack.pop(), t.currentBlock = t.blockStack.length > 0 ? t.origin.blocks.get(t.blockStack[t.blockStack.length - 1]) : null;
}
function B(e) {
	return e.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
}
var ve = (e, t) => `[${e}] <${t}>\n`;
function ye(e, t) {
	let n = g(e.predicate.value, t);
	e.object.language ? n += ` @${e.object.language}` : e.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" && (n += ` ^^${g(e.object.datatype.value, t)}`);
	let r = e.object.value || e.object, i = typeof r == "string" ? r : String(r), a = e.object.datatype?.value || "";
	return i.includes("\n") ? `~~~ {${n}}\n${i}\n~~~\n\n` : a.includes("integer") || a.includes("decimal") || a.includes("double") || a.includes("float") ? `\`${i}\` {${n}}\n` : a.includes("date") || a.includes("time") ? `*${i}* {${n}}\n` : a.includes("boolean") ? `**${i}** {${n}}\n` : `[${i}] {${n}}\n`;
}
var be = (e, t, n = null) => {
	let r = g(e.object.value, t), i = g(e.predicate.value, t);
	return `[${n && n.has(e.object.value) ? n.get(e.object.value) : r}] {+${r} ?${i}}\n`;
};
function xe(e) {
	let t = [], n = [], r = [];
	for (let i of e) ge(i.predicate) ? t.push(i) : I(i.object) ? n.push(i) : L(i.object) && r.push(i);
	return {
		types: t,
		literals: n,
		objects: r
	};
}
//#endregion
//#region src/parse.js
function V(t, n = {}) {
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
	}, s = Se(i);
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
		Me[t.type]?.(t, o);
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
function H(e) {
	return e.type === "code" ? [] : e._carriers || (e._carriers = Ce(e.text, e.range[0]));
}
function Se(e) {
	let t = [], n = [], r = e.split("\n"), i = 0, a = null, o = [
		{
			type: "fence",
			test: (e) => b(e.trim()),
			process: s
		},
		{
			type: "content",
			test: () => a,
			process: (e) => a.content.push(e)
		},
		{
			type: "prefix",
			test: (e) => x(e),
			process: c
		},
		{
			type: "standalone",
			test: (e) => T(e),
			process: p
		},
		{
			type: "heading",
			test: (e) => S(e),
			process: l
		},
		{
			type: "list",
			test: (e) => C(e),
			process: u
		},
		{
			type: "blockquote",
			test: (e) => w(e),
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
			let i = a.fence[0], s = i.repeat(a.fence.length), c = o.match(ce(i));
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
			let t = b(o);
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
		let i = x(e);
		return t.push({
			type: "prefix",
			prefix: i.prefix,
			iri: i.iri
		}), !0;
	}
	function l(e, r, i) {
		let a = S(e), o = a.attrs, s = a.depth, c = O(e, o, r, s, a.content.length);
		t.push(A("heading", [r, i - 1], a.content, o, c.attrsRange, c.valueRange, { depth: a.depth }));
		let l = `${"#".repeat(a.depth)} ${a.content}`;
		return n.push(l), !0;
	}
	function u(e, r, i) {
		let a = C(e), o = " ".repeat(a.indent), s = [
			e,
			o,
			a.marker,
			a.content,
			a.attrs
		];
		t.push(le("list", e, r, i, s));
		let c = `${o}${a.marker} ${a.content}`;
		return n.push(c), !0;
	}
	function d(e, r, i) {
		let a = w(e), o = a.attrs, s = e.startsWith("> ") ? 2 : e.indexOf(">") + 1, c = s + a.content.length;
		t.push(A("blockquote", [r, i - 1], a.content, o, k(e, o, r), [r + s, r + c]));
		let l = `> ${a.content}`;
		return n.push(l), !0;
	}
	function f(e, r, i) {
		t.push(A("para", [r, i - 1], e.trim()));
		let a = e, o = se(a, 0);
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
function Ce(e, t = 0) {
	return se(e, t);
}
function U(e, t) {
	let n = e._blockId || p(`${e.type}:${e.range?.[0]}:${e.range?.[1]}`);
	e._blockId = n;
	let r = H(e), i = pe(e), a = {
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
function we(e, t, n, r) {
	if (t.subject && t.subject !== "RESET") {
		let n = P(t, r);
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
			let e = M(n.attrs);
			t.sem = e, t.predicates = e.predicates || [], t.subject = e.subject, t.types = e.types || [];
		}
		e.carriers.push(t);
	}
}
function Te(e, t, n, r = {}) {
	let { preserveGlobalSubject: i = !1, implicitSubject: a = null } = r;
	if (t.subject === "RESET") {
		n.currentSubject = null;
		return;
	}
	let o = n.currentSubject, s = P(t, n), c = he(t, n);
	s && !n.primarySubject && !t.subject.startsWith("=#") && (n.primarySubject = s.value), s && !i && !a && (n.currentSubject = s);
	let l = i ? s || o : a || n.currentSubject;
	if (!l) return;
	let u = Ee(l.value, t.types, t.predicates, e.range, e.attrsRange || null, e.valueRange || null, e.type || null, n.ctx, e.text), d = te(e.text, t.datatype, t.language, n.ctx, n.df), f = e.url ? n.df.namedNode(h(e.url, n.ctx)) : null, p = s || f;
	n.currentBlock && we(n.currentBlock, t, e, n), ke(t, s, c, f, l, u, n, e), je(t, s, o, c, p, l, d, u, n, e);
}
function Ee(e, t, n, r, i, a, o, s, c) {
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
function W(e, t, n, r, i, a, o, s, c, l = null, u = null, d = null, f = null) {
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
		t.set(n, p), e.push(p), De(p, c, l, u, d);
		let s = me(i, a, o, l);
		r.set(n, s), f.currentBlock && i.id === f.currentBlock.id && (f.currentBlock.quadKeys || (f.currentBlock.quadKeys = []), f.currentBlock.quadKeys.push(n));
	}
}
function De(e, t, n, r = null, i = null) {
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
var Oe = (e, t, n, r, i = null) => {
	let a = h(e, n.ctx), o = typeof i == "object" ? i : {
		entryIndex: i,
		remove: !1
	};
	W(n.quads, n.quadBuffer, n.removeSet, n.origin.quadIndex, r, t, n.df.namedNode(h("rdf:type", n.ctx)), n.df.namedNode(a), n.df, {
		kind: "type",
		token: `.${e}`,
		expandedType: a,
		entryIndex: o.entryIndex,
		remove: o.remove
	}, n.statements, n.statementCandidates, n);
};
function ke(e, t, n, r, i, a, o, s) {
	e.types.forEach((e) => {
		Oe(typeof e == "string" ? e : e.iri, t || n || r || i, o, a, typeof e == "string" ? {
			entryIndex: null,
			remove: !1
		} : e);
	});
}
var Ae = (e, t, n, r, i, a, o, s) => {
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
function je(e, t, n, r, i, a, o, s, c, l) {
	e.predicates.forEach((e) => {
		let u = Ae(e, l, t, n, r, i, a, o);
		if (u) {
			let t = c.df.namedNode(h(e.iri, c.ctx));
			W(c.quads, c.quadBuffer, c.removeSet, c.origin.quadIndex, s, u.subject, t, u.object, c.df, {
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
function G(e, t, n, r = {}) {
	Te(e, t, n, r);
}
function K(e, t, n) {
	if (e.attrs) {
		let r = M(e.attrs);
		G({
			type: n,
			text: e.text,
			range: e.range,
			attrsRange: e.attrsRange || null,
			valueRange: e.valueRange || null
		}, r, t);
	}
	H(e).forEach((e) => {
		e.attrs && G(e, M(e.attrs), t);
	});
}
function q(e, t) {
	let n = T(e.text);
	if (!n) return;
	let r = M(`{=${n.content}}`), i = e.range[0] + e.text.indexOf("{=");
	G({
		type: "standalone",
		text: "",
		range: e.range,
		attrsRange: [i, i + (n.content ? n.content.length : 0)],
		valueRange: null
	}, r, t);
}
var Me = {
	heading: (e, t) => z(e, t, K, U),
	code: (e, t) => z(e, t, K, U),
	blockquote: (e, t) => z(e, t, K, U),
	para: (e, t) => z(e, t, K, U, [q]),
	list: (e, t) => z(e, t, K, U),
	standalone: (e, t) => q(e, t)
};
//#endregion
//#region src/merge.js
function J(e) {
	return y(e);
}
function Ne(e, t, n) {
	return typeof e == "string" ? V({
		text: e,
		...t,
		context: {
			...n,
			...t.context
		}
	}) : e;
}
function Pe(t, n = {}) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = [], o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Map(), l = [];
	for (let u = 0; u < t.length; u++) {
		let d = t[u], f = Ne(d, n, {
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
			let t = J(e);
			r.set(t, e);
			let n = f.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: u,
				polarity: "+"
			});
		}
		for (let e of f.remove) {
			let t = J(e);
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
	}, m = new Set(u.map(J)), h = new Set(d.map(J));
	return {
		quads: u.filter((e) => !h.has(J(e))),
		remove: d.filter((e) => !m.has(J(e))),
		statements: s,
		origin: f,
		context: p,
		primarySubjects: l
	};
}
//#endregion
//#region src/generate.js
var Y = /* @__PURE__ */ new Map(), X = 1e3;
function Fe(e, t) {
	let n = `${e}|${JSON.stringify(t)}`;
	if (Y.has(n)) return Y.get(n);
	let r = g(e, t);
	return Y.size >= X && Array.from(Y.keys()).slice(0, Math.floor(X / 2)).forEach((e) => Y.delete(e)), Y.set(n, r), r;
}
function Ie(e, t = {}) {
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
function Le({ quads: t, context: n = {}, primarySubject: r = null }) {
	let i = Object.assign({}, e, n), a = ze(t), o = Be(a), s = r;
	!s && a.length > 0 && (s = a[0].subject.value);
	let { text: c } = He(o, i, s);
	return {
		text: c,
		context: i
	};
}
function Re({ quads: t, focusIRI: n, context: r = {} }) {
	if (!t?.length || !n) return {
		text: "",
		context: Object.assign({}, e, r)
	};
	let i = Object.assign({}, e, r), a = Ve(ze(t));
	if (!a.has(n)) return {
		text: "",
		context: i
	};
	let { text: o } = He(a, i, n);
	return {
		text: o,
		context: i
	};
}
function ze(e) {
	return !e || e.length === 0 ? [] : e.map((e) => e.subject.termType && e.predicate.termType && e.object.termType ? e : {
		subject: d.fromTerm(e.subject),
		predicate: d.fromTerm(e.predicate),
		object: d.fromTerm(e.object)
	}).sort((e, t) => {
		let n = e.subject.value.localeCompare(t.subject.value);
		if (n !== 0) return n;
		let r = e.predicate.value.localeCompare(t.predicate.value);
		if (r !== 0) return r;
		let i = (I(e.object), e.object.value), a = (I(t.object), t.object.value);
		return i.localeCompare(a);
	});
}
function Be(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.subject.value, r = t.get(e);
		r ? r.push(n) : t.set(e, [n]);
	}
	return t;
}
function Ve(e) {
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
function He(t, n, r = null) {
	let i = [], a = _e(t, n), o = Ue(t), s = Object.entries(n).sort(([e], [t]) => e.localeCompare(t));
	for (let [t, n] of s) t !== "@vocab" && !t.startsWith("@") && !e[t] && a.has(t) && i.push(ve(t, n));
	s.length > 0 && i.push("\n");
	let c = Array.from(t.keys()).sort(), l = r, u = l ? [l, ...c.filter((e) => e !== l)] : c;
	for (let e of u) {
		let r = t.get(e);
		if (!r) continue;
		let a = Fe(e, n), { types: s, literals: c, objects: l } = xe(r), u = o.has(e), d = u ? o.get(e) : Ie(e, n), f = s.length > 0 ? s.map((e) => "." + Fe(e.object.value, n)).sort().join(" ") : "";
		u && (f += (f ? " " : "") + "label");
		let p = f ? " " + f : "";
		i.push(`# ${d} {=${a}${p}}\n\n`);
		let m = u ? o.get(e) : null;
		B(c).forEach((e) => {
			e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.value === m || i.push(ye(e, n));
		}), B(l).forEach((e) => {
			i.push(be(e, n, o));
		}), i.push("\n");
	}
	return { text: i.join("") };
}
function Ue(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.values()) for (let e of n) e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.termType === "Literal" && t.set(e.subject.value, e.object.value);
	return t;
}
//#endregion
//#region src/render.js
function We(e, t = {}) {
	let n = V({
		text: e,
		context: t.context || {}
	}), r = Ge(n, t, e), i = {
		html: dt(Ke(n.origin.blocks, r), r.ctx),
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
function Ge(t, n, r) {
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
function Ke(e, t) {
	let n = Array.from(e.values()).sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0)), r = n.filter((e) => e.carrierType === "list");
	return n.filter((e) => e.carrierType !== "list").forEach((e) => {
		qe(e, t);
	}), r.length > 0 && at(r, t), t.output.join("");
}
function qe(e, t) {
	e.subject && e.subject !== "RESET" && (t.currentSubject = e.subject);
	let n = Je(e, t);
	switch (n && t.renderMap.set(e.id || ft(e), n), e.type || e.carrierType) {
		case "heading":
			Xe(e, n, t);
			break;
		case "para":
			Ze(e, n, t);
			break;
		case "list": break;
		case "quote":
			Qe(e, n, t);
			break;
		case "code":
			$e(e, n, t);
			break;
		default: et(e, n, t);
	}
}
function Je(e, t) {
	let n = [];
	if (!e.subject || e.subject === "RESET" || e.subject.startsWith("=#") || e.subject.startsWith("+")) return "";
	let r = h(e.subject, t.ctx);
	if (n.push(`about="${F(r)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => h(typeof e == "string" ? e : e.iri, t.ctx)).join(" ");
		n.push(`typeof="${F(r)}"`);
	}
	let i = [];
	if (e.predicates && e.predicates.length > 0 && i.push(...e.predicates), e.carriers && e.carriers.length > 0) for (let t of e.carriers) t.predicates && t.predicates.length > 0 && i.push(...t.predicates);
	if (i.length > 0) {
		let { literalProps: e, objectProps: r, reverseProps: a } = Ye(i, t.ctx);
		e.length > 0 && n.push(`property="${F(e.join(" "))}"`), r.length > 0 && n.push(`rel="${F(r.join(" "))}"`), a.length > 0 && n.push(`rev="${F(a.join(" "))}"`);
	}
	return n.length > 1 && t.renderedRDFaCount++, n.length > 0 ? ` ${n.join(" ")}` : "";
}
function Ye(e, t) {
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
function Xe(e, t, n) {
	let r = `h${e.text && e.text.match(/^#+/)?.[0]?.length || 1}`, i = fe(n.sourceText, e.range);
	i = i.replace(/\s*\{[^}]+\}\s*$/g, "").trim(), n.output.push(`<${r}${t}>${F(i)}</${r}>`);
}
function Ze(e, t, n) {
	let r = Z(e, n);
	n.output.push(`<p${t}>${r}</p>`);
}
function Qe(e, t, n) {
	let r = Z(e, n);
	n.output.push(`<blockquote${t}>${r}</blockquote>`);
}
function $e(e, t, n) {
	let r = e.info || "", i = e.text || "";
	n.output.push(`<pre><code${t}${r ? ` class="language-${F(r)}"` : ""}>${F(i)}</code></pre>`);
}
function et(e, t, n) {
	let r = Z(e, n);
	n.output.push(`<div${t}>${r}</div>`);
}
function Z(e, t) {
	if (!e.carriers || e.carriers.length === 0) return F(tt(t.sourceText, e.range));
	let n = nt(e);
	return rt(tt(t.sourceText, e.range), n, t);
}
function tt(e, t) {
	if (!t || !e) return "";
	let n = e.substring(t[0], t[1]);
	return n = n.replace(/\s*\{[^}]*\}\s*$/gm, ""), n = n.replace(/\{[^}]*\}/g, ""), n = n.replace(/\s+/g, " ").trim(), n = n.replace(/\]$/, ""), n;
}
function nt(e) {
	let t = [];
	if (!e.carriers) return t;
	for (let n of e.carriers) !n.text || !n.range || t.push({
		pos: n.range[0] - e.range[0],
		carrier: n,
		length: n.text.length
	});
	return t.sort((e, t) => e.pos - t.pos);
}
function rt(e, t, n) {
	if (t.length === 0) return F(e);
	let r = "", i = 0;
	for (let a of t) a.pos > i && (r += F(e.substring(i, a.pos))), r += it(a.carrier, n), i = a.pos + a.length;
	return i < e.length && (r += F(e.substring(i))), r;
}
function it(e, t) {
	let n = [], r = e.subject || t.currentSubject;
	if (!r || r === "RESET" || r.startsWith("=#") || r.startsWith("+")) return F(e.text || "");
	let i = g(h(r, t.ctx), t.ctx);
	if (n.push(`about="${F(i)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => g(h(typeof e == "string" ? e : e.iri, t.ctx), t.ctx)).join(" ");
		n.push(`typeof="${F(r)}"`);
	}
	if (e.predicates && e.predicates.length > 0) {
		let { literalProps: r, objectProps: i, reverseProps: a } = Ye(e.predicates, t.ctx);
		if (r.length > 0) {
			let e = r.map((e) => g(e, t.ctx)).join(" ");
			n.push(`property="${F(e)}"`);
		}
		if (i.length > 0) {
			let e = i.map((e) => g(e, t.ctx)).join(" ");
			n.push(`rel="${F(e)}"`);
		}
		if (a.length > 0) {
			let e = a.map((e) => g(e, t.ctx)).join(" ");
			n.push(`rev="${F(e)}"`);
		}
	}
	let a = n.length > 0 ? ` ${n.join(" ")}` : "";
	switch (e.type) {
		case "emphasis": return `<em${a}>${F(e.text || "")}</em>`;
		case "strong": return `<strong${a}>${F(e.text || "")}</strong>`;
		case "code": return `<code${a}>${F(e.text || "")}</code>`;
		case "link": return `<a href="${F(e.url || "")}"${a}>${F(e.text || "")}</a>`;
		default: return `<span${a}>${F(e.text || "")}</span>`;
	}
}
function at(e, t) {
	ot(e, t.sourceText).forEach((e) => {
		st(e, t);
	});
}
function ot(e, t) {
	let n = [], r = null, i = e.sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0));
	for (let e of i) de(e, t) === 0 ? (r && n.push(r), r = {
		contextName: "Items",
		blocks: [e]
	}) : r ? r.blocks.push(e) : r = {
		contextName: "Items",
		blocks: [e]
	};
	return r && n.push(r), n;
}
function st(e, t) {
	t.output.push("<ul>");
	for (let n of e.blocks) ct(n, t);
	t.output.push("</ul>");
}
function ct(e, t) {
	let n = Je(e, t), r = Z(e, t);
	t.output.push(`<li${n}>${r}</li>`);
}
function lt(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) n !== "@vocab" && t.push(`${n}: ${r}`);
	return t.length > 0 ? ` prefix="${t.join(" ")}"` : "";
}
function ut(e) {
	return e["@vocab"] ? ` vocab="${e["@vocab"]}"` : "";
}
function dt(e, t) {
	return `<div${lt(t)}${ut(t)}>${e}</div>`;
}
function ft(e) {
	return pt(`${e.type || e.carrierType}|${e.subject || ""}|${e.text || ""}`);
}
function pt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return t.toString(36);
}
//#endregion
//#region src/highlight.js
var Q = /* @__PURE__ */ new Map();
function $(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return Math.abs(t);
}
function mt(e) {
	if (Q.has(e)) return Q.get(e);
	let t = $(e), n = `hsl(${t % 360}, ${15 + t % 10}%, ${45 + t % 10}%)`;
	return Q.set(e, n), n;
}
//#endregion
export { e as DEFAULT_CONTEXT, d as DataFactory, h as expandIRI, Le as generate, Re as generateNode, mt as getIRIColor, p as hash, $ as hashIRI, f as locate, Pe as merge, V as parse, _ as parseSemanticBlock, We as render, g as shortenIRI };
