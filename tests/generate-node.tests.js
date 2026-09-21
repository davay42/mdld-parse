import fs from 'node:fs';
import { parse, generateNode } from '../src/index.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const recipeText = `[food] <tag:alice@example.com,2026:food/>
[schema] <http://schema.org/>

# Grandma's Apple Pie {=food:apple-pie .schema:Recipe .prov:Entity label}

> Delicious apple pie as gradma used to make it autumn. {comment}

This is a [American] {food:cuisine} family recipe that Grandma Rose has been making since the 1960s. It takes about [45] {food:prepTime ^^xsd:integer} minutes to prepare and [55] {food:cookTime ^^xsd:integer} minutes to bake, making [8] {food:servings ^^xsd:integer} generous slices. It's a variation of [Classic Apple Pie] {+food:classic-apple-pie .schema:Recipe ?schema:isBasedOn label} — her version adds more cinnamon and uses a butter crust rather than shortening. You might also like [Peach Pie] {+food:peach-pie .schema:Recipe ?food:similarRecipe label} or [Apple Crumble] {+food:apple-crumble .schema:Recipe ?food:similarRecipe label} if you want something in the same family.

Per serving this comes in at around [320] {food:calories ^^xsd:integer} calories, [14g] {food:fat} fat, [42g] {food:carbs} carbs, and [2g] {food:protein} protein.

## Ingredients

### Crust

**Flour** {=food:flour}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *includes* {=#flour ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2.5] {food:amount ^^xsd:decimal} [cups] {+food:cup ?food:unit} of *flour* {+food:flour ?prov:entity}.

**Butter** {=food:butter}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *includes* {=#butter ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [1] {food:amount ^^xsd:decimal} [cup] {+food:cup ?food:unit} of *cold* {food:temperature} *butter* {+food:butter ?prov:entity}.

**Eggs** {=food:salt}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *is made with* {=#eggs ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2] {food:amount ^^xsd:integer} *eggs* {+food:egg ?prov:entity}.

**Sugar** {=food:sugar}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *is made with* {=#sugar ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [1] {food:amount ^^xsd:decimal} [cup] {+food:cup ?food:unit} of *butter* {+food:sugar ?prov:entity}.

**Salt** {=food:salt}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *is made with* {=#salt ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [0.5] {food:amount ^^xsd:decimal} [tsp] {+food:tsp ?food:unit} of *salt* {+food:salt ?prov:entity}.

**Vanilla** {=food:vanilla}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *is made with* {=#vanilla ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [1] {food:amount ^^xsd:decimal} [tsp] {+food:tsp ?food:unit} of *vanilla* {+food:vanilla ?prov:entity}.

### Filling

**Apples** {=food:apples}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *includes* {=#apples ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [6] {food:amount ^^xsd:integer} medium *apples* {+food:apple ?prov:entity}, peeled and sliced.

**Cinnamon** {=food:cinnamon}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *is seasoned with* {=#cinnamon ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2] {food:amount ^^xsd:integer} [tsp] {+food:tsp ?food:unit} ground *cinnamon* {+food:cinnamon ?prov:entity}.

**Lemon Juice** {=food:lemon-juice}: [Pie] {=food:apple-pie !prov:wasDerivedFrom} *is seasoned with* {=#lemon-juice ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [1] {food:amount ^^xsd:integer} [tbsp] {+food:tbsp ?food:unit} *lemon juice* {+food:lemon-juice ?prov:entity}.

## Making the Crust {=#step-crust .prov:Activity label}

Mix [flour] {+#flour ?prov:qualifiedUsage}, [sugar] {+#sugar ?prov:qualifiedUsage}, and [salt] {+#salt ?prov:qualifiedUsage} together, then cut in [cold butter] {+#butter ?prov:qualifiedUsage} until the mixture looks like coarse crumbs. Press into your [pie dish] {+food:pie-dish .food:Equipment ?prov:used label} and set aside. This produces the [unbaked crust] {+#unbaked-crust .prov:Entity ?prov:generated label}.

## Making the Filling {=#step-filling .prov:Activity ?prov:wasInformedBy label}

Toss [apples] {+#apples ?prov:qualifiedUsage} with [cinnamon] {+#cinnamon ?prov:qualifiedUsage} and [lemon juice] {+#lemon-juice ?prov:qualifiedUsage}. Let it sit for [10] {food:restTime ^^xsd:integer} minutes so the flavours start to meld — you'll see some juice pool at the bottom, that's what makes it bubbly in the oven. This gives you the [spiced filling] {+#spiced-filling .prov:Entity ?prov:generated label}.

## Assembly and Baking {=#step-baking .prov:Activity ?prov:wasInformedBy label}

Spoon the [spiced filling] {+#spiced-filling ?prov:used} into the [unbaked crust] {+#unbaked-crust ?prov:used}, cover with a [top crust] {+#top-crust ?prov:used label}, and cut a few vent holes so steam can escape. Bake at [375] {food:bakeTempF ^^xsd:integer}°F for [50] {food:bakeTimeMin ^^xsd:integer} minutes until [golden brown] {food:color}. This produces the [finished pie] {+#finished-pie .prov:Entity ?prov:generated label}.

## How This Recipe Came to Be {=#creation .prov:Activity ?prov:wasInformedBy label}

[Grandma Rose] {+food:grandma-rose .prov:Person ?prov:wasAssociatedWith label} developed this version over many years, working from the [Family Recipe Book] {+food:recipe-book .prov:Entity ?prov:used label} she brought from her childhood home. [Alice] {+food:alice .prov:Person ?prov:wasAssociatedWith label} wrote it down on [2026-05-06] {prov:endedAtTime ^^xsd:date} to make sure it wouldn't be lost, producing this [recipe documentation] {+#recipe-docs .prov:Entity ?prov:generated label}.`

export const generateNodeTests = [
  {
    name: 'generateNode renders a correct recipe entity page from the recipe graph',
    fn: () => {
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
