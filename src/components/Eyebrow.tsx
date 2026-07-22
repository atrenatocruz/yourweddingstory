interface EyebrowProps {
  text: string
}

export function Eyebrow({ text }: EyebrowProps) {
  return <h1 className="eyebrow">{text}</h1>
}
