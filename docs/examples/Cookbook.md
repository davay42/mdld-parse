## Apple Pie {=urn:recipe:apple-pie .Recipe name}

Description: **Classic homemade apple pie** {description}
Cooking time: **45** {cookTime ^^xsd:integer} minutes
Servings: **8** {recipeYield ^^xsd:integer}
Difficulty: **Medium** {urn:skill:difficulty}

Ingredients: {recipeIngredient .urn:food:ingredient}

* Apples {=urn:food:apples .urn:food:ingredient name}
* Sugar {=urn:food:sugar .urn:food:ingredient name}
* Butter {=urn:food:butter .urn:food:ingredient name}
* Flour {=urn:food:flour .urn:food:ingredient name}
* Cinnamon {=urn:food:cinnamon .urn:food:ingredient name}

_Ingredient_ {=?urn:food:ingredient .Class name} - is a class for all ingredients in our **Cookbook** {=?urn:collection:cookbook .Collection name ?isPartOf}.

Equipment: {urn:requiresEquipment}

* Oven {=urn:kitchen:oven-1 .Device name}
* Mixing bowl {=urn:kitchen:bowl-1 .Utensil name}
* Rolling pin {=urn:kitchen:pin-1 .Utensil name}

Calories:  [1235] {urn:nutrition:calories ^^xsd:integer} calories
Sugar: [40] {urn:nutrition:sugarGrams ^^xsd:decimal} grams

Related recipes: {^?urn:class:variationOf .Recipe}

* Apple Crumble {=urn:recipe:apple-crumble .Recipe name}
* Peach Pie {=urn:recipe:peach-pie .Recipe name}
