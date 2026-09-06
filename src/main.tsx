import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { seedIfNeeded } from './lib/seed'
import { AuthProvider } from './context/AuthContext'

// seed 失败不阻断使用（空状态可手动新增）
void seedIfNeeded().catch(() => {
  /* ignore */
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
