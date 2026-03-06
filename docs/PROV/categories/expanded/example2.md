[ex] <http://www.example.org#>
[foaf] <http://xmlns.com/foaf/0.1/>
[sioc] <http://rdfs.org/sioc/ns#>

#  More crime happens in cities {=ex:post9821v1 .Entity .Post sioc:title label}

> I was currius... {prov:value}

# Provenance

Agent **Derek** {=ex:derek .Agent .Person foaf:givenName} ([derek@example.org] {+mailto:derek@example.org ?foaf:mbox}), acting again on behalf of the **National Newspaper, Inc.** {+ex:national_newspaper_inc ?prov:actedOnBehalfOf foaf:name} organization, used the **Post Editor 3000** {=ex:postEditor .Agent .SoftwareAgent foaf:name} tool to publish a post about his recent data analysis **Crime aggregated by regions** {=ex:aggregatedByRegions .Entity} stored at **aggr.txt** {+file://Users/aggr.txt .Location ?prov:atLocation} based on **Crime Data** {=ex:crimeData .Entity ?prov:used} coming from *government* {+ex:government .Agent .Organization ?prov:wasAttributedTo}.

The blog editing *tool* {=ex:postEditor} tracked Derek's actions as PROV-O assertions and published them as a Bundle (the current file **derek-bundle.ttl** {=ex:derek-bundle.ttl .Bundle .Entity ?prov:wasAttributedTo}) at *2011-07-16T02:52:02Z* {prov:generatedAtTime ^^xsd:dateTime}. The tool recorded that **Derek** {=ex:derek} started at *2011-07-16T01:52:02Z* {prov:endedAtTime ^^xsd:dateTime} and ended at *2011-07-16T01:01:01Z* {prov:startedAtTime ^^xsd:dateTime} the **publishing activity** {=ex:publicationActivity1123 !prov:wasEndedBy !prov:wasStartedBy} that used the **aggregation** {+ex:aggregatedByRegions ?prov:wasInfluencedBy} of **crime data** {+ex:crimeData ?prov:hadPrimarySource} to *generate* {+ex:postEditor ?prov:wasAssociatedWith} the post **More crime happens in cities** {=ex:post9821v1 ?prov:generated !prov:wasGeneratedBy} at *2011-07-16T01:52:02Z* {prov:generatedAtTime ^^xsd:dateTime}. Was later invalidated by new version at *2011-07-16T02:02:02Z* {prov:invalidatedAtTime ^^xsd:dateTime}

The post included a permanent link where the content of the **latest version** {+ex:more-crime-happens-in-cities ?prov:specializationOf !sioc:previous_version} is available in addition to a textual snapshot of the current version (using prov:value). Derek also included additional domain-specific descriptions of the post, such as its title.

## Typo update

Shortly after publishing the post, Derek noticed a typographical error in his narrative. Because the fix would be minimal, he did not record the activity that led to the new version. Instead, he related the **new version** {=ex:post9821v2 .Entity .Post} generated at *2011-07-16T02:02:02Z* {prov:generatedAtTime ^^xsd:dateTime} as a revision of the **previous** {+ex:post9821v1 ?prov:wasRevisionOf ?prov:alternateOf}. Since both versions of the blog are forms of the long-standing blog permalink, the revisions are alternates of one another and each is a prov:specializationOf of **More Crime In Cities** {+ex:more-crime-happens-in-cities ?prov:specializationOf !sioc:latest_version}.

> I was curious...  {prov:value}