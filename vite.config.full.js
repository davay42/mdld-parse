
import pack from './package.json' with { type: 'json' }

export default {
    build: {
        lib: {
            entry: { 'mdld-parse-full': 'src/full.js' },
            name: 'parse',
            formats: ['es']
        },
        emptyOutDir: false,
        target: 'es2020',
        outDir: 'dist',
        minify: true,
        sourcemap: false,
    }
}