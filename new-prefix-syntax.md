Below is a **clear technical analysis**, not a stylistic opinion, of the proposal and its alternatives, evaluated against MD-LD’s core constraints: **single-pass parsing, CommonMark preservation, zero heuristics, and editor robustness**.

---

## 1. Problem Statement (Precisely)

Current syntax:

```md
[ex] {: http://example.org/}
```

Breaks in practice because:

* Many Markdown editors **auto-wrap bare IRIs** as `<http://example.org/>`
* Some editors **normalize whitespace or punctuation** inside `{...}`
* Curly-brace blocks are often targeted by:

  * Markdown extensions
  * formatters
  * syntax highlighters

This violates MD-LD’s **authoring robustness goal**, even if the spec is sound.

---

## 2. Proposed Syntax

```md
[ex] <http://example.org/>
[@vocab] <http://schema.org/>
```

### Immediate observations

* 100% valid CommonMark
* `<IRI>` is a **normative CommonMark construct**
* Already used by editors, renderers, and sanitizers
* No `{}` involved
* No escaping rules required
* Streaming parseable with zero lookahead

This is not a hack — it is a **standards-aligned reuse**.

---

## 3. Semantic Fit with MD-LD

### Interpretation rule (deterministic)

```
[label] <IRI>
```

When:

* `label` is a valid prefix name OR `@vocab`
* Followed immediately by an autolink `<IRI>`
* On its own line OR followed only by whitespace

→ **Context declaration**

### Example

```md
[ex] <http://example.org/>
[@vocab] <http://schema.org/>
```

Equivalent to current intent.

---

## 4. Why This Is Actually Better Than `{...}`

### 4.1 Uses existing Markdown grammar

| Aspect             | `{...}` | `<IRI>` |
| ------------------ | ------- | ------- |
| CommonMark-native  | ❌       | ✅       |
| Editor-safe        | ❌       | ✅       |
| Streaming          | ✅       | ✅       |
| Visible & readable | ⚠️      | ✅       |
| Tooling-friendly   | ❌       | ✅       |

---

### 4.2 Zero ambiguity

There is **no other reasonable semantic interpretation** of:

```md
[ex] <http://example.org/>
```

In CommonMark:

* `[ex]` alone is inert text
* `<http://example.org/>` is an autolink
* Combined, they are visually paired

MD-LD already relies on **paired constructs** (`[text]{...}`), so this is consistent.

---

### 4.3 Editor behavior now works *for* you

Instead of fighting editors:

* Auto-angle-bracketing becomes **the intended syntax**
* Copy/paste from browsers becomes safe
* Linting and formatting no longer corrupt semantics

---

## 5. Alternatives Considered (and Rejected)

### Alternative A — Escape braces harder

```md
[ex] {\: http://example.org/}
```

❌ Problems:

* Nonstandard
* Editor-hostile
* Breaks CommonMark preservation principle
* Introduces escaping rules (forbidden by spec spirit)

---

### Alternative B — YAML frontmatter

```yaml
---
prefix:
  ex: http://example.org/
---
```

❌ Problems:

* Not streaming
* Out-of-band semantics
* Breaks “every quad originates from `{...}`”
* VitePress-specific, not Markdown-native

---

### Alternative C — HTML `<link>` tags

```html
<link rel="prefix:ex" href="http://example.org/" />
```

❌ Problems:

* HTML breaks Markdown-only workflows
* Not author-friendly
* Harder to diff, annotate, or round-trip

---

### Alternative D — Inline `{}` but allow `<...>`

```md
[ex] {: <http://example.org/> }
```

❌ Still broken:

* Editors still rewrite
* Still relies on fragile brace parsing
* Zero benefit over clean solution

---

## 6. Spec Impact Analysis

### Changes required

Minimal and localized.

#### Replace §14 Context declarations with:

**Normative form**

```md
[prefix] <IRI>
[@vocab] <IRI>
```

#### Optional backward compatibility

* `{...}` prefix blocks MAY be supported
* But SHOULD be deprecated

---

### Parsing rule (single-pass safe)

When encountering:

```
[Label] <Autolink>
```

If:

* Label ∈ `[A-Za-z][A-Za-z0-9_-]*` OR `@vocab`
* Autolink is valid IRI
* Line contains no other value carriers

→ Emit context binding

No backtracking. No ambiguity.

---

## 7. Rendering to RDFa (Bonus Win)

This maps **perfectly** to RDFa:

```html
<html prefix="ex: http://example.org/ schema: http://schema.org/">
```

You can:

* Collect prefix declarations during render
* Emit once at document root
* No need to invent syntax mappings

---

## 8. Recommendation (Clear)

### ✅ Adopt `[prefix] <IRI>` and `[@vocab] <IRI>` as the **primary syntax**

* Editor-proof
* Spec-clean
* Markdown-native
* Streaming-safe
* RDFa-aligned

### Optional:

* Keep `{...}` prefix blocks only for legacy
* Mark as discouraged in spec

---

## 9. One-Sentence Spec Justification

> MD-LD adopts CommonMark autolink syntax for context declarations to ensure editor robustness, streaming parsability, and lossless round-tripping across Markdown and HTML+RDFa renderers.

This is a **strong, correct evolution**, not a compromise.
