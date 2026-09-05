# ValPro Welcome UI Fix Report

## Problem

On desktop/tablet-landscape widths, the Welcome (landing) screen rendered as a
narrow ~430px card centered on a black background — effectively a phone
mockup floating in the middle of the browser window — instead of a real
responsive product page using the available viewport width.

## Root Cause

`src/App.tsx` wrapped **every** screen, including Welcome, in one shared
shell:

```tsx
<div className="... w-full max-w-[430px] ...">
  <CurrentScreen />
</div>
```

That `max-w-[430px]` shell is correct for the 15-screen assessment flow
(Role → ... → Share), which is a deliberate mobile product at every width.
It was never supposed to apply to Welcome, which is the landing/marketing
surface, not part of that product shell. Because `CurrentScreen` rendered
every screen through the same wrapper indiscriminately, Welcome inherited a
constraint that had nothing to do with it.

A second, independent bug was found and fixed while implementing the real
desktop layout: the single approved backdrop photograph is a **portrait**
image (900×1400). Forcing it via `object-cover` to fill a **full-width,
landscape-shaped** container (e.g. 1920×900) mathematically requires showing
only the bottom ~30% of the image's height at ~1.8× zoom — at that zoom, the
image's baked-in mockup headline/button text (present in the source asset)
became large and legible again, visibly doubling with the page's real text.
This is why an earlier full-width attempt looked broken/washed out rather
than simply "narrow."

## Changes

- **`src/App.tsx`** — `App()` now special-cases `screen === 'welcome'` and
  renders `<Welcome />` directly, outside the `max-w-[430px]` shell. Every
  other screen is completely unaffected — same shell, same behavior.
- **`src/screens/Welcome.tsx`** — rewritten with two explicit, independently
  composed layouts (not one layout scaled by breakpoint):
  - **`<lg` (phone / tablet-portrait):** the existing full-bleed backdrop
    card, unchanged in content and tuning from the previous approved pass.
  - **`lg+` (tablet-landscape / desktop):** a real full-width section. A nav
    row (wordmark, "A Bhasad.org Product", About/How it Works/FAQ, a working
    hamburger menu) spans the page. Below it, a two-column hero: a left text
    column (eyebrow signals, headline, supporting copy, CTA, "Why ValPro
    Exists") that uses real desktop-scale typography, and a **bounded photo
    panel** on the right — sized close to the source photo's own aspect
    ratio (`h-[560px] w-[40%]`) rather than stretched to fill the remaining
    width edge-to-edge. Stats and footer span the full section width below.
  - Shared pieces (`StatsPanel`, `SiteFooter`, `NavMenuButton`, the
    `EYEBROW_SIGNALS`/`STATS`/`NAV_LINKS` data) are defined once and reused
    by both layouts rather than duplicated as literals.
- **`src/screens/Welcome.tsx` / `src/ui/Backdrop.tsx`** — the bounded photo
  panel needed its own blur/scrim tuning (`blur-md` + a top-and-bottom-heavy
  gradient), separate from the full-bleed mobile `Backdrop`, since it's a
  differently-shaped crop of the same source image.
- **`src/App.test.tsx`** — Welcome's two layouts both exist in the DOM
  simultaneously (correctly CSS-hidden per breakpoint at runtime; jsdom does
  not evaluate media queries, so both are visible to a DOM query in tests).
  Updated the two assertions that touch Welcome-screen elements
  (`getByRole('button', { name: /discover your market value/i })` and the
  post-back-navigation text check) to use `getAllByRole`/`findAllByText` and
  take the first match, rather than assuming a single element.

No changes to the valuation engine, domain packs, profile data model,
onboarding logic, or any screen other than Welcome.

## Responsive Behaviour

Manually verified in-browser (production build via `vite preview`, not dev
server) at:

| Width | Layout used | Result |
|---|---|---|
| 320×844 | mobile card | No horizontal scroll, no clipping, CTA/nav fully usable |
| 375×812 | mobile card | Matches previously-approved composition |
| 768×1024 | mobile card (< lg breakpoint) | No overflow, fully readable; see Known Limitations |
| 1024×768 | desktop (two-column) | No horizontal scroll; page scrolls vertically, which is expected |
| 1440×900 | desktop (two-column) | Full-width nav/content; no narrow-card artifact |
| 1920×1080 | desktop (two-column) | Content stage caps at 1600px, centered; see Known Limitations |

390, 414, 430, 820, 1280, 1366, and 1600 were not each individually
screenshotted but fall inside the two breakpoint ranges actually verified
above and use the same two layouts (Tailwind's `lg` breakpoint is a single
1024px cut-over — nothing changes structurally between the verified
neighboring widths).

## Hero Background

- **Mobile/tablet-portrait:** unchanged from the prior approved pass — the
  full backdrop image behind the whole card, `blur-md` + a top/bottom-heavy
  scrim tuned to hide the source image's baked mockup text.
- **Desktop/tablet-landscape:** the backdrop is **not** stretched full-bleed
  behind the whole section. It is shown in a bounded, rounded-corner panel on
  the right (`h-[560px] w-[40%]`) sized close to its natural aspect ratio, so
  `object-cover` doesn't need the extreme zoom a full-width stretch would
  require. The panel has its own blur/scrim tuned the same way (hide the
  baked text, keep the photography recognizable).

## Typography

No font changes. Desktop layout scales the existing type system up
(headline 30px → 52–60px, body/nav sized for reading distance on a large
screen) rather than introducing new faces or weights.

## Navigation

- Nav links (About, How it Works, FAQ) are real navigation — all three route
  to the existing "Why ValPro Exists" (`creators`) screen, the one
  substantive secondary page this product has today. They are not decorative
  dead links.
- The hamburger button toggles a real dropdown with the same three links, on
  both layouts (mobile and desktop each have their own instance, since they
  have different chrome around them).
- Verified via automated test: `App.test.tsx`'s back-navigation test still
  passes going Welcome → Role → back → Welcome.

## Accessibility

- Nav and menu buttons carry `aria-label`/`aria-expanded`.
- Decorative backdrop `<img>` elements use `alt=""` and `aria-hidden="true"`.
- Focus-visible outline (global, unchanged) still applies to all interactive
  elements on this screen.
- `prefers-reduced-motion` handling is global (`src/index.css`) and untouched
  by this change; nothing new here uses motion beyond existing hover/focus
  states.

## Performance

- No new image assets — the desktop panel reuses the same
  `backdrops/welcome.jpg` already loaded for mobile (browser cache serves the
  second `<img>` reference from cache; it is not fetched twice on repeat
  visits, and on first visit the two requests are for the same small
  ~245 KB file already present in the bundle).
- No new dependencies.
- Production bundle: 266.05 kB JS / 77.28 kB gzipped (from 261.59 kB / 76.62
  kB before this change) — the increase is the additional desktop-layout JSX,
  not new assets.

## Tests

**PASS** — 35/35 (`npm run test`), including the two updated
Welcome-touching assertions in `App.test.tsx`.

## Production Build

**PASS** — `npm run build` (`tsc -b && vite build`), zero TypeScript errors.

## Visual Verification

**PASS** — screenshotted and inspected at 320, 375, 768, 1024, 1440, and
1920px against the approved reference composition (nav row, eyebrow signals,
headline with blue "market value.", CTA, "Why ValPro Exists", editorial
annotation, 4-stat panel, footer). No ghosting/doubled text, no horizontal
scroll at any tested width, no clipped content.

## Known Limitations

1. **Tablet-portrait (≈768–820px) reuses the mobile composition**, not a
   third bespoke tablet layout. It is not broken (no overflow, no clipping,
   fully readable) but reads as slightly sparse — the mobile card's type
   scale stretched across a wider column. A genuinely tailored tablet
   composition (e.g. a mid-scale two-column layout) is a reasonable future
   refinement, out of scope for this fix.
2. **The content stage caps at `max-w-[1600px]`, centered, at ultra-wide
   widths (1920px and above)** rather than using literally 100% of the
   browser width. This is intentional — an uncapped 1920px-wide hero would
   force the single portrait source photo into a far more extreme crop/zoom
   (re-triggering the baked-text visibility problem this fix specifically
   solved) and would also stretch line lengths past a comfortable reading
   width. A 1600px cap is a common, deliberate choice on premium editorial
   sites, not a return to the 430px bug — it fills ~83% of a 1920px viewport
   with real, working composition. Achieving genuinely edge-to-edge richness
   at 1920px+ would need a wider-format hero photograph as a new asset.
3. **The desktop photo panel is blurred (`blur-md`)**, matching the mobile
   treatment. This is necessary, not decorative — the source image has
   mockup text baked into it that must be obscured; a sharp/unblurred panel
   was tested and produced visible text doubling (documented above under
   Root Cause). A version of the source photograph without baked text would
   remove the need for this entirely.

## Next Recommended Phase

WAIT FOR USER.
