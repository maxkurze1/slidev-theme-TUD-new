/// <reference types="vite/client" />
import { reactive, toValue, watchEffect } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useSlideContext } from '@slidev/client'
import { toCssColor, toRawColor } from './color'

function createRegistry<T>() {
  const store = reactive<Record<number, T>>({})

  function publish(value: MaybeRefOrGetter<T>) {
    const page = toValue(useSlideContext().$page)
    watchEffect(() => {
      store[page] = toValue(value)
    })
  }

  return { store, publish }
}

const backgroundsReg = createRegistry<string>()
export const slideBackgrounds = backgroundsReg.store
export function useBackground(color: MaybeRefOrGetter<string>) {
  backgroundsReg.publish(() => toRawColor(toValue(color)))
}


// A mark's placement. (x, y) is the slide-pixel position of the logo's center
export interface MarkTransform {
  scale: number
  x: number
  y: number
  rotate?: number // degrees
}

export interface BackgroundLogo {
  bl: MarkTransform
  tr: MarkTransform
  fill?: string
}

const bgLogosReg = createRegistry<BackgroundLogo>()
export const slideBgLogos = bgLogosReg.store

export function useBackgroundLogo(logo: MaybeRefOrGetter<BackgroundLogo>) {
  bgLogosReg.publish(() => {
    const l = toValue(logo)
    return l.fill === undefined ? l : { ...l, fill: toRawColor(l.fill) }
  })
}

export interface SlideLogos {
  text?: string
  normal?: string
  small?: string
}

const slideLogosReg = createRegistry<SlideLogos>()
export const slideLogos = slideLogosReg.store

export function useLogo(logos: MaybeRefOrGetter<SlideLogos>) {
  slideLogosReg.publish(() => {
    const l = toValue(logos)
    const resolved: SlideLogos = {}
    if (l.text !== undefined) resolved.text = toCssColor(l.text)
    if (l.normal !== undefined) resolved.normal = toCssColor(l.normal)
    if (l.small !== undefined) resolved.small = toCssColor(l.small)
    return resolved
  })
}
