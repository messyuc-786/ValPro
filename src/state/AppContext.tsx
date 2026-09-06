import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createEmptyProfile } from '../types/profile'
import type { Profile } from '../types/profile'
import { profileReducer } from './profileReducer'
import type { ProfileAction } from './profileReducer'
import { loadProfile, saveProfile, clearPersistedState } from './persistence'
import { nextScreen } from '../navigation/flow'
import type { ScreenId } from '../navigation/flow'
import { evaluateProfile } from '../engine/valuationEngine'
import type { ValuationResult } from '../types/valuation'
import { getCurrentSession, isSupabaseConfigured, onAuthStateChange, signOut } from '../auth/authService'
import { migrateLocalProfileToCloud } from '../services/profileRepository'

interface AppContextValue {
  profile: Profile
  dispatch: (action: ProfileAction) => void
  screen: ScreenId
  history: ScreenId[]
  goTo: (screen: ScreenId) => void
  goNext: () => void
  goBack: () => void
  result: ValuationResult | null
  restart: () => void

  /** Auth: null session = signed out (also the permanent state when no
   * Supabase project is configured — see isSupabaseConfigured). The rest of
   * the app works fully in that state; nothing requires being signed in. */
  session: Session | null
  authLoading: boolean
  signOutUser: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, dispatch] = useReducer(profileReducer, undefined, () => loadProfile() ?? createEmptyProfile())
  // The screen itself is never persisted — every visit opens at Welcome (see persistence.ts).
  const [screen, setScreen] = useState<ScreenId>('welcome')
  const [history, setHistory] = useState<ScreenId[]>(['welcome'])
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const migratedForUserId = useRef<string | null>(null)

  const dispatchAndPersist = useCallback((action: ProfileAction) => {
    dispatch(action)
  }, [])

  const goTo = useCallback((target: ScreenId) => {
    setScreen(target)
    setHistory((h) => [...h, target])
  }, [])

  const goNext = useCallback(() => {
    setScreen((current) => {
      const target = nextScreen(current)
      setHistory((h) => [...h, target])
      return target
    })
  }, [])

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h
      const trimmed = h.slice(0, -1)
      const target = trimmed[trimmed.length - 1]
      setScreen(target)
      return trimmed
    })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: 'RESET' })
    clearPersistedState()
    setScreen('welcome')
    setHistory(['welcome'])
  }, [])

  const signOutUser = useCallback(async () => {
    await signOut()
    // No manual setSession(null) here — onAuthStateChange (below) is the
    // single source of truth for session state and will fire regardless of
    // which code path triggered the sign-out.
  }, [])

  // Persist on every profile change (best-effort; see persistence.ts).
  // useEffect, not useMemo — this is a side effect, and useMemo carries no
  // guarantee a memoized callback runs on every commit in future React
  // versions (it happened to work here, but that was luck, not a contract).
  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  // Restores the session on load (page refresh, new tab) and stays in sync
  // with sign-in/sign-out from anywhere (this tab or another). A no-op,
  // instantly-resolved subscription when no Supabase project is configured
  // — see authService.onAuthStateChange — so this never blocks or breaks
  // the app in today's actual (unconfigured) deployment.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false)
      return
    }
    let active = true
    getCurrentSession().then((result) => {
      if (!active) return
      if (result.ok) setSession(result.data.session)
      setAuthLoading(false)
    })
    const unsubscribe = onAuthStateChange((newSession) => {
      setSession(newSession)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  // Local-first → cloud transition (see profileRepository.ts): once per
  // signed-in user per page load, never overwriting cloud data that already
  // exists. Failure is silent to the user by design — sync is a bonus on
  // top of the local copy, which remains the source of truth either way.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId || migratedForUserId.current === userId) return
    migratedForUserId.current = userId
    migrateLocalProfileToCloud(userId, profile).catch(() => {})
    // profile intentionally omitted from deps — this should run once per
    // sign-in with whatever the local profile is *at that moment*, not
    // re-run every time the profile changes afterward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const result = useMemo<ValuationResult | null>(() => {
    if (!profile.domain) return null
    return evaluateProfile(profile)
  }, [profile])

  const value = useMemo<AppContextValue>(
    () => ({ profile, dispatch: dispatchAndPersist, screen, history, goTo, goNext, goBack, result, restart, session, authLoading, signOutUser }),
    [profile, dispatchAndPersist, screen, history, goTo, goNext, goBack, result, restart, session, authLoading, signOutUser],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
