import type { Block, TextBlockData, ImageBlockData, ButtonBlockData, GalleryBlockData } from '../types/content'
import { TextBlock } from './blocks/TextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ButtonBlockDisplay } from './blocks/ButtonBlockDisplay'
import { GalleryBlock } from './blocks/GalleryBlock'

interface BlockRendererProps {
  blocks: Block[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id} {...(block.data as TextBlockData)} />
          case 'image':
            return <ImageBlock key={block.id} {...(block.data as ImageBlockData)} />
          case 'button':
            return <ButtonBlockDisplay key={block.id} {...(block.data as ButtonBlockData)} />
          case 'gallery':
            return <GalleryBlock key={block.id} {...(block.data as GalleryBlockData)} />
          default:
            return null
        }
      })}
    </>
  )
}
