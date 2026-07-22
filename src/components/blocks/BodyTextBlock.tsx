import type { BodyTextBlockData } from '../../types/content'
import { BodyText } from '../BodyText'

export function BodyTextBlock({ text }: BodyTextBlockData) {
  return <BodyText text={text} />
}
