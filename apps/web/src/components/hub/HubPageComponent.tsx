// components/hub/HubPageComponent.tsx — Dispatcher by visualTheme
import type { HubPage } from '@/types/strapi'
import HubTeachingLayout from './layouts/HubTeachingLayout'
import HubPracticeLayout from './layouts/HubPracticeLayout'
import HubStoryLayout from './layouts/HubStoryLayout'
import HubReferenceLayout from './layouts/HubReferenceLayout'

interface HubPageComponentProps {
  hubPage: HubPage
}

export default function HubPageComponent({ hubPage }: HubPageComponentProps) {
  // Default to 'teaching' if visualTheme not set
  const theme = hubPage.visualTheme || 'teaching'

  switch (theme) {
    case 'practice':
      return <HubPracticeLayout hubPage={hubPage} />
    case 'story':
      return <HubStoryLayout hubPage={hubPage} />
    case 'reference':
      return <HubReferenceLayout hubPage={hubPage} />
    case 'teaching':
    default:
      return <HubTeachingLayout hubPage={hubPage} />
  }
}
