import { parse } from '../src/index.js';

// Test helpers
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function findQuad(quads, s, p, o) {
    return quads.find(q =>
        q.subject.value === s &&
        q.predicate.value === p &&
        (o === null || (q.object.termType === 'Literal' ? q.object.value === o : q.object.value === o))
    );
}

function hasQuad(quads, s, p, o) {
    return !!findQuad(quads, s, p, o);
}

// Ordered Lists test suite
export const orderedListsTests = [
    {
        name: '§12.1 Basic Round-Trip - Simple ordered list with IRIs',
        fn: () => {
            const md = `[ex] <http://example.org/>
## Status values {=ex:statusValues}
Status values: {?sh:in .ex:Status label}
1. Active {=ex:Active}
2. Inactive {=ex:Inactive}`;

            const { quads } = parse(md);

            // Should generate RDF list triples
            assert(hasQuad(quads, 'http://example.org/statusValues#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/Active'),
                'Should generate rdf:first for first item');
            assert(hasQuad(quads, 'http://example.org/statusValues#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/statusValues#list-1-2'),
                'Should generate rdf:rest to next list node');
            assert(hasQuad(quads, 'http://example.org/statusValues#list-1-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/Inactive'),
                'Should generate rdf:first for second item');
            assert(hasQuad(quads, 'http://example.org/statusValues#list-1-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
                'Should generate rdf:rest rdf:nil for end of list');

            // Should connect context to the first list node (proper RDF list semantics)
            assert(hasQuad(quads, 'http://example.org/statusValues', 'http://www.w3.org/ns/shacl#in', 'http://example.org/statusValues#list-1-1'),
                'Should connect context subject to first list node');
        }
    },

    {
        name: '§12.2 Basic Round-Trip - Ordered list with literals',
        fn: () => {
            const md = `[ex] <http://example.org/>
## Language tags {=ex:languageTags}
Is one of these: {?sh:languageIn .ex:lang label}
1. English {=ex:en}
2. French {=ex:fr}
3. Deutch {=ex:de}`;

            const { quads } = parse(md);

            // Should generate RDF list with IRIs (from subject declarations)
            assert(hasQuad(quads, 'http://example.org/languageTags#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/en'),
                'Should generate rdf:first for first item');
            assert(hasQuad(quads, 'http://example.org/languageTags#list-1-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/fr'),
                'Should generate rdf:first for second item');
            assert(hasQuad(quads, 'http://example.org/languageTags#list-1-3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/de'),
                'Should generate rdf:first for third item');

            // Should generate proper list chaining
            assert(hasQuad(quads, 'http://example.org/languageTags#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/languageTags#list-1-2'),
                'Should chain l1 to l2');
            assert(hasQuad(quads, 'http://example.org/languageTags#list-1-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/languageTags#list-1-3'),
                'Should chain l2 to l3');
            assert(hasQuad(quads, 'http://example.org/languageTags#list-1-3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
                'Should end list with rdf:nil');

            // Should connect context to the first list node (proper RDF list semantics)
            assert(hasQuad(quads, 'http://example.org/languageTags', 'http://www.w3.org/ns/shacl#languageIn', 'http://example.org/languageTags#list-1-1'),
                'Should connect context subject to first list node');
        }
    },

    {
        name: '§12.3 Single Item List',
        fn: () => {
            const md = `[ex] <http://example.org/>
## Single item {=ex:singleItem}

There's only one {?sh:in .ex:Single label}
1. Only {=ex:Only}`;

            const { quads } = parse(md);

            // Should generate proper single-item list
            assert(hasQuad(quads, 'http://example.org/singleItem#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/Only'),
                'Should generate rdf:first for single item');
            assert(hasQuad(quads, 'http://example.org/singleItem#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
                'Should generate rdf:rest rdf:nil for single item');

            // Should connect context to the first list node (proper RDF list semantics)
            assert(hasQuad(quads, 'http://example.org/singleItem', 'http://www.w3.org/ns/shacl#in', 'http://example.org/singleItem#list-1-1'),
                'Should connect context subject to first list node');
        }
    },

    {
        name: '§12.4 Integration - Should not interfere with unordered lists',
        fn: () => {
            const md = `[ex] <http://example.org/>

## Document {=ex:doc .Container}

Items: {?member}
- Unordered item 1 {=ex:item1}
- Unordered item 2 {=ex:item2}

## Ordered list {?sh:in}
1. Ordered item 1 {=ex:ordered1}
2. Ordered item 2 {=ex:ordered2}`;

            const { quads } = parse(md);

            // Should handle both list types correctly
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Container'),
                'Should handle document type (rdf:type is correct W3C standard)');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#member', 'http://example.org/item1'),
                'Should handle unordered list item 1');
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#member', 'http://example.org/item2'),
                'Should handle unordered list item 2');

            // Should generate RDF list triples
            assert(hasQuad(quads, 'http://example.org/doc#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/ordered1'),
                'Should handle ordered list item 1');
            assert(hasQuad(quads, 'http://example.org/doc#list-1-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/ordered2'),
                'Should handle ordered list item 2');
            assert(hasQuad(quads, 'http://example.org/doc#list-1-1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://example.org/doc#list-1-2'),
                'Should chain ordered list items');
            assert(hasQuad(quads, 'http://example.org/doc#list-1-2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
                'Should end ordered list with rdf:nil');

            // Should connect ordered list to context (inherited from document)
            assert(hasQuad(quads, 'http://example.org/doc', 'http://www.w3.org/2000/01/rdf-schema#member', 'http://example.org/doc#list-1-1'),
                'Should connect ordered list context to first list node (inherits rdfs:member)');
        }
    }
];
