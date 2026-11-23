[food] <tag:alice@example.com,2026:food/>
[schema] <https://schema.org/>

# Fluffy Pancakes {=food:pancakes .schema:Recipe .prov:Entity label}

> Egg-free pancakes built on **double-acting baking powder** — the leavener does the work eggs normally do, trapping CO₂ in a starch-and-protein matrix for an airy crumb. {comment}

This recipe exists to control four physical and chemical processes: **hydration & gelatinization** (water + coconut milk + flour), **gas generation & bubble stabilization** (baking powder + whisking), **gluten restraint** (minimal mixing + resting), and **Maillard browning** (sugar + cinnamon + oil + pan temperature). Every ingredient and step below serves one of them.

## Ingredients & Exact Measurements

*Yield: 8 to 10 medium pancakes.*

### Dry Ingredients

**Flour** {=food:flour}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#flour ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [180] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *all-purpose flour* {+food:flour ?prov:entity} — spooned and leveled; weighing beats scooping by 20–30 g.

**Baking powder** {=food:baking-powder}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#baking-powder ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [10] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *double-acting baking powder* {+food:baking-powder ?prov:entity} — the essential leavener; it releases CO₂ twice, on wetting and on heat.

**Sugar** {=food:sugar}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#sugar ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [25] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *granulated sugar* {+food:sugar ?prov:entity} — feeds browning without scorching.

**Salt** {=food:salt}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#salt ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2.5] {food:amount ^^xsd:decimal} [g] {+food:g ?food:unit} of *fine sea salt* {+food:salt ?prov:entity}.

**Cinnamon** {=food:cinnamon}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#cinnamon ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [2] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *ground cinnamon* {+food:cinnamon ?prov:entity} — fat-soluble aromatics that bloom in oil.

### Wet Ingredients

**Coconut milk** {=food:coconut-milk}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#coconut-milk ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [120] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *full-fat canned coconut milk* {+food:coconut-milk ?prov:entity}, well-stirred so cream and water unify.

**Water** {=food:water}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#water ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [120] {food:amount ^^xsd:integer} [ml] {+food:ml ?food:unit} of *room-temperature water* {+food:water ?prov:entity} — adjust ±15 ml for pour consistency.

**Oil** {=food:oil}: [Pancakes] {=food:pancakes !prov:wasDerivedFrom} *uses* {=#oil ?prov:qualifiedDerivation .prov:Derivation .prov:Usage} [20] {food:amount ^^xsd:integer} [g] {+food:g ?food:unit} of *neutral oil* {+food:oil ?prov:entity} — plus a thin film for the pan.

**Optional acid boost:** [5] {food:amount ^^xsd:integer} [ml] {+food:ml ?food:unit} of *lemon juice or vinegar* {+food:lemon-juice ?prov:entity} lowers pH and subtly tenderizes gluten — pro tip, not core.

## Method of the recipe {=food:pancakes}

## 1 — Whisk the dry ingredients {=#step-dry .prov:Activity !prov:wasInformedBy label}

> Combine flour, baking powder, sugar, salt, and cinnamon in a bowl. Whisk 20–30 seconds so the leavener disperses evenly — pockets of baking powder mean uneven rise. {comment}

## 2 — Combine the wet ingredients {=#step-wet .prov:Activity !prov:wasInformedBy label}

> Stir coconut milk, water, and oil until blended; whisk the can vigorously first if the cream has solidified. {comment}

## 3 — Fold wet into dry, barely {=#step-fold .prov:Activity !prov:wasInformedBy label}

> Pour wet into dry and fold with a spatula until no dry pockets remain — **expect a lumpy batter**; over-mixing builds gluten and makes tough pancakes. {comment}

## 4 — Rest the batter 10–15 minutes {=#step-rest .prov:Activity !prov:wasInformedBy label}

> Cover and let it sit: starch hydrates, gluten relaxes, and the baking powder begins its first gas release. Don't stir before cooking — you'll knock out trapped gas. {comment}

## 5 — Preheat the pan, oil lightly {=#step-pan .prov:Activity !prov:wasInformedBy label}

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

## Recipe Shapes

A complete recipe is more than a list of ingredients — every amount is measurable, every step is ordered, and the whole thing is traceable back to its source.

# Ingredient Usage Shape {=food:UsageShape .sh:NodeShape label}

Every [ingredient use] {+prov:Usage ?sh:targetClass} declares an **amount** {+#useAmount ?sh:property sh:name}, a **unit** {+#useUnit ?sh:property sh:name}, and an **entity** {+#useEntity ?sh:property sh:name} — "some flour" isn't a recipe, "180 g of flour" is.

`Usage amount is required — {$focusNode} missing {$path}` {=#useAmount .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [amount] {+food:amount ?sh:path}.

`Usage unit is required — {$focusNode} missing {$path}` {=#useUnit .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [unit] {+food:unit ?sh:path}.

`Usage entity is required — {$focusNode} missing {$path}` {=#useEntity .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [entity] {+prov:entity ?sh:path}.

# Recipe Step Shape {=food:StepShape .sh:NodeShape label}

Every [step] {+prov:Activity ?sh:targetClass} has a **label** {+#stepLabel ?sh:property sh:name} and follows from a **previous** {+#stepPrev ?sh:property sh:name} — instructions without order aren't a method.

`Step label is required — {$focusNode} missing {$path}` {=#stepLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Step predecessor is required — {$focusNode} missing {$path}` {=#stepPrev .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [previous] {+prov:wasInformedBy ?sh:path}.
