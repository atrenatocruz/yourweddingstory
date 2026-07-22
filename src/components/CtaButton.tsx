import type { Cta } from '../content'

export function CtaButton({ label, href, external }: Cta) {
  return (
    <a
      className="cta-button"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
    </a>
  )
}
