import type { CSSProperties } from 'react'
import { useSiteContent } from './hooks/useSiteContent'
import { HeroImage } from './components/HeroImage'
import { BlockRenderer } from './components/BlockRenderer'

export function PublicSite() {
  const { settings, blocks, loading, error } = useSiteContent()

  if (loading) {
    return <div className="page" />
  }

  if (error || !settings) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-content">
            <p className="body-text">Conteúdo indisponível de momento.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
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
  )
}
