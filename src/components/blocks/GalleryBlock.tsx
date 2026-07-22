import type { GalleryBlockData } from '../../types/content'

export function GalleryBlock({ images }: GalleryBlockData) {
  return (
    <div className="block block-gallery">
      {images.map((image) => (
        <img key={image.url} src={image.url} alt={image.alt} />
      ))}
    </div>
  )
}
