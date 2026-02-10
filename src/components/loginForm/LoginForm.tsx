import './LoginForm.css'
import { type SyntheticEvent, useState } from 'react'
import { LogIn } from 'lucide-react'
import { login } from '../../api/sessions/sessions'
import { getMe } from '../../api/users/users.ts'
import type { AuthResponse } from '../../types/auth.ts'
import type { MeResponse } from '../../types/users.ts'

type LoginFormProps = {
  onLoginSuccess: (authData: AuthResponse, meData: MeResponse) => void
}

function LoginForm({ onLoginSuccess }: LoginFormProps) {
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
      const data = await login(email, password)
      const meData = await getMe(data.accessToken)

      onLoginSuccess(data, meData)
    } catch (err) {
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
          <h1>Login</h1>
          <p>Enter your account email and password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
              required
            />
          </label>

          <button className="login-submit" type="submit" disabled={loading}>
            <LogIn size={15} />
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        {error && <p className="login-state error">{error}</p>}
        {success && <p className="login-state success">{success}</p>}
      </div>
    </div>
  )
}

export default LoginForm
