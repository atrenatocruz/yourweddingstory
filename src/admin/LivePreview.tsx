import { Eyebrow } from '../components/Eyebrow'
import { Headline } from '../components/Headline'
import { BodyText } from '../components/BodyText'
import { HeroImage } from '../components/HeroImage'
import { CtaButton } from '../components/CtaButton'
import { SocialIcons } from '../components/SocialIcons'
import { BlockRenderer } from '../components/BlockRenderer'
import type { SiteSettings, Block } from '../types/content'

interface LivePreviewProps {
  settings: SiteSettings
  blocks: Block[]
}

export function LivePreview({ settings, blocks }: LivePreviewProps) {
  return (
    <div className="admin-live-preview">
      <div className="page">
        <div className="card">
          <HeroImage src={settings.heroImageUrl} alt={settings.heroImageAlt} />
          <div className="card-content">
            <Eyebrow text={settings.eyebrow} />
            <Headline text={settings.headline} />
            <BodyText text={settings.body} />
            <div className="cta-group">
              <CtaButton label={settings.cta1Label} href={settings.cta1Href} external={settings.cta1External} />
              <CtaButton label={settings.cta2Label} href={settings.cta2Href} />
            </div>
            <SocialIcons emailHref={settings.emailHref} instagramHref={settings.instagramHref} />
            {blocks.length > 0 && (
              <div className="blocks">
                <BlockRenderer blocks={blocks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
