import './LoginForm.css'
import { type SyntheticEvent, useState } from 'react'
import { login } from '../../api/sessions/sessions'
import { getMe } from '../../api/users/users.ts'
import type { MeResponse } from '../../types/users.ts'

type LoginFormProps = {
  onLoginSuccess: (accessToken: string, meData: MeResponse) => void
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

      localStorage.setItem('accessToken', data.accessToken)
      onLoginSuccess(data.accessToken, meData)
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
    <div className="container">
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>
      <form className="inputs" onSubmit={handleSubmit}>
        <div className="input">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input">
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="submit-container">
          <button className="submit" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </div>
      </form>

      {error && <p className="state-msg error">{error}</p>}
      {success && <p className="state-msg success">{success}</p>}
    </div>
  )
}

export default LoginForm
