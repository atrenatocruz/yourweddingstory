interface HeadlineProps {
  text: string
}

export function Headline({ text }: HeadlineProps) {
  return <h2 className="headline">{text}</h2>
}
