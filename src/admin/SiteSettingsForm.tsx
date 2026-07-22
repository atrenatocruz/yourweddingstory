import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { SiteSettings } from '../types/content'

interface SiteSettingsFormProps {
  settings: SiteSettings
  onChange: (settings: SiteSettings) => void
  onSavingChange?: (saving: boolean) => void
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function SiteSettingsForm({ settings, onChange, onSavingChange }: SiteSettingsFormProps) {
  const [draft, setDraft] = useState<SiteSettings>(settings)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Observe the existing saving state to drive the tally-dot indicator; this
  // does not change when/how the form actually saves.
  useEffect(() => {
    onSavingChange?.(saving)
  }, [saving, onSavingChange])

  function updateField<K extends keyof SiteSettings>(field: K, value: SiteSettings[K]) {
    const next = { ...draft, [field]: value }
    setDraft(next)
    onChange(next)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setSaving(true)
    setSaveError(null)

    const { error } = await supabase
      .from('site_settings')
      .update({
        hero_image_url: draft.heroImageUrl,
        hero_image_alt: draft.heroImageAlt,
        bg_color: draft.bgColor,
        card_color: draft.cardColor,
        text_color: draft.textColor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', draft.id)

    setSaving(false)

    if (error) {
      setSaveError('Não foi possível gravar. Tenta novamente.')
    }
  }

  return (
    <form className="admin-settings-form" onSubmit={handleSubmit}>
      <h2 className="admin-section-title">Conteúdo principal</h2>

      <div className="admin-fieldset">
        <div className="admin-field">
          <label htmlFor="heroImageUrl">Imagem de topo (URL)</label>
          <input
            id="heroImageUrl"
            className="admin-input"
            value={draft.heroImageUrl}
            onChange={(e) => updateField('heroImageUrl', e.target.value)}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="heroImageAlt">Imagem de topo (texto alternativo)</label>
          <input
            id="heroImageAlt"
            className="admin-input"
            value={draft.heroImageAlt}
            onChange={(e) => updateField('heroImageAlt', e.target.value)}
          />
        </div>
      </div>

      <h2 className="admin-section-title">Aparência</h2>

      <div className="admin-fieldset">
        <ColorField
          label="Cor de fundo"
          value={draft.bgColor}
          onChange={(value) => updateField('bgColor', value)}
        />
        <ColorField
          label="Cor do cartão"
          value={draft.cardColor}
          onChange={(value) => updateField('cardColor', value)}
        />
        <ColorField
          label="Cor do texto"
          value={draft.textColor}
          onChange={(value) => updateField('textColor', value)}
        />

        {saveError && <p className="admin-field-error">{saveError}</p>}
        <button type="submit" className="admin-primary-button" disabled={saving}>
          {saving ? 'A gravar...' : 'Gravar'}
        </button>
      </div>
    </form>
  )
}

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  // The text field can hold whatever the user is mid-typing (including an
  // invalid or incomplete hex string); the swatch falls back to the last
  // valid value it was given rather than crashing on an invalid `value` prop.
  const [text, setText] = useState(value)
  const swatchValue = HEX_COLOR_RE.test(value) ? value : '#000000'

  useEffect(() => {
    setText(value)
  }, [value])

  function handleTextChange(next: string) {
    setText(next)
    if (HEX_COLOR_RE.test(next)) {
      onChange(next)
    }
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="admin-color-field">
        <input
          type="color"
          value={swatchValue}
          onChange={(e) => {
            setText(e.target.value)
            onChange(e.target.value)
          }}
        />
        <input
          type="text"
          className="admin-input"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => setText(value)}
        />
      </div>
    </div>
  )
}
