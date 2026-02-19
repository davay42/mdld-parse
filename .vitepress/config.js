import { defineConfig } from 'vitepress'


export default defineConfig({
    srcDir: './docs',
    // Site Metadata
    title: 'MDLD - Markdown Linked Data',
    description: 'a deterministic, streaming-friendly RDF authoring format that extends Markdown with explicit `{...}` annotations',
    lang: 'en-US',
    head: [
        ['meta', { name: 'theme-color', content: '#4f46e5' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:image', content: 'https://mdld.js.org/icon-m-512.png' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-s.svg' }],
        ['link', { rel: 'apple-touch-icon', href: '/icon-m-512.png' }],
        ['link', { rel: 'manifest', href: '/manifest.json' }]
    ],

    // Theme Configuration
    themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'MDLD',

        // Navigation
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Spec', link: '/Spec' },
        ],

        // Social Links
        socialLinks: [
            { icon: 'github', link: 'https://github.com/davay42/mdld-parse' },
            { icon: 'twitter', link: 'https://twitter.com/davay42' }
        ],

        // Footer
        footer: {
            // message: 'Released under the MIT License.',
            copyright: 'Copyright © 2025-present Denis Starov'
        },

        // Sidebar
        sidebar: {
            '/docs/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/docs/' },
                    ]
                },

            ]
        },

        // Search
        search: {
            provider: 'local',
            options: {
                placeholder: 'Search documentation...',
                translations: {
                    button: {
                        buttonText: 'Search',
                        buttonAriaLabel: 'Search documentation'
                    }
                }
            }
        },

        // Edit Link
        // editLink: {
        //     pattern: 'https://github.com/davay42/mdld-parse/edit/main/docs/:path',
        //     text: 'Edit this page on GitHub'
        // },

        // Last Updated
        lastUpdated: {
            text: 'Last updated',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'short'
            }
        },
    },

    // Markdown Configuration
    markdown: {
        lineNumbers: true,
        // theme: 'material-palenight',
        config: (md) => {
            // Add markdown-it plugins here
            // md.use(require('markdown-it-xxx'))
        }
    },

    // Vite Configuration
    vite: {
        optimizeDeps: {
            include: ['@mdi/font/css/materialdesignicons.min.css']
        },
        server: {
            port: 3000,
            fs: {
                strict: false
            }
        },
        build: {
            chunkSizeWarningLimit: 3000
        }
    },

    // Sitemap & RSS (handled by build hook)
    transformHtml: (_, id, { pageData }) => {
        // Generate sitemap or other transformations
    },

    // Build Configuration
    cleanUrls: true,
    lastUpdated: true,
    ignoreDeadLinks: true,
    srcExclude: ['**/README.md', '**/node_modules/**'],

})
