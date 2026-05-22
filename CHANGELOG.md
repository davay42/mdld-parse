# MD-LD evolution

## v1.0.0 (2026-05-22)

### Production Release

### Breaking Changes
- **Reverse connection rendering now requires explicit `primarySubject`** — When `primarySubject` is not provided to `generate()`, reverse connections (`!p` annotations) are not rendered. This ensures deterministic, order-independent behavior and prevents quad duplication issues from order-sensitive fallbacks.

### Performance Improvements
- **Pre-computed filtered groups** — Replaced lazy caching with upfront computation of filtered quad groups for O(1) access during rendering
- **Simplified quad tracking** — Consolidated `renderedReverseQuads`, `renderedInlineQuads`, and `renderedInlineSubjects` into a single `renderedQuads` Set
- **Removed redundant state** — Eliminated `skippedSubjects` Set and derived skip conditions from `renderedQuads`

### Code Quality (DRY)
- **Centralized RDF term constants** — All W3C RDF IRIs now defined in `src/constants.js`:
  - `RDFS_LABEL`, `RDFS_COMMENT`
  - `RDF_TYPE`, `RDF_LANG_STRING`, `RDF_STATEMENT`, `RDF_SUBJECT`, `RDF_PREDICATE`, `RDF_OBJECT`
  - `XSD_STRING`, `XSD_BOOLEAN`, `XSD_INTEGER`, `XSD_DOUBLE`
- **Removed duplicate constant definitions** from `shared.js` and `utils.js`
- **Eliminated magic strings** throughout codebase for better maintainability

### Bug Fixes
- **Fixed quad duplication in heading types/labels** — Types and labels rendered in heading annotations are now marked as rendered to prevent inline duplication
- **Fixed order-sensitive primarySubject fallback** — Removed fallback to first subject from quads, ensuring deterministic output regardless of quad ordering

### Documentation
- **Updated README.md** — Documented `primarySubject` behavior for reverse connections
- **Updated docs/API.md** — Added clear documentation for generate function parameters
- **Documented compactInline default** — Clarified that inline compaction is enabled by default

### Test Coverage
- **132 tests passing** — Full backward compatibility maintained
- **All quad stability tests passing** — Round-trip safety verified

### Migration Guide
If you were relying on reverse connection rendering without explicitly setting `primarySubject`:

```javascript
// Before (v0.10.0)
const { text } = generate({ quads, context });
// Reverse connections rendered with order-sensitive fallback

// After (v1.0.0)
const { text } = generate({ quads, context, primarySubject: 'http://example.org/subject' });
// Reverse connections rendered only when primarySubject explicitly provided
```

## v0.10.0 (2026-05-05)

### Added
- **Character-based tokenization system** — Complete regex replacement for improved performance and maintainability
  - **Block-level tokenizers**: `detectFence()`, `detectPrefix()`, `detectHeading()`, `detectList()`, `detectBlockquote()`, `detectStandaloneSubject()`
  - **Inline carrier scanner**: `scanInlineCarriers()` replaces `extractInlineCarriers()` 
  - **Memory-optimized design**: Lazy evaluation and minimal object allocations
  - **Better error handling**: More precise edge case detection and graceful failure

### Performance Improvements
- **20-28% faster parsing**: 23ms vs 25ms (1x), 186ms vs 231ms (10x)
- **Efficient memory usage**: ~640 bytes per quad retained after GC
- **O(1) additional memory**: Only stores essential metadata during parsing
- **Streaming-friendly**: Maintains single-pass linear time complexity

### Changed
- **Replaced all major regex patterns** with character-based detection functions
- **Unified tokenizer architecture**: All tokenization logic centralized in `src/tokenizers.js`
- **Cleaner code structure**: Easier to debug, test, and extend
- **Preserved constants**: Original regex patterns kept in `constants.js` for reference

### Fixed
- **Empty literal handling**: `[] {label}` now correctly emits quad with empty string
- **Angle bracket URL validation**: Invalid URLs like `<not-a-url>` properly ignored
- **Bracket link type detection**: Correctly distinguishes between `[text]` (span) and `[text](url)` (link)

### Technical Details
- **127/127 tests passing** — Full backward compatibility maintained
- **Character-based detection** uses direct string manipulation instead of regex
- **Soft subject handling** for angle bracket URLs (`<URL> {type}`)
- **Memory profiling** confirms efficient resource usage

## v.0.9.1 (2026-05-03)

### Added
- **`md` field in parse() result** — Clean Markdown extraction with all MD-LD annotations stripped
  - Valid annotations (`{=...}`, `{+...}`, `{...}`) completely removed
  - Content from value carriers preserved (`[text]`, `**bold**`, `` `code` ``)
  - Invalid syntax preserved as visible markers for debugging
  - Round-trip safe: re-parsing clean MD produces zero quads
  - Enables content extraction, syntax validation, and preview generation
- **Self-validating syntax detection** — Remaining `{...}` patterns in clean MD indicate misplaced annotations

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
