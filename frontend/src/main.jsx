import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c2137',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
          },
          success: {
            iconTheme: { primary: '#3b82f6', secondary: '#0a0f1e' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0f1e' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
