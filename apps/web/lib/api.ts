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
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
    api.patch('/auth/profile', data).then((r) => r.data),
};

// --- Users (admin) ---
export const usersApi = {
  list: () => api.get('/users').then((r) => r.data),
  create: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/users', data).then((r) => r.data),
  update: (id: string, data: { name?: string; role?: string }) =>
    api.patch(`/users/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

// --- Customers (CRM) ---
export type CustomerType = 'PJ' | 'PF';
export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  _count?: { events: number };
}

export const customersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; tag?: string }) =>
    api.get('/customers', { params }).then((r) => r.data as { items: Customer[]; total: number; page: number; limit: number; totalPages: number }),
  get: (id: string) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data: Partial<Customer>) => api.post('/customers', data).then((r) => r.data as Customer),
  update: (id: string, data: Partial<Customer>) => api.patch(`/customers/${id}`, data).then((r) => r.data as Customer),
  remove: (id: string) => api.delete(`/customers/${id}`),
};

// --- Billing ---
export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  maxMaterials: number;       // -1 = ilimitado
  maxEventsPerMonth: number;
  maxUsers: number;
  maxBranches: number;
  hasReports: boolean;
  hasPdfExport: boolean;
  hasMultiBranch: boolean;
  priceMonthlyBrl: string;    // Decimal vem como string
}

export interface BillingStatus {
  company: { id: string; name: string; trialEndsAt: string | null };
  plan: Plan | null;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    cancelAt: string | null;
  } | null;
  usage: { materials: number; eventsThisMonth: number; users: number };
}

export const billingApi = {
  plans: () => api.get('/billing/plans').then((r) => r.data as Plan[]),
  status: () => api.get('/billing/status').then((r) => r.data as BillingStatus),
  usage: () => api.get('/billing/usage').then((r) => r.data as { materials: number; eventsThisMonth: number; users: number }),
  checkout: (planSlug: string) =>
    api.post('/billing/checkout', { planSlug }).then((r) => r.data as { url: string; sessionId: string }),
  portal: () => api.post('/billing/portal').then((r) => r.data as { url: string }),
};

// --- Calendar ---
export interface AvailabilityItem {
  materialId: string;
  name: string;
  category: string;
  totalQty: number;
  allocated: number;
  available: number;
  blocked: boolean;
  dailyRentPrice: string | null;
  conflicts: { eventId: string; eventName: string; qty: number }[];
}

export interface CalendarEvent {
  id: string;
  name: string;
  startDate: string;
  returnDate: string;
  location: string | null;
  status: string;
  client: string | null;
  customer: { id: string; name: string } | null;
  totalAmount: string | null;
  paid: boolean;
  _count: { materials: number };
}

export const calendarApi = {
  availability: (params: { startDate: string; endDate: string; excludeEventId?: string }) =>
    api.get('/calendar/availability', { params }).then((r) => r.data as AvailabilityItem[]),
  events: (params: { start: string; end: string }) =>
    api.get('/calendar/events', { params }).then((r) => r.data as CalendarEvent[]),
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
  // Rota correta: /checklist/generate (não /checklist sem sufixo)
  generate: (eventId: string, type: 'DEPARTURE' | 'RETURN') =>
    api.post(`/events/${eventId}/checklist/generate`, { type }).then((r) => r.data),
  // API retorna { items: [...], summary: {...} } — extraímos o array e filtramos por tipo
  getItems: (eventId: string, type?: string) =>
    api.get(`/events/${eventId}/checklist`).then((r) => {
      const data = r.data;
      const allItems: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      return type ? allItems.filter((i: any) => i.type === type) : allItems;
    }),
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
