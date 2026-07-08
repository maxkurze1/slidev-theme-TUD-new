<template>
  <div class="h-full">
    <div class="slidev-layout cover-white">
      <div class="content p-[64px]">

        <div class="title absolute bottom-[340px] w-full">
          <div class="date absolute top-0 -translate-y-full text-gray text-md">{{ get_date }}</div>
          <h1 v-if="!slotTags.includes('h1')"> {{ $slidev.configs.title }} </h1>
          <component v-else v-for="node in get_slot('h1')" :is="node" :key="node.key"/>

          <div class="absolute bottom-0 translate-y-full">
            <h2 v-if="!slotTags.includes('h2')" class="text-gray"> {{ $slidev.configs.subtitle }} </h2>
            <component v-else v-for="node in get_slot('h2')" class="text-gray" :is="node" :key="node.key"/>
          </div>
        </div>

        <div class="name absolute bottom-[120px] text-gray">
          <div v-if="!slotTags.includes('p')">
            <p class="!text-2xl !m-0 font-bold">{{ $slidev.configs.author }}</p>
            <p class="!m-0 !text-sm">{{ $slidev.configs.group }}</p>
          </div>
          <component v-else v-for="node in get_slot('p')" class="!m-0 !text-sm" :is="node" :key="node.key"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { expandDateTokens } from '../scripts/util';
import { useLogo } from '../scripts/background'
import { computed, useSlots } from 'vue'

useLogo({ text: 'primary' })

const slotTags = computed(() => (useSlots().default?.() || []).map(e => e.type));
const { $slidev } = useSlideContext()

function get_slot(tag) {
  return (useSlots().default?.() || []).filter(n => n.type === tag)
}

const get_date = computed(() => {
  const d = $slidev.configs.date
  return d ? expandDateTokens(String(d)) : d
})
</script>

<style scoped>
.content {
  .title :deep(h1) {
    @apply m-0;
  }
  .title :deep(h2) {
    @apply text-gray;
  }
}
</style>
