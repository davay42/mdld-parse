
import pack from './package.json' with { type: 'json' }

export default {
    build: {
        lib: {
            entry: { 'mdld-parse': 'src/index.js' },
            name: 'parse',
            formats: ['es']
        },
        emptyOutDir: false,
        target: 'es2022',
        outDir: 'dist',
        minify: false,
        sourcemap: false,
    }
}