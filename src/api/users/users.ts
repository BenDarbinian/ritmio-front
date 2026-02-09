import type {MeResponse} from "../../types/users.ts";
import {buildApiUrl} from "../../config/api.ts";

export async function getMe(accessToken: string): Promise<MeResponse> {
    const response = await fetch(buildApiUrl('/users/me'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        throw new Error('Не удалось получить профиль')
    }

    return response.json() as Promise<MeResponse>
}
