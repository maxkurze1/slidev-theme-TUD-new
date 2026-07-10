<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import Two from 'two.js'
import type { MarkTransform } from '../scripts/background'
import { colors } from '../scripts/color'
import { useScale, HEIGHT, WIDTH } from '../scripts/util'
import rawBl from '../assets/TUD-logo-bl.svg?raw'
import rawTr from '../assets/TUD-logo-tr.svg?raw'

const props = withDefaults(defineProps<{
  bl?: MarkTransform
  tr?: MarkTransform
  fill?: string // undefined := hidden (opacity 0)
  background: string
}>(), {
  bl: () => ({ scale: 5, x: 640, y: 360 }),
  tr: () => ({ scale: 5, x: 640, y: 360 }),
})


const container = ref<HTMLDivElement | null>(null)
let two: any = null, bgRect: any = null, blGroup: any = null, trGroup: any = null

const slideScale = useScale()

const mark = (m: MarkTransform) => ({ ...m, rotate: m.rotate ?? 0 })
const s = { bl: mark(props.bl), tr: mark(props.tr), col: 'rgba(0,0,0,0)', opacity: 0, bg: 'rgba(0,0,0,0)' }

function vars() {
  const hidden = props.fill == null
  return {
    bl: mark(props.bl),
    tr: mark(props.tr),
    col: hidden ? colors.primary : props.fill!,
    opacity: hidden ? 0 : 1,
    bg: props.background,
  }
}

// load the SVG into a Two.Group centred s.t. (50,50) sits at the origin
function buildMark(raw: string) {
  const svg = new DOMParser().parseFromString(raw, 'image/svg+xml').documentElement
  const interpreted = two.interpret(svg, false, false)
  interpreted.mask = null
  interpreted.translation.set(-50, -50)
  const g = two.makeGroup(interpreted)
  g.linewidth = 0
  return g
}

function apply() {
  if (!two) return
  bgRect.fill = s.bg
  for (const [g, m] of [[blGroup, s.bl], [trGroup, s.tr]] as const) {
    g.translation.set(m.x, m.y)
    g.scale = m.scale
    g.rotation = m.rotate * Math.PI / 180
    g.opacity = s.opacity
    g.fill = s.col
  }
  two.update()
}

let active = 0
function track(tween: any) {
  let counted = false // handle `onInterrupt` before `onStart`
  tween.eventCallback('onStart', () => {
    counted = true
    if (active++ === 0) gsap.ticker.add(apply)
  })
  const end = () => {
    if (!counted) return
    counted = false
    if (--active === 0) {
      gsap.ticker.remove(apply)
      apply() // flush the final frame
    }
  }
  tween.eventCallback('onComplete', end)
  tween.eventCallback('onInterrupt', end)
  return tween
}

// keep the canvas resolution matching the pixels it covers
function resize() {
  if (!two) return
  const dpr = window.devicePixelRatio || 1
  two.renderer.setSize(WIDTH, HEIGHT, dpr * slideScale.value)
  apply()
}

onMounted(() => {
  two = new Two({ type: Two.Types.canvas, width: WIDTH, height: HEIGHT, autostart: false })
  two.appendTo(container.value!)
  two.renderer.domElement.style.display = 'block'
  bgRect = two.makeRectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT)
  bgRect.noStroke()
  blGroup = buildMark(rawBl)
  trGroup = buildMark(rawTr)
  Object.assign(s, vars()) // snap to the current target, no intro tween
  resize()
})

watch(slideScale, resize, { flush: 'post' })

onBeforeUnmount(() => {
  gsap.killTweensOf([s, s.bl, s.tr])
  gsap.ticker.remove(apply)
})

watch(() => [props.bl, props.tr, props.fill, props.background], () => {
  if (!two) return
  const v = vars()
  track(gsap.timeline({ defaults: { duration: 0.7, ease: 'power2.out', overwrite: 'auto' } })
    .to(s.bl, v.bl, 0)
    .to(s.tr, v.tr, 0)
    .to(s, { col: v.col, bg: v.bg }, 0)
    .to(s, { opacity: v.opacity, duration: 1.2 }, 0))
}, { deep: true })
</script>

<template>
  <div ref="container" class="absolute inset-0 pointer-events-none"></div>
</template>
