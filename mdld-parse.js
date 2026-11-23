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
var RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
var RDF_TYPE$1 = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
var XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
var XSD_BOOLEAN = "http://www.w3.org/2001/XMLSchema#boolean";
var XSD_INTEGER = "http://www.w3.org/2001/XMLSchema#integer";
var XSD_DOUBLE = "http://www.w3.org/2001/XMLSchema#double";
var URL_REGEX = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/;
// src/utils.js
var VALID_URI_SCHEMES = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file):/;
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
		const escapedValue = String(value).replace(/"/g, "\\\"");
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
				const escapedValue = String(term.value).replace(/"/g, "\\\"");
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
function expandIRI(term, ctx) {
	if (term == null) return null;
	const cacheKey = `${term}|${ctx["@vocab"] || ""}|${Object.keys(ctx).filter((k) => k !== "@vocab").sort().map((k) => `${k}:${ctx[k]}`).join(",")}`;
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
	if (!iri || !VALID_URI_SCHEMES.test(iri)) return iri;
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
	const langMatch = infoString.match(/^([^\s{]+)/);
	const lang = langMatch ? langMatch[1] : "";
	const attrsMatch = infoString.match(/\{([^}]+)\}/);
	const attrs = attrsMatch ? attrsMatch[1] : null;
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
	let pos = closeBracket + 1;
	while (pos < line.length && (line[pos] === " " || line[pos] === "	")) pos++;
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
	let contentStart = depth;
	while (contentStart < line.length && (line[contentStart] === " " || line[contentStart] === "	")) contentStart++;
	const trimmed = line.slice(contentStart);
	const attrsMatch = trimmed.match(/\s*\{([^}]+)\}\s*$/);
	let content = trimmed;
	let attrs = null;
	if (attrsMatch) {
		attrs = attrsMatch[1];
		content = trimmed.slice(0, -attrsMatch[0].length).trim();
	}
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
	let pos = 0;
	while (pos < line.length && (line[pos] === " " || line[pos] === "	")) pos++;
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
	while (contentStart < line.length && (line[contentStart] === " " || line[contentStart] === "	")) contentStart++;
	let content = line.slice(contentStart);
	let attrs = null;
	const attrsMatch = content.match(/\s*\{([^}]+)\}\s*$/);
	if (attrsMatch) {
		attrs = attrsMatch[1];
		content = content.slice(0, -attrsMatch[0].length).trim();
	}
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
	let contentStart = 1;
	while (contentStart < line.length && (line[contentStart] === " " || line[contentStart] === "	")) contentStart++;
	let content = line.slice(contentStart);
	let attrs = null;
	const attrsMatch = content.match(/\s*\{([^}]+)\}\s*$/);
	if (attrsMatch) {
		attrs = attrsMatch[1];
		content = content.slice(0, -attrsMatch[0].length).trim();
	}
	return {
		content,
		attrs
	};
}
/**
* Detect standalone subject: {=...} with optional whitespace
* EBNF: standaloneSubject = whitespace*, "{", "=", ( iriRef | "#", fragment ), "}", whitespace*
*/
function detectStandaloneSubject(line) {
	let pos = 0;
	while (pos < line.length && (line[pos] === " " || line[pos] === "	")) pos++;
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
	pos++;
	while (pos < line.length && (line[pos] === " " || line[pos] === "	")) pos++;
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
	let pos = startPos;
	while (pos < text.length && (text[pos] === " " || text[pos] === "	")) pos++;
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
	if (!url.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/)) return null;
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
			if (angleUrl.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:/)) {
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
var FENCE_CLOSE_PATTERNS = /* @__PURE__ */ new Map();
function getFenceClosePattern(fenceChar) {
	if (!FENCE_CLOSE_PATTERNS.has(fenceChar)) FENCE_CLOSE_PATTERNS.set(fenceChar, new RegExp(`^(${fenceChar}{3,})`));
	return FENCE_CLOSE_PATTERNS.get(fenceChar);
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
function createListToken(type, line, lineStart, pos, match) {
	const attrs = match[4] || null;
	const rangeInfo = calcRangeInfo(line, attrs, lineStart, match[1].length + (match[2] ? match[2].length : 0), match[3].length);
	return createToken(type, [lineStart, pos - 1], match[3].trim(), attrs, rangeInfo.attrsRange, rangeInfo.valueRange, { indent: match[1].length });
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
	return term?.value === RDF_TYPE$1;
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
	return quads.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));
}
var generatePrefixDeclaration = (prefix, namespace) => `[${prefix}] <${namespace}>\n`;
function generateLiteralText(quad, context) {
	let annotation = shortenIRI(quad.predicate.value, context);
	if (quad.object.language) annotation += ` @${quad.object.language}`;
	else if (quad.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string") annotation += ` ^^${shortenIRI(quad.object.datatype.value, context)}`;
	const rawValue = quad.object.value || quad.object;
	const value = typeof rawValue === "string" ? rawValue : String(rawValue);
	const datatype = quad.object.datatype?.value || "";
	if (value.includes("\n")) return `~~~ {${annotation}}\n${value}\n~~~\n\n`;
	if (datatype.includes("integer") || datatype.includes("decimal") || datatype.includes("double") || datatype.includes("float")) return `\`${value}\` {${annotation}}\n`;
	if (datatype.includes("date") || datatype.includes("time")) return `*${value}* {${annotation}}\n`;
	if (datatype.includes("boolean")) return `**${value}** {${annotation}}\n`;
	return `[${value}] {${annotation}}\n`;
}
var generateObjectText = (quad, context, labelLookup = null, filteredGroups = null, renderedQuads = null, compactInline = true, compactStats = null) => {
	const objShort = shortenIRI(quad.object.value, context);
	const predShort = shortenIRI(quad.predicate.value, context);
	const displayText = labelLookup && labelLookup.has(quad.object.value) ? labelLookup.get(quad.object.value).value : objShort;
	let inlineAnnotation = "";
	if (compactInline && filteredGroups && labelLookup && renderedQuads) {
		const filtered = filteredGroups.get(quad.object.value);
		if (filtered) {
			const { types } = filtered;
			const hasLabel = labelLookup.has(quad.object.value);
			if (!(types.some((t) => renderedQuads.has(t)) || hasLabel && types.some((t) => t.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && renderedQuads.has(t)))) {
				const typeAnnotations = types.length > 0 ? types.map((t) => "." + shortenIRI(t.object.value, context)).sort().join(" ") : "";
				const labelAnnotation = hasLabel ? "label" : "";
				if (typeAnnotations || labelAnnotation) {
					inlineAnnotation = " " + [typeAnnotations, labelAnnotation].filter(Boolean).join(" ");
					if (compactStats) compactStats.inlineAnnotations++;
					types.forEach((q) => renderedQuads.add(q));
					if (hasLabel) {
						const labelQuad = types.find((q) => q.predicate.value === RDFS_LABEL);
						if (labelQuad) renderedQuads.add(labelQuad);
					}
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
		const rawValue = quad.object.value || quad.object;
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
			const fenceMatch = trimmedLine.match(getFenceClosePattern(fenceChar));
			if (fenceMatch && fenceMatch[1] === expectedFence) {
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
		const match = [
			line,
			indentStr,
			result.marker,
			result.content,
			result.attrs
		];
		tokens.push(createListToken("list", line, lineStart, pos, match));
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
var iriCache = /* @__PURE__ */ new Map();
var CACHE_SIZE_LIMIT = 1e3;
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
		const sComp = a.subject.value.localeCompare(b.subject.value);
		if (sComp !== 0) return sComp;
		const pComp = a.predicate.value.localeCompare(b.predicate.value);
		if (pComp !== 0) return pComp;
		const oComp = a.object.value.localeCompare(b.object.value);
		if (oComp !== 0) return oComp;
		const tComp = String(a.object.termType).localeCompare(String(b.object.termType));
		if (tComp !== 0) return tComp;
		const dtA = a.object.datatype?.value ?? a.object.datatype ?? "";
		const dtB = b.object.datatype?.value ?? b.object.datatype ?? "";
		const dtComp = String(dtA).localeCompare(String(dtB));
		if (dtComp !== 0) return dtComp;
		return String(a.object.language ?? "").localeCompare(String(b.object.language ?? ""));
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
	const sortedPrefixes = Object.entries(context).sort(([a], [b]) => a.localeCompare(b));
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
		const labelQuad = subjectQuads.find((q) => q.predicate.value === RDFS_LABEL);
		if (hasLabel && (!labelQuad || !renderedQuads.has(labelQuad))) {
			const langTag = labelEntry.language ? " @" + labelEntry.language : "";
			annotations += (annotations ? " " : "") + "label" + langTag;
		}
		const annotationStr = annotations ? " " + annotations : "";
		textParts.push(`## ${displayName} {=${shortSubject}${annotationStr}}\n`);
		types.forEach((t) => renderedQuads.add(t));
		if (labelQuad) renderedQuads.add(labelQuad);
		const headingLabel = hasLabel ? labelEntry.value : null;
		sortQuadsByPredicate(literals).forEach((quad) => {
			if (quad.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && quad.object.value === headingLabel) return;
			textParts.push(generateLiteralText(quad, context));
		});
		sortQuadsByPredicate(objects).forEach((quad) => {
			if (renderedQuads.has(quad)) return;
			textParts.push(generateObjectText(quad, context, labelLookup, filteredGroups, renderedQuads, compactInline, compactStats));
		});
		if (subjectIRI === primarySubjectIRI && reverseIndex && reverseIndex.has(subjectIRI)) {
			const reverseQuads = reverseIndex.get(subjectIRI);
			reverseQuads.sort((a, b) => a.predicate.value.localeCompare(b.predicate.value));
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
					const labelAnnotation = hasLabel ? "label" + (reverseSubjectLabelEntry.language ? " @" + reverseSubjectLabelEntry.language : "") : "";
					if (typeAnnotations || labelAnnotation) {
						inlineAnnotation = " " + [typeAnnotations, labelAnnotation].filter(Boolean).join(" ");
						compactStats.inlineAnnotations++;
						types.forEach((q) => renderedQuads.add(q));
						if (hasLabel) {
							const labelQuad = subjectQuads.find((q) => q.predicate.value === RDFS_LABEL);
							if (labelQuad) renderedQuads.add(labelQuad);
						}
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
		labelsBySubject.get(subjectIRI).push(quad.object);
	}
	const selectBestLabel = (candidates) => {
		if (candidates.length === 0) return null;
		candidates.sort((a, b) => {
			const lenDiff = a.value.length - b.value.length;
			return lenDiff !== 0 ? lenDiff : a.value.localeCompare(b.value);
		});
		return candidates[0];
	};
	for (const [subjectIRI, labels] of labelsBySubject) {
		let selectedLabel = null;
		if (lang) selectedLabel = selectBestLabel(labels.filter((lit) => lit.language === lang));
		if (!selectedLabel) selectedLabel = selectBestLabel(labels.filter((lit) => !lit.language));
		if (!selectedLabel) selectedLabel = selectBestLabel(labels.filter((lit) => lit.language === "en"));
		if (!selectedLabel) selectedLabel = selectBestLabel(labels.filter((lit) => lit.language));
		if (selectedLabel) labelLookup.set(subjectIRI, {
			value: selectedLabel.value,
			language: selectedLabel.language || null
		});
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
			if (new RegExp(`^${codeBlock.fenceChar}{${codeBlock.fenceLength},}\\s*$`).test(line.trim())) {
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
function hasFollowingAnnotation(code, endPos) {
	let i = endPos;
	while (i < code.length && code[i] !== "\n" && code[i] !== "\r") {
		if (code[i] === "{") return true;
		i++;
	}
	return false;
}
function processMarkdownFormattingAtPosition(code, startPos) {
	const char = code[startPos];
	if (char === "*" && startPos + 1 < code.length && code[startPos + 1] === "*") {
		const endPos = code.indexOf("**", startPos + 2);
		if (endPos !== -1) {
			const content = code.slice(startPos + 2, endPos);
			const color = hasFollowingAnnotation(code, endPos + 2) ? ` style="color: ${TOKEN_COLORS.marker}"` : "";
			return {
				html: `<span${color}>**</span><strong>${escapeHtml(content)}</strong><span${color}>**</span>`,
				nextIndex: endPos + 2
			};
		}
	}
	if (char === "_" && startPos + 1 < code.length && code[startPos + 1] === "_") {
		const endPos = code.indexOf("__", startPos + 2);
		if (endPos !== -1) {
			const content = code.slice(startPos + 2, endPos);
			const color = hasFollowingAnnotation(code, endPos + 2) ? ` style="color: ${TOKEN_COLORS.marker}"` : "";
			return {
				html: `<span${color}>__</span><strong>${escapeHtml(content)}</strong><span${color}>__</span>`,
				nextIndex: endPos + 2
			};
		}
	}
	if (char === "*") {
		const endPos = code.indexOf("*", startPos + 1);
		if (endPos !== -1) {
			const content = code.slice(startPos + 1, endPos);
			const color = hasFollowingAnnotation(code, endPos + 1) ? ` style="color: ${TOKEN_COLORS.marker}"` : "";
			return {
				html: `<span${color}>*</span><em>${escapeHtml(content)}</em><span${color}>*</span>`,
				nextIndex: endPos + 1
			};
		}
	}
	if (char === "_") {
		const endPos = code.indexOf("_", startPos + 1);
		if (endPos !== -1) {
			const content = code.slice(startPos + 1, endPos);
			const color = hasFollowingAnnotation(code, endPos + 1) ? ` style="color: ${TOKEN_COLORS.marker}"` : "";
			return {
				html: `<span${color}>_</span><em>${escapeHtml(content)}</em><span${color}>_</span>`,
				nextIndex: endPos + 1
			};
		}
	}
	if (char === "`") {
		const endPos = code.indexOf("`", startPos + 1);
		if (endPos !== -1) {
			const content = code.slice(startPos + 1, endPos);
			const color = hasFollowingAnnotation(code, endPos + 1) ? ` style="color: ${TOKEN_COLORS.marker}"` : "";
			return {
				html: `<span${color}>\`</span><code style="background-color:#7773">${escapeHtml(content)}</code><span${color}>\`</span>`,
				nextIndex: endPos + 1
			};
		}
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
	const prefixRegex = /^\[(\w+)\]\s*<([^>]*)>\s*$/gm;
	let match;
	while ((match = prefixRegex.exec(code)) !== null) {
		const prefixName = match[1];
		let iri = match[2];
		if (iri.includes(":")) {
			const colonIndex = iri.indexOf(":");
			if (colonIndex > 0) {
				const refPrefix = iri.slice(0, colonIndex);
				const refSuffix = iri.slice(colonIndex + 1);
				if (prefixes.has(refPrefix)) iri = prefixes.get(refPrefix) + refSuffix;
			}
		}
		prefixes.set(prefixName, iri);
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
		if (part.startsWith("?") || part.startsWith("!")) {
			const marker = part[0];
			const rest = part.slice(1);
			const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
			result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
			continue;
		}
		if (part.startsWith("^^")) {
			const marker = "^^";
			const rest = part.slice(2);
			const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
			result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
			continue;
		}
		if (part.startsWith("@")) {
			const marker = "@";
			const rest = part.slice(1);
			const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
			result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
			continue;
		}
		if (part.startsWith(".")) {
			const marker = ".";
			const rest = part.slice(1);
			const color = isRetracted ? TOKEN_COLORS.retraction : TOKEN_COLORS.marker;
			result += `<span style="color: ${color}">${escapeHtml(marker)}</span>${renderTerm(rest, isRetracted, prefixes)}`;
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
		if (char === "-" || char === "*") {
			const prevChar = i > 0 ? code[i - 1] : "\n";
			if (prevChar === "\n" || prevChar === "\r" || prevChar === " " || prevChar === "	") {
				if (code[i + 1] === " ") {
					const markerColor = hasFollowingAnnotation(code, i + 2) ? `color: ${TOKEN_COLORS.marker}; opacity: 0.85` : "";
					result += `<span style="${markerColor}">${escapeHtml(char)}</span>`;
					i++;
					continue;
				}
			}
		}
		if (char === ">") {
			const prevChar = i > 0 ? code[i - 1] : "\n";
			if (prevChar === "\n" || prevChar === "\r" || prevChar === " " || prevChar === "	") {
				if (code[i + 1] === " ") {
					const markerColor = hasFollowingAnnotation(code, i + 2) ? `color: ${TOKEN_COLORS.marker}; opacity: 0.85` : "";
					result += `<span style="${markerColor}">${escapeHtml(char)}</span>`;
					i++;
					continue;
				}
			}
		}
		result += escapeHtml(char);
		i++;
	}
	return result;
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/checkPrivateRedeclaration.js
function _checkPrivateRedeclaration(e, t) {
	if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/classPrivateMethodInitSpec.js
function _classPrivateMethodInitSpec(e, a) {
	_checkPrivateRedeclaration(e, a), a.add(e);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/classPrivateFieldInitSpec.js
function _classPrivateFieldInitSpec(e, t, a) {
	_checkPrivateRedeclaration(e, t), t.set(e, a);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/assertClassBrand.js
function _assertClassBrand(e, t, n) {
	if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
	throw new TypeError("Private element is not present on this object");
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/classPrivateFieldGet2.js
function _classPrivateFieldGet2(s, a) {
	return s.get(_assertClassBrand(s, a));
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/classPrivateFieldSet2.js
function _classPrivateFieldSet2(s, a, r) {
	return s.set(_assertClassBrand(s, a), r), r;
}
// shapes/validator.js
var _Symbol$iterator;
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
var _quads = /* @__PURE__ */ new WeakMap();
var _bySubject = /* @__PURE__ */ new WeakMap();
var _byPredicate = /* @__PURE__ */ new WeakMap();
var _Store_brand = /* @__PURE__ */ new WeakSet();
_Symbol$iterator = Symbol.iterator;
var Store = class Store {
	constructor(quads) {
		_classPrivateMethodInitSpec(this, _Store_brand);
		_classPrivateFieldInitSpec(this, _quads, /* @__PURE__ */ new Set());
		_classPrivateFieldInitSpec(this, _bySubject, /* @__PURE__ */ new Map());
		_classPrivateFieldInitSpec(this, _byPredicate, /* @__PURE__ */ new Map());
		if (quads) for (const q of quads) this.add(q);
	}
	get size() {
		return _classPrivateFieldGet2(_quads, this).size;
	}
	add(q) {
		if (_classPrivateFieldGet2(_quads, this).has(q)) return this;
		_classPrivateFieldGet2(_quads, this).add(q);
		_assertClassBrand(_Store_brand, this, _addToIndex).call(this, _classPrivateFieldGet2(_bySubject, this), q.subject, q);
		_assertClassBrand(_Store_brand, this, _addToIndex).call(this, _classPrivateFieldGet2(_byPredicate, this), q.predicate, q);
		return this;
	}
	delete(q) {
		for (const x of _classPrivateFieldGet2(_quads, this)) {
			if (!quadEq(x, q)) continue;
			_classPrivateFieldGet2(_quads, this).delete(x);
			_assertClassBrand(_Store_brand, this, _deleteFromIndex).call(this, _classPrivateFieldGet2(_bySubject, this), x.subject, x);
			_assertClassBrand(_Store_brand, this, _deleteFromIndex).call(this, _classPrivateFieldGet2(_byPredicate, this), x.predicate, x);
			break;
		}
		return this;
	}
	has(q) {
		for (const x of _classPrivateFieldGet2(_quads, this)) if (quadEq(x, q)) return true;
		return false;
	}
	*[_Symbol$iterator]() {
		yield* _classPrivateFieldGet2(_quads, this);
	}
	match(s, p, o, g) {
		let candidates = _classPrivateFieldGet2(_quads, this);
		if (s) candidates = _assertClassBrand(_Store_brand, this, _getSmaller).call(this, candidates, _classPrivateFieldGet2(_bySubject, this), s);
		if (p) candidates = _assertClassBrand(_Store_brand, this, _getSmaller).call(this, candidates, _classPrivateFieldGet2(_byPredicate, this), p);
		const r = [];
		for (const q of candidates) if ((!s || termEquals(q.subject, s)) && (!p || termEquals(q.predicate, p)) && (!o || termEquals(q.object, o)) && (!g || termEquals(q.graph, g))) r.push(q);
		return new Store(r);
	}
};
function _addToIndex(index, term, quad) {
	const key = termKey(term);
	let quads = index.get(key);
	if (!quads) index.set(key, quads = /* @__PURE__ */ new Set());
	quads.add(quad);
}
function _deleteFromIndex(index, term, quad) {
	const key = termKey(term);
	const quads = index.get(key);
	if (!quads) return;
	quads.delete(quad);
	if (quads.size === 0) index.delete(key);
}
function _getSmaller(current, index, term) {
	const indexed = index.get(termKey(term));
	if (!indexed) return EMPTY_QUADS;
	return indexed.size < current.size ? indexed : current;
}
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
/** Get all instances of a class (including rdfs:subClassOf chain). */
function instancesOf(ds, classIRI) {
	const classes = /* @__PURE__ */ new Set([termKey(classIRI)]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const q of ds.match(null, nn(RDFS + "subClassOf"), null)) if (classes.has(termKey(q.object)) && !classes.has(termKey(q.subject))) {
			classes.add(termKey(q.subject));
			changed = true;
		}
	}
	const out = [];
	for (const q of ds.match(null, RDF_TYPE, null)) if (classes.has(termKey(q.object))) out.push(q.subject);
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
	if (params.class) constraints.push({
		component: "ClassConstraintComponent",
		params: { class: params.class },
		messages,
		severities
	});
	if (params.datatype) constraints.push({
		component: "DatatypeConstraintComponent",
		params: { datatype: params.datatype },
		messages,
		severities
	});
	if (params.nodeKind) constraints.push({
		component: "NodeKindConstraintComponent",
		params: { nodeKind: params.nodeKind },
		messages,
		severities
	});
	if (params.minCount != null) constraints.push({
		component: "MinCountConstraintComponent",
		params: { minCount: parseInt(params.minCount.value) },
		messages,
		severities
	});
	if (params.maxCount != null) constraints.push({
		component: "MaxCountConstraintComponent",
		params: { maxCount: parseInt(params.maxCount.value) },
		messages,
		severities
	});
	if (params.minExclusive) constraints.push({
		component: "MinExclusiveConstraintComponent",
		params: { minExclusive: params.minExclusive },
		messages,
		severities
	});
	if (params.maxExclusive) constraints.push({
		component: "MaxExclusiveConstraintComponent",
		params: { maxExclusive: params.maxExclusive },
		messages,
		severities
	});
	if (params.minInclusive) constraints.push({
		component: "MinInclusiveConstraintComponent",
		params: { minInclusive: params.minInclusive },
		messages,
		severities
	});
	if (params.maxInclusive) constraints.push({
		component: "MaxInclusiveConstraintComponent",
		params: { maxInclusive: params.maxInclusive },
		messages,
		severities
	});
	if (params.minLength != null) constraints.push({
		component: "MinLengthConstraintComponent",
		params: { minLength: parseInt(params.minLength.value) },
		messages,
		severities
	});
	if (params.maxLength != null) constraints.push({
		component: "MaxLengthConstraintComponent",
		params: { maxLength: parseInt(params.maxLength.value) },
		messages,
		severities
	});
	if (params.pattern) constraints.push({
		component: "PatternConstraintComponent",
		params: {
			pattern: params.pattern.value,
			flags: params.flags?.value || ""
		},
		messages,
		severities
	});
	if (params.languageIn) constraints.push({
		component: "LanguageInConstraintComponent",
		params: { languageIn: Array.isArray(params.languageIn) ? readList(shapesDS, params.languageIn[0]) : readList(shapesDS, params.languageIn) },
		messages,
		severities
	});
	if (params.uniqueLang) constraints.push({
		component: "UniqueLangConstraintComponent",
		params: { uniqueLang: params.uniqueLang.value === "true" },
		messages,
		severities
	});
	if (params.equals) constraints.push({
		component: "EqualsConstraintComponent",
		params: { equals: params.equals },
		messages,
		severities
	});
	if (params.disjoint) constraints.push({
		component: "DisjointConstraintComponent",
		params: { disjoint: params.disjoint },
		messages,
		severities
	});
	if (params.lessThan) constraints.push({
		component: "LessThanConstraintComponent",
		params: { lessThan: params.lessThan },
		messages,
		severities
	});
	if (params.lessThanOrEquals) constraints.push({
		component: "LessThanOrEqualsConstraintComponent",
		params: { lessThanOrEquals: params.lessThanOrEquals },
		messages,
		severities
	});
	if (params.not) {
		const notTerms = Array.isArray(params.not) ? params.not : [params.not];
		for (const notTerm of notTerms) constraints.push({
			component: "NotConstraintComponent",
			params: { not: notTerm },
			messages,
			severities
		});
	}
	if (params.and) constraints.push({
		component: "AndConstraintComponent",
		params: { and: Array.isArray(params.and) ? readList(shapesDS, params.and[0]) : readList(shapesDS, params.and) },
		messages,
		severities
	});
	if (params.or) constraints.push({
		component: "OrConstraintComponent",
		params: { or: Array.isArray(params.or) ? readList(shapesDS, params.or[0]) : readList(shapesDS, params.or) },
		messages,
		severities
	});
	if (params.xone) constraints.push({
		component: "XoneConstraintComponent",
		params: { xone: Array.isArray(params.xone) ? readList(shapesDS, params.xone[0]) : readList(shapesDS, params.xone) },
		messages,
		severities
	});
	if (params.node) constraints.push({
		component: "NodeConstraintComponent",
		params: { node: params.node },
		messages,
		severities
	});
	if (params.hasValue) constraints.push({
		component: "HasValueConstraintComponent",
		params: { hasValue: params.hasValue },
		messages,
		severities
	});
	if (params.in) constraints.push({
		component: "InConstraintComponent",
		params: { in: Array.isArray(params.in) ? readList(shapesDS, params.in[0]) : readList(shapesDS, params.in) },
		messages,
		severities
	});
	if (params.closed != null) constraints.push({
		component: "ClosedConstraintComponent",
		params: {
			closed: params.closed !== false && !(isLiteral(params.closed) && ["false", "0"].includes(params.closed.value.toLowerCase())),
			ignoredProperties: params.ignoredProperties ? Array.isArray(params.ignoredProperties) ? readList(shapesDS, params.ignoredProperties[0]) : readList(shapesDS, params.ignoredProperties) : []
		},
		messages,
		severities
	});
	if (params.js) {
		const jsTerms = Array.isArray(params.js) ? params.js : [params.js];
		for (const jsTerm of jsTerms) constraints.push({
			component: "JSConstraintComponent",
			params: { js: jsTerm },
			messages,
			severities
		});
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
	const results = includeStart ? [start] : [];
	const visited = /* @__PURE__ */ new Set();
	const queue = [start];
	for (let cursor = 0; cursor < queue.length; cursor++) {
		const cur = queue[cursor];
		const k = termKey(cur);
		if (visited.has(k)) continue;
		visited.add(k);
		for (const next of valuesOf(ds, cur, pred)) {
			results.push(next);
			queue.push(next);
		}
	}
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
	switch (component) {
		case "ClassConstraintComponent":
			if (!isNamedNode(value) && !isBlankNode(value)) {
				violations.push(viol());
				break;
			}
			if (!valuesOf(dataDS, value, RDF_TYPE).some((t) => {
				const supers = /* @__PURE__ */ new Set([termKey(t)]);
				let changed = true;
				while (changed) {
					changed = false;
					for (const q of dataDS.match(null, nn(RDFS + "subClassOf"), null)) if (supers.has(termKey(q.subject)) && !supers.has(termKey(q.object))) {
						supers.add(termKey(q.object));
						changed = true;
					}
				}
				return supers.has(termKey(params.class));
			})) violations.push(viol());
			break;
		case "DatatypeConstraintComponent":
			if (!isLiteral(value) || !termEquals(value.datatype, params.datatype)) violations.push(viol());
			break;
		case "NodeKindConstraintComponent":
			if (!checkNodeKind(value, params.nodeKind)) violations.push(viol());
			break;
		case "MinCountConstraintComponent":
			if (values.length < params.minCount) violations.push(viol());
			break;
		case "MaxCountConstraintComponent":
			if (values.length > params.maxCount) violations.push(viol());
			break;
		case "MinInclusiveConstraintComponent": {
			if (!isLiteral(value)) break;
			const cmp = compareValues(value, params.minInclusive);
			if (isNaN(cmp)) break;
			if (cmp < 0) violations.push(viol());
			break;
		}
		case "MaxInclusiveConstraintComponent": {
			if (!isLiteral(value)) break;
			const cmp = compareValues(value, params.maxInclusive);
			if (isNaN(cmp)) break;
			if (cmp > 0) violations.push(viol());
			break;
		}
		case "MinExclusiveConstraintComponent": {
			if (!isLiteral(value)) break;
			const cmp = compareValues(value, params.minExclusive);
			if (isNaN(cmp)) break;
			if (cmp <= 0) violations.push(viol());
			break;
		}
		case "MaxExclusiveConstraintComponent": {
			if (!isLiteral(value)) break;
			const cmp = compareValues(value, params.maxExclusive);
			if (isNaN(cmp)) break;
			if (cmp >= 0) violations.push(viol());
			break;
		}
		case "MinLengthConstraintComponent":
			if (!isLiteral(value)) break;
			if (value.value.length < params.minLength) violations.push(viol());
			break;
		case "MaxLengthConstraintComponent":
			if (!isLiteral(value)) break;
			if (value.value.length > params.maxLength) violations.push(viol());
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
			ctx.jsCache ?? (ctx.jsCache = /* @__PURE__ */ new Map());
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
		for (const c of constraints) if ([
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
		].includes(c.component)) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, values, propCtx));
		else for (const v of values) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, v, values, propCtx));
	}
	else {
		for (const c of constraints) {
			if ([
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
			].includes(c.component)) continue;
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
				for (const c of propConstraints) if ([
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
				].includes(c.component)) violations.push(...evalConstraint(c, dataDS, shapesDS, focusNode, focusNode, values, propCtx));
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
function extract(input, shapeIRI, options = {}) {
	const { shapesDS, dataDS } = resolveDatasets(input);
	const shapeTerm = resolveShapeTerm(shapesDS, shapeIRI);
	const targets = resolveTargets(dataDS, shapesDS, shapeTerm);
	const shapeCache = /* @__PURE__ */ new Map();
	const maxDepth = options.maxDepth ?? 32;
	const NODE_LEVEL_SKIP = [
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
	const kept = !getShapeInfo(shapesDS, shapeTerm, shapeCache).constraints.some((c) => !NODE_LEVEL_SKIP.includes(c.component)) ? targets : targets.filter((t) => validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, t, {
		visited: /* @__PURE__ */ new Set(),
		shapeCache,
		jsCache: /* @__PURE__ */ new Map(),
		allowJS: options.allowJS === true
	}, { nodeLevelOnly: true }).length === 0);
	const prefixes = options.prefixes ?? buildPrefixes(options.context ?? (Array.isArray(input) ? null : input?.context));
	const pojoOptions = {
		...options,
		prefixes
	};
	const pojos = kept.map((t) => pojoForNode(dataDS, shapesDS, shapeTerm, t, shapeCache, /* @__PURE__ */ new Set(), maxDepth, pojoOptions));
	if (options.byNode) {
		const out = {};
		kept.forEach((t, i) => {
			if (!isEmptyPOJO(pojos[i])) out[shortenDataIRI(t.value, prefixes)] = pojos[i];
		});
		return out;
	}
	const nonEmpty = pojos.filter((p) => !isEmptyPOJO(p));
	if (targets.length === 1) return nonEmpty[0] ?? {};
	return nonEmpty;
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
	const { shapesDS, dataDS } = resolveDatasets(options);
	const prefixes = buildPrefixes(options.context);
	const allViolations = [];
	const shapeKeys = findShapes(shapesDS);
	const shapeCache = /* @__PURE__ */ new Map();
	for (const key of shapeKeys) {
		const shapeTerm = getShapeTerm(shapesDS, key);
		if (!shapeTerm) continue;
		const deactivated = valuesOf(shapesDS, shapeTerm, sh("deactivated"));
		if (deactivated.length > 0 && (deactivated[0].value === "true" || deactivated[0] === true)) continue;
		const targets = resolveTargets(dataDS, shapesDS, shapeTerm);
		const ctx = {
			visited: /* @__PURE__ */ new Set(),
			shapeTerm,
			shapeCache,
			jsCache: /* @__PURE__ */ new Map(),
			allowJS: options.allowJS === true,
			prefixes
		};
		for (const focusNode of targets) allViolations.push(...validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, focusNode, ctx));
	}
	const uniqueViolations = [];
	const seen = /* @__PURE__ */ new Set();
	for (const v of allViolations) {
		const key = `${v.focusNode?.value}|${v.path?.value || ""}|${v.component?.value}|${v.value?.value || ""}`;
		if (!seen.has(key)) {
			seen.add(key);
			uniqueViolations.push(v);
		}
	}
	return {
		conforms: uniqueViolations.length === 0,
		results: uniqueViolations
	};
}
var _shapeQuads = /* @__PURE__ */ new WeakMap();
var _options = /* @__PURE__ */ new WeakMap();
/**
* Stateful validator for repeated validation against the same shapes.
*/
var Validator = class {
	constructor(shapeQuads, options = {}) {
		_classPrivateFieldInitSpec(this, _shapeQuads, void 0);
		_classPrivateFieldInitSpec(this, _options, void 0);
		_classPrivateFieldSet2(_shapeQuads, this, shapeQuads);
		_classPrivateFieldSet2(_options, this, options);
	}
	validate(dataQuads) {
		return validate({
			shapes: _classPrivateFieldGet2(_shapeQuads, this),
			data: dataQuads,
			allowJS: _classPrivateFieldGet2(_options, this).allowJS,
			context: _classPrivateFieldGet2(_options, this).context
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
export { DEFAULT_CONTEXT, DataFactory, SUPPORTED_VOCABULARY, Store, Validator, createShapeDetector, deconstruct, expandIRI, extract, extractGraph, generate, generateNode, hash, highlight, isSupportedTerm, locate, merge, parse, parseSemanticBlock, render, shortenIRI, updateValue, validate };
