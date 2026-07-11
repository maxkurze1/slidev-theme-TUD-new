declare module '@slidev/client'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.svg?raw' {
  const src: string
  export default src
}

declare module '*.ico?url' {
  const src: string
  export default src
}

declare module '*.png?url' {
  const src: string
  export default src
}
