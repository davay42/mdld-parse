[ex] <http://www.example.org#>
[foaf] <http://xmlns.com/foaf/0.1/>
[sioc] <http://rdfs.org/sioc/ns#>

# More crime happens in cities (for dummies) {=ex:post9822 .Entity .Post sioc:title}

> A quick overview of Derek's... {prov:value}

# Provenance

Shortly after Derek published his blog post, **Monica**  {=ex:monica .Agent .Person foaf:givenName} (<monica@example.org> {+mailto:monica@example.org ?foaf:mbox}) adapted the text for a wider audience in a **new post** {=ex:post9822}. This rewrite is an *alternate* {+ex:more-crime-happens-in-cities ?prov:alternateOf}, abbreviated view of the same topic that Derek wrote about and was created from his **original text** {=ex:derek-bundle.ttl}. Since the provenance produced by the activities of Derek and Monica corresponded to different user views, the system automatically published it in a **different prov:Bundle** {=ex:monica-bundle.ttl .Bundle .Entity !prov:wasDerivedFrom} at *2011-07-16T03:03:03Z* {prov:generatedAtTime ^^xsd:dateTime}. The *tool*  {=ex:postEditor ?prov:wasAttributedTo} also asserted *provenance* {=ex:post9822 !prov:wasAttributedTo} about the bundle that it produced (e.g., the date of creation, its **creator** {+ex:monica ?prov:wasAttributedTo}, and the fact that it Derek's bundle was *used* {+ex:post9821v2 ?prov:wasRevisionOf}). Because a bundle is a kind of entity, all provenance assertions that can be made about entities can also be made about bundles. The use of bundles enables the creation of provenance of provenance. 