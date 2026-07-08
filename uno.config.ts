import { defineConfig } from 'unocss'
import { colors } from './scripts/color'

// Expose the same palette as CSS custom properties on :root.
// e.g. --theme-primary --theme-blue --theme-blue-1 ...
const paletteVars = Object.entries(colors).flatMap(([name, value]) =>
  typeof value === 'string'
    ? [`--theme-${name}: ${value};`]
    : Object.entries(value).map(([shade, hex]) =>
        `--theme-${name}${shade === 'DEFAULT' ? '' : `-${shade}`}: ${hex};`)
)

export default defineConfig({
  theme: { colors },
  preflights: [
    { getCSS: () => `:root {\n  ${paletteVars.join('\n  ')}\n}` },
  ],
  rules: [
    [/^vt-([\w-]+)$/, ([, name]) => ({ "view-transition-name": name })],
    // this variant does only a simple cross-fade without and opacity shenanigans
    [/^vtcf-([\w-]+)$/, ([, name]) => ({ "view-transition-name": name, "view-transition-class": "simple" })],
  ]
  // shortcuts: {
  //   // custom the default background
  //   'bg-main': 'bg-white text-[#181818] dark:(bg-[#121212] text-[#ddd])',
  // },
  // ...
})