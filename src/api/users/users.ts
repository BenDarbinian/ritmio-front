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
