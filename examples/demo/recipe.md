[food] <tag:alice@example.com,2026:food/>
[schema] <https://schema.org/>

# Fluffy Pancakes {=food:pancakes .schema:Recipe .prov:Entity label}

> Egg-free pancakes built on **double-acting baking powder** — the leavener does the work eggs normally do, trapping CO₂ in a starch-and-protein matrix for an airy crumb. {comment}

This recipe exists to control four physical and chemical processes: **hydration & gelatinization** (water + coconut milk + flour), **gas generation & bubble stabilization** (baking powder + whisking), **gluten restraint** (minimal mixing + resting), and **Maillard browning** (sugar + cinnamon + oil + pan temperature). Every ingredient and step below serves one of them.

## Ingredients & Exact Measurements

*Yield: 8 to 10 medium pancakes.*

### Dry Ingredients

**Flour** {=food:flour .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#flour ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [180] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *all-purpose flour* {+food:flour ?prov:entity} — spooned and leveled; weighing beats scooping by 20–30 g.

**Baking powder** {=food:baking-powder .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#baking-powder ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [10] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *double-acting baking powder* {+food:baking-powder ?prov:entity} — the essential leavener; it releases CO₂ twice, on wetting and on heat.

**Sugar** {=food:sugar .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#sugar ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [25] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *granulated sugar* {+food:sugar ?prov:entity} — feeds browning without scorching.

**Salt** {=food:salt .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#salt ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2.5] {food:amount ^^xsd:decimal} [g] {+food:g ?food:unit} of *fine sea salt* {+food:salt ?prov:entity}.

**Cinnamon** {=food:cinnamon .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#cinnamon ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *ground cinnamon* {+food:cinnamon ?prov:entity} — fat-soluble aromatics that bloom in oil.

### Wet Ingredients

**Coconut milk** {=food:coconut-milk .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#coconut-milk ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [120] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *full-fat canned coconut milk* {+food:coconut-milk ?prov:entity}, well-stirred so cream and water unify.

**Water** {=food:water .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#water ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [120] {food:amount ^^xsd:integer} [ml] {+food:ml ?food:unit} of *room-temperature water* {+food:water ?prov:entity} — adjust ±15 ml for pour consistency.

**Oil** {=food:oil .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#oil ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [20] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *neutral oil* {+food:oil ?prov:entity} — plus a thin film for the pan.

**Lemon juice** {=food:lemon-juice .food:Ingredient label}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *optionally uses* {=#lemon-juice ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [5] {food:amount ^^xsd:integer} [ml] {+food:ml ?food:unit} of *lemon juice or vinegar* {+food:lemon-juice ?prov:entity} — the optional acid boost; lowers pH and subtly tenderizes gluten.

## Method of the recipe {=food:pancakes}

## 1 — Whisk the dry ingredients {=#step-dry .prov:Activity !prov:wasInformedBy label}

Combine [flour] {+#flour ?prov:used}, [baking powder] {+#baking-powder ?prov:used}, [sugar] {+#sugar ?prov:used}, [salt] {+#salt ?prov:used}, and [cinnamon] {+#cinnamon ?prov:used} in a bowl. 
> Combine dry ingredients. Whisk 20–30 seconds so the leavener disperses evenly — pockets of baking powder mean uneven rise. {comment}
Produces [Dry mix] {=#dry-mix .food:Mixture ?prov:generated label} derived from [flour] {+#flour ?prov:wasDerivedFrom}, [baking powder] {+#baking-powder ?prov:wasDerivedFrom}, [sugar] {+#sugar ?prov:wasDerivedFrom}, [salt] {+#salt ?prov:wasDerivedFrom}, and [cinnamon] {+#cinnamon ?prov:wasDerivedFrom}.

## 2 — Combine the wet ingredients {=#step-wet .prov:Activity label}

Follows [Whisk the dry ingredients] {=#step-dry ?prov:wasInformedBy}.

Stir [coconut milk] {+#coconut-milk ?prov:used}, [water] {+#water ?prov:used}, [oil] {+#oil ?prov:used}, and optionally [lemon juice] {+#lemon-juice ?prov:used}.
> Add the wet ingredients to the dry ingredients and mix until well combined. Whisk the can vigorously first if the cream has solidified. {comment}
Produces [Wet mix] {=#wet-mix .food:Mixture ?prov:generated label} derived from [coconut milk] {+#coconut-milk ?prov:wasDerivedFrom}, [water] {+#water ?prov:wasDerivedFrom}, and [oil] {+#oil ?prov:wasDerivedFrom}. 

## 3 — Fold wet into dry, barely {=#step-fold .prov:Activity label}

Follows [Combine the wet ingredients] {=#step-wet ?prov:wasInformedBy}.

Pour the [wet mix] {+#wet-mix ?prov:used} into the [dry mix] {+#dry-mix ?prov:used} and fold with a spatula until no dry pockets remain. Produces [Batter] {+#batter .food:Mixture ?prov:generated}.

> Pour the wet mix into the dry mix and fold with a spatula until no dry pockets remain — **expect a lumpy batter**; over-mixing builds gluten and makes tough pancakes. {comment}

## 4 — Rest the batter 10–15 minutes {=#step-rest .prov:Activity !prov:wasInformedBy label}

Cover and let the [batter] {+#batter ?prov:used} rest for 10–15 minutes. Produces [Rested batter] {+#rested-batter .food:Mixture ?prov:generated label}.

> Cover and let it sit: starch hydrates, gluten relaxes, and the baking powder begins its first gas release. Don't stir before cooking — you'll knock out trapped gas. {comment}

## 5 — Preheat the pan, oil lightly {=#step-pan .prov:Activity !prov:wasInformedBy label}

Put [oil] {+#oil ?prov:used} on the pan and heat it to prepare a [preheated pan] {+#preheated-pan .food:Cookware ?prov:generated label}.

> Heavy skillet over medium-low to medium heat (~165–175°C surface) for 3–5 minutes; wipe a thin oil film — too hot scorches sugar before the center sets. {comment}

## 6 — Portion and cook the first side {=#step-first .prov:Activity !prov:wasInformedBy label}

> Scoop ~50–60 ml per pancake; cook 2–3 minutes until bubbles pop leaving craters and the edge turns matte. {comment}

## 7 — Flip once, finish the second side {=#step-flip .prov:Activity !prov:wasInformedBy label}

> One smooth flip, 1–2 minutes until golden-brown and the center springs back. {comment}

## Troubleshooting

- **Dense, hockey-puck pancakes** — baking powder missing/expired, or batter over-stirred.
- **Dark outside, gummy inside** — pan too hot; drop heat, give each side more time.
- **Batter spreads like crepes** — too much liquid; whisk in 15–30 g more flour and rest 5 minutes.

======

## Vocabulary

The recipe's own vocabulary — `schema:Recipe` and `prov:*` are the borrowed prototypes; `food:*` is ours.

[food:Ingredient] {=food:Ingredient .Class label} is `something a recipe measures` {comment} — flour, milk, spice.
[food:Unit] {=food:Unit .Class label} is `a unit of measure` {comment} — grams, milliliters, counts.
[food:Mixture] {=food:Mixture .Class label} is `an intermediate the recipe produces` {comment} — batter, rested batter.
[food:Cookware] {=food:Cookware .Class label} is `equipment the recipe needs` {comment} — pans, whisks, scales.
[gram] {=food:g .food:Unit label}
[milliliter] {=food:ml .food:Unit label}

[amount] {=food:amount .rdf:Property label} is `the measured quantity` {comment} applies to [ingredient use] {+prov:Usage ?domain} and has type [integer] {+xsd:integer ?domain}.
[unit] {=food:unit .rdf:Property label} is `what the quantity is measured in` {comment} applies to [ingredient use] {+prov:Usage ?domain} and has type [food:Unit] {+food:Unit ?range}.

[used-by path] {=food:usedByPath}
[prov:used] {+prov:used ?sh:inversePath}.

[steps path] {=food:stepsPath}
[prov:wasInformedBy] {+prov:wasInformedBy ?sh:inversePath}.

## Recipe Shapes

A complete recipe is more than a list of ingredients — every amount is measurable, every step is ordered, and the whole thing is traceable back to its source.

# Ingredient Usage Shape {=food:UsageShape .sh:NodeShape label}

Every [ingredient use] {+prov:Usage ?sh:targetClass} declares an **amount** {+#useAmount ?sh:property sh:name}, a **unit** {+#useUnit ?sh:property sh:name}, and an **entity** {+#useEntity ?sh:property sh:name}, and is **used by** {+#useUsedBy ?sh:property sh:name} at least one step — an ingredient nobody cooks with is just shopping.

`Usage amount is required — {$focusNode} missing {$path}` {=#useAmount .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [amount] {+food:amount ?sh:path}.

`Usage unit is required — {$focusNode} missing {$path}` {=#useUnit .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [unit] {+food:unit ?sh:path}.

`Usage entity is required — {$focusNode} missing {$path}` {=#useEntity .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [entity] {+prov:entity ?sh:path}.

`Usage must be cooked — {$focusNode} missing {$path}` {=#useUsedBy .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [step using it] {+food:usedByPath ?sh:path}.

# Recipe Step Shape {=food:StepShape .sh:NodeShape label}

Every [step] {+prov:Activity ?sh:targetClass} has a **label** {+#stepLabel ?sh:property sh:name} and follows from a **previous** {+#stepPrev ?sh:property sh:name} — instructions without order aren't a method.

`Step label is required — {$focusNode} missing {$path}` {=#stepLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Step predecessor is required — {$focusNode} missing {$path}` {=#stepPrev .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [previous] {+prov:wasInformedBy ?sh:path}.

# Ingredient Shape {=food:IngredientShape .sh:NodeShape label}

Every [ingredient] {+food:Ingredient ?sh:targetClass} has a **label** {+#ingLabel ?sh:property sh:name} — a recipe component without a name isn't purchasable.

`Ingredient label is required — {$focusNode} missing {$path}` {=#ingLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

# Unit Shape {=food:UnitShape .sh:NodeShape label}

Every [unit] {+food:Unit ?sh:targetClass} has a **label** {+#unitLabel ?sh:property sh:name} — a unit without a name can't appear in a shopping list.

`Unit label is required — {$focusNode} missing {$path}` {=#unitLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

# Recipe Shape {=food:RecipeShape .sh:NodeShape label}

Every [recipe] {+schema:Recipe ?sh:targetClass} has a **label** {+#recipeLabel ?sh:property sh:name} and at least one **step** {+#recipeStep ?sh:property sh:name} that follows from it — a recipe with no method is just a shopping list.

`Recipe label is required — {$focusNode} missing {$path}` {=#recipeLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Recipe needs steps — {$focusNode} missing {$path}` {=#recipeStep .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [step] {+food:stepsPath ?sh:path}.
