# Vue 3.6 App Architecture Plan for MD-LD Parser

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── App.vue                 # Root component with dark mode
│   │   ├── AppHeader.vue           # Logo + nav links
│   │   └── AppFooter.vue           # (optional)
│   ├── playground/
│   │   ├── PlaygroundSection.vue   # Main playground container
│   │   ├── MdldEditor.vue          # Textarea + example selector
│   │   └── OutputPanel.vue         # Graphs, quads, TTL, MDLD outputs
│   ├── graphs/
│   │   ├── RdfGraph.vue            # Interactive force graph
│   │   └── StatementsGraph.vue     # Elevated statements graph
│   ├── displays/
│   │   ├── QuadsDisplay.vue        # Formatted quads list
│   │   ├── TtlDisplay.vue          # Turtle format with copy/download
│   │   ├── MdldDisplay.vue         # Generated MDLD with copy/download
│   │   └── PrimarySubjectCard.vue  # Primary subject info
│   ├── spec/
│   │   ├── SpecSection.vue         # Collapsible spec viewer
│   │   └── SpecViewer.vue          # Markdown-rendered spec
│   ├── tests/
│   │   ├── TestSection.vue         # Collapsible test suite
│   │   ├── TestRunner.vue          # Run/clear controls + progress
│   │   ├── TestStats.vue           # Pass/fail/total/duration cards
│   │   └── TestList.vue            # Individual test results
│   └── shared/
│       ├── CollapsibleCard.vue     # Reusable details/summary wrapper
│       ├── CopyButton.vue          # Copy to clipboard
│       ├── DownloadButton.vue      # Download file
│       └── StatsBadge.vue          # Small status indicators
├── composables/
│   ├── useDarkMode.js              # System preference + toggle
│   ├── useMdldParser.js            # Parse logic, state management
│   ├── useExamples.js              # Example loading
│   ├── useGraphData.js             # Transform quads to graph nodes/links
│   ├── useTestRunner.js            # Test execution + results
│   ├── useClipboard.js             # Copy functionality
│   ├── useFileDownload.js          # Download functionality
│   └── useTtlGenerator.js          # N3 Writer integration
├── stores/
│   └── parserStore.js              # Pinia store for parsed state
├── utils/
│   ├── formatters.js               # shortenIRI, formatLiteral, etc.
│   └── quadHelpers.js              # quadsEqual, clipTitle, etc.
├── App.vue                         # Root with providers
└── main.js                         # Vue app initialization
```

## Component Breakdown

### 1. Layout Components

**App.vue**
```vue
<script setup>
import { provide } from 'vue'
import { useDarkMode } from './composables/useDarkMode'
import { useMdldParser } from './composables/useMdldParser'
import AppHeader from './components/layout/AppHeader.vue'
import PlaygroundSection from './components/playground/PlaygroundSection.vue'
import SpecSection from './components/spec/SpecSection.vue'
import TestSection from './components/tests/TestSection.vue'

const { isDark, toggleDark } = useDarkMode()
const parser = useMdldParser()

provide('parser', parser)
provide('darkMode', { isDark, toggleDark })
</script>

<template>
  <div :class="{ dark: isDark }">
    <main class="container max-w-4xl mx-auto p-4">
      <AppHeader @toggle-dark="toggleDark" :is-dark="isDark" />
      <PlaygroundSection />
      <SpecSection />
      <TestSection />
    </main>
  </div>
</template>
```

### 2. Playground Components

**MdldEditor.vue**
```vue
<script setup>
import { ref, watch } from 'vue'
import { inject } from 'vue'

const parser = inject('parser')
const examples = inject('examples')

const selectedExample = ref('')

watch(selectedExample, (name) => {
  if (name) {
    parser.loadExample(name)
    selectedExample.value = '' // Reset selector
  }
})
</script>

<template>
  <div class="editor-container">
    <div class="controls">
      <h3 class="font-bold text-xl">Playground</h3>
      <select v-model="selectedExample">
        <option value="">Choose example...</option>
        <option v-for="name in examples.names" :key="name" :value="name">
          {{ formatName(name) }}
        </option>
      </select>
      <button @click="parser.parse()">Parse</button>
      <button @click="parser.clear()">Clear</button>
    </div>
    <textarea 
      v-model="parser.inputText" 
      @input="parser.parseDebounced()"
      class="textarea"
      placeholder="Write your MD-LD here..."
    />
  </div>
</template>
```

**OutputPanel.vue**
```vue
<script setup>
import { inject } from 'vue'
import RdfGraph from '../graphs/RdfGraph.vue'
import QuadsDisplay from '../displays/QuadsDisplay.vue'
import TtlDisplay from '../displays/TtlDisplay.vue'
import MdldDisplay from '../displays/MdldDisplay.vue'
import PrimarySubjectCard from '../displays/PrimarySubjectCard.vue'

const parser = inject('parser')
</script>

<template>
  <div class="output-panel">
    <CollapsibleCard title="Interactive Graph" default-open>
      <RdfGraph :quads="parser.quads" />
    </CollapsibleCard>
    
    <CollapsibleCard title="Quads" :stats="parser.quadCount">
      <QuadsDisplay :quads="parser.quads" :context="parser.context" />
    </CollapsibleCard>
    
    <CollapsibleCard title="TTL">
      <TtlDisplay :ttl="parser.ttl" />
    </CollapsibleCard>
    
    <CollapsibleCard title="MDLD">
      <MdldDisplay :mdld="parser.generatedMdld" />
    </CollapsibleCard>
  </div>
</template>
```

### 3. Composables

**useMdldParser.js**
```javascript
import { ref, computed, watch } from 'vue'
import { parse, generate } from '../src/index.js'
import { render } from '../src/render.js'
import { Writer } from 'n3'
import { loadExample } from './examples.js'
import { useDebounceFn } from '@vueuse/core'

export function useMdldParser() {
  const inputText = ref('')
  const parseResult = ref(null)
  const isParsing = ref(false)
  const error = ref(null)

  const quads = computed(() => parseResult.value?.quads || [])
  const statements = computed(() => parseResult.value?.statements || [])
  const context = computed(() => parseResult.value?.context || {})
  const primarySubject = computed(() => parseResult.value?.primarySubject)
  const cleanMd = computed(() => parseResult.value?.md || '')
  
  const quadCount = computed(() => quads.value.length)
  const statementCount = computed(() => statements.value.length)

  const ttl = computed(() => {
    if (!quads.value.length) return ''
    const writer = new Writer({ prefixes: context.value })
    quads.value.forEach(q => writer.addQuad(q))
    let result = ''
    writer.end((err, res) => { if (!err) result = res })
    return result
  })

  const generatedMdld = computed(() => {
    if (!quads.value.length) return ''
    return generate({ 
      quads: quads.value, 
      context: context.value,
      primarySubject: primarySubject.value 
    }).text
  })

  async function parseInput() {
    if (!inputText.value.trim()) {
      parseResult.value = null
      return
    }
    
    isParsing.value = true
    error.value = null
    
    try {
      parseResult.value = parse({ 
        text: inputText.value,
        context: {}
      })
    } catch (e) {
      error.value = e.message
    } finally {
      isParsing.value = false
    }
  }

  const parseDebounced = useDebounceFn(parseInput, 300)

  function loadExample(name) {
    const content = loadExample(name)
    if (content) {
      inputText.value = content
      parseInput()
    }
  }

  function clear() {
    inputText.value = ''
    parseResult.value = null
  }

  // Auto-parse on mount if text exists
  watch(inputText, parseDebounced, { immediate: true })

  return {
    inputText,
    parseResult,
    quads,
    statements,
    context,
    primarySubject,
    cleanMd,
    quadCount,
    statementCount,
    ttl,
    generatedMdld,
    isParsing,
    error,
    parse: parseInput,
    parseDebounced,
    loadExample,
    clear
  }
}
```

**useDarkMode.js**
```javascript
import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      isDark.value = e.matches
    })
  })

  function toggleDark() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleDark }
}
```

**useTestRunner.js**
```javascript
import { ref, computed } from 'vue'
import { runTests, tests } from '../tests/index.js'

export function useTestRunner() {
  const results = ref([])
  const isRunning = ref(false)
  const progress = ref(0)

  const stats = computed(() => {
    const passed = results.value.filter(r => r.status === 'passed').length
    const failed = results.value.filter(r => r.status === 'failed').length
    return {
      passed,
      failed,
      total: tests.length,
      duration: results.value.reduce((sum, r) => sum + (r.duration || 0), 0)
    }
  })

  async function run() {
    isRunning.value = true
    progress.value = 0
    results.value = []

    for (let i = 0; i < tests.length; i++) {
      const start = performance.now()
      try {
        tests[i].fn()
        results.value.push({
          name: tests[i].name,
          status: 'passed',
          duration: performance.now() - start
        })
      } catch (error) {
        results.value.push({
          name: tests[i].name,
          status: 'failed',
          error: error.message,
          duration: performance.now() - start
        })
      }
      progress.value = ((i + 1) / tests.length) * 100
    }

    isRunning.value = false
  }

  function clear() {
    results.value = []
    progress.value = 0
  }

  return {
    results,
    stats,
    isRunning,
    progress,
    run,
    clear
  }
}
```

### 4. Stores (Optional but recommended)

**stores/parserStore.js** (Pinia)
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parse, generate } from '../src/index.js'
import { Writer } from 'n3'

export const useParserStore = defineStore('parser', () => {
  // State
  const inputText = ref('')
  const parseResult = ref(null)
  
  // Getters (computed)
  const quads = computed(() => parseResult.value?.quads || [])
  const context = computed(() => parseResult.value?.context || {})
  const primarySubject = computed(() => parseResult.value?.primarySubject)
  
  const ttl = computed(() => {
    // ... same as composable
  })
  
  // Actions
  function parseInput(text = inputText.value) {
    parseResult.value = parse({ text, context: {} })
  }
  
  function loadExample(name) {
    // ... load and parse
  }
  
  return {
    inputText,
    parseResult,
    quads,
    context,
    primarySubject,
    ttl,
    parseInput,
    loadExample
  }
})
```

## Migration Steps

### Phase 1: Setup (30 min)
1. Install Vue dependencies
2. Create directory structure
3. Move `demo/styles.css` to `src/assets/styles.css`
4. Update `vite.config.js` to handle Vue

### Phase 2: Composables (1 hour)
1. Create `useDarkMode.js`
2. Create `useMdldParser.js` (extract from inline script)
3. Create `useExamples.js`
4. Create `useTtlGenerator.js`
5. Create `useTestRunner.js`

### Phase 3: Shared Components (30 min)
1. `CollapsibleCard.vue`
2. `CopyButton.vue`
3. `DownloadButton.vue`
4. `StatsBadge.vue`

### Phase 4: Section Components (2 hours)
1. `AppHeader.vue`
2. `MdldEditor.vue` + `OutputPanel.vue`
3. `RdfGraph.vue` (wrap existing web component)
4. `SpecSection.vue`
5. `TestSection.vue`

### Phase 5: Integration (30 min)
1. `App.vue` as root
2. `main.js` entry point
3. Update `index.html` to mount Vue app
4. Test all functionality

### Phase 6: Cleanup (15 min)
1. Remove inline scripts from `index.html`
2. Keep only `<div id="app"></div>` in body
3. Verify build still works

## Key Benefits

1. **Maintainability** - Each component has single responsibility
2. **Testability** - Composables can be tested independently
3. **Reusability** - Components like `CollapsibleCard` used across sections
4. **Type Safety** - Add TypeScript gradually for better DX
5. **Performance** - Vue's reactivity system optimizes updates
6. **Developer Experience** - Vue DevTools for debugging state

## Dependencies to Add

```json
{
  "dependencies": {
    "vue": "^3.6.0",
    "@vueuse/core": "^10.0.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.6"
  }
}
```
