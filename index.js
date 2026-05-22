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
		t ? (this.value = t[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"), t[5] ? (this.language = t[5], this.datatype = new d(r)) : t[3] ? this.datatype = new d(t[3]) : this.datatype = new d(i)) : (this.value = e.replace(/^"|"$/g, ""), this.datatype = new d(i));
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
	let n = ee(e);
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
function ee(e) {
	return e ? T(e.subject, e.predicate, e.object) : null;
}
function te(e, t, n, r, i) {
	return t ? i.literal(e, i.namedNode(x(t, r))) : n ? i.literal(e, n) : i.literal(e);
}
//#endregion
//#region src/tokenizers.js
function ne(e) {
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
function re(e) {
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
function ie(e) {
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
function ae(e) {
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
function E(e) {
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
function se(e, t, n = "[", r = "]") {
	let i = 1, a = t + 1;
	for (; a < e.length && i > 0;) e[a] === n && i++, e[a] === r && i--, i > 0 && a++;
	return i === 0 ? a : null;
}
function D(e, t) {
	let n = t;
	for (; n < e.length && (e[n] === " " || e[n] === "	");) n++;
	if (n >= e.length || e[n] !== "{") return null;
	let r = e.indexOf("}", n + 1);
	return r === -1 ? null : {
		attrs: e.slice(n + 1, r),
		endPos: r + 1
	};
}
function ce(e, t) {
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
function le(e, t) {
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
			let t = e.slice(o, s), a = s + r, c = D(e, a), l = c ? c.endPos : a;
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
function ue(e, t) {
	if (e[t] !== "`") return null;
	let n = 1;
	for (; t + n < e.length && e[t + n] === "`";) n++;
	if (n > 2) return null;
	let r = "`".repeat(n), i = t + n, a = i;
	for (; a < e.length;) {
		if (e.slice(a, a + n) === r) {
			let t = e.slice(i, a), r = a + n, o = D(e, r), s = o ? o.endPos : r;
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
function de(e, t) {
	if (e[t] !== "[") return null;
	let n = se(e, t, "[", "]");
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
	let o = D(e, i), s = o ? o.endPos : i;
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
function O(e, t = 0) {
	let n = [], r = e.length, i = 0;
	for (; i < r;) {
		let r = e[i], a = null;
		switch (r) {
			case "<":
				if (a = ce(e, i), a) {
					let t = D(e, a.endPos);
					t && (a.attrs = t.attrs, a.endPos = t.endPos), a.type = "link", a.text = a.url;
				}
				break;
			case "[":
				a = de(e, i);
				break;
			case "*":
			case "_":
				a = le(e, i);
				break;
			case "`":
				a = ue(e, i);
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
var k = /* @__PURE__ */ new Map();
function fe(e) {
	return k.has(e) || k.set(e, RegExp(`^(${e}{3,})`)), k.get(e);
}
function pe(e, t, n, r, i) {
	let a = r + (r < e.length && e[r] === " " ? 1 : e.slice(r).match(/^\s+/)?.[0]?.length || 0);
	return {
		valueRange: [n + a, n + a + i],
		attrsRange: me(e, t, n)
	};
}
function me(e, t, n) {
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
function he(e, t, n, r, i) {
	let a = i[4] || null, o = pe(t, a, n, i[1].length + (i[2] ? i[2].length : 0), i[3].length);
	return A(e, [n, r - 1], i[3].trim(), a, o.attrsRange, o.valueRange, { indent: i[1].length });
}
var ge = {}, _e = Object.freeze({
	predicates: [],
	types: [],
	subject: null
});
function j(e) {
	if (!e) return _e;
	let t = ge[e];
	return t || (t = Object.freeze(w(e)), ge[e] = t), t;
}
function ve(e, t) {
	if (!e.range || !t) return 0;
	let n = t.substring(e.range.start, e.range.end).match(/^(\s*)/), r = n ? n[1].length : 0;
	return Math.floor(r / 2);
}
function ye(e, t, n = null) {
	if (!t || !e) return "";
	let r = e.substring(t[0], t[1]);
	return n && (r = r.substring(0, n[0] - t[0]) + r.substring(n[1] - t[0])), r.trim();
}
function be(e) {
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
function xe(e, t, n, r = null) {
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
function Se(e, t, n) {
	if (!t) return null;
	let r = t.value, i = r.indexOf("#"), a = i > -1 ? r.slice(0, i) : r;
	return n.namedNode(a + "#" + e);
}
function Ce(e, t) {
	return e.subject ? e.subject === "RESET" ? (t.currentSubject = null, null) : e.subject.startsWith("=#") ? Se(e.subject.substring(2), t.currentSubject, t.df) : t.df.namedNode(x(e.subject, t.ctx)) : null;
}
function we(e, t) {
	return e.object ? e.object.startsWith("#") ? Se(e.object.substring(1), t.currentSubject, t.df) : t.df.namedNode(x(e.object, t.ctx)) : null;
}
function M(e) {
	return e ? e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : "";
}
function N(e) {
	return e?.termType === "Literal";
}
function Te(e) {
	return e?.termType === "NamedNode";
}
function Ee(e) {
	return e?.value === n;
}
function P(e, t) {
	if (!e) return null;
	let n = S(e, t);
	return n.includes(":") ? n.split(":")[0] : null;
}
function De(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of e.values()) for (let e of r) {
		let r = P(e.subject.value, t);
		r && n.add(r);
		let i = P(e.predicate.value, t);
		if (i && n.add(i), Te(e.object)) {
			let r = P(e.object.value, t);
			r && n.add(r);
		}
		if (e.object.datatype && e.object.datatype.value) {
			let r = P(e.object.datatype.value, t);
			r && n.add(r);
		}
	}
	return n;
}
function F(e, t, n, r, i = []) {
	let a = r(e, t);
	t.currentBlock = a, t.blockStack.push(a.id), i.forEach((n) => n(e, t)), n(e, t, e.type), t.blockStack.pop(), t.currentBlock = t.blockStack.length > 0 ? t.origin.blocks.get(t.blockStack[t.blockStack.length - 1]) : null;
}
function I(e) {
	return e.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
}
var Oe = (e, t) => `[${e}] <${t}>\n`;
function ke(e, t) {
	let n = S(e.predicate.value, t);
	e.object.language ? n += ` @${e.object.language}` : e.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" && (n += ` ^^${S(e.object.datatype.value, t)}`);
	let r = e.object.value || e.object, i = typeof r == "string" ? r : String(r), a = e.object.datatype?.value || "";
	return i.includes("\n") ? `~~~ {${n}}\n${i}\n~~~\n\n` : a.includes("integer") || a.includes("decimal") || a.includes("double") || a.includes("float") ? `\`${i}\` {${n}}\n` : a.includes("date") || a.includes("time") ? `*${i}* {${n}}\n` : a.includes("boolean") ? `**${i}** {${n}}\n` : `[${i}] {${n}}\n`;
}
var Ae = (e, n, r = null, i = null, a = null, o = !0, s = null) => {
	let c = S(e.object.value, n), l = S(e.predicate.value, n), u = r && r.has(e.object.value) ? r.get(e.object.value) : c, d = "";
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
function je(e) {
	let t = [], n = [], r = [];
	for (let i of e) Ee(i.predicate) ? t.push(i) : N(i.object) ? n.push(i) : Te(i.object) && r.push(i);
	return {
		types: t,
		literals: n,
		objects: r
	};
}
//#endregion
//#region src/parse.js
function L(t, n = {}) {
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
			documentStructure: []
		},
		currentSubject: null,
		primarySubject: null,
		primaryType: null,
		primaryLabel: null,
		tokens: null,
		currentTokenIndex: -1,
		statements: [],
		statementCandidates: /* @__PURE__ */ new Map(),
		currentBlock: null,
		blockStack: []
	}, s = Me(i);
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
		Ue[t.type]?.(t, o);
	}
	let c = /* @__PURE__ */ new Set();
	for (let e of o.quads) c.add(T(e.subject, e.predicate, e.object));
	let l = [];
	for (let e of o.removeSet) {
		let t = T(e.subject, e.predicate, e.object);
		c.has(t) || l.push(e);
	}
	let u = {
		subject: o.primarySubject,
		type: o.primaryType,
		label: o.primaryLabel,
		comment: o.primaryComment
	};
	return {
		quads: o.quads,
		remove: l,
		statements: o.statements,
		origin: o.origin,
		context: o.ctx,
		primarySubject: o.primarySubject,
		primary: u,
		md: s.md
	};
}
function R(e) {
	return e.type === "code" ? [] : e._carriers || (e._carriers = Ne(e.text, e.range[0]));
}
function Me(e) {
	let t = [], n = [], r = e.split("\n"), i = 0, a = null, o = [
		{
			type: "fence",
			test: (e) => ne(e.trim()),
			process: s
		},
		{
			type: "content",
			test: () => a,
			process: (e) => a.content.push(e)
		},
		{
			type: "prefix",
			test: (e) => re(e),
			process: c
		},
		{
			type: "standalone",
			test: (e) => E(e),
			process: p
		},
		{
			type: "heading",
			test: (e) => ie(e),
			process: l
		},
		{
			type: "list",
			test: (e) => ae(e),
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
			let i = a.fence[0], s = i.repeat(a.fence.length), c = o.match(fe(i));
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
			let t = ne(o);
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
		let i = re(e);
		return t.push({
			type: "prefix",
			prefix: i.prefix,
			iri: i.iri
		}), !0;
	}
	function l(e, r, i) {
		let a = ie(e), o = a.attrs, s = a.depth, c = pe(e, o, r, s, a.content.length);
		t.push(A("heading", [r, i - 1], a.content, o, c.attrsRange, c.valueRange, { depth: a.depth }));
		let l = `${"#".repeat(a.depth)} ${a.content}`;
		return n.push(l), !0;
	}
	function u(e, r, i) {
		let a = ae(e), o = " ".repeat(a.indent), s = [
			e,
			o,
			a.marker,
			a.content,
			a.attrs
		];
		t.push(he("list", e, r, i, s));
		let c = `${o}${a.marker} ${a.content}`;
		return n.push(c), !0;
	}
	function d(e, r, i) {
		let a = oe(e), o = a.attrs, s = e.startsWith("> ") ? 2 : e.indexOf(">") + 1, c = s + a.content.length;
		t.push(A("blockquote", [r, i - 1], a.content, o, me(e, o, r), [r + s, r + c]));
		let l = `> ${a.content}`;
		return n.push(l), !0;
	}
	function f(e, r, i) {
		t.push(A("para", [r, i - 1], e.trim()));
		let a = e, o = O(a, 0);
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
function Ne(e, t = 0) {
	return O(e, t);
}
function z(e, t) {
	let n = e._blockId || y(`${e.type}:${e.range?.[0]}:${e.range?.[1]}`);
	e._blockId = n;
	let r = R(e), i = be(e), a = {
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
			let n = j(e.attrs);
			t.sem = n, t.predicates = n.predicates || [], t.subject = n.subject, t.types = n.types || [];
		}
		a.carriers.push(t);
	}
	return t.origin.blocks.set(n, a), t.origin.documentStructure.push(a), a;
}
function Pe(e, t, n, r) {
	if (t.subject && t.subject !== "RESET") {
		let n = Ce(t, r);
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
			let e = j(n.attrs);
			t.sem = e, t.predicates = e.predicates || [], t.subject = e.subject, t.types = e.types || [];
		}
		e.carriers.push(t);
	}
}
function Fe(e, t, n, r = {}) {
	let { preserveGlobalSubject: i = !1, implicitSubject: a = null } = r;
	if (t.subject === "RESET") {
		n.currentSubject = null;
		return;
	}
	let o = n.currentSubject, s = Ce(t, n), c = we(t, n);
	s && !n.primarySubject && !t.subject.startsWith("=#") && (n.primarySubject = s.value), s && !i && !a && (n.currentSubject = s);
	let l = i ? s || o : a || n.currentSubject;
	if (!l) return;
	let u = Ie(l.value, t.types, t.predicates, e.range, e.attrsRange || null, e.valueRange || null, e.type || null, n.ctx, e.text), d = te(e.text, t.datatype, t.language, n.ctx, n.df), f = e.url ? n.df.namedNode(x(e.url, n.ctx)) : null, p = s || f;
	n.currentBlock && Pe(n.currentBlock, t, e, n), ze(t, s, c, f, l, u, n, e), Ve(t, s, o, c, p, l, d, u, n, e);
}
function Ie(e, t, n, r, i, a, o, s, c) {
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
function B(e, t, n, r, i, a, o, s, c, l = null, u = null, d = null, f = null) {
	if (!a || !o || !s) return;
	let p = c.quad(a, o, s);
	if (l?.remove) {
		let i = T(p.subject, p.predicate, p.object);
		if (t.has(i)) {
			t.delete(i);
			let n = e.findIndex((e) => e.subject.value === p.subject.value && e.predicate.value === p.predicate.value && e.object.value === p.object.value);
			n !== -1 && e.splice(n, 1), r.delete(i);
		} else n.add(p);
	} else {
		let n = T(p.subject, p.predicate, p.object);
		t.set(n, p), e.push(p), f && (!f.primaryType && o.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && (f.primaryType = s.value), !f.primaryLabel && o.value === "http://www.w3.org/2000/01/rdf-schema#label" && s.termType === "Literal" && (f.primaryLabel = s.value), !f.primaryComment && o.value === "http://www.w3.org/2000/01/rdf-schema#comment" && s.termType === "Literal" && (f.primaryComment = s.value)), Le(p, c, l, u, d);
		let m = xe(i, a, o, l);
		r.set(n, m), f.currentBlock && i.id === f.currentBlock.id && (f.currentBlock.quadKeys || (f.currentBlock.quadKeys = []), f.currentBlock.quadKeys.push(n));
	}
}
function Le(e, t, n, r = null, i = null) {
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
var Re = (e, t, n, r, i = null) => {
	let a = x(e, n.ctx), o = typeof i == "object" ? i : {
		entryIndex: i,
		remove: !1
	};
	B(n.quads, n.quadBuffer, n.removeSet, n.origin.quadIndex, r, t, n.df.namedNode(x("rdf:type", n.ctx)), n.df.namedNode(a), n.df, {
		kind: "type",
		token: `.${e}`,
		expandedType: a,
		entryIndex: o.entryIndex,
		remove: o.remove
	}, n.statements, n.statementCandidates, n);
};
function ze(e, t, n, r, i, a, o, s) {
	e.types.forEach((e) => {
		Re(typeof e == "string" ? e : e.iri, t || n || r || i, o, a, typeof e == "string" ? {
			entryIndex: null,
			remove: !1
		} : e);
	});
}
var Be = (e, t, n, r, i, a, o, s) => {
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
function Ve(e, t, n, r, i, a, o, s, c, l) {
	e.predicates.forEach((e) => {
		let u = Be(e, l, t, n, r, i, a, o);
		if (u) {
			let t = c.df.namedNode(x(e.iri, c.ctx));
			B(c.quads, c.quadBuffer, c.removeSet, c.origin.quadIndex, s, u.subject, t, u.object, c.df, {
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
function V(e, t, n, r = {}) {
	Fe(e, t, n, r);
}
function H(e, t, n) {
	if (e.attrs) {
		let r = j(e.attrs);
		V({
			type: n,
			text: e.text,
			range: e.range,
			attrsRange: e.attrsRange || null,
			valueRange: e.valueRange || null
		}, r, t);
	}
	R(e).forEach((e) => {
		e.attrs && V(e, j(e.attrs), t);
	});
}
function He(e, t) {
	let n = E(e.text);
	if (!n) return;
	let r = j(`{=${n.content}}`), i = e.range[0] + e.text.indexOf("{=");
	V({
		type: "standalone",
		text: "",
		range: e.range,
		attrsRange: [i, i + (n.content ? n.content.length : 0)],
		valueRange: null
	}, r, t);
}
var Ue = {
	heading: (e, t) => F(e, t, H, z),
	code: (e, t) => F(e, t, H, z),
	blockquote: (e, t) => F(e, t, H, z),
	para: (e, t) => F(e, t, H, z, [He]),
	list: (e, t) => F(e, t, H, z),
	standalone: (e, t) => He(e, t)
};
//#endregion
//#region src/merge.js
function U(e) {
	return ee(e);
}
function We(e, t, n) {
	return typeof e == "string" ? L({
		text: e,
		...t,
		context: {
			...n,
			...t.context
		}
	}) : e;
}
function Ge(t, n = {}) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = [], o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Map(), l = [], u = [];
	for (let d = 0; d < t.length; d++) {
		let f = t[d], p = We(f, n, {
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
			let t = U(e);
			r.set(t, e);
			let n = p.origin.quadIndex.get(t);
			o.set(t, {
				...n || {},
				documentIndex: d,
				polarity: "+"
			});
		}
		for (let e of p.remove) {
			let t = U(e);
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
	}, h = new Set(d.map(U)), g = new Set(f.map(U));
	return {
		quads: d.filter((e) => !g.has(U(e))),
		remove: f.filter((e) => !h.has(U(e))),
		statements: s,
		origin: p,
		context: m,
		primarySubjects: u,
		primary: l
	};
}
//#endregion
//#region src/generate.js
var W = /* @__PURE__ */ new Map(), Ke = 1e3;
function G(e, t) {
	let n = `${e}|${JSON.stringify(t)}`;
	if (W.has(n)) return W.get(n);
	let r = S(e, t);
	return W.size >= Ke && Array.from(W.keys()).slice(0, Math.floor(Ke / 2)).forEach((e) => W.delete(e)), W.set(n, r), r;
}
function qe(e, t = {}) {
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
function Je({ quads: t, context: n = {}, primarySubject: r = null, compactInline: i = !0 }) {
	let a = Object.assign({}, e, n), { subjectGroups: o, reverseIndex: s } = Ze(Xe(t)), { text: c, compactStats: l } = $e(o, a, r, r ? s : null, i);
	return {
		text: c,
		context: a,
		compactStats: l
	};
}
function Ye({ quads: t, focusIRI: n, context: r = {}, compactInline: i = !0 }) {
	if (!t?.length || !n) return {
		text: "",
		context: Object.assign({}, e, r),
		compactStats: null
	};
	let a = Object.assign({}, e, r), { nodeGroups: o, reverseIndex: s } = Qe(Xe(t));
	if (!o.has(n)) return {
		text: "",
		context: a,
		compactStats: null
	};
	let { text: c, compactStats: l } = $e(o, a, n, s, i);
	return {
		text: c,
		context: a,
		compactStats: l
	};
}
function Xe(e) {
	return !e || e.length === 0 ? [] : e.map((e) => e.subject.termType && e.predicate.termType && e.object.termType ? e : {
		subject: _.fromTerm(e.subject),
		predicate: _.fromTerm(e.predicate),
		object: _.fromTerm(e.object)
	}).sort((e, t) => {
		let n = e.subject.value.localeCompare(t.subject.value);
		if (n !== 0) return n;
		let r = e.predicate.value.localeCompare(t.predicate.value);
		if (r !== 0) return r;
		let i = (N(e.object), e.object.value), a = (N(t.object), t.object.value);
		return i.localeCompare(a);
	});
}
function Ze(e) {
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
function Qe(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e) => {
		let n = t.get(e);
		if (n) return n;
		let r = [];
		return t.set(e, r), r;
	};
	for (let t of e) {
		let { subject: e, predicate: i, object: a } = t;
		if (r(e.value).push(t), a.termType === "NamedNode") {
			r(a.value).push(t);
			let e = a.value, i = n.get(e);
			i ? i.push(t) : n.set(e, [t]);
		}
		r(i.value).push(t), i.value === RDFS_TYPE && a.termType === "NamedNode" && r(a.value).push(t), a.termType === "Literal" && a.datatype && r(a.datatype.value || a.datatype).push(t);
	}
	return {
		nodeGroups: t,
		reverseIndex: n
	};
}
function $e(n, r, i = null, a = null, o = !0) {
	let s = [], c = De(n, r), l = et(n), u = {
		compactedSubjects: 0,
		skippedHeadings: 0,
		inlineAnnotations: 0
	}, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
	for (let [e, t] of n.entries()) f.set(e, je(t));
	let p = Object.entries(r).sort(([e], [t]) => e.localeCompare(t));
	for (let [t, n] of p) t !== "@vocab" && !t.startsWith("@") && !e[t] && c.has(t) && s.push(Oe(t, n));
	p.length > 0 && s.push("\n");
	let m = Array.from(n.keys()).sort(), h = i, g = h ? [h, ...m.filter((e) => e !== h)] : m;
	for (let e of g) {
		let i = n.get(e);
		if (!i) continue;
		if (i.every((e) => d.has(e))) {
			u.skippedHeadings++, u.compactedSubjects++;
			continue;
		}
		let { types: c, literals: p, objects: m } = f.get(e), g = G(e, r), _ = l.has(e), v = _ ? l.get(e) : qe(e, r), y = c.filter((e) => !d.has(e)), b = y.length > 0 ? y.map((e) => "." + G(e.object.value, r)).sort().join(" ") : "", x = i.find((e) => e.predicate.value === t);
		_ && (!x || !d.has(x)) && (b += (b ? " " : "") + "label");
		let S = b ? " " + b : "";
		s.push(`# ${v} {=${g}${S}}\n`), c.forEach((e) => d.add(e)), x && d.add(x);
		let C = _ ? l.get(e) : null;
		if (I(p).forEach((e) => {
			e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.value === C || s.push(ke(e, r));
		}), I(m).forEach((e) => {
			d.has(e) || s.push(Ae(e, r, l, f, d, o, u));
		}), e === h && a && a.has(e)) {
			let i = a.get(e);
			i.sort((e, t) => e.predicate.value.localeCompare(t.predicate.value));
			for (let e of i) {
				d.add(e);
				let i = n.get(e.subject.value), a = l.has(e.subject.value) ? l.get(e.subject.value) : qe(e.subject.value, r), c = G(e.subject.value, r), p = G(e.predicate.value, r), m = "";
				if (o && i) {
					let { types: n } = f.get(e.subject.value) || { types: [] }, a = l.has(e.subject.value), o = n.length > 0 ? n.map((e) => "." + G(e.object.value, r)).sort().join(" ") : "", s = a ? "label" : "";
					if ((o || s) && (m = " " + [o, s].filter(Boolean).join(" "), u.inlineAnnotations++, n.forEach((e) => d.add(e)), a)) {
						let e = i.find((e) => e.predicate.value === t);
						e && d.add(e);
					}
					i.every((e) => d.has(e)) && (u.skippedHeadings++, u.compactedSubjects++);
				}
				s.push(`[${a}] {+${c} !${p}${m}}\n`);
			}
		}
		s.push("\n");
	}
	return {
		text: s.join(""),
		compactStats: u
	};
}
function et(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.values()) for (let e of n) e.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && e.object.termType === "Literal" && t.set(e.subject.value, e.object.value);
	return t;
}
//#endregion
//#region src/render.js
function tt(e, t = {}) {
	let n = L({
		text: e,
		context: t.context || {}
	}), r = nt(n, t, e), i = {
		html: St(rt(n.origin.blocks, r), r.ctx),
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
function nt(t, n, r) {
	return {
		ctx: t.context || {
			...e,
			...n.context || {}
		},
		df: n.dataFactory || _,
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
function rt(e, t) {
	let n = Array.from(e.values()).sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0)), r = n.filter((e) => e.carrierType === "list");
	return n.filter((e) => e.carrierType !== "list").forEach((e) => {
		it(e, t);
	}), r.length > 0 && gt(r, t), t.output.join("");
}
function it(e, t) {
	e.subject && e.subject !== "RESET" && (t.currentSubject = e.subject);
	let n = at(e, t);
	switch (n && t.renderMap.set(e.id || Ct(e), n), e.type || e.carrierType) {
		case "heading":
			st(e, n, t);
			break;
		case "para":
			ct(e, n, t);
			break;
		case "list": break;
		case "quote":
			lt(e, n, t);
			break;
		case "code":
			ut(e, n, t);
			break;
		default: dt(e, n, t);
	}
}
function at(e, t) {
	let n = [];
	if (!e.subject || e.subject === "RESET" || e.subject.startsWith("=#") || e.subject.startsWith("+")) return "";
	let r = x(e.subject, t.ctx);
	if (n.push(`about="${M(r)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => x(typeof e == "string" ? e : e.iri, t.ctx)).join(" ");
		n.push(`typeof="${M(r)}"`);
	}
	let i = [];
	if (e.predicates && e.predicates.length > 0 && i.push(...e.predicates), e.carriers && e.carriers.length > 0) for (let t of e.carriers) t.predicates && t.predicates.length > 0 && i.push(...t.predicates);
	if (i.length > 0) {
		let { literalProps: e, objectProps: r, reverseProps: a } = ot(i, t.ctx);
		e.length > 0 && n.push(`property="${M(e.join(" "))}"`), r.length > 0 && n.push(`rel="${M(r.join(" "))}"`), a.length > 0 && n.push(`rev="${M(a.join(" "))}"`);
	}
	return n.length > 1 && t.renderedRDFaCount++, n.length > 0 ? ` ${n.join(" ")}` : "";
}
function ot(e, t) {
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
function st(e, t, n) {
	let r = `h${e.text && e.text.match(/^#+/)?.[0]?.length || 1}`, i = ye(n.sourceText, e.range);
	i = i.replace(/\s*\{[^}]+\}\s*$/g, "").trim(), n.output.push(`<${r}${t}>${M(i)}</${r}>`);
}
function ct(e, t, n) {
	let r = K(e, n);
	n.output.push(`<p${t}>${r}</p>`);
}
function lt(e, t, n) {
	let r = K(e, n);
	n.output.push(`<blockquote${t}>${r}</blockquote>`);
}
function ut(e, t, n) {
	let r = e.info || "", i = e.text || "";
	n.output.push(`<pre><code${t}${r ? ` class="language-${M(r)}"` : ""}>${M(i)}</code></pre>`);
}
function dt(e, t, n) {
	let r = K(e, n);
	n.output.push(`<div${t}>${r}</div>`);
}
function K(e, t) {
	if (!e.carriers || e.carriers.length === 0) return M(ft(t.sourceText, e.range));
	let n = pt(e);
	return mt(ft(t.sourceText, e.range), n, t);
}
function ft(e, t) {
	if (!t || !e) return "";
	let n = e.substring(t[0], t[1]);
	return n = n.replace(/\s*\{[^}]*\}\s*$/gm, ""), n = n.replace(/\{[^}]*\}/g, ""), n = n.replace(/\s+/g, " ").trim(), n = n.replace(/\]$/, ""), n;
}
function pt(e) {
	let t = [];
	if (!e.carriers) return t;
	for (let n of e.carriers) !n.text || !n.range || t.push({
		pos: n.range[0] - e.range[0],
		carrier: n,
		length: n.text.length
	});
	return t.sort((e, t) => e.pos - t.pos);
}
function mt(e, t, n) {
	if (t.length === 0) return M(e);
	let r = "", i = 0;
	for (let a of t) a.pos > i && (r += M(e.substring(i, a.pos))), r += ht(a.carrier, n), i = a.pos + a.length;
	return i < e.length && (r += M(e.substring(i))), r;
}
function ht(e, t) {
	let n = [], r = e.subject || t.currentSubject;
	if (!r || r === "RESET" || r.startsWith("=#") || r.startsWith("+")) return M(e.text || "");
	let i = S(x(r, t.ctx), t.ctx);
	if (n.push(`about="${M(i)}"`), e.types && e.types.length > 0) {
		let r = e.types.map((e) => S(x(typeof e == "string" ? e : e.iri, t.ctx), t.ctx)).join(" ");
		n.push(`typeof="${M(r)}"`);
	}
	if (e.predicates && e.predicates.length > 0) {
		let { literalProps: r, objectProps: i, reverseProps: a } = ot(e.predicates, t.ctx);
		if (r.length > 0) {
			let e = r.map((e) => S(e, t.ctx)).join(" ");
			n.push(`property="${M(e)}"`);
		}
		if (i.length > 0) {
			let e = i.map((e) => S(e, t.ctx)).join(" ");
			n.push(`rel="${M(e)}"`);
		}
		if (a.length > 0) {
			let e = a.map((e) => S(e, t.ctx)).join(" ");
			n.push(`rev="${M(e)}"`);
		}
	}
	let a = n.length > 0 ? ` ${n.join(" ")}` : "";
	switch (e.type) {
		case "emphasis": return `<em${a}>${M(e.text || "")}</em>`;
		case "strong": return `<strong${a}>${M(e.text || "")}</strong>`;
		case "code": return `<code${a}>${M(e.text || "")}</code>`;
		case "link": return `<a href="${M(e.url || "")}"${a}>${M(e.text || "")}</a>`;
		default: return `<span${a}>${M(e.text || "")}</span>`;
	}
}
function gt(e, t) {
	_t(e, t.sourceText).forEach((e) => {
		vt(e, t);
	});
}
function _t(e, t) {
	let n = [], r = null, i = e.sort((e, t) => (e.range?.start || 0) - (t.range?.start || 0));
	for (let e of i) ve(e, t) === 0 ? (r && n.push(r), r = {
		contextName: "Items",
		blocks: [e]
	}) : r ? r.blocks.push(e) : r = {
		contextName: "Items",
		blocks: [e]
	};
	return r && n.push(r), n;
}
function vt(e, t) {
	t.output.push("<ul>");
	for (let n of e.blocks) yt(n, t);
	t.output.push("</ul>");
}
function yt(e, t) {
	let n = at(e, t), r = K(e, t);
	t.output.push(`<li${n}>${r}</li>`);
}
function bt(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) n !== "@vocab" && t.push(`${n}: ${r}`);
	return t.length > 0 ? ` prefix="${t.join(" ")}"` : "";
}
function xt(e) {
	return e["@vocab"] ? ` vocab="${e["@vocab"]}"` : "";
}
function St(e, t) {
	return `<div${bt(t)}${xt(t)}>${e}</div>`;
}
function Ct(e) {
	return wt(`${e.type || e.carrierType}|${e.subject || ""}|${e.text || ""}`);
}
function wt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return t.toString(36);
}
//#endregion
//#region src/highlight.js
function q(e) {
	return String(e).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
var J = {
	text: "#6b7280",
	marker: "#f97316",
	retraction: "#dc2626",
	value: "#eab308",
	annotation: "#4b5563"
};
function Y(e, t) {
	let n = t;
	for (; n < e.length && e[n] !== "\n" && e[n] !== "\r";) {
		if (e[n] === "{") return !0;
		n++;
	}
	return !1;
}
function Tt(e, t) {
	let n = e[t];
	if (n === "*" && t + 1 < e.length && e[t + 1] === "*") {
		let n = e.indexOf("**", t + 2);
		if (n !== -1) {
			let r = e.slice(t + 2, n), i = Y(e, n + 2) ? ` style="color: ${J.marker}"` : "";
			return {
				html: `<span${i}>**</span><strong>${q(r)}</strong><span${i}>**</span>`,
				nextIndex: n + 2
			};
		}
	}
	if (n === "_" && t + 1 < e.length && e[t + 1] === "_") {
		let n = e.indexOf("__", t + 2);
		if (n !== -1) {
			let r = e.slice(t + 2, n), i = Y(e, n + 2) ? ` style="color: ${J.marker}"` : "";
			return {
				html: `<span${i}>__</span><strong>${q(r)}</strong><span${i}>__</span>`,
				nextIndex: n + 2
			};
		}
	}
	if (n === "*") {
		let n = e.indexOf("*", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = Y(e, n + 1) ? ` style="color: ${J.marker}"` : "";
			return {
				html: `<span${i}>*</span><em>${q(r)}</em><span${i}>*</span>`,
				nextIndex: n + 1
			};
		}
	}
	if (n === "_") {
		let n = e.indexOf("_", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = Y(e, n + 1) ? ` style="color: ${J.marker}"` : "";
			return {
				html: `<span${i}>_</span><em>${q(r)}</em><span${i}>_</span>`,
				nextIndex: n + 1
			};
		}
	}
	if (n === "`") {
		let n = e.indexOf("`", t + 1);
		if (n !== -1) {
			let r = e.slice(t + 1, n), i = Y(e, n + 1) ? ` style="color: ${J.marker}"` : "";
			return {
				html: `<span${i}>\`</span><code style="background-color:#7773">${q(r)}</code><span${i}>\`</span>`,
				nextIndex: n + 1
			};
		}
	}
	return null;
}
var X = /* @__PURE__ */ new Map();
function Z(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return Math.abs(t);
}
function Q(e) {
	if (X.has(e)) return X.get(e);
	let t = Z(e), n = `hsl(${t % 360}, ${15 + t % 10}%, ${45 + t % 10}%)`;
	return X.set(e, n), n;
}
function Et(t) {
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
	let r = t ? J.retraction : J.text, i = e.indexOf(":");
	if (i > 0) {
		let t = e.slice(0, i), r = e.slice(i + 1);
		if (n.has(t)) {
			let e = n.get(t), i = Q(e), a = e + r, o = Q(a);
			return `<span style="color: ${i}">${q(t)}</span><span style="color: ${J.marker}">:</span><span data-iri="${a}" style="color: ${o}">${q(r)}</span> `;
		}
	}
	return e.startsWith("http:") || e.startsWith("https:") || e.startsWith("tag:") || e.startsWith("urn:") ? `<span style="color: ${Q(e)}">${q(e)}</span> ` : `<span style="color: ${r}">${q(e)}</span> `;
}
function Dt(e, t) {
	let n = e.trim().split(/\s+/), r = "", i = !1;
	for (let e = 0; e < n.length; e++) {
		let a = n[e];
		if (!a) continue;
		if (a.startsWith("=") || a.startsWith("+")) {
			let e = a[0], n = a.slice(1);
			r += `<span style="color: ${J.marker}">${q(e)}</span>${$(n, !1, t)}`;
			continue;
		}
		if (a === "-") {
			i = !0, r += `<span style="color: ${J.retraction}">${q(a)}</span> `;
			continue;
		}
		if (a.startsWith("-") && a.length > 1) {
			r += `<span style="color: ${J.retraction}">${q(a)}</span> `;
			continue;
		}
		let o = i;
		if (i = !1, a.startsWith("?") || a.startsWith("!")) {
			let e = a[0], n = a.slice(1), i = o ? J.retraction : J.marker;
			r += `<span style="color: ${i}">${q(e)}</span>${$(n, o, t)}`;
			continue;
		}
		if (a.startsWith("^^")) {
			let e = a.slice(2), n = o ? J.retraction : J.marker;
			r += `<span style="color: ${n}">${q("^^")}</span>${$(e, o, t)}`;
			continue;
		}
		if (a.startsWith("@")) {
			let e = a.slice(1), n = o ? J.retraction : J.marker;
			r += `<span style="color: ${n}">${q("@")}</span>${$(e, o, t)}`;
			continue;
		}
		if (a.startsWith(".")) {
			let e = a.slice(1), n = o ? J.retraction : J.marker;
			r += `<span style="color: ${n}">${q(".")}</span>${$(e, o, t)}`;
			continue;
		}
		r += $(a, o, t);
	}
	return r.trim();
}
function Ot(e) {
	let t = Et(e), n = "", r = 0;
	for (; r < e.length;) {
		let i = e[r];
		if (i === "{") {
			let a = e.indexOf("}", r);
			if (a === -1) {
				n += q(i), r++;
				continue;
			}
			let o = Dt(e.slice(r + 1, a), t);
			n += `<span style="color: ${J.annotation}; opacity: 0.75">{</span>`, n += o, n += `<span style="color: ${J.annotation}; opacity: 0.75">}</span>`, r = a + 1;
			continue;
		}
		if (i === "[") {
			let a = e.indexOf("]", r);
			if (a === -1) {
				n += q(i), r++;
				continue;
			}
			let o = e.slice(r + 1, a), s = a + 1;
			for (; s < e.length && /\s/.test(e[s]);) s++;
			if (s < e.length && e[s] === "<") {
				let i = e.indexOf(">", s);
				if (i !== -1) {
					let a = e.slice(s + 1, i), c = t.has(o) ? Q(t.get(o)) : J.text;
					n += `<span style="color: ${J.annotation}; opacity: 0.75">[</span><span style="color: ${c}">${q(o)}</span><span style="color: ${J.annotation}; opacity: 0.75">]</span> <span style="color: ${J.text}; opacity: 0.6">&lt;${q(a)}&gt;</span>`, r = i + 1;
					continue;
				}
			}
			let c = e.slice(r + 1, a), l = Y(e, a + 1) ? J.marker : J.value, u = q(c);
			n += `<span style="color: ${l}; opacity: 0.85">[</span><span style=" opacity: 1.0">${u}</span><span style="color: ${l}; opacity: 0.85">]</span>`, r = a + 1;
			continue;
		}
		if (i === "*" || i === "_" || i === "`") {
			let t = Tt(e, r);
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
					l += q(n);
					let r = Dt(c.slice(d + 1, e), t);
					l += `<span style="color: ${J.annotation}; opacity: 0.75">{</span>` + r + `<span style="color: ${J.annotation}; opacity: 0.75">}</span>`, u = e + 1, d = c.indexOf("{", u);
				}
				l += q(c.slice(u));
				let f = c.includes("{") && c.includes("}"), p = `h${i}`, m = "#".repeat(i), h = f ? `color: ${J.marker}; opacity: 0.8` : "";
				n += `<${p} style="margin: 0; font-weight: 600;"><span style="${h}">${m}</span> ${l}</${p}>`, r = s;
				continue;
			}
		}
		if (i === "-" || i === "*") {
			let t = r > 0 ? e[r - 1] : "\n";
			if ((t === "\n" || t === "\r" || t === " " || t === "	") && e[r + 1] === " ") {
				let t = Y(e, r + 2) ? `color: ${J.marker}; opacity: 0.85` : "";
				n += `<span style="${t}">${q(i)}</span>`, r++;
				continue;
			}
		}
		if (i === ">") {
			let t = r > 0 ? e[r - 1] : "\n";
			if ((t === "\n" || t === "\r" || t === " " || t === "	") && e[r + 1] === " ") {
				let t = Y(e, r + 2) ? `color: ${J.marker}; opacity: 0.85` : "";
				n += `<span style="${t}">${q(i)}</span>`, r++;
				continue;
			}
		}
		n += q(i), r++;
	}
	return n;
}
//#endregion
//#region src/index.js
function kt({ text: e, quad: t, value: n, origin: r }) {
	let i = v(t, r?.quadIndex ? r : L({ text: e }).origin);
	return !i || !i.valueRange ? e : e.substring(0, i.valueRange.start) + n + e.substring(i.valueRange.end);
}
//#endregion
export { e as DEFAULT_CONTEXT, _ as DataFactory, x as expandIRI, Je as generate, Ye as generateNode, Q as getIRIColor, y as hash, Z as hashIRI, Ot as highlightMDLD, v as locate, Ge as merge, L as parse, w as parseSemanticBlock, tt as render, S as shortenIRI, kt as updateValue };
