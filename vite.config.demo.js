import { viteSingleFile } from "vite-plugin-singlefile";
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite';
import { presetWind4, presetIcons, presetTypography, transformerDirectives, extractorSplit } from "unocss";
import extractorPug from '@unocss/extractor-pug';


export default {
  root: 'demo',
  preview: {
    host: true,
    port: 9494
  },
  publicDir: "../public",

  plugins: [
    vue(),
    viteSingleFile(),
    Unocss({
      presets: [
        presetIcons({ scale: 1.2, }),
        presetWind4({ preflights: { reset: true, } }),
        presetTypography()
      ],
      transformers: [transformerDirectives()],
      extractors: [extractorPug(), extractorSplit],
    }),
  ],
  base: './',
  build: {
    cssMinify: false,
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
  },
};
