//#region src/constants.js
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
var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
var XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
var XSD_BOOLEAN = "http://www.w3.org/2001/XMLSchema#boolean";
var XSD_INTEGER = "http://www.w3.org/2001/XMLSchema#integer";
var XSD_DOUBLE = "http://www.w3.org/2001/XMLSchema#double";
var URL_REGEX = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/;
//#endregion
//#region src/utils.js
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
			else if (typeof value === "number") if (Number.isFinite(value)) datatype = Number.isInteger(value) ? XSD_INTEGER : XSD_DOUBLE;
			else {
				datatype = XSD_DOUBLE;
				if (!Number.isNaN(value)) value = value > 0 ? "INF" : "-INF";
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
//#endregion
//#region src/tokenizers.js
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
		if (numEnd >= line.length || line[numEnd] !== ".") return null;
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
	const type = delimCount === 1 ? "emphasis" : "strong";
	const closer = char.repeat(delimCount);
	const contentStart = startPos + delimCount;
	let pos = contentStart;
	while (pos < text.length) {
		if (text.slice(pos, pos + delimCount) === closer) {
			if (pos + delimCount < text.length && text[pos + delimCount] === char) {
				pos++;
				continue;
			}
			const content = text.slice(contentStart, pos);
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
	if (pos < text.length && text[pos] === "(") {
		const parenEnd = text.indexOf(")", pos + 1);
		if (parenEnd !== -1) {
			url = text.slice(pos + 1, parenEnd);
			pos = parenEnd + 1;
		}
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
function scanInlineCarriers(text, baseOffset = 0) {
	const carriers = [];
	const len = text.length;
	let pos = 0;
	while (pos < len) {
		const char = text[pos];
		let detected = null;
		switch (char) {
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
			case "`":
				detected = detectCodeSpan(text, pos);
				break;
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
			pos: detected.endPos
		};
		if (attrs) carrier.attrsRange = [absContentEnd, absEnd];
		carriers.push(carrier);
		pos = detected.endPos;
	}
	return carriers;
}
//#endregion
//#region src/shared.js
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
function isLiteral(term) {
	return term?.termType === "Literal";
}
function isNamedNode(term) {
	return term?.termType === "NamedNode";
}
function isRdfType(term) {
	return term?.value === RDF_TYPE;
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
		if (isNamedNode(quad.object)) {
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
	const displayText = labelLookup && labelLookup.has(quad.object.value) ? labelLookup.get(quad.object.value) : objShort;
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
	else if (isLiteral(q.object)) literals.push(q);
	else if (isNamedNode(q.object)) objects.push(q);
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
	} else if (isNamedNode(quad.object)) {
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
//#endregion
//#region src/parse.js
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
	const quadKeys = /* @__PURE__ */ new Set();
	for (const quad of state.quads) quadKeys.add(quadIndexKey(quad.subject, quad.predicate, quad.object));
	const filteredRemove = [];
	for (const quad of state.removeSet) {
		const key = quadIndexKey(quad.subject, quad.predicate, quad.object);
		if (!quadKeys.has(key)) filteredRemove.push(quad);
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
	return token._carriers || (token._carriers = extractInlineCarriers(token.text, token.range[0]));
}
function scanTokens(text) {
	const tokens = [];
	const mdLines = [];
	const lines = text.split("\n");
	let pos = 0;
	let codeBlock = null;
	const PROCESSORS = [
		{
			type: "fence",
			test: (line) => detectFence(line.trim()),
			process: handleFence
		},
		{
			type: "content",
			test: () => codeBlock,
			process: (line) => codeBlock.content.push(line)
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
					range: [codeBlock.start, lineStart],
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
			}
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
	function handleBlockquote(line, lineStart, pos) {
		const result = detectBlockquote(line);
		const attrs = result.attrs;
		const valueStartInLine = line.startsWith("> ") ? 2 : line.indexOf(">") + 1;
		const valueEndInLine = valueStartInLine + result.content.length;
		tokens.push(createToken("blockquote", [lineStart, pos - 1], result.content, attrs, calcAttrsRange(line, attrs, lineStart), [lineStart + valueStartInLine, lineStart + valueEndInLine]));
		const cleanBlockquote = `> ${result.content}`;
		mdLines.push(cleanBlockquote);
		return true;
	}
	function handlePara(line, lineStart, pos) {
		tokens.push(createToken("para", [lineStart, pos - 1], line.trim()));
		let cleanPara = line;
		const carriers = scanInlineCarriers(cleanPara, 0);
		for (const carrier of carriers) if (carrier.attrs && (carrier.type === "emphasis" || carrier.type === "code")) {
			const before = cleanPara.substring(0, carrier.range[0]);
			const after = cleanPara.substring(carrier.range[1]);
			cleanPara = before + (carrier.text || "") + after;
		}
		cleanPara = cleanPara.replace(/\[([^\]]+)\]\s*\{[^}]+\}/g, "$1");
		cleanPara = cleanPara.replace(/\s*\{[^}]+\}\s*/g, " ");
		cleanPara = cleanPara.replace(/\s+/g, " ").trim();
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
function emitQuad(quads, quadBuffer, removeSet, quadIndex, block, subject, predicate, object, dataFactory, meta = null, statements = null, statementCandidates = null, state = null) {
	if (!subject || !predicate || !object) return;
	const quad = dataFactory.quad(subject, predicate, object);
	if (meta?.remove || false) {
		const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
		if (quadBuffer.has(quadKey)) {
			quadBuffer.delete(quadKey);
			const index = quads.findIndex((q) => q.subject.value === quad.subject.value && q.predicate.value === quad.predicate.value && q.object.value === quad.object.value);
			if (index !== -1) quads.splice(index, 1);
			quadIndex.delete(quadKey);
		} else removeSet.add(quad);
	} else {
		const quadKey = quadIndexKey(quad.subject, quad.predicate, quad.object);
		quadBuffer.set(quadKey, quad);
		quads.push(quad);
		if (state) {
			if (!state.primaryType && predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") state.primaryType = object.value;
			if (!state.primaryLabel && predicate.value === "http://www.w3.org/2000/01/rdf-schema#label" && object.termType === "Literal") state.primaryLabel = object.value;
			if (!state.primaryComment && predicate.value === "http://www.w3.org/2000/01/rdf-schema#comment" && object.termType === "Literal") state.primaryComment = object.value;
		}
		detectStatementPatternSinglePass(quad, dataFactory, meta, statements, statementCandidates);
		const originEntry = createLeanOriginEntry(block, subject, predicate, meta);
		quadIndex.set(quadKey, originEntry);
		if (state.currentBlock && block.id === state.currentBlock.id) {
			if (!state.currentBlock.quadKeys) state.currentBlock.quadKeys = [];
			state.currentBlock.quadKeys.push(quadKey);
		}
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
	emitQuad(state.quads, state.quadBuffer, state.removeSet, state.origin.quadIndex, block, subject, state.df.namedNode(expandIRI("rdf:type", state.ctx)), state.df.namedNode(expandedType), state.df, {
		kind: "type",
		token: `.${typeIRI}`,
		expandedType,
		entryIndex: typeInfo.entryIndex,
		remove: typeInfo.remove
	}, state.statements, state.statementCandidates, state);
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
			emitQuad(state.quads, state.quadBuffer, state.removeSet, state.origin.quadIndex, block, role.subject, P, role.object, state.df, {
				kind: "pred",
				token: `${pred.form}${pred.iri}`,
				form: pred.form,
				expandedPredicate: P.value,
				entryIndex: pred.entryIndex,
				remove: pred.remove || false
			}, state.statements, state.statementCandidates, state);
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
	processAnnotation({
		type: "standalone",
		text: "",
		range: token.range,
		attrsRange: [attrsStart, attrsStart + (result.content ? result.content.length : 0)],
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
//#endregion
//#region src/merge.js
/**
* Creates a unique key for quad identity matching - using shared utility
* @param {Quad} quad 
* @returns {string}
*/
function quadKey(quad) {
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
			const key = quadKey(quad);
			sessionBuffer.set(key, quad);
			const existingOrigin = doc.origin.quadIndex.get(key);
			quadIndex.set(key, {
				...existingOrigin || {},
				documentIndex: i,
				polarity: "+"
			});
		}
		for (const quad of doc.remove) {
			const key = quadKey(quad);
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
	const quadKeys = new Set(finalQuads.map(quadKey));
	const removeKeys = new Set(finalRemove.map(quadKey));
	return {
		quads: finalQuads.filter((quad) => !removeKeys.has(quadKey(quad))),
		remove: finalRemove.filter((quad) => !quadKeys.has(quadKey(quad))),
		statements: allStatements,
		origin: mergeOrigin,
		context: finalContext,
		primarySubjects,
		primary: primaryObjects
	};
}
//#endregion
//#region src/generate.js
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
	const { nodeGroups, reverseIndex } = groupQuadsByNode(normalizeAndSortQuads(quads));
	if (!nodeGroups.has(focusIRI)) return {
		text: "",
		context: fullContext,
		compactStats: null
	};
	const { text, compactStats } = buildDeterministicMDLD(nodeGroups, fullContext, focusIRI, renderReverse ? reverseIndex : null, compactInline, /* @__PURE__ */ new Map(), lang);
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
		const oA = isLiteral(a.object) ? a.object.value : a.object.value;
		const oB = isLiteral(b.object) ? b.object.value : b.object.value;
		return oA.localeCompare(oB);
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
function groupQuadsByNode(quads) {
	const groups = /* @__PURE__ */ new Map();
	const reverseIndex = /* @__PURE__ */ new Map();
	const ensure = (key) => {
		const existing = groups.get(key);
		if (existing) return existing;
		const newArray = [];
		groups.set(key, newArray);
		return newArray;
	};
	for (const quad of quads) {
		const { subject, predicate, object } = quad;
		ensure(subject.value).push(quad);
		if (object.termType === "NamedNode") {
			ensure(object.value).push(quad);
			const objectValue = object.value;
			const reverseList = reverseIndex.get(objectValue);
			if (reverseList) reverseList.push(quad);
			else reverseIndex.set(objectValue, [quad]);
		}
		ensure(predicate.value).push(quad);
		if (predicate.value === RDFS_TYPE && object.termType === "NamedNode") ensure(object.value).push(quad);
		if (object.termType === "Literal" && object.datatype) ensure(object.datatype.value || object.datatype).push(quad);
	}
	return {
		nodeGroups: groups,
		reverseIndex
	};
}
function buildDeterministicMDLD(subjectGroups, context, primarySubject = null, reverseIndex = null, compactInline = true, removeBySubject = /* @__PURE__ */ new Map(), lang = null) {
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
	const primarySubjectIRI = primarySubject;
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
		textParts.push(`# ${displayName} {=${shortSubject}${annotationStr}}\n`);
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
		textParts.push(`# ${displayName} {=${shortSubject}}\n`);
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
//#endregion
//#region src/highlight.js
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
			return `<span style="color: ${prefixColor}">${escapeHtml(prefix)}</span><span style="color: ${TOKEN_COLORS.marker}">:</span><span data-iri="${fullIRI}" style="color: ${localColor}">${escapeHtml(local)}</span> `;
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
function highlightMDLD(code) {
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
			result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>`;
			result += parsed;
			result += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span>`;
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
			result += `<span style="color: ${bracketColor}; opacity: 0.85">[</span><span style=" opacity: 1.0">${escapedContent}</span><span style="color: ${bracketColor}; opacity: 0.85">]</span>`;
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
					processedHeaderText += `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">{</span>` + parsedAnnotation + `<span style="color: ${TOKEN_COLORS.annotation}; opacity: 0.75">}</span>`;
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
//#endregion
//#region src/index.js
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
//#endregion
export { DEFAULT_CONTEXT, DataFactory, expandIRI, generate, generateNode, getIRIColor, hash, hashIRI, highlightMDLD, locate, merge, parse, parseSemanticBlock, shortenIRI, updateValue };
