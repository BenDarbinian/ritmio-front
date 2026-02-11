import { MailCheck, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { resendVerificationEmail } from '../../api/users/users.ts'
import './LoginForm.css'

type EmailVerificationViewProps = {
  email: string
  onBackToLogin: () => void
}

function EmailVerificationView({ email, onBackToLogin }: EmailVerificationViewProps) {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleResend() {
    setSending(true)
    setError('')
    setMessage('')

    try {
      await resendVerificationEmail(email)
      setMessage('Письмо отправлено повторно')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось отправить письмо')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card verify-card">
        <div className="verify-icon">
          <MailCheck size={20} />
        </div>
        <div className="login-head">
          <h1>Verify your email</h1>
          <p>
            We sent a verification email to <strong>{email}</strong>.
            Confirm it before login.
          </p>
        </div>

        <div className="verify-actions">
          <button className="login-submit" type="button" disabled={sending} onClick={() => void handleResend()}>
            <RotateCw size={15} />
            {sending ? 'Sending...' : 'Resend email'}
          </button>

          <button className="verify-back-btn" type="button" onClick={onBackToLogin}>
            Back to login
          </button>
        </div>

        {error && <p className="login-state error">{error}</p>}
        {message && <p className="login-state success">{message}</p>}
      </div>
    </div>
  )
}

export default EmailVerificationView
