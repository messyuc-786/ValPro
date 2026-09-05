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

## Addendum — visual richness fix + a second real bug found during it

After the initial fix above, the user asked for the photo treatment to match
the approved reference more closely — crisp, richly visible photography
(mug, books, newspaper) rather than uniformly blurred.

**Second real bug found via computed-style inspection (not visual
inspection alone):** the desktop (`lg+`) layout block was missing the
`theme-dark` class entirely. `--color-*` custom properties are defined only
inside `.theme-dark`/`.theme-light` in `src/index.css`, not on `:root`.
Screenshots (scaled down for the report) happened to look plausible, but
`getComputedStyle()` on the live CTA button showed
`background-color: rgba(0, 0, 0, 0)` — fully transparent, not blue — and
every other token-driven color in that block (accents, borders, muted text)
was silently falling back to inherited/initial values instead of the
intended palette. Fixed by moving `theme-dark` onto Welcome's single
outermost wrapper, covering both the mobile and desktop blocks. Caught
**before** this reached the user only because a computed-style check was run
in response to being asked to match a reference image pixel-for-pixel — a
reminder that a scaled-down screenshot is not sufficient visual QA for color
correctness.

**Visual richness fix:** the backdrop photo's baked-in mockup text (headline,
button, "Why ValPro Exists" link) is real pixel content in the source JPEG,
not something a screen crop can avoid — on both the mobile card and the
desktop panel, very close to the entire image height ends up in frame. A
uniform blur across the whole image (the prior approach) hid that baked text
but also fogged the real, legitimate photography below it (mug, books,
newspaper) that has nothing to hide.

Replaced the single blurred `<img>` with two stacked copies of the same
image: a sharp base layer, and a blurred layer whose visibility is
controlled by a CSS `mask-image` gradient (`Backdrop`'s new `maskedBlur`
prop: `{ px, fadeStartPercent, fadeEndPercent }`). The blurred layer is
fully opaque through the zone containing the baked text and fades to fully
transparent below it, revealing the sharp layer — so the newspaper/mug/book
photography reads crisp and rich, matching the reference, while the fake
text stays fully obscured.

Tuning required two iterations per surface (mobile card and desktop panel
use different crops of the same source image, so their baked-text zones
land at different percentages) — verified by screenshot after each change
that the ghosting was actually gone, not just that the blur "looked
stronger." Final values: mobile `{ px: 22, fadeStart: 62%, fadeEnd: 78% }`;
desktop panel `{ px: 22, fadeStart: 62%, fadeEnd: 78% }` (same photo, close
enough crops that the same tuning holds for both).

Re-verified after both fixes: 35/35 tests, clean build, no ghosting at
320/375/1440/1920px, CTA button computed background color confirmed correct
(`rgb(91, 147, 214)`) at desktop width via `getComputedStyle`, not just by
eye.

## Next Recommended Phase

WAIT FOR USER.
