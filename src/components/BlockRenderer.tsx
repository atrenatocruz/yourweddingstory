import type {
  Block,
  EyebrowBlockData,
  HeadlineBlockData,
  BodyTextBlockData,
  TextBlockData,
  ImageBlockData,
  ButtonBlockData,
  GalleryBlockData,
  SocialIconsBlockData,
} from '../types/content'
import { EyebrowBlock } from './blocks/EyebrowBlock'
import { HeadlineBlock } from './blocks/HeadlineBlock'
import { BodyTextBlock } from './blocks/BodyTextBlock'
import { TextBlock } from './blocks/TextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ButtonBlockDisplay } from './blocks/ButtonBlockDisplay'
import { GalleryBlock } from './blocks/GalleryBlock'
import { SocialIconsBlock } from './blocks/SocialIconsBlock'

interface BlockRendererProps {
  blocks: Block[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'eyebrow':
            return <EyebrowBlock key={block.id} {...(block.data as EyebrowBlockData)} />
          case 'headline':
            return <HeadlineBlock key={block.id} {...(block.data as HeadlineBlockData)} />
          case 'bodytext':
            return <BodyTextBlock key={block.id} {...(block.data as BodyTextBlockData)} />
          case 'text':
            return <TextBlock key={block.id} {...(block.data as TextBlockData)} />
          case 'image':
            return <ImageBlock key={block.id} {...(block.data as ImageBlockData)} />
          case 'button':
            return <ButtonBlockDisplay key={block.id} {...(block.data as ButtonBlockData)} />
          case 'gallery':
            return <GalleryBlock key={block.id} {...(block.data as GalleryBlockData)} />
          case 'social-icons':
            return <SocialIconsBlock key={block.id} {...(block.data as SocialIconsBlockData)} />
          default:
            return null
        }
      })}
    </>
  )
}
