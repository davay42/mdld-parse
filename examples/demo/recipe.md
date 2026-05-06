[food] <tag:alice@example.com,2026:food/>
[recipe] <http://schema.org/Recipe>

# Grandma's Apple Pie {=food:apple-pie .recipe:Recipe prov:Entity label}

Traditional family recipe passed down through generations.

Cuisine: [American] {food:cuisine}
Prep time: [45] {food:prepTime ^^xsd:integer} minutes
Cook time: [60] {food:cookTime ^^xsd:integer} minutes
Servings: [8] {food:servings ^^xsd:integer}
Difficulty: [Medium] {food:difficulty}

## Dry Ingredients

**Flour** {+food:flour .food:Ingredient ?prov:wasDerivedFrom label}
**Sugar** {+food:sugar .food:Ingredient ?food:hasIngredient label}
**Salt** {+food:salt .food:Ingredient ?food:hasIngredient label}

### Wet Ingredients

**Butter** {+food:butter .food:Ingredient ?food:hasIngredient label} 
**Eggs** {+food:eggs .food:Ingredient ?food:hasIngredient label}
**Vanilla** {+food:vanilla .food:Ingredient ?food:hasIngredient label}

### Filling Ingredients

**Apples** {+food:apples .food:Ingredient ?food:hasIngredient label}
**Cinnamon** {+food:cinnamon .food:Ingredient ?food:hasIngredient label}
**Lemon Juice** {+food:lemon-juice .food:Ingredient ?food:hasIngredient label}

## Preparation Steps {=food:preparation .prov:Activity label}

### Step 1: Crust {=food:step-crust .prov:Activity label}

Mixed dry ingredients: [flour] {+food:flour ?prov:used}, [sugar] {+food:sugar ?prov:used}, [salt] {+food:salt ?prov:used}. Cut in [cold butter] {+food:butter ?prov:used} until mixture resembles [coarse crumbs] {food:texture}. Form into [pie dish] {+food:pie-dish ?prov:used}.

### Step 2: Filling {=food:step-filling .prov:Activity label}

Toss [apples] {+food:apples ?prov:used} with [cinnamon] {+food:cinnamon ?prov:used} and [lemon juice] {+food:lemon-juice ?prov:used}. Let sit for [10] {food:restTime ^^xsd:integer} minutes.

### Step 3: Assembly {=food:step-assembly .prov:Activity label}

Add filling to crust. Cover with [top crust] {+food:top-crust .food:Ingredient ?prov:used}. Cut [vent holes] {+food:vents .food:Technique ?prov:used}.

### Step 4: Baking {=food:step-baking .prov:Activity label}

Bake at [375°F] {food:bakeTemp ^^xsd:integer} for [45-55] {food:bakeTime ^^xsd:integer} minutes until [golden brown] {food:color} and [bubbly] {food:texture}.

## Recipe Relationships

### Variation {=food:variation .prov:Entity label}

This recipe is a variation of [Classic Apple Pie] {+food:classic-apple-pie .recipe:Recipe ?food:variationOf}.

Also related: [Peach Pie] {+food:peach-pie .recipe:Recipe ?food:similarRecipe} and [Apple Crumble] {+food:apple-crumble .recipe:Recipe ?food:similarRecipe}.

## Nutrition Information {=food:nutrition .prov:Entity label}

Per serving:
- Calories: [320] {food:calories ^^xsd:integer}
- Fat: [14g] {food:fat ^^xsd:string}
- Carbohydrates: [42g] {food:carbs ^^xsd:string}
- Protein: [2g] {food:protein ^^xsd:string}

## Provenance

### Recipe Creation {=food:creation .prov:Activity label}

Created by: [Grandma Rose] {+food:grandma-rose .prov:Person ?prov:wasAssociatedWith}
Documented by: [Alice] {+food:alice .prov:Person ?prov:wasAssociatedWith}
Date: [2026-05-06] {prov:startedAtTime ^^xsd:date}
Used: [Family Recipe Book] {+food:recipe-book ?prov:used}

Generated: [Recipe Documentation] {+food:recipe-docs ?prov:generated}.

This demonstrates:
- Schema.org Recipe vocabulary
- Complex ingredient relationships
- Multi-step process with provenance
- Nutritional information
- Recipe variations and relationships



 - [2.5] {food:amount ^^xsd:decimal} cups
  - [1] {food:amount ^^xsd:decimal} cup
   - [0.5] {food:amount ^^xsd:decimal} tsp
- [1] {food:amount ^^xsd:decimal} cup, cold
 - [2] {food:amount ^^xsd:integer} large
  - [1] {food:amount ^^xsd:decimal} tsp

   - [6] {food:amount ^^xsd:integer} medium, peeled, sliced
    - [2] {food:amount ^^xsd:integer} tsp ground
     - [1] {food:amount ^^xsd:integer} tbsp