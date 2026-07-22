import type { SocialIconsBlockData } from '../../types/content'
import { SocialIcons } from '../SocialIcons'

export function SocialIconsBlock({ icons }: SocialIconsBlockData) {
  return <SocialIcons icons={icons} />
}
