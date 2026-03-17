[food] <tag:alice@example.com,2026:food/>

## Apple Pie {=food:apple-pie .food:Recipe label}

Description: **Classic homemade apple pie** {comment}
Cooking time: **45** {food:cookTime ^^xsd:integer} minutes
Servings: **8** {food:recipeYield ^^xsd:integer}
Difficulty: **Medium** {food:difficulty}

Ingredients:

- Flour {+food:flour ?food:recipeIngredient .food:Ingredient label}
- Sugar {+food:sugar ?food:recipeIngredient .food:Ingredient label}
  Types:
  - White sugar {+food:sugar-white ?food:hasType .food:Sweetener label}
  - Brown sugar {+food:sugar-brown ?food:hasType .food:Sweetener label}
- Butter {+food:butter ?food:recipeIngredient .food:Ingredient label}
- Apples {+food:apples ?food:recipeIngredient .food:Ingredient label}
  Varieties:
  - Granny Smith {+food:apples-granny ?food:hasVariety .food:AppleType label}
  - Honeycrisp {+food:apples-honey ?food:hasVariety .food:AppleType label}
- Cinnamon {+food:cinnamon ?food:recipeIngredient .food:Ingredient label}

### Flour {=food:flour}
  Variants:
  - Whole wheat {+food:flour-whole ?food:hasVariant .food:FlourType label}
  - All-purpose {+food:flour-white ?food:hasVariant .food:FlourType label}

Equipment:

- Oven {+food:oven ?food:requiresEquipment .food:Equipment label}
  Features:
  - Convection {+food:oven-convection ?food:hasFeature .food:Feature label}
  - Temperature control {+food:oven-temp ?food:hasFeature .food:Feature label}
- Mixing bowl {+food:bowl ?food:requiresEquipment .food:Equipment label}
- Rolling pin {+food:pin ?food:requiresEquipment .food:Equipment label}

Calories: [1235] {food:calories ^^xsd:integer} calories
Sugar: [40.4] {food:sugarGrams ^^xsd:decimal} grams

Related recipes:

- Apple Crumble {+food:apple-crumble !food:variationOf .food:Recipe name}
- Peach Pie {+food:peach-pie !food:variationOf .food:Recipe name}
