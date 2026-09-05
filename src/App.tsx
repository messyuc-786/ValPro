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
 * The whole app renders inside one phone-shaped canvas. On a real phone it is
 * edge-to-edge; on wider viewports it centers as a device frame rather than
 * stretching a mobile layout across the desktop (per the responsive spec).
 */
function App() {
  return (
    <AppProvider>
      <div className="flex min-h-[100dvh] w-full justify-center bg-[#0b0b0a] sm:items-center sm:py-8">
        <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[var(--color-bg,#0e1116)] sm:h-[860px] sm:rounded-[28px] sm:border sm:border-black/40 sm:shadow-2xl">
          <CurrentScreen />
        </div>
      </div>
    </AppProvider>
  )
}

export default App
