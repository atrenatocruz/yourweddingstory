import type { EyebrowBlockData } from '../../types/content'
import { Eyebrow } from '../Eyebrow'

export function EyebrowBlock({ text }: EyebrowBlockData) {
  return <Eyebrow text={text} />
}
