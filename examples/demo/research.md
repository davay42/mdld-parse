[research] <https://research.example.org/>
[data] <https://research.example.org/datasets/>

# Medical Imaging AI Research {=research:paper .research:Paper label}

This paper explores how deep learning attention mechanisms can improve automated diagnosis from medical imaging data, covering the full arc from dataset assembly through model training to peer-reviewed publication. The author list is [Dr. Sarah Martinez](mailto:sarah.martinez@mit.edu) {+research:sarah-martinez ?research:author} and [Dr. James Liu](mailto:james.liu@mit.edu) {+research:james-liu ?research:author}; the work has accumulated [15] {research:citation ^^xsd:integer} citations.

## Authors {=research:authors .prov:Entity label}

[Dr. Sarah Martinez](mailto:sarah.martinez@mit.edu) {=research:sarah-martinez .prov:Person rdfs:label}
[sarah.martinez@mit.edu] {research:email}
The work was led by **[Dr. Sarah Martinez](mailto:sarah.martinez@mit.edu)** {research:email} at MIT, who served as [Lead Researcher] {research:role} and was responsible for [methodology development] {research:contribution}. Joining her was **[Dr. James Liu](mailto:james.liu@mit.edu)** {=research:james-liu .prov:Person rdfs:label research:email}, the team's [ML Engineer] {research:role}, who took charge of [model implementation] {research:contribution}.

## Research Activity {=research:research-activity .prov:Activity label}

The project ran from [2024-01-01] {prov:startedAtTime ^^xsd:date} through [2024-03-15] {prov:endedAtTime ^^xsd:date}, carried out by the [Research Team] {+research:authors ?prov:wasAssociatedWith} according to the [Medical AI Research Plan] {+research:plan .prov:Plan ?prov:hadPlan} they had drafted the previous autumn.

## Dataset Collection {=research:dataset-collection .prov:Activity label}

Assembling a dataset of sufficient quality and scale was the first major challenge. The [Research Team] {+research:authors ?prov:wasAssociatedWith} ran it from [2024-01-15] {prov:startedAtTime ^^xsd:date} through [2024-02-10] {prov:endedAtTime ^^xsd:date}.

### Primary Dataset {=data:primary-dataset .research:Dataset .prov:Entity label}

The team sourced [80000] {data:trainCount ^^xsd:integer} DICOM training images from the [GitHub Medical Imaging Repository] {research:source}, setting aside [10000] {data:valCount ^^xsd:integer} for validation and another [10000] {data:testCount ^^xsd:integer} for final testing. The images span [15] {data:classCount ^^xsd:integer} anatomical structures. It was assembled during the [dataset collection phase] {+research:dataset-collection ?prov:wasGeneratedBy}.

### Augmented Dataset {=data:augmented-dataset .research:Dataset .prov:Entity label}

Working from that [primary collection] {+data:primary-dataset ?prov:wasDerivedFrom}, the team produced a [512x512] {data:resolution} grayscale augmented set enriched with [patient metadata] {data:features}, covering [1,000] {data:patientCount ^^xsd:integer} individual patients to reduce demographic bias, keeping the same [80000] {data:trainCount ^^xsd:integer} train, [10000] {data:valCount ^^xsd:integer} validation, and [10000] {data:testCount ^^xsd:integer} test split as the source. This derived set was also [generated] {+research:dataset-collection ?prov:wasGeneratedBy} as part of the same collection activity.

## Model Development {=research:model-development .prov:Activity label}

Training ran through February — from [2024-02-01] {prov:startedAtTime ^^xsd:date} to [2024-02-28] {prov:endedAtTime ^^xsd:date}. [Dr. James Liu] {+research:james-liu ?prov:wasAssociatedWith} drove the implementation, feeding the model both the [raw] {+data:primary-dataset ?prov:used} and [augmented] {+data:augmented-dataset ?prov:used} datasets. The process produced a [trained model artifact] {+research:trained-model ?prov:generated} ready for evaluation.

## Model Evaluation {=research:evaluation .prov:Activity label}

Evaluation ran from [2024-03-01] {prov:startedAtTime ^^xsd:date} through [2024-03-15] {prov:endedAtTime ^^xsd:date}, driven by [Dr. James Liu] {+research:james-liu ?prov:wasAssociatedWith}. The [trained model] {+research:trained-model ?prov:used} was put through a comprehensive test suite that yielded the [evaluation results] {+research:eval-results ?prov:generated} reported below.

### Performance Metrics {=research:metrics .prov:Entity label}

The results were strong across the board. Training accuracy reached [94.5] {research:trainAcc ^^xsd:decimal}%, with validation holding at [92.3] {research:valAcc ^^xsd:decimal}% and the held-out test set at [91.8] {research:testAcc ^^xsd:decimal}%. The F1 score came in at [0.89] {research:f1 ^^xsd:decimal} and AUC-ROC at [0.93] {research:auc ^^xsd:decimal}, both statistically significant at [p < 0.05] {research:significance} across a sample of [12] {research:sampleSize ^^xsd:integer} patients — too small to be significant, flagged on purpose.

## Paper Reports Clinical Accuracy {=research:stmt-accuracy .rdf:Statement .prov:Entity label}

**The research paper** {+research:paper ?rdf:subject} *reports* {+research:testAcc ?rdf:predicate} **91.8% test accuracy** {+research:metrics ?rdf:object}.
Derived from: [Evaluation Results] {+research:eval-results ?prov:wasDerivedFrom}
Generated by: [Model Evaluation] {+research:evaluation ?prov:wasGeneratedBy}
Established: [2024-03-15T00:00:00Z] {prov:generatedAtTime ^^xsd:dateTime}

## Paper Was NASA-Funded {=research:stmt-publication .rdf:Statement .prov:Entity label}
**The research paper** {+research:paper ?rdf:subject} *was funded by* {+prov:wasAttributedTo ?rdf:predicate} **NASA Space Medicine** {+research:nasa ?rdf:object}.
Generated by: [Publication Activity] {+research:publication ?prov:wasGeneratedBy}
Derived from: [Research Activity] {+research:research-activity ?prov:wasDerivedFrom}
Established: [2024-04-15T00:00:00Z] {prov:generatedAtTime ^^xsd:dateTime}

## SHACL Validation Shapes

### Paper Validation Shape {=research:PaperShape .sh:NodeShape label}

To ensure the graph stays consistent, we defined a shape targeting every [Paper] {+research:Paper ?sh:targetClass} in the graph. Any paper must carry exactly [one title] {+#title ?sh:property sh:name}, at least [one author] {+#author ?sh:property sh:name}, and at least [one citation] {+#citation ?sh:property sh:name} — otherwise it isn't a complete scientific record.

### Paper must have exactly one title. {=#title .sh:PropertyShape sh:message}
The [rdfs:label] {+rdfs:label ?sh:path} property holds the title — exactly [1] {sh:minCount sh:maxCount ^^xsd:integer}.

## Paper must have at least one author. {=#author .sh:PropertyShape sh:message}
Every paper needs at least [1] {sh:minCount ^^xsd:integer} value on [author] {+research:author ?sh:path}.

## Paper must have at least one citation. {=#citation .sh:PropertyShape sh:message}
Same idea for citations: [citation] {+research:citation ?sh:path} must appear at least [1] {sh:minCount ^^xsd:integer} time.

### Test Data

#### Valid Paper {=research:valid-paper .research:Paper label}
This is **[Medical Imaging AI Research] {rdfs:label}**, authored by [Dr. Sarah Martinez] {+research:sarah-martinez ?research:author} and carrying [15] {research:citation ^^xsd:integer} citations — it should pass all three constraints cleanly.

#### Invalid Paper {=research:invalid-paper .research:Paper label}
This stub has a title of [Untitled] {rdfs:label} but no author and no citation value — [intentionally incomplete] {research:citation} to demonstrate what a violation looks like.

## Funding and Provenance

### Funding Entity {=research:funding .prov:Entity label}

The work was made possible by grant [NRA-2024-12345] {research:grantNumber}, a [$500,000] {research:amount ^^xsd:decimal} award from [NASA Space Medicine] {+research:nasa ?prov:wasAttributedTo .prov:Organization} running from [2024 to 2026] {research:period}.

### Publication Activity {=research:publication .prov:Activity label}

Submission ran [2024-04-15] {prov:startedAtTime ^^xsd:date} to [2024-04-28] {prov:endedAtTime ^^xsd:date} under [Dr. Sarah Martinez] {+research:sarah-martinez ?prov:wasAssociatedWith}; the team submitted [Medical Imaging AI Research] {+research:paper ?prov:used} and it was accepted by [Medical Journal] {+research:journal ?prov:wasGeneratedBy}. The funding, the data, the model, and the results all now have a complete provenance trail traceable through this document.

======

## Curation Shapes

These shapes state what a *complete* research graph looks like. Every violation below is a gap to fill — the shape is the spec, the violation is the TODO.

# Dataset Shape {=research:DatasetShape .sh:NodeShape label}

Every [dataset] {+research:Dataset ?sh:targetClass} declares its [train count] {+#dsTrain ?sh:property sh:name}, [validation count] {+#dsVal ?sh:property sh:name}, and [test count] {+#dsTest ?sh:property sh:name} — a dataset without a split isn't reproducible.

`Dataset train count is required — {$focusNode} missing {$path}` {=#dsTrain .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [train] {+data:trainCount ?sh:path} as [integer] {+xsd:integer ?sh:datatype}.

`Dataset validation count is required — {$focusNode} missing {$path}` {=#dsVal .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [validation] {+data:valCount ?sh:path} as [integer] {+xsd:integer ?sh:datatype}.

`Dataset test count is required — {$focusNode} missing {$path}` {=#dsTest .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [test] {+data:testCount ?sh:path} as [integer] {+xsd:integer ?sh:datatype}.

# Activity Shape {=research:ActivityShape .sh:NodeShape label}

Every [activity] {+prov:Activity ?sh:targetClass} has a **start** {+#actStart ?sh:property sh:name}, an **end** {+#actEnd ?sh:property sh:name}, and an **agent** {+#actAgent ?sh:property sh:name} — work without time bounds or ownership isn't trackable.

`Activity start is required — {$focusNode} missing {$path}` {=#actStart .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [start] {+prov:startedAtTime ?sh:path}.

`Activity end is required — {$focusNode} missing {$path}` {=#actEnd .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [end] {+prov:endedAtTime ?sh:path}.

`Activity agent is required — {$focusNode} missing {$path}` {=#actAgent .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [agent] {+prov:wasAssociatedWith ?sh:path}.

# Person Shape {=research:PersonShape .sh:NodeShape label}

Every [person] {+prov:Person ?sh:targetClass} has a **label** {+#personLabel ?sh:property sh:name} and an **email** {+#personEmail ?sh:property sh:name} — an uncontactable author isn't an author.

`Person label is required — {$focusNode} missing {$path}` {=#personLabel .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [label] {+rdfs:label ?sh:path}.

`Person email is required — {$focusNode} missing {$path}` {=#personEmail .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [email] {+research:email ?sh:path}.

# Metrics Shape {=research:MetricsShape .sh:NodeShape label}

[The metrics] {+research:metrics ?sh:targetNode} report **train accuracy** {+#mTrain ?sh:property sh:name}, **validation accuracy** {+#mVal ?sh:property sh:name}, **test accuracy** {+#mTest ?sh:property sh:name}, **F1** {+#mF1 ?sh:property sh:name}, **AUC-ROC** {+#mAuc ?sh:property sh:name}, **significance** {+#mSig ?sh:property sh:name}, and **sample size** {+#mN ?sh:property sh:name}.

`Metrics train — {$focusNode}` {=#mTrain .sh:PropertyShape sh:name} reads our [train accuracy] {+research:trainAcc ?sh:path}. Valid range: [0] {sh:minInclusive ^^xsd:decimal} to [100] {sh:maxInclusive ^^xsd:decimal} [Out of clinical range — {$focusNode} {$path} = {$value}] {sh:message}.

`Metrics validation — {$focusNode}` {=#mVal .sh:PropertyShape sh:name} reads our [validation accuracy] {+research:valAcc ?sh:path}. Valid range: [0] {sh:minInclusive ^^xsd:decimal} to [100] {sh:maxInclusive ^^xsd:decimal} [Out of clinical range — {$focusNode} {$path} = {$value}] {sh:message}.

`Metrics test — {$focusNode}` {=#mTest .sh:PropertyShape sh:name} reads our [test accuracy] {+research:testAcc ?sh:path}. Valid range: [0] {sh:minInclusive ^^xsd:decimal} to [100] {sh:maxInclusive ^^xsd:decimal} [Out of clinical range — {$focusNode} {$path} = {$value}] {sh:message}.

`Metrics F1 — {$focusNode}` {=#mF1 .sh:PropertyShape sh:name} reads our [F1] {+research:f1 ?sh:path}. Valid range: [0] {sh:minInclusive ^^xsd:decimal} to [1] {sh:maxInclusive ^^xsd:decimal} [Out of clinical range — {$focusNode} {$path} = {$value}] {sh:message}.

`Metrics AUC — {$focusNode}` {=#mAuc .sh:PropertyShape sh:name} reads our [AUC-ROC] {+research:auc ?sh:path}. Valid range: [0] {sh:minInclusive ^^xsd:decimal} to [1] {sh:maxInclusive ^^xsd:decimal} [Out of clinical range — {$focusNode} {$path} = {$value}] {sh:message}.

`Metrics significance — {$focusNode}` {=#mSig .sh:PropertyShape sh:name} reads our [significance] {+research:significance ?sh:path}.

`Metrics sample — {$focusNode}` {=#mN .sh:PropertyShape sh:name} reads our [sample size] {+research:sampleSize ?sh:path}. Valid range: at least [30] {sh:minInclusive ^^xsd:integer} patients. [Out of clinical range — {$focusNode} {$path} = {$value}] {sh:message}

# Funding Shape {=research:FundingShape .sh:NodeShape label}

[The grant] {+research:funding ?sh:targetNode} records its **number** {+#fundNumber ?sh:property sh:name}, **amount** {+#fundAmount ?sh:property sh:name}, **period** {+#fundPeriod ?sh:property sh:name}, and **funder** {+#fundFunder ?sh:property sh:name} — money without provenance isn't funding.

`Funding number — {$focusNode}` {=#fundNumber .sh:PropertyShape sh:name} reads our [grant number] {+research:grantNumber ?sh:path}.

`Funding amount — {$focusNode}` {=#fundAmount .sh:PropertyShape sh:name} reads our [amount] {+research:amount ?sh:path}.

`Funding period — {$focusNode}` {=#fundPeriod .sh:PropertyShape sh:name} reads our [period] {+research:period ?sh:path}.

`Funding funder — {$focusNode}` {=#fundFunder .sh:PropertyShape sh:name} reads our [funder] {+research:nasa ?sh:path} — the organization attributed.

# Statement Shape {=research:StatementShape .sh:NodeShape label}

Every [statement] {+rdf:Statement ?sh:targetClass} — a reified claim — carries **subject** {+#stmtSub ?sh:property sh:name}, **predicate** {+#stmtPred ?sh:property sh:name}, and **object** {+#stmtObj ?sh:property sh:name} plus its own **label** {+#stmtLabel ?sh:property sh:name}.

`Statement subject is required — {$focusNode} missing {$path}` {=#stmtSub .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [subject] {+rdf:subject ?sh:path}.

`Statement predicate is required — {$focusNode} missing {$path}` {=#stmtPred .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [predicate] {+rdf:predicate ?sh:path}.

`Statement object is required — {$focusNode} missing {$path}` {=#stmtObj .sh:PropertyShape sh:message} expects at least [1] {sh:minCount ^^xsd:integer} [object] {+rdf:object ?sh:path}.

`Statement label — {$focusNode}` {=#stmtLabel .sh:PropertyShape sh:name} reads our [label] {+rdfs:label ?sh:path}.
