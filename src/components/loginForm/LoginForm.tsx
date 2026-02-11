import './LoginForm.css'
import { type SyntheticEvent, useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoginError, login } from '../../api/sessions/sessions'
import { getMe, registerUser } from '../../api/users/users.ts'
import type { AuthResponse } from '../../types/auth.ts'
import type { MeResponse } from '../../types/users.ts'

type LoginFormProps = {
  mode: 'login' | 'register'
  onLoginSuccess: (authData: AuthResponse, meData: MeResponse) => void
  onVerificationRequired: (email: string) => void
}

function LoginForm({ mode, onLoginSuccess, onVerificationRequired }: LoginFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

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
      const meData = await getMe(data.accessToken)

      onLoginSuccess(data, meData)
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
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-head">
          <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
          <p>
            {mode === 'login'
              ? 'Enter your account email and password'
              : 'Create an account. Verification email will be sent to you'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="login-label">
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

          <label className="login-label">
            Email
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
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

          <button className="login-submit" type="submit" disabled={loading}>
            {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-switch-row">
          {mode === 'login' ? (
            <>
              <span>No account?</span>
              <Link className="auth-switch-link" to="/register">
                Sign up
              </Link>
            </>
          ) : (
            <>
              <span>Have an account?</span>
              <Link className="auth-switch-link" to="/login">
                Sign in
              </Link>
            </>
          )}
        </div>

        {error && <p className="login-state error">{error}</p>}
        {success && <p className="login-state success">{success}</p>}
      </div>
    </div>
  )
}

export default LoginForm
