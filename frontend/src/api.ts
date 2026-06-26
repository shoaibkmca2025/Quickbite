import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';

const TOKEN_KEY = 'qb_token';
const REFRESH_KEY = 'qb_refresh';

export const tokenStore = {
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  getRefresh: () => AsyncStorage.getItem(REFRESH_KEY),
  set: async (access: string, refresh?: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, access);
    if (refresh) await AsyncStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
  },
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; pages: number };
}

export class ApiError extends Error {
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
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Fail fast instead of spinning forever when the API is unreachable
  // (e.g. wrong EXPO_PUBLIC_API_URL or backend not running).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(
      0,
      aborted
        ? `Can't reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL points to your PC's LAN IP (currently ${API_URL}).`
        : `Network error reaching ${API_URL}. Same Wi-Fi as the server?`
    );
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) await tokenStore.clear();
    throw new ApiError(res.status, json.message ?? 'Request failed', json.details);
  }
  return json as ApiResponse<T>;
}

export const api = {
  get: <T>(path: string, opts?: { auth?: boolean }) => request<T>(path, { method: 'GET', ...opts }),
  post: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'POST', body, ...opts }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
