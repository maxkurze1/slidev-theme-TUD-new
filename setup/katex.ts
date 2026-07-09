import { defineKatexSetup } from '@slidev/types'
import { colors } from '../scripts/color'

// Short color macros, e.g. \red{x} instead of \htmlStyle{color:var(--theme-red)}{x}.
// \red{x} is default shade, \red{2}{x} or \red2{x} for the "2"nd shade.
const tokensToText = (tokens: { text: string }[]) => tokens.slice().reverse().map((t) => t.text).join('')

const makeColorMacro = (name: string, shadeKeys: Set<string>) => (context: any) => {
  context.consumeSpaces()
  const first = context.consumeArg()
  const firstText = tokensToText(first.tokens)
  const hasShadeArg = shadeKeys.has(firstText) && context.future().text === '{'
  const varName = hasShadeArg ? `${name}-${firstText}` : name
  const textArg = hasShadeArg ? tokensToText(context.consumeArg().tokens) : firstText
  return `\\htmlStyle{color:var(--theme-${varName})}{${textArg}}`
}

const colorMacros = Object.fromEntries(
  Object.entries(colors).map(([name, value]) => {
    const shadeKeys = typeof value === 'string'
      ? new Set<string>()
      : new Set(Object.keys(value).filter((k) => k !== 'DEFAULT'))
    return [`\\${name}`, makeColorMacro(name, shadeKeys)]
  }),
)

export default defineKatexSetup(() => {
  return {
    // maxExpand: 2000,
    trust: true,
    strict: false,
    // throwOnError: false,
    macros: colorMacros,
  }
})
