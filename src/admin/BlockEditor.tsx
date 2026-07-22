import type { Block, TextBlockData, ImageBlockData, ButtonBlockData, GalleryBlockData } from '../types/content'
import { TallyDot } from './TallyDot'
import { TextBlockIcon, ImageBlockIcon, ButtonBlockIcon, GalleryBlockIcon } from './icons'

interface BlockEditorProps {
  block: Block
  saving?: boolean
  onChange: (data: Block['data']) => void
  onRemove: () => void
}

const typeLabels: Record<Block['type'], string> = {
  text: 'Texto',
  image: 'Imagem',
  button: 'Botão',
  gallery: 'Galeria',
}

const typeIcons: Record<Block['type'], JSX.Element> = {
  text: <TextBlockIcon />,
  image: <ImageBlockIcon />,
  button: <ButtonBlockIcon />,
  gallery: <GalleryBlockIcon />,
}

export function BlockEditor({ block, saving = false, onChange, onRemove }: BlockEditorProps) {
  return (
    <div className="admin-block-editor">
      <div className="admin-block-editor-header">
        <span className="admin-block-type-chip">
          {typeIcons[block.type]}
          {typeLabels[block.type]}
        </span>
        <div className="admin-block-header-right">
          <TallyDot status={saving ? 'saving' : 'idle'} showLabel={false} />
          <button type="button" className="admin-ghost-button" onClick={onRemove}>
            Remover
          </button>
        </div>
      </div>
      {block.type === 'text' && <TextBlockFields data={block.data as TextBlockData} onChange={onChange} />}
      {block.type === 'image' && <ImageBlockFields data={block.data as ImageBlockData} onChange={onChange} />}
      {block.type === 'button' && <ButtonBlockFields data={block.data as ButtonBlockData} onChange={onChange} />}
      {block.type === 'gallery' && <GalleryBlockFields data={block.data as GalleryBlockData} onChange={onChange} />}
    </div>
  )
}

function TextBlockFields({ data, onChange }: { data: TextBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <div className="admin-field">
        <label>Título (opcional)</label>
        <input
          className="admin-input"
          value={data.heading ?? ''}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
        />
      </div>
      <div className="admin-field">
        <label>Texto</label>
        <textarea
          className="admin-textarea"
          value={data.body}
          onChange={(e) => onChange({ ...data, body: e.target.value })}
        />
      </div>
    </div>
  )
}

function ImageBlockFields({ data, onChange }: { data: ImageBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <div className="admin-field">
        <label>URL da imagem</label>
        <input className="admin-input" value={data.url} onChange={(e) => onChange({ ...data, url: e.target.value })} />
      </div>
      <div className="admin-field">
        <label>Texto alternativo</label>
        <input className="admin-input" value={data.alt} onChange={(e) => onChange({ ...data, alt: e.target.value })} />
      </div>
      <div className="admin-field">
        <label>Legenda (opcional)</label>
        <input
          className="admin-input"
          value={data.caption ?? ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
        />
      </div>
    </div>
  )
}

function ButtonBlockFields({ data, onChange }: { data: ButtonBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <div className="admin-field">
        <label>Texto do botão</label>
        <input
          className="admin-input"
          value={data.label}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
        />
      </div>
      <div className="admin-field">
        <label>Link</label>
        <input className="admin-input" value={data.href} onChange={(e) => onChange({ ...data, href: e.target.value })} />
      </div>
      <label className="admin-checkbox-label">
        <input
          type="checkbox"
          className="admin-checkbox"
          checked={data.external ?? false}
          onChange={(e) => onChange({ ...data, external: e.target.checked })}
        />
        Abrir em nova aba
      </label>
    </div>
  )
}

function GalleryBlockFields({ data, onChange }: { data: GalleryBlockData; onChange: (data: Block['data']) => void }) {
  function updateImage(index: number, field: 'url' | 'alt', value: string) {
    const images = data.images.map((image, i) => (i === index ? { ...image, [field]: value } : image))
    onChange({ images })
  }

  function addImage() {
    onChange({ images: [...data.images, { url: '', alt: '' }] })
  }

  function removeImage(index: number) {
    onChange({ images: data.images.filter((_, i) => i !== index) })
  }

  return (
    <div className="admin-block-fields">
      {data.images.map((image, index) => (
        <div key={index} className="admin-gallery-image-row">
          <input
            className="admin-input"
            placeholder="URL"
            value={image.url}
            onChange={(e) => updateImage(index, 'url', e.target.value)}
          />
          <input
            className="admin-input"
            placeholder="Texto alternativo"
            value={image.alt}
            onChange={(e) => updateImage(index, 'alt', e.target.value)}
          />
          <button type="button" className="admin-ghost-button" onClick={() => removeImage(index)}>
            Remover imagem
          </button>
        </div>
      ))}
      <button type="button" className="admin-pill-button" onClick={addImage}>
        Adicionar imagem
      </button>
    </div>
  )
}
