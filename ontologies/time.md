[dct] <http://purl.org/dc/terms/>
[owl] <http://www.w3.org/2002/07/owl#>
[skos] <http://www.w3.org/2004/02/skos/core#>
[time] <http://www.w3.org/2006/time#>

# OWL-Time {=http://www.w3.org/2006/time .owl:Ontology label @en}
*2006-09-27* {dct:created ^^xsd:date}
*2017-04-06* {dct:modified ^^xsd:date}
[Copyright © 2006-2017 W3C, OGC. W3C and OGC liability, trademark and document use rules apply.] {dct:rights @en}
[Tiempo en OWL] {label @es}
[2016-06-15 - initial update of OWL-Time - modified to support arbitrary temporal reference systems. ] {skos:changeNote}
[2016-12-20 - adjust range of time:timeZone to time:TimeZone, moved up from the tzont ontology.  ] {skos:changeNote}
[2016-12-20 - restore time:Year and time:January which were present in the 2006 version of the ontology, but now marked "deprecated". ] {skos:changeNote}
[2017-02 - intervalIn, intervalDisjoint, monthOfYear added; TemporalUnit subclass of TemporalDuration] {skos:changeNote}
[2017-04-06 - hasTime, hasXSDDuration added; Number removed; all duration elements changed to xsd:decimal] {skos:changeNote}
~~~ {skos:historyNote @en}
Update of OWL-Time ontology, extended to support general temporal reference systems. 

Ontology engineering by Simon J D Cox
~~~

[https://orcid.org/0000-0001-8269-8171] {+https://orcid.org/0000-0001-8269-8171 ?dct:contributor}
[mailto:chris.little@metoffice.gov.uk] {+mailto:chris.little@metoffice.gov.uk ?dct:contributor}
[http://orcid.org/0000-0002-3884-3420] {+http://orcid.org/0000-0002-3884-3420 ?dct:creator}
[https://en.wikipedia.org/wiki/Jerry_Hobbs] {+https://en.wikipedia.org/wiki/Jerry_Hobbs ?dct:creator}
[mailto:panfeng66@gmail.com] {+mailto:panfeng66@gmail.com ?dct:creator}
[http://www.w3.org/TR/owl-time] {+http://www.w3.org/TR/owl-time ?dct:isVersionOf}
[https://creativecommons.org/licenses/by/4.0/] {+https://creativecommons.org/licenses/by/4.0/ ?dct:license}
[http://dx.doi.org/10.3233/SW-150187] {+http://dx.doi.org/10.3233/SW-150187 ?seeAlso}
[http://www.semantic-web-journal.net/content/time-ontology-extended-non-gregorian-calendar-applications] {+http://www.semantic-web-journal.net/content/time-ontology-extended-non-gregorian-calendar-applications ?seeAlso}
[http://www.w3.org/TR/owl-time] {+http://www.w3.org/TR/owl-time ?seeAlso}
[time:2006] {+time:2006 ?owl:priorVersion}
[time:2016] {+time:2016 ?owl:versionIRI}

# Date-Time description {=time:DateTimeDescription .owl:Class label @en}
[Descripción de fecha y tiempo estructurada con valores separados para los diferentes elementos de un sistema calendario-reloj. El sistema de referencia temporal está fijado al calendario gregoriano, y el rango de las propiedades año, mes, día restringidas a los correspondientes tipos del XML Schema xsd:gYear, xsd:gMonth y xsd:gDay respectivamente.] {comment @es}
[Description of date and time structured with separate values for the various elements of a calendar-clock system. The temporal reference system is fixed to Gregorian Calendar, and the range of year, month, day properties restricted to corresponding XML Schema types xsd:gYear, xsd:gMonth and xsd:gDay, respectively.] {comment @en}
[descripción de fecha-tiempo] {label @es}
[Descripción de fecha y tiempo estructurada con valores separados para los diferentes elementos de un sistema calendario-reloj. El sistema de referencia temporal está fijado al calendario gregoriano, y el rango de las propiedades año, mes, día restringidas a los correspondientes tipos del XML Schema xsd:gYear, xsd:gMonth y xsd:gDay respectivamente.] {skos:definition @es}
[Description of date and time structured with separate values for the various elements of a calendar-clock system. The temporal reference system is fixed to Gregorian Calendar, and the range of year, month, day properties restricted to corresponding XML Schema types xsd:gYear, xsd:gMonth and xsd:gDay, respectively.] {skos:definition @en}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?subClassOf}

# Date-time interval {=time:DateTimeInterval .owl:Class label @en}
['intervalo de fecha-hora' es una subclase de 'intervalo propio', definida utilizando el multi-elemento 'descripción de fecha-hora'.] {comment @es}
[DateTimeInterval is a subclass of ProperInterval, defined using the multi-element DateTimeDescription.] {comment @en}
[intervalo de fecha-hora] {label @es}
['intervalo de fecha-hora' es una subclase de 'intervalo propio', definida utilizando el multi-elemento 'descripción de fecha-hora'.] {skos:definition @es}
[DateTimeInterval is a subclass of ProperInterval, defined using the multi-element DateTimeDescription.] {skos:definition @en}
[:DateTimeInterval can only be used for an interval whose limits coincide with a date-time element aligned to the calendar and timezone indicated. For example, while both have a duration of one day, the 24-hour interval beginning at midnight at the beginning of 8 May in Central Europe can be expressed as a :DateTimeInterval, but the 24-hour interval starting at 1:30pm cannot.] {skos:note @en}
['intervalo de fecha-hora' se puede utilizar sólo para un intervalo cuyos límites coinciden con un elemento de fecha-hora alineados con el calendario y la zona horaria indicados. Por ejemplo, aunque ambos tienen una duración de un día, el intervalo de 24 horas que empieza en la media noche del comienzo del 8 mayo en Europa Central se puede expresar como un 'intervalo de fecha-hora', el intervalo de 24 horas que empieza a las 1:30pm no.] {skos:note @es}
[Proper interval] {+time:ProperInterval ?subClassOf}

# Day of week {=time:DayOfWeek .owl:Class label @en}
[El día de la semana] {comment @es}
[The day of week] {comment @en}
[día de la semana] {label @es}
~~~ {skos:changeNote @en}
Remove enumeration from definition, in order to allow other days to be used when required in other calendars. 
NOTE: existing days are still present as members of the class, but the class membership is now open. 

In the original OWL-Time the following constraint appeared: 
  owl:oneOf (
      time:Monday
      time:Tuesday
      time:Wednesday
      time:Thursday
      time:Friday
      time:Saturday
      time:Sunday
    ) ;
~~~

[El día de la semana] {skos:definition @es}
[The day of week] {skos:definition @en}
[La pertenencia a la clase 'día de la semana' está abierta, para permitir longitudes de semana alternativas y diferentes nombres de días.] {skos:note @es}
[Membership of the class :DayOfWeek is open, to allow for alternative week lengths and different day names.] {skos:note @en}
[owl:Thing] {+owl:Thing ?subClassOf}

# duración de tiempo {=time:Duration .owl:Class label}
[Duración de una extensión temporal expresada como un número escalado por una unidad temporal.] {comment @es}
[Duration of a temporal extent expressed as a number scaled by a temporal unit] {comment @en}
[Time duration] {label @en}
[Duración de una extensión temporal expresada como un número escalado por una unidad temporal.] {skos:definition @es}
[Duration of a temporal extent expressed as a number scaled by a temporal unit] {skos:definition @en}
[Alternativa a 'descripción de tiempo' para proporcionar descripción soporte a una duración temporal diferente a utilizar un sistema de calendario/reloj.] {skos:note @es}
[Alternative to time:DurationDescription to support description of a temporal duration other than using a calendar/clock system.] {skos:note @en}
[Temporal duration] {+time:TemporalDuration ?subClassOf}

# Duration description {=time:DurationDescription .owl:Class label @en}
[Descripción de extensión temporal estructurada con valores separados para los distintos elementos de un sistema de horario-calendario. El sistema de referencia temporal se fija al calendario gregoriano, y el intervalo de cada una de las propiedades numéricas se restringe a xsd:decimal.] {comment @es}
[Description of temporal extent structured with separate values for the various elements of a calendar-clock system. The temporal reference system is fixed to Gregorian Calendar, and the range of each of the numeric properties is restricted to xsd:decimal] {comment @en}
[descripción de duración] {label @es}
[Descripción de extensión temporal estructurada con valores separados para los distintos elementos de un sistema de horario-calendario. El sistema de referencia temporal se fija al calendario gregoriano, y el intervalo de cada una de las propiedades numéricas se restringe a xsd:decimal.] {skos:definition @es}
[Description of temporal extent structured with separate values for the various elements of a calendar-clock system. The temporal reference system is fixed to Gregorian Calendar, and the range of each of the numeric properties is restricted to xsd:decimal] {skos:definition @en}
[En el calendario gregoriano la longitud de los meses no es fija. Por lo tanto, un valor como "2,5 meses" no se puede comparar exactamente con una duración similar expresada en términos de semanas o días.] {skos:note @es}
[In the Gregorian calendar the length of the month is not fixed. Therefore, a value like "2.5 months" cannot be exactly compared with a similar duration expressed in terms of weeks or days.] {skos:note @en}
[Generalized duration description] {+time:GeneralDurationDescription ?subClassOf}

# Friday {=time:Friday .time:DayOfWeek label @en}
[Freitag] {skos:prefLabel @de}
[Friday] {skos:prefLabel @en}
[Piątek] {skos:prefLabel @pl}
[Sexta-feira] {skos:prefLabel @pt}
[Vendredi] {skos:prefLabel @fr}
[Venerdì] {skos:prefLabel @it}
[Viernes] {skos:prefLabel @es}
[Vrijdag] {skos:prefLabel @nl}
[Пятница] {skos:prefLabel @ru}
[الجمعة] {skos:prefLabel @ar}
[星期五] {skos:prefLabel @zh}
[金曜日] {skos:prefLabel @ja}

# Generalized date-time description {=time:GeneralDateTimeDescription .owl:Class label @en}
[Descripción de fecha y hora estructurada con valores separados para los distintos elementos de un sistema calendario-reloj.] {comment @es}
[Description of date and time structured with separate values for the various elements of a calendar-clock system] {comment @en}
[descripción de fecha-hora generalizada] {label @es}
[Descripción de fecha y hora estructurada con valores separados para los distintos elementos de un sistema calendario-reloj.] {skos:definition}
[Description of date and time structured with separate values for the various elements of a calendar-clock system] {skos:definition @en}
[Algunas combinaciones de propiedades son redundantes - por ejemplo, dentro de un 'año' especificado si se proporciona 'día del año' entonces 'día' y 'mes' se pueden computar, y viceversa. Los valores individuales deberían ser consistentes entre ellos y con el calendario, indicado a través del valor de la propiedad 'tiene TRS'.] {skos:note @es}
[Some combinations of properties are redundant - for example, within a specified :year if :dayOfYear is provided then :day and :month can be computed, and vice versa. Individual values should be consistent with each other and the calendar, indicated through the value of the :hasTRS property.] {skos:note}
[Temporal position] {+time:TemporalPosition ?subClassOf}

# Generalized duration description {=time:GeneralDurationDescription .owl:Class label @en}
[Descripción de extensión temporal estructurada con valores separados para los distintos elementos de un sistema de horario-calendario.] {comment @es}
[Description of temporal extent structured with separate values for the various elements of a calendar-clock system.] {comment @en}
[descripción de duración generalizada] {label @es}
[Descripción de extensión temporal estructurada con valores separados para los distintos elementos de un sistema de horario-calendario.] {skos:definition @es}
[Description of temporal extent structured with separate values for the various elements of a calendar-clock system.] {skos:definition @en}
[La extensión de una duración de tiempo expresada como una 'descripción de duración general' depende del Sistema de Referencia Temporal. En algunos calendarios la longitud de la semana o del mes no es constante a lo largo del año. Por tanto, un valor como "25 meses" puede no ser necesariamente ser comparado con un duración similar expresada en términos de semanas o días. Cuando se consideran calendarios que no están basados en el movimiento de la Tierra, se deben tomar incluso más precauciones en la comparación de duraciones.] {skos:note @es}
[The extent of a time duration expressed as a GeneralDurationDescription depends on the Temporal Reference System. In some calendars the length of the week or month is not constant within the year. Therefore, a value like "2.5 months" may not necessarily be exactly compared with a similar duration expressed in terms of weeks or days. When non-earth-based calendars are considered even more care must be taken in comparing durations.] {skos:note @en}
[Temporal duration] {+time:TemporalDuration ?subClassOf}

# Time instant {=time:Instant .owl:Class label @en}
[A temporal entity with zero extent or duration] {comment @en}
[Una entidad temporal con una extensión o duración cero.] {comment @es}
[instante de tiempo.] {label @es}
[A temporal entity with zero extent or duration] {skos:definition @en}
[Una entidad temporal con una extensión o duración cero.] {skos:definition @es}
[Temporal entity] {+time:TemporalEntity ?subClassOf}

# Time interval {=time:Interval .owl:Class label @en}
[A temporal entity with an extent or duration] {comment @en}
[Una entidad temporal con una extensión o duración.] {comment @es}
[intervalo de tiempo] {label @es}
[A temporal entity with an extent or duration] {skos:definition @en}
[Una entidad temporal con una extensión o duración.] {skos:definition @es}
[Temporal entity] {+time:TemporalEntity ?subClassOf}

# January {=time:January .owl:Class .owl:DeprecatedClass label}
**true** {owl:deprecated ^^xsd:boolean}
[This class was present in the 2006 version of OWL-Time. It was presented as an example of how DateTimeDescription could be specialized, but does not belong in the revised ontology. ] {skos:historyNote}
[Date-Time description] {+time:DateTimeDescription ?subClassOf}

# Monday {=time:Monday .time:DayOfWeek label @en}
[Lundi] {skos:prefLabel @fr}
[Lunedì] {skos:prefLabel @it}
[Lunes] {skos:prefLabel @es}
[Maandag] {skos:prefLabel @nl}
[Monday] {skos:prefLabel @en}
[Montag] {skos:prefLabel @de}
[Poniedziałek] {skos:prefLabel @pl}
[Segunda-feira] {skos:prefLabel @pt}
[Понедельник] {skos:prefLabel @ru}
[الاثنين] {skos:prefLabel @ar}
[星期一] {skos:prefLabel @zh}
[月曜日] {skos:prefLabel @ja}

# Month of year {=time:MonthOfYear .owl:Class label @en}
[El mes del año.] {comment @es}
[The month of the year] {comment @en}
[mes del año] {label @es}
[El mes del año.] {skos:definition @es}
[The month of the year] {skos:definition @en}
[Característica en riesgo - añadida en la revisión de 2017, y no utilizada todavía de forma amplia.] {skos:editorialNote @es}
[Feature at risk - added in 2017 revision, and not yet widely used. ] {skos:editorialNote @en}
[La pertenencia a la clase 'mes del año' está abierta, a permitir calendarios anuales alternativos y diferentes nombres de meses.] {skos:note @es}
[Membership of the class :MonthOfYear is open, to allow for alternative annual calendars and different month names.] {skos:note @en}
[Date-Time description] {+time:DateTimeDescription ?subClassOf}

# Proper interval {=time:ProperInterval .owl:Class label @en}
[A temporal entity with non-zero extent or duration, i.e. for which the value of the beginning and end are different] {comment @en}
[Una entidad temporal con extensión o duración distinta de cero, es decir, para la cual los valores de principio y fin del intervalo son diferentes.] {comment @es}
[intervalo propio] {label @es}
[A temporal entity with non-zero extent or duration, i.e. for which the value of the beginning and end are different] {skos:definition @en}
[Una entidad temporal con extensión o duración distinta de cero, es decir, para la cual los valores de principio y fin del intervalo son diferentes.] {skos:definition @es}
[Time interval] {+time:Interval ?subClassOf}
[Time instant] {+time:Instant ?owl:disjointWith}

# Saturday {=time:Saturday .time:DayOfWeek label @en}
[Sábado] {skos:prefLabel @es}
[Sábado] {skos:prefLabel @pt}
[Sabato] {skos:prefLabel @it}
[Samedi] {skos:prefLabel @fr}
[Samstag] {skos:prefLabel @de}
[Saturday] {skos:prefLabel @en}
[Sobota] {skos:prefLabel @pl}
[Zaterdag] {skos:prefLabel @nl}
[Суббота] {skos:prefLabel @ru}
[السبت] {skos:prefLabel @ar}
[土曜日] {skos:prefLabel @ja}
[星期六] {skos:prefLabel @zh}

# Sunday {=time:Sunday .time:DayOfWeek label @en}
[Dimanche] {skos:prefLabel @fr}
[Domenica] {skos:prefLabel @it}
[Domingo] {skos:prefLabel @es}
[Domingo] {skos:prefLabel @pt}
[Niedziela] {skos:prefLabel @pl}
[Sonntag] {skos:prefLabel @de}
[Sunday] {skos:prefLabel @en}
[Zondag] {skos:prefLabel @nl}
[Воскресенье] {skos:prefLabel @ru}
[الأحد (يوم)] {skos:prefLabel @ar}
[日曜日] {skos:prefLabel @ja}
[星期日] {skos:prefLabel @zh}

# Temporal Reference System {=time:TRS .owl:Class label @en}
~~~ {comment @en}
A temporal reference system, such as a temporal coordinate system (with an origin, direction, and scale), a calendar-clock combination, or a (possibly hierarchical) ordinal system. 

This is a stub class, representing the set of all temporal reference systems.
~~~

~~~ {comment @es}
Un sistema de referencia temporal, tal como un sistema de coordenadas temporales (con un origen, una dirección y una escala), una combinación calendario-reloj, o un sistema ordinal (posiblemente jerárquico).
        Esta clase comodín representa el conjunto de todos los sistemas de referencia temporal.
~~~

[sistema de referencia temporal] {label @es}
~~~ {skos:definition @en}
A temporal reference system, such as a temporal coordinate system (with an origin, direction, and scale), a calendar-clock combination, or a (possibly hierarchical) ordinal system. 

This is a stub class, representing the set of all temporal reference systems.
~~~

~~~ {skos:definition @es}
Un sistema de referencia temporal, tal como un sistema de coordenadas temporales (con un origen, una dirección y una escala), una combinación calendario-reloj, o un sistema ordinal (posiblemente jerárquico).
    Esta clase comodín representa el conjunto de todos los sistemas de referencia temporal.
~~~

[A taxonomy of temporal reference systems is provided in ISO 19108:2002 [ISO19108], including (a) calendar + clock systems; (b) temporal coordinate systems (i.e. numeric offset from an epoch); (c) temporal ordinal reference systems (i.e. ordered sequence of named intervals, not necessarily of equal duration).] {skos:note @en}
[En el ISO 19108:2002 [ISO19108] se proporciona una taxonomía de sistemas de referencia temporal, incluyendo (a) sistemas de calendario + reloj; (b) sistemas de coordenadas temporales (es decir, desplazamiento numérico a partir de una época); (c) sistemas de referencia ordinales temporales (es decir, secuencia ordenada de intervalos nombrados, no necesariamente de igual duración).] {skos:note @es}

# Temporal duration {=time:TemporalDuration .owl:Class label @en}
[Extensión de tiempo; duración de un intervalo de tiempo independiente de su posición de inicio particular.] {comment @es}
[Time extent; duration of a time interval separate from its particular start position] {comment @en}
[duración temporal] {label @es}
[Extensión de tiempo; duración de un intervalo de tiempo independiente de su posición de inicio particular.] {skos:definition @es}
[Time extent; duration of a time interval separate from its particular start position] {skos:definition @en}

# Temporal entity {=time:TemporalEntity .owl:Class label @en}
[A temporal interval or instant.] {comment @en}
[Un intervalo temporal o un instante.] {comment @es}
[entidad temporal] {label @es}
[A temporal interval or instant.] {skos:definition @en}
[Un intervalo temporal o un instante.] {skos:definition @es}
[owl:Thing] {+owl:Thing ?subClassOf}

# Temporal position {=time:TemporalPosition .owl:Class label @en}
[A position on a time-line] {comment @en}
[Una posición sobre una línea de tiempo.] {comment @es}
[posición temporal] {label @es}
[A position on a time-line] {skos:definition @en}
[Una posición sobre una línea de tiempo.] {skos:definition @es}

# Temporal unit {=time:TemporalUnit .owl:Class label @en}
[A standard duration, which provides a scale factor for a time extent, or the granularity or precision for a time position.] {comment @en}
[Una duración estándar, que proporciona un factor de escala para una extensión de tiempo, o la granularidad o precisión para una posición de tiempo.] {comment @es}
[unidad de tiempo] {label @es}
~~~ {skos:changeNote @en}
Remove enumeration from definition, in order to allow other units to be used when required in other coordinate systems. 
NOTE: existing units are still present as members of the class, but the class membership is now open. 

In the original OWL-Time the following constraint appeared: 
  owl:oneOf (
      time:unitSecond
      time:unitMinute
      time:unitHour
      time:unitDay
      time:unitWeek
      time:unitMonth
      time:unitYear
    ) ;
~~~

[A standard duration, which provides a scale factor for a time extent, or the granularity or precision for a time position.] {skos:definition @en}
[Una duración estándar, que proporciona un factor de escala para una extensión de tiempo, o la granularidad o precisión para una posición de tiempo.] {skos:definition @es}
[La pertenencia de la clase 'unidad de tiempo' está abierta, para permitir otras unidades de tiempo utilizadas en algunas aplicaciones técnicas (por ejemplo, millones de años o el mes Baha'i).] {skos:note @es}
[Membership of the class TemporalUnit is open, to allow for other temporal units used in some technical applications (e.g. millions of years, Baha'i month).] {skos:note @en}
[Temporal duration] {+time:TemporalDuration ?subClassOf}

# Thursday {=time:Thursday .time:DayOfWeek label @en}
[Czwartek] {skos:prefLabel @pl}
[Donderdag] {skos:prefLabel @nl}
[Donnerstag] {skos:prefLabel @de}
[Giovedì] {skos:prefLabel @it}
[Jeudi] {skos:prefLabel @fr}
[Jueves] {skos:prefLabel @es}
[Quinta-feira] {skos:prefLabel @pt}
[Thursday] {skos:prefLabel @en}
[Четверг] {skos:prefLabel @ru}
[الخميس] {skos:prefLabel @ar}
[星期四] {skos:prefLabel @zh}
[木曜日] {skos:prefLabel @ja}

# Time position {=time:TimePosition .owl:Class label @en}
[A temporal position described using either a (nominal) value from an ordinal reference system, or a (numeric) value in a temporal coordinate system. ] {comment @en}
[Una posición temporal descrita utilizando bien un valor (nominal) de un sistema de referencia ordinal, o un valor (numérico) en un sistema de coordenadas temporales.] {comment @es}
[posición de tiempo] {label @es}
[A temporal position described using either a (nominal) value from an ordinal reference system, or a (numeric) value in a temporal coordinate system. ] {skos:definition @en}
[Una posición temporal descrita utilizando bien un valor (nominal) de un sistema de referencia ordinal, o un valor (numérico) en un sistema de coordenadas temporales.] {skos:definition @es}
[Temporal position] {+time:TemporalPosition ?subClassOf}

# Time Zone {=time:TimeZone .owl:Class label @en}
~~~ {comment @en}
A Time Zone specifies the amount by which the local time is offset from UTC. 
	A time zone is usually denoted geographically (e.g. Australian Eastern Daylight Time), with a constant value in a given region. 
The region where it applies and the offset from UTC are specified by a locally recognised governing authority.
~~~

~~~ {comment @es}
Un huso horario especifica la cantidad en que la hora local está desplazada con respecto a UTC.
        Un huso horario normalmente se denota geográficamente (p.ej. el horario de verano del este de Australia), con un valor constante en una región dada.
        La región donde aplica y el desplazamiento desde UTC las especifica una autoridad gubernamental localmente reconocida.
~~~

[huso horario] {label @es}
~~~ {skos:definition @en}
A Time Zone specifies the amount by which the local time is offset from UTC. 
	A time zone is usually denoted geographically (e.g. Australian Eastern Daylight Time), with a constant value in a given region. 
The region where it applies and the offset from UTC are specified by a locally recognised governing authority.
~~~

~~~ {skos:definition @es}
Un huso horario especifica la cantidad en que la hora local está desplazada con respecto a UTC.
    Un huso horario normalmente se denota geográficamente (p.ej. el horario de verano del este de Australia), con un valor constante en una región dada.
    La región donde aplica y el desplazamiento desde UTC las especifica una autoridad gubernamental localmente reconocida.
~~~

~~~ {skos:historyNote @es}
En la versión original de OWL-Time de 2006, se definió, en un espacio de nombres diferente "http://www.w3.org/2006/timezone#", la clase 'huso horario', con varias propiedades específicas correspondientes a un modelo específico de huso horario.
    En la versión actual hay una clase con el mismo nombre local en el espacio de nombres de OWL-Time, eliminando la dependencia del espacio de nombres externo.
    Un axioma de alineación permite que los datos codificados de acuerdo con la versión anterior sean consistentes con la ontología actualizada.
~~~

~~~ {skos:historyNote}
In the original 2006 version of OWL-Time, the TimeZone class, with several properties corresponding to a specific model of time-zones, was defined in a separate namespace "http://www.w3.org/2006/timezone#". 

In the current version a class with same local name is put into the main OWL-Time namespace, removing the dependency on the external namespace. 

An alignment axiom 
	tzont:TimeZone rdfs:subClassOf time:TimeZone . 
allows data encoded according to the previous version to be consistent with the updated ontology. 
~~~

~~~ {skos:note @en}
A designated timezone is associated with a geographic region. However, for a particular region the offset from UTC often varies seasonally, and the dates of the changes may vary from year to year. The timezone designation usually changes for the different seasons (e.g. Australian Eastern Standard Time vs. Australian Eastern Daylight Time). Furthermore, the offset for a timezone may change over longer timescales, though its designation might not.  

Detailed guidance about working with time zones is given in http://www.w3.org/TR/timezone/ .
~~~

[An ontology for time zone descriptions was described in [owl-time-20060927] and provided as RDF in a separate namespace tzont:. However, that ontology was incomplete in scope, and the example datasets were selective. Furthermore, since the use of a class from an external ontology as the range of an ObjectProperty in OWL-Time creates a dependency, reference to the time zone class has been replaced with the 'stub' class in the normative part of this version of OWL-Time.] {skos:note @en}
~~~ {skos:note @es}
Un huso horario designado está asociado con una región geográfica. Sin embargo, para una región particular el desplazamiento desde UTC a menudo varía según las estaciones, y las fechas de los cambios pueden variar de un año a otro. La designación de huso horario  normalmente cambia de una estación a otra (por ejemplo, el horario estándar frente al horario de verano ambos del este de Australia). Además, del desplazamiento para un huso horario puede cambiar sobre escalas de tiempo mayores, aunque su designación no lo haga.
    Se puede encontrar una guía detallada sobre el funcionamiento de husos horarios en http://www.w3.org/TR/timezone/."@es , "En [owl-time-20060927] se describió una ontología para descripciones de husos horarios, y se proporcionó en un espacio de nombres separado tzont:. Sin embargo, dicha ontología estaba incompleta en su alcance, y el ejemplo de conjuntos de datos (datasets) era selectivo. Además, puesto que el uso de una clase de una ontología externa como el rango de una propiedad de objeto en OWL-Time crea una dependencia, la referencia a la clase huso horario se ha reemplazado por una clase que viene a ser un "cajón de sastre" en la en la parte normativa de esta versión de OWL-Time.
~~~

[En esta implementación 'huso horario' no tiene definidas propiedades. Se debería pensar como una superclase "abstracta" de todas las implementaciones de huso horario específicas.] {skos:scopeNote @es}
[In this implementation TimeZone has no properties defined. It should be thought of as an 'abstract' superclass of all specific timezone implementations.] {skos:scopeNote}

# Tuesday {=time:Tuesday .time:DayOfWeek label @en}
[Dienstag] {skos:prefLabel @de}
[Dinsdag] {skos:prefLabel @nl}
[Mardi] {skos:prefLabel @fr}
[Martedì] {skos:prefLabel @it}
[Martes] {skos:prefLabel @es}
[Terça-feira] {skos:prefLabel @pt}
[Tuesday] {skos:prefLabel @en}
[Wtorek] {skos:prefLabel @pl}
[Вторник] {skos:prefLabel @ru}
[الثلاثاء] {skos:prefLabel @ar}
[星期二] {skos:prefLabel @zh}
[火曜日] {skos:prefLabel @ja}

# Wednesday {=time:Wednesday .time:DayOfWeek label @en}
[Mercoledì] {skos:prefLabel @it}
[Mercredi] {skos:prefLabel @fr}
[Miércoles] {skos:prefLabel @es}
[Mittwoch] {skos:prefLabel @de}
[Quarta-feira] {skos:prefLabel @pt}
[Środa] {skos:prefLabel @pl}
[Wednesday] {skos:prefLabel @en}
[Woensdag] {skos:prefLabel @nl}
[Среда] {skos:prefLabel @ru}
[الأربعاء] {skos:prefLabel @ar}
[星期三] {skos:prefLabel @zh}
[水曜日] {skos:prefLabel @ja}

# Year {=time:Year .owl:Class .owl:DeprecatedClass label @en}
[Year duration] {comment}
**true** {owl:deprecated ^^xsd:boolean}
[Year duration] {skos:definition}
~~~ {skos:historyNote}
Year was proposed in the 2006 version of OWL-Time as an example of how DurationDescription could be specialized to allow for a duration to be restricted to a number of years. 

It is deprecated in this edition of OWL-Time. 
~~~

[Année (calendrier)] {skos:prefLabel @fr}
[Anno] {skos:prefLabel @it}
[Ano] {skos:prefLabel @pt}
[Año] {skos:prefLabel @es}
[Jaar] {skos:prefLabel @nl}
[Jahr] {skos:prefLabel @de}
[Rok] {skos:prefLabel @pl}
[Year] {skos:prefLabel @en}
[Год] {skos:prefLabel @ru}
[سنة] {skos:prefLabel @ar}
[年] {skos:prefLabel @ja}
[年] {skos:prefLabel @zh}
[Duration description] {+time:DurationDescription ?subClassOf}

# after {=time:after .owl:ObjectProperty label @en}
[Asume una dirección en el tiempo. Si una entidad temporal T1 está después de otra entidad temporal T2, entonces el principio de T1 está después del final de T2.] {comment @es}
[Gives directionality to time. If a temporal entity T1 is after another temporal entity T2, then the beginning of T1 is after the end of T2.] {comment @en}
[después] {label @es}
[Asume una dirección en el tiempo. Si una entidad temporal T1 está después de otra entidad temporal T2, entonces el principio de T1 está después del final de T2.] {skos:definition @es}
[Gives directionality to time. If a temporal entity T1 is after another temporal entity T2, then the beginning of T1 is after the end of T2.] {skos:definition @en}
[Temporal entity] {+time:TemporalEntity ?domain}
[Temporal entity] {+time:TemporalEntity ?range}
[before] {+time:before ?owl:inverseOf}

# before {=time:before .owl:ObjectProperty .owl:TransitiveProperty label @en}
[Asume una dirección en el tiempo. Si una entidad temporal T1 está antes que otra entidad temporal T2, entonces el final de T1 está antes que el principio de T2. Así, "antes" se puede considerar básica para instantes y derivada para intervalos.] {comment @es}
[Gives directionality to time. If a temporal entity T1 is before another temporal entity T2, then the end of T1 is before the beginning of T2. Thus, "before" can be considered to be basic to instants and derived for intervals.] {comment @en}
[antes] {label @es}
[Asume una dirección en el tiempo. Si una entidad temporal T1 está antes que otra entidad temporal T2, entonces el final de T1 está antes que el principio de T2. Así, "antes" se puede considerar básica para instantes y derivada para intervalos.] {skos:definition @es}
[Gives directionality to time. If a temporal entity T1 is before another temporal entity T2, then the end of T1 is before the beginning of T2. Thus, "before" can be considered to be basic to instants and derived for intervals.] {skos:definition @en}
[Temporal entity] {+time:TemporalEntity ?domain}
[Temporal entity] {+time:TemporalEntity ?range}
[after] {+time:after ?owl:inverseOf}

# day {=time:day .owl:DatatypeProperty label @en}
~~~ {comment @en}
Day position in a calendar-clock system.

The range of this property is not specified, so can be replaced by any specific representation of a calendar day from any calendar. 
~~~

[Posición de día en un sistema calendario-reloj.] {comment @es}
[día] {label @es}
~~~ {skos:definition @en}
Day position in a calendar-clock system.

The range of this property is not specified, so can be replaced by any specific representation of a calendar day from any calendar. 
~~~

~~~ {skos:definition @es}
Posición de día en un sistema calendario-reloj.

El rango de esta propiedad no está especificado, por tanto, se puede reemplazar por una representación específica de un día de calendario de cualquier calendario.
~~~

[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}

# day of week {=time:dayOfWeek .owl:ObjectProperty label @en}
[El día de la semana, cuyo valor es un miembro de la clase 'día de la semana'.] {comment}
[The day of week, whose value is a member of the class time:DayOfWeek] {comment @en}
[día de la semana] {label @es}
[El día de la semana, cuyo valor es un miembro de la clase 'día de la semana'.] {skos:definition @es}
[The day of week, whose value is a member of the class time:DayOfWeek] {skos:definition @en}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[Day of week] {+time:DayOfWeek ?range}

# day of year {=time:dayOfYear .owl:DatatypeProperty label @en}
[El número de día en el año.] {comment @es}
[The number of the day within the year] {comment @en}
[día del año] {label @es}
[El número de día en el año.] {skos:definition @es}
[The number of the day within the year] {skos:definition @en}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# days duration {=time:days .owl:DatatypeProperty label @en}
[length of, or element of the length of, a temporal extent expressed in days] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en días.] {comment @es}
[duración en días] {label @es}
[length of, or element of the length of, a temporal extent expressed in days] {skos:definition @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en días.] {skos:definition @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# Generalized day {=time:generalDay .Datatype label @en}
~~~ {comment @en}
Day of month - formulated as a text string with a pattern constraint to reproduce the same lexical form as gDay, except that values up to 99 are permitted, in order to support calendars with more than 31 days in a month. 
Note that the value-space is not defined, so a generic OWL2 processor cannot compute ordering relationships of values of this type.
~~~

~~~ {comment @es}
Día del mes - formulado como una cadena de texto con una restricción patrón para reproducir la misma forma léxica que gDay, excepto que se permiten valores hasta el 99, con el propósito de proporcionar soporte a calendarios con meses con más de 31 días.
            Nótese que el espacio de valores no está definido, por tanto, un procesador genérico de OWL2 no puede computar relaciones de orden de valores de este tipo.
~~~

[Día generalizado] {label @es}
~~~ {skos:definition @en}
Day of month - formulated as a text string with a pattern constraint to reproduce the same lexical form as gDay, except that values up to 99 are permitted, in order to support calendars with more than 31 days in a month. 
Note that the value-space is not defined, so a generic OWL2 processor cannot compute ordering relationships of values of this type.
~~~

~~~ {skos:definition @es}
Día del mes - formulado como una cadena de texto con una restricción patrón para reproducir la misma forma léxica que gDay, excepto que se permiten valores hasta el 99, con el propósito de proporcionar soporte a calendarios con meses con más de 31 días.
            Nótese que el espacio de valores no está definido, por tanto, un procesador genérico de OWL2 no puede computar relaciones de orden de valores de este tipo.
~~~

[xsd:string] {+xsd:string ?owl:onDatatype}

# Generalized month {=time:generalMonth .Datatype label @en}
~~~ {comment @es}
Mes del año - formulado como una cadena de texto con una restricción patrón para reproducir la misma forma léxica que gMonth, excepto que se permiten valores hasta el 20, con el propósito de proporcionar soporte a calendarios con años con más de 12 meses.
            Nótese que el espacio de valores no está definido, por tanto, un procesador genérico de OWL2 no puede computar relaciones de orden de valores de este tipo.
~~~

~~~ {comment @en}
Month of year - formulated as a text string with a pattern constraint to reproduce the same lexical form as gMonth, except that values up to 20 are permitted, in order to support calendars with more than 12 months in the year. 
Note that the value-space is not defined, so a generic OWL2 processor cannot compute ordering relationships of values of this type.
~~~

[Mes generalizado] {label @es}
~~~ {skos:definition @es}
Mes del año - formulado como una cadena de texto con una restricción patrón para reproducir la misma forma léxica que gMonth, excepto que se permiten valores hasta el 20, con el propósito de proporcionar soporte a calendarios con años con más de 12 meses.
            Nótese que el espacio de valores no está definido, por tanto, un procesador genérico de OWL2 no puede computar relaciones de orden de valores de este tipo.
~~~

~~~ {skos:definition @en}
Month of year - formulated as a text string with a pattern constraint to reproduce the same lexical form as gMonth, except that values up to 20 are permitted, in order to support calendars with more than 12 months in the year. 
Note that the value-space is not defined, so a generic OWL2 processor cannot compute ordering relationships of values of this type.
~~~

[xsd:string] {+xsd:string ?owl:onDatatype}

# Generalized year {=time:generalYear .Datatype label @en}
~~~ {comment @es}
Número de año - formulado como una cadena de texto con una restricción patrón para reproducir la misma forma léxica que gYear, aunque no está restringido a valores del calendario gregoriano.
            Nótese que el espacio de valores no está definido, por tanto, un procesador genérico de OWL2 no puede computar relaciones de orden de valores de este tipo.
~~~

~~~ {comment @en}
Year number - formulated as a text string with a pattern constraint to reproduce the same lexical form as gYear, but not restricted to values from the Gregorian calendar. 
Note that the value-space is not defined, so a generic OWL2 processor cannot compute ordering relationships of values of this type.
~~~

[Año generalizado] {label @es}
~~~ {skos:definition @es}
Número de año - formulado como una cadena de texto con una restricción patrón para reproducir la misma forma léxica que gYear, aunque no está restringido a valores del calendario gregoriano.
            Nótese que el espacio de valores no está definido, por tanto, un procesador genérico de OWL2 no puede computar relaciones de orden de valores de este tipo.
~~~

~~~ {skos:definition @en}
Year number - formulated as a text string with a pattern constraint to reproduce the same lexical form as gYear, but not restricted to values from the Gregorian calendar. 
Note that the value-space is not defined, so a generic OWL2 processor cannot compute ordering relationships of values of this type.
~~~

[xsd:string] {+xsd:string ?owl:onDatatype}

# has beginning {=time:hasBeginning .owl:ObjectProperty label @en}
[Beginning of a temporal entity] {comment @en}
[Comienzo de una entidad temporal.] {comment @es}
[tiene principio] {label @es}
[Beginning of a temporal entity.] {skos:definition @en}
[Comienzo de una entidad temporal.] {skos:definition @es}
[Temporal entity] {+time:TemporalEntity ?domain}
[Time instant] {+time:Instant ?range}
[has time] {+time:hasTime ?subPropertyOf}

# has Date-Time description {=time:hasDateTimeDescription .owl:ObjectProperty label @en}
[Valor de intervalo de fecha-hora expresado como un valor estructurado. El principio y el final del intervalo coincide con los límites del elemento más corto en la descripción.] {comment @es}
[Value of DateTimeInterval expressed as a structured value. The beginning and end of the interval coincide with the limits of the shortest element in the description.] {comment @en}
[tiene descripción fecha-hora] {label @es}
[Valor de intervalo de fecha-hora expresado como un valor estructurado. El principio y el final del intervalo coincide con los límites del elemento más corto en la descripción.] {skos:definition @es}
[Value of DateTimeInterval expressed as a structured value. The beginning and end of the interval coincide with the limits of the shortest element in the description.] {skos:definition @en}
[Date-time interval] {+time:DateTimeInterval ?domain}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?range}

# has duration {=time:hasDuration .owl:ObjectProperty label @en}
[Duración de una entidad temporal, expresada como un valor escalado o un valor nominal.] {comment @es}
[Duration of a temporal entity, expressed as a scaled value or nominal value] {comment @en}
[tiene duración] {label @es}
[Duración de una entidad temporal, evento o actividad, o cosa, expresada como un valor escalado.] {skos:definition @es}
[Duration of a temporal entity, event or activity, or thing, expressed as a scaled value] {skos:definition @en}
[duración de tiempo] {+time:Duration ?range}
[has temporal duration] {+time:hasTemporalDuration ?subPropertyOf}

# has duration description {=time:hasDurationDescription .owl:ObjectProperty label @en}
[Duración de una entidad temporal, expresada utilizando una descripción estructurada.] {comment @es}
[Duration of a temporal entity, expressed using a structured description] {comment @en}
[tiene descripción de duración] {label @es}
[Duración de una entidad temporal, expresada utilizando una descripción estructurada.] {skos:definition @es}
[Duration of a temporal entity, expressed using a structured description] {skos:definition @en}
[Generalized duration description] {+time:GeneralDurationDescription ?range}
[has temporal duration] {+time:hasTemporalDuration ?subPropertyOf}

# has end {=time:hasEnd .owl:ObjectProperty label @en}
[End of a temporal entity.] {comment @en}
[Final de una entidad temporal.] {comment @es}
[tiene fin] {label @es}
[End of a temporal entity.] {skos:definition @en}
[Final de una entidad temporal.] {skos:definition @es}
[Temporal entity] {+time:TemporalEntity ?domain}
[Time instant] {+time:Instant ?range}
[has time] {+time:hasTime ?subPropertyOf}

# Temporal reference system used {=time:hasTRS .owl:FunctionalProperty .owl:ObjectProperty label @en}
[El sistema de referencia temporal utilizado por una posición temporal o descripción de extensión.] {comment @es}
[The temporal reference system used by a temporal position or extent description. ] {comment @en}
[sistema de referencia temporal utilizado] {label @es}
[El sistema de referencia temporal utilizado por una posición temporal o descripción de extensión.] {skos:definition @es}
[The temporal reference system used by a temporal position or extent description. ] {skos:definition @en}
[Temporal Reference System] {+time:TRS ?range}

# has temporal duration {=time:hasTemporalDuration .owl:ObjectProperty label @en}
[Duración de una entidad temporal.] {comment @es}
[Duration of a temporal entity.] {comment @en}
[tiene duración temporal] {label @es}
[Duración de una entidad temporal.] {skos:definition @es}
[Duration of a temporal entity.] {skos:definition @en}
[Temporal entity] {+time:TemporalEntity ?domain}
[Temporal duration] {+time:TemporalDuration ?range}

# has time {=time:hasTime .owl:ObjectProperty label @en}
[Proporciona soporte a la asociación de una entidad temporal (instante o intervalo) a cualquier cosa.] {comment @es}
[Supports the association of a temporal entity (instant or interval) to any thing] {comment @en}
[tiene tiempo] {label @es}
[Proporciona soporte a la asociación de una entidad temporal (instante o intervalo) a cualquier cosa.] {skos:definition @es}
[Supports the association of a temporal entity (instant or interval) to any thing] {skos:definition @en}
[Característica arriesgada -añadida en la revisión del 2017 que no ha sido todavía utilizada de forma amplia.] {skos:editorialNote @es}
[Feature at risk - added in 2017 revision, and not yet widely used. ] {skos:editorialNote @en}
[Temporal entity] {+time:TemporalEntity ?range}

# has XSD duration {=time:hasXSDDuration .owl:DatatypeProperty label @en}
[Extensión de una entidad temporal, expresada utilizando xsd:duration.] {comment @es}
[Extent of a temporal entity, expressed using xsd:duration] {comment @en}
[tiene duración XSD] {label @es}
[Extensión de una entidad temporal, expresada utilizando xsd:duration.] {skos:definition @es}
[Extent of a temporal entity, expressed using xsd:duration] {skos:definition @en}
[Característica arriesgada - añadida en la revisión de 2017, y todavía no ampliamente utilizada.] {skos:editorialNote @es}
[Feature at risk - added in 2017 revision, and not yet widely used. ] {skos:editorialNote @en}
[Temporal entity] {+time:TemporalEntity ?domain}
[xsd:duration] {+xsd:duration ?range}

# hour {=time:hour .owl:DatatypeProperty label @en}
[Hour position in a calendar-clock system.] {comment @en}
[Posición de hora en un sistema calendario-reloj.] {comment @es}
[hora] {label @es}
[Hour position in a calendar-clock system.] {skos:definition @en}
[Posición de hora en un sistema calendario-reloj.] {skos:definition @es}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# hours duration {=time:hours .owl:DatatypeProperty label @en}
[length of, or element of the length of, a temporal extent expressed in hours] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en horas.] {comment @es}
[duración en horas] {label @es}
[length of, or element of the length of, a temporal extent expressed in hours] {skos:definition @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en horas.] {skos:definition @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# in date-time description {=time:inDateTime .owl:ObjectProperty label @en}
[Posición de un instante, expresada utilizando una descripción estructurada.] {comment @es}
[Position of an instant, expressed using a structured description] {comment @en}
[en descripción de fecha-hora] {label @es}
[Posición de un instante, expresada utilizando una descripción estructurada.] {skos:definition @es}
[Position of an instant, expressed using a structured description] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?range}
[Temporal position] {+time:inTemporalPosition ?subPropertyOf}

# Temporal position {=time:inTemporalPosition .owl:ObjectProperty label @en}
[Posición de un instante de tiempo.] {comment @es}
[Position of a time instant] {comment @en}
[posición temporal] {label @es}
[Posición de un instante de tiempo.] {skos:definition @es}
[Position of a time instant] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[Temporal position] {+time:TemporalPosition ?range}

# Time position {=time:inTimePosition .owl:ObjectProperty label @en}
[Posición de un instante, expresada como una coordenada temporal o un valor nominal.] {comment @es}
[Position of an instant, expressed as a temporal coordinate or nominal value] {comment @en}
[posición de tiempo] {label @es}
[Posición de un instante, expresada como una coordenada temporal o un valor nominal.] {skos:definition @es}
[Position of a time instant expressed as a TimePosition] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[Time position] {+time:TimePosition ?range}
[Temporal position] {+time:inTemporalPosition ?subPropertyOf}

# in XSD date {=time:inXSDDate .owl:DatatypeProperty label @en}
[Posición de un instante, expresado utilizando xsd:date.] {comment @es}
[Position of an instant, expressed using xsd:date] {comment @en}
[en fecha XSD] {label @es}
[Posición de un instante, expresado utilizando xsd:date.] {skos:definition @es}
[Position of an instant, expressed using xsd:date] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[xsd:date] {+xsd:date ?range}

# in XSD Date-Time {=time:inXSDDateTime .owl:DatatypeProperty .owl:DeprecatedProperty label @en}
[Posición de un instante, expresado utilizando xsd:dateTime.] {comment @es}
[Position of an instant, expressed using xsd:dateTime] {comment @en}
[en fecha-tiempo XSD] {label @es}
**true** {owl:deprecated ^^xsd:boolean}
[Posición de un instante, expresado utilizando xsd:dateTime.] {skos:definition @es}
[Position of an instant, expressed using xsd:dateTime] {skos:definition @en}
[La propiedad 'en fecha-hora XSD' ha sido reemplazada por 'en fecha-sello de tiempo XSD' que hace obligatorio el campo 'huso horario'.] {skos:note @es}
[The property :inXSDDateTime is replaced by :inXSDDateTimeStamp which makes the time-zone field mandatory.] {skos:note @en}
[Time instant] {+time:Instant ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# in XSD Date-Time-Stamp {=time:inXSDDateTimeStamp .owl:DatatypeProperty label @en}
[Posición de un instante, expresado utilizando xsd:dateTimeStamp.] {comment @es}
[Position of an instant, expressed using xsd:dateTimeStamp] {comment @en}
[en fecha-sello de tiempo XSD] {label @es}
[Posición de un instante, expresado utilizando xsd:dateTimeStamp.] {skos:definition @es}
[Position of an instant, expressed using xsd:dateTimeStamp] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[sello de tiempo] {+xsd:dateTimeStamp ?range}

# in XSD g-Year {=time:inXSDgYear .owl:DatatypeProperty label @en}
[Posición de un instante, expresado utilizando xsd:gYear.] {comment @es}
[Position of an instant, expressed using xsd:gYear] {comment @en}
[en año gregoriano XSD] {label @es}
[Posición de un instante, expresado utilizando xsd:gYear.] {skos:definition @es}
[Position of an instant, expressed using xsd:gYear] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[xsd:gYear] {+xsd:gYear ?range}

# in XSD g-YearMonth {=time:inXSDgYearMonth .owl:DatatypeProperty label @en}
[Posición de un instante, expresado utilizando xsd:gYearMonth.] {comment @es}
[Position of an instant, expressed using xsd:gYearMonth] {comment @en}
[en año-mes gregoriano XSD] {label @es}
[Posición de un instante, expresado utilizando xsd:gYearMonth.] {skos:definition @es}
[Position of an instant, expressed using xsd:gYearMonth] {skos:definition @en}
[Time instant] {+time:Instant ?domain}
[xsd:gYearMonth] {+xsd:gYearMonth ?range}

# has time instant inside {=time:inside .owl:ObjectProperty label @en}
[An instant that falls inside the interval. It is not intended to include beginnings and ends of intervals.] {comment @en}
[Un instante que cae dentro del intervalo. Se asume que no es ni el principio ni el final de ningún intervalo.] {comment @es}
[tiene instante de tiempo dentro] {label @es}
[An instant that falls inside the interval. It is not intended to include beginnings and ends of intervals.] {skos:definition @en}
[Un instante que cae dentro del intervalo. Se asume que no es ni el principio ni el final de ningún intervalo.] {skos:definition @es}
[Time interval] {+time:Interval ?domain}
[Time instant] {+time:Instant ?range}

# interval after {=time:intervalAfter .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalAfter another proper interval T2, then the beginning of T1 is after the end of T2.] {comment @en}
[Si un intervalo propio T1 es posterior a otro intervalo propio T2, entonces el principio de T1 está después que el final de T2.] {comment}
[intervalo posterior] {label @es}
[If a proper interval T1 is intervalAfter another proper interval T2, then the beginning of T1 is after the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 es posterior a otro intervalo propio T2, entonces el principio de T1 está después que el final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[after] {+time:after ?subPropertyOf}
[interval disjoint] {+time:intervalDisjoint ?subPropertyOf}
[interval before] {+time:intervalBefore ?owl:inverseOf}

# interval before {=time:intervalBefore .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalBefore another proper interval T2, then the end of T1 is before the beginning of T2.] {comment @en}
[Si un intervalo propio T1 está antes que otro intervalo propio T2, entonces el final de T1 está antes que el principio de T2.] {comment @es}
[intervalo anterior] {label @es}
[If a proper interval T1 is intervalBefore another proper interval T2, then the end of T1 is before the beginning of T2.] {skos:definition @en}
[Si un intervalo propio T1 está antes que otro intervalo propio T2, entonces el final de T1 está antes que el principio de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[before] {+time:before ?subPropertyOf}
[interval disjoint] {+time:intervalDisjoint ?subPropertyOf}
[interval after] {+time:intervalAfter ?owl:inverseOf}

# interval contains {=time:intervalContains .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalContains another proper interval T2, then the beginning of T1 is before the beginning of T2, and the end of T1 is after the end of T2.] {comment @en}
[Si un intervalo propio T1 contiene otro intervalo propio T2, entonces el principio de T1 está antes que el principio de T2, y el final de T1 está después del final de T2.] {comment @es}
[intervalo contiene] {label @es}
[If a proper interval T1 is intervalContains another proper interval T2, then the beginning of T1 is before the beginning of T2, and the end of T1 is after the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 contiene otro intervalo propio T2, entonces el principio de T1 está antes que el principio de T2, y el final de T1 está después del final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval during] {+time:intervalDuring ?owl:inverseOf}

# interval disjoint {=time:intervalDisjoint .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalDisjoint another proper interval T2, then the beginning of T1 is after the end of T2, or the end of T1 is before the beginning of T2, i.e. the intervals do not overlap in any way, but their ordering relationship is not known.] {comment @en}
[Si un intervalo propio T1 es disjunto con otro intervalo propio T2, entonces el principio de T1 está después del final de T2, o el final de T1 está antes que el principio de T2, es decir, los intervalos no se solapan de ninguna forma, aunque su relación de orden no se conozca.] {comment @es}
[intervalo disjunto] {label @es}
[If a proper interval T1 is intervalDisjoint another proper interval T2, then the beginning of T1 is after the end of T2, or the end of T1 is before the beginning of T2, i.e. the intervals do not overlap in any way, but their ordering relationship is not known.] {skos:definition @en}
[Si un intervalo propio T1 es disjunto con otro intervalo propio T2, entonces el principio de T1 está después del final de T2, o el final de T1 está antes que el principio de T2, es decir, los intervalos no se solapan de ninguna forma, aunque su relación de orden no se conozca.] {skos:definition @es}
[Esta relación entre intervalos no estaba incluida en las 13 relaciones básicas definidas por Allen (1984), pero está definida en T.3 como la unión de 'intervalo anterior' con 'intervalo posterior'. Sin embargo, esto está fuera de la expresividad de OWL2, por tanto, está implementado como una propiedad explícita, con 'intervalo anterior' e 'intervalo posterior' como sub-propiedades.] {skos:note @es}
[This interval relation is not included in the 13 basic relationships defined in Allen (1984), but is defined in (T.3) as the union of :intervalBefore v :intervalAfter . However, that is outside OWL2 expressivity, so is implemented as an explicit property, with :intervalBefore , :intervalAfter as sub-properties] {skos:note @en}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}

# interval during {=time:intervalDuring .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalDuring another proper interval T2, then the beginning of T1 is after the beginning of T2, and the end of T1 is before the end of T2.] {comment @en}
[Si un intervalo propio T1 está durante otro intervalo propio T2, entonces del principio de T1 está después del principio de T2, y el final de T1 está antes que el final de T2.] {comment @es}
[intervalo durante] {label @es}
[If a proper interval T1 is intervalDuring another proper interval T2, then the beginning of T1 is after the beginning of T2, and the end of T1 is before the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 está durante otro intervalo propio T2, entonces del principio de T1 está después del principio de T2, y el final de T1 está antes que el final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval in] {+time:intervalIn ?subPropertyOf}
[interval contains] {+time:intervalContains ?owl:inverseOf}

# interval equals {=time:intervalEquals .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalEquals another proper interval T2, then the beginning of T1 is coincident with the beginning of T2, and the end of T1 is coincident with the end of T2.] {comment @en}
[Si un intervalo propio T1 es igual a otro intervalo propio T2, entonces el principio de T1 coincide con el principio de T2, y el final de T1 coincide con el final de T2.] {comment @es}
[intervalo igual] {label @es}
[If a proper interval T1 is intervalEquals another proper interval T2, then the beginning of T1 is coincident with the beginning of T2, and the end of T1 is coincident with the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 es igual a otro intervalo propio T2, entonces el principio de T1 coincide con el principio de T2, y el final de T1 coincide con el final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval in] {+time:intervalIn ?owl:propertyDisjointWith}

# interval finished by {=time:intervalFinishedBy .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalFinishedBy another proper interval T2, then the beginning of T1 is before the beginning of T2, and the end of T1 is coincident with the end of T2.] {comment @en}
[Si un intervalo propio T1 está terminado por otro intervalo propio T2, entonces el principio de T1 está antes que el principio de T2, y el final de T1 coincide con el final de T2.] {comment @es}
[intervalo terminado por] {label @es}
[If a proper interval T1 is intervalFinishedBy another proper interval T2, then the beginning of T1 is before the beginning of T2, and the end of T1 is coincident with the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 está terminado por otro intervalo propio T2, entonces el principio de T1 está antes que el principio de T2, y el final de T1 coincide con el final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval finishes] {+time:intervalFinishes ?owl:inverseOf}

# interval finishes {=time:intervalFinishes .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalFinishes another proper interval T2, then the beginning of T1 is after the beginning of T2, and the end of T1 is coincident with the end of T2.] {comment @en}
[Si un intervalo propio T1 termina otro intervalo propio T2, entonces del principio de T1 está después del principio de T2, y el final de T1 coincide con el final de T2.] {comment @es}
[intervalo termina] {label @es}
[If a proper interval T1 is intervalFinishes another proper interval T2, then the beginning of T1 is after the beginning of T2, and the end of T1 is coincident with the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 termina otro intervalo propio T2, entonces del principio de T1 está después del principio de T2, y el final de T1 coincide con el final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval in] {+time:intervalIn ?subPropertyOf}
[interval finished by] {+time:intervalFinishedBy ?owl:inverseOf}

# interval in {=time:intervalIn .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalIn another proper interval T2, then the beginning of T1 is after the beginning of T2 or is coincident with the beginning of T2, and the end of T1 is before the end of T2, or is coincident with the end of T2, except that end of T1 may not be coincident with the end of T2 if the beginning of T1 is coincident with the beginning of T2.] {comment @en}
[Si un intervalo propio T1 es un intervalo interior a otro intervalo propio T2, entonces el principio de T1 está después del principio de T2 o coincide con el principio de T2, y el final de T1 está antes que el final de T2, o coincide con el final de T2, excepto que el final de T1 puede no coincidir con el final de T2 si el principio de T1 coincide con el principio de T2.] {comment @es}
[intervalo interior] {label @es}
[If a proper interval T1 is intervalIn another proper interval T2, then the beginning of T1 is after the beginning of T2 or is coincident with the beginning of T2, and the end of T1 is before the end of T2, or is coincident with the end of T2, except that end of T1 may not be coincident with the end of T2 if the beginning of T1 is coincident with the beginning of T2.] {skos:definition @en}
[Si un intervalo propio T1 es un intervalo interior a otro intervalo propio T2, entonces el principio de T1 está después del principio de T2 o coincide con el principio de T2, y el final de T1 está antes que el final de T2, o coincide con el final de T2, excepto que el final de T1 puede no coincidir con el final de T2 si el principio de T1 coincide con el principio de T2.] {skos:definition @es}
[Esta relación entre intervalos no estaba incluida en las 13 relaciones básicas definidas por Allen (1984), pero se hace referencia a ella como "una relación importante" en Allen y Ferguson (1997). Es la unión disjunta de 'intervalo empieza', 'intervalo durante' y con 'intervalo termina'. Sin embargo, esto está fuera de la expresividad de OWL2, por tanto, se implementa como una propiedad explícita, con 'intervalo empieza', 'intervalo durante' e 'intervalo termina' como sub-propiedades.] {skos:note @es}
[This interval relation is not included in the 13 basic relationships defined in Allen (1984), but is referred to as 'an important relationship' in Allen and Ferguson (1997). It is the disjoint union of :intervalStarts v :intervalDuring v :intervalFinishes . However, that is outside OWL2 expressivity, so is implemented as an explicit property, with :intervalStarts , :intervalDuring , :intervalFinishes as sub-properties] {skos:note @en}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval equals] {+time:intervalEquals ?owl:propertyDisjointWith}

# interval meets {=time:intervalMeets .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalMeets another proper interval T2, then the end of T1 is coincident with the beginning of T2.] {comment @en}
[Si un intervalo propio T1 se encuentra con otro intervalo propio T2, entonces el final de T1 coincide con el principio de T2.] {comment @es}
[intervalo se encuentra] {label @es}
[If a proper interval T1 is intervalMeets another proper interval T2, then the end of T1 is coincident with the beginning of T2.] {skos:definition @en}
[Si un intervalo propio T1 se encuentra con otro intervalo propio T2, entonces el final de T1 coincide con el principio de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval met by] {+time:intervalMetBy ?owl:inverseOf}

# interval met by {=time:intervalMetBy .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalMetBy another proper interval T2, then the beginning of T1 is coincident with the end of T2.] {comment @en}
[Si un intervalo propio T1 es 'intervalo encontrado por' otro intervalo propio T2, entonces el principio de T1 coincide con el final de T2.] {comment @es}
[intervalo encontrado por] {label @es}
[If a proper interval T1 is intervalMetBy another proper interval T2, then the beginning of T1 is coincident with the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 es 'intervalo encontrado por' otro intervalo propio T2, entonces el principio de T1 coincide con el final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval meets] {+time:intervalMeets ?owl:inverseOf}

# interval overlapped by {=time:intervalOverlappedBy .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalOverlappedBy another proper interval T2, then the beginning of T1 is after the beginning of T2, the beginning of T1 is before the end of T2, and the end of T1 is after the end of T2.] {comment @en}
[Si un intervalo propio T1 es 'intervalo solapado por' otro intervalo propio T2, entonces el principio de T1 es posterior al principio de T2, y el principio de T1 es anterior al final de T2, y el final de T1 es posterior al final de T2.] {comment @es}
[intervalo solapado por] {label @es}
[If a proper interval T1 is intervalOverlappedBy another proper interval T2, then the beginning of T1 is after the beginning of T2, the beginning of T1 is before the end of T2, and the end of T1 is after the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 es 'intervalo solapado por' otro intervalo propio T2, entonces el principio de T1 es posterior al principio de T2, y el principio de T1 es anterior al final de T2, y el final de T1 es posterior al final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval overlaps] {+time:intervalOverlaps ?owl:inverseOf}

# interval overlaps {=time:intervalOverlaps .owl:ObjectProperty label @en}
[Asume una dirección en el tiempo. Si una entidad temporal T1 está después de otra entidad temporal T2, entonces el principio de T1 está después del final de T2.] {comment @es}
[If a proper interval T1 is intervalOverlaps another proper interval T2, then the beginning of T1 is before the beginning of T2, the end of T1 is after the beginning of T2, and the end of T1 is before the end of T2.] {comment @en}
[Si un intervalo propio T1 se solapa con otro intervalo propio T2, entonces el principio de T1 es anterior al principio de T2, el final de T1 es posterior al principio de T2, y el final de T1 es anterior al final de T2.] {comment @es}
[intervalo se solapa] {label @es}
[If a proper interval T1 is intervalOverlaps another proper interval T2, then the beginning of T1 is before the beginning of T2, the end of T1 is after the beginning of T2, and the end of T1 is before the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 se solapa con otro intervalo propio T2, entonces el principio de T1 es anterior al principio de T2, el final de T1 es posterior al principio de T2, y el final de T1 es anterior al final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval overlapped by] {+time:intervalOverlappedBy ?owl:inverseOf}

# interval started by {=time:intervalStartedBy .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalStarted another proper interval T2, then the beginning of T1 is coincident with the beginning of T2, and the end of T1 is after the end of T2.] {comment @en}
[Si un intervalo propio T1 es empezado por otro intervalo propio T2, entonces el principio de T1 coincide con el principio de T2, y el final de T1 es posterior al final de T2.] {comment @es}
[If a proper interval T1 is intervalStarted another proper interval T2, then the beginning of T1 is coincident with the beginning of T2, and the end of T1 is after the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 es empezado por otro intervalo propio T2, entonces el principio de T1 coincide con el principio de T2, y el final de T1 es posterior al final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval starts] {+time:intervalStarts ?owl:inverseOf}

# interval starts {=time:intervalStarts .owl:ObjectProperty label @en}
[If a proper interval T1 is intervalStarts another proper interval T2, then the beginning of T1 is coincident with the beginning of T2, and the end of T1 is before the end of T2.] {comment @en}
[Si un intervalo propio T1 empieza otro intervalo propio T2, entonces del principio de T1 con el principio de T2, y el final de T1 es anterior al final de T2.] {comment @es}
[intervalo empieza] {label @es}
[If a proper interval T1 is intervalStarts another proper interval T2, then the beginning of T1 is coincident with the beginning of T2, and the end of T1 is before the end of T2.] {skos:definition @en}
[Si un intervalo propio T1 empieza otro intervalo propio T2, entonces del principio de T1 con el final de T2, y el final de T1 es anterior al final de T2.] {skos:definition @es}
[Proper interval] {+time:ProperInterval ?domain}
[Proper interval] {+time:ProperInterval ?range}
[interval in] {+time:intervalIn ?subPropertyOf}
[interval started by] {+time:intervalStartedBy ?owl:inverseOf}

# minute {=time:minute .owl:DatatypeProperty label @en}
[Minute position in a calendar-clock system.] {comment @en}
[Posición de minuto en un sistema calendario-reloj.] {comment @es}
[minuto] {label @es}
[Minute position in a calendar-clock system.] {skos:definition @en}
[Posición de minuto en un sistema calendario-reloj.] {skos:definition @es}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# minutes {=time:minutes .owl:DatatypeProperty label @en}
[length, or element of, a temporal extent expressed in minutes] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en minutos.] {comment @es}
[minutos] {label @es}
[length, or element of, a temporal extent expressed in minutes] {skos:definition @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en minutos.] {skos:definition @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# month {=time:month .owl:DatatypeProperty label @en}
~~~ {comment @en}
Month position in a calendar-clock system.

The range of this property is not specified, so can be replaced by any specific representation of a calendar month from any calendar. 
~~~

~~~ {comment @es}
Posición de mes en un sistema calendario-reloj.
    El rango de esta propiedad no está especificado, por tanto, se puede reemplazar por cualquier representación específica de un mes de calendario de un calendario cualquiera.
~~~

[mes] {label @es}
~~~ {skos:definition @en}
Month position in a calendar-clock system.

The range of this property is not specified, so can be replaced by any specific representation of a calendar month from any calendar. 
~~~

~~~ {skos:definition @es}
Posición de mes en un sistema calendario-reloj.
            El rango de esta propiedad no está especificado, por tanto, se puede reemplazar por cualquier representación específica de un mes de calendario de un calendario cualquiera.
~~~

[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}

# month of year {=time:monthOfYear .owl:ObjectProperty label @en}
[El mes del año, cuyo valor es un miembro de la clase 'mes del año'.] {comment @es}
[The month of the year, whose value is a member of the class time:MonthOfYear] {comment @en}
[mes del año] {label @es}
[El mes del año, cuyo valor es un miembro de la clase 'mes del año'.] {skos:definition @es}
[The month of the year, whose value is a member of the class time:MonthOfYear] {skos:definition @en}
[Característica arriesgada - añadida en la revisión de 2017, y todavía no ampliamente utilizada.] {skos:editorialNote @es}
[Feature at risk - added in 2017 revision, and not yet widely used. ] {skos:editorialNote @en}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[Month of year] {+time:MonthOfYear ?range}

# months duration {=time:months .owl:DatatypeProperty label @en}
[length of, or element of the length of, a temporal extent expressed in months] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en meses.] {comment @es}
[duración en meses] {label @es}
[length of, or element of the length of, a temporal extent expressed in months] {skos:definition @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en meses.] {skos:definition @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# Name of temporal position {=time:nominalPosition .owl:DatatypeProperty label @en}
[El valor (nominal) que indica posición temporal en un sistema de referencia ordinal.] {comment @es}
[The (nominal) value indicating temporal position in an ordinal reference system ] {comment @en}
[nombre de posición temporal] {label @es}
[El valor (nominal) que indica posición temporal en un sistema de referencia ordinal.] {skos:definition @es}
[The (nominal) value indicating temporal position in an ordinal reference system ] {skos:definition @en}
[Time position] {+time:TimePosition ?domain}
[xsd:string] {+xsd:string ?range}

# Numeric value of temporal duration {=time:numericDuration .owl:DatatypeProperty label @en}
[Valor de una extensión temporal expresada como un número decimal escalado por una unidad de tiempo.] {comment @es}
[Value of a temporal extent expressed as a decimal number scaled by a temporal unit] {comment @en}
[valor numérico de duración temporal] {label @es}
[Valor de una extensión temporal expresada como un número decimal escalado por una unidad de tiempo.] {skos:definition @es}
[Value of a temporal extent expressed as a decimal number scaled by a temporal unit] {skos:definition @en}
[duración de tiempo] {+time:Duration ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# Numeric value of temporal position {=time:numericPosition .owl:DatatypeProperty label @en}
[El valor (numérico) que indica posición temporal en un sistema de referencia ordinal.] {comment @es}
[The (numeric) value indicating position within a temporal coordinate system ] {comment @en}
[valor numérico de posición temporal] {label @es}
[El valor (numérico) que indica posición temporal en un sistema de referencia ordinal.] {skos:definition @es}
[The (numeric) value indicating position within a temporal coordinate system ] {skos:definition @en}
[Time position] {+time:TimePosition ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# second {=time:second .owl:DatatypeProperty label @en}
[Posición de segundo en un sistema calendario-reloj.] {comment @es}
[Second position in a calendar-clock system.] {comment @en}
[segundo] {label @es}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# seconds duration {=time:seconds .owl:DatatypeProperty label @en}
[length of, or element of the length of, a temporal extent expressed in seconds] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en segundos.] {comment @es}
[duración en segundos] {label @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}
[http://www.bipm.org/en/publications/si-brochure/second.html] {+http://www.bipm.org/en/publications/si-brochure/second.html ?seeAlso}
[http://www.bipm.org/en/publications/si-brochure/second.html] {+http://www.bipm.org/en/publications/si-brochure/second.html ?seeAlso}

# in time zone {=time:timeZone .owl:ObjectProperty label @en}
[The time zone for clock elements in the temporal position] {comment @en}
[en huso horario] {label @es}
~~~ {skos:historyNote @es}
En la versión original de OWL-Time de 2006, el rango de 'en huso horario' se definió en un espacio de nombres diferente "http://www.w3.org/2006/timezone#".
            Un axioma de alineación permite que los datos codificados de acuerdo con la versión anterior sean consistentes con la ontología actualizada.
~~~

~~~ {skos:historyNote}
In the original 2006 version of OWL-Time, the range of time:timeZone was a TimeZone class in a separate namespace "http://www.w3.org/2006/timezone#". 
An alignment axiom 
	tzont:TimeZone rdfs:subClassOf time:TimeZone . 
allows data encoded according to the previous version to be consistent with the updated ontology. 
~~~

~~~ {skos:note}
IANA maintains a database of timezones. These are well maintained and generally considered authoritative, but individual items are not available at individual URIs, so cannot be used directly in data expressed using OWL-Time.

DBPedia provides a set of resources corresponding to the IANA timezones, with a URI for each (e.g. http://dbpedia.org/resource/Australia/Eucla). The World Clock service also provides a list of time zones with the description of each available as an individual webpage with a convenient individual URI (e.g. https://www.timeanddate.com/time/zones/acwst). These or other, similar, resources might be used as a value of the time:timeZone property.
~~~

~~~ {skos:note @es}
IANA mantiene una base de datos de husos horarios. Éstas están bien mantenidas y generalmente se consideran autorizadas, pero los ítems individuales no están disponibles en URIs individuales, por tanto, no se pueden utilizar directamente en datos expresados utilizando OWL-Time.
            La BDPedia proporciona un conjunto de recursos correspondientes a los husos horarios de IANA, con una URI para cada uno (por ejemplo, http://dbpedia.org/resource/Australia/Eucla). El Servicio de Reloj Mundial también proporciona una lista de husos horarios con la descripción de cada uno de los disponibles como una página Web individual con una URI adecuada individual (por ejemplo, https://www.timeanddate.com/time/zones/acwst). Éstos, y otros recursos similares, se puden usar como un valor de la propiedad 'huso horario'.
~~~

[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[Time Zone] {+time:TimeZone ?range}

# Day (unit of temporal duration) {=time:unitDay .time:TemporalUnit label @en}
[dag] {skos:prefLabel @nl}
[day] {skos:prefLabel @en}
[dia] {skos:prefLabel @pt}
[día] {skos:prefLabel @es}
[doba] {skos:prefLabel @pl}
[giorno] {skos:prefLabel @it}
[jour] {skos:prefLabel @fr}
[Tag] {skos:prefLabel @de}
[يوماً ما] {skos:prefLabel @ar}
[언젠가] {skos:prefLabel @kr}
[ある日] {skos:prefLabel @ja}
[一天] {skos:prefLabel @zh}
`1` {time:days ^^xsd:decimal}
`0` {time:hours ^^xsd:decimal}
`0` {time:minutes ^^xsd:decimal}
`0` {time:months ^^xsd:decimal}
`0` {time:seconds ^^xsd:decimal}
`0` {time:weeks ^^xsd:decimal}
`0` {time:years ^^xsd:decimal}

# Hour (unit of temporal duration) {=time:unitHour .time:TemporalUnit label @en}
[godzina] {skos:prefLabel @pl}
[heure] {skos:prefLabel @fr}
[hora] {skos:prefLabel @es}
[hora] {skos:prefLabel @pt}
[hour] {skos:prefLabel @en}
[ora] {skos:prefLabel @it}
[Stunde] {skos:prefLabel @de}
[uur] {skos:prefLabel @nl}
[один час"@ru] {skos:prefLabel}
[ساعة واحدة] {skos:prefLabel @ar}
[한 시간] {skos:prefLabel @kr}
[一小時] {skos:prefLabel @zh}
[一時間] {skos:prefLabel @ja}
`0` {time:days ^^xsd:decimal}
`1` {time:hours ^^xsd:decimal}
`0` {time:minutes ^^xsd:decimal}
`0` {time:months ^^xsd:decimal}
`0` {time:seconds ^^xsd:decimal}
`0` {time:weeks ^^xsd:decimal}
`0` {time:years ^^xsd:decimal}

# Minute (unit of temporal duration) {=time:unitMinute .time:TemporalUnit label @en}
[minuta] {skos:prefLabel @pl}
[minute] {skos:prefLabel @en}
[minute] {skos:prefLabel @fr}
[Minute] {skos:prefLabel @de}
[minuto] {skos:prefLabel @es}
[minuto] {skos:prefLabel @it}
[minuto] {skos:prefLabel @pt}
[minuut] {skos:prefLabel @nl}
[одна минута] {skos:prefLabel @ru}
[دقيقة واحدة] {skos:prefLabel @ar}
[분] {skos:prefLabel @kr}
[一分] {skos:prefLabel @ja}
[等一下] {skos:prefLabel @zh}
`0` {time:days ^^xsd:decimal}
`0` {time:hours ^^xsd:decimal}
`1` {time:minutes ^^xsd:decimal}
`0` {time:months ^^xsd:decimal}
`0` {time:seconds ^^xsd:decimal}
`0` {time:weeks ^^xsd:decimal}
`0` {time:years ^^xsd:decimal}

# Month (unit of temporal duration) {=time:unitMonth .time:TemporalUnit label @en}
[maand] {skos:prefLabel @nl}
[mes] {skos:prefLabel @es}
[mese] {skos:prefLabel @it}
[miesiąc] {skos:prefLabel @pl}
[mois] {skos:prefLabel @fr}
[Monat] {skos:prefLabel @de}
[month] {skos:prefLabel @en}
[один месяц] {skos:prefLabel @ru}
[شهر واحد] {skos:prefLabel @ar}
[한달] {skos:prefLabel @kr}
[一か月] {skos:prefLabel @ja}
[一個月] {skos:prefLabel @zh}
`0` {time:days ^^xsd:decimal}
`0` {time:hours ^^xsd:decimal}
`0` {time:minutes ^^xsd:decimal}
`1` {time:months ^^xsd:decimal}
`0` {time:seconds ^^xsd:decimal}
`0` {time:weeks ^^xsd:decimal}
`0` {time:years ^^xsd:decimal}

# Second (unit of temporal duration) {=time:unitSecond .time:TemporalUnit label @en}
[second] {skos:prefLabel @en}
[seconde] {skos:prefLabel @fr}
[seconde] {skos:prefLabel @nl}
[secondo] {skos:prefLabel @it}
[segundo] {skos:prefLabel @es}
[segundo] {skos:prefLabel @pt}
[Sekunde] {skos:prefLabel @de}
[sekundę] {skos:prefLabel @pl}
[ثانية واحدة] {skos:prefLabel @ar}
[일초] {skos:prefLabel @kr}
[一秒] {skos:prefLabel @ja}
[一秒] {skos:prefLabel @zh}
`0` {time:days ^^xsd:decimal}
`0` {time:hours ^^xsd:decimal}
`0` {time:minutes ^^xsd:decimal}
`0` {time:months ^^xsd:decimal}
`1` {time:seconds ^^xsd:decimal}
`0` {time:weeks ^^xsd:decimal}
`0` {time:years ^^xsd:decimal}

# temporal unit type {=time:unitType .owl:ObjectProperty label @en}
[La unidad de tiempo que proporciona la precisión de un valor fecha-hora o la escala de una extensión temporal.] {comment @es}
[The temporal unit which provides the precision of a date-time value or scale of a temporal extent] {comment @en}
[tipo de unidad temporal] {label @es}
[Temporal unit] {+time:TemporalUnit ?range}

# Week (unit of temporal duration) {=time:unitWeek .time:TemporalUnit label @en}
[semaine] {skos:prefLabel @fr}
[semana] {skos:prefLabel @es}
[semana] {skos:prefLabel @pt}
[settimana] {skos:prefLabel @it}
[tydzień] {skos:prefLabel @pl}
[week] {skos:prefLabel @en}
[week] {skos:prefLabel @nl}
[Woche] {skos:prefLabel @de}
[одна неделя] {skos:prefLabel @ru}
[سبوع واحد] {skos:prefLabel @ar}
[일주일] {skos:prefLabel @kr}
[一周] {skos:prefLabel @zh}
[一週間] {skos:prefLabel @ja}
`0` {time:days ^^xsd:decimal}
`0` {time:hours ^^xsd:decimal}
`0` {time:minutes ^^xsd:decimal}
`0` {time:months ^^xsd:decimal}
`0` {time:seconds ^^xsd:decimal}
`1` {time:weeks ^^xsd:decimal}
`0` {time:years ^^xsd:decimal}

# Year (unit of temporal duration) {=time:unitYear .time:TemporalUnit label @en}
[1 년] {skos:prefLabel @kr}
[an] {skos:prefLabel @fr}
[anno] {skos:prefLabel @it}
[ano] {skos:prefLabel @pt}
[jaar] {skos:prefLabel @nl}
[Jahr] {skos:prefLabel @de}
[rok] {skos:prefLabel @pl}
[un año] {skos:prefLabel @es}
[year] {skos:prefLabel @en}
[один год] {skos:prefLabel @ru}
[سنة واحدة] {skos:prefLabel @ar}
[一年] {skos:prefLabel @ja}
[一年] {skos:prefLabel @zh}
`0` {time:days ^^xsd:decimal}
`0` {time:hours ^^xsd:decimal}
`0` {time:minutes ^^xsd:decimal}
`0` {time:months ^^xsd:decimal}
`0` {time:seconds ^^xsd:decimal}
`0` {time:weeks ^^xsd:decimal}
`1` {time:years ^^xsd:decimal}

# week {=time:week .owl:DatatypeProperty label @en}
[Número de semana en el año.] {comment @es}
[Week number within the year.] {comment @en}
[semana] {label @es}
[Weeks are numbered differently depending on the calendar in use and the local language or cultural conventions (locale). ISO-8601 specifies that the first week of the year includes at least four days, and that Monday is the first day of the week. In that system, week 1 is the week that contains the first Thursday in the year.] {skos:note @en}
[Las semanas están numeradas de forma diferente dependiendo del calendario en uso y de las convenciones lingüísticas y culturales locales (locale en inglés). El ISO-8601 especifica que la primera semana del año incluye al menos cuatro días, y que el lunes es el primer día de la semana. En ese sistema, la semana 1 es la semana que contiene el primer jueves del año.] {skos:scopeNote @es}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}
[xsd:nonNegativeInteger] {+xsd:nonNegativeInteger ?range}

# weeks duration {=time:weeks .owl:DatatypeProperty label @en}
[length of, or element of the length of, a temporal extent expressed in weeks] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en semanas.] {comment @es}
[duración en semanas] {label @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}

# has XSD date-time {=time:xsdDateTime .owl:DatatypeProperty .owl:DeprecatedProperty label @en}
[Valor de 'intervalo de fecha-hora' expresado como un valor compacto.] {comment @es}
[Value of DateTimeInterval expressed as a compact value.] {comment @en}
[tiene fecha-hora XSD] {label @es}
**true** {owl:deprecated ^^xsd:boolean}
[Using xsd:dateTime in this place means that the duration of the interval is implicit: it corresponds to the length of the smallest non-zero element of the date-time literal. However, this rule cannot be used for intervals whose duration is more than one rank smaller than the starting time - e.g. the first minute or second of a day, the first hour of a month, or the first day of a year. In these cases the desired interval cannot be distinguished from the interval corresponding to the next rank up. Because of this essential ambiguity, use of this property is not recommended and it is deprecated.] {skos:note @en}
[Utilizando xsd:dateTime en este lugar significa que la duración del intervalo está implícita: se corresponde con la longitud del elemento más pequeño distinto de cero del literal fecha-hora. Sin embargo, esta regla no se puede utilizar para intervalos cuya duración es mayor que un rango más pequeño que el tiempo de comienzo - p.ej. el primer minuto o segundo del día, la primera hora del mes, o el primer día del año. En estos casos el intervalo deseado no se puede distinguir del intervalo correspondiente al próximo rango más alto. Debido a esta ambigüedad esencial, no se recomienda el uso de esta propiedad y está desaprobada.] {skos:note}
[Date-time interval] {+time:DateTimeInterval ?domain}
[xsd:dateTime] {+xsd:dateTime ?range}

# year {=time:year .owl:DatatypeProperty label @en}
~~~ {comment @es}
Posición de año en un sistema calendario-reloj.

l rango de esta propiedad no está especificado, por tanto, se puede reemplazar por cualquier representación específica de un año de calendario de un calendario cualquiera.
~~~

~~~ {comment @en}
Year position in a calendar-clock system.

The range of this property is not specified, so can be replaced by any specific representation of a calendar year from any calendar. 
~~~

[Generalized date-time description] {+time:GeneralDateTimeDescription ?domain}

# years duration {=time:years .owl:DatatypeProperty label @en}
[length of, or element of the length of, a temporal extent expressed in years] {comment @en}
[Longitud de, o elemento de la longitud de, una extensión temporal expresada en años.] {comment @es}
[duración en años] {label @es}
[Generalized duration description] {+time:GeneralDurationDescription ?domain}
[xsd:decimal] {+xsd:decimal ?range}




# b0_n3-0 {=b0_n3-0 .owl:Restriction}
[xsd:gDay] {+xsd:gDay ?owl:allValuesFrom}
[day] {+time:day ?owl:onProperty}

# b0_n3-1 {=b0_n3-1 .owl:Restriction}
[xsd:gMonth] {+xsd:gMonth ?owl:allValuesFrom}
[month] {+time:month ?owl:onProperty}

# b0_n3-10 {=b0_n3-10 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[seconds duration] {+time:seconds ?owl:onProperty}

# b0_n3-11 {=b0_n3-11 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[weeks duration] {+time:weeks ?owl:onProperty}

# b0_n3-12 {=b0_n3-12 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[years duration] {+time:years ?owl:onProperty}

# b0_n3-13 {=b0_n3-13 .owl:Restriction}
[http://www.opengis.net/def/uom/ISO-8601/0/Gregorian] {+http://www.opengis.net/def/uom/ISO-8601/0/Gregorian ?owl:hasValue}
[Temporal reference system used] {+time:hasTRS ?owl:onProperty}

# b0_n3-14 {=b0_n3-14 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[temporal unit type] {+time:unitType ?owl:onProperty}

# b0_n3-15 {=b0_n3-15 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[day] {+time:day ?owl:onProperty}

# b0_n3-16 {=b0_n3-16 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[day of week] {+time:dayOfWeek ?owl:onProperty}

# b0_n3-17 {=b0_n3-17 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[day of year] {+time:dayOfYear ?owl:onProperty}

# b0_n3-18 {=b0_n3-18 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[hour] {+time:hour ?owl:onProperty}

# b0_n3-19 {=b0_n3-19 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[minute] {+time:minute ?owl:onProperty}

# b0_n3-2 {=b0_n3-2 .owl:Restriction}
[xsd:gYear] {+xsd:gYear ?owl:allValuesFrom}
[year] {+time:year ?owl:onProperty}

# b0_n3-20 {=b0_n3-20 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[month] {+time:month ?owl:onProperty}

# b0_n3-21 {=b0_n3-21 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[month of year] {+time:monthOfYear ?owl:onProperty}

# b0_n3-22 {=b0_n3-22 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[second] {+time:second ?owl:onProperty}

# b0_n3-23 {=b0_n3-23 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[in time zone] {+time:timeZone ?owl:onProperty}

# b0_n3-24 {=b0_n3-24 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[week] {+time:week ?owl:onProperty}

# b0_n3-25 {=b0_n3-25 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[year] {+time:year ?owl:onProperty}

# b0_n3-26 {=b0_n3-26 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[Temporal reference system used] {+time:hasTRS ?owl:onProperty}

# b0_n3-27 {=b0_n3-27 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[days duration] {+time:days ?owl:onProperty}

# b0_n3-28 {=b0_n3-28 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[hours duration] {+time:hours ?owl:onProperty}

# b0_n3-29 {=b0_n3-29 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[minutes] {+time:minutes ?owl:onProperty}

# b0_n3-3 {=b0_n3-3 .owl:Restriction}
[http://www.opengis.net/def/uom/ISO-8601/0/Gregorian] {+http://www.opengis.net/def/uom/ISO-8601/0/Gregorian ?owl:hasValue}
[Temporal reference system used] {+time:hasTRS ?owl:onProperty}

# b0_n3-30 {=b0_n3-30 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[months duration] {+time:months ?owl:onProperty}

# b0_n3-31 {=b0_n3-31 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[seconds duration] {+time:seconds ?owl:onProperty}

# b0_n3-32 {=b0_n3-32 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[weeks duration] {+time:weeks ?owl:onProperty}

# b0_n3-33 {=b0_n3-33 .owl:Restriction}
[1] {owl:maxCardinality ^^xsd:nonNegativeInteger}
[years duration] {+time:years ?owl:onProperty}

# b0_n3-34 {=b0_n3-34 .owl:Restriction}
[Month (unit of temporal duration)] {+time:unitMonth ?owl:hasValue}
[temporal unit type] {+time:unitType ?owl:onProperty}

# b0_n3-35 {=b0_n3-35 .owl:Restriction}
[--01] {owl:hasValue}
[month] {+time:month ?owl:onProperty}

# b0_n3-36 {=b0_n3-36 .owl:Restriction}
[0] {owl:cardinality ^^xsd:nonNegativeInteger}
[day] {+time:day ?owl:onProperty}

# b0_n3-37 {=b0_n3-37 .owl:Restriction}
[0] {owl:cardinality ^^xsd:nonNegativeInteger}
[hour] {+time:hour ?owl:onProperty}

# b0_n3-38 {=b0_n3-38 .owl:Restriction}
[0] {owl:cardinality ^^xsd:nonNegativeInteger}
[minute] {+time:minute ?owl:onProperty}

# b0_n3-39 {=b0_n3-39 .owl:Restriction}
[0] {owl:cardinality ^^xsd:nonNegativeInteger}
[second] {+time:second ?owl:onProperty}

# b0_n3-4 {=b0_n3-4 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[Numeric value of temporal duration] {+time:numericDuration ?owl:onProperty}

# b0_n3-40 {=b0_n3-40 .owl:Restriction}
[0] {owl:cardinality ^^xsd:nonNegativeInteger}
[week] {+time:week ?owl:onProperty}

# b0_n3-41 {=b0_n3-41 .owl:Restriction}
[0] {owl:cardinality ^^xsd:nonNegativeInteger}
[year] {+time:year ?owl:onProperty}

# b0_n3-42 {=b0_n3-42 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[month] {+time:month ?owl:onProperty}

# b0_n3-43 {=b0_n3-43 .owl:Restriction}
[Month (unit of temporal duration)] {+time:unitMonth ?owl:hasValue}
[temporal unit type] {+time:unitType ?owl:onProperty}

# b0_n3-44 {=b0_n3-44}
[Time instant] {+time:Instant ?rdf:first}

# b0_n3-45 {=b0_n3-45}
[Time interval] {+time:Interval ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-46 {=b0_n3-46 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[Temporal reference system used] {+time:hasTRS ?owl:onProperty}

# b0_n3-47 {=b0_n3-47 .owl:Class}

# b0_n3-48 {=b0_n3-48}

# b0_n3-49 {=b0_n3-49 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[Numeric value of temporal position] {+time:numericPosition ?owl:onProperty}

# b0_n3-5 {=b0_n3-5 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[temporal unit type] {+time:unitType ?owl:onProperty}

# b0_n3-50 {=b0_n3-50}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-51 {=b0_n3-51 .owl:Restriction}
[1] {owl:cardinality ^^xsd:nonNegativeInteger}
[Name of temporal position] {+time:nominalPosition ?owl:onProperty}

# b0_n3-52 {=b0_n3-52 .owl:Restriction}
`0` {owl:cardinality ^^xsd:integer}
[days duration] {+time:days ?owl:onProperty}

# b0_n3-53 {=b0_n3-53 .owl:Restriction}
`0` {owl:cardinality ^^xsd:integer}
[hours duration] {+time:hours ?owl:onProperty}

# b0_n3-54 {=b0_n3-54 .owl:Restriction}
`0` {owl:cardinality ^^xsd:integer}
[minutes] {+time:minutes ?owl:onProperty}

# b0_n3-55 {=b0_n3-55 .owl:Restriction}
`0` {owl:cardinality ^^xsd:integer}
[months duration] {+time:months ?owl:onProperty}

# b0_n3-56 {=b0_n3-56 .owl:Restriction}
`0` {owl:cardinality ^^xsd:integer}
[seconds duration] {+time:seconds ?owl:onProperty}

# b0_n3-57 {=b0_n3-57 .owl:Restriction}
`0` {owl:cardinality ^^xsd:integer}
[weeks duration] {+time:weeks ?owl:onProperty}

# b0_n3-58 {=b0_n3-58 .owl:Restriction}
`1` {owl:cardinality ^^xsd:integer}
[years duration] {+time:years ?owl:onProperty}

# b0_n3-59 {=b0_n3-59}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-6 {=b0_n3-6 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[days duration] {+time:days ?owl:onProperty}

# b0_n3-60 {=b0_n3-60}
[---(0[1-9]|[1-9][0-9])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?] {xsd:pattern}

# b0_n3-61 {=b0_n3-61}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-62 {=b0_n3-62}
[--(0[1-9]|1[0-9]|20)(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?] {xsd:pattern}

# b0_n3-63 {=b0_n3-63}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-64 {=b0_n3-64}
[-?([1-9][0-9]{3,}|0[0-9]{3})(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?] {xsd:pattern}

# b0_n3-65 {=b0_n3-65 .owl:Class}

# b0_n3-66 {=b0_n3-66}
[Temporal position] {+time:TemporalPosition ?rdf:first}

# b0_n3-67 {=b0_n3-67}
[Generalized duration description] {+time:GeneralDurationDescription ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-68 {=b0_n3-68 .owl:Class}

# b0_n3-69 {=b0_n3-69}
[Generalized date-time description] {+time:GeneralDateTimeDescription ?rdf:first}

# b0_n3-7 {=b0_n3-7 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[hours duration] {+time:hours ?owl:onProperty}

# b0_n3-70 {=b0_n3-70}
[duración de tiempo] {+time:Duration ?rdf:first}
[rdf:nil] {+rdf:nil ?rdf:rest}

# b0_n3-8 {=b0_n3-8 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[minutes] {+time:minutes ?owl:onProperty}

# b0_n3-9 {=b0_n3-9 .owl:Restriction}
[xsd:decimal] {+xsd:decimal ?owl:allValuesFrom}
[months duration] {+time:months ?owl:onProperty}

# sello de tiempo {=xsd:dateTimeStamp label @es}
