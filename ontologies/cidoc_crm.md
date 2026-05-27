[crm] <http://www.cidoc-crm.org/cidoc-crm/>
[owl] <http://www.w3.org/2002/07/owl#>

# CIDOC Conceptual Reference Model (v7.1.3) {=crm: .owl:Ontology label @en}
[7.1.3] {owl:versionInfo}

# E1 CRM Entity {=crm:E1 .owl:Class label @en}
[<p>This class comprises all things in the universe of discourse of the CIDOC Conceptual Reference Model. </p><p>It is an abstract concept providing for three general properties:</p><ul><li>Identification by name or appellation, and in particular by a preferred identifier</li><li>Classification by type, allowing further refinement of the specific subclass to which an instance belongs </li><li>Attachment of free text and other unstructured data for the expression of anything not captured by formal properties</li></ul><p>All other classes within the CIDOC CRM are directly or indirectly specialisations of E1 CRM Entity. </p>] {comment @en}
[Full Name: E1 CRM Entity] {comment @en}

# E10 Transfer of Custody {=crm:E10 .owl:Class label @en}
[<p>This class comprises transfers of the physical custody or the legal responsibility for the physical custody of objects. The recording of the donor or recipient is optional. It is possible that in an instance of E10 Transfer of Custody there is either no donor or no recipient. </p><p>Depending on the circumstances, it may describe: </p><ol><li>the beginning of custody (there is no previous custodian)</li><li>the end of custody (there is no subsequent custodian)</li><li>the transfer of custody (transfer from one custodian to the next)</li><li>the receipt of custody from an unknown source (the previous custodian is unknown)</li><li>the declared loss of an object (the current or subsequent custodian is unknown)</li></ol><p>In the event that only a single kind of transfer of custody occurs, either the legal responsibility for the custody or the actual physical possession of the object but not both, this difference should be expressed using the property <em>P2 has type (is type of)</em>.</p><p>The sense of physical possession requires that the object of custody be in the hands of the keeper at least with a part representative for the whole. The way, in which a representative part is defined, should ensure that it is unambiguous who keeps a part and who the whole and should be consistent with the identity criteria of the kept instance of E18 Physical Thing.</p><p>The interpretation of the museum notion of "accession" differs between institutions. The CIDOC CRM therefore models legal ownership and physical custody separately. Institutions will then model their specific notions of accession and deaccession as combinations of these. </p><p>Theft is a specific case of illegal transfer of custody.</p>] {comment @en}
[Full Name: E10 Transfer of Custody] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E11 Modification {=crm:E11 .owl:Class label @en}
[<p>This class comprises instances of E7 Activity that are undertaken to create, alter or change instances of E24 Physical Human-Made Thing.</p><p>This class includes the production of an item from raw materials and other so far undocumented objects. It also includes the conservation treatment of an object.</p><p>Since the distinction between modification and production is not always clear, modification is regarded as the more generally applicable concept. This implies that some items may be consumed or destroyed in an instance of E11 Modification, and that others may be produced as a result of it. An event should also be documented using an instance of E81 Transformation if it results in the destruction of one or more objects and the simultaneous production of others using parts or material from the originals. In this case, the new items have separate identities.</p><p>An activity undertaken on an object which was designed to alter it, but which, in fact, it did not in any seemingly significant way (such as the application of a solvent during conservation which failed to dissolve any part of the object), is still considered as an instance of E11 Modification. Typically, any such activity will leave at least forensic traces of evidence on the object.</p><p>If the instance of E29 Design or Procedure utilized for the modification prescribes the use of specific materials, they should be documented using property <em>P68 foresees use of (use foreseen by)</em>: E57 Material of E29 Design or Procedure, rather than via <em>P126 employed (was employed in)</em>: E57 Material.</p>] {comment @en}
[Full Name: E11 Modification] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E12 Production {=crm:E12 .owl:Class label @en}
[<p>This class comprises activities that are designed to, and succeed in, creating one or more new items. </p><p>It specializes the notion of modification into production. The decision as to whether or not an object is regarded as new is context sensitive. Normally, items are considered “new” if there is no obvious overall similarity between them and the consumed items and material used in their production. In other cases, an item is considered “new” because it becomes relevant to documentation by a modification. For example, the scribbling of a name on a potsherd may make it a voting token. The original potsherd may not be worth documenting, in contrast to the inscribed one. </p><p>This entity can be collective: the printing of a thousand books, for example, would normally be considered a single event. </p><p>An event should also be documented using an instance of E81 Transformation if it results in the destruction of one or more objects and the simultaneous production of others using parts or material from the originals. In this case, the new items have separate identities and matter is preserved, but identity is not.</p>] {comment @en}
[Full Name: E12 Production] {comment @en}
[E11 Modification] {+crm:E11 ?subClassOf}
[E63 Beginning of Existence] {+crm:E63 ?subClassOf}

# E13 Attribute Assignment {=crm:E13 .owl:Class label @en}
[<p>This class comprises the actions of making assertions about one property of an object or any single relation between two items or concepts. The type of the property asserted to hold between two items or concepts can be described by the property <em>P177 assigned property of type (is type of property assigned)</em>: E55 Type. </p><p>For example, the class describes the actions of people making propositions and statements during certain scientific/scholarly procedures, e.g. the person and date when a condition statement was made, an identifier was assigned, the museum object was measured, etc. Which kinds of such assignments and statements need to be documented explicitly in structures of a schema rather than free text, depends on whether this information should be accessible by structured queries.</p><p>This class allows for the documentation of how the respective assignment came about, and whose opinion it was. Note that all instances of properties described in a knowledge base are the opinion of someone. Per default, they are the opinion of the team maintaining the knowledge base. This fact must not individually be registered for all instances of properties provided by the maintaining team, because it would result in an endless recursion of whose opinion was the description of an opinion. Therefore, the use of instances of E13 Attribute Assignment marks the fact that the maintaining team is in general neutral to the validity of the respective assertion, but registers someone else’s opinion and how it came about.</p><p>All properties assigned in such an action can also be seen as directly relating the respective pair of items or concepts. Multiple use of instances of E13 Attribute Assignment may possibly lead to a collection of contradictory values. </p>] {comment @en}
[Full Name: E13 Attribute Assignment] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E14 Condition Assessment {=crm:E14 .owl:Class label @en}
[<p>This class describes the act of assessing the state of preservation of an object during a particular period. </p><p>The condition assessment may be carried out by inspection, measurement, or through historical research. This class is used to document circumstances of the respective assessment that is relevant to interpret its quality at a later stage, or to continue research on related documents. </p>] {comment @en}
[Full Name: E14 Condition Assessment] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?subClassOf}

# E15 Identifier Assignment {=crm:E15 .owl:Class label @en}
[<p>This class comprises activities that result in the allocation of an identifier to an instance of E1 CRM Entity. An instance of E15 Identifier Assignment may include the creation of the identifier from multiple constituents, which themselves may be instances of E41 Appellation. The syntax and kinds of constituents to be used may be declared in a rule constituting an instance of E29 Design or Procedure.</p><p>Examples of such identifiers include Find Numbers, Inventory Numbers, uniform titles in the sense of librarianship and Digital Object Identifiers (DOI). Documenting the act of identifier assignment and deassignment is especially useful when objects change custody or the identification system of an organization is changed. In order to keep track of the identity of things in such cases, it is important to document by whom, when, and for what purpose an identifier is assigned to an item.</p><p>The fact that an identifier is a preferred one for an organisation can be expressed by using the property E1 CRM Entity<em>. P48 has preferred identifier (is preferred identifier of): </em>E42 Identifier. It can better be expressed in a context independent form by assigning a suitable E55 Type, such as “preferred identifier assignment”, to the respective instance of E15 Identifier Assignment through the <em>P2 has type (is type of)</em> property.</p>] {comment @en}
[Full Name: E15 Identifier Assignment] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?subClassOf}

# E16 Measurement {=crm:E16 .owl:Class label @en}
[<p>This class comprises actions measuring physical properties and other values that can be determined by a systematic, objective procedure of direct observation of particular states of physical reality. </p><p>An instance of E16 Measurement may use simple counting or tools, such as yardsticks or radiation detection devices. The interest is in the method and care applied, so that the reliability of the result may be judged at a later stage, or research continued on the associated documents. The date of the event is important for dimensions, which may change value over time, such as the length of an object subject to shrinkage. Methods and devices employed should be associated with instances of E16 Measurement by properties such as <em>P33 used specific technique</em>: E29 Design or Procedure,<em> P125 used object of type</em>: E55 Type,<em> P16 used specific object (was used for)</em>: E70 Thing, whereas basic techniques such as "carbon-14 dating" should be encoded using <em>P2 has type (is type of)</em>: E55 Type. Details of methods and devices reused or reusable in other instances of E16 Measurement should be documented for these entities rather than the measurements themselves, whereas details of particular execution may be documented by free text or by instantiating adequate sub-activities, if the detail may be of interest for an overarching query.</p><p>Regardless whether a measurement is made by an instrument or by human senses, it represents the initial transition from physical reality to information without any other documented information object in between within the reasoning chain that would represent the result of the interaction of the observer or device with reality. Therefore, determining properties of an instance of E90 Symbolic Object is regarded as an instance of E13 Attribute Assignment, which may be inferred from observing and measuring representative carriers. In the case that the carrier can be named, the property <em>P16 used specific object (was used for)</em> should be used to indicate the instance(s) of E18 Physical Thing that was used as the empirical basis for the attribute assignment. For instance, inferring properties of depicted items using image material, such as satellite images, is not regarded as an instance of E16 Measurement, but as a subsequent instance of E13 Attribute Assignment. Rather, only the production of the images, understood as arrays of radiation intensities, is regarded as an instance of E16 Measurement. The same reasoning holds for other sensor data.</p>] {comment @en}
[Full Name: E16 Measurement] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?subClassOf}

# E17 Type Assignment {=crm:E17 .owl:Class label @en}
[<p>This class comprises the actions of classifying items of whatever kind. Such items include objects, specimens, people, actions, and concepts. </p><p>This class allows for the documentation of the context of classification acts in cases where the value of the classification depends on the personal opinion of the classifier, and the date that the classification was made. This class also encompasses the notion of “determination,” i.e. the systematic and molecular identification of a specimen in biology. </p>] {comment @en}
[Full Name: E17 Type Assignment] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?subClassOf}

# E18 Physical Thing {=crm:E18 .owl:Class label @en}
[<p>This class comprises all persistent physical items with a relatively stable form, human-made or natural.</p><p>Depending on the existence of natural boundaries of such things, the CIDOC CRM distinguishes the instances of E19 Physical Object from instances of E26 Physical Feature, such as holes, rivers, pieces of land, etc. Most instances of E19 Physical Object can be moved (if not too heavy), whereas features are integral to the surrounding matter.</p><p>An instance of E18 Physical Thing occupies not only a particular geometric space at any instant of its existence, but in the course of its existence it also forms a trajectory through spacetime, which occupies a real, that is phenomenal, volume in spacetime. We include in the occupied space the space filled by the matter of the physical thing and all its inner spaces, such as the interior of a box. For the purpose of more detailed descriptions of the presence of an instance of E18 Physical Thing in space and time it can be associated with its specific instance of E92 Spacetime Volume by the property <em>P196 defines (is defined by).</em> </p><p>The CIDOC CRM is generally not concerned with amounts of matter in fluid or gaseous states, as long as they are not confined in an identifiable way for an identifiable minimal time-span.</p>] {comment @en}
[Full Name: E18 Physical Thing] {comment @en}
[E72 Legal Object] {+crm:E72 ?subClassOf}

# E19 Physical Object {=crm:E19 .owl:Class label @en}
[<p>This class comprises items of a material nature that are units for documentation and have physical boundaries that separate them completely in an objective way from other objects. </p><p>The class also includes all aggregates of objects made for functional purposes of whatever kind, independent of physical coherence, such as a set of chessmen. Typically, instances of E19 Physical Object can be moved (if not too heavy).</p><p>In some contexts, such objects, except for aggregates, are also called “bona fide objects”, i.e. naturally defined objects (Smith &amp; Varzi, 2000). </p><p>The decision as to what is documented as a complete item, rather than by its parts or components, may be purely administrative or may be a result of the order in which the item was acquired.</p>] {comment @en}
[Full Name: E19 Physical Object] {comment @en}
[E18 Physical Thing] {+crm:E18 ?subClassOf}

# E2 Temporal Entity {=crm:E2 .owl:Class label @en}
[<p>This class comprises all phenomena, such as the instances of E4 Periods and E5 Events, which happen over a limited extent in time. This extent in time must be contiguous, i.e., without gaps. In case the defining kinds of phenomena for an instance of E2 Temporal Entity cease to happen, and occur later again at another time, we regard that the former instance of E2 Temporal Entity has ended and a new instance has come into existence. In more intuitive terms, the same event cannot happen twice.</p><p>In some contexts, such phenomena are also called perdurants. This class is disjoint from E77 Persistent Item and is an abstract class that typically has no direct instances. E2 Temporal Entity is specialized into E4 Period, which applies to a particular geographic area (defined with a greater or lesser degree of precision), and E3 Condition State, which applies to instances of E18 Physical Thing.</p>] {comment @en}
[Full Name: E2 Temporal Entity] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E20 Biological Object {=crm:E20 .owl:Class label @en}
[<p>This class comprises individual items of a material nature, which live, have lived, or are natural products of or from living organisms. </p><p>Artificial objects that incorporate biological elements, such as Victorian butterfly frames, can be documented as both instances of E20 Biological Object and E22 Human-Made Object. </p>] {comment @en}
[Full Name: E20 Biological Object] {comment @en}
[E19 Physical Object] {+crm:E19 ?subClassOf}

# E21 Person {=crm:E21 .owl:Class label @en}
[<p>This class comprises real persons who live or are assumed to have lived. </p><p>Legendary figures that may have existed, such as Ulysses and King Arthur, fall into this class if the documentation refers to them as historical figures. In cases where doubt exists as to whether several persons are in fact identical, multiple instances can be created and linked to indicate their relationship. The CIDOC CRM does not propose a specific form to support reasoning about possible identity.</p><p>In a bibliographic context, a name presented following the conventions usually employed for personal names will be assumed to correspond to an actual real person (an instance of E21 Person), unless evidence is available to indicate that this is not the case. The fact that a persona may erroneously be classified as an instance of E21 Person does not imply that the concept comprises personae. </p>] {comment @en}
[Full Name: E21 Person] {comment @en}
[E20 Biological Object] {+crm:E20 ?subClassOf}
[E39 Actor] {+crm:E39 ?subClassOf}

# E22 Human-Made Object {=crm:E22 .owl:Class label @en}
[<p>This class comprises all persistent physical objects of any size that are purposely created by human activity and have physical boundaries that separate them completely in an objective way from other objects. </p><p>The class also includes all aggregates of objects made for functional purposes of whatever kind, independent of physical coherence, such as a set of chessmen.</p>] {comment @en}
[Full Name: E22 Human-Made Object] {comment @en}
[E19 Physical Object] {+crm:E19 ?subClassOf}
[E24 Physical Human-Made Thing] {+crm:E24 ?subClassOf}

# E24 Physical Human-Made Thing {=crm:E24 .owl:Class label @en}
[<p>This class comprises all persistent physical items of any size that are purposely created by human activity. This class comprises, besides others, human-made objects, such as a sword, and human-made features, such as rock art. For example, a “cup and ring” carving on bedrock is regarded as instance of E24 Physical Human-Made Thing.</p><p>Instances of E24 Physical Human-Made Thing may be the result of modifying pre-existing physical things, preserving larger parts or most of the original matter and structure, which poses the question if they are new or even human-made, the respective interventions of production made on such original material should be obvious and sufficient to regard that the product has a new, distinct identity and intended function and is human-made. Substantial continuity of the previous matter and structure in the new product can be documented by describing the production process also as an instance of E81 Transformation.</p><p>Whereas interventions of conservation and repair are not regarded to produce a new instance of E24 Physical Human-Made Thing, the results of preparation of natural history specimens that substantially change their natural or original state should be regarded as instances of E24 Physical Human-Made Things, including the uncovering of petrified biological features from a solid piece of stone. On the other side, scribbling a museum number on a natural object should not be regarded to make it human-made. This notwithstanding, parts, sections, segments, or features of an instance of E24 Physical Human-Made Thing may continue to be non-human-made and preserved during the production process, for example natural pearls used as a part of an eardrop.</p>] {comment @en}
[Full Name: E24 Physical Human-Made Thing] {comment @en}
[E18 Physical Thing] {+crm:E18 ?subClassOf}
[E71 Human-Made Thing] {+crm:E71 ?subClassOf}

# E25 Human-Made Feature {=crm:E25 .owl:Class label @en}
[<p>This class comprises physical features that are purposely created by human activity, such as scratches, artificial caves, artificial water channels, etc. In particular, it includes the information encoding features on mechanical or digital carriers.</p>] {comment @en}
[Full Name: E25 Human-Made Feature] {comment @en}
[E24 Physical Human-Made Thing] {+crm:E24 ?subClassOf}
[E26 Physical Feature] {+crm:E26 ?subClassOf}

# E26 Physical Feature {=crm:E26 .owl:Class label @en}
[<p>This class comprises identifiable features that are physically attached in an integral way to particular physical objects. </p><p>Instances of E26 Physical Feature share many of the attributes of instances of E19 Physical Object. They may have a one-dimensional, two-dimensional, or three-dimensional geometric extent, but there are no natural borders that separate them completely in an objective way from the carrier objects. For example, a doorway is a feature but the door itself, being attached by hinges, is not. </p><p>Instances of E26 Physical Feature can be features in a narrower sense, such as scratches, holes, reliefs, surface colours, reflection zones in an opal crystal or a density change in a piece of wood. In the wider sense, they are portions of particular objects with partially imaginary borders, such as the core of the Earth, an area of property on the surface of the Earth, a landscape or the head of a contiguous marble statue. They can be measured and dated, and it is sometimes possible to state who or what is or was responsible for them. They cannot be separated from the carrier object, but a segment of the carrier object may be identified (or sometimes removed) carrying the complete feature. </p><p>This definition coincides with the definition of “fiat objects”, with the exception of aggregates of “bona fide objects” (Smith &amp; Varzi, 2000). </p>] {comment @en}
[Full Name: E26 Physical Feature] {comment @en}
[E18 Physical Thing] {+crm:E18 ?subClassOf}

# E27 Site {=crm:E27 .owl:Class label @en}
[<p>This class comprises pieces of land or sea floor. </p><p>In contrast to the purely geometric notion of E53 Place, this class describes constellations of matter on the surface of the Earth or other celestial body, which can be represented by photographs, paintings, and maps.</p><p>Instances of E27 Site are composed of relatively immobile material items and features in a particular configuration at a particular location. </p>] {comment @en}
[Full Name: E27 Site] {comment @en}
[E26 Physical Feature] {+crm:E26 ?subClassOf}

# E28 Conceptual Object {=crm:E28 .owl:Class label @en}
[<p>This class comprises non-material products of our minds and other human produced data that have become objects of a discourse about their identity, circumstances of creation, or historical implication. The production of such information might have been supported by the use of technical devices such as cameras or computers.</p><p>Characteristically, instances of this class are created, invented or thought by someone, and then may be documented or communicated between persons. Instances of E28 Conceptual Object have the ability to exist on more than one particular carrier at the same time, such as paper, electronic signals, marks, audio media, paintings, photos, human memories, etc.</p><p>They cannot be destroyed. They exist as long as they can be found on at least one carrier or in at least one human memory. Their existence ends when the last carrier and the last memory are lost. </p>] {comment @en}
[Full Name: E28 Conceptual Object] {comment @en}
[E71 Human-Made Thing] {+crm:E71 ?subClassOf}

# E29 Design or Procedure {=crm:E29 .owl:Class label @en}
[<p>This class comprises documented plans for the execution of actions in order to achieve a result of a specific quality, form, or contents. In particular, it comprises plans for deliberate human activities that may result in new instances of E71 Human-Made Thing or for shaping or guiding the execution of an instance of E7 Activity.</p><p>Instances of E29 Design or Procedure can be structured in parts and sequences or depend on others.</p><p>This is modelled using <em>P69 has association with (is associated with)</em>: E29 Design or Procedure.</p><p>Designs or procedures can be seen as one of the following:</p><ol><li>A schema for the activities it describes</li><li>A schema of the products that result from their application</li><li>An independent intellectual product that may have never been applied, such as Leonardo da Vinci’s famous plans for flying machines</li></ol><p>Because designs or procedures may never be applied or only partially executed, the CIDOC CRM models a loose relationship between the plan and the respective product.</p>] {comment @en}
[Full Name: E29 Design or Procedure] {comment @en}
[E73 Information Object] {+crm:E73 ?subClassOf}

# E3 Condition State {=crm:E3 .owl:Class label @en}
[<p>This class comprises the states of objects characterised by a certain condition over a time-span. </p><p>An instance of this class describes the prevailing physical condition of any material object or feature during a specific instance of E52 Time-Span. In general, the time-span for which a certain condition can be asserted may be shorter than the real time-span, for which this condition held.</p><p>The nature of that condition can be described using <em>P2 has type</em>. For example, the instance of E3 Condition State “condition of the SS Great Britain between 22<sup>nd</sup> September 1846 and 27<sup>th</sup> August 1847” can be characterized as an instance “wrecked” of E55 Type. </p>] {comment @en}
[Full Name: E3 Condition State] {comment @en}
[E2 Temporal Entity] {+crm:E2 ?subClassOf}

# E30 Right {=crm:E30 .owl:Class label @en}
[<p>This class comprises legal privileges concerning material and immaterial things or their derivatives. </p><p>These include reproduction and property rights. </p>] {comment @en}
[Full Name: E30 Right] {comment @en}
[E89 Propositional Object] {+crm:E89 ?subClassOf}

# E31 Document {=crm:E31 .owl:Class label @en}
[<p>This class comprises identifiable immaterial items that make propositions about reality.</p><p>These propositions may be expressed in text, graphics, images, audiograms, videograms, or by other similar means. Documentation databases are regarded as instances of E31 Document. This class should not be confused with the concept “document” in Information Technology, which is compatible with E73 Information Object.</p>] {comment @en}
[Full Name: E31 Document] {comment @en}
[E73 Information Object] {+crm:E73 ?subClassOf}

# E32 Authority Document {=crm:E32 .owl:Class label @en}
[<p>This class comprises encyclopaedia, thesauri, authority lists and other documents that define terminology or conceptual systems for consistent use.</p>] {comment @en}
[Full Name: E32 Authority Document] {comment @en}
[E31 Document] {+crm:E31 ?subClassOf}

# E33 Linguistic Object {=crm:E33 .owl:Class label @en}
[<p>This class comprises identifiable expressions in natural language or languages. </p><p>Instances of E33 Linguistic Object can be expressed in many ways: e.g. as written texts, recorded speech, or sign language. However, the CIDOC CRM treats instances of E33 Linguistic Object independently from the medium or method by which they are expressed. Expressions in formal languages, such as computer code or mathematical formulae, are not treated as instances of E33 Linguistic Object by the CIDOC CRM. These should be modelled as instances of E73 Information Object.</p><p>In general, an instance of E33 Linguistic Object may also contain non-linguistic information, often of artistic or aesthetic value. Only in cases in which the content of an instance of E33 Linguistic Object can completely be expressed by a series of binary-encoded symbols, its content may be documented within a respective knowledge base by the property <em>P190 has symbolic content</em>: E62 String. Otherwise, it should be understood as an identifiable digital resource only available independently from the respective knowledge base. </p><p>In other cases, such as pages of an illuminated manuscript or recordings containing speech in a language supported by a writing system, the linguistic part of the content of an instance of E33 Linguistic Object may be documented within a respective knowledge base in a note by <em>P3 has note</em>: E62 String. Otherwise, it may be described using the property<em> P165 incorporates (is incorporated in)</em>: E73 Information Object as a different object with its own identity.</p>] {comment @en}
[Full Name: E33 Linguistic Object] {comment @en}
[E73 Information Object] {+crm:E73 ?subClassOf}

# E34 Inscription {=crm:E34 .owl:Class label @en}
[<p>This class comprises recognisable texts that can be attached to instances of E24 Physical Human-Made Thing. </p><p>The transcription of the text can be documented in a note by <em>P3 has note:</em> E62 String. The alphabet used can be documented by <em>P2 has type: </em>E55 Type. This class is not intended to describe the idiosyncratic characteristics of an individual physical embodiment of an inscription, but the underlying prototype. The physical embodiment is modelled in the CIDOC CRM as instances of E24 Physical Human-Made Thing.</p><p>The relationship of a physical copy of a book to the text it contains is modelled using E18 Physical Thing.<em> P128 carries (is carried by)</em>: E33 Linguistic Object<em>.</em> </p>] {comment @en}
[Full Name: E34 Inscription] {comment @en}
[E33 Linguistic Object] {+crm:E33 ?subClassOf}
[E37 Mark] {+crm:E37 ?subClassOf}

# E35 Title {=crm:E35 .owl:Class label @en}
[<p>This class comprises the textual strings that within a cultural context can be clearly identified as titles due to their form. Being a subclass of E41 Appellation, E35 Title can only be used when such a string is actually used as a title of a work, such as a text, an artwork, or a piece of music.</p><p>Titles are proper noun phrases or verbal phrases, and should not be confused with generic object names such as “chair”, “painting”, or “book” (the latter are common nouns that stand for instances of E55 Type). Titles may be assigned by the creator of the work itself, or by a social group.</p><p>This class also comprises the translations of titles that are used as surrogates for the original titles in different social contexts.</p>] {comment @en}
[Full Name: E35 Title] {comment @en}
[E33 Linguistic Object] {+crm:E33 ?subClassOf}
[E41 Appellation] {+crm:E41 ?subClassOf}

# E36 Visual Item {=crm:E36 .owl:Class label @en}
[<p>This class comprises the intellectual or conceptual aspects of recognisable marks and images.</p><p>This class does not intend to describe the idiosyncratic characteristics of an individual physical embodiment of a visual item, but the underlying prototype. For example, a mark such as the ICOM logo is generally considered to be the same logo when used on any number of publications. The size, orientation, and colour may change, but the logo remains uniquely identifiable. The same is true of images that are reproduced many times. This means that visual items are independent of their physical support.</p><p>The E36 Visual Item class provides a means of identifying and linking together instances of E24 Physical Human-Made Thing that carry the same visual symbols, marks, or images, etc. The property <em>P62 depicts (is depicted by)</em> between E24 Physical Human-Made Thing and the depicted subjects (E1 CRM Entity) can be regarded as a shortcut of the more fully developed path from E24 Physical Human-Made Thing through <em>P65 shows visual item (is shown by)</em>, E36 Visual Item, <em>P138 represents (has representation)</em> to E1 CRM Entity, which in addition captures the optical features of the depiction. </p>] {comment @en}
[Full Name: E36 Visual Item] {comment @en}
[E73 Information Object] {+crm:E73 ?subClassOf}

# E37 Mark {=crm:E37 .owl:Class label @en}
[<p>This class comprises symbols, signs, signatures, or short texts applied to instances of E24 Physical Human-Made Thing by arbitrary techniques, often in order to indicate such things as creator, owner, dedications, purpose, or to communicate information generally. Instances of E37 Mark do not represent the actual image of a mark, but the abstract ideal (or archetype) as used for codification in reference documents forming cultural documentation. </p><p>This class specifically excludes features that have no semantic significance, such as scratches or tool marks. These should be documented as instances of E25 Human-Made Feature.</p>] {comment @en}
[Full Name: E37 Mark] {comment @en}
[E36 Visual Item] {+crm:E36 ?subClassOf}

# E39 Actor {=crm:E39 .owl:Class label @en}
[<p>This class comprises people, either individually or in groups, who have the potential to perform intentional actions of kinds for which they can be held responsible. </p>] {comment @en}
[Full Name: E39 Actor] {comment @en}
[E77 Persistent Item] {+crm:E77 ?subClassOf}

# E4 Period {=crm:E4 .owl:Class label @en}
[<p>This class comprises sets of coherent phenomena or cultural manifestations occurring in time and space.</p><p>It is the social or physical coherence of these phenomena that identify an instance of E4 Period and not the associated spatiotemporal extent. This extent is only the “ground” or space in an abstract physical sense that the actual process of growth, spread and retreat has covered. Consequently, different periods can overlap and coexist in time and space, such as when a nomadic culture exists in the same area and time as a sedentary culture. This also means that overlapping land use rights, common among first nations, amounts to overlapping periods.</p><p>Often, this class is used to describe prehistoric or historic periods such as the “Neolithic Period”, the “Ming Dynasty” or the “McCarthy Era”, but also geopolitical units and activities of settlements are regarded as special cases of E4 Period. However, there are no assumptions about the scale of the associated phenomena. In particular all events are seen as synthetic processes consisting of coherent phenomena. Therefore, E4 Period is a superclass of E5 Event. For example, a modern clinical birth, an instance of E67 Birth, can be seen as both a single event, i.e. an instance of E5 Event, and as an extended period, i.e. an instance of E4 Period, that consists of multiple physical processes and complementary activities performed by multiple instances of E39 Actor.</p><p>E4 Period is a subclass of E2 Temporal Entity and of E92 Spacetime Volume. The latter is intended as a phenomenal spacetime volume as defined in CIDOC CRMgeo (Doerr &amp; Hiebel, 2013). By virtue of this multiple inheritance, it is possible to discuss the physical extent of an instance of E4 Period without representing each instance of it together with an instance of its associated spacetime volume. This model combines two quite different kinds of substance: an instance of E4 Period is a phenomenon while an instance of E92 Spacetime Volume is an aggregation of points in spacetime. However, the real spatiotemporal extent of an instance of E4 Period is regarded to be unique to it due to all its details and fuzziness; its identity and existence depends uniquely on the identity of the instance of E4 Period. Therefore, this multiple inheritance is unambiguous and effective and furthermore corresponds to the intuitions of natural language.</p><p>Typical use of this class in cultural heritage documentation is for documenting cultural and artistic periods. There are two different conceptualisations of ‘artistic style’, defined either by physical features or by historical context. For example, “Impressionism” can be viewed as a period in the European sphere of influence lasting from approximately 1870 to 1905 during which paintings with particular characteristics were produced by a group of artists that included (among others) Monet, Renoir, Pissarro, Sisley and Degas. Alternatively, it can be regarded as a style applicable to all paintings sharing the characteristics of the works produced by the Impressionist painters, regardless of historical context. The first interpretation is an instance of E4 Period, and the second defines morphological object types that fall under E55 Type.</p><p>A geopolitical unit as a specific case of an instance of E4 Period is the set of activities and phenomena related to the claim of power, the consequences of belonging to a jurisdictional area and an administrative system that establishes a geopolitical unit. Examples from the modern period are countries or administrative areas of countries such as districts whose actions and structures define activities and phenomena in the area that they intend to govern. The borders of geopolitical units are often defined in contracts or treaties although they may deviate from the actual practice. The spatiotemporal properties of Geopolitical units can be modelled through the properties inherited from E92 Spacetime Volume.</p><p>Another specific case of an instance of E4 Period is the actual extent of the set of activities and phenomena as evidenced by their physical traces that define a settlement, such as the populated period of Nineveh. </p>] {comment @en}
[Full Name: E4 Period] {comment @en}
[E2 Temporal Entity] {+crm:E2 ?subClassOf}
[E92 Spacetime Volume] {+crm:E92 ?subClassOf}

# E41 Appellation {=crm:E41 .owl:Class label @en}
[<p>This class comprises all signs, either meaningful or not, or arrangements of signs following a specific syntax, that are used or can be used to refer to and identify a specific instance of some class within a certain context.</p><p>Instances of E41 Appellation do not identify things by their meaning, even if they happen to have one, but by convention, tradition, or agreement. Instances of E41 Appellation are cultural constructs; as such, they have a context, a history, and a use in time and space by some group of users. A given instance of E41 Appellation can have alternative forms, i.e. other instances of E41 Appellation that are regarded as equivalent, regardless of the thing it denotes.</p><p>Different languages may use different appellations for the same thing, such as the names of major cities. Some appellations may be formulated using a valid noun phrase of a particular language. In these cases, the respective instances of E41 Appellation should also be declared as instances of E33 Linguistic Object. Then the language using the appellation can be declared with the property <em>P72 has language</em>: E56 Language.</p><p>Instances of E41 Appellation may be used to identify any instance of E1 CRM Entity and sometimes are characteristic for instances of more specific subclasses of E1 CRM Entity, such as for instances of E52 Time-Span (for instance “dates”), E39 Actor, E53 Place or E28 Conceptual Object. Postal addresses and E-mail addresses are characteristic examples of identifiers used by services transporting things between clients.</p><p>Even numerically expressed identifiers for extents in space or time are also regarded as instances of E41 Appellation, such as Gregorian dates or spatial coordinates, even though they allow for determining some time or location by a known procedure starting from a reference point and by virtue of that fact play a double role as instances of E59 Primitive Value.</p><p>E41 Appellation should not be confused with the act of naming something. Cf. E15 Identifier Assignment.</p>] {comment @en}
[Full Name: E41 Appellation] {comment @en}
[E90 Symbolic Object] {+crm:E90 ?subClassOf}

# E42 Identifier {=crm:E42 .owl:Class label @en}
[<p>This class comprises strings or codes assigned to instances of E1 CRM Entity in order to identify them uniquely and permanently within the context of one or more organisations. Such codes are often known as inventory numbers, registration codes, etc. and are typically composed of alphanumeric sequences. Postal addresses, telephone numbers, URLs and e-mail addresses are characteristic examples of identifiers used by services transporting things between clients.</p><p>The class E42 Identifier is not normally used for machine-generated identifiers used for automated processing unless these are also used by human agents. </p>] {comment @en}
[Full Name: E42 Identifier] {comment @en}
[E41 Appellation] {+crm:E41 ?subClassOf}

# E5 Event {=crm:E5 .owl:Class label @en}
[<p>This class comprises distinct, delimited and coherent processes and interactions of a material nature, in cultural, social or physical systems, involving and affecting instances of E77 Persistent Item in a way characteristic of the kind of process. Typical examples are meetings, births, deaths, actions of decision taking, making or inventing things, but also more complex and extended ones such as conferences, elections, building of a castle, or battles.</p><p>While the continuous growth of a tree lacks the limits characteristic of an event, its germination from a seed does qualify as an event. Similarly, the blowing of the wind lacks the distinctness and limits of an event, but a hurricane, flood or earthquake would qualify as an event. Mental processes are considered as events, in cases where they are connected with the material externalization of their results; for example, the creation of a poem, a performance or a change of intention that becomes obvious from subsequent actions or declarations.</p><p>The effects of an instance of E5 Event may not lead to relevant permanent changes of properties or relations of the items involved in it, for example an unrecorded performance. Of course, in order to be documented, some kind of evidence for an event must exist, be it witnesses, traces or products of the event.</p><p>While instances of E4 Period always require some form of coherence between its constituent phenomena, in addition, the essential constituents of instances of E5 Event should contribute to an overall effect; for example, the statements made during a meeting and the listening of the audience.</p><p>Viewed at a coarse level of detail, an instance of E5 Event may appear as if it had an ‘instantaneous’ overall effect, but any process or interaction of material nature in reality have an extent in time and space. At a fine level, instances of E5 Event may be analysed into component phenomena and phases within a space and timeframe, and as such can be seen as a period, regardless of the size of the phenomena. The reverse is not necessarily the case: not all instances of E4 Period give rise to a noteworthy overall effect and are thus not instances of E5 Event.</p>] {comment @en}
[Full Name: E5 Event] {comment @en}
[E4 Period] {+crm:E4 ?subClassOf}

# E52 Time-Span {=crm:E52 .owl:Class label @en}
[<p>This class comprises abstract temporal extents, in the sense of Galilean physics, having a beginning, an end, and a duration. </p><p>Instances of E52 Time-Span have no semantic connotations about phenomena happening within the temporal extent they represent. They do not convey any meaning other than a positioning on the “time-line” of chronology. The actual extent of an instance of E52 Time-Span can be approximated by properties of E52 Time-Span giving inner and outer bounds in the form of dates (instances of E61 Time Primitive). Comparing knowledge about time-spans is fundamental for chronological reasoning.</p><p>Some instances of E52 Time-Span may be defined as the actual, in principle observable, temporal extent of instances of E2 Temporal Entity via the property <em>P4 has time-span (is time-span of): </em>E52 Time-Span. They constitute phenomenal time-spans as defined in CRMgeo (Doerr &amp; Hiebel 2013). Since our knowledge of history is imperfect and physical phenomena are fuzzy in nature, the extent of phenomenal time-spans can only be described in approximation. An extreme case of approximation, might, for example, define an instance of E52 Time-Span having unknown beginning, end and duration. It may, nevertheless, be associated with other descriptions by which people can infer knowledge about it, such as in relative chronologies.</p><p>Some instances of E52 may be defined precisely as representing a declaration of a temporal extent, as, for instance, done in a business contract. They constitute declarative time-spans as defined in CRMgeo (Doerr &amp; Hiebel 2013) and can be described via the property E61 Time Primitive <em>P170 defines time (time is defined by)</em>: E52 Time-Span. </p><p>When used as a common E52 Time-Span for two events, it will nevertheless describe them as being simultaneous, even if nothing else is known.</p>] {comment @en}
[Full Name: E52 Time-Span] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E53 Place {=crm:E53 .owl:Class label @en}
[<p>This class comprises extents in the natural space where people live, in particular on the surface of the Earth, in the pure sense of physics: independent from temporal phenomena and matter. They may serve describing the physical location of things or phenomena or other areas of interest. Geometrically, instances of E53 Place constitute single contiguous areas or a finite aggregation of disjoint areas in space which are each individually contiguous. They may have fuzzy boundaries.</p><p>The instances of E53 Place are usually determined by reference to the position of “immobile” objects such as buildings, cities, mountains, rivers, or dedicated geodetic marks, but may also be determined by reference to mobile objects. A Place can be determined by combining a frame of reference and a location with respect to this frame.</p><p>It is sometimes argued that instances of E53 Place are best identified by global coordinates or absolute reference systems. However, relative references are often more relevant in the context of cultural documentation and tend to be more precise. In particular, people are often interested in position in relation to large, mobile objects, such as ships. For example, the Place at which Nelson died is known with reference to a large mobile object, i.e. H.M.S Victory. A resolution of this Place in terms of absolute coordinates would require knowledge of the movements of the vessel and the precise time of death, either of which may be revised, and the result would lack historical and cultural relevance.</p><p>Any instance of E18 Physical Thing can serve as a frame of reference for an instance of E53 Place. This may be documented using the property <em>P157 is at rest relative to (provides reference space for)</em>. </p>] {comment @en}
[Full Name: E53 Place] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E54 Dimension {=crm:E54 .owl:Class label @en}
[<p>This class comprises quantifiable properties that can be measured by some calibrated means and can be approximated by values, i.e. points or regions in a mathematical or conceptual space, such as natural or real numbers, RGB values, etc.</p><p>An instance of E54 Dimension represents the empirical or theoretically derived quantity, including the precision tolerances resulting from the particular method or calculation. The identity of an instance of E54 Dimension depends on the method of its determination because each method may produce different values even when determining comparable qualities. For instance, the wingspan of a bird alive or dead is a different dimension. Thermoluminescence dating and Rehydroxylation [RHX] dating are different dimensions of temporal distance from now, even if they aim at dating the same object. The method of determination should be expressed using the property <em>P2 has type (is type of)</em>. Note that simple terms such as “diameter” or “length” are normally insufficient to unambiguously describe a respective dimension. In contrast, “maximum linear extent” may be sufficient.</p><p>The properties of the class E54 Dimension allow for expressing the numerical approximation of the values of instances of E54 Dimension adequate to the precision of the applied method of determination. If the respective quantity belongs to a non-discrete space according to the laws of physics, such as spatial distances, it is recommended to record them as approximations by intervals or regions of indeterminacy enclosing the assumed true values. For instance, a length of 5 cm may be recorded as 4.5-5.5 cm, according to the precision of the respective observation. Note, that comparability of values described in different units depends critically on the representation as value regions.</p><p>Numerical approximations in archaic instances of E58 Measurement Unit used in historical records should be preserved. Equivalents corresponding to current knowledge should be recorded as additional instances of E54 Dimension, as appropriate.</p>] {comment @en}
[Full Name: E54 Dimension] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E55 Type {=crm:E55 .owl:Class label @en}
[<p>This class comprises concepts denoted by terms from thesauri and controlled vocabularies used to characterize and classify instances of CIDOC CRM classes. Instances of E55 Type represent concepts, in contrast to instances of E41 Appellation which are used to name instances of CIDOC CRM classes. </p><p>E55 Type provides an interface to domain specific ontologies and thesauri. These can be represented in the CIDOC CRM as subclasses of E55 Type, forming hierarchies of terms, i.e. instances of E55 Type linked via <em>P127 has broader term (has narrower term</em>): E55 Type. Such hierarchies may be extended with additional properties.</p>] {comment @en}
[Full Name: E55 Type] {comment @en}
[E28 Conceptual Object] {+crm:E28 ?subClassOf}

# E56 Language {=crm:E56 .owl:Class label @en}
[<p>This class is a specialization of E55 Type and comprises the natural languages in the sense of concepts.</p><p>This type is used categorically in the model without reference to instances of it, i.e. the Model does not foresee the description of instances of instances of E56 Language, e.g. “instances of Mandarin Chinese”.</p><p>It is recommended that internationally or nationally agreed codes and terminology should be used to denote instances of E56 Language, such as those defined in ISO 639-3:2007 and later versions. </p>] {comment @en}
[Full Name: E56 Language] {comment @en}
[E55 Type] {+crm:E55 ?subClassOf}

# E57 Material {=crm:E57 .owl:Class label @en}
[<p>This class is a specialization of E55 Type and comprises the concepts of materials. </p><p>Instances of E57 Material may denote properties of matter before its use, during its use, and as incorporated in an object, such as ultramarine powder, tempera paste, reinforced concrete. Discrete pieces of raw-materials kept in museums, such as bricks, sheets of fabric, pieces of metal, should be modelled individually in the same way as other objects. Discrete used or processed pieces, such as the stones from Nefer Titi's temple, should be modelled as parts (cf. <em>P46 is composed of (forms part of)</em>:<em> </em>E18 Physical Thing).</p><p>This type is used categorically in the model without reference to instances of it, i.e. the Model does not foresee the description of instances of instances of E57 Material, e.g. “instances of gold”.</p><p>It is recommended that internationally or nationally agreed codes and terminology should be used.</p>] {comment @en}
[Full Name: E57 Material] {comment @en}
[E55 Type] {+crm:E55 ?subClassOf}

# E58 Measurement Unit {=crm:E58 .owl:Class label @en}
[<p>This class is a specialization of E55 Type and comprises the types of measurement units: feet, inches, centimetres, litres, lumens, etc. </p><p>This type is used categorically in the model without reference to instances of it, i.e. the model does not foresee the description of instances of instances of E58 Measurement Unit, e.g. “instances of cm”.</p><p>Système International (SI) units or internationally recognized non-SI terms should be used whenever possible, such as those defined by ISO80000:2009. Archaic Measurement Units used in historical records should be preserved.</p>] {comment @en}
[Full Name: E58 Measurement Unit] {comment @en}
[E55 Type] {+crm:E55 ?subClassOf}

# E59 Primitive Value {=crm:E59 .owl:Class label @en}
[<p>This class comprises values of primitive data types of programming languages or database management systems and data types composed of such values used as documentation elements, as well as their mathematical abstractions. </p><p>The instances of E59 Primitive Value and its subclasses are not considered elements of the universe of discourse the CIDOC CRM aims to define and analyse. Rather, they play the role of a symbolic interface between the scope of the model and the world of mathematical and computational manipulations and the symbolic objects they define and handle. </p><p>In particular, they comprise lexical forms encoded as “strings” or series of characters and symbols based on encoding schemes (characterised by being a limited subset of the respective mathematical abstractions) such as UNICODE and values of datatypes that can be encoded in a lexical form, including quantitative specifications of time-spans and geometry. They have in common that instances of E59 Primitive Value define themselves by virtue of their encoded value, regardless of the nature of their mathematical abstractions. </p><p>Therefore, in an implementation, instances of E59 Primitive should be represented directly in the encoded symbolic form supported by the respective platform, such as a character string or a formatted date. They must not be represented in an implementation indirectly via, another a universal resource identifier, which in turn is linked to the actual encoded symbolic form. In a concrete application, it is recommended that the primitive value system from a chosen implementation platform and/or data definition language be used to substitute for this class and its subclasses.</p>] {comment @en}
[Full Name: E59 Primitive Value] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E6 Destruction {=crm:E6 .owl:Class label @en}
[<p>This class comprises events that destroy one or more instances of E18 Physical Thing, such that they lose their identity as the subjects of documentation.</p><p>Some destruction events are intentional, while others are independent of human activity. Intentional destruction can be documented by classifying the event as both an instance of E6 Destruction and of E7 Activity. </p><p>The decision to document an object as destroyed, transformed, or modified is context-sensitive: </p><ol><li>If the matter remaining from the destruction is not documented, the event is modelled solely as an instance of E6 Destruction. </li><li>An event should also be documented using E81 Transformation if it results in the destruction of one or more objects and the simultaneous production of others using parts or material from the original. In this case, the new items have separate identities. Matter is preserved, but identity is not.</li><li>When the initial identity of the changed instance of E18 Physical Thing is preserved, the event should be documented as an instance of E11 Modification. </li></ol>] {comment @en}
[Full Name: E6 Destruction] {comment @en}
[E64 End of Existence] {+crm:E64 ?subClassOf}

# E60 Number {=crm:E60 .owl:Class label @en}
[<p>This class comprises any encoding of computable (algebraic) values such as integers, real numbers, complex numbers, vectors, tensors, etc., including intervals of these values to express limited precision. </p><p>Numbers are fundamentally distinct from identifiers in continua, which are instances of E41 Appellation, such as Gregorian dates or spatial coordinates, even though their encoding may be similar. Instances of E60 Number can be combined with each other in algebraic operations to yield other instances of E60 Number, e.g. 1 + 1 = 2. Identifiers in continua may be combined with numbers expressing distances to yield new identifiers, e.g., 1924-01-31 + 2 days = 1924-02-02. Cf. E54 Dimension.</p>] {comment @en}
[Full Name: E60 Number] {comment @en}
[E59 Primitive Value] {+crm:E59 ?subClassOf}

# E61 Time Primitive {=crm:E61 .owl:Class label @en}
[<p>This class comprises instances of E59 Primitive Value for time that should be implemented with appropriate validation, precision, and references to temporal coordinate systems to express time in some context relevant to cultural and scientific documentation.</p><p>Instantiating different instances of E61 Time Primitive relative to the same instance of E52 Time-Span allows for the expression of multiple opinions/approximations of the same phenomenon. When representing different opinions/approximations of the E52 Time-Span of some E2 Temporal Entity, multiple instances of E61 Time Primitive should be instantiated relative to one E52 Time-Span. Only one E52 Time-Span should be instantiated since there is only one real phenomenal time extent of any given temporal entity.</p><p>The instances of E61 Time Primitive are not considered as elements of the universe of discourse that the CIDOC CRM aims at defining and analysing. Rather, they play the role of a symbolic interface between the scope of this model and the world of mathematical and computational manipulations and the symbolic objects they define and handle.</p><p>Therefore, they must not be represented in an implementation by a universal identifier associated with a content model of different identity. In a concrete application, it is recommended that the primitive value system from a chosen implementation platform and/or data definition language be used to substitute for this class.</p>] {comment @en}
[Full Name: E61 Time Primitive] {comment @en}
[E41 Appellation] {+crm:E41 ?subClassOf}
[E59 Primitive Value] {+crm:E59 ?subClassOf}

# E62 String {=crm:E62 .owl:Class label @en}
[<p>This class comprises coherent sequences of binary-encoded symbols. They correspond to the content of an instance of E90 Symbolic object. Instances of E62 String represent only the symbol sequence itself. They may or may not contain a language code. </p><p>In contrast, instances of other subclasses of E59 Primitive value represent entities in mathematical spaces other than that of symbol sequences, by using binary-encoded symbols, such as date expressions or numbers in decimal encoding. For instance, different syntactic forms of a date expression may represent the same date but consist of different strings.</p>] {comment @en}
[Full Name: E62 String] {comment @en}
[E59 Primitive Value] {+crm:E59 ?subClassOf}

# E63 Beginning of Existence {=crm:E63 .owl:Class label @en}
[<p>This class comprises events that bring into existence any instance of E77 Persistent Item. </p><p>It may be used for temporal reasoning about things (intellectual products, physical items, groups of people, living beings) beginning to exist; it serves as a hook for both a <em>terminus post quem </em>and a <em>terminus ante quem</em>. </p>] {comment @en}
[Full Name: E63 Beginning of Existence] {comment @en}
[E5 Event] {+crm:E5 ?subClassOf}

# E64 End of Existence {=crm:E64 .owl:Class label @en}
[<p>This class comprises events that end the existence of any instance of E77 Persistent Item. </p><p>It may be used for temporal reasoning about things (physical items, groups of people, living beings) ceasing to exist; it serves as a hook both a <em>terminus post quem</em> and a <em>terminus ante quem</em>. In cases where substance from an instance of E77 Persistent Item continues to exist in a new form, the process would be documented as instances of E81 Transformation.</p>] {comment @en}
[Full Name: E64 End of Existence] {comment @en}
[E5 Event] {+crm:E5 ?subClassOf}

# E65 Creation {=crm:E65 .owl:Class label @en}
[<p>This class comprises events that result in the creation of conceptual items or immaterial products, such as legends, poems, texts, music, images, movies, laws, types, etc.</p>] {comment @en}
[Full Name: E65 Creation] {comment @en}
[E63 Beginning of Existence] {+crm:E63 ?subClassOf}
[E7 Activity] {+crm:E7 ?subClassOf}

# E66 Formation {=crm:E66 .owl:Class label @en}
[<p>This class comprises events that result in the formation of a formal or informal E74 Group of people, such as a club, society, association, corporation, or nation. </p><p>E66 Formation does not include the arbitrary aggregation of people who do not act as a collective.</p><p>The formation of an instance of E74 Group does not require that the group is populated with members at the time of formation. In order to express the joining of members at the time of formation, the respective activity should be simultaneously an instance of both E66 Formation and E85 Joining. </p>] {comment @en}
[Full Name: E66 Formation] {comment @en}
[E63 Beginning of Existence] {+crm:E63 ?subClassOf}
[E7 Activity] {+crm:E7 ?subClassOf}

# E67 Birth {=crm:E67 .owl:Class label @en}
[<p>This class comprises the births of human beings. E67 Birth is a biological event focussing on the context of people coming into life. (E63 Beginning of Existence comprises the coming into life of any living being.) </p><p>Twins, triplets, etc. are brought into life by the same instance of E67 Birth. The introduction of the E67 Birth event as a documentation element allows the description of a range of family relationships in a simple model. Suitable extensions may describe more details and the complexity of motherhood since the advent of modern medicine. In this model, the biological father is not seen as a necessary participant in the E67 Birth.</p>] {comment @en}
[Full Name: E67 Birth] {comment @en}
[E63 Beginning of Existence] {+crm:E63 ?subClassOf}

# E68 Dissolution {=crm:E68 .owl:Class label @en}
[<p>This class comprises the events that result in the formal or informal termination of an instance of E74 Group. </p><p>If the dissolution was deliberate, the Dissolution event should also be instantiated as an instance of E7 Activity.</p>] {comment @en}
[Full Name: E68 Dissolution] {comment @en}
[E64 End of Existence] {+crm:E64 ?subClassOf}

# E69 Death {=crm:E69 .owl:Class label @en}
[<p>This class comprises the deaths of human beings. </p><p>If a person is <em>killed</em>, their death should be instantiated as E69 Death and as E7 Activity. The death or perishing of other living beings should be documented as instances of E64 End of Existence.</p>] {comment @en}
[Full Name: E69 Death] {comment @en}
[E64 End of Existence] {+crm:E64 ?subClassOf}

# E7 Activity {=crm:E7 .owl:Class label @en}
[<p>This class comprises actions intentionally carried out by instances of E39 Actor that result in changes of state in the cultural, social, or physical systems documented. </p><p>This notion includes complex, composite, and long-lasting actions such as the building of a settlement or a war, as well as simple, short-lived actions such as the opening of a door.</p>] {comment @en}
[Full Name: E7 Activity] {comment @en}
[E5 Event] {+crm:E5 ?subClassOf}

# E70 Thing {=crm:E70 .owl:Class label @en}
[<p>This general class comprises discrete, identifiable, instances of E77 Persistent Item that are documented as single units, that either consist of matter or depend on being carried by matter and are characterized by relative stability. </p><p>They may be intellectual products or physical things. They may, for instance, have a solid physical form, an electronic encoding, or they may be a logical concept or structure.</p>] {comment @en}
[Full Name: E70 Thing] {comment @en}
[E77 Persistent Item] {+crm:E77 ?subClassOf}

# E71 Human-Made Thing {=crm:E71 .owl:Class label @en}
[<p>This class comprises discrete, identifiable human-made items that are documented as single units. </p><p>These items are either intellectual products or human-made physical things, and are characterized by relative stability. They may, for instance, have a solid physical form, an electronic encoding, or they may be logical concepts or structures. </p>] {comment @en}
[Full Name: E71 Human-Made Thing] {comment @en}
[E70 Thing] {+crm:E70 ?subClassOf}

# E72 Legal Object {=crm:E72 .owl:Class label @en}
[<p>This class comprises those material or immaterial items to which instances of E30 Right, such as the right of ownership or use, can be applied. </p><p>This is generally true for all instances of E18 Physical Thing. In the case of instances of E28 Conceptual Object, however, the identity of an instance of E28 Conceptual Object or the method of its use may be too ambiguous to reliably establish instances of E30 Right, as in the case of taxa and inspirations. Ownership of corporations is currently regarded as out of scope of the CIDOC CRM. </p>] {comment @en}
[Full Name: E72 Legal Object] {comment @en}
[E70 Thing] {+crm:E70 ?subClassOf}

# E73 Information Object {=crm:E73 .owl:Class label @en}
[<p>This class comprises identifiable immaterial items, such as poems, jokes, data sets, images, texts, multimedia objects, procedural prescriptions, computer program code, algorithm or mathematical formulae, that have an objectively recognizable structure and are documented as single units. The encoding structure known as a “named graph” also falls under this class, so that each “named graph” is an instance of E73 Information Object.</p><p>An instance of E73 Information Object does not depend on a specific physical carrier, which can include human memory, and it can exist on one or more carriers simultaneously.</p><p>Instances of E73 Information Object of a linguistic nature should be declared as instances of the E33 Linguistic Object subclass. Instances of E73 Information Object of a documentary nature should be declared as instances of the E31 Document subclass. Conceptual items such as types and classes are not instances of E73 Information Object, nor are ideas without a reproducible expression.</p>] {comment @en}
[Full Name: E73 Information Object] {comment @en}
[E89 Propositional Object] {+crm:E89 ?subClassOf}
[E90 Symbolic Object] {+crm:E90 ?subClassOf}

# E74 Group {=crm:E74 .owl:Class label @en}
[<p>This class comprises any gatherings or organizations of human individuals or groups that act collectively or in a similar way due to any form of unifying relationship. In the wider sense this class also comprises official positions which used to be regarded in certain contexts as one actor, independent of the current holder of the office, such as the president of a country. In such cases, it may happen that the group never had more than one member. A joint pseudonym (i.e. a name that seems indicative of an individual but that is actually used as a persona by two or more people) is a particular case of E74 Group.</p><p>A gathering of people becomes an instance of E74 Group when it exhibits organizational characteristics usually typified by a set of ideas or beliefs held in common, or actions performed together. These might be communication, creating some common artifact, a common purpose such as study, worship, business, sports, etc. Nationality can be modelled as membership in an instance of E74 Group. Married couples and other concepts of family are regarded as particular examples of E74 Group.</p>] {comment @en}
[Full Name: E74 Group] {comment @en}
[E39 Actor] {+crm:E39 ?subClassOf}

# E77 Persistent Item {=crm:E77 .owl:Class label @en}
[<p>This class comprises items that have persistent characteristics of structural nature substantially related to their identity and their integrity, sometimes known as “endurants” in philosophy. Persistent Items may be physical entities, such as people, animals or things, conceptual entities such as ideas, concepts, products of the imagination or even names. </p><p>Instances of E77 Persistent Item may be present or be part of interactions in different periods or events. They can repeatedly be recognized at disparate occasions during their existence by characteristics of structural nature. The respective characteristics need not be exactly the same during all the existence of an instance of E77 Persistent Item. Often, they undergo gradual change, still bearing some similarities with that of previous times, or disappear completely and new emerge. For instance, a person, from the time of being born on, will gradually change all its features and acquire new ones, such as a scar. Even the DNA in different body cells will develop defects and mutations. Nevertheless, relevant characteristics used should be sufficiently similar to recognize the instance for some substantial period of time. </p><p>The more specific criteria that determine the identity of instances of subclasses of E77 Persistent Item may vary considerably and are described or referred to in the respective scope notes. The decision about which exact criteria to use depends on whether the observable behaviour of the respective part of reality such confined conforms to the reasoning the user is interested in. For example, a building can be regarded as no longer existing if it is dismantled and the materials reused in a different configuration. On the other hand, human beings go through radical and profound changes during their life-span, affecting both material composition and form, yet preserve their identity by other criteria, such as being bodily separated from other persons. Similarly, inanimate objects may be subject to exchange of parts and matter. On the opposite, the identity of a (version of a) text of a scientific publication is given by the exact arrangement of its relevant symbols. </p><p>The main classes of objects that fall outside the scope of the E77 Persistent Item class are temporal objects such as periods, events and acts, and descriptive properties. </p><p>An instance of E77 Persistent Item does not require actual knowledge of the identifying features of the instance being currently known. There may be cases, where the actual identifying features of an instance of E77 Persistent Item are not decidable at a particular state of knowledge. </p>] {comment @en}
[Full Name: E77 Persistent Item] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E78 Curated Holding {=crm:E78 .owl:Class label @en}
[<p>This class comprises aggregations of instances of E18 Physical Thing that are assembled and maintained (“curated” and “preserved,” in museological terminology) by one or more instances of E39 Actor over time for a specific purpose and audience, and according to a particular collection development plan. Typical instances of curated holdings are museum collections, archives, library holdings and digital libraries. A digital library is regarded as an instance of E18 Physical Thing because it requires keeping physical carriers of the electronic content.</p><p>Items may be added or removed from an E78 Curated Holding in pursuit of this plan. This class should not be confused with the E39 Actor maintaining the E78 Curated Holding who is often referred to using the name of the E78 Curated Holding (e.g. “The Wallace Collection decided…”). </p><p>Collective objects in the general sense, like a tomb full of gifts, a folder with stamps, or a set of chessmen, should be documented as instances of E19 Physical Object, and not as instances of E78 Curated Holding. This is because they form wholes, either because they are physically bound together or because they are kept together for their functionality.</p>] {comment @en}
[Full Name: E78 Curated Holding] {comment @en}
[E24 Physical Human-Made Thing] {+crm:E24 ?subClassOf}

# E79 Part Addition {=crm:E79 .owl:Class label @en}
[<p>This class comprises activities that result in an instance of E18 Physical Thing being increased, enlarged, or augmented by the addition of a part. </p><p>Typical scenarios include the attachment of an accessory, the integration of a component, the addition of an element to an aggregate object, or the accessioning of an object into a curated instance of E78 Curated Holding. Both the E18 Physical Thing being augmented and the E18 Physical Thing that is being added are treated as separate identifiable wholes prior to the instance of E79 Part Addition. Following the addition of parts, the resulting assemblages are treated objectively as single identifiable wholes, made up of constituent or component parts bound together either physically (for example the engine becoming a part of the car), or by sharing a common purpose (such as the 32 chess pieces that make up a chess set). This class of activities forms a basis for reasoning about the history and continuity of identity of objects that are integrated into other objects over time, such as precious gemstones being repeatedly incorporated into different items of jewellery, or cultural artefacts being added to different museum instances of E78 Curated Holding over their lifespan.</p>] {comment @en}
[Full Name: E79 Part Addition] {comment @en}
[E11 Modification] {+crm:E11 ?subClassOf}

# E8 Acquisition {=crm:E8 .owl:Class label @en}
[<p>This class comprises transfers of legal ownership from one or more instances of E39 Actor to one or more other instances of E39 Actor. </p><p>The class also applies to the establishment or loss of ownership of instances of E18 Physical Thing. It does not, however, imply changes of any other kinds of rights. The recording of the donor and/or recipient is optional. It is possible that in an instance of E8 Acquisition there is either no donor or no recipient. Depending on the circumstances, it may describe:</p><ol><li>the beginning of ownership</li><li>the end of ownership</li><li>the transfer of ownership</li><li>the acquisition from an unknown source</li><li>the loss of title due to destruction of the item</li></ol><p>It may also describe events where a collector appropriates legal title, for example, by annexation or field collection. The interpretation of the museum notion of “accession” differs between institutions. The CIDOC CRM therefore models legal ownership (E8 Acquisition) and physical custody (E10 Transfer of Custody) separately. Institutions will then model their specific notions of accession and deaccession as combinations of these.</p>] {comment @en}
[Full Name: E8 Acquisition] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E80 Part Removal {=crm:E80 .owl:Class label @en}
[<p>This class comprises the activities that result in an instance of E18 Physical Thing being decreased by the removal of a part.</p><p>Typical scenarios include the detachment of an accessory, the removal of a component or part of a composite object, or the deaccessioning of an object from a curated collection, an instance of E78 Curated Holding. If the instance of E80 Part Removal results in the total decomposition of the original object into pieces, such that the whole ceases to exist, the activity should instead be modelled as an instance of E81 Transformation, i.e. a simultaneous destruction and production. In cases where the part removed has no discernible identity prior to its removal but does have an identity subsequent to its removal, the activity should be modelled as both an instance of E80 Part Removal and E12 Production. This class of activities forms a basis for reasoning about the history, and continuity of identity over time, of objects that are removed from other objects, such as precious gemstones being extracted from different items of jewellery, or cultural artifacts being deaccessioned from different museum collections over their lifespan.</p>] {comment @en}
[Full Name: E80 Part Removal] {comment @en}
[E11 Modification] {+crm:E11 ?subClassOf}

# E81 Transformation {=crm:E81 .owl:Class label @en}
[<p>This class comprises the events that result in the simultaneous destruction of one or more than one E18 Physical Thing and the creation of one or more than one E18 Physical Thing that preserves recognizable substance and structure from the first one(s) but has fundamentally different nature or identity.</p><p>Although the old and the new instances of E18 Physical Thing are treated as discrete entities having separate, unique identities, they are causally connected through the E81 Transformation; the destruction of the old E18 Physical Thing(s) directly causes the creation of the new one(s) using or preserving some relevant substance and structure. Instances of E81 Transformation are therefore distinct from re-classifications (documented using E17 Type Assignment) or modifications (documented using E11 Modification) of objects that do not fundamentally change their nature or identity. Characteristic cases are reconstructions and repurposing of historical buildings or ruins, fires leaving buildings in ruins, taxidermy of specimen in natural history.</p><p>Even though such instances of E81 Transformation are often motivated by a change of intended use, substantial material changes should justify the documentation of the result as a new instance of E18 Physical Thing and not just the change of function. The latter may be documented as an extended activity (instance of E7 Activity) of using it.</p>] {comment @en}
[Full Name: E81 Transformation] {comment @en}
[E63 Beginning of Existence] {+crm:E63 ?subClassOf}
[E64 End of Existence] {+crm:E64 ?subClassOf}

# E83 Type Creation {=crm:E83 .owl:Class label @en}
[<p>This class comprises activities formally defining new types of items. </p><p>It is typically a rigorous scholarly or scientific process that ensures a type is exhaustively described and appropriately named. In some cases, particularly in archaeology and the life sciences, E83 Type Creation requires the identification of an exemplary specimen and the publication of the type definition in an appropriate scholarly forum. The activity modelled as an instance of E83 Type Creation is central to research in the life sciences, where a type would be referred to as a “taxon,” the type description as a “protologue,” and the exemplary specimens as “original element” or “holotype”.</p>] {comment @en}
[Full Name: E83 Type Creation] {comment @en}
[E65 Creation] {+crm:E65 ?subClassOf}

# E85 Joining {=crm:E85 .owl:Class label @en}
[<p>This class comprises the activities that result in an instance of E39 Actor becoming a member of an instance of E74 Group. This class does not imply initiative by either party. It may be the initiative of a third party.</p><p>Typical scenarios include becoming a member of a social organisation, becoming an employee of a company, marriage, the adoption of a child by a family, and the inauguration of somebody into an official position. </p>] {comment @en}
[Full Name: E85 Joining] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E86 Leaving {=crm:E86 .owl:Class label @en}
[<p>This class comprises the activities that result in an instance of E39 Actor to be disassociated from an instance of E74 Group. This class does not imply initiative by either party. It may be the initiative of a third party.</p><p>Typical scenarios include the termination of membership in a social organisation, ending the employment at a company, divorce, and the end of tenure of somebody in an official position.</p>] {comment @en}
[Full Name: E86 Leaving] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E87 Curation Activity {=crm:E87 .owl:Class label @en}
[<p>This class comprises the activities that contribute to the management and the preservation and evolution of instances of E78 Curated Holding, following an implicit or explicit curation plan. </p><p>It specializes the notion of activity into the curation of a collection and allows the history of curation to be recorded.</p><p>Items are accumulated and organized following criteria such as subject, chronological period, material type, style of art, etc., and can be added or removed from an instance of E78 Curated Holding for a specific purpose and/or audience. The initial aggregation of items to form a collection is regarded as an instance of E12 Production Event, while the activities of evolving, preserving, and promoting a collection are regarded as instances of E87 Curation Activity<em>.</em></p>] {comment @en}
[Full Name: E87 Curation Activity] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E89 Propositional Object {=crm:E89 .owl:Class label @en}
[<p>This class comprises immaterial items, including but not limited to stories, plots, procedural prescriptions, algorithms, laws of physics or images that are, or represent in some sense, sets of propositions about real or imaginary things and that are documented as single units or serve as topic of discourse. </p><p>This class also comprises items that are “about” something in the sense of a subject. In the wider sense, this class includes expressions of psychological value such as non-figural art and musical themes. However, conceptual items such as types and classes are not instances of E89 Propositional Object. This should not be confused with the definition of a type, which is indeed an instance of E89 Propositional Object.</p>] {comment @en}
[Full Name: E89 Propositional Object] {comment @en}
[E28 Conceptual Object] {+crm:E28 ?subClassOf}

# E9 Move {=crm:E9 .owl:Class label @en}
[<p>This class comprises changes of the physical location of the instances of E19 Physical Object. </p><p>Note, that the class E9 Move inherits the property <em>P7 took place at (witnessed): </em>E53 Place. This property should be used to describe the trajectory or a larger area within which a move takes place, whereas the properties <em>P26 moved to (was destination of)</em>, <em>P27 moved from (was origin of)</em> describe the start and end points only. Moves may also be documented to consist of other moves (via <em>P9 consists of (forms part of)</em>), in order to describe intermediate stages on a trajectory. In that case, start and end points of the partial moves should match appropriately between each other and with the overall event.</p>] {comment @en}
[Full Name: E9 Move] {comment @en}
[E7 Activity] {+crm:E7 ?subClassOf}

# E90 Symbolic Object {=crm:E90 .owl:Class label @en}
[<p>This class comprises identifiable symbols and any aggregation of symbols, such as characters, identifiers, traffic signs, emblems, texts, data sets, images, musical scores, multimedia objects, computer program code, or mathematical formulae that have an objectively recognizable structure and that are documented as single units.</p><p>It includes sets of signs of any nature, which may serve to designate something, or to communicate some propositional content. An instance of E90 Symbolic Object may or may not have a specific meaning, for example an arbitrary character string.</p><p>In some cases, the content of an instance of E90 Symbolic Object may completely be represented by a serialized digital content model, such as a sequence of ASCII-encoded characters, an XML or HTML document, or a TIFF image. The property <em>P3 has note</em> and its subproperty <em>P190 has symbolic content</em> allow for the description of this content model. In order to disambiguate which symbolic level is the carrier of the meaning, the property <em>P3.1 has type</em> can be used to specify the encoding (e.g. “bit”, “Latin character”, RGB pixel).</p>] {comment @en}
[Full Name: E90 Symbolic Object] {comment @en}
[E28 Conceptual Object] {+crm:E28 ?subClassOf}
[E72 Legal Object] {+crm:E72 ?subClassOf}

# E92 Spacetime Volume {=crm:E92 .owl:Class label @en}
[<p>This class comprises 4-dimensional point sets (volumes) in physical spacetime (in contrast to mathematical models of it) regardless of their true geometric forms. They may derive their identity from being the extent of a material phenomenon or from being the interpretation of an expression defining an extent in spacetime. Intersections of instances of E92 Spacetime Volume, E53 Place, and E52 Time-Span are also regarded as instances of E92 Spacetime Volume. An instance of E92 Spacetime Volume is either contiguous or composed of a finite number of contiguous subsets. Its boundaries may be fuzzy due to the properties of the phenomena it derives from or due to the limited precision up to which defining expression can be identified with a real extent in spacetime. The duration of existence of an instance of E92 Spacetime Volume is its projection on time.</p>] {comment @en}
[Full Name: E92 Spacetime Volume] {comment @en}
[E1 CRM Entity] {+crm:E1 ?subClassOf}

# E93 Presence {=crm:E93 .owl:Class label @en}
[<p>This class comprises instances of E92 Spacetime Volume, whose temporal extent has been chosen in order to determine the spatial extent of a phenomenon over the chosen time-span. Respective phenomena may, for instance, be historical events or periods, but can also be the diachronic extent and existence of physical things. In other words, instances of this class fix a slice of another instance of E92 Spacetime Volume in time. </p><p>The temporal extent of an instance of E93 Presence typically is predetermined by the researcher so as to focus the investigation particularly on finding the spatial extent of the phenomenon by testing for its characteristic features. There are at least two basic directions such investigations might take. The investigation may wish to determine where something was during some time or it may wish to reconstruct the total passage of a phenomenon’s spacetime volume through an examination of discrete presences. Observation and measurement of features indicating the presence or absence of a phenomenon in some space allows for the progressive approximation of spatial extents through argumentation typically based on inclusion, exclusion and various overlaps.</p>] {comment @en}
[Full Name: E93 Presence] {comment @en}
[E92 Spacetime Volume] {+crm:E92 ?subClassOf}

# E94 Space Primitive {=crm:E94 .owl:Class label @en}
[<p>This class comprises instances of E59 Primitive Value for space that should be implemented with appropriate validation, precision and references to spatial coordinate systems to express geometries on or relative to Earth, or on any other stable constellations of matter, relevant to cultural and scientific documentation.</p><p>An instance of E94 Space Primitive defines an instance of E53 Place in the sense of a declarative place as elaborated in CRMgeo (Doerr &amp; Hiebel 2013), which means that the identity of the place is derived from its geometric definition. Such a declarative place may allow for the approximation of instances of E53 Place defined by the actual extent of some phenomenon, such as a settlement or a riverbed, or other forms of identification rather than by an instance of E94 Space Primitive. Note that using an instance of E94 Space Primitive for approximating the actual extent of some place always defines a (declarative) instance of E53 Place in its own right. </p><p>Definitions of instances of E53 Place using different spatial reference systems are always definitions of different instances of E53 Place.</p><p>Instances of E94 Space Primitive provide the ability to link CIDOC CRM encoded data to the kinds of geometries used in maps or Geoinformation systems. They may be used for visualization of the instances of E53 Place they define, in their geographic context and for computing topological relations between places based on these geometries. E94 Space Primitive is not further elaborated upon within this model. It is considered good practice to maintain compatibility with OGC standards.</p>] {comment @en}
[Full Name: E94 Space Primitive] {comment @en}
[E41 Appellation] {+crm:E41 ?subClassOf}
[E59 Primitive Value] {+crm:E59 ?subClassOf}

# E95 Spacetime Primitive {=crm:E95 .owl:Class label @en}
[<p>This class comprises instances of E59 Primitive Value for spacetime volumes that should be implemented with appropriate validation, precision and reference systems to express geometries being limited and varying over time on or relative to Earth, or any other stable constellations of matter, relevant to cultural and scientific documentation. An instance of E95 Spacetime Primitive may consist of one expression including temporal and spatial information such as in GML or a different form of expressing spacetime in an integrated way such as a formula containing all 4 dimensions.</p><p>An instance of E95 Spacetime Primitive defines an instance of E92 Spacetime Volume in the sense of a declarative spacetime volume as defined in CRMgeo (Doerr &amp; Hiebel 2013), which means that the identity of the instance of E92 Spacetime Volume is derived from its geometric and temporal definition. This declarative spacetime volume allows for the application of all E92 Spacetime Volume properties to relate phenomenal spacetime volumes of periods and physical things to propositions about their spatial and temporal extents.</p><p>Instances of E92 Spacetime Volume defined by <em>P169 defines spacetime volume (spacetime volume is defined by)</em> that use different spatiotemporal referring systems are always regarded as different instances of the E92 Spacetime Volume.</p><p>It is possible for a spacetime volume to be defined by phenomena causal to it, such as an expanding and declining realm, a settlement structure or a battle, or other forms of identification rather than by an instance of E95 Spacetime Primitive. Any spatiotemporal approximation of such a phenomenon by an instance of E95 Spacetime Primitive constitutes an instance of E92 Spacetime Volume in its own right.</p><p>E95 Spacetime Primitive is not further elaborated upon within this model. Compatibility with OGC standards is recommended.</p>] {comment @en}
[Full Name: E95 Spacetime Primitive] {comment @en}
[E41 Appellation] {+crm:E41 ?subClassOf}
[E59 Primitive Value] {+crm:E59 ?subClassOf}

# E96 Purchase {=crm:E96 .owl:Class label @en}
[<p>This class comprises transfers of legal ownership from one or more instances of E39 Actor to one or more different instances of E39 Actor, where the transferring party is completely compensated by the payment of a monetary amount. In more detail, a purchase agreement establishes a fixed monetary obligation at its initialization on the receiving party, to the giving party. An instance of E96 Purchase begins with the contract or equivalent agreement and ends with the fulfilment of all contractual obligations. In the case that the activity is abandoned before both parties have fulfilled these obligations, the activity is not regarded as an instance of E96 Purchase.</p><p>This class is a very specific case of the much more complex social business practices of exchange of goods and the creation and satisfaction of related social obligations. Purchase activities which define individual sales prices per object can be modelled by instantiating E96 Purchase for each object individually and as part of an overall instance of E96 Purchase transaction.</p>] {comment @en}
[Full Name: E96 Purchase] {comment @en}
[E8 Acquisition] {+crm:E8 ?subClassOf}

# E97 Monetary Amount {=crm:E97 .owl:Class label @en}
[<p>This class comprises quantities of monetary possessions or obligations in terms of their nominal value with respect to a particular currency. These quantities may be abstract accounting units, the nominal value of a heap of coins or bank notes at the time of validity of the respective currency, the nominal value of a bill of exchange or other documents expressing monetary claims or obligations. It specifically excludes amounts expressed in terms of weights of valuable items, like gold and diamonds, and quantities of other non-currency items, like goats or stocks and bonds. </p>] {comment @en}
[Full Name: E97 Monetary Amount] {comment @en}
[E54 Dimension] {+crm:E54 ?subClassOf}

# E98 Currency {=crm:E98 .owl:Class label @en}
[<p>This class comprises the units in which a monetary system, supported by an administrative authority or other community, quantifies and arithmetically compares all monetary amounts declared in the unit. The unit of a monetary system must describe a nominal value which is kept constant by its administrative authority and an associated banking system if it exists, and not by market value. For instance, one may pay with grams of gold, but the respective monetary amount would have been agreed as the gold price in US dollars on the day of the payment. Under this definition, British Pounds, U.S. Dollars, and European Euros are examples of currency, but “grams of gold” is not. One monetary system has one and only one currency. Instances of this class must not be confused with coin denominations, such as “Dime” or “Sestertius”. Non-monetary exchange of value in terms of quantities of a particular type of goods, such as cows, do not constitute a currency. </p>] {comment @en}
[Full Name: E98 Currency] {comment @en}
[E58 Measurement Unit] {+crm:E58 ?subClassOf}

# E99 Product Type {=crm:E99 .owl:Class label @en}
[<p>This class comprises types that stand as the models for instances of E22 Human-Made Object that are produced as the result of production activities using plans exact enough to result in one or more series of uniform, functionally and aesthetically identical and interchangeable items. The product type is the intended ideal form of the manufacture process. It is typical of instances of E22 Human-Made Object that conform to an instance of E99 Product Type that its component parts are interchangeable with component parts of other instances of E22 Human-Made Object made after the model of the same instance of E99 Product Type. Frequently, the uniform production according to a given instance of E99 Product Type is achieved by creating individual tools, such as moulds or print plates that are themselves carriers of the design of the product type. Modern tools may use the flexibility of electronically controlled devices to achieve such uniformity. The product type itself, i.e. the potentially unlimited series of aesthetically equivalent items, may be the target of artistic design, rather than the individual object. In extreme cases, only one instance of a product type may have been produced, such as in a “print on demand” process which was only triggered once. However, this should not be confused with industrial prototypes, such as car prototypes, which are produced prior to the production line being set up, or test the production line itself.</p>] {comment @en}
[Full Name: E99 Product Type] {comment @en}
[E55 Type] {+crm:E55 ?subClassOf}

# P1 is identified by {=crm:P1 .owl:ObjectProperty label @en}
[<p>This property describes the naming or identification of any real-world item by a name or any other identifier. </p><p>This property is intended for identifiers in general use, which form part of the world the model intends to describe, and not merely for internal database identifiers which are specific to a technical system, unless these latter also have a more general use outside the technical context. This property includes in particular identification by mathematical expressions such as coordinate systems used for the identification of instances of E53 Place. The property does not reveal anything about when, where and by whom this identifier was used. A more detailed representation can be made using the fully developed (i.e. indirect) path through E15 Identifier Assignment.</p><p>This property is a shortcut for the path from E1 CRM Entity through <em>P140i was attributed by</em>, E15 Identifier Assignment, <em>P37 assigned </em>to<em> </em>E42 Identifier. </p><p>It is also a shortcut for the path from E1 CRM Entity through <em>P1 is identified by</em>, E41 Appellation, <em>P139 has alternative form</em> to E41 Appellation.</p>] {comment @en}
[E1 CRM Entity] {+crm:E1 ?domain}
[E41 Appellation] {+crm:E41 ?range}

# P10 falls within {=crm:P10 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E92 Spacetime Volume with another instance of E92 Spacetime Volume that falls within the latter. In other words, all points in the former are also points in the latter.</p><p>This property is transitive and reflexive.</p>] {comment @en}
[E92 Spacetime Volume] {+crm:E92 ?domain}
[E92 Spacetime Volume] {+crm:E92 ?range}
[P132 spatiotemporally overlaps with] {+crm:P132 ?subPropertyOf}

# P100 was death of {=crm:P100 .owl:ObjectProperty label @en}
[<p>This property links an instance of E69 Death to the instance of E21 Person that died.</p><p>An instance of E69 Death may involve multiple people, for example in the case of a battle or disaster.</p><p>This is not intended for use with general natural history material, only people.</p>] {comment @en}
[E69 Death] {+crm:E69 ?domain}
[E21 Person] {+crm:E21 ?range}
[P93 took out of existence] {+crm:P93 ?subPropertyOf}

# P101 had as general use {=crm:P101 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E70 Thing with an instance of E55 Type that describes the type of use that it was actually employed for.</p><p>It allows the relationship between particular things, both physical and immaterial, and the general methods and techniques of real use to be documented. This may well be different from the intended functional purpose of the instance of E70 Thing (which can be documented with <em>P103 was intended for (was intention of)</em>). For example, it could be recorded that a particular wooden crate had a general use as a shelf support on a market stall even though it had been originally intended for carrying vegetables.</p><p>The use of this property is intended to allow the documentation of usage patterns attested in historical records or through scientific investigation (for instance ceramic residue analysis). It should not be used to document the intended, and thus assumed, use of an object.</p>] {comment @en}
[E70 Thing] {+crm:E70 ?domain}
[E55 Type] {+crm:E55 ?range}

# P102 has title {=crm:P102 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E35 Title that has been applied to an instance of E71 Human-Made Thing. </p><p>The <em>P102.1</em> <em>has type</em> property of the <em>P102</em> <em>has title (is title of)</em> property enables the relationship between the title and the thing to be further clarified, for example, if the title was a given title, a supplied title etc.</p><p>It allows any human-made material or immaterial thing to be given a title. It is possible to imagine a title being created without a specific object in mind.</p>] {comment @en}
[E71 Human-Made Thing] {+crm:E71 ?domain}
[E35 Title] {+crm:E35 ?range}
[P1 is identified by] {+crm:P1 ?subPropertyOf}

# P103 was intended for {=crm:P103 .owl:ObjectProperty label @en}
[<p>This property links an instance of E71 Human-Made Thing to an instance of E55 Type of usage or audience. It creates a relation between specific human-made things, both physical and immaterial, to E55 Types. This property can be used to specify intended methods and techniques of use or to characterise the intended audience by indicating a type of personal characteristic that everyone falling into the target audience has. </p><p>Note: A link between specific human-made things and a specific use activity should be expressed using <em>P19</em> <em>was intended use of (was made for).</em></p>] {comment @en}
[E71 Human-Made Thing] {+crm:E71 ?domain}
[E55 Type] {+crm:E55 ?range}

# P104 is subject to {=crm:P104 .owl:ObjectProperty label @en}
[<p>This property links a particular instance of E72 Legal Object to the instances of E30 Right to which it is subject.</p><p>The Right is held by an instance of E39 Actor as described by <em>P75</em> <em>possesses (is possessed by)</em>.</p>] {comment @en}
[E72 Legal Object] {+crm:E72 ?domain}
[E30 Right] {+crm:E30 ?range}

# P105 right held by {=crm:P105 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor who holds the instances of E30 Right to an instance of E72 Legal Object.</p><p>It is a superproperty of <em>P52 has current owner (is current owner of)</em> because ownership is a right that is held on the owned object.</p><p>This property is a shortcut of the fully developed path from E72 Legal Object,<em> P104 is subject to</em>, E30 Right, <em>P75i is possessed by</em> to E39 Actor.</p>] {comment @en}
[E72 Legal Object] {+crm:E72 ?domain}
[E39 Actor] {+crm:E39 ?range}

# P106 is composed of {=crm:P106 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E90 Symbolic Object with a part of it that is by itself an instance of E90 Symbolic Object, such as fragments of texts or clippings from an image.</p><p>This property is transitive asymmetric.</p>] {comment @en}
[E90 Symbolic Object] {+crm:E90 ?domain}
[E90 Symbolic Object] {+crm:E90 ?range}

# P107 has current or former member {=crm:P107 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E74 Group with an instance of E39 Actor that is or has been a member thereof.</p><p>Instances of E74 Group and E21 Person may all be members of instances of E74 Group. An instance of E74 Group may be founded initially without any member. </p><p>This property is a shortcut of the more fully developed path from E74 Group<em>, P144i gained member by, </em>E85 Joining<em>, P143 joined </em>to E39 Actor<em>.</em></p><p>The property P107.1 <em>kind of member </em>can be used to specify the type of membership or the role the member has in the group. </p>] {comment @en}
[E74 Group] {+crm:E74 ?domain}
[E39 Actor] {+crm:E39 ?range}

# P108 has produced {=crm:P108 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E24 Physical Human-Made Thing that came into existence as a result of the instance of E12 Production.</p><p>The identity of an instance of E24 Physical Human-Made Thing is not defined by its matter, but by its existence as a subject of documentation. An E12 Production can result in the creation of multiple instances of E24 Physical Human-Made Thing.</p>] {comment @en}
[E12 Production] {+crm:E12 ?domain}
[E24 Physical Human-Made Thing] {+crm:E24 ?range}
[P31 has modified] {+crm:P31 ?subPropertyOf}
[P92 brought into existence] {+crm:P92 ?subPropertyOf}

# P109 has current or former curator {=crm:P109 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor who assumed or has assumed overall curatorial responsibility for an instance of E78 Curated Holding.</p><p>It does not allow a history of curation to be recorded. This would require use of an event initiating a curator being responsible for a collection.</p>] {comment @en}
[E78 Curated Holding] {+crm:E78 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P49 has former or current keeper] {+crm:P49 ?subPropertyOf}

# P11 had participant {=crm:P11 .owl:ObjectProperty label @en}
[<p>This property describes the active or passive participation of instances of E39 Actors in an instance of E5 Event. </p><p>It documents known events in which an instance of E39 Actor has participated during the course of that actor’s life or history. The instances of E53 Place and E52 Time-Span where and when these events happened provide constraints about the presence of the related instances of E39 Actor in the past. Collective actors, i.e. instances of E74 Group, may physically participate in events via their representing instances of E21 Persons only. The participation of multiple actors in an event is most likely an indication of their acquaintance and interaction.</p><p>The property implies that the actor was involved in the event but does not imply any causal relationship. For instance, someone having been portrayed can be said to have participated in the creation of the portrait.</p>] {comment @en}
[E5 Event] {+crm:E5 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}

# P110 augmented {=crm:P110 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E18 Physical Thing that is added to (augmented) in an instance of E79 Part Addition.</p><p>Although an instance of E79 Part Addition event normally concerns only one instance of E18 Physical Thing, it is possible to imagine circumstances under which more than one item might be added to (augmented). For example, the artist Jackson Pollock trailing paint onto multiple canvasses.</p>] {comment @en}
[E79 Part Addition] {+crm:E79 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P31 has modified] {+crm:P31 ?subPropertyOf}

# P111 added {=crm:P111 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E18 Physical Thing that is added during an instance of E79 Part Addition activity.</p>] {comment @en}
[E79 Part Addition] {+crm:E79 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P16 used specific object] {+crm:P16 ?subPropertyOf}

# P112 diminished {=crm:P112 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E18 Physical Thing that was diminished by an instance of E80 Part Removal.</p><p>Although an instance of E80 Part removal activity normally concerns only one instance of E18 Physical Thing, it is possible to imagine circumstances under which more than one item might be diminished by a single instance of E80 Part Removal activity. </p>] {comment @en}
[E80 Part Removal] {+crm:E80 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P31 has modified] {+crm:P31 ?subPropertyOf}

# P113 removed {=crm:P113 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E18 Physical Thing that is removed during an instance of E80 Part Removal activity.</p>] {comment @en}
[E80 Part Removal] {+crm:E80 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}

# P12 occurred in the presence of {=crm:P12 .owl:ObjectProperty label @en}
[<p>This property describes the active or passive presence of an E77 Persistent Item in an instance of E5 Event without implying any specific role. </p><p>It documents known events in which an instance of E77 Persistent Item was present during the course of its life or history. For example, an object may be the desk, now in a museum, on which a treaty was signed. The instance of E53 Place and the instance of E52 Time-Span where and when these events happened provide constraints about the presence of the related instance E77 Persistent Item in the past. Instances of E90 Symbolic Object, in particular information objects, are physically present in events via at least one of the instances of E18 Physical Thing carrying them. Note, that the human mind can be such a carrier. A precondition for a transfer of information to a person or another new physical carrier is the presence of the respective information object and this person or physical thing in one event.</p>] {comment @en}
[E5 Event] {+crm:E5 ?domain}
[E77 Persistent Item] {+crm:E77 ?range}

# P121 overlaps with {=crm:P121 .owl:ObjectProperty label @en}
[<p>This symmetric property associates an instance of E53 Place with another instance of E53 Place geometrically overlapping it. </p><p>It does not specify anything about the shared area. This property is purely spatial. It does not imply that phenomena that define, by their extent, places related by <em>P121 overlaps with</em> have ever covered a common area at the same time or even coexisted. In contrast, spatiotemporal overlaps described by <em>P132 spatiotemporally overlaps</em> are the total of areas simultaneously covered by the related spacetime volumes.</p><p>This property is symmetric. This property is reflexive. </p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E53 Place] {+crm:E53 ?range}

# P122 borders with {=crm:P122 .owl:ObjectProperty label @en}
[<p>This symmetric property associates an instance of E53 Place with another instance of E53 Place which shares a part of its border. </p><p>This property is purely spatial. It does not imply that the phenomena that define, by their extent, places related by <em>P122 borders</em> <em>with</em> have ever shared a respective border at the same time or even coexisted. In particular, this may be the case when the respective common border is formed by a natural feature. </p><p>This property is not transitive. This property is symmetric.</p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E53 Place] {+crm:E53 ?range}

# P123 resulted in {=crm:P123 .owl:ObjectProperty label @en}
[<p>This property identifies the instance or instances of E18 Physical Thing that are the result of an instance of E81 Transformation. New items replace the transformed item or items, which cease to exist as units of documentation. The physical continuity between the old and the new is expressed by the links to the common instance of E81 Transformation.</p>] {comment @en}
[E81 Transformation] {+crm:E81 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P92 brought into existence] {+crm:P92 ?subPropertyOf}

# P124 transformed {=crm:P124 .owl:ObjectProperty label @en}
[<p>This property identifies the instance or instances E18 Physical Thing that have ceased to exist due to an instance of E81 Transformation.</p><p>The item that has ceased to exist and was replaced by the result of the Transformation. The continuity between both items, the new and the old, is expressed by the links to the common instance of E81 Transformation.</p>] {comment @en}
[E81 Transformation] {+crm:E81 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P93 took out of existence] {+crm:P93 ?subPropertyOf}

# P125 used object of type {=crm:P125 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E7 Activity to an instance of E55 Type, which classifies an instance of E70 Thing used in an instance of E7 Activity, when the specific instance is either unknown or not of interest, such as use of “a hammer”.</p><p>This property is a shortcut of the more fully developed path from E7 Activity through <em>P16 used specific object</em>, E70 Thing, <em>P2 has type,</em> to E55 Type.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E55 Type] {+crm:E55 ?range}

# P126 employed {=crm:P126 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E57 Material employed in an instance of E11 Modification.</p><p>The instance of E57 Material used during the instance of E11 Modification does not necessarily become incorporated into the instance of E24 Physical Human-Made Thing that forms the subject of the instance of E11 Modification.</p>] {comment @en}
[E11 Modification] {+crm:E11 ?domain}
[E57 Material] {+crm:E57 ?range}

# P127 has broader term {=crm:P127 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E55 Type with another instance of E55 Type that has a broader meaning. </p><p>It allows instances of E55 Types to be organised into hierarchies. This is the sense of “broader term generic (BTG)” as defined in ISO 25964-2:2013 (International Organization for Standardization 2013).</p><p>This property is transitive. This property is asymmetric.</p>] {comment @en}
[E55 Type] {+crm:E55 ?domain}
[E55 Type] {+crm:E55 ?range}

# P128 carries {=crm:P128 .owl:ObjectProperty label @en}
[<p>This property identifies an instance E90 Symbolic Object carried by an instance of E18 Physical Thing. Since an instance of E90 Symbolic Object is defined as an immaterial idealization over potentially multiple carriers, any individual realization on a particular physical carrier may be defective, due to deterioration or shortcomings in the process of creating the realization compared to the intended ideal. As long as such defects do not substantially affect the complete recognition of the respective symbolic object, it is still regarded as carrying an instance of this E90 Symbolic Object. If these defects are of scholarly interest, the particular realization can be modelled as an instance of E25 Human-Made Feature. Note, that any instance of E90 Symbolic Object incorporated (P165) in the carried symbolic object is also carried by the same instance of E18 Physical Thing.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E90 Symbolic Object] {+crm:E90 ?range}
[P130 shows features of] {+crm:P130 ?subPropertyOf}

# P129 is about {=crm:P129 .owl:ObjectProperty label @en}
[<p>This property documents that an instance of E89 Propositional Object has as subject an instance of E1 CRM Entity. </p><p>This differs from <em>P67 refers to (is referred to by)</em>, which refers to an instance of E1 CRM Entity, in that it describes the primary subject or subjects of an instance of E89 Propositional Object.</p>] {comment @en}
[E89 Propositional Object] {+crm:E89 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P67 refers to] {+crm:P67 ?subPropertyOf}

# P13 destroyed {=crm:P13 .owl:ObjectProperty label @en}
[<p>This property links an instance of E6 Destruction to an instance of E18 Physical Thing that has been destroyed by it. </p><p>Destruction implies the end of an item’s life as a subject of cultural documentation – the physical matter of which the item was composed may in fact continue to exist. An instance of E6 Destruction may be contiguous with an instance of E12 Production that brings into existence a derived object composed partly of matter from the destroyed object.</p>] {comment @en}
[E6 Destruction] {+crm:E6 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P93 took out of existence] {+crm:P93 ?subPropertyOf}

# P130 shows features of {=crm:P130 .owl:ObjectProperty label @en}
[<p>This property generalises the notions of “copy of” and “similar to” into a directed relationship, where the domain expresses the derivative or influenced item and the range the source or influencing item, if such a direction can be established. The property can also be used to express similarity in cases that can be stated between two objects only, without historical knowledge about its reasons. The property expresses a symmetric relationship in case no direction of influence can be established either from evidence on the item itself or from historical knowledge. This holds in particular for siblings of a derivation process from a common source or non-causal cultural parallels, such as some weaving patterns.</p><p>The <em>P130.1</em> <em>kind of similarity</em> property of the <em>P130 shows features of (features are also found on)</em> property enables the relationship between the domain and the range to be further clarified, in the sense from domain to range, if applicable. For example, it may be expressed if both items are product “of the same mould”, or if two texts “contain identical paragraphs”. </p><p>If the reason for similarity is a sort of derivation process, i.e. that the creator has used or had in mind the form of a particular thing during the creation or production, this process should be explicitly modelled. In these cases, <em>P130 shows features of </em>can be regarded as a shortcut of such a process. However, the current model does not contain any path specific enough to infer this property. Specializations of the CIDOC CRM may however be more explicit, for instance describing the use of moulds etc.</p><p>This property is not transitive. This property is irreflexive.</p>] {comment @en}
[E70 Thing] {+crm:E70 ?domain}
[E70 Thing] {+crm:E70 ?range}

# P132 spatiotemporally overlaps with {=crm:P132 .owl:ObjectProperty label @en}
[<p>This symmetric property associates two instances of E92 Spacetime Volume that have some of their extents in common. If only the fuzzy boundaries of the instances of E92 Spacetime Volume overlap, this property cannot be determined from observation alone and therefore should not be applied. However, there may be other forms of justification that the two instances of E92 Spacetime Volume must have some of their extents in common regardless of where and when precisely. </p><p>If this property holds for two instances of E92 Spacetime Volume then it cannot be the case that <em>P133 is spatiotemporally separated</em> from also holds for the same two instances. Furthermore, there are cases where neither <em>P132 spatiotemporally overlaps with</em> nor <em>P133 is spatiotemporally separated from</em> holds between two instances of E92 Spacetime Volume. This would occur where only an overlap of the fuzzy boundaries of the two instances of E92 Spacetime Volume occurs and no other evidence is available. </p><p>This property is not transitive. This property is symmetric. This property is reflexive.</p>] {comment @en}
[E92 Spacetime Volume] {+crm:E92 ?domain}
[E92 Spacetime Volume] {+crm:E92 ?range}

# P133 is spatiotemporally separated from {=crm:P133 .owl:ObjectProperty label @en}
[<p>This symmetric property associates two instances of E92 Spacetime Volume that have no extents in common. If only the fuzzy boundaries of the instances of E92 Spacetime Volume overlap, this property cannot be determined from observation alone and therefore should not be applied. However, there may be other forms of justification that the two instances of E92 Spacetime Volume must not have any of their extents in common regardless of where and when precisely. </p><p>If this property holds for two instances of E92 Spacetime Volume then it cannot be the case that <em>P132 spatiotemporally overlaps with</em> also holds for the same two instances. Furthermore, there are cases where neither <em>P132 spatiotemporally overlaps with</em> nor <em>P133 is spatiotemporally separated from</em> holds between two instances of E92 Spacetime Volume. This would occur where only an overlap of the fuzzy boundaries of the two instances of E92 Spacetime Volume occurs and no other evidence is available.</p><p>This property is not transitive. This property is symmetric. This property is irreflexive.</p>] {comment @en}
[E92 Spacetime Volume] {+crm:E92 ?domain}
[E92 Spacetime Volume] {+crm:E92 ?range}

# P134 continued {=crm:P134 .owl:ObjectProperty label @en}
[<p>This property associates two instances of E7 Activity, where the domain is considered as an intentional continuation of the range. A continuation of an activity may happen when the continued activity is still ongoing or after the continued activity has completely ended. The continuing activity may have started already before it decided to continue the other one. Continuation implies a coherence of intentions and outcomes of the involved activities.</p><p>This property is not transitive. This property is asymmetric.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E7 Activity] {+crm:E7 ?range}
[P15 was influenced by] {+crm:P15 ?subPropertyOf}
[crm:P176i] {+crm:P176i ?subPropertyOf}

# P135 created type {=crm:P135 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E55 Type, which is created in an instance of E83 Type Creation activity.</p>] {comment @en}
[E83 Type Creation] {+crm:E83 ?domain}
[E55 Type] {+crm:E55 ?range}
[P94 has created] {+crm:P94 ?subPropertyOf}

# P136 was based on {=crm:P136 .owl:ObjectProperty label @en}
[<p>This property identifies one or more instances of E1 CRM Entity that were used as evidence to declare a new instance of E55 Type.</p><p>The examination of these items is often the only objective way to understand the precise characteristics of a new type. Such items should be deposited in a museum or similar institution for that reason. The taxonomic role renders the specific relationship of each item to the type, such as “holotype” or “original element”.</p>] {comment @en}
[E83 Type Creation] {+crm:E83 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P15 was influenced by] {+crm:P15 ?subPropertyOf}

# P137 exemplifies {=crm:P137 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E1 CRM Entity with an instance of E55 Type for which it has been declared to be a particularly characteristic example.</p><p>The <em>P137.1 in the taxonomic role </em>property of <em>P137 exemplifies (is exemplified by)</em> allows differentiation of taxonomic roles. The taxonomic role renders the specific relationship of this example to the type, such as “prototypical”, “archetypical”, “lectotype”, etc. The taxonomic role “lectotype” is not associated with the instance of E83 Type Creation itself but is selected in a later phase.</p>] {comment @en}
[E1 CRM Entity] {+crm:E1 ?domain}
[E55 Type] {+crm:E55 ?range}
[P2 has type] {+crm:P2 ?subPropertyOf}

# P138 represents {=crm:P138 .owl:ObjectProperty label @en}
[<p>This property establishes the relationship between an instance of E36 Visual Item and the instance of E1 CRM Entity that it visually represents.</p><p>Any entity may be represented visually. This property is part of the fully developed path from E24 Physical Human-Made Thing through <em>P65 shows visual item (is shown by),</em> E36 Visual Item, <em>P138 represents (has representation) </em>to E1 CRM Entity, which is shortcut by <em>P62 depicts (is depicted by)</em>. <em>P138.1 mode of representation</em> allows the nature of the representation to be refined.</p><p>This property is also used for the relationship between an original and a digitisation of the original by the use of techniques such as digital photography, flatbed or infrared scanning. Digitisation is here seen as a process with a mechanical, causal component rendering the spatial distribution of structural and optical properties of the original and does not necessarily include any visual similarity identifiable by human observation.</p>] {comment @en}
[E36 Visual Item] {+crm:E36 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P67 refers to] {+crm:P67 ?subPropertyOf}

# P139 has alternative form {=crm:P139 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E41 Appellation with another instance of E41 Appellation that constitutes a derivative or variant of the former and that may also be used for identifying items identified by the former, in suitable contexts, independent from the particular item to be identified. This property should not be confused with additional variants of names used characteristically for a single, particular item, such as individual nicknames. It is a directed relationship, where the range expresses the derivative or variant and the domain the source of derivation or original form of variation, if such a direction can be established. Otherwise, the relationship is symmetric. </p><p>Multiple names assigned to an object, which do not apply to all things identified with the specific instance of E41 Appellation, should be modelled as repeated values of <em>P1 is identified by (identifies) </em>of this object.</p><p><em>P139.1 has type </em>allows the type of derivation to be refined, for instance “transliteration from Latin 1 to ASCII”. </p>] {comment @en}
[E41 Appellation] {+crm:E41 ?domain}
[E41 Appellation] {+crm:E41 ?range}

# P14 carried out by {=crm:P14 .owl:ObjectProperty label @en}
[<p>This property describes the active participation of an instance of E39 Actor in an instance of E7 Activity. </p><p>It implies causal or legal responsibility. The <em>P14.1 in the role of</em> property of the property specifies the nature of an Actor’s participation.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P140 assigned attribute to {=crm:P140 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E13 Attribute Assignment with the instance of E1 CRM Entity about which it made an attribution. The instance of E1 CRM Entity plays the role of the domain of the attribution. </p><p>The kind of attribution made should be documented using <em>P177 assigned property of type (is type of property assigned)</em>.</p>] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}

# P141 assigned {=crm:P141 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E13 Attribute Assignment with the instance of E1 CRM Entity used in the attribution. The instance of E1 CRM Entity here plays the role of the range of the attribution.</p><p>The kind of attribution made should be documented using <em>P177 assigned property of type (is type of property assigned)</em>.</p>] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}

# P142 used constituent {=crm:P142 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E15 Identifier Assignment with the instance of E90 Symbolic Object used as constituent of an instance of E42 Identifier in this act of assignment. </p>] {comment @en}
[E15 Identifier Assignment] {+crm:E15 ?domain}
[E90 Symbolic Object] {+crm:E90 ?range}
[P16 used specific object] {+crm:P16 ?subPropertyOf}

# P143 joined {=crm:P143 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor that becomes member of an instance of E74 Group in an instance of E85 Joining.</p><p>Joining events allow for describing actors becoming members of a group with the more detailed path E74 Group, <em>P144i gained member by</em>, E85 Joining, <em>P143 joined,</em> E39 Actor, compared to the shortcut offered by <em>P107 has current or former member (is current or former member of).</em></p>] {comment @en}
[E85 Joining] {+crm:E85 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P144 joined with {=crm:P144 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E74 Group of which an instance of E39 Actor becomes a member through an instance of E85 Joining.</p><p>Although a joining activity normally concerns only one instance of E74 Group, it is possible to imagine circumstances under which becoming member of one Group implies becoming member of another Group as well. </p><p>Joining events allow for describing people becoming members of a group with a more detailed path from E74 Group through, <em>P144i gained member by</em>, E85 Joining, <em>P143 joined</em>, E39 Actor, compared to the shortcut offered by <em>P107 has current or former member (is current or former member of)</em>.</p><p>The property <em>P144.1 kind of member</em> can be used to specify the type of membership or the role the member has in the group. </p>] {comment @en}
[E85 Joining] {+crm:E85 ?domain}
[E74 Group] {+crm:E74 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P145 separated {=crm:P145 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor that leaves an instance of E74 Group through an instance of E86 Leaving.</p>] {comment @en}
[E86 Leaving] {+crm:E86 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P146 separated from {=crm:P146 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E74 Group an instance of E39 Actor leaves through an instance of E86 Leaving.</p><p>Although a leaving activity normally concerns only one instance of E74 Group, it is possible to imagine circumstances under which leaving one E74 Group implies leaving another E74 Group as well.</p>] {comment @en}
[E86 Leaving] {+crm:E86 ?domain}
[E74 Group] {+crm:E74 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P147 curated {=crm:P147 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E87 Curation Activity with the instance of E78 Curated Holding with that is subject of that curation activity following some implicit or explicit curation plan.</p>] {comment @en}
[E87 Curation Activity] {+crm:E87 ?domain}
[E78 Curated Holding] {+crm:E78 ?range}

# P148 has component {=crm:P148 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E89 Propositional Object with a structural part of it that is by itself an instance of E89 Propositional Object.</p><p>This property is transitive. This property is asymmetric.</p>] {comment @en}
[E89 Propositional Object] {+crm:E89 ?domain}
[E89 Propositional Object] {+crm:E89 ?range}

# P15 was influenced by {=crm:P15 .owl:ObjectProperty label @en}
[<p>This is a high-level property, which captures the relationship between an instance of E7 Activity and anything, that is, an instance of E1 CRM Entity, that may have had some bearing upon it.</p><p>The property has more specific subproperties.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}

# P150 defines typical parts of {=crm:P150 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E55 Type “A” with an instance of E55 Type “B”, when items of type “A” typically form part of items of type “B”, such as “car motors” and “cars”. </p><p>It allows types to be organised into hierarchies based on one type describing a typical part of another. This property is equivalent to “broader term partitive (BTP)” as defined in ISO 2788 and “broaderPartitive” in SKOS.</p><p>This property is not transitive. This property is asymmetric.</p>] {comment @en}
[E55 Type] {+crm:E55 ?domain}
[E55 Type] {+crm:E55 ?range}

# P151 was formed from {=crm:P151 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E66 Formation with an instance of E74 Group from which the new group was formed preserving a sense of continuity such as in mission, membership or tradition.</p>] {comment @en}
[E66 Formation] {+crm:E66 ?domain}
[E74 Group] {+crm:E74 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P152 has parent {=crm:P152 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E21 Person with another instance of E21 Person who plays the role of the first instance’s parent, regardless of whether the relationship is biological parenthood, assumed or pretended biological parenthood or an equivalent legal status of rights and obligations obtained by a social or legal act. </p><p>This property is, among others, a shortcut of the fully developed paths from E21 Person through<em> P98i was born, </em>E67 Birth<em>, P96 by mother </em>to E21 Person<em>, </em>and<em> </em>from E21 Person through<em> P98i was born, </em>E67 Birth<em>, P97 from father </em>to E21 Person.</p><p>This property is not transitive. This property is irreflexive.</p>] {comment @en}
[E21 Person] {+crm:E21 ?domain}
[E21 Person] {+crm:E21 ?range}

# P156 occupies {=crm:P156 .owl:ObjectProperty label @en}
[<p>This property describes the largest volume in space, an instance of E53 Place, that an instance of E18 Physical Thing has occupied at any time during its existence, with respect to the reference space relative to the physical thing itself. This allows for describing the thing itself as a place that may contain other things, such as a box that may contain coins. In other words, it is the volume that contains all the points which the thing has covered at some time during its existence. The reference space for the associated place must be the one that is permanently at rest (<em>P157 is at rest relative to)</em> relative to the physical thing. For instances of E19 Physical Objects it is the one which is at rest relative to the object itself, i.e., which moves together with the object. For instances of E26 Physical Feature it is one which is at rest relative to the physical feature itself and the surrounding matter immediately connected to it. Therefore, there is a 1:1 relation between the instance E18 Physical Thing and the instance of E53 Place it occupies. We include in the occupied space the space filled by the matter of the physical thing and all its inner spaces. </p><p>This property implies the fully developed path from E18 Physical Thing through <em>P196 defines, </em>E92 Spacetime Volume,<em> P161 has spatial projection</em> to E53 Place. However, in contrast to <em>P156 occupies,</em> the property <em>P161 has spatial projection</em> does not constrain the reference space of the referred instance of E53 Place. </p><p>In contrast to <em>P156 occupies</em>, for the property <em>P53 has former or current location</em> the following holds: </p><p>It does not constrain the reference space of the referred instance of E53 Place. </p><p>It identifies a possibly wider instance of E53 Place at which a thing is or has been for some unspecified time-span. </p><p>If the reference space of the referred instance of E53 Place is not at rest with respect to the physical thing found there, the physical thing may move away after some time to another place and/or may have been at some other place before. The same holds for the fully developed path from E18 Physical Thing through <em>P196 defines</em>, E92 Spacetime Volume,<em> P161 has spatial projection</em> to E53 Place. </p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E53 Place] {+crm:E53 ?range}
[crm:P157i] {+crm:P157i ?subPropertyOf}
[P53 has former or current location] {+crm:P53 ?subPropertyOf}

# P157 is at rest relative to {=crm:P157 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E53 Place with the instance of E18 Physical Thing that determines a reference space for this instance of E53 Place by being at rest with respect to this reference space. The relative stability of form of an instance of E18 Physical Thing defines its default reference space. The reference space is not spatially limited to the referred thing. For example, a ship determines a reference space in terms of which other ships in its neighbourhood may be described. Larger constellations of matter, such as continental plates, may comprise many physical features that are at rest with them and define the same reference space. </p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P16 used specific object {=crm:P16 .owl:ObjectProperty label @en}
[<p>This property describes the use of material or immaterial things in a way essential to the performance or the outcome of an instance of E7 Activity. </p><p>This property typically applies to tools, instruments, moulds, raw materials and items embedded in a product. It implies that the presence of the object in question was a necessary condition for the action. For example, the activity of writing this text required the use of a computer. An immaterial thing can be used if at least one of its carriers is present. For example, the software tools on a computer.</p><p>Another example is the use of a particular name by a particular group of people over some span to identify a thing, such as a settlement. In this case, the physical carriers of this name are at least the people understanding its use.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E70 Thing] {+crm:E70 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}
[P15 was influenced by] {+crm:P15 ?subPropertyOf}

# P160 has temporal projection {=crm:P160 .owl:ObjectProperty label @en}
[<p>This property describes the temporal projection of an instance of E92 Spacetime Volume. The property <em>P4 has time-span</em> is the same as <em>P160 has temporal projection</em> if it is used to document an instance of E4 Period or any subclass of it. </p>] {comment @en}
[E92 Spacetime Volume] {+crm:E92 ?domain}
[E52 Time-Span] {+crm:E52 ?range}

# P161 has spatial projection {=crm:P161 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E92 Spacetime Volume with an instance of E53 Place that is the result of the spatial projection of the instance of the E92 Spacetime Volume on a reference space.</p><p>In general, there can be more than one useful reference space (for reference space see <em>P156 occupies</em> and <em>P157 is at rest relative to</em>) to describe the spatial projection of a spacetime volume, for example, in describing a sea battle, the difference between the battle ship and the seafloor as reference spaces. Thus, it can be seen that the projection is not unique.</p><p>The spatial projection is the actual spatial coverage of a spacetime volume, which normally has fuzzy boundaries except for instances of E92 Spacetime Volume which are geometrically defined in the same reference system as the range of this property and are an exception to this and do not have fuzzy boundaries. Modelling explicitly fuzzy spatial projections serves therefore as a common topological reference of different spatial approximations rather than absolute geometric determination, for instance for relating outer or inner spatial boundaries for the respective spacetime volumes.</p><p>The spatial projection is unique with respect to the reference system. For instance, there is exactly one spatial projection of Lord Nelson’s dying relative to the ship HMS Victory, i.e. the location of his body relative to the ship HMS Victory at the time of his death.</p><p>In case the domain of an instance of <em>P161 has spatial projection</em> is an instance of E4 Period, the spatial projection describes all areas that period was ever present at, for instance, the Roman Empire. </p><p>This property is part of the fully developed path from E18 Physical Thing through <em>P196 defines, </em>E92 Spacetime Volume,<em> P161 has spatial projection </em>to E53 Place, which in turn is implied by <em>P156 occupies (is occupied by). </em></p>] {comment @en}
[E92 Spacetime Volume] {+crm:E92 ?domain}
[E53 Place] {+crm:E53 ?range}

# P164 is temporally specified by {=crm:P164 .owl:ObjectProperty label @en}
[<p>This property relates an instance of E93 Presence with the instance of E52 Time-Span that defines the time-slice of the spacetime volume that this instance of E93 Presence is related to via the property <em>P166 was a presence of (had presence).</em></p><p>There are two typical cases for the determination of the related instance of E52 Time-Span. In the first, it is the temporal extent of an instance of E2 Temporal Entity (documented with <em>P4 has time-span (is time-span of)</em>): this then documents the simultaneity of the instance of E93 Presence and the instance of E2 Temporal Entity, even if the absolute time-span is not known, and can be regarded as a phenomenal time-span. In the second, the instance of E52 Time-Span is a date range declared in or derived from historical sources or provided by dating methods: this is a declarative time-span.</p>] {comment @en}
[E93 Presence] {+crm:E93 ?domain}
[E52 Time-Span] {+crm:E52 ?range}
[P160 has temporal projection] {+crm:P160 ?subPropertyOf}

# P165 incorporates {=crm:P165 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E73 Information Object with an instance of E90 Symbolic Object (or any of its subclasses) that was included in it.</p><p>This property makes it possible to recognise the autonomous status of the incorporated signs, which were created in a distinct context, and can be incorporated in many instances of E73 Information Object, and to highlight the difference between structural and accidental whole-part relationships between conceptual entities.</p><p>It accounts for many cultural facts that are quite frequent and significant: the inclusion of a poem in an anthology, the re-use of an operatic aria in a new opera, the use of a reproduction of a painting for a book cover or a CD booklet, the integration of textual quotations, the presence of lyrics in a song that sets those lyrics to music, the presence of the text of a play in a movie based on that play, etc.</p><p>In particular, this property allows for modelling relationships of different levels of symbolic specificity, such as the natural language words making up a particular text, the characters making up the words and punctuation, the choice of fonts and page layout for the characters.</p><p>When restricted to information objects, that is, seen as a property with E73 Information Object as domain and range the property is transitive.</p><p>A digital photograph of a manuscript page incorporates the text of a manuscript page, if the respective text is defined as a sequence of symbols of a particular type, such as Latin characters, and the resolution and quality of the digital image is sufficient to resolve these symbols so they are readable on the digital image.</p><p>This property is asymmetric.</p>] {comment @en}
[E73 Information Object] {+crm:E73 ?domain}
[E90 Symbolic Object] {+crm:E90 ?range}
[P106 is composed of] {+crm:P106 ?subPropertyOf}

# P166 was a presence of {=crm:P166 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E93 Presence with the instance of E92 Spacetime Volume of which it represents a temporal restriction (i.e. a time-slice). Instantiating this property constitutes a necessary part of the identity of the respective instance of E93 Presence. </p>] {comment @en}
[E93 Presence] {+crm:E93 ?domain}
[E92 Spacetime Volume] {+crm:E92 ?range}
[P10 falls within] {+crm:P10 ?subPropertyOf}

# P167 was within {=crm:P167 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E93 Presence with an instance of E53 Place that geometrically includes the spatial projection of the respective instance of E93 Presence. Besides others, this property may be used to state in which space an object has been for some known time, such as a room of a castle or in a drawer. It may also be used to describe a confinement of the spatial extent of some realm during a known time-span. </p><p>This property is a shortcut of the more fully developed path from E93 Presence through <em>P161 has spatial projection,</em> E53 Place, <em>P89 falls within (contains)</em> to E53 Place. </p>] {comment @en}
[E93 Presence] {+crm:E93 ?domain}
[E53 Place] {+crm:E53 ?range}

# P168 place is defined by {=crm:P168 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E53 Place with an instance of E94 Space Primitive that defines it. Syntactic variants or use of different scripts may result in multiple instances of E94 Space Primitive defining exactly the same place. Transformations between different reference systems always result in new definitions of places approximating each other and not in alternative definitions. </p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E94 Space Primitive] {+crm:E94 ?range}
[P1 is identified by] {+crm:P1 ?subPropertyOf}

# P169 defines spacetime volume {=crm:P169 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E95 Spacetime Primitive with the instance of E92 Spacetime Volume it defines. </p>] {comment @en}
[E95 Spacetime Primitive] {+crm:E95 ?domain}
[E92 Spacetime Volume] {+crm:E92 ?range}
[crm:P1i] {+crm:P1i ?subPropertyOf}

# P17 was motivated by {=crm:P17 .owl:ObjectProperty label @en}
[<p>This property describes an item or items that are regarded as a reason for carrying out the instance of E7 Activity. </p><p>For example, the discovery of a large hoard of treasure may call for a celebration, an order from headquarters can start a military manoeuvre. </p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P15 was influenced by] {+crm:P15 ?subPropertyOf}

# P170 defines time {=crm:P170 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E61 Time Primitive with the instance of E52 Time-Span that constitutes the interpretation of the terms of the time primitive as an extent in absolute, real time. </p><p>The quantification allows several instances of E61 Time Primitive that are each expressed in different syntactic forms, to define the same instance of E52 Time-Span.</p>] {comment @en}
[E61 Time Primitive] {+crm:E61 ?domain}
[E52 Time-Span] {+crm:E52 ?range}
[crm:P1i] {+crm:P1i ?subPropertyOf}

# P171 at some place within {=crm:P171 .owl:ObjectProperty label @en}
[<p>This property describes the maximum spatial extent within which an instance of E53 Place falls. Since instances of E53 Places may not have precisely known spatial extents, the CIDOC CRM supports statements about maximum spatial extents of instances of E53 Place. This property allows an instance of E53 Place’s maximum spatial extent (i.e., its outer boundary) to be assigned an instance of E94 Space Primitive value. </p><p>This property is a shortcut of the fully developed path from E53 Place<em>, P89 falls within, </em>E53 Place<em>, P168 place is defined by</em> to E94 Space Primitive through a declarative Place that is not explicitly documented, to a Space Primitive: declarative places are defined in CRMgeo (Doerr and Hiebel 2013).</p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E94 Space Primitive] {+crm:E94 ?range}

# P172 contains {=crm:P172 .owl:ObjectProperty label @en}
[<p>This property describes a minimum spatial extent which is contained within an instance of E53 Place. Since instances of E53 Place may not have precisely known spatial extents, the CIDOC CRM supports statements about minimum spatial extents of instances of E53 Place. This property allows an instance of E53 Place’s minimum spatial extent (i.e., its inner boundary or a point being within a Place) to be assigned an instance of E94 Space Primitive value. </p><p>This property is a shortcut of the fully developed path from E53 Place<em>, P89i contains, </em>E53 Place<em>, P168 place is defined by </em>to<em> </em>E94 Space Primitive.</p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E94 Space Primitive] {+crm:E94 ?range}

# P173 starts before or with the end of {=crm:P173 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity starts before or simultaneously with the end of the temporal extent of the range instance B of E2 Temporal Entity.</p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>start</sup> ≤ B<sup>end</sup> is true.</p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to the disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets, met-by, overlaps, starts, started-by, contains, finishes, finished-by, equals, during, overlapped by}.</p><p>This property is not transitive. </p><p><br/>
<img src="./version_images/images_7.1.3/image_01.png">
<br/></p><p>Figure 8: Temporal entity A starts before or with the end of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_02.png">
<br/></p><p>Figure 9: Temporal entity A starts before or with the end of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}

# P174 starts before the end of {=crm:P174 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity starts definitely before the end of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>start</sup> &lt; B<sup>end</sup> is true. </p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to a disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets, overlaps, starts, started-by, contains, finishes, finished-by, equals, during, overlapped by}</p><p>Typically, this property is a consequence of a known influence of some event on another event or activity, such as a novel written by someone being continued by someone else, or the knowledge of a defeat on a distant battlefield causing people to end their ongoing activities. This property is not transitive. This property is irreflexive. </p><p><br/>
<img src="./version_images/images_7.1.3/image_03.png">
<br/></p><p>Figure 10: Temporal entity A starts before the end of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_04.png">
<br/></p><p>Figure 11: Temporal entity A starts before the end of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P173 starts before or with the end of] {+crm:P173 ?subPropertyOf}

# P175 starts before or with the start of {=crm:P175 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity starts before or simultaneously with the start of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>start</sup> ≤ B<sup>start</sup> is true.</p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to a disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets, overlaps, starts, started-by, contains, finished-by, equals}</p><p>In a model with fuzzy borders, this property will not be transitive.</p><p>This property is irreflexive.</p><p><br/>
<img src="./version_images/images_7.1.3/image_05.png">
<br/></p><p>Figure 12: Temporal entity A starts before or with the start of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_06.png">
<br/></p><p>Figure 13: Temporal entity A starts before or with the start of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P174 starts before the end of] {+crm:P174 ?subPropertyOf}

# P176 starts before the start of {=crm:P176 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity starts definitely before the start of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>start</sup> &lt; B<sup>start</sup> is true. </p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to a disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets, overlaps, contains, finished-by}. This property is transitive. This property is asymmetric.</p><p><br/>
<img src="./version_images/images_7.1.3/image_07.png">
<br/></p><p>Figure 14: Temporal entity A starts before the start of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_08.png">
<br/></p><p>Figure 15: Temporal entity A starts before the start of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P175 starts before or with the start of] {+crm:P175 ?subPropertyOf}

# P177 assigned property of type {=crm:P177 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E13 Attribute Assignment with the type of property or relation that this assignment maintains to hold between the item to which it assigns an attribute and the attribute itself. Note that the properties defined by the CIDOC CRM also constitute instances of E55 Type themselves. The direction of the assigned property of type is understood to be from the attributed item (the range of property <em>P140 assigned attribute to</em>) to the attribute item (the range of the property <em>P141 assigned</em>). More than one property type may be assigned to hold between two items.</p><p>A comprehensive explanation about refining CIDOC CRM concepts by E55 Type is given in the section “About Types” in the section on “Specific Modelling Constructs” of this document.</p>] {comment @en}
[E13 Attribute Assignment] {+crm:E13 ?domain}
[E55 Type] {+crm:E55 ?range}
[P2 has type] {+crm:P2 ?subPropertyOf}

# P179 had sales price {=crm:P179 .owl:ObjectProperty label @en}
[<p>This property establishes the relationship between an instance of E96 Purchase and the instance of E97 Monetary Amount that forms the compensation for the transaction. The monetary amount agreed upon may change in the course of the purchase activity.</p>] {comment @en}
[E96 Purchase] {+crm:E96 ?domain}
[E97 Monetary Amount] {+crm:E97 ?range}

# P180 has currency {=crm:P180 .owl:ObjectProperty label @en}
[<p>This property establishes the relationship between an instance of E97 Monetary Amount and the instance of E98 Currency that it is measured in.</p>] {comment @en}
[E97 Monetary Amount] {+crm:E97 ?domain}
[E98 Currency] {+crm:E98 ?range}
[P91 has unit] {+crm:P91 ?subPropertyOf}

# P182 ends before or with the start of {=crm:P182 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity ends before or simultaneously with the start of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>end</sup> ≤ B<sup>start</sup> is true.</p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to a disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets}.</p><p>This property is transitive. This property is asymmetric.</p><p><br/>
<img src="./version_images/images_7.1.3/image_09.png">
<br/></p><p>Figure 16: Temporal entity A ends before or with the start of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_10.png">
<br/></p><p>Figure 17: Temporal entity A ends before or with the start of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P176 starts before the start of] {+crm:P176 ?subPropertyOf}
[P185 ends before the end of] {+crm:P185 ?subPropertyOf}

# P183 ends before the start of {=crm:P183 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity ends definitely before the start of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>end</sup> &lt; B<sup>start</sup> is true. </p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to the following Allen temporal relation (Allen, 1983) : {before}.</p><p>This property is transitive. This property is asymmetric. </p><p><br/>
<img src="./version_images/images_7.1.3/image_11.png">
<br/></p><p>Figure 18: Temporal entity A ends before the start of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_12.png">
<br/></p><p>Figure 19: Temporal entity A ends before the start of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P182 ends before or with the start of] {+crm:P182 ?subPropertyOf}

# P184 ends before or with the end of {=crm:P184 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity ends before or simultaneously with the end of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>end</sup> ≤ B<sup>end </sup>is true. </p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to a disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets, overlaps, finished by, start, equals, during, finishes}.</p><p>This property is irreflexive</p><p><br/>
<img src="./version_images/images_7.1.3/image_13.png">
<br/></p><p>Figure 20: Temporal entity A ends before or with the end of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_14.png">
<br/></p><p>Figure 21: Temporal entity A ends before or with the end of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P174 starts before the end of] {+crm:P174 ?subPropertyOf}

# P185 ends before the end of {=crm:P185 .owl:ObjectProperty label @en}
~~~ {comment @en}
<p>This property specifies that the temporal extent of the domain instance A of E2 Temporal Entity ends definitely before the end of the temporal extent of the range instance B of E2 Temporal Entity. </p><p>In other words, if A = [A<sup>start</sup>, A<sup>end</sup>] and B = [B<sup>start</sup>, B<sup>end</sup>], it means A<sup>end</sup> &lt; B<sup>end </sup>is true. </p><p>This property is part of the set of temporal primitives P173 – P176, P182 – P185.</p><p>This property corresponds to a disjunction (logical OR) of the following Allen temporal relations (Allen, 1983): {before, meets, overlaps, starts, during}.</p><p>This property is transitive. This property is asymmetric.</p><p><br/>
<img src="./version_images/images_7.1.3/image_15.png">
<br/></p><p>Figure 22: Temporal entity A ends before the end of temporal entity B. Here A is longer than B</p><p><br/>
<img src="./version_images/images_7.1.3/image_16.png">
<br/></p><p>Figure 23: Temporal entity A ends before the end of temporal entity B. Here A is shorter than B</p>
~~~

[E2 Temporal Entity] {+crm:E2 ?domain}
[E2 Temporal Entity] {+crm:E2 ?range}
[P184 ends before or with the end of] {+crm:P184 ?subPropertyOf}

# P186 produced thing of product type {=crm:P186 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E12 Production with the instance of E99 Production Type, that is, the type of the things it produces.</p>] {comment @en}
[E12 Production] {+crm:E12 ?domain}
[E99 Product Type] {+crm:E99 ?range}

# P187 has production plan {=crm:P187 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E99 Product Type with an instance of E29 Design or Procedure that completely determines the production of instances of E18 Physical Thing. The resulting instances of E18 Physical Thing are considered exemplars of this instance of E99 Product Type when the process specified is correctly executed. Note that the respective instance of E29 Design or Procedure may not necessarily be fixed in a written/graphical form, and may require the use of tools or models unique to the product type. The same instance of E99 Product Type may be associated with several variant plans.</p>] {comment @en}
[E99 Product Type] {+crm:E99 ?domain}
[E29 Design or Procedure] {+crm:E29 ?range}

# P188 requires production tool {=crm:P188 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E99 Product Type with an instance of E19 Physical Object that is needed for the production of an instance of E18 Physical Thing. When the process of production is correctly executed in accordance with the plan and using the specified instance of E19 Physical Object, the resulting instance of E18 Physical Thing is considered an exemplar of this instance of E99 Product Type. The instance of E19 Physical Object may bear distinct features that are transformed into characteristic features of the resulting instance of E18 Physical Thing. Examples include models and moulds.</p>] {comment @en}
[E99 Product Type] {+crm:E99 ?domain}
[E19 Physical Object] {+crm:E19 ?range}

# P189 approximates {=crm:P189 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E53 Place with another instance of E53 Place, which is defined in the same reference space, and which is used to approximate the former. The property does not necessarily state the quality or accuracy of this approximation, but rather indicates the use of the first instance of place to approximate the second.</p><p>In common documentation practice, find or encounter spots e.g. in archaeology, botany or zoology are often related to the closest village, river or other named place without detailing the relation, e.g. if it is located within the village or in a certain distance of the specified place. In this case the stated “phenomenal” place found in the documentation can be seen as an approximation of the actual encounter spot without more specific knowledge. </p><p>In more recent documentation often point coordinate information is provided that originates from GPS measurements or georeferencing from a map. This point coordinate information does not state the actual place of the encounter spot but tries to approximate it with a “declarative” place. The accuracy depends on the methodology used when creating the coordinates. It may be dependent on technical limitations like GPS accuracy but also on the method where the GPS location is taken in relation to the measured feature. If the methodology is known a maximum deviation from the measured point can be calculated and the encounter spot or feature may be related to the resulting circle using an instance of <em>P171 at some place within</em>.</p><p>This property is not transitive. This property is reflexive.</p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E53 Place] {+crm:E53 ?range}

# P19 was intended use of {=crm:P19 .owl:ObjectProperty label @en}
[<p>This property relates an instance of E7 Activity with instances of E71 Human-Made Thing, created specifically for use in the activity. </p><p>This is distinct from the intended use of an item in some general type of activity such as the book of common prayer which was intended for use in Church of England services (see <em>P101</em> <em>had as general use (was use of)</em>).</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E71 Human-Made Thing] {+crm:E71 ?range}

# P190 has symbolic content {=crm:P190 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E90 Symbolic Object with a complete, identifying representation of its content in the form of an instance of E62 String. </p><p>This property only applies to instances of E90 Symbolic Object that can be represented completely in this form. The representation may be more specific than the symbolic level defining the identity condition of the represented. This depends on the type of the symbolic object represented. For instance, if a name has type “Modern Greek character sequence”, it may be represented in a loss-free Latin transcription, meaning however the sequence of Greek letters. </p><p>As another example, if the represented object has type “English words sequence”, American English or British English spelling variants may be chosen to represent the English word “colour” without defining a different symbolic object. If a name has type “European traditional name”, no particular string may define its content.</p>] {comment @en}
[E90 Symbolic Object] {+crm:E90 ?domain}
[E62 String] {+crm:E62 ?range}
[P3 has note] {+crm:P3 ?subPropertyOf}

# P191 had duration {=crm:P191 .owl:ObjectProperty label @en}
[<p>This property describes the length of time covered by an instance of E52 Time-Span. It allows an instance of E52 Time-Span to be associated with an instance of E54 Dimension representing duration independent from the actual beginning and end. Indeterminacy of the duration value can be expressed by assigning a numerical interval to the property <em>P90 has value</em> of E54 Dimension.</p>] {comment @en}
[E52 Time-Span] {+crm:E52 ?domain}
[E54 Dimension] {+crm:E54 ?range}

# P195 was a presence of {=crm:P195 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E93 Presence with the instance of E18 Physical Thing of which it represents a temporal restriction (i.e. a time-slice) of the thing’s trajectory through spacetime. In other words, it describes where the instance of E18 Physical Thing was or moved around within a given time-span. Instantiating this property constitutes a necessary part of the identity of the respective instance of E93 Presence.</p><p>This property is a shortcut of the fully developed path from E18 Physical Thing through <em>P196 defines</em>, E92 Spacetime Volume, <em>P166 was a presence of (had presence)</em> to E93 Presence. </p>] {comment @en}
[E93 Presence] {+crm:E93 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P196 defines {=crm:P196 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E18 Physical Thing with the instance of E92 Spacetime Volume that constitutes the complete trajectory of its geometric extent through spacetime for the whole time of the existence of the instance of E18 Physical Thing.</p><p>An instance of E18 Physical Thing not only occupies a particular geometric space at each instant of its existence, but in the course of its existence it also forms a trajectory through spacetime, which occupies a real, that is phenomenal, volume in spacetime, i.e. the instance of E92 Spacetime Volume this property associates it with. This real spatiotemporal extent of the instance of E18 Physical Thing is regarded as being unique, in all its details and fuzziness; the identity and existence of the instance of E92 Spacetime Volume depend uniquely on the identity of the instance of E18 Physical Thing, whose existence defines it. It constitutes a phenomenal spacetime volume as defined in CRMgeo (Doerr &amp; Hiebel, 2013).</p><p>Included in this spacetime volume are both the spaces filled by the matter of the physical thing and any inner space that may exist, for instance the interior of a box. Physical things consisting of aggregations of physically unconnected objects, such as a set of chessmen, occupy a finite number of individually contiguous subsets of this spacetime volume equal to the number of objects that constitute the set and that are never connected during its existence.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E92 Spacetime Volume] {+crm:E92 ?range}

# P197 covered parts of {=crm:P197 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E93 Presence with an instance of E53 Place that geometrically overlaps with the spatial projection of the respective instance of E93 Presence. A use case of this property is to state through which places an object or an instance of E21 Person has or was moved within a given time-span. It may also be used to describe a partial or complete, temporary or permanent extension of the spatial extent of some realm into a neighbouring region during a known time-span. It may also be used to describe a partial or complete, temporary or permanent extension of the spatial extent of some realm into a neighbouring region during a known time-span. </p><p>This property is a shortcut of the more fully developed path from E93 Presence through <em>P161 has spatial projection</em>, E53 Place<em>, P121 overlaps with,</em> to E53 Place.</p>] {comment @en}
[E93 Presence] {+crm:E93 ?domain}
[E53 Place] {+crm:E53 ?range}

# P198 holds or supports {=crm:P198 .owl:ObjectProperty label @en}
[<p>This property relates one instance of E18 Physical Thing which acts as a container or support to a supported or contained instance of E18 Physical Thing. Typical examples of E18 Physical Things which are intended to function as a container or support include shelves, folders or boxes. These containers or supports provide a stable surface which is intended for other physical objects to be placed upon for storage, display, transport or other similar functions.</p><p>This property is a shortcut of the more fully developed path from E18 Physical Thing through <em>P59 has section</em>, E53 Place, <em>P53i is former or current location</em> <em>of,</em> to E18 Physical Thing. It is not a sub-property of <em>P46 is composed of</em>, as the held or supported object is not a component of the container or support.</p><p>This property can be used to avoid explicitly instantiating the E53 Place which is defined by an instance of E18 Physical Thing, especially when the only intended use of that instance of E18 Physical Thing is to act as a container or surface for the storage of other instances of E18 Physical Thing. The place’s existence is defined by the existence of the container or surface, and will go out of existence at the same time as the destruction of the container or surface. </p><p>This property is transitive. This property is asymmetric.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P2 has type {=crm:P2 .owl:ObjectProperty label @en}
[<p>This property allows sub-typing of CIDOC CRM entities –a form of specialisation – through the use of a terminological hierarchy, or thesaurus. </p><p>The CIDOC CRM is intended to focus on the high-level entities and relationships needed to describe data structures. Consequently, it does not specialise entities any further than is required for this immediate purpose. However, entities in the isA hierarchy of the CIDOC CRM may by specialised into any number of sub-entities, which can be defined in the E55 Type hierarchy. E41 Appellation, for example, may be specialised into “e-mail address”, “telephone number”, “post office box”, “URL”, etc., none of which figures explicitly in the CIDOC CRM class hierarchy. A comprehensive explanation about refining CIDOC CRM concepts by E55 Type is given in the section “About Types” in the section on “Specific Modelling Constructs” of this document.</p><p>This property is a shortcut for the path from E1 CRM Entity through <em>P41i was classified by, </em>E17 Type Assignment, <em>P42 assigned </em>to<em> </em>E55 Type.</p>] {comment @en}
[E1 CRM Entity] {+crm:E1 ?domain}
[E55 Type] {+crm:E55 ?range}

# P20 had specific purpose {=crm:P20 .owl:ObjectProperty label @en}
[<p>This property describes the relationship between a preparatory activity, an instance of E7 Activity and the instance of E5 Event that it is intended as a preparation for.</p><p>This includes activities, orders and other organisational actions, taken in preparation for other activities or events. </p><p><em>P20 had specific purpose (was purpose of)</em> implies that the activity succeeded in achieving its aim. If it does not succeed, such as the setting of a trap that did not catch anything, the unrealized intention should be documented using <em>P21 had general purpose (was purpose of): </em>E55 Type and/or <em>P33 used specific technique (was used by):</em> E29 Design or Procedure.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E5 Event] {+crm:E5 ?range}

# P21 had general purpose {=crm:P21 .owl:ObjectProperty label @en}
[<p>This property describes an intentional relationship between an instance of E7 Activity and some general goal or purpose, described as an instance of E55 Type. </p><p>This may involve activities intended as preparation for some type of activity or event. <em>P21 had general purpose (was purpose of)</em> differs from <em>P20 had specific purpose (was purpose of</em> in that no specific event is implied as the purpose. </p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E55 Type] {+crm:E55 ?range}

# P22 transferred title to {=crm:P22 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor that acquires the legal ownership of an object as a result of an instance of E8 Acquisition. </p><p>The property will typically describe an Actor purchasing or otherwise acquiring an object from another Actor. However, title may also be acquired without any corresponding loss of title by another Actor, through legal fieldwork such as hunting, shooting, or fishing.</p><p>In reality, the title is either transferred to or from someone, or both.</p>] {comment @en}
[E8 Acquisition] {+crm:E8 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P14 carried out by] {+crm:P14 ?subPropertyOf}

# P23 transferred title from {=crm:P23 .owl:ObjectProperty label @en}
[<p>This property identifies the instance(s) of E39 Actor who relinquish legal ownership as the result of an instance of E8 Acquisition.</p><p>The property will typically be used to describe a person donating or selling an object to a museum. In reality, the title is either transferred to or from someone, or both.</p>] {comment @en}
[E8 Acquisition] {+crm:E8 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P14 carried out by] {+crm:P14 ?subPropertyOf}

# P24 transferred title of {=crm:P24 .owl:ObjectProperty label @en}
[<p>This property identifies the instance(s) of E18 Physical Thing involved in an instance of E8 Acquisition. </p><p>In reality, an acquisition must refer to at least one transferred item.</p>] {comment @en}
[E8 Acquisition] {+crm:E8 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P25 moved {=crm:P25 .owl:ObjectProperty label @en}
[<p>This property identifies an instance of E19 Physical Object that was moved by an instance of E9 Move. A move must concern at least one object.</p><p>The property implies the object’s passive participation. For example, Monet’s painting “Impression sunrise” was moved for the first Impressionist exhibition in 1874. </p>] {comment @en}
[E9 Move] {+crm:E9 ?domain}
[E19 Physical Object] {+crm:E19 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}

# P26 moved to {=crm:P26 .owl:ObjectProperty label @en}
[<p>This property identifies a destination, an instance of E53 Place, of an instance of E9 Move. </p><p>A move will be linked to a destination, such as the move of an artifact from storage to display. A move may be linked to many terminal instances of E53 Place by multiple instances of this property. In this case the move describes a distribution of a set of objects. The area of the move includes the origin(s), route and destination(s).</p><p>Therefore, the described destination is an instance of E53 Place which <em>P89 falls within (contains) </em>the instance of E53 Place the move <em>P7 took place at.</em></p>] {comment @en}
[E9 Move] {+crm:E9 ?domain}
[E53 Place] {+crm:E53 ?range}

# P27 moved from {=crm:P27 .owl:ObjectProperty label @en}
[<p>This property identifies an origin, an instance of E53 Place, of an instance of E9 Move.</p><p>A move will be linked to an origin, such as the move of an artifact from storage to display. A move may be linked to many starting instances of E53 Place by multiple instances of this property. In this case the move describes the picking up of a set of objects. The area of the move includes the origin(s), route and destination(s).</p><p>Therefore, the described origin is an instance of E53 Place which <em>P89 falls within (contains) </em>the instance of E53 Place the move <em>P7 took place at.</em></p>] {comment @en}
[E9 Move] {+crm:E9 ?domain}
[E53 Place] {+crm:E53 ?range}

# P28 custody surrendered by {=crm:P28 .owl:ObjectProperty label @en}
[<p>This property identifies the instance(s) of E39 Actor who surrender custody of an instance of E18 Physical Thing in an instance of E10 Transfer of Custody. </p><p>The property will typically describe an Actor surrendering custody of an object when it is handed over to someone else’s care. On occasion, physical custody may be surrendered involuntarily, e.g. through accident, loss, or theft.</p><p>In reality, custody is either transferred to someone or from someone, or both.</p>] {comment @en}
[E10 Transfer of Custody] {+crm:E10 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P14 carried out by] {+crm:P14 ?subPropertyOf}

# P29 custody received by {=crm:P29 .owl:ObjectProperty label @en}
[<p>This property identifies the instance(s) of E39 Actor who receive custody of an instance of E18 Physical Thing in an instance of E10 Transfer of Custody. </p><p>The property will typically describe Actors receiving custody of an object when it is handed over from another Actor’s care. On occasion, physical custody may be received involuntarily or illegally, e.g. through accident, unsolicited donation, or theft.</p><p>In reality, custody is either transferred to someone or from someone, or both.</p>] {comment @en}
[E10 Transfer of Custody] {+crm:E10 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P14 carried out by] {+crm:P14 ?subPropertyOf}

# P3 has note {=crm:P3 .owl:ObjectProperty label @en}
[<p>This property is a container for all informal descriptions about an object that have not been expressed in terms of CIDOC CRM constructs. </p><p>In particular, it captures the characterisation of the item itself, its internal structures, appearance, etc.</p><p>Like property <em>P2 has type (is type of)</em>, this property is a consequence of the restricted focus of the CIDOC CRM. The aim is not to capture, in a structured form, everything that can be said about an item; indeed, the CIDOC CRM formalism is not regarded as sufficient to express everything that can be said. Good practice requires use of distinct note fields for different aspects of a characterisation. The <em>P3.1 has type </em>property of <em>P3 has note</em> allows differentiation of specific notes, e.g. “construction”, “decoration”, etc. </p><p>An item may have many notes, but a note is attached to a specific item.</p>] {comment @en}
[E1 CRM Entity] {+crm:E1 ?domain}
[E62 String] {+crm:E62 ?range}

# P30 transferred custody of {=crm:P30 .owl:ObjectProperty label @en}
[<p>This property identifies the instance(s) of E18 Physical Thing concerned in an instance of E10 Transfer of Custody. </p><p>The property will typically describe the object that is handed over by an instance of E39 Actor to the custody of another instance of E39 Actor. On occasion, physical custody may be transferred involuntarily or illegally, e.g. through accident, unsolicited donation, or theft.</p>] {comment @en}
[E10 Transfer of Custody] {+crm:E10 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P31 has modified {=crm:P31 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E18 Physical Thing modified in an instance of E11 Modification.</p>] {comment @en}
[E11 Modification] {+crm:E11 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}

# P32 used general technique {=crm:P32 .owl:ObjectProperty label @en}
[<p>This property identifies the technique or method, modelled as an instance of E55 Type, that was employed in an instance of E7 Activity. </p><p>These techniques should be drawn from an external E55 Type hierarchy of consistent terminology of general techniques or methods such as embroidery, oil-painting, carbon dating, etc. Specific documented techniques should be described as instances of E29 Design or Procedure. </p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E55 Type] {+crm:E55 ?range}
[P125 used object of type] {+crm:P125 ?subPropertyOf}

# P33 used specific technique {=crm:P33 .owl:ObjectProperty label @en}
[<p>This property identifies a specific instance of E29 Design or Procedure in order to carry out an instance of E7 Activity or parts of it. </p><p>The property differs from <em>P32 used general technique (was technique of)</em> in that P33 refers to an instance of E29 Design or Procedure, which is a concrete information object in its own right rather than simply being a term or a method known by tradition. </p><p>Typical examples would include intervention plans for conservation or the construction plans of a building.</p>] {comment @en}
[E7 Activity] {+crm:E7 ?domain}
[E29 Design or Procedure] {+crm:E29 ?range}
[P16 used specific object] {+crm:P16 ?subPropertyOf}

# P34 concerned {=crm:P34 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E18 Physical Thing that was assessed during an instance of E14 Condition Assessment. </p><p>Conditions may be assessed either by direct observation or using recorded evidence. In the latter case the instance of E18 Physical Thing does not need to be present or extant at the time of assessment.</p>] {comment @en}
[E14 Condition Assessment] {+crm:E14 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P140 assigned attribute to] {+crm:P140 ?subPropertyOf}

# P35 has identified {=crm:P35 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E3 Condition State that was observed in an instance of E14 Condition Assessment activity.</p>] {comment @en}
[E14 Condition Assessment] {+crm:E14 ?domain}
[E3 Condition State] {+crm:E3 ?range}
[P141 assigned] {+crm:P141 ?subPropertyOf}

# P37 assigned {=crm:P37 .owl:ObjectProperty label @en}
[<p>This property records the identifier that was assigned to an item in an instance of E15 Identifier Assignment.</p><p>The same identifier may be assigned on more than one occasion.</p><p>An identifier might be created prior to an assignment.</p>] {comment @en}
[E15 Identifier Assignment] {+crm:E15 ?domain}
[E42 Identifier] {+crm:E42 ?range}
[P141 assigned] {+crm:P141 ?subPropertyOf}

# P38 deassigned {=crm:P38 .owl:ObjectProperty label @en}
[<p>This property records the identifier that was deassigned from an instance of E1 CRM Entity.</p><p>De-assignment of an identifier may be necessary when an item is taken out of an inventory, a new numbering system is introduced or items are merged or split up. </p><p>The same identifier may be deassigned on more than one occasion.</p>] {comment @en}
[E15 Identifier Assignment] {+crm:E15 ?domain}
[E42 Identifier] {+crm:E42 ?range}
[P141 assigned] {+crm:P141 ?subPropertyOf}

# P39 measured {=crm:P39 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E16 Measurement with the instance of E18 Physical Thing upon which it acted. The instance of E16 Measurement is specific to the measured object. An instance of E18 Physical Thing may be measured more than once with different results, constituting different instances of E16 Measurement.<strong> </strong></p>] {comment @en}
[E16 Measurement] {+crm:E16 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}
[P140 assigned attribute to] {+crm:P140 ?subPropertyOf}

# P4 has time-span {=crm:P4 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E2 Temporal Entity with the instance of E52 Time-Span during which it was on-going. The associated instance of E52 Time-Span is understood as the real time-span during which the phenomena making up the temporal entity instance were active. More than one instance of E2 Temporal Entity may share a common instance of E52 Time-Span only if they come into being and end being due to identical declarations or events.</p>] {comment @en}
[E2 Temporal Entity] {+crm:E2 ?domain}
[E52 Time-Span] {+crm:E52 ?range}

# P40 observed dimension {=crm:P40 .owl:ObjectProperty label @en}
[<p>This property records the dimension that was observed in an E16 Measurement Event.</p><p>E54 Dimension can be any quantifiable aspect of E70 Thing. Weight, image colour depth and monetary value are dimensions in this sense. One measurement activity may determine more than one dimension of one object.</p><p>Dimensions may be determined either by direct observation or using recorded evidence. In the latter case the measured Thing does not need to be present or extant.</p><p>Even though knowledge of the value of a dimension requires measurement, the dimension may be an object of discourse prior to, or even without, any measurement being made.</p>] {comment @en}
[E16 Measurement] {+crm:E16 ?domain}
[E54 Dimension] {+crm:E54 ?range}
[P141 assigned] {+crm:P141 ?subPropertyOf}

# P41 classified {=crm:P41 .owl:ObjectProperty label @en}
[<p>This property records the item to which a type was assigned in an E17 Type Assignment activity.</p><p>Any instance of a CIDOC CRM entity may be assigned a type through type assignment. Type assignment events allow a more detailed path from E1 CRM Entity<em> </em>through<em> P41i was classified by, </em>E17 Type Assignment<em>, P42 assigned, </em>to E55 Type for assigning types to objects compared to the shortcut offered by <em>P2</em> <em>has type (is type of)</em>.</p>] {comment @en}
[E17 Type Assignment] {+crm:E17 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P140 assigned attribute to] {+crm:P140 ?subPropertyOf}

# P42 assigned {=crm:P42 .owl:ObjectProperty label @en}
[<p>This property records the type that was assigned to an entity by an E17 Type Assignment activity. </p><p>Type assignment events allow a more detailed path from E1 CRM Entity<em> </em>through<em> P41i was classified by, </em>E17 Type Assignment<em>, P42 assigned, </em>to E55 Type for assigning types to objects compared to the shortcut offered by <em>P2</em> <em>has type (is type of)</em>.</p><p>For example, a fragment of an antique vessel could be assigned the type “attic red figured belly handled amphora” by expert A. The same fragment could be assigned the type “shoulder handled amphora” by expert B.</p><p>A Type may be intellectually constructed independent from assigning an instance of it.</p>] {comment @en}
[E17 Type Assignment] {+crm:E17 ?domain}
[E55 Type] {+crm:E55 ?range}
[P141 assigned] {+crm:P141 ?subPropertyOf}

# P43 has dimension {=crm:P43 .owl:ObjectProperty label @en}
[<p>This property records an instance of E54 Dimension of some instance of E70 Thing.</p><p>In the case that the recorded property is a result of a measurement of an instance of E18 Physical Thing, this property is a shortcut of the more fully developed path from E18 Physical Thing<em> </em>through<em> P39i was measured by, </em>E16 Measurement<em>, P40 observed dimension </em>to<em> </em>E54 Dimension. </p><p>It offers no information about how and when an E54 Dimension was established, nor by whom. Knowledge about an instance of E54 Dimension need not be the result of a measurement; it may be the result of evaluating data or other information, which should be documented as an instance of E13 Attribute Assignment. </p><p>An instance of E54 Dimension is specific to an instance of E70 Thing.</p>] {comment @en}
[E70 Thing] {+crm:E70 ?domain}
[E54 Dimension] {+crm:E54 ?range}

# P44 has condition {=crm:P44 .owl:ObjectProperty label @en}
[<p>This property records an E3 Condition State for some E18 Physical Thing.</p><p>This property is a shortcut of the more fully developed path from E18 Physical Thing<em> </em>through<em> P34i was assessed by, </em>E14 Condition Assessment<em>, P35 has identified </em>to<em> </em>E3 Condition State. It offers no information about how and when the E3 Condition State was established, nor by whom. </p><p>An instance of E3 Condition State is specific to an instance of E18 Physical Thing.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E3 Condition State] {+crm:E3 ?range}

# P45 consists of {=crm:P45 .owl:ObjectProperty label @en}
[<p>This property identifies the instances of E57 Materials of which an instance of E18 Physical Thing is composed.</p><p>All physical things consist of physical materials. <em>P45 consists of (is incorporated in)</em> allows the different materials to be recorded. <em>P45 consists of (is incorporated in)</em> refers here to observed material as opposed to the consumed raw material.</p><p>A material, such as a theoretical alloy, may not have any physical instances.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E57 Material] {+crm:E57 ?range}

# P46 is composed of {=crm:P46 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E18 Physical Thing with another instance of Physical Thing that forms part of it. The spatial extent of the composing part is included in the spatial extent of the whole.</p><p>Component elements, since they are themselves instances of E18 Physical Thing, may be further analysed into sub-components, thereby creating a hierarchy of part decomposition. An instance of E18 Physical Thing may be shared between multiple wholes, for example two buildings may share a common wall. This property does not specify when and for how long a component element resided in the respective whole. If a component is not part of a whole from the beginning of existence or until the end of existence of the whole, the classes E79 Part Addition and E90 Part Removal can be used to document when a component became part of a particular whole and/or when it stopped being a part of it. For the time-span of being part of the respective whole, the component is completely contained in the place the whole occupies.</p><p>This property is intended to describe specific components that are<strong> </strong>individually documented, rather than general aspects. Overall descriptions of the structure of an instance of E18 Physical Thing are captured by the <em>P3</em> <em>has note</em> property.</p><p>The instances of E57 Material of which an instance of E18 Physical Thing is composed should be documented using <em>P45</em> <em>consists of (is incorporated in)</em>.</p><p>This property is transitive and asymmetric.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P48 has preferred identifier {=crm:P48 .owl:ObjectProperty label @en}
[<p>This property records the preferred instance of E42 Identifier that was used to identify an instance of E1 CRM Entity at the time this property was recorded.</p><p>More than one preferred identifier may have been assigned to an item over time.</p><p>Use of this property requires an external mechanism for assigning temporal validity to the respective CIDOC CRM instance.</p><p>The fact that an identifier is a preferred one for an organisation can be better expressed in a context independent form by assigning a suitable instance of E55 Type to the respective instance of E15 Identifier Assignment using the <em>P2 has type</em> property.</p>] {comment @en}
[E1 CRM Entity] {+crm:E1 ?domain}
[E42 Identifier] {+crm:E42 ?range}
[P1 is identified by] {+crm:P1 ?subPropertyOf}

# P49 has former or current keeper {=crm:P49 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor who has or has had custody of an instance of E18 Physical Thing at some time. This property leaves open the question if parts of this physical thing have been added or removed during the time-spans it has been under the custody of this actor, but it is required that at least a part which can unambiguously be identified as representing the whole has been under this custody for its whole time. The way, in which a representative part is defined, should ensure that it is unambiguous who keeps a part and who the whole and should be consistent with the identity criteria of the kept instance of E18 Physical Thing. </p><p>The distinction with <em>P50 has current keeper (is current keeper of)</em> is that <em>P49 has former or current keeper (is former or current keeper of)</em> leaves open the question as to whether the specified keepers are current. </p><p>This property is a shortcut for the more detailed path from E18 Physical Thing through <em>P30i custody transferred through,</em> E10 Transfer of Custody, <em>P28 custody surrendered by</em> <em>or P29 custody received by</em> to E39 Actor.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E39 Actor] {+crm:E39 ?range}

# P5 consists of {=crm:P5 .owl:ObjectProperty label @en}
[<p>This property describes the decomposition of an instance of E3 Condition State into discrete, subsidiary states. </p><p>It is assumed that the sub-states into which the condition state is analysed form a logical whole, although the entire story may not be completely known, and that the sub-states are in fact constitutive of the general condition state. For example, a general condition state of “in ruins” may be decomposed into the individual stages of decay. </p><p>This property is transitive and asymmetric.</p>] {comment @en}
[E3 Condition State] {+crm:E3 ?domain}
[E3 Condition State] {+crm:E3 ?range}

# P50 has current keeper {=crm:P50 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E39 Actor that had custody of an instance of E18 Physical Thing at the time of validity of the record or database containing the statement that uses this property.</p><p>This property is a shortcut for the more detailed path from E18 Physical Thing through, <em>P30i custody transferred through</em>, E10 Transfer of Custody, <em>P29 custody received by</em> to E39 Actor, if and only if the custody has not been surrendered by the receiving actor at any later time</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P49 has former or current keeper] {+crm:P49 ?subPropertyOf}

# P51 has former or current owner {=crm:P51 .owl:ObjectProperty label @en}
[<p>This property identifies an instance of E39 Actor that is or had been the legal owner (i.e. title holder) of an instance of E18 Physical Thing at some time.</p><p>The distinction with <em>P52 has current owner (is current owner of)</em> is that <em>P51 has former or current owner (is former or current owner of)</em> does not indicate whether the specified owners are current. </p><p>This property is a shortcut for the more detailed path from E18 Physical Thing through <em>P24i changed ownership through</em>, E8 Acquisition, <em>P23 transferred title from</em>, or <em>P22 transferred title to</em> to E39 Actor.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E39 Actor] {+crm:E39 ?range}

# P52 has current owner {=crm:P52 .owl:ObjectProperty label @en}
[<p>This property identifies the instance of E21 Person or E74 Group that was the owner of an instance of E18 Physical Thing at the time of validity of the record or database containing the statement that uses this property.</p><p>This property is a shortcut for the more detailed path from E18 Physical Thing through, <em>P24i changed ownership through</em>, E8 Acquisition, <em>P22 transferred title to</em> to E39 Actor, if and only if this acquisition event is the most recent.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E39 Actor] {+crm:E39 ?range}
[P105 right held by] {+crm:P105 ?subPropertyOf}
[P51 has former or current owner] {+crm:P51 ?subPropertyOf}

# P53 has former or current location {=crm:P53 .owl:ObjectProperty label @en}
[<p>This property identifies an instance of E53 Place as the former or current location of an instance of E18 Physical Thing.</p><p>In the case of instances of E19 Physical Object, the property does not allow any indication of the Time-Span during which the instance of E19 Physical Object was located at this instance of E53 Place, nor if this is the current location.</p><p>In the case of immobile objects, the Place would normally correspond to the Place of creation.</p><p>This property is a shortcut. A more detailed representation can make use of the fully developed (i.e. indirect) path from E19 Physical Object<em>, </em>though<em>, P25i moved by</em>, E9 Move<em>, P26 moved to </em>or<em> P27 moved from </em>to<em> </em>E53 Place.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E53 Place] {+crm:E53 ?range}

# P54 has current permanent location {=crm:P54 .owl:ObjectProperty label @en}
[<p>This property records the foreseen permanent location of an instance of E19 Physical Object at the time of validity of the record or database containing the statement that uses this property.</p><p><em>P54 has current permanent location (is current permanent location of)</em> is similar to <em>P55 has current location (currently holds).</em> However, it indicates the E53 Place currently reserved for an object, such as the permanent storage location or a permanent exhibit location. The object may be temporarily removed from the permanent location, for example when used in temporary exhibitions or loaned to another institution. The object may never actually be located at its permanent location.</p>] {comment @en}
[E19 Physical Object] {+crm:E19 ?domain}
[E53 Place] {+crm:E53 ?range}

# P55 has current location {=crm:P55 .owl:ObjectProperty label @en}
[<p>This property records the location of an instance of E19 Physical Object at the time of validity of the record or database containing the statement that uses this property.</p><p>This property is a specialisation of <em>P53</em> <em>has former or current location (is former or current location of).</em> It indicates that the instance of E53 Place associated with the instance of E19 Physical Object is the current location of the object. The property does not allow any indication of how long the object has been at the current location. </p><p>This property is a shortcut. A more detailed representation can make use of the fully developed (i.e., indirect) path from E19 Physical Object<em>, </em>through<em>, P25i moved by, </em>E9 Move<em>, P26 moved to </em>to<em> </em>E53 Place if and only if this Move is the most recent.</p>] {comment @en}
[E19 Physical Object] {+crm:E19 ?domain}
[E53 Place] {+crm:E53 ?range}
[P53 has former or current location] {+crm:P53 ?subPropertyOf}

# P56 bears feature {=crm:P56 .owl:ObjectProperty label @en}
[<p>This property links an instance of E19 Physical Object to an instance of E26 Physical Feature that it bears.</p><p>An instance of E26 Physical Feature can only exist on one object. One object may bear more than one E26 Physical Feature. An instance of E27 Site should be considered as an instance of E26 Physical Feature on the surface of the Earth.</p><p>An instance B of E26 Physical Feature being a detail of the structure of another instance A of E26 Physical Feature can be linked to B by use of the property <em>P46 is composed of (forms part of)</em>. This implies that the subfeature B is <em>P56i is found on</em> the same E19 Physical Object as A. </p><p>This property is a shortcut. A more detailed representation can make use of the fully developed (i.e. indirect) path <em>E19 Physical Object, </em>through<em>, P59 has section, </em>E53 Place<em>, P53i is former or current location of </em>to<em> </em>E26 Physical Feature.</p>] {comment @en}
[E19 Physical Object] {+crm:E19 ?domain}
[E26 Physical Feature] {+crm:E26 ?range}
[P46 is composed of] {+crm:P46 ?subPropertyOf}

# P57 has number of parts {=crm:P57 .owl:ObjectProperty label @en}
[<p>This property documents the number of parts, an instance of E60 Number, of which an instance of E19 Physical Object is composed.</p><p>This may be used as a method of checking inventory counts with regard to aggregate or collective objects. What constitutes a part or component depends on the context and requirements of the documentation. Normally, the parts documented in this way would not be considered as worthy of individual attention.</p><p>For a more complete description, objects may be decomposed into their components and constituents using <em>P46 is composed of (forms parts of) </em>and<em> P45 consists of (is incorporated in)</em>. This allows each element to be described individually.</p>] {comment @en}
[E19 Physical Object] {+crm:E19 ?domain}
[E60 Number] {+crm:E60 ?range}

# P59 has section {=crm:P59 .owl:ObjectProperty label @en}
[<p>This property links an area, i.e., an instance of E53 Place to the instance of E18 Physical Thing upon which it is found. This area may either be identified by a name, or by a geometry in terms of a coordinate system adapted to the shape of the respective instance of E18 Physical Thing. Typically, names identifying sections of physical objects are composed of the name of a kind of part and the name of the object itself, such as “The poop deck of H.M.S. Victory”, which is composed of “poop deck” and “H.M.S. Victory”.</p>] {comment @en}
[E18 Physical Thing] {+crm:E18 ?domain}
[E53 Place] {+crm:E53 ?range}
[crm:P157i] {+crm:P157i ?subPropertyOf}

# P62 depicts {=crm:P62 .owl:ObjectProperty label @en}
[<p>This property identifies something that is depicted by an instance of E24 Physical Human-Made Thing. Depicting is meant in the sense that an instance of E24 Physical Human-Made Thing intentionally shows, through its optical qualities or form, a representation of the entity depicted. Photographs are by default regarded as being intentional in this sense. Anything that is designed to change the properties of the depiction, such as an e-book reader, is specifically excluded. The property does not pertain to inscriptions or any other information encoding.</p><p>This property is a shortcut of the more fully developed path from E24 Physical Human-Made Thing through <em>P65 shows visual item</em>, E36 Visual Item,<em> P138 represents </em>to<em> </em>E1 CRM Entity<em>. P62.1 mode of depiction</em> allows the nature of the depiction to be refined.</p>] {comment @en}
[E24 Physical Human-Made Thing] {+crm:E24 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}

# P65 shows visual item {=crm:P65 .owl:ObjectProperty label @en}
[<p>This property documents an instance of E36 Visual Item shown by an instance of E24 Physical Human-Made Thing.</p><p>This property is similar to <em>P62 depicts (is depicted by)</em> in that it associates an instance of E24 Physical Human-Made Thing with a visual representation. However, <em>P65 shows visual item (is shown by)</em> differs from the <em>P62 depicts (is depicted by)</em> property in that it makes no claims about what the instance of E36 Visual Item is deemed to represent. An instance of E36 Visual Item identifies a recognisable image or visual symbol, regardless of what this image may or may not represent.</p><p>For example, all recent British coins bear a portrait of Queen Elizabeth II, a fact that is correctly documented using <em>P62 depicts (is depicted by)</em>. Different portraits have been used at different periods, however. <em>P65 shows visual item (is shown by) </em>can be used to refer to a particular portrait.</p><p><em>P65 shows visual item (is shown by)</em> may also be used for Visual Items such as signs, marks and symbols, for example the 'Maltese Cross' or the 'copyright symbol’ that have no particular representational content. </p><p>This property is part of the fully developed path E24 Physical Human-Made Thing, <em>P65 shows visual item</em>, E36 Visual Item, <em>P138 represents to </em>E1 CRM Entity which is shortcut by<em>, P62</em> <em>depicts (is depicted by)</em>.</p>] {comment @en}
[E24 Physical Human-Made Thing] {+crm:E24 ?domain}
[E36 Visual Item] {+crm:E36 ?range}
[P128 carries] {+crm:P128 ?subPropertyOf}

# P67 refers to {=crm:P67 .owl:ObjectProperty label @en}
[<p>This property documents that an instance of E89 Propositional Object makes a statement about an instance of E1 CRM Entity. <em>P67 refers to (is referred to by)</em> has the <em>P67.1 has type</em> link to an instance of E55 Type. This is intended to allow a more detailed description of the type of reference. This differs from <em>P129 is about (is subject of)</em>, which describes the primary subject or subjects of the instance of E89 Propositional Object.</p>] {comment @en}
[E89 Propositional Object] {+crm:E89 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}

# P68 foresees use of {=crm:P68 .owl:ObjectProperty label @en}
[<p>This property identifies an instance of E57 Material foreseen to be used by an instance of E29 Design or Procedure. </p><p>E29 Designs and procedures commonly foresee the use of particular instances of E57 Material. The fabrication of adobe bricks, for example, requires straw, clay and water. This property enables this to be documented.</p><p>This property is not intended for the documentation of instances of E57 Materials that were used on a particular occasion when an instance of E29 Design or Procedure was executed.</p>] {comment @en}
[E29 Design or Procedure] {+crm:E29 ?domain}
[E57 Material] {+crm:E57 ?range}
[P67 refers to] {+crm:P67 ?subPropertyOf}

# P69 has association with {=crm:P69 .owl:ObjectProperty label @en}
[<p>This property generalises relationships like whole-part, sequence, prerequisite or inspired by between instances of E29 Design or Procedure. Any instance of E29 Design or Procedure may be associated with other designs or procedures. The property is considered to be symmetrical unless otherwise indicated by <em>P69.1 has type</em>. The property is not transitive.</p><p>This property is a directed relationship. The <em>P69.1 has type</em> property of <em>P69 has association</em> <em>with</em> allows the nature of the association to be specified reading from domain to range; examples of types of association between instances of E29 Design or Procedure include: has part, follows, requires, etc.</p><p>Instances of this property are considered to be symmetric, in case no directed sense is provided for them by the property <em>P69.1 has type</em>.</p><p>The property can typically be used to model the decomposition of the description of a complete workflow into a series of separate procedures. </p>] {comment @en}
[E29 Design or Procedure] {+crm:E29 ?domain}
[E29 Design or Procedure] {+crm:E29 ?range}

# P7 took place at {=crm:P7 .owl:ObjectProperty label @en}
[<p>This property describes the spatial location of an instance of E4 Period. </p><p>The related instance of E53 Place should be seen as a wider approximation of the geometric area within which the phenomena that characterise the period in question occurred, see below. <em>P7 took place at (witnessed)</em> does not convey any meaning other than spatial positioning (frequently on the surface of the earth). For example, the period “Révolution française” can be said to have taken place in “France in 1789”; the “Victorian” period may be said to have taken place in “Britain from 1837-1901” and its colonies, as well as other parts of Europe and North America. An instance of E4 Period can take place at multiple non-contiguous, non-overlapping locations.</p><p>Any place where something happened includes the spatial projection of the happening given in the same geometric reference system. For instance, HMS Victory, as place of Lord Nelson's dying, includes the location of his body relative to the hull of HMS Victory at his time of death as the most precise location of his death. By the definition of <em>P161 has spatial projection</em>, an instance of E4 Period takes place on all its spatial projections to respective reference systems, that is, instances of E53 Place. Therefore, this property implies the more fully developed path from E4 Period through <em>P161 has spatial projection</em>, E53 Place, <em>P89 falls within</em> to E53 Place, where both places are defined in the same geometric reference system. The relation between an instance of E53 Place and its reference system can conveniently be documented via the property <em>P157 is at rest relative to (provides reference space for)</em>.</p><p>Something that has happened at a given place can also be considered to have happened at a smaller place within it: for example, it is reasonable to say Caesar’s murder took place in Rome, but also on the Forum Romanum, and more precisely in the Curia. It is characteristic for different historical sources to use varying precision in such statements, without being in contradiction with each other. This may be due to lack of knowledge or to the relevance of the precision for the purpose of the statement. In information integration, the more precise statement improves the overall knowledge.</p>] {comment @en}
[E4 Period] {+crm:E4 ?domain}
[E53 Place] {+crm:E53 ?range}

# P70 documents {=crm:P70 .owl:ObjectProperty label @en}
[<p>This property describes the CRM Entities documented as instances of E31 Document. </p><p>Documents may describe any conceivable entity, hence the link to the highest-level entity in the CIDOC CRM class hierarchy. This property is intended for cases where a reference is regarded as making a proposition about reality. This may be of a documentary character, in the scholarly or scientific sense, or a more general statement.</p>] {comment @en}
[E31 Document] {+crm:E31 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P67 refers to] {+crm:P67 ?subPropertyOf}

# P71 lists {=crm:P71 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E32 Authority Document with an instance of E1 CRM Entity which it lists for reference purposes.</p>] {comment @en}
[E32 Authority Document] {+crm:E32 ?domain}
[E1 CRM Entity] {+crm:E1 ?range}
[P67 refers to] {+crm:P67 ?subPropertyOf}

# P72 has language {=crm:P72 .owl:ObjectProperty label @en}
[<p>This property associates an instance(s) of E33 Linguistic Object with an instance of E56 Language in which it is, at least partially, expressed. </p><p>Linguistic Objects are composed in one or more human languages. This property allows these languages to be documented.</p>] {comment @en}
[E33 Linguistic Object] {+crm:E33 ?domain}
[E56 Language] {+crm:E56 ?range}

# P73 has translation {=crm:P73 .owl:ObjectProperty label @en}
[<p>This property links an instance of E33 Linguistic Object (A), to another instance of E33 Linguistic Object (B) which is the translation of A.</p><p>When an instance of E33 Linguistic Object is translated into a new language a new instance of E33 Linguistic Object is created, despite the translation being conceptually similar to the source.</p><p>This property is asymmetric.</p>] {comment @en}
[E33 Linguistic Object] {+crm:E33 ?domain}
[E33 Linguistic Object] {+crm:E33 ?range}
[crm:P130i] {+crm:P130i ?subPropertyOf}

# P74 has current or former residence {=crm:P74 .owl:ObjectProperty label @en}
[<p>This property describes the current or former place of residence (an instance of E53 Place) of an instance of E39 Actor. </p><p>The residence may be either the place where the actor resides, or a legally registered address of any kind.</p>] {comment @en}
[E39 Actor] {+crm:E39 ?domain}
[E53 Place] {+crm:E53 ?range}

# P75 possesses {=crm:P75 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E39 Actor to an instance of E30 Right over which the actor holds or has held a legal claim. </p>] {comment @en}
[E39 Actor] {+crm:E39 ?domain}
[E30 Right] {+crm:E30 ?range}

# P76 has contact point {=crm:P76 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E39 Actor to an instance of E41 Appellation which a communication service uses to direct communications to this actor, such as an e-mail address, fax number, or postal address.</p>] {comment @en}
[E39 Actor] {+crm:E39 ?domain}
[E41 Appellation] {+crm:E41 ?range}

# P79 beginning is qualified by {=crm:P79 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E52 Time-Span with a note detailing the scholarly or scientific opinions and justifications about the certainty, precision, sources etc. of its beginning. Such notes may also be used to elaborate arguments about constraints or to give explanations of alternatives.</p>] {comment @en}
[E52 Time-Span] {+crm:E52 ?domain}
[E62 String] {+crm:E62 ?range}
[P3 has note] {+crm:P3 ?subPropertyOf}

# P8 took place on or within {=crm:P8 .owl:ObjectProperty label @en}
[<p>This property describes the location of an instance of E4 Period with respect to an instance of E18 Physical Thing. </p><p>This property is a shortcut of the more fully developed path from E4 Period through <em>P7 took place at</em>, E53 Place, <em>P156i is occupied by</em> to E18 Physical Thing.</p><p>It describes a period that can be located with respect to the space defined by an E19 Physical Object such as a ship or a building. The precise geographical location of the object during the period in question may be unknown or unimportant. </p><p>For example, the French and German armistice of 22<sup>nd</sup> June 1940 was signed in the same railway carriage as the armistice of 11<sup>th</sup> November 1918.</p>] {comment @en}
[E4 Period] {+crm:E4 ?domain}
[E18 Physical Thing] {+crm:E18 ?range}

# P80 end is qualified by {=crm:P80 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E52 Time-Span with a note detailing the scholarly or scientific opinions and justifications about the end of this time-span concerning certainty, precision, sources etc. This property may also be used to describe arguments constraining possible dates and to distinguish reasons for alternative dates.</p>] {comment @en}
[E52 Time-Span] {+crm:E52 ?domain}
[E62 String] {+crm:E62 ?range}
[P3 has note] {+crm:P3 ?subPropertyOf}

# P81 ongoing throughout {=crm:P81 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E52 Time-Span with an instance of E61 Time Primitive specifying a minimum period of time covered by it. Since Time-Spans may not have precisely known temporal extents, the CIDOC CRM supports statements about the minimum and maximum temporal extents of Time-Spans. This property allows a Time-Span’s minimum temporal extent (i.e., its inner boundary) to be assigned an E61 Time Primitive value. Time Primitives are treated by the CIDOC CRM as application or system specific date intervals, and are not further analysed. If different sources of evidence justify different minimum extents without contradicting each other, the smallest interval including all these extents will be the best estimate. This should be taken into account for information integration.</p>] {comment @en}
[E52 Time-Span] {+crm:E52 ?domain}
[E61 Time Primitive] {+crm:E61 ?range}

# P82 at some time within {=crm:P82 .owl:ObjectProperty label @en}
[<p>This property describes the maximum period of time within which an E52 Time-Span falls. Since Time-Spans may not have precisely known temporal extents, the CIDOC CRM supports statements about the minimum and maximum temporal extents of Time-Spans. This property allows a Time-Span’s maximum temporal extent (i.e. its outer boundary) to be assigned an E61 Time Primitive value. Time Primitives are treated by the CIDOC CRM as application or system specific date intervals, and are not further analysed. If different sources of evidence justify different maximum extents without contradicting each other, the resulting intersection of all these extents will be the best estimate. This should be taken into account for information integration.</p>] {comment @en}
[E52 Time-Span] {+crm:E52 ?domain}
[E61 Time Primitive] {+crm:E61 ?range}

# P86 falls within {=crm:P86 .owl:ObjectProperty label @en}
[<p>This property describes the inclusion relationship between two instances of E52 Time-Span.</p><p>This property supports the notion that the temporal extent of an instance of E52 Time-Span falls within the temporal extent of another instance of E52 Time-Span. It addresses temporal containment only, and no contextual link between the two instances of E52 Time-Span is implied. This property is transitive and reflexive.</p>] {comment @en}
[E52 Time-Span] {+crm:E52 ?domain}
[E52 Time-Span] {+crm:E52 ?range}

# P89 falls within {=crm:P89 .owl:ObjectProperty label @en}
[<p>This property identifies an instance of E53 Place that falls wholly within the extent of another instance of E53 Place.</p><p>It addresses spatial containment only and does not imply any relationship between things or phenomena occupying these places.</p><p>This property is transitive and reflexive.</p>] {comment @en}
[E53 Place] {+crm:E53 ?domain}
[E53 Place] {+crm:E53 ?range}

# P9 consists of {=crm:P9 .owl:ObjectProperty label @en}
[<p>This property associates an instance of E4 Period with another instance of E4 Period that is defined by a subset of the phenomena that define the former. Therefore, the spacetime volume of the latter must fall within the spacetime volume of the former.</p><p>This property is transitive and asymmetric.</p>] {comment @en}
[E4 Period] {+crm:E4 ?domain}
[E4 Period] {+crm:E4 ?range}
[crm:P10i] {+crm:P10i ?subPropertyOf}

# P90 has value {=crm:P90 .owl:ObjectProperty label @en}
[<p>This property allows an instance of E54 Dimension to be approximated by an instance of E60 Number primitive.</p>] {comment @en}
[E54 Dimension] {+crm:E54 ?domain}
[E60 Number] {+crm:E60 ?range}

# P91 has unit {=crm:P91 .owl:ObjectProperty label @en}
[<p>This property shows the type of unit an instance of E54 Dimension was expressed in.</p>] {comment @en}
[E54 Dimension] {+crm:E54 ?domain}
[E58 Measurement Unit] {+crm:E58 ?range}

# P92 brought into existence {=crm:P92 .owl:ObjectProperty label @en}
[<p>This property links an instance of E63 Beginning of Existence to the instance of E77 Persistent Item brought into existence by it.</p><p>It allows a “start” to be attached to any instance of E77 Persistent Item being documented, i.e., as instances of E70 Thing, E72 Legal Object, E39 Actor, E41 Appellation and E55 Type.</p>] {comment @en}
[E63 Beginning of Existence] {+crm:E63 ?domain}
[E77 Persistent Item] {+crm:E77 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}

# P93 took out of existence {=crm:P93 .owl:ObjectProperty label @en}
[<p>This property links an instance of E64 End of Existence to the instance of E77 Persistent Item taken out of existence by it.</p><p>In the case of immaterial things, the instance of E64 End of Existence is considered to take place with the destruction of the last physical carrier.</p><p>This allows an “end” to be attached to any instance of E77 Persistent Item being documented i.e. instances of E70 Thing, E72 Legal Object, E39 Actor, E41 Appellation, and E55 Type. For many instances of E77 Persistent Item we know the maximum life-span and can infer that they must have ended to exist. We assume in that case an instance of E64 End of Existence, which may be as unnoticeable as forgetting the secret knowledge by the last representative of some indigenous nation.</p>] {comment @en}
[E64 End of Existence] {+crm:E64 ?domain}
[E77 Persistent Item] {+crm:E77 ?range}
[P12 occurred in the presence of] {+crm:P12 ?subPropertyOf}

# P94 has created {=crm:P94 .owl:ObjectProperty label @en}
[<p>This property links an instance of E65 Creation to the instance of E28 Conceptual Object created by it. </p><p>It represents the act of conceiving the intellectual content of the instance of E28 Conceptual Object. It does not represent the act of creating the first physical carrier of the instance of E28 Conceptual Object. As an example, this is the composition of a poem, not its commitment to paper.</p>] {comment @en}
[E65 Creation] {+crm:E65 ?domain}
[E28 Conceptual Object] {+crm:E28 ?range}
[P92 brought into existence] {+crm:P92 ?subPropertyOf}

# P95 has formed {=crm:P95 .owl:ObjectProperty label @en}
[<p>This property associates the instance of E66 Formation with the instance of E74 Group that it founded.</p>] {comment @en}
[E66 Formation] {+crm:E66 ?domain}
[E74 Group] {+crm:E74 ?range}
[P92 brought into existence] {+crm:P92 ?subPropertyOf}

# P96 by mother {=crm:P96 .owl:ObjectProperty label @en}
[<p>This property links an instance of E67 Birth to an instance of E21 Person in the role of birth-giving mother.</p><p>Note that biological fathers are not necessarily participants in the Birth (see <em>P97</em> <em>from father (was father for)</em>). The instance of E21 Person being born is linked to the instance of E67 Birth with the property <em>P98</em> <em>brought into life (was born)</em>. This is not intended for use with general natural history material, only people. There is no explicit method for modelling conception and gestation except by using extensions.</p>] {comment @en}
[E67 Birth] {+crm:E67 ?domain}
[E21 Person] {+crm:E21 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}

# P97 from father {=crm:P97 .owl:ObjectProperty label @en}
[<p>This property links an instance of E67 Birth to an instance of E21 Person in the role of biological father.</p><p>Note that biological fathers are not seen as necessary participants in the birth, whereas birth-giving mothers are (see <em>P96</em> <em>by mother (gave birth)</em>). The Person being born is linked to the Birth with the property <em>P98</em> <em>brought into life (was born)</em>.</p><p>This is not intended for use with general natural history material, only people. There is no explicit method for modelling conception and gestation except by using extensions. </p><p>An instance of E67 Birth is normally (but not always) associated with one biological father.</p>] {comment @en}
[E67 Birth] {+crm:E67 ?domain}
[E21 Person] {+crm:E21 ?range}

# P98 brought into life {=crm:P98 .owl:ObjectProperty label @en}
[<p>This property links an instance of E67 Birth event to an instance of E21 Person in the role of offspring.</p><p>Twins, triplets etc. are brought into life by the same instance of E67 Birth. This is not intended for use with general Natural History material, only people. There is no explicit method for modelling conception and gestation except by using extensions.</p>] {comment @en}
[E67 Birth] {+crm:E67 ?domain}
[E21 Person] {+crm:E21 ?range}
[P92 brought into existence] {+crm:P92 ?subPropertyOf}

# P99 dissolved {=crm:P99 .owl:ObjectProperty label @en}
[<p>This property associates the instance of E68 Dissolution with the instance of E74 Group that it disbanded.</p>] {comment @en}
[E68 Dissolution] {+crm:E68 ?domain}
[E74 Group] {+crm:E74 ?range}
[P11 had participant] {+crm:P11 ?subPropertyOf}
[P93 took out of existence] {+crm:P93 ?subPropertyOf}

