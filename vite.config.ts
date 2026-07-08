import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { setupFootnotes, setupFigureCaptions, setupTableCaptions } from './markdown'

export default defineConfig({
  slidev: {
    vue: {
      /* vue options */
    },
    markdown: {
      // Theme markdown customizations (footnotes, figure/table captions,
      // deck-wide numbering) — see markdown.ts.
      markdownSetup: (md) => {
        setupFootnotes(md)
        setupFigureCaptions(md)
        setupTableCaptions(md)
      },
    },
  },

  server: {
    watch: {
      ignored: [
        '**/.direnv/**', '**/.vscode/**',
        resolve(import.meta.dirname, 'resources/**'),
      ],
    },
  },
})
