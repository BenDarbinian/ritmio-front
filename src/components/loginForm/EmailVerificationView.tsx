import { MailCheck, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { resendVerificationEmail } from '../../api/users/users.ts'
import Button from '../ui/Button'
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
    if (!email) {
      setError('Email не указан')
      return
    }

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
    <div className="auth">
      <div className="auth__card auth__card--verify">
        <div className="auth__verify-icon">
          <MailCheck size={20} />
        </div>
        <div className="auth__head">
          <h1>Verify your email</h1>
          <p>
            {email ? (
              <>
                We sent a verification email to <strong>{email}</strong>.
                Confirm it before login.
              </>
            ) : (
              'Email for verification is not specified.'
            )}
          </p>
        </div>

        <div className="auth__verify-actions">
          <Button
            variant="softBlue"
            fullWidth
            disabled={sending || !email}
            onClick={() => void handleResend()}
          >
            <RotateCw size={15} />
            {sending ? 'Sending...' : 'Resend email'}
          </Button>

          <Button className="auth__verify-back-btn" type="button" onClick={onBackToLogin}>
            Back to login
          </Button>
        </div>

        {error && <p className="auth__state auth__state--error">{error}</p>}
        {message && <p className="auth__state auth__state--success">{message}</p>}
      </div>
    </div>
  )
}

export default EmailVerificationView
