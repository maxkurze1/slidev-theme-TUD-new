<template>
  <div class="h-full">
    <div class="slidev-layout section-blue text-white">
      <div class="content p-[64px] pb-8 flex flex-col justify-center h-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBackground, useLogo } from '../scripts/background'
useBackground('primary')
useLogo({ normal: 'white', small: 'white' })
// TODO generalize over bg color via parameter
</script>

<style lang="stylus">
.slidev-layout.section-blue {
  h1 {
    @apply mb-4;
  }

  h1, h2 {
    color: white;
  }

  code {
    background: none;
    @apply border-1;
  }
  // @apply m-0 absolute bottom-[340px];
}
</style>
