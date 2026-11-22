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
	const supers = /* @__PURE__ */ new Set([termKey(classIRI)]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const q of ds.match(null, nn(RDFS + "subClassOf"), null)) if (supers.has(termKey(q.subject)) && !supers.has(termKey(q.object))) {
			supers.add(termKey(q.object));
			changed = true;
		}
	}
	const out = [];
	for (const q of ds.match(null, RDF_TYPE, null)) if (supers.has(termKey(q.object))) out.push(q.subject);
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
		return rawMessage.replaceAll("{$value}", jsValue(value) ?? "").replaceAll("{$path}", ctx.path?.value ?? "").replaceAll("{$focusNode}", focusNode?.value ?? "");
	}
	function viol(extra = {}) {
		const v = {
			focusNode,
			value,
			severity,
			component: nn(SH + component),
			message: renderMessage(),
			shape: ctx.shapeTerm,
			path: ctx.path,
			...extra
		};
		if (process.env.DEBUG) console.log(`  ⚠️  ${component} violation: focus=${focusNode?.value}, value=${value?.value || "none"}, shape=${ctx.shapeTerm?.value}`);
		return v;
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
	if (process.env.DEBUG) {
		console.log(`\n🔍 Validating: ${focusNode?.value} against ${shapeTerm?.value} (${isPropertyShape ? "PropertyShape" : "NodeShape"})`);
		console.log(`   Constraints: ${constraints.map((c) => c.component).join(", ")}`);
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
function termToPOJO(term) {
	if (!term) return null;
	if (isLiteral(term)) return castLiteral(term);
	return term.value;
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
	return termToPOJO(term);
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
				allowJS: false
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
function extractSubGraph(input, shapeIRI, options = {}) {
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
function extractPOJO(input, shapeIRI, options = {}) {
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
		allowJS: false
	}, { nodeLevelOnly: true }).length === 0);
	const pojos = kept.map((t) => pojoForNode(dataDS, shapesDS, shapeTerm, t, shapeCache, /* @__PURE__ */ new Set(), maxDepth, options));
	if (options.byNode) {
		const out = {};
		kept.forEach((t, i) => {
			if (!isEmptyPOJO(pojos[i])) out[t.value] = pojos[i];
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
			allowJS: options.allowJS === true
		};
		for (const focusNode of targets) allViolations.push(...validateNodeAgainstShape(dataDS, shapesDS, shapeTerm, focusNode, ctx));
	}
	if (process.env.DEBUG) {
		const byConstraint = {};
		const byShape = {};
		for (const v of allViolations) {
			const constraint = v.component?.value?.replace("http://www.w3.org/ns/shacl#", "") || "Unknown";
			const shape = v.shape?.value || "Unknown";
			byConstraint[constraint] = (byConstraint[constraint] || 0) + 1;
			byShape[shape] = (byShape[shape] || 0) + 1;
		}
		console.log("\n📊 Violation breakdown by constraint:");
		for (const [constraint, count] of Object.entries(byConstraint).sort((a, b) => b[1] - a[1])) console.log(`  ${constraint}: ${count}`);
		console.log("\n📊 Violation breakdown by shape:");
		for (const [shape, count] of Object.entries(byShape).sort((a, b) => b[1] - a[1])) console.log(`  ${shape}: ${count}`);
		console.log("\n📋 First 10 violations:");
		for (let i = 0; i < Math.min(10, allViolations.length); i++) {
			const v = allViolations[i];
			console.log(`  ${i + 1}. Focus: ${v.focusNode?.value}`);
			console.log(`     Shape: ${v.shape?.value}`);
			console.log(`     Path: ${v.path?.value || "none"}`);
			console.log(`     Constraint: ${v.component?.value?.replace("http://www.w3.org/ns/shacl#", "")}`);
			console.log(`     Value: ${v.value?.value || "none"}`);
		}
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
			allowJS: _classPrivateFieldGet2(_options, this).allowJS
		});
	}
};
export { SUPPORTED_VOCABULARY, Store, Validator, createShapeDetector, validate as default, validate, extractPOJO, extractSubGraph, isSupportedTerm };
