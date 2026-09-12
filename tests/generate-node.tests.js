import fs from 'node:fs';
import { parse, generateNode } from '../src/index.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export const generateNodeTests = [
  {
    name: 'generateNode renders a correct recipe entity page from the recipe graph',
    fn: () => {
      const recipeText = fs.readFileSync(new URL('../examples/demo/recipe.md', import.meta.url), 'utf8');
      const { quads, context } = parse({ text: recipeText });
      const focusIRI = 'tag:alice@example.com,2026:food/apple-pie';

      const { text: pageText, context: generatedContext } = generateNode({
        quads,
        focusIRI,
        context,
        compactInline: true,
        renderReverse: true
      });

      assert(pageText.length > 0, 'generateNode should render non-empty text for a known focus IRI');
      assert(pageText.includes("# Grandma's Apple Pie"), 'Entity page should start with the recipe heading');
      assert(pageText.includes('{=food:apple-pie'), 'Recipe heading should include the focused subject');
      assert(pageText.includes('.schema:Recipe'), 'Recipe heading should include the recipe type');
      assert(pageText.includes('food:calories'), 'Entity page should include the nutrition property');
      assert(pageText.includes('food:classic-apple-pie'), 'Entity page should include the related recipe reference');
      assert(pageText.includes('?prov:qualifiedDerivation'), 'Entity page should include ingredient derivation links');
      assert(!pageText.includes('# isBasedOn'), 'Entity page should not include unrelated predicate pages');
      assert(!pageText.includes('# integer'), 'Entity page should not include unrelated datatype pages');

      const roundTripped = parse({
        text: pageText,
        context: generatedContext
      });

      const hasRecipeType = roundTripped.quads.some(q =>
        q.subject.value === focusIRI &&
        q.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        q.object.value === 'http://schema.org/Recipe'
      );
      assert(hasRecipeType, 'Parsed entity page should retain the schema:Recipe type on the recipe subject');

      const hasLabel = roundTripped.quads.some(q =>
        q.subject.value === focusIRI &&
        q.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#label' &&
        q.object.value === "Grandma's Apple Pie"
      );
      assert(hasLabel, 'Parsed entity page should retain the recipe label on the recipe subject');

      const hasCalories = roundTripped.quads.some(q =>
        q.subject.value === focusIRI &&
        q.predicate.value === 'tag:alice@example.com,2026:food/calories'
      );
      assert(hasCalories, 'Parsed entity page should retain the calories property on the recipe subject');
    }
  },
  {
    name: 'generateNode includes predicate uses for the focused predicate without extra groupings',
    fn: () => {
      const recipeText = fs.readFileSync(new URL('../examples/demo/recipe.md', import.meta.url), 'utf8');
      const { quads, context } = parse({ text: recipeText });
      const focusIRI = 'tag:alice@example.com,2026:food/calories';

      const { text: pageText } = generateNode({
        quads,
        focusIRI,
        context,
        compactInline: true,
        renderReverse: true
      });

      assert(pageText.length > 0, 'Predicate-focused page should include the predicate use');
      assert(pageText.includes('food:calories'), 'Predicate-focused page should show the predicate IRI in use');
      assert(pageText.includes('`320`'), 'Predicate-focused page should show the literal value used with the predicate');
      assert(pageText.includes('# apple-pie'), 'Predicate-focused page should use the subject of the predicate as the heading');
      assert(!pageText.includes('# calories'), 'Predicate-focused page should not use the predicate itself as the heading');
      assert(!pageText.includes('# isBasedOn'), 'Predicate-focused page should not create unrelated predicate groupings');
      assert(!pageText.includes('# integer'), 'Predicate-focused page should not create unrelated datatype groupings');
    }
  },
  {
    name: 'generateNode includes all literal uses for a focused datatype without synthetic datatype headings',
    fn: () => {
      const recipeText = fs.readFileSync(new URL('../examples/demo/recipe.md', import.meta.url), 'utf8');
      const { quads, context } = parse({ text: recipeText });
      const focusIRI = 'http://www.w3.org/2001/XMLSchema#integer';

      const { text: pageText } = generateNode({
        quads,
        focusIRI,
        context,
        compactInline: true,
        renderReverse: true
      });

      assert(pageText.length > 0, 'Datatype-focused page should include all integer literal uses');
      assert(pageText.includes('# apple-pie'), 'Datatype-focused page should group by the actual subject that used the datatype');
      assert(pageText.includes('food:calories ^^xsd:integer'), 'Datatype-focused page should render the full literal triple with the datatype');
      assert(pageText.includes('food:prepTime ^^xsd:integer'), 'Datatype-focused page should render multiple integer property uses');
      assert(!pageText.includes('# integer'), 'Datatype-focused page should not create a synthetic datatype heading');
    }
  }
];
