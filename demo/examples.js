// Example MDLD documents loaded as raw text
// Import all .md files from examples/demo/ as text using Vite's ?raw suffix

import minimal from '../examples/demo/minimal.md?raw';
import journal from '../examples/demo/journal.md?raw';
import recipe from '../examples/demo/recipe.md?raw';
import project from '../examples/demo/project.md?raw';
import spaceMission from '../examples/demo/space-mission.md?raw';
import research from '../examples/demo/research.md?raw';
import index from '../examples/demo/index.md?raw';

const examples = {
    minimal,
    journal,
    recipe,
    project,
    'space-mission': spaceMission,
    research,
    index
};

export function loadExample(name) {
    return examples[name] || null;
}

export function getExampleNames() {
    return Object.keys(examples);
}

export default examples;
