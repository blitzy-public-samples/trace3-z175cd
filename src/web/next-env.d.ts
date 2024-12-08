/// <reference types="next" />  // next v13.x
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation-types/navigation" />
/// <reference types="@types/node" />  // @types/node v18.x

// Requirement: TypeScript Compatibility
// Location: System Design/Programming Languages/Frontend
// Description: Ensures that the frontend application is compatible with TypeScript 
// by providing necessary type declarations for Next.js.

// Augment the process.env type to include Next.js environment variables
declare namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly NEXT_PUBLIC_API_URL: string
    readonly NEXT_PUBLIC_BASE_URL: string
  }
}

// Ensure TypeScript recognizes static file imports
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}

// Ensure TypeScript recognizes module aliases from tsconfig.json
declare module '@components/*'
declare module '@utils/*'
declare module '@types/*'
declare module '@store/*'

// Add support for importing CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Ensure Next.js specific types are available globally
declare type NextPage<P = {}, IP = P> = import('next').NextPage<P, IP>
declare type GetLayout = (page: React.ReactElement) => React.ReactNode
declare type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: GetLayout
}

// Add support for metadata API types
declare interface Metadata {
  title?: string
  description?: string
  keywords?: string
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
}