import { content } from './content'
import { Eyebrow } from './components/Eyebrow'
import { Headline } from './components/Headline'
import { BodyText } from './components/BodyText'
import { HeroImage } from './components/HeroImage'
import { CtaButton } from './components/CtaButton'
import { SocialIcons } from './components/SocialIcons'

function App() {
  return (
    <div className="page">
      <div className="card">
        <HeroImage src={content.heroImageUrl} alt={content.heroImageAlt} />
        <div className="card-content">
          <Eyebrow text={content.eyebrow} />
          <Headline text={content.headline} />
          <BodyText text={content.body} />
          <div className="cta-group">
            {content.ctas.map((cta) => (
              <CtaButton key={cta.label} {...cta} />
            ))}
          </div>
          <SocialIcons
            emailHref={content.social.emailHref}
            instagramHref={content.social.instagramHref}
          />
        </div>
      </div>
    </div>
  )
}

export default App
