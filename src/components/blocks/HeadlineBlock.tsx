import type { HeadlineBlockData } from '../../types/content'
import { Headline } from '../Headline'

export function HeadlineBlock({ text }: HeadlineBlockData) {
  return <Headline text={text} />
}
