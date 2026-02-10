import { buildApiUrl } from '../config/api.ts'
import {
  clearAuthSession,
  getStoredAccessToken,
  persistAuthSession,
} from '../config/authSession.ts'
import type { AuthResponse } from '../types/auth.ts'

async function requestWithToken(path: string, init: RequestInit, accessToken: string): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
  })
}

async function refreshToken(currentToken: string): Promise<AuthResponse | null> {
  const response = await fetch(buildApiUrl('/sessions/new-token'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`,
    },
  })

  if (!response.ok) {
    clearAuthSession()
    window.dispatchEvent(new CustomEvent('auth:expired'))
    return null
  }

  const refreshed = (await response.json()) as AuthResponse
  persistAuthSession(refreshed)
  window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: refreshed }))
  return refreshed
}

export async function authFetch(path: string, init: RequestInit = {}, accessToken?: string): Promise<Response> {
  const initialToken = accessToken ?? getStoredAccessToken()
  if (!initialToken) {
    throw new Error('No access token')
  }

  const response = await requestWithToken(path, init, initialToken)
  if (response.status !== 401) {
    return response
  }

  const refreshed = await refreshToken(initialToken)
  if (!refreshed) {
    return response
  }

  return requestWithToken(path, init, refreshed.accessToken)
}
