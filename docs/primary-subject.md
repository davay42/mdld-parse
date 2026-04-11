# Primary Subject Example

This example demonstrates the Primary Subject feature in MD-LD, which identifies the main entity described by a document.

## What is a Primary Subject?

The Primary Subject is the first non-fragment subject declaration (`{=IRI}`) in a document. It provides a deterministic way to identify the central focus of a document.

## Example Document

```markdown
[ex] <http://example.org/>

# Article {=ex:article .schema:Article label}
[Understanding Primary Subjects] {schema:headline}

## Author {=ex:author .schema:Person}
[Alice Smith] {schema:name}
[alice@example.com] {schema:email}

## Abstract
This article explains the Primary Subject concept in MD-LD, which allows applications to quickly identify the main entity described by a document.
```

## Parsing with Primary Subject

```javascript
import { parse } from 'mdld-parse';

const md = `[ex] <http://example.org/>

# Article {=ex:article .schema:Article label}
[Understanding Primary Subjects] {schema:headline}`;

const result = parse(md, { context: { ex: 'http://example.org/', schema: 'http://schema.org/' } });

console.log(result.primarySubject);
// Output: http://example.org/article
```

## Key Behaviors

### 1. First Non-Fragment Subject Wins

```markdown
{=#summary}  // Fragment - NOT primary
[Summary] {label}

# Document {=ex:doc}  // First non-fragment - PRIMARY
[Alice] {author}
```

Primary subject: `ex:doc`

### 2. Reset Does Not Clear Primary Subject

```markdown
# First {=ex:first}
[Value] {label}

# Reset {=}  // Does not clear primary subject

# Second {=ex:second}
[Value] {label}
```

Primary subject: `ex:first` (fixed once detected)

### 3. No Subject Means No Primary

```markdown
[Just text] {label}
```

Primary subject: `null`

## Merge with Primary Subjects

When merging multiple documents, the `merge()` function returns an array of all primary subjects in merge order:

```javascript
import { merge } from 'mdld-parse';

const doc1 = `[ex] <http://example.org/>
# Document 1 {=ex:doc1}
[Content] {label}`;

const doc2 = `[ex] <http://example.org/>
# Document 2 {=ex:doc2}
[Content] {label}`;

const result = merge([doc1, doc2], { context: { ex: 'http://example.org/' } });

console.log(result.primarySubjects.map(s => s.value));
// Output: ['http://example.org/doc1', 'http://example.org/doc2']
```

## Use Cases

- **Document Identification** - Quickly determine what a document is about
- **Merge Tracking** - Track which entities are being merged across documents
- **UI Navigation** - Provide a default focus point for document viewers
- **Query Optimization** - Use primary subject as default query context

## Complete Example

```javascript
import { parse, merge } from 'mdld-parse';

// Single document
const doc1 = `[blog] <https://example.com/blog/>
# My First Post {=blog:post1 .schema:BlogPosting label}
[Hello World] {schema:headline}`;

const result1 = parse(doc1, { context: { blog: 'https://example.com/blog/', schema: 'http://schema.org/' } });
console.log('Primary subject:', result1.primarySubject);
// Output: https://example.com/blog/post1

// Multiple documents
const doc2 = `[blog] <https://example.com/blog/>
# My Second Post {=blog:post2 .schema:BlogPosting label}
[Hello Again] {schema:headline}`;

const merged = merge([doc1, doc2], { context: { blog: 'https://example.com/blog/', schema: 'http://schema.org/' } });

console.log('Primary subjects:', merged.primarySubjects);
// Output: ['https://example.com/blog/post1', 'https://example.com/blog/post2']
```

## Specification

For complete details on Primary Subject semantics, see the [MD-LD Specification](../spec/Spec.md#17-primary-subject).
