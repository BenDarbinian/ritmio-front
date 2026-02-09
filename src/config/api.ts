const defaultApiUrl = 'http://localhost:8080/api/v1';

export const API_URL = (import.meta.env.VITE_API_URL ?? defaultApiUrl).replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
}
