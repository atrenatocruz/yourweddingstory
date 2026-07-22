import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchSiteContent } from '../lib/fetchSiteContent'
import { SiteSettingsForm } from './SiteSettingsForm'
import { BlockList } from './BlockList'
import { LivePreview } from './LivePreview'
import { TallyDot } from './TallyDot'
import type { SiteSettings, Block } from '../types/content'
import './admin.css'

export function AdminDashboard() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [blocksSaving, setBlocksSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 901px)').matches
  )

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 901px)')
    const handleChange = (e: MediaQueryListEvent) => setPreviewOpen(e.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    fetchSiteContent()
      .then((result) => {
        setSettings(result.settings)
        setBlocks(result.blocks)
        setLoading(false)
      })
      .catch(() => {
        setSettings(null)
        setBlocks([])
        setLoading(false)
      })
  }, [])

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
    } catch {
      // signOut clears local session state client-side even if the network call fails
    }
  }

  if (loading) {
    return <div className="admin-dashboard-loading">A carregar...</div>
  }

  if (!settings) {
    return <div className="admin-dashboard-loading">Não foi possível carregar o conteúdo.</div>
  }

  const anySaving = settingsSaving || blocksSaving

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-brand">
          <span className="admin-header-brand-name">yourweddingstory</span>
          <span className="admin-header-brand-sub">· Backoffice</span>
        </div>
        <div className="admin-header-status">
          <TallyDot status={anySaving ? 'saving' : 'idle'} />
        </div>
        <button type="button" className="admin-logout-button" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-preview">
          <span className="admin-preview-caption">
            <TallyDot status={anySaving ? 'saving' : 'idle'} showLabel={false} />
            Pré-visualização em direto
          </span>
          <details
            className="admin-preview-details"
            open={previewOpen}
            onToggle={(e) => setPreviewOpen(e.currentTarget.open)}
          >
            <summary className="admin-preview-summary">▸ Ver pré-visualização</summary>
            <div className="admin-live-preview">
              <LivePreview settings={settings} blocks={blocks} />
            </div>
          </details>
        </div>
        <div className="admin-dashboard-editors">
          <SiteSettingsForm settings={settings} onChange={setSettings} onSavingChange={setSettingsSaving} />
          <BlockList blocks={blocks} onChange={setBlocks} onSavingChange={setBlocksSaving} />
        </div>
      </div>
    </div>
  )
}
