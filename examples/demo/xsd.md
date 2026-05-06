[xsd] <http://www.w3.org/2001/XMLSchema#>
[my] <tag:alice@example.com,2026:>

# XSD Datatypes Demo {=my:xsd-demo .prov:Entity label}

Demonstrates proper use of XSD datatypes in MD-LD annotations.

## String Datatypes

### Plain String
Title: [Data Types Demo] {my:title}

### Language-Tagged String
Description: [This example shows language tagging] {my:description @en}
Description: [Este ejemplo muestra etiquetado de idioma] {my:description @es}
Description: [Cet exemple montre l'étiquetage de langue] {my:description @fr}

## Numeric Datatypes

### Integer
Count: [42] {my:count ^^xsd:integer}
Year: [2026] {my:year ^^xsd:gYear}
Month: [5] {my:month ^^xsd:gMonth}
Day: [6] {my:day ^^xsd:gDay}

### Decimal
Price: [19.99] {my:price ^^xsd:decimal}
Percentage: [87.5] {my:percentage ^^xsd:decimal}
Ratio: [3.14159] {my:ratio ^^xsd:decimal}

## Temporal Datatypes

### Date
Created: [2026-05-06] {my:created ^^xsd:date}
Birthday: [1990-12-25] {my:birthday ^^xsd:date}

### DateTime
Started: [2026-05-06T14:30:00Z] {my:startedAt ^^xsd:dateTime}
Deadline: [2026-12-31T23:59:59Z] {my:deadline ^^xsd:dateTime}

### Time
Meeting time: [09:30:00] {my:meetingTime ^^xsd:time}
Duration: [02:45:00] {my:duration ^^xsd:time}

### Duration
Project duration: [P1Y2M3DT4H30M] {my:projectDuration ^^xsd:duration}
Sprint length: [P2W] {my:sprintLength ^^xsd:duration}

## Boolean and Binary

### Boolean
Active: [true] {my:isActive ^^xsd:boolean}
Completed: [false] {my:isCompleted ^^xsd:boolean}
Available: [1] {my:isAvailable ^^xsd:boolean}

## Specialized Types

### URI/IRI
Website: [https://example.com] {my:website}
Identifier: [urn:isbn:978-3-16-148410-0] {my:isbn}

### Base64 Binary
Avatar data: [SGVsbG8gdG8gdGVuIGRhdGE=] {my:avatar ^^xsd:base64Binary}

## Real-World Example

### Product Catalog Entry {=my:product .prov:Entity label}

Name: [Wireless Headphones] {my:title}
SKU: [WH-1000] {my:sku ^^xsd:string}
Price: [$79.99] {my:price ^^xsd:decimal}
Weight: [0.25] {my:weight ^^xsd:decimal}
In stock: [true] {my:inStock ^^xsd:boolean}
Release date: [2026-06-15] {my:releaseDate ^^xsd:date}
Last updated: [2026-05-06T09:15:00Z] {my:lastUpdated ^^xsd:dateTime}

### Customer Order {=my:order .prov:Activity label}

Order ID: [ORD-2026-0542] {my:orderId ^^xsd:string}
Order date: [2026-05-06] {my:orderDate ^^xsd:date}
Total amount: [158.97] {my:totalAmount ^^xsd:decimal}
Priority shipping: [false] {my:priorityShipping ^^xsd:boolean}
Estimated delivery: [2026-05-08T14:00:00Z] {my:estimatedDelivery ^^xsd:dateTime}

This demonstrates comprehensive XSD datatype usage for:
- Text with language tags
- Various numeric formats
- Complete temporal coverage
- Boolean flags
- Specialized binary/URI types
- Real-world business scenarios
