# Your Wedding Story Replica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React + Vite replica of the `msha.ke/yourweddingstory` bio-link page, matching its content, layout, typography, and colors exactly, in the already-initialized git repo at `C:\Users\Renato Cruz\yourweddingstory`.

**Architecture:** A single-page React app with zero routing and zero backend. All copy/links live in one typed `content.ts` config; six small presentational components render that config; `App.tsx` composes them into the layout described in the design spec.

**Tech Stack:** React 18, Vite 5, TypeScript 5. No test framework — the page is static markup with no branching logic, so verification is manual (dev server + visual comparison against the original), per the design spec's Testing section.

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-07-22-yourweddingstory-replica-design.md` — all copy, links, colors, and font sizes below are copied verbatim from it. Do not alter wording.
- Background color: `#F1ECE6`. Text/border color: `#222222`.
- Fonts: Josefin Sans (eyebrow) and Cormorant Garamond (everything else), loaded from Google Fonts.
- Hero image is referenced by its existing URL (`https://images.msha.ke/aba09fb5-788d-4cdd-997a-e5a8ab992a13`) — not downloaded or rehosted.
- The repo root (`C:\Users\Renato Cruz\yourweddingstory`) already has `.git` initialized and one commit (the spec doc). Do not touch the unrelated git repo rooted at the parent home directory.
- No `npm create vite` scaffolding command (it prompts interactively for a non-empty directory) — every scaffold file is written out explicitly in Task 1.
- Before Task 9 (GitHub push), the executor MUST ask the user to confirm the exact repo name and visibility (public/private) — this was flagged as pending confirmation in the design spec and is a "publish to a shared system" action requiring explicit per-action approval.

---

### Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/index.css` (empty placeholder, filled in Task 2)
- Create: `src/App.tsx` (minimal placeholder, filled in Task 7)

**Interfaces:**
- Produces: a working `npm run dev` dev server on `http://localhost:5173`, and the `src/` directory that all later tasks add files into.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "yourweddingstory",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.3.4"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Wedding Story</title>
    <meta name="description" content="Wedding Content Creation & Storymaking. Based in Portugal, available worldwide." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,600&family=Josefin+Sans:wght@600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
dist
.DS_Store
```

- [ ] **Step 6: Create `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: Create empty `src/index.css`**

```css
/* filled in by Task 2 */
```

- [ ] **Step 8: Create placeholder `src/App.tsx`**

```tsx
function App() {
  return <div>placeholder</div>
}

export default App
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`
Expected: exits 0, creates `node_modules/` and `package-lock.json`

- [ ] **Step 10: Verify the dev server starts**

Run (background): `npm run dev`
Then: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`
Expected: `200`

Stop the dev server process after confirming.

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.ts tsconfig.json index.html .gitignore src/main.tsx src/index.css src/App.tsx package-lock.json
git commit -m "Scaffold Vite + React + TypeScript project"
```

---

### Task 2: Global styles

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nothing (pure CSS, no component dependency)
- Produces: CSS classes consumed by later components: `.page`, `.card`, `.card-content`, `.hero-image`, `.eyebrow`, `.headline`, `.body-text`, `.cta-group`, `.cta-button`, `.social-icons`, `.social-icon-link`

- [ ] **Step 1: Write `src/index.css`**

```css
:root {
  --color-bg: #f1ece6;
  --color-text: #222222;
  --font-eyebrow: 'Josefin Sans', sans-serif;
  --font-serif: 'Cormorant Garamond', serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px;
}

.card {
  width: 100%;
  max-width: 380px;
  background-color: var(--color-bg);
}

.hero-image {
  width: 100%;
  height: 260px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 24px 8px;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 5.65px;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 0 0 16px;
}

.headline {
  font-family: var(--font-serif);
  font-size: 25px;
  font-weight: 400;
  color: var(--color-text);
  margin: 0 0 16px;
}

.body-text {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text);
  margin: 0 0 24px;
}

.cta-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.cta-button {
  display: block;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  font-style: italic;
  color: var(--color-text);
  border: 2px solid var(--color-text);
  padding: 12px 16px;
  text-decoration: none;
  background: transparent;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-icon-link {
  color: var(--color-text);
  display: inline-flex;
}

@media (max-width: 420px) {
  .page {
    padding: 0;
  }

  .card {
    max-width: 100%;
  }

  .card-content {
    padding: 24px 20px;
  }
}
```

- [ ] **Step 2: Verify no CSS syntax errors**

Run (background): `npm run dev`
Then: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/src/index.css`
Expected: `200`

Stop the dev server after confirming.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "Add global styles matching original page's colors and typography"
```

---

### Task 3: Content config

**Files:**
- Create: `src/content.ts`

**Interfaces:**
- Produces: `content` object with shape:
  ```ts
  interface Cta {
    label: string
    href: string
    external?: boolean
  }

  interface SiteContent {
    eyebrow: string
    headline: string
    body: string
    heroImageUrl: string
    heroImageAlt: string
    ctas: Cta[]
    social: {
      emailHref: string
      instagramHref: string
    }
  }
  ```
  consumed by Task 7 (`App.tsx`).

- [ ] **Step 1: Write `src/content.ts`**

```ts
export interface Cta {
  label: string
  href: string
  external?: boolean
}

export interface SiteContent {
  eyebrow: string
  headline: string
  body: string
  heroImageUrl: string
  heroImageAlt: string
  ctas: Cta[]
  social: {
    emailHref: string
    instagramHref: string
  }
}

export const content: SiteContent = {
  eyebrow: 'Your Wedding Story',
  headline: 'Wedding Content Creation & Storymaking',
  body: 'Keep the memories of your big day alive through authentic content that captures every meaningful moment, allowing you to relive your wedding story from a whole new perspective.',
  heroImageUrl: 'https://images.msha.ke/aba09fb5-788d-4cdd-997a-e5a8ab992a13',
  heroImageAlt: 'Bridal bouquet resting on a veil',
  ctas: [
    {
      label: 'Enquire About Your Wedding Day',
      href: 'https://app.studioninja.co/contactform/hosted/0a800fc8-9f7f-1f92-819f-843e8ea7489c/0a800fc8-9f7f-1f92-819f-843e8ebb489e',
      external: true,
    },
    {
      label: 'Send Me An Email',
      href: 'mailto:geral@melaniefernandes.com',
    },
  ],
  social: {
    emailHref: 'mailto:geral@melaniefernandes.com',
    instagramHref: 'https://instagram.com/yourweddingstory.pt',
  },
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors

- [ ] **Step 3: Commit**

```bash
git add src/content.ts
git commit -m "Add typed content config with copy and links"
```

---

### Task 4: Core text and image components

**Files:**
- Create: `src/components/Eyebrow.tsx`
- Create: `src/components/Headline.tsx`
- Create: `src/components/BodyText.tsx`
- Create: `src/components/HeroImage.tsx`

**Interfaces:**
- Consumes: nothing beyond own props (no dependency on `content.ts` — parent passes strings in)
- Produces:
  - `Eyebrow({ text: string })`
  - `Headline({ text: string })`
  - `BodyText({ text: string })`
  - `HeroImage({ src: string, alt: string })`
  - all consumed by Task 7 (`App.tsx`)

- [ ] **Step 1: Create `src/components/Eyebrow.tsx`**

```tsx
interface EyebrowProps {
  text: string
}

export function Eyebrow({ text }: EyebrowProps) {
  return <h1 className="eyebrow">{text}</h1>
}
```

- [ ] **Step 2: Create `src/components/Headline.tsx`**

```tsx
interface HeadlineProps {
  text: string
}

export function Headline({ text }: HeadlineProps) {
  return <h2 className="headline">{text}</h2>
}
```

- [ ] **Step 3: Create `src/components/BodyText.tsx`**

```tsx
interface BodyTextProps {
  text: string
}

export function BodyText({ text }: BodyTextProps) {
  return <p className="body-text">{text}</p>
}
```

- [ ] **Step 4: Create `src/components/HeroImage.tsx`**

```tsx
interface HeroImageProps {
  src: string
  alt: string
}

export function HeroImage({ src, alt }: HeroImageProps) {
  return <img className="hero-image" src={src} alt={alt} />
}
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors (these components aren't wired into `App.tsx` yet, so this only checks syntax/types of the new files in isolation — full integration is verified in Task 7)

- [ ] **Step 6: Commit**

```bash
git add src/components/Eyebrow.tsx src/components/Headline.tsx src/components/BodyText.tsx src/components/HeroImage.tsx
git commit -m "Add Eyebrow, Headline, BodyText, HeroImage components"
```

---

### Task 5: CtaButton component

**Files:**
- Create: `src/components/CtaButton.tsx`

**Interfaces:**
- Consumes: `Cta` type shape from `src/content.ts` (`{ label: string, href: string, external?: boolean }`) — imported by type only, no runtime dependency
- Produces: `CtaButton({ label: string, href: string, external?: boolean })`, consumed by Task 7 (`App.tsx`)

- [ ] **Step 1: Create `src/components/CtaButton.tsx`**

```tsx
import type { Cta } from '../content'

export function CtaButton({ label, href, external }: Cta) {
  return (
    <a
      className="cta-button"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
    </a>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/CtaButton.tsx
git commit -m "Add CtaButton component"
```

---

### Task 6: SocialIcons component

**Files:**
- Create: `src/components/SocialIcons.tsx`

**Interfaces:**
- Consumes: nothing beyond own props
- Produces: `SocialIcons({ emailHref: string, instagramHref: string })`, consumed by Task 7 (`App.tsx`)

- [ ] **Step 1: Create `src/components/SocialIcons.tsx`**

```tsx
interface SocialIconsProps {
  emailHref: string
  instagramHref: string
}

export function SocialIcons({ emailHref, instagramHref }: SocialIconsProps) {
  return (
    <div className="social-icons">
      <a className="social-icon-link" href={emailHref} aria-label="Email">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 6 10 7 10-7" />
        </svg>
      </a>
      <a
        className="social-icon-link"
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/SocialIcons.tsx
git commit -m "Add SocialIcons component"
```

---

### Task 7: Compose App.tsx

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes:
  - `content` from `./content`
  - `Eyebrow`, `Headline`, `BodyText`, `HeroImage` from Task 4
  - `CtaButton` from Task 5
  - `SocialIcons` from Task 6
- Produces: the final rendered page (no further consumers — this is the composition root)

- [ ] **Step 1: Replace `src/App.tsx` placeholder with the real composition**

```tsx
import { content } from './content'
import { Eyebrow } from './components/Eyebrow'
import { Headline } from './components/Headline'
import { BodyText } from './components/BodyText'
import { HeroImage } from './components/HeroImage'
import { CtaButton } from './components/CtaButton'
import { SocialIcons } from './components/SocialIcons'

function App() {
  return (
    <div className="page">
      <div className="card">
        <HeroImage src={content.heroImageUrl} alt={content.heroImageAlt} />
        <div className="card-content">
          <Eyebrow text={content.eyebrow} />
          <Headline text={content.headline} />
          <BodyText text={content.body} />
          <div className="cta-group">
            {content.ctas.map((cta) => (
              <CtaButton key={cta.label} {...cta} />
            ))}
          </div>
          <SocialIcons
            emailHref={content.social.emailHref}
            instagramHref={content.social.instagramHref}
          />
        </div>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors

- [ ] **Step 3: Verify the dev server renders it**

Run (background): `npm run dev`
Then: `curl -s http://localhost:5173/ | grep -o '<div id="root">'`
Expected: matches (confirms the HTML shell serves; full render check is visual in Task 8)

Stop the dev server after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "Compose full page layout in App.tsx"
```

---

### Task 8: Manual visual verification against the original

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Start the dev server in the background**

Run (background): `npm run dev`

- [ ] **Step 2: Open the replica in a browser tab and screenshot it**

Use the claude-in-chrome browser tools: navigate to `http://localhost:5173`, wait 1 second, take a screenshot.

- [ ] **Step 3: Compare against the original**

Navigate a second tab to `https://msha.ke/yourweddingstory`, screenshot it, and compare side-by-side against the replica screenshot from Step 2: background color, font choices (serif headline/body vs. small-caps eyebrow), button borders, and overall spacing should match. Minor pixel differences (hero image aspect ratio, exact spacing) are acceptable; the fonts, colors, and copy must match exactly.

- [ ] **Step 4: Verify all links resolve to the right targets**

Using `read_page` (filter: interactive) on the replica tab, confirm:
- The "Enquire About Your Wedding Day" link `href` is `https://app.studioninja.co/contactform/hosted/0a800fc8-9f7f-1f92-819f-843e8ea7489c/0a800fc8-9f7f-1f92-819f-843e8ebb489e`
- The "Send Me An Email" link and the mail icon link both have `href="mailto:geral@melaniefernandes.com"`
- The Instagram icon link `href` is `https://instagram.com/yourweddingstory.pt`

- [ ] **Step 5: Verify mobile-width responsiveness**

Resize the browser tab (or use `computer` action with a narrow viewport) to ~375px width, screenshot, and confirm the card goes full-width with visible side padding and no horizontal overflow.

- [ ] **Step 6: Stop the dev server**

Kill the background `npm run dev` process.

No commit for this task — it's verification only, no files change.

---

### Task 9: Create GitHub repository and push

**Files:** none (repo operations only)

**Interfaces:** none

- [ ] **Step 1: Confirm repo name and visibility with the user**

Before running any `gh` command, ask the user (via chat) to confirm:
- The exact GitHub repo name (e.g. `yourweddingstory`)
- Visibility: public or private

Do not proceed to Step 2 until the user has explicitly answered.

- [ ] **Step 2: Create the GitHub repository**

Run: `gh repo create <confirmed-name> --<confirmed-visibility> --source=. --remote=origin`

Expected: prints the new repo URL, and `git remote -v` now shows `origin`

- [ ] **Step 3: Push**

Run: `git push -u origin master`

Expected: exits 0, branch `master` now tracks `origin/master`

- [ ] **Step 4: Verify**

Run: `gh repo view <confirmed-name> --web` is NOT run automatically — instead run `gh repo view <confirmed-name>` and confirm the output shows the pushed commits.

No further commit — this task only creates/pushes the remote.
