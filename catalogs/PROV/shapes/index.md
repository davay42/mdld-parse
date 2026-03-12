[mdp] <https://mdld.js.org/prov/>
[owl] <http://www.w3.org/2002/07/owl#>

## Lists Shape {=mdp:shape:list .sh:NodeShape label}

This shape keeps lists grounded in original ttl data - any missed IRI would trigger a violation.

[Object] {+owl:ObjectProperty ?sh:targetClass} and [Datatype] {+owl:DatatypeProperty ?sh:targetClass} properties lists in the catalog are validated.

**Listed Rule** {=mdp:rule:listed .sh:propertyShape ?sh:property} checks for it to have [listed] {+mdp:listed ?sh:path} at least once [1] {sh:minCount}  - this is *informational* {+sh:Info ?sh:severity} constrain to keep the list integrity: **List integrity violation** {sh:message}
