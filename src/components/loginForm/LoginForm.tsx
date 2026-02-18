import './LoginForm.css'
import { type CSSProperties, type SyntheticEvent, useMemo, useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoginError, login } from '../../api/sessions/sessions'
import { registerUser } from '../../api/users/users.ts'
import Button from '../ui/Button'
import type { AuthResponse } from '../../types/auth.ts'

type LoginFormProps = {
  mode: 'login' | 'register'
  onLoginSuccess: (authData: AuthResponse) => Promise<void>
  onVerificationRequired: (email: string) => void
}

function LoginForm({ mode, onLoginSuccess, onVerificationRequired }: LoginFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const dailySeed = useMemo(() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekday = date.getDay()
    return `ritmio-${year}-${month}-${day}-w${weekday}-auth-pattern`
  }, [])
  const promoArtUrl = useMemo(
    () => `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(dailySeed)}`,
    [dailySeed],
  )
  const promoStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.32)), url("${promoArtUrl}")`,
      backgroundBlendMode: 'multiply, normal',
    }) as CSSProperties,
    [promoArtUrl],
  )

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
        })
        onVerificationRequired(email.trim())
        return
      }

      const data = await login(email.trim(), password)
      await onLoginSuccess(data)
    } catch (err) {
      if (err instanceof LoginError && err.code === 'EMAIL_NOT_VERIFIED') {
        onVerificationRequired(email.trim())
        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ошибка запроса')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__layout">
        <section className="auth__promo" aria-hidden="true" style={promoStyle}>
          <div className="auth__promo-content">
            <h2>Build your daily rhythm with Ritmio</h2>
            <p>
              Plan your day, track completion, and keep momentum with a calm,
              focused workspace.
            </p>
          </div>
        </section>

        <section className="auth__panel">
          <div className="auth__head">
            <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
            <p>
              {mode === 'login'
                ? 'Sign in to continue your workflow'
                : 'Create your account to start tracking tasks'}
            </p>
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth__label">
                Name
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={255}
                  required
                />
              </label>
            )}

            <label className="auth__label">
              Email
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth__label">
              Password
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <Button variant="softBlue" fullWidth type="submit" disabled={loading}>
              {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
              {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="auth__switch">
            {mode === 'login' ? (
              <>
                <span>No account?</span>
                <Link className="auth__switch-link" to="/register">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <span>Have an account?</span>
                <Link className="auth__switch-link" to="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {error && <p className="auth__state auth__state--error">{error}</p>}
          {success && <p className="auth__state auth__state--success">{success}</p>}
        </section>
      </div>
    </div>
  )
}

export default LoginForm
