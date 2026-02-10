import { authFetch } from '../authFetch'
import type { MeResponse } from '../../types/users.ts'

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
