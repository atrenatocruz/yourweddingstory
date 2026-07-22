import type { ButtonBlockData } from '../../types/content'

export function ButtonBlockDisplay({ label, href, external }: ButtonBlockData) {
  return (
    <a
      className="block block-button cta-button"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
    </a>
  )
}
