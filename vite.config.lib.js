
import pack from './package.json' with { type: 'json' }

export default {
    build: {
        lib: {
            entry: { 'mdld-parse': 'src/index.js', crawl: 'src/crawl.js', 'quad-graph': 'src/graph.js' },
            name: 'parse',
            formats: ['es']
        },
        emptyOutDir: false,
        target: 'es2020',
        outDir: 'dist',
        minify: false,
        sourcemap: false,
    }
}