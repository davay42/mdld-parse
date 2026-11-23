[my] <tag:alice@example.com,2026:catalog/>
[schema] <https://schema.org/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Catalog Ledger {=my:catalog .prov:Entity label}

> The inventory office's ledger — every field is typed because downstream systems do math on it. {comment}

The catalog tracks what we sell and what customers order. Prices are decimals, weights are decimals, stock is boolean, and every date is a real XSD temporal type — because `"$79.99"` is a string that happens to look like money, while `79.99` is money.

## Product: Wireless Headphones {=my:headphones .schema:Product .prov:Entity label}

Our flagship audio product. SKU [WH-1000] {my:sku}, priced at [79.99] {my:price ^^xsd:decimal}, weighing [0.25] {my:weight ^^xsd:decimal} kilograms. Currently [true] {my:inStock ^^xsd:boolean} — released [2026-06-15] {my:releaseDate ^^xsd:date}, last catalogued [2026-05-06T09:15:00Z] {my:lastUpdated ^^xsd:dateTime}.

Multilingual description for our storefront: [Wireless over-ear headphones] {my:description @en}, [Auriculares inalámbricos] {my:description @es}, [Casque sans fil] {my:description @fr}.

## Order: ORD-2026-0542 {=my:order-0542 .my:Order .prov:Activity label}

Placed on [2026-05-06] {my:orderDate ^^xsd:date} for a total of [158.97] {my:totalAmount ^^xsd:decimal}. Priority shipping is [false] {my:priorityShipping ^^xsd:boolean}; estimated delivery [2026-05-08T14:00:00Z] {my:estimatedDelivery ^^xsd:dateTime}.

The order activity ran [02:45:00] {my:processingTime ^^xsd:time} from start to confirmation, part of a project window lasting [P1Y2M3DT4H30M] {my:projectDuration ^^xsd:duration}.

## Draft: Mystery Gadget {=my:mystery-gadget .schema:Product .prov:Entity label}

A product page staged for review — SKU [MG-0001] {my:sku}, weight [0.5] {my:weight ^^xsd:decimal}, but the price field was imported from a spreadsheet as text: ["79.99"] {my:price} — no decimal datatype, just a string that looks numeric. Flagged for cleanup before publishing.

======

## Vocabulary

[schema:Product] {=schema:Product .Class label} is `a sellable item` {comment} — borrowed from schema.org as our prototype.
[my:Order] {=my:Order .Class label} is `a customer purchase` {comment} — a kind of [activity] {+prov:Activity ?subClassOf}.

[sku] {=my:sku .rdf:Property label} is `stock-keeping unit` {comment}.
[price] {=my:price .rdf:Property label} is `cost in USD` {comment}.
[weight] {=my:weight .rdf:Property label} is `mass in kilograms` {comment}.
[in-stock] {=my:inStock .rdf:Property label} is `available to order` {comment}.
[release-date] {=my:releaseDate .rdf:Property label} is `when the product launched` {comment}.
[last-updated] {=my:lastUpdated .rdf:Property label} is `when the catalog entry last changed` {comment}.
[description] {=my:description .rdf:Property label} is `storefront copy, language-tagged` {comment}.
[order-date] {=my:orderDate .rdf:Property label} is `when the order was placed` {comment}.
[total-amount] {=my:totalAmount .rdf:Property label} is `order total in USD` {comment}.
[priority-shipping] {=my:priorityShipping .rdf:Property label} is `expedited delivery flag` {comment}.
[estimated-delivery] {=my:estimatedDelivery .rdf:Property label} is `promised arrival` {comment}.
[processing-time] {=my:processingTime .rdf:Property label} is `how long fulfillment took` {comment}.
[project-duration] {=my:projectDuration .rdf:Property label} is `the catalog project's elapsed window` {comment}.

======

## Catalog Shapes

Datatype constraints are how the ledger stays honest — a price that isn't `xsd:decimal` isn't a price, it's text wearing a price's clothes.

# Product Shape {=my:ProductShape .sh:NodeShape label}

Every [product] {+schema:Product ?sh:targetClass} has a **label** {+#prodLabel ?sh:property sh:name}, a **price** {+#prodPrice ?sh:property sh:name} that is a real decimal, a **weight** {+#prodWeight ?sh:property sh:name}, an **in-stock flag** {+#prodStock ?sh:property sh:name}, and a **release date** {+#prodRelease ?sh:property sh:name}.

`Product label is required — {$focusNode} missing {$path}` {=#prodLabel .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Product price must be decimal — {$focusNode} {$path} is {$value}` {=#prodPrice .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [price] {+my:price ?sh:path} as [decimal] {+xsd:decimal ?sh:datatype}, and at least [0] {sh:minInclusive ^^xsd:decimal}.

`Product weight must be decimal — {$focusNode} {$path} is {$value}` {=#prodWeight .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [weight] {+my:weight ?sh:path} as [decimal] {+xsd:decimal ?sh:datatype}.

`Product stock flag must be boolean — {$focusNode} {$path} is {$value}` {=#prodStock .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [in-stock] {+my:inStock ?sh:path} as [boolean] {+xsd:boolean ?sh:datatype}.

`Product release must be a date — {$focusNode} {$path} is {$value}` {=#prodRelease .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [release] {+my:releaseDate ?sh:path} as [date] {+xsd:date ?sh:datatype}.

# Order Shape {=my:OrderShape .sh:NodeShape label}

Every [order] {+my:Order ?sh:targetClass} has an **order date** {+#ordDate ?sh:property sh:name}, a **total** {+#ordTotal ?sh:property sh:name} that is decimal, and an **estimated delivery** {+#ordDelivery ?sh:property sh:name} that is a real dateTime.

`Order date must be a date — {$focusNode} {$path} is {$value}` {=#ordDate .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [order-date] {+my:orderDate ?sh:path} as [date] {+xsd:date ?sh:datatype}.

`Order total must be decimal — {$focusNode} {$path} is {$value}` {=#ordTotal .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [total] {+my:totalAmount ?sh:path} as [decimal] {+xsd:decimal ?sh:datatype}, and at least [0] {sh:minInclusive ^^xsd:decimal}.

`Order delivery must be a dateTime — {$focusNode} {$path} is {$value}` {=#ordDelivery .sh:PropertyShape sh:message} expects exactly [1] {sh:minCount sh:maxCount ^^xsd:integer} [delivery] {+my:estimatedDelivery ?sh:path} as [dateTime] {+xsd:dateTime ?sh:datatype}.
