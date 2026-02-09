import type {AuthResponse} from "../../types/auth.ts";
import {buildApiUrl} from "../../config/api.ts";

export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(buildApiUrl('/sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        throw new Error('Неверный email или пароль')
    }

    return response.json() as Promise<AuthResponse>
}

export async function logout(accessToken: string): Promise<void> {
    const response = await fetch(buildApiUrl('/sessions'), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok && response.status !== 401) {
        throw new Error('Не удалось завершить сессию')
    }
}
