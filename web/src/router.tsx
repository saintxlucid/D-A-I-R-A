import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RootLayout from './layouts/RootLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Reels from './pages/Reels'
import Explore from './pages/Explore'
import Profile from './pages/Profile'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />, 
  },
  {
    path: '/',
    element: <ProtectedRoute />, 
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'reels', element: <Reels /> },
          { path: 'explore', element: <Explore /> },
          { path: ':handle', element: <Profile /> },
        ],
      },
    ],
  },
])