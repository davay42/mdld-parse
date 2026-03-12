[ex] <http://example.org/>
[foaf] <http://xmlns.com/foaf/0.1/>

# Work report

## Entities

### Aggregated data {=ex:aggregatedByRegions .prov:Entity}

Created by [Derek] {+ex:derek ?prov:wasAttributedTo} via the [aggregation] {+ex:aggregationActivity ?prov:wasGeneratedBy}

### Bar Chart {=ex:bar_chart .prov:Entity}

Created by [Derek] {+ex:derek ?prov:wasAttributedTo} based on [aggregatedByRegions] {+ex:aggregatedByRegions ?prov:wasDerivedFrom} via [illustrationActivity] {+ex:illustrationActivity ?prov:wasGeneratedBy}

## Activities

### Aggregation {=ex:aggregationActivity .prov:Activity}

[2011-07-14T02:02:02Z] {prov:endedAtTime ^^xsd:dateTime}
[2011-07-14T01:01:01Z] {prov:startedAtTime ^^xsd:dateTime}

Done by [Derek] {+ex:derek ?prov:wasAssociatedWith} using [Crime data] {+ex:crimeData ?prov:used} and the [National Regions List] {+ex:nationalRegionsList ?prov:used} to create the report.

### Illustration {=ex:illustrationActivity .prov:Activity}

Performed by [derek] {+ex:derek ?prov:wasAssociatedWith} using the  [Report] {+ex:aggregatedByRegions ?prov:used} after the [Aggregation] {+ex:aggregationActivity ?prov:wasInformedBy}

## Sources

### Crime Data {=ex:crimeData .prov:Entity}

Coming from official [Government] {+ex:government ?prov:wasAttributedTo} source.

### National Regions List {=ex:nationalRegionsList .prov:Entity}

Provided by [CAG] {+ex:civil_action_group ?prov:wasAttributedTo}

## Agents

### Derek {=ex:derek .prov:Agent .prov:Person foaf:givenName}

[National Newspaper] {+ex:natonal_newspaper_inc ?prov:actedOnBehalfOf}
[<derek@example.org>] {+mailto:<derek@example.org> ?foaf:mbox}

### Government {=ex:government .prov:Agent .prov:Organization}

### Civil Action Group {=ex:civil_action_group .prov:Agent .prov:Organization foaf:name}

### National Newspaper Inc. {=ex:national_newspaper_inc .prov:Agent .prov:Organization foaf:name}
