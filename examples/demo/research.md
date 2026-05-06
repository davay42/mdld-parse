[research] <https://research.example.org/>
[data] <https://research.example.org/datasets/>
[prov] <http://www.w3.org/ns/prov#>
[sh] <http://www.w3.org/ns/shacl#>
[xsd] <http://www.w3.org/2001/XMLSchema#>

# Medical Imaging AI Research {=research:paper .prov:Entity label}

Deep learning analysis of attention mechanisms for medical diagnosis.

## Authors {=research:authors .prov:Entity label}

Research team with defined roles and contributions.

### Primary Author {=research:sarah-martinez .prov:Person label}
Name: [Dr. Sarah Martinez] {rdfs:label}
Email: [sarah.martinez@mit.edu] {research:email}
Role: [Lead Researcher] {research:role}
Contribution: [Methodology development] {research:contribution}

### Co-Author {=research:james-liu .prov:Person label}
Name: [Dr. James Liu] {rdfs:label}
Email: [james.liu@mit.edu] {research:email}
Role: [ML Engineer] {research:role}
Contribution: [Model implementation] {research:contribution}

## Research Activity {=research:research-activity .prov:Activity label}

Complete research lifecycle with proper provenance.

Started: [2024-01-01] {prov:startedAtTime ^^xsd:date}
Ended: [2024-03-15] {prov:endedAtTime ^^xsd:date}
Associated with: [Research Team] {+research:authors ?prov:wasAssociatedWith}
Plan: [Medical AI Research Plan] {+research:plan .prov:Plan ?prov:hadPlan}

## Dataset Collection {=research:dataset-collection .prov:Activity label}

Systematic dataset gathering and validation.

### Primary Dataset {=data:primary-dataset .research:Dataset label}
Source: [GitHub Medical Imaging Repository] {research:source}
Training samples: [80000] {data:trainCount ^^xsd:integer} DICOM images
Validation samples: [10000] {data:valCount ^^xsd:integer} DICOM images
Test samples: [10000] {data:testCount ^^xsd:integer} DICOM images
Classes: [15] {data:classCount ^^xsd:integer} anatomical structures

### Augmented Dataset {=data:augmented-dataset .research:Dataset label}
Derived from: [Primary Dataset] {+data:primary-dataset ?prov:wasDerivedFrom}
Resolution: [512x512] {data:resolution} grayscale
Features: [Patient metadata] {data:features}
Sample size: [1000] {data:patientCount ^^xsd:integer} patients

## Model Development {=research:model-development .prov:Activity label}

Training process with resource tracking.

Started: [2024-02-01] {prov:startedAtTime ^^xsd:date}
Ended: [2024-02-28] {prov:endedAtTime ^^xsd:date}
Used: [Primary Dataset] {+data:primary-dataset ?prov:used} and [Augmented Dataset] {+data:augmented-dataset ?prov:used}
Associated with: [Dr. James Liu] {+research:james-liu ?prov:wasAssociatedWith} as ML Engineer
Generated: [Trained Model] {+research:trained-model ?prov:generated}

## Model Evaluation {=research:evaluation .prov:Activity label}

Comprehensive testing with statistical validation.

Started: [2024-03-01] {prov:startedAtTime ^^xsd:date}
Used: [Trained Model] {+research:trained-model ?prov:used}
Generated: [Evaluation Results] {+research:eval-results ?prov:generated}

### Performance Metrics {=research:metrics .prov:Entity label}
Training accuracy: [94.5] {research:trainAcc ^^xsd:decimal}
Validation accuracy: [92.3] {research:valAcc ^^xsd:decimal}
Test accuracy: [91.8] {research:testAcc ^^xsd:decimal}
F1 score: [0.89] {research:f1 ^^xsd:decimal}
AUC-ROC: [0.93] {research:auc ^^xsd:decimal}
Statistical significance: [p < 0.05] {research:significance}
Sample size: [1000] {research:sampleSize ^^xsd:integer}

## SHACL Validation Shapes

### Paper Validation Shape {=research:PaperShape .sh:NodeShape label}

Ensures scientific papers meet academic standards. Targets all instances of [Paper] {+research:Paper ?sh:targetClass} to have a [title] {+#title ?sh:property sh:name}, [authors] {+#author ?sh:property sh:name} and  [citations] {+#citation ?sh:property sh:name}.

### Paper must have exactly one title. {=#title .sh:PropertyShape sh:message}
Path: [title] {+rdfs:label ?sh:path}
Required: [1] {sh:minCount sh:maxCount ^^xsd:integer}

## Paper must have at least one author. {=#author .sh:PropertyShape sh:message}
Path: [author] {+research:author ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

## Paper must have at least one citation. {=#citation .sh:PropertyShape sh:message}
Path: [citation] {+research:citation ?sh:path}
Required: [1] {sh:minCount ^^xsd:integer}

### Test Data

#### Valid Paper {=research:valid-paper .research:Paper label}
Title: [Medical Imaging AI Research] {rdfs:label}
Authors: [Dr. Sarah Martinez] {+research:sarah-martinez ?research:author}
Citations: [15] {research:citation ^^xsd:integer}

#### Invalid Paper {=research:invalid-paper .research:Paper label}
Title: [Untitled] {rdfs:label}
Authors: [] {research:citation}

## Funding and Provenance

### Funding Entity {=research:funding .prov:Entity label}
Grant: [NRA-2024-12345] {research:grantNumber}
Amount: [$500,000] {research:amount ^^xsd:decimal}
Source: [NASA Space Medicine] {+research:nasa ?prov:wasAttributedTo .prov:Organization}
Period: [2024-2026] {research:period}

### Publication Activity {=research:publication .prov:Activity label}
Published: [Medical Imaging AI Research] {+research:paper ?prov:used} in [Medical Journal] {+research:journal ?prov:wasGeneratedBy}
Date: [2024-04-15] {prov:startedAtTime ^^xsd:date}

This demonstrates:
- Complete PROV-O provenance chains
- Dataset management with XSD typing
- SHACL validation with self-documenting
- Academic research lifecycle
- Proper ontology integration
