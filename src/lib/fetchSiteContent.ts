import { supabase } from './supabase'
import type { SiteSettings, Block } from '../types/content'

const SITE_SETTINGS_SELECT = `id, eyebrow, headline, body,
  heroImageUrl:hero_image_url, heroImageAlt:hero_image_alt,
  cta1Label:cta_1_label, cta1Href:cta_1_href, cta1External:cta_1_external,
  cta2Label:cta_2_label, cta2Href:cta_2_href,
  emailHref:email_href, instagramHref:instagram_href`

export interface FetchSiteContentResult {
  settings: SiteSettings | null
  blocks: Block[]
  error: boolean
}

export async function fetchSiteContent(): Promise<FetchSiteContentResult> {
  const [settingsResult, blocksResult] = await Promise.all([
    supabase.from('site_settings').select(SITE_SETTINGS_SELECT).single(),
    supabase.from('blocks').select('id, type, position, data').order('position'),
  ])

  if (settingsResult.error || blocksResult.error || !settingsResult.data) {
    return { settings: null, blocks: [], error: true }
  }

  return {
    settings: settingsResult.data as unknown as SiteSettings,
    blocks: (blocksResult.data ?? []) as unknown as Block[],
    error: false,
  }
}
