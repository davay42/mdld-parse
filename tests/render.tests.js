import { render } from '../src/render.js';

// Test helpers for render function
function assertRender(condition, message) {
  if (!condition) throw new Error(message);
}

function assertValidHTML(html) {
  // Basic HTML validation checks
  assertRender(html.startsWith('<div'), 'Should start with div wrapper');
  assertRender(html.endsWith('</div>'), 'Should end with div wrapper');
  assertRender(html.includes('<div prefix="') || html.includes('<div vocab="'), 'Should have RDFa context');
}

function assertValidRDFa(html) {
  // Check for proper RDFa structure
  assertRender(html.includes('prefix="') || html.includes('vocab="'), 'Should have RDFa context declarations');
  assertRender(!html.includes('{'), 'Should not contain raw MD-LD annotations');
  assertRender(!html.includes('}'), 'Should not contain raw MD-LD annotations');
}

// Basic render tests
const renderTests = [
  {
    name: 'Context declarations with valid structure',
    fn: async () => {
      const md = `[ex] <http://example.org/>
[@vocab] <http://schema.org/>

# Test {=ex:test .Thing}`;

      const result = render(md);

      // Validate overall structure
      assertValidHTML(result.html);
      assertValidRDFa(result.html);

      // Validate specific RDFa structure
      assertRender(result.html.includes('prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#'), 'Should include RDF prefix');
      assertRender(result.html.includes('ex: http://example.org/'), 'Should include custom prefix');
      assertRender(result.html.includes('vocab="http://schema.org/"'), 'Should include vocab declaration');

      // Validate heading structure
      assertRender(result.html.includes('<h1 about="ex:test" typeof="Thing">'), 'Should have proper heading with RDFa');
      assertRender(result.html.includes('</h1>'), 'Should close heading tag');
      assertRender(result.html.includes('>Test</h1>'), 'Should contain heading text');
    }
  },

  {
    name: 'Basic subject and type with valid HTML',
    fn: () => {
      const md = `# Document {=ex:doc .Document}`;
      const result = render(md);

      // Validate overall structure
      assertValidHTML(result.html);
      assertValidRDFa(result.html);

      // Validate specific structure
      assertRender(result.html.includes('<h1 about="ex:doc" typeof="Document">'), 'Should have heading with attributes');
      assertRender(result.html.includes('</h1>'), 'Should close heading tag');
      assertRender(result.html.includes('>Document</h1>'), 'Should contain heading text');

      // Validate no raw annotations
      assertRender(!result.html.includes('{=ex:doc'), 'Should not contain raw subject');
      assertRender(!result.html.includes('.Document'), 'Should not contain raw type');
    }
  },

  {
    name: 'Multiple semantic blocks with proper nesting',
    fn: () => {
      const md = `# Document {=ex:doc .Article}

# Section 1 {=ex:section1 .Section}

# Section 2 {=ex:section2 .Section}`;

      const result = render(md);

      // Validate overall structure
      assertValidHTML(result.html);
      assertValidRDFa(result.html);

      // Validate all headings are present and properly structured
      assertRender(result.html.includes('<h1 about="ex:doc" typeof="Article">'), 'Should have document heading');
      assertRender(result.html.includes('<h1 about="ex:section1" typeof="Section">'), 'Should have first section heading');
      assertRender(result.html.includes('<h1 about="ex:section2" typeof="Section">'), 'Should have second section heading');

      // Validate proper closing tags
      const headingCount = (result.html.match(/<h1/g) || []).length;
      const closingCount = (result.html.match(/<\/h1>/g) || []).length;
      assertRender(headingCount === closingCount, 'Should have equal opening and closing heading tags');

      // Validate content
      assertRender(result.html.includes('>Document</h1>'), 'Should contain document text');
      assertRender(result.html.includes('>Section 1</h1>'), 'Should contain first section text');
      assertRender(result.html.includes('>Section 2</h1>'), 'Should contain second section text');
    }
  },

  {
    name: 'RDFa context completeness',
    fn: () => {
      const md = `# Test {=ex:test .Thing}`;
      const result = render(md);

      // Validate all required RDFa prefixes are present
      const requiredPrefixes = ['rdf:', 'rdfs:', 'xsd:'];
      requiredPrefixes.forEach(prefix => {
        assertRender(result.html.includes(prefix), `Should include ${prefix} prefix`);
      });

      // Validate prefix declaration format
      assertRender(result.html.includes('prefix="'), 'Should have prefix attribute');
      assertRender(result.html.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#'), 'Should include RDF namespace');
      assertRender(result.html.includes('http://www.w3.org/2000/01/rdf-schema#'), 'Should include RDFS namespace');
      assertRender(result.html.includes('http://www.w3.org/2001/XMLSchema#'), 'Should include XSD namespace');

      // Validate vocab declaration
      assertRender(result.html.includes('vocab="http://www.w3.org/2000/01/rdf-schema#"'), 'Should have default vocab');
    }
  },

  {
    name: 'HTML attribute quoting and escaping',
    fn: () => {
      const md = `# "Special & Chars" {=ex:test .Thing}`;
      const result = render(md);

      // Validate HTML escaping
      assertRender(result.html.includes('&quot;'), 'Should escape quotes in content');
      assertRender(!result.html.includes('"Special & Chars"'), 'Should not have unescaped quotes');

      // Validate attributes are properly quoted
      assertRender(result.html.includes('about="ex:test"'), 'Should have quoted about attribute');
      assertRender(result.html.includes('typeof="Thing"'), 'Should have quoted typeof attribute');

      // Validate no malformed attributes
      assertRender(!result.html.includes('about=ex:test'), 'Should not have unquoted attributes');
      assertRender(!result.html.includes('typeof=Thing'), 'Should not have unquoted attributes');
    }
  },

  {
    name: 'Complete HTML structure validation',
    fn: () => {
      const md = `[schema] <http://schema.org/>

# Article {=schema:article .Article}

# Review {=schema:review .Review}`;

      const result = render(md);

      // Validate complete HTML structure
      assertValidHTML(result.html);
      assertValidRDFa(result.html);

      // Validate proper nesting
      const openDivs = (result.html.match(/<div/g) || []).length;
      const closeDivs = (result.html.match(/<\/div>/g) || []).length;
      assertRender(openDivs === closeDivs, 'Should have balanced div tags');

      const openH1s = (result.html.match(/<h1/g) || []).length;
      const closeH1s = (result.html.match(/<\/h1>/g) || []).length;
      assertRender(openH1s === closeH1s, 'Should have balanced h1 tags');

      // Validate RDFa attributes are properly formatted
      assertRender(result.html.includes('about="schema:article"'), 'Should have proper about attribute');
      assertRender(result.html.includes('typeof="Article"'), 'Should have proper typeof attribute');
      assertRender(result.html.includes('about="schema:review"'), 'Should have second about attribute');
      assertRender(result.html.includes('typeof="Review"'), 'Should have second typeof attribute');

      // Validate content is properly escaped and placed
      assertRender(result.html.includes('>Article</h1>'), 'Should have article content');
      assertRender(result.html.includes('>Review</h1>'), 'Should have review content');

      // Validate schema prefix is properly declared
      assertRender(result.html.includes('schema: http://schema.org/'), 'Should include schema prefix');
    }
  }
];

// Run tests
console.log('Running render tests...');

renderTests.forEach(async (test, index) => {
  try {
    await test.fn();
    console.log(`✓ Test ${index + 1}: ${test.name}`);
  } catch (error) {
    console.error(`✗ Test ${index + 1}: ${test.name}`);
    console.error(`  Error: ${error.message}`);
    process.exit(1);
  }
});

console.log(`\n✅ All ${renderTests.length} render tests passed!`);
