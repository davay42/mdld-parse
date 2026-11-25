// src/constants.js
/**
* Shared utilities for MD-LD Parser and Renderer
* Ensures DRY code and consistent CommonMark processing
*/
var DEFAULT_CONTEXT = {
	"@vocab": "http://www.w3.org/2000/01/rdf-schema#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	sh: "http://www.w3.org/ns/shacl#",
	prov: "http://www.w3.org/ns/prov#"
};
var RDF_TYPE$2 = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
var XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
var XSD_BOOLEAN = "http://www.w3.org/2001/XMLSchema#boolean";
var XSD_INTEGER = "http://www.w3.org/2001/XMLSchema#integer";
var XSD_DOUBLE = "http://www.w3.org/2001/XMLSchema#double";
var URL_REGEX = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/;
// src/utils.js
var Term = class {
	constructor(id) {
		this.id = id;
	}
	equals(other) {
		return !!other && this.termType === other.termType && this.value === other.value;
	}
};
var NamedNode = class extends Term {
	constructor(iri) {
		super(iri);
		this.termType = "NamedNode";
		this.value = iri;
	}
};
var Literal = class extends Term {
	constructor(id) {
		super(id);
		this.termType = "Literal";
		this.value = "";
		this.language = "";
		this.datatype = null;
		const dtMatch = id.match(/^"([^"\\]*(?:\\.[^"\\]*)*)"(\^\^([^"]+))?(@([^-]+)(--(.+))?)?$/);
		if (dtMatch) {
			this.value = dtMatch[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
			if (dtMatch[5]) {
				this.language = dtMatch[5];
				this.datatype = new NamedNode(RDF_LANG_STRING);
			} else if (dtMatch[3]) this.datatype = new NamedNode(dtMatch[3]);
			else this.datatype = new NamedNode(XSD_STRING);
		} else {
			this.value = id.replace(/^"|"$/g, "");
			this.datatype = new NamedNode(XSD_STRING);
		}
	}
	equals(other) {
		return !!other && this.termType === other.termType && this.value === other.value && this.language === other.language && this.datatype?.value === other.datatype?.value;
	}
};
var BlankNode = class extends Term {
	constructor(name) {
		super(name || `b${Math.random().toString(36).slice(2, 11)}`);
		this.termType = "BlankNode";
		this.value = this.id;
	}
};
var Variable = class extends Term {
	constructor(name) {
		super(name);
		this.termType = "Variable";
		this.value = name;
	}
};
var DefaultGraph = class extends Term {
	constructor() {
		super("");
		this.termType = "DefaultGraph";
		this.value = "";
	}
	equals(other) {
		return !!other && this.termType === other.termType;
	}
};
var DEFAULTGRAPH = new DefaultGraph();
var Quad = class extends Term {
	constructor(subject, predicate, object, graph = DEFAULTGRAPH) {
		super(`${subject.id}|${predicate.id}|${object.id}|${graph.id}`);
		this.termType = "Quad";
		this.subject = subject;
		this.predicate = predicate;
		this.object = object;
		this.graph = graph;
	}
	equals(other) {
		return !!other && this.termType === other.termType && this.subject.equals(other.subject) && this.predicate.equals(other.predicate) && this.object.equals(other.object) && this.graph.equals(other.graph);
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
};
var DataFactory = {
	namedNode: (iri) => new NamedNode(iri),
	blankNode: (name) => new BlankNode(name),
	literal: (value, languageOrDataType) => {
		const escapedValue = String(value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
		if (typeof languageOrDataType === "string") return new Literal(`"${escapedValue}"@${languageOrDataType.toLowerCase()}`);
		if (languageOrDataType !== void 0 && !("termType" in languageOrDataType)) {
			const direction = languageOrDataType.direction ? `--${languageOrDataType.direction.toLowerCase()}` : "";
			return new Literal(`"${escapedValue}"@${languageOrDataType.language.toLowerCase()}${direction}`);
		}
		let datatype = languageOrDataType ? languageOrDataType.value : "";
		if (datatype === "") {
			if (typeof value === "boolean") datatype = XSD_BOOLEAN;
			else if (typeof value === "number") {
				if (Number.isFinite(value)) datatype = Number.isInteger(value) ? XSD_INTEGER : XSD_DOUBLE;
				else {
					datatype = XSD_DOUBLE;
					if (!Number.isNaN(value)) value = value > 0 ? "INF" : "-INF";
				}
			}
		}
		return datatype === "" || datatype === "http://www.w3.org/2001/XMLSchema#string" ? new Literal(`"${escapedValue}"`) : new Literal(`"${escapedValue}"^^${datatype}`);
	},
	variable: (name) => new Variable(name),
	defaultGraph: () => DEFAULTGRAPH,
	quad: (subject, predicate, object, graph) => new Quad(subject, predicate, object, graph),
	triple: (subject, predicate, object, graph) => new Quad(subject, predicate, object, graph),
	fromTerm: (term) => {
		if (term instanceof Term) return term;
		switch (term.termType) {
			case "NamedNode": return new NamedNode(term.value);
			case "BlankNode": return new BlankNode(term.value);
			case "Variable": return new Variable(term.value);
			case "DefaultGraph": return DEFAULTGRAPH;
			case "Literal":
				const escapedValue = String(term.value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
				if (term.language) return new Literal(`"${escapedValue}"@${term.language}`);
				else if (term.datatype) return new Literal(`"${escapedValue}"^^${term.datatype.value || term.datatype}`);
				else return new Literal(`"${escapedValue}"`);
			case "Quad": return DataFactory.fromQuad(term);
			default: throw new Error(`Unexpected termType: ${term.termType}`);
		}
	},
	fromQuad: (inQuad) => {
		if (inQuad instanceof Quad) return inQuad;
		if (inQuad.termType !== "Quad") {
			if (inQuad.subject && inQuad.predicate && inQuad.object) return new Quad(DataFactory.fromTerm(inQuad.subject), DataFactory.fromTerm(inQuad.predicate), DataFactory.fromTerm(inQuad.object), DataFactory.fromTerm(inQuad.graph || DataFactory.defaultGraph()));
			throw new Error(`Unexpected termType: ${inQuad.termType}`);
		}
		return new Quad(DataFactory.fromTerm(inQuad.subject), DataFactory.fromTerm(inQuad.predicate), DataFactory.fromTerm(inQuad.object), DataFactory.fromTerm(inQuad.graph));
	}
};
/**
* Locate the origin entry for a quad using the lean origin system
*
* @param {Object} quad - The quad to locate (subject, predicate, object)
* @param {Object} origin - Origin object containing quadIndex
* @returns {Object|null} Origin entry or null if not found
*/
function locate(quad, origin) {
	if (!quad || !origin || !origin.quadIndex) return null;
	const quadKey = quadToKeyForOrigin(quad);
	if (!quadKey) return null;
	return origin.quadIndex.get(quadKey) || null;
}
function hash(str) {
	let h = 5381;
	for (let i = 0; i < str.length; i++) h = (h << 5) + h + str.charCodeAt(i);
	return Math.abs(h).toString(16).slice(0, 12);
}
var iriCache$1 = /* @__PURE__ */ new Map();
var ctxSigCache = /* @__PURE__ */ new WeakMap();
function ctxSignature(ctx) {
	let sig = ctxSigCache.get(ctx);
	if (sig === void 0) {
		sig = `${ctx["@vocab"] || ""}|${Object.keys(ctx).filter((k) => k !== "@vocab").sort().map((k) => `${k}:${ctx[k]}`).join(",")}`;
		ctxSigCache.set(ctx, sig);
	}
	return sig;
}
function expandIRI(term, ctx) {
	if (term == null) return null;
	const cacheKey = `${term}|${ctxSignature(ctx)}`;
	if (iriCache$1.has(cacheKey)) return iriCache$1.get(cacheKey);
	const t = (typeof term === "string" ? term : typeof term === "object" && typeof term.value === "string" ? term.value : String(term)).trim();
	let result;
	if (t.match(URL_REGEX)) result = t;
	else if (t.includes(":")) {
		const [prefix, ref] = t.split(":", 2);
		if (prefix && !ctx[prefix] && prefix !== "@vocab") console.warn(`Undefined prefix "${prefix}" in IRI "${t}" - treating as literal`);
		result = ctx[prefix] ? ctx[prefix] + ref : t;
	} else result = (ctx["@vocab"] || "") + t;
	iriCache$1.set(cacheKey, result);
	return result;
}
function shortenIRI(iri, ctx) {
	if (!iri || !URL_REGEX.test(iri)) return iri;
	if (ctx["@vocab"] && iri.startsWith(ctx["@vocab"])) return iri.substring(ctx["@vocab"].length);
	for (const [prefix, namespace] of Object.entries(ctx)) if (prefix !== "@vocab" && iri.startsWith(namespace)) {
		if (Object.entries(ctx).filter(([p, ns]) => p !== "@vocab" && iri.startsWith(ns)).every(([p, ns]) => namespace.length >= ns.length || p === prefix && ns.length === namespace.length)) return prefix + ":" + iri.substring(namespace.length);
	}
	return iri;
}
var TOKEN_PATTERNS = {
	"=#": {
		kind: "fragment",
		extract: (t) => t.substring(2).replace("}", "")
	},
	"+#": {
		kind: "softFragment",
		extract: (t) => t.substring(2).replace("}", "")
	},
	"+": {
		kind: "object",
		extract: (t) => t.substring(1)
	},
	"^^": {
		kind: "datatype",
		extract: (t) => t.substring(2)
	},
	"@": {
		kind: "language",
		extract: (t) => t.substring(1)
	},
	".": {
		kind: "type",
		extract: (t) => t.substring(1)
	},
	"!": {
		kind: "property",
		form: "!",
		extract: (t) => t.substring(1)
	},
	"?": {
		kind: "property",
		form: "?",
		extract: (t) => t.substring(1)
	}
};
function parseSemanticBlock(raw) {
	try {
		const cleaned = String(raw || "").trim().replace(/^\{|\}$/g, "").trim();
		if (!cleaned) return {
			subject: null,
			object: null,
			types: [],
			predicates: [],
			datatype: null,
			language: null,
			entries: []
		};
		const result = {
			subject: null,
			object: null,
			types: [],
			predicates: [],
			datatype: null,
			language: null,
			entries: []
		};
		const re = /\S+/g;
		let m;
		while ((m = re.exec(cleaned)) !== null) {
			let token = m[0];
			const relStart = 1 + m.index;
			const relEnd = relStart + token.length;
			const entryIndex = result.entries.length;
			let remove = false;
			if (token.startsWith("-") && token.length > 1) {
				remove = true;
				token = token.slice(1);
			}
			if (token === "=") {
				if (remove) console.warn("-= is not valid, subject declarations have no polarity");
				result.subject = "RESET";
				result.entries.push({
					kind: "subjectReset",
					relRange: {
						start: relStart,
						end: relEnd
					},
					raw: token
				});
				continue;
			}
			if (token.startsWith("=") && !token.startsWith("=#")) {
				if (remove) console.warn("-= is not valid, subject declarations have no polarity");
				const iri = token.substring(1);
				result.subject = iri;
				result.entries.push({
					kind: "subject",
					iri,
					relRange: {
						start: relStart,
						end: relEnd
					},
					raw: token
				});
				continue;
			}
			let processed = false;
			for (const [pattern, config] of Object.entries(TOKEN_PATTERNS)) if (token.startsWith(pattern)) {
				const entry = {
					kind: config.kind,
					relRange: {
						start: relStart,
						end: relEnd
					},
					raw: m[0]
				};
				const extracted = config.extract(token);
				if (config.kind === "fragment") {
					result.subject = `=#${extracted}`;
					entry.fragment = extracted;
				} else if (config.kind === "softFragment") {
					result.object = `#${extracted}`;
					entry.fragment = extracted;
				} else if (config.kind === "object") {
					if (remove) {
						console.warn("-+ is not valid, object declarations have no polarity");
						remove = false;
					}
					result.object = extracted;
					entry.iri = extracted;
				} else if (config.kind === "datatype") {
					if (remove) {
						console.warn("-^^ is not valid, datatype modifiers have no polarity");
						remove = false;
					}
					if (!result.language) result.datatype = extracted;
					entry.datatype = extracted;
				} else if (config.kind === "language") {
					if (remove) {
						console.warn("-@ is not valid, language modifiers have no polarity");
						remove = false;
					}
					result.language = extracted;
					result.datatype = null;
					entry.language = extracted;
				} else if (config.kind === "type") {
					result.types.push({
						iri: extracted,
						entryIndex,
						remove
					});
					entry.iri = extracted;
					entry.remove = remove;
				} else if (config.kind === "property") {
					result.predicates.push({
						iri: extracted,
						form: config.form,
						entryIndex,
						remove
					});
					entry.iri = extracted;
					entry.form = config.form;
					entry.remove = remove;
				}
				result.entries.push(entry);
				processed = true;
				break;
			}
			if (!processed) {
				result.predicates.push({
					iri: token,
					form: "",
					entryIndex,
					remove
				});
				result.entries.push({
					kind: "property",
					iri: token,
					form: "",
					relRange: {
						start: relStart,
						end: relEnd
					},
					raw: m[0],
					remove
				});
			}
		}
		return result;
	} catch (error) {
		console.error(`Error parsing semantic block ${raw}:`, error);
		return {
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
function quadIndexKey(subject, predicate, object) {
	const objKey = object.termType === "Literal" ? JSON.stringify({
		t: "Literal",
		v: object.value,
		lang: object.language || "",
		dt: object.datatype?.value || ""
	}) : JSON.stringify({
		t: object.termType,
		v: object.value
	});
	return JSON.stringify([
		subject.value,
		predicate.value,
		objKey
	]);
}
function quadToKeyForOrigin(q) {
	return q ? quadIndexKey(q.subject, q.predicate, q.object) : null;
}
function createLiteral(value, datatype, language, context, dataFactory) {
	if (datatype) return dataFactory.literal(value, dataFactory.namedNode(expandIRI(datatype, context)));
	if (language) return dataFactory.literal(value, language);
	return dataFactory.literal(value);
}
// src/tokenizers.js
/**
* Character-based Tokenizers for MDLD
* 
* Replaces regex patterns with direct character scanning for better performance.
* Each tokenizer follows the EBNF grammar exactly.
*/
function skipHorizontalWs(text, pos) {
	while (pos < text.length && (text[pos] === " " || text[pos] === "	")) pos++;
	return pos;
}
var isSpaceChar = (ch) => ch.trim() === "";
function firstAttrs(text) {
	let open = text.indexOf("{");
	while (open !== -1) {
		const close = text.indexOf("}", open + 1);
		if (close === -1) return null;
		if (close > open + 1) return text.slice(open + 1, close);
		open = text.indexOf("{", open + 1);
	}
	return null;
}
function hasUrlScheme(url) {
	const colon = url.indexOf(":");
	if (colon <= 0) return false;
	const first = url.charCodeAt(0);
	if (!(first >= 65 && first <= 90 || first >= 97 && first <= 122)) return false;
	for (let i = 1; i < colon; i++) {
		const c = url.charCodeAt(i);
		if (!(c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 43 || c === 45 || c === 46)) return false;
	}
	return true;
}
function splitTrailingAttrs(text) {
	let end = text.length;
	while (end > 0 && isSpaceChar(text[end - 1])) end--;
	if (end === 0 || text[end - 1] !== "}") return {
		text,
		attrs: null
	};
	const closeIdx = end - 1;
	const prevClose = text.lastIndexOf("}", closeIdx - 1);
	let openIdx = -1;
	for (let i = prevClose + 1; i < closeIdx; i++) if (text[i] === "{") {
		openIdx = i;
		break;
	}
	if (openIdx === -1 || openIdx + 1 === closeIdx) return {
		text,
		attrs: null
	};
	return {
		text: text.slice(0, openIdx).trim(),
		attrs: text.slice(openIdx + 1, closeIdx)
	};
}
/**
* Detect code fence: 3+ backticks or tildes at line start
* EBNF: backticks = "`", "`", "`", { "`" } | tildes = "~", "~", "~", { "~" }
*/
function detectFence(line) {
	if (line.length < 3) return null;
	const char = line[0];
	if (char !== "`" && char !== "~") return null;
	let count = 1;
	while (count < line.length && line[count] === char) count++;
	if (count < 3) return null;
	const infoString = line.slice(count).trimStart();
	let langEnd = 0;
	while (langEnd < infoString.length && infoString[langEnd] !== "{" && !isSpaceChar(infoString[langEnd])) langEnd++;
	const lang = infoString.slice(0, langEnd);
	const attrs = firstAttrs(infoString);
	return {
		fenceChar: char,
		fenceLength: count,
		lang,
		attrs,
		infoString
	};
}
/**
* Detect prefix declaration: [prefix] <IRI>
* EBNF: contextDecl = "[", contextKey, "]", whitespace, "<", contextIri, ">"
*/
function detectPrefix(line) {
	if (line[0] !== "[") return null;
	const closeBracket = line.indexOf("]", 1);
	if (closeBracket === -1) return null;
	const prefix = line.slice(1, closeBracket).trim();
	if (!prefix) return null;
	let pos = skipHorizontalWs(line, closeBracket + 1);
	if (pos >= line.length || line[pos] !== "<") return null;
	const closeAngle = line.indexOf(">", pos + 1);
	if (closeAngle === -1) return null;
	const iri = line.slice(pos + 1, closeAngle).trim();
	if (!iri) return null;
	return {
		prefix,
		iri
	};
}
/**
* Detect heading: 1-6 # characters followed by space and text
* EBNF: heading = "#", { "#" }, whitespace, text
*/
function detectHeading(line) {
	if (line[0] !== "#") return null;
	let depth = 1;
	while (depth < line.length && depth < 6 && line[depth] === "#") depth++;
	if (depth >= line.length || line[depth] !== " " && line[depth] !== "	") return null;
	const contentStart = skipHorizontalWs(line, depth);
	const split = splitTrailingAttrs(line.slice(contentStart));
	let content = split.text;
	const attrs = split.attrs;
	content = content.replace(/[ \t]+#+[ \t]*$/, "");
	if (/^#+$/.test(content)) content = "";
	return {
		depth,
		content,
		attrs
	};
}
/**
* Detect list item: -, *, +, or digits followed by .
* EBNF: listMarker = "-" | "*" | "+" | digit, { digit }, "."
*/
function detectList(line) {
	const pos = skipHorizontalWs(line, 0);
	const indent = pos;
	if (pos >= line.length) return null;
	const char = line[pos];
	let marker;
	let contentStart = pos + 1;
	if (char === "-" || char === "*" || char === "+") marker = char;
	else if (char >= "0" && char <= "9") {
		let numEnd = pos + 1;
		while (numEnd < line.length && line[numEnd] >= "0" && line[numEnd] <= "9") numEnd++;
		if (numEnd >= line.length || line[numEnd] !== "." && line[numEnd] !== ")") return null;
		marker = line.slice(pos, numEnd + 1);
		contentStart = numEnd + 1;
	} else return null;
	if (contentStart >= line.length || line[contentStart] !== " " && line[contentStart] !== "	") return null;
	contentStart = skipHorizontalWs(line, contentStart);
	const split = splitTrailingAttrs(line.slice(contentStart));
	const content = split.text;
	const attrs = split.attrs;
	return {
		indent,
		marker,
		content,
		attrs
	};
}
/**
* Detect blockquote: > followed by space and text
* EBNF: blockquote = ">", whitespace, text
*/
function detectBlockquote(line) {
	if (line[0] !== ">") return null;
	if (line.length > 1 && line[1] !== " " && line[1] !== "	") return null;
	const contentStart = skipHorizontalWs(line, 1);
	const split = splitTrailingAttrs(line.slice(contentStart));
	return {
		content: split.text,
		attrs: split.attrs
	};
}
/**
* Detect standalone subject: {=...} with optional whitespace
* EBNF: standaloneSubject = whitespace*, "{", "=", ( iriRef | "#", fragment ), "}", whitespace*
*/
function detectStandaloneSubject(line) {
	let pos = skipHorizontalWs(line, 0);
	if (pos >= line.length || line[pos] !== "{") return null;
	pos++;
	if (pos >= line.length || line[pos] !== "=") return null;
	pos++;
	const contentStart = pos;
	let braceCount = 1;
	while (pos < line.length && braceCount > 0) {
		if (line[pos] === "{") braceCount++;
		if (line[pos] === "}") braceCount--;
		if (braceCount > 0) pos++;
	}
	if (braceCount > 0) return null;
	const content = line.slice(contentStart, pos).trim();
	pos = skipHorizontalWs(line, pos + 1);
	if (pos < line.length) return null;
	return { content };
}
var HTML_BLOCK_TAGS = /* @__PURE__ */ new Set([
	"address",
	"article",
	"aside",
	"base",
	"basefont",
	"blockquote",
	"body",
	"caption",
	"center",
	"col",
	"colgroup",
	"dd",
	"details",
	"dialog",
	"dir",
	"div",
	"dl",
	"dt",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"frame",
	"frameset",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hr",
	"html",
	"iframe",
	"legend",
	"li",
	"link",
	"main",
	"menu",
	"menuitem",
	"nav",
	"noframes",
	"ol",
	"optgroup",
	"option",
	"p",
	"param",
	"search",
	"section",
	"summary",
	"table",
	"tbody",
	"td",
	"tfoot",
	"th",
	"thead",
	"title",
	"tr",
	"track",
	"ul"
]);
var HTML_RAW_TEXT_TAGS = /* @__PURE__ */ new Set([
	"script",
	"pre",
	"style",
	"textarea"
]);
/**
* Detect indented code block line: 4+ spaces or a tab (CommonMark).
* Cannot interrupt a paragraph — callers must only check at block start.
*/
function detectIndentedCode(line) {
	if (line[0] === "	") return { indent: "	" };
	if (line[0] === " " && line[1] === " " && line[2] === " " && line[3] === " ") return { indent: "    " };
	return null;
}
/**
* Detect an HTML block start (CommonMark HTML blocks).
* Returns { tag, closeTag, interrupt } or null.
* - interrupt: whether the block may interrupt a paragraph (type 7 cannot).
* - closeTag: if set, the block ends on the line containing this string;
*   otherwise it ends at the first blank line.
*/
function detectHtmlBlock(line, interruptOnly = false) {
	const trimmed = line.trim();
	if (trimmed[0] !== "<") return null;
	const m = trimmed.match(/^<(\/?)([A-Za-z][A-Za-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/);
	if (!m) return null;
	const tag = m[2].toLowerCase();
	const closing = m[1] === "/";
	let interrupt = true;
	let closeTag = null;
	if (!closing && HTML_RAW_TEXT_TAGS.has(tag)) closeTag = `</${tag}`;
	else if (!HTML_BLOCK_TAGS.has(tag)) {
		if (closing || m[0] !== trimmed) return null;
		interrupt = false;
	}
	if (interruptOnly && !interrupt) return null;
	return {
		tag,
		closeTag,
		interrupt
	};
}
/**
* Find matching closing bracket, accounting for nesting
*/
function findMatchingBracket(text, startPos, openChar = "[", closeChar = "]") {
	let depth = 1;
	let pos = startPos + 1;
	while (pos < text.length && depth > 0) {
		if (text[pos] === openChar) depth++;
		if (text[pos] === closeChar) depth--;
		if (depth > 0) pos++;
	}
	return depth === 0 ? pos : null;
}
/**
* Extract attributes block after a position: {...}
*/
function extractAttributes(text, startPos) {
	const pos = skipHorizontalWs(text, startPos);
	if (pos >= text.length || text[pos] !== "{") return null;
	const closeBrace = text.indexOf("}", pos + 1);
	if (closeBrace === -1) return null;
	return {
		attrs: text.slice(pos + 1, closeBrace),
		endPos: closeBrace + 1
	};
}
/**
* Detect URL in angle brackets: <URL>
* Returns null if not a valid URL per EBNF scheme rules
*/
function detectAngleBracketUrl(text, startPos) {
	if (text[startPos] !== "<") return null;
	const closeAngle = text.indexOf(">", startPos + 1);
	if (closeAngle === -1) return null;
	const url = text.slice(startPos + 1, closeAngle).trim();
	if (!hasUrlScheme(url)) return null;
	return {
		url,
		endPos: closeAngle + 1,
		contentStart: startPos + 1,
		contentEnd: closeAngle
	};
}
var UNICODE_PUNCT_RE = /\p{P}/u;
var UNICODE_WS_RE = /\s/;
function isUnicodeWs(ch) {
	return ch === void 0 || UNICODE_WS_RE.test(ch);
}
function isUnicodePunct(ch) {
	return ch !== void 0 && UNICODE_PUNCT_RE.test(ch);
}
function delimiterFlags(text, start, len, char) {
	const before = start > 0 ? text[start - 1] : void 0;
	const after = start + len < text.length ? text[start + len] : void 0;
	const leftFlanking = !isUnicodeWs(after) && (!isUnicodePunct(after) || isUnicodeWs(before) || isUnicodePunct(before));
	const rightFlanking = !isUnicodeWs(before) && (!isUnicodePunct(before) || isUnicodeWs(after) || isUnicodePunct(after));
	if (char === "_") return {
		canOpen: leftFlanking && (!rightFlanking || isUnicodePunct(before)),
		canClose: rightFlanking && (!leftFlanking || isUnicodePunct(after))
	};
	return {
		canOpen: leftFlanking,
		canClose: rightFlanking
	};
}
/**
* Detect emphasis/strong spans: *text* or _text_
* EBNF: emphasisSpan = "*", text, "*" | "_", text, "_"
*       strongSpan = "**", text, "**" | "__", text, "__"
*/
function detectEmphasis(text, startPos) {
	const char = text[startPos];
	if (char !== "*" && char !== "_") return null;
	let delimCount = 1;
	while (startPos + delimCount < text.length && text[startPos + delimCount] === char) delimCount++;
	if (delimCount > 2) return null;
	if (!delimiterFlags(text, startPos, delimCount, char).canOpen) return null;
	const type = delimCount === 1 ? "emphasis" : "strong";
	const contentStart = startPos + delimCount;
	let pos = contentStart;
	let depth = 0;
	while (pos < text.length) {
		if (text[pos] === char) {
			let runLen = 1;
			while (pos + runLen < text.length && text[pos + runLen] === char) runLen++;
			const flags = delimiterFlags(text, pos, runLen, char);
			if (depth === 0 && flags.canClose && runLen >= delimCount) {
				const content = text.slice(contentStart, pos);
				if (content.length === 0) return null;
				const endPos = pos + delimCount;
				const attrsResult = extractAttributes(text, endPos);
				const finalPos = attrsResult ? attrsResult.endPos : endPos;
				return {
					type,
					content,
					attrs: attrsResult?.attrs || null,
					endPos: finalPos,
					contentStart,
					contentEnd: pos
				};
			}
			if (flags.canClose) depth = Math.max(0, depth - 1);
			else if (flags.canOpen) depth++;
			pos += runLen;
			continue;
		}
		pos++;
	}
	return null;
}
/**
* Detect code span: `text` or ``text``
* EBNF: codeSpan = "`", text, "`" | "``", text, "``"
*/
function detectCodeSpan(text, startPos) {
	if (text[startPos] !== "`") return null;
	let backtickCount = 1;
	while (startPos + backtickCount < text.length && text[startPos + backtickCount] === "`") backtickCount++;
	if (backtickCount > 2) return null;
	const opener = "`".repeat(backtickCount);
	const contentStart = startPos + backtickCount;
	let pos = contentStart;
	while (pos < text.length) {
		if (text.slice(pos, pos + backtickCount) === opener) {
			const content = text.slice(contentStart, pos);
			const endPos = pos + backtickCount;
			const attrsResult = extractAttributes(text, endPos);
			const finalPos = attrsResult ? attrsResult.endPos : endPos;
			return {
				type: "code",
				content,
				attrs: attrsResult?.attrs || null,
				endPos: finalPos,
				contentStart,
				contentEnd: pos
			};
		}
		pos++;
	}
	return null;
}
function parseLinkTitle(s) {
	if (s.length < 2) return null;
	const open = s[0];
	const close = s[s.length - 1];
	return open === "\"" && close === "\"" || open === "'" && close === "'" || open === "(" && close === ")" ? s.slice(1, -1) : null;
}
function parseLinkDestination(inner) {
	const s = inner.trim();
	if (s === "") return null;
	let dest, rest;
	if (s[0] === "<") {
		const close = s.indexOf(">");
		if (close === -1) return null;
		dest = s.slice(1, close);
		rest = s.slice(close + 1).trim();
	} else {
		let w = 0;
		while (w < s.length && s[w] !== " " && s[w] !== "	" && s[w] !== "\n") w++;
		dest = s.slice(0, w);
		rest = s.slice(w).trim();
		let depth = 0;
		for (let k = 0; k < dest.length; k++) {
			if (dest[k] === "(") depth++;
			else if (dest[k] === ")") depth--;
			if (depth < 0) return null;
		}
		if (depth !== 0) return null;
	}
	if (dest === "") return null;
	if (rest !== "") {
		const title = parseLinkTitle(rest);
		if (title === null) return null;
		return {
			dest,
			title
		};
	}
	return {
		dest,
		title: null
	};
}
/**
* Detect bracket link: [text](url) or [text]{...} or [text] alone
* EBNF: linkSpan = "[", text, "](", text, ")" | "[", text, "]"
*/
function detectBracketLink(text, startPos) {
	if (text[startPos] !== "[") return null;
	const bracketEnd = findMatchingBracket(text, startPos, "[", "]");
	if (!bracketEnd) return null;
	const linkText = text.slice(startPos + 1, bracketEnd);
	let pos = bracketEnd + 1;
	let url = null;
	let title = null;
	if (pos < text.length && text[pos] === "(") {
		let parenEnd = text.indexOf(")", pos + 1);
		while (parenEnd !== -1) {
			const parsed = parseLinkDestination(text.slice(pos + 1, parenEnd));
			if (parsed) {
				url = parsed.dest;
				title = parsed.title;
				pos = parenEnd + 1;
				break;
			}
			parenEnd = text.indexOf(")", parenEnd + 1);
		}
		if (url === null) return null;
	} else if (pos < text.length && text[pos] === "<") {
		const closeAngle = text.indexOf(">", pos + 1);
		if (closeAngle !== -1) {
			const angleUrl = text.slice(pos + 1, closeAngle).trim();
			if (hasUrlScheme(angleUrl)) {
				url = angleUrl;
				pos = closeAngle + 1;
			}
		}
	}
	const attrsResult = extractAttributes(text, pos);
	const finalPos = attrsResult ? attrsResult.endPos : pos;
	return {
		type: url ? "link" : "span",
		text: linkText,
		url,
		title,
		attrs: attrsResult?.attrs || null,
		endPos: finalPos,
		contentStart: startPos + 1,
		contentEnd: bracketEnd
	};
}
/**
* Scan text for all inline carriers using character-based detection
* Memory-optimized version - minimizes object allocations
*/
function isEscaped(text, pos) {
	let n = 0;
	let j = pos - 1;
	while (j >= 0 && text[j] === "\\") {
		n++;
		j--;
	}
	return n % 2 === 1;
}
function scanInlineCarriers(text, baseOffset = 0) {
	const carriers = [];
	const len = text.length;
	let pos = 0;
	while (pos < len) {
		const char = text[pos];
		let detected = null;
		if (isEscaped(text, pos)) {
			pos++;
			continue;
		}
		switch (char) {
			case "!":
				if (text[pos + 1] === "[") {
					const inner = detectBracketLink(text, pos + 1);
					if (inner && inner.url) {
						detected = inner;
						detected.type = "image";
					}
				}
				break;
			case "<":
				detected = detectAngleBracketUrl(text, pos);
				if (detected) {
					const attrsResult = extractAttributes(text, detected.endPos);
					if (attrsResult) {
						detected.attrs = attrsResult.attrs;
						detected.endPos = attrsResult.endPos;
					}
					detected.type = "link";
					detected.text = detected.url;
				}
				break;
			case "[":
				detected = detectBracketLink(text, pos);
				break;
			case "*":
			case "_":
				detected = detectEmphasis(text, pos);
				break;
			case "`": detected = detectCodeSpan(text, pos);
		}
		if (!detected) {
			pos++;
			continue;
		}
		const url = detected.url;
		const type = detected.type;
		const attrs = detected.attrs;
		if (url?.startsWith("=") || type === "link" && !attrs && !url) {
			pos = detected.endPos;
			continue;
		}
		const absStart = baseOffset + pos;
		const absEnd = baseOffset + detected.endPos;
		const absContentEnd = baseOffset + detected.contentEnd;
		const valueRange = [baseOffset + detected.contentStart, baseOffset + detected.contentEnd];
		const carrier = {
			type,
			text: detected.content !== void 0 ? detected.content : detected.text !== void 0 ? detected.text : url,
			range: [absStart, absEnd],
			valueRange,
			attrs,
			url,
			title: detected.title || null,
			pos: detected.endPos
		};
		if (attrs) carrier.attrsRange = [absContentEnd, absEnd];
		carriers.push(carrier);
		pos = detected.endPos;
	}
	return carriers;
}
// src/shared.js
function matchFenceClose(line, fenceChar) {
	if (line[0] !== fenceChar) return null;
	let end = 1;
	while (line[end] === fenceChar) end++;
	return end >= 3 ? line.slice(0, end) : null;
}
function calcRangeInfo(line, attrs, lineStart, prefixLength, valueLength) {
	const valueStartInLine = prefixLength + (prefixLength < line.length && line[prefixLength] === " " ? 1 : line.slice(prefixLength).match(/^\s+/)?.[0]?.length || 0);
	return {
		valueRange: [lineStart + valueStartInLine, lineStart + valueStartInLine + valueLength],
		attrsRange: calcAttrsRange(line, attrs, lineStart)
	};
}
function calcAttrsRange(line, attrs, lineStart) {
	if (!attrs) return null;
	const attrsStartInLine = line.lastIndexOf(attrs);
	return attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrs.length] : null;
}
function createToken(type, range, text, attrs = null, attrsRange = null, valueRange = null, extra = {}) {
	const token = {
		type,
		range,
		text,
		attrs,
		attrsRange,
		valueRange,
		...extra
	};
	Object.defineProperty(token, "_carriers", {
		enumerable: false,
		writable: true,
		value: null
	});
	return token;
}
function createListToken(type, line, lineStart, pos, result) {
	const attrs = result.attrs || null;
	const content = result.content.trim();
	const rangeInfo = calcRangeInfo(line, attrs, lineStart, result.indent + result.marker.length, content.length);
	return createToken(type, [lineStart, pos - 1], content, attrs, rangeInfo.attrsRange, rangeInfo.valueRange, { indent: result.indent });
}
var semCache = {};
var EMPTY_SEM = Object.freeze({
	predicates: [],
	types: [],
	subject: null
});
function parseSemCached(attrs) {
	if (!attrs) return EMPTY_SEM;
	let sem = semCache[attrs];
	if (!sem) {
		sem = Object.freeze(parseSemanticBlock(attrs));
		semCache[attrs] = sem;
	}
	return sem;
}
function extractCleanText(token) {
	if (!token.text) return "";
	let text = token.text;
	if (token.attrsRange) text = text.substring(0, token.attrsRange[0] - (token.range?.[0] || 0)) + text.substring(token.attrsRange[1] - (token.range?.[0] || 0));
	const inlineRanges = (token._carriers || []).filter((carrier) => carrier.attrsRange).map((carrier) => carrier.attrsRange.map((pos) => pos - (token.range?.[0] || 0))).filter(([start, end]) => start >= 0 && end <= text.length).sort((a, b) => b[0] - a[0]);
	for (const [relativeStart, relativeEnd] of inlineRanges) text = text.substring(0, relativeStart) + text.substring(relativeEnd);
	switch (token.type) {
		case "heading": return text.replace(/^#+\s*/, "").trim();
		case "list": return text.replace(/^[-*+]\s*/, "").trim();
		case "blockquote": return text.replace(/^>\s*/, "").trim();
		default: return text.trim();
	}
}
function createLeanOriginEntry(block, subject, predicate, meta = null) {
	return {
		blockId: block.id,
		range: block.range,
		valueRange: block.valueRange || null,
		carrierType: block.carrierType,
		subject: subject.value,
		predicate: predicate.value,
		context: block.context,
		polarity: meta?.remove ? "-" : "+",
		value: block.text || ""
	};
}
function resolveFragment(fragment, currentSubject, dataFactory) {
	if (!currentSubject) return null;
	const subjectValue = currentSubject.value;
	const hashIndex = subjectValue.indexOf("#");
	const baseIRI = hashIndex > -1 ? subjectValue.slice(0, hashIndex) : subjectValue;
	return dataFactory.namedNode(baseIRI + "#" + fragment);
}
function resolveSubject(sem, state) {
	if (!sem.subject) return null;
	if (sem.subject === "RESET") {
		state.currentSubject = null;
		return null;
	}
	if (sem.subject.startsWith("=#")) return resolveFragment(sem.subject.substring(2), state.currentSubject, state.df);
	return state.df.namedNode(expandIRI(sem.subject, state.ctx));
}
function resolveObject(sem, state) {
	if (!sem.object) return null;
	if (sem.object.startsWith("#")) return resolveFragment(sem.object.substring(1), state.currentSubject, state.df);
	return state.df.namedNode(expandIRI(sem.object, state.ctx));
}
function escapeHtml$1(text) {
	if (!text) return "";
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
function isLiteral$1(term) {
	return term?.termType === "Literal";
}
function isNamedNode$1(term) {
	return term?.termType === "NamedNode";
}
function isRdfType(term) {
	return term?.value === RDF_TYPE$2;
}
function getPrefixFromIRI(iri, context) {
	if (!iri) return null;
	const shortened = shortenIRI(iri, context);
	if (shortened.includes(":")) return shortened.split(":")[0];
	return null;
}
function collectUsedPrefixes(subjectGroups, context) {
	const usedPrefixes = /* @__PURE__ */ new Set();
	for (const subjectQuads of subjectGroups.values()) for (const quad of subjectQuads) {
		const subjectPrefix = getPrefixFromIRI(quad.subject.value, context);
		if (subjectPrefix) usedPrefixes.add(subjectPrefix);
		const predicatePrefix = getPrefixFromIRI(quad.predicate.value, context);
		if (predicatePrefix) usedPrefixes.add(predicatePrefix);
		if (isNamedNode$1(quad.object)) {
			const objectPrefix = getPrefixFromIRI(quad.object.value, context);
			if (objectPrefix) usedPrefixes.add(objectPrefix);
		}
		if (quad.object.datatype && quad.object.datatype.value) {
			const datatypePrefix = getPrefixFromIRI(quad.object.datatype.value, context);
			if (datatypePrefix) usedPrefixes.add(datatypePrefix);
		}
	}
	return usedPrefixes;
}
function processTokenWithBlockTracking(token, state, processAnnotations, createBlockEntry, additionalProcessors = []) {
	const blockEntry = createBlockEntry(token, state);
	state.currentBlock = blockEntry;
	state.blockStack.push(blockEntry.id);
	additionalProcessors.forEach((processor) => processor(token, state));
	processAnnotations(token, state, token.type);
	state.blockStack.pop();
	state.currentBlock = state.blockStack.length > 0 ? state.origin.blocks.get(state.blockStack[state.blockStack.length - 1]) : null;
}
function sortQuadsByPredicate(quads) {
	return quads.sort((a, b) => a.predicate.value < b.predicate.value ? -1 : a.predicate.value > b.predicate.value ? 1 : 0);
}
var generatePrefixDeclaration = (prefix, namespace) => `[${prefix}] <${namespace}>\n`;
function literalFenceRun(line, char) {
	const trimmed = line.trim();
	let n = 0;
	while (trimmed[n] === char) n++;
	return n;
}
function chooseLiteralFence(value) {
	let best = null;
	for (const char of ["~", "`"]) {
		let max = 0;
		for (const line of value.split("\n")) {
			const run = literalFenceRun(line, char);
			if (run > max) max = run;
		}
		const fence = char.repeat(Math.max(3, max + 1));
		if (!best || fence.length < best.length) best = fence;
	}
	return best;
}
function fencedLiteralText(value, annotation) {
	const fence = chooseLiteralFence(value);
	return `${fence} {${annotation}}\n${value}\n${fence}\n\n`;
}
function literalBracketsBalanced(value) {
	let depth = 0;
	for (const ch of value) if (ch === "[") depth++;
	else if (ch === "]" && --depth < 0) return false;
	return depth === 0;
}
function literalCodeSafe(value, ticks) {
	if (value.includes("`".repeat(ticks))) return false;
	return ticks === 1 || !value.startsWith("`") && !value.endsWith("`");
}
function singleLineLiteralCarrier(value, annotation) {
	if (literalBracketsBalanced(value)) return `[${value}] {${annotation}}\n`;
	if (literalCodeSafe(value, 1)) return `\`${value}\` {${annotation}}\n`;
	if (literalCodeSafe(value, 2)) return `\`\`${value}\`\` {${annotation}}\n`;
	return fencedLiteralText(value, annotation);
}
function generateLiteralText(quad, context) {
	let annotation = shortenIRI(quad.predicate.value, context);
	if (quad.object.language) annotation += ` @${quad.object.language}`;
	else if (quad.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string") annotation += ` ^^${shortenIRI(quad.object.datatype.value, context)}`;
	const rawValue = quad.object.value ?? quad.object;
	const value = typeof rawValue === "string" ? rawValue : String(rawValue);
	const datatype = quad.object.datatype?.value || "";
	if (value === "") return `[] {${annotation}}\n`;
	if (value.includes("\n")) return fencedLiteralText(value, annotation);
	if ((datatype.includes("integer") || datatype.includes("decimal") || datatype.includes("double") || datatype.includes("float")) && literalCodeSafe(value, 1)) return `\`${value}\` {${annotation}}\n`;
	if ((datatype.includes("date") || datatype.includes("time")) && !value.includes("*")) return `*${value}* {${annotation}}\n`;
	if (datatype.includes("boolean") && !value.includes("*")) return `**${value}** {${annotation}}\n`;
	return singleLineLiteralCarrier(value, annotation);
}
function generateLabelAnnotation(labelEntry, context) {
	const language = labelEntry?.language || labelEntry?.term?.language || "";
	if (language) return `label @${language}`;
	const datatype = labelEntry?.datatype || labelEntry?.term?.datatype?.value || labelEntry?.term?.datatype || "";
	if (datatype && datatype !== "http://www.w3.org/2001/XMLSchema#string") return `label ^^${shortenIRI(datatype, context)}`;
	return "label";
}
var generateObjectText = (quad, context, labelLookup = null, filteredGroups = null, renderedQuads = null, compactInline = true, compactStats = null) => {
	const objShort = shortenIRI(quad.object.value, context);
	const predShort = shortenIRI(quad.predicate.value, context);
	const labelEntry = labelLookup?.get(quad.object.value) || null;
	const displayText = labelEntry ? labelEntry.value : objShort;
	let inlineAnnotation = "";
	if (compactInline && filteredGroups && labelLookup && renderedQuads) {
		const filtered = filteredGroups.get(quad.object.value);
		if (filtered) {
			const { types } = filtered;
			const hasLabel = !!labelEntry;
			const labelRendered = hasLabel && labelEntry.quad && renderedQuads.has(labelEntry.quad);
			if (!(types.some((t) => renderedQuads.has(t)) || labelRendered)) {
				const typeAnnotations = types.length > 0 ? types.map((t) => "." + shortenIRI(t.object.value, context)).sort().join(" ") : "";
				const labelAnnotation = hasLabel ? generateLabelAnnotation(labelEntry, context) : "";
				if (typeAnnotations || labelAnnotation) {
					inlineAnnotation = " " + [typeAnnotations, labelAnnotation].filter(Boolean).join(" ");
					if (compactStats) compactStats.inlineAnnotations++;
					types.forEach((q) => renderedQuads.add(q));
					if (labelEntry?.quad) renderedQuads.add(labelEntry.quad);
				}
			}
		}
	}
	return `[${displayText}] {+${objShort} ?${predShort}${inlineAnnotation}}\n`;
};
function filterQuadsByType(subjectQuads) {
	const types = [], literals = [], objects = [];
	for (const q of subjectQuads) if (isRdfType(q.predicate)) types.push(q);
	else if (isLiteral$1(q.object)) literals.push(q);
	else if (isNamedNode$1(q.object)) objects.push(q);
	return {
		types,
		literals,
		objects
	};
}
function generateRetractionText(quad, context) {
	const predShort = shortenIRI(quad.predicate.value, context);
	let annotation;
	if (quad.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
		annotation = `-.${shortenIRI(quad.object.value, context)}`;
		return `> {${annotation}}\n`;
	} else if (isNamedNode$1(quad.object)) {
		const objShort = shortenIRI(quad.object.value, context);
		annotation = `-?${predShort}`;
		return `[${objShort}] {+${objShort} ${annotation}}\n`;
	} else {
		annotation = `-${predShort}`;
		if (quad.object.language) annotation += ` @${quad.object.language}`;
		else if (quad.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string") annotation += ` ^^${shortenIRI(quad.object.datatype.value, context)}`;
		const rawValue = quad.object.value ?? quad.object;
		const value = typeof rawValue === "string" ? rawValue : String(rawValue);
		const datatype = quad.object.datatype?.value || "";
		if (value.includes("\n")) return `~~~ {${annotation}}\n${value}\n~~~\n`;
		if (datatype.includes("integer") || datatype.includes("decimal") || datatype.includes("double") || datatype.includes("float")) return `\`${value}\` {${annotation}}\n`;
		if (datatype.includes("boolean")) return `**${value}** {${annotation}}\n`;
		return `[${value}] {${annotation}}\n`;
	}
}
// src/parse.js
function parse(firstArg, secondArg = {}) {
	const isNamedParams = typeof firstArg === "object" && firstArg !== null && "text" in firstArg;
	const text = isNamedParams ? firstArg.text : firstArg;
	const options = isNamedParams ? {
		context: firstArg.context,
		dataFactory: firstArg.dataFactory,
		graph: firstArg.graph
	} : secondArg;
	const state = {
		ctx: {
			...DEFAULT_CONTEXT,
			...options.context || {}
		},
		df: options.dataFactory || DataFactory,
		graph: options.graph ? DataFactory.namedNode(options.graph) : DataFactory.defaultGraph(),
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
	};
	const scanResult = scanTokens(text);
	state.tokens = scanResult.tokens;
	for (let i = 0; i < state.tokens.length; i++) {
		const token = state.tokens[i];
		state.currentTokenIndex = i;
		if (token.type === "prefix") {
			let resolvedIri = token.iri;
			if (token.iri.includes(":")) {
				const colonIndex = token.iri.indexOf(":");
				const potentialPrefix = token.iri.substring(0, colonIndex);
				const reference = token.iri.substring(colonIndex + 1);
				if (state.ctx[potentialPrefix] && potentialPrefix !== "@vocab") resolvedIri = state.ctx[potentialPrefix] + reference;
			}
			state.ctx[token.prefix] = resolvedIri;
			continue;
		}
		TOKEN_PROCESSORS[token.type]?.(token, state);
	}
	state.quads = Array.from(state.quadBuffer.values());
	const filteredRemove = [];
	for (const quad of state.removeSet) {
		const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
		if (!state.quadBuffer.has(key)) filteredRemove.push(quad);
	}
	const primary = {
		subject: state.primarySubject,
		type: state.primaryType,
		label: state.primaryLabel,
		comment: state.primaryComment
	};
	return {
		quads: state.quads,
		remove: filteredRemove,
		statements: state.statements,
		origin: state.origin,
		context: state.ctx,
		primarySubject: state.primarySubject,
		primary,
		md: scanResult.md
	};
}
function getCarriers(token) {
	if (token.type === "code") return [];
	const baseOffset = token.valueRange ? token.valueRange[0] : token.range[0];
	return token._carriers || (token._carriers = extractInlineCarriers(token.text, baseOffset));
}
function scanTokens(text) {
	const tokens = [];
	const mdLines = [];
	const lines = text.split("\n");
	let pos = 0;
	let codeBlock = null;
	let sfcBlock = null;
	let quoteBlock = null;
	function detectSfcStart(trimmed) {
		if (trimmed.startsWith("<!--")) return true;
		return /^<(script|style|template)\b/i.test(trimmed);
	}
	function checkSfcClose(line) {
		if (!sfcBlock) return;
		if (sfcBlock.tag === "comment") {
			if (line.includes("-->")) sfcBlock = null;
		} else if (sfcBlock.tag === "script" || sfcBlock.tag === "style") {
			if (new RegExp(`</\\s*${sfcBlock.tag}\\s*>`, "i").test(line)) sfcBlock = null;
		} else if (sfcBlock.tag === "template") {
			const openMatches = (line.match(/<template\b/gi) || []).length;
			const closeMatches = (line.match(/<\/template>/gi) || []).length;
			sfcBlock.depth += openMatches - closeMatches;
			if (sfcBlock.depth <= 0) sfcBlock = null;
		}
	}
	function handleSfcStart(line) {
		const trimmed = line.trim();
		if (trimmed.startsWith("<!--")) sfcBlock = {
			tag: "comment",
			depth: 1
		};
		else {
			const match = trimmed.match(/^<(script|style|template)\b/i);
			if (!match) return false;
			const tag = match[1].toLowerCase();
			sfcBlock = {
				tag,
				depth: tag === "template" ? 0 : 1
			};
		}
		mdLines.push(line);
		checkSfcClose(line);
		return true;
	}
	function handleSfcContent(line) {
		mdLines.push(line);
		checkSfcClose(line);
		return true;
	}
	const PROCESSORS = [
		{
			type: "quoteContent",
			test: () => quoteBlock !== null,
			process: handleQuoteContent
		},
		{
			type: "fence",
			test: (line) => detectFence(line.trim()),
			process: handleFence
		},
		{
			type: "codeContent",
			test: () => codeBlock,
			process: (line) => codeBlock.content.push(line)
		},
		{
			type: "sfcContent",
			test: () => sfcBlock,
			process: handleSfcContent
		},
		{
			type: "sfcStart",
			test: (line) => detectSfcStart(line.trim()),
			process: handleSfcStart
		},
		{
			type: "prefix",
			test: (line) => detectPrefix(line),
			process: handlePrefix
		},
		{
			type: "standalone",
			test: (line) => detectStandaloneSubject(line),
			process: handleStandaloneSubject
		},
		{
			type: "heading",
			test: (line) => detectHeading(line),
			process: handleHeading
		},
		{
			type: "list",
			test: (line) => detectList(line),
			process: handleList
		},
		{
			type: "blockquote",
			test: (line) => detectBlockquote(line),
			process: handleBlockquote
		},
		{
			type: "para",
			test: (line) => line.trim(),
			process: handlePara
		}
	];
	function handleFence(line, lineStart, pos) {
		const trimmedLine = line.trim();
		if (!codeBlock) {
			const fenceResult = detectFence(trimmedLine);
			if (!fenceResult) return false;
			const attrsText = fenceResult.attrs;
			const attrsStartInLine = attrsText ? line.indexOf(attrsText) : -1;
			const contentStart = lineStart + line.length + 1;
			codeBlock = {
				fence: fenceResult.fenceChar.repeat(fenceResult.fenceLength),
				start: lineStart,
				content: [],
				lang: fenceResult.lang,
				attrs: attrsText,
				attrsRange: attrsText && attrsStartInLine >= 0 ? [lineStart + attrsStartInLine, lineStart + attrsStartInLine + attrsText.length] : null,
				valueRangeStart: contentStart
			};
			const cleanFence = line.replace(/\s*\{[^}]+\}\s*$/, "");
			mdLines.push(cleanFence);
		} else {
			const fenceChar = codeBlock.fence[0];
			const expectedFence = fenceChar.repeat(codeBlock.fence.length);
			if (matchFenceClose(trimmedLine, fenceChar) === expectedFence) {
				const valueStart = codeBlock.valueRangeStart;
				const valueEnd = Math.max(valueStart, lineStart - 1);
				tokens.push({
					type: "code",
					range: [codeBlock.start, pos - 1],
					text: codeBlock.content.join("\n"),
					lang: codeBlock.lang,
					attrs: codeBlock.attrs,
					attrsRange: codeBlock.attrsRange,
					valueRange: [valueStart, valueEnd]
				});
				for (const contentLine of codeBlock.content) mdLines.push(contentLine);
				codeBlock = null;
				const closingFence = line.replace(/\r?\n.*$/, "");
				mdLines.push(closingFence);
			} else codeBlock.content.push(line);
		}
		return true;
	}
	function handlePrefix(line, lineStart, pos) {
		const result = detectPrefix(line);
		tokens.push({
			type: "prefix",
			prefix: result.prefix,
			iri: result.iri
		});
		return true;
	}
	function handleHeading(line, lineStart, pos) {
		const result = detectHeading(line);
		const attrs = result.attrs;
		const afterHashes = result.depth;
		const rangeInfo = calcRangeInfo(line, attrs, lineStart, afterHashes, result.content.length);
		tokens.push(createToken("heading", [lineStart, pos - 1], result.content, attrs, rangeInfo.attrsRange, rangeInfo.valueRange, { depth: result.depth }));
		const cleanHeading = `${"#".repeat(result.depth)} ${result.content}`;
		mdLines.push(cleanHeading);
		return true;
	}
	function handleList(line, lineStart, pos) {
		const result = detectList(line);
		const indentStr = " ".repeat(result.indent);
		tokens.push(createListToken("list", line, lineStart, pos, result));
		const cleanList = `${indentStr}${result.marker} ${result.content}`;
		mdLines.push(cleanList);
		return true;
	}
	function quoteValueStart(line) {
		return line.startsWith("> ") ? 2 : line.indexOf(">") + 1;
	}
	function emitQuoteSegment(qb) {
		if (!qb.parts.length) return;
		const last = qb.parts[qb.parts.length - 1];
		const text = qb.parts.map((p) => p.content).join("\n");
		tokens.push(createToken("blockquote", [qb.segStart, qb.end], text, last.attrs, calcAttrsRange(last.line, last.attrs, last.lineStart), [qb.segValueStart, qb.valueEnd]));
		qb.parts = [];
		qb.segStart = null;
	}
	function handleBlockquote(line, lineStart, pos) {
		const result = detectBlockquote(line);
		const valueStartInLine = quoteValueStart(line);
		quoteBlock = {
			segStart: lineStart,
			segValueStart: lineStart + valueStartInLine,
			end: pos - 1,
			valueEnd: lineStart + valueStartInLine + result.content.length,
			parts: [{
				content: result.content,
				attrs: result.attrs,
				line,
				lineStart,
				valueStartInLine
			}]
		};
		mdLines.push(`> ${result.content}`);
		if (result.attrs) emitQuoteSegment(quoteBlock);
		return true;
	}
	function flushQuoteBlock() {
		if (!quoteBlock) return;
		emitQuoteSegment(quoteBlock);
		quoteBlock = null;
	}
	function handleQuoteContent(line, lineStart, pos) {
		const bq = detectBlockquote(line);
		if (bq) {
			const valueStartInLine = quoteValueStart(line);
			const qb = quoteBlock;
			if (!qb.parts.length) {
				qb.segStart = lineStart;
				qb.segValueStart = lineStart + valueStartInLine;
			}
			qb.parts.push({
				content: bq.content,
				attrs: bq.attrs,
				line,
				lineStart,
				valueStartInLine
			});
			qb.end = pos - 1;
			qb.valueEnd = lineStart + valueStartInLine + bq.content.length;
			mdLines.push(`> ${bq.content}`);
			if (bq.attrs) emitQuoteSegment(qb);
			return true;
		}
		flushQuoteBlock();
		return false;
	}
	function handlePara(line, lineStart, pos) {
		const leadingWhitespace = line.search(/\S/);
		const valueStart = leadingWhitespace === -1 ? lineStart : lineStart + leadingWhitespace;
		const trimmed = line.trim();
		const valueEnd = valueStart + trimmed.length;
		tokens.push(createToken("para", [lineStart, pos - 1], trimmed, null, null, [valueStart, valueEnd]));
		let cleanPara = line;
		const codeSpans = [];
		cleanPara = cleanPara.replace(/`[^`]+`/g, (match) => {
			codeSpans.push(match);
			return `__INLINE_CODE_${codeSpans.length - 1}__`;
		});
		const mustaches = [];
		cleanPara = cleanPara.replace(/\{\{(?:[^{}]|\{[^{}]*\})*\}\}/g, (match) => {
			mustaches.push(match);
			return `__VUE_INTERPOLATION_${mustaches.length - 1}__`;
		});
		const carriers = scanInlineCarriers(cleanPara, 0);
		for (let i = carriers.length - 1; i >= 0; i--) {
			const carrier = carriers[i];
			if (carrier.attrs && (carrier.type === "emphasis" || carrier.type === "code")) {
				const before = cleanPara.substring(0, carrier.range[0]);
				const after = cleanPara.substring(carrier.range[1]);
				cleanPara = before + (carrier.text || "") + after;
			}
		}
		cleanPara = cleanPara.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, "$1");
		cleanPara = cleanPara.replace(/([^{]|^)\{[^{}]+\}(?=[^}]|$)/g, "$1");
		cleanPara = cleanPara.replace(/__VUE_INTERPOLATION_(\d+)__/g, (_, idx) => mustaches[Number(idx)]);
		cleanPara = cleanPara.replace(/__INLINE_CODE_(\d+)__/g, (_, idx) => codeSpans[Number(idx)]);
		const trailingSpaces = cleanPara.match(/ {2,}$/);
		if (trailingSpaces) cleanPara = cleanPara.replace(/[ \t]+$/, trailingSpaces[0]);
		else cleanPara = cleanPara.replace(/[ \t]+$/, "");
		mdLines.push(cleanPara);
		return true;
	}
	function handleStandaloneSubject(line, lineStart, pos) {
		tokens.push({
			type: "standalone",
			text: line.trim(),
			range: [lineStart, pos - 1]
		});
		return true;
	}
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineStart = pos;
		pos += line.length + 1;
		for (const processor of PROCESSORS) if (processor.test(line) && processor.process(line, lineStart, pos)) break;
	}
	flushQuoteBlock();
	return {
		tokens,
		md: mdLines.join("\n")
	};
}
function extractInlineCarriers(text, baseOffset = 0) {
	return scanInlineCarriers(text, baseOffset);
}
function createBlockEntry(token, state) {
	const blockId = token._blockId || hash(`${token.type}:${token.range?.[0]}:${token.range?.[1]}`);
	token._blockId = blockId;
	const carriers = getCarriers(token);
	const cleanText = extractCleanText(token);
	const blockStart = token.range[0];
	const blockEnd = token.range[1];
	let prevSpanId = null;
	if (state.lastBlockId !== null) {
		const spanStart = state.lastBlockEnd;
		const spanEnd = blockStart;
		if (spanEnd > spanStart) {
			const spanId = hash(`span:${spanStart}:${spanEnd}`);
			const span = {
				id: spanId,
				range: [spanStart, spanEnd],
				prevBlockId: state.lastBlockId,
				nextBlockId: blockId,
				prevSpanId: state.lastSpanId || null,
				nextSpanId: null,
				byteLength: spanEnd - spanStart
			};
			state.origin.spans.set(spanId, span);
			if (state.lastSpanId) {
				const prevSpan = state.origin.spans.get(state.lastSpanId);
				if (prevSpan) prevSpan.nextSpanId = spanId;
			}
			const prevBlock = state.origin.blocks.get(state.lastBlockId);
			if (prevBlock) prevBlock.nextSpanId = spanId;
			state.lastSpanId = spanId;
			prevSpanId = spanId;
		}
	}
	state.lastBlockEnd = blockEnd;
	state.lastBlockId = blockId;
	const blockEntry = {
		id: blockId,
		type: token.type,
		range: token.range,
		text: cleanText,
		subject: null,
		types: [],
		predicates: [],
		carriers: [],
		listLevel: token.indent || 0,
		parentBlockId: state.blockStack.length > 0 ? state.blockStack[state.blockStack.length - 1] : null,
		quadKeys: [],
		prevSpanId,
		nextSpanId: null
	};
	for (const carrier of carriers) {
		const carrierInfo = {
			type: carrier.type,
			range: carrier.range,
			text: carrier.text,
			subject: null,
			predicates: [],
			sem: null
		};
		if (carrier.attrs) {
			const carrierSem = parseSemCached(carrier.attrs);
			carrierInfo.sem = carrierSem;
			carrierInfo.predicates = carrierSem.predicates || [];
			carrierInfo.subject = carrierSem.subject;
			carrierInfo.types = carrierSem.types || [];
		}
		blockEntry.carriers.push(carrierInfo);
	}
	state.origin.blocks.set(blockId, blockEntry);
	state.origin.documentStructure.push(blockEntry);
	return blockEntry;
}
function enrichBlockFromAnnotation(blockEntry, sem, carrier, state) {
	if (sem.subject && sem.subject !== "RESET") {
		const resolvedSubject = resolveSubject(sem, state);
		if (resolvedSubject) blockEntry.subject = resolvedSubject.value;
	}
	if (sem.types && sem.types.length > 0) sem.types.forEach((t) => {
		const expanded = expandIRI(typeof t === "string" ? t : t.iri, state.ctx);
		if (!blockEntry.types.includes(expanded)) blockEntry.types.push(expanded);
	});
	if (sem.predicates && sem.predicates.length > 0) sem.predicates.forEach((pred) => {
		const expandedPred = {
			iri: expandIRI(pred.iri, state.ctx),
			form: pred.form || "",
			object: null
		};
		blockEntry.predicates.push(expandedPred);
	});
	if (carrier) {
		const carrierInfo = {
			type: carrier.type,
			range: carrier.range,
			text: carrier.text,
			subject: null,
			predicates: []
		};
		if (carrier.attrs) {
			const carrierSem = parseSemCached(carrier.attrs);
			carrierInfo.sem = carrierSem;
			carrierInfo.predicates = carrierSem.predicates || [];
			carrierInfo.subject = carrierSem.subject;
			carrierInfo.types = carrierSem.types || [];
		}
		blockEntry.carriers.push(carrierInfo);
	}
}
function processAnnotationWithBlockTracking(carrier, sem, state, options = {}) {
	const { preserveGlobalSubject = false, implicitSubject = null } = options;
	if (sem.subject === "RESET") {
		state.currentSubject = null;
		return;
	}
	const previousSubject = state.currentSubject;
	const newSubject = resolveSubject(sem, state);
	const localObject = resolveObject(sem, state);
	if (newSubject && !state.primarySubject && !sem.subject.startsWith("=#")) state.primarySubject = newSubject.value;
	if (newSubject && !preserveGlobalSubject && !implicitSubject) state.currentSubject = newSubject;
	const S = preserveGlobalSubject ? newSubject || previousSubject : implicitSubject || state.currentSubject;
	if (!S) return;
	const block = createBlock(S.value, sem.types, sem.predicates, carrier.range, carrier.attrsRange || null, carrier.valueRange || null, carrier.type || null, state.ctx, carrier.text);
	const L = createLiteral(carrier.text, sem.datatype, sem.language, state.ctx, state.df);
	const carrierO = carrier.url ? state.df.namedNode(expandIRI(carrier.url, state.ctx)) : null;
	const newSubjectOrCarrierO = newSubject || carrierO;
	if (state.currentBlock) enrichBlockFromAnnotation(state.currentBlock, sem, carrier, state);
	processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier);
	processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier);
}
function createBlock(subject, types, predicates, range, attrsRange, valueRange, carrierType, ctx, text) {
	const expanded = {
		subject,
		types: types.map((t) => expandIRI(typeof t === "string" ? t : t.iri, ctx)),
		predicates: predicates.map((p) => ({
			iri: expandIRI(p.iri, ctx),
			form: p.form
		}))
	};
	return {
		id: hash([
			subject,
			carrierType || "unknown",
			expanded.types.join(","),
			expanded.predicates.map((p) => `${p.form}${p.iri}`).join(",")
		].join("|")),
		range: {
			start: range[0],
			end: range[1]
		},
		valueRange: valueRange ? {
			start: valueRange[0],
			end: valueRange[1]
		} : null,
		carrierType: carrierType || null,
		subject,
		types: expanded.types,
		predicates: expanded.predicates,
		context: ctx,
		text: text || ""
	};
}
/**
* Hardened O(1) quad emitter.
* Uses state.quadBuffer (Map) as single source of truth during parsing.
*/
function emitQuad(state, block, subject, predicate, object, meta = null) {
	if (!subject || !predicate || !object) return;
	const quadKey = quadIndexKey(subject, predicate, object);
	if (Boolean(meta?.remove)) {
		if (state.quadBuffer.has(quadKey)) {
			state.quadBuffer.delete(quadKey);
			state.origin.quadIndex.delete(quadKey);
		} else {
			const retractQuad = state.df.quad(subject, predicate, object, state.graph);
			state.removeSet.add(retractQuad);
		}
		return;
	}
	const quad = state.df.quad(subject, predicate, object, state.graph);
	state.quadBuffer.set(quadKey, quad);
	const predVal = predicate.value;
	if (!state.primaryType && predVal === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") state.primaryType = object.value;
	else if (!state.primaryLabel && predVal === "http://www.w3.org/2000/01/rdf-schema#label" && object.termType === "Literal") state.primaryLabel = object.value;
	else if (!state.primaryComment && predVal === "http://www.w3.org/2000/01/rdf-schema#comment" && object.termType === "Literal") state.primaryComment = object.value;
	if (state.statements && state.statementCandidates) detectStatementPatternSinglePass(quad, state.df, meta, state.statements, state.statementCandidates);
	const originEntry = createLeanOriginEntry(block, subject, predicate, meta);
	state.origin.quadIndex.set(quadKey, originEntry);
	if (block && state.currentBlock && block.id === state.currentBlock.id) {
		if (!state.currentBlock.quadKeys) state.currentBlock.quadKeys = [];
		state.currentBlock.quadKeys.push(quadKey);
	}
}
function detectStatementPatternSinglePass(quad, dataFactory, meta, statements = null, statementCandidates = null) {
	if (!statements || !statementCandidates) return;
	const predicate = quad.predicate.value;
	if (predicate !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && predicate !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject" && predicate !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate" && predicate !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#object") return;
	if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && quad.object.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement") {
		statementCandidates.set(quad.subject.value, { spo: {} });
		return;
	}
	const candidate = statementCandidates.get(quad.subject.value);
	if (!candidate) return;
	if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject") candidate.spo.subject = quad.object;
	else if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate") candidate.spo.predicate = quad.object;
	else if (predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#object") {
		candidate.spo.object = quad.object;
		candidate.objectQuad = quad;
	}
	if (candidate.spo.subject && candidate.spo.predicate && candidate.spo.object) {
		const spoQuad = dataFactory.quad(candidate.spo.subject, candidate.spo.predicate, candidate.spo.object);
		statements.push(spoQuad);
		statementCandidates.delete(quad.subject.value);
	}
}
var createTypeQuad = (typeIRI, subject, state, block, entryIndex = null) => {
	const expandedType = expandIRI(typeIRI, state.ctx);
	const typeInfo = typeof entryIndex === "object" ? entryIndex : {
		entryIndex,
		remove: false
	};
	emitQuad(state, block, subject, state.df.namedNode(expandIRI("rdf:type", state.ctx)), state.df.namedNode(expandedType), {
		kind: "type",
		token: `.${typeIRI}`,
		expandedType,
		entryIndex: typeInfo.entryIndex,
		remove: typeInfo.remove
	});
};
function processTypeAnnotations(sem, newSubject, localObject, carrierO, S, block, state, carrier) {
	sem.types.forEach((t) => {
		createTypeQuad(typeof t === "string" ? t : t.iri, newSubject || localObject || carrierO || S, state, block, typeof t === "string" ? {
			entryIndex: null,
			remove: false
		} : t);
	});
}
var determinePredicateRole = (pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L) => {
	if (pred.form === "" && carrier?.type === "link" && carrier?.url && carrier.text === carrier.url) return null;
	switch (pred.form) {
		case "": return newSubject ? {
			subject: localObject || S,
			object: L
		} : carrier?.type === "link" && carrier?.url && carrier.text !== carrier.url ? {
			subject: newSubjectOrCarrierO,
			object: L
		} : {
			subject: localObject || S,
			object: L
		};
		case "?": return {
			subject: newSubject ? previousSubject : S,
			object: localObject || newSubjectOrCarrierO
		};
		case "!": return {
			subject: localObject || newSubjectOrCarrierO,
			object: newSubject ? previousSubject : S
		};
		default: return null;
	}
};
function processPredicateAnnotations(sem, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L, block, state, carrier) {
	sem.predicates.forEach((pred) => {
		const role = determinePredicateRole(pred, carrier, newSubject, previousSubject, localObject, newSubjectOrCarrierO, S, L);
		if (role) {
			const P = state.df.namedNode(expandIRI(pred.iri, state.ctx));
			emitQuad(state, block, role.subject, P, role.object, {
				kind: "pred",
				token: `${pred.form}${pred.iri}`,
				form: pred.form,
				expandedPredicate: P.value,
				entryIndex: pred.entryIndex,
				remove: pred.remove || false
			});
		}
	});
}
function processAnnotation(carrier, sem, state, options = {}) {
	processAnnotationWithBlockTracking(carrier, sem, state, options);
}
function processTokenAnnotations(token, state, tokenType) {
	if (token.attrs) {
		const sem = parseSemCached(token.attrs);
		processAnnotation({
			type: tokenType,
			text: token.text,
			range: token.range,
			attrsRange: token.attrsRange || null,
			valueRange: token.valueRange || null
		}, sem, state);
	}
	getCarriers(token).forEach((carrier) => {
		if (carrier.attrs) processAnnotation(carrier, parseSemCached(carrier.attrs), state);
	});
}
function processStandaloneSubject(token, state) {
	const result = detectStandaloneSubject(token.text);
	if (!result) return;
	const sem = parseSemCached(`{=${result.content}}`);
	const attrsStart = token.range[0] + token.text.indexOf("{=");
	const fullAttrLength = 3 + (result.content ? result.content.length : 0);
	processAnnotation({
		type: "standalone",
		text: "",
		range: token.range,
		attrsRange: [attrsStart, attrsStart + fullAttrLength],
		valueRange: null
	}, sem, state);
}
var TOKEN_PROCESSORS = {
	heading: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
	code: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
	blockquote: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
	para: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry, [processStandaloneSubject]),
	list: (token, state) => processTokenWithBlockTracking(token, state, processTokenAnnotations, createBlockEntry),
	standalone: (token, state) => processStandaloneSubject(token, state)
};
// src/merge.js
/**
* Creates a unique key for quad identity matching - using shared utility
* @param {Quad} quad 
* @returns {string}
*/
function quadKey$1(quad) {
	return quadToKeyForOrigin(quad);
}
/**
* Normalizes merge input to ParseResult format
* @param {string|ParseResult} input 
* @param {Object} options
* @param {Object} docContext
* @returns {ParseResult}
*/
function normalizeInput(input, options, docContext) {
	if (typeof input === "string") return parse({
		text: input,
		...options,
		context: {
			...docContext,
			...options.context
		}
	});
	return input;
}
/**
* Merges multiple MDLD documents with diff polarity resolution
* @param {Array<string|ParseResult>} docs
* @param {Object} options
* @returns {Object} Merge result with quads, remove, statements, origin, and context
*/
function merge(docs, options = {}) {
	const sessionBuffer = /* @__PURE__ */ new Map();
	const sessionRemoveSet = /* @__PURE__ */ new Set();
	const allDocuments = [];
	const quadIndex = /* @__PURE__ */ new Map();
	const allStatements = [];
	const accumulatedContext = /* @__PURE__ */ new Map();
	const primaryObjects = [];
	const primarySubjects = [];
	for (let i = 0; i < docs.length; i++) {
		const input = docs[i];
		const doc = normalizeInput(input, options, {
			...DEFAULT_CONTEXT,
			...options.context
		});
		if (doc.context) {
			for (const [prefix, namespace] of Object.entries(doc.context)) if (!accumulatedContext.has(prefix) && !DEFAULT_CONTEXT[prefix]) accumulatedContext.set(prefix, namespace);
		}
		const documentOrigin = {
			index: i,
			input: typeof input === "string" ? "string" : "ParseResult",
			origin: doc.origin,
			context: doc.context,
			statementsCount: doc.statements?.length || 0
		};
		allDocuments.push(documentOrigin);
		if (doc.statements && doc.statements.length > 0) allStatements.push(...doc.statements);
		if (doc.primary && (doc.primary.subject || doc.primary.type || doc.primary.label)) primaryObjects.push(doc.primary);
		if (doc.primarySubject) primarySubjects.push(doc.primarySubject);
		for (const quad of doc.quads) {
			const key = quadKey$1(quad);
			sessionBuffer.set(key, quad);
			const existingOrigin = doc.origin.quadIndex.get(key);
			quadIndex.set(key, {
				...existingOrigin || {},
				documentIndex: i,
				polarity: "+"
			});
		}
		for (const quad of doc.remove) {
			const key = quadKey$1(quad);
			if (sessionBuffer.has(key)) sessionBuffer.delete(key);
			else sessionRemoveSet.add(quad);
			const existingOrigin = doc.origin.quadIndex.get(key);
			quadIndex.set(key, {
				...existingOrigin || {},
				documentIndex: i,
				polarity: "-"
			});
		}
	}
	const finalQuads = Array.from(sessionBuffer.values());
	const finalRemove = Array.from(sessionRemoveSet);
	const mergeOrigin = {
		documents: allDocuments,
		quadIndex
	};
	const finalContext = {
		...DEFAULT_CONTEXT,
		...options.context,
		...Object.fromEntries(accumulatedContext)
	};
	const quadKeys = new Set(finalQuads.map(quadKey$1));
	const removeKeys = new Set(finalRemove.map(quadKey$1));
	return {
		quads: finalQuads.filter((quad) => !removeKeys.has(quadKey$1(quad))),
		remove: finalRemove.filter((quad) => !quadKeys.has(quadKey$1(quad))),
		statements: allStatements,
		origin: mergeOrigin,
		context: finalContext,
		primarySubjects,
		primary: primaryObjects
	};
}
// src/generate.js
var cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var iriCache = /* @__PURE__ */ new Map();
var CACHE_SIZE_LIMIT = 1e3;
function literalDatatype(term) {
	return term?.datatype?.value || term?.datatype || "";
}
function literalKey(term) {
	return JSON.stringify([
		term?.value ?? "",
		term?.language || "",
		literalDatatype(term)
	]);
}
function getCachedShortIRI(iri, context) {
	const cacheKey = `${iri}|${JSON.stringify(context)}`;
	if (iriCache.has(cacheKey)) return iriCache.get(cacheKey);
	const result = shortenIRI(iri, context);
	if (iriCache.size >= CACHE_SIZE_LIMIT) Array.from(iriCache.keys()).slice(0, Math.floor(CACHE_SIZE_LIMIT / 2)).forEach((key) => iriCache.delete(key));
	iriCache.set(cacheKey, result);
	return result;
}
function extractLocalName(iri, ctx = {}) {
	if (!iri) return iri;
	for (const [prefix, namespace] of Object.entries(ctx)) if (iri.startsWith(namespace) || iri.startsWith(namespace.slice(0, -1))) return iri.substring(namespace.length);
	for (const sep of [
		"#",
		"/",
		":"
	]) {
		const lastSep = iri.lastIndexOf(sep);
		if (lastSep !== -1 && lastSep < iri.length - 1) return iri.substring(lastSep + 1);
	}
	return iri;
}
/**
* Generate deterministic MDLD from RDF quads
* Purpose: TTL→MDLD conversion with canonical structure
* Input: RDF quads + context + optional primarySubject (string IRI) + compactInline (boolean) + remove (array) + lang (string)
* Output: MDLD text + context + compactStats
*/
function generate({ quads, context = {}, primarySubject = null, compactInline = false, renderReverse = false, remove = [], lang = null }) {
	const fullContext = Object.assign({}, DEFAULT_CONTEXT, context);
	const normalizedQuads = normalizeAndSortQuads(quads);
	const normalizedRemove = normalizeAndSortQuads(remove);
	const { subjectGroups, reverseIndex } = groupQuadsBySubject(normalizedQuads);
	const removeBySubject = groupQuadsBySubject(normalizedRemove).subjectGroups;
	const { text, compactStats } = buildDeterministicMDLD(subjectGroups, fullContext, primarySubject, primarySubject && renderReverse ? reverseIndex : null, compactInline, removeBySubject, lang);
	return {
		text,
		context: fullContext,
		compactStats
	};
}
/**
* Generate node-centric MDLD showing all quads where a specific IRI appears
* in any position: subject, object, predicate, type, or datatype.
* Perfect for exploring individual nodes and their complete relationship graph.
*/
function generateNode({ quads, focusIRI, context = {}, compactInline = true, renderReverse = true, lang = null }) {
	if (!quads?.length || !focusIRI) return {
		text: "",
		context: Object.assign({}, DEFAULT_CONTEXT, context),
		compactStats: null
	};
	const fullContext = Object.assign({}, DEFAULT_CONTEXT, context);
	const normalizedQuads = normalizeAndSortQuads(quads.filter((q) => q.subject.value === focusIRI || q.predicate.value === focusIRI || q.object.value === focusIRI || q.object.termType === "Literal" && q.object.datatype && (q.object.datatype.value || q.object.datatype) === focusIRI));
	const { subjectGroups: nodeGroups, reverseIndex } = groupQuadsBySubject(normalizedQuads);
	const subjectRoots = Array.from(new Set(normalizedQuads.map((q) => q.subject.value)));
	if (subjectRoots.length === 0) return {
		text: "",
		context: fullContext,
		compactStats: null
	};
	const { text, compactStats } = buildDeterministicMDLD(nodeGroups, fullContext, subjectRoots.includes(focusIRI) ? focusIRI : subjectRoots[0], renderReverse ? reverseIndex : null, compactInline, /* @__PURE__ */ new Map(), lang);
	return {
		text,
		context: fullContext,
		compactStats
	};
}
function normalizeAndSortQuads(quads) {
	if (!quads || quads.length === 0) return [];
	return quads.map((quad) => {
		if (quad.subject.termType && quad.predicate.termType && quad.object.termType) return quad;
		return {
			subject: DataFactory.fromTerm(quad.subject),
			predicate: DataFactory.fromTerm(quad.predicate),
			object: DataFactory.fromTerm(quad.object)
		};
	}).sort((a, b) => {
		const sComp = cmp(a.subject.value, b.subject.value);
		if (sComp !== 0) return sComp;
		const pComp = cmp(a.predicate.value, b.predicate.value);
		if (pComp !== 0) return pComp;
		const oComp = cmp(a.object.value, b.object.value);
		if (oComp !== 0) return oComp;
		const tComp = cmp(String(a.object.termType), String(b.object.termType));
		if (tComp !== 0) return tComp;
		const dtA = a.object.datatype?.value ?? a.object.datatype ?? "";
		const dtB = b.object.datatype?.value ?? b.object.datatype ?? "";
		const dtComp = cmp(String(dtA), String(dtB));
		if (dtComp !== 0) return dtComp;
		return cmp(String(a.object.language ?? ""), String(b.object.language ?? ""));
	});
}
function groupQuadsBySubject(quads) {
	const groups = /* @__PURE__ */ new Map();
	const reverseIndex = /* @__PURE__ */ new Map();
	for (const quad of quads) {
		const subjectValue = quad.subject.value;
		const existing = groups.get(subjectValue);
		if (existing) existing.push(quad);
		else groups.set(subjectValue, [quad]);
		if (quad.object.termType === "NamedNode") {
			const objectValue = quad.object.value;
			const reverseList = reverseIndex.get(objectValue);
			if (reverseList) reverseList.push(quad);
			else reverseIndex.set(objectValue, [quad]);
		}
	}
	return {
		subjectGroups: groups,
		reverseIndex
	};
}
function buildDeterministicMDLD(subjectGroups, context, primarySubjectIRI = null, reverseIndex = null, compactInline = true, removeBySubject = /* @__PURE__ */ new Map(), lang = null) {
	const textParts = [];
	const usedPrefixes = collectUsedPrefixes(subjectGroups, context);
	const labelLookup = buildLabelLookup(subjectGroups, lang);
	const compactStats = {
		compactedSubjects: 0,
		skippedHeadings: 0,
		inlineAnnotations: 0
	};
	const renderedQuads = /* @__PURE__ */ new Set();
	const filteredGroups = /* @__PURE__ */ new Map();
	for (const [subjectIRI, quads] of subjectGroups.entries()) filteredGroups.set(subjectIRI, filterQuadsByType(quads));
	const sortedPrefixes = Object.entries(context).sort(([a], [b]) => cmp(a, b));
	for (const [prefix, namespace] of sortedPrefixes) if (prefix !== "@vocab" && !prefix.startsWith("@") && !DEFAULT_CONTEXT[prefix] && usedPrefixes.has(prefix)) textParts.push(generatePrefixDeclaration(prefix, namespace));
	if (sortedPrefixes.length > 0) textParts.push("\n");
	const sortedSubjects = Array.from(subjectGroups.keys()).sort();
	const orderedSubjects = primarySubjectIRI ? [primarySubjectIRI, ...sortedSubjects.filter((s) => s !== primarySubjectIRI)] : sortedSubjects;
	for (const subjectIRI of orderedSubjects) {
		const subjectQuads = subjectGroups.get(subjectIRI);
		if (!subjectQuads) continue;
		if (subjectQuads.every((q) => renderedQuads.has(q))) {
			compactStats.skippedHeadings++;
			compactStats.compactedSubjects++;
			continue;
		}
		const { types, literals, objects } = filteredGroups.get(subjectIRI);
		const shortSubject = getCachedShortIRI(subjectIRI, context);
		const labelEntry = labelLookup.get(subjectIRI);
		const hasLabel = !!labelEntry;
		const displayName = hasLabel ? labelEntry.value : extractLocalName(subjectIRI, context);
		const typesNotRendered = types.filter((t) => !renderedQuads.has(t));
		let annotations = typesNotRendered.length > 0 ? typesNotRendered.map((t) => "." + getCachedShortIRI(t.object.value, context)).sort().join(" ") : "";
		const labelQuad = labelEntry?.quad || null;
		if (hasLabel && (!labelQuad || !renderedQuads.has(labelQuad))) annotations += (annotations ? " " : "") + generateLabelAnnotation(labelEntry, context);
		const annotationStr = annotations ? " " + annotations : "";
		textParts.push(`## ${displayName} {=${shortSubject}${annotationStr}}\n`);
		types.forEach((t) => renderedQuads.add(t));
		if (labelQuad) renderedQuads.add(labelQuad);
		const headingLabelKey = labelEntry?.key || null;
		sortQuadsByPredicate(literals).forEach((quad) => {
			if (quad.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && headingLabelKey && literalKey(quad.object) === headingLabelKey) return;
			textParts.push(generateLiteralText(quad, context));
		});
		sortQuadsByPredicate(objects).forEach((quad) => {
			if (renderedQuads.has(quad)) return;
			textParts.push(generateObjectText(quad, context, labelLookup, filteredGroups, renderedQuads, compactInline, compactStats));
		});
		if (subjectIRI === primarySubjectIRI && reverseIndex && reverseIndex.has(subjectIRI)) {
			const reverseQuads = reverseIndex.get(subjectIRI);
			reverseQuads.sort((a, b) => cmp(a.predicate.value, b.predicate.value));
			for (const quad of reverseQuads) {
				renderedQuads.add(quad);
				const subjectQuads = subjectGroups.get(quad.subject.value);
				const subjectLabelEntry = labelLookup.get(quad.subject.value);
				const subjectLabel = subjectLabelEntry ? subjectLabelEntry.value : extractLocalName(quad.subject.value, context);
				const shortSubject = getCachedShortIRI(quad.subject.value, context);
				const shortPredicate = getCachedShortIRI(quad.predicate.value, context);
				let inlineAnnotation = "";
				if (compactInline && subjectQuads) {
					const { types } = filteredGroups.get(quad.subject.value) || { types: [] };
					const reverseSubjectLabelEntry = labelLookup.get(quad.subject.value);
					const hasLabel = !!reverseSubjectLabelEntry;
					const typeAnnotations = types.length > 0 ? types.map((t) => "." + getCachedShortIRI(t.object.value, context)).sort().join(" ") : "";
					const labelAnnotation = hasLabel ? generateLabelAnnotation(reverseSubjectLabelEntry, context) : "";
					if (typeAnnotations || labelAnnotation) {
						inlineAnnotation = " " + [typeAnnotations, labelAnnotation].filter(Boolean).join(" ");
						compactStats.inlineAnnotations++;
						types.forEach((q) => renderedQuads.add(q));
						const labelQuad = reverseSubjectLabelEntry?.quad || null;
						if (labelQuad) renderedQuads.add(labelQuad);
					}
					if (subjectQuads.every((q) => renderedQuads.has(q))) {
						compactStats.skippedHeadings++;
						compactStats.compactedSubjects++;
					}
				}
				textParts.push(`[${subjectLabel}] {+${shortSubject} !${shortPredicate}${inlineAnnotation}}\n`);
			}
		}
		if (removeBySubject.has(subjectIRI)) {
			const removeQuads = removeBySubject.get(subjectIRI);
			for (const quad of removeQuads) textParts.push(generateRetractionText(quad, context));
			removeBySubject.delete(subjectIRI);
		}
		textParts.push("\n");
	}
	for (const [subjectIRI, removeQuads] of removeBySubject) {
		const shortSubject = getCachedShortIRI(subjectIRI, context);
		const displayName = extractLocalName(subjectIRI, context);
		textParts.push(`### ${displayName} {=${shortSubject}}\n`);
		for (const quad of removeQuads) textParts.push(generateRetractionText(quad, context));
		textParts.push("\n");
	}
	return {
		text: textParts.join(""),
		compactStats
	};
}
function buildLabelLookup(subjectGroups, lang = null) {
	const labelLookup = /* @__PURE__ */ new Map();
	const labelsBySubject = /* @__PURE__ */ new Map();
	for (const subjectQuads of subjectGroups.values()) for (const quad of subjectQuads) if (quad.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && quad.object.termType === "Literal") {
		const subjectIRI = quad.subject.value;
		if (!labelsBySubject.has(subjectIRI)) labelsBySubject.set(subjectIRI, []);
		labelsBySubject.get(subjectIRI).push(quad);
	}
	const selectBestLabel = (candidates) => {
		if (candidates.length === 0) return null;
		candidates.sort((a, b) => {
			const lenDiff = a.object.value.length - b.object.value.length;
			return lenDiff !== 0 ? lenDiff : cmp(a.object.value, b.object.value);
		});
		return candidates[0];
	};
	for (const [subjectIRI, labels] of labelsBySubject) {
		let selectedQuad = null;
		if (lang) selectedQuad = selectBestLabel(labels.filter((q) => q.object.language === lang));
		if (!selectedQuad) selectedQuad = selectBestLabel(labels.filter((q) => !q.object.language));
		if (!selectedQuad) selectedQuad = selectBestLabel(labels.filter((q) => q.object.language === "en"));
		if (!selectedQuad) selectedQuad = selectBestLabel(labels.filter((q) => q.object.language));
		if (selectedQuad) {
			const labelTerm = selectedQuad.object;
			labelLookup.set(subjectIRI, {
				value: labelTerm.value,
				language: labelTerm.language || null,
				datatype: literalDatatype(labelTerm),
				term: labelTerm,
				quad: selectedQuad,
				key: literalKey(labelTerm)
			});
		}
	}
	return labelLookup;
}
// src/render.js
function detectHr(line) {
	return /^(\s*[-*_]\s*){3,}$/.test(line);
}
function isExternalHref(href) {
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}
function isBlockStart(line) {
	return !!(detectFence(line.trim()) || detectPrefix(line) || detectHeading(line) || detectList(line) || detectBlockquote(line) || detectHtmlBlock(line) || detectHr(line) || detectStandaloneSubject(line) || detectIndentedCode(line));
}
function isLazyParagraphContent(content) {
	const t = content.trim();
	if (t === "") return false;
	return !(detectFence(t) || detectHeading(t) || detectHtmlBlock(t) || detectHr(t) || detectStandaloneSubject(t) || detectPrefix(t));
}
var INLINE_HTML_RE = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/g;
var ASCII_PUNCT = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
var NAMED_ENTITIES = Object.assign(Object.create(null), {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: "\xA0",
	copy: "©",
	reg: "®",
	trade: "™",
	hellip: "…",
	mdash: "—",
	ndash: "–",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”",
	laquo: "«",
	raquo: "»",
	times: "×",
	divide: "÷",
	plusmn: "±",
	deg: "°",
	micro: "µ",
	para: "¶",
	sect: "§",
	middot: "·",
	bull: "•",
	dagger: "†",
	Dagger: "‡",
	permil: "‰",
	prime: "′",
	Prime: "″",
	euro: "€",
	pound: "£",
	yen: "¥",
	cent: "¢",
	curren: "¤",
	brvbar: "¦",
	uml: "¨",
	ordf: "ª",
	ordm: "º",
	iexcl: "¡",
	iquest: "¿",
	szlig: "ß",
	shy: "­",
	ensp: " ",
	emsp: " ",
	thinsp: " ",
	zwnj: "‌",
	zwj: "‍",
	lrm: "‎",
	rlm: "‏",
	oline: "‾",
	frasl: "⁄",
	weierp: "℘",
	image: "ℑ",
	real: "ℜ",
	alefsym: "ℵ",
	larr: "←",
	uarr: "↑",
	rarr: "→",
	darr: "↓",
	harr: "↔",
	crarr: "↵",
	lArr: "⇐",
	uArr: "⇑",
	rArr: "⇒",
	dArr: "⇓",
	hArr: "⇔",
	forall: "∀",
	part: "∂",
	exist: "∃",
	empty: "∅",
	nabla: "∇",
	isin: "∈",
	notin: "∉",
	ni: "∋",
	prod: "∏",
	sum: "∑",
	minus: "−",
	lowast: "∗",
	radic: "√",
	prop: "∝",
	infin: "∞",
	ang: "∠",
	and: "∧",
	or: "∨",
	cap: "∩",
	cup: "∪",
	int: "∫",
	there4: "∴",
	sim: "∼",
	cong: "≅",
	asymp: "≈",
	ne: "≠",
	equiv: "≡",
	le: "≤",
	ge: "≥",
	sub: "⊂",
	sup: "⊃",
	nsub: "⊄",
	sube: "⊆",
	supe: "⊇",
	oplus: "⊕",
	otimes: "⊗",
	perp: "⊥",
	sdot: "⋅",
	lceil: "⌈",
	rceil: "⌉",
	lfloor: "⌊",
	rfloor: "⌋",
	lang: "〈",
	rang: "〉",
	loz: "◊",
	spades: "♠",
	clubs: "♣",
	hearts: "♥",
	diams: "♦"
});
function decodeNumericEntity(body) {
	let digits = body.slice(1);
	let radix = 10;
	if (digits[0] === "x" || digits[0] === "X") {
		radix = 16;
		digits = digits.slice(1);
	}
	if (digits === "") return null;
	for (let k = 0; k < digits.length; k++) {
		const c = digits[k];
		if (!(radix === 10 ? c >= "0" && c <= "9" : c >= "0" && c <= "9" || c >= "a" && c <= "f" || c >= "A" && c <= "F")) return null;
	}
	const cp = parseInt(digits, radix);
	if (cp === 0 || cp > 1114111 || cp >= 55296 && cp <= 57343) return "�";
	try {
		return String.fromCodePoint(cp);
	} catch {
		return "�";
	}
}
function decodeInlineText(s) {
	let out = "";
	let i = 0;
	while (i < s.length) {
		const ch = s[i];
		if (ch === "\\" && i + 1 < s.length && ASCII_PUNCT.indexOf(s[i + 1]) !== -1) {
			out += s[i + 1];
			i += 2;
			continue;
		}
		if (ch === "&") {
			const semi = s.indexOf(";", i + 1);
			if (semi !== -1 && semi - i <= 33) {
				const body = s.slice(i + 1, semi);
				const decoded = body[0] === "#" ? decodeNumericEntity(body) : Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : null;
				if (decoded !== null) {
					out += decoded;
					i = semi + 1;
					continue;
				}
			}
			out += "&";
			i++;
			continue;
		}
		out += ch;
		i++;
	}
	return out;
}
function isEscapedAt(s, pos) {
	let n = 0;
	let j = pos - 1;
	while (j >= 0 && s[j] === "\\") {
		n++;
		j--;
	}
	return n % 2 === 1;
}
function applyHardBreaks(escaped) {
	let out = "";
	let i = 0;
	while (i < escaped.length) {
		const nl = escaped.indexOf("\n", i);
		if (nl === -1) {
			out += escaped.slice(i);
			break;
		}
		let contentEnd = nl;
		let hard = false;
		if (escaped[nl - 1] === "\\" && escaped[nl - 2] !== "\\") {
			contentEnd = nl - 1;
			hard = true;
		} else {
			let j = nl;
			while (j > i && escaped[j - 1] === " ") j--;
			if (nl - j >= 2) {
				contentEnd = j;
				hard = true;
			}
		}
		out += escaped.slice(i, contentEnd) + (hard ? "<br />\n" : "\n");
		i = nl + 1;
	}
	return out;
}
function escapeTextPreserveHtml(s) {
	let out = "";
	let last = 0;
	let m;
	INLINE_HTML_RE.lastIndex = 0;
	while (m = INLINE_HTML_RE.exec(s)) {
		if (isEscapedAt(s, m.index)) {
			INLINE_HTML_RE.lastIndex = m.index + 1;
			continue;
		}
		out += applyHardBreaks(escapeHtml$1(decodeInlineText(s.slice(last, m.index)))) + m[0];
		last = m.index + m[0].length;
	}
	return out + applyHardBreaks(escapeHtml$1(decodeInlineText(s.slice(last))));
}
/**
* MD-LD UI Renderer
* 
* Generates clean, semantic HTML for presentation.
* Preserves the raw MD-LD annotation in `data-annotation` for client-side 
* JS/CSS targeting, and resolves the primary IRI into `data-iri`.
*/
function render(src, options = {}) {
	const lines = src.split("\n");
	const context = buildRenderContext(lines, options.context);
	function safeExpand(term) {
		if (!term || term === "RESET") return null;
		if (term.startsWith("=#") || term.startsWith("#")) return term;
		return expandIRI(term, context);
	}
	function getAttrs(rawAnnotation, parsedSem, isLink = false, fallbackHref = null) {
		const attrs = [];
		const classes = [];
		if (rawAnnotation) attrs.push(`data-annotation="${escapeHtml$1("{" + rawAnnotation + "}")}"`);
		let iri = null;
		if (parsedSem?.subject && parsedSem.subject !== "RESET") iri = safeExpand(parsedSem.subject);
		else if (parsedSem?.object) iri = safeExpand(parsedSem.object);
		if (iri) attrs.push(`data-iri="${escapeHtml$1(iri)}"`);
		if (isLink && fallbackHref) attrs.push(`href="${escapeHtml$1(fallbackHref)}"`);
		if (parsedSem?.types?.some((t) => !t.remove)) classes.push("typed");
		if (parsedSem?.predicates?.some((p) => p.remove) || parsedSem?.types?.some((t) => t.remove)) classes.push("retracted");
		if (classes.length > 0) attrs.unshift(`class="${classes.join(" ")}"`);
		return attrs.join(" ");
	}
	function mergeClasses(baseClass, customAttrs) {
		const classMatch = customAttrs.match(/class="([^"]*)"/);
		let finalClass = baseClass;
		let remainingAttrs = customAttrs;
		if (classMatch) {
			finalClass += " " + classMatch[1];
			remainingAttrs = customAttrs.replace(/class="[^"]*"/, "").trim();
		}
		return `class="${finalClass}"${remainingAttrs ? " " + remainingAttrs : ""}`;
	}
	function renderInline(text) {
		text = text.replace(/<!--[\s\S]*?-->/g, "");
		const carriers = scanInlineCarriers(text, 0);
		if (carriers.length === 0) return escapeTextPreserveHtml(text);
		let out = "";
		let lastPos = 0;
		for (const c of carriers) {
			if (c.range[0] > lastPos) out += escapeTextPreserveHtml(text.slice(lastPos, c.range[0]));
			const sem = c.attrs ? parseSemanticBlock(c.attrs) : null;
			const raw = c.attrs || "";
			const isLink = c.type === "link";
			const fallbackHref = c.url || null;
			const titleAttr = c.title ? ` title="${escapeHtml$1(c.title)}"` : "";
			if (c.type === "image") {
				const alt = escapeHtml$1(c.text);
				const src = escapeHtml$1(c.url);
				const attrString = mergeClasses("mdld-image", getAttrs(raw, sem, false, null));
				out += `<img src="${src}" alt="${alt}" ${attrString}${titleAttr} />`;
			} else {
				let tag = "span";
				let baseClass = "mdld-bracket";
				if (c.type === "link") {
					tag = "a";
					baseClass = "mdld-link";
				} else if (c.type === "code") {
					tag = "code";
					baseClass = "mdld-code";
				} else if (c.type === "strong") {
					tag = "strong";
					baseClass = "mdld-bold";
				} else if (c.type === "emphasis") {
					tag = "em";
					baseClass = "mdld-italic";
				}
				const customAttrs = getAttrs(raw, sem, isLink, fallbackHref);
				const attrString = mergeClasses(baseClass, isLink && fallbackHref && isExternalHref(fallbackHref) ? customAttrs + " target=\"_blank\" rel=\"noopener noreferrer\"" : customAttrs);
				const inner = c.type === "code" ? escapeHtml$1(c.text) : renderInline(c.text);
				out += `<${tag} ${attrString}${titleAttr}>${inner}</${tag}>`;
			}
			lastPos = c.range[1];
		}
		if (lastPos < text.length) out += escapeTextPreserveHtml(text.slice(lastPos));
		return out;
	}
	const out = [];
	let i = 0;
	let codeBlock = null;
	let inComment = false;
	while (i < lines.length) {
		let line = lines[i];
		if (codeBlock) {
			const trimmedLine = line.trim();
			const fenceRun = matchFenceClose(trimmedLine, codeBlock.fenceChar);
			if (fenceRun && fenceRun.length >= codeBlock.fenceLength && fenceRun.length === trimmedLine.length) {
				const sem = codeBlock.attrs ? parseSemanticBlock(codeBlock.attrs) : null;
				const carrierText = codeBlock.content.join("\n");
				const customAttrs = getAttrs(codeBlock.attrs, sem);
				const attrString = mergeClasses(`mdld-codeblock language-${codeBlock.lang || "text"}`, customAttrs);
				out.push(`<pre><code ${attrString}>${escapeHtml$1(carrierText)}</code></pre>`);
				codeBlock = null;
			} else codeBlock.content.push(line);
			i++;
			continue;
		}
		if (inComment) {
			const endIdx = line.indexOf("-->");
			if (endIdx !== -1) {
				inComment = false;
				line = line.slice(endIdx + 3);
			} else {
				i++;
				continue;
			}
		}
		let processedLine = "";
		let current = line;
		while (true) {
			const startIdx = current.indexOf("<!--");
			if (startIdx === -1) {
				processedLine += current;
				break;
			}
			const endIdx = current.indexOf("-->", startIdx);
			if (endIdx === -1) {
				inComment = true;
				processedLine += current.slice(0, startIdx);
				break;
			}
			processedLine += current.slice(0, startIdx);
			current = current.slice(endIdx + 3);
		}
		line = processedLine;
		if (line.trim() === "") {
			i++;
			continue;
		}
		const fence = detectFence(line.trim());
		if (fence) {
			codeBlock = {
				fenceChar: fence.fenceChar,
				fenceLength: fence.fenceLength,
				lang: fence.lang,
				attrs: fence.attrs,
				content: []
			};
			i++;
			continue;
		}
		const prefix = detectPrefix(line);
		if (prefix) {
			const resolvedIri = context[prefix.prefix];
			out.push(`<div class="mdld-prefix" data-prefix="${prefix.prefix}" data-raw="${escapeHtml$1(prefix.iri)}" data-iri="${escapeHtml$1(resolvedIri)}" style="display:none"></div>`);
			i++;
			continue;
		}
		const heading = detectHeading(line);
		if (heading) {
			const sem = heading.attrs ? parseSemanticBlock(heading.attrs) : null;
			const attrString = mergeClasses("mdld-heading", getAttrs(heading.attrs, sem));
			out.push(`<h${heading.depth} ${attrString}>${renderInline(heading.content)}</h${heading.depth}>`);
			i++;
			continue;
		}
		const list = detectList(line);
		if (list) {
			const isOrdered = /^\s*\d+[.)]\s/.test(line);
			const listTag = isOrdered ? "ol" : "ul";
			const sameMarker = (m) => isOrdered ? m.marker[m.marker.length - 1] === list.marker[list.marker.length - 1] : m.marker === list.marker;
			const startNum = isOrdered ? parseInt(list.marker, 10) : 1;
			const startAttr = isOrdered && startNum !== 1 ? ` start="${startNum}"` : "";
			out.push(`<${listTag} class="mdld-list"${startAttr}>`);
			let currentListItemLines = [];
			let currentAttrs = null;
			const processListItem = (content, attrs) => {
				const attrString = mergeClasses("mdld-item", getAttrs(attrs, attrs ? parseSemanticBlock(attrs) : null));
				out.push(`<li ${attrString}>${renderInline(content.join("\n"))}</li>`);
			};
			while (i < lines.length) {
				const l = detectList(lines[i]);
				if (l) {
					const nextIsOrdered = /^\s*\d+[.)]\s/.test(lines[i]);
					if (currentListItemLines.length > 0 && (nextIsOrdered !== isOrdered || !sameMarker(l))) break;
					if (currentListItemLines.length > 0) {
						processListItem(currentListItemLines, currentAttrs);
						currentListItemLines = [];
					}
					currentListItemLines.push(l.content);
					currentAttrs = l.attrs;
					i++;
				} else if (lines[i].trim() === "") {
					let peek = i + 1;
					while (peek < lines.length && lines[peek].trim() === "") peek++;
					if (peek < lines.length) {
						const nextList = detectList(lines[peek]);
						if (nextList) {
							if (/^\s*\d+[.)]\s/.test(lines[peek]) === isOrdered && sameMarker(nextList)) {
								currentListItemLines.push("");
								i = peek;
								continue;
							}
						}
						if (/^\s{2,}/.test(lines[peek]) || /^\t/.test(lines[peek])) {
							currentListItemLines.push("");
							i = peek;
							continue;
						}
					}
					break;
				} else if (/^\s{2,}/.test(lines[i]) || /^\t/.test(lines[i])) {
					currentListItemLines.push(lines[i].replace(/^(\s{2,}|\t)/, ""));
					i++;
				} else break;
			}
			if (currentListItemLines.length > 0) processListItem(currentListItemLines, currentAttrs);
			out.push(`</${listTag}>`);
			continue;
		}
		const blockquote = detectBlockquote(line);
		if (blockquote) {
			let quoteLines = [blockquote.content];
			i++;
			let lazyOk = isLazyParagraphContent(quoteLines[quoteLines.length - 1]);
			while (i < lines.length) {
				const bq = detectBlockquote(lines[i]);
				if (bq) {
					quoteLines.push(bq.attrs ? `${bq.content} {${bq.attrs}}` : bq.content);
					lazyOk = isLazyParagraphContent(bq.content);
					i++;
					continue;
				}
				if (!lazyOk || lines[i].trim() === "" || isBlockStart(lines[i])) break;
				quoteLines.push(lines[i]);
				lazyOk = true;
				i++;
			}
			const sem = blockquote.attrs ? parseSemanticBlock(blockquote.attrs) : null;
			const attrString = mergeClasses("mdld-quote", getAttrs(blockquote.attrs, sem));
			const innerHtml = render(quoteLines.join("\n"), { context });
			out.push(`<blockquote ${attrString}>${innerHtml}</blockquote>`);
			continue;
		}
		const standalone = detectStandaloneSubject(line);
		if (standalone) {
			const fakeSem = parseSemanticBlock(`=${standalone.content}`);
			const attrString = mergeClasses("mdld-standalone", getAttrs(`=${standalone.content}`, fakeSem));
			out.push(`<div ${attrString} style="display:none"></div>`);
			i++;
			continue;
		}
		if (detectHr(line)) {
			out.push(`<hr class="mdld-hr" />`);
			i++;
			continue;
		}
		const htmlBlock = detectHtmlBlock(line);
		if (htmlBlock) {
			const blockLines = [line];
			i++;
			if (htmlBlock.closeTag) {
				const needle = htmlBlock.closeTag.toLowerCase();
				while (i < lines.length) {
					blockLines.push(lines[i]);
					const done = lines[i].toLowerCase().includes(needle);
					i++;
					if (done) break;
				}
			} else while (i < lines.length && lines[i].trim() !== "") {
				blockLines.push(lines[i]);
				i++;
			}
			out.push(blockLines.join("\n"));
			continue;
		}
		if (detectIndentedCode(line)) {
			const codeLines = [];
			while (i < lines.length) {
				const l = lines[i];
				if (l.trim() === "") {
					codeLines.push("");
					i++;
					continue;
				}
				const ind = detectIndentedCode(l);
				if (!ind) break;
				codeLines.push(l.slice(ind.indent.length));
				i++;
			}
			while (codeLines.length > 0 && codeLines[codeLines.length - 1] === "") codeLines.pop();
			out.push(`<pre><code class="mdld-codeblock language-text">${escapeHtml$1(codeLines.join("\n"))}</code></pre>`);
			continue;
		}
		let paraLines = [line];
		i++;
		while (i < lines.length && lines[i].trim() !== "" && !detectFence(lines[i].trim()) && !detectPrefix(lines[i]) && !detectHeading(lines[i]) && !detectList(lines[i]) && !detectBlockquote(lines[i]) && !detectStandaloneSubject(lines[i]) && !detectHr(lines[i]) && !detectHtmlBlock(lines[i], true)) {
			paraLines.push(lines[i]);
			i++;
		}
		const paraText = paraLines.join("\n");
		out.push(`<p class="mdld-paragraph">${renderInline(paraText)}</p>`);
	}
	return out.join("\n");
}
function buildRenderContext(lines, userContext = {}) {
	const context = {
		...DEFAULT_CONTEXT,
		...userContext
	};
	for (const line of lines) {
		const prefix = detectPrefix(line);
		if (prefix) {
			let iri = prefix.iri;
			if (iri.includes(":")) {
				const colonIndex = iri.indexOf(":");
				const p = iri.substring(0, colonIndex);
				const ref = iri.substring(colonIndex + 1);
				if (context[p] && p !== "@vocab") iri = context[p] + ref;
			}
			context[prefix.prefix] = iri;
		}
	}
	return context;
}
/**
* Reconstruct MD-LD from rendered HTML.
* Pure string scanning over our constrained output format.
* Platform-agnostic: no DOMParser, no browser APIs required.
*/
var MDLD_BLOCK_START_RE = /^<(?:p class="mdld-paragraph"|div class="mdld-prefix"|div class="mdld-standalone"|pre><code class="mdld-codeblock|h[1-6] class="mdld-heading"|blockquote class="mdld-quote"|ul class="mdld-list"|ol class="mdld-list"|hr class="mdld-hr")/;
function deconstruct(html) {
	const blocks = [];
	let pos = 0;
	while (pos < html.length) {
		while (pos < html.length && /\s/.test(html[pos])) pos++;
		if (pos >= html.length) break;
		const nextTagStart = html.indexOf("<", pos);
		if (nextTagStart === -1) break;
		const tagEnd = html.indexOf(">", nextTagStart);
		if (tagEnd === -1) break;
		const openTag = html.slice(nextTagStart, tagEnd + 1);
		if (openTag.startsWith("<p") && extractAttr(openTag, "class")?.includes("mdld-paragraph")) {
			const close = html.indexOf("</p>", pos);
			if (close === -1) break;
			const openEnd = html.indexOf(">", pos) + 1;
			const content = html.slice(openEnd, close);
			blocks.push(deconstructInline(content));
			pos = close + 4;
		} else if (openTag.startsWith("<div") && extractAttr(openTag, "class")?.includes("mdld-prefix")) {
			const end = html.indexOf("></div>", pos);
			if (end === -1) break;
			const tag = html.slice(pos, end + 7);
			const prefix = extractAttr(tag, "data-prefix");
			const raw = extractAttr(tag, "data-raw") || extractAttr(tag, "data-iri");
			blocks.push(`[${prefix}] <${raw}>`);
			pos = end + 7;
		} else if (openTag.startsWith("<div") && extractAttr(openTag, "class")?.includes("mdld-standalone")) {
			const end = html.indexOf("</div>", pos);
			if (end === -1) break;
			const ann = extractAttr(html.slice(pos, end + 6), "data-annotation");
			if (ann) blocks.push(ann);
			pos = end + 6;
		} else if (html.startsWith("<pre><code", pos)) {
			const preClose = html.indexOf(">", pos) + 1;
			const codeOpenEnd = html.indexOf(">", preClose) + 1;
			const codeTag = html.slice(preClose, codeOpenEnd);
			if (!extractAttr(codeTag, "class")?.includes("mdld-codeblock")) {
				pos = nextTagStart + 1;
				continue;
			}
			const closePre = html.indexOf("</code></pre>", pos);
			if (closePre === -1) break;
			const full = html.slice(pos, closePre + 13);
			const content = full.slice(codeOpenEnd - pos, full.length - 13);
			const langMatch = (extractAttr(codeTag, "class") || "").match(/language-(\w+)/);
			const lang = langMatch ? langMatch[1] : "";
			const ann = extractAttr(codeTag, "data-annotation");
			blocks.push(`\`\`\`${lang}${ann ? " " + ann : ""}\n${unescapeHtml(content)}\n\`\`\``);
			pos = closePre + 13;
		} else if (html[pos] === "<" && /^<h[1-6]/.test(html.slice(pos, pos + 4)) && extractAttr(openTag, "class")?.includes("mdld-heading")) {
			const level = html[pos + 2];
			const closeTag = `</h${level}>`;
			const close = html.indexOf(closeTag, pos);
			if (close === -1) break;
			const full = html.slice(pos, close + closeTag.length);
			const openEnd = full.indexOf(">") + 1;
			const openTag = full.slice(0, openEnd);
			const content = full.slice(openEnd, full.length - closeTag.length);
			const hashes = "#".repeat(parseInt(level));
			const ann = extractAttr(openTag, "data-annotation");
			blocks.push(`${hashes} ${deconstructInline(content)}${ann ? " " + ann : ""}`);
			pos = close + closeTag.length;
		} else if (html.startsWith("<blockquote", pos) && extractAttr(openTag, "class")?.includes("mdld-quote")) {
			const close = html.indexOf("</blockquote>", pos);
			if (close === -1) break;
			const full = html.slice(pos, close + 13);
			const openEnd = full.indexOf(">") + 1;
			const openTag = full.slice(0, openEnd);
			const content = full.slice(openEnd, full.length - 13);
			const ann = extractAttr(openTag, "data-annotation");
			const quoted = deconstruct(content).split("\n").map((l) => l.trim() ? `> ${l}` : ">").join("\n");
			blocks.push(ann ? `${quoted} ${ann}` : quoted);
			pos = close + 13;
		} else if ((openTag.startsWith("<ul") || openTag.startsWith("<ol")) && extractAttr(openTag, "class")?.includes("mdld-list")) {
			const isOrdered = openTag.startsWith("<ol");
			const closeTag = isOrdered ? "</ol>" : "</ul>";
			const close = html.indexOf(closeTag, pos);
			if (close === -1) break;
			const openEnd = html.indexOf(">", pos) + 1;
			const inner = html.slice(openEnd, close);
			const items = [];
			let itemPos = 0;
			let counter = isOrdered ? parseInt(extractAttr(openTag, "start") || "1", 10) || 1 : 1;
			while (itemPos < inner.length) {
				const liStart = inner.indexOf("<li", itemPos);
				if (liStart === -1) break;
				const liClose = inner.indexOf("</li>", liStart);
				if (liClose === -1) break;
				const liFull = inner.slice(liStart, liClose + 5);
				const openEnd = liFull.indexOf(">") + 1;
				const openTag = liFull.slice(0, openEnd);
				const liContent = liFull.slice(openEnd, liFull.length - 5);
				const ann = extractAttr(openTag, "data-annotation");
				const lines = deconstructInline(liContent).split("\n");
				const indent = isOrdered ? "   " : "  ";
				const indented = lines.map((l, idx) => idx === 0 ? l : `${indent}${l}`).join("\n");
				const bullet = isOrdered ? `${counter}. ` : "- ";
				items.push(`${bullet}${indented}${ann ? " " + ann : ""}`);
				counter++;
				itemPos = liClose + 5;
			}
			blocks.push(items.join("\n"));
			pos = close + closeTag.length;
		} else if (openTag.startsWith("<hr") && extractAttr(openTag, "class")?.includes("mdld-hr")) {
			blocks.push("---");
			pos = tagEnd + 1;
		} else if (html[pos] === "<" && /^<\/?[A-Za-z]/.test(html.slice(pos, pos + 3))) {
			let end = pos;
			while (end < html.length) {
				const nl = html.indexOf("\n", end);
				const lineEnd = nl === -1 ? html.length : nl;
				const line = html.slice(end, lineEnd);
				if (end !== pos && (line.trim() === "" || MDLD_BLOCK_START_RE.test(line.trimStart()))) break;
				end = nl === -1 ? html.length : nl + 1;
			}
			blocks.push(html.slice(pos, end).trim());
			pos = end;
		} else pos++;
	}
	return blocks.join("\n\n");
}
function mdEscapeText(s) {
	let out = "";
	for (let i = 0; i < s.length; i++) {
		const ch = s[i];
		if (ch === "&") out += "&amp;";
		else if (ch === "<") out += "&lt;";
		else if (ch === "\\" || ch === "`" || ch === "*" || ch === "_" || ch === "[" || ch === "]") out += "\\" + ch;
		else out += ch;
	}
	return out;
}
function deconstructInline(html, inCode = false) {
	let out = "";
	let i = 0;
	while (i < html.length) if (html[i] === "<") {
		const closeGt = html.indexOf(">", i);
		if (closeGt === -1) {
			out += html.slice(i);
			break;
		}
		const tagContent = html.slice(i + 1, closeGt);
		if (tagContent.startsWith("/")) {
			i = closeGt + 1;
			continue;
		}
		const spaceOrEnd = tagContent.search(/[\s/]/);
		const tagName = (spaceOrEnd === -1 ? tagContent : tagContent.slice(0, spaceOrEnd)).toLowerCase();
		const attrs = spaceOrEnd === -1 ? "" : tagContent.slice(spaceOrEnd);
		if (tagContent.endsWith("/")) {
			out += deconstructInlineElement(tagName, attrs, "", inCode);
			i = closeGt + 1;
			continue;
		}
		const closeTag = `</${tagName}>`;
		let depth = 1;
		let j = closeGt + 1;
		let found = false;
		while (j < html.length && depth > 0) {
			let nextOpen = -1;
			let searchIdx = j;
			while (searchIdx < html.length) {
				const idx = html.indexOf(`<${tagName}`, searchIdx);
				if (idx === -1) break;
				const nextChar = html[idx + tagName.length + 1];
				if (nextChar === " " || nextChar === ">" || nextChar === "/" || nextChar === void 0) {
					nextOpen = idx;
					break;
				}
				searchIdx = idx + 1;
			}
			const nextClose = html.indexOf(closeTag, j);
			if (nextClose === -1) break;
			if (nextOpen !== -1 && nextOpen < nextClose) {
				depth++;
				j = nextOpen + 1;
			} else {
				depth--;
				if (depth === 0) {
					const inner = html.slice(closeGt + 1, nextClose);
					out += deconstructInlineElement(tagName, attrs, inner, inCode);
					i = nextClose + closeTag.length;
					found = true;
					break;
				}
				j = nextClose + 1;
			}
		}
		if (!found) {
			out += html[i];
			i++;
		}
	} else {
		const nextTag = html.indexOf("<", i);
		const textEnd = nextTag === -1 ? html.length : nextTag;
		const text = unescapeHtml(html.slice(i, textEnd));
		out += inCode ? text : mdEscapeText(text);
		i = textEnd;
	}
	return out;
}
function deconstructInlineElement(tagName, attrs, inner, inCode = false) {
	const ann = extractAttr(attrs, "data-annotation");
	const content = deconstructInline(inner, inCode || tagName === "code");
	const suffix = ann ? " " + ann : "";
	const title = extractAttr(attrs, "title");
	const titleStr = title ? ` "${title}"` : "";
	switch (tagName) {
		case "a": return `[${content}](${extractAttr(attrs, "href") || ""}${titleStr})${suffix}`;
		case "img": {
			const src = extractAttr(attrs, "src") || "";
			return `![${extractAttr(attrs, "alt") || ""}](${src}${titleStr})${suffix}`;
		}
		case "span": return `[${content}]${suffix}`;
		case "code": return `\`${content}\`${suffix}`;
		case "strong": return `**${content}**${suffix}`;
		case "em": return `*${content}*${suffix}`;
		case "br": return "  " + suffix;
		default: return content + suffix;
	}
}
function extractAttr(tag, name) {
	const re = new RegExp(`(?:\\s|^)${name}=(["'])(.*?)\\1`, "is");
	const m = tag.match(re);
	if (!m) return null;
	return unescapeHtml(m[2]);
}
function unescapeHtml(s) {
	return String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}
// src/highlight.js
/**
* MD-LD Syntax Highlighter
* 
* A performant, token-based syntax highlighter for MD-LD (Markdown Linked Data).
* Uses simple string operations rather than complex grammars for reliability
* and maintainability.
* 
* Features:
* - Token-based parsing with string operations
* - Markdown formatting support with semantic distinction
* - Lookahead detection for legal value carriers
* - Orange semantic markers vs default markdown spans
* - Annotation, value carrier, and heading highlighting
*/
function escapeHtml(s) {
	return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
var TOKEN_COLORS = {
	text: "#6b7280",
	marker: "#f97316",
	retraction: "#dc2626",
	value: "#eab308",
	annotation: "#4b5563"
};
var MARKDOWN_FORMATS = [
	{
		delimiter: "**",
		tag: "strong"
	},
	{
		delimiter: "__",
		tag: "strong"
	},
	{
		delimiter: "*",
		tag: "em"
	},
	{
		delimiter: "_",
		tag: "em"
	},
	{
		delimiter: "`",
		tag: "code"
	}
];
var ANNOTATION_MARKERS = [
	{
		marker: "^^",
		length: 2
	},
	{
		marker: "?",
		length: 1
	},
	{
		marker: "!",
		length: 1
	},
	{
		marker: "@",
		length: 1
	},
	{
		marker: ".",
		length: 1
	}
];
function hasFollowingAnnotation(code, endPos) {
	let i = endPos;
	while (i < code.length && code[i] !== "\n" && code[i] !== "\r") {
		if (code[i] === "{") return true;
		i++;
	}
	return false;
}
function isLineStartOrAfterSpace(code, i) {
	const prevChar = i > 0 ? code[i - 1] : "\n";
	return prevChar === "\n" || prevChar === "\r" || prevChar === " " || prevChar === "	";
}
function renderMarkerSpan(code, i, char) {
	if (!isLineStartOrAfterSpace(code, i) || code[i + 1] !== " ") return null;
	return `<span style="${hasFollowingAnnotation(code, i + 2) ? `color: ${TOKEN_COLORS.marker}; opacity: 0.85` : ""}">${escapeHtml(char)}</span>`;
}
function processMarkdownFormattingAtPosition(code, startPos) {
	for (const { delimiter, tag } of MARKDOWN_FORMATS) {
		if (!code.startsWith(delimiter, startPos)) continue;
		const contentStart = startPos + delimiter.length;
		const endPos = code.indexOf(delimiter, contentStart);
		if (endPos === -1) continue;
		const content = code.slice(contentStart, endPos);
		const color = hasFollowingAnnotation(code, endPos + delimiter.length) ? ` style="color: ${TOKEN_COLORS.marker}"` : "";
		return {
			html: `<span${color}>${delimiter}</span>${tag === "code" ? `<code style="background-color:#7773">${escapeHtml(content)}</code>` : `<${tag}>${escapeHtml(content)}</${tag}>`}<span${color}>${delimiter}</span>`,
			nextIndex: endPos + delimiter.length
		};
	}
	return null;
}
var colorCache = /* @__PURE__ */ new Map();
function hashIRI(iri) {
	let hash = 0;
	for (let i = 0; i < iri.length; i++) {
		const char = iri.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash);
}
function getIRIColor(iri) {
	if (colorCache.has(iri)) return colorCache.get(iri);
	const hash = hashIRI(iri);
	const color = `hsl(${hash % 360}, ${15 + hash % 10}%, ${45 + hash % 10}%)`;
	colorCache.set(iri, color);
	return color;
}
function extractPrefixes(code) {
	const prefixes = /* @__PURE__ */ new Map();
	for (const line of code.split("\n")) {
		const decl = detectPrefix(line);
		if (!decl) continue;
		let iri = decl.iri;
		if (iri.includes(":")) {
			const colonIndex = iri.indexOf(":");
			if (colonIndex > 0) {
				const refPrefix = iri.slice(0, colonIndex);
				const refSuffix = iri.slice(colonIndex + 1);
				if (prefixes.has(refPrefix)) iri = prefixes.get(refPrefix) + refSuffix;
			}
		}
		prefixes.set(decl.prefix, iri);
	}
	for (const [key, iri] of Object.entries(DEFAULT_CONTEXT)) if (key !== "@vocab") prefixes.set(key, iri);
	return prefixes;
}
function renderTerm(part, isRetracted, prefixes) {
	const baseColor = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.text;
	const colonIndex = part.indexOf(":");
	if (colonIndex > 0) {
		const prefix = part.slice(0, colonIndex);
		const local = part.slice(colonIndex + 1);
		if (prefixes.has(prefix)) {
			const prefixIRI = prefixes.get(prefix);
			const prefixColor = getIRIColor(prefixIRI);
			const fullIRI = prefixIRI + local;
			const localColor = getIRIColor(fullIRI);
			return `<span data-iri="${fullIRI}"><span style="color: ${prefixColor}">${escapeHtml(prefix)}</span><span style="color: ${TOKEN_COLORS.marker}">:</span><span  style="color: ${localColor}">${escapeHtml(local)}</span></span> `;
		}
	}
	if (part.startsWith("http:") || part.startsWith("https:") || part.startsWith("tag:") || part.startsWith("urn:")) return `<span style="color: ${getIRIColor(part)}">${escapeHtml(part)}</span> `;
	return `<span style="color: ${baseColor}">${escapeHtml(part)}</span> `;
}
function parseAnnotation(content, prefixes) {
	const parts = content.trim().split(/\s+/);
	let result = "";
	let nextTermIsRetracted = false;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (!part) continue;
		if (part.startsWith("=") || part.startsWith("+")) {
			const marker = part[0];
			const rest = part.slice(1);
			result += `<span style="color: ${TOKEN_COLORS.marker}">${escapeHtml(marker)}</span>${renderTerm(rest, false, prefixes)}`;
			continue;
		}
		if (part === "-") {
			nextTermIsRetracted = true;
			result += `<span style="color: ${TOKEN_COLORS.retraction}">${escapeHtml(part)}</span> `;
			continue;
		}
		if (part.startsWith("-") && part.length > 1) {
			result += `<span style="color: ${TOKEN_COLORS.retraction}">${escapeHtml(part)}</span> `;
			continue;
		}
		const isRetracted = nextTermIsRetracted;
		nextTermIsRetracted = false;
		const markerInfo = ANNOTATION_MARKERS.find((m) => part.startsWith(m.marker));
		if (markerInfo) {
			const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
			result += `<span style="color: ${color}">${escapeHtml(markerInfo.marker)}</span>${renderTerm(part.slice(markerInfo.length), isRetracted, prefixes)}`;
			continue;
		}
		result += renderTerm(part, isRetracted, prefixes);
	}
	return result.trim();
}
function highlight(code) {
	const prefixes = extractPrefixes(code);
	let result = "";
	let i = 0;
	while (i < code.length) {
		const char = code[i];
		if (char === "{") {
			const endIdx = code.indexOf("}", i);
			if (endIdx === -1) {
				result += escapeHtml(char);
				i++;
				continue;
			}
			const parsed = parseAnnotation(code.slice(i + 1, endIdx), prefixes);
			result += `<span class="mdld-annotation"><span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>`;
			result += parsed;
			result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span></span>`;
			i = endIdx + 1;
			continue;
		}
		if (char === "[") {
			const endBracket = code.indexOf("]", i);
			if (endBracket === -1) {
				result += escapeHtml(char);
				i++;
				continue;
			}
			const prefixName = code.slice(i + 1, endBracket);
			let j = endBracket + 1;
			while (j < code.length && /\s/.test(code[j])) j++;
			if (j < code.length && code[j] === "<") {
				const iriEnd = code.indexOf(">", j);
				if (iriEnd !== -1) {
					const iriContent = code.slice(j + 1, iriEnd);
					const prefixColor = prefixes.has(prefixName) ? getIRIColor(prefixes.get(prefixName)) : TOKEN_COLORS.text;
					result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">[</span><span style="color: ${prefixColor}">${escapeHtml(prefixName)}</span><span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">]</span> <span style="color: ${TOKEN_COLORS.text}; opacity: 0.6">&lt;${escapeHtml(iriContent)}&gt;</span>`;
					i = iriEnd + 1;
					continue;
				}
			}
			const content = code.slice(i + 1, endBracket);
			const bracketColor = hasFollowingAnnotation(code, endBracket + 1) ? TOKEN_COLORS.marker : TOKEN_COLORS.value;
			const escapedContent = escapeHtml(content);
			result += `<span style="color: ${bracketColor}; opacity: 0.85">[</span><span style="background-color: ${bracketColor}15">${escapedContent}</span><span style="color: ${bracketColor}; opacity: 0.85">]</span>`;
			i = endBracket + 1;
			continue;
		}
		if (char === "*" || char === "_" || char === "`") {
			const processed = processMarkdownFormattingAtPosition(code, i);
			if (processed) {
				result += processed.html;
				i = processed.nextIndex;
				continue;
			}
		}
		if (char === "#") {
			let hashCount = 0;
			let j = i;
			while (j < code.length && code[j] === "#") {
				hashCount++;
				j++;
			}
			if (hashCount <= 6 && (j >= code.length || code[j] === " " || code[j] === "	")) {
				const lineEnd = code.indexOf("\n", j);
				const endIdx = lineEnd === -1 ? code.length : lineEnd;
				const headerText = code.slice(j, endIdx).trim();
				let processedHeaderText = "";
				let lastIndex = 0;
				let annotationStart = headerText.indexOf("{");
				while (annotationStart !== -1) {
					const annotationEnd = headerText.indexOf("}", annotationStart);
					if (annotationEnd === -1) break;
					const beforeText = headerText.slice(lastIndex, annotationStart);
					processedHeaderText += escapeHtml(beforeText);
					const parsedAnnotation = parseAnnotation(headerText.slice(annotationStart + 1, annotationEnd), prefixes);
					processedHeaderText += `<span class="mdld-annotation"><span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>` + parsedAnnotation + `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span></span>`;
					lastIndex = annotationEnd + 1;
					annotationStart = headerText.indexOf("{", lastIndex);
				}
				processedHeaderText += escapeHtml(headerText.slice(lastIndex));
				const hasAnnotation = headerText.includes("{") && headerText.includes("}");
				const headingTag = `h${hashCount}`;
				const headingStyle = `margin: 0; font-weight: 600;`;
				const hashes = "#".repeat(hashCount);
				const hashColor = hasAnnotation ? `color: ${TOKEN_COLORS.marker}; opacity: 0.8` : "";
				result += `<${headingTag} style="${headingStyle}"><span style="${hashColor}">${hashes}</span> ${processedHeaderText}</${headingTag}>`;
				i = endIdx;
				continue;
			}
		}
		if (char === "-" || char === "*" || char === ">") {
			const markerHtml = renderMarkerSpan(code, i, char);
			if (markerHtml) {
				result += markerHtml;
				i++;
				continue;
			}
		}
		result += escapeHtml(char);
		i++;
	}
	return result;
}
var EditorBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
var EDITOR_CSS = `:host{display:block;position:relative;height:320px;min-height:120px}
.wrap{position:absolute;inset:0}
pre,textarea{position:absolute;inset:0;margin:0;padding:12px;border:0;box-sizing:border-box;overflow:hidden;font:.9em/1.5 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;tab-size:2;white-space:pre-wrap;overflow-wrap:anywhere}
pre{pointer-events:none}
textarea{background:transparent;resize:none;outline:none;color:transparent;caret-color:var(--mdld-caret,#eee);overflow:auto}
pre h1,pre h2,pre h3,pre h4,pre h5,pre h6{display:inline;font-size:inherit;line-height:inherit;margin:0;padding:0;font-weight:inherit}
::placeholder{color:var(--mdld-placeholder,#666)}`;
var MdldEditorImpl = class extends EditorBase {
	static observedAttributes = [
		"value",
		"placeholder",
		"readonly",
		"height"
	];
	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `<style>${EDITOR_CSS}</style><div class="wrap"><pre aria-hidden="true"></pre><textarea spellcheck="false"></textarea></div>`;
		this._ta = root.querySelector("textarea");
		this._pre = root.querySelector("pre");
		this._ta.addEventListener("input", () => this._paint());
		this._ta.addEventListener("scroll", () => {
			this._pre.scrollTop = this._ta.scrollTop;
			this._pre.scrollLeft = this._ta.scrollLeft;
		});
		this._ta.addEventListener("keydown", (e) => {
			if (e.key !== "Tab") return;
			e.preventDefault();
			this._ta.setRangeText("  ", this._ta.selectionStart, this._ta.selectionEnd, "end");
			this._paint();
			this._ta.dispatchEvent(new Event("input", { bubbles: true }));
		});
	}
	connectedCallback() {
		this._paint();
	}
	attributeChangedCallback(name, _, v) {
		if (!this._ta) return;
		if (name === "value") this.value = v ?? "";
		else if (name === "placeholder") this._ta.placeholder = v ?? "";
		else if (name === "readonly") this._ta.readOnly = this.hasAttribute("readonly");
		else if (name === "height") this.style.height = /^\d+$/.test(v) ? v + "px" : v || "";
	}
	get value() {
		return this._ta?.value ?? "";
	}
	set value(v) {
		if (this._ta) {
			this._ta.value = v ?? "";
			this._paint();
		}
	}
	focus() {
		this._ta?.focus();
	}
	_paint() {
		this._pre.innerHTML = highlight(this._ta.value);
		this._pre.scrollTop = this._ta.scrollTop;
		this._pre.scrollLeft = this._ta.scrollLeft;
	}
};
var IS_EDITOR_BROWSER = typeof customElements !== "undefined" && typeof document !== "undefined";
if (IS_EDITOR_BROWSER && !customElements.get("mdld-editor")) customElements.define("mdld-editor", MdldEditorImpl);
var MdldEditor = IS_EDITOR_BROWSER ? MdldEditorImpl : void 0;
// src/graph.js
/**
* <quad-graph> — zero-dependency RDF quad graph renderer (ESM, Canvas2D, ~670 LOC).
*
*   import './quad-graph.js'
*   const element = document.createElement('quad-graph');
*   document.body.appendChild(element);
*   g.context = { ex: 'http://example.org/' }      // optional prefixes (CURIE labels)
*   g.quads   = [...rdfjsQuads]                    // RDF/JS quads; re-assign any time, updates instantly
*
* Attributes: height, charge (repulsion, default 40), link-dist (default 45), labels="off"
* Methods:    focus(iri) select(iri|null) fit() pin(iri,on) reheat() getNode(iri)
* Props:      quads, context, positions ({iri:[x,y]} get/set — persist & restore layouts),
*             persist (bool — save node positions + viewport to localStorage, opt-in)
* Events:     node-click (detail = iri) · node-select (iri|null) · node-hover (iri|null) · settled
* Input:      wheel/pinch zoom, drag background = pan, drag node = move, dblclick node = pin/unpin
* Theming:    labels use the CSS `color` of the element; background is transparent.
*
* Design: typed-array Barnes-Hut quadtree, time-sliced across frames (never blocks > ~8ms),
* degree-aware link lengths/strengths, BFS/phyllotaxis warm start, batched canvas paths with
* viewport culling, density-adaptive alpha, greedy collision-free label placement.
* Limits: < ~1M nodes, < 4096 distinct predicates (dedupe key).
*/
var RDF_TYPE$1 = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
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
var POS_KEY = "qg:positions";
var POS_MAX = 12e3;
var VIEW_KEY = "qg:views";
var VIEW_MAX = 64;
var makeStore = (key, max) => {
	let cache;
	return {
		load() {
			if (cache === void 0) try {
				cache = JSON.parse(localStorage.getItem(key)) || {};
			} catch {
				cache = {};
			}
			return cache;
		},
		flush() {
			try {
				if (cache === void 0) return;
				const ks = Object.keys(cache), n = ks.length - max;
				for (let i = 0; i < n; i++) delete cache[ks[i]];
				localStorage.setItem(key, JSON.stringify(cache));
			} catch {}
		}
	};
};
var posStorage = makeStore(POS_KEY, POS_MAX);
var viewStorage = makeStore(VIEW_KEY, VIEW_MAX);
var posStore = () => posStorage.load();
var viewStore = () => viewStorage.load();
var posFlush = () => posStorage.flush();
var viewFlush = () => viewStorage.flush();
var posHash = (s) => {
	let h1 = 3735928559, h2 = 1103547991;
	for (let i = 0; i < s.length; i++) {
		const ch = s.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
	h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
	return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
};
var quadsKey = (quads) => {
	let sum = 0, xr = 0;
	for (const q of quads) {
		if (!q?.subject || !q?.predicate || !q?.object) continue;
		let h = 2166136261;
		for (const t of [
			q.subject,
			q.predicate,
			q.object,
			q.graph
		]) {
			const s = (t?.termType ?? "") + "\n" + (t?.value ?? "") + "\n" + (t?.datatype?.value ?? t?.language ?? "");
			h ^= 2654435769;
			for (let i = 0; i < s.length; i++) {
				h ^= s.charCodeAt(i);
				h = Math.imul(h, 16777619);
			}
		}
		h = h >>> 0;
		sum = sum + h >>> 0;
		xr = (xr ^ h) >>> 0;
	}
	return sum.toString(36) + "." + xr.toString(36);
};
var hash$1 = (s) => {
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
	/** Hubs get longer links (room for their leaves) and weaker springs (d3-style 1/min(deg)).
	rdf:type edges use normal force for structure but are hidden visually. */
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
.tip b{display:block}.tip small{display:block;opacity:.6}
.graphs{position:absolute;right:8px;top:6px;font:11px/1.2 system-ui,sans-serif;background:#222;border:1px solid #444;border-radius:6px;padding:4px 8px;max-height:200px;overflow-y:auto;max-width:260px;opacity:.9;z-index:3}
.graphs.collapsed{max-width:auto}
.graphs.collapsed .graphs-list{display:none}
.graphs-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-weight:600;color:#aaa}
.graphs-toggle{display:inline-flex;cursor:pointer;color:#aaa}
.graphs-toggle svg{display:block;transition:transform .15s}
.graphs.collapsed .graphs-toggle svg{transform:rotate(-90deg)}
.graphs-item{display:flex;align-items:center;gap:6px;padding:2px 0;cursor:pointer}
.graphs-item:hover{color:#fff}
.graphs-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;flex:1}
.graphs-hidden{opacity:0.4}`;
var QuadGraph = class extends Base {
	static observedAttributes = [
		"height",
		"charge",
		"link-dist",
		"labels"
	];
	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `<style>${CSS}</style><canvas></canvas><div class="hud"><span></span><div class="bar"><i></i></div></div><div class="tip"></div><div class="graphs"><div class="graphs-header"><span>Graphs</span><span class="graphs-toggle"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><div class="graphs-list"></div></div>`;
		this._cv = root.querySelector("canvas");
		this._g2 = this._cv.getContext("2d");
		this._stat = root.querySelector(".hud span");
		this._bar = root.querySelector(".bar i");
		this._tip = root.querySelector(".tip");
		this._graphsPanel = root.querySelector(".graphs");
		this._graphsList = root.querySelector(".graphs-list");
		this._graphsToggle = root.querySelector(".graphs-toggle");
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
		this._hl = [];
		this._he = [];
		this._hn = -1;
		this._ha = .9;
		this._hkey = null;
		this._hforce = false;
		this._fade = 0;
		this._fdim = 0;
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
		this._graphs = [];
		this._edgeGraph = /* @__PURE__ */ new Uint16Array(0);
		this._nodeGraphs = [];
		this._visibleGraphs = /* @__PURE__ */ new Set();
		this._nodeVisible = /* @__PURE__ */ new Uint8Array(0);
		this._pOff = this._pList = this._cOff = this._cList = this._order = this._off = this._adj = /* @__PURE__ */ new Int32Array(0);
		this._bind();
	}
	connectedCallback() {
		this._ro = new ResizeObserver(() => {
			this._roSeen = 1;
			this._resize();
		});
		this._ro.observe(this);
		this._mq = typeof matchMedia !== "undefined" ? matchMedia("(prefers-color-scheme: dark)") : null;
		this._onTheme = () => {
			this._tt = -1e9;
			this._dirty = true;
			this._wake();
		};
		this._mq?.addEventListener("change", this._onTheme);
		this._onHide = () => {
			if (this._persist) {
				this._saveLayout();
				this._saveView();
			}
		};
		addEventListener("pagehide", this._onHide);
		this._resize();
		if (this._quads.length && !this._ids) this._queue();
		this._wake();
	}
	disconnectedCallback() {
		removeEventListener("pagehide", this._onHide);
		if (this._persist) {
			this._saveLayout();
			this._saveView();
		}
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
		this._vkey = void 0;
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
		const graphs = [], graphIdx = /* @__PURE__ */ new Map(), edgeGraph = [], nodeGraphs = [];
		const idOf = (t) => t.termType === "BlankNode" ? "_:" + t.value : t.value;
		const node = (id) => {
			let i = ids.get(id);
			if (i === void 0) {
				i = names.length;
				ids.set(id, i);
				names.push(id);
				litN.push(0);
				typ.push(0);
				nodeGraphs.push(/* @__PURE__ */ new Set());
			}
			return i;
		};
		const graphOf = (g) => g.termType === "DefaultGraph" ? "default" : g.value;
		for (const q of this._quads) {
			if (!q || !q.subject || !q.predicate || !q.object) continue;
			const g = graphOf(q.graph);
			let gi = graphIdx.get(g);
			if (gi === void 0) {
				gi = graphs.length;
				graphIdx.set(g, gi);
				graphs.push(g);
			}
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
			edgeGraph.push(gi);
			nodeGraphs[si].add(gi);
			nodeGraphs[ti].add(gi);
			if (p === RDF_TYPE$1 && o.termType === "NamedNode" && !typ[si]) {
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
			if (i !== void 0 && !typ[i]) typ[i] = c;
		}
		const n = names.length, m = ls.length, LS = Int32Array.from(ls), LT = Int32Array.from(lt), LP = Int32Array.from(lp);
		const isType = new Uint8Array(m);
		for (let e = 0; e < m; e++) if (preds[LP[e]] === RDF_TYPE$1) isType[e] = 1;
		this._visibleGraphs = new Set(graphs.map((_, i) => i));
		this._nodeVisible = new Uint8Array(n);
		for (let i = 0; i < n; i++) {
			this._nodeVisible[i] = 0;
			for (const g of nodeGraphs[i]) if (this._visibleGraphs.has(g)) {
				this._nodeVisible[i] = 1;
				break;
			}
		}
		if (graphs.length > 1) {
			this._graphsPanel.style.display = "";
			this._graphsPanel.classList.remove("collapsed");
			this._graphsList.innerHTML = "";
			graphs.map((_, i) => i).sort((a, b) => graphs[a].localeCompare(graphs[b])).forEach((i) => {
				const g = graphs[i];
				const div = document.createElement("div");
				div.className = "graphs-item";
				div.dataset.idx = i;
				const dot = document.createElement("span");
				dot.textContent = "●";
				dot.style.color = this._visibleGraphs.has(i) ? "#1D9E75" : "#666";
				const name = document.createElement("span");
				name.className = "graphs-name";
				name.textContent = g === "default" ? "default" : this._shortenGraphName(g);
				name.title = g;
				div.append(dot, name);
				div.onclick = () => this._toggleGraph(i);
				this._graphsList.appendChild(div);
			});
		} else this._graphsPanel.style.display = "none";
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
		const old = this._ids, oL = this._L, ox = oL.x, oy = oL.y, opin = oL.pin, seed = this._seed || (this._persist ? this._loadLayout() : null), seedH = !this._seed && this._persist;
		this._seed = null;
		const x = new Float64Array(n), y = new Float64Array(n), placed = new Uint8Array(n), pin = new Uint8Array(n);
		let seeded = 0;
		for (let i = 0; i < n; i++) {
			const s = seed?.[seedH ? posHash(names[i]) : names[i]], j = old?.get(names[i]);
			if (s) {
				x[i] = s[0];
				y[i] = s[1];
				placed[i] = 1;
				if (seedH) seeded++;
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
		this._pc = preds.map((p) => p === RDF_TYPE$1 ? "hsl(220 8% 55%)" : `hsl(${hash$1(p) % 360} 50% 55%)`);
		this._fill = classes.map((c, i) => i ? `hsl(${hash$1(c) % 360} 70% 56%)` : "hsl(215 12% 62%)");
		this._ring = classes.map((c, i) => i ? `hsl(${hash$1(c) % 360} 70% 36%)` : "hsl(215 12% 42%)");
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
			_isType: isType,
			_graphs: graphs,
			_edgeGraph: Uint16Array.from(edgeGraph),
			_nodeGraphs: nodeGraphs,
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
		else if (seeded) L.alpha = .25;
		this._sel = -1;
		this._hov = -1;
		this._hl = [];
		this._he = [];
		this._hn = -1;
		this._ha = .9;
		this._hkey = null;
		this._hforce = false;
		this._fade = 0;
		this._fdim = 0;
		this._tip.style.display = "none";
		if (!hadOld) {
			if (this._persist) {
				if (this._roSeen) {
					this._auto = !this._loadView();
					if (this._auto && n) Object.assign(this._v, this._fitTarget());
				} else this._viewPending = true;
			} else {
				this._auto = true;
				if (n) Object.assign(this._v, this._fitTarget());
			}
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
	_shortenGraphName(iri) {
		const curie = this._curie(iri);
		if (curie !== iri && curie.length <= 30) return curie;
		if (iri.length <= 30) return iri;
		const mid = Math.floor((iri.length - 10) / 2);
		return iri.slice(0, 5) + "..." + iri.slice(-mid - 5);
	}
	_toggleGraph(idx) {
		if (this._visibleGraphs.has(idx)) this._visibleGraphs.delete(idx);
		else this._visibleGraphs.add(idx);
		const n = this._L.n, nv = this._nodeVisible;
		if (!n || !this._nodeGraphs.length) return;
		for (let i = 0; i < n; i++) {
			nv[i] = 0;
			for (const g of this._nodeGraphs[i]) if (this._visibleGraphs.has(g)) {
				nv[i] = 1;
				break;
			}
		}
		this._graphsList.querySelectorAll(".graphs-item").forEach((div) => {
			const i = parseInt(div.dataset.idx, 10);
			const dot = div.querySelector("span:first-child");
			dot.style.color = this._visibleGraphs.has(i) ? "#1D9E75" : "#666";
			div.classList.toggle("graphs-hidden", !this._visibleGraphs.has(i));
		});
		this._dirty = true;
		this._wake();
	}
	_label(i) {
		return this._lc[i] ??= this._lab.get(this._names[i])?.[0] ?? this._curie(this._names[i]);
	}
	_plabel(p) {
		return this._plc[p] ??= this._lab.get(this._preds[p])?.[0] ?? this._curie(this._preds[p]);
	}
	_theme() {
		this._tt = performance.now();
		this._fg = "#eee";
		this._halo = "rgba(0,0,0,.8)";
	}
	_viewKey() {
		return this._vkey ??= quadsKey(this._quads);
	}
	_loadLayout() {
		return this._persist ? posStore() : null;
	}
	_loadView() {
		try {
			const o = viewStore()[this._viewKey()], v = this._v, L = this._L;
			if (!o) return false;
			if (o.a != null) {
				for (let i = 0; i < L.n; i++) if (posHash(this._names[i]) === o.a) {
					v.k = clamp(o.k, .005, 60);
					v.x = this._w / 2 + o.ox - L.x[i] * v.k;
					v.y = this._h / 2 + o.oy - L.y[i] * v.k;
					return true;
				}
			}
			if (o.x == null) return false;
			Object.assign(v, {
				k: clamp(o.k, .005, 60),
				x: o.x,
				y: o.y
			});
			return true;
		} catch {
			return false;
		}
	}
	_saveView() {
		const L = this._L, v = this._v, k = this._viewKey(), o = viewStore();
		let bi = -1, bd = Infinity, cx = (this._w / 2 - v.x) / v.k, cy = (this._h / 2 - v.y) / v.k;
		for (let i = 0; i < L.n; i++) {
			const dx = L.x[i] - cx, dy = L.y[i] - cy, d = dx * dx + dy * dy;
			if (d < bd) {
				bd = d;
				bi = i;
			}
		}
		delete o[k];
		o[k] = {
			k: v.k,
			x: v.x,
			y: v.y,
			...bi >= 0 ? {
				a: posHash(this._names[bi]),
				ox: L.x[bi] * v.k + v.x - this._w / 2,
				oy: L.y[bi] * v.k + v.y - this._h / 2
			} : null
		};
		viewFlush();
	}
	_saveLayout() {
		const L = this._L;
		if (!L.n) return;
		const o = posStore();
		for (let i = 0; i < L.n; i++) {
			const id = this._names[i];
			if (id.startsWith("_:")) continue;
			const h = posHash(id);
			delete o[h];
			o[h] = [L.x[i] | 0, L.y[i] | 0];
		}
		posFlush();
	}
	get persist() {
		return this._persist;
	}
	set persist(v) {
		this._persist = !!v;
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
		if (this._viewPending && this._L.n) {
			this._viewPending = false;
			this._auto = !this._loadView();
			if (this._auto) Object.assign(this._v, this._fitTarget());
		}
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
			if (this._persist) this._saveLayout();
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
		if (this._syncHighlight()) this._dirty = true;
		const ft = this._sel >= 0 || this._hov >= 0 ? 1 : 0, dt = this._sel >= 0 ? 1 : this._hov >= 0 ? 2 / 3 : 0;
		const ease = (c, t) => Math.abs(t - c) < .004 ? t : c + (t - c) * .16;
		const nf = ease(this._fade, ft), nd = ease(this._fdim, dt);
		if (nf !== this._fade || nd !== this._fdim) {
			this._fade = nf;
			this._fdim = nd;
			this._dirty = true;
		}
		if (this._dirty) {
			this._dirty = false;
			this._draw();
		}
		const now = performance.now();
		if (now - this._ht > 150 || !more) {
			this._ht = now;
			const gcount = this._graphs.length;
			const s = `${L.n.toLocaleString()} nodes · ${L.ls.length.toLocaleString()} links${gcount > 1 ? ` · ${gcount} graphs` : ""}`;
			if (s !== this._st) this._stat.textContent = this._st = s;
			this._bar.style.width = (more ? Math.min(1, L.alpha) * 100 : 0) + "%";
			if (this._persist && now - (this._vt || 0) > 400) {
				this._vt = now;
				this._saveView();
			}
		}
		if (more || this._anim || this._fade !== ft || this._fdim !== dt) this._wake();
	}
	_draw() {
		const L = this._L, c = this._cv, g = this._g2, d = this._dpr, v = this._v, W = this._w, H = this._h;
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, c.width, c.height);
		if (!L.n) return;
		if (performance.now() - this._tt > 1e3) this._theme();
		const { x, y, r, ls, lt } = L, k = v.k, inv = 1 / k, E = ls.length, sel = this._sel, hov = this._hov, bend = this._bend;
		this._isType;
		const x0 = -v.x * inv, y0 = -v.y * inv, x1 = (W - v.x) * inv, y1 = (H - v.y) * inv;
		g.setTransform(d * k, 0, 0, d * k, d * v.x, d * v.y);
		g.lineCap = "round";
		const addEdge = (e, ap) => {
			if (!this._nodeVisible[ls[e]] || !this._nodeVisible[lt[e]]) return;
			if (!this._visibleGraphs.has(this._edgeGraph[e])) return;
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
		const arrows = k > .45 && E < 4e4, base = (E > 1e5 ? .2 : E > 2e4 ? .3 : E > 3e3 ? .45 : .65) * (1 - .75 * this._fdim);
		g.lineWidth = (E > 5e4 ? .7 : 1) * inv;
		for (let p = 0; p < this._pc.length; p++) {
			const ap = arrows ? new Path2D() : null;
			g.beginPath();
			for (let a = this._pOff[p]; a < this._pOff[p + 1]; a++) addEdge(this._pList[a], ap);
			const isTypePred = this._preds[p] === RDF_TYPE$1;
			g.globalAlpha = isTypePred ? base * .33 : base;
			g.strokeStyle = isTypePred ? "#666" : this._pc[p];
			g.stroke();
			if (ap) {
				g.globalAlpha = Math.min(1, (isTypePred ? base * .25 : base) * 1.5);
				g.fillStyle = isTypePred ? "#666" : this._pc[p];
				g.fill(ap);
			}
		}
		const ring = k > .65 && (L.n < 3e4 || k > 2);
		g.lineWidth = 1.4 * inv;
		g.globalAlpha = 1 - .72 * this._fdim;
		for (let cl = 0; cl < this._fill.length; cl++) {
			g.beginPath();
			for (let a = this._cOff[cl]; a < this._cOff[cl + 1]; a++) {
				const i = this._cList[a];
				if (!this._nodeVisible[i]) continue;
				const px = x[i], py = y[i], ri = r[i];
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
		const fa = this._fade;
		if (fa > .01 && this._hn >= 0) {
			g.lineWidth = 1.6 * inv;
			g.globalAlpha = this._ha * fa;
			for (const e of this._he) {
				const ap = new Path2D(), col = this._pc[this._lp[e]];
				g.beginPath();
				addEdge(e, ap);
				g.strokeStyle = g.fillStyle = col;
				g.stroke();
				g.fill(ap);
			}
			g.globalAlpha = fa;
			for (const i of this._hl) dot(i, false);
			dot(this._hn, true);
		}
		g.globalAlpha = 1;
		if (sel >= 0 && hov >= 0 && hov !== sel) dot(hov, true);
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
		const L = this._L, { x, y, r, ls, lt } = L, v = this._v, k = v.k, W = this._w, H = this._h, hov = this._hov, oc = this._occ, cols = this._oc, C = 12;
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
			if (!this._nodeVisible[i]) return -1;
			const sx = x[i] * k + v.x, sy = y[i] * k + v.y, rs = r[i] * k;
			if (sx < -60 || sx > W + 60 || sy < -10 || sy > H + 30) return -1;
			if (!force && rs < 2) return 0;
			const t = this._label(i), w = t.length * 6.1 + 6, ty = sy - rs - 8;
			if (!reserve(sx, ty, w, 14, force)) return 0;
			g.globalAlpha = force ? this._fade : 1 - .65 * this._fdim;
			g.strokeStyle = this._halo;
			g.strokeText(t, sx, ty);
			g.fillStyle = this._fg;
			g.fillText(t, sx, ty);
			return 1;
		};
		if (this._fade > .02 && this._hn >= 0) {
			put(this._hn, true);
			if (this._hforce) for (const i of this._hl) put(i, true);
			else for (const i of this._hl) put(i, false);
		}
		if (hov >= 0) put(hov, true);
		for (let a = 0, seen = 0, drawn = 0; a < L.n && drawn < 700 && seen < 6e3; a++) {
			const s = put(this._order[a], false);
			if (s >= 0) seen++;
			if (s > 0) drawn++;
		}
		if (k < .5 || !ls.length) return;
		g.font = "11px system-ui,sans-serif";
		g.globalAlpha = .9;
		g.lineWidth = 1.2;
		for (let e = 0, cnt = 0; e < ls.length && cnt < 150; e++) {
			if (this._isType[e]) continue;
			if (!this._visibleGraphs.has(this._edgeGraph[e])) continue;
			const s = ls[e], t = lt[e], dx = (x[t] - x[s]) * k, dy = (y[t] - y[s]) * k, len = Math.sqrt(dx * dx + dy * dy);
			if (len < 80) continue;
			const b = this._bend[e] * k, mx = (x[s] + x[t]) / 2 * k + v.x - dy / len * b, my = (y[s] + y[t]) / 2 * k + v.y + dx / len * b;
			if (mx < 0 || mx > W || my < 0 || my > H) continue;
			const txt = this._plabel(this._lp[e]), tw = txt.length * 6.3;
			if (len < tw + 34) continue;
			const ca = Math.abs(dx / len), sa = Math.abs(dy / len);
			if (!reserve(mx, my, tw * ca + 12 * sa, tw * sa + 12 * ca)) continue;
			let ang = Math.atan2(dy, dx);
			if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
			g.save();
			g.translate(mx, my);
			g.rotate(ang);
			g.strokeStyle = this._halo;
			g.strokeText(txt, 0, -6);
			g.fillStyle = this._pc[this._lp[e]];
			g.fillText(txt, 0, -6);
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
	_neighbors(i) {
		const L = this._L, off = this._off, adj = this._adj, nl = [], el = [];
		if (i >= 0) {
			const s = /* @__PURE__ */ new Set();
			for (let a = off[i]; a < off[i + 1]; a++) {
				const e = adj[a];
				el.push(e);
				s.add(L.ls[e] === i ? L.lt[e] : L.ls[e]);
			}
			for (const j of s) nl.push(j);
		}
		return [nl, el];
	}
	/** Refresh the displayed highlight set only when its source changes; the stale
	set is kept while _fade eases out so the highlight can fade away smoothly. */
	_syncHighlight() {
		const sel = this._sel, hov = this._hov;
		const key = sel >= 0 ? sel : hov >= 0 ? ~hov : null;
		if (key === null || key === this._hkey) return false;
		this._hkey = key;
		const i = sel >= 0 ? sel : hov;
		[this._hl, this._he] = this._neighbors(i);
		this._hn = i;
		this._ha = sel >= 0 ? .9 : .45;
		this._hforce = sel >= 0;
		return true;
	}
	_select(i) {
		if (i === this._sel) return;
		this._sel = i;
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
			const c = this._typ[i];
			if (c && this._classes[c] !== this._names[i]) add("small", "a " + this._curie(this._classes[c]));
			add("small", this._names[i]);
			for (const [p, val] of this._lits.get(i) || []) {
				const short = val.length > 200 ? val.slice(0, 200) + "…" : val;
				add("div", this._curie(p) + ": " + short);
			}
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
		this._graphsToggle.addEventListener("click", () => {
			this._graphsPanel.classList.toggle("collapsed");
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
var IS_BROWSER = typeof HTMLElement !== "undefined" && typeof customElements !== "undefined" && typeof document !== "undefined";
if (IS_BROWSER && !customElements.get("quad-graph")) customElements.define("quad-graph", QuadGraph);
var graph_default = IS_BROWSER ? QuadGraph : void 0;
// src/evaluate.js
/**
* mdld-shapes.js — Zero-dependency SHACL Core validator for the MD-LD ecosystem.
*
* Single-file implementation: ~1200 LOC, no external deps.
* Implements W3C SHACL Core (REC-shacl-20170720 + 1.2 Core WD).
*
* Usage:
*   import { validate, Validator, createShapeDetector } from './mdld-shapes.js'
*   const report = validate({ quads })           // auto-classify shapes + data
*   const report = validate({ shapes, data })     // pre-separated
*/
var RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var RDFS = "http://www.w3.org/2000/01/rdf-schema#";
var SH = "http://www.w3.org/ns/shacl#";
var XSD = "http://www.w3.org/2001/XMLSchema#";
var nn = (v) => ({
	termType: "NamedNode",
	value: v,
	equals(t) {
		return t && t.termType === "NamedNode" && t.value === v;
	}
});
var RDF_TYPE = nn(RDF + "type");
var RDF_FIRST = nn(RDF + "first");
var RDF_REST = nn(RDF + "rest");
var RDF_NIL = nn(RDF + "nil");
var SH_NS = SH;
function termKey(t) {
	if (!t) return "";
	if (t.termType === "Literal") return `"${t.value}"${t.datatype?.value || ""}@${t.language || ""}`;
	return `${t.termType}:${t.value}`;
}
function termEquals(a, b) {
	if (!a || !b) return false;
	if (a === b) return true;
	if (typeof a.equals === "function") return a.equals(b);
	if (a.termType !== b.termType) return false;
	if (a.value !== b.value) return false;
	if (a.termType === "Literal") {
		if ((a.language || "") !== (b.language || "")) return false;
		if ((a.datatype?.value || "") !== (b.datatype?.value || "")) return false;
	}
	return true;
}
function isNamedNode(t) {
	return t?.termType === "NamedNode";
}
function isBlankNode(t) {
	return t?.termType === "BlankNode";
}
function isLiteral(t) {
	return t?.termType === "Literal";
}
var Store = class Store {
	#quads = /* @__PURE__ */ new Set();
	#bySubject = /* @__PURE__ */ new Map();
	#byPredicate = /* @__PURE__ */ new Map();
	#byObject = /* @__PURE__ */ new Map();
	constructor(quads) {
		if (quads) for (const q of quads) this.add(q);
	}
	get size() {
		return this.#quads.size;
	}
	add(q) {
		if (this.#quads.has(q)) return this;
		this.#quads.add(q);
		this.#addToIndex(this.#bySubject, q.subject, q);
		this.#addToIndex(this.#byPredicate, q.predicate, q);
		this.#addToIndex(this.#byObject, q.object, q);
		return this;
	}
	delete(q) {
		for (const x of this.match(q.subject, q.predicate, q.object)) {
			if (!quadEq(x, q)) continue;
			this.#quads.delete(x);
			this.#deleteFromIndex(this.#bySubject, x.subject, x);
			this.#deleteFromIndex(this.#byPredicate, x.predicate, x);
			this.#deleteFromIndex(this.#byObject, x.object, x);
			break;
		}
		return this;
	}
	has(q) {
		for (const x of this.match(q.subject, q.predicate, q.object)) if (quadEq(x, q)) return true;
		return false;
	}
	*[Symbol.iterator]() {
		yield* this.#quads;
	}
	match(s, p, o, g) {
		let candidates = this.#quads;
		if (s) candidates = this.#getSmaller(candidates, this.#bySubject, s);
		if (p) candidates = this.#getSmaller(candidates, this.#byPredicate, p);
		if (o) candidates = this.#getSmaller(candidates, this.#byObject, o);
		const r = [];
		for (const q of candidates) if ((!s || termEquals(q.subject, s)) && (!p || termEquals(q.predicate, p)) && (!o || termEquals(q.object, o)) && (!g || termEquals(q.graph, g))) r.push(q);
		return new Store(r);
	}
	#addToIndex(index, term, quad) {
		const key = termKey(term);
		let quads = index.get(key);
		if (!quads) index.set(key, quads = /* @__PURE__ */ new Set());
		quads.add(quad);
	}
	#deleteFromIndex(index, term, quad) {
		const key = termKey(term);
		const quads = index.get(key);
		if (!quads) return;
		quads.delete(quad);
		if (quads.size === 0) index.delete(key);
	}
	#getSmaller(current, index, term) {
		const indexed = index.get(termKey(term));
		if (!indexed) return EMPTY_QUADS;
		return indexed.size < current.size ? indexed : current;
	}
};
var EMPTY_QUADS = /* @__PURE__ */ new Set();
function quadEq(a, b) {
	return termEquals(a.subject, b.subject) && termEquals(a.predicate, b.predicate) && termEquals(a.object, b.object) && termEquals(a.graph, b.graph);
}
function valuesOf(ds, subject, predicate) {
	const out = [];
	for (const q of ds.match(subject, predicate, null)) out.push(q.object);
	return out;
}
var RDFS_SUB_PROPERTY_OF = nn(RDFS + "subPropertyOf");
/** Values of predicate p on subject s, including rdfs:subPropertyOf descendants (data-side entailment). */
function valuesOfWithSubProps(ds, subject, predicate) {
	const out = valuesOf(ds, subject, predicate);
	const supers = /* @__PURE__ */ new Set([termKey(predicate)]);
	const queue = [predicate];
	for (let i = 0; i < queue.length; i++) for (const q of ds.match(null, RDFS_SUB_PROPERTY_OF, queue[i])) {
		const k = termKey(q.subject);
		if (!supers.has(k)) {
			supers.add(k);
			queue.push(q.subject);
		}
	}
	if (supers.size > 1) {
		for (const q of ds.match(subject, null, null)) if (supers.has(termKey(q.predicate)) && !out.some((v) => termEquals(v, q.object))) out.push(q.object);
	}
	return out;
}
/** Read an RDF list (rdf:first / rdf:rest chain) into a plain array of terms. */
function readList(ds, head) {
	const items = [];
	const visited = /* @__PURE__ */ new Set();
	let cur = head;
	while (cur && !termEquals(cur, RDF_NIL)) {
		const key = termKey(cur);
		if (visited.has(key)) throw new Error(`Circular RDF list at ${cur.value}`);
		visited.add(key);
		const firsts = valuesOf(ds, cur, RDF_FIRST);
		const rests = valuesOf(ds, cur, RDF_REST);
		if (firsts.length !== 1 || rests.length !== 1) throw new Error(`Malformed RDF list at ${cur.value} (first:${firsts.length}, rest:${rests.length})`);
		items.push(firsts[0]);
		cur = rests[0];
	}
	return items;
}
var storeCaches = /* @__PURE__ */ new WeakMap();
function graphCache(ds) {
	let c = storeCaches.get(ds);
	if (!c) {
		c = {
			subParents: null,
			subChildren: null,
			typeIdx: null,
			closure: /* @__PURE__ */ new Map(),
			instances: /* @__PURE__ */ new Map()
		};
		storeCaches.set(ds, c);
	}
	return c;
}
function subParentsOf(ds, c) {
	if (!c.subParents) {
		c.subParents = /* @__PURE__ */ new Map();
		c.subChildren = /* @__PURE__ */ new Map();
		for (const q of ds.match(null, nn(RDFS + "subClassOf"), null)) {
			const sk = termKey(q.subject), ok = termKey(q.object);
			(c.subParents.get(sk) || c.subParents.set(sk, []).get(sk)).push(ok);
			(c.subChildren.get(ok) || c.subChildren.set(ok, []).get(ok)).push(sk);
		}
	}
	return c.subParents;
}
function subChildrenOf(ds, c) {
	subParentsOf(ds, c);
	return c.subChildren;
}
function typeIndex(ds, c) {
	if (!c.typeIdx) {
		c.typeIdx = /* @__PURE__ */ new Map();
		for (const q of ds.match(null, RDF_TYPE, null)) {
			const ok = termKey(q.object);
			let set = c.typeIdx.get(ok);
			if (!set) c.typeIdx.set(ok, set = /* @__PURE__ */ new Set());
			set.add(termKey(q.subject));
		}
	}
	return c.typeIdx;
}
/** All superclasses of key (incl. itself), memoized. */
function superclassClosure(ds, key, c) {
	let out = c.closure.get(key);
	if (out) return out;
	out = /* @__PURE__ */ new Set([key]);
	const parents = subParentsOf(ds, c);
	const queue = [key];
	while (queue.length) for (const p of parents.get(queue.pop()) || []) if (!out.has(p)) {
		out.add(p);
		queue.push(p);
	}
	c.closure.set(key, out);
	return out;
}
/** All subclasses of key (incl. itself), memoized. */
function subclassClosure(ds, key, c) {
	const seen = /* @__PURE__ */ new Set([key]);
	const queue = [key];
	const children = subChildrenOf(ds, c);
	while (queue.length) for (const ch of children.get(queue.pop()) || []) if (!seen.has(ch)) {
		seen.add(ch);
		queue.push(ch);
	}
	return seen;
}
/** Get all instances of a class (including rdfs:subClassOf chain). */
function instancesOf(ds, classIRI) {
	const c = graphCache(ds);
	const ck = termKey(classIRI);
	let out = c.instances.get(ck);
	if (out) return out;
	const classes = subclassClosure(ds, ck, c);
	const tidx = typeIndex(ds, c);
	const subjects = /* @__PURE__ */ new Set();
	for (const cls of classes) for (const sk of tidx.get(cls) || []) subjects.add(sk);
	out = [];
	for (const q of ds.match(null, RDF_TYPE, null)) if (subjects.has(termKey(q.subject))) out.push(q.subject);
	c.instances.set(ck, out);
	return out;
}
function createShapeDetector() {
	const shapeSubjects = /* @__PURE__ */ new Set();
	const listNodes = /* @__PURE__ */ new Set();
	const shapeRefs = /* @__PURE__ */ new Set();
	function classify(quad) {
		if (!quad?.predicate?.value) return false;
		const p = quad.predicate.value;
		const o = quad.object?.value;
		const s = quad.subject?.value;
		if (p === RDF + "type" && (o === SH + "NodeShape" || o === SH + "PropertyShape")) {
			shapeSubjects.add(s);
			return true;
		}
		if (p.startsWith(SH_NS)) {
			shapeRefs.add(o);
			return true;
		}
		if (shapeSubjects.has(s)) return true;
		if (p === RDF + "first" || p === RDF + "rest") {
			if (shapeRefs.has(s) || shapeSubjects.has(s) || listNodes.has(s)) {
				listNodes.add(s);
				if (p === RDF + "rest" && o !== RDF + "nil") listNodes.add(o);
				return true;
			}
		}
		if (p === RDF + "type" && o === RDF + "List" && shapeRefs.has(s)) {
			listNodes.add(s);
			return true;
		}
		return false;
	}
	return {
		classify,
		getStats: () => ({
			shapeSubjects: shapeSubjects.size,
			listNodes: listNodes.size,
			shapeRefs: shapeRefs.size
		}),
		reset: () => {
			shapeSubjects.clear();
			listNodes.clear();
			shapeRefs.clear();
		}
	};
}
/** Constraint predicate names implemented by evalConstraint. */
var CONSTRAINT_PREDICATES = [
	"class",
	"datatype",
	"nodeKind",
	"minCount",
	"maxCount",
	"minExclusive",
	"maxExclusive",
	"minInclusive",
	"maxInclusive",
	"minLength",
	"maxLength",
	"pattern",
	"flags",
	"languageIn",
	"uniqueLang",
	"equals",
	"disjoint",
	"lessThan",
	"lessThanOrEquals",
	"not",
	"and",
	"or",
	"xone",
	"node",
	"hasValue",
	"in",
	"closed",
	"ignoredProperties",
	"qualifiedValueShape",
	"qualifiedMinCount",
	"qualifiedMaxCount",
	"js"
];
var SUPPORTED_VOCABULARY = {
	constraints: new Set(CONSTRAINT_PREDICATES),
	targets: /* @__PURE__ */ new Set([
		"targetClass",
		"targetNode",
		"targetSubjectsOf",
		"targetObjectsOf",
		"target"
	]),
	paths: /* @__PURE__ */ new Set([
		"inversePath",
		"alternativePath",
		"zeroOrMorePath",
		"oneOrMorePath",
		"zeroOrOnePath"
	]),
	structure: /* @__PURE__ */ new Set(["property", "path"]),
	annotation: /* @__PURE__ */ new Set([
		"name",
		"order",
		"group",
		"defaultValue",
		"description",
		"message",
		"severity",
		"deactivated"
	])
};
function isSupportedTerm(name) {
	return SUPPORTED_VOCABULARY.constraints.has(name) || SUPPORTED_VOCABULARY.targets.has(name) || SUPPORTED_VOCABULARY.paths.has(name) || SUPPORTED_VOCABULARY.structure.has(name) || SUPPORTED_VOCABULARY.annotation.has(name);
}
function sh(v) {
	return nn(SH + v);
}
function findShapes(shapesDS) {
	const shapes = /* @__PURE__ */ new Set();
	for (const q of shapesDS.match(null, RDF_TYPE, nn(SH + "NodeShape"))) shapes.add(termKey(q.subject));
	for (const pred of [
		"targetClass",
		"targetNode",
		"targetSubjectsOf",
		"targetObjectsOf",
		"target"
	]) for (const q of shapesDS.match(null, sh(pred), null)) shapes.add(termKey(q.subject));
	return [...shapes];
}
function getShapeTerm(shapesDS, key) {
	for (const q of shapesDS) if (termKey(q.subject) === key) return q.subject;
	return null;
}
/** Extract all constraints declared directly on a shape node. */
function extractConstraints(shapesDS, shapeTerm) {
	const constraints = [];
	const params = {};
	for (const pred of CONSTRAINT_PREDICATES) {
		const vals = valuesOf(shapesDS, shapeTerm, sh(pred));
		if (vals.length > 0) params[pred] = vals.length === 1 ? vals[0] : vals;
	}
	const messages = valuesOf(shapesDS, shapeTerm, sh("message"));
	const severities = valuesOf(shapesDS, shapeTerm, sh("severity"));
	const deactivated = valuesOf(shapesDS, shapeTerm, sh("deactivated"));
	const add = (component, params) => constraints.push({
		component,
		params,
		messages,
		severities
	});
	const asArray = (v) => Array.isArray(v) ? v : [v];
	const readListParam = (v) => readList(shapesDS, Array.isArray(v) ? v[0] : v);
	const intParam = (v) => parseInt(v.value);
	const boolParam = (v) => v.value === "true";
	const specs = [
		{
			param: "class",
			component: "ClassConstraintComponent"
		},
		{
			param: "datatype",
			component: "DatatypeConstraintComponent"
		},
		{
			param: "nodeKind",
			component: "NodeKindConstraintComponent"
		},
		{
			param: "minCount",
			component: "MinCountConstraintComponent",
			value: intParam
		},
		{
			param: "maxCount",
			component: "MaxCountConstraintComponent",
			value: intParam
		},
		{
			param: "minExclusive",
			component: "MinExclusiveConstraintComponent"
		},
		{
			param: "maxExclusive",
			component: "MaxExclusiveConstraintComponent"
		},
		{
			param: "minInclusive",
			component: "MinInclusiveConstraintComponent"
		},
		{
			param: "maxInclusive",
			component: "MaxInclusiveConstraintComponent"
		},
		{
			param: "minLength",
			component: "MinLengthConstraintComponent",
			value: intParam
		},
		{
			param: "maxLength",
			component: "MaxLengthConstraintComponent",
			value: intParam
		},
		{
			param: "pattern",
			component: "PatternConstraintComponent",
			build: (raw, p) => ({
				pattern: raw.value,
				flags: p.flags?.value || ""
			})
		},
		{
			param: "languageIn",
			component: "LanguageInConstraintComponent",
			list: true
		},
		{
			param: "uniqueLang",
			component: "UniqueLangConstraintComponent",
			value: boolParam
		},
		{
			param: "equals",
			component: "EqualsConstraintComponent"
		},
		{
			param: "disjoint",
			component: "DisjointConstraintComponent"
		},
		{
			param: "lessThan",
			component: "LessThanConstraintComponent"
		},
		{
			param: "lessThanOrEquals",
			component: "LessThanOrEqualsConstraintComponent"
		},
		{
			param: "not",
			component: "NotConstraintComponent",
			many: true
		},
		{
			param: "and",
			component: "AndConstraintComponent",
			list: true
		},
		{
			param: "or",
			component: "OrConstraintComponent",
			list: true
		},
		{
			param: "xone",
			component: "XoneConstraintComponent",
			list: true
		},
		{
			param: "node",
			component: "NodeConstraintComponent"
		},
		{
			param: "hasValue",
			component: "HasValueConstraintComponent"
		},
		{
			param: "in",
			component: "InConstraintComponent",
			list: true
		},
		{
			param: "closed",
			component: "ClosedConstraintComponent",
			build: (raw, p) => ({
				closed: raw !== false && !(isLiteral(raw) && ["false", "0"].includes(raw.value.toLowerCase())),
				ignoredProperties: p.ignoredProperties ? readListParam(p.ignoredProperties) : []
			})
		},
		{
			param: "js",
			component: "JSConstraintComponent",
			many: true
		}
	];
	for (const spec of specs) {
		const raw = params[spec.param];
		if (raw == null) continue;
		for (const item of spec.many ? asArray(raw) : [raw]) {
			const value = spec.list ? readListParam(item) : item;
			const mapped = spec.value ? spec.value(value) : value;
			add(spec.component, spec.build ? spec.build(item, params) : { [spec.param]: mapped });
		}
	}
	if (params.qualifiedValueShape) {
		if (params.qualifiedMinCount != null) constraints.push({
			component: "QualifiedMinCountConstraintComponent",
			params: {
				qualifiedValueShape: params.qualifiedValueShape,
				qualifiedMinCount: parseInt(params.qualifiedMinCount.value)
			},
			messages,
			severities
		});
		if (params.qualifiedMaxCount != null) constraints.push({
			component: "QualifiedMaxCountConstraintComponent",
			params: {
				qualifiedValueShape: params.qualifiedValueShape,
				qualifiedMaxCount: parseInt(params.qualifiedMaxCount.value)
			},
			messages,
			severities
		});
	}
	return {
		constraints,
		deactivated: deactivated.length > 0 && (deactivated[0].value === "true" || deactivated[0] === true)
	};
}
function getShapeInfo(shapesDS, shapeTerm, cache) {
	const key = termKey(shapeTerm);
	if (cache.has(key)) return cache.get(key);
	const { constraints, deactivated } = extractConstraints(shapesDS, shapeTerm);
	const info = {
		constraints,
		deactivated,
		isPropertyShape: valuesOf(shapesDS, shapeTerm, RDF_TYPE).some((t) => t.value === SH + "PropertyShape") || valuesOf(shapesDS, shapeTerm, sh("path")).length > 0,
		pathTerms: valuesOf(shapesDS, shapeTerm, sh("path")),
		propertyShapes: valuesOf(shapesDS, shapeTerm, sh("property"))
	};
	cache.set(key, info);
	return info;
}
function resolveTargets(dataDS, shapesDS, shapeTerm) {
	const targets = [];
	for (const cls of valuesOf(shapesDS, shapeTerm, sh("targetClass"))) targets.push(...instancesOf(dataDS, cls));
	for (const node of valuesOf(shapesDS, shapeTerm, sh("targetNode"))) targets.push(node);
	for (const node of valuesOf(shapesDS, shapeTerm, sh("target"))) targets.push(node);
	for (const pred of valuesOf(shapesDS, shapeTerm, sh("targetSubjectsOf"))) for (const q of dataDS.match(null, pred, null)) targets.push(q.subject);
	for (const pred of valuesOf(shapesDS, shapeTerm, sh("targetObjectsOf"))) for (const q of dataDS.match(null, pred, null)) targets.push(q.object);
	const seen = /* @__PURE__ */ new Set();
	return targets.filter((t) => {
		const k = termKey(t);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}
function resolvePath(dataDS, shapesDS, focusNode, pathTerm) {
	if (!pathTerm) return [];
	if (isNamedNode(pathTerm) && !hasPathStructure(shapesDS, pathTerm)) return valuesOf(dataDS, focusNode, pathTerm);
	if (isBlankNode(pathTerm) || isNamedNode(pathTerm)) {
		const [inverse] = valuesOf(shapesDS, pathTerm, sh("inversePath"));
		if (inverse) {
			const pred = isBlankNode(inverse) ? null : inverse;
			if (pred) {
				const out = [];
				for (const q of dataDS.match(null, pred, focusNode)) out.push(q.subject);
				return out;
			}
		}
		const [alt] = valuesOf(shapesDS, pathTerm, sh("alternativePath"));
		if (alt) {
			const paths = readList(shapesDS, alt);
			const out = [];
			for (const p of paths) out.push(...resolvePath(dataDS, shapesDS, focusNode, p));
			return out;
		}
		const [zeroOrMore] = valuesOf(shapesDS, pathTerm, sh("zeroOrMorePath"));
		if (zeroOrMore) return transitive(dataDS, focusNode, zeroOrMore, true);
		const [oneOrMore] = valuesOf(shapesDS, pathTerm, sh("oneOrMorePath"));
		if (oneOrMore) return transitive(dataDS, focusNode, oneOrMore, false);
		const [zeroOrOne] = valuesOf(shapesDS, pathTerm, sh("zeroOrOnePath"));
		if (zeroOrOne) return [focusNode, ...valuesOf(dataDS, focusNode, zeroOrOne)];
		try {
			const steps = readList(shapesDS, pathTerm);
			if (steps.length > 0) {
				let nodes = [focusNode];
				for (const step of steps) nodes = nodes.flatMap((n) => resolvePath(dataDS, shapesDS, n, step));
				return nodes;
			}
		} catch {}
	}
	return [];
}
/** Does this term describe a complex path structure in the shapes graph? */
function hasPathStructure(shapesDS, term) {
	for (const p of [
		"inversePath",
		"alternativePath",
		"zeroOrMorePath",
		"oneOrMorePath",
		"zeroOrOnePath"
	]) if (valuesOf(shapesDS, term, sh(p)).length > 0) return true;
	return valuesOf(shapesDS, term, RDF_FIRST).length > 0 || valuesOf(shapesDS, term, RDF_REST).length > 0;
}
/**
* All predicate IRIs reachable inside a path term — the plain predicate for
* simple paths, or every member predicate for path structures
* (alternativePath lists, inversePath, transitives, sequence lists).
* Used by sh:closed whitelists and subgraph predicate filtering.
*/
function pathPredicates(shapesDS, pathTerm) {
	const out = /* @__PURE__ */ new Set();
	const walk = (t) => {
		if (!t || isLiteral(t)) return;
		if (isNamedNode(t) && !hasPathStructure(shapesDS, t)) {
			out.add(termKey(t));
			return;
		}
		const inv = valuesOf(shapesDS, t, sh("inversePath"));
		if (inv.length > 0) {
			inv.forEach(walk);
			return;
		}
		const alt = valuesOf(shapesDS, t, sh("alternativePath"));
		if (alt.length > 0) {
			try {
				readList(shapesDS, alt[0]).forEach(walk);
			} catch {}
			return;
		}
		for (const p of [
			"zeroOrMorePath",
			"oneOrMorePath",
			"zeroOrOnePath"
		]) {
			const v = valuesOf(shapesDS, t, sh(p));
			if (v.length > 0) {
				v.forEach(walk);
				return;
			}
		}
		try {
			const steps = readList(shapesDS, t);
			if (steps.length > 0) {
				steps.forEach(walk);
				return;
			}
		} catch {}
	};
	walk(pathTerm);
	return out;
}
function transitive(ds, start, pred, includeStart) {
	const c = graphCache(ds);
	c.trans ??= /* @__PURE__ */ new Map();
	const ck = termKey(start) + "|" + termKey(pred) + "|" + (includeStart ? 1 : 0);
	const hit = c.trans.get(ck);
	if (hit) return hit;
	const results = includeStart ? [start] : [];
	const visited = /* @__PURE__ */ new Set();
	const queue = [start];
	for (let cursor = 0; cursor < queue.length; cursor++) {
		const cur = queue[cursor];
		if (visited.has(termKey(cur))) continue;
		visited.add(termKey(cur));
		for (const next of valuesOf(ds, cur, pred)) if (!visited.has(termKey(next))) {
			visited.add(termKey(next));
			results.push(next);
			queue.push(next);
		}
	}
	c.trans.set(ck, results);
	return results;
}
function toNumber(t) {
	if (!isLiteral(t)) return NaN;
	const v = t.value;
	if (t.datatype) {
		const dt = t.datatype.value;
		if (dt === XSD + "integer" || dt === XSD + "int" || dt === XSD + "long" || dt === XSD + "short" || dt === XSD + "byte" || dt === XSD + "nonNegativeInteger" || dt === XSD + "positiveInteger" || dt === XSD + "unsignedInt" || dt === XSD + "unsignedLong") return parseInt(v, 10);
		if (dt === XSD + "decimal" || dt === XSD + "float" || dt === XSD + "double") return parseFloat(v);
	}
	const n = Number(v);
	return isNaN(n) ? NaN : n;
}
function toDate(t) {
	if (!isLiteral(t)) return NaN;
	const d = new Date(t.value);
	return isNaN(d.getTime()) ? NaN : d.getTime();
}
function compareValues(a, b) {
	const na = toNumber(a), nb = toNumber(b);
	if (!isNaN(na) && !isNaN(nb)) return na - nb;
	const da = toDate(a), db = toDate(b);
	if (!isNaN(da) && !isNaN(db)) return da - db;
	return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
}
function checkNodeKind(value, nodeKindIRI) {
	switch (nodeKindIRI.value.replace(SH, "")) {
		case "IRI": return isNamedNode(value);
		case "BlankNode": return isBlankNode(value);
		case "Literal": return isLiteral(value);
		case "BlankNodeOrIRI": return isBlankNode(value) || isNamedNode(value);
		case "BlankNodeOrLiteral": return isBlankNode(value) || isLiteral(value);
		case "IRIOrLiteral": return isNamedNode(value) || isLiteral(value);
		default: return true;
	}
}
/** Lexical form passed to sh:js scripts as `value` (literal lexical / IRI / blank label). */
function jsValue(t) {
	return t ? t.value : null;
}
/**
* Compile a sh:script body into a callable function.
* Same realm, no sandbox: the script runs with validator helpers in scope —
* value, term, focusNode, values, graph, termEquals, valuesOf.
*/
function compileJs(src, shapeTerm) {
	try {
		return new Function("value", "term", "focusNode", "values", "graph", "termEquals", "valuesOf", src);
	} catch (e) {
		throw new Error(`sh:js compile error in shape ${shapeTerm?.value}: ${e.message}`);
	}
}
/** Resolve the JS source for a sh:js parameter (JSConstraint node or inline literal). */
function jsSource(shapesDS, jsTerm) {
	if (isLiteral(jsTerm)) return jsTerm.value;
	const scripts = valuesOf(shapesDS, jsTerm, sh("script"));
	if (scripts.length > 0) return scripts[0].value;
	const alt = valuesOf(shapesDS, jsTerm, sh("js"));
	if (alt.length > 0 && isLiteral(alt[0])) return alt[0].value;
	throw new Error(`sh:js constraint ${jsTerm?.value} has no sh:script`);
}
/** Invert an MD-LD context {prefix: iri} into a longest-first [iri, prefix] list for message shortening. */
function buildPrefixes(context) {
	if (!context || typeof context !== "object") return null;
	const pairs = [];
	for (const [prefix, iri] of Object.entries(context)) {
		const ns = typeof iri === "string" ? iri : iri?.["@id"];
		if (typeof ns === "string" && ns) pairs.push([ns, prefix === "@vocab" ? "" : prefix]);
	}
	return pairs.sort((a, b) => b[0].length - a[0].length);
}
/** Shorten a term for human-facing sh:message output: prefix:local when a context prefix matches, else local name. */
function shortenTerm(term, prefixes) {
	if (!term) return "";
	if (isLiteral(term)) return term.value;
	const iri = term.value;
	if (prefixes) {
		for (const [ns, prefix] of prefixes) if (iri.startsWith(ns)) return prefix ? `${prefix}:${iri.slice(ns.length)}` : iri.slice(ns.length);
	}
	const i = Math.max(iri.lastIndexOf("/"), iri.lastIndexOf("#"));
	return i >= 0 ? iri.slice(i + 1) : iri;
}
var COUNT_CHECKS = {
	MinCountConstraintComponent: {
		param: "minCount",
		fail: (n, limit) => n < limit
	},
	MaxCountConstraintComponent: {
		param: "maxCount",
		fail: (n, limit) => n > limit
	}
};
var LENGTH_CHECKS = {
	MinLengthConstraintComponent: {
		param: "minLength",
		fail: (len, limit) => len < limit
	},
	MaxLengthConstraintComponent: {
		param: "maxLength",
		fail: (len, limit) => len > limit
	}
};
var RANGE_CHECKS = {
	MinInclusiveConstraintComponent: {
		param: "minInclusive",
		fail: (cmp) => cmp < 0
	},
	MaxInclusiveConstraintComponent: {
		param: "maxInclusive",
		fail: (cmp) => cmp > 0
	},
	MinExclusiveConstraintComponent: {
		param: "minExclusive",
		fail: (cmp) => cmp <= 0
	},
	MaxExclusiveConstraintComponent: {
		param: "maxExclusive",
		fail: (cmp) => cmp >= 0
	}
};
/**
* Evaluate a single constraint against a value.
* @returns {Array} array of violation objects (empty if passes)
*/
function evalConstraint(constraint, dataDS, shapesDS, focusNode, value, values, ctx) {
	const { component, params } = constraint;
	const violations = [];
	const severity = constraint.severities?.[0] || nn(SH + "Violation");
	const rawMessage = constraint.messages?.[0]?.value || null;
	function renderMessage() {
		if (!rawMessage) return null;
		return rawMessage.replaceAll("{$value}", shortenTerm(value, ctx.prefixes) ?? "").replaceAll("{$path}", shortenTerm(ctx.path, ctx.prefixes) ?? "").replaceAll("{$focusNode}", shortenTerm(focusNode, ctx.prefixes) ?? "");
	}
	function viol(extra = {}) {
		return {
			focusNode,
			value,
			severity,
			component: nn(SH + component),
			message: renderMessage(),
			shape: ctx.shapeTerm,
			path: ctx.path,
			...extra
		};
	}
	const countCheck = COUNT_CHECKS[component];
	if (countCheck) {
		if (countCheck.fail(values.length, params[countCheck.param])) violations.push(viol());
		return violations;
	}
	const lengthCheck = LENGTH_CHECKS[component];
	if (lengthCheck) {
		if (isLiteral(value) && lengthCheck.fail(value.value.length, params[lengthCheck.param])) violations.push(viol());
		return violations;
	}
	const rangeCheck = RANGE_CHECKS[component];
	if (rangeCheck) {
		if (isLiteral(value)) {
			const cmp = compareValues(value, params[rangeCheck.param]);
			if (!isNaN(cmp) && rangeCheck.fail(cmp)) violations.push(viol());
		}
		return violations;
	}
	switch (component) {
		case "ClassConstraintComponent": {
			if (!isNamedNode(value) && !isBlankNode(value)) {
				violations.push(viol());
				break;
			}
			const types = valuesOf(dataDS, value, RDF_TYPE);
			const gc = graphCache(dataDS);
			if (!types.some((t) => superclassClosure(dataDS, termKey(t), gc).has(termKey(params.class)))) violations.push(viol());
			break;
		}
		case "DatatypeConstraintComponent":
			if (!isLiteral(value) || !termEquals(value.datatype, params.datatype)) violations.push(viol());
			break;
		case "NodeKindConstraintComponent":
			if (!checkNodeKind(value, params.nodeKind)) violations.push(viol());
			break;
		case "PatternConstraintComponent":
			if (!isLiteral(value)) {
				violations.push(viol());
				break;
			}
			try {
				if (!new RegExp(params.pattern, params.flags).test(value.value)) violations.push(viol());
			} catch {
				violations.push(viol());
			}
			break;
		case "LanguageInConstraintComponent": {
			if (!isLiteral(value) || !value.language) {
				violations.push(viol());
				break;
			}
			const lang = value.language.toLowerCase();
			if (!params.languageIn.some((allowed) => {
				const a = (isLiteral(allowed) ? allowed.value : allowed.value || "").toLowerCase();
				return lang === a || lang.startsWith(a + "-");
			})) violations.push(viol());
			break;
		}
		case "UniqueLangConstraintComponent": {
			if (!params.uniqueLang) break;
			const langs = values.filter((v) => isLiteral(v) && v.language).map((v) => v.language.toLowerCase());
			const seen = /* @__PURE__ */ new Set();
			for (const l of langs) {
				if (seen.has(l)) {
					violations.push(viol());
					break;
				}
				seen.add(l);
			}
			break;
		}
		case "EqualsConstraintComponent": {
			const otherVals = valuesOfWithSubProps(dataDS, focusNode, params.equals);
			const thisSet = new Set(values.map(termKey));
			const otherSet = new Set(otherVals.map(termKey));
			if (thisSet.size !== otherSet.size || ![...thisSet].every((k) => otherSet.has(k))) violations.push(viol());
			break;
		}
		case "DisjointConstraintComponent": {
			const otherVals = valuesOfWithSubProps(dataDS, focusNode, params.disjoint);
			if (values.some((v) => otherVals.some((o) => termEquals(v, o)))) violations.push(viol());
			break;
		}
		case "LessThanConstraintComponent": {
			const otherVals = valuesOfWithSubProps(dataDS, focusNode, params.lessThan);
			for (const v of values) {
				if (!isLiteral(v)) continue;
				for (const o of otherVals) {
					if (!isLiteral(o)) continue;
					if (compareValues(v, o) >= 0) {
						violations.push(viol());
						break;
					}
				}
			}
			break;
		}
		case "LessThanOrEqualsConstraintComponent": {
			const otherVals = valuesOfWithSubProps(dataDS, focusNode, params.lessThanOrEquals);
			for (const v of values) {
				if (!isLiteral(v)) continue;
				for (const o of otherVals) {
					if (!isLiteral(o)) continue;
					if (compareValues(v, o) > 0) {
						violations.push(viol());
						break;
					}
				}
			}
			break;
		}
		case "HasValueConstraintComponent":
			if (!values.some((v) => termEquals(v, params.hasValue))) violations.push(viol());
			break;
		case "InConstraintComponent":
			if (!params.in.some((item) => termEquals(value, item))) violations.push(viol());
			break;
		case "NotConstraintComponent": {
			const notShapes = Array.isArray(params.not) ? params.not : params.not ? [params.not] : [];
			for (const targetShape of notShapes) if (validateNodeAgainstShape(dataDS, shapesDS, targetShape, value, {
				...ctx,
				shapeTerm: targetShape,
				visited: /* @__PURE__ */ new Set()
			}).length === 0) violations.push(viol());
			break;
		}
		case "AndConstraintComponent":
			for (const shapeTerm of params.and) if (validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, value, ctx).length > 0) {
				violations.push(viol());
				break;
			}
			break;
		case "OrConstraintComponent":
			if (!params.or.some((shapeTerm) => {
				return validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, value, ctx).length === 0;
			})) violations.push(viol());
			break;
		case "XoneConstraintComponent":
			if (params.xone.filter((shapeTerm) => {
				return validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, value, ctx).length === 0;
			}).length !== 1) violations.push(viol());
			break;
		case "NodeConstraintComponent": {
			if (!params.node) break;
			const innerCtx = {
				...ctx,
				shapeTerm: params.node,
				visited: /* @__PURE__ */ new Set()
			};
			if (validateNodeAgainstShape(dataDS, shapesDS, params.node, value, innerCtx).length > 0) violations.push(viol());
			break;
		}
		case "ClosedConstraintComponent": {
			if (!params.closed) break;
			const allowedPreds = /* @__PURE__ */ new Set();
			for (const propShape of valuesOf(shapesDS, ctx.shapeTerm, sh("property"))) {
				const paths = valuesOf(shapesDS, propShape, sh("path"));
				for (const p of paths) for (const k of pathPredicates(shapesDS, p)) allowedPreds.add(k);
			}
			for (const ig of params.ignoredProperties || []) allowedPreds.add(termKey(ig));
			allowedPreds.add(termKey(RDF_TYPE));
			for (const q of dataDS.match(focusNode, null, null)) if (!allowedPreds.has(termKey(q.predicate))) violations.push(viol({
				path: q.predicate,
				value: q.object
			}));
			break;
		}
		case "JSConstraintComponent": {
			if (!ctx.allowJS) break;
			const src = jsSource(shapesDS, params.js);
			ctx.jsCache ??= /* @__PURE__ */ new Map();
			const key = termKey(params.js);
			let fn = ctx.jsCache.get(key);
			if (!fn) {
				fn = compileJs(src, ctx.shapeTerm);
				ctx.jsCache.set(key, fn);
			}
			const boundValuesOf = (s, p) => valuesOf(dataDS, s, p);
			if (!fn(jsValue(value), value, focusNode, values, dataDS, termEquals, boundValuesOf)) violations.push(viol());
			break;
		}
		case "QualifiedMinCountConstraintComponent":
			if (values.filter((v) => {
				const innerCtx = {
					...ctx,
					shapeTerm: params.qualifiedValueShape,
					visited: /* @__PURE__ */ new Set()
				};
				return validateNodeAgainstShape(dataDS, shapesDS, params.qualifiedValueShape, v, innerCtx).length === 0;
			}).length < params.qualifiedMinCount) violations.push(viol());
			break;
		case "QualifiedMaxCountConstraintComponent": if (values.filter((v) => {
			const innerCtx = {
				...ctx,
				shapeTerm: params.qualifiedValueShape,
				visited: /* @__PURE__ */ new Set()
			};
			return validateNodeAgainstShape(dataDS, shapesDS, params.qualifiedValueShape, v, innerCtx).length === 0;
		}).length > params.qualifiedMaxCount) violations.push(viol());
	}
	return violations;
}
var PROPERTY_LEVEL_COMPONENTS = /* @__PURE__ */ new Set([
	"MinCountConstraintComponent",
	"MaxCountConstraintComponent",
	"EqualsConstraintComponent",
	"DisjointConstraintComponent",
	"LessThanConstraintComponent",
	"LessThanOrEqualsConstraintComponent",
	"UniqueLangConstraintComponent",
	"HasValueConstraintComponent",
	"QualifiedMinCountConstraintComponent",
	"QualifiedMaxCountConstraintComponent",
	"ClosedConstraintComponent"
]);
var NODE_LEVEL_SKIPPED_COMPONENTS = /* @__PURE__ */ new Set([
	"MinCountConstraintComponent",
	"MaxCountConstraintComponent",
	"EqualsConstraintComponent",
	"DisjointConstraintComponent",
	"LessThanConstraintComponent",
	"LessThanOrEqualsConstraintComponent",
	"UniqueLangConstraintComponent",
	"HasValueConstraintComponent",
	"QualifiedMinCountConstraintComponent",
	"QualifiedMaxCountConstraintComponent"
]);
function validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, focusNode, parentCtx, opts = {}) {
	const key = `${termKey(shapeTerm)}|${termKey(focusNode)}`;
	if (parentCtx.visited.has(key)) return [];
	parentCtx.visited.add(key);
	const shapeInfo = getShapeInfo(shapesDS, shapeTerm, parentCtx.shapeCache);
	const { constraints, deactivated, isPropertyShape, pathTerms } = shapeInfo;
	if (deactivated) {
		parentCtx.visited.delete(key);
		return [];
	}
	const violations = [];
	const ctx = {
		...parentCtx,
		shapeTerm
	};
	if (isPropertyShape) for (const pathTerm of pathTerms) {
		const values = resolvePath(dataDS, shapesDS, focusNode, pathTerm);
		const propCtx = {
			...ctx,
			path: pathTerm
		};
		for (const c of constraints) if (PROPERTY_LEVEL_COMPONENTS.has(c.component)) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, values, propCtx));
		else for (const v of values) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, v, values, propCtx));
	}
	else {
		for (const c of constraints) {
			if (NODE_LEVEL_SKIPPED_COMPONENTS.has(c.component)) continue;
			violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, [focusNode], ctx));
		}
		for (const propShape of opts.nodeLevelOnly ? [] : shapeInfo.propertyShapes) {
			const { constraints: propConstraints, deactivated: propDeactivated, pathTerms: propPathTerms } = getShapeInfo(shapesDS, propShape, parentCtx.shapeCache);
			if (propDeactivated) continue;
			for (const pathTerm of propPathTerms) {
				const values = resolvePath(dataDS, shapesDS, focusNode, pathTerm);
				const propCtx = {
					...ctx,
					shapeTerm: propShape,
					path: pathTerm
				};
				for (const c of propConstraints) if (PROPERTY_LEVEL_COMPONENTS.has(c.component)) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, values, propCtx));
				else for (const v of values) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, v, values, propCtx));
			}
		}
	}
	parentCtx.visited.delete(key);
	return violations;
}
/** Split mixed quads into shape/data datasets, mirroring validate(). */
function resolveDatasets(input) {
	const options = Array.isArray(input) ? { quads: input } : input;
	if (options.quads) {
		const detector = options.classify ? null : createShapeDetector();
		const sq = [], dq = [];
		for (const q of options.quads) ((options.classify ? options.classify(q) : detector.classify(q)) ? sq : dq).push(q);
		return {
			shapesDS: new Store(sq),
			dataDS: new Store(dq)
		};
	}
	return {
		shapesDS: new Store(options.shapes || []),
		dataDS: new Store(options.data || [])
	};
}
function findShapeTerm(shapesDS, iri) {
	const key = `NamedNode:${iri}`;
	for (const q of shapesDS) if (termKey(q.subject) === key) return q.subject;
	return null;
}
function defaultShapeTerm(shapesDS) {
	for (const key of findShapes(shapesDS)) {
		const t = getShapeTerm(shapesDS, key);
		if (!t) continue;
		const d = valuesOf(shapesDS, t, sh("deactivated"));
		if (d.length > 0 && d[0].value === "true") continue;
		return t;
	}
	return null;
}
function resolveShapeTerm(shapesDS, shapeIRI) {
	const term = shapeIRI ? findShapeTerm(shapesDS, shapeIRI) : defaultShapeTerm(shapesDS);
	if (!term) throw new Error(`extract: no matching NodeShape${shapeIRI ? ` for ${shapeIRI}` : ""}`);
	return term;
}
function localName(iri) {
	const i = Math.max(iri.lastIndexOf("#"), iri.lastIndexOf("/"), iri.lastIndexOf(":"));
	return i >= 0 ? iri.slice(i + 1) : iri;
}
var NUMERIC_LOCALNAMES = /* @__PURE__ */ new Set([
	"integer",
	"int",
	"long",
	"short",
	"byte",
	"nonNegativeInteger",
	"nonPositiveInteger",
	"positiveInteger",
	"negativeInteger",
	"unsignedInt",
	"unsignedLong",
	"unsignedShort",
	"unsignedByte",
	"decimal",
	"float",
	"double"
]);
var DATE_LOCALNAMES = /* @__PURE__ */ new Set([
	"date",
	"dateTime",
	"dateTimeStamp",
	"time",
	"gYear",
	"gYearMonth",
	"gMonth",
	"gMonthDay",
	"gDay"
]);
/** Cast an RDF literal to a native JS value based on its datatype. */
function castLiteral(term) {
	const local = term.datatype ? localName(term.datatype.value) : "";
	if (local === "boolean") return term.value === "true" || term.value === "1";
	if (NUMERIC_LOCALNAMES.has(local)) {
		const n = Number(term.value);
		return isNaN(n) ? term.value : n;
	}
	if (DATE_LOCALNAMES.has(local)) {
		const d = new Date(term.value);
		return isNaN(d.getTime()) ? term.value : d;
	}
	return term.value;
}
/** Shorten an IRI to prefix:local for POJO output when a context prefix matches; full IRI otherwise. */
function shortenDataIRI(iri, prefixes) {
	if (prefixes) {
		for (const [ns, prefix] of prefixes) if (iri.startsWith(ns)) return prefix ? `${prefix}:${iri.slice(ns.length)}` : iri.slice(ns.length);
	}
	return iri;
}
function termToPOJO(term, prefixes) {
	if (!term) return null;
	if (isLiteral(term)) return castLiteral(term);
	return shortenDataIRI(term.value, prefixes);
}
function pathKey(pathTerm) {
	return isNamedNode(pathTerm) ? localName(pathTerm.value) : termKey(pathTerm);
}
/**
* Property shapes extractable from a node shape: direct sh:property links plus
* PropertyShape members of sh:and/sh:or/sh:xone compositions (sh:not excluded —
* negated shapes describe what must NOT appear). Node-shape members contribute
* their own properties recursively.
* @returns {Map<string, Term>} termKey → shape term
*/
function collectPropertyShapes(shapesDS, shapeTerm, shapeCache) {
	const out = /* @__PURE__ */ new Map();
	const seen = /* @__PURE__ */ new Set();
	function visit(term) {
		const key = termKey(term);
		if (seen.has(key)) return;
		seen.add(key);
		const info = getShapeInfo(shapesDS, term, shapeCache);
		for (const p of info.propertyShapes) {
			const k = termKey(p);
			if (!out.has(k)) out.set(k, p);
		}
		if (info.pathTerms.length > 0) {
			const k = termKey(term);
			if (!out.has(k)) out.set(k, term);
		}
		for (const pred of [
			"and",
			"or",
			"xone"
		]) for (const head of valuesOf(shapesDS, term, sh(pred))) {
			let members;
			try {
				members = readList(shapesDS, head);
			} catch {
				members = [head];
			}
			for (const m of members) {
				if (!m || isLiteral(m)) continue;
				const minfo = getShapeInfo(shapesDS, m, shapeCache);
				if (minfo.isPropertyShape || minfo.pathTerms.length > 0) {
					const k = termKey(m);
					if (!out.has(k)) out.set(k, m);
				} else visit(m);
			}
		}
	}
	visit(shapeTerm);
	return out;
}
function sameValue(a, b) {
	if (Object.is(a, b)) return true;
	if (a && b && typeof a === "object" && typeof b === "object") return JSON.stringify(a) === JSON.stringify(b);
	return false;
}
/** A projected object with no keys — carries no validated facts. */
/**
* Precomputed extraction plan for a node shape, memoized on its shapeInfo:
* one entry per extractable property shape with name/nested/paths resolved
* once instead of per focus node.
*/
function projectionPlanFor(shapesDS, shapeTerm, shapeCache) {
	const info = getShapeInfo(shapesDS, shapeTerm, shapeCache);
	if (info.projectionPlan) return info.projectionPlan;
	const plan = [];
	for (const propShape of collectPropertyShapes(shapesDS, shapeTerm, shapeCache).values()) {
		const pInfo = getShapeInfo(shapesDS, propShape, shapeCache);
		if (pInfo.deactivated) continue;
		const names = valuesOf(shapesDS, propShape, sh("name"));
		const nodeShapes = valuesOf(shapesDS, propShape, sh("node"));
		const qualified = valuesOf(shapesDS, propShape, sh("qualifiedValueShape"));
		plan.push({
			shape: propShape,
			name: names[0]?.value || null,
			nested: nodeShapes[0] || (qualified.length > 0 ? qualified[0] : null),
			pathTerms: pInfo.pathTerms,
			gated: pInfo.constraints.length > 0
		});
	}
	info.projectionPlan = plan;
	return plan;
}
function isEmptyPOJO(v) {
	return v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date) && Object.keys(v).length === 0;
}
/** Is this term the head of an rdf:first/rdf:rest chain? */
function isListHead(ds, term) {
	return isNamedNode(term) || isBlankNode(term) ? valuesOf(ds, term, RDF_FIRST).length > 0 && valuesOf(ds, term, RDF_REST).length > 0 : false;
}
/**
* Project a single term: literals are cast, nodes with a declared sh:node
* shape recurse into nested POJOs, RDF list heads resolve to arrays.
*/
function projectTerm(dataDS, shapesDS, term, nodeShape, shapeCache, stack, maxDepth, options) {
	if (isLiteral(term)) return castLiteral(term);
	if (nodeShape) {
		const key = `${termKey(nodeShape)}|${termKey(term)}`;
		if (stack.has(key) || stack.size >= maxDepth) return term.value;
		stack.add(key);
		try {
			return pojoForNode(dataDS, shapesDS, nodeShape, term, shapeCache, stack, maxDepth, options);
		} finally {
			stack.delete(key);
		}
	}
	if (isListHead(dataDS, term)) try {
		return readList(dataDS, term).map((m) => projectTerm(dataDS, shapesDS, m, null, shapeCache, stack, maxDepth, options));
	} catch {}
	return termToPOJO(term, options?.prefixes);
}
function pojoForNode(dataDS, shapesDS, shapeTerm, focusNode, shapeCache, stack, maxDepth, options) {
	const obj = {};
	const pending = /* @__PURE__ */ new Map();
	for (const entry of projectionPlanFor(shapesDS, shapeTerm, shapeCache)) {
		if (entry.gated) {
			const gate = {
				visited: /* @__PURE__ */ new Set(),
				shapeCache,
				jsCache: /* @__PURE__ */ new Map(),
				allowJS: options?.allowJS === true
			};
			if (validateNodeAgainstShape(dataDS, shapesDS, entry.shape, focusNode, gate).length > 0) continue;
		}
		for (const pathTerm of entry.pathTerms) {
			const key = entry.name || pathKey(pathTerm);
			const values = resolvePath(dataDS, shapesDS, focusNode, pathTerm);
			if (values.length === 0) continue;
			if (!pending.has(key)) pending.set(key, []);
			const bucket = pending.get(key);
			for (const v of values) {
				const projected = projectTerm(dataDS, shapesDS, v, entry.nested, shapeCache, stack, maxDepth, options);
				if (isEmptyPOJO(projected)) continue;
				if (!bucket.some((x) => sameValue(x, projected))) bucket.push(projected);
			}
		}
	}
	for (const [key, vals] of pending) {
		if (vals.length === 0) continue;
		obj[key] = options.arrays || vals.length > 1 ? vals : vals[0];
	}
	return obj;
}
var escHTML = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
function recordValueHTML(v) {
	if (v === null || v === void 0 || v === "") return "<i>—</i>";
	if (typeof v === "boolean") return v ? "true" : "false";
	if (typeof v === "number" || typeof v === "bigint") return String(v);
	if (v instanceof Date) {
		if (isNaN(v)) return "<i>invalid date</i>";
		const iso = v.toISOString();
		const txt = !(v % 864e5) ? v.toLocaleDateString(void 0, {
			dateStyle: "medium",
			timeZone: "UTC"
		}) : v.toLocaleString(void 0, {
			dateStyle: "medium",
			timeStyle: "short"
		});
		return `<time datetime="${escHTML(iso)}">${escHTML(txt)}</time>`;
	}
	if (Array.isArray(v)) return v.length ? `<ul>${v.map((x) => `<li>${recordValueHTML(x)}</li>`).join("")}</ul>` : "<i>empty</i>";
	if (typeof v === "object") {
		const rows = Object.entries(v);
		return rows.length ? `<table><tbody>${rows.map(([k, x]) => `<tr><th scope="row">${escHTML(k)}</th><td>${recordValueHTML(x)}</td></tr>`).join("")}</tbody></table>` : "<i>empty</i>";
	}
	return escHTML(v);
}
/** Render one evaluate()/extract() POJO record as a semantic HTML table (no CSS). */
function recordTable(pojo) {
	return `<table><tbody>${Object.entries(pojo || {}).map(([k, v]) => `<tr><th scope="row">${escHTML(k)}</th><td>${recordValueHTML(v)}</td></tr>`).join("")}</tbody></table>`;
}
function quadKey(q) {
	return `${termKey(q.subject)}|${termKey(q.predicate)}|${termKey(q.object)}|${termKey(q.graph)}`;
}
/**
* Extract the sub-graph of `input` permitted by a shape.
* For each targeted node, keeps quads whose predicate is declared by a
* sh:property path (plus rdf:type), then recurses into object nodes via
* sh:node shapes or shapes targeting the object's rdf:type.
* RDF list chains hanging off kept quads are included whole.
*/
function extractGraph(input, shapeIRI, options = {}) {
	const { shapesDS, dataDS } = resolveDatasets(input);
	const shapeTerm = resolveShapeTerm(shapesDS, shapeIRI);
	const shapeCache = /* @__PURE__ */ new Map();
	const shapeByClass = /* @__PURE__ */ new Map();
	for (const key of findShapes(shapesDS)) {
		const t = getShapeTerm(shapesDS, key);
		if (!t) continue;
		for (const cls of valuesOf(shapesDS, t, sh("targetClass"))) if (!shapeByClass.has(termKey(cls))) shapeByClass.set(termKey(cls), t);
	}
	const out = [];
	const outKeys = /* @__PURE__ */ new Set();
	const visited = /* @__PURE__ */ new Set();
	const queue = resolveTargets(dataDS, shapesDS, shapeTerm).map((node) => ({
		node,
		shape: shapeTerm
	}));
	function emit(q) {
		const k = quadKey(q);
		if (outKeys.has(k)) return;
		outKeys.add(k);
		out.push(q);
	}
	function emitList(head) {
		const members = [];
		const seen = /* @__PURE__ */ new Set();
		let cur = head;
		while (cur && !termEquals(cur, RDF_NIL) && !seen.has(termKey(cur))) {
			seen.add(termKey(cur));
			for (const q of dataDS.match(cur, null, null)) if (termEquals(q.predicate, RDF_FIRST) || termEquals(q.predicate, RDF_REST)) emit(q);
			const f = valuesOf(dataDS, cur, RDF_FIRST);
			const r = valuesOf(dataDS, cur, RDF_REST);
			if (f.length === 1) members.push(f[0]);
			cur = r.length === 1 ? r[0] : null;
		}
		return members;
	}
	function childShape(node, viaShape) {
		if (viaShape) return viaShape;
		for (const t of valuesOf(dataDS, node, RDF_TYPE)) {
			const s = shapeByClass.get(termKey(t));
			if (s) return s;
		}
		return null;
	}
	while (queue.length > 0) {
		const { node, shape } = queue.pop();
		const vkey = `${termKey(shape)}|${termKey(node)}`;
		if (visited.has(vkey)) continue;
		visited.add(vkey);
		const info = getShapeInfo(shapesDS, shape, shapeCache);
		const plan = projectionPlanFor(shapesDS, shape, shapeCache);
		const allowed = plan.length === 0 && info.propertyShapes.length === 0 ? null : /* @__PURE__ */ new Set();
		const childShapes = /* @__PURE__ */ new Map();
		for (const entry of plan) for (const pathTerm of entry.pathTerms) {
			if (allowed) for (const k of pathPredicates(shapesDS, pathTerm)) allowed.add(k);
			for (const v of resolvePath(dataDS, shapesDS, node, pathTerm)) if (entry.nested && (isNamedNode(v) || isBlankNode(v))) childShapes.set(termKey(v), entry.nested);
		}
		for (const q of dataDS.match(node, null, null)) {
			const isType = termEquals(q.predicate, RDF_TYPE);
			if (allowed && !isType && !allowed.has(termKey(q.predicate)) && !childShapes.has(termKey(q.object))) continue;
			emit(q);
			if (isType || isLiteral(q.object)) continue;
			const members = isListHead(dataDS, q.object) ? emitList(q.object) : [q.object];
			for (const m of members) {
				if (isLiteral(m)) continue;
				const cs = childShape(m, childShapes.get(termKey(m)));
				if (cs) queue.push({
					node: m,
					shape: cs
				});
			}
		}
	}
	return out;
}
/**
* Project `input` through a shape into plain JavaScript objects.
* Literals are cast by sh:datatype/xsd type, sh:name (or the path's local
* name) becomes the key, sh:node recurses into nested objects, and RDF
* lists become arrays. Single-target shapes return one object; multiple
* targets return an array.
*
* @param {Quad[]|{quads?:Quad[], shapes?:Quad[], data?:Quad[]}} input
* @param {string} [shapeIRI]  NodeShape IRI (defaults to first non-deactivated shape)
* @param {Object} [options]   { arrays?: boolean (always emit arrays), maxDepth?: number,
*                               byNode?: boolean (return {focusValue: pojo} instead of pojo(s)) }
*/
function resolveShapeTermKey(input, shapeIRI) {
	const { shapesDS } = resolveDatasets(input);
	const t = resolveShapeTerm(shapesDS, shapeIRI);
	return t ? t.value : shapeIRI;
}
function extract(input, shapeIRI, options = {}) {
	const report = evaluate({
		...input,
		shape: shapeIRI,
		...options,
		byNode: options.byNode === true
	});
	const rec = report.records[resolveShapeTermKey(input, shapeIRI)] ?? Object.values(report.records)[0] ?? (options.byNode ? {} : []);
	if (options.byNode) return rec;
	if (Array.isArray(rec)) return rec.length === 1 ? rec[0] : rec;
	return rec && Object.keys(rec).length ? rec : {};
}
var EVAL_NODE_LEVEL_SKIP = [
	"MinCountConstraintComponent",
	"MaxCountConstraintComponent",
	"EqualsConstraintComponent",
	"DisjointConstraintComponent",
	"LessThanConstraintComponent",
	"LessThanOrEqualsConstraintComponent",
	"UniqueLangConstraintComponent",
	"HasValueConstraintComponent",
	"QualifiedMinCountConstraintComponent",
	"QualifiedMaxCountConstraintComponent"
];
/**
* Evaluate a graph against SHACL shapes — violations and records in one pass.
*
* @param {Object} options
* @param {Array}  [options.quads]   - All quads (auto-classified)
* @param {Array}  [options.shapes]  - Shape quads only
* @param {Array}  [options.data]    - Data quads only
* @param {string} [options.shape]   - Restrict to one shape IRI
* @param {boolean}[options.allowJS] - Opt-in sh:js execution (default false)
* @param {Object} [options.context] - Prefix context for messages/keys
* @param {boolean}[options.byNode]  - Key records by focus IRI (default true)
* @param {number} [options.maxDepth] - Projection recursion cap (default 32)
* @returns {{ conforms: boolean, violations: Array, records: Object }}
*/
function evaluate(options = {}) {
	const { shapesDS, dataDS } = resolveDatasets(options);
	const prefixes = buildPrefixes(options.context);
	const allowJS = options.allowJS === true;
	const byNode = options.byNode !== false;
	const maxDepth = options.maxDepth ?? 32;
	const shapeCache = /* @__PURE__ */ new Map();
	const jsCache = /* @__PURE__ */ new Map();
	let shapeTerms = findShapes(shapesDS).map((k) => getShapeTerm(shapesDS, k)).filter(Boolean);
	if (options.shape) {
		const wanted = resolveShapeTerm(shapesDS, options.shape);
		shapeTerms = wanted ? [wanted] : [];
	}
	const allViolations = [];
	const records = {};
	for (const shapeTerm of shapeTerms) {
		const deactivated = valuesOf(shapesDS, shapeTerm, sh("deactivated"));
		if (deactivated.length > 0 && (deactivated[0].value === "true" || deactivated[0] === true)) continue;
		const shapeKey = shapeTerm.value;
		const targets = resolveTargets(dataDS, shapesDS, shapeTerm);
		const vctx = {
			visited: /* @__PURE__ */ new Set(),
			shapeTerm,
			shapeCache,
			jsCache,
			allowJS,
			prefixes
		};
		for (const focusNode of targets) allViolations.push(...validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, focusNode, vctx));
		const kept = !getShapeInfo(shapesDS, shapeTerm, shapeCache).constraints.some((c) => !EVAL_NODE_LEVEL_SKIP.includes(c.component)) ? targets : targets.filter((t) => validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, t, {
			visited: /* @__PURE__ */ new Set(),
			shapeCache,
			jsCache,
			allowJS,
			prefixes
		}, { nodeLevelOnly: true }).length === 0);
		const pojoOptions = {
			...options,
			prefixes,
			allowJS
		};
		const pojos = kept.map((t) => pojoForNode(dataDS, shapesDS, shapeTerm, t, shapeCache, /* @__PURE__ */ new Set(), maxDepth, pojoOptions));
		if (byNode) {
			const out = {};
			kept.forEach((t, i) => {
				if (!isEmptyPOJO(pojos[i])) out[shortenDataIRI(t.value, prefixes)] = pojos[i];
			});
			records[shapeKey] = out;
		} else records[shapeKey] = pojos.filter((p) => !isEmptyPOJO(p));
	}
	const uniqueViolations = [];
	const seen = /* @__PURE__ */ new Set();
	for (const v of allViolations) {
		const k = `${v.focusNode?.value}|${v.path?.value || ""}|${v.component?.value}|${v.value?.value || ""}`;
		if (!seen.has(k)) {
			seen.add(k);
			uniqueViolations.push(v);
		}
	}
	return {
		conforms: uniqueViolations.length === 0,
		violations: uniqueViolations,
		records
	};
}
/**
* Validate data against SHACL shapes.
*
* @param {Object} options
* @param {Array}  [options.quads]   - All quads (auto-classified into shapes + data)
* @param {Array}  [options.shapes]  - Shape quads only
* @param {Array}  [options.data]    - Data quads only
* @param {Function} [options.classify] - Custom quad classifier
* @returns {{ conforms: boolean, results: Array }}
*/
function validate(options) {
	const report = evaluate(options);
	return {
		conforms: report.conforms,
		results: report.violations
	};
}
/**
* Stateful validator for repeated validation against the same shapes.
*/
var Validator = class {
	#shapeQuads;
	#options;
	constructor(shapeQuads, options = {}) {
		this.#shapeQuads = shapeQuads;
		this.#options = options;
	}
	validate(dataQuads) {
		return validate({
			shapes: this.#shapeQuads,
			data: dataQuads,
			allowJS: this.#options.allowJS,
			context: this.#options.context
		});
	}
};
// src/index.js
/**
* Update the value of a quad in MDLD text and return the updated text
*
* @param {Object} params - Parameters object
* @param {string} params.text - The original MDLD text
* @param {Object} params.quad - The quad to update (subject, predicate, object)
* @param {string} params.value - The new value to set
* @param {Object} [params.origin] - Origin object or ParseResult (if not provided, text will be parsed)
* @returns {string} Updated MDLD text, or original if update fails
*/
function updateValue({ text, quad, value, origin }) {
	const location = locate(quad, origin?.quadIndex ? origin : parse({ text }).origin);
	if (!location || !location.valueRange) return text;
	return text.substring(0, location.valueRange.start) + value + text.substring(location.valueRange.end);
}
export { DEFAULT_CONTEXT, DataFactory, MdldEditor, graph_default as QuadGraph, SUPPORTED_VOCABULARY, Store, Validator, createShapeDetector, deconstruct, evaluate, expandIRI, extract, extractGraph, generate, generateNode, hash, highlight, isSupportedTerm, locate, merge, parse, parseSemanticBlock, recordTable, render, shortenIRI, updateValue, validate };
