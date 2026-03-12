import { License, LicenseStatus } from '../types';

export const LicenseService = {
  login: async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include', // Important: Send cookies for CORS/Proxy
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      // Clear local state helper if needed, but cookie handling is sufficient
      // Reloading page or redirecting usually handles the UI state reset
    } catch (e) {
      console.error(e);
    }
  },

  isAuthenticated: (): boolean => {
    // Basic check for UI logic. Real check happens on every API call via cookie.
    // For a cleaner approach, we might call /api/me on app load, but checking
    // a cookie existence in JS is tricky if it's HttpOnly. 
    // We'll rely on API failures to redirect to login, 
    // or set a non-HttpOnly flag cookie if strictly needed for UI.
    // For this prototype, we'll assume if we accessed the dashboard successfully, we are logged in.
    // However, to keep the existing Header logic simple without a global context provider:
    // The server is the source of truth, but for UI guarding:
    return localStorage.getItem('is_admin_ui') === 'true';
  },

  // Helper to sync UI state
  setAuthUIState: (isAuth: boolean) => {
    if (isAuth) localStorage.setItem('is_admin_ui', 'true');
    else localStorage.removeItem('is_admin_ui');
  },

  getAll: async (): Promise<License[]> => {
    const res = await fetch('/api/licenses', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = '/#/login';
      return [];
    }
    return await res.json();
  },

  getById: async (id: string): Promise<License | null> => {
    const res = await fetch(`/api/licenses/${id}`);
    if (!res.ok) return null;
    return await res.json();
  },

  uploadPhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  },

  create: async (data: Omit<License, 'id' | 'status' | 'createdAt'>): Promise<License> => {
    const res = await fetch('/api/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to create license');
    return await res.json();
  },

  updateStatus: async (id: string, status: LicenseStatus): Promise<void> => {
    const res = await fetch(`/api/licenses/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update status');
    }
  },

  update: async (id: string, data: Partial<License>): Promise<void> => {
    const res = await fetch(`/api/licenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update license');
    }
  }
};