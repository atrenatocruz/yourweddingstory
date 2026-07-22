# Your Wedding Story — Backoffice (CMS) Design

## Purpose

Give the site owner (Melanie) a password-protected admin area to edit the site's texts, links, and email without touching code, and to add/remove/reorder additional content sections ("blocks") below the existing hero content — with a live visual preview and instant (no-redeploy) updates on the public site.

## Decisions from brainstorming

- **Users/auth:** password login (Supabase Auth, email/password). No public sign-up — admin accounts are created manually (Melanie's, and the owner's).
- **Update speed:** instant. The public site reads content from a database at runtime instead of from a build-time static file, so a save is visible immediately on next page load/refresh — no rebuild/redeploy wait.
- **Section flexibility:** reorderable blocks of a fixed set of types (text, image, button, gallery) — not a fully free-form page builder, and not a static template with just more fields.
- **Overall approach:** custom-built backoffice (not a third-party headless CMS) backed by Supabase (Postgres + Auth), living in the same Vite/React codebase behind a new `/admin` route. Chosen over a headless CMS (e.g. Sanity) because it gives full control over the block types and lets the editor UI/preview reuse the site's actual design system, at the cost of more custom code.

## Architecture

- The app gains routing (`react-router-dom`): `/` is the public site, `/admin` is the backoffice (login screen if unauthenticated, dashboard if authenticated).
- A Supabase project provides Postgres (content storage) and Auth (login). The Supabase anon/public key is safe to expose client-side by design; **write** access is restricted to authenticated users via Postgres Row Level Security (RLS) policies — anonymous visitors get read-only access.
- The public site fetches content from Supabase on load instead of importing the static `src/content.ts`. `content.ts` is retired as the source of truth but its shape informs the `site_settings` schema below; a copy of its values seeds the initial database row.
- No custom backend/serverless functions are needed for basic CRUD — the Supabase JS client talks to Postgres directly from the browser, gated by RLS and the user's auth JWT.

## Data model

Two Postgres tables:

### `site_settings` (single row)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid / fixed singleton id | always one row |
| `eyebrow` | text | |
| `headline` | text | |
| `body` | text | |
| `hero_image_url` | text | |
| `hero_image_alt` | text | |
| `cta_1_label` | text | |
| `cta_1_href` | text | |
| `cta_1_external` | boolean | |
| `cta_2_label` | text | |
| `cta_2_href` | text | |
| `email_href` | text | drives both the "Send Me An Email" CTA and the mail icon |
| `instagram_href` | text | |
| `updated_at` | timestamptz | |

### `blocks` (ordered list, zero or more rows)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `type` | text enum: `text` \| `image` \| `button` \| `gallery` | |
| `position` | integer | drives display order, unique, reorderable |
| `data` | jsonb | shape depends on `type` (see below) |
| `created_at` | timestamptz | |

`data` shape per type:
- `text`: `{ heading?: string, body: string }`
- `image`: `{ url: string, alt: string, caption?: string }`
- `button`: `{ label: string, href: string, external?: boolean }`
- `gallery`: `{ images: { url: string, alt: string }[] }`

### RLS policies

- `SELECT` on both tables: allowed for `anon` and `authenticated` roles (public read).
- `INSERT`/`UPDATE`/`DELETE` on both tables: allowed only for `authenticated` role.

## Components

**Public site (`src/`)**
- `src/lib/supabase.ts` — Supabase client init (anon key).
- `src/hooks/useSiteContent.ts` — fetches `site_settings` (single row) and `blocks` (ordered by `position`) on mount; exposes loading/error state.
- Existing presentational components (`Eyebrow`, `Headline`, `BodyText`, `HeroImage`, `CtaButton`, `SocialIcons`) are unchanged in shape — they now receive their props from the fetched `site_settings` row instead of the static `content.ts` import.
- `src/components/BlockRenderer.tsx` — new; maps each block's `type` to a display component: `TextBlock`, `ImageBlock`, `ButtonBlockDisplay`, `GalleryBlock` (new small presentational components, one per block type).
- Fallback: if the Supabase fetch fails, the last successfully fetched content is kept in `localStorage` and shown instead of a blank page, with a small non-blocking notice.

**Admin (`src/admin/`)**
- `src/admin/LoginPage.tsx` — email/password form via Supabase Auth `signInWithPassword`.
- `src/admin/AdminGuard.tsx` — route wrapper; redirects to `LoginPage` if there's no active Supabase session.
- `src/admin/AdminDashboard.tsx` — main editor: a form bound to `site_settings`, plus a draggable, ordered list of `blocks` (add / edit / remove / reorder), plus a live preview pane.
- `src/admin/BlockEditor.tsx` — per-block-type edit form (renders the right fields based on `type`).
- `src/admin/LivePreview.tsx` — renders the actual public-site components (`Eyebrow`, `Headline`, etc. + `BlockRenderer`) fed from the admin's current in-memory draft state, so edits are visible before/while saving.

## Data flow

1. Visitor loads `/` → `useSiteContent` queries Supabase → renders. No auth required (RLS allows anonymous read).
2. Melanie logs in at `/admin` → Supabase session established → `AdminGuard` allows access to `AdminDashboard`, which loads the same data plus enables writes.
3. Editing a settings field or a block: on blur/drop (no separate "publish" step), the client issues an `update`/`insert`/`delete`/reorder call to Supabase. RLS requires an authenticated session for these to succeed.
4. On success, local state updates immediately (the `LivePreview` already reflected the draft) and the public site will show the change on its next load — effectively instant, no redeploy.
5. Reordering: dragging a block updates its `position` value(s) in the `blocks` table.

## Error handling

- **Wrong login credentials:** generic inline error ("email ou password incorretos") — does not reveal which field was wrong.
- **Save failure** (network, RLS denial, etc.): shows an inline warning and keeps the user's unsaved edit in the form — never silently discards input.
- **Session expiry mid-edit:** a write rejected due to an invalid/expired session redirects to `LoginPage` (edits already entered in the form are preserved in local component state so she can log back in and retry — not silently lost, though not auto-resubmitted).
- **Public site fetch failure:** falls back to the last-known-good content cached in `localStorage`; if there's no cache yet (first-ever visit during an outage), shows a minimal "conteúdo indisponível de momento" state rather than a blank/broken page.

## Testing

- No prior automated suite existed (the original site was pure static markup). This feature introduces real logic worth unit testing with Vitest:
  - Block reordering logic (pure function: given a list and a moved item's new index, returns the updated `position` values).
  - `site_settings` and per-block-type form validation (e.g. required fields, URL format for `href`/`url` fields).
- Auth flow, drag-and-drop UX, live preview accuracy, and end-to-end save behavior are verified manually via browser automation (dev server + Supabase test project), the same way Task 8 verified the original static site — not automated, since it's UI/integration-heavy and low-volume (one admin panel, not a high-traffic surface).

## Out of scope (for this iteration)

- Image uploads (image blocks/hero image take a URL, not a file-upload widget) — Melanie pastes a hosted image URL for now.
- Multi-language content.
- Version history / undo for edits.
- Granular per-user permissions (both admin accounts have full read/write).
