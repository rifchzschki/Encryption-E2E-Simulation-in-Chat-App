import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import router from './router'
import { AuthProvider } from './context/AuthContext'
import GlobalNotification from './components/GlobalNotification'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GlobalNotification />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
