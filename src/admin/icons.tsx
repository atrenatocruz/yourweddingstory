// Small inline line icons used to differentiate block-type chips (icon, not
// color, per the design plan) and the drag handle.

export function TextBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="10" y2="12" />
    </svg>
  )
}

export function ImageBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <circle cx="5.5" cy="6.5" r="1.1" />
      <path d="M2 11.5 6 8l2.5 2.5L11 8l3 3.5" strokeLinecap="round" />
    </svg>
  )
}

export function ButtonBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="5.5" width="12" height="5" rx="2.5" />
    </svg>
  )
}

export function GalleryBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="2" width="5" height="5" rx="0.8" />
      <rect x="9" y="2" width="5" height="5" rx="0.8" />
      <rect x="2" y="9" width="5" height="5" rx="0.8" />
      <rect x="9" y="9" width="5" height="5" rx="0.8" />
    </svg>
  )
}

export function EyebrowBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="3" y1="3" x2="9" y2="3" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  )
}

export function HeadlineBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
      <line x1="2" y1="5" x2="14" y2="5" />
      <line x1="2" y1="11" x2="10" y2="11" />
    </svg>
  )
}

export function SocialIconsBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <line x1="6" y1="9" x2="12" y2="4" />
      <line x1="6" y1="9" x2="13" y2="11" />
      <circle cx="6" cy="9" r="3.2" />
      <circle cx="12" cy="4" r="1.6" />
      <circle cx="13" cy="11" r="1.6" />
    </svg>
  )
}

export function DragHandleIcon() {
  return (
    <svg viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="1" y1="1.5" x2="15" y2="1.5" />
      <line x1="1" y1="6" x2="15" y2="6" />
      <line x1="1" y1="10.5" x2="15" y2="10.5" />
    </svg>
  )
}
