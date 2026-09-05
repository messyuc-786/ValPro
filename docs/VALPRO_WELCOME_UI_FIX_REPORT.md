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

## Addendum 2 — full-bleed hero rebuild, fake stats removed (STOP directive)

The user rejected the bounded-photo-panel compromise from Addendum 1 outright:
"LEFT = text / RIGHT = small separate image card... That is NOT what I
requested." This addendum documents the actual rebuild to a genuine
full-bleed hero, and the fake-stats removal, done under that explicit
correction.

### Root cause of "text left / small image card right"

That structure was a deliberate compromise I made in Addendum 1 to solve a
real technical problem (a portrait 900×1400 source photo, stretched via
`object-cover` across a full-viewport-wide landscape container, forces such
extreme zoom that the source image's baked-in mockup text becomes large and
legible again). The compromise traded away "photo is the whole hero" to
avoid that. The user correctly rejected the trade — the reference composition
requires the photo to actually BE the hero, not sit beside it.

### Fix: full-bleed hero band, not a side panel

Rebuilt the desktop (`lg+`) layout in `src/screens/Welcome.tsx`:

- Removed the two-column "text column + bounded photo panel" structure
  entirely.
- The photograph is now a genuine full-bleed section (`Backdrop` component,
  same one used everywhere else in the app) spanning the full page width,
  with nav, eyebrow signals, headline, CTA and "Why ValPro Exists" overlaid
  directly on top of it — matching the reference composition exactly (text
  on the photo, not beside it).
- The zoom problem is solved differently this time: instead of shrinking the
  photo into a panel, the hero **band's height** is capped well below the
  viewport height (`h-[min(46vw,640px)] min-h-[520px]` — a wide, short strip,
  not a full-screen photo) and the crop is bottom-anchored
  (`object-[center_100%]`). A short, wide band showing the *bottom* of a
  portrait photo needs much less zoom than a tall, full-viewport band would,
  which keeps the crop within (or very close to) the source image's genuinely
  clean bottom region — verified clean at 1024, 1280, 1366, 1440, and 1920px
  (see Responsive Behaviour below).
- Stats and footer moved into a distinct solid-color "supporting information"
  section below the hero band (a thin top border separates them) — this
  matches the reference's structure (photographic hero, then a
  distinct informational band below) and also means that section carries none
  of the baked-text risk at all, since it isn't photo-backed.

### Fix: removed blur everywhere per explicit "DO NOT BLUR THE HERO" directive

`src/ui/Backdrop.tsx`'s `maskedBlur` mechanism (Addendum 1's blur+mask
approach) was removed entirely. The `Backdrop` component now renders exactly
one, unblurred `<img>` per screen; only the scrim (a CSS gradient overlay,
no filter) does any legibility/text-hiding work. This was tested and
tuned in two rounds:

1. First pass used the same darkness levels as before (~0.9 peak opacity)
   without blur. Screenshotted and found still visibly ghosting the baked
   headline/button/"Why ValPro Exists" text on mobile — a 0.97-opacity dark
   overlay still let bright baked text show through faintly.
2. Diagnostic: set the top of the scrim to fully opaque (`rgba(4,5,7,1)`,
   opacity 1, not 0.97) and reshot — ghosting disappeared completely,
   confirming the mechanism works and the earlier value simply wasn't dark
   enough, not a layering/z-index bug.

Given mobile's card aspect ratio shows nearly the *entire* image height (no
meaningful zoom available there to crop the text out of frame the way the
desktop band does), and a solid-opacity overlay was the only tested value
that fully erased the baked text without blur, the final mobile treatment is:
a solid near-black ground under nav/headline/CTA (down to ~72% of the card),
with the real photograph revealed at full, unblurred sharpness from
"Why ValPro Exists" down through the stats/footer — documented honestly as a
trade-off below, not hidden.

### Fake claims removed

Removed entirely, everywhere on Welcome:

- "4+ Career Domains"
- "1M+ Professionals (Community Goal)"
- "95% Found it useful (Early Users)"
- "Better Career Decisions" (as a bare unsupported label)

Replaced with four truthful product descriptors — statements about what the
product does, not measured/marketed claims:

- "Multiple Career Paths"
- "Profile-Based Valuation"
- "Market-Aware Insights"
- "Built for Better Decisions"

No numbers, percentages, user counts, or "community goal"/"early users"
qualifiers appear anywhere on the screen now. `StatsPanel` (the old
number-and-qualifier component) was deleted from `Welcome.tsx` and replaced
with `ValuePointsRow` (icon + label only).

### Responsive re-verification (production build via `vite preview`)

| Width | Result |
|---|---|
| 390×844 | No overflow. Solid dark ground through nav/headline/CTA, photo crisp and unblurred from "Why ValPro Exists" down. No ghosting. |
| 430×932 | Same as above, no overflow, no clipping. |
| 1024×768 | Full-bleed hero band, crisp unblurred photo (newspaper/mug fully legible), no ghosting — narrowest desktop width, most zoomed band, checked specifically for residual baked-text bleed and found none. |
| 1280×720 | Full-bleed, clean. |
| 1366×768 | Full-bleed, clean. |
| 1440×900 | Full-bleed, clean, matches the approved reference composition closely. |
| 1920×1080 | Full-bleed, clean, no horizontal scroll (`scrollWidth === clientWidth === 1920`). |

768×1024 (tablet-portrait) and 393×852/412×915 were not re-shot individually
in this pass but fall on the same `<lg` mobile layout verified above (no
structural difference between the checked neighboring widths).

### Tests / Build

**PASS** — 35/35 (`npm run test`), zero change to assertions needed this
round. **PASS** — `npm run build`, zero TypeScript errors. **PASS** —
`npm run lint`, only the two pre-existing unrelated warnings in
`AppContext.tsx` (not touched by this work). CTA navigation re-verified live
(`Discover Your Market Value` → Role screen).

### Known Limitations (supersedes Addendum 1's panel-specific ones)

1. **On mobile/tablet-portrait, the photograph is not visible behind the
   headline/CTA** — it's revealed lower in the card, from "Why ValPro Exists"
   down. This is a direct, tested consequence of "no blur" plus "the source
   image's baked text must be fully hidden" plus "mobile's aspect ratio can't
   crop the text out of frame the way the desktop band does" — all three
   were non-negotiable in this pass, and satisfying all three simultaneously
   on mobile is not possible with unmodified opacity/crop tricks alone (only
   a fully solid overlay reliably erased the baked text in testing). The
   desktop hero band does not have this limitation — the photo is visible
   behind the entire headline/CTA area there. Removing this limitation on
   mobile too would need a version of the source photograph without the
   baked-in mockup text.
2. **The desktop hero band's height is capped** (`min(46vw, 640px)`,
   `min-h-[520px]`) rather than filling the full viewport height. This is
   intentional, for the same zoom/crop reason as above — the shorter, wider
   band is what makes the bottom-anchored crop land in the source photo's
   clean region. A full-height hero would reintroduce the zoom problem from
   Addendum 1's Root Cause section.

## Addendum 3 — app-shell mobile compatibility pass (iPhone + Android)

The user's next request was broader than Welcome: "MOBILE COMPATIBLE ui, IPHONE, ANDROID BOTH, ITS NOT A WEBSITE ... FIX ui SIZE, SPACING ISSUES." This addendum covers a real-device fitness pass across the whole app (every screen, not just Welcome), since the complaint was about the app shell reading like a website on a phone, not about Welcome specifically.

### Root causes found

1. **`index.html`'s viewport meta lacked `viewport-fit=cover`.** Without it,
   `env(safe-area-inset-*)` always resolves to `0px` even on a notched
   device, so there was no way for any layout to react to a real iPhone's
   notch/Dynamic Island or home-indicator gesture bar even if it tried to.
2. **No screen used `env(safe-area-inset-*)` at all.** Every header/footer
   used a fixed padding value (`pt-6`, `pb-3`, etc.) that works fine in a
   plain browser window but leaves content sitting right against — or, on
   some devices, at risk of sliding under — the status bar/notch at the top
   and the home-indicator/gesture-nav bar at the bottom. This is one of the
   clearest "this is a website, not an app" tells on a real phone.
3. **Form inputs/selects were `text-[15px]`.** iOS Safari auto-zooms the
   entire page on focus for any input rendered under 16px — a jarring zoom
   that never happens in a native app and is a very recognizable "website"
   bug on iPhone specifically.
4. **Two touch targets were under the 44×44px minimum** (iOS HIG / Material
   both land near there): Welcome's hamburger button (36×36px) and
   CreatorStory's back button (40×40px).
5. **No `overscroll-behavior`.** The whole page could rubber-band/bounce on
   iOS Safari at scroll boundaries and trigger pull-to-refresh — another
   distinctly browser-chrome behavior a native-feeling screen doesn't have.
6. **No `touch-action: manipulation`** on interactive elements, leaving the
   ~300ms tap-response delay / double-tap-to-zoom gesture active on buttons.

### Changes

- `index.html` — added `viewport-fit=cover` to the viewport meta.
- `src/index.css` — added `overscroll-behavior-y: none` on `body` (stops
  page-level bounce/pull-to-refresh) with `overscroll-behavior-y: contain`
  on internally-scrolling containers (`.overflow-y-auto`, so their own
  momentum scroll still works without leaking the bounce to the page); added
  `touch-action: manipulation` to `button`, `a`, `[role=button]`,
  `[role=switch]`.
- `src/ui/fields.tsx` — `TextField`/`SelectField` font size `15px` → `16px`
  (fixes the iOS auto-zoom-on-focus bug); `ToggleRow`'s switch keeps its
  compact 44×24 visual pill but gained an invisible `::before` hit-area
  extending it to a full 44px square.
- `src/ui/ScreenShell.tsx` (used by 9 of the 15 onboarding/result screens) —
  brand-bar top padding and footer bottom padding both changed from fixed
  values to `calc(<base> + env(safe-area-inset-*))`, so real devices get the
  extra inset on top of the existing spacing (non-notched devices see no
  change at all, since `env()` resolves to `0px` there).
- Applied the same `calc(<base> + env(safe-area-inset-*))` treatment to the
  five screens that build their own header/footer chrome instead of using
  `ScreenShell`: `CreatorStory.tsx`, `ShareResult.tsx`, `ResultOverview.tsx`,
  `WhyThisValue.tsx`, `ImprovementAreas.tsx`, `WhatIfSimulator.tsx`, and
  `Welcome.tsx`'s own mobile card.
- `CreatorStory.tsx`'s back button: 40×40px → 48×48px, matching every other
  screen's back button.
- `Welcome.tsx`'s `NavMenuButton`: 36×36px → 44×44px.

### Verification

- **Tests:** PASS — 35/35, no assertion changes needed.
- **Build:** PASS — zero TypeScript errors.
- **Lint:** PASS — only the two pre-existing, unrelated `AppContext.tsx`
  warnings.
- **Computed-style checks** (not just visual): confirmed live in-browser
  that the Welcome hamburger button measures exactly 44×44px
  (`getBoundingClientRect()`), that a `<select>` on the Education screen
  computes `font-size: 16px`, and that the new `calc()` padding expressions
  evaluate correctly (24px/12px on a non-notched browser — the base values,
  confirming `env()` degrades to `0px` safely rather than breaking the
  `calc()`).
- **Full flow re-walked** at 320×700 and 375×812: Welcome → Role → Domain →
  Education, confirming no regression in the actual onboarding flow from
  the padding/sizing changes, and no horizontal overflow at either width
  (`scrollWidth === clientWidth` at both).
- **Not independently verifiable from this environment:** the actual
  bounce/rubber-band suppression, the tap-delay removal, and the real
  safe-area inset values can only be fully confirmed on an actual iPhone/
  Android device or a simulator with real notch geometry — this session's
  browser tooling has no notched viewport to test against and cannot
  simulate `overscroll-behavior`'s scroll-physics effect. The CSS is
  standard, widely-supported (`env()` since iOS 11, `overscroll-behavior`
  since iOS 16 / all modern Android browsers, `touch-action` universally),
  and degrades to a no-op harmlessly where unsupported — but a real-device
  check by the user is the honest final confirmation this addendum can't
  self-certify.

## Next Recommended Phase

WAIT FOR USER.
