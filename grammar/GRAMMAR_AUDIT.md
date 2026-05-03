# MD-LD Grammar Audit: Implementation vs Spec vs EBNF/ABNF

**Date:** 2024-05-03  
**Purpose:** Identify discrepancies between parser implementation, formal grammars, and specification to establish single source of truth.

---

## Executive Summary

| Component | Status | Notes |
|-----------|--------|-------|
| `src/utils.js` `parseSemanticBlock()` | ✅ **Current Truth** | Actively maintained, tested, has polarity support |
| `spec/Spec.md` | ⚠️ **Mostly Aligned** | Describes current syntax accurately |
| `spec/grammar/mdld.ebnf` | ❌ **Outdated** | Missing polarity, some pattern discrepancies |
| `spec/grammar/mdld.abnf` | ❌ **Outdated** | Same issues as EBNF |

**Recommendation:** Update EBNF/ABNF to match implementation, then use all three as cross-validating sources.

---

## 1. Semantic Block Tokens (Inside `{...}`)

### 1.1 Token Patterns Comparison

| Feature | Implementation (`utils.js`) | EBNF | ABNF | Spec § | Issue |
|---------|---------------------------|------|------|--------|-------|
| **Subject Declaration** | `=` or `=IRI` | ✅ `= iriRef` | ✅ `= iri-ref` | ✅ §6 | None |
| **Subject Reset** | `=` alone → `'RESET'` | ❌ **Missing** | ❌ **Missing** | ✅ §14 | EBNF/ABNF don't document `{=}` reset |
| **Fragment Subject** | `=#fragment` | ✅ `=# fragment` | ✅ `=# fragment` | ✅ §6 | None |
| **Soft Object IRI** | `+IRI` | ✅ `+ iriRef` | ✅ `+ iri-ref` | ✅ §6 | None |
| **Soft Fragment** | `+#fragment` | ✅ `+# fragment` | ✅ `+# fragment` | ✅ §6 | None |
| **Literal Predicate** | No prefix (default) | ⚠️ `iriRef` only | ⚠️ `iri-ref` only | ✅ §8 | EBNF `predicate = ["?"] iriRef` implies `?` is optional for object, not literal |
| **Object Predicate** | `?p` | ✅ `? iriRef` | ✅ `? iri-ref` | ✅ §8 | None |
| **Reverse Predicate** | `!p` | ✅ `! iriRef` | ✅ `! iri-ref` | ✅ §8 | None |
| **Type Declaration** | `.Class` | ✅ `. iriRef` | ✅ `. iri-ref` | ✅ §7 | None |
| **Datatype** | `^^datatype` | ✅ `^^ iriRef` | ✅ `^^ iri-ref` | ✅ §9 | None |
| **Language Tag** | `@lang` | ✅ `@ langTag` | ✅ `@ langtag` | ✅ §9 | None |
| **Remove Polarity** | `-` prefix on any token | ❌ **Missing** | ❌ **Missing** | ✅ §8.5 | **Major Gap** |

### 1.2 Remove Polarity Detail

**Implementation (utils.js:322-327):**
```javascript
// Handle remove polarity - strip leading - and set remove flag
let remove = false;
if (token.startsWith('-') && token.length > 1) {
    remove = true;
    token = token.slice(1);
}
```

**Spec §8.5 (Diff Polarity):**
- `-p` — Remove S→L fact
- `-?p` — Remove S→O fact  
- `-!p` — Remove O→S fact
- `-.C` — Remove rdf:type fact

**EBNF/ABNF:** No mention of `-` prefix syntax

**Action Required:** Add remove polarity to formal grammars

---

## 2. IRI/CURIE Definitions

### 2.1 IRI Schemes

| Source | Supported Schemes |
|--------|-------------------|
| **Implementation** | `https?`, `ftp`, `mailto`, `tag`, `nih`, `urn`, `uuid`, `did`, `web`, `ipfs`, `ipns`, `data`, `file`, `urn:uuid` (constants.js:18) |
| **EBNF** | `scheme = letter , { letter \| digit \| "+" \| "-" \| "." }` — allows any scheme |
| **ABNF** | `scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )` — allows any scheme |
| **Spec** | Examples show `http`, `https`, `tag`, `urn` |

**Note:** Implementation has explicit allowlist, grammars are more permissive. Implementation is the practical truth.

### 2.2 CURIE Structure

| Source | Definition |
|--------|------------|
| **Implementation** | Uses prefix expansion logic, no explicit CURIE regex in tokenizer |
| **EBNF** | `curie = prefixName , ":" , reference` |
| **ABNF** | `curie = prefix-name ":" reference` |
| **Spec** | "prefix:local" syntax throughout |

**Discrepancy:** Reference/production name character sets differ:

- EBNF: `reference = ( letter | digit ) , { letter | digit | "-" | "_" | "." }`
- ABNF: `reference = 1*( ALPHA / DIGIT / "-" / "_" / "." )`
- Implementation: Uses `expandIRI()` with context lookup — no explicit validation

**Question:** Can reference start with digit? EBNF says yes, but is that intended?

---

## 3. Value Carriers (Attachment Points)

### 3.1 Inline Carriers

| Carrier | Implementation Regex | EBNF | ABNF | Spec §4 |
|-----------|---------------------|------|------|---------|
| Emphasis | `[*__]+(.+?)[*__]+\s*\{([^}]+)\}` | ✅ `emphasisSpan` | ✅ `emphasis-span` | ✅ |
| Code Span | `` `(.+?)`\s*\{([^}]+)\} `` | ✅ `codeSpan` | ✅ `code-span` | ✅ |
| Code Span Double | `` ``(.+?)``\s*\{([^}]+)\} `` | ❌ **Missing** | ❌ **Missing** | ❌ **Missing** |
| Link Span | Complex multi-step | ✅ `linkSpan` | ✅ `link-span` | ✅ |
| Image Span | Complex multi-step | ✅ `imageSpan` | ✅ `image-span` | ✅ |
| URL Span | `<IRI>` | ✅ `urlSpan` | ✅ `url-span` | ✅ |

**Finding:** Double-backtick code spans (`` ``code`` ``) are in implementation (constants.js:30) but missing from EBNF/ABNF and Spec.

**Action:** Document or remove from implementation for consistency.

### 3.2 Block Carriers

| Carrier | Implementation Regex | EBNF | ABNF | Spec |
|---------|---------------------|------|------|------|
| Heading | `^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$` | ✅ `heading` | ✅ `heading` | ✅ |
| List Item | `^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\))?\s*$` | ✅ `listItem` | ✅ `list-item` | ✅ |
| Blockquote | `^>\s+(.+?)(?:\s*(\{[^}]+\))?$` | ✅ `blockquote` | ✅ `blockquote` | ✅ |
| Code Fence | `^(`{3,}|~{3,})(.*)` | ✅ `codeFence` | ✅ `code-fence` | ✅ |

**Finding:** Implementation uses more permissive patterns (supports ordered list `\d+\.`, tilde fences `~{3,}`) which may not be fully documented.

---

## 4. Context Declarations

### 4.1 Prefix Declaration

| Aspect | Implementation | EBNF | ABNF | Spec §15 |
|--------|---------------|------|------|----------|
| Syntax | `PREFIX_REGEX = /^\[([^\]]+)\]\s*<([^>]+)>/` | ✅ `[ prefixName ] < iri >` | ✅ same | ✅ |
| Prefix Folding | ✅ Implemented | ❌ Missing | ❌ Missing | ✅ §15 "Prefix Folding" |

**Major Gap:** Prefix folding (referencing previously declared prefixes in new declarations) is implemented but not in EBNF/ABNF.

**Example:**
```md
[my] <tag:alice@example.com,2026:>
[j] <my:journal:>  ← 'my:' resolved from previous
```

**Action Required:** Add prefix folding production to grammars.

### 4.2 Vocab Declaration

| Aspect | Implementation | EBNF | ABNF | Spec |
|--------|---------------|------|------|------|
| `@vocab` | ✅ `context-key = "@vocab"` | ✅ | ✅ | ✅ |

**Status:** Aligned.

---

## 5. Discrepancy Summary by Severity

### 🔴 Critical (Must Fix)

1. **Remove Polarity (`-` prefix)**
   - Implementation: ✅ Full support
   - EBNF/ABNF: ❌ Missing
   - **Fix:** Add `-` token modifier to grammars

2. **Prefix Folding**
   - Implementation: ✅ Full support  
   - EBNF/ABNF: ❌ Missing
   - **Fix:** Add production for CURIE in IRI position of context declaration

### 🟡 Moderate (Should Fix)

3. **Subject Reset (`{=}`)**
   - Implementation: ✅ `'RESET'` value
   - EBNF/ABNF: ❌ Missing
   - **Fix:** Document empty subject declaration

4. **Predicate Form Ambiguity**
   - EBNF: `predicate = ["?"] iriRef` suggests `?` is optional for object predicate
   - Implementation: Default (no prefix) = literal predicate, `?` = object predicate
   - **Fix:** EBNF should show two distinct productions:
     ```ebnf
     literalPredicate = iriRef ;
     objectPredicate  = "?" , iriRef ;
     ```

5. **Double-backtick Code Spans**
   - Implementation: ✅ Present (constants.js)
   - EBNF/ABNF/Spec: ❌ Missing
   - **Fix:** Document or remove

### 🟢 Minor (Nice to Fix)

6. **IRI Scheme Validation**
   - Implementation: Explicit allowlist
   - Grammars: Any valid scheme per RFC
   - **Note:** Implementation is pragmatic; grammars are theoretically correct

7. **Reference Starting Character**
   - EBNF: Allows digit start `( letter | digit )`
   - ABNF: Same as EBNF
   - **Question:** Is `1prefix:local` valid? Probably not intended.

---

## 6. Proposed Grammar Updates

### 6.1 EBNF Update (mdld.ebnf)

```ebnf
(* Add to Section 4: Attribute tokens *)
removeModifier = "-" ;  (* NEW: Remove polarity modifier *)

(* Updated token definitions with optional remove *)
modifiedSubjectDecl  = [ removeModifier ], subjectDecl ;
  (* Note: remove warns but has no effect *)
  
modifiedTypeDecl      = [ removeModifier ], typeDecl ;
modifiedPredicate     = [ removeModifier ], predicate ;
modifiedRevPredicate  = [ removeModifier ], reversePredicate ;
modifiedDatatype      = [ removeModifier ], datatype ;
  (* Note: remove warns but has no effect *)
modifiedLanguage      = [ removeModifier ], language ;
  (* Note: remove warns but has no effect *)

(* Add to Section 2: Context declarations *)
(* Prefix folding: reference can be CURIE *)
contextIri = iri | curie ;  (* NEW: CURIE resolves via previously declared prefixes *)
contextDecl = "[", contextKey, "]", whitespace, "<", contextIri, ">" ;

(* Add to Section 10.1: Inline carriers *)
codeSpanDouble = "``", text, "``" ;  (* NEW: Double-backtick variant *)

(* Fix Section 6: Subject declarations *)
(* Empty subject = semantic reset *)
subjectDecl = "=", [ iriRef | "#", fragment ] ;
```

### 6.2 ABNF Update (mdld.abnf)

```abnf
; Add to Section 3: Attribute tokens
remove-modifier = "-"

; Updated with optional remove
modified-subject-decl = [ remove-modifier ] subject-decl
modified-type-decl = [ remove-modifier ] type-decl
modified-predicate = [ remove-modifier ] predicate
modified-reverse-predicate = [ remove-modifier ] reverse-predicate

; Add to Section 1: Context declarations
context-iri = iri / curie  ; CURIE resolves via previous prefixes
context-decl = "[" context-key "]" WSP "<" context-iri ">"

; Add to Section 9: Inline carriers  
code-span-double = "``" text "``"

; Fix Section 4: Subject declarations
; Empty = reset
subject-decl = "=" [ iri-ref / "#" fragment ]
```

---

## 7. Testing Strategy

To ensure ongoing alignment:

1. **Cross-Reference Tests:** Parse all examples from Spec.md and verify against implementation
2. **Grammar Validation:** Automated tool to check EBNF/ABNF productions match implementation patterns
3. **Round-Trip Tests:** MD-LD → Parse → Generate → Compare with original
4. **New Feature Gate:** EBNF/ABNF must be updated before implementation merges

---

## 8. Immediate Actions

| Priority | Action | Owner | File(s) |
|----------|--------|-------|---------|
| 1 | Add remove polarity to EBNF | TBD | `spec/grammar/mdld.ebnf` |
| 2 | Add remove polarity to ABNF | TBD | `spec/grammar/mdld.abnf` |
| 3 | Add prefix folding to EBNF | TBD | `spec/grammar/mdld.ebnf` |
| 4 | Add prefix folding to ABNF | TBD | `spec/grammar/mdld.abnf` |
| 5 | Document subject reset in grammars | TBD | Both grammar files |
| 6 | Fix predicate production in EBNF | TBD | `spec/grammar/mdld.ebnf` |
| 7 | Decide fate of double-backtick spans | TBD | Implementation or Spec |

---

*Audit Version: 1.0*  
*Status: Complete — Ready for grammar updates*
