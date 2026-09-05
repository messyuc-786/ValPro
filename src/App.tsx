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
 * Every screen — Welcome included — renders inside one phone-shaped canvas:
 * edge-to-edge on a real phone, centered as a device frame on wider
 * viewports. Welcome briefly broke out into a full wide-desktop layout, but
 * that stretched its single portrait backdrop photo far past the content it
 * actually has, producing a vignetted dead zone on wide screens instead of
 * the rich, fully-visible photography the approved reference shows — so it
 * stays in the same card everything else uses, just with its own internal
 * nav row and side annotation sized to fit that card.
 */
function App() {
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
