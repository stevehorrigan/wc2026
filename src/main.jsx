import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './components/App.jsx'
import TeamSelector from './components/TeamSelector.jsx'
import DashboardWrapper from './components/DashboardWrapper.jsx'
import AllFixtures from './components/AllFixtures.jsx'
import VenuePage from './components/VenuePage.jsx'
import SquadPage from './components/SquadPage.jsx'
import HowItWorks from './components/HowItWorks.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <TeamSelector /> },
      { path: 'team/:teamId', element: <DashboardWrapper /> },
      { path: 'fixtures', element: <AllFixtures /> },
      { path: 'venue/:venueId', element: <VenuePage /> },
      { path: 'team/:teamId/squad', element: <SquadPage /> },
      { path: 'how-it-works', element: <HowItWorks /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
