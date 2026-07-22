import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { isRequired, isValidUrl } from '../lib/validation'
import type { SiteSettings } from '../types/content'

interface SiteSettingsFormProps {
  settings: SiteSettings
  onChange: (settings: SiteSettings) => void
  onSavingChange?: (saving: boolean) => void
}

export function SiteSettingsForm({ settings, onChange, onSavingChange }: SiteSettingsFormProps) {
  const [draft, setDraft] = useState<SiteSettings>(settings)
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}
    if (!isRequired(draft.eyebrow)) nextErrors.eyebrow = 'Campo obrigatório'
    if (!isRequired(draft.headline)) nextErrors.headline = 'Campo obrigatório'
    if (!isRequired(draft.body)) nextErrors.body = 'Campo obrigatório'
    if (!isValidUrl(draft.cta1Href)) nextErrors.cta1Href = 'Link inválido'
    if (!isValidUrl(draft.cta2Href)) nextErrors.cta2Href = 'Link inválido'
    if (!isValidUrl(draft.emailHref)) nextErrors.emailHref = 'Email inválido'
    if (!isValidUrl(draft.instagramHref)) nextErrors.instagramHref = 'Link inválido'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    setSaveError(null)

    const { error } = await supabase
      .from('site_settings')
      .update({
        eyebrow: draft.eyebrow,
        headline: draft.headline,
        body: draft.body,
        hero_image_url: draft.heroImageUrl,
        hero_image_alt: draft.heroImageAlt,
        cta_1_label: draft.cta1Label,
        cta_1_href: draft.cta1Href,
        cta_1_external: draft.cta1External,
        cta_2_label: draft.cta2Label,
        cta_2_href: draft.cta2Href,
        email_href: draft.emailHref,
        instagram_href: draft.instagramHref,
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
        <div className={`admin-field${errors.eyebrow ? ' has-error' : ''}`}>
          <label htmlFor="eyebrow">Eyebrow</label>
          <input
            id="eyebrow"
            className="admin-input"
            value={draft.eyebrow}
            onChange={(e) => updateField('eyebrow', e.target.value)}
          />
          {errors.eyebrow && <p className="admin-field-error">{errors.eyebrow}</p>}
        </div>

        <div className={`admin-field${errors.headline ? ' has-error' : ''}`}>
          <label htmlFor="headline">Título</label>
          <input
            id="headline"
            className="admin-input"
            value={draft.headline}
            onChange={(e) => updateField('headline', e.target.value)}
          />
          {errors.headline && <p className="admin-field-error">{errors.headline}</p>}
        </div>

        <div className={`admin-field${errors.body ? ' has-error' : ''}`}>
          <label htmlFor="body">Texto</label>
          <textarea
            id="body"
            className="admin-textarea"
            value={draft.body}
            onChange={(e) => updateField('body', e.target.value)}
          />
          {errors.body && <p className="admin-field-error">{errors.body}</p>}
        </div>

        <div className="admin-field">
          <label htmlFor="heroImageUrl">Imagem de topo (URL)</label>
          <input
            id="heroImageUrl"
            className="admin-input"
            value={draft.heroImageUrl}
            onChange={(e) => updateField('heroImageUrl', e.target.value)}
          />
        </div>

        <div className="admin-field-row">
          <div className="admin-field">
            <label htmlFor="cta1Label">Botão 1 - texto</label>
            <input
              id="cta1Label"
              className="admin-input"
              value={draft.cta1Label}
              onChange={(e) => updateField('cta1Label', e.target.value)}
            />
          </div>

          <div className={`admin-field${errors.cta1Href ? ' has-error' : ''}`}>
            <label htmlFor="cta1Href">Botão 1 - link</label>
            <input
              id="cta1Href"
              className="admin-input"
              value={draft.cta1Href}
              onChange={(e) => updateField('cta1Href', e.target.value)}
            />
            {errors.cta1Href && <p className="admin-field-error">{errors.cta1Href}</p>}
          </div>
        </div>

        <div className="admin-field-row">
          <div className="admin-field">
            <label htmlFor="cta2Label">Botão 2 - texto</label>
            <input
              id="cta2Label"
              className="admin-input"
              value={draft.cta2Label}
              onChange={(e) => updateField('cta2Label', e.target.value)}
            />
          </div>

          <div className={`admin-field${errors.cta2Href ? ' has-error' : ''}`}>
            <label htmlFor="cta2Href">Botão 2 - link</label>
            <input
              id="cta2Href"
              className="admin-input"
              value={draft.cta2Href}
              onChange={(e) => updateField('cta2Href', e.target.value)}
            />
            {errors.cta2Href && <p className="admin-field-error">{errors.cta2Href}</p>}
          </div>
        </div>

        <div className={`admin-field${errors.emailHref ? ' has-error' : ''}`}>
          <label htmlFor="emailHref">Email de contacto</label>
          <input
            id="emailHref"
            className="admin-input"
            value={draft.emailHref}
            onChange={(e) => updateField('emailHref', e.target.value)}
          />
          {errors.emailHref && <p className="admin-field-error">{errors.emailHref}</p>}
        </div>

        <div className={`admin-field${errors.instagramHref ? ' has-error' : ''}`}>
          <label htmlFor="instagramHref">Instagram</label>
          <input
            id="instagramHref"
            className="admin-input"
            value={draft.instagramHref}
            onChange={(e) => updateField('instagramHref', e.target.value)}
          />
          {errors.instagramHref && <p className="admin-field-error">{errors.instagramHref}</p>}
        </div>

        {saveError && <p className="admin-field-error">{saveError}</p>}
        <button type="submit" className="admin-primary-button" disabled={saving}>
          {saving ? 'A gravar...' : 'Gravar'}
        </button>
      </div>
    </form>
  )
}
