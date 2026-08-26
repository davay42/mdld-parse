import { parse } from '../src/parse.js';

// Comprehensive test cases for MD stripping feature
// All examples are inline - no file dependencies

const mdTests = [
    {
        name: 'MD field exists and prefixes/annotations stripped',
        fn: () => {
            const mdld = `[ex] <tag:ex.org,2026:>
[foaf] <http://xmlns.com/foaf/0.1/>

# Document {=ex:doc .foaf:Document label}
[Content] {ex:content}

{=ex:section1}
More content here. {ex:note}`;

            const result = parse(mdld);

            if (!('md' in result)) throw new Error('Result should have md field');
            if (result.md.includes('[ex] <tag:')) throw new Error('Prefix declarations should be stripped');
            if (result.md.includes('{=ex:doc')) throw new Error('Subject annotations should be stripped');
            if (result.md.includes('{ex:content}')) throw new Error('Property annotations should be stripped');
            if (result.md.includes('{=ex:section1}')) throw new Error('Standalone subjects should be stripped');

            if (!result.md.includes('# Document')) throw new Error('Heading text should be preserved');
            if (!result.md.includes('Content')) throw new Error('Value carrier text should be preserved');
            if (!result.md.includes('More content here.')) throw new Error('Paragraph text should be preserved');
            if (result.quads.length === 0) throw new Error('Quads should be generated');
        }
    },
    {
        name: 'Headings, lists, blockquotes cleaned',
        fn: () => {
            const mdld = `[ex] <tag:ex.org,2026:>

# Apollo 11 {=ex:apollo .ex:Mission label}
## Mission Details {=#details label}

Ingredients:
- **Flour** {+ex:flour ?ex:ingredient .ex:Ingredient label}
- **Water** {+ex:water ?ex:ingredient .ex:Ingredient label}

> Quote one {ex:quote1}
> Quote two {ex:quote2}`;

            const result = parse(mdld);

            if (!result.md.includes('# Apollo 11')) throw new Error('H1 should be preserved');
            if (!result.md.includes('## Mission Details')) throw new Error('H2 should be preserved');
            if (result.md.includes('{=ex:apollo}')) throw new Error('H1 annotation should be stripped');
            if (result.md.includes('{=#details}')) throw new Error('H2 annotation should be stripped');

            if (!result.md.includes('- **Flour**')) throw new Error('List item text should be preserved');
            if (!result.md.includes('- **Water**')) throw new Error('List item text should be preserved');
            if (result.md.includes('{+ex:flour')) throw new Error('List annotation should be stripped');

            if (!result.md.includes('> Quote one')) throw new Error('Blockquote text should be preserved');
            if (!result.md.includes('> Quote two')) throw new Error('Blockquote text should be preserved');
            if (result.md.includes('{ex:quote1}')) throw new Error('Blockquote annotation should be stripped');
        }
    },
    {
        name: 'Inline carriers and code blocks cleaned',
        fn: () => {
            const mdld = `[ex] <tag:ex.org,2026:>

# Mission {=ex:mission}
[*Important*] {ex:emphasis} mission using **Saturn V** {ex:rocket} rocket.
[Code example] {ex:code} with \`inline code\` {ex:inline}.

\`\`\`javascript {=ex:js .ex:Code text}
console.log("hello");
\`\`\`

\`\`\`python
# Plain code block
print("world")
\`\`\``;

            const result = parse(mdld);

            if (!result.md.includes('*Important*')) throw new Error('Emphasis content should be preserved');
            if (!result.md.includes('**Saturn V**')) throw new Error('Strong content should be preserved');
            if (result.md.includes('{ex:emphasis}')) throw new Error('Emphasis annotation should be stripped');
            if (result.md.includes('{ex:rocket}')) throw new Error('Strong annotation should be stripped');
            if (result.md.includes('{ex:code}')) throw new Error('Link annotation should be stripped');

            if (!result.md.includes('```javascript')) throw new Error('JS fence should be preserved');
            if (!result.md.includes('console.log("hello");')) throw new Error('JS code should be preserved');
            if (result.md.includes('{=ex:js')) throw new Error('Code block annotation should be stripped');

            if (!result.md.includes('```python')) throw new Error('Python fence should be preserved');
            if (!result.md.includes('print("world")')) throw new Error('Python code should be preserved');
        }
    },
    {
        name: 'Round-trip safety: clean MD parses to zero quads',
        fn: () => {
            const mdld = `[my] <tag:test@example.com,2026:>

# Test Document {=my:doc .my:Doc label}

Some **bold** and *italic* text.

## Section {=my:section}
- **Item 1** {+my:item1 ?my:item}
- **Item 2** {+my:item2 ?my:item}

> A quote {my:quote}`;

            const result1 = parse(mdld);
            const cleanMd = result1.md;

            if (result1.quads.length === 0) throw new Error('Original should generate quads');

            const result2 = parse(cleanMd);

            if (result2.quads.length !== 0) {
                throw new Error(`Clean MD should produce 0 quads, got ${result2.quads.length}`);
            }
            if (result2.md !== cleanMd) {
                throw new Error('MD stripping should be idempotent');
            }
        }
    },
    {
        name: 'Invalid syntax (mid-line annotations) preserved as visible markers',
        fn: () => {
            const mdld = `[ex] <tag:ex.org,2026:>

# Valid {=ex:valid}
1. **Item** {+ex:obj} - trailing text makes this invalid
2. **Another** {+ex:obj2} more trailing text

Valid item:
- **Good** {+ex:good .ex:Type}

After invalid block {ex:after}`;

            const result = parse(mdld);

            if (result.md.includes('{=ex:valid}')) throw new Error('Valid subject annotation should be stripped');
            if (result.md.includes('{+ex:good')) throw new Error('Valid list annotation should be stripped');

            if (!result.md.includes('{+ex:obj}')) {
                throw new Error('Invalid mid-line annotation should be preserved as marker');
            }
            if (!result.md.includes('{+ex:obj2}')) {
                throw new Error('Invalid mid-line annotation should be preserved as marker');
            }
            if (!result.md.includes('- trailing text')) {
                throw new Error('Trailing text should be preserved');
            }
        }
    },
    {
        name: 'Vue SFC blocks preserve scripts, templates, and styles',
        fn: () => {
            const mdld = `[ex] <tag:ex.org,2026:>

<script setup>
import { ref } from 'vue';
const config = { enabled: true };
</script>

<template>
  <div class="card">
    <pre>{{ data }}</pre>
  </div>
</template>

<style scoped>
.card { color: red; }
</style>

# Header {=ex:doc}`;

            const result = parse(mdld);

            if (!result.md.includes("const config = { enabled: true };")) {
                throw new Error('JS code in script block should be preserved');
            }
            if (!result.md.includes('<pre>{{ data }}</pre>')) {
                throw new Error('Vue mustache interpolation in template block should be preserved');
            }
            if (!result.md.includes('.card { color: red; }')) {
                throw new Error('CSS rules in style block should be preserved');
            }
            if (result.md.includes('{=ex:doc}')) {
                throw new Error('Annotations outside SFC tags should be stripped');
            }
        }
    },
    {
        name: 'Multiple inline carriers on one line are stripped without index shift corruption',
        fn: () => {
            const mdld = `[*First*]{ex:one} middle text [**Second**]{ex:two} end text [*Third*]{ex:three}.`;
            const result = parse(mdld);

            const expected = `*First* middle text **Second** end text *Third*.`;
            if (!result.md.includes(expected)) {
                throw new Error(`Multiple inline carriers failed to process cleanly. Got: "${result.md}"`);
            }
        }
    },
    {
        name: 'Inline code spans protect annotations and brace syntax inside backticks',
        fn: () => {
            const mdld = `Use \`{=ex:anno}\` for subject and \`[Link]{ex:prop}\` inside \`{{ var }}\` code.`;
            const result = parse(mdld);

            const expected = `Use \`{=ex:anno}\` for subject and \`[Link]{ex:prop}\` inside \`{{ var }}\` code.`;
            if (!result.md.includes(expected)) {
                throw new Error(`Inline code content was corrupted. Got: "${result.md}"`);
            }
        }
    },
    {
        name: 'Vue mustaches containing JS object literals or inner braces are preserved',
        fn: () => {
            const mdld = `Output: {{ { a: 1, b: 2 } }} and {{ item.check('}') ? 'yes' : 'no' }}.`;
            const result = parse(mdld);

            if (!result.md.includes("Output: {{ { a: 1, b: 2 } }} and {{ item.check('}') ? 'yes' : 'no' }}.")) {
                throw new Error(`Complex mustache expression with internal braces was truncated. Got: "${result.md}"`);
            }
        }
    },
    {
        name: 'Markdown trailing double-spaces for hard line breaks are preserved',
        fn: () => {
            const mdld = `First line with hard break  \nSecond line follows.`;
            const result = parse(mdld);

            if (!result.md.includes('First line with hard break  \nSecond line follows.')) {
                throw new Error(`Trailing spaces for Markdown line break were improperly stripped. Got: "${result.md}"`);
            }
        }
    },
    {
        name: 'Mixed paragraph combining Vue interpolations, code spans, and inline carriers',
        fn: () => {
            const mdld = `[Doc]{ex:doc} {{ user.name }} using \`{code}\` with [*bold text*]{ex:b}.`;
            const result = parse(mdld);

            const expected = `Doc {{ user.name }} using \`{code}\` with *bold text*.`;
            if (!result.md.includes(expected)) {
                throw new Error(`Mixed paragraph rendering failed. Got: "${result.md}"`);
            }
        }
    }
];

export { mdTests };