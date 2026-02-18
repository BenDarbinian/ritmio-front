import './LoginForm.css'
import { type SyntheticEvent, useState } from 'react'
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
      <div className="auth__card">
        <div className="auth__head">
          <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
          <p>
            {mode === 'login'
              ? 'Enter your account email and password'
              : 'Create an account. Verification email will be sent to you'}
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
      </div>
    </div>
  )
}

export default LoginForm
