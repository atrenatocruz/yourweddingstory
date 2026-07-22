export interface Cta {
  label: string
  href: string
  external?: boolean
}

export type BlockType = 'text' | 'image' | 'button' | 'gallery'

export interface TextBlockData {
  heading?: string
  body: string
}

export interface ImageBlockData {
  url: string
  alt: string
  caption?: string
}

export interface ButtonBlockData {
  label: string
  href: string
  external?: boolean
}

export interface GalleryBlockData {
  images: { url: string; alt: string }[]
}

export type BlockData = TextBlockData | ImageBlockData | ButtonBlockData | GalleryBlockData

export interface Block {
  id: string
  type: BlockType
  position: number
  data: BlockData
}

export interface SiteSettings {
  id: string
  eyebrow: string
  headline: string
  body: string
  heroImageUrl: string
  heroImageAlt: string
  cta1Label: string
  cta1Href: string
  cta1External: boolean
  cta2Label: string
  cta2Href: string
  emailHref: string
  instagramHref: string
}
