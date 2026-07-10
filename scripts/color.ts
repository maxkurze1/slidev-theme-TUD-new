// `colors` / `paletteNames` — the TU Dresden corporate palette, the single
// source of truth for the theme's colors (consumed by uno.config.ts, which
// registers them as UnoCSS theme colors and exposes them as `--theme-*`
// CSS vars).

export const colors = {
  blue: { DEFAULT: '#2F57B2', 1: '#2F57B2', 2: '#97C6FF' },
  violet: { DEFAULT: '#7369BE', 1: '#7369BE', 2: '#C8C8FF' },
  magenta: { DEFAULT: '#BC1589', 1: '#BC1589', 2: '#FFB9FF' },
  red: { DEFAULT: '#D20F41', 1: '#D20F41', 2: '#FFAAA5' },
  orange: { DEFAULT: '#C85000', 1: '#C85000', 2: '#FFBE78' },
  yellow: { DEFAULT: '#FFC700', 1: '#FFC700', 2: '#FFE483' },
  olive: { DEFAULT: '#767A23', 1: '#767A23', 2: '#D2DC46' },
  green: { DEFAULT: '#007D4B', 1: '#007D4B', 2: '#8CE6AA' },
  teal: { DEFAULT: '#0A777F', 1: '#0A777F', 2: '#8CE6D7' },
  primary: '#00008C',
  darkblue: '#001450',
  gray: '#323F4B',
} as const

// Every valid palette colour name
export const paletteNames: string[] = Object.entries(colors).flatMap(([name, value]) =>
  typeof value === 'string'
    ? [name]
    : [name, ...Object.keys(value)
        .filter((shade) => shade !== 'DEFAULT')
        .map((shade) => `${name}-${shade}`)],
)

export const toCssColor = (name: string) => (new Set(paletteNames).has(name) ? `var(--theme-${name})` : name)

// Resolve a palette colour name to its concrete hex value; pass anything else through unchanged
export function toRawColor(name: string): string {
  const [base, shade] = name.split('-')
  const entry = (colors as Record<string, string | Record<string, string>>)[base]
  if (typeof entry === 'string') return shade === undefined ? entry : name
  if (entry !== undefined) return entry[shade ?? 'DEFAULT'] ?? name
  return name
}

// Predefined color sets.
export const COLOR_COMBOS = [
  { bg: 'red-2',     logo: 'magenta-2', text: 'primary' },
  { bg: 'violet',    logo: 'magenta',   text: 'white' },
  { bg: 'violet-2',  logo: 'primary',   text: 'white' },
  { bg: 'teal-1',    logo: 'teal-2',    text: 'primary' },
  { bg: 'yellow-2',  logo: 'teal-2',    text: 'primary' },
  { bg: 'magenta-2', logo: 'blue-2',    text: 'primary' },
] as const

export function comboAt(i: number) {
  const n = COLOR_COMBOS.length
  return COLOR_COMBOS[(((Math.trunc(i) - 1) % n) + n) % n]
}

// The colour fields a combo provides; also the fields section-n resolves.
export type ComboField = keyof (typeof COLOR_COMBOS)[number]

// A colour spec as layouts pass it: a colour string (hex / CSS / palette name),
// a combo index (number, or an all-digits string), or omitted.
export type ColorSpec = number | string | undefined


export function asIndex(spec: ColorSpec): number | undefined {
  if (typeof spec === 'number') return spec
  if (typeof spec === 'string' && /^\d+$/.test(spec)) return Number(spec)
  return undefined
}

// full resolve
export function resolveColorName(spec: ColorSpec, field: ComboField, defaultIndex: number): string {
  const i = asIndex(spec)
  if (i !== undefined) return comboAt(i)[field]
  if (spec === undefined || spec === '') return comboAt(defaultIndex)[field]
  return String(spec)
}

// Resolve a spec straight to a CSS <color> — resolveColorName then toCssColor.
export function resolveCssColor(spec: ColorSpec, field: ComboField, defaultIndex: number): string {
  return toCssColor(resolveColorName(spec, field, defaultIndex))
}
