import type { TextBlockData } from '../../types/content'

export function TextBlock({ heading, body }: TextBlockData) {
  return (
    <div className="block block-text">
      {heading && <h3 className="block-text-heading">{heading}</h3>}
      <p className="block-text-body">{body}</p>
    </div>
  )
}
