import { AppProvider, useApp } from './state/AppContext'
import { Welcome } from './screens/Welcome'
import { CreatorStory } from './screens/CreatorStory'
import { YourRole } from './screens/YourRole'
import { DomainSelection } from './screens/DomainSelection'
import { Education } from './screens/Education'
import { Experience } from './screens/Experience'
import { Skills } from './screens/Skills'
import { Certifications } from './screens/Certifications'
import { Achievements } from './screens/Achievements'
import { Location } from './screens/Location'
import { Analysis } from './screens/Analysis'
import { ResultOverview } from './screens/ResultOverview'
import { WhyThisValue } from './screens/WhyThisValue'
import { ImprovementAreas } from './screens/ImprovementAreas'
import { WhatIfSimulator } from './screens/WhatIfSimulator'
import { ShareResult } from './screens/ShareResult'
import type { ReactElement } from 'react'
import type { ScreenId } from './navigation/flow'

const SCREEN_COMPONENTS: Record<ScreenId, () => ReactElement | null> = {
  welcome: Welcome,
  creators: CreatorStory,
  role: YourRole,
  domain: DomainSelection,
  education: Education,
  experience: Experience,
  skills: Skills,
  certifications: Certifications,
  achievements: Achievements,
  location: Location,
  analysis: Analysis,
  result: ResultOverview,
  why: WhyThisValue,
  gaps: ImprovementAreas,
  whatif: WhatIfSimulator,
  share: ShareResult,
}

function CurrentScreen() {
  const { screen } = useApp()
  const Screen = SCREEN_COMPONENTS[screen]
  return <Screen />
}

/**
 * Every screen renders inside one phone-shaped canvas — edge-to-edge on a
 * real phone, centered as a device frame on wider viewports — EXCEPT Welcome,
 * which is the landing/marketing surface and gets a real wide desktop layout
 * (see Welcome.tsx's own lg: breakpoint). The 15-screen assessment flow stays
 * a deliberate mobile product at every width; the landing page doesn't need
 * to pretend to be a phone once there's room not to.
 */
function App() {
  const { screen } = useApp()

  if (screen === 'welcome') {
    return <Welcome />
  }

  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-[#0b0b0a] sm:items-center sm:py-8">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[var(--color-bg,#0e1116)] sm:h-[860px] sm:rounded-[28px] sm:border sm:border-black/40 sm:shadow-2xl">
        <CurrentScreen />
      </div>
    </div>
  )
}

function AppWithProvider() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}

export default AppWithProvider
