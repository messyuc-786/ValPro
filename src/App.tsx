import { AppProvider, useApp } from './state/AppContext'
import { Welcome } from './screens/Welcome'
import { CreatorStory } from './screens/CreatorStory'
import { HowItWorks } from './screens/HowItWorks'
import { Faq } from './screens/Faq'
import { SignIn } from './screens/auth/SignIn'
import { SignUp } from './screens/auth/SignUp'
import { ForgotPassword } from './screens/auth/ForgotPassword'
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

/** Thin adapters wiring the standalone auth screens (which take plain
 * callback props, so they're usable/testable outside the app's navigation
 * too) into AppContext's goTo/goBack. */
function SignInScreen() {
  const { goTo, goBack } = useApp()
  return <SignIn onBack={goBack} onSignedIn={() => goTo('welcome')} onGoToSignUp={() => goTo('signUp')} onGoToForgotPassword={() => goTo('forgotPassword')} />
}
function SignUpScreen() {
  const { goTo, goBack } = useApp()
  return <SignUp onBack={goBack} onSignedUp={() => goTo('welcome')} onGoToSignIn={() => goTo('signIn')} />
}
function ForgotPasswordScreen() {
  const { goBack } = useApp()
  return <ForgotPassword onBack={goBack} />
}

const SCREEN_COMPONENTS: Record<ScreenId, () => ReactElement | null> = {
  welcome: Welcome,
  creators: CreatorStory,
  howItWorks: HowItWorks,
  faq: Faq,
  signIn: SignInScreen,
  signUp: SignUpScreen,
  forgotPassword: ForgotPasswordScreen,
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
 * The 15-screen assessment flow (Role → ... → Share) is a deliberate mobile
 * product and renders inside one phone-shaped canvas at every width — that
 * shell is correct there. Welcome is the landing/marketing surface, not part
 * of that product shell, and must use the full viewport on wide screens (see
 * Welcome.tsx's own md: layout) — wrapping it in the same max-w-[430px] card
 * was the actual bug behind the "narrow desktop site" complaint.
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
