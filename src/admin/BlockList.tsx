import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import { reorderBlocks } from '../lib/blockOrdering'
import { BlockEditor } from './BlockEditor'
import { TallyDot } from './TallyDot'
import { DragHandleIcon } from './icons'
import type { Block, BlockType } from '../types/content'

interface BlockListProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  onSavingChange?: (saving: boolean) => void
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

export function BlockList({ blocks, onChange, onSavingChange }: BlockListProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const [saveError, setSaveError] = useState<string | null>(null)
  // Purely observational: tracks which block ids currently have a write in
  // flight so the UI can show a per-card (and aggregate) "saving" tally dot.
  // Does not participate in commitBlockData's own serialization.
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [reordering, setReordering] = useState(false)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  // One promise chain per block id: guarantees writes for the same block are
  // sent to the server strictly one-at-a-time, in call order. Debouncing alone
  // only reduces how often a write fires -- two writes fired far enough apart
  // to both survive debounce could still be in flight at once and let an
  // out-of-order server response overwrite a newer value. Chaining removes
  // that possibility entirely: the next write is never sent until the
  // previous one has finished.
  const writeChains = useRef<Record<string, Promise<unknown>>>({})

  useEffect(() => {
    const timers = debounceTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    onSavingChange?.(reordering || savingIds.size > 0)
  }, [reordering, savingIds, onSavingChange])

  function markSaving(id: string) {
    setSavingIds((prev) => new Set(prev).add(id))
  }

  function clearSaving(id: string) {
    setSavingIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function commitBlockData(id: string, data: Block['data']) {
    const previous = writeChains.current[id] ?? Promise.resolve()
    const next = previous
      .catch(() => {})
      .then(() => supabase.from('blocks').update({ data }).eq('id', id))
      .then((result) => {
        setSaveError(result.error ? 'Não foi possível gravar a secção. Tenta novamente.' : null)
      })
      .catch(() => {
        // Only reached if the update call itself throws (e.g. a network
        // exception, not a {error} response). Swallow so this rejection
        // doesn't surface as an unhandled rejection if no further edit for
        // this block ever chains onto it; the next commit's own .catch (line
        // above) already tolerates a rejected `previous`.
      })
    writeChains.current[id] = next
    return next
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = blocks.findIndex((b) => b.id === active.id)
    const toIndex = blocks.findIndex((b) => b.id === over.id)
    const reordered = reorderBlocks(blocks, fromIndex, toIndex)
    onChange(reordered)

    setReordering(true)
    const results = await Promise.all(
      reordered.map((block) => supabase.from('blocks').update({ position: block.position }).eq('id', block.id))
    )
    setReordering(false)
    setSaveError(results.some((r) => r.error) ? 'Não foi possível gravar a nova ordem. Tenta novamente.' : null)
  }

  function handleBlockChange(id: string, data: Block['data']) {
    const updated = blocks.map((block) => (block.id === id ? { ...block, data } : block))
    onChange(updated)

    // Debounce so a fast typing burst coalesces into one write instead of one
    // per keystroke; commitBlockData then guarantees that write (and any other
    // pending write for this same block) is sent strictly after the previous
    // one completes, so the server always processes them in the right order.
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id])
    }
    debounceTimers.current[id] = setTimeout(() => {
      delete debounceTimers.current[id]
      markSaving(id)
      commitBlockData(id, data).finally(() => clearSaving(id))
    }, 500)
  }

  async function handleRemove(id: string) {
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id])
      delete debounceTimers.current[id]
    }
    onChange(blocks.filter((block) => block.id !== id))
    const previous = writeChains.current[id] ?? Promise.resolve()
    const { error } = await previous.catch(() => {}).then(() => supabase.from('blocks').delete().eq('id', id))
    delete writeChains.current[id]
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
      <h2 className="admin-section-title">Secções</h2>
      {saveError && <p className="admin-field-error">{saveError}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="admin-sortable-list">
            {blocks.map((block) => (
              <SortableBlockRow
                key={block.id}
                block={block}
                saving={savingIds.has(block.id)}
                onChange={handleBlockChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="admin-add-block">
        <button type="button" className="admin-pill-button" onClick={() => handleAdd('text')}>
          + Texto
        </button>
        <button type="button" className="admin-pill-button" onClick={() => handleAdd('image')}>
          + Imagem
        </button>
        <button type="button" className="admin-pill-button" onClick={() => handleAdd('button')}>
          + Botão
        </button>
        <button type="button" className="admin-pill-button" onClick={() => handleAdd('gallery')}>
          + Galeria
        </button>
      </div>
    </div>
  )
}

function SortableBlockRow({
  block,
  saving,
  onChange,
  onRemove,
}: {
  block: Block
  saving: boolean
  onChange: (id: string, data: Block['data']) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-sortable-block${isDragging ? ' is-dragging' : ''}`}
    >
      <div className="admin-drag-handle" {...attributes} {...listeners}>
        <DragHandleIcon />
      </div>
      <BlockEditor
        block={block}
        saving={saving}
        onChange={(data) => onChange(block.id, data)}
        onRemove={() => onRemove(block.id)}
      />
    </div>
  )
}
