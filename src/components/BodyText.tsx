interface BodyTextProps {
  text: string
}

export function BodyText({ text }: BodyTextProps) {
  return <p className="body-text">{text}</p>
}
