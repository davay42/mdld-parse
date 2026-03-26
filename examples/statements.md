# MD-LD Elevated Statements Examples

This document demonstrates various use cases for elevated statements with PROV-O provenance tracking on level 1 and factual statements on level 2.

---

## Research Project Documentation

[my] <tag:research@example.com,2026:>
[prov] <http://www.w3.org/ns/prov#>
[foaf] <http://xmlns.com/foaf/0.1/>
[ex] <http://example.org/ontology/>
[xsd] <http://www.w3.org/2001/XMLSchema#>

### 2026-03-26T09:00:00Z {=my:research-project .prov:Activity prov:startedAtTime ^^xsd:dateTime}

I am leading a **Data Analysis** {=my:research-project .prov:Activity ex:projectType} about semantic web technologies.

#### Research Team {=my:team .prov:Collection}

Our team includes **Dr. Sarah Chen** {+my:sarah ?member .foaf:Person foaf:name} as the principal investigator, and **Mike Johnson** {+my:mike ?member .foaf:Person foaf:name} as the research assistant.

## Project Kickoff Meeting Documented {=my:kickoff-meeting .rdf:Statement}
**Dr. Chen** {+my:sarah ?rdf:subject} *led* {+prov:wasAssociatedWith ?rdf:predicate} **the kickoff meeting** {rdf:object} on March 26th.

## Team Formation Established {=my:team-formation .rdf:Statement}
**Our research project** {+my:research-project ?rdf:subject} *involved* {+prov:hadMember ?rdf:predicate} **Dr. Chen** {+my:sarah ?rdf:object} 

---

## Data Collection Phase

### 2026-03-26T10:30:00Z {=my:literature-review .prov:Activity prov:startedAtTime ^^xsd:dateTime}

We began reviewing existing literature on **"Semantic Web"** {+my:topic .ex:ResearchTopic ex:domain}.

#### Key Findings {=my:findings .prov:Entity}

The literature revealed **Limited provenance tracking in current systems** {+my:gap .ex:ResearchGap ex:description} in current provenance tracking systems.

## Literature Review Completed {=my:review-completed .rdf:Statement}
**Dr. Chen** {+my:sarah ?rdf:subject} *completed* {+prov:generated ?rdf:predicate} **the literature review** {+my:findings ?rdf:object}.

## Research Gap Identified {=my:gap-identified .rdf:Statement}
**Our literature review** {+my:findings ?rdf:subject} *identified* {+prov:identified ?rdf:predicate} **significant research gaps** {+my:gap ?rdf:object}.
