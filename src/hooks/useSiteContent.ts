import { useEffect, useState } from 'react'
import { fetchSiteContent } from '../lib/fetchSiteContent'
import type { SiteSettings, Block } from '../types/content'

const CACHE_KEY = 'yourweddingstory:site-content-cache'

interface SiteContentState {
  settings: SiteSettings | null
  blocks: Block[]
  loading: boolean
  error: string | null
}

interface CachedContent {
  settings: SiteSettings
  blocks: Block[]
}

function readCache(): CachedContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CachedContent) : null
  } catch {
    return null
  }
}

function writeCache(content: CachedContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content))
  } catch {
    // localStorage unavailable (e.g. private browsing) -- caching is best-effort
  }
}

export function useSiteContent(): SiteContentState {
  const [state, setState] = useState<SiteContentState>({
    settings: null,
    blocks: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    function fallbackToCache() {
      if (cancelled) return
      const cached = readCache()
      if (cached) {
        setState({ settings: cached.settings, blocks: cached.blocks, loading: false, error: null })
      } else {
        setState({ settings: null, blocks: [], loading: false, error: 'conteudo-indisponivel' })
      }
    }

    fetchSiteContent()
      .then((result) => {
        if (cancelled) return

        if (result.error || !result.settings) {
          fallbackToCache()
          return
        }

        writeCache({ settings: result.settings, blocks: result.blocks })
        setState({ settings: result.settings, blocks: result.blocks, loading: false, error: null })
      })
      .catch(fallbackToCache)

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
