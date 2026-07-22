export interface Cta {
  label: string
  href: string
  external?: boolean
}

export type BlockType =
  | 'eyebrow'
  | 'headline'
  | 'bodytext'
  | 'text'
  | 'image'
  | 'button'
  | 'gallery'
  | 'social-icons'

export interface EyebrowBlockData {
  text: string
}

export interface HeadlineBlockData {
  text: string
}

export interface BodyTextBlockData {
  text: string
}

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

export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'whatsapp'
  | 'website'
  | 'email'
  | 'pinterest'

export interface SocialIconEntry {
  platform: SocialPlatform
  href: string
}

export interface SocialIconsBlockData {
  icons: SocialIconEntry[]
}

export type BlockData =
  | EyebrowBlockData
  | HeadlineBlockData
  | BodyTextBlockData
  | TextBlockData
  | ImageBlockData
  | ButtonBlockData
  | GalleryBlockData
  | SocialIconsBlockData

export interface Block {
  id: string
  type: BlockType
  position: number
  data: BlockData
}

export interface SiteSettings {
  id: string
  heroImageUrl: string
  heroImageAlt: string
  bgColor: string
  cardColor: string
  textColor: string
}
