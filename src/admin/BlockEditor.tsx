import type { Block, TextBlockData, ImageBlockData, ButtonBlockData, GalleryBlockData } from '../types/content'

interface BlockEditorProps {
  block: Block
  onChange: (data: Block['data']) => void
  onRemove: () => void
}

export function BlockEditor({ block, onChange, onRemove }: BlockEditorProps) {
  return (
    <div className="admin-block-editor">
      <div className="admin-block-editor-header">
        <span className="admin-block-type">{block.type}</span>
        <button type="button" onClick={onRemove}>
          Remover
        </button>
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
      <label>Título (opcional)</label>
      <input value={data.heading ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} />
      <label>Texto</label>
      <textarea value={data.body} onChange={(e) => onChange({ ...data, body: e.target.value })} />
    </div>
  )
}

function ImageBlockFields({ data, onChange }: { data: ImageBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <label>URL da imagem</label>
      <input value={data.url} onChange={(e) => onChange({ ...data, url: e.target.value })} />
      <label>Texto alternativo</label>
      <input value={data.alt} onChange={(e) => onChange({ ...data, alt: e.target.value })} />
      <label>Legenda (opcional)</label>
      <input value={data.caption ?? ''} onChange={(e) => onChange({ ...data, caption: e.target.value })} />
    </div>
  )
}

function ButtonBlockFields({ data, onChange }: { data: ButtonBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <label>Texto do botão</label>
      <input value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <label>Link</label>
      <input value={data.href} onChange={(e) => onChange({ ...data, href: e.target.value })} />
      <label>
        <input
          type="checkbox"
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
          <input placeholder="URL" value={image.url} onChange={(e) => updateImage(index, 'url', e.target.value)} />
          <input
            placeholder="Texto alternativo"
            value={image.alt}
            onChange={(e) => updateImage(index, 'alt', e.target.value)}
          />
          <button type="button" onClick={() => removeImage(index)}>
            Remover imagem
          </button>
        </div>
      ))}
      <button type="button" onClick={addImage}>
        Adicionar imagem
      </button>
    </div>
  )
}
