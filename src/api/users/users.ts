import { authFetch } from '../authFetch'
import type { MeResponse } from '../../types/users.ts'
import { apiFetch, withJsonHeaders } from '../http'

type RegisterInput = {
  name: string
  email: string
  password: string
}

type ChangePasswordInput = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export async function registerUser({ name, email, password }: RegisterInput): Promise<void> {
  const response = await apiFetch('/users', withJsonHeaders({
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  }))

  if (!response.ok) {
    throw new Error('Не удалось зарегистрироваться')
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const response = await apiFetch('/users/resend-verification', withJsonHeaders({
    method: 'POST',
    body: JSON.stringify({ email }),
  }))

  if (!response.ok) {
    throw new Error('Не удалось отправить письмо повторно')
  }
}

export async function verifyEmailToken(token: string): Promise<void> {
  const query = new URLSearchParams({ token })

  const response = await apiFetch(`/users/verify-email?${query.toString()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Ссылка подтверждения недействительна или устарела')
  }
}

export async function getMe(): Promise<MeResponse> {
  const response = await authFetch(
    '/users/me',
    withJsonHeaders({
      method: 'GET',
    }),
  )

  if (!response.ok) {
    throw new Error('Не удалось получить профиль')
  }

  return response.json() as Promise<MeResponse>
}

export async function updateProfileName(name: string): Promise<void> {
  const response = await authFetch(
    '/users/me/name',
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  )

  if (!response.ok) {
    throw new Error('Could not update name')
  }
}

export async function updateProfileEmail(email: string): Promise<void> {
  const response = await authFetch(
    '/users/me/email',
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({ email }),
    }),
  )

  if (!response.ok) {
    throw new Error('Could not update email')
  }
}

export async function changeProfilePassword({
  oldPassword,
  newPassword,
  confirmPassword,
}: ChangePasswordInput): Promise<void> {
  const response = await authFetch(
    '/users/me/password',
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmPassword,
      }),
    }),
  )

  if (!response.ok) {
    throw new Error('Could not update password')
  }
}
