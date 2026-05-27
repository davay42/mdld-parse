[dcterms] <http://purl.org/dc/terms/>
[owl] <http://www.w3.org/2002/07/owl#>
[p-plan] <http://purl.org/net/p-plan#>
[vann] <http://purl.org/vocab/vann/>

# created {=dcterms:created .owl:AnnotationProperty}

# description {=dcterms:description .owl:AnnotationProperty}

# modified {=dcterms:modified .owl:AnnotationProperty}

# title {=dcterms:title .owl:AnnotationProperty}

#  {=p-plan: .owl:NamedIndividual .owl:Ontology .owl:Thing}
*2012-11-10* {dcterms:created ^^xsd:date}
[http://delicias.dia.fi.upm.es/members/DGarijo#me] {dcterms:creator ^^xsd:anyURI}
[http://www.isi.edu/~gil/] {dcterms:creator ^^xsd:anyURI}
[PROV extension for linking Plans and parts of plans to their respective executions.] {dcterms:description @en}
[http://creativecommons.org/licenses/by-nc-sa/2.0/] {dcterms:license}
*2013-05-17* {dcterms:modified ^^xsd:date}
[The P-Plan ontology] {dcterms:title @en}
[p-plan] {vann:preferredNamespacePrefix}
[http://purl.org/net/p-plan#] {vann:preferredNamespaceUri}
[PROV extension for linking Plans and parts of plans to their respective executions. Created by Daniel Garijo and Yolanda Gil] {comment}
[1.2] {owl:versionInfo}

# Activity {=p-plan:Activity .owl:Class label}
[A p-plan:Activity represents the execution process planned in a p-plan:Step] {comment}
[p-plan:] {+p-plan: ?isDefinedBy}
[prov:Activity] {+prov:Activity ?subClassOf}

# Bundle {=p-plan:Bundle .owl:Class label}
[A p-plan:Bundle is a specific type of prov:Bundle that contains the provenance assertions of the execution of a p-plan:Plan] {prov:definition}
[p-plan:] {+p-plan: ?isDefinedBy}
[prov:Bundle] {+prov:Bundle ?subClassOf}

# Entity {=p-plan:Entity .owl:Class label}
[a p-plan:Entity represents the input of the execution of a p-plan:Activity. It corresponds to a p-plan:Variable.] {prov:definition}
[p-plan:] {+p-plan: ?isDefinedBy}
[prov:Entity] {+prov:Entity ?subClassOf}

# Plan {=p-plan:Plan .owl:Class label}
[A p-plan:Plan is a specific type of prov:Plan. It is composed of smaller steps that use and produce Variables.] {prov:definition}
[p-plan:] {+p-plan: ?isDefinedBy}
[prov:Plan] {+prov:Plan ?subClassOf}

# Step {=p-plan:Step .owl:Class label}
[A p-plan:Step represents the planned execution activity] {prov:definition}
[p-plan:] {+p-plan: ?isDefinedBy}

# Variable {=p-plan:Variable .owl:Class label}
[A p-plan:Variable represents a description of the input of the planned Activity (p-plan:Step)] {prov:definition}
[p-plan:] {+p-plan: ?isDefinedBy}

# correspondsToStep {=p-plan:correspondsToStep .owl:FunctionalProperty .owl:ObjectProperty label @en}
[p-plan:correspondsToStep links a p-plan:Activity to its planned p-plan:Step] {prov:definition @en}
[Activity] {+p-plan:Activity ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Step] {+p-plan:Step ?range}

# correspondsToVariable {=p-plan:correspondsToVariable .owl:FunctionalProperty .owl:ObjectProperty label @en}
[p-plan:correspondsToVariable binds a p-plan:Entity (used by a p-plan:Activity in the execution of a plan) to the p-plan:Variable it represented it in the p-plan:Plan.] {prov:definition @en}
[Entity] {+p-plan:Entity ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Variable] {+p-plan:Variable ?range}

# hasInputVar {=p-plan:hasInputVar .owl:ObjectProperty label @en}
[p-plan:hasInputVar binds a p-plan:Step to the p-plan:Variable that takes as input for the planned execution] {prov:definition @en}
[Step] {+p-plan:Step ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Variable] {+p-plan:Variable ?range}

# hasOutputVar {=p-plan:hasOutputVar .owl:ObjectProperty label @en}
[p-plan:hasOutputVar binds a p-plan:Step to the p-plan:Variable that will be produced as output in the planned execution] {prov:definition @en}
[Step] {+p-plan:Step ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Variable] {+p-plan:Variable ?range}
[isOutputVarOf] {+p-plan:isOutputVarOf ?owl:inverseOf}

# isInputVarOf {=p-plan:isInputVarOf .owl:ObjectProperty label @en}
[p-plan:isInputVarOf links an input variable of a step to the step.] {prov:definition @en}
[Variable] {+p-plan:Variable ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Step] {+p-plan:Step ?range}
[hasInputVar] {+p-plan:hasInputVar ?owl:inverseOf}

# isOutputVarOf {=p-plan:isOutputVarOf .owl:FunctionalProperty .owl:ObjectProperty label @en}
[p-plan:isOutputVarOf is intended to link an output variable of a step to the step.] {prov:definition @en}
[Variable] {+p-plan:Variable ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Step] {+p-plan:Step ?range}

# isPreceededBy {=p-plan:isPreceededBy .owl:ObjectProperty .owl:TransitiveProperty label @en}
[Property that asserts which Step preceeds the current one. ] {isDefinedBy @en}
[p-plan:] {+p-plan: ?comment}
[Step] {+p-plan:Step ?domain}
[Step] {+p-plan:Step ?range}

# isStepOfPlan {=p-plan:isStepOfPlan .owl:ObjectProperty label @en}
[p-plan:isStepOfPlan links a p-plan:Step to the p-plan:Plan which it corresponds to.] {prov:definition @en}
[Step] {+p-plan:Step ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Plan] {+p-plan:Plan ?range}

# isVariableofPlan {=p-plan:isVariableOfPlan .owl:ObjectProperty label @en}
[p-plan:IsVariableOfPlan binds a p-plan:Variable to the p-plan:Plan it corresponds to.] {prov:definition @en}
[Variable] {+p-plan:Variable ?domain}
[p-plan:] {+p-plan: ?isDefinedBy}
[Plan] {+p-plan:Plan ?range}

# preferredNamespacePrefix {=vann:preferredNamespacePrefix .owl:AnnotationProperty}

# preferredNamespaceUri {=vann:preferredNamespaceUri .owl:AnnotationProperty}

# Activity {=prov:Activity .owl:Class}

# Bundle {=prov:Bundle .owl:Class}

# Entity {=prov:Entity .owl:Class}

# Plan {=prov:Plan .owl:Class}

# definition {=prov:definition .owl:AnnotationProperty}

