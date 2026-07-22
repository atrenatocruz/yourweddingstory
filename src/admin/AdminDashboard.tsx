import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchSiteContent } from '../lib/fetchSiteContent'
import { SiteSettingsForm } from './SiteSettingsForm'
import { BlockList } from './BlockList'
import { LivePreview } from './LivePreview'
import type { SiteSettings, Block } from '../types/content'

export function AdminDashboard() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSiteContent().then((result) => {
      setSettings(result.settings)
      setBlocks(result.blocks)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="admin-dashboard-loading">A carregar...</div>
  }

  if (!settings) {
    return <div className="admin-dashboard-loading">Não foi possível carregar o conteúdo.</div>
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Backoffice</h1>
        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-editors">
          <SiteSettingsForm settings={settings} onChange={setSettings} />
          <BlockList blocks={blocks} onChange={setBlocks} />
        </div>
        <div className="admin-dashboard-preview">
          <LivePreview settings={settings} blocks={blocks} />
        </div>
      </div>
    </div>
  )
}
