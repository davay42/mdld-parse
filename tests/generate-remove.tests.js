import { generate, parse, DataFactory } from '../src/index.js';

const { namedNode, literal } = DataFactory;

export const generateRemoveTests = [
    {
        name: 'generate with remove - literal property retraction',
        fn: () => {
            const quads = [
                namedNode('http://example.org/doc'),
                namedNode('http://example.org/author'),
                literal('Alice')
            ];

            const remove = [
                namedNode('http://example.org/doc'),
                namedNode('http://example.org/author'),
                literal('Smith')
            ];

            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/author'),
                        literal('Alice')
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/author'),
                        literal('Smith')
                    )
                ],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('[Alice] {ex:author}')) {
                throw new Error('Should include addition');
            }
            if (!text.includes('[Smith] {-ex:author}')) {
                throw new Error('Should include retraction');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== 'Alice') {
                throw new Error('Quad should have value "Alice"');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== 'Smith') {
                throw new Error('Remove quad should have value "Smith"');
            }
        }
    },
    {
        name: 'generate with remove - type declaration retraction',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                        namedNode('http://example.org/Article')
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                        namedNode('http://example.org/Draft')
                    )
                ],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('.ex:Article')) {
                throw new Error('Should include type addition');
            }
            if (!text.includes('-.ex:Draft')) {
                throw new Error('Should include type retraction');
            }

            // Verify parsed graph state (type change: Draft → Article)
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== 'http://example.org/Article') {
                throw new Error('Quad should have new type Article');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== 'http://example.org/Draft') {
                throw new Error('Remove quad should have old type Draft');
            }
        }
    },
    {
        name: 'generate with remove - object property retraction',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/author'),
                        namedNode('http://example.org/alice')
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/author'),
                        namedNode('http://example.org/bob')
                    )
                ],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('{+ex:alice ?ex:author}')) {
                throw new Error('Should include object addition');
            }
            if (!text.includes('-?ex:author')) {
                throw new Error('Should include object retraction');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== 'http://example.org/alice') {
                throw new Error('Quad should have object alice');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== 'http://example.org/bob') {
                throw new Error('Remove quad should have object bob');
            }
        }
    },
    {
        name: 'generate with remove - external retraction (subject not in quads)',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/author'),
                        literal('Alice')
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/other'),
                        namedNode('http://example.org/name'),
                        literal('Bob')
                    )
                ],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('# other {=ex:other}')) {
                throw new Error('Should create heading for external retraction');
            }
            if (!text.includes('[Bob] {-ex:name}')) {
                throw new Error('Should include external retraction');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].subject.value !== 'http://example.org/other') {
                throw new Error('Remove quad should have subject other');
            }
        }
    },
    {
        name: 'generate with remove - datatype preservation',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/age'),
                        literal('30', namedNode('http://www.w3.org/2001/XMLSchema#integer'))
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/age'),
                        literal('25', namedNode('http://www.w3.org/2001/XMLSchema#integer'))
                    )
                ],
                context: { ex: 'http://example.org/', xsd: 'http://www.w3.org/2001/XMLSchema#' }
            });

            if (!text.includes('`30` {ex:age ^^xsd:integer}')) {
                throw new Error('Should include addition with datatype');
            }
            if (!text.includes('`25` {-ex:age ^^xsd:integer}')) {
                throw new Error('Should include retraction with datatype');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/', xsd: 'http://www.w3.org/2001/XMLSchema#' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== '30') {
                throw new Error('Quad should have value "30"');
            }
            if (parsed.quads[0].object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#integer') {
                throw new Error('Quad should have integer datatype');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== '25') {
                throw new Error('Remove quad should have value "25"');
            }
        }
    },
    {
        name: 'generate with remove - language tag preservation',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/title'),
                        literal('Hello', 'en')
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/title'),
                        literal('Hola', 'es')
                    )
                ],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('[Hello] {ex:title @en}')) {
                throw new Error('Should include addition with language');
            }
            if (!text.includes('[Hola] {-ex:title @es}')) {
                throw new Error('Should include retraction with language');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== 'Hello') {
                throw new Error('Quad should have value "Hello"');
            }
            if (parsed.quads[0].object.language !== 'en') {
                throw new Error('Quad should have language "en"');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== 'Hola') {
                throw new Error('Remove quad should have value "Hola"');
            }
            if (parsed.remove[0].object.language !== 'es') {
                throw new Error('Remove quad should have language "es"');
            }
        }
    },
    {
        name: 'generate with remove - empty remove array',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/author'),
                        literal('Alice')
                    )
                ],
                remove: [],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('[Alice] {ex:author}')) {
                throw new Error('Should include addition');
            }
            if (text.includes('-')) {
                throw new Error('Should not include retractions when remove is empty');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.remove.length !== 0) {
                throw new Error(`Expected 0 quads in remove, got ${parsed.remove.length}`);
            }
        }
    },
    {
        name: 'generate with remove - round-trip parse preserves remove array',
        fn: () => {
            const quads = [
                DataFactory.quad(
                    namedNode('http://example.org/doc'),
                    namedNode('http://example.org/author'),
                    literal('Alice')
                )
            ];

            const remove = [
                DataFactory.quad(
                    namedNode('http://example.org/doc'),
                    namedNode('http://example.org/author'),
                    literal('Smith')
                )
            ];

            const { text } = generate({
                quads,
                remove,
                context: { ex: 'http://example.org/' }
            });

            const parsed = parse({ text, context: { ex: 'http://example.org/' } });

            // Check that quads are preserved
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad, got ${parsed.quads.length}`);
            }

            // Check that remove array is populated
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 remove quad, got ${parsed.remove.length}`);
            }

            // Check the retraction value
            if (parsed.remove[0].object.value !== 'Smith') {
                throw new Error('Retraction should have value "Smith"');
            }
        }
    },
    {
        name: 'generate with remove - boolean datatype styling',
        fn: () => {
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/published'),
                        literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/published'),
                        literal('false', namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
                    )
                ],
                context: { ex: 'http://example.org/', xsd: 'http://www.w3.org/2001/XMLSchema#' }
            });

            if (!text.includes('**true** {ex:published ^^xsd:boolean}')) {
                throw new Error('Should include boolean addition with bold styling');
            }
            if (!text.includes('**false** {-ex:published ^^xsd:boolean}')) {
                throw new Error('Should include boolean retraction with bold styling');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/', xsd: 'http://www.w3.org/2001/XMLSchema#' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== 'true') {
                throw new Error('Quad should have value "true"');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== 'false') {
                throw new Error('Remove quad should have value "false"');
            }
        }
    },
    {
        name: 'generate with remove - multiline value',
        fn: () => {
            const multiline = 'Line 1\nLine 2\nLine 3';
            const { text } = generate({
                quads: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/description'),
                        literal(multiline)
                    )
                ],
                remove: [
                    DataFactory.quad(
                        namedNode('http://example.org/doc'),
                        namedNode('http://example.org/description'),
                        literal('Old description')
                    )
                ],
                context: { ex: 'http://example.org/' }
            });

            if (!text.includes('~~~')) {
                throw new Error('Should use fenced block for multiline');
            }
            if (!text.includes(multiline)) {
                throw new Error('Should include multiline value');
            }
            if (!text.includes('[Old description] {-ex:description}')) {
                throw new Error('Should include retraction');
            }

            // Verify parsed graph state
            const parsed = parse({ text, context: { ex: 'http://example.org/' } });
            if (parsed.quads.length !== 1) {
                throw new Error(`Expected 1 quad in quads, got ${parsed.quads.length}`);
            }
            if (parsed.quads[0].object.value !== multiline) {
                throw new Error('Quad should have multiline value');
            }
            if (parsed.remove.length !== 1) {
                throw new Error(`Expected 1 quad in remove, got ${parsed.remove.length}`);
            }
            if (parsed.remove[0].object.value !== 'Old description') {
                throw new Error('Remove quad should have value "Old description"');
            }
        }
    }
];
