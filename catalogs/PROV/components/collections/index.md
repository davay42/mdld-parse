[mdp] <https://mdld.js.org/prov/>

# Collections {=mdp:components#collections .mdp:Component label}

The sixth component of PROV-DM is concerned with the notion of collections. A collection is an entity that has some members. The members are themselves entities, and therefore their provenance can be expressed. Some applications need to be able to express the provenance of the collection itself: e.g. who maintains the collection (attribution), which members it contains as it evolves, and how it was assembled. The purpose of Component 6 is to define the types and relations that are useful to express the provenance of collections. 

![](./component6.png)

includes: {!prov:component}

- Collection {=prov:Collection}
- EmptyCollection {=prov:EmptyCollection}
- hadMember {=prov:hadMember}