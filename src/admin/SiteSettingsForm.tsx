import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { isRequired, isValidUrl } from '../lib/validation'
import type { SiteSettings } from '../types/content'

interface SiteSettingsFormProps {
  settings: SiteSettings
  onChange: (settings: SiteSettings) => void
}

export function SiteSettingsForm({ settings, onChange }: SiteSettingsFormProps) {
  const [draft, setDraft] = useState<SiteSettings>(settings)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
      <h2>Conteúdo principal</h2>

      <label htmlFor="eyebrow">Eyebrow</label>
      <input id="eyebrow" value={draft.eyebrow} onChange={(e) => updateField('eyebrow', e.target.value)} />
      {errors.eyebrow && <p className="admin-field-error">{errors.eyebrow}</p>}

      <label htmlFor="headline">Título</label>
      <input id="headline" value={draft.headline} onChange={(e) => updateField('headline', e.target.value)} />
      {errors.headline && <p className="admin-field-error">{errors.headline}</p>}

      <label htmlFor="body">Texto</label>
      <textarea id="body" value={draft.body} onChange={(e) => updateField('body', e.target.value)} />
      {errors.body && <p className="admin-field-error">{errors.body}</p>}

      <label htmlFor="heroImageUrl">Imagem de topo (URL)</label>
      <input
        id="heroImageUrl"
        value={draft.heroImageUrl}
        onChange={(e) => updateField('heroImageUrl', e.target.value)}
      />

      <label htmlFor="cta1Label">Botão 1 - texto</label>
      <input id="cta1Label" value={draft.cta1Label} onChange={(e) => updateField('cta1Label', e.target.value)} />

      <label htmlFor="cta1Href">Botão 1 - link</label>
      <input id="cta1Href" value={draft.cta1Href} onChange={(e) => updateField('cta1Href', e.target.value)} />
      {errors.cta1Href && <p className="admin-field-error">{errors.cta1Href}</p>}

      <label htmlFor="cta2Label">Botão 2 - texto</label>
      <input id="cta2Label" value={draft.cta2Label} onChange={(e) => updateField('cta2Label', e.target.value)} />

      <label htmlFor="cta2Href">Botão 2 - link</label>
      <input id="cta2Href" value={draft.cta2Href} onChange={(e) => updateField('cta2Href', e.target.value)} />
      {errors.cta2Href && <p className="admin-field-error">{errors.cta2Href}</p>}

      <label htmlFor="emailHref">Email de contacto</label>
      <input id="emailHref" value={draft.emailHref} onChange={(e) => updateField('emailHref', e.target.value)} />
      {errors.emailHref && <p className="admin-field-error">{errors.emailHref}</p>}

      <label htmlFor="instagramHref">Instagram</label>
      <input
        id="instagramHref"
        value={draft.instagramHref}
        onChange={(e) => updateField('instagramHref', e.target.value)}
      />
      {errors.instagramHref && <p className="admin-field-error">{errors.instagramHref}</p>}

      {saveError && <p className="admin-field-error">{saveError}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'A gravar...' : 'Gravar'}
      </button>
    </form>
  )
}
