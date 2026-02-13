import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './components/App.jsx'

const TeamSelector = lazy(() => import('./components/TeamSelector.jsx'))
const DashboardWrapper = lazy(() => import('./components/DashboardWrapper.jsx'))
const AllFixtures = lazy(() => import('./components/AllFixtures.jsx'))
const VenuePage = lazy(() => import('./components/VenuePage.jsx'))
const SquadPage = lazy(() => import('./components/SquadPage.jsx'))
const HowItWorks = lazy(() => import('./components/HowItWorks.jsx'))
const Bracket = lazy(() => import('./components/Bracket.jsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Suspense><TeamSelector /></Suspense> },
      { path: 'team/:teamId', element: <Suspense><DashboardWrapper /></Suspense> },
      { path: 'fixtures', element: <Suspense><AllFixtures /></Suspense> },
      { path: 'venue/:venueId', element: <Suspense><VenuePage /></Suspense> },
      { path: 'team/:teamId/squad', element: <Suspense><SquadPage /></Suspense> },
      { path: 'bracket', element: <Suspense><Bracket /></Suspense> },
      { path: 'how-it-works', element: <Suspense><HowItWorks /></Suspense> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
