const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'qb_restaurant_token';
const REFRESH_KEY = 'qb_restaurant_refresh';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; pages: number };
}

class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  if (auth) {
    const token = tokenStore.get();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, { ...rest, headers: finalHeaders });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      tokenStore.clear();
    }
    throw new ApiError(res.status, body.message ?? 'Request failed', body.details);
  }
  return body as ApiResponse<T>;
}

export const api = {
  baseUrl: API_URL,
  get: <T>(path: string, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'GET', ...opts }),
  post: <T>(path: string, data?: unknown, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}), ...opts }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
