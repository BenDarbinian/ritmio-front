import { useEffect, useState } from 'react'
import LoginForm from './components/loginForm/LoginForm'
import Dashboard from './components/dashboard/Dashboard.tsx'
import {getMe} from "./api/users/users.ts";
import {logout} from "./api/sessions/sessions.ts";
import type {AuthStatus} from "./types/auth.ts";
import type {MeResponse} from "./types/users.ts";

function App() {
    const [status, setStatus] = useState<AuthStatus>('checking')
    const [me, setMe] = useState<MeResponse | null>(null)

    useEffect(() => {
        async function checkAuth() {
            const stored = localStorage.getItem('accessToken')

            if (!stored) {
                setStatus('guest')
                return
            }

            try {
                const meData: MeResponse = await getMe(stored)
                setMe(meData)
                setStatus('auth')
            } catch {
                localStorage.removeItem('accessToken')
                setMe(null)
                setStatus('guest')
            }
        }

        void checkAuth()
    }, [])

    function handleLoginSuccess(accessToken: string, meData: MeResponse) {
        localStorage.setItem('accessToken', accessToken)
        setMe(meData)
        setStatus('auth')
    }

    async function handleLogout() {
        const accessToken = localStorage.getItem('accessToken')

        if (accessToken) {
            try {
                await logout(accessToken)
            } catch {
                // Fallback to local logout even if session revoke failed.
            }
        }

        localStorage.removeItem('accessToken')
        setMe(null)
        setStatus('guest')
    }

    if (status === 'checking') return
    if (status === 'guest') return <LoginForm onLoginSuccess={handleLoginSuccess} />

    return <Dashboard me={me} onLogout={handleLogout} />
}

export default App
