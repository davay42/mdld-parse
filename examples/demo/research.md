[research] <https://research.example.org/>
[pub] <https://research.example.org/publications/>
[data] <https://research.example.org/datasets/>

# Scientific Paper Analysis {=research:paper-2024 .research:Paper}

## Abstract
This paper analyzes <https://arxiv.org/abs/2301.07041> {?research:cites .research:Paper} 
and references <https://doi.org/10.1000/xyz123> {?research:hasVersion .research:Article}.

## Methodology

### ML Dataset {=data:ml-dataset .research:Dataset ?research:source}

Source: <https://github.com/user/repo> {?research:sourceUrl}

Dataset details:

- Training set {+data:ml-training ?research:hasDatasetDetail .research:DatasetDetail label}
- Test set {+data:ml-test ?research:hasDatasetDetail .research:DatasetDetail label}
- Validation set {+data:ml-validation ?research:hasDatasetDetail .research:DatasetDetail label}

### Kaggle Dataset {=data:kaggle-dataset .research:Dataset}

> Also used in the paper {!research:source +research:paper-2024}

Source: <https://kaggle.com/dataset123> {?research:sourceUrl}

Features:

- Image data {+data:kaggle-images ?research:hasFeature .research:ImageFeature label}
- Metadata {+data:kaggle-metadata ?research:hasFeature .research:MetadataFeature label}

### NASA Organization {=research:nasa .research:Organization}

Departments:

- Research division {+research:nasa-research ?research:hasDepartment .research:Department label}
- Data science lab {+research:nasa-ds ?research:hasDepartment .research:Department label}

### MIT Organization {=research:mit .research:Organization}

Labs:

- AI lab {+research:mit-ai ?research:hasLab .research:Lab label}
- Statistics lab {+research:mit-stats ?research:hasLab .research:Lab label}

## Results

Statistical significance: [p < 0.05] {research:significance}
Sample size: [1000] {research:sampleSize ^^xsd:inte
