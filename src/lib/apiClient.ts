const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL =
  typeof rawApiBaseUrl === 'string'
    ? rawApiBaseUrl.trim().replace(/\/+$/, '')
    : '';

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}
