<template>
  <div>
    <div
      class="slide-backdrop absolute inset-0 pointer-events-none duration-[0.5s] transition-[background-color]"
      :style="{ backgroundColor: pageBackground }"
    ></div>

    <div v-html="rawLogoText"
      :style="{ fill: logos.text }" :class="{'opacity-0': !logos.text}"
      class="[&>svg]:w-[220px] duration-[0.5s] transition-[opacity,fill] absolute left-[64px] top-[42px] z-10"
    ></div>
    <div v-html="rawLogo"
      :style="{ fill: logos.normal }" :class="{'opacity-0': !logos.normal}"
      class="[&>svg]:w-[68px] duration-[0.5s] transition-[opacity,fill] absolute left-[64px] top-[42px] z-10"
    ></div>

    <div v-html="rawLogoSmall"
      :style="{ fill: logos.small }" :class="{'opacity-0': !logos.small}"
      class="duration-[0.5s] transition-[opacity,fill] absolute left-[64px] top-[660px] z-10 w-[54px]"
    ></div>

    <div v-html="rawLogoBl"
      :class="logoBlClass" :style="{ fill: logoFill }"
      class="[transition:opacity_0.8s,fill_0.5s,transform_0.5s] [&>svg]:w-[100px] will-change-transform absolute left-[0px] top-[0px] pointer-events-none"
    ></div>
    <div v-html="rawLogoTr"
      :class="logoTrClass" :style="{ fill: logoFill }"
      class="[transition:opacity_0.8s,fill_0.5s,transform_0.5s] [&>svg]:w-[100px] will-change-transform absolute left-[0px] top-[0px] pointer-events-none"
    ></div>

    <footer class="absolute bottom-0 h-16 pb-[13px] pr-[64px] pl-[164px] flex items-baseline gap-x-6 w-full z-100">
      <div :class="{'opacity-0': !show_footer}" class="duration-[0.5s] transition-opacity text-primary">
        <div v-if="$slidev.configs.footer !== false" class="whitespace-pre">
          {{ footer }}
        </div>
      </div>

      <!-- Footnotes teleport target (see components/Footnotes.vue) -->
      <div class="relative flex-1 min-w-0 self-end flex flex-col h-full">
        <div :id="footnotesTargetId" class="absolute bottom-0 w-full min-h-full pb-2"></div>
      </div>

      <div :class="{'opacity-0': !show_footer}" class="duration-[0.5s] transition-opacity w-[66px]">
        <div class="flex items-baseline justify-center">
          <span class="flex-1 text-right font-bold text-lg text-primary">{{ $nav.currentPage }}</span>
          <span :class="{ 'opacity-0': $nav.clicksTotal == 0 }" class="text-left text-gray text-xs">.</span>
          <span :class="{ 'opacity-0': $nav.clicksTotal == 0 }" class="flex-1 text-left text-gray text-xs">{{ $nav.clicks+1 }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, unref } from 'vue';
import { expandDateTokens } from './scripts/util';
import { formatString } from './scripts/util';
import { slideBackgrounds, slideBgLogos, slideLogos } from './scripts/background';

import rawLogoBl from './assets/TUD-logo-bl.svg?raw';
import rawLogoTr from './assets/TUD-logo-tr.svg?raw';
import rawLogo from './assets/TUD-logo-no-color.svg?raw';
import rawLogoSmall from './assets/TUD-logo-text-small-no-color.svg?raw';
import rawLogoText from './assets/TUD-logo-text-no-color.svg?raw';

const { $slidev, $nav } = useSlideContext()
const pageBackground = computed(() => slideBackgrounds[$nav.value.currentPage] ?? 'transparent')

// use $nav instead of useNav to ensure that the export works correctly
const footnotesTargetId = computed(() => `footnotes-containter-${unref(($nav as any).value.currentPage)}`)

const logos = computed(() => slideLogos[$nav.value.currentPage] ?? {})

const show_footer = computed(() => !new Set(['cover', 'cover-blue', 'cover-white', 'section', 'section-blue', 'section-white', 'section-n']).has($nav.value.currentLayout))

const get_date = computed(() => {
  const d = ($slidev.configs as any).date
  return d ? expandDateTokens(String(d)) : d
})
const footer = computed(() => {
  let fstring = "{title} • {author}"
  return formatString(($slidev.configs as any).footer ?
    ($slidev.configs as any).footer : fstring,
    {...$slidev.configs, date: get_date.value}
  )
})

const pageLogo = computed(() => slideBgLogos[$nav.value.currentPage])
const logoBlClass = computed(() => pageLogo.value?.bl ?? 'scale-[5.0] translate-x-[590px] translate-y-[310px] opacity-0')
const logoTrClass = computed(() => pageLogo.value?.tr ?? 'scale-[5.0] translate-x-[590px] translate-y-[310px] opacity-0')
const logoFill = computed(() => pageLogo.value?.fill ?? 'var(--theme-primary)')

</script>