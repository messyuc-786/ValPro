# ValPro — Build Report

Greenfield build from `ValPro_Claude_Master_Package`. No prior repository existed —
this document records what was actually done and verified, not what was intended.

## Implementation summary

- Scaffolded with `npm create vite@latest valpro -- --template react-ts`, then
  added Tailwind CSS v4 (`@tailwindcss/vite`), Vitest, and React Testing Library.
- Built a domain-agnostic **Universal Valuation Engine** (`src/engine/valuationEngine.ts`)
  driven by four **Domain Intelligence Packs** (`src/domains/{technology,banking,education,fresher}.ts`)
  registered in `src/domains/registry.ts`.
- Implemented all 15 screens from `03_VALPRO_SCREEN_SPEC.md` as real, connected
  React components sharing one design system (`src/ui/`) and one app-wide state
  container (`src/state/AppContext.tsx`) built on `useReducer` + `localStorage`.
- Two visual modes — warm-paper "onboarding" and near-black "analysis/result" —
  implemented as CSS custom-property sets (`.theme-light` / `.theme-dark` in
  `src/index.css`), switched per screen via `src/navigation/flow.ts`'s
  `isDarkScreen()`, matching the deliberate contrast in the reference image
  rather than following the OS light/dark preference.
- Every onboarding screen persists into one `Profile` object; the Analysis
  screen paces a deterministic checklist reveal (no fake network calls) and
  hands off to the Result screens, all of which read the same memoized
  `ValuationResult` computed by the engine.

## Architecture

```
Profile → Domain Intelligence Pack → Universal Valuation Engine → Explanation → Simulation
```

See `README.md` for the full directory layout and rationale. The key
architectural guarantee: **no screen and no part of the engine branches on
`domainId`** — every domain-specific number lives in that domain's pack file.
A test proves this directly (`domain intelligence — same inputs, different
domains diverge` in `src/engine/valuationEngine.test.ts`).

## Commands used

```bash
npm create vite@latest valpro -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vitest
npm install -D @tailwindcss/vite       # switched to Tailwind v4's Vite plugin
npm uninstall postcss autoprefixer     # unused once the Vite plugin path was chosen
npm run test                            # vitest run
npm run build                           # tsc -b && vite build
```

## Test results

```
npm run test
 Test Files  3 passed (3)
      Tests  28 passed (28)
```

- `src/engine/valuationEngine.test.ts` (15 tests) — role-level derivation,
  internal consistency of a result (range brackets the midpoint, score/percentile
  in bounds), determinism, experience/institute tier sensitivity, confidence
  banding, value-gap ranking, leadership-gap suppression once leadership is
  present, **fresher never valued at zero**, **Technology vs Education produce
  different numbers for the same inputs**, and What-If scenario deltas.
- `src/state/profileReducer.test.ts` (11 tests) — every reducer action
  (role, domain, education/experience merge, skill/certification/achievement
  add+remove, blank-name rejection, location, reset, hydrate).
- `src/App.test.tsx` (2 tests) — a real end-to-end walk through all 15 screens
  via `@testing-library/react` (Welcome → Role → Domain → Education →
  Experience → Skills → Certifications → Achievements → Location → Analysis →
  Result → Why → Gaps → What-If → Share, asserting on real rendered content
  at each step) plus a back-navigation check.

## Production build result

```
npm run build
✓ 49 modules transformed
dist/index.html                   1.07 kB │ gzip:  0.55 kB
dist/assets/index-*.css          20.44 kB │ gzip:  4.92 kB
dist/assets/index-*.js          253.40 kB │ gzip: 74.42 kB
✓ built in ~0.4–0.5s
```

`tsc -b` (project-wide, strict) reports zero errors.

## Visual QA

Ran the app with the real dev server through the Claude Code Browser tool
(`npm run --prefix valpro dev`, added as the `valpro` entry in the workspace's
`.claude/launch.json`) with the viewport set to 375×812 (mobile).

- **Screen 1 (Welcome)** was confirmed with an actual pixel screenshot:
  dark ground, serif "Know your / market value." headline with the gold
  accent word, "Why ValPro Exists →" link, filled CTA with arrow, and the
  4+/1M+/95% stat row — matching the reference composition.
- **Screens 2–15**: the Browser pane became hidden partway through this
  session (a client-side visibility state this build could not force back
  open), so the remainder of the walkthrough was driven and verified via
  `javascript_tool` + `get_page_text` against the live running app rather
  than further screenshots — every screen's rendered text, form labels,
  progress fraction ("1/8" … "8/8"), button copy, and computed numbers were
  read back and checked against `03_VALPRO_SCREEN_SPEC.md` and the reference
  image line by line (see the session transcript). This confirms real DOM
  content and real engine output, short of a second pixel-level pass.
- Verified a real profile end to end: Working Professional → Technology →
  IIT/CS/2019/8.7 CGPA → 3–5 yrs Software Engineer at TechSolutions →
  skill AWS 70% → certification AWS Solutions Architect (2024) → achievement
  "Reduced cloud infrastructure cost by 22%" (2024) → Delhi NCR → Bangalore
  target. The engine returned **₹21.5 LPA** (range ₹18.0L–₹25.6L), **Market
  Score 76/100**, **Top 24%**, **Confidence: High** — all internally
  consistent (range brackets the point estimate; higher completeness reached
  High confidence as designed).
- Positive/improvement signals, ranked value gaps, and all four What-If
  scenarios rendered with real computed deltas (not the example numbers from
  the spec, correctly — the spec explicitly says demo numbers should be
  replaced once the engine computes its own).
- Checked 320px and no-emulation ("desktop") widths: `scrollWidth` equals
  `clientWidth` in both — no horizontal scroll at either extreme.

## Known limitations

1. **What-If duplicate-credential stacking** — running "Get AWS Certification"
   as a scenario adds another certification entry even if the profile already
   holds that exact certification, so the modeled delta is a little optimistic
   in that specific case. Fix: `applyScenario` should no-op (or dedupe) when
   the target certification/skill is already present.
2. **No real browser E2E runner** — Playwright was not added (see README
   rationale); flow coverage instead comes from a Testing-Library-driven walk
   through the real `<App />`. This does not catch pure-CSS/layout regressions
   the way a screenshot-diffing Playwright suite would.
3. **Single local profile, no accounts** — profile and screen position persist
   to `localStorage` only; there is no multi-profile support, login, or
   cross-device sync.
4. **Share/Copy Link are local, not hosted** — "Copy Link" copies a text
   summary and "Download" saves a generated SVG share card; neither produces a
   real shareable URL, since there is no backend in this build.
5. **Demo benchmark tables** — every base value, multiplier, and known-skill /
   known-certification entry in `src/domains/*.ts` is a hand-authored
   placeholder for architecture purposes, not sourced compensation data.
6. **Visual QA coverage** — see the note above; screens 2–15 were verified
   through live DOM/text inspection rather than a second round of pixel
   screenshots, because the Browser pane went hidden mid-session.

## Future data / API integration points

- Each `DomainPack` in `src/domains/*.ts` is the single seam where real
  benchmark data (base values, role multipliers, location multipliers,
  known-skill demand, known-certification values) would replace the current
  demo tables — the engine and every screen are already written against the
  `DomainPack` interface, not against literals.
- `evaluateProfile()` in `src/engine/valuationEngine.ts` is a pure function of
  `(Profile, DomainPack)`; swapping in an async benchmark fetch would mean
  resolving the pack (or parts of it) from an API before calling it, with no
  change to the function's own logic.
- `src/state/persistence.ts` isolates all `localStorage` reads/writes behind
  four functions — swapping in a real backend/account system means replacing
  those four functions, not touching the reducer, the context, or any screen.
- The Share screen's `buildShareSvg`/`buildShareSummary` functions
  (`src/screens/ShareResult.tsx`) are the seam for a future hosted share-link
  service.

## Final report

- **Project structure**: see `README.md` → Architecture.
- **Main technologies**: React 19, TypeScript, Vite, Tailwind CSS v4, Vitest,
  React Testing Library.
- **Screens implemented**: all 15, listed in `README.md`.
- **Components created**: `Button`, `ScreenShell`, `OptionCard`, form field
  primitives (`TextField`/`SelectField`/`ToggleRow`), `SkillBar`,
  `RemovableRow`/`AddRowButton`, and the result-display set (`StatTile`,
  `StatRow`, `ConfidenceBadge`, `SignalRow`, `GapCard`, `ScenarioRow`), plus a
  hand-drawn icon set — all in `src/ui/`.
- **Valuation engine implemented**: yes — `src/engine/valuationEngine.ts`,
  4 domain packs, 15 unit tests.
- **Tests run**: `npm run test` — 28/28 passed across 3 files.
- **Production build result**: succeeded, zero TypeScript errors, ~74 kB
  gzipped JS.
- **Visual QA result**: Screen 1 pixel-confirmed; screens 2–15 content/behavior
  confirmed live against spec and reference (see above); no horizontal scroll
  at 320px–desktop widths.
- **ZIP location**: `ValPro_Source_Code.zip` at the repository root
  (`C:\Users\GXI\Desktop\Coding\valpro\ValPro_Source_Code.zip`), also delivered
  to the user directly.
- **Remaining limitations**: see Known Limitations above.

## Project independence

ValPro is a fully standalone project: its own folder, its own dependency tree,
its own `.claude/launch.json` for local dev, and no shared code, config, or
data with any other application. Nothing in this repository references or
depends on another project.
