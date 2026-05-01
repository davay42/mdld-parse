# MD-LD evolution

## v.0.9.0 (2026-05-01)

### BREAKING CHANGES (with backward compatibility)
- **Unified named parameter API** for all core functions
  - `parse({ text, context, dataFactory, graph })` — new primary signature
  - `generate({ quads, context, primarySubject })` — unified object pattern
  - `generateNode({ quads, focusIRI, context })` — safe node-centric generation
  - Legacy positional signatures still work (deprecated, removed in v1.0.0)

### Added
- **Seamless composition** via object spreading:
  ```js
  generate({ ...parse({ text, context }) })
  parse({ ...generate({ quads, context }) })
  generateNode({ ...parse({ text }), focusIRI })
  ```
- `generateNode()` safety-first design: returns empty on missing IRI (prevents accidental LLM costs)

### Changed
- `parse()` now accepts named parameters `{ text, context, dataFactory, graph }`
- `generate()` and `generateNode()` use unified object parameter pattern
- All functions return shapes that compose via `{ ...spread }`

## v.0.8.0 (2026-04-30)

### Added
- **Visual carrier styles** for improved readability:
  - Numbers (integer/decimal/double/float): code spans `` `42` `` for monospace display
  - Dates/DateTime: square brackets `[2024-01-01]` for consistency
  - Booleans: bold **true**/**false** for visual emphasis
  - Other literals: square brackets `[text]` (simple, readable)
  - Multiline content: `~~~` fenced blocks with proper datatype annotations
- **Label-in-heading enhancement**: When an entity has `rdfs:label`, the heading uses it as display text
  - Example: `# ACME Inc. {=my:orgs/acme .prov:Organization label}`
  - The "label" annotation indicates the heading carries the rdfs:label
  - Label quads are excluded from body literals to avoid duplication
- **rdfs:label for object links**: Object references use labels when available
  - Example: `*ACME Inc.* {+my:orgs/acme ?worksAt}` instead of repeating the IRI
- **Multiline literal escaping**: Fixed quote escaping in DataFactory for round-trip safety

### Changed
- `generate()` function now produces visually distinct output based on datatype
- Improved round-trip safety for complex content with special characters
- `generate()` auto-fallback: Uses first subject from quads if `primarySubject` not provided

### Added
- `generateNode(quads, focusIRI, context)` — Safe node-centric MDLD generation
  - Shows all quads where an IRI appears in any position (subject, object, predicate, type, datatype)
  - **Safety-first design**: Returns empty if `focusIRI` not found—never falls back to rendering all data
  - Prevents accidental LLM costs from misspelled IRIs in production environments
  - Optimized: DRY helper, no object spreads, memory-efficient
- Safety fix: `generate()` now gracefully handles IRIs not present as subjects (skips instead of crashing)

## v.0.7.0 (2026-03-23)

### BREAKING CHANGES
- **BREAKING:** Removed `applyDiff` function and entire applyDiff infrastructure
- **BREAKING:** Simplified `locate()` function signature from `locate(quad, origin, text, context)` to `locate(quad, origin)`
- **BREAKING:** Updated `generate()` function to only return text instead of `{ text, origin }`
- **BREAKING:** Removed `parseWithMerge` function (use `merge()` directly)

### Changed
- **Improved:** Origin system now uses lean `quadIndex` instead of complex `quadMap` structure
- **Improved:** Removed ~500 lines of deprecated code while maintaining full functionality
- **Improved:** Cleaner, more maintainable codebase with DRY principles
- **Fixed:** Resolved circular dependency in merge system

### Added
- Comprehensive test suite for lean origin system (7 new tests)
- Better error handling and validation in origin tracking

### Removed
- `applyDiff.js` file and all related infrastructure
- 12 deprecated utility functions from `utils.js`
- Complex slot management system and vacant slot tracking
- Mutable origin infrastructure for automated text mutation

## v.0.6.2 (2024-03-23)

### Added
- Full MD-LD specification implementation
- Complete test suite with 98+ tests
- Browser and Node.js compatibility
- Comprehensive documentation and examples

## v.0.5.2 (2026-02-17)

+ feat: IRI>URL in [link](url) {=iri}

## v.0.4.1 (2026-01-27)

+ feat: prefix folding
+ feat: `<URL> {?prop}` syntax

## v.0.4.0 (2026-01-26)

+ feat: many small improvements

## v.0.3.5 (2026-01-24)

Removed `schema` vocabulary - now it's `rdfs` and pure meta position to custom or imported ontologies.

## v.0.3.2 (2026-01-20)

+ Changed prefix pattern to `[ex] <http://example.org/>`

## v.0.3.1 (2026-01-19)

## v.0.3.0 (2026-01-16)

+ feat: consisten single-character syntax for v.0.3

## v.0.2.10 (2026-01-16)

+ feat: lists are using ?property syntax to consistency
+ fix: cleaner recipe
+ feat: better cookbook

## v.0.2.9 (2026-01-15)

+ feat: all inline spans are valid carriers
+ feat: authorship just in case
+ feat: started docs

## v.0.2.8 (2026-01-15)

+ 0.2.8
+ feat: soft fragment IRI syntax
+ feat: closed algebra

## v.0.2.7 (2026-01-14)

+ 0.2.7

## v.0.2.6 (2026-01-14)

+ 0.2.6
+ feat: =?iri soft IRI for objects

## v.0.2.5 (2026-01-14)

+ 0.2.5
+ feat: clean round-trip with vacant slots in origin
+ clean

## v.0.2.4 (2026-01-14)

+ 0.2.4
+ feat: chaining
+ feat: smaller
+ feat: origin is better
+ feat: diff
+ feat: simplified
+ feat: 41 tests - OK
+ feat: 0.2.3

## v.0.2.3 (2026-01-13)

+ fix: no build
+ fix: proper context handling

## v.0.2.2 (2026-01-13)

+ v. 0.2.1
+ feat: self-description
+ feat: self-validating Spec
+ feat: no paragraph carrier - better
+ feat: refactored for clean code
+ fix: annotation leak fix

## v.0.2.1 (2026-01-13)

+ feat: no literals and better lists
+ feat: round-trip tests
+ feat: new tests
+ feat: polished codeblocks
+ feat: dogfood out
+ feat: value carriers
+ feat: Spec solidifies
+ feat: v.02 cleanup
+ feat: 52 tests pass
+ feat: 33 tests passing

## v.0.2.0 (2026-01-12)

+ feat: v02 started
+ feat: v.0.2 Spec settled
+ ver: v.0.2 started
+ feat: v.0.2 spec is prepared
+ fix: no fragments
+ feat: v.0.2 is cooking

## v.0.1.1 (2025-12-31)

+ v.0.1.1

## v.0.1.0 (2025-12-31)

+ feat: transiton to 0.2
+ feat: default context and infered baseIRI
+ feat: no frontmatter parsing - default context assumed
+ feat: any subject IRI
+ fix: no spec yet
+ feat: NPM link
+ fix: real git source
+ feat: cleaner examples
+ fix: escape
+ fix: no new line
+ feat: Nice Readme and package.json
+ feat: codeblocks
+ feat: rdfs:label for headings
+ feat: lists fixed

## v.0.0.1 (2025-12-30)

+ feat: initial setup
