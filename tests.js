/**
 * MD-LD Parser Test Suite
 * 
 * Comprehensive tests for MD-LD specification compliance
 */

export const testDocuments = {
  minimal: {
    name: 'Minimal Markdown (no frontmatter)',
    markdown: `# Hello World

This is a simple document.`,
    expectedQuads: 2,
    checks: [
      { subject: '', predicate: 'title', object: 'Hello World' },
      { subject: '', predicate: 'description', object: 'This is a simple document.' }
    ]
  },

  basicFrontmatter: {
    name: 'Basic YAML-LD Frontmatter',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
'@type': Article
name: 'Test Article'
---

# Test Article`,
    expectedQuads: 2,
    checks: [
      { subject: '#doc', predicate: 'type', object: 'Article' },
      { subject: '#doc', predicate: 'title', object: 'Test Article' }
    ]
  },

  subjectDeclaration: {
    name: 'Subject Declaration with typeof',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
---

## Alice Johnson
{#alice typeof="Person"}

Alice is a developer.`,
    expectedQuads: 1,
    checks: [
      { subject: '#alice', predicate: 'type', object: 'Person' }
    ]
  },

  literalProperty: {
    name: 'Literal Property',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#alice'
---

# Alice

[Alice Johnson]{property="name"}`,
    expectedQuads: 2,
    checks: [
      { subject: '#alice', predicate: 'name', literal: 'Alice Johnson' }
    ]
  },

  objectProperty: {
    name: 'Object Property (rel)',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#alice'
---

# Alice

Works at [Tech Corp](#company){rel="worksFor"}`,
    expectedQuads: 2,
    checks: [
      { subject: '#alice', predicate: 'worksFor', object: '#company' }
    ]
  },

  typedLiteral: {
    name: 'Typed Literal with datatype',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
  xsd: 'http://www.w3.org/2001/XMLSchema#'
'@id': '#data'
---

# Data

Age: [30]{property="age" datatype="xsd:integer"}`,
    expectedQuads: 2,
    checks: [
      { subject: '#data', predicate: 'age', literal: '30', datatype: 'integer' }
    ]
  },

  multipleTypes: {
    name: 'Multiple Types',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
---

## Resource
{#res typeof="Person Organization"}`,
    expectedQuads: 2,
    checks: [
      { subject: '#res', predicate: 'type', object: 'Person' },
      { subject: '#res', predicate: 'type', object: 'Organization' }
    ]
  },

  taskList: {
    name: 'Task List to Actions',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
---

# Tasks

- [x] Complete review
- [ ] Submit paper`,
    expectedQuads: 8,
    checks: [
      { predicate: 'type', object: 'Action' },
      { predicate: 'actionStatus', object: 'CompletedActionStatus' },
      { predicate: 'actionStatus', object: 'PotentialActionStatus' }
    ]
  },

  nestedSubjects: {
    name: 'Nested Subject Declarations',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
---

## Company
{#company typeof="Organization"}

[Tech Corp]{property="name"}

### Employee
{#alice typeof="Person"}

[Alice]{property="name"}`,
    expectedQuads: 4,
    checks: [
      { subject: '#company', predicate: 'type', object: 'Organization' },
      { subject: '#company', predicate: 'name', literal: 'Tech Corp' },
      { subject: '#alice', predicate: 'type', object: 'Person' },
      { subject: '#alice', predicate: 'name', literal: 'Alice' }
    ]
  },

  blankNode: {
    name: 'Blank Node Creation',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#alice'
---

# Alice

Works at [Tech Corp]{rel="worksFor" typeof="Organization"}`,
    expectedQuads: 3,
    checks: [
      { subject: '#alice', predicate: 'worksFor' },
      { predicate: 'type', object: 'Organization' }
    ]
  },

  multiplePrefixes: {
    name: 'Multiple Prefix Contexts',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
  foaf: 'http://xmlns.com/foaf/0.1/'
  dct: 'http://purl.org/dc/terms/'
'@id': '#alice'
---

# Alice

[Alice Johnson]{property="foaf:name"}

[Developer]{property="dct:title"}`,
    expectedQuads: 3,
    checks: [
      { predicate: 'foaf:name', literal: 'Alice Johnson' },
      { predicate: 'dct:title', literal: 'Developer' }
    ]
  },

  descriptionFromParagraph: {
    name: 'Description from First Paragraph',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
'@type': Article
---

# My Article

This is the abstract of my article.

More content follows.`,
    expectedQuads: 3,
    checks: [
      { subject: '#doc', predicate: 'title', literal: 'My Article' },
      { subject: '#doc', predicate: 'description', literal: 'This is the abstract of my article.' }
    ]
  },

  semanticLinkList: {
    name: 'Semantic Links in Bullet List',
    markdown: `---
'@context':
  '@vocab': 'http://schema.org/'
'@id': '#doc'
---

- [What it is!](#what-is){rel="hasPart"}`,
    expectedQuads: 1,
    checks: [
      { subject: '#doc', predicate: 'hasPart', object: '#what-is' }
    ]
  }
};

// ============================================================================
// Test Runner
// ============================================================================

export async function runTests(options = {}) {
  const { silent = false, onResult = null } = options;

  let passed = 0;
  let failed = 0;
  const results = [];

  function log(...args) {
    if (!silent) console.log(...args);
  }

  function testQuads(quads, doc) {
    const checks = doc.checks || [];
    const failures = [];

    for (const check of checks) {
      let found = false;

      for (const quad of quads) {
        const subjectMatch = !check.subject ||
          quad.subject.value.includes(check.subject);

        const predicateMatch = !check.predicate ||
          quad.predicate.value.includes(check.predicate);

        const objectMatch = check.literal
          ? (quad.object.termType === 'Literal' &&
            quad.object.value === check.literal)
          : (!check.object || quad.object.value.includes(check.object));

        const datatypeMatch = !check.datatype ||
          (quad.object.datatype &&
            quad.object.datatype.value &&
            quad.object.datatype.value.includes(check.datatype));

        if (subjectMatch && predicateMatch && objectMatch && datatypeMatch) {
          found = true;
          break;
        }
      }

      if (!found) {
        failures.push(check);
      }
    }

    return { passed: failures.length === 0, failures };
  }

  log('\n🧪 MD-LD Parser Test Suite\n');

  for (const [key, doc] of Object.entries(testDocuments)) {
    let testPassed = false;
    let errorMsg = null;

    try {
      // Dynamic import for Node.js vs Browser
      let parseMDLD;
      if (typeof require !== 'undefined') {
        parseMDLD = require('./index.js').parseMDLD;
      } else {
        // In browser, assume it's already imported
        parseMDLD = window.parseMDLD || (await import('./index.js')).parseMDLD;
      }

      const quads = parseMDLD(doc.markdown, {
        baseIRI: 'http://example.org/doc'
      });

      const checkResult = testQuads(quads, doc);

      if (checkResult.passed) {
        testPassed = true;
        passed++;
        log(`✅ ${doc.name}`);
      } else {
        failed++;
        errorMsg = `Failed checks: ${JSON.stringify(checkResult.failures, null, 2)}`;
        log(`❌ ${doc.name}`);
        log(`   ${errorMsg}`);
      }

      results.push({
        name: doc.name,
        passed: testPassed,
        quads: quads.length,
        expected: doc.expectedQuads,
        error: errorMsg
      });

      if (onResult) {
        onResult({
          name: doc.name,
          passed: testPassed,
          error: errorMsg
        });
      }

    } catch (error) {
      failed++;
      testPassed = false;
      errorMsg = error.message;
      log(`❌ ${doc.name}`);
      log(`   Error: ${error.message}`);

      results.push({
        name: doc.name,
        passed: false,
        error: errorMsg
      });

      if (onResult) {
        onResult({
          name: doc.name,
          passed: false,
          error: errorMsg
        });
      }
    }
  }

  log(`\n📊 Results: ${passed} passed, ${failed} failed (${passed + failed} total)\n`);

  return {
    results: { passed, failed, total: passed + failed },
    testResults: results
  };
}

// Run tests if executed directly in Node.js
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}

export default { testDocuments, runTests };