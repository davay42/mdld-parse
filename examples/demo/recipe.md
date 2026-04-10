[food] <tag:alice@example.com,2026:food/>

## Apple Pie {=food:pie .prov:Entity label}

Grandma Rose's recipe, documented by Alice. Cook time: [45] {food:time ^^xsd:integer} min, serves [8] {food:serves ^^xsd:integer}.

**Ingredients**

Flour (cups): [2.5] {+#flour ?food:ingredient .food:Ingredient food:ammount ^^food:cup} - used in crust

Sugar (cups): [1] {+#sugar ?food:ingredient .food:Ingredient food:ammount ^^food:cup} used in filling  

Butter (cups): [1] {+#butter ?food:ingredient .food:Ingredient food:ammoun ^^food:cupt} used in crust

Apples: [6] {+#apples ?food:ingredient .food:Ingredient food:ammount ^^xsd:integer} used in filling

Cinnamon (tsp): [2] {+food:cinnamon ?food:ingredient .food:Ingredient ^^xsd:tsp} used in filling

**Process**

**Crust** {=food:crust .prov:Activity} mixed [flour] {+food:pie#flour ?prov:used} and [butter] {+food:pie#butter}, generated [dough] {+food:dough ?prov:generated}. Used [bowl] {+food:bowl ?prov:used}.

**Filling** {=food:filling .prov:Activity ?prov:wasInformedBy} prepared apples with sugar and cinnamon, generated [apple mix] {+food:mix ?prov:generated}.

**Baking** {=food:bake .prov:Activity ?prov:wasInformedBy} baked at 375°F for 45 min. Used [oven] {+food:oven ?prov:used}. Generated [baked pie] {+food:baked ?prov:generated}.

We got the **Pie** {=food:pie}

The final pie was derived from [dough] {+food:dough ?prov:wasDerivedFrom} and [apple mix] {+food:mix ?prov:wasDerivedFrom}.

**Related**: Apple Crumble {+food:crumble !food:variation .food:Recipe}, Peach Pie {+food:peach !food:variation .food:Recipe}
