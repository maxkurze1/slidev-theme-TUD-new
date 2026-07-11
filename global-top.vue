<script setup lang="ts">
import { defineComponent, getCurrentInstance } from 'vue'
import { useHead } from '@unhead/vue'

// Favicons are imported as Vite assets (not from public/) so the bundler
// resolves each to a hashed, base-aware URL. This works regardless of where
// the theme is installed, unlike hardcoded "/theme/..." paths in index.html.
import faviconIco from './assets/favicons/favicon.ico?url'
import favicon32 from './assets/favicons/favicon-32x32.png?url'
import favicon16 from './assets/favicons/favicon-16x16.png?url'
import appleTouchIcon from './assets/favicons/apple-touch-icon.png?url'
import faviconIcoDark from './assets/favicons/dark/favicon.ico?url'
import favicon32Dark from './assets/favicons/dark/favicon-32x32.png?url'
import favicon16Dark from './assets/favicons/dark/favicon-16x16.png?url'
import appleTouchIconDark from './assets/favicons/dark/apple-touch-icon.png?url'

useHead({
  link: [
    // Light color scheme
    { rel: 'apple-touch-icon', sizes: '180x180', href: appleTouchIcon, media: '(prefers-color-scheme: light)' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32, media: '(prefers-color-scheme: light)' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon16, media: '(prefers-color-scheme: light)' },
    { rel: 'icon', href: faviconIco, sizes: 'any', media: '(prefers-color-scheme: light)' },
    // Dark color scheme
    { rel: 'apple-touch-icon', sizes: '180x180', href: appleTouchIconDark, media: '(prefers-color-scheme: dark)' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32Dark, media: '(prefers-color-scheme: dark)' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon16Dark, media: '(prefers-color-scheme: dark)' },
    { rel: 'icon', href: faviconIcoDark, sizes: 'any', media: '(prefers-color-scheme: dark)' },
  ],
})

// `slidev-component-progress` is optional. When it is installed and
// enabled (via `addons:`), Slidev auto-imports its <Progress>
//
// registering a global no-op fallback
const app = getCurrentInstance()?.appContext.app
if (app && !app.component('Progress')) {
  app.component(
    'Progress',
    defineComponent({ name: 'Progress', inheritAttrs: false, render: () => null }),
  )
  app.component(
    'MarkersShapes',
    defineComponent({ name: 'MarkersShapes', inheritAttrs: false, render: () => null }),
  )
}
</script>

<template>
  <div class="absolute top-0 left-0 w-full z-10">
    <Progress level="3" :height="15" thickness="15px" clicks :opacity="1" print
      marginY="-1px" fillLast emptyFirst scale="clicks"
      :disable="(layout) => new Set(['cover', 'cover-blue', 'cover-white', 'section', 'section-blue', 'section-white', 'section-n']).has(layout)">
      <template #marker="args"><MarkersShapes v-bind="args" shape="square" visible="hover" activeStyle="filled"/></template>
    </Progress>
  </div>
</template>
