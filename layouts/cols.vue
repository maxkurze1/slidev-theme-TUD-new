<template>
  <div class="slidev-layout layout-cols w-full h-full">
    <div class="content px-[64px] py-[60px]">
      <slot></slot>
      <div class="flex justify-between mb-8">
        <div v-for="col in orderedCols" :key="col.num" class="col">
          <component :is="col.fn" />
          <!-- <slot :name="`col-${col.num}`"></slot> -->
        </div>
      </div>
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";
import { useLogo } from "../scripts/background";

useLogo({ small: 'primary' });

const slots = useSlots();

const orderedCols = computed(() => {
  return Object.entries(slots)
    .filter(([name]) => name.startsWith("col-"))
    .map(([name, fn]) => {
      const num = parseInt(name.split("-")[1], 10);
      return { num, fn };
    })
    .sort((a, b) => a.num - b.num);
});
</script>
<style lang="stylus">
.slidev-layout.layout-cols col {
  h1 {}
}
</style>
