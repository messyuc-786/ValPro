# ValPro — Current Baseline (Phase 0 Audit)

Audit date: 2026-09-06. Scope: read-only inspection — no functional or visual
changes were made in this phase.

## Verification run

| Check | Command | Result |
|---|---|---|
| Tests | `npm run test` | **PASS** — 35/35 |
| Build | `npm run build` | **PASS** — zero TS errors, 264.86 kB JS / 76.90 kB gzipped |
| Lint | `npm run lint` | **PASS** — 2 pre-existing warnings, both in `AppContext.tsx` (see Findings) |
| Git working tree | `git status` | Clean, nothing uncommitted |
| Deployment | GitHub Pages | Live at https://messyuc-786.github.io/ValPro/, in sync with `main` as of commit `51cbe32` |

## Stack

React 19 + TypeScript (~6.0) + Vite 8 + Tailwind CSS v4. Vitest + React
Testing Library for tests. `oxlint` for linting. **No backend, no router
library, no auth library, no database client of any kind** — every
dependency in `package.json` is either React itself, a build/test tool, or
`gh-pages` for deployment. Navigation is hand-rolled state (`AppContext`),
not a URL router — there are no routes, only an in-memory `screen` value and
a `history` stack for back-navigation.

## Architecture (confirmed by reading the actual code, not inferred)

```
Profile (src/types/profile.ts)
  → Domain Pack (src/domains/*.ts, registered in registry.ts)
    → Valuation Engine (src/engine/valuationEngine.ts) — pure, deterministic,
      no I/O, no randomness. Same profile + domain always produces the same
      result. Explicitly documented in its own header comment as a "DEMO
      deterministic model" that "does not read live compensation data."
      → ValuationResult (src/types/valuation.ts) → screens
```

The engine takes `(Profile, DomainPack) → ValuationResult`. It is genuinely
domain-agnostic for the core calculation (base value, experience curve, role
multiplier, institute tier, location, skills/certs/achievements bonuses all
come from the pack, not a switch on domain id) — with **one exception**:
`improvementSignals()` and `buildValueGaps()` both special-case
`pack.id === 'technology' || pack.id === 'fresher'` to suggest an AI/ML
skill gap. That's a small, contained domain-specific branch inside an
otherwise domain-agnostic engine, not a large one.

## Screens (16 total, all present and wired)

`Welcome` → `CreatorStory` (side excursion, "Why ValPro Exists") → 8-step
onboarding (`YourRole`, `DomainSelection`, `Education`, `Experience`,
`Skills`, `Certifications`, `Achievements`, `Location`) → `Analysis` (paced
reveal, not real async processing) → `ResultOverview` → `WhyThisValue` →
`ImprovementAreas` → `WhatIfSimulator` → `ShareResult`.

9 of these route through the shared `ScreenShell` component (brand bar +
progress + scrollable body + fixed footer). The other 7 (`Welcome`,
`CreatorStory`, `Analysis`, `ResultOverview`, `WhyThisValue`,
`ImprovementAreas`, `WhatIfSimulator`, `ShareResult` — 8, not 7, listing
correction) build their own header/footer chrome directly on `Backdrop`.

## Domain packs (4 present: Technology, Banking, Education, Fresher)

Each `DomainPack` (`src/types/domain.ts`) is a **fully numeric object** —
`baseValueLPA`, `perYearExperienceLPA`, `roleLevelMultipliers`, `weights`,
`instituteTierMultipliers`, `knownSkills` (name → demand weight),
`knownCertifications` (name → LPA value), `locationMultipliers`,
`benchmarkSpreadLPA`, `scenarioCatalog`. There is no "partial" or
"unconfigured" pack shape — the engine has no code path for a domain that
lacks these numbers; every field is required and used directly in
`computeMarketValueLPA()`.

**This matters directly for Phase 3.** All four existing packs are already
disclosed, in `BUILD_REPORT.md`, as "hand-authored demo data... clearly
documented as the seam for real data later" — not real market data. Adding
a domain today, with the architecture as it stands, means either (a)
authoring another hand-set of numbers in the same spirit (extends the
existing, disclosed demo-data pattern — consistent, not a new dishonesty,
but still not real data), or (b) changing the architecture so a domain can
exist in an explicit "not yet modeled" state and the engine/UI branch to an
honest "insufficient market evidence for this domain" result instead of a
number. Option (b) is real engineering work (optional benchmark fields,
an engine short-circuit, a new UI state) and needs a decision before I
build 26 new domains one way or the other — flagged for the user rather
than assumed.

## Onboarding UX — checked against the Phase 2 checklist

- **Back/Next/progress:** present on every onboarding screen via
  `ScreenShell` (back button, "N/8" progress, footer Next).
- **Optional fields not blocking progress:** Certifications and Achievements
  — confirmed by reading the code — **already never block Next**
  (`<Button onClick={goNext}>Next →</Button>`, no `disabled` tied to list
  length). A user can already proceed with zero of either. There's no
  explicit "None / NIL" button, but none is needed since nothing forces an
  entry — this already satisfies the underlying requirement ("do not force
  users to invent information").
- **Skills is the one exception:** `Skills.tsx` disables Next while
  `profile.skills.length === 0` — at least one skill is currently mandatory.
  The master prompt lists "Certifications and additional skills are NOT
  mandatory" — flagged as a decision point rather than silently changed,
  since skills carry real weight in the valuation (`pack.weights.skills`)
  and removing the requirement changes what a zero-skill result means.
- **Safe areas, touch targets, iOS zoom fix, scroll-bounce containment:**
  already fixed in the prior session (see
  `VALPRO_WELCOME_UI_FIX_REPORT.md`, Addendum 3) — confirmed still in place
  by reading `index.html`, `index.css`, and `ScreenShell.tsx`.
- **Refresh resilience:** `AppContext` reloads the saved profile from
  `localStorage` on mount (`loadProfile() ?? createEmptyProfile()`), but the
  current **screen** is never persisted — a refresh always returns to
  Welcome with the profile intact, not mid-flow. This was a deliberate fix
  in an earlier session (see `persistence.ts`), not an oversight.

## Findings (bugs/smells noticed, not yet fixed — Phase 0 is audit-only)

1. **`AppContext.tsx:68`** — `saveProfile(profile)` runs inside a `useMemo`
   whose callback returns nothing. `useMemo` is for computing/caching a
   value, not for a side effect; React does not guarantee a memoized
   callback runs on every commit in all future versions. It happens to work
   today (confirmed by the passing persistence tests), but the correct tool
   is `useEffect`. Low risk, one-line fix — the lint warning oxlint already
   flags on every run.
2. **Skills-mandatory vs. the master prompt's "not mandatory" instruction**
   — see above, needs a decision, not a silent change.
3. **Domain pack shape has no "unconfigured" state** — see above, needs a
   decision before Phase 3 domain expansion proceeds.

## What Phase 3–6 need that this session cannot supply unilaterally

- **Phase 4 (Supabase auth):** requires an actual Supabase project (URL +
  anon key at minimum). I cannot create a third-party cloud account or
  provision infrastructure on the user's behalf — this needs the user to
  either provide existing project credentials or confirm they want one
  created (which they'd need to do via the Supabase dashboard themselves,
  or explicitly authorize me to guide them through it interactively).
- **Phase 5/6 (real valuation methodology, real market data):** the
  absolute data-honesty rule in this very prompt forbids fabricating market
  salaries, benchmarks, or compensation data. I have no licensed access to
  real compensation datasets. This phase can only proceed as: (a) I build
  the provider/interface architecture Phase 6 itself describes (a clean
  seam + an honest "insufficient market evidence" fallback state), with the
  demo engine remaining clearly labeled as demo until real data is
  supplied, or (b) the user provides or licenses a real dataset for me to
  integrate.

## Recommendation

Phase 0 is complete. Phases 1 (Welcome/design lock) and most of Phase 2
(onboarding hardening) are already substantially satisfied by prior work in
this project — verified above, not re-implemented. The concrete next steps
worth taking now, in order of how independently actionable they are:

1. Fix the `useMemo` → `useEffect` bug (finding #1) — safe, no decision
   needed.
2. Decide the skills-mandatory question (finding #2).
3. Decide the domain-expansion approach (finding #3) before building 26 new
   domain packs one way or the other.
4. Supabase credentials (Phase 4) and a real-data sourcing decision (Phase
   5/6) are the two hard blockers on everything after Phase 3 — both need
   the user's input, not more code from me.
