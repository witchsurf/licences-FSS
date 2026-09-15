export interface EntityConfig {
  isSetup: boolean;
  entityName: string | null;
  entityAcronym?: string | null;
  entityLogo?: string | null;
  entityAddress?: string | null;
  entityPhone?: string | null;
  entityEmail?: string | null;
}

export interface SetupPayload {
  entityName: string;
  entityAcronym?: string;
  entityLogo?: string;
  entityAddress?: string;
  entityPhone?: string;
  entityEmail?: string;
  adminPassword?: string;
}

export const SetupService = {
  getStatus: async (): Promise<EntityConfig> => {
    try {
      const res = await fetch('/api/setup/status');
      if (!res.ok) {
        return { isSetup: true, entityName: 'Licences Manager' };
      }
      return await res.json();
    } catch {
      return { isSetup: true, entityName: 'Licences Manager' };
    }
  },

  getActivationStatus: async (): Promise<{ activated: boolean; valid: boolean; reason?: string }> => {
    try {
      const res = await fetch('/api/activation/status');
      if (!res.ok) {
        return { activated: true, valid: true };
      }
      return await res.json();
    } catch {
      return { activated: true, valid: true };
    }
  },

  uploadLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch('/api/setup/logo', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Erreur lors du téléchargement du logo');
    }

    const data = await res.json();
    return data.url;
  },

  initialize: async (payload: SetupPayload): Promise<{ success: boolean }> => {
    const res = await fetch('/api/setup/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur lors de la configuration');
    }

    // Auto-activate license upon first setup
    try {
      await fetch('/api/activation/activate', { method: 'POST' });
    } catch (e) {
      console.warn('Activation call error:', e);
    }

    return await res.json();
  },
};
