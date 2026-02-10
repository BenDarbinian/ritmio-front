import type { AuthResponse } from '../types/auth.ts'

export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_AFTER_KEY = 'refreshAfter'
export const EXPIRES_AT_KEY = 'expiresAt'

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredRefreshAfter(): string | null {
  return localStorage.getItem(REFRESH_AFTER_KEY)
}

export function persistAuthSession(authData: AuthResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken)
  localStorage.setItem(REFRESH_AFTER_KEY, authData.refreshAfter)
  localStorage.setItem(EXPIRES_AT_KEY, authData.expiresAt)
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_AFTER_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}
