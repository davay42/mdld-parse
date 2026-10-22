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
  }
];

export { renderTests };