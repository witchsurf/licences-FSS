import { FederalOfficial } from '../types';

const request = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, { credentials: 'include', ...options });
  if (response.status === 401) window.location.href = '/#/login';
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Une erreur est survenue');
  }
  return response;
};

export const FederalOfficialService = {
  getAll: async (): Promise<FederalOfficial[]> => (await request('/api/federal-officials')).json(),
  getById: async (id: string): Promise<FederalOfficial> => (await request(`/api/federal-officials/${id}`)).json(),
  create: async (data: Omit<FederalOfficial, 'id' | 'createdAt'>): Promise<FederalOfficial> => (
    await request('/api/federal-officials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  ).json(),
  update: async (id: string, data: Partial<FederalOfficial>): Promise<void> => { await request(`/api/federal-officials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); },
  remove: async (id: string): Promise<void> => { await request(`/api/federal-officials/${id}`, { method: 'DELETE' }); },
};
