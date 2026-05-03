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

            // MD field must exist
            if (!('md' in result)) throw new Error('Result should have md field');

            // Prefix declarations at start of line should be stripped
            if (result.md.includes('[ex] <tag:')) throw new Error('Prefix declarations should be stripped');

            // Valid annotations should be stripped
            if (result.md.includes('{=ex:doc')) throw new Error('Subject annotations should be stripped');
            if (result.md.includes('{ex:content}')) throw new Error('Property annotations should be stripped');
            if (result.md.includes('{=ex:section1}')) throw new Error('Standalone subjects should be stripped');

            // Content should be preserved
            if (!result.md.includes('# Document')) throw new Error('Heading text should be preserved');
            if (!result.md.includes('Content')) throw new Error('Value carrier text should be preserved');
            if (!result.md.includes('More content here.')) throw new Error('Paragraph text should be preserved');

            // Quads should still be generated
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

            // Headings without annotations
            if (!result.md.includes('# Apollo 11')) throw new Error('H1 should be preserved');
            if (!result.md.includes('## Mission Details')) throw new Error('H2 should be preserved');
            if (result.md.includes('{=ex:apollo}')) throw new Error('H1 annotation should be stripped');
            if (result.md.includes('{=#details}')) throw new Error('H2 annotation should be stripped');

            // List items without annotations
            if (!result.md.includes('- **Flour**')) throw new Error('List item text should be preserved');
            if (!result.md.includes('- **Water**')) throw new Error('List item text should be preserved');
            if (result.md.includes('{+ex:flour')) throw new Error('List annotation should be stripped');

            // Blockquotes without annotations
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

            // Inline carriers preserved, annotations stripped
            if (!result.md.includes('*Important*')) throw new Error('Emphasis content should be preserved');
            if (!result.md.includes('**Saturn V**')) throw new Error('Strong content should be preserved');
            if (result.md.includes('{ex:emphasis}')) throw new Error('Emphasis annotation should be stripped');
            if (result.md.includes('{ex:rocket}')) throw new Error('Strong annotation should be stripped');
            if (result.md.includes('{ex:code}')) throw new Error('Link annotation should be stripped');

            // Code blocks preserved without annotations
            if (!result.md.includes('```javascript')) throw new Error('JS fence should be preserved');
            if (!result.md.includes('console.log("hello");')) throw new Error('JS code should be preserved');
            if (result.md.includes('{=ex:js')) throw new Error('Code block annotation should be stripped');

            // Plain code blocks unchanged
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

            // First parse should generate quads
            if (result1.quads.length === 0) throw new Error('Original should generate quads');

            // Second parse of clean MD
            const result2 = parse(cleanMd);

            // Clean MD should produce NO quads (no annotations remain)
            if (result2.quads.length !== 0) {
                throw new Error(`Clean MD should produce 0 quads, got ${result2.quads.length}`);
            }

            // Clean MD should be stable (idempotent)
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

            // Valid annotations stripped
            if (result.md.includes('{=ex:valid}')) throw new Error('Valid subject annotation should be stripped');
            if (result.md.includes('{+ex:good')) throw new Error('Valid list annotation should be stripped');

            // Invalid mid-line annotations PRESERVED (syntax error visible)
            if (!result.md.includes('{+ex:obj}')) {
                throw new Error('Invalid mid-line annotation should be preserved as marker');
            }
            if (!result.md.includes('{+ex:obj2}')) {
                throw new Error('Invalid mid-line annotation should be preserved as marker');
            }

            // But the trailing text is also there
            if (!result.md.includes('- trailing text')) {
                throw new Error('Trailing text should be preserved');
            }
        }
    }
];

export { mdTests };
