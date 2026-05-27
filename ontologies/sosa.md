[dcterms] <http://purl.org/dc/terms/>
[foaf] <http://xmlns.com/foaf/0.1/>
[owl] <http://www.w3.org/2002/07/owl#>
[schema] <http://schema.org/>
[skos] <http://www.w3.org/2004/02/skos/core#>
[sosa] <http://www.w3.org/ns/sosa/>
[time] <http://www.w3.org/2006/time#>
[vann] <http://purl.org/vocab/vann/>
[voaf] <http://purl.org/vocommons/voaf#>

# created {=dcterms:created .owl:AnnotationProperty}

# creator {=dcterms:creator .owl:AnnotationProperty}

# description {=dcterms:description .owl:AnnotationProperty}

# license {=dcterms:license .owl:AnnotationProperty}

# rights {=dcterms:rights .owl:AnnotationProperty}

# title {=dcterms:title .owl:AnnotationProperty}

# preferredNamespacePrefix {=vann:preferredNamespacePrefix .owl:AnnotationProperty}

# preferredNamespaceUri {=vann:preferredNamespaceUri .owl:AnnotationProperty}

# Vocabulary {=voaf:Vocabulary .owl:Class}

# domainIncludes {=schema:domainIncludes .owl:AnnotationProperty}

# rangeIncludes {=schema:rangeIncludes .owl:AnnotationProperty}

# definition {=skos:definition .owl:AnnotationProperty}

# example {=skos:example .owl:AnnotationProperty}

# note {=skos:note .owl:AnnotationProperty}

# TemporalEntity {=time:TemporalEntity .owl:Class}

#  {=sosa: .owl:Ontology .voaf:Vocabulary}
*2017-04-17* {dcterms:created ^^xsd:date}
[This ontology is based on the SSN Ontology by the W3C Semantic Sensor Networks Incubator Group (SSN-XG), together with considerations from the W3C/OGC Spatial Data on the Web Working Group.] {dcterms:description @en}
[Copyright 2017 W3C/OGC.] {dcterms:rights}
[Sensor, Observation, Sample, and Actuator (SOSA) Ontology] {dcterms:title @en}
[sosa] {vann:preferredNamespacePrefix}
[http://www.w3.org/ns/sosa/] {vann:preferredNamespaceUri}
[http://www.opengeospatial.org/ogc/Software] {+http://www.opengeospatial.org/ogc/Software ?dcterms:license}
[http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document] {+http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document ?dcterms:license}

# Actuatable Property {=sosa:ActuatableProperty .Class .owl:Class label @en}
[An actuatable quality (property, characteristic) of a FeatureOfInterest.] {comment @en}
[An actuatable quality (property, characteristic) of a FeatureOfInterest.] {skos:definition @en}
[A window actuator acts by changing the state between a frame and a window. The ability of the window to be opened and closed is its ActuatableProperty.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Actuation {=sosa:Actuation .Class .owl:Class label @en}
[An Actuation carries out an (Actuation) Procedure to change the state of the world using an Actuator.] {comment @en}
[An Actuation carries out an (Actuation) Procedure to change the state of the world using an Actuator.] {skos:definition @en}
[The activity of automatically closing a window if the temperature in a room drops below 20 degree Celsius. The activity is the Actuation and the device that closes the window is the Actuator. The Procedure is the rule, plan, or specification that defines the conditions that triggers the Actuation, here a drop in temperature. ] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Actuator {=sosa:Actuator .Class .owl:Class label @en}
[A device that is used by, or implements, an (Actuation) Procedure that changes the state of the world.] {comment @en}
[A device that is used by, or implements, an (Actuation) Procedure that changes the state of the world.] {skos:definition @en}
[A window actuator for automatic window control, i.e., opening or closing the window.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Feature Of Interest {=sosa:FeatureOfInterest .Class .owl:Class label @en}
[The thing whose property is being estimated or calculated in the course of an Observation to arrive at a Result or whose property is being manipulated by an Actuator, or which is being sampled or transformed in an act of Sampling.] {comment @en}
[The thing whose property is being estimated or calculated in the course of an Observation to arrive at a Result or whose property is being manipulated by an Actuator, or which is being sampled or transformed in an act of Sampling.] {skos:definition @en}
[When measuring the height of a tree, the height is the observed ObservableProperty, 20m may be the Result of the Observation, and the tree is the FeatureOfInterest. A window is a FeatureOfInterest for an automatic window control Actuator.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Observable Property {=sosa:ObservableProperty .Class .owl:Class label @en}
[An observable quality (property, characteristic) of a FeatureOfInterest.] {comment @en}
[An observable quality (property, characteristic) of a FeatureOfInterest.] {skos:definition @en}
[The height of a tree, the depth of a water body, or the temperature of a surface are examples of observable properties, while the value of a classic car is not (directly) observable but asserted.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Observation {=sosa:Observation .Class .owl:Class label @en}
[Act of carrying out an (Observation) Procedure to estimate or calculate a value of a property of a FeatureOfInterest. Links to a Sensor to describe what made the Observation and how; links to an ObservableProperty to describe what the result is an estimate of, and to a FeatureOfInterest to detail what that property was associated with.] {comment @en}
[Act of carrying out an (Observation) Procedure to estimate or calculate a value of a property of a FeatureOfInterest. Links to a Sensor to describe what made the Observation and how; links to an ObservableProperty to describe what the result is an estimate of, and to a FeatureOfInterest to detail what that property was associated with.] {skos:definition @en}
[The activity of estimating the intensity of an Earthquake using the Mercalli intensity scale is an Observation as is measuring the moment magnitude, i.e., the energy released by said earthquake.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Platform {=sosa:Platform .Class .owl:Class label @en}
[A Platform is an entity that hosts other entities, particularly Sensors, Actuators, Samplers, and other Platforms.] {comment @en}
[A Platform is an entity that hosts other entities, particularly Sensors, Actuators, Samplers, and other Platforms.] {skos:definition @en}
[A post, buoy, vehicle, ship, aircraft, satellite, cell-phone, human or animal may act as platforms for (technical or biological) sensors or actuators.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Procedure {=sosa:Procedure .Class .owl:Class label @en}
[A workflow, protocol, plan, algorithm, or computational method specifying how to make an Observation, create a Sample, or make a change to the state of the world (via an Actuator). A Procedure is re-usable, and might be involved in many Observations, Samplings, or Actuations. It explains the steps to be carried out to arrive at reproducible results.] {comment @en}
[A workflow, protocol, plan, algorithm, or computational method specifying how to make an Observation, create a Sample, or make a change to the state of the world (via an Actuator). A Procedure is re-usable, and might be involved in many Observations, Samplings, or Actuations. It explains the steps to be carried out to arrive at reproducible results.] {skos:definition @en}
[The measured wind speed differs depending on the height of the sensor above the surface, e.g., due to friction. Consequently, procedures for measuring wind speed define a standard height for anemometers above ground, typically 10m for meteorological measures and 2m in Agrometeorology. This definition of height, sensor placement, and so forth are defined by the Procedure.] {skos:example @en}
[Many observations may be created via the same Procedure, the same way as many tables are assembled using the same instructions (as information objects, not their concrete realization).] {skos:note @en}
[sosa:] {+sosa: ?isDefinedBy}

# Result {=sosa:Result .Class .owl:Class label @en}
[The Result of an Observation, Actuation, or act of Sampling. To store an observation's simple result value one can use the hasSimpleResult property.] {comment @en}
[The Result of an Observation, Actuation, or act of Sampling. To store an observation's simple result value one can use the hasSimpleResult property.] {skos:definition @en}
[The value 20 as the height of a certain tree together with the unit, e.g., Meter.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Sample {=sosa:Sample .Class .owl:Class label @en}
[A Sample is the result from an act of Sampling.] {comment @en}
[Feature which is intended to be representative of a FeatureOfInterest on which Observations may be made.] {comment @en}
[Physical samples are sometimes known as 'specimens'.] {comment @en}
~~~ {comment @en}
Samples are artifacts of an observational strategy, and have no significant function outside of their role in the observation process. The characteristics of the samples themselves are of little interest, except perhaps to the manager of a sampling campaign.

A Sample is intended to sample some FatureOfInterest, so there is an expectation of at least one isSampleOf property. However, in some cases the identity, and even the exact type, of the sampled feature may not be known when observations are made using the sampling features.
~~~

[Feature which is intended to be representative of a FeatureOfInterest on which Observations may be made.] {skos:definition @en}
[A 'station' is essentially an identifiable locality where a sensor system or Procedure may be deployed and an observation made. In the context of the observation model, it connotes the 'world in the vicinity of the station', so the observed properties relate to the physical medium at the station, and not to any physical artifact such as a mooring, buoy, benchmark, monument, well, etc.] {skos:example @en}
[A statistical sample is often designed to be characteristic of an entire population, so that observations can be made regarding the sample that provide a good estimate of the properties of the population.] {skos:example @en}
[A transient sample, such as a ships-track or flight-line, might be identified and described, but is unlikely to be revisited exactly.] {skos:note @en}
[sosa:] {+sosa: ?isDefinedBy}

# Sampler {=sosa:Sampler .Class .owl:Class label @en}
[A device that is used by, or implements, a Sampling Procedure to create or transform one or more samples.] {comment @en}
[A device that is used by, or implements, a Sampling Procedure to create or transform one or more samples.] {skos:definition @en}
[A ball mill, diamond drill, hammer, hypodermic syringe and needle, image Sensor or a soil auger can all act as sampling devices (i.e., be Samplers). However, sometimes the distinction between the Sampler and the Sensor is not evident, as they are packaged as a unit. A Sampler need not be a physical device.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Sampling {=sosa:Sampling .Class .owl:Class label @en}
[An act of Sampling carries out a sampling Procedure to create or transform one or more samples.] {comment @en}
[An act of Sampling carries out a sampling Procedure to create or transform one or more samples.] {skos:definition @en}
[Crushing a rock sample in a ball mill.] {skos:example @en}
[Digging a pit through a soil sequence.] {skos:example @en}
[Dividing a field site into quadrants.] {skos:example @en}
[Drawing blood from a patient.] {skos:example @en}
[Drilling an observation well.] {skos:example @en}
[Establishing a station for environmental monitoring.] {skos:example @en}
[Registering an image of the landscape.] {skos:example @en}
[Selecting a subset of a population.] {skos:example @en}
[Sieving a powder to separate the subset finer than 100-mesh.] {skos:example @en}
[Splitting a piece of drill-core to create two new samples.] {skos:example @en}
[Taking a diamond-drill core from a rock outcrop.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# Sensor {=sosa:Sensor .Class .owl:Class label @en}
[Device, agent (including humans), or software (simulation) involved in, or implementing, a Procedure. Sensors respond to a stimulus, e.g., a change in the environment, or input data composed from the results of prior Observations, and generate a Result. Sensors can be hosted by Platforms.] {comment @en}
[Device, agent (including humans), or software (simulation) involved in, or implementing, a Procedure. Sensors respond to a stimulus, e.g., a change in the environment, or input data composed from the results of prior Observations, and generate a Result. Sensors can be hosted by Platforms.] {skos:definition @en}
[Accelerometers, gyroscopes, barometers, magnetometers, and so forth are Sensors that are typically mounted on a modern smart phone (which acts as Platform). Other examples of sensors include the human eyes.] {skos:example @en}
[sosa:] {+sosa: ?isDefinedBy}

# acts on property {=sosa:actsOnProperty .owl:ObjectProperty label @en}
[Relation between an Actuation and the property of a FeatureOfInterest it is acting upon.] {comment @en}
[Relation between an Actuation and the property of a FeatureOfInterest it is acting upon.] {skos:definition @en}
[In the activity (Actuation) of automatically closing a window if the temperature in a room drops below 20 degrees Celsius, the property on which the Actuator acts upon is the state of the window as it changes from being open to being closed. ] {skos:example @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Actuatable Property] {+sosa:ActuatableProperty ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[is acted on by] {+sosa:isActedOnBy ?owl:inverseOf}

# has feature of interest {=sosa:hasFeatureOfInterest .owl:ObjectProperty label @en}
[A relation between an Observation and the entity whose quality was observed, or between an Actuation and the entity whose property was modified, or between an act of Sampling and the entity that was sampled.] {comment @en}
[A relation between an Observation and the entity whose quality was observed, or between an Actuation and the entity whose property was modified, or between an act of Sampling and the entity that was sampled.] {skos:definition @en}
[For example, in an Observation of the weight of a person, the FeatureOfInterest is the person and the property is its weight.] {skos:example @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[Feature Of Interest] {+sosa:FeatureOfInterest ?schema:rangeIncludes}
[Sample] {+sosa:Sample ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[is feature of interest of] {+sosa:isFeatureOfInterestOf ?owl:inverseOf}

# has result {=sosa:hasResult .owl:ObjectProperty label @en}
[Relation linking an Observation or Actuation or act of Sampling and a Result or Sample.] {comment @en}
[Relation linking an Observation or Actuation or act of Sampling and a Result or Sample.] {skos:definition @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[Result] {+sosa:Result ?schema:rangeIncludes}
[Sample] {+sosa:Sample ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[is result of] {+sosa:isResultOf ?owl:inverseOf}

# has sample {=sosa:hasSample .owl:ObjectProperty label @en}
[Relation between a FeatureOfInterest and the Sample used to represent it.] {comment @en}
[Relation between a FeatureOfInterest and the Sample used to represent it.] {skos:definition @en}
[Feature Of Interest] {+sosa:FeatureOfInterest ?schema:domainIncludes}
[Sample] {+sosa:Sample ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[is sample of] {+sosa:isSampleOf ?owl:inverseOf}

# has simple result {=sosa:hasSimpleResult .owl:DatatypeProperty label @en}
[The simple value of an Observation or Actuation or act of Sampling.] {comment @en}
[The simple value of an Observation or Actuation or act of Sampling.] {skos:definition @en}
[For instance, the values 23 or true.] {skos:example @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[sosa:] {+sosa: ?isDefinedBy}

# hosts {=sosa:hosts .owl:ObjectProperty label @en}
[Relation between a Platform and a Sensor, Actuator, Sampler, or Platform, hosted or mounted on it.] {comment @en}
[Relation between a Platform and a Sensor, Actuator, Sampler, or Platform, hosted or mounted on it.] {skos:definition @en}
[Platform] {+sosa:Platform ?schema:domainIncludes}
[Actuator] {+sosa:Actuator ?schema:rangeIncludes}
[Platform] {+sosa:Platform ?schema:rangeIncludes}
[Sampler] {+sosa:Sampler ?schema:rangeIncludes}
[Sensor] {+sosa:Sensor ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[is hosted by] {+sosa:isHostedBy ?owl:inverseOf}

# is acted on by {=sosa:isActedOnBy .owl:ObjectProperty label @en}
[Relation between an ActuatableProperty of a FeatureOfInterest and an Actuation changing its state.] {comment @en}
[Relation between an ActuatableProperty of a FeatureOfInterest and an Actuation changing its state.] {skos:definition @en}
[In the activity (Actuation) of automatically closing a window if the temperature in a room drops below 20 degrees Celsius, the property on which the Actuator acts upon is the state of the window as it changes from being open to being closed. ] {skos:example @en}
[Actuatable Property] {+sosa:ActuatableProperty ?schema:domainIncludes}
[Actuation] {+sosa:Actuation ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[acts on property] {+sosa:actsOnProperty ?owl:inverseOf}

# is feature of interest of {=sosa:isFeatureOfInterestOf .owl:ObjectProperty label @en}
[A relation between a FeatureOfInterest and an Observation about it, an Actuation acting on it, or an act of Sampling that sampled it.] {comment @en}
[A relation between a FeatureOfInterest and an Observation about it, an Actuation acting on it, or an act of Sampling that sampled it.] {skos:definition @en}
[Feature Of Interest] {+sosa:FeatureOfInterest ?schema:domainIncludes}
[Sample] {+sosa:Sample ?schema:domainIncludes}
[Actuation] {+sosa:Actuation ?schema:rangeIncludes}
[Observation] {+sosa:Observation ?schema:rangeIncludes}
[Sampling] {+sosa:Sampling ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[has feature of interest] {+sosa:hasFeatureOfInterest ?owl:inverseOf}

# is hosted by {=sosa:isHostedBy .owl:ObjectProperty label @en}
[Relation between a Sensor, Actuator, Sampler, or Platform, and the Platform that it is mounted on or hosted by.] {comment @en}
[Relation between a Sensor, Actuator, Sampler, or Platform, and the Platform that it is mounted on or hosted by.] {skos:definition @en}
[Actuator] {+sosa:Actuator ?schema:domainIncludes}
[Platform] {+sosa:Platform ?schema:domainIncludes}
[Sampler] {+sosa:Sampler ?schema:domainIncludes}
[Sensor] {+sosa:Sensor ?schema:domainIncludes}
[Platform] {+sosa:Platform ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[hosts] {+sosa:hosts ?owl:inverseOf}

# is observed by {=sosa:isObservedBy .owl:ObjectProperty label @en}
[Relation between an ObservableProperty and the Sensor able to observe it.] {comment @en}
[Relation between an ObservableProperty and the Sensor able to observe it.] {skos:definition @en}
[Observable Property] {+sosa:ObservableProperty ?schema:domainIncludes}
[Sensor] {+sosa:Sensor ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[observes] {+sosa:observes ?owl:inverseOf}

# is result of {=sosa:isResultOf .owl:ObjectProperty label @en}
[Relation linking a Result to the Observation or Actuation or act of Sampling that created or caused it.] {comment @en}
[Relation linking a Result to the Observation or Actuation or act of Sampling that created or caused it.] {skos:definition @en}
[Result] {+sosa:Result ?schema:domainIncludes}
[Sample] {+sosa:Sample ?schema:domainIncludes}
[Actuation] {+sosa:Actuation ?schema:rangeIncludes}
[Observation] {+sosa:Observation ?schema:rangeIncludes}
[Sampling] {+sosa:Sampling ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[has result] {+sosa:hasResult ?owl:inverseOf}

# is sample of {=sosa:isSampleOf .owl:ObjectProperty label @en}
[Relation from a Sample to the FeatureOfInterest that it is intended to be representative of.] {comment @en}
[Relation from a Sample to the FeatureOfInterest that it is intended to be representative of.] {skos:definition @en}
[Sample] {+sosa:Sample ?schema:domainIncludes}
[Feature Of Interest] {+sosa:FeatureOfInterest ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[has sample] {+sosa:hasSample ?owl:inverseOf}

# made actuation {=sosa:madeActuation .owl:ObjectProperty label @en}
[Relation between an Actuator and the Actuation it has made.] {comment @en}
[Relation between an Actuator and the Actuation it has made.] {skos:definition @en}
[Actuator] {+sosa:Actuator ?schema:domainIncludes}
[Actuation] {+sosa:Actuation ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[made by actuator] {+sosa:madeByActuator ?owl:inverseOf}

# made by actuator {=sosa:madeByActuator .owl:ObjectProperty label @en}
[Relation linking an Actuation to the Actuator that made that Actuation.] {comment @en}
[Relation linking an Actuation to the Actuator that made that Actuation.] {skos:definition @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Actuator] {+sosa:Actuator ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[made actuation] {+sosa:madeActuation ?owl:inverseOf}

# made by sampler {=sosa:madeBySampler .owl:ObjectProperty label @en}
[Relation linking an act of Sampling to the Sampler (sampling device or entity) that made it.] {comment @en}
[Relation linking an act of Sampling to the Sampler (sampling device or entity) that made it.] {skos:definition @en}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[Sampler] {+sosa:Sampler ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[made sampling] {+sosa:madeSampling ?owl:inverseOf}

# made by sensor {=sosa:madeBySensor .owl:ObjectProperty label @en}
[Relation between an Observation and the Sensor which made the Observation.] {comment @en}
[Relation between an Observation and the Sensor which made the Observation.] {skos:definition @en}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sensor] {+sosa:Sensor ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[made observation] {+sosa:madeObservation ?owl:inverseOf}

# made observation {=sosa:madeObservation .owl:ObjectProperty label @en}
[Relation between a Sensor and an Observation made by the Sensor.] {comment @en}
[Relation between a Sensor and an Observation made by the Sensor.] {skos:definition @en}
[Sensor] {+sosa:Sensor ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[made by sensor] {+sosa:madeBySensor ?owl:inverseOf}

# made sampling {=sosa:madeSampling .owl:ObjectProperty label @en}
[Relation between a Sampler (sampling device or entity) and the Sampling act it performed.] {comment @en}
[Relation between a Sampler (sampling device or entity) and the Sampling act it performed.] {skos:definition @en}
[Sampler] {+sosa:Sampler ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[made by sampler] {+sosa:madeBySampler ?owl:inverseOf}

# observed property {=sosa:observedProperty .owl:ObjectProperty label @en}
[Relation linking an Observation to the property that was observed. The ObservableProperty should be a property of the FeatureOfInterest (linked by hasFeatureOfInterest) of this Observation.] {comment @en}
[Relation linking an Observation to the property that was observed. The ObservableProperty should be a property of the FeatureOfInterest (linked by hasFeatureOfInterest) of this Observation.] {skos:definition @en}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Observable Property] {+sosa:ObservableProperty ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}

# observes {=sosa:observes .owl:ObjectProperty label @en}
[Relation between a Sensor and an ObservableProperty that it is capable of sensing.] {comment @en}
[Relation between a Sensor and an ObservableProperty that it is capable of sensing.] {skos:definition @en}
[Sensor] {+sosa:Sensor ?schema:domainIncludes}
[Observable Property] {+sosa:ObservableProperty ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[is observed by] {+sosa:isObservedBy ?owl:inverseOf}

# phenomenon time {=sosa:phenomenonTime .owl:ObjectProperty label @en}
[The time that the Result of an Observation, Actuation or Sampling applies to the FeatureOfInterest. Not necessarily the same as the resultTime. May be an Interval or an Instant, or some other compound TemporalEntity.] {comment @en}
[The time that the Result of an Observation, Actuation or Sampling applies to the FeatureOfInterest. Not necessarily the same as the resultTime. May be an Interval or an Instant, or some other compound TemporalEntity.] {skos:definition @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[time:TemporalEntity] {+time:TemporalEntity ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}

# result time {=sosa:resultTime .owl:DatatypeProperty label @en}
[The result time is the instant of time when the Observation, Actuation or Sampling activity was completed.] {comment @en}
[The result time is the instant of time when the Observation, Actuation or Sampling activity was completed.] {skos:definition @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[sosa:] {+sosa: ?isDefinedBy}
[xsd:dateTime] {+xsd:dateTime ?range}

# used procedure {=sosa:usedProcedure .owl:ObjectProperty label @en}
[A relation to link to a re-usable Procedure used in making an Observation, an Actuation, or a Sample, typically through a Sensor, Actuator or Sampler.] {comment @en}
[A relation to link to a re-usable Procedure used in making an Observation, an Actuation, or a Sample, typically through a Sensor, Actuator or Sampler.] {skos:definition @en}
[Actuation] {+sosa:Actuation ?schema:domainIncludes}
[Observation] {+sosa:Observation ?schema:domainIncludes}
[Sampling] {+sosa:Sampling ?schema:domainIncludes}
[Procedure] {+sosa:Procedure ?schema:rangeIncludes}
[sosa:] {+sosa: ?isDefinedBy}

# Agent {=foaf:Agent .owl:Class}

# name {=foaf:name .owl:AnnotationProperty}

# n3-0 {=n3-0 .foaf:Agent}
[W3C/OGC Spatial Data on the Web Working Group] {foaf:name @en}

