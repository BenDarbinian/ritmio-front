import { authFetch } from '../authFetch'
import type { MeResponse } from '../../types/users.ts'
import { buildApiUrl } from '../../config/api.ts'

type RegisterInput = {
  name: string
  email: string
  password: string
}

export async function registerUser({ name, email, password }: RegisterInput): Promise<void> {
  const response = await fetch(buildApiUrl('/users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось зарегистрироваться')
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const response = await fetch(buildApiUrl('/users/resend-verification'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error('Не удалось отправить письмо повторно')
  }
}

export async function verifyEmailToken(token: string): Promise<void> {
  const query = new URLSearchParams({ token })

  const response = await fetch(buildApiUrl(`/users/verify-email?${query.toString()}`), {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Ссылка подтверждения недействительна или устарела')
  }
}

export async function getMe(accessToken?: string): Promise<MeResponse> {
  const response = await authFetch(
    '/users/me',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    accessToken,
  )

  if (!response.ok) {
    throw new Error('Не удалось получить профиль')
  }

  return response.json() as Promise<MeResponse>
}
