import { buildApiUrl } from '../config/api'

export function withJsonHeaders(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return {
    ...init,
    headers,
  }
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(buildApiUrl(path), init)
}
