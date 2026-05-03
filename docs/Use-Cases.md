# MD-LD Use Cases

Real-world applications and examples of MD-LD in action.

## Personal Knowledge Management

Create personal knowledge graphs with rich metadata and relationships.

### Journal Entries

```markdown
[alice] <tag:alice@example.com,2026:>

# Meeting Notes {=alice:meeting-2024-01-15 .alice:Meeting}

Attendees:

- **Alice** {+alice:alice ?alice:attendee label}
- **Bob** {+alice:bob ?alice:attendee label}

Action items:

- **Review proposal** {+alice:task-1 ?alice:actionItem label}
```

**Generated RDF:**
```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix alice: <tag:alice@example.com,2026:>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

alice:meeting-2024-01-15 a alice:Meeting;
    alice:attendee alice:alice, alice:bob;
    alice:actionItem alice:task-1.
alice:alice a alice:Person;
    rdfs:label "Alice".
alice:bob a alice:Person;
    rdfs:label "Bob".
alice:task-1 a alice:ActionItem;
    rdfs:label "Review proposal".
```

### Project Tracking

```markdown
[my] <tag:myproject@example.com,2026:>

# Project Alpha {=my:proj-alpha .my:Project}

Team members:

- **Alice** {+my:alice ?my:teamMember label}
- **Bob** {+my:bob ?my:teamMember label}

Tasks:

- **Design schema** {+my:task-design ?my:hasTask .my:Task label}
- **Implement parser** {+my:task-parser ?my:hasTask .my:Task label}
```

**Benefits:**
- **Rich relationships** - Model team structure and task dependencies
- **Temporal tracking** - Add dates and status to project items
- **Searchable** - Query across projects, tasks, and people

## Developer Documentation

Document APIs, schemas, and technical specifications with executable examples.

### API Endpoint Documentation

```markdown
# API Endpoint {=api:/users/:id .api:Endpoint}

[GET] {api:method}
[/users/:id] {api:path}

Example:

```bash {=api:/users/:id#example .api:CodeExample api:code}
curl https://api.example.com/users/123
```

**Features:**
- **Executable examples** - Code blocks with syntax highlighting
- **Parameter documentation** - Clear path and method specifications
- **Response examples** - Sample outputs and error handling

### Schema Documentation

```markdown
# User Schema {=schema:user .sh:NodeShape}

## Required Properties {=schema:user-required .sh:PropertyShape ?sh:property}
Name: [string] {+schema:name ?sh:path .sh:datatype xsd:string sh:minCount 1 sh:maxCount 1}
> User must have exactly one name {sh:message}

## Optional Properties {=schema:user-optional .sh:PropertyShape ?sh:property}
Email: [string] {+schema:email ?sh:path .sh:datatype xsd:string}
> Optional email address {sh:message}
```

**Advantages:**
- **Self-validating** - SHACL shapes validate the documentation itself
- **Interactive examples** - Code blocks can be executed directly
- **Version control** - Track schema evolution with polarity

## Academic Research

Model research papers, citations, and academic workflows with proper provenance.

### Paper Structure

```markdown
[alice] <tag:alice@example.com,2026:>

# Paper {=alice:paper-semantic-markdown .alice:ScholarlyArticle}

[Semantic Web] {label}
[Alice Johnson] {=alice:alice-johnson ?alice:author}
[2024-01] {alice:datePublished ^^xsd:gYear}

> This paper explores semantic markup in Markdown. {comment @en}

## Related Work {=alice:related .alice:Section}

### Previous Research {=alice:prev-research .alice:Work}
[Semantic Annotations] {label}
[2023] {alice:year ^^xsd:gYear}

### Future Directions {=alice:future-work .alice:Work}
[AI Integration] {label}
[2025] {alice:plannedYear ^^xsd:gYear}
```

**Generated RDF:**
```turtle
alice:paper-semantic-markdown a alice:ScholarlyArticle;
    rdfs:label "Semantic Web";
    alice:author alice:alice-johnson;
    alice:datePublished "2024"^^xsd:gYear;
    rdfs:comment "This paper explores semantic markup in Markdown."@en.
```

**Benefits:**
- **Proper citations** - Model academic relationships and citations
- **Provenance tracking** - Track paper evolution and contributions
- **Metadata standards** - Follow academic metadata schemas

## Content Management System

Manage websites, blogs, and content with structured metadata.

### Blog Post

```markdown
[blog] <https://myblog.example.com/>

# Understanding MD-LD {=blog:post-mdld .blog:Post}

## Introduction {=blog:intro .blog:Section}
[MD-LD] {blog:emphasized label} allows you to embed RDF directly in Markdown while maintaining readability.

## Features {=blog:features .blog:Section}

### Syntax {=blog:syntax .blog:Subsection}
[Explicit annotations] {blog:feature label} ensure deterministic parsing.

### Benefits {=blog:benefits .blog:Subsection}
[Zero dependencies] {blog:feature label}
[Streaming] {blog:feature label}

## Conclusion {=blog:conclusion .blog:Section}
[Get started] {blog:callToAction label} with the quick start guide.

## Metadata {=blog:metadata .blog:Section}
[Published] {blog:status label}
[2024-01-15] {blog:datePublished ^^xsd:date}
[5 min] {blog:readingTime label}
```

**SEO Benefits:**
- **Structured data** - Search engines understand content structure
- **Rich snippets** - Better search result presentation
- **Content relationships** - Model series, categories, and references

### Product Documentation

```markdown
[products] <https://products.example.com/>

# Smart Watch {=products:watch-200 .products:Product}

## Specifications {=products:specs .products:Section}

### Display {=products:display .products:Subsection}
[1.2" OLED] {products:screenSize label}
[Touchscreen] {products:interface label}

### Performance {=products:performance .products:Subsection}
[48 hours] {products:batteryLife label}
[Water resistant] {products:feature label}

## Compatibility {=products:compatibility .products:Section}

[iOS] {+products:ios ?products:compatibleWith label}
[Android] {+products:android ?products:compatibleWith label}

## Pricing {=products:pricing .products:Section}
[$299] {products:price label ^^xsd:decimal}
[Available] {products:availability label}
```

**E-commerce Integration:**
- **Product catalogs** - Structured product information
- **Inventory management** - Track stock and availability
- **Customer reviews** - Model opinions and ratings

## Data Integration

### Database Documentation

```markdown
[db] <https://database.example.com/>

# User Table {=db:users .db:Table}

## Schema {=db:schema .db:Section}

### Primary Key {=db:pk .db:Constraint}
[id] {db:column .db:Column label}
[integer] {db:type label}
[auto increment] {db:constraint label}

### Columns {=db:columns .db:Section}

[email] {db:column .db:Column label}
[string] {db:type label}
[unique] {db:constraint label}

[name] {db:column .db:Column label}
[string] {db:type label}
[required] {db:constraint label}

## Sample Data {=db:sample .db:Section}

### User Records {=db:sample .db:Subsection}
- **Alice** {+db:alice ?db:record .db:User email "alice@example.com"}
- **Bob** {+db:bob ?db:record .db:User email "bob@example.com"}
```

**Benefits:**
- **Data lineage** - Track data transformations and migrations
- **Schema evolution** - Document database changes over time
- **Query optimization** - Structure enables efficient queries

## Workflow Automation

### Business Process Modeling

```markdown
[process] <https://company.example.com/processes/>

# Invoice Processing {=process:invoice .process:Workflow}

## Steps {=process:steps .process:Section}

### Data Entry {=process:data-entry .process:Step}
[Enter invoice data] {process:task label}
[Validate format] {process:task label}

### Approval {=process:approval .process:Step}
[Manager review] {process:task label}
[Financial check] {process:task label}

### Payment Processing {=process:payment .process:Step}
[Generate payment] {process:task label}
[Send to accounting] {process:task label}

## Integration Points {=process:integration .process:Section}

[Accounting system] {+process:accounting ?process:integratesWith label}
[CRM system] {+process:crm ?process:integratesWith label}
```

**Workflow Benefits:**
- **Process transparency** - Clear steps and responsibilities
- **Integration points** - Model system connections
- **Audit trail** - Track process execution and outcomes

## Testing and Validation

### Test Case Documentation

```markdown
[test] <https://tests.example.com/>

# Parser Tests {=test:parser .test:TestSuite}

## Test Categories {=test:categories .test:Section}

### Syntax Tests {=test:syntax .test:Category}
[Valid annotations] {test:feature label}
[Error handling] {test:feature label}

### Performance Tests {=test:performance .test:Category}
[Large documents] {test:scenario label}
[Memory usage] {test:metric label}

### Integration Tests {=test:integration .test:Category}
[RDF library compatibility] {test:scenario label}
[Browser support] {test:scenario label}

## Test Results {=test:results .test:Section}

### Latest Run {=test:latest .test:Run}
[105 passed] {test:metric label}
[0 failed] {test:metric label}
[2.3s] {test:metric label}

## Coverage {=test:coverage .test:Section}
[Syntax parsing] {test:area covered}
[Context management] {test:area covered}
[Polarity system] {test:area covered}
```

**Quality Assurance:**
- **Comprehensive coverage** - Test all functionality
- **Automated validation** - Self-checking test cases
- **Continuous integration** - Automated test execution

## Best Practices

### Document Structure

1. **Start with prefixes** - Define all namespaces at the top
2. **Use consistent subjects** - Logical document organization
3. **Add rich metadata** - Types, dates, and relationships
4. **Include examples** - Demonstrate usage patterns

### Content Guidelines

1. **Be explicit** - No implicit semantics or guessing
2. **Use proper types** - Choose appropriate datatypes
3. **Maintain context** - Keep related information together
4. **Document changes** - Use polarity for version control

### Technical Guidelines

1. **Validate RDF** - Ensure generated triples are valid
2. **Test round-trips** - Verify parse/generate cycles
3. **Monitor performance** - Check parsing times and memory usage
4. **Handle errors** - Graceful error recovery and reporting
