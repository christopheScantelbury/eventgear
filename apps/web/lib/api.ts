import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Tokens em memória (não em closure para permitir update externo)
let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _refreshing: Promise<string> | null = null;

export function setTokens(access: string, refresh: string) {
  _accessToken = access;
  _refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('eg_access', access);
    localStorage.setItem('eg_refresh', refresh);
    // Cookie lido pelo middleware (não httpOnly para poder ser escrito no cliente)
    document.cookie = `eg_access=${access}; path=/; max-age=900; SameSite=Strict`;
  }
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('eg_access');
    localStorage.removeItem('eg_refresh');
    document.cookie = 'eg_access=; path=/; max-age=0';
  }
}

export function loadTokensFromStorage() {
  if (typeof window === 'undefined') return;
  _accessToken = localStorage.getItem('eg_access');
  _refreshToken = localStorage.getItem('eg_refresh');
}

// Injeta Bearer em cada request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// Auto-refresh em 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry || !_refreshToken) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (!_refreshing) {
      _refreshing = axios
        .post(`${API_URL}/auth/refresh`, { refreshToken: _refreshToken })
        .then((r) => {
          const { accessToken, refreshToken } = r.data;
          setTokens(accessToken, refreshToken);
          return accessToken;
        })
        .catch((e) => {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(e);
        })
        .finally(() => {
          _refreshing = null;
        });
    }

    const newToken = await _refreshing;
    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  },
);

// --- Auth ---
export const authApi = {
  register: (data: { companyName: string; name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};

// --- Materials ---
export const materialsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get('/materials', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/materials/${id}`).then((r) => r.data),
  create: (data: object) => api.post('/materials', data).then((r) => r.data),
  update: (id: string, data: object) => api.patch(`/materials/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/materials/${id}`),
  addPhoto: (id: string, file: File, isPrimary = false) => {
    const form = new FormData();
    form.append('file', file);
    form.append('isPrimary', String(isPrimary));
    return api.post(`/materials/${id}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

// --- Events ---
export const eventsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get('/events', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/events/${id}`).then((r) => r.data),
  create: (data: object) => api.post('/events', data).then((r) => r.data),
  update: (id: string, data: object) => api.patch(`/events/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/events/${id}`),
  addMaterial: (eventId: string, data: { materialId: string; qtyAllocated: number }) =>
    api.post(`/events/${eventId}/materials`, data).then((r) => r.data),
  removeMaterial: (eventId: string, materialId: string) =>
    api.delete(`/events/${eventId}/materials/${materialId}`),
};

// --- Checklist ---
export const checklistApi = {
  generate: (eventId: string, type: 'DEPARTURE' | 'RETURN') =>
    api.post(`/events/${eventId}/checklist`, { type }).then((r) => r.data),
  getItems: (eventId: string, type?: string) =>
    api.get(`/events/${eventId}/checklist`, { params: { type } }).then((r) => r.data),
  scan: (data: { qrCode: string; eventId: string; type: 'DEPARTURE' | 'RETURN' }) =>
    api.post('/checklist/scan', data).then((r) => r.data),
};

// --- Reports ---
export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard').then((r) => r.data),
  eventReport: (eventId: string) => api.get(`/reports/events/${eventId}`).then((r) => r.data),
  materialUsage: (materialId: string) =>
    api.get(`/reports/materials/${materialId}/usage`).then((r) => r.data),
};
