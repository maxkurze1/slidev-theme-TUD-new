<template>
  <div class="h-full">
    <div class="slidev-layout section-n" :class="`section-${variant}`" :style="{ '--section-text': textCss }">
      <div class="content content-main flex items-center absolute inset-0">
        <div class="main w-full">
          <slot></slot>
        </div>
      </div>
      <div class="content content-detail flex items-center absolute inset-0">
        <div class="detail w-full">
          <slot name="detail"></slot>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBackground, useBackgroundLogo, useLogo, type BackgroundLogo, type MarkTransform } from '../scripts/background'
import { asIndex, resolveColorName, toCssColor } from '../scripts/color'

const { variant = 1, colors = {} } = defineProps<{
  variant?: number | string
  colors?: {
    bg?: number | string
    logo?: number | string
    text?: number | string
  }
}>()
const { bg, logo, text } = colors

const defaultIndex = asIndex(bg) ?? asIndex(logo) ?? Number(variant)

const bgColor = computed(() => resolveColorName(bg, 'bg', defaultIndex))
const logoFill = computed(() => resolveColorName(logo, 'logo', defaultIndex))
const textColor = computed(() => resolveColorName(text, 'text', defaultIndex))
// The template consumes --section-text as a CSS colour, so convert here.
const textCss = computed(() => toCssColor(textColor.value))

useBackground(bgColor)

// SVG is 100x100; slide is 1280x720, and the transform origin is (50,50).
// Values feed MarkTransform (see scripts/background.ts): { scale, x, y, rotate? }.
const HIDDEN: MarkTransform = { scale: 5, x: 640, y: 360 }
const sectionTransforms = computed<Pick<BackgroundLogo, 'bl' | 'tr'>>(() => {
  switch (String(variant)) {
    case '1':
      return {
        // bl: SVG (69,100) -> slide (530,493)
        bl: { scale: 28.32, x: -8.08, y: -923 },
        // tr: SVG (31,0) -> slide (530,493)
        tr: { scale: 28.32, x: 1068.08, y: 1909 },
      }
    case '2':
      // bl/tr: SVG (31,0) -> slide (1280,0), logo centre on vertical middle (y=360)
      return {
        bl: { rotate: 90, scale: 18.9474, x: 332.63, y: 360 },
        tr: { rotate: 90, scale: 18.9474, x: 332.63, y: 360 },
      }
    case '3':
      return {
        // bl: SVG (0,40.584) -> slide (640,430)
        bl: { scale: 20.63, x: 1671.5, y: 624.252 },
        // tr: SVG (100,59.416) -> slide (640,430)
        tr: { scale: 20.63, x: -391.5, y: 235.748 },
      }
    case '4':
      return {
        // bl: SVG (0,70.71) -> slide (800,360)
        bl: { scale: 23.6, x: 1980, y: -128.756 },
        // tr: SVG (100,29.29) -> slide (800,360)
        tr: { scale: 23.6, x: -380, y: 848.756 },
      }
    case '5':
      return {
        // bl: SVG (0,70.71) -> slide (800,360)
        bl: { scale: 10, x: 640 - 300, y: 360 + 50 },
        // tr: SVG (100,29.29) -> slide (800,360)
        tr: { scale: 10, x: 640 + 300, y: 360 - 50 },
      }
    case '6':
      return {
        // bl: SVG (17.25,37.542) -> slide (640,360), -0.5px along logo +y
        bl: { rotate: -60, scale: 15, x: 1047.026, y: 27.75 },
        // tr: SVG (82.75,62.458) -> slide (640,360), +0.5px along logo +y
        tr: { rotate: -60, scale: 15, x: 232.974, y: 692.25 },
      }
    default:
      return { bl: HIDDEN, tr: HIDDEN }
  }
})

const sectionLogo = computed<BackgroundLogo>(() => ({
  ...sectionTransforms.value,
  fill: logoFill.value,
}))
useBackgroundLogo(sectionLogo)
useLogo(computed(() => {
  switch (String(variant)) {
    case '1':
    case '5':
    case '6':
      return { small: textColor.value }
    case '3':
      return { small: logoFill.value }
    case '4':
      return { small: bgColor.value }
    case '2':
    default:
      return { }
  }
}))
</script>
<style>
.slidev-layout.section-n {
  code {
    background: none;
    @apply border-2 border-[color-mix(in_srgb,var(--section-text,white)_20%,transparent)];
  }
  color: var(--section-text, white);
  h1, h2, h3, h4, h5, h6, p {
    color: var(--section-text, white);
  }
  h1 {
    @apply mb-18;
  }
}

.slidev-layout.section-1 {
  .content-main {
    @apply pl-[530px] pb-[227px];
  }
  .content-detail {
    @apply pr-[750px] pt-[493px];
  }
  .main { @apply my-[64px] mr-[64px] }
  .detail { @apply pl-[64px] py-[64px] }

}
.slidev-layout.section-2 {
  .content-main {
    @apply pl-[64px] py-[66px];
  }
}
.slidev-layout.section-3 {
  .content-main {
    @apply pb-[175px] pr-[640px]; /*pb-[290px]*/
  }
  .content-detail {
    @apply pl-[640px] pt-[320px];
  }
  .main { @apply p-[64px] }
  .detail { @apply p-[64px] }
  h1 {
    @apply mb-18;
  }
}
.slidev-layout.section-4 {
  .main { @apply p-[64px] }
}

.slidev-layout.section-5 {
  .main { @apply text-center }
}

.slidev-layout.section-6 {
  .main { @apply text-center }
}
</style>
