<template>
  <div class="h-full">
    <div class="slidev-layout section-n" :class="`section-${variant}`" :style="{ '--section-text': textColor }">
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
import { useBackground, useBackgroundLogo, type BackgroundLogo } from '../scripts/background'
import { asIndex, resolveCssColor } from '../scripts/color'

const { variant = 1, colors = {} } = defineProps<{
  variant?: number | string // preset positions of background forms
  colors?: {
    bg?: number | string
    logo?: number | string
    text?: number | string
  }
}>()
const { bg, logo, text } = colors

const defaultIndex = asIndex(bg) ?? asIndex(logo) ?? Number(variant)

const bgColor = computed(() => resolveCssColor(bg, 'bg', defaultIndex))
const logoFill = computed(() => resolveCssColor(logo, 'logo', defaultIndex))
const textColor = computed(() => resolveCssColor(text, 'text', defaultIndex))

useBackground(bgColor)

// SVG is 100x100; slide is 1280x720, and the transform origin is (50,50).
const sectionTransforms = computed<Pick<BackgroundLogo, 'bl' | 'tr'>>(() => {
  switch (String(variant)) {
    case '1':
      return {
        // bl: SVG (69,100) -> slide (530,493)
        bl: "scale-[28.32] translate-x-[-58.08px] translate-y-[-973px]",
        // tr: SVG (31,0) -> slide (530,493)
        tr: "scale-[28.32] translate-x-[1018.08px] translate-y-[1859px]",
      }
    case '2':
      // bl/tr: SVG (31,0) -> slide (1280,0), logo centre on vertical middle (y=360)
      return {
        bl: "rotate-90 scale-[18.9474] translate-x-[282.63px] translate-y-[310px]",
        tr: "rotate-90 scale-[18.9474] translate-x-[282.63px] translate-y-[310px]",
      }
    case '3':
      return {
        // bl: SVG (0,40.584) -> slide (640,430)
        bl: "scale-[20.63] translate-x-[1621.5px] translate-y-[574.252px]",
        // tr: SVG (100,59.416) -> slide (640,430)
        tr: "scale-[20.63] translate-x-[-441.5px] translate-y-[185.748px]",
      }
    case '4':
      return {
        // bl: SVG (0,70.71) -> slide (800,360)
        bl: "scale-[23.6] translate-x-[1930px] translate-y-[-178.756px]",
        // tr: SVG (100,29.29) -> slide (800,360)
        tr: "scale-[23.6] translate-x-[-430px] translate-y-[798.756px]",
      }
    case '5':
      return {
        // bl: SVG (0,70.71) -> slide (800,360)
        bl: "scale-[10.0] translate-x-[calc(590px-400px)] translate-y-[calc(310px+100px)]",
        // tr: SVG (100,29.29) -> slide (800,360)
        tr: "scale-[10.0] translate-x-[calc(590px+400px)] translate-y-[calc(310px-100px)]",
      }
    case '6':
      return {
        // bl: SVG (17.25,37.542) -> slide (640,360), -0.5px along logo +y
        bl: "rotate-[-60deg] scale-[15] translate-x-[997.026px] translate-y-[-22.25px]",
        // tr: SVG (82.75,62.458) -> slide (640,360), +0.5px along logo +y
        tr: "rotate-[-60deg] scale-[15] translate-x-[182.974px] translate-y-[642.25px]",
      }
    default:
      return { bl: "", tr: "" }
  }
})

const sectionLogo = computed<BackgroundLogo>(() => ({
  ...sectionTransforms.value,
  fill: logoFill.value,
}))
useBackgroundLogo(sectionLogo)
</script>
<style lang="stylus">
.slidev-layout.section-n {
  code {
    background: none;
    @apply border-1 border-[var(--section-text,white)];
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
    @apply pb-[175px] pr-[640px]; //pb-[290px]
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
</style>
