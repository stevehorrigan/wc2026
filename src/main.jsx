import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './components/App.jsx'
import TeamSelector from './components/TeamSelector.jsx'
import DashboardWrapper from './components/DashboardWrapper.jsx'
import AllFixtures from './components/AllFixtures.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <TeamSelector /> },
      { path: 'team/:teamId', element: <DashboardWrapper /> },
      { path: 'fixtures', element: <AllFixtures /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
