# MD-LD — Core Specification

**Markdown-Linked Data**

A deterministic, streaming-friendly semantic annotation layer for CommonMark Markdown that emits RDF quads **only** from explicit `{...}` annotations.

---

## 1. What MD-LD Guarantees

MD-LD follows these strict rules to make it predictable and reliable:

1. **Markdown stays valid** - If you remove all `{...}` blocks, you get perfectly normal Markdown
2. **No hidden meanings** - MD-LD never guesses what you meant. Everything must be explicit. RDFS vocabulary is used by default.
3. **Every fact comes from `{...}`** - All RDF data comes directly from your annotations
4. **One-pass processing** - MD-LD can read your document from start to finish just once
5. **No blank nodes** - Every entity has a proper identifier
6. **No guessing games** - MD-LD doesn't infer or assume anything from structure
7. **Traceable origins** - Every fact can be traced back to exactly where you wrote it

These rules make MD-LD **deterministic** - the same input always produces the same output.

---

## 2. How MD-LD Creates Data

MD-LD turns your annotations into **facts** about things. Think of it like creating sentences:

**Subject → Predicate → Object**

For example:
- "Apollo 11 → has name → "Apollo 11""
- "Apollo 11 → is a → Space Mission"
- "Apollo 11 → launched in → 1969"

### The Building Blocks

MD-LD uses two types of things:

1. **IRIs** - Unique identifiers for entities (like web addresses)
   - `http://schema.org/Person` - the concept of "Person"
   - `https://www.wikidata.org/entity/Q43653` - Apollo 11 mission
   - `urn:isbn:0060831014` - A book global identifier
   - `tag:alice@example.com,2026:doc` - A local tag

2. **Literals** - Actual data values (text, numbers, dates)
   - "Apollo 11" (text)
   - 1969 (number)
   - "1969"^^xsd:gYear (typed date)

### The Rules

- **IRIs** can be subjects or objects - they can point to things or be pointed at
- **Literals** are always objects - they can only be pointed at (never subjects)
- Every fact connects exactly two things through a predicate

This creates a **graph** - a network of connected facts that computers can process.

---

## 3. What's Available When You Write `{...}`

When you add a `{...}` annotation, MD-LD knows about three things:

### **S - The Current Subject** (What we're talking about)
- This is the main entity we're describing
- Set by `{=IRI}` or `{=#fragment}` 
- Stays current until you change it or reset with `{=}`

**Example:**
```md
[nasa] <https://nasa.gov/>
# Apollo 11 {=wd:Q43653 .nasa:Mission label}  ← Sets S to Apollo 11
[1969] {nasa:launchYear}       ← S is still Apollo 11
```

### **O - The Object Resource** (What we're linking to)
- Comes from links, images, or `{=IRI}`/`{+IRI}` inside the annotation
- Only available when you explicitly provide it

**Examples:**
```md
[nasa] <https://nasa.gov>

# NASA {=nasa:orgranization .nasa:class:Organization label}

Is operating in **USA** {+nasa:usa ?nasa:countryOfOrigin}
<https://nasa.gov> {?seeAlso}
[NASA website](https://nasa.gov) {?website .Website label}
![NASA Logo](https://nasa.gov/logo.png) {?logo .Image label}

```

### **L - The Literal Value** (The actual text)
- The text content of what you're annotating
- Can have datatypes (`^^xsd:gYear`) or languages (`@en`)

**Example:**
```md
[Successful] {status} ← L = "Successful"
[1969] {launchYear ^^xsd:gYear}      ← L = "1969"^^xsg:gYear
[July 20] {launchDate @en} ← L = "July 20"@en
```

These three pieces let MD-LD create the right facts from your annotations.

---

## 4. What Can Carry Annotations

A `{...}` block can attach to exactly one **value carrier** - the piece of Markdown that provides the literal value.

### Inline Elements (text-level)

| Markdown | What it captures | Example |
|----------|------------------|---------|
| `[text] {...}` | Link text | `[Apollo 11] {label}` |
| `*text* {...}` | Italic text | `*important* {emphasis}` |
| `_text_ {...}` | Italic text | `_important_ {emphasis}` |
| `**text** {...}` | Bold text | `**warning** {alert}` |
| `__text__ {...}` | Bold text | `__warning__ {alert}` |
| `` `text` {...}` | Code text | `` `console.log()` {code}`` |

### Block Elements (structure-level)

| Markdown | What it captures | Example |
|----------|------------------|---------|
| `# Heading {...}` | Heading text | `# Apollo 11 {=ex:mission .Mission name}` |
| `- item {...}` | List item text | `- Neil Armstrong {=ex:person .Person name}` |
| `> quote {...}` | Quote text | `> "One small step" {comment}` |
| ````lang {...}`` | Code block content | ````js {=ex:code .schema:SoftwareSourceCode}` |

### Links and Media (with URLs)

| Markdown | What it captures | Literal behavior | Type behavior |
|----------|------------------|------------------|---------------|
| `<URL> {...}` | The URL itself | No literals (ignored) | URL becomes subject |
| `[label](URL) {...}` | Label text + URL | Uses label as literal | URL becomes subject |
| `![alt](URL) {...}` | Alt text + URL | Uses alt as literal | URL becomes subject |

**Examples:**
- `<https://nasa.gov> {?website}` → current subject → website → URL
- `[NASA](https://nasa.gov) {label}` → URL → rdfs:label → "NASA"  
- `[NASA](https://nasa.gov) {.schema:Organization}` → URL → rdf:type → schema:Organization
- `![Photo](photo.jpg) {caption}` → URL → caption → "Photo"

URLs when used as IRIs have `{+IRI}` **soft subject** behavior - properties in the annotation are applied to the URL, but current subject is not changed.

### URL vs IRI Priority

When both a markdown link URL and an explicit IRI (`{=IRI}` or `{+IRI}`) are present in the same annotation, explicit IRIs take priority according to these rules:

**Priority Rules:**
1. **Type declarations**: Explicit subject (`{=IRI}`) > Soft object (`{+IRI}`) > URL > Current subject
2. **Literal predicates** (`p`): Explicit subject (`{=IRI}`) > Current subject, URL only when no explicit subject
3. **Object predicates** (`?p`): Current subject → Explicit object (`{+IRI}`) or URL
4. **Reverse predicates** (`!p`): Explicit object (`{+IRI}`) or URL → Current subject

**Examples:**
```md
# Case 1: Explicit subject overrides URL
[Link](https://example.com) {=ex:subject .Type label}
# Results: ex:subject → rdf:type → Type, ex:subject → rdfs:label → "Link"

# Case 2: Soft object with URL present  
[Link](https://example.com) {+ex:object ?predicate}
# Results: currentSubject → predicate → ex:object (URL ignored)

# Case 3: Mixed predicates
[Link](https://example.com) {=ex:subject label ?object}
# Results: ex:subject → label → "Link", currentSubject → object → ex:subject

# Case 4: No explicit subject (backward compatibility)
[Link](https://example.com) {.Type label}
# Results: URL → rdf:type → Type, URL → rdfs:label → "Link"
```

**Key Principles:**
- Explicit IRIs (`{=IRI}`, `{+IRI}`) override URL-based subjects when present
- URLs become purely navigational when explicit IRIs are present
- Link text remains available as literal value for predicates
- Backward compatibility maintained for existing documents
- Round-trip safety through predictable priority rules

**Key Rules:**
- Type declarations use URL as subject (soft subject behavior) when no explicit IRI is present
- Object predicates use current subject as subject
- Reverse predicates use URL as subject
- Link text is treated as a value carrier for the literal value
- Images work the same way but use alt text for literals

**Example:**
```md
[Berlin](https://en.wikipedia.org/wiki/Berlin) {.Place label ?mentions}
```
Generates:
- `https://en.wikipedia.org/wiki/Berlin` → `rdf:type` → `Place`
- `https://en.wikipedia.org/wiki/Berlin` → `rdfs:label` → `"Berlin"`
- `currentSubject` → `mentions` → `https://en.wikipedia.org/wiki/Berlin`

### What CAN'T Carry Annotations

- Plain paragraphs without inline formatting
- Bare URLs without angle brackets and `{...}` (use `<URL> {...}` instead)
- Text that's not in one of the formats above
- Multiple elements at once (one `{...}` per carrier)

**Key Rule:** The `{...}` block must come **immediately after** the value carrier.

---

## 5. How `{...}` Blocks Attach

A `{...}` block needs to know what it's describing. MD-LD follows simple rules to figure this out.

### The Attachment Rules

1. **Attach to the nearest value carrier** - The `{...}` grabs the closest thing that can carry it
2. **Or stand alone** - If on its own line, it applies to the current subject or the next list.

### Rule 1: Attach to Nearest Inline Carrier

```md
[Apollo 11] {label} was launched in [1969] {nasa:launchYear}.
```

- `{label}` attaches to `[Apollo 11]` → L = "Apollo 11"
- `{nasa:launchYear}` attaches to `[1969]` → L = "1969"

### Rule 2: Attach to block-level Value Carrier

```md
# Apollo 11 Mission {=ex:apollo11 .Mission label}
```

- `{=ex:apollo11 .Mission label}` is attached to the heading block
- Sets the current subject to `ex:apollo11`
- Declares it's a `.Mission`
- Gets its `rdfs:label` as `Apollo 11 Mission`

### Rule 3: Stand Alone for Lists

```md
Crew members: {?crew .Person name}
- Neil Armstrong {=ex:neil}
- Buzz Aldrin {=ex:buzz}
```

- `{?crew .Person name}` stands alone before the list, must have non-empty text before it on the same line.
- Applies to ALL list items that follow

### What Happens When It's Ambiguous?

If MD-LD can't figure out what the `{...}` should attach to, **no data is emitted**. This prevents mistakes.

**Ambiguous example:**
```md
Some text here {name}
```
- "Some text here" isn't a valid value carrier
- Result: No RDF data is created

**Clear example:**
```md
[Some text here] {name}
```
- `[Some text here]` is a valid value carrier
- Result: Creates the expected RDF data

---

## 6. Setting the Subject

The **subject** is what you're talking about. Once set, it stays current until you change it.

### Full IRI Subject

```
{=IRI}
```

Sets the current subject to a complete identifier.

**Example:**
```md
# Apollo 11 {=wd:Q43653}
[1969] {nasa:launchYear}
```

**Result:**
```turtle
wd:Q43653 nasa:launchYear "1969" .
```

### Fragment Subject

```
{=#fragment}
```

Creates a local identifier relative to the current subject base.

**Rules:**
- Requires a current subject to exist
- Replaces any existing fragment
- Creates `currentSubjectBase#fragment`

**Example:**
```md
[schema] {http://schema.org/}

# Document {=tag:alice@example.com,2026:doc}
## Section 1 {=#section1}
[Section content] {schema:text}

## Section 2 {=#section2}
[More content] {schema:text}
```

**Result:**
```turtle
tag:alice@example.com,2026:doc#section1 schema:text "Section content" .
tag:alice@example.com,2026:doc#section2 schema:text "More content" .
```

### Soft Object IRI (Temporary)

```
{+iri}
```

Declares a temporary object for use with `?` and `!` predicates, without changing the current subject. 

### Soft Fragment (Temporary)

```
{+#fragment}
```

Creates a temporary fragment relative to the current subject base.

**Use cases:**
- `[Related Item] {+ex:related ?schema:isRelatedTo}` - Links to a local fragment
- `[Parent] {+ex:parent !schema:hasPart}` - Reverse relationship
- `[Section] {+#section1 name ?hasPart}` - Object property with fragment

The soft IRI only exists within the current annotation block.

---

## 7. Declaring Types

Types tell us **what something is**. Use the dot notation.

```
.Class
```

**What it creates:**
```
S rdf:type rdfs:Class
```

**Example:**
```md
# Apollo 11 {=wd:Q43653 .nasa:SpaceMission}
```

**Result:**
```turtle
wd:Q43653 a nasa:SpaceMission .
```

**Multiple types are allowed:**
```md
# Neil Armstrong {=nasa:neil .schema:Person .nasa:Astronaut}
```

**Result:**
```turtle
nasa:neil a schema:Person, nasa:Astronaut .
```

**Key points:**
- Types are declared with a leading dot `.ClassName`
- Multiple types can be listed in the same `{...}`
- The current subject gets the type(s)

---

## 8. How Predicates Work

Predicates create the actual **facts** by connecting subjects to objects. The syntax determines the direction.

### The Three Predicate Forms

| Syntax | Direction         | What it means      | Example use case       |
|--------|-------------------|--------------------|------------------------|
| `p`    | Subject → Literal | "Has property"     | `[Apollo 11] {name}`   |
| `?p`   | Subject → Object  | "Points to"        | `[NASA] {?operator}`   |
| `!p`   | Object → Subject  | "Is pointed at by" | `[Mission] {!hasPart}` |

### How They Work

**`p` - Subject to Literal**
```md
[Apollo 11] {label}
```
Creates: `S → rdfs:label → "Apollo 11"`

**`?p` - Subject to Object**  
```md
[NASA](https://nasa.gov) {?nasa:operator}
```
Creates: `S → nasa:operator → https://nasa.gov`

**`!p` - Object to Subject**
```md
[Mission] {=ex:mission !member}
```
Creates: `ex:mission → rdfs:member → S`

### When Facts Are Created

A predicate creates a fact only when:
- All required pieces exist (subject, predicate, object)
- The roles make sense (literals can't be subjects)

If anything is missing, **no fact is created** - this prevents errors.

### All Forms Are Required

MD-LD implementations must support all three forms. They're not optional - they're core to how MD-LD works.

---

## 9. Working with Literals

Literals are the actual text values - the data itself.

### Where Literals Come From

The literal value `L` comes **only** from the value carrier you're annotating.

**Good:**
```md
[Apollo 11] {label}  ← L = "Apollo 11"
```

**Bad:**
```md
Apollo 11 {label}  ← "Apollo 11" is not in a value carrier
```
Result: No data is created

### Adding Datatypes and Languages

```
^^datatypeIRI    # For typed data
@lang           # For language-specific text
```

**Rules:**
- Use only one per literal (datatype OR language, not both)
- Never inferred - you must specify them explicitly

**Examples:**
```md
[1969] {nasa:launchYear ^^xsd:gYear}
[July] {ex:month @en}
[Juillet] {ex:month @fr}
```

**Results:**
```turtle
S nasa:launchYear "1969"^^xsd:gYear .
S ex:month "July"@en .
S ex:month "Juillet"@fr .
```

### Common Datatypes

- `^^xsd:string` - Plain text (default)
- `^^xsd:integer` - Whole numbers
- `^^xsd:gYear` - Years (like 1969)
- `^^xsd:date` - Full dates
- `^^xsd:boolean` - true/false values

---

## 10. Working with Object Resources

Object resources are the **things** you link to, not the text about them.

### Where Objects Come From

The object `O` is available only from:
- Link URLs: `[text](URL)`
- Image URLs: `![alt](URL)`
- Explicit IRIs: `{=IRI}`/`{+IRI}` inside the annotation

### Examples

```md
## References {=tag:alice@example.com,2026:refs}

[Alice] {=tag:alice@example.com,2026:alice ?schema:author schema:name}
[W3C RDF](https://www.w3.org/RDF) {?dct:references label}
![Example image](https://www.example.com/image.jpg) {?schema:image label}
```

### What This Creates

```turtle
tag:alice@example.com,2026:refs schema:author <tag:alice@example.com,2026:alice> .
<tag:alice@example.com,2026:alice> schema:name "Alice" .

tag:alice@example.com,2026:refs dct:references <https://www.w3.org/RDF> .
<https://www.w3.org/RDF> rdfs:label "W3C RDF" .

tag:alice@example.com,2026:refs schema:image <https://www.example.com/image.jpg> .
<https://www.example.com/image.jpg> rdfs:label "Example image" .
```

### How It Works

1. **Link URLs**: The URL becomes the object
2. **Predicate `?`**: Connects subject to the URL object
3. **Predicate without `?`**: Creates a fact about the URL object itself

### Key Points

- Objects are always IRIs (web identifiers)
- Objects can be subjects of other facts in the same annotation
- Use `?` to point to objects, no prefix for facts about them

---

## 11. Working with Lists

Lists are for **repeating values** of the same relationship, with optional bulk class and value assignment.

### When to Use Lists

Use lists when you have:
- One predicate
- Multiple objects
- The same type of relationship

**Example:** Crew members of a mission
```md
Crew: {?crew .Person name}
- Neil Armstrong {=ex:neil}
- Buzz Aldrin {=ex:buzz}
- Michael Collins {=ex:michael}
```

### How List Context Works

A `{...}` block immediately before a list applies to **all items** in that list.

**Rules:**
- Must have non-empty text before the list annotation
- Ordered (`1.`) and unordered (`-`) lists work the same
- Each list item is a **single-value block carrier** - the entire text after the marker and before `{...}` becomes the literal value
- **No inline carriers** are parsed within list items
- **No additional data** after `{...}` - text after annotations is treated as literal content, such list items are ignored

### List Item Policy: Single-Value Carriers

**✅ CORRECT Patterns**

```md
# Clean subject declaration (participates in list context)
- Flour {=ex:flour}

# Subject with aditional local predicates
- Flour {=ex:flour .c:Food label}
```

**❌ WRONG Patterns (Common LLM Mistakes)**

```md
# ❌ No subject declaration (excluded from list context)
- Whole wheat flour {description}

# ❌ Inline carriers in list items (excluded from list context)
- [*Important* ingredient] {priority .Important}

# ❌ Multiple annotations in same item (only first works)
- Flour {=ex:flour} [description] {priority}

# ❌ Text after annotation (excluded from list context)
- Flour {=ex:flour} - additional description

# ❌ Mixed content (creates ambiguity)
- Flour {=ex:flour} [*organic*] {certified}
```

**Critical Rule**: **All list items must have explicit subject (`{=iri}` or `{+iri}`) to participate in list context.** Items without subjects are excluded from the list's semantic relationships.

**Why These Rules Exist:**
- **Streaming safety**: Each list item can be processed independently
- **Round-trip predictability**: No ambiguity about semantic vs. literal content
- **Human readability**: Clear separation between structure and description
- **Explicit intent**: Forces authors to be clear about semantic relationships

### Valid Alternatives for Additional Information

**✅ Use Nested Lists (Semantic)**
```md
- Flour {=ex:flour}
  Properties: {?hasProperty .rdf:Property label}
  - Organic {=ex:organic}
  - Fine ground {=ex:grind}
```

**✅ Use Separate Sections**
```md
- Flour {=ex:flour}

## Flour Properties {=ex:flour .Important}
[*Important*] {ex:priority}
```

**❌ NEVER Use Nested Paragraphs (Invalid)**
```md
- Flour {=ex:flour}
  Description: [additional description] {description}  # ❌ List context lost
```

**❌ NEVER Use URLs in Lists**
```md
- <https://example.com> {ex:resource}  # ❌ Wrong syntax
```

**Correct approach for URLs:**
```md
### External Resource {=ex:resource}
URL: <https://example.com> {ex:url}
```

### Common Syntax Mistakes

**❌ Inline Carriers in List Items**
```md
- [*Important* ingredient] {priority}     # ❌ No subject = excluded
- Flour {=ex:flour} [extra] {desc}        # ❌ Text after annotation = excluded
```

**❌ Mixed Content in List Items**
```md
- Flour {=ex:flour} - description           # ❌ Text after annotation = excluded
- Flour {=ex:flour} [*organic*] {certified} # ❌ Mixed content = ambiguous
```

**✅ Clean List Item Patterns**
```md
- Flour {=ex:flour}                        # ✅ Clean subject declaration
- Organic flour {=ex:flour-organic label}  # ✅ Subject with descriptive text
- Flour {=ex:flour .Food label}            # ✅ Subject with type and label
```

### Nested Lists

Each indentation level creates a new semantic scope:

```md
[#vocab] <http://schema.org/>

## Recipe {=tag:alice@example.com,2026:recipe .Recipe name}

Ingredients: {?hasPart .Ingredient name}
- Flour {=tag:alice@example.com,2026:flour}
  Variants: {?hasPart .FlourType name}
  - Whole wheat {=tag:alice@example.com,2026:flour-whole-wheat .WholeGrainFlour}
  - White {=tag:alice@example.com,2026:flour-white .FlourType title}
- Water {=tag:alice@example.com,2026:water}
```

**What This Creates:**
```turtle
tag:alice@example.com,2026:recipe a schema:Recipe ; 
          schema:name "Recipe" ;
          schema:hasPart tag:alice@example.com,2026:flour, tag:alice@example.com,2026:water .

tag:alice@example.com,2026:flour a schema:Ingredient ; 
         schema:name "Flour" ;
         schema:hasPart tag:alice@example.com,2026:flour-whole-wheat, tag:alice@example.com,2026:flour-white .

tag:alice@example.com,2026:flour-whole-wheat a schema:WholeGrainFlour , schema:FlourType ; 
                     schema:name "Whole wheat" .

tag:alice@example.com,2026:flour-white a schema:FlourType ; 
                schema:title "White" .
                
tag:alice@example.com,2026:water a schema:Ingredient ; 
         schema:name "Water" .
```

### Key Points

- List context applies only to items at the same indentation level
- Nested lists don't inherit semantic context
- Each level needs its own annotation if you want semantics

### Ordered lists

For legacy scenarios like SHACL `sh:in`, `sh:or`, you can manually construct `.rdf:List` structures using the verbose syntax:

```md
[ex] <http://example.org/>

# Manual list construction
[head] {=ex:l1 ?sh:in .rdf:List}
[a] {+ex:A ?rdf:first}
[list2] {=ex:l2 ?rdf:rest}
[b] {+ex:B ?rdf:first}
[nil] {+rdf:nil ?rdf:rest}
{=}
```

---

## 12. Reverse Relationships

Reverse predicates flip the direction of a relationship without changing its meaning.

### How It Works

**Normal predicate (`p`):** Subject → Object

```md
# The Mission {ex:mission}
Includes parts: [Crew] {=ex:crew member}
```

Creates: `Mission → mamber → Crew`

**Reverse predicate (`!p`):** Object → Subject  

```md
# The Crew {=ex:crew}
Is included in [The Mission] {=ex:mission !member}
```

Creates the same triple: `Mission → member → Crew`

### Practical Example

```md
# Flour {=ex:flour}
Used in: {!ex:hasPart}
- Bread {=ex:bread}
```

**Result:**
```turtle
ex:bread ex:hasPart ex:flour .
```

### When to Use Reverse Relationships

Use `!` when you want to:
- Point back to the current subject from an object
- Create bidirectional relationships
- Express "is part of" vs "has part"

**Example:**
```md
[book] <tag:alice@example.com,2026:book:>

# Chapter 1 {=book:chapter1 .book:Chapter label}
Is part of the [Book] {=book:book !book:hasPart ?book:partOf .book:Book book:title}
```

**Creates:**
```turtle
book:chapter1 a book:Chapter ;
             rdfs:label "Chapter 1";
             book:partOf book:Book .
             
book:book a book:Book ;
         book:title "Book" ;
         book:hasPart book:chapter1 .
```

### Key Points

- `!` only flips direction, not meaning
- Useful for creating inverse and mutual relationships
- The object becomes the subject in the resulting fact

---

## 13. Code Blocks

Code blocks can carry annotations when you put `{...}` on the opening fence.

### How It Works

```md
[@vocab] <http://schema.org/>

``js {=ex:code .SoftwareSourceCode text}
console.log("hi")
``
```

The code block content is not parsed as MDLD and is available as the literal value.

### Example

```md
[@vocab] <http://schema.org/>

``js {=ex:code .SoftwareSourceCode text}
console.log("hi")
``

We can add a programming language or any additional info after the block as regular property annotations - *JavaScript* {language}.
```

### What It Creates

```turtle
ex:code a schema:SoftwareSourceCode ;
  schema:text "console.log(\"hi\")" ;
  schema:language "JavaScript" .
```

### Key Points

- The `{...}` goes on the opening fence line
- The entire code content becomes the literal
- Useful for documenting code, scripts, and configuration

---

## 14. Semantic Reset (normative)

An empty subject declaration `{=}` establishes a semantic reset boundary.

Upon encountering `{=}`, an MD-LD processor MUST:
- Reset the current subject
- Reset all active predicates
- Reset list scopes and reverse predicates
- Clear any pending annotation context

## 15. Context and Vocabulary

Context tells MD-LD how to expand short names into full identifiers.

### Default Context

MD-LD always provides this context by default:

```json
{
    "@vocab": "http://www.w3.org/2000/01/rdf-schema#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "sh": "http://www.w3.org/ns/shacl#",
    "prov": "http://www.w3.org/ns/prov#"
}
```

This means:
- `label` expands to `http://www.w3.org/2000/01/rdf-schema#label`
- `rdf:type` expands to `http://www.w3.org/1999/02/22-rdf-syntax-ns#type`


### Adding Prefixes

Declare prefixes for your own identifiers:

```md
[alice] <tag:alice@example.com,2026:>
[wd] <https://www.wikidata.org/entity/>
```

Now you can use:
- `alice:person` → `tag:alice@example.com,2026:person`
- `wd:Q43653` → `https://www.wikidata.org/entity/Q43653`

### Prefix Folding: Hierarchical IRI Authoring

Build namespace hierarchies by referencing previously declared prefixes:

```md
# Domain authority
[my] <tag:mymail@domain.com,2026:>

# Hierarchical prefixes
[j] <my:journal:>
[p] <my:property:>
[c] <my:class:>
[person] <my:people:>

# Multi-level nesting
[org] <https://org.example.com/>
[person] <org:person/>
[emp] <person:employee/>
[dev] <emp:developer/>
```

**Resolution Rules:**
- Prefixes must be declared before they can be referenced (forward-reference only)
- References are resolved immediately during declaration
- Circular references are treated as literal strings
- Later declarations override earlier ones

**Examples:**
- `j:2026-01-27` → `tag:mymail@domain.com,2026:journal:2026-01-27`
- `emp:harry` → `https://org.example.com/person/employee/harry`
- `dev:john` → `https://org.example.com/person/employee/developer/john`

This enables lightweight IRI authoring without external ontology dependencies, perfect for personal knowledge graphs and domain-specific namespaces.

### Setting Vocabulary

Change the default vocabulary (http://www.w3.org/2000/01/rdf-schema#):

```md
[@vocab] <http://schema.org/>
```

Now unprefixed terms use your namespace:
- `name` → `http://schema.org/name`
- `Person` → `http://schema.org/Person`

### Context Rules

- Context applies forward from where you declare it
- Later declarations override earlier ones
- Initial context can't be removed, only overridden
- Works in a single pass - no look-ahead needed


## 16. What MD-LD Doesn't Do

To keep things simple and predictable, MD-LD explicitly avoids these features:

### Forbidden Constructs

- **Implicit labels** - No automatic naming from structure
- **Structural inference** - No guessing from document layout
- **Auto-subjects** - No automatic subject creation
- **Literal lists** - Structure doesn't imply semantics
- **Blank nodes** - Every entity must have a proper identifier
- **key=value syntax** - Use the explicit `{...}` format instead
- **Predicate guessing** - No automatic predicate selection
- **Backtracking parses** - Always single-pass, forward-only
- **CURIE in Markdown links** - Keep links and semantics separate

### Why These Are Forbidden

These restrictions make MD-LD:
- **Predictable** - Same input always produces same output
- **Traceable** - Every fact comes from an explicit annotation
- **Fast** - Can process in a single pass
- **Clear** - No magic or hidden behavior

If you need these features, use them in your application logic, not in the MD-LD syntax itself.

---

## 17. Conformance

An MD-LD processor is conformant if it follows these rules:

### Required Behaviors

1. **Follow predicate routing rules** - All facts must follow §8 patterns
2. **Explicit source only** - All facts must come from `{...}` blocks
3. **Single-pass parsing** - Must be implementable as streaming algorithm
4. **Deterministic output** - Same input always produces same output
5. **Traceable origins** - Every fact must be traceable to its source

### What This Means

- **No guessing** - Processors can't infer or assume anything
- **No blank nodes** - Every entity must have an IRI
- **No backtracking** - Must process forward-only
- **Round-trip preservation** - MD → RDF → MD should preserve all facts

If you implement these rules, you have a conformant MD-LD processor.

---
