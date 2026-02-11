import { CheckCircle2, CircleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmailToken } from '../../api/users/users.ts'
import './LoginForm.css'

function VerifyEmailTokenPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Проверяем ссылку подтверждения...')

  useEffect(() => {
    async function runVerification() {
      if (!token) {
        setStatus('error')
        setMessage('Отсутствует token в ссылке подтверждения')
        return
      }

      try {
        await verifyEmailToken(token)
        setStatus('success')
        setMessage('Email успешно подтвержден. Теперь вы можете войти.')
      } catch (err) {
        setStatus('error')
        if (err instanceof Error) {
          setMessage(err.message)
        } else {
          setMessage('Не удалось подтвердить email')
        }
      }
    }

    void runVerification()
  }, [token])

  return (
    <div className="login-wrap">
      <div className="login-card verify-card">
        <div className={`verify-icon ${status === 'error' ? 'is-error' : ''}`}>
          {status === 'error' ? <CircleAlert size={20} /> : <CheckCircle2 size={20} />}
        </div>

        <div className="login-head">
          <h1>Email verification</h1>
          <p>{message}</p>
        </div>

        <div className="verify-actions">
          {status === 'loading' ? (
            <button type="button" className="login-submit" disabled>
              Checking...
            </button>
          ) : (
            <Link to="/" className="verify-link-btn">
              Go to login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailTokenPage
