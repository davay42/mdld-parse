[research] <https://research.example.org/>
[data] <https://research.example.org/datasets/>

# Machine Learning in Healthcare {=research:paper .prov:Entity label}

**Authors**: Dr. Sarah Martinez and Dr. James Liu, MIT CS Lab.

**Abstract**

This paper analyzes attention-based neural networks for medical imaging, citing prior work on deep learning in radiology.

**Methodology**

**Dataset** {=data:dataset .research:Dataset}
Source: GitHub medical imaging repository
Training: [80k] {+data:train ?research:detail .research:DatasetDetail} DICOM images, 15 classes
Validation: [10k] {+data:val ?research:detail .research:DatasetDetail} DICOM images
Test: [10k] {+data:test ?research:detail .research:DatasetDetail} DICOM images

**Kaggle Dataset** {=data:kaggle .research:Dataset} derived from primary dataset, featuring 512x512 grayscale images with patient metadata.

**Model Training** {=research:training .prov:Activity}
Duration: Feb 1-15, 2024
Association: Dr. James Liu as ML Engineer
Plan: Training protocol v2.0
Used: ML Dataset and Kaggle Dataset
Generated: [trained model] {+research:model ?prov:generated}

**Results**

Statistical significance: p < 0.05, sample size: [1000] {research:n ^^xsd:integer} patients.

**Accuracy Metrics** {=research:metrics .prov:Entity}
Training: [94.5%] {research:trainAcc}
Validation: [92.3%] {research:valAcc}
Test: [91.8%] {research:testAcc}
F1: [0.89] {research:f1 ^^xsd:decimal}
AUC-ROC: [0.93] {research:auc ^^xsd:decimal}

**SHACL Validation** {=research:shape .sh:NodeShape}
Target: Scientific Paper
Title: exactly 1 required
Author: at least 1 required
Citations: at least 1 required

**Funding**: NASA Space Medicine Research Initiative, grant NRA-2024-12345.
