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
  SocialPlatform,
} from '../types/content'
import { TallyDot } from './TallyDot'
import {
  TextBlockIcon,
  ImageBlockIcon,
  ButtonBlockIcon,
  GalleryBlockIcon,
  EyebrowBlockIcon,
  HeadlineBlockIcon,
  SocialIconsBlockIcon,
} from './icons'

interface BlockEditorProps {
  block: Block
  saving?: boolean
  onChange: (data: Block['data']) => void
  onRemove: () => void
}

const typeLabels: Record<Block['type'], string> = {
  eyebrow: 'Eyebrow',
  headline: 'Título',
  bodytext: 'Texto principal',
  text: 'Texto',
  image: 'Imagem',
  button: 'Botão',
  gallery: 'Galeria',
  'social-icons': 'Ícones sociais',
}

const typeIcons: Record<Block['type'], JSX.Element> = {
  eyebrow: <EyebrowBlockIcon />,
  headline: <HeadlineBlockIcon />,
  bodytext: <TextBlockIcon />,
  text: <TextBlockIcon />,
  image: <ImageBlockIcon />,
  button: <ButtonBlockIcon />,
  gallery: <GalleryBlockIcon />,
  'social-icons': <SocialIconsBlockIcon />,
}

const socialPlatformOptions: { value: SocialPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'pinterest', label: 'Pinterest' },
]

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
      {block.type === 'eyebrow' && <EyebrowBlockFields data={block.data as EyebrowBlockData} onChange={onChange} />}
      {block.type === 'headline' && <HeadlineBlockFields data={block.data as HeadlineBlockData} onChange={onChange} />}
      {block.type === 'bodytext' && <BodyTextBlockFields data={block.data as BodyTextBlockData} onChange={onChange} />}
      {block.type === 'text' && <TextBlockFields data={block.data as TextBlockData} onChange={onChange} />}
      {block.type === 'image' && <ImageBlockFields data={block.data as ImageBlockData} onChange={onChange} />}
      {block.type === 'button' && <ButtonBlockFields data={block.data as ButtonBlockData} onChange={onChange} />}
      {block.type === 'gallery' && <GalleryBlockFields data={block.data as GalleryBlockData} onChange={onChange} />}
      {block.type === 'social-icons' && (
        <SocialIconsBlockFields data={block.data as SocialIconsBlockData} onChange={onChange} />
      )}
    </div>
  )
}

function EyebrowBlockFields({ data, onChange }: { data: EyebrowBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <div className="admin-field">
        <label>Texto</label>
        <input
          className="admin-input"
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
        />
      </div>
    </div>
  )
}

function HeadlineBlockFields({ data, onChange }: { data: HeadlineBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <div className="admin-field">
        <label>Texto</label>
        <input
          className="admin-input"
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
        />
      </div>
    </div>
  )
}

function BodyTextBlockFields({ data, onChange }: { data: BodyTextBlockData; onChange: (data: Block['data']) => void }) {
  return (
    <div className="admin-block-fields">
      <div className="admin-field">
        <label>Texto</label>
        <textarea
          className="admin-textarea"
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
        />
      </div>
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

function SocialIconsBlockFields({
  data,
  onChange,
}: {
  data: SocialIconsBlockData
  onChange: (data: Block['data']) => void
}) {
  function updateIcon(index: number, field: 'platform' | 'href', value: string) {
    const icons = data.icons.map((icon, i) => (i === index ? { ...icon, [field]: value } : icon))
    onChange({ icons })
  }

  function addIcon() {
    onChange({ icons: [...data.icons, { platform: 'instagram', href: '' }] })
  }

  function removeIcon(index: number) {
    onChange({ icons: data.icons.filter((_, i) => i !== index) })
  }

  return (
    <div className="admin-block-fields">
      {data.icons.map((icon, index) => (
        <div key={index} className="admin-social-icon-row">
          <select
            className="admin-input"
            value={icon.platform}
            onChange={(e) => updateIcon(index, 'platform', e.target.value)}
          >
            {socialPlatformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className="admin-input"
            placeholder="Link"
            style={{ flex: 1 }}
            value={icon.href}
            onChange={(e) => updateIcon(index, 'href', e.target.value)}
          />
          <button type="button" className="admin-ghost-button" onClick={() => removeIcon(index)}>
            Remover ícone
          </button>
        </div>
      ))}
      <button type="button" className="admin-pill-button" onClick={addIcon}>
        + Adicionar ícone
      </button>
    </div>
  )
}
