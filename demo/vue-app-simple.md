# Simple Vue 3.6 App Architecture

## File Structure (7 files in demo/)

```
demo/
├── main.js                    # App entry point
├── composables/
│   └── useParser.js           # All parsing logic (composable for state sharing)
├── components/
│   ├── App.vue                # Root layout
│   ├── Playground.vue         # Editor + outputs
│   └── TestSuite.vue          # Test runner UI
└── index.html                 # Mount point (in root, refs demo/main.js)
```

**Why demo/?** - Parser library stays clean in src/, demo code isolated in demo/

## 1. demo/main.js

```javascript
import { createApp } from 'vue'
import App from './components/App.vue'

const app = createApp(App)
app.mount('#app')

// No provide/inject - components import useParser directly for shared state
```

## 2. demo/composables/useParser.js

```javascript
import { ref, computed } from 'vue'
import { useDebounceFn, useDarkMode, useClipboard } from '@vueuse/core'
import { parse, generate } from '../../src/index.js'
import { Writer } from 'n3'
import MarkdownIt from 'markdown-it'
import { loadExample } from '../examples.js'

export function useParser() {
  // State
  const input = ref('')
  const result = ref(null)
  const isParsing = ref(false)
  const error = ref(null)
  
  // Dark mode from VueUse
  const { isDark } = useDarkMode()
  
  // Clipboard from VueUse
  const { copy: copyToClipboard } = useClipboard()

  // Computed getters
  const quads = computed(() => result.value?.quads || [])
  const statements = computed(() => result.value?.statements || [])
  const context = computed(() => result.value?.context || {})
  const primarySubject = computed(() => result.value?.primarySubject)
  const cleanMd = computed(() => result.value?.md || '')
  
  // Graph data for visualization
  const graphData = computed(() => {
    if (!quads.value.length) return { nodes: [], links: [] }
    
    const nodes = new Map()
    const links = []
    
    quads.value.forEach(q => {
      // Add nodes
      if (!nodes.has(q.subject.value)) {
        nodes.set(q.subject.value, { 
          id: q.subject.value, 
          label: q.subject.value.split(':').pop() || q.subject.value,
          type: 'subject'
        })
      }
      if (!nodes.has(q.object.value) && q.object.termType === 'NamedNode') {
        nodes.set(q.object.value, { 
          id: q.object.value, 
          label: q.object.value.split(':').pop() || q.object.value,
          type: 'object'
        })
      }
      // Add link
      links.push({
        source: q.subject.value,
        target: q.object.value,
        label: q.predicate.value.split(/[#/]/).pop() || q.predicate.value,
        type: q.object.termType
      })
    })
    
    return { nodes: Array.from(nodes.values()), links }
  })

  // TTL output
  const ttl = computed(() => {
    if (!quads.value.length) return ''
    const writer = new Writer({ prefixes: context.value })
    quads.value.forEach(q => writer.addQuad(q))
    let output = ''
    writer.end((err, res) => { if (!err) output = res })
    return output
  })

  // Generated MDLD
  const generatedMdld = computed(() => {
    if (!quads.value.length) return ''
    return generate({ 
      quads: quads.value, 
      context: context.value,
      primarySubject: primarySubject.value 
    }).text
  })

  // Rendered HTML preview
  const renderedHtml = computed(() => {
    if (!cleanMd.value) return ''
    const md = new MarkdownIt()
    return md.render(cleanMd.value)
  })

  // Parse action
  const doParse = () => {
    if (!input.value.trim()) {
      result.value = null
      return
    }
    isParsing.value = true
    error.value = null
    
    try {
      result.value = parse({ text: input.value })
    } catch (e) {
      error.value = e.message
    } finally {
      isParsing.value = false
    }
  }

  // Debounced parse for typing
  const parseDebounced = useDebounceFn(doParse, 300)

  // Load example
  const load = (name) => {
    const content = loadExample(name)
    if (content) {
      input.value = content
      doParse()
    }
  }

  // Download helpers
  const downloadTtl = () => {
    if (!ttl.value) return
    const blob = new Blob([ttl.value], { type: 'text/turtle' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.ttl'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadMdld = () => {
    if (!generatedMdld.value) return
    const blob = new Blob([generatedMdld.value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.mdld'
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    // State
    input,
    result,
    isParsing,
    error,
    isDark,
    
    // Computed
    quads,
    statements,
    context,
    primarySubject,
    cleanMd,
    graphData,
    ttl,
    generatedMdld,
    renderedHtml,
    
    // Actions
    parse: doParse,
    parseDebounced,
    load,
    copy: copyToClipboard,
    downloadTtl,
    downloadMdld,
    clear: () => { input.value = ''; result.value = null }
  }
}
```

## 3. demo/components/App.vue

```vue
<script setup>
import Playground from './Playground.vue'
import TestSuite from './TestSuite.vue'
import { useParser } from '../composables/useParser.js'

// Shared state via composable (not provide/inject)
const { isDark } = useParser()
</script>

<template>
  <div :class="{ dark: isDark }">
    <main class="container max-w-4xl mx-auto p-4">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <span class="opacity-50">{</span>
          <span class="text-orange-600 dark:text-orange-400">=+ .?!</span>
          <span class="opacity-50">}</span>
        </div>
        <h1 class="title">MD-LD Parser</h1>
        <nav class="nav-links">
          <a href="./docs/" class="nav-link">📚 Docs</a>
          <a href="./spec/" class="nav-link">📖 Spec</a>
          <a href="https://github.com/davay42/mdld-parse" target="_blank" class="nav-link">GitHub</a>
        </nav>
      </header>

      <!-- Playground -->
      <Playground />
      
      <!-- Spec Section -->
      <details class="w-full my-4">
        <summary class="p-4 font-bold text-xl cursor-pointer bg-gray-100 dark:bg-gray-800 rounded">
          MD-LD Specification
        </summary>
        <article class="p-4 max-h-96 overflow-y-auto">
          <iframe src="./spec/Spec.md" class="w-full h-80 border-0" />
        </article>
      </details>
      
      <!-- Test Suite -->
      <TestSuite />
    </main>
  </div>
</template>

<style>
/* Only layout styles here - visual styles via UnoCSS classes */
.header {
  @apply flex items-center gap-4 mb-6 pb-4 border-b border-gray-300 dark:border-gray-700;
}
.logo {
  @apply font-mono text-2xl font-bold;
}
.title {
  @apply text-2xl font-bold flex-1;
}
.nav-links {
  @apply flex gap-3;
}
.nav-link {
  @apply text-sm hover:underline;
}
</style>
```

## 4. demo/components/Playground.vue

```vue
<script setup>
import { ref } from 'vue'
import { useParser } from '../composables/useParser.js'

// Import shared state composable directly
const parser = useParser()
const selectedExample = ref('')

const examples = ['minimal', 'journal', 'recipe', 'project', 'space-mission', 'research']

const formatName = (name) => name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

const loadExample = () => {
  if (selectedExample.value) {
    parser.load(selectedExample.value)
    selectedExample.value = ''
  }
}
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Editor -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 flex-wrap">
        <h2 class="font-bold text-xl">Playground</h2>
        <select v-model="selectedExample" @change="loadExample" 
                class="px-2 py-1 rounded border dark:bg-gray-800 dark:border-gray-600">
          <option value="">Load example...</option>
          <option v-for="name in examples" :key="name" :value="name">
            {{ formatName(name) }}
          </option>
        </select>
        <button @click="parser.clear" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300">
          Clear
        </button>
      </div>
      
      <textarea v-model="parser.input" @input="parser.parseDebounced"
                class="w-full h-96 p-3 font-mono text-sm rounded border resize-none
                       bg-white dark:bg-gray-900 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Write your MD-LD here...

[my] <tag:alice@example.com,2026:>
# Hello World {=my:hello label}
Content [here] {my:content}" />
      
      <div v-if="parser.error" class="p-2 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
        {{ parser.error }}
      </div>
    </div>

    <!-- Outputs -->
    <div class="flex flex-col gap-2">
      <!-- Graph -->
      <details class="border rounded dark:border-gray-700" open>
        <summary class="p-2 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800">
          Interactive Graph ({{ parser.graphData.nodes.length }} nodes)
        </summary>
        <div class="h-80 bg-gray-50 dark:bg-gray-900">
          <rdf-graph v-if="parser.quads.length" 
                     :nodes="parser.graphData.nodes" 
                     :links="parser.graphData.links"
                     height="320" />
          <p v-else class="p-8 text-center text-gray-500">Parse something to see the graph</p>
        </div>
      </details>

      <!-- Quads -->
      <details class="border rounded dark:border-gray-700">
        <summary class="p-2 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800">
          Quads ({{ parser.quads.length }})
        </summary>
        <pre class="p-2 h-48 overflow-y-auto text-xs font-mono bg-gray-50 dark:bg-gray-900">{{ 
          parser.quads.map(q => 
            `${q.subject.value.split(':').pop()} → ${q.predicate.value.split(/[#/]/).pop()} → ${
              q.object.termType === 'Literal' ? `"${q.object.value}"` : q.object.value.split(':').pop()
            }`
          ).join('\n') || 'No quads yet...'
        }}</pre>
      </details>

      <!-- TTL -->
      <details class="border rounded dark:border-gray-700">
        <summary class="p-2 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <span>TTL</span>
          <div class="flex gap-1">
            <button v-if="parser.ttl" @click.stop="parser.copy(parser.ttl)" 
                    class="px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300">
              Copy
            </button>
            <button v-if="parser.ttl" @click.stop="parser.downloadTtl" 
                    class="px-2 py-0.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
              Download
            </button>
          </div>
        </summary>
        <pre class="p-2 h-48 overflow-y-auto text-xs font-mono bg-gray-50 dark:bg-gray-900">{{ parser.ttl || 'No TTL output...' }}</pre>
      </details>

      <!-- Generated MDLD -->
      <details class="border rounded dark:border-gray-700">
        <summary class="p-2 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <span>Generated MDLD</span>
          <div class="flex gap-1">
            <button v-if="parser.generatedMdld" @click.stop="parser.copy(parser.generatedMdld)" 
                    class="px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300">
              Copy
            </button>
            <button v-if="parser.generatedMdld" @click.stop="parser.downloadMdld" 
                    class="px-2 py-0.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
              Download
            </button>
          </div>
        </summary>
        <pre class="p-2 h-48 overflow-y-auto text-xs font-mono bg-gray-50 dark:bg-gray-900">{{ parser.generatedMdld || 'No generated MDLD...' }}</pre>
      </details>

      <!-- Clean Markdown -->
      <details class="border rounded dark:border-gray-700">
        <summary class="p-2 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800">
          Clean Markdown Preview
        </summary>
        <div class="p-4 h-48 overflow-y-auto prose dark:prose-invert max-w-none bg-white dark:bg-gray-900" 
             v-html="parser.renderedHtml" />
      </details>
    </div>
  </section>
</template>
```

## 5. demo/components/TestSuite.vue

```vue
<script setup>
import { ref, computed } from 'vue'
import { runTests, tests as allTests } from '../../tests/index.js'

const results = ref([])
const isRunning = ref(false)
const showDetails = ref({})

const stats = computed(() => {
  const passed = results.value.filter(r => r.status === 'passed').length
  const failed = results.value.filter(r => r.status === 'failed').length
  return { passed, failed, total: allTests.length }
})

const run = async () => {
  isRunning.value = true
  results.value = []
  
  for (const test of allTests) {
    const start = performance.now()
    try {
      test.fn()
      results.value.push({
        name: test.name,
        status: 'passed',
        duration: Math.round(performance.now() - start)
      })
    } catch (error) {
      results.value.push({
        name: test.name,
        status: 'failed',
        error: error.message,
        duration: Math.round(performance.now() - start)
      })
    }
  }
  
  isRunning.value = false
}

const toggleDetails = (name) => {
  showDetails.value[name] = !showDetails.value[name]
}
</script>

<template>
  <details class="w-full my-4 border rounded dark:border-gray-700">
    <summary class="p-4 font-bold text-xl cursor-pointer bg-gray-100 dark:bg-gray-800 flex items-center gap-4">
      <span>Test Suite</span>
      <span class="flex-1"></span>
      <span v-if="stats.total" class="text-sm font-normal px-2 py-1 rounded"
            :class="stats.failed ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200'">
        {{ stats.passed }}/{{ stats.total }} passed
      </span>
    </summary>
    
    <div class="p-4">
      <div class="flex gap-2 mb-4">
        <button @click="run" :disabled="isRunning"
                class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
          {{ isRunning ? 'Running...' : '▶ Run Tests' }}
        </button>
        <button @click="results = []" 
                class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300">
          Clear
        </button>
      </div>

      <div v-if="results.length" class="space-y-1">
        <div v-for="result in results" :key="result.name"
             class="p-2 rounded cursor-pointer"
             :class="result.status === 'passed' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'"
             @click="toggleDetails(result.name)">
          <div class="flex items-center gap-2">
            <span>{{ result.status === 'passed' ? '✓' : '✗' }}</span>
            <span class="flex-1">{{ result.name }}</span>
            <span class="text-xs text-gray-500">{{ result.duration }}ms</span>
          </div>
          <div v-if="showDetails[result.name] && result.error" 
               class="mt-2 p-2 text-sm font-mono bg-white dark:bg-gray-800 rounded text-red-600 dark:text-red-400">
            {{ result.error }}
          </div>
        </div>
      </div>
      
      <p v-else class="text-center text-gray-500 py-8">Click "Run Tests" to start</p>
    </div>
  </details>
</template>
```

## 6. index.html (root, references demo/)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD-LD Parser</title>
  <meta name="description" content="MD-LD: Human-friendly RDF authoring format">
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <div id="app"></div>
  <script type="module" src="./demo/main.js"></script>
</body>
</html>
```

## 7. vite.config.js (already configured, no changes needed)

Already has Vue, UnoCSS, and vite-plugin-singlefile configured.
Just ensure it handles demo/ path correctly.

## Dependencies

```bash
pnpm add vue @vueuse/core
pnpm add -D @vitejs/plugin-vue
```

## Key Architecture Decision: Composable State Sharing

**Why no provide/inject?**
- Components import `useParser()` directly
- Vue's reactivity system shares the state automatically
- Simpler, more explicit dependencies
- Easier to test

**Example:**
```javascript
// In Playground.vue
import { useParser } from '../composables/useParser.js'
const parser = useParser() // Same instance as in App.vue
```

The composable creates singleton state that all components share.

---

## Step-by-Step Conversion Plan

### Phase 1: Setup (15 min)
1. ✅ Install Vue + VueUse dependencies
2. ✅ Create `demo/composables/` folder
3. ✅ Create `demo/components/` folder
4. ✅ Update `vite.config.js` if needed

### Phase 2: Create useParser.js (30 min)
1. Copy logic from current `index.html` inline script
2. Extract into `demo/composables/useParser.js`
3. Add VueUse helpers (useDarkMode, useClipboard, useDebounceFn)
4. Export reactive state + actions

### Phase 3: Create Components (45 min)
1. `demo/components/App.vue` - Root layout with dark mode toggle
2. `demo/components/Playground.vue` - Editor + outputs panel
3. `demo/components/TestSuite.vue` - Test runner UI

### Phase 4: Create Entry Point (10 min)
1. `demo/main.js` - Mount app
2. Update root `index.html` to point to `demo/main.js`

### Phase 5: Migration (20 min)
1. Keep old `index.html` as backup
2. Replace with new minimal `index.html`
3. Test all functionality works
4. Delete old inline scripts

### Total: ~2 hours

**Dependencies:**
```bash
pnpm add vue @vueuse/core
pnpm add -D @vitejs/plugin-vue
```

**Final File Count: 7 files in demo/**
- `demo/main.js`
- `demo/composables/useParser.js`
- `demo/components/App.vue`
- `demo/components/Playground.vue`
- `demo/components/TestSuite.vue`
- `demo/examples.js` (already exists)
- `index.html` (root, minimal)
