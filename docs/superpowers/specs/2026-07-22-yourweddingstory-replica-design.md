# Your Wedding Story — Milkshake Replica

## Purpose

Replicate the existing `msha.ke/yourweddingstory` bio-link page as a standalone, self-hosted website, replacing dependency on Milkshake. This is a faithful minimal replica — same content, same structure, no additions.

## Source content (captured 2026-07-22 from https://msha.ke/yourweddingstory)

- **Eyebrow:** "YOUR WEDDING STORY"
- **Headline:** "Wedding Content Creation & Storymaking"
- **Body copy:** "Keep the memories of your big day alive through authentic content that captures every meaningful moment, allowing you to relive your wedding story from a whole new perspective."
- **Hero image:** `https://images.msha.ke/aba09fb5-788d-4cdd-997a-e5a8ab992a13` (bridal bouquet/veil photo, referenced directly via URL — not downloaded/rehosted)
- **CTA 1:** "Enquire About Your Wedding Day" → `https://app.studioninja.co/contactform/hosted/0a800fc8-9f7f-1f92-819f-843e8ea7489c/0a800fc8-9f7f-1f92-819f-843e8ebb489e` (opens in new tab)
- **CTA 2:** "Send Me An Email" → `mailto:geral@melaniefernandes.com`
- **Social icons:** mail icon (same mailto), Instagram icon → `https://instagram.com/yourweddingstory.pt`

## Visual spec

| Element | Style |
|---|---|
| Page background | `#F1ECE6` (warm cream) |
| Card | centered, max-width ~380px, white/transparent background, flush on mobile |
| Eyebrow | Josefin Sans, 14px, weight 600, uppercase, letter-spacing 5.65px, color `#222222` |
| Headline | Cormorant Garamond, 25px, weight 400, color `#222222` |
| Body text | Cormorant Garamond, 16px, weight 400, color `#222222` |
| Buttons | Cormorant Garamond, 16px, weight 600, italic, 2px solid `#222222` border, transparent background, color `#222222` |
| Social icons | outline style, `#222222`, mail + Instagram glyphs |
| Fonts | Google Fonts: Josefin Sans, Cormorant Garamond |

## Architecture

- **Stack:** React + Vite + TypeScript, no backend, no routing.
- **Structure:**
  - `src/content.ts` — exports the copy/links above as a typed config object (so text/links are editable without touching components)
  - `src/components/Eyebrow.tsx`, `Headline.tsx`, `BodyText.tsx`, `CtaButton.tsx`, `SocialIcons.tsx`, `HeroImage.tsx` — small presentational components, each taking props from `content.ts`
  - `src/App.tsx` — composes the above into the single-page layout
  - `src/index.css` — global styles: font imports, color variables, card layout, responsive breakpoint for mobile full-width
- **No state management needed** — entirely static content.

## Responsiveness

Flexbox-centered card at a max-width; below ~420px viewport the card goes full-width with horizontal padding, matching the original's mobile-first bio-card behavior.

## Testing / Verification

No automated tests (static content page). Verification is manual:
1. Run `npm run dev`, load in browser
2. Visually compare against the original msha.ke page (fonts, colors, spacing, copy)
3. Click through both CTA buttons and both social icons to confirm link targets are correct
4. Check mobile viewport width for responsive behavior

## Repository & deployment

1. `git init` inside `yourweddingstory/` — a fresh repo scoped to this project only (the parent home directory has an unrelated, unscoped git repo that must not be touched)
2. Scaffold Vite + React + TypeScript app in place
3. Build components per architecture above
4. Commit
5. Create a new GitHub repository and push (repo name/visibility to be confirmed with user before creation)

## Out of scope

- No portfolio/gallery, about section, testimonials, or additional pages — this is a minimal replica of the single existing bio-link card only.
- No custom contact form — CTA links point to the existing external Studio Ninja form and mailto, unchanged.
- No rehosting of the hero image — referenced directly by its existing Milkshake CDN URL.
