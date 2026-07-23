import { CONTACT_FORM_HREF, type ButtonBlockData } from '../../types/content'

export function ButtonBlockDisplay({ label, href, external }: ButtonBlockData) {
  if (href === CONTACT_FORM_HREF) {
    return (
      <button
        type="button"
        className="block block-button cta-button"
        onClick={() => window.dispatchEvent(new Event('open-contact-form'))}
      >
        {label}
      </button>
    )
  }

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
