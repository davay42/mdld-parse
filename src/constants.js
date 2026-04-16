/**
 * Shared utilities for MD-LD Parser and Renderer
 * Ensures DRY code and consistent CommonMark processing
 */



export const DEFAULT_CONTEXT = {
    '@vocab': "http://www.w3.org/2000/01/rdf-schema#",
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    sh: "http://www.w3.org/ns/shacl#",
    prov: 'http://www.w3.org/ns/prov#'
};

// CommonMark patterns - shared between parser and renderer
export const URL_REGEX = /^(https?|ftp|mailto|tag|nih|urn|uuid|did|web|ipfs|ipns|data|file|urn:uuid):/;
export const FENCE_REGEX = /^(`{3,}|~{3,})(.*)/;
export const PREFIX_REGEX = /^\[([^\]]+)\]\s*<([^>]+)>/;
export const HEADING_REGEX = /^(#{1,6})\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
export const UNORDERED_LIST_REGEX = /^(\s*)([-*+]|\d+\.)\s+(.+?)(?:\s*(\{[^}]+\}))?\s*$/;
export const BLOCKQUOTE_REGEX = /^>\s+(.+?)(?:\s*(\{[^}]+\}))?$/;
export const STANDALONE_SUBJECT_REGEX = /^\s*\{=(.*?)\}\s*$/;

// Pre-compiled carrier patterns for performance
export const CARRIER_PATTERN_ARRAY = [
    ['EMPHASIS', /[*__]+(.+?)[*__]+\s*\{([^}]+)\}/y],
    ['CODE_SPAN_SINGLE', /`(.+?)`\s*\{([^}]+)\}/y],
    ['CODE_SPAN_DOUBLE', /``(.+?)``\s*\{([^}]+)\}/y]
];
