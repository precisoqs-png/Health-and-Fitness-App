import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { VisionProvider } from './context/VisionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <VisionProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </VisionProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
