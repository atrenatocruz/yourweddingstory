interface HeroImageProps {
  src: string
  alt: string
}

export function HeroImage({ src, alt }: HeroImageProps) {
  return <img className="hero-image" src={src} alt={alt} />
}
