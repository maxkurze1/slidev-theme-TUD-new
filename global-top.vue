<script setup lang="ts">
import { defineComponent, getCurrentInstance } from 'vue'

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
