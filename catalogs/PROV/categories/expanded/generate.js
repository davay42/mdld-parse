import { generate } from '../../../../src/generate.js'
import { Parser } from 'n3'
import { readFileSync, writeFileSync } from 'fs'

const decoder = new TextDecoder()
const parser = new Parser()

writeFileSync('example5.md', generate(parser.parse(decoder.decode(readFileSync('example5.ttl'))), { ex: 'http://www.example.org#', foaf: 'http://xmlns.com/foaf/0.1/', sioc: 'http://rdfs.org/sioc/ns#' }).text)


