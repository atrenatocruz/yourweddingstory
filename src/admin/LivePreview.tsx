import type { CSSProperties } from 'react'
import { HeroImage } from '../components/HeroImage'
import { BlockRenderer } from '../components/BlockRenderer'
import type { SiteSettings, Block } from '../types/content'

interface LivePreviewProps {
  settings: SiteSettings
  blocks: Block[]
}

export function LivePreview({ settings, blocks }: LivePreviewProps) {
  return (
    <div className="admin-live-preview">
      <div
        className="page"
        style={
          {
            '--color-bg': settings.bgColor,
            '--color-card': settings.cardColor,
            '--color-text': settings.textColor,
          } as CSSProperties
        }
      >
        <div className="card">
          <HeroImage src={settings.heroImageUrl} alt={settings.heroImageAlt} />
          <div className="card-content">
            <BlockRenderer blocks={blocks} />
          </div>
        </div>
      </div>
    </div>
  )
}
