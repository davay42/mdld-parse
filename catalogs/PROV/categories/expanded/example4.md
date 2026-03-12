[ex] <http://www.example.org#>
[foaf] <http://xmlns.com/foaf/0.1/>
[sioc] <http://rdfs.org/sioc/ns#>

# Reply to Derek and Monica {=ex:post19201 .Entity .Post}

> I'm not so sure that... {prov:value}

# Provenance

After some time, **John** {=ex:john .Agent .Person foaf:name}  *wrote* {+ex:publicationActivity1124 .Activity !prov:wasAttributedTo} his own conclusions in his own **post** {=ex:post19201 !prov:wasAttributedTo} quoting the previous two posts. 

Each quote that John makes (*quote_from_monica* {+ex:quote_from_monica ?prov:wasDerivedFrom} and *quote_from_derek* {+ex:quote_from_derek ?prov:wasDerivedFrom}) is a new entity derived from the previous blogs and is annotated with the time that the quote was taken.

The provenance of John's blog notes that his post is the result of the quotes that he took from Dereks **report** {=ex:more-crime-happens-in-cities}: *Analysis of the datasets demonstrates that there is more crime.* {=ex:quote_from_derek .Entity prov:value !prov:wasQuotedFrom} at *2012-08-08T01:01:01Z* {prov:generatedAtTime ^^xsd:dateTime}  and Monica: *In summary, there are clearly more crimes in the country.* {=ex:quote_from_monica .Entity prov:value} quoted from [her post] {+ex:post9822 ?prov:wasQuotedFrom} at *2012-08-08T02:02:02Z* {prov:generatedAtTime ^^xsd:dateTime}. 

The *blog post* {=ex:post19201} is also derived with the *tool* {+ex:postEditor ?prov:wasAttributedTo} from Derek's *aggregatedByRegions* {+ex:aggregatedByRegions ?prov:wasDerivedFrom} dataset because John *inspected* {+ex:publicationActivity1124 ?prov:wasGeneratedBy !prov:generated } it and found a concern that he discusses in his blog. All the provenance statements related to John's post are grouped in a new **prov:Bundle** {=ex:john-bundle.ttl .Bundle .Entity} by the *software editor* {+ex:postEditor ?prov:wasAttributedTo} at *2012-08-08T08:08:08Z* {prov:generatedAtTime ^^xsd:dateTime} thas is derived from *Derek's Bundle* {+ex:derek-bundle.ttl ?prov:wasDerivedFrom} and *Monica's Bundle* {+ex:monica-bundle.ttl ?prov:wasDerivedFrom}
