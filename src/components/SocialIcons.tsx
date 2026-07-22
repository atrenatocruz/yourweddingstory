import type { SocialIconEntry, SocialPlatform } from '../types/content'

interface SocialIconsProps {
  icons: SocialIconEntry[]
}

const platformLabels: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  website: 'Website',
  email: 'Email',
  pinterest: 'Pinterest',
}

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'email':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 6 10 7 10-7" />
        </svg>
      )
    case 'instagram':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3c0 2.76 2.24 5 5 5" />
        </svg>
      )
    case 'facebook':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 22v-8h3l.5-4H15V7.5c0-1.1.3-1.9 1.9-1.9H18V2.1C17.7 2 16.6 2 15.4 2 12.9 2 11 3.5 11 6.3V10H8v4h3v8z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="M10 9.5v5l4.5-2.5z" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 20l1.3-4A8 8 0 1 1 8.5 19z" />
          <path d="M8.5 9.5c0 3 2.5 5.5 5.5 5.5.7 0 1-.6.7-1.2l-.5-1a1 1 0 0 0-1-.5l-1 .2a5 5 0 0 1-2.7-2.7l.2-1a1 1 0 0 0-.5-1l-1-.5c-.6-.3-1.2 0-1.2.7z" />
        </svg>
      )
    case 'website':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      )
    case 'pinterest':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.5 18c.5-2 1.2-4.7 1.7-6.7a2.5 2.5 0 0 1 4.9.7c0 2-1.3 3.7-3 3.7-.8 0-1.4-.4-1.6-1" />
          <path d="M11 8.5a2.5 2.5 0 0 1 4.9 1" />
        </svg>
      )
  }
}

function isExternal(platform: SocialPlatform): boolean {
  return platform !== 'email'
}

export function SocialIcons({ icons }: SocialIconsProps) {
  return (
    <div className="social-icons">
      {icons.map((icon, index) => (
        <a
          key={`${icon.platform}-${index}`}
          className="social-icon-link"
          href={icon.href}
          target={isExternal(icon.platform) ? '_blank' : undefined}
          rel={isExternal(icon.platform) ? 'noopener noreferrer' : undefined}
          aria-label={platformLabels[icon.platform]}
        >
          <PlatformIcon platform={icon.platform} />
        </a>
      ))}
    </div>
  )
}
