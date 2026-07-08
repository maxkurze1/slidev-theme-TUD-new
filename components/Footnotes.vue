<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'

// Markdown footnotes are wrapped in this component by the footnote render-rule
// override in vite.config.ts. Instead of rendering inline at the bottom of the
// slide (where they get caught by slide transitions), we teleport them into a
// target in global-bottom.vue. That layer is rendered *outside* Slidev's
// transition group, so the footnotes no longer animate, and they sit right
// next to the footer for easy styling.
const { $nav, $page, $clicks } = useSlideContext()

// Each mounted slide (the active one, preloaded neighbours, every print page)
// renders its own <Footnotes>. Only the slide that is currently shown teleports
// into the shared target; the others render nothing (see v-if below) so they
// neither collide in the target nor flash their footnotes in-place while
// sliding out during a transition.
const isActive = computed(() => unref($page) === unref(($nav as any).value.currentPage))

// The target id is scoped to the page number. In print/export each page has
// its own global-bottom with a page-scoped nav, so this keeps every page's
// footnotes pointed at *its own* target instead of all resolving to the first.
const target = computed(() => `#footnotes-containter-${unref($page)}`)

// --- Footnote <-> reference visibility mirroring -----------------------------
// markdown-it-footnote already links each footnote to its in-text references:
//   reference: <sup class="footnote-ref"><a href="#fnN" id="fnrefN[:k]">[N]</a>
//   footnote:  <li id="fnN" class="footnote-item">
// so a footnote `fnN` corresponds to every `.footnote-ref a[href="#fnN"]`.
//
// The references live in the slide body and may sit inside a `v-click` (or any
// other reveal), which fades them via opacity. Because the footnote block is
// teleported out of the slide it no longer shares that opacity, so on its own
// it would always be fully visible. We mirror it here: each footnote item takes
// the *max* opacity of its references (visible as soon as any one reference is),
// reading the live, mid-transition value so the footnote fades in lockstep.

// Hidden marker that stays in the (non-teleported) slide body, used purely to
// locate the slide root that contains this instance's references.
const anchorEl = ref<HTMLElement | null>(null)
// Wrapper around the teleported list; `display: contents` keeps it transparent
// to layout while giving us a handle on *this* instance's footnote items.
const listEl = ref<HTMLElement | null>(null)
let slideRoot: HTMLElement | null = null

// Cumulative (visible) opacity of `el` relative to `root`: the product of every
// opacity along the ancestor chain, so nested reveals compose correctly.
function visibleOpacity(el: HTMLElement, root: HTMLElement) {
  let opacity = 1
  let node: HTMLElement | null = el
  while (node) {
    opacity *= Number.parseFloat(getComputedStyle(node).opacity) || 0
    if (node === root)
      break
    node = node.parentElement
  }
  return opacity
}

// Mirror every footnote item's opacity onto the max of its references' opacity.
// Returns whether anything changed this pass (used to detect a settled fade).
function syncOnce() {
  const list = listEl.value
  if (!slideRoot || !list)
    return false
  let changed = false
  list.querySelectorAll<HTMLElement>('.footnote-item').forEach((item) => {
    const refs = slideRoot!.querySelectorAll<HTMLElement>(
      `.footnote-ref a[href="#${item.id}"]`,
    )
    let max = 0
    refs.forEach((a) => {
      const o = visibleOpacity(a, slideRoot!)
      if (o > max)
        max = o
    })
    // No reference found (e.g. print quirks) -> leave the footnote untouched.
    const next = refs.length ? String(max) : ''
    if (item.style.opacity !== next) {
      item.style.opacity = next
      changed = true
    }
  })
  return changed
}

// References fade over a CSS transition; follow it frame-by-frame until the
// value settles (a few stable frames) instead of snapping to the end state.
let rafId = 0
function syncAnimated() {
  cancelAnimationFrame(rafId)
  let stable = 0
  const step = () => {
    stable = syncOnce() ? 0 : stable + 1
    if (stable < 4)
      rafId = requestAnimationFrame(step)
  }
  step()
}

onMounted(async () => {
  slideRoot = anchorEl.value?.closest<HTMLElement>('[data-slidev-no]') ?? null
  // A reference's fade is driven by CSS, so its transition events are our cue
  // to re-follow the opacity even when no click index changed.
  slideRoot?.addEventListener('transitionstart', syncAnimated)
  slideRoot?.addEventListener('transitionend', syncAnimated)
  await nextTick()
  syncAnimated()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  slideRoot?.removeEventListener('transitionstart', syncAnimated)
  slideRoot?.removeEventListener('transitionend', syncAnimated)
})

// Re-sync when this slide becomes the active (teleporting) one, and on every
// click step that may reveal/hide a reference.
watch(isActive, () => nextTick(syncAnimated))
watch($clicks, () => nextTick(syncAnimated))
</script>

<template>
  <!-- Stays in the slide body; only used to find the slide root above. -->
  <span ref="anchorEl" class="hidden" />
  <!-- `defer` (Vue 3.5+) resolves the target *after* the render flush, so when
       currentPage flips the teleport finds global-bottom's freshly-rendered
       target instead of racing it (which made the footnotes pop in late). -->
  <Teleport v-if="isActive" :to="target" defer>
    <div ref="listEl" class="contents">
      <slot />
    </div>
  </Teleport>
</template>

<style>
/* Inline footnote reference ([^1] superscript) — stays in the slide body. */
.footnote-ref a {
  @apply no-underline border-0 text-gray;
}

/* The footnotes *block* is teleported into global-bottom.vue */
.footnotes {
  @apply flex-auto flex flex-col justify-end pt-1 text-gray border-t-1 border-gray;
}
.footnotes p {
  @apply m-0 text-xs;
}
.footnotes-list {
  /* UnoCSS resets list-style off every ol/ul, which dropped the footnote
     numbers; list-decimal re-enables them. pl-7 leaves room for the markers. */
  @apply m-0 list-decimal pl-7;
}
.footnotes ::marker {
  /* numbers a touch lighter than the note text so they read as labels */
  @apply text-xs text-gray;
}

/* markdown-it emits a separator rule and per-note backref links we don't want. */
.footnotes-sep,
.footnote-backref {
  @apply hidden;
}
</style>
