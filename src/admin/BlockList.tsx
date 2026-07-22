import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import { reorderBlocks } from '../lib/blockOrdering'
import { BlockEditor } from './BlockEditor'
import type { Block, BlockType } from '../types/content'

interface BlockListProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

function defaultDataFor(type: BlockType): Block['data'] {
  switch (type) {
    case 'text':
      return { body: '' }
    case 'image':
      return { url: '', alt: '' }
    case 'button':
      return { label: '', href: '' }
    case 'gallery':
      return { images: [] }
  }
}

export function BlockList({ blocks, onChange }: BlockListProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = blocks.findIndex((b) => b.id === active.id)
    const toIndex = blocks.findIndex((b) => b.id === over.id)
    const reordered = reorderBlocks(blocks, fromIndex, toIndex)
    onChange(reordered)

    const results = await Promise.all(
      reordered.map((block) => supabase.from('blocks').update({ position: block.position }).eq('id', block.id))
    )
    setSaveError(results.some((r) => r.error) ? 'Não foi possível gravar a nova ordem. Tenta novamente.' : null)
  }

  async function handleBlockChange(id: string, data: Block['data']) {
    const updated = blocks.map((block) => (block.id === id ? { ...block, data } : block))
    onChange(updated)
    const { error } = await supabase.from('blocks').update({ data }).eq('id', id)
    setSaveError(error ? 'Não foi possível gravar a secção. Tenta novamente.' : null)
  }

  async function handleRemove(id: string) {
    onChange(blocks.filter((block) => block.id !== id))
    const { error } = await supabase.from('blocks').delete().eq('id', id)
    setSaveError(error ? 'Não foi possível remover a secção. Tenta novamente.' : null)
  }

  async function handleAdd(type: BlockType) {
    const position = blocks.reduce((max, block) => Math.max(max, block.position), -1) + 1
    const { data, error } = await supabase
      .from('blocks')
      .insert({ type, position, data: defaultDataFor(type) })
      .select('id, type, position, data')
      .single()

    if (error || !data) {
      setSaveError('Não foi possível adicionar a secção. Tenta novamente.')
      return
    }

    setSaveError(null)
    onChange([...blocks, data as unknown as Block])
  }

  return (
    <div className="admin-block-list">
      <h2>Secções</h2>
      {saveError && <p className="admin-field-error">{saveError}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlockRow key={block.id} block={block} onChange={handleBlockChange} onRemove={handleRemove} />
          ))}
        </SortableContext>
      </DndContext>
      <div className="admin-add-block">
        <button type="button" onClick={() => handleAdd('text')}>
          + Texto
        </button>
        <button type="button" onClick={() => handleAdd('image')}>
          + Imagem
        </button>
        <button type="button" onClick={() => handleAdd('button')}>
          + Botão
        </button>
        <button type="button" onClick={() => handleAdd('gallery')}>
          + Galeria
        </button>
      </div>
    </div>
  )
}

function SortableBlockRow({
  block,
  onChange,
  onRemove,
}: {
  block: Block
  onChange: (id: string, data: Block['data']) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="admin-sortable-block">
      <div className="admin-drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>
      <BlockEditor block={block} onChange={(data) => onChange(block.id, data)} onRemove={() => onRemove(block.id)} />
    </div>
  )
}
