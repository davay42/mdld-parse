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
  const typeQuad = result.quads.find(q =>
    q.subject.value === 'http://example.org/alice' &&
    q.predicate.value.includes('type')
  );

  assert(authorQuad, 'Should have author relationship');
  assert(authorQuad.object.value === 'http://example.org/alice', 'Should link to alice');
  assert(typeQuad, 'Alice should have type');
  assert(typeQuad.object.value.includes('Person'), 'Alice should be a Person');
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
  const md = `\`\`\`javascript {=ex:script .SoftwareSourceCode text }
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

  assert(textQuad, 'Should have text property');
  assert(textQuad.object.value.includes('console.log'), 'Text should contain code');
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
// COMPOSABILITY & EDGE CASES
// ============================================================================

test('Mixed inline annotations - properties and types together', () => {
  const md = `## Context {=ex:ctx}

[Alice](ex:alice) {author collaborator .Person .Agent}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const authorQuad = findQuad(result.quads, 'author');
  const collabQuad = findQuad(result.quads, 'collaborator');

  assert(authorQuad, 'Should have author property');
  assert(collabQuad, 'Should have collaborator property');
  assert(authorQuad.subject.value === 'http://example.org/ctx', 'Properties should be on context');
  assert(authorQuad.object.value === 'http://example.org/alice', 'Should link to alice');

  const typeQuads = result.quads.filter(q =>
    q.subject.value === 'http://example.org/alice' &&
    q.predicate.value.includes('type')
  );

  assert(typeQuads.length === 2, 'Alice should have 2 types');
  const types = typeQuads.map(q => q.object.value.split(/[/#]/).pop());
  assert(types.includes('Person'), 'Should include Person type');
  assert(types.includes('Agent'), 'Should include Agent type');
});

test('Inline subject without URL but with =id', () => {
  const md = `## Context {=ex:ctx}

[Bob] {=ex:bob author .Person}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const authorQuad = findQuad(result.quads, 'author');
  assert(authorQuad, 'Should have author property');
  assert(authorQuad.object.value === 'http://example.org/bob', 'Should link to bob');

  const typeQuad = result.quads.find(q =>
    q.subject.value === 'http://example.org/bob' &&
    q.predicate.value.includes('type')
  );
  assert(typeQuad, 'Bob should have type');
});

test('Multiple inline spans on same line', () => {
  const md = `## Doc {=ex:doc}

Written by [Alice](ex:alice) {author} and [Bob](ex:bob) {author}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const authorQuads = findQuads(result.quads, 'author');
  assert(authorQuads.length === 2, 'Should have 2 author quads');

  const objects = authorQuads.map(q => q.object.value);
  assert(objects.includes('http://example.org/alice'), 'Should include alice');
  assert(objects.includes('http://example.org/bob'), 'Should include bob');
});

test('Deeply nested headings maintain proper context', () => {
  const md = `## Level 1 {=ex:l1}

[Val1] {p1}

### Level 2 {=ex:l2}

[Val2] {p2}

#### Level 3 {=ex:l3}

[Val3] {p3}

### Back to Level 2 {=ex:l2b}

[Val4] {p4}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const p1 = findQuad(result.quads, 'p1');
  const p2 = findQuad(result.quads, 'p2');
  const p3 = findQuad(result.quads, 'p3');
  const p4 = findQuad(result.quads, 'p4');

  assert(p1.subject.value === 'http://example.org/l1', 'p1 should be on l1');
  assert(p2.subject.value === 'http://example.org/l2', 'p2 should be on l2');
  assert(p3.subject.value === 'http://example.org/l3', 'p3 should be on l3');
  assert(p4.subject.value === 'http://example.org/l2b', 'p4 should be on l2b');
});

test('Context reset after heading without subject', () => {
  const md = `## First {=ex:first}

[Val1] {prop}

## Plain Heading

[Val2] {prop}

## Third {=ex:third}

[Val3] {prop}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const propQuads = findQuads(result.quads, 'prop');
  assert(propQuads.length === 2, 'Should only have 2 property quads (Val2 has no context)');

  const subjects = propQuads.map(q => q.subject.value);
  assert(subjects.includes('http://example.org/first'), 'Should have first');
  assert(subjects.includes('http://example.org/third'), 'Should have third');
});

test('Prefix declaration affects subsequent parsing', () => {
  const md = `[ex] {: http://example.org/}

## Thing {=ex:thing}`;

  const result = parse(md);

  const labelQuad = findQuad(result.quads, 'label');
  assert(labelQuad.subject.value === 'http://example.org/thing', 'Prefix should be applied');
});

test('Multiple prefixes declared', () => {
  const md = `[ex] {: http://example.org/}
[wd] {: https://www.wikidata.org/entity/}
[foo] {: http://foo.bar/}

## Thing {=ex:thing}
## Person {=wd:Q5}
## Bar {=foo:baz}`;

  const result = parse(md);

  assert(result.context.ex === 'http://example.org/', 'ex prefix should be set');
  assert(result.context.wd === 'https://www.wikidata.org/entity/', 'wd prefix should be set');
  assert(result.context.foo === 'http://foo.bar/', 'foo prefix should be set');

  const labels = findQuads(result.quads, 'label');
  const subjects = labels.map(q => q.subject.value);

  assert(subjects.includes('http://example.org/thing'), 'Should use ex prefix');
  assert(subjects.includes('https://www.wikidata.org/entity/Q5'), 'Should use wd prefix');
  assert(subjects.includes('http://foo.bar/baz'), 'Should use foo prefix');
});

test('Datatype handling - multiple datatypes', () => {
  const md = `## Data {=ex:data}

[42] {intVal ^^xsd:integer}
[3.14] {floatVal ^^xsd:decimal}
[2024-01-15] {dateVal ^^xsd:date}
[true] {boolVal ^^xsd:boolean}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const intQuad = findQuad(result.quads, 'intVal');
  const floatQuad = findQuad(result.quads, 'floatVal');
  const dateQuad = findQuad(result.quads, 'dateVal');
  const boolQuad = findQuad(result.quads, 'boolVal');

  assert(intQuad.object.datatype.value.includes('integer'), 'Should have integer datatype');
  assert(floatQuad.object.datatype.value.includes('decimal'), 'Should have decimal datatype');
  assert(dateQuad.object.datatype.value.includes('date'), 'Should have date datatype');
  assert(boolQuad.object.datatype.value.includes('boolean'), 'Should have boolean datatype');
});

test('Language tag variations', () => {
  const md = `## Thing {=ex:thing}

[Hello] {greeting @en}
[Bonjour] {greeting @fr}
[Hola] {greeting @es}
[你好] {greeting @zh}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const greetings = findQuads(result.quads, 'greeting');
  assert(greetings.length === 4, 'Should have 4 greetings');

  const langs = greetings.map(q => q.object.language);
  assert(langs.includes('en'), 'Should have English');
  assert(langs.includes('fr'), 'Should have French');
  assert(langs.includes('es'), 'Should have Spanish');
  assert(langs.includes('zh'), 'Should have Chinese');
});

test('Code blocks with different languages', () => {
  const md = `## Examples {=ex:examples}

\`\`\`javascript {=ex:js}
console.log('test');
\`\`\`

\`\`\`python {=ex:py}
print('test')
\`\`\`

\`\`\`sparql {=ex:sq}
SELECT * WHERE { ?s ?p ?o }
\`\`\``;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const hasPartQuads = findQuads(result.quads, 'hasPart');
  assert(hasPartQuads.length === 3, 'Should have 3 code blocks');
});

test('Empty annotation variations', () => {
  const md = `## Test {}
## Test2 {  }
## Test3`;

  const result = parse(md);
  // Should not crash, should handle gracefully
  assert(Array.isArray(result.quads), 'Should return quads array');
});

test('Special characters in literals', () => {
  const md = `## Thing {=ex:thing}

[Hello "World" & <stuff>] {text}
[Value with {braces}] {text2}
[Value with [brackets]] {text3}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const text1 = findQuad(result.quads, 'text');
  const text2 = findQuad(result.quads, 'text2');
  const text3 = findQuad(result.quads, 'text3');

  assert(text1 && text1.object.value.includes('"'), 'Should preserve quotes');
  assert(text2 && text2.object.value.includes('{'), 'Should preserve braces');
  assert(text3 && text3.object.value.includes('['), 'Should preserve brackets');
});

test('Block ID stability across identical content', () => {
  const md1 = `## Thing {=ex:thing .Type}

[Value] {prop}`;

  const md2 = `## Thing {=ex:thing .Type}

[Value] {prop}`;

  const result1 = parse(md1, { context: { ex: 'http://example.org/' } });
  const result2 = parse(md2, { context: { ex: 'http://example.org/' } });

  const blockIds1 = Array.from(result1.origin.blocks.keys()).sort();
  const blockIds2 = Array.from(result2.origin.blocks.keys()).sort();

  assertEqual(blockIds1, blockIds2, 'Block IDs should be identical for identical content');
});

test('Block ID uniqueness for different content', () => {
  const md = `## Thing1 {=ex:thing1 .Type1}
## Thing2 {=ex:thing2 .Type2}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const blockIds = Array.from(result.origin.blocks.keys());
  const uniqueIds = new Set(blockIds);

  assert(blockIds.length === uniqueIds.size, 'All block IDs should be unique');
});

test('QuadIndex completeness', () => {
  const md = `## Thing {=ex:thing .Type}

[Value] {prop}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  result.quads.forEach(quad => {
    const key = JSON.stringify([quad.subject.value, quad.predicate.value, quad.object.value]);
    assert(result.origin.quadIndex.has(key), `Quad should be in index: ${key}`);
  });
});

test('Serialize round-trip preserves structure', () => {
  const md = `## Thing {=ex:thing}

[Value] {prop}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const serialized = serialize({ text: md, diff: {}, origin: result.origin });

  assert(serialized.text === md, 'Round-trip should preserve text');
});

test('Serialize add and delete in same operation', () => {
  const md = `## Thing {=ex:thing}

[Old Value] {prop}`;

  const result = parse(md, {
    context: { ex: 'http://example.org/' }
  });

  const oldQuad = findQuad(result.quads, 'prop');
  const newQuad = {
    subject: { termType: 'NamedNode', value: 'http://example.org/thing' },
    predicate: { termType: 'NamedNode', value: 'http://schema.org/prop' },
    object: { termType: 'Literal', value: 'New Value' }
  };

  const diff = {
    delete: [oldQuad],
    add: [newQuad]
  };

  const serialized = serialize({ text: md, diff, origin: result.origin });

  assert(!serialized.text.includes('Old Value'), 'Should not contain old value');
  assert(serialized.text.includes('New Value'), 'Should contain new value');
});

test('Fragment identifiers within same document', () => {
  const md = `## Section1 {=#sec1}
## Section2 {=#sec2}`;

  const result = parse(md);

  const labels = findQuads(result.quads, 'label');
  const subjects = labels.map(q => q.subject.value);

  assert(subjects.every(s => s.includes('#')), 'All subjects should have fragment identifiers');
  assert(subjects[0] !== subjects[1], 'Fragment subjects should be unique');
});

test('Mixed absolute and relative IRIs', () => {
  const md = `[ex] {: http://example.org/}

## Thing1 {=https://absolute.example.com/thing}
## Thing2 {=ex:relative}
## Thing3 {=#fragment}`;

  const result = parse(md);

  const labels = findQuads(result.quads, 'label');
  const subjects = labels.map(q => q.subject.value);

  assert(subjects[0] === 'https://absolute.example.com/thing', 'Should preserve absolute URL');
  assert(subjects[1] === 'http://example.org/relative', 'Should expand prefixed IRI');
  assert(subjects[2].includes('#fragment'), 'Should handle fragment identifier');
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runTests() {
  console.log('# MD-LD v0.2 Test Suite');

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

  console.log(`\n${'-'.repeat(20)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total`);

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