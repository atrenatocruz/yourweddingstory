import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import { TallyDot } from './TallyDot'
import { DragHandleIcon } from './icons'
import type { ContactFormField, ContactFieldType } from '../types/content'

interface ContactFormFieldsEditorProps {
  fields: ContactFormField[]
  onChange: (fields: ContactFormField[]) => void
  onSavingChange?: (saving: boolean) => void
}

const typeLabels: Record<ContactFieldType, string> = {
  text: 'Texto',
  email: 'Email',
  tel: 'Telefone',
  date: 'Data',
  number: 'Número',
  textarea: 'Área de texto',
}

function reorderFields(fields: ContactFormField[], fromIndex: number, toIndex: number): ContactFormField[] {
  const reordered = [...fields]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  return reordered.map((field, index) => ({ ...field, position: index }))
}

export function ContactFormFieldsEditor({ fields, onChange, onSavingChange }: ContactFormFieldsEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [reordering, setReordering] = useState(false)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  // Same per-field write-chain pattern as BlockList: debounce alone only
  // reduces how often a write fires, it doesn't stop two surviving writes
  // from being in flight at once. Chaining guarantees the server always
  // processes a field's writes in the order they were made.
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

  function commitField(id: string, patch: Partial<ContactFormField>) {
    const previous = writeChains.current[id] ?? Promise.resolve()
    const next = previous
      .catch(() => {})
      .then(() =>
        supabase
          .from('contact_form_fields')
          .update({
            label: patch.label,
            type: patch.type,
            required: patch.required,
            placeholder: patch.placeholder,
          })
          .eq('id', id)
      )
      .then((result) => {
        setSaveError(result.error ? 'Não foi possível gravar o campo. Tenta novamente.' : null)
      })
      .catch(() => {})
    writeChains.current[id] = next
    return next
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = fields.findIndex((f) => f.id === active.id)
    const toIndex = fields.findIndex((f) => f.id === over.id)
    const reordered = reorderFields(fields, fromIndex, toIndex)
    onChange(reordered)

    setReordering(true)
    const results = await Promise.all(
      reordered.map((field) =>
        supabase.from('contact_form_fields').update({ position: field.position }).eq('id', field.id)
      )
    )
    setReordering(false)
    setSaveError(results.some((r) => r.error) ? 'Não foi possível gravar a nova ordem. Tenta novamente.' : null)
  }

  function handleFieldChange(id: string, patch: Partial<ContactFormField>) {
    const updated = fields.map((field) => (field.id === id ? { ...field, ...patch } : field))
    onChange(updated)

    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id])
    }
    debounceTimers.current[id] = setTimeout(() => {
      delete debounceTimers.current[id]
      const current = updated.find((field) => field.id === id)
      if (!current) return
      markSaving(id)
      commitField(id, current).finally(() => clearSaving(id))
    }, 500)
  }

  async function handleRemove(id: string) {
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id])
      delete debounceTimers.current[id]
    }
    onChange(fields.filter((field) => field.id !== id))
    const previous = writeChains.current[id] ?? Promise.resolve()
    const { error } = await previous
      .catch(() => {})
      .then(() => supabase.from('contact_form_fields').delete().eq('id', id))
    delete writeChains.current[id]
    setSaveError(error ? 'Não foi possível remover o campo. Tenta novamente.' : null)
  }

  async function handleAdd() {
    const position = fields.reduce((max, field) => Math.max(max, field.position), -1) + 1
    const { data, error } = await supabase
      .from('contact_form_fields')
      .insert({ position, label: 'Novo campo', type: 'text', required: false, placeholder: null })
      .select('id, position, label, type, required, placeholder')
      .single()

    if (error || !data) {
      setSaveError('Não foi possível adicionar o campo. Tenta novamente.')
      return
    }

    setSaveError(null)
    onChange([...fields, data as unknown as ContactFormField])
  }

  return (
    <div className="admin-block-list">
      <h2 className="admin-section-title">Formulário de Contacto</h2>
      {saveError && <p className="admin-field-error">{saveError}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="admin-sortable-list">
            {fields.map((field) => (
              <SortableFieldRow
                key={field.id}
                field={field}
                saving={savingIds.has(field.id)}
                onChange={handleFieldChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="admin-add-block">
        <button type="button" className="admin-pill-button" onClick={handleAdd}>
          + Adicionar campo
        </button>
      </div>
    </div>
  )
}

function SortableFieldRow({
  field,
  saving,
  onChange,
  onRemove,
}: {
  field: ContactFormField
  saving: boolean
  onChange: (id: string, patch: Partial<ContactFormField>) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={`admin-sortable-block${isDragging ? ' is-dragging' : ''}`}>
      <div className="admin-drag-handle" {...attributes} {...listeners}>
        <DragHandleIcon />
      </div>
      <div className="admin-block-editor">
        <div className="admin-block-editor-header">
          <span className="admin-block-type-chip">{typeLabels[field.type]}</span>
          <div className="admin-block-header-right">
            {saving && <TallyDot status="saving" showLabel={false} />}
            <button type="button" className="admin-ghost-button" onClick={() => onRemove(field.id)}>
              Remover
            </button>
          </div>
        </div>
        <div className="admin-block-fields">
          <div className="admin-field">
            <label>Tipo</label>
            <select
              className="admin-input"
              value={field.type}
              onChange={(e) => onChange(field.id, { type: e.target.value as ContactFieldType })}
            >
              {(Object.keys(typeLabels) as ContactFieldType[]).map((type) => (
                <option key={type} value={type}>
                  {typeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label>Label</label>
            <input
              className="admin-input"
              value={field.label}
              onChange={(e) => onChange(field.id, { label: e.target.value })}
            />
          </div>

          <div className="admin-field">
            <label>Placeholder (opcional)</label>
            <input
              className="admin-input"
              value={field.placeholder ?? ''}
              onChange={(e) => onChange(field.id, { placeholder: e.target.value || null })}
            />
          </div>

          <label className="admin-checkbox-label">
            <input
              type="checkbox"
              className="admin-checkbox"
              checked={field.required}
              onChange={(e) => onChange(field.id, { required: e.target.checked })}
            />
            Obrigatório
          </label>
        </div>
      </div>
    </div>
  )
}
