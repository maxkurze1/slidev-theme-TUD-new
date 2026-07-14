import type { MarkdownExit } from 'markdown-exit'
import { readFileSync, statSync } from 'node:fs'
import { parseSync } from '@slidev/parser'

// markdown customizations for the theme
// - footnotes teleported into a <Footnotes> component
// - figure captions (`![alt](img){.caption}`)
// - table captions (a `{.caption}` paragraph after a table)
// - deck-wide "Figure N:" / "Table N:" numbering

// global figure/table numbering across the whole deck, constructed at build time
// we parse the full deck once (cached by mtime), count the numbered figures/tables
// on every earlier slide, and use those
// running totals as the starting offset for this slide.

interface DeckCounts { mtimeMs: number, fig: number[], tab: number[] }
const deckCountsCache = new Map<string, DeckCounts>()

// Count numbered figure and table captions
function countNumbered(md: MarkdownExit, content: string): { fig: number, tab: number } {
  const tokens = md.parse(content, { __figTabCount: true })
  let fig = 0, tab = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    // Figures: count markdown images
    if (token.type === 'inline') {
      for (const child of token.children ?? []) {
        if (child.type !== 'image') continue;
        const classes = classesOf(child)
        if (classes.includes('caption') && classes.includes('numbered'))
          fig++
      }
    }
    // Tables: a `{.caption .numbered}` paragraph directly after a table.
    const tableClasses = tableCaptionClasses(tokens, i)
    if (tableClasses?.includes('caption') && tableClasses.includes('numbered'))
      tab++
  }
  return { fig, tab }
}

function deckCounts(md: MarkdownExit, entryPath: string): DeckCounts | null {
  let stat
  try { stat = statSync(entryPath) }
  catch { return null }
  const cached = deckCountsCache.get(entryPath)
  if (cached && cached.mtimeMs === stat.mtimeMs)
    return cached
  const parsed = parseSync(readFileSync(entryPath, 'utf-8'), entryPath)
  const counts: DeckCounts = { mtimeMs: stat.mtimeMs, fig: [], tab: [] }
  for (const slide of parsed.slides) {
    const { fig, tab } = countNumbered(md, slide.content ?? '')
    counts.fig.push(fig)
    counts.tab.push(tab)
  }
  deckCountsCache.set(entryPath, counts)
  return counts
}

// How many numbered figures/tables appear on slides *before* the one rendering
// now — i.e. the offset this slide's numbering should start from.
function numberingOffset(md: MarkdownExit, env: any): { fig: number, tab: number } {
  const id = /^(.*)__slidev_(\d+)\.md$/.exec(env?.id ?? '')
  if (!id)
    return { fig: 0, tab: 0 }
  const counts = deckCounts(md, id[1])
  if (!counts)
    return { fig: 0, tab: 0 }
  const slideIndex = Number(id[2]) - 1
  let fig = 0
  let tab = 0
  for (let i = 0; i < slideIndex && i < counts.fig.length; i++) {
    fig += counts.fig[i]
    tab += counts.tab[i]
  }
  return { fig, tab }
}

type Tok = { type: string, children?: Tok[] | null, attrs?: [string, string][] | null }

// Gather every class on a token parsed with comark
function classesOf(token: Tok): string[] {
  return (token.attrs ?? [])
    .filter(([name]) => name === 'class')
    .flatMap(([, value]) => value.split(/\s+/))
    .filter(Boolean)
}

// If the token at `i` is a paragraph sitting directly after a table, return its
// classes; otherwise null. markdown-it always emits a paragraph as exactly
// [paragraph_open, inline, paragraph_close] — however rich the caption content
// is, it lives inside the `inline` token's children, so this 3-token shape (and
// thus the fixed offsets) always holds. The `{.caption}`/`{.numbered}` markers
// may land on the paragraph_open itself or on a props token among the inline
// children, so classes are gathered from both. Used by both the deck-wide
// counter and the caption rewrite so their detection can't drift apart.
// works with nested content as well
function tableCaptionClasses(tokens: Tok[], i: number): string[] | null {
  if (tokens[i]?.type !== 'paragraph_close'
    || tokens[i - 1]?.type !== 'inline'
    || tokens[i - 2]?.type !== 'paragraph_open'
    || tokens[i - 3]?.type !== 'table_close')
    return null
  return [tokens[i - 2], ...(tokens[i - 1].children ?? [])].flatMap(classesOf)
}

// Footnotes: render footnotes into a <Footnotes> component
// inline footnote refs (i.e. [^1] markers) are not changed
export function setupFootnotes(md: MarkdownExit): void {
  md.renderer.rules.footnote_block_open = () =>
    '<Footnotes><section class="footnotes"><ol class="footnotes-list">\n'
  md.renderer.rules.footnote_block_close = () =>
    '</ol></section></Footnotes>\n'
}

// images marked with `{.caption}` get their alt text rendered as caption.
// see `caption-*` in styles/layout.css.
export function setupFigureCaptions(md: MarkdownExit): void {
  const defaultImage = md.renderer.rules.image
    ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const img = defaultImage(tokens, idx, options, env, self)
    const classes = classesOf(token)
    if (!classes.includes('caption'))
      return img
    const alt = md.utils.escapeHtml(token.content ?? '')
    let label = ''
    if (classes.includes('numbered')) {
      const e = env as { __figureNo?: number }
      e.__figureNo ??= numberingOffset(md, env).fig
      label = `<span class="caption-label">Figure ${++e.__figureNo}: </span>`
    }
    return `<span class="caption-figure">${img}<span class="caption-text">${label}${alt}</span></span>`
  }
}

// table analogue of the figure captions above
// see styles/layout.css
export function setupTableCaptions(md: MarkdownExit): void {
  md.core.ruler.push('table_caption', (state) => {
    // skip the rewrite on the counting pass (countNumbered)
    if (state.env?.__figTabCount) return
    const tokens = state.tokens
    const Token = state.Token

    // 1. in document order: match caption paragraphs directly after tables
    const captions: { close: number, numbered: boolean, num?: number }[] = []
    for (let i = 0; i < tokens.length; i++) {
      const classes = tableCaptionClasses(tokens, i)
      if (!classes?.includes('caption')) continue
      captions.push({ close: i, numbered: classes.includes('numbered') })
    }
    if (captions.length === 0) return

    let tableNo = numberingOffset(md, state.env).tab
    for (const caption of captions)
      if (caption.numbered)
        caption.num = ++tableNo

    // 2. in reverse: rewrite the captions
    for (let k = captions.length - 1; k >= 0; k--) {
      const { close: i, numbered, num } = captions[k]
      const pInline = tokens[i - 1]
      const pOpen = tokens[i - 2]
      const pClose = tokens[i]

      // Locate the <table> this caption belongs to.
      let open = i - 3
      while (open >= 0 && tokens[open].type !== 'table_open') open--
      if (open < 0) continue

      // Retag the paragraph as the caption span (`.caption-text` gives it the
      // same look as the figure captions).
      pOpen.tag = 'span'
      pOpen.block = false
      pOpen.attrs = null
      pOpen.attrSet('class', 'caption-text')
      pClose.tag = 'span'
      pClose.block = false

      if (numbered) {
        const label = new Token('html_inline', '', 0)
        label.content = `<span class="caption-label">Table ${num}: </span>`
        ;(pInline.children ??= []).unshift(label)
      }

      const wrapOpen = new Token('html_block', '', 0)
      wrapOpen.content = '<div class="caption-table">\n'
      const wrapClose = new Token('html_block', '', 0)
      wrapClose.content = '</div>\n'
      tokens.splice(i + 1, 0, wrapClose)
      tokens.splice(open, 0, wrapOpen)
    }
  })
}
