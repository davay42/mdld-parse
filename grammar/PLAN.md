# MD-LD Syntax Workspace Plan

## Executive Summary

This document outlines the addition of a `grammar/` workspace to `mdld-parse` — adding TextMate grammar, enhanced syntax testing, and editor tooling as a pnpm workspace. The goal is to co-locate formal syntax specification with editor support while maintaining clean separation through workspace boundaries.

**Key Principles:**
- **pnpm workspace** — Monorepo structure with isolated packages
- **Keep spec in place** — EBNF/ABNF remain in `spec/`, no migration needed
- **VSCode/Windsurf compatible** — Standard TextMate grammar format
- **Shiki-first testing** — Browser-friendly feedback loop for grammar development
- **Agent-friendly** — Deterministic code-text validation with clear pass/fail signals
- **Spec-driven** — Grammar derived from formal EBNF/ABNF specifications

---

## 1. Workspace Structure

```
mdld-parse/                          # Root (existing)
├── src/                             # Parser implementation (unchanged)
├── tests/                           # Parser tests (unchanged)
├── spec/                            # **UNCHANGED — Spec stays here**
│   ├── Spec.md
│   ├── Spec-compact.md
│   ├── Spec-ultra.md
│   └── grammar/
│       ├── mdld.ebnf
│       └── mdld.abnf
├── docs/                            # **UNCHANGED — Docs stay here**
│   ├── Syntax.md
│   └── ...
│
├── grammar/                         # **NEW WORKSPACE**
│   ├── package.json                 # Workspace manifest
│   ├── README.md                    # Grammar workspace docs
│   ├── PLAN.md                      # This document
│   │
│   ├── packages/
│   │   ├── vscode/                  # VSCode extension
│   │   │   ├── package.json
│   │   │   ├── language-configuration.json
│   │   │   └── syntaxes/
│   │   │       └── mdld.tmLanguage.json
│   │   │
│   │   └── shiki/                   # Shiki integration + test runner
│   │       ├── package.json
│   │       ├── src/
│   │       │   ├── index.js         # loadGrammar(), createHighlighter()
│   │       │   ├── test-runner.js   # Automated test runner
│   │       │   └── reporter.js      # Code-text feedback formatter
│   │       └── tests/
│   │           ├── fixtures/          # .md files with MD-LD examples
│   │           └── snapshots/         # Expected token output (JSON)
│   │
│   ├── grammar-src/                 # Grammar source (YAML/JSON)
│   │   ├── mdld.tmLanguage.yaml     # Human-editable source
│   │   └── mdld.tmLanguage.json     # Compiled for distribution
│   │
│   └── tests/
│       ├── unit/                    # Token-level unit tests
│       ├── integration/             # End-to-end highlighting tests
│       └── agent/                   # Grammar lint, coverage reports

```

---

## 2. Migration Inventory

### 2.1 Files That Stay in Root (No Migration)

| Path | Status | Rationale |
|------|--------|-----------|
| `spec/` | **Unchanged** | Grammar derives from EBNF/ABNF in place |
| `docs/Syntax.md` | **Unchanged** | Human syntax guide stays with parser |
| `src/` | **Unchanged** | Parser implementation |
| `tests/` | **Unchanged** | Parser test suite |

### 2.2 New Files in `grammar/` Workspace

| Path | Purpose |
|------|---------|
| `grammar/package.json` | Workspace manifest with pnpm workspace config |
| `grammar/packages/vscode/` | VSCode extension package |
| `grammar/packages/shiki/` | Shiki integration + test framework |
| `grammar/grammar-src/` | TextMate grammar source (YAML → JSON) |
| `grammar/tests/` | Grammar-specific unit & integration tests |
| `grammar/scripts/` | Build, test, lint utilities |

### 2.3 Root Configuration Updates

Update `pnpm-workspace.yaml` in root:

```yaml
packages:
  - '.'              # Root package (parser)
  - 'grammar'        # Grammar workspace
  - 'grammar/packages/*'  # Grammar sub-packages
```

Add root scripts for convenience:

```json
{
  "scripts": {
    "test": "node tests/index.js",
    "test:grammar": "pnpm --filter mdld-grammar test",
    "build:grammar": "pnpm --filter mdld-grammar build",
    "lint:grammar": "pnpm --filter mdld-grammar lint",
    "dev:shiki": "pnpm --filter @mdld/shiki dev"
  }
}
```

---

## 3. Windsurf Compatibility

**Yes, Windsurf works identically to VSCode** for TextMate grammar development.

**Technical Basis:**
- Windsurf uses the same Monaco editor as VSCode
- Monaco parses TextMate grammars using `vscode-textmate` engine
- All standard scope names (`keyword`, `entity`, `string`, etc.) work identically

**Development Workflow:**
1. Open `mdld-syntax` folder in Windsurf
2. Press `F5` → launches Extension Development Host
3. Open `.md` files → see live syntax highlighting
4. Use `Cmd+Shift+P` → "Developer: Inspect Editor Tokens and Scopes"

---

## 4. Shiki-First Development Workflow

### 4.1 Why Shiki as Primary Feedback Loop

| Aspect | VSCode | Shiki |
|--------|--------|-------|
| Startup time | ~3-5s | <100ms |
| Browser testing | Requires electron | Native |
| Snapshot testing | Manual inspection | Automated |
| CI/CD integration | Complex | Simple |
| Agent feedback | Visual only | Structured JSON |

### 4.2 Shiki Integration Architecture

```javascript
// packages/shiki/src/index.js
import { createHighlighter } from 'shiki/core'
import mdldGrammar from '../../grammar-src/mdld.tmLanguage.json' assert { type: 'json' }

export async function loadMDLDGrammar() {
  return {
    ...mdldGrammar,
    name: 'mdld',
    aliases: ['mdld', 'md-ld']
  }
}

export async function createMDLDHighlighter(theme = 'github-dark') {
  const highlighter = await createHighlighter({
    themes: [theme],
    langs: ['markdown'] // Base Markdown
  })
  
  await highlighter.loadLanguage(await loadMDLDGrammar())
  
  return highlighter
}
```

### 4.3 Test Runner with Code-Text Feedback

```javascript
// packages/shiki/src/test-runner.js
export async function runTests(testFiles, options = {}) {
  const highlighter = await createMDLDHighlighter()
  const results = []
  
  for (const file of testFiles) {
    const code = await readFile(file, 'utf-8')
    const tokens = highlighter.codeToTokens(code, { lang: 'mdld' })
    
    // Validate tokens against expected scopes
    const validation = validateTokens(tokens, file)
    
    results.push({
      file: path.relative(process.cwd(), file),
      passed: validation.errors.length === 0,
      errors: validation.errors,
      tokenCount: tokens.length,
      coverage: calculateCoverage(tokens)
    })
  }
  
  // AGENT-READABLE OUTPUT
  return formatResults(results)
}

function formatResults(results) {
  let output = '# MD-LD Grammar Test Results\n\n'
  
  const passed = results.filter(r => r.passed)
  const failed = results.filter(r => !r.passed)
  
  output += `**Summary:** ${passed.length}/${results.length} passed\n\n`
  
  if (failed.length > 0) {
    output += '## Failures\n\n'
    for (const test of failed) {
      output += `### ${test.file}\n`
      for (const error of test.errors) {
        output += `- **Line ${error.line}:** ${error.message}\n`
        output += `  - Expected: \`${error.expected}\`\n`
        output += `  - Actual: \`${error.actual}\`\n`
      }
      output += '\n'
    }
  }
  
  return output
}
```

---

## 5. Agent-Friendly Testing Framework

### 5.1 Deterministic Validation Goals

Agents working on this repository need:
1. **Unambiguous pass/fail signals** — No visual inspection required
2. **Line-precise error locations** — Fix with single edit
3. **Scope coverage metrics** — Know when grammar is "complete"
4. **Regex validation** — Detect pattern errors before runtime

### 5.2 Test Schema (YAML)

```yaml
# tests/unit/subject-decl.test.yaml
description: Subject declaration tokenization

testCases:
  - name: Full IRI subject
    input: "{=ex:subject}"
    expected:
      - text: "{"
        scope: punctuation.annotation.begin.mdld
      - text: "="
        scope: keyword.operator.subject.declaration.mdld
      - text: "ex:subject"
        scope: entity.name.iri.curie.mdld
      - text: "}"
        scope: punctuation.annotation.end.mdld

  - name: Fragment subject
    input: "{=#section1}"
    expected:
      - text: "="
        scope: keyword.operator.subject.declaration.mdld
      - text: "#section1"
        scope: entity.name.fragment.mdld

  - name: Soft object IRI
    input: "{+ex:object}"
    expected:
      - text: "+"
        scope: keyword.operator.object.soft.mdld

  - name: Multiple tokens
    input: "{=ex:subject .Type name ?link}"
    expected:
      - text: "="
        scope: keyword.operator.subject.declaration.mdld
      - text: ".Type"
        scope: entity.name.type.class.mdld
      - text: "name"
        scope: keyword.operator.predicate.literal.mdld
      - text: "?link"
        scope: keyword.operator.predicate.object.mdld
```

### 5.3 Automated Grammar Linting

```javascript
// scripts/lint-grammar.js
// Validates TextMate grammar structure

const REQUIRED_SCOPE_PATTERNS = [
  { pattern: /\{/, name: 'annotation.begin' },
  { pattern: /\}/, name: 'annotation.end' },
  { pattern: /=/, name: 'subject.declaration' },
  { pattern: /\+/, name: 'object.soft' },
  { pattern: /\./, name: 'type.declaration' },
  { pattern: /\?/, name: 'predicate.object' },
  { pattern: /!/, name: 'predicate.reverse' },
  { pattern: /\^\^/, name: 'datatype' },
  { pattern: /@/, name: 'language' }
]

export function lintGrammar(grammarJson) {
  const issues = []
  
  // Check repository keys exist
  if (!grammarJson.repository) {
    issues.push({ severity: 'error', message: 'Missing repository section' })
  }
  
  // Check required patterns defined
  for (const { name } of REQUIRED_SCOPE_PATTERNS) {
    const found = Object.values(grammarJson.repository || {})
      .some(p => p.name?.includes(name))
    
    if (!found) {
      issues.push({ severity: 'warning', message: `Missing scope: ${name}` })
    }
  }
  
  // Validate regex patterns are valid JavaScript regex
  for (const [key, pattern] of Object.entries(grammarJson.repository || {})) {
    if (pattern.match) {
      try {
        new RegExp(pattern.match)
      } catch (e) {
        issues.push({ 
          severity: 'error', 
          message: `Invalid regex in ${key}: ${e.message}`,
          pattern: pattern.match
        })
      }
    }
  }
  
  return issues
}
```

### 5.4 Snapshot Testing for Regression Prevention

```yaml
# tests/snapshots/prefix-folding.snap
# Auto-generated, hand-verified once, then locked

testFile: "../integration/prefix-folding.md"
hash: "sha256:abc123..."

tokenMap:
  line1:
    - [0, 1, "punctuation.bracket.square.mdld"]   # [
    - [1, 4, "entity.name.namespace.mdld"]        # my
    - [4, 5, "punctuation.bracket.square.mdld"]   # ]
    - [6, 7, "punctuation.bracket.angle.mdld"]    # <
    - [7, 35, "string.other.iri.mdld"]             # tag:...
    - [35, 36, "punctuation.bracket.angle.mdld"]  # >

# Coverage report
coverage:
  totalTokens: 47
  uniqueScopes: 12
  scopeDistribution:
    entity.name.namespace.mdld: 4
    string.other.iri.mdld: 4
    keyword.operator.subject.declaration.mdld: 2
    entity.name.iri.curie.mdld: 3
    # ...
```

---

## 6. Development Phases

### Phase 1: Workspace Bootstrap (Week 1)

**Goals:** Working `grammar/` workspace with basic grammar and Shiki integration

**Tasks:**
- [ ] Create `grammar/` folder with workspace structure
- [ ] Update root `pnpm-workspace.yaml` to include `grammar/` and `grammar/packages/*`
- [ ] Create `grammar/package.json` workspace manifest
- [ ] Create initial TextMate grammar (YAML source)
- [ ] Build script: YAML → JSON conversion
- [ ] Shiki package with loadGrammar() and createHighlighter()
- [ ] First integration test with snapshot
- [ ] README with quickstart

**Deliverables:**
- `grammar/` workspace with working Shiki integration
- Basic highlighting for `{...}` annotations
- One passing integration test
- Working `pnpm test:grammar` from root

### Phase 2: Complete Grammar Coverage (Week 2)

**Goals:** Full MD-LD syntax support

**Tasks:**
- [ ] Context declarations `[prefix] <IRI>`
- [ ] Subject declarations (`=`, `=#`, `+`, `+#`)
- [ ] Type declarations (`.Class`)
- [ ] Predicate forms (`p`, `?p`, `!p`)
- [ ] Datatypes (`^^xsd:type`)
- [ ] Language tags (`@en`)
- [ ] CURIE vs IRI distinction
- [ ] Remove polarity (`-` prefix)

**Deliverables:**
- Complete grammar covering all MD-LD constructs
- Unit tests for each token type
- Agent-readable coverage report

### Phase 3: VSCode Extension (Week 3)

**Goals:** Ship VSCode/Windsurf extension

**Tasks:**
- [ ] VSCode extension manifest
- [ ] Language configuration (brackets, comments)
- [ ] Icon/theme assets
- [ ] Extension marketplace listing
- [ ] Installation docs

**Deliverables:**
- Published VSCode extension
- Windsurf installation guide
- Marketplace presence

### Phase 4: Documentation & Tooling (Week 4)

**Goals:** Complete developer experience

**Tasks:**
- [ ] Visual syntax guide with color coding
- [ ] Grammar development contributing guide
- [ ] EBNF-to-grammar mapping documentation
- [ ] Automated spec sync workflow
- [ ] Version tagging strategy

**Deliverables:**
- Documentation site
- Contributing guidelines
- CI/CD for automated releases

---

## 7. CI/CD Workflows

### 7.1 Test Workflow (`.github/workflows/test.yml`)

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint grammar
        run: pnpm run lint:grammar
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Check coverage
        run: pnpm test:coverage --threshold=95
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results.md
```

### 7.2 Grammar Validation Workflow (`.github/workflows/grammar-validate.yml`)

Runs on changes to `spec/` to ensure grammar stays synchronized with specification.

```yaml
name: Grammar vs Spec Validation
on:
  push:
    paths:
      - 'spec/grammar/**'
      - 'grammar/grammar-src/**'
  pull_request:
    paths:
      - 'spec/grammar/**'
      - 'grammar/grammar-src/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Validate grammar against EBNF
        run: pnpm run grammar:validate
        # Compares regex patterns in tmLanguage against EBNF productions
```

---

## 8. Agent Interaction Protocol

When an AI agent works on this repository, follow this feedback loop:

### 8.1 Before Making Changes

```bash
# 1. Run current tests to establish baseline
pnpm test > baseline-results.md

# 2. Check grammar lint
pnpm run lint:grammar
```

### 8.2 During Development

```bash
# 1. Make grammar edit in grammar-src/mdld.tmLanguage.yaml

# 2. Build grammar
pnpm run build:grammar

# 3. Run affected tests
pnpm test:unit --grep="subject-decl"

# 4. Check output in test-results.md
```

### 8.3 Before Committing

```bash
# Full test suite
pnpm test

# Coverage check
pnpm test:coverage

# Grammar structure validation
pnpm run lint:grammar --strict
```

### 8.4 Expected Output Format

All test commands produce `test-results.md`:

```markdown
# Test Results — 2024-01-15T10:30:00Z

## Summary
- **Total:** 47 tests
- **Passed:** 45 ✅
- **Failed:** 2 ❌
- **Coverage:** 96.2%

## Failures

### tests/unit/subject-decl.test.yaml
- **Line 23:** Expected scope `entity.name.iri.curie.mdld`, got `entity.name.iri.mdld`
  - Input: `{=ex:subject}`
  - Token: `ex:subject`

### tests/integration/prefix-folding.md
- **Line 5:** Missing scope for `^^` operator
  - Input: `{p:date ^^xsd:date}`
  - Token at position 12-14 has no scope assigned

## Coverage Report

| Scope Category | Coverage | Missing |
|----------------|----------|---------|
| Subject ops    | 100%     | —       |
| Predicates     | 95%      | `!p`    |
| Types          | 100%     | —       |
| Literals       | 90%      | `@lang` |

## Recommendations

1. Add pattern for reverse predicate `!` to `repository.reversePredicate`
2. Add language tag `@` pattern to `repository.languageTag`
```

---

## 9. Open Questions

1. **Grammar source format:** YAML (human-editable) or JSON (direct)?
   - Decision: YAML source → JSON build artifact

2. **Scope naming convention:** 
   - Option A: `keyword.operator.subject.declaration.mdld`
   - Option B: `mdld.keyword.operator.subject.declaration`
   - Decision: Suffix with `.mdld` for namespacing, standard prefixes for theme compatibility

3. **Snapshot update workflow:**
   - Option A: Manual `pnpm test:update`
   - Option B: CI auto-update on main
   - Decision: Manual with PR review

4. **EBNF-to-regex automation:**
   - Build tool to suggest regex patterns from EBNF?
   - Decision: Phase 4 stretch goal

---

## 10. Next Steps

1. **Create workspace:** Add `grammar/` folder to `mdld-parse` repo
2. **Configure pnpm:** Update root `pnpm-workspace.yaml` for new workspace
3. **Bootstrap Phase 1:** Create initial grammar and Shiki test runner
4. **Validate approach:** Run one end-to-end test with Shiki
5. **Iterate:** Follow Phase 1-4 development plan

**Immediate Action:** Create `grammar/` directory structure and configure pnpm workspace.

---

*Plan Version: 1.0*
*Last Updated: 2024-05-03*
*Status: Draft — Ready for Review*
