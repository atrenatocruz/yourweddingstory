import { describe, it, expect } from 'vitest'
import { reorderBlocks } from './blockOrdering'
import type { Block } from '../types/content'

function makeBlock(id: string, position: number): Block {
  return { id, type: 'text', position, data: { body: id } }
}

describe('reorderBlocks', () => {
  it('moves a block from one index to another and reassigns positions in order', () => {
    const blocks = [makeBlock('a', 0), makeBlock('b', 1), makeBlock('c', 2)]

    const result = reorderBlocks(blocks, 0, 2)

    expect(result.map((b) => b.id)).toEqual(['b', 'c', 'a'])
    expect(result.map((b) => b.position)).toEqual([0, 1, 2])
  })

  it('moving a block to its own index leaves order unchanged', () => {
    const blocks = [makeBlock('a', 0), makeBlock('b', 1)]

    const result = reorderBlocks(blocks, 1, 1)

    expect(result.map((b) => b.id)).toEqual(['a', 'b'])
  })
})
