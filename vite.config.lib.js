
import pack from './package.json'

export default {
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'parse',
            fileName: 'index',
            formats: ['es']
        },
        emptyOutDir: false,
        target: 'es2020',
        outDir: 'dist',
        minify: true,
        sourcemap: false,
    }
}