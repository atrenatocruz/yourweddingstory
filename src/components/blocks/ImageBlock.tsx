import type { ImageBlockData } from '../../types/content'

export function ImageBlock({ url, alt, caption }: ImageBlockData) {
  return (
    <figure className="block block-image">
      <img src={url} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
