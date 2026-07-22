import type { Block } from '../types/content'

export function reorderBlocks(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  const reordered = [...blocks]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  return reordered.map((block, index) => ({ ...block, position: index }))
}
