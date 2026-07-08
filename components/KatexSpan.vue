<script setup>
import katex from "katex"
import { computed } from "vue"

const props = defineProps({
  expr: {
    type: String,
    required: true,
  },
  display: {
    type: Boolean,
    default: false,
  },
})

const rendered = computed(() =>
  katex.renderToString(props.expr, {
    displayMode: props.display,
    throwOnError: false,
    trust: true,
    strict: false,
  })
)
</script>

<template>
  <span v-html="rendered"></span>
</template>
