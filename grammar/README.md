# MD-LD TextMate Grammar

This directory contains the official TextMate grammar for MD-LD, published as the primary syntax specification for the language.

## Files

- **`mdld.tmLanguage.json`** - The TextMate grammar (published standard)
- **`mdld.ebnf`** - ISO 14977 EBNF grammar (reference specification)

## Philosophy

The TextMate grammar is the **core published artifact** for MD-LD syntax, replacing the need for formal parser generators (Nearley, BNF, etc.). This approach:

1. **Portability** - Works with VS Code, Sublime Text, GitHub, Shiki, and any TextMate-compatible tool
2. **Practicality** - Syntax highlighting is the primary use case for grammar definitions
3. **Simplicity** - Single, well-maintained grammar instead of multiple format variants
4. **Verification** - The handmade parser can validate against this grammar

## Grammar Structure

The TextMate grammar implements MD-LD's core concepts:

### 1. Context Declarations
```json
{
  "match": "^\\s*(\\[)(@vocab|[A-Za-z][A-Za-z0-9_-]*)(\\])\\s+(<)([^>]+)(>)",
  "captures": {
    "2": { "name": "entity.name.tag.prefix.mdld" },
    "5": { "name": "string.unquoted.iri.mdld" }
  }
}
```

### 2. Attribute Blocks
The heart of MD-LD - attribute blocks `{...}` contain semantic annotations:

| Token | Pattern | Example |
|-------|---------|---------|
| Subject | `=` | `{=ex:subject}` |
| Fragment | `=#` | `{=#fragment}` |
| Object | `+` | `{+ex:object}` |
| Type | `.` | `{.foaf:Person}` |
| Predicate | (bare) | `{predicate}` |
| Object Predicate | `?` | `{?predicate}` |
| Reverse Predicate | `!` | `{!predicate}` |
| Datatype | `^^` | `{^^xsd:integer}` |
| Language | `@` | `{@en}` |
| Remove | `-` prefix | `{-predicate}` |

### 3. Value Carriers
Annotations attach to Markdown constructs:
- **Headings**: `# Title {=subject .Type}`
- **List items**: `- Item {predicate}`
- **Blockquotes**: `> Quote {=subject}`
- **Inline spans**: `[text](url) {+object}`
- **Code fences**: ````code```` `{=subject}`
- **Standalone**: `{=subject}`

## Usage with Shiki

```javascript
import { getHighlighter } from 'shiki';
import mdldGrammar from './mdld.tmLanguage.json';

const highlighter = await getHighlighter({
  themes: ['github-light'],
  langs: [
    {
      id: 'mdld',
      ...mdldGrammar
    }
  ]
});

const html = highlighter.codeToHtml(mdldSource, {
  lang: 'mdld',
  theme: 'github-light'
});
```

## Usage with CodeJar

```javascript
import { CodeJar } from 'codejar';
import { createMdldHighlighterForCodeJar } from './shiki-mdld-demo.js';

const editor = document.querySelector('#editor');
const highlight = await createMdldHighlighterForCodeJar();
const jar = CodeJar(editor, highlight);
```

## Verification

The grammar can be validated:

```bash
node scripts/test-textmate.js
```

## Origin Integration

The "flat" quad-based architecture works seamlessly with TextMate highlighting:

1. **Parser** emits Quads + Origin `{start, end, type}`
2. **Shiki** generates HTML spans based on TextMate grammar
3. **Glue** uses Origin data to overlay interactive behavior

Because MD-LD is flat (not tree-based), the mapping between text ranges and semantic data is straightforward.

## Scope Names

| Construct | Scope |
|-----------|-------|
| Prefix | `entity.name.tag.prefix.mdld` |
| IRI | `string.unquoted.iri.mdld` |
| Subject | `entity.name.subject.mdld` |
| Object | `entity.name.object.mdld` |
| Type | `entity.name.type.mdld` |
| Predicate | `variable.other.predicate.mdld` |
| Datatype | `entity.name.type.datatype.mdld` |
| Language | `entity.name.language.mdld` |
| Remove mod | `keyword.operator.remove.mdld` |
| Attribute block | `meta.attrsBlock.mdld` |

## References

- [Spec.md](../spec/Spec.md) - Normative MD-LD specification
- [Syntax.md](../docs/Syntax.md) - Human-friendly syntax guide


[mdld.tmLanguage.json](./mdld.tmLanguage.json ':include :type=json')
