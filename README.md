# ValPro — Know Your Market Value.

ValPro estimates a person's **professional market value today** — not just their
salary — across Technology, Banking & Finance, Education, and Fresher/Student
profiles. It walks a 15-screen mobile flow that collects a profile, runs it
through a domain-aware valuation engine, and explains the result instead of
handing back one unexplained number.

Created by **Bhasad.org**. Designed & Programmed by **Himanshu Sharma & Urvashi
Chandan**.

> **This is a demo valuation model.** Every number is computed deterministically
> from your inputs and a hand-authored domain intelligence pack — it is **not**
> live market data. See [Honesty & demo-data notes](#honesty--demo-data-notes).

## Tech stack

- **React 19 + TypeScript + Vite** — lightweight, fast, no server required.
- **Tailwind CSS v4** (via `@tailwindcss/vite`, CSS-first config — no `tailwind.config.js` needed) for styling.
- **React Context + `useReducer`** for app state — no Redux/Zustand; a 15-screen
  linear-ish wizard doesn't need one.
- **Vitest + React Testing Library** for unit and flow tests.
- No backend, no database, no external API calls. Progress is persisted to
  `localStorage` only (best-effort — a private window simply won't remember).

Playwright was considered but not added: the Vitest + Testing Library suite
already drives the real `<App />` through the full 15-screen flow in jsdom
(see `src/App.test.tsx`), and the Claude Code Browser tool was used for manual
cross-viewport visual QA during development (see `BUILD_REPORT.md`). Adding a
second, heavier browser-automation dependency for this scope didn't pay for
itself — if real E2E-in-CI becomes a requirement, Playwright is the natural
next addition and nothing here would need to change to support it.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # vitest, run once
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Architecture

```
Profile → Domain Intelligence Pack → Universal Valuation Engine → Explanation → Simulation
```

```
src/
  types/        Profile, DomainPack, and ValuationResult type definitions
  domains/      One file per domain pack (technology, banking, education, fresher)
                + a registry — adding a domain never touches the engine or screens
  engine/       The deterministic valuation engine (src/engine/valuationEngine.ts)
                and its unit tests
  state/        Profile reducer, persistence, and the app-wide React context
                (navigation + the memoized valuation result)
  navigation/   Screen order, "n/8" progress mapping, dark/light mode mapping
  ui/           Shared design-system primitives (Button, ScreenShell, form
                fields, option cards, list rows, result display components,
                a small hand-drawn icon set)
  screens/      One component per of the 15 screens
```

### Universal Valuation Engine + Domain Intelligence Packs

`evaluateProfile(profile)` in `src/engine/valuationEngine.ts` is the only place
the actual math lives. It is domain-agnostic — it reads weights, multipliers,
and known-skill/certification tables from whichever `DomainPack` matches the
profile's domain (`src/domains/*.ts`). Technology and Education, for example,
use different base values, different experience curves, and different signal
weights on purpose — see `04_VALPRO_BRAND_AND_UX.md` / the product
requirements for why a software engineer and a teacher should never be scored
on the same curve.

Adding a fifth domain (Healthcare, Marketing, Legal, ...) means: write one new
`DomainPack` object, register it in `src/domains/registry.ts`, done — no
screen or engine code changes.

### What-If simulation

Each domain pack ships a small catalog of realistic scenarios (`Get AWS
Certification`, `Move to Bangalore`, `Become Engineering Manager`, ...).
`applyScenario()` transforms a **copy** of the profile (never mutates the
real one) and the engine is simply re-run on it — the same function that
produced the headline number produces every "what if" delta, so the simulator
is never a separate, hand-tuned set of numbers.

### Explainability

Positive signals, "areas to improve," and ranked value gaps are all generated
by inspecting the actual profile against the domain pack (see
`positiveSignals()`, `improvementSignals()`, and `buildValueGaps()` in the
engine) — they are not static copy pretending to be personalized.

## Honesty & demo-data notes

- No live compensation, benchmark, or market-population data is used anywhere.
  All base values, multipliers, and known-skill/certification tables in
  `src/domains/*.ts` are hand-authored demo figures for architecture purposes.
- The engine is structured so those tables are the **only** place real
  benchmark data would need to be plugged in later — screens and the engine's
  control flow would not need to change.
- The app never claims a guaranteed salary, a verified population size, or a
  real percentile population — result copy consistently uses "estimated,"
  "modeled," and "indicative" language.
- "Share" and "Copy Link" produce a local text/image summary rather than a
  hosted URL, since there is no backend in this build to host one — see the
  in-app note on the Share screen.

## Known limitations

See `BUILD_REPORT.md` for the full list (What-If duplicate-credential
stacking, no real E2E browser runner, single anonymous/local profile, etc.)
and future integration points.
