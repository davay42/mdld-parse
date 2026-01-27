# MD-LD v0.3 — Core Specification (Minimal)

**Markdown-Linked Data**

A deterministic, streaming-friendly semantic annotation layer for CommonMark Markdown that emits RDF quads **only** from explicit `{...}` annotations.

---

## 1. What MD-LD Guarantees

MD-LD follows these strict rules to make it predictable and reliable:

1. **Markdown stays valid** - If you remove all `{...}` blocks, you get perfectly normal Markdown
2. **No hidden meanings** - MD-LD never guesses what you meant. Everything must be explicit
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
- Stays current until you change it

**Example:**
```md
# Apollo 11 {=wd:Q43653}  ← Sets S to Apollo 11
[1969] {launchYear}       ← S is still Apollo 11
```

### **O - The Object Resource** (What we're linking to)
- Comes from links, images, or `{=IRI}` inside the annotation
- Only available when you explicitly provide it

**Example:**
```md
# NASA {=urn:org:nasa .Organization name}

<https://nasa.gov> {?sameAs}
[NASA website](https://nasa.gov) {?website .Website name}
![NASA Logo](https://nasa.gov/logo.png) {?logo .Image name}

```

### **L - The Literal Value** (The actual text)
- The text content of what you're annotating
- Can have datatypes (`^^xsd:gYear`) or languages (`@en`)

**Example:**
```md
[1969] {launchYear}      ← L = "1969"
[July 20] {launchDate @en} ← L = "July 20"@en
```

These three pieces let MD-LD create the right facts from your annotations.

---

## 4. What Can Carry Annotations

A `{...}` block can attach to exactly one **value carrier** - the piece of Markdown that provides the literal value.

### Inline Elements (text-level)

| Markdown | What it captures | Example |
|----------|------------------|---------|
| `[text] {...}` | Link text | `[Apollo 11] {name}` |
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
| `> quote {...}` | Quote text | `> "One small step" {quote}` |
| ````lang {...}`` | Code block content | ````js {=ex:code .SoftwareSourceCode}` |

### Links and Media (with URLs)

| Markdown | What it captures | Example |
|----------|------------------|---------|
| `http://example.com {...}` | The URL itself | `https://nasa.gov {?website}` |
| `[label](URL) {...}` | Link text + URL | `[NASA](https://nasa.gov) {?website name}` |
| `![alt](URL) {...}` | Alt text + URL | `![Photo](photo.jpg) {?image name}` |

### What CAN'T Carry Annotations

- Plain paragraphs without inline formatting
- Raw URLs without `{...}`
- Text that's not in one of the formats above
- Multiple elements at once (one `{...}` per carrier)

**Key Rule:** The `{...}` block must come **immediately after** the value carrier.

---

## 5. How `{...}` Blocks Attach

A `{...}` block needs to know what it's describing. MD-LD follows simple rules to figure this out.

### The Attachment Rules

1. **Attach to the nearest value carrier** - The `{...}` grabs the closest thing that can carry it
2. **Or stand alone** - If on its own line, it applies to the current subject or the next list

### Rule 1: Attach to Nearest Carrier

```md
[Apollo 11] {name} was launched in [1969] {launchYear}.
```
- `{name}` attaches to `[Apollo 11]` → L = "Apollo 11"
- `{launchYear}` attaches to `[1969]` → L = "1969"

### Rule 2: Stand Alone for Subjects

```md
# Apollo 11 Mission {=ex:apollo11 .Mission}
```
- `{=ex:apollo11 .Mission}` stands alone
- Sets the current subject to `ex:apollo11`
- Declares it's a `.Mission`

### Rule 3: Stand Alone for Lists

```md
Crew members: {?crew .Person name}
- Neil Armstrong {=ex:neil}
- Buzz Aldrin {=ex:buzz}
```
- `{?crew .Person name}` stands alone before the list
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
[1969] {launchYear}
```

**Result:**
```turtle
wd:Q43653 schema:launchYear "1969" .
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
# Document {=tag:alice@example.com,2026:doc}
## Section 1 {=#section1}
[Section content] {name}

## Section 2 {=#section2}
[More content] {name}
```

**Result:**
```turtle
tag:alice@example.com,2026:doc#section1 schema:name "Section content" .
tag:alice@example.com,2026:doc#section2 schema:name "More content" .
```

### Object IRI (Temporary)

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
S rdf:type schema:Class
```

**Example:**
```md
# Apollo 11 {=wd:Q43653 .SpaceMission}
```

**Result:**
```turtle
wd:Q43653 a schema:SpaceMission .
```

**Multiple types:**
```md
# Neil Armstrong {=ex:neil .Person .Astronaut}
```

**Result:**
```turtle
ex:neil a schema:Person, schema:Astronaut .
```

**Key points:**
- Types are declared with a leading dot `.ClassName`
- Multiple types can be listed in the same `{...}`
- The current subject gets the type(s)

---

## 8. How Predicates Work

Predicates create the actual **facts** by connecting subjects to objects. The syntax determines the direction.

### The Three Predicate Forms

| Syntax | Direction | What it means | Example use case |
|--------|-----------|---------------|------------------|
| `p` | Subject → Literal | "Has property" | `[Apollo 11] {name}` |
| `?p` | Subject → Object | "Points to" | `[NASA] {?operator}` |
| `!p` | Object → Subject | "Is pointed at by" | `[Mission] {!hasPart}` |

### How They Work

**`p` - Subject to Literal**
```md
[Apollo 11] {name}
```
Creates: `S → name → "Apollo 11"`

**`?p` - Subject to Object**  
```md
[NASA](https://nasa.gov) {?operator}
```
Creates: `S → operator → https://nasa.gov`

**`!p` - Object to Subject**
```md
[Mission] {=ex:mission !hasPart}
```
Creates: `ex:mission → hasPart → S`

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
[Apollo 11] {name}  ← L = "Apollo 11"
```

**Bad:**
```md
Apollo 11 {name}  ← "Apollo 11" is not in a value carrier
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
[1969] {launchYear ^^xsd:gYear}
[July] {month @en}
[Juillet] {month @fr}
```

**Results:**
```turtle
S schema:launchYear "1969"^^xsd:gYear .
S schema:month "July"@en .
S schema:month "Juillet"@fr .
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
- Explicit IRIs: `{=IRI}` inside the annotation

### Examples

```md
## References {=tag:alice@example.com,2026:refs}

[Example image](https://www.example.com/image.jpg) {?image name}
[W3C RDF](https://www.w3.org/RDF) {?dct:references name}
[Alice] {=tag:alice@example.com,2026:alice ?author name}
```

### What This Creates

```turtle
tag:alice@example.com,2026:refs schema:image <https://www.example.com/image.jpg> .
<https://www.example.com/image.jpg> schema:name "Example image" .

tag:alice@example.com,2026:refs dct:references <https://www.w3.org/RDF> .
<https://www.w3.org/RDF> schema:name "W3C RDF" .

tag:alice@example.com,2026:refs schema:author <tag:alice@example.com,2026:alice> .
<tag:alice@example.com,2026:alice> schema:name "Alice" .
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

Lists are for **repeating values** of the same relationship. Paragraphs are for describing one entity.

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
- Must have some text before the list annotation
- Ordered (`1.`) and unordered (`-`) lists work the same
- Each list item is a separate value carrier

### Nested Lists

Each indentation level creates a new semantic scope:

```md
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

---

## 12. Reverse Relationships

Reverse predicates flip the direction of a relationship without changing its meaning.

### How It Works

**Normal predicate (`p`):** Subject → Object
```md
[The Mission] {hasPart Crew}
```
Creates: `Mission → hasPart → Crew`

**Reverse predicate (`!p`):** Object → Subject  
```mdn
[The Mission] {!hasPart Crew}
```
Creates: `Crew → hasPart → Mission`

### Practical Example

```md
Used in: {!hasPart}
- Bread {=ex:bread}
```

**Result:**
```turtle
ex:bread schema:hasPart S .
```

### When to Use Reverse Relationships

Use `!` when you want to:
- Point back to the current subject from an object
- Create bidirectional relationships
- Express "is part of" vs "has part"

**Example:**
```md
# Chapter 1 {=tag:alice@example.com,2026:chapter1 .Chapter name}
[Book] {!hasPart .Book title}
```

**Creates:**
```turtle
tag:alice@example.com,2026:chapter1 a schema:Chapter ;
             schema:name "Chapter 1" .
             
tag:alice@example.com,2026:book a schema:Book ;
         schema:title "Book" ;
         schema:hasPart tag:alice@example.com,2026:chapter1 .
```

### Key Points

- `!` only flips direction, not meaning
- Useful for creating inverse relationships
- The object becomes the subject in the resulting fact

---

## 13. Code Blocks

Code blocks can carry annotations when you put `{...}` on the opening fence.

### How It Works

```md
```js {=ex:code .SoftwareSourceCode text}
console.log("hi")
```
```

The code block content becomes the literal value.

### Example

```md
```js {=ex:code .SoftwareSourceCode text}
console.log("hi")
```

Run this *JavaScript* {language} code in your browser console to say 'hi'.
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

## 14. Context and Vocabulary

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
- `rdf:type` expands to `http://www.w3.org/1999/02/22-rdf-syntax-ns#type`
- `rdfs:label` expands to `http://www.w3.org/2000/01/rdf-schema#label`

### Adding Prefixes

Declare prefixes for your own identifiers:

```md
[alice] <tag:alice@example.com,2026:/>
[wd] <https://www.wikidata.org/entity/>
```

Now you can use:
- `alice:person` → `tag:alice@example.com,2026:/person`
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


## 15. What MD-LD Doesn't Do

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

## 16. Conformance

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
