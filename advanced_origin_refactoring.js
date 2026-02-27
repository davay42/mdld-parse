import { generate, parse } from './src/index.js';

console.log('=== Advanced Origin Refactoring Concepts ===\n');

// Test data for complex refactoring scenarios
const originalQuads = [
    {
        subject: { termType: 'NamedNode', value: 'http://example.org/person/alice' },
        predicate: { termType: 'NamedNode', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
        object: { termType: 'NamedNode', value: 'http://schema.org/Person' }
    },
    {
        subject: { termType: 'NamedNode', value: 'http://example.org/person/alice' },
        predicate: { termType: 'NamedNode', value: 'http://schema.org/name' },
        object: { termType: 'Literal', value: 'Alice Smith' }
    },
    {
        subject: { termType: 'NamedNode', value: 'http://example.org/person/alice' },
        predicate: { termType: 'NamedNode', value: 'http://schema.org/knows' },
        object: { termType: 'NamedNode', value: 'http://example.org/person/bob' }
    }
];

const context = { ex: 'http://example.org/', schema: 'http://schema.org/' };

// Generate initial MDLD with origin
const { text: originalMDLD, origin } = generate(originalQuads, context);
console.log('1. Generated initial MDLD:');
console.log(originalMDLD);
console.log('');

console.log('=== Advanced Refactoring Operations ===\n');

// Concept 1: Subject Restructuring
console.log('Concept 1: Subject Restructuring');
console.log('-----------------------------------');

// Imagine we want to restructure alice to have a different IRI structure
// We could create a function that programmatically manipulates the origin

function restructureSubject(origin, oldSubjectIRI, newSubjectIRI, newQuads) {
    const newOrigin = { ...origin };
    
    // Step 1: Find all blocks for the old subject
    const subjectBlocks = [];
    origin.quadIndex.forEach((slot, key) => {
        const parsed = JSON.parse(key);
        if (parsed[0] === oldSubjectIRI) {
            const block = origin.blocks.get(slot.blockId);
            if (block && block.subject === oldSubjectIRI) {
                subjectBlocks.push({ block, slot });
            }
        }
    });
    
    console.log(`   Found ${subjectBlocks.length} blocks for subject ${oldSubjectIRI}`);
    
    // Step 2: Remove or update all blocks
    subjectBlocks.forEach(({ block, slot }) => {
        if (newQuads.length === 0) {
            // Complete removal - delete the block
            newOrigin.blocks.delete(block.id);
            newOrigin.quadIndex.delete(JSON.parse(key));
        } else {
            // Restructure - update block content programmatically
            // This is where we could implement complex logic
            console.log(`   Could restructure block ${block.id} with new content`);
        }
    });
    
    return newOrigin;
}

// Test subject restructuring
console.log('Test: Restructure alice to have different IRI');
const restructuredOrigin = restructureSubject(origin, 
    'http://example.org/person/alice', 
    'http://example.org/agent/alice',
    [] // No new quads - just restructuring
);

console.log('✓ Subject restructuring concept demonstrated');
console.log('');

// Concept 2: Property Grouping and Reorganization
console.log('Concept 2: Property Grouping');
console.log('------------------------------------');

function groupProperties(origin, subjectIRI, propertyGroups) {
    const newOrigin = { ...origin };
    
    // Find subject blocks
    const subjectBlocks = [];
    origin.quadIndex.forEach((slot, key) => {
        const parsed = JSON.parse(key);
        if (parsed[0] === subjectIRI) {
            const block = origin.blocks.get(slot.blockId);
            if (block && block.subject === subjectIRI) {
                subjectBlocks.push({ block, slot });
            }
        }
    });
    
    console.log(`   Found ${subjectBlocks.length} blocks for subject ${subjectIRI}`);
    
    // Reorganize properties based on groups
    subjectBlocks.forEach(({ block, slot }) => {
        // This could implement sophisticated grouping logic
        propertyGroups.forEach(group => {
            console.log(`   Could group properties: ${group.name}`);
            // Move properties, reorder, add annotations, etc.
        });
    });
    
    return newOrigin;
}

// Test property grouping
console.log('Test: Group alice properties');
const groupedOrigin = groupProperties(origin, 'http://example.org/person/alice', [
    { name: 'personal', properties: ['name', 'age', 'birthDate'] },
    { name: 'social', properties: ['knows', 'email'] }
]);

console.log('✓ Property grouping concept demonstrated');
console.log('');

// Concept 3: Bulk Transformations
console.log('Concept 3: Bulk Transformations');
console.log('-----------------------------------');

function bulkTransform(origin, transformations) {
    const newOrigin = { ...origin };
    
    transformations.forEach(transform => {
        console.log(`   Applying transformation: ${transform.name}`);
        switch (transform.type) {
            case 'renameProperty':
                // Rename all instances of a property
                renamePropertyInOrigin(newOrigin, transform.oldProperty, transform.newProperty);
                break;
            case 'extractEntity':
                // Extract a subject into its own entity
                extractSubjectFromOrigin(newOrigin, transform.subjectIRI, transform.newSubjectIRI);
                break;
            case 'mergeSubjects':
                // Merge two subjects into one
                mergeSubjectsInOrigin(newOrigin, transform.subject1IRI, transform.subject2IRI, transform.newSubjectIRI);
                break;
        }
    });
    
    return newOrigin;
}

function renamePropertyInOrigin(origin, oldProperty, newProperty) {
    origin.quadIndex.forEach((slot, key) => {
        const parsed = JSON.parse(key);
        if (parsed[1] === oldProperty) {
            const block = origin.blocks.get(slot.blockId);
            if (block) {
                // Update the block to use new property
                console.log(`     Renaming ${oldProperty} to ${newProperty} in block ${block.id}`);
            }
        }
    });
}

function extractSubjectFromOrigin(origin, oldSubjectIRI, newSubjectIRI) {
    // Complex logic to extract a subject into its own entity
    console.log(`     Extracting ${oldSubjectIRI} into ${newSubjectIRI}`);
    // This would involve:
    // 1. Create new subject blocks
    // 2. Move relevant properties
    // 3. Update relationships
    // 4. Clean up old subject
}

function mergeSubjectsInOrigin(origin, subject1IRI, subject2IRI, newSubjectIRI) {
    // Complex logic to merge two subjects
    console.log(`     Merging ${subject1IRI} + ${subject2IRI} into ${newSubjectIRI}`);
    // This would involve:
    // 1. Create new merged subject
    // 2. Move all properties from both subjects
    // 3. Update all references
    // 4. Remove old subjects
}

// Test bulk transformations
console.log('Test: Apply bulk transformations');
const transformedOrigin = bulkTransform(origin, [
    { 
        type: 'renameProperty', 
        name: 'Rename knows to connectedWith',
        oldProperty: 'http://schema.org/knows',
        newProperty: 'http://schema.org/connectedWith'
    },
    {
        type: 'extractEntity',
        name: 'Extract alice workplace',
        subjectIRI: 'http://example.org/person/alice',
        newSubjectIRI: 'http://example.org/organization/acme-corp'
    }
]);

console.log('✓ Bulk transformation concept demonstrated');
console.log('');

// Concept 4: Template-based Generation
console.log('Concept 4: Template-based Generation');
console.log('---------------------------------------');

function generateFromTemplate(origin, template, data) {
    console.log(`   Generating from template: ${template.name}`);
    
    // Templates could define complex structures
    switch (template.type) {
        case 'personProfile':
            return generatePersonProfile(origin, data);
        case 'projectStructure':
            return generateProjectStructure(origin, data);
        case 'eventSeries':
            return generateEventSeries(origin, data);
    }
    
    return origin;
}

function generatePersonProfile(origin, personData) {
    console.log(`     Generating person profile for ${personData.name}`);
    // Create a complete person profile with standard sections
    // This would use origin manipulation to add:
    // - Contact info
    // - Social links  
    // - Professional details
    // - Interests
    // etc.
    return origin;
}

function generateProjectStructure(origin, projectData) {
    console.log(`     Generating project structure for ${projectData.name}`);
    // Create a complete project with:
    // - Team members
    // - Tasks
    // - Timeline
    // - Documents
    return origin;
}

function generateEventSeries(origin, eventData) {
    console.log(`     Generating event series for ${eventData.name}`);
    // Create a series of related events
    return origin;
}

// Test template generation
console.log('Test: Generate from templates');
const templateOrigin = generateFromTemplate(origin, {
    type: 'personProfile',
    name: 'Complete Person Profile',
    data: { name: 'Alice Smith', role: 'Software Engineer' }
});

console.log('✓ Template-based generation concept demonstrated');
console.log('');

console.log('=== Summary ===');
console.log('🚀 Advanced Origin System Capabilities:');
console.log('');
console.log('✅ Subject Restructuring:');
console.log('   • Move subjects between IRIs');
console.log('   • Reorganize hierarchical structures');
console.log('   • Split entities into multiple subjects');
console.log('');
console.log('✅ Property Grouping:');
console.log('   • Group related properties');
console.log('   • Add section headers');
console.log('   • Reorder based on importance');
console.log('');
console.log('✅ Bulk Transformations:');
console.log('   • Rename properties across entire document');
console.log('   • Extract entities into separate subjects');
console.log('   • Merge subjects together');
console.log('   • Apply consistent transformations');
console.log('');
console.log('✅ Template-based Generation:');
console.log('   • Generate complex structures from templates');
console.log('   • Fill in missing required properties');
console.log('   • Create standard layouts');
console.log('   • Apply naming conventions');
console.log('');
console.log('🎯 Implementation Strategy:');
console.log('   1. Extend origin with programmatic manipulation functions');
console.log('   2. Create transformation DSL for complex operations');
console.log('   3. Build template engine for structured generation');
console.log('   4. Add validation to ensure origin consistency');
console.log('');
console.log('💡 This would enable:');
console.log('   • Complex refactoring while maintaining round-trip fidelity');
console.log('   • Programmatic document restructuring');
console.log('   • Template-based content generation');
console.log('   • Bulk data transformations');
console.log('   • Advanced LLM-assisted editing capabilities');
