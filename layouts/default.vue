<template>
  <div class="h-full">
    <div class="slidev-layout default">
      <div class="content px-[64px] py-[60px] w-full h-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogo } from '../scripts/background'

useLogo({ small: 'primary' })
</script>
