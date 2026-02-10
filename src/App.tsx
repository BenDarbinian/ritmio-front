import { useEffect, useRef, useState } from 'react'
import { logout, refreshSession } from './api/sessions/sessions.ts'
import { getMe } from './api/users/users.ts'
import Dashboard from './components/dashboard/Dashboard.tsx'
import LoginForm from './components/loginForm/LoginForm'
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshAfter,
  persistAuthSession,
} from './config/authSession.ts'
import type { AuthResponse, AuthStatus } from './types/auth.ts'
import type { MeResponse } from './types/users.ts'

const MAX_TIMEOUT_MS = 2_147_000_000
const REFRESH_EARLY_MS = 5_000

function nowMs() {
  return Date.now()
}

function App() {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [me, setMe] = useState<MeResponse | null>(null)
  const refreshTimerRef = useRef<number | null>(null)
  const scheduleRefreshRef = useRef<(refreshAfterIso: string) => void>(() => {})

  function clearRefreshTimer() {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }

  function clearStoredSession() {
    clearAuthSession()
  }

  function persistSession(authData: AuthResponse) {
    persistAuthSession(authData)
  }

  async function doRefreshNow(): Promise<string | null> {
    const currentToken = getStoredAccessToken()
    if (!currentToken) {
      return null
    }

    try {
      const refreshed = await refreshSession(currentToken)
      persistSession(refreshed)
      scheduleRefresh(refreshed.refreshAfter)
      return refreshed.accessToken
    } catch {
      clearRefreshTimer()
      clearStoredSession()
      setMe(null)
      setStatus('guest')
      return null
    }
  }

  function scheduleRefresh(refreshAfterIso: string) {
    clearRefreshTimer()

    const refreshAt = Date.parse(refreshAfterIso)
    if (Number.isNaN(refreshAt)) {
      return
    }

    const delay = Math.max(0, refreshAt - nowMs() - REFRESH_EARLY_MS)

    if (delay > MAX_TIMEOUT_MS) {
      refreshTimerRef.current = window.setTimeout(() => {
        const storedRefreshAfter = getStoredRefreshAfter()
        if (storedRefreshAfter) {
          scheduleRefresh(storedRefreshAfter)
        }
      }, MAX_TIMEOUT_MS)
      return
    }

    refreshTimerRef.current = window.setTimeout(() => {
      void doRefreshNow()
    }, delay)
  }
  scheduleRefreshRef.current = scheduleRefresh

  // checkAuth intentionally runs once on mount.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    async function checkAuth() {
      const storedToken = getStoredAccessToken()
      if (!storedToken) {
        setStatus('guest')
        return
      }

      try {
        const refreshAfter = getStoredRefreshAfter()

        if (refreshAfter && nowMs() >= Date.parse(refreshAfter)) {
          const refreshedToken = await doRefreshNow()
          if (!refreshedToken) {
            return
          }
        } else if (refreshAfter) {
          scheduleRefresh(refreshAfter)
        }

        const meData: MeResponse = await getMe()
        setMe(meData)
        setStatus('auth')
      } catch {
        clearRefreshTimer()
        clearStoredSession()
        setMe(null)
        setStatus('guest')
      }
    }

    void checkAuth()
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    const handleRefreshed = (event: Event) => {
      const refreshed = (event as CustomEvent<AuthResponse>).detail
      if (!refreshed?.refreshAfter) {
        return
      }

      scheduleRefreshRef.current(refreshed.refreshAfter)
    }

    const handleExpired = () => {
      clearRefreshTimer()
      clearStoredSession()
      setMe(null)
      setStatus('guest')
    }

    window.addEventListener('auth:refreshed', handleRefreshed as EventListener)
    window.addEventListener('auth:expired', handleExpired)

    return () => {
      window.removeEventListener('auth:refreshed', handleRefreshed as EventListener)
      window.removeEventListener('auth:expired', handleExpired)
      clearRefreshTimer()
    }
  }, [])

  function handleLoginSuccess(authData: AuthResponse, meData: MeResponse) {
    persistSession(authData)
    scheduleRefresh(authData.refreshAfter)
    setMe(meData)
    setStatus('auth')
  }

  async function handleLogout() {
    const accessToken = getStoredAccessToken()

    if (accessToken) {
      try {
        await logout(accessToken)
      } catch {
        // Fallback to local logout even if session revoke failed.
      }
    }

    clearRefreshTimer()
    clearStoredSession()
    setMe(null)
    setStatus('guest')
  }

  if (status === 'checking') return null
  if (status === 'guest') return <LoginForm onLoginSuccess={handleLoginSuccess} />

  return <Dashboard me={me} onLogout={handleLogout} />
}

export default App
