export type AuthStatus = 'checking' | 'guest' | 'auth'

export type AuthResponse = {
    accessToken: string
    expiresAt: string
    refreshAfter: string
}