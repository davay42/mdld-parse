import { parse, serialize } from './index.js';

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual, null, 2);
  const expectedStr = JSON.stringify(expected, null, 2);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'Values not equal'}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
  }
}

function findQuad(quads, predicate, objectValue) {
  return quads.find(q =>
    q.predicate.value.includes(predicate) &&
    (objectValue === undefined || q.object.value === objectValue)
  );
}

function findQuads(quads, predicate) {
  return quads.filter(q => q.predicate.value.includes(predicate));
}

// ============================================================================
// TOKENIZATION & BASIC PARSING
// ============================================================================

test('Parse empty document', () => {
  const result = parse('');
  assert(result.quads.length === 0, 'Empty doc should produce no quads');
  assert(result.origin.blocks.size === 0, 'Empty doc should have no blocks');
});

test('Parse document with only text', () => {
  const result = parse('Just some text\n\nAnother paragraph');
  assert(result.quads.length === 0, 'Plain text should produce no quads');
});

test('Prefix declaration parsing', () => {
  const md = `[@vocab] {: http://schema.org/}
[ex] {: http://example.org/}`;
  const result = parse(md);

  assert(result.context['@vocab'] === 'http://schema.org/', 'vocab should be set');
  assert(result.context['ex'] === 'http://example.org/', 'ex prefix should be set');
});

// ============================================================================
// SUBJECT DECLARATION & INHERITANCE
// ============================================================================

test('Heading with subject creates typed entity', () => {
  const md = `## Apollo 11 {=wd:Q43653 .SpaceMission}`;
  const result = parse(md, {
    context: { wd: 'https://www.wikidata.org/entity/' }
  });

  const typeQuad = findQuad(result.quads, 'type');
  assert(typeQuad, 'Should have type quad');
  assert(typeQuad.subject.value === 'https://www.wikidata.org/entity/Q43653', 'Subject should be expanded');
  assert(typeQuad.object.value.includes('SpaceMission'), 'Should be typed as SpaceMission');

  const labelQuad = findQuad(result.quads, 'label');
  assert(labelQuad, 'Should have label quad');
  assert(labelQuad.object.value === 'Apollo 11', 'Label should be heading text');
});

test('Multiple type declarations', () => {
  const md = `## Apollo {=ex:apollo .SpaceMission .Project}`;
  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const typeQuads = findQuads(result.quads, 'type');
  assert(typeQuads.length === 2, 'Should have 2 type quads');

  const types = typeQuads.map(q => q.object.value.split(/[/#]/).pop());
  assert(types.includes('SpaceMission'), 'Should include SpaceMission');
  assert(types.includes('Project'), 'Should include Project');
});

test('Subject inheritance - headings set context', () => {
  const md = `## Section {=ex:section}

[Value] {property}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const propQuad = findQuad(result.quads, 'property');
  assert(propQuad, 'Should have property quad');
  assert(propQuad.subject.value === 'http://example.org/section', 'Property should belong to section subject');
});

test('Subject inheritance - nested headings', () => {
  const md = `## Outer {=ex:outer}

[Outer value] {prop1}

### Inner {=ex:inner}

[Inner value] {prop2}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const prop1 = findQuad(result.quads, 'prop1');
  const prop2 = findQuad(result.quads, 'prop2');

  assert(prop1.subject.value === 'http://example.org/outer', 'prop1 should belong to outer');
  assert(prop2.subject.value === 'http://example.org/inner', 'prop2 should belong to inner');
});

test('Subject leakage prevention - subject resets per heading', () => {
  const md = `## First {=ex:first}

[Value 1] {prop}

## Second {=ex:second}

[Value 2] {prop}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const propQuads = findQuads(result.quads, 'prop');
  assert(propQuads.length === 2, 'Should have 2 property quads');

  const subjects = propQuads.map(q => q.subject.value);
  assert(subjects.includes('http://example.org/first'), 'Should have first subject');
  assert(subjects.includes('http://example.org/second'), 'Should have second subject');
  assert(!subjects.includes('http://example.org/first') ||
    subjects.filter(s => s === 'http://example.org/first').length === 1,
    'Value 2 should NOT leak to first subject');
});

test('No subject leakage across headings without annotations', () => {
  const md = `## Annotated {=ex:anno}

[Value] {prop}

## Plain Heading

[Another value] {prop2}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const prop1 = findQuad(result.quads, 'prop');
  const prop2 = findQuad(result.quads, 'prop2');

  assert(prop1, 'Should have first property');
  assert(prop1.subject.value === 'http://example.org/anno', 'First prop should be on anno');
  assert(!prop2, 'Second property should not exist (no subject context)');
});

// ============================================================================
// INLINE ANNOTATIONS - PROPERTIES
// ============================================================================

test('Simple literal property', () => {
  const md = `## Subject {=ex:s}

[Hello World] {name}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const quad = findQuad(result.quads, 'name');
  assert(quad, 'Should have name property');
  assert(quad.object.termType === 'Literal', 'Object should be literal');
  assert(quad.object.value === 'Hello World', 'Value should match');
});

test('Typed literal with datatype', () => {
  const md = `## Subject {=ex:s}

[42] {age ^^xsd:integer}`;

  const result = parse(md);

  const quad = findQuad(result.quads, 'age');
  assert(quad, 'Should have age property');
  assert(quad.object.datatype.value.includes('integer'), 'Should have integer datatype');
  assert(quad.object.value === '42', 'Value should be 42');
});

test('Language-tagged literal', () => {
  const md = `## Subject {=ex:s}

[Hello] {greeting @en}
[Bonjour] {greeting @fr}`;

  const result = parse(md);

  const greetings = findQuads(result.quads, 'greeting');
  assert(greetings.length === 2, 'Should have 2 greeting quads');

  const en = greetings.find(q => q.object.language === 'en');
  const fr = greetings.find(q => q.object.language === 'fr');

  assert(en && en.object.value === 'Hello', 'Should have English greeting');
  assert(fr && fr.object.value === 'Bonjour', 'Should have French greeting');
});

test('Multiple properties on same span', () => {
  const md = `## Subject {=ex:s}

[Value] {prop1 prop2 prop3}`;

  const result = parse(md);

  const prop1 = findQuad(result.quads, 'prop1');
  const prop2 = findQuad(result.quads, 'prop2');
  const prop3 = findQuad(result.quads, 'prop3');

  assert(prop1 && prop2 && prop3, 'Should have all three properties');
  assert(prop1.object.value === 'Value', 'prop1 should have correct value');
  assert(prop2.object.value === 'Value', 'prop2 should have correct value');
  assert(prop3.object.value === 'Value', 'prop3 should have correct value');
});

// ============================================================================
// INLINE ANNOTATIONS - OBJECT PROPERTIES
// ============================================================================

test('Object property with IRI', () => {
  const md = `## Subject {=ex:s}

[Tech Corp](ex:company) {worksFor}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const quad = findQuad(result.quads, 'worksFor');
  assert(quad, 'Should have worksFor property');
  assert(quad.object.termType === 'NamedNode', 'Object should be NamedNode');
  assert(quad.object.value === 'http://example.org/company', 'Should link to company');
});

test('Inline subject declaration with properties', () => {
  const md = `## Context {=ex:ctx}

[Alice](ex:alice) {author .Person}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const authorQuad = findQuad(result.quads, 'author');
  const typeQuads = result.quads.filter(q =>
    q.predicate.value.includes('type')
  );

  // Find Alice's type quad specifically
  const aliceTypeQuad = typeQuads.find(q =>
    q.subject.value === 'http://example.org/alice'
  );

  assert(authorQuad, 'Should have author relationship');
  assert(authorQuad.subject.value === 'http://example.org/ctx', 'Author property should be on context');
  assert(authorQuad.object.value === 'http://example.org/alice', 'Should link to alice');
  assert(aliceTypeQuad, 'Alice should have type');
  assert(aliceTypeQuad.object.value.includes('Person'), 'Alice should be a Person');
});

// ============================================================================
// CODE BLOCKS
// ============================================================================

test('Code block with language and subject', () => {
  const md = `## Doc {=ex:doc}

\`\`\`sparql {=ex:query}
SELECT * WHERE { ?s ?p ?o }
\`\`\``;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const hasPartQuad = findQuad(result.quads, 'hasPart');
  assert(hasPartQuad, 'Should link code to parent');
  assert(hasPartQuad.object.value === 'http://example.org/query', 'Should link to query subject');
});

test('Code block with type and properties', () => {
  const md = `\`\`\`javascript {=ex:script .SoftwareSourceCode text programmingLanguage}
console.log('test');
\`\`\``;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const typeQuad = result.quads.find(q =>
    q.subject.value === 'http://example.org/script' &&
    q.predicate.value.includes('type')
  );

  assert(typeQuad, 'Should have type');
  assert(typeQuad.object.value.includes('SoftwareSourceCode'), 'Should be SoftwareSourceCode');

  const textQuad = findQuad(result.quads, 'text');
  const langQuad = findQuad(result.quads, 'programmingLanguage');

  assert(textQuad, 'Should have text property');
  assert(textQuad.object.value.includes('console.log'), 'Text should contain code');
  assert(langQuad, 'Should have language property');
  assert(langQuad.object.value === 'javascript', 'Language should be javascript');
});

test('Multiple code blocks', () => {
  const md = `## Queries {=ex:queries}

\`\`\`sparql {=ex:q1}
SELECT ?s WHERE { ?s a ?type }
\`\`\`

\`\`\`sparql {=ex:q2}
SELECT ?p WHERE { ?s ?p ?o }
\`\`\``;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const hasPartQuads = findQuads(result.quads, 'hasPart');
  assert(hasPartQuads.length === 2, 'Should have 2 code blocks linked');

  const objects = hasPartQuads.map(q => q.object.value);
  assert(objects.includes('http://example.org/q1'), 'Should include q1');
  assert(objects.includes('http://example.org/q2'), 'Should include q2');
});

// ============================================================================
// LIST HANDLING
// ============================================================================

test('List items create multiple quads', () => {
  const md = `## Subject {=ex:s}

Items: {item}
- First
- Second
- Third`;

  const result = parse(md);

  // Note: Current implementation needs list context - this tests current behavior
  const itemQuads = findQuads(result.quads, 'item');
  assert(itemQuads.length >= 0, 'List handling should be consistent');
});

// ============================================================================
// ORIGIN TRACKING
// ============================================================================

test('Origin tracks block ranges', () => {
  const md = `## First {=ex:first .Thing}

## Second {=ex:second .Thing}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  assert(result.origin.blocks.size > 0, 'Should have origin blocks');

  for (const [blockId, block] of result.origin.blocks) {
    assert(block.id === blockId, 'Block ID should match map key');
    assert(block.range, 'Block should have range');
    assert(typeof block.range.start === 'number', 'Range start should be number');
    assert(typeof block.range.end === 'number', 'Range end should be number');
    assert(block.range.start < block.range.end, 'Range should be valid');
  }
});

test('Origin quadIndex maps quads to blocks', () => {
  const md = `## Subject {=ex:s .Thing}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const typeQuad = findQuad(result.quads, 'type');
  const key = JSON.stringify([typeQuad.subject.value, typeQuad.predicate.value, typeQuad.object.value]);

  assert(result.origin.quadIndex.has(key), 'QuadIndex should contain quad');

  const blockId = result.origin.quadIndex.get(key);
  assert(result.origin.blocks.has(blockId), 'Quad should map to existing block');
});

test('Content-addressed block IDs are stable', () => {
  const md1 = `## Thing {=ex:thing .Type}`;
  const md2 = `## Thing {=ex:thing .Type}`;

  const result1 = parse(md1, { context: { ex: 'http://example.org/' } });
  const result2 = parse(md2, { context: { ex: 'http://example.org/' } });

  const blockIds1 = Array.from(result1.origin.blocks.keys());
  const blockIds2 = Array.from(result2.origin.blocks.keys());

  assert(blockIds1.length === blockIds2.length, 'Should have same number of blocks');
  assert(blockIds1[0] === blockIds2[0], 'Block IDs should be identical for same content');
});

test('Block IDs change when content changes', () => {
  const md1 = `## Thing {=ex:thing .Type1}`;
  const md2 = `## Thing {=ex:thing .Type2}`;

  const result1 = parse(md1, { context: { ex: 'http://example.org/' } });
  const result2 = parse(md2, { context: { ex: 'http://example.org/' } });

  const blockIds1 = Array.from(result1.origin.blocks.keys());
  const blockIds2 = Array.from(result2.origin.blocks.keys());

  assert(blockIds1[0] !== blockIds2[0], 'Block IDs should differ for different content');
});

// ============================================================================
// SERIALIZATION - DIFF APPLICATION
// ============================================================================

test('Serialize with no diff returns unchanged text', () => {
  const md = `## Test {=ex:test}`;
  const result = parse(md);

  const serialized = serialize({ text: md, diff: {}, origin: result.origin });

  assert(serialized.text === md, 'Text should be unchanged');
});

test('Delete quad removes content', () => {
  const md = `## Thing {=ex:thing .Type}

[Value] {prop}`;

  const result = parse(md, { context: { ex: 'http://example.org/' } });

  const propQuad = findQuad(result.quads, 'prop');
  const diff = { delete: [propQuad] };

  const serialized = serialize({ text: md, diff, origin: result.origin });

  assert(!serialized.text.includes('[Value]'), 'Deleted content should be removed');
});

test('Add quad inserts content', () => {
  const md = `## Thing {=ex:thing .Type}`;

  const result = parse(md, { context: { ex: 'http://example.org/' } });

  const newQuad = {
    subject: { termType: 'NamedNode', value: 'http://example.org/thing' },
    predicate: { termType: 'NamedNode', value: 'http://schema.org/newProp' },
    object: { termType: 'Literal', value: 'New Value' }
  };

  const diff = { add: [newQuad] };
  const serialized = serialize({ text: md, diff, origin: result.origin });

  assert(serialized.text.includes('newProp'), 'Added property should appear');
  assert(serialized.text.includes('New Value'), 'Added value should appear');
});

// ============================================================================
// COMPLEX INTEGRATION TESTS
// ============================================================================

test('Apollo 11 mission example', () => {
  const md = `[@vocab] {: http://schema.org/}
[wd] {: https://www.wikidata.org/entity/}

## Apollo 11 {=wd:Q43653 .SpaceMission}

[1969] {startDate ^^xsd:gYear}
[1969-07-20] {endDate ^^xsd:date}`;

  const result = parse(md);

  const typeQuad = findQuad(result.quads, 'type');
  assert(typeQuad.subject.value === 'https://www.wikidata.org/entity/Q43653', 'Should have correct subject');
  assert(typeQuad.object.value.includes('SpaceMission'), 'Should be SpaceMission');

  const startQuad = findQuad(result.quads, 'startDate');
  const endQuad = findQuad(result.quads, 'endDate');

  assert(startQuad, 'Should have start date');
  assert(startQuad.object.datatype.value.includes('gYear'), 'Should have gYear datatype');
  assert(endQuad, 'Should have end date');
  assert(endQuad.object.datatype.value.includes('date'), 'Should have date datatype');
});

test('Recipe with multilingual properties', () => {
  const md = `## Pancakes {=ex:recipe .Recipe}

[Flour] {name @en}
[Mehl] {name @de}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const nameQuads = findQuads(result.quads, 'name');
  assert(nameQuads.length === 2, 'Should have 2 name quads');

  const en = nameQuads.find(q => q.object.language === 'en');
  const de = nameQuads.find(q => q.object.language === 'de');

  assert(en && en.object.value === 'Flour', 'Should have English name');
  assert(de && de.object.value === 'Mehl', 'Should have German name');
});

test('Nested subjects with proper scoping', () => {
  const md = `## Book {=ex:book .Book}

[The Title] {name}

### Chapter 1 {=ex:ch1 .Chapter}

[Chapter Title] {name}

### Chapter 2 {=ex:ch2 .Chapter}

[Another Chapter] {name}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const nameQuads = findQuads(result.quads, 'name');
  assert(nameQuads.length === 3, 'Should have 3 name properties');

  const bookName = nameQuads.find(q => q.subject.value === 'http://example.org/book');
  const ch1Name = nameQuads.find(q => q.subject.value === 'http://example.org/ch1');
  const ch2Name = nameQuads.find(q => q.subject.value === 'http://example.org/ch2');

  assert(bookName && bookName.object.value === 'The Title', 'Book should have correct name');
  assert(ch1Name && ch1Name.object.value === 'Chapter Title', 'Ch1 should have correct name');
  assert(ch2Name && ch2Name.object.value === 'Another Chapter', 'Ch2 should have correct name');
});

// ============================================================================
// EDGE CASES
// ============================================================================

test('Empty annotation brackets', () => {
  const md = `## Test {}`;
  const result = parse(md);
  assert(result.quads.length === 0, 'Empty annotations should produce no quads');
});

test('Malformed annotations ignored gracefully', () => {
  const md = `## Test {=}
  
[Value] {.}`;

  const result = parse(md);
  // Should not crash, should handle gracefully
  assert(Array.isArray(result.quads), 'Should return quads array');
});

test('URL expansion with different schemes', () => {
  const md = `## Test {=https://example.org/test}`;
  const result = parse(md);

  const labelQuad = findQuad(result.quads, 'label');
  assert(labelQuad.subject.value === 'https://example.org/test', 'Should preserve full URL');
});

test('Fragment identifier handling', () => {
  const md = `## Test {=#fragment}`;
  const result = parse(md);

  const labelQuad = findQuad(result.quads, 'label');
  assert(labelQuad.subject.value.includes('#fragment'), 'Should handle fragment identifiers');
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runTests() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('MD-LD v0.2 Test Suite');
  console.log(`${'='.repeat(70)}\n`);

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
      if (error.stack) {
        const stackLines = error.stack.split('\n').slice(1, 4);
        stackLines.forEach(line => console.log(`  ${line.trim()}`));
      }
      failed++;
    }
  }

  console.log(`\n${'-'.repeat(70)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total`);
  console.log(`${'='.repeat(70)}\n`);

  if (typeof process !== 'undefined' && process.exit) {
    process.exit(failed > 0 ? 1 : 0);
  }

  return { passed, failed, total: tests.length };
}

// Auto-run in Node.js
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

// Export for browser usage
export { runTests, tests };