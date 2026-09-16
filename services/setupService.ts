export interface InstitutionAffiliation {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface EntityConfig {
  isSetup: boolean;
  entityName: string | null;
  entityAcronym?: string | null;
  entityCountry?: string | null;
  entityFlag?: string | null;
  entityLogo?: string | null;
  entityAddress?: string | null;
  entityPhone?: string | null;
  entityEmail?: string | null;
  entityAffiliations?: string | null;
}

export interface SetupPayload {
  entityName: string;
  entityAcronym?: string;
  entityCountry?: string;
  entityFlag?: string;
  entityLogo?: string;
  entityAddress?: string;
  entityPhone?: string;
  entityEmail?: string;
  adminPassword?: string;
  entityAffiliations?: string;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/setup/logo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.warn('API upload logo failed, using client storage fallback:', e);
    }

    // Client-side fallback to base64 Data URL (ensures zero errors on Vercel / offline)
    return await fileToDataUrl(file);
  },

  uploadFlag: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('flag', file);

      const res = await fetch('/api/setup/flag', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.warn('API upload flag failed, using client storage fallback:', e);
    }

    return await fileToDataUrl(file);
  },

  uploadInstitutionLogo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/setup/institution-logo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.warn('API upload institution logo failed, using client storage fallback:', e);
    }

    return await fileToDataUrl(file);
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

  getFullConfig: async (): Promise<Record<string, string>> => {
    try {
      const res = await fetch('/api/setup/config', { credentials: 'include' });
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  },

  updateConfig: async (payload: Partial<SetupPayload>): Promise<boolean> => {
    const res = await fetch('/api/setup/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la mise à jour des paramètres');
    }
    return true;
  },

  downloadBackup: async (): Promise<void> => {
    const res = await fetch('/api/backup/download', { credentials: 'include' });
    if (!res.ok) throw new Error('Erreur lors du téléchargement de la sauvegarde');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licences-backup-${new Date().toISOString().slice(0, 10)}.db`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  restoreBackup: async (file: File): Promise<{ success: boolean; message?: string }> => {
    const formData = new FormData();
    formData.append('backup', file);

    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la restauration de la sauvegarde');
    }

    return await res.json();
  },
};
