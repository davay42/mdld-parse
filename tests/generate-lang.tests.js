import { generate, parse, DataFactory } from '../src/index.js';

const { namedNode, literal } = DataFactory;

export const generateLangTests = [
  {
    name: 'generate with lang - priority: specified lang → untagged → English → any language, with tie-breaking',
    fn: () => {
      // Test 1: Specified language takes priority
      const { text: text1 } = generate({
        quads: [
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://example.org/Person')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alice', 'en')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alicia', 'es')
          )
        ],
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: 'es'
      });
      if (!text1.includes('# Alicia {=ex:person')) {
        throw new Error('Should prefer specified language (Spanish)');
      }

      // Test 2: Untagged takes priority when specified language not found
      const { text: text2 } = generate({
        quads: [
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://example.org/Person')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Generic')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alice', 'en')
          )
        ],
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: 'de'
      });
      if (!text2.includes('# Generic {=ex:person')) {
        throw new Error('Should fall back to untagged label');
      }

      // Test 3: English takes priority when untagged not found
      const { text: text3 } = generate({
        quads: [
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://example.org/Person')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alice', 'en')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alicia', 'es')
          )
        ],
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: 'de'
      });
      if (!text3.includes('# Alice {=ex:person')) {
        throw new Error('Should fall back to English label');
      }

      // Test 4: Tie-breaking by shortest, then alphabetically
      const { text: text4 } = generate({
        quads: [
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://example.org/Person')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Zebra', 'en')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Apple', 'en')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('VeryLongLabel', 'en')
          )
        ],
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: 'en'
      });
      if (!text4.includes('# Apple {=ex:person')) {
        throw new Error('Should prefer shortest (Apple=Zebra) then alphabetically first label');
      }
    }
  },
  {
    name: 'generate with lang - null uses default priority (untagged → English → any)',
    fn: () => {
      // With lang=null, untagged should win
      const { text } = generate({
        quads: [
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://example.org/Person')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Generic')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alice', 'en')
          ),
          DataFactory.quad(
            namedNode('http://example.org/person'),
            namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            literal('Alicia', 'es')
          )
        ],
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: null
      });

      if (!text.includes('# Generic {=ex:person')) {
        throw new Error('Should prefer untagged label with default priority');
      }
    }
  },
  {
    name: 'generate with lang - round-trip preserves all labels and multiple subjects',
    fn: () => {
      const quads = [
        DataFactory.quad(
          namedNode('http://example.org/alice'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://example.org/Person')
        ),
        DataFactory.quad(
          namedNode('http://example.org/alice'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Alice', 'en')
        ),
        DataFactory.quad(
          namedNode('http://example.org/alice'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Alicia', 'es')
        ),
        DataFactory.quad(
          namedNode('http://example.org/bob'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://example.org/Person')
        ),
        DataFactory.quad(
          namedNode('http://example.org/bob'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Bob', 'en')
        ),
        DataFactory.quad(
          namedNode('http://example.org/bob'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Roberto', 'es')
        )
      ];

      const { text } = generate({
        quads,
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: 'es'
      });

      // Check Spanish labels in headings
      if (!text.includes('# Alicia {=ex:alice')) {
        throw new Error('Should use Spanish label for alice in heading');
      }
      if (!text.includes('# Roberto {=ex:bob')) {
        throw new Error('Should use Spanish label for bob in heading');
      }

      // Round-trip: all labels should be preserved
      const parsed = parse({
        text,
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' }
      });

      const labels = parsed.quads.filter(q => q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label');
      if (labels.length !== 4) {
        throw new Error(`Expected 4 labels in round-trip, got ${labels.length}`);
      }
    }
  },
  {
    name: 'generate with lang - same label value preserves distinct language tags',
    fn: () => {
      const quads = [
        DataFactory.quad(
          namedNode('http://example.org/person'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://example.org/Person')
        ),
        DataFactory.quad(
          namedNode('http://example.org/person'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Alice', 'en')
        ),
        DataFactory.quad(
          namedNode('http://example.org/person'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Alice', 'es')
        )
      ];

      const { text } = generate({
        quads,
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        lang: 'es'
      });

      const parsed = parse({
        text,
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' }
      });
      const labels = parsed.quads.filter(q => q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label');
      const langs = labels.map(q => q.object.language).sort();
      if (labels.length !== 2 || langs[0] !== 'en' || langs[1] !== 'es') {
        throw new Error(`Expected Alice@en and Alice@es labels, got ${JSON.stringify(labels.map(q => ({ value: q.object.value, language: q.object.language })))}`);
      }
    }
  },
  {
    name: 'generate preserves label datatype in headings and inline annotations',
    fn: () => {
      const nameType = namedNode('http://example.org/Name');
      const quads = [
        DataFactory.quad(
          namedNode('http://example.org/z'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://example.org/Doc')
        ),
        DataFactory.quad(
          namedNode('http://example.org/z'),
          namedNode('http://example.org/knows'),
          namedNode('http://example.org/zz')
        ),
        DataFactory.quad(
          namedNode('http://example.org/zz'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://example.org/Person')
        ),
        DataFactory.quad(
          namedNode('http://example.org/zz'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          literal('Alice', nameType)
        )
      ];

      const { text } = generate({
        quads,
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' },
        compactInline: true
      });

      if (!text.includes('label ^^ex:Name')) {
        throw new Error(`Expected datatype label annotation, got:\n${text}`);
      }

      const parsed = parse({
        text,
        context: { ex: 'http://example.org/', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#' }
      });
      const labels = parsed.quads.filter(q => q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label');
      if (labels.length !== 1 || labels[0].object.datatype?.value !== 'http://example.org/Name') {
        throw new Error(`Expected one Alice label with ex:Name datatype, got ${JSON.stringify(labels.map(q => ({ value: q.object.value, datatype: q.object.datatype?.value })))}`);
      }
    }
  }
];

