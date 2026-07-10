<template>
  <div class="h-full">
    <div class="slidev-layout section-white">
      <div class="content p-[64px] pb-8 flex flex-col justify-center h-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useLogo } from '../scripts/background'

useLogo({ small: 'primary' })
</script>
<style>
.slidev-layout.section-white {
  h1 {
    @apply mb-4;
  }
  h2 {
    @apply text-gray;
  }
  /* @apply m-0 absolute bottom-[340px]; */
}
</style>
