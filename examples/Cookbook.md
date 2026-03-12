[cook] <tag:me@example.com,2026:recipes:>

## Apple Pie {=cook:apple-pie .Recipe label}

Description: **Classic homemade apple pie** {comment}
Cooking time: **45** {cook:cookTime ^^xsd:integer} minutes
Servings: **8** {cook:recipeYield ^^xsd:integer}
Difficulty: **Medium** {cook:skill:difficulty}

Ingredients:

* Apples {+cook:apples ?cook:recipeIngredient .cook:Ingredient label}
* Sugar {+cook:sugar ?cook:recipeIngredient .cook:Ingredient label}
* Butter {+cook:butter ?cook:recipeIngredient .cook:Ingredient label}
* Flour {+cook:flour ?cook:recipeIngredient .cook:Ingredient label}
* Cinnamon {+cook:cinnamon ?cook:recipeIngredient .cook:Ingredient label}

_Ingredient_ {=cook:ingredient .Class label} - is a class for all ingredients in our **Cookbook** {!member +urn:collection:cookbook .Container label }.

Equipment:

* Oven {+cook:oven-1 ?cook:requiresEquipment .cook:Device}
* Mixing bowl {+cook:bowl-1 ?cook:requiresEquipment .cook:Utensil}
* Rolling pin {+cook:pin-1 ?cook:requiresEquipment .cook:Utensil}

Calories:  [1235] {cook:calories ^^xsd:integer} calories
Sugar: [40] {cook:sugarGrams ^^xsd:decimal} grams

Related recipes:

* Apple Crumble {+cook:apple-crumble !cook:variationOf .cook:Recipe}
* Peach Pie {+cook:peach-pie !cook:variationOf .cook:Recipe}
