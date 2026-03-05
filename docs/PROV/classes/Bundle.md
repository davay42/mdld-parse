[mdp] <https://mdld.js.org/prov/>

## Bundle {=prov:Bundle label}

> A bundle is a named set of provenance descriptions, and is itself an entity, so allowing provenance of provenance to be expressed.  {prov:definition}

A bundle's identifier id identifies a unique set of descriptions.

A bundle is a named set of descriptions, but it is also an entity so that its provenance can be described. 

A prov:Bundle is a named set of provenance descriptions, which may itself have provenance. The named set of provenance descriptions may be expressed as PROV-O or any other form. The subclass of Bundle that names a set of PROV-O assertions is not provided by PROV-O, since it is more appropriate to do so using other recommendations, standards, or technologies. In any case, a Bundle of PROV-O assertions is an abstract set of RDF triples, and adding or removing a triple creates a new distinct Bundle of PROV-O assertions. 