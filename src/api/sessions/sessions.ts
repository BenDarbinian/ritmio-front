import type { AuthResponse } from '../../types/auth.ts'
import { requestTokenRefresh } from '../authFetch'
import { apiFetch, withJsonHeaders } from '../http'

const EMAIL_NOT_VERIFIED_ERROR_CODE = 'EMAIL_NOT_VERIFIED'

export class LoginError extends Error {
  code: 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'UNKNOWN'
  status: number

  constructor(message: string, status: number, code: LoginError['code']) {
    super(message)
    this.name = 'LoginError'
    this.status = status
    this.code = code
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch('/sessions', withJsonHeaders({
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }))

  if (!response.ok) {
    if (response.status === 401) {
      throw new LoginError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS')
    }

    if (response.status === 403) {
      let errorCode = ''

      try {
        const data = (await response.json()) as { code?: string; message?: string }
        errorCode = data.code ?? ''
      } catch {
        // ignore parse errors, fallback to generic handling below
      }

      if (errorCode === EMAIL_NOT_VERIFIED_ERROR_CODE) {
        throw new LoginError('Требуется подтверждение email', 403, 'EMAIL_NOT_VERIFIED')
      }

      throw new LoginError('Доступ запрещён', 403, 'UNKNOWN')
    }

    throw new LoginError('Не удалось выполнить вход', response.status, 'UNKNOWN')
  }

  return response.json() as Promise<AuthResponse>
}

export async function logout(accessToken: string): Promise<void> {
  const response = await apiFetch('/sessions', withJsonHeaders({
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }))

  if (!response.ok && response.status !== 401) {
    throw new Error('Не удалось завершить сессию')
  }
}

export async function refreshSession(accessToken: string): Promise<AuthResponse> {
  const refreshed = await requestTokenRefresh(accessToken)
  if (!refreshed) {
    throw new Error('Не удалось обновить сессию')
  }

  return refreshed
}
