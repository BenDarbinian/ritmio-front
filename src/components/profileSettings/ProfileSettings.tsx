import { type FormEvent, useEffect, useState } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import {
  changeProfilePassword,
  updateProfileEmail,
  updateProfileName,
} from '../../api/users/users'
import type { MeResponse } from '../../types/users'
import Button from '../ui/Button'
import './ProfileSettings.css'

type ProfileSettingsProps = {
  me: MeResponse | null
  onProfileUpdated: () => Promise<void>
}

function ProfileSettings({ me, onProfileUpdated }: ProfileSettingsProps) {
  const [name, setName] = useState(me?.name ?? '')
  const [email, setEmail] = useState(me?.email ?? '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [savingName, setSavingName] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [nameState, setNameState] = useState<{ error: string; success: string }>({ error: '', success: '' })
  const [emailState, setEmailState] = useState<{ error: string; success: string }>({ error: '', success: '' })
  const [passwordState, setPasswordState] = useState<{ error: string; success: string }>({ error: '', success: '' })
  const avatarSeed = me?.email ?? 'no-email'
  const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(avatarSeed)}&size=32&radius=12`

  useEffect(() => {
    setName(me?.name ?? '')
    setEmail(me?.email ?? '')
  }, [me?.email, me?.name])

  async function handleNameSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setNameState({ error: '', success: '' })

    const nextName = name.trim()
    if (!nextName || nextName === (me?.name ?? '')) {
      return
    }

    setSavingName(true)
    try {
      await updateProfileName(nextName)
      await onProfileUpdated()
      setNameState({ error: '', success: 'Name updated' })
    } catch (error) {
      setNameState({
        error: error instanceof Error ? error.message : 'Could not update name',
        success: '',
      })
    } finally {
      setSavingName(false)
    }
  }

  async function handleEmailSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setEmailState({ error: '', success: '' })

    const nextEmail = email.trim()
    if (!nextEmail || nextEmail === (me?.email ?? '')) {
      return
    }

    setSavingEmail(true)
    try {
      await updateProfileEmail(nextEmail)
      await onProfileUpdated()
      setEmailState({ error: '', success: 'Email updated' })
    } catch (error) {
      setEmailState({
        error: error instanceof Error ? error.message : 'Could not update email',
        success: '',
      })
    } finally {
      setSavingEmail(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setPasswordState({ error: '', success: '' })

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordState({ error: 'Fill in all password fields', success: '' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordState({ error: 'New password must contain at least 6 characters', success: '' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordState({ error: 'New password and confirmation must match', success: '' })
      return
    }

    setSavingPassword(true)
    try {
      await changeProfilePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordState({ error: '', success: 'Password updated' })
    } catch (error) {
      setPasswordState({
        error: error instanceof Error ? error.message : 'Could not update password',
        success: '',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <section className="profile-settings">
      <div className="profile-settings__grid">
        <form className="profile-settings__card" onSubmit={(event) => void handleNameSubmit(event)}>
          <div className="profile-settings__title">
            <img className="profile-settings__avatar" src={avatarUrl} alt="User avatar" />
            <h3>Name</h3>
          </div>
          <label className="profile-settings__label">
            Display name
            <input
              type="text"
              minLength={2}
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <Button type="submit" variant="softBlue" disabled={savingName}>
            {savingName ? 'Saving...' : 'Save name'}
          </Button>
          {nameState.error && <p className="profile-settings__state profile-settings__state--error">{nameState.error}</p>}
          {nameState.success && <p className="profile-settings__state profile-settings__state--success">{nameState.success}</p>}
        </form>

        <form className="profile-settings__card" onSubmit={(event) => void handleEmailSubmit(event)}>
          <div className="profile-settings__title">
            <Mail size={16} />
            <h3>Email</h3>
          </div>
          <label className="profile-settings__label">
            Email address
            <input
              type="email"
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <Button type="submit" variant="softBlue" disabled={savingEmail}>
            {savingEmail ? 'Saving...' : 'Save email'}
          </Button>
          {emailState.error && <p className="profile-settings__state profile-settings__state--error">{emailState.error}</p>}
          {emailState.success && <p className="profile-settings__state profile-settings__state--success">{emailState.success}</p>}
        </form>

        <form className="profile-settings__card profile-settings__card--full" onSubmit={(event) => void handlePasswordSubmit(event)}>
          <div className="profile-settings__title">
            <KeyRound size={16} />
            <h3>Password</h3>
          </div>
          <div className="profile-settings__fields">
            <label className="profile-settings__label">
              Current password
              <input
                type="password"
                minLength={6}
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </label>
            <label className="profile-settings__label">
              New password
              <input
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label className="profile-settings__label">
              Confirm new password
              <input
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          </div>
          <Button type="submit" variant="softBlue" disabled={savingPassword}>
            {savingPassword ? 'Saving...' : 'Change password'}
          </Button>
          {passwordState.error && <p className="profile-settings__state profile-settings__state--error">{passwordState.error}</p>}
          {passwordState.success && <p className="profile-settings__state profile-settings__state--success">{passwordState.success}</p>}
        </form>
      </div>
    </section>
  )
}

export default ProfileSettings
