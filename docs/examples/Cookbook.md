## Apple Pie {=urn:recipe:apple-pie .Recipe name}

Description: **Classic homemade apple pie** {description}
Cooking time: **45** {cookTime ^^xsd:integer} minutes
Servings: **8** {recipeYield ^^xsd:integer}
Difficulty: **Medium** {urn:skill:difficulty}

Ingredients: {?recipeIngredient .Ingredient name}

* Apples {=urn:food:apples}
* Sugar {=urn:food:sugar}
* Butter {=urn:food:butter}
* Flour {=urn:food:flour}
* Cinnamon {=urn:food:cinnamon}

_Ingredient_ {+urn:food:ingredient .Class name} - is a class for all ingredients in our **Cookbook** {+urn:collection:cookbook .Collection name ?isPartOf}.

Equipment: {?urn:requiresEquipment name}

* Oven {=urn:kitchen:oven-1 .Device }
* Mixing bowl {=urn:kitchen:bowl-1 .Utensil}
* Rolling pin {=urn:kitchen:pin-1 .Utensil}

Calories:  [1235] {urn:nutrition:calories ^^xsd:integer} calories
Sugar: [40] {urn:nutrition:sugarGrams ^^xsd:decimal} grams

Related recipes: {!urn:class:variationOf .Recipe name}

* Apple Crumble {=urn:recipe:apple-crumble .Recipe }
* Peach Pie {=urn:recipe:peach-pie .Recipe}
