import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { createEmptyProfile } from '../types/profile'
import type { Profile } from '../types/profile'
import { profileReducer } from './profileReducer'
import type { ProfileAction } from './profileReducer'
import { loadProfile, saveProfile, clearPersistedState } from './persistence'
import { nextScreen } from '../navigation/flow'
import type { ScreenId } from '../navigation/flow'
import { evaluateProfile } from '../engine/valuationEngine'
import type { ValuationResult } from '../types/valuation'

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
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, dispatch] = useReducer(profileReducer, undefined, () => loadProfile() ?? createEmptyProfile())
  // The screen itself is never persisted — every visit opens at Welcome (see persistence.ts).
  const [screen, setScreen] = useState<ScreenId>('welcome')
  const [history, setHistory] = useState<ScreenId[]>(['welcome'])

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

  // Persist on every profile change (best-effort; see persistence.ts).
  // useEffect, not useMemo — this is a side effect, and useMemo carries no
  // guarantee a memoized callback runs on every commit in future React
  // versions (it happened to work here, but that was luck, not a contract).
  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const result = useMemo<ValuationResult | null>(() => {
    if (!profile.domain) return null
    return evaluateProfile(profile)
  }, [profile])

  const value = useMemo<AppContextValue>(
    () => ({ profile, dispatch: dispatchAndPersist, screen, history, goTo, goNext, goBack, result, restart }),
    [profile, dispatchAndPersist, screen, history, goTo, goNext, goBack, result, restart],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
