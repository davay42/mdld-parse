import { render, deconstruct } from '../src/render.js';
import { parse } from '../src/index.js'

// Test helpers for render function
function assertRender(condition, message) {
  if (!condition) throw new Error(message);
}

function assertContains(html, expected) {
  return expected.every(item => html.includes(item));
}

// Render-specific test suite
const renderTests = [
  {
    name: 'Roundtrip: Subject, types, literals reconstruct identically',
    fn: () => {
      const md = `[ex] <tag:example.com,2026:>
# Document {=ex:doc .ex:Document label}
[Alice] {ex:name}
[30] {ex:age ^^xsd:integer}`;
      const html = render(md);
      const md2 = deconstruct(html);

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;
      assertRender(q1.length === q2.length, `Quad count: ${q1.length} vs ${q2.length}`);
    }
  },
  {
    name: 'Roundtrip: Prefix folding preserved',
    fn: () => {
      const md = `[base] <http://example.com/>
[sub] <base:sub/>
# Doc {=sub:doc .sub:Type}`;
      const html = render(md);
      const md2 = deconstruct(html);

      // The folded form "base:sub/" must be reconstructed exactly
      assertRender(md2.includes('<base:sub/>'), 'Prefix folding must roundtrip');

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;
      assertRender(q1.length === q2.length, 'Quads must match');
    }
  },
  {
    name: 'Roundtrip: Nested inline carriers',
    fn: () => {
      const md = `[ex] <http://example.org/>
# Section {=ex:s}
This is **[important] {ex:priority}** text with [link](http://x) {ex:ref}.`;
      const html = render(md);
      const md2 = deconstruct(html);

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;
      assertRender(q1.length === q2.length, 'Nested carrier quads must match');
    }
  },
  {
    name: 'Roundtrip: Code blocks with language',
    fn: () => {
      const md = `[ex] <http://example.org/>
\`\`\`js {=ex:code .ex:Code ex:text}
console.log("hi")
\`\`\``;
      const html = render(md);
      const md2 = deconstruct(html);

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;
      assertRender(q1.length === q2.length, 'Code block quads must match');
      assertRender(md2.includes('```js'), 'Language must be preserved');
    }
  },
  {
    name: 'Roundtrip: Retractions reconstruct and resolve',
    fn: () => {
      const md = `[ex] <http://example.org/>
# Doc {=ex:doc}
[Draft] {ex:status}
[Draft] {-ex:status}`;
      const html = render(md);
      const md2 = deconstruct(html);

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;

      assertRender(q1.length === q2.length, 'Retraction resolution must match');
      assertRender(q1.length === 0, 'All quads should be retracted (subject declaration creates no quads)');
    }
  },
  {
    name: 'Roundtrip: Lists with multiple items',
    fn: () => {
      const md = `[ex] <http://example.org/>
- Alice {=ex:alice .ex:Person label}
- Bob {=ex:bob .ex:Person label}
- Carol {=ex:carol .ex:Person label}`;
      const html = render(md);
      const md2 = deconstruct(html);

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;
      assertRender(q1.length === q2.length, `List quads: ${q1.length} vs ${q2.length}`);
    }
  },
  {
    name: 'Ignores HTML comments (block and inline)',
    fn: () => {
      const md = `[ex] <http://example.org/>
<!-- This is a block comment -->
# Title {=ex:title}
This is a paragraph with an <!-- inline comment --> inside.
<!--
Multi-line
comment
-->
- Item 1 {=ex:item1}`;

      const html = render(md);

      // Ensure comments are completely stripped from HTML
      assertRender(!html.includes('<!--'), 'HTML should not contain comment start');
      assertRender(!html.includes('-->'), 'HTML should not contain comment end');
      assertRender(!html.includes('block comment'), 'Block comment text should be stripped');
      assertRender(!html.includes('inline comment'), 'Inline comment text should be stripped');
      assertRender(!html.includes('Multi-line'), 'Multi-line comment text should be stripped');

      // Ensure other elements still render correctly
      assertRender(html.includes('<h1'), 'Heading should still render');
      assertRender(html.includes('This is a paragraph with an  inside.'), 'Paragraph should render without inline comment');

      // Ensure deconstruct doesn't yield the comment
      const md2 = deconstruct(html);
      assertRender(!md2.includes('comment'), 'Deconstructed MD should not contain comments');
    }
  },
  {
    name: 'Roundtrip: Ordered lists',
    fn: () => {
      const md = `[ex] <http://example.org/>
1. First {=ex:first .ex:Item}
2. Second {=ex:second .ex:Item}
3. Third {=ex:third .ex:Item}`;
      const html = render(md);

      // Ensure it renders as an ordered list
      assertRender(html.includes('<ol class="mdld-list">'), 'Ordered list should render as <ol>');
      assertRender(!html.includes('<ul class="mdld-list">'), 'Ordered list should not render as <ul>');

      const md2 = deconstruct(html);

      // Deconstruct should reconstruct ordered lists
      assertRender(md2.includes('1. First'), 'Deconstructed MD should contain ordered list marker');
      assertRender(md2.includes('2. Second'), 'Deconstructed MD should contain second ordered list marker');

      const q1 = parse(md).quads;
      const q2 = parse(md2).quads;
      assertRender(q1.length === q2.length, `Ordered list quads: ${q1.length} vs ${q2.length}`);
    }
  },
  {
    name: 'External links open in a new tab',
    fn: () => {
      const md = `[ex] <http://example.org/>
See [the spec](https://example.com/spec) and [Example](http://example.com).`;
      const html = render(md);

      assertRender(html.includes('href="https://example.com/spec"'), 'External href must be preserved');
      assertRender(html.includes('target="_blank"'), 'External link must have target="_blank"');
      assertRender(html.includes('rel="noopener noreferrer"'), 'External link must have safe rel');
      assertRender((html.match(/target="_blank"/g) || []).length === 2, 'Both external links must open in new tab');

      const md2 = deconstruct(html);
      assertRender(md2.includes('[the spec](https://example.com/spec)'), 'Link must roundtrip');
    }
  },
  {
    name: 'HTML blocks render raw and roundtrip',
    fn: () => {
      const md = `[ex] <http://example.org/>
# Comma {=ex:comma}

The comma must remain distinct:

<table>
<thead><tr><th>Comma</th><th>Ratio</th></tr></thead>
<tbody>
<tr><td>Pythagorean</td><td>531441:524288</td></tr>
</tbody>
</table>

Trailing paragraph.`;
      const html = render(md);

      assertRender(html.includes('<table>'), 'Table tag must render raw');
      assertRender(html.includes('<td>Pythagorean</td>'), 'Table cells must not be escaped');
      assertRender(!html.includes('&lt;table&gt;'), 'Table must not be escaped');

      const md2 = deconstruct(html);
      assertRender(md2.includes('<table>'), 'Table must survive deconstruct');
      assertRender(md2.includes('</table>'), 'Table close tag must survive deconstruct');
      assertRender(md2.includes('Trailing paragraph.'), 'Following paragraph must survive');
    }
  },
  {
    name: 'Inline HTML passes through, code spans stay escaped',
    fn: () => {
      const md = `Text with <b>bold html</b> and \`code <i>not html</i>\`.`;
      const html = render(md);

      assertRender(html.includes('<b>bold html</b>'), 'Inline HTML must render raw');
      assertRender(html.includes('code &lt;i&gt;not html&lt;/i&gt;'), 'Code span content must be escaped');
      assertRender(!html.includes('<i>not html</i>'), 'Code span must not leak HTML');
    }
  },
  {
    name: 'Indented code blocks render and roundtrip',
    fn: () => {
      const md = `para

    code line 1
    code line 2

    after blank

after`;
      const html = render(md);

      assertRender(html.includes('<pre><code class="mdld-codeblock language-text">'), 'Indented code must render as code block');
      assertRender(html.includes('code line 1\ncode line 2'), 'Indent must be stripped from content');
      assertRender(!html.includes('    code line'), 'Leading indent must not leak into HTML');

      const md2 = deconstruct(html);
      assertRender(md2.includes('```'), 'Code block must reconstruct as fenced code');
      assertRender(md2.includes('code line 1'), 'Code content must survive');
    }
  },
  {
    name: 'Fragment, relative, and mailto links render as anchors',
    fn: () => {
      const md = `See [Terms](#terms), [Docs](/guide), and [Email](mailto:a@b.c).`;
      const html = render(md);

      assertRender(html.includes('href="#terms"'), 'Fragment link must render');
      assertRender(html.includes('href="/guide"'), 'Relative link must render');
      assertRender(html.includes('href="mailto:a@b.c"'), 'Mailto link must render');
      assertRender(!html.includes('(#terms)'), 'Destination must not be swallowed');
      // Fragment links stay on the same page
      const fragTag = html.slice(html.indexOf('href="#terms"') - 20, html.indexOf('href="#terms"') + 60);
      assertRender(!fragTag.includes('target="_blank"'), 'Fragment link must not open in new tab');

      const md2 = deconstruct(html);
      assertRender(md2.includes('[Terms](#terms)'), 'Fragment link must roundtrip');
    }
  },
  {
    name: 'Link titles render as title attribute and roundtrip',
    fn: () => {
      const html = render('[T](https://x.com "a title") and [U](/p (paren title))');
      assertRender(html.includes('title="a title"'), 'Title must render as attribute');
      assertRender(!html.includes('href="https://x.com &quot;'), 'Title must not leak into href');
      assertRender(html.includes('title="paren title"'), 'Paren title must render');

      const md2 = deconstruct(html);
      assertRender(md2.includes('"a title"'), 'Title must reconstruct');
    }
  },
  {
    name: 'Images render as img elements',
    fn: () => {
      const html = render('A ![alt text](https://x.com/i.png) here.');
      assertRender(html.includes('<img src="https://x.com/i.png" alt="alt text"'), 'Image must render as <img>');
      assertRender(!html.includes('!<a'), 'Image must not render as literal ! + link');

      const md2 = deconstruct(html);
      assertRender(md2.includes('![alt text](https://x.com/i.png)'), 'Image must roundtrip');
    }
  },
  {
    name: 'Entities decode and backslash escapes suppress markup',
    fn: () => {
      const html = render('fish &amp; chips &#169; and \\*not emph\\*');
      assertRender(html.includes('fish &amp; chips ©'), 'Entities must decode');
      assertRender(html.includes('*not emph*'), 'Escaped asterisks must render literally');
      assertRender(!html.includes('<em'), 'Escaped asterisks must not emphasize');

      const md2 = deconstruct(html);
      assertRender(md2.includes('\\*not emph\\*'), 'Escaped punctuation must reconstruct escaped');
    }
  },
  {
    name: 'Ordered lists support ) delimiter and start attribute',
    fn: () => {
      const html = render('1) paren\n2) list');
      assertRender(html.includes('<ol class="mdld-list">'), ') delimiter must render as <ol>');
      assertRender(html.includes('paren') && html.includes('list'), 'Items must render');

      const html2 = render('3. third\n4. fourth');
      assertRender(html2.includes('start="3"'), 'Non-1 start must emit start attribute');
      const md2 = deconstruct(html2);
      assertRender(md2.includes('3. third') && md2.includes('4. fourth'),
        'Deconstruct must preserve start numbering');
    }
  },
  {
    name: 'Heading closing hashes are stripped',
    fn: () => {
      assertRender(render('# Title #').includes('>Title</h1>'), 'Closing # must be stripped');
      assertRender(render('# C# keep').includes('C# keep'), 'Intraword # must be kept');
      assertRender(render('## h2 ## {=ex:h}', { context: { ex: 'http://example.com/' } }).includes('>h2</h2>'), 'Closing # before attrs must strip');
    }
  },
  {
    name: 'List marker changes split lists',
    fn: () => {
      const html = render('- a\n+ b\n* c');
      assertRender((html.match(/<ul class="mdld-list">/g) || []).length === 3,
        'Each bullet marker must start a new list');
      const html2 = render('1. a\n2) b');
      assertRender((html2.match(/<ol class="mdld-list"/g) || []).length === 2,
        'Ordered delimiter change must split lists');
    }
  },
  {
    name: 'Blockquote lazy continuation and per-line annotations',
    fn: () => {
      const html = render('> quote line1\nlazy continuation');
      assertRender(html.includes('quote line1\nlazy continuation'),
        'Lazy line must continue the quote paragraph');
      assertRender(html.includes('</blockquote>') && !html.includes('</blockquote>\n<p'),
        'Lazy line must not escape the quote');

      // Per-line annotations on non-first quote lines must not be dropped
      const html2 = render('> first\n> second {=ex:s .ex:T}');
      assertRender(html2.includes('{=ex:s .ex:T}'), 'Annotation must survive in HTML');
      const md2 = deconstruct(html2);
      assertRender(md2.includes('{=ex:s .ex:T}'), 'Annotation must roundtrip');
    }
  },
  {
    name: 'Multiline blockquote annotations bind to accumulated text',
    fn: () => {
      // Trailing annotation covers all unannotated quote lines
      const md = `[ex] <http://e.org/>
> line one
> line two {=ex:s .ex:T ex:label}`;
      const { quads } = parse(md);
      const labelQuad = quads.find(q => String(q.predicate?.value ?? q.predicate).endsWith('/label'));
      assertRender(labelQuad, 'Label quad must exist');
      assertRender(String(labelQuad.object?.value ?? labelQuad.object).includes('line one\nline two'),
        'Annotation must bind to whole quote text');

      // Per-line annotations on consecutive quote lines stay independent
      const md2 = `[ex] <http://e.org/>
> a {=ex:x .ex:T ex:l1}
> b {=ex:y .ex:T ex:l2}`;
      const q2 = parse(md2).quads;
      const l1 = q2.find(q => String(q.predicate?.value ?? q.predicate).endsWith('/l1'));
      const l2 = q2.find(q => String(q.predicate?.value ?? q.predicate).endsWith('/l2'));
      assertRender(String(l1.object?.value ?? l1.object) === 'a', 'First annotation binds its own line');
      assertRender(String(l2.object?.value ?? l2.object) === 'b', 'Second annotation binds its own line');
    }
  },
  {
    name: 'Emphasis follows CommonMark flanking rules',
    fn: () => {
      // Intraword underscores and spaced asterisks must not emphasize
      assertRender(render('snake_case_name').includes('snake_case_name'), 'Intraword _ must stay literal');
      assertRender(render('2 * 3 * 4').includes('2 * 3 * 4'), 'Spaced * must stay literal');
      // But intraword asterisks and real emphasis still work
      assertRender(render('a*b*c').includes('<em class="mdld-italic">b</em>'), 'Intraword * may emphasize');
      assertRender(render('*em* **strong**').includes('<strong class="mdld-bold">strong</strong>'), 'Strong must render');
      // Nested emphasis pairs correctly
      const nested = render('*a **b** c*');
      assertRender(nested.includes('<strong class="mdld-bold">b</strong>'), 'Nested strong must render inside em');
      assertRender(nested.indexOf('<em') < nested.indexOf('<strong'), 'Outer em must wrap inner strong');
      // Escaped delimiters stay literal
      assertRender(render('\\*not emph\\*').includes('*not emph*'), 'Escaped * must stay literal');
    }
  },
  {
    name: 'Invalid link destinations stay literal',
    fn: () => {
      const html = render('[bad](not a link) stays');
      assertRender(html.includes('[bad](not a link)'), 'Invalid destination must remain literal text');
      assertRender(!html.includes('mdld-link'), 'Invalid destination must not become a link');
    }
  },
  {
    name: 'Indented code cannot interrupt a paragraph',
    fn: () => {
      const html = render('para text\n    still paragraph');
      assertRender(html.includes('<p class="mdld-paragraph">para text\n    still paragraph</p>'),
        'Indented line after paragraph text must stay in the paragraph');
    }
  },
  {
    name: 'Hard line breaks render as <br /> and roundtrip',
    fn: () => {
      const md = `line one  
line two\\
line three
line four  `;
      const html = render(md);

      assertRender(html.includes('line one<br />'), 'Two trailing spaces must produce <br />');
      assertRender(html.includes('line two<br />'), 'Backslash must produce <br />');
      assertRender(!html.includes('line three<br'), 'Soft break must not produce <br />');
      // Trailing spaces on the last line of a block are not a hard break
      assertRender(html.includes('line four  </p>'), 'End-of-block spaces must not produce <br />');

      const md2 = deconstruct(html);
      assertRender(md2.includes('line one  \nline two'), 'Hard breaks must reconstruct');
    }
  },
  {
    name: 'Block HTML interrupts paragraphs, lone inline tags do not',
    fn: () => {
      const md = `before
<div>raw block</div>

next para
<span>lone</span>
still same para`;
      const html = render(md);

      assertRender(html.includes('<div>raw block</div>'), 'Div block must render raw');
      assertRender(html.includes('before</p>'), 'Paragraph must end before HTML block');
      // <span> alone on a line cannot interrupt a paragraph (CommonMark type 7)
      assertRender(html.includes('next para\n<span>lone</span>\nstill same para'),
        'Lone inline tag must stay inside the paragraph');
    }
  }
];

export { renderTests };