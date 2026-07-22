# Backoffice (CMS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a password-protected `/admin` backoffice (Supabase-backed) so the site owner can edit texts/links/email and add reorderable content blocks with a live preview, with the public site reading content at runtime for instant (no-redeploy) updates.

**Architecture:** The existing Vite + React SPA gains client-side routing (`react-router-dom`): `/` renders the public site (now fetching content from Supabase instead of a static file), `/admin` renders a password-protected dashboard. Supabase (Postgres + Auth) is the only backend — no custom server/serverless functions. Row Level Security restricts writes to authenticated users; reads are public.

**Tech Stack:** React 18, Vite 5, TypeScript 5 (existing), plus `@supabase/supabase-js`, `react-router-dom`, `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (drag-and-drop reordering), `vitest` (unit tests for pure logic).

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-07-22-backoffice-design.md` — table/column names, block types, and UX described below are copied verbatim from it.
- **Supabase anon key is public-safe and goes in client code via `VITE_SUPABASE_ANON_KEY`. The `service_role` key must NEVER be used, requested, or referenced anywhere in this codebase — write access is controlled entirely by Row Level Security, not by using a privileged key.**
- No public sign-up. Admin accounts (email/password) are created manually via the Supabase dashboard by the project owner, not by any code in this repo.
- `.env.local` must never be committed — add it to `.gitignore` in Task 1.
- Block types for this iteration are exactly four: `text`, `image`, `button`, `gallery`. No image-upload widget — image/gallery blocks take a hosted URL, pasted by the editor.
- "Instant" means the public site fetches current content on every page load — not a live push to already-open browser tabs (no Supabase Realtime subscription needed).
- Existing public-site components (`Eyebrow`, `Headline`, `BodyText`, `HeroImage`, `CtaButton`, `SocialIcons`) keep their current prop shapes (`{text}`, `{src, alt}`, the `Cta` shape, `{emailHref, instagramHref}`) — only *where their props come from* changes (Supabase instead of the static `content.ts`), not the components themselves.
- `src/content.ts` (the current static content) is deleted once its values are migrated into the database seed (Task 1) and the public site is rewired (Task 5) — do not leave unused dead code around.
- Spec's "sessão expirada redireciona para o login" requirement is satisfied via `AdminGuard`'s reactive `onAuthStateChange` listener (Task 6): if the Supabase client's background token refresh fails and the session becomes null, any protected route re-renders and redirects. Individual write operations (Tasks 8/9) do not additionally inspect each response for an auth-specific error code — a failed write shows the generic save-error message from that task, and a genuinely expired session is caught by the guard's listener. This is a deliberate scope simplification for a small app with two admin users, not an oversight.
- `heroImageAlt` exists in the data model (seeded once in Task 1) but is intentionally not exposed as an editable field in `SiteSettingsForm` (Task 8) — the spec's editable-field list is texts/links/email, and alt-text editing wasn't called out as a requirement. It can be added later if needed.

## Pre-requisite (controller step, before Task 1 is dispatched)

Before any implementation task starts, a live Supabase project must exist with:
1. A new project created at supabase.com (free tier).
2. `supabase/schema.sql` (written in Task 1) run once in the Supabase SQL Editor — but since that file doesn't exist until Task 1 runs, the practical order is: dispatch Task 1's implementer to write the file, THEN the controller/user runs it against the live project, THEN two admin users are created manually via Supabase Dashboard → Authentication → Users → Add User.
3. The controller creates a local `.env.local` (gitignored, not committed) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings page, so later tasks' dev-server verification steps have real data to check against.

Tasks 2-10 do not strictly require live Supabase data to pass their own verification (`npx tsc --noEmit` is sufficient). Task 11 (manual end-to-end verification) absolutely requires the live project, seeded schema, and at least one admin user to exist.

---

### Task 1: Supabase schema, client, and core routing dependency

**Files:**
- Create: `supabase/schema.sql`
- Create: `.env.example`
- Modify: `.gitignore`
- Create: `src/lib/supabase.ts`
- Modify: `package.json` (add dependencies)

**Interfaces:**
- Produces: `supabase` (the initialized Supabase client) exported from `src/lib/supabase.ts`, imported by every later task that reads/writes data.

- [ ] **Step 1: Create `supabase/schema.sql`**

```sql
create extension if not exists "pgcrypto";

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null,
  headline text not null,
  body text not null,
  hero_image_url text not null,
  hero_image_alt text not null,
  cta_1_label text not null,
  cta_1_href text not null,
  cta_1_external boolean not null default false,
  cta_2_label text not null,
  cta_2_href text not null,
  email_href text not null,
  instagram_href text not null,
  updated_at timestamptz not null default now()
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text', 'image', 'button', 'gallery')),
  position integer not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table blocks enable row level security;

create policy "Public read site_settings" on site_settings
  for select using (true);

create policy "Public read blocks" on blocks
  for select using (true);

create policy "Authenticated write site_settings" on site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated write blocks" on blocks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into site_settings (
  eyebrow, headline, body, hero_image_url, hero_image_alt,
  cta_1_label, cta_1_href, cta_1_external,
  cta_2_label, cta_2_href,
  email_href, instagram_href
)
select
  'Your Wedding Story',
  'Wedding Content Creation & Storymaking',
  'Keep the memories of your big day alive through authentic content that captures every meaningful moment, allowing you to relive your wedding story from a whole new perspective.',
  'https://images.msha.ke/aba09fb5-788d-4cdd-997a-e5a8ab992a13',
  'Bridal bouquet resting on a veil',
  'Enquire About Your Wedding Day',
  'https://app.studioninja.co/contactform/hosted/0a800fc8-9f7f-1f92-819f-843e8ea7489c/0a800fc8-9f7f-1f92-819f-843e8ebb489e',
  true,
  'Send Me An Email',
  'mailto:geral@melaniefernandes.com',
  'mailto:geral@melaniefernandes.com',
  'https://www.instagram.com/yourweddingstory_/'
where not exists (select 1 from site_settings);
```

- [ ] **Step 2: Create `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

- [ ] **Step 3: Add `.env.local` to `.gitignore`**

Modify `.gitignore` (currently 4 lines: `node_modules`, `dist`, `.DS_Store`, `*.tsbuildinfo`) to add one line:

```
node_modules
dist
.DS_Store
*.tsbuildinfo
.env.local
```

- [ ] **Step 4: Install dependencies**

Run: `npm install @supabase/supabase-js react-router-dom`
Expected: exits 0, `package.json` dependencies gain both packages.

- [ ] **Step 5: Create `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors. (This does not require a live Supabase project — `supabase.ts` only throws at runtime if env vars are missing, which is not a compile-time check.)

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql .env.example .gitignore src/lib/supabase.ts package.json package-lock.json
git commit -m "Add Supabase schema, client, and routing/data dependencies"
```

---

### Task 2: Shared content types

**Files:**
- Create: `src/types/content.ts`

**Interfaces:**
- Produces: `Cta`, `BlockType`, `TextBlockData`, `ImageBlockData`, `ButtonBlockData`, `GalleryBlockData`, `BlockData`, `Block`, `SiteSettings` — consumed by every later task.

- [ ] **Step 1: Create `src/types/content.ts`**

```ts
export interface Cta {
  label: string
  href: string
  external?: boolean
}

export type BlockType = 'text' | 'image' | 'button' | 'gallery'

export interface TextBlockData {
  heading?: string
  body: string
}

export interface ImageBlockData {
  url: string
  alt: string
  caption?: string
}

export interface ButtonBlockData {
  label: string
  href: string
  external?: boolean
}

export interface GalleryBlockData {
  images: { url: string; alt: string }[]
}

export type BlockData = TextBlockData | ImageBlockData | ButtonBlockData | GalleryBlockData

export interface Block {
  id: string
  type: BlockType
  position: number
  data: BlockData
}

export interface SiteSettings {
  id: string
  eyebrow: string
  headline: string
  body: string
  heroImageUrl: string
  heroImageAlt: string
  cta1Label: string
  cta1Href: string
  cta1External: boolean
  cta2Label: string
  cta2Href: string
  emailHref: string
  instagramHref: string
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/content.ts
git commit -m "Add shared content types for site settings and blocks"
```

---

### Task 3: Content fetching (fetchSiteContent + useSiteContent hook)

**Files:**
- Create: `src/lib/fetchSiteContent.ts`
- Create: `src/hooks/useSiteContent.ts`

**Interfaces:**
- Consumes: `supabase` from `../lib/supabase` (Task 1), `SiteSettings`/`Block` from `../types/content` (Task 2).
- Produces:
  - `fetchSiteContent(): Promise<{ settings: SiteSettings | null, blocks: Block[], error: boolean }>` — consumed by this task's own hook AND by Task 10's `AdminDashboard` (which needs the raw fetch without the public site's localStorage-fallback behavior).
  - `useSiteContent(): { settings: SiteSettings | null, blocks: Block[], loading: boolean, error: string | null }` — consumed by Task 5's `PublicSite`.

- [ ] **Step 1: Create `src/lib/fetchSiteContent.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/hooks/useSiteContent.ts`**

```ts
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

    fetchSiteContent().then((result) => {
      if (cancelled) return

      if (result.error || !result.settings) {
        const cached = readCache()
        if (cached) {
          setState({ settings: cached.settings, blocks: cached.blocks, loading: false, error: null })
        } else {
          setState({ settings: null, blocks: [], loading: false, error: 'conteudo-indisponivel' })
        }
        return
      }

      writeCache({ settings: result.settings, blocks: result.blocks })
      setState({ settings: result.settings, blocks: result.blocks, loading: false, error: null })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/fetchSiteContent.ts src/hooks/useSiteContent.ts
git commit -m "Add fetchSiteContent and useSiteContent hook with localStorage fallback"
```

---

### Task 4: Block display components

**Files:**
- Create: `src/components/blocks/TextBlock.tsx`
- Create: `src/components/blocks/ImageBlock.tsx`
- Create: `src/components/blocks/ButtonBlockDisplay.tsx`
- Create: `src/components/blocks/GalleryBlock.tsx`
- Create: `src/components/BlockRenderer.tsx`

**Interfaces:**
- Consumes: `TextBlockData`, `ImageBlockData`, `ButtonBlockData`, `GalleryBlockData`, `Block` from `../types/content` (Task 2).
- Produces: `BlockRenderer({ blocks: Block[] })` — consumed by Task 5 (`PublicSite`) and Task 10 (`LivePreview`).

- [ ] **Step 1: Create `src/components/blocks/TextBlock.tsx`**

```tsx
import type { TextBlockData } from '../../types/content'

export function TextBlock({ heading, body }: TextBlockData) {
  return (
    <div className="block block-text">
      {heading && <h3 className="block-text-heading">{heading}</h3>}
      <p className="block-text-body">{body}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/blocks/ImageBlock.tsx`**

```tsx
import type { ImageBlockData } from '../../types/content'

export function ImageBlock({ url, alt, caption }: ImageBlockData) {
  return (
    <figure className="block block-image">
      <img src={url} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
```

- [ ] **Step 3: Create `src/components/blocks/ButtonBlockDisplay.tsx`**

```tsx
import type { ButtonBlockData } from '../../types/content'

export function ButtonBlockDisplay({ label, href, external }: ButtonBlockData) {
  return (
    <a
      className="block block-button cta-button"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
    </a>
  )
}
```

- [ ] **Step 4: Create `src/components/blocks/GalleryBlock.tsx`**

```tsx
import type { GalleryBlockData } from '../../types/content'

export function GalleryBlock({ images }: GalleryBlockData) {
  return (
    <div className="block block-gallery">
      {images.map((image) => (
        <img key={image.url} src={image.url} alt={image.alt} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/BlockRenderer.tsx`**

```tsx
import type { Block, TextBlockData, ImageBlockData, ButtonBlockData, GalleryBlockData } from '../types/content'
import { TextBlock } from './blocks/TextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { ButtonBlockDisplay } from './blocks/ButtonBlockDisplay'
import { GalleryBlock } from './blocks/GalleryBlock'

interface BlockRendererProps {
  blocks: Block[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id} {...(block.data as TextBlockData)} />
          case 'image':
            return <ImageBlock key={block.id} {...(block.data as ImageBlockData)} />
          case 'button':
            return <ButtonBlockDisplay key={block.id} {...(block.data as ButtonBlockData)} />
          case 'gallery':
            return <GalleryBlock key={block.id} {...(block.data as GalleryBlockData)} />
          default:
            return null
        }
      })}
    </>
  )
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/blocks src/components/BlockRenderer.tsx
git commit -m "Add block display components and BlockRenderer"
```

---

### Task 5: Routing skeleton, dynamic public site, retire static content

**Files:**
- Create: `src/PublicSite.tsx`
- Create: `src/admin/LoginPage.tsx` (placeholder — replaced in Task 6)
- Create: `src/admin/AdminGuard.tsx` (placeholder — replaced in Task 6)
- Create: `src/admin/AdminDashboard.tsx` (placeholder — replaced in Task 10)
- Modify: `src/App.tsx` (becomes the router root)
- Modify: `src/components/CtaButton.tsx` (import path)
- Create: `vercel.json`
- Delete: `src/content.ts`

**Interfaces:**
- Consumes: `useSiteContent` (Task 3), `BlockRenderer` (Task 4), existing `Eyebrow`/`Headline`/`BodyText`/`HeroImage`/`CtaButton`/`SocialIcons`.
- Produces: `App` (router root) — no further consumers. `PublicSite`, `LoginPage`, `AdminGuard`, `AdminDashboard` are wired into routes here; their internals are replaced by later tasks without changing this task's routing structure.

- [ ] **Step 1: Install `react-router-dom` if not already present**

This was installed in Task 1. Run `npm ls react-router-dom` to confirm; if missing, run `npm install react-router-dom`.

- [ ] **Step 2: Update `src/components/CtaButton.tsx` import**

Change line 1 from:
```tsx
import type { Cta } from '../content'
```
to:
```tsx
import type { Cta } from '../types/content'
```
(The rest of the file is unchanged.)

- [ ] **Step 3: Create `src/PublicSite.tsx`**

```tsx
import { useSiteContent } from './hooks/useSiteContent'
import { Eyebrow } from './components/Eyebrow'
import { Headline } from './components/Headline'
import { BodyText } from './components/BodyText'
import { HeroImage } from './components/HeroImage'
import { CtaButton } from './components/CtaButton'
import { SocialIcons } from './components/SocialIcons'
import { BlockRenderer } from './components/BlockRenderer'

export function PublicSite() {
  const { settings, blocks, loading, error } = useSiteContent()

  if (loading) {
    return <div className="page" />
  }

  if (error || !settings) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-content">
            <p className="body-text">Conteúdo indisponível de momento.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <HeroImage src={settings.heroImageUrl} alt={settings.heroImageAlt} />
        <div className="card-content">
          <Eyebrow text={settings.eyebrow} />
          <Headline text={settings.headline} />
          <BodyText text={settings.body} />
          <div className="cta-group">
            <CtaButton label={settings.cta1Label} href={settings.cta1Href} external={settings.cta1External} />
            <CtaButton label={settings.cta2Label} href={settings.cta2Href} />
          </div>
          <SocialIcons emailHref={settings.emailHref} instagramHref={settings.instagramHref} />
          {blocks.length > 0 && (
            <div className="blocks">
              <BlockRenderer blocks={blocks} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create placeholder `src/admin/LoginPage.tsx`**

```tsx
export function LoginPage() {
  return <div>Login placeholder</div>
}
```

- [ ] **Step 5: Create placeholder `src/admin/AdminGuard.tsx`**

```tsx
import type { ReactNode } from 'react'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  return <>{children}</>
}
```

- [ ] **Step 6: Create placeholder `src/admin/AdminDashboard.tsx`**

```tsx
export function AdminDashboard() {
  return <div>Admin dashboard placeholder</div>
}
```

- [ ] **Step 7: Replace `src/App.tsx` with the router root**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicSite } from './PublicSite'
import { AdminGuard } from './admin/AdminGuard'
import { AdminDashboard } from './admin/AdminDashboard'
import { LoginPage } from './admin/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 8: Create `vercel.json` for SPA client-side routing**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

(Without this, directly loading or refreshing `/admin` on the deployed Vercel site would 404 instead of serving the app.)

- [ ] **Step 9: Delete `src/content.ts`**

Its values are already migrated into `supabase/schema.sql`'s seed insert (Task 1) and it has no remaining importers after this task's changes.

- [ ] **Step 10: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 11: Verify the dev server starts** (requires `.env.local` from the Pre-requisite step)

Run (background): `npm run dev`
Then: `curl -s http://localhost:5173/ | grep -o '<div id="root">'`
Expected: matches. If `.env.local` is not yet configured, note this in your report instead of treating it as a failure — full rendering is verified in Task 11.
Stop the dev server after confirming.

- [ ] **Step 12: Commit**

```bash
git add src/PublicSite.tsx src/admin/LoginPage.tsx src/admin/AdminGuard.tsx src/admin/AdminDashboard.tsx src/App.tsx src/components/CtaButton.tsx vercel.json
git rm src/content.ts
git commit -m "Add routing skeleton, dynamic public site, retire static content.ts"
```

---

### Task 6: Real authentication (LoginPage + AdminGuard)

**Files:**
- Modify: `src/admin/LoginPage.tsx` (replace placeholder)
- Modify: `src/admin/AdminGuard.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `supabase` from `../lib/supabase` (Task 1).
- Produces: real `LoginPage` and `AdminGuard` — same names/shapes as the Task 5 placeholders, so `App.tsx`'s routing is unaffected.

- [ ] **Step 1: Replace `src/admin/LoginPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setSubmitting(false)

    if (signInError) {
      setError('Email ou password incorretos.')
      return
    }

    navigate('/admin')
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p className="admin-login-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/admin/AdminGuard.tsx`**

```tsx
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (session === undefined) {
    return null
  }

  if (session === null) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/admin/LoginPage.tsx src/admin/AdminGuard.tsx
git commit -m "Add real Supabase Auth login and session-based admin guard"
```

---

### Task 7: Pure logic — block ordering and form validation (TDD, Vitest)

**Files:**
- Create: `src/lib/blockOrdering.ts`
- Create: `src/lib/blockOrdering.test.ts`
- Create: `src/lib/validation.ts`
- Create: `src/lib/validation.test.ts`
- Modify: `vite.config.ts` (add test config)
- Modify: `package.json` (add `vitest` devDependency and `test` script)

**Interfaces:**
- Consumes: `Block` from `../types/content` (Task 2).
- Produces:
  - `reorderBlocks(blocks: Block[], fromIndex: number, toIndex: number): Block[]` — consumed by Task 9 (`BlockList`).
  - `isRequired(value: string): boolean` and `isValidUrl(value: string): boolean` — consumed by Task 8 (`SiteSettingsForm`).

- [ ] **Step 1: Install vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Add test config to `vite.config.ts`**

Replace the full contents of `vite.config.ts` with:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Add `test` script to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run"
```
alongside the existing `dev`, `build`, `preview` scripts.

- [ ] **Step 4: Write the failing tests — `src/lib/blockOrdering.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { reorderBlocks } from './blockOrdering'
import type { Block } from '../types/content'

function makeBlock(id: string, position: number): Block {
  return { id, type: 'text', position, data: { body: id } }
}

describe('reorderBlocks', () => {
  it('moves a block from one index to another and reassigns positions in order', () => {
    const blocks = [makeBlock('a', 0), makeBlock('b', 1), makeBlock('c', 2)]

    const result = reorderBlocks(blocks, 0, 2)

    expect(result.map((b) => b.id)).toEqual(['b', 'c', 'a'])
    expect(result.map((b) => b.position)).toEqual([0, 1, 2])
  })

  it('moving a block to its own index leaves order unchanged', () => {
    const blocks = [makeBlock('a', 0), makeBlock('b', 1)]

    const result = reorderBlocks(blocks, 1, 1)

    expect(result.map((b) => b.id)).toEqual(['a', 'b'])
  })
})
```

- [ ] **Step 5: Run the tests and confirm they fail** (no implementation yet)

Run: `npx vitest run src/lib/blockOrdering.test.ts`
Expected: FAIL — `Cannot find module './blockOrdering'` or similar.

- [ ] **Step 6: Implement `src/lib/blockOrdering.ts`**

```ts
import type { Block } from '../types/content'

export function reorderBlocks(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  const reordered = [...blocks]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  return reordered.map((block, index) => ({ ...block, position: index }))
}
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npx vitest run src/lib/blockOrdering.test.ts`
Expected: PASS, 2/2 tests.

- [ ] **Step 8: Write the failing tests — `src/lib/validation.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { isRequired, isValidUrl } from './validation'

describe('isRequired', () => {
  it('returns false for empty or whitespace-only strings', () => {
    expect(isRequired('')).toBe(false)
    expect(isRequired('   ')).toBe(false)
  })

  it('returns true for non-empty strings', () => {
    expect(isRequired('hello')).toBe(true)
  })
})

describe('isValidUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('accepts well-formed mailto links', () => {
    expect(isValidUrl('mailto:someone@example.com')).toBe(true)
  })

  it('rejects malformed mailto links', () => {
    expect(isValidUrl('mailto:not-an-email')).toBe(false)
  })

  it('rejects garbage strings', () => {
    expect(isValidUrl('not a url')).toBe(false)
  })
})
```

- [ ] **Step 9: Run the tests and confirm they fail**

Run: `npx vitest run src/lib/validation.test.ts`
Expected: FAIL — `Cannot find module './validation'` or similar.

- [ ] **Step 10: Implement `src/lib/validation.ts`**

```ts
export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

export function isValidUrl(value: string): boolean {
  if (value.startsWith('mailto:')) {
    return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
```

- [ ] **Step 11: Run all tests and confirm they pass**

Run: `npx vitest run`
Expected: PASS, 7/7 tests (2 from blockOrdering + 5 from validation).

- [ ] **Step 12: Verify the whole project still compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 13: Commit**

```bash
git add src/lib/blockOrdering.ts src/lib/blockOrdering.test.ts src/lib/validation.ts src/lib/validation.test.ts vite.config.ts package.json package-lock.json
git commit -m "Add block-ordering and validation logic with Vitest tests"
```

---

### Task 8: Site settings form

**Files:**
- Create: `src/admin/SiteSettingsForm.tsx`

**Interfaces:**
- Consumes: `supabase` (Task 1), `isRequired`/`isValidUrl` (Task 7), `SiteSettings` (Task 2).
- Produces: `SiteSettingsForm({ settings: SiteSettings, onChange: (settings: SiteSettings) => void })` — consumed by Task 10 (`AdminDashboard`).

- [ ] **Step 1: Create `src/admin/SiteSettingsForm.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/admin/SiteSettingsForm.tsx
git commit -m "Add site settings edit form"
```

---

### Task 9: Block editor and reorderable block list (dnd-kit)

**Files:**
- Create: `src/admin/BlockEditor.tsx`
- Create: `src/admin/BlockList.tsx`

**Interfaces:**
- Consumes: `supabase` (Task 1), `reorderBlocks` (Task 7), `Block`/`BlockType`/`TextBlockData`/`ImageBlockData`/`ButtonBlockData`/`GalleryBlockData` (Task 2).
- Produces: `BlockList({ blocks: Block[], onChange: (blocks: Block[]) => void })` — consumed by Task 10 (`AdminDashboard`).

- [ ] **Step 1: Install dnd-kit**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] **Step 2: Create `src/admin/BlockEditor.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `src/admin/BlockList.tsx`**

```tsx
import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import { reorderBlocks } from '../lib/blockOrdering'
import { BlockEditor } from './BlockEditor'
import type { Block, BlockType } from '../types/content'

interface BlockListProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

function defaultDataFor(type: BlockType): Block['data'] {
  switch (type) {
    case 'text':
      return { body: '' }
    case 'image':
      return { url: '', alt: '' }
    case 'button':
      return { label: '', href: '' }
    case 'gallery':
      return { images: [] }
  }
}

export function BlockList({ blocks, onChange }: BlockListProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = blocks.findIndex((b) => b.id === active.id)
    const toIndex = blocks.findIndex((b) => b.id === over.id)
    const reordered = reorderBlocks(blocks, fromIndex, toIndex)
    onChange(reordered)

    const results = await Promise.all(
      reordered.map((block) => supabase.from('blocks').update({ position: block.position }).eq('id', block.id))
    )
    setSaveError(results.some((r) => r.error) ? 'Não foi possível gravar a nova ordem. Tenta novamente.' : null)
  }

  async function handleBlockChange(id: string, data: Block['data']) {
    const updated = blocks.map((block) => (block.id === id ? { ...block, data } : block))
    onChange(updated)
    const { error } = await supabase.from('blocks').update({ data }).eq('id', id)
    setSaveError(error ? 'Não foi possível gravar a secção. Tenta novamente.' : null)
  }

  async function handleRemove(id: string) {
    onChange(blocks.filter((block) => block.id !== id))
    const { error } = await supabase.from('blocks').delete().eq('id', id)
    setSaveError(error ? 'Não foi possível remover a secção. Tenta novamente.' : null)
  }

  async function handleAdd(type: BlockType) {
    const position = blocks.length
    const { data, error } = await supabase
      .from('blocks')
      .insert({ type, position, data: defaultDataFor(type) })
      .select('id, type, position, data')
      .single()

    if (error || !data) {
      setSaveError('Não foi possível adicionar a secção. Tenta novamente.')
      return
    }

    setSaveError(null)
    onChange([...blocks, data as unknown as Block])
  }

  return (
    <div className="admin-block-list">
      <h2>Secções</h2>
      {saveError && <p className="admin-field-error">{saveError}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlockRow key={block.id} block={block} onChange={handleBlockChange} onRemove={handleRemove} />
          ))}
        </SortableContext>
      </DndContext>
      <div className="admin-add-block">
        <button type="button" onClick={() => handleAdd('text')}>
          + Texto
        </button>
        <button type="button" onClick={() => handleAdd('image')}>
          + Imagem
        </button>
        <button type="button" onClick={() => handleAdd('button')}>
          + Botão
        </button>
        <button type="button" onClick={() => handleAdd('gallery')}>
          + Galeria
        </button>
      </div>
    </div>
  )
}

function SortableBlockRow({
  block,
  onChange,
  onRemove,
}: {
  block: Block
  onChange: (id: string, data: Block['data']) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="admin-sortable-block">
      <div className="admin-drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>
      <BlockEditor block={block} onChange={(data) => onChange(block.id, data)} onRemove={() => onRemove(block.id)} />
    </div>
  )
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/admin/BlockEditor.tsx src/admin/BlockList.tsx package.json package-lock.json
git commit -m "Add block editor and drag-to-reorder block list"
```

---

### Task 10: Live preview and real dashboard composition

**Files:**
- Create: `src/admin/LivePreview.tsx`
- Modify: `src/admin/AdminDashboard.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `fetchSiteContent` (Task 3), `SiteSettingsForm` (Task 8), `BlockList` (Task 9), existing public components + `BlockRenderer` (Task 4), `supabase` (Task 1).
- Produces: real `AdminDashboard` — same name/shape as the Task 5 placeholder, so `App.tsx`'s routing is unaffected.

- [ ] **Step 1: Create `src/admin/LivePreview.tsx`**

```tsx
import { Eyebrow } from '../components/Eyebrow'
import { Headline } from '../components/Headline'
import { BodyText } from '../components/BodyText'
import { HeroImage } from '../components/HeroImage'
import { CtaButton } from '../components/CtaButton'
import { SocialIcons } from '../components/SocialIcons'
import { BlockRenderer } from '../components/BlockRenderer'
import type { SiteSettings, Block } from '../types/content'

interface LivePreviewProps {
  settings: SiteSettings
  blocks: Block[]
}

export function LivePreview({ settings, blocks }: LivePreviewProps) {
  return (
    <div className="admin-live-preview">
      <div className="page">
        <div className="card">
          <HeroImage src={settings.heroImageUrl} alt={settings.heroImageAlt} />
          <div className="card-content">
            <Eyebrow text={settings.eyebrow} />
            <Headline text={settings.headline} />
            <BodyText text={settings.body} />
            <div className="cta-group">
              <CtaButton label={settings.cta1Label} href={settings.cta1Href} external={settings.cta1External} />
              <CtaButton label={settings.cta2Label} href={settings.cta2Href} />
            </div>
            <SocialIcons emailHref={settings.emailHref} instagramHref={settings.instagramHref} />
            {blocks.length > 0 && (
              <div className="blocks">
                <BlockRenderer blocks={blocks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/admin/AdminDashboard.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 4: Verify all tests still pass**

Run: `npx vitest run`
Expected: PASS, 7/7 tests (unaffected by this task's changes).

- [ ] **Step 5: Commit**

```bash
git add src/admin/LivePreview.tsx src/admin/AdminDashboard.tsx
git commit -m "Add live preview and compose the real admin dashboard"
```

---

### Task 11: Manual end-to-end verification

**Files:** none (verification only)

**Interfaces:** none

**Pre-requisite:** the Supabase project must be live with `supabase/schema.sql` applied, `.env.local` present with real credentials, and at least one admin user created via Supabase Dashboard → Authentication → Users.

- [ ] **Step 1: Start the dev server in the background**

Run (background): `npm run dev`

- [ ] **Step 2: Verify the public site loads dynamic content**

Navigate to `http://localhost:5173/`, confirm the hero image, eyebrow, headline, body, both CTA buttons, and social icons render with the values from the seeded `site_settings` row (same content as the pre-backoffice static site).

- [ ] **Step 3: Verify anonymous write access is blocked**

Using the browser's dev tools console (or `read_page`/`javascript_tool` if using claude-in-chrome), attempt an anonymous update, e.g.:
```js
await window.supabase?.from('site_settings').update({ eyebrow: 'test' }).eq('id', 'any-id')
```
(This requires temporarily exposing the client on `window` for this manual check, or simply verifying via the Supabase dashboard's API logs that anonymous write attempts are rejected — either approach is acceptable.) Expected: the update is rejected by RLS (no rows affected / permission error), confirming anonymous visitors cannot write.

- [ ] **Step 4: Verify login flow**

Navigate to `http://localhost:5173/admin` — since there's no session, confirm it redirects to `/admin/login`. Log in with the admin account created in the pre-requisite. Confirm it redirects to `/admin` and the dashboard loads with the current settings and blocks (or an empty block list if none exist yet).

- [ ] **Step 5: Verify editing site settings**

Change the headline field in `SiteSettingsForm`, confirm the live preview updates immediately, then confirm (via Supabase dashboard's Table Editor, or by reloading `/`) that the change persisted and is visible on the public site.

- [ ] **Step 6: Verify adding, editing, reordering, and removing a block**

Add a `text` block, fill in its body text, confirm it appears in the live preview and on the public site on reload. Add a second block, drag to reorder them, confirm the new order persists after a page reload. Remove one block, confirm it disappears from both the preview and the public site.

- [ ] **Step 7: Verify logout**

Click "Sair", confirm it returns to the login-required state (navigating to `/admin` again redirects to `/admin/login`).

- [ ] **Step 8: Verify the localStorage fallback**

With the dev server still running, temporarily change `VITE_SUPABASE_URL` in `.env.local` to an invalid value, restart the dev server, reload `/`, and confirm the last-cached content still renders (from `localStorage`) rather than a blank page. Restore the correct `.env.local` value afterward and restart the dev server again.

- [ ] **Step 9: Stop the dev server**

Identify the exact PID listening on port 5173 (e.g. `netstat -ano | findstr :5173` on Windows) and terminate only that PID — do not broadly kill all node/vite processes.

No commit for this task — it's verification only, no files change.

---

### Task 12: Vercel environment variables and production verification

**Files:** none (external service configuration)

**Interfaces:** none

This task requires the user's own Vercel account access — the controller must ask the user to perform it (or grant the controller a scoped token), not perform it silently.

- [ ] **Step 1: Add environment variables in Vercel**

In the Vercel project's Settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as `.env.local`, for the Production (and Preview, if desired) environment.

- [ ] **Step 2: Redeploy**

Trigger a new deployment (pushing this branch's commits to `master` is sufficient if Vercel auto-deploys on push).

- [ ] **Step 3: Verify in production**

Visit the production URL's `/` and `/admin` routes, confirm the public site renders and the admin login works, mirroring Task 11's checks against the live deployment instead of the local dev server.

No commit for this task — it's external configuration and verification only.
