import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const statistikApi = {
  getAll: () => api.get('/statistik'),
  create: (data: any) => api.post('/statistik', data),
  update: (id: number, data: any) => api.put(`/statistik/${id}`, data),
  delete: (id: number) => api.delete(`/statistik/${id}`),
};

export const indikatorApi = {
  getAll: () => api.get('/indikator'),
  getBySlug: (slug: string) => api.get(`/indikator/${slug}`),
  create: (data: any) => api.post('/indikator', data),
  update: (id: number, data: any) => api.put(`/indikator/${id}`, data),
  delete: (id: number) => api.delete(`/indikator/${id}`),
  addData: (id: number, data: any) => api.post(`/indikator/${id}/data`, data),
};

export const jadwalApi = {
  getAll: () => api.get('/jadwal-rilis'),
  getUpcoming: () => api.get('/jadwal-rilis/upcoming'),
  create: (data: any) => api.post('/jadwal-rilis', data),
  update: (id: number, data: any) => api.put(`/jadwal-rilis/${id}`, data),
  delete: (id: number) => api.delete(`/jadwal-rilis/${id}`),
};

export const uploadApi = {
  preview: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/preview', form);
  },
  importCsv: (file: File, indikatorId: number, kolom?: string) => {
    const form = new FormData();
    form.append('file', file);
    const params = kolom ? `?kolom=${kolom}` : '';
    return api.post(`/upload/csv/${indikatorId}${params}`, form);
  },
};

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  profile: () => api.get('/auth/profile'),
};

export const infografisApi = {
  getAll: (all = false) => api.get(`/infografis${all ? '?all=true' : ''}`),
  create: (formData: FormData) => api.post('/infografis', formData),
  update: (id: number, data: any) => api.put(`/infografis/${id}`, data),
  delete: (id: number) => api.delete(`/infografis/${id}`),
};

export const pengaduanApi = {
  submit: (formData: FormData) => api.post('/pengaduan', formData),
  getAll: () => api.get('/pengaduan'),
  getOne: (id: number) => api.get(`/pengaduan/${id}`),
  update: (id: number, data: { status?: string; catatan?: string }) => api.put(`/pengaduan/${id}`, data),
  delete: (id: number) => api.delete(`/pengaduan/${id}`),
};

export const petaTematikApi = {
  getAll: () => api.get('/peta-tematik'),
  getOne: (id: number) => api.get(`/peta-tematik/${id}`),
  create: (data: { judul: string; deskripsi?: string; imageUrl?: string; geoJsonUrl?: string; indikatorId?: number }) =>
    api.post('/peta-tematik', data),
  update: (id: number, data: { judul?: string; deskripsi?: string; imageUrl?: string; geoJsonUrl?: string; indikatorId?: number }) =>
    api.put(`/peta-tematik/${id}`, data),
  delete: (id: number) => api.delete(`/peta-tematik/${id}`),
};

export const statsApi = {
  get: () => api.get('/stats'),
  recordVisit: () => api.post('/stats/kunjungan'),
};

export const dataPointApi = {
  updateKeterangan: (id: number, keterangan: string) =>
    api.patch(`/indikator/datapoint/${id}`, { keterangan }),
};
